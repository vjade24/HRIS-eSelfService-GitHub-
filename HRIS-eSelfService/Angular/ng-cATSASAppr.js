ng_selfService_App.controller("cATSASAppr_Ctrl", function ($scope, $compile, $http, $filter) {
    var s               = $scope;
    var h               = $http;
    s.rowLen            = "10";
    s.year              = [];
    s.ddl_year          = "";
    s.ddl_month         = "";
    s.dept_list         = [];
    s.empl_type_list    = [];
    s.datalistgrid      = [];
    s.datalistgrid2     = [];
    s.show_btn_approve  = false;
    s.dis_remarks = false;
    s.ddl_search_empl_name_list = []
    s.isEdit = true
    s.temp_row_id_dtl = ""
    s.as_type_list = null;

    $.fn.modal.Constructor.prototype.enforceFocus = function () {

    }

    function minusOne(id) {
        $("#" + id).text(localStorage["minus_as"])
    }


    function init()
    {
        try
        {
            RetrieveYear();
            //Initialized to current year and month..
            s.ddl_year  = moment((new Date())).format("YYYY");
            s.ddl_month = moment((new Date())).format("MM");

            $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
          
            $("#ddl_dept").select2().on('change', function (e) {
                s.FilterPageGrid();
            })

            $("#ddl_search_empl_name").select2().on('change', function (e) {
                s.getFilteredSearch();
            })
            $("#ddl_search_as_year").on('change', function (e) {
                s.getFilteredSearch();
            })
            $("#ddl_search_as_month").on('change', function (e) {
                s.getFilteredSearch();
            })

            h.post("../cATSASAppr/InitializeData").then(function (d)
            {
                if (d.data.message == "success")
                {
                    s.dept_list         = d.data.dept_list;
                    s.empl_type_list    = d.data.employment_type

                    init_table_data([]);
                    init_table_data2([]);
                    
                    s.ddl_empl_type = "";
                    s.ddl_dept = d.data.dept_code;
                    
                    s.oTable.fnClearTable();
                    s.datalistgrid = d.data.appr_worklist;
                    

                    s.as_type_list = d.data.as_type_list;
                    s.reason_list = d.data.reason_list;

                    if (d.data.appr_worklist.length > 0)
                     {
                         s.oTable.fnAddData(d.data.appr_worklist);
                     }
                    s.ddl_dept = d.data.dept_code;

                    if (s.ddl_dept == "03")
                    {
                        s.hr_enable_only = false
                        s.dtl_enable     = false
                    }
                    else {
                        s.hr_enable_only = true
                        s.dtl_enable     = true
                    }

                    s.ddl_search_empl_name_list = d.data.empl_name_search

                    $("#modal_generating_remittance").modal("hide");
                    init_table_data5([]);

                    if (localStorage["minus_as"] > 0) {
                        minusOne("9403")
                    }
                    else {
                        localStorage["minus_as"] = parseInt($("#" + "9403").text())
                    }
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
                columns: [
                    { "mData": "application_nbr", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    {
                        "mData": "empl_id_owner",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    { "mData": "date_applied", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    {
                        "mData": "owner_name",
                        "mRender": function (data, type, full, row) {
                        

                            return "<span class='text-left btn-block'> &nbsp;" + data + "</span>"
                        }
                    },
                    {
                        "mData": "worklist_status",
                        "mRender": function (data, type, full, row)
                        {
                            var temp = "";
                            if (full["approval_status"].toString() == "F") {
                                temp = "<b><span class='badge badge-success'><i class='fa fa-thumbs-up'></i> " + data + "</span></b>"
                            }

                            else if (full["approval_status"].toString() == "R" || full["approval_status"].toString() == "1") {
                                temp = "<b><span class='badge badge-info'><i class='fa fa-thumbs-up'></i> " + data + "</span></b>"
                            }

                            else if (full["approval_status"].toString() == "D" || full["approval_status"].toString() == "L" || full["approval_status"].toString() == "C") {
                                temp = "<b><span class='badge badge-danger'><i class='fa fa-thumbs-down'></i> " + data + "</span></b>"
                            }
                            else if (full["approval_status"].toString() == "S") {
                                temp = "<b><span class='badge badge-warning'><i class='fa fa-send'></i> " + data + "</span></b>"
                            }
                            else
                            {
                                temp = "<b><span class='text-center badge badge-default'><i class='fa fa-send'></i> " + data + "</span></b>"
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

                            temp = '<center>' +
                                '<button id="btn-text_action" type="button" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="' + data + '"> ' + data + '</button >' +
                                '<button id="btn-icon_action" type="button" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="' + data + '"><i class="fa fa-thumbs-up"></i></button >' +
                               
                                '</center>';
                            return temp;
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
                            "width": "15%",
                            "targets": 0,
                            "mData": "as_dtr_date",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "30%",
                            "targets": 1,
                            "mData": "astype_descr",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "13%",
                            "targets": 2,
                            "mData": null,
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + (full["as_am_in"] == "" ? "--:--" : full["as_am_in"]) + "|" + (full["as_am_out"] == "" ? "--:--" : full["as_am_out"]) + "</span>"
                            }
                        },
                        {
                            "width": "13%",
                            "targets": 3,
                            "mData": null,
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + (full["as_pm_in"] == "" ? "--:--" : full["as_pm_in"]) + "|" + (full["as_pm_out"] == "" ? "--:--" : full["as_pm_out"]) + "</span>"
                            }
                        },
                        {
                            "width": "15%",
                            "targets": 4,
                            "mData": "rcrd_status_descr",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "14%",
                            "targets": 5,
                            "mData": null,
                            "bSortable": false,
                            "mRender": function (data, type, full, row) {
                                var temp = "";
                                temp = '<center><div class="btn-group">' +
                                    '<button type="button" ng-disabled="false" class="btn btn-success btn-sm" ng-click="btn_show_details(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="View"><i class="fa fa-edit"></i>SHOW DETAILS</button>' +
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
                            "mData": "application_nbr",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "50%",
                            "targets": 1,
                            "mData": "astype_descr",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-left btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "40%",
                            "targets": 1,
                            "mData": "period_covered",
                            "mRender": function (data, type, full, row) {
                                return "<center><span class='text-center badge badge-success'>" + data + "</span></center>"
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
        $("#txtb_reason_descr").val('');
        $("#txtb_as_comment").val('');

        $("#txtb_am_in").attr("disabled")
        $("#txtb_am_out").attr("disabled")
        $("#txtb_pm_in").attr("disabled")
        $("#txtb_pm_out").attr("disabled")
    }


    s.btn_approve_click = function ()
    {
        var row_id = $('#btn_approve').prop('ngx-data');
        var data =
        {
             application_nbr    : s.datalistgrid[row_id].application_nbr
            ,approval_id        : s.datalistgrid[row_id].approval_id
            ,approval_status    : s.datalistgrid[row_id].next_status
            , detail_remarks    : s.txtb_remarks
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
        h.post("../cATSASAppr/ReviewApprovedAction",
            {
                data: data
                ,data2: s.datalistgrid2
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
                    }
                    else if (data.approval_status == "1") {
                        s.datalistgrid[row_id].worklist_status = "Level 1 Approved";
                        s.datalistgrid[row_id].worklist_action = "View Details";
                        s.datalistgrid[row_id].approval_status = "1";
                    }
                    else if (data.approval_status == "2") {
                        s.datalistgrid[row_id].worklist_status = "Level 2 Approved";
                        s.datalistgrid[row_id].worklist_action = "View Details";
                        s.datalistgrid[row_id].approval_status = "2";
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

                    swal({ icon: "success", title: "Application Successfully " + s.datalistgrid[row_id].worklist_status+"!" });
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

                localStorage["minus_as"] = parseInt(localStorage["minus_as"]) - 1
                minusOne("9403")
            });
        
        
    }
    
    s.btn_disapprove_click = function ()
    {
        var row_id = $('#btn_disapprove').prop('ngx-data');
        if (ValidateFields())
        {
            var data =
            {
                application_nbr     : s.datalistgrid[row_id].application_nbr
                , approval_id       : s.datalistgrid[row_id].approval_id
                , approval_status   : "D"
                , detail_remarks: s.txtb_remarks
            }
            $('#btn_disapprove').html('<i class="fa fa-spinner fa-spin"></i> Disapprove');
            h.post("../cATSASAppr/ReviewApprovedAction",
                {
                    data: data
                }).then(function (d) {
                    if (d.data.message == "success")
                    {
                        s.datalistgrid[row_id].next_status = "";
                        s.datalistgrid[row_id].worklist_status = "Disapproved";
                        s.datalistgrid[row_id].worklist_action = "View Details";
                        s.datalistgrid[row_id].approval_status = "D";
                        

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
                application_nbr  : s.datalistgrid[row_id].application_nbr
                , approval_id    : s.datalistgrid[row_id].approval_id
                , approval_status: "C"
                , detail_remarks: s.txtb_remarks
            }
            $('#btn_cancel_pending').html('<i class="fa fa-spinner fa-spin"></i> Cancel Pending');
            h.post("../cATSASAppr/ReviewApprovedAction",
                {
                    data: data
                }).then(function (d) {
                    if (d.data.message == "success")
                    {
                        s.datalistgrid[row_id].next_status = "";
                        s.datalistgrid[row_id].worklist_status = "Cancel Pending";
                        s.datalistgrid[row_id].worklist_action = "View Details";
                        s.datalistgrid[row_id].approval_status = "C";
                        s.datalistgrid[row_id].detail_remarks  = s.txtb_remarks;


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
                application_nbr: s.datalistgrid[row_id].application_nbr
                , approval_id: s.datalistgrid[row_id].approval_id
                , approval_status: "L"
                , detail_remarks: s.txtb_remarks
            }
            $('#btn_cancel').html('<i class="fa fa-spinner fa-spin"></i> Cancel AS');
            h.post("../cATSASAppr/ReviewApprovedAction",
                {
                    data: data
                }).then(function (d) {
                    if (d.data.message == "success")
                    {
                        s.datalistgrid[row_id].next_status      = "";
                        s.datalistgrid[row_id].worklist_status  = "Cancelled";
                        s.datalistgrid[row_id].worklist_action  = "View Details";
                        s.datalistgrid[row_id].approval_status = "L";
                        s.datalistgrid[row_id].detail_remarks = s.txtb_remarks;
                        s.oTable.fnClearTable();
                        if (s.datalistgrid.length > 0) {
                            s.oTable.fnAddData(s.datalistgrid);
                        }

                        swal({ icon: "success", title:"Application Successfully " + s.datalistgrid[row_id].worklist_status+"!" });
                        setTimeout(function () {
                            $('#btn_cancel').html('<i class="fa fa-ban"></i> Cancel AS');
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
            s.btn_clear_inputs();
            s.isEdit = true
            s.ModalTitle = "AS APPLICATION DETAILS";

            $("#add1").addClass("hidden")
            if (s.ddl_dept == "03") {
                $("#add1").removeClass("hidden")
            }

            h.post("../cATSASAppr/GetDetailsData",
                {
                    p_application_nbr: s.datalistgrid[row_id].application_nbr
                }).then(function (d)
                {
                    if (d.data.message == "success")
                    {
                        
                       

                        $('#btn_approve').prop('ngx-data', row_id);
                        $('#btn_disapprove').prop('ngx-data', row_id);
                        $('#btn_cancel_pending').prop('ngx-data', row_id);
                        $('#btn_cancel').prop('ngx-data', row_id);

                        $('#btn_approve').html('<i class="fa fa-thumbs-up"></i> Approve');
                        $('#btn_disapprove').html('<i class="fa fa-thumbs-down"></i> Disapprove');
                        $('#btn_cancel_pending').html('<i class="fa fa-ban"></i> Cancel Pending');
                        $('#btn_cancel').html('<i class="fa fa-ban"></i> Cancel AS');

                        $("#txtb_reviewer_name").val(s.datalistgrid[row_id].reviewed_by)
                        s.txtb_reviewer_name = s.datalistgrid[row_id].reviewed_by

                        if (s.datalistgrid[row_id].reviewed_date == "1900-01-01")
                            s.datalistgrid[row_id].reviewed_date = ""
                        $("#txtb_reviewed_date").val(s.datalistgrid[row_id].reviewed_date)
                        s.txtb_reviewed_date = s.datalistgrid[row_id].reviewed_date

                        $("#txtb_level_name").val(s.datalistgrid[row_id].level1_approved_by)
                        s.txtb_level_name = s.datalistgrid[row_id].level1_approved_by


                        if (s.datalistgrid[row_id].level1_approval_date == "1900-01-01")
                            s.datalistgrid[row_id].level1_approval_date = ""

                        $("#txtb_level_date").val(s.datalistgrid[row_id].level1_approval_date)
                        s.txtb_level_date = s.datalistgrid[row_id].level1_approval_date

                        s.edit_appr_ctrl    = s.datalistgrid[row_id].application_nbr;
                        s.edit_approval_id  = s.datalistgrid[row_id].approval_id;
                        s.temp_row_id       = row_id;
                        s.txtb_appl_nbr     = s.datalistgrid[row_id].application_nbr;
                        s.txtb_date_applied = s.datalistgrid[row_id].date_applied;
                        s.txtb_empl_name    = s.datalistgrid[row_id].owner_name;

                        s.txtb_created_by   = s.datalistgrid[row_id].creator_name;
                        s.txtb_empl_id      = s.datalistgrid[row_id].empl_id_owner;
                        s.txtb_remarks      = "";

                        s.oTable2.fnClearTable();
                        s.datalistgrid2 = d.data.flpDtlLst;


                        if (d.data.flpDtlLst.length > 0)
                        {
                            s.oTable2.fnAddData(d.data.flpDtlLst);
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

                        if (s.datalistgrid[row_id].approval_status == "1") {
                            s.txtb_remarks = s.datalistgrid[row_id].level1_approval_comment;
                        }
                        else if (s.datalistgrid[row_id].approval_status == "2") {
                            s.txtb_remarks = s.datalistgrid[row_id].level2_approval_comment;
                        }
                        else if (s.datalistgrid[row_id].approval_status == "C") {
                            s.txtb_remarks = s.datalistgrid[row_id].cancel_pending_comment;
                        }
                        else if (s.datalistgrid[row_id].approval_status == "D") {
                            s.txtb_remarks = s.datalistgrid[row_id].disapproval_comment;
                        }
                        else if (s.datalistgrid[row_id].approval_status == "F") {
                            s.txtb_remarks = s.datalistgrid[row_id].final_approval_comment;
                        }
                        else if (s.datalistgrid[row_id].approval_status == "L") {
                            s.txtb_remarks = s.datalistgrid[row_id].cancelled_comment;
                        }
                        else if (s.datalistgrid[row_id].approval_status == "R") {
                            s.txtb_remarks = s.datalistgrid[row_id].reviewed_comment;
                        }

                        if (s.datalistgrid[row_id].worklist_action == "View Details") {
                            s.dis_remarks = true;
                        }
                        else {
                            s.dis_remarks = false;
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

    s.btn_update_inputs = function () {

        var temp_am_in          = $("#txtb_am_in").val()
        var temp_am_out         = $("#txtb_am_out").val()
        var temp_pm_in          = $("#txtb_pm_in").val()
        var temp_pm_out         = $("#txtb_pm_out").val()
        var temp_astype_code    = $("#ddl_as_type").val()
        var temp_reason_code    = $("#ddl_reason").val()
        var temp_as_comment     = $("#txtb_as_comment").val()

        s.datalistgrid2[s.temp_row_id_dtl].as_am_in     = get_24hr_format($("#txtb_am_in").val())
        s.datalistgrid2[s.temp_row_id_dtl].as_am_out    = get_24hr_format($("#txtb_am_out").val())
        s.datalistgrid2[s.temp_row_id_dtl].as_pm_in     = get_24hr_format($("#txtb_pm_in").val())
        s.datalistgrid2[s.temp_row_id_dtl].as_pm_out    = get_24hr_format($("#txtb_pm_out").val())
        s.datalistgrid2[s.temp_row_id_dtl].astype_code  = $("#ddl_as_type").val()
        s.datalistgrid2[s.temp_row_id_dtl].reason_code  = $("#ddl_reason").val()
        s.datalistgrid2[s.temp_row_id_dtl].as_comment   = $("#txtb_as_comment").val()
        //s.datalistgrid2[s.temp_row_id_dtl].as_am_in = $("#txtb_am_in").val()
        //s.datalistgrid2[s.temp_row_id_dtl].as_am_out = $("#txtb_am_out").val()
        //s.datalistgrid2[s.temp_row_id_dtl].as_pm_in = $("#txtb_pm_in").val()
        //s.datalistgrid2[s.temp_row_id_dtl].as_pm_out = $("#txtb_pm_out").val()


        h.post("../cATSASAppr/UpdateASapplication", {
            data2: s.datalistgrid2[s.temp_row_id_dtl]
        }).then(function (d) {

            if (d.data.message == "success")
            {
                

                s.datalistgrid2[s.temp_row_id_dtl].as_am_in     = temp_am_in
                s.datalistgrid2[s.temp_row_id_dtl].as_am_out    = temp_am_out
                s.datalistgrid2[s.temp_row_id_dtl].as_pm_in     = temp_pm_in
                s.datalistgrid2[s.temp_row_id_dtl].as_pm_out    = temp_pm_out
                s.datalistgrid2[s.temp_row_id_dtl].astype_code  = temp_astype_code
                s.datalistgrid2[s.temp_row_id_dtl].reason_code  = temp_reason_code
                s.datalistgrid2[s.temp_row_id_dtl].as_comment   = temp_as_comment
                s.oTable2.fnClearTable();
                s.oTable2.fnAddData(s.datalistgrid2);

                 swal("Successfully Updated!", "Current Record has been Successfully Updated!", "success");
            }
            else
            {
                swal({ icon: "warning", title: err.message });
            }

        });
       

    }

    function get_24hr_format(time_val) {
        if (time_val.toString().trim() != "") {
            var return_val = "";
            var time_del = "";
            if (time_val.length == 6) {
                time_val = "0" + time_val.toString();
            }

            var time_vax = time_val;
            time_del = time_vax.slice(-2);
            var time_hour = time_val.substring(0, 2);
            var time_min = time_val.substring(3, 5);

            if (time_del == "PM") {
                if (time_hour == 12) {
                    //if (parseInt(time_min) > 0)
                    //{
                    //    return_val = "00:" + time_min.toString();
                    //}
                    //else {
                    //    return_val = "23:59";
                    //}

                    return_val = time_val.substring(0, 5);
                }
                else {

                    return_val = (parseInt(time_hour) + 12).toString() + ":" + time_min.toString();
                }
            }
            else {
                if (time_hour == 12) {
                    if (parseInt(time_min) > 0) {
                        return_val = "00:" + time_min.toString();
                    }
                    else {
                        return_val = "23:59";
                    }
                }
                else return_val = time_val.substring(0, 5);
            }
            return return_val;
        }
        else {
            return "";
        }

    }

    s.btn_show_details = function (par_row_id)
    {
        s.temp_row_id_dtl = par_row_id


        var data = s.datalistgrid2[par_row_id];
        console.log(data)
        $("#txtb_dtr_date").val(data.as_dtr_date);
        s.txtb_dtr_date = data.as_dtr_date;
        $('#txtb_astype_descr').val(data.astype_descr);
        $('#txtb_reason_descr').val(data.reason_descr);
        $("#ddl_as_type").val(data.astype_code)
        $("#txtb_am_in").val(data.as_am_in);
        $("#txtb_am_out").val(data.as_am_out);
        $("#txtb_pm_in").val(data.as_pm_in);
        $("#txtb_pm_out").val(data.as_pm_out);
        $("#txtb_as_comment").val(data.as_comment);
        $("#txtb_as_venue").val(data.as_venue);
        $("#txtb_dtr_date").val(data.as_dtr_date);
        $("#ddl_reason").val(data.reason_code)
        s.txtb_dtr_date = data.as_dtr_date

        $("#txtb_am_in_act").val("")
        s.txtb_am_in_act = ""

        $("#txtb_am_out_act").val("")
        s.txtb_am_out_act = ""

        $("#txtb_pm_in_act").val("")
        s.txtb_pm_in_act = ""


        $("#txtb_pm_out_act").val("")
        s.txtb_pm_out_act = ""

        $("#txtb_am_in").attr("disabled")
        $("#txtb_am_out").attr("disabled")
        $("#txtb_pm_in").attr("disabled")
        $("#txtb_pm_out").attr("disabled")
        $("#add1").addClass("hidden")
        if (s.ddl_dept == "03")
        {
            $("#txtb_am_in").removeAttr("disabled")
            $("#txtb_am_out").removeAttr("disabled")
            $("#txtb_pm_in").removeAttr("disabled")
            $("#txtb_pm_out").removeAttr("disabled")
            $("#add1").removeClass("hidden")
        }
     



        h.post("../cATSASAppr/GetOriginalData",
            {
                p_empl_id: s.txtb_empl_id
                , p_dtr_date: data.as_dtr_date
            }).then(function (d) {

                if (d.data.message == "success")
                {

                    if (d.data.orginal_entry.length > 0) {

                        $("#txtb_am_in_act").val(d.data.orginal_entry[0].time_in_am)
                        s.txtb_am_in_act = d.data.orginal_entry[0].time_in_am

                        $("#txtb_am_out_act").val(d.data.orginal_entry[0].time_out_am)
                        s.txtb_am_out_act = d.data.orginal_entry[0].time_out_am

                        $("#txtb_pm_in_act").val(d.data.orginal_entry[0].time_in_pm)
                        s.txtb_pm_in_act = d.data.orginal_entry[0].time_in_pm


                        $("#txtb_pm_out_act").val(d.data.orginal_entry[0].time_out_pm)
                        s.txtb_pm_out_act = d.data.orginal_entry[0].time_out_pm
                    }
                    else {
                        $("#txtb_am_in_act").val("")
                        s.txtb_am_in_act = ""

                        $("#txtb_am_out_act").val("")
                        s.txtb_am_out_act = ""

                        $("#txtb_pm_in_act").val("")
                        s.txtb_pm_in_act = ""


                        $("#txtb_pm_out_act").val("")
                        s.txtb_pm_out_act = ""
                    }


                }
                else {
                    swal({ icon: "warning", title: err.message });
                }
            });

    }

    s.FilterPageGrid = function ()
    {
        try
        {
            $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });

            h.post("../cATSASAppr/RetreiveForApprovalData",
            {
                 par_year       : s.ddl_year
                , par_month     : s.ddl_month
                , par_dep_code  : $("#ddl_dept").val()
                , par_emp_type  : s.ddl_empl_type
                , show_history  : $('#chk_show_approved').prop("checked") == true ? "Y":"N"
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

                $("#modal_generating_remittance").modal("hide");
            });
        } catch (e)
        {
            swal({ icon: "warning", title: e.message });

            $("#modal_generating_remittance").modal("hide");
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

    s.btn_click_search_as = function () {
        $('#AS_search_modal').modal({ backdrop: 'static', keyboard: false });
        $("#ddl_search_as_year").val(s.ddl_year)
        $("#ddl_search_as_month").val(s.ddl_month)
    }

    s.getFilteredSearch = function () {
        var as_year = $("#ddl_search_as_year").val()
        var as_month = $("#ddl_search_as_month").val()
        var as_empl_id = $("#ddl_search_empl_name").val()

        h.post("../cATSASAppr/GetSearchData",
            {
                par_year        : as_year,
                par_month       : as_month,
                par_empl_id     : as_empl_id
            }).then(function (d) {

                if (d.data.message == "success") {

                    s.datalistgridSearch = d.data.sp_as_search_list

                    s.oTableSearch_dtl.fnClearTable();
                    if (d.data.sp_as_search_list.length > 0) {
                        s.oTableSearch_dtl.fnAddData(d.data.sp_as_search_list);
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
            '<td style="width:24% !important;padding:0px 0px 0px 10px">AS Application Requestor:</td>' +
            '<td style="padding:0px">' + '<span class="badge badge-default">' + d.application_nbr + '</span>' + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td  style="width:24% !important;padding:0px 0px 0px 10px">Date Applied: </td>' +
            '<td style="padding:0px">' + '<span class="badge badge-default">' + d.date_applied + '</span>' + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Description :</td>' +
            '<td style="padding:0px">' + '<span class="badge badge-default">' + d.astype_descr + '</span>' + '</td>' +
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

})