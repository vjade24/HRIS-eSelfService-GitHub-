


ng_selfService_App.controller("LoginCtrlr", function (commonScript,$scope, $http, $filter) {
    var s = $scope
    var h = $http
    var cs = commonScript;
    var browser_name = "";
    var def_gateway = "";

    function init()
    {
        //current_url = window.location.href.split("/")[2]
        
        //if (current_url == "122.54.19.172:89") {
        //    $("#redirectddo_hris").modal("show")
        //}
        //else {
        //    $("#redirectddo_hris").modal("hide")
        //}
      
   
        localStorage.clear();

        localStorage.setItem("first_log_in", 1);
        localStorage.setItem("menu", "");
        localStorage.setItem("photo", "");
        localStorage.setItem("employee_name", "");
        localStorage.setItem("department_name", "");
        localStorage.setItem("expanded", "");
        localStorage.setItem("minus_time_sched", 0);
        localStorage.setItem("minus_travel_order", 0);
        localStorage.setItem("minus_force_leave", 0);
        localStorage.setItem("minus_as", 0);
        localStorage.setItem("minus_leave", 0);
        
        h.post("../Login/isUserLogin").then(function (d) {

            if (d.data.isLogin == 1) {
                document.getElementById("txtb_username").focus = true;
                location.href = "../cMainPage/Index"
            }
        });

        CheckBrowserNetwork();
    }
    init()
    s.btn_Login_Submit = function()
    {
        var current_url = window.location.href.split("/")[2]
        $("#log_in_icn").removeClass("fa fa-sign-in")
        $("#log_in_icn").addClass("fa fa-spinner fa-spin");
        $('#btn_log_in').attr("disabled", true);
        //if (current_url == "122.54.19.172:89") {
        //    $("#redirectddo_hris").modal("show")
        //}
        //else {
        //    
		//	$("#redirectddo_hris").modal("hide")
        //}
		$("#redirectddo_hris").modal("hide")
        //if (browser_name == "Chrome") {
        //    console.log("User Browser is Chrome");
        //    SS_Login();
        //}
        //else {
        //    if (def_gateway == "192.168.6.1") {
        //        console.log("User Browser is NOT Chrome but IP address is within Capitol Network");
        //        SS_Login();
        //    }
        //    else {
        //        console.log("User Browser is NOT Chrome and IP address is NOT within Capitol Network");
        //        $("#lbl_txtb_password_req").text("Unauthorize User!");
        //        //console.log("User Browser is NOT Chrome and IP address is NOT within Capitol Network but location is within Capitol grounds");
        //        //SS_Login();
        //    }
        //}
        SS_Login();
        
    }

    function SS_Login() {
        var can_login = true;
        ValidationResultColor("ALL", false);

        if ((s.txt_username == "" || s.txt_username == null)) {
            ValidationResultColor("txt_username",true);
            can_login = false;
            $("#log_in_icn").removeClass("fa fa-spinner fa-spin")
            $("#log_in_icn").addClass("fa fa-sign-in");
            $('#btn_log_in').attr("disabled", false);
            return;
        }

        if ((s.txt_password == "" || s.txt_password == null)) {
            ValidationResultColor("txt_password", true);
            can_login = false;
            $("#log_in_icn").removeClass("fa fa-spinner fa-spin")
            $("#log_in_icn").addClass("fa fa-sign-in");
            $('#btn_log_in').attr("disabled", false);
            return;
        }

        if (can_login == true)
        {
            h.post("../Login/Login_Validation", { username: s.txt_username, password: s.txt_password }).then(function (d)
            {
                if (d.data.success > 0)
                {
                    if (d.data.log_in_flag != "Y")
                    {
                        $("#lbl_txtb_password_req").text(d.data.log_in_flag_descr);
                        $("#log_in_icn").removeClass("fa fa-spinner fa-spin");
                        $("#log_in_icn").addClass("fa fa-sign-in")
                        $('#btn_log_in').attr("disabled", false);
                        return;
                    }

                    if (d.data.log_in_flag == "Y")
                    {
                        if (d.data.change_pass == "True")
                        {
                            $("i#i_save").addClass("fa-save");
                            $("i#i_save").removeClass("fa-spinner fa-spin");
                            $("#txtb_current_password").val("");
                            $("#txtb_new_password").val("");
                            $("#txtb_confirm_password").val("");

                            $("#owner_name").html("<b>" + d.data.data.suffix_name + " " + d.data.data.employee_name + ",</b>");
                            $("#modal_change_password").modal({ keyboard: false, backdrop: "static" });
                            $("#modal_change_password").on('shown.bs.modal', function () {
                                $("#txtb_current_password").focus();

                            });
                        }
                        else if (Object.keys(d.data.data).length > 0)
                        {
                            if (d.data.cmt.length > 0)
                            {
                                swal("Do you want to Login as Reorganization Placement Committee?", "You redirecting to Reorganization Placement Committee page!", {
                                    icon: "warning",
                                    buttons: {

                                        defeat: {
                                            value: "defeat",
                                            text: "Normal User"
                                        },
                                        submit_appl: {
                                            text: "Reorganization Committee",
                                            value: "log_cmt"
                                        },
                                    },
                                }).then((value) => {
                                    switch (value) {
                                        case "log_cmt":
                                            location.href = "../cPlacementCommittee/Index"
                                            break;
                                        default:
                                            location.href = "../cMainPage/Index"
                                            
                                    }
                                });
                            }
                            else
                            {
                                location.href = "../cMainPage/Index"
                            }
                        }
                        else {
                            alert("Account not found");
                        }
                    }
                    $("#log_in_icn").removeClass("fa fa-spinner fa-spin");
                    $("#log_in_icn").addClass("fa fa-sign-in")
                    $('#btn_log_in').attr("disabled", false);

                }
                else {
                    $("#lbl_txtb_password_req").text("Invalid User.");

                    $("#log_in_icn").removeClass("fa fa-spinner fa-spin");
                    $("#log_in_icn").addClass("fa fa-sign-in")
                    $('#btn_log_in').attr("disabled", false);
                }
            });
        }
    }
    function clearfields(obj) {
        var objl = obj.length
        for (var x = 0; x < objl; x++) {
            $("#" + obj[x]).val("")
            s[obj[x]] = ""
        }

    }
    function CheckBrowserNetwork() {
        h.post("../Login/GetNetworkDetails").then(function (d) {
            if (d.data.message == "success") {
                browser_name = d.data.browserName;
                def_gateway = d.data.def_gateway;

                console.log(d.data.connected);
                console.log(d.data.hostname);
                console.log(d.data.ip);
                console.log(d.data.def_gateway);
                console.log(d.data.browserName);
            }
        });
    }


    s.btn_save_new_password = function ()
    {
        if (validatePasswordChanges())
        {
            $("i#i_save").removeClass("fa-save");
            $("i#i_save").addClass("fa-spinner fa-spin");
            h.post("../Login/change_password", {
                inputed_password: $("#txtb_new_password").val()
                ,user_name: $("#txtb_username").val()
            }).then(function (d)
            {
                if (d.data.success == true) {
                    swal("PASSWORD SUCCESSFULLY CHANGE", "You can now re-login using your new password.", "success");
                    $("#modal_change_password").modal("hide");
                    $("#txtb_username").val("");
                    $("#txtb_username").focus();
                    $("#txtb_password").val("");
                }
                else 
                {
                    alert(d.data.message);
                }
            });
        }
    }

    function validatePasswordChanges()
    {
        var validateX = true;
        var validPassword = false;
        var regex_number = /\d+/g;
        var regex_upper = /[A-Z]/;
        var regex_lower = /[a-z]/;
        var regex_spchar = /[^a-zA-Z0-9\s]/;
        ValidationResultColor("txtb_current_password", false);
        if ($("#txtb_current_password").val().trim() == "") {
            $("#txtb_current_password").focus();
            ValidationResultColor("txtb_current_password", true);
            validateX = false;
        }
        if (($("#txtb_current_password").val().trim() != $("#txtb_password").val().trim()) && $("#txtb_current_password").val().trim() != "") {
            $("#txtb_current_password").focus();
            ValidationResultColor("txtb_current_password", true);
            $("#lbl_txtb_current_password_req").text("Value doesn't match to your current password.");
            validateX = false;
        }

        if ($("#txtb_new_password").val().trim() == "") {
            ValidationResultColor("txtb_new_password", true);
            validateX = false;
        }
        //alert("With Number:" + regex_number.test($("#txtb_new_password").val().trim())
        //    + "\nwith Upper:" + regex_upper.test($("#txtb_new_password").val().trim())
        //    + "\nwith Lower:" + regex_lower.test($("#txtb_new_password").val().trim())
        //    + "\nwith sp:" + regex_spchar.test($("#txtb_new_password").val().trim()));
        if ((regex_number.test($("#txtb_new_password").val().trim()) == false
            || regex_upper.test($("#txtb_new_password").val().trim()) == false
            || regex_lower.test($("#txtb_new_password").val().trim()) == false
            || regex_spchar.test($("#txtb_new_password").val().trim()) == false)
            && ($("#txtb_new_password").val().trim() != "")) {
            ValidationResultColor("txtb_new_password", true);
            $("#lbl_txtb_new_password_req").text("Your New Password didn't meet the password standards. Please click Password rules and Policy to be guided.");
            validateX = false;
        }

        if ($("#txtb_confirm_password").val().trim() == "") {
            ValidationResultColor("txtb_confirm_password", true);
            validateX = false;
        }
        if ($("#txtb_confirm_password").val().trim() != "" && ($("#txtb_confirm_password").val().trim() != $("#txtb_new_password").val().trim())) {
            ValidationResultColor("txtb_confirm_password", true);
            $("#lbl_txtb_confirm_password_req").text("Value doesn't match to your new password.")
            validateX = false;
        }
        if (($("#txtb_new_password").val().trim() != "") &&
            ($("#txtb_current_password").val().trim() != "") &&
            ($("#txtb_new_password").val().trim() == $("#txtb_current_password").val().trim())
        ) {
            ValidationResultColor("txtb_new_password", true);
            $("#lbl_txtb_new_password_req").text("New Password should not be the same to your current password.");
            validateX = false;
        }

        return validateX;
    }

    //***********************************************************//
    //***Field validation everytime generation button is click***//
    //***********************************************************// 
    function ValidationResultColor(par_object_id, par_v_result) {
        if (par_v_result) {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else {
            //remove of refresh the object form being required
            $("#txtb_current_password").removeClass("required");
            $("#lbl_txtb_current_password_req").text("");

            $("#txtb_new_password").removeClass("required");
            $("#lbl_txtb_new_password_req").text("");

            $("#txtb_confirm_password").removeClass("required");
            $("#lbl_txtb_confirm_password_req").text("");

            $("#txtb_password").removeClass("required");
            $("#lbl_txtb_password_req").text("");

            $("#txtb_sss_amount").removeClass("required");
            $("#lbl_txtb_sss_amount_req").text("");
        }
    }


    // Added by Marvin//
    function elVal(id) {
        var value = $("#" + id).val()
        return value;
    }
    s.forgotPassword = function () {
        var userid = elVal("txtb_username")
        if (cs.elEmpty(elVal("txtb_username"))) {
            cs.required2("txtb_username", "Required Field")
            return
        }

        else {
            cs.notrequired2("txtb_username")
            h.post("../Login/getUserNameContact", { user_id: userid }).then(function (d) {
                if (d.data.icon == "success") {
                    var un = d.data.users_name
                    s.username = un.first_name + " " + un.middle_name.substring(0, 1) + ". " + un.last_name;
                    s.encry_mobile = d.data.encry_mobile
                    s.encry_email = d.data.encry_email

                }


            })
            $("#forgotPassword").modal("show")
        }
    }
    function recoveryMethod() {
        var retval = ""
        if (document.getElementById('rex_email').checked) {
            retval = document.getElementById('rex_email').value
        }
        else if (document.getElementById('rex_mobile').checked) {
            retval = document.getElementById('rex_mobile').value
        }
        else {
            retval = ""
        }
        return retval
    }
    
    s.btn_recover_password = function () {
        var userid = elVal("txtb_username")
        var recovery = recoveryMethod()
        var generated_passcode = makeRandomPassword(10)
        if (cs.elEmpty(recovery)) {
            swal("Please select one recovery method", { icon: "warning" })
        }
        else {
            cs.spinnerAdd("btn_recover_pass", "fa-save")
            cs.DisabledElement("rec_cancel_btn")
            h.post("../Login/verify_Passcode_status", { user_id: userid }).then(function (d) {
                if (d.data.icon == "success") {
                    var ps = d.data.passcode_data
                    //if (ps.status == true) {
                    //    clearfields(["reset_passcode", "reset_new_password", "reset_confirm_password"])
                    //    $("#forgotPassword").modal("hide")
                    //    $("#modal_reset_password").modal("show");
                    //    cs.spinnerRemove("btn_recover_pass", "fa-save")
                    //    cs.EnabledElement("rec_cancel_btn")
                    //}
                    //else {
                    //    h.post("../Login/sendPasswordCredential", { user_id: userid, recovery: recovery, passcode: generated_passcode }).then(function (d) {
                    //        if (d.data.icon == "success") {

                    //            swal(d.data.message, { icon: d.data.icon }).then(function () {
                    //                $("#forgotPassword").modal("hide")
                    //                $("#modal_reset_password").modal("show");
                    //            });
                    //            cs.spinnerRemove("btn_recover_pass", "fa-save")
                    //            cs.EnabledElement("rec_cancel_btn")
                    //        }
                    //        else {
                    //            swal(d.data.message, { icon: d.data.icon });
                    //            cs.spinnerRemove("btn_recover_pass", "fa-save")
                    //            cs.EnabledElement("rec_cancel_btn")
                    //        }
                    //    })
                    //}
                   
                        h.post("../Login/sendPasswordCredential", { user_id: userid, recovery: recovery, passcode: generated_passcode }).then(function (d) {
                            if (d.data.icon == "success") {

                                swal(d.data.message, { icon: d.data.icon }).then(function () {
                                    $("#forgotPassword").modal("hide")
                                    $("#modal_reset_password").modal("show");
                                });
                                cs.spinnerRemove("btn_recover_pass", "fa-save")
                                cs.EnabledElement("rec_cancel_btn")
                            }
                            else {
                                swal(d.data.message, { icon: d.data.icon });
                                cs.spinnerRemove("btn_recover_pass", "fa-save")
                                cs.EnabledElement("rec_cancel_btn")
                            }
                        })
                    

                }
                else if (d.data.icon == "warning") {
                    h.post("../Login/sendPasswordCredential", { user_id: userid, recovery: recovery, passcode: generated_passcode }).then(function (d) {
                        if (d.data.icon == "success") {

                            swal(d.data.message, { icon: d.data.icon }).then(function () {
                                $("#forgotPassword").modal("hide")
                                $("#modal_reset_password").modal("show");
                            });
                            cs.spinnerRemove("btn_recover_pass", "fa-save")
                            cs.EnabledElement("rec_cancel_btn")
                        }
                        else {
                            swal(d.data.message, { icon: d.data.icon });
                            cs.spinnerRemove("btn_recover_pass", "fa-save")
                            cs.EnabledElement("rec_cancel_btn")
                        }
                    })
                }
                else {
                    swal(d.data.message, { icon: d.data.icon });
                    cs.spinnerRemove("btn_recover_pass", "fa-save")
                    cs.EnabledElement("rec_cancel_btn")
                }

            })

        }
    }
    s.btn_save_reset_password = function (id) {
        var dt = []
        var newpass = $("#reset_new_password").val();
        var confirmpass = $("#reset_confirm_password").val();

        if (cs.validatesubmit(id)) {
            if (newpass != confirmpass) {
                cs.required2("reset_confirm_password", "Password do not match!")
                return
            }
            else {
                cs.notrequired2("reset_confirm_password")
            }
            h.post("../Login/ResetPassword", {
                user_id: $("#txtb_username").val(),
                passcode: $("#reset_passcode").val(),
                new_password: $("#reset_new_password").val()
            }).then(function (d) {

                dt = d.data.reset

                swal(dt.ret_message, { icon: "info" })
                $("#modal_reset_password").modal("hide");
            })
        }
    }


    //************************************//
    //***      Generate Random Passwor ****//
    //************************************//
    function makeRandomPassword(length) {
        var result = "";
        var characters_l = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var characters_p = "abcdefghijklmnopqrstuvwxyz";
        var numbers = "1234567890";
        var sp_char = ".@*$";
        var l = ((length - 2) / 2);
        var p = ((length - 2) / 2);
        for (var i = 0; i < l; i++) {
            result += characters_l.charAt(Math.floor(Math.random() * characters_l.length));
        }
        for (var i = 0; i < p; i++) {
            result += characters_p.charAt(Math.floor(Math.random() * characters_p.length));
        }
        result += numbers.charAt(Math.floor(Math.random() * numbers.length));
        result += sp_char.charAt(Math.floor(Math.random() * sp_char.length));
        return result;
    }
    //****************************//




   
})