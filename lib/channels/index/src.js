'use strict';

//
// Required modules

var path = require('path');
var combine = require('stream-combiner2');
var vfs = require('vinyl-fs');
var inject = require('gulp-inject');
var bowerFiles = require('main-bower-files');
var gulpif = require('gulp-if');
var match = require('gulp-match');
var merge = require('merge2');
var sort = require('sort-stream');
var _ = require('lodash');

module.exports = function(paths) {

  paths = paths ? _.defaults(paths, this.paths) : this.paths;
  var self = this, pkg = this.pkg, bower = this.bower;

  function bowerFilter(fileName) {
    fileName = fileName.replace(paths.cwd, '');
    // if((new RegExp('/' + config.pkg.name + '/')).test(fileName)) return false;
    if(bower.exclude && bower.exclude.test(fileName)) return false;
    if(bower.filter && !bower.filter.test(fileName)) return false;
    return true;
  }

  var bowerDirectory = paths.bowerDirectory || path.join(this.cwd, paths.cwd, 'bower_components');
  var bowerJson = paths.bowerJson || path.join(this.cwd, 'bower.json');

  return combine.obj(
    inject(
      merge(
        vfs.src(bowerFiles({filter: bowerFilter, paths: {bowerDirectory: bowerDirectory, bowerJson: bowerJson}}), {cwd: paths.cwd, read: false}),
        vfs.src(bower.include || '[^.]', {cwd: paths.cwd, read: false})
      ).pipe(gulpif(bower.include, sort(function(a, b) {
        if(bower.include.indexOf(path.relative(a.cwd, a.path))) return -1;
        else if(bower.include.indexOf(path.relative(b.cwd, b.path))) return 1;
        return 0;
      }))),
      {name: 'bower', addRootSlash: false}
    ),
    gulpif(false, inject(
      vfs.src(paths.scripts, {cwd: paths.cwd, base: self.jsPreprocessor === 'typescript' ? undefined : paths.cwd})
        .pipe(require('./../scripts/src').bind(this)()),
      {ignorePath: paths.tmp, addRootSlash: false}
    )),
    inject(
      vfs.src(paths.styles, {cwd: paths.cwd, base: paths.cwd})
        .pipe(require('./../styles/src').bind(this)()),
      {ignorePath: paths.tmp, addRootSlash: false}
    ),
    require('./../views/base').bind(this)(),
    vfs.dest(paths.tmp)
  );
};
