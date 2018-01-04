// 邀请注册
(function () {
  if (location.pathname.indexOf('/account/forgot') === -1) {
    return false;
  }

  // 发送验证码
  $(document).on('click', '.login-msg1', function (e) {
    var button = $(this);
    var mobile = $('input[name="mobile"]').val();
    var email = $('input[name="email"]').val();
    var type =   $('input[name="type"]').val();

    if (type == 1 &&!/^\d{11}$/.test(mobile)) {
      return notice('请输入正确的手机号');
    }
    if (type == 2 && ! /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/.test(email)) {
      return notice('请输入正确的邮箱');
    }



    $("#send1").css("display", "none");
    $("#send2").css("display", "");
    var i = 60;
    var interval = setInterval(function () {
      if(i > 0){
        i--;
        $("#send2").html(i);
      } else {
        clearInterval(interval);
        i = 60;
        $("#send2").html(i);
        $("#send1").css("display", "");
        $("#send2").css("display", "none");
      }
    }, 1000);


    $.post('/account/ajax/captcha', {
      mobile: mobile,
      email: email,
      action: 2, // 找回密码
      type:type,
    }).then(function (res) {
      if (res.code == 200) {
        notice('发送验证码成功');
      }
      else {
        notice(res.data.message || '发送验证码失败');
      }
    });

  });

  // 校验表单
  $(document).on('click', '.button.submit', function () {
    if ($('input[name=mobile]').val() == "") {
      return notice("请输入手机号");
    }
    else if ($('input[name=captcha]').val() == "") {
      return notice("请输入验证码");
    }
    else if ($('input[name=password]').val().length < 6) {
      return notice("密码长度至少为6位");
    }
  });
})();
