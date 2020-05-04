import { exec } from './utils';

export async function blame(port: number) {
	try {
		const { stdout } = await exec(`lsof -i :${port} -sTCP:LISTEN -Fp`);

		if (!stdout) return null;
		const pid = parseInt(stdout.slice(1), 10);
		if (isNaN(pid)) throw new Error(`Invalid stdout ${stdout}`);

		return pid;
	} catch (error) {
		return null;
	}
}