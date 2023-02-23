ng_selfService_App.controller("cChangePassword_ctrlr", function ($scope, Upload, $timeout, $compile, $http, $filter) {
    var s = $scope
    var h = $http

    var userid                  = "";
    s.rowLen                    = "5";
    s.tempName                  = "";
    s.temprTypeCd               = "";
    s.existed                   = "";
    s.year                      = [];
    s.prevValues                = [];
    s.encrypted_current_pass    = "";
    s.decrypted_current_pass    = "";
    s.img_p
    s.img_initial
    s.img_full
    s.user_info = [];
    s.upload_img        = "";
    s.par_allow_to_save_image = true;
    
    function init() {
        s.aShow                     = false;
        s.spnrCPShow                = false;
        s.dis_txtb_confirm_new_pass = true;
        s.dis_txtb_new_pass         = true;
        s.bShow                     = false;
        s.spnrNPShow                = false;
        s.cShow                     = false;
        s.spnrCNPShow               = false;
        s.dis_btn_save              = true;
        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../cChangePassword/InitializeData").then(function (d) {
            s.img_p                 = d.data.imgDataURL;
            s.img_initial           = d.data.imgDataURL_initial
            s.img_full              = d.data.imgDataURL_full
            encrypted_current_pass  = d.data.pass.user_password;
            s.txtb_user_id          = d.data.empl_id;
            s.txtb_empl_name        = d.data.user_info.first_name;
            s.txtb_last_name        = d.data.user_info.last_name;
            s.txtb_middle_name      = d.data.user_info.middle_name;
            s.txtb_suffix_name = d.data.user_info.suffix_name;
            s.txtb_province = d.data.empl_address.province_name
            s.txtb_municipality = d.data.empl_address.municipality_name
            s.txtb_barangay = d.data.empl_address.barangay_name
            s.txtb_hse_no = d.data.empl_address.houselot_nbr
            s.txtb_street_no = d.data.empl_address.street
            s.txtb_prk_no = d.data.empl_address.purok
            s.txtb_zip_code = d.data.empl_address.zip_code
                
            h.post("../cChangePassword/DecryptPass", {
                p_current_pass: d.data.pass.user_password
            }).then(function (d) {
                if (d.data.message == "success") {
                    
                    s.decrypted_current_pass = d.data.decrypted_current_pass;
                }
            });
        });

       
    }
    init()

    s.validateCurrentPass = function () {
        if (s.decrypted_current_pass == s.txtb_current_pass) {
            $("#txtb_current_pass").removeClass("required");
            $("#lbl_txtb_current_pass_req").text("Ok");
            s.aShow                     = true;
            //s.spnrCPShow                = false;
            s.dis_txtb_new_pass         = false;
            s.dis_txtb_confirm_new_pass = false;
            $('#txtb_new_pass').attr('disabled', false);
            $('#txtb_new_pass').attr('readonly', false);
            $('#txtb_confirm_new_pass').attr('disabled', false);
            $('#txtb_confirm_new_pass').attr('readonly', false);
        }
        else if (s.txtb_current_pass.trim() == "")
        {
            $("#txtb_current_pass").removeClass("required");
            s.aShow = false;
            //s.spnrCPShow = false;
        }
        else {
            clearentry();
            $("#txtb_current_pass").addClass("required");
            $("#lbl_txtb_current_pass_req").text("Not ok");
            s.aShow                     = false;
            //s.spnrCPShow                = true;
            s.dis_txtb_new_pass         = true;
            s.dis_txtb_confirm_new_pass = true;
        }
    }

    s.validateNewPass = function () {
        var regex_number = /\d+/g;
        var regex_upper = /[A-Z]/;
        var regex_lower = /[a-z]/;
        var regex_spchar = /[^a-zA-Z0-9\s]/;

        if ((regex_number.test($("#txtb_new_pass").val().trim()) == false
            || regex_upper.test($("#txtb_new_pass").val().trim()) == false
            || regex_lower.test($("#txtb_new_pass").val().trim()) == false
            || regex_spchar.test($("#txtb_new_pass").val().trim()) == false)) {
            $("#lbl_txtb_new_pass_req").text("New Password require's combination of uppercase, lowercase, and number including atleast 1 special character.");
            s.bShow = false;
            //s.spnrNPShow = true;
            s.txtb_confirm_new_pass = "";
            s.cShow = false;
            s.dis_btn_save = true;

        }
        else {
            $("#lbl_txtb_new_pass_req").text("");
            s.bShow = true;
            s.spnrNPShow = false;
        }

        if (s.decrypted_current_pass == s.txtb_new_pass) {
            $("#lbl_txtb_new_pass_req").text("New Password should not be the same to your current password.");
            s.bShow = false;
            //s.spnrNPShow = true;
            s.txtb_confirm_new_pass = "";
        }
    }

    s.validateConfirmNP = function () {
        if (s.txtb_new_pass == s.txtb_confirm_new_pass && s.txtb_confirm_new_pass != "") {
            s.cShow         = true;
            //s.spnrCNPShow   = false;
            s.dis_btn_save  = false;
        }
        else {
            s.cShow         = false;
            //s.spnrCNPShow   = true;
            s.dis_btn_save  = true;
        }
    }


    s.btn_change_profile = function (value)
    {
        if (value == 0)
        {
            $("#modal_change_password").modal({ keyboard: false, backdrop: "static" });
            $('#error_img_msg').html("");
            $('#preview_img').attr('src', s.img_p);
            $('#input_file_upload').val("");
        }

        else if (value == 1)
        {
            $("#modal_change_initial").modal({ keyboard: false, backdrop: "static" });
            $('#error_img_msg_initial').html("");
            $('#preview_img_initial').attr('src', s.img_initial);
            $('#input_file_upload_initial').val("");
        }

        else if (value == 2)
        {
            $("#modal_change_full").modal({ keyboard: false, backdrop: "static" });
            $('#error_img_msg_full').html("");
            $('#preview_img_full').attr('src', s.img_full);
            $('#input_file_upload_full').val("");
        }
        
    }

    s.SetImageArray = function (par_array, par_allow_to_save_image_x)
    {
        s.upload_img = par_array;
        s.par_allow_to_save_image = par_allow_to_save_image_x;
    }

    s.btn_upload_click = function (value)
    {
        if (value == 0) {
            var fileUpload = $('#input_file_upload').get(0);
            var files = fileUpload.files;
            var test = new FormData();
            s.SelectedFiles = files;
            for (var i = 0; i < files.length; i++) {
                test.append('par_file', files[i]);
            }

            if (s.par_allow_to_save_image) {
                $('#i_save').removeClass("fa-save");
                $('#i_save').addClass("fa-spinner spin");

                //TRY
                $http({
                    method: 'POST',
                    url: '../cChangePassword/upload_image_profile',
                    headers: { 'Content-Type': 'multipart/form-data' },
                    data: test
                }).then(function (d) {
                    //alert(d.data.error_message);
                    //console.log(d);
                    //alert(d);
                    $('#i_save').addClass("fa-save");
                    $('#i_save').removeClass("fa-spinner spin");
                    if (d.data.success) {
                        $("#upload_body").html("<div class='row'> <div class='col-sm-12' style='padding:20px;'><center><h1>" + d.data.error_message + "</h1><button class='btn btn-primary' onclick=' location.href = \"../cChangePassword/\";'>RELOAD PAGE</button></center></div></div>");
                    }
                    else {
                        $('#error_img_msg').html(d.data.error_message);
                    }
                });
            }
        }

        else if (value == 1)
        {
            var fileUpload = $('#input_file_upload_initial').get(0);
            var files = fileUpload.files;
            var test = new FormData();
            s.SelectedFiles = files;
            for (var i = 0; i < files.length; i++) {
                test.append('par_file', files[i]);
            }

            if (s.par_allow_to_save_image) {
                $('#i_save1').removeClass("fa-save");
                $('#i_save1').addClass("fa-spinner spin");

                //TRY
                $http({
                    method: 'POST',
                    url: '../cChangePassword/upload_image_profile',
                    headers: { 'Content-Type': 'multipart/form-data' },
                    data: test
                }).then(function (d) {
                    //alert(d.data.error_message);
                    //console.log(d);
                    //alert(d);
                    $('#i_save1').addClass("fa-save");
                    $('#i_save1').removeClass("fa-spinner spin");
                    if (d.data.success)
                    {
                        $("#upload_body_initial").html("<div class='row'> <div class='col-sm-12' style='padding:20px;'><center><h1>" + d.data.error_message + "</h1><button class='btn btn-primary' onclick=' location.href = \"../cChangePassword/\";'>RELOAD PAGE</button></center></div></div>");
                    }
                    else
                    {
                        $('#error_img_msg_initial').html(d.data.error_message);
                    }
                });
            }
        }

        else if (value == 2) {
            var fileUpload = $('#input_file_upload_full').get(0);
            var files = fileUpload.files;
            var test = new FormData();
            s.SelectedFiles = files;
            for (var i = 0; i < files.length; i++) {
                test.append('par_file', files[i]);
            }

            if (s.par_allow_to_save_image) {
                $('#i_save2').removeClass("fa-save");
                $('#i_save2').addClass("fa-spinner spin");

                //TRY
                $http({
                    method: 'POST',
                    url: '../cChangePassword/upload_image_profile',
                    headers: { 'Content-Type': 'multipart/form-data' },
                    data: test
                }).then(function (d) {
                    //alert(d.data.error_message);
                    //console.log(d);
                    //alert(d);
                    $('#i_save2').addClass("fa-save");
                    $('#i_save2').removeClass("fa-spinner spin");
                    if (d.data.success) {
                        $("#upload_body_full").html("<div class='row'> <div class='col-sm-12' style='padding:20px;'><center><h1>" + d.data.error_message + "</h1><button class='btn btn-primary' onclick=' location.href = \"../cChangePassword/\";'>RELOAD PAGE</button></center></div></div>");
                    }
                    else {
                        $('#error_img_msg_full').html(d.data.error_message);
                    }
                });
            }
        }
        
       
    }

    s.UploadFiles = function (value) {
        if (navigator.sayswho == "IE") {
            s.btn_upload_click(value);
        }
        else {
            s.FireFoxUploader(value);
        }
    }

    s.FireFoxUploader = function (value) {

        if (value == 0) {
            var fileUpload = $('#input_file_upload').get(0);
            var files = fileUpload.files;
            s.SelectedFiles = files;
            if (s.par_allow_to_save_image) {
                $('#i_save').removeClass("fa-save");
                $('#i_save').addClass("fa-spinner spin");

                if ($scope.SelectedFiles && $scope.SelectedFiles.length) {
                    Upload.upload({
                        url: '/cChangePassword/Upload/',
                        data: {
                            files: $scope.SelectedFiles
                            , par_value: value
                        }
                    }).then(function (response) {
                        $('#i_save').addClass("fa-save");
                        $('#i_save').removeClass("fa-spinner spin");
                        $timeout(function () {
                            if (response.data.split('|')[0] == "Success") {
                                $("#upload_body").html("<div class='row'> <div class='col-sm-12' style='padding:20px;'><center><h1>SUCCESSFULLY UPLOADED!</h1><button class='btn btn-primary' onclick=' location.href = \"../cChangePassword/\";'>RELOAD PAGE</button></center></div></div>");
                            }
                        });
                    }, function (response) {
                        if (response.status > 0) {
                            var errorMsg = response.status + ': ' + response.data;
                            alert(errorMsg);
                        }
                    }, function (evt) {
                        var element = angular.element(document.querySelector('#dvProgress'));
                        $scope.Progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                        element.html('<div style="width: ' + $scope.Progress + '%; height:100%;" >' + $scope.Progress + '%</div>');
                    });
                }

            }
        }

        else if (value == 1)
        {
            var fileUpload = $('#input_file_upload_initial').get(0);
            var files = fileUpload.files;
            s.SelectedFiles = files;
            if (s.par_allow_to_save_image) {
                $('#i_save1').removeClass("fa-save");
                $('#i_save1').addClass("fa-spinner spin");

                if ($scope.SelectedFiles && $scope.SelectedFiles.length) {
                    Upload.upload({
                        url: '/cChangePassword/Upload/',
                        data: {
                            files: $scope.SelectedFiles
                            ,par_value: value
                        }
                    }).then(function (response) {
                        $('#i_save1').addClass("fa-save");
                        $('#i_save1').removeClass("fa-spinner spin");
                        $timeout(function () {
                            if (response.data.split('|')[0] == "Success") {
                                $("#upload_body_initial").html("<div class='row'> <div class='col-sm-12' style='padding:20px;'><center><h1>SUCCESSFULLY UPLOADED!</h1><button class='btn btn-primary' onclick=' location.href = \"../cChangePassword/\";'>RELOAD PAGE</button></center></div></div>");
                            }
                        });
                    }, function (response) {
                        if (response.status > 0) {
                            var errorMsg = response.status + ': ' + response.data;
                            alert(errorMsg);
                        }
                    }, function (evt) {
                        var element = angular.element(document.querySelector('#dvProgress_initial'));
                        $scope.Progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                        element.html('<div style="width: ' + $scope.Progress + '%; height:100%;" >' + $scope.Progress + '%</div>');
                    });
                }

            }
        }

        else if (value == 2) {
            var fileUpload = $('#input_file_upload_full').get(0);
            var files = fileUpload.files;
            s.SelectedFiles = files;
            if (s.par_allow_to_save_image) {
                $('#i_save2').removeClass("fa-save");
                $('#i_save2').addClass("fa-spinner spin");

                if ($scope.SelectedFiles && $scope.SelectedFiles.length) {
                    Upload.upload({
                        url: '/cChangePassword/Upload/',
                        data: {
                            files: $scope.SelectedFiles
                            , par_value: value
                        }
                    }).then(function (response) {
                        $('#i_save2').addClass("fa-save");
                        $('#i_save2').removeClass("fa-spinner spin");
                        $timeout(function () {
                            if (response.data.split('|')[0] == "Success") {
                                $("#upload_body_full").html("<div class='row'> <div class='col-sm-12' style='padding:20px;'><center><h1>SUCCESSFULLY UPLOADED!</h1><button class='btn btn-primary' onclick=' location.href = \"../cChangePassword/\";'>RELOAD PAGE</button></center></div></div>");
                            }
                        });
                    }, function (response) {
                        if (response.status > 0) {
                            var errorMsg = response.status + ': ' + response.data;
                            alert(errorMsg);
                        }
                    }, function (evt) {
                        var element = angular.element(document.querySelector('#dvProgress_full'));
                        $scope.Progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                        element.html('<div style="width: ' + $scope.Progress + '%; height:100%;" >' + $scope.Progress + '%</div>');
                    });
                }

            }
        }
        
    }

    s.ScanSignature = function (value)
    {

        if (value == 1) {
            var fileUpload  = $('#input_file_upload_initial').get(0);
            var files       = fileUpload.files;
            s.SelectedFiles = files;
            if (s.par_allow_to_save_image) {

                if ($scope.SelectedFiles && $scope.SelectedFiles.length) {
                    Upload.upload({
                        url: '/cChangePassword/ScanSignature/',
                        data: {
                            files: $scope.SelectedFiles
                            , par_value: value
                        }
                    }).then(function (response)
                    {
                        $timeout(function () {
                            if (response.data.split('|')[0] == "Success")
                            {
                                s.img_p_scaned = response.data.split('|')[response.data.split('|').length - 1];
                            }
                        });
                    }, function (response) {
                        if (response.status > 0)
                        {
                            var errorMsg = response.status + ': ' + response.data;
                            alert(errorMsg);
                        }
                    }, function (evt) {
                        var element = angular.element(document.querySelector('#dvProgress_initial'));
                        $scope.Progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                        element.html('<div style="width: ' + $scope.Progress + '%; height:100%;" >' + $scope.Progress + '%</div>');
                    });
                }

            }
        }

        else if (value == 2) {
            var fileUpload  = $('#input_file_upload_full').get(0);
            var files       = fileUpload.files;
            s.SelectedFiles = files;
            if (s.par_allow_to_save_image) {

                if ($scope.SelectedFiles && $scope.SelectedFiles.length) {
                    Upload.upload({
                        url: '/cChangePassword/ScanSignature/',
                        data: {
                            files: $scope.SelectedFiles
                            , par_value: value
                        }
                    }).then(function (response) {
                        $timeout(function () {
                            if (response.data.split('|')[0] == "Success")
                            {
                                s.img_p_scaned = response.data.split('|')[response.data.split('|').length - 1];
                            }
                        });
                    }, function (response) {
                        if (response.status > 0) {
                            var errorMsg = response.status + ': ' + response.data;
                            alert(errorMsg);
                        }
                    }, function (evt) {
                        var element = angular.element(document.querySelector('#dvProgress_full'));
                        $scope.Progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                        element.html('<div style="width: ' + $scope.Progress + '%; height:100%;" >' + $scope.Progress + '%</div>');
                    });
                }

            }
        }

    }

    navigator.sayswho = (function () {
        var ua = navigator.userAgent, tem,
            M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            //return 'IE ' + (tem[1] || '');
            return 'IE';
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\b(OPR|Edge?)\/(\d+)/);
            if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera').replace('Edg ', 'Edge ');
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
        return M.join(' ');
    })();

    s.btn_save_click = function () {
        console.log(s.txtb_confirm_new_pass);
        console.log(s.txtb_user_id);

        h.post("../cChangePassword/ChangePassword", {
            inputed_password    : s.txtb_confirm_new_pass
            , user_name         : s.txtb_user_id
        }).then(function (d) {
            if (d.data.success == true) {
                s.decrypted_current_pass = s.txtb_confirm_new_pass;
                //swal("PASSWORD SUCCESSFULLY CHANGE", "");
                swal("Your password has been successfully changed!", { icon: "success", });
                clearentry2();
            }
            else {
                alert(d.data.message);
            }
        });
    }
    s.reset_prev = function ()
    {
        $('#preview_img').attr('src', s.img_p);
    }
    
    function clearentry() {
        s.txtb_new_pass         = "";
        s.txtb_confirm_new_pass = "";
        s.bShow                 = false;
        s.spnrNPShow            = false;
        s.cShow                 = false;
        s.spnrCNPShow           = false;
        s.dis_btn_save          = true;
    }

    function clearentry2() {
        s.txtb_current_pass     = "";
        s.txtb_new_pass         = "";
        s.txtb_confirm_new_pass = "";
        $('#txtb_new_pass').attr('disabled',true);
        $('#txtb_new_pass').attr('readonly',true);
        $('#txtb_confirm_new_pass').attr('disabled', true);
        $('#txtb_confirm_new_pass').attr('readonly', true);
        s.aShow                 = false;
        s.spnrCPShow            = false;
        s.bShow                 = false;
        s.spnrNPShow            = false;
        s.cShow                 = false;
        s.spnrCNPShow           = false;
        s.dis_btn_save          = true;
    }

})

