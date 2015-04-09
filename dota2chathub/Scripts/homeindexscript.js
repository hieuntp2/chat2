var app = angular.module("main_app", ['ngRoute']);

//app.config(function ($routeProvider) {
//    $routeProvider
//		.when('/searchtable', { controller: 'CompanyCtrl', templateUrl: 'views/searchtable.html' })
//		.when('/publicchat', { controller: 'chatboxcontroller', templateUrl: '../../PublicChat/Index' })
//        .when('/', { controller: 'chatboxcontroller', templateUrl: '../../PublicChat/Index' })    
		
//});

app.controller('modulecontroller', ['$scope', 'main_service', function ($scope, main_service) {
    var ctrll = this;
    this.modules = [];

    this.getmodule = function (address, id_div) {
    }

    this.init = function () {
       // main_service.getmodule('../../PublicChat/Index', 'main_col_6');
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

app.directive('priviteBox', function () {
    return {
        restrict: 'E',
        templateUrl: "/Module/PublicChat/BoxPublicChat.html",
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


