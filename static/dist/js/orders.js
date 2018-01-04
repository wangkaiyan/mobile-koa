// 移除HTML标签
swig.setFilter('rmhtml', function (content) {
  var regex = /(<([^>]+)>)/ig;
  return content.replace(regex, '');
});

swig.setFilter('orderStatusFilter2', function (orderStatus) {
  var status = String(orderStatus);
  if (status === "0") {
    return "已取消";
  }
  else if (status === "1") {
    return "待付款";
  }
  else if (status === "2") {
    return "已付款";
  }
  if (status === "3") {
    return "已发货";
  }
  else if (status === "4") {
    return "已完成";
  }
  else if (status === "5") {
    return "售后中";
  }
  if (status === "6") {
    return "已关闭";
  }
  else if (status === "7") {
    return "系统取消";
  }
  else if (status === "8") {
    return "已签收";
  }
});
// 订单列表
(function () {
  if (location.pathname !== '/account/orders') {
    return false;
  }

  // 更多订单
  loadMoreFactory({
    size: 10,
    url: '/account/ajax/orders?type=' + $('[data-type]').data('type'),
    panel: '#orders',
    template: '#ordersTempl'
  });


  // 取消订单
  $(document).on('click', '.cancel_order', function () {
    var button = $(this);
    var code = $(this).data('code');
    Modal.confirm({
      message: '你确定要取消订单吗？',
      callback: function () {
        button.prop('disabled', true).html('正在处理');
        $.ajax({
          url: '/shopping/ajax/order',
          type: 'put',
          data: {
            orderCode: code
          }
        }).then(function (res) {
          if (res.code === 200) {
            notice('订单取消成功');
            return location.href = '/account/orders';
          }
          button.prop('disabled', false).html('取消订单');
          notice(res.data.message);
        });
      }
    });
  });

  // 删除订单
  $(document).on('click', '.remove_order', function () {
    var button = $(this);
    var code = $(this).data('code');
    Modal.confirm({
      message: '你确定要删除订单吗？',
      callback: function () {
        button.prop('disabled', true).html('正在处理');
        $.ajax({
          url: '/shopping/ajax/order',
          type: 'delete',
          data: {
            orderCode: code
          }
        }).then(function (res) {
          if (res.code === 200) {
            notice('订单删除成功');
            return location.href = '/account/orders';
          }
          button.prop('disabled', false).html('删除订单');
          notice(res.data.message);
        });
      }
    });
  });

  // 签收商品
  $(document).on('click', '.sign_order', function () {
    var button = $(this);
    var code = $(this).data('code');
    Modal.confirm({
      message: '你确定要签收订单吗？',
      callback: function () {
        button.prop('disabled', true).html('正在处理');
        $.ajax({
          url: '/shopping/ajax/receive',
          type: 'post',
          data: {
            orderCode: code
          }
        }).then(function (res) {
          if (res.code === 200) {
            notice('订单签收成功');
            return location.href = '/shopping/evaluate/' + code;
          }
          button.prop('disabled', false).html('确认签收');
          notice(res.data.message);
        });
      }
    });
  });


  // 顶部的过滤器
  var tabox = $('.tabox');
  var offset = tabox.offset();
  if ($('.bar.bar-header').length === 0) {
    tabox.addClass('suspend');
  }
  else {
    // 更改偏移值
    $(window).on('resize', function () {
      offset = tabox.offset();
    });

    $(window).on('scroll', function () {
      tabox.toggleClass('suspend', window.scrollY > offset.top);
    }).triggerHandler('scroll');
  }
})();


// 订单详情
$(function () {
  if (location.pathname.indexOf('/account/orders') === -1) {
    return false;
  }

});


