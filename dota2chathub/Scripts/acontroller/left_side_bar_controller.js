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
            var game = {};
            game.name = "Run 3";
            game.hreft = "http://external.kongregate-games.com/gamez/0019/2194/live/embeddable_192194.swf";
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