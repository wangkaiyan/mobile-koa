
// 权限拦截
$(document).on('ajaxSuccess', function (e, xhr, data, res) {
  if (res.code === 403) {
    Modal.confirm({
      message: '您需要登录之后才能操作',
      callback: function () {
        var agent = navigator.userAgent.toLowerCase();
       /* if (agent.indexOf('micromessenger') !== -1 || agent.indexOf('ali') !== -1) {
          return location.href = '/account/improve?next=' + encodeURIComponent(location.href);
        }*/
        return location.href = '/account/login?next=' + encodeURIComponent(location.href);
      }
    });
  }
});

/**
 * 通知
 */
(function () {
  var timer = null;
  var lasted = 1000;
  var instance = null;

  var notice = window.notice = function (message, type) {
    if (instance === null) {
      instance = $('<div class="js-notice" />').appendTo('body');
    }
    type = type || 'normal';
    instance.removeClass('overdue').html('<span class="' + type + '">' + message + '</span>');
    clearTimeout(timer);
    timer = setTimeout(function () {
      instance.addClass('overdue');
    }, lasted);
    return false;
  };

  // 添加快捷方式
  ['message', 'success', 'warning', 'failure'].forEach(function (name) {
    notice[name] = function (message) {
      notice(message, name);
    };
  });
})();

/**
 * 脚本组件都通过这个实例来创建
 */
(function () {
  // 缓存编译模板
  var cache = {};

  // 当前激活的实例
  var instance = null;

  var Template = window.Template = {

    // 编辑
    compile: function (selector, context) {
      var translate = cache[selector];
      if (!translate) {
        var fragment = selector;
        var container = $(selector)
        if (container.is('[type="text/swig-template"]')) {
          fragment = container.html();
        }
        cache[selector] = translate = swig.compile(fragment);
      }
      return translate(context).toString();
    },

    // 通过选择器编译
    render: function (selector, context, fn) {
      fn = fn || $.noop;
      this.remove();
      instance = $(this.compile(selector, context));
      $('body').append(instance);
      fn(instance, context);
      return instance;
    },

    // 隐藏
    hide: function () {
      if (instance) {
        instance.hide();
      }
    },

    // 移除
    remove: function () {
      if (instance) {
        instance.remove();
        instance = null;
      }
    },

    // 句柄
    getInstance: function () {
      return instance;
    }
  };

})();



/**
 * 弹窗控件
 */
