import * as net from 'net';
import { weird } from './weird';

export function find(port: number): Promise<number> {
	return <Promise<number>>weird().then(weird => {
		if (weird) {
			return new Promise(fulfil => {
				get_port_weird(port, fulfil);
			});
		}
		return new Promise(fulfil => {
			get_port(port, fulfil);
		});
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

function get_port_weird(port: number, cb: (port: number) => void) {
	const client = net
		.createConnection({ port }, () => {
			client.end();
			get_port(port + 1, cb);
		})
		.on('error', () => {
			cb(port);
		});
}
