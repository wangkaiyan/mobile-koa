var config = require('../../config');
var whost = config.whost;
var request = require('../../support').request2;
var _ = require('lodash');

/**
 * 验证登录是否成功
 * @return promise
 */
exports.login = function (context, phone, email,  password,type) {
  return request(context, {
    url: whost + '/s5x-web/api/json/user/login',
    method: 'post',
    data: {
      phone: phone,
      email: email,
      password: password,
      type: type
    }
  }).then(function (res) {
    var entity = res.entity;
    if (entity.userId) {
      return entity;
    }
    else {
      return Promise.reject(entity);
    }
  });
};


/**
 * 获取用户详情
 * @return {promise}
 */
exports.getUser = function (context, userId) {
  return request(context, {
    url: whost + '/s5x-web/api/json/user/getUser',
    data: {
      userId: userId
    }
  }).then(function (res) {
    var entity = res.entity;
    if (entity.userId) {
      // entity.user.userId = entity.user.id;
      return entity;
    }
    else {
      return Promise.reject(entity);
    }
  });
};




/**
 * 更新用户信息
 * @return promise
 */
exports.setMember = function (context, member) {
  return request(context, {
    url: whost + '/s5x-web/api/json/user/updateUserInfo',
    method: 'post',
    data: {
      memberInfo: member,
    }
  }).then(function (res) {
    var entity = res.entity;
    if (entity.userId) {
      return entity;
    }
    else {
      return Promise.reject(entity);
    }
  });
};

/**
 * 订单列表
 * @return {promise}
 */
exports.listOrder = function (context, params) {
  return request(context, {
    url: whost + '/s5x-web/api/json/order/getOrders',
    data: {
      orderStatus: params.orderStatus, // [0:全部,1:待付款，2:已付款(暂不实现)，3:待评价]
      pageNo: params.pageNo || params.page || 1,
      pageSize: params.pageSize || params.size || 10,
      userId: params.userId,
      content: params.content,
    }
  }).then(function (data) {
    return data;
  }).then(function (data) {
    return data;
  });
};



/**
 * 订单列表
 * @return {promise}
 */
exports.listOrders4Leader = function (context, params) {
  return request(context, {
    url: whost + '/s5x-web/api/json/order/getOrders4Leader',
    data: {
      teamCode: params.teamCode,
      startDate: params.startDate,
      endDate: params.endDate,
      // orderStatus: params.orderStatus, // [0:全部,1:待付款，2:已付款(暂不实现)，3:待评价]
      pageNo: params.pageNo || params.page || 1,
      pageSize: params.pageSize || params.size || 10,
      userId: params.userId,
    }
  }).then(function (data) {
    return data;
  }).then(function (data) {
    return data;
  });
};


/**
 * 发送短信验证码
 * @return promise
 */
exports.getTelCaptcha = function (context, mobile,email, action,type) {
  return request(context, {
    url: whost + '/s5x-web/api/json/user/getVerifyCode',
    data: {
      phone: mobile,
      email: email,
      type: type,
      action: action, // 1 注册 2 忘记密码
    }
  });
};

/**
 * 列举收货人信息
 * @return {promise}
 */
exports.listAddress = function (context, userId) {
  return request(context, {
    url: whost + '/s5x-web/api/json/address/selUserAddress',
    data: {
      userId: userId
    }
  });
};

/**
 * 获取指定的收货地址
 * @return {promise}
 */
exports.getAddress = function (context, memberId, addressId) {
  return exports.listAddress(context, memberId).then(function (data) {
    for (var i = 0; i < data.list.length; i++) {
      if (data.list[i].id === addressId) {
        return data.list[i];
      }
    }
    return null;
  });
};

/**
 * 创建收货人地址
 * @return promise
 */
exports.addAddress = function (context, address) {
  return request(context, {
    url: whost + '/s5x-web/api/json/address/addUserAddress',
    method: 'post',
    data: address
  });
};

/**
 * 更新收货人地址
 * @return {promise}
 */
exports.setAddress = function (context, address) {
  return request(context, {
    url: whost + '/s5x-web/api/json/address/updateUserAddress',
    method: 'post',
    data: address
  });
};

/**
 * 更新或创建收货人地址
 * @return promise
 */
exports.saveOrUpdate = function (context, address) {
  return address.id ? this.setAddress(context, address) : this.addAddress(context, address);
};

/**
 * 删除收货人信息
 * @return {promise}
 */
