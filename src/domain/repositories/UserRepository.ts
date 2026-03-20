import { User } from "domain/entities/User";
import { FutureData } from "../entities/generic/Future";

export interface UserRepository {
    getCurrent(): FutureData<User>;
}
