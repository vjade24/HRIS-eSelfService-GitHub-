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
ng_selfService_App.controller("cDepJobDescription_Ctrl", function ($scope, $compile, $http, $filter) {
    var s = $scope;
    var h = $http;

    s.rowLen                = "10";
    s.year                  = [];
    s.ddl_year              = "";
    s.ddl_month             = "";

    s.positions_list        = [];
    s.empl_type_list        = [];
    s.budge_years           = [];
    s.datalistgrid          = [];
    s.department_list       = [];
    s.datalistgrid_task     = [];
    s.show_btn_approve      = false;
    s.allowAdd              = false;
    s.editTable             = false;
    s.access_roles          = [];
    //*****Page Filter Object Models******//
    s.editRow_id                = "";
    //************************************//
    
    s.emp_department_code   = "";
    s.emp_division_code     = "";
    s.emp_section_code      = "";
    s.def_budget_year       = "";
    s.may_asign_dep         = [];
    s.allow_for_this_page   = false;
    s.role_id = "";
    s.ddl_dep = "";
    s.ifHR = false;
    function init() {
        try {
            
            h.post("../cDepJobDescription/InitializeData").then(function (d)
            {
                s.isAO              = d.data.log_in_as_AO == "True" ? true : false;
                s.access_roles      = d.data.um;
                s.empl_type_list    = d.data.employment_type_list;
                s.employee_list     = d.data.employee_list;
                s.department_list   = d.data.department_tbl_list;
                s.ddl_department_val_descr  = d.data.userlogin_masterinfo.department_name1;
                s.ddl_division_val_descr    = d.data.userlogin_masterinfo.division_name1;
                s.ddl_section_val_descr     = d.data.userlogin_masterinfo.section_name1;
                s.budge_years               = d.data.budget_yearx;
                console.log(d.data.userlogin_masterinfo);
                if (d.data.userlogin_masterinfo.empl_id == "2092"
                    || d.data.userlogin_masterinfo.empl_id == "0644"
                    || d.data.userlogin_masterinfo.empl_id == "2092"
                ) {
                    s.ifHR = true;
                }
                else
                {
                    s.ifHR = false;
                }

                $("#ddl_positions").select2().on('change', function (e) {
                   
                });
                s.role_id = d.data.user_role[0];
                if (s.ifHR == true)
                {
                    s.allow_for_this_page = true;
                }
                else if ((s.role_id != "991" && d.data.may_asign_dep == null) 
                ) {
                    $('#warning_modal').modal({ backdrop: 'static', keyboard: false });
                    s.allow_for_this_page = false;
                }
                else if (
                   ( d.data.may_asign_dep == null
                        && s.role_id != "991")
                )
                {
                    $('#warning_modal').modal({ backdrop: 'static', keyboard: false });
                    s.allow_for_this_page = false;
                }
                else
                {
                    s.allow_for_this_page = true;
                }
                if (s.isAO == true && d.data.ao_assignment != null)
                {
                    s.emp_department_code   = d.data.ao_assignment.department_code;
                    s.ddl_dep               = d.data.ao_assignment.department_code;
                    s.emp_division_code     = d.data.ao_assignment.division_code;
                    s.emp_section_code      = d.data.ao_assignment.section_code;
                }
                else {
                    s.emp_department_code   = d.data.userlogin_masterinfo.department_code;
                    s.ddl_dep               = d.data.userlogin_masterinfo.department_code;
                    s.emp_division_code     = d.data.userlogin_masterinfo.division_code;
                    s.emp_section_code      = d.data.userlogin_masterinfo.section_code;
                }


                s.ddl_employmenttype_val = d.data.userlogin_masterinfo.employment_type;
                if (d.data.datalistgrid.length > 0) {
                    init_table_data(d.data.datalistgrid);
                }
                else
                {
                    init_table_data([]);
                }
                s.def_budget_year = d.data.def_budget_year;
                init_table_data_task([]);
                s.allowAdd = d.data.um.allow_add;
            });

        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }
    init()
    $.fn.modal.Constructor.prototype.enforceFocus = function () {

    }
    var init_table_data = function (par_data)
    {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {
                data: s.datalistgrid,
                sDom: 'rt<"bottom"ip>',
                pageLength: 10,
                "order": [[1, "asc"]],
                bAutoWidth: false,
                columns: [
                    {
                        "mData": "item_no",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    { "mData": "position_title1", "mRender": function (data, type, full, row) { return "<span class='text-left btn-block'> &nbsp;&nbsp;" + data + "</span>"; } },
                   
                    {
                        "mData": "percent_descr",
                        "mRender": function (data, type, full, row) {
                            var html_ret = "";
                            html_ret = full["division_name1"].toString().trim() != "" ? "<small><b>Division</b>: " + full["division_name1"].toString().trim() + "</small><br>" : "";
                            html_ret = html_ret + (full["section_name1"].toString().trim() != "" ? "<small><b>Section</b>: " + full["section_name1"].toString().trim() + "</small><br>" : "");
                            html_ret = html_ret + (full["unit_name1"].toString().trim() != "" ? "<small><b>Unit</b>: " + full["unit_name1"].toString().trim() + "</small><br>" : "");

                            return html_ret;
                        }
                    },
                    {
                        "mData": "percent_descr",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "%</span>";
                        }
                    },
                   
                    {
                        "mData": "fjd_flag",
                        "bSortable": false,
                        "mRender": function (data, type, full, row)
                        {
                            var allow_delete = s.access_roles.allow_delete;
                            var allow_edit = s.access_roles.allow_edit;
                            var icon_set = data == true ? "fa-eye" : "fa-edit";

                            return '<center><div class="btn-group">' +
                                '<button type="button" ng-disabled="!' + allow_edit + '" class="btn btn-warning btn-sm"  ng-click="btn_show_jobdescription(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="View Job Description">  <i class="fa fa-plus"></i></button >' +
                                //'<button type="button" ng-disabled="!' + allow_edit +'" class="btn btn-success btn-sm"  ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="View/Edit Details">  <i class="fa ' + icon_set + '"></i></button >' +
                                '<button type="button" ng-disabled="!' + allow_delete + ' || ' + true + '" class="btn btn-primary btn-sm"  ng-click="btn_print(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="print job description"><i class="fa fa-print"></i></button>' +
                                //'<button type="button" ng-disabled="!' + allow_delete + ' || !' + s.allow_for_this_page+'" class="btn btn-danger btn-sm"  ng-click="btn_del_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                '</div></center>';
                        }
                    }
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            });
    }


    var init_table_data_task = function (par_data)
    {
        s.datalistgrid_task = par_data;

        s.oTable_task = $('#datalist_task_grid').dataTable(
            {
                data: s.datalistgrid_task,
                sDom: 'rt<"bottom"ip>',
                bAutoWidth: false,
                pageLength: 10,
                columns: [
                    { "mData": "job_ctrl_nbr", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    {
                        "mData": "jobdescr_function",
                        "bSortable": false,
                        "mRender": function (data, type, full, row)
                        {
                            return "<span class='text-left btn-block'>&nbsp;" + data + "</span>";
                        }
                    },
                    { "mData": "jobdescr_percent", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "%</span>" } },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row)
                        {
                            var allow_delete = s.access_roles.allow_delete;
                            var allow_edit = s.access_roles.allow_edit;

                            return_html = '<center><div class="btn-group"><button type="button"  ng-show="!task_display' + row["row"] + '" ng-disabled="!' + allow_edit + '" class="btn btn-success btn-sm"  ng-click="btn_edit_job_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit Data">  <i class="fa fa-edit"></i></button >' +
                                '<button type="button"  ng-show="!task_display' + row["row"] + '" ng-disabled="!' + allow_delete + ' || !' + s.allow_for_this_page +'" class="btn btn-danger btn-sm"  ng-click="btn_del_job_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button></div></center>';
                            
                            return return_html;
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
    s.getDataGrid_list = function () {
        ValidationResultColor_Filter("All", false);
        s.datalistgrid = [];
       
        h.post("../cDepJobDescription/GetLisgrid_data",
            {
                dep_code        : s.ddl_dep,
                def_budget_year : s.ddl_budget_year,
                empoyment_type  : s.ddl_employmenttype_val
            }).then(function (d) {
                if (d.data.datalistgrid.length > 0)
                {
                    s.allowPrint    = true;
                    s.datalistgrid = d.data.datalistgrid;
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid);
                }
                else {
                    s.allowPrint = false;
                    s.oTable.fnClearTable();
                }
            });
    }

    s.ddl_employmenttype_val_change = function () {
        s.employee_list = [];
        s.ddl_employee_val = "";
        h.post("../cDepJobDescription/GetEmployee_list",
            {
                par_employment_type: s.ddl_employmenttype_val,
                par_department_code: s.ddl_dep,
                par_division_code: s.emp_division_code,
                par_section: s.emp_section_code
            }).then(function (d) {
                if (d.data.employee_list.length > 0) {
                    s.employee_list = d.data.employee_list;
                    if (!s.isAO) {
                        s.ddl_employee_val = s.emp_id;
                    }
                }
                s.getEmployeePosition();
            });

    }

    s.btn_show_jobdescription = function (row_id)
    {
        s.row_header_current    = row_id;
        s.TaskModalTitle        = "Job Description";
        s.txtb_function         = s.datalistgrid[row_id].position_title1;
        s.txtb_position         = s.datalistgrid[row_id].position_title1;

        s.row_header_current = row_id;
        $('#task_modal').modal({ backdrop: 'static', keyboard: false });

        h.post("../cDepJobDescription/GetJobDescription",
            {
                par_item_no   : s.datalistgrid[row_id].item_no,
                department_code     : s.datalistgrid[row_id].department_code

            }).then(function (d)
            {
                s.oTable_task.fnClearTable();

                if (d.data.message = "success")
                {
                    s.datalistgrid_task = d.data.datalist_jobdescription;
                    if (s.datalistgrid_task.length > 0)
                    {
                        s.oTable_task.fnAddData(s.datalistgrid_task);
                    }
                }
            })
    }

    s.btn_add_position = function ()
    {
        h.post("../cDepJobDescription/GetPosition_list",
            {
                par_employment_type: "RE",
                department_code: s.ddl_dep,
                budget_code: s.def_budget_year

            }).then(function (d)
            {
                s.isAddPos = true;
                if (s.may_asign_dep == null) {
                    $('#ddl_positions').next(".select2-container").hide();
                }
                else {
                    $('#ddl_positions').next(".select2-container").show();
                }
                s.positions_list = d.data.positions_list;
                $('#position_modal').modal({ backdrop: 'static', keyboard: false });
            });
    }
    

    s.btn_del_row = function (row_id) {
        swal({
            title: "Are you sure to delete this position in your department?",
            text: "Deleting this position in your department will also delete the Job Description data for this position.",
            icon: "warning",
            buttons: ["NO","YES"],
            dangerMode: true,
        }).then(function (willDelete)
        {
            if (willDelete)
            {
                h.post("../cDepJobDescription/DeletePositionInPlantilla",
                    {
                        position_code   : s.datalistgrid[row_id].position_code,
                        department_code : s.datalistgrid[row_id].department_code,
                        employment_type : s.datalistgrid[row_id].employment_type,
                        budget_code     : s.datalistgrid[row_id].budget_code,
                        position_title1 : s.datalistgrid[row_id].position_title1
                    }).then(function (d) {
                        if (d.data.message == "success")
                        {
                            s.getDataGrid_list();
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

    s.btn_del_job_row = function (row_id) {
        swal({
            title: "Are you sure to delete this function?",
            text: "",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(function (willDelete) {
            if (willDelete) {
                h.post("../cDepJobDescription/DeleteJobDescription",
                    {
                        par_job_ctrl_nbr: s.datalistgrid_task[row_id].job_ctrl_nbr,
                    }).then(function (d) {
                        if (d.data.message == "success")
                        {
                            s.datalistgrid_task = s.datalistgrid_task.delete(row_id);
                            s.oTable_task.fnClearTable();
                            if (s.datalistgrid_task.length > 0)
                            {
                                s.oTable_task.fnAddData(s.datalistgrid_task);
                            }

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

    function clear_fields() {
        s.txtb_function_description = "";
        s.txtb_percent_weight = "";
        s.ddl_fjd_type = "";
    }

    s.btn_save_click = function (par_action)
    {

        var btn         = s.trans_actionX == "A" ? document.getElementById('addFinal') : document.getElementById('edit');
        btn.innerHTML   = '<i class = "fa fa-spinner fa-spin"></i> Saving';

        if (ValidateFields() == true)
        {
            var data =
            {
                job_ctrl_nbr        :(par_action == "A" ? "":s.datalistgrid_task[s.editRow_id].job_ctrl_nbr),
                item_no             :s.datalistgrid[s.row_header_current].item_no,
                employment_type     :s.datalistgrid[s.row_header_current].employment_type,
                jobdescr_function   :s.txtb_function_description,
                jobdescr_percent    :s.txtb_percent_weight,
                jobdescr_type       :s.ddl_fjd_type,
                comlvl_code         :"",
                created_by          :"",
                created_dttm        :"",
                updated_by          :"",
                updated_dttm        :""
            }

            h.post("../cDepJobDescription/SaveJobDescription",
                {
                    data: data,
                    trans_action: s.trans_actionX
                }).then(function (d)
                {
                    if (d.data.message == "success")
                    {
                        var message_x   = "";
                        var message_x2  = "";
                        if (s.trans_actionX == "A")
                        {
                            s.datalistgrid_task.push(d.data.data);
                            message_x       = "Successfully Added!";
                            message_x2      = "Record Successfully Added!";
                            btn.innerHTML   = '<i class = "fa fa-save"></i> Save';
                        }
                        else
                        {
                            s.datalistgrid_task[s.editRow_id].jobdescr_function = d.data.data.jobdescr_function;
                            s.datalistgrid_task[s.editRow_id].jobdescr_percent  = d.data.data.jobdescr_percent;
                            s.datalistgrid_task[s.editRow_id].jobdescr_type     = d.data.data.jobdescr_type;
                            message_x       = "Successfully Updated!";
                            message_x2      = "Record Successfully Updated!";
                            btn.innerHTML   = '<i class = "fa fa-save"></i> Save Edit';
                        }

                        s.oTable_task.fnClearTable();
                      
                        if (s.datalistgrid_task.length > 0)
                        {
                            s.oTable_task.fnAddData(s.datalistgrid_task);
                        }


                        setTimeout(function ()
                        {
                            for (var x = 1; x <= $('#datalist_task_grid').DataTable().page.info().pages; x++)
                            {
                                if (get_page("datalist_task_grid", d.data.data.job_ctrl_nbr.toString()) == false)
                                {

                                    s.oTable_task.fnPageChange(x);
                                }
                                else {
                                    break;
                                }
                            }
                        }, 300);


                      

                        swal(message_x, message_x2, "success");
                        $('#main_modal').modal("hide");
                    }
                    else if (d.data.message == "Y") {
                        //swal("Error Message", "The position already exist with the following office assignment combination!", "error");
                        $("#txtb_employee_add").addClass("required");
                        $("#lbl_txtb_employee_add_req").text($("#txtb_employee_add").val() + " already exist with the following office assignment combination!");
                    }
                    else {
                        swal("Error Message", d.data.message, "error");

                    }
                });
        }
        else {
            btn.innerHTML = '<i class="fa  fa-save"> </i> Save';
        }
    }


    s.btn_save_postion_click = function (par_action)
    {

        var btn =  document.getElementById('addFinalPosition');
        btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Saving';

        if (ValidateFilters() == true)
        {
            var data =
            {
                budget_code     : s.def_budget_year,
                employment_type : "RE",
                position_code   : $("#ddl_positions option:selected").val(),
                department_code: s.ddl_dep,
                percent_descr   : "0",
                position_title1 : $("#ddl_positions option:selected").html()
            }

            h.post("../cDepJobDescription/SavePositionToPlantilla",
                {
                    data: data,
                    budget_code: s.def_budget_year,
                    employment_type: "RE",
                    trans_action: s.trans_actionX
                }).then(function (d)
                {
                    if (d.data.message == "success")
                    {
                        var message_x   = "";
                        var message_x2  = "";
                        s.datalistgrid.push(data);
                        message_x       = "Successfully Added!";
                        message_x2      = "Record Successfully Added!";
                        btn.innerHTML   = '<i class = "fa fa-save"></i> Save';
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid);
                        if (s.datalistgrid.length > 0)
                        {
                          
                            setTimeout(function () {
                                for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++)
                                {
                                    if (get_page("datalist_grid", d.data.data.position_code.toString()) == false)
                                    {
                                        s.oTable.fnPageChange(x);
                                    }
                                    else {
                                        break;
                                    }
                                }
                            }, 300);
                        }

                     
                        swal(message_x, message_x2, "success");
                        $('#position_modal').modal("hide");
                    }
                    else {
                        swal("Error Message", d.data.message, "error");

                    }
                    btn.innerHTML = '<i class="fa  fa-save"> </i> Save';
                });
        }
        else
        {
            btn.innerHTML = '<i class="fa  fa-save"> </i> Save';
        }
    }

    

    s.btn_add_click = function ()
    {
        clear_fields();
        s.isAdd             = true;
        s.trans_actionX     = "A";
        s.ModalTitle        = "ADD JOB DESCPRIPTION";
        ValidationResultColor("ALL", false);
        s.editTable         = true;
        var btn             = document.getElementById('addFinal');
        btn.innerHTML       = '<i class = "fa fa-save"></i> Save';
        h.post("../cDepJobDescription/GenerateKeyCode",
            {
                par_department_code: s.ddl_dep,
                par_position_code   : ""
            }).then(function (d)
            {
                $('#main_modal').modal({ backdrop: 'static', keyboard: false });
            });
    }



    s.btn_edit_action = function (row_id)
    {
        try
        {
            ValidationResultColor("ALL", false);
            s.editRow_id        = row_id;
            s.isAddPos          = false;
            s.trans_actionX     = "U";

            s.ModalTitle        = "VIEW DETAILS";
            s.txtb_position = s.datalistgrid[row_id].position_title1;
            
            $('#ddl_positions').next(".select2-container").hide();
            
            setTimeout(function ()
            {
                $('#position_modal').modal({ backdrop: 'static', keyboard: false });
            }, 300);

        } catch (e)
        {
            swal({ icon: "warning", title: e.message });
        }
    }

    s.btn_edit_job_action = function (row_id)
    {
        try {
            ValidationResultColor("ALL", false);

            s.editTable     = s.allow_for_this_page == true ? true:false;
            s.editRow_id    = row_id;
            s.isAdd         = s.allow_for_this_page == true ? false:null;
            s.trans_actionX = "U";

            s.ModalTitle = "VIEW ENTRY DETAILS";
            s.txtb_position             = s.datalistgrid_task[row_id].position_title;
            s.txtb_fjd_code             = s.datalistgrid_task[row_id].job_ctrl_nbr;
            s.txtb_function_description = s.datalistgrid_task[row_id].jobdescr_function;
            s.txtb_percent_weight       = s.datalistgrid_task[row_id].jobdescr_percent;
            s.ddl_fjd_type              = s.datalistgrid_task[row_id].jobdescr_type;

            setTimeout(function () {
                $('#main_modal').modal({ backdrop: 'static', keyboard: false });
            }, 300);

        } catch (e) {
            swal({ icon: "warning", title: e.message });
        }
    }

    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFilters() {
        var return_val = true;
        ValidationResultColor_Filter("ALL", false);

        if ($('#ddl_positions option:selected').val().trim() == "") {
            ValidationResultColor_Filter("ddl_positions", true);
            return_val = false;
        }

        return return_val;
    }

    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields() {
        var return_val = true;
        ValidationResultColor("ALL", false);
        var regex_prop_number = /^\d*\.?\d*$/;
        if ($('#txtb_function_description').val().trim() == "") {
            ValidationResultColor("txtb_function_description", true);
            return_val = false;
        }

        if ($('#ddl_fjd_type option:selected').val().trim() == "") {
            ValidationResultColor("ddl_fjd_type", true);
            return_val = false;
        }

        if ($('#txtb_percent_weight').val().trim() == "" && ($('#ddl_fjd_type option:selected').val().trim() == "F" || $('#ddl_fjd_type option:selected').val().trim() == "T")) {
            ValidationResultColor("txtb_percent_weight", true);
            return_val = false;
        }
        if ((regex_prop_number.test($("#txtb_percent_weight").val().trim()) == false)) {
            ValidationResultColor("txtb_percent_weight", true);
            $("#lbl_txtb_percent_weight_req").text("Invalid Value!");
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

            $("#ddl_positions").removeClass("required");
            $("#lbl_ddl_positions_req").text("");
        }
    }

    s.btn_print_click = function () {
        try {
            $('#print_preview_modal').modal({ backdrop: 'static', keyboard: false });
            $('#loading_r').css("display", "block");
            s.Modal_title = "PREPARING REPORT PLEASE WAIT..";
            s.loading_r = true;
            //s.loading_r = false;
            s.Modal_title = "DTR PRINT VIEW.";
            var controller = "Reports"
            var action = "Index"
            var ReportName = "cryEmployeeJobDescription"
            var SaveName = "Crystal_Report"
            var ReportType = "inline"
            var ReportPath = "~/Reports/cryEmployeeJobDescription/cryEmployeeJobDescription.rpt"
            var sp = ""
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
            else if (iframe_page.innerHTML()) {
                // get and check the Title (and H tags if you want)
                var ifTitle = iframe_page.contentDocument.title;
                if (ifTitle.indexOf("404") >= 0) {
                    swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                    iframe.src = "";
                    $('#loading_r').css("display", "none");
                }
                else if (ifTitle != "") {
                    swal("You cannot Preview this Report", "There something wrong!", { icon: "warning" });
                    iframe.src = "";
                    $('#loading_r').css("display", "none");
                }
            }
            else {
                iframe.onreadystatechange = function () {
                    if (iframe.readyState == "complete") {
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


    function get_page(table_id, dtr_date)
    {
        var nakit_an = false;
        var rowx = 0;
        var confirm = 0;
        $('#' + table_id + ' tr').each(function ()
        {
            $.each(this.cells, function (cells)
            {
                if (cells == 0)
                {
                    if ($(this).text().toString().trim() == dtr_date.toString())
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