var bmap = require('../../libs/bmap-wx.min.js');
var BMap = new bmap.BMapWX({
  ak: 'hvOlu9CsXI4ifNBXWTHHdkXIx2UnCdmU'
}); 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addr:'',
    des:'',
    business:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    console.log(options)
    var pos=options.pos.split(",");
    console.log(pos[0]+','+pos[1])
    that.setData({
      addr:options.address
    })
    BMap.regeocoding({
      location: pos[0]+','+pos[1],
      success: function (res) {
        console.log(res)
        console.log(res.wxMarkerData[0].address);
        that.setData({
          des: res.wxMarkerData[0].desc,
          business: res.wxMarkerData[0].business
        })
      },
      fail: function (res) {
        console.log(res);
      },
    });
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