// main.js sẽ thực hiện các chức năng sau:
//      1. Khai báo các directive cùng các controller tương tứng
//      2. Khai báo controller cho phép load động các directive cần thiết.

var app = angular.module("main_app", ['ngRoute']);
app.controller('modulecontroller', ['$scope', '$http', '$compile', 'hub_service', 'account_infor_service', function ($scope, $http, $compile,
    hub_service, account_infor_service) {
    var ctrll = this;
    this.modules = [];
    hub_service.initialize();

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
        account_infor_service.setid(userid);
    }
    $scope.createGroup = function (name) {

        ctrll.getmodule('../../GroupChat/Index?groupname=' + name + '&&userid=' + account_infor_service.getid(), 'main_col_6');
    }
    this.showmodalcreateGroup = function () {
        $('#createGroupChatModal').modal('show');
    }

}]);

/////////////////////////////////////////////
/////////// DIRECTIVE DEFINATION ////////////
/////////////////////////////////////////////


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
        restrict: 'E',
        scope: true,
        controller: function ($scope, $http, hub_service, groups_manage_service, account_infor_service) {
            $scope.idgroup = "";
            $scope.name = "";
            $scope.messages = [];
            $scope.inputMessage = "";


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

            // set the function will be excuted when server send a message to client
            hub_service.receiveGroupID($scope.receiveGroupIDclient);
            hub_service.reciveGroupChatMessage($scope.addmessage);
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

///////////////////////////////////////////
/////////// SERVICE DEFINATION ////////////
///////////////////////////////////////////

app.service('hub_service', function ($http, $compile, $rootScope, user_manage_service, groups_manage_service, account_infor_service) {

    this.getmodule = function (url, div_insert) {
        $http.get(url).success(function (data) {

            var el = $compile(data)($scope);
            $("#" + div_insert + "").append(el);
        }).error(function () {
            alert("Lỗi khi lấy module " + address);
        });
    }

    var proxy = null;

    var initialize = function () {
        //Getting the connection object
        connection = $.hubConnection();

        //Creating proxy
        this.proxy = connection.createHubProxy('ServerHub');

        //Starting connection
        connection.start();

        //Publishing an event when server pushes a greeting message
        this.proxy.on('acceptGreet', function (message) {
            $rootScope.$emit("acceptGreet", message);
        });
    };

    // PublicChat Mesasge
    var receiveMessage = function (recevieMessageCallBack) {
        //Attaching a callback to handle acceptGreet client call
        this.proxy.on('acceptGreet', function (message) {
            $rootScope.$apply(function () {

                var obj = $.parseJSON(message);
                var user = user_manage_service.getuser(obj.userid);

                obj.name = user.name;
                obj.avatar = user.avatar;

                recevieMessageCallBack(obj);
            });
        });
    }
    var sendRequest = function (message) {
        //Invoking greetAll method defined in hub
        this.proxy.invoke('PublicChatSend', message, account_infor_service.getid());
    };

    // Group Chat Message
    var createGroup = function (groupname) {
        this.proxy.invoke('createGroup', groupname, account_infor_service.getid());
    }

    var reciveGroupChatMessage = function (reciveGroupChatMessageCallBack) {
        //Attaching a callback to handle acceptGreet client call
        this.proxy.on('reciveGroupChatMessage', function (message, groupid) {
            $rootScope.$apply(function () {
                var obj = $.parseJSON(message);
                var user = user_manage_service.getuser(obj.userid);

                obj.linkavatar = user.avatar;
                obj.name = user.name;
                obj.avatar = user.avatar;

                reciveGroupChatMessageCallBack(obj, groupid);
            });
        });
    }
    var sendGroupMessage = function (iduser, idgroup, message) {
        this.proxy.invoke('GroupChatSend', account_infor_service.getid(), idgroup, message);
    }

    var receiveGroupID = function (receiveGroupIDCallBack) {
        //Attaching a callback to handle acceptGreet client call
        this.proxy.on('receiveGroupID', function (groupid) {
            $rootScope.$apply(function () {
                receiveGroupIDCallBack(groupid);
            });
        });
    }

    return {
        initialize: initialize,
        sendRequest: sendRequest,
        receiveMessage: receiveMessage,

        //Group message
        createGroup: createGroup,
        receiveGroupID: receiveGroupID,
        reciveGroupChatMessage: reciveGroupChatMessage,
        sendGroupMessage: sendGroupMessage
    };
})

// Cấu trúc user:
// user {id, name, avatar}
// Quan ly ds nguoi dung để tránh việc trao đổi thông tin nhiều lần
app.service('user_manage_service', function ($http) {
    var listuser = [];

    this.getuserinfofromserver = function (userid) {
        var user = {};

        $http.get("../../service/getuserinfo?id=" + userid).success(function (data) {
            user.id = data.userid;
            user.name = data.username;
            user.avatar = data.linkavatar;
            user.displayname = data.displayname;
            user.score = data.Totalscore;
            user.steamid = data.steamid;
            user.birthday = data.birthday;

        }).error(function () {
            alert("Không tồn tại userid = " + userid);
        });

        return user;
    }
    this.adduser = function (userid, username, linkavatar) {
        // neu ton tai userid thi thoat ra
        for (var i = 0; i < listuser.length; i++) {
            if (listuser[i].id == userid) {
                return;
            }
        }

        // neu khong thi them vao
        var user = {};
        user.id = userid;
        user.name = username;
        user.avatar = linkavatar;

        listuser.push(user);
    }
    this.adduser = function (user) {
        // neu ton tai userid thi thoat ra
        for (var i = 0; i < listuser.length; i++) {
            if (listuser[i].id == user.id) {
                return;
            }
        }

        listuser.push(user);
    }
    this.getavatar = function (userid) {
        // neu ton tai userid thi thoat ra
        for (var i = 0; i < listuser.length; i++) {
            if (listuser[i].id == userid) {
                return listuser[i].avatar;
            }
        }
        return null;
    }
    this.getuser = function (userid) {

        var user = {};
        // neu ton tai userid thi thoat ra
        for (var i = 0; i < listuser.length; i++) {
            if (listuser[i].id == userid) {
                return user = listuser[i];
            }
        }

        user = this.getuserinfofromserver(userid);
        this.adduser(user);
        return user;
    }

    this.offUserInfor = function () {
        $("#_user_infor_view").css({ display: 'none' });
    }

    this.showmodalUserInfor = function (userid) {
        if (userid == null || userid == "") {
            return;
        }
        var data = this.getuser(userid.trim());

        $("#_modalUser_Name").html(data.displayname);
        $("#_modalUser_avatar").attr("src", data.avatar);
        $("#_modalUser_score").html(data.score);
        $("#_modalUser_steamid").html(data.steamid);

        var dateString = data.birthday.toString().substr(6);
        var currentTime = new Date(parseInt(dateString));
        var month = currentTime.getMonth() + 1;
        var day = currentTime.getDate();
        var year = currentTime.getFullYear();
        var date = day + "/" + month + "/" + year;
        $("#_modalUser_joinday").html(date);

        $("#_user_infor_view").css({ top: y, left: x });

        $("#_user_infor_view").fadeIn();
    }
})
app.service('groups_manage_service', function ($http) {
    var groups = [];
    this.addGroup = function (id, name) {
        var group = {
            id: id,
            name: name
        }

        groups.push(group);
    }
    this.removeGroup = function (id) {
        for (var i = 0; i < groups.length; i++) {
            if (groups[i].id == id) {
                delete groups[i];
                alert("delete group " + i + ", " + groups.length);
            }
        }
    }
})

// Thông tin người dùng hiện tại
app.service('account_infor_service', function ($http) {
    var _current_userid = "151312";
    var _current_username = "hieu";
    var _current_avatar = "";

    this.setid = function (id) {
        _current_userid = id;
    }
    this.getid = function () {
        return _current_userid;
    }

    this.setname = function (name) {
        _current_username = name;
    }
    this.getname = function () {
        return _current_username;
    }

    this.setavatar = function (avatar) {
        _current_avatar = avatar;
    }
    this.getavatar = function () {
        return _current_avatar;
    }

})

function autoscroll() {
    $(".chatboxbody").scrollTop(1000);
}

///////////////////////////////////////////
////////////////// ADDON //////////////////
///////////////////////////////////////////

function findAndRemoveJson(array, property, value) {
    $.each(array, function (index, result) {
        if (result[property] == value) {
            //Remove from array
            array.splice(index, 1);
        }
    });
}

$(document).mousemove(function (e) {
    window.x = e.pageX;
    window.y = e.pageY;
});






