import * as net from 'net';
import { weird } from './weird';

export function check(port: number, host?: string) {
	return weird().then(weird => {
		if (weird) {
			return check_weird(port, host);
		}

		return new Promise(fulfil => {
			const server = net.createServer();

			server.unref();

			server.on('error', () => {
				fulfil(false);
			});

			server.listen({ port, host }, () => {
				server.close(() => {
					fulfil(true);
				});
			});
		});
	});
}

function check_weird(port: number, host: string | undefined) {
	return new Promise(fulfil => {
		const client = net
			.createConnection({ port, host }, () => {
				client.end();
				fulfil(false);
			})
			.on('error', () => {
				fulfil(true);
			});
	});
}
