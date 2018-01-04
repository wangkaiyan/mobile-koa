// 个人设置页
(function () {
  if (location.pathname !== '/account/settings') {
    return false;
  }

  // 上传头像
  $(document).on('change', 'input[name="file"]', function (e) {
    var input = $(this)[0];
    if (input.files.length === 0) {
      return false;
    }
    var formData = new FormData($( "#uploadForm" )[0]);
    var da = new FormData();
    // da.append('file', input.files[0]);
    // e.preventDefault();
    $.ajax({
      url: 'http://101.200.88.235:8181/s5x-web/upload/imageUpload',
      // url: '/common/upload',
      type: 'POST',
      data: formData,
      async: false,
      cache: false,
      contentType: false,
      processData: false,
      success: function (data) {
        var avatar = data.data.entity;
        $.ajax({
          url: '/account/ajax/update',
          type: 'put',
          data: {
            picturePath: avatar
          }
        }).then(function (res) {
          if (res.code === 200) {
            $("#headImgUrl").attr('src', avatar);
          }
        });
      },
      error:function(data){
        alert("error");
      }
    });
  });

  // 修改性别
  $(document).on('change', 'select[name="gender"]', function (e) {
    $.ajax({
      url: '/account/ajax/update',
      type: 'put',
      data: {
        memberGender: $(this).val()
      }
    })
  });

  // 修改用户昵称
  $(document).on('click', '#nickNameDivId', function () {
    var username = $(this).find('.extra').text();
    Modal.confirm({
      title: '修改昵称',
      message: '<div class="list"><label class="item item-input"><span class="label">昵称</span><span class="control"><input  class="input-line2" type="text" name="username" placeholder="请输入您的昵称" maxlength="20" value="' + username + '" /></span></label></div>',
      callback: function () {
        var input = $(this.widget).find('[name="username"]');
        var newname = input.val().trim();
        if (newname && newname !== username) {
          if (/[\\'"<>]/.test(newname)) {
            return notice('请不要输入特殊字符');
          }
          $.ajax({
            url: '/account/ajax/update',
            type: 'put',
            data: {
              nickName: newname
            }
          }).then(function (res) {
            if (res.code === 200) {
              $('.extra').html(res.data.nickName);
              // notice('修改昵称成功');
            }
            else {
              notice(res.data.message || '修改昵称失败');
            }
          });
        }
      }
    });
  });

  // 修改个人签名
  $(document).on('click', '.item.signature', function () {
    var signature = $(this).find('.extra').text();
    Modal.confirm({
      title: '修改个性签名',
      message: '<div class="list"><label class="item item-input"><span class="label">签名</span><span class="control"><input type="text" name="signature" placeholder="最多36个文字..." maxlength="36" value="' + signature + '" /></span></label></div>',
      callback: function () {
        var input = $(this.widget).find('[name="signature"]');
        var newsign = input.val().trim();
        if (newsign && newsign !== signature) {
          if (/[\\'"<>]/.test(newsign)) {
            return notice('请不要输入特殊字符');
          }
          $.ajax({
            url: '/account/ajax/update',
            type: 'put',
            data: {
              memberSignature: newsign
            }
          }).then(function (res) {
            if (res.code === 200) {
              $('.item.signature .extra').html(res.data.memberSignature);
              // notice('修改个性签名成功');
            }
            else {
              notice(res.data.message || '修改个性签名失败');
            }
          });
        }
      }
    });
  });

})();


// 修改密码
(function () {
  if (location.pathname.indexOf('/account/password') === -1) {
    return false;
  }

  // 校验表单
  $(document).on('click', '.button.submit', function () {
    var button = $(this);

    if ($('input[name=oldpwd]').val() == "") {
      return notice("请输入旧密码");
    }
    else if ($('input[name=newpwd]').val().length < 6) {
      return notice("新密码长度至少为6位");
    }

    button.prop('disabled', true);
    $.post('/account/ajax/password', {
      oldpwd: $('input[name=oldpwd]').val(),
      newpwd: $('input[name=newpwd]').val(),
    }).then(function (res) {
      if (res.code == 200) {
        Modal.alert({
          title: '',
          message: '修改成功',
          confirmText: '返回',
          callback: function () {
            location.href = '/account/profile';
          }
        });
      }
      else {
     /*   return notice('请不要输入特殊字符');*/
        notice(res.data.message || '修改密码失败，请稍后再试');
        button.prop('disabled', false);
      }
    });
  });
})();
