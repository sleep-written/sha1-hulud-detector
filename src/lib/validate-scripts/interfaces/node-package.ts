export interface NodePackage {
    path: string;
    json: {
        scripts?: Record<string, string>;
    };
}