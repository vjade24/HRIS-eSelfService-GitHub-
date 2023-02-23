ng_selfService_App.controller("cSSTimeSchedule_ctrlr", function ($scope, $compile, $http, $filter) {
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
	var vw_shift_flag = "1";

    s.show_recall = true;
    s.add_days_orig_edit = ""
    s.tse_date_orig_edit = ""
    s.shift_sched_list = [
        { shift_code: '1', shift_code_descr: 'Regular Schedule' },
        { shift_code: '2', shift_code_descr: 'Shift Schedule' },


    ]
    //s.log_in_as_AO = false;

    function init() {
        //format datepicker to month - year only
        $("#txtb_sched_monsyr").datepicker({
            format: "MM - yyyy",
            startView: "years",
            minViewMode: "months",
            autoclose: true,
        });

        $("#txtb_effective_date").datepicker({
            format: "yyyy-mm-dd",
            autoclose: true,
        });

        $("#ddl_name_dspl").select2().on('change', function (e) {
            s.getEmployeeInfo();
            allowClear: true
        })

        $("#ddl_time_sched").select2().on('change', function (e) {
            s.SelectTimeSched();
            allowClear: true
        })

        //format clockpicker to 12 Hour Format
        $("#txtb_pre_time_in_hrs").clockpicker({
            format: "HH:mm",
            placement: "top",
            align: "left",
            autoclose: true,
            twelvehour: true
        });

        //format clockpicker to 12 Hour Format
        $("#txtb_post_time_out_hrs").clockpicker({
            format: "HH:mm",
            placement: "top",
            align: "left",
            autoclose: true,
            twelvehour: true
        });

        $("#txtb_sched_monsyr").on('change', function (e) {
            s.SelectEmplName();
        });

        $("#txtb_effective_date1").on('change', function (e) {
            s.effective_date_change()
        });

        $("#txtb_effective_date").on('change', function (e) {
            s.SelectEmplName();
        });

        $("#txtb_pre_time_in_hrs").on('change', function (e) {
            RemovePMAM($("#txtb_pre_time_in_hrs").val(), "txtb_pre_time_in_hrs");
        });

        $("#txtb_post_time_out_hrs").on('change', function (e) {
            RemovePMAM($("#txtb_post_time_out_hrs").val(), "txtb_post_time_out_hrs");
        });

        $("#ddl_name").select2().on('change', function (e) {
            s.SelectEmplName();
        });

        //$("#ddl_shift_sched").select2().on('change', function (e) {
        //    s.ddl_shift_change();
        //});

        $("#ddl_shift_sched").val("1")
        s.ddl_shift_sched = "1";
        
        var ddate = new Date();
        s.txtb_sched_monsyr = moment(ddate).format("MMMM - YYYY");                                                     //Current Year for Reference as Year Parameter in all SP in Employee Time Schedule
        s.txtb_effective_date = moment(ddate).format("YYYY-MM-DD");                                                     //Current Year for Reference as Year Parameter in all SP in Employee Time Schedule
        s.txtb_approval_status = "NEW";
        $("#txtb_appr   oval_status").text("NEW");
		
		 s.dis_btn = true;
		
        $("#modal_generating_remittance").modal();


        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../cSSTimeSchedule/initializeData").then(function (d) {
            if (d.data.message == "success") {
                init_table_data2([]);
                init_table_data3([]);
                
                if (d.data.log_in_as_AO == "True" || d.data.is_dtr_AO == "false")
                {
                    s.log_in_as_AO = true
                }
                else
                {
                    s.log_in_as_AO = false
                }

                //s.log_in_as_AO = d.data.log_in_as_AO == "True" ? true : false;
                s.empl_names = d.data.empl_name;
                s.ddl_name = d.data.log_empl_id;
                //$('#ddl_name option:selected').val(d.data.log_empl_id);
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
                s.SelectEmplName();


             

				
                $("#modal_generating_remittance").modal("hide");
				
				
				//setTimeout(function() {
				//    s.btn_click_tabs('tab2');
				//}, 500);
				
               
				
				
				 setTimeout(function() {
				   s.dis_btn = false;
				}, 1000);
				
				
            }
            else {
                swal(d.data.message, { icon: "warning", });
            }
        });
    }

    init()

    var init_table_data2 = function (par_data) {
        s.datalistgrid2 = par_data;
        s.oTable1 = $('#datalist_grid2').dataTable(
            {
                data: s.datalistgrid2,
                bSort: false,
                bAutoWidth: false,
                fixedHeader: true,
                sDom: 'rt<"bottom">',
                paging: false,
                columns: [
                    {
                        "width": "8%",
                        "targets": 0,
                        "mData": null,
                        "mRender": function (data, type, full, row) {
                            var display_hol = "";
                            if (full["day_type"] == "HOL") {
                                display_hol = "HOL";
                            }
                            else {
                                display_hol = "";
                            }
                            //return '<button type="button" class="btn btn-secondary" data-container="body" data-toggle="popover" data-placement="top" data-content="Vivamus sagittis lacus vel augue laoreet rutrum faucibus.">Popover on top</button>';
                            if (full["day_of_week"] == "S") {
                                return "<span class='text-left btn-block' style='color:#ed5565;font-weight:bold;'>" + full["day_nbr"] + " " + full["day_of_week"] + " " + "<span class='pull-right' id='display_hol' style='cursor:pointer;'>" + display_hol + "</span>" + "</span>";
                            }
                            else {
                                return "<span class='text-left btn-block' style='font-weight:bold;'>" + full["day_nbr"] + " " + full["day_of_week"] + " " + "<span class='pull-right' id='display_hol' style='cursor:pointer;'>" + display_hol + "</span>" + "</span>";
                            }
                        }
                    },
                    { "width": "8%", "targets": 1, "mData": "tse_in_am", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "width": "9%", "targets": 2, "mData": "tse_out_am", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    {
                        "width": "8%", "targets": 3, "mData": "tse_in_pm", "mRender": function (data, type, full, row) {
                            if(data == '11:59')
                                data = '12:00'
                            return "<span class='text-center btn-block'>" +

                                data

                                + "</span>"
                        }
                    },
                    { "width": "8%", "targets": 4, "mData": "tse_out_pm", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    {
                        "width": "27%",
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
                    },
                    {
                        "width": "15%",
                        "targets": 10,
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            if (full["approval_status"].toString() == "N" || full["approval_status"].toString() == "C" ||
                                full["approval_status"].toString() == "" || full["approval_status"].toString() == null) {
                               // s.dis_btn = false;
                                if (full["day_nbr"] == full["tse_day_parent"] || full["tse_day_parent"] == "98") {
                                    return '<center><div class="btn-group">' +
                                        '<button type="button" ng-show="ShowEdit"   class="btn btn-info btn-sm"     ng-click="btn_edit_action1(' + row["row"] + ')"     data-toggle="tooltip" data-placement="top" title="Edit">    <i class="fa fa-edit"></i></button >' +
                                        '<button type="button" ng-show="ShowDelete" class="btn btn-danger btn-sm"   ng-click="btn_del_row1(' + row["row"] + ')"         data-toggle="tooltip" data-placement="top" title="Delete">  <i class="fa fa-trash"></i></button>' +
                                        '</div></center>';
                                }
                                else {
                                    return '<center><div class="btn-group">' +
                                        '<button disabled type="button" ng-show="ShowEdit"      class="btn btn-info btn-sm"    data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >' +
                                        '<button disabled type="button" ng-show="ShowDelete"    class="btn btn-danger btn-sm"  data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                        '</div></center>';
                                }

                            }
                            else {
                                //s.dis_btn = true;
                                return '<center><div class="btn-group">' +
                                    '<button type="button" ng-show="ShowEdit"   class="btn btn-info btn-sm"    data-toggle="tooltip" data-placement="top" title="Edit" disabled>    <i class="fa fa-edit"></i></button >' +
                                    '<button type="button" ng-show="ShowDelete" class="btn btn-danger btn-sm"  data-toggle="tooltip" data-placement="top" title="Delete" disabled>  <i class="fa fa-trash"></i></button>' +
                                    '</div></center>';
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

    var init_table_data3 = function (par_data) {
        s.datalistgrid3 = par_data;
        s.oTable3 = $('#datalist_grid3').dataTable(
            {
                data: s.datalistgrid3,
                bSort: false,
                bAutoWidth: false,
                sDom: 'rt<"bottom"ip>',
                pageLength: 12,
                columns: [
                    //{
                    //    "mData": "tse_ctrl_no",
                    //    "mRender": function (data, type, full, row) {
                    //        return "<span class='text-center btn-block'>" + data + "</span>"
                    //    }
                    //},
                    {
                        "mData": null,
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + month_int_to_name(full["tse_month"]) + " - " + full["tse_year"] + "</span>"
                        }
                    },
                    {
                        "mData": "tse_effective_date",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "approval_status_descr",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": null,
                        "mRender": function (data, type, full, row) {
                            if (full["approval_status"] == "N" || full["approval_status"] == "C") {
                                return '<center><div class="btn-group">' +
                                    '<button type="button" ng-show="ShowEdit"   class="btn btn-info btn-sm"     ng-click="btn_edit_action2(' + row["row"] + ')"             data-toggle="tooltip" data-placement="top" title="Edit">                         <i class="fa fa-edit"></i></button >' +
                                    '<button type="button" ng-show="ShowDelete" class="btn btn-danger btn-sm"   ng-click="btn_del_row2(' + row["row"] + ')"                 data-toggle="tooltip" data-placement="top" title="Delete">                       <i class="fa fa-trash"></i></button>' +
                                    '<button type="button"                      class="btn btn-danger btn-sm"  ng-click="btn_withdraw_submission(' + row["row"] + ')"      data-toggle="tooltip" data-placement="top" title="Recall Submission" disabled>   <i class="fa fa-rotate-left"></i></button>' +
                                    //'<button type="button"                      class="btn btn-primary btn-sm"  ng-click="btn_copy_row1(' + row["row"] + ')"                data-toggle="tooltip" data-placement="top" title="Copy Schedule">                <i class="fa fa-copy"></i></button>' +
									
                                    '</div></center>';
                            }

                            else if (full["approval_status"] == "S") {
                                return '<center><div class="btn-group">' +
                                    '<button type="button" ng-show="ShowEdit"   class="btn btn-success btn-sm"  ng-click="btn_edit_action2(' + row["row"] + ')"             data-toggle="tooltip" data-placement="top" title="View">                         <i class="fa fa-eye"></i></button >' +
                                    '<button type="button" ng-show="ShowDelete" class="btn btn-danger btn-sm"   ng-click="btn_del_row2(' + row["row"] + ')"                 data-toggle="tooltip" data-placement="top" title="Delete" disabled>              <i class="fa fa-trash"></i></button>' +
                                    '<button type="button"                      class="btn btn-danger btn-sm"  ng-click="btn_withdraw_submission(' + row["row"] + ')"      data-toggle="tooltip" data-placement="top" title="Recall Submission">            <i class="fa fa-rotate-left"></i></button>' +
                                    //'<button type="button"                      class="btn btn-primary btn-sm"  ng-click="btn_copy_row1(' + row["row"] + ')"                data-toggle="tooltip" data-placement="top" title="Copy Schedule">                <i class="fa fa-copy"></i></button>' +
                                    '</div></center>';
                            }
                            else {
                                return '<center><div class="btn-group">' +
                                    '<button type="button" ng-show="ShowEdit"   class="btn btn-success btn-sm"  ng-click="btn_edit_action2(' + row["row"] + ')"             data-toggle="tooltip" data-placement="top" title="View">                         <i class="fa fa-eye"></i></button >' +
                                    '<button type="button" ng-show="ShowDelete" class="btn btn-danger btn-sm"   ng-click="btn_del_row2(' + row["row"] + ')"                 data-toggle="tooltip" data-placement="top" title="Delete" disabled>              <i class="fa fa-trash"></i></button>' +
                                    '<button type="button"                      class="btn btn-danger btn-sm"  ng-click="btn_withdraw_submission(' + row["row"] + ')"      data-toggle="tooltip" data-placement="top" title="Recall Submission" disabled>   <i class="fa fa-rotate-left"></i></button>' +
                                    //'<button type="button"                      class="btn btn-primary btn-sm"  ng-click="btn_copy_row1(' + row["row"] + ')"                data-toggle="tooltip" data-placement="top" title="Copy Schedule">                <i class="fa fa-copy"></i></button>' +
                                    '</div></center>';
                            }
                        }
                    }
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            });
    }

    //*********************************************//
    //*** Select Employee Name
    //********************************************// 
    s.SelectEmplName = function () {
        h.post("../cSSTimeSchedule/SelectEmplName", {
            par_empl_id: $('#ddl_name').val() == "" ? s.ddl_name : $('#ddl_name').val(),
            par_month: month_name_to_int($('#txtb_sched_monsyr').val()),
            par_year: str_to_year($('#txtb_sched_monsyr').val()),
            par_effective_date: $("#txtb_effective_date").val()
        }).then(function (d) {
            if (d.data.message == "success")
            {
           

                s.timeSchedLst = d.data.timeSchedLst;
               
                if (d.data.modalGridLst[0].approval_status == "N" ||
                    d.data.modalGridLst[0].approval_status == "") {
                    remove_class_colors();
                    $("#txtb_approval_status").removeClass("label-warning");
                    $("#txtb_approval_status").removeClass("label-danger");
                    $("#txtb_approval_status").removeClass("label-success");
                    $("#txtb_approval_status").removeClass("label-info");
                    $("#txtb_approval_status").addClass("label-primary");
                    s.dis_btn = false

                }
                else if (d.data.modalGridLst[0].approval_status == "1" ||
                    d.data.modalGridLst[0].approval_status == "2" ||
                    d.data.modalGridLst[0].approval_status == "F") {
                    remove_class_colors();
                    $("#txtb_approval_status").removeClass("label-warning");
                    $("#txtb_approval_status").removeClass("label-danger");
                    $("#txtb_approval_status").removeClass("label-primary");
                    $("#txtb_approval_status").removeClass("label-info");
                    $("#txtb_approval_status").addClass("label-success");
                    s.dis_btn = true
                }
                else if (d.data.modalGridLst[0].approval_status == "C") {
                    remove_class_colors();
                    $("#txtb_approval_status").removeClass("label-warning");
                    $("#txtb_approval_status").removeClass("label-primary");
                    $("#txtb_approval_status").removeClass("label-success");
                    $("#txtb_approval_status").removeClass("label-info");
                    $("#txtb_approval_status").addClass("label-danger");

                    var btn = document.getElementById('submit');
                    btn.innerHTML = '<i class = "fa fa-paper-plane"></i> Resubmit';
                    s.label_success_submit = "resubmitted";
                   s.dis_btn = false
                }
                else if (d.data.modalGridLst[0].approval_status == "D" ||
                    d.data.modalGridLst[0].approval_status == "L") {
                    remove_class_colors();
                    $("#txtb_approval_status").removeClass("label-warning");
                    $("#txtb_approval_status").removeClass("label-primary");
                    $("#txtb_approval_status").removeClass("label-success");
                    $("#txtb_approval_status").removeClass("label-info");
                    $("#txtb_approval_status").addClass("label-danger");
                    s.dis_btn = true
                }
                else if (d.data.modalGridLst[0].approval_status == "R") {
                    remove_class_colors();
                    $("#txtb_approval_status").removeClass("label-warning");
                    $("#txtb_approval_status").removeClass("label-primary");
                    $("#txtb_approval_status").removeClass("label-success");
                    $("#txtb_approval_status").removeClass("label-danger");
                    $("#txtb_approval_status").addClass("label-info");
                    s.dis_btn = true
                }
                else if (d.data.modalGridLst[0].approval_status == "S") {
                    remove_class_colors();
                    $("#txtb_approval_status").removeClass("label-primary");
                    $("#txtb_approval_status").removeClass("label-danger");
                    $("#txtb_approval_status").removeClass("label-success");
                    $("#txtb_approval_status").removeClass("label-info");
                    $("#txtb_approval_status").addClass("label-warning");
                    s.dis_btn = true
                }
                else {
                    s.label_success_submit = "submitted";
                }

                s.txtb_remarks = d.data.modalGridLst[0].remarks_details;

                s.last_day = s.datalistgrid2.length - 1;

                

                s.temp_curr_length = arr_datalist_grid2_data.length;
                arr_datalist_grid2_data = Array.from(d.data.modalGridLst);
                s.dum_modal_grid_length = arr_datalist_grid2_data.length;
                arr_datalist_grid2_data_del = Array.from(d.data.modalGridLst);

                $("#no_of_wrkng_hrs").text(d.data.no_of_wrkng_hrs);
                if (parseFloat($("#no_of_wrkng_hrs").html()) > parseFloat($("#no_of_wrkng_hrs_sched").html())) {
                    $('#no_of_wrkng_hrs_sched').addClass("red_font");
                    $('#hrs_lbl').addClass("red_font");
                }
                else {
                    $('#no_of_wrkng_hrs_sched').removeClass("red_font");
                    $('#hrs_lbl').removeClass("red_font");
                }
				
                

                s.oTable3.fnClearTable();
                s.datalistgrid3 = d.data.time_schedule_empl_hdr_tbl;
                if (d.data.time_schedule_empl_hdr_tbl.length > 0) {
                    s.oTable3.fnAddData(d.data.time_schedule_empl_hdr_tbl);
                }


                


                if (d.data.modalGridLst.length > 0) {
                    s.oTable1.fnClearTable();
                    s.datalistgrid2 = d.data.modalGridLst;

                    s.oTable1.fnAddData(s.datalistgrid2);
                    $("#txtb_approval_status").text(d.data.modalGridLst[0].approval_status_descr == "" || d.data.modalGridLst[0].approval_status_descr == null ? "New" : d.data.modalGridLst[0].approval_status_descr);
                   
                }
				var temp_shift_flag = "1"
				  if (s.datalistgrid3.select(s.datalistgrid3[vw_shift_flag].shift_flag, "shift_flag").shift_flag != "" || s.datalistgrid3.select(s.datalistgrid3[vw_shift_flag].shift_flag, "shift_flag").shift_flag != undefined || s.datalistgrid3.select(s.datalistgrid3[vw_shift_flag].shift_flag, "shift_flag").shift_flag != null) {
                    temp_shift_flag = s.datalistgrid3.select(s.datalistgrid3[vw_shift_flag].shift_flag, "shift_flag").shift_flag
                }
              

                $("#ddl_shift_sched").val(temp_shift_flag)
                s.ddl_shift_sched = temp_shift_flag

                s.pre_hrs_arr.fill("", 0, 31);
                s.post_hrs_arr.fill("", 0, 31);
                
            }
        });
    }

    Array.prototype.select = function (code, prop) {

        return this.filter(function (d) {
            return d[prop] == code
        })[0]


    }

    function remove_class_colors() {
        $("#txtb_approval_status").removeClass("text-success");
        $("#txtb_approval_status").removeClass("approved-bg");
        $("#txtb_approval_status").removeClass("cancel-bg");
        $("#txtb_approval_status").removeClass("disapproved-bg");
        $("#txtb_approval_status").removeClass("reviewed-bg");
        $("#txtb_approval_status").removeClass("submitted-bg");
        $("#txtb_approval_status").removeClass("new-bg");
    }

    function delete_edit(row_id) {
        //swal({
        //    title: "Are you sure you want to remove this schedule?",
        //    text: "",
        //    icon: "warning",
        //    buttons: true,
        //    dangerMode: true,

        //})
        //    .then(function (willDelete) {
                //if (willDelete) {
                    s.pre_hrs_arr[row_id] = "";
                    s.post_hrs_arr[row_id] = "";

                    var t = $('#datalist_grid2').DataTable();
                    var row_data = t.row(row_id).data();

                        if (row_data.ts_code != "") {
                            //if (row_data.ts_code == "37")
                            //{
                            //    s.datalistgrid2 = s.datalistgrid2.delete(row_id - 1)

                            //    s.datalistgrid2[row_id - 1].tse_in_am = ""
                            //    s.datalistgrid2[row_id - 1].tse_in_pm = ""
                            //    s.datalistgrid2[row_id - 1].tse_out_am = ""
                            //    s.datalistgrid2[row_id - 1].tse_out_pm = ""
                            //    s.datalistgrid2[row_id - 1].tse_day_parent = "98"
                            //    s.datalistgrid2[row_id - 1].tse_month = ""
                            //    s.datalistgrid2[row_id - 1].tse_year = ""
                            //    s.datalistgrid2[row_id - 1].ts_code = ""
                            //    s.datalistgrid2[row_id - 1].ts_descr = ""
                            //    s.datalistgrid2[row_id - 1].pre_time_in_hrs = "";
                            //    s.datalistgrid2[row_id - 1].post_time_out_hrs = "";
                            //    s.datalistgrid2[row_id - 1].ts_day_equivalent = "";

                            //    s.oTable1.fnClearTable();
                            //    if (s.datalistgrid2.length != 0) {
                            //        s.oTable1.fnAddData(s.datalistgrid2);
                            //    }
                            //}

                            //else {

                                h.post("../cSSTimeSchedule/SelectTimeSched", {
                                    par_ts_code: row_data.ts_code
                                }).then(function (d) {
                                    if (d.data.message == "success") {

                                        arr_datalist_grid2_data[row_id].tse_in_am = ""
                                        arr_datalist_grid2_data[row_id].tse_in_pm = ""
                                        arr_datalist_grid2_data[row_id].tse_out_am = ""
                                        arr_datalist_grid2_data[row_id].tse_out_pm = ""
                                        arr_datalist_grid2_data[row_id].tse_day_parent = "98"
                                        arr_datalist_grid2_data[row_id].tse_month = ""
                                        arr_datalist_grid2_data[row_id].tse_year = ""
                                        arr_datalist_grid2_data[row_id].ts_code = ""
                                        arr_datalist_grid2_data[row_id].ts_descr = ""
                                        arr_datalist_grid2_data[row_id].pre_time_in_hrs = "";
                                        arr_datalist_grid2_data[row_id].post_time_out_hrs = "";
                                        arr_datalist_grid2_data[row_id].ts_day_equivalent = "";

                                        s.datalistgrid2 = Array.from(arr_datalist_grid2_data);
                                        s.oTable1.fnClearTable();
                                        if (s.datalistgrid2.length != 0) {
                                            s.oTable1.fnAddData(s.datalistgrid2);
                                        }


                                        if (d.data.timeSchedData[0].ts_add_days > 0 && row_data.tse_date == d.data.timeSchedData[0].tse_date) {

                                            var counter = row_id + d.data.timeSchedData[0].ts_add_days;
                                            // for (var x = 0; x < d.data.timeSchedData[0].ts_add_days; x++) {


                                            if (d.data.timeSchedData[0].ts_add_days > 1) {
                                                for (var x = 0; x < d.data.timeSchedData[0].ts_add_days; x++) {
                                                    arr_datalist_grid2_data[row_id + x].tse_in_am = ""
                                                    arr_datalist_grid2_data[row_id + x].tse_in_pm = ""
                                                    arr_datalist_grid2_data[row_id + x].tse_out_am = ""
                                                    arr_datalist_grid2_data[row_id + x].tse_out_pm = ""
                                                    arr_datalist_grid2_data[row_id + x].tse_day_parent = "98"
                                                    arr_datalist_grid2_data[row_id + x].tse_month = ""
                                                    arr_datalist_grid2_data[row_id + x].tse_year = ""
                                                    arr_datalist_grid2_data[row_id + x].ts_code = ""
                                                    arr_datalist_grid2_data[row_id + x].ts_descr = ""
                                                    arr_datalist_grid2_data[row_id + x].pre_time_in_hrs = "";
                                                    arr_datalist_grid2_data[row_id + x].post_time_out_hrs = "";
                                                    arr_datalist_grid2_data[row_id + x].ts_day_equivalent = "";
                                                }
                                            }

                                            for (var x = 0; x < 1; x++) {
                                                arr_datalist_grid2_data.splice(counter, 1);
                                                s.datalistgrid2 = Array.from(arr_datalist_grid2_data);
                                                s.oTable1.fnClearTable();
                                                if (s.datalistgrid2.length != 0) {
                                                    s.oTable1.fnAddData(s.datalistgrid2);
                                                }
                                            }
                                        }
                                    }
                                });
                            //}


                      
                    }
                //}
            //});
    }

    //************************************// 
    //*** Open Edit Modal         
    //**********************************// 
    s.btn_edit_action1 = function (row_id) {
        s.edit_delete_row = row_id;
        delete_edit(row_id);
        clearentry1();
        s.temp_row = row_id;
        s.InnerModalTitle = "Time Schedule Setup";

        s.add_days_orig_edit = ""
        s.tse_date_orig_edit = ""
        s.tse_date_orig_edit = s.datalistgrid2[row_id].dtr_date_char
       
        if (s.datalistgrid2[row_id].ts_code != "98") {
            s.ddl_time_sched = s.datalistgrid2[row_id].ts_code;
            $("#ddl_time_sched").val(s.datalistgrid2[row_id].ts_code);

            h.post("../cSSTimeSchedule/SelectTimeSched", {
                par_ts_code: s.ddl_time_sched
            }).then(function (d) {
                if (d.data.message == "success") {
                    s.timeSchedLst = d.data.timeSchedLst;

                    if (d.data.timeSchedData.length > 0) {

                        s.add_days_orig_edit = d.data.timeSchedData[0].ts_add_days;
                      

                        s.txtb_nbr_days = d.data.timeSchedData[0].ts_add_days;
                        s.txtb_am_in = d.data.timeSchedData[0].ts_am_in;
                        s.txtb_pm_in = d.data.timeSchedData[0].ts_pm_in;
                        s.txtb_am_out = d.data.timeSchedData[0].ts_am_out;
                        s.txtb_pm_out = d.data.timeSchedData[0].ts_pm_out;
                        s.txtb_days_equiv = d.data.timeSchedData[0].ts_day_equivalent;

                        $("#txtb_pre_time_in_hrs").val(RemovePMAM2(s.datalistgrid2[row_id].pre_time_in_hrs, "txtb_pre_time_in_hrs"));
                        $("#txtb_post_time_out_hrs").val(RemovePMAM2(s.datalistgrid2[row_id].post_time_out_hrs, "txtb_post_time_out_hrs"));
                    }
                }
            });
        }
        else {
            s.ddl_time_sched = "";
            $("#ddl_time_sched").val("");
        }
        $('#inner_modal').modal({ backdrop: 'static', keyboard: false });
    }

    s.btn_save_click = function () {
        //if (ValidateFields2()) {
     
        var btn_save = document.getElementById('addFinal');
        btn_save.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Saving';
        s.dis_btn = true;
        var ischeckTime = false
        var no_of_work_hours = parseFloat($("#no_of_wrkng_hrs").html())
        var no_work_sched = parseFloat($("#no_of_wrkng_hrs_sched").html())
        if (no_of_work_hours > no_work_sched)
        {
            
            ischeckTime = false
        }
        else 
        {
            
            ischeckTime = true
        }


     

        if (ischeckTime == false) {
            swal({
                title: "Work hours should be greater than hours rendered are you sure to continue with this schedule?",
                text: "",
                icon: "warning",
                buttons: true,
                dangerMode: true,

            })
                .then(function (willDelete) {
                    if (willDelete) {
                        
                        ischeckTime = true

                        if (ischeckTime == true) {
                            h.post("../cSSTimeSchedule/CheckExist",
                                {
                                    par_empl_id: $('#ddl_name option:selected').val() == "" ? s.ddl_name : $('#ddl_name option:selected').val()
                                    , tse_ctrl_no: s.datalistgrid2[1].tse_ctrl_no
                                    , tse_effective_date: $("#txtb_effective_date").val()
                                }).then(function (d) {

                                    if (d.data.message == "true") {
                                        var data = {
                                            tse_effective_date: $("#txtb_effective_date").val()
                                            , tse_month: month_name_to_int($('#txtb_sched_monsyr').val())
                                            , tse_year: str_to_year($('#txtb_sched_monsyr').val())
                                            , shift_flag: $('#ddl_shift_sched').val()
                                            ,tse_ctrl_no: s.datalistgrid2[1].tse_ctrl_no
                                        }

                                       
                                       
                                        for (var x = 0; x < s.datalistgrid2.length; x++) {
                                            arr_datalist_grid2_data_save[x] = {
                                                "tse_date": s.datalistgrid2[x].dtr_date_char
                                                , "empl_id": s.datalistgrid2[x].empl_id
                                                , "tse_day_parent": s.datalistgrid2[x].tse_day_parent
                                                , "tse_in_am" : s.datalistgrid2[x].tse_in_am
                                                , "tse_out_am": s.datalistgrid2[x].tse_out_am
                                                , "tse_in_pm": convert_time_to_24hr2(s.datalistgrid2[x].tse_in_pm).slice(0, 5)
                                                , "tse_out_pm": convert_time_to_24hr2(s.datalistgrid2[x].tse_out_pm).slice(0, 5)
                                                , "tse_month": month_name_to_int($('#txtb_sched_monsyr').val())
                                                , "tse_year": str_to_year($('#txtb_sched_monsyr').val())
                                                , "ts_code": s.datalistgrid2[x].ts_code
                                                , "pre_time_in_hrs": convert_time_to_24hr(s.datalistgrid2[x].pre_time_in_hrs).slice(0, 5)
                                                , "post_time_out_hrs": convert_time_to_24hr(s.datalistgrid2[x].post_time_out_hrs).slice(0, 5)
                                            }
                                        }

                                      

                                        h.post("../cSSTimeSchedule/Save", {
                                            data: data
                                            , data2: arr_datalist_grid2_data_save
                                        }).then(function (d) {
                                            if (d.data.message == "success") {
                                                $("#main_modal").modal("hide");
                                                swal("Your record has been saved!", { icon: "success", });
                                                s.SelectEmplName();

                                                btn_save.innerHTML = '<i class="fa fa-save"> </i> Save';
                                                s.dis_btn = false;
                                            }
                                            else {
                                                console.log("Error: " + d.data.message)
                                                btn_save.innerHTML = '<i class="fa fa-save"> </i> Save';
                                                s.dis_btn = false;
                                            }
                                        });
                                    }
                                    else if (d.data.message == "false") {
                                        var data = {
                                            shift_flag: $('#ddl_shift_sched').val()
                                        }
                                       

                                        for (var x = 0; x < s.datalistgrid2.length; x++) {
                                            arr_datalist_grid2_data_save[x] = {
                                                "tse_date": s.datalistgrid2[x].dtr_date_char
                                                , "empl_id": s.datalistgrid2[x].empl_id
                                                , "tse_day_parent": s.datalistgrid2[x].tse_day_parent
                                                , "tse_in_am": s.datalistgrid2[x].tse_in_am
                                                , "tse_out_am": s.datalistgrid2[x].tse_out_am
                                                , "tse_in_pm": convert_time_to_24hr2(s.datalistgrid2[x].tse_in_pm).slice(0, 5)
                                                , "tse_out_pm": convert_time_to_24hr2(s.datalistgrid2[x].tse_out_pm).slice(0, 5)
                                                , "tse_month": month_name_to_int($('#txtb_sched_monsyr').val())
                                                , "tse_year": str_to_year($('#txtb_sched_monsyr').val())
                                                , "ts_code": s.datalistgrid2[x].ts_code
                                                , "pre_time_in_hrs": convert_time_to_24hr(s.datalistgrid2[x].pre_time_in_hrs).slice(0, 5)
                                                , "post_time_out_hrs": convert_time_to_24hr(s.datalistgrid2[x].post_time_out_hrs).slice(0, 5)
                                            }
                                        }

                                        h.post("../cSSTimeSchedule/SaveEdit", {
                                            data: data
                                            , data2: arr_datalist_grid2_data_save
                                            , tse_ctrl_no: s.datalistgrid2[1].tse_ctrl_no
                                        }).then(function (d) {
                                            if (d.data.message == "success") {
                                                $("#main_modal").modal("hide");
                                                swal("Your record has been updated!", { icon: "success", });
                                                //s.SelectEmplName();
                                                btn_save.innerHTML = '<i class="fa fa-save"> </i> Save';
                                                s.dis_btn = false;
                                            }
                                            else {
                                                console.log("Error: " + d.data.message)
                                                btn_save.innerHTML = '<i class="fa fa-save"> </i> Save';
                                                s.dis_btn = false;
                                            }
                                        });
                                    }
                                    else {
                                        btn_save.innerHTML = '<i class="fa fa-save"> </i> Save';
                                        s.dis_btn = false;
                                        swal("Error", { icon: "warning", });
                                    }
                                });
                        }

                    }


                    else {

                        btn_save.innerHTML = '<i class="fa fa-save"> </i> Save';
                        s.dis_btn = false;

                    }
                });
        }
		
		 else if (ischeckTime == true) 
		 {
                            h.post("../cSSTimeSchedule/CheckExist",
                                {
                                    par_empl_id: $('#ddl_name option:selected').val() == "" ? s.ddl_name : $('#ddl_name option:selected').val()
                                    , tse_ctrl_no: s.datalistgrid2[0].tse_ctrl_no
                                    , tse_effective_date: $("#txtb_effective_date").val()
                                }).then(function (d) {

                                    if (d.data.message == "true") {
                                        var data = {
                                            tse_effective_date: $("#txtb_effective_date").val()
                                            , tse_month: month_name_to_int($('#txtb_sched_monsyr').val())
                                            , tse_year: str_to_year($('#txtb_sched_monsyr').val())
                                            , shift_flag: $('#ddl_shift_sched').val()
                                        }


                                        for (var x = 0; x < arr_datalist_grid2_data.length; x++) {
                                            arr_datalist_grid2_data_save[x] = {
                                                "tse_date": arr_datalist_grid2_data[x].dtr_date_char
                                                , "empl_id": arr_datalist_grid2_data[x].empl_id
                                                , "tse_day_parent": arr_datalist_grid2_data[x].tse_day_parent
                                                , "tse_in_am": arr_datalist_grid2_data[x].tse_in_am
                                                , "tse_out_am": arr_datalist_grid2_data[x].tse_out_am
                                                , "tse_in_pm": convert_time_to_24hr2(arr_datalist_grid2_data[x].tse_in_pm).slice(0, 5)
                                                , "tse_out_pm": convert_time_to_24hr2(arr_datalist_grid2_data[x].tse_out_pm).slice(0, 5)
                                                , "tse_month": arr_datalist_grid2_data[x].tse_month
                                                , "tse_year": arr_datalist_grid2_data[x].tse_year
                                                , "ts_code": arr_datalist_grid2_data[x].ts_code
                                                , "pre_time_in_hrs": convert_time_to_24hr(arr_datalist_grid2_data[x].pre_time_in_hrs).slice(0, 5)
                                                , "post_time_out_hrs": convert_time_to_24hr(arr_datalist_grid2_data[x].post_time_out_hrs).slice(0, 5)
                                            }
                                        }

                                        h.post("../cSSTimeSchedule/Save", {
                                            data: data
                                            , data2: arr_datalist_grid2_data_save
                                        }).then(function (d) {
                                            if (d.data.message == "success") {
                                                $("#main_modal").modal("hide");
                                                swal("Your record has been saved!", { icon: "success", });
                                                s.SelectEmplName();

                                                btn_save.innerHTML = '<i class="fa fa-save"> </i> Save';
                                                s.dis_btn = false;
                                            }
                                            else {
                                                console.log("Error: " + d.data.message)
                                                btn_save.innerHTML = '<i class="fa fa-save"> </i> Save';
                                                s.dis_btn = false;
                                            }
                                        });
                                    }
                                    else if (d.data.message == "false") {
                                        var data = {
                                            shift_flag: $('#ddl_shift_sched').val()
                                        }
                                        arr_datalist_grid2_data_save = [];

                                        for (var x = 0; x < arr_datalist_grid2_data.length; x++) {
                                            arr_datalist_grid2_data_save[x] = {
                                                "tse_date": arr_datalist_grid2_data[x].dtr_date_char
                                                , "empl_id": arr_datalist_grid2_data[x].empl_id
                                                , "tse_day_parent": arr_datalist_grid2_data[x].tse_day_parent
                                                , "tse_in_am": arr_datalist_grid2_data[x].tse_in_am
                                                , "tse_out_am": arr_datalist_grid2_data[x].tse_out_am
                                                , "tse_in_pm": convert_time_to_24hr2(arr_datalist_grid2_data[x].tse_in_pm).slice(0, 5)
                                                , "tse_out_pm": convert_time_to_24hr2(arr_datalist_grid2_data[x].tse_out_pm).slice(0, 5)
                                                , "tse_month": arr_datalist_grid2_data[x].tse_month
                                                , "tse_year": arr_datalist_grid2_data[x].tse_year
                                                , "ts_code": arr_datalist_grid2_data[x].ts_code
                                                , "pre_time_in_hrs": convert_time_to_24hr(arr_datalist_grid2_data[x].pre_time_in_hrs).slice(0, 5)
                                                , "post_time_out_hrs": convert_time_to_24hr(arr_datalist_grid2_data[x].post_time_out_hrs).slice(0, 5)
                                            }
                                        }

                                        h.post("../cSSTimeSchedule/SaveEdit", {
                                            data: data
                                            , data2: arr_datalist_grid2_data_save
                                            , tse_ctrl_no: s.datalistgrid2[0].tse_ctrl_no
                                        }).then(function (d) {
                                            if (d.data.message == "success") {
                                                $("#main_modal").modal("hide");
                                                swal("Your record has been updated!", { icon: "success", });
                                                //s.SelectEmplName();
                                                btn_save.innerHTML = '<i class="fa fa-save"> </i> Save';
                                                s.dis_btn = false;
                                            }
                                            else {
                                                console.log("Error: " + d.data.message)
                                                btn_save.innerHTML = '<i class="fa fa-save"> </i> Save';
                                                s.dis_btn = false;
                                            }
                                        });
                                    }
                                    else {
                                        btn_save.innerHTML = '<i class="fa fa-save"> </i> Save';
                                        s.dis_btn = false;
                                        swal("Error", { icon: "warning", });
                                    }
                                });
                        }
       
       

       
        //}
    }

    //************************************// 
    //*** Save New Record              
    //**********************************// 
    s.btn_save_click1 = function () {
        var temp_row1 = s.temp_row

        //if (arr_datalist_grid2_data[s.temp_row].ts_code != "98") {
        
        //    console.log(temp_row1)
        //    //alert("AWWW")
        //    s.btn_del_row1_edit(temp_row1)
        //}



        //
        if (ValidateFields3())
        {
           

           
            var t = $('#datalist_grid2').DataTable();
            var row_data = t.row(s.temp_row).data();
            console.log(s.datalistgrid2)

            var objIndex = s.temp_row;
            arr_datalist_grid2_data[objIndex].tse_in_am = "";
            arr_datalist_grid2_data[objIndex].tse_in_pm = "";
            arr_datalist_grid2_data[objIndex].tse_out_am = "";
            arr_datalist_grid2_data[objIndex].tse_out_pm = "";
           
            //if ($('#ddl_time_sched option:selected').val() == '37') //12AM - 8AM
            //{
            //    if (objIndex == 0)
            //    {
                  
            //            var month_now = new Date(str_to_year($('#txtb_sched_monsyr').val()) + '-' + month_name_to_int($('#txtb_sched_monsyr').val()) + '-01');
            //            month_now.setDate(month_now.getDate() - 1)
            //            var dataADD =
            //            {
            //                approval_status: "N"
            //                , approval_status_descr: "New"
            //                , day_nbr: moment(month_now).format("DD").toString()
            //                , day_of_week: moment(month_now).format("dddd").toString() == "Thursday" ? "Th" : moment(month_now).format("dddd").toString().charAt(0)
            //                , day_type: ""
            //                , dtr_date: moment(month_now).format("YYYY-MM-DD").toString()
            //                , dtr_date_char: moment(month_now).format("YYYY-MM-DD").toString()
            //                , empl_id: $("#ddl_name").val()
            //                , post_time_out_hrs: ""
            //                , pre_time_in_hrs: ""
            //                , remarks_details: ""
            //                , ts_code: $('#ddl_time_sched option:selected').val()
            //                , ts_day_equivalent: ""
            //                , ts_descr: ""
            //                , tse_ctrl_no: ""
            //                , tse_day_parent: "01"
            //                , tse_in_am: ""
            //                , tse_in_pm: "11:59"
            //                , tse_month: month_name_to_int($('#txtb_sched_monsyr').val())
            //                , tse_out_am: ""
            //                , tse_out_pm: ""
            //                , tse_year: str_to_year($('#txtb_sched_monsyr').val())

            //            }

            //            s.datalistgrid2[objIndex].tse_out_am = s.txtb_am_out;
            //            s.datalistgrid2[objIndex].ts_code = $('#ddl_time_sched option:selected').val();
            //            s.datalistgrid2[objIndex].ts_descr = $('#ddl_time_sched option:selected').html();
            //            //s.datalistgrid2 = s.datalistgrid2.push(dataADD)

            //            s.datalistgrid2.splice(0, 0, dataADD);


            //            s.oTable1.fnClearTable();
            //            if (s.datalistgrid2.length != 0) {
            //                s.oTable1.fnAddData(s.datalistgrid2);
            //            }

            //            $("#inner_modal").modal("hide");
              


            //    }

              
            //}
                

            
                if (s.txtb_nbr_days == 0) {                                                                 // NO. OF DAYS IS EQUAL TO 0
               
               
               
                arr_datalist_grid2_data[objIndex].tse_in_am = s.txtb_am_in;
                arr_datalist_grid2_data[objIndex].tse_in_pm = s.txtb_pm_in;
                arr_datalist_grid2_data[objIndex].tse_out_am = s.txtb_am_out;
                arr_datalist_grid2_data[objIndex].tse_out_pm = s.txtb_pm_out;
                arr_datalist_grid2_data[objIndex].tse_day_parent = row_data.day_nbr;
                arr_datalist_grid2_data[objIndex].tse_month = month_name_to_int($('#txtb_sched_monsyr').val());
                arr_datalist_grid2_data[objIndex].tse_year = str_to_year($('#txtb_sched_monsyr').val());
                arr_datalist_grid2_data[objIndex].ts_code = $('#ddl_time_sched option:selected').val();
                arr_datalist_grid2_data[objIndex].ts_descr = $('#ddl_time_sched option:selected').html();
                arr_datalist_grid2_data[objIndex].pre_time_in_hrs = $('#txtb_pre_time_in_hrs').val() + " " + ($('#txtb_pre_time_in_hrs').val() != "" ? $("#pre_time_in_hrs_tt option:selected").val() : "")
                arr_datalist_grid2_data[objIndex].post_time_out_hrs = $('#txtb_post_time_out_hrs').val() + " " + ($('#txtb_post_time_out_hrs').val() != "" ? $("#post_time_out_hrs_tt option:selected").val() : "")
                arr_datalist_grid2_data[objIndex].ts_day_equivalent = s.txtb_days_equiv;

                s.pre_hrs_arr[objIndex] = time_diff_minutes(s.txtb_am_in, $('#txtb_pre_time_in_hrs').val());
                s.post_hrs_arr[objIndex] = time_diff_minutes(s.txtb_pm_out, $('#txtb_post_time_out_hrs').val());


                //arr_datalist_grid2_data.splice(counter, 1);
                //LAST


            
                s.datalistgrid2 = Array.from(arr_datalist_grid2_data);
                s.oTable1.fnClearTable();
                if (s.datalistgrid2.length != 0) {
                    s.oTable1.fnAddData(s.datalistgrid2);
                }
                

                $("#inner_modal").modal("hide");
            }
            else {

                $("#inner_modal").modal("hide");
                var next_row_counter = s.temp_row + 1;
                var next_row_data = t.row(next_row_counter).data();
                var temp_var_holdr = next_row_counter;
                var tc = next_row_counter;
                var counter = 0
			
                for (var i = s.temp_row; i < arr_datalist_grid2_data.length; i++) {
                    counter++;
                }
                counter--;
				
                if (s.temp_row == (arr_datalist_grid2_data.length - 1)) {
                    s.flag = "insert"
                }
                else {
                    if (s.txtb_nbr_days <= counter) {
                        for (var y = 0; y < s.txtb_nbr_days; y++) {
                            var temp_var = t.row(tc).data();
                            if (temp_var.tse_day_parent != "98") {
                                swal("Selected time schedule needs " + s.txtb_nbr_days + " rows. Next row schedule has been set. Try deleting the set schedule of the next row.", { icon: "warning", title: "Unable To Add Data", });
                                s.flag = "dont"
                            }
                            else if (temp_var.tse_day_parent == "98" && y == (s.txtb_nbr_days - 1)) {
                                s.flag = "insert"
                            }
                            tc++;
                        }
                    }
                    else {
                        s.flag = "insert"
                    }
                }
				
                if (s.flag == "insert") {
					
                    if (s.txtb_nbr_days <= counter) {
                        var objIndex = s.temp_row;
                        arr_datalist_grid2_data[objIndex].tse_in_am = s.txtb_am_in;
                        arr_datalist_grid2_data[objIndex].tse_in_pm = s.txtb_pm_in;
                        arr_datalist_grid2_data[objIndex].ts_descr = $('#ddl_time_sched option:selected').html();
                        arr_datalist_grid2_data[objIndex].ts_code = $('#ddl_time_sched option:selected').val();
                        arr_datalist_grid2_data[objIndex].ts_day_equivalent = s.txtb_days_equiv;
                        arr_datalist_grid2_data[objIndex].pre_time_in_hrs = $('#txtb_pre_time_in_hrs').val() + " " + ($('#txtb_pre_time_in_hrs').val() != "" ? $("#pre_time_in_hrs_tt option:selected").val() : "")
                        arr_datalist_grid2_data[objIndex].post_time_out_hrs = $('#txtb_post_time_out_hrs').val() + " " + ($('#txtb_post_time_out_hrs').val() != "" ? $("#post_time_out_hrs_tt option:selected").val() : "")
                        arr_datalist_grid2_data[objIndex].tse_day_parent = arr_datalist_grid2_data[objIndex].day_nbr
                        arr_datalist_grid2_data[objIndex].tse_month = month_name_to_int($('#txtb_sched_monsyr').val());
                        arr_datalist_grid2_data[objIndex].tse_year = str_to_year($('#txtb_sched_monsyr').val());

                        s.pre_hrs_arr[objIndex] = time_diff_minutes(s.txtb_am_in, $('#txtb_pre_time_in_hrs').val());
                        s.post_hrs_arr[objIndex] = time_diff_minutes(s.txtb_pm_out, $('#txtb_post_time_out_hrs').val());
						var next_rows = s.temp_row + s.txtb_nbr_days;
                        var last_rows = s.temp_row + s.txtb_nbr_days;
						
						if (s.txtb_nbr_days >= 2) //FOR MORE THAN 2 DAYS SHIFT
						{
							for (var x = (s.temp_row + 1); x <= next_rows; x++) {
                            var data = [];
                            if (x == next_rows) {
                                data = {
                                    approval_status: arr_datalist_grid2_data[last_rows-1].approval_status
                                    , approval_status_descr: arr_datalist_grid2_data[last_rows-1].approval_status
                                    , day_nbr: arr_datalist_grid2_data[last_rows-1].day_nbr
                                    , day_of_week: arr_datalist_grid2_data[last_rows-1].day_of_week
                                    , day_type: arr_datalist_grid2_data[last_rows-1].day_type
                                    , dtr_date: arr_datalist_grid2_data[last_rows-1].dtr_date
                                    , dtr_date_char: arr_datalist_grid2_data[last_rows-1].dtr_date_char
                                    , empl_id: arr_datalist_grid2_data[last_rows-1].empl_id
                                    , post_time_out_hrs: arr_datalist_grid2_data[last_rows-1].post_time_out_hrs
                                    , pre_time_in_hrs: arr_datalist_grid2_data[last_rows-1].pre_time_in_hrs
                                    , remarks_details: arr_datalist_grid2_data[last_rows-1].remarks_details
                                    , ts_code: $('#ddl_time_sched option:selected').val()
                                    , ts_day_equivalent: arr_datalist_grid2_data[last_rows-1].ts_day_equivalent
                                    , ts_descr: arr_datalist_grid2_data[last_rows-1].ts_descr
                                    , tse_ctrl_no: arr_datalist_grid2_data[last_rows-1].tse_ctrl_no
                                    , tse_day_parent: arr_datalist_grid2_data[objIndex].day_nbr
                                    , tse_in_am: arr_datalist_grid2_data[last_rows-1].tse_in_am
                                    , tse_in_pm: arr_datalist_grid2_data[last_rows-1].tse_in_pm
                                    , tse_month: arr_datalist_grid2_data[last_rows-1].tse_month
                                    , tse_out_am: s.txtb_am_out
                                    , tse_out_pm: s.txtb_pm_out
                                    , tse_year: arr_datalist_grid2_data[last_rows-1].tse_year
                                }
								
                            }
                            else {
                                data = {
                                    approval_status: arr_datalist_grid2_data[x].approval_status
                                    , approval_status_descr: arr_datalist_grid2_data[x].approval_status
                                    , day_nbr: arr_datalist_grid2_data[x].day_nbr
                                    , day_of_week: arr_datalist_grid2_data[x].day_of_week
                                    , day_type: arr_datalist_grid2_data[x].day_type
                                    , dtr_date: arr_datalist_grid2_data[x].dtr_date
                                    , dtr_date_char: arr_datalist_grid2_data[x].dtr_date_char
                                    , empl_id: arr_datalist_grid2_data[x].empl_id
                                    , post_time_out_hrs: arr_datalist_grid2_data[x].post_time_out_hrs
                                    , pre_time_in_hrs: arr_datalist_grid2_data[x].pre_time_in_hrs
                                    , remarks_details: arr_datalist_grid2_data[x].remarks_details
                                    , ts_code: $('#ddl_time_sched option:selected').val()
                                    , ts_day_equivalent: arr_datalist_grid2_data[x].ts_day_equivalent
                                    , ts_descr: arr_datalist_grid2_data[x].ts_descr
                                    , tse_ctrl_no: arr_datalist_grid2_data[x].tse_ctrl_no
                                    , tse_day_parent: arr_datalist_grid2_data[objIndex].day_nbr
                                    , tse_in_am: arr_datalist_grid2_data[x].tse_in_am
                                    , tse_in_pm: arr_datalist_grid2_data[x].tse_in_pm
                                    , tse_month: arr_datalist_grid2_data[x].tse_month
                                    , tse_out_am: ""
                                    , tse_out_pm: ""
                                    , tse_year: arr_datalist_grid2_data[x].tse_year
                                }
                                last_rows++;
								
						
                            }
							if( x != next_rows){
								
								arr_datalist_grid2_data.splice(x, 1, data);
							}
							
							else{
								arr_datalist_grid2_data.splice(x, 0, data);
								
							}
								
                           
                        }
							
						}
						
						else 
						{
							
							 for (var x = (s.temp_row + 1); x <= next_rows; x++) {
								var data = [];
								if (x == next_rows) {
									data = {
										approval_status: arr_datalist_grid2_data[last_rows].approval_status
										, approval_status_descr: arr_datalist_grid2_data[last_rows].approval_status
										, day_nbr: arr_datalist_grid2_data[last_rows].day_nbr
										, day_of_week: arr_datalist_grid2_data[last_rows].day_of_week
										, day_type: arr_datalist_grid2_data[last_rows].day_type
										, dtr_date: arr_datalist_grid2_data[last_rows].dtr_date
										, dtr_date_char: arr_datalist_grid2_data[last_rows].dtr_date_char
										, empl_id: arr_datalist_grid2_data[last_rows].empl_id
										, post_time_out_hrs: arr_datalist_grid2_data[last_rows].post_time_out_hrs
										, pre_time_in_hrs: arr_datalist_grid2_data[last_rows].pre_time_in_hrs
										, remarks_details: arr_datalist_grid2_data[last_rows].remarks_details
										, ts_code: $('#ddl_time_sched option:selected').val()
										, ts_day_equivalent: arr_datalist_grid2_data[last_rows].ts_day_equivalent
										, ts_descr: arr_datalist_grid2_data[last_rows].ts_descr
										, tse_ctrl_no: arr_datalist_grid2_data[last_rows].tse_ctrl_no
										, tse_day_parent: arr_datalist_grid2_data[objIndex].day_nbr
										, tse_in_am: arr_datalist_grid2_data[last_rows].tse_in_am
										, tse_in_pm: arr_datalist_grid2_data[last_rows].tse_in_pm
										, tse_month: arr_datalist_grid2_data[last_rows].tse_month
										, tse_out_am: s.txtb_am_out
										, tse_out_pm: s.txtb_pm_out
										, tse_year: arr_datalist_grid2_data[last_rows].tse_year
									}
								}
								else {
									data = {
										approval_status: arr_datalist_grid2_data[x].approval_status
										, approval_status_descr: arr_datalist_grid2_data[x].approval_status
										, day_nbr: arr_datalist_grid2_data[x].day_nbr
										, day_of_week: arr_datalist_grid2_data[x].day_of_week
										, day_type: arr_datalist_grid2_data[x].day_type
										, dtr_date: arr_datalist_grid2_data[x].dtr_date
										, dtr_date_char: arr_datalist_grid2_data[x].dtr_date_char
										, empl_id: arr_datalist_grid2_data[x].empl_id
										, post_time_out_hrs: arr_datalist_grid2_data[x].post_time_out_hrs
										, pre_time_in_hrs: arr_datalist_grid2_data[x].pre_time_in_hrs
										, remarks_details: arr_datalist_grid2_data[x].remarks_details
										, ts_code: $('#ddl_time_sched option:selected').val()
										, ts_day_equivalent: arr_datalist_grid2_data[x].ts_day_equivalent
										, ts_descr: arr_datalist_grid2_data[x].ts_descr
										, tse_ctrl_no: arr_datalist_grid2_data[x].tse_ctrl_no
										, tse_day_parent: arr_datalist_grid2_data[objIndex].day_nbr
										, tse_in_am: arr_datalist_grid2_data[x].tse_in_am
										, tse_in_pm: arr_datalist_grid2_data[x].tse_in_pm
										, tse_month: arr_datalist_grid2_data[x].tse_month
										, tse_out_am: ""
										, tse_out_pm: ""
										, tse_year: arr_datalist_grid2_data[x].tse_year
									}
									last_rows++;
								}

								arr_datalist_grid2_data.splice(x, 0, data);
							}
							
						}
                     
                        

                        s.datalistgrid2 = Array.from(arr_datalist_grid2_data);
                        s.oTable1.fnClearTable();
                        if (s.datalistgrid2.length != 0) {
                            s.oTable1.fnAddData(s.datalistgrid2);
                        }

                    }
                    else {

                        var objIndex = s.temp_row;
                        arr_datalist_grid2_data[objIndex].tse_in_am = s.txtb_am_in;
                        arr_datalist_grid2_data[objIndex].tse_in_pm = s.txtb_pm_in;
                        arr_datalist_grid2_data[objIndex].ts_descr = $('#ddl_time_sched option:selected').html();
                        arr_datalist_grid2_data[objIndex].ts_code = $('#ddl_time_sched option:selected').val();
						
						if(s.txtb_am_out == "07:00")
						{
							
							arr_datalist_grid2_data[objIndex].ts_day_equivalent = 0.625 ; //ADDED BY JORGE 2022-03-14
							
						}
						else{
							
                        arr_datalist_grid2_data[objIndex].ts_day_equivalent =  s.txtb_days_equiv ; //ADDED BY JORGE 2022-03-14
						}
						
                        arr_datalist_grid2_data[objIndex].pre_time_in_hrs = $('#txtb_pre_time_in_hrs').val() + " " + ($('#txtb_pre_time_in_hrs').val() != "" ? $("#pre_time_in_hrs_tt option:selected").val() : "")
                        arr_datalist_grid2_data[objIndex].post_time_out_hrs = $('#txtb_post_time_out_hrs').val() + " " + ($('#txtb_post_time_out_hrs').val() != "" ? $("#post_time_out_hrs_tt option:selected").val() : "")
                        arr_datalist_grid2_data[objIndex].tse_day_parent = arr_datalist_grid2_data[objIndex].day_nbr
                        arr_datalist_grid2_data[objIndex].tse_month = month_name_to_int($('#txtb_sched_monsyr').val());
                        arr_datalist_grid2_data[objIndex].tse_year = str_to_year($('#txtb_sched_monsyr').val());


                        s.pre_hrs_arr[objIndex] = time_diff_minutes(s.txtb_am_in, $('#txtb_pre_time_in_hrs').val());
                        s.post_hrs_arr[objIndex] = time_diff_minutes(s.txtb_pm_out, $('#txtb_post_time_out_hrs').val());

                        var month_now = new Date(str_to_year($('#txtb_sched_monsyr').val()) + '-' + month_name_to_int($('#txtb_sched_monsyr').val()) + '-01');
                        var next_day = new Date(month_now.getFullYear(), month_now.getMonth() + 1, 1);
                        var next_rows = s.temp_row + s.txtb_nbr_days;
						
                        var day = next_day;
						
                        for (var x = (s.temp_row + 1); x <= next_rows; x++) {
                            var data = [];
                            if (x == next_rows) {
                                data = {
                                    approval_status: ""
                                    , approval_status_descr: ""
                                    , day_nbr: moment(day).format("DD").toString()
                                    , day_of_week: moment(day).format("dddd").toString() == "Thursday" ? "Th" : moment(day).format("dddd").toString().charAt(0)
                                    , day_type: ""
                                    , dtr_date: moment(day).format("YYYY-MM-DD").toString()
                                    , dtr_date_char: moment(day).format("YYYY-MM-DD").toString()
                                    , empl_id: arr_datalist_grid2_data[objIndex].empl_id
                                    , post_time_out_hrs: ""
                                    , pre_time_in_hrs: ""
                                    , remarks_details: ""
                                    , ts_code: ""
                                    , ts_day_equivalent: ""
                                    , ts_descr: ""
                                    , tse_ctrl_no: ""
                                    , tse_day_parent: arr_datalist_grid2_data[objIndex].day_nbr
                                    , tse_in_am: ""
                                    , tse_in_pm: ""
                                    , tse_month: arr_datalist_grid2_data[objIndex].tse_month
                                    , tse_out_am: s.txtb_am_out
                                    , tse_out_pm: s.txtb_pm_out
                                    , tse_year: arr_datalist_grid2_data[objIndex].tse_year
                                }
                            }
                            else {
                                data = {
                                    approval_status: ""
                                    , approval_status_descr: ""
                                    , day_nbr: moment(day).format("DD").toString()
                                    , day_of_week: moment(day).format("dddd").toString() == "Thursday" ? "Th" : moment(day).format("dddd").toString().charAt(0)
                                    , day_type: ""
                                    , dtr_date: moment(day).format("YYYY-MM-DD").toString()
                                    , dtr_date_char: moment(day).format("YYYY-MM-DD").toString()
                                    , empl_id: arr_datalist_grid2_data[objIndex].empl_id
                                    , post_time_out_hrs: ""
                                    , pre_time_in_hrs: ""
                                    , remarks_details: ""
                                    , ts_code: ""
                                    , ts_day_equivalent: ""
                                    , ts_descr: ""
                                    , tse_ctrl_no: ""
                                    , tse_day_parent: arr_datalist_grid2_data[objIndex].day_nbr
                                    , tse_in_am: ""
                                    , tse_in_pm: ""
                                    , tse_month: arr_datalist_grid2_data[objIndex].tse_month
                                    , tse_out_am: ""
                                    , tse_out_pm: ""
                                    , tse_year: arr_datalist_grid2_data[objIndex].tse_year
                                }
                            }
                            arr_datalist_grid2_data.splice(x, 0, data);
                            day.setDate(day.getDate() + 1);
                        }

                        s.datalistgrid2 = Array.from(arr_datalist_grid2_data);
                        s.oTable1.fnClearTable();
                        if (s.datalistgrid2.length != 0) {
                            s.oTable1.fnAddData(s.datalistgrid2);
                        }
                    }
                }
            }

        }
    }

    //************************************// 
    //*** Delete Row              
    //**********************************// 
    s.btn_auto_no_duty = function () {
        swal({
            title: "Are you sure you want to set this schedule into no duty?",
            text: "",
            icon: "warning",
            buttons: true,
            dangerMode: true,

        })
            .then(function (willDelete) {
                if (willDelete) {

                    $("#ddl_shift_sched").val("2")
                    s.ddl_shift_sched = "2"
                    for (var x = 0; x < s.datalistgrid2.length; x++) {

                   

                        s.datalistgrid2[x].tse_in_am       = ""
                        s.datalistgrid2[x].tse_in_pm       = ""
                        s.datalistgrid2[x].tse_out_am      = ""
                        s.datalistgrid2[x].tse_out_pm      = ""
                        //s.datalistgrid2[x].tse_day_parent  = "98"
                        s.datalistgrid2[x].tse_month = month_name_to_int($('#txtb_sched_monsyr').val())
                        s.datalistgrid2[x].tse_year = str_to_year($('#txtb_sched_monsyr').val())
                        s.datalistgrid2[x].ts_code = "97"
                        s.datalistgrid2[x].ts_descr = "NO DUTY"
                        s.datalistgrid2[x].pre_time_in_hrs = "";
                        s.datalistgrid2[x].post_time_out_hrs = "";
                        s.datalistgrid2[x].ts_day_equivalent = "";
                        //arr_datalist_grid2_data.splice(counter, 1);
                        //s.datalistgrid2 = Array.from(arr_datalist_grid2_data);
                        //s.oTable1.fnClearTable();


                        
                    }


                    s.oTable1.fnClearTable();
                    if (s.datalistgrid2.length != 0) {
                        s.oTable1.fnAddData(s.datalistgrid2);
                    }
                    
                    //console.log(s.datalistgrid2)
                }    
            });
    }
    //************************************// 
    //*** Delete Row              
    //**********************************// 


    s.btn_del_row1_edit = function (row_id) {

        s.pre_hrs_arr[row_id] = "";
        s.post_hrs_arr[row_id] = "";

        var t = $('#datalist_grid2').DataTable();
        var row_data = t.row(row_id).data();
        alert(s.add_days_orig_edit)
        alert(s.tse_date_orig_edit)
        //s.add_days_orig_edit = d.data.timeSchedData[0].ts_add_days;
        //s.tse_date_orig_edit = s.datalistgrid2[row_id].tse_date

        if (row_data.ts_code != "") {
            h.post("../cSSTimeSchedule/SelectTimeSched", {
                par_ts_code: row_data.ts_code
            }).then(function (d) {
                if (d.data.message == "success") {

                    arr_datalist_grid2_data[row_id].tse_in_am = ""
                    arr_datalist_grid2_data[row_id].tse_in_pm = ""
                    arr_datalist_grid2_data[row_id].tse_out_am = ""
                    arr_datalist_grid2_data[row_id].tse_out_pm = ""
                    arr_datalist_grid2_data[row_id].tse_day_parent = "98"
                    arr_datalist_grid2_data[row_id].tse_month = ""
                    arr_datalist_grid2_data[row_id].tse_year = ""
                    arr_datalist_grid2_data[row_id].ts_code = ""
                    arr_datalist_grid2_data[row_id].ts_descr = ""
                    arr_datalist_grid2_data[row_id].pre_time_in_hrs = "";
                    arr_datalist_grid2_data[row_id].post_time_out_hrs = "";
                    arr_datalist_grid2_data[row_id].ts_day_equivalent = "";

                    s.datalistgrid2 = Array.from(arr_datalist_grid2_data);
                    s.oTable1.fnClearTable();
                    if (s.datalistgrid2.length != 0) {
                        s.oTable1.fnAddData(s.datalistgrid2);
                    }
                    
                    if (s.add_days_orig_edit > 0) {

                        var counter = row_id + d.data.timeSchedData[0].ts_add_days;
                        // for (var x = 0; x < d.data.timeSchedData[0].ts_add_days; x++) {
                       

                        if (d.data.timeSchedData[0].ts_add_days > 1) {
                            for (var x = 0; x < d.data.timeSchedData[0].ts_add_days; x++) {
                                arr_datalist_grid2_data[row_id + x].tse_in_am = ""
                                arr_datalist_grid2_data[row_id + x].tse_in_pm = ""
                                arr_datalist_grid2_data[row_id + x].tse_out_am = ""
                                arr_datalist_grid2_data[row_id + x].tse_out_pm = ""
                                arr_datalist_grid2_data[row_id + x].tse_day_parent = "98"
                                arr_datalist_grid2_data[row_id + x].tse_month = ""
                                arr_datalist_grid2_data[row_id + x].tse_year = ""
                                arr_datalist_grid2_data[row_id + x].ts_code = ""
                                arr_datalist_grid2_data[row_id + x].ts_descr = ""
                                arr_datalist_grid2_data[row_id + x].pre_time_in_hrs = "";
                                arr_datalist_grid2_data[row_id + x].post_time_out_hrs = "";
                                arr_datalist_grid2_data[row_id + x].ts_day_equivalent = "";
                            }
                        }

                        for (var x = 0; x < 1; x++) {
                            arr_datalist_grid2_data.splice(counter, 1);
                            s.datalistgrid2 = Array.from(arr_datalist_grid2_data);
                            s.oTable1.fnClearTable();
                            if (s.datalistgrid2.length != 0) {
                                s.oTable1.fnAddData(s.datalistgrid2);
                            }
                        }
                    }
                }
            });
        }
    }

    s.btn_del_row1 = function (row_id) {
        swal({
            title: "Are you sure you want to remove this schedule?",
            text: "",
            icon: "warning",
            buttons: true,
            dangerMode: true,

        })
            .then(function (willDelete) {
                if (willDelete) {
                    s.pre_hrs_arr[row_id] = "";
                    s.post_hrs_arr[row_id] = "";

                    var t = $('#datalist_grid2').DataTable();
                    var row_data = t.row(row_id).data();

                    if (row_data.ts_code != "") {
                        h.post("../cSSTimeSchedule/SelectTimeSched", {
                            par_ts_code: row_data.ts_code
                        }).then(function (d) {
                            if (d.data.message == "success") {

                                arr_datalist_grid2_data[row_id].tse_in_am = ""
                                arr_datalist_grid2_data[row_id].tse_in_pm = ""
                                arr_datalist_grid2_data[row_id].tse_out_am = ""
                                arr_datalist_grid2_data[row_id].tse_out_pm = ""
                                arr_datalist_grid2_data[row_id].tse_day_parent = "98"
                                arr_datalist_grid2_data[row_id].tse_month = ""
                                arr_datalist_grid2_data[row_id].tse_year = ""
                                arr_datalist_grid2_data[row_id].ts_code = ""
                                arr_datalist_grid2_data[row_id].ts_descr = ""
                                arr_datalist_grid2_data[row_id].pre_time_in_hrs = "";
                                arr_datalist_grid2_data[row_id].post_time_out_hrs = "";
                                arr_datalist_grid2_data[row_id].ts_day_equivalent = "";

                                s.datalistgrid2 = Array.from(arr_datalist_grid2_data);
                                s.oTable1.fnClearTable();
                                if (s.datalistgrid2.length != 0) {
                                    s.oTable1.fnAddData(s.datalistgrid2);
                                }


                                if (d.data.timeSchedData[0].ts_add_days > 0 && row_data.tse_date == d.data.timeSchedData[0].tse_date) 
                                {

                                    var counter = row_id + d.data.timeSchedData[0].ts_add_days;
                                   // for (var x = 0; x < d.data.timeSchedData[0].ts_add_days; x++) {
                                   

                                    if (d.data.timeSchedData[0].ts_add_days > 1) {
                                        for (var x = 0; x < d.data.timeSchedData[0].ts_add_days; x++) {
                                            arr_datalist_grid2_data[row_id + x].tse_in_am = ""
                                            arr_datalist_grid2_data[row_id + x].tse_in_pm = ""
                                            arr_datalist_grid2_data[row_id + x].tse_out_am = ""
                                            arr_datalist_grid2_data[row_id + x].tse_out_pm = ""
                                            arr_datalist_grid2_data[row_id + x].tse_day_parent = "98"
                                            arr_datalist_grid2_data[row_id + x].tse_month = ""
                                            arr_datalist_grid2_data[row_id + x].tse_year = ""
                                            arr_datalist_grid2_data[row_id + x].ts_code = ""
                                            arr_datalist_grid2_data[row_id + x].ts_descr = ""
                                            arr_datalist_grid2_data[row_id + x].pre_time_in_hrs = "";
                                            arr_datalist_grid2_data[row_id + x].post_time_out_hrs = "";
                                            arr_datalist_grid2_data[row_id + x].ts_day_equivalent = "";
                                        }
                                    }

                                    for (var x = 0; x < 1; x++) {
                                        arr_datalist_grid2_data.splice(counter, 1);
                                        s.datalistgrid2 = Array.from(arr_datalist_grid2_data);
                                        s.oTable1.fnClearTable();
                                        if (s.datalistgrid2.length != 0) {
                                            s.oTable1.fnAddData(s.datalistgrid2);
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            });
    }

    s.btn_submit_click = function () {
        //if (ValidateFields2()) {

        var btn_submit = document.getElementById('submit');
        btn_submit.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Submitting';
        s.dis_btn = true;
        var ischeckTime = false

        var ischeckTime = false
        var no_of_work_hours = parseFloat($("#no_of_wrkng_hrs").html())
        var no_work_sched = parseFloat($("#no_of_wrkng_hrs_sched").html())
        if (no_of_work_hours > no_work_sched) {

            ischeckTime = false
        }
        else {

            ischeckTime = true
        }


        if (ischeckTime == false) {
            swal({
                title: "Work hours should be greater than hours rendered are you sure to continue with this schedule?",
                text: "",
                icon: "warning",
                buttons: true,
                dangerMode: true,

            })
                .then(function (willDelete) {
                    if (willDelete) {

                        ischeckTime = true

                        if (ischeckTime == true) {
                            h.post("../cSSTimeSchedule/CheckExist", {
                                tse_ctrl_no: s.datalistgrid2[0].tse_ctrl_no
                                , tse_effective_date: $("#txtb_effective_date").val()
                            }).then(function (d) {
                                if (d.data.message == "true") {
                                    //alert("wala pa nag exist");

                                    //alert("oks na tanan")
                                    var data = {
                                        tse_effective_date: $("#txtb_effective_date").val()
                                        , tse_month: month_name_to_int($('#txtb_sched_monsyr').val())
                                        , tse_year: str_to_year($('#txtb_sched_monsyr').val())
                                        , shift_flag: $('#ddl_shift_sched').val()
                                    }

                                    for (var x = 0; x < arr_datalist_grid2_data.length; x++) {
                                        arr_datalist_grid2_data_save[x] = {
                                            "tse_date": arr_datalist_grid2_data[x].dtr_date_char
                                            , "empl_id": arr_datalist_grid2_data[x].empl_id
                                            , "tse_day_parent": arr_datalist_grid2_data[x].tse_day_parent
                                            , "tse_in_am": arr_datalist_grid2_data[x].tse_in_am
                                            , "tse_out_am": arr_datalist_grid2_data[x].tse_out_am
                                            , "tse_in_pm": convert_time_to_24hr2(arr_datalist_grid2_data[x].tse_in_pm).slice(0, 5)
                                            , "tse_out_pm": convert_time_to_24hr2(arr_datalist_grid2_data[x].tse_out_pm).slice(0, 5)
                                            , "tse_month": arr_datalist_grid2_data[x].tse_month
                                            , "tse_year": arr_datalist_grid2_data[x].tse_year
                                            , "ts_code": arr_datalist_grid2_data[x].ts_code
                                            , "pre_time_in_hrs": convert_time_to_24hr(arr_datalist_grid2_data[x].pre_time_in_hrs).slice(0, 5)
                                            , "post_time_out_hrs": convert_time_to_24hr(arr_datalist_grid2_data[x].post_time_out_hrs).slice(0, 5)
                                        }
                                    }

                                    h.post("../cSSTimeSchedule/SaveSubmit", {
                                        data: data
                                        , data2: arr_datalist_grid2_data_save
                                    }).then(function (d) {
                                        if (d.data.message == "success") {
                                            $("#main_modal").modal("hide");
                                            swal("Your record has been submitted!", { icon: "success", });
                                            s.SelectEmplName();
                                            btn_submit.innerHTML = '<i class="fa fa-paper-plane"> </i> Submit';
                                            s.dis_btn = false;
                                        }
                                        else {
                                            console.log("Error: " + d.data.message)
                                            btn_submit.innerHTML = '<i class="fa fa-paper-plane"> </i> Submit';
                                            s.dis_btn = false;
                                        }
                                    });


                                }
                                else if (d.data.message == "false") {
                                    //alert("nag-exist na");
                                    arr_datalist_grid2_data_save = [];

                                    for (var x = 0; x < arr_datalist_grid2_data.length; x++) {
                                        arr_datalist_grid2_data_save[x] = {
                                            "tse_date": arr_datalist_grid2_data[x].dtr_date_char
                                            , "empl_id": arr_datalist_grid2_data[x].empl_id
                                            , "tse_day_parent": arr_datalist_grid2_data[x].tse_day_parent
                                            , "tse_in_am": arr_datalist_grid2_data[x].tse_in_am
                                            , "tse_out_am": arr_datalist_grid2_data[x].tse_out_am
                                            , "tse_in_pm": convert_time_to_24hr2(arr_datalist_grid2_data[x].tse_in_pm).slice(0, 5)
                                            , "tse_out_pm": convert_time_to_24hr2(arr_datalist_grid2_data[x].tse_out_pm).slice(0, 5)
                                            , "tse_month": arr_datalist_grid2_data[x].tse_month
                                            , "tse_year": arr_datalist_grid2_data[x].tse_year
                                            , "ts_code": arr_datalist_grid2_data[x].ts_code
                                            , "pre_time_in_hrs": convert_time_to_24hr(arr_datalist_grid2_data[x].pre_time_in_hrs).slice(0, 5)
                                            , "post_time_out_hrs": convert_time_to_24hr(arr_datalist_grid2_data[x].post_time_out_hrs).slice(0, 5)
                                        }
                                    }

                                    h.post("../cSSTimeSchedule/EditSubmit", {
                                        data2: arr_datalist_grid2_data_save
                                        , tse_ctrl_no: s.datalistgrid2[0].tse_ctrl_no
                                    }).then(function (d) {
                                        if (d.data.message == "success") {
                                            $("#main_modal").modal("hide");
                                            swal("Your record has been " + s.label_success_submit + " !", { icon: "success", });
                                            s.SelectEmplName();

                                            btn_submit.innerHTML = '<i class="fa fa-paper-plane"> </i> Submit';
                                            s.dis_btn = false;
                                        }
                                        else {
                                            console.log("Error: " + d.data.message)
                                            btn_submit.innerHTML = '<i class="fa fa-paper-plane"> </i> Submit';
                                            s.dis_btn = false;
                                        }
                                    });
                                }
                                else {
                                    btn_submit.innerHTML = '<i class="fa fa-paper-plane"> </i> Submit';
                                    s.dis_btn = false;
                                    swal("Error", { icon: "warning", });
                                }
                            });
                        }
                        else {

                            btn_save.innerHTML = '<i class="fa fa-save"> </i> Save';
                            s.dis_btn = false;

                        }

                    }
                });
        }
		
		if (ischeckTime == true) 
		{
                            h.post("../cSSTimeSchedule/CheckExist", {
                                tse_ctrl_no: s.datalistgrid2[0].tse_ctrl_no
                                , tse_effective_date: $("#txtb_effective_date").val()
                            }).then(function (d) {
                                if (d.data.message == "true") {
                                    //alert("wala pa nag exist");

                                    //alert("oks na tanan")
                                    var data = {
                                        tse_effective_date: $("#txtb_effective_date").val()
                                        , tse_month: month_name_to_int($('#txtb_sched_monsyr').val())
                                        , tse_year: str_to_year($('#txtb_sched_monsyr').val())
                                        , shift_flag: $('#ddl_shift_sched').val()
                                    }

                                    for (var x = 0; x < arr_datalist_grid2_data.length; x++) {
                                        arr_datalist_grid2_data_save[x] = {
                                            "tse_date": arr_datalist_grid2_data[x].dtr_date_char
                                            , "empl_id": arr_datalist_grid2_data[x].empl_id
                                            , "tse_day_parent": arr_datalist_grid2_data[x].tse_day_parent
                                            , "tse_in_am": arr_datalist_grid2_data[x].tse_in_am
                                            , "tse_out_am": arr_datalist_grid2_data[x].tse_out_am
                                            , "tse_in_pm": convert_time_to_24hr2(arr_datalist_grid2_data[x].tse_in_pm).slice(0, 5)
                                            , "tse_out_pm": convert_time_to_24hr2(arr_datalist_grid2_data[x].tse_out_pm).slice(0, 5)
                                            , "tse_month": arr_datalist_grid2_data[x].tse_month
                                            , "tse_year": arr_datalist_grid2_data[x].tse_year
                                            , "ts_code": arr_datalist_grid2_data[x].ts_code
                                            , "pre_time_in_hrs": convert_time_to_24hr(arr_datalist_grid2_data[x].pre_time_in_hrs).slice(0, 5)
                                            , "post_time_out_hrs": convert_time_to_24hr(arr_datalist_grid2_data[x].post_time_out_hrs).slice(0, 5)
                                        }
                                    }

                                    h.post("../cSSTimeSchedule/SaveSubmit", {
                                        data: data
                                        , data2: arr_datalist_grid2_data_save
                                    }).then(function (d) {
                                        if (d.data.message == "success") {
                                            $("#main_modal").modal("hide");
                                            swal("Your record has been submitted!", { icon: "success", });
                                            s.SelectEmplName();
                                            btn_submit.innerHTML = '<i class="fa fa-paper-plane"> </i> Submit';
                                            s.dis_btn = false;
                                        }
                                        else {
                                            console.log("Error: " + d.data.message)
                                            btn_submit.innerHTML = '<i class="fa fa-paper-plane"> </i> Submit';
                                            s.dis_btn = false;
                                        }
                                    });


                                }
                                else if (d.data.message == "false") {
                                    //alert("nag-exist na");
                                    arr_datalist_grid2_data_save = [];

                                    for (var x = 0; x < arr_datalist_grid2_data.length; x++) {
                                        arr_datalist_grid2_data_save[x] = {
                                            "tse_date": arr_datalist_grid2_data[x].dtr_date_char
                                            , "empl_id": arr_datalist_grid2_data[x].empl_id
                                            , "tse_day_parent": arr_datalist_grid2_data[x].tse_day_parent
                                            , "tse_in_am": arr_datalist_grid2_data[x].tse_in_am
                                            , "tse_out_am": arr_datalist_grid2_data[x].tse_out_am
                                            , "tse_in_pm": convert_time_to_24hr2(arr_datalist_grid2_data[x].tse_in_pm).slice(0, 5)
                                            , "tse_out_pm": convert_time_to_24hr2(arr_datalist_grid2_data[x].tse_out_pm).slice(0, 5)
                                            , "tse_month": arr_datalist_grid2_data[x].tse_month
                                            , "tse_year": arr_datalist_grid2_data[x].tse_year
                                            , "ts_code": arr_datalist_grid2_data[x].ts_code
                                            , "pre_time_in_hrs": convert_time_to_24hr(arr_datalist_grid2_data[x].pre_time_in_hrs).slice(0, 5)
                                            , "post_time_out_hrs": convert_time_to_24hr(arr_datalist_grid2_data[x].post_time_out_hrs).slice(0, 5)
                                        }
                                    }

                                    h.post("../cSSTimeSchedule/EditSubmit", {
                                        data2: arr_datalist_grid2_data_save
                                        , tse_ctrl_no: s.datalistgrid2[0].tse_ctrl_no
                                    }).then(function (d) {
                                        if (d.data.message == "success") {
                                            $("#main_modal").modal("hide");
                                            swal("Your record has been " + s.label_success_submit + " !", { icon: "success", });
                                            s.SelectEmplName();

                                            btn_submit.innerHTML = '<i class="fa fa-paper-plane"> </i> Submit';
                                            s.dis_btn = false;
                                        }
                                        else {
                                            console.log("Error: " + d.data.message)
                                            btn_submit.innerHTML = '<i class="fa fa-paper-plane"> </i> Submit';
                                            s.dis_btn = false;
                                        }
                                    });
                                }
                                else {
                                    btn_submit.innerHTML = '<i class="fa fa-paper-plane"> </i> Submit';
                                    s.dis_btn = false;
                                    swal("Error", { icon: "warning", });
                                }
                            });
                        }
                       

        
        
        //}
    }

    //************************************// 
    //*** Delete Record All         
    //**********************************// 
    s.btn_del_row2 = function (row_index) {
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
                        h.post("../cSSTimeSchedule/Delete", {
                            tse_ctrl_no: s.datalistgrid3[row_index].tse_ctrl_no
                        }).then(function (d) {
                            if (d.data.message == "success") {
                                swal("Your record has been deleted!", { icon: "success", });
                                s.SelectEmplName();
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

    //*********************************************//
    //*** Select Time Schedule
    //********************************************// 
    s.SelectTimeSched = function () {
        if ($('#ddl_time_sched').val() != "") {
            $("#ddl_time_sched").removeClass("required");
            $("#lbl_ddl_time_sched_req").text("");

            $("#txtb_nbr_days").removeClass("required");
            $("#lbl_txtb_nbr_days_req").text("");

            $("#txtb_pre_time_in_hrs").val("");
            $("#txtb_post_time_out_hrs").val("");

            $("#txtb_am_in").val("");
            s.txtb_am_in = ""
            $("#txtb_am_out").val("");
            s.txtb_am_out = ""
            $("#txtb_pm_in").val("");
            s.txtb_pm_in = ""
            $("#txtb_pm_out").val("");
            s.txtb_pm_out = ""


        }
        else {
            clearentry1()
        }
        h.post("../cSSTimeSchedule/SelectTimeSched", {
            par_ts_code: $('#ddl_time_sched').val()
        }).then(function (d) {
            if (d.data.message == "success") {
                s.txtb_nbr_days = d.data.timeSchedData[0].ts_add_days;
                s.txtb_am_in = convert_time_to_12hr(d.data.timeSchedData[0].ts_am_in);
                s.txtb_pm_in = convert_time_to_12hr(d.data.timeSchedData[0].ts_pm_in);
                s.txtb_am_out = convert_time_to_12hr(d.data.timeSchedData[0].ts_am_out);
                s.txtb_pm_out = convert_time_to_12hr(d.data.timeSchedData[0].ts_pm_out);
                s.txtb_days_equiv = d.data.timeSchedData[0].ts_day_equivalent;

                s.txtb_pre_time_in_hrs = d.data.timeSchedData[0].pre_time_in_hrs;
                s.txtb_post_time_out_hrs = d.data.timeSchedData[0].post_time_out_hrs;

            }
        })

    }

    //************************************// 
    //*** Open Edit Modal         
    //**********************************// 
    s.btn_schedule_list = function () {
        $('#sched_modal').modal({ backdrop: 'static', keyboard: false });
        s.InnerModalTitle = "List of Time Schedule";

    }

    //************************************// 
    //*** Open Edit Modal         
    //**********************************// 
    s.btn_edit_action2 = function (row_id) {
		
		vw_shift_flag = row_id
		
        $("#txtb_sched_monsyr").val(month_int_to_name(s.datalistgrid3[row_id].tse_month) + " - " + s.datalistgrid3[row_id].tse_year);
        $("#txtb_effective_date").val(s.datalistgrid3[row_id].tse_effective_date);

        $("#sched_modal").modal("hide");
        s.SelectEmplName();
        
        $("#ddl_shift_sched").val(s.datalistgrid3[row_id].shift_flag.toString())
        s.ddl_shift_sched = s.datalistgrid3[row_id].shift_flag.toString();
    }

    s.btn_copy_row1 = function (row_id) {
        //$("#txtb_sched_monsyr").val(month_int_to_name(s.datalistgrid3[row_id].tse_month) + " - " + s.datalistgrid3[row_id].tse_year);

        $("#sched_modal").modal("hide");

        h.post("../cSSTimeSchedule/CopyTimeSchedule", {
            par_empl_id: $('#ddl_name option:selected').val() == "" ? s.ddl_name : $('#ddl_name option:selected').val()
            , par_tse_ctrl_no: s.datalistgrid3[row_id].tse_ctrl_no
            , par_month: month_name_to_int($('#txtb_sched_monsyr').val())
            , par_year: str_to_year($('#txtb_sched_monsyr').val())
            , par_effective_date: $("#txtb_effective_date").val()
        }).then(function (d) {
            if (d.data.message == "success") {

                s.oTable1.fnClearTable();
                s.datalistgrid2 = d.data.copy_time_sched_date;
                if (d.data.copy_time_sched_date.length > 0) {
                    s.oTable1.fnAddData(d.data.copy_time_sched_date);
                    $("#txtb_approval_status").text(d.data.copy_time_sched_date[0].approval_status_descr == "" || d.data.copy_time_sched_date[0].approval_status_descr == null ? "New" : d.data.copy_time_sched_date[0].approval_status_descr);
                }

                if (d.data.copy_time_sched_date[0].approval_status == "N" ||
                    d.data.copy_time_sched_date[0].approval_status == "") {
                    remove_class_colors();
                    $("#txtb_approval_status").addClass("new-bg");
                }
                else if (d.data.copy_time_sched_date[0].approval_status == "1" ||
                    d.data.copy_time_sched_date[0].approval_status == "2" ||
                    d.data.copy_time_sched_date[0].approval_status == "F") {
                    remove_class_colors();
                    $("#txtb_approval_status").addClass("approved-bg");
                }
                else if (d.data.copy_time_sched_date[0].approval_status == "C") {
                    remove_class_colors();
                    $("#txtb_approval_status").addClass("cancel-bg");

                    var btn = document.getElementById('submit');
                    btn.innerHTML = '<i class = "fa fa-paper-plane"></i> Resubmit';
                    s.label_success_submit = "resubmitted";
                }
                else if (d.data.copy_time_sched_date[0].approval_status == "D" ||
                    d.data.copy_time_sched_date[0].approval_status == "L") {
                    remove_class_colors();
                    $("#txtb_approval_status").addClass("disapproved-bg");
                }
                else if (d.data.copy_time_sched_date[0].approval_status == "R") {
                    remove_class_colors();
                    $("#txtb_approval_status").addClass("reviewed-bg");
                }
                else if (d.data.copy_time_sched_date[0].approval_status == "S") {
                    remove_class_colors();
                    $("#txtb_approval_status").addClass("submitted-bg");

                }
                else {
                    s.label_success_submit = "submitted";
                }

                s.last_day = s.datalistgrid2.length - 1;
                s.temp_curr_length = arr_datalist_grid2_data.length;
                arr_datalist_grid2_data = Array.from(d.data.copy_time_sched_date);
                s.dum_modal_grid_length = arr_datalist_grid2_data.length;
                arr_datalist_grid2_data_del = Array.from(d.data.copy_time_sched_date);

                $("#no_of_wrkng_hrs").text(d.data.no_of_wrkng_hrs);
                if (parseFloat($("#no_of_wrkng_hrs").html()) > parseFloat($("#no_of_wrkng_hrs_sched").html())) {
                    $('#no_of_wrkng_hrs_sched').addClass("red_font");
                    $('#hrs_lbl').addClass("red_font");
                }
                else {
                    $('#no_of_wrkng_hrs_sched').removeClass("red_font");
                    $('#hrs_lbl').removeClass("red_font");
                }

                s.pre_hrs_arr.fill("", 0, 31);
                s.post_hrs_arr.fill("", 0, 31);
            }
        })
    }

    s.btn_withdraw_submission = function (row_id) {
        swal({
            title: "Are you sure to recall the submission of this schedule?",
            text: "",
            icon: "warning",
            buttons: true,
            dangerMode: true,

        })
            .then(function (willDelete) {
                if (willDelete) {
                    var data =
                    {
                        tse_ctrl_no: s.datalistgrid3[row_id].tse_ctrl_no
                        , approval_status: "C"
                        , details_remarks: "User Recall Submission"
                        , approval_id: s.datalistgrid3[row_id].approval_id
                    }

                    h.post("../cSSTimeSchedule/WithdrawSubmission", { data: data }).then(function (d) {
                        if (d.data.message == "success") {
                            s.SelectEmplName();
                            swal("Your schedule has been successfully recalled!", { icon: "success", });
                        }
                        else {
                            swal(d.data.message, { icon: "warning", });
                        }
                    });
                }
            });
    }

    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields2() {
        var return_val = true;
        var temp_days = 1;
        var null_field = "";
        for (var i = 0; i < arr_datalist_grid2_data.length; i++) {
            if (arr_datalist_grid2_data[i].tse_day_parent == "98") {
                null_field = null_field + temp_days + ", ";
            }
            temp_days++;
        }
        if (null_field != "") {
            return_val = false;
            swal(null_field, { icon: "warning", title: "No Set Schedule For ff. Days" });
        }
        else {
            return_val = true;
        }
        return return_val;
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

    function time_diff_minutes(time1, time2) {
        if (time1 != "" && time2 != "") {
            var start_time = time1.split(':');
            var end_time = time2.split(':');

            var hrs_diff = (start_time[0] - end_time[0]) < 0 ? ((start_time[0] - end_time[0]) * (-1)) : (start_time[0] - end_time[0]);
            var mins_diff = (start_time[1] - end_time[1]) < 0 ? ((start_time[1] - end_time[1]) * (-1)) : (start_time[1] - end_time[1]);
            var result = hrs_diff + '.' + mins_diff;

            return result;
        }
    }

    function RemovePMAM(val, txtb) {
        var value = "";

        if (val.length > 6) {
            value = val.substring(0, val.length - 2);
        }
        if (txtb == "txtb_pre_time_in_hrs") {
            $("#txtb_pre_time_in_hrs").val(value);
        }
        else if (txtb == "txtb_post_time_out_hrs") {
            $("#txtb_post_time_out_hrs").val(value);
        }
        else {
            $("#txtb_pre_time_in_hrs").val("");
            $("#txtb_post_time_out_hrs").val("");
        }
    }

    function RemovePMAM2(val, txtb) {
        var value = "";

        if (val.length > 6) {
            value = val.substring(0, val.length - 3);
        }

        return value;
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
                //case "12":
                //    value2 = "00" + ":" + time[1];
                //    break;
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
                value = "12" + ":" + time[1];
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
            //case "00":
            //    value = "12" + ":" + time[1];
            //    break;
            default:
                value = val == "" ? "" : time[0] + ":" + time[1];
                break;
            //default:
            //    value2 = "";
            //    break;
        }

        return value;
    }

    function clearentry1() {
        s.txtb_am_in = "";
        s.txtb_pm_in = "";
        s.txtb_am_out = "";
        s.txtb_pm_out = "";
        s.txtb_nbr_days = "";
     
        s.txtb_pre_time_in_hrs = "";
        s.txtb_post_time_out_hrs = "";
        s.ddl_time_sched = "";

        //$("#ddl_time_sched").val("").trigger('change')
        //$("#ddl_time_sched option:selected").val("")
        //s.ddl_time_sched = ""
        //$("#ddl_time_sched").select2("val", "");
        $("#txtb_pre_time_in_hrs").val("");
        $("#ddl_time_sched").val("");
        $("#select2-ddl_time_sched-container").text("--Select Here--")
        $("#txtb_post_time_out_hrs").val("");
    }

    s.btn_click_tabs = function (data) {
        h.post("../cSSTimeSchedule/RegularShift", {
            par_empl_id: $('#ddl_name option:selected').val() == "" ? s.ddl_name : $('#ddl_name option:selected').val()
            , par_month: month_name_to_int($('#txtb_sched_monsyr').val())
            , par_year: str_to_year($('#txtb_sched_monsyr').val())
            , par_effective_date: $("#txtb_effective_date").val()
            , tab: data
        }).then(function (d) {
            if (d.data.message == "success") {

                s.oTable1.fnClearTable();

             
                s.datalistgrid2 = d.data.query;

                

                if (d.data.query.length > 0) {
                    s.oTable1.fnAddData(d.data.query);
                    $("#txtb_approval_status").text(d.data.query[0].approval_status_descr == "" || d.data.query[0].approval_status_descr == null ? "New" : d.data.query[0].approval_status_descr);
                }

                if (d.data.query[0].approval_status == "N" ||
                    d.data.query[0].approval_status == "") {
                    remove_class_colors();
                    $("#txtb_approval_status").removeClass("label-warning");
                    $("#txtb_approval_status").removeClass("label-danger");
                    $("#txtb_approval_status").removeClass("label-success");
                    $("#txtb_approval_status").removeClass("label-info");
                    $("#txtb_approval_status").addClass("label-primary");
                }
                else if (d.data.query[0].approval_status == "1" ||
                    d.data.query[0].approval_status == "2" ||
                    d.data.query[0].approval_status == "F") {
                    remove_class_colors();
                    $("#txtb_approval_status").removeClass("label-warning");
                    $("#txtb_approval_status").removeClass("label-danger");
                    $("#txtb_approval_status").removeClass("label-primary");
                    $("#txtb_approval_status").removeClass("label-info");
                    $("#txtb_approval_status").addClass("label-success");
                }
                else if (d.data.query[0].approval_status == "C") {
                    remove_class_colors();
                    $("#txtb_approval_status").removeClass("label-warning");
                    $("#txtb_approval_status").removeClass("label-primary");
                    $("#txtb_approval_status").removeClass("label-success");
                    $("#txtb_approval_status").removeClass("label-info");
                    $("#txtb_approval_status").addClass("label-danger");

                    var btn = document.getElementById('submit');
                    btn.innerHTML = '<i class = "fa fa-paper-plane"></i> Resubmit';
                    s.label_success_submit = "resubmitted";
                }
                else if (d.data.query[0].approval_status == "D" ||
                    d.data.query[0].approval_status == "L") {
                    remove_class_colors();
                    $("#txtb_approval_status").removeClass("label-warning");
                    $("#txtb_approval_status").removeClass("label-primary");
                    $("#txtb_approval_status").removeClass("label-success");
                    $("#txtb_approval_status").removeClass("label-info");
                    $("#txtb_approval_status").addClass("label-danger");
                }
                else if (d.data.query[0].approval_status == "R") {
                    remove_class_colors();
                    $("#txtb_approval_status").removeClass("label-warning");
                    $("#txtb_approval_status").removeClass("label-primary");
                    $("#txtb_approval_status").removeClass("label-success");
                    $("#txtb_approval_status").removeClass("label-danger");
                    $("#txtb_approval_status").addClass("label-info");
                }
                else if (d.data.query[0].approval_status == "S") {
                    remove_class_colors();
                    $("#txtb_approval_status").removeClass("label-primary");
                    $("#txtb_approval_status").removeClass("label-danger");
                    $("#txtb_approval_status").removeClass("label-success");
                    $("#txtb_approval_status").removeClass("label-info");
                    $("#txtb_approval_status").addClass("label-warning");

                }
                else {
                    s.label_success_submit = "submitted";
                }

                s.last_day = s.datalistgrid2.length - 1;
                s.temp_curr_length = arr_datalist_grid2_data.length;
                arr_datalist_grid2_data = Array.from(d.data.query);
                s.dum_modal_grid_length = arr_datalist_grid2_data.length;
                arr_datalist_grid2_data_del = Array.from(d.data.query);

                s.pre_hrs_arr.fill("", 0, 31);
                s.post_hrs_arr.fill("", 0, 31);
            }
        });
    }
    //ADDED BY JORGE: 2021-05-19
    s.ddl_shift_change = function () {

        if ($("#ddl_shift_sched").val() == '1') {
            s.btn_click_tabs('tab2')
        }

        else if ($("#ddl_shift_sched").val() == '2') {
            s.btn_click_tabs('tab1')
        }

    }

    s.btn_copy_list = function () {
        s.btn_copy_row1_new();
        $("#modal_date").modal();
    }

    s.btn_copy_row1_new = function () {
        var ddate = new Date();
        s.txtb_effective_date1 = moment(ddate).format("YYYY-MM-DD");
        $("#txtb_effective_date1").val(moment(ddate).format("YYYY-MM-DD"))

        h.post("../cSSTimeSchedule/CopyTimeSchedule", {
            par_empl_id: $('#ddl_name option:selected').val() == "" ? s.ddl_name : $('#ddl_name option:selected').val()
            , par_tse_ctrl_no: ""
            , par_month: month_name_to_int($('#txtb_sched_monsyr').val())
            , par_year: str_to_year($('#txtb_sched_monsyr').val())
            , par_effective_date: $("#txtb_effective_date1").val()
        }).then(function (d) {
            if (d.data.message == "success") {

                s.oTable1.fnClearTable();
               

                for (var x = 0; x < d.data.copy_time_sched_date.length; x++) {
                    d.data.copy_time_sched_date[x].approval_status_descr = 'New'
                    d.data.copy_time_sched_date[x].approval_status = 'N'
                }

                s.datalistgrid2 = d.data.copy_time_sched_date;


                if (d.data.copy_time_sched_date.length > 0) {
                    s.oTable1.fnAddData(d.data.copy_time_sched_date);
                    $("#txtb_approval_status").text(d.data.copy_time_sched_date[0].approval_status_descr == "" || d.data.copy_time_sched_date[0].approval_status_descr == null ? "New" : d.data.copy_time_sched_date[0].approval_status_descr);
                }

                if (d.data.copy_time_sched_date[0].approval_status == "N" ||
                    d.data.copy_time_sched_date[0].approval_status == "") {
                    remove_class_colors();
                    $("#txtb_approval_status").removeClass("label-warning");
                    $("#txtb_approval_status").removeClass("label-danger");
                    $("#txtb_approval_status").removeClass("label-success");
                    $("#txtb_approval_status").removeClass("label-info");
                    $("#txtb_approval_status").addClass("label-primary");
                }
                else if (d.data.copy_time_sched_date[0].approval_status == "1" ||
                    d.data.copy_time_sched_date[0].approval_status == "2" ||
                    d.data.copy_time_sched_date[0].approval_status == "F") {
                    remove_class_colors();
                    $("#txtb_approval_status").removeClass("label-warning");
                    $("#txtb_approval_status").removeClass("label-danger");
                    $("#txtb_approval_status").removeClass("label-primary");
                    $("#txtb_approval_status").removeClass("label-info");
                    $("#txtb_approval_status").addClass("label-success");
                }
                else if (d.data.copy_time_sched_date[0].approval_status == "C") {
                    remove_class_colors();

                    $("#txtb_approval_status").removeClass("label-warning");
                    $("#txtb_approval_status").removeClass("label-primary");
                    $("#txtb_approval_status").removeClass("label-success");
                    $("#txtb_approval_status").removeClass("label-info");
                    $("#txtb_approval_status").addClass("label-danger");

                    var btn = document.getElementById('submit');
                    btn.innerHTML = '<i class = "fa fa-paper-plane"></i> Resubmit';
                    s.label_success_submit = "resubmitted";
                }
                else if (d.data.copy_time_sched_date[0].approval_status == "D" ||
                    d.data.copy_time_sched_date[0].approval_status == "L") {
                    remove_class_colors();
                    $("#txtb_approval_status").removeClass("label-warning");
                    $("#txtb_approval_status").removeClass("label-primary");
                    $("#txtb_approval_status").removeClass("label-success");
                    $("#txtb_approval_status").removeClass("label-info");
                    $("#txtb_approval_status").addClass("label-danger");
                }
                else if (d.data.copy_time_sched_date[0].approval_status == "R") {
                    remove_class_colors();
                    $("#txtb_approval_status").removeClass("label-warning");
                    $("#txtb_approval_status").removeClass("label-primary");
                    $("#txtb_approval_status").removeClass("label-success");
                    $("#txtb_approval_status").removeClass("label-danger");
                    $("#txtb_approval_status").addClass("label-info");
                }
                else if (d.data.copy_time_sched_date[0].approval_status == "S") {
                    remove_class_colors();
                    $("#txtb_approval_status").removeClass("label-primary");
                    $("#txtb_approval_status").removeClass("label-danger");
                    $("#txtb_approval_status").removeClass("label-success");
                    $("#txtb_approval_status").removeClass("label-info");
                    $("#txtb_approval_status").addClass("label-warning");

                }
                else {
                    s.label_success_submit = "submitted";
                }

                s.last_day = s.datalistgrid2.length - 1;
                s.temp_curr_length = arr_datalist_grid2_data.length;
                arr_datalist_grid2_data = Array.from(d.data.copy_time_sched_date);
                s.dum_modal_grid_length = arr_datalist_grid2_data.length;
                arr_datalist_grid2_data_del = Array.from(d.data.copy_time_sched_date);

                $("#no_of_wrkng_hrs").text(d.data.no_of_wrkng_hrs);
                if (parseFloat($("#no_of_wrkng_hrs").html()) > parseFloat($("#no_of_wrkng_hrs_sched").html())) {
                    $('#no_of_wrkng_hrs_sched').addClass("red_font");
                    $('#hrs_lbl').addClass("red_font");
                }
                else {
                    $('#no_of_wrkng_hrs_sched').removeClass("red_font");
                    $('#hrs_lbl').removeClass("red_font");
                }

                s.pre_hrs_arr.fill("", 0, 31);
                s.post_hrs_arr.fill("", 0, 31);
            }
        })
    }

    s.btn_auto_clear = function () {

        console.log($("#txtb_approval_status").text())
        if ($("#txtb_approval_status").text() == "New")
        {
            for (var x = 0; x < s.datalistgrid2.length; x++) {



                s.datalistgrid2[x].tse_in_am = ""
                s.datalistgrid2[x].tse_in_pm = ""
                s.datalistgrid2[x].tse_out_am = ""
                s.datalistgrid2[x].tse_out_pm = ""
                //s.datalistgrid2[x].tse_day_parent  = "98"
                s.datalistgrid2[x].tse_month = month_name_to_int($('#txtb_sched_monsyr').val())
                s.datalistgrid2[x].tse_year = str_to_year($('#txtb_sched_monsyr').val())
                s.datalistgrid2[x].ts_code = ""
                s.datalistgrid2[x].ts_descr = ""
                s.datalistgrid2[x].pre_time_in_hrs = "";
                s.datalistgrid2[x].post_time_out_hrs = "";
                s.datalistgrid2[x].ts_day_equivalent = "";
                //arr_datalist_grid2_data.splice(counter, 1);
                //s.datalistgrid2 = Array.from(arr_datalist_grid2_data);




            }

            s.oTable1.fnClearTable();
            if (s.datalistgrid2.length != 0) {
                s.oTable1.fnAddData(s.datalistgrid2);
            }

        }
        
    }

    s.effective_date_change = function () {
        $("#txtb_effective_date").val($("#txtb_effective_date1").val())
        s.txtb_effective_date = $("#txtb_effective_date1").val()
    }


});