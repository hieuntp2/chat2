
app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});
app.directive('removeOnClick', function () {
    return {
        link: function (scope, elt, attrs) {
            scope.remove = function () {
                elt.html('');
            };
        }
    }
});
app.directive('focusMe', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(attrs.focusMe, function (value) {
                if (value === true) {
                    console.log('value=', value);
                    //$timeout(function() {
                    element[0].focus();
                    scope[attrs.focusMe] = false;
                    //});
                }
            });
        }
    };
});

app.directive('publicChat', function () {
    return {
        restrict: 'E',
        scope: true,
        controller: function ($scope, $http, hub_service, user_manage_service) {
            $scope.messages = [{ name: 'Server', avatar: '', content: 'This is the public chat room!' }];

            $scope.sendmessage = function () {

                // call a service to send a message to server
                hub_service.sendRequest($("#txt_public_chat_input").val());
                $("#txt_public_chat_input").val('');
                $("#txt_public_chat_input").focus();
            }

            $scope.addmessage = function (messageobject) {
                var dt = new Date();
                var message = {};

                message.userid = messageobject['userid'];
                message.name = messageobject['name'];
                message.avatar = messageobject['avatar'];
                message.time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
                message.content = messageobject['message'];

                $scope.messages.push(message);

                $(".chatboxbody").scrollTop($(".chatboxbody").offset().top);
                //hub_service.send();

                $('.chatboxbody').animate({
                    scrollTop: $('.chatboxbody').get(0).scrollHeight
                }, 500);
            }

            $scope.clearmessage = function () {
                $scope.messages = [];
            }

            $scope.viewUserInfor = function (userid) {
                user_manage_service.showmodalUserInfor(userid);
            }

            $scope.offUserInfor = function () {
                user_manage_service.offUserInfor();
            }

            // set the function will be excuted when server send a message to client
            hub_service.receiveMessage($scope.addmessage);
        },
        controllerAs: 'controller'
    }
});

app.directive('groupChat', function () {
    return {
        restrict: 'A',
        scope: true,
        controller: function ($scope, $http, hub_service, groups_manage_service, account_infor_service) {
            $scope.idgroup = "";
            $scope.name = "";
            $scope.messages = [];
            $scope.inputMessage = "";
            $scope.users = [];

            $scope.init = function (name) {
                $scope.name = name;
                hub_service.createGroup(name);
            }
            $scope.receiveGroupIDclient = function (groupid) {
                if (!$scope.idgroup.trim()) {
                    $scope.idgroup = groupid;
                    groups_manage_service.addGroup($scope.idgroup, $scope.name);
                }
            }
            $scope.sendmessage = function () {
                if ($scope.inputMessage.trim()) {
                    hub_service.sendGroupMessage(account_infor_service.getid(), $scope.idgroup, $scope.inputMessage);
                    $scope.inputMessage = "";
                }
            }
            $scope.addmessage = function (messageobject, groupid) {
                if (groupid.trim() === $scope.idgroup.trim()) {
                    var dt = new Date();
                    var message = {};

                    message.name = messageobject['name'];
                    message.avatar = messageobject['avatar'];
                    message.time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
                    message.content = messageobject['message'];

                    $scope.messages.push(message);
                }
            }

            $scope.invUser = function () {
                $('#inviteusermodal').modal('show');
            }

            $scope.getlistuser = function()
            {
                return $scope.users;
            }

            $scope.setlistusers = function(users)
            {
                $scope.users = users;
            }

            $scope.exit = function()
            {
                $("#" + $scope.idgroup).remove();
            }

            // set the function will be excuted when server send a message to client
            hub_service.receiveGroupID($scope.receiveGroupIDclient);
            hub_service.reciveGroupChatMessage($scope.addmessage);
        },
        controllerAs: 'controller'
    }
});
app.directive('invUserModal', function () {
    return {
        restrict: 'A',
        controller: function ($scope, $http, user_manage_service) {
            $scope.showheadtable = false;
            $scope.listuser = [];
            $scope.groupusers = [];
            $scope.inputusersearch = "";
            $scope.isloading = false;
            $scope.finduser = function () {

                if ($scope.inputusersearch.trim()) {
                    $scope.isloading = true;
                    $http.get("../../Service/finduser?name=" + $scope.inputusersearch).success(function (data) {
                        $scope.isloading = false;
                        if (data.length == 0) {
                            $scope.listuser = [];
                            $scope.message = "Không tìm thấy người dùng phù hợp đang online";
                            return;
                        }

                        $scope.showheadtable = true;
                        $scope.message = "";
                        for (var i = 0; i < data.length; i++) {
                            var user = user_manage_service.getuser(data[i]);
                            $scope.listuser.push(user);
                        }

                    }).error(function () {
                        $scope.isloading = false;
                        alert("Lỗi khi lấy module " + address);
                    });
                }
            }

            // Khi chọn vào biểu tượng, thì thêm người dùng vào ds người dùng trong nhóm chát, 
            // đồng thời loại người đó ra khỏi danh sách kết quả tìm kiếm
            $scope.addtoGroupChat = function (id) {
                // 
                for (var i = 0; i < $scope.listuser.length; i++) {
                    if ($scope.listuser[i].id == id) {
                        // Thêm người dùng này vào khi
                        $scope.groupusers.push($scope.listuser[i]);
                        $scope.listuser.splice(i, 1);
                        return;
                    }
                }
            }

            // Khi chọn vào biểu tượng, thì thêm người dùng vào ds kết quả tìm kiếm, 
            // đồng thời loại người đó ra khỏi danh sách người dùng trong nhóm chat
            $scope.removeuser = function (id) {
                for (var i = 0; i < $scope.groupusers.length; i++) {
                    if ($scope.groupusers[i].id == id) {
                        $scope.listuser.push($scope.groupusers[i]);
                        $scope.groupusers.splice(i, 1);
                        return;
                    }
                }
            }
        },
        controllerAs: 'controller'
    }
});

