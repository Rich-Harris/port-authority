import { fork } from 'child_process';
import * as assert from 'assert';
import * as http from 'http';
import * as ports from '../src/index.js';
import { host } from '../src/shared/constants.js';
import { fileURLToPath } from 'url';

const TEST_PORT = 3000;

describe('port-authority', function () {
	this.timeout(5000);

	function createServer() {
		const server = http.createServer();

		/** @type {Set<import('net').Socket>} */
		const sockets = new Set();

		server.on('connection', (socket) => {
			sockets.add(socket);

			socket.on('close', () => {
				sockets.delete(socket);
			});
		});

		return {
			_: server,

			/** @param {number} port */
			listen(port) {
				return new Promise((fulfil, reject) => {
					server.listen({ host, port }, (err) => {
						if (err) reject(err);
						else fulfil(undefined);
					});
				});
			},

			close() {
				return new Promise((fulfil, reject) => {
					sockets.forEach((socket) => socket.destroy());

					server.close((err) => {
						if (err) reject(err);
						else fulfil(undefined);
					});
				});
			}
		};
	}

	let server;
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
			const path = fileURLToPath(new URL('./server.js', import.meta.url));
			fork(path);
			await ports.waitUntilBusy(TEST_PORT);

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
			await ports.waitUntilBusy(TEST_PORT);
			assert.ok(listening);
		});

		it('waits for port under cpu load', async () => {
			let listening = false;
			server.listen(TEST_PORT).then(() => {
				listening = true;
			});
			// check servers actually listening and ports available
			assert.ok(!listening);
			await ports.waitUntilBusy(TEST_PORT);
			assert.ok(listening);

			// spin cpu so we have some load
			// check we can still wait on port
			try {
				spinCpu(5000);
				await ports.waitUntilBusy(TEST_PORT);
			} catch (error) {
				assert.fail(error.message);
			}
		}).timeout(11000); // two * default ports.waitUntilBusy() timeouts + one second
	});

	describe('until', () => {
		const snooze = (timeout) =>
			new Promise((resolve) => setTimeout(resolve, timeout));

		it('waits for port to become available', async () => {
			const server = createServer();

			await server.listen(TEST_PORT);
			const promise = ports.waitUntilFree(TEST_PORT);
			snooze(1000).then(() => server.close());

			return promise;
		});

		it('errors after given timeout', async () => {
			const server = createServer();

			await server.listen(TEST_PORT);
			const promise = ports.waitUntilFree(TEST_PORT, { timeout: 500 });
			snooze(1000).then(() => server.close());

			assert.rejects(promise);
		});
	});
});

/** @param {number} duration */
function spinCpu(duration) {
	let spinning = true;
	// stop after ~5s
	setTimeout(() => (spinning = false), duration);
	loop();

	function loop() {
		if (!spinning) return;
		blockCpuFor(999);
		setTimeout(loop, 1);
	}

	/** @param {number} ms */
	function blockCpuFor(ms) {
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
