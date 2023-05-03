/*
 * Script created By:       Jorge Rustom Villanueva
 * Script created On:       09/15/2020
 * Purpose of this Script:  
 *                          
*/
ng_selfService_App.controller("rSSDTRPrinting_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope;
    var h = $http;
    s.year = [];
    s.ddl_month = [];
    s.employment_type = ""
    s.contact_personnel = ""
    s.flag_message = ""
    s.check_generate = false
    function init() {
        $("#ddl_name").select2().on('change', function (e) {
            s.ddl_name_change();
        });

        $("#ddl_dept").select2().on('change', function (e) {
            s.ddl_dept_chane();
        });
        h.post("../rSSDTRPrinting/InitializeData").then(function (d) {

            //d.data.session_user_id
            //d.data.session_user_profile
            s.txtb_empl_id   = d.data.session_empl_id
            s.txtb_empl_name = d.data.session_employee_name
            s.dept_list      = d.data.dept_list;
            s.ddl_dept       = d.data.session_department_code
            //d.data.session_first_name
            //d.data.session_last_name
            //d.data.session_middle_name
            //d.data.session_suffix_name
            //d.data.session_photo
            //d.data.session_owner_fullname
            //d.data.session_budget_code
            //d.data.session_department_code
            //d.data.session_employment_type
            s.employment_type = d.data.session_employment_type
            RetrieveYear();
            s.ddl_payroll_year  = d.data.year_dtr
            s.ddl_month         = d.data.month_dtr
            s.ddl_viewtype  = d.data.view_type

            s.empl_names    = d.data.empl_name;
            s.ddl_name      = d.data.session_empl_id;
            s.txtb_empl_id2 = d.data.session_empl_id;
            //s.is_dtr_AO     = d.data.is_dtr_AO;
			
			
			//console.log(s.ddl_dept)
			//s.check_generate = true
			//s.check_generate = true
			//$("#dtr_generation_empl").removeClass("ng-hide");
			//s.check_generate = true
			//$("#dtr_generation_empl").removeClass("ng-hide");
			//if (s.ddl_dept == "22" || s.ddl_dept == "12" ||  s.ddl_dept == "05" ||  s.ddl_dept == "21" ||  s.ddl_dept == "23" ||  s.ddl_dept == "18" ||  s.ddl_dept == "19" ||  s.ddl_dept == "20" ||  s.ddl_dept == "15" ||  s.ddl_dept == "08" ||  s.ddl_dept == "10" ||  s.ddl_dept == "03" ||  s.ddl_dept == "13" ||  s.ddl_dept == "01" ||  s.ddl_dept == "17" ||  s.ddl_dept == "24" ||  s.ddl_dept == "02")
			////(s.ddl_dept == "18" || s.ddl_dept == "19" || s.ddl_dept == "26" || s.ddl_dept == "21" || s.ddl_dept == "17"|| s.ddl_dept == "09" || s.ddl_dept == "05" || s.ddl_dept == "12" || s.ddl_dept == "22" || s.ddl_dept == "23" || s.ddl_dept == "24" || s.ddl_dept == "02" || s.ddl_dept == "16" || s.ddl_dept == "14" || s.ddl_dept == "25" || s.ddl_dept == "20" || s.ddl_dept == "01" || s.ddl_dept == "03" || s.ddl_dept == "13" | s.ddl_dept == "15")
			//{
			//	s.check_generate = true
			//	$("#dtr_generation_empl").removeClass("ng-hide");
			//}
			//
			//else
			//{
			//	
			//	s.check_generate = false
			//	$("#dtr_generation_empl").addClass("ng-hide");
			//	
			//}
			
			//s.check_generate = false
			//$("#dtr_generation_empl").removeClass("ng-hide");
			
            if (d.data.is_dtr_AO == "false") {
                
                $("#ddl_dept").select2().prop("disabled", false);
                $("#ddl_name").select2().prop("disabled", false);
            }
            else {
               
                $("#ddl_dept").select2().prop("disabled", true);
                $("#ddl_name").select2().prop("disabled", true);
            }


           s.CheckGenerateDTR()
        });
    }
    init()
    //************************************//
    //***Select-Employment-Type-DropDown****//
    //************************************// 
    function RetrieveYear() {

        var currentYear = new Date().getFullYear();

        var prev_year = currentYear - 5;
        for (var i = 1; i <= 8; i++) {
            var data = { "year": prev_year }
            s.year.push(data)
            prev_year++;
        }

    }

    //***********************************************************//
    //***Field validation for travel order before opening add modal
    //***********************************************************// 
    function ValidationResultColorHeader(par_object_id, par_v_result) {
        if (par_v_result) {

            //Add class to the obect that need to focus as a required..
            if (par_object_id == "ddl_payroll_year") {
                $("#ddl_payroll_year").addClass("required");
                $("#lbl_year_req").text("Required Field!");

            }

            else if (par_object_id == "ddl_month") {
                $("#ddl_month").addClass("required");
                $("#lbl_month_req").text("Required Field!");

            }

            else if (par_object_id == "ddl_dept") {
                $("#ddl_dept").addClass("required");
                $("#lbl_ddl_dept_req").text("Required Field!");

            }

            else if (par_object_id == "ddl_name") {
                $("#ddl_name").addClass("required");
                $("#lbl_ddl_name_req").text("Required Field!");

            }

        }
        else {
            
            $("#ddl_payroll_year").removeClass("required");
            $("#lbl_year_req").text("");
            $("#ddl_month").removeClass("required");
            $("#lbl_month_req").text("");

            $("#ddl_dept").removeClass("required");
            $("#lbl_ddl_dept_req").text("");
            $("#ddl_name").removeClass("required");
            $("#lbl_ddl_name_req").text("");

        }
    }

    function isdataValidate()
    {

        var return_val = true;
        ValidationResultColorHeader("ALL", false);

        if ($("#ddl_payroll_year").val().trim() == "")
        {
            ValidationResultColorHeader("ddl_payroll_year", true);
            return_val = false;
        }

        if ($("#ddl_month").val().trim() == "") {
            ValidationResultColorHeader("ddl_month", true);
            return_val = false;
        }

        if ($("#ddl_dept").val().trim() == "") {
            ValidationResultColorHeader("ddl_dept", true);
            return_val = false;
        }

        if ($("#ddl_name").val().trim() == "") {
            ValidationResultColorHeader("ddl_name", true);
            return_val = false;
        }

        return return_val

    }

    s.btn_generate_empl = function () {
        try {
            if (isdataValidate()) {
                var btn_generate_empl = document.getElementById('dtr_generation_empl');
                btn_generate_empl.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Generate DTR';
                $('#dtr_generation_empl').attr("disabled", true);


                s.upload_generate_text = "Generating DTR";
                s.upload_generate_text2 = "This might take a while";
                $('#modal_upload_initializing').modal({ backdrop: 'static', keyboard: false });
                $('#alert_notify').modal("hide");
                s.contact_personnel = ""

                h.post("../rSSDTRPrinting/GenerateDTREmployee", {
                        par_year                : $("#ddl_payroll_year").val()
                        ,par_month              : $("#ddl_month").val()
                        ,par_empl_id            : $("#txtb_empl_id2").val()
                        ,par_view_type          : "0"//$("#ddl_viewtype").val()
                        ,par_department_code    : $("#ddl_dept").val()
                        ,par_employment_type    : s.employment_type
                    }).then(function (d) {
                        if (d.data.message == "success") {
                            btn_generate_empl.innerHTML = '<i class="fa fa-cogs"> </i> Generate DTR';
                            if (d.data.generate_dtr.length > 0) {

                                
                                $('#dtr_generation_empl').attr("disabled", false);
                               // swal("DTR Successfully Generated!", { icon: "success", });
                                s.btn_print(); //CALL DTR PRINTING AFTER GENERATE
                              
                            }
                            else {
                                //swal("No data found!", { icon: "warning", });
                                //console.log(d.data.checkShiftFlag)
                                $('#dtr_generation_empl').attr("disabled", false);
                                s.contact_personnel = ""
                                s.flag_message = ""
                                if (d.data.checkShiftFlag[0].user_submitted.trim() != "") {
                                    s.contact_personnel = d.data.checkShiftFlag[0].user_submitted
                                    s.flag_message = "recall the submission of "
                                }

                                if (d.data.checkShiftFlag[0].user_hr_rcvd.trim() != "") {
                                    s.contact_personnel = d.data.checkShiftFlag[0].user_hr_rcvd
                                    s.flag_message = "disapprove"
                                }

                                if (d.data.checkShiftFlag[0].user_payroll_rcvd.trim() != "") {
                                    s.contact_personnel = d.data.checkShiftFlag[0].user_payroll_rcvd
                                    s.flag_message = "disapprove"
                                
                                }
                                
                                if (d.data.checkShiftFlag[0].user_payroll_appr.trim() != ""){
                                    s.contact_personnel = d.data.checkShiftFlag[0].user_payroll_appr
                                    s.flag_message = "disapprove"
                                 
                                }


                                if (s.contact_personnel.trim() == "")
                                {
                                    s.contact_personnel = "HRIS Team"
                                    s.flag_message = "disapprove"
                                }

                                console.log(d.data.checkShiftFlag[0])
                                

                                $('#alert_notify').modal({ backdrop: 'static', keyboard: false });
                            }
                        }
                        else
                        {
                            btn_generate_empl.innerHTML = '<i class="fa fa-cogs"> </i> Generate DTR';
                            swal(d.data.message, { icon: "warning", });
                            $('#dtr_generation_empl').attr("disabled", false);
                            $('#modal_upload_initializing').modal("hide");
                        }
                        $("#modal_upload_initializing").modal("hide");
                    });
                
            }
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    s.btn_print = function () {


        if (isdataValidate()) {



            s.loading_r = true;
            $('#print_preview_modal').modal({ backdrop: 'static', keyboard: false });
            s.Modal_title = "PRINT PREVIEW";

            $("#dtr_print").removeClass("fa fa-print");
            $("#dtr_print").addClass("fa fa-spinner fa-spin");
            h.post("../rSSDTRPrinting/RetriveData",
                {
                    par_year: $("#ddl_payroll_year").val()
                    , par_month: $("#ddl_month").val()
                    , par_empl_id: $("#txtb_empl_id2").val()
                    , par_view_type: $("#ddl_viewtype").val()
                    , par_department_code: $("#ddl_dept").val()

                }).then(function (d) {

                    if (d.data.sp_report.length == 0) {
                        swal("NO DATA FOUND", "No data found in this Year and Month Selected", { icon: "warning" });
                        $("#dtr_print").removeClass("fa fa-spinner fa-spin");
                        $("#dtr_print").addClass("fa fa-print");

                        s.loading_r = false;
                        $('#print_preview_modal').modal("hide");
                    }
                    else {
                        $("#dtr_print").removeClass("fa fa-spinner fa-spin");
                        $("#dtr_print").addClass("fa fa-print");
                        var controller = "Reports"
                        var action = "Index"
                        var ReportName = "cryDTR"
                        var SaveName = "Crystal_Report"
                        var ReportType = "inline"
                        var ReportPath = ""
                        var sp = ""

                        ReportPath = "~/Reports/cryDTR/cryDTR.rpt"
                        sp = "sp_dtr_rep,par_year," + $("#ddl_payroll_year").val() + ",par_month," + $("#ddl_month").val() + ",par_empl_id," + $("#txtb_empl_id2").val() + ",par_view_type," + $("#ddl_viewtype").val() + ",par_department_code," + $("#ddl_dept").val() + ",par_user_id," + d.data.session_user_id

                        // *******************************************************
                        // *** VJA : 2021-07-14 - Validation and Loading hide ****
                        // *******************************************************
                        $("#modal_generating_remittance").modal({ keyboard: false, backdrop: "static" })
                        var iframe = document.getElementById('iframe_print_preview');
                        var iframe_page = $("#iframe_print_preview")[0];
                        iframe.style.visibility = "hidden";

                        s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                            + "&ReportName=" + ReportName
                            + "&SaveName=" + SaveName
                            + "&ReportType=" + ReportType
                            + "&ReportPath=" + ReportPath
                            + "&id=" + sp //+ parameters
                        console.log(s.embed_link)

                        if (!/*@cc_on!@*/0) { //if not IE
                            iframe.onload = function () {
                                iframe.style.visibility = "visible";
                                $("#modal_generating_remittance").modal("hide")

                            };
                        }
                        else if (iframe_page.innerHTML()) {
                            // get and check the Title (and H tags if you want)
                            var ifTitle = iframe_page.contentDocument.title;
                            if (ifTitle.indexOf("404") >= 0) {
                                swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                                iframe.src = "";

                                s.loading_r = false;
                                $('#print_preview_modal').modal("hide");
                            }
                            else if (ifTitle != "") {
                                swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                                iframe.src = "";

                                s.loading_r = false;
                                $('#print_preview_modal').modal("hide");
                            }
                        }
                        else {
                            iframe.onreadystatechange = function () {
                                if (iframe.readyState == "complete") {
                                    iframe.style.visibility = "visible";
                                    $("#modal_generating_remittance").modal("hide")

                                }
                            };
                        }

                        s.loading_r = false;

                        iframe.src = s.embed_link;
                        $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });

                    }


                })
        }
    }

    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.ddl_dept_chane = function () {
        try
        {
            h.post("../rSSDTRPrinting/DepartmentFilter", {
                p_dept_code: $("#ddl_dept option:selected").val()
            }).then(function (d) {
                if (d.data.message == "success")
                {
                    s.empl_names = d.data.empl_name;
                    $("#txtb_empl_id2").val("");
                }
            });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.ddl_name_change = function ()
    {
        s.txtb_empl_id2 = $("#ddl_name option:selected").val();
        $("#txtb_empl_id2").val($("#ddl_name option:selected").val());
    }


    s.CheckGenerateDTR = function ()
    {
        s.check_generate = false;
        h.post("../rSSDTRPrinting/CheckGenerateDTR",
        {
             p_year     : s.ddl_payroll_year
            ,p_month    : s.ddl_month
            ,p_empl_id  : $("#ddl_name option:selected").val()

        }).then(function (d)
        {
            console.log(d.data.dtr_empl)
            if (d.data.dtr_empl.length < 1)
            {
                s.check_generate = true;
            }
            else
            {
                for (var i = 0; i < d.data.dtr_empl.length; i++)
                {
                    if (d.data.dtr_empl[i].remarks_details.includes("?"))
                    {
                        s.check_generate = true;
                        break;
                    }
                }

            }


        })
    }

});