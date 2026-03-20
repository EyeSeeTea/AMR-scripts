import { User } from "domain/entities/User";
import { FutureData } from "domain/entities/generic/Future";
import { Logger } from "domain/logger/Logger";
import { UserRepository } from "domain/repositories/UserRepository";

export class GetCurrentUserUseCase {
    constructor(private logger: Logger, private userRepository: UserRepository) {}

    execute(): FutureData<User> {
        this.logger.debug("Fetching user information...");
        return this.userRepository.getCurrent().map(currentUser => {
            this.logger.info(`Current User: id=${currentUser.id}, name=${currentUser.name}`);
            return currentUser;
        });
    }
}
