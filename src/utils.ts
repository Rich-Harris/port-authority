import * as child_process from 'child_process';

export function exec(cmd: string): Promise<{ stdout: string, stderr: string }> {
	return new Promise((fulfil, reject) => {
		child_process.exec(cmd, (error, stdout, stderr) => {
			if (error) return reject(error);
			fulfil({ stdout, stderr });
		});
	});
}