layui.use(['element','jquery','layer'],function(){
  var $ = layui.$,element = layui.element,
  _url = 'project/',// 接口地址变量
  _id = getLocsPro('id'),// 表格传过来的id
  _objName = 'project';// 表单详情渲染的对象名

  Ajax({// 查询详情
    url:_url+'detailAndRealtionLinkman',
    data:{id:_id},
    beforeSend:function(){
      $('body').append(loadingDom);
    },
    success:function(res){
      // console.log(res)
      $('.loadingDom').remove();
      if(res.success){
        // 渲染表单详情信息
        var _text = '';// 修改不标准的对象值
        switch(res.data[_objName].plan){
          case 1:_text='立项报告';break;
          case 2:_text='可研报告';break;
          case 3:_text='初步设计';break;
          case 4:_text='施工图设计';break;
          case 5:_text='设备招标';break;
          case 6:_text='竣工';break;
        };
        res.data[_objName].plan=_text;
        switch(res.data[_objName].level){
          case 1:_text='新项目';break;
          case 2:_text='标杆项目';break;
          case 3:_text='重点项目';break;
        };
        res.data[_objName].level=_text;
        for(var i in res.data[_objName]){
          $('.project td.'+i).text(res.data[_objName][i]);
        };
        // 渲染业主
        var yezhu = res.data.yeZhuLianXiRen;
        $('.yezhu .tit i').text(yezhu.length);
        yezhu.forEach(c => {
          $('.yezhu').append(_details_dom(c));
        });
        // 渲染总包方
        var zbf = res.data.zongBaoFangLianXiRen;
        $('.zbf .tit i').text(zbf.length);
        zbf.forEach(c => {
          $('.zbf').append(_details_dom(c));
        });
        // 渲染设计院
        var sjy = res.data.gongChengzongSheJiYuanLianXiRen;
        $('.sjy .tit i').text(sjy.length);
        sjy.forEach(c => {
          $('.sjy').append(_details_dom(c));
        });        
        _details_rslDom(res);// 渲染处理结果
      }else{
        layer.msg(res.errorInfo);
      };
    }
  });/**./ */
  _details_audit(_url,_id);// 审批
});
