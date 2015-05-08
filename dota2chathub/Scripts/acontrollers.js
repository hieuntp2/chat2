var app = angular.module("main_app", ['ngRoute']);
app.controller('modulecontroller', ['$scope', '$http', '$compile', 'hub_service', 'account_infor_service', 'privatechat_manage_service',
    function ($scope, $http, $compile,  hub_service, account_infor_service) {
    var ctrll = this;
    this.modules = [];
   
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

        hub_service.initialize();
        ctrll.getmodule('../../PublicChat/Index', 'main_col_6');
        ctrll.getmodule('../../Home/FriendList', 'main_col_3_left');

        account_infor_service.setid(userid);      
        this.isloading = false;        
    }

    $scope.createGroup = function (name, password) {
        ctrll.getmodule('../../GroupChat/Index?groupname=' + name + '&&pass=' + password + '&&userid=' + account_infor_service.getid(), 'main_col_6');
    }

        // Đăng ký lắng nghe sự kiện tạo private chat
    $scope.$on('module:createprivatechat', function (event, userid) {
        ctrll.getmodule('../../privatechat/Index?id=' + userid, 'main_col_3_left');
    });

    $scope.$on('module:creategroupchat', function (event, name) {
        ctrll.getmodule('../../GroupChat/Index?groupname=' + name + '&&userid=' + account_infor_service.getid(), 'main_col_6');
    });
    $scope.showmodalcreateGroup = function () {
        $('#createGroupChatModal').modal('show');      
    }

    $scope.showmodalfindgroup = function () {
        $('#findgroupmodal').modal('show');
    }
}]);