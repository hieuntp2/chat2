app.controller('left_side_bar_controller', ['$scope', '$http', '$rootScope','$compile', 'my_alert_service', 'groups_manage_service', 'games_manage_service','mini_games_manage_service',
    function ($scope, $http, $rootScope, $compile, my_alert_service, groups_manage_service, games_manage_service, mini_games_manage_service) {

        $scope.searchinput = "";
        $scope.results = [];
        $scope.message = "";
        $scope.minigame = [];

       

        $scope.showmodalcreateGame = function () {
            $('#createGameChatModal').modal('show');
        }

        $scope.showmodalcreateGroup = function () {
            $('#createGroupChatModal').modal('show');
        }

        $scope.search = function () {
            if ($scope.searchinput) {
                var address = "../../search?key=" + $scope.searchinput;
                $scope.results = [];
                $http.get(address).success(function (data) {

                    if (data.length == 0) {
                        var item = {};
                        item.type = 0;
                        item.name = "No result found!";

                        $scope.results.push(item);
                    }
                    else {
                        $scope.results = data;
                    }
                }).error(function () {
                    my_alert_service.show_my_alert("Something wrong when trying search!...");
                    return "error";
                });
            }
            else {
                my_alert_service.show_my_info("Please Input values to search!");
            }
        }

        $scope.clickresult = function (item) {
            // case user: open chat
            if (item.type == 1) {
                $scope.joinprivate(item);
                return;
            }

            // case group: ask password and open chat
            if (item.type == 2) {
                $scope.joingroup(item);
                return;
            }

            // case game: ask password and open game
            if (item.type == 3) {
                $scope.joingame(item);
                return;
            }
        }

        $scope.joingroup = function (item) {
            if (item.id) {
                var password = prompt("Please enter group password:", "");
                groups_manage_service.joingroup(item.id, password);
            }
        }

        $scope.joingame = function (item) {
            if (item.id) {
                if (games_manage_service.haveGame(item.id)) {
                    my_alert_service.show_my_alert("You already have this game!");
                    return;
                }
                var password = prompt("Please enter group password:", "");
                $rootScope.$broadcast('creategamemodalcontroller::joingame', item.id, item.name, password);
            }
        }

        $scope.joinprivate = function (item) {
            privatechat_manage_service.addprivatechat(item.id);
        }

        $scope.showReportBug = function () {
            $("#_report_bug_modal").modal('show');
        }

        $scope.showconvertsteam32tosteam64 = function () {
            $("#convertsteam32_to_steam64modal").modal('show');
        }

        $scope.loadgame = function(hrefgame)
        {
            if (mini_games_manage_service.haveGame(hrefgame))
            {
                my_alert_service.show_my_info("You already have this game!");
                return;
            }
            else {
                var address = "../../minigame?gameaddress=" + hrefgame;
                $http.get(address).success(function (data) {
                    var el = $compile(data)($scope);
                    $("#main_col_6").append(el);
                }).error(function () {
                    my_alert_service.show_my_alert("Lỗi khi lấy module " + address);
                });
            }           
        }

        $scope.initgame = function ()
        {
            $scope.addgame("Learn to Fly 2","http://external.kongregate-games.com/gamez/0011/5608/live/embeddable_115608.swf");

            $scope.addgame("The King's League: Odyssey", "http://external.kongregate-games.com/gamez/0017/1311/live/embeddable_171311.swf");
            $scope.addgame("Epic Battle Fantasy 3", "http://external.kongregate-games.com/gamez/0009/0613/live/embeddable_90613.swf");
            $scope.addgame("Epic War 3 ", "http://external.kongregate-games.com/gamez/0004/8201/live/embeddable_48201.swf");
            $scope.addgame("Platform Racing 2", "http://external.kongregate-games.com/gamez/0001/0110/live/embeddable_10110.swf");
            $scope.addgame("CycloManiacs 2", "http://external.kongregate-games.com/gamez/0012/1218/live/embeddable_121218.swf");
            $scope.addgame("Continuity", "http://external.kongregate-games.com/gamez/0007/3515/live/embeddable_73515.swf");
            $scope.addgame("Elona Shooter", "http://external.kongregate-games.com/gamez/0006/1112/live/embeddable_61112.swf");
            $scope.addgame("Protector III ", "http://external.kongregate-games.com/gamez/0004/4833/live/embeddable_44833.swf");
 
        }

        $scope.addgame = function(name, href)
        {
            var game = {};
            game.name = name;
            game.hreft = href;
            $scope.minigame.push(game);
        }
    }]);

app.controller('tool_convert_steam32_to_steam_64_controller', ['$scope', '$http',
    function ($scope, $http) {

        $scope.steam32 = "";
        $scope.steam64 = "";
        $scope.message = "";

        $scope.convert = function () {
            $scope.message = "";
            if ($scope.steam32) {
                var address = "../../service/convertAccountIDtoSteamID?account_id=" + $scope.steam32;
                $http.get(address).success(function (data) {
                    $scope.steam64 = data;
                    $scope.steam32 = "";
                }).error(function () {
                    $scope.message = "Input is invalidated.";
                    $scope.steam64 = "";
                });
            }
            else {
                $scope.message = "Please input value.";
                $scope.steam64 = "";
            }
        }
    }]);