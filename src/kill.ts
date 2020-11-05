import { blame } from './blame';
import { exec } from './utils';

export async function kill(port: number) {
	const pid = await blame(port);
	if (!pid) return false;

	await exec(`kill ${pid}`);
	return true;
}