import {readFileSync,writeFileSync} from 'node:fs';
writeFileSync(new URL('../src/dashboard.js',import.meta.url),'export default '+JSON.stringify(readFileSync(new URL('../ui/dashboard.html',import.meta.url),'utf8'))+';\n');
writeFileSync(new URL('../src/portal.js',import.meta.url),'export default '+JSON.stringify(readFileSync(new URL('../ui/portal.html',import.meta.url),'utf8'))+';\n');
writeFileSync(new URL('../src/guide.js',import.meta.url),'export default '+JSON.stringify(readFileSync(new URL('../ui/guide.html',import.meta.url),'utf8'))+';\n');
writeFileSync(new URL('../src/tools-ui.js',import.meta.url),'export default '+JSON.stringify(readFileSync(new URL('../ui/tools.html',import.meta.url),'utf8'))+';\n');
