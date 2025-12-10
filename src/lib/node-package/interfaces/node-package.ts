import type { NodePackageJSON } from './node-package-json.ts';

export interface NodePackage {
    path: string;
    json: NodePackageJSON;
}