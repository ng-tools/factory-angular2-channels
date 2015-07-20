'use strict';
/*eslint camelcase:0*/

//
// Required modules

var path = require('path');
var combine = require('stream-combiner2');
var gulpif = require('gulp-if');
var vfs = require('vinyl-fs');
var jade = require('gulp-jade');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var concat = require('gulp-concat-util');
var rename = require('gulp-rename');
var _ = require('lodash');

module.exports = function(paths) {
  paths = paths ? _.defaults(paths, this.paths) : this.paths;
  var config = this, pkg = this.pkg;

  return combine.obj(
    require('./base').bind(this)(),
    // htmlmin({removeComments: true, collapseWhitespace: true}),
    // ngtemplate({module: function(fileName) {
    //   if(!/^lib/.test(config.type)) return config.module;
    //   var dirname = path.dirname(fileName);
    //   return dirname ? config.module + '.' + dirname : config.module;
    // }}),
    // ngAnnotate(),
    // gulpif(/^app/.test(this.type), concat.scripts('views.tpl.js', {cwd: path.join(paths.cwd, 'scripts'), base: paths.cwd})),
    // gulpif(/^com/.test(this.type), concat.scripts((this.name || pkg.name) + '.tpl.js', {cwd: paths.cwd})),
    // gulpif(/^lib/.test(this.type), combine.obj(
    //   concat.scripts((this.name || pkg.name) + '.tpl.js', {cwd: paths.cwd, base: paths.cwd, passthrough: true}),
    //   rename(function(file) { if(file.dirname !== '.') file.dirname = 'modules'; })
    // )),
    // uglify({output: {beautify: true, indent_level: 2, quote_style: 1}, mangle: false, compress: false}),
    // concat.header(this.banner),
    // vfs.dest(paths.dest),
    // gulpif(this.usemin !== false, uglify({output: {indent_level: 2, quote_style: 1}})),
    // rename(function(file) { file.extname = '.min.js'; }),
    // concat.header(this.banner),
    vfs.dest(paths.dest)
  );
};

