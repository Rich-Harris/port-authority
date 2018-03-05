import * as net from 'net';

export function find(port: number): Promise<number> {
	return new Promise((fulfil) => {
		get_port(port, fulfil);
	});
}

function get_port(port: number, cb: (port: number) => void) {
	const server = net.createServer();

	server.unref();

	server.on('error', () => {
		get_port(port + 1, cb);
	});

	server.listen({ port }, () => {
		server.close(() => {
			cb(port);
		});
	});
}