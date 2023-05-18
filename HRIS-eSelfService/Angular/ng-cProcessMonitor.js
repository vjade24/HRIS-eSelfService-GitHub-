//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Process Monitor
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JORGE RUSTOM VILLANUEVA       06/01/2020      Code Creation
//**********************************************************************************


ng_selfService_App.controller("cProcessMonitor_ctrl", function (commonScript,$scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    var cs = commonScript;
    var userid = "";
    s.year = [];
    s.prc_status= ""
    s.rowLen = "10";
    isCreatorGridAction = true
    s.oTableEmployee = null;
    s.datalistgridEmployee = []
    s.oTableDates = null;
    s.datalistgridDates = []
    s.datalistgrid = []
    s.currYear = ""
    s.month_re = ""
    s.ip_address_re = ""
    s.year_re = ""
    s.prc_number = "";
    s.empl_id = ""
    tname = ""
    s.temp_row_id = ""
    s.isShowCancelFinal = false;
    s.travel_form_list = [
        { travel_form_code: '1', travel_form_descr: 'W/in City/Municipality' },
        { travel_form_code: '2', travel_form_descr: 'W/in the Region' },
        { travel_form_code: '3', travel_form_descr: 'Outside the Region' }

    ]

   s.testdata = []

    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {
                data: s.datalistgrid,
                sDom: 'rt<"bottom"ip>',
                pageLength: 10,
                columns: [
                    {
                        "mData": "prc_nbr",
                        "mRender":
                            function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                    },
                    {
                        "mData": "prc_name",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },

                    {
                        "mData": "prc_dttm_begin",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data + "</span>"
                        }
                    },

                    {
                        "mData": "prc_dttm_end",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data + "</span>"
                        }
                    },

                    {
                        "mData": "prc_status_short_descr",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data + "</span>"
                        }
                    },

                    {
                        "mData": "null",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            temp = '<center><div class="btn-group">' +
                                '<button type="button" ng-show="' + true + '" class="btn btn-warning btn-sm" ng-click="btn_show_details(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Show Details"><i class="fa fa-plus"></i></button>' +

                                //'<button  type="button" class="btn btn-danger btn-sm" ng-click="btn_del_row(' + row["row"] + ')" ng-show="' + true + '" " data-toggle="tooltip" data-placement="top" title="Remove"><i class="fa fa-times"></i></button>' +

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


    var init_machineinfo_data = function (par_data) {
        s.machineinfo_grid = par_data;
        s.machineinfo_Table = $('#machineinfo_grid').dataTable(
            {
                data: s.machineinfo_grid,
                sDom: 'rt<"bottom"ip>',
                pageLength: 10,
                columns: [
                    {
                        "mData": "MachineNumber",
                        "mRender":
                            function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                    },
                    {
                        "mData": "IndRegID",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },

                    {
                        "mData": "DateTimeRecord",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + getOnlyDate(data) + "</span>"
                        }
                    },
                    {
                        "mData": "DateTimeRecord",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + getOnlyTime(data) + "</span>"
                        }
                    },
                    {
                        "mData": "InOutMode",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + inoutmode(data) + "</span>"
                        }
                    }
                    //,

                    //{
                    //    "mData": "null",
                    //    "bSortable": false,
                    //    "mRender": function (data, type, full, row) {
                    //        temp = '<center><div class="btn-group">' +
                    //            '<button type="button" ng-show="' + true + '" class="btn btn-warning btn-sm" ng-click="btn_show_details(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Show Details"><i class="fa fa-plus"></i></button>' +

                    //            '</div></center>';

                    //        return temp;
                    //    }
                    //}


                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            });
    }

    function getOnlyTime(data) {
        var current = new Date(data)
        return current.toLocaleTimeString();
    }
    function getOnlyDate(data) {
        var current = new Date(data)
        return current.toLocaleDateString();
    }

    function inoutmode(data) {
        if (data == 0) {
            return "Check-In"
        }
        else if (data == 1) {
            return "Check-Out"
        }
        else if (data == 2) {
            return "Break-Out"
        }
        else if (data == 3) {
            return "Break-In"
        }
        else {
            return ""
        }
    }

    function assignValue(id, value) {
        $("#" + id).val(value);
        s[id] = value
    }
    
    function init() {
       s.currYear =  RetrieveYear();
      
        s.ddl_year = moment((new Date())).format("YYYY");
        s.ddl_month = moment((new Date())).format("MM");
        s.ddl_year_generate = moment((new Date())).format("YYYY");
        s.ddl_month_generate = moment((new Date())).format("MM");
        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
        $("#ddl_sched").val("1")
        s.ddl_sched = "1"
        //$("#modal_generating_remittance").modal();
        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../cProcessMonitor/InitializeData").then(function (d) {
            if (d.data.message == "success") {
                

                $("#ddl_user_id").select2().on('change', function (e) {
                    s.FilterPageGrid();
                })

                $("#ddl_status").select2().on('change', function (e) {
                    s.FilterPageGrid();
                })

                $("#ddl_module").select2().on('change', function (e) {
                    s.FilterPageGrid();
                })
                
                s.status_list = d.data.sp_prcstatus_tbl_list;
                s.module_list = d.data.sp_modules_tbl_list;
                s.user_list   = d.data.sp_prcmonitor_users_list_SS;
                $("#txtb_user_id_dspl").val(d.data.user_id)
                s.txtb_user_id_dspl = d.data.user_id
                s.empl_type_list = d.data.employment_type;

                if (d.data.sp_prcmonitor_tbl_list_SS.length > 0) {
                    s.datalistgrid = d.data.sp_prcmonitor_tbl_list_SS
                    init_table_data(s.datalistgrid);
                }

                else {
                    init_table_data([]);
                    s.oTable.fnClearTable();
                }

                //s.empl_type_list = d.data.employment_type;
                //s.appr_status = d.data.status;
                //s.travel_type_list = d.data.travel_type_list

                //$("#ddl_empl_type").val("RE")
                //s.ddl_empl_type = "";
                //s.FilterPageGrid();
                //**********************************************
                //  Show/Hide ADD, EDIT, DELETE button 
                //**********************************************
                //d.data.um.allow_add == "1" ? s.ShowAdd = true : s.ShowAdd = false;
                //d.data.um.allow_delete == "1" ? s.ShowDelete = true : s.ShowDelete = false;
                //d.data.um.allow_edit == "1" ? s.ShowEdit = true : s.ShowEdit = false;
                //d.data.um.allow_view    == "1" ? s.ShowView     = true : s.ShowView     = false;
                //d.data.um.allow_print == "1" ? s.ShowAdd = true : s.ShowAdd = false;

                s.ddl_status = "";
                s.ddl_module = ""
                s.ddl_user_id = ""
                s.dept_list = d.data.dept_list;

                $("#modal_generating_remittance").modal("hide");
            }
            else {
                swal(d.data.message, { icon: "warning", });

                $("#modal_generating_remittance").modal("hide");
            }
        });
    }
    init_machineinfo_data([]);
    init()

   

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
        if (s.year.length > 0) {
            s.year_re = currentYear
        }
        return currentYear
    }
 
    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.FilterPageGrid = function ()
    {
        if ($('#ddl_year').val() == "" || $('#ddl_month').val() == ""
            || $('#ddl_user_id').val() == "" || $('#ddl_module').val() == "") {
            s.oTable.fnClearTable();
            s.datalistgrid = []
        }
     
        else {
            h.post("../cProcessMonitor/FilterPageGrid", {
                par_year: $('#ddl_year').val(),
                par_month: $('#ddl_month').val(),
                par_user_id: $('#ddl_user_id').val(),
                par_status: $('#ddl_status').val(),
                par_module: $('#ddl_module').val()
            }).then(function (d) {

                if (d.data.message == "success") {
                    s.oTable.fnClearTable();
                    s.datalistgrid = []
                    s.datalistgrid = d.data.sp_prcmonitor_tbl_list_SS;
                    console.log(d.data.sp_prcmonitor_tbl_list_SS)
                    if (d.data.sp_prcmonitor_tbl_list_SS.length > 0) {
                        s.oTable.fnAddData(d.data.sp_prcmonitor_tbl_list_SS);
                    }
                }
            })
        }
      
    }
    //************************************// 
    //*** Open Edit Modal         
    //**********************************// 
    s.btn_show_details = function (row_id) {
        s.temp_row_id = row_id;
        s.isEdit = true;
        s.prc_number = s.datalistgrid[row_id].prc_nbr;
        s.ModalTitle = "View Details";
        $('#main_modal').modal("show");
        s.prc_status = s.datalistgrid[row_id].prc_status
        s.txtb_process_nbr_dspl = s.datalistgrid[row_id].prc_nbr
        s.txtb_process_id_dspl  = s.datalistgrid[row_id].prc_id
        s.txtb_run_start_dspl   = s.datalistgrid[row_id].prc_dttm_begin
        s.txtb_run_end_dspl = s.datalistgrid[row_id].prc_dttm_end
        s.txtb_process_name_dspl = s.datalistgrid[row_id].prc_name
        s.txtb_parameter_dspl = s.datalistgrid[row_id].prc_parameters
        s.txtb_status_dspl = s.datalistgrid[row_id].prc_status_short_descr
        s.txtb_status_details_dspl = s.datalistgrid[row_id].prc_error_msg

        //console.log(s.datalistgrid[row_id])
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


                        h.post("../cProcessMonitor/DeleteFromDatabase",
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

    function getIP(str) {
        var spl = str.split(" ")
        var ip = ""
        for (var x = 0; x < spl.length; x++)
        {
            if (spl[x].includes("192.168.")) {
                ip = spl[x]
            }
        }
        return ip
    }
   

    s.btn_bio_extract_modal = function () {
        var ip = getIP(s.txtb_parameter_dspl.trim())
       
        var d = new Date()
        assignValue("ip_address_re", ip)
        assignValue("year_re", s.currYear)
        assignValue("month_re", (d.getMonth() + 1).toString())
       // $("#main_modal").modal("hide")

        $("#rerun_bio_modal").modal("show")


       

    }

    s.btn_bio_extract = function () {
       
        $("#modal_generating_remittance").modal("show")
        var ip = s.ip_address_re
        var extractfrom = $("#date_from").val()
        var extractto = $("#date_to").val()
        var prc_number = parseInt(s.prc_number)
        var empl_id = $("#empl_id").val()
        $("#icon_extract_icon").removeClass("fa fa-rocket")
        $("#icon_extract_icon").addClass("fa fa-spinner fa-spin")
        $('#btn_extract_icon').attr("disabled", true);
        h.post("../cProcessMonitor/RerunBioExtract",
              {
                    ip: ip
                  , date_from: extractfrom
                  , date_to: extractto
                  , prc_number: prc_number
                  , empl_id: empl_id
              }).then(function (d) {
                  swal(d.data.message,{ icon: d.data.icon });
                  
                  $("#main_modal").modal("hide")
                  $("#rerun_bio_modal").modal("hide")

                  if (d.data.machineinfo.length > 0) {
                      s.machineinfo_grid = d.data.machineinfo.refreshTable("machineinfo_grid", "")
                  }
                 
                  $("#rerun_bio_grid_modal").modal("show")
                  $("#icon_extract_icon").removeClass("fa fa-spinner fa-spin")
                  $("#icon_extract_icon").addClass("fa fa-rocket")
                  $("#modal_generating_remittance").modal("hide")
				  $('#btn_extract_icon').attr("disabled", false);
              });
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
                            h.post("../cProcessMonitor/ReviewApprovedAction",
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
            h.post("../cProcessMonitor/ReviewApprovedAction",
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
            h.post("../cProcessMonitor/ReviewApprovedAction",
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

    s.btn_approve_click = function () {
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


        h.post("../cProcessMonitor/ReviewApprovedAction",
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

                    //else if (data.approval_status == "F")
                    //{
                    //    s.datalistgrid[row_id].worklist_status = "Final Approved";
                    //    s.datalistgrid[row_id].worklist_action = "View Details";
                    //    s.datalistgrid[row_id].approval_status = "F";
                    //}

                    else if (data.approval_status == "F") {
                        s.datalistgrid[row_id].worklist_status = "Final Approved";
                        s.datalistgrid[row_id].worklist_action = "Cancel Application";
                        s.datalistgrid[row_id].approval_status = "F";
                    }

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
            });
    }

    s.btn_click_generate_dtr = function () {
        $('#generate_modal').modal({ backdrop: 'static', keyboard: false });
    }

    s.btn_bio_generate_click = function () {

        if (isGenerateValidate()) {

            $("#generate_icon").removeClass("fa fa-wrench");
            $("#generate_icon").addClass("fa fa-spinner fa-spin");
            $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
            h.post("../cProcessMonitor/GenerateDTREmployee", {
                par_year: $("#ddl_year_generate").val()
                , par_month: $("#ddl_month_generate").val()
                ,par_empl_id: ""
                ,par_view_type: "0"//$("#ddl_viewtype").val()
                ,par_department_code: $("#ddl_dept").val()
                ,par_employment_type: $("#ddl_empl_type").val()
                ,par_shift_flag: $("#ddl_sched").val()
            }).then(function (d) {

                if (d.data.message == "success") {
                    swal("Successfully Generated!", $("#ddl_dept option:selected").text(), "success");
                    $("#generate_icon").removeClass("fa fa-spinner fa-spin");
                    $("#generate_icon").addClass("fa fa-wrench");
                    $('#modal_generating_remittance').modal("hide");
                   
                }

                else {
                    swal("", { icon: "warning", title: d.data.message });
                    $("#generate_icon").removeClass("fa fa-spinner fa-spin");
                    $("#generate_icon").addClass("fa fa-wrench");
                    $('#modal_generating_remittance').modal("hide");
                }
            })
        }

    }

    function isGenerateValidate() {
        var validation = true

        if ($("#ddl_dept").val() == "") {
            validation = false
            notifyswal(1)
        }

        if ($("#ddl_year_generate").val() == "") {
            validation = false
            notifyswal(2)
        }

        if ($("#ddl_month_generate").val() == "") {
            validation = false
            notifyswal(3)
        }
        if ($("#ddl_empl_type").val() == "") {
            validation = false
            notifyswal(4)
        }

        if ($("#ddl_sched").val() == "") {
            validation = false
            notifyswal(5)
        }

        return validation
    }

    function notifyswal(value)
    {
        if (value == 1)
        {
            swal("", { icon: "warning", title: "Please Indicate Department Name." });
        }
        if (value == 2) {
            swal("", { icon: "warning", title:"Please Indicate DTR Year."});
        }
        if (value == 3) {
            swal("", { icon: "warning", title:"Please Indicate DTR Month."});
        }
        if (value == 4) {
            swal("", { icon: "warning", title: "Please Indicate Employment Type."});
        }
        if (value == 5) {
            swal("", { icon: "warning", title: "Please Indicate Shifting Schedule." });
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
})

