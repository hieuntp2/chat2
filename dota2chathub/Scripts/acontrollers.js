var app = angular.module("main_app", ['ngRoute']);
app.controller('modulecontroller', ['$scope', '$http', '$compile', 'hub_service', 'account_infor_service', function ($scope, $http, $compile,
    hub_service, account_infor_service) {
    var ctrll = this;
    this.modules = [];
    hub_service.initialize();
    this.isloading = true;

    this.getmodule = function (address, id_div) {
        $http.get(address).success(function (data) {

            var el = $compile(data)($scope);
            $("#" + id_div + "").append(el);

        }).error(function () {
            alert("Lỗi khi lấy module " + address);
        });
    }
    this.init = function (userid) {
        ctrll.getmodule('../../PublicChat/Index', 'main_col_6');
        ctrll.getmodule('../../Home/FriendList', 'main_col_3_left');

        account_infor_service.setid(userid);
        this.isloading = false;
    }
    $scope.createGroup = function (name) {

        ctrll.getmodule('../../GroupChat/Index?groupname=' + name + '&&userid=' + account_infor_service.getid(), 'main_col_6');
    }

    $scope.createPrivateChat = function (userid) {
        ctrll.getmodule('../../privatechat/Index?id=' + userid, 'main_col_6');
    }
    this.showmodalcreateGroup = function () {
        $('#createGroupChatModal').modal('show');
    }

}]);