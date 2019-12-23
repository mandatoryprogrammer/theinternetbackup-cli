# theinternetbackup-cli
## An easy-CLI tool to help automate uploading domain lists to TheInternetBackup.com to gain points for your account!

Note that you must get an API key for your TheInternetBackup.com account via [https://theinternetbackup.com/#account](https://theinternetbackup.com/#account)

## Download Compiled Binaries

If you don't want to deal with installing Node and `npm` packages, you can instead use one of the following portable binaries:'

[`OS X`](https://raw.githubusercontent.com/mandatoryprogrammer/theinternetbackup-cli/master/bin/tib-cli-linux-x64)
[`Linux x64`](//raw.githubusercontent.com/mandatoryprogrammer/theinternetbackup-cli/master/bin/tib-cli-osx-x64)

## Installation

* You must first install Node (at least 8): https://nodejs.org/en/download/
* `cd` in the repo directory and run `npm install`. This will install all dependencies.
* You can now run the script `tib-cli.js` by running `node tib-cli.js`

**Important**: This does not currently parse zone files, only domain lists. Ensure you've already converted your zone files into proper domain lists (the punycoding will be done automatically for you).

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
