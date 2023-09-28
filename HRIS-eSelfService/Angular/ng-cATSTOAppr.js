//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Travel Order
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JORGE RUSTOM VILLANUEVA       06/01/2020      Code Creation
//**********************************************************************************


ng_selfService_App.controller("cATSTOAppr_Ctrl", function (commonScript, $scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    var cs = commonScript
    var gv = "getValue"
    var userid = "";
    var current_date;
    s.year = [];
    s.rowLen = "10";
    isCreatorGridAction = true
    s.oTableEmployee = null;
    s.datalistgridEmployee = []
    s.oTableDates = null;
    s.btn_enabled_4HR = false
    s.hr_enable_only = true;
    s.datalistgridDates = []
    s.datalistgridSearch = []
    s.comment_list_orig = []
    s.comment_list_orig_2 = []
    s.comment_list = []
    s.comment_list_2 = []
    s.oTableCheck_dtl = []
    s.same_to_nbr = []
    s.number_check_to_action
    s.number_check_actined_apvd
    s.number_check_actined_dis


    s.datalistgridCheck = []
    s.datalistgridCheckActioned = []

    s.pa_approver = ""
    s.pa_approver_empl_id = ""

    tname = ""
    s.temp_row_id = ""
    s.par_report_type = ""
    s.temp_row_id_type = ""
    s.datalistgridDates_dtl = []
    s.isShowCancelFinal = false;
    s.ddl_search_empl_name_list = []
    s.btn_print_check = "0"
    s.travel_form_list = [
        { travel_form_code: '1', travel_form_descr: 'W/in the Province' },
        { travel_form_code: '2', travel_form_descr: 'Outside the Province (w/in Davao Region)' },
        { travel_form_code: '3', travel_form_descr: 'Outside Davao Region/Seminar' }

    ]
    s.ddl_dept_original = ""

    s.tmp_travel_order_no = "";

    s.travelorder_hdr_tbl_updatetype = []

    $.fn.modal.Constructor.prototype.enforceFocus = function () {

    }

    s.approver_list = [
        { empl_id: "10058", employee_name: "Fatima P. Montejo" }
        , { empl_id: "10063", employee_name: "Dorothy P. Montejo-Gonzaga" }
    ]
    var account_user_id = "U"

    //setInterval(function () {
    //    s.btn_click_reload_notif()
    //}, 60 * 1000); // 60 * 1000 milsec
    s.showapredit = false
    s.allowapredit = function () {
        if (account_user_id == "U8447" || account_user_id == "U2003") {
            //s.showapredit = true
            return true
        }
        else {
            //s.showapredit = false
            return false
        }
    }
    function initialize_obj(arr) {
        for (var x = 0; x < arr.length; x++) {
            $("#" + arr[x]).val("")
            s[arr[x]] = ""
        }
    }
    s.getValue = function (id) {
        return $("#" + id).val()
    }

    s.empl_id_update = ""

    $("#dd_starttime_meridem").val("")
    $("#dd_endtime_meridem").val("")
    initialize_obj([
        "dd_travel_date_from"
        , "dd_travel_date_to"
        , "dd_travel_start_time"
        , "dd_starttime_meridem"
        , "dd_travel_end_time"
        , "dd_endtime_meridem"
    ])

    $('#div_to_date .input-group.date').datepicker({
        todayBtn: "linked",
        keyboardNavigation: false,
        forceParse: false,
        calendarWeeks: true,
        autoclose: true,
        format: "yyyy-mm-dd"
    });

    function minusOne(id) {

        $("#" + id).text(localStorage["minus_travel_order"])
        $("#tab_number").text(localStorage["minus_travel_order"])
    }

    s.filter_comment = function () {
        var comment_val = $("#disapprove_comment_select").val()
        $("#disapprove_comment_text").val(comment_val)
        s.disapprove_comment_text = comment_val
    }


    s.filter_comment_2 = function () {
        var comment_val = $("#disapprove_comment_select_2").val()
        $("#disapprove_comment_text_2").val(comment_val)
        s.disapprove_comment_text_2 = comment_val
    }


    //$(window).resize(function () {
    //    window.m.redraw();
    //});
    var morrisLine;
    function init() {
        RetrieveYear();

        s.ddl_year = moment((new Date())).format("YYYY");
        s.ddl_month = moment((new Date())).format("MM");

        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
        //**********************************************
        // Initialize data during page loads
        //**********************************************


        h.post("../cATSTOAppr/InitializeData").then(function (d) {
            if (d.data.message == "success") {
                account_user_id = account_user_id + d.data.empl_id
                s.allowapredit()
                s.btn_enabled_4HR = d.data.btn_enabled_4HR
                current_date = d.data.current_date
                $("#ddl_dept").select2().on('change', function (e) {
                    s.FilterPageGrid();
                })

                $("#disapprove_comment_select").select2().on('change', function (e) {

                    s.filter_comment();
                })
                $("#disapprove_comment_select_2").select2().on('change', function (e) {

                    s.filter_comment_2();
                })

                $("#ddl_search_empl_name").select2().on('change', function (e) {
                    s.getFilteredSearch();
                })
                $("#ddl_search_travel_year").on('change', function (e) {
                    s.getFilteredSearch();
                })
                $("#ddl_search_travel_month").on('change', function (e) {
                    s.getFilteredSearch();
                })

                //s.menu_name = d.data.um.menu_name;

                if (d.data.sp_approval_worklist_travel_order.length > 0) {

                    init_table_data(d.data.sp_approval_worklist_travel_order);
                }
                else {
                    init_table_data([]);
                }

                s.pa_approver = d.data.pa_approver;
                s.pa_approver_empl_id = d.data.pa_approver.substring(1, 6).trim()
                init_table_data2([]);
                init_table_data3([]);
                init_table_data4([]);
                init_table_data5([]);
                init_table_data6([]); //CHECK LIST
                init_table_data7([]);
                s.dept_list = d.data.dept_list;
                s.empl_type_list = d.data.employment_type;
                s.appr_status = d.data.status;
                s.travel_type_list = d.data.travel_type_list
                s.empl_name_list = d.data.empl_name_search
                s.ddl_search_empl_name_list = d.data.empl_name_search

                s.isDisAbledType = true
                s.travel_type_list_dtl = d.data.travel_type_list
                $("#ddl_empl_type").val("RE")
                s.ddl_empl_type = "";

                //**********************************************
                //  Show/Hide ADD, EDIT, DELETE button 
                //**********************************************
                //d.data.um.allow_add == "1" ? s.ShowAdd = true : s.ShowAdd = false;
                //d.data.um.allow_delete == "1" ? s.ShowDelete = true : s.ShowDelete = false;
                //d.data.um.allow_edit == "1" ? s.ShowEdit = true : s.ShowEdit = false;
                //d.data.um.allow_view    == "1" ? s.ShowView     = true : s.ShowView     = false;
                //d.data.um.allow_print == "1" ? s.ShowAdd = true : s.ShowAdd = false;

                s.ddl_dept = d.data.dept_code;
                s.ddl_dept_original = d.data.dept_code;

                if (s.ddl_dept == "03" || s.ddl_dept == "01" || d.data.empl_id == "10058") {
                    s.hr_enable_only = false
                    s.isShowAddDates = true
                    s.isShowAddEmployee = true
                    s.ddl_dept = ""
                    $("#ddl_dept").val("")
                }

                else {
                    s.hr_enable_only = true
                    s.isShowAddDates = false
                    s.isShowAddEmployee = false
                }

                $("#ddl_dept_rep").val("")
                s.ddl_dept_rep = ""


                setTimeout(function () {
                    s.FilterPageGridShowAction()

                }, 100)


                $("#modal_generating_remittance").modal("hide");
            }
            else {
                swal(d.data.message, { icon: "warning", });
            }

            //data_analytics()

            initMorris()

            s.getMorrisOffline()


            if (localStorage["minus_travel_order"] > 0) {
                setTimeout(function () {
                    minusOne("9404")

                }, 100)

            }
            else {
                setTimeout(function () {
                    localStorage["minus_travel_order"] = parseInt($("#" + "9404").text())
                    if (localStorage["minus_travel_order"] < 0) {
                        localStorage["minus_travel_order"] = 0
                        $("#" + id).text(localStorage["minus_travel_order"])
                        $("#tab_number").text(localStorage["minus_travel_order"])
                    }
                }, 100)


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
                bAutoWidth: false,
                columnDefs: [{ type: 'date', 'targets': [1] }],
                order: [[1, 'desc']],
                columns: [
                    {
                        "width": "10%",
                        "mData": "application_nbr",
                        "mRender":
                            function (data, type, full, row) {
                                return "<span  class='text-center btn-block'>" + data + "</span> <span ng-show='false'>test</span>"
                            }
                    },

                    {
                        "width": "10%",
                        "mData": "travel_datefiled",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "width": "8%",
                        "mData": "empl_id_creator",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "width": "32%",
                        "mData": "creator_name",
                        "mRender": function (data, type, full, row) {
                            var concat_content = "";
                            if (full["pa_initial"] == false) {
                                concat_content = "<span class='text-left btn-block text-danger'>" + data + "</span>" + '<small class="text-danger"><i class="fa fa-exclamation-triangle"></i> Check disapproved Employee!</small>';
                            }
                            else {
                                concat_content = "<span class='text-left btn-block'>" + data + "</span>" + concat_content;
                            }

                            return concat_content;
                        }
                    },

                    {
                        "width": "10%",
                        "mData": "reviewed_date",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },

                    {
                        "width": "10%",
                        "mData": "level1_approval_date",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },

                    //{
                    //    "mData": "worklist_status",
                    //    "mRender": function (data, type, full, row)
                    //    {
                    //        var temp = "";
                    //        if (full["approval_status"].toString() == "1" || full["approval_status"].toString() == "2" || full["approval_status"].toString() == "3") {
                    //            temp = "<b><span class='text-center btn-block approved-bg'>" + data + "</span></b>"
                    //        }
                    //        else if (full["approval_status"].toString() == "D") {
                    //            temp = "<b><span class='text-center btn-block disapproved-bg'>" + data + "</span></b>"
                    //        }
                    //        else if (full["approval_status"].toString() == "C" || full["approval_status"].toString() == "L") {
                    //            temp = "<b><span class='text-center btn-block cancel-bg'>" + data + "</span></b>"
                    //        }
                    //        else if (full["approval_status"].toString() == "N") {
                    //            temp = "<b><span class='text-center btn-block new-bg'>" + data + "</span></b>"
                    //        }
                    //        else if (full["approval_status"].toString() == "R") {
                    //            temp = "<b><span class='text-center btn-block reviewed-bg'>" + data + "</span></b>"
                    //        }
                    //        else if (full["approval_status"].toString() == "S") {
                    //            temp = "<b><span class='text-center btn-block submitted-bg'>" + data + "</span></b>"
                    //        }

                    //        else if (full["approval_status"].toString() == "F") {
                    //            temp = "<b><span class='text-center btn-block approved-bg'>" + 'Final Approved' + "</span></b>"
                    //        }
                    //        return temp;
                    //    }
                    //},

                    {
                        "width": "20%",
                        "mData": "worklist_action",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            var temp = "";
                            var button = "";
                            if (full["pa_initial"] == false) {
                                button = '<button id="btn-text_action" type="button" style="background-image: linear-gradient(140deg,#23c6c8 49%,#ED5564 50%) !important;" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="' + data + '"> ' + data + '</button >';
                            }
                            else {
                                button = '<button id="btn-text_action" type="button" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="' + data + '"> ' + data + '</button >';
                            }
                            temp = '<center><div class="btn-group">' +
                                button
                                //'<button id="btn-icon_action" type="button" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="' + data + '"><i class="fa fa-eye"></i></button >' +
                                + '<button id="btn-edit_appr" ng-show="' + s.allowapredit() + '" type="button" class="btn btn-warning btn-sm" ng-click="btn_edit_appr(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit Approver">Edit Approver</button >' +

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

    var init_table_data2 = function (par_data) {
        try {


            s.datalistgridEmployee = par_data;
            s.oTableEmployee = $('#datalist_gridEmployee').dataTable(
                {
                    data: s.datalistgridEmployee,
                    stateSave: false,
                    sDom: 'rt<"bottom"p>',
                    pageLength: 5,
                    columns: [
                        {
                            "width": "15%",
                            "targets": 0,
                            "mData": "empl_id",
                            "mRender": function (data, type, full, row) {
                                var return_value = "";
                                if (full["approved_status"] == false) {
                                    return_value = '<span class="text-center btn-block" style="text-decoration: line-through;color:red" ng-dblclick="show_reason(' + row["row"] + ')" data-toggle="tooltip" data-html="true" title="Double Click To Show Reason.">' + data + '</span>';
                                }
                                else {
                                    return_value = "<span class='text-center btn-block'>" + data + "</span>";
                                }

                                return return_value;
                            }
                        },
                        {
                            "width": "30%",
                            "targets": 1,
                            "mData": "employee_name",
                            "mRender": function (data, type, full, row) {
                                var return_value = "";
                                if (full["approved_status"] == false) {
                                    return_value = '<span class="text-left btn-block" style="text-decoration: line-through;color:red" ng-dblclick="show_reason(' + row["row"] + ')"  data-toggle="tooltip" data-html="true" title="Double Click To Show Reason."> &nbsp;' + data + '</span>';
                                }
                                else {
                                    return_value = "<span class='text-left btn-block'>" + data + "</span>";
                                }

                                return return_value;
                            }
                        },

                        {
                            "width": "35%",
                            "targets": 2,
                            "mData": "position_title1",
                            "mRender": function (data, type, full, row) {
                                var return_value = "";
                                if (full["approved_status"] == false) {
                                    return_value = '<span class="text-left btn-block" style="text-decoration: line-through;color:red" ng-dblclick="show_reason(' + row["row"] + ')" data-toggle="tooltip" data-html="true" title="Double Click To Show Reason."> &nbsp;' + data + '</span>';
                                }
                                else {
                                    return_value = "<span class='text-left btn-block'>" + data + "</span>";
                                }

                                return return_value;
                            }
                        },


                        {
                            "width": "15%",
                            "targets": 3,
                            "mData": null,
                            "bSortable": false,
                            "mRender": function (data, type, full, row) {

                                var display_undo = "none"
                                var display_delete = "block"
                                var temp = "";
                                var isdisabled = true

                                //if (full['rcrd_status'] == "F")
                                //{
                                //    display_delete = "block"
                                //    display_undo   = "none"
                                //}

                                //else
                                //{
                                //    display_delete   = "none"
                                //    display_undo     = "block"
                                //}

                                temp = '<center><div class="btn-group">' +
                                    //'<button style="display:' + display_undo + ';" type="button" ng-show="' + true + '" ng-disabled="' + true + '" class="btn btn-success btn-sm" ng-click="btn_undo_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Undo"><i class="fa fa-undo"></i></button>' +
                                    '<button  type="button" ng-disabled="' + s.btn_enabled_4HR + '" class="btn btn-info btn-sm" ng-click="btn_edit_type(' + row["row"] + ')" ng-show="' + true + '" " data-toggle="tooltip" data-placement="top" title="Edit"><i class="fa fa-edit"></i></button>' +
                                    '<button  type="button" ng-disabled="' + s.btn_enabled_4HR + '" class="btn btn-danger btn-sm" ng-click="btn_del_row(' + row["row"] + ')" ng-show="' + true + '" " data-toggle="tooltip" data-placement="top" title="Remove"><i class="fa fa-times"></i></button>' +

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

    var init_table_data3 = function (par_data) {
        try {
            s.datalistgridDates = par_data;
            s.oTableDates = $('#datalist_gridDates').dataTable(
                {
                    data: s.datalistgridDates,
                    stateSave: false,
                    sDom: 'rt<"bottom"p>',
                    pageLength: 5,
                    columns: [
                        {
                            "width": "15%",
                            "targets": 0,
                            "mData": "travel_date_descr",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "35%",
                            "targets": 1,
                            "mData": "travel_starttime_display",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },

                        {
                            "width": "35%",
                            "targets": 2,
                            "mData": "travel_endtime_display",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
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
                                if (full['rcrd_status'] == "N") {
                                    isdisabled = false
                                }
                                else {
                                    isdisabled = true
                                }

                                temp = '<center><div class="btn-group">' +
                                    '<button type="button" ng-disabled="' + s.btn_enabled_4HR + '"  class="btn btn-info btn-sm" ng-click="btn_edit_row_dates(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit"><i class="fa fa-edit"></i></button>' +
                                    '<button type="button" ng-disabled="' + s.btn_enabled_4HR + '"  class="btn btn-danger btn-sm" ng-click="btn_del_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Remove"><i class="fa fa-times"></i></button>' +
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

    var init_table_data4 = function (par_data) {
        try {
            s.datalistgridDates_dtl = par_data;
            s.oTableDates_dtl = $('#datalist_gridDates_dtl').dataTable(
                {
                    data: s.datalistgridDates_dtl,
                    stateSave: false,
                    sDom: 'rt<"bottom"p>',
                    pageLength: 5,
                    columns: [
                        {
                            "width": "15%",
                            "targets": 0,
                            "mData": "app_inclusive_date",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "35%",
                            "targets": 1,
                            "mData": "employee_name",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
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
                                if (full['rcrd_status'] == "N") {
                                    isdisabled = false
                                }
                                else {
                                    isdisabled = true
                                }

                                temp = '<center><div class="btn-group">' +
                                    '<button type="button" ng-disabled="' + s.btn_enabled_4HR + '"  class="btn btn-danger btn-sm" ng-click="btn_del_row_dtl(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Remove"><i class="fa fa-times"></i></button>' +
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
                            "mData": "travel_order_no",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "50%",
                            "targets": 1,
                            "mData": "travel_purpose",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-left btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "40%",
                            "targets": 1,
                            "mData": "travel_date_covered",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block badge badge-success'>" + data + "</span>"
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

    var init_table_data6 = function (par_data) {
        try {
            s.datalistgridCheck = par_data;
            s.oTableCheck_dtl = $('#datalist_grid_check').dataTable(
                {
                    data: s.datalistgridCheck,
                    stateSave: false,
                    sDom: 'rt<"bottom"p>',
                    pageLength: 20,
                    rowId: 'row_nbr',
                    columns: [

                        {
                            "mData": null,
                            "mRender": function (data, type, full, row) {
                                return "<center><span class='details-control ' style='display:block;' ng-click='btn_show_details_check(" + '"details_info"' + ")' ></center>"
                                //return "<center><span class='details-control' style='display:block;'></center>"
                            }
                        },

                        {
                            "width": "10%", "targets": 1, "mData": "approved_status", "mRender": function (data, type, full, row) {

                                var isdisabled = ""


                                if (account_user_id == s.pa_approver) {



                                    if (full["pa_writeonly"] == true) {
                                        isdisabled = ""
                                    }
                                    else {
                                        isdisabled = "disabled"
                                    }

                                }
                                else {

                                    isdisabled = "disabled"
                                }

                                var checked = ""

                                if (data == "Y") { //APPROVED
                                    checked = "checked"
                                }

                                else {
                                    checked = ""
                                }

                                //return '<input class="cb_check" style="width:30px; padding-top:0px;" id="checkbox' + row["row"] + '" ng-click="btn_check_action(' + row["row"] + ')" type="checkbox"' + checked + ' ' + isdisabled + '><label for="checkbox' + row["row"] + '"></label>'
                                //return '<input type="checkbox" ng-disabled="' + data + ' == 1 || check_action' + row["row"] + '== true" class="form-control cb_check" ng-model="checkbx' + row["row"] + '" ng-click="check_one(' + row["row"] + ')" ng-checked="' + data + ' == 1"/>'
                                return '<center><input class="form-control cb_check hver" id="checkbox' + row["row"] + '" ng-click="btn_check_action(' + row["row"] + ')" type="checkbox"' + checked + ' ' + isdisabled + '/></center>'

                            }
                        },

                        {
                            "width": "10%", "targets": 1, "mData": "approved_status", "mRender": function (data, type, full, row) {
                                var checked = ""

                                var isdisabled = ""

                                if (account_user_id == s.pa_approver) {
                                    if (full["pa_writeonly"] == true) {
                                        isdisabled = ""
                                    }
                                    else {
                                        isdisabled = "disabled"
                                    }

                                }
                                else {

                                    isdisabled = "disabled"
                                }


                                if (data == "D") { //DISAPPROVED
                                    checked = "checked"
                                }

                                else {
                                    checked = ""
                                }

                                //return '<input class="cb_check" style="width:30px; padding-top:0px;" id="checkbox' + row["row"] + '" ng-click="btn_check_action(' + row["row"] + ')" type="checkbox"' + checked + ' ' + isdisabled + '><label for="checkbox' + row["row"] + '"></label>'
                                //return '<input type="checkbox" ng-disabled="' + data + ' == 1 || check_action' + row["row"] + '== true" class="form-control cb_check" ng-model="checkbx' + row["row"] + '" ng-click="check_one(' + row["row"] + ')" ng-checked="' + data + ' == 1"/>'
                                return '<center><input class="form-control cb_check hver" id="checkbox_dis' + row["row"] + '" ng-click="btn_check_action_dis(' + row["row"] + ')" type="checkbox"' + checked + ' ' + isdisabled + '/></center>'

                            }
                        },
                        {
                            "width": "10%",
                            "targets": 0,
                            "mData": "travel_order_no",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block hver'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "50%",
                            "targets": 1,
                            "mData": "employee_name",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-left btn-block hver'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "50%",
                            "targets": 1,
                            "mData": "department_short_name",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-left btn-block hver'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "40%",
                            "targets": 1,
                            "mData": "travel_place_visit",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-left hver'>" + data + "</span>"
                            }
                        },

                        {
                            "width": "15%",
                            "targets": 1,
                            "mData": "travel_datefiled_original",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block badge badge-success hver'>" + data + "</span>"
                            }
                        },

                        {
                            "width": "20%",
                            "targets": 1,
                            "mData": "dtr_date",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-left badge badge-success hver' style='white-space:normal !important;'>" + data + "</span>"
                                //return "<span class='text-center btn-block badge badge-success'>" + data + "</span>"
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

    var init_table_data7 = function (par_data) {
        try {
            s.datalistgridCheckActioned = par_data;
            s.oTableCheck_dtl_actioned = $('#datalist_grid_check_actioned').dataTable(
                {
                    data: s.datalistgridCheckActioned,
                    stateSave: false,
                    sDom: 'rt<"bottom"p>',
                    pageLength: 20,
                    columns: [

                        {
                            "mData": null,
                            "mRender": function (data, type, full, row) {
                                return "<center><span class='details-control hver' style='display:block;' ng-click='btn_show_details_check(" + '"details_info"' + ")' ></center>"
                            }
                        },

                        {
                            "width": "10%", "targets": 1, "mData": "approved_status", "mRender": function (data, type, full, row) {

                                var isdisabled = ""


                                if (account_user_id == s.pa_approver) {



                                    if (full["pa_writeonly"] == true) {
                                        isdisabled = ""
                                    }
                                    else {
                                        isdisabled = "disabled"
                                    }

                                }
                                else {

                                    isdisabled = "disabled"
                                }

                                var checked = ""

                                if (data == "Y") { //APPROVED
                                    checked = "checked"
                                }

                                else {
                                    checked = ""
                                }

                                //return '<input class="cb_check" style="width:30px; padding-top:0px;" id="checkbox' + row["row"] + '" ng-click="btn_check_action(' + row["row"] + ')" type="checkbox"' + checked + ' ' + isdisabled + '><label for="checkbox' + row["row"] + '"></label>'
                                //return '<input type="checkbox" ng-disabled="' + data + ' == 1 || check_action' + row["row"] + '== true" class="form-control cb_check" ng-model="checkbx' + row["row"] + '" ng-click="check_one(' + row["row"] + ')" ng-checked="' + data + ' == 1"/>'
                                return '<center><input class="form-control cb_check hver" id="checkbox_2' + row["row"] + '" ng-click="btn_check_action_2(' + row["row"] + ')" type="checkbox"' + checked + ' ' + isdisabled + '/></center>'

                            }
                        },

                        {
                            "width": "10%", "targets": 1, "mData": "approved_status", "mRender": function (data, type, full, row) {
                                var checked = ""

                                var isdisabled = ""

                                if (account_user_id == s.pa_approver) {
                                    if (full["pa_writeonly"] == true) {
                                        isdisabled = ""
                                    }
                                    else {
                                        isdisabled = "disabled"
                                    }

                                }
                                else {

                                    isdisabled = "disabled"
                                }


                                if (data == "D") { //DISAPPROVED
                                    checked = "checked"
                                }

                                else {
                                    checked = ""
                                }

                                //return '<input class="cb_check" style="width:30px; padding-top:0px;" id="checkbox' + row["row"] + '" ng-click="btn_check_action(' + row["row"] + ')" type="checkbox"' + checked + ' ' + isdisabled + '><label for="checkbox' + row["row"] + '"></label>'
                                //return '<input type="checkbox" ng-disabled="' + data + ' == 1 || check_action' + row["row"] + '== true" class="form-control cb_check" ng-model="checkbx' + row["row"] + '" ng-click="check_one(' + row["row"] + ')" ng-checked="' + data + ' == 1"/>'
                                return '<center><input class="form-control cb_check hver" id="checkbox_dis_2' + row["row"] + '" ng-click="btn_check_action_dis_2(' + row["row"] + ')" type="checkbox"' + checked + ' ' + isdisabled + '/></center>'

                            }
                        },
                        {
                            "width": "10%",
                            "targets": 0,
                            "mData": "travel_order_no",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block hver'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "50%",
                            "targets": 1,
                            "mData": "employee_name",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-left btn-block hver'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "50%",
                            "targets": 1,
                            "mData": "department_short_name",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-left btn-block hver'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "40%",
                            "targets": 1,
                            "mData": "travel_place_visit",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-left hver'>" + data + "</span>"
                            }
                        },

                        {
                            "width": "15%",
                            "targets": 1,
                            "mData": "travel_datefiled_original",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block badge badge-success hver'>" + data + "</span>"
                            }
                        },

                        {
                            "width": "20%",
                            "targets": 1,
                            "mData": "dtr_date",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-left badge badge-success hver' style='white-space:normal !important;'>" + data + "</span>"
                                //return "<span class='text-center btn-block badge badge-success'>" + data + "</span>"
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
    //*** Get Table Name         
    //**********************************// 
    s.getActiveTab = function (value) {

        if (value == 1 || value == "1") {
            tname = "oTableEmployee";
        }

        else if (value == 2 || value == "2") {
            tname = "oTableDates";
        }

    }

    ////************************************// 
    ////*** Delete Record              
    ////**********************************// 
    //s.btn_del_row = function (row_index) {
    //    var dt = s.datalistgridEmployee[row_index]
    //    console.log(dt)
    //    btn_del_row(row_index)
    //}



    //************************************// 
    //*** Update Travel Type Record              
    //**********************************// 


    s.show_reason = function (row) {
        console.log(s.datalistgridEmployee[row]);
        swal({ icon: "error", title: "DISAPPROVED", text: "Reason: " + s.datalistgridEmployee[row].comment });
    }
    s.btn_click_employee = function () {
        message = "Are you sure to update this record?"
        swal({
            title: message,
            text: "Once Updated, you will not be able to recover this record!",
            icon: "warning",
            buttons: true,
            dangerMode: true,

        })
            .then(function (willDelete) {
                if (willDelete) {
                    h.post("../cATSTOAppr/UpdateTOType", {
                        travel_order_no: s.datalistgridEmployee[s.temp_row_id_type].travel_order_no
                        , empl_id: s.datalistgridEmployee[s.temp_row_id_type].empl_id
                        , traveltype_code: $("#travel_type_dtl").val()
                        , rcrd_status: s.datalistgridEmployee[s.temp_row_id_type].rcrd_status
                    }).then(function (d) {

                        if (d.data.message == "success") {
                            s.datalistgridEmployee[s.temp_row_id_type].traveltype_code = $("#travel_type_dtl").val()
                            s.datalistgridEmployee[s.temp_row_id_type].travel_type_descr = $("#travel_type_dtl option:selected").text()

                            s.oTableEmployee.fnClearTable();
                            s.oTableEmployee.fnAddData(s.datalistgridEmployee)

                            swal("Successfully Update!", "Current Record has been updated successfully!", "success");

                        }

                    })


                }
            });

    }
    //************************************// 
    //*** Update Travel Type Record              
    //**********************************// 
    s.btn_edit_type = function (row_index) {

        s.temp_row_id_type = row_index
        var dt = s.datalistgridEmployee[row_index]
        s.isShowAddEmployee = false
        s.isShowUpdateEmployee = true
        s.isDisAbledType = false
        s.empl_id_update = ""

        h.post("../cATSTOAppr/RetrieveTOTypeDetails", {
            travel_order_no: s.datalistgridEmployee[row_index].travel_order_no
            , empl_id: s.datalistgridEmployee[row_index].empl_id
            //, traveltype_code: $("#travel_type_dtl").val()
            //, rcrd_status: s.datalistgridEmployee[row_index].rcrd_status
        }).then(function (d) {

            if (d.data.message == "success") {
                if (d.data.sp_travelordertype_empl_dtl_tbl_list[0].travel_type_code == "") {
                    $("#travel_type_dtl").val(s.travelorder_hdr_tbl_updatetype[0].travel_type_code)

                }
                else {
                    $("#travel_type_dtl").val(d.data.sp_travelordertype_empl_dtl_tbl_list[0].travel_type_code)
                }


                $("#txtb_empl_id_dspl").val(d.data.sp_travelordertype_empl_dtl_tbl_list[0].employee_name);

            }

        })

    }
    s.btn_update_date = function () {
        var dt = s.datalistgridEmployee[s.temp_row_id_type]
        $("#txtb_empl_name_cancel").val(dt.employee_name)
        $("#txtb_empl_id_cancel").val(dt.empl_id)
        $("#txtb_travel_purpose_cancel").val($("#txtb_travel_purpose_dspl").val())
        $("#txtb_travel_place_cancel").val($("#txtb_travel_place_dspl").val())
        //RETRIEVE DATA PANG LAST
        h.post("../cATSTOAppr/RetrieveEmployeeCancel",
            {
                par_application_nbr: $("#txtb_travel_order_nbr_dspl").val()
                , par_transaction_ref: "003"
                , par_empl_id: dt.empl_id
            }).then(function (d) {
                if (d.data.message == "success") {
                    s.oTableDates_dtl.fnClearTable();
                    if (d.data.sp_cancel_application_dtl_list.length > 0) {
                        s.oTableDates_dtl.fnAddData(d.data.sp_cancel_application_dtl_list);
                        s.datalistgridDates_dtl = d.data.sp_cancel_application_dtl_list;
                    }

                    $("#TO_ind_date_edit_modal").modal("show")
                }
                else {
                    swal(d.data.message, { icon: "error" })
                }
            })



    }

    s.btn_click_dates_cancel = function () {


        if ($("#txtb_inclusive_date").val().trim() != "") {


            var data = {
                application_nbr: $("#txtb_travel_order_nbr_dspl").val()
                , transaction_code: "003"
                , created_by: ""
                , created_ddtm: ""
                , app_inclusive_date: $("#txtb_inclusive_date").val()
                , empl_id: $("#txtb_empl_id_cancel").val()
                , app_purpose: $("#txtb_travel_purpose_cancel").val()
                , app_place: $("#txtb_travel_place_cancel").val()
                , remarks: $("#txtb_remarks_cancel").val()
                , justification_remarks: $("#txtb_reason_cancel").val()
                , as_type: ""
                , reason_code: ""
                , approval_id: ""
                , approval_status: ""
                , action_status: "F"
                , employee_name: $("#txtb_empl_name_cancel").val()
            }

            h.post("../cATSTOAppr/AddTOEmployeeCancel", {
                data: data
            }).then(function (d) {
                if (d.data.message == "success") {

                    s.oTableDates_dtl.fnClearTable();
                    s.datalistgridDates_dtl.push(data)
                    if (s.datalistgridDates_dtl.length > 0) {
                        s.oTableDates_dtl.fnAddData(s.datalistgridDates_dtl);
                    }

                    clearEntryCancel()

                    swal("Successfully Cancelled!", "Current record has been cancelled successfully!", "success");

                }

                else {
                    swal(d.data.message, { icon: "error" })
                }

            })

        }

        else {
            swal("Please provide inclusive date!", "", "error");
        }
    }

    function clearEntryCancel() {
        $("#txtb_reason_cancel").val("")
        $("#txtb_remarks_cancel").val("")
        $("#txtb_inclusive_date").val("")
    }


    s.btn_del_row_dtl = function (row_index) {

        var message = ""
        message = "Are you sure to delete this record?"

        if (s.ddl_dept_original == "03" || s.ddl_dept_original == "01") {
            swal({
                title: message,
                text: "Once deleted, you will not be able to recover this record!",
                icon: "warning",
                buttons: true,
                dangerMode: true,

            })
                .then(function (willDelete) {
                    if (willDelete) {
                        h.post("../cATSTOAppr/deleteTOEmployee_dtl", {
                            par_application_nbr: $("#txtb_travel_order_nbr_dspl").val()
                            , par_transaction_ref: "003"
                            , par_empl_id: $("#txtb_empl_id_cancel").val()
                            , travel_date: s.datalistgridDates_dtl[row_index].app_inclusive_date
                        }).then(function (d) {

                            if (d.data.icon == "success") {
                                swal("Successfully Deleted!", "Current record has been deleted successfully!", "success");


                                s.datalistgridDates_dtl = s.datalistgridDates_dtl.delete(row_index);

                                s.oTableDates_dtl.fnClearTable();

                                if (s.datalistgridDates_dtl.length != 0) {
                                    s.oTableDates_dtl.fnAddData(s.datalistgridDates_dtl);
                                }




                            }
                            else {
                                swal(d.data.message, { icon: d.data.icon })
                            }

                        })



                    }
                });
        }

    }





    //************************************// 
    //*** Delete Record              
    //**********************************// 
    s.btn_del_row = function (row_index) {

        try {
            var dt = s.datalistgridEmployee[row_index]


            if (tname == "oTableEmployee") {
                var message = ""


                message = "Are you sure to delete this record?"

                if (s.datalistgridEmployee[row_index].rcrd_status == "F" || s.ddl_dept_original == "03" || s.ddl_dept_original == "01") {
                    swal({
                        title: message,
                        text: "Once deleted, you will not be able to recover this record!",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,

                    })
                        .then(function (willDelete) {
                            if (willDelete) {
                                h.post("../cATSTOAppr/deleteTOEmployee", {
                                    data: dt
                                }).then(function (d) {

                                    if (d.data.icon == "success") {
                                        if (d.data.del_to_empl == true) {
                                            location.href = "cATSTOAppr/index"


                                        }
                                        else {
                                            s.datalistgridEmployee = s.datalistgridEmployee.delete(row_index);
                                            s.datalistgridEmployee[row_index].rcrd_status = 'L'
                                            s.oTableEmployee.fnClearTable();

                                            if (s.datalistgridEmployee.length != 0) {
                                                s.oTableEmployee.fnAddData(s.datalistgridEmployee);
                                            }

                                            swal(d.data.message, { icon: d.data.icon })
                                        }
                                    }
                                    else {
                                        swal(d.data.message, { icon: d.data.icon })
                                        s.datalistgridEmployee = d.data.sp_travel_order_empl_dtl.refreshTable("datalist_gridEmployee", "")
                                    }






                                })



                            }
                        });
                }
            }

            else if (tname == "oTableDates") {


                var message = ""
                //if (s.datalistgrid.length > 0) {
                //
                //    header_status = s.datalistgrid.select(s.datalistgridDates[row_index].travel_order_no, "travel_order_no").approval_status
                //	
                //	alert(header_status)
                //
                //}
                //
                //else {
                //    header_status = ""
                //
                //}
                //console.log(s.datalistgridDates[row_index])
                //alert(s.datalistgridDates[row_index])

                message = "Are you sure to delete this record?"


                //if (s.datalistgridDates[row_index].rcrd_status == "F") {
                swal({
                    title: message,
                    text: "Once deleted, you will not be able to recover this record!",
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,

                })
                    .then(function (willDelete) {
                        if (willDelete) {

                            h.post("../cATSTOAppr/delete_TO_dates", {
                                travel_order_no: s.datalistgridDates[row_index].travel_order_no
                                , dd_travel_date_from_orig: s.datalistgridDates[row_index].travel_date
                                , dd_travel_date_from: s.datalistgridDates[row_index].travel_date
                                , dd_travel_date_to: s.datalistgridDates[row_index].travel_date_to
                                , dd_travel_start_time: s.datalistgridDates[row_index].travel_starttime
                                , dd_starttime_meridem: s.datalistgridDates[row_index].travel_starttime_ampm
                                , dd_travel_end_time: s.datalistgridDates[row_index].travel_endtime
                                , dd_endtime_meridem: s.datalistgridDates[row_index].travel_endtime_ampm
                            }).then(function (d) {

                                if (d.data.icon == "success") {
                                    s.datalistgridDates = s.datalistgridDates.delete(row_index);

                                    s.oTableDates.fnClearTable();

                                    if (s.datalistgridDates.length != 0) {
                                        s.oTableDates.fnAddData(s.datalistgridDates);
                                    }

                                    message = "deleted"
                                    swal("Your record has been " + message + "!", { icon: "success", });

                                    clearentryDates();
                                }
                                else {
                                    swal(d.data.message, { icon: d.data.icon })
                                }




                            })


                        }
                    });
                //}

            }



        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    s.btn_edit_row_dates = function (row) {
        var dt = s.datalistgridDates[row]
        s.txtb_travel_date_dspl = dt.travel_date_descr
        s.txtb_travel_start_dspl = dt.travel_starttime
        s.txtb_travel_end_dspl = dt.travel_endtime
        s.txtb_starttime = dt.travel_starttime_ampm
        s.txtb_endtime = dt.travel_endtime_ampm

        s.dd_travel_date_from_orig = dt.travel_date.add_html_obj_value("dd_travel_date_from")

        s.dd_travel_date_from = dt.travel_date.add_html_obj_value("dd_travel_date_from")
        s.dd_travel_date_to = dt.travel_date_to.add_html_obj_value("dd_travel_date_to")
        s.dd_travel_start_time = dt.travel_starttime.add_html_obj_value("dd_travel_start_time")
        s.dd_starttime_meridem = dt.travel_starttime_ampm.add_html_obj_value("dd_starttime_meridem")
        s.dd_travel_end_time = dt.travel_endtime.add_html_obj_value("dd_travel_end_time")
        s.dd_endtime_meridem = dt.travel_endtime_ampm.add_html_obj_value("dd_endtime_meridem")
        $("#TO_date_edit_modal").modal("show")


        //rcrd_status: "F"
        //travel_date: "2021-08-03"
        //travel_date_descr: "08/03 - 08/03/2021"
        //travel_date_to: "2021-08-03"
        //travel_endtime: "05:00"
        //travel_endtime_ampm: "PM"
        //travel_endtime_display: "05:00 PM"
        //travel_order_no: "0000000045"
        //travel_starttime: "08:00"
        //travel_starttime_ampm: "AM"
        //travel_starttime_display: "08:00 AM"

    }

    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidationResultColorDates(par_object_id, par_v_result) {
        if (par_v_result) {

            //Add class to the obect that need to focus as a required..
            if (par_object_id == "txtb_travel_date_dspl_exists") {
                $("#txtb_travel_date_dspl").addClass("required");
                $("#lbl_txtb_travel_date_req").text("Already Exist!");
                $("#txtb_travel_date_to_dspl").addClass("required");
                $("#lbl_txtb_travel_date_to_req").text("Already Exist!");
            }

            else if (par_object_id == "txtb_travel_date_dspl_covered") {
                $("#txtb_travel_date_dspl").addClass("required");
                $("#lbl_txtb_travel_date_req").text("Invalid Period Covered!");
                $("#txtb_travel_date_to_dspl").addClass("required");
                $("#lbl_txtb_travel_date_to_req").text("Invalid Period Covered!");
            }

            else if (par_object_id == "txtb_travel_date") {
                $("#" + par_object_id + "_dspl").addClass("required");
                $("#lbl_" + par_object_id + "_req").text("Required Field!");
            }

            else if (par_object_id == "txtb_travel_date_to") {
                $("#" + par_object_id + "_dspl").addClass("required");
                $("#lbl_" + par_object_id + "_req").text("Required Field!");
            }

            else if (par_object_id == "txtb_travel_start") {
                $("#" + par_object_id + "_dspl").addClass("required");
                $("#lbl_" + par_object_id + "_req").text("Required Field!");
            }

            else if (par_object_id == "txtb_travel_end") {
                $("#" + par_object_id + "_dspl").addClass("required");
                $("#lbl_" + par_object_id + "_req").text("Required Field!");
            }

            else if (par_object_id == "txtb_travel_end-invalid") {
                $("#txtb_travel_end_dspl").addClass("required");
                $("#lbl_txtb_travel_end_req").text("Invalid Time Format!");
            }

            else if (par_object_id == "txtb_travel_start-invalid") {
                $("#txtb_travel_start_dspl").addClass("required");
                $("#lbl_txtb_travel_start_req").text("Invalid Time Format!");
            }

            else if (par_object_id == "txtb_travel_date-invalid") {
                $("#txtb_travel_date_dspl").addClass("required");
                $("#lbl_txtb_travel_date_req").text("Invalid Date Format!");
            }

            else if (par_object_id == "txtb_travel_date_to-invalid") {
                $("#txtb_travel_date_to_dspl").addClass("required");
                $("#lbl_txtb_travel_date_to_req").text("Invalid Date Format!");
            }





        }
        else {
            //remove of refresh the object form being required

            $("#txtb_travel_date_dspl").removeClass("required");
            $("#lbl_txtb_travel_date_req").text("");
            $("#txtb_travel_start_dspl").removeClass("required");
            $("#lbl_txtb_travel_start_req").text("");
            $("#txtb_travel_end_dspl").removeClass("required");
            $("#lbl_txtb_travel_end_req").text("");
            $("#txtb_travel_date_to_dspl").removeClass("required");
            $("#lbl_txtb_travel_date_to_req").text("");

        }
    }

    function CheckDateExists(from, to, check) {
        var d_from = new Date(from)
        var d_to = new Date(to)
        var d_c = new Date(check)

        if ((d_c <= d_to && d_c >= d_from)) {
            return true;
        }
        return false;
    }

    function CheckPeriodCovered(from, to) {
        var d_from = new Date(from)
        var d_to = new Date(to)
        if (d_from > d_to) {
            return true;
        }
        return false;
    }

    function validateDate(val) {
        var return_val = false


        var date_regex = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
        if (!(date_regex.test(val))) {
            return_val = false;
        }

        else {
            return_val = true;
        }
        return return_val
    }

    function isdataValidatedDates() {

        var return_val = true;
        s.already_exist = false;



        ValidationResultColorDates("ALL", false);

        if (s.datalistgridDates.length > 0) {
            for (var x = 0; x < s.datalistgridDates.length; x++) {

                if (CheckDateExists(s.datalistgridDates[x].travel_date, s.datalistgridDates[x].travel_date_to, $("#txtb_travel_date_dspl").val()) && btn_grid_action == 'A') {
                    s.already_exist = true

                }

                if (CheckDateExists(s.datalistgridDates[x].travel_date, s.datalistgridDates[x].travel_date_to, $("#txtb_travel_date_to_dspl").val()) && btn_grid_action == 'A') {
                    s.already_exist = true
                }
            }

        }



        if (s.already_exist == true) {
            ValidationResultColorDates("txtb_travel_date_dspl_exists", true);
            return_val = false;
        }

        if (CheckPeriodCovered($("#dd_travel_date_from").val().trim(), $("#dd_travel_date_to").val().trim())) {
            ValidationResultColorDates("txtb_travel_date_dspl_covered", true);
            return_val = false;

        }

        if ($("#txtb_travel_date_dspl").val().trim() == "") {

            ValidationResultColorDates("txtb_travel_date", true);
            return_val = false;
        }




        if ($("#dd_travel_date_to").val().trim() == "") {

            ValidationResultColorDates("txtb_travel_date_to", true);
            return_val = false;
        }


        else {
            if (validateDate($("#txtb_travel_date_to_dspl").val()) == false) {
                ValidationResultColorDates("txtb_travel_date_to-invalid", true);
                return_val = false;
            }
        }

        if ($("#txtb_travel_start_dspl").val().trim() == "") {

            ValidationResultColorDates("txtb_travel_start", true);
            return_val = false;
        }

        else {

            if ((validatetime($("#txtb_travel_start_dspl").val().trim()) == false)) {
                ValidationResultColorDates("txtb_travel_start-invalid", true);
                return_val = false;
            }


        }

        if ($("#txtb_travel_end_dspl").val().trim() == "") {

            ValidationResultColorDates("txtb_travel_end", true);
            return_val = false;
        }

        else {

            if ((validatetime($("#txtb_travel_end_dspl").val().trim()) == false)) {
                ValidationResultColorDates("txtb_travel_end-invalid", true);
                return_val = false;
            }


        }

        return return_val
    }

    function getFormatDate(period_from, period_to) {
        var s_date = new Date(period_from);
        var s_dd = String(s_date.getDate()).padStart(2, '0');
        var s_mm = String(s_date.getMonth() + 1).padStart(2, '0'); //January is 0!
        //var s_yyyy = s_date.getFullYear();

        //01 / 01 - 01 / 03 / 2020

        var e_date = new Date(period_to);
        var e_dd = String(e_date.getDate()).padStart(2, '0');
        var e_mm = String(e_date.getMonth() + 1).padStart(2, '0'); //January is 0!
        var e_yyyy = e_date.getFullYear();

        var period_descr = period_from

        if (period_from != period_to) {

            period_descr = s_mm + '/' + s_dd + ' - ' + e_mm + '/' + e_dd + '/' + e_yyyy
        }

        else {
            period_descr = period_from
        }

        return period_descr
    }

    function getValueFromDates() {
        var dataEmployee =
        {
            travel_order_no: $("#txtb_travel_order_nbr_dspl").val()
            , travel_date: $("#dd_travel_date_from").val()
            , travel_date_to: $("#dd_travel_date_to").val()
            , travel_date_descr: getFormatDate($("#dd_travel_date_from").val(), $("#dd_travel_date_to").val())
            , travel_starttime: $("#dd_travel_start_time").val()
            , travel_starttime_ampm: $("#dd_starttime_meridem").val()
            , travel_endtime: $("#dd_travel_end_time").val()
            , travel_endtime_ampm: $("#dd_endtime_meridem").val()
            , travel_starttime_display: $("#dd_travel_start_time").val() + " " + $("#dd_starttime_meridem").val()
            , travel_endtime_display: $("#dd_travel_end_time").val() + " " + $("#dd_endtime_meridem").val()
            , rcrd_status: "N"

        }
        return dataEmployee
    }

    //**************************************//
    //***Get Page Number****//
    //**************************************//
    function get_page(code, table) {
        var nakit_an = false;
        var rowx = 0;

        $('#' + table + ' tr').each(function () {
            $.each(this.cells, function (cells) {
                if (cells == 0) {
                    if ($(this).text() == code) {
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

    //Added By: Jorge Rustom Villanueva 05/23/2020
    s.btn_click_dates = function (value) {

        value = "A"
        tname = "oTableDates"
        btn_grid_action = value
        cs.notrequired2("txtb_travel_date_dspl")
        cs.notrequired2("txtb_travel_date_to_dspl")
        var vs = "validatesubmit2"
        var vt = "validate_textfield"
        if (cs[vs]("edit_to_dates") && cs[vt]("dd_starttime_meridem") && cs[vt]("dd_endtime_meridem")) {

            //var datecurr = new Date(s.txtb_travel_date_filed_dspl)
            //var datefrom = new Date($("#txtb_travel_date_dspl").val())
            //var dateto = new Date($("#txtb_travel_date_to_dspl").val())
            //if (datecurr.getDate() > datefrom.getDate() && datecurr.getDate() > dateto.getDate()) {
            //    swal("Please select a date that is atleast greater than the current date ", { icon: "error" })
            //    cs.required2("txtb_travel_date_dspl", "Invalide Date")
            //    cs.required2("txtb_travel_date_to_dspl", "Invalide Date")
            //    return
            //}
            //if (datecurr.getDate() > datefrom.getDate()) {
            //    cs.required2("txtb_travel_date_dspl", "Invalide Date")
            //    swal("Please select a date that is atleast greater than the current date", { icon: "error" })
            //    return
            //}
            //if (datecurr.getDate() > dateto.getDate()) {
            //    cs.required2("txtb_travel_date_to_dspl", "Invalide Date")
            //    swal("Please select a date that is atleast greater than the current date", { icon: "error" })
            //    return
            //}

            if (value == 'A') //FOR ADD BUTTON
            {
                h.post("cATSTOAppr/add_TO_dates", {
                    travel_order_no: $("#txtb_travel_order_nbr_dspl").val()
                    , dd_travel_date_from_orig: s.dd_travel_date_from_orig
                    , dd_travel_date_from: s[gv]("dd_travel_date_from")
                    , dd_travel_date_to: s[gv]("dd_travel_date_to")
                    , dd_travel_start_time: s[gv]("dd_travel_start_time")
                    , dd_starttime_meridem: s[gv]("dd_starttime_meridem")
                    , dd_travel_end_time: s[gv]("dd_travel_end_time")
                    , dd_endtime_meridem: s[gv]("dd_endtime_meridem")
                }).then(function (d) {
                    if (d.data.icon == "success") {
                        var dates_row_info = getValueFromDates()
                        s.datalistgridDates.push(dates_row_info)
                        s.oTableDates.fnClearTable();
                        s.oTableDates.fnAddData(s.datalistgridDates)

                        for (var x = 1; x <= $('#datalist_gridDates').DataTable().page.info().pages; x++) {

                            if (get_page(dates_row_info.travel_date_descr, "datalist_gridDates") == false) {
                                s.oTableDates.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }
                        swal("Successfully Added!", "New Record has been Successfully Added!", "success");
                    }
                    else {
                        swal("Error in updating!", { icon: d.data.icon })
                    }

                })






            }



            clearentryDates()


        }
    }
    s.btn_todate_edit_click = function () {
        var vs = "validatesubmit2"
        var vt = "validate_textfield"
        if (cs[vs]("edit_to_dates") && cs[vt]("dd_starttime_meridem") && cs[vt]("dd_endtime_meridem")) {

            s.already_exist = false
            var btn_grid_action = 'U'
            if (s.datalistgridDates.length > 0) {
                for (var x = 0; x < s.datalistgridDates.length; x++) {

                    if (CheckDateExists(s.datalistgridDates[x].travel_date, s.datalistgridDates[x].travel_date_to, $("#dd_travel_date_from").val()) && btn_grid_action == 'A') {
                        s.already_exist = true

                    }

                    if (CheckDateExists(s.datalistgridDates[x].travel_date, s.datalistgridDates[x].travel_date_to, $("#dd_travel_date_to").val()) && btn_grid_action == 'A') {
                        s.already_exist = true
                    }
                }

            }
            if (s.already_exist == true) {
                swal("Travel Date Already Exists!", { icon: "error" })
            }
            else {
                h.post("cATSTOAppr/edit_TO_dates", {
                    travel_order_no: $("#txtb_travel_order_nbr_dspl").val()
                    , dd_travel_date_from_orig: s.dd_travel_date_from_orig
                    , dd_travel_date_from: s[gv]("dd_travel_date_from")
                    , dd_travel_date_to: s[gv]("dd_travel_date_to")
                    , dd_travel_start_time: s[gv]("dd_travel_start_time")
                    , dd_starttime_meridem: s[gv]("dd_starttime_meridem")
                    , dd_travel_end_time: s[gv]("dd_travel_end_time")
                    , dd_endtime_meridem: s[gv]("dd_endtime_meridem")
                }).then(function (d) {
                    if (d.data.icon == "success") {
                        s.datalistgridDates = d.data.sp_travelorder_dates_dtl_tbl_list.refreshTable("datalist_gridDates", "")
                        swal("Successfully updated!", { icon: d.data.icon })
                    }
                    else {
                        swal("Error in updating!", { icon: d.data.icon })
                    }

                })
            }

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

    s.FilterPageGridShowAction = function () {
        var show_action = $('#chk_show_approved').prop("checked") == true ? "Y" : "N"
        if (show_action == "N") {
            $("#datalist_grid").DataTable().column(6).search("For").draw();
        }
        else {
            $("#datalist_grid").DataTable().column(6).search("View Details").draw();
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

        if ($('#txtb_travel_details_dspl').val() == "") {
            ValidationResultColor("txtb_travel_details_dspl", true);
            $('.nav-tabs a[href="#tab-1"]').tab('show');
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
            $("#lbl_txtb_travel_details_dspl_req").text("Required Field!");
        }
        else {
            //remove of refresh the object form being required

            $("#txtb_travel_details_dspl").removeClass("required");
            $("#lbl_txtb_travel_details_dspl_req").text("");

        }
    }

    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.FilterPageGrid = function () {

        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });

        h.post("../cATSTOAppr/FilterPageGrid", {
            par_department_code: $('#ddl_dept').val(),
            par_to_year: $('#ddl_year').val(),
            par_to_month: $('#ddl_month').val(),
            par_employment_type: $('#ddl_empl_type').val()
        }).then(function (d) {

            if (d.data.message == "success") {
                s.oTable.fnClearTable();
                s.datalistgrid = []
                s.datalistgrid = d.data.sp_approval_worklist_travel_order;
                if (d.data.sp_approval_worklist_travel_order.length > 0) {
                    s.oTable.fnAddData(d.data.sp_approval_worklist_travel_order);

                }
                s.getMorrisOffline()



                $("#modal_generating_remittance").modal("hide");
            }
        })
    }
    //************************************// 
    //*** Open Edit Modal         
    //**********************************// 
    s.btn_edit_action = function (row_id) {
        s.temp_row_id = row_id;
        s.btn_print_check = "0"
        tname = "oTableDates"
        s.dd_travel_date_from_orig = ''
        ValidationResultColor("ALL", false);
        s.isEdit = true;
        s.ModalTitle = "Travel Order Approval";


        $('#main_modal').on('shown.bs.modal', function () {

            $('.nav-tabs a[href="#tab-1"]').tab('show');

        });

        tname = ""

        s.txtb_travel_order_nbr_dspl = s.datalistgrid[row_id].application_nbr
        s.txtb_travel_date_filed_dspl = s.datalistgrid[row_id].travel_datefiled
        s.txtb_travel_requestor_dspl = s.datalistgrid[row_id].creator_name
        s.txtb_travel_department_dspl = s.dept_list.select(s.datalistgrid[row_id].department_code, "department_code").department_name1


        var s1 = s.datalistgrid[row_id].user_id_reviewer

        if (s1 == "" || s1 == undefined) {
            $("#lbl_reviewer").text("")

        }

        else {
            var s2 = s1.substring(1);
        }


        s.txtb_travel_order_reviewed_dspl = s.empl_name_list.select(s2, "empl_id").employee_name
        s.txtb_travel_date_review_dspl = s.datalistgrid[row_id].reviewed_date


        $("#lbl_reviewer").text("")
        $("#lbl_reviewer").text(s.empl_name_list.select(s2, "empl_id").employee_name)

        if (s1 != "") {
            $("#lbl_reviewer_date").text("Reviewed date: " + s.datalistgrid[row_id].reviewed_date)
            $("#div_reviewer").removeClass("hidden")
        }
        else {
            $("#div_reviewer").addClass("hidden")
            $("#lbl_reviewer").text("")
            $("#lbl_reviewer_date").text("")
        }


        var s3 = s.datalistgrid[row_id].user_id_level1_approver

        if (s3 == "" || s3 == undefined) {
            $("#lbl_level1").text("")

        }

        else {
            var s4 = s3.substring(1);
        }


        s.txtb_travel_order_level1_dspl = s.empl_name_list.select(s4, "empl_id").employee_name
        s.txtb_travel_date_level1_dspl = s.datalistgrid[row_id].level1_approval_date


        $("#lbl_level1").text("")
        $("#lbl_level1").text(s.empl_name_list.select(s4, "empl_id").employee_name)


        if (s4 != "" || s4 != undefined) {
            if (s.datalistgrid[row_id].level1_approval_date == '1900-01-01') {

                $("#div_level1").addClass("hidden")
                $("#lbl_lbl_level1_date").text("")
            }
            else {
                $("#lbl_lbl_level1_date").text("Level 1 approval date: " + s.datalistgrid[row_id].level1_approval_date)
                $("#div_level1").removeClass("hidden")
            }

        }
        else {

            $("#div_level1").addClass("hidden")
            $("#lbl_lbl_level1_date").text("")
        }




        var s5 = s.datalistgrid[row_id].user_id_final_approver

        if (s5 == "" || s5 == undefined) {
            $("#div_final").addClass("hidden")
            $("#lbl_final").text("")
            $("#lbl_lbl_final_date").text("")

        }

        else {
            $("#div_final").removeClass("hidden")

            var s6 = s5.substring(1);

            $("#lbl_final").text(s.empl_name_list.select(s6, "empl_id").employee_name)
            $("#lbl_lbl_final_date").text("Final approval date: " + s.datalistgrid[row_id].final_approval_date)
        }

        var s7 = s.datalistgrid[row_id].user_id_level2_approver

        if (s7 == "") {
            $("#div_level2").addClass("hidden")
            $("#lbl_level2").text("")
            $("#lbl_lbl_level2_date").text("")

        }

        else {
            $("#div_level2").removeClass("hidden")


            if (s7 == "" || s7 == undefined) {
                s8 = ""
                $("#div_level2").addClass("hidden")
                $("#lbl_level2").text("")
                $("#lbl_lbl_level2_date").text("")
            }
            else {
                var s8 = s7.substring(1);

                $("#lbl_level2").text(s.empl_name_list.select(s8, "empl_id").employee_name)
                $("#lbl_lbl_level2_date").text("Level 2 approval date: " + s.datalistgrid[row_id].level2_approval_date)
            }

        }





        //$("#div_level2").addClass("hidden")
        //

        $('#btn_approve').prop('ngx-data', row_id);
        $('#btn_disapprove').prop('ngx-data', row_id);
        $('#btn_cancel_pending').prop('ngx-data', row_id);
        $('#btn_cancel_final').prop('ngx-data', row_id);

        $('#btn_approve').html('<i class="fa fa-thumbs-up"></i> Approve');
        $('#btn_disapprove').html('<i class="fa fa-thumbs-down"></i> Disapprove');
        $('#btn_cancel_pending').html('<i class="fa fa-ban"></i> Cancel Pending');
        $('#btn_cancel_final').html('<i class="fa fa-ban"></i> Cancel Application');

        try {
            s.show_footer = true;

            s.isShowCancelFinal = false;
            h.post("../cATSTOAppr/GetDetailsData",
                {
                    p_application_nbr: s.datalistgrid[row_id].application_nbr
                    , p_dtr_year: $("#ddl_year").val()
                    , p_dtr_month: $("#ddl_month").val()
                }).then(function (d) {
                    if (d.data.message == "success") {

                        if (d.data.travelorder_hdr_tbl.length > 0) {

                            s.travelorder_hdr_tbl_updatetype = d.data.travelorder_hdr_tbl

                            s.txtb_travel_place_dspl = d.data.travelorder_hdr_tbl[0].travel_place_visit
                            s.ddl_travel_type = d.data.travelorder_hdr_tbl[0].travel_type_code
                            s.ddl_travel_form = d.data.travelorder_hdr_tbl[0].travel_form_type
                            s.txtb_travel_type = s.travel_type_list.select(d.data.travelorder_hdr_tbl[0].travel_type_code, "travel_type_code").travel_type_descr
                            s.txtb_travel_form = s.travel_form_list.select(d.data.travelorder_hdr_tbl[0].travel_form_type, "travel_form_code").travel_form_descr
                            s.txtb_travel_purpose_dspl = d.data.travelorder_hdr_tbl[0].travel_purpose
                            s.txtb_travel_details_dspl = d.data.travelorder_hdr_tbl[0].travel_details
                            s.txtb_travel_justification_dspl = d.data.travelorder_hdr_tbl[0].travel_justification
                            s.chk_with_claims = d.data.travelorder_hdr_tbl[0].travel_with_claims
                            s.chk_with_emergency = d.data.travelorder_hdr_tbl[0].to_emergency
                            s.chk_with_ldnf = d.data.travelorder_hdr_tbl[0].ldnf

                            h.post("../cATSTOAppr/GetEmployeesDetails",
                                {
                                    par_travel_order_no: s.datalistgrid[row_id].application_nbr
                                    , par_dept_code: $("#ddl_dept").val()
                                }).then(function (d) {
                                    if (d.data.message == "success") {

                                        s.datalistgridEmployee = []
                                        if (d.data.sp_travelorder_empl_dtl_tbl_list.length > 0) {
                                            s.datalistgridEmployee = d.data.sp_travelorder_empl_dtl_tbl_list
                                            s.oTableEmployee.fnClearTable();
                                            s.oTableEmployee.fnAddData(s.datalistgridEmployee)
                                        }
                                        else {
                                            s.oTableEmployee.fnClearTable();
                                        }

                                        s.datalistgridDates = []
                                        if (d.data.sp_travelorder_dates_dtl_tbl_list.length > 0) {
                                            s.datalistgridDates = d.data.sp_travelorder_dates_dtl_tbl_list
                                            s.oTableDates.fnClearTable();
                                            s.oTableDates.fnAddData(s.datalistgridDates)
                                        }
                                        else {
                                            s.oTableDates.fnClearTable();
                                        }

                                        s.show_btn_approve = true;

                                        $('#btn_disapprove').show();
                                        $('#btn_cancel_pending').show();
                                        $('#btn_approve').show();

                                        if (s.datalistgrid[row_id].next_status == "R") {

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

                                        else if (s.datalistgrid[row_id].next_status == "") {
                                            s.show_footer = false;
                                            s.show_btn_approve = false;
                                        }

                                        if (s.datalistgrid[row_id].approval_status == "F") {
                                            $('#btn_disapprove').hide();
                                            $('#btn_cancel_pending').hide();
                                            $('#btn_approve').hide();

                                            s.isShowCancelFinal = true;
                                            s.show_footer = true;
                                        }

                                    }
                                    else {
                                        swal(d.data.message, { icon: "warning", });
                                    }
                                });

                        }

                        setTimeout(function () {
                            $('#main_modal').modal({ backdrop: 'static', keyboard: false });
                        }, 300);
                    }
                });

        } catch (e) {
            swal({ icon: "warning", title: e.message });
        }

    }

    //************************************// 
    //*** Open Edit Modal         
    //**********************************// 
    s.btn_edit_appr = function (row) {
        var dt = s.datalistgrid[row]

        //s.empl_name_list
        //console.log(dt)

        h.post("../cATSTOAppr/Edit_recom_final_Approver",
            {
                travel_order_no: dt.application_nbr
            }).then(function (d) {
                if (d.data.icon == "success") {

                    var rd = d.data.travelorders[0]

                    if (rd.recappr_empl != "10058" && rd.recappr_empl != "") {
                        var recname = s.empl_name_list.filter(function (d) {
                            return d.empl_id == rd.recappr_empl
                        })
                        s.approver_list.push({
                            empl_id: rd.recappr_empl
                            , employee_name: recname.employee_name
                        })
                    }

                    console.log(s.approver_list)

                    $("#editappr_travel_order_no").val(rd.travel_order_no)
                    $("#ddl_editappr_recommending").val(rd.recappr_empl).trigger("change");
                    $("#ddl_editappr_final").val(rd.firstappr_empl_id).trigger("change");
                    $("#edit_appr_modal").modal("show")

                }
                else {
                    swal({ title: d.data.message, icon: "error", });
                }
            })

    }

    //************************************// 
    //*** Open Edit Modal         
    //**********************************// 
    s.editappr_save = function () {
        var travelorderno = $("#editappr_travel_order_no").val()
        var recapprempl = $("#ddl_editappr_recommending").val()
        var firstapprempl_id = $("#ddl_editappr_final").val()

        if (account_user_id == "U8447" || account_user_id == "U2003") {
            cs.loading("show")
            h.post("../cATSTOAppr/save_recom_final_Approver",
                {
                    travel_order_no: travelorderno
                    , recappr_empl: recapprempl
                    , firstappr_empl_id: firstapprempl_id
                }).then(function (d) {
                    cs.loading("hide")
                    if (d.data.icon == "success") {
                        swal({ title: d.data.message, icon: d.data.icon, });
                    }
                    else {
                        swal({ title: d.data.message, icon: "error", });
                    }

                })
        }

    }

    ////************************************// 
    ////*** Cance Final Approved            
    ////**********************************// 
    s.btn_del_row2 = function () {
        var row_index = s.temp_row_id;
        try {
            swal({
                title: "Are you sure to cancel this application and all of its components?",
                text: "Once cancelled, you will not be able to recover this record!",
                icon: "warning",
                buttons: true,
                dangerMode: true,

            })
                .then(function (willDelete) {
                    if (willDelete) {


                        h.post("../cSSTravelOrderAppl/DeleteFromDatabase",
                            {
                                par_data: s.datalistgrid[row_index]
                            }).then(function (d) {
                                if (d.data.message == "success") {


                                    s.datalistgrid[row_index].approval_status = "L";
                                    s.oTable.fnClearTable();

                                    if (s.datalistgrid.length != 0) {
                                        s.oTable.fnAddData(s.datalistgrid);
                                    }

                                    $('#main_modal').modal("hide");
                                    swal("Your record has been cancelled!", { icon: "success", });

                                }
                                else {
                                    swal({ title: d.data.message, icon: "warning", });
                                }
                            })
                    }
                });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    s.btn_cancel_final_click = function () {
        var row_id = $('#btn_cancel_final').prop('ngx-data');
        if (ValidateFields()) {

            try {
                swal({
                    title: "Are you sure to cancel this application and all of its components?",
                    text: "Once cancelled, you will not be able to recover this record!",
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,

                })
                    .then(function (willDelete) {
                        if (willDelete) {
                            var data =
                            {
                                travel_order_no: s.datalistgrid[row_id].application_nbr
                                , approval_id: s.datalistgrid[row_id].approval_id
                                , approval_status: "L"
                                , travel_details: s.txtb_travel_details_dspl
                            }

                            $('#btn_cancel_pending').html('<i class="fa fa-spinner fa-spin"></i> Cancel Pending');
                            h.post("../cATSTOAppr/ReviewApprovedAction",
                                {
                                    data: data
                                }).then(function (d) {
                                    if (d.data.message == "success") {
                                        s.datalistgrid[row_id].next_status = "";
                                        s.datalistgrid[row_id].worklist_status = "Cancelled";
                                        s.datalistgrid[row_id].worklist_action = "Cancelled";
                                        s.datalistgrid[row_id].approval_status = "L";


                                        s.oTable.fnClearTable();
                                        if (s.datalistgrid.length > 0) {
                                            s.oTable.fnAddData(s.datalistgrid);
                                        }

                                        swal({ icon: "success", title: "Application has been cancelled successfully!" });
                                        setTimeout(function () {
                                            $('#btn_cancel_pending').html('<i class="fa fa-ban"></i> Cancel Pending');
                                            $('#main_modal').modal('hide');
                                        }, 300);
                                    }
                                });
                        }
                    });
            }
            catch (err) {
                swal({ icon: "warning", title: err.message });
            }


        }
    }

    s.btn_cancel_pending_click = function () {
        var row_id = $('#btn_cancel_pending').prop('ngx-data');
        if (ValidateFields()) {

            var data =
            {
                travel_order_no: s.datalistgrid[row_id].application_nbr
                , approval_id: s.datalistgrid[row_id].approval_id
                , approval_status: "C"
                , travel_details: s.txtb_travel_details_dspl
            }

            $('#btn_cancel_pending').html('<i class="fa fa-spinner fa-spin"></i> Cancel Pending');
            h.post("../cATSTOAppr/ReviewApprovedAction",
                {
                    data: data
                }).then(function (d) {
                    if (d.data.message == "success") {
                        s.datalistgrid[row_id].next_status = "";
                        s.datalistgrid[row_id].worklist_status = "Cancel Pending";
                        s.datalistgrid[row_id].worklist_action = "Cancel Pending";
                        s.datalistgrid[row_id].approval_status = "C";


                        s.oTable.fnClearTable();
                        if (s.datalistgrid.length > 0) {
                            s.oTable.fnAddData(s.datalistgrid);
                        }

                        swal({ icon: "success", title: "Application has been cancelled successfully!" });
                        setTimeout(function () {
                            $('#btn_cancel_pending').html('<i class="fa fa-ban"></i> Cancel Pending');
                            $('#main_modal').modal('hide');
                        }, 300);
                    }
                });
        }
    }


    s.btn_disapprove_click = function () {
        var row_id = $('#btn_disapprove').prop('ngx-data');
        if (ValidateFields()) {
            var data =
            {
                travel_order_no: s.datalistgrid[row_id].application_nbr
                , approval_id: s.datalistgrid[row_id].approval_id
                , approval_status: "D"
                , detail_remarks: s.txtb_travel_details_dspl
            }
            $('#btn_disapprove').html('<i class="fa fa-spinner fa-spin"></i> Disapprove');
            h.post("../cATSTOAppr/ReviewApprovedAction",
                {
                    data: data
                }).then(function (d) {
                    if (d.data.message == "success") {
                        s.datalistgrid[row_id].next_status = "";
                        s.datalistgrid[row_id].worklist_status = "Disapproved";
                        s.datalistgrid[row_id].worklist_action = "Disapproved";
                        s.datalistgrid[row_id].approval_status = "D";


                        s.oTable.fnClearTable();
                        if (s.datalistgrid.length > 0) {
                            s.oTable.fnAddData(s.datalistgrid);
                        }

                        swal({ icon: "success", title: "Application has been disapproved successfully!" });
                        setTimeout(function () {
                            $('#btn_disapprove').html('<i class="fa fa-thumbs-up"></i> Disapprove');
                            $('#main_modal').modal('hide');
                        }, 300);
                    }
                });

        }
    }


    s.getActionedList = function () {
       

        
            $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
            var datefrom = $("#actioned_date_from").val()
            var dateto = $("#actioned_date_to").val()

            h.post("../cATSTOAppr/sp_travel_order_pa_checklist_tbl_2",
                {
                      period_from: datefrom
                    , period_to: dateto
                }).then(function (d) {
                    if (d.data.message == "success") {

                        var checked_data = d.data.sp_travel_order_daily_pa_rep_actioned
                       
                        if (d.data.sp_travel_order_daily_pa_rep_actioned.length > 0) {
                            s.datalistgridCheckActioned = checked_data

                            s.number_check_actined_apvd = s.datalistgridCheckActioned.filter(function (d) {
                                return d.approved_status == "Y"
                            }).length

                            s.number_check_actined_dis = s.datalistgridCheckActioned.filter(function (d) {
                                return d.approved_status == "D"
                            }).length

                            s.oTableCheck_dtl_actioned.fnClearTable();
                            s.oTableCheck_dtl_actioned.fnAddData(s.datalistgridCheckActioned)
                        }

                        else {
                            s.datalistgridCheckActioned = []
                            s.oTableCheck_dtl_actioned.fnClearTable();
                        }
                        $('#modal_generating_remittance').modal("hide");
                        $("#TO_check_modal_actioned").modal({ keyboard: false, backdrop: "static" })
                    }

                    else {
                        s.datalistgridCheckActioned = []
                        s.oTableCheck_dtl_actioned.fnClearTable();
                        $('#modal_generating_remittance').modal("hide");
                        swal({ icon: "warning", title: d.data.message });
                       
                    }
                });

        
    }

    s.btn_approve_click = function () {

        //if (
        //    ($("#ddl_dept").val() == '11'
        //    || $("#ddl_dept").val() == '12'
        //    || $("#ddl_dept").val() == '21'
        //    || $("#ddl_dept").val() == '22'
        //    || $("#ddl_dept").val() == '23'
        //    || $("#ddl_dept").val() == '24'
        //    || $("#ddl_dept").val() == '20'
        //    || $("#txtb_travel_type").val() == 'OB2'
        //    || $("#txtb_travel_type").val() == 'OB3'
        //    || $("#txtb_travel_type").val() == 'OB4')
        //    && s.ddl_dept_original == "01"
        //)

        if (s.chk_with_claims == true && s.ddl_dept_original == "01") {

            message = "Please print this travel order application."
            swal({
                title: message,
                text: "Before approval, Please Print this travel order application.",
                icon: "warning",
                buttons: true,
                dangerMode: true,

            })
                .then(function (willDelete) {
                    if (willDelete) {

                        console.log("")
                    }
                });

        }

        else {
            //APPROVAL FOR NO CLAIMS
            var row_id = $('#btn_approve').prop('ngx-data');

            var data =
            {
                travel_order_no: s.datalistgrid[row_id].application_nbr
                , approval_id: s.datalistgrid[row_id].approval_id
                , approval_status: s.datalistgrid[row_id].next_status
                , travel_details: s.txtb_travel_details_dspl
            }

            if (s.datalistgrid[row_id].next_status == "R") {
                $('#btn_approve').html('<i class="fa fa-spinner fa-spin"></i> Review');
            }
            if (s.datalistgrid[row_id].next_status == "1") {
                $('#btn_approve').html('<i class="fa fa-spinner fa-spin"></i> Level 1 Approve');
            }
            if (s.datalistgrid[row_id].next_status == "2") {
                $('#btn_approve').html('<i class="fa fa-spinner fa-spin"></i> Level 2 Approve');
            }
            if (s.datalistgrid[row_id].next_status == "F") {
                $('#btn_approve').html('<i class="fa fa-spinner fa-spin"></i> Final Approve');

            }


            h.post("../cATSTOAppr/ReviewApprovedAction",
                {
                    data: data
                }).then(function (d) {
                    if (d.data.message == "success") {
                        s.datalistgrid[row_id].next_status = "";

                        if (data.approval_status == "R") {
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

                        else if (data.approval_status == "F") {
                            s.datalistgrid[row_id].worklist_status = "Final Approved";
                            s.datalistgrid[row_id].worklist_action = "View Details";
                            s.datalistgrid[row_id].approval_status = "F";
                        }

                        //else if (data.approval_status == "F") {
                        //    s.datalistgrid[row_id].worklist_status = "Final Approved";
                        //    s.datalistgrid[row_id].worklist_action = "Cancel Application";
                        //    s.datalistgrid[row_id].approval_status = "F";
                        //}

                        swal({ icon: "success", title: s.datalistgrid[row_id].worklist_status + " successfully!" });
                        s.oTable.fnClearTable();
                        if (s.datalistgrid.length > 0) {
                            s.oTable.fnAddData(s.datalistgrid);
                        }


                        setTimeout(function () {
                            if (s.datalistgrid[row_id].next_status == "R") {
                                $('#btn_approve').html('<i class="fa fa-thumbs-up"></i> Review');
                            }
                            if (s.datalistgrid[row_id].next_status == "1") {
                                $('#btn_approve').html('<i class="fa fa-thumbs-up"></i> Level 1 Approve');
                            }
                            if (s.datalistgrid[row_id].next_status == "2") {
                                $('#btn_approve').html('<i class="fa fa-thumbs-upn"></i> Level 2 Approve');
                            }
                            if (s.datalistgrid[row_id].next_status == "F") {
                                $('#btn_approve').html('<i class="fa fa-thumbs-up"></i> Final Approve');
                            }
                            $('#main_modal').modal('hide');
                        }, 300);
                    }
                    s.btn_print_check = "0"
                    localStorage["minus_travel_order"] = parseInt(localStorage["minus_travel_order"]) - 1
                    setTimeout(function () {
                        minusOne("9404")

                    }, 100)
                });
        }


        if (s.btn_print_check == "1") {

            var row_id = $('#btn_approve').prop('ngx-data');

            var data =
            {
                travel_order_no: s.datalistgrid[row_id].application_nbr
                , approval_id: s.datalistgrid[row_id].approval_id
                , approval_status: s.datalistgrid[row_id].next_status
                , travel_details: s.txtb_travel_details_dspl
            }

            if (s.datalistgrid[row_id].next_status == "R") {
                $('#btn_approve').html('<i class="fa fa-spinner fa-spin"></i> Review');
            }
            if (s.datalistgrid[row_id].next_status == "1") {
                $('#btn_approve').html('<i class="fa fa-spinner fa-spin"></i> Level 1 Approve');
            }
            if (s.datalistgrid[row_id].next_status == "2") {
                $('#btn_approve').html('<i class="fa fa-spinner fa-spin"></i> Level 2 Approve');
            }
            if (s.datalistgrid[row_id].next_status == "F") {
                $('#btn_approve').html('<i class="fa fa-spinner fa-spin"></i> Final Approve');

            }


            h.post("../cATSTOAppr/ReviewApprovedAction",
                {
                    data: data
                }).then(function (d) {
                    if (d.data.message == "success") {
                        s.datalistgrid[row_id].next_status = "";

                        if (data.approval_status == "R") {
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

                        else if (data.approval_status == "F") {
                            s.datalistgrid[row_id].worklist_status = "Final Approved";
                            s.datalistgrid[row_id].worklist_action = "View Details";
                            s.datalistgrid[row_id].approval_status = "F";
                        }

                        //else if (data.approval_status == "F") {
                        //    s.datalistgrid[row_id].worklist_status = "Final Approved";
                        //    s.datalistgrid[row_id].worklist_action = "Cancel Application";
                        //    s.datalistgrid[row_id].approval_status = "F";
                        //}

                        swal({ icon: "success", title: s.datalistgrid[row_id].worklist_status + " successfully!" });
                        s.oTable.fnClearTable();
                        if (s.datalistgrid.length > 0) {
                            s.oTable.fnAddData(s.datalistgrid);
                        }


                        setTimeout(function () {
                            if (s.datalistgrid[row_id].next_status == "R") {
                                $('#btn_approve').html('<i class="fa fa-thumbs-up"></i> Review');
                            }
                            if (s.datalistgrid[row_id].next_status == "1") {
                                $('#btn_approve').html('<i class="fa fa-thumbs-up"></i> Level 1 Approve');
                            }
                            if (s.datalistgrid[row_id].next_status == "2") {
                                $('#btn_approve').html('<i class="fa fa-thumbs-upn"></i> Level 2 Approve');
                            }
                            if (s.datalistgrid[row_id].next_status == "F") {
                                $('#btn_approve').html('<i class="fa fa-thumbs-up"></i> Final Approve');
                            }
                            $('#main_modal').modal('hide');
                        }, 300);
                    }
                    s.btn_print_check = "0"
                    localStorage["minus_travel_order"] = parseInt(localStorage["minus_travel_order"]) - 1
                    setTimeout(function () {
                        minusOne("9404")

                    }, 100)
                });
        }


    }








    Array.prototype.select = function (code, prop) {
        var value = this.filter(function (d) {
            return d[prop] == code
        })[0]

        if (value == undefined || value == null || value == "")
            value = ""

        return value
    }

    String.prototype.add_html_obj_value = function (id) {
        var val = this.toString()
        $("#" + id).val(val)
        return val
    }

    s.btn_click_search_to = function () {
        $('#TO_search_modal').modal({ backdrop: 'static', keyboard: false });
        $("#ddl_search_travel_year").val(s.ddl_year)
        $("#ddl_search_travel_month").val(s.ddl_month)
    }

    s.getFilteredSearch = function () {
        var to_year = $("#ddl_search_travel_year").val()
        var to_month = $("#ddl_search_travel_month").val()
        var to_empl_id = $("#ddl_search_empl_name").val()

        h.post("../cATSTOAppr/GetSearchData",
            {
                par_year: to_year,
                par_month: to_month,
                par_empl_id: to_empl_id
            }).then(function (d) {

                if (d.data.message == "success") {

                    s.datalistgridSearch = d.data.sp_travelorder_search_list
                    s.oTableSearch_dtl.fnClearTable();

                    if (d.data.sp_travelorder_search_list.length > 0) {
                        s.oTableSearch_dtl.fnAddData(d.data.sp_travelorder_search_list);
                    }

                }

                else {
                    swal("No Data Found!", { icon: "warning", });
                }

            })


    }

    $('#datalist_grid_check tbody').on('click', 'span.details-control', function () {
        var tr = $(this).closest('tr');
        var row = $('#datalist_grid_check').DataTable().row(tr);

        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            //console.log(row.data())
            // Open this row
            row.child(format_check(row.data())).show();
            tr.addClass('shown');

        }

    });

    //$('#datalist_grid_check tbody').on('hover', 'span.details-control', function () {
    //    var tr = $(this).closest('tr');
    //    var row = $('#datalist_grid_check').DataTable().row(tr);

    //    if (row.child.isShown()) {
    //        // This row is already open - close it
    //        row.child.hide();
    //        tr.removeClass('shown');
    //    }
    //    else {
    //        //console.log(row.data())
    //        // Open this row
    //        row.child(format_check(row.data())).show();
    //        tr.addClass('shown');

    //    }

    //});


    //s.btn_show_details_check = function () {
    //    console.log("jhasdhas")
    //}

    $('#datalist_grid_check_actioned tbody').on('click', 'span.details-control', function () {
        var tr = $(this).closest('tr');
        var row = $('#datalist_grid_check_actioned').DataTable().row(tr);

        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            //console.log(row.data())
            // Open this row
            row.child(format_check(row.data())).show();
            tr.addClass('shown');
        }
    });

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
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Travel Order Requestor:</td>' +
            '<td style="padding:0px">' + '<span class="badge badge-default">' + d.travel_requestor_employee_name + '</span>' + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td  style="width:24% !important;padding:0px 0px 0px 10px">Travel Place: </td>' +
            '<td style="padding:0px">' + '<span class="badge badge-default">' + d.travel_place_visit + '</span>' + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Travel Type :</td>' +
            '<td style="padding:0px">' + '<span class="badge badge-default">' + d.travel_type_abbrv + '</span>' + '</td>' +
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
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Level 2 Approved By :</td>' +
            '<td style="padding:0px">' + '<span class="badge badge-success">' + d.employee_name_level2_approver + '</span>' + '</td>' +
            '</tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Level 2 Approval Date :</td>' +
            '<td style="padding:0px">' + '<span class="badge badge-success">' + d.level2_approval_date + '</span>' + '</td>' +
            '</tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Approved By :</td>' +
            '<td style="padding:0px">' + '<span class="badge badge-success">' + d.employee_name_final_approver + '</span>' + '</td>' +
            '</tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Alternate :</td>' +
            '<td style="padding:0px">' + '<span class="badge badge-success">' + d.alternate_final_approver + '</span>' + '</td>' +
            '</tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Final Approval Date :</td>' +
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

    function format_check(d) {

        // `d` is the original data object for the row

        return '<div class="row" style="padding-right:20px;">' +
            '<div class="col-md-12" > <b style="padding-right:70px; !important">Position:</b> <span class="badge badge-success">' + d.position_title1 + '</span></div>' +
            '<div class="col-md-12" > <b style="padding-right:50px; !important">Travel type:</b> <span class="badge badge-success">' + d.travel_type_descr + '</span></div>' +
            '<div class="col-md-12" > <b style="padding-right:70px; !important">Purpose:</b> <span class="badge badge-success">' + d.travel_purpose + '</span></div>' +
            '<div class="col-md-12" > <b >Travel Justification:</b> <span class="badge badge-danger">' + d.travel_justification + '</span></div>'

            + '</div>';

        //return '<table class="no-border" style="padding:0px !important;min-height:10px !important" id="table_show_details"> ' +
        //    '<tr>' +
        //    '<td>Position:</td>' +
        //    '<td style="padding:0px">' + '<span class="badge badge-success">' + d.position_title1 + '</span>' + '</td>' +
        //    '</tr>' +
        //    '<tr>' +
        //    '<td  style="width:24% !important;padding:0px 0px 0px 10px">Travel type: </td>' +
        //    '<td style="padding:0px">' + '<span class="badge badge-success">' + d.travel_type_descr + '</span>' + '</td>' +
        //    '</tr>' +
        //    '<tr>' +
        //    '<td style="width:24% !important;padding:0px 0px 0px 10px">Travel Justification :</td>' +
        //    '<td style="padding:0px">' + '<span class="badge badge-success">' + d.travel_justification + '</span>' + '</td>' +
        //    '</tr>' +

        //    '</table>';
    }

    //************************************// 
    //*** Open Edit Modal         
    //**********************************// 
    s.btn_print_row = function () {
        row_id = s.temp_row_id


        s.btn_print_check = "1"


        var controller = "Reports";
        var action = "Index";
        var ReportName = "cryTravelOrder";
        var SaveName = "Crystal_Report";
        var ReportType = "inline";
        var ReportPath = "~/Reports/cryTravelOrder/cryTravelOrder.rpt";
        var sp = "sp_travel_order_report"
        var parameters = "par_travel_order_no," + s.datalistgrid[row_id].application_nbr

        if (s.datalistgrid.travel_datefiled_original <= '2022-06-27') {
            ReportPath = "~/Reports/cryTravelOrder/cryTravelOrder.rpt";
        }

        else {
            ReportPath = "~/Reports/cryTravelOrder/cryTravelOrder_new.rpt";
        }

        if (s.datalistgrid[row_id].approval_status == "N" || s.datalistgrid[row_id].approval_status == "C") {

            swal({
                title: "Please submit your application before printing.",
                text: "Once submitted, you can print this application!",
                icon: "warning",
                buttons: true,
                dangerMode: true,

            })
        }

        else {
            $("#modal_generating_remittance").modal({ keyboard: false, backdrop: "static" })

            //h.post("../cSSTravelOrderAppl/setPageHistory").then(function (d) {

            //if (d.data.message == "success") {
            //location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
            //    + "&SaveName=" + SaveName
            //    + "&ReportType=" + ReportType
            //    + "&ReportPath=" + ReportPath
            //    + "&Sp=" + sp + "," + parameters

            // *******************************************************
            // *** VJA : 2021-07-14 - Validation and Loading hide ****
            // *******************************************************
            s.employee_name_print = "TRAVEL ORDER";


            var iframe = document.getElementById('iframe_print_preview');
            var iframe_page = $("#iframe_print_preview")[0];
            iframe.style.visibility = "hidden";

            s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                + "&ReportName=" + ReportName
                + "&SaveName=" + SaveName
                + "&ReportType=" + ReportType
                + "&ReportPath=" + ReportPath
                + "&id=" + sp + "," + parameters

            if (!/*@cc_on!@*/0) { //if not IE
                iframe.onload = function () {
                    iframe.style.visibility = "visible";
                    $("#modal_generating_remittance").modal("hide")
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
                        $("#modal_generating_remittance").modal("hide")
                    }
                };
            }

            iframe.src = s.embed_link;
            $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
            // *******************************************************
            // *******************************************************

            //}

            //})
        }





    }


    //************************************// 
    //*** PRINT TRAVEL ORDER ON EDIT RECOMMENDING ADN FINAL APPROVER MODAL      
    //**********************************// 
    s.btn_print_row_editappr = function () {

        var travelorderno = $("#editappr_travel_order_no").val()

        var dt = s.datalistgrid.filter(function (d) {
            return d.application_nbr == travelorderno
        })[0]
        s.btn_print_check = "1"


        var controller = "Reports";
        var action = "Index";
        var ReportName = "cryTravelOrder";
        var SaveName = "Crystal_Report";
        var ReportType = "inline";
        var ReportPath = "~/Reports/cryTravelOrder/cryTravelOrder.rpt";
        var sp = "sp_travel_order_report"
        var parameters = "par_travel_order_no," + travelorderno

        if (dt.travel_datefiled_original <= '2022-06-27') {
            ReportPath = "~/Reports/cryTravelOrder/cryTravelOrder.rpt";
        }

        else {
            ReportPath = "~/Reports/cryTravelOrder/cryTravelOrder_new.rpt";
        }

        if (dt.approval_status == "N" || dt.approval_status == "C") {

            swal({
                title: "Please submit your application before printing.",
                text: "Once submitted, you can print this application!",
                icon: "warning",
                buttons: true,
                dangerMode: true,

            })
        }

        else {
            $("#modal_generating_remittance").modal({ keyboard: false, backdrop: "static" })

            s.employee_name_print = "TRAVEL ORDER";


            var iframe = document.getElementById('iframe_print_preview');
            var iframe_page = $("#iframe_print_preview")[0];
            iframe.style.visibility = "hidden";

            s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                + "&ReportName=" + ReportName
                + "&SaveName=" + SaveName
                + "&ReportType=" + ReportType
                + "&ReportPath=" + ReportPath
                + "&id=" + sp + "," + parameters

            if (!/*@cc_on!@*/0) { //if not IE
                iframe.onload = function () {
                    iframe.style.visibility = "visible";
                    $("#modal_generating_remittance").modal("hide")
                };
            }
            else if (iframe_page.innerHTML()) {
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
                        $("#modal_generating_remittance").modal("hide")
                    }
                };
            }

            iframe.src = s.embed_link;
            $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });

        }

    }

    function initMorris() {

        morrisLine = Morris.Bar({

            element: 'myfirstchart',
            //data: check_data,
            xkey: 'y',
            ykeys: ['a'],
            labels: ['Number Of Travel'],
            gridTextColor: '#898992',
            gridTextSize: 8,
            xLabelAngle: 25,
            xLabelMargin: 50,
            stacked: true,
            hideHover: 'auto',
            resize: true,
            redraw: true

        });

    }

    function setMorris(data) {
        morrisLine.setData(data);
        morrisLine.redraw();
        $(window).trigger('resize');
    }

    s.getMorrisOffline = function () {


        var data_check_dept = []


        for (var x = 0; x < s.dept_list.length; x++) {

            data_check_dept[x] = {
                y: s.dept_list[x].department_short_name
                , a: 0
            }

        }

        for (var x = 0; x < s.datalistgrid.length; x++) {

            for (var y = 0; y < data_check_dept.length; y++) {

                if (s.datalistgrid[x].department_name1 == data_check_dept[y].y) {
                    data_check_dept[y].a = data_check_dept[y].a + 1
                }
            }
        }


        setMorris(data_check_dept);
    }



    s.btn_click_daily_par = function (value) {

        $("#TO_print_par").modal({ keyboard: false, backdrop: "static" })
        $("#btn_print_preview").removeClass("hidden")
        $("#btn_show_details").addClass("hidden")
        s.par_report_type = value
        if (s.par_report_type == "01") {
            s.print_filter = "(Approved Travel Order)"
        }
        else if (s.par_report_type == "02") {
            s.print_filter = "(Travel Order With Claims)"
        }
        else if (s.par_report_type == "03") {
            s.print_filter = "(Travel Order Without Claims)"
        }


        //PEO ACCESS FOR REPORTING
        if (account_user_id == "U9933"
            || account_user_id == "U1666"
            || account_user_id == "U0473") {

            $("#ddl_dept_rep").val("16").trigger("change");
            s.ddl_dept_rep = "16"
            $('#ddl_dept_rep').select2("enable", false);

        }

    }

    s.btn_click_dis_par = function () {

        $("#modal_generating_remittance").modal({ keyboard: false, backdrop: "static" })
        var controller = "Reports";
        var action = "Index";
        var ReportName = "cryTravelOrderDisApprovedReport";
        var SaveName = "Crystal_Report";
        var ReportType = "inline";
        var ReportPath = "~/Reports/cryTravelOrderDisApprovedReport/cryTravelOrderDisApprovedReport.rpt";
        var sp = "sp_travel_order_disapproved_rep"
        var parameters = "par_period_from," + $("#dd_travel_date_from_rep").val() + ",par_period_to," + $("#dd_travel_date_to_rep").val() + ",par_dept_code," + $("#ddl_dept_rep").val() + ",par_type," + s.par_report_type + ",par_user_id," + account_user_id + ",par_start_time," + $("#txtb_start_time").val() + ",par_end_time," + $("#txtb_end_time").val()

        var iframe = document.getElementById('iframe_print_preview');
        var iframe_page = $("#iframe_print_preview")[0];
        iframe.style.visibility = "hidden";

        s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
            + "&ReportName=" + ReportName
            + "&SaveName=" + SaveName
            + "&ReportType=" + ReportType
            + "&ReportPath=" + ReportPath
            + "&id=" + sp + "," + parameters

        if (!/*@cc_on!@*/0) { //if not IE
            iframe.onload = function () {
                iframe.style.visibility = "visible";
                $("#modal_generating_remittance").modal("hide")
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
                    $("#modal_generating_remittance").modal("hide")
                }
            };
        }

        iframe.src = s.embed_link;
        $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });

    }

    s.btn_click_monthly_par = function () {

        $("#modal_generating_remittance").modal({ keyboard: false, backdrop: "static" })
        var controller = "Reports";
        var action = "Index";
        var ReportName = "cryTravelOrderMonthlyReport";
        var SaveName = "Crystal_Report";
        var ReportType = "inline";
        var ReportPath = "~/Reports/cryTravelOrderMonthlyReport/cryTravelOrderMonthlyReport.rpt";
        var sp = "sp_travel_order_daily_dept_rep"
        var parameters = "par_period_year," + $('#ddl_year').val() + ",par_period_month," + $('#ddl_month').val() + ",par_user_id," + account_user_id

        var iframe = document.getElementById('iframe_print_preview');
        var iframe_page = $("#iframe_print_preview")[0];
        iframe.style.visibility = "hidden";

        s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
            + "&ReportName=" + ReportName
            + "&SaveName=" + SaveName
            + "&ReportType=" + ReportType
            + "&ReportPath=" + ReportPath
            + "&id=" + sp + "," + parameters

        if (!/*@cc_on!@*/0) { //if not IE
            iframe.onload = function () {
                iframe.style.visibility = "visible";
                $("#modal_generating_remittance").modal("hide")
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
                    $("#modal_generating_remittance").modal("hide")
                }
            };
        }

        iframe.src = s.embed_link;
        $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });

    }

    s.btn_click_daily_rep = function () {


        $("#modal_generating_remittance").modal({ keyboard: false, backdrop: "static" })



        var controller = "Reports";
        var action = "Index";
        var ReportName = "cryTravelOrderDailyReport";
        var SaveName = "Crystal_Report";
        var ReportType = "inline";
        var ReportPath = "~/Reports/cryTravelOrderDailyReport/cryTravelOrderDailyReport.rpt";
        var sp = "sp_travel_order_daily_rep"
        var parameters = "par_period_from," + $("#dd_travel_date_from_rep").val() + ",par_period_to," + $("#dd_travel_date_to_rep").val() + ",par_dept_code," + $("#ddl_dept_rep").val() + ",par_type," + s.par_report_type + ",par_user_id," + account_user_id + ",par_start_time," + $("#txtb_start_time").val() + ",par_end_time," + $("#txtb_end_time").val()
        console.log(parameters)
        //// *******************************************************
        //// *** VJA : 2021-07-14 - Validation and Loading hide ****
        //// *******************************************************
        //s.employee_name_print = "TRAVEL ORDER";

        var iframe = document.getElementById('iframe_print_preview');
        var iframe_page = $("#iframe_print_preview")[0];
        iframe.style.visibility = "hidden";

        s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
            + "&ReportName=" + ReportName
            + "&SaveName=" + SaveName
            + "&ReportType=" + ReportType
            + "&ReportPath=" + ReportPath
            + "&id=" + sp + "," + parameters



        if (!/*@cc_on!@*/0) { //if not IE
            iframe.onload = function () {
                iframe.style.visibility = "visible";
                $("#modal_generating_remittance").modal("hide")
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
                    $("#modal_generating_remittance").modal("hide")
                }
            };
        }

        iframe.src = s.embed_link;
        $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
    }

    s.btn_click_employee_rep = function () {


        $("#modal_generating_remittance").modal({ keyboard: false, backdrop: "static" })



        var controller = "Reports";
        var action = "Index";
        var ReportName = "cryTravelOrderDailyReport";
        var SaveName = "Crystal_Report";
        var ReportType = "inline";
        var ReportPath = "~/Reports/cryTravelOrderPerEmployeeReport/cryTravelOrderPerEmployeeReport.rpt";
        var sp = "sp_travelorder_employee_rep"
        var parameters = "par_empl_id," + $("#ddl_search_empl_name").val() + ",par_year," + $("#ddl_search_travel_year").val() + ",par_month," + $("#ddl_search_travel_month").val()

        //// *******************************************************
        //// *** VJA : 2021-07-14 - Validation and Loading hide ****
        //// *******************************************************
        //s.employee_name_print = "TRAVEL ORDER";

        var iframe = document.getElementById('iframe_print_preview');
        var iframe_page = $("#iframe_print_preview")[0];
        iframe.style.visibility = "hidden";

        s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
            + "&ReportName=" + ReportName
            + "&SaveName=" + SaveName
            + "&ReportType=" + ReportType
            + "&ReportPath=" + ReportPath
            + "&id=" + sp + "," + parameters


        console.log(s.embed_link)

        if (!/*@cc_on!@*/0) { //if not IE
            iframe.onload = function () {
                iframe.style.visibility = "visible";
                $("#modal_generating_remittance").modal("hide")
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
                    $("#modal_generating_remittance").modal("hide")
                }
            };
        }

        iframe.src = s.embed_link;
        $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
    }

    s.btn_click_reload_notif = function () {
        h.post("../Menu/GetNotification").then(function (d) {
            if (d.data.message == "success") {
                s.NotifList = d.data.notif_list;
                s.notifLst_length = d.data.notif_list.length;

                var date = new Date();
                var notif = d.data.notif_list;
                localStorage.setItem('name', JSON.stringify(notif));

                date.setTime(date.getTime() + (30 * 60 * 1000));
                var date = new Date();
                localStorage.setItem('expiretime', date);

                localStorage["minus_time_sched"] = d.data.getNotificationList[0].counter_notif_time
                localStorage["minus_travel_order"] = d.data.getNotificationList[0].counter_notif_to
                localStorage["minus_force_leave"] = d.data.getNotificationList[0].counter_notif_flv
                localStorage["minus_as"] = d.data.getNotificationList[0].counter_notif
                localStorage["minus_leave"] = d.data.getNotificationList[0].counter_notif_lv



                setTimeout(function () {

                    $("#" + "9409").removeClass("fa fa-spinner fa-spin")
                    $("#" + "9409").addClass("label label-info")
                    $("#" + "9404").removeClass("fa fa-spinner fa-spin")
                    $("#" + "9404").addClass("label label-info")
                    $("#" + "9407").removeClass("fa fa-spinner fa-spin")
                    $("#" + "9407").addClass("label label-info")
                    $("#" + "9403").removeClass("fa fa-spinner fa-spin")
                    $("#" + "9403").addClass("label label-info")
                    $("#" + "9406").removeClass("fa fa-spinner fa-spin")
                    $("#" + "9406").addClass("label label-info")


                    $("#" + "9409").text(localStorage["minus_time_sched"])
                    $("#" + "9404").text(localStorage["minus_travel_order"])
                    $("#" + "9407").text(localStorage["minus_force_leave"])
                    $("#" + "9403").text(localStorage["minus_as"])
                    $("#" + "9406").text(localStorage["minus_leave"])
                    $("#tab_number").text(localStorage["minus_travel_order"])


                }, 100)

                if (s.notifLst_length > 0) {
                    s.show_no_alerts = false;
                    s.show_spinner = true;

                    setTimeout(function () {
                        s.show_spinner = false;
                    }, 300);
                }
                else {
                    s.show_no_alerts = true;
                    s.show_spinner = false;
                }

                setTimeout(function () { s.FilterPageGrid() }, 500)

            }
        });
    }

    s.btn_click_checklist = function () {

        if (account_user_id == s.pa_approver) {

            s.btn_data_checklist()

        }

        else {
            $("#TO_print_par").modal({ keyboard: false, backdrop: "static" })
            //s.par_report_type = value
            s.print_filter = "(Check List for Travel Order)"
            $("#btn_print_preview").addClass("hidden")
            $("#btn_show_details").removeClass("hidden")
        }


    }

    s.btn_click_checklist_actioned = function () {
        if (account_user_id == s.pa_approver) {
            s.btn_data_checklist_actioned()
        }
    }

    s.btn_data_checklist = function () {
        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
        $("#TO_print_par").modal("hide");


        //DIRI
        var parameters = "par_period_from," + $("#dd_travel_date_from_rep").val() + ",par_period_to," + $("#dd_travel_date_to_rep").val() + ",par_dept_code," + $("#ddl_dept_rep").val() + ",par_type," + s.par_report_type + ",par_user_id," + account_user_id + ",par_start_time," + $("#txtb_start_time").val() + ",par_end_time," + $("#txtb_end_time").val()

        h.post("../cATSTOAppr/GetCheckList", {
            par_period_from: $("#dd_travel_date_from_rep").val()
            , par_period_to: $("#dd_travel_date_to_rep").val()
            , par_dept_code: $("#ddl_dept_rep").val()
            , par_type: s.par_report_type
            , par_user_id: account_user_id
            , par_start_time: $("#txtb_start_time").val()
            , par_end_time: $("#txtb_end_time").val()
        }).then(function (d) {
            if (d.data.message == "success") {
                console.log(d.data.sp_travel_order_daily_pa_rep)
                if (d.data.sp_travel_order_daily_pa_rep.length > 0) {
                    s.datalistgridCheck = d.data.sp_travel_order_daily_pa_rep

                    s.number_check_to_action = s.datalistgridCheck.length

                    s.oTableCheck_dtl.fnClearTable();
                    s.oTableCheck_dtl.fnAddData(s.datalistgridCheck)
                }

                else {
                    s.datalistgridCheck = []
                    s.oTableCheck_dtl.fnClearTable();
                }


                $('#modal_generating_remittance').modal("hide");
                $("#TO_check_modal").modal({ keyboard: false, backdrop: "static" })
            }

            else {
                s.datalistgridCheck = []
                s.oTableCheck_dtl.fnClearTable();
                $('#modal_generating_remittance').modal("hide");
                swal({ icon: "warning", title: d.data.message });
                //$("#TO_check_modal").modal({ keyboard: false, backdrop: "static" })
            }
        })



    }

    s.btn_data_checklist_actioned = function () {
        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
        $("#TO_print_par").modal("hide");


        //DIRI
        var parameters = "par_period_from," + $("#dd_travel_date_from_rep").val() + ",par_period_to," + $("#dd_travel_date_to_rep").val() + ",par_dept_code," + $("#ddl_dept_rep").val() + ",par_type," + s.par_report_type + ",par_user_id," + account_user_id + ",par_start_time," + $("#txtb_start_time").val() + ",par_end_time," + $("#txtb_end_time").val()

        h.post("../cATSTOAppr/GetCheckListActioned", {
            par_period_from: $("#dd_travel_date_from_rep").val()
            , par_period_to: $("#dd_travel_date_to_rep").val()
            , par_dept_code: $("#ddl_dept_rep").val()
            , par_type: s.par_report_type
            , par_user_id: account_user_id
            , par_start_time: $("#txtb_start_time").val()
            , par_end_time: $("#txtb_end_time").val()
        }).then(function (d) {
            if (d.data.message == "success") {

                var checked_data = d.data.sp_travel_order_daily_pa_rep_actioned
                console.log(checked_data)
                if (d.data.sp_travel_order_daily_pa_rep_actioned.length > 0) {
                    s.datalistgridCheckActioned = checked_data


                    s.number_check_actined_apvd = s.datalistgridCheckActioned.filter(function (d) {
                        return d.approved_status == "Y"
                    }).length

                    s.number_check_actined_dis = s.datalistgridCheckActioned.filter(function (d) {
                        return d.approved_status == "D"
                    }).length

                    s.oTableCheck_dtl_actioned.fnClearTable();
                    s.oTableCheck_dtl_actioned.fnAddData(s.datalistgridCheckActioned)
                }

                else {
                    s.datalistgridCheckActioned = []
                    s.oTableCheck_dtl_actioned.fnClearTable();
                }


                $('#modal_generating_remittance').modal("hide");
                $("#TO_check_modal_actioned").modal({ keyboard: false, backdrop: "static" })
            }

            else {
                s.datalistgridCheckActioned = []
                s.oTableCheck_dtl_actioned.fnClearTable();
                $('#modal_generating_remittance').modal("hide");
                swal({ icon: "warning", title: d.data.message });
                //$("#TO_check_modal").modal({ keyboard: false, backdrop: "static" })
            }
        })



    }

    s.btn_check_action = function (id) {
        var proceed = false
        var ch_stat = $('#checkbox' + id)[0].checked
        var to_nbr = s.datalistgridCheck[id].travel_order_no

        var apr_stat = s.datalistgridCheck[id].approved_status

        if (!ch_stat) {
            swal({
                title: "Remove approved status",
                text: "Would you like to remove approved status?",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            }).then(function (willDelete) {
                if (willDelete) {
                    h.post("../cATSTOAppr/SaveDetails", {
                        ch_stat: ch_stat
                        , par_empl_id: s.datalistgridCheck[id].empl_id
                        , par_to_nbr: s.datalistgridCheck[id].travel_order_no
                    }).then(function (d) {
                        if (d.data.icon != "success") {
                            swal({ icon: "warning", title: d.data.message });
                            $('#checkbox' + id).prop("checked", true)
                        }
                    })
                }
                else {
                    $('#checkbox' + id).prop("checked", true)
                }
            });
        }
        else {
            h.post("../cATSTOAppr/SaveDetails", {
                ch_stat: ch_stat
                , par_empl_id: s.datalistgridCheck[id].empl_id
                , par_to_nbr: s.datalistgridCheck[id].travel_order_no
            }).then(function (d) {
                if (d.data.icon == "success") {
                    s.datalistgridCheck[id].approved_status = 'Y'
                }
                else {
                    if (d.data.message == "This item already is approved, please remove approved status first") {
                        swal({ icon: "warning", title: d.data.message });
                    }
                    else {
                        swal({ icon: "warning", title: d.data.message });
                    }
                    $('#checkbox' + id).prop('checked', false);
                }
            })
        }

    }


    s.btn_check_action_2 = function (id) {
        var proceed = false
        var ch_stat = $('#checkbox_2' + id)[0].checked
        var to_nbr = s.datalistgridCheckActioned[id].travel_order_no

        var apr_stat = s.datalistgridCheckActioned[id].approved_status

        if (!ch_stat) {
            swal({
                title: "Remove approved status",
                text: "Would you like to remove approved status?",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            }).then(function (willDelete) {
                if (willDelete) {
                    h.post("../cATSTOAppr/SaveDetails", {
                        ch_stat: ch_stat
                        , par_empl_id: s.datalistgridCheckActioned[id].empl_id
                        , par_to_nbr: s.datalistgridCheckActioned[id].travel_order_no
                    }).then(function (d) {
                        if (d.data.icon != "success") {
                            swal({ icon: "warning", title: d.data.message });
                            $('#checkbox_2' + id).prop("checked", true)
                        }
                    })
                }
                else {
                    $('#checkbox_2' + id).prop("checked", true)
                }
            });
        }
        else {
            h.post("../cATSTOAppr/SaveDetails", {
                ch_stat: ch_stat
                , par_empl_id: s.datalistgridCheckActioned[id].empl_id
                , par_to_nbr: s.datalistgridCheckActioned[id].travel_order_no
            }).then(function (d) {
                if (d.data.icon == "success") {
                    s.datalistgridCheckActioned[id].approved_status = 'Y'
                }
                else {
                    if (d.data.message == "This item already is approved, please remove approved status first") {
                        swal({ icon: "warning", title: d.data.message });
                    }
                    else {
                        swal({ icon: "warning", title: d.data.message });
                    }
                    $('#checkbox_2' + id).prop('checked', false);
                }
            })
        }
    }




    s.btn_click_generate_checklist = function () {

        $("#modal_generating_remittance").modal("show")

         h.post("../cATSTOAppr/Generate_Checklist", {
             period_from: ""
             , period_to: ""
         }).then(function (d) {
                $("#modal_generating_remittance").modal("hide")
                swal({ icon:d.data.icon, title: d.data.message });
        })
    }





    s.btn_check_action_dis = function (id, checked) {
        s.checklist_row_id = id
        var ch_stat = $('#checkbox_dis' + id)[0].checked
        if (ch_stat == true) {

            if (s.datalistgridCheck[id].approved_status == "D") {
                $('#checkbox_dis' + id).prop('checked', true);
            }
            if ($('#checkbox_dis' + id).is(":checked")) {
                h.post("../cATSTOAppr/CheckCommentDisapproved", {
                    //par_action: s.datalistgrid2[id].included
                    par_empl_id: s.datalistgridCheck[id].empl_id
                    , par_to_nbr: s.datalistgridCheck[id].travel_order_no
                }).then(function (d) {
                    if (d.data.icon == "success") {
                        s.comment_list_orig = d.data.comment_list
                        s.comment_list = d.data.comment_list
                        $('#disapprove_comment_text').val(d.data.comment)
                        $("#disapprove_comment_modal").modal("show")
                    }
                    else {
                        swal({ icon: "warning", title: d.data.message });
                        $('#checkbox_dis' + id).prop('checked', false);
                    }
                })

            }
        }
        else {
            swal({
                title: "Remove Previous Action",
                text: "Would you like to remove the current status?",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
                .then(function (willDelete) {
                    if (willDelete) {

                        h.post("../cATSTOAppr/SaveDetailsDisapproved", {
                            //par_action: s.datalistgrid2[id].included
                            ch_stat: ch_stat
                            , par_empl_id: s.datalistgridCheck[id].empl_id
                            , par_to_nbr: s.datalistgridCheck[id].travel_order_no
                            , comment: ""
                        }).then(function (d) {
                            if (d.data.icon != "success") {
                                swal({ icon: "warning", title: d.data.message });
                                $('#checkbox_dis' + id).prop('checked', true);
                            }
                            else {
                                s.datalistgridCheck[id].approved_status = 'N'
                            }


                            $("#disapprove_comment_modal").modal("hide")
                        })
                    }
                    else {
                        if (s.datalistgridCheck[id].approved_status == "D") {
                            $('#checkbox_dis' + id).prop('checked', true);
                        }
                        else {
                            $('#checkbox_dis' + id).prop('checked', false);
                        }
                    }

                });

        }
    }


    //s.btn_check_action_dis_2 = function (id, checked) {
    //    s.checklist_row_id_2 = id
    //    var ch_stat = $('#checkbox_dis_2' + id)[0].checked
    //    if (ch_stat == true) {

    //        if (s.datalistgridCheckActioned[id].approved_status == "D") {
    //            $('#checkbox_dis_2' + id).prop('checked', true);
    //        }
    //        if ($('#checkbox_dis_2' + id).is(":checked")) {
    //            h.post("../cATSTOAppr/CheckCommentDisapproved", {
    //                //par_action: s.datalistgrid2[id].included
    //                  par_empl_id: s.datalistgridCheckActioned[id].empl_id
    //                , par_to_nbr: s.datalistgridCheckActioned[id].travel_order_no
    //            }).then(function (d) {
    //                if (d.data.icon == "success") {
    //                    s.comment_list_orig_2 = d.data.comment_list
    //                    s.comment_list_2 = d.data.comment_list
    //                    $('#disapprove_comment_text_2').val(d.data.comment)
    //                    $("#disapprove_comment_modal_2").modal("show")
    //                }
    //                else {
    //                    swal({ icon: "warning", title: d.data.message });
    //                    $('#checkbox_dis_2' + id).prop('checked', false);
    //                }
    //            })

    //        }
    //    }
    //    else {
    //        swal({
    //            title: "Remove Previous Action",
    //            text: "Would you like to remove the current status?",
    //            icon: "warning",
    //            buttons: true,
    //            dangerMode: true,
    //        })
    //            .then(function (willDelete) {
    //                if (willDelete) {

    //                    h.post("../cATSTOAppr/SaveDetailsDisapproved", {
    //                        //par_action: s.datalistgrid2[id].included
    //                        ch_stat: ch_stat
    //                        , par_empl_id: s.datalistgridCheckActioned[id].empl_id
    //                        , par_to_nbr: s.datalistgridCheckActioned[id].travel_order_no
    //                        , comment: ""
    //                    }).then(function (d) {
    //                        if (d.data.icon != "success") {
    //                            swal({ icon: "warning", title: d.data.message });
    //                            $('#checkbox_dis_2' + id).prop('checked', true);
    //                        }
    //                        else {
    //                            s.datalistgridCheckActioned[id].approved_status = 'N'
    //                        }


    //                        $("#disapprove_comment_modal_2").modal("hide")
    //                    })
    //                }
    //                else {
    //                    if (s.datalistgridCheckActioned[id].approved_status == "D") {
    //                        $('#checkbox_dis_2' + id).prop('checked', true);
    //                    }
    //                    else {
    //                        $('#checkbox_dis_2' + id).prop('checked', false);
    //                    }
    //                }

    //            });

    //    }
    //}

    s.btn_check_action_dis_2 = function (id, checked) {
        s.checklist_row_id_2 = id

        if (s.datalistgridCheckActioned[id].approved_status == "D") {
            $('#checkbox_dis_2' + id).prop('checked', true);
        }


        if ($('#checkbox_dis_2' + id).is(":checked")) {
            h.post("../cATSTOAppr/CheckCommentDisapproved", {
                //par_action: s.datalistgrid2[id].included
                par_empl_id: s.datalistgridCheckActioned[id].empl_id
                , par_to_nbr: s.datalistgridCheckActioned[id].travel_order_no
            }).then(function (d) {
                if (d.data.icon == "success") {
                    s.comment_list_orig_2 = d.data.comment_list
                    s.comment_list_2 = d.data.comment_list

                    console.log(d.data.comment)

                    $('#disapprove_comment_text_2').val(d.data.comment)
                    $("#disapprove_comment_modal_2").modal("show")
                }
                else {
                    swal({ icon: "warning", title: d.data.message });
                    if (s.datalistgridCheckActioned[id].approved_status != "D") {
                        $('#checkbox_dis_2' + id).prop('checked', false);
                    }
                }
            })

        }
    }

    s.btn_remove_disapprove_2 = function () {

        var id = s.checklist_row_id_2

        var ch_stat = true

        if (s.datalistgridCheckActioned[id].approved_status == "D") {
            ch_stat = false
        }
        if (ch_stat == false) {
            swal({
                title: "Remove Previous Action",
                text: "Would you like to remove the current status?",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
                .then(function (willDelete) {
                    if (willDelete) {

                        h.post("../cATSTOAppr/SaveDetailsDisapproved", {
                            //par_action: s.datalistgrid2[id].included
                            ch_stat: ch_stat
                            , par_empl_id: s.datalistgridCheckActioned[id].empl_id
                            , par_to_nbr: s.datalistgridCheckActioned[id].travel_order_no
                            , comment: ""
                        }).then(function (d) {
                            if (d.data.icon != "success") {
                                swal({ icon: "warning", title: d.data.message });
                                $('#checkbox_dis_2' + id).prop('checked', true);
                            }
                            else {
                                s.datalistgridCheckActioned[id].approved_status = 'N'
                                $('#checkbox_dis_2' + id).prop('checked', false);
                            }


                            $("#disapprove_comment_modal_2").modal("hide")
                        })
                    }
                    else {
                        if (s.datalistgridCheckActioned[id].approved_status == "D") {
                            $('#checkbox_dis_2' + id).prop('checked', true);
                        }
                        else {
                            $('#checkbox_dis_2' + id).prop('checked', false);
                        }
                    }

                });
        }

    }

    s.btn_cancel_disapprove = function () {
        var id = s.checklist_row_id

        if (s.datalistgridCheck[id].approved_status == "D") {
            $('#checkbox_dis' + id).prop('checked', true);
        }
        else {
            $('#checkbox_dis' + id).prop('checked', false);
        }
    }

    s.btn_cancel_disapprove_2 = function () {
        var id = s.checklist_row_id_2
        console.log(s.datalistgridCheckActioned[id])
        if (s.datalistgridCheckActioned[id].approved_status == "D") {
            $('#checkbox_dis_2' + id).prop('checked', true);
        }
        else {
            $('#checkbox_dis_2' + id).prop('checked', false);
        }
    }

    s.btn_save_disapprove = function () {
        var comment = ""


        var id = s.checklist_row_id

        var ch_stat = $('#checkbox_dis' + s.checklist_row_id)[0].checked

        if (ch_stat == true) {
            if (!cs.Validate1Field("disapprove_comment_text")) {
                return
            }
            else {
                cs.notrequired2("disapprove_comment_text")
                comment = $('#disapprove_comment_text').val()
            }
        }
        h.post("../cATSTOAppr/SaveDetailsDisapproved", {
            //par_action: s.datalistgrid2[id].included
            ch_stat: ch_stat
            , par_empl_id: s.datalistgridCheck[id].empl_id
            , par_to_nbr: s.datalistgridCheck[id].travel_order_no
            , comment: comment
        }).then(function (d) {
            if (d.data.icon != "success") {
                swal({ icon: "warning", title: d.data.message });
                $('#checkbox_dis' + id).prop('checked', false);
            }
            else {
                s.datalistgridCheck[id].approved_status = 'D'
            }


            $("#disapprove_comment_modal").modal("hide")
        })
    }


    s.btn_save_disapprove_2 = function () {
        var comment = ""
        var id = s.checklist_row_id_2

        var ch_stat = $('#checkbox_dis_2' + s.checklist_row_id_2)[0].checked

        if (ch_stat == true) {

            if (!cs.Validate1Field("disapprove_comment_text_2")) {
                return
            }
            else {
                cs.notrequired2("disapprove_comment_text_2")
                comment = $('#disapprove_comment_text_2').val()
            }
        }

        h.post("../cATSTOAppr/SaveDetailsDisapproved", {
            //par_action: s.datalistgrid2[id].included
            ch_stat: ch_stat
            , par_empl_id: s.datalistgridCheckActioned[id].empl_id
            , par_to_nbr: s.datalistgridCheckActioned[id].travel_order_no
            , comment: comment
        }).then(function (d) {
            if (d.data.icon != "success") {
                swal({ icon: "warning", title: d.data.message });
                $('#checkbox_dis_2' + id).prop('checked', false);
            }
            else {
                s.datalistgridCheckActioned[id].approved_status = 'D'
            }
            $("#disapprove_comment_modal_2").modal("hide")
        })
    }


    s.btn_click_check_rep = function () {
        $("#modal_generating_remittance").modal({ keyboard: false, backdrop: "static" })
        var period_from_par = $("#dd_travel_date_from_rep").val();
        var period_to_par = $("#dd_travel_date_to_rep").val();
        console.log(moment(current_date).format("YYYY-MM-DD"))

        if ($("#dd_travel_date_from_rep").val() == "" || $("#dd_travel_date_to_rep").val() == "") {
            period_from_par = moment(current_date).format("YYYY-MM-DD")
            period_to_par = moment(current_date).format("YYYY-MM-DD")
        }

        var controller = "Reports";
        var action = "Index";
        var ReportName = "cryTravelOrderDailyReport";
        var SaveName = "Crystal_Report";
        var ReportType = "inline";
        var ReportPath = "~/Reports/cryTravelOrderDailycheck/cryTravelOrderDailycheck.rpt";
        var sp = "sp_travel_order_daily_pa_rep"
        var parameters = "par_period_from," + period_from_par + ",par_period_to," + period_to_par + ",par_dept_code," + $("#ddl_dept_rep").val() + ",par_type," + s.par_report_type + ",par_user_id," + account_user_id + ",par_start_time," + $("#txtb_start_time").val() + ",par_end_time," + $("#txtb_end_time").val()

        //// *******************************************************
        //// *** VJA : 2021-07-14 - Validation and Loading hide ****
        //// *******************************************************
        //s.employee_name_print = "TRAVEL ORDER";

        var iframe = document.getElementById('iframe_print_preview');
        var iframe_page = $("#iframe_print_preview")[0];
        iframe.style.visibility = "hidden";

        s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
            + "&ReportName=" + ReportName
            + "&SaveName=" + SaveName
            + "&ReportType=" + ReportType
            + "&ReportPath=" + ReportPath
            + "&id=" + sp + "," + parameters

        console.log(s.embed_link)

        if (!/*@cc_on!@*/0) { //if not IE
            iframe.onload = function () {
                iframe.style.visibility = "visible";
                $("#modal_generating_remittance").modal("hide")
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
                    $("#modal_generating_remittance").modal("hide")
                }
            };
        }

        iframe.src = s.embed_link;
        $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
    }







    //$('#datalist_grid_check').on('mouseover', '.hver', function () {

    //    var tr = $(this).closest('tr');
    //    var row = $('#datalist_grid_check').DataTable().row(tr);

    //    row.child(format_check(row.data())).show();
    //    tr.addClass('shown');


    //}).on('mouseout', '.hver', function () {

    //    var tr = $(this).closest('tr');
    //    var row = $('#datalist_grid_check').DataTable().row(tr);
    //    row.child.hide();
    //    tr.removeClass('shown');

    //});

    //$('#datalist_grid_check_actioned').on('mouseover', '.hver', function () {

    //    var tr = $(this).closest('tr');
    //    var row = $('#datalist_grid_check_actioned').DataTable().row(tr);
    //    row.child(format_check(row.data())).show();
    //    tr.addClass('shown');


    //}).on('mouseout', '.hver', function () {

    //    var tr = $(this).closest('tr');
    //    var row = $('#datalist_grid_check_actioned').DataTable().row(tr);
    //    row.child.hide();
    //    tr.removeClass('shown');

    //});


})


