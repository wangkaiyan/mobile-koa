var _ = require('lodash');
var whost = require('../../config').whost;
var request = require('../../support').request2;


exports.themeProduct = function (context, id) {
  return request(context, {
    url: whost + '/s5x-web/api/json/product/themeProductList',
    data: {
      themeId: id
    }
  });
};


exports.searchProduct = function (context, content, page, size) {
  return request(context, {
    url: whost + '/s5x-web/api/json/product/searchProduct',
    data: {
      content: content,
      pageNo: page || 1,
      pageSize: size || 20
    }
  });
};

exports.queryGoods = function (context, params) {
  return request(context, {
    url: whost + '/s5x-web/api/json/product/productListNoPage',
    data: params
  });
};


exports.videoList = function (context) {
  return request(context, {
    url: whost + '/s5x-web/api/json/product/videoList'
  });
};


exports.videoProduct = function (context, id, page, size) {
  return request(context, {
    url: whost + '/s5x-web/api/json/product/videoProduct',
    data: {
      videoId: id,
      pageNo: page || 1,
      pageSize: size || 200
    }
  });
};


exports.videoDetail = function (context, id) {
  return request(context, {
    url: whost + '/s5x-web/api/json/product/videoDetail',
    data: {
      videoId: id
    }
  });
};


exports.shopList = function (context) {
  return request(context, {
    url: whost + '/s5x-web/api/json/product/shopList'
  });
};

exports.shopDetail = function (context, id) {
  return request(context, {
    url: whost + '/s5x-web/api/json/product/shopDetail',
    data: {
      shopId: id
    }
  });
};

exports.shopProduct = function (context, id, page, size) {
  return request(context, {
    url: whost + '/s5x-web/api/json/product/shopProduct',
    data: {
      shopId: id,
      pageNo: page || 1,
      pageSize: size || 20
    }
  });
};


exports.shopping = function (context, rootCategoryId, channel) {
  // 存在频道 并发请求
  if (rootCategoryId) {
    return Promise.all([this.listGoods(context, rootCategoryId, channel),this.listSubCategory(context, rootCategoryId)]).then(function (data) {
      // return Promise.all([this.listGoods(context, channel), this.listCategory(context, projectId)]).then(function (data) {
      return {
        list: data[0].list,
        rootCategoryId: rootCategoryId,
        channel: channel,
        category: data[1].list,
      };
    });
  }
};

exports.listCategory = function (context) {
  return request(context, {
    url: whost + '/s5x-web/api/json/category/categoryList'
  }).then(function (data) {
    return data;
  });
};

exports.listSubCategory = function (context,parentId) {
  return request(context, {
    url: whost + '/s5x-web/api/json/category/categorySubList',
    data: {
      parentId: parentId
    }
  }).then(function (data) {
    return data;
  });
};


exports.listGoods = function (context, rootCategoryId, categoryId, page, size) {
  return request(context, {
    url: whost + '/s5x-web/api/json/product/productList',
    data: {
      rootCategoryId: rootCategoryId,
      categoryId: categoryId,
      pageNo: page || 1,
      pageSize: size || 20
    }
  });
};

exports.details = function (context, skuId) {
  return request(context, {
    url: whost + '/s5x-web/api/json/product/productDetail',
    data: {
      productId: skuId
    }
  }).then(function (data) {
    data.product.imgs = JSON.parse(data.product.imgs);
    return data;
  }, function () {
    return null;
  });
};


exports.judgeTeamCode = function (context, teamCode) {
  return request(context, {
    url: whost + '/s5x-web/api/json/address/selUserAddressHotel4Code',
    method: 'post',
    data: {
      teamCode: teamCode,
    }
  });
};


exports.confirmOrder = function (context, userId, skus, couponId, addressId,teamCode) {
  return request(context, {
    url: whost + '/s5x-web/api/json/order/confirmOrder',
    method: 'post',
    data: {
      userId: userId,
      skus: skus || [],
      couponId: couponId,
      addressId: addressId,
      teamCode:teamCode
    }
  }).then(function (data) {
    return data;
  }, function (data) {
    return data;
  });
};

exports.listAddress = function (context, userId) {
  return request(context, {
    url: whost + '/s5x-web/api/json/address/selUserAddress',
    method: 'post',
    data: {
      userId: userId,
    }
  });
};

/**
 * 获取默认收货人
 * @return {promise}
 */
