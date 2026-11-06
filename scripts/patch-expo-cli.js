const fs = require('fs');
const path = require('path');

function patchFile(filePath, target, replacement) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(replacement)) return; // Already patched
  if (content.includes(target)) {
    fs.writeFileSync(filePath, content.replace(target, replacement));
    console.log(`[patch] Patched ${path.basename(filePath)}`);
  }
}

// 1. Patch ExpoGoManifestHandlerMiddleware.js to handle x-forwarded-proto 'exp' / 'exps'
const expoGoMiddleware = path.resolve(__dirname, '../node_modules/@expo/cli/build/src/start/server/middleware/ExpoGoManifestHandlerMiddleware.js');
patchFile(
  expoGoMiddleware,
  "protocol: req.headers['x-forwarded-proto']",
  "protocol: (req.headers['x-forwarded-proto'] === 'exp' ? 'http' : req.headers['x-forwarded-proto'] === 'exps' ? 'https' : req.headers['x-forwarded-proto'])"
);

// 2. Patch ManifestMiddleware.js to prevent null match on non-http protocols and ensure bundle uses http/https
const manifestMiddleware = path.resolve(__dirname, '../node_modules/@expo/cli/build/src/start/server/middleware/ManifestMiddleware.js');
patchFile(
  manifestMiddleware,
  "scheme: protocol ?? 'http',",
  "scheme: (protocol === 'https' || protocol === 'exps' || (hostname && hostname.endsWith('.exp.direct'))) ? 'https' : 'http',"
);
patchFile(
  manifestMiddleware,
  "return bundleUrl.match(/^https?:\\/\\/.*?\\/\\/)[0] + 'assets/' + path;",
  "const m = bundleUrl.match(/^(?:https?|exps?):\\/\\/.*?\\//); const b = m ? m[0].replace(/^exp:\\/\\//, 'http://').replace(/^exps:\\/\\//, 'https://') : 'http://localhost:8081/'; return b + 'assets/' + path;"
);
