app.controller('creategamemodalcontroller', ['$scope', '$http', '$compile', '$rootScope', 'account_infor_service',
    function ($scope, $http, $compile, $rootScope, account_infor_service) {

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
                        $scope.addnewGroupChat();

                    }).error(function () {
                        alert("Lỗi khi lấy module " + address);
                    });
                    $("#createGameChatModal").modal('hide');
                }

        }

        $scope.getmodulesettotab = function (address) {
            $http.get(address).success(function (data) {
                var el = $compile(data)($scope);
                $("#main_content_box").append(el);
            }).error(function () {
                alert("Lỗi khi lấy module " + address);
            });
        }

        $scope.addnewGroupChat = function()
        {
            // Sau khi tạo game thành công, thì tạo group chat với tên và password tương ứng
            var address = '../../GroupChat/Index?groupname=' + $scope.name + '&&pass=' + $scope.password + '&&userid=' + account_infor_service.getid() + "&&v=2";
            $scope.getmodulesettotab(address);
            $scope.name = "";
            $scope.password = "";
        }
    }]);

app.controller('findgamecontroller', ['$scope', '$http', 'user_manage_service', 'account_infor_service', 'groups_manage_service',
    function ($scope, $http, user_manage_service, account_infor_service, groups_manage_service) {

        $scope.groups = [];
        $scope.isloading = false;
        $scope.inputsearch = "";
        $scope.message = "";
        $scope.findgroup = function () {
            if ($scope.inputsearch.trim()) {
                $scope.isloading = true;
                $http.get("../../Service/findgroup?name=" + $scope.inputsearch).success(function (data) {
                    $scope.isloading = false;
                    if (data.length == 0) {
                        $scope.groups = [];
                        $scope.message = "No group found!";
                        return;
                    }
                    $scope.message = "";
                    $scope.inputsearch = "";
                    for (var i = 0; i < data.length; i++) {
                        var user = user_manage_service.getuser(data[i].hostid);
                        data[i].host_name = user.name;
                        data[i].host_avatar = user.avatar;
                    }
                    $scope.groups = data;

                }).error(function () {
                    $scope.isloading = false;
                    alert("Lỗi khi lấy module " + address);
                });
            }
        }

        $scope.choosegroup = function (groupid) {
            if (groupid) {
                var password = prompt("Please enter group password:", "");
                groups_manage_service.joingroup(groupid, password);
            }
        }
    }]);