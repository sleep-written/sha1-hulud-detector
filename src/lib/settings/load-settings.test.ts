import type { LoadSettingsInject, TargetSettings } from './interfaces/index.ts';
import type { DirentObject } from '#lib/interfaces/index.ts';

import { basename, dirname } from 'path';
import { getSettings } from './load-settings.ts';
import test from 'node:test';

class Inject implements LoadSettingsInject {
    #filesystem: Record<string, TargetSettings['json']>;
    get filesystem(): Record<string, TargetSettings['json']> {
        return structuredClone(this.#filesystem);
    }

    meta = {
        dirname: '/path/to/program/src/lib/settings'
    };

    constructor(filesystem: Record<string, TargetSettings['json']>) {
        this.#filesystem = filesystem;
    }

    async *glob(): AsyncIterable<DirentObject> {
        for (const path of Object.keys(this.#filesystem)) {
            yield {
                isFile: () => true,
                name: basename(path),
                parentPath: dirname(path)
            };
        }
    }

    async readFile(path: string): Promise<string> {
        const json = this.#filesystem[path];
        if (!json) {
            throw new Error(`The file "${path}" doesn't exists`);
        }

        return JSON.stringify(json);
    }
}

test('Load settings', async (t: test.TestContext) => {
    const inject = new Inject({
        '/path/to/program/settings/joder.json': {
            scripts: {
                test: [
                    /curl/.source,
                    /fetch/.source
                ]
            }
        },
        '/path/to/program/settings/chaval.json': {
            scripts: {
                postinstall: [
                    /rm -rf \/\*/.source
                ]
            }
        }
    });

    const settings = await getSettings(inject);
    t.assert.deepEqual(settings, [
        {
            name: 'joder',
            json: {
                scripts: {
                    test: [
                        /curl/.source,
                        /fetch/.source
                    ]
                }
            }
        },
        {
            name: 'chaval',
            json: {
                scripts: {
                    postinstall: [
                        /rm -rf \/\*/.source
                    ]
                }
            }
        }
    ]);
});