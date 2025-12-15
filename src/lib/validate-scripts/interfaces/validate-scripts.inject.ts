import type { StyleFormat } from '#lib/interfaces/index.ts';

export interface ValidateScriptsInject {
    styleText?(
        format: StyleFormat[],
        input: string
    ): string;
}