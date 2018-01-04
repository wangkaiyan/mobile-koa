var fs = require('fs');
var config = require('./index');
var _ = require('lodash');
var util = require('util');
var path = require('path');
var swig = require('swig');
var moment = require('moment');
var crypto = require('crypto');
// var translator = require('../support/translator');

// 东八区
swig.setDefaultTZOffset(-480);

// 配置模板加载路径
swig.setDefaults({
  loader: swig.loaders.fs(path.dirname(__dirname)),
  cache: config.templateCache // disabled for dev, should be commented on product
});

// 根据路径计算文件实际存储位置
function calpath(input) {
  if (/^\/static\//.test(input)) {
    return path.join(config.static, String(input).replace('/static/', ''));
  }
  return path.join(config.assets, String(input).replace('/assets/', ''));
}

// 添加静态版本控制
var versions = {}; 
swig.setFilter('version', function (input) {
  if (!versions[input]) {
    var file = calpath(input);
    try {
      var text = fs.readFileSync(file).toString();
      var version = crypto.createHash('md5').update(text).digest('hex').substring(0, 8).toUpperCase();
      var extname = path.extname(file);
      // 需要配合静态路径重写路由
      versions[input] = util.format('%s/%s-$%s$%s', path.dirname(input), path.basename(input, extname), version, extname);
    }
    catch (e) {
      var extname = path.extname(input);
      versions[input] = util.format('%s?$%s$%s', input, Date.now(), extname);
    }
  }

  return versions[input];
});

swig.setFilter('rmstyle', function (content) {
  return content.replace(/(\s?style=".+?")|(\s?class=".+?")/g, '');
});

swig.setFilter('rmhtml', function (content) {
  var regex = /(<([^>]+)>)/ig;
  return content.replace(regex, '');
});

// 包含
swig.setFilter('contains', function (list, item) {
  return list.indexOf(item) !== -1;
});

// 被包含
swig.setFilter('contained', function (input, list) {
  return list.indexOf(input) !== -1;
});

// 迭代数组
swig.setFilter('range', function (input, end) {
  var array = [];
  input = Math.max(input, 0);
  array.length = end ? end - input : input;
  return array;
});

// 添加性别过滤器
swig.setFilter('sex', function (input) {
  return ['女士', '先生'][input] || '保密';
});

// 添加小数点
swig.setFilter('currency', function (input, size, symbol) {
  return _.isUndefined(input) ? '' : (_.isUndefined(symbol) ? '￥' : symbol) + Number(input).toFixed(_.isUndefined(size) ? 2 : size);
});

// 设置class
swig.setFilter('clazz', function (input, name) {
  return input ? name : '';
});

// 截取字符串
swig.setFilter('substring', function (input, i, j) {
  return String(input).substring(i, j);
});

// 时间段
swig.setFilter('duration', function (input) {
  var times = input.split(',');
  var x = new Date(times[0] * 1000);
  var y = new Date(times[1] * 1000);
  var m = x.getMonth() + 1;
  var d = x.getDate();
  var t1 = moment(x).format('HH:mm');
  var t2 = moment(y).format('HH:mm');
  return util.format('%d月%d日 %s-%s', m, d, t1, t2);
});

// 转换数字
swig.setFilter('number', function (input) {
  return Number(input);
});

// 保留小数
swig.setFilter('toFixed', function (input, count) {
  return Number(input).toFixed(count);
});

// 分割数组
swig.setFilter('group', function (list, number) {
  list = list || [];
  var bunch = [];
  var piece = [];
  for (var i = 0; i < list.length; i++) {
    piece.push(list[i]);
    if (piece.length === number) {
      bunch.push(piece);
      piece = [];
    }
  }
  if (piece.length) {
    bunch.push(piece);
  }
  return bunch;
});

// 截取字符串
swig.setFilter('truncate', function (input, size) {
  input = String(input || '');
  if (input.length <= size) {
    return input;
  }
  return input.substring(0, size) + '...';
});

// 通用业态的价格
swig.setFilter('orderStatusFilter', function (orderStatus) {
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
