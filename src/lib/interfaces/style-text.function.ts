import type { StyleFormat } from './style-format.ts';

export type StyleTextFunction = (
    style: StyleFormat[],
    input: string
) => string;