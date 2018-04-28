var amapFile = require('../../libs/amap-wx.js');  //高德地图
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var config = require('../../libs/config.js');
var qqmapkey = config.Config.qqmapkey;
var amapkey = config.Config.amapkey;
var qqmapsdk = new QQMapWX({
  key: qqmapkey // 必填
});
var myAmapFun = new amapFile.AMapWX({ key: amapkey });

var sortPoints = [];  //排序后的点
var position = 0;
var routePoints = [];  //路线点

var sortIndex = [];

var startPoint = [];  //起点
var sortPoint = [];   //marker点

var routeSteps = [];

var selectPoint = '';

function init(that) {  //初始化方法
  routePoints = [];
  routeSteps = [];
  selectPoint = '';
  position = 0;
  sortIndex.splice(0, sortIndex.length);
  that.setData({
    markers: [],
    polyline: []
  })
}

Page({
  data: {
    markers: [],
    latitude: '',
    longitude: '',
    polyline: [],
    modalHidden: true,
    cost: '',
  },
  onLoad: function () {
    var that = this;
    sortPoints.splice(0, sortPoints.length);
    init(that);
    gethotal(this);
  },
  getAddress: function () {
    var that = this;
    //地址选择
    wx.chooseLocation({
      success: function (resoure) {

        wx.showModal({
          title: '提示',
          content: '是否设置' + resoure.address + '为起点',
          showCancel: true,
          cancelText: '取消',
          cancelColor: '#E3E3E3',
          confirmText: '确定',
          confirmColor: '#3131FA',
          success: function (res) {
            if (res.confirm) {   //当选择将新选择的点设置为起点时将点直接push进去，否则将最上面的点先pop出来，然后将该点push进去，然后再将最开始的点push进去
              sortPoints.push({
                latitude: resoure.latitude,
                longitude: resoure.longitude,
                address: resoure.address
              });
              init(that);
              findTheStart(that, sortPoints)
            } else {
              startPoint = sortPoints[0];   //将原本的起点保存到startPoint     
              var newPoint = {
                latitude: resoure.latitude,
                longitude: resoure.longitude,
                address: resoure.address

              };
              sortPoints[0] = newPoint;
              sortPoints.push({    //将最开始选择点push进去
                latitude: startPoint.latitude,
                longitude: startPoint.longitude,
                address: startPoint.address
              })
              init(that);
              findTheStart(that, sortPoints)
            }
          },
          fail: function (res) { },
          complete: function (res) { },
        })
      },
      fail: function (info) {
        console.log(info)
      }
    })

  },
  markertap: function (e) {
    var that = this;
    selectPoint = sortPoints[e.markerId].latitude + ',' + sortPoints[e.markerId].longitude;
    that.setData({
      cost: sortPoints[e.markerId].address,
    })
  },
  goDetail: function () {
    wx.navigateTo({
      url: '../detail/detail?steps=' + routeSteps,
    })
  },
  posDetail: function () {
    var that = this;
    wx.navigateTo({
      url: '../detail/posDetail?pos=' + selectPoint+'&address='+that.data.cost,
    })
  }
})
function gethotal(that) {
  qqmapsdk.search({
    keyword: '酒店',
    success: function (res) {
      that.setData({
        latitude: res.data[0].location.lat,
        longitude: res.data[0].location.lng,

      })
      var address = [];
      for (var i = 0; i < res.data.length; i++) {
        address[i] = res.data[i]
      }
      for (var i = 0; i < address.length; i++) {
        sortPoints.push({
          latitude: address[i].location.lat,
          longitude: address[i].location.lng,
          address: address[i].address
        })
      }

      findTheStart(that, sortPoints)

    },
    fail: function (info) {
      
    }

  })
}

function findTheStart(that, points) {   //计算起点
  var myPoint = [];
  for (var i = 0; i < points.length; i++) {
    myPoint.push({
      latitude: points[i].latitude,
      longitude: points[i].longitude,
    })
  }
  wx.showLoading({
    title: '正在规划最佳路线',
  })
  sortIndex.push(points.length - 1);
  findTheShort(that, myPoint);
}
function findTheShort(that, points) {
  if (sortIndex.length >= points.length) {
    console.log(sortIndex)
    dataChange(that);
  } else {
    qqmapsdk.calculateDistance({   //计算两点之间的距离
      from: {  //起始点
        latitude: points[sortIndex[sortIndex.length - 1]].latitude,
        longitude: points[sortIndex[sortIndex.length - 1]].longitude
      },
      to: points,
      success: function (res) {
        console.log('-------------------' + sortIndex[sortIndex.length - 1]+'---------')
        var sort = res.result.elements;
        console.log(res)
        var index = -1;
        var pos = 10000;
        for (var i = 0; i < sort.length; i++) {  //使用冒泡算法对结果排序
          if (sortIndex.indexOf(i) != -1) {
            continue;
          } else {
            if (sort[i].distance < pos) {
              pos = sort[i].distance;
              index = i;
            }
          }
        }
        if (index != -1) {
          sortIndex.push(index);
        }
        findTheShort(that, points);
      },
      fail: function (res) {
        console.log(res)
        findTheShort(that, points);
      },
      complete: function (res) {
      }
    });
  }
}


function dataChange(that) {
  setMarkers(that);
}

function setMarkers(that) {
  for (var i = 0; i < sortPoints.length; i++) {
    sortPoint.push({
      iconPath: "../.././img/icon_mark" + parseInt((i % 10) + 1) + ".png",
      id: sortIndex[i],
      latitude: sortPoints[sortIndex[i]].latitude,
      longitude: sortPoints[sortIndex[i]].longitude,
      width: 24,
      height: 34,
      title: sortPoints[sortIndex[i]].address
    })
  }

  that.setData({
    markers: sortPoint
  })
  getRoute(that, sortPoints);
}

//因为获取路径返回的结果是异步的，所以要在他返回结果之后再开始下一轮的路径规划
function getRoute(that, mypoints) {
  if (position >= mypoints.length - 1) {
    that.setData({
      polyline: [{
        points: routePoints,
        color: "#4B58F5",
        width: 4,
        arrowLine: true
      }]
    })
    wx.hideLoading();
  } else {
    myAmapFun.getWalkingRoute({
      origin: mypoints[sortIndex[position]].longitude + ',' + mypoints[sortIndex[position]].latitude,
      destination: mypoints[sortIndex[position + 1]].longitude + ',' + mypoints[sortIndex[position + 1]].latitude,
      success: function (data) {
        if (data.paths && data.paths[0] && data.paths[0].steps) {
          var steps = data.paths[0].steps;
          for (var j = 0; j < steps.length; j++) {
            var polen = steps[j].polyline.split(";");
            routeSteps.push(steps[j].instruction)
            for (var k = 0; k < polen.length; k++) {
              routePoints.push({
                longitude: parseFloat(polen[k].split(',')[0]),
                latitude: parseFloat(polen[k].split(',')[1])
              })
            }
          }
        }
        position++;
        getRoute(that, mypoints)
      },
      fail: function (info) {
        console.log(info)
      }
    });
  }
}

