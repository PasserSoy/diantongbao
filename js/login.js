$(function(){
  sessionStorage.clear();
	// 禁止浏览器回退事件
	if(location.href.indexOf("login") > -1){
		history.pushState(null, null, document.URL);
		window.addEventListener('popstate', function () {
			history.pushState(null, null, document.URL);
		});
  };
  // 加版本
  if(location.search==''){
    location.replace(location.href+'?v=1.0.8'+new Date().getTime());
  };
  // 验证手机号
  var _telT;
  $('._tel').focus(function(){
    var _t=$(this);
    _telT = setInterval(()=>{
      login();
      clearInt('._tel');
      var v=_t.val();
      if(/^1[3-9]\d{9}/g.test(v) && $('._getvalid').text()=='获取验证码'){
        $('._getvalid').removeClass('dont');
      }else{
        $('._getvalid').addClass('dont');
      };
    },1);
  }).blur(function(){
    clearInterval(_telT);
    setTimeout(()=>{
      $(this).parents('label').find('.close').hide();
    },300);
  });
  // .keydown(function(e){
  //   console.log(e.key)
  //   if(!/(\d|F1-F12|Tab|Home|End|Backspace|Delete|ArrowLeft|ArrowRight|Control)/.test(e.key)){
  //     return false;
  //   }
  // });
  // 验证验证码
  var _validT;
  $('._valid').focus(function(){
    _validT = setInterval(()=>{
      login();
    },1);
  }).blur(function(){
    clearInterval(_validT);
  });
  // 获取验证码
  var sendValidT;// 验证码定时器
  $('._getvalid').click(function(){
    if($('._tel').val()==''){
      tip('请输入手机号码');
      $('._tel').focus();
      return false;
    };
    var _t = $(this),num=60;
    Ajax({
      url:'getSmsVerify',
      data:{mobile:$('._tel').val()},
      success:function(res){
        console.log(res);
        if(res.success){
          // 发送成功，进入倒计时
          _t.addClass('dont').text(num+'s');
          sendValidT = setInterval(() => {
            num--;
            _t.text(num+'s');
            if(num<=0){
              clearInterval(sendValidT);
              _t.removeClass('dont').text('获取验证码');
            }
          }, 1000);
        }else{
          tip(res.errorInfo);
        };
      }
    })
  });
  // 登录
  $('._tologin').click(function(){
    var _t = $(this);
        tel = $('._tel').val(),
        valid = $('._valid').val();
    _t.addClass('load');
    Ajax({
      url:'doLogin',
      data:{mobile:tel,msmCode:valid},
      success:function(res){
        console.log(res)
        setTimeout(()=>{
          if(res.success){
            _t.parent().addClass('jump');
            setTimeout(()=>{             
              // 1s后跳转主页
              // 由于前后端命名不一致，各个导航的主页面命名替代;后面的页面只针对无子页面的直链接；按页面顺序排列
              var navIndex = {'index':'zhuye.html','salesManagement':'xsgl.html','orderManagement':'ddzl.html','userManagement':'yhgl.html',
              'projectManagement':'gcxx.html','customerService':'khfw.html','financialManagement':'404.html','sysUserManagement':'qxgl.html','versionManagement':'bbgl.html'};
              var _i = res.data.userRoles.indexOf('super');
              if(_i>-1) res.data.userRoles.splice(_i,1);// 如果存在super权限，移除掉再存入本地
              sessionStorage.href=sessionStorage.navHref=navIndex[res.data.userRoles[0]]+'?v=1.0.8';
              // sessionStorage.href=sessionStorage.navHref='zhuye.html';
              sessionStorage.loginData=JSON.stringify(res.data);
              sessionStorage.navArr = JSON.stringify({});// 侧边栏是否展开,初始化本地储存为对象
              location.replace('index.html?v=1.0.8'+new Date().getTime());
            },1000);
          }else{
            _t.removeClass('load');
            tip(res.errorInfo);
          };
        },1500);
      }
    })
  });
  // 按回车登录
  $('body').on('keydown',function(e){
    if(e.keyCode==13 && !$('._tologin').hasClass('dont')){
      $('._tologin').click();
    };
  });
  // 清空输入框
  $('.close').click(function(){
    $(this).hide().parents('label').find('input').val('');
  })

  function login(){// 登录按钮变为可点击
    var telval = $('._tel').val(),
        validval = $('._valid').val();
    if(/^1[3-9]\d{9}/g.test(telval) && validval!=''){
      $('._tologin').removeClass('dont');
    }else{
      $('._tologin').addClass('dont');
    };
  }
  // 提示文字方法
  function tip(text){
    $('.tip').addClass('tipShow').find('span').text(text);
    setTimeout(()=>{
      $('.tip').removeClass('tipShow');
    },2000);
  }
  // 清空输入框方法
  function clearInt(ele){
    if($(ele).val()!=''){
      $(ele).parents('label').find('.close').show();
    }else{
      $(ele).parents('label').find('.close').hide();
    };
  }
})
