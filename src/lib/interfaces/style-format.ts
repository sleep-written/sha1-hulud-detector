import type { styleText } from 'node:util';

/**
 * Esta brujería es para extraer "ForegroundColors | BackgroundColors | Modifiers",
 * ya que por alguna razón a los de Node se les ocurrió dejar privados esos tipos
 * en los *.d.ts muaajajaja váyanse a la mierda
 */
type ForceArray<T> = T extends (infer U)[] ? U : never;
export type StyleFormat = ForceArray<Parameters<typeof styleText>[0]>;