export interface TargetSettings {
    name: string;
    json: {
        hashes?: {
            algorithm: string;
            hash: string;
        }[];
    }
}