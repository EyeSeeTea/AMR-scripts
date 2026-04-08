import path from "path";
import { run, subcommands } from "cmd-ts";

import * as patients from "./commands/patients";

export function runCli() {
    const cliSubcommands = subcommands({
        name: path.basename(__filename),
        cmds: {
            patients: patients.getCommand(),
        },
    });

    const args = process.argv.slice(2);
    run(cliSubcommands, args);
}
