//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Employee Job Description
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JOSEPH M. TOMBO JR.      04-28-2021      Code Creation
//**********************************************************************************
ng_selfService_App.controller("cSSJobDescription_Ctrl", function ($scope, $compile, $http, $filter)
{
    var s               = $scope;
    var h               = $http;

    s.rowLen            = "10";
    s.year              = [];
    s.ddl_year          = "";
    s.ddl_month         = "";

    s.positions_list    = [];
    s.empl_type_list    = [];
    s.employee_list     = [];
    s.approval_list     = [];
    s.datalistgrid      = [];
    s.datalistgrid_common       = [];
    s.datalistgrid_task         = [];
    s.datalistgrid_task_common  = [];
    s.show_btn_approve  = false;
    s.allowAdd          = false;
    s.editTable         = false;
    s.access_roles      = [];
    s.trans_actionX     = "";
    //*****Page Filter Object Models******//
    s.ddl_department_val        = "";
    s.ddl_division_val          = "";
    s.ddl_section_val           = "";
    s.ddl_employmenttype_val    = "";
    s.ddl_position_val_add      = "";
    s.emp_row_key               = "";
    s.pos_row_key               = "";
    s.editRow_id                = "";
    //************************************//

    s.emp_department_code       = "";
    s.emp_division_code         = "";
    s.emp_section_code          = "";
    s.emp_employment_type       = "";
    s.emp_appl_code             = "";
    s.emp_budget_code           = "";
    s.emp_id                    = "";
    s.emp_position_code         = "";

    s.position_index            = "";
    s.txtb_percent_summary      = "0%";
    s.ddl_apprstatus_fil_val    = "";
    s.filterStatusOne   = true;
    s.isAllowCreate     = false;
    s.editPercent       = false;
    s.row_header_current = "";
    s.task_current_action = "";
    s.allowPrint = false;
    function init()
    {
        try {
            
            //Initialized to current year and month..
            //s.ddl_year  = moment((new Date())).format("YYYY");
            //s.ddl_month = moment((new Date())).format("MM");
            h.post("../cSSJobDescription/InitializeData").then(function (d)
            {
                s.isAO                      = d.data.log_in_as_AO == "True" ? true : false;
                s.access_roles              = d.data.um;
                s.empl_type_list            = d.data.employment_type_list;
                s.employee_list             = d.data.employee_list;
                s.ddl_department_val_descr  = d.data.userlogin_masterinfo.department_name1;
                s.ddl_division_val_descr    = d.data.userlogin_masterinfo.division_name1;
                s.ddl_section_val_descr     = d.data.userlogin_masterinfo.section_name1;
                s.emp_position_code         = d.data.userlogin_masterinfo.position_code;
                if (s.isAO == true && d.data.ao_assignment != null)
                {
                    s.emp_department_code   = d.data.ao_assignment.department_code;
                    s.emp_division_code     = d.data.ao_assignment.division_code;
                    s.emp_section_code      = d.data.ao_assignment.section_code;
                }
                else
                {
                    s.emp_department_code   = d.data.userlogin_masterinfo.department_code;
                    s.emp_division_code     = d.data.userlogin_masterinfo.division_code;
                    s.emp_section_code      = d.data.userlogin_masterinfo.section_code;
                }
               

                s.ddl_employmenttype_val   = d.data.userlogin_masterinfo.employment_type;
                s.ddl_employee_val         = d.data.userlogin_masterinfo.empl_id;
                s.emp_id                   = d.data.userlogin_masterinfo.empl_id;
                s.approval_list            = d.data.vw_approval_list;
                s.getEmployeePosition();
                init_table_data([]);
                init_table_data_common([]);
                init_table_data_task([]);
                init_table_data_task_common([]);
                s.allowAdd = d.data.um.allow_add;
            });

        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }
    init()

    var init_table_data = function (par_data)
    {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {
                data: s.datalistgrid,
                sDom: 'rt<"bottom"ip>',
                pageLength: 10,
                columns: [
                    //{ "mData": "fjd_code", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "fjd_descr", "mRender": function (data, type, full, row) { return "<span class='text-left btn-block'> &nbsp;" + data + "</span>" } },
                    {
                        "mData": "fjd_type", "mRender": function (data, type, full, row)
                        {
                            var display_descr = "";
                            if (data == "L")
                            {
                                display_descr = "Leadership"
                            }
                            else if (data == "C") {
                                display_descr = "Core"
                            }
                            else if (data == "F") {
                                display_descr = "Functional"
                            }
                            return "<span class='text-center btn-block'>" + display_descr + "</span>"
                        }
                    },
                    {
                        "mData": "fjd_percent_weight",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "fjd_flag",
                        "mRender": function (data, type, full, row) {
                            var display_data = data == true ? "COMMON" : "MANUAL";
                            return "<span class='text-center btn-block'> &nbsp;" + display_data + "</span>"
                        }
                    },
                    {
                        "mData": "fjd_flag",
                        "bSortable": false,
                        "mRender": function (data, type, full, row)
                        {
                            var allow_delete = s.access_roles.allow_delete;
                            var allow_edit   = s.access_roles.allow_edit;
                            var icon_set = data == true ? "fa-eye" : "fa-edit";
                            if ($("#ddl_position_val option:selected").val() != "")
                            {
                                if (full["appl_status"] != "N" && full["appl_status"] != "C") {
                                    allow_delete = false;
                                }
                            }
                            

                            return '<center><div class="btn-group">' +
                                '<button type="button" ng-disabled="!' + allow_edit + '" class="btn btn-warning btn-sm"  ng-click="btn_show_taks(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Add Task">  <i class="fa fa-plus"></i></button >' +
                                '<button type="button" ng-disabled="!' + allow_edit + '" class="btn btn-success btn-sm"  ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="View/Edit Details">  <i class="fa ' + icon_set+'"></i></button >' +
                                '<button type="button" ng-disabled="!' + allow_delete + '" class="btn btn-danger btn-sm"  ng-click="btn_del_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                '</div></center>';
                        }
                    }
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            });
    }

    var init_table_data_common = function (par_data) {
        s.datalistgrid_common = par_data;
        s.oTable_common = $('#datalist_grid_common').dataTable(
            {
                data: s.datalistgrid,
                bAutoWidth: false,
                sDom: 'rt<"bottom"ip>',
                pageLength: 10,
                columns: [
                    { "mData": "fjd_code", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "fjd_descr", "mRender": function (data, type, full, row) { return "<span class='text-left btn-block'> &nbsp;" + data + "</span>" } },
                    { "mData": "fjd_percent_weight", "mRender": function (data, type, full, row) { return "<span class='text-right btn-block'> " + data + "%&nbsp;</span>" } },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            return '<center>' +
                                ' <input type="checkbox" id="cmn_' + row["row"] + '" ng-model="cmn_' + row["row"] + '" ng-change="common_include(' + row["row"] + ',cmn_' + row["row"] + ')" class="input-sm" />' +
                                '</center>';
                        }
                    }
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            });
    }


    var init_table_data_task = function (par_data) {
        s.datalistgrid_task = par_data;
        s.oTable_task = $('#datalist_task_grid').dataTable(
            {
                data: s.datalistgrid_task,
                sDom: 'rt<"bottom"ip>',
                bAutoWidth: false,
                pageLength: 10,
                columns: [
                    //{ "mData": "fjd_code", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    {
                        "mData": "task_descr",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            s["task_display" + row["row"]] = full["task_action"] == "A" ? true : false;

                            return "<span class='text-left btn-block' style='padding-left:5px !important;' id='task_display" + row["row"] + "' ng-show='!task_display" + row["row"] + "'>" + data + "</span>" +
                                " <textarea class='form-control' id='txtb_area" + row["row"] + "' ng-show='task_display" + row["row"] + "' ng-disabled='isEditableTask'>" + data + "</textarea>" +
                                "<label class='lbl_required' id='lbl_txtb_area" + row["row"] + "_req'></label>"
                        }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            var allow_delete = s.access_roles.allow_delete;
                            var allow_edit = s.access_roles.allow_edit;

                            s["task_display" + row["row"]] = full["task_action"] == "A" ? true : false;
                            if (full["task_add_mode"] == "C")
                            {
                                allow_edit = false;
                            }
                            var return_html = "";
                            if (s["task_display" + row["row"]] = full["task_action"] == "A")
                            {
                                return_html = '<center><div class="btn-group"><button type="button"  ng-show="task_display' + row["row"] + '" ng-disabled="!' + allow_edit + '"    class="btn btn-success btn-sm"  ng-click="btn_save_task(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Save Task">  <i class="fa fa-save"></i></button >' +
                                    '<button type="button"  ng-show="task_display' + row["row"] + '" ng-disabled="!' + allow_delete + '"  class="btn btn-danger btn-sm"   ng-click="btn_cancel_task(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Cancel"><i class="fa fa-close"></i></button></div></center>';
                            }
                            else {
                                return_html = '<center><div class="btn-group"><button type="button"  ng-show="!task_display' + row["row"] + '" ng-disabled="!' + allow_edit + '" class="btn btn-success btn-sm"  ng-click="btn_edit_task(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit Data">  <i class="fa fa-edit"></i></button >' +
                                    '<button type="button"  ng-show="!task_display' + row["row"] + '" ng-disabled="!' + allow_delete + '" class="btn btn-danger btn-sm"  ng-click="btn_del_row_task(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button></div></center>'
                            }
                            return return_html;
                        }
                    }
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            });
    }



    var init_table_data_task_common = function (par_data)
    {
        s.datalistgrid_task_common = par_data;
        s.oTable_task_common = $('#datalist_commontask_grid').dataTable(
            {
                data: s.datalistgrid_task_common,
                sDom: 'rt<"bottom"ip>',
                bAutoWidth: false,
                pageLength: 10,
                columns: [
                    //{ "mData": "fjd_code", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    {
                        "mData": "task_descr",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            s["task_display" + row["row"]] = full["task_action"] == "A" ? true : false;

                            return "<span class='text-left btn-block' style='padding-left:5px !important;' id='task_display" + row["row"] + "' ng-show='!task_display" + row["row"] + "'>" + data + "</span>";
                        }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row)
                        {
                            return '<center>' +
                                ' <input type="checkbox" id="cmn_task' + row["row"] + '" ng-model="cmn_task' + row["row"] + '" ng-change="common_include_task(' + row["row"] + ',cmn_task' + row["row"] + ')" class="input-sm" />' +
                                '</center>';
                        }
                    }
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            });
    }

    //************************************//
    // Select Department to and get the divisions list
    //************************************// 
    s.getDataGrid_list = function ()
    {
        ValidationResultColor_Filter("All", false);
        s.datalistgrid = [];
        if (s.ddl_position_val != "")
        {
            s.emp_row_key       = $("#ddl_employee_val option:selected").attr("ngx-id");
            var empl_ctrl_nbr   = s.positions_list[s.pos_row_key].empl_ctrl_nbr;
            var empl_id         = s.employee_list[s.emp_row_key].empl_id;  

            if (s.ddl_apprstatus_fil_val == "L")
            {
                if (s.positions_list[s.pos_row_key].allow_create_new == "1") {
                    s.isAllowCreate = true;
                }
                else
                {
                    s.isAllowCreate = false;
                }
            }
            else
            {
                s.isAllowCreate = false;
            }

            h.post("../cSSJobDescription/GetLisgrid_data",
                {
                    par_position_code   : s.ddl_position_val,
                    par_status          : s.ddl_apprstatus_fil_val,
                    par_empl_id         : empl_id
                }).then(function (d) {
                    if (d.data.datalistgrid.length > 0)
                    {
                        s.allowPrint = true;
                        s.datalistgrid = d.data.datalistgrid;
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid);
                        s.txtb_percent_summary = s.datalistgrid[0].fjd_percent_summary+"%";
                    }
                    else {
                        s.allowPrint = false;
                        s.txtb_percent_summary = "0%";
                        s.oTable.fnClearTable();
                    }
                });
        }
        else
        {
            s.datalistgrid = [];
            s.oTable.fnClearTable();
        }
        
    }

    s.ddl_employmenttype_val_change = function ()
    {
        s.employee_list     = [];
        s.ddl_employee_val  = "";
        h.post("../cSSJobDescription/GetEmployee_list",
            {
                par_employment_type : s.ddl_employmenttype_val,
                par_department_code : s.emp_department_code,
                par_division_code   : s.emp_division_code  ,
                par_section         : s.emp_section_code   
            }).then(function (d)
            {
                if (d.data.employee_list.length > 0)
                {
                    s.employee_list = d.data.employee_list;
                    if (!s.isAO)
                    {
                        s.ddl_employee_val = s.emp_id;
                    }
                }
                s.getEmployeePosition();
            }); 

    }

    //************************************//
    // Select Divisions to and get the Sections list
    //************************************// 
    s.getEmployeePosition = function ()
    {
        s.positions_list = [];
        s.ddl_position_val = "";
        if (s.ddl_employee_val != "")
        {
            s.emp_row_key = $("#ddl_employee_val option:selected").attr("ngx-id");
            h.post("../cSSJobDescription/GetPosition_list",
                {
                    par_empl_id: s.ddl_employee_val,
                    par_employment_type: s.ddl_employmenttype_val
                }).then(function (d) {
                    s.positions_list = d.data.positions_list;
                    if (s.positions_list.length == 1)
                    {
                        s.ddl_position_val = s.positions_list[0].position_code;
                        s.ddl_pos_change(0);
                        s.emp_row_key = 0;
                    }
                    else
                    {
                        s.ddl_position_val  = "";
                        s.emp_row_key       = 0;
                        s.ddl_pos_change("X");
                    }

                });
        }
        else
        {
            s.ddl_pos_change("X");
        }
        
    }

    s.btn_save_common_task = function ()
    {
        var btn = document.getElementById('addFinalCommon');
        btn.innerHTML       = '<i class = "fa fa-spinner fa-spin"></i> Saving';
        var check_count     = 0;
        var common_taskt_toSave   = [];
        for (x = 0; x < s.datalistgrid_task_common.length;x++)
        {
            if (s.datalistgrid_task_common[x].task_action == "A")
            {
                check_count = check_count + 1;
                common_taskt_toSave.push(s.datalistgrid_task_common[x]); //Only Check Item
            }
        }
        
        if (check_count > 0)
        {
            h.post("../cSSJobDescription/SaveCommonTaskToDatabase",
                {
                    par_common_list: common_taskt_toSave ,
                    par_empl_id: s.positions_list[s.pos_row_key].empl_id
                }).then(function (d)
                {
                    if (d.data.message == "success")
                    {

                        s.oTable_task.fnClearTable();
                        if (d.data.datalistgrid_task.length > 0)
                        {
                            s.datalistgrid_task = d.data.datalistgrid_task;
                            s.oTable_task.fnAddData(d.data.datalistgrid_task);
                        }
                        swal("Successfully Added!", "Common Task Successfully Added!", "success");
                        $('#modal_task_common').modal("hide");
                    }
                    else
                    {
                        btn.innerHTML = '<i class = "fa fa-save"></i> Saving';
                        swal("Error Message","XXX", "error");
                    }
             });
            
        }
        else
        {
            btn.innerHTML = '<i class = "fa fa-save"></i> Saving';
            swal("Error Message", "Please check item in the grid that you want to be included. Required atleast 1 item.", "error");
        }
    }


    s.btn_show_common_task = function ()
    {
       
        h.post("../cSSJobDescription/GetTaskListCommon",
            {
                par_fjd_code: s.datalistgrid[s.row_header_current].fjd_code,
                par_empl_id: s.positions_list[s.pos_row_key].empl_id

            }).then(function (d)
            {
                s.oTable_task_common.fnClearTable();
                if (d.data.message = "success")
                {
                    s.datalistgrid_task_common = d.data.datalistgrid_task_common;
                    if (s.datalistgrid_task_common.length > 0)
                    {
                        s.oTable_task_common.fnAddData(s.datalistgrid_task_common);
                        $('#modal_task_common').modal({ backdrop: 'static', keyboard: false });
                    }
                    else swal("DATA INFORMATION", "No Common Task For this Job Function!", "info");
                }
                else
                {
                    swal("DATA INFORMATION", "No Common Task For this Job Function or you have already add all common Task for this Job Function/Description!", "info");
                }
            })
    }


    s.btn_show_taks = function (row_id)
    {
        s.row_header_current = row_id;
        s.TaskModalTitle = "Job Description Task Details";
        s.txtb_function = s.datalistgrid[row_id].fjd_descr;
        s.txtb_position = s.positions_list[s.pos_row_key].position_long_title;
        var type_descr = "";
        if (s.datalistgrid[row_id].fjd_type == "L") {
            type_descr = "Leadership"
        }
        else if (s.datalistgrid[row_id].fjd_type == "C") {
            type_descr = "Core"
        }
        else if (s.datalistgrid[row_id].fjd_type == "F") {
            type_descr = "Functional"
        }
        s.txtb_type = type_descr;
        $('#task_modal').modal({ backdrop: 'static', keyboard: false });

        h.post("../cSSJobDescription/GetTaskList",
            {
                par_fjd_code: s.datalistgrid[row_id].fjd_code,
                par_add_mode: "A",
                par_empl_id : s.positions_list[s.pos_row_key].empl_id

            }).then(function (d) {
                s.oTable_task.fnClearTable();

                if (d.data.message = "success") {
                    s.datalistgrid_task = d.data.datalistgrid_task;
                    if (s.datalistgrid_task.length > 0) {
                        s.oTable_task.fnAddData(s.datalistgrid_task);
                    }
                }
            })
    }

    s.btn_cancel_task = function (row_id) {
        if (s.datalistgrid_task[row_id].task_ctrl_nbr == "") {
            s.datalistgrid_task = s.datalistgrid_task.delete(row_id);
            if (s.datalistgrid_task.length != 0) {
                s.oTable_task.fnClearTable();
                s.oTable_task.fnAddData(s.datalistgrid_task);

            } else {
                s.oTable_task.fnClearTable();
            }
        }
        else {
            s.datalistgrid_task[row_id].task_action = "X";
            if (s.datalistgrid_task.length != 0) {
                s.oTable_task.fnClearTable();
                s.oTable_task.fnAddData(s.datalistgrid_task);

            } else {
                s.oTable_task.fnClearTable();
            }
        }

    }

    s.btn_del_row_task = function (row_id) {

        swal({
            title: "Are you sure to delete this Task?",
            text: "",
            icon: "warning",
            buttons: ["NO", "YES"],
            dangerMode: true,
        }).then(function (willDelete) {
            if (willDelete) {
                var data =
                {

                    task_ctrl_nbr   : s.datalistgrid_task[row_id].task_ctrl_nbr,
                    fjd_code        : s.datalistgrid[s.row_header_current].fjd_code,
                    task_descr      : $("#txtb_area" + row_id).val().toString().trim(),
                    empl_id         : s.positions_list[s.pos_row_key].empl_id,
                    task_add_mode   : "A",
                    task_action     : "X",
                    created_dttm    : "",
                    created_by      : "",
                    updated_dttm    : "",
                    updated_by      : ""
                }
                h.post("../cSSJobDescription/SaveTaskToDatabase",
                    {
                        data: data,
                        trans_action: "D"
                    }).then(function (d) {
                        if (d.data.message == "success")
                        {
                            s.datalistgrid_task = s.datalistgrid_task.delete(row_id);
                            if (s.datalistgrid_task.length != 0) {
                                s.oTable_task.fnClearTable();
                                s.oTable_task.fnAddData(s.datalistgrid_task);

                            } else {
                                s.oTable.fnClearTable();
                            }
                            swal("Task has been deleted successfully!", { icon: "success", });

                        }
                        else {
                            swal("Deleting error!", "Data not deleted!", "error");
                        }
                        //btn.innerHTML = '<i class="fa fa-save"> </i> Save';
                    });
            }
        });
    }


    s.btn_add_task = function (row_id)
    {
        s.task_current_action = "A";
        for (var x = 0; x < s.datalistgrid_task.length; x++) {
            if (s.datalistgrid_task[x].task_ctrl_nbr == "") {
                s.datalistgrid_task = s.datalistgrid_task.delete(x);
            }
            else if (s.datalistgrid_task[x].task_ctrl_nbr != "" && s.datalistgrid_task[x].task_action != "X")
            {
                s.datalistgrid_task[x].task_action = "X";
            }
        }

        var data_row =
        {
            task_descr      : "",
            task_ctrl_nbr   : "",
            fjd_code        : "",
            task_add_mode   : "A",
            task_action     : "A"
        }
        s.datalistgrid_task.push(data_row);
        s.oTable_task.fnClearTable();
        s.oTable_task.fnAddData(s.datalistgrid_task);
        $("#txtb_area" + (s.datalistgrid_task.length - 1)).focus();
    }

    s.btn_edit_task = function (row_id)
    {
        for (var x = 0; x < s.datalistgrid_task.length; x++)
        {
            if (s.datalistgrid_task[x].task_ctrl_nbr == "") {
                s.datalistgrid_task = s.datalistgrid_task.delete(x);
            }
            else if (s.datalistgrid_task[x].task_ctrl_nbr != "" && s.datalistgrid_task[x].task_action != "X") {
                s.datalistgrid_task[x].task_action = "X";
            }
        }
        s.task_current_action                   = "U";
        s.oTable_task.fnClearTable();
        s.datalistgrid_task[row_id].task_action = "A";
        s.oTable_task.fnAddData(s.datalistgrid_task);
        $("#txtb_area" + row_id).focus();
    }

    s.btn_save_task = function (row_id)
    {
        $("#txtb_area" + row_id).removeClass("required");
        $("#lbl_txtb_area" + row_id + "_req").text("");

        if ($("#txtb_area" + row_id).val().toString().trim() == "")
        {
            $("#txtb_area" + row_id).addClass("required");
            $("#lbl_txtb_area" + row_id + "_req").text("Required!");
        }
        else {

            var data =
            {

                task_ctrl_nbr   : s.datalistgrid_task[row_id].task_ctrl_nbr,
                fjd_code        : s.datalistgrid[s.row_header_current].fjd_code,
                task_descr      : $("#txtb_area" + row_id).val().toString().trim(),
                empl_id         : s.positions_list[s.pos_row_key].empl_id,
                task_add_mode   : "A",
                task_action     : "X",
                created_dttm    : "",
                created_by      : "",
                updated_dttm    : "",
                updated_by      : ""
            }

            h.post("../cSSJobDescription/SaveTaskToDatabase",
                {
                    data: data,
                    trans_action: s.task_current_action
                }).then(function (d) {

                    if (d.data.message == "success")
                    {
                        if (s.task_current_action == "A")
                        {
                            s.datalistgrid_task[row_id].task_ctrl_nbr = d.data.generated_nbr;
                            s.datalistgrid_task[row_id].task_descr = $("#txtb_area" + row_id).val().toString().trim();
                            s.datalistgrid_task[row_id].task_action = "X";
                        }
                        else
                        {
                            s.datalistgrid_task[row_id].task_descr = $("#txtb_area" + row_id).val().toString().trim();
                            s.datalistgrid_task[row_id].task_action = "X";
                        }
                        s.oTable_task.fnClearTable();
                        s.oTable_task.fnAddData(s.datalistgrid_task);
                        var action_message1 = s.task_current_action == "A" ? "Successfully Added!" : "Successfully Updated!";
                        var action_message2 = s.task_current_action == "A" ? "New record has been added successfully!" : "Record has been updated successfully";
                        swal(action_message1, action_message2, "success");

                    }

                    btn.innerHTML = '<i class="fa fa-save"> </i> Save';
                });
        }
    }


    s.ddl_pos_change = function (index_x)
    {
        if (!isNaN(index_x))
        {
            if (s.ddl_position_val != "")
            {
                s.pos_row_key               = index_x;
                s.ddl_apprstatus_fil_val    = s.positions_list[s.pos_row_key].approval_status;
                s.getPositions_FilterStatus();
                s.getDataGrid_list();
                set_status_display();
            }
            else
            {

                s.getPositions_FilterStatus();
                s.status_descr  = "No Data";
                s.isSubmitted   = true;
                s.datalistgrid  = [];
                s.oTable.fnClearTable();
            }
        }
        else
        {
            s.pos_row_key = $("#ddl_position_val option:selected").attr("ngx-data");

            if (s.ddl_position_val != "")
            {
                s.ddl_apprstatus_fil_val = s.positions_list[s.pos_row_key].approval_status;
                s.status_descr = s.positions_list[s.pos_row_key].approval_status_descr;
                s.getPositions_FilterStatus();
                s.getDataGrid_list();
                set_status_display();
            }
            else
            {
                s.getPositions_FilterStatus();
                s.status_descr = "No Data"
                s.datalistgrid = [];
                s.isSubmitted = true;
                s.oTable.fnClearTable();
            }
        }
    }

    function set_status_display()
    {
        s.status_descr = s.positions_list[s.pos_row_key].approval_status_descr;
        if (s.ddl_apprstatus_fil_val == "S") {
            s.status_color = "#f7a54a";
        }
        else if (s.ddl_apprstatus_fil_val == "N") {
            s.status_color = "#1AB394";
        }
        else if (s.ddl_apprstatus_fil_val == "D" || s.ddl_apprstatus_fil_val == "L") {
            s.status_color = "Red";
        }
        else {
            s.status_color = "Blue";
        }

        if (s.ddl_apprstatus_fil_val != "N" && s.ddl_apprstatus_fil_val != "C") {
            s.isSubmitted = true;
        }
        else {
            s.isSubmitted = false;
        }
    }

    s.getPositions_FilterStatus = function ()
    {
        h.post("../cSSJobDescription/GetFilterStatus",
            {
                par_position_code   : s.ddl_position_val,
                par_empl_id         : s.ddl_employee_val
            }).then(function (d)
            {
                s.approval_list = [];
                s.approval_list = d.data.status_filters;
                if (s.approval_list.length <= 0 && s.positions_list[s.pos_row_key].empl_ctrl_nbr == "")
                {
                    
                    var status_data =
                    {
                        empl_id                 : s.ddl_employee_val,
                        approval_status         : "N",
                        approval_status_descr   : "New",
                        position_code           : s.ddl_position_val
                    }
                    s.approval_list.push(status_data);
                    s.filterStatusOne = true;
                }
                else if (s.approval_list.length == 1)
                {
                    s.filterStatusOne = true;
                    s.ddl_apprstatus_fil_val = s.positions_list[s.pos_row_key].approval_status;
                }
                else
                {
                    s.filterStatusOne = false;
                }

                s.getDataGrid_list();
            });
    }

    s.ddl_status_filter_change = function ()
    {
        set_status_display();
        s.getDataGrid_list();
    }

    s.common_include = function (row_index,valX)
    {
        s.datalistgrid_common[row_index].include_flag       = valX == true ? "Y" : "X";
    }

    s.common_include_task = function (row_index, valX)
    {
        s.datalistgrid_task_common[row_index].task_action = valX == true ? "A" : "X";
    }

    s.btn_del_row = function (row_id)
    {
        swal({
            title: "Are you sure to delete this record?",
            text: "Once deleted it will also delete the details for common Job functions that is link with this entry.",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(function (willDelete) {
            if (willDelete)
            {
                s.datalistgrid[row_id].empl_ctrl_nbr = s.positions_list[s.pos_row_key].empl_ctrl_nbr;
                h.post("../cSSJobDescription/SaveToDatabase",
                    {
                        data: s.datalistgrid[row_id],
                        trans_action: "D",
                        data_header: s.positions_list[s.pos_row_key]
                    }).then(function (d) {
                        if (d.data.message == "success")
                        {
                            s.getDataGrid_list();
                            //s.datalistgrid = s.datalistgrid.delete(row_id);
                            //if (s.datalistgrid.length != 0)
                            //{
                            //    s.oTable.fnClearTable();
                            //    s.oTable.fnAddData(s.datalistgrid);

                            //} else {
                            //    s.oTable.fnClearTable();
                            //}
                            swal("Your record has been deleted successfully!", { icon: "success", });

                        }
                        else {
                            swal("Deleting error!", "Data not deleted!", "error");
                        }
                        btn.innerHTML = '<i class="fa fa-save"> </i> Save';
                    });
            }
        });
    }
    //**********************************************
    //  Add Two Leading Zero
    //**********************************************
    function str_pad(n) {
        return String("000" + n).slice(-3);
    }

    function clear_fields()
    {
        s.txtb_function_description = "";
        s.txtb_percent_weight       = "";
        s.ddl_fjd_type              = "";
    }

    s.btn_save_common_click = function ()
    {
        var btn = document.getElementById('addFinalCommon');
        btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Saving';
        var check_count = 0;
        var common_toSave = [];
        for (x = 0; x < s.datalistgrid_common.length;x++)
        {
            if (s.datalistgrid_common[x].include_flag == "Y")
            {
                check_count = check_count + 1;

                common_toSave.push(s.datalistgrid_common[x]); //Only Check Item
            }
        }
        
        if (check_count > 0)
        {
            var data = {
                empl_ctrl_nbr       :s.positions_list[s.pos_row_key].empl_ctrl_nbr,
                empl_id             :s.positions_list[s.pos_row_key].empl_id,
                position_code       :s.positions_list[s.pos_row_key].position_code,
                approval_id         :s.positions_list[s.pos_row_key].approval_id,
                approval_status     :s.positions_list[s.pos_row_key].approval_status,
                department_code     :s.positions_list[s.pos_row_key].department_code,
                subdepartment_code  :s.positions_list[s.pos_row_key].subdepartment_code,
                division_code       :s.positions_list[s.pos_row_key].division_code,
                section_code        :s.positions_list[s.pos_row_key].section_code,
                created_dttm        :"",
                created_by          :"",
                updated_dttm        :"",
                updated_by          :""
            }
            h.post("../cSSJobDescription/SaveCommonToDatabase",
                {
                    data                : data,
                    par_common_list     : common_toSave,
                    par_employment_type : s.ddl_employmenttype_val
                }).then(function (d)
                {
                    if (d.data.message == "success")
                    {
                        s.positions_list[s.pos_row_key].empl_ctrl_nbr = d.data.data.empl_ctrl_nbr; //Get the updated ctrl nbr
                        s.getDataGrid_list();

                        btn.innerHTML = '<i class = "fa fa-save"></i> Save';
                        swal("Successfully Added!", "Common Successfully Added!", "success");
                        $('#main_modal_common').modal("hide");
                    }
                    else
                    {
                        btn.innerHTML = '<i class = "fa fa-save"></i> Saving';
                        swal("Error Message","XXX", "error");
                    }
             });
            
        }
        else
        {
            btn.innerHTML = '<i class = "fa fa-save"></i> Saving';
            swal("Error Message", "Please check item in the grid that you want to be included. Required atleast 1 item.", "error");
        }
    }

    s.btn_submit_click = function ()
    {
        var btn = document.getElementById('submitFinal');
        btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Submitting';
        if (s.datalistgrid.length > 0)
        {
            var data =
            {
                empl_ctrl_nbr   : s.positions_list[s.pos_row_key].empl_ctrl_nbr,
                fjd_code        : s.txtb_fjd_code,
                fjd_descr       : s.txtb_function_description,
                fjd_flag        : false,
                created_dttm    : "",
                created_by      : "",
                updated_dttm    : "",
                updated_by      : ""
            }

            var data_hdr =
            {
                empl_ctrl_nbr       : s.positions_list[s.pos_row_key].empl_ctrl_nbr,
                empl_id             : s.positions_list[s.pos_row_key].empl_id,
                position_code       : s.positions_list[s.pos_row_key].position_code,
                approval_id         : s.positions_list[s.pos_row_key].approval_id,
                approval_status     : "S",
                department_code     : s.positions_list[s.pos_row_key].department_code,
                subdepartment_code  : s.positions_list[s.pos_row_key].subdepartment_code,
                division_code       : s.positions_list[s.pos_row_key].division_code,
                section_code        : s.positions_list[s.pos_row_key].section_code,
                created_dttm        : "",
                created_by          : "",
                updated_dttm        : "",
                updated_by          : ""
            }

            h.post("../cSSJobDescription/SaveToDatabase",
                {
                    data: data,
                    trans_action: "S",
                    data_header: data_hdr
                }).then(function (d) {
                    if (d.data.message == "success")
                    {
                        s.positions_list[s.pos_row_key].empl_ctrl_nbr           = d.data.data.empl_ctrl_nbr; //Get the updated ctrl nbr
                        s.positions_list[s.pos_row_key].approval_status         = "S"; //Get the updated ctrl nbr
                        s.positions_list[s.pos_row_key].approval_status_descr = "Submitted";
                        s.ddl_apprstatus_fil_val = s.positions_list[s.pos_row_key].approval_status;
                        s.getPositions_FilterStatus();
                        s.getDataGrid_list();
                        set_status_display();
                        btn.innerHTML = '<i class = "fa fa-send"></i> Submit';
                        swal("Successfully Submitted!", "Application Successfully submitted!", "success");
                        s.isSubmitted = true;
                    }
                    else
                    {
                        swal("Error Message", d.data.message, "error");
                    }

                    btn.innerHTML = '<i class="fa fa-send"> </i> Submit';
                });
        }
        else
        {
            btn.innerHTML = '<i class = "fa fa-send"></i> Submit';
            swal("Error Message", "Employee Job Fucntion application connot be submitted. It requires atleast 1 details or entry.", "error");
        }
    }

    s.btn_save_click_header = function ()
    {
        btn             =  document.getElementById('addFinal_header');
        btn.innerHTML   = '<i class = "fa fa-spinner fa-spin"></i> Saving';
        btn.innerHTML   = '<i class = "fa fa-save"></i> Save';
        swal("Successfully Save!", "Application Successfully save!", "success");
                
    }

    s.btn_create_newApplication = function ()
    {
        swal({
            title: "FOR CONFIRMATION",
            text: "Are you sure to create new application for this cancelled application?",
            icon: "info",
            buttons: ["NO","YES CREATE"],
            dangerMode: true,
        }).then(function (willDelete)
        {
            if (willDelete)
            {

                var data_hdr =
                {
                    empl_ctrl_nbr       :"",
                    empl_id             :s.positions_list[s.pos_row_key].empl_id,
                    position_code       :s.positions_list[s.pos_row_key].position_code,
                    approval_id         :"",
                    approval_status     :"N",
                    department_code     :s.positions_list[s.pos_row_key].department_code,
                    subdepartment_code  :s.positions_list[s.pos_row_key].subdepartment_code,
                    division_code       :s.positions_list[s.pos_row_key].division_code,
                    section_code        :s.positions_list[s.pos_row_key].section_code,
                    created_dttm        :"",
                    created_by          :"",
                    updated_dttm        :"",
                    updated_by          :""
                }

                h.post("../cSSJobDescription/SaveCreateNewHeader",
                    {
                        data_header: data_hdr
                    }).then(function (d) {
                        if (d.data.message == "success")
                        {
                            console.log(d.data);
                            var status_data =
                            {
                                empl_id:s.ddl_employee_val,
                                approval_status: "N",
                                approval_status_descr: "New",
                                position_code:s.ddl_position_val
                            }
                            s.ddl_apprstatus_fil_val = s.positions_list[s.pos_row_key].approval_status;
                            s.positions_list[s.pos_row_key].approval_status         = d.data.data_hdr.approval_status;
                            s.positions_list[s.pos_row_key].approval_status_descr   = "New";
                            s.positions_list[s.pos_row_key].allow_create_new        = "0";
                            s.positions_list[s.pos_row_key].empl_ctrl_nbr           = d.data.data_hdr.empl_ctrl_nbr;
                            s.approval_list.push(status_data);
                            set_status_display();
                            s.getDataGrid_list();
                            swal("You have successfully created a new application for the cancelled application!", { icon: "success", });

                        }
                        else
                        {
                            swal("Deleting error!", "Data not deleted!", "error");
                        }
                        //btn.innerHTML = '<i class="fa fa-save"> </i> Save';
                    });
            }
        });
    }

    s.btn_save_click = function (par_action)
    {
        
        var btn             = s.trans_actionX == "A" ? document.getElementById('addFinal') : document.getElementById('edit');
        btn.innerHTML   = '<i class = "fa fa-spinner fa-spin"></i> Saving';
     
        if (ValidateFields() == true)
        {
            var data =
            {
                empl_ctrl_nbr       :s.positions_list[s.pos_row_key].empl_ctrl_nbr,
                fjd_code            :s.txtb_fjd_code,
                fjd_descr           :s.txtb_function_description,
                fjd_flag            :false,
                created_dttm        :"",
                created_by          :"",
                updated_dttm        :"",
                updated_by          :"",
                fjd_percent_weight  :s.txtb_percent_weight,
                fjd_type            :s.ddl_fjd_type,
                fjd_orig_added      :"M"
            }

            var data_hdr =
            {
                empl_ctrl_nbr       :s.positions_list[s.pos_row_key].empl_ctrl_nbr,
                empl_id             :s.positions_list[s.pos_row_key].empl_id,
                position_code       :s.positions_list[s.pos_row_key].position_code,
                approval_id         :s.positions_list[s.pos_row_key].approval_id,
                approval_status     :s.positions_list[s.pos_row_key].approval_status,
                department_code     :s.positions_list[s.pos_row_key].department_code,
                subdepartment_code  :s.positions_list[s.pos_row_key].subdepartment_code,
                division_code       :s.positions_list[s.pos_row_key].division_code,
                section_code        :s.positions_list[s.pos_row_key].section_code,
                created_dttm        :"",
                created_by          :"",
                updated_dttm        :"",
                updated_by          :""
            }

            h.post("../cSSJobDescription/SaveToDatabase",
                {
                    data: data,
                    trans_action: s.trans_actionX,
                    data_header: data_hdr
                }).then(function (d)
                {
                    if (d.data.message == "success")
                    {
                        s.positions_list[s.pos_row_key].empl_ctrl_nbr = d.data.data.empl_ctrl_nbr; //Get the updated ctrl nbr
                        s.getDataGrid_list();
                        setTimeout(function () {
                            for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                                if (get_page(data.fjd_code) == false) {

                                    s.oTable.fnPageChange(x);
                                }
                                else {
                                    break;
                                }
                            }
                        }, 300);
                       

                        btn.innerHTML = '<i class = "fa fa-save"></i> Save';
                        swal("Successfully Added!", "Record Successfully Added!", "success");
                        $('#main_modal').modal("hide");
                    }
                    else if (d.data.message == "Y")
                    {
                        //swal("Error Message", "The position already exist with the following office assignment combination!", "error");
                        $("#txtb_employee_add").addClass("required");
                        $("#lbl_txtb_employee_add_req").text($("#txtb_employee_add").val()+" already exist with the following office assignment combination!");
                    }
                    else
                    {
                        swal("Error Message", d.data.message, "error");
                       
                    }

                    btn.innerHTML = '<i class="fa fa-save"> </i> Save';
                });
        }
        else
        {
            btn.innerHTML = '<i class="fa  fa-save"> </i> Save';
        }
    }

    s.btn_addcommon_click = function ()
    {
        console.log(s.positions_list[s.pos_row_key]);
        if (ValidateFilters())
        {
            h.post("../cSSJobDescription/GetCommonJD",
                {
                    par_department_code : s.positions_list[s.pos_row_key].department_code,
                    par_division_code   : s.positions_list[s.pos_row_key].division_code,
                    par_section_code    : s.positions_list[s.pos_row_key].section_code,
                    par_applcode        : s.positions_list[s.pos_row_key].empl_ctrl_nbr,
                    par_position_code   :s.positions_list[s.pos_row_key].position_code,
                    par_employment_type :s.positions_list[s.pos_row_key].employment_type
                }).then(function (d)
                {
                    s.datalistgrid_common = d.data.common_fjd;
                    if (s.datalistgrid_common.length > 0)
                    {
                        s.txtb_employee_name_dsp    = $("#ddl_employmenttype_val option:selected").html();
                        s.txtb_empl_id              = s.ddl_employee_val;
                        s.txtb_position             = $("#ddl_position_val option:selected").html();
                        
                        s.oTable_common.fnClearTable();
                        s.oTable_common.fnAddData(s.datalistgrid_common);
                        $('#main_modal_common').modal({ backdrop: 'static', keyboard: false });
                    }
                    else
                    {
                        swal("DATA INFORMATION","No Common Job Function For this position!", "info");
                    }
                    
                });

        }
    }
    
    s.btn_add_click = function ()
    {
        clear_fields();
        s.isAdd                 = true;
        s.trans_actionX         = "A";
        s.ModalTitle            = "ADD EMPLOYEE JOB FUNCTION/DESCRIPTION";
        ValidationResultColor("ALL", false);
        s.editTable = true;
        var btn =  document.getElementById('addFinal');
        btn.innerHTML = '<i class = "fa fa-save"></i> Save';
        h.post("../cSSJobDescription/GenerateKeyCode",
            {
                par_department_code : s.positions_list[s.pos_row_key].department_code,
                par_position_code   : s.positions_list[s.pos_row_key].position_code
            }).then(function (d)
            {
                s.txtb_fjd_code             = d.data.fjd_code;
                s.txtb_employee_val         = $('#ddl_employmenttype_val option:selected').html();
                s.txtb_position             = s.positions_list[s.pos_row_key].position_long_title;
                $('#main_modal').modal({ backdrop: 'static', keyboard: false });
            });
    }



    s.btn_edit_action = function (row_id) {
        try {
            ValidationResultColor("ALL", false);
           
            
            s.editRow_id    = row_id;
            s.isAdd         = false;
            s.trans_actionX = "U";

            s.ModalTitle = "VIEW ENTRY DETAILS";
           
            
            if ((s.datalistgrid[row_id].appl_status == "N"
                || s.datalistgrid[row_id].appl_status == "C")
                && s.datalistgrid[s.editRow_id].fjd_flag == false)
            {
                s.editTable     = true;
                s.editPercent   = true;
            }
            else if ((s.datalistgrid[row_id].appl_status == "N"
                || s.datalistgrid[row_id].appl_status == "C") && s.datalistgrid[s.editRow_id].fjd_flag == true)
            {
                s.editTable = false;
                s.editPercent = true;
            }
            else
            {
                s.editPercent = false;
                s.editTable = false;
            }

            s.txtb_employee_val         = $('#ddl_employmenttype_val option:selected').html();
            s.txtb_position             = s.positions_list[s.pos_row_key].position_long_title;

            s.txtb_fjd_code             = s.datalistgrid[s.editRow_id].fjd_code;
            s.txtb_function_description = s.datalistgrid[s.editRow_id].fjd_descr;
            s.txtb_percent_weight       = s.datalistgrid[s.editRow_id].fjd_percent_weight;
            s.ddl_fjd_type              = s.datalistgrid[s.editRow_id].fjd_type;
           
            setTimeout(function ()
            {
                $('#main_modal').modal({ backdrop: 'static', keyboard: false });
            }, 300);

        } catch (e) {
            swal({ icon: "warning", title: e.message });
        }
    }

    s.btn_go_todetails = function (row_id) {
        h.post("../cSSJobDescription/PreviousValuesonPage_cSSJobDesHDR",
            {
                par_employment_type : $('#ddl_employmenttype_val option:selected').val(),
                par_department_code : $('#ddl_department_val option:selected').val(),
                par_division_code   : s.datalistgrid[row_id].division_code,
                par_section_code    : s.datalistgrid[row_id].section_code,
                par_applcode        : s.datalistgrid[row_id].applcode,
                par_empl_id         : s.ddl_employee_val,
                par_budget_year     : s.ddl_budget_year_val

            }).then(function (d)
            {
                var url = "";
                url = "/cSSJobDescriptionDTL";

                if (url != "") {
                    window.location.href = url;
                }
            })
    }

    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFilters()
    {
        var return_val = true;
        ValidationResultColor_Filter("ALL", false);
       
        if ($('#ddl_employee_val option:selected').val().trim() == "") {
            ValidationResultColor_Filter("ddl_employee_val", true);
            return_val = false;
        }

        if ($('#ddl_position_val option:selected').val().trim() == "") {
            ValidationResultColor_Filter("ddl_position_val", true);
            return_val = false;
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
        var regex_prop_number = /^\d*\.?\d*$/;
        if ($('#txtb_function_description').val().trim() == "")
        {
            ValidationResultColor("txtb_function_description", true);
            return_val = false;
        }

        if ($('#ddl_fjd_type option:selected').val().trim() == "")
        {
            ValidationResultColor("ddl_fjd_type", true);
            return_val = false;
        }

        if ($('#txtb_percent_weight').val().trim() == "")
        {
            ValidationResultColor("txtb_percent_weight", true);
            return_val = false;
        }
        if ((regex_prop_number.test($("#txtb_percent_weight").val().trim()) == false))
        {
            ValidationResultColor("txtb_percent_weight", true);
            $("#lbl_txtb_percent_weight_req").text("Invalid Value!");
            return_val = false;
        }
        return return_val;
    }

    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidationResultColor(par_object_id, par_v_result)
    {
        if (par_v_result)
        {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else {
            //remove of refresh the object form being required
            $("#txtb_function_description").removeClass("required");
            $("#lbl_txtb_function_description_req").text("");
            $("#lbl_txtb_function_description_req").html("");

            $("#txtb_percent_weight").removeClass("required");
            $("#lbl_txtb_percent_weight_req").text("");
            $("#lbl_txtb_percent_weight_req").html("");

            $("#ddl_fjd_type").removeClass("required");
            $("#lbl_ddl_fjd_type_req").text("");
            $("#lbl_ddl_fjd_type_req").html("");
        }
    }

    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidationResultColor_Filter(par_object_id, par_v_result) {
        if (par_v_result) {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field!");
        }
        else {
            //remove of refresh the object form being required

            $("#ddl_employee_val").removeClass("required");
            $("#lbl_ddl_employee_val_req").text("");

            $("#ddl_position_val").removeClass("required");
            $("#lbl_ddl_position_val_req").text("");
        }
    }

    s.btn_print_click = function () {
        try {
            $('#print_preview_modal').modal({ backdrop: 'static', keyboard: false });
            $('#loading_r').css("display", "block");
            s.Modal_title   = "PREPARING REPORT PLEASE WAIT..";
            s.loading_r = true;
            //s.loading_r = false;
            s.Modal_title   = "DTR PRINT VIEW.";
            var controller  = "Reports"
            var action      = "Index"
            var ReportName  = "cryEmployeeJobDescription"
            var SaveName    = "Crystal_Report"
            var ReportType  = "inline"
            var ReportPath = "~/Reports/cryEmployeeJobDescription/cryEmployeeJobDescription.rpt"
            var sp          = ""
            sp = "sp_employee_jobdescription_rep,par_empl_ctrl_nbr," + s.positions_list[s.pos_row_key].empl_ctrl_nbr;
            

            //var body = document.getElementById('iframe_content');
            //body.style.overflow = "hidden"
            var params = ""

           


            var iframe = document.getElementById('ReportFrame');
            var iframe_page = $("#ReportFrame")[0];
            iframe.style.visibility = "hidden";
            console.log(iframe);
            s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + params
                + "&ReportName=" + ReportName
                + "&SaveName=" + SaveName
                + "&ReportType=" + ReportType
                + "&ReportPath=" + ReportPath
                + "&id=" + sp

            if (!/*@cc_on!@*/0) { //if not IE
                iframe.onload = function () {
                    iframe.style.visibility = "visible";
                    $('#loading_r').css("display", "none");
                    $('#ReportFrame').css("display", "block");
                };
            }
            else if (iframe_page.innerHTML())
            {
                // get and check the Title (and H tags if you want)
                var ifTitle = iframe_page.contentDocument.title;
                if (ifTitle.indexOf("404") >= 0) {
                    swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                    iframe.src = "";
                    $('#loading_r').css("display","none");
                }
                else if (ifTitle != "") {
                    swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                    iframe.src = "";
                    $('#loading_r').css("display", "none");
                }
            }
            else {
                iframe.onreadystatechange = function () {
                    if (iframe.readyState == "complete")
                    {
                        iframe.style.visibility = "visible";
                        $('#loading_r').css("display", "none");
                        $('#ReportFrame').css("display", "block");
                        //$("#loading_data").modal("hide")
                    }
                };
            }
            $("#ReportFrame").attr("src", "../Reports/CrystalViewer.aspx?Params=" + params
                + "&ReportName=" + ReportName
                + "&SaveName=" + SaveName
                + "&ReportType=" + ReportType
                + "&ReportPath=" + ReportPath
                + "&id=" + sp
            );
            iframe.src = s.embed_link;
           // $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
                        
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }


    function get_page(dtr_date)
    {
        var nakit_an = false;
        var rowx = 0;
        var confirm = 0;
        $('#datalist_grid tr').each(function ()
        {
            $.each(this.cells, function (cells) {
                if (cells == 0)
                {
                    if ($(this).text() == dtr_date)
                    {
                        confirm = confirm + 1;
                        nakit_an = true;
                        return false;
                    }
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

    // ******************************************
    // * VJA - 02/29/2020 - Search
    // ****************************************** 
    s.search_in_list = function (value, table) {
        $("#" + table).DataTable().search(value).draw();
    }

    // ******************************************
    // * VJA - 02/29/2020 - Set the Number of Row
    // ****************************************** 
    s.setNumOfRow = function (value, table) {
        $("#" + table).DataTable().page.len(value).draw();
    }

    Array.prototype.delete = function (code) {
        return this.filter(function (d, k) {
            return k != code
        })
    }

})