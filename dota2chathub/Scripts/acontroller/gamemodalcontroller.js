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
            var address = '../../GroupChat/Index?groupname=' + $scope.name + '&&pass=' + $scope.password + '&&userid=' + account_infor_service.getid() + "&&gameid=" + id;
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
            //var address = "../../game/getuseringame?id=" + id;
            var address = "../../game/getuseringame?id=" + 123;
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

            // disable main page
            $("#indexcontext").attr('disabled', true);

            $('#startGameModal').modal('hide');


            var address = "../../game/startgame?id=" + $scope.id;
            $http.get(address).success(function (data) {                
            }).error(function () {
                alert("GameID is null");
            });

            // detected which user below in team
            //for (var i = 0; i < $scope.users.length; i++) {
            //    var id_user = "#team_player_" + $scope.users[i].id;
            //    if ($("#raidan_team_box").has(id_user).length) {
            //        //alert($scope.users[i].id + " radian");
            //    }
            //    else {
            //        //alert($scope.users[i].id + " dire");
            //    }
            //}
        }

        $scope.leavegame = function () {
            $rootScope.$broadcast('pendinggame::leavegame', $scope.id);
            $('#startGameModal').modal('hide');
        }

    }]);

app.controller('finishgamemodal', ['$scope', '$rootScope', '$http', 'user_manage_service', 'games_manage_service',
    function ($scope, $rootScope, $http, user_manage_service, games_manage_service) {

        // Các biến dùng cho start game modal
        $scope.id = "";
        $scope.name = "";
        $scope.users = [];
        $scope.result = "";
        $rootScope.$on('finishgamemodal::showfinishgamemodal', function (event, id, name) {
            if (!id) {
                return;
            }

            $scope.users = [];
            $scope.id = id;
            $scope.name = name;

            // Lấy danh sách người chơi trong game
            var address = "../../game/finishgame?id=" + id;
            $http.get(address).success(function (data) {
                if (!data) {
                    alert("game is processing result! please comeback a bit!");
                    return;
                }
                else {
                    for (var i = 0; i < data.length; i++) {
                        var user = user_manage_service.getuser(data[i]);
                        user.hero = dota2heros[data.users.id_hero - 1];
                        $scope.users.push(user);
                    }
                    
                    if (data.result == 1)
                    {
                        $scope.result = "Radian win this game";
                    }
                    else{
                        $scope.result = "Dire win this game";
                    }

                    $('#finishGameModal').modal('show');
                }
            }).error(function () {
                alert("GameID is null");
            });
        });

        $scope.confirm = function () {
            $rootScope.$broadcast('pendinggame::finishgame', $scope.id);
            $('#finishGameModal').modal('hide');
            games_manage_service.removegame($scope.id);

            // upload let qua den server
            $http.get("../../service/updateUserScore?result=true");
        }

        $scope.deny = function () {
            $rootScope.$broadcast('pendinggame::finishgame', $scope.id);
            $('#finishGameModal').modal('hide');
            games_manage_service.removegame($scope.id);

            // upload let qua den server
            $http.get("../../service/updateUserScore?result=false");
        }

    }]);


var dota2heros = [
"antimage",
"axe",
"bane",
"bloodseeker",
"crystal_maiden",
"drow_ranger",
"earthshaker",
"juggernaut",
"mirana",
"nevermore",
"morphling",
"phantom_lancer",
"puck",
"pudge",
"razor",
"sand_king",
"storm_spirit",
"sven",
"tiny",
"vengefulspirit",
"windrunner",
"zuus",
"kunkka",
"lina",
"lich",
"lion",
"shadow_shaman",
"slardar",
"tidehunter",
"witch_doctor",
"riki",
"enigma",
"tinker",
"sniper",
"necrolyte",
"warlock",
"beastmaster",
"queenofpain",
"venomancer",
"faceless_void",
"skeleton_king",
"death_prophet",
"phantom_assassin",
"pugna",
"templar_assassin",
"viper",
"luna",
"dragon_knight",
"dazzle",
"rattletrap",
"leshrac",
"furion",
"life_stealer",
"dark_seer",
"clinkz",
"omniknight",
"enchantress",
"huskar",
"night_stalker",
"broodmother",
"bounty_hunter",
"weaver",
"jakiro",
"batrider",
"chen",
"spectre",
"doom_bringer",
"ancient_apparition",
"ursa",
"spirit_breaker",
"gyrocopter",
"alchemist",
"invoker",
"silencer",
"obsidian_destroyer",
"lycan",
"brewmaster",
"shadow_demon",
"lone_druid",
"chaos_knight",
"meepo",
"treant",
"ogre_magi",
"undying",
"rubick",
"disruptor",
"nyx_assassin",
"naga_siren",
"keeper_of_the_light",
"wisp",
"visage",
"slark",
"medusa",
"troll_warlord",
"centaur",
"magnataur",
"shredder",
"bristleback",
"tusk",
"skywrath_mage",
"abaddon",
"elder_titan",
"legion_commander",
"ember_spirit",
"earth_spirit",
"terrorblade",
"phoenix",
"oracle",
"techies",
"winter_wyvern"
]

