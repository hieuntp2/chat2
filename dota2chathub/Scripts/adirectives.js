
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

app.directive('publicChat', function ($rootScope) {
    return {
        restrict: 'E',
        scope: true,
        controller: function ($scope, $http, hub_service, user_manage_service) {
            $scope.messages = [{ name: 'Server', avatar: '', content: 'This is the public chat room!' }];

            $scope.sendmessage = function () {

                if ($("#txt_public_chat_input").val())
                {
                    // call a service to send a message to server
                    hub_service.sendRequest($("#txt_public_chat_input").val());
                    $("#txt_public_chat_input").val('');
                    $("#txt_public_chat_input").focus();
                }               
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
                
                scrollToBottomDiv("public_chat_box");               
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

            $scope.int = function()
            {
                // Broadcast de service quản lý các tab thêm tab mới vào
                $rootScope.$broadcast('maintab::addtab', "public_chat_0", "public chat 0");
            }

            // set the function will be excuted when server send a message to client
            hub_service.receiveMessage($scope.addmessage);
        },
        controllerAs: 'controller'
    }
});

// Group Chat
app.directive('groupChat', function () {
    return {
        restrict: 'A',
        scope: true,
        controller: function ($rootScope, $scope, $http, groups_manage_service, user_manage_service, account_infor_service) {
            $scope.idgroup = "";
            $scope.name = "";
            $scope.messages = [];
            $scope.inputMessage = "";
            $scope.users = [];
            $scope.pass = "";

            $scope.init = function (name, pass, groupid) {
                $scope.name = name;
                $scope.pass = pass;
                $scope.idgroup = groupid;
                groups_manage_service.createGroup(name, pass, groupid);
                $scope.addusertogroup(account_infor_service.getid());

                // Broadcast de service quản lý các tab thêm tab mới vào
                $rootScope.$broadcast('maintab::addtab', "group_chat_tab_content_"+groupid, name);
            }
            $scope.receiveGroupIDclient = function (groupid) {
                if (!$scope.idgroup.trim()) {
                    $scope.idgroup = groupid;
                    groups_manage_service.addGroup($scope.idgroup, $scope.name);


                }
            }
            $scope.sendmessage = function () {
                if ($scope.inputMessage.trim()) {
                    groups_manage_service.sendGroupMessage($scope.idgroup, $scope.inputMessage);
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

                    scrollToBottomDiv("group_chat_box_content_" + $scope.idgroup);
                    $scope.addusertogroup(messageobject['id']);
                }
            }

            $scope.addusertogroup = function(userid)
            {
                for(var i = 0 ; i < $scope.users.length; i++)
                {
                    if ($scope.users[i].id == userid)
                    {
                        return;
                    }
                }

                var user = user_manage_service.getuser(userid);
                $scope.users.push(user);
            }

            $scope.refeshusers = function()
            {
                $http.get("../../service/getUserInGroup?groupid=" + $scope.idgroup).success(function (data) {

                    $scope.users = [];
                    for (var i = 0; i < data.length; i++)
                    {
                        var user = user_manage_service.getuser(data[i]);
                        $scope.users.push(user);
                    }
                }).error(function () {
                    alert("Không tồn tại userid = " + userid);
                });
            }
            $scope.getlistuser = function () {
                return $scope.users;
            }
            $scope.setlistusers = function (users) {
                $scope.users = users;
            }
            $scope.exit = function () {
                groups_manage_service.removeGroup($scope.idgroup);
                $("#" + $scope.idgroup).remove();
            }

            $scope.privatechatuser = function(userid)
            {
                alert(userid);
            }

            // set the function will be excuted when server send a message to client
            groups_manage_service.receiveGroupID($scope.receiveGroupIDclient);
            groups_manage_service.reciveGroupChatMessage($scope.addmessage);
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

app.directive('findGroup', function () {
    return {
        restrict: 'A',
        controller: function ($scope, $http, user_manage_service, groups_manage_service) {
            $scope.groups = [];
            $scope.isloading = false;
            $scope.inputsearch = "";
            $scope.findgroup = function () {
                if ($scope.inputsearch.trim()) {
                    $scope.isloading = true;
                    $http.get("../../Service/findgroup?name=" + $scope.inputsearch).success(function (data) {
                        $scope.isloading = false;
                        if (data.length == 0) {
                            $scope.groups = [];
                            $scope.message = "Không tìm thấy nhóm";
                            return;
                        }
                        $scope.message = "";
                        $scope.inputsearch = "";
                        for (var i = 0; i < data.length; i++) {
                            var user = user_manage_service.getuser(data[i].hostid);
                            data[i].host_name = user.name;
                            data[i].host_avatar = user.avatar;
                        }
                        $scope.groups = data;

                    }).error(function () {
                        $scope.isloading = false;
                        alert("Lỗi khi lấy module " + address);
                    });
                }
            }

            $scope.choosegroup = function (groupid) {
                var password = prompt("Please enter group password:", "");

                if (password && groupid) {
                    groups_manage_service.joingroup(groupid, password);
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
        controller: function ($scope, $http, $rootScope, privatechat_manage_service, account_infor_service, user_manage_service) {
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
                    privatechat_manage_service.sendmessage($scope.id, $scope.inputMessage);

                    $scope.addselfmessage($scope.inputMessage);
                    $scope.inputMessage = "";
                }
            }

            $scope.addmessage = function (userid, message) {

                //// Kiểm tra xem đã có tồn tại chat có user chưa
                //// Nếu chưa thì thêm vào sau đó chat
                //if (!privatechat_manage_service.haveprivatechat(userid)) {
                //    privatechat_manage_service.addprivatechat(userid);
                //    privatechat_manage_service.internalresendmessage(userid, message);
                //}

                // Nếu message gửi đúng người thì mới thêm vào chat
                if (userid.trim() === $scope.id.trim()) {
                    var dt = new Date();
                    var item = {};

                    item.name = user_manage_service.getuser(userid).name;
                    item.avatar = user_manage_service.getuser(userid).avatar;
                    item.time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
                    item.content = message;

                    $scope.messages.push(item);
                    scrollToBottomDiv("private_chat_box_content_" + $scope.id);
                }
                else {

                }
            }

            $scope.addselfmessage = function (message) {
                var userid = account_infor_service.getid();
                var dt = new Date();
                var item = {};

                item.name = user_manage_service.getuser(userid).name;
                item.avatar = user_manage_service.getuser(userid).avatar;
                item.time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
                item.content = message;

                $scope.messages.push(item);
                scrollToBottomDiv("private_chat_box_content_" + $scope.id);
            }

            $scope.exit = function () {
                privatechat_manage_service.removeprivate($scope.id);
            }

            $rootScope.$on('directivePM::receivemessage', function (event, userid, mesage) {
                $scope.addmessage(userid, mesage);
            });

           // privatechat_manage_service.receivemessage($scope.addmessage);
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

function scrollToBottomDiv(id_div) {
    $('#' + id_div).stop().animate({
        scrollTop: $("#" + id_div)[0].scrollHeight
    }, 800);
}