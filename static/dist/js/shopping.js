(function () {
  if (location.pathname !== '/shopping' && location.pathname.indexOf('/shopping/category/') === -1) {
    return false;
  }

  // 未使用
  loadMoreFactory({
    size: 20,
    url: '/shopping/ajax/goods?rootCategoryId=' + $('.float-menu2').data('rootchannel') +"&channel=" + $('.float-menu2').data('channel'),
    panel: '#goods',
    template: '#goodsTempl'
  });


})();


(function () {
  if (location.pathname.indexOf('/shopping/shopProduct/') === -1) {
    return false;
  }

  // 未使用
  loadMoreFactory({
    size: 20,
    url: '/shopping/ajax/shopProduct?id=' + $('.products').data('id'),
    panel: '#goods',
    template: '#goodsTempl'
  });


})();


(function () {
  if (location.pathname.indexOf('/shopping/details/') === -1) {
    return false;
  }
  // 当前商品ID
  var skuId = location.pathname.split('/')[3];

  $(document).on('click', '[data-cart="true"]', function () {
    skuId = location.pathname.split('/')[3];
    $.post('/shopping/ajax/cart', {
      skuId: skuId,
      count: 1,
      // count: $(".number").val(),
    }).then(function (res) {
      if (res.code == 200) {
        // $('.item.cart em').show().html(res.data.cartCount);
        notice('购物车添加成功');
        //alert('购物车添加成功');
      }
      else {
        //alert(res.data.message || '购物车添加失败');
        notice(res.data.message || '购物车添加失败');
      }
    });
  });

  // $(".slider").yxMobileSlider({width:640,height:300,during:3000})

})();


// 我的购物车minus
(function () {
  if (location.pathname !== '/shopping/cart') {
    return false;
  }

  // 削减数量
  $(document).on('click', '.li-button .add-1-x', function (e) {
    var input = $(this).siblings()[0].children[0];//$("#count_cart");
    var input2 = $(this).siblings('input');
    var skuId = $(this).closest('.sc-line').data('sku');
    var count = Math.max(1, parseInt(input.value) - 1);
    input.value = count;
    setCart(count, skuId);
    return false;
  });

  // 增加数量
  $(document).on('click', '.li-button .add1-x', function (e) {
    var input = $(this).siblings()[1].children[0];
    var skuId = $(this).closest('.sc-line').data('sku');
    var count = parseInt(input.value) + 1;
    input.value = count;
    setCart(count, skuId);
    return false;
  });


  // 更新购物车
  function setCart(count, skuId) {
    $.ajax({
      url: '/shopping/ajax/cart',
      type: 'put',
      data: {
        skuId: skuId,
        incre: count,
      }
    }).then(calculator);
  }

  // 订单结算
  var settlement = function () {
    var skus = $('input[name="goods-select2"]:checked').map(function () {
      return {
        skuId: $(this).val(),
        buyNum: $(this).closest('.sc-line').find('input[name="count_cart"]').val()
      };
    });


    var skuNew = [];

    skus.each(function (index, obj) {
      var ob = {
        skuId: obj.skuId,
        buyNum: obj.buyNum
      }
      skuNew.push(ob)
    });

    return $.post('/shopping/ajax/confirm', {
      skus: skuNew
    });
  };

  // 订单询价
  var calculator = function () {
    $('.fm-line2-right .buy-btn').prop('disabled', true).html('处理中');

    settlement().then(function (res) {
      if (res.code === 200) {
        $('.text-orange-total').html('￥' + res.data.entity.shouldPayCh);
      }
      $('.fm-line2-right .buy-btn').prop('disabled', false).html('去结算');
    });
  };

  // 删除商品
  $(document).on('click', '.li-button > .li-button-delete', function (e) {
    var skuId = $(this).closest('.sc-line').data('sku');
    Modal.confirm({
      message: '你确定要删除该商品吗？',
      callback: function () {
        $.ajax({
          url: '/shopping/ajax/cart',
          type: 'delete',
          data: {
            skuId: skuId
          },
          dataType: 'json'

        }).then(function (res) {
          if (res.code === 200) {
            return location.reload();
          }
          notice(res.data.message || '操作失败');
        });
      }
    });
    return false;
  });

  var checkAll = $('input[name=checkAll_goods]');

  // 选择所有商品
  checkAll.on('change', function () {
    $('input[name="goods-select2"]').prop('checked', $(this).is(':checked'));
    // 店铺也要加上
    $('input[name="buy-select-shop"]').prop('checked', $(this).is(':checked'));
    calculator();
  });

  // 是否选择所有
  $('input[name="goods-select2"]').on('change', function () {
    var items = $('input[name="goods-select2"]');
    checkAll.prop('checked', items.filter(':checked').length === items.length);

    var item = $(this);
    shopCheckAll.prop('checked', $('.product-shop-'+item.val()).filter(':checked').length === items.length);


    calculator();
  });

  //店铺全选
  var shopCheckAll = $('input[name=buy-select-shop]');
  shopCheckAll.on('change', function () {
    var item = $(this);
    // alert( item.val() );
    $('.product-shop-'+item.val()).prop('checked', $(this).is(':checked'));
    // $('input[name="goods-select2"]').prop('checked', $(this).is(':checked'));

    var items = $('input[name="goods-select2"]');
    checkAll.prop('checked', items.filter(':checked').length === items.length);

    calculator();
  });




  // 结算购物车
  $(document).on('click', '.buy-btn', function (e) {
    var button = $(this);

    if ($('input[name="goods-select2"]:checked').length === 0) {
      // return notice('请至少选择一件商品');
      return alert('请至少选择一件商品');
    }
    button.prop('disabled', true).html('处理中');
    settlement().then(function (res) {
      if (res.code === 200) {
        return location.href = "/shopping/confirm";
      }
      // notice(res.data.message || '确认订单失败');
      alert(res.data.message || '确认订单失败');
      button.prop('disabled', false).html('去结算');
    });
  });
})();


