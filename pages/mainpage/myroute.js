// pages/mainpage/myroute.js
var amapFile = require('../../libs/amap-wx.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    markers: [{
      iconPath: "../../img/start.svg",
      id: 0,
      latitude: 31.189209,
      longitude: 121.435529,
      width: 23,
      height: 33
    }, {
      iconPath: "../../img/end.svg",
      id: 0,
      latitude: 31.188075,
      longitude: 121.439063,
      width: 24,
      height: 34
    }],
    longitude:'121.435529',
    latitude:'31.189209',
      polyline:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    var myAmapFun = new amapFile.AMapWX({ key:'8ba4645789e8f3486eea1ebaebb06d12'});
    myAmapFun.getWalkingRoute({
      origin:'121.435529,31.189209',
      destination:'121.439063,31.188075',
      success:function(data){
        var points=[];
        if(data.paths&&data.paths[0] && data.paths[0].steps){
          var steps=data.paths[0].steps;
          for(var i=0;i<steps.length;i++){
            var polen=steps[i].polyline.split(";");
            for(var j=0;j<polen.length;j++){
              points.push({
                longitude: parseFloat(polen[j].split(',')[0]),
                latitude: parseFloat(polen[j].split(',')[1])
              })
            }
          }
        }
        that.setData({
          polyline: [{
            points: points,
            color: "#0091ff",
            width: 6
          }]


        })



      },
      fail:function(info){
        console.log(info)
      }

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