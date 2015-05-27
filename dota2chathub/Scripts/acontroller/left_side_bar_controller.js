app.controller('left_side_bar_controller', ['$scope', '$http', '$compile', 'account_infor_service', 'my_alert_service',
    function ($scope, $http, $compile, account_infor_service,my_alert_service) {

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
                $http.get(address).success(function (data) {

                    if (data.length == 0)
                    {
                        $scope.message = "No result found!";
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
    }]);