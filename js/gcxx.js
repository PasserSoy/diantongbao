layui.use(['form','table','layer'],function(){
  var form = layui.form,table = layui.table,layer = layui.layer;
  var _url = 'project/list';
  // _msgTip(_url,'projectCountByApproveStatus');// 处理状态数据渲染
  // 表格
  jyTable = table.render({
    elem:'#jy-table'
    ,skin: 'line'
    ,request: { pageName: 'pageNum' }
    ,page:{ layout:['prev','page','next','skip'] }
    ,method:'post'
    ,url:rootUrl+_url
    ,parseData: function(res){ //res 即为原始返回的数据
      _msgTip(res,'projectCountByApproveStatus');// 处理状态数据渲染
      if(res.errorCode.indexOf('please.login.first')>-1){// 监测登录过期
        layer.msg(res.errorInfo,{time:2300},function(){
          window.parent.location.href='login.html?v=1.0.8'+new Date().getTime();
        });
        return { "code": 0 };
      }else{
        return {
          "code": 0, //解析接口状态
          "msg": res.errorInfo, //解析提示文本
          "count": res.data.projectList.total, //解析数据长度
          "data": res.data.projectList.list //解析数据列表
        };
      };
    }
    ,cols:[[
      {type:'numbers',title:'序号',align:'center'},
      {field:'name',title:'工程名称',align:'center',minWidth:100},
      {title:'业主',align:'center',templet:function(d){return d.linkmanCountMap.yeZhuLianXiRen}},
      {title:'总包方',align:'center',minWidth:80,templet:function(d){return d.linkmanCountMap.zongBaoFangLianXiRen}},
      {title:'设计院',align:'center',minWidth:80,templet:function(d){return d.linkmanCountMap.gongChengzongSheJiYuanLianXiRen}},
      {align:'center',minWidth:90,title:'总额(元)',templet:`<div>{{d.price/100}}</div>`},
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
          return `<span class="approveStatus approveStatus${d.approveStatus}" data-locsPro='${JSON.stringify(locsPro)}' data-href="gcxq.html?v=1.0.8">${myText}</span>`
        }
      }
    ]]
  });
})
