# port-authority

Utilities for dealing with ports in Node apps.

![Port Authority](https://user-images.githubusercontent.com/1162160/36995526-4484c6ac-2082-11e8-9158-a3fb960a9586.jpg)

```js
import * as ports from 'port-authority';

async function start(port) {
	if (port) {
		// if the selected port is unavailable,
		// print something nicer than EADDRINUSE
		const available = await ports.check(port);
		if (!available) {
			console.log(`> Port ${port} is unavailable`);
			return;
		}
	} else {
		// if no port was selected, start at 3000
		// and keep counting until we find one
		port = await ports.find(3000);
	}

	const proc = child_process.fork('server.js', [], {
		env: {
			PORT: port
		}
	});

	try {
		await ports.wait(port, {
			timeout: 5000
		});

		console.log(`> Server is running on port ${port}`);
	} catch (err) {
		console.log(`> Could not find server on port ${port}`);
		proc.kill();
	}
}

start();
```

There are existing libraries to do this stuff, but I couldn't find any that do all the things that port-authority does, with treeshakeable functions and a modern Promise-based API.


## License

[LIL](LICENSE)