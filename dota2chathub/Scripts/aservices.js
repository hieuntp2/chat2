﻿var app = angular.module("main_app", []);
app.service('hub_service', function ($http, $compile, $rootScope,
    user_manage_service, account_infor_service) {
    var proxy = null;

    var initialize = function () {
        //Getting the connection object        
        connection = $.hubConnection();
        //Creating proxy
        this.proxy = connection.createHubProxy('ServerHub');

        // Cần thiết gọi hàm này ở đây để fix bug: vào lần đầu không khởi tạo được connection, phải nhấn F5 mới tạo được connection
        this.proxy.on('');
        connection.start();
    };

    // PublicChat Mesasge
    var sendRequest = function (message) {
        //Invoking greetAll method defined in hub
        this.proxy.invoke('PublicChatSend', message, account_infor_service.getid());
    };
    var receiveMessage = function (recevieMessageCallBack) {        
        //Attaching a callback to handle acceptGreet client call
        this.proxy.on('acceptGreet', function (message) {
            $rootScope.$apply(function () {
               
                var obj = $.parseJSON(message);
                var user = user_manage_service.getuser(obj.userid);
                obj.name = user.name;
                obj.avatar = user.avatar;
                recevieMessageCallBack(obj);

                // gọi sự kiện này để thông báo tabcontroller là có sự kiện này xảy ra
                $rootScope.$broadcast('maintab::receivemessage', 'public_chat_0');
            });
        });
    }


    // private chat
    var sendprivateMessage = function (userid, message) {
        this.proxy.invoke('sendprivateMessage', account_infor_service.getid(), userid, message);
    }
    var privatemessage = function (recevieMessageCallBack) {
        //Attaching a callback to handle acceptGreet client call
        this.proxy.on('reciverprivatemessage', function (userid, message) {
            $rootScope.$apply(function () {
                recevieMessageCallBack(userid, message);
                playprivatemessage();
                return userid;
            });
        });
    }

    // Group Chat Message
    var createGroup = function (groupname, pass, groupid) {
        this.proxy.invoke('joingroup', groupid, account_infor_service.getid());
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
                obj.id = user.id;
                reciveGroupChatMessageCallBack(obj, groupid);

                // gọi sự kiện này để thông báo tabcontroller là có sự kiện này xảy ra
                $rootScope.$broadcast('maintab::receivemessage', groupid);
                playgroupmessage();
            });
        });
       
    }
    var sendGroupMessage = function (idgroup, message) {
        this.proxy.invoke('GroupChatSend', account_infor_service.getid(), idgroup, message);
    }
    var joingroup = function (groupid, password) {
        // Goi su kien module:joingroup de acontroller nhan su kien tham gia nhom
        $rootScope.$broadcast('module:joingroup', groupid, password);
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

        // private chat
        sendprivateMessage: sendprivateMessage,
        privatemessage: privatemessage,

        //Group message
        createGroup: createGroup,
        receiveGroupID: receiveGroupID,
        reciveGroupChatMessage: reciveGroupChatMessage,
        sendGroupMessage: sendGroupMessage,
        joingroup: joingroup,
    };
})

