import * as net from 'net';
import { weird } from './shared/weird.js';
import { host } from './shared/constants.js';

/**
 * Find an available port
 * @param {number} port
 * @returns Promise<number>
 */
export function find(port) {
	return weird().then((weird) => {
		if (weird) {
			return new Promise((fulfil) => {
				get_port_weird(port, fulfil);
			});
		}
		return new Promise((fulfil) => {
			get_port(port, fulfil);
		});
	});
}

/**
 * @param {number} port
 * @param {(port: number) => void} cb
 */
function get_port(port, cb) {
	const server = net.createServer();

	server.unref();

	server.on('error', () => {
		get_port(port + 1, cb);
	});

	server.listen({ host, port }, () => {
		server.close(() => {
			cb(port);
		});
	});
}

/**
 * @param {number} port
 * @param {(port: number) => void} cb
 */
function get_port_weird(port, cb) {
	const client = net
		.createConnection({ host, port }, () => {
			client.end();
			get_port(port + 1, cb);
		})
		.on('error', () => {
			cb(port);
		});
}
