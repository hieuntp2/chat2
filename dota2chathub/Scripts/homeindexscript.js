var app = angular.module('main_app', ['ngRoute']);

app.controller('modulecontroller', ['$scope', 'main_service', function ($scope, main_service) {
    var ctrll = this;
    this.modules = [];

    this.getmodule = function (address, id_div) {

    }

    this.init = function () {
        main_service.getmodule('../../PublicChat/Index', 'main_col_6');
    }
}])

app.service('main_service', function ($http, $compile) {

    this.getmodule = function (url, div_insert) {
        $http.get(url).success(function (data) {

            var el = angular.element(data),
            compiled = $compile(el);

            $("#" + div_insert + "").append(el);


        }).error(function () {
            alert("Lỗi khi lấy module " + address);
        });
    }
})

app.config(['$routeProvider',$routeProvider,
  function ($routeProvider) {
      $routeProvider.
        when('/AddNewOrder', {
            templateUrl: 'templates/add_order.html',
            controller: 'AddOrderController'
        }).
        when('/ShowOrders', {
            templateUrl: 'templates/show_orders.html',
            controller: 'ShowOrdersController'
        }).
      when('../../publicchat/index', {
          templateUrl: '/Module/PublicChat/BoxPublicChat.cshtml',
          controller: 'chatboxcontroller'
      })
  }]);
