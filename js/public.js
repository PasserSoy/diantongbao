var rootUrl = 'http://120.79.6.179/back-api/';// 测试服
// var rootUrl = 'http://192.168.0.32/back-api/';
var rootUrl = 'back-api/';// 本地测试
var loadingDom = `<div class="loadingDom"><i class="layui-icon layui-icon-loading"></i></div>`;// 详情loading
// ajax 方法
function Ajax({ url:url, data:data, type:type,timeout:timeout, beforeSend:beforeSend, success:success, complete:complete}){
  if(!type) type='post';
  if(!timeout) timeout=0;
  $.ajax({
    url:rootUrl+url,
    data:data,
    timeout:timeout,
    type:type,
    dataType:'json',
    beforeSend:function(){
      if(beforeSend) beforeSend();
    },
    success:function(res){
      // 判断未登录时，返回登录页
      if(res.errorCode.indexOf('please.login.first')>-1){
        layer.msg(res.errorInfo,{time:2300},function(){
          window.parent.location.href='login.html?v=1.0.8'+new Date().getTime();
        });
      }else{
        if(success) success(res);
      };
    },
    complete:function(){
      if(complete) complete();
    },
    error:function(e,s){
      console.log('请求错误！');
      if(s=='timeout'){
        console.log('请求超时！');
      }
    }
  })
}// ./ajax 方法

// 信息展示页面，各个处理状态数据渲染 old
// function _msgTip(_url,_objName){
//   Ajax({// 信息统计
//     url:_url,
//     success:function(res){
//       if(res.success){
//         // 绑定提示信息
//         var myTips = res.data[_objName];
//         for(var i in myTips){
//           $('.msgBox li span.'+i).text(myTips[i]);
//         }
//       }else{
//         layer.msg(res.errorInfo);
//       };
//     }
//   });
// }

// 信息展示页面，各个处理状态数据渲染
function _msgTip(res,_objName){
  if(res.success){
    // 绑定提示信息
    var myTips = res.data[_objName];
    for(var i in myTips){
      $('.msgBox li span.'+i).text(myTips[i]);
    }
  }else{
    layer.msg(res.errorInfo);
  };
}

// 详情页面处理结果
function _details_rslDom(res){
  var rsl = res.data.ApproveRecord;
  function rslDom(c){
    return `
    <div class="child">
      <p class="circle">${c.approveContent}</p>
      <p class="s">
        <span class="time">${c.createTime}</span>
        审批人：<span>${c.name}</span>
      </p>
    </div>`;
  }
  if(rsl.length>0){
    rsl.forEach(c => {
      $('.result').append(rslDom(c));
    });
  };
}// ./详情页面处理结果
// 详情页面结构,业主设计院等的结构
function _details_dom(c){
  // 处理数据
  switch(Number(c.linkmanRole)){
    case 1:c.linkmanRole='决策者';break;
    case 2:c.linkmanRole='使用者';break;
    case 3:c.linkmanRole='教练';break;
    case 4:c.linkmanRole='技术把关者';break;
  };
  return `
  <div class="child">
    <table>
      <tbody>
        <tr><td>联系人</td><td>${c.name}</td><td>角色</td><td>${c.linkmanRole}</td><td>爱好</td><td>${c.aiHao}</td></tr>
        <tr><td>性别</td><td>${c.sex==1?'男':'女'}</td><td>生日</td><td>${c.birthday}</td><td>手机</td><td>${c.shouJiHao}</td></tr>
        <tr><td>职位</td><td>${c.zhiWei}</td><td>上级</td><td>${c.shangJiId}</td><td>下级</td><td>${c.xiaJiId}</td></tr>
        <tr><td>部门</td><td>${c.buMen}</td><td>办公地址</td><td colspan="3">${c.banGongAddress}</td></tr>
      </tbody>
    </table>
    <div class="price">金额：¥ ${c.price}</div>
  </div>`; 
}// ./详情页面结构,业主设计院等的结构

