import { Id } from "./Base";

export type CaseReportUniqueRef = {
    teiId: Id;
    uniquePatientIdValue?: string;
};

export type FormProgramPatientRef = {
    teiId: Id;
    trackedEntityType: Id;
    orgUnit: Id;
    programId: Id;
    patientIdValue?: Id;
    uniquePatientIdValue?: string;
};

export type UniquePatientIdUpdate = {
    teiId: Id;
    trackedEntityType: Id;
    orgUnit: Id;
    value: string;
};
