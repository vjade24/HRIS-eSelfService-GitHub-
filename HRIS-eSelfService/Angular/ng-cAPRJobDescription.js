//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Employee Job Description Approval 
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JOSEPH M. TOMBO JR.      05-18-2021      Code Creation
//**********************************************************************************
ng_selfService_App.controller("cAPRJobDescription_Ctrl", function ($scope, $compile, $http, $filter)
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
    s.datalistgrid      = [];
    s.datalistgrid_common = [];

    s.departments_list    = [];
    s.divisions_list      = [];
    s.sections_list       = [];


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
    s.department_row_key        = 0;
    s.editRow_id                = "";
    //************************************//

    s.emp_department_code       = "";
    s.emp_division_code         = "";
    s.emp_section_code          = "";
    s.emp_employment_type       = "";
    s.emp_appl_code             = "";
    s.emp_budget_code           = "";
    s.emp_position_code         = "";

    s.position_index    = "";
    s.dis_creator       = true;
    s.isNotCommon       = false;

    function init()
    {
        try {

            h.post("../cAPRJobDescription/InitializeData").then(function (d)
            {
                s.isAO                   = d.data.log_in_as_AO == "True" ? true : false;
                s.access_roles           = d.data.um;
                s.empl_type_list         = d.data.employment_type_list;
                s.departments_list       = d.data.department_tbl_list;
                //s.budget_year_list       = d.data.budget_year;
                //s.employee_list          = d.data.employee_list;
                s.ddl_department_val_descr = d.data.userlogin_masterinfo.department_name1;
                s.ddl_division_val_descr   = d.data.userlogin_masterinfo.division_name1;
                s.ddl_section_val_descr    = d.data.userlogin_masterinfo.section_name1;
                s.emp_position_code        = d.data.userlogin_masterinfo.position_code;

                s.ddl_employmenttype_val   = d.data.userlogin_masterinfo.employment_type;

                init_table_data([]);
                init_table_data_common([]);
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
                    { "mData": "fjd_code", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "fjd_descr", "mRender": function (data, type, full, row) { return "<span class='text-left btn-block'> &nbsp;" + data + "</span>" } },
                    {
                        "mData": "fjd_percent_weight",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-right btn-block'>" + data + "% &nbsp;</span>"
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
                            var icon_set = data == true ? "fa-edit" : "fa-edit";
                            //if (s.employee_list[s.emp_row_key].approval_status != "N" && s.employee_list[s.emp_row_key].approval_status != "C")
                            //{
                            //    allow_delete = false;
                            //}

                            return '<center><div class="btn-group">' +
                                //'<button type="button" ng-disabled="!' + allow_edit + '" class="btn btn-warning btn-sm"  ng-click="btn_go_todetails(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Go To Details">  <i class="fa fa-plus"></i></button >' +
                                '<button type="button" ng-disabled="!' + allow_edit + '" class="btn btn-success btn-sm"  ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="View Details">  <i class="fa ' + icon_set+'"></i></button >' +
                                ' <input type="checkbox" id="cmn_' + row["row"] + '" ng-model="cmn_' + row["row"] + '" ng-change="common_include(' + row["row"] + ',cmn_' + row["row"] + ')" class="btn btn-success btn-sm" />' +
                                //'<button type="button" ng-disabled="!' + allow_delete + '" class="btn btn-danger btn-sm"  ng-click="btn_del_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
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
    //************************************//
    // Select Department to and get the divisions list
    //************************************// 
    s.getDataGrid_list = function ()
    {
        if ($("#ddl_employee_val option:selected").val() != "")
        {
            ValidationResultColor_Filter("All", false);
            s.datalistgrid = [];
            var empl_ctrl_nbr = s.employee_list[s.emp_row_key].empl_ctrl_nbr;
            h.post("../cAPRJobDescription/GetLisgrid_data",
                {
                    par_empl_ctrl_nbr: empl_ctrl_nbr,
                    par_employment_type: s.ddl_department_val
                }).then(function (d) {
                    if (d.data.datalistgrid.length > 0) {
                        s.datalistgrid = d.data.datalistgrid;
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid);
                    }
                    else {
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

    s.ddl_employee_val_change = function ()
    {
        s.getEmployeePosition();
    }

    //************************************//
    // Select Divisions to and get the Sections list
    //************************************// 
    s.getEmployeePosition = function ()
    {
        try {
            if ($("#ddl_employee_val option:selected").val() != "")
            {
                s.emp_row_key       = $("#ddl_employee_val option:selected").attr("ngx-id");
                s.txtb_position     = s.employee_list[s.emp_row_key].position_long_title;
                s.status_descr      = s.employee_list[s.emp_row_key].approval_status_descr;
                s.work_list_action  = s.employee_list[s.emp_row_key].next_status == "" ? "Viewing Only":s.employee_list[s.emp_row_key].worklist_action;

                if (s.employee_list[s.emp_row_key].next_status != "")
                {
                    s.dis_creator = false;
                    s.ValidateNextStatus(s.employee_list[s.emp_row_key].next_status);
                }
                else
                {
                    s.dis_creator = true;
                }

                if (s.employee_list[s.emp_row_key].next_status == "")
                {
                    s.action_color = "black";
                }
                else if (s.employee_list[s.emp_row_key].approval_status == "S")
                {
                    s.status_color = "#f7a54a";
                    s.action_color = "#f7a54a";
                }
                else if (s.employee_list[s.emp_row_key].approval_status == "N") {
                    s.status_color = "#1AB394";
                    s.action_color = "#1AB394";
                }
                else if (s.employee_list[s.emp_row_key].approval_status != "D" && s.employee_list[s.emp_row_key].approval_status != "L") {
                    s.status_color = "Red";
                    s.action_color = "Red";
                }
                else {
                    s.status_color = "Blue";
                    s.action_color = "Blue";
                }

                if (s.employee_list[s.emp_row_key].approval_status != "N" && s.employee_list[s.emp_row_key].approval_status != "C") {
                    s.isSubmitted = true;
                }
                else {
                    s.isSubmitted = false;
                }
                s.getDataGrid_list();
            }
            else {
                s.txtb_position     = "";
                s.status_descr      = "--";
                s.work_list_action  = "--";
                s.getDataGrid_list();
                s.dis_creator = true;
            }
        }
        catch (e)
        {
            $("#ddl_employee_val").val("");
            s.txtb_position         = "";
            s.status_descr          = "--";
            s.getDataGrid_list();
            s.dis_creator = true;
        }

    }


    s.ValidateNextStatus = function (next_status)
    {
        if (next_status == "R")
        {
            $("#btn_approve").html('<i class="fa fa-paper-plane-o"></i> Review');
        }
        if (next_status == "1") {
            $("#btn_approve").html('<i class="fa fa-paper-plane-o"></i> Approval Level 1');
        }
        if (next_status == "2") {
            $("#btn_approve").html('<i class="fa fa-paper-plane-o"></i> Approval Level 2');
        }
        if (next_status == "F") {
            $("#btn_approve").html('<i class="fa fa-paper-plane-o"></i> Final Approve');
        }
    }

    //************************************//
    // Select Department to and get the Division list
    //************************************// 
    s.ddl_department_change = function ()
    {
      
        h.post("../cAPRJobDescription/GetDivisions_list",
            {
                par_department_code: s.ddl_department_val
            }).then(function (d)
            {
                s.divisions_list = d.data.divisions_list;
                s.getEmployee_list();
                if ($("#ddl_department_val").val().trim() != "")
                {
                    s.department_row_key = $("#ddl_department_val option:selected").attr("ngx-id");
                }
                else
                {
                    s.department_row_key = 0;
                }
            });
    }

    //************************************//
    // Select Department to and get the Division list
    //************************************// 
    s.getEmployee_list = function ()
    {
        h.post("../cAPRJobDescription/GetEmployees_list",
            {
                par_department_code : s.ddl_department_val,
                par_division_code   : s.ddl_division_val,
                par_section_code    : s.ddl_section_val,
                par_employment_type: s.ddl_employmenttype_val,
                par_approve_only : "N"
            }).then(function (d) {
                s.employee_list = d.data.employee_list;
            });
    }

    //************************************//
    // Select Division to and get the Sections list
    //************************************// 
    s.ddl_division_change = function ()
    {
        s.section_list = [];
        h.post("../cAPRJobDescription/GetSection_list",
            {
                par_department_code : s.ddl_department_val,
                par_division_code   : s.ddl_division_val
            }).then(function (d)
            {
                s.section_list = d.data.sections_list;
                s.getEmployee_list();
            });
    }

    //************************************//
    // Select Division to and get the Sections list
    //************************************// 
    s.ddl_section_change = function ()
    {
        s.getEmployee_list();
    }

    //************************************//
    // Select Division to and get the Sections list
    //************************************// 
    s.ddl_employment_type_change = function ()
    {
        s.getEmployee_list();
    }

    s.common_include = function (row_index,valX)
    {
        s.datalistgrid_common[row_index].include_flag = valX == true ? "Y":"X";
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
    }

    
   

    s.btn_save_click_header = function ()
    {
        btn             =  document.getElementById('addFinal_header');
        btn.innerHTML   = '<i class = "fa fa-spinner fa-spin"></i> Saving';
        btn.innerHTML = '<i class = "fa fa-save"></i> Save';
        swal("Successfully Save!", "Application Successfully save!", "success");
                
    }


    s.btn_save_click = function (par_action)
    {

       var btn             =  document.getElementById('edit');
        btn.innerHTML   = '<i class = "fa fa-spinner fa-spin"></i>  Add As Common';
        
        if (ValidateFields() == true)
        {
            var data =
            {
                empl_ctrl_nbr:s.employee_list[s.emp_row_key].empl_ctrl_nbr,
                fjd_code     :s.datalistgrid[s.editRow_id].fjd_code,
                fjd_descr    :s.txtb_function_description,
                fjd_flag     :true,
                created_dttm :"",
                created_by   :"",
                updated_dttm :"",
                updated_by   :""
            }

            h.post("../cAPRJobDescription/SaveToDatabase",
                {
                    data: data
                }).then(function (d)
                {
                    if (d.data.message == "success")
                    {
                        s.getDataGrid_list();

                        btn.innerHTML = '<i class = "fa fa-save"></i>  Add As Common';
                        swal("Successfully Added!", "Record Successfully Added  To Common Job Description!", "success");
                        $('#main_modal').modal("hide");
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
                    }
                    else
                    {
                        swal("Error Message", d.data.message+": Unable to add in common job description!", "error");
                       
                    }

                    btn.innerHTML = '<i class="fa fa-save"> </i> '+ (par_action == "N" ? "Save" : "Submit");
                });
        }
        else {
            btn.innerHTML = '<i class="fa  fa-save"> </i> ' + (par_action == "N" ? "Save" : "Submit");
        }
    }

    s.btn_addcommon_click = function ()
    {
        console.log(s.positions_list[s.pos_row_key]);
        if (ValidateFilters())
        {
            h.post("../cAPRJobDescription/GetCommonJD",
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
                        s.txtb_employee_name_dsp = $("#ddl_employmenttype_val option:selected").html();
                        s.txtb_empl_id = s.ddl_employee_val;
                        s.txtb_position = $("#ddl_position_val option:selected").html();
                        
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
        h.post("../cAPRJobDescription/GenerateKeyCode",
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



    s.btn_edit_action = function (row_id)
    {
        try
        {
            ValidationResultColor("ALL", false);
            
            s.editRow_id    = row_id;
            s.isAdd         = false;
            s.trans_actionX = "U";

            s.ModalTitle    = "VIEW ENTRY DETAILS";
            s.editTable     = false;
            s.txtb_employee_val         = $('#ddl_employee_val option:selected').html();

            s.txtb_fjd_code             = s.datalistgrid[s.editRow_id].fjd_code;
            s.txtb_function_description = s.datalistgrid[s.editRow_id].fjd_descr;
            s.txtb_percent_weight       = s.datalistgrid[s.editRow_id].fjd_percent_weight;
            //ONLY FINAL APPROVER CAN ADD TO COMMON the job description that is define by each employee
            if (s.datalistgrid[s.editRow_id].fjd_flag                           == false
                && s.employee_list[s.emp_row_key].next_status                   != ""
                && s.departments_list[s.department_row_key].workflow_authority  == 3)
            {
                s.isNotCommon   = true;
            }
            else s.isNotCommon  = false;

            setTimeout(function ()
            {
                $('#main_modal').modal({ backdrop: 'static', keyboard: false });
            }, 300);

        } catch (e) {
            swal({ icon: "warning", title: e.message });
        }
    }

    s.btn_go_todetails = function (row_id)
    {
        h.post("../cAPRJobDescription/PreviousValuesonPage_cSSJobDesHDR",
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
                url = "/cAPRJobDescriptionDTL";

                if (url != "") {
                    window.location.href = url;
                }
            })
    }

    s.btn_approve_click = function ()
    {
        try {
            swal({
                title: "Are you sure to approved this Job Description?",
                text: "This will appeared as a final Job Description of this employee!",
                icon: "warning",
                buttons: true,
                dangerMode: true,

            })
                .then(function (willDelete)
                {
                    if (willDelete)
                    {
                        var data =
                        {
                            empl_ctrl_nbr       :s.employee_list[s.emp_row_key].empl_ctrl_nbr,
                            empl_id             :s.employee_list[s.emp_row_key].empl_id,
                            position_code       :s.employee_list[s.emp_row_key].position_code,
                            approval_id         :s.employee_list[s.emp_row_key].approval_id,
                            approval_status     :s.employee_list[s.emp_row_key].next_status,
                            department_code     :"",
                            subdepartment_code  :"",
                            division_code       :"",
                            section_code        :"",
                            created_dttm        :"",
                            created_by          :"",
                            updated_dttm        :"",
                            updated_by          :""
                        }
                        h.post("../cAPRJobDescription/ReviewApprovedAction",
                            {
                                data    : data,
                                remarks : ""
                            }).then(function (d)
                            {
                                if (d.data.message == "success")
                                {
                                    swal("Successfully " + d.data.save_remarks + "!", "Record Successfully " + d.data.save_remarks + "!", "success");
                                }
                                else
                                {
                                    swal({ icon: "error", title: d.data.message });
                                }
                            });
                    }
                });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
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
    function ValidateFields() {
        var return_val = true;
        ValidationResultColor("ALL", false);

        if ($('#txtb_function_description').val().trim() == "")
        {
            ValidationResultColor("txtb_function_description", true);
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

    function get_page(dtr_date) {
        var nakit_an = false;
        var rowx = 0;
        var confirm = 0;
        $('#datalist_grid tr').each(function () {
            $.each(this.cells, function (cells) {
                if (cells == 0) {
                    if ($(this).text() == dtr_date) {
                        confirm = confirm + 1;
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