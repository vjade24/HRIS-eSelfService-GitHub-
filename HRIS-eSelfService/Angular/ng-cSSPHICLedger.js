/*
 * Script created By:       Vincent Jade H. Alivio
 * Script created On:       02/29/2020
 * Purpose of this Script:  
 *                          
 */
ng_selfService_App.controller("cSSPHICLedger_ctrlr", function ($scope, $compile, $http, $filter) {
    var s                       = $scope;
    var h                       = $http;
    s.rowLen                    = "10";
    s.datalistgrid              = null;

    s.ddl_year                  = "";
    s.year                      = [];
    s.grouplist                 = [];
    s.ddl_group_code            = "";
    s.ddl_empl_name             = "";
    s.ddl_month                 = ""

    // ***** LEDGER STATUS DESCRIPTION - ledger_status 
    // ** Status that CAN be Reprocess
    // ** W - With Payroll 
    // ** T - With Return Payrolls     
    // ** X - With Voided Payrolls
    // *******************************************
    // ** Status that CANNOT be Reprocess
    // ** R - With Released Payrolls
    // ** Y - With Partial Return Payrolls
    // ** Z - With Partial Voided Payrolls
    // *******************************************

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

    // ******************************************
    // * VJA - 02/29/2020 - Initialized page
    // ****************************************** 
    function init()
    {
        RetrieveYear();

        s.ddl_year = new Date().getFullYear().toString()
        s.currentMonth = new Date().getMonth() + 1
        s.ddl_month = datestring(s.currentMonth.toString())

        $('#loading_msg').html("LOADING");
        $("#modal_loading").modal();
        h.post("../cSSPHICLedger/InitializeData",
            {
                 p_payroll_year      : s.ddl_year
                ,p_payroll_month   : s.ddl_month
            }).then(function (d)
            {
            s.grouplist   = d.data.grouplist
            if (d.data.listgrid != null && d.data.listgrid.length > 0) {
                s.datalistgrid = d.data.listgrid;
                init_table_data(s.datalistgrid);
            }
            else init_table_data([]);


        });
    }

    init()

    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {
                data: s.datalistgrid,
                sDom: 'rt<"bottom"ip><"toolbar">',
                pageLength: s.rowLen,
                columns: [
                    { "mData": "department_code", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "department_name1", "mRender": function (data, type, full, row) { return "<span class='text-left btn-block' style='padding-left:10px'> "+ data +"</span>"} },
                    { "mData": "share_amt", "mRender": function (data, type, full, row) { return "<span class='text-right btn-block' style='padding-right:5px'> " + currency(data) + "</span>" } },
                    //{ "mData": "med_perc", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block' >" + data + "</span>" } },
                    //{ "mData": "nonmed_perc", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "period_covered", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "ledger_status_descr", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            var editable = false;
                            var deletable = false;
                            // LEDGER STATUS 
                            // W - With Payroll
                            // N - New Ledger   
                            if (full["ledger_status"] == "W") // With Payroll
                            {
                                deletable = true;
                            }
                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-success btn-sm" ng-disabled="' + editable + '" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="View">  <i class="fa fa-edit"></i></button >' +
                                '<button type="button" class="btn btn-danger btn-sm" ng-disabled="' + deletable + '" ng-click="btn_delete_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                '</div></center>';
                        }
                    }

                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });
        $("#modal_loading").modal('hide');
    }
    
    // ******************************************
    // * VJA - 02/29/2020 - Search
    // ****************************************** 
    s.search_in_list = function (value, table) {
        $("#" + table).DataTable().search(value).draw();
    }
    // ******************************************
    // * VJA - 02/29/2020 - Set the Number of Row
    // ****************************************** 
    s.setNumOfRow = function (value, table) {
        $("#" + table).DataTable().page.len(value).draw();
    }
    function show_date() {
        $('.datepicker').datepicker({ format: 'yyyy-mm-dd' });
    }

    //***********************************************************//
    //*** VJA - 02/29/2020 - Occure when add button is clicke
    //                      d and initialize the objects
    //***********************************************************// 
    s.btn_add_click = function () {
        s.show_in_add = true;
        s.show_in_edit = false;

        $('#i_save').addClass('fa-save');
        $('#i_save').removeClass('fa-spinner fa-spin');
        ClearEntry();
        s.ModalTitle = "Add New Record";
        s.empl_name = true;
        ValidationResultColor("ALL", false);
        s.ADDEDITMODE = "ADD";
        
        s.txtb_payroll_year  = $("#ddl_year option:selected").html()
        s.txtb_payroll_month = $("#ddl_month option:selected").html()
        
        s.isvisible             = true
        s.isdisable             = false
        s.isdatevisible         = false
        s.show_effective_date   = true
        s.isvisible_generate    = true
        if (s.ddl_year == "" && s.ddl_month == "")
         {
             swal("You need to Select Payroll Year and Month", { icon: "warning" })
         } else
         {
             
            $('#main_modal').modal({ keyboard: false, backdrop: "static" });
         }
        
    }

    //***********************************************************//
    //*** VJA - 02/29/2020 - Edit Action Occurred function click
    //***********************************************************// 
    s.btn_edit_action = function (row_index) {
        ClearEntry();
        $('#btn_save').attr('ngx-data', row_index);
        ValidationResultColor("ALL", false);
        var getIndividualData = [];
        s.show_in_add = false;
        s.show_in_edit = true;
        s.empl_name = false;
        s.ADDEDITMODE = "EDIT";
        s.ModalTitle = "View Record";
        
        s.show_effective_date = false
        ClearEntry();
        
        s.txtb_payroll_year     = $("#ddl_year option:selected").html()
        s.txtb_payroll_month    = $("#ddl_month option:selected").html()
        s.txtb_department       = s.datalistgrid[row_index].department_name1;
        s.ddl_department        = s.datalistgrid[row_index].department_code;
        s.txtb_share_amt        = currency(s.datalistgrid[row_index].share_amt);
        s.txtb_med_perc         = s.datalistgrid[row_index].med_perc;
        s.txtb_nonmed_perc      = s.datalistgrid[row_index].nonmed_perc;
        s.txtb_period_from      = s.datalistgrid[row_index].period_from;
        s.txtb_period_to        = s.datalistgrid[row_index].period_to;
        
       // ***** LEDGER STATUS DESCRIPTION - ledger_status 
       // ** Status that CAN be Reprocess
       // ** W - With Payroll 
       // ** T - With Return Payrolls     
       // ** X - With Voided Payrolls
       // *******************************************
       // ** Status that CANNOT be Reprocess
       // ** R - With Released Payrolls
       // ** Y - With Partial Return Payrolls
       // ** Z - With Partial Voided Payrolls
       // *******************************************
        var status_message = "";
        if (s.datalistgrid[row_index].ledger_status == "W") {
            status_message = ""
            $('#lbl_status_message').removeClass('label label-danger')
        } else if (s.datalistgrid[row_index].ledger_status == "T") {
            status_message = ""
            $('#lbl_status_message').removeClass('label label-danger')

        } else if (s.datalistgrid[row_index].ledger_status == "X") {
            status_message = ""
            $('#lbl_status_message').removeClass('label label-danger')
        } else if (s.datalistgrid[row_index].ledger_status == "R") {
            status_message = "This Payroll Already Released, You Cannot Re-Generate or Save the data!"
            $('#lbl_status_message').addClass('label label-danger')
        } else if (s.datalistgrid[row_index].ledger_status == "Y") {
            status_message = "This Payroll Partially Returned, You Cannot Re-Generate or Save the data!"
            $('#lbl_status_message').addClass('label label-danger')
        } else if (s.datalistgrid[row_index].ledger_status == "Y") {
            status_message = "This Payroll Partially Voided, You Cannot Re-Generate or Save the data!"
            $('#lbl_status_message').addClass('label label-danger')
        } else if (s.datalistgrid[row_index].ledger_status == "N") {
            status_message = ""
            $('#lbl_status_message').removeClass('label label-danger')
        }

        s.lbl_status_message = status_message

        s.isvisible     = true   
        s.isdatevisible = true
        //if (s.datalistgrid[row_index].ledger_status == "W" ||
        //         s.datalistgrid[row_index].ledger_status == "T" ||
        //        s.datalistgrid[row_index].ledger_status == "X" ||
        //        s.datalistgrid[row_index].ledger_status == "N"
        //)
        if (s.datalistgrid[row_index].ledger_status == "N")
        {
            s.isvisible          = false
            s.isdisable          = true;
            s.isdatevisible      = true
            s.isvisible_generate = true

        }
        else
        {
            s.isvisible          = true
            s.isdisable          = false;
            s.isdatevisible      = false
            s.isvisible_generate = false
        }
        
        $('#main_modal').modal({ keyboard: false, backdrop: "static" });

    }
    //***********************************************************//
    //*** VJA - 02/29/2020 -  Edit Action Occurred function click
    //***********************************************************// 
    s.btn_delete_row = function (id_ss) {
        var dt = null;
        dt = s.datalistgrid[id_ss]
        swal({
            title: "Are you sure to delete this record?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: true,
            dangerMode: true,

        })
            .then(function (willDelete) {
                if (willDelete) {
                    h.post("../cSSPHICLedger/DeleteFromDatabase",
                        {
                            p_payroll_year      : s.datalistgrid[id_ss].payroll_year,
                            p_payroll_month     : s.datalistgrid[id_ss].payroll_month,
                            p_department_code   : s.datalistgrid[id_ss].department_code,

                        }).then(function (d) {

                            if (d.data.message == "success")
                            {
                                s.datalistgrid = s.datalistgrid.remove(s.datalistgrid[id_ss].department_code, "department_code");
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
    //*** VJA - 02/29/2020 - Convert date to String from 1 to 01 if less than 10
    //***********************************************************// 
    function datestring(d)
    {
        var date_val = ""
        if (d < 10) {
            date_val= '0' + d
        } else {
            date_val = d
        } 
        return date_val
    }

    //***********************************************************//
    //*** VJA - 02/29/2020 - Occure when save button is clicked and save/edit data
    //***********************************************************// 
    s.btn_save_click = function () {
        
        if (ValidateFields()) {
            var data =
            {
                payroll_year     : s.txtb_payroll_year
                ,payroll_month   : s.ddl_month
                , department_code: s.ddl_department
                , period_from    : $('#txtb_period_from').val()
                , period_to      : $('#txtb_period_to').val()
                , department_code: s.ddl_department
                , share_amt      : s.txtb_share_amt.replace(",","").replace(',','')
                ,med_perc        : s.txtb_med_perc
                ,nonmed_perc     : s.txtb_nonmed_perc
                ,ledger_status   : "N"
            };
            if (s.ADDEDITMODE == "ADD") {
                $('#i_save').removeClass('fa-save');
                $('#i_save').addClass('fa-spinner fa-spin');
                h.post("../cSSPHICLedger/SaveFromDatabase", {data : data}).then(function (d) {
                    if (d.data.message == "success")
                    {
                        var date_from = new Date($('#txtb_period_from').val());
                        var date_to = new Date($('#txtb_period_to').val());
                        var date_from_to = datestring(date_from.getMonth() + 1) + '/' + datestring(date_from.getDate()) + ' - ' + datestring(date_to.getMonth() + 1) + '/' + datestring(date_to.getDate()) + '/' + date_to.getFullYear();
                        
                        data.period_covered         = date_from_to
                        data.department_name1       = $("#ddl_department option:selected").html()
                        data.ledger_status_descr    = "NEW LEDGER"
                        data.share_amt              = s.txtb_share_amt.replace(",","").replace(',','')
                        
                        s.datalistgrid.push(data)
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid);

                        for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                            if (get_page(s.ddl_department) == false) {
                                s.oTable.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }

                        $('#main_modal').modal("hide");
                        swal("Your record has been saved!", { icon: "success", });
                    }
                    else
                    {
                        swal(d.data.message, { icon: "error", });
                    }

                    $('#i_save').removeClass('fa-spinner fa-spin');
                    $('#i_save').addClass('fa-save');
                });
            }
            else if (s.ADDEDITMODE == "EDIT") {
                $('#i_save').removeClass('fa-save');
                $('#i_save').addClass('fa-spinner fa-spin');

                h.post("../cSSPHICLedger/UpdateFromDatabase", { data: data }).then(function (d) {
                    if (d.data.message == "success") {
                        
                        var date_from = new Date($('#txtb_period_from').val());
                        var date_to = new Date($('#txtb_period_to').val());
                        var date_from_to = datestring(date_from.getMonth() + 1) + '/' + datestring(date_from.getDate()) + ' - ' + datestring(date_to.getMonth() + 1) + '/' + datestring(date_to.getDate()) + '/' + date_to.getFullYear();

                        var index_of_row = $('#btn_save').attr('ngx-data');
                        s.datalistgrid[index_of_row].department_name1   = $("#ddl_department option:selected").html()
                        s.datalistgrid[index_of_row].share_amt          = s.txtb_share_amt.replace(",","")
                        s.datalistgrid[index_of_row].med_perc           = s.txtb_med_perc
                        s.datalistgrid[index_of_row].nonmed_perc        = s.txtb_nonmed_perc
                        s.datalistgrid[index_of_row].period_covered     = date_from_to
                        
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid);

                        for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                            if (get_page(s.ddl_department) == false) {
                                s.oTable.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }

                        $('#main_modal').modal("hide");
                        swal("Your record has been saved!", { icon: "success", });
                        
                    }
                    else {
                        swal(d.data.message, { icon: "error", });
                    }

                    $('#i_save').removeClass('fa-spinner fa-spin');
                    $('#i_save').addClass('fa-save');
                });
            }
        }
    }
    //***********************************************************//
    //*** VJA - 02/29/2020 - Get Page Row
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
    
    //***********************************************************//
    //*** VJA - 02/29/2020 - Clear All Textboxes and Dropdownlist
    //***********************************************************// 
    function ClearEntry()
    {
        s.txtb_payroll_year     = "";
        s.txtb_payroll_month    = "";
        s.txtb_department       = "";
        s.ddl_department        = "";
        s.txtb_share_amt        = "0.00";
        s.txtb_med_perc         = "";
        s.txtb_nonmed_perc      = "";

        s.txtb_period_from      = "";
        s.txtb_period_to        = "";

    }

    //***********************************************************//
    //***VJA - 02/29/2020 -  Field validation everytime generation 
    //                          button is click ***//
    //***********************************************************// 
    function ValidateFields() {
        var return_val = true;

        ValidationResultColor("ALL", false);
        if ($('#ddl_department').val() == "" && s.ADDEDITMODE == "ADD") {
            ValidationResultColor("ddl_department", true);
            return_val = false;
        }
        if ($('#txtb_share_amt').val().trim().replace(",", "") == "") {
            ValidationResultColor("txtb_share_amt", true);
            return_val = false;
        } else if (checkisvalidnumber($('#txtb_share_amt').val().trim()) == false) {
            $("#txtb_share_amt").addClass("required");
            $("#lbl_txtb_share_amt_req").text("Invalid Numeric value");
            return_val = false;
        } else if (parseFloat($('#txtb_share_amt').val().trim()) <= 0) {
            ValidationResultColor("txtb_share_amt", true);
            $("#lbl_txtb_share_amt_req").text("Less than or equal to Zero(0) value");
            return_val = false;
        }
        if ($('#txtb_med_perc').val() == "") {
            ValidationResultColor("txtb_med_perc", true);
            return_val = false;
        } else if (checkisvalidnumber($('#txtb_med_perc').val().trim()) == false) {

            ValidationResultColor("txtb_med_perc", true);
            $("#lbl_txtb_med_perc_req").text("Invalid Numeric value");
            return_val = false;
        }
        if ($('#txtb_nonmed_perc').val() == "") {
            ValidationResultColor("txtb_nonmed_perc", true);
            return_val = false;
        } else if (checkisvalidnumber($('#txtb_nonmed_perc').val().trim()) == false) {

            ValidationResultColor("txtb_nonmed_perc", true);
            $("#lbl_txtb_nonmed_perc_req").text("Invalid Numeric value");
            return_val = false;
        }
        if ($('#txtb_period_from').val() == "") {
            ValidationResultColor("txtb_period_from", true);
            return_val = false;
        } else if (checkisdate($('#txtb_period_from').val().trim()) == false) {

            ValidationResultColor("txtb_period_from", true);
            $("#lbl_txtb_period_from_req").text("Invalid Date Format");
            return_val = false;
        }
        if ($('#txtb_period_to').val() == "") {
            ValidationResultColor("txtb_period_to", true);
            return_val = false;
        } else if (checkisdate($('#txtb_period_to').val().trim()) == false) {

            ValidationResultColor("txtb_period_to", true);
            $("#lbl_txtb_period_to_req").text("Invalid Date Format");
            return_val = false;
        }
        if (Date.parse($('#txtb_period_from').val().trim()) > Date.parse($('#txtb_period_to').val().trim())) {
            ValidationResultColor("txtb_period_from", true);
            ValidationResultColor("txtb_period_to", true);
            $("#lbl_txtb_period_to_req").text("Date From is greater than Date To");
            $("#lbl_txtb_period_from_req").text("Date From is greater than Date To");
            return_val = false;
        }
        if (parseFloat(s.txtb_med_perc) >= 100 || parseFloat(s.txtb_nonmed_perc) >= 100)
        {
            ValidationResultColor("txtb_med_perc", true);
            $("#lbl_txtb_med_perc_req").text("More that 100%");
            ValidationResultColor("txtb_nonmed_perc", true);
            $("#lbl_txtb_nonmed_perc_req").text("More that 100%");
            return_val = false;
        }
        
        return return_val;
    }
    

    //***********************************************************//
    //***VJA - 02/29/2020 - Field validation everytime generation 
    //                      button is click ***//
    //***********************************************************// 
    function ValidationResultColor(par_object_id, par_v_result) {
        if (par_v_result) {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else {
            //remove of refresh the object form being required
            $("#ddl_department").removeClass("required");
            $("#lbl_ddl_department_req").text("");

            $("#txtb_share_amt").removeClass("required");
            $("#lbl_txtb_share_amt_req").text("");

            $("#txtb_med_perc").removeClass("required");
            $("#lbl_txtb_med_perc_req").text("");

            $("#txtb_nonmed_perc").removeClass("required");
            $("#lbl_txtb_nonmed_perc_req").text("");

            $("#txtb_period_from").removeClass("required");
            $("#lbl_txtb_period_from_req").text("");

            $("#txtb_period_to").removeClass("required");
            $("#lbl_txtb_period_to_req").text("");
            
        }
    }
    Array.prototype.delete = function (code) {
        return this.filter(function (d, k) {
            return k != code
        })
    }
    //***********************************************************//
    //***VJA - 02/29/2020 - Occure when value change
    //***********************************************************// 
    //s.set_empl_name_index = function (par_voucher_index) {
    //    if (par_voucher_index != "")
    //    {
    //        s.txtb_empl_id          = s.emplist[par_voucher_index].empl_id;
    //        s.txtb_department_name  = s.emplist[par_voucher_index].department_name1;
    //        s.txtb_position         = s.emplist[par_voucher_index].position_long_title;
    //        s.lbl_rate_descr        = s.emplist[par_voucher_index].salary_rate_descr;
    //        s.txtb_rate_amount      = currency(s.emplist[par_voucher_index].salary_rate_amt);
    //    }
    //    else
    //    {
    //        s.txtb_empl_id            = "";
    //        s.txtb_department_name    = "";
    //        s.txtb_position           = "";
    //        s.lbl_rate_descr          = "Rate Amount:";
    //        s.txtb_rate_amount        = "0.00";
    //    }
    //}
    //***********************************************************//
    //***VJA - 02/29/2020 - Convert The Currency to 0,000,000.00 format
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
    //*** VJA - 02/29/2020 - Occure when value change
    //***********************************************************// 
    s.select_ddl_group = function () {
        
        h.post("../cSSPHICLedger/RetieveGrid",
            {
                p_payroll_year      : s.ddl_year
                ,p_payroll_month    : s.ddl_month
            }
        ).then(function (d) {
            // if (d.data.listgrid.length > 0) {
            //     s.datalistgrid = d.data.listgrid;
            //     s.oTable.fnClearTable();
            //     s.oTable.fnAddData(d.data.listgrid)
            // }
            // else {
            //     s.oTable.fnClearTable();
            // }

            s.datalistgrid = d.data.listgrid;
            s.datalistgrid.refreshTable('oTable', '');

        });
    }
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
    //***********************************//
    //***VJA - 02/29/2020 - Remove Function****//
    //***********************************// 
    Array.prototype.remove = function (code, prop) {
        return this.filter(function (d) {
            return d[prop] != code
        })
    }
    //******************************************//
    //***VJA - 02/29/2020 - Remove Function****//
    //****************************************//
    s.btn_generate_click = function ()
    {  
        // ***** LEDGER STATUS DESCRIPTION - ledger_status 
        // ** Status that CAN be Reprocess
        // ** W - With Payroll 
        // ** T - With Return Payrolls     
        // ** X - With Voided Payrolls
        // *******************************************
        // ** Status that CANNOT be Reprocess
        // ** R - With Released Payrolls
        // ** Y - With Partial Return Payrolls
        // ** Z - With Partial Voided Payrolls
        // *******************************************

        if (s.ADDEDITMODE == "ADD")
        {
            swal("You cannot Generate During Add !", "Save the data and Generate", { icon: "warning" })
        }
        else if (s.ADDEDITMODE == "EDIT") {
            $('#i_generate').addClass('fa-spinner fa-spin');
            $('#i_generate').removeClass('fa-qrcode');
            h.post("../cSSPHICLedger/CheckIfExecuteGenerate",
                {
                    p_payroll_year: s.ddl_year
                    , p_payroll_month: s.ddl_month
                    , p_department_code: s.ddl_department
                }).then(function (d)
                {                                              // STATUS CAN REPROCESS
                    if (d.data.data[0].ledger_status == "W" || // With Payroll 
                        d.data.data[0].ledger_status == "T" || // With Return Payrolls 
                        d.data.data[0].ledger_status == "X")   // With Voided Payrolls
                    {
                        if (d.data.message == "success") {
                            swal({
                                title: "Are you sure you want to Generate and Delete existing record?",
                                text: "Once generated and deleted, you will not be able to recover the existing record!",
                                icon: "warning",
                                buttons: true,
                                dangerMode: false,

                            })
                                .then(function (willDelete) {
                                    if (willDelete) {
                                        h.post("../cSSPHICLedger/ExecuteGenerate",
                                            {
                                                p_payroll_year: s.ddl_year
                                                , p_payroll_month: s.ddl_month
                                                , p_department_code: s.ddl_department
                                                , p_delete_existing: true

                                            }).then(function (d) {

                                                if (d.data.message == "success") {
                                                    // return_flag  | return_flag_descr    
                                                    //      Y -     |   Payroll Registry Successfully Generated
                                                    //      0 -     |   No Data found, Payroll Registry not Generated  
                                                    //      N -     |   Payroll Registry Not Generated, SP Error

                                                    var icon_message = "";

                                                    if (d.data.data[0].return_flag == "Y") {
                                                        icon_message = "success";
                                                    }
                                                    else if (d.data.data[0].return_flag == "0") {
                                                        icon_message = "warning";
                                                    } else {
                                                        icon_message = "error";
                                                    }

                                                    if (d.data.data[0].return_flag == "Y") {
                                                        h.post("../cSSPHICLedger/RetieveGrid",
                                                            {
                                                                p_payroll_year: s.ddl_year
                                                                , p_payroll_month: s.ddl_month
                                                            }
                                                        ).then(function (d) {
                                                            if (d.data.listgrid.length > 0) {
                                                                s.datalistgrid = d.data.listgrid;
                                                                s.oTable.fnClearTable();
                                                                s.oTable.fnAddData(d.data.listgrid)
                                                            }
                                                            else {
                                                                s.oTable.fnClearTable();
                                                            }

                                                        });
                                                    }

                                                    swal(d.data.data[0].return_flag_descr, { icon: icon_message, });
                                                }
                                                else {
                                                    swal(d.data.message, "Data not Generated ", "error");
                                                }
                                                $('#main_modal').modal('hide');
                                                $('#i_generate').removeClass('fa-spinner fa-spin');
                                                $('#i_generate').addClass('fa-qrcode');

                                            })
                                    }
                                });
                        }
                    } else if (d.data.data[0].ledger_status == "N") {
                        $('#i_generate').addClass('fa-spinner fa-spin');
                        $('#i_generate').removeClass('fa-qrcode');
                        h.post("../cSSPHICLedger/ExecuteGenerate",
                            {
                                p_payroll_year: s.ddl_year
                                , p_payroll_month: s.ddl_month
                                , p_department_code: s.ddl_department
                                , p_delete_existing: true

                            }).then(function (d) {

                                if (d.data.message == "success") {
                                    // return_flag  | return_flag_descr    
                                    //      Y -     |   Payroll Registry Successfully Generated
                                    //      0 -     |   No Data found, Payroll Registry not Generated  
                                    //      N -     |   Payroll Registry Not Generated, SP Error

                                    var icon_message = "";

                                    if (d.data.data[0].return_flag == "Y") {
                                        icon_message = "success";
                                    }
                                    else if (d.data.data[0].return_flag == "0") {
                                        icon_message = "warning";
                                    } else {
                                        icon_message = "error";
                                    }

                                    if (d.data.data[0].return_flag == "Y") {
                                        h.post("../cSSPHICLedger/RetieveGrid",
                                            {
                                                p_payroll_year: s.ddl_year
                                                , p_payroll_month: s.ddl_month
                                            }
                                        ).then(function (d) {
                                            if (d.data.listgrid.length > 0) {
                                                s.datalistgrid = d.data.listgrid;
                                                s.oTable.fnClearTable();
                                                s.oTable.fnAddData(d.data.listgrid)
                                            }
                                            else {
                                                s.oTable.fnClearTable();
                                            }

                                        });
                                    }

                                    swal(d.data.data[0].return_flag_descr, { icon: icon_message, });
                                }
                                else
                                {
                                    swal(d.data.message, "Data not Generated ", "error");
                                }
                                $('#main_modal').modal('hide');
                                $('#i_generate').removeClass('fa-spinner fa-spin');
                                $('#i_generate').addClass('fa-qrcode');
                            })
                    }
                    else
                    {
                           // *******************************************
                           // ** Status that CANNOT be Reprocess
                           // ** R - With Released Payrolls
                           // ** Y - With Partial Return Payrolls
                           // ** Z - With Partial Voided Payrolls
                           // *******************************************
                        swal("Ledger Cannot Re-Process or Re-Generate","Status Already "+ d.data.data.ledger_status_descr +" ", {icon:"waring"})
                    }
                    
                })
        }
    }
    //***********************************************************//
    //*** VJA - 02/27/2020 - Reject or Check if Date
    //***********************************************************// 
    function checkisdate(d) {
        // Regex 1 - This will match yyyy-mm-dd and also yyyy-m-d:
        var regex1 = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;
        // Regex 2 - If you're looking for an exact match for yyyy-mm-dd then try this
        var regex2 = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
        // Regex 3 - or use this one if you need to find a date inside a string like The date is 2017-11-30
        var regex3 = /\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])*/;

        var istrue = false;
        if (regex1.test(d) == true ||
            regex2.test(d) == true ||
            regex3.test(d) == true) {
            istrue = true;
        } else {
            istrue = false;
        }
        return istrue;

    }
    //************************************************//
    //***VJA - 02/29/2020 - Validation for Nunber****//
    //**********************************************//
    function checkisvalidnumber(i) {
        var regex_spchar = /[^a-zA-Z0-9\s]\,\./;
        var regex_upper = /[A-Z]/;
        var regex_lower = /[a-z]/;
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
    //***VJA - 02/29/2020 - Calculate Percentage****//
    //**********************************************//
    s.CalculatePercentage = function()
    {
        ValidationResultColor("ALL", false);
        var percentage = 100;
        if (parseFloat(s.txtb_med_perc) >= percentage)
        {
            ValidationResultColor("txtb_med_perc", true);
            $("#lbl_txtb_med_perc_req").text("More that 100%");
        }
        s.txtb_nonmed_perc = percentage - parseFloat(s.txtb_med_perc) 
    }
    //************************************************//
    //***VJA - 02/29/2020 - Calculate Percentage****//
    //**********************************************//
    s.CalculatePercentage_Non = function ()
    {
        ValidationResultColor("ALL", false);
        var percentage = 100;
        if (parseFloat(s.txtb_nonmed_perc) >= percentage)
        {
            ValidationResultColor("txtb_nonmed_perc", true);
            $("#lbl_txtb_nonmed_perc_req").text("More that 100%");
        }
        s.txtb_med_perc = percentage - parseFloat(s.txtb_nonmed_perc)
    }
});