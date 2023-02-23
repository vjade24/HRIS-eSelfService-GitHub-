//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for BAC Payroll Registry Header
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// VINCENT JADE H. ALIVIO   04/07/2020      Code Creation
//**********************************************************************************
ng_selfService_App.controller("cSSBACPayReg_ctrl", function ($scope, $compile, $http, $filter) {
    var s = $scope;
    var h = $http;
    s.datalistgrid     = [];
    s.rowLen           = "10";
    s.um               = [];
    s.ddl_year       = "";
    s.year           = [];

    var init_table_data = function (par_data)
    {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {

                data: s.datalistgrid,
                sDom: 'rt<"bottom"p>',
                pageLength: 10,
                columns: [
                    {
                        "mData": "payroll_registry_nbr",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": "payroll_registry_descr",
                        "mRender": function (data, type, full, row) { return "<span style='padding-left:5px'>" + data + "</span>" }
                    },
                    {
                        "mData": "payroll_month_descr",
                        "mRender": function (data, type, full, row) { return "<span class='text-left btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": "payroll_period_descr",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": "gross_pay",
                        "mRender": function (data, type, full, row) { return "<span class='text-right btn-block' style='padding-right:5px'>" + data + "</span>" }
                    },
                    {
                        "mData": "net_pay",
                        "mRender": function (data, type, full, row) { return "<span class='text-right btn-block' style='padding-right:5px'>" + data + "</span>" }
                    },
                    {
                        "mData": "post_status_descr",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            var editable = false;
                            // STATUS THAT CAN DELETE ARE N and T

                            // '' - NOT POSTED
                            // N  - NOT POSTED
                            // Y  - POSTED
                            // A  - AUDITED
                            // R  - RELEASED
                            // T  - RETURNED
                            // X  - VOIDED
                            
                            if (full["post_status"].toString().trim() == "" ||
                                full["post_status"].toString().trim() == "N" ||
                                full["post_status"].toString().trim() == "T")
                            {
                                editable = false;
                            }
                            else
                            {
                                editable = true;
                            }

                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-warning btn-sm" ng-click="btn_show_details_action(' + row["row"] + ')" data-toggle="tooltip"   data-placement="top" title="Show Details">  <i class="fa fa-plus"></i></button >' +
                                '<button type="button" class="btn btn-success btn-sm" ng-show="um.allow_edit   == 1"  ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >' +
                                '<button type="button" class="btn btn-danger btn-sm"  ng-show="um.allow_delete == 1" ng-disabled=' + editable +' ng-click="btn_delete_row(' + row["row"] + ')"  data-toggle="tooltip" data-placement="top" title="Delete"> <i class="fa fa-trash"></i></button>' +
                                '<button type="button" class="btn btn-primary btn-sm" ng-show="um.allow_print  == 1"  ng-click="btn_print_row(' + row["row"] + ')"   data-toggle="tooltip" data-placement="top" title="Print" ><i class="fa fa-print"></i></button>' +
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
    //***********************************************************//
    //*** VJA - 2020-04-03 - Initialize when Page on-Load
    //***********************************************************//
    function init()
    {
        RetrieveYear()
        var curr_year = new Date().getFullYear().toString();
        s.ddl_year = curr_year
        s.currentMonth = new Date().getMonth() + 1
        s.ddl_payroll_month = datestring(s.currentMonth.toString())

        init_table_data([]);
        $('#loading_msg').html("LOADING");
        $("#modal_loading").modal();
        h.post("../cSSBACPayReg/InitializePage", {
            par_payroll_year :   s.ddl_year
        }).then(function (d)
        {
            s.um = d.data.um;
            s.datalistgrid  = d.data.data;
            s.dep_list      = d.data.dep_list
            s.func_list = d.data.func_list

            //s.ddl_department = "05"; // Default is PGSO
            s.datalistgrid.refreshTable('oTable', '');
            $("#modal_loading").modal('hide');
        })
    }
    init()
    //*********************************************//
    //*** VJA - 2020-04-03 - Retrieve Year
    //*********************************************// 
    function RetrieveYear() {
        var currentYear = new Date().getFullYear();
        var prev_year = currentYear - 5;
        for (var i = 1; i <= 8; i++) {
            var data = { "year": prev_year }
            s.year.push(data)
            prev_year++;
        }
    }
    //*********************************************//
    //*** VJA - 2020-04-03 - Clear Entry
    //*********************************************// 
    function ClearEntry() {
        ValidationResultColor("ALL", false);

        s.txtb_payroll_registry_nbr = "";
        s.txtb_payroll_year         = "";
        s.txtb_registry_descr       = "";
        s.txtb_period_from          = "";
        s.txtb_period_to            = "";
    }
    //***********************************************************//
    //*** VJA - 03/11/2020 - Occure when add button is clicked and initialize the objects
    //***********************************************************// 
    s.btn_add_click = function () {
        $('#i_save').addClass('fa-save');
        $('#i_save').removeClass('fa-spinner fa-spin');
        ClearEntry();
        
        s.ModalTitle  = "Add New Record";
        s.ADDEDITMODE = "ADD";
        if (s.ddl_year != "") {
            h.post("../cSSBACPayReg/GetLastRow", {
                par_payroll_year: s.ddl_year
            }).then(function (d) {
                s.txtb_payroll_registry_nbr = d.data.return_val
                s.txtb_payroll_year = $('#ddl_year option:selected').text().trim()
                // s.ddl_department = "05"; // Default is PGSO

                $('#main_modal').modal({ keyboard: false, backdrop: "static" });
            })
        } else {
            swal("You need to Select Payroll Year !", {icon : "warning"});
        }

        s.isdisable_month = false
        s.show_overrides_edit = true;
    }
    //*********************************************//
    //*** VJA - 2020-04-03 - Button Edit Action
    //*********************************************// 
    s.btn_edit_action = function (lst)
    {
        $('#btn_save').attr('ngx-data', lst);
        ClearEntry();

        s.txtb_payroll_registry_nbr = s.datalistgrid[lst].payroll_registry_nbr    
        s.txtb_payroll_year         = s.datalistgrid[lst].payroll_year
        s.ddl_payroll_month         = s.datalistgrid[lst].payroll_month
        s.txtb_registry_descr       = s.datalistgrid[lst].payroll_registry_descr    
        s.txtb_period_from          = s.datalistgrid[lst].payroll_period_from    
        s.txtb_period_to            = s.datalistgrid[lst].payroll_period_to    
        s.ddl_department            = s.datalistgrid[lst].department_code    
        s.ddl_function_code         = s.datalistgrid[lst].function_code    
        s.txtb_allotment_code       = s.datalistgrid[lst].allotment_code    

        // BEGIN - Toogle the Textboxes, Button and Dropdownlist if the Status are ; 
        ToogleEnableVisible(s.datalistgrid[lst].post_status.toString().trim())
        s.message_descr = "This Payroll already " + s.datalistgrid[lst].post_status_descr + ", you cannot Save/Generate !"
        // END   - Toogle the Textboxes, Button and Dropdownlist if the Status are ; 

        s.isdisable_month = true
        s.show_overrides_edit = false;
        s.ModalTitle  = "Edit Record";
        s.ADDEDITMODE = "EDIT";
        $('#main_modal').modal({ keyboard: false, backdrop: "static" });
    }
    //***************************************************************************//
    //*** VJA - 2020-04-03 - Occure when save button is clicked and save/edit data
    //***************************************************************************//
    s.btn_save_click = function () {
        if (ValidateFields()) {
            var data =
            {
                payroll_year            : s.ddl_year
                ,payroll_month          : s.ddl_payroll_month
                ,payroll_registry_nbr   : s.txtb_payroll_registry_nbr
                // ,payrolltemplate_code   : ""
                ,payroll_group_nbr      : "XXXX"
                ,payroll_registry_descr : s.txtb_registry_descr
                ,payroll_period_from    : $('#txtb_period_from').val()
                ,payroll_period_to      : $('#txtb_period_to').val()
                ,nod_work_1st           : "0.00"
                ,nod_work_2nd           : "0.00"
                ,post_status            : "N"
                ,department_code        :  s.ddl_department     
                ,function_code          :  s.ddl_function_code  
                ,allotment_code         :  s.txtb_allotment_code
                // ,payroll_dttm_created   : ""
                // ,payroll_dttm_updated   : ""
                // ,user_id_created_by     : ""
                // ,user_id_updated_by     : ""
                // ,date_posted            : ""

            };

            if (s.ADDEDITMODE == "ADD") {
                $('#i_save').removeClass('fa-save');
                $('#i_save').addClass('fa-spinner fa-spin');
                h.post("../cSSBACPayReg/SaveFromDatabase", { data: data }).then(function (d) {
                    if (d.data.message == "success") {

                        h.post("../cSSBACPayReg/RetreiveDataGrid", {
                            par_payroll_year: s.ddl_year
                        }
                        ).then(function (d) {
                            if (d.data.data.length > 0) {
                                s.datalistgrid = d.data.data;
                                s.oTable.fnClearTable();
                                s.oTable.fnAddData(d.data.data)
                            }
                            else {
                                s.oTable.fnClearTable();
                            }
                            var date_from = new Date($('#txtb_period_from').val());
                            var date_to   = new Date($('#txtb_period_to').val());
                            var date_from_to = datestring(date_from.getMonth() + 1) + '/' + datestring(date_from.getDate()) + ' - ' + datestring(date_to.getMonth() + 1) + '/' + datestring(date_to.getDate()) + '/' + date_to.getFullYear();
                            
                            data.payroll_month_descr = date_from_to;
                            data.post_status_descr   = "NOT POSTED";

                            s.datalistgrid.push(data)
                            for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                                if (get_page(s.txtb_payroll_registry_nbr) == false) {
                                    s.oTable.fnPageChange(x);
                                }
                                else {
                                    break;
                                }
                            }
                            
                            })
                        $('#main_modal').modal("hide");
                        swal("Your record has been saved!", d.data.message_oth, { icon: "success" });
                    }
                    else {
                        swal(d.data.message, d.data.message_oth, { icon: "error", });
                    }

                    $('#i_save').addClass('fa-save');
                    $('#i_save').removeClass('fa-spinner fa-spin');
                });
            }
            else if (s.ADDEDITMODE == "EDIT") {
                $('#i_save').removeClass('fa-save');
                $('#i_save').addClass('fa-spinner fa-spin');

                h.post("../cSSBACPayReg/UpdateFromDatabase", { data: data }).then(function (d) {
                    if (d.data.message == "success") {

                        var index_of_row = $('#btn_save').attr('ngx-data');
                        var date_from = new Date($('#txtb_period_from').val());
                        var date_to = new Date($('#txtb_period_to').val());
                        var date_from_to = datestring(date_from.getMonth() + 1) + '/' + datestring(date_from.getDate()) + ' - ' + datestring(date_to.getMonth() + 1) + '/' + datestring(date_to.getDate()) + '/' + date_to.getFullYear();
                        
                        s.datalistgrid[index_of_row].payroll_year           = s.ddl_year
                        s.datalistgrid[index_of_row].payroll_month          = s.ddl_payroll_month
                        s.datalistgrid[index_of_row].payroll_registry_nbr   = s.txtb_payroll_registry_nbr
                        s.datalistgrid[index_of_row].payroll_registry_descr = s.txtb_registry_descr
                        s.datalistgrid[index_of_row].payroll_period_from    = $('#txtb_period_from').val()
                        s.datalistgrid[index_of_row].payroll_period_to      = $('#txtb_period_to').val()
                        s.datalistgrid[index_of_row].payroll_period_descr   = date_from_to
                        s.datalistgrid[index_of_row].payroll_month_descr    = $('#ddl_payroll_month option:selected').text().trim()
                        
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid);

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
            }
        }

    }
    //***********************************************************//
    //*** VJA - 2020-04-03 -  Edit Action Occurred function click
    //***********************************************************// 
    s.btn_delete_row = function (id_ss) {
        
        swal({
            title: "Are you sure to delete this record?",
            text: "Once deleted, you will not be able to recover this record !",
            icon: "warning",
            buttons: true,
            dangerMode: true,

        })
            .then(function (willDelete) {
                if (willDelete) {
                    h.post("../cSSBACPayReg/DeleteFromDatabase",
                        {
                            par_payroll_year         : s.datalistgrid[id_ss].payroll_year,
                            par_payroll_registry_nbr : s.datalistgrid[id_ss].payroll_registry_nbr,

                        }).then(function (d) {

                            if (d.data.message == "success") {
                                s.datalistgrid = s.datalistgrid.remove(s.datalistgrid[id_ss].payroll_registry_nbr, "payroll_registry_nbr");
                                if (s.datalistgrid.length != 0) {
                                    s.oTable.fnClearTable();
                                    s.oTable.fnAddData(s.datalistgrid);
                                } else {
                                    s.oTable.fnClearTable();
                                }
                                swal("Your record has been deleted!", { icon: "success", });
                            }
                            else {
                                swal(d.data.message, "Data not deleted", "error");
                            }

                        })
                }
            });
    }
    //***********************************************************//
    //***VJA - 03/11/2020 -  Field validation everytime generation 
    //                          button is click ***//
    //***********************************************************// 
    function ValidateFields() {
        var return_val = true;
        ValidationResultColor("ALL", false);
         

        if ($('#txtb_payroll_registry_nbr').val() == "" && s.ADDEDITMODE == "ADD") {
            ValidationResultColor("txtb_payroll_registry_nbr", true);
            return_val = false;
        }
        if ($('#txtb_payroll_year').val() == "" ) {
            ValidationResultColor("txtb_payroll_year", true);
            return_val = false;
        }
        if ($('#ddl_payroll_month').val() == "" ) {
            ValidationResultColor("ddl_payroll_month", true);
            return_val = false;
        }
        if ($('#txtb_registry_descr').val() == "" ) {
            ValidationResultColor("txtb_registry_descr", true);
            return_val = false;
        }
        if ($('#txtb_period_from').val() == "") {
            ValidationResultColor("txtb_period_from", true);
            return_val = false;
        } else if (checkisdate($('#txtb_period_from').val()) == false) {
            ValidationResultColor("txtb_period_from", true);
            $("#txtb_period_from").addClass("required");
            $("#lbl_txtb_period_from_req").text("Invalid Date ");
            return_val = false;
        }
        if ($('#txtb_period_to').val() == "") {
            ValidationResultColor("txtb_period_to", true);
            return_val = false;
        } else if (checkisdate($('#txtb_period_to').val()) == false) {
            ValidationResultColor("txtb_period_to", true);
            $("#txtb_period_to").addClass("required");
            $("#lbl_txtb_period_to_req").text("Invalid Date ");
            return_val = false;
        }
        if (Date.parse($('#txtb_period_from').val().trim()) > Date.parse($('#txtb_period_to').val().trim())) {
            ValidationResultColor("txtb_period_from", true);
            ValidationResultColor("txtb_period_to", true);
            $("#lbl_txtb_period_to_req").text("Date From is greater than Date To");
            $("#lbl_txtb_period_from_req").text("Date From is greater than Date To");
            return_val = false;
        }
        return return_val;
    }

    //********************************************************************************//
    //***VJA - 03/11/2020 - Field validation everytime generation button is click ***//
    //******************************************************************************//
    function ValidationResultColor(par_object_id, par_v_result) {
        if (par_v_result) {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else {
            
            //remove of refresh the object form being required
            $("#txtb_payroll_registry_nbr").removeClass("required");
            $("#lbl_txtb_payroll_registry_nbr_req").text("");

            $("#txtb_payroll_year").removeClass("required");
            $("#lbl_txtb_payroll_year_req").text("");

            $("#ddl_payroll_month").removeClass("required");
            $("#lbl_ddl_payroll_month_req").text("");

            $("#txtb_registry_descr").removeClass("required");
            $("#lbl_txtb_registry_descr_req").text("");

            $("#txtb_period_from").removeClass("required");
            $("#lbl_txtb_period_from_req").text("");

            $("#txtb_period_to").removeClass("required");
            $("#lbl_txtb_period_to_req").text("");
            
        }
    }
    //**************************************************************//
    //*** VJA - 2020-04-03 - On-Change on Dropdownlist for Department
    //**************************************************************//
    //s.set_department_index = function (par_index)
    //{
    //    if (par_index != "")
    //    {
    //        h.post("../cSSBACPayReg/RetrieveEmpl", {
    //            par_department_code: s.deplist[par_index].department_code
    //        }).then(function (d)
    //        {
    //            s.emplist = d.data.emplist
    //        });
    //    }
    //    else
    //    {
    //        s.emplist = [];
    //        s.txtb_empl_id = "";
    //    }
    //}
    //******************************************************************//
    //*** VJA - 2020-04-03 - On-Change on Dropdownlist for Employee Name
    //*****************************************************************//
    //s.set_empl_name_index = function (par_index)
    //{
    //    if (par_index != "")
    //    {
    //        s.txtb_empl_id = s.emplist[par_index].empl_id
    //    }
    //    else {
    //        s.txtb_empl_id = "";
    //    }
    //}
    
    //***********************************************************//
    //*** VJA - 2020-04-03 - Reject or Check if Date
    //***********************************************************// 
    function checkisdate(d)
    {
        // Regex 1 - This will match yyyy-mm-dd and also yyyy-m-d:
        var regex1 = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;
        // Regex 2 - If you're looking for an exact match for yyyy-mm-dd then try this
        var regex2 = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
        // Regex 3 - or use this one if you need to find a date inside a string like The date is 2017-11-30
        var regex3 = /\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])*/;

        var istrue = false;
        if (regex1.test(d) == true ||
            regex2.test(d) == true ||
            regex3.test(d) == true)
        {
            istrue = true;
        } else
        {
            istrue = false;
        }
        return istrue;

    }
    //************************************************//
    //***VJA - 2020-04-03 - Validation for Nunber****//
    //**********************************************//
    function checkisvalidnumber(i) {
        var regex_spchar = /[^a-zA-Z0-9\s]\,\./;
        var regex_upper  = /[A-Z]/;
        var regex_lower  = /[a-z]/;
        var istrue = false;

        if (regex_upper.test(i) == true ||
            regex_lower.test(i) == true ||
            regex_spchar.test(i) == true) {
            istrue = false
        } else {
            istrue = true
        }
        return istrue
    }
    //************************************************//
    //***VJA - 2020-04-03 - Validation for Nunber****//
    //**********************************************//
    function checkischaracter(i) {
        var regex_upper = /[0-9]/;
        var istrue = false;

        if (regex_upper.test(i) == true) {
            istrue = false
        } else {
            istrue = true
        }
        return istrue
    }
    //***********************************************************//
    //***VJA - 2020-04-07 - Convert The Currency to 0,000,000.00 format
    //***********************************************************// 
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
    //***********************************************************//
    //*** VJA - 2020-04-03 - Search Functinality
    //***********************************************************//
    s.search_in_list = function (value, table) {
        $("#" + table).DataTable().search(value).draw();
    }
    //***********************************************************//
    //*** VJA - 2020-04-03 - Set Number of row
    //***********************************************************//
    s.setNumOfRow = function (value, table) {
        $("#" + table).DataTable().page.len(s.rowLen).draw();
    }
    //***********************************************************//
    //*** VJA - 2020-04-03 - Refresh Table
    //***********************************************************//
    Array.prototype.refreshTable = function (table, id) {

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
    //***********************************//
    //***VJA - 2020-04-03 - Remove Function****//
    //***********************************// 
    Array.prototype.remove = function (code, prop) {
        return this.filter(function (d) {
            return d[prop] != code
        })
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
    //******************************************************************//
    //*** VJA - 2020-04-03 - Include History
    //*****************************************************************//
    s.retrieveData = function () {
        h.post("../cSSBACPayReg/RetreiveDataGrid", {
            par_payroll_year: s.ddl_year
        }).then(function (d) {
            s.datalistgrid = d.data.data;
            s.datalistgrid.refreshTable('oTable', '');
        });
    }
    //******************************************************************//
    //*** VJA - 2020-04-03 - Button Generate on Add/Edit Modal
    //*****************************************************************//
    s.btn_generate_click = function ()
    {
        h.post("../cSSBACPayReg/CheckIfExecuteGenerate", {
            p_payroll_year          : s.txtb_payroll_year,
            p_payroll_month         : s.ddl_payroll_month,
            p_payroll_registry_nbr  : s.txtb_payroll_registry_nbr,
        }).then(function (d)
        {
            // Trap the Messag if the Payroll Year and Month is already Exist
            if (d.data.data.length > 0) {
                swal({
                    title: "Are you sure you want to Generate and Delete existing record?",
                    text: "Once generated and deleted, you will not be able to recover the existing record!",
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,

                }).then(function (willDelete) {
                    if (willDelete) {
                        ExecuteGenerate(1)
                    }
                });
            } else {

                ExecuteGenerate(0)
            }
        })
    }
    //******************************************************************//
    //*** VJA - 2020-04-03 - Execute Generate Function
    //*****************************************************************//
    function ExecuteGenerate(if_exist)
    {
        h.post("../cSSBACPayReg/ExecuteGenerate",
            {
                p_payroll_year    : s.txtb_payroll_year,
                p_payroll_month   : s.ddl_payroll_month,
                p_delete_existing : if_exist

            }).then(function (d) 
            {
                // Y - Payroll Registry Successfully Generated
                // N - Payroll Registry Not Generated / SP Error
                // 0 - No Data found, PayReg not Generated
                // P - Already Posted - PayReg not Generated
                // A - PayReg already existing for selected Payroll Template

                if (d.data.generate.return_flag == "Y") {
                    h.post("../cSSBACPayReg/RetreiveDataGrid", { par_payroll_year: s.ddl_year }).then(function (d) {
                        if (d.data.data.length > 0) {
                            s.datalistgrid = d.data.data;
                            s.oTable.fnClearTable();
                            s.oTable.fnAddData(d.data.data)
                        }
                        else {
                            s.oTable.fnClearTable();
                        }
                    })
                    $('#main_modal').modal("hide");
                    swal("Successfully Generated", d.data.generate.return_flag_descr, "success");
                }
                else
                {
                    swal("Not Generated", d.data.generate.return_flag_descr, "error");
                }

            })
    }
    //******************************************************************//
    //*** VJA - 2020-04-03 - Print on Grid
    //*****************************************************************//
    s.btn_print_row = function (lst)
    {
        s.templist = [];
        h.post("../cSSBACPayReg/RetrieveTemplate", {
            par_payrolltemplate_code: s.datalistgrid[lst].payrolltemplate_code //  Template code for BAC Honorarium Regular
        }).then(function (d)
        {
            s.templist = d.data.data;
            s.ddl_reports               = "";
            s.txtb_payroll_registry_nbr = s.datalistgrid[lst].payroll_registry_nbr
            s.txtb_descr                = s.datalistgrid[lst].payroll_registry_descr
            $('#modalLabelSmall').html("PAYROLL REPORT OPTIONS");
            $('#modal_print_option').modal({ keyboard: false, backdrop: "static" });
        })
    }
    //**************************************************************//
    //*** VJA - 2020-04-03 - On-Change on Dropdownlist for Department
    //**************************************************************//
    s.select_ddl_reports = function (par_index)
    {
        if (par_index != "")
        {
            s.txtb_report_filename    = s.templist[par_index].report_filename
            s.txtb_orig_template_code = s.templist[par_index].payrolltemplate_code
        }
        else
        {
            s.txtb_report_filename     = ""
            s.txtb_orig_template_code  = ""
        }
    }
    //******************************************************************//
    //*** VJA - 2020-04-03 - Execute Print on Modal
    //*****************************************************************//
    s.btn_print_click = function ()
    {
        s.employee_name_print = "BAC HONORARIUM";
        if (s.ddl_reports == "") {
            swal("You cannot Proceed", "Select Report!", "warning")
            return;
        }
        else if (s.txtb_orig_template_code == "951") // Template Code for BAC Honorarium Regular
        {
            h.post("../cSSBACPayReg/RetrieveReports",
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
                    var ReportPath = "~/Reports/cryBAC/cryBACPayroll.rpt";
                    var sp = "sp_payrollregistry_bac_rep,par_payroll_year," + s.ddl_year + ",par_payroll_registry_nbr," + s.txtb_payroll_registry_nbr

                    // location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                    //     + "&SaveName=" + SaveName
                    //     + "&ReportType=" + ReportType
                    //     + "&ReportPath=" + ReportPath
                    //     + "&Sp=" + sp

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
        else if (s.txtb_orig_template_code == "02") {
            h.post("../cSSBACPayReg/RetrieveReports",
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
                else {
                    swal("No Data Found !", "", "warning")
                }

            });
        }
        else if (s.txtb_orig_template_code   == "130"   // New Attachment -  RE
                || s.txtb_orig_template_code == "131"   // New Attachment -  CE
                || s.txtb_orig_template_code == "132")  // New Attachment -  JO
        {
            var controller = "Reports";
            var action = "Index";
            var ReportName = "";
            var SaveName = "Crystal_Report";
            var ReportType = "inline";
            var ReportPath = "~/Reports/cryPayrollSubReport/cryPayrollFooter_G.rpt";
            var sp = "sp_payrollregistry_header_footer_sub_rep,par_payroll_year," + s.ddl_year + ",par_payroll_registry_nbr," + s.txtb_payroll_registry_nbr 

           // location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
           //     + "&SaveName=" + SaveName
           //     + "&ReportType=" + ReportType
           //     + "&ReportPath=" + ReportPath
           //     + "&Sp=" + sp

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
        
        else if (s.txtb_orig_template_code   == "133"    // Fund Utilization Request and Status (FURS) - RE
                || s.txtb_orig_template_code == "134"    // Fund Utilization Request and Status (FURS) - CE
                || s.txtb_orig_template_code == "135")   // Fund Utilization Request and Status (FURS) - JO
        {
            var controller = "Reports";
            var action = "Index";
            var ReportName = "";
            var SaveName = "Crystal_Report";
            var ReportType = "inline";
            var ReportPath = "~/Reports/cryOBR/cryFURS.rpt";
            var sp = "sp_payrollregistry_cafao_rep_new,par_payroll_year," + s.ddl_year + ",par_payroll_registry_nbr," + s.txtb_payroll_registry_nbr + ",par_payrolltemplate_code," + "951"

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
             swal("You cannot Proceed","Other Reports are In-Progress !","warning")
             return;
        }
    }
    //******************************************************************//
    //*** VJA - 2020-04-03 - Toogle Generate Button
    //*****************************************************************//
    function ToogleEnableVisible(var_status)
    {
        // '' - NOT POSTED
        // N  - NOT POSTED
        // Y  - POSTED
        // A  - AUDITED
        // R  - RELEASED
        // T  - RETURNED
        // X  - VOIDED  

        if (var_status == ""  ||
            var_status == "N" ||
            var_status == "T")
        {
            s.isshow    = false;
            s.isdisable = false;
        }
        else
        {
            s.isshow    = true;
            s.isdisable = true;
        }
        
    }
    //*********************************************//
    //*** VJA - 2020-04-03 - Button Show Details
    //*********************************************// 
    s.btn_show_details_action = function (lst) {

        h.post("../cSSBACPayReg/PreviousValuesonPage",
            {
                par_year                        : $('#ddl_year option:selected').text(),
                par_month                       : s.datalistgrid[lst].payroll_month,
                par_month_descr                 : s.datalistgrid[lst].payroll_month_descr,
                par_group_code                  : s.datalistgrid[lst].payroll_group_nbr,
                par_group_code_descr            : s.datalistgrid[lst].group_description,
                par_payrolltemplate_code        : s.datalistgrid[lst].payrolltemplate_code,
                par_payrolltemplate_code_descr  : s.datalistgrid[lst].payrolltemplate_descr,
                par_payroll_registry_nbr        : s.datalistgrid[lst].payroll_registry_nbr,
                par_post_status                 : s.datalistgrid[lst].post_status,
                par_post_status_descr           : s.datalistgrid[lst].post_status_descr,
                par_show_entries                : s.rowLen,
                par_page_nbr                    : $('#datalist_grid').DataTable().page.info().page,
                par_search                      : s.search_box,

            }).then(function ()
            {
                var url = "";
                url = "/cSSBACPayReg_DTL";
                window.location.href = url;
            })

    }
});