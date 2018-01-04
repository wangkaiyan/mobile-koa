require('./filter');
var _ = require('lodash');
var service = require('./service');
var Router = require('koa-router');
var router = module.exports = new Router({
  prefix: '/shopping'
});


// 商城首页
router.get('/', function * (next) {
  var data = yield service.shopping(this, this.query.rootCategoryId, '' ,1, 10);
  this.body = this.render('templates/shopping.html', data);
});

// 主题商品
router.get('/theme/:id', function * (next) {
  var data = yield service.themeProduct(this, this.params.id);
  this.body = this.render('templates/theme_products.html', data);
});

// 主题商品
router.get('/category/:id', function * (next) {
  var data = yield service.shopping(this, this.query.root, this.params.id ,1, 10);
  this.body = this.render('templates/shopping.html', data);
});


// 主题商品
router.get('/search', function * (next) {
  if(this.query.content == null  || this.query.content == ''){
    return this.body = this.render(500, '搜索内容不能为空!');
  }

  var data = yield {
    products : yield service.searchProduct(this, this.query.content),
    rate : yield service.getChangeRate(this)
  }
  data.content = this.query.content;

  this.body = this.render('templates/search_products.html', data);
});


router.get('/ajax/search', function * () {
  var data = yield service.searchProduct(this, this.query.content, this.query.page, this.query.size);
  this.body = this.render(200, data);
});

router.get('/moreChannel', function * (next) {
  var data = yield service.listCategory(this);
  this.body = this.render('templates/more_channel.html', data);
});


router.get('/video', function * (next) {
  var data = yield service.videoList(this);
  this.body = this.render('templates/video.html', data);
});

router.get('/videoDetail/:id', function * (next) {
  var data = yield {
    video: service.videoDetail(this,this.params.id),
    products: service.videoProduct(this,this.params.id)
  }
  this.body = this.render('templates/video_detail.html', data);
});


router.get('/shop', function * (next) {
  var data = yield service.shopList(this);
  this.body = this.render('templates/shops.html', data);
});

router.get('/shopProduct/:id', function * (next) {
  var data = yield service.shopProduct(this,this.params.id);
  data.id = this.params.id;
  this.body = this.render('templates/shop_products.html', data);
});

router.get('/ajax/shopProduct', function * (next) {
  var data = yield service.shopProduct(this,this.query.id, this.query.page, this.query.size);
  this.body = this.render(200, data);
});

router.get('/shopDetail/:id', function * (next) {
  var data = yield service.shopDetail(this,this.params.id);
  data.entity.imgs = JSON.parse( data.entity.imgs);
  this.body = this.render('templates/shop_detail.html', data);
});


// 客服
router.get('/service', function * (next) {
  this.body = this.render('templates/service.html');
});

// 客服
router.get('/help', function * (next) {
  this.body = this.render('templates/me_help.html');
});

// 优惠券
router.get('/coupon',  loginRequired, function * (next) {
  var data = yield service.getUserCoupons(this, this.session.member.userId, null,0);
  this.body = this.render('templates/me_coupon.html',data,{
    type: 0,
  });
});
// 根据订单金额 筛选
router.get('/coupon/:orderPrice',  loginRequired,  function * (next) {
  var data = yield service.getUserCoupons(this, this.session.member.userId, 0,0);
  this.body = this.render('templates/me_coupon.html',data,{
    type: 1,orderPrice: this.params.orderPrice
  });
});


// 更多分类商品
router.get('/ajax/goods', function * () {
  var data = yield service.listGoods(this, this.query.rootCategoryId, this.query.channel, this.query.page, this.query.size);
  this.body = this.render(200, data);
});

// 商品详情
router.get('/details/:id', function * (next) {
  var data = yield {
    goods: service.details(this, this.params.id),
    // carts: this.session.member ? service.listCart(this, this.session.member.memberId, this.session.project.id) : null,
  };
  if (data.goods) {
    var comments = [];
    // var comments = yield service.listComment(this, this.session.project.id, data.goods.goodsId);
  }
  this.body = this.render('templates/detail.html', data, {
    comments: comments && comments.list,
    member: this.session.member
  });
});


// 添加购物车
router.get('/ajax/judgeTeamCode', loginRequired, function * (next) {
  var self = this;
  var teamCode = this.query.teamCode;
  yield service.judgeTeamCode(this, teamCode).then(function (data) {
    self.body = self.render(200, data);
  }, function (data) {
    self.body = self.render(500, data.message || '团号有误');
  });
});

