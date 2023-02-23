ng_selfService_App.controller("cSSAuthorizationSlipAppl_Ctrl", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http

    s.arr_dates = null;
    s.userid = "";
    s.log_in_as_AO = false;
    s.rowLen = "10";
    s.year = [];
    s.ShowFLP = false;
    s.holidays_list = null;
    s.as_type_list = null;
    s.prev_date_click = 0;
    s.dtl_enable = true;
    s.inpDisabled = true;
    s.reason_list = null;
    s.dis_as_type = false;
    s.tot_nbr_days = 0;
    s.show_creator = false;
    s.is_to = true;
    s.log_user_id = "";
    s.log_user_name = "";
    function init() {
        try {
            $('.clockpicker').clockpicker({
                placement: 'top',
                align: 'left',
                donetext: 'Done',
                twelvehour: true,
                upperCaseAmPm: true,
                leadingSpaceAmPm: false,
                leadingZeroHours: true,
            });
            $("#loading_data").modal({ backdrop: "static" });
            $("#datalist_grid thead").remove();
            //**********************************************
            // Initialize data during page loads
            //**********************************************
            $('#div_dtr_date .input-group.date').datepicker({
                todayBtn: "linked",
                keyboardNavigation: false,
                forceParse: false,
                calendarWeeks: true,
                autoclose: true,
                format: "yyyy-mm-dd"
            });

            h.post("../cSSAuthorizationSlipAppl/InitializeData").then(function (d) {
                if (d.data.message == "success") {

                    s.log_in_as_AO = d.data.log_in_as_AO == "True" ? true : false;
                    s.userid = d.data.userid
                    s.statusList = d.data.status;
                    s.txtb_empl_id = d.data.user_info.empl_id;

                    if (d.data.as_list.length > 0) {
                        init_table_data(d.data.as_list);
                        s.arr_dates = d.data.as_list;
                    }
                    else {
                        init_table_data([]);
                    }

                    if (d.data.as_list_by_employee.length > 0) {
                        s.arr_dates = d.data.as_list_by_employee;
                        init_table_data2(d.data.as_list_by_employee);
                    }
                    else {
                        init_table_data2([]);
                    }

                    s.holidays_list = d.data.holidays_list;
                    initialize_calendar();


                    calendar_plot_holiday_data();
                    calendar_data();
                    s.as_type_list = d.data.as_type_list;
                    s.reason_list = d.data.reason_list;
                    s.empl_names = d.data.empl_name;
                    s.ddl_name = d.data.user_info.empl_id
                    s.log_user_id = d.data.user_info.empl_id
                    s.log_user_name = d.data.user_info.last_name
                        + ", "
                        + d.data.user_info.first_name
                        + " "
                        + d.data.user_info.middle_name.charAt(0);
                    //**********************************************
                    //  Show/Hide ADD, EDIT, DELETE button 
                    //**********************************************
                    s.allowAdd = d.data.um.allow_add
                    s.allowDelete = d.data.um.allow_delete
                    s.allowEdit = d.data.um.allow_edit
                    s.allowView = d.data.um.allow_view

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

                }
                else {
                    swal(d.data.message, { icon: "warning", });
                }

                $("#loading_data").modal("hide");
            });

            $('span.input-group-addon.pm_out').on('click', function (e) {
                s.inpDisabled = $("#txtb_pm_out").prop('disabled');
                if (s.inpDisabled) {
                    $('span.input-group-addon.pm_out').click();
                }
            });

            $('span.input-group-addon.pm_in').on('click', function (e) {
                s.inpDisabled = $("#txtb_pm_in").prop('disabled');
                if (s.inpDisabled) {
                    $('span.input-group-addon.pm_in').click();
                }
            });

            $('span.input-group-addon.am_out').on('click', function (e) {
                s.inpDisabled = $("#txtb_am_out").prop('disabled');
                if (s.inpDisabled) {
                    $('span.input-group-addon.am_out').click();
                }
            });

            $('span.input-group-addon.am_in').on('click', function (e) {
                s.inpDisabled = $("#txtb_am_in").prop('disabled');
                if (s.inpDisabled) {
                    $('span.input-group-addon.am_in').click();
                }
            });

            $('span.input-group-addon.dtr_date').on('click', function (e) {
                s.inpDisabled = $("#txtb_dtr_date").prop('disabled');
                if (s.inpDisabled) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            });

            $('i.dtr_date').on('click', function (e) {
                s.inpDisabled = $("#txtb_dtr_date").prop('disabled');
                if (s.inpDisabled) {
                    e.stopPropagation();
                }
            });

        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }
    init()

    var init_table_data = function (par_data) {
        try {
            s.datalistgrid = par_data;
            s.oTable = $('#datalist_grid').dataTable(
                {
                    data: s.datalistgrid,
                    bSort: false,
                    sDom: 'rt<"bottom">',
                    paging: false,
                    columns: [
                        {
                            className: 'table-dataTable-tbody-td',
                            "mData": null,
                            "mRender": function (data, type, full, row) {
                                var temp = ""
                                var empl_id = "";
                                var creator_id = "";
                                try {
                                    empl_id = full['empl_id'].toString();
                                    creator_id = full['creator_id'].replace('U', '');
                                }
                                catch (err) {
                                    empl_id = s.txtb_empl_id;
                                    creator_id = s.txtb_empl_id;
                                }
                                var enable_button = "";
                                var edit_text = "Edit";
                                var show_creator = false;
                                // If the creator is also the owner of the application
                                if (empl_id == creator_id) {
                                    enable_button = "block";
                                }
                                // If he is the creator but not the owner
                                else if (creator_id == s.userid.replace('U', '')) {
                                    enable_button = "block";
                                }
                                //If the current user owns the application but not the creator
                                else {
                                    enable_button = "none";
                                    show_creator = true;
                                    edit_text = "View Details";
                                }

                                if (full["rcrd_status"].toString() == "F") {
                                    temp = "<div class='xx input-group m-b'>"
                                        + "<span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'>"
                                        + "<div class='external-event navy-bg approved-bg'><h4>"
                                        + full["as_dtr_date"] + " | " + "<small style='width:70% !important;margin-top:10px;white-space:nowrap;overflow:hidden;text-overflow:\"...\";color:white !important;font-size:13px;'>" + full["employee_name"]
                                        + "</small><br/>"
                                        + full["rcrd_status_descr"] + " " + full["astype_descr"] + " <span class='pull-right' ng-show='" + show_creator + "'>By: " + full["creator_id"].replace('U', '#') + "</span><br/>#" + parseInt(full["application_nbr"]) + "</h4></div></span>  <ul class='dropdown-menu'>"
                                        + "<li><a ng-click='btn_edit_action(" + row["row"] + ",\"hdr\")'>View Details</a></li>"
                                        + "<li><a ng-click='btn_print_action(" + row["row"] + ",\"hdr\")'>Print AS</a></li>"
                                        + "</ul></div>"
                                    // temp = "<div class='xx input-group m-b'><span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'><div class='external-event navy-bg approved-bg'><h4>" + full["as_dtr_date"] + " | " + parseInt(full["application_nbr"]) + "<br/>" + full["rcrd_status_descr"] + "</h4></div></span> <ul class='dropdown-menu'><li><a ng-click='btn_edit_action(" + row["row"] + ")'>Edit</a></li><li><a ng-click='btn_del_row(" + row["row"] + ")'>Cancel</a></li></ul></div>"
                                }
                                else if (full["rcrd_status"].toString() == "1" || full["rcrd_status"].toString() == "2" || full["rcrd_status"].toString() == "3") {
                                    temp = "<div class='xx input-group m-b'>"
                                        + "<span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'>"
                                        + "<div class='external-event navy-bg reviewed-bg'><h4>"
                                        + full["as_dtr_date"] + " | " + "<small style='width:70% !important;margin-top:10px;white-space:nowrap;overflow:hidden;text-overflow:\"...\";color:white !important;font-size:13px;'>" + full["employee_name"]
                                        + "</small><br/>"
                                        + full["rcrd_status_descr"] + " " + full["astype_descr"] + "<span class='pull-right' ng-show='" + show_creator + "'>By: " + full["creator_id"].replace('U', '#') + "</span><br/>#" + parseInt(full["application_nbr"]) + "</h4></div></span> <ul class='dropdown-menu'><li>"
                                        + "<a ng-click='btn_edit_action(" + row["row"] + ",\"hdr\")'>View Details</a></li>"
                                        + "<li><a ng-click='btn_print_action(" + row["row"] + ",\"hdr\")'>Print AS</a></li>"
                                        + "</ul></div>"
                                    // temp = "<div class='xx input-group m-b'><span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'><div class='external-event navy-bg approved-bg'><h4>" + full["as_dtr_date"] + " | " + parseInt(full["application_nbr"]) + "<br/>" + full["rcrd_status_descr"] + "</h4></div></span> <ul class='dropdown-menu'><li><a ng-click='btn_edit_action(" + row["row"] + ")'>Edit</a></li><li><a ng-click='btn_del_row(" + row["row"] + ")'>Cancel</a></li></ul></div>"
                                }
                                else if (full["rcrd_status"].toString() == "D" || full["rcrd_status"].toString() == "L") {
                                    temp = "<div class='xx input-group m-b'>"
                                        + "<span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'>"
                                        + "<div class='external-event navy-bg disapproved-bg'><h4>"
                                        + full["as_dtr_date"] + " | " + "<small style='width:70% !important;margin-top:10px;white-space:nowrap;overflow:hidden;text-overflow:\"...\";color:white !important;font-size:13px;'>" + full["employee_name"]
                                        + "</small><br/>"
                                        + full["rcrd_status_descr"] + " " + full["astype_descr"] + "<span class='pull-right' ng-show='" + show_creator + "'>By: " + full["creator_id"].replace('U', '#') + "</span><br/>#" + parseInt(full["application_nbr"]) + "</h4></div></span> <ul class='dropdown-menu'><li>"
                                        + "<a ng-click='btn_edit_action(" + row["row"] + ",\"hdr\")'>View Details</a></li>"
                                        + "<li><a ng-click='btn_print_action(" + row["row"] + ",\"hdr\")'>Print AS</a></li>"
                                        + "</ul></div>"
                                    //temp = "<div class='xx input-group m-b'><span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'><div class='external-event navy-bg disapproved-bg'><h4>" + full["as_dtr_date"] + " | " + parseInt(full["application_nbr"]) + " <br/>" + full["rcrd_status_descr"] + "</h4></div></span> <ul class='dropdown-menu'><li><a ng-click='btn_edit_action(" + row["row"] + ")'>Edit</a></li></ul></div>"
                                }
                                else if (full["rcrd_status"].toString() == "C") {
                                    temp = "<div class='xx input-group m-b'>"
                                        + "<span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'>"
                                        + "<div class='external-event navy-bg cancel-bg'><h4>"
                                        + full["as_dtr_date"] + " | " + "<small style='width:70% !important;margin-top:10px;white-space:nowrap;overflow:hidden;text-overflow:\"...\";color:white !important;font-size:13px;'>" + full["employee_name"]
                                        + "</small><br/>"
                                        + full["rcrd_status_descr"] + " " + full["astype_descr"] + "<span class='pull-right' ng-show='" + show_creator + "'>By: " + full["creator_id"].replace('U', '#') + "</span><br/>#" + parseInt(full["application_nbr"]) + "</h4></div></span> <ul class='dropdown-menu'><li>"
                                        + "<a ng-click='btn_edit_action(" + row["row"] + ",\"hdr\")'>" + edit_text + "</a></li>"
                                        + "<li style='display:" + enable_button + "'><a ng-click='btn_del_row(" + row["row"] + ",\"HDR\")'>Delete</a></li>"
                                        + "<li style='display:" + enable_button + "'><a ng-click='btn_del_All(" + row["row"] + ")'>Delete All</a></li>"
                                        + "<li><a ng-click='btn_print_action(" + row["row"] + ",\"hdr\")'>Print AS</a></li>"
                                        + "</ul></div>"

                                    //temp = "<div class='xx input-group m-b'><span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'><div class='external-event navy-bg cancel-bg'><h4>" + full["as_dtr_date"] + " | " + parseInt(full["application_nbr"]) + "<br/>" + full["rcrd_status_descr"] + "</h4></div></span> <ul class='dropdown-menu'><li><a ng-click='btn_edit_action(" + row["row"] + ")'>Edit</a></li><li><a ng-click='btn_del_row(" + row["row"] + ")'>Cancel</a></li></ul></div>"
                                }
                                else if (full["rcrd_status"].toString() == "N") {

                                    temp = "<div class='xx input-group m-b'>"
                                        + "<span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'>"
                                        + "<div class='external-event navy-bg new-bg'><h4>"
                                        + full["as_dtr_date"] + " | " + "<small style='width:70% !important;margin-top:10px;white-space:nowrap;overflow:hidden;text-overflow:\"...\";color:white !important;font-size:13px;'>" + full["employee_name"]
                                        + "</small><br/>"
                                        + full["rcrd_status_descr"] + " " + full["astype_descr"] + "<span class='pull-right' ng-show='" + show_creator + "'>By: " + full["creator_id"].replace('U', '#') + "</span><br/>#" + parseInt(full["application_nbr"]) + "</h4></div></span> <ul class='dropdown-menu'><li>"
                                        + "<a ng-click='btn_edit_action(" + row["row"] + ",\"hdr\")'>" + edit_text + "</a></li>"
                                        + "<li style='display:" + enable_button + "'><a ng-click='btn_del_row(" + row["row"] + ",\"HDR\")'>Delete</a></li>"
                                        + "<li style='display:" + enable_button + "'><a ng-click='btn_del_All(" + row["row"] + ")'>Delete All</a></li>"
                                        + "<li><a ng-click='btn_print_action(" + row["row"] + ",\"hdr\")'>Print AS</a></li>"
                                        + "</ul></div>"
                                }
                                else if (full["rcrd_status"].toString() == "R") {
                                    temp = "<div class='xx input-group m-b'>"
                                        + "<span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'>"
                                        + "<div class='external-event navy-bg reviewed-bg'><h4>"
                                        + full["as_dtr_date"] + " | " + "<small style='width:70% !important;margin-top:10px;white-space:nowrap;overflow:hidden;text-overflow:\"...\";color:white !important;font-size:13px;'>" + full["employee_name"]
                                        + "</small><br/>"
                                        + full["rcrd_status_descr"] + " " + full["astype_descr"] + "<span class='pull-right' ng-show='" + show_creator + "'>By: " + full["creator_id"].replace('U', '#') + "</span><br/>#" + parseInt(full["application_nbr"]) + "</h4></div></span> <ul class='dropdown-menu'><li>"
                                        + "<a ng-click='btn_edit_action(" + row["row"] + ",\"hdr\")'>View Details</a></li>"
                                        // + "<li style='display:" + enable_button +"'><a ng-click='btn_cancel(" + row["row"] + ")'>Cancel</a></li>"
                                        + "<li><a ng-click='btn_print_action(" + row["row"] + ",\"hdr\")'>Print AS</a></li>"
                                        + "</ul></div>"

                                    //temp = "<div class='xx input-group m-b'><span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'><div class='external-event navy-bg reviewed-bg'><h4>" + full["as_dtr_date"] + " | " + parseInt(full["application_nbr"]) + "<br/>" + full["rcrd_status_descr"] + "</h4></div></span> <ul class='dropdown-menu'><li><a ng-click='btn_edit_action(" + row["row"] + ")'>Edit</a></li><li><a ng-click='btn_del_row(" + row["row"] + ")'>Cancel</a></li></ul></div>"
                                }
                                else if (full["rcrd_status"].toString() == "S") {
                                    temp = "<div class='xx input-group m-b'>"
                                        + "<span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'>"
                                        + "<div class='external-event navy-bg submitted-bg'><h4>"
                                        + full["as_dtr_date"] + " | <small style='width:70% !important;margin-top:10px;white-space:nowrap;overflow:hidden;text-overflow:\"...\";color:white !important;font-size:13px;'>" + full["employee_name"]
                                        + "</small><br/>"
                                        + full["rcrd_status_descr"] + " " + full["astype_descr"] + "<span class='pull-right' ng-show='" + show_creator + "'>By: " + full["creator_id"].replace('U', '#') + "</span><br/>#" + parseInt(full["application_nbr"]) + "</h4></div></span> <ul class='dropdown-menu'><li>"
                                        + "<a ng-click='btn_edit_action(" + row["row"] + ",\"hdr\")'>View Details</a></li>"
                                        + "<li><a ng-click='btn_print_action(" + row["row"] + ",\"hdr\")'>Print AS</a></li>"
                                        + "</ul></div>"

                                }
                                return temp;
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
                                var empl_id = "";
                                var creator_id = "";
                                try {
                                    empl_id = full['empl_id'].toString();
                                    creator_id = full['creator_id'];
                                }
                                catch (err) {
                                    empl_id = s.txtb_empl_id;
                                    creator_id = s.userid;
                                }
                                var enable_button = "";

                                //// If the creator is also the owner of the application
                                //if (empl_id == creator_id) {
                                //    enable_button = false;
                                //}
                                //// If he is the creator but not the owner
                                //else
                                if (creator_id == s.userid) {
                                    enable_button = false;
                                }
                                //If the current user owns the application but not the creator
                                else {
                                    enable_button = true;
                                }
                                if (full['rcrd_status'] == "N" || full['rcrd_status'] == "C") {

                                    temp = '<center><div class="btn-group">' +
                                        '<button type="button" ng-disabled="' + enable_button + '" class="btn btn-success btn-sm" ng-click="btn_edit_as_details(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit"><i class="fa fa-edit"></i></button>' +
                                        '<button type="button" ng-disabled="' + enable_button + '" class="btn btn-danger btn-sm" ng-click="btn_del_row3(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Remove"><i class="fa fa-times"></i></button>' +
                                        '</div></center>';
                                }
                                else if (full['rcrd_status'] == "F") {
                                    temp = '<center><div class="btn-group">' +
                                        '<button type="button" class="btn btn-success btn-sm" ng-click="btn_edit_as_details(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="View Details"><i class="fa fa-eye"></i></button>' +
                                        '</div ></center > ';
                                    //temp = '<center><div class="btn-group">' +
                                    //    '<button type="button" ng-disabled="' + enable_button +'" class="btn btn-danger btn-sm" ng-click="btn_cancel(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Cancel Leave"><i class="fa fa-ban"></i></button>' +
                                    //    '</div></center>';
                                }
                                else if (full['rcrd_status'] == "L") {
                                    var show_this = full['approval_status'] == "C" ? true : false;
                                    temp = '<center><div class="btn-group">' +
                                        '<button type="button" class="btn btn-success btn-sm" ng-click="btn_edit_as_details(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="View Details"><i class="fa fa-eye"></i></button>' +
                                        '<button type="button" ng-show="' + show_this + '" ng-disabled="' + enable_button + '" class="btn btn-success btn-sm" ng-click="btn_undo_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Undo"><i class="fa fa-undo"></i></button>' +
                                        '</div></center>';
                                }
                                else {
                                    temp = '<center><div class="btn-group">' +
                                        '<button type="button" class="btn btn-success btn-sm" ng-click="btn_edit_as_details(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="View Details"><i class="fa fa-eye"></i></button>' +
                                        '<button type="button" ng-disabled="true" class="btn btn-danger btn-sm" ng-click="btn_del_row3(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Remove"><i class="fa fa-times"></i></button>' +
                                        '</div></center>';
                                }
                                return temp;
                            }
                        }
                    ],
                    "createdRow": function (row, data, index) {
                        $compile(row)($scope);  //add this to compile the DOM
                    },

                });
            $('#datalist_grid > thead').remove();
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }

    }

    s.ddl_as_type_change = function ()
    {
        
        // $("#txtb_am_in ").val('');
        // $("#txtb_am_out").val('');
        // $("#txtb_pm_in ").val('');
        // $("#txtb_pm_out").val('');

        ValidationResultColor3("ALL", false);
        if ($('#ddl_as_type option:selected').val() == "") {
            $("#lbl_am_entry").html("AM TIME ENTRY:");
            $("#lbl_pm_entry").html("PM TIME ENTRY:");
            s.dtl_enable = true;
            s.is_to = true;
        }
        else if ($('#ddl_as_type option:selected').val() == "01" || $('#ddl_as_type option:selected').val() == "09" || $('#ddl_as_type option:selected').val() == "10") {
            $("#lbl_am_entry").html("AM TIME ENTRY:");
            $("#lbl_pm_entry").html("PM TIME ENTRY:");
            s.dtl_enable = true;
            s.is_to = true;
        }
       
        else if (   $('#ddl_as_type option:selected').val() == "02" ||
                    $('#ddl_as_type option:selected').val() == "08" ||
                    $('#ddl_as_type option:selected').val() == "05" ||
                    $('#ddl_as_type option:selected').val() == "06" ||
                    $('#ddl_as_type option:selected').val() == "07" 
            ) {
            $("#lbl_am_entry").html("AM TIME ENTRY:");
            $("#lbl_pm_entry").html("PM TIME ENTRY:");
            s.dtl_enable = false;
            s.is_to = false;
        }
        else if ($('#ddl_as_type option:selected').val() == "11") {
            s.dtl_enable = true;
            s.is_to = true;
            $("#txtb_as_comment").removeAttr("disabled")
        }
        else {

            $("#lbl_am_entry").html("AS TIME FROM:");
            $("#lbl_pm_entry").html("AS TIME TO:");
            s.dtl_enable = false;
            s.is_to = true;
        }
    }

    //function ddl_as_type_change()
    //{
    //    ValidationResultColor3("ALL", false);
    //    if ($('#ddl_as_type option:selected').val() == "") {
    //        $("#lbl_am_entry").html("AM TIME ENTRY:");
    //        $("#lbl_pm_entry").html("PM TIME ENTRY:");
    //        s.dtl_enable = true;
    //        s.is_to = true;
    //    }
    //    else if ($('#ddl_as_type option:selected').val() == "01") {
    //        $("#lbl_am_entry").html("AM TIME ENTRY:");
    //        $("#lbl_pm_entry").html("PM TIME ENTRY:");
    //        s.dtl_enable = true;
    //        s.is_to = true;
    //    }
    //    else if ($('#ddl_as_type option:selected').val() == "02") {
    //        $("#lbl_am_entry").html("AM TIME ENTRY:");
    //        $("#lbl_pm_entry").html("PM TIME ENTRY:");
    //        s.dtl_enable = false;
    //        s.is_to = false;
    //    }
    //    else {
    //        alert("gg");
    //        $("#lbl_am_entry").html("AS TIME FROM:");
    //        $("#lbl_pm_entry").html("AS TIME TO:");
    //        s.dtl_enable = false;
    //        s.is_to = true;
    //    }
    //}

    //************************************//
    // Assign Color to Event Dates Base on the Status
    //************************************// 
    function color_dates(status) {
        try {
            var bg_color = "";
            if ( status == "F") {
                bg_color = '#1C84C6';
            }

            else if (status == "1" || status == "2") {
                bg_color = '#00C5DA';
            }
            else if (status == "D" || status == "L") {
                bg_color = '#D62728';
            }
            else if (status == "C") {
                bg_color = '#ED5565';
            }
            else if (status == "N") {
                bg_color = '#1AB394';
            }
            else if (status == "R") {
                bg_color = '#00C5DA';
            }
            else if (status == "S") {
                bg_color = '#F8AC59';
            }
            return bg_color;
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    //************************************//
    // Assigned Calendar Events to Dates
    //************************************// 
    function calendar_data() {
        try {
            var my_start = 0;
            var ok_renderevent = false;
            var event = new Object();
            if (s.arr_dates != null) {
                for (var x = 0; x < s.arr_dates.length; x++) {
                    event = new Object();
                    event.id = s.arr_dates[x].application_nbr; // unique event id;
                    event.title = s.arr_dates[x].astype_descr;
                    event.description = s.arr_dates[x].rcrd_status_descr;
                    event.backgroundColor = color_dates(s.arr_dates[x].rcrd_status);
                    event.borderColor = 'transparent';
                    event.extendedProps = x;
                    event.empl_id = s.arr_dates[x].empl_id;
                    event.creator_id = s.arr_dates[x].creator_id;
                    event.start = s.arr_dates[x].as_dtr_date;

                    $('#calendar').fullCalendar('renderEvent', event, true);
                }
            }
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    //************************************//
    // Assigned Calendar Holidays Event to Dates
    //************************************// 
    function calendar_plot_holiday_data() {
        try {
            //if (s.holidays_list != null)
            //{
            //    for (var x = 0; x < s.holidays_list.length; x++)
            //    {
            //        var event = new Object();
            //        event.id                = 'HHH'+x; // unique event id;
            //        event.title             = s.holidays_list[x].holiday_name;
            //        event.start             = s.holidays_list[x].holiday_date;
            //        event.description       = s.holidays_list[x].holiday_type_descr;
            //        event.borderColor       = 'transparent';
            //        event.extendedProps = 'holiday';
            //        $('#calendar').fullCalendar('renderEvent', event, true);
            //    }
            //}
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    //*************************************//
    //  Initialize Calendar
    //*************************************// 
    // Approved         = Blue
    // Cancel Pending   = Blur Red 
    // Disapproved      = Red
    // Cancelled        = Blur Red
    // New              = Green
    // Reviewed         = Sky Blue
    // Submitted        = Yellow
    function initialize_calendar() {
        try {

            var date = new Date();
            var d = date.getDate();
            var m = date.getMonth();
            var y = date.getFullYear();
            $("#ddl_name").select2().on('change', function (e) {
                FilterPageGrid2();
            })
            $('#calendar').fullCalendar({
                aspectRatio: 1.5,
                //themeSystem: themeSystem,
                customButtons: {
                    btn_add_btn: {
                        text: 'Add2',
                        click: function () {
                            s.tot_nbr_days = 0;
                            s.btn_open_modal();
                        }
                    },

                },
                header: {
                    left: 'prev,next today ',
                    center: 'title',
                    right: 'btn_add_btn'
                },
                selectable: true,
                editable: false,
                eventClick: function (calEvent, el, jsEvent, view) {
                    if (el.originalEvent.target.className == "fa fa-times text-right pull-right" && calEvent.extendedProps != "holiday") {
                        btn_del_row1(calEvent.extendedProps, 'DTL')
                    }
                    else if (el.originalEvent.target.className == "fc-title" && calEvent.extendedProps != "holiday") {
                        edit_action(calEvent.extendedProps, 'dtl')
                    }
                },
                viewRender: function (view, element) {

                    var now = new Date(new Date().getFullYear() - 1, 0, 1);
                    var end = new Date(new Date().getFullYear() + 1, 11, 31);

                    var calDateString = view.intervalStart.month() + '/' + view.intervalStart.year();

                    var curDateString = now.getMonth() + '/' + now.getFullYear();
                    var endDateString = end.getMonth() + '/' + end.getFullYear();

                    if (calDateString === curDateString) {
                        jQuery('.fc-prev-button').addClass("fc-state-disabled");
                    } else {
                        jQuery('.fc-prev-button').removeClass("fc-state-disabled");
                    }

                    if (endDateString === calDateString) {
                        jQuery('.fc-next-button').addClass("fc-state-disabled");
                    } else {
                        jQuery('.fc-next-button').removeClass("fc-state-disabled");
                    }
                    //element.find('.fc-today-button').addClass('xx');
                    jQuery('.fc-today-button').addClass("xxbtn_today_text");
                    $('.fc-prev-button').click(function () {
                        $('.popover').popover('hide');
                        FilterPageGrid2();
                    });
                    $('.fc-next-button').click(function () {
                        $('.popover').popover('hide')
                        FilterPageGrid2();
                    });
                },
                select: function (start, end, jsEvent, event) {
                    var e_date = new Date(moment(end).format('YYYY-MM-DD'));
                    var s_date = new Date(moment(start).format('YYYY-MM-DD'));
                    var date_diff = new Date(e_date - s_date);
                    s.tot_nbr_days = date_diff / 1000 / 60 / 60 / 24;

                    s.start_date = moment(start).format('YYYY-MM-DD');
                    s.end_date = moment(end).subtract(1, "days").format('YYYY-MM-DD');

                    popoverElement = $(jsEvent.target);
                    if (!$('.popover').hasClass("in")) {
                        $(jsEvent.target).popover({
                            html: true,
                            animation: 'true',
                            placement: 'top',
                            container: 'body',
                            title: '',
                            trigger: 'click',
                            content: function () {
                                $('.popover').popover('hide')
                                return '<div onClick="$(\'#btn_add_as_multidate\').click();"><h5 style="cursor:pointer;">Apply AS</h5></div>';
                            },
                        }).popover('show');
                        $(".fc-highlight").css("background", "red");
                    }
                    else {
                        $('.popover').popover('hide')
                        $(".fc-highlight").css("background", "transparent");
                    }

                },
                eventRender: function (event, element, view) {
                    if (event.description == "New" /*|| event.description == "Cancel Pending"*/) {
                        var show_delete = "";

                        // If the creator is also the owner of the application
                        if (event.empl_id == event.creator_id.replace('U', '')
                            && event.creator_id == s.userid) {
                            show_delete = "block";
                        }
                        // If he is the creator but not the owner
                        else if (event.creator_id == s.userid) {
                            show_delete = "block";
                        }
                        //If the current user owns the application but not the creator
                        else {
                            show_delete = "none";
                        }

                        element.find('.fc-title').html('<div class="data_calendar ibox-tools" style="text-align:center;">' +
                            '<i class="fa fa-times text-right pull-right" style="display:' + show_delete + ';margin:0px !important;" data-toggle="tooltip" data-placement="top" title="Delete"></i>'
                            + '<span class="fc-title">' + event.title + '</span>' + '</div>');
                    }
                    else if (event.extendedProps == "holiday") {
                    }

                    //element.find('.fc-title').append('<div class="hr-line-solid-no-margin"></div><span style="font-size: 12px"><b>' + event.description + '</b></span></div>');

                },
                dayRender: function (date, cell) {
                    for (var x = 0; x < s.holidays_list.length; x++) {
                        if (date.format("YYYY-MM-DD") == s.holidays_list[x].holiday_date) {
                            cell.prepend("<div class='holiday' data-toggle='tooltip' data-placement='top' title='" + s.holidays_list[x].holiday_name + "'><i class='fa fa-star text-warning'></i><small style='color:white;'>" + s.holidays_list[x].holiday_name + "</small></div>");
                        }
                    }

                },
                isLoading: function (event_load) {
                    if (event_load == false) {
                        console.log('gg');
                    }
                }


            });

            //MODEFIED CALENDAR HEADER
            $('.fc-btn_add_btn-button').html("<i class='fa fa-plus-circle'></i> Apply");
            $('.fc-btn_add_btn-button').addClass("btn btn-success");
            $('.fc-btn_add_btn-button').prop("id", "add");

            $('.fc-center').append('<div style="width:0%; float:left;padding-left:-5px;position:relative;" class="input-group date" id="datepickerX" data-provide="datepicker">' +
                '<input type="text" style="width:100px;display:none;" oninput="alert(1)" id="txtb_year_selected" ng-model="txtb_year_selected" />' +
                '<div class="input-group-addon" style="border:none;padding-left:0px;padding-top:7px;">' +
                '<span class="fa fa-calendar" id="mini-calendar-icn"></span>' +
                '</div></div>');

            $('.fc-center > h2').on("click", function () {
                $("span#mini-calendar-icn").click();
            });

            var cur_year = new Date().getFullYear();
            var cur_month = new Date().getMonth();
            $("#txtb_year_selected").val(cur_year + '-' + cur_month);

            $("#datepickerX").datepicker({
                format: "yyyy-mm",
                startView: "years",
                minViewMode: "months"
            });
            $('button.fc-today-button').click(function () {
                FilterPageGrid2();
            });
            $('#datepickerX').datepicker().on('changeDate', function (ev) {
                if ($('#txtb_year_selected').val().trim() != "") {
                    $('#calendar').fullCalendar('gotoDate', $('#txtb_year_selected').val() + '-01');
                    FilterPageGrid2();
                }
            });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    //**********************************************
    //  Add Two Leading Zero
    //**********************************************
    function str_pad(n) {
        return String("00" + n).slice(-2);
    }

    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.FilterPageGrid = function () {
        FilterPageGrid2();
    }

    //*********************************************//
    //*** Refresh Data
    //********************************************// 
    function FilterPageGrid2() {
        try {
            var date = $("#calendar").fullCalendar('getDate');
            var year_int = date.format("YYYY");
            var month_int = date.format("MM");

            h.post("../cSSAuthorizationSlipAppl/FilterPageGrid",
                {
                    p_empl_id: $('#ddl_name option:selected').val()
                    , p_appr_status: $('#ddl_status option:selected').val()
                    , p_year: year_int
                    , p_month: str_pad(month_int)
                }).then(function (d) {
                    if (d.data.message == "success") {
                        // Reinitialize Events
                        $('#calendar').fullCalendar('removeEvents', function (e) {
                            return true;
                        });

                        s.oTable.fnClearTable();
                        s.datalistgrid = d.data.filteredGrid;

                        if (d.data.filteredGrid.length > 0) {
                            s.oTable.fnAddData(d.data.filteredGrid);
                        }

                        if (d.data.calendar_data.length > 0) {
                            s.arr_dates = d.data.calendar_data;
                            s.datalistgrid2 = d.data.calendar_data;
                        }
                        else {
                            s.arr_dates = [];
                        }

                        calendar_data();
                        calendar_plot_holiday_data();
                    }
                })
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    s.btn_open_info = function () {
        try {
            btn = document.getElementById('info');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Status Info.';
            s.ModalTitle = "Status Color Legend";

            setTimeout(function () {
                btn.innerHTML = '<i class="fa fa-info-circle"> </i> Status Info.';
                $('#info_modal').modal({ backdrop: 'static', keyboard: false });
            }, 300);
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    //************************************//
    //***       Open Add Modal        ****//
    //************************************//
    function open_modal() {
        try {
            s.resubmit = "FALSE"
            s.save_mode = "ADD";
            s.oTable2.fnClearTable();
            s.dtl_enable = true;
            s.is_to = true;
            $('.popover').popover('hide');
            clearentry();
            clearentry_dtl();
            ValidationResultColor3("ALL", false);
            var date = new Date();
            s.txtb_date_applied = moment(new Date()).format("YYYY-MM-DD")
            h.post("../cSSAuthorizationSlipAppl/GenerateNewApplNbr",
                {
                }).then(function (d) {
                    if (d.data.message == "success")
                    {
                        if (s.empl_names.length > 0) {
                            s.txtb_empl_id = $('#ddl_name option:selected').val();
                            s.txtb_empl_name = $('#ddl_name option:selected').html();
                        }
                        else {
                            s.txtb_empl_id = s.log_user_id;
                            s.txtb_empl_name = s.log_user_name;
                        }

                        s.txtb_appl_nbr = d.data.new_appl_nbr[0];
                        s.txtb_date_applied = moment(new Date()).format("YYYY-MM-DD");//new Date().getFullYear().toString() + "-" + str_pad((new Date().getMonth() + 1)) + "-" + str_pad(new Date().getDay());
                        s.txtb_year = $('#ddl_year').val();
                        s.txtb_approval_status = "New";
                        //s.txtb_empl_name = $('#ddl_name option:selected').html();
                        //s.txtb_empl_id = $('#ddl_name option:selected').val();

                        s.showRecall = false;
                        s.isEdit = false;
                        s.ModalTitle = "Add New Record";
                        s.dis_plan_date = false;
                        s.show_cancel = false;
                        btn = document.getElementById('add');
                        btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Apply';

                        var s_date = s.start_date;
                        for (var x = 0; x < s.tot_nbr_days; x++) {
                            var data =
                            {
                                application_nbr: d.data.new_appl_nbr[0]
                                , as_dtr_date: s_date
                                , astype_code: ""
                                , astype_descr: ""
                                , as_am_in: ""
                                , as_am_out: ""
                                , as_pm_in: ""
                                , as_pm_out: ""
                                , reason_code: ""
                                , as_under_time: ""
                                , as_comment: ""
                                , as_venue: ""
                                , rcrd_status: "N"
                                , rcrd_status_descr: "New"
                                , creator_id: s.userid
                            }
                            s_date = moment(s_date).add(1, "days").format('YYYY-MM-DD')
                            s.datalistgrid2.push(data)

                        }
                        s.oTable2.fnClearTable();
                        if (s.datalistgrid2.length > 0) {
                            s.oTable2.fnAddData(s.datalistgrid2);
                        }

                        setTimeout(function () {
                            btn.innerHTML = '<i class="fa fa-plus-circle"> </i> Apply';
                            $('#main_modal').modal({ backdrop: 'static', keyboard: false });
                        }, 300);
                    }
                    else {
                        swal(d.data.message, { icon: "warning", });
                    }
                })
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }
    //************************************//
    //***       Open Add Modal        ****//
    //************************************//
    s.btn_open_modal = function () {
        try {
            $("#lbl_am_entry").html("AM TIME ENTRY:");
            $("#lbl_pm_entry").html("PM TIME ENTRY:");
            s.temp_approval_status = "N";
            s.datalistgrid2 = [];
            s.oTable2.fnClearTable();
            s.oTable2.fnAddData(s.datalistgrid2);
            s.show_calendar_icon = true;

            if (s.log_in_as_AO == true) {
                if (ValidateFields2()) {
                    if (s.ddl_name == s.userid) {
                        s.show_creator = false;
                    }
                    open_modal();
                }
            }
            else {
                s.show_creator = false;
                open_modal();
            }
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    //************************************//
    //***       Open Add Modal        ****//
    //************************************//
    s.btn_add_as_multidate_click = function () {
        try {
            s.temp_approval_status = "N";
            btn = document.getElementById('submit');
            btn.innerHTML = '<i class="fa fa-paper-plane-o"></i> Submit';

            s.dis_plan_date = false;
            s.dis_submit = false;
            s.dis_edit = false;
            s.show_calendar_icon = true;
            s.dtl_enable = true;
            s.is_to = true;
            s.show_creator = false;
            $("#lbl_am_entry").html("AM TIME ENTRY:");
            $("#lbl_pm_entry").html("PM TIME ENTRY:");
            if (s.log_in_as_AO == true) {
                if (ValidateFields2()) {
                    s.oTable2.fnClearTable();
                    s.datalistgrid2 = [];
                    s.oTable2.fnAddData([]);
                    open_modal();
                }
            }
            else {
                s.oTable2.fnClearTable();
                s.datalistgrid2 = [];
                s.oTable2.fnAddData([]);
                open_modal();
            }
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    //************************************//
    //***  Add Dates to datalistgrid2
    //************************************//
    s.btn_add_date = function () {
        try {
            s.oTable2.fnClearTable();

            var row_id = $('#add2').attr("ngx-data-row");
            var row_id_hdr = $('#addFinal').prop("ngx-rowId");
            var isUpdate = $('#add2').attr("ngx-data-update");

            if (ValidateFields3()) {
                s.already_exist = false;
                var status = "";
                var status_descr = "";
                //Check if the date added is for update in row details
                if (isUpdate == "U") {
                    //check if the mode is ADD, so it means it is NEW
                    if (s.save_mode == "ADD") {
                        status = "N";
                        status_descr = "New";
                    }
                    else {
                        status = s.datalistgrid2[row_id].rcrd_status;
                        status_descr = s.datalistgrid2[row_id].rcrd_status_descr;
                    }
                }
                else {
                    //Adding date during UPDATE TO THE HEADER

                    if (s.save_mode == "ADD") {
                        status = "N";
                        status_descr = "New";
                    }
                    else {
                        status = s.datalistgrid[row_id_hdr].approval_status;
                        status_descr = s.datalistgrid[row_id_hdr].approval_status_descr;
                    }
                }

                var data =
                {
                    application_nbr     : $('#txtb_appl_nbr').val().trim()
                    , as_dtr_date       : $('#txtb_dtr_date').val().trim()
                    , astype_code       : $('#ddl_as_type').val().trim()
                    , astype_descr      : $('#ddl_as_type option:selected').html()
                    , as_am_in          : $('#txtb_am_in').val().trim()
                    , as_am_out         : $('#txtb_am_out').val().trim()
                    , as_pm_in          : $('#txtb_pm_in').val().trim()
                    , as_pm_out         : $('#txtb_pm_out').val().trim()
                    , reason_code       : $('#ddl_reason').val().trim()
                    , as_under_time     : ""
                    , as_comment        : $('#txtb_as_comment').val().trim()
                    , as_venue          : $('#txtb_as_venue').val().trim()
                    , rcrd_status       : status
                    , rcrd_status_descr : status_descr
                    , creator_id        : s.userid
                }

                for (var x = 1; x <= $('#datalist_grid2').DataTable().page.info().pages; x++) {
                    if (get_page($('#txtb_dtr_date').val()) == false) {
                        s.oTable2.fnPageChange(x);
                    }
                    else {
                        s.already_exist = true;
                        break;
                    }
                }

                if (isUpdate == "U") {
                    s.datalistgrid2[row_id]["application_nbr"]      = $('#txtb_appl_nbr').val().trim();
                    s.datalistgrid2[row_id]["as_dtr_date"]          = data.as_dtr_date;
                    s.datalistgrid2[row_id]["astype_code"]          = data.astype_code;
                    s.datalistgrid2[row_id]["astype_descr"]         = data.astype_descr;
                    s.datalistgrid2[row_id]["as_am_in"]             = data.as_am_in;
                    s.datalistgrid2[row_id]["as_am_out"]            = data.as_am_out;
                    s.datalistgrid2[row_id]["as_pm_in"]             = data.as_pm_in;
                    s.datalistgrid2[row_id]["as_pm_out"]            = data.as_pm_out;
                    s.datalistgrid2[row_id]["reason_code"]          = data.reason_code;
                    s.datalistgrid2[row_id]["as_under_time"]        = data.as_under_time;
                    s.datalistgrid2[row_id]["as_comment"]           = data.as_comment;
                    s.datalistgrid2[row_id]["as_venue"]             = data.as_venue;
                    s.datalistgrid2[row_id]["rcrd_status"]          = data.rcrd_status;
                    s.datalistgrid2[row_id]["rcrd_status_descr"]    = data.rcrd_status_descr;
                }
                else {
                    if (s.already_exist == false) {
                        s.datalistgrid2.push(data)
                    }
                    else {
                        swal({ icon: "error", title: "Date already exist with the same AS type" });
                    }
                }
                s.oTable2.fnClearTable();
                s.oTable2.fnAddData(s.datalistgrid2);

                for (var x = 1; x <= $('#datalist_grid2').DataTable().page.info().pages; x++) {
                    if (get_page($('#txtb_dtr_date').val()) == false) {
                        s.oTable2.fnPageChange(x);
                    }
                    else {
                        break;
                    }
                }
                clearentry_dtl();

                s.dis_plan_date = false;
                s.dis_as_type = false;
                s.dtl_enable = true;
                s.is_to = true;
            }
            else {
                if (s.datalistgrid2 != null && s.datalistgrid2.length > 0) {
                    s.oTable2.fnAddData(s.datalistgrid2);
                }
            }
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    //************************************// 
    //*** Save New Record  -  Save as NEW
    //************************************// 
    s.btn_save_click = function () {
        try {

            if (s.datalistgrid2.length > 0 && valid_dtl_data()) {
                if (s.save_mode == "ADD") {
                    h.post("../cSSAuthorizationSlipAppl/GenerateNewApplNbr", {
                    }).then(function (d) {
                        if (d.data.message == "success") {
                            var data2 = [];
                            var data =
                            {
                                application_nbr: d.data.new_appl_nbr[0]
                                , date_applied: s.txtb_date_applied//moment(new Date()).format("YYYY-MM-DD")
                                , empl_id: s.txtb_empl_id
                                , detail_remarks: ""
                                , approval_status: "N"
                                , posting_status: 0
                                , approval_id: ""
                                , created_dttm: moment(new Date())
                                , created_by_user: ""
                                , updated_dttm: ""
                                , updated_by_user: ""
                            }

                            for (var x = 0; x < s.datalistgrid2.length; x++) {
                                data2.push(
                                    {
                                        application_nbr : d.data.new_appl_nbr[0]
                                        , as_dtr_date   : s.datalistgrid2[x]['as_dtr_date']
                                        , astype_code   : s.datalistgrid2[x]['astype_code']
                                        , as_am_in      : get_24hr_format(s.datalistgrid2[x]['as_am_in'])
                                        , as_am_out     : get_24hr_format(s.datalistgrid2[x]['as_am_out'])
                                        , as_pm_in      : get_24hr_format(s.datalistgrid2[x]['as_pm_in'])
                                        , as_pm_out     : get_24hr_format(s.datalistgrid2[x]['as_pm_out'])
                                        , reason_code   : s.datalistgrid2[x]['reason_code']
                                        , as_under_time : s.datalistgrid2[x]['as_under_time']
                                        , as_comment    : s.datalistgrid2[x]['as_comment']
                                        , as_venue      : s.datalistgrid2[x]['as_venue']
                                        , rcrd_status   : s.datalistgrid2[x]['rcrd_status']
                                    });
                            }

                            h.post("../cSSAuthorizationSlipAppl/CheckExist",
                                {
                                    data2: data2,
                                    empl_id: data.empl_id,
                                    checking_mode: s.save_mode
                                }).then(function (d) {
                                    if (d.data.message == "" || d.data.message == null) {
                                        btn = document.getElementById('addFinal');
                                        btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Save';

                                        h.post("../cSSAuthorizationSlipAppl/Save",
                                            {
                                                data: data,
                                                data2: data2,
                                                save_mode: s.save_mode
                                            }).then(function (d) {
                                                if (d.data.message == "success") {
                                                    $('#main_modal').modal("hide");
                                                    swal("Your record has been Successfully Saved!", { icon: "success", });
                                                    FilterPageGrid2();
                                                }
                                                else {
                                                    swal(d.data.message, { icon: "warning", });
                                                }
                                                btn.innerHTML = '<i class="fa fa-save"> </i> Save';
                                            });
                                    }
                                    else {
                                        swal(d.data.message, { icon: "warning", title: "Already set a schedule for this date!" });
                                    }
                                });
                        }
                        else {
                            swal(d.data.message, { icon: "warning", });
                        }
                    });

                }
                else if (s.save_mode == "EDIT") {
                    var row_id = $("#edit").prop('ngx-rowId');

                    var data2 = [];
                    var data =
                    {
                        application_nbr: s.datalistgrid[row_id].application_nbr
                        , date_applied: s.datalistgrid[row_id].date_applied
                        , empl_id: s.datalistgrid[row_id].empl_id
                        , detail_remarks: s.datalistgrid[row_id].detail_remarks
                        , approval_status: s.datalistgrid[row_id].approval_status
                        , posting_status: s.datalistgrid[row_id].posting_status
                        , approval_id: s.datalistgrid[row_id].approval_id
                        , created_dttm: s.datalistgrid[row_id].created_dttm
                        , created_by_user: s.datalistgrid[row_id].created_by_user
                        , updated_dttm: moment(new Date())
                        , updated_by_user: ""
                    }
                    for (var x = 0; x < s.datalistgrid2.length; x++) {
                        data2.push({
                            application_nbr : s.datalistgrid2[x]['application_nbr']
                            , as_dtr_date   : s.datalistgrid2[x]['as_dtr_date']
                            , astype_code   : s.datalistgrid2[x]['astype_code']
                            , as_am_in      : get_24hr_format(s.datalistgrid2[x]['as_am_in'])
                            , as_am_out     : get_24hr_format(s.datalistgrid2[x]['as_am_out'])
                            , as_pm_in      : get_24hr_format(s.datalistgrid2[x]['as_pm_in'])
                            , as_pm_out     : get_24hr_format(s.datalistgrid2[x]['as_pm_out'])
                            , reason_code   : s.datalistgrid2[x]['reason_code']
                            , as_under_time : s.datalistgrid2[x]['as_under_time']
                            , as_comment    : s.datalistgrid2[x]['as_comment']
                            , as_venue      : s.datalistgrid2[x]['as_venue']
                            , rcrd_status   : s.datalistgrid2[x]['rcrd_status']
                        });
                    }

                    h.post("../cSSAuthorizationSlipAppl/CheckExist",
                        {
                            data2: data2,
                            empl_id: data.empl_id,
                            checking_mode: s.save_mode
                        }).then(function (d) {
                            if (d.data.message.trim() == "") {
                                btn = document.getElementById('edit');
                                btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Save Edit';
                                h.post("../cSSAuthorizationSlipAppl/Save",
                                    {
                                        data: data,
                                        data2: data2,
                                        save_mode: s.save_mode
                                    }).then(function (d) {
                                        if (d.data.message == "success") {

                                            $('#main_modal').modal("hide");
                                            swal("Your record Successfully Updated!", { icon: "success", });
                                            FilterPageGrid2();
                                        }
                                        else {
                                            swal(d.data.message, { icon: "warning", });
                                        }
                                        btn.innerHTML = '<i class="fa fa-save"> </i> Save Edit';
                                    });
                            }
                            else {
                                swal(d.data.message, { icon: "warning", title: "Alredy set a schedule for this date!" });
                            }
                        });
                }
            }
            else {
                if (valid_dtl_data() == false) {
                    swal({ icon: "error", title: "Please check details data and complete the required fields!" });
                }
                else {
                    swal({ icon: "error", title: "Please provide atleast 1 date to be applied for AS details!" });
                }
            }
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    function get_24hr_format(time_val)
    {
        if (time_val.toString().trim() != "")
        {
            var return_val  = "";
            var time_del = "";
            if (time_val.length == 6)
            {
                time_val = "0" + time_val.toString();
            }

            var time_vax    = time_val;
                time_del    = time_vax.slice(-2);
            var time_hour   = time_val.substring(0, 2);
            var time_min    = time_val.substring(3, 5);
            
            if (time_del == "PM")
            {
                if (time_hour == 12)
                {
                    //if (parseInt(time_min) > 0)
                    //{
                    //    return_val = "00:" + time_min.toString();
                    //}
                    //else {
                    //    return_val = "23:59";
                    //}

                    return_val = time_val.substring(0, 5);
                }
                else
                {

                    return_val = (parseInt(time_hour) + 12).toString() + ":" + time_min.toString();
                }
            }
            else
            {
                if (time_hour == 12)
                {
                    if (parseInt(time_min) > 0) {
                        return_val = "00:" + time_min.toString();
                    }
                    else {
                        return_val = "23:59";
                    }
                }
                else return_val = time_val.substring(0,5);
            }
            return return_val;
        }
        else {
            return "";
        }
        
    }

    //Validate during saving that all the details should have a valid data
    function valid_dtl_data()
    {
        var dtl_data_ok = true;
        for (var x = 0; x < s.datalistgrid2.length; x++)
        {
            if (s.datalistgrid2[x].astype_code.trim() == "")
            {
                dtl_data_ok = false;
            }
            else if (s.datalistgrid2[x].astype_code.trim() != "01" && s.datalistgrid2[x].astype_code.trim() != "09" && s.datalistgrid2[x].astype_code.trim() != "10" && s.datalistgrid2[x].astype_code.trim() != "11"
                    && s.datalistgrid2[x].as_am_in.trim()== ""
                    && s.datalistgrid2[x].as_pm_in.trim() == ""
                    && s.datalistgrid2[x].as_am_out.trim()== ""
                    && s.datalistgrid2[x].as_pm_out.trim() == ""
                    && s.datalistgrid2[x].reason_code.trim() == "")
            {
                dtl_data_ok = false;
            }
        }
        return dtl_data_ok;
    }

    //************************************// 
    //*** Save New Record  -  Save as SUBMIT
    //**********************************// 
    s.btn_submit_click = function ()
    {
        try
        {
            if (s.datalistgrid2.length > 0 && valid_dtl_data()) {
                var row_id = $("#submit").prop('ngx-rowId');
                if (s.save_mode == "ADD") 
                {
                    h.post("../cSSAuthorizationSlipAppl/GenerateNewApplNbr").then(function (d)
                    { 
                        var data2 = [];
                        var data =
                        {
                            application_nbr     : d.data.new_appl_nbr[0]
                            , date_applied      : s.txtb_date_applied//moment(new Date()).format("YYYY-MM-DD")
                            , empl_id           : s.txtb_empl_id
                            , detail_remarks    : ""
                            , approval_status   : "S"
                            , posting_status    : 0
                            , approval_id       : ""
                            , created_dttm      : moment(new Date())
                            , created_by_user   : ""
                            , updated_dttm      : ""
                            , updated_by_user   : ""
                        }

                        for (var x = 0; x < s.datalistgrid2.length; x++) {
                            data2.push({
                                application_nbr : s.datalistgrid2[x]['application_nbr']
                                , as_dtr_date   : s.datalistgrid2[x]['as_dtr_date']
                                , astype_code   : s.datalistgrid2[x]['astype_code']
                                , as_am_in      : get_24hr_format(s.datalistgrid2[x]['as_am_in'])
                                , as_am_out     : get_24hr_format(s.datalistgrid2[x]['as_am_out'])
                                , as_pm_in      : get_24hr_format(s.datalistgrid2[x]['as_pm_in'])
                                , as_pm_out     : get_24hr_format(s.datalistgrid2[x]['as_pm_out'])
                                , reason_code   : s.datalistgrid2[x]['reason_code']
                                , as_under_time : s.datalistgrid2[x]['as_under_time']
                                , as_comment    : s.datalistgrid2[x]['as_comment']
                                , as_venue      : s.datalistgrid2[x]['as_venue']
                                , rcrd_status   : "S"
                            });
                        }
                        h.post("../cSSAuthorizationSlipAppl/CheckExist",
                        {
                            data2: data2,
                            empl_id: data.empl_id,
                            checking_mode: s.save_mode
                        }).then(function (d)
                        {
                            if (d.data.message.trim() == "")
                            {
                                btn = document.getElementById('submit');
                                btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Submit';
                                h.post("../cSSAuthorizationSlipAppl/SubmitAS",
                                    {
                                        data: data,
                                        data2: data2,
                                        submit_mode: s.save_mode
                                    }).then(function (d)
                                    {
                                        if (d.data.message == "success")
                                        {
                                            if (d.data.data.approval_status == "R")
                                            {
                                                $('#main_modal').modal("hide");
                                                swal("Your record Successfully Submitted and Reviewed!", { icon: "success", title:"Record Successfully Submitted!"});
                                                FilterPageGrid2();
                                            }
                                            else
                                            {

                                                $('#main_modal').modal("hide");
                                                swal("Your record Successfully Submitted!", { icon: "success", });
                                                FilterPageGrid2();
                                            }
                                        }
                                        else {
                                            swal(d.data.message, { icon: "warning", });
                                        }
                                        btn.innerHTML = '<i class="fa fa-paper-plane-o"> </i> Submit';
                                    });
                            }
                            else {
                                swal(d.data.message, { icon: "warning", title: "Alredy set a schedule for this date!" });
                            }
                        });
                    });
                }
                else if (s.save_mode == "EDIT")
                {
                    console.log(s.datalistgrid[row_id].application_nbr)
                    var data2 = [];
                    var data =
                    {
                        
                        application_nbr     : $('#txtb_appl_nbr').val().trim()
                        , date_applied      : $('#txtb_date_applied').val().trim()
                        , empl_id           : $("#txtb_empl_id").val()
                        , detail_remarks    : $("#txtb_remarks").val()
                        , approval_status   : "S"
                        , posting_status    : s.datalistgrid[row_id].posting_status
                        , approval_id       : s.datalistgrid[row_id].approval_id
                        , created_dttm      : s.datalistgrid[row_id].created_dttm
                        , created_by_user   : s.datalistgrid[row_id].created_by_user
                        , updated_dttm      : moment(new Date())
                        , updated_by_user   : ""
                    }
                    for (var x = 0; x < s.datalistgrid2.length; x++) {
                        data2.push({
                            application_nbr : s.datalistgrid2[x]['application_nbr']
                            , as_dtr_date   : s.datalistgrid2[x]['as_dtr_date']
                            , astype_code   : s.datalistgrid2[x]['astype_code']
                            , as_am_in      : get_24hr_format(s.datalistgrid2[x]['as_am_in'])
                            , as_am_out     : get_24hr_format(s.datalistgrid2[x]['as_am_out'])
                            , as_pm_in      : get_24hr_format(s.datalistgrid2[x]['as_pm_in'])
                            , as_pm_out     : get_24hr_format(s.datalistgrid2[x]['as_pm_out'])
                            , reason_code   : s.datalistgrid2[x]['reason_code']
                            , as_under_time : s.datalistgrid2[x]['as_under_time']
                            , as_comment    : s.datalistgrid2[x]['as_comment']
                            , as_venue      : s.datalistgrid2[x]['as_venue']
                            , rcrd_status: "S"
                        });
                    }

                    console.log(s.datalistgrid[row_id].application_nbr)
                    console.log(data2)
                    console.log(data)
                    //AWW
                    h.post("../cSSAuthorizationSlipAppl/CheckExist", {
                        data2: data2,
                        empl_id: data.empl_id,
                        checking_mode: s.save_mode
                    }).then(function (d) {
                        if (d.data.message.trim() == "")
                        {
                            btn = document.getElementById('submit');
                            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Submit';
                            h.post("../cSSAuthorizationSlipAppl/SubmitAS",
                                {
                                    data: data,
                                    data2: data2,
                                    submit_mode: s.save_mode
                                }).then(function (d) {
                                    if (d.data.message == "success") {

                                        $('#main_modal').modal("hide");
                                        swal("Your record Successfully Submitted!", { icon: "success", });
                                        FilterPageGrid2();
                                    }
                                    else {
                                        swal(d.data.message, { icon: "warning", });
                                    }
                                    btn.innerHTML = '<i class="fa fa-paper-plane-o"> </i> Submit';
                                });
                        }
                        else {
                            swal(d.data.message, { icon: "warning", title: "Alredy set a schedule for this date!" });
                        }
                    });
                }
            }
            else
            {
                if (valid_dtl_data() == false) {
                    swal({ icon: "error", title: "Please check details data and complete the required fields!" });
                }
                else {
                    swal({ icon: "error", title: "Please provide atleast 1 date to be applied for AS details!" });
                }
            }
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields()
    {
        var return_val = true;
        ValidationResultColor("ALL", false);

        if ($('#txtb_approval_status').val() == "")
        {
            ValidationResultColor("txtb_approval_status", true);
            return_val = false;
        }

        if ($('#txtb_year').val() == "") {
            ValidationResultColor("txtb_year", true);
            return_val = false;
        }

        if ($('#txtb_empl_name').val() == "") {
            ValidationResultColor("txtb_empl_name", true);
            return_val = false;
        }

        if ($('#txtb_empl_id').val() == "") {
            ValidationResultColor("txtb_empl_id", true);
            return_val = false;
        }

        if ($('#txtb_dtr_date').val() == "")
        {
            ValidationResultColor("txtb_dtr_date", true);
            return_val = false;
        }

        return return_val;
    }

    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidationResultColor(par_object_id, par_v_result)
    {
        if (par_v_result) {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field!");
        }
        else {
            //remove of refresh the object form being required

            $("#txtb_approval_status").removeClass("required");
            $("#lbl_txtb_approval_status_req").text("");

            $("#txtb_year").removeClass("required");
            $("#lbl_txtb_year_req").text("");

            $("#txtb_empl_name").removeClass("required");
            $("#lbl_txtb_empl_name_req").text("");

            $("#txtb_empl_id").removeClass("required");
            $("#lbl_txtb_empl_id_req").text("");

        }
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields2()
    {
        var return_val = true;
        ValidationResultColor2("ALL", false);

        if ($('#ddl_name').val().trim() == "")
        {
            ValidationResultColor2("select2-selection", true);
            return_val = false;
        }

        return return_val;
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidationResultColor2(par_object_id, par_v_result)
    {
        if (par_v_result)
        {
            //Add class to the obect that need to focus as a required..
            if (par_object_id == "select2-selection")
            {
                $("#lbl_ddl_name_req").text("Required Field");
                $("span.select2-selection").attr("style", "border:1px solid red !important");
            }
            else
            {
                $("#" + par_object_id).addClass("required");
                $("#" + par_object_id).addClass("required");
                $("#lbl_" + par_object_id + "_req").text("Required Field");
            }
            
        }
        else
        {
            //remove of refresh the object form being required
            $("span.select2-selection").attr('style',"");
            $(".select2-selection").addClass("required");
            $("#ddl_name").removeClass("required");
            $("#lbl_ddl_name_req").text("");
        }
    }

    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function alreadyExist()
    {
        var exist = false;
        var isUpdate = $('#add2').attr("ngx-data-update");
        if (s.datalistgrid2.length > 0 && isUpdate != "U")
        {
            for (var x = 0; x < s.datalistgrid2.length;x++)
            {
                if (s.datalistgrid2[x].as_dtr_date == $('#txtb_dtr_date').val().trim() && s.datalistgrid2[x].astype_code == s.ddl_as_type)
                {
                    exist = true;
                    break;
                }
            }
        }

        return exist;
    }

    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields3()
    {
        var return_val = true;
        ValidationResultColor3("ALL", false);
        
        if ($('#txtb_dtr_date').val().trim() == "") {
            ValidationResultColor3("txtb_dtr_date", true);
            return_val = false;
        }
        else if (moment($('#txtb_dtr_date').val().trim(), 'YYYY-MM-DD', true).isValid() == false) {
            ValidationResultColor3("txtb_dtr_date", true);
            $("#lbl_txtb_dtr_date_req").text("Invalid Date!");
            return_val = false;
        }
        else if (alreadyExist())
        {
            ValidationResultColor3("txtb_dtr_date", true);
            ValidationResultColor3("ddl_as_type", true);
            $("#lbl_txtb_dtr_date_req").text("Already Exist!");
            $("#lbl_ddl_as_type_req").text("Already Exist!");
            return_val = false;
        }

        if ($('#ddl_as_type').val().trim() == "")
        {
            ValidationResultColor3("ddl_as_type", true);
            return_val = false;
        }

        if ((   $('#ddl_as_type').val().trim() == "02" ||
                $('#ddl_as_type').val().trim() == "08" ||
                $('#ddl_as_type').val().trim() == "05" ||
                $('#ddl_as_type').val().trim() == "06" ||
                $('#ddl_as_type').val().trim() == "07" 

            )
            && $('#ddl_as_type').val().trim()   != ""
            && $('#txtb_am_in').val().trim()    == ""
            && $('#txtb_am_out').val().trim()   == ""
            && $('#txtb_pm_in').val().trim()    == ""
            && $('#txtb_pm_out').val().trim()   == "")
        {
            ValidationResultColor3("txtb_am_in", true);
            ValidationResultColor3("txtb_am_out", true);
            ValidationResultColor3("txtb_pm_in", true);
            ValidationResultColor3("txtb_pm_out", true);
            return_val = false;
        }
        if ((   $('#ddl_as_type').val().trim() == "02" || 
                $('#ddl_as_type').val().trim() == "08" 
                //$('#ddl_as_type').val().trim() == "05" ||
                //$('#ddl_as_type').val().trim() == "06" ||
                //$('#ddl_as_type').val().trim() == "07" 
            )
            && $('#ddl_as_type').val().trim()   != ""
            && $('#txtb_am_in').val().trim() != ""
            && validateHhMm($('#txtb_am_in').val().replace(' ','')) == false
        )
        {
            ValidationResultColor3("txtb_am_in", true);
            $("#lbl_txtb_am_in_req").html("Invalid value!");
            return_val = false;
        }

        if ((   $('#ddl_as_type').val().trim() == "02" || 
                $('#ddl_as_type').val().trim() == "08" ||
                $('#ddl_as_type').val().trim() == "05" ||
                $('#ddl_as_type').val().trim() == "06" ||
                $('#ddl_as_type').val().trim() == "07" 
            )
            && $('#ddl_as_type').val().trim() != ""
            && $('#txtb_am_out').val().trim() != ""
            && validateHhMm($('#txtb_am_out').val().replace(' ', '')) == false)
        {
            ValidationResultColor3("txtb_am_out", true);
            $("#lbl_txtb_am_in_req").text().trim() == "" ? $("#lbl_txtb_am_in_req").html("&nbsp;") : $("#lbl_txtb_am_in_req").text();
            $("#lbl_txtb_am_out_req").html("Invalid value!");
            return_val = false;
        }

        if ((   $('#ddl_as_type').val().trim() == "02" || 
                $('#ddl_as_type').val().trim() == "08" ||
                $('#ddl_as_type').val().trim() == "05" ||
                $('#ddl_as_type').val().trim() == "06" ||
                $('#ddl_as_type').val().trim() == "07" 

            )
            && $('#ddl_as_type').val().trim() != ""
            && $('#txtb_pm_in').val().trim() != ""
            && validateHhMm($('#txtb_pm_in').val().replace(' ', '')) == false)
        {
            ValidationResultColor3("txtb_pm_in", true);
            $("#lbl_txtb_pm_in_req").html("Invalid value!");
            return_val = false;
        }
        if ((   $('#ddl_as_type').val().trim() == "02" || 
                $('#ddl_as_type').val().trim() == "08" ||
                $('#ddl_as_type').val().trim() == "05" ||
                $('#ddl_as_type').val().trim() == "06" ||
                $('#ddl_as_type').val().trim() == "07" 
            )
            && $('#ddl_as_type').val().trim() != ""
            && $('#txtb_pm_out').val().trim() != ""
            && validateHhMm($('#txtb_pm_out').val().replace(' ', '')) == false)
        {
            ValidationResultColor3("txtb_pm_out", true);
            $("#lbl_txtb_pm_in_req").text() == "" ? $("#lbl_txtb_pm_in_req").html("&nbsp;") : $("#lbl_txtb_pm_in_req").text();
            $("#lbl_txtb_pm_out_req").html("Invalid value!");
            return_val = false;
        }

        if ($('#ddl_as_type').val().trim() != "02"
            && $('#ddl_as_type').val().trim() != "01"
            //&& $('#ddl_as_type').val().trim() != "03"
            && $('#ddl_as_type').val().trim() != "09"
            && $('#ddl_as_type').val().trim() != "08"
            && $('#ddl_as_type').val().trim() != "05" 
            && $('#ddl_as_type').val().trim() != "06" 
            && $('#ddl_as_type').val().trim() != "07" 
            && $('#ddl_as_type').val().trim() != ""
            && $('#txtb_am_in').val().trim() == ""
            && $('#txtb_pm_out').val().trim() == ""
            && $('#ddl_as_type').val().trim() != "10"
            && $('#ddl_as_type').val().trim() != "11")
        {
            $("#lbl_txtb_pm_in_req").html("&nbsp;");
            ValidationResultColor3("txtb_am_in", true);
            ValidationResultColor3("txtb_pm_out", true);
            return_val = false;
        }

        if ($('#ddl_as_type').val().trim() != "02"
            && $('#ddl_as_type').val().trim() != "01"
            //&& $('#ddl_as_type').val().trim() != "03"
            && $('#ddl_as_type').val().trim() != "09"
            && $('#ddl_as_type').val().trim() != "08"
            && $('#ddl_as_type').val().trim() != "05"
            && $('#ddl_as_type').val().trim() != "06"
            && $('#ddl_as_type').val().trim() != "07" 
            && $('#ddl_as_type').val().trim() != ""
            && $('#txtb_am_in').val().trim() == ""
            && $('#ddl_as_type').val().trim() != "10"
            && $('#ddl_as_type').val().trim() != "11"
        )
        {
            ValidationResultColor3("txtb_am_in", true);
            return_val = false;
        }
        else if (   $('#ddl_as_type').val().trim() != "02"
                    && $('#ddl_as_type').val().trim() != "01"
                    && $('#ddl_as_type').val().trim() != "09"
                    && $('#ddl_as_type').val().trim() != "08"
                    && $('#ddl_as_type').val().trim() != "05"
                    && $('#ddl_as_type').val().trim() != "06"
                    && $('#ddl_as_type').val().trim() != "07" 
                    && $('#ddl_as_type').val().trim() != ""
                    && $('#txtb_am_in').val().trim() != ""
                    && $('#ddl_as_type').val().trim() != "10"
                    && $('#ddl_as_type').val().trim() != "11"
            && validateHhMm($('#txtb_am_in').val().replace(' ', '')) == false
        ) {
            ValidationResultColor3("txtb_am_in", true);
            $("#lbl_txtb_am_in_req").html("Invalid value!");
            return_val = false;
        }
        if ($('#ddl_as_type').val().trim() != "02"
            && $('#ddl_as_type').val().trim() != "01"
            //&& $('#ddl_as_type').val().trim() != "03"
            && $('#ddl_as_type').val().trim() != "09"
            && $('#ddl_as_type').val().trim() != "08"
            && $('#ddl_as_type').val().trim() != "05"
            && $('#ddl_as_type').val().trim() != "06"
            && $('#ddl_as_type').val().trim() != "07" 
            && $('#ddl_as_type').val().trim() != ""
            && $('#txtb_pm_out').val().trim() == ""
            && $('#ddl_as_type').val().trim() != "09"
            && $('#ddl_as_type').val().trim() != "10"
            && $('#ddl_as_type').val().trim() != "11"
        )
        {
            $("#lbl_txtb_pm_in_req").html("&nbsp;");
            ValidationResultColor3("txtb_pm_out", true);
            return_val = false;
        }
        else if ($('#ddl_as_type').val().trim() != "02"
            && $('#ddl_as_type').val().trim() != "01"
            //&& $('#ddl_as_type').val().trim() != "03"
            && $('#ddl_as_type').val().trim() != "09"
            && $('#ddl_as_type').val().trim() != "08"
            && $('#ddl_as_type').val().trim() != "05"
            && $('#ddl_as_type').val().trim() != "06"
            && $('#ddl_as_type').val().trim() != "07" 
            && $('#ddl_as_type').val().trim() != ""
            && $('#txtb_pm_out').val().trim() != ""
            && $('#ddl_as_type').val().trim() != "10"
            && $('#ddl_as_type').val().trim() != "11"
            && validateHhMm($('#txtb_pm_out').val().replace(' ', '')) == false
        )
        {
            $("#lbl_txtb_pm_in_req").html("&nbsp;");
            ValidationResultColor3("txtb_pm_out", true);
            $("#lbl_txtb_pm_out_req").html("Invalid value!");
            return_val = false;
        }

        if (
            (   $('#ddl_as_type').val().trim() == "02" ||
                $('#ddl_as_type').val().trim() == "08"
                //$('#ddl_as_type').val().trim() == "05" ||
                //$('#ddl_as_type').val().trim() == "06" ||
                //$('#ddl_as_type').val().trim() == "07" 
            )
            && $('#ddl_reason').val().trim() == "") {
            ValidationResultColor3("ddl_reason", true);
            return_val = false;
        }

        if (
            ($('#ddl_as_type').val().trim() == "05"
            || $('#ddl_as_type').val().trim() == "06")
            && $('#txtb_as_venue').val().trim() == ""
           )
        {
            ValidationResultColor3("txtb_as_venue", true);
            return_val = false;
        }

        //ADDED BY: LORRAINE I. ALE 2021-03-27
        if ($('#ddl_as_type').val().trim() == "03")
        {
            if ($('#txtb_am_in').val().trim() == "" && $('#txtb_pm_out').val().trim() == "")
            {
                ValidationResultColor3("txtb_am_in", true);
                ValidationResultColor3("txtb_pm_out", true);
                $("#lbl_txtb_pm_in_req").text() == "" ? $("#lbl_txtb_pm_in_req").html("&nbsp;") : $("#lbl_txtb_pm_in_req").text();
                $("#lbl_txtb_pm_out_req").html("Required Field!");
                return_val = false;
            }
        }

        if ($('#ddl_as_type').val().trim() == "03"
            &&
            $('#txtb_am_in').val().trim() == "") {
            ValidationResultColor3("txtb_am_in", true);
           
            $("#lbl_txtb_am_in_req").html("Required Field!");
            return_val = false;
        }

        if ($('#ddl_as_type').val().trim() == "03"
            &&
            $('#txtb_pm_out').val().trim() == "") {
            ValidationResultColor3("txtb_pm_out", true);

            $("#lbl_txtb_pm_out_req").html("Required Field!");
            return_val = false;
        }

        if ($('#ddl_as_type').val().trim() == "03"
            && $('#txtb_am_in').val().trim() != ""
            && validateHhMm($('#txtb_am_in').val().replace(' ', '')) == false
        ) {
            $("#lbl_txtb_am_in_req").html("&nbsp;");
            ValidationResultColor3("txtb_am_in", true);
            $("#lbl_txtb_am_in_req").html("Invalid value!");
            return_val = false;
        }


        if ($('#ddl_as_type').val().trim() == "03"
            && $('#txtb_pm_out').val().trim() != ""
            && validateHhMm($('#txtb_pm_out').val().replace(' ', '')) == false
        ) {
            $("#lbl_txtb_pm_out_req").html("&nbsp;");
            ValidationResultColor3("txtb_pm_out", true);
            $("#lbl_txtb_pm_out_req").html("Invalid value!");
            return_val = false;
        }

        
        // ************************************************************
        // ** VJA - Validation for AS (Not include Overtime Override)**
        // ************************************************************
        if ($('#ddl_as_type').val().trim() != "03") // Overtime Override
        {
            if (moment($('#txtb_dtr_date').val().replace(' ', '') + ',' + $('#txtb_am_in').val().replace(' ', ''), 'YYYY-mm-DD, hh:mm A').format('A') == 'PM' &&
                validateHhMm($('#txtb_am_in').val().replace(' ', '')) == true)
            {
                $("#lbl_txtb_am_in_req").html("&nbsp;");
                ValidationResultColor3("txtb_am_in", true);
                $("#lbl_txtb_am_in_req").html("Change into AM");
                return_val = false;
            }
            if (moment($('#txtb_dtr_date').val().replace(' ', '') + ',' + $('#txtb_pm_out').val().replace(' ', ''), 'YYYY-mm-DD, hh:mm A').format('A') == 'AM' &&
                validateHhMm($('#txtb_pm_out').val().replace(' ', '')) == true) {
                $("#lbl_txtb_pm_out_req").html("&nbsp;");
                ValidationResultColor3("txtb_pm_out", true);
                $("#lbl_txtb_pm_out_req").html("Change into PM");
                return_val = false;
            }
        }
        //if ($('#ddl_as_type').val().trim() == "03")
        //{
        //    if (moment($('#txtb_am_in').val().replace(' ', ''), ['h:mmA']).isBefore(moment($('#txtb_pm_out').val().replace(' ', ''), ['h:mmA'])) == false)
        //    { 
        //        ValidationResultColor3("txtb_pm_out", true);
        //        ValidationResultColor3("txtb_am_in", true);
        //        $("#lbl_txtb_pm_out_req").html("should not be greater than time IN");
        //        $("#lbl_txtb_am_in_req").html("should not be greater than time IN");
        //        return_val = false;
        //    }
        //    
        //}
        // ************************************************************
        // ************************************************************


        return return_val;
    }


    function validateHhMm(par_value) {
        //var isValid = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(inputField.value);
        var isValid = (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](AM|PM)$/).test(par_value);

        //if (isValid) {
        //    inputField.style.backgroundColor = '#bfa';
        //} else {
        //    inputField.style.backgroundColor = '#fba';
        //}

        return isValid;
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidationResultColor3(par_object_id, par_v_result)
    {
        if (par_v_result)
        {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field!");
        }
        else
        {
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

        }
    }

    function get_page(dtr_date)
    {
        var nakit_an    = false;
        var rowx        = 0;
        var confirm     = 0;
        $('#datalist_grid2 tr').each(function ()
        {
            $.each(this.cells, function (cells)
            {
                if (cells == 0)
                {
                    if ($(this).text() == dtr_date) {
                        confirm = confirm + 1;
                    }
                }

                if (cells == 1)
                {
                    if ($(this).text() == $("#ddl_as_type option:selected").html())
                    {
                        confirm = confirm + 1;
                    }
                }

                if (confirm == 2)
                {
                    nakit_an = true;
                    return false;
                }
            });

            if (nakit_an)
            {
                $(this).addClass("selected");
                return false;
            }
            rowx++;
        });

        return nakit_an;
    }

    //************************************// 
    //*** Open Edit Modal         
    //************************************// 
    function edit_action(row_id,source_table)
    {
        try
        {
            clearentry_dtl();
            ValidationResultColor3("ALL", false);
            s.save_mode         = "EDIT"
            btn = document.getElementById('submit');
            $('#submit').prop('ngx-rowId', row_id);
            $('#edit').prop('ngx-rowId', row_id);
            $('#addFinal').prop('ngx-rowId', row_id);
           

            h.post("../cSSAuthorizationSlipAppl/GetDetailsData",
            {
                p_application_nbr: (source_table == "hdr" ? s.datalistgrid[row_id].application_nbr : s.arr_dates[row_id].application_nbr)
                }).then(function (d)
                {
                    if (d.data.message == "success")
                    {
                        s.isEdit = true;
                        s.ModalTitle = "Edit Existing Record";

                        if (d.data.flpDtlLst[0].approval_status == "C")
                        {
                            btn.innerHTML = '<i class="fa fa-paper-plane-o"></i> Re-Submit';
                            s.resubmit = "TRUE"
                        }
                        else
                        {
                            btn.innerHTML = '<i class="fa fa-paper-plane-o"></i> Submit';
                            s.resubmit = "FALSE"
                        }

                        s.edit_appr_ctrl    = d.data.flpDtlLst[0].application_nbr;
                        s.edit_approval_id  = d.data.flpDtlLst[0].approval_id;
                        s.temp_row_id       = row_id;
                        s.txtb_appl_nbr     = d.data.flpDtlLst[0].application_nbr;
                        s.txtb_date_applied = d.data.flpDtlLst[0].date_applied;
                        s.txtb_empl_name    = d.data.flpDtlLst[0].employee_name;
                        s.txtb_created_by   = d.data.flpDtlLst[0].creator_name;
                        s.txtb_empl_id      = d.data.flpDtlLst[0].empl_id;
                        s.txtb_remarks      = d.data.flpDtlLst[0].detail_remarks;

                        s.oTable2.fnClearTable();
                        s.datalistgrid2     = d.data.flpDtlLst;
                        s.getDtlDataLength  = d.data.flpDtlLst.length;

                        if (d.data.flpDtlLst.length > 0)
                        {
                            s.oTable2.fnAddData(d.data.flpDtlLst);
                        }
                        if (d.data.flpDtlLst[0].creator_id != s.userid)
                        {
                            s.dis_plan_date         = true;
                            s.dis_submit            = true;
                            s.dis_edit              = true;
                            s.show_calendar_icon    = false;
                            s.show_cancel           = false;
                            s.dis_as_type           = true;
                            s.show_creator          = true;
                        }
                        else
                        {
                            s.show_creator = false;
                            if (d.data.flpDtlLst[0].approval_status == "N")
                            {
                                s.dis_plan_date         = false;
                                s.dis_submit            = false;
                                s.dis_edit              = false;
                                s.show_calendar_icon    = true;
                                s.show_cancel           = false;
                                s.dis_as_type           = false;
                                $("#txtb_date_applied").prop("disabled", false);
                            }
                            else if (d.data.flpDtlLst[0].approval_status == "C")
                            {
                                s.dis_plan_date         = false;
                                s.dis_submit            = false;
                                s.dis_edit              = false;
                                s.show_calendar_icon    = true;
                                s.show_cancel           = false;
                                s.dis_as_type           = false;
                                $("#txtb_date_applied").prop("disabled", false);
                            }
                            else if (d.data.flpDtlLst[0].approval_status == "S" || d.data.flpDtlLst[0].approval_status == "L" || d.data.flpDtlLst[0].approval_status == "D") {
                                s.dis_plan_date         = true;
                                s.dis_submit            = true;
                                s.dis_edit              = true;
                                s.show_calendar_icon    = false;
                                s.show_cancel           = false;
                                s.dis_as_type           = true;
                                $("#txtb_date_applied").prop("disabled", true);
                            }
                            else if (d.data.flpDtlLst[0].approval_status == "F")
                            {
                                s.dis_plan_date         = true;
                                s.dis_submit            = true;
                                s.dis_edit              = true;
                                s.show_calendar_icon    = false;
                                s.show_cancel           = false;
                                s.dis_as_type           = true;
                                $("#txtb_date_applied").prop("disabled", true);
                            }
                            else
                            {
                                s.dis_plan_date         = true;
                                s.dis_submit            = true;
                                s.dis_edit              = true;
                                s.show_calendar_icon    = false;
                                s.show_cancel           = false;
                                s.dis_as_type           = true;
                                $("#txtb_date_applied").prop("disabled", true);
                            }
                        }
                        
                        if (d.data.flpDtlLst[0].approval_status == "S") {
                            s.showRecall = true;
                        }
                        else {
                            s.showRecall = false;
                        }

                        $('#edit').attr('ngx-data', row_id);
                        var row_edited = $('#edit').attr("ngx-data");
                        //s.datalistgrid[row_edited].application_date = $('#txtb_dtr_date').val();
                        setTimeout(function () {
                            $('#main_modal').modal({ backdrop: 'static', keyboard: false });
                        }, 300);
                    }
                    else
                    {
                        swal(d.data.message, { icon: "warning", });
                    }
            });
        }
        catch (err)
        {
            swal({ icon: "warning", title: err.message });
        }
    }
    //************************************// 
    //*** Open Edit Modal         
    //**********************************// 
    s.btn_edit_action = function (row_id,source_table)
    {
        edit_action(row_id, source_table);
    }

    //************************************// 
    //*** Delete Record              
    //**********************************// 
    function btn_del_row1(row_index,source_table)
    {
        try {
            swal({
                title: "Are you sure to delete this record?",
                text: "Once deleted, you will not be able to recover this record!",
                icon: "warning",
                buttons: true,
                dangerMode: true,

            })
                .then(function (willDelete) {
                    if (willDelete) {
                        var data =
                        {
                            application_nbr : source_table == "HDR" ? s.datalistgrid[row_index].application_nbr : s.datalistgrid2[row_index].application_nbr
                            , as_dtr_date   : source_table == "HDR" ? s.datalistgrid[row_index].as_dtr_date     :s.datalistgrid2[row_index].as_dtr_date
                            , astype_code   : source_table == "HDR" ? s.datalistgrid[row_index].astype_code     :s.datalistgrid2[row_index].astype_code
                            , as_am_in      : s.datalistgrid[row_index].as_am_in
                            , as_am_out     : s.datalistgrid[row_index].as_am_out
                            , as_pm_in      : s.datalistgrid[row_index].as_pm_in
                            , as_pm_out     : s.datalistgrid[row_index].as_pm_out
                            , reason_code   : s.datalistgrid[row_index].reason_code
                            , as_under_time : s.datalistgrid[row_index].as_under_time
                            , as_comment    : s.datalistgrid[row_index].as_comment
                            , as_venue      : s.datalistgrid[row_index].as_venue
                            , rcrd_status   : s.datalistgrid[row_index].rcrd_status
                        };

                        h.post("../cSSAuthorizationSlipAppl/Delete",
                        {
                            data: data
                            ,action_mode: "DTL"
                        }).then(function (d) {
                            if (d.data.message == "success") {
                                FilterPageGrid2();
                                $('#main_modal').modal("hide");
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

    //************************************// 
    //*** Delete Record              
    //**********************************// 
    s.btn_del_All = function(row_index)
    {
        try {
            swal({
                title: "Are you sure to delete this record and all its components?",
                text: "Once deleted, you will not be able to recover this record!",
                icon: "warning",
                buttons: true,
                dangerMode: true,

            })
                .then(function (willDelete) {
                    if (willDelete) {
                        var data =
                        {
                            application_nbr : s.datalistgrid[row_index].application_nbr
                            , as_dtr_date   : s.datalistgrid[row_index].as_dtr_date
                            , astype_code   : s.datalistgrid[row_index].astype_code
                            , as_am_in      : s.datalistgrid[row_index].as_am_in
                            , as_am_out     : s.datalistgrid[row_index].as_am_out
                            , as_pm_in      : s.datalistgrid[row_index].as_pm_in
                            , as_pm_out     : s.datalistgrid[row_index].as_pm_out
                            , reason_code   : s.datalistgrid[row_index].reason_code
                            , as_under_time : s.datalistgrid[row_index].as_under_time
                            , as_comment    : s.datalistgrid[row_index].as_comment
                            , as_venue      : s.datalistgrid[row_index].as_venue
                            , rcrd_status   : s.datalistgrid[row_index].rcrd_status
                        };

                        h.post("../cSSAuthorizationSlipAppl/Delete",
                        {
                            data: data,
                            action_mode:"ALL"
                        }).then(function (d) {
                            if (d.data.message == "success")
                            {
                                FilterPageGrid2();
                                swal("Your record has been deleted!", { icon: "success", });
                                $('#main_modal').modal("hide");
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
    //************************************// 
    //*** Delete Record              
    //**********************************// 
    s.btn_del_row = function (row_index,source_table) {
        btn_del_row1(row_index, source_table)
    }
    //************************************// 
    //*** Delete Record              
    //**********************************// 
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
                        var data = {
                            application_nbr: s.datalistgrid[row_index].application_nbr
                            , updated_dttm: new Date().toLocaleString()
                            , approval_id: s.datalistgrid[row_index].approval_id
                        }

                        h.post("../cSSAuthorizationSlipAppl/CancelledAll", {
                            data: data
                        }).then(function (d) {
                            if (d.data.message == "success") {
                                FilterPageGrid2();
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

     //************************************// 
    //*** Print Action Click              
    //**********************************// 
    s.btn_print_action = function (par_row_id)
    {
        

        var application_nbr = s.datalistgrid[par_row_id].application_nbr;
        var controller  = "Reports"
        var action      = "Index"
        var ReportName  = "CrystalReport"
        var SaveName    = "Crystal_Report"
        var ReportType  = "inline"
        var ReportPath  = ""
        var             sp = ""

        ReportPath = "~/Reports/cryAuthorizationSlipReport/cryAuthorizationSlipReport.rpt"
        sp = "sp_authorization_slip_report,p_application_nbr," + application_nbr

        h.post("../cSSAuthorizationSlipAppl/setPageHistory")
            .then(function (d) {
                if (d.data.message == "success")
                {
                    //location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                    //    + "&SaveName=" + SaveName
                    //    + "&ReportType=" + ReportType
                    //    + "&ReportPath=" + ReportPath
                    //    + "&Sp=" + sp

                    // *******************************************************
                    // *** VJA : 2021-07-14 - Validation and Loading hide ****
                    // *******************************************************
                    s.employee_name_print = "AUTHORIZATION SLIP";
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
                    console.log(s.embed_link)

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
                }
                else
                {
                    alert(d.data.message);
                }
            });

        

    }

    //************************************// 
    //*** Delete Record              
    //**********************************// 
    s.btn_del_row3 = function (row_index)
    {
        if (s.datalistgrid2[row_index].rcrd_status == "N")
        {
            if (s.datalistgrid2[row_index].as_dtr_date == $("#txtb_dtr_date").val().trim())
            {
                clearentry_dtl();
            }

            s.datalistgrid2 = s.datalistgrid2.delete(row_index);
            s.oTable2.fnClearTable();
            if (s.datalistgrid2.length != 0)
            {
                s.oTable2.fnAddData(s.datalistgrid2);
            }

        }
        else if (s.datalistgrid2[row_index].rcrd_status == "C")
        {
            var data =
            {
                application_nbr : s.datalistgrid2[row_index].application_nbr
                , as_dtr_date   : s.datalistgrid2[row_index].as_dtr_date
                , astype_code   : s.datalistgrid2[row_index].astype_code
                , as_am_in      : s.datalistgrid2[row_index].as_am_in
                , as_am_out     : s.datalistgrid2[row_index].as_am_out
                , as_pm_in      : s.datalistgrid2[row_index].as_pm_in
                , as_pm_out     : s.datalistgrid2[row_index].as_pm_out
                , reason_code   : s.datalistgrid2[row_index].reason_code
                , as_under_time : s.datalistgrid2[row_index].as_under_time
                , as_comment    : s.datalistgrid2[row_index].as_comment
                , as_venue      : s.datalistgrid2[row_index].as_venue
                , rcrd_status   : s.datalistgrid2[row_index].rcrd_status
            };
            h.post("../cSSAuthorizationSlipAppl/Delete",
            {
                data: data
            }).then(function (d) {
                if (d.data.message == "success")
                {
                    FilterPageGrid2();
                   
                    swal("Your record has been deleted!", { icon: "success", });

                    s.datalistgrid2 = s.datalistgrid2.delete(row_index);
                    s.oTable2.fnClearTable();
                    if (s.datalistgrid2.length > 0) {
                        s.oTable2.fnAddData(s.datalistgrid2);
                    }
                    else
                    {
                        $('#main_modal').modal("hide");
                    }
                }
                else {
                    swal({ title: d.data.message, icon: "warning", });
                }
            });
            
        }

    }

    s.btn_edit_as_details = function (par_row_id)
    {
        clearentry_dtl();
        ValidationResultColor3("ALL", false);
        var data = s.datalistgrid2[par_row_id];
        //console.log(data)
        $('#add2').html("UPDATE");
        $('#add2').attr("ngx-data-row", par_row_id);
        $('#add2').attr("ngx-data-update", "U");

        $("#txtb_dtr_date").val(data.as_dtr_date);
        $("#ddl_as_type").val(data.astype_code);
        s.ddl_as_type = data.astype_code;
        $('#ddl_reason').val(data.reason_code);
        $("#txtb_am_in").val(data.as_am_in);
        $("#txtb_am_out").val(data.as_am_out);
        $("#txtb_pm_in").val(data.as_pm_in);
        $("#txtb_pm_out").val(data.as_pm_out);

        $("#txtb_as_comment").val(data.as_comment);
        $("#txtb_as_venue").val(data.as_venue);

        s.dis_plan_date = true;
        s.ddl_as_type_change();
        //if (data.astype_code.trim() == "01" && data.astype_code.trim() != "")
        //{
        //    $("#lbl_am_entry").html("AM TIME ENTRY:");
        //    $("#lbl_pm_entry").html("PM TIME ENTRY:");
        //    s.dtl_enable = false;
        //}
        //else if (data.astype_code.trim() == "02" && data.astype_code.trim() != "")
        //{
        //    $("#lbl_am_entry").html("AM TIME ENTRY:");
        //    $("#lbl_pm_entry").html("PM TIME ENTRY:");
        //    s.dtl_enable = true;
        //    s.is_to = true;
        //}
        //else if (data.astype_code.trim() != "")
        //{
        //    $("#lbl_am_entry").html("AS TIME FROM:");
        //    $("#lbl_pm_entry").html("AS TIME TO:");
        //    s.dtl_enable  = false;
        //    s.is_to       = true;
        //}

        $("#txtb_dtr_date").val(data.as_dtr_date);
        s.txtb_dtr_date = data.as_dtr_date
        check_dtl_data(par_row_id);
        if (data.rcrd_status != "N" && data.rcrd_status != "C")
        {
            s.dtl_enable    = true;
            s.is_to         = true;
        }
        
    }

    function check_dtl_data(row_id)
    {
        var data = s.datalistgrid2[row_id]; 
       

        if (data.astype_code.trim() == "")
        {
            s.dis_as_type = false;
        }
        else {
            s.dis_as_type = true;
        }
    }

    //************************************// 
    //*** Cancel Record              
    //**********************************// 
    s.btn_cancel = function (row_index)
    {
        try
        {
            swal({
                title: "Are you sure to cancel this application?",
                text: "Once cancelled, you will not be able to recover this record!",
                icon: "warning",
                buttons: true,
                dangerMode: true,

            })
                .then(function (willDelete)
                {
                    if (willDelete)
                    {
                        var data2 = [];
                        var data =
                        {
                            application_nbr     : s.datalistgrid2[row_index]['application_nbr']
                            , approval_id       : ""
                            , date_applied      : ""
                            , empl_id           : s.txtb_empl_id
                            , detail_remarks    : ""
                            , approval_status   : "L"
                            , posting_status    : 0
                            , approval_id       : ""
                            , created_dttm      : new Date().toLocaleString()
                            , created_by_user   : ""
                            , updated_dttm      : ""
                            , updated_by_user   : ""
                        }

                        var data2 =
                        {
                            application_nbr : s.datalistgrid2[row_index]['application_nbr']
                            , as_dtr_date   : s.datalistgrid2[row_index]['as_dtr_date']
                            , astype_code   : s.datalistgrid2[row_index]['astype_code']
                            , as_am_in      : s.datalistgrid2[row_index]['as_am_in']
                            , as_am_out     : s.datalistgrid2[row_index]['as_am_out']
                            , as_pm_in      : s.datalistgrid2[row_index]['as_pm_in']
                            , as_pm_out     : s.datalistgrid2[row_index]['as_pm_out']
                            , reason_code   : s.datalistgrid2[row_index]['reason_code']
                            , as_under_time : s.datalistgrid2[row_index]['as_under_time']
                            , as_comment    : s.datalistgrid2[row_index]['as_comment']
                            , as_venue      : s.datalistgrid2[row_index]['as_venue']
                            , rcrd_status   : "L"
                        }

                        h.post("../cSSAuthorizationSlipAppl/Cancelled", {
                            data: data
                            , data2: data2
                        }).then(function (d)
                        {
                            if (d.data.message == "success")
                            {

                                swal("Your record has been cancelled!", { icon: "success", });
                                FilterPageGrid2();
                                s.datalistgrid2[row_index]['rcrd_status'] = "L";
                                s.datalistgrid2[row_index]['rcrd_status_descr'] = "Cancelled";
                                if (s.datalistgrid2.length > 0)
                                {
                                    s.oTable2.fnClearTable();
                                    s.oTable2.fnAddData(s.datalistgrid2);
                                }
                                else
                                {
                                    s.oTable2.fnClearTable();
                                }

                            }
                            else {
                                swal({ title: d.data.message, icon: "warning", });
                            }
                        })
                    }
                });
        }
        catch (err)
        {
            swal({ icon: "warning", title: err.message });
        }
    }
    //************************************// 
    //*** Cancel Record              
    //**********************************// 
    s.btn_undo_row = function (row_index)
    {
        try {

            var data =
            {
                application_nbr : s.datalistgrid2[row_index].application_nbr
                , as_dtr_date   : s.datalistgrid2[row_index]['as_dtr_date']
                , astype_code   : s.datalistgrid2[row_index]['astype_code']
                , as_am_in      : s.datalistgrid2[row_index]['as_am_in']
                , as_am_out     : s.datalistgrid2[row_index]['as_am_out']
                , as_pm_in      : s.datalistgrid2[row_index]['as_pm_in']
                , as_pm_out     : s.datalistgrid2[row_index]['as_pm_out']
                , reason_code   : s.datalistgrid2[row_index]['reason_code']
                , as_under_time : s.datalistgrid2[row_index]['as_under_time']
                , as_comment    : s.datalistgrid2[row_index]['as_comment']
                , as_venue      : s.datalistgrid2[row_index]['as_venue']
                , rcrd_status   : "C"
            }

            h.post("../cSSAuthorizationSlipAppl/Cancelled", {
                  data: data
                , data2: data2
            }).then(function (d)
            {
                if (d.data.message == "success")
                {

                }
            });

            s.datalistgrid2[row_index]['rcrd_status']       = 'C';
            s.datalistgrid2[row_index]['rcrd_status_descr'] = 'Cancel Pending';

            s.oTable2.fnClearTable();
            s.oTable2.fnAddData(s.datalistgrid2);

        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    Array.prototype.delete = function (code)
    {
        return this.filter(function (d, k)
        {
            return k != code
        })
    }

    function clearentry()
    {
        s.txtb_dtr_date = "";
        s.txtb_remarks  = "";
        s.new_appr_ctrl = "";

        $("#txtb_approval_status").removeClass("required");
        $("#lbl_txtb_approval_status_req").text("");

        $("#txtb_year").removeClass("required");
        $("#lbl_txtb_year_req").text("");

        $("#txtb_empl_name").removeClass("required");
        $("#lbl_txtb_empl_name_req").text("");

        $("#txtb_empl_id").removeClass("required");
        $("#lbl_txtb_empl_id_req").text("");

        $("#txtb_dtr_date").removeClass("required");
        $("#lbl_txtb_dtr_date_req").text("");
    }

    function clearentry_dtl()
    {
        s.txtb_dtr_date     = "";
        $('#txtb_dtr_date').val('');
        $("#txtb_am_in ").val('');
        $("#txtb_am_out").val('');
        $("#txtb_pm_in ").val('');
        $("#txtb_pm_out").val('');

        $("#ddl_as_type").val('');
        s.ddl_as_type = "";
        $("#ddl_reason").val('');

        $("#txtb_as_venue").val('');
        $("#txtb_as_comment").val('');

        $('#add2').html('<i class="fa fa-plus-circle" style="padding-top:2.5px;padding-bottom:2px;padding-left:0px;padding-right:0px;"> </i> ADD');
        $('#add2').attr("ngx-data-row", "");
        $('#add2').attr("ngx-data-update", "A");
        s.dis_plan_date = false;
        s.dis_as_type   = false;
    }

    //ADDED BY: LORRAINE I ALE DATE: 2021-03-17
    s.btn_withdraw_submission = function () {
        swal({
            title: "Are you sure to recall the submission of this application?",
            text: "",
            icon: "warning",
            buttons: true,
            dangerMode: true,

        })
            .then(function (willDelete) {
                if (willDelete) {
                    
                    var row_id = $("#edit").prop('ngx-rowId');
                    
                    var data =
                    {
                         application_nbr    : s.datalistgrid[row_id].application_nbr
                        ,approval_id        : s.datalistgrid[row_id].approval_id
                        ,approval_status    : "C"
                        , detail_remarks    : "User Recall Submission"
                    }
                    
                    h.post("../cSSAuthorizationSlipAppl/WithdrawSubmission", { data: data }).then(function (d) {
                        if (d.data.message == "success") {
                            $('#main_modal').modal("hide");
                            swal("Your application has been successfully recalled!", { icon: "success", });
                            FilterPageGrid2();
                        }
                        else {
                            swal(d.data.message, { icon: "warning", });
                        }
                    });
                }
            });
    }
})