ng_selfService_App.controller("cTimeScheduleAppr_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http

    var userid  = "";
    s.year      = [];
    s.rowLen    = "10";
    s.btn_name = "";

    s.pre_hrs_arr = new Array(31);
    s.post_hrs_arr = new Array(31);
    s.time_schedule_alert = 0
    
    function minusOne(id) {
         $("#" + id).text(localStorage["minus_time_sched"])
    }
    function init() {
        //format datepicker to month - year only
        $("#txtb_sched_monyear").datepicker({
            format: "MM - yyyy",
            startView: "years",
            minViewMode: "months",
            autoclose: true,
        });

        $("#txtb_sched_monyear").on('change', function (e) {
            s.FilterPageGrid();
        });
        var ddate = new Date();
        s.txtb_sched_monyear = moment(ddate).format("MMMM - YYYY");     
        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });
        //**********************************************
        // Initialize data during page loads
        //**********************************************
      

        h.post("../cTimeScheduleAppr/InitializeData").then(function (d) {
            if (d.data.message == "success")
            {
                init_table_data([]);
                init_table_data2([]);

               // s.FilterPageGrid();

                s.oTable.fnClearTable();
                s.datalistgrid = d.data.filteredGrid;
                if (d.data.filteredGrid.length > 0)
                {
                    s.oTable.fnAddData(d.data.filteredGrid);
                }
                  

                //**********************************************
                //  Show/Hide ADD, EDIT, DELETE button 
                //**********************************************
                d.data.um.allow_add == "1" ? s.ShowAdd = true : s.ShowAdd = false;
                d.data.um.allow_delete == "1" ? s.ShowDelete = true : s.ShowDelete = false;
                d.data.um.allow_edit == "1" ? s.ShowEdit = true : s.ShowEdit = false;
                //d.data.um.allow_view    == "1" ? s.ShowView     = true : s.ShowView     = false;
                //d.data.um.allow_print == "1" ? s.ShowAdd = true : s.ShowAdd = false;

                s.pre_hrs_arr.fill("", 0, 31);
                s.post_hrs_arr.fill("", 0, 31);
                $("#modal_generating_remittance").modal("hide");
            }
            else {
                swal(d.data.message, { icon: "warning", });
            } 

           

            if (localStorage["minus_time_sched"] > 0) {
                minusOne("9409")
            }
            else {
                localStorage["minus_time_sched"] = parseInt($("#" + "9409").text())
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
                columns: [
                    {
                        "mData": "tse_effective_date",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "empl_id",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "employee_name",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left   btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "worklist_status",
                        "mRender": function (data, type, full, row) {
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
                            else {
                                temp = "<b><span class='text-center badge badge-default'><i class='fa fa-send'></i> " + data + "</span></b>"
                            }
                            return temp;
                        }
                    },
                    {
                        "mData": "worklist_action",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            return '<center><div class="btn-group">' +
                                '<button id="btn-text_action" type="button" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="' + data + '"> ' + data + '</button >' +
                                '<button id="btn-icon_action" type="button" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="' + data + '"><i class="fa fa-thumbs-up"></i></button >' +
                                '</div></center>';
                        }
                    }
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            });
    }
    var init_table_data2 = function (par_data) {
        s.datalistgrid2 = par_data;
        s.oTable1 = $('#datalist_grid2').dataTable(
            {
                data: s.datalistgrid2,
                bSort: false,
                bAutoWidth: false,
                sDom: 'rt<"bottom">',
                paging: false,
                columns: [
                    {
                        "width": "10%",
                        "targets": 0,
                        "mData": null,
                        "mRender": function (data, type, full, row) {
							
							var display_hol = "";
                            if (full["day_type"] == "HOL") {
                                display_hol = "HOL";
                            }
                            else 
							{
                                display_hol = "";
                            }
							
                            var temp_string = full["dtr_date_char"];
                            if (temp_string.slice(5, 7) != month_name_to_int($('#txtb_sched_monsyr').val())) {
                                full["day_nbr"] = ""
                                full["day_of_week"] = ""
                                return "<span class='text-left btn-block'>" + full["day_nbr"] + " " + full["day_of_week"] + "<span class='pull-right' id='display_hol' style='cursor:pointer;'>" + display_hol + "</span>" + "</span>"
                            }
                            else {
                                return "<span class='text-left btn-block'>" + full["day_nbr"] + " " + full["day_of_week"] + "<span class='pull-right' id='display_hol' style='cursor:pointer;'>" + display_hol + "</span>" + "</span>"
                            }
                        }
                    },
                    { "width": "8%", "targets": 1, "mData": "tse_in_am", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "width": "9%", "targets": 2, "mData": "tse_out_am", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "width": "8%", "targets": 3, "mData": "tse_in_pm", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "width": "8%", "targets": 4, "mData": "tse_out_pm", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    {
                        "width": "26%",
                        "targets": 5,
                        "mData": "ts_descr",
                        "mRender": function (data, type, full, row) {
                            if (data == null || data == "") {
                                return "<span class='text-left btn-block'> </span>"
                            }
                            else {
                                return "<span class='text-left btn-block'>" + data + "</span>"
                            }

                        }
                    },
                    {
                        "width": "1%",
                        "targets": 6,
                        "mData": "tse_day_parent",
                        "visible": false,
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "width": "8%",
                        "targets": 7,
                        "mData": "pre_time_in_hrs",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "width": "8%",
                        "targets": 8,
                        "mData": "post_time_out_hrs",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "width": "8%",
                        "targets": 9,
                        "mData": "ts_day_equivalent",
                        "mRender": function (data, type, full, row) {
                            if (data == null || data == "" || data == "0") {
                                return "<span class='text-center btn-block'> </span>"
                            }
                            else {
                                return "<span class='text-center btn-block'>" + data + " d</span>"
                            }
                        }
                    }
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
                "footerCallback": function (row, data, start, end, display) {
                    var api = this.api(), data;

                    // converting to interger to find total
                    var intVal = function (i) {
                        return typeof i === 'string' ?
                            i.replace(/[\$,]/g, '') * 1 :
                            typeof i === 'number' ?
                                i : 0;
                    };

                    // computing column Total of the complete result 
                    var pre_tot = s.pre_hrs_arr.reduce(function (a, b) {
                        return intVal(a) + intVal(b);
                    }, 0);

                    // computing column Total of the complete result 
                    var post_tot = s.post_hrs_arr.reduce(function (a, b) {
                        return intVal(a) + intVal(b);
                    }, 0);

                    // computing column Total of the complete result 
                    var sched_hrs_tot = api
                        .column(9)
                        .data()
                        .reduce(function (a, b) {
                            return intVal(a) + intVal(b);
                        }, 0);

                    var sched_hrs_tot_with_prepost = (sched_hrs_tot * 8) + (pre_tot + post_tot);
                    var sched_hrs_tot_with_prepost2 = Number.isInteger(sched_hrs_tot_with_prepost) == true ? sched_hrs_tot_with_prepost : sched_hrs_tot_with_prepost.toFixed(Math.max(((sched_hrs_tot_with_prepost + '').split(".")[1] || "").length, 2));

                    // Update footer by showing the total with the reference of the column index 
                    $('#no_of_wrkng_hrs_sched').text(sched_hrs_tot_with_prepost2);
                },
            });
    }
    //var init_table_data2 = function (par_data) {
    //    s.datalistgrid2 = par_data;
    //    s.oTable1 = $('#datalist_grid2').dataTable(
    //        {
    //            data: s.datalistgrid2,
    //            bSort: false,
    //            bAutoWidth: false,
    //            sDom: 'rt<"bottom">',
    //            paging: false,
    //            columns: [
    //                {
    //                    "width": "6%",
    //                    "targets": 0,
    //                    "mData": null,
    //                    "mRender": function (data, type, full, row) {
    //                        return "<span class='text-left btn-block'>" + full["day_nbr"] + " " + full["day_of_week"] + "</span>"
    //                    }
    //                },
    //                { "width": "8%", "targets": 1, "mData": "tse_in_am", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
    //                { "width": "9%", "targets": 2, "mData": "tse_out_am", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
    //                { "width": "8%", "targets": 3, "mData": "tse_in_pm", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
    //                { "width": "8%", "targets": 4, "mData": "tse_out_pm", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
    //                {
    //                    "width": "26%",
    //                    "targets": 5,
    //                    "mData": "ts_descr",
    //                    "mRender": function (data, type, full, row) {
    //                        if (data == null || data == "") {
    //                            return "<span class='text-left btn-block'> </span>"
    //                        }
    //                        else {
    //                            return "<span class='text-left btn-block'>" + data + "</span>"
    //                        }

    //                    }
    //                },
    //                {
    //                    "width": "1%",
    //                    "targets": 6,
    //                    "mData": "tse_day_parent",
    //                    "visible": false,
    //                    "mRender": function (data, type, full, row) {
    //                        return "<span class='text-center btn-block'>" + data + "</span>"
    //                    }
    //                },
    //                {
    //                    "width": "8%",
    //                    "targets": 7,
    //                    "mData": "pre_time_in_hrs",
    //                    "mRender": function (data, type, full, row) {
    //                        if (data == null || data == "" || data == "0") {
    //                            return "<span class='text-center btn-block'> </span>"
    //                        }
    //                        else {
    //                            return "<span class='text-center btn-block'>" + data + " hr/s</span>"
    //                        }
    //                    }
    //                },
    //                {
    //                    "width": "8%",
    //                    "targets": 8,
    //                    "mData": "post_time_out_hrs",
    //                    "mRender": function (data, type, full, row) {
    //                        if (data == null || data == "" || data == "0") {
    //                            return "<span class='text-center btn-block'> </span>"
    //                        }
    //                        else {
    //                            return "<span class='text-center btn-block'>" + data + " hr/s</span>"
    //                        }
    //                    }
    //                },
    //                {
    //                    "width": "8%",
    //                    "targets": 9,
    //                    "mData": "ts_day_equivalent",
    //                    "mRender": function (data, type, full, row) {
    //                        if (data == null || data == "" || data == "0") {
    //                            return "<span class='text-center btn-block'> </span>"
    //                        }
    //                        else {
    //                            return "<span class='text-center btn-block'>" + data + " d</span>"
    //                        }
    //                    }
    //                }
    //            ],
    //            "createdRow": function (row, data, index) {
    //                $compile(row)($scope);  //add this to compile the DOM
    //            },
    //            "footerCallback": function (row, data, start, end, display) {
    //                var api = this.api(), data;

    //                // converting to interger to find total
    //                var intVal = function (i) {
    //                    return typeof i === 'string' ?
    //                        i.replace(/[\$,]/g, '') * 1 :
    //                        typeof i === 'number' ?
    //                            i : 0;
    //                };

    //                // converting to interger to find total
    //                var intVal = function (i) {
    //                    return typeof i === 'string' ?
    //                        i.replace(/[\$,]/g, '') * 1 :
    //                        typeof i === 'number' ?
    //                            i : 0;
    //                };

    //                // computing column Total of the complete result 
    //                var pre_tot = s.pre_hrs_arr.reduce(function (a, b) {
    //                    return intVal(a) + intVal(b);
    //                }, 0);

    //                // computing column Total of the complete result 
    //                var post_tot = s.post_hrs_arr.reduce(function (a, b) {
    //                    return intVal(a) + intVal(b);
    //                }, 0);

    //                // computing column Total of the complete result 
    //                var sched_hrs_tot = api
    //                    .column(9)
    //                    .data()
    //                    .reduce(function (a, b) {
    //                        return intVal(a) + intVal(b);
    //                    }, 0);


    //                var sched_hrs_tot_with_prepost = (sched_hrs_tot * 8) + (pre_tot + post_tot);
    //                var sched_hrs_tot_with_prepost2 = Number.isInteger(sched_hrs_tot_with_prepost) == true ? sched_hrs_tot_with_prepost : sched_hrs_tot_with_prepost.toFixed(Math.max(((sched_hrs_tot_with_prepost + '').split(".")[1] || "").length, 2));

    //                // Update footer by showing the total with the reference of the column index 
    //                $('#no_of_wrkng_hrs_sched').text(sched_hrs_tot_with_prepost2);
    //            },
    //        });
    //}
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
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields() {
        var return_val = true;
        ValidationResultColor("ALL", false);

        if ($('#txtb_remarks').val() == "") {
            ValidationResultColor("txtb_remarks", true);
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

            $("#txtb_remarks").removeClass("required");
            $("#lbl_txtb_remarks_req").text("");

        }
    }

    function month_int_to_name(month_int) {
        var name_mons = "January";

        if (month_int == "01") {
            name_mons = "Janaury";
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

    function clearentry() {
        s.txtb_remarks = "";

        $("#txtb_remarks").removeClass("required");
        $("#lbl_txtb_remarks_req").text("");
    }
    function get_page(empl_id) {
        var nakit_an = false;
        var rowx = 0;
        $('#datalist_grid tr').each(function () {
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
    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.FilterPageGrid = function () {
        $('#modal_generating_remittance').modal({ backdrop: 'static', keyboard: false });

        h.post("../cTimeScheduleAppr/FilterPageGrid", {

            par_month           : month_name_to_int($('#txtb_sched_monyear').val())
            , par_year          : str_to_year($('#txtb_sched_monyear').val())
            , par_show_history  : $('#chk_show_approved').prop("checked") == true ? "Y" : "N"
        }).then(function (d) {
            if (d.data.message == "success") {
                s.oTable.fnClearTable();
                s.datalistgrid = d.data.filteredGrid;
                if (d.data.filteredGrid.length > 0) {
                    s.oTable.fnAddData(d.data.filteredGrid);
                }

                $("#modal_generating_remittance").modal("hide");
            }
        })
    }
    //************************************// 
    //*** Open Edit Modal         
    //**********************************// 
    s.btn_edit_action = function (row_id) {
        clearentry();
        s.isEdit = true;
        s.ModalTitle = "Employee Time Schedule Approval";

        console.log(s.datalistgrid[row_id]);

        if (s.datalistgrid[row_id].next_status == "") {
            //s.dis_action = true;
            s.show_actions = false;
        }
        else {
            //s.dis_action = false;
            s.show_actions = true;
            btn = document.getElementById('approve');
            if (s.datalistgrid[row_id].next_status == "R") {
                btn.innerHTML = '<i class="fa fa-thumbs-o-up"></i> Review';
            }
            else if (s.datalistgrid[row_id].next_status == "F") {
                btn.innerHTML = '<i class="fa fa-thumbs-up"></i> Final Approve';
            }
            else {
                btn.innerHTML = '<i class="fa fa-thumbs-up"></i> ' + ' Approve';
            }
        }

        if (s.datalistgrid[row_id].next_status == "L") {
            s.show_cancel = true;
        }
        else {
            s.show_cancel = false;
        }
        

        s.txtb_appl_nbr = s.datalistgrid[row_id].tse_ctrl_no;
        s.txtb_empl_name = s.datalistgrid[row_id].employee_name;
        s.txtb_empl_id = s.datalistgrid[row_id].empl_id;
        s.txtb_approval_status = s.datalistgrid[row_id].approval_status_descr;

        s.txtb_sched_monsyr = month_int_to_name(s.datalistgrid[row_id].tse_month) + " - " + s.datalistgrid[row_id].tse_year;
        s.txtb_effective_date = s.datalistgrid[row_id].tse_effective_date;

        s.next_status       = s.datalistgrid[row_id].next_status;
        s.temp_appr_ctrl    = s.datalistgrid[row_id].tse_ctrl_no;
        s.temp_approval_id = s.datalistgrid[row_id].approval_id;
        
        if (s.datalistgrid[row_id].next_status == "") {
            s.dis_action = true;
        }
        else {
            s.dis_action = false;
        }

        if (s.datalistgrid[row_id].next_status == "1") {
            s.btn_name = "Level 1";
        }
        else if (s.datalistgrid[row_id].next_status == "2") {
            s.btn_name = "Level 2";
        }
        else if (s.datalistgrid[row_id].next_status == "F") {
            s.btn_name = "Final";
        }

        switch (s.datalistgrid[row_id].approval_status) {
            case "C":
                s.txtb_remarks = s.datalistgrid[row_id].cancel_pending_comment;
                break;
            case "L":
                s.txtb_remarks = s.datalistgrid[row_id].cancelled_comment;
                break;
            case "D":
                s.txtb_remarks = s.datalistgrid[row_id].disapproval_comment;
                break;
            case "R":
                s.txtb_remarks = s.datalistgrid[row_id].reviewed_comment;
                break;
            case "1":
                s.txtb_remarks = s.datalistgrid[row_id].level1_approval_comment;
                break;
            case "2":
                s.txtb_remarks = s.datalistgrid[row_id].level2_approval_comment;
                break;
            case "F":
                s.txtb_remarks = s.datalistgrid[row_id].final_approval_comment;
                break;
            default:
                s.txtb_remarks = "";
                break;
        }

        h.post("../cTimeScheduleAppr/GetDetailsData", {
            par_empl_id             : s.datalistgrid[row_id].empl_id
            , par_month             : s.datalistgrid[row_id].tse_month
            , par_year              : s.datalistgrid[row_id].tse_year
            , par_effective_date    : s.datalistgrid[row_id].tse_effective_date
        }).then(function (d) {
            if (d.data.message == "success") {
                s.oTable1.fnClearTable();
                s.datalistgrid2 = d.data.sp_time_schedule_empl;
                if (d.data.sp_time_schedule_empl.length > 0) {
                    s.oTable1.fnAddData(d.data.sp_time_schedule_empl);
                }

                $("#no_of_wrkng_hrs").text(d.data.no_of_wrkng_hrs);
                if (parseFloat($("#no_of_wrkng_hrs").html()) > parseFloat($("#no_of_wrkng_hrs_sched").html())) {
                    $('#no_of_wrkng_hrs_sched').addClass("red_font");
                    $('#hrs_lbl').addClass("red_font");
                }
                else {
                    $('#no_of_wrkng_hrs_sched').removeClass("red_font");
                    $('#hrs_lbl').removeClass("red_font");
                }

                setTimeout(function () {
                    $('#main_modal').modal({ backdrop: 'static', keyboard: false });
                }, 300);
            }
            else {
                swal(d.data.message, { icon: "warning", });
            }
        });
    }

    s.btn_cancel_pending = function () {
        if (ValidateFields()) {

            s.next_status = "C";
            action();
            s.swal_title = "Application has been cancelled successfully!";
        }
    }

    s.btn_disapprove = function () {
        if (ValidateFields()) {
            s.next_status = "D";
            action();
            s.swal_title = "Application has been disapproved successfully!";
        }
    }

    s.btn_approve = function () {
        action();
        if (s.next_status == "R") {
            s.swal_title = "Application has been reviewed successfully!";
        }
        else {
            s.swal_title = "Application has been approved successfully!";
        }
        localStorage["minus_time_sched"] = parseInt(localStorage["minus_time_sched"]) - 1
        minusOne("9409")
    }

    

    s.btn_cancel_click = function () {
        if (ValidateFields()) {
            s.next_status = "L";
            action();
            s.swal_title = "Application has been cancelled successfully!";
        }
    }

    function action() {
        //var btn = "";
        //if (s.next_status == "C") {
        //    btn = document.getElementById('cancel_pending');
        //    btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Cancel Pending';
        //}
        //else if (s.next_status == "D") {
        //    btn = document.getElementById('disapprove');
        //    btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Disapprove';
        //}
        //else {
        //    btn = document.getElementById('approve');
        //    btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> ' + s.btn_name + ' Approve';
        //}

        if (s.next_status == "C") {
            btn = document.getElementById('cancel_pending');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Cancel Pending';
        }
        else if (s.next_status == "D") {
            btn = document.getElementById('disapprove');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Disapprove';
        }
        else if (s.next_status == "F") {
            btn = document.getElementById('approve');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Final Approve';
        }
        else if (s.next_status == "L") {
            btn = document.getElementById('btn_cancel');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Cancel Leave';
        }
        else {
            btn = document.getElementById('approve');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Review';
        }


        var data =
        {
            tse_ctrl_no         : s.temp_appr_ctrl
            , approval_status   : s.next_status
            , details_remarks   : s.txtb_remarks
            , approval_id       : s.temp_approval_id
        }
        
        h.post("../cTimeScheduleAppr/ApprReviewerAction", { data: data }).then(function (d) {
            if (d.data.message == "success") {
                
                //if (s.next_status == "C") {
                //    btn.innerHTML = '<i class="fa fa-ban"> </i> Cancel Pending';
                //}
                //else if (s.next_status == "D") {
                //    btn.innerHTML = '<i class="fa fa-thumbs-down"> </i> Disapprove';
                //}
                //else if (s.next_status == "R") {
                //    btn.innerHTML = '<i class="fa fa-thumbs-down"> </i> Review';
                //}
                //else {
                //    btn.innerHTML = '<i class="fa fa-thumbs-up"> </i> Approve';
                //}

                if (s.next_status == "C") {
                    btn.innerHTML = '<i class="fa fa-ban"> </i> Cancel Pending';
                }
                else if (s.next_status == "D") {
                    btn.innerHTML = '<i class="fa fa-thumbs-down"> </i> Disapprove';
                }
                else if (s.next_status == "L") {
                    btn.innerHTML = '<i class="fa fa-ban"> </i> Cancel Leave';
                }
                else {
                    btn.innerHTML = '<i class="fa fa-thumbs-up"> </i> ' + ' Approve';
                }

                //s.FilterPageGrid();
                $('#main_modal').modal("hide");
                swal({ icon: "success", title: s.swal_title });

            }
            else {
                swal(d.data.message, { icon: "warning", });
            }
        });
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

    function str_to_year(str) {
        var year = str.substr(str.length - 4);

        return year;
    }
})