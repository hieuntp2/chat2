﻿
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
        controller: function ($scope, $http, hub_service, user_manage_service, account_infor_service) {
            $scope.messages = [{ name: 'Server', avatar: '', content: 'This is the public chat room!' }];

            $scope.int = function () {
                // Broadcast de service quản lý các tab thêm tab mới vào
                $rootScope.$broadcast('maintab::addtab', "public_chat_0", "public chat 0");
            }
            $scope.sendmessage = function () {

                if ($("#txt_public_chat_input").val()) {
                    $scope.selfaddmessage($("#txt_public_chat_input").val());
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

            $scope.selfaddmessage = function (content) {
                var dt = new Date();
                var message = {};

                var user = user_manage_service.getuser(account_infor_service.getid());
                message.userid = user.id;

                message.name = user.name;
                message.avatar = user.avatar;
                message.time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
                message.content = content;

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

            $scope.showemotions = function () {
                $rootScope.$broadcast('emotionpanelcontroller::showpanel', 'txt_public_chat_input');
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
        controller: function ($rootScope, $scope, $http, groups_manage_service, user_manage_service, account_infor_service, games_manage_service, my_alert_service) {
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
                $rootScope.$broadcast('maintab::addtab', "group_chat_tab_content_" + groupid, name);
            }
            $scope.receiveGroupIDclient = function (groupid) {
                if (!$scope.idgroup.trim()) {
                    $scope.idgroup = groupid;
                    groups_manage_service.addGroup($scope.idgroup, $scope.name);

                    // Kiểm tra xem nếu có nhóm game nào chưa có groupid thì gán vào
                    games_manage_service.addGroupIDtoGame(groupid);
                }
            }

            $scope.sendmessage = function () {
                $scope.inputMessage = $("#_groupchat_input_" + $scope.idgroup).val();
                if ($scope.inputMessage.trim()) {
                    $scope.selfaddmessage($scope.inputMessage);
                    groups_manage_service.sendGroupMessage($scope.idgroup, $scope.inputMessage);
                    $scope.inputMessage = "";
                }
                $("#_groupchat_input_" + $scope.idgroup).val("");
            }
            $scope.addmessage = function (messageobject, groupid) {
                if (groupid.trim() === $scope.idgroup.trim()) {
                    var dt = new Date();
                    var message = {};

                    message.name = messageobject['name'];
                    message.avatar = messageobject['avatar'];
                    message.time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
                    message.content = messageobject['message'];

                    if (messageobject['id'] == 0) {
                        message.class = "server";
                    }
                    else {
                        message.class = "user";
                    }


                    $scope.messages.push(message);

                    scrollToBottomDiv("group_chat_box_content_" + $scope.idgroup);
                    $scope.addusertogroup(messageobject['id']);
                }
            }
            $scope.selfaddmessage = function (content) {
                var dt = new Date();
                var message = {};

                var user = user_manage_service.getuser(account_infor_service.getid());
                message.userid = user.id;

                message.name = user.name;
                message.avatar = user.avatar;
                message.time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
                message.content = content;


                message.class = "user";

                $scope.messages.push(message);
                scrollToBottomDiv("group_chat_box_content_" + $scope.idgroup);
            }

            $scope.addusertogroup = function (userid) {
                for (var i = 0 ; i < $scope.users.length; i++) {
                    if ($scope.users[i].id == userid) {
                        return;
                    }
                }

                var user = user_manage_service.getuser(userid);
                $scope.users.push(user);
            }

            $scope.refeshusers = function () {
                $http.get("../../service/getUserInGroup?groupid=" + $scope.idgroup).success(function (data) {

                    $scope.users = [];
                    for (var i = 0; i < data.length; i++) {
                        var user = user_manage_service.getuser(data[i]);
                        $scope.users.push(user);
                    }
                }).error(function () {
                    my_alert_service.show_my_alert("Không tồn tại userid = " + userid);
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
                $rootScope.$broadcast('maintab::closetab', $scope.idgroup);
            }
            $scope.showemotions = function () {
                $rootScope.$broadcast('emotionpanelcontroller::showpanel', '_groupchat_input_' + $scope.idgroup);
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
        controller: function ($scope, $http, user_manage_service, my_alert_service) {
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
                        my_alert_service.show_my_alert("Lỗi khi lấy module " + address);
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
                $scope.inputMessage = $("#_privatechat_input_" + $scope.id).val();
                if ($scope.inputMessage.trim()) {
                    privatechat_manage_service.sendmessage($scope.id, $scope.inputMessage);

                    $scope.addselfmessage($scope.inputMessage);
                    $scope.inputMessage = "";
                }
                $("#_privatechat_input_" + $scope.id).val("");
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

            $scope.showemotions = function () {
                $rootScope.$broadcast('emotionpanelcontroller::showpanel', "_privatechat_input_" + $scope.id);
            }
            // privatechat_manage_service.receivemessage($scope.addmessage);
        },
        controllerAs: 'controller'
    }
});

// Model defined controller
app.directive('modalUserInfor', function () {
    return {
        restrict: 'A',
        controller: function ($scope, $http, user_manage_service, my_alert_service) {
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
                            $scope.message = "User not found!";
                            return;
                        }

                        $scope.showheadtable = true;
                        $scope.message = "";
                        for (var i = 0; i < data.length; i++) {
                            var user = user_manage_service.getuser(data[i]);
                            $scope.listuser.push(user);
                        }

                    }).error(function () {
                        my_alert_service.show_my_alert("Something wrong when get: " + address);
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
        controller: function ($scope, $http, $compile, user_manage_service, privatechat_manage_service, my_alert_service) {
            $scope.friendlist = [];
            $scope.message = "";
            $scope.countOnline = 0;
            $scope.isloading = true;
            $scope.onlines = [];

            $scope.init = function () {

                $scope.getfriendlist();
                $scope.getonlinelist();
            }

            $scope.createprivatechat = function (userid) {
                privatechat_manage_service.addprivatechat(userid);
            }

            $scope.getfriendlist = function () {
                $scope.isloading = true;
                $scope.friendlist = [];
                $scope.onlines = [];

                $http.get("../../Service/getlistfriends").success(function (data) {
                    if (data.length == 0) {
                        $scope.message = "0 user online.";
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

                    $scope.message = countonline + "/" + data.length + " users online";
                    $scope.isloading = false;
                }).error(function () {
                    my_alert_service.show_my_alert("Something wrong when getting friend list ");
                });
            }

            $scope.getonlinelist = function () {
                $scope.isloading = true;
                $http.get("../../Service/getonlineusers").success(function (data) {
                    if (data.length == 0) {
                        $scope.onlines = [];
                        $scope.message = "Danh sách bạn bè rỗng hoặc có lỗi xuất hiện.";
                        return;
                    }

                    for (var i = 0; i < data.length; i++) {
                        var user = user_manage_service.getuser(data[i]);
                        $scope.onlines.push(user);
                    }
                    $scope.isloading = false;
                }).error(function () {
                    my_alert_service.show_my_alert("Something wrong when getting friend list!");
                });
            }

            $scope.updateFriends = function () {
                $scope.getonlinelist();
                $scope.getfriendlist();
            }

            $scope.getmodule = function (address, id_div) {
                $http.get(address).success(function (data) {
                    var el = $compile(data)($scope);
                    $("#" + id_div + "").append(el);
                }).error(function () {
                    my_alert_service.show_my_alert("Something wrong when getting: " + address);
                });
            }
        },
        controllerAs: 'controller'
    }
});

app.directive('minigamedirective', function () {
    return {
        restrict: 'A',
        controller: function ($scope, $http, $compile, my_alert_service, mini_games_manage_service) {

            $scope.href = "";
            $scope.id = "";
            $scope.width = "700px";
            $scope.height = "450px";
            $scope.init = function (href) {
                if (href) {
                    $scope.href = href;
                    $scope.id = mini_games_manage_service.addGame(href);
                }
            }

            $scope.remove = function () {
                mini_games_manage_service.removeGame($scope.id);
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
//$('.message_content').emoticonize({});

