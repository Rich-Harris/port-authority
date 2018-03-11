import * as assert from 'assert';
import * as http from 'http';
import * as ports from '../src/index';

describe('port-authority', () => {
	function createServer(port: number): Promise<{ close: (err?: Error) => void }> {
		return new Promise((fulfil, reject) => {
			const server = http.createServer();

			function close() {
				return new Promise((fulfil, reject) => {
					server.close((err?: Error) => {
						if (err) reject(err);
						else fulfil();
					});
				});
			}

			server.listen(port, (err?: Error) => {
				if (err) reject(err);
				else fulfil({
					close
				});
			});
		});
	}

	describe('check', () => {
		it('returns true if a port is available', async () => {
			assert.equal(
				await ports.check(3000),
				true
			);
		});

		it('returns false if a port is unavailable', async () => {
			const server = await createServer(3000);

			assert.equal(
				await ports.check(3000),
				false
			);

			await server.close();
		});
	});
});