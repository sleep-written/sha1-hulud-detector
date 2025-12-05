import { getNodePackages } from '#lib/node-package/index.ts';

const entrypoint = process.argv[2] ?? process.cwd();
for await (const nodePackage of getNodePackages(entrypoint)) {
    console.log(nodePackage);
    console.log();
}
