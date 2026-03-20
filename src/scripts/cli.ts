import path from "path";
import { run, subcommands } from "cmd-ts";

import * as users from "./commands/users";

export function runCli() {
    const cliSubcommands = subcommands({
        name: path.basename(__filename),
        cmds: {
            users: users.getCommand(),
        },
    });

    const args = process.argv.slice(2);
    run(cliSubcommands, args);
}