// 确认结算价格
router.post('/ajax/confirm', loginRequired, function * (next) {
  var self = this;
  var form = this.request.body;
  this.session['ng:skus'] = form.skus;
  this.session['ng:coupons'] = form.coupons;
  yield service.confirmOrder(this, this.session.member.userId, this.session['ng:skus'], this.session['ng:coupons']).then(function (data) {
    self.body = self.render(200, data);
  }, function (data) {
    self.body = self.render(500, data);
  });
});


// 确认结算页面 禁止缓存
router.get('/confirm', loginRequired, cacheDisabled, function * (next) {
  var couponId = this.query.couponId;
  var teamCode = this.query.teamCode;

  if(couponId != null){
    this.session['ng:couponId'] = couponId;
  }else{
    this.session['ng:couponId'] = null;
  }


  // 如果缓存中没有商品 说明已经下过单 (防止浏览器返回出错, 超时概率较小, 暂时不考虑)
  if (!this.session['ng:skus']) {
    return this.redirect('/account/orders');
  }

  var  address =  yield this.session['ng:address'] || service.selectAddress(this, this.session.member.userId);
  // var  address =  yield service.selectAddress(this, this.session.member.userId);

  var data = yield {
    address: address,
    info: service.confirmOrder(this, this.session.member.userId,  this.session['ng:skus'], this.session['ng:couponId'], address !=null?address.id : null,teamCode !=null?teamCode : null)
  };

  if(data.info.entity ==  null){
    this.session['ng:address'] = data.address;
    this.body = this.render('templates/order_ensure.html', {
      skus: this.session['ng:skus'],
      entity: data.info.entity,
      list: data.info.list,
      // propertySelf: data.temporary.propertySelf,
      invoice: this.session['ng:invoice'],
      address: this.session['ng:address'],
      couponId:  this.session['ng:couponId'],
      member: this.session.member,
      project: this.session.project,
      publicsId: this.session.publicsId,
      // teamCode: teamCode,
    }, {
      error: data.info.message
    });

  }else{
    this.session['ng:address'] = data.address;
    this.body = this.render('templates/order_ensure.html', {
      skus: this.session['ng:skus'],
      entity: data.info.entity,
      list: data.info.list,
      // propertySelf: data.temporary.propertySelf,
      invoice: this.session['ng:invoice'],
      address: this.session['ng:address'],
      couponId:  this.session['ng:couponId'],
      member: this.session.member,
      project: this.session.project,
      publicsId: this.session.publicsId,
      teamCode: teamCode,
    });

  }
});


// 确认订单 - 列举收货人
router.get('/addresses', loginRequired, function * (next) {
  var data = yield service.listAddress(this, this.session.member.userId);
  this.body = this.render('templates/addresses.html', data);
});

// 确认订单 - 选择收货人
router.get('/address/choose/:id', loginRequired, function * (next) {
  this.session['ng:address'] = yield service.getAddress(this, this.session.member.userId, this.params.id);
  this.redirect('/shopping/confirm');
});

// 确认订单 - 新建收货人
router.get('/address', loginRequired, function * (next) {
  var address = {
    userName: this.session.member.userName,
  };
  // 忽略默认名字
  address.userName = (address.userName !== '尚五星用户') ? address.userName : '';
  this.body = this.render('templates/address.html', address);
});

// 确认订单 - 新建收货人
router.post('/address', loginRequired, function * (next) {
  var self = this;
  var address = _.merge(this.request.body, {
    userId: this.session.member.userId,
  });

  yield service.saveOrUpdate(this, address).then(function (data) {
    self.session['ng:address'] = data.address;
    self.redirect('/shopping/confirm');
  }, function (data) {
    self.body = self.render('templates/address.html', address, {
      error: data.message
    });
  });
});

