var app = angular.module('main_app', []);

app.controller('modulecontroller', ['$http', '$scope', '$compile', function ($http, $scope, $compile) {
    var ctrll = this;
    this.modules = [];

    this.getmodule = function (address, id_div) {
        $http.get(address).success(function (data) {

            var el = angular.element(data),
            compiled = $compile(el);

            $("#" + id_div + "").append(el);


        }).error(function () {
            alert("Lỗi khi lấy module " + address);
        });
    }

    this.init = function () {
        ctrll.getmodule('../../PublicChat/Index', 'main_col_6');
    }
}])


