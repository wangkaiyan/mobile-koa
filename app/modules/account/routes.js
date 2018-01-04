require('./filter');
var _ = require('lodash');
var support = require('../../support');
var service = require('./service');
var interceptor = require('../../config/interceptor');
var Router = require('koa-router');
var router = module.exports = new Router();

router.redirect('/login', '/account/login');
router.redirect('/logout', '/account/logout');
router.redirect('/register', '/account/register');

/*
 * * * * * * * * * * * * * * * * * * * * * * * *
 * 重要：需要仔细检查 - 新用户注册关键 - 完善手机资料 *
 * * * * * * * * * * * * * * * * * * * * * * * *
 */
router.post('/account/improve', function * (next) {
  var self = this;
  var form = this.request.body;

  yield service.improve(this, {
    mobile: form.mobile,
    verifyCode: form.captcha,
    accountId: this.session.accountId,
    projectId: this.session.project.id,
  }).then(function (data) {
    self.session.member = data;
    self.redirect(self.query.next || '/home');
  }, function (data) {
    self.body = self.render('templates/improve.html', {
      error: data.message
    });
  });
});

// 个人主页
// router.get('/profile', cacheDisabled, function * (next) {
router.get('/account/profile', loginRequired, function * (next) {
  var data = yield {
    user: service.getUser(this, this.session.member.userId ),
    // config: service.projectProperty(this, this.session.project.id),
    // wallet: this.session.member ? service.wallet(this, this.session.member.memberId) : null,
  };
  this.body = this.render('templates/me.html', data, {
    member: this.session.member,
  });
});


// 登录页面
router.get('/account/login', function * (next) {
  if (this.session.member) {
    return this.redirect(this.query.next || '/home');
  }
  this.body = this.render('templates/login.html', this.query);
});


// 登录
router.post('/account/login', function * (next) {
  var self = this;
  var form = this.request.body;


  yield service.login(this, form.phone,form.email,form.password, form.type).then(function (data) {
    self.session.member = data;
    self.redirect(self.query.next || '/home');
  }, function (data) {
    self.body = self.render('templates/login.html', {
      mobile: form.mobile,
      error: data.message || '您的账户不存在或密码错误'
    });
  });
});



// 登出操作
router.get('/account/logout', function * (next) {
  this.session = null;
  this.redirect('/account/login?next=' + encodeURIComponent(this.headers.referer || '/home'));
});

// 个人资料
router.get('/account/settings', loginRequired, function * (next) {
  this.body = this.render('templates/me_info.html', {
    member: this.session.member
  });
});

// 修改用户(FORM)
router.post('/account/update', loginRequired, function * (next) {
  var self = this;
  var form = support.clean(this.request.body);
  yield service.setMember(this, _.merge({}, this.session.member, form)).then(function (data) {
    self.session.member = data;
    self.redirect('/account/settings');
  }, function (data) {
    self.redirect('/account/settings');
  });
});

// 修改用户(AJAX)
router.put('/account/ajax/update', loginRequired, function * (next) {
  var self = this;
  var form = support.clean(this.request.body);
  yield service.setMember(this, _.merge({}, this.session.member, form)).then(function (data) {
    self.session.member = data;
    self.body = self.render(200, data);
  }, function (data) {
    self.body = self.render(500, data);
  });
});

// 我的订单
router.get('/account/orders', loginRequired, function * (next) {
  var data = yield {
      orders: service.listOrder(this, {
      orderStatus: this.query.type,
      userId: this.session.member.userId
    })
    // menus: service.listBusyness(this, this.session.member.memberId)
  };
  this.body = this.render('templates/me_orders.html', data, {
    type: this.query.type,
    business: this.query.business,
  });
});

router.get('/account/searchOrders', loginRequired, function * (next) {
  var data = yield {
    orders: service.listOrder(this, {
      orderStatus: this.query.type,
      userId: this.session.member.userId,
      content:  this.query.content,
    })
  };
  data.content = this.query.content;
  this.body = this.render('templates/me_orders.html', data, {
    type: this.query.type,
    business: this.query.business,
  });
});

// 收货人信息
router.get('/account/addresses', loginRequired, function * () {
  var data = yield service.listAddress(this, this.session.member.userId);
  this.body = this.render('templates/me_address.html', data);
});

