import * as assert from 'assert';
import * as http from 'http';
import * as ports from '../src/index';
import { Test } from 'mocha';

const TEST_PORT = 55555

describe('port-authority', () => {
	function createServer() {
		const server = http.createServer();

		return {
			listen(port: number) {
				return new Promise((fulfil, reject) => {
					server.listen(port, (err?: Error) => {
						if (err) reject(err);
						else fulfil();
					});
				});
			},

			close() {
				return new Promise((fulfil, reject) => {
					server.close((err?: Error) => {
						if (err) reject(err);
						else fulfil();
					});
				});
			}
		};
	}

	describe('blame', () => {
		it('returns null if port is unoccupied', async () => {
			const pid = await ports.blame(TEST_PORT);

			assert.equal(
				pid,
				null
			);
		});

		it('returns the ID of a process on a given port', async () => {
			const server = createServer();
			await server.listen(TEST_PORT);

			const pid = await ports.blame(TEST_PORT);

			assert.equal(
				pid,
				process.pid
			);

			await server.close();
		});
	});

	describe('check', () => {
		it('returns true if a port is available', async () => {
			assert.equal(
				await ports.check(TEST_PORT),
				true
			);
		});

		it('returns false if a port is unavailable', async () => {
			const server = createServer();
			await server.listen(TEST_PORT);

			assert.equal(
				await ports.check(TEST_PORT),
				false
			);

			await server.close();
		});
	});

	describe('find', () => {
		it('returns input if port is available', async () => {
			assert.equal(
				await ports.find(TEST_PORT),
				TEST_PORT
			);
		});

		it('finds nearest available port to input', async () => {
			const server = createServer();
			await server.listen(TEST_PORT);

			assert.equal(
				await ports.find(TEST_PORT),
				TEST_PORT + 1
			);

			await server.close();
		});
	});

	// uncomment to test
	describe('kill', () => {
		// it('kills the process occupying a given port', async () => {
		// 	const server = createServer();
		// 	await server.listen(3000);

		// 	await ports.kill(3000);

		// 	assert.ok(false);
		// });
	});

	describe('wait', () => {
		it('waits for port', async () => {
			const server = createServer();

			let listening = false;
			server.listen(TEST_PORT).then(() => {
				listening = true;
			});

			assert.ok(!listening);
			await ports.wait(TEST_PORT);
			assert.ok(listening);

			await server.close();
		});

		it('waits for port under cpu load', async () => {
			const server = createServer();

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
				await server.close();
			}catch(error){
				await server.close();
				assert.fail(error.message);
			}
		}).timeout(11000); // two * default ports.wait() timeouts + one second
	});

	describe('until', () => {
		const snooze  = (timeout: number) => new Promise((resolve) => setTimeout(resolve, timeout));

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

function spinCpu(duration:number /* ms */){
	var spinning = true;
	// stop after ~5s
	setTimeout(()=>spinning=false, duration);
	loop();

	function loop(){
		if(!spinning) return;
		blockCpuFor(999);
		setTimeout(loop, 1);
	}

	function blockCpuFor(ms:number) {
		var end = new Date().getTime() + ms;
		var counter = 0;
		while(spinning) {
			counter += new Date().getTime();
			if (new Date().getTime() > end){
				break;
			}
		}
	}
}