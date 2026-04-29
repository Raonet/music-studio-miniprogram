const proxy = {
	'/dev/': {
		target: 'http://111.230.47.47',
		changeOrigin: true,
		rewrite: (path: string) => path.replace(/^\/dev/, '/api')
	},

	'/prod/': {
		target: 'http://111.230.47.47',
		changeOrigin: true,
		rewrite: (path: string) => path.replace(/^\/prod/, '/api')
	}
};

const value = 'dev';
const host = proxy[`/${value}/`]?.target;

export { proxy, host, value };