// 编辑收货人
router.get('/account/address/:id', loginRequired, function * () {
  var address = yield service.getAddress(this, this.session.member.userId, this.params.id);
  this.body = this.render('templates/me_address_new.html', address);
});

// 新建收货人
router.get('/account/address', loginRequired, function * () {
  var address = {
    userName: this.session.member.userName,
  };
  // 忽略默认名字
  address.userName = (address.userName !== '尚五星用户') ? address.userName : '';
  this.body = this.render('templates/me_address_new.html', address);
});

// 保存收货人
router.post('/account/address', loginRequired, function * (next) {
  var self = this;
  var address = _.merge(this.request.body, {
    userId: this.session.member.userId,
  });
  yield service.saveOrUpdate(this, address).then(function (data) {
    self.redirect('/account/addresses');
  }, function (data) {
    self.body = self.render('templates/me_address_new.html', address, {
      error: data.message
    });
  });
});

// 删除收货人
router.delete('/account/ajax/address', loginRequired, function * () {
  var self = this;
  var form = this.request.body;
  yield service.delAddress(this, this.session.member.userId, form.id).then(function () {
    // 防止缓存中有通用地址
    if (self.session['ng:address'] && self.session['ng:address'].id === form.id) {
      self.session['ng:address'] = null;
    }
    self.body = self.render(200, '删除收货人成功');
  }, function (data) {
    self.body = self.render(500, data.message || '删除收货人失败');
  });
});

// 设置默认收货人
router.post('/account/ajax/default', loginRequired, function * () {
  var self = this;
  var form = this.request.body;
  yield service.setDefault(this, this.session.member.userId, form.id).then(function (data) {
    self.body = self.render(200, '设置默认收货人成功');
  }, function (data) {
    self.body = self.render(500, data.message || '设置默认收货人失败');
  });
});



// 更多订单
router.get('/account/ajax/orders', loginRequired, function * () {
  var self = this;
  yield service.listOrder(this, {
    page: this.query.page,
    size: this.query.size,
    orderStatus: this.query.type,
    userId: this.session.member.userId,
  }).then(function (data) {
    // var data = {orders:data };
    self.body = self.render(200, data);
  }, function (data) {
    self.body = self.render(500, data);
  });
});


// 注册逻辑 - 1
router.get('/account/register', function * (next) {
  this.body = this.render('templates/register.html', {
    next: this.query.next
  });
});

// 注册逻辑 - 1
router.get('/account/registerEmail', function * (next) {
  this.body = this.render('templates/register_email.html', {
    next: this.query.next
  });
});

// 注册逻辑 - 2
router.post('/account/register', function * (next) {
  var self = this;
  var form = this.request.body;

  // 验证手机账户是否存在
  var exists = yield service.exists(this, form.mobile,form.email,form.type);
  if (exists) {
    this.body = this.render('templates/register.html', form, {
      error: '已经被注册，请直接登录'
    });
  }else{
    // 注册流程
    yield service.register(this, form.mobile,form.email,form.password, form.type,form.captcha ).then(function (data) {
      self.session.member = data;
      self.redirect(self.query.next || '/home');
    }, function (data) {
      self.body = self.render('templates/register.html', {
        mobile: form.mobile,
        error: data.message || '您的账户信息填写不完善'
      });
    });
  }


});



// 注册逻辑 - 2
router.post('/account/registerEmail', function * (next) {
  var self = this;
  var form = this.request.body;

  // 验证手机账户是否存在
  var exists = yield service.exists(this, form.mobile,form.email,form.type);
  if (exists) {
    this.body = this.render('templates/register_email.html', form, {
      error: '已经被注册，请直接登录'
    });
  }else{
    // 注册流程
    yield service.register(this, form.mobile,form.email,form.password, form.type,form.captcha ).then(function (data) {
      self.session.member = data;
      self.redirect(self.query.next || '/home');
    }, function (data) {
      self.body = self.render('templates/register_email.html', {
        mobile: form.mobile,
        error: data.message || '您的账户信息填写不完善'
      });
    });
  }


});

// 忘记密码 - 1
router.get('/account/forgot', function * (next) {
  this.body = this.render('templates/forgot.html');
});

