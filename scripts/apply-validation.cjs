const fs = require('fs');
let code = fs.readFileSync('scripts/setup-agent.mjs', 'utf8');

code = "import { validateConfig } from './schema.mjs';\n" + code;
code = code.replace(/fs\.writeFileSync\(configPath,\s*JSON\.stringify\(currentConfig,\s*null,\s*2\),\s*'utf-8'\);/g, "fs.writeFileSync(configPath, JSON.stringify(validateConfig(currentConfig), null, 2), 'utf-8');");
code = code.replace(/fs\.writeFileSync\(configPath,\s*JSON\.stringify\(parsedConfig,\s*null,\s*2\),\s*'utf-8'\);/g, "fs.writeFileSync(configPath, JSON.stringify(validateConfig(parsedConfig), null, 2), 'utf-8');");

fs.writeFileSync('scripts/setup-agent.mjs', code);
console.log('Done!');
