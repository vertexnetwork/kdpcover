// Browser stub for Node built-ins that mupdf-wasm references behind a runtime
// `if (isNode)` guard (createRequire from "module", fs/path for file loading).
// The browser never executes those branches, but the bundler must still resolve
// the imports — this empty module satisfies that without pulling Node polyfills.
const stub = {};
export default stub;
