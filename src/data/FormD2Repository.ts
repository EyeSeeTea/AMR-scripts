import { D2Api, Id, MetadataPick } from "types/d2-api";
import { apiToFuture } from "data/api-futures";
import { FormRepository } from "domain/repositories/FormRepository";
import { Form, FormAttributeRef } from "domain/entities/Form";
import {
    FORM_PROGRAM_IDS,
    CASE_REPORT_FORMS_PROGRAM_IDS,
    PROGRAM_SPECIFIC_ATTRIBUTE_IDS,
    AMR_SURVEYS_PREVALENCE_TEA_UNIQUE_PATIENT_ID,
} from "./dhis2-constants";

export class FormD2Repository implements FormRepository {
    constructor(private api: D2Api) {}

    getForms() {
        const response$ = this.api.models.programs.get({
            filter: { id: { in: FORM_PROGRAM_IDS } },
            fields: programFields,
            paging: false,
        });

        return apiToFuture(response$).map(data =>
            data.objects.map(d2Program => this.buildForm(d2Program))
        );
    }

    getCaseReportForms() {
        const response$ = this.api.models.programs.get({
            filter: { id: { in: CASE_REPORT_FORMS_PROGRAM_IDS } },
            fields: programFields,
            paging: false,
        });

        return apiToFuture(response$).map(data =>
            data.objects.map(d2Program => this.buildForm(d2Program))
        );
    }

    private buildForm(d2Program: D2Program): Form {
        const patientId = PROGRAM_SPECIFIC_ATTRIBUTE_IDS[d2Program.id];

        return new Form({
            formTypeId: d2Program.id,
            uniquePatientIdAttribute: this.getProgramAttributeById(
                d2Program,
                AMR_SURVEYS_PREVALENCE_TEA_UNIQUE_PATIENT_ID
            ),
            patientIdAttribute: patientId
                ? this.getProgramAttributeById(d2Program, patientId)
                : undefined,
        });
    }

    private getProgramAttributeById(
        d2Program: D2Program,
        attributeId: Id
    ): FormAttributeRef | undefined {
        const attribute = d2Program.programTrackedEntityAttributes.find(
            attr => attr.trackedEntityAttribute.id === attributeId
        )?.trackedEntityAttribute;

        if (!attribute) {
            return undefined;
        }

        return {
            id: attribute.id,
            code: attribute.code,
        };
    }
}

const programFields = {
    id: true,
    programTrackedEntityAttributes: {
        trackedEntityAttribute: {
            id: true,
            code: true,
            name: true,
        },
    },
} as const;

type D2Program = MetadataPick<{ programs: { fields: typeof programFields } }>["programs"][number];
