var config = require('../../config');
var request = require('../../support').request2;


exports.themeList = function (context) {
  return request(context, {
    url: config.whost + '/s5x-web/api/json/theme/themeList',
    data: {
      typeId: 2,
      pageSize: 1000,
      pageNo: 1
    }
  });
};

exports.rollingList = function (context) {
  return request(context, {
    url: config.whost + '/s5x-web/api/json/theme/themeList',
    data: {
      typeId: 1,
      pageSize: 10,
      pageNo: 1
    }
  });
};

exports.productList = function (context) {
  return request(context, {
    url: config.whost + '/s5x-web/api/json/product/productList',
    data: {
      pageSize: 20,
      pageNo: 1
    }
  });
};

exports.getChangeRate = function (context) {
  return request(context, {
    url: config.whost + '/s5x-web/api/json/category/getChangeRate'
  });
};



