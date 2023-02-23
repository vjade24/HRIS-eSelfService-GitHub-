ng_selfService_App.controller("rSSTickets_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http

    var userid = "";
    var tout = "";
    s.role_id = "";
    s.rowLen        = "10";
    s.year          = [];
    s.current_year  = "";
    
    function init() {       
        
        RetrieveYear();
        var ddate = new Date();
        s.ddl_month = str_pad(ddate.getMonth() + 1);
        s.ddl_year = ddate.getFullYear().toString();
        $("#modal_generating_remittance").modal();
        //**********************************************
        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../rSSTickets/InitializeData").then(function (d) {
            if (d.data.message == "success") {
                userid              = d.data.user_info.user_id
                s.moduleLst         = d.data.moduleLst;
                s.statusLst         = d.data.statuslst;
                s.typeLst           = d.data.typeLst;
                s.txtb_reported_by  = d.data.user_info.last_name + ", " + d.data.user_info.first_name + " " + d.data.user_info.middle_name.slice(0, 1) + ". "
                
                s.role_id = d.data.role_id
                init_table_data([]);
                
                //**********************************************
                //  Show/Hide ADD, EDIT, DELETE button 
                //**********************************************
                s.allowAdd = d.data.allowAdd
                s.allowDelete = d.data.allowDelete
                s.allowEdit = d.data.allowEdit
                s.allowView = d.data.allowView

                if (s.allowAdd == "1") {
                    s.ShowAdd = true
                }
                else {
                    s.ShowAdd = false
                }

                if (s.allowDelete == "1") {
                    s.ShowDelete = true
                }
                else {
                    s.ShowDelete == false
                }

                if (s.allowEdit == "1") {
                    s.ShowView = true
                }
                else {
                    s.ShowView = false
                }
                $("#modal_generating_remittance").modal("hide");
                
            }
            else {
                swal(d.data.message, { icon: "warning", });
            }
        });
    }
    init()
    //**********************************************
    //  Add leading Zero to Months
    //**********************************************
    function str_pad(n) {
        return String("00" + n).slice(-2);
    }
    //*************************************//
    //Add Leading Zero to Control Number
    //*************************************// 
    function lead_zero2(n) {
        return String("00000" + n).slice(-5);
    }

    function RetrieveYear() {

        var currentYear = new Date().getFullYear();

        var prev_year = currentYear - 5;
        for (var i = 1; i <= 8; i++) {
            var data = { "year": prev_year }
            s.year.push(data)
            prev_year++;
        }

    }

    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {
                data: s.datalistgrid,
                sDom: 'rt<"bottom"ip>',
                pageLength: 10,
                columns: [
                    { "mData": "tck_nbr", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "tck_description", "mRender": function (data, type, full, row) { return "<span class='text-left btn-block'>" + data + "</span>" } },
                    { "mData": "assigned_user_id", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "tck_status_descr", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },

                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {

                            return '<center><div class="btn-group">' +
                                '<button type="button" ng-show="ShowView" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >' +
                                '<button type="button" ng-show="ShowDelete" class="btn btn-danger btn-sm" ng-click="btn_del_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                '</div></center>';
                        }
                    }
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            });
    }
    
    s.search_in_list = function (value, table) {
        try {
            $("#" + table).DataTable().search(value).draw();
        }
        catch (err) {
            alert(err.message)
        }
    }
    s.setNumOfRow = function (value, table) {
        try {
            $("#" + table).DataTable().page.len(value).draw();
        }
        catch (err) {
            alert(err.message)
        }
    }
    function display_c() {
        var refresh = 1000; // Refresh rate in milli seconds
        tout = setTimeout(function () {
            display_ct()
        }, 1000);
    }

    function display_ct() {
        var x = new Date()
        var x1 = x.getFullYear() + "-" + str_pad(x.getMonth() + 1) + "-" + str_pad(x.getDate()) + " " + str_pad(x.getHours()) + ":" + str_pad(x.getMinutes()) + ":" + str_pad(x.getSeconds());  //x.toLocaleString()
        $('#txtb_date_reported').val(x1) ;
        display_c();
    }
    s.clear_time_out = function () {
        clearTimeout(tout)
    }
    //************************************//
    //***       Open Add Modal        ****//
    //************************************//
    s.btn_open_modal = function () {
        if (ValidateFields()) {
            display_ct();
            clearentry();
            s.isEdit = false;
            s.add_mode = "ADD";
            s.ModalTitle = "Add New Record";
            btn = document.getElementById('add');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Add';
            ShowDdlStatus();
            if (s.ddl_status2 == "R" && s.add_mode == "EDIT") {
                s.div_resolve = true;
            }
            else {
                s.div_resolve = false;
            }
            setTimeout(function () {
                btn.innerHTML = '<i class="fa fa-plus-circle"> </i> Add';
                $('#main_modal').modal({ backdrop: 'static', keyboard: false });
                s.txtb_module_name = $('#ddl_module option:selected').html();
                s.txtb_status = "Assigned"/*$('#ddl_status option:selected').html()*/;

                var last_ctrl_no = "";
                var last_4_char = "";
                var new_ctrl_no = "";
                var prev_mons = "";

                var date_now = new Date();
                var dn_year = date_now.getFullYear();
                var dn_mons = date_now.getMonth() + 1;
                //s.txtb_tck_nbr = "2020-02-00001"
                h.post("../rSSTickets/GetLasCode", {
                    par_module_id: s.ddl_module
                    , par_year: "2020"
                    , par_month: s.ddl_month
                }).then(function (d) {
                    if (d.data.message == "success") {
                        last_ctrl_no = d.data.ids;
                        last_5_char = last_ctrl_no.slice(last_ctrl_no.length - 5);
                        last_5_char = parseInt(last_5_char) + 1;
                        last_5_char = lead_zero2(last_5_char);
                        new_ctrl_no = last_5_char;

                        s.txtb_tck_nbr = dn_year + "-" + s.ddl_month + "-" + new_ctrl_no;
                    }
                    else {
                        new_ctrl_no = "00001";
                        s.txtb_tck_nbr = dn_year + "-" + s.ddl_month + "-" + new_ctrl_no;
                    }
                })
            }, 300);
        }
    }
    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.FilterPageGrid = function () {
        if ($('#ddl_module option:selected').val() != "" && $('#ddl_year option:selected').val() != "" && $('#ddl_month option:selected').val() != "" ) {
            h.post("../rSSTickets/FilterPageGrid", {
                par_module_id   : $('#ddl_module option:selected').val(),
                par_year        : $('#ddl_year option:selected').val(),
                par_month       : $('#ddl_month option:selected').val(),
                par_status      : $('#ddl_status option:selected').val()
            }).then(function (d) {
                if (d.data.message == "success") {
                    s.vwAssigned = d.data.vwAssigned;
                    s.oTable.fnClearTable();
                    s.datalistgrid = d.data.filteredGrid;
                    if (d.data.filteredGrid.length > 0) {
                        s.oTable.fnAddData(d.data.filteredGrid);
                    }
                }
            })
        }
    }

    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    function refresh_grid(status) {
        if ($('#ddl_module option:selected').val() != "" && $('#ddl_year option:selected').val() != "" && $('#ddl_month option:selected').val() != "") {
            h.post("../rSSTickets/FilterPageGrid", {
                par_module_id: $('#ddl_module option:selected').val(),
                par_year: $('#ddl_year option:selected').val(),
                par_month: $('#ddl_month option:selected').val(),
                par_status: status
            }).then(function (d) {
                if (d.data.message == "success") {
                    s.vwAssigned = d.data.vwAssigned;
                    s.oTable.fnClearTable();
                    s.datalistgrid = d.data.filteredGrid;
                    if (d.data.filteredGrid.length > 0) {
                        s.oTable.fnAddData(d.data.filteredGrid);
                    }
                }
            })
        }
    }


    //*********************************************//
    //*** Select Status in modal for role_id d 999 
    //********************************************// 
    s.SelectStatus = function () {
        if ($('#ddl_status2 option:selected').val() == "R" && s.add_mode == "EDIT") {
            s.div_resolve = true;
        }
        else {
            s.div_resolve = false;
        }
    }

    //*********************************************//
    //*** Show ddl status 2 
    //********************************************// 
    function ShowDdlStatus() {
        if (s.role_id == "999" && s.add_mode == "EDIT") {
            s.isAdmin = true;
        }
        else {
            s.isAdmin = false;
        }
    }
    
    //************************************// 
    //*** Save New Record              
    //**********************************// 
    s.btn_save_click = function () {
        if (ValidateFields2()) {
            btn = document.getElementById('addFinal');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Save';
            
            var data = {
                tck_nbr             : s.txtb_tck_nbr
                , tck_description   : s.txtb_tck_des
                , tck_details       : s.txtb_tck_details
                , reported_user_id  : userid
                , reported_dttm     : $('#txtb_date_reported').val()
                , module_id         : $('#ddl_module option:selected').val()
                , tck_type          : $('#ddl_type option:selected').val()
                , tck_status        : "A"/*$('#ddl_status option:selected').val()*/
                , tck_status_descr  : s.txtb_status/*$('#ddl_status option:selected').html()*/
                , employee_name     : s.txtb_reported_by
                , assigned_user_id  : $('#ddl_assigned option:selected').val()
                , assigned_dttm     : $('#txtb_date_reported').val()
                , resolved_dttm     : ""
                , resolution_details: ""
            }
            s.ddl_status = data.tck_status;
            refresh_grid(data.tck_status)
            h.post("../rSSTickets/Save", { data: data }).then(function (d) {
                if (d.data.message == "success") {
                    s.datalistgrid.push(data)
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid);

                    for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                        if (get_page(s.txtb_tck_nbr) == false) {
                            s.oTable.fnPageChange(x);
                        }
                        else {
                            break;
                        }
                    }
                    $('#main_modal').modal("hide");
                    swal("Your record has been saved!", { icon: "success", });
                    btn.innerHTML = '<i class="fa fa-save"> </i> Save';
                    clearTimeout(tout)
                }
                else {
                    swal(d.data.message, { icon: "warning", });
                }
            })
        }
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields() {
        var return_val = true;
        ValidationResultColor("ALL", false);

        if ($('#ddl_module').val() == "") {
            ValidationResultColor("ddl_module", true);
            return_val = false;
        }

        if ($('#ddl_year').val() == "") {
            ValidationResultColor("ddl_year", true);
            return_val = false;
        }

        if ($('#ddl_month').val() == "") {
            ValidationResultColor("ddl_month", true);
            return_val = false;
        }

        //if ($('#ddl_status').val() == "") {
        //    ValidationResultColor("ddl_status", true);
        //    return_val = false;
        //}

        return return_val;
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidationResultColor(par_object_id, par_v_result) {
        if (par_v_result) {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else {
            //remove of refresh the object form being required

            $("#ddl_module").removeClass("required");
            $("#lbl_ddl_module_req").text("");

            $("#ddl_year").removeClass("required");
            $("#lbl_ddl_year_req").text("");

            $("#ddl_month").removeClass("required");
            $("#lbl_ddl_month_req").text("");

            //$("#ddl_status").removeClass("required");
            //$("#lbl_ddl_status_req").text("");
            
        }
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields2() {
        var return_val = true;
        ValidationResultColor2("ALL", false);

        if ($('#txtb_module_name').val() == "") {
            ValidationResultColor2("txtb_module_name", true);
            return_val = false;
        }

        if ($('#txtb_tck_nbr').val() == "") {
            ValidationResultColor2("txtb_tck_nbr", true);
            return_val = false;
        }

        if ($('#txtb_status').val() == "") {
            ValidationResultColor2("txtb_status", true);
            return_val = false;
        }

        if ($('#txtb_tck_des').val() == "") {
            ValidationResultColor2("txtb_tck_des", true);
            return_val = false;
        }

        if ($('#txtb_tck_details').val() == "") {
            ValidationResultColor2("txtb_tck_details", true);
            return_val = false;
        }

        if ($('#txtb_reported_by').val() == "") {
            ValidationResultColor2("txtb_reported_by", true);
            return_val = false;
        }

        if ($('#txtb_date_reported').val() == "") {
            ValidationResultColor2("txtb_date_reported", true);
            return_val = false;
        }

        if ($('#ddl_assigned').val() == "") {
            ValidationResultColor2("ddl_assigned", true);
            return_val = false;
        }

        if ($('#ddl_type').val() == "") {
            ValidationResultColor2("ddl_type", true);
            return_val = false;
        }

        if (s.add_mode == "EDIT") {
            if ($('#ddl_status2').val() == "") {
                ValidationResultColor2("ddl_status2", true);
                return_val = false;
            }
        }

        if ($('#ddl_status2 option:selected').val() == "R" && s.add_mode == "EDIT") {
            if ($('#txtb_res_des').val() == "") {
                ValidationResultColor2("txtb_res_des", true);
                return_val = false;
            }
        }

        return return_val;
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidationResultColor2(par_object_id, par_v_result) {
        if (par_v_result) {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else {
            //remove of refresh the object form being required

            $("#txtb_module_name").removeClass("required");
            $("#lbl_txtb_module_name_req").text("");

            $("#txtb_tck_nbr").removeClass("required");
            $("#lbl_txtb_tck_nbr_req").text("");

            $("#txtb_status").removeClass("required");
            $("#lbl_txtb_status_req").text("");

            $("#txtb_tck_des").removeClass("required");
            $("#lbl_txtb_tck_des_req").text("");

            $("#txtb_tck_details").removeClass("required");
            $("#lbl_txtb_tck_details_req").text("");

            $("#txtb_reported_by").removeClass("required");
            $("#lbl_txtb_reported_by_req").text("");

            $("#txtb_date_reported").removeClass("required");
            $("#lbl_txtb_date_reported_req").text("");

            $("#ddl_assigned").removeClass("required");
            $("#lbl_ddl_assigned_req").text("");

            $("#ddl_type").removeClass("required");
            $("#lbl_ddl_type_req").text("");
            
            if (s.add_mode == "EDIT") {
                $("#ddl_status2").removeClass("required");
                $("#lbl_txtb_status_req").text("");
            }

            if ($('#ddl_status2 option:selected').val() == "R" && s.add_mode == "EDIT") {
                $("#txtb_res_des").removeClass("required");
                $("#lbl_txtb_res_des_req").text("");
            }
        }
    }
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
    //************************************// 
    //*** Open Edit Modal         
    //**********************************// 
    s.btn_edit_action = function (row_id) {
        clearentry();
        s.add_mode = "EDIT";
        ShowDdlStatus();
        
        s.txtb_module_name      = $('#ddl_module option:selected').html()
        s.txtb_tck_nbr          = s.datalistgrid[row_id].tck_nbr;
        s.txtb_status           = s.datalistgrid[row_id].tck_status_descr;
        s.txtb_tck_des          = s.datalistgrid[row_id].tck_description;
        s.txtb_tck_details      = s.datalistgrid[row_id].tck_details;
        s.txtb_reported_by      = s.datalistgrid[row_id].employee_name;
        s.txtb_date_reported    = s.datalistgrid[row_id].reported_dttm;
        s.ddl_assigned          = s.datalistgrid[row_id].assigned_user_id;
        s.ddl_type              = s.datalistgrid[row_id].tck_type;
        s.ddl_status2           = s.datalistgrid[row_id].tck_status;
        s.txtb_res_des          = s.datalistgrid[row_id].resolution_details;
        
        if (s.ddl_status2 == "R" && s.add_mode == "EDIT") {
            s.div_resolve = true;
        }
        else {
            s.div_resolve = false;
        }
        s.isEdit = true;
        s.ModalTitle = "Edit Existing Record";
        setTimeout(function () {
            $('#main_modal').modal({ backdrop: 'static', keyboard: false });

            $('#edit').attr('ngx-data', row_id);
            var row_edited = $('#edit').attr("ngx-data");
            s.datalistgrid[row_edited].tck_description = s.txtb_tck_des;
            s.datalistgrid[row_edited].assigned_user_id = $('#ddl_assigned option:selected').val();
            s.datalistgrid[row_edited].reported_user_id = s.txtb_reported_by;
            s.datalistgrid[row_edited].tck_status = $('#ddl_status2 option:selected').val();
            s.datalistgrid[row_edited].tck_status_descr = $('#ddl_status2 option:selected').html();
            s.datalistgrid[row_edited].resolution_details = s.txtb_res_des;
        }, 300);
    }
    
    //***********************************// 
    //*** Update Existing Record         
    //**********************************// 
    s.SaveEdit = function () {
        if (ValidateFields2()) {
            btn = document.getElementById('edit');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Saving';
            var res_des = "";
            var res_date = "";
            if ($('#ddl_status2 option:selected').val() == "R" && s.add_mode == "EDIT") {
                res_des = s.txtb_res_des;
                res_date = new Date().toLocaleString();
            }

            var data = {
                tck_nbr             : s.txtb_tck_nbr
                , tck_description   : s.txtb_tck_des
                , tck_details       : s.txtb_tck_details
                , tck_type          : $('#ddl_type option:selected').val()
                , tck_status        : $('#ddl_status2 option:selected').val()
                , assigned_user_id  : $('#ddl_assigned option:selected').val()
                //, reported_user_id: userid
                //, reported_dttm: $('#txtb_date_reported').val()
                //, module_id: $('#ddl_module option:selected').val()
                //, assigned_dttm: $('#txtb_date_reported').val()
                , resolved_dttm     : res_date
                , resolution_details: res_des
            }
            console.log(data)
            h.post("../rSSTickets/SaveEdit", { data: data }).then(function (d) {
                if (d.data.message == "success") {
                    var row_edited = $('#edit').attr("ngx-data");
                    s.datalistgrid[row_edited].tck_description  = s.txtb_tck_des;
                    s.datalistgrid[row_edited].assigned_user_id = $('#ddl_assigned option:selected').val();
                    s.datalistgrid[row_edited].reported_user_id = s.txtb_reported_by;
                    s.datalistgrid[row_edited].tck_status = $('#ddl_status2 option:selected').val();
                    s.datalistgrid[row_edited].tck_status_descr = $('#ddl_status2 option:selected').html();
                    s.datalistgrid[row_edited].resolution_details = s.txtb_res_des;

                    s.ddl_status = $('#ddl_status2 option:selected').val();

                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid);

                    for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                        if (get_page(s.txtb_tck_nbr) == false) {
                            s.oTable.fnPageChange(x);
                        }
                        else {
                            break;
                        }
                    }
                    btn.innerHTML = '<i class="fa fa-save"> </i> Save Edit';
                    $('#main_modal').modal("hide");
                    swal("Your record successfully updated!", { icon: "success", });
                }
                else {
                    swal(d.data.message, { icon: "warning", });
                }
            });
        }
    }
    //************************************// 
    //*** Delete Record              
    //**********************************// 
    s.btn_del_row = function (row_index) {
        swal({
            title: "Are you sure to delete this record?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: true,
            dangerMode: true,

        })
            .then(function (willDelete) {
                if (willDelete) {
                    h.post("../rSSTickets/Delete", {
                        par_tck_nbr: s.datalistgrid[row_index].tck_nbr
                    }).then(function (d) {
                        if (d.data.message == "success") {
                            s.datalistgrid = s.datalistgrid.delete(row_index);
                            s.oTable.fnClearTable();
                            if (s.datalistgrid.length != 0) {
                                s.oTable.fnAddData(s.datalistgrid);
                            }
                            swal("Your record has been deleted!", { icon: "success", });
                        }
                        else {
                            swal("Data already deleted by other user/s!", { icon: "warning", });
                            s.datalistgrid = s.datalistgrid.delete(row_index);
                            s.oTable.fnClearTable();
                            if (s.datalistgrid.length != 0) {
                                s.oTable.fnAddData(s.datalistgrid);
                            }
                        }
                    })
                }
            });
    }

    Array.prototype.delete = function (code) {
        return this.filter(function (d, k) {
            return k != code
        })
    }

    function clearentry() {
        s.txtb_module_name      = "";
        s.txtb_tck_nbr          = "";
        s.txtb_status           = "";
        s.txtb_tck_des          = "";
        s.txtb_tck_details      = "";
        //s.txtb_reported_by      = "";
        s.txtb_date_reported    = "";
        s.ddl_assigned          = "";
        s.ddl_type              = "";
        s.txtb_res_des = "";
        $('#txtb_res_des').val("")

        $("#txtb_module_name").removeClass("required");
        $("#lbl_txtb_module_name_req").text("");

        $("#txtb_tck_nbr").removeClass("required");
        $("#lbl_txtb_tck_nbr_req").text("");

        $("#txtb_status").removeClass("required");
        $("#lbl_txtb_status_req").text("");

        $("#txtb_tck_des").removeClass("required");
        $("#lbl_txtb_tck_des_req").text("");

        $("#txtb_tck_details").removeClass("required");
        $("#lbl_txtb_tck_details_req").text("");

        $("#txtb_reported_by").removeClass("required");
        $("#lbl_txtb_reported_by_req").text("");

        $("#txtb_date_reported").removeClass("required");
        $("#lbl_txtb_date_reported_req").text("");

        $("#ddl_assigned").removeClass("required");
        $("#lbl_ddl_assigned_req").text("");

        $("#ddl_type").removeClass("required");
        $("#lbl_ddl_type_req").text("");
    }
})