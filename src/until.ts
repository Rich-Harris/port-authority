import { check } from './check';

export function until(port: number, { timeout = 5000 } = {}) {
	return new Promise((fulfil, reject) => {
		const t = setTimeout(() => {
			reject(new Error(`timed out waiting for connection`))
		}, timeout);

		when_port_available(port, () => {
			clearTimeout(t);
			fulfil();
		});
	});
}

function when_port_available(port: number, cb: () => void) {
    const doCheck = async () => {
        const isFree = await check(port);
        if (isFree) return cb();
        setTimeout(doCheck, 100);
    }

    doCheck();
}