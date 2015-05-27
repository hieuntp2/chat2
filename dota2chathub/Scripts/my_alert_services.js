// my_alert_service.show_my_alert/promot/password service
app.service('my_alert_service', function ($rootScope) {
    var show_my_alert = function (message) {      
        $rootScope.$broadcast('my_alert_controller::addAlert', message);
    }

    var show_my_prompt = function (message) {
        return "";
    }

    var show_my_password = function (message) {
        return "";
    }
    return {
        show_my_alert: show_my_alert,
        show_my_prompt: show_my_prompt,
        show_my_password: show_my_password
    }
})

app.controller('my_alert_controller', ['$scope', '$rootScope', '$timeout', 'user_manage_service', 'games_manage_service', 'my_alert_service',
    function ($scope, $rootScope, $timeout, user_manage_service, games_manage_service, my_alert_service) {

        $scope.alerts = [];
        $scope.infors = [];
        
        // Hằng số
        $scope._TIME_LIFE = 5000; // 3s
        $scope._SPEED_OP = 50;

        $scope.auto_id = 0;

        $scope.addAlert = function (message) {
            var alert = {};
            alert.message = message;
            alert.time_life = $scope._TIME_LIFE;
            alert.opacity = 1;
            alert.id = $scope.auto_id;
            $scope.auto_id += 1;
            $scope.alerts.push(alert);
        }

        $scope.addInfor = function (message) {
            var infor = {};
            infor.message = message;
            infor.time_life = $scope._TIME_LIFE;
            infor.opacity = 1;
            infor.id = $scope.auto_id;
            $scope.auto_id += 1;

            $scope.infors.push(infor);
        }

        $scope.onnoticed = function(id)
        {
            for (var i = 0; i < $scope.alerts.length; i++) {              
                if ($scope.alerts[i].id == id) {
                    $scope.alerts[i].time_life = $scope._TIME_LIFE;
                }
            }

            for (var i = 0; i < $scope.infors.length; i++) {
                if ($scope.infors[i].id == id) {
                    $scope.infors[i].time_life = $scope._TIME_LIFE;
                }
            }
        }

        // Nhận message từ my_alert_service để thêm sự kiện
        $rootScope.$on('my_alert_controller::addAlert', function (event, message) {
            $scope.addAlert(message);
            scrollToBottomDiv("_my_servince_box_content");
        });
        
        // Nhận message từ my_alert_service để thêm sự kiện
        $rootScope.$on('my_alert_controller::addInfor', function (event, message) {
            $scope.addInfor(message);
            scrollToBottomDiv("_my_servince_box_content");
        });

        // Lần lượt trừ thời gian cho các thông báo, kèm theo là giảm độ trong suốt của thông báo
        // Nếu thời gian sống (time_life < 0) thì xóa đối tượng ra khỏi mesage
        $scope.UpdateTimeLifeNotification = function () {
            for (var i = 0; i < $scope.alerts.length; i++) {
                $scope.alerts[i].time_life -= $scope._SPEED_OP;
                $scope.alerts[i].opacity = $scope.alerts[i].time_life / $scope._TIME_LIFE;

                if($scope.alerts[i].time_life <= 0)
                {
                    $scope.alerts.splice(i, 1);
                }
            }

            for (var i = 0; i < $scope.infors.length; i++) {
                $scope.infors[i].time_life -= $scope._SPEED_OP;
                $scope.infors[i].opacity = $scope.infors[i].time_life / $scope._TIME_LIFE;

                if ($scope.infors[i].time_life <= 0) {
                    $scope.infors.splice(i, 1);
                }
            }
        }

        // Sau 1s, gọi hàm này để chạy hàm kiểm tra các tab nhận được message
        $scope.onTimeout = function () {
            mytimeout = $timeout($scope.onTimeout, 100);
            $scope.UpdateTimeLifeNotification();
        }
        var mytimeout = $timeout($scope.onTimeout, 100);

    }]);

