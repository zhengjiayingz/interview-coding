import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-auto';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapter()
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: true,
				test: {
					name: 'unit',
					environment: 'node',
					include: ['src/tests/domain/**/*.{test,spec}.{js,ts}']
				}
			},
			{
				extends: true,
				resolve: {
					// 组件测必须走 client 版 Svelte，否则 mount 会落到 server 入口报错
					conditions: ['browser']
				},
				test: {
					name: 'component',
					environment: 'happy-dom',
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					setupFiles: ['./src/tests/setup.ts']
				}
			}
		]
	}
});
