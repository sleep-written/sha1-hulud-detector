import type { DirentObject } from '#lib/interfaces/index.ts';

export interface LoadSettingsInject {
    meta?: {
        dirname: string;
    };

    glob?(
        pattern: string | string[],
        options: {
            cwd?: string;
            exclude?: string[];
            withFileTypes: true;
        }
    ): AsyncIterable<DirentObject>;

    readFile?(
        path: string,
        encoding: BufferEncoding
    ): Promise<string>;
}