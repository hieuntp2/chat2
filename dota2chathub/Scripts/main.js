// main.js sẽ thực hiện các chức năng sau:
//      1. Khai báo các directive cùng các controller tương tứng
//      2. Khai báo controller cho phép load động các directive cần thiết.

var app = angular.module("main_app", ['ngRoute']);

app.config(function ($routeProvider) {
    $routeProvider
		.when('/searchtable', { controller: 'CompanyCtrl', templateUrl: 'views/searchtable.html' })
		.when('/publicchat', { controller: 'chatboxcontroller', templateUrl: '../../PublicChat/Index' })
        .when('/', { controller: 'chatboxcontroller', templateUrl: '../../PublicChat/Index' })

});

app.controller('modulecontroller', ['$scope', '$http', '$compile', 'main_service', function ($scope, $http, $compile, main_service) {
    var ctrll = this;
    this.modules = [];

    this.getmodule = function (address, id_div) {
        $http.get(address).success(function (data) {

            var el = $compile(data)($scope);
            $("#" + id_div + "").append(el);

        }).error(function () {
            alert("Lỗi khi lấy module " + address);
        });
    }

    this.init = function () {
        ctrll.getmodule('../../PublicChat/Index', 'main_col_6');
        ctrll.getmodule('../../PublicChat/Index', 'main_col_6');
    }
}])

app.service('main_service', function ($http, $compile) {

    this.getmodule = function (url, div_insert) {
        $http.get(url).success(function (data) {

            var el = $compile(data)($scope);
            $("#" + div_insert + "").append(el);

            //var el = angular.element(data),
            //compiled = $compile(el);

            //$("#" + div_insert + "").append(el);

        }).error(function () {
            alert("Lỗi khi lấy module " + address);
        });
    }
})

app.directive('priviteBox', function () {
    return {
        restrict: 'E',       
        controller: function ($scope, $http) {
            var ctrll = this;
            $scope.messages = [
            {
                name: 'hieu',
                avatar: '',
                time: 11,
                content: 'message 1'
            },
            {
                name: 'hieu2',
                avatar: '2',
                time: 11,
                content: 'message 2'
            }
            ];

            $scope.clickfunction = function () {
                alert("OK");
            }
        },
        controllerAs: 'controller'
    }
});

