$(function(){
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
            localStorage.token=res.data.id;
            _t.parent().addClass('jump');
            setTimeout(()=>{
              $('#login').hide();
              // 显示主页
              $('#index').show();
            },1000);
          }else{
            _t.removeClass('load');
            tip(res.errorInfo);
          };
        },1500);
      }
    })
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
    },1500);
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
