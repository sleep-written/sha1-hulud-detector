import type { LoadSettingsInject, TargetSettings } from './interfaces/index.ts';

import { glob, readFile } from 'fs/promises';
import { parse, resolve } from 'path';

export async function getSettings(inject?: LoadSettingsInject): Promise<TargetSettings[]> {
    const injected: Required<LoadSettingsInject> = {
        meta:       inject?.meta                    ?? import.meta,
        glob:       inject?.glob?.bind(inject)      ?? glob,
        readFile:   inject?.readFile?.bind(inject)  ?? readFile,
    };

    const cwd = resolve(
        injected.meta.dirname,
        '../../../targets'
    );

    const dirents = injected.glob('*.json', {
        withFileTypes: true,
        cwd
    });

    return Array.fromAsync(dirents, async x => {
        const path = resolve(x.parentPath, x.name);
        const name = parse(path).name;
        const text = await injected.readFile(path, 'utf-8');
        const json = JSON.parse(text);
        return { name, json };
    });
}