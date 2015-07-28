'use strict';

//
// Required modules

var combine = require('stream-combiner2');
var vfs = require('vinyl-fs');
var gulpif = require('gulp-if');
var inject = require('gulp-inject');
var _ = require('lodash');
var size = require('gulp-size');

module.exports = function(paths) {

  paths = paths ? _.defaults(paths, this.paths) : this.paths;

  return combine.obj(
    inject(
      require('./helpers/bower').bind(this)(paths, {minify: true})
        .pipe(require('./helpers/libs').bind(this)()),
      {name: 'bower', ignorePath: paths.dest, addRootSlash: false, transform: addUrlSupport}
    ),
    inject(
      require('./helpers/angular').bind(this)(paths, {minify: true, sourceMaps: true})
        .pipe(size({showFiles: true, gzip: true}))
        .pipe(vfs.dest(paths.dest)),
      {name: 'angular', ignorePath: paths.dest, addRootSlash: false}
    ),
    inject(
      vfs.src(paths.views, {cwd: paths.cwd, base: paths.cwd})
        .pipe(require('./../views/dist').bind(this)()),
      {name: 'views', ignorePath: paths.dest, addRootSlash: false}
    ),
    // Hack to prevent injection while still running the task in the current pipeline
    gulpif(false, inject(
      vfs.src(paths.scripts, {cwd: paths.cwd, base: paths.cwd})
        .pipe(require('./../scripts/dist').bind(this)())
        .pipe(size({showFiles: true, gzip: true})),
      {ignorePath: paths.dest, addRootSlash: false}
    )),
    inject(
      vfs.src(paths.styles, {cwd: paths.cwd, base: paths.cwd})
        .pipe(require('./../styles/dist').bind(this)()),
      {ignorePath: paths.dest, addRootSlash: false}
    ),
    require('./../views/base').bind(this)(),
    vfs.dest(paths.dest)
  );

};

function addUrlSupport(filePath) {
  // Support jsdelivr files pulled from `libs` transform
  var args = Array.prototype.slice.call(arguments);
  if (/cdn\.jsdelivr\.net/.test(filePath)) {
    args[0] = '//' + args[0];
  }
  return inject.transform.apply(inject.transform, args);
}
