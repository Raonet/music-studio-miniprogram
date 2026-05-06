const proxy = {
	'/dev/': {
		target: 'https://www.xiaobai.site',
		changeOrigin: true,
		rewrite: (path: string) => path.replace(/^\/dev/, '/api')
	},

	'/prod/': {
		target: 'https://www.xiaobai.site',
		changeOrigin: true,
		rewrite: (path: string) => path.replace(/^\/prod/, '/api')
	}
};

const value = 'dev';
const host = proxy[`/${value}/`]?.target;

export { proxy, host, value };
