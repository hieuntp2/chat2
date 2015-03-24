(function () {
    var app = angular.module('baivietapp', []);

    app.controller('BaivietController', ['$http', function ($http) {
        this.object = {};
        this.tags = [];
        var ctrll = this;

        this.baiviets = [];

        this.getBaiviets = function (index) {
            $http.get("/baiviets/getNewPost?index=" + index).success(function (data) {

                ctrll.baiviets = data;

            }).error(function () {
                alert("Lỗi khi lấy dữ liệu bai viet");
            });
        }

        this.init = function()
        {
            ctrll.getBaiviets(0);
        }

        this.loadListTagsMBTI = function (idbaiviet) {
            $http.get("/TabEngineServer/getTagListMBTI?idmbti=" + idbaiviet).success(function (data) {

                ctrll.tags = data;

            }).error(function () {
                alert("Lỗi khi lấy dữ liệu tags");
            });
        }

        this.addTagObject = function () {
            if (MaTab == null || MaTab == "") {
                return;
            }
            this.object.Ten = TenTab;
            this.object.ID = MaTab;
            this.object.Loai = LoaiTab;

            this.tags.push(this.object);
            this.object = {};

            $("#_inputsTabs").val(this.Code(this.tags));

            MaTab = "";

        }

        this.InputTagEnter = function (e) {
            this.addTagObject();
            return false;

        }

        this.Code = function (list) {
            var result = "";
            for (var i = 0; i < list.length; i++) {
                var object = list[i];
                result += object.Loai + object.ID + ",";
            }
            result = result.substring(0, result.length - 1);
            return result;
        }

        this.RemoveTag = function (idtag) {
            findAndRemove(this.tags, 'ID', idtag);
            $("#_inputsTabs").val(this.Code(this.tags));
        }

        this._ViewTagClickChange = function (loai, id) {
            alert(loai, id);
        }
    }])
})();