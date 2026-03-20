import { command, subcommands } from "cmd-ts";
import { UserD2Repository } from "data/UserD2Repository";
import { getApiUrlOptions, getD2ApiFromArgs } from "scripts/common";
import { GetCurrentUserUseCase } from "domain/usecases/GetCurrentUserUseCase";

export function getCommand() {
    const currentUser = command({
        name: "Get current user",
        description: "Get current user information",
        args: {
            ...getApiUrlOptions(),
        },
        handler: async args => {
            const api = getD2ApiFromArgs(args);
            const userRepository = new UserD2Repository(api);
            new GetCurrentUserUseCase(userRepository).execute();
        },
    });

    return subcommands({
        name: "users",
        cmds: { current: currentUser },
    });
}