app.directive('privateChat', function () {
    return {
        restrict: 'A',
        scope: true,
        controller: function ($scope, $http, privatechat_manage_service, account_infor_service, user_manage_service) {
            // id user chat to
            $scope.id = "";

            // name user chat to
            $scope.name = "";

            $scope.messages = [];
            $scope.inputMessage = "";


            $scope.init = function (id) {
                $scope.id = id;
                var user = user_manage_service.getuser(id);
                $scope.name = user.name;
            }

            $scope.sendmessage = function () {
                if ($scope.inputMessage.trim()) {
                    privatechat_manage_service.sendmessage(account_infor_service.getid(), $scope.inputMessage);

                    //$scope.addmessage(account_infor_service.getid(), $scope.inputMessage);
                    $scope.inputMessage = "";
                }
            }

            $scope.addmessage = function (userid, message) {
               
                // Kiểm tra xem đã có tồn tại chat có user chưa
                // Nếu chưa thì thêm vào sau đó chat
                if (!privatechat_manage_service.haveprivatechat(userid))
                {
                    privatechat_manage_service.addprivatechat(userid);
                    privatechat_manage_service.internalresendmessage(userid, message);
                }

                // Nếu message gửi đúng người thì mới thêm vào chat
                if (userid.trim() === $scope.id.trim()) {
                    var dt = new Date();
                    var item = {};

                    item.name = user_manage_service.getuser(userid).name;
                    item.avatar = user_manage_service.getuser(userid).avatar;
                    item.time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
                    item.content = message;

                    $scope.messages.push(item);
                }
                else {
                    
                }
            }

            $scope.exit = function () {
                privatechat_manage_service.removeprivate($scope.id);
            }

            privatechat_manage_service.receivemessage($scope.addmessage);
        },
        controllerAs: 'controller'
    }
});

// Model defined controller
app.directive('modalUserInfor', function () {
    return {
        restrict: 'A',
        controller: function ($scope, $http, user_manage_service) {
            $scope.name = "";
            $scope.joinday = "";
            $scope.score = 0;
            $scope.avatar = "";
            $scope.getuserinfor = function (userid) {
                if ($scope.inputusersearch.trim()) {
                    $http.get("../../Service/finduser?name=" + $scope.inputusersearch).success(function (data) {
                        $scope.isloading = false;
                        if (data.length == 0) {
                            $scope.listuser = [];
                            $scope.message = "Không tìm thấy người dùng phù hợp đang online";
                            return;
                        }

                        $scope.showheadtable = true;
                        $scope.message = "";
                        for (var i = 0; i < data.length; i++) {
                            var user = user_manage_service.getuser(data[i]);
                            $scope.listuser.push(user);
                        }

                    }).error(function () {
                        alert("Lỗi khi lấy module " + address);
                    });
                }
            }
        },
        controllerAs: 'controller'
    }
});
app.directive('friendsBox', function () {
    return {
        restrict: 'E',
        controller: function ($scope, $http, $compile, user_manage_service, privatechat_manage_service) {
            $scope.friendlist = [];
            $scope.message = "";
            $scope.countOnline = 0;
            $scope.isloading = true;
            $scope.init = function () {

                $scope.getfriendlist();
            }

            $scope.createprivatechat = function (userid) {
                //$scope.getmodule("../../privatechat/index?id=" + userid, "main_col_3_left");

                privatechat_manage_service.addprivatechat(userid);
            }

            $scope.getfriendlist = function () {
                $scope.isloading = true;
                $http.get("../../Service/getlistfriends").success(function (data) {
                    if (data.length == 0) {
                        $scope.friendlist = [];
                        $scope.message = "Danh sách bạn bè rỗng hoặc có lỗi xuất hiện.";
                        return;
                    }
                    var countonline = 0;

                    for (var i = 0; i < data.length; i++) {
                        if (data[i].isonline == true) {
                            countonline += 1;
                        }

                        var user = user_manage_service.getuser(data[i].steamid);
                        user.isonline = data[i].isonline;
                        $scope.friendlist.push(user);
                    }

                    $scope.message = "Có " + countonline + "/" + data.length + " đang online";
                    $scope.isloading = false;
                }).error(function () {
                    alert("Lỗi khi lấy danh sách bạn bè ");
                });
            }
            $scope.updateFriends = function () {
                $scope.getfriendlist();
            }

            $scope.getmodule = function (address, id_div) {
                $http.get(address).success(function (data) {
                    var el = $compile(data)($scope);
                    $("#" + id_div + "").append(el);
                }).error(function () {
                    alert("Lỗi khi lấy module " + address);
                });
            }
        },
        controllerAs: 'controller'
    }
});