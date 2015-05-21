app.controller('creategamemodalcontroller', ['$scope', '$http', '$compile', '$rootScope', 'account_infor_service', 'games_manage_service',
    function ($scope, $http, $compile, $rootScope, account_infor_service, games_manage_service) {

        $scope.name = "";
        $scope.password = "";
        $scope.nameerror = "";

        $scope.createGame = function () {
            $scope.nameerror = "";
            if (!$scope.name) {
                $scope.nameerror = "Game name should not be empty";
            }
            else
                if ($scope.name > 254) {
                    $scope.nameerror = "Game name length should be below 254 characters";
                }
                else {
                    var address = '../../game/Index?name=' + $scope.name + '&&pass=' + $scope.password + '&&userid=' + account_infor_service.getid();

                    $http.get(address).success(function (data) {
                        $rootScope.$broadcast('penddinggame::joingame', data);
                        $scope.addnewGroupChat(data.id);

                    }).error(function () {
                        alert("Wrong password!");
                    });
                    $("#createGameChatModal").modal('hide');
                }

        }

        $rootScope.$on("creategamemodalcontroller::joingame", function (event, id, name, password) {
            
            var address = '../../game/joingame?gameid=' + id + '&&pass=' + password + '&&userid=' + account_infor_service.getid();

            $http.get(address).success(function (data) {
                $rootScope.$broadcast('penddinggame::joingame', data);
                $rootScope.$broadcast('findGroupcontroller::joinGroup', data);
            }).error(function () {
                alert("Wrong password!");
            });
        });

        $scope.getmodulesettotab = function (address) {
            $http.get(address).success(function (data) {
                var el = $compile(data)($scope);
                $("#main_content_box").append(el);
            }).error(function () {
                alert("Lỗi khi lấy module " + address);
            });
        }

        $scope.addnewGroupChat = function (id) {
            // Sau khi tạo game thành công, thì tạo group chat với tên và password tương ứng
            var address = '../../GroupChat/Index?groupname=' + $scope.name + '&&pass=' + $scope.password + '&&userid=' + account_infor_service.getid() + "&&v=2" + "&&gameid=" + id;
            $scope.getmodulesettotab(address);
            $scope.name = "";
            $scope.password = "";
        }
    }]);

app.controller('findgamecontroller', ['$scope', '$http', '$rootScope', 'user_manage_service', 'account_infor_service', 'games_manage_service',
    function ($scope, $http, $rootScope, user_manage_service, account_infor_service, games_manage_service) {

        $scope.games = [];
        $scope.isloading = false;
        $scope.inputsearch = "";
        $scope.message = "";

        $scope.findgroup = function () {
            if ($scope.inputsearch.trim()) {
                $scope.isloading = true;
                $http.get("../../game/findgame?name=" + $scope.inputsearch).success(function (data) {
                    $scope.isloading = false;
                    if (data.length == 0) {
                        $scope.games = [];
                        $scope.message = "No game found!";
                        return;
                    }
                    $scope.message = "";
                    $scope.inputsearch = "";
                    for (var i = 0; i < data.length; i++) {
                        var user = user_manage_service.getuser(data[i].hostid);
                        data[i].host_name = user.name;
                        data[i].host_avatar = user.avatar;
                    }
                    $scope.games = data;

                }).error(function () {
                    $scope.isloading = false;
                    alert("Lỗi khi lấy module " + address);
                });
            }
        }

        $scope.choosegroup = function (gameid, name) {
            if (gameid) {
                if (games_manage_service.haveGame(gameid)) {
                    alert("You already have this game!");
                    return;
                }
                var password = prompt("Please enter group password:", "");                
                $rootScope.$broadcast('creategamemodalcontroller::joingame', gameid, name, password);
                $("#findGamemodal").modal('hide');
            }
        }
    }]);

app.controller('startgamemodal', ['$scope', '$rootScope', '$http', 'user_manage_service',
    function ($scope, $rootScope, $http, user_manage_service) {

        // Các biến dùng cho start game modal
        $scope.id = "";
        $scope.name = "";
        $scope.users = [];

        $rootScope.$on('startgamemodal::showgameinfor', function (event, id, name) {
            if (!id) {
                return;
            }

            $scope.users = [];
            $scope.id = id;
            $scope.name = name;

            // Lấy danh sách người chơi trong game
            var address = "../../game/getuseringame?id=" + id;
            $http.get(address).success(function (data) {

                for (var i = 0; i < data.length; i++) {
                    var user = user_manage_service.getuser(data[i]);
                    $scope.users.push(user);
                }
                $('#startGameModal').modal('show');
            }).error(function () {
                alert("GameID is null");
            });
        });

        $scope.startgame = function () {
            $rootScope.$broadcast('pendinggame::startgame', $scope.id);
            $('#startGameModal').modal('hide');
        }

        $scope.leavegame = function () {
            $rootScope.$broadcast('pendinggame::leavegame', $scope.id);
            $('#startGameModal').modal('hide');
        }

    }]);

app.controller('finishgamemodal', ['$scope', '$rootScope', '$http', 'user_manage_service','games_manage_service',
    function ($scope, $rootScope, $http, user_manage_service, games_manage_service) {

        // Các biến dùng cho start game modal
        $scope.id = "";
        $scope.name = "";
        $scope.users = [];

        $rootScope.$on('finishgamemodal::showfinishgamemodal', function (event, id, name) {
            if (!id) {
                return;
            }

            $scope.users = [];
            $scope.id = id;
            $scope.name = name;

            // Lấy danh sách người chơi trong game
            var address = "../../game/getuseringame?id=" + id;
            $http.get(address).success(function (data) {

                for (var i = 0; i < data.length; i++) {
                    var user = user_manage_service.getuser(data[i]);
                    $scope.users.push(user);
                }
                $('#finishGameModal').modal('show');
            }).error(function () {
                alert("GameID is null");
            });

            $('#finishGameModal').modal('show');
        });

        $scope.wingame = function () {
            $rootScope.$broadcast('pendinggame::finishgame', $scope.id);
            $('#finishGameModal').modal('hide');
            games_manage_service.removegame($scope.id);

            // upload let qua den server
            $http.get("../../service/updateUserScore?result=true");
        }

        $scope.lostgame = function () {
            $rootScope.$broadcast('pendinggame::finishgame', $scope.id);
            $('#finishGameModal').modal('hide');
            games_manage_service.removegame($scope.id);

            // upload let qua den server
            $http.get("../../service/updateUserScore?result=false");
        }

    }]);
