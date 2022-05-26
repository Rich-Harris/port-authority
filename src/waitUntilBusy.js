import * as net from 'net';

/**
 * Wait until `port` is busy
 * @param {number} port
 * @param {{ timeout?: number }} options
 */
export function waitUntilBusy(port, { timeout = 5000 } = {}) {
	return new Promise((fulfil, reject) => {
		const t = setTimeout(() => {
			reject(new Error(`timed out waiting for connection`));
		}, timeout);

		get_connection(port, () => {
			clearTimeout(t);
			fulfil();
		});
	});
}

/**
 * @param {number} port
 * @param {() => void} cb
 */
function get_connection(port, cb) {
	/** @type {NodeJS.Timeout} */
	let timeout;

	const socket = net.connect(port, 'localhost', () => {
		cb();
		socket.destroy();
		clearTimeout(timeout);
	});

	socket.on('error', () => {
		clearTimeout(timeout);
		setTimeout(() => {
			get_connection(port, cb);
		}, 10);
	});

	timeout = setTimeout(() => {
		socket.destroy();
	}, 5000);
}
