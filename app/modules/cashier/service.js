var _ = require('lodash');
var config = require('../../config');
var whost = config.whost;
var request = require('../../support').request2;

/**
 * 获取订单信息
 * @return promise
 */
exports.getOrder = function (context,userId, orderId) {
  return request(context, {
    url: whost + '/s5x-web/api/json/order/getOrder',
    data: {
      userId: userId,
      orderCode: orderId
    }
  });
};

// 支付宝支付
exports.alipay = function (context, orderCode) {
  // var whost = "http://localhost:8181";
  return request(context, {
    url: whost + '/s5x-web/api/json/pay/prepay',
    data: {
      orderCode: orderCode,
    },
  });
};