// Cấu trúc user:
// user {id, name, avatar, score, rank}
// Quan ly ds nguoi dung để tránh việc trao đổi thông tin nhiều lần
app.service('user_manage_service', function ($http, my_alert_service) {
    var listuser = [{id: 0, name: "Server", avatar:""}];

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
            my_alert_service
            my_alert_service.show_my_alert("Không tồn tại userid = " + userid);
            return user;
        });

        $http.get("../../service/getuserrank?userid=" + userid).success(function (data) {
            user.rank = data;
        }).error(function () {
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
app.service('groups_manage_service', function ($http, $rootScope, hub_service, my_alert_service) {
    var groups = [];
    var addGroup = function (id, name) {
        if (haveGroup(id)) {
            return;
        }

        var group = {
            id: id,
            name: name
        }

        groups.push(group);
    }
    var removeGroup = function (id) {
        for (var i = 0; i < groups.length; i++) {
            if (groups[i].id == id) {
                groups.splice(i, 1);
            }
        }
    }
    var haveGroup = function (id) {
        for (var i = 0; i < groups.length; i++) {
            if (groups[i].id == id) {
                return true;
            }
        }

        return false;
    }

    var createGroup = function (name, pass, groupid) {
        addGroup(groupid, name);
        hub_service.createGroup(name, pass, groupid);
    }

    var joingroup = function (groupid, password) {
        
        if (haveGroup(groupid))
        {
            my_alert_service.show_my_alert("Group you find is already in your page!");
            return;
        }
        else {
            addGroup(groupid, "");
            hub_service.joingroup(groupid, password);
        }       
    }

    var sendGroupMessage = function (groupid, message) {
        hub_service.sendGroupMessage(groupid, message);
    }

    var receiveGroupID = function(receiveGroupCallback)
    {
        hub_service.receiveGroupID(receiveGroupCallback);
    }

    var reciveGroupChatMessage = function(reciveGroupChatMessageCallBack)
    {
        hub_service.reciveGroupChatMessage(reciveGroupChatMessageCallBack);
    }


    //groupchat:ErrorPassword
    $rootScope.$on('groupchat:ErrorPassword', function (event, groupid) {
        my_alert_service.show_my_alert("Password is incorrect!");
        removeGroup(groupid);
    });
    return {
        createGroup: createGroup,
        sendGroupMessage: sendGroupMessage,
        joingroup: joingroup,
        removeGroup: removeGroup,

        reciveGroupChatMessage: reciveGroupChatMessage,
        receiveGroupID: receiveGroupID
    }
})

// Phương thức nhận chat là gửi đồng bộ qua tất cả các chat, sau đó mỗi controller tự kiếm tra xem mình có đúng với người nhận không
// Nếu đúng thì sau đó mới thêm vào khung chát
app.service('privatechat_manage_service', function ($http, $rootScope, hub_service) {
    var privates = [];
    var service = this;
    this.init = function () {
    }
    var addprivatechat = function (userid, message) {
        if (haveprivatechat(userid)) {
            my_alert_service.show_my_alert("already have " + userid);
            return;
        }

        var chat = {
            id: userid
        }
        privates.push(chat);
        $rootScope.$broadcast('module:createprivatechat', userid, message);
        return userid;
    }
    var removeprivate = function (id) {
        for (var i = 0; i < privates.length; i++) {
            if (privates[i].id == id) {
                privates.splice(i, 1);
                $('#' + id).remove();
            }
        }


    }
    var haveprivatechat = function (id) {
        for (var i = 0; i < privates.length; i++) {
            if (privates[i].id == id) {
                return true;
            }
        }

        return false;
    }

    // send message
    var sendmessage = function (userid, message) {
        hub_service.sendprivateMessage(userid, message);
    }

    // đăng ký call-back function và public ra callback-funcion

    var receivemessagecallback = function (receiveMessageCallBack) {
        hub_service.privatemessage(receiveMessageCallBack);
       
    }

    // Tái gửi lại mesage nội bộ
    var internalresendmessage = function (userid, message) {
        $rootScope.$broadcast('reciverprivatemessage', userid, message);
    }

    var getMessageFromHub = function(userid, message)
    {
        if (!haveprivatechat(userid)) {
            addprivatechat(userid, message);
        }

        $rootScope.$broadcast("directivePM::receivemessage", userid, message);
    }

    hub_service.privatemessage(getMessageFromHub);
    return {
        addprivatechat: addprivatechat,
        sendmessage: sendmessage,
        receivemessage: receivemessagecallback,
        haveprivatechat: haveprivatechat,
        internalresendmessage: internalresendmessage,
        removeprivate: removeprivate
    };
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

// Lưu trữ và quản lý các nhóm chat đang tồn tại
app.service('games_manage_service', function ($http, $rootScope, hub_service) {
    var games = [];
    var addGame = function (id, name) {
        if (haveGame(id)) {
            return;
        }

        var game = {
            id: id,
            name: name
        }

        games.push(game);
    }
    var removeGame = function (id) {
        for (var i = 0; i < games.length; i++) {
            if (games[i].id == id) {
                games.splice(i, 1);
            }
        }
    }
    var haveGame= function (id) {
        for (var i = 0; i < games.length; i++) {
            if (games[i].id == id) {
                return true;
            }
        }

        return false;
    }

    var createGame= function (name, pass, gameid) {
        addGame(gameid, name);
    }

    var joingame = function (gameid, password) {
        if (haveGame(gameid)) {
            my_alert_service.show_my_alert("Group you find is already in your page!");
            return;
        }
        else {
            addGame(gameid, "");
        }
    }

    //groupchat:ErrorPassword
    $rootScope.$on('game_service:ErrorPassword', function (event, gameid) {
        my_alert_service.show_my_alert("Password is incorrect!");
        removeGroup(gameid);
    });

    var removegame = function(id)
    {
        for (var i = 0; i < games.length; i++) {
            if (games[i].id == id) {
                games.splice(i, 1);
            }
        }
    }

    var addGroupIDtoGame = function(groupid)
    {
        my_alert_service.show_my_alert(groupid);
        for(var i = 0; i < games.length; i++)
        {
            if (!games[i].groupchatid) {
                games[i].groupchatid = groupid;

                $http.get('../../game/setgroupidtogame?gameid=' + games[i].id + '&&groupid=' + groupid);
            }
        }
    }
    return {
        addGame: addGame,
        removeGame: removeGame,
        haveGame: haveGame,
        createGame: createGame,
        joingame: joingame,
        addGroupIDtoGame: addGroupIDtoGame,
        removegame: removegame
    }
})

// Lưu trữ và quản lý các mini_game đang tồn tại
app.service('mini_games_manage_service', function ($http, $rootScope, hub_service) {
    var games = [];
    var count_id = 0;
    var addGame = function (name) {
        if (haveGame(name)) {
            return;
        }

        var game = {
            name: name,
            id: count_id
        }

        games.push(game);
        count_id += 1;
        return (count_id - 1);
    }

    var removeGame = function (id) {
        for (var i = 0; i < games.length; i++) {
            if (games[i].id == id) {
                games.splice(i, 1);

                $('#_mini_game_' + id).remove();
            }
        }
    }
    var haveGame = function (name) {
        for (var i = 0; i < games.length; i++) {
            if (games[i].name == name) {
                return true;
            }
        }

        return false;
    }
    return {
        addGame: addGame,
        removeGame: removeGame,
        haveGame: haveGame,
    }
})
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



