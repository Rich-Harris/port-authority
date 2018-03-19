import * as net from 'net';

let promise: Promise<any>;

export function weird() {
	if (!promise) {
		promise = get_weird(9000);
	}
	return promise;
}

function get_weird(port: number) {
	return new Promise(fulfil => {
		const server = net.createServer();

		server.unref();

		server.on('error', () => {
			fulfil(get_weird(port + 1));
		});

		server.listen({ port }, () => {
			const server2 = net.createServer();

			server2.unref();

			server2.on('error', () => {
				server.close(() => {
					fulfil(false);
				});
			});

			server2.listen({ port }, () => {
				server2.close(() => {
					server.close(() => {
						fulfil(true);
					});
				});
			});
		});
	});
}
