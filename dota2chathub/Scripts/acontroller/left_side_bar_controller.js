app.controller('left_side_bar_controller', ['$scope', '$http', '$compile','$rootScope','account_infor_service', 'my_alert_service','groups_manage_service','games_manage_service',
    function ($scope, $http, $compile,$rootScope, account_infor_service, my_alert_service, groups_manage_service, games_manage_service) {

        $scope.searchinput = "";
        $scope.results = [];
        $scope.message = "";

        $scope.showmodalcreateGame = function () {
            $('#createGameChatModal').modal('show');
        }

        $scope.showmodalcreateGroup = function () {
            $('#createGroupChatModal').modal('show');
        }

        $scope.search = function()
        {
            if ($scope.searchinput)
            {
                var address = "../../search?key=" + $scope.searchinput;
                $scope.results = [];
                $http.get(address).success(function (data) {

                    if (data.length == 0)
                    {
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
        }

        $scope.clickresult = function(item)
        {
            // case user: open chat
            if(item.type == 1)
            {
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
    }]);