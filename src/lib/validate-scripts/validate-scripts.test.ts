import type { TargetSettings, ValidateScriptsInject } from './interfaces/index.ts';
import type { StyleFormat } from '#lib/interfaces/index.ts';

import { MaliciousScriptError } from './malicious-script.error.ts';
import { validateScripts } from './validate-scripts.ts';
import test from 'node:test';

const targetSettings: TargetSettings = {
    name: 'sha1-hulud',
    json: {
        scripts: {
            preinstall: [
                'bun\.m?((j|t)s)x?',
                'environment\.m?((j|t)s)x?',
            ]
        }
    }
};

class Inject implements ValidateScriptsInject {
    styleText(format: StyleFormat[], input: string): string {
        switch (format[0]) {
            case 'redBright': {
                return `[${input}]`;
            }

            case 'greenBright': {
                return `<${input}>`
            }

            default: {
                throw new Error(`Invalid "${format[0]}" color`);
            }
        }
    }
}

test('Scripts validation: Package isn\'t infected', async (t: test.TestContext) => {
    try {
        const inject = new Inject();
        validateScripts(targetSettings, {
            path: '/path/to/project/package.json',
            json: {
                scripts: {
                    preinstall: 'rm -rf ./dist'
                }
            }
        }, inject);
    } catch (err: any) {
        t.assert.fail(err);
    }
});

test('Scripts validation: Package has been infected', async (t: test.TestContext) => {
    try {
        const inject = new Inject();
        validateScripts(targetSettings, {
            path: '/path/to/project/package.json',
            json: {
                scripts: {
                    preinstall: 'node ./src/bun.ts && node ./src/environment.ts'
                }
            }
        }, inject);
        t.assert.fail('The "validateScripts" function must throws an `MaliciousScriptError` instance');
    } catch (err: any) {
        t.assert.ok(err instanceof MaliciousScriptError);
        t.assert.strictEqual(
            err?.message,
            [
                `Malicious <"sha1-hulud"> malware script has found.`,
                `☢️ At package <"/path/to/project/package.json">;`,
                `☢️ for script <"preinstall">;`,
                `☢️ with value <"node ./src/[bun.ts] && node ./src/[environment.ts]">.`
            ].join('\n')
        );
    }
});