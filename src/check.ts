import * as net from 'net';
import { weird } from './weird';

export function check(port: number) {
	return weird().then(weird => {
		if (weird) {
			return check_weird(port);
		}

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
	});
}

export function check_weird(port: number) {
	return new Promise(fulfil => {
		const client = net
			.createConnection({ port }, () => {
				client.end();
				fulfil(false);
			})
			.on('error', () => {
				fulfil(true);
			});
	});
}