// 切割查询字段
// function getPropetyVal(p) {
//   var s = location.search;
//   s = s.substr(1, s.length - 1);
//   var propetys = s.split("&");
//   for (var i = 0; i < propetys.length; i++) {
//     if (propetys[i].split("=")[0].trim() == p) {
//       return propetys[i].split("=")[1];
//     }
//   }
//   return null;
// }

// 保存页面间传输的参数
$('body').on('click','[data-locsPro]',function(){
  sessionStorage.locsPro = $(this).attr('data-locsPro');
});
// 解析页面间传输的参数
function getLocsPro(name){
  return JSON.parse(sessionStorage.locsPro)[name];
}
// 详情审批,页面渲染公共方法
function _details_audit(_url,_id){
  // 渲染面包屑名
  var _name = getLocsPro('name');
  $('.proName').text(_name);
  // 通过传过来的状态码判断显示哪一个处理
  switch(Number(getLocsPro('approveStatus'))){
    case 0:case 1:$('.jy-oper').show();break;// 待审核
    case 2:$('.result').show();break;// 已通过
    case 3:$('.jy-oper,.result').show();break;// 未通过
    case 4:;break;// 下架
  };
  $('body').on('click','.refuse',function(){// 不同意
    $('.operation.advice').slideDown(300);
  });
  $('.operation .agree,.operation .refSubmit').on('click',function(){// 提交
    var _t = $(this),_data = {id:_id};
    _t.attr('disabled','disabled');
    if(_t.hasClass('refSubmit')){// 不同意
      var cont = $('[name=approveContent]').val();
      if(cont!=''){
        _data.approveStatus=3;// 审核状态
        _data.approveContent=cont;// 拒绝内容
      }else{
        layer.msg('请输入处理建议');
        $('[name=approveContent]').focus();
        _t.removeAttr('disabled');
      };
    }else{
      _data.approveStatus=2;// 审核状态
    };
    if(_data.approveStatus!=undefined){// 可以提交
      Ajax({
        url:_url+'updateApproveStatus',
        data:_data,
        success:function(res){
          if(res.success){
            // 修改状态后刷新页面
            // sessionStorage.href = sessionStorage.href.slice(0,-1)+_data.approveStatus;
            // window.parent.$('#myFrame').attr('src',sessionStorage.href);
            const locsRes = JSON.parse(sessionStorage.locsPro);
            locsRes['approveStatus'] = _data.approveStatus;
            sessionStorage.locsPro = JSON.stringify(locsRes);
            location.reload();
          }else{
            layer.msg(res.errorInfo);
          };
        }
      });
    };
  });
}// ./详情审批,页面渲染公共方法

// 不在主页生效,所有子页面的操作放在这里
if(location.href.indexOf('/index.html')<0){
  // 点击返回上一页
  $('body').on('click','.goback',function(){
    var _prevhref = getLocsPro('prevhref');
    sessionStorage.href = _prevhref;
    window.parent.$('#myFrame').attr('src',_prevhref);
  })
  // 保持页面状态
  $('body').on('click','[data-href]',function(){
    var _href = $(this).data('href');
    sessionStorage.href = _href;
    window.parent.$('#myFrame').attr('src',_href);
  })
  // 表格公共方法
  if(typeof(layui) != 'undefined'){
    var jyTable;
    layui.use(['form','table','util','layer'],function(){
      var form = layui.form,util = layui.util,layer = layui.layer;
      // 查询
      form.on('submit(jy-search)', function(data){
        console.log(data.field) //当前容器的全部表单字段，名值对形式：{name: value}
        jyTable.reload({// 表格重载
          where:data.field
          ,page: {
            layout:['prev','page','next','skip'],
            curr: 1 //重新从第 1 页开始
          }
        });
        return false; //阻止表单跳转
      });
      // 回顶
      util.fixbar({
        bar1: false
        ,css: {right: 20,bottom: 20}
        ,bgcolor:'#25ab38'
      });
    });
  };
  // 禁止打开子页面 不为登录页
  if(window.parent.length<=0 && location.href.indexOf('/login.html')<0){
    location.href='login.html?v=1.0.8'+new Date().getTime();
  }
};// ./不在主页生效,所有子页面的操作放在这里
