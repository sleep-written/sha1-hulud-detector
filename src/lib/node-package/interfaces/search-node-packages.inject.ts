import type { DirentObject } from './dirent.object.ts';

export interface SearchPackagesInject {
    process?: {
        cwd(): string;
    };

    console?: {
        warn(...args: unknown[]): void;
    };

    readFile?(
        path: string,
        encoding: BufferEncoding
    ): Promise<string>;

    homedir?(): string;

    glob?(
        pattern: string | string[],
        options: {
            cwd?: string;
            withFileTypes: true;
        }
    ): AsyncIterable<DirentObject>;
}