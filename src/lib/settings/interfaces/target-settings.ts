export interface TargetSettings {
    name: string;
    json: {
        scripts?: Record<
            string,
            string[]
        >;

        hashes?: {
            algorithm:  string;
            hash:       string;
        }[];
    };
}