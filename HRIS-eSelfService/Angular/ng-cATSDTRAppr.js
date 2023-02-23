ng_selfService_App.controller("cATSDTRAppr_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http

    s.rowLen = "10";
    s.newRow = 0;
    var temp_tse_day = "";
    var add_mode = 1;
    var arr_datalist_grid2_data = new Array();
    var arr_datalist_grid2_data_save = new Array();
    var arr_datalist_grid2_data_del = new Array();

    s.pre_hrs_arr = new Array(31);
    s.post_hrs_arr = new Array(31);
    s.showRecall = false
    s.am_in_tt = "";
    s.am_out_tt = "";
    s.pre_time_in_hrs_tt = "AM";
    s.pm_in_tt = "";
    s.pm_out_tt = "";
    s.post_time_out_hrs_tt = "PM";
    s.label_success_submit = "submitted"
    s.approval_status = "New"
    s.edit_delete_row = null;
    index_update = ""
    s.isAction = ""

    s.isShowApproved = false

    function init() {
        
                                                            //Current Year for Reference as Year Parameter in all SP in Employee Time Schedule
       
        $("#modal_generating_remittance").modal({ backdrop: 'static', keyboard: false });


        $('#div_to_date .input-group.date').datepicker({
            todayBtn: "linked",
            keyboardNavigation: false,
            forceParse: false,
            calendarWeeks: true,
            autoclose: true,
            format: "yyyy-mm-dd",
            startDate: new Date()

          
        });
        //$('#div_to_date .input-group.date').datepicker("option", "minDate", "0");

        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../cATSDTRAppr/initializeData").then(function (d) {
            if (d.data.message == "success") {
                init_table_data2([]);

                $("#ddl_address_to").select2().on('change', function (e) {
                })
                $("#ddl_requested_by").select2().on('change', function (e) {
                })

                $("#txtb_sched_monsyr").on('change', function (e) {
                    s.FilterPageGrid();
                });

                $("#txtb_sched_monsyr").datepicker({
                    format: "MM - yyyy",
                    startView: "years",
                    minViewMode: "months",
                    autoclose: true,
                });

                var ddate = d.data.year + '-' + d.data.month + '-01'
              
                s.txtb_sched_monsyr = moment(ddate).format("MMMM - YYYY");                                                     //Current Year for Reference as Year Parameter in all SP in Employee Time Schedule
                
               
                //        //    s.dept_list = d.data.department_list;
                //        //    //s.employee_list = d.data.employee_list;
                        //    //**********************************************
                        //    //  Show/Hide ADD, EDIT, DELETE button 
                        //    //**********************************************
                //d.data.um.allow_add == "1" ? s.ShowAdd = true : s.ShowAdd = false;
                d.data.um.allow_delete == "1" ? s.allow_delete = true : s.allow_delete = false;
                d.data.um.allow_edit == "1" ? s.allow_edit = true : s.allow_edit = false;
                d.data.um.allow_view == "1" ? s.allow_view = true : s.allow_view = false;
                s.allow_view = true
                d.data.um.allow_print == "1" ? s.allow_print = true : s.allow_print = false;
                if (d.data.sp_dtr_transmittal_hdr_tbl_list.length > 0)
                {
                    s.datalistgrid2 = d.data.sp_dtr_transmittal_hdr_tbl_list

                    s.oTable2.fnClearTable();
                    s.oTable2.fnAddData(s.datalistgrid2)
                }
                if (d.data.sp_dtr_transmittal_addressto_list.length > 0)
                {
                    s.ddl_address_to_list = d.data.sp_dtr_transmittal_addressto_list
                }
                else
                {
                    s.ddl_address_to_list = []
                }

                if (d.data.sp_dtr_transmittal_requestedfrom_list.length > 0) {
                    s.ddl_requested_by_list = d.data.sp_dtr_transmittal_requestedfrom_list
                }
                else {
                    s.ddl_requested_by_list = []
                }

                $("#ddl_address_to").val("")
                s.ddl_address_to = ""

                $("#ddl_requested_by").val("")
                s.ddl_requested_by = ""

                if (d.data.view_type == "") {
                    $("#ddl_viewtype").val("0")
                    s.ddl_viewtype = "0"
                }
                else {
                    $("#ddl_viewtype").val(d.data.view_type)
                    s.ddl_viewtype = d.data.view_type
                }

               
                $("#modal_generating_remittance").modal("hide");

                }


            })

    }
    init()
    

    s.FilterPageGrid = function () {
        if ($("#ddl_viewtype").val() != "" &&
            $("#txtb_sched_monsyr").val() != ""
        ) {
            h.post("../cATSDTRAppr/FilterGrid", {
                par_month: month_name_to_int($('#txtb_sched_monsyr').val())
                ,par_year: str_to_year($('#txtb_sched_monsyr').val())
                ,par_view_type: $("#ddl_viewtype").val()
            }).then(function (d) {

                if (d.data.message == "success") {
                    s.oTable2.fnClearTable();
                    s.datalistgrid2 = []
                    s.datalistgrid2 = d.data.sp_dtr_transmittal_hdr_tbl_list

                    if (d.data.sp_dtr_transmittal_hdr_tbl_list.length > 0) {
                        s.oTable2.fnAddData(d.data.sp_dtr_transmittal_hdr_tbl_list);
                      
                    }
                    //console.log(d.data.sp_dtr_rep)
                }
            })
        }
        
    }

    var init_table_data2 = function (par_data) {
        s.datalistgrid2 = par_data;
        s.oTable2 = $('#datalist_grid2').dataTable(
            {
                data: s.datalistgrid2,
                bSort: false,
                bAutoWidth: true,
                sDom: 'rt<"bottom"p>',
                pageLength: 10,
                columns: [
                    { "width": "25%", "targets": 1, "mData": "transmittal_nbr", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "width": "30%", "targets": 2, "mData": "transmittal_date", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + moment(data).format("YYYY-MM-DD") + "</span>" } },
                    { "width": "15%", "targets": 3, "mData": "no_of_employees", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    {
                        "width": "15%", "targets": 4, "mData": "approval_status", "mRender": function (data, type, full, row)

                        {
                            var status_descr = ''
                            var status_class = ''
                            
                            if (data == "N")
                            {
                                status_descr = "New"
                                status_class = 'navy-light'
                            }

                            else if (data == "V") {
                                status_descr = "Received"
                                status_class = 'success'
                            }

                            else if (data == "D") {
                                status_descr = "Disapproved"
                                status_class = 'danger'
                            }

                            else if (data == "S") {
                                status_descr = "Submitted"
                                status_class = 'warning'
                            }

                            else if (data == "A") {
                                status_descr = "Approved"
                                status_class = 'success'
                            }

                           
                            return "<div class='progress no-margin' style='margin-bottom:0px !important;'><div class='progress progress-striped active'> <div style='width: 100%' aria-valuemax='100' aria-valuemin='0' aria-valuenow='100' role='progressbar' class='progress-bar progress-bar-" + status_class+"'> <span>" + status_descr +"</span> </div></div></div>"
                        }
                    },
                    {
                        "width": "15%",
                        "mData": "approval_status",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            var isDisabledDelete = false

                            if (data != "N") {
                                isDisabledDelete = true
                            }

                            return '<center><div class="btn-group tooltip-demo">'
                           
                            
                                + '<button type="button" class="btn btn-warning btn-sm action" data-toggle="tooltip" data-placement="left" title="Show Details" ng-show="' + s.allow_view + '" ng-click="btn_show_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-plus"></i>' + '</button>'
                                + '<button type="button" class="btn btn-info btn-sm action" data-toggle="tooltip" data-placement="left" title="Edit" ng-show="' + s.allow_edit + '" ng-click="btn_edit_action(' + row["row"] + ')" > '
                                + '<i id="edit_icon' + row["row"] + '" class="fa fa-edit"></i>' + '</button>' +

                                '<button type="button" class="btn btn-danger btn-sm action" data-toggle="tooltip" data-placement="left" title="Delete" ng-disabled="' + isDisabledDelete + '" ng-show="' + s.allow_delete + '" ng-click="btn_delete_action(' + row["row"] + ')" > '
                                + '<i id="delete_icon' + row["row"] + '" class="fa fa-trash"></i>'
                                +
                                '<button type="button" class="btn btn-primary btn-sm action" data-toggle="tooltip" data-placement="left" title="Print" ng-show="' + s.allow_print + '" ng-click="btn_print_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-print"></i>' + '</button>' +
                                '</button></div ></center >'

                        }
                    },
                    
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });
        s.oTable2.fnSort([[0, 'asc']]);

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }
    

    function getValueFromHeader(value) {

        if ($("#ddl_address_to").val().length > 8)
        {
            $("#ddl_address_to").val("")
        }

        if ($("#ddl_requested_by").val().length > 8) {
            $("#ddl_requested_by").val("")
        }
        

        var dt =
        {
            transmittal_nbr     : $("#txtb_transmittal_nbr").val()
            ,transmittal_date   : $("#txtb_transmittal_date").val()
            ,dtr_year           : str_to_year($("#txtb_sched_monsyr").val())
            ,dtr_month          : month_name_to_int($("#txtb_sched_monsyr").val())
            ,view_type          : $("#ddl_viewtype").val()
            ,transmittal_descr  : $("#txtb_transmittal_descr").val()
            ,department_code    : ""
            ,approval_status    : value
            ,approved_date      : ""
            ,approved_by        : ""
            ,created_dttm       : ""
            ,created_by         : ""
            ,updated_dttm       : ""
            ,updated_by         : ""
            ,remarks            : ""
            ,transmittal_type   : s.ddl_transmittal_type
            , no_of_employees   : $("#txtb_employee_nbr").val()
            , addressto_id      : $("#ddl_address_to").val()
            , requestor_id      : $("#ddl_requested_by").val()
        }

        return dt
    }

    s.btn_save_click = function (value)
    {
        if (value == 'N') {
            $("#btn_save_icn").removeClass("fa fa-save");
            $("#btn_save_icn").addClass("fa fa-spinner fa-spin");
        }

        else if (value == 'S') {
            $("#btn_submit_icn").removeClass("fa fa-paper-plane");
            $("#btn_submit_icn").addClass("fa fa-spinner fa-spin");
        }
        

        if (isDataValidate(value)) {
            var dt = getValueFromHeader(value)
            h.post("../cATSDTRAppr/SaveEditDatabase", { data1: dt, par_action: s.isAction }).then(function (d) {

                if (d.data.message == "success") {

                    dt.transmittal_nbr = d.data.sp_get_next_transmittal_no

                    if (s.isAction == "ADD") {

                        dt.transmittal_date = Date.now()
                        s.datalistgrid2.push(dt)

                        s.oTable2.fnClearTable();
                        s.oTable2.fnAddData(s.datalistgrid2)

                        var table = $('#datalist_grid2').DataTable();
                        var info = table.page.info();
                        page_value = info.page

                        for (var x = 1; x <= $('#datalist_grid2').DataTable().page.info().pages; x++) {
                            if (get_page(d.data.sp_get_next_transmittal_no) == false) {
                                s.oTable2.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }
                        $('#inner_modal').modal('hide');
                        swal("Successfully Added!", "New Record has been Successfully Added!", "success");

                    }

                    else if (s.isAction == "EDIT") {
                        updatelistgrid(value)
                        $('#inner_modal').modal('hide');
                        swal("Successfully Updated!", "Current Record has been Successfully Updated!", "success");
                    }


                    $("#btn_save_icn").removeClass("fa fa-spinner fa-spin");
                    $("#btn_save_icn").addClass("fa fa-save");
                    $("#btn_submit_icn").removeClass("fa fa-spinner fa-spin");
                    $("#btn_submit_icn").addClass("fa fa-paper-plane");
                }

            })
        } 
    }

    function updatelistgrid(value)
    {
        var table = $('#datalist_grid2').DataTable();
        var info = table.page.info();

        s.datalistgrid2[index_update].view_type         = $("#ddl_viewtype").val()
        s.datalistgrid2[index_update].transmittal_descr = $("#txtb_transmittal_descr").val()
        s.datalistgrid2[index_update].approval_status   = value
        s.datalistgrid2[index_update].addressto_id      = $("#ddl_address_to").val()
        s.datalistgrid2[index_update].requestor_id      = $("#ddl_requested_by").val()
        s.datalistgrid2[index_update].transmittal_date = $("#txtb_transmittal_date").val()
        s.datalistgrid2[index_update].transmittal_type = $("#ddl_transmittal_type").val()
        s.oTable2.fnClearTable();
        s.oTable2.fnAddData(s.datalistgrid2);
        page_value = info.page

        s.oTable2.fnSort([[0, 'asc']]);

        for (var x = 1; x <= $('#datalist_grid2').DataTable().page.info().pages; x++) {
            if (get_page(s.datalistgrid2[index_update].transmittal_nbr) == false) {
                s.oTable2.fnPageChange(x);
            }
            else {
                break;
            }
        }

    }


    //**************************************//
    //***Get Page Number****//
    //**************************************//
    function get_page(id) {
        var nakit_an = false;
        var rowx = 0;
        $('#datalist_grid2 tr').each(function () {
            $.each(this.cells, function (cells) {
                if (cells == 0) {
                    if ($(this).text() == id) {
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
    

    //************************************// 
    //*** Delete Record All         
    //**********************************// 
    s.btn_delete_action = function (row_index) {
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
                        h.post("../cATSDTRAppr/Delete", {
                            par_transmittal_nbr: s.datalistgrid2[row_index].transmittal_nbr
                        }).then(function (d) {
                            if (d.data.message == "success") {

                                s.datalistgrid2 = s.datalistgrid2.delete(row_index);
                                s.oTable2.fnClearTable();

                                if (s.datalistgrid2.length > 0) {
                                    s.oTable2.fnAddData(s.datalistgrid2);
                                }

                                swal("Your record has been deleted!", { icon: "success", });
                               // s[tname].fnDeleteRow(id_ss, null, true);
                                
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

    Array.prototype.delete = function (code) {
        return this.filter(function (d, k) {
            return k != code
        })
    }
    
    
    

    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function isDataValidate(value) {
        var return_val = true;

        if ($('#ddl_requested_by').val() == "") {
            ValidationResultColor("ddl_requested_by", true);
            return_val = false;

            $("#btn_save_icn").removeClass("fa fa-spinner fa-spin");
            $("#btn_save_icn").addClass("fa fa-save");
        }

        if ($('#ddl_address_to').val() == "") {
            ValidationResultColor("ddl_address_to", true);
            return_val = false;

            $("#btn_save_icn").removeClass("fa fa-spinner fa-spin");
            $("#btn_save_icn").addClass("fa fa-save");
        }

        if ($('#ddl_transmittal_type').val() == "")
        {
            ValidationResultColor("ddl_transmittal_type", true);
            return_val = false;

            $("#btn_save_icn").removeClass("fa fa-spinner fa-spin");
            $("#btn_save_icn").addClass("fa fa-save");
        }

        if (parseInt($("#txtb_employee_nbr").val()) <= 0 && value != 'N')
        {
            $("#btn_submit_icn").removeClass("fa fa-spinner fa-spin");
            $("#btn_submit_icn").addClass("fa fa-save");
            swal("Please include at least one employee!", { icon: "warning", });
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
            if (par_object_id == "ddl_transmittal_type")
            {
                $("#ddl_transmittal_type").addClass("required");
            }
            else
            {
                $("#select2-" + par_object_id + "-container").parent().addClass("required");
            }
                $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else {
            //remove of refresh the object form being required

            $("#select2-ddl_requested_by-container").parent().removeClass("required");
            $("#lbl_ddl_requested_by_req").text("");

            $("#ddl_transmittal_type").removeClass("required");
            $("#lbl_ddl_transmittal_type_req").text("");

            $("#select2-ddl_address_to-container").parent().removeClass("required");
            $("#lbl_ddl_address_to_req").text("");
            

        }
    }

    //**********************************************
    //  Add leading Zero to Months
    //**********************************************
    function str_pad(n) {
        return String("00" + n).slice(-2);
    }

    function month_name_to_int(month_name) {
        var int_mons = "01";

        if (month_name.includes("January")) {
            int_mons = "01";
        }
        else if (month_name.includes("February")) {
            int_mons = "02";
        }
        else if (month_name.includes("March")) {
            int_mons = "03";
        }
        else if (month_name.includes("April")) {
            int_mons = "04";
        }
        else if (month_name.includes("May")) {
            int_mons = "05";
        }
        else if (month_name.includes("June")) {
            int_mons = "06";
        }
        else if (month_name.includes("July")) {
            int_mons = "07";
        }
        else if (month_name.includes("August")) {
            int_mons = "08";
        }
        else if (month_name.includes("September")) {
            int_mons = "09";
        }
        else if (month_name.includes("October")) {
            int_mons = "10";
        }
        else if (month_name.includes("November")) {
            int_mons = "11";
        }
        else if (month_name.includes("December")) {
            int_mons = "12";
        }

        return int_mons;
    }

    function month_int_to_name(month_int) {
        var name_mons = "January";

        if (month_int == "01") {
            name_mons = "January";
        }
        else if (month_int == "02") {
            name_mons = "February";
        }
        else if (month_int == "03") {
            name_mons = "March";
        }
        else if (month_int == "04") {
            name_mons = "April";
        }
        else if (month_int == "05") {
            name_mons = "May";
        }
        else if (month_int == "06") {
            name_mons = "June";
        }
        else if (month_int == "07") {
            name_mons = "July";
        }
        else if (month_int == "08") {
            name_mons = "August";
        }
        else if (month_int == "09") {
            name_mons = "September";
        }
        else if (month_int == "10") {
            name_mons = "October";
        }
        else if (month_int == "11") {
            name_mons = "November";
        }
        else if (month_int == "12") {
            name_mons = "December";
        }

        return name_mons;
    }

    function str_to_year(str) {
        var year = str.substr(str.length - 4);

        return year;
    }

    function clearEntry() {

        $("#txtb_transmittal_nbr").val("")
        s.txtb_transmittal_nbr = ""
        $("#txtb_employee_nbr").val("")
        s.txtb_employee_nbr = ""
        $("#txtb_transmittal_date").val("")
        s.txtb_transmittal_date = ""
        $("#ddl_address_to").val("").trigger('change')
        s.ddl_address_to = ""
        $("#txtb_transmittal_descr").val("")
        s.ddl_transmittal_type = "";
        s.txtb_transmittal_descr = ""
        $("#ddl_requested_by").val("").trigger('change')
        s.ddl_address_to = ""
    }

    function isDisabled()
    {
        s.isDisabled = false
    }

    s.btn_edit_action = function (id) {
        s.isShowApproved    = true
        s.isAction          = "EDIT"
        s.InnerModalTitle   = "Edit this record"
        index_update        = id
        ValidationResultColor("ALL", false);

        if (s.datalistgrid2[id].approval_status == "N") {

            s.isDisabled = false
            $("#addFinal").removeClass("hidden")
            $("#addFinal1").removeClass("hidden")
            $("#isShowApproved").addClass("hidden")
            $("#isShowDisapproved").addClass("hidden")
            s.showRecall = false
            s.isAbledTransmittalDateFiled = false

        }

        else if (s.datalistgrid2[id].approval_status == "S")
        {
            s.isDisabled = true
            $("#addFinal").addClass("hidden")
            $("#addFinal1").addClass("hidden")
            //s.isShowApproved = false
            $("#isShowApproved").addClass("hidden")
            $("#isShowDisapproved").addClass("hidden")
            s.showRecall = true
            s.isAbledTransmittalDateFiled = true
        }
		
		else if (s.datalistgrid2[id].approval_status == "D")
        {
            s.isDisabled = true
            $("#addFinal").addClass("hidden")
            $("#addFinal1").addClass("hidden")
            //s.isShowApproved = false
            $("#isShowApproved").addClass("hidden")
            $("#isShowDisapproved").addClass("hidden")
            s.showRecall = true
            s.isAbledTransmittalDateFiled = true
        }

        else //RECEIVED AND APPROVED
        {
            s.isDisabled = true
            $("#addFinal").addClass("hidden")
            $("#addFinal1").addClass("hidden")
            //s.isShowApproved = false
            $("#isShowApproved").addClass("hidden")
            $("#isShowDisapproved").addClass("hidden")
            s.showRecall = false
            s.isAbledTransmittalDateFiled = true

        }
        
        
        if (s.datalistgrid2[id].no_of_employees <= 0)
        {
            $("#addFinal").addClass("hidden")
        }

        $('#inner_modal').modal({
            keyboard: false,
            backdrop: "static"
        });
        clearEntry()
        $("#txtb_transmittal_nbr").val(s.datalistgrid2[id].transmittal_nbr)
        s.txtb_transmittal_nbr  = s.datalistgrid2[id].transmittal_nbr
        $("#txtb_employee_nbr").val(s.datalistgrid2[id].no_of_employees)
        s.txtb_employee_nbr     = s.datalistgrid2[id].no_of_employees
        $("#txtb_transmittal_date").val(moment(s.datalistgrid2[id].transmittal_date).format("YYYY-MM-DD"))
        s.txtb_transmittal_date = moment(s.datalistgrid2[id].transmittal_date).format("YYYY-MM-DD")
        $("#ddl_address_to").val(s.datalistgrid2[id].addressto_id).trigger('change')
        s.ddl_address_to        = s.datalistgrid2[id].addressto_id;
        s.ddl_transmittal_type  = s.datalistgrid2[id].transmittal_type;

        if (s.datalistgrid2[id].approval_status == "D") {
            $("#txtb_transmittal_descr").val(s.datalistgrid2[id].remarks)
            s.txtb_transmittal_descr = s.datalistgrid2[id].remarks
        }
        else {
            $("#txtb_transmittal_descr").val(s.datalistgrid2[id].transmittal_descr)
            s.txtb_transmittal_descr = s.datalistgrid2[id].transmittal_descr
        }
        

        $("#ddl_requested_by").val(s.datalistgrid2[id].requestor_id).trigger('change')
        s.ddl_requested_by = s.datalistgrid2[id].requestor_id
        if (s.datalistgrid2[id].approval_status == 'N')
        {
            $("#progress_id").removeClass("progress-bar progress-bar-success")
            $("#progress_id").removeClass("progress-bar progress-bar-warning")
            $("#progress_id").removeClass("progress-bar progress-bar-danger")
            $("#progress_id").addClass("progress-bar progress-bar-navy-light")
            s.approval_status = "New"
        }
        else if (s.datalistgrid2[id].approval_status == 'A')
        {
            $("#progress_id").removeClass("progress-bar progress-bar-navy-light")
            $("#progress_id").removeClass("progress-bar progress-bar-warning")

            $("#progress_id").removeClass("progress-bar progress-bar-danger")
            $("#progress_id").addClass("progress-bar progress-bar-success")
            s.approval_status = "Approved"
        }
        else if (s.datalistgrid2[id].approval_status == 'S') {
            $("#progress_id").removeClass("progress-bar progress-bar-navy-light")
            $("#progress_id").removeClass("progress-bar progress-bar-success")
            $("#progress_id").removeClass("progress-bar progress-bar-danger")
            $("#progress_id").addClass("progress-bar progress-bar-warning")
            s.approval_status = "Submitted"
        }

        else if (s.datalistgrid2[id].approval_status == 'D') {
            $("#progress_id").removeClass("progress-bar progress-bar-navy-light")
            $("#progress_id").removeClass("progress-bar progress-bar-success")
            $("#progress_id").removeClass("progress-bar progress-bar-warning")
            $("#progress_id").addClass("progress-bar progress-bar-danger")
            s.approval_status = "Disapproved"
        }
        else if (s.datalistgrid2[id].approval_status == 'V') {
            $("#progress_id").removeClass("progress-bar progress-bar-navy-light")
            $("#progress_id").removeClass("progress-bar progress-bar-warning")

            $("#progress_id").removeClass("progress-bar progress-bar-danger")
            $("#progress_id").addClass("progress-bar progress-bar-success")
            s.approval_status = "Received"
        }


        $("#ddl_status").val(s.datalistgrid2[id].approval_status)
        s.ddl_status = s.datalistgrid2[id].approval_status
    }

    s.btn_withdraw_submission = function ()
    {
        var dt = getValueFromHeader()

        dt.approval_status = 'N'

        h.post("../cATSDTRAppr/SaveEditDatabase", { data1: dt, par_action: s.isAction }).then(function (d) {

            if (d.data.message == "success") {

                dt.transmittal_nbr = d.data.sp_get_next_transmittal_no

                if (s.isAction == "EDIT")
                {
                    $("#ddl_status").val("N")
                    updatelistgrid('N')
                    $('#inner_modal').modal('hide');
                    swal("Successfully Updated!", "Current Record has been Successfully Updated!", "success");
                }
                
            }

        })

    }

    s.btn_add_action = function () {
        s.isShowApproved    = false
        s.isDisabled        = false
        $("#addFinal").addClass("hidden")
        $("#addFinal1").removeClass("hidden")
        clearEntry()
        ValidationResultColor("ALL", false);
        s.InnerModalTitle = "Add new record"
        $('#inner_modal').modal({
            keyboard: false,
            backdrop: "static"
        });
        s.isAction = "ADD"
        $("#ddl_status").val("N")
        s.ddl_status = "N"
        s.showRecall = false
        $("#progress_id").removeClass("progress-bar progress-bar-success")
        $("#progress_id").removeClass("progress-bar progress-bar-warning")
        $("#progress_id").addClass("progress-bar progress-bar-navy-light")
        s.approval_status = "New"

        h.post("../cATSDTRAppr/GetTransNbr").then(function (d)
        {
            if (d.data.message == "success") {
                var tdate = new Date()
                s.txtb_transmittal_nbr = d.data.sp_get_next_transmittal_no
                $("#txtb_transmittal_nbr").val(d.data.sp_get_next_transmittal_no)
                s.txtb_employee_nbr = '0'
                $("#txtb_employee_nbr").val('0')
                s.txtb_transmittal_date = moment(tdate).format("YYYY-MM-DD")
                $("#txtb_transmittal_date").val(moment(tdate).format("YYYY-MM-DD"))
            }

        })
    }

    function convert_time_to_24hr(val) {
        var value = "";
        var value2 = "";
        if (val.length > 6) {
            value = val.substring(0, val.length - 3);
        }

        var time = value.split(':');

        if (val.includes("AM") == true) {
            value2 = time[0] + ":" + time[1];
        }
        else if (val.includes("PM") == true) {
            switch (time[0]) {
                case "01":
                    value2 = "13" + ":" + time[1];
                    break;
                case "02":
                    value2 = "14" + ":" + time[1];
                    break;
                case "03":
                    value2 = "15" + ":" + time[1];
                    break;
                case "04":
                    value2 = "16" + ":" + time[1];
                    break;
                case "05":
                    value2 = "17" + ":" + time[1];
                    break;
                case "06":
                    value2 = "18" + ":" + time[1];
                    break;
                case "07":
                    value2 = "19" + ":" + time[1];
                    break;
                case "08":
                    value2 = "20" + ":" + time[1];
                    break;
                case "09":
                    value2 = "21" + ":" + time[1];
                    break;
                case "10":
                    value2 = "22" + ":" + time[1];
                    break;
                case "11":
                    value2 = "23" + ":" + time[1];
                    break;
                case "12":
                    value2 = "00" + ":" + time[1];
                    break;
                //default:
                //    value2 = "";
                //    break;
            }
        }
        else {
            value2 = "";
        }

        return value2;
    }

    function convert_time_to_24hr2(val) {
        var value = "";

        var time = val.split(':');

        switch (time[0]) {
            case "01":
                value = "13" + ":" + time[1];
                break;
            case "02":
                value = "14" + ":" + time[1];
                break;
            case "03":
                value = "15" + ":" + time[1];
                break;
            case "04":
                value = "16" + ":" + time[1];
                break;
            case "05":
                value = "17" + ":" + time[1];
                break;
            case "06":
                value = "18" + ":" + time[1];
                break;
            case "07":
                value = "19" + ":" + time[1];
                break;
            case "08":
                value = "20" + ":" + time[1];
                break;
            case "09":
                value = "21" + ":" + time[1];
                break;
            case "10":
                value = "22" + ":" + time[1];
                break;
            case "11":
                value = "23" + ":" + time[1];
                break;
            case "12":
                value = "00" + ":" + time[1];
                break;
        }

        return value;
    }

    function convert_time_to_12hr(val) {
        var value = "";

        var time = val.split(':');

        switch (time[0]) {
            case "13":
                value = "01" + ":" + time[1];
                break;
            case "14":
                value = "02" + ":" + time[1];
                break;
            case "15":
                value = "03" + ":" + time[1];
                break;
            case "16":
                value = "04" + ":" + time[1];
                break;
            case "17":
                value = "05" + ":" + time[1];
                break;
            case "18":
                value = "06" + ":" + time[1];
                break;
            case "19":
                value = "07" + ":" + time[1];
                break;
            case "20":
                value = "08" + ":" + time[1];
                break;
            case "21":
                value = "09" + ":" + time[1];
                break;
            case "22":
                value = "10" + ":" + time[1];
                break;
            case "23":
                value = "11" + ":" + time[1];
                break;
            case "00":
                value = "12" + ":" + time[1];
                break;
            default:
                value = val == "" ? "" : time[0] + ":" + time[1];
                break;
            //default:
            //    value2 = "";
            //    break;
        }

        return value;
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
        $("#" + table).DataTable().page.len(s.rowLen).draw();
    }

    //************************************// 
    //*** Print Action Click              
    //**********************************// 
    s.btn_print_action = function (par_row_id) {

        s.loading_r = true;
        $('#print_preview_modal').modal({ backdrop: 'static', keyboard: false });
        s.Modal_title = "PRINT PREVIEW";

        var application_nbr = s.datalistgrid2[par_row_id].transmittal_nbr;
        var controller = "Reports"
        var action = "Index"
        var ReportName = "CrystalReport"
        var SaveName = "Crystal_Report"
        var ReportType = "inline"
        var ReportPath = ""
        var sp = ""
        var check_no = s.datalistgrid2[par_row_id].no_of_employees
        ReportPath = "~/Reports/cryTransmittal/cryTransmittal.rpt"
        sp = "sp_dtr_transmittal_rep,par_transmittal_nbr," + application_nbr

        if (check_no > 0) {
      
            h.post("../cATSDTRAppr/SetHistory", { par_data: s.datalistgrid2[par_row_id] }).then(function (d) {
                if (d.data.message == "success") {

                    // *******************************************************
                    // *** VJA : 2021-07-14 - Validation and Loading hide ****
                    // *******************************************************
                    $("#modal_generating_remittance").modal({ keyboard: false, backdrop: "static" })
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

                    s.loading_r = false;

                    iframe.src = s.embed_link;
                    $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });

                    //location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                    //    + "&SaveName=" + SaveName
                    //    + "&ReportType=" + ReportType
                    //    + "&ReportPath=" + ReportPath
                    //    + "&Sp=" + sp
                }

            })
        }

        else {
            swal("No data found!", { icon: "warning", });
             $('#print_preview_modal').modal("hide");
             $("#modal_generating_remittance").modal("hide")
            }
       

        

        //h.post("../cSSOvertimeRequest/setPageHistory")
        //    .then(function (d) {
        //        if (d.data.message == "success") {
        //            location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
        //                + "&SaveName=" + SaveName
        //                + "&ReportType=" + ReportType
        //                + "&ReportPath=" + ReportPath
        //                + "&Sp=" + sp
        //        }
        //        else {
        //            alert(d.data.message);
        //        }
        //    });



    }

    s.btn_show_action = function (id) {
        h.post("../cATSDTRAppr/SetHistory", {par_data : s.datalistgrid2[id] }).then(function (d) {
            if (d.data.message == "success") {
                url = "/cATSDTRApprDetails";
                window.location.replace(url);
            }

        })

    }

    s.CheckPreviousDate = function (value) {
        
        if (value < moment().format("YYYY-MM-DD") && value.length == 10) {
            
            $("#txtb_transmittal_date").val(moment().format("YYYY-MM-DD"))
            
        }
       

    }
    
});