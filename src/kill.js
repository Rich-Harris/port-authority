import { blame } from './blame.js';
import { exec } from './utils.js';

/** @param {number} port */
export async function kill(port) {
	const pid = await blame(port);
	if (!pid) return false;

	await exec(`kill ${pid}`);
	return true;
}
