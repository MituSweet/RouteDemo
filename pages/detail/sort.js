// pages/mainpage/dirftBottle.js
var amapFile = require('../../libs/amap-wx.js');
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var config = require('../../libs/config.js');
var qqmapkey = config.Config.qqmapkey;
var amapkey = config.Config.amapkey;
var qqmapsdk = new QQMapWX({
  key: qqmapkey // 必填
});
var myAmapFun = new amapFile.AMapWX({
  key: amapkey   //必填
});

var sortPoints = [];  //排序后的点
var position = 0;
var routePoints = [];  //路线点


var startPoint = [];  //起点
var sortPoint = [];   //marker点

var routeSteps = [];

var selectPoint = '';

var sortIndex = [];

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
    sortPoints.splice(0, sortPoints.length)
    init(that)
    gethotal(this);
  },
  getAddress: function () {
    var that = this;
    //地址选择
    wx.chooseLocation({
      success: function (resoure) {

        wx.showModal({
          title: '提示',
          content: '是否添加' + resoure.address + '为访问点',
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
              //   startPoint = sortPoints[0];   //将原本的起点保存到startPoint     
              //   var newPoint = {
              //     latitude: resoure.latitude,
              //     longitude: resoure.longitude,
              //     address: resoure.address
              //   };
              //   sortPoints[0] = newPoint;
              //   sortPoints.push({    //将最开始选择点push进去
              //     latitude: startPoint.latitude,
              //     longitude: startPoint.longitude,
              //     address: startPoint.address
              //   })
              //   init(that);
              //   findTheStart(that, sortPoints)

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
  //marker点击
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
    if (selectPoint.length > 0) {
      wx.navigateTo({
        url: '../detail/posDetail?pos=' + selectPoint + '&address=' + that.data.cost,
      })
    } else {
      wx.showToast({
        title: '请先选择坐标点',
      })
    }
  }
})
function gethotal(that) {
  qqmapsdk.search({
    keyword: '饭店',
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
      // title:parseInt(k+1)
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

function sleep(d) {
  for (var t = Date.now(); Date.now() - t <= d;);
}

function findTheStart(that, points) {   //计算起点
  var sumTotal = [];
  for (var i = 0; i < points.length; i++) {
    var sum = 0;
    for (var j = 0; j < points.length; j++) {
      var distance = getDisance(points[i].latitude, points[i].longitude, points[j].latitude, points[j].longitude);
      sum += distance;
    }
    sumTotal.push(sum);
  }
  var first = sumTotal[0];
  var firstIndex = 0;
  for (var k = 0; k < sumTotal.length; k++) {
    if (sumTotal[k] < first) {
      first = sumTotal[k];
      firstIndex = k;
    }
  }
  sortIndex.push(firstIndex);
  findTheShort(that, sortPoints);

}

//找出最短路径的排序
function findTheShort(that, points) {
  console.log(points)
  if (points.length > 1) {
    wx.showLoading({
      title: '正在规划最佳路线',
    })
    while (sortIndex.length < points.length) {
      var index = '';
      var pos = 1000;
      for (var i = 0; i < points.length; i++) {  //遍历数组
        if (sortIndex.indexOf(i) != -1) {  //不计算已经排序的点
          continue;
        } else {
          var start;
          if (sortIndex.length < 1) {
            start = points[0];
          } else {
            start = points[sortIndex[sortIndex.length - 1]];
          }
          //起点
          var to = points[i]; //终点
          var distance = getDisance(start.latitude, start.longitude, to.latitude, to.longitude);
          if (distance < pos) {
            pos = distance;
            index = i;
          }
        }
      }
      sortIndex.push(index);
    }
    dataChange(that)
  }

}

//计算两点之间的距离

function toRad(d) { return d * Math.PI / 180; }
function getDisance(lat1, lng1, lat2, lng2) {
  //lat为纬度, lng为经度, 一定不要弄错
  var dis = 0;
  var radLat1 = toRad(lat1);
  var radLat2 = toRad(lat2);
  var deltaLat = radLat1 - radLat2;
  var deltaLng = toRad(lng1) - toRad(lng2);
  var dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));
  return dis * 6378137;
}


