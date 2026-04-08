import { D2Api } from "types/d2-api";
import { apiToFuture } from "./api-futures";
import { Future } from "domain/entities/generic/Future";
import { AMR_SURVEYS_PREVALENCE_TEA_UNIQUE_PATIENT_ID } from "./dhis2-constants";
import { PatientRepository } from "domain/repositories/PatientRepository";
import { Form } from "domain/entities/Form";
import { UniquePatientIdUpdate } from "domain/entities/Patient";
import { Id } from "domain/entities/Base";

export class PatientD2epository implements PatientRepository {
    constructor(private api: D2Api) {}

    getCaseReportUniquePatients(caseForms: Form[]) {
        const response$ = Future.parallel(
            caseForms.map(form => {
                return this.retrieveTrackedEntities(form.formTypeId);
            }),
            { concurrency: 2 }
        );

        return response$.map(response =>
            response.flatMap(data =>
                data.map(tei => {
                    const uniquePatientIdAttribute = tei.attributes.find(
                        attr => attr.attribute === AMR_SURVEYS_PREVALENCE_TEA_UNIQUE_PATIENT_ID
                    );

                    return {
                        teiId: tei.trackedEntity,
                        uniquePatientIdValue: uniquePatientIdAttribute?.value,
                    };
                })
            )
        );
    }

    getFormProgramPatients(forms: Form[]) {
        const eligibleForms = forms.filter(form => form.patientIdAttribute?.id);

        const response$ = Future.parallel(
            eligibleForms.map(form => {
                const patientIdAttributeId = form.patientIdAttribute?.id;

                return this.retrieveTrackedEntities(form.formTypeId).map(response =>
                    response.map(tei => {
                        const patientIdAttribute = tei.attributes.find(
                            attr => attr.attribute === patientIdAttributeId
                        );

                        const uniquePatientIdAttribute = tei.attributes.find(
                            attr => attr.attribute === AMR_SURVEYS_PREVALENCE_TEA_UNIQUE_PATIENT_ID
                        );

                        return {
                            teiId: tei.trackedEntity,
                            trackedEntityType: tei.trackedEntityType,
                            orgUnit: tei.orgUnit,
                            programId: form.formTypeId,
                            patientIdValue: patientIdAttribute?.value,
                            uniquePatientIdValue: uniquePatientIdAttribute?.value,
                        };
                    })
                );
            }),
            { concurrency: 5 }
        );

        return response$.map(chunks => chunks.flat());
    }

    private retrieveTrackedEntities(formId: string, page = 1): Future<Error, D2Tracker[]> {
        const pageSize = 2000;

        return apiToFuture(
            this.api.tracker.trackedEntities.get({
                program: formId,
                ouMode: "ALL" as const,
                fields: trackerFields,
                includeDeleted: false,
                pageSize: pageSize,
                page: page,
            })
        ).flatMap(data => {
            const currentPage: D2Tracker[] = data.instances;
            const isLastPage = currentPage.length < pageSize;

            if (isLastPage) {
                return Future.success(currentPage);
            }

            return this.retrieveTrackedEntities(formId, page + 1).map(nextPage => [
                ...currentPage,
                ...nextPage,
            ]);
        });
    }

    saveUniquePatientIds(updates: UniquePatientIdUpdate[], dryRun = false) {
        const update$ = this.api.tracker.post(
            {
                importStrategy: "UPDATE",
                importMode: dryRun ? "VALIDATE" : "COMMIT",
            },
            {
                trackedEntities: updates.map(update => ({
                    trackedEntity: update.teiId,
                    trackedEntityType: update.trackedEntityType,
                    orgUnit: update.orgUnit,
                    enrollments: [],
                    attributes: [
                        {
                            attribute: AMR_SURVEYS_PREVALENCE_TEA_UNIQUE_PATIENT_ID,
                            value: update.value,
                        },
                    ],
                })),
            }
        );

        return apiToFuture(update$).map(response => {
            return {
                status: response.status,
                stats: response.stats,
            };
        });
    }
}

const trackerFields = {
    trackedEntity: true,
    trackedEntityType: true,
    orgUnit: true,
    attributes: {
        attribute: true,
        value: true,
    },
} as const;

type D2Tracker = {
    trackedEntity: Id;
    trackedEntityType: Id;
    orgUnit: Id;
    attributes: D2TrackerAttribute[];
};

type D2TrackerAttribute = {
    attribute: Id;
    value: string;
};
