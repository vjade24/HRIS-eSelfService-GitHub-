/*
 * Script created By:       Vincent Jade H. Alivio
 * Script created On:       02/29/2020
 * Purpose of this Script:  
 *                          
 */
ng_selfService_App.controller("cPlacementCommittee_DTL_ctrlr", function ($scope, $compile, $http, $filter) {
    
    var s = $scope;
    var h = $http;
    s.rowLen = "10";
    s.datalistgrid = null;
    s.datalist_grid_educ = null;
    s.show_initial_div = false;
    s.show_initial_div_dtl = true;
    init()

    // ******************************************
    // * VJA - 02/29/2020 - Initialized page
    // ****************************************** 
    function init()
    {
         $("#ddl_budget_code").select().on('change', function (e) {
             s.RetrievePositions();
         });
         $("#ddl_department_code").select().on('change', function (e) {
             s.RetrievePositions();
         });
         $("#ddl_employment_type").select().on('change', function (e) {
             s.RetrievePositions();
         });


        $('#loading_descr').html("LOADING");
        $('#loading_data').modal({ backdrop: 'static', keyboard: false });
        h.post("../cPlacementCommittee_DTL/InitializeData").then(function (d)
        {
            if (d.data.message != "success")
            {
                swal("There something error!", d.data.message, {icon :"error"})
                return;
            }
            
            s.department_name1          = d.data.data[0].department_name1
            s.position_long_title       = d.data.data[0].position_long_title
            s.qs_eduction               = d.data.data[0].qs_eduction        
            s.qs_work_experience        = d.data.data[0].qs_work_experience 
            s.qs_training               = d.data.data[0].qs_training        
            s.qs_eligibility            = d.data.data[0].qs_eligibility 
            s.item_no                   = d.data.data[0].item_no
            s.item_recent_occupied_by   = d.data.data[0].item_recent_occupied_by
            s.salary_grade              = d.data.data[0].salary_grade

            s.budget_code               = d.data.data[0].budget_code
            s.department_code           = d.data.data[0].department_code
            s.employment_type           = d.data.data[0].employment_type

            s.flag_item_occupied        = d.data.flag_item_occupied
            s.dep_lst                   = d.data.dep_lst
            s.budget_lst                = d.data.budget_lst
            s.empltype_lst_modal        = d.data.empltype_lst
            
            s.empltype_lst_count = d.data.data_empl.length

            for (var i = 0; i < d.data.data_empl.length; i++)
            {
                if (d.data.data_empl[i].appl_status == 'Approved' || 
                    d.data.data_empl[i].appl_status == 'Cancelled')
                {
                    d.data.data_empl[i].appl_status_show = true
                    
                }
                else
                {
                    d.data.data_empl[i].appl_status_show = false
                }
            }

            for (var i = 0; i < d.data.data_empl.length; i++)
            {
                if (d.data.data_empl[i].employment_type == 'JO')
                {
                    d.data.data_empl[i].employment_type_color = "text-warning";
                }
                else if (d.data.data_empl[i].employment_type == 'CE')
                {
                    d.data.data_empl[i].employment_type_color = "text-primary";
                }
                else if (d.data.data_empl[i].employment_type == 'RE')
                {
                    d.data.data_empl[i].employment_type_color = "text-danger";
                }
            }
            
            s.empltype_lst          = d.data.data_empl
            
            s.data_educ          = d.data.data_educ
            s.data_workexp       = d.data.data_workexp
            s.data_lnd           = d.data.data_lnd
            s.data_csc           = d.data.data_csc
            s.data_oth           = d.data.data_oth
            s.data_voluntarywork = d.data.data_voluntarywork
            
            s.imgDataURL         = d.data.imgDataURL
            s.user_firstname     = d.data.user_name
            s.show_initial_div = true;

            if (d.data.data_empl.length == 0)
            {
                location.href = "../cPlacementCommittee/Index"
            }

            // **********************************************************
            // ** Modal page for Approve Item for the Applicant *********
            // **********************************************************
            s.ddl_department_code = d.data.data[0].department_code
            s.ddl_budget_code     = d.data.data[0].budget_code
            s.ddl_employment_type = d.data.data[0].employment_type

            h.post("../cPlacementCommittee_DTL/RetrievePositions",
            {
                par_budget_code     : d.data.data[0].budget_code,
                par_department_code : d.data.data[0].department_code,
                par_employment_type : d.data.data[0].employment_type
            }).then(function (a)
            {
                if (a.data.message == "success")
                {
                    s.pos_lst = a.data.data
                    s.ddl_pos = d.data.data[0].item_no
                }
                else
                {
                    swal(a.data.message, 'There Something Wrong', { icon: "error" })
                }
            })
             // **********************************************************
             // **********************************************************
            
            setTimeout(function ()
            {
                init_table_data_educ(d.data.data_educ, d.data.data_empl[0].empl_id);
                init_table_data_work(d.data.data_workexp, d.data.data_empl[0].empl_id);
                init_table_data_train(d.data.data_lnd, d.data.data_empl[0].empl_id);
                init_table_data_elig(d.data.data_csc, d.data.data_empl[0].empl_id);
                
                $('#tab-' + d.data.data_empl[0].empl_id).addClass('active')
                $('#li_grp_' + d.data.data_empl[0].empl_id).addClass('active')
                
                $("#loading_data").modal('hide');

            }, 100);
        });
    }
    //***********************************//
    //***Page-View-for-Crystal-Report****//
    //***********************************// 
    s.btn_view_qs = function (empl_id)
    {
        $('#loading_descr').html("LOADING");
        $('#loading_data').modal({ backdrop: 'static', keyboard: false });
        h.post("../cPlacementCommittee_DTL/Retrieve_QS",
            {
                par_empl_id: empl_id
            }).then(function (d)
            {
                if (d.data.message == "success")
                {
                    s.data_educ          = d.data.data_educ
                    s.data_workexp       = d.data.data_workexp
                    s.data_lnd           = d.data.data_lnd
                    s.data_csc           = d.data.data_csc
                    s.data_oth           = d.data.data_oth
                    s.data_voluntarywork = d.data.data_voluntarywork

                    s.imgDataURL = d.data.imgDataURL
                    
                    init_table_data_educ(d.data.data_educ, empl_id);
                    init_table_data_work(d.data.data_workexp, empl_id);
                    init_table_data_train(d.data.data_lnd, empl_id);
                    init_table_data_elig(d.data.data_csc, empl_id);
                    
                    $("#loading_data").modal('hide');
                }
            });
    }
    //***********************************//
    //***Page-View-for-Crystal-Report****//
    //***********************************// 
    s.btn_print = function (par_report,empl_id,employee_name)
    {
        s.employee_name_print = employee_name

        var controller  = "Reports";
        var action      = "Index";
        var ReportName  = "";
        var SaveName    = "Crystal_Report";
        var ReportType  = "inline";
        var ReportPath  = "~/Reports/cryPDS/";
        var sp = "";
        
        var par_budget_code         = $('#ddl_budget_code option:selected').val();
        var par_department_code     = $('#ddl_department_code option:selected').val();
        var par_employment_type     = $('#ddl_employment_type option:selected').val();
        var par_item_no             = $('#ddl_pos option:selected').val();
        
        switch (par_report)
        {
            case "O":
                {
                    ReportName = "cryPDSMain";
                    ReportPath = ReportPath + "" + ReportName + ".rpt";
                    sp = "sp_pds_rep,p_empl_id," + empl_id + ",O," + empl_id;
                    break;
                }
            case "1":
                {
                    ReportName = "cryPDSOther_page1";
                    ReportPath = ReportPath + "" + ReportName + ".rpt";
                    sp = "sp_pds_add_page1_rep,p_empl_id," + empl_id + ",1," + empl_id;
                    break;
                }
            case "2":
                {
                    ReportName = "cryPDSOther_page2";
                    ReportPath = ReportPath + "" + ReportName + ".rpt";
                    sp = "sp_pds_rep,p_empl_id," + empl_id + ",2," + empl_id;
                    break;
                }
            case "3":
                {
                    ReportName = "cryPDSOther_page3";
                    ReportPath = ReportPath + "" + ReportName + ".rpt";
                    sp = "sp_pds_rep,p_empl_id," + empl_id + ",3," + empl_id;
                    break;
                }
            case "ITEM_ENDORSE":
                {
                    ReportPath = "~/Reports/cryReorgApplReport/";
                    ReportName = "cryReorEndorsementReport";
                    ReportPath = ReportPath + "" + ReportName + ".rpt";
                    sp = "sp_reorg_endorsement_report,par_budget_code," + par_budget_code + ",par_department_code," + par_department_code + ",par_employment_type," + par_employment_type + ",par_item_no," + par_item_no;
                    break;
                }
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
            + "&SaveName="   + SaveName
            + "&ReportType=" + ReportType
            + "&ReportPath=" + ReportPath
            + "&id=" + sp //+ parameters
        
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
    // *******************************************************
    // *** VJA : 2021-07-14 - Validation and Loading hide ****
    // *******************************************************
    s.btn_open_approve = function (stat,row)
    {
        s.appr_employee_name    = "";
        s.appr_position_title   = "";
        s.appr_department_name  = "";
        s.appr_budget_code      = "";
        s.txtb_remarks          = "";

        //s.appr_empl_id          = "";
        //s.appr_item_no          = "";

        if (stat == 'F')
        {
            s.div_show_approve = true;
            s.show_approve_btn = true;
            s.show_notqua_btn = false;
            s.show_cancel_btn = false;
            s.message_appr_status = "Approve"
            s.message_appr_status_class = "label label-primary"
            s.message_approve_cancel = "Once Approved, you can also cancel this applicant and select another one!"
        }
        else if (stat == 'C')
        {
            s.div_show_approve = false;
            s.show_approve_btn = false;
            s.show_notqua_btn = false;
            s.show_cancel_btn = true;
            s.message_appr_status = "Cancel"
            s.message_appr_status_class = "label label-danger"
            s.message_approve_cancel = "Once Cancelled, you can select another applicant for this Position/Item!"
        }
        else if (stat == 'NQ')
        {
            s.div_show_approve = false;
            s.show_approve_btn = false;
            s.show_notqua_btn = true;
            s.show_cancel_btn = false;
            s.message_appr_status = "Not Qualified"
            s.message_appr_status_class = "label label-warning"
            s.message_approve_cancel = "Once you hit the Not Qualified, this employee will not be visible on the list of applicants!"
        }

        s.RetrievePositions()
        s.appr_employee_name    = row.employee_name
        s.appr_position_title   = row.position_long_title
        s.appr_department_name  = row.department_name1
        s.appr_empl_id          = row.empl_id
        
        $('#modal_approve_cancel_id').modal({ backdrop: 'static', keyboard: false });
    }
    // *******************************************************
    // *** VJA : 2021-07-14 - Validation and Loading hide ****
    // *******************************************************
    s.btn_approve_cancel = function (appr_stat)
    {
        var data =
            {
                empl_id           : s.appr_empl_id       
                ,budget_code      : s.ddl_budget_code 
                ,acquired_item    : s.ddl_pos   
                ,appl_status      : appr_stat
        };

        var data_notquali =
            {
                empl_id           : s.appr_empl_id       
                ,budget_code      : s.ddl_budget_code 
                ,item_no          : s.ddl_pos   
                ,remarks          : s.txtb_remarks   
            };
       
        h.post("../cPlacementCommittee_DTL/Approve_Cancel", { data: data, data_notquali: data_notquali}).then(function (d)
        {
            s.show_initial_div_dtl = false;
            if (d.data.message == "success")
            {
                h.post("../cPlacementCommittee_DTL/InitializeData").then(function (d)
                {
                    if (d.data.message != "success")
                    {
                        swal("There something error!", d.data.message, {icon :"error"})
                        return;
                    }

                    for (var i = 0; i < d.data.data_empl.length; i++)
                    {
                        if (d.data.data_empl[i].appl_status == 'Approved' || 
                            d.data.data_empl[i].appl_status == 'Cancelled')
                        {
                            d.data.data_empl[i].appl_status_show = true
                    
                        }
                        else
                        {
                            d.data.data_empl[i].appl_status_show = false
                        }
                    }

                    for (var i = 0; i < d.data.data_empl.length; i++)
                    {
                        if (d.data.data_empl[i].employment_type == 'JO')
                        {
                            d.data.data_empl[i].employment_type_color = "text-warning";
                        }
                        else if (d.data.data_empl[i].employment_type == 'CE')
                        {
                            d.data.data_empl[i].employment_type_color = "text-primary";
                        }
                        else if (d.data.data_empl[i].employment_type == 'RE')
                        {
                            d.data.data_empl[i].employment_type_color = "text-danger";
                        }
                    }

                    s.empltype_lst = d.data.data_empl
                    if (d.data.data_empl.length > 0 && appr_stat != "NQ")
                    {
                        s.btn_view_qs(s.appr_empl_id)
                        s.flag_item_occupied = d.data.flag_item_occupied
                    }
                    
                    setTimeout(function ()
                    {
                        $('#tab-' + s.appr_empl_id).addClass('active')
                        $('#li_grp_' + s.appr_empl_id).addClass('active')
                        
                        if (appr_stat == "NQ")
                        {

                            if (d.data.data_empl.length > 0)
                            {
                                $('#tab-' + d.data.data_empl[0].empl_id).addClass('active')
                                $('#li_grp_' + d.data.data_empl[0].empl_id).addClass('active')
                                s.btn_view_qs(d.data.data_empl[0].empl_id)
                                s.empltype_lst_count = d.data.data_empl.length
                            }
                        }
                        
                        $("#loading_data").modal('hide');
                        s.show_initial_div_dtl = true;
                    }, 1000);


                $('#modal_approve_cancel_id').modal('hide');
                if (appr_stat == "C")
                {
                    swal('Record Successfully Cancelled', 'You can review again the Applicants Information and Qualification standards', { icon: "success" })
                }
                else if (appr_stat == "F")
                {
                    swal('Record Successfully Approved', 'You can review again the Applicants Information and Qualification standards', { icon: "success" })

                    s.btn_print('ITEM_ENDORSE', '', '');
                }
                else if (appr_stat == "NQ")
                {

                    if (d.data.data_empl.length > 0)
                    {
                      swal('Record Successfully Added from Not Qualified Applicants', 'You can review again the Applicants Information list', { icon: "success" })
                    }
                    else
                    {
                        swal("Record Successfully Added from Not Qualified Applicants", "Since this position is no longer applicant/s, You will be directing to Committee Main page", {
                        icon: "warning",
                        buttons: {
                            submit_appl: {
                                text: "Back to Committee",
                                value: "submit_appl"
                            },
                        },
                        }).then((value) => {
                            switch (value) {
                                case "submit_appl":
                                    location.href = "../cPlacementCommittee/Index"
                                    break;
                                default:
                                    location.href = "../cPlacementCommittee/Index"
                        }
                        });
                    }
                }
                });
                
            }
            else
            {
                $("#loading_data").modal('hide');
                swal(d.data.message, d.data.message, { icon: "error" })
                s.show_initial_div_dtl = true;
            }
        })

    }
    var init_table_data_educ = function (par_data,empl_id) {
        s.datalist_grid_educ = par_data;
        $('#datalist_grid_educ_id_' + empl_id).dataTable().fnDestroy()
        s.oTable_educ = $('#datalist_grid_educ_id_' + empl_id).dataTable(
            {
                data: s.datalist_grid_educ,
                sDom: 'rt<"bottom"ip><"toolbar">',
                columns: [
                    {
                        "mData": "school_name", "mRender": function (data, type, full, row) {
                            return "<p style='margin:0em 0 !important;line-height:1.4 !important'><b> <i class='fa fa-check'></i> " + full["school_name"] + ""
                                + " </b > <br /> &nbsp;&nbsp; <small> " + full["basic_educ_deg"] + "  </small> <br />&nbsp;&nbsp; " + full["period_from"] + " - "
                                + full["period_to"] + " | <small>" + full["highest_lvl_earned"] + "" + full["highest_lvl_earned"] + " | "
                                + full["year_graduated"] + " | </small> <small class='label label-primary'> " + full["schlr_acdmic_rcvd"] + " </small></p > "
                        }
                    },
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });
    }
    var init_table_data_work = function (par_data, empl_id) {
        s.datalist_grid_work = par_data;
        $('#datalist_grid_work_id_' + empl_id).dataTable().fnDestroy()
        s.oTable_work = $('#datalist_grid_work_id_' + empl_id).dataTable(
            {
                data: s.datalist_grid_work,
                sDom: 'rt<"bottom"ip><"toolbar">',
                columns: [
                    {
                        "mData": "position_title", "mRender": function (data, type, full, row) {
                            return "<p style='margin:0em 0 !important;line-height:1.4 !important'> " 
                                    + " <b> <i class='fa fa-check'></i> "
                                    + " " + full["position_title"] + " </b><br />   "
                                    + " &nbsp;&nbsp;<small>" + full["dept_agncy_offc_co"] + " </small> <br /> "
                                    + " &nbsp;&nbsp;" + full["workexp_from"] + "  - " + full["workexp_to"]
                                    + " | <small class='label label-success'>" + full["appt_status"] + " </small></p>"

                            //"<span class='btn-block' style='font-size:11px!important'>" + data + "</span>"
                        }
                    },
                    //{ "mData": "dept_agncy_offc_co", "mRender": function (data, type, full, row) { return "<span class='btn-block' style='font-size:11px!important'>" + data + "</span>" } },
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });
    }
    var init_table_data_train = function (par_data, empl_id) {
        $('#datalist_grid_train_id_' + empl_id).dataTable().fnDestroy()
        s.datalist_grid_train = par_data;
        s.oTable_train = $('#datalist_grid_train_id_' + empl_id).dataTable(
            {
                data: s.datalist_grid_train,
                sDom: 'rt<"bottom"ip><"toolbar">',
                columns: [
                    {
                        "mData": "learn_devt_title", "mRender": function (data, type, full, row) {
                            return "<p style='margin:0em 0 !important;line-height:1.4 !important'><b>"
                                 + "<i class='fa fa-check'></i>" + full["learn_devt_title"] + "</b>"
                                 + "<br />&nbsp;&nbsp;<small>" + full["conducted_by"] + " </small><br />"
                                 + " &nbsp;&nbsp;" + full["learn_devt_from"] + "  - " + full["learn_devt_to"] + "  | <small class='label label-info'>" + full["learn_devt_type"] + "</small></p>"

                            //"<span class='btn-block' style='font-size:11px!important'>" + data + "</span>"
                        }
                    },
                    //{ "mData": "conducted_by", "mRender": function (data, type, full, row) { return "<span class='btn-block' style='font-size:11px!important'>" + data + "</span>" } },
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });
    }
    var init_table_data_elig = function (par_data, empl_id) {
        $('#datalist_grid_elig_id_' + empl_id).dataTable().fnDestroy()
        s.datalist_grid_elig = par_data;
        s.oTable_elig = $('#datalist_grid_elig_id_' + empl_id).dataTable(
            {
                data: s.datalist_grid_elig,
                sDom: 'rt<"bottom"ip><"toolbar">',
                columns: [
                    {
                        "mData": "cscsrvc_ra1080", "mRender": function (data, type, full, row) {
                                return "<p style='margin:0em 0 !important;line-height:1.4 !important'>                                                        "
                                + "    <b>                                                                                                               "
                                + "        <i class='fa fa-check'></i>                                                                                   "
                                + "        " + full["cscsrvc_ra1080"] + " | " + full["number"] + "| <small class='label label-warning'> <b> " + full["rating"] + "</b></small>    "
                                + "    </b>                                                                                                              "
                                + "    <br />                                                                                                            "
                                    + "    &nbsp;&nbsp;<small>" + full["examination_place"] + " | " + full["validity_date"] + "</small>                                      "
                                + "                                                                                                                      "
                                + "</p>                                                                                                                  "
                            
                        }
                    },
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });
    }

    Array.prototype.refreshTable = function (table, id)
    {
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


    s.RetrievePositions = function ()
    {
        h.post("../cPlacementCommittee_DTL/RetrievePositions",
            {
                par_budget_code     : $('#ddl_budget_code').val(),
                par_department_code : $('#ddl_department_code').val(),
                par_employment_type : $('#ddl_employment_type').val()
            }).then(function (d)
        {
            if (d.data.message == "success")
            {
                s.pos_lst = d.data.data
            }
            else
            {
                swal(d.data.message, 'There Something Wrong', { icon: "error" })
            }

        })
    }
    

});