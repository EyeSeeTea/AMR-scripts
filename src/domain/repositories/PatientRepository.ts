import { FutureData } from "domain/entities/generic/Future";
import { Form } from "domain/entities/Form";
import {
    CaseReportUniqueRef,
    FormProgramPatientRef,
    UniquePatientIdUpdate,
} from "domain/entities/Patient";

export interface PatientRepository {
    getCaseReportUniquePatients(caseForms: Form[]): FutureData<CaseReportUniqueRef[]>;
    getFormProgramPatients(forms: Form[]): FutureData<FormProgramPatientRef[]>;
    saveUniquePatientIds(
        updates: UniquePatientIdUpdate[],
        dryRun?: boolean
    ): FutureData<PatientsSaveResponse>;
}

export type PatientsSaveResponse = {
    status: "OK" | "ERROR" | "WARNING";
    stats: {
        created: number;
        updated: number;
        deleted: number;
        ignored: number;
        total: number;
    };
};
