ng_selfService_App.controller("cSSFLPlan_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    
    var arr_dates       = [];
    s.holiDate          = [];
    var userid          = "";
    s.log_in_as_AO      = "";
    s.rowLen            = "10";
    s.year              = [];
    s.ShowFLP           = false;
    s.available_leave   = 0;
    s.ddl_name          = "";
    s.dept_list = []; 
    s.subdept_list = [];
    s.div_list = [];
    s.sec_list = [];
    s.ddl_report_type = "OLD";
    s.fl_plan_rep_year = "";
    s.ddl_dept = "";

    function init() {
        try
        {
            $("#modal_generating_remittance").modal();
            //**********************************************
            // Initialize data during page loads
            //**********************************************
            $("#ddl_name").select2().on('change', function (e) {
                s.FilterPageGrid();
            });
            h.post("../cSSFLPlan/InitializeData").then(function (d) {
                if (d.data.message == "success") {
                    userid          = d.data.um.user_id
                    s.holiDate        = d.data.holiDate;
                    s.statusList    = d.data.status;
                    s.txtb_empl_id  = d.data.user_info.empl_id;
                    s.ddl_name      = d.data.user_info.empl_id
                    s.empl_names    = d.data.empl_name;
                    s.menu_name     = d.data.um.menu_name;
                    s.dept_list     = d.data.dept_list   ;
                    s.subdept_list  = d.data.subdept_list;
                    s.div_list      = d.data.div_list    ;
                    s.sec_list      = d.data.sec_list    ;

                    s.ddl_dept = d.data.dept_code;
                    s.ddl_dept_fl_plan = d.data.dept_code;
                    d.data.log_in_as_AO == "True" ? s.log_in_as_AO = true : s.log_in_as_AO = false;

                    // **********************************************************
                    // ****SPECIAL ACCESS FOR APPROVED FL PLAN REPORT *********** 
                    // **********************************************************
                    if (userid == "U0029" ||  // Maam Vivian
                        userid == "U1442" ||  // Grace 
                        userid == "U1646"     // Cherry 
                        )
                    {
                        s.log_in_as_AO = true;
                    }
                    // **********************************************************
                    // **********************************************************
                    
                    if (d.data.flpLst.length > 0) {
                        init_table_data(d.data.flpLst);
                        arr_dates = d.data.flpLst;
                    }
                    else {
                        init_table_data([]);
                    }
                    if (d.data.flpLst1.length > 0)
                    {
                        init_table_data3(d.data.flpLst1);
                    }
                    else
                    {
                        init_table_data3([]);
                    }

                    initialize_calendar();
                    init_table_data2([]);
                    calendar_data(); 
                    
                    var curr_year = new Date().getFullYear().toString().trim();
                    s.fl_plan_rep_year = curr_year;
                    //**********************************************
                    //  Show/Hide ADD, EDIT, DELETE button 
                    //**********************************************
                    d.data.um.allow_add == "1" ? s.ShowAdd = true : s.ShowAdd = false;
                    d.data.um.allow_delete == "1" ? s.ShowDelete = true : s.ShowDelete = false;
                    d.data.um.allow_edit == "1" ? s.ShowEdit = true : s.ShowEdit = false;
                    //d.data.um.allow_view    == "1" ? s.ShowView     = true : s.ShowView     = false;
                    //d.data.um.allow_print == "1" ? s.ShowAdd = true : s.ShowAdd = false;
                    $("#modal_generating_remittance").modal("hide");
                    $('#txtb_year_selected').val(new Date().getFullYear().toString());
                }
                else {
                    swal(d.data.message, { icon: "warning", });
                }
            });
        }
        catch (err)
        {
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
                                if (full["rcrd_status"].toString() == "1" || full["rcrd_status"].toString() == "2" || full["rcrd_status"].toString() == "F") {
                                    temp = "<div class='xx input-group m-b'><span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'><div class='external-event navy-bg approved-bg'><h4>" + full["flp_application_date"] + " | " + full["application_nbr"] + "<br/>" + full["rcrd_status_descr"] + "</h4></div></span> <ul class='dropdown-menu'><li><a ng-click='btn_edit_action(" + row["row"] + ")'>View Details</a></li></ul></div>"
                                }
                                else if (full["rcrd_status"].toString() == "D" || full["rcrd_status"].toString() == "L") {
                                    temp = "<div class='xx input-group m-b'><span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'><div class='external-event navy-bg disapproved-bg'><h4>" + full["flp_application_date"] + " | " + full["application_nbr"] + " <br/>" + full["rcrd_status_descr"] + "</h4></div></span> <ul class='dropdown-menu'><li><a ng-click='btn_edit_action(" + row["row"] + ")'>View Details</a></li></ul></div>"
                                }
                                else if (full["rcrd_status"].toString() == "C") {
                                    temp = "<div class='xx input-group m-b'><span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'><div class='external-event navy-bg cancel-bg'><h4>" + full["flp_application_date"] + " | " + full["application_nbr"] + "<br/>" + full["rcrd_status_descr"] + "</h4></div></span> <ul class='dropdown-menu'><li><a ng-click='btn_edit_action(" + row["row"] + ")'>Edit</a></li><li><a ng-click='btn_del_row(" + row["row"] + ")'>Delete</a></li></ul></div>"
                                }
                                else if (full["rcrd_status"].toString() == "N") {
                                    temp = "<div class='xx input-group m-b'><span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'><div class='external-event navy-bg new-bg'><h4>" + full["flp_application_date"] + " | " + full["application_nbr"] + "<br/>" + full["rcrd_status_descr"] + "</h4></div></span> <ul class='dropdown-menu'><li><a ng-click='btn_edit_action(" + row["row"] + ")'>Edit</a></li><li><a ng-click='btn_del_row(" + row["row"] + ")'>Delete</a></li></ul></div>"
                                }
                                else if (full["rcrd_status"].toString() == "R") {
                                    temp = "<div class='xx input-group m-b'><span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'><div class='external-event navy-bg reviewed-bg'><h4>" + full["flp_application_date"] + " | " + full["application_nbr"] + "<br/>" + full["rcrd_status_descr"] + "</h4></div></span> <ul class='dropdown-menu'><li><a ng-click='btn_edit_action(" + row["row"] + ")'>View Details</a></li><li><a ng-click='btn_del_row(" + row["row"] + ")'>Delete</a></li></ul></div>"
                                }
                                else if (full["rcrd_status"].toString() == "S") {
                                    temp = "<div class='xx input-group m-b'><span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'><div class='external-event navy-bg submitted-bg'><h4>" + full["flp_application_date"] + " | " + full["application_nbr"] + "<br/>" + full["rcrd_status_descr"] + "</h4></div></span> <ul class='dropdown-menu'><li><a ng-click='btn_edit_action(" + row["row"] + ")'>View Details</a></li></ul></div>"
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
                            "width": "40%",
                            "targets": 0,
                            "mData": "flp_application_date",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "40%",
                            "targets": 1,
                            "mData": "rcrd_status_descr",
                            "mRender": function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width": "20%",
                            "targets": 2,
                            "mData": null,
                            "bSortable": false,
                            "mRender": function (data, type, full, row)
                            {
                                var temp = "";
                                if (full['rcrd_status'] == "N"
                                    //|| full['rcrd_status'] == "C"
                                ) {
                                    s.dis_del_row_3 = false;
                                    temp = '<center><div class="btn-group">' +
                                            '<button type="button" ng-disabled="dis_del_row_3" class="btn btn-danger btn-sm" ng-click="btn_del_row3(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Remove"><i class="fa fa-times"></i></button>' +
                                            '</div></center>';
                                }
                                //else if (full['rcrd_status'] == "F")
                                //{
                                //    temp = '<center><div class="btn-group">' +
                                //           '<button type="button" class="btn btn-success btn-sm" ng-click="btn_del_row3(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Transfer Date"><i class="fa fa-forward"></i></button>' +
                                //           '</div></center>';
                                //}
                                else
                                {
                                    temp = '';
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
                                if (full["created_by_user"] == userid) {
                                    s.dis_del_ul = false;
                                }
                                else {
                                    s.dis_del_ul = true;
                                }
                                if (s.log_in_as_AO == true)
                                {
                                    if (full["rcrd_status"].toString() == "F")
                                    {
                                        temp = "<div class='xx input-group m-b'><span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'><div class='external-event navy-bg approved-bg'><h4>" + full["flp_application_date"] + " | " + full["application_nbr"] + "<div class='pull-right'>" + full["empl_id"] + "</div>" + "<br/>" + full["rcrd_status_descr"] + "</h4></div></span> <ul class='dropdown-menu'><li><a ng-click='btn_edit_action(" + row["row"] + ")'>View Details</a></li></ul></div>"
                                    }
                                    else if (full["rcrd_status"].toString() == "1" || full["rcrd_status"].toString() == "2") {
                                        temp = "<div class='xx input-group m-b'><span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'><div class='external-event navy-bg approved-bg'><h4>" + full["flp_application_date"] + " | " + full["application_nbr"] + "<div class='pull-right'>" + full["empl_id"] + "</div>" + "<br/>" + full["rcrd_status_descr"] + "</h4></div></span> <ul class='dropdown-menu'><li><a ng-click='btn_edit_action(" + row["row"] + ")'>View Details</a></li></ul></div>"
                                    }
                                    else if (full["rcrd_status"].toString() == "D" || full["rcrd_status"].toString() == "L") {
                                        temp = "<div class='xx input-group m-b'><span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'><div class='external-event navy-bg disapproved-bg'><h4>" + full["flp_application_date"] + " | " + full["application_nbr"] + "<div class='pull-right'>" + full["empl_id"] + "</div>" + " <br/>" + full["rcrd_status_descr"] + "</h4></div></span> <ul class='dropdown-menu'><li><a ng-click='btn_edit_action(" + row["row"] + ")'>View Details</a></li></ul></div>"
                                    }
                                    else if (full["rcrd_status"].toString() == "C") {
                                        temp = "<div class='xx input-group m-b'><span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'><div class='external-event navy-bg cancel-bg'><h4>" + full["flp_application_date"] + " | " + full["application_nbr"] + "<div class='pull-right'>" + full["empl_id"] + "</div>" + "<br/>" + full["rcrd_status_descr"] + "</h4></div></span> <ul class='dropdown-menu'><li><a ng-click='btn_edit_action(" + row["row"] + ")'>Edit</a></li><li ng-hide='dis_del_ul'><a ng-click='btn_del_row(" + row["row"] + ")'>Delete</a></li></ul></div>"
                                    }
                                    else if (full["rcrd_status"].toString() == "N") {
                                        temp = "<div class='xx input-group m-b'><span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'><div class='external-event navy-bg new-bg'><h4>" + full["flp_application_date"] + " | " + full["application_nbr"] + "<div class='pull-right'>" + full["empl_id"] + "</div>" + "<br/>" + full["rcrd_status_descr"] + "</h4></div></span> <ul class='dropdown-menu'><li><a ng-click='btn_edit_action(" + row["row"] + ")'>Edit</a></li><li ng-hide='dis_del_ul'><a ng-click='btn_del_row(" + row["row"] + ")'>Delete</a></li></ul></div>"
                                    }
                                    else if (full["rcrd_status"].toString() == "R") {
                                        temp = "<div class='xx input-group m-b'><span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'><div class='external-event navy-bg reviewed-bg'><h4>" + full["flp_application_date"] + " | " + full["application_nbr"] + "<div class='pull-right'>" + full["empl_id"] + "</div>" + "<br/>" + full["rcrd_status_descr"] + "</h4></div></span> <ul class='dropdown-menu'><li><a ng-click='btn_edit_action(" + row["row"] + ")'>View Details</a></li><li ng-hide='dis_del_ul'></li></ul></div>"
                                    }
                                    else if (full["rcrd_status"].toString() == "S") {
                                        temp = "<div class='xx input-group m-b'><span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'><div class='external-event navy-bg submitted-bg'><h4>" + full["flp_application_date"] + " | " + full["application_nbr"] + "<div class='pull-right'>" + full["empl_id"] + "</div>" + "<br/>" + full["rcrd_status_descr"] + "</h4></div></span> <ul class='dropdown-menu'><li><a ng-click='btn_edit_action(" + row["row"] + ")'>View Details</a></li></ul></div>"
                                    }
                                }
                                else
                                {
                                    if (full["rcrd_status"].toString() == "F") {
                                        temp = "<div class='xx input-group m-b'><span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'><div class='external-event navy-bg approved-bg'><h4>" + full["flp_application_date"] + " | " + full["application_nbr"] + "<div class='pull-right'>" + full["empl_id"] + "</div>" + "<br/>" + full["rcrd_status_descr"] + "</h4></div></span> <ul class='dropdown-menu'><li><a ng-click='btn_edit_action(" + row["row"] + ")'>View Details</a></li></ul></div>"
                                    }
                                    else if (full["rcrd_status"].toString() == "1" || full["rcrd_status"].toString() == "2" || full["rcrd_status"].toString() == "3") {
                                        temp = "<div class='xx input-group m-b'><span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'><div class='external-event navy-bg approved-bg'><h4>" + full["flp_application_date"] + " | " + full["application_nbr"] + "<br/>" + full["rcrd_status_descr"] + "</h4></div></span> <ul class='dropdown-menu'><li><a ng-click='btn_edit_action(" + row["row"] + ")'>View Details</a></li><li ng-hide='dis_del_ul'></li></ul></div>"
                                    }
                                    else if (full["rcrd_status"].toString() == "D" || full["rcrd_status"].toString() == "L") {
                                        temp = "<div class='xx input-group m-b'><span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'><div class='external-event navy-bg disapproved-bg'><h4>" + full["flp_application_date"] + " | " + full["application_nbr"] + " <br/>" + full["rcrd_status_descr"] + "</h4></div></span> <ul class='dropdown-menu'><li><a ng-click='btn_edit_action(" + row["row"] + ")'>View Details</a></li></ul></div>"
                                    }
                                    else if (full["rcrd_status"].toString() == "C") {
                                        temp = "<div class='xx input-group m-b'><span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'><div class='external-event navy-bg cancel-bg'><h4>" + full["flp_application_date"] + " | " + full["application_nbr"] + "<br/>" + full["rcrd_status_descr"] + "</h4></div></span> <ul class='dropdown-menu'><li><a ng-click='btn_edit_action(" + row["row"] + ")'>Edit</a></li><li ng-hide='dis_del_ul'><a ng-click='btn_del_row(" + row["row"] + ")'>Delete</a></li></ul></div>"
                                    }
                                    else if (full["rcrd_status"].toString() == "N") {
                                        temp = "<div class='xx input-group m-b'><span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'><div class='external-event navy-bg new-bg'><h4>" + full["flp_application_date"] + " | " + full["application_nbr"] + "<br/>" + full["rcrd_status_descr"] + "</h4></div></span> <ul class='dropdown-menu'><li><a ng-click='btn_edit_action(" + row["row"] + ")'>Edit</a></li><li ng-hide='dis_del_ul'><a ng-click='btn_del_row(" + row["row"] + ")'>Delete</a></li></ul></div>"
                                    }
                                    else if (full["rcrd_status"].toString() == "R") {
                                        temp = "<div class='xx input-group m-b'><span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'><div class='external-event navy-bg reviewed-bg'><h4>" + full["flp_application_date"] + " | " + full["application_nbr"] + "<br/>" + full["rcrd_status_descr"] + "</h4></div></span> <ul class='dropdown-menu'><li><a ng-click='btn_edit_action(" + row["row"] + ")'>View Details</a></li><li ng-hide='dis_del_ul'></li></ul></div>"
                                    }
                                    else if (full["rcrd_status"].toString() == "S") {
                                        temp = "<div class='xx input-group m-b'><span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'><div class='external-event navy-bg submitted-bg'><h4>" + full["flp_application_date"] + " | " + full["application_nbr"] + "<br/>" + full["rcrd_status_descr"] + "</h4></div></span> <ul class='dropdown-menu'><li><a ng-click='btn_edit_action(" + row["row"] + ")'>View Details</a></li></ul></div>"
                                    }
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
    function calendar_data() {
        try {
            for (var x = 0; x < arr_dates.length; x++) {
                var event = new Object();

                if (arr_dates[x].created_by_user == userid)
                {
                    event.id = (arr_dates[x].application_nbr + "_true"); // unique event id;
                }
                else
                {
                    event.id = (arr_dates[x].application_nbr + "_false"); // unique event id;
                }
                
                event.title = arr_dates[x].flp_application_date;
                event.start = arr_dates[x].flp_application_date;
                event.description = arr_dates[x].rcrd_status_descr;
                event.backgroundColor = color_dates(arr_dates[x].rcrd_status);
                event.borderColor = 'transparent';
                event.extendedProps = x;
                
                $('#calendar').fullCalendar('renderEvent', event, true);
            }

            //calendar_data_holiday();
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }
    //************************************//
    // Assigned Calendar Events to Dates
    //************************************// 
    function calendar_data_holiday() {
        try {
            var last_prop = arr_dates.length;
            for (var x = 0; x < holiDate.length; x++) {
                var event = new Object();
                event.id = holiDate[x]; // unique event id;
                event.title = "";//holiDate[x].holiday_name;
                event.start = holiDate[x].holiday_date;
                event.description = holiDate[x].holiday_name;
                event.backgroundColor = color_dates("xx");
                event.className  = 'holiday-bg';
                event.borderColor = 'transparent';
                event.extendedProps = 'xx';
                $('#calendar').fullCalendar('renderEvent', event, true);
                last_prop++;
            }
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }
    
    function initialize_calendar() {
        try {
            var date = new Date();
            var d = date.getDate();
            var m = date.getMonth();
            var y = date.getFullYear();
            var start_date = (y - 1) + '-01-01';
            var end_date = (y + 1) + '-12-31';

            $('#calendar').fullCalendar({
                aspectRatio: 1.5,
                customButtons: {
                    btn_add_btn: {
                        text: 'Add2',
                        click: function () {
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
                    
                    if (el.originalEvent.target.className == "fa fa-times") {
                        btn_del_row1( calEvent.extendedProps)
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
                        $('.popover').popover('hide')
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
                            return '<div onClick="$(\'#add_force_leave\').click();"><h5 style="cursor:pointer;">Apply Force Leave Plan</h5></div>';
                        },
                    }).popover('show');
                    $(".fc-highlight").css("background", "red");
                },
                eventRender: function (event, element, view) {
                    if (event.extendedProps == "xx") {
                        element.find('.fc-title').prepend('');
                        element.find('.fc-title').append('<div class="holiday-bg"><span><b>' + event.description + '</b></span></div>');
                        element.popover({
                            animation: true,
                            placement: function (context, source)
                            {
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
                        
                        if (event.description == "New" && event.id.includes("true") == true) {
                            element.find('.fc-title').prepend('<div class="ibox-tools" style="padding-bottom:4px;"><i class="fa fa-times" data-toggle="tooltip" data-placement="top" title="Delete"></i></div>');
                        }
                        else {
                            element.find('.fc-title').prepend('<br>');
                        }
                        element.find('.fc-title').append('<div class="hr-line-solid-no-margin"></div><span style="font-size: 12px"><b>' + event.description + '</b></span></div>');
                    }
                },
                dayRender: function (date, cell) {
                    for (var x = 0; x < s.holiDate.length; x++) {
                        if (date.format("YYYY-MM-DD") == s.holiDate[x].holiday_date) {
                            cell.prepend("<div class='holiday' data-toggle='tooltip' data-placement='top' title='" + s.holiDate[x].holiday_name + "'><i class='fa fa-star text-warning'></i><small style='color:white;'>" + s.holiDate[x].holiday_name + "</small></div>");
                        }
                    }

                }
            });
            
            $('.fc-btn_add_btn-button').html("<i class='fa fa-plus-circle'></i> Apply");
            $('.fc-btn_add_btn-button').addClass("btn btn-success");
            $('.fc-btn_add_btn-button').prop("id", "add");

            $('.fc-center').append('<div style="width:0%; float:left;padding-left:-5px;position:relative;" class="input-group date" id="datepickerX" data-provide="datepicker">' +
                '<input type="text" style="width:100px;display:none;"  id="txtb_year_selected" ng-model="txtb_year_selected" ng-change="FilterPageGrid()"/>' +
                '<div class="input-group-addon" style="border:none;padding-left:0px;padding-top:7px;">' +
                '<span class="fa fa-calendar" id="mini-calendar-icn"></span>' +
                '</div></div>');

            $('.fc-center > h2').on("click", function () {
                $("span#mini-calendar-icn").click();
            });

            $('.fc-next-button').click(function () {
                $('.popover').popover('hide')
                s.FilterPageGrid();
            });
            $("#datepickerX").datepicker({
                format: "yyyy-mm",
                startView: "years",
                minViewMode: "months",
                autoclose: true,
            });

            $('#datepickerX').datepicker().on('changeDate', function (ev) {
                $('#calendar').fullCalendar('gotoDate', $('#txtb_year_selected').val() + '-01');
                s.FilterPageGrid();
            });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    s.maxSettings = {
        display: 'inline',
        select: 5,
        headerText: 'Pick up to 5 days'
    };
    
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
        try {
            //s.txtb_year_selected = $('#txtb_year_selected').val().substring(0, 4);
            var date = new Date($('#calendar').fullCalendar('getDate'));
            s.txtb_year_selected = date.getFullYear()
           
            h.post("../cSSFLPlan/FilterPageGrid", {
                p_empl_id: $('#ddl_name option:selected').val()
                , p_appr_status: $('#ddl_status option:selected').val()
                , p_year: s.txtb_year_selected
            }).then(function (d) {
                if (d.data.message == "success") {
                    s.holiDate = [];
                    s.holiDate = d.data.holiDate;
                    arr_dates = [];
                    // Reinitialize Events
                    $('#calendar').fullCalendar('removeEvents', function (e) {
                        return true;
                    });
                    s.oTable.fnClearTable();
                    s.datalistgrid = d.data.filteredGrid;
                    s.oTable3.fnClearTable();
                    s.datalistgrid3 = d.data.filteredGrid1;
                    console.log(s.datalistgrid3)
                    if (d.data.filteredGrid1.length > 0) {
                        s.oTable3.fnAddData(d.data.filteredGrid1);
                    }
                    
                    if (d.data.filteredGrid.length > 0) {
                        s.oTable.fnAddData(d.data.filteredGrid);
                        arr_dates = d.data.filteredGrid;
                    }
                    calendar_data();
                }
            })
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }
    //s.btn_open_info = function() {
    //    try {
    //        btn = document.getElementById('info');
    //        btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Status Info.';
    //        s.ModalTitle = "Status Color Legend";

    //        setTimeout(function () {
    //            btn.innerHTML = '<i class="fa fa-info-circle"> </i> Status Info.';
    //            $('#info_modal').modal({ backdrop: 'static', keyboard: false });
    //        }, 300);
    //    }
    //    catch (err) {
    //        swal({ icon: "warning", title: err.message });
    //    }
    //}
    //************************************//
    //***       Open Add Modal        ****//
    //************************************//
    function open_modal() {
        try
        {
            s.resubmit          = "FALSE"
            s.save_mode         = "ADD";
            s.available_leave   = 0;

            clearentry();
            s.oTable2.fnDraw();
            s.oTable2.fnClearTable();
            
            $('.popover').popover('hide');
            
            var date = new Date();

            s.txtb_year_selected = $('#txtb_year_selected').val().substring(0, 4);

            h.post("../cSSFLPlan/GenerateNewApplNbr", {
                par_empl_id: $('#ddl_name option:selected').val()
                , par_year: s.txtb_year_selected
            }).then(function (d) {
                if (d.data.message == "success")
                {
                    if (d.data.available_leave[0] > 0) {
                        //d.data.new_appl_nbr[0]
                        s.holiDate = [];
                        for (var x = 0; x < d.data.holiDate.length; x++)
                        {
                            s.holiDate.push(d.data.holiDate[x].holiday_date)
                        }
                        s.txtb_appl_nbr = d.data.new_appl_nbr[0];
                        s.txtb_date_applied = moment(new Date()).format('YYYY-MM-DD');
                        s.txtb_approval_status = "New";
                        s.txtb_empl_name = $('#ddl_name option:selected').html();
                        s.txtb_empl_id = $('#ddl_name option:selected').val();

                        s.isEdit = false;
                        s.ModalTitle = "Add New Record";
                        s.dis_plan_date = false;
                        s.show_cancel = false;

                        btn = document.getElementById('add');
                        btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Apply';

                        var s_date = s.start_date;
                        for (var x = 0; x < s.tot_nbr_days; x++)
                        {
                            var data = {
                                flp_application_date: s_date,
                                rcrd_status_descr: "New",
                                rcrd_status: "N"
                            }
                            var date = new Date(s_date).getDay();
                            if (date == "6" || date == "0" || s.holiDate.includes(s_date) == true)
                            {

                            }
                            else
                            {
                                s.datalistgrid2.push(data)
                                s.oTable2.fnClearTable();
                                s.oTable2.fnAddData(s.datalistgrid2);
                            }
                            s_date = moment(s_date).add(1, "days").format('YYYY-MM-DD')
                        }

                        setTimeout(function ()
                        {
                            btn.innerHTML = '<i class="fa fa-plus-circle"> </i> Apply';
                            $('#main_modal').modal({ backdrop: 'static', keyboard: false });
                        }, 300);
                    }
                    else
                    {
                        swal({ icon: "warning", title: "Already reach the maximum number of application for this leave! " });
                    }
                }
                else
                {
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
        try
        {
            s.datalistgrid2 = [];
            s.oTable2.fnClearTable();
            s.oTable2.fnAddData(s.datalistgrid2);

            s.show_calendar_icon    = true;
            s.temp_approval_status  = "N";
            
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
    //***       Open Add Modal        ****//
    //************************************//
    s.add_force_leave = function ()
    {
        try
        {
            s.temp_approval_status = "N";
            btn = document.getElementById('submit');
            btn.innerHTML = '<i class="fa fa-paper-plane-o"></i> Submit';

            s.dis_edit           = false;
            s.dis_submit         = false;
            s.dis_plan_date      = false;
            s.show_calendar_icon = true;

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
    //************************************//
    //***  Add Dates to datalistgrid2
    //************************************//
    s.btn_add_date = function ()
    {
        try
        {
            if (ValidateFields3())
            {
                s.already_exist = true;
                var data = {
                    flp_application_date: $('#txtb_plan_date').val()
                    , rcrd_status_descr: "New"
                    , rcrd_status: "N"
                }
                var date = new Date(data.flp_application_date).getDay();
                // if (date == "6" || date == "0" || s.holiDate.includes(data.flp_application_date) == true)
                if (s.holiDate.includes(data.flp_application_date) == true)
                {
                    swal("Date selected is holiday.", { icon: "warning", title: "Could not add date" });
                }
                else
                {
                    s.oTable2.fnClearTable();
                    s.oTable2.fnAddData(s.datalistgrid2);
                }

                // Check if date selected already added to datalistgrid2
                for (var x = 1; x <= $('#datalist_grid2').DataTable().page.info().pages; x++)
                {
                    if (get_page($('#txtb_plan_date').val()) == false)
                    {
                        s.oTable2.fnPageChange(x);
                    }
                    else {
                        break;
                    }
                    if (x == $('#datalist_grid2').DataTable().page.info().pages && get_page($('#txtb_plan_date').val()) == false)
                    {
                        s.already_exist = false;
                    }
                }
                
                
                if (s.already_exist == false) {
                     //Check if selected date is holiday or weekend
                    //if (date == "6" || date == "0" || s.holiDate.includes(data.flp_application_date) == true)
                    if (s.holiDate.includes(data.flp_application_date) == true)
                    {
                        return;
                    }
                    else
                    {
                        s.datalistgrid2.push(data)
                        s.oTable2.fnClearTable();
                        s.oTable2.fnAddData(s.datalistgrid2);
                        for (var x = 1; x <= $('#datalist_grid2').DataTable().page.info().pages; x++)
                        {
                            if (get_page($('#txtb_plan_date').val()) == false)
                            {
                                s.oTable2.fnPageChange(x);
                            }
                            else
                            {
                                break;
                            }
                        }
                    }
                }
                $('#txtb_plan_date').val("");
            }
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }
    
    //************************************// 
    //*** Save New Record  -  Save as NEW
    //**********************************// 
    //s.btn_save_click = function ()
    //{
    //    try {
    //        s.txtb_year_selected = $('#txtb_year_selected').val().substring(0, 4);
    //        if (s.datalistgrid2.length > 0)
    //        {
    //            h.post("../cSSFLPlan/GenerateNewApplNbr", {
    //                par_empl_id : $('#ddl_name option:selected').val()
    //                , par_year  : s.txtb_year_selected
    //            }).then(function (d) {
    //                if (d.data.message == "success")
    //                {
    //                    if (d.data.available_leave[0] >= s.datalistgrid2.length)
    //                    {
    //                        var data2 = [];
    //                        var data = {
    //                            application_nbr: d.data.new_appl_nbr[0]
    //                            , empl_id: s.txtb_empl_id
    //                            , detail_remarks: ""
    //                            , approval_status: "N"
    //                            , posting_status: 0
    //                        }
                            
    //                        for (var x = 0; x < s.datalistgrid2.length; x++)
    //                        {
    //                            data2.push({
    //                                application_nbr: data.application_nbr
    //                                , flp_application_date: s.datalistgrid2[x].flp_application_date
    //                                , empl_id: s.txtb_empl_id
    //                                , rcrd_status: "N"
    //                                , approval_status: "N"
    //                                , approval_status_descr: "New"
    //                                , rcrd_status_descr: "New"
    //                            });
    //                        }

    //                        h.post("../cSSFLPlan/CheckExist", { data2: data2 }).then(function (d)
    //                        {
    //                            if (d.data.message_oth_valid == "late-application" || d.data.message_oth_valid == "no-december")
    //                            {
    //                                swal(d.data.message, { icon: "warning", title: d.data.message_oth });
    //                            }
    //                            else if (d.data.message == "" || d.data.message == null)
    //                            {
    //                                btn = document.getElementById('addFinal');
    //                                btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Save';

    //                                h.post("../cSSFLPlan/Save", { data: data, data2: data2 }).then(function (d)
    //                                {
    //                                    if (d.data.message == "success")
    //                                    {
    //                                        s.FilterPageGrid();
    //                                        $('#main_modal').modal("hide");
    //                                        swal("Your record has been saved!", { icon: "success", });
    //                                    }
    //                                    else
    //                                    {
    //                                        swal(d.data.message, { icon: "warning", });
    //                                    }
    //                                    btn.innerHTML = '<i class="fa fa-save"> </i> Save';
    //                                });
    //                            }
    //                            else
    //                            {
    //                                swal(d.data.message, { icon: "warning", title: "Alredy set a schedule for this date!" });
    //                            }
    //                        });
    //                    }
    //                    else
    //                    {
    //                        swal({ icon: "warning", title: d.data.available_leave[0].toString() + " slot/s available for force leave plan." });
    //                    }
    //                }
    //                else
    //                {
    //                    swal(d.data.message, { icon: "warning", });
    //                }
    //            });
    //        }
    //        else
    //        {
    //            ValidateFields3();
    //        }
    //    }
    //    catch (err) {
    //        swal({ icon: "warning", title: err.message });
    //    }
    //}
    //************************************// 
    //*** Submit and Resubmit Record
    //**********************************// 
    s.btn_submit_click = function ()
    {
        try {
            s.txtb_year_selected = $('#txtb_year_selected').val().substring(0, 4);
            if (s.resubmit == "TRUE")
            {
                var temp_counter = 0;
                for (var x = 0; x < s.datalistgrid2.length; x++)
                {
                    if (s.datalistgrid2[x].rcrd_status != "L")
                    {
                        temp_counter = temp_counter + 1;
                    }
                }
                
                if (temp_counter > 0)
                {
                    h.post("../cSSFLPlan/GenerateNewApplNbr", {
                        par_empl_id : $('#ddl_name option:selected').val()
                        , par_year  : s.txtb_year_selected
                    }).then(function (d) {
                        if (d.data.message == "success")
                        {
                            var data2 = [];

                            btn = document.getElementById('submit');
                            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Resubmit';
                            
                            if (d.data.available_leave[0] >= s.datalistgrid2.length)
                            {
                                var data = {
                                    application_nbr: s.edit_appr_ctrl
                                    , empl_id: s.txtb_empl_id
                                    , approval_status: "S"
                                    , approval_id: s.edit_approval_id
                                }

                                for (var x = 0; x < s.datalistgrid2.length; x++)
                                {
                                    if (s.datalistgrid2[x].rcrd_status != "L")
                                    {
                                        data2.push({
                                            application_nbr: data.application_nbr
                                            , flp_application_date: s.datalistgrid2[x].flp_application_date
                                            , empl_id: s.txtb_empl_id
                                            , rcrd_status: "S"
                                            , approval_status: "S"
                                            , approval_status_descr: "Submitted"
                                            , rcrd_status_descr: "Submitted"
                                        });
                                    }
                                }
                                h.post("../cSSFLPlan/CheckExist2", { data2: data2 }).then(function (d)
                                {
                                    if (d.data.message == "" || d.data.message == null)
                                    {
                                        h.post("../cSSFLPlan/ReSubmitAll", { data: data, data2: data2 }).then(function (d)
                                        {
                                            if (d.data.message == "success")
                                            {
                                                s.FilterPageGrid();
                                                $('#main_modal').modal("hide");
                                                swal("Your record has been Submitted!", { icon: "success", });
                                            }
                                            else
                                            {
                                                swal(d.data.message, { icon: "warning", });
                                            }
                                            btn.innerHTML = '<i class="fa fa-paper-plane-o"> </i> Resubmit';
                                        });
                                    }
                                    else
                                    {
                                        swal(d.data.message, { icon: "warning", title: "Alredy set a schedule for this date!" });
                                    }
                                });
                            }
                            else
                            {
                                swal({ icon: "warning", title: d.data.available_leave[0].toString() + " slot/s available for force leave plan." });
                            }
                        }
                        else
                        {
                            swal(d.data.message, { icon: "warning", });
                        }
                    });
                }
                else
                {
                    ValidateFields3();
                }
            }
            else
            {
                if (s.datalistgrid2.length > 0)
                {
                    h.post("../cSSFLPlan/GenerateNewApplNbr", {
                        par_empl_id: $('#ddl_name option:selected').val()
                        , par_year: s.txtb_year_selected
                    }).then(function (d) {
                        if (d.data.message == "success")
                        {
                            var data2 = [];
                            if (s.save_mode == "ADD")
                            {
                                if (d.data.available_leave[0] >= s.datalistgrid2.length)
                                {
                                    btn = document.getElementById('submit');
                                    btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Submit';
                                    
                                    data = {
                                        application_nbr: d.data.new_appl_nbr[0]
                                        , empl_id: s.txtb_empl_id
                                        , detail_remarks: ""
                                        , approval_status: "S"
                                        , posting_status: 0
                                    };

                                    for (var x = 0; x < s.datalistgrid2.length; x++)
                                    {
                                        data2.push({
                                            application_nbr: data.application_nbr
                                            , flp_application_date: s.datalistgrid2[x].flp_application_date
                                            , empl_id: s.txtb_empl_id
                                            , rcrd_status: "S"
                                            , approval_status: "S"
                                            , approval_status_descr: "Submitted"
                                            , rcrd_status_descr: "Submitted"
                                        });
                                    }
                                    h.post("../cSSFLPlan/CheckExist", { data2: data2 }).then(function (d)
                                    {
                                        //if (d.data.message_oth_valid == "late-application" || d.data.message_oth_valid == "no-december")
                                        if (d.data.message_oth_valid == "late-application" || d.data.message_oth_valid == "weekend_validation")
                                        {
                                            swal(d.data.message, { icon: "warning", title: d.data.message_oth });
                                            btn.innerHTML = '<i class="fa fa-paper-plane-o"> </i> Submit';
                                        }
                                        else if (d.data.message == "" || d.data.message == null)
                                        {
                                            h.post("../cSSFLPlan/Save2", { data: data, data2: data2 }).then(function (d)
                                            {
                                                if (d.data.message == "success")
                                                {
                                                    s.FilterPageGrid();
                                                    $('#main_modal').modal("hide");
                                                    swal("Your record has been Submitted!", { icon: "success", });
                                                }
                                                else
                                                {
                                                    swal(d.data.message, { icon: "warning", });
                                                }
                                                btn.innerHTML = '<i class="fa fa-paper-plane-o"> </i> Submit';
                                            });
                                        }
                                        else
                                        {
                                            swal(d.data.message, { icon: "warning", title: "Alredy set a schedule for this date!" });
                                        }
                                    });
                                }
                                else
                                {
                                    btn.innerHTML = '<i class="fa fa-paper-plane-o"> </i> Submit';
                                    swal({ icon: "warning", title: d.data.available_leave[0].toString() + " slot/s available for Force Leave Plan." });
                                }
                            }
                            else if (s.save_mode == "EDIT")
                            {
                                btn = document.getElementById('submit');
                                btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Submit';

                                if ((d.data.available_leave[0] + s.getDtlDataLength) >= s.datalistgrid2.length)
                                {
                                    data = {
                                        application_nbr: s.edit_appr_ctrl
                                        , empl_id: s.txtb_empl_id
                                        , approval_status: "S"
                                    }

                                    for (var x = 0; x < s.datalistgrid2.length; x++)
                                    {
                                        data2.push({
                                            application_nbr: data.application_nbr
                                            , flp_application_date: s.datalistgrid2[x].flp_application_date
                                            , empl_id: s.txtb_empl_id
                                            , rcrd_status: "S"
                                            , approval_status: "S"
                                            , approval_status_descr: "Submitted"
                                            , rcrd_status_descr: "Submitted"
                                        });
                                    }
                                    h.post("../cSSFLPlan/CheckExist3", { data2: data2 }).then(function (d)
                                    {
                                        if (d.data.message == "" || d.data.message == null)
                                        {
                                            h.post("../cSSFLPlan/SaveSubmit", { data: data, data2: data2 }).then(function (d)
                                            {
                                                if (d.data.message == "success")
                                                {
                                                    s.FilterPageGrid();
                                                    $('#main_modal').modal("hide");
                                                    swal("Your record has been Submitted!", { icon: "success", });
                                                }
                                                else
                                                {
                                                    swal(d.data.message, { icon: "warning", });
                                                }
                                                btn.innerHTML = '<i class="fa fa-paper-plane-o"> </i> Submit';
                                            });
                                        }
                                        else
                                        {
                                            swal(d.data.message, { icon: "warning", title: "Alredy set a schedule for this date!" });
                                        }
                                    });
                                }
                                else
                                {
                                    swal({ icon: "warning", title: (d.data.available_leave[0] + s.getDtlDataLength) + " slot/s available for Force Leave Plan." });
                                }
                            }
                        }
                        else
                        {
                            swal(d.data.message, { icon: "warning", });
                        }
                    });
                }
                else
                {
                    ValidateFields3();
                }
            }
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    //************************************// 
    //*** Open Edit Modal         
    //**********************************// 
    s.btn_edit_action = function (row_id) {
        //edit_action(row_id);
        try {
            s.isEdit = true;
            s.save_mode = "EDIT"
            s.ModalTitle = "Edit Existing Record";
            s.available_leave = 0;

            btn = document.getElementById('submit');
            if (s.datalistgrid3[row_id].approval_status == "C") {
                btn.innerHTML = '<i class="fa fa-paper-plane-o"></i> Re-Submit';
                s.resubmit = "TRUE"
            }
            else {
                btn.innerHTML = '<i class="fa fa-paper-plane-o"></i> Submit';
                s.resubmit = "FALSE"
            }

            h.post("../cSSFLPlan/GetDetailsData", {
                p_application_nbr: s.datalistgrid3[row_id].application_nbr
            }).then(function (d) {
                if (d.data.message == "success") {
                    s.temp_row_id = row_id;
                    s.txtb_empl_id = s.datalistgrid3[row_id].empl_id;
                    s.txtb_remarks = s.datalistgrid3[row_id].detail_remarks;
                    s.txtb_appl_nbr = s.datalistgrid3[row_id].application_nbr;
                    s.txtb_empl_name = s.datalistgrid3[row_id].employee_name;
                    s.edit_appr_ctrl = s.datalistgrid3[row_id].application_nbr;
                    s.edit_approval_id = s.datalistgrid3[row_id].approval_id;
                    s.txtb_date_applied = s.datalistgrid3[row_id].date_applied;

                    s.oTable2.fnClearTable();
                    s.datalistgrid2 = d.data.flpDtlLst;
                    s.getDtlDataLength = d.data.flpDtlLst.length;

                    if (d.data.flpDtlLst.length > 0) {
                        s.oTable2.fnAddData(d.data.flpDtlLst);
                    }
                    if (d.data.creator == "true") {
                        if (s.datalistgrid3[row_id].approval_status == "N") {
                            s.dis_edit = false;
                            s.dis_submit = false;
                            s.show_cancel = false;
                            s.dis_plan_date = false;
                            s.show_calendar_icon = true;
                        }
                        else if (s.datalistgrid3[row_id].approval_status == "C") {
                            s.dis_edit = true;
                            s.dis_submit = false;
                            s.show_cancel = false;
                            s.dis_plan_date = false;
                            s.show_calendar_icon = true;
                        }
                        else if (s.datalistgrid3[row_id].approval_status == "S" || s.datalistgrid3[row_id].approval_status == "L" || s.datalistgrid3[row_id].approval_status == "D") {
                            s.dis_edit = true;
                            s.dis_submit = true;
                            s.show_cancel = false;
                            s.dis_plan_date = true;
                            s.show_calendar_icon = false;
                        }
                        else {
                            s.dis_edit = true;
                            s.dis_submit = true;
                            s.show_cancel = true;
                            s.dis_plan_date = true;
                            s.show_calendar_icon = false;
                        }
                    }
                    else {
                        s.dis_edit = true;
                        s.dis_submit = true;
                        s.show_cancel = false;
                        s.dis_plan_date = true;
                        s.show_calendar_icon = false;
                        s.dis_del_row_3 = true;
                    }

                    $('#edit').attr('ngx-data', row_id);
                    var row_edited = $('#edit').attr("ngx-data");
                    s.datalistgrid3[row_edited].flp_application_date = $('#txtb_plan_date').val();
                    setTimeout(function () {
                        $('#main_modal').modal({ backdrop: 'static', keyboard: false });
                    }, 300);
                }
                else {
                    swal(d.data.message, { icon: "warning", });
                }
            });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }
    
    //************************************// 
    //*** Open Edit Modal         
    //**********************************// 
    function edit_action(row_id)
    {
        try
        {
            s.isEdit            = true;
            s.save_mode         = "EDIT"
            s.ModalTitle        = "Edit Existing Record";
            s.available_leave   = 0;
            
            btn = document.getElementById('submit');
            if (s.datalistgrid[row_id].approval_status == "C") {
                btn.innerHTML = '<i class="fa fa-paper-plane-o"></i> Re-Submit';
                s.resubmit = "TRUE"
            }
            else {
                btn.innerHTML = '<i class="fa fa-paper-plane-o"></i> Submit';
                s.resubmit = "FALSE"
            }

            h.post("../cSSFLPlan/GetDetailsData", {
                p_application_nbr: s.datalistgrid[row_id].application_nbr
            }).then(function (d) {
                if (d.data.message == "success")
                {
                    s.temp_row_id = row_id;
                    s.txtb_empl_id = s.datalistgrid[row_id].empl_id;
                    s.txtb_remarks = s.datalistgrid[row_id].detail_remarks;
                    s.txtb_appl_nbr = s.datalistgrid[row_id].application_nbr;
                    s.txtb_empl_name = s.datalistgrid[row_id].employee_name;
                    s.edit_appr_ctrl = s.datalistgrid[row_id].application_nbr;
                    s.edit_approval_id = s.datalistgrid[row_id].approval_id;
                    s.txtb_date_applied = s.datalistgrid[row_id].date_applied;

                    s.oTable2.fnClearTable();
                    s.datalistgrid2 = d.data.flpDtlLst;
                    s.getDtlDataLength = d.data.flpDtlLst.length;

                    if (d.data.flpDtlLst.length > 0) {
                        s.oTable2.fnAddData(d.data.flpDtlLst);
                    }
                    if (d.data.creator == "true") {
                        if (s.datalistgrid[row_id].approval_status == "N") {
                            s.dis_edit = false;
                            s.dis_submit = false;
                            s.show_cancel = false;
                            s.dis_plan_date = false;
                            s.show_calendar_icon = true;
                        }
                        else if (s.datalistgrid[row_id].approval_status == "C") {
                            s.dis_edit = true;
                            s.dis_submit = false;
                            s.show_cancel = false;
                            s.dis_plan_date = false;
                            s.show_calendar_icon = true;
                        }
                        else if (s.datalistgrid[row_id].approval_status == "S" || s.datalistgrid[row_id].approval_status == "L" || s.datalistgrid[row_id].approval_status == "D") {
                            s.dis_edit = true;
                            s.dis_submit = true;
                            s.show_cancel = false;
                            s.dis_plan_date = true;
                            s.show_calendar_icon = false;
                        }
                        else {
                            s.dis_edit = true;
                            s.dis_submit = true;
                            s.show_cancel = true;
                            s.dis_plan_date = true;
                            s.show_calendar_icon = false;
                        }
                    }
                    else
                    {
                        s.dis_edit = true;
                        s.dis_submit = true;
                        s.show_cancel = false;
                        s.dis_plan_date = true;
                        s.show_calendar_icon = false;
                        s.dis_del_row_3 = true;
                    }
                    
                    $('#edit').attr('ngx-data', row_id);
                    var row_edited = $('#edit').attr("ngx-data");
                    s.datalistgrid[row_edited].flp_application_date = $('#txtb_plan_date').val();
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

    //***********************************// 
    //*** Get Data   
    //**********************************// 
    function GetDetailsData(application_nbr)
    {
        h.post("../cSSFLPlan/GetDetailsData", {
            p_application_nbr: application_nbr
        }).then(function (d) {
            if (d.data.message == "success")
            {
                s.oTable2.fnClearTable();
                s.datalistgrid2 = d.data.flpDtlLst;

                if (d.data.flpDtlLst.length > 0)
                {
                    s.oTable2.fnAddData(d.data.flpDtlLst);
                }

            }
            else
            {
                swal(d.data.message, { icon: "warning", });
            }
        });
    }
    
    //***********************************// 
    //*** Update Existing Record         
    //**********************************// 
    //s.SaveEdit = function ()
    //{
    //    try
    //    {
    //        s.txtb_year_selected = $('#txtb_year_selected').val().substring(0, 4);
    //        if (s.datalistgrid2.length > 0)
    //        {
    //            h.post("../cSSFLPlan/GenerateNewApplNbr", {
    //                par_empl_id : $('#ddl_name option:selected').val()
    //                , par_year: s.txtb_year_selected
    //            }).then(function (d) {
    //                if (d.data.message == "success")
    //                {
    //                    if ((d.data.available_leave[0] + s.getDtlDataLength) >= s.datalistgrid2.length)
    //                    {
    //                        var data2 = [];
    //                        var data = {
    //                            application_nbr: s.edit_appr_ctrl
    //                        }

    //                        for (var x = 0; x < s.datalistgrid2.length; x++)
    //                        {
    //                            data2.push({
    //                                application_nbr: data.application_nbr
    //                                , flp_application_date: s.datalistgrid2[x].flp_application_date
    //                                , empl_id: s.txtb_empl_id
    //                                , rcrd_status: "N"
    //                                , approval_status: "N"
    //                                , approval_status_descr: "New"
    //                                , rcrd_status_descr: "New"
    //                            });
    //                        }

    //                        h.post("../cSSFLPlan/CheckExist2", { data2: data2 }).then(function (d)
    //                        {
    //                            if (d.data.message == "" || d.data.message == null)
    //                            {
    //                                btn = document.getElementById('addFinal');
    //                                btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Save';

    //                                h.post("../cSSFLPlan/SaveEdit", { data: data, data2: data2 }).then(function (d)
    //                                {
    //                                    if (d.data.message == "success")
    //                                    {
    //                                        s.FilterPageGrid();
    //                                        $('#main_modal').modal("hide");
    //                                        swal("Your record successfully updated!", { icon: "success", });
    //                                    }
    //                                    else
    //                                    {
    //                                        swal(d.data.message, { icon: "warning", });
    //                                    }
    //                                    btn.innerHTML = '<i class="fa fa-save"> </i> Save';
    //                                });
    //                            }
    //                            else
    //                            {
    //                                swal(d.data.message, { icon: "warning", title: "Alredy set a schedule for this date!" });
    //                            }
    //                        });
    //                    }
    //                    else
    //                    {
    //                        swal({ icon: "warning", title: (d.data.available_leave[0] + s.getDtlDataLength) + " slot/s available for Force Leave Plan." });
    //                    }
    //                }
    //                else
    //                {
    //                    swal(d.data.message, { icon: "warning", });
    //                }
    //            });
    //        }
    //        else
    //        {
    //            ValidateFields3();
    //        }
    //    }
    //    catch (err)
    //    {
    //        swal({ icon: "warning", title: err.message });
    //    }
    //}

    //************************************// 
    //*** Delete Record              
    //**********************************// 
    s.btn_del_row = function (row_index) {
        //btn_del_row1(row_index)
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
                        var data = {
                            application_nbr         : s.datalistgrid3[row_index].application_nbr
                            , flp_application_date  : s.datalistgrid3[row_index].flp_application_date
                            , empl_id               : s.datalistgrid3[row_index].empl_id
                            , approval_id           : s.datalistgrid3[row_index].approval_id
                            , detail_remarks        : s.datalistgrid3[row_index].detail_remarks
                        };

                        h.post("../cSSFLPlan/Delete", {
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
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    //************************************// 
    //*** Delete Record              
    //**********************************// 
    function btn_del_row1(row_index)
    {
        try
        {
            swal({
                title       : "Are you sure to delete this record and all of its components?",
                text        : "Once deleted, you will not be able to recover this record!",
                icon        : "warning",
                buttons     : true,
                dangerMode  : true,

            })
                .then(function (willDelete)
                {
                    if (willDelete)
                    {
                        var data = {
                            application_nbr: s.datalistgrid[row_index].application_nbr
                            , flp_application_date: s.datalistgrid[row_index].flp_application_date
                            , empl_id: s.datalistgrid[row_index].empl_id
                            , approval_id: s.datalistgrid[row_index].approval_id
                            , detail_remarks: s.datalistgrid[row_index].detail_remarks
                        };
                        
                        h.post("../cSSFLPlan/Delete", {
                            data: data
                        }).then(function (d)
                        {
                            if (d.data.message == "success")
                            {
                                s.FilterPageGrid();
                                $('#main_modal').modal("hide");
                                swal("Your record has been deleted!", { icon: "success", });
                            }
                            else
                            {
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
    //s.btn_cancel_all = function () {
    //    var row_index = s.temp_row_id;
    //    try
    //    {
    //        swal({
    //            title       : "Are you sure to cancel this application and all of its components?",
    //            text        : "Once cancelled, you will not be able to recover this record!",
    //            icon        : "warning",
    //            buttons     : true,
    //            dangerMode  : true,

    //        })
    //            .then(function (willDelete)
    //            {
    //                if (willDelete)
    //                {
    //                    var data = {
    //                        application_nbr: s.datalistgrid[row_index].application_nbr
    //                        , approval_id: s.datalistgrid[row_index].approval_id
    //                    }

    //                    h.post("../cSSFLPlan/CancelledAll", {
    //                        data: data
    //                    }).then(function (d)
    //                    {
    //                        if (d.data.message == "success")
    //                        {
    //                            s.FilterPageGrid();
    //                            $('#main_modal').modal("hide");
    //                            swal("Your record has been cancelled!", { icon: "success", });

    //                        }
    //                        else
    //                        {
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
    //*** Delete Record              
    //**********************************// 
    s.btn_del_row3 = function (row_index)
    {
        //console.log(s.datalistgrid2[row_index])
        if (s.datalistgrid2[row_index].rcrd_status == "N") {
            s.datalistgrid2 = s.datalistgrid2.delete(row_index);
            s.oTable2.fnClearTable();
            if (s.datalistgrid2.length != 0) {
                s.oTable2.fnAddData(s.datalistgrid2);
            }
        }
        else if (s.datalistgrid2[row_index].rcrd_status == "F")
        {
            var data =
            {
                application_nbr        : s.datalistgrid2[row_index].application_nbr
                ,flp_application_date  : s.datalistgrid2[row_index].flp_application_date
                ,empl_id               : s.txtb_empl_id
            }

            h.post("../cSSFLPlan/CheckExist_if_Delete", {data:data}).then(function (d)
            {
                if (d.data.message == "success")
                {
                    if (d.data.lv_dtl.length > 0)
                    {
                        if (d.data.cntr_final_aproved > 0)
                        {
                            swal("You Cannot Continue this transaction", "This leave date is already final approved", { icon: "warning" });
                        }
                        else
                        {
                            swal("Transfer this date (" + s.datalistgrid2[row_index].flp_application_date + ") to: " ,
                            {
                                content:
                                {
                                    element: "input",
                                    attributes:
                                    {
                                        placeholder: "Transfer Date",
                                        type: "date",
                                    },
                                },
                                closeOnClickOutside: false,
                            }).then((value) =>
                            {
                                if (value == null || value == "")
                                {
                                    swal("Date is Required!", { icon: "warning" });
                                    return;
                                }

                                h.post("../cSSFLPlan/TransferFLPlan", { data: data, transfered_date: value}).then(function (d)
                                {
                                    console.log(d.data)
                                   // swal(`You typed: ${value}`);
                                    if (d.data.message == "success")
                                    {
                                        s.FilterPageGrid();
                                        $('#main_modal').modal("hide");
                                        swal("Successfully Transferred", { icon: "success" });
                                    }
                                    else
                                    {
                                        swal(d.data.message , { icon: "error" });
                                    }

                                })
                            });
                        }
                    }
                    //else
                    //{
                    //    swal({ title: "Edit this Date?", icon: "warning", });
                    //}
                }
            })
        }

        //else if (s.datalistgrid2[row_index].rcrd_status == "C")
        //{
        //    var data =
        //    {
        //        application_nbr        : s.datalistgrid2[row_index].application_nbr
        //        ,flp_application_date  : s.datalistgrid2[row_index].flp_application_date
        //        ,rcrd_status_descr     : "Cancelled"
        //        ,rcrd_status           : "L"
        //    }

        //    s.datalistgrid2 = s.datalistgrid2.delete(row_index);
        //    s.oTable2.fnClearTable();
        //    if (s.datalistgrid2.length != 0)
        //    {
        //        s.oTable2.fnAddData(s.datalistgrid2);
        //    }

        //    s.datalistgrid2.push(data)
        //    s.oTable2.fnClearTable();
        //    s.oTable2.fnAddData(s.datalistgrid2);

        //    console.log(s.datalistgrid2)
        //    var data = {
        //        application_nbr: s.datalistgrid2[row_index].application_nbr
        //    }
        //    var data2 = {
        //        application_nbr: s.datalistgrid2[row_index].application_nbr
        //        , flp_application_date: s.datalistgrid2[row_index].flp_application_date
        //        , empl_id: s.txtb_empl_id
        //    }

        //    h.post("../cSSFLPlan/DeleteCancelPending", {
        //        data        : data
        //        , data2     : data2
        //    }).then(function (d)
        //    {
        //        if (d.data.message == "success")
        //        {
        //            s.FilterPageGrid();
        //        }
        //        else
        //        {
        //            swal({ title: d.data.message, icon: "warning", });
        //        }
        //    })
        //}
        

    }
    
    //************************************// 
    //*** Cancel Record In FLP Date Grid       
    //**********************************// 
    s.btn_cancel = function (row_index) {
        try
        {
            swal({
                title       : "Are you sure to cancel this application?",
                text        : "Once cancelled, you will not be able to recover this record!",
                icon        : "warning",
                buttons     : true,
                dangerMode  : true,

            })
                .then(function (willDelete)
                {
                    if (willDelete)
                    {
                        var data = {
                            application_nbr: s.datalistgrid2[row_index].application_nbr
                            , approval_id: s.datalistgrid2[row_index].approval_id
                        }
                        var data2 = {
                            application_nbr: s.datalistgrid2[row_index].application_nbr
                            , flp_application_date: s.datalistgrid2[row_index].flp_application_date
                        }
                        
                        h.post("../cSSFLPlan/Cancelled", {
                            data: data
                            , data2: data2
                        }).then(function (d) {
                            if (d.data.message == "success")
                            {
                                swal("Your record has been cancelled!", { icon: "success", });
                                s.FilterPageGrid();
                                GetDetailsData(s.datalistgrid2[row_index].application_nbr);
                                
                            }
                            else
                            {
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
    //*** Undo Action 
    //**********************************// 
    s.btn_undo_row = function (row_index)
    {
        try
        {
            var data = {
                application_nbr: s.datalistgrid2[row_index].application_nbr
                , flp_application_date: s.datalistgrid2[row_index].flp_application_date
                , rcrd_status_descr: "Cancel Pending"
                , rcrd_status: "C"
            }

            s.datalistgrid2 = s.datalistgrid2.delete(row_index);
            s.oTable2.fnClearTable();
            if (s.datalistgrid2.length != 0)
            {
                s.oTable2.fnAddData(s.datalistgrid2);
            }
            
            s.datalistgrid2.push(data)
            s.oTable2.fnClearTable();
            s.oTable2.fnAddData(s.datalistgrid2);
            
        }
        catch (err)
        {
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

    function clearentry() {
        s.txtb_plan_date    = "";
        s.txtb_remarks      = "";
        s.new_appr_ctrl = "";

        $("#txtb_approval_status").removeClass("required");
        $("#lbl_txtb_approval_status_req").text("");

        $("#txtb_year").removeClass("required");
        $("#lbl_txtb_year_req").text("");

        $("#txtb_empl_name").removeClass("required");
        $("#lbl_txtb_empl_name_req").text("");

        $("#txtb_empl_id").removeClass("required");
        $("#lbl_txtb_empl_id_req").text("");

        $("#txtb_plan_date").removeClass("required");
        $("#lbl_txtb_plan_date_req").text("");
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields() {
        var return_val = true;
        ValidationResultColor("ALL", false);

        if ($('#txtb_approval_status').val() == "") {
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

        if ($('#txtb_plan_date').val() == "") {
            ValidationResultColor("txtb_plan_date", true);
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
        if (par_v_result) {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else {
            //remove of refresh the object form being required

            $("#ddl_name").removeClass("required");
            $("#lbl_ddl_name_req").text("");
        }
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields3() {
        var return_val = true;
        ValidationResultColor3("ALL", false);

        if ($('#txtb_plan_date').val() == "") {
            ValidationResultColor3("txtb_plan_date", true);
            return_val = false;
        }

        return return_val;
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidationResultColor3(par_object_id, par_v_result) {
        if (par_v_result) {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field!");
        }
        else {
            //remove of refresh the object form being required

            $("#txtb_plan_date").removeClass("required");
            $("#lbl_txtb_plan_date_req").text("");
        }
    }

    function get_page(empl_id) {
        var nakit_an = false;
        var rowx = 0;
        $('#datalist_grid2 tr').each(function () {
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

    s.btn_print = function (par_year, par_department_code, par_prepared_empl_id,par_report,report_type)
    {
        var date = new Date($('#calendar').fullCalendar('getDate'));
        s.txtb_year_selected = date.getFullYear()
        
        var controller  = "Reports";
        var action      = "Index";
        var ReportName  = "";
        var SaveName    = "Crystal_Report";
        var ReportType  = "inline";
        var ReportPath = "~/Reports/cryForceLeave/";
        var sp          = "";

        var par_year = s.txtb_year_selected

        var par_subdepartment_code  = $('#ddl_subdept').val()     ;
        var par_division_code       = $('#div_dept').val()  ;
        var par_section_code        = $('#sec_dept').val()        ;

        if (par_report == "AN")
        {
            if (report_type == "NEW")
            {
                ReportName = "cryForceLeaveAnnualSched";
            }
            else
            {
                ReportName = "cryForceLeaveAnnualSched_OLD";
            }

            ReportPath = ReportPath + "" + ReportName + ".rpt";
            sp = "sp_force_leave_plan_annual_sched_rep,par_year," + par_year + ",par_department_code," + par_department_code + ",par_prepared_empl_id," + par_prepared_empl_id + ",par_subdepartment_code," + par_subdepartment_code + ",par_division_code," + par_division_code + ",par_section_code," + par_section_code;
            s.employee_name_print = 'SCHEDULE OF FORCED LEAVE';
        }
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
    
})