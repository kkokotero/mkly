import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	test: {
		fileParallelism: true,
		env: {
			FORCE_COLOR: '1',
		},
	},
});
