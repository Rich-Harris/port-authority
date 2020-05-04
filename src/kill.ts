import { blame } from './blame';
import { exec } from 'child_process';

export async function kill(port: number) {
	const pid = await blame(port);
	if (!pid) return false;

	await exec(`kill ${pid}`);
	return true;
}