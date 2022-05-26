import { check } from './check.js';

/**
 * Wait until a port is available
 * @param {number} port
 * @param {{ timeout?: number }} options
 */
export function until(port, { timeout = 5000 } = {}) {
	return new Promise((fulfil, reject) => {
		const t = setTimeout(() => {
			reject(new Error(`timed out waiting for connection`));
		}, timeout);

		when_port_available(port, () => {
			clearTimeout(t);
			fulfil(undefined);
		});
	});
}

/**
 * @param {number} port
 * @param {() => void} cb
 */
function when_port_available(port, cb) {
	const doCheck = async () => {
		const isFree = await check(port);
		if (isFree) return cb();
		setTimeout(doCheck, 100);
	};

	doCheck();
}
