export interface HashObject {
    update(input: Buffer): HashObject;
    digest(encoding: BufferEncoding): string;
}