var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var request = require('request');
var config = require('../config');
var logger = require('./logger');

var walk = exports.walk = function (dir) {
  var results = [];
  var list = fs.readdirSync(dir);
  var pending = list.length;

  list.forEach(function (file) {
    file = path.resolve(dir, file);
    var stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    }
    else {
      results.push(file);
    }
  });
  return results;
};

var callsite = exports.callsite = function () {
  var orig = Error.prepareStackTrace;
  Error.prepareStackTrace = function (_, stack) {
    return stack;
  };
  var err = new Error();
  Error.captureStackTrace(err, callsite);
  var stack = err.stack;
  Error.prepareStackTrace = orig;
  return stack;
};

function rebuild(res) {
  try {
    res = JSON.parse(res);
  }
  catch (e) {
    return res;
  }

  if (_.isUndefined(res.code)) {
    return {
      code: 200,
      data: res
    };
  }
  res.code = parseInt(res.code, 10) || 200;
  res.data = res.data2 || res.data || {};
  if (_.isArray(res.data)) {
    res.data = {
      list: res.data
    };
  }
  if (_.isPlainObject(res.data)) {
    res.data.message = res.msg || res.message || res.data.msg || res.data.message;
  }

  delete res.msg;
  delete res.message;
  delete res.data.msg;

  // 防止数据结构异常
  _.forIn(res, function (val, key) {
    if (key !== 'code' && key !== 'data') {
      res.data[key] = val;
      delete res[key];
    }
  });
  return res;
}

exports.request = function (options, unpack) {
  logger.info('---Http:', options);
  return new Promise(function (resolve, reject) {
    request(_.merge({
      gzip: true,
      timeout: 20000
    }, options), function (error, response, body) {
      if (error) {
        return reject(error);
      }
      try {
        logger.info('---Response', body);
        var jsonapi = rebuild(body);
        if (response.statusCode === 200) {
          if (unpack !== false) { // 拆包
            if (jsonapi.code === 200) {
              return resolve(jsonapi.data);
            }
            else {
              return reject(jsonapi.data);
            }
          }
        }
        return resolve(jsonapi);
      }
      catch (e) {
        logger.error('接口异常', body);
        return reject({
          message: '接口JSON解析异常'
        });
      }
    });
  });
};

function getPlatform(context) {
    return 'weixin';
}

function authorize(context) {
  var whost = config.whost;
  return exports.request2(context, {
    url: whost + '/s5x-web/api/json/user/authorize',
    data: {
      userId: context.session.member.userId
    }
  });
}

exports.request2 = function (context, options, unpack) {
  var params = _.clone(options, true);
  // 处理参数
  var data = params.data;
  // 有些接口不统一，不需要变换参数
  if (options.wrap !== false) {
    data = {
      body: JSON.stringify(_.merge({
        appDevice: {
          platform: getPlatform(context),
          version: options.version || config.api.version,
          device: 'H5'
        },
      }, params.data)),
      userToken: context.session.token,
    };
  }

  // 判断类型
  if (!params.method || params.method.toLowerCase() === 'get') {
    params.qs = data;
  }
  else {
    params.form = data;
  }
  delete params.data;

  logger.info('---Http:', params);
  return new Promise(function (resolve, reject) {
    request(_.merge({
      gzip: true,
      timeout: 20000
    }, params), function (error, response, body) {
      if (error) {
        return reject(error);
      }
      try {
        var jsonapi = rebuild(body);
        logger.info(body);
        if (response.statusCode === 200) {
          if (unpack !== false) {
            if (jsonapi.code === 200) {
              return resolve(jsonapi.data);
            }
            else if (jsonapi.code === 401 || jsonapi.code === 406) {
              context.session.token = null;
              context.tokenTimes = context.tokenTimes || 0;
              context.tokenTimes += 1;
              if (context.tokenTimes > 3) {
                return reject(jsonapi);
              }
              return authorize(context).then(function (data) {
                context.session.token = data.userToken;
                return resolve(exports.request2(context, options, unpack));
              }, function (rej) {
                return reject(rej);
              });
            }
            else {
              logger.error(options.url, '\n', body);
              return reject(jsonapi.data);
            }
          }
          return resolve(jsonapi);
        }
      }
      catch (e) {
        logger.error('接口异常', e, body);
        return reject({
          message: '接口JSON解析异常'
        });
      }
    });
  });
};

exports.clean = function (data) {
  _.forIn(data, function (val, key) {
    if (_.isEmpty(val) || _.isUndefined(val)) {
      delete data[key];
    }
  });
  return data;
};