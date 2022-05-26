import { fork } from 'child_process';
import { join } from 'path';
import * as assert from 'assert';
import * as http from 'http';
import * as ports from '../src/index';
import { host } from '../src/constants';
import type { Socket } from 'net';

const TEST_PORT = 3000;

describe('port-authority', function () {
	this.timeout(5000);

	function createServer() {
		const server = http.createServer();

		const sockets: Set<Socket> = new Set();

		server.on('connection', (socket) => {
			sockets.add(socket);

			socket.on('close', () => {
				sockets.delete(socket);
			});
		});

		return {
			_: server,

			listen(port: number) {
				return new Promise((fulfil, reject) => {
					server.listen({ host, port }, (err?: Error) => {
						if (err) reject(err);
						else fulfil(undefined);
					});
				});
			},

			close() {
				return new Promise((fulfil, reject) => {
					sockets.forEach((socket) => socket.destroy());

					server.close((err?: Error) => {
						if (err) reject(err);
						else fulfil(undefined);
					});
				});
			}
		};
	}

	let server: any;
	beforeEach(() => {
		server = createServer();
	});

	afterEach(async () => {
		try {
			await server.close();
		} catch (error) {
			if (error.code === 'ERR_SERVER_NOT_RUNNING') return;
			throw error;
		}
	});

	describe('blame', () => {
		it('returns null if port is unoccupied', async () => {
			const pid = await ports.blame(TEST_PORT);

			assert.equal(pid, null);
		});

		it('returns the ID of a process on a given port', async () => {
			await server.listen(TEST_PORT);

			const pid = await ports.blame(TEST_PORT);

			assert.equal(pid, process.pid);
		});
	});

	describe('check', () => {
		it('returns true if a port is available', async () => {
			assert.equal(await ports.check(TEST_PORT), true);
		});

		it('returns false if a port is unavailable', async () => {
			await server.listen(TEST_PORT);

			assert.equal(await ports.check(TEST_PORT), false);
		});
	});

	describe('find', () => {
		it('returns input if port is available', async () => {
			assert.equal(await ports.find(TEST_PORT), TEST_PORT);
		});

		it('finds nearest available port to input', async () => {
			await server.listen(TEST_PORT);
			assert.equal(await ports.find(TEST_PORT), TEST_PORT + 1);
		});
	});

	describe('kill', () => {
		it('kills the process occupying a given port', async () => {
			fork(join(__dirname, 'server.js'));
			await ports.wait(TEST_PORT);

			let pid = await ports.blame(TEST_PORT);
			assert.ok(pid);

			const killed = await ports.kill(TEST_PORT);
			assert.ok(killed);

			pid = await ports.blame(TEST_PORT);
			assert.ok(!pid);
		});
	});

	describe('wait', () => {
		it('waits for port', async () => {
			let listening = false;
			server.listen(TEST_PORT).then(() => {
				listening = true;
			});

			assert.ok(!listening);
			await ports.wait(TEST_PORT);
			assert.ok(listening);
		});

		it('waits for port under cpu load', async () => {
			let listening = false;
			server.listen(TEST_PORT).then(() => {
				listening = true;
			});
			// check servers actually listening and ports available
			assert.ok(!listening);
			await ports.wait(TEST_PORT);
			assert.ok(listening);

			// spin cpu so we have some load
			// check we can still wait on port
			try {
				spinCpu(5000);
				await ports.wait(TEST_PORT);
			} catch (error) {
				assert.fail(error.message);
			}
		}).timeout(11000); // two * default ports.wait() timeouts + one second
	});

	describe('until', () => {
		const snooze = (timeout: number) =>
			new Promise((resolve) => setTimeout(resolve, timeout));

		it('waits for port to become available', async () => {
			const server = createServer();

			await server.listen(TEST_PORT);
			const promise = ports.until(TEST_PORT);
			await snooze(1000);
			server.close();

			return promise;
		});

		it('errors after given timeout', async () => {
			const server = createServer();

			await server.listen(TEST_PORT);
			const promise = ports.until(TEST_PORT, { timeout: 500 });
			await snooze(1000);
			server.close();

			assert.rejects(promise);
		});
	});
});

function spinCpu(duration: number /* ms */) {
	let spinning = true;
	// stop after ~5s
	setTimeout(() => (spinning = false), duration);
	loop();

	function loop() {
		if (!spinning) return;
		blockCpuFor(999);
		setTimeout(loop, 1);
	}

	function blockCpuFor(ms: number) {
		let end = new Date().getTime() + ms;
		let counter = 0;
		while (spinning) {
			counter += new Date().getTime();
			if (new Date().getTime() > end) {
				break;
			}
		}
	}
}
