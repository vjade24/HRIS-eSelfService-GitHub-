/*
 * Script created By:       Vincent Jade H. Alivio
 * Script created On:       01/09/2020
 * Purpose of this Script:  
 *                          
*/
ng_selfService_App.controller("cSSPaySlipPrinting_ctrlr", function ($scope, $compile, $http, $filter) {
    var s                       = $scope;
    var h                       = $http;
    s.year                      = [];
    s.ddl_month = [];
    s.ddl_payrolltemplate = "";
   // s.ddl_payrolltemplate       = "010"
    function init() {
        h.post("../rSSPaySlipPrinting/InitializeData").then(function (d)
        {
            s.txtb_empl_id        = d.data.session_empl_id
            s.txtb_empl_name      = d.data.session_employee_name
            s.lst_payrolltemplate = d.data.lst_payrolltemplate_code
            s.ddl_employment_type = d.data.session_employment_type

            RetrieveYear();
            s.ddl_payroll_year = new Date().getFullYear().toString()
            s.currentMonth = (new Date().getMonth() + 1) < 10 ? "0" + (new Date().getMonth() + 1).toString() : (new Date().getMonth() + 1).toString()
            s.ddl_month = s.currentMonth.toString()
        });
    }
    init()
    //**********************************************************//
    //******* Retrieve Payroll Template ***********************//
    //********************************************************//
    function RetrieveYear()
    {

        var currentYear = new Date().getFullYear();

        var prev_year = currentYear - 5;
        for (var i = 1; i <= 8; i++) {
            var data = { "year": prev_year }
            s.year.push(data)
            prev_year++;
        }

    }
    //**********************************************************//
    //******* Retrieve Payroll Template ***********************//
    //********************************************************//
    s.btn_print = function()
    {
        h.post("../rSSPaySlipPrinting/RetriveData",
            {       
                 par_payroll_year         : s.ddl_payroll_year
                ,par_payroll_month        : s.ddl_month
                ,par_payroll_registry_nbr : ""
                ,par_employment_type      : s.ddl_employment_type
                ,par_payrolltemplate_code : s.ddl_payrolltemplate
                ,par_empl_id              : s.txtb_empl_id
                
            }).then(function (d)
            {
                // console.log(d.data)
                if (d.data.message == "success") {
                    if (d.data.sp_report.length == 0)
                    {
                        swal("NO DATA FOUND", "No data found in this Year and Month Selected", { icon: "warning" });
                    }
                    else if (d.data.sp_report[0]["post_status"] != "Y")
                    {
                        swal("YOU CANNOT PRINT", "You cannot print the Pay Slip because the Payroll Status is not Posted on Audit", { icon: "warning" });
                    }
                    else if (d.data.sp_report[0]["post_status"] == "Y")
                    {
                        var controller  = "Reports"
                        var action      = "Index"
                        var ReportName  = "CrystalReport"
                        var SaveName    = "Crystal_Report"
                        var ReportType  = "inline"
                        var ReportPath  = d.data.ReportPath
                        var sp          = d.data.procedure
                        var parameters  = d.data.parameters

                        // *******************************************************
                        // *** VJA : 2021-07-14 - Validation and Loading hide ****
                        // *******************************************************
                        $("#loading_data").modal({ keyboard: false, backdrop: "static" })
                        var iframe = document.getElementById('iframe_print_preview');
                        var iframe_page = $("#iframe_print_preview")[0];
                        iframe.style.visibility = "hidden";

                        s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                            + "&ReportName=" + ReportName
                            + "&SaveName="   + SaveName
                            + "&ReportType=" + ReportType
                            + "&ReportPath=" + ReportPath
                            + "&id=" + sp + parameters
                        console.log(s.embed_link)

                        if (!/*@cc_on!@*/0) { //if not IE
                            iframe.onload = function () {
                                iframe.style.visibility = "visible";
                                $("#loading_data").modal("hide")
                            };
                        }
                        else if (iframe_page.innerHTML()) {
                            // get and check the Title (and H tags if you want)
                            var ifTitle = iframe_page.contentDocument.title;
                            if (ifTitle.indexOf("404") >= 0) {
                                swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                                iframe.src = "";
                            }
                            else if (ifTitle != "") {
                                swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                                iframe.src = "";
                            }
                        }
                        else {
                            iframe.onreadystatechange = function () {
                                if (iframe.readyState == "complete") {
                                    iframe.style.visibility = "visible";
                                    $("#loading_data").modal("hide")
                                }
                            };
                        }

                        iframe.src = s.embed_link;
                        $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
                        // *******************************************************
                        // *******************************************************
                    }
                }
                else
                {
                    swal("YOU CANNOT PRINT", d.data.message, { icon: "warning" })
                }

            })
    }

    //**********************************************************//
    //******* Retrieve Payroll Template ***********************//
    //********************************************************//
    s.RetrievePayrolltemplate = function ()
    {
        h.post("../rSSPaySlipPrinting/RetrievePayrolltemplate",
        {
            par_employment_type: s.ddl_employment_type

        }).then(function (d)
        {
            s.lst_payrolltemplate = d.data.lst_payrolltemplate_code
        })
    }
});