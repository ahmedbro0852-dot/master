import {readFileSync,writeFileSync} from 'node:fs';
writeFileSync(new URL('../src/dashboard.js',import.meta.url),'export default '+JSON.stringify(readFileSync(new URL('../ui/dashboard.html',import.meta.url),'utf8'))+';\n');
