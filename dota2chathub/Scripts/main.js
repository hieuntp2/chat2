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
    this.init = function () {
        ctrll.getmodule('../../PublicChat/Index', 'main_col_6');
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
app.directive('publicChat', function () {
    return {

        restrict: 'E',
        scope: true,
        controller: function ($scope, $http, hub_service) {
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
        controller: function ($scope, $http, hub_service, groups_manage_service) {
            $scope.idgroup = "";
            $scope.name = "";
            $scope.messages = [];
            $scope.inputMessage = "";


            $scope.init = function (name) {              
                $scope.name = name;
                hub_service.createGroup(name);                
            }

            $scope.receiveGroupIDclient = function (groupid) {           
                $scope.idgroup = groupid;
                groups_manage_service.addGroup($scope.idgroup, $scope.name);               
            }

            $scope.sendmessage = function () {

                // call a service to send a message to server
                hub_service.sendRequest($("#txt_public_chat_input").val());
                $("#txt_public_chat_input").val('');
                $("#txt_public_chat_input").focus();
            }

            $scope.addmessage = function (messageobject) {
                var dt = new Date();
                var message = {};

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

            // set the function will be excuted when server send a message to client
            hub_service.receiveMessage($scope.addmessage);
            hub_service.receiveGroupID($scope.receiveGroupIDclient);
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

                obj.linkavatar = user.avatar;
                obj.name = user.name;
                obj.avatar = user.avatar;

                recevieMessageCallBack(obj);
            });
        });
    }
    var sendRequest = function (message) {
        //Invoking greetAll method defined in hub
        this.proxy.invoke('PublicChatSend', message);
    };

    // Group Chat Message
    var createGroup = function (groupname) {
      
        this.proxy.invoke('createGroup', groupname, account_infor_service.getid());
    }
    var reciveGroupChatMessage = function (groupid, message) {
        //Attaching a callback to handle acceptGreet client call
        this.proxy.on('acceptGreet', function (message) {
            $rootScope.$apply(function () {

                var obj = $.parseJSON(message);
                var user = user_manage_service.getuser(obj.userid);

                obj.linkavatar = user.avatar;
                obj.name = user.name;
                obj.avatar = user.avatar;

                recevieMessageCallBack(obj);
            });
        });
    }
    var sendGroupMessage = function (iduser, idgroup, message) {
        this.proxy.invoke('GroupChatSend', iduser, idgroup, message);
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

// Quan ly ds nguoi dung để tránh việc trao đổi thông tin nhiều lần
app.service('user_manage_service', function ($http) {
    var listuser = [{
        id: "1",
        name: "service>hieu",
        avatar: "../../content/account_default.png"
    }];

    this.getuserinfofromserver = function (userid) {

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

    this.getusername = function (userid) {
        // neu ton tai userid thi thoat ra
        for (var i = 0; i < listuser.length; i++) {
            if (listuser[i].id == userid) {
                return listuser[i].name;
            }
        }
        return null;
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
        // neu ton tai userid thi thoat ra
        for (var i = 0; i < listuser.length; i++) {
            if (listuser[i].id == userid) {
                return listuser[i];
            }
        }
        return null;
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









