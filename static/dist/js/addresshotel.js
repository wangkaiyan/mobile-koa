// 收货人列表
$(function () {
  if (location.pathname !== '/account/leader/hotel') {
    return false;
  }

  // 删除收货人
  $(document).on('click', '.btn-delete', function () {
    var item = $(this).closest('.address-row');
    Modal.confirm({
      message: '你确定要删除这条地址吗？',
      callback: function () {
        $.ajax({
          url: '/account/ajax/addressHotel',
          type: 'delete',
          data: {
            id: item.data('id')
          },
          dataType: 'json'
        }).then(function (res) {
          if (res.code === 200) {
            item.remove();
            notice('收货地址删除成功');
            // alert('收货地址删除成功');
          }
          else {
            notice(res.data.message);
            // alert(res.data.message);
          }
        });
      }
    });
  });

  // 设置默认收货人
  $(document).on('click', 'input[name="default"]', function (e) {
    var input = $(this);
    $.ajax({
      url: '/account/ajax/default',
      type: 'post',
      data: {
        id: input.val()
      },
      dataType: 'json'
    }).then(function (res) {
      if (res.code === 200) {
        $('.btn-delete3').prop('disabled', false);
        // $('.tips').addClass('hide');
        input.closest('.address-row').find('.btn-delete3').prop('disabled', true);
        // input.closest('.item').find('.tips').removeClass('hide');
        // notice('设置默认收货人成功');
        alert('设置默认收货人成功');
      }
      else {
        // notice(res.data.message || '设置默认收货人失败');
        alert(res.data.message || '设置默认收货人失败');
      }
    });
  });
});

// 新增地址  account/leader/addHotel
(function () {
  if (/^\/account\/leader\/addHotel\b/.test(location.pathname) === false &&
      /^\/account\/addressHotel\b/.test(location.pathname) === false
  ) {
    return false;
  }
  $(document).on('submit', 'form[name="address"]', function () {
    // debugger
    var form = this;
    var startDate = $('#start_date').val();
    var endDate = $('#end_date').val();

    if (startDate === '') {
      // notice('');
      alert('请选择开始时间');
      return false;
    }
    if (endDate === '') {
      // notice('');
      alert('请选择结束时间');
      return false;
    }
    if(new Date(startDate.replace(/-/g, "/")).getTime() > new Date(endDate.replace(/-/g, "/")).getTime()){
      // notice('开始时间大于结束时间');
      alert('开始时间大于结束时间');
      return false;
    }

    // form.goodsReceiveSdate.value =   new Date(startDate).getTime();
    form.goodsReceiveSdate.value =   new Date(startDate.replace(/-/g, "/")).getTime();
    form.goodsReceiveEdate.value =   new Date(endDate.replace(/-/g, "/")).getTime();
    // form.goodsReceiveSdate.value =   Date.parse( new Date(startDate) );
    // form.goodsReceiveEdate.value =   Date.parse(new Date(endDate));

    // alert(form.goodsReceiveSdate.value + '-'+  form.goodsReceiveEdate.value  +'-' +new Date(startDate) + '-' +Date.parse( new Date(startDate) ) +'-'+ new Date(endDate).getTime());


    if (form.receiveName.value.trim() === '') {
      // notice('请输入收货人姓名');
      alert('请输入收货人姓名');
      return false;
    }
    if (!/\d{11}/.test(form.phone.value)) {
      // notice('请输入正确的手机号码');
      alert('请输入正确的手机号码');
      return false;
    }
    if (form.address.value.trim() === '') {
      // notice('请输入收货人详细地址');
      alert('请输入收货人详细地址');
      return false;
    }
    if (form.province.value.trim() === '日本') {
      var cityJPVal = $('select#cityJP').val();
      if(cityJPVal === '' || cityJPVal === '请选择城市'){
        alert('请选择省!');
        // alert('请选择省!');
        return false;
      }else {
        form.city.value = cityJPVal;

      }
    }

    $('footer button').prop('disabled', true).html('正在保存...');
    // console.log('222-'+ startDate + endDate);
  });
})();
