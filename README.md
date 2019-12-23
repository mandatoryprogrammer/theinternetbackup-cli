# theinternetbackup-cli
## An easy-CLI tool to upload domain lists to TheInternetBackup.com to gain points for your account!

Note that you must get an API key for your TheInteretBackup.com account via [https://theinternetbackup.com/#account](https://theinternetbackup.com/#account)

## Usage
```
$ node tib-cli.js --help
usage: tib-cli.js [-h] [-v] [-k API_KEY] -f FILE

Argparse example

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -k API_KEY, --api-key API_KEY
                        Your TheInternetBackup API key, can also be set via
                        environment variable TIB_API_KEY. The CLI arg takes
                        precedence over the environment variable.
  -f FILE, --file FILE  The location of the domain list to upload.
```
