ng_selfService_App.controller("cATSLeaveAppr_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    
    s.year      = [];
    s.rowLen    = "10";
    s.ddl_search_empl_name_list = []

    function minusOne(id) {
        $("#" + id).text(localStorage["minus_leave"])
    }

    function init() {

        RetrieveYear();

        s.ddl_year = new Date().getFullYear().toString();
        s.ddl_month = moment((new Date())).format("MM");
        $("#modal_generating_remittance").modal();
        $('#slvl_radio0').addClass('sl-vl-radio-display-none');
        $('#slvl_radio1').addClass('sl-vl-radio-display-none');
        $('#txtb_specify_div').addClass('sl-vl-radio-display-none');
        //**********************************************
        // Initialize data during page loads
        //**********************************************

        $("#ddl_search_empl_name").select2().on('change', function (e) {
            s.getFilteredSearch();
        })
        $("#ddl_search_as_year").on('change', function (e) {
            s.getFilteredSearch();
        })
        $("#ddl_search_as_month").on('change', function (e) {
            s.getFilteredSearch();
        })



        h.post("../cATSLeaveAppr/InitializeData", {
            par_year: s.ddl_year
        }).then(function (d) {
            if (d.data.message == "success") {
                userid = d.data.um.user_id
                s.leave_type = d.data.leaveType;
                s.leave_sub_type = d.data.leaveSubType;
                
                d.data.leaveType > 0 ? s.dis_leavesubtype = false : s.dis_leavesubtype = true;
                
                if (d.data.leave_application_for_approval.length > 0) {
                    init_table_data(d.data.leave_application_for_approval);
                }
                else {
                    init_table_data([]);
                }
                init_table_data2([])
                //s.dept_list = d.data.dept_list;
                //s.empl_type_list = d.data.employment_type;

                //**********************************************
                //  Show/Hide ADD, EDIT, DELETE button 
                //**********************************************
                d.data.um.allow_add == "1" ? s.ShowAdd = true : s.ShowAdd = false;
                d.data.um.allow_delete == "1" ? s.ShowDelete = true : s.ShowDelete = false;
                d.data.um.allow_edit == "1" ? s.ShowEdit = true : s.ShowEdit = false;
                //d.data.um.allow_view    == "1" ? s.ShowView     = true : s.ShowView     = false;
                //d.data.um.allow_print == "1" ? s.ShowAdd = true : s.ShowAdd = false;
                s.ddl_search_empl_name_list = d.data.empl_name_search
                $("#modal_generating_remittance").modal("hide");
                init_table_data5([]);


                if ($('#ddl_leave_type option:selected').val() == "SL") {
                    s.show_vl = true;
                }
                else {
                    s.show_vl = false;
                }

                if (localStorage["minus_leave"] > 0) {
                    minusOne("9406")
                }
                else {
                    localStorage["minus_leave"] = parseInt($("#" + "9406").text())
                }
            }
            else {
                swal(d.data.message, { icon: "warning", });
            }
        });
    }
    init()

    var init_table_data5 = function (par_data) {
        try {
            s.datalistgridSearch = par_data;
            s.oTableSearch_dtl = $('#datalist_grid_search').dataTable(
                {
                    data: s.datalistgridDates_dtl,
                    stateSave: false,
                    sDom: 'rt<"bottom"p>',
                    pageLength: 5,
                    columns: [

                        {
                            "mData": null,
                            "mRender": function (data, type, full, row) {
                                return "<center><span class='details-control' style='display:block;' ng-click='btn_show_details(" + '"details_info"' + ")' ></center>"
                            }
                        },
                        {
                            "width": "10%",
                            "targets": 0,
                            "mData": "leave_ctrlno",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "50%",
                            "targets": 1,
                            "mData": "leave_type_descr",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-left btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "40%",
                            "targets": 1,
                            "mData": "period_covered",
                            "mRender": function (data, type, full, row) {
                                return "<center><span class='badge badge-success'>" + data + "</span></center>"
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

    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {
                data: s.datalistgrid,
                sDom: 'rt<"bottom"ip>',
                pageLength: 10,
                columns: [
                    { "mData": "leave_ctrlno", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
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
                            return "<span class='text-left btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "approval_status_descr",
                        "mRender": function (data, type, full, row) {
                            var temp = "";
                            if (full["approval_status"].toString() == "1" || full["approval_status"].toString() == "2" || full["approval_status"].toString() == "F") {
                                temp = "<b><span class='text-center badge badge-success'><i class='fa fa-thumbs-up'></i> " + data + "</span></b>"
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
                            return temp;
                        }
                    },
                    {
                        "mData": "worklist_action",
                        "bSortable": false,
                        "mRender": function (data, type, full, row)
                        {
                            var with_justi = false
                            if (full["justification_flag"] == true)
                            {
                                with_justi = true
                            }
                            else
                            {
                                with_justi = false
                            }

                            return '<center><div class="btn-group">' +
                                '<button id="btn-text_action" type="button" ng-show="ShowEdit" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit"> ' + data + '</button >' +
                                '<button id="btn-icon_action" type="button" ng-show="ShowEdit" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit"><i class="fa fa-thumbs-up"></i></button >' +
                                //'<button type="button" ng-show="ShowDelete" class="btn btn-danger btn-sm" ng-click="btn_del_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                '<button type="button" ng-show="' + with_justi +'" class="btn btn-primary btn-sm" ng-click="btn_print_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="With Justification"><i class="fa fa-print"></i> View Justification</button>' +
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
                    bSort: true,
                    bAutoWidth: false,
                    sDom: 'rt<"bottom">',
                    paging: false,
                    columns: [
                        {
                            "width": "20%",
                            "targets": 0,
                            "mData": "leave_date_from",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "20%",
                            "targets": 1,
                            "mData": "leave_date_to",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "20%",
                            "targets": 2,
                            "mData": "date_num_day",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "20%",
                            "targets": 3,
                            "mData": "date_num_day_total",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        }
                    ],
                    "createdRow": function (row, data, index) {
                        $compile(row)($scope);  //add this to compile the DOM
                    },
                    "footerCallback": function (row, data, start, end, display) {
                        var api = this.api(), data;

                        // converting to interger to find total
                        var intVal = function (i) {
                            return typeof i === 'string' ?
                                i.replace(/[\$,]/g, '') * 1 :
                                typeof i === 'number' ?
                                    i : 0;
                        };

                        // computing column Total of the complete result 
                        if (s.datalistgrid2.length > 0) {
                            var column_3_tot = api
                                .column(3)
                                .data()
                                .reduce(function (a, b) {
                                    return intVal(a) + intVal(b);
                                }, 0);

                            s.total_equiv_tot = column_3_tot;
                        }
                    },
                });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }

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
    
    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.FilterPageGrid = function () {
        h.post("../cATSLeaveAppr/FilterPageGrid", {
            par_year: $('#ddl_year option:selected').val()
            , par_show_history: $('#chk_show_approved').prop("checked") == true ? "Y" : "N"
        }).then(function (d) {
            if (d.data.message == "success") {
                
                s.oTable.fnClearTable(d.data.filteredGrid);
                s.datalistgrid = d.data.filteredGrid;
                if (d.data.filteredGrid.length > 0) {
                    s.oTable.fnAddData(d.data.filteredGrid);
                }
            }
        })
    }
    //************************************// 
    //*** Open Edit Modal         
    //**********************************// 
    s.btn_edit_action = function (row_id) {
        clearentry();

        h.post("../cATSLeaveAppr/GetLeaveSubType", {
            par_leave_type: s.datalistgrid[row_id].leave_type_code
            , par_empl_id: ""
        }).then(function (d) {
            if (d.data.message == "success")
            {
                s.leave_sub_type = d.data.leaveSubLst
            }
        })

        s.isEdit                    = true;
        s.ModalTitle                = "Leave Approval";
        s.txtb_dept                 = $('#ddl_dept option:selected').html();
        s.txtb_appl_nbr             = s.datalistgrid[row_id].leave_ctrlno;
        s.txtb_date_applied         = s.datalistgrid[row_id].date_applied;
        s.txtb_approval_status      = s.datalistgrid[row_id].approval_status_descr;
        s.txtb_empl_name            = s.datalistgrid[row_id].employee_name;
        s.txtb_empl_id              = s.datalistgrid[row_id].empl_id;
        s.ddl_leave_type            = s.datalistgrid[row_id].leave_type_code;
        s.ddl_leave_sub_type        = s.datalistgrid[row_id].leave_subtype_code
        s.txtb_specify              = s.datalistgrid[row_id].leave_descr;
        s.txtb_comments             = s.datalistgrid[row_id].leave_comments;
        //s.txtb_remarks              = s.datalistgrid[row_id].details_remarks;

        s.txtb_date_bal_asof        = s.datalistgrid[row_id].leaveledger_date;

        s.sl_current_balance        = s.datalistgrid[row_id].leaveledger_balance_as_of_sl.toFixed(3);
        s.vl_current_balance        = s.datalistgrid[row_id].leaveledger_balance_as_of_vl.toFixed(3);
        s.sp_current_balance        = s.datalistgrid[row_id].leaveledger_balance_as_of_sp.toFixed(3);
        s.fl_current_balance        = s.datalistgrid[row_id].leaveledger_balance_as_of_fl.toFixed(3);
        s.oth_current_balance       = s.datalistgrid[row_id].leaveledger_balance_as_of_oth.toFixed(3);
        s.cto_current_balance       = s.datalistgrid[row_id].leaveledger_balance_as_of_oth.toFixed(3);

        s.sl_less_this_leave        = s.datalistgrid[row_id].sl_restore_deduct.toFixed(3);
        s.vl_less_this_leave        = s.datalistgrid[row_id].vl_restore_deduct.toFixed(3);
        s.sp_less_this_leave        = s.datalistgrid[row_id].sp_restore_deduct.toFixed(3);
        s.fl_less_this_leave        = s.datalistgrid[row_id].fl_restore_deduct.toFixed(3);
        s.oth_less_this_leave       = s.datalistgrid[row_id].oth_restore_deduct.toFixed(3);
        s.cto_less_this_leave       = s.datalistgrid[row_id].oth_restore_deduct.toFixed(3);

        s.lbl_oth_descr = "CTO"
        if (s.ddl_leave_type != "SL" ||
            s.ddl_leave_type != "VL" ||
            s.ddl_leave_type != "SP" ||
            s.ddl_leave_type != "FL" )
        {
            s.lbl_oth_descr = s.ddl_leave_type 
        }
        

        //alert(s.sl_less_this_leave)

        // if ($("#ddl_leave_type option:selected").val() != "") {
        //     if ($("#ddl_leave_type option:selected").val() == "VL" || $("#ddl_leave_type option:selected").val() == "FL") {
        //         s.vl_less_this_leave = s.total_equiv_tot;
        //     }
        //     else if ($("#ddl_leave_type option:selected").val() == "SL") {
        //         s.sl_less_this_leave = s.total_equiv_tot;
        //         alert(s.sl_less_this_leave)
        //     }
        //     else if ($("#ddl_leave_type option:selected").val() == "SP") {
        //         s.sp_less_this_leave = s.total_equiv_tot;
        //     }
        // }

        s.datalistgrid[row_id].leave_class == true ? $("#x1").prop("checked", true) : $("#x0").prop("checked", true);
        if ($("#x1").prop("checked"))
        {
            $("#x0").closest('div').removeClass('checked');
            $("#x1").closest('div').removeClass('checked');
            $("#x1").closest('div').addClass('checked');
        }
        if ($("#x0").prop("checked"))
        {
            $("#x0").closest('div').removeClass('checked');
            $("#x1").closest('div').removeClass('checked');
            $("#x0").closest('div').addClass('checked');
        }

        if (s.datalistgrid[row_id].next_status == "")
        {
            //s.dis_action = true;
            s.show_actions = false;
        }
        else {
            //s.dis_action = false;
            s.show_actions = true;
            btn = document.getElementById('approve');
            if (s.datalistgrid[row_id].next_status == "R")
            {
                btn.innerHTML = '<i class="fa fa-thumbs-o-up"></i> Review';
            }
            else if (s.datalistgrid[row_id].next_status == "F")
            {
                btn.innerHTML = '<i class="fa fa-thumbs-up"></i> Final Approve';
            }
            else {
                btn.innerHTML = '<i class="fa fa-thumbs-up"></i> ' + ' Approve';
            }
        }

        console.log(s.datalistgrid[row_id])
        if (s.datalistgrid[row_id].next_status == "L")
        {
            s.show_cancel = true;

            if (s.datalistgrid[row_id].posting_status == false) {
                s.show_cancel_text = false
                s.show_cancel_button = true
            }

            else {
                s.show_cancel_text = true
                s.show_cancel_button = false
            }
           

        }
        else
        {
            s.show_cancel = false;
            s.show_cancel_button = true
        }

        s.temp_appr_ctrl        = s.datalistgrid[row_id].leave_ctrlno;
        s.temp_approval_id      = s.datalistgrid[row_id].approval_id;
        s.empl_id               = s.datalistgrid[row_id].empl_id;
        s.next_status           = s.datalistgrid[row_id].next_status;
        s.dis_when_s            = true;

        h.post("../cATSLeaveAppr/GetDetailsData", {
            par_leave_type      : s.datalistgrid[row_id].leave_type_code
            , par_empl_id       : s.datalistgrid[row_id].empl_id
            , p_application_nbr : s.datalistgrid[row_id].leave_ctrlno
        }).then(function (d) {
            if (d.data.message == "success") {

                s.oTable2.fnClearTable();
                s.datalistgrid2 = d.data.flpDtlLst;
                s.getDtlDataLength = d.data.flpDtlLst.length;

                if (d.data.flpDtlLst.length > 0) {
                    s.oTable2.fnAddData(d.data.flpDtlLst);
                }

                //if (d.data.slvl_balance.length > 0) {
                //    s.vl_current_balance  = d.data.slvl_balance[0].leaveledger_balance_as_of_vl;
                //    s.sl_current_balance = d.data.slvl_balance[0].leaveledger_balance_as_of_sl;
                //}
                
                var sl_bal = (parseFloat(s.sl_current_balance) - parseFloat(s.sl_less_this_leave)).toFixed(3);
                var vl_bal = (parseFloat(s.vl_current_balance) - parseFloat(s.vl_less_this_leave)).toFixed(3);
                var sp_bal = (parseFloat(s.sp_current_balance) - parseFloat(s.sp_less_this_leave)).toFixed(3);
                var fl_bal = (parseFloat(s.fl_current_balance) - parseFloat(s.fl_less_this_leave)).toFixed(3);
                var cto_bal = (parseFloat(s.cto_current_balance) - parseFloat(s.cto_less_this_leave)).toFixed(3);

                $("#sl_leave_bal").text(sl_bal);
                $("#vl_leave_bal").text(vl_bal);
                $("#sp_leave_bal").text(sp_bal);
                $("#fl_leave_bal").text(fl_bal);
                $("#cto_leave_bal").text(cto_bal);

                setTimeout(function () {
                    $('#main_modal').modal({ backdrop: 'static', keyboard: false });
                }, 300);
            }
            else {
                swal(d.data.message, { icon: "warning", });
            }
        });
    }

    s.btn_cancel_pending = function () {
        if (ValidateFields()) {
            s.next_status = "C";
            action();
            s.swal_title = "Application has been cancelled successfully!";
        }
    }

    s.btn_disapprove = function () {
        if (ValidateFields()) {
            s.next_status = "D";
            action();
            s.swal_title = "Application has been disapproved successfully!";
        }
    }

    s.btn_approve = function () {
        action();

        if (s.next_status == "R") {
            s.swal_title = "Application has been reviewed successfully!";
        }
        else {
            s.swal_title = "Application has been approved successfully!";
        }
        localStorage["minus_leave"] = parseInt(localStorage["minus_leave"]) - 1
        minusOne("9406")
    }

    s.btn_cancel_click = function () {
        if (ValidateFields()) {
            s.next_status = "L";
            action();
            s.swal_title = "Application has been cancelled successfully!";
        }
    }

    function action() {
        if (s.next_status == "C") {
            btn = document.getElementById('cancel_pending');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Cancel Pending';
        }
        else if (s.next_status == "D") {
            btn = document.getElementById('disapprove');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Disapprove';
        }
        else if (s.next_status == "F") {
            btn = document.getElementById('approve');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Final Approve';
        }
        else if (s.next_status == "L") {
            btn = document.getElementById('btn_cancel');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Cancel Leave';
        }
        else {
            btn = document.getElementById('approve');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Review';
        }
        
        var data =
        {
            leave_ctrlno        : s.temp_appr_ctrl
            , approval_status   : s.next_status
            , details_remarks   : s.txtb_remarks
            , approval_id       : s.temp_approval_id
        }
        
        h.post("../cATSLeaveAppr/ApprReviewerAction", {
            data: data
        }).then(function (d) {
            if (d.data.message == "success") {
                
                if (s.next_status == "C") {
                    btn.innerHTML = '<i class="fa fa-ban"> </i> Cancel Pending';
                }
                else if (s.next_status == "D") {
                    btn.innerHTML = '<i class="fa fa-thumbs-down"> </i> Disapprove';
                }
                else if (s.next_status == "L") {
                    btn.innerHTML = '<i class="fa fa-ban"> </i> Cancel Leave';
                }
                else {
                    btn.innerHTML = '<i class="fa fa-thumbs-up"> </i> ' + ' Approve';
                }
                s.FilterPageGrid();
                $('#main_modal').modal("hide");
                swal({ icon: "success", title: s.swal_title });

            }
            else {
                swal(d.data.message, { icon: "warning", });
            }
        });
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

        if ($('#txtb_remarks').val() == "") {
            ValidationResultColor("txtb_remarks", true);
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
            $("#lbl_" + par_object_id + "_req").text("Required Field!");
        }
        else {
            //remove of refresh the object form being required

            $("#txtb_remarks").removeClass("required");
            $("#lbl_txtb_remarks_req").text("");

        }
    }
    function clearentry() {
        s.txtb_remarks = "";
        s.sl_less_this_leave = "0.00";
        s.vl_less_this_leave = "0.00";
        s.sp_less_this_leave = "0.00";
        s.fl_less_this_leave = "0.00";

        s.vl_current_balance = "0.00";
        s.sl_current_balance = "0.00";
        s.sp_current_balance = "0.00";
        s.fl_current_balance = "0.00";

        $("#txtb_remarks").removeClass("required");
        $("#lbl_txtb_remarks_req").text("");
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

    s.btn_click_search_as = function () {
        $('#AS_search_modal').modal({ backdrop: 'static', keyboard: false });
        $("#ddl_search_as_year").val(s.ddl_year)
        $("#ddl_search_as_month").val(s.ddl_month)
    }

    s.getFilteredSearch = function () {
        var as_year = $("#ddl_search_as_year").val()
        var as_month = $("#ddl_search_as_month").val()
        var as_empl_id = $("#ddl_search_empl_name").val()

        h.post("../cATSLeaveAppr/GetSearchData",
            {
                par_year: as_year,
                par_month: as_month,
                par_empl_id: as_empl_id
            }).then(function (d) {

                if (d.data.message == "success") {

                    s.datalistgridSearch = d.data.sp_leave_search_list

                    s.oTableSearch_dtl.fnClearTable();
                    if (d.data.sp_leave_search_list.length > 0) {
                        s.oTableSearch_dtl.fnAddData(d.data.sp_leave_search_list);
                    }

                }

                else {
                    swal("No Data Found!", { icon: "warning", });
                }

            })


    }

    $('#datalist_grid_search tbody').on('click', 'span.details-control', function () {
        var tr = $(this).closest('tr');
        var row = $('#datalist_grid_search').DataTable().row(tr);

        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            //console.log(row.data())
            // Open this row
            row.child(format(row.data())).show();
            tr.addClass('shown');

        }

    });

    //-----------------UPDATE BY JADE -------------------------------------------------------------

    //NEW UPDATE BY: JORGE RUSTOM VILLANUEVA 2020-09-18

    /* Formatting function for row details - modify as you need */

    /* Formatting function for row details - modify as you need */
    function format(d) {

        // `d` is the original data object for the row
        return '<table class="no-border" style="padding:0px !important;min-height:10px !important" id="table_show_details"> ' +
            '<tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Employee Name:</td>' +
            '<td style="padding:0px">' + '<span class="badge badge-default">' + d.employee_name + '</span>' + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td  style="width:24% !important;padding:0px 0px 0px 10px">Date Applied: </td>' +
            '<td style="padding:0px">' + '<span class="badge badge-default">' + d.date_applied + '</span>' + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Status :</td>' +
            '<td style="padding:0px">' + '<span class="badge badge-default">' + d.posting_status_descr + '</span>' + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Number of Day/s :</td>' +
            '<td style="padding:0px">' + '<span class="badge badge-default">' + d.number_of_days + '</span>' + '</td>' +
            '</tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Approval Status :</td>' +
            '<td style="padding:0px">' + '<span class="badge badge-success">' + d.approval_status_descr + '</span>' + '</td>' +
            '</tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Reviewed By :</td>' +
            '<td style="padding:0px">' + '<span class="badge badge-info">' + d.employee_name_reviewer + '</span>' + '</td>' +
            '</tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Reviewed Date :</td>' +
            '<td style="padding:0px">' + '<span class="badge badge-info">' + d.reviewed_date + '</span>' + '</td>' +
            '</tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Level 1 Approved By :</td>' +
            '<td style="padding:0px">' + '<span class="badge badge-success">' + d.employee_name_level1_approver + '</span>' + '</td>' +
            '</tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Level 1 Approval Date :</td>' +
            '<td style="padding:0px">' + '<span class="badge badge-success">' + d.level1_approval_date + '</span>' + '</td>' +
            '</tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Approved By :</td>' +
            '<td style="padding:0px">' + '<span class="badge badge-success">' + d.employee_name_final_approver + '</span>' + '</td>' +
            '</tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Level 1 Approval Date :</td>' +
            '<td style="padding:0px">' + '<span class="badge badge-success">' + d.final_approval_date + '</span>' + '</td>' +
            '</tr>' +

            '<td style="width:24% !important;padding:0px 0px 0px 10px">Cancelled Pending By :</td>' +
            '<td style="padding:0px">' + '<span class="badge badge-danger">' + d.employee_name_cancel_pending + '</span>' + '</td>' +
            '</tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Cancelled Pending Date :</td>' +
            '<td style="padding:0px">' + '<span class="badge badge-danger">' + d.cancel_pending_date + '</span>' + '</td>' +
            '</tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Disapproved By :</td>' +
            '<td style="padding:0px">' + '<span class="badge badge-danger">' + d.employee_name_disapprover + '</span>' + '</td>' +
            '</tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Disapproval Date :</td>' +
            '<td style="padding:0px">' + '<span class="badge badge-danger">' + d.disapproval_date + '</span>' + '</td>' +
            '</tr>' +

            '</table>';
    }

    s.btn_print_action = function (par_row_id)
    {
        var application_nbr     = s.datalistgrid[par_row_id].leave_ctrlno;
        var empl_id             = s.datalistgrid[par_row_id].empl_id;
        var ReportName          = "CrystalReport"
        var SaveName            = "Crystal_Report"
        var ReportType          = "inline"
        var ReportPath          = ""
        var sp                  = ""
        
        s.employee_name_print = "LEAVE JUSTIFICATION";
        h.post("../cATSLeaveAppr/Retrieve_Justification", { leave_ctrlno: application_nbr, empl_id: empl_id }).then(function (d)
        {
            if (d.data.message == "success")
            {
                if (d.data.data != null)
                {
                    ReportPath = "~/Reports/cryLeaveJustification/cryLeaveJustification.rpt";
                    sp = "sp_leave_application_hdr_justi_rep,par_leave_ctrlno," + application_nbr + ",par_empl_id," + empl_id;
                    show_print(ReportName, SaveName, ReportType, ReportPath, sp)
                }
                else
                {
                    swal({ icon: "warning", title: "JUSTIFICATION LETTER NOT FOUND!" });
                    return;
                }
            }
            else
            {
                swal({ icon: "warning", title: d.data.message });
                return;
            }
        })
    }

    function show_print(ReportName, SaveName, ReportType, ReportPath, sp)
    {
        //h.post("../cSSLeaveAppl/setPageHistory").then(function (d)
        //{
        //        if (d.data.message == "success")
        //        {
                    // *******************************************************
                    // *** VJA : 2021-07-14 - Validation and Loading hide ****
                    // *******************************************************
                    
                    $("#loading_data").modal({ keyboard: false, backdrop: "static" })
                    var iframe = document.getElementById('iframe_print_preview');
                    var iframe_page = $("#iframe_print_preview")[0];
                    iframe.style.visibility = "hidden";

                    s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                        + "&ReportName=" + ReportName
                        + "&SaveName=" + SaveName
                        + "&ReportType=" + ReportType
                        + "&ReportPath=" + ReportPath
                        + "&id=" + sp //+ parameters
                    

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
            //    }
            //    else
            //    {
            //        swal(d.data.message, "", {icon:"warning"});
            //    }
            //});
    }
    s.Retrieve_LeaveHistory = function ()
    {
        $('#view_details_history').removeClass()
        $('#view_details_history').addClass('fa fa-spinner fa-spin')
        s.data_history = [];
        h.post("../cATSLeaveAppr/Retrieve_LeaveHistory", { leave_ctrlno: s.txtb_appl_nbr, empl_id: s.txtb_empl_id}).then(function (d)
        {
            if (d.data.message == "success")
            {
                s.data_history = d.data.data
                for (var i = 0; i < d.data.data.length; i++)
                {
                    d.data.data[i].create_dttm_descr = moment(d.data.data[i].created_dttm).format("LLLL")
                    d.data.data[i].create_dttm_ago   = moment(d.data.data[i].created_dttm).fromNow()
                }
                $('#view_details_history').removeClass()
                $('#view_details_history').addClass('fa fa-arrow-down')
            }
            else
            {
                $('#view_details_history').removeClass()
                $('#view_details_history').addClass('fa fa-arrow-down')
                swal({ icon: "warning", title: d.data.message });
            }
        })
    }


})