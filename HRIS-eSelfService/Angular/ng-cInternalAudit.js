/*
 * Script created By:       Vincent Jade H. Alivio
 * Script created On:       2022-12-08
 * Purpose of this Script:  
 *                          
*/
ng_selfService_App.controller("cInternalAudit_ctrlr", function ($scope, $compile, $http, $filter)
{
    var s           = $scope;
    var h           = $http;
    s.year          = [];
    s.rowLen        = "";
    s.user_id       = "";
    var Init_dochistory_Tbl = function (par_data) {
        s.Dochistory_Data = par_data;
        s.Dochistory_Tbl = $('#datalist_dochistory').dataTable(
            {

                data: s.Dochistory_Data,
                sDom: 'rt<"bottom"p>',
                pageLength: 10,
                columns: [
                    {
                        "mData": null,
                        "mRender": function (data, type, full, row) {
                            return "<center><span class='details-control' style='display:block;' ng-click='btn_show_details(" + '"details_info"' + ")' ></center>"
                        }
                    },
                    {
                        "mData": "payroll_registry_nbr",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + full["payroll_registry_nbr"] + "</span>"
                        }
                    },
                    {
                        "mData": "payroll_registry_descr",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>&nbsp;&nbsp;" + full["Grouped"][parseInt(full["Grouped"].length) - 1]["payroll_registry_descr"].toString().trim() + "</span>"
                        }
                    },
                    {
                        "mData": "payroll_period_from",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>&nbsp;" + moment(full["Grouped"][parseInt(full["Grouped"].length) - 1]["payroll_period_from"].toString().trim()).format('YYYY-MM-DD') + ' / ' + moment(full["Grouped"][parseInt(full["Grouped"].length) - 1]["payroll_period_to"].toString().trim()).format('YYYY-MM-DD') + "</span>"
                        }
                    },
                    {
                        "mData": "gross_pay",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-right btn-block'>" + currency(data) + "&nbsp;&nbsp;</span>"
                        }
                    },
                    {
                        "mData": "post_status_descr",
                        "mRender": function (data, type, full, row)
                        {
                            color = "";

                            if (full["Grouped"][parseInt(full["Grouped"].length) - 1]["post_status"].toString().trim() != "Y")
                            {
                                color = "danger"
                            }
                            else
                            {
                                color = "primary"
                            }
                            return "&nbsp;&nbsp;<span class='badge badge-" + color + "'>&nbsp;&nbsp;" + full["Grouped"][parseInt(full["Grouped"].length) - 1]["post_status_descr"].toString().trim() + "</span>"
                        }
                     },

                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row)
                        {
                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-primary btn-sm action" ng-click="btn_print_payroll(' + row["row"] + ')"  data-toggle="tooltip" data-placement="top" title="Preview Payroll"> <i class="fa fa-print" id="dtr_print1_'+ full["payroll_registry_nbr"] +'"></i> </button>' +
                                '</div></center>';

                        }
                    }

                ],
                "createdRow": function (row, data, index) {
                    $(row).addClass("dt-row");
                    $compile(row)($scope);  //add this to compile the DOM
                },
                // scrollY: "50vh",
                // scrollCollapse: true,

            });

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }
    function RetrieveYear()
    {
        var currentYear = new Date().getFullYear();

        var prev_year = currentYear - 5;
        for (var i = 1; i <= 8; i++) {
            var data = { "year": prev_year }
            s.year.push(data)
            prev_year++;
        }
        s.currentMonth = new Date().getMonth() + 1
        s.payroll_month = datestring(s.currentMonth.toString());
    }
    function datestring(d) {
        var date_val = ""
        if (d < 10) {
            date_val = '0' + d
        } else {
            date_val = d
        }
        return date_val
    }
    function currency(d) {

        var retdata = ""
        if (d == null || d == "" || d == undefined) {
            return retdata = "0.00"
        }
        else
        {
            retdata = parseFloat(d).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
            return retdata
        }
    }
    function format(d)
    {
        var table = "";
        for (var i = 0; i < d.Grouped.length; i++)
        {
            //table += '<div class="row border-bottom"><div class="col-lg-1 text-right">' + (i + 1) + '. </div><div class="col-lg-1">' + d.Grouped[i].empl_id + '</div><div class="col-lg-3">' + d.Grouped[i].employee_name + '</div><div class="col-lg-2 text-right">' + currency(d.Grouped[i].gross_pay) + '</div> <div class="col-lg-2 text-center"> <button type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="top" title="Print DTR" id="dtr_print_' + d.Grouped[i].payroll_registry_nbr + '_' + d.Grouped[i].empl_id + '"  ng-click="btn_print_dtr(' + d.Grouped[i].payroll_year + ',' + d.Grouped[i].payroll_month + ',' + d.Grouped[i].empl_id + ',' + '\'0\'' + ',' + $('#department_code option:selected').val() + ',' + '\'U8314\'' + ')" > <i class="fa fa-print" id="dtr_print_' + d.Grouped[i].empl_id+'"></i>  </button></div></div>';
            table += '<tr>  <td scope="row" class="text-right">' + (i + 1) + '.</td>  <td scope="row" class="text-center">' + d.Grouped[i].empl_id + '</td> <td>' + d.Grouped[i].employee_name + '</td> <td class="text-right">' + currency(d.Grouped[i].gross_pay) + '</td> <td class="text-center"><button type="button" class="btn btn-primary btn-xs" data-toggle="tooltip" data-placement="top" title="Print DTR" id="dtr_print_' + d.Grouped[i].payroll_registry_nbr + '_' + d.Grouped[i].empl_id + '"  ng-click="btn_print_dtr(\'' + d.Grouped[i].payroll_year + '\',\'' + d.Grouped[i].payroll_month + '\',\'' + d.Grouped[i].empl_id + '\',' + '\'0\'' + ',' + $('#department_code option:selected').val() + ',' + '\'U' + d.Grouped[i].empl_id+'\'' + ')" > <i class="fa fa-print" id="dtr_print_' + d.Grouped[i].empl_id +'"></i>  </button></td> </tr>';
        }
        //var var_table = '<div class="table-responsive" style="padding:5px 10% 5px 10% !important"><div class="row border-bottom""><div class="col-lg-1 text-right" ><h3>#</h3></div><div class="col-lg-1"><h3>ID NO</h3></div><div class="col-lg-3"><h3>EMPLOYEE NAME</h3></div><div class="col-lg-2 text-right"><h3>GROSS PAY</h3></div><div class="col-lg-2 text-center"><h3>PRINT DTR</h3></div></div>' + table + '</div>';
        var var_table = '<div style="padding:5px 10% 5px 10% !important" class="table-responsive"><table class="table"> <thead><tr> <th style="background-image: linear-gradient(#18a689, #18a689) !important;" scope="col">#</th> <th  style="background-image: linear-gradient(#18a689, #18a689) !important;" scope="col">ID NO</th>  <th  style="background-image: linear-gradient(#18a689, #18a689) !important;" scope="col">EMPLOYEE NAME</th> <th  style="background-image: linear-gradient(#18a689, #18a689) !important;"  scope="col">GROSS PAY</th>  <th  style="background-image: linear-gradient(#18a689, #18a689) !important;"   scope="col">PRINT DTR</th> </tr></thead><tbody> ' + table +'</tbody></table></div>';
        return $compile(var_table)($scope);
    }
    function init()
    {
        var curr_year = new Date().getFullYear().toString();
        s.payroll_year = curr_year
        s.rowLen = "10"
        RetrieveYear()
        Init_dochistory_Tbl([])
        $("#modal_loading").modal({ keyboard: false, backdrop: "static" })
        h.post("../cInternalAudit/InitializeData", { par_year: curr_year }).then(function (d)
        {
            if (d.data.user_perpage == null)
            {
                swal("YOU ARE NOT ALLOWED TO ENTER THIS PAGE", "You redirecting to main page!", {
                    icon: "warning",
                    buttons: {

                        defeat: {
                            value: "defeat",
                            text: "Back to Main Page"
                        }
                    },
                }).then((value) => {
                    switch (value) {
                        default:
                            location.href = "../cMainPage/Index"

                    }
                });
                return;
            }
            else
            {
                s.Dochistory_Data = d.data.data
                s.Dochistory_Data.refreshTable('Dochistory_Tbl', '');
                s.empltype                    = d.data.empltype
                s.template                    = d.data.template
                s.department                  = d.data.department
                s.department_code             = "21";
                s.user_id                     = d.data.user_id;
                s.payrolltemplate_code        = "";
            }

            $("#modal_loading").modal('hide');
        })
    }
    init()
    s.RetriveTemplate   = function (employment_type)
    {
        h.post("../cInternalAudit/RetriveTemplate", { employment_type: employment_type }).then(function (d)
        {
            s.template = d.data.template
        })
    }
    s.RetriveGrid       = function (payroll_year, payroll_month, par_payrolltemplate_code, department_code)
    {
        if (s.payroll_year != "" && s.payroll_month != "" && s.employment_type != "" && s.payrolltemplate_code != "" && s.department_code != "")
        {
            $("#modal_loading").modal({ keyboard: false, backdrop: "static" })
            h.post("../cInternalAudit/RetriveGrid", { payroll_year: payroll_year, payroll_month: payroll_month, par_payrolltemplate_code: par_payrolltemplate_code, department_code: department_code}).then(function (d) {
                s.Dochistory_Data = d.data.data
                console.log(d.data.data)
                s.Dochistory_Data.refreshTable('Dochistory_Tbl', '');
                $("#modal_loading").modal('hide');
            })
        }

    }
    s.search_in_list    = function (value, table)
    {
        $("#" + table).DataTable().search(value).draw();
    }
    s.setNumOfRow       = function (value, table) {
        $("#" + table).DataTable().page.len(s.rowLen).draw();
    }
    s.btn_print_payroll = function (lst)
    {
        $('#print_preview_modal').modal({ backdrop: 'static', keyboard: false });

        console.log(s.Dochistory_Data[lst]["Grouped"][0])
        var v_payroll_year            = s.Dochistory_Data[lst]["Grouped"][0].payroll_year
        var v_payroll_registry_nbr    = s.Dochistory_Data[lst]["Grouped"][0].payroll_registry_nbr
        var v_payrolltemplate_code    = s.Dochistory_Data[lst]["Grouped"][0].payrolltemplate_code
        var v_payrolltemplate_descr = s.Dochistory_Data[lst]["Grouped"][0].payroll_registry_descr
        s.Modal_title                 = "PRINT PREVIEW | " + v_payroll_registry_nbr + " | " + v_payrolltemplate_descr;

        $("#dtr_print1_" + v_payroll_registry_nbr).removeClass("fa fa-print");
        $("#dtr_print1_" + v_payroll_registry_nbr).addClass("fa fa-spinner fa-spin");
        
        var ReportName  = "cryDTR"
        var SaveName    = "Crystal_Report"
        var ReportType  = "inline"
        var ReportPath  = ""
        var sp          = ""
        
        switch (v_payrolltemplate_code)
        {
            case "007":
                ReportPath = "~/Reports/cryRegularReports/crySalary/crySalarySummary.rpt"
                sp = "sp_payrollregistry_salary_re_ce_rep,par_payroll_year," + v_payroll_year + ",par_payroll_registry_nbr," + v_payroll_registry_nbr + ",par_payrolltemplate_code," + v_payrolltemplate_code;
                break;
            case "008":
                ReportPath = "~/Reports/cryCasualReports/crySalary/crySalarySummary.rpt"
                sp = "sp_payrollregistry_salary_ce_rep,par_payroll_year," + v_payroll_year + ",par_payroll_registry_nbr," + v_payroll_registry_nbr + ",par_payrolltemplate_code," + v_payrolltemplate_code;
                break;
            case "009":
                ReportPath = "~/Reports/cryJobOrderReports/crySalary/crySalaryMonthly.rpt"
                sp = "sp_payrollregistry_salary_jo_rep,par_payroll_year," + v_payroll_year + ",par_payroll_registry_nbr," + v_payroll_registry_nbr + ",par_payrolltemplate_code," + v_payrolltemplate_code;
                break;
            case "010":
                ReportPath = "~/Reports/cryJobOrderReports/crySalary/crySalary1st.rpt"
                sp = "sp_payrollregistry_salary_jo_rep,par_payroll_year," + v_payroll_year + ",par_payroll_registry_nbr," + v_payroll_registry_nbr + ",par_payrolltemplate_code," + v_payrolltemplate_code;
                break;
            case "011":
                ReportPath = "~/Reports/cryJobOrderReports/crySalary/crySalary2nd.rpt"
                sp = "sp_payrollregistry_salary_jo_rep,par_payroll_year," + v_payroll_year + ",par_payroll_registry_nbr," + v_payroll_registry_nbr + ",par_payrolltemplate_code," + v_payrolltemplate_code;
                break;
        }
        // *******************************************************
        // *** VJA : 2021-07-14 - Validation and Loading hide ****
        // *******************************************************
        $("#modal_loading").modal({ keyboard: false, backdrop: "static" })
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
            iframe.onload = function ()
            {
                iframe.style.visibility = "visible";
                $("#modal_loading").modal("hide")
                $("#dtr_print1_" + v_payroll_registry_nbr).removeClass("fa fa-spinner fa-spin");
                $("#dtr_print1_" + v_payroll_registry_nbr).addClass("fa fa-print");
            };
        }
        else if (iframe_page.innerHTML()) {
            // get and check the Title (and H tags if you want)
            var ifTitle = iframe_page.contentDocument.title;
            if (ifTitle.indexOf("404") >= 0) {
                swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                iframe.src = "";
                $('#print_preview_modal').modal("hide");
                $("#dtr_print1_" + v_payroll_registry_nbr).removeClass("fa fa-spinner fa-spin");
                $("#dtr_print1_" + v_payroll_registry_nbr).addClass("fa fa-print");
            }
            else if (ifTitle != "") {
                swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                iframe.src = "";
                $('#print_preview_modal').modal("hide");
                $("#dtr_print1_" + v_payroll_registry_nbr).removeClass("fa fa-spinner fa-spin");
                $("#dtr_print1_" + v_payroll_registry_nbr).addClass("fa fa-print");
            }
        }
        else {
            iframe.onreadystatechange = function () {
                if (iframe.readyState == "complete") {
                    iframe.style.visibility = "visible";
                    $("#modal_loading").modal("hide")
                    $("#dtr_print1_" + v_payroll_registry_nbr).removeClass("fa fa-spinner fa-spin");
                    $("#dtr_print1_" + v_payroll_registry_nbr).addClass("fa fa-print");
                }
            };
        }
        
        iframe.src = s.embed_link;
        $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
        
    }
    s.btn_print_dtr     = function (v_par_year, v_par_month, v_par_empl_id, v_par_view_type, v_par_department_code)
    {
        $("#dtr_print_" + v_par_empl_id).removeClass("fa fa-print");
        $("#dtr_print_" + v_par_empl_id).addClass("fa fa-spinner fa-spin");

        h.post("../cInternalAudit/RetriveData",
        {
             par_year               : v_par_year
            ,par_month              : v_par_month
            ,par_empl_id            : v_par_empl_id
            ,par_view_type          : v_par_view_type
            ,par_department_code    : v_par_department_code

        }).then(function (d)
        {
            if (d.data.sp_report.length == 0)
            {
                swal("NO DATA FOUND", "No data found in this Year and Month Selected", { icon: "warning" });

                $("#dtr_print_" + v_par_empl_id).removeClass("fa fa-spinner fa-spin");
                $("#dtr_print_" + v_par_empl_id).addClass("fa fa-print");
            }
            else
            {
                $('#print_preview_modal').modal({ backdrop: 'static', keyboard: false });
                s.Modal_title = "PRINT PREVIEW";

                var ReportName  = "cryDTR"
                var SaveName    = "Crystal_Report"
                var ReportType  = "inline"
                var ReportPath  = ""
                var sp          = ""

                ReportPath = "~/Reports/cryDTRUnOfficial/cryDTRUnOfficial.rpt"
                sp = "sp_dtr_rep,par_year," + v_par_year + ",par_month," + v_par_month + ",par_empl_id," + v_par_empl_id + ",par_view_type," + v_par_view_type + ",par_department_code," + v_par_department_code + ",par_user_id," + s.user_id

                // *******************************************************
                // *** VJA : 2021-07-14 - Validation and Loading hide ****
                // *******************************************************
                $("#modal_loading").modal({ keyboard: false, backdrop: "static" })
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
                        $("#modal_loading").modal("hide")

                        $("#dtr_print_" + v_par_empl_id).removeClass("fa fa-spinner fa-spin");
                        $("#dtr_print_" + v_par_empl_id).addClass("fa fa-print");
                    };
                }
                else if (iframe_page.innerHTML()) {
                    // get and check the Title (and H tags if you want)
                    var ifTitle = iframe_page.contentDocument.title;
                    if (ifTitle.indexOf("404") >= 0) {
                        swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                        iframe.src = "";
                        $('#print_preview_modal').modal("hide");
                        $("#dtr_print_" + v_par_empl_id).removeClass("fa fa-spinner fa-spin");
                        $("#dtr_print_" + v_par_empl_id).addClass("fa fa-print");
                    }
                    else if (ifTitle != "") {
                        swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                        iframe.src = "";
                        $('#print_preview_modal').modal("hide");
                        $("#dtr_print_" + v_par_empl_id).removeClass("fa fa-spinner fa-spin");
                        $("#dtr_print_" + v_par_empl_id).addClass("fa fa-print");
                    }
                }
                else {
                    iframe.onreadystatechange = function () {
                        if (iframe.readyState == "complete") {
                            iframe.style.visibility = "visible";
                            $("#modal_loading").modal("hide")

                            $("#dtr_print_" + v_par_empl_id).removeClass("fa fa-spinner fa-spin");
                            $("#dtr_print_" + v_par_empl_id).addClass("fa fa-print");

                        }
                    };
                }
        
                iframe.src = s.embed_link;
                $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
            }
        })

    }
    $('#datalist_dochistory tbody').on('click', 'span.details-control', function ()
    {
        var tr = $(this).closest('tr');
        var row = $('#datalist_dochistory').DataTable().row(tr);

        if (row.child.isShown())
        {
            row.child.hide();
            tr.removeClass('shown');
        }
        else
        {
            row.child(format(row.data())).show();
            $compile(row)($scope); 
            tr.addClass('shown');
            $compile(tr)($scope); 

        }
    });
    Array.prototype.refreshTable = function (table, id) {

        if (this.length == 0) {

            s[table].fnClearTable();
        }
        else {

            s[table].fnClearTable();
            s[table].fnAddData(this);
        }

        var el_id = s[table][0].id
        if (id != "") {
            for (var x = 1; x <= $("#" + el_id).DataTable().page.info().pages; x++) {
                if (id.get_page(table) == false) {
                    s[table].fnPageChange(x);
                }
                else {
                    break;
                }
            }
        }
        $("#spinner_load").modal("hide")

    }
});