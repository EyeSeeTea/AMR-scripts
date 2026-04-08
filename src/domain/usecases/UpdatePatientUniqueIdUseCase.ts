import { FutureData } from "data/api-futures";
import { Logger } from "domain/logger/Logger";
import { FormRepository } from "../repositories/FormRepository";
import { PatientRepository } from "domain/repositories/PatientRepository";
import { Form } from "domain/entities/Form";
import {
    CaseReportUniqueRef,
    FormProgramPatientRef,
    UniquePatientIdUpdate,
} from "domain/entities/Patient";
import { Future } from "domain/entities/generic/Future";

interface Options {
    dryRun: boolean;
}

export class UpdatePatientUniqueIdUseCase {
    constructor(
        private logger: Logger,
        private formRepository: FormRepository,
        private patientRepository: PatientRepository
    ) {}

    execute(options: Options): FutureData<void> {
        this.logger.info("Updating patient unique IDs...");
        const forms$ = this.formRepository.getForms().map(forms => this.getValidForms(forms));
        const caseForms$ = this.formRepository
            .getCaseReportForms()
            .map(forms => this.getValidCaseForms(forms));

        return Future.join2(forms$, caseForms$)
            .flatMap(([forms, caseForms]) => {
                this.logger.info(
                    `Fetched ${forms.length} valid forms and ${caseForms.length} valid case report forms.`
                );
                const formProgramPatients$ = this.patientRepository
                    .getFormProgramPatients(forms)
                    .map(formProgramPatients => {
                        return formProgramPatients;
                    });
                const caseReportUniquePatients$ =
                    this.patientRepository.getCaseReportUniquePatients(caseForms);

                return Future.join2(formProgramPatients$, caseReportUniquePatients$);
            })
            .flatMap(([formProgramPatients, caseReportUniquePatients]) => {
                this.logger.info(
                    `Fetched ${formProgramPatients.length} form program patients and ${caseReportUniquePatients.length} case report unique patients.`
                );
                this.logger.debug(
                    `Form program patients: ${JSON.stringify(formProgramPatients, null, 2)}`
                );
                this.logger.debug(
                    `Case report unique patients: ${JSON.stringify(
                        caseReportUniquePatients,
                        null,
                        2
                    )}`
                );
                const updates = this.mapPatientsToUniqueIds(
                    formProgramPatients,
                    caseReportUniquePatients
                );

                if (updates.length === 0) {
                    this.logger.info("No updates to post. Exiting.");
                    return Future.success(undefined);
                }

                this.logger.info(
                    `Posting ${updates.length} unique patient ID updates. Dry run: ${options.dryRun}`
                );
                this.logger.debug(`${JSON.stringify(updates, null, 2)}`);

                return this.patientRepository
                    .saveUniquePatientIds(updates, options.dryRun)
                    .map(response => {
                        this.logger.info(
                            `Post status: ${response.status}. Stats: ${JSON.stringify(
                                response.stats
                            )}`
                        );
                    });
            });
    }

    private mapPatientsToUniqueIds(
        formProgramPatients: FormProgramPatientRef[],
        uniquePatients: CaseReportUniqueRef[]
    ): UniquePatientIdUpdate[] {
        return formProgramPatients
            .map(patient => {
                const matchingUniquePatient = uniquePatients.find(
                    uniquePatient => uniquePatient.teiId === patient.patientIdValue
                );

                const matchingUniquePatientValue =
                    matchingUniquePatient?.uniquePatientIdValue ?? "";
                const valueUpToDate = matchingUniquePatientValue === patient.uniquePatientIdValue;
                const value = valueUpToDate ? "" : matchingUniquePatientValue;

                if (!matchingUniquePatient) {
                    this.logger.warn(
                        `No matching unique patient found for TEI ID: ${patient.teiId} with PatID value: ${patient.patientIdValue}`
                    );
                } else {
                    if (valueUpToDate) {
                        this.logger.info(
                            `Unique patient ID: ${matchingUniquePatientValue} for TEI ID: ${patient.teiId} is already up to date. Skipping update.`
                        );
                    } else {
                        this.logger.info(
                            `Found matching unique patient for TEI ID: ${patient.teiId} with unique PatID value: ${matchingUniquePatientValue}`
                        );
                    }
                }

                return {
                    teiId: patient.teiId,
                    trackedEntityType: patient.trackedEntityType,
                    orgUnit: patient.orgUnit,
                    value: value,
                };
            })
            .filter(update => update.value !== "");
    }

    private getValidForms(forms: Form[]) {
        if (forms.length === 0) {
            throw new Error("No forms found.");
        }

        const incompatibleForms = forms.filter(
            form => !form.hasUniquePatientIdAttribute() || !form.hasPatientIdAttribute()
        );

        if (incompatibleForms.length > 0) {
            const warnings = incompatibleForms
                .map(
                    form =>
                        `Form program ID: "${form.formTypeId}", Unique PatID attribute: "${form.uniquePatientIdAttribute?.id}", PatID attribute: "${form.patientIdAttribute?.id}"`
                )
                .join("\n");
            this.logger.warn(`The following forms have missing attributes:\n${warnings}`);
        }

        const validForms = forms.filter(form => !incompatibleForms.includes(form));
        if (validForms.length === 0) {
            throw new Error("No valid forms found after filtering for required attributes.");
        }

        return validForms;
    }

    private getValidCaseForms(forms: Form[]) {
        if (forms.length === 0) {
            throw new Error("No case report forms found.");
        }

        const incompatibleForms = forms.filter(form => !form.hasUniquePatientIdAttribute());

        if (incompatibleForms.length > 0) {
            const warnings = incompatibleForms.map(f => f.formTypeId).join("\n");
            this.logger.warn(
                `The following case report forms are missing the unique patient id attribute:\n${warnings}`
            );
        }

        const validForms = forms.filter(form => !incompatibleForms.includes(form));
        if (validForms.length === 0) {
            throw new Error(
                "No valid case report forms found after filtering for required attributes."
            );
        }

        return validForms;
    }
}
