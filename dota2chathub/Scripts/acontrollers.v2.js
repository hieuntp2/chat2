
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
       
        
        $scope.$on('module:joingroup', function (event, groupid, password) {
            var address = '../../GroupChat/joingroup?groupid=' + groupid + '&&pass=' + password + '&&userid=' + account_infor_service.getid() + "&&v=2";
            
            $http.get(address).success(function (data) {
                var el = $compile(data)($scope);
                $("#main_content_box").append(el);
            }).error(function () {
                $rootScope.$broadcast('groupchat:ErrorPassword', groupid);
            });
        });

        // Group Chat
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

//
// tab.havenewmessage = 0: ko co message moi
//                      1: dang doi mau 1
//                      2: dang doi mau 2
app.controller('maintabscontroller', ['$scope', '$timeout', function ($scope, $timeout) {

    var ctrl = this;
    // [{idtab, tabname}]
    ctrl.tabs = [];

    // Thêm tab khi có sự kiện add tab xảy ra
    $scope.$on('maintab::addtab', function (event, id, name) {
        var tab = {};
        tab.id = id;
        tab.name = name;
        tab.havenewmessage = 0;
        tab.isactive = 0;
        ctrl.tabs.push(tab);
    });

    // Xóa tab khi có sự kiện close tab xảy ra
    $scope.$on('maintab::closetab', function (event, id) {
        id = "group_chat_tab_content_" + id;
        $("#" + id).remove();
        for (var i = 0; i < ctrl.tabs.length; i++)
        {
            if(ctrl.tabs[i].id == id)
            {
                ctrl.tabs.splice(i, 1);
            }
        }
       
    });

    // Khi nhân được sự kiện nhận message, thì tìm kiếm tab id
    // sau đó kiểm tra, nếu tab đó ko ở trạng thái active,
    // thì gọi set nó là ko active, để hiển thị đổi màu cho tab.
    $scope.$on('maintab::receivemessage', function (event, id) {
        for(var i = 0; i < ctrl.tabs.length; i++)
        {
            if(ctrl.tabs[i].id == id)
            {
                // nếu tab ko active thì mới set có message mới
                if (ctrl.tabs[i].isactive == 0)
                {
                    ctrl.tabs[i].havenewmessage = 1;
                }                
            }
        }
    });

    // Kiểm tra xem, những tab nào đang trong trạng thái là nhận được message mới
    // thì bắt đầu đổi màu cho tab.
    $scope.runcheckNewMessage = function () {
        for (var i = 0; i < ctrl.tabs.length; i++)
        {
            if (ctrl.tabs[i].havenewmessage != 0)
            {
                if (ctrl.tabs[i].havenewmessage == 1)
                {
                    ctrl.tabs[i].havenewmessage = 2;
                    // change css here
                    $("#tab_header_panel" + ctrl.tabs[i].id).addClass('tabnewmessagealert');
                }
                else
                {
                    ctrl.tabs[i].havenewmessage = 1;
                    // change css here
                    $("#tab_header_panel" + ctrl.tabs[i].id).removeClass('tabnewmessagealert');
                }                
            }
        }
    }

    // Sau 1s, gọi hàm này để chạy hàm kiểm tra các tab nhận được message
    $scope.onTimeout = function () {
        mytimeout = $timeout($scope.onTimeout, 1000);
        $scope.runcheckNewMessage();
    }
    var mytimeout = $timeout($scope.onTimeout, 1000);

    // Khi tab được click, thì set tab đó là active, đồng thời set các tab còn lại là ko active
    // để thuận tiện cho việc kiểm tra nhận message mới
    $scope.tabonclick = function (tabid)
    {
        for(var i = 0; i < ctrl.tabs.length; i++)
        {
            if(ctrl.tabs[i].id == tabid)
            {
                ctrl.tabs[i].havenewmessage = 0;
                ctrl.tabs[i].isactive = 1;
            }
            else {
                ctrl.tabs[i].isactive = 0;
            }
        }
    }
    // starttimer

}]);

app.controller('pendinggamecontroller', ['$scope', '$rootScope', '$http', 'user_manage_service', 'games_manage_service',
    function ($scope, $rootScope, $http, user_manage_service, games_manage_service) {

        var ctrl = this;
        // [{id, name, users[]}]
        $scope.pendings = [];
        $scope.starteds = [];
        $scope.pendingmessage = "";
        $scope.startedmessage = "";

        // Các biến dùng cho start game modal
        $scope.id = "";
        $scope.name = "";
        $scope.users = [];

        $scope.init = function () {
            if ($scope.pendings.length == 0) {
                $scope.pendingmessage = "0 pending game!";
            }

            if ($scope.starteds.length == 0) {
                $scope.startedmessage = "0 game started";
            }
        }
        $scope.removependinggame = function(gameid)
        {
            for (var i = 0; i < $scope.pendings.length; i++) {
                if($scope.pendings[i].id == gameid)
                {
                    $scope.pendings.splice(i, 1);
                    return;
                }
            }
        }
        $scope.removestartedggame = function (gameid) {
            for (var i = 0; i < $scope.starteds.length; i++) {
                if ($scope.starteds[i].id == gameid) {
                    $scope.starteds.splice(i, 1);
                    return;
                }
            }
        }

        $scope.showmodalcreateGame = function () {
            $('#createGameChatModal').modal('show');
        }
        $scope.showmodalfindGame = function () {
            $('#findGamemodal').modal('show');
        }
        $scope.showStartGameModal = function (id) {
            if (!id) {
                return;
            }
            var name = "";
            for (var i = 0; i < $scope.pendings.length; i++) {
                if ($scope.pendings[i].id == id) {
                    name = $scope.pendings[i].name;
                    break;
                }
            }

            $rootScope.$broadcast('startgamemodal::showgameinfor', id, name);
        }
        $scope.showfinishgame = function (id)
        {
            if (!id) {
                return;
            }
            var name = "";
            for (var i = 0; i < $scope.starteds.length; i++) {
                if ($scope.starteds[i].id == id) {
                    name = $scope.starteds[i].name;
                    break;
                }
            }

            $rootScope.$broadcast('finishgamemodal::showfinishgamemodal', id, name);            
        }

        $rootScope.$on('penddinggame::joingame', function (event, data) {
            $scope.addgame(data);
            $scope.pendingmessage = $scope.pendings.length + " pending game";
        });
        $rootScope.$on('pendinggame::startgame', function (event, gameid) {
            for(var i = 0; i < $scope.pendings.length; i++)
            {
                if($scope.pendings[i].id == gameid)
                {
                    $scope.starteds.push($scope.pendings[i]);
                    $scope.removependinggame(gameid);

                    $scope.pendingmessage = $scope.pendings.length + " pending game";
                    $scope.startedmessage = $scope.starteds.length + " started game";
                }
            }
        });
        $rootScope.$on('pendinggame::finishgame', function (event, gameid) {
            $scope.removestartedggame(gameid);
            $scope.startedmessage = $scope.starteds.length + " started game";
        });
        $rootScope.$on('pendinggame::leavegame', function (event, gameid) {
            $scope.removependinggame(gameid);
            $scope.pendingmessage = $scope.pendings.length + " pending game";
        });

        $scope.addgame = function (game) {
            var item = {};
            item.id = game.id;
            item.name = game.name;
            item.pass = game.password;
            item.hostid = game.hostid;

            $scope.pendings.push(item);
            $scope.message = $scope.pendings.length + " game";

            games_manage_service.addGame(item.id);
        }

    }]);

