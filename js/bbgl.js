layui.use(['form','table','layer','upload'],function(){
  var form = layui.form,table = layui.table,layer = layui.layer,upload = layui.upload;
  var _url = 'appVersion/list';
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
      {field:'verName',title:'版本名称',align:'center'},
      {title:'操作平台',align:'center',width:70,templet:`<div>{{d.os==1?'安卓':'IOS'}}</div>`},
      {field:'verNo',title:'版本号',align:'center'},
      {field:'downloadUrl',title:'下载地址',align:'center',minWidth:170,
        templet:function(d){
          var _text = d.downloadUrl;
          if(_text.length>20) _text = _text.slice(0,10)+'...'+_text.slice(-8);// 缩略文字
          return `<div><a class="opera" target="_blank" download title="${d.downloadUrl}" href="${d.downloadUrl}">${_text}</a></div>`;
        }
      },
      {field:'createTime',title:'上传日期',align:'center',width:170},
      {field:'remark',title:'备注',align:'center',minWidth:100},
      {title:'操作',align:'center',width:80,
        templet:function(d){
          return `<span class="opera jyPop" lay-event="edit">编辑</span>
          <span class="opera" lay-event="del">删除</span>`;
        }
      }
    ]]
    ,done:function(){
      $('.approveStatus4').parents('tr').addClass('DontEdit').find('.opera').removeClass('jyPop').removeAttr('lay-event');// 给已删除的行加样式并移除该行的操作功能
    }
  });
  // 指定允许上传的文件类型
  upload.render({
    elem: '#upload'
    ,url: rootUrl+'appVersion/upload'
    ,accept: 'file' //普通文件
    ,done: function(res){
      if(res.success){
        layer.msg('上传成功');
        var _text = res.data.data;
        $('.downloadUrl').attr('title',_text);
        $('[name=downloadUrl]').val(_text);// 需要提交的隐藏域
        if(_text.length>20) _text = _text.slice(0,10)+'...'+_text.slice(-8);// 缩略文字
        $('.downloadUrl').val(_text);
      }else{
        layer.msg(res.errorInfo);
        $('.downloadUrl,[name=downloadUrl]').val('').attr('title','');
      };
    }
  });
  // 新增 编辑弹窗
  $('body').on('click','.jyPop',function(){
    var _t = $(this),
    _add = _t.data('add'),// 当前为新增功能，否则为编辑
    _tit = '编辑版本',// 当前为新增功能，否则为编辑
    _cont = $('.jy-pop');
    $('.jy-pop .hide').data({'text':'编辑成功','url':'appVersion/edit','type':'edit'});
    if(_add=='jy-add'){// 新增
      $('.downloadUrl').val('').attr('title','');
      form.val("jyPop", {
        "mustVerup": 0
        ,"os": 1
        ,"verName": ''
        ,"verNo": ''
        ,"remark": ''
        ,"downloadUrl": ''
      });
      _tit = '增加版本';
      $('.jy-pop .hide').data({'text':'增加成功','url':'appVersion/add','type':'add'});
    };
    layer.open({// 打开弹窗
      type: 1
      ,skin: 'search-confirm'
      ,title:_tit
      ,btn:['确定','取消']
      ,area: '350px'
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
    _type = $(data.elem).data('type'),// 为add时删除id
    _url = $(data.elem).data('url');// 提交路径
    delete data.field.file;// 删除多余的参数
    if(_type=='add') delete data.field.id;// 删除多余的参数
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
      layer.open({// 打开弹窗
        skin: 'search-confirm'
        ,title:'提示'
        ,btn:['确定','取消']
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
        ,content:'确认要删除此版本吗？'
        ,yes:function(){
          $('.layui-layer-btn0').attr('disabled','disabled');// 禁止多次提交
          Ajax({
            url:'appVersion/delete',
            data:{id:data.id,status:-1},
            complete:function(){
              $('.layui-layer-btn0').removeAttr('disabled');
            },
            success:function(res){
              if(res.success){
                jyTable.reload();// 表格重载
                layer.closeAll();
                layer.msg('删除成功');
              }else{
                layer.msg(res.errorInfo);
              };
            }
          });
        }
      });
    }else if(obj.event === 'edit'){ //编辑
      // 赋值
      var _text = data.downloadUrl;
      $('.downloadUrl').attr('title',_text);
      if(_text.length>20) _text = _text.slice(0,10)+'...'+_text.slice(-8);// 缩略文字
      $('.downloadUrl').val(_text);
      form.val("jyPop", {
        "mustVerup": data.mustVerup
        ,"id": data.id
        ,"os": data.os
        ,"verName": data.verName
        ,"verNo": data.verNo
        ,"remark": data.remark
        ,"downloadUrl": data.downloadUrl
      })
    };
  });
})
