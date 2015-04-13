// main.js sẽ thực hiện các chức năng sau:
//      1. Khai báo các directive cùng các controller tương tứng
//      2. Khai báo controller cho phép load động các directive cần thiết.

var app = angular.module("main_app", ['ngRoute']);

app.config(function ($routeProvider) {
    $routeProvider
		.when('/searchtable', { controller: 'CompanyCtrl', templateUrl: 'views/searchtable.html' })
		.when('/publicchat', { controller: 'chatboxcontroller', templateUrl: '../../PublicChat/Index' })
        .when('/', { controller: 'chatboxcontroller', templateUrl: '../../PublicChat/Index' })

});

app.controller('modulecontroller', ['$scope', '$http', '$compile', 'main_service', function ($scope, $http, $compile, main_service) {
    var ctrll = this;
    this.modules = [];

    this.getmodule = function (address, id_div) {
        $http.get(address).success(function (data) {

            var el = $compile(data)($scope);
            $("#" + id_div + "").append(el);

        }).error(function () {
            alert("Lỗi khi lấy module " + address);
        });
    }

    this.init = function () {
        ctrll.getmodule('../../PublicChat/Index', 'main_col_6');
    }
}])

app.service('main_service', function ($http, $compile, $rootScope) {

    this.getmodule = function (url, div_insert) {
        $http.get(url).success(function (data) {

            var el = $compile(data)($scope);
            $("#" + div_insert + "").append(el);
        }).error(function () {
            alert("Lỗi khi lấy module " + address);
        });
    }

    // Reference the auto-generated proxy for the hub.
    var chat = $.connection.ServerHub;

    var proxy = null;

    var initialize = function () {

        //Getting the connection object
        connection = $.hubConnection();

        //Creating proxy
        this.proxy = connection.createHubProxy('ServerHub');

        //Starting connection
        connection.start();

        //Publishing an event when server pushes a greeting message
        this.proxy.on('addNewMessageToPage', function (message) {
            $rootScope.$emit("addNewMessageToPage", message);
        });

    };

    var send = function () {
        //Invoking greetAll method defined in hub
        this.proxy.invoke('Send');
    };

    return {
        initialize: initialize,
        send: send
    };


})

app.directive('priviteBox', function () {
    return {
        restrict: 'E',
        scope: true,
        controller: function ($scope, $http, main_service) {
            $scope.messages = [
            {
                name: 'hieu',
                avatar: '',
                time: 11,
                content: 'message 1'
            },
            {
                name: 'hieu2',
                avatar: '2',
                time: 11,
                content: 'message 2'
            }
            ];

            $scope.addmessage = function (element) {
                //var message = {};
                //message.name = 'hieu';
                //message.avatar = '';
                //message.time =  12;
                //message.content = 'this is new message';
              
                //$scope.messages.push(message);
                
                //$(".chatboxbody").scrollTop($(".chatboxbody").offset().top);
                main_service.send();

                $('.chatboxbody').animate({
                    scrollTop: $('.chatboxbody').get(0).scrollHeight
                }, 500);              
            }

            updateGreetingMessage = function (text) {
                var message = {};
                message.name = 'hieu';
                message.avatar = '';
                message.time = 12;
                message.content = text;

                alert("OK");

                $scope.messages.push(message);
            }

            main_service.initialize();

            //Updating greeting message after receiving a message through the event

            $scope.$parent.$on("addNewMessageToPage", function (e, message) {
                $scope.$apply(function () {
                    updateGreetingMessage(message)
                });
            });
        },
        controllerAs: 'controller'
    }
});

function autoscroll()
{
    $(".chatboxbody").scrollTop(1000);
}





