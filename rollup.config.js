import pkg from './package.json';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

const plugins = [
  terser(),
  babel({ exclude: 'node_modules/**' }),
]

export default [
  {
    input: 'src/index.js',
    external: ['react'],
    output: [
      {
        name: pkg.name,
        file: pkg.browser,
        format: 'umd',
        globals: { 'react': 'React' },
      },
      { file: pkg.module, format: 'es' },
      { file: pkg.main, format: 'cjs' },
    ],
    plugins,
  },
  {
    input: 'src/factory.js',
    output: [
      { file: 'dist/factory.js', format: 'es' },
      { file: 'dist/factory.cjs.js', format: 'cjs' },
      { file: 'dist/factory.umd.js', format: 'umd', name: pkg.name },
    ],
    plugins,
  },
];
