layui.use(['form','table','layer'],function(){
  var form = layui.form,table = layui.table,layer = layui.layer;
  var _url = 'order/list';
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
      {field:'orderCode',title:'订单号',align:'center',minWidth:100},
      {field:'applyAccountName',title:'账号',align:'center',minWidth:100},
      {field:'customerName',title:'消费者',align:'center',minWidth:100},
      {title:'消费金额(元)',minWidth:90,align:'center',templet:`<div>{{d.billPrice/100}}</div>`},
      {title:'支付方式',align:'center',minWidth:80,
        templet:function(d){
          switch(d.applyAccountType){
            case 0:return `未选支付方式`;
            case 1:return `支付宝`;
            case 2:return `微信支付`;
          }
        }
      },
      {field:'createTime',title:'下单时间',align:'center',width:170},
      {title:'状态',align:'center',width:110,
        templet:function(d){
          switch(d.orderType){
            case 1:return `<span class="approveStatus approveStatus1">待付款</span>`;
            case 4:return `<span class="approveStatus approveStatus2">已付款</span>`;
            case 5:return `<span class="approveStatus approveStatus4">已取消</span>`;
          }
        }
      }
    ]]
  });
})
