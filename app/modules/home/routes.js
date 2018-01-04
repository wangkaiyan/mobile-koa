require('./filter');
var Router = require('koa-router');
var service = require('./service');
var router = module.exports = new Router();

router.redirect('/', '/home');

// 网站首页
router.get('/home', function * (next) {
  var data = yield {
    themes: service.themeList(this),
    products: service.productList(this),
    rolling: service.rollingList(this),
    rate: service.getChangeRate(this)
  }
   this.body = this.render('templates/home.html', data, {list: data.products.list});
});
