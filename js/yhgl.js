layui.use(['form','table','layer'],function(){
  var form = layui.form,table = layui.table,layer = layui.layer;
  var _url = 'customer/list';
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
      {field:'mobile',title:'账号',align:'center',minWidth:100},
      {title:'信用等级',align:'center',minWidth:80,templet:function(d){return '-'}},
      {title:'余额',align:'center',templet:function(d){return d.accountMap.mayDepositMoney}},
      {title:'未到账余额',align:'center',minWidth:100,templet:function(d){return d.accountMap.settleMoney}},
      {title:'累计收益',align:'center',minWidth:80,templet:function(d){return d.accountMap.sumMoney}},
      {field:'createTime',title:'创建时间',align:'center',width:170},
      {title:'状态',align:'center',width:110,
        templet:function(d){
          var locsPro = {
            id:d.id,
            mobile:d.mobile,
            prevhref:window.parent.$('#myFrame').attr('src'),
            approveStatus:d.approveStatus
          };
          var myText = '';// 显示的文字
          switch(d.approveStatus){
            case 0: myText = '待审核';break;
            case 1: myText = '待审核';break;
            case 2: myText = '已通过';break;
            case 3: myText = '未通过';break;
            case 4: myText = '下架';break;
          };
          return `<span class="approveStatus approveStatus${d.approveStatus}" data-locsPro='${JSON.stringify(locsPro)}' data-href="yhxq.html?v=1.0.8">${myText}</span>`
        }
      },
      {title:'操作',align:'center',width:80,
        templet:function(d){
          switch(d.status){
            case 0:return `<span class="opera" data-id="${d.id}" data-status="0">未冻结</span>`;
            case 1:return `<span class="opera" data-id="${d.id}" data-status="1">已冻结</span>`;
          }
        }
      }
    ]]
  });
  // 冻结 取消冻结操作
  $('body').on('click','tr .opera',function(){
    var _t = $(this),
    _id = _t.data('id'),// 当前行id
    _status = _t.data('status'),// 当前状态 0 未冻结 1 已冻结
    _cont = _status==0?'确认要冻结此账号吗？':'确认要取消冻结账号吗？';
    layer.open({
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
      ,content:_cont
      ,yes:function(i){
        layer.close(i);
        Ajax({
          url:'customer/updateStatus',
          data:{id:_id,status:Math.abs(_status-1)},
          success:function(res){
            if(res.success){
              if(_status == 0){// 冻结
                _t.data({'status':1}).text('已冻结');
              }else if(_status == 1){// 取消冻结
                _t.data({'status':0}).text('未冻结');
              };
            }else{
              layer.msg(res.errorInfo);
            };
          }
        });
      }
    });
  });// ./冻结 取消冻结操作
})
