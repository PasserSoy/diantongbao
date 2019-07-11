layui.use(['form','table','layer'],function(){
  var form = layui.form,table = layui.table,layer = layui.layer;
  var _url = 'sysUser/list';
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
      {field:'mobile',title:'手机号',align:'center',width:100},
      {field:'userName',title:'姓名',align:'center',width:100},
      {title:'权限分配',align:'left',minWidth:100, unresize: true,
        templet:function(d){
          var temp = '';
          if(d.userRoles.includes('index')){
            temp += `<input type="checkbox" name="index" lay-skin="primary" title="首页信息" checked="" disabled="">`;
          };
          if(d.userRoles.includes('salesManagement')){
            temp += `<input type="checkbox" name="salesManagement" lay-skin="primary" title="销售管理" checked="" disabled="">`;
          };
          if(d.userRoles.includes('orderManagement')){
            temp += `<input type="checkbox" name="orderManagement" lay-skin="primary" title="订单管理" checked="" disabled="">`;
          };
          if(d.userRoles.includes('userManagement')){
            temp += `<input type="checkbox" name="userManagement" lay-skin="primary" title="用户管理" checked="" disabled="">`;
          };
          if(d.userRoles.includes('projectManagement')){
            temp += `<input type="checkbox" name="projectManagement" lay-skin="primary" title="项目管理" checked="" disabled="">`;
          };
          if(d.userRoles.includes('customerService')){
            temp += `<input type="checkbox" name="customerService" lay-skin="primary" title="客户服务" checked="" disabled="">`;
          };
          if(d.userRoles.includes('financialManagement')){
            temp += `<input type="checkbox" name="financialManagement" lay-skin="primary" title="财务管理" checked="" disabled="">`;
          };
          if(d.userRoles.includes('sysUserManagement')){
            temp += `<input type="checkbox" name="sysUserManagement" lay-skin="primary" title="权限管理" checked="" disabled="">`;
          };
          if(d.userRoles.includes('versionManagement')){
            temp += `<input type="checkbox" name="versionManagement" lay-skin="primary" title="版本管理" checked="" disabled="">`;
          };
          return `<div class="layui-form tableCheck ${d.status==0?'':'DontForm'}">${temp}</div>`;
        }
      },
      {field:'createTime',title:'创建时间',align:'center',width:170},
      {title:'状态',align:'center',width:80,
        templet:function(d){
          switch(d.status){
            case 0:return `<span class="approveStatus approveStatus2">使用中</span>`;
            case -1:return `<span class="approveStatus approveStatus4">已停用</span>`;
          }
        }
      },
      {title:'操作',align:'center',width:80,
        templet:function(d){
          return `<span class="opera jyPop" lay-event="edit">编辑</span>
          <span class="opera" lay-event="del">停用</span>`;
        }
      }
    ]]
    ,done:function(){
      $('.approveStatus4').parents('tr').addClass('DontEdit').find('.opera').removeClass('jyPop').removeAttr('lay-event');// 给已停用的行加样式并移除该行的操作功能
    }
  });
  // 新增 编辑弹窗
  $('body').on('click','.jyPop',function(){
    var _t = $(this),
    _add = _t.data('add'),// 当前为新增功能，否则为编辑
    _tit = '编辑管理员',// 当前为新增功能，否则为编辑
    _cont = $('.jy-pop');
    $('.jy-pop .hide').data({'text':'编辑成功','url':'sysUser/editSysUser','type':'edit'});
    if(_add=='jy-add'){// 新增
      form.val("jyPop", {
        "mobile": ''
        ,"userName": ''
        ,"index": false
        ,"salesManagement": false
        ,"orderManagement": false
        ,"userManagement": false
        ,"projectManagement": false
        ,"customerService": false
        ,"financialManagement": false
        ,"sysUserManagement": false
        ,"versionManagement": false
      });
      _tit = '增加管理员';
      $('.jy-pop .hide').data({'text':'增加成功','url':'sysUser/add','type':'add'});
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
    _type = $(data.elem).data('type'),// 为add时删除id
    _roles = '';// 将复选框转换成后台需要的结构
    if(_type=='add') delete data.field.id;
    ///// 遍历数组重组结构
    var _arr = ['index','salesManagement','orderManagement','userManagement','projectManagement','customerService','financialManagement','sysUserManagement','versionManagement'];// 需要重组的数组
    _arr.forEach(function(c){
      if(typeof(data.field[c])!='undefined'){
        _roles+=`{"userRole":"${c}"},`;
        delete data.field[c];
      };
    });
    data.field.jsonArrayStrRoles=`[${_roles.slice(0,-1)}]`;
    if(data.field.jsonArrayStrRoles=='[]'){// 为空时弹出提示 必选
      layer.msg('请选择权限',{icon: 5,anim: 6});
      return false;
    };
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
        ,content:'确认要停用此管理员吗？'
        ,yes:function(){
          $('.layui-layer-btn0').attr('disabled','disabled');// 禁止多次提交
          Ajax({
            url:'sysUser/deleteOrUndelete',
            data:{id:data.id,status:-1},
            complete:function(){
              $('.layui-layer-btn0').removeAttr('disabled');
            },
            success:function(res){
              if(res.success){
                jyTable.reload();// 表格重载
                layer.closeAll();
                layer.msg('停用成功');
              }else{
                layer.msg(res.errorInfo);
              };
            }
          });
        }
      });
    }else if(obj.event === 'edit'){ //编辑
      // 赋值
      form.val("jyPop", {
        "mobile": data.mobile
        ,"userName": data.userName
        ,"id": data.id
        ,"index": data.userRoles.includes('index')
        ,"salesManagement": data.userRoles.includes('salesManagement')
        ,"orderManagement": data.userRoles.includes('orderManagement')
        ,"userManagement": data.userRoles.includes('userManagement')
        ,"projectManagement": data.userRoles.includes('projectManagement')
        ,"customerService": data.userRoles.includes('customerService')
        ,"financialManagement": data.userRoles.includes('financialManagement')
        ,"sysUserManagement": data.userRoles.includes('sysUserManagement')
        ,"versionManagement": data.userRoles.includes('versionManagement')
      })
    };
  });
})
