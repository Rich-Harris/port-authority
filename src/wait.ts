import * as net from 'net';

export function wait(port: number, { timeout = 5000, host = 'localhost' } = {}) {
	return new Promise((fulfil, reject) => {
		const t = setTimeout(() => {
			reject(new Error(`timed out waiting for connection`))
		}, timeout);

		get_connection(port, host, () => {
			clearTimeout(t);
			fulfil();
		});
	});
}

function get_connection(port: number, host: string, cb: () => void) {
	let timeout: NodeJS.Timer;

	const socket = net.connect(port, host, () => {
		cb();
		socket.destroy();
		clearTimeout(timeout);
	});

	socket.on('error', () => {
		clearTimeout(timeout);
		setTimeout(() => {
			get_connection(port, host, cb);
		}, 10);
	});

	timeout = setTimeout(() => {
		socket.destroy();
	}, 5000);
}