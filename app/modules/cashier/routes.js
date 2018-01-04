var Router = require('koa-router');
var router = module.exports = new Router();
var service = require('./service');
var logger = require('../../support/logger');

router.get('/cashier/payment', function * (next) {
  var payMethod = {
    name: '支付宝',
    defaultFlag: 1,
    icon: 'http://www.shang5xing.com/s5x_img/alipay.png',
  }
  var payMethods = [];
  payMethods.push(payMethod);

  var data = yield {
    payMethods: payMethods,
    // service.support(this, this.session.member.memberId, business, this.query.code),
    order: service.getOrder(this, '', this.query.code),
    weixin: this.ua.weixin,
  };

  this.body = this.render('templates/cashier.html', data, data.order);
});

// 支付宝支付接口
router.get('/cashier/alipay2/:code', function * (next) {
  yield service.alipay(this, this.params.code).then(function (data) {
    // self.body = self.render(200, data);
    this.body =  this.render('templates/alipay.html', data);
  }, function (data) {
    self.body = self.render(500, data);
  });
});

// 确认订单 - 列举收货人
router.get('/cashier/alipay/:code', function * (next) {
    var data = yield service.alipay(this, this.params.code);
    this.body = this.render('templates/alipay.html', data);
  // }
});

// 支付宝支付接口
router.get('/cashier/ajax/alipay', function * (next) {
  // var self = this;
  yield service.alipay(this, this.query.code).then(function (data) {
    // self.body = self.render(200, data);
    this.body =  this.render('templates/alipay.html', data);
  }, function (data) {
    self.body = self.render(500, data);
  });
});

// 支付成功
router.get('/cashier/success', loginRequired, function * (next) {
  var data = yield service.getOrder(this, this.session.member.userId, this.query.code);
  this.body = this.render('templates/success.html', data);
});

// 支付失败
router.get('/cashier/failure', loginRequired, function * (next) {
  var data = yield service.getOrder(this, this.query.code);
  this.body = this.render('templates/failure.html', data, {
    business: business,
  });
});
