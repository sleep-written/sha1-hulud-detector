export interface NodePackageJSON {
    name?: string;
    type?: string;
    script?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
}