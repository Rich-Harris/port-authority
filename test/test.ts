import { fork } from 'child_process';
import { join } from 'path';
import * as assert from 'assert';
import * as http from 'http';
import * as ports from '../src/index';
import { host } from "../src/constants";

describe('port-authority', () => {
	function createServer() {
		const server = http.createServer();
		return {
			listen(port: number) {
				return new Promise((fulfil, reject) => {
					server.listen({host, port}, (err?: Error) => {
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

	let server: any;
	beforeEach(() => {
		server = createServer();
	})

	afterEach(async () => {
		try {
			await server.close();	
		} catch (error) {
			// Ignore not listening error
		}
	})

	describe('blame', () => {
		it('returns null if port is unoccupied', async () => {
			const pid = await ports.blame(3000);

			assert.equal(
				pid,
				null
			);
		});

		it('returns the ID of a process on a given port', async () => {
			await server.listen(3000);

			const pid = await ports.blame(3000);

			assert.equal(
				pid,
				process.pid
			);
		});
	});

	describe('check', () => {
		it('returns true if a port is available', async () => {
			assert.equal(
				await ports.check(3000),
				true
			);
		});

		it('returns false if a port is unavailable', async () => {
			await server.listen(3000);

			assert.equal(
				await ports.check(3000),
				false
			);

		});
	});

	describe('find', () => {
		it('returns input if port is available', async () => {
			assert.equal(
				await ports.find(3000),
				3000
			);
		});

		it('finds nearest available port to input', async () => {
			await server.listen(3000);
			assert.equal(
				await ports.find(3000),
				3001
			);			
		});
	});

	describe('kill', () => {
		it('kills the process occupying a given port', async () => {
			const child = fork(join(__dirname, 'server.js'));
			await ports.wait(3000);

			let pid = await ports.blame(3000);
			assert.ok(pid);

			const killed = await ports.kill(3000);
			assert.ok(killed);

			pid = await ports.blame(3000);
			assert.ok(!pid);
		});
	});

	describe('wait', () => {
		it('waits for port', async () => {
			let listening = false;
			server.listen(3000).then(() => {
				listening = true;
			});

			assert.ok(!listening);
			await ports.wait(3000);
			assert.ok(listening);
		});

		it('waits for port under cpu load', async () => {
			let listening = false;
			server.listen(3000).then(() => {
				listening = true;
			});
			// check servers actually listening and ports available
			assert.ok(!listening);
			await ports.wait(3000);
			assert.ok(listening);

			// spin cpu so we have some load
			// check we can still wait on port
			try {
				spinCpu(5000);
				await ports.wait(3000);
			}catch(error){
				assert.fail(error.message);
			}
		}).timeout(11000); // two * default ports.wait() timeouts + one second
	});
});

function spinCpu(duration:number /* ms */){
	let spinning = true;
	// stop after ~5s
	setTimeout(()=>spinning=false, duration);
	loop();

	function loop(){
		if(!spinning) return;
		blockCpuFor(999);
		setTimeout(loop, 1);
	}

	function blockCpuFor(ms:number) {
		let end = new Date().getTime() + ms;
		let counter = 0;
		while(spinning) {
			counter += new Date().getTime();
			if (new Date().getTime() > end){
				break;
			}
		}
	}
}