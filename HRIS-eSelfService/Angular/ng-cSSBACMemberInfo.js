//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for BAC Members Information
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// VINCENT JADE H. ALIVIO   04/02/2020      Code Creation
//**********************************************************************************
ng_selfService_App.controller("cSSBACMemberInfo_ctrl", function ($scope, $compile, $http, $filter) {
    var s = $scope;
    var h = $http;
    s.datalistgrid     = [];
    s.rowLen           = "10";
    s.um               = [];
    s.deplist          = [];

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
                        "mData": "empl_id",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": "employee_name",
                        "mRender": function (data, type, full, row) { return "<span style='padding-left:10px'>" + data + "</span>" }
                    },
                    {
                        "mData": "bac_position_descr",
                        "mRender": function (data, type, full, row) { return "<span style='padding-left:10px'>" + data + "</span>" }
                    },
                    {
                        "mData": "bac_allowance_amt",
                        "mRender": function (data, type, full, row) { return "<span class='text-right btn-block'>" + currency(data) + "</span>" }
                    },
                    {
                        "mData": "effective_date",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            
                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-success btn-sm" ng-show="um.allow_edit   == 1"  ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >' +
                                '<button type="button" class="btn btn-danger btn-sm"  ng-show="um.allow_delete == 1"  ng-click="btn_delete_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"> <i class="fa fa-trash"></i></button>' +
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
        
        init_table_data([]);
        $('#loading_msg').html("LOADING");
        $("#modal_loading").modal();
        h.post("../cSSBACMemberInfo/InitializePage", {
            par_include_history :   'N'
        }).then(function (d)
        {
            s.deplist = d.data.deplist;
            s.um = d.data.um;
            s.datalistgrid = d.data.data;
            s.datalistgrid.refreshTable('oTable', '');
            $("#modal_loading").modal('hide');
        })
    }
    init()

    //*********************************************//
    //*** VJA - 2020-04-03 - Clear Entry
    //*********************************************// 
    function ClearEntry() {
        ValidationResultColor("ALL", false);

        s.ddl_department        = "";
        s.txtb_empl_name        = "";
        s.ddl_empl_name         = "";
        s.txtb_empl_id          = "";
        s.txtb_effective_date   = "";
        s.ddl_rcrd_status       = "";
        s.txtb_allowance_amt    = "";
        s.ddl_pos_class         = "";
        s.txtb_position         = "";
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
        s.empl_name           = true
        s.show_effective_date = true
        s.isdisable           = true
        s.ddl_pos_class       = "M";
        $('#main_modal').modal({ keyboard: false, backdrop: "static" });
        
    }
    //*********************************************//
    //*** VJA - 2020-04-03 - Button Edit Action
    //*********************************************// 
    s.btn_edit_action = function (lst)
    {
        $('#btn_save').attr('ngx-data', lst);
        ClearEntry();
        s.isdisable = false
        s.empl_name = false
        s.show_effective_date = false
        s.txtb_effective_date = s.datalistgrid[lst].effective_date    
        s.txtb_empl_id        = s.datalistgrid[lst].empl_id           
        s.txtb_empl_name      = s.datalistgrid[lst].employee_name           
        s.txtb_position       = s.datalistgrid[lst].bac_position_descr
        s.ddl_pos_class       = s.datalistgrid[lst].bac_position_class
        s.txtb_allowance_amt  = currency(s.datalistgrid[lst].bac_allowance_amt)
        s.ddl_rcrd_status     = s.datalistgrid[lst].rcrd_status    == true ? "1" : "0"   
        
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
                effective_date: $('#txtb_effective_date').val()
                , empl_id: s.txtb_empl_id
                , bac_position_descr: s.txtb_position
                , bac_position_class: s.ddl_pos_class
                , bac_allowance_amt: $('#txtb_allowance_amt').val().trim().replace(',', '').replace(',', '')
                , rcrd_status: $('#ddl_rcrd_status').val().trim() == "1" ? true : false

            };

            if (s.ADDEDITMODE == "ADD") {
                $('#i_save').removeClass('fa-save');
                $('#i_save').addClass('fa-spinner fa-spin');
                h.post("../cSSBACMemberInfo/SaveFromDatabase", { data: data }).then(function (d) {
                    if (d.data.message == "success") {

                        h.post("../cSSBACMemberInfo/RetreiveDataGrid", {
                            par_include_history: s.chk_include_history == true ? 'Y' : 'N'
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
                            // s.ddl_last_name = $('#txtb_student_lname').val().trim().substring(0, 1).toUpperCase();
                            s.datalistgrid.push(data)
                            for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                                if (get_page(s.txtb_student_id) == false) {
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

                    $('#i_save').addClass('fa-save');
                    $('#i_save').removeClass('fa-spinner fa-spin');
                });
            }
            else if (s.ADDEDITMODE == "EDIT") {
                $('#i_save').removeClass('fa-save');
                $('#i_save').addClass('fa-spinner fa-spin');

                h.post("../cSSBACMemberInfo/UpdateFromDatabase", { data: data }).then(function (d) {
                    if (d.data.message == "success") {

                        var index_of_row = $('#btn_save').attr('ngx-data');
                        s.datalistgrid[index_of_row].effective_date = s.txtb_effective_date
                        s.datalistgrid[index_of_row].empl_id = s.txtb_empl_id
                        s.datalistgrid[index_of_row].bac_position_descr = s.txtb_position
                        s.datalistgrid[index_of_row].bac_position_class = s.ddl_pos_class
                        s.datalistgrid[index_of_row].bac_allowance_amt = $('#txtb_allowance_amt').val().trim().replace(',', '').replace(',', '')
                        s.datalistgrid[index_of_row].rcrd_status = s.ddl_rcrd_status == '1' ? true : false

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
                    h.post("../cSSBACMemberInfo/DeleteFromDatabase",
                        {
                            par_empl_id: s.datalistgrid[id_ss].empl_id,
                            par_effective_date: s.datalistgrid[id_ss].effective_date,

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
        if (($('#ddl_empl_name').val() == "" && s.ADDEDITMODE == "ADD") && $('#ddl_department').val() == "")
        {
            ValidationResultColor("ddl_department", true);
            $("#ddl_department").addClass("required");
            $("#lbl_ddl_department_req").text("You need to Select Department");
            return_val = false;
        } else if ($('#ddl_empl_name').val() == "" && s.ADDEDITMODE == "ADD") {
            ValidationResultColor("ddl_empl_name", true);
            return_val = false;
        }
        if ($('#txtb_effective_date').val() == "") {
            ValidationResultColor("txtb_effective_date", true);
            return_val = false;
        } else if (checkisdate($('#txtb_effective_date').val()) == false) {
            ValidationResultColor("txtb_effective_date", true);
            $("#txtb_effective_date").addClass("required");
            $("#lbl_txtb_effective_date_req").text("Invalid Date ");
            return_val = false;
        }
        if ($('#ddl_rcrd_status').val() == "") {
            ValidationResultColor("ddl_rcrd_status", true);
            return_val = false;
        } 
        if ($('#txtb_allowance_amt').val() == "") {
            ValidationResultColor("txtb_allowance_amt", true);
            return_val = false;
        } else if (checkisvalidnumber($('#txtb_allowance_amt').val()) == false)
        {
            ValidationResultColor("txtb_allowance_amt", true);
            $("#txtb_allowance_amt").addClass("required");
            $("#lbl_txtb_allowance_amt_req").text("Invalid Numeric Value ");
            return_val = false;
        } 
        if ($('#ddl_pos_class').val() == "") {
            ValidationResultColor("ddl_pos_class", true);
            return_val = false;
        }
        if ($('#txtb_position').val() == "") {
            ValidationResultColor("txtb_position", true);
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
            $("#ddl_empl_name").removeClass("required");
            $("#lbl_ddl_empl_name_req").text("");

            $("#txtb_effective_date").removeClass("required");
            $("#lbl_txtb_effective_date_req").text("");

            $("#ddl_rcrd_status").removeClass("required");
            $("#lbl_ddl_rcrd_status_req").text("");

            $("#txtb_allowance_amt").removeClass("required");
            $("#lbl_txtb_allowance_amt_req").text("");

            $("#ddl_pos_class").removeClass("required");
            $("#lbl_ddl_pos_class_req").text("");
            
            $("#txtb_position").removeClass("required");
            $("#lbl_txtb_position_req").text("");

            $("#ddl_department").removeClass("required");
            $("#lbl_ddl_department_req").text("");
        }
    }
    //**************************************************************//
    //*** VJA - 2020-04-03 - On-Change on Dropdownlist for Department
    //**************************************************************//
    s.set_department_index = function (par_index)
    {
        if (par_index != "")
        {
            h.post("../cSSBACMemberInfo/RetrieveEmpl", {
                par_department_code: s.deplist[par_index].department_code
            }).then(function (d)
            {
                s.emplist = d.data.emplist
            });
        }
        else
        {
            s.emplist = [];
            s.txtb_empl_id = "";
        }
    }
    //******************************************************************//
    //*** VJA - 2020-04-03 - On-Change on Dropdownlist for Employee Name
    //*****************************************************************//
    s.set_empl_name_index = function (par_index)
    {
        if (par_index != "")
        {
            s.txtb_empl_id = s.emplist[par_index].empl_id
        }
        else {
            s.txtb_empl_id = "";
        }
    }
    //******************************************************************//
    //*** VJA - 2020-04-03 - Include History
    //*****************************************************************//
    s.click_include_history = function () {
        h.post("../cSSBACMemberInfo/RetreiveDataGrid", {
            par_include_history: s.chk_include_history == true ? 'Y' : 'N'
        }).then(function (d) {
            s.datalistgrid = d.data.data;
            s.datalistgrid.refreshTable('oTable', '');
        });
    }
    
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
    //***VJA - 03/11/2020 - Convert The Currency to 0,000,000.00 format
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
});