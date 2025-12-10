import type { StyleTextFunction } from '#lib/interfaces/index.ts';
import type { DirentObject } from './dirent.object.ts';
import type { HashObject } from './hash.object.ts';

export interface ValidateHashesInject {
    glob?(
        pattern: string | string[],
        options: {
            cwd?: string;
            exclude?: string[];
            withFileTypes: true;
        }
    ): AsyncIterable<DirentObject>;

    createHash?(
        algorithm: string
    ): HashObject;

    readFile?(
        path: string
    ): Promise<Buffer>;

    styleText?: StyleTextFunction;
}