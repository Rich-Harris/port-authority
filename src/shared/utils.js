import * as child_process from 'child_process';

/** @param {string} cmd */
export function exec(cmd) {
	return new Promise((fulfil, reject) => {
		child_process.exec(cmd, (error, stdout, stderr) => {
			if (error) return reject(error);
			fulfil({ stdout, stderr });
		});
	});
}