//var dota2heros = {
//    "1": antimage,
//    "2": axe,
//    "3": bane,
//    "4": bloodseeker,
//    "5": crystal_maiden,
//    "6": drow_ranger,
//    "7": earthshaker,
//    "8": juggernaut,
//    "9": mirana,
//    "11": nevermore,
//    "10": morphling,
//    "12": phantom_lancer,
//    "13": puck,
//    "14": pudge,
//    "15": razor,
//    "16": sand_king,
//    "17": storm_spirit,
//    "18": sven,
//    "19": tiny,
//    "20": vengefulspirit,
//    "21": windrunner,
//    "22": zuus,
//    "23": kunkka,
//    "25": lina,
//    "31": lich,
//    "26": lion,
//    "27": shadow_shaman,
//    "28": slardar,
//    "29": tidehunter,
//    "30": witch_doctor,
//    "32": riki,
//    "33": enigma,
//    "34": tinker,
//    "35": sniper,
//    "36": necrolyte,
//    "37": warlock,
//    "38": beastmaster,
//    "39": queenofpain,
//    "40": venomancer,
//    "41": faceless_void,
//    "42": skeleton_king,
//    "43": death_prophet,
//    "44": phantom_assassin,
//    "45": pugna,
//    "46": templar_assassin,
//    "47": viper,
//    "48": luna,
//    "49": dragon_knight,
//    "50": dazzle,
//    "51": rattletrap,
//    "52": leshrac,
//    "53": furion,
//    "54": life_stealer,
//    "55": dark_seer,
//    "56": clinkz,
//    "57": omniknight,
//    "58": enchantress,
//    "59": huskar,
//    "60": night_stalker,
//    "61": broodmother,
//    "62": bounty_hunter,
//    "63": weaver,
//    "64": jakiro,
//    "65": batrider,
//    "66": chen,
//    "67": spectre,
//    "69": doom_bringer,
//    "68": ancient_apparition,
//    "70": ursa,
//    "71": spirit_breaker,
//    "72": gyrocopter,
//    "73": alchemist,
//    "74": invoker,
//    "75": silencer,
//    "76": obsidian_destroyer,
//    "77": lycan,
//    "78": brewmaster,
//    "79": shadow_demon,
//    "80": lone_druid,
//    "81": chaos_knight,
//    "82": meepo,
//    "83": treant,
//    "84": ogre_magi,
//    "85": undying,
//    "86": rubick,
//    "87": disruptor,
//    "88": nyx_assassin,
//    "89": naga_siren,
//    "90": keeper_of_the_light,
//    "91": wisp,
//    "92": visage,
//    "93": slark,
//    "94": medusa,
//    "95": troll_warlord,
//    "96": centaur,
//    "97": magnataur,
//    "98": shredder,
//    "99": bristleback,
//    "100": tusk,
//    "101": skywrath_mage,
//    "102": abaddon,
//    "103": elder_titan,
//    "104": legion_commander,
//    "106": ember_spirit,
//    "107": earth_spirit,
//    "109": terrorblade,
//    "110": phoenix,
//    "111": oracle,
//    "105": techies,
//    "112": winter_wyvern
//}