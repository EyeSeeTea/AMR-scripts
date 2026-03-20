import { command, subcommands } from "cmd-ts";
import { UserD2Repository } from "data/UserD2Repository";
import { getApiUrlOptions, getD2ApiFromArgs } from "scripts/common";
import { GetCurrentUserUseCase } from "domain/usecases/GetCurrentUserUseCase";
import { TerminalLogger } from "utils/TerminalLogger";

export function getCommand() {
    const currentUser = command({
        name: "Get current user",
        description: "Get current user information",
        args: {
            ...getApiUrlOptions(),
        },
        handler: args => {
            const api = getD2ApiFromArgs(args);
            const userRepository = new UserD2Repository(api);
            const getCurrentUser = new GetCurrentUserUseCase(
                new TerminalLogger(),
                userRepository
            ).execute();

            getCurrentUser.run(
                () => {
                    console.error("Finished successfully");
                },
                error => {
                    console.error(error);
                }
            );
        },
    });

    return subcommands({
        name: "users",
        cmds: { current: currentUser },
    });
}
