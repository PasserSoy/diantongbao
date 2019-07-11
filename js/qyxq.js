layui.use(['element','jquery','layer'],function(){
  var $ = layui.$,element = layui.element,
  _url = 'company/',// 接口地址变量
  _id = getLocsPro('id'),// 表格传过来的id
  _objName = 'company';// 表单详情渲染的对象名

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
        switch(res.data[_objName].nature){
          case 1:_text='国有';break;
          case 2:_text='合资';break;
          case 3:_text='外资';break;
          case 4:_text='股份';break;
          case 5:_text='民营';break;
          case 6:_text='其他';break;
        };
        res.data[_objName].nature=_text;
        for(var i in res.data[_objName]){
          $('.project td.'+i).text(res.data[_objName][i]);
        };
        // 渲染企业联系人
        var qylxr = res.data.qiYeLianXiRen;
        $('.qylxr .tit i').text(qylxr.length);
        qylxr.forEach(c => {
          $('.qylxr').append(_details_dom(c));
        });
        _details_rslDom(res);// 渲染处理结果
      }else{
        layer.msg(res.errorInfo);
      };
    }
  });/**./ */
  _details_audit(_url,_id);// 审批
});
