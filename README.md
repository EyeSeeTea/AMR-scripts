## Setup

The required node version is v22.22.0. Alternatively, you can run:

```console
shell:~$ nvm use
```

To build the script run:

```console
shell:~$ yarn install
shell:~$ yarn test
shell:~$ yarn build
```

## How to run

The entry point CLI is executed with `yarn start`. Pass `--help` to show commands and arguments to commands:

```console
shell:~$ yarn patients updateUniqueIds --url "https://dhis2.instance/dhis2/" --auth 'user:password'
```

To execute a test run use the `--dry-run` option:
```console
shell:~$ yarn patients updateUniqueIds --url "https://dhis2.instance/dhis2/" --auth 'user:password' --dry-run
```

Its recommended to save the execution log via tools like `tee`:
```console
shell:~$ yarn patients updateUniqueIds --url "https://dhis2.instance/dhis2/" --auth 'user:password' --dry-run 2>&1 | tee run.log
```

### Run options
  - `--url <str>`    - http[s]://HOST:PORT
  - `--auth <value>` - USERNAME:PASSWORD
  - `--dry-run, -d` - If set, the data will not be actually posted to the API
  - `--help, -h`    - show help


### logs
The default log level is `info`. Set the desired level using env variable `LOG_LEVEL`:

```console
shell:~$ LOG_LEVEL=debug yarn start users
```

Available levels: 'debug' | 'info' | 'warn' | 'error'

## Development

You can start a build on watch mode:

```console
shell:~$ yarn build --watch
```

Or use `ts-node` to compile and execute:

```console
shell:~$ npx ts-node src/index.ts [...]
```

To run tests on watch mode:

```console
shell:~$ yarn test --watch
```
