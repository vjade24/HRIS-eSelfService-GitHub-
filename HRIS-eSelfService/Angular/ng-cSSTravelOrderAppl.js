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
//TEST

ng_selfService_App.controller("cSSTravelOrderAppl_Ctrl", function (commonScript,$scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    var cs = commonScript
    var arr_dates       = [];
    var userid          = "";
    s.log_in_as_AO      = "";
    s.rowLen            = "10";
    s.year              = [];
    s.available_leave   = 0;
    s.myCalendar        = null;
    s.show_in_add       = true
    s.isAction          = ""
    s.oTable            = null;
    s.oTableEmployee    = null;
    s.datalistgridEmployee = []
    s.oTableDates       = null;
    s.datalistgridDates = []
    s.isActionSubNew    = ""
    s.travel_order_requestor = ""
    s.par_month = ""
    s.par_year  = ""
    s.par_day   = ""
    index_update = ""
    header_status = ""
    btn_grid_action = ""
    s.ddl_address_to_list = []
    s.ddl_address_to_list1 = []
    s.ddl_address_to_list_raw = []
    s.travel_form_list = [
        { travel_form_code: '1', travel_form_descr: 'W/in the Province' },
        { travel_form_code: '2', travel_form_descr: 'Outside the Province (w/in Davao Region)' },
        { travel_form_code: '3', travel_form_descr: 'Outside Davao Region/Seminar'}
        
    ]

    s.isShowAddDates        = false
    s.isShowUpdateDates     = false
    s.isShowAddEmployee     = false
    s.isShowUpdateEmployee  = false
    s.isShowSubmit          = false


    s.isAbledPlacetoVisit   = false
    s.isAbledTravelForm     = false
    s.isAbledTravelType     = false
    s.isAbledSubject        = false
    s.isAbledDetails        = false
    s.isAbledJustification  = false
    s.isAbledEmplname       = false
    s.isAbledTraveldate     = false
    s.isAbledStarttime      = false
    s.isAbledStarttimeAMPM  = false
    s.isAbledEndtime        = false
    s.isAbledEndtimeAMPM    = false
    s.isAbledTravelDateFiled  = false
    var holiDate            = [];
    s.isDisablechk          = true
    isDeleteCalendarDate    = "1900-01-01"
    isDeleteActionMessage   = ""
    isCreatorGridAction     = true
    tname = ""
    s.show_cancel           = false;

    s.isShowCancelReason    = true;

    function init() {
        try

        {

            $('#div_to_date .input-group.date').datepicker({
                todayBtn: "linked",
                keyboardNavigation: false,
                forceParse: false,
                calendarWeeks: true,
                autoclose: true,
                format: "yyyy-mm-dd"
            });


            $("#loading_data").modal("show")
            var date = new Date();
            RetrieveYear();
            
            s.ddl_year = date.getFullYear().toString();

            $("#ddl_time_sched").select2().on('change', function (e) {
                s.SelectTimeSched();
            })
            


            $("#ddl_name_header").select2().on('change', function (e) {
                s.getEmployeeInfoHeader();
            })

            var today   = new Date();
            var dd      = String(today.getDate()).padStart(2, '0');
            var mm      = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy    = today.getFullYear();

            s.par_month = mm
            s.par_year  = yyyy.toString()
            s.par_day   = dd
            today = yyyy + '-' + mm + '-' + dd;
            //s.txtb_travel_date_filed_dspl = today
            
            $("#datalist_grid thead").remove();

            //$("#ddl_rec_appr_dspl").select2({
            //    allowClear: true
            //});

            //$("#ddl_first_appr_dspl").select2({
            //    allowClear: true
            //});

            //$("#ddl_final_appr_dspl").select2({
            //    allowClear: true
            //});

            //**********************************************
            // Initialize data during page loads
            //**********************************************
            h.post("../cSSTravelOrderAppl/InitializeData").then(function (d) {
                if (d.data.message == "success")
                {
                    s.txtb_travel_date_filed_dspl = d.data.current_date
                  
                    $("#ddl_name_dspl").select2().on('change', function (e) {
                        s.getEmployeeInfo()
                    })
                    
                    ////**********************************************
                    ////  Show/Hide ADD, EDIT, DELETE button 
                    ////**********************************************
                    s.allowAdd      = d.data.um.allow_add
                    s.allowDelete   = d.data.um.allow_delete
                    s.allowEdit     = d.data.um.allow_edit
                    s.allowView     = d.data.um.allow_view

                    if (s.allowAdd == "1")
                    {
                        s.ShowAdd = true
                    }
                    else
                    {
                        s.ShowAdd = false
                    }

                    if (s.allowDelete == "1")
                    {
                        s.ShowDelete = true
                    }
                    else
                    {
                        s.ShowDelete == false
                    }

                    if (s.allowEdit == "1")
                    {
                        s.ShowView = true
                    }
                    else
                    {
                        s.ShowView = false
                    }
                   
                    s.statusList                        = d.data.status;


                    s.travel_order_requestor            = d.data.empl_name
                    s.travel_order_requestor_empl_id    = d.data.empl_id
                    holiDate                            = d.data.holiDate;
                   
                   
                    s.txtb_travel_department_dspl       = d.data.department_list.department_name1
                    s.txtb_travel_department_dspl_hid   = d.data.dept_code
					
					if (d.data.dept_code == "21" || d.data.dept_code == "22"
                        || d.data.dept_code == "23"
                        || d.data.dept_code == "24"
                        || d.data.dept_code == "11"
                        || d.data.dept_code == "12"
                        || d.data.dept_code == "20"
                        || d.data.empl_id == "5960" //MA'AM ELONA AO
                        || d.data.empl_id == "0808" //ZAMORA, AERON ALEXANDER T.
                        || d.data.empl_id == "4265" //FRONTERAS, JASON A.
                        || d.data.empl_id == "6110" //AGMATA, JAYMARK L.
                        || d.data.empl_id == "8199" //GENES, KRISHA KAYE N.
                        // Added by: VJA
                        || d.data.empl_id == "0329" //ALONSABE
                        || d.data.empl_id == "5394" //BASCO
                        || d.data.empl_id == "5159" //ESTOQUE
                    )
                    {
                       s.travel_type_list = d.data.travel_type_list

                    }

                    else {
                         s.travel_type_list = [
                            { travel_type_code: '01', travel_type_descr: 'OB' },
                            { travel_type_code: '05', travel_type_descr: 'OBAM' },
                            { travel_type_code: '06', travel_type_descr: 'OBPM' },
                            { travel_type_code: '07', travel_type_descr: 'OB (Official Time Only)' }

                        ]
						
						
                    }
                   
                    //s.travel_type_list                  = d.data.travel_type_list
                    s.employees_list                    = d.data.empl_name_list
                    s.employees_list_header             = d.data.empl_name_list
                    
                    s.ddl_name_header = d.data.empl_id
					
                    initialize_calendar();
                    
                    if (d.data.sp_dtr_transmittal_addressto_list.length > 0)
                    {
                        s.ddl_address_to_list1 = d.data.sp_dtr_transmittal_addressto_list
                        if (d.data.dept_code == "18") {

                            var dta = d.data.sp_dtr_transmittal_addressto_list.filter(function (k,v) {
                                return k.empl_id == "2994" || k.empl_id == "7610"
                            })
                         
                            s.ddl_address_to_list = dta

                        }
                        else {
                            s.ddl_address_to_list = d.data.sp_dtr_transmittal_addressto_list
                        }
                       
                    }
                    else
                    {
                        s.ddl_address_to_list = []
                        s.ddl_address_to_list1 = []
                    }

                    if (d.data.sp_travelorder_hdr_tbl_list.length > 0)
                    {
						
						s.datalistgrid = d.data.sp_travelorder_hdr_tbl_list
							init_table_data(d.data.sp_travelorder_hdr_tbl_list);
							
							
							
							s.oTable.fnClearTable();
							s.oTable.fnAddData(d.data.sp_travelorder_hdr_tbl_list)
						 setTimeout(function () {
							 
							 if(d.data.sp_travelorder_hdr_tbl_calendar_list.length > 0){
								
								setTimeout(function () {
							 
										  $('#calendar').fullCalendar('removeEvents', function (e) {
									   return true;
										});
										arr_dates = d.data.sp_travelorder_hdr_tbl_calendar_list;
										calendar_data();
								}, 300);
							}
							
							else{
								
								arr_dates = [];
							}
							
						}, 300);
                        
                    }

                    else
                    {
						init_table_data([]);
                        s.oTable.fnClearTable();
						
                    }
                    init_table_data2([]);
					init_table_data3([]);
						
                    calendar_data();
                    //calendar_data_holiday();
                  

                    $("#loading_data").modal("hide")

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
    init()

    $.fn.modal.Constructor.prototype.enforceFocus = function () {

    }

    //************************************//
    // Select Year +-1
    //************************************// 
    function RetrieveYear() {
        try {
            var currentYear = new Date().getFullYear();

            var prev_year = currentYear - 1;
            for (var i = 1; i <= 3; i++) {
                s.year.push({ "year": prev_year })
                prev_year++;
            }
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

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

                                var temp                = ""
                                var travel_color        = ""
                                var isCreator           = true
                                var allow_delete_override = true

                                var edit_text = "Edit"
                                var isshowDropDownUser = ""

                               if (s.travel_order_requestor_empl_id != full['travel_requestor_empl_id'].toString()) {
                                   isCreator = false
                                   allow_delete_override = false
                                   allow_edit_override = false
                                   edit_text = "View"
                               
                               }
                                
                               

                                if (full["approval_status"].toString() == "1" || full["approval_status"].toString() == "2" || full["approval_status"].toString() == "3")
                                {
                                  
                                    travel_color = "reviewed-bg"
                                    allow_delete_override = false
                                    allow_edit_override = false
                                    edit_text = "View"
                                }
                                else if (full["approval_status"].toString() == "D" || full["approval_status"].toString() == "L")
                                {
                                  
                                    travel_color = "disapproved-bg"
                                    allow_delete_override = false
                                    allow_edit_override = false   
                                    edit_text = "View"
                                }
                                else if (full["approval_status"].toString() == "C")
                                {
                                     travel_color = "cancel-bg"
                                }
                                else if (full["approval_status"].toString() == "N")
                                {
                                    travel_color = "new-bg"
                                }
                                else if (full["approval_status"].toString() == "R")
                                {
                                    travel_color = "reviewed-bg"
                                    allow_delete_override   = false
                                    allow_edit_override     = false  
                                    edit_text               = "View"
                                }
                                else if (full["approval_status"].toString() == "S")
                                {
                                    travel_color = "submitted-bg"
                                    allow_delete_override   = false
                                    allow_edit_override     = false  
                                    edit_text               = "View"
                                }

                                else if (full["approval_status"].toString() == "F") {
                                    travel_color = "approved-bg"
                                    allow_delete_override = false
                                    allow_edit_override = false
                                    edit_text = "View"
                                }
                                

                                temp = "<div class='xx input-group m-b'  style='color:white;'>" +
                                    "<span data-toggle='dropdown' class='text-left btn-block dropdown-toggle'>" +
                                    "<div class='external-event navy-bg " + travel_color +"''><h4>" +
                                    full["travel_datefiled"].toString().toUpperCase() + " | <small style='width:70% !important;margin-top:10px;white-space:nowrap;overflow:hidden;text-overflow:\"...\";color:white !important;font-size:13px;'>" + full["travel_order_no"]
                                    + "</small><br/>"
                                    + full["travelorder_status_descr"] 
                                    + "<span class='pull-right' ng-show='"
                                    + full["travel_requestor_empl_id"] + "'>By: #" + full["travel_requestor_empl_id"].replace('U', '#')
                                    + "</div>" +
                                    "</span >" +
                                    " <ul class='dropdown-menu' style='color:black; display:" + isshowDropDownUser +";'>" +
                                    "<li><a ng-click='btn_edit_action(" + row["row"] + "," + isCreator + ")' ng-show='" + s.allowEdit + "'>" + edit_text +"</a></li>" +
                                    "<li><a ng-click='btn_del_row(" + row["row"] + "," +"0)' ng-show='" + allow_delete_override +"' >Delete</a></li>" +
                                    "<li><a ng-click='btn_print_row(" + row["row"] + "," + "0)' >Print</a></li>" +
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
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
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
                            "mRender": function (data, type, full, row)
                            {

                                var display_undo = "none"
                                var display_delete = "block"
                                var temp = "";
                                var isdisabled = false 

                                if (full['rcrd_status'] == "N" || full['rcrd_status'] == "C")
                                {
                                    isdisabled = false
                                }

                                else if (full['rcrd_status'] == "L")
                                {
                                    display_undo = "block"
                                    isdisabled   = true
                                }

                                else
                                {
                                    //if (full['rcrd_status'] == "F")
                                    //{
                                    //    isdisabled = false
                                    //}

                                    //else
                                    //{
                                    //    isdisabled = true
                                    //}
                                    isdisabled = true
                                }

                                if (isCreatorGridAction == false)
                                {
                                    isdisabled = true
                                    display_undo = "none"
                                }

                                if (display_undo == "block")
                                {
                                    display_delete = "none";
                                }

                                temp = '<center><div class="btn-group">' +
                                    //'<button style="display:' + display_undo + ';" type="button" ng-show="' + true + '" ng-disabled="' + false + '" class="btn btn-success btn-sm" ng-click="btn_undo_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Undo"><i class="fa fa-undo"></i></button>' +
                                    //'<button style="display:' + display_delete +'; type="button" ng-disabled="' + isdisabled + '" class="btn btn-danger btn-sm" ng-click="btn_del_row(' + row["row"] + ')" ng-show="' + s.allowDelete + '" " data-toggle="tooltip" data-placement="top" title="Remove"><i class="fa fa-times"></i></button>' +
                                    '<button type="button" ng-disabled="' + isdisabled + '" class="btn btn-danger btn-sm" ng-click="btn_del_row(' + row["row"] + ',' + '1)" ng-show="' + s.allowDelete + '" " data-toggle="tooltip" data-placement="top" title="Remove"><i class="fa fa-times"></i></button>' +
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
                                var isshowedit = false
                                var display_undo = "none"
                                var display_delete = "block"
                                if (full['rcrd_status'] == "N" || full['rcrd_status'] == "C")
                                {
                                    isdisabled = false
                                    isshowedit = true
                                }

                                else if (full['rcrd_status'] == "L")
                                {
                                    display_undo = "block"
                                    isdisabled   = true
                                }

                                else
                                {

                                    //if (full['rcrd_status'] == "F")
                                    //{
                                    //    isshowedit = false
                                    //    isdisabled = false
                                    //}

                                    //else
                                    //{
                                    //    isshowedit = false
                                    //    isdisabled = true
                                    //}
                                    isshowedit = false
                                    isdisabled = true
                                }


                                if (isCreatorGridAction == false)
                                {
                                    isdisabled = true
                                    isshowedit = false
                                    display_undo = "none"
                                }

                                if (display_undo == "block")
                                {
                                    display_delete = "none"
                                }

                                temp = '<center><div class="btn-group">' +
                            
                                    //'<button style="display:' + display_undo+';" type="button" ng-show="' + true + '" ng-disabled="' + false + '" class="btn btn-success btn-sm" ng-click="btn_undo_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Undo"><i class="fa fa-undo"></i></button>' +
                                    '<button type="button" ng-disabled="' + isdisabled + '" ng-show="' + isshowedit + '" class="btn btn-info btn-sm" ng-click="btn_edit_row_dates(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit"><i class="fa fa-edit"></i></button>' +
                                    '<button type="button" ng-disabled="' + isdisabled + '" ng-show="' + s.allowDelete + '" class="btn btn-danger btn-sm" ng-click="btn_del_row(' + row["row"] + ',' + '2)"data-toggle="tooltip" data-placement="top" title="Remove"><i class="fa fa-times"></i></button>' +
                                    //'<button style="display:' + display_delete +';" type="button" ng-disabled="' + isdisabled + '" ng-show="' + s.allowDelete + '" class="btn btn-danger btn-sm" ng-click="btn_del_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Remove"><i class="fa fa-times"></i></button>' +
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
            if (status == "F") {
                bg_color = '#1C84C6';
            }

            if (status == "1" || status == "2" || status == "3") {
                bg_color = '#00C5DA';
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

            for (var x = 0; x < arr_dates.length; x++)
            {
                var event                            = new Object();
                event.id                             = arr_dates[x].travel_order_no; // unique event id;
                event.title                          = arr_dates[x].travel_type_abbrv;
                event.start                          = arr_dates[x].travel_date;
                event.end                            = moment(arr_dates[x].travel_date_to).add(1, "days").format('YYYY-MM-DD');
                event.description                    = arr_dates[x].approval_status_descr;
                event.backgroundColor                = color_dates(arr_dates[x].approval_status);
                event.travel_requestor_empl_id       = arr_dates[x].travel_requestor_empl_id;
                event.borderColor = 'white';
                event.extendedProps                  = x;
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
        try {
            //var last_prop = arr_dates.length;
            //for (var x = 0; x < holiDate.length; x++) {
            //    var event = new Object();
            //    event.id = holiDate[x]; // unique event id;
            //    event.title = "";//holiDate[x].holiday_name;
            //    event.start = holiDate[x].holiday_date;
            //    event.description = holiDate[x].holiday_name;
            //    event.backgroundColor = color_dates("xx");
            //    event.className = 'holiday-bg';
            //    event.borderColor = 'transparent';
            //    event.extendedProps = 'holiday';
            //    $('#calendar').fullCalendar('renderEvent', event, true);
            //    last_prop++;
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
            var start_date = (y - 1) + '-01-01';
            var end_date = (y + 1) + '-12-31';

            $('#calendar').fullCalendar({
                customButtons: {
                    btn_add_btn: {
                        text: 'Add2',
                        click: function () {
                            s.btn_open_modal('C1');
                        }
                    },

                },
                header:
                {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'btn_add_btn'
                },
                selectable: true,
                editable: false,
                eventClick: function (calEvent, el, jsEvent, view) {

                    var row_id = 0
                    tname = "All"


                    var click_date  = new Date(calEvent.start.toString());
                    var dd          = String(click_date.getDate()).padStart(2, '0');
                    var mm          = String(click_date.getMonth() + 1).padStart(2, '0'); //January is 0!
                    var yyyy        = click_date.getFullYear();

                    
                    isDeleteCalendarDate = yyyy + "-" + mm + "-" + dd

                    for (var x = 0; x < s.datalistgrid.length; x++)
                    {

                        if (calEvent.id == s.datalistgrid[x].travel_order_no) {
                            row_id = x
                        }
                    }

                    var isCreator = true
					
					if(s.datalistgrid.length > 0){
						if (s.datalistgrid[row_id].travel_requestor_empl_id != s.travel_order_requestor_empl_id)
                    {
                        isCreator = false
                    }
                    

                    if (el.originalEvent.target.className == "fa fa-times text-right pull-right" && calEvent.extendedProps != "holiday")
                    {
                        isDeleteActionMessage = "Are you sure to remove this date of application?"
                        btn_del_row(row_id)
                    }

                    else if (calEvent.extendedProps == "holiday")
                    {

                    }

                    else
                    {
                        edit_action(row_id, isCreator)
                    }
						
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

                  

                    jQuery('.fc-today-button').addClass("xxbtn_today_text");
                    $('.fc-prev-button').click(function () {
                        $('.popover').popover('hide')
                        s.getEmployeeInfoHeader()
                    });

                    $('.fc-next-button').click(function () {
                        $('.popover').popover('hide')
                        s.getEmployeeInfoHeader()
                    });

                    $('.fc-today-button').click(function () {
                        $('.popover').popover('hide')
                    });

                },
                select: function (start, end, jsEvent, event) {
                    var e_date = new Date(moment(end).format('YYYY-MM-DD'));
                    var s_date = new Date(moment(start).format('YYYY-MM-DD'));
                    var date_diff = new Date(e_date - s_date);
                    s.tot_nbr_days = date_diff / 1000 / 60 / 60 / 24;
                    
                    s.start_date = moment(start).format('YYYY-MM-DD');
                    s.end_date   = moment(end).subtract(1, "days").format('YYYY-MM-DD');

                   
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
                            return '<div onClick="$(\'#add_travel_order\').click();"><h5 style="cursor:pointer;">Apply for Travel Order</h5></div>';
                        }

                    }).popover('show');
                    $(".fc-highlight").css("background", "red");
                },
                eventRender: function (event, element, view) {

                    if (event.extendedProps == "holiday")
                    {
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
                    else
                    {

                        if (event.description == "New" || event.description == "Cancel Pending")
                        {

                            var show_delete = "";

                            // If the creator is also the owner of the application
                            if (event.travel_requestor_empl_id == s.travel_order_requestor_empl_id)
                            {
                                show_delete = "block";
                            }
                            // If he is the creator but not the owner
                            else if (event.travel_requestor_empl_id == s.travel_order_requestor_empl_id)
                            {
                                show_delete = "block";
                            }
                            //If the current user owns the application but not the creator
                            else
                            {
                                show_delete = "none";
                            }
                            element.find('.fc-title').html('<div class="ibox-tools" style="text-align:center;"><span class="fc-title">' + event.title
                                + '</span><i class="fa fa-times text-right pull-right" style="display:' + show_delete + ';margin:0px !important;" data-toggle="tooltip" data-placement="top" title="Delete"></i>'
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

            $('#datepickerX').datepicker().on('changeDate', function (ev) {
                $('#calendar').fullCalendar('gotoDate', $('#txtb_year_selected').val() + '-01');

                var date_value = $('#txtb_year_selected').val().split("-")
                s.par_month = date_value[1]
                s.par_year  = date_value[0]

            });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    function getFormatDate(period_from, period_to)
    {
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

        else
        {
            period_descr = period_from
        }

        return period_descr
    }

    function add_dates()
    {
        //var s_date = new Date(s.start_date);
        //var s_dd = String(s_date.getDate()).padStart(2, '0');
        //var s_mm = String(s_date.getMonth() + 1).padStart(2, '0'); //January is 0!
        ////var s_yyyy = s_date.getFullYear();

        ////01 / 01 - 01 / 03 / 2020

        //var e_date = new Date(s.end_date);
        //var e_dd = String(e_date.getDate()).padStart(2, '0');
        //var e_mm = String(e_date.getMonth() + 1).padStart(2, '0'); //January is 0!
        //var e_yyyy = e_date.getFullYear();

        //var period_descr = s.start_date
        //if (s.start_date != s.end_date)
        //{
            
        //    period_descr = s_mm + '/' + s_dd + ' - ' + e_mm + '/' + e_dd + '/' + e_yyyy
        //}

        var travel_form_code = $("#ddl_travel_form").val()

        var period_descr = getFormatDate(s.start_date, s.end_date)
        
        var data =
        {
            travel_order_no         : s.txtb_travel_order_nbr_dspl,
            travel_date             : s.start_date,
            travel_date_to          : s.end_date,
            travel_date_descr       : period_descr,
            travel_starttime        : "08:00",
            travel_starttime_ampm   : "AM",
            travel_endtime          : "05:00",
            travel_endtime_ampm     : "PM",
            travel_starttime_display: "08:00 AM",
            travel_endtime_display  : "05:00 PM",
            rcrd_status: "N"
           
        }
        //s_date = moment(s_date).add(1, "days").format('YYYY-MM-DD')
        s.datalistgridDates.push(data)
        s.oTableDates.fnClearTable();
        s.oTableDates.fnAddData(s.datalistgridDates);
       

    }

     //************************************//
    //***       Open Status Modal        ****//
    //************************************//
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

    s.CloseModal = function ()
    {
        on_modal_value = false;
    }
    //************************************//
    //***       Open Add Modal        ****//
    //************************************//
    function open_modal() {
        try {

            on_modal_value = true;

            s.showRecall = false;
            btn = document.getElementById('add');
            btn.innerHTML = '<i class="fa fa-paper-plane-o"></i> Submit';
            s.resubmit = "FALSE"

            clearentry();
            clearentryDates();
            s.datalistgridEmployee = []
            s.datalistgridDates = []
            s.oTableDates.fnClearTable();
            s.oTableEmployee.fnClearTable();
            ToogleDisabledRemove()
            $('#main_modal').on('shown.bs.modal', function () {

                $('.nav-tabs a[href="#tab-1"]').tab('show');

            });

            tname = "oTableDates"

            s.isShowAddDates        = true
            s.isShowUpdateDates     = false
            s.isShowAddEmployee     = true
            s.isShowUpdateEmployee  = false
            s.resubmit = "FALSE"
            s.dis_delete2 = false;
            s.available_leave = 0;
            s.isAction  = "ADD"

            console.log(s.isShowAddEmployee)

            $('.popover').popover('hide');
            
            s.txtb_travel_requestor_dspl = s.travel_order_requestor
          

            $('#ddl_name_dspl').val(s.travel_order_requestor_empl_id).trigger('change');
            s.ddl_name_dspl = s.travel_order_requestor_empl_id

            $("#ddl_rec_appr_to_dspl").val("")

            s.ddl_rec_appr_to_dspl = ""
            
            if (s.txtb_travel_department_dspl_hid == "18")
            {
                $("#ddl_first_appr_dspl").val("7610")
                s.ddl_first_appr_dspl = "7610"
                $("#ddl_first_appr_dspl").trigger('change')
            }
            else if (s.txtb_travel_department_dspl_hid == "19") {
                $("#ddl_first_appr_dspl").val("")
                s.ddl_first_appr_dspl = ""
                $("#ddl_first_appr_dspl").trigger('change')
            }
            else
            {
                $("#ddl_first_appr_dspl").val("10063")
                s.ddl_first_appr_dspl = "10063"
                $("#ddl_first_appr_dspl").trigger('change')
            }
            
            // $("#ddl_final_appr_dspl").val("")

             $("#ddl_rec_appr_to_dspl").trigger('change')
            // $("#ddl_first_appr_dspl").trigger('change')
            // $("#ddl_final_appr_dspl").trigger('change')

           
            $('#main_modal').modal('show');  // #myModal (id of modal box)
            s.show_cancel = false;
            
            s.ModalTitle        = "Add New Record";
            s.dis_plan_date     = false;

            btn = document.getElementById('add');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Apply';

            


            setTimeout(function () {
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
    s.btn_open_modal = function (value) {
        try {
           
            s.temp_approval_status  = "N";
            
            s.isShowSubmit = true
            s.isAction = "ADD"
          
           
           
            
            h.post("../cSSTravelOrderAppl/GetTravelOrderNumberAction").then(function (d)
            {
                $("#txtb_travel_order_nbr_dspl").val(d.data.travel_order_number_display)
            })

            $("#txtb_travel_requestor_dspl").val(s.travel_order_requestor)

            $("#txtb_travel_date_filed_dspl").val(s.par_year + "-" + s.par_month + "-" + s.par_day).trigger('change')
            
            s.show_calendar_icon = true;

            

            open_modal();

            if (value == "C")
            {
                add_dates()
            }

            else {
                s.datalistgridDates = [];
                s.datalistgridEmployee = [];
                s.oTableDates.fnClearTable()
                s.oTableEmployee.fnClearTable()
            }
            

           
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    
    

    s.getEmployeeInfoHeader = function ()
    {
        
        var date    = new Date($('#calendar').fullCalendar('getDate'));
        yr          = date.getFullYear(),
        month       = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)
        
	
   
        h.post("../cSSTravelOrderAppl/GetEmployeeData",
            {
                par_empl_id_details: $("#ddl_name_header").val()
                ,par_month: month
                ,par_year: yr
                ,par_status: $("#ddl_status").val()
            }).then(function (d) {
                if (d.data.message == "success")
                {
                    if (d.data.sp_travelorder_hdr_tbl_list.length > 0)
                    {
                       
                       //HAYS
                        s.datalistgrid = []
                        s.datalistgrid = d.data.sp_travelorder_hdr_tbl_list
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid)

                        arr_dates = [];

                       if (d.data.sp_travelorder_hdr_tbl_calendar_list.length > 0)
                       {
						   
						    setTimeout(function () {
							 
							  $('#calendar').fullCalendar('removeEvents', function (e) {
                           return true;
							});
							arr_dates = d.data.sp_travelorder_hdr_tbl_calendar_list;
                       calendar_data();
					     calendar_data_holiday();
						}, 300);
                       
                      
                      
                            
                       }

                       else
                       {
						    setTimeout(function () {
							 
							//$('#calendar').fullCalendar('removeEvents', function (e) {
                            //   return true;
                            //});
						     calendar_data_holiday();
						}, 300);
                           
                       }
                        


                    }

                    else
                    {
                        //$('#calendar').fullCalendar('removeEvents', function (e) {
                        //    return true;
                        //});

                        s.datalistgrid = []
                        //s.datalistgrid = d.data.sp_travelorder_hdr_tbl_list
                        s.oTable.fnClearTable();
                        //s.oTable.fnAddData(s.datalistgrid)

                        arr_dates = [];
                        // Reinitialize Events
                        //$('#calendar').fullCalendar('removeEvents', function (e) {
                        //    return true;
                        //});

                        if (d.data.sp_travelorder_hdr_tbl_calendar_list.length > 0) {
                        
                            $('#calendar').fullCalendar('removeEvents', function (e) {
                                return true;
                            });
                            arr_dates = d.data.sp_travelorder_hdr_tbl_calendar_list;
                            //calendar_data();
                        }
                        
                        else {
                            $('#calendar').fullCalendar('removeEvents', function (e) {
                                return true;
                            });
                        }

                        calendar_data();
                        calendar_data_holiday();
                    }


                    





                }


            })

       
       
    }

    s.getEmployeeInfo = function ()
    {
        if ($("#ddl_name_dspl").val().trim() != "") {
            $("#txtb_position_dspl").val(s.employees_list.select($("#ddl_name_dspl").val(), "empl_id").position_title1)
            $("#ddl_name_dspl").removeClass("required");
            $("#lbl_ddl_name_req").text("");
            $('#myStyle').remove()
        }

        else
        {
            $("#txtb_position_dspl").val("")
            $("#ddl_name_dspl").removeClass("required");
            $("#lbl_ddl_name_req").text("");
            $('#myStyle').remove()
        }
       
        
    }

    s.btn_submit_click = function (action)
    {
        s.isActionSubNew = action
        var header_info = getValueFromHeader()
        var empl_name = []
        var travel_date = []
        var fsapprover = $("#ddl_first_appr_dspl").val()
        var fnapprover = $("#ddl_final_appr_dspl").val()

       

        try
        {
             
           
            if(fsapprover == "" || fsapprover == undefined)
            {
                
                 alert("Final Approver is required")
                 return
            }

            
            if (s.isActionSubNew == "S")
            {
                $("#i_submit").removeClass("fa fa-paper-plane-o");
                $("#i_submit").addClass("fa fa-spinner fa-spin");
            }

            else if (s.isActionSubNew == "N")
            {
                $("#i_save").removeClass("fa fa-save");
                $("#i_save").addClass("fa fa-spinner fa-spin");
            }
            
            
  
           
            if (isdataValidateHeader()) {

                swal({
                    title: "Please double check travel with claims/For Emergency Purposes/For LDNF!",
                    text: "Please check your travel order order application to avoid delays.",
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,

                })
                    .then(function (willDelete) {
                        if (willDelete) {
                            if (s.datalistgridEmployee.length > 0) {

                                if (s.datalistgridDates.length > 0) {

                                    for (var x = 0; x < s.datalistgridEmployee.length; x++)
                                        empl_name[x] = s.datalistgridEmployee[x].empl_id

                                    for (var x = 0; x < s.datalistgridDates.length; x++)
                                        travel_date[x] = s.datalistgridDates[x].travel_date

                                    h.post("../cSSTravelOrderAppl/CheckIfExists", {
                                        par_travel_type: header_info.travel_type_code
                                        , par_data_empl: empl_name
                                        , par_data_dates: travel_date
                                    }).then(function (d) {
                                        if (d.data.message == "success") {
                                            h.post("../cSSTravelOrderAppl/SaveDirectToDatabase", {
                                                par_status: s.isActionSubNew
                                                ,par_data_header: header_info
                                                ,par_data_empl: s.datalistgridEmployee
                                                ,par_data_dates: s.datalistgridDates
                                                ,par_action: s.isAction
                                                ,par_ldnf       : s.chk_with_ldnf
                                                ,par_emergency  : s.chk_with_emergency
                                                ,par_late_justi: $("#txtb_late_justi").val()
                                            }).then(function (d) {

                                                if (d.data.message == "success") {



                                                    if (s.isActionSubNew == "N") {
                                                        if (s.isAction == "ADD") {
                                                            swal("Successfully Added!", "New Record has been Successfully Added!", "success");
                                                        }

                                                        else {
                                                            swal("Successfully Updated!", "Current Record has been Successfully Updated!", "success");
                                                        }


                                                        $("#i_save").removeClass("fa fa-spinner fa-spin");
                                                        $("#i_save").addClass("fa fa-save");
                                                    }

                                                    else if (s.isActionSubNew == "S") {
                                                        swal("Successfully Submitted!", "New Record has been Successfully Submitted!", "success");

                                                        $("#i_submit").removeClass("fa fa-spinner fa-spin");
                                                        $("#i_submit").addClass("fa fa-paper-plane-o");
                                                    }

                                                    setTimeout(function () { s.getEmployeeInfoHeader() }, 300);


                                                    $('#main_modal').modal("hide");
                                                }


                                            })
                                        }

                                        else {
                                            //swal({ icon: "warning", title: "Employee/s application already exist!" });



                                            swal({
                                                title: "Employee/s application already exist!",
                                                text: "Would you like to continue with this application?",
                                                icon: "warning",
                                                buttons: true,
                                                dangerMode: true,

                                            })
                                                .then(function (willDelete) {
                                                    if (willDelete) {



                                                        h.post("../cSSTravelOrderAppl/SaveDirectToDatabase", {
                                                            par_status: s.isActionSubNew
                                                            , par_data_header: header_info
                                                            , par_data_empl: s.datalistgridEmployee
                                                            , par_data_dates: s.datalistgridDates
                                                            , par_action: s.isAction
                                                            , par_ldnf: s.chk_with_ldnf
                                                            , par_emergency: s.chk_with_emergency
                                                        }).then(function (d) {

                                                            if (d.data.message == "success") {



                                                                if (s.isActionSubNew == "N") {
                                                                    if (s.isAction == "ADD") {
                                                                        swal("Successfully Added!", "New Record has been Successfully Added!", "success");
                                                                    }

                                                                    else {
                                                                        swal("Successfully Updated!", "Current Record has been Successfully Updated!", "success");
                                                                    }


                                                                    $("#i_save").removeClass("fa fa-spinner fa-spin");
                                                                    $("#i_save").addClass("fa fa-save");
                                                                }

                                                                else if (s.isActionSubNew == "S") {
                                                                    swal("Successfully Submitted!", "New Record has been Successfully Submitted!", "success");

                                                                    $("#i_submit").removeClass("fa fa-spinner fa-spin");
                                                                    $("#i_submit").addClass("fa fa-paper-plane-o");
                                                                }

                                                                setTimeout(function () { s.getEmployeeInfoHeader() }, 300);


                                                                $('#main_modal').modal("hide");
                                                            }


                                                        })


                                                    }


                                                });



                                        }
                                    })
                                }

                                else {
                                    swal({ icon: "warning", title: "Please Add Travel Order Date/s!" });
                                    $("#i_submit").removeClass("fa fa-spinner fa-spin");
                                    $("#i_submit").addClass("fa fa-paper-plane-o");
                                    $("#i_save").removeClass("fa fa-spinner fa-spin");
                                    $("#i_save").addClass("fa fa-save");
                                    $('.nav-tabs a[href="#tab-3"]').tab('show');
                                }
                            }

                            else {
                                swal({ icon: "warning", title: "Please Add Employee Details!" });
                                $("#i_submit").removeClass("fa fa-spinner fa-spin");
                                $("#i_submit").addClass("fa fa-paper-plane-o");
                                $("#i_save").removeClass("fa fa-spinner fa-spin");
                                $("#i_save").addClass("fa fa-save");
                                $('.nav-tabs a[href="#tab-2"]').tab('show');
                            }


                        }

                        else
                        {
                            $("#i_submit").removeClass("fa fa-spinner fa-spin");
                            $("#i_submit").addClass("fa fa-paper-plane-o");
                            $("#i_save").removeClass("fa fa-spinner fa-spin");
                            $("#i_save").addClass("fa fa-save");
                        }
                    })

               

            }

            else
            {
                $("#i_submit").removeClass("fa fa-spinner fa-spin");
                $("#i_submit").addClass("fa fa-paper-plane-o");
                $("#i_save").removeClass("fa fa-spinner fa-spin");
                $("#i_save").addClass("fa fa-save");
            }
           
           
          
            
           
        }

        catch (err)
        {
           swal({ icon: "warning", title: err.message });
        }
    }

    function isdataValidateHeader()
    {
        var return_val = true;
        ValidationResultColorHeader("ALL", false);

        if ($("#txtb_travel_date_filed_dspl").val().trim() == "")
        {
            ValidationResultColorHeader("txtb_travel_date_filed", true);
            return_val = false;
        }

        else
        {
            if (validateDate($("#txtb_travel_date_filed_dspl").val()) == false) 
            {
                ValidationResultColorHeader("txtb_travel_date_filed-invalid", true);
                return_val = false;
            }
        }

        if ($("#txtb_travel_place_dspl").val().trim() == "")
        {
            ValidationResultColorHeader("txtb_travel_place", true);
            return_val = false;
        }

        if ($("#ddl_travel_form").val().trim() == "")
        {
            ValidationResultColorHeader("ddl_travel_form", true);
            return_val = false;
        }

        if ($("#ddl_travel_type").val().trim() == "")
        {
            ValidationResultColorHeader("ddl_travel_type", true);
            return_val = false;
        }

        if ($("#txtb_travel_purpose_dspl").val().trim() == "")
        {
            ValidationResultColorHeader("txtb_travel_purpose", true);
            return_val = false;
        }

        if (return_val == false)
        {
         $('.nav-tabs a[href="#tab-1"]').tab('show');
        }
        return return_val
    }

    function isdataValidatedEmployees()
    {
        var return_val      = true;
        s.already_exist     = false;



        
        ValidationResultColor("ALL", false);


        if (s.datalistgridEmployee.length > 0)
        {
            for (var x = 0; x < s.datalistgridEmployee.length; x++) {

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
            ValidationResultColor("ddl_name", true);
            return_val = false;
        }
        return return_val
    }

    function CheckDateExists(from,to,check)
    {
        var d_from  =  new Date(from)
        var d_to    = new Date(to)
        var d_c     = new Date(check)
        
        if ((d_c <= d_to && d_c >= d_from))
        {
            return true;
        }
        return false;
    }

    function CheckPeriodCovered(from, to)
    {
        var d_from = new Date(from)
        var d_to = new Date(to)
        if (d_from > d_to)
        {
            return true;
        }
        return false;
    }

 

    function isdataValidatedDates() {

        var return_val = true;
        s.already_exist = false;




        ValidationResultColorDates("ALL", false);

        if (s.datalistgridDates.length > 0)
        {
            for (var x = 0; x < s.datalistgridDates.length; x++) {

                if (CheckDateExists(s.datalistgridDates[x].travel_date, s.datalistgridDates[x].travel_date_to, $("#txtb_travel_date_dspl").val()) && btn_grid_action == 'A') {
                    s.already_exist = true
                   
                }

                if (CheckDateExists(s.datalistgridDates[x].travel_date, s.datalistgridDates[x].travel_date_to, $("#txtb_travel_date_to_dspl").val()) && btn_grid_action == 'A')
                {
                    s.already_exist = true
                }
            }

        }



        if (s.already_exist == true)
        {
            ValidationResultColorDates("txtb_travel_date_dspl_exists", true);
            return_val = false;
        }

        if (CheckPeriodCovered($("#txtb_travel_date_dspl").val().trim(), $("#txtb_travel_date_to_dspl").val().trim()))
        {
            ValidationResultColorDates("txtb_travel_date_dspl_covered", true);
            return_val = false;
        }

        if ($("#txtb_travel_date_dspl").val().trim() == "") {

            ValidationResultColorDates("txtb_travel_date", true);
            return_val = false;
        }
        

        else
        {
            if (validateDate($("#txtb_travel_date_dspl").val()) == false)
            {
                ValidationResultColorDates("txtb_travel_date-invalid", true);
                return_val = false;
            }
        }


        if ($("#txtb_travel_date_to_dspl").val().trim() == "") {

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

            if ((validatetime($("#txtb_travel_start_dspl").val().trim()) == false))
            {
                ValidationResultColorDates("txtb_travel_start-invalid", true);
                return_val = false;
            }


        }

        if ($("#txtb_travel_end_dspl").val().trim() == "") {

            ValidationResultColorDates("txtb_travel_end", true);
            return_val = false;
        }

        else 
        {

            if ((validatetime($("#txtb_travel_end_dspl").val().trim()) == false)) {
                ValidationResultColorDates("txtb_travel_end-invalid", true);
                return_val = false;
            } 
           

        }

        return return_val
    }
    
    //***********************************************************//
    //***Field validation for travel order before opening add modal
    //***********************************************************// 
    function ValidationResultColorHeader(par_object_id, par_v_result) {
        if (par_v_result) {

            //Add class to the obect that need to focus as a required..
            if (par_object_id == "ddl_travel_form")
            {
                $("#ddl_travel_form").addClass("required");
                $("#lbl_ddl_travel_form_req").text("Required Field!");
               
            }

            else if (par_object_id == "ddl_travel_type")
            {
                $("#ddl_travel_type").addClass("required");
                $("#lbl_ddl_travel_type_req").text("Required Field!");

            }

            else if (par_object_id == "txtb_travel_purpose")
            {

                $("#" + par_object_id +"_dspl").addClass("required");
                $("#lbl_" + par_object_id + "_req").text("Required Field!");
            }

            else if (par_object_id == "txtb_travel_place")
            {

                $("#" + par_object_id + "_dspl").addClass("required");
                $("#lbl_" + par_object_id + "_req").text("Required Field!");
            }

            else if (par_object_id == "txtb_travel_date_filed") {

                $("#" + par_object_id + "_dspl").addClass("required");
                $("#lbl_" + par_object_id + "_req").text("Required Field!");
            }

            else if (par_object_id == "txtb_travel_date_filed-invalid")
            {
                $("#txtb_travel_date_filed_dspl").addClass("required");
                $("#lbl_txtb_travel_date_filed_req").text("Invalid Date Format!");
            }

        }
        else {
           
            //remove of refresh the object form being required
            $("#txtb_travel_date_filed_dspl").removeClass("required");
            $("#lbl_txtb_travel_date_filed_req").text("");
            $("#ddl_travel_form").removeClass("required");
            $("#lbl_ddl_travel_form_req").text("");
            $("#ddl_travel_type").removeClass("required");
            $("#lbl_ddl_travel_type_req").text("");
            $("#txtb_travel_place_dspl").removeClass("required");
            $("#lbl_txtb_travel_place_req").text("");
            $("#txtb_travel_purpose_dspl").removeClass("required");
            $("#lbl_txtb_travel_purpose_req").text("");

        }
    }
    
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidationResultColor(par_object_id, par_v_result) {
        if (par_v_result)
        {
           
            //Add class to the obect that need to focus as a required..
            if (par_object_id == "ddl_name_exists")
            {
                $("#ddl_name_dspl").addClass("required");
                $("#lbl_ddl_name_req").text("Already Exist!");
                $("<style id='myStyle' type='text/css'> .select2-container{  border: 1px solid red !important} </style>").appendTo("head");
            }
               
            else if (par_object_id == "ddl_name")
            {
               
                $("<style id='myStyle' type='text/css'> .select2-container{  border: 1px solid red !important} </style>").appendTo("head");
                $("#lbl_" + par_object_id + "_req").text("Required Field!");
            }
           
        }
        else {
            //remove of refresh the object form being required

            $("#ddl_name_dspl").removeClass("required");
            $("#lbl_ddl_name_req").text("");
            $('#myStyle').remove()

        }
    }

    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidationResultColorDates(par_object_id, par_v_result) {
        if (par_v_result)
        {
            
            //Add class to the obect that need to focus as a required..
            if (par_object_id == "txtb_travel_date_dspl_exists")
            {
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

            else if (par_object_id == "txtb_travel_date")
            {
                $("#" + par_object_id + "_dspl").addClass("required");
                $("#lbl_" + par_object_id + "_req").text("Required Field!");
            }

            else if (par_object_id == "txtb_travel_date_to")
            {
                $("#" + par_object_id + "_dspl").addClass("required");
                $("#lbl_" + par_object_id + "_req").text("Required Field!");
            }

            else if (par_object_id == "txtb_travel_start")
            {
                $("#" + par_object_id + "_dspl").addClass("required");
                $("#lbl_" + par_object_id + "_req").text("Required Field!");
            }

            else if (par_object_id == "txtb_travel_end")
            {
                $("#" + par_object_id + "_dspl").addClass("required");
                $("#lbl_" + par_object_id + "_req").text("Required Field!");
            }

            else if (par_object_id == "txtb_travel_end-invalid")
            {
                $("#txtb_travel_end_dspl").addClass("required");
                $("#lbl_txtb_travel_end_req").text("Invalid Time Format!");
            }

            else if (par_object_id == "txtb_travel_start-invalid")
            {
                $("#txtb_travel_start_dspl").addClass("required");
                $("#lbl_txtb_travel_start_req").text("Invalid Time Format!");
            }

            else if (par_object_id == "txtb_travel_date-invalid")
            {
                $("#txtb_travel_date_dspl").addClass("required");
                $("#lbl_txtb_travel_date_req").text("Invalid Date Format!");
            }

            else if (par_object_id == "txtb_travel_date_to-invalid")
            {
                $("#txtb_travel_date_to_dspl").addClass("required");
                $("#lbl_txtb_travel_date_to_req").text("Invalid Date Format!");
            }

            
            
            

        }
        else
        {
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
    function get_page(code,table)
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
        var travel_form_code = ""

        $('#ddl_name_dspl').val(s.travel_order_requestor_empl_id).trigger('change');
        s.ddl_name_dspl = s.travel_order_requestor_empl_id

        index_update = row_id
        tname = "oTableDates"
        s.btn_add_dates = "Update"
        s.isShowAddDates    = false
        s.isShowUpdateDates = true
        $("#txtb_travel_date_dspl ").val(s.datalistgridDates[row_id].travel_date)
        $("#txtb_travel_start_dspl").val(s.datalistgridDates[row_id].travel_starttime)
        $("#ddl_start_time").val(s.datalistgridDates[row_id].travel_starttime_ampm)
        $("#txtb_travel_end_dspl").val(s.datalistgridDates[row_id].travel_endtime)
        $("#ddl_end_time").val(s.datalistgridDates[row_id].travel_endtime_ampm)
        $("#txtb_travel_date_to_dspl").val(s.datalistgridDates[row_id].travel_date_to)
        $("#ddl_rec_appr_dspl ").val(s.datalistgrid[s.temp_row_id].recappr_empl)


        if (s.datalistgrid[s.temp_row_id].firstappr_empl_id != undefined) {
            $("#ddl_first_appr_dspl ").val(s.datalistgrid[s.temp_row_id].firstappr_empl_id)
        }
       
        
        $("#ddl_final_appr_dspl ").val(s.datalistgrid[s.temp_row_id].firstappr_empl_id)

        //$("#ddl_rec_appr_dspl ").trigger('change')
        //$("#ddl_first_appr_dspl ").trigger('change')
        //$("#ddl_final_appr_dspl ").trigger('change')

      
       


        //s.txtb_travel_department_dspl_hid 

        console.log(s.datalistgrid[s.temp_row_id].travel_form_type)

        if (s.datalistgrid[s.temp_row_id].travel_form_type == undefined) {

            travel_form_code = $("#ddl_travel_form").val()
        }
        else {

            travel_form_code = s.datalistgrid[s.temp_row_id].travel_form_type
        }

      

        if (travel_form_code == "1") {

            if (s.txtb_travel_department_dspl_hid != "18") {

                

                //$("#rec_approver").removeClass("hidden")
                //$("#first_approver").addClass("hidden")
                //$("#final_approver").addClass("hidden")

                //$("#lbl_rec_appr").text("Final Approver")
                ////$("#lbl_first_appr").text("")
                //$("#lbl_final_appr").text("")

                //$("#ddl_first_appr_dspl").val("")
                //$("#ddl_final_appr_dspl").val("")

                //$("#ddl_first_appr_dspl ").trigger('change')
                //$("#ddl_final_appr_dspl ").trigger('change')
            }
           

        }

        else if (travel_form_code == "2") {
            if (s.txtb_travel_department_dspl_hid != "18") {
                $("#rec_approver").removeClass("hidden")
                $("#first_approver").removeClass("hidden")
                $("#final_approver").addClass("hidden")

                $("#ddl_final_appr_dspl").val("")

                $("#ddl_final_appr_dspl ").trigger('change')

                $("#lbl_rec_appr").text("Recommending Approver")
                $("#lbl_first_appr").text("Final Approver")
                $("#lbl_final_appr").text("")
            }
           
        }

        else if (travel_form_code == "3") {
            if (s.txtb_travel_department_dspl_hid != "18") {

                $("#rec_approver").removeClass("hidden")
                $("#first_approver").removeClass("hidden")
                $("#final_approver").removeClass("hidden")
                $("#lbl_rec_appr").text("Recommending Approver")
                $("#lbl_first_appr").text("First Approver")
                $("#lbl_final_appr").text("Final Approver")
            }
            
        }
        else {
            $("#rec_approver").addClass("hidden")
            $("#first_approver").addClass("hidden")
            $("#final_approver").addClass("hidden")

            $("#ddl_rec_appr_to_dspl").val("")
            $("#ddl_final_appr_dspl").val("")
            $("#ddl_final_appr_dspl").val("")

            $("#ddl_rec_appr_to_dspl").trigger('change')
            $("#ddl_first_appr_dspl").trigger('change')
            $("#ddl_final_appr_dspl").trigger('change')


            $("#lbl_rec_appr").text("")
            $("#lbl_first_appr").text("")
            $("#lbl_final_appr").text("")
        }
    }

    function ToogleDisabledRemove()
    {
        s.isAbledPlacetoVisit   = false
        s.isAbledTravelForm     = false
        s.isAbledTravelType     = false
        s.isAbledSubject        = false
        s.isAbledDetails        = false
        s.isAbledJustification  = false
        s.isAbledEmplname       = false
        s.isAbledTraveldate     = false
        s.isAbledStarttime      = false
        s.isAbledStarttimeAMPM  = false
        s.isAbledEndtime        = false
        s.isAbledEndtimeAMPM    = false
        s.isAbledTravelDateFiled = false
        s.isDisablechk          = false
        $("#startclockpickerspan").addClass("input-group-addon")
        $("#startclockpickerclock").addClass("fa fa-clock-o")
        $("#endclockpickerspan").addClass("input-group-addon")
        $("#endclockpickerclock").addClass("fa fa-clock-o")
        $("#div_travel_date_disable1").addClass("input-group-addon")
        $("#div_travel_date_disable2").addClass("fa fa-calendar")
        $("#div_date_filed_disable1").addClass("input-group-addon")
        $("#div_date_filed_disable2").addClass("fa fa-calendar")
        $("#div_travel_date_to_disable1").addClass("input-group-addon")
        $("#div_travel_date_to_disable2").addClass("fa fa-calendar")
    }

    function ToogleDisabledEdit()
    {
        s.isAbledPlacetoVisit   = true
        s.isAbledTravelForm     = true
        s.isAbledTravelType     = true
        s.isAbledSubject        = true
        s.isAbledDetails        = true
        s.isAbledJustification  = true
        s.isAbledEmplname       = true
        s.isAbledTraveldate     = true
        s.isAbledStarttime      = true
        s.isAbledStarttimeAMPM  = true
        s.isAbledEndtime        = true
        s.isAbledEndtimeAMPM    = true
        s.isAbledTravelDateFiled = true
        s.isDisablechk          = true
        $("#startclockpickerspan").removeClass("input-group-addon")
        $("#startclockpickerclock").removeClass("fa fa-clock-o")
        $("#endclockpickerspan").removeClass("input-group-addon")
        $("#endclockpickerclock").removeClass("fa fa-clock-o")
        $("#div_travel_date_disable1").removeClass("input-group-addon")
        $("#div_travel_date_disable2").removeClass("fa fa-calendar")
        $("#div_date_filed_disable1").removeClass("input-group-addon")
        $("#div_travel_date_disable1").hide()
        $("#div_date_filed_disable2").removeClass("fa fa-calendar")
        $("#div_travel_date_to_disable1").removeClass("input-group-addon")
        $("#div_travel_date_to_disable1").hide()
        $("#div_travel_date_to_disable2").removeClass("fa fa-calendar")
    }

    //************************************// 
    //*** Open Edit Modal         
    //**********************************// 
    function edit_action(row_id, isCreator)
    {

        try {
            s.temp_row_id = row_id;
            isCreatorGridAction = isCreator

            s.isAction = "EDIT"
            s.isShowAddEmployee      = true
            s.isShowUpdateEmployee   = false
            s.isShowAddDates         = true
            s.isShowUpdateDates      = false
            clearentry()

            clearentryDates();
            $('#main_modal').on('shown.bs.modal', function () {

                $('.nav-tabs a[href="#tab-1"]').tab('show');

            });

            tname = ""

            $('#ddl_name_dspl').val(s.travel_order_requestor_empl_id).trigger('change');
            s.ddl_name_dspl = s.travel_order_requestor_empl_id
            

            if (s.datalistgrid[row_id].approval_status == "C" || s.datalistgrid[row_id].approval_status == "N")
            {
                ToogleDisabledRemove()
                s.isShowSubmit          = true
                s.isShowAddEmployee     = true
                s.isShowAddDates        = true
                s.show_cancel = false;

                if (s.datalistgrid[row_id].approval_id != "")
                {
                    s.isShowCancelReason = false;
                }
                else
                {
                    s.isShowCancelReason = true;
                }
                
                s.ModalTitle = "Edit Existing Record";
                s.txtb_cancellation_dspl = s.datalistgrid[row_id].travel_details
                $("#txtb_cancellation_dspl").val(s.datalistgrid[row_id].travel_details)
            }

            else if (s.datalistgrid[row_id].approval_status == "F")
            {
                
                ToogleDisabledEdit()
                s.isShowSubmit = false
                s.isShowAddEmployee = false
                s.isShowAddDates = false
                s.show_cancel = true;
                s.isShowCancelReason = true;
                s.ModalTitle = "Edit Existing Record";
            }

            else if (s.datalistgrid[row_id].approval_status == "L")
            {
                ToogleDisabledEdit()
                s.isShowSubmit = false
                s.isShowAddEmployee = false
                s.isShowAddDates = false
                s.show_cancel = false;
                s.isShowCancelReason = true;
                s.ModalTitle = "View Existing Record";
            }

            else
            {
                ToogleDisabledEdit()
                s.isShowSubmit          = false
                s.isShowAddEmployee     = false
                s.isShowAddDates        = false
                s.show_cancel           = false;
                s.isShowCancelReason    = true;
                s.ModalTitle = "View Existing Record";
            }
            //DISABLED IF NOT CREATOR
            if (isCreator == false)
            {
                ToogleDisabledEdit()
                s.isShowSubmit = false
                s.isShowAddEmployee = false
                s.isShowAddDates = false
                s.ModalTitle = "View Existing Record";
            }

            if (s.datalistgrid[row_id].approval_status == "S") {
                s.showRecall = true;
            }
            else {
                s.showRecall = false;
            }
            

            btn = document.getElementById('submit');
           
            s.txtb_travel_order_nbr_dspl        = s.datalistgrid[row_id].travel_order_no
            s.txtb_travel_date_filed_dspl       = s.datalistgrid[row_id].travel_datefiled
            s.txtb_travel_requestor_dspl        = s.datalistgrid[row_id].employee_name
            s.txtb_travel_place_dspl            = s.datalistgrid[row_id].travel_place_visit
            s.ddl_travel_type                   = s.datalistgrid[row_id].travel_type_code
            s.ddl_travel_form                   = s.datalistgrid[row_id].travel_form_type
            s.txtb_travel_purpose_dspl          = s.datalistgrid[row_id].travel_purpose
            s.txtb_travel_details_dspl          = s.datalistgrid[row_id].travel_details
            s.txtb_travel_justification_dspl    = s.datalistgrid[row_id].travel_justification
            s.chk_with_claims                   = s.datalistgrid[row_id].travel_with_claims
            s.ddl_rec_appr_dspl                 = s.datalistgrid[row_id].recappr_empl
            s.ddl_first_appr_dspl               = s.datalistgrid[row_id].firstappr_empl_id
            s.ddl_final_appr_dspl               = s.datalistgrid[row_id].finalappro_empl_id
            s.chk_with_ldnf                     = s.datalistgrid[row_id].ldnf
            s.chk_with_emergency = s.datalistgrid[row_id].to_emergency

            s.txtb_late_justi = s.datalistgrid[row_id].late_justification
            $("#txtb_late_justi").val(s.datalistgrid[row_id].late_justification)

            $("#ddl_rec_appr_dspl ").val(s.datalistgrid[row_id].recappr_empl)
            $("#ddl_first_appr_dspl ").val(s.datalistgrid[row_id].firstappr_empl_id)
            $("#ddl_final_appr_dspl ").val(s.datalistgrid[row_id].finalappro_empl_id)

            $("#ddl_rec_appr_dspl ").trigger('change')
            $("#ddl_first_appr_dspl ").trigger('change')
            $("#ddl_final_appr_dspl ").trigger('change')


            $("#rec_approver").removeClass("hidden")
            $("#first_approver").removeClass("hidden")
            $("#final_approver").addClass("hidden")

            $("#ddl_final_appr_dspl").val("")

            $("#ddl_final_appr_dspl ").trigger('change')

            $("#lbl_rec_appr").text("Recommending Approver")
            $("#lbl_first_appr").text("Final Approver")


           

            if (s.datalistgrid[row_id].to_emergency == true)
            {
                $("#lbl_rec_appr").text("Final Approver:")
                $("#first_approver").addClass("hidden")
            }


            if ($("#txtb_travel_department_dspl_hid").val() == "18") { // IF VGO FINAL APPROVER SHOULD ALWAYS BE THE VICE-GOVERNOR

               // $("#ddl_first_appr_dspl").prop("disabled", true);
               // $("#ddl_final_appr_dspl").prop("disabled", true);
            }

            
            //if (s.datalistgrid[row_id].travel_form_type == "1") {

            //    $("#rec_approver").removeClass("hidden")
            //    $("#first_approver").addClass("hidden")
            //    $("#final_approver").addClass("hidden")

            //    $("#lbl_rec_appr").text("Final Approver")
            //    $("#lbl_first_appr").text("")
            //    $("#lbl_final_appr").text("")

            //    $("#ddl_first_appr_dspl").val("")
            //    $("#ddl_final_appr_dspl").val("")

            //    $("#ddl_first_appr_dspl ").trigger('change')
            //    $("#ddl_final_appr_dspl ").trigger('change')

            //}

            //else if (s.datalistgrid[row_id].travel_form_type == "2") {
            //    $("#rec_approver").removeClass("hidden")
            //    $("#first_approver").removeClass("hidden")
            //    $("#final_approver").addClass("hidden")

            //    $("#ddl_final_appr_dspl").val("")

            //    $("#ddl_final_appr_dspl ").trigger('change')

            //    $("#lbl_rec_appr").text("Recommending Approver")
            //    $("#lbl_first_appr").text("Final Approver")
            //    $("#lbl_final_appr").text("")
            //}

            //else if (s.datalistgrid[row_id].travel_form_type == "3") {
            //    $("#rec_approver").removeClass("hidden")
            //    $("#first_approver").removeClass("hidden")
            //    $("#final_approver").removeClass("hidden")


            //    $("#lbl_rec_appr").text("Recommending Approver")
            //    $("#lbl_first_appr").text("First Approver")
            //    $("#lbl_final_appr").text("Final Approver")
            //}
            //else {
            //    $("#rec_approver").addClass("hidden")
            //    $("#first_approver").addClass("hidden")
            //    $("#final_approver").addClass("hidden")

            //    $("#ddl_rec_appr_to_dspl").val("")
            //    $("#ddl_final_appr_dspl").val("")
            //    $("#ddl_final_appr_dspl").val("")

            //    $("#ddl_rec_appr_to_dspl").trigger('change')
            //    $("#ddl_first_appr_dspl").trigger('change')
            //    $("#ddl_final_appr_dspl").trigger('change')


            //    $("#lbl_rec_appr").text("")
            //    $("#lbl_first_appr").text("")
            //    $("#lbl_final_appr").text("")
            //}

            if (s.datalistgrid[row_id].approval_status == "C")
            {
                btn.innerHTML = '<i class="fa fa-paper-plane-o"></i> Re-Submit All';
                s.resubmit = "TRUE"
            }
            else
            {
                btn.innerHTML = '<i class="fa fa-paper-plane-o"></i> Submit';
                s.resubmit = "FALSE"
            }
            
            setTimeout(function ()
            {
                $('#main_modal').modal({ backdrop: 'static', keyboard: false });
            }, 300);

			
            h.post("../cSSTravelOrderAppl/GetEmployeesDetails", {
                par_travel_order_no: s.datalistgrid[row_id].travel_order_no
            }).then(function (d) {
                if (d.data.message == "success") {
					
				
				
                    s.datalistgridEmployee = []
                    if (d.data.sp_travelorder_empl_dtl_tbl_list.length > 0)
                    {
                        s.datalistgridEmployee = d.data.sp_travelorder_empl_dtl_tbl_list
                        s.oTableEmployee.fnClearTable();
                        s.oTableEmployee.fnAddData(s.datalistgridEmployee)
                    }
                    else
                    {
                        s.oTableEmployee.fnClearTable();
                    }

                    s.datalistgridDates = []
                    if (d.data.sp_travelorder_dates_dtl_tbl_list.length > 0)
                    {
                        s.datalistgridDates = d.data.sp_travelorder_dates_dtl_tbl_list
                        s.oTableDates.fnClearTable();
                        s.oTableDates.fnAddData(s.datalistgridDates)
                    }
                    else
                    {
                        s.oTableDates.fnClearTable();
                    }

                   

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
    s.btn_print_row = function (row_id, isCreator)
    {
        var controller      = "Reports";
        var action          = "Index";
        var ReportName      = "cryTravelOrder";
        var SaveName        = "Crystal_Report";
        var ReportType      = "inline";
        var ReportPath      = "~/Reports/cryTravelOrder/cryTravelOrder.rpt";
        var sp = "sp_travel_order_report"
        var parameters = ""

        if (s.txtb_travel_order_nbr_dspl == "" || s.txtb_travel_order_nbr_dspl == undefined)
        {
            parameters = "par_travel_order_no," + s.datalistgrid[row_id].travel_order_no
        
            
        }
        else
        {
            row_id = s.temp_row_id
            parameters = "par_travel_order_no," + $("#txtb_travel_order_nbr_dspl").val()
          
        }
       

        //var parameters = "par_travel_order_no," + s.datalistgrid[row_id].travel_order_no

        //if (to_application_print == "1") {

            if (s.datalistgrid[row_id].travel_datefiled <= '2022-06-27') {
                ReportPath = "~/Reports/cryTravelOrder/cryTravelOrder.rpt";
            }

            else {
                ReportPath = "~/Reports/cryTravelOrder/cryTravelOrder_new.rpt";

                console.log(s.datalistgrid[row_id].travel_datefiled)
                if (s.datalistgrid[row_id].travel_datefiled == '2022-06-30') {
                    console.log(s.datalistgrid[row_id].department_code)
                    if (s.datalistgrid[row_id].department_code != '01') {
                        ReportPath = "~/Reports/cryTravelOrder/cryTravelOrder.rpt";
                    }
                    if (s.datalistgrid[row_id].department_code != '02') {
                        ReportPath = "~/Reports/cryTravelOrder/cryTravelOrder.rpt";
                    }

                }

            }

            if (s.datalistgrid[row_id].department_code == '01' || s.datalistgrid[row_id].department_code == '02') {
                if (s.datalistgrid[row_id].travel_datefiled == '2022-06-30') {
                    ReportPath = "~/Reports/cryTravelOrder/cryTravelOrder_new.rpt";
                }

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

                h.post("../cSSTravelOrderAppl/setPageHistory").then(function (d) {

                    if (d.data.message == "success") {
                        //location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                        //    + "&SaveName=" + SaveName
                        //    + "&ReportType=" + ReportType
                        //    + "&ReportPath=" + ReportPath
                        //    + "&Sp=" + sp + "," + parameters

                        // *******************************************************
                        // *** VJA : 2021-07-14 - Validation and Loading hide ****
                        // *******************************************************
                        s.employee_name_print = "TRAVEL ORDER";

                        $("#loading_data").modal({ keyboard: false, backdrop: "static" })
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

                })
            }

            

        //}

        //else {
        //    alert("AWWW")
        //   alert(s.datalistgrid[s.temp_row_id].approval_status)
        //}

        
        

        
        
    }
    
    //************************************// 
    //*** Open Edit Modal         
    //**********************************// 
    s.btn_edit_action = function (row_id, isCreator) {
      
    edit_action(row_id, isCreator);
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

    //************************************// 
    //*** Delete Record              
    //**********************************// 
    function btn_del_row(row_index)
    {
        try {
            
            if (tname == "oTableEmployee") {
                var message     = ""
                var modal_close = false

                if (s.datalistgrid.length > 0)
                {
                   
                    header_status = s.datalistgrid.select(s.datalistgridEmployee[row_index].travel_order_no, "travel_order_no").approval_status
                }

                else
                {
                    header_status = ""

                }
                
                message = "Are you sure to delete this record?"

              
               
                if (s.datalistgridEmployee[row_index].rcrd_status == "N" || s.datalistgridEmployee[row_index].rcrd_status == "C" || s.datalistgridEmployee[row_index].rcrd_status == "F") {
                    swal({
                        title: message,
                        text: "Once deleted, you will not be able to recover this record!",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,

                    })
                        .then(function (willDelete) {
                            if (willDelete) {

                             
                                   
                                    s.datalistgridEmployee = s.datalistgridEmployee.delete(row_index);

                                    s.oTableEmployee.fnClearTable();

                                    if (s.datalistgridEmployee.length != 0)
                                    {
                                        s.oTableEmployee.fnAddData(s.datalistgridEmployee);
                                    }

                                    message = "deleted"
                                    swal("Your record has been " + message + "!", { icon: "success", });
                                   
                              
                            }
                        });
                }
            }

            else if (tname == "oTableDates")
            {

               
                var message = ""
                if (s.datalistgrid.length > 0)
                {
                    
                    header_status = s.datalistgrid.select(s.datalistgridDates[row_index].travel_order_no, "travel_order_no").approval_status
                }

                else
                {
                    header_status = ""

                }
                message = "Are you sure to delete this record?"

                
                if (s.datalistgridDates[row_index].rcrd_status == "N" || s.datalistgridDates[row_index].rcrd_status == "C" || s.datalistgridDates[row_index].rcrd_status == "F") {
                    swal({
                        title: message,
                        text: "Once deleted, you will not be able to recover this record!",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,

                    })
                        .then(function (willDelete) {
                            if (willDelete)
                            {
                                s.datalistgridDates = s.datalistgridDates.delete(row_index);

                                s.oTableDates.fnClearTable();

                                if (s.datalistgridDates.length != 0)
                                {
                                    s.oTableDates.fnAddData(s.datalistgridDates);
                                }

                                message = "deleted"
                                swal("Your record has been " + message + "!", { icon: "success", });
                                s.isShowUpdateDates = false
                                s.isShowAddDates = true
                                clearentryDates();
                            
                            }
                        });
                }

            }
                
            
            else {
                
                h.post("../cSSTravelOrderAppl/GetEmployeesDetails",
                {
                    par_travel_order_no: s.datalistgrid[row_index].travel_order_no
                }).then(function (d) {
                    if (d.data.message == "success")
                    {
                        var datalistgridDatesDelete    = []
                        datalistgridDatesDelete        = d.data.sp_travelorder_dates_dtl_tbl_list

                        var message = ""
                       

                        if (datalistgridDatesDelete.length == 1)
                        {
                            message = "Are you sure to delete this application and all of its components?"
                        }

                        else
                        {
                            if (isDeleteActionMessage == "")
                            {
                                message = "Are you sure to delete this application and all of its components?"
                            }
                            else
                            {
                                message = isDeleteActionMessage
                            }
                            
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
                                    isDeleteActionMessage = ""
                                    h.post("../cSSTravelOrderAppl/DeleteFromDatabase", {
                                        par_data: s.datalistgrid[row_index]
                                        , par_isDeleteCalendarDate: isDeleteCalendarDate
                                        , par_action: "C"
                                    }).then(function (d) {
                                        if (d.data.message == "success") {
                                            s.datalistgrid = s.datalistgrid.delete(row_index);
                                            s.oTable.fnClearTable();

                                            if (s.datalistgrid.length != 0) {
                                                s.oTable.fnAddData(s.datalistgrid);
                                            }
                                            s.getEmployeeInfoHeader()

                                            isDeleteCalendarDate = "1900-01-01"
                                            swal("Your record has been successfully deleted!", { icon: "success", });

                                        }
                                        else {
                                            swal({ title: d.data.message, icon: "warning", });
                                        }
                                    })

                                }

                                else
                                {
                                    isDeleteActionMessage = ""
                                }
                            });
                     }
                    else
                    {
                        swal(d.data.message, { icon: "warning", });
                    }
                });

                
                }
               
            
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }
    //************************************// 
    //*** Delete Record              
    //**********************************// 
    s.btn_del_row = function (row_index, value)
    {

        if (value == 0 || value == "0") {
            tname = "All";
        }

        else if (value == 1 || value == "1")
        {
            tname = "oTableEmployee";
        }

        else if (value == 2 || value == "2")
        {
            tname = "oTableDates";
        }
        
        
        btn_del_row(row_index)
    }
  

    Array.prototype.delete = function (code)
    {
        return this.filter(function (d, k) {
            return k != code
        })
    }

    function clearentryDates()
    {
        $("#txtb_position_dspl").val("")
        $("#txtb_travel_date_dspl").val("")
        s.txtb_travel_date_dspl = ""
        $("#txtb_travel_date_to_dspl").val("")
        s.txtb_travel_date_to_dspl = ""
        $("#txtb_travel_start_dspl").val("")
        $("#ddl_start_time").val("AM")
        $("#txtb_travel_end_dspl").val("")
        $("#ddl_end_time").val("PM")
    }

    function clearentryEmployee()
    {
        $("#ddl_name_dspl").val("").trigger('change')
        $("#txtb_position_dspl").val("")
    }


    function clearentry() {

        ValidationResultColor("ALL",false)
        ValidationResultColorDates("ALL", false)
        ValidationResultColorHeader("ALL", false)
        s.txtb_travel_order_nbr_dspl        = ""
        s.txtb_travel_requestor_dspl        = ""
        s.ddl_travel_form                   = ""
        s.ddl_travel_type                   = ""
        
        s.txtb_travel_place_dspl            = ""
        s.txtb_travel_purpose_dspl          = ""
        s.txtb_travel_details_dspl          = ""
        s.txtb_travel_justification_dspl    = ""
        s.chk_with_claims                   = false
        s.chk_with_ldnf                     = false
        s.chk_with_emergency                = false
        
        $('#ddl_name_dspl').val("").trigger('change');

        $("#ddl_start_time").val("AM")
        $("#ddl_end_time").val("PM")

        $("#rec_approver").addClass("hidden")
        $("#first_approver").addClass("hidden")
        $("#final_approver").addClass("hidden")

        //$("#ddl_rec_appr_to_dspl").val("")
        //$("#ddl_final_appr_dspl").val("")
        //$("#ddl_final_appr_dspl").val("")

        //$("#ddl_rec_appr_to_dspl").trigger('change')
        //$("#ddl_first_appr_dspl").trigger('change')
        //$("#ddl_final_appr_dspl").trigger('change')


        $("#lbl_rec_appr").text("")
        $("#lbl_first_appr").text("")
        $("#lbl_final_appr").text("")       
    
    }
    
   
    Array.prototype.select = function (code, prop)
    {
        var value = this.filter(function (d) {
            return d[prop] == code
        })[0]

        if (value == undefined || value == null || value == "")
            value = ""

        return value
    }

    function getValueFromHeader() {
        var dataEmployee =
        {

            travel_order_no             : $("#txtb_travel_order_nbr_dspl").val()
            ,travel_datefiled           : $("#txtb_travel_date_filed_dspl").val()
            ,travel_datefiled_original  : ""
            ,travel_form_type           : $("#ddl_travel_form").val()
            ,travel_place_visit         : $("#txtb_travel_place_dspl").val()
            ,travel_purpose             : $("#txtb_travel_purpose_dspl").val()
            ,travel_requestor_empl_id   : s.travel_order_requestor_empl_id
            ,travel_type_code           : $("#ddl_travel_type").val()
            ,travel_details             : $("#txtb_travel_details_dspl").val()
            ,travel_with_claims         : s.chk_with_claims
            ,justification              : $("#txtb_travel_justification_dspl").val()
            ,approval_status            : $("#txtb_travel_order_nbr_dspl").val()
            ,posting_status             : false
            ,approval_id                : ""
            ,department_code            : $("#txtb_travel_department_dspl_hid").val()
            ,travel_justification       : $("#txtb_travel_justification_dspl").val()
            ,recappr_empl               : $("#ddl_rec_appr_dspl").val()
            ,firstappr_empl_id          : $("#ddl_first_appr_dspl").val()
            ,finalappro_empl_id         : $("#ddl_final_appr_dspl").val()
        }
        return dataEmployee
    }

    function getValueFromEmployees()
    {
        var dataEmployee =
        {
             empl_id            : $("#ddl_name_dspl").val()
            ,employee_name      : $("#ddl_name_dspl option:selected").html()
            ,travel_order_nbr   : $("#txtb_travel_order_nbr_dspl").val()
            ,position_title1    : $("#txtb_position_dspl").val()
            ,rcrd_status        : "N"
        }
        return dataEmployee
    }

    function getValueFromDates() {
        var dataEmployee =
        {
             travel_order_no            : $("#txtb_travel_order_nbr_dspl").val()
            ,travel_date                : $("#txtb_travel_date_dspl").val()
            ,travel_date_to             : $("#txtb_travel_date_to_dspl").val()
            ,travel_date_descr          : getFormatDate($("#txtb_travel_date_dspl").val(), $("#txtb_travel_date_to_dspl").val())
            ,travel_starttime           : $("#txtb_travel_start_dspl").val()
            ,travel_starttime_ampm      : $("#ddl_start_time").val()
            ,travel_endtime             : $("#txtb_travel_end_dspl").val()
            ,travel_endtime_ampm        : $("#ddl_end_time").val()
            ,travel_starttime_display   : $("#txtb_travel_start_dspl").val() + " " + $("#ddl_start_time").val()
            ,travel_endtime_display     : $("#txtb_travel_end_dspl").val() + " " + $("#ddl_end_time").val()
            ,rcrd_status                : "N"

        }
        return dataEmployee
    }

    //Added By: Jorge Rustom Villanueva 05/23/2020
    s.btn_click_dates = function (value) {
        tname = "oTableDates"
        btn_grid_action = value
        cs.notrequired2("txtb_travel_date_dspl")
        cs.notrequired2("txtb_travel_date_to_dspl")
        if (isdataValidatedDates()) {

          
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
                var dates_row_info = getValueFromDates()
                s.datalistgridDates.push(dates_row_info)
                s.oTableDates.fnClearTable();
                s.oTableDates.fnAddData(s.datalistgridDates)

                for (var x = 1; x <= $('#datalist_gridDates').DataTable().page.info().pages; x++) {

                    if (get_page(dates_row_info.travel_date_descr, "datalist_gridDates") == false)
                    {
                        s.oTableDates.fnPageChange(x);
                    }
                    else
                    {
                        break;
                    }
                }

                

                swal("Successfully Added!", "New Record has been Successfully Added!", "success");

            }

            else if (value == 'U')
            {
                var datefrom = $("#txtb_travel_date_dspl").val()
                var dateto = $("#txtb_travel_date_to_dspl").val()
                console.log(datefrom)
                console.log(dateto)

                s.datalistgridDates[index_update].travel_date                   = $("#txtb_travel_date_dspl").val()
                s.datalistgridDates[index_update].travel_starttime              = $("#txtb_travel_start_dspl").val()
                s.datalistgridDates[index_update].travel_starttime_ampm         = $("#ddl_start_time").val()
                s.datalistgridDates[index_update].travel_endtime                = $("#txtb_travel_end_dspl").val()
                s.datalistgridDates[index_update].travel_endtime_ampm           = $("#ddl_end_time").val()
                s.datalistgridDates[index_update].travel_starttime_display      = $("#txtb_travel_start_dspl").val() + " " + $("#ddl_start_time").val()
                s.datalistgridDates[index_update].travel_endtime_display        = $("#txtb_travel_end_dspl").val() + " " + $("#ddl_end_time").val()
                s.datalistgridDates[index_update].travel_date_to                = $("#txtb_travel_date_to_dspl").val()
                s.datalistgridDates[index_update].travel_date_descr             = getFormatDate($("#txtb_travel_date_dspl").val(), $("#txtb_travel_date_to_dspl").val())
                s.oTableDates.fnClearTable();
                s.oTableDates.fnAddData(s.datalistgridDates)

                for (var x = 1; x <= $('#datalist_gridDates').DataTable().page.info().pages; x++)
                {
                    if (get_page(s.datalistgridDates[index_update].travel_date_descr, "datalist_gridDates") == false)
                    {
                        s.oTableDates.fnPageChange(x);
                    }
                    else
                    {
                        break;
                    }
                }

                s.isShowAddDates    = true
                s.isShowUpdateDates = false

               

                swal("Successfully Updated!", "Current Record has been Successfully Updated!", "success");
            }
            

            clearentryDates()
          

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
                var employee_row_info = getValueFromEmployees()

                s.datalistgridEmployee.push(employee_row_info)

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
    }

    //************************************// 
    //*** Cancel Record              
    //**********************************// 
    s.btn_undo_row = function (row_index) {
        try {

            swal({
                title: "Are you sure to update this record?",
                text: "Once updated, you will not be able to recover this record!",
                icon: "warning",
                buttons: true,
                dangerMode: true,

            }).then(function (willDelete) {
                if (willDelete)
                {
                    var temp_table = ""
                    var dataEmployee = []
                    var dataDates = []
                    if (tname == "oTableEmployee")
                    {
                        temp_table = "travelorder_empl_dtl_tbl"
                        dataEmployee =
                        {
                            travel_order_no : s.datalistgridEmployee[row_index].travel_order_no
                            ,empl_id        : s.datalistgridEmployee[row_index].empl_id

                        }
                    }

                    else if (tname == "oTableDates")
                    {
                        temp_table = "travelorder_dates_dtl_tbl"

                        dataDates =
                        {
                            travel_order_no : s.datalistgridDates[row_index].travel_order_no
                            ,travel_date    : s.datalistgridDates[row_index].travel_date
                        }
                    }

                    h.post("../cSSTravelOrderAppl/Undo",
                        {
                            par_data_empl: dataEmployee
                            , par_data_dates: dataDates
                            , par_table: temp_table
                        }).then(function (d) {
                            if (d.data.message == "success")
                            {
                                if (temp_table == "travelorder_dates_dtl_tbl")
                                {
                                    s.datalistgridDates[row_index].rcrd_status = "F"
                                    s.oTableDates.fnClearTable();
                                    s.oTableDates.fnAddData(s.datalistgridDates);
                                }

                                else if (temp_table == "travelorder_empl_dtl_tbl")
                                {
                                    s.datalistgridEmployee[row_index].rcrd_status = "F"
                                    s.oTableEmployee.fnClearTable();
                                    s.oTableEmployee.fnAddData(s.datalistgridEmployee);
                                }
                                s.getEmployeeInfoHeader()
                                swal("Successfully Updated!", "Current Record has been Successfully Updated!", "success");
                            }
                        });
                }
                })

            
            

           

        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    //************************************// 
    //*** Cance Final Approved            
    //**********************************// 
    //s.btn_del_row2 = function () {
    //    var row_index = s.temp_row_id;
    //    try {
    //        swal({
    //            title: "Are you sure to cancel this application and all of its components?",
    //            text: "Once cancelled, you will not be able to recover this record!",
    //            icon: "warning",
    //            buttons: true,
    //            dangerMode: true,

    //        })
    //            .then(function (willDelete) {
    //                if (willDelete) {


    //                    h.post("../cATSTOAppr/DeleteFromDatabase",
    //                        {
    //                            par_data: s.datalistgrid[row_index]
    //                            , par_isDeleteCalendarDate: new Date().toLocaleString()
    //                            , par_action: "C-ALL"
    //                        }).then(function (d) {
    //                            if (d.data.message == "success") {


    //                                s.datalistgrid[row_index].approval_status = "L";
    //                                s.oTable.fnClearTable();

    //                                if (s.datalistgrid.length != 0) {
    //                                    s.oTable.fnAddData(s.datalistgrid);
    //                                }
    //                                s.getEmployeeInfoHeader()

    //                                $('#main_modal').modal("hide");
    //                                swal("Your record has been cancelled!", { icon: "success", });

    //                            }
    //                            else {
    //                                swal({ title: d.data.message, icon: "warning", });
    //                            }
    //                        })
    //                }
    //            });
    //    }
    //    catch (err) {
    //        swal({ icon: "warning", title: err.message });
    //    }
    //}
   
    

    function validatetime(val)
    {
        var isValid = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(val);
        

        return isValid;
    }

    function validateDate(val)
    {
        var return_val = false


        var date_regex = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
        if (!(date_regex.test(val)))
        {
            return_val = false;
        }

        else
        {
            return_val = true;
        }
        return return_val
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
                        travel_order_no     : s.datalistgrid[s.temp_row_id].travel_order_no
                        ,approval_id        : s.datalistgrid[s.temp_row_id].approval_id
                        ,approval_status    : "C"
                        , travel_details    : "User Recall Submission"
                    }
                    
                    h.post("../cSSTravelOrderAppl/WithdrawSubmission", { data: data }).then(function (d) {
                        if (d.data.message == "success") {
                            $('#main_modal').modal("hide");
                            swal("Your schedule has been successfully recalled!", { icon: "success", });
                            s.getEmployeeInfoHeader();
                        }
                        else {
                            swal(d.data.message, { icon: "warning", });
                        }
                    });
                }
            });
    }


})

function RemovePMAMStart(val)
{
    if (val.length > 6)
    {
        value = val.substring(0, val.length - 2);
        $("#txtb_travel_start_dspl").val(value)
        $("#txtb_travel_start_dspl").removeClass("required");
        $("#lbl_txtb_travel_start_req").text("");
    }
    
    
}

function RemovePMAMEnd(val) {

    if (val.length > 6)
    {
        value = val.substring(0, val.length - 2);
        $("#txtb_travel_end_dspl").val(value)
        $("#txtb_travel_end_dspl").removeClass("required");
        $("#lbl_txtb_travel_end_req").text("");
    }
    
    
}
function RemoveClass(value, field) {

    if ($("#" + value) != "") {
        $("#" + value).removeClass("required");
        $("#lbl_" + field + "_req").text("");
    }

    $("#rec_approver").removeClass("hidden")
    $("#first_approver").removeClass("hidden")
    $("#final_approver").addClass("hidden")

    $("#ddl_final_appr_dspl").val("")
    $("#ddl_final_appr_dspl ").trigger('change')

    $("#lbl_rec_appr").text("Recommending Approver:")
    $("#lbl_first_appr").text("Final Approver:")
    $("#lbl_final_appr").text("")

    var chk_with_emergency = $('#chk_with_emergency').prop('checked') ? true : false;

    if (chk_with_emergency == true)
    {
        $("#lbl_rec_appr").text("Final Approver:")
        $("#first_approver").addClass("hidden")
    }
    
  
    if ($("#txtb_travel_department_dspl_hid").val() == "18") {
       
       // $("#ddl_first_appr_dspl").prop("disabled", true);
       // $("#ddl_final_appr_dspl").prop("disabled", true);
    }

    //if ($("#ddl_travel_form").val() == "1") {

    //    $("#rec_approver").removeClass("hidden")
    //    $("#first_approver").addClass("hidden")
    //    $("#final_approver").addClass("hidden")

    //    $("#lbl_rec_appr").text("Final Approver:")
    //    $("#lbl_first_appr").text("")
    //    $("#lbl_final_appr").text("")

    //    $("#ddl_first_appr_dspl").val("")
    //    $("#ddl_final_appr_dspl").val("")

    //    $("#ddl_first_appr_dspl ").trigger('change')
    //    $("#ddl_final_appr_dspl ").trigger('change')

    //}

    //else if ($("#ddl_travel_form").val() == "2") {
    //    $("#rec_approver").removeClass("hidden")
    //    $("#first_approver").removeClass("hidden")
    //    $("#final_approver").addClass("hidden")

    //    $("#ddl_final_appr_dspl").val("")

    //    $("#ddl_final_appr_dspl ").trigger('change')

    //    $("#lbl_rec_appr").text("Recommending Approver:")
    //    $("#lbl_first_appr").text("Final Approver:")
    //    $("#lbl_final_appr").text("")
    //}

    //else if ($("#ddl_travel_form").val() == "3") {
    //    $("#rec_approver").removeClass("hidden")
    //    $("#first_approver").removeClass("hidden")
    //    $("#final_approver").removeClass("hidden")


    //    $("#lbl_rec_appr").text("Recommending Approver:")
    //    $("#lbl_first_appr").text("First Approver:")
    //    $("#lbl_final_appr").text("Final Approver:")
    //}
    //else {
    //    $("#rec_approver").addClass("hidden")
    //    $("#first_approver").addClass("hidden")
    //    $("#final_approver").addClass("hidden")

    //    $("#ddl_rec_appr_to_dspl").val("")
    //    $("#ddl_final_appr_dspl").val("")
    //    $("#ddl_final_appr_dspl").val("")

    //    $("#ddl_rec_appr_to_dspl").trigger('change')
    //    $("#ddl_first_appr_dspl").trigger('change')
    //    $("#ddl_final_appr_dspl").trigger('change')


    //    $("#lbl_rec_appr").text("")
    //    $("#lbl_first_appr").text("")
    //    $("#lbl_final_appr").text("")
    //}

   
}