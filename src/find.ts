import * as net from 'net';
import { weird } from './weird';

export function find(port: number, host?: string): Promise<number> {
	return <Promise<number>>weird().then(weird => {
		if (weird) {
			return new Promise(fulfil => {
				get_port_weird(port, host, fulfil);
			});
		}
		return new Promise(fulfil => {
			get_port(port, host, fulfil);
		});
	});
}

function get_port(port: number, host: string | undefined, cb: (port: number) => void) {
	const server = net.createServer();

	server.unref();

	server.on('error', () => {
		get_port(port + 1, host, cb);
	});

	server.listen({ port, host }, () => {
		server.close(() => {
			cb(port);
		});
	});
}

function get_port_weird(port: number, host: string | undefined, cb: (port: number) => void) {
	const client = net
		.createConnection({ port }, () => {
			client.end();
			get_port(port + 1, host, cb);
		})
		.on('error', () => {
			cb(port);
		});
}
