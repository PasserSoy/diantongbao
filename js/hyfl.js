layui.use(['form','table','layer'],function(){
  var form = layui.form,layer = layui.layer;
  // 渲染列表
  Ajax({
    url:'industry/list',
    success:function(res){
      if(res.success){
        // console.log(res);
        const resArr = res.data.reverse();
        // 遍历结果 渲染一级分类
        // parentId==0为一级分类
        $('.hy-result').empty();
        for(const i of resArr){
          if(i.parentId==0){
            oneCont(i.id,i.name);
          };
        };
        // 再渲染二级分类
        for(const i of resArr){
          if(i.parentId!=0){
            twoCont(i.id,i.name,i.parentId);
          };
        };
      }else{
        layer.msg(res.errorInfo);
      };
    }
  });
  // 一级分类方法
  function oneCont(id,name){
    const oneCont = `
    <li><div class="hy-one" data-id="${id}">
      <div> <i class="head"></i>
        <span class="name">${name}</span>
      </div>
      <div> <i class="edit jyPop edit1"></i> <i class="add jyPop add2"></i> </div>
    </div><ul class="hy-two-result" data-parentId="${id}"></ul></li>`;
    $('.hy-result').prepend(oneCont);
  }
   // 二级分类方法
   function twoCont(id,name,parentId){
    const twoCont = `
    <li> <div class="hy-two" data-id="${id}">
      <span class="name">${name}</span>
    <i class="edit jyPop edit2"></i> </div> </li>`;
    $(`.hy-two-result[data-parentId=${parentId}]`).prepend(twoCont);
   }
  // 点击一级菜单展开或收起二级菜单
  $('body').on('click','.hy-one',function(){
    const _t = $(this);
    _t.siblings('.hy-two-result').slideToggle(200);
    _t.find('.head').toggleClass('toDown');
    // 判断是否全部展开或收起
    if($('.toDown').length==0){// 全部收起
      $('.toAll').removeClass('show').text('展开全部');
    }else{
      $('.toAll').addClass('show').text('折叠全部');
    };
  });
  // 操作全部
  $('body').on('click','.toAll',function(){
    const _t = $(this);
    // 如果自己有类名show则全部收起
    // 否则全部显示
    if(_t.hasClass('show')){
      _t.removeClass('show').text('展开全部');
      $('.head').removeClass('toDown');
      $('.hy-two-result').slideUp(200);
    }else{
      _t.addClass('show').text('折叠全部');
      $('.head').addClass('toDown');
      $('.hy-two-result').slideDown(200);
    };
  });
  // 阻止新增编辑冒泡
  $('body').on('click','.edit,.add',function(e){
    e.stopPropagation();
  });
  // 新增 编辑弹窗
  $('body').on('click','.jyPop',function(){
    var _t = $(this),_tit='',_type='',
    _cont = $('.jy-pop');
    if(_t.hasClass('add')){// 新增
      if(_t.hasClass('add1')){// 新增一级分类
        _tit = '新增一级分类'; _type = 'add1';
      }else{// 新增二级分类
        _tit = '新增二级分类'; _type = 'add2';
      };
      form.val("jyPop", {
        "parentId": _t.parents('[data-id]').data('id')// 新增二级分类需要这个参数
        ,"id": ''
        ,"name": ''
      });
      $('.jy-pop .hide').data({'text':'新增成功','url':'industry/add','type':_type});
    }else if(_t.hasClass('edit')){// 编辑
      form.val("jyPop", {
        "parentId": ''
        ,"id": _t.parents('[data-id]').data('id')
        ,"name": _t.parents('[data-id]').find('.name').text()
      });
      _tit = _t.hasClass('edit1')?'编辑一级分类':'编辑二级分类';
      $('.jy-pop .hide').data({'text':'编辑成功','url':'industry/edit','type':'edit'});
    };
    layer.open({// 打开弹窗
      type: 1
      ,skin: 'search-confirm'
      ,title:_tit
      ,btn:['确定','取消']
      ,area: '310px'
      ,isOutAnim:false
      ,success:function(){
        // 父窗口遮罩添加
        window.parent.$('header,nav .logo,nav .jy-nav').append(`<div class="shade"></div>`);
        window.parent.$('nav').removeClass('myShade');
      }
      ,end:function(){
        // 父窗口遮罩移除
        window.parent.$('header,nav').find('.shade').remove();
        window.parent.$('nav').addClass('myShade');
      }
      ,content:_cont
      ,yes:function(){
        $('.jy-pop .hide').click();
        // .attr('disabled','disabled');// 禁止多次提交
      }
    });
  });// ./新增 编辑弹窗
  // 提交
  form.on('submit(submit)',function(data){
    var _text = $(data.elem).data('text'),// 成功之后的提示文本
    _url = $(data.elem).data('url'),// 提交路径
    _type = $(data.elem).data('type');// 通过_type删除不需要的参数
    if(_type=='edit'){// 编辑
      delete data.field.parentId;
    }else{// 新增
      delete data.field.id;
      if(_type=='add1'){// 新增一级分类
        delete data.field.parentId;
      };
    };
    Ajax({
      url:_url,
      data:data.field,
      complete:function(){
        $('.jy-pop .hide').removeAttr('disabled');
      },
      success:function(res){
        // console.log(res)
        if(res.success){
          if(_type=='add1'){// 新增一级分类
            oneCont(res.data.id,res.data.name);
          }else if(_type=='add2'){// 新增二级分类
            twoCont(res.data.id,res.data.name,res.data.parentId);
          }else if(_type=='edit'){// 编辑分类
            $(`[data-id=${res.data.id}] .name`).text(res.data.name);
          };
          layer.closeAll();
          layer.msg(_text);
        }else{
          layer.msg(res.errorInfo);
        };
      }
    });
    return false;// 阻止表单跳转
  });
})
