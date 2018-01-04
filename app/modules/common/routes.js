var fs = require('fs');
var _ = require('lodash');
var Router = require('koa-router');
var router = module.exports = new Router();
var config = require('../../config');
// var storage = require('../../support/storage');
var service = require('./service');
var service2 = require('./service');
// var translator = require('../../support/translator');
var logger = require('../../support/logger');

// json 上传图片
router.post('/common/upload', function * (next) {
  logger.info('-------------/common/upload:start');
  var self = this;
  try {
    var list = [];

    for (var name in this.request.body.files) {
      if (this.request.body.files.hasOwnProperty(name)) {
        var files = this.request.body.files[name];
        files = files.constructor === Array ? files : [files];
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          try {
            if (file.size) {
              var path = yield service.uploadImage(file.name,file.path);
              list.push({
                name: name,
                path: path
              });
            }
          }
          // 移除本地缓存文件
          finally {
            fs.unlink(file.path); 
          }
        }
      }
    }

    this.body = this.render(200, {
      list: list
    });
  }
  catch (e) {
    this.body = this.render(400, e);
  }
});

// 异常跳转
router.get('/error', function * (next) {
  this.body = this.render('templates/error.html', this.query);
});
