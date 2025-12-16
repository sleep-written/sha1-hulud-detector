import { parseArgs } from 'node:util';

const resp = parseArgs({
    options: {
        watch: {
            type: 'boolean',
            default: false,
            short: 'w'
        }
    },
    allowPositionals: true,
    allowNegative: true
});

console.log(resp);