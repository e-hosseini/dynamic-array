import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs',
    },
    {
      file: 'dist/bundle.esm.js',
      format: 'esm',
    },
    {
      file: 'dist/bundle.umd.js',
      format: 'umd',
      name: 'MyPackage',
    },
  ],
  plugins: [typescript(), resolve(), commonjs()],
};