(function (global) {
  var alertTempl = '\
    <div class="masklayer flexbox {% if mode %}mode{% endif %}">\
      <div class="modal">\
        <div class="wrap">\
          <h3 class="title text-center">{{ title|safe }}</h3>\
          <div class="content text-center">{{ message|safe }}</div>\
        </div>\
        <a class="footer" {% if url %}href="{{ url }}"{% endif %}>\
          <span class="text-blue">{{ confirmText|safe }}</span>\
        </a>\
      </div>\
    </div>';



  var confirmTempl_old = '\
    <div class="masklayer flexbox {% if mode %}mode{% endif %}">\
      <div class="modal">\
        <div class="wrap">\
          <h3 class="title text-center">{{ title|safe }}</h3>\
          <div class="content text-center">{{ message|safe }}</div>\
        </div>\
        <div class="footer">\
          <div class="button-group">\
            <button class="text-center button small square transparent text-blue" data-dismiss="true">{{ cancelText|safe }}</button>\
            <button class="text-center button small square transparent text-blue confirm">{{ confirmText|safe }}</button>\
          </div>\
        </div>\
      </div>\
    </div>';

  var confirmTempl = '\
  <div class="mask-layer">\
    <div class="modal">\
    <div class="wrap">\
    <h3 class="title">{{ title|safe }}</h3>\
    <div class="content">{{ message|safe }}</div>\
    </div>\
    <div class="footer1">\
    <div class="button-group">\
    <button class="text-center button small square transparent text-blue"  data-dismiss="true">{{ cancelText|safe }}</button>\
    <button  class="text-center button small square transparent text-blue confirm">{{ confirmText|safe }}</button>\
    </div>\
    </div>\
    </div>\
    </div>';


  var loadingTempl = '\
      <div class="masklayer flexbox mode">\
        <div class="spinner-loader">loading</div>\
      </div>';

  // 默认文案
  var options = {
    title: '温馨提示',
    message: '欢迎您',
    cancelText: '取消',
    confirmText: '确定',
    mode: false,
    callback: $.noop,
  };

  global.Modal = {

    alert: function (context, callback) {
      if (typeof context !== 'object') {
        context = {
          message: context
        };
      }
      if (typeof callback === 'function') {
        context.callback = callback;
      }

      context = $.extend({}, options, context);
      var widget = context.widget = Template.render(alertTempl, context);
      widget.on('click', '.footer', function () {
        if (context.callback() !== false && Template.getInstance() === widget) {
          Template.hide();
        }
      });

      return widget;
    },

    confirm: function (context, callback) {
      if (typeof context !== 'object') {
        context = {
          message: context
        };
      }
      if (typeof callback === 'function') {
        context.callback = callback;
      }
      context = $.extend({}, options, context);

      var widget = context.widget = Template.render(confirmTempl, context);
      widget.on('click', '.footer1 [data-dismiss]', function () {
        Template.hide();
      });
      widget.on('click', '.footer1 .confirm', function () {
        if (context.callback() !== false && Template.getInstance() === widget) {
          Template.hide();
        }
      });

      return widget;
    },

    loading: function (context, callback) {
      if (typeof context !== 'object') {
        context = {
          message: context
        };
      }

      context = $.extend({}, options, context);
      var widget = context.widget = Template.render(loadingTempl, context);
      return widget;
    }
  };
})(window);

/**
 * 浮窗控件
 */
(function (global) {

  var popupTempl = '<div class="masklayer">{{ content|safe }}</div>';

  global.Popup = {
    render: function (context, callback) {
      if (typeof context !== 'object') {
        context = {
          content: context
        };
      }
      if (typeof callback === 'function') {
        context.callback = callback;
      }

      var widget = context.widget = Template.render(popupTempl, context);

      // 触发关闭
      widget.on('click', '[data-dismiss]', function () {
        Template.hide();
      });

      // 触发回调
      widget.on('click', '[data-trigger]', function () {
        if (context.callback() !== false && Template.getInstance() === widget) {
          Template.hide();
        }
      });

      return widget;
    },
  };

})(window);

/*!
 * 吐司控件
 */
(function (global) {

  var toastTempl = '<div class="toast" ui-mode="mask">\
    <span class="text">\
      <i class="icon" ui-mode="{{ extra }}">{{ icon|safe }}</i> {{ message|safe }}\
    </span>\
  </div>';

  var widget = null;

  // 预配置
  var preconfig = {
    loading: {
      icon: '&#xe619;',
      message: '载入中',
      extra: 'wait'
    },
    failure: {
      icon: '&#xe61d;',
      message: '操作失败',
    },
    success: {
      icon: '&#xe61c;',
      message: '操作成功',
    },
    network: {
      icon: '&#xe616;',
      message: '网络异常',
    },
    message: {
      icon: '&#xe601;',
      message: '天啦噜',
    },
  };

  var timer = null;

  global.Toast = {

    show: function (options) {
      if (widget !== null) {
        widget.remove();
      }
      var context = $.extend({
        icon: '&#xe601;',
        message: '天啦噜',
        holding: 4000
      }, options);

      widget = Template.render(toastTempl, context)

      if (typeof context.holding === 'number') {
        clearTimeout(timer);
        timer = setTimeout(Toast.hide.bind(Toast), context.holding);
      }

      return widget;
    },

    hide: function () {
      if (widget !== null) {
        widget.hide();
      }
      return widget;
    },
  };

  // 添加快捷方式
  Object.keys(preconfig).forEach(function (type) {
    Toast[type] = function (options) {
      if (typeof options !== 'object') {
        options = {
          message: options
        };
      }
      return this.show($.extend({}, preconfig[type], options));
    };
  });
})(window);

