import * as net from 'net';

export function check(port: number) {
	return new Promise(fulfil => {
		const server = net.createServer();

		server.unref();

		server.on('error', () => {
			fulfil(false);
		});

		server.listen({ port }, () => {
			server.close(() => {
				fulfil(true);
			});
		});
	});
}