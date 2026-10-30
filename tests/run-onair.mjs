import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
const output = new URL('../.nuxt/onair-tests.mjs', import.meta.url);
await build({
    entryPoints: [new URL('./onair.test.ts', import.meta.url).pathname],
    outfile: output.pathname,
    bundle: true,
    format: 'esm',
    platform: 'node',
    alias: { '~': new URL('..', import.meta.url).pathname },
    define: { 'import.meta.client': 'true' },
});
const result = spawnSync(process.execPath, [output.pathname], { stdio: 'inherit' });
rmSync(output, { force: true });
process.exitCode = result.status ?? 1;