/**
 * 选项卡效果
 */
(function () {
  // 核心方法
  var tab = function (e) {
    var current = $(this);
    var previous = current.siblings('.item.active');
    // 隐藏前个TAB
    previous.removeClass('active');

    // 隐藏容器
    $(previous.attr('href')).removeClass('active');

    // 激活当前TAB
    current.addClass('active');
    $(current.attr('href')).addClass('active');
    if (e) {
      e.preventDefault();
    }
  };

  // 添加插件
  $.fn.tab = function () {
    return $(this).each(function () {
      tab.call(this);
      $(this).triggerHandler('click');
    });
  };

  // 全局代理
  $(document).on('click', '.tabs[data-tabs="true"] > .item', tab);
})();

/**
 * 下拉菜单效果
 */
(function () {
  $(document).on('click', function () {
    $('.dropdown').removeClass('active');
  });

  $(document.body).on('click', '.dropdown .toggle', function (e) {
    var dropdown = $(this).parents('.dropdown').eq(0);
    $('.dropdown').not(dropdown).removeClass('active');
    dropdown.toggleClass('active');
    e.stopPropagation();
  });

  $(document.body).on('click', '.dropdown .menubar', function (e) {
    setTimeout(function () {
      $(this).parents('.dropdown').removeClass('active');
    }.bind(this), 0);
    e.stopPropagation();
  });
})();

////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * 监听滚动回调 通常用于翻页
 */
(function (global) {

  var fns = [];

  // 给文档绑定滚动事件
  var addLisener = function () {
    // 滚动临界点
    var threshold = 300;
    // 防止重复请求
    var loading = false;
    var $window = $(window);
    $(window).on('scroll.more resize.more lookup.more', function (e) {
      if (!loading) {
        // 整个高度 - 滚动条位置 < threshold
        // if (document.body.scrollHeight - document.body.scrollTop - document.documentElement.clientHeight < threshold) {
        if (document.body.scrollHeight - document.body.scrollTop - document.body.clientHeight < threshold) {
          loading = true;
          fireCallback().then(function (data) {
            loading = false;
            return data;
          });
        }
      }
    });

    addLisener = $.noop;
  };

  // 调用注册回调
  var fireCallback = function () {
    return new Promise(function (resolve, reject) {
      var num = fns.length;
      var list = [];
      fns.forEach(function (fn) {
        fn().then(function (res) {
          list.push(res);
          --num;
          if (num === 0) {
            resolve(list);
          }
        });
      });
    });

  };

  // 添加滚动事件
  global.listenScroll = function (fn) {
    if (typeof fn === 'function' && fns.indexOf(fn) === -1) {
      fns.push(fn);
      addLisener();
    }
  };

  // 添加一个翻页模板函数
  global.loadMoreFactory = function (options) {
    // 加载更多分页
    var page = options.page || 1;
    var size = options.size || 10;
    // 是否执行
    var before = options.before || function () {
      return true;
    };
    // 事后回调
    var after = options.after || $.noop;

    var more = true; // 是否有更多数据

    // 第一个回调
    return listenScroll(function () {
      return new Promise(function (resolve, reject) {
        if (more === false || !before()) {
          return resolve(null);
        }
        // 添加loading文案
        if ($('article p.loadmore').length === 0) {
          $('article').append('<p class="loadmore">正在加载...</p>');
        }
        $.get(options.url, {
          page: ++page,
          size: size,
        }).then(function (res) {
          if (res.code === 200) {
            var pieces = $(Template.compile(options.template, res.data)).appendTo(options.panel);
            // 添加延迟加载图片功能
            // pieces.find('img[data-src]').unveil(300);
            more = res.data.list.length >= size;
            after(res.data);

            if (!more) {
              $('article p.loadmore').remove();
              $('article').after($('<div class="placeholder-bottom"></div>'));
            }
          }
          resolve(res);
        });
      });
    });
  };

})(window);

