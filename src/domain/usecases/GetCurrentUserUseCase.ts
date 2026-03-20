import { Async } from "domain/entities/Async";
import { User } from "domain/entities/User";
import { UserRepository } from "domain/repositories/UserRepository";

export class GetCurrentUserUseCase {
    constructor(private userRepository: UserRepository) {}

    execute(): Async<User> {
        return this.userRepository.getCurrent();
    }
}
