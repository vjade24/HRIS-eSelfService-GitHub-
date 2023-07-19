//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for PHIC Payroll Registry
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JOSEPH M. TOMBO JR       03/03/2020      Code Creation
//**********************************************************************************
ng_selfService_App.controller("cSSPHICPayReg_ctrl", function ($scope, $compile, $http, $filter) {
    var s = $scope;
    var h = $http;
    s.year                  = [];
    s.datalistgrid_data     = [];
    s.employment_type_lst   = "";
    s.rowLen                = "";
    s.ddl_year              = "";
    s.ddl_month             = "";
    s.ddl_group_class       = "";
    s.txtb_template_descr   = "PHIC Share";//Hard coded for now based on the descussion.
    s.template_code = "950";       //Hard coded for now based on the descussion.
    s.ddl_reports = "01"
    s.grouplist = [];
    s.ddl_department = "21"
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

    var init_table_data = function (par_data)
    {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {

                data: s.datalistgrid,
                sDom: 'rt<"bottom"ip>',
                pageLength: 10,
                columns: [

                    {
                        "mData": "payroll_registry_nbr",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    { "mData": "payroll_registry_descr" },
                    {
                        "mData": "payroll_group_nbr",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": "payroll_period_descr",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": "gross_pay",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": "net_pay",
                        "mRender": function (data, type, full, row) { return "<span class='text-right btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": "post_status_descr",
                        "mRender": function (data, type, full, row)
                        
                        {
                            // var text_color = "text-danger";
                            //if (full["post_status"] == "N") {
                            //    text_color = "text-danger";
                            //} else {
                            //    text_color = "text-danger";
                            //}
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            var printable = false;
                            
                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-warning btn-sm" ng-click="btn_show_details_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Show Details">  <i class="fa fa-plus"></i></button >' +
                                '<button type="button" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit Record">  <i class="fa fa-edit"></i></button >' +
                                '<button type="button" class="btn btn-primary btn-sm" ng-disabled="' + printable + '" ng-click="btn_print_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Print" ><i class="fa fa-print"></i></button>' +
                                '</div></center>';

                        }
                    }

                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            }
        );

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
        
    }



    function init()
    {
        var curr_year   = new Date().getFullYear().toString();
        s.ddl_year      = curr_year
        s.rowLen = "10"
        s.currentMonth = new Date().getMonth() + 1
        s.ddl_month = datestring(s.currentMonth.toString())

        RetrieveYear();
        init_table_data([]);

        $('#loading_msg').html("LOADING");
        $("#modal_loading").modal();
        var trk_year = s.track_year
        h.post("../cSSPHICPayReg/InitializePage", {
            pay_year:   s.ddl_year,
            pay_month:  s.ddl_month,
            emp_type    : s.ddl_group_class,
            department_code: s.ddl_department
        }).then(function (d)
        {
            s.employment_type_lst   = d.data.employment_types_lst;
            s.datalistgrid_data     = d.data.data;
            s.grouplist = d.data.deplist;
            s.dep_list = d.data.dep_list
            s.func_list = d.data.func_list

            // par_year
            // par_month
            // par_month_descr
            // par_group_class
            // par_group_class_descr
            // par_group_code
            // par_group_code_descr
            // par_payrolltemplate_code
            // par_payrolltemplate_code_descr
            // par_payroll_registry_nbr
            // par_post_status
            // par_post_status_descr
            // par_department_code
            // par_department_code_descr
            // par_show_entries
            // par_page_nbr
            // par_search

            //console.log(d.data.session_val)

            if (d.data.session_val.length > 0)
            {
                s.ddl_year          = d.data.session_val[0].toString();
                s.ddl_month         = d.data.session_val[1].toString();
                s.ddl_group_class   = d.data.session_val[3].toString();
                s.ddl_department    = d.data.session_val[12].toString();
                s.rowLen            = d.data.session_val[14].toString();
                s.search_box        = d.data.session_val[16].toString();
                $("#datalist_grid").DataTable().search(s.search_box).draw();
            }


            if (d.data.data.length > 0) {
                s.lbl_grand_total = d.data.data[0].total_gross
            } else {
                s.lbl_grand_total = "0.00"
            }
            s.datalistgrid_data.refreshTable('oTable', '');
            $("#modal_loading").modal('hide');
        })
    }

    init()

    s.retrieveData = function ()
    {
        h.post("../cSSPHICPayReg/RetreiveDataGrid", {
            pay_year:           s.ddl_year,
            pay_month:          s.ddl_month,
            group_class     :   s.ddl_group_class,
            department_code:    s.ddl_department
        }).then(function (d)
        {
            s.datalistgrid_data     = d.data.data;
            if (d.data.data.length > 0) {
                s.lbl_grand_total = d.data.data[0].total_gross
            } else
            {
                s.lbl_grand_total = "0.00"
            }
            s.datalistgrid_data.refreshTable('oTable', '');
        });
    }

    //***********************************//
    //***Print-Button-on-Grid*****VJA***//
    //***********************************// 
    s.btn_print_history_grid = function (lst, table_data) {
        h.post("../rSSDocTrkHistory/RetrieveDocHistory", {

            par_doc_ctrl_nbr: s[table_data][lst].doc_ctrl_nbr
        }).then(function (d) {

            if (d.data.message = "success") {
                var controller = "Reports";
                var action = "Index";
                var ReportName = "CrystalReport";
                var SaveName = "Crystal_Report";
                var ReportType = "inline";
                var ReportPath = "~/Reports/";
                var sp = "";
                var parameters = "";

                sp = "sp_document_tracking_tbl_history";
                parameters = "p_doc_ctrl_nbr," + s[table_data][lst].doc_ctrl_nbr + ",p_docmnt_type," + s[table_data][lst].docmnt_type
                ReportPath = ReportPath + "cryDocTracking/cryDocsHistory.rpt"

                location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                    + "&SaveName=" + SaveName
                    + "&ReportType=" + ReportType
                    + "&ReportPath=" + ReportPath
                    + "&Sp=" + sp + "," + parameters
            } else {
                swal("No Data Found !", "", "warning")
            }

        });

    }
    
    s.search_in_list = function (value, table) {
        $("#" + table).DataTable().search(value).draw();
    }

    s.setNumOfRow = function (value, table) {
        $("#" + table).DataTable().page.len(s.rowLen).draw();
    }


    Array.prototype.refreshTable = function (table, id)
    {

        if (this.length == 0) {

            s[table].fnClearTable();
        }
        else {

            s[table].fnClearTable();
            s[table].fnAddData(this);
        }

        var el_id = s[table][0].id
        $("#spinner_load").modal("hide")
    }

    //***********************************************************//
    //*** VJA - 2020-04-03 - Get Page Row
    //***********************************************************// 
    function get_page(empl_id) {
        var nakit_an = false;
        var rowx = 0;
        $('#datalist_grid tr').each(function () {
            $.each(this.cells, function (cells) {
                if (cells == 0) {
                    if ($(this).text() == empl_id) {
                        nakit_an = true;
                        return false;
                    }
                }
            });
            if (nakit_an) {
                $(this).addClass("selected");
                return false;
            }
            rowx++;
        });
        return nakit_an;
    }

    function elEmpty(data)
    {
        if (data == null || data == "" || data == undefined) {
            return true
        }
        else {
            return false
        }
    }

    function currency(d) {

        var retdata = ""
        if (d == null || d == "" || d == undefined) {
            return retdata = "0.00"
        }
        else {
            retdata = parseFloat(d).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
            return retdata
        }
    }

    //*********************************************//
    //*** VJA - 02/29/2020 - Print
    //*********************************************// 
    s.btn_print_row = function (lst)
    {
        $('#modalLabelSmall').html("PAYROLL REPORT OPTIONS");
        $('#modal_print_option').modal({ keyboard: false, backdrop: "static" });
        s.txtb_payroll_registry_nbr = s.datalistgrid_data[lst].payroll_registry_nbr
        s.txtb_descr                = s.datalistgrid_data[lst].payroll_registry_descr
        return

        
    }

    s.btn_print_click = function ()
    {
        s.employee_name_print = "PHIC SHARE";
        if (s.ddl_reports == "01")
        {
            h.post("../cSSPHICPayReg/RetrieveReports",
                {
                    par_payroll_year            : s.ddl_year
                    , par_payroll_registry_nbr  : s.txtb_payroll_registry_nbr
                }
            ).then(function (d) {

                if (d.data.message == "sucess") {
                    var controller = "Reports";
                    var action = "Index";
                    var ReportName = "";
                    var SaveName = "Crystal_Report";
                    var ReportType = "inline";
                    var ReportPath = "";
                    
                    if (d.data.rep[0].employment_type == "JO")
                    {
                        ReportPath = "~/Reports/cryPHIC/cryPHICPayroll_JO.rpt";
                    } else
                    {
                        ReportPath = "~/Reports/cryPHIC/cryPHICPayroll.rpt";

                    }

                    var sp = "sp_payrollregistry_phic_share_rep,par_payroll_year," + s.ddl_year + ",par_payroll_registry_nbr," + s.txtb_payroll_registry_nbr

                    //location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                    //    + "&SaveName=" + SaveName
                    //    + "&ReportType=" + ReportType
                    //    + "&ReportPath=" + ReportPath
                    //    + "&Sp=" + sp

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
                                $("#modal_loading").modal("hide")
                            }
                        };
                    }

                    iframe.src = s.embed_link;
                    $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
                    // *******************************************************
                    // *******************************************************

                }
                else {
                    swal("No Data Found !", "", "warning")
                }

            });
        }
        else if (s.ddl_reports == "02")
        {
            h.post("../cSSPHICPayReg/RetrieveReports",
                {
                    par_payroll_year: s.ddl_year
                    , par_payroll_registry_nbr: s.txtb_payroll_registry_nbr
                }
            ).then(function (d) {

                if (d.data.message == "sucess") {
                    var controller = "Reports";
                    var action = "Index";
                    var ReportName = "";
                    var SaveName = "Crystal_Report";
                    var ReportType = "inline";
                    var ReportPath = "~/Reports/cryPHIC/cryPHICPayroll.rpt";
                    var sp = "sp_payrollregistry_phic_share_rep,par_payroll_year," + s.ddl_year + ",par_payroll_registry_nbr," + s.txtb_payroll_registry_nbr

                    //location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                    //    + "&SaveName=" + SaveName
                    //    + "&ReportType=" + ReportType
                    //    + "&ReportPath=" + ReportPath
                    //    + "&Sp=" + sp


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
                                $("#modal_loading").modal("hide")
                            }
                        };
                    }

                    iframe.src = s.embed_link;
                    $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
                    // *******************************************************
                    // *******************************************************

                }
                else
                {
                    swal("No Data Found !", "", "warning")
                }

            });
        }




    }
    //*********************************************//
    //*** VJA - 02/29/2020 - Button Edit Action
    //*********************************************// 
    s.btn_edit_action = function (lst)
    {
        ClearEntry();
        $('#btn_save').attr('ngx-data', lst);

        //console.log(s.datalistgrid_data[0])
        s.txtb_payroll_registry_nbr       = s.datalistgrid_data[lst].payroll_registry_nbr;
        s.txtb_payroll_group              = s.datalistgrid_data[lst].group_description;
        s.txtb_registry_descr             = s.datalistgrid_data[lst].payroll_registry_descr;
        s.txtb_period_from                = s.datalistgrid_data[lst].payroll_period_from;
        s.txtb_period_to                  = s.datalistgrid_data[lst].payroll_period_to;
        s.ddl_department_modal            = s.datalistgrid_data[lst].department_code;
        s.ddl_function_code               = s.datalistgrid_data[lst].function_code;
        s.txtb_allotment_code             = s.datalistgrid_data[lst].allotment_code;
        s.txtb_payroll_group_nbr          = s.datalistgrid_data[lst].payroll_group_nbr;

        // BEGIN - Toogle the Textboxes, Button and Dropdownlist if the Status are ; 
        ToogleEnableVisible(s.datalistgrid_data[lst].post_status.toString().trim())
        s.message_descr = "This Payroll already " + s.datalistgrid_data[lst].post_status_descr + ", you cannot Save/Generate !"
        // END   - Toogle the Textboxes, Button and Dropdownlist if the Status are ; 

        s.ModalTitle                      = "View/Edit Record";
        $('#main_modal').modal({ keyboard: false, backdrop: "static" });
    }
    //*********************************************//
    //*** VJA - 02/29/2020 - Clear Entry
    //*********************************************// 
    function ClearEntry()
    {
        s.txtb_payroll_registry_nbr = "";
        s.txtb_payroll_group        = "";
        s.txtb_registry_descr       = "";
        s.txtb_period_from          = "";
        s.txtb_period_to            = "";
        s.ddl_department_modal      = "";
        s.ddl_function_code         = "";
        s.txtb_allotment_code = "";
        s.txtb_payroll_group_nbr = "";
    }
    //***********************************************************//
    //*** VJA - 02/29/2020 - Convert date to String from 1 to 01 if less than 10
    //***********************************************************// 
    function datestring(d) {
        var date_val = ""
        if (d < 10) {
            date_val = '0' + d
        } else {
            date_val = d
        }
        return date_val
    }
    //*********************************************//
    //*** VJA - 02/29/2020 - Button Show Details
    //*********************************************// 
    s.btn_show_details_action = function (lst) {
        //console.log(s.datalistgrid_data[lst])
        //return;
        h.post("../cSSPHICPayReg/PreviousValuesonPage_cSSPHICPayReg",
            {
                par_year                        : $('#ddl_year option:selected').text(),
                par_month                       : $('#ddl_month option:selected').val(),
                par_month_descr                 : $('#ddl_month option:selected').text(),
                par_group_class                 : $('#ddl_group_class option:selected').val(),
                par_group_class_descr           : $('#ddl_group_class option:selected').text(),
                par_group_code                  : s.datalistgrid_data[lst].payroll_group_nbr,
                par_group_code_descr            : s.datalistgrid_data[lst].group_description,
                par_payrolltemplate_code        : s.datalistgrid_data[lst].payrolltemplate_code,
                par_payrolltemplate_code_descr  : s.datalistgrid_data[lst].payrolltemplate_descr,
                par_payroll_registry_nbr        : s.datalistgrid_data[lst].payroll_registry_nbr,
                par_post_status                 : s.datalistgrid_data[lst].post_status,
                par_post_status_descr           : s.datalistgrid_data[lst].post_status_descr,
                par_department_code             : $('#ddl_department option:selected').val(),
                par_department_code_descr       : $('#ddl_department option:selected').text(),
                par_show_entries                : s.rowLen,
                par_page_nbr                    : $('#datalist_grid').DataTable().page.info().page,
                par_search                      : s.search_box,


            }).then(function (d)
            {
                var url = "";
                url = "/cSSPHICPayReg_DTL";
                window.location.href = url;
                
            })

    }
    //*********************************************//
    //*** VJA - 02/29/2020 - Button to Print Breakdown
    //*********************************************//
    //s.btn_print_brkdwn = function ()
    //{
    //    h.post("../cSSPHICPayReg/PrintBreakdownReports",
    //        {
    //             p_payroll_year      : s.ddl_year
    //            ,p_payroll_month     : s.ddl_month
    //            ,p_department_code   : s.ddl_department

    //        }).then(function (d)
    //        {
    //            if (d.data.message == "sucess") {
    //                var controller = "Reports";
    //                var action = "Index";
    //                var ReportName = "";
    //                var SaveName = "Crystal_Report";
    //                var ReportType = "inline";
    //                var ReportPath = "~/Reports/cryPHIC/cryPHICBreakdown.rpt";
    //                var sp = "sp_payrollregistry_phic_share_brkdwn_rep,p_payroll_year," + s.ddl_year + ",p_payroll_month," + s.ddl_month + ",p_department_code," + s.ddl_department

    //                location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
    //                    + "&SaveName=" + SaveName
    //                    + "&ReportType=" + ReportType
    //                    + "&ReportPath=" + ReportPath
    //                    + "&Sp=" + sp
    //            }
    //            else
    //            {
    //                swal("No Data Found !", "", "warning")
    //            }
                
    //        })
    //}
    //***************************************************************************//
    //*** VJA - 2020-04-03 - Occure when save button is clicked and save/edit data
    //***************************************************************************//
    s.btn_save_click = function () {
        //if (ValidateFields())
        //{
            var data =
            {
                payroll_year            : s.ddl_year
                , payroll_month         : s.ddl_payroll_month
                , payroll_registry_nbr  : s.txtb_payroll_registry_nbr
                , department_code       : s.ddl_department_modal
                , function_code         : s.ddl_function_code
                , allotment_code        : s.txtb_allotment_code
                ,payroll_registry_descr : s.txtb_registry_descr
                ,payroll_period_from    : s.txtb_period_from
                ,payroll_period_to      : s.txtb_period_to
                
        };
        // console.log(data)
                $('#i_save').removeClass('fa-save');
                $('#i_save').addClass('fa-spinner fa-spin');

                    h.post("../cSSPHICPayReg/UpdateFromDatabase", { data: data }).then(function (d) {
                    if (d.data.message == "success") {

                         var index_of_row = $('#btn_save').attr('ngx-data');
                         var date_from = new Date($('#txtb_period_from').val());
                         var date_to = new Date($('#txtb_period_to').val());
                         var date_from_to = datestring(date_from.getMonth() + 1) + '/' + datestring(date_from.getDate()) + ' - ' + datestring(date_to.getMonth() + 1) + '/' + datestring(date_to.getDate()) + '/' + date_to.getFullYear();
                        
                        s.datalistgrid_data[index_of_row].payroll_year      = s.ddl_year
                        s.datalistgrid_data[index_of_row].payroll_month = s.ddl_payroll_month
                        s.datalistgrid_data[index_of_row].payroll_registry_nbr = s.txtb_payroll_registry_nbr
                        s.datalistgrid_data[index_of_row].payroll_registry_descr = s.txtb_registry_descr
                        s.datalistgrid_data[index_of_row].payroll_period_from = $('#txtb_period_from').val()
                        s.datalistgrid_data[index_of_row].payroll_period_to = $('#txtb_period_to').val()
                        s.datalistgrid_data[index_of_row].payroll_period_descr = date_from_to
                        s.datalistgrid_data[index_of_row].payroll_month_descr = $('#ddl_payroll_month option:selected').text().trim()

                        s.datalistgrid_data[index_of_row].department_code   = s.ddl_department_modal
                        s.datalistgrid_data[index_of_row].function_code     = s.ddl_function_code
                        s.datalistgrid_data[index_of_row].allotment_code    = s.txtb_allotment_code


                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid_data);

                        for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                            if (get_page(s.txtb_payroll_registry_nbr) == false) {
                                s.oTable.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }

                        $('#main_modal').modal("hide");
                        swal("Your record has been saved!", d.data.message_oth, { icon: "success", });

                    }
                    else {
                        swal(d.data.message, d.data.message_oth, { icon: "error", });
                    }

                    $('#i_save').addClass('fa-save');
                    $('#i_save').removeClass('fa-spinner fa-spin');
                });
            
        //}

    }

    //******************************************************************//
    //*** VJA - 2020-04-03 - Toogle Generate Button
    //*****************************************************************//
    function ToogleEnableVisible(var_status) {
        // '' - NOT POSTED
        // N  - NOT POSTED
        // Y  - POSTED
        // A  - AUDITED
        // R  - RELEASED
        // T  - RETURNED
        // X  - VOIDED  

        if (var_status == "" ||
            var_status == "N" ||
            var_status == "T") {
            s.isshow    = false;
            s.isdisable = false;
        }
        else {
            s.isshow    = true;
            s.isdisable = true;
        }

    }

    //*********************************************//
    //*** VJA - 02/29/2020 - Button to Print Breakdown
    //*********************************************//
    //s.btn_print_all_reg = function () {
    //    h.post("../cSSPHICPayReg/RetrieveAllReports",
    //        {
    //            par_payroll_year: s.ddl_year
    //            , par_payroll_registry_nbr: s.txtb_payroll_registry_nbr
    //        }
    //    ).then(function (d) {

    //        if (d.data.message == "sucess") {
    //            var controller = "Reports";
    //            var action = "Index";
    //            var ReportName = "";
    //            var SaveName = "Crystal_Report";
    //            var ReportType = "inline";
    //            var ReportPath = "~/Reports/cryPHIC/cryPHICPayroll.rpt";
    //            var sp = "sp_payrollregistry_phic_share_rep,par_payroll_year," + s.ddl_year + ",par_payroll_registry_nbr," + s.txtb_payroll_registry_nbr

    //            location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
    //                + "&SaveName=" + SaveName
    //                + "&ReportType=" + ReportType
    //                + "&ReportPath=" + ReportPath
    //                + "&Sp=" + sp

    //        }
    //        else {
    //            swal("No Data Found !", "", "warning")
    //        }

    //    });
    //}
    
    s.btn_regen = function ()
    {
        swal({
            title: "Are you sure you want to Re-Generate this record?",
            text: "Once Generated, check the details !",
            icon: "warning",
            buttons: true,
            dangerMode: true,

        })
            .then(function (willDelete) {
                if (willDelete) {
                    h.post("../cSSPHICPayReg/ReGenerate_PHIC",
                        {
                            p_payroll_year			: s.ddl_year 
                            ,p_payroll_month		: s.ddl_month
                            ,p_department_code		: s.ddl_department
                            ,p_delete_existing		: true
                            ,p_user_id				: ''
                            ,p_payroll_group_nbr	: s.txtb_payroll_group_nbr
                            ,p_payroll_registry_nbr	: s.txtb_payroll_registry_nbr
                            
                        }).then(function (d) {

                            console.log(d.data.regen)
                            if (d.data.message == "success")
                            {
                                s.retrieveData();

                                s.oTable.fnClearTable();
                                s.oTable.fnAddData(s.datalistgrid_data);

                                for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                                    if (get_page(s.txtb_payroll_registry_nbr) == false) {
                                        s.oTable.fnPageChange(x);
                                    }
                                    else {
                                        break;
                                    }
                                }

                                $('#main_modal').modal("hide");
                                swal("Successfully Generated!", "Data successfully generated, check the registry details", { icon: "success", });

                            }
                            else
                            {
                                swal("Not Generated! ","something went wrong", "error");
                            }

                        })
                }
            });
    }
});