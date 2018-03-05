import * as net from 'net';

export function wait(port: number, { timeout = 5000 } = {}) {
	return new Promise((fulfil, reject) => {
		get_connection(port, fulfil);
		setTimeout(() => reject(new Error(`timed out waiting for connection`)), timeout);
	});
}

function get_connection(port: number, cb: () => void) {
	const socket = net.connect(port, 'localhost', () => {
		cb();
		socket.destroy();
	});

	socket.on('error', () => {
		setTimeout(() => {
			get_connection(port, cb);
		}, 10);
	});

	setTimeout(() => {
		socket.destroy();
	}, 1000);
}