import * as net from 'net';
import { weird } from './weird.js';
import { host } from './constants.js';

/** @param {number} port */
export function check(port) {
	return weird().then((weird) => {
		if (weird) {
			return check_weird(port);
		}

		return new Promise((fulfil) => {
			const server = net.createServer();

			server.unref();

			server.on('error', () => {
				fulfil(false);
			});

			server.listen({ host, port }, () => {
				server.close(() => {
					fulfil(true);
				});
			});
		});
	});
}

/** @param {number} port */
function check_weird(port) {
	return new Promise((fulfil) => {
		const client = net
			.createConnection({ host, port }, () => {
				client.end();
				fulfil(false);
			})
			.on('error', () => {
				fulfil(true);
			});
	});
}
