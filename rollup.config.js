import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

// External dependencies that should not be bundled
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  'graphql/language',
  'graphql/execution',
  'graphql/type',
  'graphql/validation',
  'graphql/error',
  'graphql/utilities',
];

// Base config for shared settings
const baseConfig = {
  input: 'src/index.ts',
  external,
  plugins: [
    resolve(),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
  ],
};

export default [
  // ESM build
  {
    ...baseConfig,
    output: {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
    },
  },
  // ESM minified build
  {
    ...baseConfig,
    output: {
      file: pkg.module.replace('.js', '.min.js'),
      format: 'esm',
      sourcemap: true,
      plugins: [terser()],
    },
  },
  // CommonJS build
  {
    ...baseConfig,
    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
  },
  // CommonJS minified build
  {
    ...baseConfig,
    output: {
      file: pkg.main.replace('.js', '.min.js'),
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      plugins: [terser()],
    },
  },
];