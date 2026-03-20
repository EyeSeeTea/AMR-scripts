import { Async } from "domain/entities/Async";
import { User } from "domain/entities/User";
import { UserRepository } from "domain/repositories/UserRepository";

import logger from "utils/log";

export class GetCurrentUserUseCase {
    constructor(private userRepository: UserRepository) {}

    async execute(): Async<User> {
        logger.debug("Fetching user information...");
        const currentUser = await this.userRepository.getCurrent();
        logger.info(`Current User: id=${currentUser.id}, name=${currentUser.name}`);
        return currentUser;
    }
}
