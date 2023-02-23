/*
 * Script created By:       Vincent Jade H. Alivio
 * Script created On:       2020-08-11
 * Purpose of this Script:  
 *                          
 */
ng_selfService_App.controller("cSSPHICShareAddEmpl_ctrlr", function ($scope, $compile, $http, $filter) {
    var s                       = $scope;
    var h                       = $http;
    s.rowLen                    = "10";
    s.datalistgrid              = null;

    s.grouplist             = [];
    s.emplist               = [];
    s.ddl_group_code        = "";
    s.ddl_empl_name         = "";
    s.ddl_status            = "1"
    s.empl_name_disabled    = true;
    s.rate_amount_disabled  = true;
    s.ddl_entry_type        = "E";
    // ******************************************
    // * VJA - 02/27/2020 - Initialized page
    // ****************************************** 
    function init()
    {
        $('#loading_msg').html("LOADING");
        $("#modal_loading").modal({ keyboard: false, backdrop: "static" });
        h.post("../cSSPHICShareAddEmpl/InitializeData").then(function (d) {

            s.grouplist      = d.data.grouplist;
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
                    { "mData": "empl_id", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "employee_name" },
                    { "mData": "position_long_title" },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            console.log(full);
                            var editable = false;
                            var deletable = s.ddl_entry_type == "N" ? true:false;
                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-success btn-sm" ng-disabled="' + editable + '" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit Entry">  <i class="fa fa-edit"></i></button >' +
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
    // * VJA - 02/27/2020 - Search
    // ****************************************** 
    s.search_in_list = function (value, table) {
        $("#" + table).DataTable().search(value).draw();
    }
    // ******************************************
    // * VJA - 02/27/2020 - Set the Number of Row
    // ****************************************** 
    s.setNumOfRow = function (value, table) {
        $("#" + table).DataTable().page.len(value).draw();
    }
    function show_date() {
        $('.datepicker').datepicker({ format: 'yyyy-mm-dd' });
    }

    //***********************************************************//
    //*** VJA - 02/27/2020 - Occure when add button is clicke
    //                      d and initialize the objects
    //***********************************************************// 
    s.btn_add_click = function ()
    {
        s.show_in_add = true;
        s.show_in_edit = false;

        $('#i_save').addClass('fa-save');
        $('#i_save').removeClass('fa-spinner fa-spin');
        ClearEntry();
        s.ddl_entry_type_change();
        //s.ddl_entry_type        = "E";
        s.ModalTitle            = "Add New Record";
        //s.empl_name             = true;
        //s.empl_name_editable    = true;ddl_entry_type_change
        ValidationResultColor("ALL", false);
        s.ADDEDITMODE = "ADD";

        s.iseffective_disable_inable = false;

        var today = new Date();
        s.txtb_effective_date = today.toISOString().substring(0, 10);
        s.isdisable             = true;
        s.show_effective_date   = true;

        if (s.ddl_entry_type == "N") {
            GenerateNonEmployee_id();
        }
        if (s.ddl_group_code == "")
        {
            swal("You need to Select Group Description", { icon: "warning" })
        } else
        {
            //$("#modal_loading").modal({ keyboard: false, backdrop: "static" });
            h.post("../cSSPHICShareAddEmpl/RetrieveEmployee",
                {
                    p_group_code: s.ddl_group_code
                }).then(function (d) {
                    if (d.data.message == "success")
                    {
                        s.emplist = d.data.emplist
                        // s.txtb_department_name = $('#ddl_department option:selected').text()
                        $('#main_modal').modal({ keyboard: false, backdrop: "static" });
                    }
                    else
                    {
                        swal(d.data.message, { icon: "error", });
                    }
                })

            
        }
        
    }

    //***********************************************************//
    //*** VJA - 02/27/2020 - Edit Action Occurred function click
    //***********************************************************// 
    s.btn_edit_action = function (row_index) {
        ClearEntry();
        $('#btn_save').attr('ngx-data', row_index);
        ValidationResultColor("ALL", false);
        s.show_in_add                   = false;
        s.show_in_edit                  = true;
        s.empl_name                     = false;
        s.ADDEDITMODE                   = "EDIT";
        s.ModalTitle                    = "Edit Record";
        s.isdisable                     = false;
        s.show_effective_date           = false
        s.iseffective_disable_inable    = true;
        ClearEntry();
        
        s.txtb_empl_name            = s.datalistgrid[row_index].employee_name;
        s.txtb_empl_id              = s.datalistgrid[row_index].empl_id;
        
        s.txtb_position             = s.datalistgrid[row_index].position_long_title;
        s.txtb_rate_amount          = currency(s.datalistgrid[row_index].salary_rate_amt);
        s.lbl_rate_descr            = s.ddl_entry_type == "N" ? "Rate ":s.datalistgrid[row_index].salary_rate_descr;
        s.txtb_effective_date       = s.datalistgrid[row_index].effective_date;
        
        $('#main_modal').modal({ keyboard: false, backdrop: "static" });

    }

    //***********************************************************//
    //*** VJA - 02/27/2020 -  Edit Action Occurred function click
    //***********************************************************// 
    s.btn_delete_row = function (id_ss) {
        var dt = null;
        dt = s.datalistgrid[id_ss]
        swal({
            title: "Are you sure to delete this record?",
            text: "Once deleted, you will not be able to recover this record! '" + id_ss +"'",
            icon: "warning",
            buttons: true,
            dangerMode: true,

        })
            .then(function (willDelete) {
                if (willDelete) {
                    h.post("../cSSPHICShareAddEmpl/DeleteFromDatabase",
                        {
                            par_empl_id         : s.datalistgrid[id_ss].empl_id,
                            p_group_code        : s.ddl_group_code
                        }).then(function (d) {

                            if (d.data.message == "success")
                            {
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
    //*** VJA - 02/27/2020 - Edit Action Occurred function click
    //***********************************************************// 
    s.ddl_entry_type_change = function ()
    {
        s.txtb_rate_amount  = "0.00";
        s.ddl_empl_name     = "";
        s.ddl_empl_name     = "";
        s.txtb_position     = "";
        ValidationResultColor("ALL", false);
        h.post("../cSSPHICShareAddEmpl/RetieveGrid",
            {
                p_group_code: s.ddl_group_code,
                p_empl_type: s.ddl_entry_type
            }
        ).then(function (d) {
            if (d.data.listgrid.length > 0) {
                s.datalistgrid = d.data.listgrid;
                s.oTable.fnClearTable();
                s.oTable.fnAddData(d.data.listgrid)
                $('#modal_loading').modal('hide');
            }
            else {
                s.oTable.fnClearTable();
                $('#modal_loading').modal('hide');
            }

        });
        if (s.ddl_entry_type == "N")
        {
            s.empl_name             = false;
            s.empl_name_disabled    = false;
            s.rate_amount_disabled  = false;
        }
        else
        {
            ValidationResultColor("ALL", false);
            s.empl_name             = true;
            s.empl_name_disabled    = true;
            s.rate_amount_disabled  = true;
          
        }
    }

    //***********************************************************//
    //*** JMTJR - 05/28/2020 - Convert date to String from 1 to 01 if less than 10
    //***********************************************************// 
    function GenerateNonEmployee_id()
    {
        h.post("../cSSPHICShareAddEmpl/GenerateNonEmployee").then(function (d) {
            if (d.data.message == "success") {
                s.txtb_empl_id = d.data.non_employee_id;
            }
            else {
                swal(d.data.message, "Data not deleted", "error");
            }

        })
    }

    
    //***********************************************************//
    //*** VJA - 02/27/2020 - Convert date to String from 1 to 01 if less than 10
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
    //*** VJA - 02/27/2020 - Occure when save button is clicked and save/edit data
    //***********************************************************// 
    s.btn_save_click = function () {
        if (ValidateFields()) {
            var data =
            {
                empl_id               : s.txtb_empl_id
                ,group_code           : s.ddl_group_code
                ,position_long_title  : s.txtb_position
                ,rcrd_status          : s.ddl_status == "1"     ? true : false
                ,rate_amount          : s.txtb_rate_amount.replace(',','').replace(',','')
                ,employee_name        : s.ddl_entry_type == "N" ? s.txtb_empl_name:  $("#ddl_empl_name option:selected").html()
                ,empl_type            : s.ddl_entry_type
            };

            // console.log(data)
            // return;
            if (s.ADDEDITMODE == "ADD") {
                $('#i_save').removeClass('fa-save');
                $('#i_save').addClass('fa-spinner fa-spin');
                h.post("../cSSPHICShareAddEmpl/SaveFromDatabase", {data : data}).then(function (d) {
                    if (d.data.message == "success")
                    {
                        h.post("../cSSPHICShareAddEmpl/RetieveGrid",
                            {
                                p_group_code: s.ddl_group_code,
                                p_empl_type: s.ddl_entry_type
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
                            //data.employee_name       = $("#ddl_empl_name option:selected").html()
                            //data.position_long_title = s.txtb_position
                            //data.rcrd_status         = s.ddl_status 
                            //s.datalistgrid.push(data)
                            
                            for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                                if (get_page(s.txtb_empl_id) == false) {
                                    s.oTable.fnPageChange(x);
                                }
                                else {
                                    break;
                                }
                            }

                            $('#main_modal').modal("hide");
                            swal("Your record has been saved!", { icon: "success", });
                        });
                    }
                    else
                    {
                        swal(d.data.message, { icon: "error", });
                    }

                    $('#i_save').addClass('fa-save');
                    $('#i_save').removeClass('fa-spinner fa-spin');
                });
            }
            else if (s.ADDEDITMODE == "EDIT")
            {
                $('#i_save').removeClass('fa-save');
                $('#i_save').addClass('fa-spinner fa-spin');

                h.post("../cSSPHICShareAddEmpl/UpdateFromDatabase", { data: data }).then(function (d)
                {
                    if (d.data.message == "success")
                    {
                        
                        var index_of_row = $('#btn_save').attr('ngx-data');

                        
                        s.datalistgrid[index_of_row].position_long_title = s.txtb_position;
                        s.datalistgrid[index_of_row].employee_name       = s.txtb_empl_name;
                        s.datalistgrid[index_of_row].salary_rate_amt     = s.txtb_rate_amount.replace(',','').replace(',','');
                        
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
                        swal("Your record has been saved!", { icon: "success", });
                        
                    }
                    else {
                        swal(d.data.message, { icon: "error", });
                    }

                    $('#i_save').addClass('fa-save');
                    $('#i_save').removeClass('fa-spinner fa-spin');
                });
            }
        }

    }
    
    //function setUpdatedData(row_id, saved_data) {
    //    s.datalistgrid[row_id].summary_total        = saved_data.summary_total;
    //    s.datalistgrid[row_id].batch_description    = saved_data.batch_description;

    //}

    //***********************************************************//
    //*** VJA - 02/27/2020 - Get Page Row
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
    //*** VJA - 02/27/2020 - Clear All Textboxes and Dropdownlist
    //***********************************************************// 
    function ClearEntry()
    {
        s.txtb_empl_name         = "";
        s.ddl_empl_name          = "";
        s.txtb_empl_id           = "";
        s.txtb_department_name   = "";
        s.txtb_position          = "";
        s.txtb_rate_amount       = "0.00";
        s.lbl_rate_descr         = "Rate Amount";
        s.txtb_effective_date    = "";
        s.txtb_period_from       = "";
        s.txtb_period_to         = "";
        s.txtb_empl_no_share     = "0";
    }

    //***********************************************************//
    //***VJA - 02/27/2020 -  Field validation everytime generation 
    //                          button is click ***//
    //***********************************************************// 
    function ValidateFields() {
        var return_val = true;
        var regex_prop_number = /^\d*\.?\d*$/;
        ValidationResultColor("ALL", false);
        if ($('#ddl_empl_name').val() == "" && s.ADDEDITMODE == "ADD" && s.ddl_entry_type =="E")
        {
            ValidationResultColor("ddl_empl_name", true);
            return_val = false;
        }

        if (s.ddl_entry_type == "N" && s.ADDEDITMODE == "ADD" && s.txtb_empl_name.trim() == "")
        {
            ValidationResultColor("txtb_empl_name", true);
            return_val = false;
        }

        if (s.ddl_entry_type == "N" && s.txtb_empl_name.trim() == "")
        {
            ValidationResultColor("txtb_empl_name", true);
            return_val = false;
        }

        if (s.ddl_entry_type == "N" && s.txtb_rate_amount.trim() == "")
        {
            ValidationResultColor("txtb_rate_amount", true);
            return_val = false;
        }

        if (s.ddl_entry_type == "N" && s.txtb_position.trim() == "")
        {
            ValidationResultColor("txtb_position", true);
            return_val = false;
        }

        return return_val;
    }

    //***********************************************************//
    //***VJA - 02/27/2020 - Field validation everytime generation 
    //                      button is click ***//
    //***********************************************************// 
    function ValidationResultColor(par_object_id, par_v_result) {
        if (par_v_result) {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field");
            if (par_object_id == "txtb_empl_name")
            {
                $("#lbl_ddl_empl_name_req").text("Required Field");
            }
        }
        else {
            //remove of refresh the object form being required
            $("#ddl_empl_name").removeClass("required");
            $("#lbl_ddl_empl_name_req").text("");

            $("#txtb_empl_name").removeClass("required");
            $("#lbl_ddl_empl_name_req").text("");

            $("#txtb_effective_date").removeClass("required");
            $("#lbl_txtb_effective_date_req").text("");

            $("#txtb_rate_amount").removeClass("required");
            $("#lbl_txtb_rate_amount_req").text("");

            $("#txtb_position").removeClass("required");
            $("#lbl_txtb_position_req").text("");

            $("#txtb_empl_no_share").removeClass("required");
            $("#lbl_txtb_empl_no_share_req").text("");

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
    //***VJA - 02/27/2020 - Occure when value change
    //***********************************************************// 
    s.set_empl_name_index = function (par_voucher_index) {
        if (par_voucher_index != "")
        {
            s.txtb_empl_id          = s.emplist[par_voucher_index].empl_id;
            // s.txtb_department_name  = s.emplist[par_voucher_index].department_name1;
            s.txtb_position         = s.emplist[par_voucher_index].position_long_title;
            s.lbl_rate_descr        = s.emplist[par_voucher_index].salary_rate_descr;
            s.txtb_rate_amount      = currency(s.emplist[par_voucher_index].salary_rate_amt);
        }
        else
        {
            s.txtb_empl_id            = "";
            //s.txtb_department_name    = "";
            s.txtb_position           = "";
            s.lbl_rate_descr          = "Rate Amount";
            s.txtb_rate_amount        = "0.00";
        }
    }
    //***********************************************************//
    //***VJA - 02/27/2020 - Convert The Currency to 0,000,000.00 format
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
    //*** VJA - 02/27/2020 - Occure when value change
    //***********************************************************// 
    s.select_ddl_group = function () {
        if (s.ddl_group_code != "")
        {
            
            $('#modal_loading').modal({ keyboard: false });
            h.post("../cSSPHICShareAddEmpl/RetieveGrid",
                {
                    p_group_code: s.ddl_group_code,
                    p_empl_type: s.ddl_entry_type
                    //, p_include_history: $('#chk_include_history').prop('checked') == true ? "Y" : "N"
                    //, p_department_code: s.ddl_department
                }
            ).then(function (d) {
                if (d.data.listgrid.length > 0) {
                    s.datalistgrid = d.data.listgrid;
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(d.data.listgrid)
                    $('#modal_loading').modal('hide');
                }
                else {
                    s.oTable.fnClearTable();
                    $('#modal_loading').modal('hide');
                }

            });
        }
    }
    //***********************************//
    //***VJA - 02/27/2020 - Remove Function****//
    //***********************************// 
    Array.prototype.remove = function (code, prop) {
        return this.filter(function (d) {
            return d[prop] != code
        })
    }

    //***********************************************************//
    //***VJA - 02/27/2020 -  Occure when value change
    //***********************************************************// 
    s.click_include_history = function ()
    {
        $('#modal_loading').modal({ keyboard: false });
        h.post("../cSSPHICShareAddEmpl/RetieveGrid",
            {
                p_group_code: s.ddl_group_code,
                p_empl_type: s.ddl_entry_type
                //, p_include_history: $('#chk_include_history').prop('checked') == true ? "Y" : "N"
                //, p_department_code: s.ddl_department
            }
        ).then(function (d) {
            if (d.data.listgrid.length > 0) {
                s.datalistgrid = d.data.listgrid;
                s.oTable.fnClearTable();
                s.oTable.fnAddData(d.data.listgrid)
                $('#modal_loading').modal('hide');
            }
            else {

                s.oTable.fnClearTable();
                $('#modal_loading').modal('hide');
            }

        });
        
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
});