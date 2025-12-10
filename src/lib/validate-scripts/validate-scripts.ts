import type { NodePackage, TargetSettings, ValidateScriptsInject } from './interfaces/index.ts';

import { MaliciousScriptError } from './malicious-script.error.ts';
import { styleText } from 'node:util';

export function validateScripts(
    targetSettings: TargetSettings,
    nodePackage: NodePackage,
    inject?: ValidateScriptsInject
): void {
    const injected: Required<ValidateScriptsInject> = {
        styleText:  inject?.styleText?.bind(inject) ?? styleText
    };

    const { name, json: { scripts } } = targetSettings;
    const { path, json } = nodePackage;

    for (const [ scriptName, scriptPatterns ] of Object.entries(scripts ?? {})) {
        const scriptValue = json.scripts?.[scriptName];
        if (typeof scriptValue !== 'string' || scriptPatterns.length === 0) {
            continue;
        }

        // Soy un maldito paranoico con los que no usan TS
        if (!Array.isArray(scriptPatterns)) {
            throw new Error('For every script value must be a type of `string[]`');
        }

        const scriptPattern = scriptPatterns
            .map((x, i) => {
                if (!x || typeof x !== 'string') {
                    throw new Error(
                        `The script pattern in "scripts"."${scriptName}"[${i}] must be a non-empty string`
                    );
                }

                return x;
            })
            .join('|');

        let scriptRegExp: RegExp;
        try {
            scriptRegExp = scriptPatterns.length > 1
            ?   new RegExp(`(${scriptPattern})`, 'giu')
            :   new RegExp(scriptPattern, 'giu');
        } catch (cause) {
            throw new Error(`Invalid RegExp string pattern at "scripts"."${scriptName}"`, { cause });
        }

        const matchedValue = scriptValue.replace(
            scriptRegExp,
            matched => injected.styleText(
                [ 'redBright', 'inverse' ],
                matched
            )
        );

        if (scriptValue !== matchedValue) {
            throw new MaliciousScriptError(
                {
                    name,
                    path,
                    scriptName,
                    scriptValue,
                    matchedValue
                },
                injected
            );
        }
    }
}