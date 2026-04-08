import { FutureData } from "../entities/generic/Future";
import { Form } from "domain/entities/Form";

export interface FormRepository {
    getForms(): FutureData<Form[]>;
    getCaseReportForms(): FutureData<Form[]>;
}
