var path = require('path');
var environment = {};
module.exports = {

  cluster: 8,

  port: 9229,

  platform: 'app',

  templateCache: 'memory',

  startMode: 'deploy',

  // redis
  redis: {
    host: '101.200.88.235',
    port: '27688',
    pass: 'dsEsa(3fs',
    db: '1'
  },

  // 静态目录
  assets: path.join(__dirname, environment.templateCache === false ? '../../assets/temp' : '../../assets/dist'),

  // 静态目录
  static: path.join(__dirname, environment.templateCache === false ? '../../static/.tmp' : '../../static/dist'),

  whost: 'http://101.200.88.235:8181',
  // favicon路径
  favicon: path.resolve(__dirname, '../favicon.ico'),

  api: {
    version: '1.0.0'
  },
  log: {
    file: '/logs/mobile.log', // INFO日志文件位置
    errorfile: '/logs/mobile-error.log', // ERROR日志文件位置
  },
};