// 确认订单
(function () {
  if (location.pathname !== '/shopping/confirm') {
    return false;
  }

  /*$('#teamCode').bind('input propertychange', function() {
     // alert('xx')
  });*/

  $("#teamCode").focus(function(){
    // alert('xx')
    var button = $('.btn-new2');
    button.prop('disabled', true).html('');
    console.log('----');
  }).blur(function(){
    var teamCode = $('input#teamCode').val();
    if(teamCode !=null && teamCode != ''){
      console.log('输入团号'+teamCode)

      $.get('/shopping/ajax/judgeTeamCode',{
          teamCode: teamCode
        }).then(function (res) {
        if (res.code === 200) {
          return location.href = "/shopping/confirm?teamCode="+teamCode;;
        }
        notice(res.data.message || '操作失败');
        return location.href = "/shopping/confirm";
      });


    }else {
      console.log('没有输入团号')
      notice('没有输入团号');
    }


  });


  // 是否选择所有
  $('input[name="teamCodeCk"]').on('change', function () {
    var v = $('#teamCodeCk').is(':checked') ? 1 : 0;
    if (v == 1) {
      $("#teamCodeDiv").attr("style", "display:block;");
    } else {
      $("#teamCodeDiv").attr("style", "display:none;");
    }
  });


  // 已选券
  var coupons = window.usedCoupons || [];

  // 使用券
  $(document).on('click', '.item.coupons', function () {
    Coupon.render({
      business: 'NG',
      skuData: $('.list.goods .item').map(function () {
        return {
          wareSkuId: $(this).data('sku'),
          warePrice: $(this).data('price'),
          wareCount: $(this).data('count'),
        };
      }),
      checks: coupons // 默认选中
    }, function (list) {
      // 赋值
      coupons = list.map(function (item) {
        return item.code;
      });

      var skus = $('.list.goods .item').map(function () {
        return {
          skuId: $(this).data('sku'),
          buyNum: $(this).data('count'),
        };
      });

      var button = $('button.submit');
      button.prop('disabled', true).html('正在计算');
      // 刷新价格

      $.post('/shopping/ajax/confirm', {
        skus: skus,
        coupons: coupons,
      }).then(function (res) {
        var data = res.data.entity;
        var text = $('.item.coupons .text');
        if (res.code === 200) {
          if (data.couponCodePromotion) {
            text.html('<i class="text-orange">抵扣' + data.couponCodePromotion.discount + '元</i>');
          }
          else {
            text.html('<i class="text-gray">' + data.totalCouponsPrice + '元可用</i>');
          }
          $('.payment').html('￥' + Number(data.shouldPay).toFixed(2));
        }
        else {
          notice(res.data.message || '优惠券可能暂时无法使用');
        }
        button.prop('disabled', false).html('立即支付');
      });
    });
  });

  // 提交订单
  $(document).on('click', '.btn-new2', function (e) {
    var button = $(this);
    button.prop('disabled', true).html('正在提交');

    var teamCodeCk = $('#teamCodeCk').is(':checked') ? 1 : 0;
    var teamCode = $('input#teamCode').val();
    if (teamCodeCk == 1 && teamCode == null) {
      notice("团号不能为空");
      return false;
    }

    var userMessages = [];
    $("textarea[name='userMessage']").each(
      function () {
        var objShop = {
          shopId: $(this).data('shop'),
          userMessage: $(this).val()
        }
        userMessages.push(objShop);
      }
    )


    var country =$('#country').val();

    var startDate = $('#start_date').val();
    var endDate = $('#end_date').val();


    if((teamCode != null && teamCode != '') || country == '日本' ){
      if(startDate == null || startDate == '' || endDate == null || endDate == ''){
        notice('收货时间不能为空');
        button.prop('disabled', false).html('立即支付');
        return;
      }
       startDate =   new Date(startDate.replace(/-/g, "/")).getTime();
       endDate =   new Date(endDate.replace(/-/g, "/")).getTime();
    }

    $.post('/shopping/ajax/placeorder',
      {
        teamCodeCk: teamCodeCk,
        teamCode: teamCode,
        startDate: startDate,
        endDate: endDate,
        country: country,
        userMessages: userMessages
      }).then(function (res) {
      if (res.code === 200) {
        var code = res.data.gorder.orderCode;
        var price = res.data.gorder.shouldPay;
        paymentS5x(code, price, 'NG');
      }
      else {
        notice(res.data.message);
        button.prop('disabled', false).html('立即支付');
      }
    });
  });


  function paymentS5x(code) {
    location.href = '/cashier/payment?code=' + code;
  }
})();


// 评价订单
(function () {
  if (location.pathname.indexOf('/shopping/evaluate/') === -1) {
    return false;
  }

  // 更改字数
  $(document).on('input', 'textarea', function () {
    $('.counter').html($(this).val().length + ' / ' + 100);
  });

  // 提交评价
  $(document).on('click', '.btn-edit2', function () {
    // alert('aa');
    var button = $(this);
    var code = $(this).data('code');
    var comment = $('#'+code).val();
    if (comment.trim().length === 0) {
      return notice('请输入您的评价内容吧');
    }
    button.prop('disabled', true).html('正在处理');
    $.post('/shopping/ajax/evaluate', {
      comment: comment,
      subCode: code
    }).then(function (res) {
      if (res.code === 200) {
        notice('评价成功啦');
        return  location.reload();
        // return location.href = '/account/orders';
      }
      button.prop('disabled', false).html('确定');
      notice(res.data.message);
    });
  });
})();

