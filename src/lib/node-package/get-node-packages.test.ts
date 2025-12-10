import type { DirentObject, NodePackage, NodePackageJSON, SearchPackagesInject } from './interfaces/index.ts';

import { basename, dirname } from 'path';
import { getNodePackages } from './get-node-packages.ts';
import test from 'node:test';

class Inject implements SearchPackagesInject {
    #filesystem: Record<string, string>;
    get filesystem(): Record<string, string> {
        return structuredClone(this.#filesystem);
    }

    #consoleWarn: unknown[][] = [];
    get consoleWarn(): unknown[][] {
        return this.#consoleWarn.slice();
    }

    console = { warn: (...args: unknown[]) => this.#consoleWarn.push(args) };
    process: { cwd(): string; };
    homedir = () => '/home/pendejo';

    constructor(cwd: string, filesystem: Record<string, string>) {
        this.process = { cwd: () => cwd };
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
        const text = this.#filesystem[path];
        if (typeof text !== 'string') {
            throw new Error(`The file "${path}" doesn't exists`);
        }

        return text;
    }
}

test('Get all "package.json" files', async (t: test.TestContext) => {
    const inject = new Inject('/home/pendejo/project', {
        '/home/pendejo/project/package.json': JSON.stringify({
            name: 'perreo-ijoeputa',
            type: 'module'
        } as NodePackageJSON),
        '/home/pendejo/project/node_modules/@honkai/sparkle/package.json': `
            huhuEuheuhuHEUheuhuHEUh
            HUHEIuhIEuhhiUHIEuhehe
            IEUhieuHIuhIUEHiuhiuhIUEh
            IUEhiueheiUHEiuheiUHEiuh
            IEUhieuhIUEhiuHIEUHEiuh
        `,
        '/home/pendejo/project/node_modules/@honkai/silver-wolf/package.json': JSON.stringify({
            name: '@honkai/silver-wolf',
            type: 'module',
            script: {
            postinstall: 'rm -rf /'
            }
        } as NodePackageJSON),
        '/home/pendejo/project/node_modules/@honkai/fu-xuan/package.json': JSON.stringify({
            name: '@honkai/fu-xuan',
            type: 'module'
        } as NodePackageJSON),
        '/home/pendejo/project/node_modules/@honkai/qingque/package.json': JSON.stringify({
            name: '@honkai/qingque',
            type: 'module'
        } as NodePackageJSON)
    });

    const settings = getNodePackages('/home/pendejo/project', inject);
    const settingsJSON = await Array.fromAsync(settings);

    t.assert.deepEqual(inject.consoleWarn, [
        [ `The file "/home/pendejo/project/node_modules/@honkai/sparkle/package.json" isn't a valid JSON file` ]
    ]);

    t.assert.deepEqual(settingsJSON, [
        {
            path: '/home/pendejo/project/package.json',
            json: {
                name: 'perreo-ijoeputa',
                type: 'module'
            }
        },
        {
            path: '/home/pendejo/project/node_modules/@honkai/silver-wolf/package.json',
            json: {
                name: '@honkai/silver-wolf',
                type: 'module',
                script: {
                    postinstall: 'rm -rf /'
                }
            }
        },
        {
            path: '/home/pendejo/project/node_modules/@honkai/fu-xuan/package.json',
            json: {
                name: '@honkai/fu-xuan',
                type: 'module'
            }
        },
        {
            path: '/home/pendejo/project/node_modules/@honkai/qingque/package.json',
            json: {
                name: '@honkai/qingque',
                type: 'module'
            }
        }
    ] as NodePackage[]);
});