
app.service('hub_service', function ($http, $compile, $rootScope,
    user_manage_service, account_infor_service, privatechat_manage_service) {

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

    // private chat
    var sendprivateMessage = function (userid, message) {
        this.proxy.invoke('sendprivateMessage', account_infor_service.getid(), message);
    }

    var recivePrivateChatMessage = function (privatemessageCallback) {
        //Attaching a callback to handle acceptGreet client call
        this.proxy.on('reciverprivatemessage', function (userid, message) {
            $rootScope.$apply(function () {

                // Tìm kiếm xem có tồn tại private chat chưa
                // Nếu chưa thì thêm private chat vào, sau đó mới gửi message
                privatechat_manage_service.haveprivatechat(userid);
                privatemessageCallback(userid, message);
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
        sendGroupMessage: sendGroupMessage,

        // private chat
        sendprivateMessage: sendprivateMessage,
        recivePrivateChatMessage: recivePrivateChatMessage
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

// Lưu trữ và quản lý các nhóm chat đang tồn tại
app.service('groups_manage_service', function ($http) {
    var groups = [];
    this.addGroup = function (id, name) {

        if (this.haveGroup(id)) {
            return;
        }

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
    this.haveGroup = function(id)
    {
        for(var i = 0; i< groups.length; i++)
        {
            if(groups[i].id == id)
            {
                return true;
            }
        }

        return false;
    }
})

// Phương thức nhận chat là gửi đồng bộ qua tất cả các chat, sau đó mỗi controller tự kiếm tra xem mình có đúng với người nhận không
// Nếu đúng thì sau đó mới thêm vào khung chát
app.service('privatechat_manage_service', function ($http, hub_service) {
    var privates = [];
    this.addprivatechat = function (userid) {
        if (this.haveprivatechat(userid))
        {
            return;
        }

        var chat = {
            id: userid
        }

        privates.push(chat);
    }
    this.removeprivate = function (id) {
        for (var i = 0; i < privates.length; i++) {
            if (privates[i].id == id) {
                delete privates[i];
                alert("delete group " + i + ", " + groups.length);
            }
        }
    }
    this.haveprivatechat = function (id) {
        for (var i = 0; i < privates.length; i++) {
            if (privates[i].id == id) {
                return true;
            }
        }

        return false;
    }

    this.sendmessage = function(userid, message)
    {

    }

    var receivemessage = function (receiveGroupIDCallBack) {
        //Attaching a callback to handle acceptGreet client call
        this.proxy.on('receiveGroupID', function (groupid) {
            $rootScope.$apply(function () {
                receiveGroupIDCallBack(groupid);
            });
        });
    }

    return
    {
        addprivatechat: addprivatechat
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