var totalsecond=30*60*60*1000+12*1000;  //总时间，以毫秒为单位
function count_down(that){
    that.setData({
      clock: date_format(totalsecond)

    })
    if(totalsecond<=10){
      that.setData({
        clock:'已经停止'
      })
    }
   var sh= setTimeout(function(){
        totalsecond-=1000;
        count_down(that);
        if(totalsecond<=0){
          clearTimeout(sh);
        }

    },1000)


}
function date_format(totalSecond){
  var second=Math.floor(totalSecond/1000);
  //小时
  var hour = Math.floor(second/3600);
  //分
  var min = zero_fill(Math.floor((second-hour*3600)/60));
  //秒
  var sec=zero_fill(Math.floor(second-hour*3600-min*60));

  return hour+":"+min+":"+sec


}
function zero_fill(time){
  if(time<10){
    return '0'+time;
  }else{
    return time;
  }
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    clock:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      count_down(this)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})