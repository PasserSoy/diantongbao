layui.use(['layer'],function(){
  var layer = layui.layer;
	// 禁止浏览器回退事件
	if(location.href.indexOf("index.html") > -1){
		history.pushState(null, null, document.URL);
		window.addEventListener('popstate', function () {
			history.pushState(null, null, document.URL);
		});
  };
  // 判断权限
  if(sessionStorage.loginData!=undefined){
    var loginData = JSON.parse(sessionStorage.loginData);// 登录时后台传过来的数据
    // 存在的导航留下，剩下的删除
    loginData.userRoles.forEach(c=>{
      $('[data-userRoles='+c+']').data('saveNav',true);
    });
    $('[data-userRoles]').each(function(){
      if(!$(this).data('saveNav')) $(this).remove();// 移除无权限
    });
  }else{
    sessionStorage.clear();
    location.replace('login.html?v=1.0.8'+new Date().getTime());
  }
  // 退出
  $('body').on('click','.exit',function(){
    layer.confirm('确认退出?',{title:'提示'},function(index){
      //do something
      Ajax({
        url:'logout',
        success:function(res){
          if(res.success){
            sessionStorage.clear();
            location.replace('login.html?v=1.0.8'+new Date().getTime());
            layer.close(index);
          }else{
            layer.msg(res.errorInfo);
          };
        }
      });
    }); 
  });
  // 日期
  getToday();
  setInterval(() => {
    getToday();
  }, 1000);
  function getToday() {// 日期方法
    var d = new Date();
    // 处理年月日
    var y = d.getFullYear(),
      m = d.getMonth() + 1,
      d1 = d.getDate(); // 年月日
    var date = `${y}年${m<10?'0'+m:m}月${d1<10?'0'+d1:d1}日`;
    // 处理周
    var w = d.getDay(); // 周
    var weekArr = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    var week = weekArr[w];
    // 处理时分秒
    var h = d.getHours(),
      m1 = d.getMinutes(),
      s = d.getSeconds(); // 时分秒
    var time = `${h<10?'0'+h:h}:${m1<10?'0'+m1:m1}:${s<10?'0'+s:s}`;
    $('.dates .date').text(date);
    $('.dates .week').text(week);
    $('.dates .time').text(time);
  }
  // 切换导航
  var navPro_ = JSON.parse(sessionStorage.navArr);// 获取展开的菜单本地存储
  $('.jy-nav').on('click','.jy-nav-item a',function(e){
    e.preventDefault();
    var _t = $(this),_tc = _t.next('.jy-nav-child');
    if(_tc.length>0){
      _tc.slideToggle(200,function(){
        var navIndex = _t.parents('li').data('userroles'),
            navChecked = _tc.attr('class');
        navPro_[navIndex]=navChecked;// 将展开的菜单存入本地存储
        sessionStorage.navArr = JSON.stringify(navPro_);
      }).toggleClass('jy-show');
    }else{
      $('.jy-nav li,.jy-nav dd').removeClass('jy-checked');
      _t.parents('li,dd').addClass('jy-checked');
    };
    var _h = _t.data('href');
    if(_h != undefined){
      sessionStorage.href=sessionStorage.navHref=_h;// navHref 刷新时不变的导航
    };
    $('#myFrame').attr('src',_h);
  });
  // 页面初始化
  // console.log(loginData)
  $('#index header .user').text(loginData.userName);// 用户名
  // 是否展开菜单子项
  for(var i in navPro_){
    $(`.jy-nav>li[data-userRoles=${i}] .jy-nav-child`).attr('class',navPro_[i]);
  };
  // 导航选中
  $('#myFrame').attr('src',sessionStorage.href);
  var checkA = $('.jy-nav a[data-href="'+sessionStorage.navHref+'"]');
  $('.jy-nav li,.jy-nav dd').removeClass('jy-checked');
  checkA.parents('li,dd').addClass('jy-checked');
})
