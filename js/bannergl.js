layui.use(['form','table','layer','upload'],function(){
  var form = layui.form,table = layui.table,layer = layui.layer,upload = layui.upload;
  var _url = 'sale/bannerList';
  var _rootImg = 'img/bannergl.png'
  // 表格
  jyTable = table.render({
    elem:'#jy-table'
    ,skin: 'line'
    ,request: { pageName: 'pageNum' }
    ,page:{ layout:['prev','page','next','skip'] }
    ,method:'post'
    ,url:rootUrl+_url
    ,parseData: function(res){ //res 即为原始返回的数据
      if(res.errorCode.indexOf('please.login.first')>-1){// 监测登录过期
        layer.msg(res.errorInfo,{time:2300},function(){
          window.parent.location.href='login.html?v=1.0.8'+new Date().getTime();
        });
        return { "code": 0 };
      }else{
        return {
          "code": 0, //解析接口状态
          "msg": res.errorInfo, //解析提示文本
          "count": res.data.total, //解析数据长度
          "data": res.data.list //解析数据列表
        };
      };
    }
    ,cols:[[
      {type:'numbers',title:'序号',align:'center'},
      {title:'类型',align:'center',width:130,
        templet:function(d){
          switch(d.bannerType){
            case 1:return '启动页';
            case 2:return '引导页';
            case 3:return 'app首页大banner';
            case 4:return '详情banner';
            case 5:return '首页小banner';
          };
        }
      },
      {title:'缩略图',align:'center',width:100,
        templet:function(d){
          return `<img src="${d.imageUrl}" alt="banner" class="tableImg">`;
        }
      },
      {title:'跳转地址',align:'center',minWidth:100,templet: '<div><a href={{d.bannerUrl}} target="_blank" class="layui-table-link">{{d.bannerUrl}}</a></div>'},
      {field:'bannerDesc',title:'描述',align:'center',minWidth:100},
      {title:'操作',align:'center',width:110,templet: '<div><span class="opera jyPop" lay-event="edit">替换</span></div>'}
    ]]
  });
  //自定义验证规则
  form.verify({
    myBanner: function(value){
      if(value.length < 3){
        return '请选择图片';
      }
    }
  });
  // 指定允许上传的文件类型
  upload.render({
    elem: '.slt'
    ,url: rootUrl+'sale/banner/upload'
    ,accept: 'image' //普通文件
    ,acceptMime: 'image/*'
    ,size:'1024'
    ,done: function(res){
      if(res.success){
        layer.msg('上传成功');
        $('#upImg').attr({'src':res.data.data}).parent('.slt').addClass('hasImg');
        $('[name=imageUrl]').val(res.data.data);
        // console.log(res);
      }else{
        layer.msg(res.errorInfo);
        $('#upImg').attr({'src':_rootImg}).parent('.slt').removeClass('hasImg');
        $('[name=imageUrl]').val('');
      };
    }
  });
  // 新增 替换弹窗
  $('body').on('click','.jyPop',function(){
    var _t = $(this),
    _add = _t.data('add'),// 当前为新增功能，否则为替换
    _tit = '替换banner',// 当前为新增功能，否则为替换
    _cont = $('.jy-pop');
    $('.jy-pop .hide').data({'text':'替换成功','url':'sale/editBanner','type':'edit'});
    if(_add=='jy-add'){// 新增
      $('#upImg').attr({'src':_rootImg}).parent('.slt').removeClass('hasImg');// banner图恢复初始图片
      form.val("jyPop", {
        "imageUrl": ''
        ,'bannerType':1
        ,"bannerUrl": ''
        ,"bannerDesc": ''
      });
      _tit = '新增banner';
      $('.jy-pop .hide').data({'text':'新增成功','url':'sale/addBanner','type':'add'});
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
  });// ./新增 替换弹窗  
  // 提交
  form.on('submit(submit)',function(data){
    var _text = $(data.elem).data('text'),// 成功之后的提示文本
    _url = $(data.elem).data('url'),// 提交路径
    _type = $(data.elem).data('type'),// 为add时删除id
    _roles = '';// 将复选框转换成后台需要的结构
    if(_type=='add') delete data.field.id;
    Ajax({
      url:_url,
      data:data.field,
      complete:function(){
        $('.jy-pop .hide').removeAttr('disabled');
      },
      success:function(res){
        if(res.success){
          if(_type=='add'){// 增加
            jyTable.reload({
              page: {
                layout:['prev','page','next','skip'],
                curr: 1 //重新从第 1 页开始
              }
            });// 表格重载
          }else{
            jyTable.reload();// 表格重载
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
  // 监听工具栏
  table.on('tool(jyTable)', function(obj){
    var data = obj.data; //获得当前行数据  
    if(obj.event === 'del'){ //删除
    }else if(obj.event === 'edit'){ //替换
      // 赋值
      $('#upImg').attr({'src':data.imageUrl}).parent('.slt').addClass('hasImg');
      form.val("jyPop", {
        "id": data.id
        ,"imageUrl": data.imageUrl
        ,'bannerType':data.bannerType
        ,"bannerUrl": data.bannerUrl
        ,"bannerDesc": data.bannerDesc
      })
    };
  });
})
