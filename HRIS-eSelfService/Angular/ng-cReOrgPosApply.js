//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Re Org
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JOSEPH M. TOMBO JR.      02/12/2020      Code Creation
//**********************************************************************************
ng_selfService_App.controller("cReOrgPosApply_ctrl", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http

    var userid = "";
    s.year = [];
    s.rowLen = "10";
    isCreatorGridAction = true
    s.oTableEmployee = null;
    s.oTableDates = null;

    s.budget_year_list = [];
    s.employment_types_list = [];
    s.departments_list = [];
    s.fundchargest_list = [];
    s.ps_education = [];
    s.ps_eligibility = [];
    s.ps_workexperience = [];
    s.ps_trainings = [];
    s.plantilla_vacant = [];

    tname = ""
    s.temp_row_id = ""
    s.isShowCancelFinal = false;
    s.department_code = "";
    s.ddl_department = "";
    s.ddl_fund_charges = "";
    s.fund_show = false;
    s.action_add_mode = "";
    s.edit_able = true;
    s.stats_descr = "";
    s.status_color = "";
    s.applApplication = [];
    s.curr_selected_pos = "";
    s.index_current_id = "";
    s.row_span_x = 1;
    s.empl_session_employment_type = "";
    function init() {
        //RetrieveYear();

        //$("#modal_generating_remittance").modal();
        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../cReOrgPosApply/InitializeData").then(function (d) {
            if (d.data.message == "success") {
                s.img_p = d.data.imgDataURL;
                s.txtb_personnel_name = d.data.page_data.employee_name_format2;
                s.txtb_empl_id = d.data.page_data.empl_id;
                s.txtb_department_descr = d.data.page_data.department_name1;
                s.department_code = d.data.page_data.department_code;
                s.txtb_current_position = d.data.page_data.position_long_title;
                s.txtb_employment_type = d.data.page_data.employmenttype_descr;
                s.province_title = d.data.page_data.organization_name;
                s.province_address = d.data.page_data.organization_address1;
                s.applApplication = d.data.initPage;

                s.ps_education = d.data.personnel_educ_tbl;
                s.ps_eligibility = d.data.personnel_csceligibility_tbl;

                s.ps_workexperience = d.data.personnel_workexprnce_tbl;
                s.ps_trainings = d.data.personnel_training;

                $("#modal_generating_remittad.data.page_data.employmenttype_descrnce").modal("hide");


                s.budget_year_list = d.data.budget_year_list;
                s.employment_types_list = d.data.employment_type_list;
                s.departments_list = d.data.departments_list;
                s.fundchargest_list = d.data.fund_charges_list;
                s.department_code = d.data.page_data.department_code;
                s.empl_session_employment_type = d.data.empl_employment_type;
                if (d.data.plantilla_data != null) {
                    init_table_data(d.data.plantilla_data);
                }
                else {
                    init_table_data([]);
                }

                if (d.data.personnel_workexprnce_tbl != null) {
                    init_table_data_work(d.data.personnel_workexprnce_tbl);
                }
                else {
                    init_table_data_work([]);
                }


                if (d.data.personnel_training != null) {
                    init_table_data_trainings(d.data.personnel_training);
                }
                else {
                    init_table_data_trainings([]);
                }

                init_table_data_vacant([]);
            }
            else {
                swal(d.data.message, { icon: "warning", });
            }
        });
    }

    init()


    s.show_add_modal = function (par_action, primary_key) {
        s.action_add_mode = par_action;
        s.ddl_budget_year = primary_key;
        if (par_action == "P") //Primary Position
        {
            s.ModalTitle = "Primary Postion Selection";
        }
        else if (par_action == "S") //Secondary Position
        {
            s.ModalTitle = "Secondary Postion Selection";
        }
        else if (par_action == "T") //Tertiary Position
        {
            s.ModalTitle = "Tertiary Postion Selection";
        }
        s.ddl_department = s.department_code;
        s.ddl_employment_type = "RE";
        $('#btn_add_' + par_action + "" + primary_key).html("&nbsp;<span class='fa fa-spinner spin'></span>");
        h.post("../cReOrgPosApply/InitailizeAdd",
            {
                budget_code: primary_key,
                employment_type: s.ddl_employment_type,
                department_code: s.ddl_department,
                fund_code: s.ddl_fund_charges
            })
            .then(function (d) {
                s.oTable.fnClearTable();
                $("#main_modal").modal({ keyboard: false, backdrop: "static" });
                $('#btn_add_' + par_action + "" + primary_key).html("+");
                if (d.data.plantilla_data.length > 0) {
                    s.datalistgrid = d.data.plantilla_data;
                    s.oTable.fnAddData(s.datalistgrid);
                }
            }
            );
    }

    s.announce = function () {
        $("#modal_announce").modal({ keyboard: false, backdrop: "static" });
    }

    s.btn_view_vacant = function (par_budget_code) {
        s.ModalTitle = "Plantilla Vacant Positions";
        s.ddl_budget_year = par_budget_code;
        s.ddl_department_v = s.department_code;
        s.ddl_employment_type = "RE";
        h.post("../cReOrgPosApply/getPlantilla_vacant",
            {
                budget_code: par_budget_code,
                employment_type: "RE",
                department_code: s.ddl_department_v
            })
            .then(function (d) {
                s.plantilla_vacant = d.data.plantilla_data;
                s.oTable_vacant.fnClearTable();
                if (d.data.plantilla_data.length > 0) {
                    s.plantilla_vacant = d.data.plantilla_data;
                    s.oTable_vacant.fnAddData(d.data.plantilla_data);
                }
                $("#main_modal_vacant").modal({ keyboard: false, backdrop: "static" });
            }
            );
    }

    s.btn_no_application_report = function (par_budget_code) {
        s.ModalTitle = "Plantilla Vacant Positions";
        s.ddl_budget_year = par_budget_code;
        s.ddl_department_v = s.department_code;
        s.ddl_employment_type = "RE";
        h.post("../cReOrgPosApply/getReorNoApplication",
            {
                budget_code: par_budget_code,
                employment_type: "RE",
                department_code: s.ddl_department_v
            })
            .then(function (d) {
                s.plantilla_vacant = d.data.plantilla_data;
                s.oTable_vacant.fnClearTable();
                if (d.data.plantilla_data.length > 0) {
                    s.plantilla_vacant = d.data.plantilla_data;
                    s.oTable_vacant.fnAddData(d.data.plantilla_data);
                }
                $("#main_modal_vacant").modal({ keyboard: false, backdrop: "static" });
            }
            );
    }

    s.get_plantilla_vacant = function (par_budget_code) {
        h.post("../cReOrgPosApply/getPlantilla_vacant",
            {
                budget_code: par_budget_code,
                employment_type: "RE",
                department_code: s.ddl_department_v
            })
            .then(function (d) {
                s.plantilla_vacant = d.data.plantilla_data;
                s.oTable_vacant.fnClearTable();
                if (d.data.plantilla_data.length > 0) {
                    s.plantilla_vacant = d.data.plantilla_data;
                    s.oTable_vacant.fnAddData(d.data.plantilla_data);
                }

            });
    }

    s.setCurrent = function (a_index) {
        s.index_current_id = a_index;
    }

    s.mergeRow = function (index_x, current_val) {

        if (index_x > 0) {

            if (s.ps_education[index_x].educ_type == s.ps_education[index_x - 1].educ_type) {
                if (s.index_current_id == "") {
                    s.index_current_id = (index_x - 1);
                }
                s.row_span_x = (document.getElementById('tdx_' + s.index_current_id).rowSpan + 1);
                document.getElementById('tdx_' + s.index_current_id).rowSpan = s.row_span_x;

                return '';
            }
            else {
                return '';
            }

        }
        else {
            return '';
        }
    }



    s.get_plantilla_items = function () {
        if (s.ddl_department == "16") {
            s.fund_show = true;
        }
        else {
            s.ddl_fund_charges = "";
            s.fund_show = false;
        }
        h.post("../cReOrgPosApply/InitailizeAdd",
            {
                budget_code: s.ddl_budget_year,
                employment_type: s.ddl_employment_type,
                department_code: s.ddl_department,
                fund_code: s.ddl_fund_charges
            })
            .then(function (d) {

                s.oTable.fnClearTable();
                if (d.data.plantilla_data.length > 0) {

                    s.datalistgrid = d.data.plantilla_data;
                    s.oTable.fnAddData(s.datalistgrid);
                }
            }
            );
    }

    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {
                data: s.datalistgrid,
                sDom: 'rt<"bottom"ip>',
                bAutoWidth: false,
                pageLength: 10,
                columns: [
                    {
                        "mData": "item_no",
                        "mRender":
                            function (data, type, full, row) {
                                return "<span class='text-center btn-block'>" + data + "</span>"
                            }
                    },
                    {
                        "mData": "position_title",
                        "mRender": function (data, type, full, row) {
                            return "<span class='btn-block font-bold' style='font-weight:bolder !important;'>" + data + "</span>"
                                + (full["subdepartment_code"].toString().trim() == "" ? "" : "<small style='display:block;font-size:10px;font-weight:bolder;padding:1px;background-color:transparent;text-align:left;color:#507cd1;'>" + full["subdepartment_name1"].toString().trim() + "</small>")
                                + (full["division_code"].toString().trim() == "" ? "" : "<small style='display:block;font-size:10px;font-weight:bolder;padding:1px;background-color:transparent;text-align:left;color:#507cd1;'>" + full["division_name1"].toString().trim() + "</small>")
                                + (full["section_code"].toString().trim() == "" ? "" : "<small style='display:block;font-size:10px;font-weight:bolder;padding:1px;background-color:transparent;text-align:left;color:#507cd1;'>" + full["section_name1"].toString().trim() + "</small>")
                                + (full["unit_code"].toString().trim() == "" ? "" : "<small style='display:block;font-size:10px;font-weight:bolder;padding:1px;background-color:transparent;text-align:left;color:#507cd1;'>" + full["unit_name1"].toString().trim() + "</small>")
                        }
                    },
                    {
                        "mData": "monthly_rate_ny",
                        "mRender": function (data, type, full, row) {
                            var temp = "";
                            temp = "<b><span class='text-right btn-block approved-bg'>" + data + "&nbsp;</span></b>";
                            return temp;
                        }
                    },

                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            var temp = "";
                            temp = '<center>' +
                                '<button type="button" ng-show="true" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Select Item"><i class="fa fa-hand-o-up"></i></button >' +
                                '</center>';
                            return temp;
                        }
                    }


                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            });
    }

    var init_table_data_vacant = function (par_data) {
        s.plantilla_vacant = par_data;
        s.oTable_vacant = $('#datalist_grid_vacant').dataTable(
            {
                data: s.plantilla_vacant,
                sDom: 'rt<"bottom"ip>',
                bAutoWidth: false,
                pageLength: 10,
                columns: [
                    {
                        "mData": "item_no",
                        "mRender":
                            function (data, type, full, row) {
                                return "<b><span class='text-center btn-block'>" + data + "</span></b>";
                            }
                    },
                    {
                        "mData": "salary_grade",
                        "mRender": function (data, type, full, row) {
                            return "<span class='btn-block text-center'>" + data + "</span>";
                        }
                    },
                    {
                        "mData": "position_title",
                        "mRender": function (data, type, full, row) {
                            var temp = "";
                            temp = "<span class='text-left btn-block approved-bg' style='font-weight:bolder !important;'>" + data + "</span>"
                                + (full["subdepartment_code"].toString().trim() == "" ? "" : "<small style='display:block;font-size:10px;font-weight:bolder;padding:1px;background-color:transparent;text-align:left;color:#507cd1;'>" + full["subdepartment_name1"].toString().trim() + "</small>")
                                + (full["division_code"].toString().trim() == "" ? "" : "<small style='display:block;font-size:10px;font-weight:bolder;padding:1px;background-color:transparent;text-align:left;color:#507cd1;'>" + full["division_name1"].toString().trim() + "</small>")
                                + (full["section_code"].toString().trim() == "" ? "" : "<small style='display:block;font-size:10px;font-weight:bolder;padding:1px;background-color:transparent;text-align:left;color:#507cd1;'>" + full["section_name1"].toString().trim() + "</small>")
                                + (full["unit_code"].toString().trim() == "" ? "" : "<small style='display:block;font-size:10px;font-weight:bolder;padding:1px;background-color:transparent;text-align:left;color:#507cd1;'>" + full["unit_name1"].toString().trim() + "</small>")
                                ;
                            return temp;
                        }
                    },
                    {
                        "mData": "number_of_applicant",
                        "mRender": function (data, type, full, row) {
                            var temp = "";
                            temp = "<span class='text-center btn-block approved-bg'>" + data + "</span>";
                            return temp;
                        }
                    },
                    {
                        "mData": "monthly_rate",
                        "mRender": function (data, type, full, row) {
                            var temp = "";
                            temp = "<span class='text-right btn-block approved-bg'>" + data + "&nbsp;</span>";
                            return temp;
                        }
                    },
                    {
                        "mData": "qs_eduction",
                        "mRender": function (data, type, full, row) {
                            var temp = "";
                            temp = "<span class='text-left btn-block approved-bg'>" + data + "&nbsp;</span>";
                            return temp;
                        }
                    },
                    {
                        "mData": "qs_work_experience",
                        "mRender": function (data, type, full, row) {
                            var temp = "";
                            temp = "<span class='text-left btn-block approved-bg'>" + data + "&nbsp;</span>";
                            return temp;
                        }
                    },
                    {
                        "mData": "qs_training",
                        "mRender": function (data, type, full, row) {
                            var temp = "";
                            temp = "<span class='text-left btn-block approved-bg'>" + data + "&nbsp;</span>";
                            return temp;
                        }
                    },
                    {
                        "mData": "qs_eligibility",
                        "mRender": function (data, type, full, row) {
                            var temp = "";
                            temp = "<span class='text-left btn-block approved-bg'>" + data + "&nbsp;</span>";
                            return temp;
                        }
                    }


                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            });
    }


    var init_table_data_trainings = function (par_data) {
        s.ps_trainings = par_data;
        s.oTable_trainings = $('#datalist_training_grid').dataTable(
            {
                data: s.ps_trainings,
                sDom: 'rt<"bottom"ip>',
                bAutoWidth: false,
                pageLength: 10,
                columns: [
                    {
                        "mData": "learn_devt_title",
                        "mRender":
                            function (data, type, full, row) {
                                return "<span class='btn-block'>&nbsp;" + data + "</span>";
                            }
                    },
                    {
                        "mData": "conducted_by",
                        "mRender": function (data, type, full, row) {
                            return "<span class='btn-block'>&nbsp;" + data + "</span>";
                        }
                    },
                    {
                        "mData": "learn_devt_type",
                        "mRender": function (data, type, full, row) {
                            var temp = "";
                            temp = "<b><span class='text-center btn-block approved-bg'>" + data + "</span></b>";
                            return temp;
                        }
                    },
                    {
                        "mData": "no_of_hrs",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            var temp = "";
                            temp = "<b><span class='text-center btn-block approved-bg'>" + data + "</span></b>";
                            return temp;
                        }
                    }

                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            });
    }


    var init_table_data_work = function (par_data) {
        s.ps_workexperience = par_data;
        s.oTable_work = $('#datalist_work_experience').dataTable(
            {
                data: s.ps_workexperience,
                sDom: 'rt<"bottom"ip>',
                bAutoWidth: false,
                pageLength: 10,
                "order": [],
                "aaSorting": [],
                columns: [
                    {
                        "mData": "position_title",
                        "bSortable": false,
                        "mRender":
                            function (data, type, full, row) {
                                return "<span class='btn-block'> &nbsp;" + data + "</span>";
                            }
                    },
                    {
                        "mData": "workexp_from",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            return "<span class='btn-block text-center'>" + data + "</span>";
                        }
                    },
                    {
                        "mData": "workexp_to",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            var temp = "";
                            temp = "<span class='text-center btn-block'>" + data + "</span>";
                            return temp;
                        }
                    },

                    {
                        "mData": "appt_status",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            var temp = "";
                            temp = "<span class='text-center btn-block'>" + data + "</span>";
                            return temp;
                        }
                    },
                    {
                        "mData": "monthly_salary",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            var temp = "";
                            temp = "<span class='text-right btn-block'>" + data.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") + "&nbsp;&nbsp;</span>";
                            return temp;
                        }
                    }
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            });
    }

    s.btn_save_click = function (par_action, primary_key, row_key) {
        if (ValidateFieldsSaves(primary_key)) {
            var data =

            {
                empl_id: s.txtb_empl_id
                , budget_code: primary_key
                , item_no_primary: $("#txtb_primary_item" + primary_key).val()
                , item_no_secondary: $("#txtb_secondary_item" + primary_key).val()
                , item_no_tertiary: $("#txtb_tertiary_item" + primary_key).val()
                , appl_status: par_action
                , acquired_item: ""
                , created_dttm: ""
                , updated_dttm: ""
            }
            h.post("../cReOrgPosApply/SaveAppl",
                {
                    data: data
                })
                .then(function (d) {
                    if (par_action == "S") {

                        s.applApplication[row_key].appl_status = par_action;
                        s.applApplication[row_key].appl_status_descr = "SUBMITTED APPLICATION";
                        swal("Your record has been Successfully Submitted!", { icon: "success", });
                    }
                    else {
                        s.applApplication[row_key].appl_status = par_action;
                        s.applApplication[row_key].appl_status_descr = "DRAFT APPLICATION";
                        swal("Your record has been Successfully Save!", { icon: "success", });
                    }
                }
                );
        }
    }

    s.btn_edit_action = function (row_id) {

        try {

            s.curr_selected_pos = row_id;

            swal({
                title: "ITEM #:" + s.datalistgrid[row_id].item_no,
                text: "Are you sure you want to apply for this Item/Position?",
                icon: "warning",
                buttons: [
                    "NO"
                    ,
                    {
                        text: "YES",
                        value: true,
                        visible: true,
                        className: "btn-success",
                        closeModal: true
                    }
                ],
                dangerMode: true,

            })
                .then(function (apply) {
                    if (apply) {
                        $("#qs_modal").modal({ keyboard: false, backdrop: "static" });
                        s.selected_pos_title = s.datalistgrid[row_id].position_title;
                        s.selected_pos_sal = s.datalistgrid[row_id].monthly_rate_ny;
                        //if (s.action_add_mode == "P")
                        //{
                        //    //s.txtb_primary_item = s.datalistgrid[row_id].item_no;
                        //    //s.txtb_primary_descr = s.datalistgrid[row_id].position_long_title;
                        //    $("#txtb_primary_item" + s.ddl_budget_year).val(s.datalistgrid[row_id].item_no);
                        //    $("#txtb_primary_descr" + s.ddl_budget_year).val(s.datalistgrid[row_id].position_long_title);
                        //}
                        //else if (s.action_add_mode == "S") {
                        //    $("#txtb_secondary_item" + s.ddl_budget_year).val(s.datalistgrid[row_id].item_no);
                        //    $("#txtb_secondary_descr" + s.ddl_budget_year).val(s.datalistgrid[row_id].position_long_title);
                        //    //s.txtb_secondary_item = s.datalistgrid[row_id].item_no;
                        //    //s.txtb_secondary_descr = s.datalistgrid[row_id].position_long_title;
                        //}
                        //else if (s.action_add_mode == "T") {
                        //    //s.txtb_tertiary_item = s.datalistgrid[row_id].item_no;
                        //    //s.txtb_tertiary_descr = s.datalistgrid[row_id].position_long_title;
                        //    $("#txtb_tertiary_item" + s.ddl_budget_year).val(s.datalistgrid[row_id].item_no);
                        //    $("#txtb_tertiary_descr" + s.ddl_budget_year).val(s.datalistgrid[row_id].position_long_title);
                        //}
                        //$("#main_modal").modal("hide");
                    }
                });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    s.btn_apply_click = function () {
        if (s.datalistgrid[s.curr_selected_pos].item_no == $("#txtb_primary_item" + s.ddl_budget_year).val()) {
            swal("You have already applied this item as your primary choice!", { icon: "error", title: "CAN'T APPLY" });
        }
        else if (s.datalistgrid[s.curr_selected_pos].item_no == $("#txtb_secondary_item" + s.ddl_budget_year).val()) {
            swal("You have already applied this item as your secondary choice!", { icon: "error", title: "CAN'T APPLY" });
        }
        else if (s.datalistgrid[s.curr_selected_pos].item_no == $("#txtb_tertiary_item" + s.ddl_budget_year).val()) {
            swal("You have already applied this item as your tertiary choice!", { icon: "error", title: "CAN'T APPLY" });
        }
        else if (s.action_add_mode == "P") {
            //s.txtb_primary_item = s.datalistgrid[row_id].item_no;
            //s.txtb_primary_descr = s.datalistgrid[row_id].position_long_title;
            $("#txtb_primary_item" + s.ddl_budget_year).val(s.datalistgrid[s.curr_selected_pos].item_no);
            $("#txtb_primary_descr" + s.ddl_budget_year).val(s.datalistgrid[s.curr_selected_pos].position_title);
            swal("Your record has been Successfully Apply!", { icon: "success", });
            $("#main_modal").modal("hide");
            $("#qs_modal").modal("hide");
        }
        else if (s.action_add_mode == "S") {
            $("#txtb_secondary_item" + s.ddl_budget_year).val(s.datalistgrid[s.curr_selected_pos].item_no);
            $("#txtb_secondary_descr" + s.ddl_budget_year).val(s.datalistgrid[s.curr_selected_pos].position_title);
            //s.txtb_secondary_item = s.datalistgrid[row_id].item_no;
            //s.txtb_secondary_descr = s.datalistgrid[row_id].position_long_title;
            swal("Your record has been Successfully Apply!", { icon: "success", });
            $("#main_modal").modal("hide");
            $("#qs_modal").modal("hide");
        }
        else if (s.action_add_mode == "T") {
            //s.txtb_tertiary_item = s.datalistgrid[row_id].item_no;
            //s.txtb_tertiary_descr = s.datalistgrid[row_id].position_long_title;
            $("#txtb_tertiary_item" + s.ddl_budget_year).val(s.datalistgrid[s.curr_selected_pos].item_no);
            $("#txtb_tertiary_descr" + s.ddl_budget_year).val(s.datalistgrid[s.curr_selected_pos].position_title);
            swal("Your record has been Successfully Apply!", { icon: "success", });
            $("#main_modal").modal("hide");
            $("#qs_modal").modal("hide");
        }

    }

    s.btn_print = function (budget_code, empl_id) {
        s.employee_name_print = 'REORG APPLICATION REPORT';

        var controller = "Reports";
        var action = "Index";
        var ReportName = "";
        var SaveName = "Crystal_Report";
        var ReportType = "inline";
        var ReportPath = "~/Reports/cryReorgApplReport/";
        var sp = "";

        if (empl_id == "NO") {
            ReportName = "cryReorgNoApplReport";
            ReportPath = ReportPath + "" + ReportName + ".rpt";
            sp = "sp_reor_no_appl_report,par_budget_code," + budget_code + ",par_department_code," + s.department_code;
        }
        else {
            ReportName = "cryReorgApplReport";
            ReportPath = ReportPath + "" + ReportName + ".rpt";
            sp = "sp_reorg_appl_report_pay,par_empl_id," + empl_id + ",par_budget_code," + budget_code;
        }


        // *******************************************************
        // *** VJA : 2021-07-14 - Validation and Loading hide ****
        // *******************************************************
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
        // *******************************************************

    }

    s.btn_clear_item = function (action_add_mode, primary_key) {

        try {
            swal({
                title: "WARNING!",
                text: "Are you sure you want to Revome this item? Final remove action will effect when you SAVE or SUBMIT your application",
                icon: "warning",
                buttons: [
                    "NO"
                    ,
                    {
                        text: "YES",
                        value: true,
                        visible: true,
                        className: "btn-success",
                        closeModal: true
                    }
                ],
                dangerMode: true,

            })
                .then(function (apply) {
                    if (apply) {
                        if (action_add_mode == "P") {
                            $('#txtb_primary_item' + primary_key).val("");
                            $('#txtb_primary_descr' + primary_key).val("");
                            s.txtb_primary_item = "";
                            s.txtb_primary_descr = "";
                        }
                        else if (action_add_mode == "S") {
                            s.txtb_secondary_item = "";
                            s.txtb_secondary_descr = "";
                            $('#txtb_secondary_item' + primary_key).val("");
                            $('#txtb_secondary_descr' + primary_key).val("");
                        }
                        else if (action_add_mode == "T") {
                            s.txtb_tertiary_item = "";
                            s.txtb_tertiary_descr = "";
                            $('#txtb_tertiary_item' + primary_key).val("");
                            $('#txtb_tertiary_descr' + primary_key).val("");
                        }
                    }
                });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
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

        if ($('#ddl_budget_year').val().trim() == "") {
            ValidationResultColor("ddl_budget_year", true);
            return_val = false;
        }

        return return_val;
    }

    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFieldsSaves(primary_key) {
        var return_val = true;
        ValidationResultColor("ALL", false, primary_key);

        //if ($('#ddl_budget_year').val().trim() == "") {
        //    ValidationResultColor("ddl_budget_year", true);
        //    return_val = false;
        //}

        if ($('#txtb_primary_item' + primary_key).val().trim() == "") {
            ValidationResultColor("txtb_primary_item", true, primary_key);
            return_val = false;
        }

        return return_val;
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidationResultColor(par_object_id, par_v_result, primary_key) {
        if (par_v_result) {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id + "" + primary_key).addClass("required");
            $("#lbl_" + par_object_id + "_req" + primary_key).text("Required Field!");
        }
        else {
            //remove of refresh the object form being required


            $("#txtb_primary_item" + primary_key).removeClass("required");
            $("#lbl_txtb_primary_item_req" + primary_key).text("");

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

