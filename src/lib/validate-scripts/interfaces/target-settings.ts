export interface TargetSettings {
    name: string;
    json: {
        scripts?: Record<string, string[]>;
    };
}