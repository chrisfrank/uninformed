//import resolve from 'rollup-plugin-node-resolve';
//import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

export default [
  // browser-friendly UMD build
  {
    input: 'src/index.js',
    output: {
      name: pkg.name,
      file: pkg.browser,
      format: 'umd'
    },
    plugins: [
      //resolve(), // so Rollup can find `ms`
      //commonjs() // so Rollup can convert `ms` to an ES module
      //terser(),
    ]
  },
    // CommonJS (for Node) and ES module (for bundlers) build.
    // (We could have three entries in the configuration array
    // instead of two, but it's quicker to generate multiple
    // builds from a single configuration where possible, using
    // an array for the `output` option, where we can specify 
    // `file` and `format` for each target)
  {
    input: 'src/index.js',
    //plugins: [terser()],
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ]
  },
  {
    input: 'src/uninformed.preact.js',
    external: ['preact'],
    output: [
      { file: 'dist/preact.js', format: 'cjs' },
      { file: 'dist/preact.mjs', format: 'es' },
    ]
  },
  {
    input: 'src/uninformed.react.js',
    external: ['react'],
    output: [
      { file: 'dist/react.js', format: 'cjs' },
      { file: 'dist/react.mjs', format: 'es' },
    ]
  },
];
