import type { HashObject, ValidateHashesInject, TargetSettings, NodePackage } from './interfaces/index.ts';
import type { DirentObject, StyleFormat } from '#lib/interfaces/index.ts';

import { MaliciousHashError } from './malicious-hash.error.ts';
import { validateHashes } from './validate-hashes.ts';

import { basename, dirname } from 'node:path';
import test from 'node:test';

class FakeHash implements HashObject {
    #algorithm: string;
    #chunks: Buffer[] = [];

    constructor(algorithm: string) {
        this.#algorithm = algorithm;
    }

    update(input: Buffer): HashObject {
        this.#chunks.push(input);
        return this;
    }

    digest(): string {
        const text = Buffer
            .concat(this.#chunks)
            .toString('utf-8');

        const data = [
            `algorithm="${this.#algorithm}"`,
            `content="${text}"`
        ].join('; ');

        const resp = `FakeHash({ ${data} });`;
        return resp;
    }
}

class Inject implements ValidateHashesInject {
    #filesystem: Record<string, string>;

    constructor(filesystem: Record<string, string>) {
        this.#filesystem = filesystem;
    }

    async *glob(): AsyncIterable<DirentObject> {
        const paths = Object.keys(this.#filesystem);
        for (const path of paths) {
            yield {
                isFile: () => true,
                name: basename(path),
                parentPath: dirname(path)
            };
        }
    }

    createHash(algorithm: string): HashObject {
        return new FakeHash(algorithm);
    }

    async readFile(path: string): Promise<Buffer> {
        const text = this.#filesystem[path];
        if (typeof text !== 'string') {
            throw new Error(`The file "${path}" doesn't exists`);
        }

        return Buffer.from(text, 'utf-8');
    }

    styleText(format: StyleFormat[], input: string): string {
        switch (format[0]) {
            case 'greenBright': {
                return `<${input}>`;
            }

            default: {
                throw new Error(`Invalid "${format[0]}" format`);
            }
        }
    }
}

const targetSettings: TargetSettings = {
    name: 'caca',
    json: {
        hashes: [
            {
                algorithm: 'perreooo',
                hash: 'FakeHash({ algorithm="perreooo"; content="lib/xxx" });'
            },
            {
                algorithm: 'ijoeputa',
                hash: 'FakeHash({ algorithm="ijoeputa"; content="lib/ñee" });'
            }
        ]
    }
};

const nodePackage: NodePackage = {
    path: '/path/to/project/package.json'
}

test('Hash validation: Package isn\'t infected', async (t: test.TestContext) => {
    const inject = new Inject({
        '/path/to/project/src/foo.ts': 'foo',
        '/path/to/project/src/bar.ts': 'bar',
        '/path/to/project/src/baz.ts': 'baz',
        '/path/to/project/src/lib/foo.ts': 'lib/foo',
        '/path/to/project/src/lib/bar.ts': 'lib/bar',
        '/path/to/project/src/lib/baz.ts': 'lib/baz'
    });

    try {
        await validateHashes(targetSettings, nodePackage, inject);

    } catch (error: any) {
        t.assert.fail(error);
    }
});

test('Hash validation: Package has been infected', async (t: test.TestContext) => {
    const inject = new Inject({
        '/path/to/project/src/foo.ts': 'foo',
        '/path/to/project/src/bar.ts': 'bar',
        '/path/to/project/src/baz.ts': 'baz',
        '/path/to/project/src/lib/foo.ts': 'lib/foo',
        '/path/to/project/src/lib/bar.ts': 'lib/ñee',
        '/path/to/project/src/lib/baz.ts': 'lib/baz'
    });

    try {
        await validateHashes(targetSettings, nodePackage, inject);
        t.assert.fail('This test must throws an `MaliciousHashError` instance');
        
    } catch (error: any) {
        t.assert.ok(error instanceof MaliciousHashError);
        t.assert.strictEqual(
            error?.message,
            [
                `Malicious <"caca"> malware hash has found.`,
                `☢️ At file <"/path/to/project/src/lib/bar.ts">;`,
                `☢️ with hash <"FakeHash({ algorithm="ijoeputa"; content="lib/ñee" });">;`,
                `☢️ with algorithm <"ijoeputa">.`
            ].join('\n')
        );
    }
});