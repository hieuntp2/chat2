app.controller('creategroupmodalcontroller', ['$scope', '$http', '$compile', '$rootScope', 'account_infor_service',
    function ($scope, $http, $compile, $rootScope, account_infor_service) {

        $scope.name = "";
        $scope.password = "";
        $scope.nameerror = "";

        $scope.createGroup = function () {
            $scope.nameerror = "";

            if (!$scope.name) {
                $scope.nameerror = "Group name should not be empty";
            }
            else
                if ($scope.name > 254) {
                    $scope.nameerror = "Group name length should be below 254 characters";
                }
                else {
                    var address = '../../GroupChat/Index?groupname=' + $scope.name + '&&pass=' + $scope.password + '&&userid=' + account_infor_service.getid();

                    $scope.getmodulesettotab(address);

                    $("#createGroupChatModal").modal('hide');
                    $scope.name = "";
                    $scope.password = "";
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
    }]);

app.controller('findGroupcontroller', ['$scope', '$http', '$rootScope', 'user_manage_service', 'account_infor_service', 'groups_manage_service',
    function ($scope, $http, $rootScope, user_manage_service, account_infor_service, groups_manage_service) {

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

                $("#findGroupmodal").modal('hide');
            }
        }

        $rootScope.$on('findGroupcontroller::joinGroup', function (event, data) {
            groups_manage_service.joingroup(data.groupchatid, data.password);
        });
    }]);