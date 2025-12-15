import { getNodePackages } from '#lib/node-package/index.ts';
import { validateScripts } from '#lib/validate-scripts/index.ts';
import { validateHashes } from '#lib/validate-hashes/index.ts';
import { getSettings } from '#lib/settings/index.ts';
import { styleText } from 'node:util';
import { resolve } from 'node:path';

const settings = await getSettings();
if (settings.length === 0) {
    const path = resolve(import.meta.dirname, '../targets/*.json');
    console.warn(`No target settings allocated on "${path}"`);
    process.exit();
}

const entrypoint = process.argv[2] ?? process.cwd();
const nodePackages = getNodePackages(entrypoint);

for await (const nodePackage of nodePackages) {
    const path = styleText([ 'greenBright' ], `"${nodePackage.path}"`);
    console.log(`Scanning ${path}...`);

    for (const targetSettings of settings) {
        validateScripts(targetSettings, nodePackage);
        await validateHashes(targetSettings, nodePackage);
    }
}