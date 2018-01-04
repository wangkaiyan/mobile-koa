function $G(id) {
    return document.getElementById(id);
}
window.onload=function () {
    // var html = '';
    // for(var i =0;i<50;i++) {
    //     html += '<p>a' + i + 'b</p>';
    // }
    // $G('nr').innerHTML = html;
};
function goBack() {
    history.go(-1);
}
function goUrl(url) {
  location.href = url;
}

var __show__ = false;
function toggleShow() {
    if(!__show__){
        //$G('fm_line1').style.display = 'none';
        //$G('fm_line2').style.display = 'block';
        $G('float_menu2').style.display = 'block';
    } else {
        //$G('fm_line1').style.display = 'block';
        //$G('fm_line2').style.display = 'none';
        $G('float_menu2').style.display = 'none';
    }
    __show__ = !__show__;
}

function goHome(){
    location.href = '/home';
}
function goLogin(){
    location.href = '/account/profile';
}
function goShoppingCart(){
    location.href = '/shopping/cart';
}
function goShopList(){
    location.href = '/shopping/shop';
}
function goService(){
    location.href = '/shopping/service';
}
