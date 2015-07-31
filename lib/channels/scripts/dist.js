'use strict';
/* eslint camelcase:0 */

//
// Required modules

var path = require('path');
var combine = require('stream-combiner2');
var vfs = require('vinyl-fs');
var gulpif = require('gulp-if');
// var concat = require('gulp-concat-util');
var rename = require('gulp-rename');
// var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var _ = require('lodash');
var through = require('through2');
var File = require('vinyl');
var log = require('./../../utils/log');
var chalk = require('chalk');


module.exports = function(paths) {
  paths = paths ? _.defaults(paths, this.paths) : this.paths;
  var useSourcemaps = this.sourcemaps !== false;

  var buildFilePath = 'app.js';
  var buildConfig = {minify: true, sourceMaps: true};
  log('Building \'' + chalk.cyan('app') + '\' into ' + chalk.magenta(buildFilePath) + '...');

  var started = Date.now();
  var Builder = require('systemjs-builder');
  var builder = new Builder({
    baseURL: paths.tmp,
    defaultJSExtensions: true,
    paths: {
      'angular2/*': './node_modules/angular2/es6/prod/*.js',
      'rx': './node_modules/angular2/node_modules/rx/dist/rx.js'
    },
    meta: {
      'rx': {
        format: 'cjs'
      }
    }
    // transpiler: require('gulp-babel').babel,
    // optional: ['es7.decorators'], plugins: [require('babel-plugin-angular2-annotations'), require('babel-plugin-flow-comments')]
  });

  return combine.obj(
    gulpif(useSourcemaps, sourcemaps.init()),
    require('./base').bind(this)(),
    vfs.dest(paths.tmp),
    through.obj(function(file, encoding, next) {
      next(null);
    }, function(next) {
      var stream = this;
      builder.build('app - [angular2/**/*] - rx', buildConfig).then(function(output) {
        log('Built \'' + chalk.cyan('app') + '\' into ' + chalk.magenta(buildFilePath) + ' after ' + chalk.magenta(Math.ceil((Date.now() - started) / 1000) + ' s'));
        stream.push(new File({
          path: buildFilePath,
          contents: new Buffer(output.source)
        }));
        output.sourceMap && stream.push(new File({
          path: buildFilePath + '.map',
          contents: new Buffer(output.sourceMap)
        }));
        next(null);
      }).catch(next);
    }),
    vfs.dest(paths.dest)
  );

  // return combine.obj(
  //   gulpif(useSourcemaps, sourcemaps.init()),
  //   require('./base').bind(this)(),
  //   gulpif(/^app/.test(this.type), concat.scripts(paths.cwd + '.js', {cwd: paths.cwd, base: paths.cwd})),
  //   // gulpif(/^com/.test(this.type), concat.scripts((this.name || pkg.name) + '.js', {cwd: paths.cwd, base: paths.cwd})),
  //   // gulpif(/^lib/.test(this.type), combine.obj(
  //   //   concat.scripts((this.name || pkg.name) + '.js', {cwd: paths.cwd, base: paths.cwd, passthrough: true}),
  //   //   rename(function(file) { if(file.dirname !== '.') file.dirname = 'modules'; })
  //   // )),
  //   uglify({output: {beautify: true, indent_level: 2, quote_style: 1}, mangle: false, compress: false}),
  //   concat.header(this.banner),
  //   vfs.dest(paths.dest),
  //   gulpif(this.usemin !== false, uglify({output: {indent_level: 2, quote_style: 1}})),
  //   concat.header(this.banner),
  //   rename(function(file) { file.extname = '.min.js'; }),
  //   gulpif(useSourcemaps, sourcemaps.write('.')),
  //   vfs.dest(paths.dest)
  // );
};
