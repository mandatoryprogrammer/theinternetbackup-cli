const ArgumentParser = require('argparse').ArgumentParser;
const colors = require('colors');
const punycode = require('punycode');
const request = require('request-promise-native');
const VERSION = '1.0.0';
const fs = require('fs');
const API_BASE_URL = 'https://theinternetbackup.com/api/v1';
const API_ENV_KEY_NAME = 'TIB_API_KEY';
const BANNER = `  _____ _                               
 |_   _| |__   ___                      
   | | | '_ \\ / _ \\                     
   | | | | | |  __/                     
  _|_| |_| |_|\___|                 _   
 |_ _|_ __ | |_ ___ _ __ _ __   ___| |_ 
  | || '_ \\| __/ _ \\ '__| '_ \\ / _ \\ __|
  | || | | | ||  __/ |  | | | |  __/ |_ 
 |___|_| |_|\\__\\___|_|  |_| |_|\\___|\\__|
 | __ )  __ _  ___| | ___   _ _ __      
 |  _ \\ / _\` |/ __| |/ / | | | '_ \\     
 | |_) | (_| | (__|   <| |_| | |_) |    
 |____/ \\__,_|\\___|_|\\_\\\\__,_| .__/.com     
                             |_|   

TheInternetBackup.com Zone Submission CLI tool, version ${VERSION}
`

const parser = new ArgumentParser({
    version: '0.0.1',
    addHelp: true,
    description: 'Argparse example'
});
parser.addArgument(
    ['-k', '--api-key'], {
        help: `Your TheInternetBackup API key, can also be set via environment variable ${API_ENV_KEY_NAME}. The CLI arg takes precedence over the environment variable.`
    }
);
parser.addArgument(
    ['-f', '--file'], {
        help: 'The location of the domain list to upload.',
        required: true
    }
);
const args = parser.parseArgs();
const api_key = args.api_key ? args.api_key : process.env[API_ENV_KEY_NAME];
const REQUEST_OPTIONS = {
	resolveWithFullResponse: true,
	headers: {
		'X-API-Key': api_key,
		'X-Client-Version': VERSION
	}
};

if(!api_key) {
	console.error('No API key was specified via CLI or the environment variable. Run with -h for more information.');
	process.exit();
}

(async function() {
	console.log(colors.magenta(BANNER));
	const authentication_information = await get_authentication_information();
	if(!authentication_information.is_authenticated) {
		console.error(colors.red('✘ Failed to authenticate with the API key provided. Double check your API key exists and is not missing any character(s).'));
		process.exit();
	}
	console.log(colors.green('✓ Authenticated to TheInternetBackup API successfully.'));
	await upload_domain_list(args);
})();

async function upload_domain_list_chunk( input_domain_list_string ) {
	// Get signed URL
	const get_signed_url_response = await request({
		...REQUEST_OPTIONS,
		...{
			'uri': API_BASE_URL + '/upload/signed_url',
			'method': 'POST',
		}
	});
	const signed_url_data = JSON.parse(get_signed_url_response.body).result;
	const signed_url = signed_url_data.signed_url;
	const submission_id = signed_url_data.id;

	// Upload chunk data
	const gcloud_response = await request({
		...REQUEST_OPTIONS,
		...{
			'uri': signed_url,
			'method': 'PUT',
			'headers': {
				'Content-Type': 'text/plain'
			},
			'body': input_domain_list_string,
		}
	});

	// Now confirm the upload is finished
	const confirm_response = await request({
		...REQUEST_OPTIONS,
		...{
			'uri': API_BASE_URL + '/upload/confirm',
			'method': 'POST',
			'headers': {
				...REQUEST_OPTIONS.headers,
				...{
					'Content-Type': 'application/json'
				}
			},
			'body': JSON.stringify({
				'upload_id': submission_id
			})
		}
	});
	const confirm_response_data = JSON.parse( confirm_response.body );

	return confirm_response_data.success;
}

async function upload_domain_list(args) {
	var file_lines = fs.readFileSync(
		args.file,
		'utf8'
	).replace(/\r/g, "\n").replace(/\n\n/g, "\n").split("\n");
	file_lines = file_lines.map(file_line => punycode.toASCII(file_line.trim()));

	console.log('Dividing domain list into chunks of 750K domain each...');
    var domain_chunks = chunk(
        file_lines,
        (1000 * 750)
    );
    delete file_lines;

    console.log(`Uploading ${domain_chunks.length} chunks of domains to TheInternetBackup...`);

    while(domain_chunks.length > 0) {
    	const current_chunk = domain_chunks.pop();
    	console.log(`Uploading another chunk of domains to TheInternetBackup, ${(domain_chunks.length + 1)} remaining...`)
		await upload_domain_list_chunk(
			current_chunk.join("\n")
		);
    }

    console.log(colors.green('✓ Success! All domain names were uploaded.'));
}

async function get_authentication_information() {
	const response = await request({
		...REQUEST_OPTIONS,
		...{
			'uri': API_BASE_URL + '/me',
			'method': 'GET',
		}
	});
	return JSON.parse(response.body).result;
}

function chunk(arr, len) {
    var chunks = [],
        i = 0,
        n = arr.length;

    while (i < n) {
        chunks.push(arr.slice(i, i += len));
    }

    return chunks;
}