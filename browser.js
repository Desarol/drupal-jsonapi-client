const fs = require('fs')
const path = require('path')
// eslint-disable-next-line import/no-extraneous-dependencies
const browserify = require('browserify')

browserify(path.join(__dirname, './src/Browser.js'), { standalone: 'DrupalJsonApi' })
  .transform('babelify', {
    presets: [
      ['@babel/preset-env', { targets: { browsers: '> 1%, not IE 9' } }],
    ],
    plugins: [
      '@babel/plugin-proposal-class-properties',
    ],
  })
  .bundle()
  .pipe(fs.createWriteStream(path.join(__dirname, './lib/Browser.js')))
