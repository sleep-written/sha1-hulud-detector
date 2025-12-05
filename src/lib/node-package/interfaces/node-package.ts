import type { PackageJSON } from './package-json.ts';

export interface NodePackage {
    path: string;
    json: PackageJSON;
}