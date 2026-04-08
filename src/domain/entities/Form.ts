import { Id, Code } from "./Base";
import { Struct } from "./generic/Struct";

interface FormAttributes {
    formTypeId: Id;
    patientIdAttribute?: FormAttributeRef;
    uniquePatientIdAttribute?: FormAttributeRef;
}

export type FormAttributeRef = {
    id: Id;
    code: Code;
};

export class Form extends Struct<FormAttributes>() {
    hasUniquePatientIdAttribute(): boolean {
        return this.uniquePatientIdAttribute !== undefined;
    }

    hasPatientIdAttribute(): boolean {
        return this.patientIdAttribute !== undefined;
    }
}
