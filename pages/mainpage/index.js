// pages/mainpage/index.js
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    colors: [
      '#ffeecc', 'skyblue', 'aquamarine', 'coral', 'violet', 'thistle'
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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

  },
  downTime: function (e) {
    wx.navigateTo({
      url: './downtime',
    })

  },
  dirftBottle: function () {
    wx.navigateTo({
      url: '../detail/sort',
    })
  },
  mymap: function () {
    var qqmapsdk = new QQMapWX({
      key: 'OCSBZ-HSBCV-J6TP6-U27J5-5475Z-R3FHE' // 必填
    });
    wx.getLocation({
      success: function (res) {
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function (addressRes) {
            var address = addressRes.result.formatted_addresses.recommend;
            wx.openLocation({
              latitude: res.latitude,
              longitude: res.longitude,
              scele: 18,
              address: address
            })
          }
        })


      },
    })


  },
  myroute:function(){
      wx.navigateTo({
        url: './myroute',
      })
  },
  amap:function(){
    wx.navigateTo({
      url: './amap',
    })
  },
  floyd:function(){
    wx.navigateTo({
      url: '../detail/floyd',
    })
  }

})