/**
 * 浮动窗口
 */
(function (global) {
  var templ = '\
    <div class="masklayer">\
      <div class="popup coupons">\
        <header class="header"><h3 class="title">{{ title }}</h3></header>\
        <section class="has-footer">\
          {% if expiring %}\
            <div class="alert alert-warning text-center small">您有 {{ expiring }} 张券即将过期</div>\
          {% endif %}\
          {% if common.length %}\
           <div class="list compact overlap">\
            {% for item in common %}\
              <label class="item">\
                <input type="checkbox" name="common" value="{{ item.code }}" {% if checks|contains(item.code)%}checked{% endif %} />\
                <div class="text">\
                  <div class="money">{{ item.price }}</div>\
                  <div class="text-sm">\
                    <span>{{ item.productNoNames }}</span>\
                    <div class="text-gray">{{ item.startTime|date("Y/m/d") }} ~ {{ item.endTime|date("Y/m/d") }}</div>\
                  </div>\
                </div>\
              </label>\
            {% endfor %}\
            </div>\
          {% else %}\
            <div class="vspace text-center text-gray" ui-mode="50px">没有可用的券</div>\
          {% endif %}\
        </section>\
        <footer class="bar bar-footer bar-fixed bar-flat">\
          <div class="flexbox compact">\
            <div class="item"><a class="button default square" data-dismiss="true">取消</a></div>\
            <div class="item"><a class="button warning square confirm" data-dismiss="true">确定</a></div>\
          </div>\
        </footer>\
      </div>\
    </div>';

  global.Coupon = {

    render: function (options, callback) {
      var self = this;
      var checks = options.checks || [];
      $.get('/cashier/ajax/coupons', {
        business: options.business,
        projectId: options.projectId,
        skuData: JSON.stringify(options.skuData),
        priceStrategy: options.priceStrategy
      }).then(function (res) {
        if (res.code === 200) {
          // 缓存
          var coupons = [].concat(checks);

          var context = $.extend({
            title: '选择优惠券',
            checks: checks,
            callback: callback || $.noop
          }, res.data);

          // 渲染
          var widget = Template.render(templ, context);

          // 触发关闭
          widget.on('click', '[data-dismiss]', function () {
            Template.hide();
          });

          widget.on('change', 'input[type="checkbox"]', function () {
            var code = this.value;
            var element = $(this);

            // 检查是否可用
            if (!this.checked) {
              coupons.splice(coupons.indexOf(code), 1);
            }
            else {
              self.isAvalible(coupons.concat(code), options.skuData, options.priceStrategy, options.business, options.projectId).then(function (res) {
                if (res.data.entity) {
                  coupons.push(code);
                }
                else {
                  notice(res.data.message);
                  element.prop('checked', false);
                }
              });
            }
          });

          widget.on('click', '.bar .confirm', function () {
            var data = [];
            coupons.forEach(function (code) {
              res.data.common.forEach(function (item) {
                if (item.code === code) {
                  data.push(item);
                }
              });
            });

            // 执行回调
            context.callback(data);
          });
        }
        else {
          notice(res.data.message);
        }
      });
    },

    // 检查优惠券是否可用
    isAvalible: function (coupons, skuData, priceStrategy, business, projectId, orderCode) {
      var formData = {
        couponCodes: coupons,
        skuData: skuData,
        priceStrategy: priceStrategy || 0,
        productNo: business,
        projectId: projectId
      }
      if (orderCode) {
        formData.orderCode = orderCode;
      }
      return $.ajax({
        url: '/cashier/coupons/check',
        type: 'post',
        data: formData,
        dataType: 'json'
      });
    }
  };
})(window);

