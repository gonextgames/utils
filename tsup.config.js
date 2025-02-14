import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.js'],
  format: ['cjs', 'esm'],
  dts: false,
  clean: true,
  minify: true,
  treeshake: true,
  injectStyle: true,
  esbuildOptions(options) {
    options.loader = {
      ...options.loader,
      '.css': 'css',
      '.js': 'jsx',
      '.jsx': 'jsx'
    }
  },
  external: [
    'react',
    'react-dom',
    '@aws-sdk/client-dynamodb',
    '@aws-sdk/lib-dynamodb',
    'axios',
    'bcryptjs',
    'jsonwebtoken',
    'next',
    'next-sitemap',
    'nodemailer',
    'openai',
    'react-youtube',
    '@aws-sdk/client-s3',
    'zustand'
  ],
  outDir: 'dist',
  sourcemap: true,
  platform: 'browser'
})