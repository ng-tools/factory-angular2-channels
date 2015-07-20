'use strict';
/* eslint camelcase:0 */

//
// Required modules

var path = require('path');
var combine = require('stream-combiner2');
var vfs = require('vinyl-fs');
var gulpif = require('gulp-if');
var concat = require('gulp-concat-util');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var _ = require('lodash');
var through = require('through2');

var Builder = require('systemjs-builder');

module.exports = function(paths) {
  paths = paths ? _.defaults(paths, this.paths) : this.paths;
  var pkg = this.pkg;
  var useSourcemaps = this.sourcemaps !== false;

var builder = new Builder({
  baseURL: paths.tmp,
  defaultJSExtensions: true,
  paths: {
    "angular2/*": "./node_modules/angular2/es6/prod/*.js",
    "rx": "./node_modules/angular2/node_modules/rx/dist/rx.js",
    "traceur": "./node_modules/angular2/node_modules/traceur/bin/traceur.js"
  },
  meta: {
    'rx': {
      format: 'cjs'
    }
  }
  // transpiler: require('babel-core')
})
// return through.obj(function(file, encoding, next) {
//   builder.build(file.path, paths.dest).then(d).catch(dd);
// });
  return combine.obj(
    gulpif(useSourcemaps, sourcemaps.init()),
    require('./base').bind(this)(),
    through.obj(function(file, encoding, next) {
      next(null);
    }, function(next) {
      builder.build('app.js', path.join(paths.dest, 'app.js')).then(d).catch(dd);
    })
  );


  return combine.obj(
    gulpif(useSourcemaps, sourcemaps.init()),
    require('./base').bind(this)(),
    gulpif(/^app/.test(this.type), concat.scripts(paths.cwd + '.js', {cwd: paths.cwd, base: paths.cwd})),
    // gulpif(/^com/.test(this.type), concat.scripts((this.name || pkg.name) + '.js', {cwd: paths.cwd, base: paths.cwd})),
    // gulpif(/^lib/.test(this.type), combine.obj(
    //   concat.scripts((this.name || pkg.name) + '.js', {cwd: paths.cwd, base: paths.cwd, passthrough: true}),
    //   rename(function(file) { if(file.dirname !== '.') file.dirname = 'modules'; })
    // )),
    uglify({output: {beautify: true, indent_level: 2, quote_style: 1}, mangle: false, compress: false}),
    concat.header(this.banner),
    vfs.dest(paths.dest),
    gulpif(this.usemin !== false, uglify({output: {indent_level: 2, quote_style: 1}})),
    concat.header(this.banner),
    rename(function(file) { file.extname = '.min.js'; }),
    gulpif(useSourcemaps, sourcemaps.write('.')),
    vfs.dest(paths.dest)
  );
};
