import copy from 'rollup-plugin-copy'
import del from 'rollup-plugin-delete'
import { terser } from "rollup-plugin-terser";

export default {
  input: ['src/js/contentScript/content.js'],
  output: {
    format: 'esm',
    dir: 'dist'
  },
  plugins: [
    del({ targets: 'dist/*' }),
    // terser({
    //   module: true
    // }),
    copy({
      targets: [
        { src: 'src/assets', dest: 'dist' },
        { src: 'src/js', dest: 'dist' },
        { src: 'src/css', dest: 'dist' },
        { src: 'src/options.html', dest: 'dist' },
        { src: 'src/pohtmlpup.', dest: 'dist' },
        { src: 'src/manifest.json', 
          dest: 'dist', 
          transform: (contents) => {
            return Buffer.from(JSON.stringify({
              version: process.env.npm_package_version,
              ...JSON.parse(contents.toString())
            }))
          }
        }
      ]
    })
  ]
};