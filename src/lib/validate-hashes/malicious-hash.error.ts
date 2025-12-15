import type { StyleFormat } from '#lib/interfaces/index.ts';
import { styleText } from 'node:util';

export class MaliciousHashError extends Error {
    #name: string;
    get name(): string {
        return this.#name;
    }

    #path: string;
    get path(): string {
        return this.#path;
    }

    #hash: string;
    get hash(): string {
        return this.#hash;
    }

    #algorithm: string;
    get algorithm(): string {
        return this.#algorithm;
    }

    constructor(
        context: {
            name: string;
            path: string;
            hash: string;
            algorithm: string;
        },
        options?: {
            cause?: unknown;
            styleText?: (
                format: StyleFormat[],
                input: string
            ) => string;
        }
    ) {
        const printString = (input: string) => (options?.styleText ?? styleText)(
            [ 'greenBright' ],
            `"${input}"`
        );

        super(
            [
                `Malicious ${printString(context.name)} malware hash has found.`,
                `☢️ At file ${printString(context.path)};`,
                `☢️ with hash ${printString(context.hash)};`,
                `☢️ with algorithm ${printString(context.algorithm)}.`
            ].join('\n'),
            options
        );

        this.#name = context.name;
        this.#path = context.path;
        this.#hash = context.hash;
        this.#algorithm = context.algorithm;
    }
}