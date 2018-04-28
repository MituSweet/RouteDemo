// pages/detail/detail.js
var step=[];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    steps:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   console.log(options)
  var  mystep = options.steps.split(",");
  for (var i = 0; i < mystep.length;i++){
     step.push(mystep[i].replace("到达目的地",""))
   }
  this.setData({
    steps:step
  })
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