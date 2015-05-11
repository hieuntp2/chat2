var app = angular.module("main_app", ['ngRoute']);
app.controller('modulecontroller', ['$scope', '$rootScope', '$http', '$compile', 'hub_service', 'account_infor_service', 'privatechat_manage_service',
    function ($scope, $rootScope, $http, $compile, hub_service, account_infor_service) {
        var ctrll = this;
        this.modules = [];

        this.isloading = true;

        this.getmodule = function (address, id_div) {
            $http.get(address).success(function (data) {

                var el = $compile(data)($scope);
                $("#" + id_div + "").append(el);
                return "success";

            }).error(function () {
                alert("Lỗi khi lấy module " + address);
                return "error";
            });
        }

        var getmodule = function (address, id_div) {
            $http.get(address).success(function (data) {

                var el = $compile(data)($scope);
                $("#" + id_div + "").append(el);
                return "success";

            }).error(function () {
                alert("Lỗi khi lấy module " + address);
                return "error";
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

        // Đăng ký lắng nghe sự kiện tạo PRIVATE chat
        $scope.$on('module:createprivatechat', function (event, userid) {
            ctrll.getmodule('../../privatechat/Index?id=' + userid, 'main_col_3_left');
        });

        // Đăng ký lắng nghe sự kiện tạo GROUP chat
        $scope.$on('module:creategroupchat', function (event, name) {
            ctrll.getmodule('../../GroupChat/Index?groupname=' + name + '&&userid=' + account_infor_service.getid(), 'main_col_6');


        });

        $scope.$on('module:joingroup', function (event, groupid, password) {

            var address = '../../GroupChat/joingroup?groupid=' + groupid + '&&pass=' + password + '&&userid=' + account_infor_service.getid();
            $http.get(address).success(function (data) {

                var el = $compile(data)($scope);
                $("#" + 'main_col_6' + "").append(el);
                return "success";

            }).error(function () {
                $rootScope.$broadcast('groupchat:ErrorPassword', groupid);
                return "error";
            });
        });
        $scope.showmodalcreateGroup = function () {
            $('#createGroupChatModal').modal('show');
        }

        $scope.showmodalfindgroup = function () {
            $('#findgroupmodal').modal('show');
        }
    }]);