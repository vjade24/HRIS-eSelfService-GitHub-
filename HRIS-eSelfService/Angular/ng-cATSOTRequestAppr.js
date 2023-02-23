ng_selfService_App.controller("cATSOTRequestAppr_Ctrl", function ($scope, $compile, $http, $filter) {
    var s               = $scope;
    var h               = $http;
    s.rowLen            = "10";
    s.year              = [];
    s.ddl_year          = "";
    s.ddl_month         = "";
    s.dept_list         = [];
    s.empl_type_list    = [];
    s.datalistgrid      = [];
    s.oTable                = null;
    s.oTableEmployee        = null;
    s.datalistgridEmployee  = [];
    s.oTableDates           = null;
    s.oTablePurpose         = null;
    s.datalistgridDates     = [];
    s.datalistgridPurpose   = [];
    s.show_btn_approve = false;
    function init()
    {
        try
        {
            RetrieveYear();
            //Initialized to current year and month..
            s.ddl_year  = moment((new Date())).format("YYYY");
            s.ddl_month = moment((new Date())).format("MM");
            h.post("../cATSOTRequestAppr/InitializeData").then(function (d)
            {
                if (d.data.message == "success")
                {
                    s.dept_list         = d.data.dept_list;
                    s.empl_type_list    = d.data.employment_type

                    init_table_data([]);
                    init_table_data2([]);
                    init_table_data3([]);
                    init_table_data4([]);

                    s.ddl_empl_type = "";
                    s.ddl_dept = d.data.dept_code;
                    s.FilterPageGrid();
                }
            });

        }
        catch (err)
        {
            swal({ icon: "warning", title: err.message });
        }
    }
    init()

    var init_table_data = function (par_data)
    {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {
                data: s.datalistgrid,
                sDom: 'rt<"bottom"ip>',
                pageLength: 10,
                bAutoWidth: false,
                columns: [
                    { "mData": "ot_ctrl_no", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    {
                        "mData": "empl_id_owner",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    { "mData": "ot_request_date", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    {
                        "mData": "owner_name",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'> &nbsp;" + data + "</span>"
                        }
                    },
                    {
                        "mData": "worklist_status",
                        "mRender": function (data, type, full, row) {
                            var temp = "";
                            if (full["next_status"].toString() == "1" || full["next_status"].toString() == "2" || full["next_status"].toString() == "3") {
                                temp = "<b><span class='text-center btn-block approved-bg'>" + data + "</span></b>"
                            }
                            else if (full["next_status"].toString() == "D") {
                                temp = "<b><span class='text-center btn-block disapproved-bg'>" + data + "</span></b>"
                            }
                            else if (full["next_status"].toString() == "C") {
                                temp = "<b><span class='text-center btn-block cancel-bg'>" + data + "</span></b>"
                            }
                            else if (full["next_status"].toString() == "L")
                            {
                                temp = "<b><span class='text-center btn-block approved-bg'>" + data + "</span></b>"
                            }
                            else if (full["next_status"].toString() == "N") {
                                temp = "<b><span class='text-center btn-block new-bg'>" + data + "</span></b>"
                            }
                            else if (full["next_status"].toString() == "R") {
                                temp = "<b><span class='text-center btn-block reviewed-bg'>" + data + "</span></b>"
                            }
                            else if (full["next_status"].toString() == "S") {
                                temp = "<b><span class='text-center btn-block submitted-bg'>" + data + "</span></b>"
                            }
                            else
                            {
                                temp = "<b><span class='text-center btn-block'>" + data + "</span></b>"
                            }
                            return temp;
                        }
                    },
                    {
                        "mData": "worklist_action",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) 
                        {
                            var temp = "";

                            if (full["next_status"].toString().trim() != "")
                            {
                                temp = '<center>' +
                                    '<button type="button" ng-show="true" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="'+data+'">'+data+'</button >' +
                                    '</center>';
                            }
                            else
                            {
                                temp = '<center>' +
                                    '<button type="button" ng-show="true" class="btn btn-success btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="' + data + '">' + data + '</button >' +
                                    '</center>';
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

    //Table for Employee
    var init_table_data2 = function (par_data) {
        try {
            s.datalistgridEmployee = par_data;
            s.oTableEmployee = $('#datalist_gridEmployee').dataTable(
                {
                    data: s.datalistgridEmployee,
                    stateSave: false,
                    bAutoWidth: false,
                    sDom: 'rt<"bottom"p>',
                    pageLength: 5,
                    columns: [
                        {
                            "width": "15%",
                            "targets": 0,
                            "mData": "empl_id",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "40%",
                            "targets": 1,
                            "mData": "employee_name",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-left btn-block'>" + data + "</span>"
                            }
                        },

                        {
                            "width": "30%",
                            "targets": 2,
                            "mData": "position_title1",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-left btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "15%",
                            "targets": 3,
                            "mData": null,
                            "bSortable": false,
                            "mRender": function (data, type, full, row) {
                                var temp = "";
                                var isdisabled = false

                                if (full['rcrd_status'] == "N" || full['rcrd_status'] == "C") {
                                    isdisabled = false
                                }
                                else {
                                    isdisabled = true
                                }

                                if (full['ot_requestor_empl_id'] != s.ot_requestor_empl_id) {
                                    isdisabled = true
                                }

                                temp = '<center><div class="btn-group">' +
                                    '<button type="button" ng-disabled="' + isdisabled + '" class="btn btn-danger btn-sm" ng-click="btn_del_row(' + row["row"] + ',\'datalistgridEmployee\')" ng-show="' + s.allowDelete + '" " data-toggle="tooltip" data-placement="top" title="Remove"><i class="fa fa-times"></i></button>' +
                                    '</div></center>';

                                return temp;
                            }
                        }
                    ],
                    "createdRow": function (row, data, index) {
                        $compile(row)($scope);  //add this to compile the DOM
                    },

                });

            s.oTable.fnSort([[1, 'asc']]);

            $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }

    }

    //Table for Dates 
    var init_table_data3 = function (par_data) {
        try {
            s.datalistgridDates = par_data;
            s.oTableDates = $('#datalist_gridDates').dataTable(
                {
                    data: s.datalistgridDates,
                    stateSave: false,
                    bAutoWidth: false,
                    sDom: 'rt<"bottom"p>',
                    pageLength: 5,
                    columns: [
                        {
                            "width": "25%",
                            "targets": 0,
                            "mData": "ot_date_from",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "25%",
                            "targets": 1,
                            "mData": "ot_date_to",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },

                        {
                            "width": "20%",
                            "targets": 2,
                            "mData": "ot_start_time_dspl",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "20%",
                            "targets": 2,
                            "mData": "ot_end_time_dspl",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },

                        {
                            "width": "10%",
                            "targets": 3,
                            "mData": null,
                            "bSortable": false,
                            "mRender": function (data, type, full, row) {
                                var temp = "";
                                var isdisabled = false
                                if (full['rcrd_status'] == "N" || full['rcrd_status'] == "C") {
                                    isdisabled = false
                                }
                                else {
                                    isdisabled = true
                                }

                                if (full['ot_requestor_empl_id'] != s.ot_requestor_empl_id) {
                                    isdisabled = true
                                }

                                temp = '<center><div class="btn-group">' +

                                    '<button type="button" ng-disabled="' + isdisabled + '" ng-show="' + s.allowEdit + '" class="btn btn-info btn-sm" ng-click="btn_edit_row_dates(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit"><i class="fa fa-edit"></i></button>' +
                                    '<button type="button" ng-disabled="' + isdisabled + '" ng-show="' + s.allowDelete + '" class="btn btn-danger btn-sm" ng-click="btn_del_row(' + row["row"] + ',\'datalistgridDates\')" data-toggle="tooltip" data-placement="top" title="Remove"><i class="fa fa-times"></i></button>' +
                                    '</div></center>';

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

    //Table for Purpose 
    var init_table_data4 = function (par_data) {
        try {
            s.datalistgridPurpose = par_data;
            s.oTablePurpose = $('#datalist_gridpurpose').dataTable(
                {
                    data: s.datalistgridPurpose,
                    stateSave: false,
                    bAutoWidth: false,
                    sDom: 'rt<"bottom"p>',
                    pageLength: 5,
                    columns: [
                        {
                            "width": "10%",
                            "targets": 0,
                            "mData": "ot_purpose_seq",
                            "bSortable": false,
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "80%",
                            "targets": 1,
                            "mData": "ot_purpose_details",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-left btn-block'>" + data + "</span>"
                            }
                        },

                        {
                            "width": "10%",
                            "targets": 2,
                            "mData": null,
                            "bSortable": false,
                            "mRender": function (data, type, full, row) {
                                var temp = "";
                                var isdisabled = false
                                if (full['rcrd_status'] != "N" && full['rcrd_status'] != "C") {
                                    isdisabled = true;
                                }
                                if (full['ot_requestor_empl_id'] != s.ot_requestor_empl_id) {
                                    isdisabled = true
                                }
                                temp = '<center><div class="btn-group">' +

                                    '<button type="button" ng-disabled="' + isdisabled + '" ng-show="' + s.allowEdit + '" class="btn btn-info btn-sm" ng-click="btn_edit_row_purpose(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit"><i class="fa fa-edit"></i></button>' +
                                    '<button type="button" ng-disabled="' + isdisabled + '" ng-show="' + s.allowDelete + '" class="btn btn-danger btn-sm" ng-click="btn_del_row(' + row["row"] + ',\'datalistgridPurpose\')" data-toggle="tooltip" data-placement="top" title="Remove"><i class="fa fa-times"></i></button>' +
                                    '</div></center>';

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

    //************************************//
    // Select Year +-3
    //************************************// 
    function RetrieveYear()
    {
        var currentYear = new Date().getFullYear();
        var prev_year = currentYear - 3;
        for (var i = 1; i <= 7; i++)
        {
            s.year.push({ "year": prev_year })
            prev_year++;
        }

    }

    //**********************************************
    //  Add Two Leading Zero
    //**********************************************
    function str_pad(n)
    {
        return String("00" + n).slice(-2);
    }

    s.btn_clear_inputs = function ()
    {
        $('#txtb_dtr_date').val('');
        $("#txtb_am_in ").val('');
        $("#txtb_am_out").val('');
        $("#txtb_pm_in ").val('');
        $("#txtb_pm_out").val('');
        $("#txtb_astype_descr").val('');
        $("#txtb_as_venue").val('');
        $("#txtb_as_comment").val('');
    }


    s.btn_approve_click = function ()
    {
        var row_id = $('#btn_approve').prop('ngx-data');
        var data =
        {
            ot_ctrl_no          : s.datalistgrid[row_id].ot_ctrl_no
            ,approval_id        : s.datalistgrid[row_id].approval_id
            ,approval_status    : s.datalistgrid[row_id].next_status
            ,detail_remarks     : s.txtb_remarks
        }

        if (s.datalistgrid[row_id].next_status == "R")
        {
            $('#btn_approve').html('<i class="fa fa-spinner fa-spin"></i> Review');
        }
        if (s.datalistgrid[row_id].next_status == "1") {
            $('#btn_approve').html('<i class="fa fa-spinner fa-spin"></i> Level 1 Approve');
        }
        if (s.datalistgrid[row_id].next_status == "2") {
            $('#btn_approve').html('<i class="fa fa-spinner fa-spin"></i> Level 2 Approve');
        }
        if (s.datalistgrid[row_id].next_status == "F")
        {
            $('#btn_approve').html('<i class="fa fa-spinner fa-spin"></i> Final Approve');
        }
        h.post("../cATSOTRequestAppr/ReviewApprovedAction",
            {
               data:data
            }).then(function (d)
            {
                if (d.data.message == "success")
                {
                    s.datalistgrid[row_id].next_status = "";

                    if (data.approval_status == "R")
                    {
                        s.datalistgrid[row_id].worklist_status = "Reviewed";
                        s.datalistgrid[row_id].worklist_action = "View Details";
                        s.datalistgrid[row_id].approval_status = "R";
                        s.datalistgrid[row_id].next_status = "";
                    }
                    else if (data.approval_status == "1") {
                        s.datalistgrid[row_id].worklist_status = "Level 1 Approved";
                        s.datalistgrid[row_id].worklist_action = "View Details";
                        s.datalistgrid[row_id].approval_status = "1";
                        s.datalistgrid[row_id].next_status = "";
                    }
                    else if (data.approval_status == "2") {
                        s.datalistgrid[row_id].worklist_status = "Level 2 Approved";
                        s.datalistgrid[row_id].worklist_action = "View Details";
                        s.datalistgrid[row_id].approval_status = "2";
                        s.datalistgrid[row_id].next_status = "";
                    }
                    else if (data.approval_status == "F")
                    {
                        s.datalistgrid[row_id].worklist_status  = "Final Approved";
                        s.datalistgrid[row_id].worklist_action  = "View Details";
                        s.datalistgrid[row_id].approval_status  = "F";
                        s.datalistgrid[row_id].next_status      = "L";
                    }

                    s.oTable.fnClearTable();
                    if (s.datalistgrid.length > 0)
                    {
                        s.oTable.fnAddData(s.datalistgrid);
                    }

                    swal({ icon: "success", title:"Application Successfully " + s.datalistgrid[row_id].worklist_status+"!" });
                    setTimeout(function ()
                    {
                        if (s.datalistgrid[row_id].next_status == "R") {
                            $('#btn_approve').html('<i class="fa fa-thumbs-up"></i> Review');
                        }
                        if (s.datalistgrid[row_id].next_status == "1") {
                            $('#btn_approve').html('<i class="fa fa-thumbs-up"></i> Level 1 Approve');
                        }
                        if (s.datalistgrid[row_id].next_status == "2") {
                            $('#btn_approve').html('<i class="fa fa-thumbs-upn"></i> Level 2 Approve');
                        }
                        if (s.datalistgrid[row_id].next_status == "F")
                        {
                            $('#btn_approve').html('<i class="fa fa-thumbs-up"></i> Final Approve');
                        }
                        $('#main_modal').modal('hide');
                    }, 300);
                }
            });
    }

    s.btn_disapprove_click = function ()
    {
        var row_id = $('#btn_disapprove').prop('ngx-data');
        if (ValidateFields())
        {
            var data =
            {
                ot_ctrl_no          : s.datalistgrid[row_id].ot_ctrl_no
                , approval_id       : s.datalistgrid[row_id].approval_id
                , approval_status   : "D"
                , details_remarks: s.txtb_remarks
            }
            $('#btn_disapprove').html('<i class="fa fa-spinner fa-spin"></i> Disapprove');
            h.post("../cATSOTRequestAppr/ReviewApprovedAction",
                {
                    data: data
                }).then(function (d) {
                    if (d.data.message == "success")
                    {
                        s.datalistgrid[row_id].next_status = "";
                        s.datalistgrid[row_id].worklist_status = "Disapproved";
                        s.datalistgrid[row_id].worklist_action = "View Details";
                        s.datalistgrid[row_id].approval_status = "D";
                        s.datalistgrid[row_id].details_remarks = s.txtb_remarks;

                        s.oTable.fnClearTable();
                        if (s.datalistgrid.length > 0) {
                            s.oTable.fnAddData(s.datalistgrid);
                        }

                        swal({ icon: "success", title: "Application Successfully " + s.datalistgrid[row_id].worklist_status+"!" });
                        setTimeout(function () {
                            $('#btn_disapprove').html('<i class="fa fa-thumbs-up"></i> Disapprove');
                            $('#main_modal').modal('hide');
                        }, 300);
                    }
                });

        }
    }

    s.btn_cancel_pending_click = function ()
    {
        var row_id = $('#btn_cancel_pending').prop('ngx-data');
        if (ValidateFields())
        {
            var data =
            {
                ot_ctrl_no          : s.datalistgrid[row_id].ot_ctrl_no
                , approval_id       : s.datalistgrid[row_id].approval_id
                , approval_status   : "C"
                , details_remarks   : s.txtb_remarks
            }
            $('#btn_cancel_pending').html('<i class="fa fa-spinner fa-spin"></i> Cancel Pending');
            h.post("../cATSOTRequestAppr/ReviewApprovedAction",
                {
                    data: data
                }).then(function (d) {
                    if (d.data.message == "success")
                    {
                        s.datalistgrid[row_id].next_status = "";
                        s.datalistgrid[row_id].worklist_status = "Cancel Pending";
                        s.datalistgrid[row_id].worklist_action = "View Details";
                        s.datalistgrid[row_id].approval_status = "C";


                        s.oTable.fnClearTable();
                        if (s.datalistgrid.length > 0) {
                            s.oTable.fnAddData(s.datalistgrid);
                        }

                        swal({ icon: "success", title: "Application Successfully " + s.datalistgrid[row_id].worklist_status+"!" });
                        setTimeout(function ()
                        {
                            $('#btn_cancel_pending').html('<i class="fa fa-ban"></i> Cancel Pending');
                            $('#main_modal').modal('hide');
                        }, 300);
                    }
                });
        }
    }

    s.btn_cancel_click = function () {
        var row_id = $('#btn_cancel').prop('ngx-data');
        if (ValidateFields()) {
            var data =
            {
                  ot_ctrl_no        : s.datalistgrid[row_id].ot_ctrl_no
                , approval_id       : s.datalistgrid[row_id].approval_id
                , approval_status   : "L"
                , details_remarks   : s.txtb_remarks
            }
            $('#btn_cancel').html('<i class="fa fa-spinner fa-spin"></i> Cancel OT');
            h.post("../cATSOTRequestAppr/ReviewApprovedAction",
                {
                    data: data
                }).then(function (d) {
                    if (d.data.message == "success")
                    {
                        s.datalistgrid[row_id].next_status      = "";
                        s.datalistgrid[row_id].worklist_status  = "Cancelled";
                        s.datalistgrid[row_id].worklist_action  = "View Details";
                        s.datalistgrid[row_id].approval_status  = "L";
                        s.datalistgrid[row_id].details_remarks  = s.txtb_remarks;
                        s.oTable.fnClearTable();
                        if (s.datalistgrid.length > 0) {
                            s.oTable.fnAddData(s.datalistgrid);
                        }

                        swal({ icon: "success", title:"Application Successfully " + s.datalistgrid[row_id].worklist_status+"!" });
                        setTimeout(function () {
                            $('#btn_cancel').html('<i class="fa fa-ban"></i> Cancel OT');
                            $('#main_modal').modal('hide');
                        }, 300);
                    }
                });
        }
    }


    s.btn_edit_action = function (row_id)
    {
        try
        {
            s.show_footer = true;
            ValidationResultColor("ALL", false);
            h.post("../cATSOTRequestAppr/GetDetailsData",
                {
                    p_ot_ctrl_no: s.datalistgrid[row_id].ot_ctrl_no
                }).then(function (d)
                {
                    if (d.data.message == "success")
                    {
                        s.ModalTitle = "OT Request Details";
                        $('#btn_approve').prop('ngx-data', row_id);
                        $('#btn_disapprove').prop('ngx-data', row_id);
                        $('#btn_cancel_pending').prop('ngx-data', row_id);
                        $('#btn_cancel').prop('ngx-data', row_id);

                        $('#btn_approve').html('<i class="fa fa-thumbs-up"></i> Approve');
                        $('#btn_disapprove').html('<i class="fa fa-thumbs-down"></i> Disapprove');
                        $('#btn_cancel_pending').html('<i class="fa fa-ban"></i> Cancel Pending');
                        $('#btn_cancel').html('<i class="fa fa-ban"></i> Cancel OT');

                        
                        s.txtb_ot_request_nbr    = d.data.data_hdr.ot_ctrl_no       ;
                        s.txtb_date_filed        = d.data.data_hdr.ot_request_date  ;
                        s.txtb_subject           = d.data.data_hdr.ot_subject       ;
                        s.txtb_justification     = d.data.data_hdr.ot_justification ;
                        s.txtb_ot_request_nbr    = d.data.data_hdr.ot_ctrl_no       ;

                        s.chk_weekdays              = d.data.data_hdr.weekdays_flag;
                        s.chk_weekend               = d.data.data_hdr.weekend_flag;
                        s.chk_holiday               = d.data.data_hdr.holiday_flag;
                        s.chk_dayoff                = d.data.data_hdr.dayoff_ot_flag;

           
                        s.txtb_weekdays_ot_start    = d.data.data_hdr.weekdays_in;
                        $('#txtb_weekdays_ot_start').val(d.data.data_hdr.weekdays_in);
                        s.txtb_weekdays_ot_end      = d.data.data_hdr.weekdays_out;
                        $('#txtb_weekdays_ot_end').val(d.data.data_hdr.weekdays_out);
                        $('#ddl_weekdays_ot_start_time').val((d.data.data_hdr.weekdays_in_ampm));
                        $('#ddl_weekdays_ot_end_time').val((d.data.data_hdr.weekdays_out_ampm));
               

                        s.txtb_weekend_ot_start     = d.data.data_hdr.weekend_in;
                        $('#txtb_weekend_ot_start').val(d.data.data_hdr.weekend_in);
                        s.txtb_weekend_ot_end       = d.data.data_hdr.weekend_out;
                        $('#txtb_weekend_ot_end').val(d.data.data_hdr.weekend_out);
                        $('#ddl_weekend_ot_start_time').val((d.data.data_hdr.weekend_in_ampm));
                        $('#ddl_weekend_ot_end_time').val((d.data.data_hdr.weekend_out_ampm));

                        s.txtb_holiday_ot_start     = d.data.data_hdr.holiday_in;
                        $('#txtb_holiday_ot_start').val(d.data.data_hdr.holiday_in);
                        s.txtb_holiday_ot_end       = d.data.data_hdr.holiday_out;
                        $('#txtb_holiday_ot_end').val(d.data.data_hdr.holiday_out);
                        $('#ddl_holiday_ot_start_time').val((d.data.data_hdr.holiday_in_ampm));
                        $('#ddl_holiday_ot_end_time').val((d.data.data_hdr.holiday_out_ampm));

                        s.txtb_dayoff_ot_start      = d.data.data_hdr.dayoff_ot_in;
                        $("#txtb_dayoff_ot_start").val(d.data.data_hdr.dayoff_ot_in);
                        s.txtb_dayoff_ot_end        = d.data.data_hdr.dayoff_ot_out;
                        $("#txtb_dayoff_ot_end").val(d.data.data_hdr.dayoff_ot_out);
                        $('#ddl_dayoff_ot_start_time').val((d.data.data_hdr.dayoff_ot_in_ampm));
                        $('#ddl_dayoff_ot_end_time').val((d.data.data_hdr.dayoff_ot_out_ampm));
               
                        

                        s.chk_cto = d.data.data_hdr.ot_coc_credit_flag;
            
                        s.txtb_year      = d.data.data_hdr.ot_year;
                        //s.ddl_from      = d.data.data_hdr.ot_from_empl_id;

                        s.txtb_month     = d.data.data_hdr.ot_month;

                        s.txtb_thru     = d.data.data_hdr.ot_thru_employee_name;
                        s.txtb_for      = d.data.data_hdr.ot_for_employee_name;
                        s.txtb_from     = d.data.data_hdr.ot_from_employee_name;

                        s.txtb_department       = d.data.data_hdr.department_name1;
                        s.txtb_subdepartment    = d.data.data_hdr.subdepartment_name1;
                        s.txtb_division         = d.data.data_hdr.division_name1;
                        s.txtb_section          = d.data.data_hdr.section_name1;
                        s.txtb_fund_charges     = d.data.data_hdr.fund_description;
                        s.txtb_remarks          = d.data.data_hdr.details_remarks;

                         s.datalistgridEmployee      = []
                        if (d.data.data_empl.length > 0)
                        {
                            s.datalistgridEmployee  = d.data.data_empl
                            s.oTableEmployee.fnClearTable();
                            s.oTableEmployee.fnAddData(s.datalistgridEmployee)
                        }
                        else {
                            s.oTableEmployee.fnClearTable();
                        }

                        s.datalistgridDates = []
                        if (d.data.data_date.length > 0)
                        {
                            s.datalistgridDates = d.data.data_date
                            s.oTableDates.fnClearTable();
                            s.oTableDates.fnAddData(s.datalistgridDates)
                        }
                        else {
                            s.oTableDates.fnClearTable();
                        }

                        s.datalistgridPurpose = []
                        if (d.data.data_purpose.length > 0)
                        {
                            s.datalistgridPurpose   = d.data.data_purpose
                            s.oTablePurpose.fnClearTable();
                            s.oTablePurpose.fnAddData(s.datalistgridPurpose)
                        }
                        else
                        {
                            s.oTablePurpose.fnClearTable();
                        }

                        s.show_btn_approve  = true;
                        s.btn_show_cancel   = false;
                        if (s.datalistgrid[row_id].next_status == "R")
                        {
                            $('#btn_approve').html('<i class="fa fa-thumbs-up"></i> Review');
                        }
                        else if (s.datalistgrid[row_id].next_status == "1") {
                            $('#btn_approve').html('<i class="fa fa-thumbs-up"></i> Level 1 Approve');
                        }
                        else if (s.datalistgrid[row_id].next_status == "2") {
                            $('#btn_approve').html('<i class="fa fa-thumbs-up"></i> Level 2 Approve');
                        }
                        else if (s.datalistgrid[row_id].next_status == "3" || s.datalistgrid[row_id].next_status == "F") {
                            $('#btn_approve').html('<i class="fa fa-thumbs-up"></i> Final Approve');
                        }
                        else if (s.datalistgrid[row_id].next_status == "L")
                        {
                            s.show_footer       = true;
                            s.show_btn_approve  = false;
                            s.btn_show_cancel   = true
                        }
                        else if (s.datalistgrid[row_id].next_status == "")
                        {
                            s.show_footer       = false;
                            s.show_btn_approve  = false;
                        }

                        setTimeout(function ()
                        {
                            $('#main_modal').modal({ backdrop: 'static', keyboard: false });
                        }, 300);
                    }
                });

        } catch (e)
        {
            swal({ icon: "warning", title: e.message });
        }
    }

    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields()
    {
        var return_val = true;
        ValidationResultColor("ALL", false);

        if ($('#txtb_remarks').val().trim() == "")
        {
            ValidationResultColor("txtb_remarks", true);
            return_val = false;
            $('.nav-tabs a[href="#tab-1"]').tab('show');
        }

        return return_val;
    }

    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidationResultColor(par_object_id, par_v_result)
    {
        if (par_v_result)
        {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else {
            //remove of refresh the object form being required
            $("#txtb_remarks").removeClass("required");
            $("#lbl_txtb_remarks_req").text("");
        }
    }

    s.btn_show_details = function (par_row_id)
    {
        var data = s.datalistgrid2[par_row_id];

        $("#txtb_dtr_date").val(data.as_dtr_date);
        $('#txtb_astype_descr').val(data.astype_descr);
        $('#txtb_reason_descr').val(data.reason_descr);
        $("#txtb_am_in").val(data.as_am_in);
        $("#txtb_am_out").val(data.as_am_out);
        $("#txtb_pm_in").val(data.as_pm_in);
        $("#txtb_pm_out").val(data.as_pm_out);

        $("#txtb_as_comment").val(data.as_comment);
        $("#txtb_as_venue").val(data.as_venue);
        $("#txtb_dtr_date").val(data.as_dtr_date);
        s.txtb_dtr_date = data.as_dtr_date
    }

    s.FilterPageGrid = function ()
    {
        try
        {
            h.post("../cATSOTRequestAppr/RetreiveForApprovalData",
            {
                 par_year       : s.ddl_year
                , par_month     : s.ddl_month
                , par_dep_code  : s.ddl_dept
                , par_emp_type  : s.ddl_empl_type
            }).then(function (d)
            {
                if (d.data.message == "success")
                {
                    s.oTable.fnClearTable();
                    s.datalistgrid = d.data.appr_worklist;
                    if (d.data.appr_worklist.length > 0)
                    {
                        s.oTable.fnAddData(d.data.appr_worklist);
                    }
                }
                else
                {
                    swal({ icon: "warning", title: d.data.message });
                }
            });
        } catch (e)
        {
            swal({ icon: "warning", title: e.message });
        }
    }


    
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidationResultColor(par_object_id, par_v_result) 
    {
        if (par_v_result)
        {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field!");
        }
        else {
            //remove of refresh the object form being required

            $("#txtb_dtr_date").removeClass("required");
            $("#lbl_txtb_dtr_date_req").text("");

            $("#ddl_as_type").removeClass("required");
            $("#lbl_ddl_as_type_req").removeClass("required");
            $("#lbl_ddl_as_type_req").text("");

            $("#txtb_am_in").removeClass("required");
            $("#lbl_txtb_am_in_req").removeClass("required");
            $("#lbl_txtb_am_in_req").text("");

            $("#txtb_am_out").removeClass("required");
            $("#lbl_txtb_am_out_req").removeClass("required");
            $("#lbl_txtb_am_out_req").text("");

            $("#txtb_pm_in").removeClass("required");
            $("#lbl_txtb_pm_in_req").removeClass("required");
            $("#lbl_txtb_pm_in_req").text("");

            $("#txtb_pm_out").removeClass("required");
            $("#lbl_txtb_pm_out_req").removeClass("required");
            $("#lbl_txtb_pm_out_req").text("");

            $("#ddl_reason").removeClass("required");
            $("#lbl_ddl_reason_req").removeClass("required");
            $("#lbl_ddl_reason_req").text("");

            $("#txtb_as_comment").removeClass("required");
            $("#lbl_txtb_as_comment_req").removeClass("required");
            $("#lbl_txtb_as_comment_req").text("");

            $("#txtb_as_venue").removeClass("required");
            $("#lbl_txtb_as_venue_req").removeClass("required");
            $("#lbl_txtb_as_venue_req").text("");

            $("#txtb_remarks").removeClass("required");
            $("#lbl_txtb_remarks_req").text("");

        }
    }

    function get_page(dtr_date) {
        var nakit_an = false;
        var rowx = 0;
        var confirm = 0;
        $('#datalist_grid2 tr').each(function () {
            $.each(this.cells, function (cells) {
                if (cells == 0) {
                    if ($(this).text() == dtr_date) {
                        confirm = confirm + 1;
                    }
                }

                if (cells == 1) {
                    if ($(this).text() == $("#ddl_as_type option:selected").html()) {
                        confirm = confirm + 1;
                    }
                }

                if (confirm == 2) {
                    nakit_an = true;
                    return false;
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
    Array.prototype.delete = function (code) {
        return this.filter(function (d, k) {
            return k != code
        })
    }

    function clearentry() {
        s.txtb_dtr_date = "";
        s.txtb_remarks = "";
        s.new_appr_ctrl = "";

        $("#txtb_next_status").removeClass("required");
        $("#lbl_txtb_next_status_req").text("");

        $("#txtb_year").removeClass("required");
        $("#lbl_txtb_year_req").text("");

        $("#txtb_empl_name").removeClass("required");
        $("#lbl_txtb_empl_name_req").text("");

        $("#txtb_empl_id").removeClass("required");
        $("#lbl_txtb_empl_id_req").text("");

        $("#txtb_dtr_date").removeClass("required");
        $("#lbl_txtb_dtr_date_req").text("");
    }

})