// 忘记密码 - 1
router.get('/account/forgotEmail', function * (next) {
  this.body = this.render('templates/forgot_email.html');
});

// 忘记密码 - 2
router.post('/account/forgot', function * (next) {
  var self = this;
  var form = this.request.body;
  // 注册流程
  yield service.resetPassword(this, form.mobile,form.email,form.password, form.type,form.captcha ).then(function (data) {
    self.redirect('/account/login');
  }, function (data) {
    self.body = self.render('templates/forgot.html', {
      mobile: form.mobile,
      error: data.message || '重置密码失败，请重新验证'
    });
  });
});


// 忘记密码 - 2
router.post('/account/forgotEmail', function * (next) {
  var self = this;
  var form = this.request.body;
  // 注册流程
  yield service.resetPassword(this, form.mobile,form.email,form.password, form.type,form.captcha ).then(function (data) {
    self.redirect('/account/login');
  }, function (data) {
    self.body = self.render('templates/forgot_email.html', {
      email: form.email,
      error: data.message || '重置密码失败，请重新验证'
    });
  });
});


// 修改密码
router.get('/account/password', loginRequired, function * (next) {
  this.body = this.render('templates/password.html');
});

// 修改密码
router.post('/account/ajax/password', loginRequired, function * (next) {
  var self = this;
  var form = this.request.body;
  yield service.updatePassword(this, this.session.member.userId, form.oldpwd, form.newpwd).then(function (data) {
    self.body = self.render(200, data);
  }, function (data) {
    self.body = self.render(500, data);
  });
});



// 我的订单
router.get('/account/leader', loginRequired, function * (next) {
  var data = yield {
    orders: service.listOrders4Leader(this, {
      teamCode: this.query.teamCode,
      startDate: this.query.startDate,
      endDate: this.query.endDate,
      userId: this.session.member.userId
    })
    // menus: service.listBusyness(this, this.session.member.memberId)
  };
  this.body = this.render('templates/me_leader.html', data);
});

// leader 领队服务
router.get('/account/leader/hotel', loginRequired, function * () {
  var data = yield service.listAddressHotel(this, this.session.member.userId);
  // var data = {};
  this.body = this.render('templates/me_leader_hotel.html', data);
});

// leader 领队用户
router.get('/account/leader/user', loginRequired, function * () {
  var data = yield service.getUsers4Leader(this, this.session.member.userId);
  this.body = this.render('templates/me_leader_order_user.html', data);
});


// leader 领队服务
router.get('/account/leader/addHotel', loginRequired, function * () {
  // var data = yield service.listAddress(this, this.session.member.userId);
  var address = {
    userName: this.session.member.userName,
    // gender: this.session.member.memberGender,
    // phone: this.session.member.memberMobile
  };

  // 忽略默认名字
  address.userName = (address.userName !== '尚五星领队') ? address.userName : '';

  this.body = this.render('templates/me_leader_hotel_new.html', address);
});




//  酒店信息 ---------------

// 编辑酒店信息 
router.get('/account/addressHotel/:id', loginRequired, function * () {
  var address = yield service.getAddressHotel(this, this.session.member.userId, this.params.id);
  this.body = this.render('templates/me_leader_hotel_new.html', address);
});



// 保存收货人
router.post('/account/leader/addHotel', loginRequired, function * (next) {
  var self = this;

  var address = _.merge(this.request.body, {
    userId: this.session.member.userId,
  });

  yield service.saveOrUpdateHotel(this, address).then(function (data) {
    self.redirect('/account/leader/hotel');
  }, function (data) {
    self.body = self.render('templates/me_leader_hotel_new.html', address, {
      error: data.message
    });
  });
});

// 删除收货人
router.delete('/account/ajax/addressHotel', loginRequired, function * () {
  var self = this;
  var form = this.request.body;
  yield service.delAddressHotel(this, this.session.member.userId, form.id).then(function () {
    // 防止缓存中有通用地址
    if (self.session['ng:address'] && self.session['ng:address'].id === form.id) {
      self.session['ng:address'] = null;
    }
    self.body = self.render(200, '删除收货人成功');
  }, function (data) {
    self.body = self.render(500, data.message || '删除收货人失败');
  });
});