exports.delAddress = function (context, memberId, addressId) {
  return request(context, {
    url: whost + '/s5x-web/api/json/address/deleteAddress',
    method: 'post',
    data: {
      userId:  memberId,
      addressId: addressId,
    }
  });
};


//

/**
 * 获取默认收货人
 * @return {promise}
 */
exports.getDefault = function (context, memberId) {
  return this.listAddress(context, memberId).then(function (res) {
    var address = null;
    var list = res.list || [];
    list.forEach(function (item) {
      if (Number(item.defaultFlag) === 1) {
        address = item;
      }
    });
    return address;
  }, function () {
    return null;
  });
};

/**
 * 设置默认收货人
 * @return {promise}
 */
exports.setDefault = function (context, userId, id) {
  return request(context, {
    url: whost + '/s5x-web/api/json/address/setDefaultAddress',
    method: 'post',
    data: {
      userId: userId,
      addressId: id
    }
  });
};


/**
 * 列举收货人信息
 * @return {promise}
 */
exports.listAddressHotel = function (context, userId) {
  return request(context, {
    url: whost + '/s5x-web/api/json/address/selUserAddressHotel',
    data: {
      userId: userId
    }
  });
};

/**
 * 获取指定的收货地址
 * @return {promise}
 */
exports.getAddressHotel = function (context, memberId, addressId) {
  return exports.listAddressHotel(context, memberId).then(function (data) {
    for (var i = 0; i < data.list.length; i++) {
      if (data.list[i].id === addressId) {
        return data.list[i];
      }
    }
    return null;
  });
};

/**
 * 创建收货人地址
 * @return promise
 */
exports.addAddressHotel = function (context, address) {
  return request(context, {
    url: whost + '/s5x-web/api/json/address/addAddressHotel',
    method: 'post',
    data: address
  });
};

/**
 * 更新收货人地址
 * @return {promise}
 */
exports.setAddressHotel= function (context, address) {
  return request(context, {
    url: whost + '/s5x-web/api/json/address/updateAddressHotel',
    method: 'post',
    data: address
  });
};

/**
 * 更新或创建收货人地址
 * @return promise
 */
exports.saveOrUpdateHotel = function (context, address) {
  return address.id ? this.setAddressHotel(context, address) : this.addAddressHotel(context, address);
};

/**
 * 删除收货人信息
 * @return {promise}
 */
exports.delAddressHotel = function (context, memberId, addressId) {
  return request(context, {
    url: whost + '/s5x-web/api/json/address/deleteAddressHotel',
    method: 'post',
    data: {
      userId:  memberId,
      addressId: addressId,
    }
  });
};




/**
 * 获取领队下单用户
 * @return {promise}
 */
exports.getUsers4Leader = function (context, userId) {
  return request(context, {
    url: whost + '/s5x-web/api/json/order/getUsers4Leader',
    data: {
      userId: userId
    }
  });
};


// 注册账号
exports.register = function (context, phone, email, password, type,captcha )  {
  return request(context, {
    url: whost + '/s5x-web/api/json/user/register',
    method: 'post',
    data: {
      phone: phone,
      email: email,
      password: password,
      type: type,
      captcha: captcha,
    }
  }).then(function (data) {
    // 注册返回的数据不完整 需要通过登录获取
    return exports.login(context, phone,email, password, type);
  });
};

/**
 * 验证手机是否已经注册
 * @return promise
 */
exports.exists = function (context, phone, email,type)  {
  return request(context, {
    url: whost + '/s5x-web/api/json/user/checkIsRegister',
    data: {
      phone: phone,
      email: email,
      type: type
    }
  }).then(function (data) {
    return false;
  }, function () {
    return true;
  });
};

/**
 * 更改密码
 * @return promise
 */
exports.updatePassword = function (context, userId, oldpwd, newpwd) {
  return request(context, {
    url: whost + '/s5x-web/api/json/user/updatePassWord',
    method: 'post',
    data: {
      oldPwd: oldpwd,
      newPwd: newpwd,
      userId: userId,
    }
  });
};

/**
 * 重设密码
 * @param  {number} mobile 手机号
 * @param  {newpwd} newpwd 新密码
 * @return promise
 */
exports.resetPassword = function (context, phone, email, password, type,captcha )  {
  return request(context, {
    url: whost + '/s5x-web/api/json/user/resetPassword',
    method: 'post',
    data: {
      phone: phone,
      email: email,
      password: password,
      type: type,
      captcha: captcha,
    }
  });
};