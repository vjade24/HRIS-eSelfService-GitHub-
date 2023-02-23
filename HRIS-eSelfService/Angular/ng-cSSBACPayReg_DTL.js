//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for BAC Payroll Registry Details
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// VINCENT JADE H. ALIVIO   04/08/2020      Code Creation
//**********************************************************************************
ng_selfService_App.controller("cSSBACPayReg_DTL_ctrl", function ($scope, $compile, $http, $filter) {
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
                order: [[1, "asc"]],
                columns: [
                    {
                        "mData": "empl_id",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": "employee_name",
                        "mRender": function (data, type, full, row) { return "<span style='padding-left:5px'>" + data + "</span>" }
                    },
                    {
                        "mData": "bac_position_descr",
                        "mRender": function (data, type, full, row) { return "<span class='text-left btn-block'>" + data + "</span>" }
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
                                full["post_status"].toString().trim() == "T") {
                                editable = false;
                            }
                            else {
                                editable = true;
                            }


                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-success btn-sm" ng-show="um.allow_edit   == 1"  ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >' +
                                '<button type="button" class="btn btn-danger btn-sm"  ng-show="um.allow_delete == 1" ng-disabled=' + editable +'  ng-click="btn_delete_row(' + row["row"] + ')"  data-toggle="tooltip" data-placement="top" title="Delete"> <i class="fa fa-trash"></i></button>' +
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
    //*** VJA - 2020-04-08 - Initialize when Page on-Load
    //***********************************************************//
    function init()
    {
        init_table_data([]);
        $('#loading_msg').html("LOADING");
        $("#modal_loading").modal();
        h.post("../cSSBACPayReg_DTL/InitializePage").then(function (d)
        {
            s.um            = d.data.um;
            s.datalistgrid  = d.data.data;
            s.hdrlist       = d.data.hdrlist;

            s.txtb_payroll_year     = d.data.preval[0].toString()
            s.txtb_payroll_month    = d.data.preval[2].toString()
            s.ddl_payroll_registry = d.data.preval[7].toString()
            if (d.data.preval[8].toString() == ""  ||
                d.data.preval[8].toString() == "N" ||
                d.data.preval[8].toString() == "T")
            {
                s.isshow_add = false;
            }
            else {
                s.isshow_add = true;
            }

            ToogleEnableVisible(d.data.preval[8].toString())
            s.message_descr = "This Payroll already " + d.data.preval[9].toString() + ", you cannot Save/Update/Add/Delete !"

            s.datalistgrid.refreshTable('oTable', '');
            $("#modal_loading").modal('hide');
        })
    }
    init()
    //*********************************************//
    //*** VJA - 2020-04-08 - Retrieve Year
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
    //*** VJA - 2020-04-08 - Clear Entry
    //*********************************************// 
    function ClearEntry() {
        ValidationResultColor("ALL", false);

        s.txtb_empl_name      = "";
        s.ddl_empl_name       = "";
        s.txtb_empl_id        = "";
        s.txtb_position       = "";
        //s.txtb_position_class = "";
        s.lbl_rate_descr      = "Rate Description";
        s.txtb_rate_amount    = "0.00";
        s.txtb_allowance_amt  = "0.00";
        s.txtb_wtax_perc      = "0.00";
        s.txtb_wtax_amt       = "0.00";
        s.txtb_net_pay        = "0.00";
    }
    //***********************************************************//
    //*** VJA - 03/11/2020 - Occure when add button is clicked and initialize the objects
    //***********************************************************// 
    s.btn_add_click = function () {
        $('#i_save').addClass('fa-save');
        $('#i_save').removeClass('fa-spinner fa-spin');
        ClearEntry();
        s.empl_name = true
        s.ModalTitle  = "Add New Record";
        s.ADDEDITMODE = "ADD";

        $("#modal_loading").modal();
        h.post("../cSSBACPayReg_DTL/RetrieveEmpl").then(function (d) {
            s.emplist = d.data.emplist
            $("#modal_loading").modal('hide');
            $('#main_modal').modal({ keyboard: false, backdrop: "static" });
        })

    }
    //*********************************************//
    //*** VJA - 2020-04-08 - Button Edit Action
    //*********************************************// 
    s.btn_edit_action = function (lst)
    {
        $('#btn_save').attr('ngx-data', lst);
        ClearEntry();
        s.empl_name = false
        s.txtb_empl_name     = s.datalistgrid[lst].employee_name       
        s.txtb_empl_id       = s.datalistgrid[lst].empl_id    
        s.txtb_position      = s.datalistgrid[lst].bac_position_descr      
        s.lbl_rate_descr     = s.datalistgrid[lst].rate_basis_descr    
        s.txtb_rate_amount   = s.datalistgrid[lst].rate_amount    
        s.txtb_allowance_amt = s.datalistgrid[lst].gross_pay    
        s.txtb_wtax_perc     = s.datalistgrid[lst].wtax_perc    
        s.txtb_wtax_amt      = s.datalistgrid[lst].wtax    
        s.txtb_net_pay       = s.datalistgrid[lst].net_pay    

        console.log(s.datalistgrid[lst].net_pay)
        var wtax_perc   = 0;
        var wtax_amt    = 0;
        gross_pay       = parseFloat(s.datalistgrid[lst].gross_pay.replace(',', '').replace(',', ''));
        wtax_perc       = parseFloat(s.datalistgrid[lst].wtax_perc.replace(',', '').replace(',', ''));
        //wtax_amt        = Math.round(gross_pay * (wtax_perc / 100) * 100) / 100;
        //s.txtb_wtax_amt = currency(wtax_amt);
        
        
        // VJA : Binugo ni - Check the Number if the 025 Kay dle nya e Round off pag ing ana nga amount
        wtax_amt = gross_pay * (wtax_perc / 100);
        wtax_amt = Math.round(wtax_amt * 100) / 100;
        var wtax_check = gross_pay * (wtax_perc / 100);
        var data_check1 = currency_for_tax(wtax_check).toString('###,##0.000').split('.')[1];
        if (data_check1 == "025")
        {
            wtax_amt = wtax_amt + .01;
        }
        s.txtb_wtax_amt = currency_2_format(wtax_amt).toString('###,##0.00');
        // VJA : Binugo ni - Check the Number if the 025 Kay dle nya e Round off pag ing ana nga amount

        // BEGIN - Toogle the Textboxes, Button and Dropdownlist if the Status are ; 
        ToogleEnableVisible(s.datalistgrid[lst].post_status.toString().trim())
        s.message_descr = "This Payroll already " + s.datalistgrid[lst].post_status_descr + ", you cannot Save/Update/Add/Delete !"
        // END   - Toogle the Textboxes, Button and Dropdownlist if the Status are ; 

        s.ModalTitle  = "Edit Record";
        s.ADDEDITMODE = "EDIT";
        $('#main_modal').modal({ keyboard: false, backdrop: "static" });
    }
    //***************************************************************************//
    //*** VJA - 2020-04-08 - Occure when save button is clicked and save/edit data
    //***************************************************************************//
    s.btn_save_click = function () {
        if (ValidateFields()) {
            var data =
            {

                 empl_id    : s.txtb_empl_id
                , gross_pay : s.txtb_allowance_amt.replace(',', '').replace(',', '')
                , net_pay   : s.txtb_net_pay.replace(',', '').replace(',', '')
                , wtax_perc : s.txtb_wtax_perc.replace(',', '').replace(',', '')
                , wtax      : s.txtb_wtax_amt.replace(',', '').replace(',', '')

            };
            
            if (s.ADDEDITMODE == "ADD") {
                $('#i_save').removeClass('fa-save');
                $('#i_save').addClass('fa-spinner fa-spin');
                h.post("../cSSBACPayReg_DTL/SaveFromDatabase", { data: data }).then(function (d) {
                    if (d.data.message == "success") {
                        data.employee_name = $('#ddl_empl_name option:selected').text()
                        data.bac_position_descr = s.txtb_position
                        data.rate_basis_descr = s.lbl_rate_descr
                        data.rate_amount = s.txtb_rate_amount
                        s.datalistgrid.push(data)
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid);
                        for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                            if (get_page(s.txtb_empl_id) == false) {
                                s.oTable.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }

                        $('#main_modal').modal("hide");
                        swal("Your record has been saved!", d.data.message_oth, { icon: "success" });
                    } else {
                        swal(d.data.message, d.data.message_oth, { icon: "error", });
                    }

                    $('#i_save').addClass('fa-save');
                    $('#i_save').removeClass('fa-spinner fa-spin');
                });
            }
            else if (s.ADDEDITMODE == "EDIT") {
                $('#i_save').removeClass('fa-save');
                $('#i_save').addClass('fa-spinner fa-spin');

                h.post("../cSSBACPayReg_DTL/UpdateFromDatabase", { data: data }).then(function (d) {
                    if (d.data.message == "success") {

                        var index_of_row = $('#btn_save').attr('ngx-data');
                        
                        s.datalistgrid[index_of_row].empl_id      = s.txtb_empl_id
                        s.datalistgrid[index_of_row].gross_pay    = s.txtb_allowance_amt
                        s.datalistgrid[index_of_row].net_pay      = s.txtb_net_pay
                        s.datalistgrid[index_of_row].wtax_perc    = s.txtb_wtax_perc
                        s.datalistgrid[index_of_row].wtax_amt     = s.txtb_wtax_amt
                        
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid);

                        for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                            if (get_page(s.txtb_empl_id) == false) {
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
    //*** VJA - 2020-04-08 -  Edit Action Occurred function click
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
                    h.post("../cSSBACPayReg_DTL/DeleteFromDatabase",
                        {
                            par_empl_id         : s.datalistgrid[id_ss].empl_id
                        }).then(function (d) {

                            if (d.data.message == "success") {
                                s.datalistgrid = s.datalistgrid.remove(s.datalistgrid[id_ss].empl_id, "empl_id");
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
        
        if ($('#ddl_empl_name').val() == "" && s.ADDEDITMODE == "ADD") {
            ValidationResultColor("ddl_empl_name", true);
            return_val = false;
        }
        if ($('#txtb_allowance_amt').val() == "") {
            ValidationResultColor("txtb_allowance_amt", true);
            return_val = false;
        }
        else if (checkisvalidnumber($('#txtb_allowance_amt').val()) == false)
        {
            ValidationResultColor("txtb_allowance_amt", true);
            $("#txtb_allowance_amt").addClass("required");
            $("#lbl_txtb_allowance_amt_req").text("Invalid numeric value !");
            return_val = false;
        }
        if ($('#txtb_wtax_perc').val() == "" ) {
            ValidationResultColor("txtb_wtax_perc", true);
            return_val = false;
        }
        else if (checkisvalidnumber($('#txtb_wtax_perc').val()) == false) {
            ValidationResultColor("txtb_wtax_perc", true);
            $("#txtb_allowance_amt").addClass("required");
            $("#lbl_txtb_wtax_perc_req").text("Invalid numeric value !");
            return_val = false;
        }
        //if ($('#txtb_wtax_amt').val() == "") {
        //    ValidationResultColor("txtb_wtax_amt", true);
        //    return_val = false;
        //}
        //else if (checkisvalidnumber($('#txtb_wtax_amt').val()) == false) {
        //    ValidationResultColor("txtb_wtax_amt", true);
        //    $("#txtb_wtax_amt").addClass("required");
        //    $("#lbl_txtb_wtax_amt_req").text("Invalid numeric value !");
        //    return_val = false;
        //}
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
            $("#ddl_empl_name").removeClass("required");
            $("#lbl_ddl_empl_name_req").text("");

            $("#txtb_allowance_amt").removeClass("required");
            $("#lbl_txtb_allowance_amt_req").text("");

            $("#txtb_wtax_perc").removeClass("required");
            $("#lbl_txtb_wtax_perc_req").text("");

            $("#txtb_wtax_amt").removeClass("required");
            $("#lbl_txtb_wtax_amt_req").text("");
            
        }
    }
    //**************************************************************//
    //*** VJA - 2020-04-08 - On-Change on Dropdownlist for Department
    //**************************************************************//
    //s.set_department_index = function (par_index)
    //{
    //    if (par_index != "")
    //    {
    //        h.post("../cSSBACPayReg_DTL/RetrieveEmpl", {
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
    //*** VJA - 2020-04-08 - On-Change on Dropdownlist for Employee Name
    //*****************************************************************//
    s.set_empl_name_index = function (par_index)
    {
        if (par_index != "")
        {
            s.txtb_empl_id         = s.emplist[par_index].empl_id
            s.txtb_position        = s.emplist[par_index].bac_position_descr
            s.txtb_allowance_amt   = s.emplist[par_index].bac_allowance_amt
            //s.txtb_position_class  = s.emplist[par_index].bac_position_class_descr
            s.lbl_rate_descr        = s.emplist[par_index].rate_basis_descr
            s.txtb_rate_amount      = s.emplist[par_index].rate_amount;
            s.txtb_wtax_perc        = currency(s.emplist[par_index].wtax_perc);

            s.calculate_net()
        }
        else {
            s.txtb_empl_id          = "";
            s.txtb_position         = "";
            s.txtb_allowance_amt    = "0.00";
            //s.txtb_position_class   = "";
            s.lbl_rate_descr        = "Rate Description";
            s.txtb_rate_amount      = "0.00";
            s.txtb_net_pay          = "0.00";
            s.txtb_wtax_perc        = "0.00";
            s.txtb_wtax_amt         = "0.00";
        }
    }
    
    //***********************************************************//
    //*** VJA - 2020-04-08 - Reject or Check if Date
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
    //***VJA - 2020-04-08 - Validation for Nunber****//
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
    //***VJA - 2020-04-08 - Validation for Nunber****//
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
    //*** VJA - 2020-04-08 - Search Functinality
    //***********************************************************//
    s.search_in_list = function (value, table) {
        $("#" + table).DataTable().search(value).draw();
    }
    //***********************************************************//
    //*** VJA - 2020-04-08 - Set Number of row
    //***********************************************************//
    s.setNumOfRow = function (value, table) {
        $("#" + table).DataTable().page.len(s.rowLen).draw();
    }
    //***********************************************************//
    //*** VJA - 2020-04-08 - Refresh Table
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
    //*** VJA - 2020-04-08 - Get Page Row
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
    //***VJA - 2020-04-08 - Remove Function****//
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

        if (var_status == ""  ||
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
    //******************************************************************//
    //*** VJA - 2020-04-08 - Function to Calcuate Net Pay
    //*****************************************************************//
    s.calculate_net = function ()
    {
        if (ValidateFields())
        {
            var gross_pay   = 0;
            var wtax_perc   = 0;
            var wtax_amt    = 0;
            var net_pay     = 0;

            gross_pay = parseFloat(s.txtb_allowance_amt.replace(',', '').replace(',', ''));
            wtax_perc = parseFloat(s.txtb_wtax_perc.replace(',', '').replace(',', ''));
            wtax_amt  = Math.round(gross_pay * (wtax_perc / 100) * 100) / 100;
            net_pay   = gross_pay - wtax_amt;

            s.txtb_wtax_amt = currency_2_format(wtax_amt);
            s.txtb_net_pay = currency(net_pay).toString('###,##0.00');

            // VJA : Binugo ni - Check the Number if the 025 Kay dle nya e Round off pag ing ana nga amount
            //wtax_amt = gross_pay * (wtax_perc / 100);
            //wtax_amt = Math.round(wtax_amt * 100) / 100;
            //var wtax_check = gross_pay * (wtax_perc / 100);
            //var data_check1 = currency_for_tax(wtax_check).toString('###,##0.000').split('.')[1];
            //if (data_check1 == "025") {
            //    wtax_amt = wtax_amt + .01;
            //}
            //s.txtb_wtax_amt = currency_2_format(wtax_amt).toString('###,##0.00');
            // VJA : Binugo ni - Check the Number if the 025 Kay dle nya e Round off pag ing ana nga amount

            var w_tax_amt_override = 0;
            w_tax_amt_override = gross_pay * (wtax_perc / 100);
            w_tax_amt_override = Math.round(wtax_amt * 100) / 100;
            var wtax_check = gross_pay * (wtax_perc / 100);
            var data_check1 = currency_for_tax(wtax_check).toString('###,##0.000').split('.')[1];
            if (data_check1 == "025") {
                wtax_amt = wtax_amt + .01;
                s.txtb_wtax_amt = currency_2_format(wtax_amt).toString('###,##0.00');
                net_pay = net_pay - .01;
                s.txtb_net_pay = currency(net_pay).toString('###,##0.00');
            }
        }
        
    }
    //************************************************//
    //*** VJA - 2020-04-08 - Back to Header**********//
    //**********************************************//
    s.btn_back = function () {
        location.href = "cSSBACPayReg"
    }

    //***********************************************************//
    //***VJA - 2020-04-07 - Convert The Currency to 0,000,000.00 format
    //***********************************************************// 
    function currency_2_format(d) {

        var retdata = ""
        if (d == null || d == "" || d == undefined) {
            return retdata = "0.00"
        }
        else {
            //retdata = Number((d).toFixed(3));

            retdata = parseFloat(d).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
            
            return retdata

        }
    }

    //***********************************************************//
    //***VJA - 2020-04-07 - Convert The Currency to 0,000,000.00 format
    //***********************************************************// 
    function currency_for_tax(d) {

        var retdata = ""
        if (d == null || d == "" || d == undefined) {
            return retdata = "0.000"
        }
        else {
            retdata = parseFloat(d).toFixed(3).replace(/\d(?=(\d{3})+\.)/g, '$&,')

            return retdata

        }
    }

    function RoundNum(num, length) {
        var number = Math.round(num * Math.pow(10, length)) / Math.pow(10, length);
        return number;
    }


    // console.log(Math.round(8628.525 * 100) / 100)
});