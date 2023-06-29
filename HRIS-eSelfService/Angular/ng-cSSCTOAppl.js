ng_selfService_App.controller("cSSCTOAppl_ctrlr", function ($scope, $compile, $http, $filter)
{
    // **********************************************
    // ***** LEAVE TYPE LIST ************************
    // **********************************************
    // CTO	= Compensatory Time Off
    // FL	= Forced Leave
    // MC	= Magna Carta for Women
    // MC16	= MC No. 16, S. 2021
    // ML	= Maternity Leave
    // MZ	= Monetization Leave
    // PL	= Paternity Leave
    // PS	= Parental Leave(Solo Parent)
    // QT	= Quarantined
    // SL	= Sick Leave
    // SP	= Special Privilege Leave
    // TL	= Terminal Leave
    // VL	= Vacation Leave
    // **********************************************
    // **********************************************

    var s                   = $scope
    var h                   = $http

    var arr_dates           = [];
    s.year                  = [];
    s.holidays_list         = null;
    s.holidays_list1        = null;
    s.userid                = "";
    s.log_in_as_AO          = "";
    s.ddl_name              = "";
    s.temp_flag_initial     = "";
    s.txtb_day_equiv        = "1";
    s.rowLen                = "10";
    s.total_equiv_tot       = 0;
    s.available_leave       = 0;
    s.show_btn_add_date     = true;
    s.ShowFLP               = false;
    s.div_cto               = false;
    s.lbl_days_hrs_equi     = "Days Equivalent:"

    s.txtb_cto_remarks      = "08:00AM-5:00PM";
    $('#txtb_cto_remarks').val("08:00AM-5:00PM");
    s.show_refresh_bal = true;
    s.show_cancel_button = false;
    s.show_final_approved = true;
    s.cancellation_calendar = null;
    s.leave_cancel_type = "";

    s.div_justi_msg = false;
    s.div_show_transfer_date = false;
    var justi_flag = document.getElementById("justification_flag");
    init()
    //**********************************************
    // Initialize data during page loads ***********
    //**********************************************
    function init()
    {
        try
        {
            $("#start").on('change', function (e)
            {
                s.day_num_day_total_func();
            });

            $("#end").on('change', function (e)
            {
                s.day_num_day_total_func();
            });
            
            s.start = moment(new Date()).format('YYYY-MM-DD');
            s.end   = moment(new Date()).format('YYYY-MM-DD');
            $('#today_date').text(moment(new Date()).format('MMM DD, YYYY').toString());

            $("#ddl_name").select2().on('change', function (e) {
                s.FilterPageGrid();
            });

            $('#slvl_radio0').addClass('sl-vl-radio-display-none');
            $('#slvl_radio1').addClass('sl-vl-radio-display-none');
            $('#txtb_specify_div').addClass('sl-vl-radio-display-none');

            $('#summernote_justification').summernote();

            $('#modal_loading').modal({ backdrop: 'static', keyboard: false });
            h.post("../cSSLeaveAppl/InitializeData").then(function (d) {
                if (d.data.message == "success")
                {
                    s.userid            = d.data.um.user_id
                    s.holidays_list     = d.data.holiDate;
                    s.statusList        = d.data.status;
                    s.txtb_empl_id      = d.data.user_info.empl_id;
                    s.txtb_dept_name = d.data.dept_name;

                    s.cancellation_calendar = d.data.cancellation_calendar;
                    
                    if (d.data.empl_name.filter(function (e) { return e.empl_id === d.data.user_info.empl_id; }).length > 0)
                    {
                        s.ddl_name = d.data.user_info.empl_id
                    }
                    else
                    {
                        s.ddl_name = "";
                    }

                    s.empl_names = d.data.empl_name;

                    // **************************************************************
                    // New Validation - User Cannot Apply Leave with no Employee Master
                    // **************************************************************
                    if (d.data.empl_name.length <= 0)
                    {
                        swal('You cannot Apply Leave', 'User either In-Active employee or no Employee Master Information', { icon: "warning" });
                        return;
                    }
                    // **************************************************************
                    // **************************************************************

                    s.menu_name         = d.data.um.menu_name;
                    s.leave_type        = d.data.leaveType;
                    s.leave_sub_type    = d.data.leaveSubType;

                    d.data.log_in_as_AO == "True" ? s.log_in_as_AO = true : s.log_in_as_AO = false;
                    d.data.leaveType > 0 ? s.dis_leavesubtype      = false : s.dis_leavesubtype = true;

                    if (d.data.leaveLst.length > 0)
                    {
                        s.datalistgrid = d.data.leaveLst;
                        arr_dates = d.data.leaveLst;
                    }
                    else
                    {
                        s.datalistgrid = [];
                    }
                    if (d.data.leaveLst1.length > 0)
                    {
                        init_table_data3(d.data.leaveLst1);
                    }
                    else
                    {
                        init_table_data3([]);
                    }

                    init_table_cancel([]);
                    initialize_calendar();
                    init_table_data2([]);
                    calendar_data();
                    //s.temp_flag_initial = "not";
                    
                    //**********************************************
                    //  Show/Hide ADD, EDIT, DELETE button 
                    //**********************************************
                    d.data.um.allow_add     == "1" ? s.ShowAdd      = true : s.ShowAdd    = false;
                    d.data.um.allow_delete  == "1" ? s.ShowDelete   = true : s.ShowDelete = false;
                    d.data.um.allow_edit    == "1" ? s.ShowEdit     = true : s.ShowEdit   = false;
                    //d.data.um.allow_view  == "1" ? s.ShowView     = true : s.ShowView = false;
                    //d.data.um.allow_print == "1" ? s.ShowAdd      = true : s.ShowAdd  = false;

                    $("#modal_generating_remittance").modal("hide");
                    $('#txtb_year_selected').val(new Date().getFullYear().toString());

                    if ($('#ddl_leave_type option:selected').val()    == "SL"
                        || $('#ddl_leave_type option:selected').val() == "VL"
                        || $('#ddl_leave_type option:selected').val() == "FL")
                    {
                        s.show_vl = true;
                    }
                    else
                    {
                        s.show_vl = false;
                    }

                    //**********************************************
                    //  Balance as of - All 
                    //**********************************************
                    s.lst_all_bal = d.data.data_all_bal
                    for (var i = 0; i < d.data.data_all_bal.length; i++)
                    {
                        if (parseFloat(d.data.data_all_bal[i].leaveledger_balance_current) <= 0)
                        {
                            d.data.data_all_bal[i].balance_color = "text-danger";
                        }
                        else
                        {
                            d.data.data_all_bal[i].balance_color = "text-navy";
                        }
                    }
                    //**********************************************
                    //**********************************************
                    s.lst_fl_plan_lst = d.data.fl_plan_lst
                    for (var i = 0; i < d.data.fl_plan_lst.length; i++)
                    {
                        d.data.fl_plan_lst[i].flp_application_date_descr = moment(d.data.fl_plan_lst[i].flp_application_date).format("MMMM DD, YYYY")
                    }

                    

                    $('#modal_loading').modal("hide");
                }
                else
                {
                    $('#modal_loading').modal("hide");
                    swal(d.data.message, { icon: "warning", });
                }
            });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }
    //***********************************//
    //***- 2020-04-08 - Remove Function****//
    //***********************************// 
    Array.prototype.remove = function (code, prop)
    {
        return this.filter(function (d) {
            return d[prop] != code
        })
    }
    //**********************************************
    // Initialize data during page loads ***********
    //**********************************************
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
                        },
                        {
                            "width": "20%",
                            "targets": 4,
                            "mData": null,
                            "mRender": function (data, type, full, row)
                            {
                                var btn_show = true;
                                if (full["rcrd_status"] == "S" ||
                                    full["rcrd_status"] == "R" ||
                                    full["rcrd_status"] == "1" ||
                                    full["rcrd_status"] == "2" ||
                                    full["rcrd_status"] == "F" ||
                                    full["rcrd_status"] == "D" ||
                                    full["rcrd_status"] == "L")
                                {
                                    btn_show = false;
                                }
                                return '<center><div class="btn-group">' +
                                        '<button type="button" ng-show="'+ btn_show +'" class="btn btn-info btn-sm" ng-click="btn_edit_action1(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >' +
                                    '<button type="button" ng-show="' + btn_show + '"  class="btn btn-danger btn-sm" ng-click="btn_del_row1(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                        '</div></center>';
                            }
                        }
                    ],
                    "createdRow": function (row, data, index) {
                        $compile(row)($scope);  //add this to compile the DOM
                    },
                    "footerCallback": function (row, data, start, end, display)
                    {
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
    //**********************************************
    // Initialize data during page loads ***********
    //**********************************************
    var init_table_data3 = function (par_data) {
        try {
            s.datalistgrid3 = par_data;
            s.oTable3 = $('#datalist_grid3').dataTable(
                {
                    data: s.datalistgrid3,
                    bSort: false,
                    sDom: 'rt<"bottom">',
                    paging: false,
                    columns: [
                        {
                            className: 'table-dataTable-tbody-td',
                            "mData": null,
                            "mRender": function (data, type, full, row) {
                                var temp = ""
                                var edit_text = "Edit";
                                var enable_button = "";
                                var show_creator = false;
                                var posting_status = "" 
                                var leave_sub_type = "" 

                                leave_sub_type = full["leave_subtype_code"] != '' ? ' (' + full["leave_subtype_code"] +')' : '';
                                posting_status = full["posting_status"] == '1' ? '<span class="pull-right label label-primary"> Posted </span>' : '<span class="pull-right label label-danger"> Not Posted </span>';

                                if (s.userid == full['created_by_user'] &&
                                    full["approval_status"].toString() != "S"
                                    && full["approval_status"].toString() != "R" &&
                                    full["approval_status"].toString() != "1" &&
                                    full["approval_status"].toString() != "2") {

                                    enable_button = "block";
                                }
                                else if (s.userid != full['created_by_user']) {
                                    enable_button = "none";
                                    show_creator = true;
                                    edit_text = "View Details";
                                }
                                if (full["approval_status"].toString() == "S" ||
                                    full["approval_status"].toString() == "R" ||
                                    full["approval_status"].toString() == "1" ||
                                    full["approval_status"].toString() == "2" ||
                                    full["approval_status"].toString() == "F" ||
                                    full["approval_status"].toString() == "D" ||
                                    full["approval_status"].toString() == "L") {
                                    edit_text = "View Details";
                                }
                                if (full["approval_status"].toString() == "N") {

                                    temp = "<div class='xx input-group m-b'>"
                                        + "<span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'>"
                                        + "<div class='external-event navy-bg new-bg'><h4>"
                                        + "<span style='font-size:10px !important'>" + full["leave_ctrlno"] + "&emsp; | &emsp;" + full["leave_dates"].toString().substring(0, 50) + "..." + "</span>"
                                        + "</small><br/>"
                                        + full["employee_name"] 
                                        + "</small><br/>"
                                        + full["leavetype_descr"] + leave_sub_type
                                        + "</small><br/>"
                                        + full["approval_status_descr"] + posting_status
                                        + (full["appl_status"].toString() == "" ? "" : "<br/><span style='font-size:70% !important;border: 1px solid blanchedalmond;margin-top:5px' class='badge badge-primary smaller'> <i class='fa fa-info-circle'></i> " + full["appl_status"] + " </span>")
                                        + "<span class='pull-right' ng-show='" + show_creator + "'>By: " + full["created_by_user"].replace('U', '#') + "</span></h4></div></span> <ul class='dropdown-menu'><li>"
                                        + "<a ng-click='btn_edit_action(" + row["row"] + ",\"hdr\")'>" + edit_text + "</a></li>"
                                        //+ "<li style='display:" + enable_button + "'><a ng-click='btn_del_all(" + row["row"] + ")'>Delete</a></li>"
                                        + "<li style='display:" + enable_button + "'><a ng-click='btn_print_action(" + row["row"] + ")'>Print Permission Form</a></li>"
                                        + "<li ><a ng-click='btn_cancelled(" + row["row"] + ")'>Cancel Application</a></li>"
                                        + "</ul></div>";
                                }
                                else if (full["approval_status"].toString() == "S") {
                                    temp = "<div class='xx input-group m-b'>"
                                        + "<span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'>"
                                        + "<div class='external-event navy-bg submitted-bg'><h4>"
                                        + "<span style='font-size:10px !important'>" + full["leave_ctrlno"] + "&emsp; | &emsp;" + full["leave_dates"].toString().substring(0, 50) + "..." + "</span>"
                                        + "</small><br/>"
                                        + full["employee_name"] 
                                        + "</small><br/>"
                                        + full["leavetype_descr"] + leave_sub_type
                                        + "</small><br/>"
                                        + full["approval_status_descr"] + posting_status
                                        + (full["appl_status"].toString() == "" ? "" : "<br/><span style='font-size:70% !important;border: 1px solid blanchedalmond;margin-top:5px' class='badge badge-primary smaller'> <i class='fa fa-info-circle'></i> " + full["appl_status"] + " </span>")
                                        + "<span class='pull-right' ng-show='" + show_creator + "'>By: " + full["created_by_user"].replace('U', '#') + "</span></h4></div></span> <ul class='dropdown-menu'><li>"
                                        + "<a ng-click='btn_edit_action(" + row["row"] + ",\"hdr\")'>" + edit_text + "</a></li>"
                                        + "<li style='display:" + enable_button + "'><a ng-click='btn_print_action(" + row["row"] + ")'>Print Permission Form</a></li>"
                                        + "</ul></div>";
                                }
                                else if (full["approval_status"].toString() == "R") {
                                    temp = "<div class='xx input-group m-b'>"
                                        + "<span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'>"
                                        + "<div class='external-event navy-bg reviewed-bg'><h4>"
                                        + "<span style='font-size:10px !important'>" + full["leave_ctrlno"] + "&emsp; | &emsp;" + full["leave_dates"].toString().substring(0, 50) + "..." + "</span>"
                                        + "</small><br/>"
                                        + full["employee_name"] 
                                        + "</small><br/>"
                                        + full["leavetype_descr"] + leave_sub_type
                                        + "</small><br/>"
                                        + full["approval_status_descr"] + posting_status
                                        + (full["appl_status"].toString() == "" ? "" : "<br/><span style='font-size:70% !important;border: 1px solid blanchedalmond;margin-top:5px' class='badge badge-primary smaller'> <i class='fa fa-info-circle'></i> " + full["appl_status"] + " </span>")
                                        + "<span class='pull-right' ng-show='" + show_creator + "'>By: " + full["created_by_user"].replace('U', '#') + "</span></h4></div></span> <ul class='dropdown-menu'><li>"
                                        + "<a ng-click='btn_edit_action(" + row["row"] + ",\"hdr\")'>" + edit_text + "</a></li>"
                                        + "<li style='display:" + enable_button + "'><a ng-click='btn_print_action(" + row["row"] + ")'>Print Permission Form</a></li>"
                                        + "</ul></div>";
                                }
                                else if (full["approval_status"].toString() == "F") {
                                    temp = "<div class='xx input-group m-b'>"
                                        + "<span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'>"
                                        + "<div class='external-event navy-bg approved-bg'><h4>"
                                        + "<span style='font-size:10px !important'>" + full["leave_ctrlno"] + "&emsp; | &emsp;" + full["leave_dates"].toString().substring(0, 50) + "..." + "</span>"
                                        + "</small><br/>"
                                        + full["employee_name"] 
                                        + "</small><br/>"
                                        + full["leavetype_descr"] + leave_sub_type
                                        + "</small><br/>"
                                        + full["approval_status_descr"] + posting_status
                                        + (full["appl_status"].toString() == "" ? "" : "<br/><span style='font-size:70% !important;border: 1px solid blanchedalmond;margin-top:5px' class='badge badge-primary smaller'> <i class='fa fa-info-circle'></i> " + full["appl_status"] + " </span>")
                                        + "<span class='pull-right' ng-show='" + show_creator + "'>By: " + full["created_by_user"].replace('U', '#') + "</span></h4></div></span> <ul class='dropdown-menu'><li>"
                                        + "<a ng-click='btn_edit_action(" + row["row"] + ",\"hdr\")'>" + edit_text + "</a></li>"
                                        + "<li style='display:" + enable_button + "'><a ng-click='btn_print_action(" + row["row"] + ")'>Print Permission Form</a></li>"
                                        + "</ul></div>";
                                }
                                if (full["approval_status"].toString() == "C") {

                                    temp = "<div class='xx input-group m-b'>"
                                        + "<span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'>"
                                        + "<div class='external-event navy-bg cancel-bg'><h4>"
                                        + "<span style='font-size:10px !important'>" + full["leave_ctrlno"] + "&emsp; | &emsp;" + full["leave_dates"].toString().substring(0, 50) + "..." + "</span>"
                                        + "</small><br/>"
                                        + full["employee_name"] 
                                        + "</small><br/>"
                                        + full["leavetype_descr"] + leave_sub_type
                                        + "</small><br/>"
                                        + full["approval_status_descr"] + posting_status
                                        + (full["appl_status"].toString() == "" ? "" : "<br/><span style='font-size:70% !important;border: 1px solid blanchedalmond;margin-top:5px' class='badge badge-primary smaller'> <i class='fa fa-info-circle'></i> " + full["appl_status"] + " </span>")
                                        + "<span class='pull-right' ng-show='" + show_creator + "'>By: " + full["created_by_user"].replace('U', '#') + "</span></h4></div></span> <ul class='dropdown-menu'><li>"
                                        + "<a ng-click='btn_edit_action(" + row["row"] + ",\"hdr\")'>" + edit_text + "</a></li>"
                                        + "<li style='display:" + enable_button + "'><a ng-click='btn_del_all(" + row["row"] + ")'>Delete</a></li>"
                                        + "<li style='display:" + enable_button + "'><a ng-click='btn_print_action(" + row["row"] + ")'>Print Permission Form</a></li>"
                                        + "<li ><a ng-click='btn_cancelled(" + row["row"] + ")'>Cancel Application</a></li>"
                                        + "</ul></div>";
                                }
                                else if (full["approval_status"].toString() == "D" || full["approval_status"].toString() == "L") {
                                    temp = "<div class='xx input-group m-b'>"
                                        + "<span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'>"
                                        + "<div class='external-event navy-bg disapproved-bg'><h4>"
                                        + "<span style='font-size:10px !important'>" + full["leave_ctrlno"] + "&emsp; | &emsp;" + full["leave_dates"].toString().substring(0, 50) + "..." + "</span>"
                                        + "</small><br/>"
                                        + full["employee_name"] 
                                        + "</small><br/>"
                                        + full["leavetype_descr"] + leave_sub_type
                                        + "</small><br/>"
                                        + full["approval_status_descr"] + posting_status
                                        + (full["appl_status"].toString() == "" ? "" : "<br/><span style='font-size:70% !important;border: 1px solid blanchedalmond;margin-top:5px' class='badge badge-primary smaller'> <i class='fa fa-info-circle'></i> " + full["appl_status"] + " </span>")
                                        + "<span class='pull-right' ng-show='" + show_creator + "'>By: " + full["created_by_user"].replace('U', '#') + "</span></h4></div></span> <ul class='dropdown-menu'><li>"
                                        + "<a ng-click='btn_edit_action(" + row["row"] + ",\"hdr\")'>" + edit_text + "</a></li>"
                                        + "<li style='display:" + enable_button + "'><a ng-click='btn_print_action(" + row["row"] + ")'>Print Permission Form</a></li>"
                                        + "</ul></div>";
                                }

                                return temp ;
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
    // Assign Color to Event Dates Base on the Status
    //************************************// 
    function color_dates(status) {
        try {
            var bg_color = "";
            if (status == "1" || status == "2" || status == "F") {
                bg_color = '#1C84C6';
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
            else {
                bg_color = '#F8EE96';
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
    function calendar_data()
    {
        try
        {
            
            for (var x = 0; x < arr_dates.length; x++)
            {
                var event = new Object();
                if (arr_dates[x].created_by_user == s.userid)
                {
                    event.id = (arr_dates[x].leave_ctrlno + "_true"); // unique event id;
                }
                else
                {
                    event.id = (arr_dates[x].leave_ctrlno + "_false"); // unique event id;
                }
                
                event.title = arr_dates[x].leave_type_descr + (arr_dates[x].appl_status.toString() == '' ? '' : '<br>' + "<span data-toggle='tooltip' data-placement='top' title='" + arr_dates[x].appl_status + "' style='font-size:70% !important;border: 1px solid blanchedalmond;' class='badge badge-primary smaller'> <i class='fa fa-info-circle'></i> " + arr_dates[x].appl_status + " </span>") ;
                event.start                 = arr_dates[x].leave_date_from;
                event.end                   = moment(arr_dates[x].leave_date_to).add(1, "days").format("YYYY-MM-DD");
                event.description           = arr_dates[x].approval_status ;
                event.backgroundColor       = color_dates(arr_dates[x].approval_status);
                event.borderColor           = 'white';
                event.extendedProps         = x;

                event.post_status           = arr_dates[x].posting_status;

                $('#calendar').fullCalendar('renderEvent', event, true);
                
            }
        }
        catch (err)
        {
            swal({ icon: "warning", title: err.message });
        }
    }
    //************************************//
    // Initialized Calendar   ************//
    //************************************// 
    function initialize_calendar()
    {
        try {

            var date = new Date();
            var d    = date.getDate();
            var m    = date.getMonth();
            var y    = date.getFullYear();
            var start_date = (y - 1) + '-01-01';
            var end_date = (y + 1) + '-12-31';

            $('#calendar').fullCalendar({
                aspectRatio: 1.5,
                customButtons: {
                    btn_add_btn: {
                        text: 'Add2',
                        click: function ()
                        {
                            s.btn_open_modal();
                        }
                    },
                },
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'btn_add_btn'
                },
                selectable: true,
                editable: false,
                eventClick: function (calEvent, el, jsEvent, view) {
                    if (el.originalEvent.target.className == "fa fa-times text-right pull-right") {
                        s.btn_del_all(calEvent.extendedProps)
                    }
                    else if (el.originalEvent.target.className == "fc-title") {
                        edit_action(calEvent.extendedProps)
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

                    $('.fc-prev-button').click(function () {
                        $('.popover').popover('hide');
                        s.FilterPageGrid();
                    });

                    $('.fc-next-button').click(function () {
                        $('.popover').popover('hide');
                        s.FilterPageGrid();
                    });

                    jQuery('.fc-today-button').addClass("xxbtn_today_text");
                },
                select: function (start, end, jsEvent, event) {
                    var e_date = new Date(moment(end).format('YYYY-MM-DD'));
                    var s_date = new Date(moment(start).format('YYYY-MM-DD'));
                    var date_diff = new Date(e_date - s_date);
                    s.tot_nbr_days = date_diff / 1000 / 60 / 60 / 24;

                    s.start_date = moment(start).format('YYYY-MM-DD');
                    s.end_date = moment(end).subtract(1, "days").format('YYYY-MM-DD');

                    popoverElement = $(jsEvent.target);
                    $(jsEvent.target).popover({
                        html: true,
                        animation: 'true',
                        placement: 'top',
                        container: 'body',
                        title: '',
                        trigger: 'click',
                        content: function () {
                            $('.popover').popover('hide')
                            return '<div onClick="$(\'#add_force_leave\').click();"><h5 style="cursor:pointer;">Apply Leave</h5></div>';
                        },
                    }).popover('show');
                    $(".fc-highlight").css("background", "red");
                },
                eventRender: function (event, element, cell) {
                    if (event.extendedProps == "xx") {
                        element.find('.fc-title').prepend('');
                        element.find('.fc-title').append('<div class="holiday-bg"><span><b>' + event.description + '</b></span></div>');
                        //
                        element.popover({
                            animation: true,
                            placement: function (context, source) {
                                if ($(source).offset().top - $(window).scrollTop() < 280) {
                                    return "bottom";
                                }

                                return "top";
                            },
                            delay: 300,
                            content: event.description,
                            trigger: 'hover'
                        });
                    }
                    else {
                        var show_delete = "block";
                        if (event.description == "N" || event.description == "C") {
                            show_delete = "block";
                        }
                        else {
                            show_delete = "none";
                        }
                        element.find('.fc-title').html(' <div class="data_calendar ibox-tools" style="text-align:center;">' + '<span class="fc-title">' + event.title + '</span> ' + '</div>');
                        element.find('.fc-content').parent().append('<div data-toggle="tooltip" data-placement="top" title="' + (event.post_status == "1" ? "Posted" : "Not Posted") + '" style="position:absolute;right:-5px;z-index:99999 !important;top:-5px"><span class="text-' + (event.post_status == "1" ? "success" : "danger") + '"><i class="fa fa-circle "></i></span></div>')

                    }
                },
                dayRender: function (date, cell) {
                    if (s.temp_flag_initial == "")
                    {
                        for (var x = 0; x < s.holidays_list.length; x++) {
                            if (date.format("YYYY-MM-DD") == s.holidays_list[x].holiday_date)
                            {
                                cell.prepend("<div class='holiday' data-toggle='tooltip' data-placement='top' title='" + s.holidays_list[x].holiday_name + "'><i class='fa fa-star text-warning'></i><small style='color:white;'>" + s.holidays_list[x].holiday_name + "</small></div>");
                            }
                        }
                        for (var i = 0; i < s.cancellation_calendar.length; i++)
                        {
                            if (moment(date).format('YYYY-MM-DD') == moment(s.cancellation_calendar[i].leave_cancel_date).format('YYYY-MM-DD'))
                            {
                                var lv_status_descr = "";
                                if (s.cancellation_calendar[i].leave_cancel_status == "N")
                                {
                                    lv_status_descr = "New"
                                }
                                if (s.cancellation_calendar[i].leave_cancel_status == "C") {
                                    lv_status_descr = "Cancel Pending"
                                }
                                if (s.cancellation_calendar[i].leave_cancel_status == "S")
                                {
                                    lv_status_descr = "Submitted"
                                }
                                if (s.cancellation_calendar[i].leave_cancel_status == "F") {
                                    lv_status_descr = "Final Approved"
                                }

                                cell.prepend("<div class='holiday' data-toggle='tooltip' data-placement='top' title='(" + lv_status_descr + ") - CANCELLATION'><i class='fa fa-send text-danger'></i><small style='color:white;'>  (" + lv_status_descr + ") CANCELLATION</small></div>");
                            }
                        }
                        
                    }
                }
            });

            $('.fc-btn_add_btn-button').html("<i class='fa fa-plus-circle'></i> Apply");
            $('.fc-btn_add_btn-button').addClass("btn btn-success");
            $('.fc-btn_add_btn-button').prop("id", "add");

            $('.fc-center').append('<div style="width:0%; float:left;padding-left:-5px;position:relative;" class="input-group date" id="datepickerX" data-provide="datepicker">' +
                '<input type="text" style="width:100px;display:none;"  id="txtb_year_selected" ng-model="txtb_year_selected"/>' +
                '<div class="input-group-addon" style="border:none;padding-left:0px;padding-top:7px;">' +
                '<span class="fa fa-calendar" id="mini-calendar-icn"></span>' +
                '</div></div>');

            $('.fc-center > h2').on("click", function () {
                $("span#mini-calendar-icn").click();
            });

            $("#datepickerX").datepicker({
                format: "yyyy-mm",
                startView: "years",
                minViewMode: "months",
                autoclose: true,
            });

            $('#datepickerX').datepicker().on('changeDate', function (ev) {
                s.FilterPageGrid();
                $('#calendar').fullCalendar('render');
                $('#calendar').fullCalendar('gotoDate', $('#txtb_year_selected').val() + '-01');
                
            });

        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }
    //*********************************************//
    //*** Select Leave Type
    //********************************************// 
    s.selectLeaveType = function ()
    {
        var temp_year_selected = $('.fc-center > h2').html();
        s.txtb_year_selected = temp_year_selected.slice(temp_year_selected.length - 4);

        if (s.datalistgrid2.length <= 0)
        {
            swal("YOU CANNOT SAVE THIS APPLICATION!", "You need to input Date Breakdown", { icon: "warning" });
            $('#id_datebrk').click();
            return_val = false;
        }

        if (s.ddl_leave_type == "MZ")
        {
            swal("YOU CANNOT APPLY MONETIZATION LEAVE ON HRIS - SELF-SERVICE AT THIS TIME!", "Please contact PHRMDO (Payroll and Benefit Division) for more information.", { icon: "warning" });
            //$('#id_datebrk').click();
            s.ddl_leave_type = ""
            return_val = false;
        }

        try
        {
            var ss_date = ""
            var ee_date = ""
            var data    = []
            s.div_cto   = false;
            if (s.ddl_leave_type == "CTO")
            {
                if (s.save_mode == "ADD")
                {
                    if (s.datalistgrid2.length <= 1)
                    {
                        s.datalistgrid2 = [];


                        ss_date = s.start_date;
                        ee_date = s.end_date;
                        
                        data =
                        {
                            leave_date_from         : ss_date
                            , leave_date_to         : ee_date
                            , date_num_day          : s.total_equiv_tot * 1
                            , date_num_day_total    : s.total_equiv_tot * 8
                            , cto_remarks           : s.txtb_cto_remarks
                        };

                        s.datalistgrid2.push(data);
                        s.oTable2.fnClearTable();
                        s.oTable2.fnAddData(s.datalistgrid2);
                        
                    }
                }

                s.div_cto           = true;
                s.txtb_day_equiv    = "1";
                s.lbl_days_hrs_equi = "Days Equivalent:"
                s.day_num_day_total_func();
            }
            
            h.post("../cSSLeaveAppl/GetLeaveSubType",
            {
                  par_leave_type  : s.ddl_leave_type
                , par_empl_id     : s.txtb_empl_id
                , par_year        : s.txtb_year_selected
            }).then(function (d) {
                if (d.data.message == "success")
                {
                    if (s.save_mode == "ADD" || s.save_mode == "EDIT")
                    {
                        $('#ddl_leave_type option:selected').val() == "" || $('#ddl_leave_type option:selected').val() != "SL" ? s.dis_bal_inputs = true : s.dis_bal_inputs = false;

                        // Current balannce
                        if ($('#ddl_leave_type option:selected').val() != "") {
                            s.txtb_current_bal = d.data.current_balance.leaveledger_balance_current

                        }

                    }

                    s.ddl_leave_type_descr = $('#ddl_leave_type option:selected').text()
                    d.data.leaveSubLst.length > 0 ? s.dis_leavesubtype = false : s.dis_leavesubtype = true;
                    s.leave_sub_type = d.data.leaveSubLst;
                    s.leave_oth_info = d.data.leave_oth_info

                    // **************************************************************************
                    // *** Display the Radio button, checkboxes for Sick leave and Vacatio Leave
                    // **************************************************************************
                    if ($('#ddl_leave_type option:selected').val() == "SL") {
                        $('#slvl_radio0').removeClass('sl-vl-radio-display-none');
                        $('#slvl_radio1').removeClass('sl-vl-radio-display-none');
                        $('#txtb_specify_div').removeClass('sl-vl-radio-display-none');
                        $('#slvl_radio0_text').html('Out Patient');
                        $('#slvl_radio1_text').html('In Hospital');
                    }
                    else if ($('#ddl_leave_type option:selected').val() == "VL") {
                        $('#slvl_radio0').removeClass('sl-vl-radio-display-none');
                        $('#slvl_radio1').removeClass('sl-vl-radio-display-none');
                        $('#txtb_specify_div').removeClass('sl-vl-radio-display-none');
                        $('#slvl_radio0_text').html('Within Philippines');
                        $('#slvl_radio1_text').html('Abroad');
                    }
                    // ************************************************************** 
                    else if ($('#ddl_leave_type option:selected').val() == "FL" || $('#ddl_leave_type option:selected').val() == "SP") {
                        $('#slvl_radio0').removeClass('sl-vl-radio-display-none');
                        $('#slvl_radio1').removeClass('sl-vl-radio-display-none');
                        $('#txtb_specify_div').removeClass('sl-vl-radio-display-none');
                        $('#slvl_radio0_text').html('Within Philippines');
                        $('#slvl_radio1_text').html('Abroad');
                    }
                    // ************************************************************** 
                    else {
                        $('#slvl_radio0').addClass('sl-vl-radio-display-none');
                        $('#slvl_radio1').addClass('sl-vl-radio-display-none');
                        $('#txtb_specify_div').addClass('sl-vl-radio-display-none');
                        $('#slvl_radio0_text').html('');
                        $('#slvl_radio1_text').html('');
                    }
                    // **************************************************************************
                    // **************************************************************************

                    s.leave_computation_edited();
                }
                else if (d.data.message == "no-fl-plan")
                {
                    // ***************************************************************************************************
                    // *** - 2022-06-03 03:48PM - Force Leave Validation, user cannot apply FL without FL Plan 
                    // ***************************************************************************************************
                    swal("You cannot save this Application!", d.data.message_descr2 , { icon: "warning" })
                    s.ddl_leave_type = "";
                    // ***************************************************************************************************
                }
                else
                {
                    swal({ icon: "warning", title: d.data.message });
                }
            });
        }
        catch (err)
        {
            swal({ icon: "warning", title: err.message });
        }
    }
    //*********************************************//
    //*** Select Leave Type **********************//
    //********************************************// 
    s.leave_computation_edited = function() {
        try
        {
            s.sl_less_this_leave  = "0.000";
            s.vl_less_this_leave  = "0.000";
            s.sp_less_this_leave  = "0.000";
            s.fl_less_this_leave  = "0.000";
            s.oth_less_this_leave = "0.000";
            s.cto_less_this_leave = "0.00";
            
            if ($("#ddl_leave_type option:selected").val() != "")
            {
                if ($("#ddl_leave_type option:selected").val() == "VL")
                {
                    s.vl_less_this_leave = s.total_equiv_tot;
                }
                if ($("#ddl_leave_type option:selected").val() == "FL")
                {
                    s.vl_less_this_leave = s.total_equiv_tot;
                    s.fl_less_this_leave = s.total_equiv_tot;
                }
                else if ($("#ddl_leave_type option:selected").val() == "SL")
                {
                    // s.sl_less_this_leave = s.total_equiv_tot;

                    if (s.total_equiv_tot > s.sl_current_balance)
                    {
                        s.sl_less_this_leave = s.sl_current_balance;
                        s.vl_less_this_leave = ((s.sl_current_balance - s.total_equiv_tot) * -1);
                    }
                    else
                    {
                        s.sl_less_this_leave = s.total_equiv_tot;
                    }

                }
                else if ($("#ddl_leave_type option:selected").val() == "SP")
                {
                    s.sp_less_this_leave = s.total_equiv_tot;
                }
                if ($("#ddl_leave_type option:selected").val() == "CTO")
                {
                    s.cto_less_this_leave = s.total_equiv_tot;
                }
            }

            var sl_bal  = (parseFloat(s.sl_current_balance)  - parseFloat(s.sl_less_this_leave)).toFixed(3);
            var vl_bal  = (parseFloat(s.vl_current_balance)  - parseFloat(s.vl_less_this_leave)).toFixed(3);
            var sp_bal  = (parseFloat(s.sp_current_balance)  - parseFloat(s.sp_less_this_leave)).toFixed(3);
            var fl_bal  = (parseFloat(s.fl_current_balance)  - parseFloat(s.fl_less_this_leave)).toFixed(3);
            var cto_bal = (parseFloat(s.cto_current_balance) - parseFloat(s.cto_less_this_leave)).toFixed(3);

            $("#sl_leave_bal").text(sl_bal);
            $("#vl_leave_bal").text(vl_bal);
            $("#sp_leave_bal").text(sp_bal);
            $("#fl_leave_bal").text(fl_bal);
            $("#cto_leave_bal").text(cto_bal);
            
        }
        catch (err)
        {
            swal({ icon: "warning", title: err.message });
        }
    }
    //*********************************************//
    //*** Filter Page Grid ***********************//
    //********************************************// 
    s.FilterPageGrid = function ()
    {
        try
        {
            var var_empl_id = "";
            var_empl_id = $('#ddl_name option:selected').val().toString().trim();
            if ($('#ddl_name option:selected').val().toString().trim() == "")
            {
                var_empl_id = s.txtb_empl_id;
            }

            var temp_year_selected  = $('.fc-center > h2').html();
            s.txtb_year_selected = temp_year_selected.slice(temp_year_selected.length - 4);

            $('#modal_loading').modal({ backdrop: 'static', keyboard: false });
            h.post("../cSSLeaveAppl/FilterPageGrid",
            {
                p_empl_id       : var_empl_id
                , p_appr_status : $('#ddl_status option:selected').val()
                , p_year        : s.txtb_year_selected
            }).then(function (d)
            {
                if (d.data.message == "success")
                {
                    s.holidays_list  = [];
                    s.holidays_list  = d.data.holiDate;
                    s.holidays_list1 = d.data.holiDate;

                    arr_dates = [];
                    // Reinitialize Events
                    $('#calendar').fullCalendar('removeEvents', function (e) {
                        return true;
                    });
                    
                    s.oTable3.fnClearTable();
                    s.datalistgrid3 = d.data.filteredGrid1;

                    if (d.data.filteredGrid1.length > 0)
                    {
                        s.oTable3.fnAddData(d.data.filteredGrid1);
                    }

                    if (d.data.filteredGrid.length > 0)
                    {
                        s.datalistgrid = d.data.filteredGrid;
                        arr_dates = d.data.filteredGrid;
                    }
                    $('#modal_loading').modal("hide");
                    
                    calendar_data();
                }
            });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }
    //*********************************************//
    //*** Open Modal Information *****************//
    //*******************************************// 
    function open_modal() {
        try
        {
            s.show_cancel_button = false;
            s.div_justi_msg         = false;
            justi_flag.checked      = false;
            $('#modal_loading').modal({ backdrop: 'static', keyboard: false });
            s.day_num_day_total_func();
            clearentry();
            s.data_creator      = "true";
            s.resubmit          = "FALSE"
            s.save_mode         = "ADD";
            s.available_leave   = 0;
            s.temp_less_leave   = 0;
            s.showRecall = false;

            s.oTable2.fnDraw();
            s.oTable2.fnClearTable();

            btn = document.getElementById('submit');
            btn.innerHTML = '<i class="fa fa-paper-plane-o"></i> Submit All';
            s.dis_submit = false;

            s.data_history = [];
            $('.popover').popover('hide');
            
            var temp_year_selected = $('.fc-center > h2').html();
            s.txtb_year_selected = temp_year_selected.slice(temp_year_selected.length - 4);

            $("#x0").prop("checked", true)
            if ($("#x0").prop("checked"))
            {
                $("#x1").closest('div').removeClass('checked');
                $("#x0").closest('div').removeClass('checked');
                $("#x0").closest('div').addClass('checked');
            }

            $('#ddl_leave_type option:selected').val() == "" || $('#ddl_leave_type option:selected').val() != "SL" ? s.dis_bal_inputs = true : s.dis_bal_inputs = false;
            
            s.dis_when_s = false;

            h.post("../cSSLeaveAppl/GenerateNewApplNbr",
                {
                    par_empl_id         : $('#ddl_name option:selected').val()
                    , par_year          : s.txtb_year_selected
                    , par_leave_type    : $('#ddl_leave_type option:selected').val()
                }).then(function (d)
                {
                    if (d.data.message == "success")
                    {
                        s.holidays_list = [];
                        for (var x = 0; x < d.data.holiDate.length; x++)
                        {
                            s.holidays_list.push(d.data.holiDate[x].holiday_date)
                        }
                        
                        s.txtb_appl_nbr         = d.data.new_appl_nbr[0];
                        s.txtb_date_applied     = moment(new Date()).format('YYYY-MM-DD');
                        s.txtb_date_bal_asof     = moment(new Date()).format('YYYY-MM-DD');
                        s.txtb_approval_status  = "New";
                        s.txtb_empl_name        = $('#ddl_name option:selected').html();
                        s.txtb_empl_id          = $('#ddl_name option:selected').val();
                        s.ModalTitle            = "Add New Record";
                        s.isEdit                = false;
                        s.dis_plan_date         = false;
                        s.show_cancel           = false;
                        s.dis_leavetype_inputs  = false;

                        btn = document.getElementById('add');
                        btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Apply';
                        
                        var s_date = s.start_date;
                        var e_date = s.end_date;
                        
                        if (s.tot_nbr_days > 0)
                        {
                            var data =
                            {
                                leave_date_from         : s_date
                                , leave_date_to         : e_date
                                , date_num_day          : "1"
                                , date_num_day_total    : s.tot_nbr_days
                            }
                            s.start_date = s_date
                            s.datalistgrid2.push(data)
                            s.oTable2.fnClearTable();
                            s.oTable2.fnAddData(s.datalistgrid2);
                        }
                        
                        s.selectLeaveType();
                        
                        s.cto_current_balance   = d.data.cto_balance[0].leaveledger_balance_current;
                        s.vl_current_balance    = d.data.vl_current_balance[0].leaveledger_balance_current;
                        s.sl_current_balance    = d.data.sl_current_balance[0].leaveledger_balance_current;
                        s.sp_current_balance    = d.data.sp_current_balance[0].leaveledger_balance_current;
                        s.fl_current_balance    = d.data.fl_current_balance[0].leaveledger_balance_current;

                        setTimeout(function ()
                        {
                            $('#tab-1').click();
                            btn.innerHTML = '<i class="fa fa-plus-circle"> </i> Apply';
                            $('#modal_loading').modal("hide");
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
    //********* Open Add Modal ***********//
    //************************************//
    s.btn_open_modal = function () {
        try
        {
            s.show_refresh_bal = true;
            s.datalistgrid2 = [];
            s.oTable2.fnClearTable();
            s.oTable2.fnAddData(s.datalistgrid2);
            
            s.temp_approval_status = "N";

            if (s.log_in_as_AO == true)
            {
                if (ValidateFields2())
                {
                    s.tot_nbr_days = 0;
                    open_modal();
                }
            }
            else
            {
                s.tot_nbr_days = 0;
                open_modal();
            }
        }
        catch (err)
        {
            swal({ icon: "warning", title: err.message });
        }
    }
    //************************************//
    //********* Add Force Leave ***********//
    //************************************//
    s.add_force_leave = function () {
        try
        {
            clearentry2();
            s.temp_approval_status  = "N";
            btn                     = document.getElementById('submit');
            btn.innerHTML           = '<i class="fa fa-paper-plane-o"></i> Submit';
            s.div_justi_msg         = false;
            justi_flag.checked      = false;
            s.dis_edit              = false;
            s.dis_submit            = false;
            s.dis_plan_date         = false;

            if (s.log_in_as_AO == true)
            {
                if (ValidateFields2())
                {
                    s.oTable2.fnClearTable();
                    s.datalistgrid2 = [];
                    s.oTable2.fnAddData([]);
                    open_modal();
                }
            }
            else
            {
                s.oTable2.fnClearTable();
                s.datalistgrid2 = [];
                s.oTable2.fnAddData([]);
                open_modal();
            }
        }
        catch (err)
        {
            swal({ icon: "warning", title: err.message });
        }
    }

    s.btn_open_dtl_modal = function ()
    {
        clearentry2();

        s.show_btn_add_date = true;
        $('#leave_dtl_modal').modal({ backdrop: 'static', keyboard: false });
    }
    //************************************//
    //***  Add Dates to datalistgrid2
    //************************************//
    s.btn_add_date = function ()
    {
        try 
        {
            if (ValidateFields3())
            {
                if (Check_Between_Dates($('#start').val(), $('#end').val()) == false) {
                    var e_date      = new Date(moment($('#end').val()).format('YYYY-MM-DD'));
                    var s_date      = new Date(moment($('#start').val()).format('YYYY-MM-DD'));
                    var date_diff   = new Date(e_date - s_date);
                    s.tot_nbr_days  = date_diff / 1000 / 60 / 60 / 24;

                    var ss_date = moment($('#start').val()).format('YYYY-MM-DD');
                    var ee_date = moment($('#end').val()).format('YYYY-MM-DD');
                    
                    var data =
                    {
                        leave_date_from    : ss_date
                        ,leave_date_to     : ee_date
                        ,date_num_day      : $("#txtb_day_equiv").val()
                        ,date_num_day_total: $("#txtb_day_equiv_tot").val()
                    }
                    

                    s.datalistgrid2.push(data)
                    s.oTable2.fnClearTable();
                    s.oTable2.fnAddData(s.datalistgrid2);
                    
                    $('#datalist_grid2').removeClass('selected');
                    var table = $('#datalist_grid2').DataTable();
                    table.rows((s.datalistgrid2.length - 1))
                        .nodes()
                        .to$()
                        .addClass('selected');
                    
                    s.selectLeaveType();
                    s.leave_computation_edited();

                    clearentry2();

                    setTimeout(function () {
                        $('#datalist_grid2').removeClass('selected');
                    }, 300);

                    $('#leave_dtl_modal').modal("hide");
                }
            }
        }
        catch (err)
        {
            swal({ icon: "warning", title: err.message });
        }
    }
    //************************************// 
    //*** Submit and Resubmit Record
    //**********************************// 
    s.btn_submit_click = function () {
        try
        {
            var temp_year_selected  = $('.fc-center > h2').html();
            s.txtb_year_selected    = temp_year_selected.slice(temp_year_selected.length - 4);

            s.leave_computation_edited();
            if (ValidateFields())
            {
                if (($('#ddl_leave_type option:selected').val() == "FL"  && (parseFloat(s.fl_current_balance)   <= 0 || parseFloat($('#fl_leave_bal').text())  < 0)) ||
                    ($('#ddl_leave_type option:selected').val() == "SP"  && (parseFloat(s.sp_current_balance)   <= 0 || parseFloat($('#sp_leave_bal').text())  < 0)) ||
                    ($('#ddl_leave_type option:selected').val() == "CTO" && (parseFloat(s.cto_current_balance) <= 0 || parseFloat($('#cto_leave_bal').text()) < 0)) ||
                    ($('#ddl_leave_type option:selected').val() == "PL" && (parseFloat(s.txtb_current_bal) <= 0 || parseFloat($('#txtb_current_bal').text()) < 0)) ||
                    ($('#ddl_leave_type option:selected').val() == "PS" && (parseFloat(s.txtb_current_bal) <= 0 || parseFloat($('#txtb_current_bal').text()) < 0)) ||
                    ($('#ddl_leave_type option:selected').val() == "SP" && (parseFloat(s.txtb_current_bal) <= 0 || parseFloat($('#txtb_current_bal').text()) < 0)) 
                )
                {
                    swal("Could not save this application!" + " " + $('#ddl_leave_type option:selected').text(), { icon: "warning", title: "Insufficient Balance for" + " " + $('#ddl_leave_type option:selected').text() });
                }
                else if ($('#ddl_leave_type option:selected').val() != "CTO" && parseFloat(s.total_equiv_tot) < 1) 
                {
                    swal("Could not save this application!" + " " + $('#ddl_leave_type option:selected').text(), { icon: "warning", title: "You cannot Apply below 1 day for" + " " + $('#ddl_leave_type option:selected').text() });
                }
                else
                {
                    if (s.resubmit == "TRUE")
                    {
                        btn = document.getElementById('submit');
                        btn.innerHTML   = '<i class = "fa fa-spinner fa-spin"></i> Resubmit';
                        var oth         = 0;
                        var oth_bal     = 0;
                        if ($('#ddl_leave_type option:selected').val() != "VL" &&
                            $('#ddl_leave_type option:selected').val() != "SL" &&
                            $('#ddl_leave_type option:selected').val() != "SP" &&
                            $('#ddl_leave_type option:selected').val() != "FL")
                        {
                            oth     = s.total_equiv_tot;
                            oth_bal = s.txtb_current_bal
                        }

                        if ($('#ddl_leave_type option:selected').val() == "CTO")
                        {
                            oth_bal = $('#cto_current_balance').val()
                        }
                            var data2 = [];
                            var data =
                            {
                                leave_ctrlno                    : s.edit_leave_ctrlno
                                , empl_id                       : s.txtb_empl_id
                                , date_applied                  : $("#txtb_date_applied").val()
                                , leave_comments                : $('#txtb_comments').val()
                                , leave_type_code               : $('#ddl_leave_type option:selected').val()
                                , leave_subtype_code            : $('#ddl_leave_sub_type option:selected').val()
                                , number_of_days                : s.total_equiv_tot
                                , leaveledger_date              : $("#txtb_date_bal_asof").val()
                                , leaveledger_balance_as_of_sl  : $('#sl_current_balance').val()
                                , leaveledger_balance_as_of_vl  : $('#vl_current_balance').val()
                                , leaveledger_balance_as_of_sp  : $('#sp_current_balance').val()
                                , leaveledger_balance_as_of_fl  : $('#fl_current_balance').val()
                                //, leaveledger_balance_as_of_oth : oth_bal
                                , leaveledger_balance_as_of_oth: $('#cto_current_balance').val()
                                , sl_restore_deduct             : $('#sl_less_this_leave').val()
                                , vl_restore_deduct             : $('#vl_less_this_leave').val()
                                , sp_restore_deduct             : $('#sp_less_this_leave').val()
                                , fl_restore_deduct             : $('#fl_less_this_leave').val()
                                , oth_restore_deduct            : oth
                                , leave_class: $('#ddl_leave_type option:selected').val() == "SL" || $('#ddl_leave_type option:selected').val() == "VL" || $('#ddl_leave_type option:selected').val() == "FL" ? ($("input[type='radio'][name='sl_vl']:checked").val() == "0" ? false : true) : ""
                                , leave_descr                   : $('#txtb_specify').val()
                                , approval_status               : "S"
                                , approval_id                   : s.edit_approval_id
                            }

                            for (var x = 0; x < s.datalistgrid2.length; x++)
                            {
                                if (s.datalistgrid2[x].rcrd_status != "L") {
                                    data2.push({
                                        leave_ctrlno            : data.leave_ctrlno
                                        , leave_date_from       : s.datalistgrid2[x].leave_date_from
                                        , leave_date_to         : s.datalistgrid2[x].leave_date_to
                                        , date_num_day          : s.datalistgrid2[x].date_num_day
                                        , date_num_day_total    : s.datalistgrid2[x].date_num_day_total
                                        , empl_id               : data.empl_id
                                        , rcrd_status           : data.approval_status
                                    });
                                }
                            }

                            var data3 = [];
                            if ($('#ddl_leave_type option:selected').val() == "CTO")
                            {
                                for (var x = 0; x < s.datalistgrid2.length; x++) {
                                    data3.push({
                                        leave_ctrlno        : data.leave_ctrlno
                                        , leave_date_from   : s.datalistgrid2[x].leave_date_from
                                        , leave_date_to     : s.datalistgrid2[x].leave_date_to
                                        , cto_remarks       : s.datalistgrid2[x].cto_remarks
                                    });
                                }
                            }

                        h.post("../cSSLeaveAppl/GenerateNewApplNbr",
                            {
                                par_empl_id     : s.txtb_empl_id
                                ,par_year       : s.txtb_year_selected
                                ,par_leave_type : $('#ddl_leave_type option:selected').val()
                            }).then(function (d)
                            {
                                if (d.data.message == "success")
                                {
                                    h.post("../cSSLeaveAppl/CheckAndContinue", {data2: data2,data:data}).then(function (x)
                                    {
                                        if (x.data.message_flag == "Y")
                                        {
                                            swal(x.data.message_descr, x.data.message_descr2, {
                                                icon: "warning",
                                                buttons:
                                                {
                                                    defeat:
                                                    {
                                                        value: "defeat",
                                                        text: "Close",
                                                        className: "btn-danger"
                                                    },
                                                    continue_anyway: {
                                                        text: "OK, Continue Anyway",
                                                        value: "continue_anyway"
                                                    }
                                                }
                                            }).then((value) => {
                                                switch (value) {
                                                    case "continue_anyway":
                                                        h.post("../cSSLeaveAppl/CheckExist", { data2: data2, data: data, data3: data3, p_action_mode: "RESUBMIT", par_year: s.txtb_year_selected }).then(function (d) {
                                                            if (d.data.message == "" || d.data.message == null)
                                                            {
                                                                h.post("../cSSLeaveAppl/ReSubmitAll", {
                                                                    data: data
                                                                    , data2: data2
                                                                    , data3: data3
                                                                }).then(function (d) {
                                                                    if (d.data.message == "success") {
                                                                        s.FilterPageGrid();
                                                                        $('#main_modal').modal("hide");
                                                                        swal("Current Record has been Successfully Resubmitted!", { icon: "success", title: "Successfully Resubmitted!" });
                                                                    }
                                                                    else {
                                                                        swal(d.data.message, { icon: "warning", });
                                                                    }
                                                                });
                                                            }
                                                            //else if (d.data.message == "confim_save")
                                                            //{
                                                            //        if (d.data.message_descr != "") {
                                                            //            swal($("#ddl_leave_type option:selected").text() + d.data.message_descr2, d.data.message_descr, {
                                                            //                icon: "warning",
                                                            //                buttons: {

                                                            //                    defeat: {
                                                            //                        value: "defeat",
                                                            //                        text: "Close",
                                                            //                        className: "btn-danger"
                                                            //                    },
                                                            //                    continue_anyway: {
                                                            //                        text: "OK, Continue and Submit Anyway",
                                                            //                        value: "continue_anyway",
                                                            //                    },
                                                            //                },
                                                            //            }).then((value) => {
                                                            //                switch (value) {
                                                            //                    case "continue_anyway":
                                                            //                        h.post("../cSSLeaveAppl/Save2", {
                                                            //                             data   : data
                                                            //                            ,data2  : data2
                                                            //                            ,data3  : data3
                                                            //                        }).then(function (d) {
                                                            //                            if (d.data.message == "success")
                                                            //                            {
                                                            //                                s.FilterPageGrid();
                                                            //                                $('#main_modal').modal("hide");
                                                            //                                swal("New Record has been Successfully Submitted!", { icon: "success", title: "Successfully Submitted!" });
                                                            //                            }
                                                            //                            else
                                                            //                            {
                                                            //                                swal(d.data.message, { icon: "warning", });
                                                            //                            }
                                                            //                        });
                                                            //                        break;

                                                            //                    default:
                                                            //                        swal("Cancel Request!", "Your Request is already Cancelled!", { icon: "warning" });
                                                            //                }
                                                            //            });

                                                            //        }
                                                            //    }
                                                            else if (d.data.message == "cto_validation") {
                                                                if (d.data.message_descr != "") {
                                                                    swal("You cannot save this Application!", $("#ddl_leave_type option:selected").text() + d.data.message_descr2 + ' \n \n ' + d.data.message_descr, { icon: "warning" })
                                                                }
                                                            }
                                                            else if (d.data.message == "fl_validation") {
                                                                if (d.data.message_descr != "") {
                                                                    swal("You cannot save this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr + '\n \n' + 'HRIS update validation DateTime: - 2022-06-24 11:50AM \n Effective: June 24, 2022', { icon: "warning" })
                                                                }
                                                            }

                                                            else if (d.data.message == "5_adv_validation") {
                                                                if (d.data.message_descr != "") {
                                                                    swal("You cannot save this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr + '\n \n' + 'HRIS update validation DateTime: - August 12, 2022 11:58AM \n Effective: August 15, 2022', { icon: "warning" })
                                                                }
                                                            }
                                                            else if (d.data.message == "timesked_validation") {
                                                                if (d.data.message_descr != "") {
                                                                    swal("You cannot save this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr + '\n \n' + 'HRIS update validation DateTime: - August 12, 2022 11:58AM \n Effective: August 15, 2022', { icon: "warning" })
                                                                }
                                                            }
                                                            //else if (d.data.message == "no-december")
                                                            //{
                                                            //    if (d.data.message_descr != "") {
                                                            //        swal("You cannot save this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr , { icon: "warning" })
                                                            //    }
                                                            //}
                                                            else if (d.data.message == "no-fl-plan-report" || d.data.message == "no-fl-plan" || d.data.message == "fl-override" || d.data.message == "unequal-balances") {
                                                                if (d.data.message_descr != "") {
                                                                    swal("You cannot continue this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr , { icon: "warning" })
                                                                }
                                                            }
                                                            else {
                                                                swal(d.data.message, { icon: "warning", title: "Already set a schedule for this date!" });
                                                            }
                                                        });
                                                        btn.innerHTML = '<i class="fa fa-paper-plane-o"> </i> Submit';
                                                        break;
                                                    default:
                                                        swal("Cancel Request!", "Your Request is already Cancelled!", { icon: "warning" });
                                                }
                                            });
                                        }
                                        else
                                        {
                                            h.post("../cSSLeaveAppl/CheckExist", { data2: data2, data: data, data3: data3, p_action_mode: "RESUBMIT", par_year: s.txtb_year_selected }).then(function (d)
                                            {
                                                    if (d.data.message == "" || d.data.message == null)
                                                    {
                                                        h.post("../cSSLeaveAppl/ReSubmitAll", {
                                                            data    : data
                                                            ,data2  : data2
                                                            ,data3  : data3
                                                        }).then(function (d) {
                                                            if (d.data.message == "success")
                                                            {
                                                                s.FilterPageGrid();
                                                                $('#main_modal').modal("hide");
                                                                swal("Current Record has been Successfully Resubmitted!", { icon: "success", title: "Successfully Resubmitted!" });
                                                            }
                                                            else {
                                                                swal(d.data.message, { icon: "warning", });
                                                            }
                                                        });
                                                    }
                                                    //else if (d.data.message == "confim_save")
                                                    //{
                                                    //        if (d.data.message_descr != "") {
                                                    //            swal($("#ddl_leave_type option:selected").text() + d.data.message_descr2, d.data.message_descr, {
                                                    //                icon: "warning",
                                                    //                buttons: {

                                                    //                    defeat: {
                                                    //                        value: "defeat",
                                                    //                        text: "Close",
                                                    //                        className: "btn-danger"
                                                    //                    },
                                                    //                    continue_anyway: {
                                                    //                        text: "OK, Continue and Submit Anyway",
                                                    //                        value: "continue_anyway",
                                                    //                    },
                                                    //                },
                                                    //            }).then((value) => {
                                                    //                switch (value) {
                                                    //                    case "continue_anyway":
                                                    //                        h.post("../cSSLeaveAppl/Save2", {
                                                    //                             data   : data
                                                    //                            ,data2  : data2
                                                    //                            ,data3  : data3
                                                    //                        }).then(function (d) {
                                                    //                            if (d.data.message == "success")
                                                    //                            {
                                                    //                                s.FilterPageGrid();
                                                    //                                $('#main_modal').modal("hide");
                                                    //                                swal("New Record has been Successfully Submitted!", { icon: "success", title: "Successfully Submitted!" });
                                                    //                            }
                                                    //                            else
                                                    //                            {
                                                    //                                swal(d.data.message, { icon: "warning", });
                                                    //                            }
                                                    //                        });
                                                    //                        break;

                                                    //                    default:
                                                    //                        swal("Cancel Request!", "Your Request is already Cancelled!", { icon: "warning" });
                                                    //                }
                                                    //            });

                                                    //        }
                                                    //    }
                                                        else if (d.data.message == "cto_validation")
                                                        {
                                                            if (d.data.message_descr != "") {
                                                                swal("You cannot save this Application!", $("#ddl_leave_type option:selected").text() + d.data.message_descr2 + ' \n \n ' + d.data.message_descr, { icon: "warning" })
                                                            }
                                                        }
                                                        else if (d.data.message == "fl_validation") {
                                                            if (d.data.message_descr != "") {
                                                                swal("You cannot save this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr + '\n \n' + 'HRIS update validation DateTime: - 2022-06-24 11:50AM \n Effective: June 24, 2022', { icon: "warning" })
                                                            }
                                                        }

                                                        else if (d.data.message == "5_adv_validation") {
                                                            if (d.data.message_descr != "") {
                                                                swal("You cannot save this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr + '\n \n' + 'HRIS update validation DateTime: - August 12, 2022 11:58AM \n Effective: August 15, 2022', { icon: "warning" })
                                                            }
                                                        }
                                                        else if (d.data.message == "timesked_validation") {
                                                                if (d.data.message_descr != "") {
                                                                    swal("You cannot save this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr + '\n \n' + 'HRIS update validation DateTime: - August 12, 2022 11:58AM \n Effective: August 15, 2022', { icon: "warning" })
                                                                }
                                                        }
                                                    //    else if (d.data.message == "no-december") {
                                                    //        if (d.data.message_descr != "") {
                                                    //            swal("You cannot save this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr , { icon: "warning" })
                                                    //        }
                                                    //}
                                                    else if (d.data.message == "no-fl-plan-report" || d.data.message == "no-fl-plan" || d.data.message == "fl-override" || d.data.message == "unequal-balances") {
                                                        if (d.data.message_descr != "") {
                                                            swal("You cannot continue this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr , { icon: "warning" })
                                                        }
                                                    }
                                                        else
                                                        {
                                                            swal(d.data.message, { icon: "warning", title: "Already set a schedule for this date!" });
                                                        }
                                                });
                                                btn.innerHTML = '<i class="fa fa-paper-plane-o"> </i> Submit';
                                        }
                                    })
                                }
                                else
                                {
                                    swal(d.data.message, { icon: "warning", });
                                }
                            });
                    }
                    else
                    {
                        if (s.datalistgrid2.length > 0)
                        {
                            h.post("../cSSLeaveAppl/GenerateNewApplNbr", {
                                par_empl_id     : s.txtb_empl_id
                                , par_year      : s.txtb_year_selected
                                , par_leave_type: $('#ddl_leave_type option:selected').val()
                            }).then(function (d)
                            {
                                if (d.data.message == "success")
                                {
                                    var data2 = [];
                                    if (s.save_mode == "ADD")
                                    {
                                            btn = document.getElementById('submit');
                                            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Submit';

                                            var oth     = 0;
                                            var oth_bal = 0;
                                            if ($('#ddl_leave_type option:selected').val() != "VL" &&
                                                $('#ddl_leave_type option:selected').val() != "SL" &&
                                                $('#ddl_leave_type option:selected').val() != "SP" &&
                                                $('#ddl_leave_type option:selected').val() != "FL")
                                            {
                                                oth     = s.total_equiv_tot;
                                                oth_bal = s.txtb_current_bal
                                            }

                                            if ($('#ddl_leave_type option:selected').val() == "CTO") {
                                                oth_bal = $('#cto_current_balance').val()
                                            }

                                            var data =
                                            {
                                                leave_ctrlno                    : d.data.new_appl_nbr[0]
                                                , empl_id                       : s.txtb_empl_id
                                                , date_applied                  : $("#txtb_date_applied").val()
                                                , leave_comments                : $('#txtb_comments').val()
                                                , leave_type_code               : $('#ddl_leave_type option:selected').val()
                                                , leave_subtype_code            : $('#ddl_leave_sub_type option:selected').val()
                                                , number_of_days                : s.total_equiv_tot
                                                , leaveledger_date              : $("#txtb_date_bal_asof").val()
                                                , leaveledger_balance_as_of_sl  : $('#sl_current_balance').val()
                                                , leaveledger_balance_as_of_vl  : $('#vl_current_balance').val()
                                                , leaveledger_balance_as_of_sp  : $('#sp_current_balance').val()
                                                , leaveledger_balance_as_of_fl  : $('#fl_current_balance').val()
                                                //, leaveledger_balance_as_of_oth : oth_bal
                                                , leaveledger_balance_as_of_oth: $('#cto_current_balance').val()
                                                , sl_restore_deduct             : $('#sl_less_this_leave').val()
                                                , vl_restore_deduct             : $('#vl_less_this_leave').val()
                                                , sp_restore_deduct             : $('#sp_less_this_leave').val()
                                                , fl_restore_deduct             : $('#fl_less_this_leave').val()
                                                , oth_restore_deduct            : oth
                                                , leave_class                   : $('#ddl_leave_type option:selected').val() == "SL" || $('#ddl_leave_type option:selected').val() == "VL" || $('#ddl_leave_type option:selected').val() == "FL" ? ($("input[type='radio'][name='sl_vl']:checked").val() == "0" ? false : true) : ""
                                                , leave_descr                   : $('#txtb_specify').val()
                                                , details_remarks               : ""
                                                , approval_status               : "S"
                                                , posting_status                : 0
                                                , justification_flag            : justi_flag.checked
                                                , commutation                   : $('#commutation').val()
                                            }

                                            for (var x = 0; x < s.datalistgrid2.length; x++) {
                                                data2.push({
                                                    leave_ctrlno            : data.leave_ctrlno
                                                    , leave_date_from       : s.datalistgrid2[x].leave_date_from
                                                    , leave_date_to         : s.datalistgrid2[x].leave_date_to
                                                    , date_num_day          : s.datalistgrid2[x].date_num_day
                                                    , date_num_day_total    : s.datalistgrid2[x].date_num_day_total
                                                    , empl_id               : data.empl_id
                                                    , rcrd_status           : data.approval_status
                                                });
                                            }

                                            var data3 = [];
                                            if ($('#ddl_leave_type option:selected').val() == "CTO")
                                            {
                                                for (var x = 0; x < s.datalistgrid2.length; x++) {
                                                    data3.push({
                                                        leave_ctrlno        : data.leave_ctrlno
                                                        , leave_date_from   : s.datalistgrid2[x].leave_date_from
                                                        , leave_date_to     : s.datalistgrid2[x].leave_date_to
                                                        , cto_remarks       : s.datalistgrid2[x].cto_remarks
                                                    });
                                                }
                                        }

                                        h.post("../cSSLeaveAppl/CheckAndContinue", { data2: data2, data: data }).then(function (x)
                                        {
                                            if (x.data.message_flag == "Y") {
                                                swal(x.data.message_descr, x.data.message_descr2,
                                                    {
                                                        icon: "warning",
                                                        buttons: {
                                                            defeat: {
                                                                value: "defeat",
                                                                text: "Close",
                                                                className: "btn-danger"
                                                            },
                                                            continue_anyway: {
                                                                text: "OK, Continue Anyway",
                                                                value: "continue_anyway"
                                                            }
                                                        }
                                                    }).then((value) => {
                                                        switch (value) {
                                                            case "continue_anyway":
                                                                h.post("../cSSLeaveAppl/CheckExist", { data2: data2, data: data, data3: data3, p_action_mode: "SUBMIT", par_year: s.txtb_year_selected }).then(function (d) {
                                                                    if (d.data.message == "" || d.data.message == null) {
                                                                        h.post("../cSSLeaveAppl/Save2", {
                                                                            data: data
                                                                            , data2: data2
                                                                            , data3: data3
                                                                        }).then(function (d) {
                                                                            if (d.data.message == "success") {
                                                                                s.FilterPageGrid();
                                                                                $('#main_modal').modal("hide");
                                                                                swal("New Record has been Successfully Submitted!", { icon: "success", title: "Successfully Submitted!" });
                                                                            }
                                                                            else {
                                                                                swal(d.data.message, { icon: "warning", });
                                                                            }
                                                                        });
                                                                    }
                                                                    //else if (d.data.message == "confim_save")
                                                                    //{
                                                                    //    if (d.data.message_descr != "") {
                                                                    //        swal($("#ddl_leave_type option:selected").text() + d.data.message_descr2, d.data.message_descr, {
                                                                    //            icon: "warning",
                                                                    //            buttons: {

                                                                    //                defeat: {
                                                                    //                    value: "defeat",
                                                                    //                    text: "Close",
                                                                    //                    className: "btn-danger"
                                                                    //                },
                                                                    //                continue_anyway: {
                                                                    //                    text: "OK, Continue and Submit Anyway",
                                                                    //                    value: "continue_anyway",
                                                                    //                },
                                                                    //            },
                                                                    //        }).then((value) => {
                                                                    //            switch (value) {
                                                                    //                case "continue_anyway":
                                                                    //                    h.post("../cSSLeaveAppl/Save2", {
                                                                    //                         data   : data
                                                                    //                        ,data2  : data2
                                                                    //                        ,data3  : data3
                                                                    //                    }).then(function (d) {
                                                                    //                        if (d.data.message == "success")
                                                                    //                        {
                                                                    //                            s.FilterPageGrid();
                                                                    //                            $('#main_modal').modal("hide");
                                                                    //                            swal("New Record has been Successfully Submitted!", { icon: "success", title: "Successfully Submitted!" });
                                                                    //                        }
                                                                    //                        else
                                                                    //                        {
                                                                    //                            swal(d.data.message, { icon: "warning", });
                                                                    //                        }
                                                                    //                    });
                                                                    //                    break;

                                                                    //                default:
                                                                    //                    swal("Cancel Request!", "Your Request is already Cancelled!", { icon: "warning" });
                                                                    //            }
                                                                    //        });

                                                                    //    }
                                                                    //}
                                                                    else if (d.data.message == "cto_validation") {
                                                                        if (d.data.message_descr != "") {
                                                                            swal("You cannot save this Application!", $("#ddl_leave_type option:selected").text() + d.data.message_descr2 + ' \n \n ' + d.data.message_descr, { icon: "warning" })
                                                                        }
                                                                    }
                                                                    else if (d.data.message == "fl_validation") {
                                                                        if (d.data.message_descr != "") {
                                                                            swal("You cannot save this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr + '\n \n' + 'HRIS update validation DateTime: - 2022-06-24 11:50AM \n Effective: June 24, 2022', { icon: "warning" })
                                                                        }
                                                                    }

                                                                    else if (d.data.message == "5_adv_validation") {
                                                                        if (d.data.message_descr != "") {
                                                                            swal("You cannot save this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr + '\n \n' + 'HRIS update validation DateTime: - August 12, 2022 11:58AM \n Effective: August 15, 2022', { icon: "warning" })
                                                                        }
                                                                    }
                                                                    else if (d.data.message == "timesked_validation") {
                                                                        if (d.data.message_descr != "") {
                                                                            swal("You cannot save this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr + '\n \n' + 'HRIS update validation DateTime: - September 09, 2022 10:42AM', { icon: "warning" })
                                                                        }
                                                                    }
                                                                    //else if (d.data.message == "no-december") {
                                                                    //    if (d.data.message_descr != "") {
                                                                    //        swal("You cannot save this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr , { icon: "warning" })
                                                                    //    }
                                                                    //}
                                                                    else if (d.data.message == "no-fl-plan-report" || d.data.message == "no-fl-plan" || d.data.message == "fl-override" || d.data.message == "unequal-balances") {
                                                                        if (d.data.message_descr != "") {
                                                                            swal("You cannot continue this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr , { icon: "warning" })
                                                                        }
                                                                    }
                                                                    else {
                                                                        swal(d.data.message, { icon: "warning", title: "Already set a schedule for this date!" });
                                                                    }
                                                                });
                                                                btn.innerHTML = '<i class="fa fa-paper-plane-o"> </i> Submit';
                                                                break;
                                                            default:
                                                                swal("Cancel Request!", "Your Request is already Cancelled!", { icon: "warning" });
                                                        }
                                                    });

                                            }
                                            else
                                            {
                                                h.post("../cSSLeaveAppl/CheckExist", { data2: data2, data: data, data3: data3, p_action_mode: "SUBMIT", par_year: s.txtb_year_selected }).then(function (d) {
                                                    if (d.data.message == "" || d.data.message == null) {
                                                        h.post("../cSSLeaveAppl/Save2", {
                                                            data: data
                                                            , data2: data2
                                                            , data3: data3
                                                        }).then(function (d) {
                                                            if (d.data.message == "success") {
                                                                s.FilterPageGrid();
                                                                $('#main_modal').modal("hide");
                                                                swal("New Record has been Successfully Submitted!", { icon: "success", title: "Successfully Submitted!" });
                                                            }
                                                            else {
                                                                swal(d.data.message, { icon: "warning", });
                                                            }
                                                        });
                                                    }
                                                    //else if (d.data.message == "confim_save")
                                                    //{
                                                    //    if (d.data.message_descr != "") {
                                                    //        swal($("#ddl_leave_type option:selected").text() + d.data.message_descr2, d.data.message_descr, {
                                                    //            icon: "warning",
                                                    //            buttons: {

                                                    //                defeat: {
                                                    //                    value: "defeat",
                                                    //                    text: "Close",
                                                    //                    className: "btn-danger"
                                                    //                },
                                                    //                continue_anyway: {
                                                    //                    text: "OK, Continue and Submit Anyway",
                                                    //                    value: "continue_anyway",
                                                    //                },
                                                    //            },
                                                    //        }).then((value) => {
                                                    //            switch (value) {
                                                    //                case "continue_anyway":
                                                    //                    h.post("../cSSLeaveAppl/Save2", {
                                                    //                         data   : data
                                                    //                        ,data2  : data2
                                                    //                        ,data3  : data3
                                                    //                    }).then(function (d) {
                                                    //                        if (d.data.message == "success")
                                                    //                        {
                                                    //                            s.FilterPageGrid();
                                                    //                            $('#main_modal').modal("hide");
                                                    //                            swal("New Record has been Successfully Submitted!", { icon: "success", title: "Successfully Submitted!" });
                                                    //                        }
                                                    //                        else
                                                    //                        {
                                                    //                            swal(d.data.message, { icon: "warning", });
                                                    //                        }
                                                    //                    });
                                                    //                    break;

                                                    //                default:
                                                    //                    swal("Cancel Request!", "Your Request is already Cancelled!", { icon: "warning" });
                                                    //            }
                                                    //        });

                                                    //    }
                                                    //}
                                                    else if (d.data.message == "cto_validation") {
                                                        if (d.data.message_descr != "") {
                                                            swal("You cannot save this Application!", $("#ddl_leave_type option:selected").text() + d.data.message_descr2 + ' \n \n ' + d.data.message_descr, { icon: "warning" })
                                                        }
                                                    }
                                                    else if (d.data.message == "fl_validation") {
                                                        if (d.data.message_descr != "") {
                                                            swal("You cannot save this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr + '\n \n' + 'HRIS update validation DateTime: - 2022-06-24 11:50AM \n Effective: June 24, 2022', { icon: "warning" })
                                                        }
                                                    }

                                                    else if (d.data.message == "5_adv_validation") {
                                                        if (d.data.message_descr != "") {
                                                            swal("You cannot save this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr + '\n \n' + 'HRIS update validation DateTime: - August 12, 2022 11:58AM \n Effective: August 15, 2022', { icon: "warning" })
                                                        }
                                                    }
                                                    else if (d.data.message == "timesked_validation") {
                                                        if (d.data.message_descr != "") {
                                                            swal("You cannot save this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr + '\n \n' + 'HRIS update validation DateTime: - August 12, 2022 11:58AM \n Effective: August 15, 2022', { icon: "warning" })
                                                        }
                                                    }
                                                    //else if (d.data.message == "no-december") {
                                                    //    if (d.data.message_descr != "") {
                                                    //        swal("You cannot save this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr , { icon: "warning" })
                                                    //    }
                                                    //}
                                                    else if (d.data.message == "no-fl-plan-report" || d.data.message == "no-fl-plan" || d.data.message == "fl-override" || d.data.message == "unequal-balances") {
                                                        if (d.data.message_descr != "") {
                                                            swal("You cannot continue this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr , { icon: "warning" })
                                                        }
                                                    }
                                                    else {
                                                        swal(d.data.message, { icon: "warning", title: "Already set a schedule for this date!" });
                                                    }
                                                });
                                                btn.innerHTML = '<i class="fa fa-paper-plane-o"> </i> Submit';
                                            }

                                        })   
                                    }
                                    if (s.save_mode == "EDIT")
                                    {
                                        btn = document.getElementById('submit');
                                        btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Submit';

                                        if ((d.data.available_leave[0] + s.getDtlDataLength) >= s.datalistgrid2.length) {
                                            var oth     = 0;
                                            var oth_bal = 0;
                                            if ($('#ddl_leave_type option:selected').val() != "VL" &&
                                                $('#ddl_leave_type option:selected').val() != "SL" &&
                                                $('#ddl_leave_type option:selected').val() != "SP" &&
                                                $('#ddl_leave_type option:selected').val() != "FL")
                                            {
                                                oth     = s.total_equiv_tot;
                                                oth_bal = s.txtb_current_bal
                                            }

                                            if ($('#ddl_leave_type option:selected').val() == "CTO") {
                                                oth_bal = $('#cto_current_balance').val()
                                            }
                                            var data2 = [];
                                            var data =
                                            {
                                                leave_ctrlno                    : s.edit_leave_ctrlno
                                                , empl_id                       : s.txtb_empl_id
                                                , date_applied                  : $("#txtb_date_applied").val()
                                                , leave_comments                : $('#txtb_comments').val()
                                                , leave_type_code               : $('#ddl_leave_type option:selected').val()
                                                , leave_subtype_code            : $('#ddl_leave_sub_type option:selected').val()
                                                , number_of_days                : s.total_equiv_tot
                                                , leaveledger_date              : $("#txtb_date_bal_asof").val()
                                                , leaveledger_balance_as_of_sl  : $('#sl_current_balance').val()
                                                , leaveledger_balance_as_of_vl  : $('#vl_current_balance').val()
                                                , leaveledger_balance_as_of_sp  : $('#sp_current_balance').val()
                                                , leaveledger_balance_as_of_fl  : $('#fl_current_balance').val()
                                                //, leaveledger_balance_as_of_oth : oth_bal
                                                , leaveledger_balance_as_of_oth: $('#cto_current_balance').val()
                                                , sl_restore_deduct             : $('#sl_less_this_leave').val()
                                                , vl_restore_deduct             : $('#vl_less_this_leave').val()
                                                , sp_restore_deduct             : $('#sp_less_this_leave').val()
                                                , fl_restore_deduct             : $('#fl_less_this_leave').val()
                                                , oth_restore_deduct            : oth
                                                , leave_class                   : $('#ddl_leave_type option:selected').val() == "SL" || $('#ddl_leave_type option:selected').val() == "VL" || $('#ddl_leave_type option:selected').val() == "FL" ? ($("input[type='radio'][name='sl_vl']:checked").val() == "0" ? false : true) : ""
                                                , leave_descr                   : $('#txtb_specify').val()
                                                , details_remarks               : ""
                                                , approval_status               : "S"
                                                , posting_status                : 0
                                                , justification_flag            : justi_flag.checked
                                                , commutation                   : $('#commutation').val()
                                            }

                                            for (var x = 0; x < s.datalistgrid2.length; x++)
                                            {
                                                data2.push({
                                                    leave_ctrlno        : data.leave_ctrlno
                                                    , leave_date_from   : s.datalistgrid2[x].leave_date_from
                                                    , leave_date_to     : s.datalistgrid2[x].leave_date_to
                                                    , date_num_day      : s.datalistgrid2[x].date_num_day
                                                    , date_num_day_total: s.datalistgrid2[x].date_num_day_total
                                                    , empl_id           : data.empl_id
                                                    , rcrd_status       : data.approval_status
                                                });
                                            }

                                            var data3 = [];
                                            if ($('#ddl_leave_type option:selected').val() == "CTO")
                                            {
                                                for (var x = 0; x < s.datalistgrid2.length; x++) {
                                                    data3.push({
                                                        leave_ctrlno        : data.leave_ctrlno
                                                        , leave_date_from   : s.datalistgrid2[x].leave_date_from
                                                        , leave_date_to     : s.datalistgrid2[x].leave_date_to
                                                        , cto_remarks       : s.datalistgrid2[x].cto_remarks
                                                    });
                                                }
                                            }

                                            h.post("../cSSLeaveAppl/CheckAndContinue", { data2: data2, data: data }).then(function (x)
                                            {
                                                if (d.data.message_flag == "Y") {
                                                    swal(x.data.message_descr, x.data.message_descr2,
                                                        {
                                                            icon: "warning",
                                                            buttons: {

                                                                defeat: {
                                                                    value: "defeat",
                                                                    text: "Close",
                                                                    className: "btn-danger"
                                                                },
                                                                continue_anyway: {
                                                                    text: "OK, Continue Anyway",
                                                                    value: "continue_anyway"
                                                                }
                                                            }
                                                        }).then((value) => {
                                                            switch (value) {
                                                                case "continue_anyway":
                                                                    h.post("../cSSLeaveAppl/CheckExist", { data2: data2, data: data, data3: data3, p_action_mode: "EDIT", par_year: s.txtb_year_selected }).then(function (d) {
                                                                        if (d.data.message == "" || d.data.message == null) {
                                                                            h.post("../cSSLeaveAppl/SaveSubmit", {
                                                                                data: data
                                                                                , data2: data2
                                                                                , data3: data3
                                                                            }).then(function (d) {
                                                                                if (d.data.message == "success") {
                                                                                    s.FilterPageGrid();
                                                                                    $('#main_modal').modal("hide");
                                                                                    swal("New Record has been Successfully Submitted!", { icon: "success", title: "Successfully Submitted!" });
                                                                                }
                                                                                else {
                                                                                    swal(d.data.message, { icon: "warning", });
                                                                                }
                                                                                btn.innerHTML = '<i class="fa fa-paper-plane-o"> </i> Submit';
                                                                            });
                                                                        }
                                                                        //else if (d.data.message == "confim_save")
                                                                        //{
                                                                        //    if (d.data.message_descr != "") {
                                                                        //        swal($("#ddl_leave_type option:selected").text() + d.data.message_descr2, d.data.message_descr, {
                                                                        //            icon: "warning",
                                                                        //            buttons: {

                                                                        //                defeat: {
                                                                        //                    value: "defeat",
                                                                        //                    text: "Close",
                                                                        //                    className: "btn-danger"
                                                                        //                },
                                                                        //                continue_anyway: {
                                                                        //                    text: "OK, Continue and Submit Anyway",
                                                                        //                    value: "continue_anyway",
                                                                        //                },
                                                                        //            },
                                                                        //        }).then((value) => {
                                                                        //            switch (value) {
                                                                        //                case "continue_anyway":
                                                                        //                    h.post("../cSSLeaveAppl/Save2", {
                                                                        //                        data: data
                                                                        //                        , data2: data2
                                                                        //                        , data3: data3
                                                                        //                    }).then(function (d) {
                                                                        //                        if (d.data.message == "success") {
                                                                        //                            s.FilterPageGrid();
                                                                        //                            $('#main_modal').modal("hide");
                                                                        //                            swal("New Record has been Successfully Submitted!", { icon: "success", title: "Successfully Submitted!" });
                                                                        //                        }
                                                                        //                        else {
                                                                        //                            swal(d.data.message, { icon: "warning", });
                                                                        //                        }
                                                                        //                    });
                                                                        //                    break;

                                                                        //                default:
                                                                        //                    swal("Cancel Request!", "Your Request is already Cancelled!", { icon: "warning" });
                                                                        //            }
                                                                        //        });

                                                                        //    }
                                                                        //}
                                                                        else if (d.data.message == "cto_validation") {
                                                                            if (d.data.message_descr != "") {
                                                                                swal("You cannot save this Application!", $("#ddl_leave_type option:selected").text() + d.data.message_descr2 + ' \n \n ' + d.data.message_descr, { icon: "warning" })
                                                                            }
                                                                        }
                                                                        else if (d.data.message == "fl_validation") {
                                                                            if (d.data.message_descr != "") {
                                                                                swal("You cannot save this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr + '\n \n' + 'HRIS update validation DateTime: - 2022-06-24 11:50AM \n Effective: June 24, 2022', { icon: "warning" })
                                                                            }
                                                                        }

                                                                        else if (d.data.message == "5_adv_validation") {
                                                                            if (d.data.message_descr != "") {
                                                                                swal("You cannot save this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr + '\n \n' + 'HRIS update validation DateTime: - August 12, 2022 11:58AM \n Effective: August 15, 2022', { icon: "warning" })
                                                                            }
                                                                        }
                                                                        else if (d.data.message == "timesked_validation") {
                                                                            if (d.data.message_descr != "") {
                                                                                swal("You cannot save this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr + '\n \n' + 'HRIS update validation DateTime: - August 12, 2022 11:58AM \n Effective: August 15, 2022', { icon: "warning" })
                                                                            }
                                                                        }
                                                                        //else if (d.data.message == "no-december") {
                                                                        //    if (d.data.message_descr != "") {
                                                                        //        swal("You cannot save this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr , { icon: "warning" })
                                                                        //    }
                                                                        //}
                                                                        else if (d.data.message == "no-fl-plan-report" || d.data.message == "no-fl-plan" || d.data.message == "fl-override" || d.data.message == "unequal-balances") {
                                                                            if (d.data.message_descr != "") {
                                                                                swal("You cannot continue this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr , { icon: "warning" })
                                                                            }
                                                                        }
                                                                        else {
                                                                            swal(d.data.message, { icon: "warning", title: "Already set a schedule for this date!" });
                                                                        }
                                                                    });
                                                                    btn.innerHTML = '<i class="fa fa-paper-plane-o"> </i> Submit';
                                                                    break;

                                                                default:
                                                                    swal("Cancel Request!", "Your Request is already Cancelled!", { icon: "warning" });
                                                            }
                                                        });

                                                }
                                                else
                                                {
                                                    h.post("../cSSLeaveAppl/CheckExist", { data2: data2, data: data, data3: data3, p_action_mode: "EDIT", par_year: s.txtb_year_selected }).then(function (d) {
                                                        if (d.data.message == "" || d.data.message == null) {
                                                            h.post("../cSSLeaveAppl/SaveSubmit", {
                                                                data: data
                                                                , data2: data2
                                                                , data3: data3
                                                            }).then(function (d) {
                                                                if (d.data.message == "success") {
                                                                    s.FilterPageGrid();
                                                                    $('#main_modal').modal("hide");
                                                                    swal("New Record has been Successfully Submitted!", { icon: "success", title: "Successfully Submitted!" });
                                                                }
                                                                else {
                                                                    swal(d.data.message, { icon: "warning", });
                                                                }
                                                                btn.innerHTML = '<i class="fa fa-paper-plane-o"> </i> Submit';
                                                            });
                                                        }
                                                        //else if (d.data.message == "confim_save")
                                                        //{
                                                        //    if (d.data.message_descr != "") {
                                                        //        swal($("#ddl_leave_type option:selected").text() + d.data.message_descr2, d.data.message_descr, {
                                                        //            icon: "warning",
                                                        //            buttons: {

                                                        //                defeat: {
                                                        //                    value: "defeat",
                                                        //                    text: "Close",
                                                        //                    className: "btn-danger"
                                                        //                },
                                                        //                continue_anyway: {
                                                        //                    text: "OK, Continue and Submit Anyway",
                                                        //                    value: "continue_anyway",
                                                        //                },
                                                        //            },
                                                        //        }).then((value) => {
                                                        //            switch (value) {
                                                        //                case "continue_anyway":
                                                        //                    h.post("../cSSLeaveAppl/Save2", {
                                                        //                        data: data
                                                        //                        , data2: data2
                                                        //                        , data3: data3
                                                        //                    }).then(function (d) {
                                                        //                        if (d.data.message == "success") {
                                                        //                            s.FilterPageGrid();
                                                        //                            $('#main_modal').modal("hide");
                                                        //                            swal("New Record has been Successfully Submitted!", { icon: "success", title: "Successfully Submitted!" });
                                                        //                        }
                                                        //                        else {
                                                        //                            swal(d.data.message, { icon: "warning", });
                                                        //                        }
                                                        //                    });
                                                        //                    break;

                                                        //                default:
                                                        //                    swal("Cancel Request!", "Your Request is already Cancelled!", { icon: "warning" });
                                                        //            }
                                                        //        });

                                                        //    }
                                                        //}
                                                        else if (d.data.message == "cto_validation") {
                                                            if (d.data.message_descr != "") {
                                                                swal("You cannot save this Application!", $("#ddl_leave_type option:selected").text() + d.data.message_descr2 + ' \n \n ' + d.data.message_descr, { icon: "warning" })
                                                            }
                                                        }
                                                        else if (d.data.message == "fl_validation") {
                                                            if (d.data.message_descr != "") {
                                                                swal("You cannot save this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr + '\n \n' + 'HRIS update validation DateTime: - 2022-06-24 11:50AM \n Effective: June 24, 2022', { icon: "warning" })
                                                            }
                                                        }

                                                        else if (d.data.message == "5_adv_validation") {
                                                            if (d.data.message_descr != "") {
                                                                swal("You cannot save this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr + '\n \n' + 'HRIS update validation DateTime: - August 12, 2022 11:58AM \n Effective: August 15, 2022', { icon: "warning" })
                                                            }
                                                        }
                                                        else if (d.data.message == "timesked_validation") {
                                                            if (d.data.message_descr != "") {
                                                                swal("You cannot save this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr + '\n \n' + 'HRIS update validation DateTime: - August 12, 2022 11:58AM \n Effective: August 15, 2022', { icon: "warning" })
                                                            }
                                                        }
                                                        //else if (d.data.message == "no-december") {
                                                        //    if (d.data.message_descr != "") {
                                                        //        swal("You cannot save this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr , { icon: "warning" })
                                                        //    }
                                                        //}
                                                        else if (d.data.message == "no-fl-plan-report" || d.data.message == "no-fl-plan" || d.data.message == "fl-override" || d.data.message == "unequal-balances" || d.data.message == "unequal-balances") {
                                                            if (d.data.message_descr != "") {
                                                                swal("You cannot continue this Application!", d.data.message_descr2 + ' \n \n ' + d.data.message_descr , { icon: "warning" })
                                                            }
                                                        }
                                                        else {
                                                            swal(d.data.message, { icon: "warning", title: "Already set a schedule for this date!" });
                                                        }
                                                    });
                                                    btn.innerHTML = '<i class="fa fa-paper-plane-o"> </i> Submit';
                                                }
                                            })
                                        }
                                        else
                                        {
                                            swal({ icon: "warning", title: (d.data.available_leave[0] + s.getDtlDataLength) + " slot/s available for this leave." });
                                        }
                                    }
                                }
                                else
                                {
                                    swal(d.data.message, { icon: "warning" });
                                }
                            });
                        }
                        else
                        {
                            $("#lbl_datalist_grid2_req").text("Table is empty, should add date/s before saving.");
                            ValidateFields3();
                        }
                    }
                }
            }
        }
        catch (err)
        {
            swal({ icon: "warning", title: err.message });
        }
    }
    //************************************// 
    //*** Open Edit Modal         
    //**********************************// 
    s.btn_edit_action = function (row_id)
    {
        try
        {
            s.show_cancel_button  = false;

            $('#modal_loading').modal({ backdrop: 'static', keyboard: false });
            s.day_num_day_total_func();
            clearentry();
            clearentry2();
            s.isEdit    = true;
            s.save_mode = "EDIT"
            s.data_history = [];
            if (s.datalistgrid3[row_id].approval_status == "S" ||
                s.datalistgrid3[row_id].approval_status == "R" ||
                s.datalistgrid3[row_id].approval_status == "1" ||
                s.datalistgrid3[row_id].approval_status == "2" ||
                s.datalistgrid3[row_id].approval_status == "F" ||
                s.datalistgrid3[row_id].approval_status == "D" ||
                s.datalistgrid3[row_id].approval_status == "L")
            {
                s.ModalTitle = "View Record Details";
            }
            else
            {
                s.ModalTitle = "Edit Existing Record";
            }

            if ((s.datalistgrid3[row_id].approval_status == "F"
                &&
                (s.datalistgrid3[row_id].posting_status == true ))
                ||
                //(s.datalistgrid3[row_id].leave_type_code == "FL" &&
                (s.datalistgrid3[row_id].approval_status == "N" || s.datalistgrid3[row_id].approval_status == "C")
                //)
            )
            {
                s.show_cancel_button = true;
            }

            s.available_leave = 0;
            var btn = document.getElementById('submit');

            if (s.datalistgrid3[row_id].approval_status == "C")
            {
                btn.innerHTML = '<i class="fa fa-paper-plane-o"></i> Re-Submit All';
                s.resubmit = "TRUE"
            }
            else
            {
                btn.innerHTML = '<i class="fa fa-paper-plane-o"></i> Submit';
                s.resubmit = "FALSE"
            }

            if (s.datalistgrid3[row_id].approval_status == "S") {
                s.showRecall = true;
            }
            else {
                s.showRecall = false;
            }

            s.show_refresh_bal = false;
            if (s.datalistgrid3[row_id].approval_status == "C" ||
                s.datalistgrid3[row_id].approval_status == "N" )
            {
                s.show_refresh_bal = true;
            }
            
            s.temp_row_id           = row_id;
            s.temp_leave_ctrlno     = s.datalistgrid3[row_id].leave_ctrlno;
            s.temp_approval_id      = s.datalistgrid3[row_id].approval_id;
            s.temp_appr_status      = s.datalistgrid3[row_id].approval_status;
            s.edit_leave_ctrlno     = s.datalistgrid3[row_id].leave_ctrlno;
            s.edit_approval_id      = s.datalistgrid3[row_id].approval_id;
            
            s.txtb_appl_nbr         = s.datalistgrid3[row_id].leave_ctrlno;
            s.txtb_date_applied     = s.datalistgrid3[row_id].date_applied;
            s.txtb_approval_status  = s.datalistgrid3[row_id].approval_status_descr;
            s.txtb_empl_name        = s.datalistgrid3[row_id].employee_name;
            s.txtb_empl_id          = s.datalistgrid3[row_id].empl_id;
            s.ddl_leave_type        = s.datalistgrid3[row_id].leave_type_code;
            s.ddl_leave_sub_type    = s.datalistgrid3[row_id].leave_subtype_code
            s.txtb_specify          = s.datalistgrid3[row_id].leave_descr;
            s.txtb_comments         = s.datalistgrid3[row_id].leave_comments;
            s.txtb_remarks          = s.datalistgrid3[row_id].details_remarks;
            s.range_start           = s.datalistgrid3[row_id].date_from;
            s.range_end             = s.datalistgrid3[row_id].date_to;
            s.datalistgrid3[row_id].leave_class == true ? $("#x1").prop("checked", true) : $("#x0").prop("checked", true);
            s.txtb_date_bal_asof = s.datalistgrid3[row_id].leaveledger_date;
            
            s.txtb_current_bal      = s.datalistgrid3[row_id].leaveledger_balance_as_of_oth;
            if (s.ddl_leave_type == "SP") {
                s.txtb_current_bal = s.datalistgrid3[row_id].leaveledger_balance_as_of_sp;
            }
            s.ddl_leave_type_descr = $('#ddl_leave_type option:selected').text()
            if ($("#x1").prop("checked"))
            {
                $("#x0").closest('div').removeClass('checked');
                $("#x1").closest('div').removeClass('checked');
                $("#x1").closest('div').addClass('checked');
            }
            if ($("#x0").prop("checked")) {
                $("#x0").closest('div').removeClass('checked');
                $("#x1").closest('div').removeClass('checked');
                $("#x0").closest('div').addClass('checked');
            }

            s.div_justi_msg = false
            justi_flag.checked = false
            if (s.datalistgrid3[row_id].justification_flag == true)
            {
                justi_flag.checked =true
                s.div_justi_msg = true
            }

            //s.Populate_ApprovalHistory(s.datalistgrid3[row_id].leave_ctrlno);

            h.post("../cSSLeaveAppl/GetDetailsData",
            {
                p_leave_ctrlno  : s.datalistgrid3[row_id].leave_ctrlno
            }).then(function (d) {
                if (d.data.message == "success") {
                    
                    s.data_creator = d.data.creator;
                    
                    s.oTable2.fnClearTable();
                    s.datalistgrid2 = d.data.flpDtlLst;
                    s.getDtlDataLength = d.data.flpDtlLst.length;

                    s.lv_cancellation_lst = d.data.lv_cancellation_lst
                    for (var i = 0; i < d.data.lv_cancellation_lst.length; i++)
                    {
                        d.data.lv_cancellation_lst[i].leave_cancel_date_descr   = moment(d.data.lv_cancellation_lst[i].leave_cancel_date).format("MMMM DD, YYYY")
                        d.data.lv_cancellation_lst[i].leave_transfer_date_descr = moment(d.data.lv_cancellation_lst[i].leave_transfer_date).format("MMMM DD, YYYY")
                    }

                    if (d.data.flpDtlLst.length > 0)
                    {
                        s.oTable2.fnAddData(d.data.flpDtlLst);
                    }
                    if (d.data.creator == "true")
                    {
                        if (s.datalistgrid3[row_id].approval_status == "N" || s.datalistgrid3[row_id].approval_status == "C") {
                            s.dis_edit              = false;
                            s.dis_submit            = false;
                            s.show_cancel           = false;
                            s.dis_plan_date         = false;
                            //s.dis_when_s            = false;
                            s.dis_when_s            = true;
                            s.dis_bal_inputs        = false;
                            s.dis_leavetype_inputs  = false;
                        }
                        else
                        {
                            s.dis_edit              = true;
                            s.dis_submit            = true;
                            s.show_cancel           = false;
                            s.dis_plan_date         = true;
                            s.dis_when_s            = true;
                            s.dis_bal_inputs        = true;
                            s.dis_leavetype_inputs  = true;
                        }
                    }
                    else
                    {
                        s.dis_edit              = true;
                        s.dis_submit            = true;
                        s.show_cancel           = false;
                        s.dis_plan_date         = true;
                        s.dis_del_row_3         = true;
                        s.dis_when_s            = true;
                        s.dis_bal_inputs        = true;
                        s.dis_leavetype_inputs  = true;
                    }

                    s.selectLeaveType();
                    s.ddl_leave_sub_type = s.datalistgrid3[row_id].leave_subtype_code
                    
                    s.cto_current_balance   = d.data.cto_balance.toFixed(3)
                    s.vl_current_balance    = d.data.vl_current_balance.toFixed(3)
                    s.sl_current_balance    = d.data.sl_current_balance.toFixed(3)
                    s.sp_current_balance    = d.data.sp_current_balance.toFixed(3)
                    s.fl_current_balance    = d.data.fl_current_balance.toFixed(3)
                    
                    s.sl_less_this_leave  =  d.data.lv_hdr.sl_restore_deduct.toFixed(3) 
                    s.vl_less_this_leave  =  d.data.lv_hdr.vl_restore_deduct.toFixed(3) 
                    s.sp_less_this_leave  =  d.data.lv_hdr.sp_restore_deduct.toFixed(3) 
                    s.fl_less_this_leave  =  d.data.lv_hdr.fl_restore_deduct.toFixed(3) 
                    s.oth_less_this_leave =  d.data.lv_hdr.oth_restore_deduct.toFixed(3)
                    s.cto_less_this_leave =  d.data.lv_hdr.oth_restore_deduct.toFixed(3)


                    setTimeout(function ()
                    {
                        $('#tab-1').click();
                        $('#main_modal').modal({ backdrop: 'static', keyboard: false });
                        $('#modal_loading').modal("hide");
                        s.leave_computation_edited();
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
    function edit_action(row_id) {
        try
        {
            s.show_cancel_button = false;
            $('#modal_loading').modal({ backdrop: 'static', keyboard: false });
            s.day_num_day_total_func();
            s.data_history = [];
            clearentry();
            clearentry2();
            s.isEdit = true;
            s.save_mode = "EDIT"

            if (s.datalistgrid[row_id].approval_status == "S" ||
                s.datalistgrid[row_id].approval_status == "R" ||
                s.datalistgrid[row_id].approval_status == "1" ||
                s.datalistgrid[row_id].approval_status == "2" ||
                s.datalistgrid[row_id].approval_status == "F" ||
                s.datalistgrid[row_id].approval_status == "D" ||
                s.datalistgrid[row_id].approval_status == "L")
            {
                s.ModalTitle = "View Record Details";
            }
            else
            {
                s.ModalTitle = "Edit Existing Record";
            }

            if ((s.datalistgrid[row_id].approval_status == "F"
                &&
                (s.datalistgrid[row_id].posting_status == true))
                ||
                //(s.datalistgrid[row_id].leave_type_code == "FL" &&
                (s.datalistgrid[row_id].approval_status == "N" || s.datalistgrid[row_id].approval_status == "C") 
                //)
            )
            {
                s.show_cancel_button = true;
            }


            s.available_leave = 0;
            var btn = document.getElementById('submit');

            if (s.datalistgrid[row_id].approval_status == "C") {
                btn.innerHTML = '<i class="fa fa-paper-plane-o"></i> Re-Submit All';
                s.resubmit = "TRUE"
            }
            else {
                btn.innerHTML = '<i class="fa fa-paper-plane-o"></i> Submit';
                s.resubmit = "FALSE"
            }
            
            if (s.datalistgrid[row_id].approval_status == "S") {
                s.showRecall = true;
            }
            else {
                s.showRecall = false;
            }
            s.show_refresh_bal = false;
            if (s.datalistgrid[row_id].approval_status == "C" ||
                s.datalistgrid[row_id].approval_status == "N" )
            {
                s.show_refresh_bal = true;
            }

            s.temp_row_id       = row_id;
            s.temp_leave_ctrlno = s.datalistgrid[row_id].leave_ctrlno;
            s.temp_approval_id  = s.datalistgrid[row_id].approval_id;
            s.temp_appr_status  = s.datalistgrid[row_id].approval_status;
            s.edit_leave_ctrlno = s.datalistgrid[row_id].leave_ctrlno;
            s.edit_approval_id  = s.datalistgrid[row_id].approval_id;

            s.txtb_appl_nbr         = s.datalistgrid[row_id].leave_ctrlno;
            s.txtb_date_applied     = s.datalistgrid[row_id].date_applied;
            s.txtb_approval_status  = s.datalistgrid[row_id].approval_status_descr;
            s.txtb_empl_name        = s.datalistgrid[row_id].employee_name;
            s.txtb_empl_id          = s.datalistgrid[row_id].empl_id;
            s.ddl_leave_type        = s.datalistgrid[row_id].leave_type_code;
            s.ddl_leave_sub_type    = s.datalistgrid[row_id].leave_subtype_code
            s.txtb_specify          = s.datalistgrid[row_id].leave_descr;
            s.txtb_comments         = s.datalistgrid[row_id].leave_comments;
            s.txtb_remarks          = s.datalistgrid[row_id].details_remarks;
            s.range_start           = s.datalistgrid[row_id].date_from;
            s.range_end             = s.datalistgrid[row_id].date_to;
            s.txtb_date_bal_asof    = s.datalistgrid[row_id].leaveledger_date;
            s.txtb_current_bal = s.datalistgrid[row_id].leaveledger_balance_as_of_oth;

            s.div_justi_msg = false
            justi_flag.checked = false
            if (s.datalistgrid[row_id].justification_flag == true)
            {
                justi_flag.checked = true
                s.div_justi_msg = true
            }

            //s.Populate_ApprovalHistory(s.datalistgrid[row_id].leave_ctrlno);

            if (s.ddl_leave_type == "SP")
            {
                s.txtb_current_bal = s.datalistgrid[row_id].leaveledger_balance_as_of_sp;
            }
            s.ddl_leave_type_descr = $('#ddl_leave_type option:selected').text()
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
            h.post("../cSSLeaveAppl/GetDetailsData",
            {
                p_leave_ctrlno: s.datalistgrid[row_id].leave_ctrlno
            }).then(function (d) {
                if (d.data.message == "success") {

                    s.data_creator = d.data.creator;

                    s.oTable2.fnClearTable();
                    s.datalistgrid2     = d.data.flpDtlLst;
                    s.getDtlDataLength  = d.data.flpDtlLst.length;

                    if (d.data.flpDtlLst.length > 0) {
                        s.oTable2.fnAddData(d.data.flpDtlLst);
                    }
                    if (d.data.creator == "true")
                    {
                        if (s.datalistgrid[row_id].approval_status    == "N"
                            || s.datalistgrid[row_id].approval_status == "C") {
                            s.dis_edit              = false;
                            s.dis_submit            = false;
                            s.show_cancel           = false;
                            s.dis_plan_date         = false;
                            //s.dis_when_s            = false;
                            s.dis_when_s            = true;
                            s.dis_bal_inputs        = false;
                            s.dis_leavetype_inputs  = false;
                        }
                        else {
                            s.dis_edit              = true;
                            s.dis_submit            = true;
                            s.show_cancel           = false;
                            s.dis_plan_date         = true;
                            s.dis_when_s            = true;
                            s.dis_bal_inputs        = true;
                            s.dis_leavetype_inputs  = true;
                        }
                    }
                    else
                    {
                        s.dis_edit                  = true;
                        s.dis_submit                = true;
                        s.show_cancel               = false;
                        s.dis_plan_date             = true;
                        s.dis_del_row_3             = true;
                        s.dis_when_s                = true;
                        s.dis_bal_inputs            = true;
                        s.dis_leavetype_inputs      = true;
                    }

                    s.selectLeaveType();
                    s.ddl_leave_sub_type = s.datalistgrid[row_id].leave_subtype_code
                    
                    s.cto_current_balance = d.data.cto_balance.toFixed(3)
                    s.vl_current_balance  = d.data.vl_current_balance.toFixed(3)
                    s.sl_current_balance  = d.data.sl_current_balance.toFixed(3)
                    s.sp_current_balance  = d.data.sp_current_balance.toFixed(3)
                    s.fl_current_balance  = d.data.fl_current_balance.toFixed(3)
                    
                    s.sl_less_this_leave  =  d.data.lv_hdr.sl_restore_deduct.toFixed(3)
                    s.vl_less_this_leave  =  d.data.lv_hdr.vl_restore_deduct.toFixed(3)
                    s.sp_less_this_leave  =  d.data.lv_hdr.sp_restore_deduct.toFixed(3)
                    s.fl_less_this_leave  =  d.data.lv_hdr.fl_restore_deduct.toFixed(3)
                    s.oth_less_this_leave =  d.data.lv_hdr.oth_restore_deduct.toFixed(3)
                    s.cto_less_this_leave =  d.data.lv_hdr.oth_restore_deduct.toFixed(3)
                    
                    setTimeout(function ()
                    {
                        $('#tab-1').click();
                        $('#modal_loading').modal("hide");
                        $('#main_modal').modal({ backdrop: 'static', keyboard: false });

                        s.leave_computation_edited();
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
    //***********************************// 
    //*** Get Data  ********************//
    //*********************************// 
    function GetDetailsData(application_nbr)
    {
        h.post("../cSSFLPlan/GetDetailsData",
        {
            p_application_nbr   : application_nbr
            ,par_year           : s.txtb_year_selected
        }).then(function (d) {
            if (d.data.message == "success")
            {
                s.oTable2.fnClearTable();
                s.datalistgrid2 = d.data.flpDtlLst;

                if (d.data.flpDtlLst.length > 0)
                {
                    s.oTable2.fnAddData(d.data.flpDtlLst);
                }
                
                s.cto_current_balance = d.data.cto_balance.toFixed(3);
                s.vl_current_balance  = d.data.vl_current_balance.toFixed(3);
                s.sl_current_balance  = d.data.sl_current_balance.toFixed(3);
                s.sp_current_balance  = d.data.sp_current_balance.toFixed(3);
                s.fl_current_balance  = d.data.fl_current_balance.toFixed(3);
                
                s.sl_less_this_leave  =  d.data.lv_hdr.sl_restore_deduct.toFixed(3);
                s.vl_less_this_leave  =  d.data.lv_hdr.vl_restore_deduct.toFixed(3);
                s.sp_less_this_leave  =  d.data.lv_hdr.sp_restore_deduct.toFixed(3);
                s.fl_less_this_leave  =  d.data.lv_hdr.fl_restore_deduct.toFixed(3);
                s.oth_less_this_leave =  d.data.lv_hdr.oth_restore_deduct.toFixed(3);
                s.cto_less_this_leave =  d.data.lv_hdr.oth_restore_deduct.toFixed(3);

            }
            else
            {
                swal(d.data.message, { icon: "warning", });
            }
        });
    }
    //************************************// 
    //*** Delete Record All *************//
    //**********************************// 
    s.btn_del_all = function (row_index)
    {
        if (s.datalistgrid3[row_index].leave_type_code == "FL")
        {
            swal("You cannot proceed this transaction","You cannot Delete the Cancel Pending Force leave, apply cancellation instead!",{ icon: "warning", });
            return;
        }

        try
        {
            swal({
                title: "Are you sure to delete this record and all of its components?",
                text: "Once deleted, you will not be able to recover this record!",
                icon: "warning",
                buttons: true,
                dangerMode: true,

            })
                .then(function (willDelete) {
                    if (willDelete) {
                        var data = {
                            leave_ctrlno: s.datalistgrid3[row_index].leave_ctrlno
                            , approval_id: s.datalistgrid3[row_index].approval_id
                        };
                        
                        h.post("../cSSLeaveAppl/DeleteAll", 
                        {
                            data: data
                        }).then(function (d) {
                            if (d.data.message == "success") {
                                s.FilterPageGrid();
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
        catch (err)
        {
            swal({ icon: "warning", title: err.message });
        }
    }
    //************************************// 
    //*** Delete Record All         
    //**********************************// 
    s.btn_del_row = function (row_index)
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
                            leave_ctrlno    : s.datalistgrid3[row_index].leave_ctrlno
                            ,leave_dates    : s.datalistgrid3[row_index].leave_dates
                        };
                        
                        h.post("../cSSLeaveAppl/Delete", {
                            data            : data
                            ,approval_id    : s.datalistgrid3[row_index].approval_id
                        }).then(function (d) {
                            if (d.data.message == "success")
                            {
                                s.FilterPageGrid();
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
        catch (err)
        {
            swal({ icon: "warning", title: err.message });
        }
    }
    //************************************// 
    //*** Cancel Record              
    //**********************************// 
    s.btn_cancel_all = function () {
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
                            leave_ctrlno: s.datalistgrid3[row_index].leave_ctrlno
                            , approval_id: s.datalistgrid3[row_index].approval_id
                        }

                        h.post("../cSSLeaveAppl/CancelAll", {
                            data: data
                        }).then(function (d) {
                            if (d.data.message == "success") {
                                s.FilterPageGrid();
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
    //*** Cancel Record In FLP Date Grid       
    //**********************************// 
    //s.btn_cancel = function (row_index) {
    //    try {
    //        swal({
    //            title: "Are you sure to cancel this application?",
    //            text: "Once cancelled, you will not be able to recover this record!",
    //            icon: "warning",
    //            buttons: true,
    //            dangerMode: true,

    //        })
    //            .then(function (willDelete) {
    //                if (willDelete) {
    //                    var data = {
    //                        leave_ctrlno: s.datalistgrid3[row_index].leave_ctrlno
    //                        , approval_id: s.datalistgrid3[row_index].approval_id
    //                    }
    //                    var data2 = {
    //                        leave_ctrlno: s.datalistgrid2[row_index].leave_ctrlno
    //                        , leave_dates: s.datalistgrid2[row_index].flp_application_date
    //                    }

    //                    h.post("../cSSLeaveAppl/Cancel", {
    //                        data: data
    //                        , data2: data2
    //                    }).then(function (d) {
    //                        if (d.data.message == "success") {
    //                            swal("Your record has been cancelled!", { icon: "success", });
    //                            s.FilterPageGrid();
    //                            GetDetailsData(s.datalistgrid2[row_index].application_nbr);

    //                        }
    //                        else {
    //                            swal({ title: d.data.message, icon: "warning", });
    //                        }
    //                    })
    //                }
    //            });
    //    }
    //    catch (err)
    //    {
    //        swal({ icon: "warning", title: err.message });
    //    }
    //}
    //************************************// 
    //*** Print Action Click              
    //**********************************// 
    s.btn_print_action = function (par_row_id)
    {
        if (s.datalistgrid3[par_row_id].approval_status == "N" ||
            s.datalistgrid3[par_row_id].approval_status == "C" )
        {
            swal("You cannot Print this Leave application", "You have to submit your Leave application", { icon: "warning" });
            return;
        }

        var application_nbr     = s.datalistgrid3[par_row_id].leave_ctrlno;
        var empl_id             = s.datalistgrid3[par_row_id].empl_id;
        var ReportName          = "CrystalReport"
        var SaveName            = "Crystal_Report"
        var ReportType          = "inline"
        var ReportPath          = ""
        var sp                  = ""

        if (s.datalistgrid3[par_row_id].leave_type_code == "CTO")
        {
            //ReportPath = "~/Reports/cryCTO/cryCTO.rpt";
            ReportPath = "~/Reports/cryCTONew/cryCTONew.rpt";
            sp = "sp_leave_application_hdr_tbl_report_cto,par_leave_ctrlno," + application_nbr + ",par_empl_id," + empl_id + ",par_view_mode," + "01"; // View Mode - Self-Service Viewing of Balance
        }
        else
        {
            ReportPath = "~/Reports/cryLeavePermission/cryLeavePermissionMainRep.rpt";
            sp         = "sp_leave_application_hdr_tbl_report,par_leave_ctrlno," + application_nbr + ",par_empl_id," + empl_id;
        }
        
        h.post("../cSSLeaveAppl/setPageHistory").then(function (d) {
                if (d.data.message == "success")
                {
                    // *******************************************************
                    // *** VJA : 2021-07-14 - Validation and Loading hide ****
                    // *******************************************************
                    s.employee_name_print = "LEAVE APPLICATION";
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
                }
                else
                {
                    swal(d.data.message, "", {icon:"warning"});
                }
            });
    }

    //************************************// 
    //*** Button for Edit Action ********//   
    //**********************************// 
    s.btn_edit_action1 = function (row_id)
    {
        clearentry2();

        $('#start').val(s.datalistgrid2[row_id].leave_date_from);
        $('#end').val(s.datalistgrid2[row_id].leave_date_to);
        s.start                 = s.datalistgrid2[row_id].leave_date_from;
        s.end                   = s.datalistgrid2[row_id].leave_date_to;
        s.txtb_day_equiv        = s.datalistgrid2[row_id].date_num_day;
        s.txtb_day_equiv_tot    = s.datalistgrid2[row_id].date_num_day_total;
        s.txtb_cto_remarks      = s.datalistgrid2[row_id].cto_remarks;

        s.show_btn_add_date     = false;
        s.temp_dt_row_id        = row_id;
        
        $('#leave_dtl_modal').modal({ backdrop: 'static', keyboard: false });

    }
    //************************************// 
    //*** Button for Edit Action ********//   
    //**********************************// 
    s.btn_update = function ()
    {

        try
        {
            if (ValidateFields3())
            {

                s.show_btn_add_date = true;
                s.datalistgrid2 = s.datalistgrid2.delete(s.temp_dt_row_id);
                s.oTable2.fnClearTable();
                if (s.datalistgrid2.length != 0)
                {
                    s.oTable2.fnAddData(s.datalistgrid2);
                }

                var data =
                {
                     leave_date_from    : $("#start").val()
                    ,leave_date_to      : $("#end").val()
                    ,date_num_day       : $("#txtb_day_equiv").val()
                    ,date_num_day_total : $("#txtb_day_equiv_tot").val()
                    ,cto_remarks        : $("#txtb_cto_remarks").val()
                }
                s.datalistgrid2.push(data)
                s.oTable2.fnClearTable();
                s.oTable2.fnAddData(s.datalistgrid2);

                $('#datalist_grid2').removeClass('selected');
                var table = $('#datalist_grid2').DataTable();
                table.rows(s.temp_dt_row_id).nodes().to$().addClass('selected');

                setTimeout(function ()
                {
                    $('#datalist_grid2').removeClass('selected');
                }, 1000);

                $('#leave_dtl_modal').modal("hide");
                clearentry2();
            }
        }
        catch (err)
        {
            swal({ icon: "warning", title: err.message });
        }

    }

    //************************************// 
    //*** Row    *****************//
    //**********************************// 
    s.btn_del_row1 = function (row_id)
    {
        s.datalistgrid2 = s.datalistgrid2.delete(row_id);
        s.oTable2.fnClearTable();
        if (s.datalistgrid2.length != 0)
        {
            s.oTable2.fnAddData(s.datalistgrid2);
        }
    }
    //************************************// 
    //*** Row Prototype ***********
    //**********************************// 
    Array.prototype.delete = function (code) {
        return this.filter(function (d, k) {
            return k != code
        })
    }
    //************************************// 
    //*** Row Prototype ***********
    //**********************************// 
    s.day_num_day_total_func = function ()
    {
        var dt1 = new Date($("#start").val());
        var dt2 = new Date($("#end").val());
        var date_diff = 0;

        if ($("#start").val() == $("#end").val())
        {
            date_diff = 1;
        }
        else
        {
            date_diff = 1 + Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));
        }

        var result = 0;

        if ($('#ddl_leave_type').val() == "CTO")
        {
            if ($('#txtb_cto_remarks').val() != "08:00AM-5:00PM")
            {
                s.txtb_day_equiv_tot = (date_diff * 4);
                result = (s.txtb_day_equiv_tot / 4);
            }
            else
            {
                s.txtb_day_equiv_tot = (date_diff * 8);
                result = (s.txtb_day_equiv_tot / 8);
            }

            
        }
        else
        {
            result = s.txtb_day_equiv_tot / date_diff;
            s.txtb_day_equiv_tot = date_diff;
        }
        s.txtb_day_equiv = currency(result)

    }
    //************************************// 
    //*** Clear Entry 1 *****************//
    //**********************************// 
    function clearentry()
    {
        s.new_appr_ctrl = "";
        s.txtb_approval_status = "";
        s.txtb_empl_name = ""
        s.txtb_empl_id = ""
        s.ddl_leave_type = ""
        s.ddl_leave_sub_type = ""
        s.txtb_specify = ""
        s.txtb_comments = ""
        s.txtb_remarks = ""
        s.leave_type_acro = "";
        s.txtb_date_applied = "";
        
        s.sl_current_balance  = "0.000";
        s.vl_current_balance  = "0.000";
        s.sp_current_balance  = "0.000";
        s.fl_current_balance  = "0.000";
        s.oth_current_balance = "0.000";
        s.cto_current_balance = "0.00";
        
        s.sl_less_this_leave  = "0.000";
        s.vl_less_this_leave  = "0.000";
        s.sp_less_this_leave  = "0.000";
        s.fl_less_this_leave  = "0.000";
        s.oth_less_this_leave = "0.000";
        s.cto_less_this_leave = "0.00";

        $('#sl_leave_bal').text("0");
        $('#vl_leave_bal').text("0");
        $('#sp_leave_bal').text("0");
        $('#fl_leave_bal').text("0");

        $('#today_date').text(moment(new Date()).format('MMM DD, YYYY').toString());

        $('#slvl_radio0').addClass('sl-vl-radio-display-none');
        $('#slvl_radio1').addClass('sl-vl-radio-display-none');
        $('#txtb_specify_div').addClass('sl-vl-radio-display-none');

        $("#txtb_appl_nbr").removeClass("required");
        $("#lbl_txtb_appl_nbr_req").text("");

        $("#txtb_approval_status").removeClass("required");
        $("#lbl_txtb_approval_status_req").text("");

        $("#txtb_empl_name").removeClass("required");
        $("#lbl_txtb_empl_name_req").text("");

        $("#txtb_empl_id").removeClass("required");
        $("#lbl_txtb_empl_id_req").text("");

        $("#ddl_leave_type").removeClass("required");
        $("#lbl_ddl_leave_type_req").text("");

        $("#ddl_leave_sub_type").removeClass("required");
        $("#lbl_ddl_leave_sub_type_req").text("");

        $("#txtb_specify").removeClass("required");
        $("#lbl_txtb_specify_req").text("");

        s.txtb_current_bal = "0.00";
        s.temp_leave_ctrlno = "";
        s.temp_approval_id = "";

        $("#chk_cto").prop("checked", false)
    }
    //************************************// 
    //*** Clear Entry 2 *****************//
    //**********************************//
    function clearentry2()
    {
        s.start = "";
        s.end   = "";
        $('#start').val("")
        $('#end').val("")

        s.txtb_day_equiv        = "";
        s.txtb_day_equiv_tot    = "";
        s.txtb_cto_remarks = "08:00AM-5:00PM";
        $('#txtb_cto_remarks').val("08:00AM-5:00PM");
    }
    //************************************// 
    //*** Checking for Dates ************//
    //**********************************//
    function Check_Between_Dates(date1, date2)
    {
        var return_val = false;

        var var_check_from  = new Date(date1).getTime();
        var var_check_to    = new Date(date2).getTime();
        
        for (var x = 0; x < s.datalistgrid2.length; x++)
        {
            var var_from    = new Date(s.datalistgrid2[x].leave_date_from).getTime();
            var var_to      = new Date(s.datalistgrid2[x].leave_date_to).getTime();
            
            if (var_check_from >= var_from && var_check_from <= var_to)
            {
                return_val = true;
                $('#datalist_grid2').removeClass('selected');
                var table = $('#datalist_grid2').DataTable();
                table.rows(x).nodes().to$().addClass('selected');
                break;
            }
            else if (var_check_to >= var_from && var_check_to <= var_to)
            {
                return_val = true;
                $('#datalist_grid2').removeClass('selected');
                var table = $('#datalist_grid2').DataTable();
                table.rows(x).nodes().to$().addClass('selected');
                break;
            }
            else
            {
                return_val = false;
            }
        }
        return return_val;
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields()
    {
        var return_val = true;
        ValidationResultColor("ALL", false);
        
        if ($('#ddl_leave_type').val() == "") {
            ValidationResultColor("ddl_leave_type", true);
            $('#id_leaveinfo').click();
            return_val = false;
        }
        if ($('#ddl_leave_type').val() == "SP" && $('#ddl_leave_sub_type').val() == "") {
            ValidationResultColor("ddl_leave_sub_type", true);
            $('#id_leaveinfo').click();
            return_val = false;
        }

        if ($('#txtb_date_bal_asof').val() == "")
        {
            ValidationResultColor("txtb_date_bal_asof", true);
            $('#id_leaveinfo').click();
            return_val = false;
        }

        if (s.datalistgrid2.length <= 0)
        {
            swal("YOU CANNOT SAVE THIS APPLICATION!", "You need to input Date Breakdown", { icon: "warning" });
            $('#id_datebrk').click();
            return_val = false;
        }

        // *************************************
        // ** New Validation for Shorten Code
        // *************************************
        if ($('#ddl_leave_type').val() != "")
        {
            switch ($('#ddl_leave_type').val())
            {
                case "CTO":
                    break;
                case "FL":

                    if (parseFloat($('#vl_leave_bal').text()) < 0)
                    {
                        swal("You cannot Apply Force Leave if your balance on Vacation leave is not enough", "Note: Force leave is automatic deduct on Vacation leave\n" + "\n" + "Vacation Leave: " + $('#vl_leave_bal').text() + "\n" + "Force Leave: " + $('#fl_leave_bal').text(), { icon: "warning" });
                        $('#id_leaveinfo').click();
                        return_val = false;
                    }
                    break;
                case "":
                    break;
            }
        }
        // *************************************
        // *************************************

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

            $("#ddl_leave_type").removeClass("required");
            $("#lbl_ddl_leave_type_req").text("");

            $("#txtb_date_bal_asof").removeClass("required");
            $("#lbl_txtb_date_bal_asof_req").text("");
        }
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields2() {
        var return_val = true;
        ValidationResultColor2("ALL", false);

        if ($('#ddl_name').val() == "") {
            ValidationResultColor2("ddl_name", true);
            return_val = false;
        }

        return return_val;
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidationResultColor2(par_object_id, par_v_result) {
        if (par_v_result)
        {
            $("#select2-" + par_object_id + "-container").parent().addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field!");
        }
        else
        {
            //remove of refresh the object form being required
            $("#select2-ddl_name-container").parent().removeClass("required");
            $("#lbl_ddl_name_req").text("");
        }
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields3() {
        var return_val = true;
        ValidationResultColor3("ALL", false);

        if ($('#start').val() == "") {
            ValidationResultColor3("start", true);
            $('#id_datebrk').click();
            return_val = false;
        }
        else if (checkisdate($('#start').val().trim()) == false)
        {
            $("#start").addClass("required");
            $("#lbl_start_req").text("Invalid Date Format");
            return_val = false;
        }

        if ($('#end').val() == "") {
            ValidationResultColor3("end", true);
            $('#id_datebrk').click();
            return_val = false;
        }
        else if (checkisdate($('#end').val().trim()) == false) {
            $("#end").addClass("required");
            $("#lbl_end_req").text("Invalid Date Format");
            return_val = false;
        }

        if ($('#txtb_day_equiv').val() == "") {
            ValidationResultColor3("txtb_day_equiv", true);
            $('#id_datebrk').click();
            return_val = false;
        }
        
            
        if ($('#ddl_leave_type option:selected').val() == "CTO")
        {
            if ($('#txtb_cto_remarks').val() == "") {
                ValidationResultColor3("txtb_cto_remarks", true);
                $('#id_datebrk').click();
                return_val = false;
            }
            if ($('#chk_cto').prop("checked") == true
                || parseFloat($('#txtb_day_equiv_tot').val()) < 8
                || $('#txtb_cto_remarks').val() == ""
            ) {
                if ($('#txtb_cto_remarks').val() == "") {
                    ValidationResultColor3("txtb_cto_remarks", true);
                    $('#id_datebrk').click();
                    return_val = false;
                }
            }
        }


        var e_date = new Date(moment($('#end').val()).format('YYYY-MM-DD'));
        var s_date = new Date(moment($('#start').val()).format('YYYY-MM-DD'));

        if (s_date > e_date)
        {
            $("#start").removeClass("required");
            $("#lbl_start_req").text("Leave Date from is greater than Leave Date to");
            $("#end").removeClass("required");
            $("#lbl_end_req").text("Leave Date from is greater than Leave Date to");
            $('#id_datebrk').click();
            return_val = false;
        }

        if ($('#txtb_day_equiv_tot').val() == "") {
            ValidationResultColor3("txtb_day_equiv_tot", true);
            $('#id_datebrk').click();
            return_val = false;
        }
        
        return return_val;
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidationResultColor3(par_object_id, par_v_result) {
        if (par_v_result)
        {
            //Add class to the obect that need to focus as a required..
            if (par_object_id == "txtb_cto_remarks") {
                $("#" + par_object_id).addClass("required");
                $("#lbl_" + par_object_id + "_req").text("for CTO halfday, time coverage is required!");
            }
            else
            {
                $("#" + par_object_id).addClass("required");
                $("#lbl_" + par_object_id + "_req").text("Required Field!");
            }
            
        }
        else {
            //remove of refresh the object form being required

            $("#start").removeClass("required");
            $("#lbl_start_req").text("");

            $("#end").removeClass("required");
            $("#lbl_end_req").text("");

            $("#txtb_day_equiv").removeClass("required");
            $("#lbl_txtb_day_equiv_req").text("");

            $("#txtb_cto_remarks").removeClass("required");
            $("#lbl_txtb_cto_remarks_req").text("");

            $("#txtb_day_equiv").removeClass("required");
            $("#lbl_txtb_day_equiv_req").text("");
            
            $("#txtb_day_equiv_tot").removeClass("required");
            $("#lbl_txtb_day_equiv_tot_req").text("");
        }
    }
    //***********************************************************//
    //*** Withdraw Submission **********************************//
    //  ADDED BY: LORRAINE I ALE DATE: 2021-03-17
    //*********************************************************// 
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

                    var data =
                    {
                        leave_ctrlno        : s.temp_leave_ctrlno 
                        , approval_id       : s.temp_approval_id  
                        , approval_status: "C"
                        , details_remarks: "User Withdraw Submission"
                    }
                    
                    h.post("../cSSLeaveAppl/WithdrawSubmission", { data: data }).then(function (d)
                    {
                        if (d.data.message == "success") {
                            $('#main_modal').modal("hide");
                            s.FilterPageGrid();
                            swal("Your application has been successfully withdrawn!", { icon: "success", });
                        }
                        else {
                            swal(d.data.message, { icon: "warning", });
                        }
                    });
                }
            });
    }
    //**********************************//
    //*** Half Day - For CTO **********//
    //********************************// 
    s.chck_halfday = function ()
    {
        if ($('#txtb_cto_remarks').val() != "08:00AM-5:00PM")
        {
            s.txtb_day_equiv     = 0.5
            s.txtb_day_equiv_tot = 4
        }
        else
        {
            s.txtb_day_equiv     = 1
            s.txtb_day_equiv_tot = 8
        }
        s.day_num_day_total_func();
    }
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
    //*** - 02/27/2020 - Reject or Check if Date
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
            regex3.test(d) == true) {
            istrue = true;
        } else {
            istrue = false;
        }
        return istrue;

    }
    //*************************************************//
    //***  VJA : Populate Particulars ****************//
    //***********************************************//
    //s.Populate_ApprovalHistory = function (par_txtb_appl_nbr)
    //{
    //    h.post("../cSSLeaveAppl/ApprovalHistory",
    //    {
    //        par_leave_ctlno: par_txtb_appl_nbr
    //    }).then(function (d) {
    //        if (d.data.message_descr == "success") {

    //            if (d.data.data != null)
    //            {
    //                // LEAVE APPLICATION HISTORY
    //                s.reviewed_comment              = d.data.data.reviewed_comment
    //                s.level1_approval_comment       = d.data.data.level1_approval_comment
    //                s.level2_approval_comment       = d.data.data.level2_approval_comment
    //                s.final_approval_comment        = d.data.data.final_approval_comment
    //                s.disapproval_comment           = d.data.data.disapproval_comment
    //                s.cancel_pending_comment        = d.data.data.cancel_pending_comment
    //                s.cancelled_comment             = d.data.data.cancelled_comment
    //                s.user_id_creator               = d.data.data.user_id_creator
    //                s.employee_name_creator         = d.data.data.employee_name_creator
    //                s.user_id_reviewer              = d.data.data.user_id_reviewer
    //                s.employee_name_reviewer        = d.data.data.employee_name_reviewer
    //                s.user_id_level1_approver       = d.data.data.user_id_level1_approver
    //                s.employee_name_level1_approver = d.data.data.employee_name_level1_approver
    //                s.user_id_level2_approver       = d.data.data.user_id_level2_approver
    //                s.employee_name_level2_approver = d.data.data.employee_name_level2_approver
    //                s.user_id_final_approver        = d.data.data.user_id_final_approver
    //                s.employee_name_final_approver  = d.data.data.employee_name_final_approver
    //                s.user_id_disapprover           = d.data.data.user_id_disapprover
    //                s.employee_name_disapprover     = d.data.data.employee_name_disapprover
    //                s.user_id_cancel_pending        = d.data.data.user_id_cancel_pending
    //                s.employee_name_cancel_pending  = d.data.data.employee_name_cancel_pending

    //                s.reviewed_date                 = d.data.data.reviewed_date          == "1900-01-01 12:00:00 AM" ? "----" : d.data.data.reviewed_date          ;
    //                s.level1_approval_date          = d.data.data.level1_approval_date   == "1900-01-01 12:00:00 AM" ? "----" : d.data.data.level1_approval_date   ;
    //                s.level2_approval_date          = d.data.data.level2_approval_date   == "1900-01-01 12:00:00 AM" ? "----" : d.data.data.level2_approval_date   ;
    //                s.final_approval_date           = d.data.data.final_approval_date    == "1900-01-01 12:00:00 AM" ? "----" : d.data.data.final_approval_date    ;
    //                s.disapproval_date              = d.data.data.disapproval_date       == "1900-01-01 12:00:00 AM" ? "----" : d.data.data.disapproval_date       ;
    //                s.cancel_pending_date           = d.data.data.cancel_pending_date    == "1900-01-01 12:00:00 AM" ? "----" : d.data.data.cancel_pending_date    ;
    //                s.cancelled_date                = d.data.data.cancelled_date         == "1900-01-01 12:00:00 AM" ? "----" : d.data.data.cancelled_date         ;
    //                s.created_dttm                  = moment(d.data.leave_appl.created_dttm).format("YYYY-MM-DD hh:mm:ss A").trim()    == "1900-01-01 12:00:00 pm" ? "----" : moment(d.data.leave_appl.created_dttm).format("YYYY-MM-DD hh:mm:ss A")    ;

    //                s.txtb_approval_id = d.data.leave_appl.approval_id
    //            }

    //            if (d.data.data_posting != null)
    //            {
    //                // POSTING HISTORY
    //                s.level1_approval_comment_posting       = d.data.data_posting.level1_approval_comment
    //                s.level2_approval_comment_posting       = d.data.data_posting.level2_approval_comment
    //                s.final_approval_comment_posting        = d.data.data_posting.final_approval_comment
    //                s.disapproval_comment_posting           = d.data.data_posting.disapproval_comment
    //                s.cancel_pending_comment_posting        = d.data.data_posting.cancel_pending_comment
    //                s.cancelled_comment_posting             = d.data.data_posting.cancelled_comment
    //                s.user_id_creator_posting               = d.data.data_posting.user_id_creator
    //                s.employee_name_creator_posting         = d.data.data_posting.employee_name_creator
    //                s.user_id_reviewer_posting              = d.data.data_posting.user_id_reviewer
    //                s.employee_name_reviewer_posting        = d.data.data_posting.employee_name_reviewer
    //                s.user_id_level1_approver_posting       = d.data.data_posting.user_id_level1_approver
    //                s.employee_name_level1_approver_posting = d.data.data_posting.employee_name_level1_approver
    //                s.user_id_level2_approver_posting       = d.data.data_posting.user_id_level2_approver
    //                s.employee_name_level2_approver_posting = d.data.data_posting.employee_name_level2_approver
    //                s.user_id_final_approver_posting        = d.data.data_posting.user_id_final_approver
    //                s.employee_name_final_approver_posting  = d.data.data_posting.employee_name_final_approver
    //                s.user_id_disapprover_posting           = d.data.data_posting.user_id_disapprover
    //                s.employee_name_disapprover_posting     = d.data.data_posting.employee_name_disapprover
    //                s.user_id_cancel_pending_posting        = d.data.data_posting.user_id_cancel_pending
    //                s.employee_name_cancel_pending_posting  = d.data.data_posting.employee_name_cancel_pending
                
    //                s.level1_approval_date_posting          = d.data.data_posting.level1_approval_date   == "1900-01-01 12:00:00 AM" ? "----" : d.data.data_posting.level1_approval_date   ;
    //                s.level2_approval_date_posting          = d.data.data_posting.level2_approval_date   == "1900-01-01 12:00:00 AM" ? "----" : d.data.data_posting.level2_approval_date   ;
    //                s.final_approval_date_posting           = d.data.data_posting.final_approval_date    == "1900-01-01 12:00:00 AM" ? "----" : d.data.data_posting.final_approval_date    ;
    //                s.disapproval_date_posting              = d.data.data_posting.disapproval_date       == "1900-01-01 12:00:00 AM" ? "----" : d.data.data_posting.disapproval_date       ;
    //                s.cancel_pending_date_posting           = d.data.data_posting.cancel_pending_date    == "1900-01-01 12:00:00 AM" ? "----" : d.data.data_posting.cancel_pending_date    ;
    //                s.cancelled_date_posting                = d.data.data_posting.cancelled_date         == "1900-01-01 12:00:00 AM" ? "----" : d.data.data_posting.cancelled_date         ;

    //            }

    //        }
    //        else {
    //            swal('Error in Getting Approval History', d.data.message_descr, {icon:"warning"})
    //        }
    //    });
    //}


    s.btn_refresh_balances = function ()
    {

        //if (ValidateFields())
        //{
            
        var data =
            {
                leave_ctrlno                    : s.edit_leave_ctrlno
                , empl_id                       : s.txtb_empl_id
                , leaveledger_balance_as_of_sl  : $('#sl_current_balance').val()
                , leaveledger_balance_as_of_vl  : $('#vl_current_balance').val()
                , leaveledger_balance_as_of_sp  : $('#sp_current_balance').val()
                , leaveledger_balance_as_of_fl  : $('#fl_current_balance').val()
                , leaveledger_balance_as_of_oth : $('#cto_current_balance').val()
            }

            h.post("../cSSLeaveAppl/RefreshBalance",
            {
                 par_empl_id        : $('#ddl_name option:selected').val()
                ,par_year           : s.txtb_year_selected
                ,par_leavetype_code : $('#ddl_leave_type option:selected').val()
                ,data               : data
            }).then(function (d)
            {
                if (d.data.message == "success")
                {
                    swal("Do you want to Sync Balances?", d.data.message_descr, {
                        buttons: {
                            catch:
                            {
                                text : "Year, Sync",
                                value: "fresh",
                            },
                        },
                    }).then((value) => {
                            switch (value)
                            {
                                case "fresh":
                        
                                    $('#icn_refresh').removeClass();
                                    $('#icn_refresh').addClass('fa fa-refresh fa-spin');
        
                                    h.post("../cSSLeaveAppl/RefreshBalance",
                                    {
                                        par_empl_id             : $('#ddl_name option:selected').val()
                                        ,par_year               : s.txtb_year_selected
                                        ,par_leavetype_code     : $('#ddl_leave_type option:selected').val()
                                        ,data                   : data
                                    }).then(function (d) {
                                        if (d.data.message == "success")
                                        {
                                            s.vl_current_balance   = d.data.vl_current_balance;
                                            s.sl_current_balance   = d.data.sl_current_balance;
                                            s.sp_current_balance   = d.data.sp_current_balance;
                                            s.fl_current_balance   = d.data.fl_current_balance;
                                            s.cto_current_balance  = d.data.oth_balance;
                                
                                            s.leave_computation_edited();

                                            $('#icn_refresh').removeClass('fa-spin');
                                            swal("Successfully Balance Synchronize/Restored!", {icon:"success"});
                                        }
                                    });
                                    break;
                                default:
                            }
                        });
                }
            });
        //}
    }

    var init_table_cancel = function (par_data) {
        try {
            s.datalist_grid_cancell = par_data;
            s.oTable_cancel = $('#datalist_grid_cancell').dataTable(
                {
                    data: s.datalist_grid_cancell,
                    bSort: true,
                    bAutoWidth: false,
                    sDom: 'rt<"bottom">',
                    paging: false,
                    columns: [
                        
                        {
                            "mData": "leave_date_from",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'> <small style='display:none'>" + moment(data).format('YYYY-MM-DD') + "</small>" + moment(data).format('MMMM D, YYYY') + "</span>"
                            }
                        },
                        {
                            "mData": "leave_cancel_type",
                            "mRender": function (data, type, full, row)
                            {
                                var leave_cancel_type_descr = ""
                                if (full["leave_cancel_type"] == "HOL")
                                {
                                    leave_cancel_type_descr = "Holiday"
                                }
                                if (full["leave_cancel_type"] == "WORK_SUS") {
                                    leave_cancel_type_descr = "Work Suspension"
                                }
                                if (full["leave_cancel_type"] == "FL_TRNFR") {
                                    leave_cancel_type_descr = "Transfer Leave"
                                }
                                if (full["leave_cancel_type"] == "CNCEL_ONLY") {
                                    leave_cancel_type_descr = "Cancel Only"
                                }
                                return "<span class='text-center btn-block'>" + leave_cancel_type_descr + "</span>"
                            }
                        },
                        {
                            "mData": "leave_transfer_date",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + (moment(data).format('MMMM D, YYYY') == "January 1, 1900" ? "" : moment(data).format('MMMM D, YYYY')) + "</span>"
                            }
                        },
                        {
                            "mData": "reason",
                            "mRender": function (data, type, full, row) {
                                return "<span class=' btn-block'>" + data  + "</span>"
                            }
                        },
                        {
                            //"mData": "returned_remarks",
                            "mRender": function (data, type, full, row)
                            {
                                if (full["returned_remarks"].toString().trim() != "")
                                {
                                    return "<small><span class=' btn-block'>Remarks: " + full["returned_remarks"] + "</span>" + "<br/><span class=' btn-block'> Returned by: " + full["returned_employee_name"] + "</span></small>"
                                }
                                else
                                {
                                    return ""
                                }

                            }
                        },
                        {
                            "mData": "cancel_flag", "mRender": function (data, type, full, row) {
                                var checked = ""

                                if (data == "Y") {
                                    checked = "checked"
                                }
                                else {
                                    checked = ""
                                }
                                //return '';

                                return '<div ng-hide="' + s.show_pending_submit +'" id="checkbox_id_vja" style="cursor: pointer;" class="checkbox checkbox-primary text-center"><input class="checkbox_show"  style="width:20px;" id="checkbox' + row["row"] + '" ng-click="btn_check_action(' + row["row"] + ')" type="checkbox"' + checked + '><label for="checkbox' + row["row"] + '"></label></div>'
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


    s.btn_open_cancel = function ()
    {
        s.show_final_approved           = true;
        s.dis_cancel_txtbox             = true;
        s.show_pending_submit           = true;
        s.approved_by                   = "";
        s.approved_by_desig             = "";
        s.reason                        = "";
        s.leave_cancel_status_descr     = "";
        s.submitted_employee_name       = "";
        s.submitted_dttm                = "";
        s.final_approved_employee_name  = "";
        s.final_approved_dttm           = "";
        s.leave_cancel_type             = "";

        h.post("../cSSLeaveAppl/Retrieve_CancelList",
            {
                 par_empl_id        : $('#ddl_name option:selected').val()
                ,par_leave_ctrlno   : s.edit_leave_ctrlno
            }
        ).then(function (d)
        {
            if (d.data.message == "success")
            {
                s.approved_by                   = d.data.approved_name
                s.approved_by_desig             = d.data.approved_by_desig
                s.reason                        = d.data.dates_list[0].reason;
                s.leave_cancel_status_descr     = d.data.dates_list[0].leave_cancel_status_descr;
                s.submitted_employee_name       = d.data.dates_list[0].submitted_employee_name
                s.submitted_dttm                = moment(d.data.dates_list[0].submitted_dttm).format('YYYY-MM-DD hh:mm:ss A')
                s.final_approved_employee_name  = d.data.dates_list[0].final_approved_employee_name
                s.final_approved_dttm           = moment(d.data.dates_list[0].final_approved_dttm).format('YYYY-MM-DD hh:mm:ss A')
                s.leave_cancel_type             = d.data.dates_list[0].leave_cancel_type

                for (var i = 0; i < d.data.dates_list.length; i++)
                {
                    if (d.data.dates_list[i].leave_cancel_status == "N" ||
                        d.data.dates_list[i].leave_cancel_status == "C" ||
                        d.data.dates_list[i].leave_cancel_status == ""
                        )
                    {
                        s.dis_cancel_txtbox   = false;
                        s.show_pending_submit = false;
                    }

                    if (d.data.dates_list[i].leave_cancel_status == "F")
                    {
                        s.show_final_approved = false;
                    }

                    if (d.data.dates_list[i].leave_cancel_status == "S")
                    {
                        s.show_pending_submit = true;
                        break;
                    }
                }


                s.oTable_cancel.fnClearTable();
                s.datalist_grid_cancell = d.data.dates_list;
                if (d.data.dates_list.length > 0)
                {
                    s.oTable_cancel.fnAddData(d.data.dates_list);
                }
                $('#modal_cancellation').modal({ backdrop: 'static', keyboard: false });
            }
        })

    }
    s.btn_check_action = function (row_id)
    {
        var data = {
             leave_ctrlno         : s.datalist_grid_cancell[row_id].leave_ctrl_no
            ,empl_id              : s.datalist_grid_cancell[row_id].empl_id
            ,leave_cancel_date   : moment(s.datalist_grid_cancell[row_id].leave_date_from).format('YYYY-MM-DD')
            ,reason               : s.reason               
            ,leave_cancel_status  : "N"
            ,approved_by          : s.approved_by          
            ,approved_by_desig    : s.approved_by_desig    
            ,leave_cancel_type   : s.leave_cancel_type
        }
        h.post("../cSSLeaveAppl/Save_dtl",
        {
            data: data
            ,exist_flag: s.datalist_grid_cancell[row_id].cancel_flag
        }).then(function (d) {
            if (d.data.message == "success")
            {
                if (s.datalist_grid_cancell[row_id].cancel_flag == "N")
                {
                    s.leave_cancel_date     = "";
                    s.leave_cancel_type     = "";
                    s.reason                = "";

                    s.leave_cancel_date     = moment(s.datalist_grid_cancell[row_id].leave_date_from).format('YYYY-MM-DD')
                    s.leave_cancel_type     = s.datalist_grid_cancell[row_id].leave_cancel_type
                    s.reason                = s.datalist_grid_cancell[row_id].reason
                    $('#modal_cancellation_tranfer').modal({ backdrop: 'static', keyboard: false });
                }
                else
                {
                    s.leave_cancel_date     = "";
                    s.leave_cancel_type     = "";
                    s.reason                = "";
                    swal({ icon: "success", title: "Successfully Removed !" });
                }
                
                s.Retrieve_CancelList($('#ddl_name option:selected').val(), s.edit_leave_ctrlno)
                
            }
            else
            {
                swal({ icon: "warning", title: d.data.message });
            }
        })
    }

    s.btn_submit_cancel = function ()
    {
        if (   s.approved_by        == ""
            || s.approved_by_desig  == ""
            )
        {
            swal("You cannot Proceed this transaction!", "Type of Cancellation, Reason, Approved by and Approve by Designation is required!",{ icon: "warning" });
            return;
        }

        for (var i = 0; i < s.datalist_grid_cancell.length; i++)
        {
            if (s.datalist_grid_cancell[i].reason.toString() == "" && (s.datalist_grid_cancell[i].cancel_flag == true || s.datalist_grid_cancell[i].cancel_flag == "Y"))
            {
                swal("Please input Reason Remarks for cancellation!", { icon: "warning" });
                break;
            }
            else
            {
                var data = {
                    leave_ctrlno            : s.txtb_appl_nbr
                    ,empl_id                : s.txtb_empl_id  
                    ,approved_by            : s.approved_by          
                    ,approved_by_desig      : s.approved_by_desig    
                    ,leave_cancel_status    : "S"
                }
                h.post("../cSSLeaveAppl/Submit_Cancel", { data: data}).then(function (d)
                {
                    if (d.data.message == "success")
                    {
                        swal("Successfully Submitted!", { icon: "success" });
                        $('#modal_cancellation').modal("hide");
                        s.btn_print_cancel();
                    }
                    else
                    {
                        swal("You cannot Proceed this transaction!", "Select atleast one (1) date to cancel!", { icon: "warning" });
                    }
                })
            }
        }
    }

    s.btn_submit_cancel_pending = function ()
    {
        var data = {
             leave_ctrlno           : s.txtb_appl_nbr
            , empl_id               : s.txtb_empl_id
            ,leave_cancel_status    : "C"
        }
        h.post("../cSSLeaveAppl/CancelPending", { data: data}).then(function (d)
        {
            if (d.data.message == "success")
            {
                swal("Successfully Cancel Pending!", { icon: "success" });
                $('#modal_cancellation').modal("hide");
            }
            else
            {
                swal(d.data.message, { icon: "warning" });
            }
        })
    }


    s.btn_print_cancel = function ()
    {
        // if (s.leave_cancel_status_descr == "New" ||
        //     s.leave_cancel_status_descr == "Cancel Pending" ||
        //     s.leave_cancel_status_descr == "" )
        // {
        //     swal("You cannot Proceed this transaction!", "You need to Submit Cancellation!", { icon: "warning" });
        //     return;
        // }
        
        var application_nbr     = s.txtb_appl_nbr
        var empl_id             = s.txtb_empl_id
        var ReportName          = "CrystalReport"
        var SaveName            = "Crystal_Report"
        var ReportType          = "inline"
        var ReportPath          = ""
        var sp                  = ""
                
        ReportPath = "~/Reports/cryLeavePermission/cryLeaveCancellation.rpt";
        sp = "sp_leave_application_cancel_tbl_rep,par_empl_id," + empl_id + ",par_leave_ctrlno," + application_nbr;
                
        
        h.post("../cSSLeaveAppl/setPageHistory").then(function (d)
        {
            if (d.data.message == "success")
            {
                // *******************************************************
                // *** VJA : 2021-07-14 - Validation and Loading hide ****
                // *******************************************************
                s.employee_name_print = "LEAVE CANCELLATION";
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
            }
            else
            {
                swal(d.data.message, "", {icon:"warning"});
            }
        });
    }


    s.btn_update_leave_date = function ()
    {
        if (s.leave_cancel_type == "FL_TRNFR")
        {
            if (   s.reason                          == ""
                || s.leave_cancel_type               == ""
                || $('#leave_transfer_date').val()   == ""
                )
            {
                swal("You cannot Proceed this transaction!", "Type of Cancellation, Reason, and Transfer date is required!",{ icon: "warning" });
                return;
            }
        }
        else if (s.leave_cancel_type == "HOL" || s.leave_cancel_type == "WORK_SUS" || s.leave_cancel_type == "CNCEL_ONLY" || s.leave_cancel_type == "")
        {
            if (   s.reason                          == ""
                || s.leave_cancel_type               == ""
                )
            {
                swal("You cannot Proceed this transaction!", "Type of Cancellation and Reason is required!",{ icon: "warning" });
                return;
            }
        }

        var data = {
             leave_transfer_date  : $('#leave_transfer_date').val()   
            ,reason               : s.reason              
            ,empl_id              : $('#ddl_name option:selected').val()         
            ,leave_cancel_type    : s.leave_cancel_type
            ,leave_ctrlno         : s.edit_leave_ctrlno
            , leave_cancel_date     : $('#leave_cancel_date').val()  
        }
        
        h.post("../cSSLeaveAppl/UpdateCancel", { data:data }).then(function (d)
        {
            if (d.data.message == "success")
            {
                $('#modal_cancellation_tranfer').modal("hide");
                swal({ icon: "success", title: "Successfully Updated !" });
                s.Retrieve_CancelList($('#ddl_name option:selected').val(), s.edit_leave_ctrlno)
            }
        })
    }


    s.Retrieve_CancelList = function (par_empl_id, par_leave_ctrlno)
    {
        h.post("../cSSLeaveAppl/Retrieve_CancelList",
        {
            par_empl_id       : par_empl_id
            ,par_leave_ctrlno : par_leave_ctrlno
        }
        ).then(function (d)
        {
            if (d.data.message == "success")
            {
                s.FilterPageGrid();

                s.oTable_cancel.fnClearTable();
                s.datalist_grid_cancell = d.data.dates_list;
                if (d.data.dates_list.length > 0)
                {
                    s.oTable_cancel.fnAddData(d.data.dates_list);
                }
            }
        })
    }
    
    s.btn_cancelled = function (row_index)
    {
        try {
            swal({
                title: "Are you sure you want to cancel this Application?",
                text: "Once cancelled, you will not be able to recover this record!",
                icon: "warning",
                buttons: true,
                dangerMode: true,

            })
                .then(function (willDelete)
                {
                    if (willDelete)
                    {
                        h.post("../cSSLeaveAppl/CancelledStatus",
                        {
                            data: s.datalistgrid3[row_index]
                        }).then(function (d)
                        {
                            if (d.data.message == "success")
                            {
                                s.FilterPageGrid();
                                $('#main_modal').modal("hide");
                                swal("Your record has been cancelled!", { icon: "success", });
                            }
                            else {
                                swal({ title: d.data.message, icon: "warning", });
                            }
                        });
                    }
                });
        }
        catch (err)
        {
            swal({ icon: "warning", title: err.message });
        }
    }
    
    s.func_checked = function ()
    {
        if (justi_flag.checked == true)
        {
            s.div_justi_msg = true;
        } else
        {
            s.div_justi_msg = false;
        }
    }

    s.openJustification = function ()
    {
        //$('#modal_justification').modal({ backdrop: 'static', keyboard: false });

        h.post("../cSSLeaveAppl/Retrieve_Justification", { leave_ctrlno: s.txtb_appl_nbr, empl_id: s.txtb_empl_id}).then(function (d)
        {
            
            if (d.data.message == "success")
            {
                if (d.data.data == null)
                {
                    $('#summernote_justification').summernote();
                    var myHtml = $('.note-editable')
                    myHtml.html("")
                    myHtml.prepend("<p>May 4, 2023</p><p><br>________________________________________<br>PG Department Head<br>(Office)</p><p><br>Dear Madam:</p><p><br>This is in relation to the late filing of (Leave Type) applied for (Date Applied). I apologize for not submitting the leave application on time.</p><p><br>I hope for your kind consideration.</p><p><br>Thank you.</p><p><br>Very truly yours,<br><br><br><br>________________________________________<br>(Position)</p><p><br></p><p>Noted:<br>________________________________________<br>PG Department Head</p>")
                }
                else
                {
                    
                    $('#summernote_justification').summernote();
                    var myHtml = $('.note-editable')
                    myHtml.html("")
                    myHtml.prepend(d.data.data.summernote_descr)

                }

                $('#modal_justification').modal({ backdrop: 'static', keyboard: false });
            }
            else
            {
            }
        })
    }

    s.btn_save_justification = function ()
    {
        //var myHtml = $('#summernote_justification').summernote('code');
        var myHtml = $('.note-editable')[0].innerHTML

        var data = {
                 leave_ctrlno      : s.txtb_appl_nbr
                ,empl_id           : s.txtb_empl_id
                ,summernote_descr  : myHtml
        }
        //console.log(data)
        //return;
        h.post("../cSSLeaveAppl/Save_Justification", { data: data}).then(function (d)
        {
            if (d.data.message == "success")
            {
                $('#modal_justification').modal("hide");
                swal("Successfully Added", { icon: "success", });
            }
            else
            {
                swal({ icon: "warning", title: d.data.message });
            }
        })
    }
    s.search_in_list = function (value, table) {
        $("#" + table).DataTable().search(value).draw();
    }

    s.retrieve_cancel_type = function (type)
    {
        s.div_show_transfer_date = false;
        if (type == "FL_TRNFR")
        {
            s.div_show_transfer_date = true;
        }
    }

    s.Retrieve_LeaveHistory = function ()
    {
        $('#view_details_history').removeClass()
        $('#view_details_history').addClass('fa fa-spinner fa-spin')
        s.data_history = [];
        h.post("../cSSLeaveAppl/Retrieve_LeaveHistory", { leave_ctrlno: s.txtb_appl_nbr, empl_id: s.txtb_empl_id}).then(function (d)
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
    //***********************************************************//
    //***********************************************************// 
})