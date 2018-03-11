import * as assert from 'assert';
import * as http from 'http';
import * as ports from '../src/index';

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

	describe('check', () => {
		it('returns true if a port is available', async () => {
			assert.equal(
				await ports.check(3000),
				true
			);
		});

		it('returns false if a port is unavailable', async () => {
			const server = createServer();
			await server.listen(3000);

			assert.equal(
				await ports.check(3000),
				false
			);

			await server.close();
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
			const server = createServer();
			await server.listen(3000);

			assert.equal(
				await ports.find(3000),
				3001
			);

			await server.close();
		});
	});

	describe('wait', () => {
		it('waits for port', async () => {
			const server = createServer();

			let listening = false;
			server.listen(3000).then(() => {
				listening = true;
			});

			assert.ok(!listening);
			await ports.wait(3000);
			assert.ok(listening);

			await server.close();
		});
	});
});