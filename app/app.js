var koa = require('koa.io');
var _ = require('lodash');
var util = require('util');
var path = require('path');
var swig = require('swig');
var cluster = require('cluster');
var gzip = require('koa-gzip');
var koaBody = require('koa-body');
var session = require('koa-generic-session');
var redisStore = require('koa-redis');
var minifier = require('koa-html-minifier');
var assets = require('koa-static-cache');
var flash = require('koa-flash');
var compose = require('koa-compose');
var config = require('./config');
var interceptor = require('./config/interceptor');
var support = require('./support');
var favicon = require('./support/favicon');
var logger = require('./support/logger');

require('./config/filter');

var app = module.exports = koa();

app.use(favicon(config.favicon));

app.use(gzip());

// 访问静态资源
app.use(compose([

  function * (next) {
    if (this.path.indexOf('/static/') === 0) {
      this.path = this.path.replace(/-\$[\d\w]+\$/i, '');
    }
    yield * next;
  },
  assets(config.static, {
    maxAge: 365 * 24 * 60 * 60,
    gzip: true,
    prefix: '/static'
  })
]));

app.keys = ['LWXA@0ZrXj~!]/mNHH98j/3yX R,?RT'];

var sessionGen = session({
  key: 'T',
  ttl: 48 * 60 * 60 * 1000,
  store: redisStore({
    host: config.redis.host,
    port: config.redis.port,
    auth_pass: config.redis.pass,
    db: config.redis.db,
  }),
  cookie: {
    maxage: 365 * 24 * 60 * 60 * 1000
  }
});

app.use(sessionGen);

// 去除HTML页面中的换行和空白
app.use(minifier({
  minifyJS: true,
  minifyCSS: true,
  collapseWhitespace: true,
  keepClosingSlash: true,
  removeComments: true,
  processScripts: ['text/swig-template']
}));

// 解析form
app.use(koaBody({
  strict: false,
  jsonLimit: 1024 * 1024 * 2, // 2MB
  formLimit: 1024 * 1024 * 2, // 2MB
  textLimit: 1024 * 1024 * 2, // 2MB
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname, '../upload')
  }
}));


// 判断是否是内嵌浏览器
app.use(function * (next) {
  var headers = this.headers || {};
  var userAgent = (this.headers['user-agent'] || '').toLowerCase();
  // 客户端判断
  this.ua = {
       weixin: userAgent.indexOf('micromessenger') !== -1,
  };
  // 是否是Ajax
  this.request.isAjax = this.headers['x-requested-with'] === 'XMLHttpRequest';
  yield next;
});


// 设置模板引擎
app.use(function * (next) {
  var ticket = null;


  this.render = function (name) {
    // 构造数据
    var data = {};

    // 字符串处理
    if (_.isString(arguments[1])) {
      data.message = arguments[1];
    }
    // 合并数据
    else {
      _.merge.apply(_, [data].concat(Array.prototype.splice.call(arguments, 1)));
    }

    // 返回接口
    if (_.isNumber(name)) {
      return {
        code: name,
        data: data
      }
    }

    // 返回页面
    if (/^[^./]/i.test(name)) {
      var folder = path.dirname(support.callsite()[1].getFileName());
      name = path.resolve(folder, name);
    }
    return swig.renderFile(name, data);
  };

  this.template = {
    render: this.render.bind(this)
  };

  yield next;
});

// 覆写SESSION 不能session = { ... }
function * sessionRewrite(data) {
  yield this.regenerateSession();
  return _.merge(this.session, data);
}

function getRedirect(context) {
  var query = _.clone(context.query);
  delete query.memberId;
  delete query.accountId;
  delete query.auth_code;
  var search = [];
  for (var key in query) {
    search.push(key + '=' + encodeURIComponent(query[key]));
  }

  return context.path + '?' + search.join('&');
}

support.walk(__dirname).forEach(function (path) {
  if (/\broutes\.js$/.test([path])) {
    var router = require(path);
    app.use(router.routes());
    app.use(router.allowedMethods());
  }
});

// 激活socket.io session
app.io.use(compose([sessionGen, interceptor.recover]));

app.listen(config.port, function () {
 });