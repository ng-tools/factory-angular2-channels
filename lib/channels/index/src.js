'use strict';

//
// Required modules

var combine = require('stream-combiner2');
var vfs = require('vinyl-fs');
var inject = require('gulp-inject');
var merge = require('merge2');
var _ = require('lodash');
var gulpif = require('gulp-if');

module.exports = function(paths) {

  paths = paths ? _.defaults(paths, this.paths) : this.paths;
  var self = this, pkg = this.pkg, bower = this.bower;

  return combine.obj(
    inject(
      require('./helpers/bower').bind(this)(),
      {name: 'bower', addRootSlash: false}
    ),
    inject(
      require('./helpers/angular').bind(this)(paths, {minify: false, sourceMaps: true})
        .pipe(vfs.dest(paths.tmp)),
      {name: 'angular', ignorePath: paths.tmp, addRootSlash: false}
    ),
    inject(
      vfs.src(paths.styles, {cwd: paths.cwd, base: paths.cwd})
        .pipe(require('./../styles/src').bind(this)()),
      {ignorePath: paths.tmp, addRootSlash: false}
    ),
    gulpif(false, inject(
      vfs.src(paths.scripts, {cwd: paths.cwd, base: paths.cwd})
        .pipe(require('./../scripts/src').bind(this)()),
      {ignorePath: paths.tmp, addRootSlash: false}
    )),
    require('./../views/base').bind(this)(),
    vfs.dest(paths.tmp)
  );

};
