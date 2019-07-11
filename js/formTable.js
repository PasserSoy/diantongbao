/*表单表单js*/
layui.use(['laydate','jquery'],function(){
  var $ = layui.$,laydate = layui.laydate;
  //日期时间范围
  var mydate = new Date(),
      _year = mydate.getFullYear(),
      _month = (mydate.getMonth() + 1) < 10 ? '0' + (mydate.getMonth() + 1) : mydate.getMonth() + 1;
      _days = (mydate.getDate() + 1) < 10 ? '0' + mydate.getDate() : mydate.getDate();
  var localDate = _year+'-'+_month+'-'+_days,// 本地日期
      _mystart = localDate+' 00:00:00',// 当天开始时间
      _myend = localDate+' 23:59:59';// 当天结束时间
  initTime(_mystart,_myend);// 默认时间
  // 初始化时间
  function initTime(sTime,eTime){
    var s = laydate.render({
      elem: '#startTime'
      ,type: 'datetime'
      ,format: 'yyyy-MM-dd HH:mm:ss'
      // ,value:sTime
      ,done:function(value,date){
        e.config.min={ year: date.year, month: date.month - 1, date: date.date, hours: date.hours, minutes: date.minutes, seconds: date.seconds }
      }
    });
    var e = laydate.render({
      elem: '#endTime'
      ,type: 'datetime'
      ,format: 'yyyy-MM-dd HH:mm:ss'
      // ,value:eTime
      ,done:function(value,date){
        if(value==''){/*console.log('不存在')*/
          s.config.max={ year: 3999, month: 1, date: 1, hours: 0, minutes: 0, seconds: 0 }
        }else{
          s.config.max={ year: date.year, month: date.month - 1, date: date.date, hours: date.hours, minutes: date.minutes, seconds: date.seconds }
        };
      }
    });
  }
})
