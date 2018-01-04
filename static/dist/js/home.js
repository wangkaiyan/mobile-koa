// 首页
(function () {
  if (location.pathname !== '/home') {
    return false;
  }

  // 未使用
  loadMoreFactory({
    size: 20,
    url: '/shopping/ajax/goods',
    panel: '#goods',
    template: '#goodsTempl'
  });


})();

// 首页
(function () {
  if (location.pathname !== '/shopping/search') {
    return false;
  }

  var content = $('input#search-home-search2').val();

  // 未使用
  loadMoreFactory({
    size: 20,
    url: '/shopping/ajax/search?content='+content,
    panel: '#goods',
    template: '#goodsTempl'
  });


})();
