import type { NodePackage, SearchPackagesInject } from './interfaces/index.ts';

import { isAbsolute, resolve, sep } from 'path';
import { glob, readFile } from 'fs/promises';
import { homedir } from 'os';

export async function *getNodePackages(
    entrypoint: string,
    inject?: SearchPackagesInject
): AsyncIterable<NodePackage> {
    const injected: Required<SearchPackagesInject> = {
        process:    inject?.process ?? process,
        console:    inject?.console ?? console,

        readFile:   inject?.readFile?.bind(inject)  ?? readFile,
        homedir:    inject?.homedir?.bind(inject)   ?? homedir,
        glob:       inject?.glob?.bind(inject)      ?? glob
    };

    if (entrypoint === '~') {
        entrypoint = injected.homedir();

    } else if (entrypoint.startsWith(`~${sep}`)) {
        entrypoint = resolve(
            injected.homedir(),
            entrypoint.slice(2)
        );

    } else if (!isAbsolute(entrypoint)) {
        entrypoint = resolve(
            injected.process.cwd(),
            entrypoint
        );

    }

    const dirents = injected.glob('**/package.json', {
        cwd: entrypoint,
        withFileTypes: true
    });

    for await (const dirent of dirents) {
        const path = resolve(dirent.parentPath, dirent.name);
        const text = await injected.readFile(path, 'utf-8');
        
        try {
            const json = JSON.parse(text);
            yield { path, json };
        } catch {
            injected.console.warn(`The file "${path}" isn't a valid JSON file`);
        }
    }
}