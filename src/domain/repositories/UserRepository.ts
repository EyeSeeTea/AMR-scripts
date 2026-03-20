import { Async } from "domain/entities/Async";
import { User } from "domain/entities/User";

export interface UserRepository {
    getCurrent(): Async<User>;
}
