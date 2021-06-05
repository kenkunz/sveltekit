import { spawn } from 'child_process';

/*
 * Implementing plugin inline as a POC. This would be extracted to a separate
 * npm module following a pattern similar to @snowpack/web-test-runner-plugin:
 * https://github.com/snowpackjs/snowpack/tree/main/plugins/web-test-runner-plugin
 * or vite-web-test-runner-plugin:
 * https://github.com/betaboon/vite-web-test-runner-plugin
 */
const svelteKitPlugin = function () {
	let server;

	// quick hack; use more resilient approach in real plugin
	function randomPort(min = 49152, max = 65535) {
		return Math.floor(Math.random() * (max - min) + min);
	}

	// Currently, svelte-kit does not expose a method to the outside world to
	// start a dev server in JS-land. Work-around for POC: spawn a child process
	// that shells-out to svelte-kit cli. For real plugin, extract and export a
	// method from svelte-kit to start a dev server.
	function startTestServer(port) {
		const testServer = spawn('npx', ['svelte-kit', 'dev', `--port=${port}`]);

		testServer.stderr.on('data', (data) => {
			console.error(data.toString());
		});

		testServer.stdout.on('data', (data) => {
			console.log(data.toString());
		});

		return new Promise((resolve, reject) => {
			testServer.stdout.on('data', (data) => {
				if (/http:\/\/localhost:\d+/.test(data)) {
					resolve(testServer);
				}
			});

			testServer.on('close', reject);
		});
	}

	return {
		name: 'svelte-kit-plugin',

		async serverStart({ app }) {
			const port = randomPort();
			server = await startTestServer(port);
			app.use((ctx, next) => {
				ctx.redirect(`http://localhost:${port}${ctx.originalUrl}`);
			});
		},

		async serverStop() {
			return server.kill();
		}
	};
};

process.env.NODE_ENV = 'test';

export default {
	plugins: [svelteKitPlugin()],
	testRunnerHtml: (testFramework) => `
    <html>
      <head>
        <script>
          global = window;
          process = { env: { NODE_ENV: "test" } };
        </script>
        <script type="module" src="${testFramework}"></script>
      </head>
      <body>
        <div id="svelte"></div>
      </body>
    </html>
  `
};
