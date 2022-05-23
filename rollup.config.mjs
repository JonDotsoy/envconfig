// rollup.config.js
/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: `./index.mjs`,
  output: {
    file: `index.js`,
    format: 'cjs',
  }
};

export default config;