// pages/mainpage/dirftBottle.js
var amapFile = require('../../libs/amap-wx.js');
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk = new QQMapWX({
  key: 'OCSBZ-HSBCV-J6TP6-U27J5-5475Z-R3FHE' // 必填
});
var sortPoints = [];
var index = 0;
var routePoints = [];


var startPoint = [];  //起点



function init(that) {  //初始化方法
  sortPoints = [];
  index = 0;
  routePoints = [];
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
    modalHidden: true
  },
  onLoad: function () {
    var that=this;
    wx.clearStorageSync();
    wx.clearStorage({
      success:function(){
        init(that)
      }
    })
    gethotal(this);
  },
  getAddress: function () {
    var that = this;
    //地址选择
    wx.chooseLocation({
      success: function (resoure) {

        wx.showModal({
          title: '提示',
          content: '是否设置'+resoure.address+'为起点',
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
              var myPoint = sortPoints;
              init(that);
              getShortestList(that, myPoint);
            } else {
              startPoint = sortPoints[0];   //将原本的起点保存到startPoint     
              var newPoint={
                latitude: resoure.latitude,
                longitude: resoure.longitude,
                address: resoure.address

              };
              sortPoints[0]=newPoint;
              sortPoints.push({    //将最开始选择点push进去
                latitude: startPoint.latitude,
                longitude: startPoint.longitude,
                address: startPoint.address
              })
             
              console.log(sortPoints)
              var myPoint = sortPoints;
              init(that);
              getShortestList(that, myPoint);
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
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: sortPoints[e.markerId].latitude,
        longitude: sortPoints[e.markerId].longitude
      },
      success: function (res) {
        var item = 'markers[' + (e.markerId) + '].title';
        that.setData({
          [item]: res.result.formatted_addresses.recommend

        })
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {

      }
    });
  },
})
function gethotal(that) {
  qqmapsdk.search({
    keyword: '商场',
    success: function (res) {
      that.setData({
        latitude: res.data[0].location.lat,
        longitude: res.data[0].location.lng,

      })
      var address = [];
      for (var i = 0; i < res.data.length; i++) {
        address[i] = res.data[i]
      }
      var myPoint = [];
      for (var i = 0; i < address.length; i++) {
        myPoint.push({
          latitude: address[i].location.lat,
          longitude: address[i].location.lng,
          address: address[i].address
        })
      }

      getShortestList(that, myPoint);

    },
    fail: function (info) {

    }

  })
}


//计算点距离最短的列表

function getShortestList(that, myPoint) {
  wx.showLoading({
    title: '正在计算最佳路径',
  })
  sortPoints.push(myPoint[myPoint.length - 1]);   //将第一个点放入sortPoints中
  getShorts(that, myPoint);   //使用递归排序来算出最短路径

}

//使用递归调用来算出最短的路径
function getShorts(that, myPoints) {
  if (myPoints.length <= 1) {  //当点的数量为1时
    dataChange(that)

  } else {  //当点的数量大于1时，使用递归来获取点中最小数据
    var myPoint = [];    
    for (var i = myPoints.length - 1; i > 0; i--) {   //目标点

      myPoint.push(myPoints[i - 1]);
    }
    sleep(220);
    qqmapsdk.calculateDistance({   //计算两点之间的距离
      from: {  //起始点
        latitude: myPoints[myPoints.length - 1].latitude,
        longitude: myPoints[myPoints.length - 1].longitude
      },
      to: myPoint,
      success: function (res) {
        var sort = res.result.elements;
        for (var i = 0; i < sort.length - 1; i++) {  //使用冒泡算法对结果排序
          for (var j = i; j < sort.length; j++) {
            if (sort[j].distance > sort[i].distance) {
              var mid = sort[i];
              sort[i] = sort[j];
              sort[j] = mid;
            }
          }
        }
        sortPoints.push({
          latitude: sort[sort.length - 1].to.lat,
          longitude: sort[sort.length - 1].to.lng
        });
        var point = [];
        for (var k = 0; k < sort.length; k++) {

          point.push({
            latitude: sort[k].to.lat,
            longitude: sort[k].to.lng
          })
        }
        //将第一个点放入sortPoints中
        getShorts(that, point);
      },
      fail: function (res) {
        console.log(res)
        dataChange(that)
      },
      complete: function (res) {

      }
    });
  }
}

function dataChange(that) {
  var sortPoint = [];
  for (var k = 0; k < sortPoints.length; k++) {  //设置marker点
    sortPoint.push({
      iconPath: "../.././img/icon_mark" + parseInt((k % 10) + 1) + ".png",
      id: k,
      latitude: sortPoints[k].latitude,
      longitude: sortPoints[k].longitude,
      width: 24,
      height: 34,
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
  var myAmapFun = new amapFile.AMapWX({ key: '8ba4645789e8f3486eea1ebaebb06d12' });

  if (index >= mypoints.length - 1) {
    that.setData({
      polyline: [{
        points: routePoints,
        color: "#4B58F5",
        width: 4
      }]
    })
    wx.hideLoading();
  } else {
    myAmapFun.getWalkingRoute({
      origin: mypoints[index].longitude + ',' + mypoints[index].latitude,
      destination: mypoints[index + 1].longitude + ',' + mypoints[index + 1].latitude,
      success: function (data) {
        if (data.paths && data.paths[0] && data.paths[0].steps) {
          var steps = data.paths[0].steps;
          for (var j = 0; j < steps.length; j++) {
            var polen = steps[j].polyline.split(";");

            for (var k = 0; k < polen.length; k++) {
              routePoints.push({
                longitude: parseFloat(polen[k].split(',')[0]),
                latitude: parseFloat(polen[k].split(',')[1])
              })
            }
          }
        }
        index++;
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