exports.selectAddress = function (context, userId) {
  return this.listAddress(context, userId).then(function (res) {
    var address = null;
    var list = res.list || [];
    list.forEach(function (item) {
      if (Number(item.isDefault) === 1) {
        address = item;
      }
    });
    if (address === null && list.length) {
      return list[0];
    }
    return address;
  }, function () {
    return null;
  });
};


exports.getAddress = function (context, memberId, addressId) {
  return this.listAddress(context, memberId).then(function (data) {
    for (var i = 0; i < data.list.length; i++) {
      if (data.list[i].id === addressId) {
        return data.list[i];
      }
    }
    return null;
  }, function () {
    return null;
  });
};


exports.setAddress = function (context, address) {
  return request(context, {
    url: whost + '/s5x-web/api/json/address/updateUserAddress',
    method: 'post',
    data: address
  });
};

exports.addAddress = function (context, address) {
  return request(context, {
    url: whost + '/s5x-web/api/json/address/addUserAddress',
    method: 'post',
    data: address
  });
};

exports.saveOrUpdate = function (context, address) {
  return address.id ? this.setAddress(context, address) : this.addAddress(context, address);
};

exports.listCart = function (context, userId) {
  return request(context, {
    url: whost + '/s5x-web/api/json/cart/getCarts',
    data: {
      userId: userId,
    }
  });
};

exports.addCart = function (context, userId,  productId) {
  return request(context, {
    url: whost + '/s5x-web/api/json/cart/addCart',
    method: 'post',
    data: {
      userId: userId,
      productId: productId,
    }
  });
};

exports.delCart = function (context, userId, productId) {
  return request(context, {
    url: whost + '/s5x-web/api/json/cart/deleteCart',
    method: 'post',
    data: {
      userId: userId,
      productId: productId,
    }
  });
};

exports.setCart = function (context, userId, productId, incrementCount) {
  return request(context, {
    url: whost + '/s5x-web/api/json/cart/incrmentCartNum',
    method: 'post',
    data: {
      userId: userId,
      productId: productId,
      incrementCount: incrementCount
    }
  });
};

exports.placeOrder = function (context, params) {
  return request(context, {
    url: whost + '/s5x-web/api/json/order/makeOrder',
    method: 'post',
    data: params
  });
};

exports.getOrder = function (context, memberId, orderCode) {
  return request(context, {
    url: whost + '/s5x-web/api/json/order/getOrder',
    data: {
      userId: memberId,
      orderCode: orderCode,
    }
  });
};

/**
 * 取消订单
 * @return {promise}
 */
exports.setOrder = function (context, userId, orderCode) {
  return request(context, {
    url: whost + '/s5x-web/api/json/order/cancelOrder',
    method: 'post',
    data: {
      userId: userId,
      orderCode: orderCode,
    }
  });
};

/**
 * 删除订单
 * @return {promise}
 */
exports.delOrder = function (context, userId, orderCode) {
  return request(context, {
    url: whost + '/s5x-web/api/json/order/deleteOrder',
    method: 'post',
    data: {
      userId: userId,
      orderCode: orderCode,
    }
  });
};

/**
 * 签收订单
 * @return {promise}
 */
exports.receiveOrder = function (context, userId, orderCode) {
  return request(context, {
    url: whost + '/s5x-web/api/json/order/signOrder',
    method: 'post',
    data: {
      userId: userId,
      orderCode: orderCode,
    }
  });
};

/**
 * 仅查询订单商品(评价页面用)
 * @return {promise}
 */
exports.getOrderGoods = function (context, userId, orderCode) {
  return request(context, {
    url: whost + '/s5x-web/api/json/order/getOrder',
    method: 'post',
    data: {
      userId: userId,
      orderCode: orderCode,
    }
  });
};

/**
 * 评价订单
 * @return {promise}
 */
exports.addEvaluate = function (context, data) {
  return request(context, {
    url: whost + '/s5x-web/api/json/order/addWareComment',
    method: 'post',
    data: data
  });
};

exports.getUserCoupons = function (context, userId, orderPrice, status) {
  return request(context, {
    url: whost + '/s5x-web/api/json/coupon/getUserCoupons',
    data: {
      userId: userId,
      orderPrice: null,
      status: status
    }
  });
};

exports.getChangeRate = function (context) {
  return request(context, {
    url: whost + '/s5x-web/api/json/category/getChangeRate'
  });
};