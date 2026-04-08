import { command, subcommands, flag, boolean } from "cmd-ts";
import { getApiUrlOptions, getD2ApiFromArgs } from "scripts/common";
import { TerminalLogger } from "utils/TerminalLogger";
import { FormD2Repository } from "data/FormD2Repository";
import { UpdatePatientUniqueIdUseCase } from "domain/usecases/UpdatePatientUniqueIdUseCase";
import { PatientD2epository } from "data/PatientD2epository";

export function getCommand() {
    const updateUniqueIds = command({
        name: "Map patient Ids",
        description: "Map human readable patient Ids to all sub-forms",
        args: {
            ...getApiUrlOptions(),
            dryRun: flag({
                type: boolean,
                long: "dry-run",
                short: "d",
                description: "If set, the data will not be actually posted to the API",
            }),
        },
        handler: args => {
            const api = getD2ApiFromArgs(args);
            const formRepository = new FormD2Repository(api);
            const patientRepository = new PatientD2epository(api);

            const updatePatientUniqueId = new UpdatePatientUniqueIdUseCase(
                new TerminalLogger(),
                formRepository,
                patientRepository
            ).execute({ dryRun: args.dryRun });

            updatePatientUniqueId.run(
                () => {
                    console.error("Finished successfully");
                },
                error => {
                    console.error("Error encountered:", error);
                }
            );
        },
    });

    return subcommands({
        name: "patients",
        cmds: { updateUniqueIds: updateUniqueIds },
    });
}