/*!
 * 滑动焦点图
 */
(function (global) {

  global.swipe = function (selector) {
    var index = 0;
    var pages = null;
    var items = $(selector).find('.wrap > .item');
    var basis = $(selector).prop('offsetWidth');

    // 添加分页
    if (items.length > 1) {
      var frag = '';
      for (var i = 0; i < items.length; i++) {
        frag += '<a class=""></a>';
      }
      var foot = $('<div class="pages" />').html(frag);
      pages = foot.children();
      pages.eq(index).addClass('active');
      $(selector).append(foot);
    }

    // 设置容器宽度
    $(selector).find('.wrap').css('width', basis * items.length);

    // 设置元素宽度
    items.forEach(function (item) {
      $(item).css('width', basis);
    });

    // 自动播放
    var timer = null;

    // 移动效果
    var running = false;

    function move(index) {
      running = true;
      clearInterval(timer);
      $('.swipe > .wrap').animate({
        left: -index * basis
      }, 400, 'ease-in-out', function () {
        running = false;
        pages.removeClass('active').eq(index).addClass('active');
        autoplay();
      });
    }

    // 左移
    function move2left() {
      if (!running) {
        index = index + 1;
        if (index >= items.length) {
          index = 0;
        }
        move(index);
      }
    }

    // 右移
    function move2right() {
      if (!running) {
        index = index - 1;
        if (index < 0) {
          index = items.length - 1;
        }
        move(index);
      }
    }

    // 记录起始点
    var xDown = null;
    var yDown = null;

    // 移动判断
    function handleMove(evt) {
      evt.preventDefault();
      var xUp = evt.touches[0].clientX;
      var yUp = evt.touches[0].clientY;

      var xDiff = xDown - xUp;
      var yDiff = yDown - yUp;

      // 水平移动
      if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > 80) {
        if (xDiff > 0) {
          /* left swipe */
          move2left();
        }
        else {
          /* right swipe */
          move2right();
        }
      }
    }

    // 开始
    $(selector).on('touchstart', function (evt) {
      xDown = evt.touches[0].clientX;
      yDown = evt.touches[0].clientY;
      $(document).on('touchmove', handleMove);
    });

    // 结束
    $(document).on('touchend', function (evt) {
      $(document).off('touchmove', handleMove);
    });

    // 分页
    $(this).on('click', '.pages a', function () {
      index = $(this).index();
      move(index);
    });

    // 自动开始
    function autoplay() {
      clearInterval(timer);
      timer = setInterval(move2left, 5000);
    }

    autoplay();
  };

  // 默认滚动
  $('[data-swipe="true"]').each(function () {
    swipe(this);
  });
})(window);

/**
 * 延迟加载图片
 */
(function ($) {
  $.fn.unveil = function (threshold, callback) {
    var $w = $(window),
      th = threshold || 0,
      retina = window.devicePixelRatio > 1,
      attrib = retina ? "data-src-retina" : "data-src",
      images = this,
      loaded;

    this.one("unveil", function () {
      var source = this.getAttribute(attrib);
      source = source || this.getAttribute("data-src");
      if (source) {
        this.setAttribute("src", source);
        if (typeof callback === "function") callback.call(this);
      }
    });

    function unveil() {
      var inview = images.filter(function () {
        var $e = $(this);
        if ($e.is(":hidden")) return;

        var wt = $w.scrollTop(),
          wb = wt + $w.height(),
          et = $e.offset().top,
          eb = et + $e.height();

        return eb >= wt - th && et <= wb + th;
      });

      loaded = inview.trigger("unveil");
      images = images.not(loaded);
    }

    if (images.length) {
      $w.on("scroll.unveil resize.unveil lookup.unveil", unveil);
    }
    unveil();
    return this;
  };

  // 默认开启延迟加载
  $('img[data-src]').unveil(300);
})(window.jQuery || window.Zepto);
