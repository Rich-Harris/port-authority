import * as net from 'net';

let promise: Promise<any>;

export function weird() {
	if (!promise) {
		promise = get_weird();
	}
	return promise;
}

function get_weird() {
	return new Promise(fulfil => {
		const server = net.createServer();

		server.unref();

		server.on('error', () => {
			fulfil(false);
		});

		server.listen({ port: 9999 }, () => {
			const server2 = net.createServer();

			server2.unref();

			server2.on('error', () => {
				server.close(() => {
					fulfil(false);
				});
			});

			server2.listen({ port: 9999 }, () => {
				server2.close(() => {
					server.close(() => {
						fulfil(true);
					});
				});
			});
		});
	});
}
