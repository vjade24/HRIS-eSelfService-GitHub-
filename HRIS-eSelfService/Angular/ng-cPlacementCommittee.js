/*
 * Script created By:       Vincent Jade H. Alivio
 * Script created On:       02/29/2020
 * Purpose of this Script:  
 *                          
 */
ng_selfService_App.controller("cPlacementCommittee_ctrlr", function ($scope, $compile, $http, $filter) {
    
    var s = $scope;
    var h = $http;
    s.rowLen = "8";
    s.datalistgrid = null;
    s.current_page = 0;
    s.notqualist = [];
    s.notqualist_lenght = 0;
    s.ddl_employee_name_show = true;
    // ******************************************
    // * VJA - 02/29/2020 - Initialized page
    // ****************************************** 
    function init() {

        $("#ddl_department_code").select2().on('change', function (e) {
            s.FilterPageGrid();
        });
        $("#ddl_budget_code").select2().on('change', function (e) {
            s.FilterPageGrid();
        });
        $("#ddl_employment_type").select2().on('change', function (e) {
            s.FilterPageGrid();
        });
        $("#ddl_employee_name").select2().on('change', function (e) {
            s.RetrieveEmployeeInfo();
        });

        $('#loading_msg').html("LOADING");
        //$("#modal_loading").modal();
        $('#modal_loading').modal({ backdrop: 'static', keyboard: false });
        s.ddl_department_code = "01"
        s.ddl_budget_code     = "2022-2"
        s.ddl_employment_type = "RE"
        h.post("../cPlacementCommittee/InitializeData",
            {
                par_budget_code      : s.ddl_budget_code    
                ,par_department_code :  s.ddl_department_code 
                ,par_employment_type : s.ddl_employment_type 
            }).then(function (d)
            {
                console.log(d.data.data)
                s.user_firstname = d.data.user_name

                s.dep_lst        = d.data.dep_lst
                s.budget_lst     = d.data.budget_lst
                s.empltype_lst   = d.data.empltype_lst
                s.data_ocpd      = d.data.data_ocpd.length
                s.data_vcnt = d.data.data_vcnt.length
                //s.view_img = d.data.view_img

                if (d.data.session_val.length != "")
                {
                    s.ddl_budget_code     = d.data.session_val[0].toString()
                    s.ddl_department_code = d.data.session_val[1].toString()
                    s.ddl_employment_type = d.data.session_val[2].toString()
                    
                }

                
                if (d.data.data != null && d.data.data.length > 0)
                {
                    s.datalistgrid = d.data.data;
                    s.data_pos = d.data.data;
                    init_table_data(s.datalistgrid);

                    if (s.current_page == 0 && parseInt(d.data.session_val[5].toString()) != 0)
                    {
                        $('#datalist_grid').DataTable().page(parseInt(d.data.session_val[5].toString())).draw('page')
                    }
                    else
                    {
                        $('#datalist_grid').DataTable().page(s.current_page).draw('page')
                    }
                   

                }
                else init_table_data([]);


                init_table_data_task([]);
            });
    }


    //***********************************************************//
    //*** VJA - 02/29/2020 - Occure when value change
    //***********************************************************// 
    s.FilterPageGrid = function ()
    {
        $('#loading_msg').html("LOADING");
        //$("#modal_loading").modal();
        $('#modal_loading').modal({ backdrop: 'static', keyboard: false });
        h.post("../cPlacementCommittee/FilterPageGrid",
            {
                par_budget_code         : $('#ddl_budget_code option:selected').val()
                , par_department_code   : $('#ddl_department_code option:selected').val()
                , par_employment_type   : $('#ddl_employment_type option:selected').val()
            }
        ).then(function (d)
        {
            
            s.datalistgrid = d.data.data;
            s.datalistgrid.refreshTable('oTable', '');
            s.data_pos = [];
            s.data_pos = d.data.data;

            s.data_ocpd = d.data.data_ocpd.length
            s.data_vcnt = d.data.data_vcnt.length

            //s.view_img = d.data.view_img
            //if (d.data.session_val.length > 0)
            //{
            //    if (s.current_page == 0 && parseInt(d.data.session_val[5].toString()) != 0) {
            //        $('#datalist_grid').DataTable().page(parseInt(d.data.session_val[5].toString())).draw('page')
            //    }
            //    else {
            //        $('#datalist_grid').DataTable().page(s.current_page).draw('page')
            //    }
            //}
            //else {
            //    $('#datalist_grid').DataTable().page(s.current_page).draw('page')
            //}
            //if (s.current_page == 0 && parseInt(d.data.session_val[5].toString()) != 0) {
            //    $('#datalist_grid').DataTable().page(parseInt(d.data.session_val[5].toString())).draw('page')
            //}
            //else {
            //    $('#datalist_grid').DataTable().page(s.current_page).draw('page')
            //}
            //console.log(d.data.session_val);
            //if (d.data.session_val.length > 0)
            //{
            //    if (s.current_page == 0 && parseInt(d.data.session_val[5].toString()) != 0) {
            //        $('#datalist_grid').DataTable().page(parseInt(d.data.session_val[5].toString())).draw('page')
            //    }
            //    else {
            //        $('#datalist_grid').DataTable().page(s.current_page).draw('page')
            //    }
            //}
            //else {
            $('#datalist_grid').DataTable().page(s.current_page).draw('page')
            //}
            
            $("#modal_loading").modal('hide');
        });
    }

    init()

    var init_table_data = function (par_data)
    {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {
                data: s.datalistgrid,
                sDom: 'rt<"bottom"ip><"toolbar">',
                //pageLength: s.rowLen,
                columns: [
                    {
                        "mData": null,
                        "mRender": function (data, type, full, row) {
                            return "<center><span class='details-control' style='display:block;' ></center>"
                        }
                    },
                    { "mData": "item_no", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block' style=''>" + data + "  </span>" } },
                    { "mData": "csc_level_descr", "mRender": function (data, type, full, row) { return "<span class='text-left btn-block' > " + data + " SG "+ full["salary_grade"] +" </span>" } },
                    {
                        "mData": null,
                        "mRender": function (data, type, full, row) {
                            return "<span class='btn-block font-bold' style='font-weight:bolder !important;'> " + full["position_long_title"].toString().trim() + "</span>"
                                + (full["subdepartment_name1"].toString().trim() == "" ? "" : "<small style='display:block;font-size:10px;font-weight:bolder;padding:1px;background-color:transparent;text-align:left;color:#507cd1;'>" + full["subdepartment_name1"].toString().trim() + "</small>")
                                + (full["division_name1"].toString().trim()      == "" ? "" : "<small style='display:block;font-size:10px;font-weight:bolder;padding:1px;background-color:transparent;text-align:left;color:#507cd1;'>" + full["division_name1"].toString().trim() + "</small>")
                                + (full["section_name1"].toString().trim()       == "" ? "" : "<small style='display:block;font-size:10px;font-weight:bolder;padding:1px;background-color:transparent;text-align:left;color:#507cd1;'>" + full["section_name1"].toString().trim() + "</small>")
                                + (full["unit_name1"].toString().trim()          == "" ? "" : "<small style='display:block;font-size:10px;font-weight:bolder;padding:1px;background-color:transparent;text-align:left;color:#507cd1;'>" + full["unit_name1"].toString().trim() + "</small>")
                        }
                    },
                    { "mData": "nbr_applicants", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block' style='padding-left:10px;'> " + data + "</span>" } },
                    {
                        "mData": "item_status", "mRender": function (data, type, full, row)
                        {
                            span_color  = "";
                            span_icn = "";
                            
                            if (full["item_status"] == "Occupied") 
                            {
                                span_color  = "label label-primary";
                                span_icn    = "fa fa-star";
                                data        = "Occupied By"
                            }
                            else
                            {
                                span_color  = "label label-warning";
                                span_icn    = "fa fa-check";
                                data        = "Vacant Item"
                                // full["position_long_title"] = "";
                            }

                            return '&nbsp;<span class="btn-block ' + span_color + '"  style="padding-right:5px;text-align:left !important;"> <i class="' + span_icn + '"></i>  ' + data + '</span> <a data-toggle="tooltip" data-placement="top" title="Click to Cancel applicant"><span class="small" ng-click="btn_approve_cancel(' + row["row"] + ')">&nbsp;&nbsp; ' + full["item_occupied_by"] + '</span> </a>  <img src="' + s.encode_idv(full["empl_photo_img"]) +'" class="img-circle pull-right" width="40" height="40" > '
                        }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row)
                        {
                            return '<center><div class="btn-group ">' +
                                //'<button type="button" class="btn btn-primary btn-sm" ng-click="btn_show_jobdescription(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="View Job Desription"><i class="fa fa-print"></i>  </button >' +
                                '<div class="btn-group" id="' + row["row"] +'">                                                                                          ' +
                                '    <button  data-toggle="dropdown" ng-click="btn_action_click(' + row["row"] + ')" class="btn btn-info dropdown-toggle btn-block btn-sm"> <i class="fa fa-cog"></i></button>  ' +
                                '    <ul class="dropdown-menu">                                                                                                     ' +
                                '        <li><a class="dropdown-item" ng-click="btn_show_jobdescription(' + row["row"] + ')">View Job Desription</a></li>           ' +
                                '        <li><a class="dropdown-item" ng-click="btn_print(ddl_budget_code,\'ITEM_ENDORSE\',\'' + full["item_no"] + '\')">Individual Endorsement</a></li> ' +
                                '        <li><a class="dropdown-item" ng-click="btn_print(ddl_budget_code,\'CONG_E_1\',\'' + full["item_no"] + '\')">Congratulatory Letter</a></li> ' +
                                '        <li><a class="dropdown-item" ng-click="btn_assign_empl(' + row["row"] + ')">Assign Applicant/s</a></li> ' +
                                '        <li><a class="dropdown-item" ng-click="btn_print(ddl_budget_code,\'NOT_QUALI\',\'' + full["item_no"] + '\')">Not Qualified ({{notqualist_lenght}})  </a> <ul  id="not_quali_cont" style="padding-right:5px;"></ul></li> ' +
                                '    </ul>                                                                                                                          ' +
                                '</div>                                                                                                                             ' +
                                '<button type="button" class="btn btn-warning btn-sm" ng-click="btn_view_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="View Applicants">View Applicants  &nbsp;&nbsp;<i class="fa fa-sign-in"></i>  </button >' +
                                '</div></center>';
                        }
                    }

                ],
                "createdRow": function (row, data, index)
                {
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });
        $("#modal_loading").modal('hide');

        $('#datalist_grid').on('page.dt', function () {

            s.current_page = $('#datalist_grid').DataTable().page.info().page;
            
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
                    //{ "mData": "job_ctrl_nbr", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    {
                        "mData": "jobdescr_function",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>&nbsp;" + data + "</span>";
                        }
                    },
                    { "mData": "jobdescr_percent", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "%</span>" } },
                    //{
                    //    "mData": null,
                    //    "bSortable": false,
                    //    "mRender": function (data, type, full, row) {
                    //        var allow_delete = s.access_roles.allow_delete;
                    //        var allow_edit = s.access_roles.allow_edit;

                    //        return_html = '<center><div class="btn-group"><button type="button"  ng-show="!task_display' + row["row"] + '" ng-disabled="!' + allow_edit + '" class="btn btn-success btn-sm"  ng-click="btn_edit_job_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit Data">  <i class="fa fa-edit"></i></button >' +
                    //            '<button type="button"  ng-show="!task_display' + row["row"] + '" ng-disabled="!' + allow_delete + ' || !' + s.allow_for_this_page + '" class="btn btn-danger btn-sm"  ng-click="btn_del_job_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button></div></center>';

                    //        return return_html;
                    //    }
                    //}
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            });

       
    }

    // ******************************************
    // * VJA - 02/29/2020 - Search
    // ****************************************** 
    s.search_in_list = function (value, table) {
        console.log(value)
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
    
    Array.prototype.refreshTable = function (table, id) {

        if (this.length == 0) {

            s[table].fnClearTable();
        }
        else {

            s[table].fnClearTable();
            s[table].fnAddData(this);
        }

        var el_id = s[table][0].id
        $("#spinner_load").modal("hide")
    }
    //***********************************//
    //***VJA - 02/29/2020 - Remove Function****//
    //***********************************// 
    Array.prototype.remove = function (code, prop)
    {
        return this.filter(function (d) {
            return d[prop] != code
        })
    }
    s.btn_view_action = function (row_index)
    {
        if (parseFloat(s.datalistgrid[row_index].nbr_applicants) <= 0) {

            swal(s.datalistgrid[row_index].position_title1 + ' from ' + s.datalistgrid[row_index].department_proper_name + ' is no Applicants', 'Please select another Position or item to continue transaction', {icon:"warning"})
            return;
        }
        s.current_page = $('#datalist_grid').DataTable().page.info().page;
        h.post("../cPlacementCommittee/PreviousValuesonPage_cPlacementComittee",
        {
            par_budget_code          : s.datalistgrid[row_index].budget_code     
            ,par_department_code     : s.datalistgrid[row_index].department_code 
            ,par_employment_type     : s.datalistgrid[row_index].employment_type 
            ,par_item_no             : s.datalistgrid[row_index].item_no
            ,par_show_entries        : s.rowLen
            ,par_page_nbr            : $('#datalist_grid').DataTable().page.info().page
            ,par_search              : s.search_box
        }).then(function (d)
        {
            location.href = "../cPlacementCommittee_DTL/Index"
        })
    }
    //s.btn_view_action_new = function (row_index)
    //{
    //    h.post("../cPlacementCommittee/PreviousValuesonPage_cPlacementComittee",
    //        {
    //             par_budget_code         : row_index.budget_code     
    //            ,par_department_code     : row_index.department_code 
    //            ,par_employment_type     : row_index.employment_type 
    //            ,par_item_no             : row_index.item_no
    //            ,par_show_entries        : s.rowLen
    //            ,par_page_nbr            : $('#datalist_grid').DataTable().page.info().page
    //            ,par_search              : s.search_box
    //        }).then(function (d)
    //        {
    //            location.href = "../cPlacementCommittee_DTL/Index"
    //        })
    //}
    //**************************************//
    //****************log-out***************//
    //**************************************// 
    s.logout = function () {
        h.post("../Login/logout").then(function (d) {
            if (d.data.success == 1)
            {
                location.href = "../Login/Index"
            }
        })
    }
    
    $('#datalist_grid tbody').on('click', 'span.details-control', function ()
    {
        var tr = $(this).closest('tr');
        var row = $('#datalist_grid').DataTable().row(tr);

        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else
        {
            //console.log(row.data())
            // Open this row
            row.child(format(row.data())).show();
            tr.addClass('shown');
        }

    });

    //-----------------UPDATE BY JADE -------------------------------------------------------------

    //NEW UPDATE BY: JORGE RUSTOM VILLANUEVA 2020-09-18

    /* Formatting function for row details - modify as you need */

    /* Formatting function for row details - modify as you need */
    function format(d)
    {
        // `d` is the original data object for the row
        return '<table class="no-border" style="padding:0px !important;min-height:10px !important" id="table_show_details"> ' +

            '<tr > ' +
            '<td style="width:5% !important;padding:0px 0px 0px 10px"> </td>' +
            '<td style="width:22.5% !important;padding:0px 0px 0px 10px"><h3><i class="fa fa-graduation-cap text-success"></i> Education</h3> </td>' +
            '<td style="width:22.5% !important;padding:0px 0px 0px 10px"><h3><i class="fa fa-bar-chart text-primary"></i> Experience</h3></td>' +
            '<td style="width:22.5% !important;padding:0px 0px 0px 10px"><h3><i class="fa fa-star text-info"></i> Trainings</h3></td>' +
            '<td style="width:22.5% !important;padding:0px 0px 0px 10px"><h3><i class="fa fa-trophy text-warning"></i> Eligibility</h3></td>' +
            '<td style="width:5% !important;padding:0px 0px 0px 10px"> </td>' +
            '</tr>' +
            '<tr >' +
            '<td style="width:5% !important;padding:0px 0px 0px 10px"> </td>' +
            '<td style="width:22.5% !important;padding:0px 0px 10px 10px;font-size:12px;vertical-align: text-top;">' + d.qs_eduction + '</td>' +
            '<td style="width:22.5% !important;padding:0px 0px 10px 10px;font-size:12px;vertical-align: text-top;">' + d.qs_work_experience + '</td>' +
            '<td style="width:22.5% !important;padding:0px 0px 10px 10px;font-size:12px;vertical-align: text-top;">' + d.qs_training + '</td>' +
            '<td style="width:22.5% !important;padding:0px 0px 10px 10px;font-size:12px;vertical-align: text-top;">' + d.qs_eligibility + '</td>' +
            '<td style="width:5% !important;padding:0px 0px 0px 10px"> </td>' +
            '</tr>' +
        '</table>';
    }

    // *******************************************************
    // *** VJA : 2021-07-14 - Validation and Loading hide ****
    // *******************************************************
    s.btn_approve_cancel = function (appr_stat)
    {

        console.log(s.datalistgrid[appr_stat])
        var data =
        {
            empl_id        : s.datalistgrid[appr_stat].item_occupied_by_empl_id     
            ,budget_code   : s.datalistgrid[appr_stat].budget_code     
            ,acquired_item : s.datalistgrid[appr_stat].item_no     
            ,appl_status   : "C"
        };
        try {
            swal({
                title: "Are you sure you want to Cancel " + s.datalistgrid[appr_stat].item_occupied_by + " as " + s.datalistgrid[appr_stat].position_title1 + " from " + s.datalistgrid[appr_stat].department_proper_name +"?",
                text: "Once cancelled, this position/item will be vacant!",
                icon: "warning",
                buttons: true,

            })
                .then(function (willDelete) {
                    if (willDelete) {
                        
                        h.post("../cPlacementCommittee/Approve_Cancel",
                        {
                            data: data
                        }).then(function (d) {
                            if (d.data.message == "success")
                            {
                                s.FilterPageGrid();
                                swal('Record Successfully Cancelled', 'You can review again the Applicants Information and Qualification standards', { icon: "success" })
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
    

    s.btn_show_jobdescription = function (row_id)
    {
        s.row_header_current    = row_id;
        s.TaskModalTitle        = "Job Description";
        s.txtb_function         = s.datalistgrid[row_id].position_title1;
        s.txtb_position         = s.datalistgrid[row_id].position_title1;

        s.row_header_current = row_id;
        $('#task_modal').modal({ backdrop: 'static', keyboard: false });

        h.post("../cPlacementCommittee/GetJobDescription",
            {
                par_item_no         : s.datalistgrid[row_id].item_no,
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

    s.btn_print = function (budget_code, empl_id, item_no)
    {
        s.employee_name_print = 'REORG APPLICATION REPORT';

        var controller = "Reports";
        var action = "Index";
        var ReportName = "";
        var SaveName = "Crystal_Report";
        var ReportType = "inline";
        var ReportPath = "~/Reports/cryReorgApplReport/";
        var sp = "";

        var par_budget_code = $('#ddl_budget_code option:selected').val();
        var par_department_code = $('#ddl_department_code option:selected').val();
        var par_employment_type = $('#ddl_employment_type option:selected').val();
        var par_item_no = item_no;
        if (empl_id == "NO") {
            ReportName = "cryReorgNoApplReport";
            ReportPath = ReportPath + "" + ReportName + ".rpt";
            sp = "sp_reor_no_appl_report,par_budget_code," + par_budget_code + ",par_department_code," + par_department_code;
            s.employee_name_print = 'LIST OF EMPLOYEE WITH NO APPLICATION';
        }
        else if (empl_id == "EMPL_APPL") {
            ReportName = "cryReorgEmployeeApplReport";
            ReportPath = ReportPath + "" + ReportName + ".rpt";
            sp = "sp_reor_empl_appl_report,par_budget_code," + par_budget_code + ",par_department_code," + par_department_code;
            s.employee_name_print = 'REGULAR AND CASUAL EMPLOYEE REORG APPLICATIONS REPORT';
        }
        else if (empl_id == "ITEM_APPL_Y") {
            ReportName = "cryReorApplicantPerItemReport";
            ReportPath = ReportPath + "" + ReportName + ".rpt";
            sp = "sp_reorg_item_applicant_report,par_budget_code," + par_budget_code + ",par_department_code," + par_department_code + ",par_employment_type," + par_employment_type + ",par_with_incumbent,Y";

            s.employee_name_print = 'ITEM APPLICANT';
        }
        else if (empl_id == "ITEM_APPL_N") {
            ReportName = "cryReorApplicantPerItemReport";
            ReportPath = ReportPath + "" + ReportName + ".rpt";
            sp = "sp_reorg_item_applicant_report,par_budget_code," + par_budget_code + ",par_department_code," + par_department_code + ",par_employment_type," + par_employment_type + ",par_with_incumbent,N";

            s.employee_name_print = 'ITEM APPLICANT';
        }
        else if (empl_id == "ITEM_ENDORSE") {
            ReportName = "cryReorEndorsementReport";
            ReportPath = ReportPath + "" + ReportName + ".rpt";
            sp = "sp_reorg_endorsement_report,par_budget_code," + par_budget_code + ",par_department_code," + par_department_code + ",par_employment_type," + par_employment_type + ",par_item_no," + par_item_no;

            s.employee_name_print = 'ENDORSEMENT';
        }
        else if (empl_id == "NOT_QUALI")
        {
            if (s.notqualist_lenght <= 0)
            {
                swal("You can't preview this Report", 'Applicant/s for this Position/Item is all Qualified', {icon:"warning"})
                return;
            }

            ReportName = "cryReorApplicantNotQualiReport";
            ReportPath = ReportPath + "" + ReportName + ".rpt";
            sp = "sp_reorg_appl_not_qua_tbl_report,par_budget_code," + par_budget_code + ",par_item_no," + par_item_no;
            s.employee_name_print = 'LIST OF NOT QUALIFIED';
        }
        else if (empl_id == "APPROVED") {
            ReportName = "cryReorApplicantApprovedReport";
            ReportPath = ReportPath + "" + ReportName + ".rpt";
            sp = "sp_placement_pos_tbl_list,par_budget_code," + par_budget_code + ",par_department_code," + par_department_code + ",par_employment_type," + par_employment_type;
            s.employee_name_print = 'LIST OF APPROVED APPLICANTS';
        }
        else if (empl_id == "A2Z_RE") {
            ReportName = "cryReorgEmployeeA2ZapplReport";
            ReportPath = ReportPath + "" + ReportName + ".rpt";
            sp = "sp_reor_a2z_appl_report,par_budget_code," + par_budget_code + ",par_department_code," + '' + ",par_employment_type," + 'RE';
            s.employee_name_print = 'PERMANENT A to Z MASTER LIST';
        }
        else if (empl_id == "A2Z_CE") {
            ReportName = "cryReorgEmployeeA2ZapplReport";
            ReportPath = ReportPath + "" + ReportName + ".rpt";
            sp = "sp_reor_a2z_appl_report,par_budget_code," + par_budget_code + ",par_department_code," + '' + ",par_employment_type," + 'CE';
            s.employee_name_print = 'CASUAL A to Z MASTER LIST';
        }
        else if (empl_id == "PLANTILLA") {
            ReportName = "cryPlantillaReOrg";
            ReportPath = ReportPath + "" + ReportName + ".rpt";
            sp = "sp_plantilla22_reorg_workable_report,par_budget_code," + par_budget_code + ",par_employment_type," + par_employment_type;
            s.employee_name_print = 'WORKABLE PLANTILLA REPORT';
        }
        else if (empl_id == "DISPLACED") {
            ReportName = "cryReorgEmployeeApplDisplaceReport";
            ReportPath = ReportPath + "" + ReportName + ".rpt";
            sp = "sp_reor_empl_displace_report,par_budget_code," + par_budget_code + ",par_department_code," + par_department_code + ",par_employment_type," + par_item_no;
            s.employee_name_print = 'DISPLACED EMPLOYEE REORG APPLICATIONS REPORT';
        }
        else if (empl_id == "ITEM_UNFILLED") {
            ReportName = "cryReorApplicantPerItemUnfilledReport";
            ReportPath = ReportPath + "" + ReportName + ".rpt";
            sp = "sp_reorg_item_applicant_report,par_budget_code," + par_budget_code + ",par_department_code," + par_department_code + ",par_employment_type," + par_employment_type + ",par_with_incumbent,Y";
            s.employee_name_print = 'UNFILLED POSITION/S';
        }
        else if (empl_id == "CONG_E") {
            ReportName = "cryReorContratulatoryToEmployee";
            ReportPath = ReportPath + "" + ReportName + ".rpt";
            sp = "sp_reorg_contrats_per_empl_report,par_budget_code," + par_budget_code + ",par_department_code," + par_department_code + ",par_employment_type," + par_employment_type + ",par_item_no,";
            s.employee_name_print = 'CONGRATULATORY LETTER';                                                                                                      
        }   
        else if (empl_id == "CONG_E_1") {
            ReportName = "cryReorContratulatoryToEmployee";
            ReportPath = ReportPath + "" + ReportName + ".rpt";
            sp = "sp_reorg_contrats_per_empl_report,par_budget_code," + par_budget_code + ",par_department_code," + par_department_code + ",par_employment_type," + par_employment_type + ",par_item_no,"+par_item_no;
            s.employee_name_print = 'CONGRATULATORY LETTER';
        }  
        else if (empl_id == "CONG_DEP") {                                                                                                                       
            ReportName = "cryReorContratulatoryToPG";                                                                                                           
            ReportPath = ReportPath + "" + ReportName + ".rpt";                                                                                                 
            sp = "sp_reorg_contrats_per_empl_report,par_budget_code," + par_budget_code + ",par_department_code," + par_department_code + ",par_employment_type," + par_employment_type + ",par_item_no,";
            s.employee_name_print = 'LETTER TO PG HEAD';
        }
        else if (empl_id == "POST") {
            ReportName = "cryReorForFinalPosting";
            ReportPath = ReportPath + "" + ReportName + ".rpt";
            sp = "sp_reorg_contrats_per_empl_report,par_budget_code," + par_budget_code + ",par_department_code," + par_department_code + ",par_employment_type," + par_employment_type + ",par_item_no,";
            s.employee_name_print = 'FOR POSTING';
        }
        else if (empl_id == "CASUAL_TO_P") {
            ReportName = "cryReorCasualToPermanent";
            ReportPath = ReportPath + "" + ReportName + ".rpt";
            sp = "sp_casual_to_permanent_rep,par_budget_code," + par_budget_code + ",par_employment_type," + par_employment_type;
            s.employee_name_print = 'LIST OF EMPLOYEE FROM CASUAL TO PERMANENT';
        }
        
        else if (empl_id == "PDS")
        {
            ReportPath = "~/Reports/cryPDS/";
            ReportName = "cryPDSMain";
            ReportPath = ReportPath + "" + ReportName + ".rpt";
            sp = "sp_pds_rep,p_empl_id," + $('#ddl_employee_name option:selected').val().toString().trim() + ",O," + $('#ddl_employee_name option:selected').val().toString().trim();

            // ReportName = "cryReorApplicantPerItemUnfilledReport";
            // ReportPath = ReportPath + "" + ReportName + ".rpt";
            // sp = "sp_reorg_item_applicant_report,par_budget_code," + par_budget_code + ",par_department_code," + par_department_code + ",par_employment_type," + par_employment_type + ",par_with_incumbent,Y";
            s.employee_name_print = $('#ddl_employee_name option:selected').text().toString().trim();
        }
        else
        {
            ReportName = "cryReorgApplReport";
            ReportPath = ReportPath + "" + ReportName + ".rpt";
            sp = "sp_reorg_appl_report_pay,par_empl_id," + empl_id + ",par_budget_code," + budget_code;
        }
        console.log(sp)

        // *******************************************************
        // *** VJA : 2021-07-14 - Validation and Loading hide ****
        // *******************************************************
        $("#modal_loading").modal({ keyboard: false, backdrop: "static" })
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
                $("#modal_loading").modal("hide")
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
                    $("#modal_loading").modal("hide")
                }
            };
        }

        iframe.src = s.embed_link;
        $('#modal_print_preview').modal({ backdrop: 'static', keyboard: false });
        // *******************************************************
        // *******************************************************

    }
    $.fn.modal.Constructor.prototype.enforceFocus = function ()
    {

    }
    // *******************************************************
    // **** VJA - Assign Employee Button *********************
    // *******************************************************
    s.btn_assign_empl = function (row_id)
    {
        s.txtb_selected_item_no         = ""
        s.txtb_selected_position_title  = "";
        s.txtb_primary                  = "";
        s.txtb_secondary                = "";
        s.txtb_tertiary                 = "";
        s.txtb_item_occupied_by         = "";
        s.txtb_item_occupied_by_empl_id = "";
        $('#ItemPreview').attr('src', "../ResourcesImages/upload_profile.png")

        
        $("#modal_loading").modal({ keyboard: false, backdrop: "static" })
        h.post("../cPlacementCommittee/RetrieveOverrideApplicants",).then(function (d)
        {
            if (d.data.message = "success")
            {
                s.txtb_selected_item_no         = s.datalistgrid[row_id].item_no;
                s.txtb_selected_position_title  = s.datalistgrid[row_id].position_title1;
                s.txtb_item_occupied_by         = s.datalistgrid[row_id].item_occupied_by;
                s.txtb_item_occupied_by_empl_id = s.datalistgrid[row_id].item_occupied_by_empl_id;
                // console.log(s.datalistgrid[row_id])

                s.empl_names = d.data.empl_names
                $("#modal_loading").modal("hide")
                $('#override_employee_modal').modal({ backdrop: 'static', keyboard: false });
            }
            else
            {
                swal(d.data.message, '', { icon: "error" });
            }
        })
    }
    //***********************************************************//
    //*** VJA - 02/29/2020 - Occure when value change
    //***********************************************************// 
    s.RetrieveEmployeeInfo = function () {
        s.txtb_primary = "";
        s.txtb_secondary = "";
        s.txtb_tertiary = "";
        s.txtb_acquired_item = "";
        if ($('#ddl_employee_name option:selected').val().toString().trim() == '')
        {
            s.ddl_employee_name_show = true;
            $('#ddl_employee_name').click();
            return;
        }
        s.ddl_employee_name_show = false;
        
        $('#loading_msg').html("LOADING");
        $('#modal_loading').modal({ backdrop: 'static', keyboard: false });

        h.post("../cPlacementCommittee/RetrieveEmployeeInfo",
        {
            par_empl_id: $('#ddl_employee_name option:selected').val()
        }).then(function (d)
        {
            s.encode('ItemPreview',d.data.img.empl_photo_img)

            if (d.data.message == "no_application" || d.data == null)
            {
                // swal('No application found!', 'This applicant is no have Application yet', { icon: "error" });
            }
            else if (d.data.message == "success")
            {

                s.txtb_primary       = d.data.data[0].item_no_primary   == '' ? '' : d.data.data[0].item_no_primary    + ' - ' +  d.data.data[0].item_no_primary_descr
                s.txtb_secondary     = d.data.data[0].item_no_secondary == '' ? '' : d.data.data[0].item_no_secondary  + ' - ' +  d.data.data[0].item_no_secondary_descr
                s.txtb_tertiary      = d.data.data[0].item_no_tertiary  == '' ? '' : d.data.data[0].item_no_tertiary   + ' - ' +  d.data.data[0].item_no_tertiary_descr
                s.txtb_acquired_item = d.data.data[0].acquired_item     == '' ? '' : d.data.data[0].acquired_item      + ' - ' +  d.data.data[0].acquired_item_descr
            }
            else
            {
                swal(d.data.message, '', { icon: "error" });
            }

            $("#modal_loading").modal('hide');
        });
    }

    s.encode = function (img_id,d, a, e, b, c, f)
    {
        c = "";
        try
        {

        for (a = e = b = 0; a < 4 * d.length / 3; f = b >> 2 * (++a & 3) & 63, c += String.fromCharCode(f + 71 - (f < 26 ? 6 : f < 52 ? 0 : f < 62 ? 75 : f ^ 63 ? 90 : 87)) + (75 == (a - 1) % 76 ? "\r\n" : ""))a & 3 ^ 3 && (b = b << 8 ^ d[e++]); for (; a++ & 3;)c += "=";

        if (c.toString().trim() == "")
        {
            $('#' + img_id).attr('src', "../ResourcesImages/upload_profile.png")
        }
        else
        {
            $('#' + img_id).attr('src', "data:image/png;base64," + c + "")
        }
        } catch (e)
        {
            $('#' + img_id).attr('src', "../ResourcesImages/upload_profile.png")
        }
    }

    s.encode_idv = function (d, a, e, b, c, f)
    {

        c = "";
        try
        {

        for (a = e = b = 0; a < 4 * d.length / 3; f = b >> 2 * (++a & 3) & 63, c += String.fromCharCode(f + 71 - (f < 26 ? 6 : f < 52 ? 0 : f < 62 ? 75 : f ^ 63 ? 90 : 87)) + (75 == (a - 1) % 76 ? "\r\n" : ""))a & 3 ^ 3 && (b = b << 8 ^ d[e++]); for (; a++ & 3;)c += "=";

            if (c.toString().trim() == "") {
                c = "../ResourcesImages/upload_profile.png";
            }
            else {
                c = "data:image/png;base64," + c;
            }
        } catch (e)
        {
            c = "../ResourcesImages/upload_profile.png";
        }
        return c;
    }


    s.btn_approve_override = function ()
    {
        //if ($('#ddl_employee_name').val()       == '' ||
        //    $('#txtb_selected_item_no').val()   == '')
        //{
        //    swal('REQUIRED FIELD', 'Please select Applicant from dropdownlist', { icon: "error" })
        //    return;
        //}

        if ($('#ddl_employee_name').val()       == '')
        {
            swal('REQUIRED FIELD', 'Please select Applicant from dropdownlist', { icon: "error" })
            return;
        }

        h.post("../cPlacementCommittee/Approve_Override",
            {
                par_budget_code     : $('#ddl_budget_code').val(),
                par_empl_id         : $('#ddl_employee_name').val(),
                par_item_no         : $('#txtb_selected_item_no').val(),
                par_employment_type : $('#ddl_employment_type').val()
            }).then(function (d)
        {
            if (d.data.message == "success")
            {
                s.FilterPageGrid();
                $("#override_employee_modal").modal('hide');
                swal('Successfully Override this Applicant', d.data.data.return_msg_descr, { icon: "success" })
            }
            else
            {
                swal(d.data.message, 'There Something Wrong', { icon: "error" })
            }

        })
    }


    s.btn_action_click = function (row_id)
    {

        //$('div#' + row_id + '.btn-group').addClass('open');
        h.post("../cPlacementCommittee/RetrieveNotQualified",
        {
            par_budget_code: s.datalistgrid[row_id].budget_code,
            par_item_no: s.datalistgrid[row_id].item_no

        }).then(function (d)
        {
            s.notqualist = [];
            if (d.data.message = "success")
            {
                s.notqualist = d.data.data
                s.notqualist_lenght = d.data.data.length
                
                var html_cont = "";
                console.log(s.notqualist);
                $('ul#not_quali_cont').html('');
                if (d.data.data.length > 0)
                {
                    for (var x = 0; x < d.data.data.length; x++)
                    {
                        html_cont = html_cont + '<li style="list-style: none outside none;font-size:10px;padding-top:5px;padding-bottom:5px;" class="dropdown-item" id="' + d.data.data[x].empl_id + '" >' + d.data.data[x].empl_id + ' - ' + d.data.data[x].last_name + '  <span class="pull-right text-danger" style="cursor:pointer;padding-right:10px" ng-click="delete_notq(\'' + x + '\')"><i class="fa fa-undo" ></i> </span>&nbsp;&nbsp;</li>';
                    }
                }
                var $html_cont = $(html_cont).appendTo('ul#not_quali_cont');
                $compile($html_cont)($scope);

            }
        })
    }

    s.delete_notq = function (row_id)
    {
        //$('li#' + empl_id).remove();
        try {
            swal({
                title: "Are you sure to restore " + s.notqualist[row_id].employee_name + " as Qualified Applicant?",
                text: "Once restored, the applicant will visible to the placement committee details!",
                icon: "warning",
                buttons: true,

            })
                .then(function (willDelete) {
                    if (willDelete) {

                        h.post("../cPlacementCommittee/RestoreApplicant",
                            {
                                par_budget_code: s.notqualist[row_id].budget_code,
                                par_item_no: s.notqualist[row_id].item_no,
                                par_empl_id: s.notqualist[row_id].empl_id
                            }).then(function (d) {
                                if (d.data.message == "success") {
                                    s.FilterPageGrid();
                                    swal('Successfully Restored', 'Applicant is now Qualified!', { icon: "success" })
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
    
});