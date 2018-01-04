var _ = require('lodash');
var compose = require('koa-compose');
var accountService = require('../modules/account/service');
var commonService = require('../modules/common/service');
// var locationService = require('../modules/location/service');
var config = require('./index');
var request = require('../support').request2;

/**
 * 禁用缓存拦截器
 */
global.cacheDisabled = function * (next) {
  this.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  this.set('Pragma', 'no-cache');
  this.set('Expires', 0);
  yield next;
};

/**
 * 设置全局登录拦截器
 */
global.loginRequired = function * (next) {
  if (this.session.member) {
    yield next;
  }
  // AJAX未登录
  else if (this.request.isAjax) {
    this.body = this.template.render(403, '请先登录');
  }
  else {
    if (this.request.method === 'GET') {
      this.redirect('/account/login?next=' + encodeURIComponent(this.request.url));
    }
    else {
      this.redirect('/account/login?next=' + encodeURIComponent(this.headers.referer || '/home'));
    }
  }
};