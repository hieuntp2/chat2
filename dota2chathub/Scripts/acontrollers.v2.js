
app.controller('modulecontroller', ['$scope', '$rootScope', '$http', '$compile', '$timeout', 'hub_service', 'account_infor_service',
    function ($scope, $rootScope, $http, $compile, $timeout, hub_service, account_infor_service) {
        var ctrll = this;
        this.modules = [];

        ctrll.isloading = true;

        this.getmodulesettotab = function (address) {
            $http.get(address).success(function (data) { 
                var el = $compile(data)($scope);
                $("#main_content_box").append(el);
            }).error(function () {
                alert("Lỗi khi lấy module " + address);
            });
        }

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

        this.init = function (userid) {
            hub_service.initialize();

            ctrll.getmodulesettotab('../../PublicChat/Index?v=2');
            ctrll.getmodule('../../Home/FriendList', 'main_col_3_left');
            account_infor_service.setid(userid);
            this.isloading = false;
        }        
        $scope.createGroup = function (name, password) {
            ctrll.getmodulesettotab('../../GroupChat/Index?groupname=' + name + '&&pass=' + password + '&&userid=' + account_infor_service.getid() + "&&v=2");
        }
        
        $scope.$on('module:joingroup', function (event, groupid, password) {
            var address = '../../GroupChat/joingroup?groupid=' + groupid + '&&pass=' + password + '&&userid=' + account_infor_service.getid();
            $http.get(address).success(function (data) {
                var el = $compile(data)($scope);
                $("#" + 'main_col_6' + "").append(el);

            }).error(function () {
                $rootScope.$broadcast('groupchat:ErrorPassword', groupid);
            });
        });
        $scope.showmodalcreateGroup = function () {
            $('#createGroupChatModal').modal('show');
        }

        $scope.showmodalfindgroup = function () {
            $('#findgroupmodal').modal('show');
        }


        // Đăng ký lắng nghe sự kiện tạo PRIVATE chat
        $scope.$on('module:createprivatechat', function (event, userid, message) {
            var address = '../../privatechat/Index?id=' + userid;
            $http.get(address).success(function (data) {
                var el = $compile(data)($scope);
                $("#main_col_3_left").append(el);

                $rootScope.$broadcast('reciverprivatemessage', userid, message);

            }).error(function () {
                alert("Lỗi khi lấy module " + address);
                return "error";
            });

        });

    }]);

app.controller('maintabscontroller', ['$scope', function ($scope) {

    var ctrl = this;
    // [{idtab, tabname}]
    ctrl.tabs = [];

    $scope.addtab = function (id, name) {
        var tab = {};
        tab.id = id;
        tab.name = name;

        $scope.tabs.push(tab);
    }

    $scope.$on('maintab::addtab', function (event, id, name) {
        var tab = {};
        tab.id = id;
        tab.name = name;

        ctrl.tabs.push(tab);
    });
}]);
