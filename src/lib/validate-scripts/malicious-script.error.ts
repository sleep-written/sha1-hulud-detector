import type { StyleTextFunction } from '#lib/interfaces/index.ts';

import { styleText } from 'node:util';

export class MaliciousScriptError extends Error {
    #name: string;
    get name(): string {
        return this.#name;
    }

    #path: string;
    get path(): string {
        return this.#path;
    }

    #scriptName: string;
    get scriptName(): string {
        return this.#scriptName;
    }

    #scriptValue: string;
    get scriptValue(): string {
        return this.#scriptValue;
    }

    constructor(
        context: {
            name:           string;
            path:           string;
            scriptName:     string;
            scriptValue:    string;
            matchedValue:   string;
        },
        options?: {
            cause?: unknown;
            styleText?: StyleTextFunction
        }
    ) {
        const printString = (input: string) => (options?.styleText ?? styleText)(
            [ 'greenBright' ],
            `"${input}"`
        );

        super(
            [
                `Malicious ${printString(context.name)} malware script has found.`,
                `☢️ At package ${printString(context.path)};`,
                `☢️ for script ${printString(context.scriptName)};`,
                `☢️ with value ${printString(context.matchedValue)}.`
            ].join('\n'),
            options
        );

        this.#name = context.name;
        this.#path = context.path;
        this.#scriptName = context.scriptName;
        this.#scriptValue = context.scriptValue;
    }
}