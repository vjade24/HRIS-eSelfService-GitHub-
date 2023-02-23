ng_selfService_App.controller("cATSDTRApprDetails_ctrlr", function ($scope, $compile, $http, $filter) {
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

    s.am_in_tt = "";
    s.am_out_tt = "";
    s.pre_time_in_hrs_tt = "AM";
    s.pm_in_tt = "";
    s.pm_out_tt = "";
    s.post_time_out_hrs_tt = "PM";
    s.label_success_submit = "submitted"

    s.edit_delete_row = null;
    index_update = ""
    s.isAction = ""
    s.approval_status_save = ""
    s.par_month = ""
    s.par_year = ""
    s.department_code = ""
    s.view_type = ""
    function init() {
        s.loading_r = false;
        //format datepicker to month - year only
        //$("#txtb_sched_monsyr").datepicker({
        //    format: "MM - yyyy",
        //    startView: "years",
        //    minViewMode: "months",
        //    autoclose: true,
        //});

        //$("#txtb_effective_date").datepicker({
        //    format: "yyyy-mm-dd",
        //    autoclose: true,
        //});

        ////format clockpicker to 12 Hour Format
        //$("#txtb_pre_time_in_hrs").clockpicker({
        //    format: "HH:mm",
        //    placement: "top",
        //    align: "left",
        //    autoclose: true,
        //    twelvehour: true
        //});

        ////format clockpicker to 12 Hour Format
        //$("#txtb_post_time_out_hrs").clockpicker({
        //    format: "HH:mm",
        //    placement: "top",
        //    align: "left",
        //    autoclose: true,
        //    twelvehour: true
        //});

        //$("#txtb_sched_monsyr").on('change', function (e) {
        //    s.SelectEmplName();
        //});

        //$("#txtb_effective_date").on('change', function (e) {
        //    s.SelectEmplName();
        //});

        //$("#txtb_pre_time_in_hrs").on('change', function (e) {
        //    RemovePMAM($("#txtb_pre_time_in_hrs").val(), "txtb_pre_time_in_hrs");
        //});

        //$("#txtb_post_time_out_hrs").on('change', function (e) {
        //    RemovePMAM($("#txtb_post_time_out_hrs").val(), "txtb_post_time_out_hrs");
        //});

       
        $("#modal_generating_remittance").modal({ keyboard: false, backdrop: "static" });


        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../cATSDTRApprDetails/initializeData").then(function (d) {
            if (d.data.message == "success") {
                

                init_table_data2([]);

                s.txtb_sched_monsyr = month_int_to_name(d.data.prev_date_month) + " - " + d.data.prev_date_year 
                $("#txtb_sched_monsyr").val(month_int_to_name(d.data.prev_date_month) + " - " + d.data.prev_date_year )

                $("#ddl_viewtype").val(d.data.view_type)
                s.ddl_viewtype = d.data.view_type

                $("#txtb_transmittal_nbr").val(d.data.transmittal_nbr)
                s.txtb_transmittal_nbr = d.data.transmittal_nbr
                s.approval_status_save = d.data.approval_status

                if (d.data.approval_status == 'N') {
                    $("#progress_id").removeClass("progress-bar progress-bar-success")
                    $("#progress_id").removeClass("progress-bar progress-bar-warning")

                    $("#progress_id").removeClass("progress-bar progress-bar-danger")
                    $("#progress_id").addClass("progress-bar progress-bar-navy-light")
                    s.approval_status = "New"
                }
                else if (d.data.approval_status  == 'A') {
                    $("#progress_id").removeClass("progress-bar progress-bar-navy-light")
                    $("#progress_id").removeClass("progress-bar progress-bar-warning")
                    $("#progress_id").removeClass("progress-bar progress-bar-danger")

                    $("#progress_id").addClass("progress-bar progress-bar-success")
                    s.approval_status = "Approved"
                }
                else if (d.data.approval_status  == 'S') {
                    $("#progress_id").removeClass("progress-bar progress-bar-navy-light")
                    $("#progress_id").removeClass("progress-bar progress-bar-success")
                    $("#progress_id").removeClass("progress-bar progress-bar-danger")
                    $("#progress_id").addClass("progress-bar progress-bar-warning")
                    s.approval_status = "Submitted"
                }

                else if (d.data.approval_status == 'D') {
                    $("#progress_id").removeClass("progress-bar progress-bar-navy-light")
                    $("#progress_id").removeClass("progress-bar progress-bar-success")
                    $("#progress_id").removeClass("progress-bar progress-bar-warning")
                    $("#progress_id").addClass("progress-bar progress-bar-danger")
                    s.approval_status = "Disapproved"
                }

                else if (d.data.approval_status == 'V') {
                    $("#progress_id").removeClass("progress-bar progress-bar-navy-light")
                    $("#progress_id").removeClass("progress-bar progress-bar-warning")

                    $("#progress_id").removeClass("progress-bar progress-bar-danger")
                    $("#progress_id").addClass("progress-bar progress-bar-success")
                    s.approval_status = "Received"
                }

                s.par_month = d.data.prev_date_month
                s.par_year = d.data.prev_date_year 
                s.department_code = d.data.dept_code 
                s.view_type = d.data.view_type

                if (d.data.sp_dtr_transmittal_dtl_tbl_list.length > 0) {
                    s.datalistgrid2 = d.data.sp_dtr_transmittal_dtl_tbl_list

                    s.oTable2.fnClearTable();
                    s.oTable2.fnAddData(s.datalistgrid2)
                }
                s.allow_delete = true
                s.allow_edit   = true
                s.allow_view   = true
                s.allow_view   = true
                s.allow_print  = true
                $("#modal_generating_remittance").modal("hide");

            }


        })

    }
    init()

    s.FilterName = function () {
        h.post("../cATSDTRApprDetails/FilterName", {
            par_department_code: $("#ddl_dept").val()
        }).then(function (d) {

            if (d.data.message == "success") {
                s.employee_list = d.data.sp_employee_list_dept_dtr_appr
            }
        })
    }

    s.FilterPageGrid = function () {
        if ($("#ddl_dept").val() != "" &&
            $("#ddl_empl_list").val() != "" &&
            $("#ddl_viewtype").val() != "" &&
            $("#txtb_sched_monsyr").val() != ""
        ) {
            h.post("../cATSDTRApprDetails/FilterGrid", {
                par_month: month_name_to_int($('#txtb_sched_monsyr').val())
                , par_year: str_to_year($('#txtb_sched_monsyr').val())
                , par_empl_id: $("#ddl_empl_list").val()
                , par_view_type: $("#ddl_viewtype").val()
                , par_department_code: $("#ddl_dept").val()
            }).then(function (d) {

                if (d.data.message == "success") {
                    s.oTable2.fnClearTable();
                    s.datalistgrid2 = []
                    s.datalistgrid2 = d.data.sp_dtr_rep

                    if (d.data.sp_dtr_rep.length > 0) {
                        s.oTable2.fnAddData(d.data.sp_dtr_rep);
                        $("#approve_dtr").removeClass('hidden')
                    }
                    else {
                        $("#approve_dtr").addClass('hidden')
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
                deferRender: true,
                sDom: 'rt<"bottom"p>',
                pageLength: 10,
                columns: [
                    {
                        "width": "10%", "targets": 1, "mData": "included", "mRender": function (data, type, full, row) {
                            var checked = ""
                            var isdisabled = ""

                            if (s.approval_status_save != "N") {
                                isdisabled = "disabled"
                            }

                            else {
                                isdisabled = ""
                            }

                            if (data == "Y") {
                                checked = "checked"
                            }
                            else {
                                checked = ""
                            }

                            return '<div class="checkbox checkbox-primary text-center"><input style="width:30px;" id="checkbox' + row["row"] + '" ng-click="btn_check_action(' + row["row"] + ')" type="checkbox"' + checked + ' ' + isdisabled +'><label for="checkbox' + row["row"] +'"></label></div>'
                        }
                    },
                    { "width": "10%", "targets": 2, "mData": "empl_id", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "width": "65%", "targets": 3, "mData": "employee_name", "mRender": function (data, type, full, row) { return "<span class='text-left btn-block'>" + data + "</span>" } },
                    {
                        "width": "15%",
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {


                            return '<center><div class="btn-group tooltip-demo">'
                                
                                +'<button type="button" class="btn btn-primary btn-sm action" data-toggle="tooltip" data-placement="left" title="Print" ng-click="btn_print(' + row["row"] + ')" > '
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

    s.btn_check_action = function (id)
    {
        if (s.datalistgrid2[id].included == "Y")
        {
            s.datalistgrid2[id].included = "N"
        }
        else
        {
            s.datalistgrid2[id].included = "Y"
        }

        h.post("../cATSDTRApprDetails/SaveDetails", {
             par_action: s.datalistgrid2[id].included
            ,par_empl_id: s.datalistgrid2[id].empl_id
        }).then(function (d) {
            if (d.data.message == "fail")
            {
                if (s.datalistgrid2[id].included == "Y")
                {
                    s.datalistgrid2[id].included = "N"
                }
                else
                {
                    s.datalistgrid2[id].included = "Y"
                }
                if (s.datalistgrid2.length > 0) {
                    s.oTable2.fnClearTable();
                    s.oTable2.fnAddData(s.datalistgrid2)
                }
                else {
                    s.oTable2.fnClearTable();
                }
                swal({ icon: "warning", title: "Please Check Employee's DTR!" });
            }
         })
    }

    function getValueFromHeader() {
        var dt = {
            transmittal_nbr: $("#txtb_transmittal_nbr").val()
            , transmittal_date: $("#txtb_transmittal_date").val()
            , dtr_year: str_to_year($("#txtb_sched_monsyr").val())
            , dtr_month: month_name_to_int($("#txtb_sched_monsyr").val())
            , view_type: $("#ddl_viewtype").val()
            , transmittal_descr: $("#txtb_transmittal_descr").val()
            , department_code: ""
            , approval_status: $("#ddl_status").val()
            , approved_date: ""
            , approved_by: ""
            , created_dttm: ""
            , created_by: ""
            , updated_dttm: ""
            , updated_by: ""
            , remarks: ""
            , no_of_employees: $("#txtb_employee_nbr").val()
            , addressto_id: $("#ddl_address_to").val()
            , requestor_id: $("#ddl_requested_by").val()
        }

        return dt
    }

    s.btn_save_click = function () {
        $("#btn_save_icn").removeClass("fa fa-save");
        $("#btn_save_icn").addClass("fa fa-spinner fa-spin");

        var dt = getValueFromHeader()
        h.post("../cATSDTRApprDetails/SaveEditDatabase", { data1: dt, par_action: s.isAction }).then(function (d) {

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
                    updatelistgrid()
                    $('#inner_modal').modal('hide');
                    swal("Successfully Updated!", "Current Record has been Successfully Updated!", "success");
                }


                $("#btn_save_icn").removeClass("fa fa-spinner fa-spin");
                $("#btn_save_icn").addClass("fa fa-save");
            }

        })
    }

    function updatelistgrid() {
        var table = $('#datalist_grid2').DataTable();
        var info = table.page.info();

        s.datalistgrid2[index_update].view_type = $("#ddl_viewtype").val()
        s.datalistgrid2[index_update].transmittal_descr = $("#txtb_transmittal_descr").val()
        s.datalistgrid2[index_update].approval_status = $("#ddl_status").val()
        s.datalistgrid2[index_update].addressto_id = $("#ddl_address_to").val()
        s.datalistgrid2[index_update].requestor_id = $("#ddl_requested_by").val()
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
                        h.post("../cATSDTRApprDetails/Delete", {
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
    function ValidateFields3() {
        var return_val = true;

        if ($('#ddl_time_sched').val() == "") {
            ValidationResultColor("ddl_time_sched", true);
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
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else {
            //remove of refresh the object form being required

            $("#txtb_sched_monsyr").removeClass("required");
            $("#lbl_txtb_sched_monsyr_req").text("");

            $("#ddl_time_sched").removeClass("required");
            $("#lbl_ddl_time_sched_req").text("");

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
        $("#ddl_address_to").val("")
        s.ddl_address_to = ""
        $("#txtb_transmittal_descr").val("")
        s.txtb_transmittal_descr = ""
        $("#ddl_requested_by").val("")
        s.ddl_address_to = ""
    }

    s.btn_edit_action = function (id) {
        s.isAction = "EDIT"
        index_update = id
        $('#inner_modal').modal('show');
        clearEntry()

        $("#txtb_transmittal_nbr").val(s.datalistgrid2[id].transmittal_nbr)
        s.txtb_transmittal_nbr = s.datalistgrid2[id].transmittal_nbr
        $("#txtb_employee_nbr").val(s.datalistgrid2[id].no_of_employees)
        s.txtb_employee_nbr = s.datalistgrid2[id].no_of_employees
        $("#txtb_transmittal_date").val(moment(s.datalistgrid2[id].transmittal_date).format("YYYY-MM-DD"))
        s.txtb_transmittal_date = moment(s.datalistgrid2[id].transmittal_date).format("YYYY-MM-DD")
        $("#ddl_address_to").val(s.datalistgrid2[id].addressto_id).trigger('change')
        s.ddl_address_to = s.datalistgrid2[id].addressto_id
        $("#txtb_transmittal_descr").val(s.datalistgrid2[id].transmittal_descr)
        s.txtb_transmittal_descr = s.datalistgrid2[id].transmittal_descr
        $("#ddl_requested_by").val(s.datalistgrid2[id].requestor_id).trigger('change')
        s.ddl_requested_by = s.datalistgrid2[id].requestor_id
        $("#ddl_status").val(s.datalistgrid2[id].approval_status)
        s.ddl_status = s.datalistgrid2[id].approval_status
    }

    s.btn_add_action = function () {
        clearEntry()
        s.InnerModalTitle = "Add new record"
        $('#inner_modal').modal('show');
        s.isAction = "ADD"
        $("#ddl_status").val("N")
        s.ddl_status = "N"

        h.post("../cATSDTRApprDetails/GetTransNbr").then(function (d) {
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

    s.ToDTRHeader = function ()
    {
        url = "/cATSDTRAppr";
        window.location.replace(url);
    }

    s.btn_print = function (id) {
                s.loading_r = true;
                $('#print_preview_modal').modal({ backdrop: 'static', keyboard: false });
                s.Modal_title = "PRINT PREVIEW";
                

            h.post("../rSSDTRPrinting/RetriveData",
                {
                    par_year            : s.par_year
                    ,par_month          : s.par_month
                    ,par_empl_id        : s.datalistgrid2[id].empl_id
                    ,par_view_type      : s.view_type
                    ,par_department_code: s.department_code

                }).then(function (d) {

                    if (d.data.sp_report.length == 0) {
                        swal("NO DATA FOUND", "No data found in this Year and Month Selected", { icon: "warning" });
                       

                    }
                    else {
                     
                        var controller = "Reports"
                        var action = "Index"
                        var ReportName = "cryDTR"
                        var SaveName = "Crystal_Report"
                        var ReportType = "inline"
                        var ReportPath = ""
                        var sp = ""

                        ReportPath = "~/Reports/cryDTR/cryDTR.rpt"
                        sp = "sp_dtr_rep,par_year," + s.par_year + ",par_month," + s.par_month + ",par_empl_id," + s.datalistgrid2[id].empl_id + ",par_view_type," + s.view_type + ",par_department_code," + s.department_code + ",par_user_id," + d.data.session_user_id

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
        // *******************************************************
        // *******************************************************


                      // location.href = "../" + controller + "/"
                      //     + action + "?ReportName="
                      //     + ReportName
                      //     + "&SaveName=" + SaveName
                      //     + "&ReportType=" + ReportType
                      //     + "&ReportPath=" + ReportPath
                      //     + "&Sp=" + sp

                    }


                })
        
    }

});