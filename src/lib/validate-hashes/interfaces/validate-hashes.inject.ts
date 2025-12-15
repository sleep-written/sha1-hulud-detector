import type { StyleFormat, DirentObject } from '#lib/interfaces/index.ts';
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

    styleText?(
        format: StyleFormat[],
        input: string
    ): string;
}