// 下单逻辑
router.post('/ajax/placeorder', loginRequired, function * (next) {
  var self = this;
  var queryBody = this.request.body;
  var temporary = null;
  yield service.confirmOrder(this, this.session.member.userId, this.session['ng:skus'],  this.session['ng:couponId'] ).then(function (data) {
    temporary = data;
  }, function (data) {
    self.body = self.render(500, data);
  });

  if (temporary === null) {
    return;
  }

  if (!this.session['ng:address'] && !queryBody.teamCode) {
    return this.body = this.render(500, '请添加收货地址');
  }
  if((queryBody.teamCode != null && queryBody.teamCode != '') || queryBody.country == '日本'){
    var cDate = Date.parse(new Date());
    if( queryBody.endDate - cDate < 72*60*60*1000 || queryBody.startDate == null){
      return this.body = this.render(500, '收货时间不满足');
    }
  }



  var params = {
    arriveHotelAt:queryBody.startDate,
    leaveHotelAt:queryBody.endDate,
    paymentType: 0,
    isPayOnline: 0,
    skus: this.session['ng:skus'],
    couponId:  this.session['ng:couponId'] ,
    teamCode : queryBody.teamCode,
    userMessages: queryBody.userMessages,
    addressId: this.session['ng:address'] !=null ? this.session['ng:address'] .id : '',
    userId: this.session.member.userId,
  };

  if (this.ua.ali) {
    params.orderSourceType = 4;
  }
  else {
    params.orderSourceType = 2;
  }

  yield service.placeOrder(this, params).then(function (data) {
    self.session['ng:skus'] = null;
    self.session['ng:couponId']  = null;
    //self.session['ng:promotionId'] = null;
    self.body = self.render(200, data);
  }, function (data) {
    self.body = self.render(500, data);
  });
});

// 订单详情
router.get('/order/:code', loginRequired, function * (next) {
  var order = yield service.getOrder(this, this.session.member.userId, this.params.code);
  this.body = this.render('templates/me_orders_detail.html', order);
});

// 评价订单
router.get('/evaluate/:id', loginRequired, function * (next) {
  var data = yield service.getOrderGoods(this, this.session.member.userId, this.params.id);
  this.body = this.render('templates/goods_evaluation.html', data);
});

// 评价订单
router.post('/ajax/evaluate', loginRequired, function * (next) {
  var self = this;
  yield service.addEvaluate(this, {
    comment: this.request.body.comment,
    subCode: this.request.body.subCode,
    userId: this.session.member.userId,
  }).then(function (data) {
    self.body = self.render(200, data);
  }, function (data) {
    self.body = self.render(500, data);
  });
});


// 取消订单
router.put('/ajax/order', loginRequired, function * (next) {
  var self = this;
  yield service.setOrder(this, this.session.member.userId, this.request.body.orderCode).then(function (data) {
    self.body = self.render(200, data);
  }, function (data) {
    self.body = self.render(500, data);
  });
});

// 删除订单
router.delete('/ajax/order', loginRequired, function * (next) {
  var self = this;
  yield service.delOrder(this, this.session.member.userId, this.request.body.orderCode).then(function (data) {
    self.body = self.render(200, data);
  }, function (data) {
    self.body = self.render(500, data);
  });
});

// 签收订单
router.post('/ajax/receive', loginRequired, function * (next) {
  var self = this;
  yield service.receiveOrder(this, this.session.member.userId, this.request.body.orderCode).then(function (data) {
    self.body = self.render(200, data);
  }, function (data) {
    self.body = self.render(500, data);
  });
});

// 列举购物车
router.get('/cart', loginRequired, function * (next) {
  var self = this;
  var data = yield service.listCart(this, this.session.member.userId);
  var skus = data.list.map(function (item) {
    return {
      skuId: item.skuId,
      buyNum: item.buyNum
    }
  });
  this.body = this.render('templates/cart.html', data, {
    member: this.session.member,
  });
});

// 添加购物车
router.post('/ajax/cart', loginRequired, function * (next) {
  var self = this;
  var form = this.request.body;
  yield service.addCart(this, this.session.member.userId, form.skuId).then(function (data) {
    self.body = self.render(200, data);
  }, function (data) {
    self.body = self.render(500, data.message || '添加商品失败');
  });
});


// 删除购物车
router.delete('/ajax/cart', loginRequired, function * (next) {
  var self = this;
  var form = this.request.body;
  yield service.delCart(this, this.session.member.userId, form.skuId).then(function (data) {
    self.body = self.render(200, '删除商品成功');
  }, function (data) {
    self.body = self.render(500, data.message || '删除商品失败');
  });
});

// 更新购物车
router.put('/ajax/cart', loginRequired, function * (next) {
  var self = this;
  var form = this.request.body;
  yield service.setCart(this, this.session.member.userId,form.skuId, form.incre).then(function (data) {
    self.body = self.render(200, '更新购物车成功');
  }, function (data) {
    self.body = self.render(500, data.message || '更新购物车失败');
  });
});
