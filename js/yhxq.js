layui.use(['element','jquery','layer'],function(){
  var $ = layui.$,element = layui.element,
  _url = 'customer/',// 接口地址变量
  // _id = getPropetyVal('id'),// 表格传过来的id
  _id = getLocsPro('id'),// 表格传过来的id
  _objName = 'userInfo';// 表单详情渲染的对象名
  Ajax({// 查询详情
    url:_url+'personalInfomation',
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
        switch(res.data[_objName].sex){
          case 1:_text='男';break;
          case 2:_text='女';break;
        };
        res.data[_objName].sex=_text;
        for(var i in res.data[_objName]){
          if(i=='businessCard'){// 名片
            if(res.data[_objName][i]==''){// 图片路径不存在
              $('.businessCard').remove();
            }else{
              $('.businessCard').attr('src',res.data[_objName][i]);
              layer.photos({
                photos: '.photo'
                ,anim: 5 //0-6的选择，指定弹出图片动画类型，默认随机（请注意，3.0之前的版本用shift参数）
              });
              var ratio=1;// 倍率// 图片缩放
              $('body').on('mousewheel','.layui-layer-phimg img',function(e){
                var _sORb = $(this).parents('.layui-layer-photos');// 需要放大的节点
                // 滚动一次为100，倍率为0.2
                ratio+=-(e.originalEvent.deltaY)/500;
                if(ratio<.4) ratio=.2;
                _sORb.css('transform',`scale(${ratio})`);
              });
            };
          }else{
            $('.project td.'+i).text(res.data[_objName][i]);
          };
        };
        _details_rslDom(res);// 渲染处理结果
      }else{
        layer.msg(res.errorInfo);
      };
    }
  });/**./ */
  _details_audit(_url,_id);// 审批
});
