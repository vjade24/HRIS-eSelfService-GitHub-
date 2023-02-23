//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Overtime Request
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// Joseph M. Tombo Jr.       06/17/2020      Code Creation
//**********************************************************************************
ng_selfService_App.controller("cSSOvertimeRequest_Ctrl", function ($scope, $compile, $http, $filter) {
    var s                    = $scope;
    var h                    = $http;

    s.arr_dates              = [];
    var userid               = "";
    s.log_in_as_AO           = "";
    s.rowLen                 = "10";
    s.year                   = [];
    s.subdepartment_list     = [];
    s.division_list          = [];
    s.section_list           = [];

    s.subdepartment_list_temp= [];
    s.division_list_temp     = [];
    s.section_list_temp      = [];
    s.fundcharges_list_temp  = [];

    s.fundcharges_list       = [];

    s.ShowFLP                = false;
    s.available_leave        = 0;
    s.myCalendar             = null;
    s.show_in_add            = true;
    s.isAction               = "";
    s.oTable                 = null;
    s.oTableEmployee         = null;
    s.datalistgridEmployee   = [];
    s.oTableDates            = null;
    s.oTablePurpose          = null;
    s.datalistgridDates      = [];
    s.datalistgridPurpose    = [];
    s.isActionSubNew         = "";
    s.travel_order_requestor = "";
    s.par_month              = "";
    s.par_year               = "";
    s.par_day                = "";
    index_update             = "";
    btn_grid_action          = "";

    s.isShowAddDates        = false;
    s.isShowUpdateDates     = false;
    s.isShowAddEmployee     = false;
    s.isShowUpdateEmployee  = false;
    s.isShowSubmit          = false;

    
    s.isAbledTravelForm      = false;
    s.isAbledTravelType      = false;
    s.isAbledSubject         = false;
    s.isAbledDetails         = false;
    s.isAbledJustification   = false;
    s.isAbledEmplname        = false;
    s.isAbledTraveldate      = false;
    s.isAbledStarttime       = false;
    s.isAbledStarttimeAMPM   = false;
    s.isAbledEndtime         = false;
    s.isAbledEndtimeAMPM     = false;
    s.isAbledTravelDateFiled = false;
    var holiDate             = [];

    isDeleteCalendarDate     = "1900-01-01";
    isDeleteActionMessage    = "";
    isCreatorGridAction      = true;
    tname                    = "";
    s.department_code        = "";
    s.rowIDUpdate            = "";
    s.ot_for_empl_id        = "";
    s.ot_for_employeename   = "";
    s.ot_thru_empl_id       = "";
    s.ot_thru_employeename = "";
    s.isCheckedOth = "false"
    s.isShowOthFund = false
    function init() {
        try {
            

            $("#startclockpicker1").clockpicker({
                format: "HH:mm",
                placement: "top",
                align: "left",
                autoclose: true,
                leadingZeroHours: true,
                twelvehour: true
              
            });

            $("#startclockpicker2").clockpicker({
                format: "HH:mm",
                placement: "top",
                align: "left",
                autoclose: true,
                leadingZeroHours: true,
                twelvehour: true
            });

            $("#startclockpicker3").clockpicker({
                format: "HH:mm",
                placement: "top",
                align: "left",
                autoclose: true,
                leadingZeroHours: true,
                twelvehour: true
            });

            $("#startclockpicker4").clockpicker({
                format: "HH:mm",
                placement: "top",
                align: "left",
                autoclose: true,
                leadingZeroHours: true,
                twelvehour: true
            });

            $("#endclockpicker1").clockpicker({
                format: "HH:mm",
                placement: "top",
                align: "left",
                autoclose: true,
                leadingZeroHours: true,
                twelvehour: true
            });

            $("#endclockpicker2").clockpicker({
                format: "HH:mm",
                placement: "top",
                align: "left",
                autoclose: true,
                leadingZeroHours: true,
                twelvehour: true
            });

            $("#endclockpicker3").clockpicker({
                format: "HH:mm",
                placement: "top",
                align: "left",
                autoclose: true,
                leadingZeroHours: true,
                twelvehour: true
            });

            $("#endclockpicker4").clockpicker({
                format: "HH:mm",
                placement: "top",
                align: "left",
                autoclose: true,
                leadingZeroHours: true,
                twelvehour: true
            });

            $('#div_to_date .input-group.date').datepicker({
                todayBtn: "linked",
                keyboardNavigation: false,
                forceParse: false,
                calendarWeeks: true,
                autoclose: true,
                format: "yyyy-mm-dd"
            });


            $("#loading_data").modal({ backdrop: 'static', keyboard: false });
            var date = new Date();
            RetrieveYear();

            s.ddl_year = date.getFullYear().toString();

           

            var today   = new Date();
            var dd      = String(today.getDate()).padStart(2, '0');
            var mm      = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy    = today.getFullYear();

            s.par_month = mm;
            s.par_year  = yyyy.toString();
            s.par_day   = dd;
            today       = yyyy + '-' + mm + '-' + dd;
            s.txtb_travel_date_filed_dspl = today
            initOTCoverObject();
            $("#datalist_grid thead").remove();

            $("#ddl_subdepartment").select2({
                placeholder: "Select Subdepartment. . . ",
                allowClear: true,
                //dropdownParent: $("#main_modal")
            });

            $("#ddl_division").select2({
                placeholder: "Select Division. . . ",
                allowClear: true,
            });
            $("#ddl_section").select2({
                placeholder: "Select Section. . . ",
                allowClear: true,
            });

            //$("#ddl_fund_charges").select2({
            //    placeholder: "Select Fund Charges. . . ",
            //    allowClear: true,
            //});

            $("#ddl_name_header").select2().on('change', function (e) {
                s.getEmployeeInfoHeader();
            })

            $("#ddl_subdepartment").select2().on('change', function (e) {
                s.getFilteredDivision();
                s.getFilteredSection();
            })

            $("#ddl_division").select2().on('change', function (e)
            {
                s.getFilteredSection();
            })

            $("#ddl_section").select2().on('change', function (e) {
                //s.getFilteredListEmployee();
            })

            $("#ddl_fund_charges").select2().on('change', function (e) {
                //s.getFilteredFundCharges();
            })


            $("#ddl_name_dspl").select2().on('change', function (e) {
                s.getEmployeeInfo();
            })

            $('span.input-group-addon.coverX').on('click', function (e)
            {
               s.inpDisabled = $('span.' + e.currentTarget.className.replace(" ", ".").replace(" ", ".")).closest("div").find("input").attr('disabled');
                
                if (s.inpDisabled == "disabled")
                {
                    setTimeout(function () {$('span.' + e.currentTarget.className.replace(" ", ".").replace(" ", ".")).closest("div").parent().parent().click() },-10000);
                   
                    //$('span.' + e.currentTarget.className.replace(" ", ".").replace(" ", ".")).closest("div").find("input").off("focus.clockpicker click.clockpicker");
                }
            });

            //**********************************************
            // Initialize data during page loads
            //**********************************************
            h.post("../cSSOverTimeRequest/InitializeData").then(function (d) {
                if (d.data.message == "success")
                {
                    if (d.data.dept_code == "18" || d.data.dept_code == "19") {

                        s.ot_for_empl_id = "7610";
                        s.ot_for_employeename = "JAYVEE TYRON L. UY  , MPA";
                        s.txtb_for = "JAYVEE TYRON L. UY  , MPA";
                        s.ot_thru_empl_id = "7610";
                        s.ot_thru_employeename = "JAYVEE TYRON L. UY  , MPA";
                        s.txtb_thru = "JAYVEE TYRON L. UY  , MPA";
                    }
                    else {
                        s.ot_for_empl_id = d.data.from_thru.for_empl_id;
                        s.ot_for_employeename = d.data.from_thru.for_employeename;
                        s.txtb_for = s.ot_for_employeename;
                        s.ot_thru_empl_id = d.data.from_thru.thru_empl_id;
                        s.ot_thru_employeename = d.data.from_thru.thru_employeename;
                        s.txtb_thru = s.ot_thru_employeename;
                    }
                   
                   
                   
                    ////**********************************************
                    ////  Show/Hide ADD, EDIT, DELETE button 
                    ////**********************************************
                    s.allowAdd      = d.data.um.allow_add
                    s.allowDelete   = d.data.um.allow_delete
                    s.allowEdit     = d.data.um.allow_edit
                    s.allowView     = d.data.um.allow_view
                    s.allowPrint     = d.data.um.allow_print
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

                    s.statusList = d.data.status;


                    s.travel_order_requestor            = d.data.empl_name
                    s.ot_requestor_empl_id              = d.data.empl_id

                    holiDate = d.data.holiDate;
                    initialize_calendar();

                    s.txtb_department_dspl  = d.data.department_list.department_name1;
                    
                    s.subdepartment_list    = d.data.sub_dep_list;
                    s.division_list         = d.data.division_list;
                    s.section_list          = d.data.section_list;

                    s.subdepartment_list_temp   = d.data.sub_dep_list;
                    s.division_list_temp        = d.data.division_list;
                    s.section_list_temp         = d.data.section_list;
                    s.fundcharges_list_temp     = d.data.funcharge_list;

                    s.fundcharges_list      = d.data.funcharge_list;
                    s.department_code       = d.data.dept_code;
                    s.travel_type_list      = d.data.travel_type_list
                    s.employees_list        = d.data.empl_name_list
                    s.employees_list_header = d.data.empl_name_list
                    s.employees_from        = d.data.empl_name_list_from

                    if (d.data.datalistgrid.length > 0)
                    {
                        init_table_data(d.data.datalistgrid);
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(d.data.datalistgrid)

                    }

                    else
                    {
                        init_table_data([]);
                        s.oTable.fnClearTable();
                    }

                    init_table_data2([]);
                    init_table_data3([]);
                    init_table_data4([]);
                    if (d.data.calendar_data != null) {
                        s.arr_dates = d.data.calendar_data;
                    }
                    else s.arr_dates = []
                    s.ddl_name_header = d.data.empl_id;
                    calendar_data();
                    $("#loading_data").modal("hide")

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

    $.fn.modal.Constructor.prototype.enforceFocus = function ()
    {

    }

    //************************************//
    // Select Year +-1
    //************************************// 
    function RetrieveYear()
    {
        try
        {
            var currentYear = new Date().getFullYear();
            var prev_year   = currentYear - 5;
            for (var i = 1; i <= 7; i++)
            {
                s.year.push({ "year": prev_year })
                prev_year++;
            }
        }
        catch (err)
        {
            swal({ icon: "warning", title: err.message });
        }
    }

     //Table for My OT LIST
    var init_table_data = function (par_data)
    {
        try
        {
            s.datalistgrid = par_data;
            s.oTable = $('#datalist_grid').dataTable(
                {
                    data    : s.datalistgrid,
                    bSort   : false,
                    sDom    : 'rt<"bottom">',
                    paging  : false,
                    columns: [
                        {
                            className: 'table-dataTable-tbody-td',
                            "mData": null,
                            "mRender": function (data, type, full, row) {

                                var temp                    = ""
                                var ot_color                = ""
                                var isCreator               = true
                                var allow_delete_override   = true

                                var edit_text               = "Edit"
                                var isshowDropDownUser      = ""
                                if (s.ot_requestor_empl_id != full['ot_requestor_empl_id'].toString())
                                {
                                    isCreator               = false
                                    allow_delete_override   = false
                                    allow_edit_override     = false
                                    edit_text               = "View"

                                }

                                if (full["approval_status"].toString() == "1" || full["approval_status"].toString() == "2" || full["approval_status"].toString() == "3")
                                {
                                    ot_color = "approved-bg";
                                    allow_delete_override = false;
                                    allow_edit_override = false;
                                    edit_text = "View";
                                }
                                else if (full["approval_status"].toString() == "D" || full["approval_status"].toString() == "L")
                                {

                                    ot_color                = "disapproved-bg";
                                    allow_delete_override   = false;
                                    allow_edit_override     = false;
                                    edit_text               = "View";
                                }
                                else if (full["approval_status"].toString() == "C")
                                {
                                    ot_color = "cancel-bg"
                                }
                                else if (full["approval_status"].toString() == "N")
                                {
                                    ot_color = "new-bg"
                                }
                                else if (full["approval_status"].toString() == "R") {
                                    ot_color                = "reviewed-bg"
                                    allow_delete_override   = false
                                    allow_edit_override     = false
                                    edit_text               = "View"
                                }
                                else if (full["approval_status"].toString() == "S")
                                {
                                    ot_color                = "submitted-bg"
                                    allow_delete_override   = false
                                    allow_edit_override     = false
                                    edit_text               = "View"
                                }

                                else if (full["approval_status"].toString() == "F")
                                {
                                    ot_color                = "approved-bg"
                                    allow_delete_override   = false
                                    allow_edit_override     = false
                                    edit_text               = "View"
                                }


                                temp = "<div class='xx input-group m-b " + ot_color + "'  style='color:white;'>" +
                                    "<span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'>" +
                                    "<div class='external-event'>" +
                                    full["ot_request_date"].toString().toUpperCase() + " | " + full["ot_subject"]
                                    + "<br/>"
                                    + full["ot_status_descr"] + " "
                                    + "<span class='pull-right' ng-show='"
                                    + full["ot_requestor_empl_id"] + "'>By: " + full["ot_requestor_empl_id"].replace('U', '#')
                                    + "</div>" +
                                    "</span >" +
                                    " <ul class='dropdown-menu' style='color:black; display:" + isshowDropDownUser + ";'>" +
                                    "<li><a ng-click='btn_edit_action(" + row["row"] + "," + isCreator + ",\"hdr\")' ng-show='" + s.allowEdit + "'>" + edit_text + "</a></li>" +
                                    "<li><a ng-click='btn_del_row(" + row["row"] + ",\"hdr\")' ng-show='" + allow_delete_override + "' >Delete All</a></li>" +
                                    "<li><a ng-click='btn_print_action(" + row["row"] + ",\"hdr\")' ng-show='allowPrint' >Print OT Request</a></li>" +
                                    "</ul>" +
                                    "</div>"

                                return temp;
                            }
                        },
                    ],
                    "createdRow": function (row, data, index) {
                        $compile(row)($scope);  //add this to compile the DOM
                    },

                });
        }
        catch (err)
        {
            swal({ icon: "warning", title: err.message });
        }
    }

    //Table for Employee
    var init_table_data2 = function (par_data) {
        try
        {
            s.datalistgridEmployee = par_data;
            s.oTableEmployee = $('#datalist_gridEmployee').dataTable(
                {
                    data        : s.datalistgridEmployee,
                    stateSave   : false,
                    bAutoWidth  : false,
                    sDom        : 'rt<"bottom"p>',
                    pageLength  : 5,
                    columns     : [
                        {
                            "width"     : "15%",
                            "targets"   : 0,
                            "mData"     : "empl_id",
                            "mRender"   : function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width"     : "40%",
                            "targets"   : 1,
                            "mData"     : "employee_name",
                            "mRender"   : function (data, type, full, row) {
                                return "<span class='text-left btn-block'>" + data + "</span>"
                            }
                        },

                        {
                            "width"     : "30%",
                            "targets"   : 2,
                            "mData"     : "position_title1",
                            "mRender"   : function (data, type, full, row) {
                                return "<span class='text-left btn-block'>" + data + "</span>"
                            }
                        },
                        {
                            "width"     : "15%",
                            "targets"   : 3,
                            "mData"     : null,
                            "bSortable" : false,
                            "mRender"   : function (data, type, full, row) {
                                var temp = "";
                                var isdisabled = false
                               
                                if (full['rcrd_status'] == "N" || full['rcrd_status'] == "C") {
                                    isdisabled = false
                                }
                                else {
                                    isdisabled = true
                                }

                                if (full['ot_requestor_empl_id'] != s.ot_requestor_empl_id)
                                {
                                    isdisabled = true
                                }

                                temp = '<center><div class="btn-group">' +
                                    '<button type="button" ng-disabled="' + isdisabled + '" class="btn btn-danger btn-sm" ng-click="btn_del_row(' + row["row"] + ',\'datalistgridEmployee\')" ng-show="' + s.allowDelete + '" " data-toggle="tooltip" data-placement="top" title="Remove"><i class="fa fa-times"></i></button>' +
                                    '</div></center>';

                                return temp;
                            }
                        }
                    ],
                    "createdRow": function (row, data, index)
                    {
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
                    data        : s.datalistgridDates,
                    stateSave   : false,
                    bAutoWidth  : false,
                    sDom        : 'rt<"bottom"p>',
                    pageLength  : 5,
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
                    bAutoWidth:false,
                    sDom: 'rt<"bottom"p>',
                    pageLength: 5,
                    columns: [
                        {
                            "width": "10%",
                            "targets":0,
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
                                return "<span class='text-center btn-block'>" + data + "</span>"
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
                                if (full['rcrd_status'] != "N" && full['rcrd_status'] != "C")
                                {
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
                bg_color = '#EC4758';
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
           
            for (var x = 0; x < s.arr_dates.length; x++)
            {
                var event                       = new Object();
                event.id                        = s.arr_dates[x].ot_ctrl_no; // unique event id;
                event.title                     = s.arr_dates[x].ot_subject;
                event.start                     = s.arr_dates[x].ot_date_from;
                event.end                       = moment(s.arr_dates[x].ot_date_to).add(1,"days").format("YYYY-MM-DD");
                event.description               = s.arr_dates[x].approval_status_descr;
                event.backgroundColor           = color_dates(s.arr_dates[x].approval_status);
                event.ot_requestor_empl_id      = s.arr_dates[x].ot_requestor_empl_id;
                event.borderColor               = 'white';
                event.extendedProps             = x;
                $('#calendar').fullCalendar('renderEvent', event, true);
            }

        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }
    //************************************//
    // Assigned Calendar Events to Dates
    //************************************// 
    function calendar_data_holiday() {
        //try {
        //    for (var x = 0; x < holiDate.length; x++) {
        //        var event = new Object();
        //        event.id = holiDate[x]; // unique event id;
        //        event.title = "";//holiDate[x].holiday_name;
        //        event.start = holiDate[x].holiday_date;
        //        event.description = holiDate[x].holiday_name;
        //        event.backgroundColor = color_dates("xx");
        //        event.className = 'holiday-bg';
        //        event.borderColor = 'transparent';
        //        event.extendedProps = 'holiday';
        //        $('#calendar').fullCalendar('renderEvent', event, true);
        //    }
        //}
        //catch (err) {
        //    swal({ icon: "warning", title: err.message });
        //}
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
            var date        = new Date();
            var d           = date.getDate();
            var m           = date.getMonth();
            var y           = date.getFullYear();
            var start_date  = (y - 1) + '-01-01';
            var end_date    = (y + 1) + '-12-31';

            $('#calendar').fullCalendar({
                customButtons: {
                    btn_add_btn: {
                        text: 'Add2',
                        click: function () {
                            s.btn_open_modal('C1');
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

                    tname       = "All"


                    var click_date  = new Date(calEvent.start.toString());
                    var dd          = String(click_date.getDate()).padStart(2, '0');
                    var mm          = String(click_date.getMonth() + 1).padStart(2, '0'); //January is 0!
                    var yyyy        = click_date.getFullYear();


                    isDeleteCalendarDate = yyyy + "-" + mm + "-" + dd
                    

                    var isCreator = true

                    
                    if (calEvent.ot_requestor_empl_id != s.ot_requestor_empl_id)
                    {
                        isCreator = false
                    }


                    if (el.originalEvent.target.className == "fa fa-times text-right pull-right" && calEvent.extendedProps != "holiday") {
                        isDeleteActionMessage = "Are you sure to remove this date of application?"
                        s.btn_del_row(calEvent.extendedProps,"dtl")
                    }
                    else if (calEvent.extendedProps == "holiday") {

                    }
                    else
                    {
                        edit_action(calEvent.extendedProps, isCreator,'calendar')
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
                    $('.fc-prev-button').click(function () {
                        $('.popover').popover('hide');
                        s.getEmployeeInfoHeader();
                    });
                    $('.fc-next-button').click(function () {
                        $('.popover').popover('hide')
                        s.getEmployeeInfoHeader();
                    });
                },
                select: function (start, end, jsEvent, event)
                {
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
                                return '<div onClick="$(\'#btn_add_ot\').click();"><h5 style="cursor:pointer;">Apply for O.T Request</h5></div>';
                            },
                        }).popover('show');
                        $(".fc-highlight").css("background", "red");
                    }
                    else {
                        $('.popover').popover('hide')
                        $(".fc-highlight").css("background", "transparent");
                    }
                    //var e_date = new Date(moment(end).format('YYYY-MM-DD'));
                    //var s_date = new Date(moment(start).format('YYYY-MM-DD'));
                    //var date_diff = new Date(e_date - s_date);
                    //s.tot_nbr_days = date_diff / 1000 / 60 / 60 / 24;

                    //s.start_date = moment(start).format('YYYY-MM-DD');
                    //s.end_date = moment(end).subtract(1, "days").format('YYYY-MM-DD');

                    //popoverElement = $(jsEvent.target);
                    //$(jsEvent.target).popover({
                    //    html: true,
                    //    animation: 'true',
                    //    placement: 'top',
                    //    container: 'body',
                    //    title: '',
                    //    trigger: 'click',
                    //    content: function () {
                    //        $('.popover').popover('hide')
                    //        return '<div onClick="$(\'#btn_add_ot\').click();"><h5 style="cursor:pointer;">Apply for O.T Request</h5></div>';
                    //    },
                    //}).popover('show');
                    //$(".fc-highlight").css("background", "red");
                },
                eventRender: function (event, element, view) {

                    if (event.extendedProps == "holiday") {
                        element.find('.fc-title').prepend('');
                        element.find('.fc-title').append('<div class="holiday-bg"><span><b>' + event.description + '</b></span></div>');
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

                        if (event.description == "New" || event.description == "Cancel Pending") {

                            var show_delete = "";

                            // If the creator is also the owner of the application
                            if (event.ot_requestor_empl_id == s.ot_requestor_empl_id) {
                                show_delete = "block";
                            }
                            // If he is the creator but not the owner
                            else if (event.ot_requestor_empl_id == s.ot_requestor_empl_id) {
                                show_delete = "block";
                            }
                            //If the current user owns the application but not the creator
                            else {
                                show_delete = "none";
                            }
                            element.find('.fc-title').html('<div class="data_calendar ibox-tools" style="text-align:center;">' +
                                '<i class="fa fa-times text-right pull-right" style="display:' + show_delete + ';margin:0px !important;" data-toggle="tooltip" data-placement="top" title="Delete"></i>'
                                +'<span class="fc-title">' + event.title
                                + '</span>'
                                + '</div>');
                        }



                    }
                },

                dayRender: function (date, cell) {
                    for (var x = 0; x < holiDate.length; x++) {
                        if (date.format("YYYY-MM-DD") == holiDate[x].holiday_date) {
                            cell.prepend("<div class='holiday' data-toggle='tooltip' data-placement='top' title='" + holiDate[x].holiday_name + "'><i class='fa fa-star text-warning'></i><small style='color:white;'>" + holiDate[x].holiday_name + "</small></div>");
                        }
                    }

                },
            });

            //MODIFIED CALENDAR HEADER
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

            $("#datepickerX").datepicker({
                format: "yyyy-mm",
                startView: "years",
                minViewMode: "months",
                autoclose: true,
            });

            $('button.fc-today-button').click(function () {
                s.getEmployeeInfoHeader();
            });

            $('#datepickerX').datepicker().on('changeDate', function (ev) {
                $('#calendar').fullCalendar('gotoDate', $('#txtb_year_selected').val() + '-01');
                s.getEmployeeInfoHeader();
                var date_value = $('#txtb_year_selected').val().split("-")
                s.par_month = date_value[1]
                s.par_year = date_value[0]

            });
        }
        catch (err)
        {
            swal({ icon: "warning", title: err.message });
        }
    }

    function add_dates() 
    {
            var data =
            {
                ot_ctrl_no              : s.txtb_ot_request_nbr,
                ot_date_from            : s.start_date,
                ot_date_to              : s.end_date,
                ot_start_time           : "8:00",
                ot_start_ampm           : "AM",
                ot_start_time_dspl      : "8:00 AM",
                ot_end_time             : "5:00",
                ot_end_ampm             : "PM",
                ot_end_time_dspl        : "5:00 PM",
                ot_requestor_empl_id    : s.ot_requestor_empl_id,
                rcrd_status             : "N"
            }
            s.datalistgridDates.push(data)
            s.oTableDates.fnClearTable();
            s.oTableDates.fnAddData(s.datalistgridDates);
    }

    //************************************//
    //***       Open Status Modal        ****//
    //************************************//
    s.btn_open_info = function ()
    {
        try {
            btn             = document.getElementById('info');
            btn.innerHTML   = '<i class = "fa fa-spinner fa-spin"></i> Status Info.';
            s.ModalTitle    = "Status Color Legend";

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
    function open_modal()
    {
        try
        {
            clearentry();
            clearentryEmployee();
            clearentryDates();
            clearentryPurpose();

            s.datalistgridEmployee  = []
            s.datalistgridDates     = []
            s.datalistgridPurpose   = []

            s.oTableDates.fnClearTable();
            s.oTableEmployee.fnClearTable();
            s.oTablePurpose.fnClearTable();

            initOTCoverObject()
            ToogleDisabledRemove();

            $('#main_modal').on('shown.bs.modal', function ()
            {
                if (s.datalistgridDates == null || s.datalistgridDates.length > 0) {
                    $('.nav-tabs a[href="#tab-3"]').tab('show');
                }
                else
                {
                    $('.nav-tabs a[href="#tab-1"]').tab('show');
                }

            });

            tname = "oTableDates"
            s.txtb_date_filed = moment(new Date()).format("YYYY-MM-DD");
         
            s.isShowAddDates        = true
            s.isShowUpdateDates     = false
            s.isShowAddEmployee     = true
            s.isShowUpdateEmployee  = false
            s.resubmit              = "FALSE"
            s.dis_delete2           = false;
            s.available_leave       = 0;
            s.isAction              = "ADD"

            $('.popover').popover('hide');

            $('#main_modal').modal({ backdrop: 'static', keyboard: false });
            s.ModalTitle        = "Add New Record";
            s.dis_plan_date = false;
            
            btn = document.getElementById('add');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Apply';
            setTimeout(function ()
            {
                btn.innerHTML = '<i class="fa fa-plus-circle"> </i> Apply';
                $('#main_modal').modal({ backdrop: 'static', keyboard: false });
            }, 300);

        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    //************************************//
    //***       Open Add Modal        ****//
    //************************************//
    s.btn_open_modal = function (value)
    {
        try
        {
            s.temp_approval_status = "N";

            s.isShowSubmit  = true
            s.isAction      = "ADD"
            var today = new Date(); 
            var date = $("#calendar").fullCalendar('getDate');
            var year_int = date.format("YYYY");
            var month_int = date.format("MM");
           

            h.post("../cSSOverTimeRequest/GetTravelOrderNumberAction").then(function (d) {
                $("#txtb_ot_request_nbr").val(d.data.travel_order_number_display)
            })
           
           
            s.show_calendar_icon = true;
            open_modal();
            s.ddl_year = year_int;
            s.ddl_month = parseInt(month_int).toString();
            if (value == "C")
            {
                add_dates()
            }
            else
            {
                s.datalistgridDates     = [];
                s.datalistgridEmployee  = [];
                s.oTableDates.fnClearTable()
                s.oTableEmployee.fnClearTable()
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
    s.add_force_leave = function () {
        try {
            s.temp_approval_status  = "N";
            btn                     = document.getElementById('submit');
            btn.innerHTML           = '<i class="fa fa-paper-plane-o"></i> Submit';

            s.dis_plan_date      = false;
            s.dis_submit         = false;
            s.dis_edit           = false;
            s.show_calendar_icon = true;

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

    s.getFilteredListEmployee = function ()
    {
        //s.division_list = [];
        //s.section_list = [];
        //s.division_list.push(s.division_list_temp.selectX(((s.ddl_subdepartment == null || s.ddl_subdepartment.trim() == "") ? "" : s.ddl_subdepartment),"subdepartment_code"));
        //s.section_list.push(s.section_list_temp.selectX(((s.ddl_division == null || s.ddl_division.trim() == "") ? "" : s.ddl_division), "division_code"));   
    }

    s.getFilteredDivision = function ()
    {
        var tempX       = s.division_list_temp;
        s.division_list = null;
        s.ddl_division = "";
        $('#ddl_division').val("").trigger('change');
        s.division_list = tempX.selectX($('#ddl_subdepartment').val().toString().trim(),'subdepartment_code');
        $('#ddl_division').select2('destroy');
        $('#ddl_division').select2();
        $('#ddl_division').click();
    }

    s.getFilteredSection = function ()
    {
        var tempX       = s.section_list_temp;
        s.section_list  = [];
        $('#ddl_section').val("").trigger('change');
        //var $('#ddl_division').val().toString().trim()
        s.section_list = tempX.selectX($('#ddl_division').val().toString().trim(), "division_code");   
        $('#ddl_section').select2('destroy');
        $('#ddl_section').select2();
        s.ddl_section = "";
        $('#ddl_section').val("").trigger('change');
        $('#ddl_section').click();
    }

    s.getFilteredFundCharges = function () {
        var tempX = s.fundcharges_list_temp;
        s.fundcharges_list = [];
        $('#ddl_fund_charges').val("").trigger('change');
        //var $('#ddl_division').val().toString().trim()
        s.fundcharges_list = tempX.selectX($('#ddl_fund_charges').val().toString().trim(), "fund_code");
        $('#ddl_fund_charges').select2('destroy');
        $('#ddl_fund_charges').select2();
        s.ddl_fund_charges = "";
        $('#ddl_fund_charges').val("").trigger('change');
        $('#ddl_fund_charges').click();
    }



    s.getEmployeeInfoHeader = function ()
    {

        var date    = new Date($('#calendar').fullCalendar('getDate'));
            yr      = date.getFullYear(),
            month   = (date.getMonth() + 1)
        h.post("../cSSOverTimeRequest/GetEmployeeData",
            {
                  par_empl_id_details   : $("#ddl_name_header").val()
                , par_month             : month
                , par_year              : yr
                , par_status            : $("#ddl_status").val()
            }).then(function (d)
            {
                if (d.data.message == "success")
                {
                    if (d.data.hdr_data.length > 0)
                    {


                        s.datalistgrid = []
                        s.datalistgrid = d.data.hdr_data
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid)
                    }
                    else
                    {
                        s.oTable.fnClearTable();
                    }

                    s.arr_dates = [];
                    if (d.data.calendar_data.length > 0) {
                        $('#calendar').fullCalendar('removeEvents', function (e) {
                            return true;
                        });
                        s.arr_dates = d.data.calendar_data;
                        calendar_data();
                    }
                    else {
                        $('#calendar').fullCalendar('removeEvents', function (e) {
                            return true;
                        });
                    }

                }
            })
    }

    s.getEmployeeInfo = function ()
    {
        if ($("#ddl_name_dspl").val().trim() != "")
        {
            $("#txtb_position_dspl").val(s.employees_list.select($("#ddl_name_dspl").val(), "empl_id").position_title1);
        }
        else {
            $("#txtb_position_dspl").val("")
        }
    }

    s.btn_submit_click = function (action)
    {
        s.isActionSubNew    = action
        var header_info     = getValueFromHeader()

        try
        {
            
            if (s.isActionSubNew == "S")
            {
                $("#submit").html("<i class='fa fa-spinner fa-spin'></i> Submit");
                //$("#i_submit").removeClass("fa fa-paper-plane-o");
                //$("i#i_submit").addClass("fa fa-spinner fa-spin");
            }
            else if (s.isActionSubNew == "N")
            {
                $("#i_save").removeClass("fa fa-save");
                $("#i_save").addClass("fa fa-spinner fa-spin");
            }


            if (isdataValidateHeader())
            {
                if (s.datalistgridEmployee.length > 0)
                {
                    if (s.datalistgridDates.length > 0)
                    {
                        if (s.datalistgridPurpose.length > 0)
                        {
                            h.post("../cSSOverTimeRequest/CheckIfExistEmployee",
                                {
                                    par_employees   : s.datalistgridEmployee,
                                    par_dates       : s.datalistgridDates,
                                    par_action      : s.isAction,
                                    par_ctrl_no     : header_info.ot_ctrl_no
                                })
                                .then(function (dx)
                                {
                                    if (dx.data.message == "success")
                                    {
                                        if (dx.data.exist == "Y")
                                        {
                                            swal(dx.data.exist_content +" already have OT request to the specified date covered. Exclude/Remove the employee or update the date cover", { icon: "error", });
                                            $('.nav-tabs a[href="#tab-2"]').tab('show');
                                            $("#submit").html("<i class='fa fa-paper-plane-o'></i> Submit");
                                            //$("#i_submit").removeClass("fa fa-spinner fa-spin");
                                            //$("#i_submit").addClass("fa fa-paper-plane-o");
                                            $("#i_save").removeClass("fa fa-spinner fa-spin");
                                            $("#i_save").addClass("fa fa-save");
                                            s.getEmployeeInfoHeader();
                                        }
                                        else
                                        {
                                            h.post("../cSSOverTimeRequest/SaveDirectToDatabase", {
                                                par_status          : s.isActionSubNew
                                                , par_data_header   : header_info
                                                , par_data_empl     : s.datalistgridEmployee
                                                , par_data_dates    : s.datalistgridDates
                                                , par_data_purpose  : s.datalistgridPurpose
                                                , par_action        : s.isAction
                                            }).then(function (d)
                                            {
                                                if (d.data.message == "success")
                                                {
                                                    var status_final = "";
                                                    var row_update = s.datalistgrid.select(d.data.par_data_header.ot_ctrl_no, "ot_ctrl_no");
                                                    s.datalistgrid[s.rowIDUpdate] = row_update;
                                                    console.log(d.data.par_data_header);
                                                    if (d.data.par_data_header.approval_status == "S")
                                                    {
                                                        status_final = "Submitted!";
                                                    }
                                                    if (d.data.par_data_header.approval_status == "N" && s.isAction == "EDIT") {
                                                        status_final = "Updated!";
                                                    }
                                                    if (d.data.par_data_header.approval_status == "N" && s.isAction == "ADD") {
                                                        status_final = "Save!";
                                                    }
                                                    if (d.data.par_data_header.approval_status == "R")
                                                    {
                                                        status_final = "Submitted and Reviewed!";
                                                    }
                                                   
                                                    if (s.isAction == "EDIT")
                                                    {
                                                        swal({ icon: "success", title: "Existing Data successfully " + status_final });
                                                    }
                                                    else
                                                    {
                                                        swal({ icon: "success", title: "New Data successfully " + status_final});
                                                    }
                                                    s.getEmployeeInfoHeader();
                                                    $("#submit").html("<i class='fa fa-paper-plane-o'></i> Submit");
                                                    //$("#i_submit").removeClass("fa fa-spinner fa-spin");
                                                    //$("#i_submit").addClass("fa fa-paper-plane-o");
                                                    $("#i_save").removeClass("fa fa-spinner fa-spin");
                                                    $("#i_save").addClass("fa fa-save");
                                                    $('#main_modal').modal("hide");
                                                }
                                                else swal({ icon: "warning", title: d.data.message });
                                            });
                                        }
                                    }
                                });
                        }
                        else
                        {
                            swal({ icon: "warning", title: "Add atleast 1 purpose of this O.T request." });
                            $('.nav-tabs a[href="#tab-4"]').tab('show');
                            $("#submit").html("<i class='fa fa-paper-plane-o'></i> Submit");
                            //$("#i_submit").removeClass("fa fa-spinner fa-spin");
                            //$("#i_submit").addClass("fa fa-paper-plane-o");
                            $("#i_save").removeClass("fa fa-spinner fa-spin");
                            $("#i_save").addClass("fa fa-save");
                        }
                    }

                    else {
                        swal({ icon: "warning", title: "Please Add Overtime Covered Date/s!" });
                        $('.nav-tabs a[href="#tab-3"]').tab('show');
                        $("#submit").html("<i class='fa fa-paper-plane-o'></i> Submit");
                        //$("#i_submit").removeClass("fa fa-spinner fa-spin");
                        //$("#i_submit").addClass("fa fa-paper-plane-o");
                        $("#i_save").removeClass("fa fa-spinner fa-spin");
                        $("#i_save").addClass("fa fa-save");
                    }
                }
                else
                {
                    swal({ icon: "warning", title: "Please Add Employee Details!" });
                    $('.nav-tabs a[href="#tab-2"]').tab('show');
                    $("#submit").html("<i class='fa fa-paper-plane-o'></i> Submit");
                    //$("#i_submit").removeClass("fa fa-spinner fa-spin");
                    //$("#i_submit").addClass("fa fa-paper-plane-o");
                    $("#i_save").removeClass("fa fa-spinner fa-spin");
                    $("#i_save").addClass("fa fa-save");
                }
            }
            else
            {
                $("#submit").html("<i class='fa fa-paper-plane-o'></i> Submit");
                //$("#i_submit").removeClass("fa fa-spinner fa-spin");
                //$("#i_submit").addClass("fa fa-paper-plane-o");
                $("#i_save").removeClass("fa fa-spinner fa-spin");
                $("#i_save").addClass("fa fa-save");
            }
        }

        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    //************************************// 
    //*** Resubmit Cancel Pending Record
    //************************************// 
    s.btn_resubmit_click = function (row_id)
    {
        try
        {
            if (s.datalistgrid2.length > 0)
            {
                h.post("../cSSOverTimeRequest/GenerateNewApplNbr",
                {
                    par_empl_id: $('#ddl_name option:selected').val()
                    , par_year: $('#ddl_year').val()
                }).then(function (d)
                    {
                        if (d.data.message == "success")
                        {
                            var data2 = [];

                            btn = document.getElementById('submit');
                            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Resubmit';

                            if ((d.data.available_leave[0] + s.getDtlDataLength) >= s.datalistgrid2.length) {
                                var data = {
                                    application_nbr: s.datalistgrid2[row_id].application_nbr
                                    , approval_status: "S"
                                    , updated_dttm: new Date().toLocaleString()
                                }

                                var data2 = {
                                    application_nbr: s.datalistgrid2[row_id].application_nbr
                                    , flp_application_date: s.datalistgrid2[row_id].flp_application_date
                                    , empl_id: s.datalistgrid2[row_id].empl_id
                                    , rcrd_status: "S"
                                    , approval_status: "S"
                                    , approval_status_descr: "Submitted"
                                    , rcrd_status_descr: "Submitted"
                                }

                                h.post("../cSSOverTimeRequest/ReSubmit", { data: data, data2: data2 }).then(function (d) {
                                    if (d.data.message == "success") {

                                        FilterPageGrid2();

                                        $('#main_modal').modal("hide");
                                        swal("Your record has been Resubmitted!", { icon: "success", });
                                    }
                                    else {
                                        swal(d.data.message, { icon: "warning", });
                                    }
                                    btn.innerHTML = '<i class="fa fa-paper-plane-o"> </i> Submit';
                                });
                            }
                            else {
                                swal({ icon: "warning", title: d.data.available_leave[0].toString() + " slot/s available for Force Leave Plan." });
                            }
                        }
                        else {
                            swal(d.data.message, { icon: "warning", });
                        }
                });
            }
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    function isdataValidateHeader()
    {
        var return_val = true;
        ValidationResultColorHeader("ALL", false);
        $('#lbl_cover_required').html("");
        validationColorHeaderOptions("ALL", false);

        if ($("#txtb_date_filed").val().trim() == "")
        {
            ValidationResultColorHeader("txtb_date_filed", true);
            return_val = false;
        }

        //if ($("#ddl_fund_charges").val().trim() == "")
        //{
        //    ValidationResultColorHeader("ddl_fund_charges", true);
        //    return_val = false;
        //}

        if ($("#txtb_subject").val().trim() == "")
        {
            ValidationResultColorHeader("txtb_subject", true);
            return_val = false;
            $('.nav-tabs a[href="#tab-1"]').tab('show');
        }

        if ($('#chk_weekdays').prop("checked") == false
            && $('#chk_weekend').prop("checked") == false
            && $('#chk_holiday').prop("checked") == false
            && $('#chk_dayoff').prop("checked") == false
            )
        {
            $('#lbl_cover_required').html("Check atleast one cover details.");
            return_val = false;
        }

        if ($('#chk_weekdays').prop("checked"))
        {
            if ($("#txtb_weekdays_ot_start").val().trim() == "") {
                ValidationResultColorHeader("txtb_weekdays_ot_start", true);
                return_val = false;
            }
            else if (validateHhMm($('#txtb_weekdays_ot_start').val().trim()) == false)
            {
                ValidationResultColorHeader("txtb_weekdays_ot_start", true);
                $('#lbl_txtb_weekdays_ot_start_req').text("Invalid Value!");
                return_val = false;
            }

            if ($("#txtb_weekdays_ot_end").val().trim() == "") {
                ValidationResultColorHeader("txtb_weekdays_ot_end", true);
                return_val = false;
            }
            else if (validateHhMm($('#txtb_weekdays_ot_end').val().trim()) == false) {
                ValidationResultColorHeader("txtb_weekdays_ot_end", true);
                $('#lbl_txtb_weekdays_ot_end_req').text("Invalid Value!");
                return_val = false;
            }

            if ($("#ddl_weekdays_ot_start_time").val() == "") {
                ValidationResultColorHeader("ddl_weekdays_ot_start_time", true);
                return_val = false;
            }

            if ($("#ddl_weekdays_ot_end_time").val() == "") {
                ValidationResultColorHeader("ddl_weekdays_ot_end_time", true);
                return_val = false;
            }
        }


        if ($('#chk_weekend').prop("checked"))
        {
            if ($("#txtb_weekend_ot_start").val().trim() == "") {
                ValidationResultColorHeader("txtb_weekend_ot_start", true);
                return_val = false;
            }
            else if (validateHhMm($('#txtb_weekend_ot_start').val().trim()) == false) {
                ValidationResultColorHeader("txtb_weekend_ot_start", true);
                $('#lbl_txtb_weekend_ot_start_req').text("Invalid Value!");
                return_val = false;
            }

            if ($("#txtb_weekend_ot_end").val().trim() == "") {
                ValidationResultColorHeader("txtb_weekend_ot_end", true);
                return_val = false;
            }
            else if (validateHhMm($('#txtb_weekend_ot_end').val().trim()) == false) {
                ValidationResultColorHeader("txtb_weekend_ot_end", true);
                $('#lbl_txtb_weekend_ot_end_req').text("Invalid Value!");
                return_val = false;
            }

            if ($("#ddl_weekend_ot_start_time").val() == "") {
                ValidationResultColorHeader("ddl_weekend_ot_start_time", true);
                return_val = false;
            }

            if ($("#ddl_weekend_ot_end_time").val() == "") {
                ValidationResultColorHeader("ddl_weekend_ot_end_time", true);
                return_val = false;
            }
        }

        if ($('#chk_holiday').prop("checked")) {
            if ($("#txtb_holiday_ot_start").val().trim() == "") {
                ValidationResultColorHeader("txtb_holiday_ot_start", true);
                return_val = false;
            }
            else if (validateHhMm($('#txtb_holiday_ot_start').val().trim()) == false) {
                ValidationResultColorHeader("txtb_holiday_ot_start", true);
                $('#lbl_txtb_holiday_ot_start_req').text("Invalid Value!");
                return_val = false;
            }

            if ($("#txtb_holiday_ot_end").val().trim() == "") {
                ValidationResultColorHeader("txtb_holiday_ot_end", true);
                return_val = false;
            }
            else if (validateHhMm($('#txtb_holiday_ot_end').val().trim()) == false) {
                ValidationResultColorHeader("txtb_holiday_ot_end", true);
                $('#lbl_txtb_holiday_ot_end_req').text("Invalid Value!");
                return_val = false;
            }

            if ($("#ddl_holiday_ot_start_time").val() == "") {
                ValidationResultColorHeader("ddl_holiday_ot_start_time", true);
                return_val = false;
            }

            if ($("#ddl_holiday_ot_end_time").val() == "") {
                ValidationResultColorHeader("ddl_holiday_ot_end_time", true);
                return_val = false;
            }
        }

        if ($('#chk_dayoff').prop("checked")) {
            if ($("#txtb_dayoff_ot_start").val().trim() == "") {
                ValidationResultColorHeader("txtb_dayoff_ot_start", true);
                return_val = false;
            }
            else if (validateHhMm($('#txtb_dayoff_ot_start').val().trim()) == false) {
                ValidationResultColorHeader("txtb_dayoff_ot_start", true);
                $('#lbl_txtb_dayoff_ot_start_req').text("Invalid Value!");
                return_val = false;
            }

            if ($("#txtb_dayoff_ot_end").val().trim() == "") {
                ValidationResultColorHeader("txtb_dayoff_ot_end", true);
                return_val = false;
            }
            else if (validateHhMm($('#txtb_dayoff_ot_end').val().trim()) == false) {
                ValidationResultColorHeader("txtb_dayoff_ot_end", true);
                $('#lbl_txtb_dayoff_ot_end_req').text("Invalid Value!");
                return_val = false;
            }

            if ($("#ddl_dayoff_ot_start_time").val() == "") {
                ValidationResultColorHeader("ddl_dayoff_ot_start_time", true);
                return_val = false;
            }

            if ($("#ddl_dayoff_ot_end_time").val() == "") {
                ValidationResultColorHeader("ddl_dayoff_ot_end_time", true);
                return_val = false;
            }
        }

        if (s.isCheckedOth == "true" && $("#txtb_fund_other_dspl").val() == "") {
            ValidationResultColorHeader("txtb_fund_other_dspl", true);
            return_val = false;
        }
       
        return return_val
    }

    function isdataValidatedEmployees() 
    {
        var return_val  = true;
        s.already_exist = false;
        ValidationResultColor("ALL", false);
        if (s.datalistgridEmployee.length > 0)
        {
            for (var x = 0; x < s.datalistgridEmployee.length; x++)
            {

                if ($("#ddl_name_dspl").val().trim() == s.datalistgridEmployee[x].empl_id) {
                    s.already_exist = true
                }
            }

        }

        if (s.already_exist == true)
        {
            ValidationResultColor("ddl_name_exists", true);
            return_val = false;
        }

        if ($("#ddl_name_dspl").val().trim() == "")
        {
            ValidationResultColor("ddl_name_dspl", true);
            return_val = false;
        }
        return return_val
    }

    function isdataValidatedDates()
    {
        var return_val  = true;
        s.already_exist = false;
        ValidationResultColorDates("ALL", false);
        
        if (s.datalistgridDates.length > 0) {
            for (var x = 0; x < s.datalistgridDates.length; x++) {

                if ($("#txtb_ot_date_from").val().trim() == s.datalistgridDates[x].travel_date && btn_grid_action == "A") {
                    s.already_exist = true
                }
            }

        }

        if (s.already_exist == true) {
            ValidationResultColorDates("txtb_ot_date_from_exists", true);
            return_val = false;
        }

        if ($("#txtb_ot_date_from").val().trim() == "") {

            ValidationResultColorDates("txtb_ot_date_from", true);
            return_val = false;
        }
        else if (moment($('#txtb_ot_date_from').val().trim(), 'YYYY-MM-DD', true).isValid() == false) {
            ValidationResultColor3("txtb_ot_date_from", true);
            $("#lbl_txtb_ot_date_from_req").text("Invalid Date!");
            return_val = false;
        }

        if ($("#txtb_ot_date_to").val().trim() == "") {

            ValidationResultColorDates("txtb_ot_date_to", true);
            return_val = false;
        }
        else if (moment($('#txtb_ot_date_to').val().trim(), 'YYYY-MM-DD', true).isValid() == false) {
            ValidationResultColor3("txtb_ot_date_to", true);
            $("#lbl_txtb_ot_date_to_req").text("Invalid Date!");
            return_val = false;
        }

        if ($("#txtb_ot_start").val().trim() == "") {
            ValidationResultColorDates("txtb_ot_start", true);
            return_val = false;
        }
        else if (validateHhMm($('#txtb_ot_start').val()) == false)
        {
            ValidationResultColorDates("txtb_ot_start", true);
            $("#lbl_txtb_ot_start_req").text("Invalid Value!");
            return_val = false;
        }
        if ($("#txtb_ot_end").val().trim() == "") {

            ValidationResultColorDates("txtb_ot_end", true);
            return_val = false;
        }
        else if (validateHhMm($('#txtb_ot_end').val()) == false) {
            ValidationResultColorDates("txtb_ot_end", true);
            $("#lbl_txtb_ot_end_req").text("Invalid Value!");
            return_val = false;
        }

        return return_val
    }

    function validateHhMm(par_value) {
        //var isValid = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(inputField.value);
        var isValid = (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).test(par_value);

        //if (isValid) {
        //    inputField.style.backgroundColor = '#bfa';
        //} else {
        //    inputField.style.backgroundColor = '#fba';
        //}

        return isValid;
    }

    function validationColorHeaderOptions(par_object_id,par_v_result)
    {
        $("#txtb_weekdays_ot_start").removeClass("required");
        $("#ddl_weekdays_ot_start_time").removeClass("required");
        $("#ddl_weekdays_ot_start_end").removeClass("required");
        $("#lbl_txtb_weekdays_ot_start_req").text("");
        $("#txtb_weekdays_ot_end").removeClass("required");
        $("#lbl_txtb_weekdays_ot_end_req").text("");

        $("#txtb_weekend_ot_start").removeClass("required");
        $("#ddl_weekend_ot_start_time").removeClass("required");
        $("#ddl_weekend_ot_start_end").removeClass("required");
        $("#lbl_txtb_weekend_ot_start_req").text("");
        $("#txtb_weekend_ot_end").removeClass("required");
        $("#lbl_txtb_weekend_ot_end_req").text("");

        $("#txtb_holiday_ot_start").removeClass("required");
        $("#ddl_holiday_ot_start_time").removeClass("required");
        $("#ddl_holiday_ot_start_end").removeClass("required");
        $("#lbl_txtb_holiday_ot_start_req").text("");
        $("#txtb_holiday_ot_end").removeClass("required");
        $("#lbl_txtb_holiday_ot_end_req").text("");

        $("#txtb_dayoff_ot_start").removeClass("required");
        $("#ddl_dayoff_ot_start_time").removeClass("required");
        $("#ddl_dayoff_ot_end_time").removeClass("required");
        $("#lbl_txtb_dayoff_ot_start_req").text("");
        $("#txtb_dayoff_ot_end").removeClass("required");
        $("#lbl_txtb_dayoff_ot_end_req").text("");
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidationResultColorHeader(par_object_id, par_v_result)
    {
        if (par_v_result)
        {
            if (par_object_id == "ddl_fund_charges" ||
                par_object_id == "ddl_subdepartment" ||
                par_object_id == "ddl_division" ||
                par_object_id == "ddl_section" ||
                par_object_id == "ddl_from")
            {
                $("#select2-" + par_object_id + "-container").parent().addClass("required");
                $("#lbl_" + par_object_id + "_req").text("Required Field!");
            }
            else
            {
                $("#" + par_object_id ).addClass("required");
                $("#lbl_" + par_object_id + "_req").text("Required Field!");
            }

        }
        else {
            //remove of refresh the object form being required

            $("#txtb_date_filed").removeClass("required");
            $("#lbl_txtb_date_filed_req").text("");
            $("#txtb_subject").removeClass("required");
            $("#lbl_txtb_subject_req").text("");
            $("#lbl_txtb_fund_other_dspl_req").text("");
            $("#txtb_fund_other_dspl").removeClass("required");
            $("#txtb_weekdays_ot_start").removeClass("required");
            $("#ddl_weekdays_ot_start_time").removeClass("required");
            $("#ddl_weekdays_ot_start_end").removeClass("required");
            $("#lbl_txtb_weekdays_ot_start_req").text("");
            $("#txtb_weekdays_ot_end").removeClass("required");
            $("#lbl_txtb_weekdays_ot_start_req").text("");

            $("#txtb_weekend_ot_start").removeClass("required");
            $("#ddl_weekend_ot_start_time").removeClass("required");
            $("#ddl_weekend_ot_start_end").removeClass("required");
            $("#lbl_txtb_weekend_ot_start_req").text("");
            $("#txtb_weekend_ot_end").removeClass("required");
            $("#lbl_txtb_weekend_ot_start_req").text("");

            $("#txtb_holiday_ot_start").removeClass("required");
            $("#lbl_txtb_holiday_ot_start_req").text("");
            $("#txtb_holiday_ot_end").removeClass("required");
            $("#lbl_txtb_holiday_ot_start_req").text("");

            $("#txtb_dayoff_ot_start").removeClass("required");
            $("#lbl_txtb_dayoff_ot_start_req").text("");
            $("#txtb_dayoff_ot_end").removeClass("required");
            $("#lbl_txtb_dayoff_ot_start_req").text("");

            $("#txtb_subject").removeClass("required");
            $("#lbl_txtb_subject_req").text("");

            $("#select2-ddl_fund_charges-container").parent().removeClass("required");
            $("#lbl_ddl_fund_charges_req").text("");
            $("#select2-ddl_subdepartment-container").parent().removeClass("required");
            $("#lbl_ddl_subdepartment_req").text("");
            $("#select2-ddl_division-container").parent().removeClass("required");
            $("#lbl_ddl_division_req").text("");
            $("#select2-ddl_section-container").parent().removeClass("required");
            $("#lbl_ddl_section_req").text("");
            $("#select2-ddl_from-container").parent().removeClass("required");
            $("#lbl_ddl_from_req").text("");
            $("#select2-ddl_fund_charges-container").parent().removeClass("required");
            $("#lbl_ddl_fund_charges_req").text("");
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
            if (par_object_id == "ddl_name_exists")
            {
                $("#lbl_ddl_name_dspl_req").text("Already Exists!");
               
            }
            else if (par_object_id == "ddl_name_dspl")
            {
                $("#lbl_" + par_object_id + "_req").text("Required Field!");
            }

            $("#select2-ddl_name_dspl-container").parent().addClass("required");

        }
        else {
            //remove of refresh the object form being required
            $("#select2-ddl_name_dspl-container").parent().removeClass("required");
            $("#lbl_ddl_name_dspl_req").text("");
        }
    }

    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidationResultColorDates(par_object_id, par_v_result)
    {
        if (par_v_result)
        {
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id+"_req").text("Required Field!");
        }
        else {
            //remove of refresh the object form being required

            $("#txtb_ot_date_to").removeClass("required");
            $("#lbl_txtb_ot_date_to_req").text("");
            $("#txtb_ot_date_from").removeClass("required");
            $("#lbl_txtb_ot_date_from_req").text("");

            $("#txtb_ot_start").removeClass("required");
            $("#lbl_txtb_ot_start_req").text("");
            $("#txtb_ot_end").removeClass("required");
            $("#lbl_txtb_ot_end_req").text("");


        }
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

    //this fucntion is called after refreshTable to return to the current dataTable page
    function changePage(tname, page, id) {
        var npage = page
        var pageLen = $("#" + id).DataTable().page.info().length
        if (page < 2 && pageLen == 0) {
            npage = page + 1
        }
        else if (page > 1 && pageLen == 0) {
            npage = page - 1
        }

        if (npage != 0) {
            s[tname].fnPageChange(npage)
        }
    }


    Array.prototype.refreshTable = function (table, id) {

        if (this.length == 0) {
            s.oTable.fnClearTable();

        }
        else {
            s.oTable.fnClearTable();
            s.oTable.fnAddData(this);
        }

        var el_id = s[table][0].id

        if (id != "") {
            for (var x = 1; x <= $("#" + el_id).DataTable().page.info().pages; x++) {
                if (id.get_page(table) == false) {
                    s.oTable.fnPageChange(x);
                }
                else {
                    break;
                }
            }
        }


    }

    //**************************************//
    //***Get Page Number****//
    //**************************************//
    function get_page(code, table)
    {
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

    //This function is called to extract the DataTable rows data
    function DataTable_data(tname) {
        var data = []
        var id = s[tname][0].id;
        var dtrw = $("#" + id).DataTable().rows().data()
        for (var x = 0; x < dtrw.length; ++x) {
            data.push(dtrw[x])
        }
        return data
    }

    s.btn_edit_row_dates = function (row_id)
    {
        index_update        = row_id;
        tname               = "oTableDates";
        s.btn_add_dates     = "Update";
        s.isShowAddDates    = false;
        s.isShowUpdateDates = true;
        $("#txtb_ot_date_from ").val(s.datalistgridDates[row_id].ot_date_from);
        $("#txtb_ot_date_to").val(s.datalistgridDates[row_id].ot_date_to);
        $("#txtb_ot_start").val(s.datalistgridDates[row_id].ot_start_time);
        $("#txtb_ot_end").val(s.datalistgridDates[row_id].ot_end_time);
        $("#ddl_start_time").val(s.datalistgridDates[row_id].ot_start_ampm);
        $("#ddl_end_time").val(s.datalistgridDates[row_id].ot_end_ampm);
        $("#txtb_ot_date_from").attr("disabled",true);
    }

    s.btn_edit_row_purpose = function (row_id)
    {
        index_update        = row_id;
        tname               = "oTablePurpose";
        s.btn_add_dates     = "Update";
        $('#btn_add_ot_purpose').attr("ngx-actionmode", "U");
        $('#btn_add_ot_purpose').attr("ngx-rowid", row_id);
        $('#btn_add_ot_purpose').html('<i class="fa fa-save"> </i>Updated');
        $('#txtb_ot_purpose').val(s.datalistgridPurpose[row_id].ot_purpose_details);

    }

    function initOTCoverObject()
    {
        s.isAbledStarttime_weekdays     = true;
        s.isAbledEndtime_weekdays       = true;
        s.isAbledStarttimeAMPM_weekdays = true;
        s.isAbledStarttimeAMPM_weekend  = true;
        s.isAbledStarttimeAMPM_holiday  = true;
        s.isAbledStarttimeAMPM_dayoff   = true;
        s.isAbledEndtimeAMPM_weekdays   = true;
        s.isAbledStarttime_weekend      = true;
        s.isAbledEndtime_weekend        = true;
        s.isAbledEndtimeAMPM_weekend    = true;
        s.isAbledStarttime_holiday      = true;
        s.isAbledEndtime_holiday        = true;
        s.isAbledEndtimeAMPM_holiday    = true;
        s.isAbledStarttime_dayoff       = true;
        s.isAbledEndtime_dayoff         = true;
        s.isAbledEndtimeAMPM_dayoff     = true;
        s.inable_in_add                 = false;
        s.dis_when_s                    = false;

        $("#txtb_weekdays_ot_start").val("08:00");
        $("#txtb_weekdays_ot_end").val("05:00");
        $("#txtb_weekend_ot_start").val("08:00");
        $("#txtb_weekend_ot_end").val("05:00");
        $("#txtb_holiday_ot_start").val("08:00");
        $("#txtb_holiday_ot_end").val("05:00");
        $("#txtb_dayoff_ot_start").val("08:00");
        $("#txtb_dayoff_ot_end").val("05:00");
    }

    function ToogleDisabledRemove()
    {
        s.inable_in_add             = false;
        s.isAbledSubject            = false;
        s.isAbledDetails            = false;
        s.isAbledJustification      = false;
        s.isAbledEmplname           = false;
        s.isAbledTraveldate         = false;
        s.isAbledStarttime          = false;
        s.isAbledStarttimeAMPM      = false;
        s.isAbledEndtime            = false;
        s.isAbledEndtimeAMPM        = false;
        s.isAbledTravelDateFiled    = false;
        s.inable_in_add             = false;
        s.dis_when_s                = false;
        $("#startclockpickerspan").addClass("input-group-addon");
        $("#startclockpickerclock").addClass("fa fa-clock-o");
        $("#endclockpickerspan").addClass("input-group-addon");
        $("#endclockpickerclock").addClass("fa fa-clock-o");
    }

    function ToogleDisabledEdit()
    {
        s.isAbledTravelForm         = true;
        s.isAbledTravelType         = true;
        s.isAbledSubject            = true;
        s.isAbledDetails            = true;
        s.isAbledJustification      = true;
        s.isAbledEmplname           = true;
        s.isAbledTraveldate         = true;
        s.isAbledStarttime          = true;
        s.isAbledStarttimeAMPM      = true;
        s.isAbledEndtime            = true;
        s.isAbledEndtimeAMPM        = true;
        s.isAbledTravelDateFiled    = true;
        s.inable_in_add             = true;
        s.dis_when_s                = true;
    }

    //************************************// 
    //*** Open Edit Modal         
    //**********************************// 
    function edit_action(row_id, isCreator,par_tbl)
    {
        try {
            
            clearentry();
            s.subdepartment_list    = s.subdepartment_list_temp;
            s.division_list         = s.division_list_temp;
            s.section_list          = s.section_list_temp;

            

            isCreatorGridAction         = isCreator
            var table_name              = par_tbl    == "hdr" ? "datalistgrid" : "arr_dates";
            s.isAction                  = "EDIT"
            s.isShowAddEmployee         = true
            s.isShowUpdateEmployee      = false
            s.isShowAddDates            = true
            s.isShowUpdateDates         = false
            s.rowIDUpdate               = row_id; 

            $('#main_modal').on('shown.bs.modal', function ()
            {
                $('.nav-tabs a[href="#tab-1"]').tab('show');
            });

            tname = ""

            if (s[table_name][row_id].approval_status == "C" || s[table_name][row_id].approval_status == "N") {
                ToogleDisabledRemove()
                s[table_name][row_id].weekdays_flag     == true ? s.cover_checkbox_val_change(true, "weekdays") :s.cover_checkbox_val_change(false,"weekdays");
                s[table_name][row_id].weekend_flag      == true ? s.cover_checkbox_val_change(true, "weekend")  :s.cover_checkbox_val_change(false,"weekend");
                s[table_name][row_id].holiday_flag      == true ? s.cover_checkbox_val_change(true, "holiday")  :s.cover_checkbox_val_change(false,"holiday");
                s[table_name][row_id].dayoff_ot_flag    == true ? s.cover_checkbox_val_change(true, "dayoff")   :s.cover_checkbox_val_change(false,"dayoff");
                s.isShowSubmit      = true;
                s.isShowAddEmployee = true;
                s.isShowAddDates = true;
                s.ModalTitle = "Edit Existing Record";
            }
            else
            {
                ToogleDisabledEdit()
                s.isShowSubmit      = false;
                s.isShowAddEmployee = false;
                s.isShowAddDates    = false;
                s.cover_checkbox_val_change(false, "weekdays");
                s.cover_checkbox_val_change(false, "weekend");
                s.cover_checkbox_val_change(false, "holiday");
                s.cover_checkbox_val_change(false, "dayoff");
                s.ModalTitle = "OT Request Details";
            }

            //DISABLED IF NOT CREATOR
            if (isCreator == false)
            {
                ToogleDisabledEdit()
                s.isShowSubmit      = false;
                s.isShowAddEmployee = false;
                s.isShowAddDates    = false;

                s.cover_checkbox_val_change(false,"weekdays");
                s.cover_checkbox_val_change(false,"weekend");
                s.cover_checkbox_val_change(false,"holiday");
                s.cover_checkbox_val_change(false,"dayoff");
                
            }

            if (s[table_name][row_id].approval_status == "S") {
                s.showRecall = true;
            }
            else {
                s.showRecall = false;
            }

            btn             = document.getElementById('submit');
           

            
            s.txtb_ot_request_nbr    = s[table_name][row_id].ot_ctrl_no       ;
            s.txtb_date_filed        = s[table_name][row_id].ot_request_date  ;
            s.txtb_subject           = s[table_name][row_id].ot_subject       ;
            s.txtb_justification     = s[table_name][row_id].ot_justification ;
	    $("#txtb_justification").val(s[table_name][row_id].ot_justification);
            s.txtb_details_remarks   = s[table_name][row_id].details_remarks  ;

            s.temp_ot_ctrl_no       = s[table_name][row_id].ot_ctrl_no;;
            s.temp_approval_id      = s[table_name][row_id].approval_id;

            s.ddl_subdepartment = s[table_name][row_id].subdepartment_code;
            $('#ddl_subdepartment').val(s.ddl_subdepartment);
            $('#ddl_subdepartment').val(s[table_name][row_id].subdepartment_code).trigger('change');
            setTimeout(function () {
                s.ddl_division = s[table_name][row_id].division_code;
                $('#ddl_division').val(s.ddl_division);
                $('#ddl_division').val(s[table_name][row_id].division_code).trigger('change');
                setTimeout(function () {
                    s.ddl_section = s[table_name][row_id].section_code;
                    $('#ddl_section').val(s.ddl_section);
                    $('#ddl_section').val(s.ddl_section).trigger('change');
                }, 300);
            }, 500);
            
          
          

            s.ddl_fund_charges = s[table_name][row_id].fund_code;
            $('#ddl_fund_charges').val(s.ddl_fund_charges).trigger('change');
          
            s.chk_weekdays              = s[table_name][row_id].weekdays_flag;
            s.chk_weekend               = s[table_name][row_id].weekend_flag;
            s.chk_holiday               = s[table_name][row_id].holiday_flag;
            s.chk_dayoff                = s[table_name][row_id].dayoff_ot_flag;

           
            s.txtb_weekdays_ot_start    = s[table_name][row_id].weekdays_in;
            $('#txtb_weekdays_ot_start').val(s[table_name][row_id].weekdays_in);
            s.txtb_weekdays_ot_end      = s[table_name][row_id].weekdays_out;
            $('#txtb_weekdays_ot_end').val(s[table_name][row_id].weekdays_out);
            $('#ddl_weekdays_ot_start_time').val((s[table_name][row_id].weekdays_in_ampm));
            $('#ddl_weekdays_ot_end_time').val((s[table_name][row_id].weekdays_out_ampm));
               

            s.txtb_weekend_ot_start     = s[table_name][row_id].weekend_in;
            $('#txtb_weekend_ot_start').val(s[table_name][row_id].weekend_in);
            s.txtb_weekend_ot_end       = s[table_name][row_id].weekend_out;
            $('#txtb_weekend_ot_end').val(s[table_name][row_id].weekend_out);
            $('#ddl_weekend_ot_start_time').val((s[table_name][row_id].weekend_in_ampm));
            $('#ddl_weekend_ot_end_time').val((s[table_name][row_id].weekend_out_ampm));

            s.txtb_holiday_ot_start     = s[table_name][row_id].holiday_in;
            $('#txtb_holiday_ot_start').val(s[table_name][row_id].holiday_in);
            s.txtb_holiday_ot_end       = s[table_name][row_id].holiday_out;
            $('#txtb_holiday_ot_end').val(s[table_name][row_id].holiday_out);
            $('#ddl_holiday_ot_start_time').val((s[table_name][row_id].holiday_in_ampm));
            $('#ddl_holiday_ot_end_time').val((s[table_name][row_id].holiday_out_ampm));

            s.txtb_dayoff_ot_start      = s[table_name][row_id].dayoff_ot_in;
            $("#txtb_dayoff_ot_start").val(s[table_name][row_id].dayoff_ot_in);
            s.txtb_dayoff_ot_end        = s[table_name][row_id].dayoff_ot_out;
            $("#txtb_dayoff_ot_end").val(s[table_name][row_id].dayoff_ot_out);
            $('#ddl_dayoff_ot_start_time').val((s[table_name][row_id].dayoff_ot_in_ampm));
            $('#ddl_dayoff_ot_end_time').val((s[table_name][row_id].dayoff_ot_out_ampm));


            if (s[table_name][row_id].oth_fund_descr.trim() != "")
            {
                s.chk_oth = true
            }
            else
            {
                s.chk_oth = false
            }
            

            if (s.chk_oth == true)
            {
                s.isCheckedOth = "true"
                s.isShowOthFund = true
            }

            else {
                s.isCheckedOth = "false"
                s.isShowOthFund = false
            }

            $("#txtb_fund_other_dspl").val(s[table_name][row_id].oth_fund_descr);
            s.txtb_fund_other_dspl = s[table_name][row_id].oth_fund_descr



            s.chk_cto = s[table_name][row_id].ot_coc_credit_flag;
            
            s.ddl_year      = s[table_name][row_id].ot_year;
            s.ddl_from      = s[table_name][row_id].ot_from_empl_id;
            $('#ddl_from').val(s.ddl_from).trigger('change');
            s.ddl_month     = s[table_name][row_id].ot_month;

            s.txtb_thru     = s.ot_thru_employeename;
            s.txtb_for      = s.ot_for_employeename;


            if (s[table_name][row_id].approval_status == "C")
            {
                btn.innerHTML   = '<i class="fa fa-paper-plane-o"></i> Re-Submit All';
                s.resubmit      = "TRUE";
            }
            else
            {
                btn.innerHTML   = '<i class="fa fa-paper-plane-o"></i> Submit';
                s.resubmit      = "FALSE";
            }
            
            h.post("../cSSOverTimeRequest/GetEmployeesDetails",
            {
                par_ot_ctrl_no: s[table_name][row_id].ot_ctrl_no
            }).then(function (d) {
                if (d.data.message == "success")
                {

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
                    if (d.data.data_dates.length > 0)
                    {
                        s.datalistgridDates = d.data.data_dates
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

                    $('#main_modal').modal({ backdrop: 'static', keyboard: false });
                }
                else
                {
                    swal(d.data.message, { icon: "warning", });
                }
            });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }


    function GetDetailsData(application_nbr) {
        h.post("../cSSOverTimeRequest/GetDetailsData", {
            p_application_nbr: application_nbr
        }).then(function (d)
        {
            if (d.data.message == "success")
            {
                s.oTable2.fnClearTable();
                s.datalistgrid2 = d.data.flpDtlLst;

                if (d.data.flpDtlLst.length > 0)
                {
                    s.oTable2.fnAddData(d.data.flpDtlLst);
                }
            }
            else {
                swal(d.data.message, { icon: "warning", });
            }
        });
    }

    //************************************// 
    //*** Open Edit Modal         
    //**********************************// 
    s.btn_edit_action = function (row_id, isCreator, par_tbl)
    {
        edit_action(row_id, isCreator, par_tbl);
    }


    s.getActiveTab = function (value)
    {

        if (value == 1 || value == "1")
        {
            tname = "oTableEmployee";
        }

        else if (value == 2 || value == "2")
        {
            tname = "oTableDates";
        }

    }

    s.cover_checkbox_val_change = function (par_value, par_cover)
    {
            
            s["isAbledStarttime_"+par_cover]        = par_value;
            s["isAbledEndtime_" + par_cover]        = par_value;
            s["isAbledEndtimeAMPM_" + par_cover]    = par_value;
            s["isAbledStarttimeAMPM_" + par_cover]  = par_value;
            $("#txtb_" + par_cover + "_ot_start").val("");
            $("#txtb_" + par_cover + "_ot_end").val("");
    }

    //************************************// 
    //*** Delete Record ******************//              
    //************************************// 
    s.btn_del_row = function (row_index,tnameXX)
    {
        try {

            if (tnameXX == "datalistgridEmployee")
            {

                var message = ""
                var modal_close = false

                if (s.datalistgridEmployee.length == 1)
                {
                    message = "Are you sure to delete this application and all of its components?"
                    modal_close = true
                }
                else
                {
                    message = "Are you sure to delete this record?"
                }

                if (s.datalistgridEmployee[row_index].rcrd_status == "N" || s.datalistgridEmployee[row_index].rcrd_status == "C")
                {
                    swal({
                        title: message,
                        text: "Once deleted, you will not be able to recover this record!",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,

                    })
                        .then(function (willDelete)
                        {
                            if (willDelete)
                            {
                                s.datalistgridEmployee = s.datalistgridEmployee.delete(row_index);
                                s.oTableEmployee.fnClearTable();

                                if (s.datalistgridEmployee.length != 0)
                                {
                                    s.oTableEmployee.fnAddData(s.datalistgridEmployee);
                                }

                                //s.getEmployeeInfoHeader()
                                swal("Your record has been deleted!", { icon: "success", });
                                
                                //var data =
                                //{
                                //    ot_ctrl_no      : s.datalistgridEmployee[row_index].ot_ctrl_no
                                //    , empl_id       : s.datalistgridEmployee[row_index].empl_id
                                //    , rcrd_status   : s.datalistgridEmployee[row_index].rcrd_status
                                //};
                                //h.post("../cSSOverTimeRequest/Delete",
                                //    {
                                //      par_data_empl     : data
                                //    , par_data_date     : null
                                //    , par_data_purpose  : null
                                //    , par_tbl           : 'ot_request_empl_dtl_tbl'
                                //}).then(function (d) {
                                //    if (d.data.message == "success")
                                //    {
                                //        s.datalistgridEmployee = s.datalistgridEmployee.delete(row_index);
                                //        s.oTableEmployee.fnClearTable();

                                //        if (s.datalistgridEmployee.length != 0)
                                //        {
                                //            s.oTableEmployee.fnAddData(s.datalistgridEmployee);
                                //        }

                                //        //s.getEmployeeInfoHeader()
                                //        swal("Your record has been deleted!", { icon: "success", });
                                        
                                //    }
                                //    else {
                                //        swal({ title: d.data.message, icon: "warning", });
                                //    }
                                //});
                            }
                        });
                }
            }

            else if (tnameXX == "datalistgridDates")
            {

                var message = ""
                var modal_close = false
                if (s.datalistgridDates.length == 1)
                {
                    message = "Are you sure to delete this application and all of its components?"
                    modal_close = true
                }
                else {
                    message = "Are you sure to delete this record?"
                }

                if (s.datalistgridDates[row_index].rcrd_status == "N" || s.datalistgridEmployee[row_index].rcrd_status == "C") {
                    swal({
                        title: message,
                        text: "Once deleted, you will not be able to recover this record!",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,

                    })
                        .then(function (willDelete)
                        {
                            if (willDelete)
                            {
                                s.datalistgridDates = s.datalistgridDates.delete(row_index);
                                s.oTableDates.fnClearTable();

                                if (s.datalistgridDates.length != 0)
                                {
                                    s.oTableDates.fnAddData(s.datalistgridDates);
                                }
                                swal("Your record has been deleted!", { icon: "success", });

                                //var data =
                                //{
                                //     ot_ctrl_no     :s.datalistgridDates[row_index].ot_ctrl_no   
                                //    ,ot_date_from   :s.datalistgridDates[row_index].ot_date_from 
                                //    ,ot_date_to     :s.datalistgridDates[row_index].ot_date_to   
                                //    ,ot_start_time  :s.datalistgridDates[row_index].ot_start_time
                                //    ,ot_start_ampm  :s.datalistgridDates[row_index].ot_start_ampm
                                //    ,ot_end_time    :s.datalistgridDates[row_index].ot_end_time  
                                //    ,ot_end_ampm    :s.datalistgridDates[row_index].ot_end_ampm  
                                //    ,rcrd_status    :s.datalistgridDates[row_index].rcrd_status 
                                //};

                                //h.post("../cSSOverTimeRequest/Delete", {
                                //    par_data_empl       : null
                                //    , par_data_date     : data
                                //    , par_data_purpose  : null
                                //    , par_tbl: 'ot_request_dates_dtl_tbl'
                                //}).then(function (d) {
                                //    if (d.data.message == "success") {
                                //        s.datalistgridDates = s.datalistgridDates.delete(row_index);
                                //        s.oTableDates.fnClearTable();

                                //        if (s.datalistgridDates.length != 0) {
                                //            s.oTableDates.fnAddData(s.datalistgridDates);
                                //        }
                                //        swal("Your record has been deleted!", { icon: "success", });
                                        
                                //    }
                                //    else {
                                //        swal({ title: d.data.message, icon: "warning", });
                                //    }
                                //});
                            }
                        });
                }

            }
            else if (tnameXX == "datalistgridPurpose")
            {
                var message = "Are you sure to delete this record?"
                swal({
                    title: message,
                    text: "Once deleted, you will not be able to recover this record!",
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,

                }).then(function (willDelete) {
                    if (willDelete)
                    {
                        s.datalistgridPurpose   = s.datalistgridPurpose.delete(row_index);
                        s.oTablePurpose.fnClearTable();
                        s.datalistgridPurpose.length > 0 ? s.oTablePurpose.fnAddData(s.datalistgridPurpose) : s.oTablePurpose.fnClearTable();
                        swal("Your record has been deleted!", { icon: "success", });
                    }
                });
            }
            else
            {

                var tname = tnameXX == "hdr" ? "datalistgrid" : "arr_dates";
                var message = ""

                if (isDeleteActionMessage == "") {
                    message = "Are you sure to delete this application and all of its components?"
                }

                else {
                    message = isDeleteActionMessage
                }

                swal({
                    title: message,
                    text: "Once deleted, you will not be able to recover this record!",
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,

                })
                    .then(function (willDelete) {
                        if (willDelete) {

                            h.post("../cSSOverTimeRequest/DeleteFromDatabase",
                                {
                                    par_data: s[tname][row_index]
                                    , par_date: (tnameXX == "hdr" ? "":s[tname][row_index])
                            }).then(function (d) {
                                if (d.data.message == "success") {
                                    s.datalistgrid = s.datalistgrid.delete(row_index);
                                    s.oTable.fnClearTable();

                                    if (s.datalistgrid.length != 0) {
                                        s.oTable.fnAddData(s.datalistgrid);
                                    }
                                    s.getEmployeeInfoHeader()

                                    swal("Your record has been cancelled!", { icon: "success", });

                                }
                                else {
                                    swal({ title: d.data.message, icon: "warning", });
                                }
                            })

                        }
                    });
            }
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }


    //************************************// 
    //*** Cancel Record              
    //**********************************// 
    s.btn_cancel = function (row_index) {
        try {
            swal({
                title: "Are you sure to cancel this application?",
                text: "Once cancelled, you will not be able to recover this record!",
                icon: "warning",
                buttons: true,
                dangerMode: true,

            })
                .then(function (willDelete) {
                    if (willDelete) {
                        var data = {
                            application_nbr: s.datalistgrid2[row_index].application_nbr
                            , updated_dttm: new Date().toLocaleString()
                        }
                        var data2 = {
                            application_nbr: s.datalistgrid2[row_index].application_nbr
                            , flp_application_date: s.datalistgrid2[row_index].flp_application_date
                            , rcrd_status: "L"
                        }
                        h.post("../cSSOverTimeRequest/Cancelled", {
                            data: data
                            , data2: data2
                        }).then(function (d) {
                            if (d.data.message == "success") {

                                swal("Your record has been cancelled!", { icon: "success", });
                                FilterPageGrid2();
                                GetDetailsData(s.datalistgrid2[row_index].application_nbr);
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

    Array.prototype.delete = function (code)
    {
        return this.filter(function (d, k) {
            return k != code
        })
    }

    function clearentryDates()
    {
        $('#txtb_ot_date_from').val("");
        $('#txtb_ot_date_to').val("");
        $('#txtb_ot_start').val("");
        $('#txtb_ot_end').val("");
        $('#ddl_start_time').val("AM");
        $('#ddl_start_end').val("PM");
    }

    function clearentryPurpose()
    {
        $('#txtb_ot_purpose').val("");
        $('#txtb_ot_purpose').removeClass("required");
        $('#lbl_txtb_ot_purpose_req').text("");
    }

    function clearentryEmployee()
    {
        $("#ddl_name_dspl").val("").trigger('change')
        $("#txtb_position_dspl").val("")
    }


    function clearentry() 
    {
        ValidationResultColor("ALL", false)
        ValidationResultColorDates("ALL", false)
        validationColorHeaderOptions("ALL", false);
        ValidationResultColorHeader("ALL", false);
        s.txtb_ot_request_nbr   = "";
        s.ddl_from              = "";
        s.chk_cto               = false
        s.txtb_ot_request_nbr   = "";
        s.ddl_year              = "";
        s.ddl_month             = "";
        s.txtb_subject          = "";
        s.txtb_justification    = "";
        s.txtb_details_remarks  = "";
        $("#txtb_fund_other_dspl").val("");
        s.txtb_fund_other_dspl = "";
        $('#txtb_justification').val("");
        s.txtb_date_filed       = "";
        $('#txtb_date_filed').val();
        $('#ddl_subdepartment').val("").trigger('change');
        $('#ddl_division').val("").trigger('change');
        $('#ddl_section').val("").trigger('change');
        $('#ddl_fund_charges').val("").trigger('change');
        $('#ddl_from').val("").trigger('change');
        $('#ddl_name_dspl').val("").trigger('change');
        s.txtb_ot_date_from     = "";
        s.txtb_ot_date_to = "";

        s.chk_cto       = false;
        s.chk_dayoff    = true;
        s.chk_holiday   = true;
        s.chk_weekdays  = true;
        s.chk_weekend   = true;
        s.cover_checkbox_val_change(false, "weekdays");
        s.cover_checkbox_val_change(false, "weekend");
        s.cover_checkbox_val_change(false, "holiday");
        s.cover_checkbox_val_change(false, "dayoff");
        $('#lbl_cover_required').html("");
    }


    Array.prototype.select = function (code, prop)
    {
        return this.filter(function (d) {
            return d[prop] == code
        })[0] != null ? this.filter(function (d) {
            return d[prop] == code
        })[0]: "";
    }

    //Array.prototype.selectX = function (code, prop)
    //{
    //    return this.filter(function (d) {
    //        return d[prop] == code
    //    })[0] != null ? this.filter(function (d) {
    //        return d[prop] == code
    //    })[0] :[];
    //}

    Array.prototype.selectX = function (code, prop)
    {
        return this.filter(function (d, k)
        {
            return d[prop] === code
        }) != null ? this.filter(function (d, k) {
            return d[prop] === code
        }) : [];
    }

    function getValueFromHeader() {
        var headerData =
        {
            ot_ctrl_no              : $("#txtb_ot_request_nbr").val()
            , ot_month              : $("#ddl_month").val()
            , ot_year               : $("#ddl_year").val()
            , ot_request_date       : $("#txtb_date_filed").val()
            , ot_for_empl_id        : s.ot_for_empl_id //Kang GOV
            , department_code       : s.department_code
            , subdepartment_code    : $('#ddl_subdepartment').val()
            , division_code         : $('#ddl_division').val()
            , section_code          : $('#ddl_section').val()
            , fund_code             : $('#ddl_fund_charges').val()
            , ot_thru_empl_id       : s.ot_thru_empl_id //dapat kang maam PA
            , ot_from_empl_id       : $("#ddl_from").val()
            , ot_requestor_empl_id  : "" //Sa naka login
            , ot_subject            : $("#txtb_subject").val()
            , ot_justification      : $("#txtb_justification").val()
            , ot_coc_credit_flag    : ($('#chk_cto').prop("checked") == true ? 1 : 0)
            , approval_status       : ""
            , posting_status        : 0
            , approval_id           : ""
            , weekdays_flag         : ($('#chk_weekdays').prop("checked") == true ? 1 : 0)
            , weekdays_in           : $("#txtb_weekdays_ot_start").val().trim()
            , weekdays_in_ampm      : $('#ddl_weekdays_ot_start_time').val().trim()
            , weekdays_out          : $("#txtb_weekdays_ot_end").val().trim()
            , weekdays_out_ampm     : $('#ddl_weekdays_ot_end_time').val()
            , weekend_flag          : ($('#chk_weekend').prop("checked") == true ? 1 : 0)
            ,weekend_in             : $("#txtb_weekend_ot_start").val().trim()
            ,weekend_in_ampm        : $('#ddl_weekend_ot_start_time').val().trim()
            ,weekend_out            : $("#txtb_weekend_ot_end").val().trim().trim()
            , weekend_out_ampm      : $('#ddl_weekend_ot_end_time').val()
            , holiday_flag          : ($('#chk_holiday').prop("checked") == true ? 1 : 0)
            ,holiday_in             : $("#txtb_holiday_ot_start").val().trim()
            ,holiday_in_ampm        : $('#ddl_holiday_ot_start_time').val().trim()
            ,holiday_out            : $("#txtb_holiday_ot_end").val().trim()
            , holiday_out_ampm      : $('#ddl_holiday_ot_end_time').val().trim()
            , dayoff_ot_flag        : ($('#chk_dayoff').prop("checked") == true ? 1 : 0)
            ,dayoff_ot_in           : $("#txtb_dayoff_ot_start").val()
            ,dayoff_ot_in_ampm      : $('#ddl_dayoff_ot_start_time').val()
            ,dayoff_ot_out          : $("#txtb_dayoff_ot_end").val()
            ,dayoff_ot_out_ampm     : $('#ddl_dayoff_ot_end_time').val()
            ,oth_fund_descr         : $('#txtb_fund_other_dspl').val()
            ,created_by_user        :""
            ,created_dttm           :""
            ,updated_by_user        :""
            ,updated_dttm           :""
        }

        return headerData
    }

    function getValueFromEmployees()
    {
        var dataEmployee =
        {
             empl_id                : $("#ddl_name_dspl").val()
            , employee_name         : $("#ddl_name_dspl option:selected").html()
            , ot_ctrl_no            : $("#txtb_ot_nbr_dspl").val()
            , ot_requestor_empl_id  :s.ot_requestor_empl_id
            , position_title1       : $("#txtb_position_dspl").val()
            , rcrd_status           : "N"
        }
        return dataEmployee
    }

    function getValueFromDates() {
        var dataEmployee =
        {
            ot_ctrl_no          : $("#txtb_ot_request_nbr").val()
            , ot_date_from      : $("#txtb_ot_date_from").val()
            , ot_date_to        : $("#txtb_ot_date_to").val()
            , ot_start_time     : $("#txtb_ot_start").val()
            , ot_start_ampm     : $('#ddl_start_time option:selected').html()
            , ot_start_time_dspl: $("#txtb_ot_start").val() + " " + $('#ddl_start_time option:selected').html()
            , ot_end_time       : $("#txtb_ot_end").val()
            , ot_end_ampm       : $('#ddl_end_time option:selected').html()
            , ot_end_time_dspl  : $("#txtb_ot_end").val() + " " + $('#ddl_end_time option:selected').html()
            , rcrd_status       : "N"
            , ot_requestor_empl_id: s.ot_requestor_empl_id

        }
        return dataEmployee
    }

    //Added By: Jorge Rustom Villanueva 05/23/2020
    s.btn_click_dates = function (value)
    {
        tname               = "oTableDates";
        btn_grid_action     = value;
        var dates_row_info  = getValueFromDates();
        if (isdataValidatedDates())
        {
            var valid_date = true;

            if (s.datalistgridDates.length > 0)
            {
                var tempx = null;
                if (value == "A") {
                    tempx = s.datalistgridDates;
                }
                else
                {
                    tempx = s.datalistgridDates;
                    tempx = tempx.delete(index_update);
                }
                for (var x = 0; x < tempx.length; x++)
                {
                    if (
                            //The date inputed is in covered the existing dates in grid
                        (moment(dates_row_info.ot_date_from) <= moment(tempx[x].ot_date_from)
                            && moment(dates_row_info.ot_date_to) >= moment(tempx[x].ot_date_to)
                            )
                             ||
                            //The date inputed is in between the existing date in grid
                        (moment(dates_row_info.ot_date_from) >= moment(tempx[x].ot_date_from)
                            && moment(dates_row_info.ot_date_to) <= moment(tempx[x].ot_date_to)
                            )
                             ||
                            //The date Having overlap on Date From
                            (
                            moment(dates_row_info.ot_date_from) <= moment(tempx[x].ot_date_from)
                            && moment(dates_row_info.ot_date_to) <= moment(tempx[x].ot_date_to)
                            && moment(dates_row_info.ot_date_to) >= moment(tempx[x].ot_date_from)
                            )
                             ||
                          //The date Having overlap on Date to
                            (
                            moment(dates_row_info.ot_date_from) >= moment(tempx[x].ot_date_from)
                            && moment(dates_row_info.ot_date_to) >= moment(tempx[x].ot_date_to)
                            && moment(dates_row_info.ot_date_from) <= moment(tempx[x].ot_date_to)
                            )
                        )
                    {
                        valid_date = false;
                        break;
                    }
                }
            }
            if (valid_date) {

                if (value == 'A') //FOR ADD BUTTON
                {


                    s.datalistgridDates.push(dates_row_info)

                    s.oTableDates.fnClearTable();
                    s.oTableDates.fnAddData(s.datalistgridDates)

                    for (var x = 1; x <= $('#datalist_gridDates').DataTable().page.info().pages; x++) {
                        if (get_page(dates_row_info.travel_date, "datalist_gridDates") == false) {
                            s.oTableDates.fnPageChange(x);
                        }
                        else {
                            break;
                        }
                    }
                    swal("Successfully Added!", "New Record has been Successfully Added!", "success");
                    $("#txtb_ot_date_from").attr("disabled", false);
                }
                else if (value == 'U')
                {
                    s.datalistgridDates[index_update].ot_ctrl_no         = $("#txtb_ot_request_nbr").val();
                    s.datalistgridDates[index_update].ot_date_from       = $("#txtb_ot_date_from").val();
                    s.datalistgridDates[index_update].ot_date_to         = $("#txtb_ot_date_to").val();
                    s.datalistgridDates[index_update].ot_start_time      = $("#txtb_ot_start").val();
                    s.datalistgridDates[index_update].ot_start_ampm      = $('#ddl_start_time option:selected').html();
                    s.datalistgridDates[index_update].ot_start_time_dspl = $("#txtb_ot_start").val() + " " + $('#ddl_start_time option:selected').html();
                    s.datalistgridDates[index_update].ot_end_time        = $("#txtb_ot_end").val();
                    s.datalistgridDates[index_update].ot_end_ampm        = $('#ddl_end_time option:selected').html();
                    s.datalistgridDates[index_update].ot_end_time_dspl   = $("#txtb_ot_end").val() + " " + $('#ddl_end_time option:selected').html();


                    s.oTableDates.fnClearTable();
                    s.oTableDates.fnAddData(s.datalistgridDates)
                    for (var x = 1; x <= $('#datalist_gridDates').DataTable().page.info().pages; x++) {
                        if (get_page(s.datalistgridDates[index_update].ot_date_from, "datalist_gridDates") == false) {
                            s.oTableDates.fnPageChange(x);
                        }
                        else {
                            break;
                        }
                    }
                    s.isShowAddDates = true
                    s.isShowUpdateDates = false
                    $("#txtb_ot_date_from").attr("disabled", false);
                    swal("Successfully Updated!", "Current Record has been Successfully Updated!", "success");
                }
                clearentryDates()
            }
            else
            {
                swal("DATE CONFLICT!", "The date from and to should not overlap from the existing date in grid!", "error");
            }
        }
    }

    //Added By: Jorge Rustom Villanueva 05/23/2020
    s.btn_click_employee = function (value)
    {
        tname = "oTableEmployee"
        
        if (isdataValidatedEmployees())
        {
            if (value == 'A')
            {
                var employee_row_info = getValueFromEmployees();
                
                var row_to_check = [];
                row_to_check.push(employee_row_info);
                s.datalistgridEmployee.push(employee_row_info);
                h.post("../cSSOverTimeRequest/CheckIfExistEmployee",
                    {
                        par_employees   : row_to_check,
                        par_dates       : s.datalistgridDates,
                        par_action      : s.isAction,
                        par_ctrl_no     : $("#txtb_ot_request_nbr").val()
                    })
                    .then(function (d)
                    {
                        if (d.data.message == "success")
                        {
                            
                            if (d.data.exist == "Y")
                            {
                                ValidationResultColor("ddl_name_exists", true);
                                $("#lbl_ddl_name_dspl_req").text("Already have OT request for the date define in Date Covered.");
                                s.datalistgridEmployee = s.datalistgridEmployee.delete((s.datalistgridEmployee.length - 1));
                                s.oTableEmployee.fnClearTable();
                                if (s.datalistgridEmployee.length > 0)
                                {
                                    s.oTableEmployee.fnAddData(s.datalistgridEmployee)
                                }
                            }
                            else
                            {
                                s.oTableEmployee.fnClearTable();
                                s.oTableEmployee.fnAddData(s.datalistgridEmployee)
                                for (var x = 1; x <= $('#datalist_gridEmployee').DataTable().page.info().pages; x++) {
                                    if (get_page(employee_row_info.empl_id, "datalist_gridEmployee") == false) {
                                        s.oTableEmployee.fnPageChange(x);
                                    }
                                    else {
                                        break;
                                    }
                                }
                                clearentryEmployee()
                                swal("Successfully Added!", "New Record has been Successfully Added!", "success");
                            }
                        }
                        else
                        {
                           
                        }
                    });
              
               
               
            }
        }
    }


    //Added By Joseph
    s.btn_click_purpose = function (value)
    {
        tname = "oTablePurpose";
        $('#lbl_txtb_ot_purpose_req').html("");
        $('#txtb_ot_purpose').removeClass("required");
        //Get The current Action mode if it is (A)Add or (U)Update
        var action_mode = $('#btn_add_ot_purpose').attr("ngx-actionmode");
        if ($('#txtb_ot_purpose').val().trim() == "")
        {
            $('#lbl_txtb_ot_purpose_req').text("Required Field!");
            $('#txtb_ot_purpose').addClass("required");
        }
        else
        {
            
            if (action_mode == "A")
            {
                var seq_nbr = s.datalistgridPurpose.length == 0 ? 1 : (parseInt(s.datalistgridPurpose[s.datalistgridPurpose.length - 1].ot_purpose_seq) + 1);
                var data =
                {
                    ot_ctrl_no              : s.txtb_ot_request_nbr,
                    ot_purpose_seq          : seq_nbr,
                    ot_purpose_details      : $('#txtb_ot_purpose').val().trim(),
                    ot_requestor_empl_id    : s.ot_requestor_empl_id,
                    rcrd_status             : "N"
                }

                s.datalistgridPurpose.push(data)
                s.oTablePurpose.fnClearTable();
                s.oTablePurpose.fnAddData(s.datalistgridPurpose);
                swal("Successfully Added!", "New Record has been Successfully Added!", "success");
                $('#btn_add_ot_purpose').attr("ngx-actionmode", "A");
                $('#btn_add_ot_purpose').html('<i class="fa fa-plus-circle"> </i> Add');
                $('#txtb_ot_purpose').val("");
            }
            else if (action_mode == "U")
            {
                var row_id  = $('#btn_add_ot_purpose').attr("ngx-rowid");
                s.datalistgridPurpose[row_id].ot_purpose_details = $('#txtb_ot_purpose').val().trim();
                s.oTablePurpose.fnClearTable();
                s.oTablePurpose.fnAddData(s.datalistgridPurpose);

                swal("Successfully Updated!", "Existing record has been updated Successfully!", "success");
                $('#btn_add_ot_purpose').attr("ngx-actionmode", "A");
                $('#btn_add_ot_purpose').html('<i class="fa fa-plus-circle"> </i> Add');
                $('#txtb_ot_purpose').val("");
            }
            
        }
            
    }

    //************************************// 
    //*** Print Action Click              
    //**********************************// 
    s.btn_print_action = function (par_row_id)
    {
        var application_nbr = s.datalistgrid[par_row_id].ot_ctrl_no;
        var controller      = "Reports"
        var action          = "Index"
        var ReportName      = "CrystalReport"
        var SaveName        = "Crystal_Report"
        var ReportType      = "inline"
        var ReportPath      = ""
        var sp              = ""

        ReportPath = "~/Reports/cryOvertimeRequestReport/cryOvertimeRequestReport.rpt"
        sp = "sp_overtime_request_rep,par_ot_ctrl_no," + application_nbr

        h.post("../cSSOvertimeRequest/setPageHistory")
            .then(function (d) {
                if (d.data.message == "success")
                {
                    // location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                    //     + "&SaveName=" + SaveName
                    //     + "&ReportType=" + ReportType
                    //     + "&ReportPath=" + ReportPath
                    //     + "&Sp=" + sp

                    // *******************************************************
                    // *** VJA : 2021-07-14 - Validation and Loading hide ****
                    // *******************************************************
                    s.employee_name_print = "OVERTIME REQUEST";
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
                }
                else {
                    alert(d.data.message);
                }
            });
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
                    
                    var data =
                    {
                        ot_ctrl_no          : s.temp_ot_ctrl_no 
                        ,approval_id        : s.temp_approval_id
                        ,approval_status    : "C"
                        ,detail_remarks     : "User Recall Submission"
                    }
                    console.log(data);
                    h.post("../cSSOverTimeRequest/WithdrawSubmission", { data: data }).then(function (d) {
                        if (d.data.message == "success") {
                            $('#main_modal').modal("hide");
                            swal("Your application has been successfully recalled!", { icon: "success", });
                            s.getEmployeeInfoHeader();
                        }
                        else {
                            swal(d.data.message, { icon: "warning", });
                        }
                    });
                }
            });
    }

    s.isClickOth = function ()
    {
        if (s.isCheckedOth == "false") {
            s.isCheckedOth = "true"
            s.isShowOthFund = true
        }
        else
        {
            s.isCheckedOth = "false"
            s.isShowOthFund = false
            $("#txtb_fund_other_dspl").val("")
            s.txtb_fund_other_dspl = ""
        }
       
        //value = value.toString()
        //if (value == undefined || value == "undefined" || value == "") {
        //    value = "true"
        //}
        //else {
        //    alert(value)
        //}
      
    }
})

function RemovePMAMStart(object_target) {
    if (object_target.value.length > 6)
    {
        value = object_target.value.substring(0, object_target.value.length - 2);
    
        object_target.value = value
    }

}

function RemovePMAMEnd(object_target) {
    if (object_target.value.length > 6) {
        value = object_target.value.substring(0, object_target.value.length - 2);
        object_target.value = value
    }

}