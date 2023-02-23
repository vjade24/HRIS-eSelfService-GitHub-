ng_selfService_App.controller("cATSFLPlanAppr_ctrlr", function ($scope, $compile, $http, $filter)
{
    var s = $scope
    var h = $http

    var userid = "";
    s.year = [];
    s.rowLen = "10";
    s.log_in_as_AO = true;
    s.search_box_fl = "";
    s.div_list = [];

    function minusOne(id) {
        $("#" + id).text(localStorage["minus_force_leave"])
    }

    

    function init() {
        RetrieveYear();
        s.ddl_year = new Date().getFullYear().toString();
        $("#modal_generating_remittance").modal();
        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../cATSFLPlanAppr/InitializeData").then(function (d) {
            if (d.data.message == "success") {
                s.menu_name = d.data.um.menu_name;
                if (d.data.flp_list.length > 0) {
                    init_table_data(d.data.flp_list);
                }
                else {
                    init_table_data([]);
                }
                init_table_data2([])
                s.dept_list = d.data.dept_list;
                s.empl_type_list = d.data.employment_type;
                s.appr_status = d.data.status;
                //**********************************************
                //  Show/Hide ADD, EDIT, DELETE button 
                //**********************************************
                d.data.um.allow_add == "1" ? s.ShowAdd = true : s.ShowAdd = false;
                d.data.um.allow_delete == "1" ? s.ShowDelete = true : s.ShowDelete = false;
                d.data.um.allow_edit == "1" ? s.ShowEdit = true : s.ShowEdit = false;
                    //d.data.um.allow_view    == "1" ? s.ShowView     = true : s.ShowView     = false;
                    //d.data.um.allow_print == "1" ? s.ShowAdd = true : s.ShowAdd = false;

                s.ddl_empl_type = "";
                s.ddl_dept = d.data.dept_code;
               // s.FilterPageGrid();


                if (d.data.fl_plan_hdr_rep_tbl.length > 0) {
                    init_table_fl_hdr(d.data.fl_plan_hdr_rep_tbl);
                }
                else {
                    init_table_fl_hdr([]);
                }
                init_table_fl_dtl([]);
                var curr_year = new Date().getFullYear().toString().trim();
                s.fl_plan_rep_year = curr_year;
                
                s.search_box_fl = s.ddl_dept == "03" ? "" : d.data.department_name.department_short_name;
                s.search_in_list(s.search_box_fl, 'datalistgrid_fl_hdr')

                $("#modal_generating_remittance").modal("hide");
            }
            else {
                swal(d.data.message, { icon: "warning", });
            }

            if (localStorage["minus_force_leave"] > 0)
            {
                minusOne("9407")
            }
            else {
                localStorage["minus_force_leave"] = parseInt($("#" + "9407").text())
            }

        });
    }
    init()

    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {
                data: s.datalistgrid,
                sDom: 'rt<"bottom"ip>',
                pageLength: 10,
                columns: [
                    { "mData": "application_nbr", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    {
                        "mData": "date_applied",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "empl_id",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "employee_name",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>&nbsp;&nbsp;" + data + "</span>"
                        }
                    },
                    {
                        "mData": "approval_status_descr",
                        "mRender": function (data, type, full, row) {
                            var temp = "";
                            if (full["approval_status"].toString() == "1" || full["approval_status"].toString() == "2" || full["approval_status"].toString() == "F") {
                                temp = "<b><span class='text-center badge badge-success'> <i class='fa fa-thumbs-up'></i> " + data + "</span></b>"
                            }
                            else if (full["approval_status"].toString() == "D") {
                                temp = "<b><span class='text-center badge badge-danger'><i class='fa fa-thumbs-down'></i> " + data + "</span></b>"
                            }
                            else if (full["approval_status"].toString() == "C" || full["approval_status"].toString() == "L") {
                                temp = "<b><span class='text-center badge badge-danger'><i class='fa fa-thumbs-down'></i> " + data + "</span></b>"
                            }
                            else if (full["approval_status"].toString() == "N") {
                                temp = "<b><span class='text-center badge badge-primary'><i class='fa fa-send'></i> " + data + "</span></b>"
                            }
                            else if (full["approval_status"].toString() == "R") {
                                temp = "<b><span class='text-center badge badge-info'><i class='fa fa-thumbs-up'></i> " + data + "</span></b>"
                            }
                            else if (full["approval_status"].toString() == "S") {
                                temp = "<b><span class='text-center badge badge-warning'><i class='fa fa-send'></i> " + data + "</span></b>"
                            }
                            return '&nbsp;&nbsp;' + temp ;
                        }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            return '<center><div class="btn-group">' +
                                '<button type="button" ng-show="ShowEdit" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Approve">  <i class="fa fa-thumbs-up"></i></button >' +
                                //'<button type="button" ng-show="ShowDelete" class="btn btn-danger btn-sm" ng-click="btn_del_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                '</div></center>';
                        }
                    }
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            });
    }
    var init_table_data2 = function (par_data) {
        try {
            s.datalistgrid2 = par_data;
            s.oTable2 = $('#datalist_grid2').dataTable(
                {
                    data: s.datalistgrid2,
                    bSort: false,
                    bAutoWidth: false,
                    sDom: 'rt<"bottom">',
                    paging: false,
                    columns: [
                        {
                            "width": "50%",
                            "targets": 0,
                            "mData": "flp_application_date",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "50%",
                            "targets": 1,
                            "mData": "rcrd_status_descr",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        }
                        //{
                        //    "width": "20%",
                        //    "targets": 2,
                        //    "mData": null,
                        //    "bSortable": false,
                        //    "mRender": function (data, type, full, row) {
                        //        return '<center><div class="btn-group">' +
                        //            '<button type="button" class="btn btn-warning btn-sm" ng-disabled="dis_action"   ng-click="btn_cancel_specified(' + row["row"] + ')"       data-toggle="tooltip" data-placement="top" title="Cancel Pending"><i class="fa fa-ban"></i></button>' +
                        //            '<button type="button" class="btn btn-danger btn-sm"  ng-disabled="dis_action"   ng-click="btn_disapprove_specified(' + row["row"] + ')"   data-toggle="tooltip" data-placement="top" title="Disapprove"><i class="fa fa-thumbs-o-down"></i></button>' +
                        //            '<button type="button" class="btn btn-success btn-sm" ng-disabled="dis_action"   ng-click="btn_approve_specified(' + row["row"] + ')"      data-toggle="tooltip" data-placement="top" title="Approve"><i class="fa fa-thumbs-o-up"></i></button>' +
                        //            '</div></center>';
                        //    }
                        //}
                    ],
                    "createdRow": function (row, data, index) {
                        $compile(row)($scope);  //add this to compile the DOM
                    },

                });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }

    }
    s.search_in_list = function (value, table) {
        try
        {
                $("#" + table).DataTable().search(value).draw();
            
        }
        catch (err)
        {
            // alert(err.message)
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
    //************************************//
    // Select Year +-3
    //************************************// 
    function RetrieveYear() {

        var currentYear = new Date().getFullYear();

        var prev_year = currentYear - 3;
        for (var i = 1; i <= 7; i++) {
            s.year.push({ "year": prev_year })
            prev_year++;
        }

    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields() {
        var return_val = true;
        ValidationResultColor("ALL", false);

        if ($('#txtb_description').val() == "") {
            ValidationResultColor("txtb_description", true);
            return_val = false;
        }

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

            $("#txtb_description").removeClass("required");
            $("#lbl_txtb_description_req").text("");

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
    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.FilterPageGrid = function ()
    {
        $("#modal_generating_remittance").modal();
        h.post("../cATSFLPlanAppr/FilterPageGrid", {
            par_dept_code: $('#ddl_dept option:selected').val(),
            par_empl_type: $('#ddl_empl_type option:selected').val(),
            par_year: $('#ddl_year option:selected').val(),
            par_appr_status: $('#ddl_status option:selected').val()
        }).then(function (d) {
            if (d.data.message == "success")
            {
                s.oTable.fnClearTable();
                s.datalistgrid = d.data.filteredGrid;
                if (d.data.filteredGrid.length > 0) {
                    s.oTable.fnAddData(d.data.filteredGrid);
                }
                $("#modal_generating_remittance").modal("hide");
            }
        })
    }
    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    function Refresh() {
        $("#modal_generating_remittance").modal();
        h.post("../cATSFLPlanAppr/FilterPageGrid", {
            par_dept_code: $('#ddl_dept option:selected').val(),
            par_empl_type: $('#ddl_empl_type option:selected').val(),
            par_year: $('#ddl_year option:selected').val(),
            par_appr_status: $('#ddl_status option:selected').val()
        }).then(function (d) {
            if (d.data.message == "success") {
                s.oTable.fnClearTable();
                s.datalistgrid = d.data.filteredGrid;
                if (d.data.filteredGrid.length > 0) {
                    s.oTable.fnAddData(d.data.filteredGrid);
                }
                $("#modal_generating_remittance").modal("hide");
            }
        })
    }
    //************************************// 
    //*** Open Edit Modal         
    //**********************************// 
    s.btn_edit_action = function (row_id) {
        h.post("../cATSFLPlanAppr/ApprReviewer", {
        }).then(function (d) {
            if (d.data.message == "success") {

                s.show_approve = true;
                s.isEdit = true;
                s.ModalTitle = "Force Leave Plan Approval";
                clearentry();

                s.txtb_appl_nbr = s.datalistgrid[row_id].application_nbr;
                s.txtb_date_applied = s.datalistgrid[row_id].date_applied;
                s.txtb_empl_type = $('#ddl_empl_type option:selected').html();
                s.txtb_status = s.datalistgrid[row_id].approval_status_descr;
                s.txtb_dept = $('#ddl_dept option:selected').html();
                s.txtb_empl_name = s.datalistgrid[row_id].employee_name;
                s.authority = d.data.transac_apprvr[0].workflow_authority;
                
                btn = document.getElementById('approve');
                if (d.data.with_reviewer[0].with_reviewer == true) {
                    if (s.datalistgrid[row_id].approval_status == "S" && s.authority == "0") {
                        btn.innerHTML = '<i class="fa fa-thumbs-o-up"></i> Review';
                        s.dis_action = false;
                    }
                    else if ((s.datalistgrid[row_id].approval_status == "R" && s.authority == "3") || (s.datalistgrid[row_id].approval_status == "R" && s.authority == "1") || (s.datalistgrid[row_id].approval_status == "1" && s.authority == "2") || (s.datalistgrid[row_id].approval_status == "2" && s.authority == "3")) {
                        btn.innerHTML = '<i class="fa fa-thumbs-o-up"></i> Approve';
                        s.dis_action = false;
                    }
                    // **************************************************************************************
                    // VJA - 2022-01-25 --- Newly Added Condition for Approver who can Disapprove or Cancel
                    // **************************************************************************************
                    else if (s.datalistgrid[row_id].approval_status == "F" && s.authority == "3")
                    {
                        btn.innerHTML = '<i class="fa fa-thumbs-o-up"></i> Approve';
                        s.dis_action = false;
                        s.show_approve = false;
                    }
                    // **************************************************************************************
                    else {
                        btn.innerHTML = '<i class="fa fa-thumbs-o-up"></i> Approve';
                        s.dis_action = true;
                    }


                    if (s.datalistgrid[row_id].approval_status == "F")
                    {
                        s.dis_action = true;
                    }

                }
                else {
                    if (s.datalistgrid[row_id].approval_status == "S" && s.authority == "0") {
                        btn.innerHTML = '<i class="fa fa-thumbs-o-up"></i> Review';
                        s.dis_action = false;
                    }
                    else if ((s.datalistgrid[row_id].approval_status == "R" && s.authority == "3") || (s.datalistgrid[row_id].approval_status == "1" && s.authority == "2") || (s.datalistgrid[row_id].approval_status == "2" && s.authority == "3")) {
                        btn.innerHTML = '<i class="fa fa-thumbs-o-up"></i> Approve';
                        s.dis_action = false;
                    }
                    else {
                        btn.innerHTML = '<i class="fa fa-thumbs-o-up"></i> Approve';
                        s.dis_action = true;
                    }
                }



                s.temp_appr_ctrl = s.datalistgrid[row_id].application_nbr;
                s.temp_approval_id = s.datalistgrid[row_id].approval_id;
                s.empl_id = s.datalistgrid[row_id].empl_id;

                h.post("../cATSFLPlanAppr/GetDetailsData", {
                    p_application_nbr: s.datalistgrid[row_id].application_nbr
                }).then(function (d) {
                    if (d.data.message == "success") {


                        s.oTable2.fnClearTable();
                        s.datalistgrid2 = d.data.flpDtlLst;
                        s.getDtlDataLength = d.data.flpDtlLst.length;

                        if (d.data.flpDtlLst.length > 0) {
                            s.oTable2.fnAddData(d.data.flpDtlLst);
                        }

                        setTimeout(function () {
                            $('#main_modal').modal({ backdrop: 'static', keyboard: false });
                        }, 300);
                    }
                    else {
                        swal(d.data.message, { icon: "warning", });
                    }
                });

            }
            else {
                swal("User is not authorized to review/approve Force Leave Plan!", { icon: "warning", });
            }
        });
    }

    s.btn_cancel_pending = function () {
        if (ValidateFields()) {
            s.temp_appr_status = "C";
            s.temp_appr_status_descr = "Cancel Pending";
            action();
        }
    }

    s.btn_disapprove = function () {
        if (ValidateFields()) {
            s.temp_appr_status = "D";
            s.temp_appr_status_descr = "Disappoved";
            action();
        }
    }

    s.btn_approve = function () {
        if (s.authority == "0") {
            s.temp_appr_status = "R";
            s.temp_appr_status_descr = "Reviewed";
            s.txtb_description = "Reviewed"
        }
        else if (s.authority == "1") {
            s.temp_appr_status = "1";
            s.temp_appr_status_descr = "Level 1 Approved";
            s.txtb_description = "Level 1 Approved"
        }
        else if (s.authority == "2") {
            s.temp_appr_status = "2";
            s.temp_appr_status_descr = "Level 2 Approved";
            s.txtb_description = "Level 2 Approved"
        }
        else if (s.authority == "3") {
            s.temp_appr_status = "F";
            s.temp_appr_status_descr = "Final Approved";
            s.txtb_description = "Final Approved"
        }
        action();
        localStorage["minus_force_leave"] = parseInt(localStorage["minus_force_leave"]) - 1
        minusOne("9407")
    }

    function action() {
        var data2 = [];
        var data = {
            application_nbr: s.temp_appr_ctrl
            , approval_status: s.temp_appr_status
            , detail_remarks: s.txtb_description
            , updated_dttm: new Date().toLocaleString()
            , approval_id: s.temp_approval_id
        }

        for (var x = 0; x < s.datalistgrid2.length; x++) {
            data2.push({
                application_nbr: s.temp_appr_ctrl
                , flp_application_date: s.datalistgrid2[x].flp_application_date
                , empl_id: s.empl_id
                , rcrd_status: s.temp_appr_status
            });
        }
        
        h.post("../cATSFLPlanAppr/ApprReviewerAction", { data: data, data2: data2 }).then(function (d) {
            if (d.data.message == "success") {

                s.oTable.fnClearTable();
                s.oTable.fnAddData(s.datalistgrid);

                for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                    if (get_page(s.txtb_code) == false) {
                        s.oTable.fnPageChange(x);
                    }
                    else {
                        break;
                    }
                }
                Refresh();
                $('#main_modal').modal("hide");
                swal("Your record successfully updated!", { icon: "success", });

            }
            else {
                swal("You cannot Review or Approve this Application!",d.data.message, { icon: "warning" });
            }
        });
    }
    function clearentry() {
        s.txtb_code = "";
        s.txtb_abbrv = "";
        s.txtb_description = "";
        s.chckbx_hazard = true;

        $("#txtb_abbrv").removeClass("required");
        $("#lbl_txtb_abbrv_req").text("");

        $("#txtb_description").removeClass("required");
        $("#lbl_txtb_description_req").text("");
    }

    var init_table_fl_hdr = function (par_data) {
        try {
            s.datalistgrid_fl_hdr = par_data;
            s.oTable_fl_hdr = $('#datalistgrid_fl_hdr').dataTable(
                {
                    data: s.datalistgrid_fl_hdr,
                    bSort: true,
                    bAutoWidth: false,
                    sDom: 'rt<"bottom">',
                    paging: false,
                    columns: [
                        {
                            "mData": "fl_plan_rep_year",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "mData": "fl_plan_rep_ctrlno",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "mData": "department_short_name",
                            "mRender": function (data, type, full, row) {
                                return "<span class=' btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "mData": "empl_cnt",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "mData": "fl_plan_rep_status_descr",
                            "mRender": function (data, type, full, row) {
                                return "<span class=' btn-block'>&nbsp;" + data + (full["fl_plan_rep_status"].toString() == "RCVD" ? "&nbsp;&nbsp;<i class='fa fa-check-circle-o text-success'></i>" : "") + "</span>"
                            }
                        },
                        {
                            "mRender": function (data, type, full, row) {
                                var temp = "";

                                if (s.ddl_dept == full["department_code"].toString()) {
                                    temp = '&nbsp;&nbsp;<div class="btn-group">' +
                                        '<button type="button" class="btn btn-success btn-sm" ng-click="btn_add_fl_dtl(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Add/Remove"><i class="fa fa-plus-square"></i></button>' +
                                        '<button type="button" class="btn btn-info btn-sm"    ng-click="btn_edit_fl_dtl(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit"><i class="fa fa-edit"></i></button>' +
                                        '<button type="button" class="btn btn-primary btn-sm" ng-click="btn_print_fl_hdr(\'' + full["empl_cnt"] + '\', \'' + full["fl_plan_rep_year"] + '\' ,\'' + full["fl_plan_rep_ctrlno"] +'\')" data-toggle="tooltip" data-placement="top" title="Print"><i class="fa fa-print"></i></button>' +
                                        '<button type="button" class="btn btn-danger btn-sm"  ng-click="btn_del_fl_hdr(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                        '<button type="button" class="btn btn-warning btn-sm" ng-show="' + (full["fl_plan_rep_status"].toString() != "NEW" ? false : true) + '" ng-click="btn_rlsd_fl_hdr(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Release"><i class="fa fa-forward"></i></button>' +
                                        '</div>';
                                }
                                if (s.ddl_dept == "03") {
                                    temp = '&nbsp;&nbsp;<div class="btn-group">' +
                                        '<button type="button" class="btn btn-success btn-sm" ng-click="btn_add_fl_dtl(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Add/Remove"><i class="fa fa-plus-square"></i></button>' +
                                        '<button type="button" class="btn btn-info btn-sm"    ng-click="btn_edit_fl_dtl(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit"><i class="fa fa-edit"></i></button>' +
                                        '<button type="button" class="btn btn-primary btn-sm" ng-click="btn_print_fl_hdr(\'' + full["empl_cnt"] + '\', \'' + full["fl_plan_rep_year"] + '\' ,\'' + full["fl_plan_rep_ctrlno"] +'\')" data-toggle="tooltip" data-placement="top" title="Print"><i class="fa fa-print"></i></button>' +
                                        '<button type="button" class="btn btn-danger btn-sm"  ng-click="btn_del_fl_hdr(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                        '<button type="button" class="btn btn-warning btn-sm" ng-show="' + (full["fl_plan_rep_status"].toString() != "NEW" ? false : true) + '" ng-click="btn_rlsd_fl_hdr(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Release"><i class="fa fa-forward"></i></button>' +
                                        '<button type="button" class="btn btn-warning btn-sm" ng-show="' + (full["fl_plan_rep_status"].toString() == "RCVD" || full["fl_plan_rep_status"].toString() == "NEW" ? false : true) + '" ng-click="btn_rcvd_fl_hdr(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Receive"><i class="fa fa-backward"></i></button>' +
                                        '</div>';
                                }


                                return temp;
                            }
                        }
                    ],
                    "createdRow": function (row, data, index) {
                        $compile(row)($scope);  //add this to compile the DOM
                    },

                });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }


    var init_table_fl_dtl = function (par_data) {
        try {
            s.datalistgrid_fl_dtl = par_data;
            s.oTable_fl_dtl = $('#datalistgrid_fl_dtl').dataTable(
                {
                    data: s.datalistgrid_fl_dtl,
                    bSort: true,
                    bAutoWidth: false,
                    sDom: 'rt<"bottom">',
                    paging: false,
                    columns: [
                        {
                            "mData": "empl_id",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "mData": "employee_name",
                            "mRender": function (data, type, full, row) {
                                return "<span class=' btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "mData": "exist_flag", "mRender": function (data, type, full, row) {
                                var checked = ""

                                if (data == "Y") {
                                    checked = "checked"
                                }
                                else {
                                    checked = ""
                                }

                                return '<div id="checkbox_id_vja" style="cursor: pointer;" class="checkbox checkbox-primary text-center"><input class="checkbox_show"  style="width:20px;" id="checkbox' + row["row"] + '" ng-click="btn_check_action(' + row["row"] + ')" type="checkbox"' + checked + '><label for="checkbox' + row["row"] + '"></label></div>'
                            }
                        },

                    ],
                    "createdRow": function (row, data, index) {
                        $compile(row)($scope);  //add this to compile the DOM
                    },

                });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }


    s.btn_show_fl_hdr = function () {
        s.Retrieve_FLPlan_HDR();
        $("#main_modal_fl_list").modal({ keyboard: false, backdrop: "static" })
    }

    s.btn_add_fl_dtl = function (row_index) {
        if (s.datalistgrid_fl_hdr[row_index].fl_plan_rep_status != "NEW") {
            swal("YOU CANNOT PROCEED!", "This Force leave report is already Released/Received", { icon: "warning" });
            return;
        }
        h.post("../cATSFLPlanAppr/RetrieveEmployee_DTL",
            {
                p_fl_plan_rep_ctrlno: s.datalistgrid_fl_hdr[row_index].fl_plan_rep_ctrlno
                , p_fl_plan_rep_year: s.datalistgrid_fl_hdr[row_index].fl_plan_rep_year
                , p_department_code : s.datalistgrid_fl_hdr[row_index].department_code
                , p_division_code : ""

            }).then(function (d)
            {
                s.fl_plan_rep_ctrlno_add_dtl = s.datalistgrid_fl_hdr[row_index].fl_plan_rep_ctrlno
                s.fl_plan_rep_year_add_dtl = s.datalistgrid_fl_hdr[row_index].fl_plan_rep_year
                if (d.data.message == "success") {
                    s.oTable_fl_dtl.fnClearTable();
                    s.datalistgrid_fl_dtl = d.data.empl_names;
                    if (d.data.empl_names.length > 0) {
                        s.oTable_fl_dtl.fnAddData(d.data.empl_names);
                    }
                    $("#main_modal_fl_dtl").modal({ keyboard: false, backdrop: "static" })
                }
                else {
                    swal({ title: d.data.message, icon: "warning", });
                }
            })
    }

    s.btn_add_fl_hdr = function () {

        s.ADDEDITMODE = "ADD"
        s.dis_dept_fl_plan = false;
        h.post("../cATSFLPlanAppr/RetrieveonADD").then(function (d) {
            if (d.data.message == "success") {
                s.fl_plan_rep_ctrlno = "";
                s.prepared_name = "";
                s.prepare_desig = "";
                s.approved_name = "";
                s.approved_desig = "";
                s.created_employee_name = "";
                s.user_created_dttm = "";
                s.ddl_dept_fl_plan = "";
                s.ddl_div_fl_plan = "";

                s.fl_plan_rep_ctrlno = d.data.nxt_ctrl_nbr.key_value
                s.prepared_name = d.data.prepared_name;
                s.prepare_desig = d.data.prepare_desig;
                s.approved_name = d.data.approved_name;
                s.approved_desig = d.data.approved_desig;
                s.ddl_dept_fl_plan = d.data.department_code;
                s.div_list = d.data.div_list;

                $("#main_modal_fl_add").modal({ keyboard: false, backdrop: "static" })
            }
            else {
                swal({ title: d.data.message, icon: "warning", });
            }
        })
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

    s.btn_save_fl_rep = function () {
        data_fl_plan =
        {
            fl_plan_rep_ctrlno      : s.fl_plan_rep_ctrlno
            , fl_plan_rep_year      : s.fl_plan_rep_year
            , department_code       : s.ddl_dept_fl_plan
            , prepared_name         : s.prepared_name
            , prepare_desig         : s.prepare_desig
            , approved_name         : s.approved_name
            , approved_desig        : s.approved_desig
            , division_code         : s.ddl_div_fl_plan
            , fl_plan_rep_status    : "NEW"
        }

        if (s.ADDEDITMODE == "ADD")
        {
            h.post("../cATSFLPlanAppr/Save_FL_REP", { data: data_fl_plan, p_division_code: s.ddl_div_fl_plan }).then(function (d)
            {
                // console.log(d.data)
                if (d.data.message == "success")
                {
                    s.Retrieve_FLPlan_HDR();
                    s.btn_print_fl_hdr(1, s.fl_plan_rep_year, s.fl_plan_rep_ctrlno)
                    $('#main_modal_fl_add').modal("hide");
                    swal("Your record has been saved and preview report!", { icon: "success", });
                }
                else
                {
                    swal(d.data.message, { icon: "warning", });
                }
            });
        }
        if (s.ADDEDITMODE == "EDIT")
        {
            h.post("../cATSFLPlanAppr/Edit_FL_REP", { data: data_fl_plan }).then(function (d) {
                if (d.data.message == "success")
                {
                    s.Retrieve_FLPlan_HDR();
                    s.btn_print_fl_hdr(1, s.fl_plan_rep_year, s.fl_plan_rep_ctrlno)
                    $('#main_modal_fl_add').modal("hide");
                    swal("Your record has been saved and preview report!", { icon: "success", });
                }
                else
                {
                    swal(d.data.message, { icon: "warning", });
                }
            });
        }

    }

    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.Retrieve_FLPlan_HDR = function () {
        h.post("../cATSFLPlanAppr/Retrieve_FLPlan_HDR").then(function (d) {
            if (d.data.message == "success")
            {
                s.oTable_fl_hdr.fnClearTable();
                s.datalistgrid_fl_hdr = d.data.fl_plan_hdr_rep_tbl;
                if (d.data.fl_plan_hdr_rep_tbl.length > 0) {
                    s.oTable_fl_hdr.fnAddData(d.data.fl_plan_hdr_rep_tbl);
                }
            }
        })
    }

    //************************************// 
    //*** Delete Record              
    //**********************************// 
    s.btn_del_fl_hdr = function (row_index) {

        if (s.datalistgrid_fl_hdr[row_index].fl_plan_rep_status != "NEW") {
            swal("YOU CANNOT PROCEED!", "This Force leave report is already Released/Received", { icon: "warning" });
            return;
        }

        try {
            swal({
                title: "Are you sure to delete this record and all of its components?",
                text: "Once deleted, you will not be able to recover this record!",
                icon: "warning",
                buttons: true,
                dangerMode: true,

            })
                .then(function (willDelete) {
                    if (willDelete) {
                        h.post("../cATSFLPlanAppr/Delete_FL_REP",
                            {
                                par_fl_plan_rep_ctrlno: s.datalistgrid_fl_hdr[row_index].fl_plan_rep_ctrlno
                                , par_fl_plan_rep_year: s.datalistgrid_fl_hdr[row_index].fl_plan_rep_year

                            }).then(function (d) {
                                if (d.data.message == "success") {
                                    s.Retrieve_FLPlan_HDR();
                                    $('#main_modal_fl_add').modal("hide");
                                    swal("Your record has been deleted!", { icon: "success", });
                                }
                                else {
                                    swal({ title: d.data.message, icon: "warning", });
                                }
                            });
                    }
                });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    s.btn_check_action = function (row_id) {
        var data = {
            fl_plan_rep_ctrlno: s.fl_plan_rep_ctrlno_add_dtl
            , fl_plan_rep_year: s.fl_plan_rep_year_add_dtl
            , empl_id: s.datalistgrid_fl_dtl[row_id].empl_id

        }
        h.post("../cATSFLPlanAppr/Save_dtl", {
            data: data
            , exist_flag: s.datalistgrid_fl_dtl[row_id].exist_flag
        }).then(function (d) {
            if (d.data.message == "success") {
                // swal("Successfully Added!","Your record has been saved!",{ icon: "success"});
                s.Retrieve_FLPlan_HDR();
            }
            else {
                swal({ icon: "warning", title: d.data.message });
            }
        })
    }


    s.btn_edit_fl_dtl = function (row_id) {

        s.ADDEDITMODE = "EDIT"
        s.dis_dept_fl_plan = true;

        s.fl_plan_rep_ctrlno = "";
        s.fl_plan_rep_year = "";
        s.prepared_name = "";
        s.prepare_desig = "";
        s.approved_name = "";
        s.approved_desig = "";
        s.created_employee_name = "";
        s.user_created_dttm = "";
        s.ddl_dept_fl_plan = "";
        s.user_id_rlsd_employee_name = "";
        s.rlsd_dttm = "";
        s.user_id_rcvd_employee_name = "";
        s.rcvd_dttm = "";
        s.ddl_div_fl_plan = "";

        s.fl_plan_rep_ctrlno = s.datalistgrid_fl_hdr[row_id].fl_plan_rep_ctrlno
        s.fl_plan_rep_year = s.datalistgrid_fl_hdr[row_id].fl_plan_rep_year
        s.prepared_name = s.datalistgrid_fl_hdr[row_id].prepared_name
        s.prepare_desig = s.datalistgrid_fl_hdr[row_id].prepare_desig
        s.approved_name = s.datalistgrid_fl_hdr[row_id].approved_name
        s.approved_desig = s.datalistgrid_fl_hdr[row_id].approved_desig
        s.created_employee_name = s.datalistgrid_fl_hdr[row_id].created_employee_name
        s.user_created_dttm = moment(s.datalistgrid_fl_hdr[row_id].created_dttm).format("YYYY-MM-DD hh:mm:ss A").trim()
        s.ddl_dept_fl_plan = s.datalistgrid_fl_hdr[row_id].department_code
        s.user_id_rlsd_employee_name = s.datalistgrid_fl_hdr[row_id].user_id_rlsd_employee_name
        s.rlsd_dttm = moment(s.datalistgrid_fl_hdr[row_id].rlsd_dttm).format("YYYY-MM-DD hh:mm:ss A").trim()
        s.user_id_rcvd_employee_name = s.datalistgrid_fl_hdr[row_id].user_id_rcvd_employee_name
        s.rcvd_dttm = moment(s.datalistgrid_fl_hdr[row_id].rcvd_dttm).format("YYYY-MM-DD hh:mm:ss A").trim()
        s.ddl_div_fl_plan = s.datalistgrid_fl_hdr[row_id].division_code

        $("#main_modal_fl_add").modal({ keyboard: false, backdrop: "static" })
    }

    s.btn_print_fl_hdr = function (empl_cnt, par_year, par_fl_plan_rep_ctrlno)
    {
        if (parseInt(empl_cnt) < 1)
        {
            swal("NO DATA FOUND!", "You cannot proceed to this transaction!", { icon: "warning" });
            return;
        }

        var controller = "Reports";
        var action = "Index";
        var ReportName = "";
        var SaveName = "Crystal_Report";
        var ReportType = "inline";
        var ReportPath = "~/Reports/cryForceLeave/";
        var sp = "";

        // var par_report              = "AN"
        // var report_type             = "NEW"
        var par_year = par_year
        var par_fl_plan_rep_ctrlno = par_fl_plan_rep_ctrlno

        //if (par_report == "AN")
        //{
        //    if (report_type == "NEW")
        //    {
        //        ReportName = "cryForceLeaveAnnualSched";
        //    }
        //    else
        //    {
        //        ReportName = "cryForceLeaveAnnualSched_OLD";
        //    }

        ReportName = "cryForceLeaveAnnualSchedWithAppr";
        ReportPath = ReportPath + "" + ReportName + ".rpt";
        sp = "sp_force_leave_plan_annual_sched_rep_with_approved,par_year," + par_year + ",par_fl_plan_rep_ctrlno," + par_fl_plan_rep_ctrlno;
        s.employee_name_print = 'SCHEDULE OF FORCED LEAVE';
        //}
        console.log(sp)

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
    // ******************************************
    // * VJA - 02/29/2020 - Search
    // ****************************************** 
    s.search_in_list = function (value, table) {
        $("#" + table).DataTable().search(value).draw();
    }

    s.btn_rlsd_fl_hdr = function (row_index)
    {
        if (parseInt(s.datalistgrid_fl_hdr[row_index].empl_cnt) < 1)
        {
            swal("NO DATA FOUND!", "You cannot proceed to this transaction!", { icon: "warning" });
            return;
        }

        h.post("../cATSFLPlanAppr/CheckonRelease",
        {
            fl_plan_rep_ctrlno  : s.datalistgrid_fl_hdr[row_index].fl_plan_rep_ctrlno
            ,fl_plan_rep_year   : s.datalistgrid_fl_hdr[row_index].fl_plan_rep_year
        }).then(function (d) 
        {
            if (d.data.message == "success" && d.data.message_oth != "")
            {
                swal("PLEASE CHECK THE FORCE LEAVE PLAN IF APPROVED!", d.data.message_oth, { icon: "warning" });
                return;
            }
            else
            {
                swal("Are you sure you want to Release this record?", "Once Release, you will not be able to edit this record or add employee to details!",
                    {
                        icon: "warning",
                        buttons: {
                            default: "Close",
                            catch:
                            {
                                text: "Release",
                                value: "catch",
                            }
                        },
                    }).then((value) => {
                        switch (value) {

                            case "catch":
                                h.post("../cATSFLPlanAppr/ReceivedReleased",
                                    {
                                        fl_plan_rep_ctrlno: s.datalistgrid_fl_hdr[row_index].fl_plan_rep_ctrlno
                                        , fl_plan_rep_year: s.datalistgrid_fl_hdr[row_index].fl_plan_rep_year
                                        , action: "RLSD"

                                    }).then(function (d) {
                                        if (d.data.message == "success") {
                                            s.Retrieve_FLPlan_HDR();
                                            $('#main_modal_fl_add').modal("hide");
                                            swal("Your record has been Released!", { icon: "success", });
                                        }
                                        else {
                                            swal({ title: d.data.message, icon: "warning", });
                                        }
                                    });
                                break;
                            default:
                        }
                    });

            }
        })
        

    }

    s.btn_rcvd_fl_hdr = function (row_index) {
        if (parseInt(s.datalistgrid_fl_hdr[row_index].empl_cnt) < 1) {
            swal("NO DATA FOUND!", "You cannot proceed to this transaction!", { icon: "warning" });
            return;
        }

        swal("Are you sure you want to Receive this record?", "Once Receive, you will not be able to edit this record or add employee to details!",
            {
                icon: "warning",
                buttons: {
                    default: "Close",
                    catch:
                    {
                        text: "Receive",
                        value: "catch",
                    }
                },
            }).then((value) => {
                switch (value) {

                    case "catch":
                        h.post("../cATSFLPlanAppr/ReceivedReleased",
                            {
                                fl_plan_rep_ctrlno: s.datalistgrid_fl_hdr[row_index].fl_plan_rep_ctrlno
                                , fl_plan_rep_year: s.datalistgrid_fl_hdr[row_index].fl_plan_rep_year
                                , action: "RCVD"

                            }).then(function (d) {
                                if (d.data.message == "success") {
                                    s.Retrieve_FLPlan_HDR();
                                    $('#main_modal_fl_add').modal("hide");
                                    swal("Your record has been Received!", { icon: "success", });
                                }
                                else {
                                    swal({ title: d.data.message, icon: "warning", });
                                }
                            });
                        break;
                    default:
                }
            });
    }

    //s.btn_select_all = function ()
    //{
    //    for (var i = 0; i < s.datalistgrid_fl_dtl.length; i++)
    //    {
    //        var data = {
    //            fl_plan_rep_ctrlno     : s.fl_plan_rep_ctrlno_add_dtl
    //            ,fl_plan_rep_year      : s.fl_plan_rep_year_add_dtl
    //            ,empl_id               : s.datalistgrid_fl_dtl[i].empl_id
    //        }
    //        //h.post("../cATSFLPlanAppr/Save_dtl", { data: data, exist_flag : "N"}).then(function (d)
    //        h.post("../cATSFLPlanAppr/AsynSaving").then(function (d)
    //        {
    //            if (d.data.message == "success")
    //            {
    //                swal("Your record has been Saved!", { icon: "success", });
    //            } else
    //            {
    //                swal({ title: d.data.message, icon: "warning", });
    //            }
    //        })
    //    }

    //}
})