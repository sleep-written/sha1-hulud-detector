import type { NodePackage, TargetSettings, ValidateHashesInject } from './interfaces/index.ts';

import { MaliciousHashError } from './malicious-hash.error.ts';
import { dirname, resolve } from 'node:path';
import { glob, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { styleText } from 'node:util';

export async function validateHashes(
    targetSettings: TargetSettings,
    nodePackage: NodePackage,
    inject?: ValidateHashesInject
): Promise<void> {
    const { name, json } = targetSettings;
    if (!Array.isArray(json.hashes)) {
        return;
    }

    const hashesCollection = new Map<string, Set<string>>();
    for (const { algorithm, hash } of json.hashes) {
        const set = hashesCollection.get(algorithm) ?? new Set<string>();
        set.add(hash);

        if (!hashesCollection.has(algorithm)) {
            hashesCollection.set(algorithm, set);
        }
    }

    const injected: Required<ValidateHashesInject> = {
        createHash: inject?.createHash?.bind(inject)    ?? createHash,
        styleText:  inject?.styleText?.bind(inject)     ?? styleText,
        readFile:   inject?.readFile?.bind(inject)      ?? readFile,
        glob:       inject?.glob?.bind(inject)          ?? glob,
    };

    const dirents = injected.glob(
        [
            '**/*.{ts,tsx,mts,mtsx}',
            '**/*.{js,jsx,mjs,mjsx}',
        ],
        {
            cwd: dirname(nodePackage.path),
            exclude: [ 'node_modules/**' ],
            withFileTypes: true
        }
    );

    for await (const dirent of dirents) {
        if (!dirent.isFile()) {
            continue;
        }

        const path = resolve(dirent.parentPath, dirent.name);
        const data = await injected.readFile(path);

        for (const [ algorithm, hashes ] of hashesCollection) {
            const hash = injected
                .createHash(algorithm)
                .update(data)
                .digest('hex');

            if (hashes.has(hash)) {
                throw new MaliciousHashError(
                    {
                        name,
                        path,
                        hash,
                        algorithm
                    },
                    inject
                );
            }
        }
    }
}