'use strict';
var gutil = require('gulp-util'),
  through = require('through2'),
  path = require('path'),
  md5 = require('MD5'),
  UPYUN = require('upyun'),
  mime = require('mime'),
  fs = require('fs');

module.exports = function(bucket, username, userpass, pathSplit, overWrite) {
  var upyun = new UPYUN(bucket, username, userpass, 'v0', 'legacy');
  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }
    if (file.isStream()) {
      cb(new gutil.PluginError('gulp-mp-upai-upload', 'Streaming not supported'));
      return;
    }
    var remoteName = file.path.split(pathSplit)[1];
    remoteName = '/' + pathSplit + remoteName.replace(/\\/g, '/');

    upyun.existsFile(remoteName, function(err, result) {
      if(err) {
        throw err;
      }
      if (overWrite || result.statusCode !== 200) {
        upyun.uploadFile(remoteName,
          file.path,
          mime.lookup(file.path),
          true, function(err, result) {
            if (err) {
              throw err;
            } else {
              if (result.statusCode === 200) {
                console.log("upload success " + remoteName);
                cb();
              } else {
                console.log(remoteName);
                throw result;
              }
            }
          });
      } else {
        cb();
      }
    });
  });
}