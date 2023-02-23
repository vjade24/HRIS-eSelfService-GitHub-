ng_selfService_App.controller("rSSDTRApprovalNational_ctrlr", function ($scope, $compile, $http, $filter, Upload, $timeout) {
    var s = $scope
    var h = $http

    s.dept_list     = [];
    s.empltype_list = [];

    s.show_dtr_status       = false;
    s.showGridInput         = false;
    s.current_rowId         = "";
    s.allowSubmit           = false;
    s.allowPrint            = false;
    s.user_employment_type  = "";
    s.generate_message      = "";
    s.ddl_showoption        = "S";
    s.loading_r             = true;
    s.Modal_title           = "";
    function init()
    {
        
        //format datepicker to month - year only
        $("#txtb_dtr_mon_year").datepicker({
            format: "MM - yyyy",
            startView: "years",
            minViewMode: "months",
            autoclose: true,
        });

        $("#txtb_dtr_mon_year").on('change', function (e) {
            s.FilterPageGrid();
        });

        $("#ddl_employment_type").select2().on('change', function (e) {
            s.FilterPageGrid();
        });

        s.ddl_viewtype = "0";

        var ddate = new Date();
        s.txtb_dtr_mon_year = moment(ddate).format("MMMM - YYYY");
        $("#modal_generating_remittance").modal();
        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../rSSDTRApprovalNational/InitializeData").then(function (d)
        {
            if (d.data.message == "success")
            {

                s.empl_names            = d.data.empl_name;
                s.dept_list             = d.data.dept_list;
                s.ddl_dept              = d.data.dept_code;
                s.ddl_employment_type   = d.data.user_employment_type;
                s.txtb_empl_id          = d.data.um.user_id.replace("U", "");
                s.user_employment_type  = d.data.user_employment_type;

                if (d.data.approval_list.length > 0)
                {
                    init_table_data(d.data.approval_list);
                }
                else init_table_data([]);
                

                //**********************************************
                //  Show/Hide ADD, EDIT, DELETE button 
                //**********************************************
                d.data.um.allow_add     == "1" ? s.ShowAdd      = true : s.ShowAdd      = false;
                d.data.um.allow_delete  == "1" ? s.ShowDelete   = true : s.ShowDelete   = false;
                d.data.um.allow_edit    == "1" ? s.ShowEdit     = true : s.ShowEdit     = false;
                d.data.um.allow_view    == "1" ? s.ShowView     = true : s.ShowView     = false;
                d.data.um.allow_print   == "1" ? s.ShowPrint    = true : s.ShowPrint    = false;
                s.empltype_list         = d.data.employmenttype_list;
                $("#modal_generating_remittance").modal("hide");
                $('#div_dtr_date .input-group.date').datepicker({
                    todayBtn            : "linked",
                    keyboardNavigation  : false,
                    forceParse          : false,
                    calendarWeeks       : true,
                    autoclose           : true,
                    format              : "yyyy-mm-dd"
                });
            }
            else {
                swal(d.data.message, { icon: "warning", });
            }
        });
    }
    init()

    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {
                data: s.datalistgrid,
                bSort: true,
                bAutoWidth: false,
                pageLength: 10,
                sDom: 'rt<"bottom"p>',
                columns: [
                    {
                        "mData": null,
                        "mRender": function (data, type, full, row)
                        {
                            return "<span class='text-center btn-block' style='font-weight:bold;'>" + full["empl_id"] + "</span>";
                        }
                    },
                    {
                        "mData": "employee_name",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'> &nbsp;" + data + "</span>"
                        }
                    },
                    {
                        "mData": "dtr_type_flag_descr",
                        "mRender": function (data, type, full, row)
                        {
                            return "<span class='text-left btn-block'> &nbsp;" + data + "</span>"
                        }
                    },
                    {
                        "mData": null,
                        "mRender": function (data, type, full, row)
                        {
                            var return_html     = "";
                            var disable_approve         = s.ddl_showoption == "S" ? false:true;
                            var disable_disapprove      = s.ddl_showoption == "S" ? false:true;

                            return_html = '<center><div class="btn-group">' +
                                '<button type="button" ng-disabled="' + disable_approve + '" id="grid_btn' + row["row"] + '" ngx-action="E" class="btn btn-success btn-sm" ng-click="btn_approve_click(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Approved">  <i class="fa fa-thumbs-up"></i></button >' +
                                '<button type="button" ng-disabled="' + disable_disapprove + '" class="btn btn-danger  btn-sm" ng-click="btn_disapprove_click(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Disapproved">  <i class="fa fa-thumbs-down"></i></button >' +
                                '<button type="button" ng-disabled="false" class="btn btn-warning  btn-sm" ng-click="btn_cancel_pending_click(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Cancel Pending">  <i class="fa fa-mail-forward"></i></button >' +
                                '<button type="button" ng-disabled="false" class="btn btn-primary  btn-sm" ng-click="btn_print(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="View DTR">  <i class="fa fa-print"></i></button >' +
                                '</div></center>';

                            return return_html;
                        }
                    }
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            });
    }

    s.search_in_list = function (value, table) {
        try {
            $("#" + table).DataTable().search(value).draw();
        }
        catch (err) {
            alert(err.message)
        }
    }

    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.FilterPageGrid = function () {
        try {
            h.post("../rSSDTRApprovalNational/FilterPageGrid", {
                p_year: str_to_year($("#txtb_dtr_mon_year").val())
                , p_month: month_name_to_int($("#txtb_dtr_mon_year").val())
                , p_dept_code: $("#ddl_dept option:selected").val()
                , p_show_option: $("#ddl_showoption option:selected").val()
                , p_employment_type: $("#ddl_employment_type option:selected").val()
            }).then(function (d) {
                if (d.data.message == "success")
                {

                    s.oTable.fnClearTable(d.data.filteredGrid);
                    s.datalistgrid = d.data.filteredGrid;
                    if (d.data.filteredGrid.length > 0)
                    {
                        s.oTable.fnAddData(d.data.filteredGrid);
                    }
                }
            });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.ddl_dept_chane = function () {
        try {
            h.post("../rSSDTRApprovalNational/DepartmentFilter",
                {
                    p_dept_code: $("#ddl_dept option:selected").val()
                }).then(function (d) {
                    if (d.data.message == "success")
                    {
                        s.FilterPageGrid();
                    }
                });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }

    }

    s.btn_approve_click = function (rowID)
    {
        if (s.datalistgrid[rowID].dtr_type_flag == "0")
        {
            swal({
                title: "APPROVERS OPTION",
                text: "For this part, you have an option which are you going to approve. (FOR WHOLE MONTH ONLY)!",
                icon: "warning",
                closeOnClickOutside: false,
                buttons:
                {
                    approve1:
                    {
                        text: "1st Quincena Only",
                        value: "1",
                        className:"btn btn-primary"
                    },
                    approve2:
                    {
                        text: "2nd Quincena Only",
                        value: "2",
                        className: "btn btn-warning"
                    },
                     approveAll:
                    {
                        text: "Whole Month",
                        value: "0",
                        className: "btn btn-success"
                    }, btn_cancel:
                    {
                        text: "Cancel",
                        value: "",
                        className: "btn btn-danger"
                    }
                },
                dangerMode: true,

            })
            .then(function (willApprove)
            {
                if (willApprove == "1")
                {
                    swal({
                        title: "PLEASE CONFIRM!",
                        text: "Are you sure to Approve 1st Quincena Only?",
                        icon: "warning",
                        closeOnClickOutside: false,
                        buttons:["NO","YES"],
                        dangerMode: true,

                    })
                        .then(function (isApprove)
                        {
                            if (isApprove)
                            {
                                h.post("../rSSDTRApprovalNational/ApprovedDisapprove",
                                    {
                                        p_dtr_ctrl_nbr  : s.datalistgrid[rowID].dtr_ctrl_nbr
                                        , p_dtr_type    : "1"
                                        , p_action      : "F"
                                    }).then(function (d)
                                    {
                                        if (d.data.message == "success")
                                        {
                                            swal("Successfully Approve!", { icon: "success", });
                                            s.FilterPageGrid();
                                        }
                                    });
                            }
                        });
                }
                else if (willApprove == "2")
                {
                    swal({
                        title: "PLEASE CONFIRM!",
                        text: "Are you sure to Approve 2nd Quincena Only?",
                        icon: "warning",
                        closeOnClickOutside: false,
                        buttons: ["NO", "YES"],
                        dangerMode: true,

                    })
                        .then(function (isApprove)
                        {
                            if (isApprove)
                            {
                                h.post("../rSSDTRApprovalNational/ApprovedDisapprove",
                                    {
                                        p_dtr_ctrl_nbr: s.datalistgrid[rowID].dtr_ctrl_nbr
                                        , p_dtr_type: "2"
                                        , p_action: "F"
                                    }).then(function (d) {
                                        if (d.data.message == "success") {
                                            swal("Successfully Approve!", { icon: "success", });
                                            s.FilterPageGrid();
                                        }
                                    });
                            }
                        });
                }
                else if (willApprove == "0")
                {
                    swal({
                        title: "PLEASE CONFIRM!",
                        text: "Are you sure to Approve the whole month?",
                        icon: "warning",
                        closeOnClickOutside: false,
                        buttons: ["NO", "YES"],
                        dangerMode: true,

                    })
                        .then(function (isApprove) {
                            if (isApprove)
                            {
                                h.post("../rSSDTRApprovalNational/ApprovedDisapprove",
                                    {
                                        p_dtr_ctrl_nbr: s.datalistgrid[rowID].dtr_ctrl_nbr
                                        , p_dtr_type: "0"
                                        , p_action: "F"
                                    }).then(function (d) {
                                        if (d.data.message == "success") {
                                            swal("Successfully Approve!", { icon: "success", });
                                            s.FilterPageGrid();
                                        }
                                    });
                            }
                        });
                }
                else { }
            });
        }
        else
        {
            if (s.datalistgrid[rowID].dtr_type_flag == "1")
            {
                swal({
                    title: "PLEASE CONFIRM!",
                    text: "Are you sure to Approve this application 1st Quincena?",
                    icon: "warning",
                    closeOnClickOutside: false,
                    buttons: ["NO", "YES"],
                    dangerMode: true,

                })
                    .then(function (isApprove) {
                        if (isApprove) {
                            h.post("../rSSDTRApprovalNational/ApprovedDisapprove",
                                {
                                    p_dtr_ctrl_nbr: s.datalistgrid[rowID].dtr_ctrl_nbr
                                    , p_dtr_type: "1"
                                    , p_action: "F"
                                }).then(function (d) {
                                    if (d.data.message == "success") {
                                        swal("Successfully Approve!", { icon: "success", });
                                        s.FilterPageGrid();
                                    }
                                });
                        }
                    });
            }
            else if(s.datalistgrid[rowID].dtr_type_flag == "2")
            {
                swal({
                    title: "PLEASE CONFIRM!",
                    text: "Are you sure to Approve this application 2nd Quincena?",
                    icon: "warning",
                    closeOnClickOutside: false,
                    buttons: ["NO", "YES"],
                    dangerMode: true,

                })
                    .then(function (isApprove) {
                        if (isApprove)
                        {
                            h.post("../rSSDTRApprovalNational/ApprovedDisapprove",
                                {
                                    p_dtr_ctrl_nbr: s.datalistgrid[rowID].dtr_ctrl_nbr
                                    , p_dtr_type: "2"
                                    , p_action: "F"
                                }).then(function (d) {
                                    if (d.data.message == "success") {
                                        swal("Successfully Approve!", { icon: "success", });
                                        s.FilterPageGrid();
                                    }
                                });
                        }
                    });
            }
        }
    }

    s.btn_cancel_pending_click = function (rowID)
    {
        if (s.datalistgrid[rowID].dtr_type_flag == "0")
        {
            swal({
                title: "APPROVERS OPTION",
                text: "For this part, you have an option which are you going to Cancel Pending. (FOR WHOLE MONTH ONLY)!",
                icon: "warning",
                closeOnClickOutside: false,
                buttons:
                {
                    approve1:
                    {
                        text: "1st Quincena Only",
                        value: "1",
                        className: "btn btn-primary"
                    },
                    approve2:
                    {
                        text: "2nd Quincena Only",
                        value: "2",
                        className: "btn btn-warning"
                    },
                    approveAll:
                    {
                        text: "Whole Month",
                        value: "0",
                        className: "btn btn-success"
                    }, btn_cancel:
                    {
                        text: "Cancel",
                        value: "",
                        className: "btn btn-danger"
                    }
                },
                dangerMode: true,

            })
                .then(function (willApprove) {
                    if (willApprove == "1") {
                        swal({
                            title: "PLEASE CONFIRM!",
                            text: "Are you sure to Cancel Peding 1st Quincena Only?",
                            icon: "warning",
                            closeOnClickOutside: false,
                            buttons: ["NO", "YES"],
                            dangerMode: true,

                        })
                            .then(function (isApprove) {
                                if (isApprove) {
                                    h.post("../rSSDTRApprovalNational/ApprovedDisapprove",
                                        {
                                            p_dtr_ctrl_nbr: s.datalistgrid[rowID].dtr_ctrl_nbr
                                            , p_dtr_type: "1"
                                            , p_action: "N"
                                        }).then(function (d) {
                                            if (d.data.message == "success") {
                                                swal("Successfully Cancel Pending!", { icon: "success", });
                                                s.FilterPageGrid();
                                            }
                                        });
                                }
                            });
                    }
                    else if (willApprove == "2") {
                        swal({
                            title: "PLEASE CONFIRM!",
                            text: "Are you sure to Cancel Pending 2nd Quincena Only?",
                            icon: "warning",
                            closeOnClickOutside: false,
                            buttons: ["NO", "YES"],
                            dangerMode: true,

                        })
                            .then(function (isApprove) {
                                if (isApprove) {
                                    h.post("../rSSDTRApprovalNational/ApprovedDisapprove",
                                        {
                                            p_dtr_ctrl_nbr: s.datalistgrid[rowID].dtr_ctrl_nbr
                                            , p_dtr_type: "2"
                                            , p_action: "N"
                                        }).then(function (d) {
                                            if (d.data.message == "success") {
                                                swal("Successfully CancelPending!", { icon: "success", });
                                                s.FilterPageGrid();
                                            }
                                        });
                                }
                            });
                    }
                    else if (willApprove == "0") {
                        swal({
                            title: "PLEASE CONFIRM!",
                            text: "Are you sure to Cancel Pending the whole month?",
                            icon: "warning",
                            closeOnClickOutside: false,
                            buttons: ["NO", "YES"],
                            dangerMode: true,

                        })
                            .then(function (isApprove) {
                                if (isApprove) {
                                    h.post("../rSSDTRApprovalNational/ApprovedDisapprove",
                                        {
                                            p_dtr_ctrl_nbr: s.datalistgrid[rowID].dtr_ctrl_nbr
                                            , p_dtr_type: "0"
                                            , p_action: "N"
                                        }).then(function (d) {
                                            if (d.data.message == "success") {
                                                swal("Successfully Cancel Pending!", { icon: "success", });
                                                s.FilterPageGrid();
                                            }
                                        });
                                }
                            });
                    }
                    else { }
                });
        }
        else {
            if (s.datalistgrid[rowID].dtr_type_flag == "1") {
                swal({
                    title: "PLEASE CONFIRM!",
                    text: "Are you sure to Cancel Pending this application 1st Quincena?",
                    icon: "warning",
                    closeOnClickOutside: false,
                    buttons: ["NO", "YES"],
                    dangerMode: true,

                })
                    .then(function (isApprove) {
                        if (isApprove) {
                            h.post("../rSSDTRApprovalNational/ApprovedDisapprove",
                                {
                                    p_dtr_ctrl_nbr: s.datalistgrid[rowID].dtr_ctrl_nbr
                                    , p_dtr_type: "1"
                                    , p_action: "N"
                                }).then(function (d) {
                                    if (d.data.message == "success") {
                                        swal("Successfully Cancel Pending!", { icon: "success", });
                                        s.FilterPageGrid();
                                    }
                                });
                        }
                    });
            }
            else if (s.datalistgrid[rowID].dtr_type_flag == "2") {
                swal({
                    title: "PLEASE CONFIRM!",
                    text: "Are you sure to Cancel Pending this application 2nd Quincena?",
                    icon: "warning",
                    closeOnClickOutside: false,
                    buttons: ["NO", "YES"],
                    dangerMode: true,

                })
                    .then(function (isApprove) {
                        if (isApprove) {
                            h.post("../rSSDTRApprovalNational/ApprovedDisapprove",
                                {
                                    p_dtr_ctrl_nbr: s.datalistgrid[rowID].dtr_ctrl_nbr
                                    , p_dtr_type: "2"
                                    , p_action: "N"
                                }).then(function (d) {
                                    if (d.data.message == "success") {
                                        swal("Successfully Cancel Pending!", { icon: "success", });
                                        s.FilterPageGrid();
                                    }
                                });
                        }
                    });
            }
        }
    }

    s.btn_disapprove_click = function (rowID)
    {
        if (s.datalistgrid[rowID].dtr_type_flag == "0")
        {
            swal({
                title: "APPROVERS OPTION",
                text: "For this part, you have an option which are you going to Disapprove. (FOR WHOLE MONTH ONLY)!",
                icon: "warning",
                closeOnClickOutside: false,
                buttons:
                {
                    approve1:
                    {
                        text: "1st Quincena Only",
                        value: "1",
                        className: "btn btn-primary"
                    },
                    approve2:
                    {
                        text: "2nd Quincena Only",
                        value: "2",
                        className: "btn btn-warning"
                    },
                    approveAll:
                    {
                        text: "Whole Month",
                        value: "0",
                        className: "btn btn-success"
                    }, btn_cancel:
                    {
                        text: "Cancel",
                        value: "",
                        className: "btn btn-danger"
                    }
                },
                dangerMode: true,

            })
                .then(function (willApprove) {
                    if (willApprove == "1") {
                        swal({
                            title: "PLEASE CONFIRM!",
                            text: "Are you sure to Disapprove 1st Quincena Only?",
                            icon: "warning",
                            closeOnClickOutside: false,
                            buttons: ["NO", "YES"],
                            dangerMode: true,

                        })
                            .then(function (isApprove) {
                                if (isApprove) {
                                    h.post("../rSSDTRApprovalNational/ApprovedDisapprove",
                                        {
                                            p_dtr_ctrl_nbr: s.datalistgrid[rowID].dtr_ctrl_nbr
                                            , p_dtr_type: "1"
                                            , p_action: "N"
                                        }).then(function (d) {
                                            if (d.data.message == "success") {
                                                swal("Successfully Disapproved!", { icon: "success", });
                                                s.FilterPageGrid();
                                            }
                                        });
                                }
                            });
                    }
                    else if (willApprove == "2") {
                        swal({
                            title: "PLEASE CONFIRM!",
                            text: "Are you sure to Disapprove 2nd Quincena Only?",
                            icon: "warning",
                            closeOnClickOutside: false,
                            buttons: ["NO", "YES"],
                            dangerMode: true,

                        })
                            .then(function (isApprove) {
                                if (isApprove) {
                                    h.post("../rSSDTRApprovalNational/ApprovedDisapprove",
                                        {
                                            p_dtr_ctrl_nbr: s.datalistgrid[rowID].dtr_ctrl_nbr
                                            , p_dtr_type: "2"
                                            , p_action: "N"
                                        }).then(function (d) {
                                            if (d.data.message == "success") {
                                                swal("Successfully Disapproved!", { icon: "success", });
                                                s.FilterPageGrid();
                                            }
                                        });
                                }
                            });
                    }
                    else if (willApprove == "0") {
                        swal({
                            title: "PLEASE CONFIRM!",
                            text: "Are you sure to Disapprove the whole month?",
                            icon: "warning",
                            closeOnClickOutside: false,
                            buttons: ["NO", "YES"],
                            dangerMode: true,

                        })
                            .then(function (isApprove) {
                                if (isApprove) {
                                    h.post("../rSSDTRApprovalNational/ApprovedDisapprove",
                                        {
                                            p_dtr_ctrl_nbr: s.datalistgrid[rowID].dtr_ctrl_nbr
                                            , p_dtr_type: "0"
                                            , p_action: "N"
                                        }).then(function (d) {
                                            if (d.data.message == "success")
                                            {
                                                swal("Successfully Disapproved!", { icon: "success", });
                                                s.FilterPageGrid();
                                            }
                                        });
                                }
                            });
                    }
                    else { }
                });
        }
        else {
            if (s.datalistgrid[rowID].dtr_type_flag == "1") {
                swal({
                    title: "PLEASE CONFIRM!",
                    text: "Are you sure to Disapprove this application 1st Quincena?",
                    icon: "warning",
                    closeOnClickOutside: false,
                    buttons: ["NO", "YES"],
                    dangerMode: true,

                })
                    .then(function (isApprove) {
                        if (isApprove) {
                            h.post("../rSSDTRApprovalNational/ApprovedDisapprove",
                                {
                                    p_dtr_ctrl_nbr: s.datalistgrid[rowID].dtr_ctrl_nbr
                                    , p_dtr_type: "1"
                                    , p_action: "N"
                                }).then(function (d) {
                                    if (d.data.message == "success") {
                                        swal("Successfully Disapproved!", { icon: "success", });
                                        s.FilterPageGrid();
                                    }
                                });
                        }
                    });
            }
            else if (s.datalistgrid[rowID].dtr_type_flag == "2")
            {
                swal({
                    title: "PLEASE CONFIRM!",
                    text: "Are you sure to Disapproved this application 2nd Quincena?",
                    icon: "warning",
                    closeOnClickOutside: false,
                    buttons: ["NO", "YES"],
                    dangerMode: true,

                })
                    .then(function (isApprove)
                    {
                        if (isApprove) {
                            h.post("../rSSDTRApprovalNational/ApprovedDisapprove",
                                {
                                    p_dtr_ctrl_nbr: s.datalistgrid[rowID].dtr_ctrl_nbr
                                    , p_dtr_type: "2"
                                    , p_action: "N"
                                }).then(function (d) {
                                    if (d.data.message == "success") {
                                        swal("Successfully Disapproved!", { icon: "success", });
                                        s.FilterPageGrid();
                                    }
                                });
                        }
                    });
            }
        }
    }

   
    s.btn_print = function (row_id)
    {
        try {
            s.current_rowId = row_id;
            //$('#main_modal').modal({ backdrop: 'static', keyboard: false });
            var user_id = $('#session_container').attr('dataX');
            s.Modal_title       = "Please Wait..";
            s.generate_message = "PREPARING REPORT PLEASE WAIT..";
            $('#print_preview_modal').modal({ backdrop: 'static', keyboard: false });
            h.post("../rSSDTRApprovalNational/PreviousValuesOnPage_rSSDTROverrides").then(function (d) {
                h.post("../rSSDTRPrinting/RetriveData",
                    {
                        par_year: str_to_year(s.txtb_dtr_mon_year)
                        , par_month: month_name_to_int($("#txtb_dtr_mon_year").val())
                        , par_empl_id:s.datalistgrid[row_id].empl_id  
                        , par_view_type: s.datalistgrid[row_id].dtr_type_flag  
                        , par_department_code: s.ddl_dept

                    }).then(function (d) {

                        if (d.data.sp_report.length == 0)
                        {
                            swal("NO DATA FOUND", "No data found in this Year and Month Selected", { icon: "warning" });
                        }
                        else
                        {
                            var body            = document.getElementById('iframe_content');
                            var body            = document.getElementById('main-body');
                            body.style.overflow = "hidden"
                            var controller      = "Reports"
                            var action          = "Index"
                            var ReportName      = "cryDTR"
                            var SaveName        = "Crystal_Report"
                            var ReportType      = "inline"
                            var ReportPath      = ""
                            var sp              = ""
                            var params = ""
                            ReportPath = "~/Reports/cryDTR/cryDTR.rpt"
                            sp = "sp_dtr_rep,par_year," + str_to_year($("#txtb_dtr_mon_year").val()) + ",par_month," + month_name_to_int($("#txtb_dtr_mon_year").val()) + ",par_empl_id," + s.datalistgrid[row_id].empl_id + ",par_view_type," + s.datalistgrid[row_id].dtr_type_flag + ",par_department_code," + s.ddl_dept + ",par_user_id," + user_id

                            $("#ReportFrame").attr("src", "../Reports/CrystalViewer.aspx?Params=" + params
                                + "&ReportName=" + ReportName
                                + "&SaveName=" + SaveName
                                + "&ReportType=" + ReportType
                                + "&ReportPath=" + ReportPath
                                + "&id=" + sp
                            );
                            //$('#ReportFrame').load(function ()
                            //{
                            //    s.Modal_title = "DTR REPORT PREVIEW";
                            //});
                            checkIframeLoaded();

                        }
                    });
            });

        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }
    
    function checkIframeLoaded()
    {
        // Get a handle to the iframe element
        var iframe = document.getElementById('ReportFrame');
        var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        // Check if loading is complete
        if (iframeDoc.readyState == 'complete')
        {
            //iframe.contentWindow.alert("Hello");
            iframe.contentWindow.onload = function () {
            };
            // The loading is complete, call the function we want executed once the iframe is loaded
            afterLoading();
            return;
        }

        // If we are here, it is not loaded. Set things up so we check   the status again in 100 milliseconds
        window.setTimeout(checkIframeLoaded(rowID), 100);
    }
    function afterLoading()
    {
        s.loading_r = false;
        s.Modal_title = s.datalistgrid[s.current_rowId].employee_name + " DTR REPORT PREVIEW";
       
    }

    function ValidateFields2() {
        var return_val = true;
        ValidationResultColor("ALL", false);

        //Morning In, Validation...
        if ($('#txtb_am_in' + s.current_rowId).val().trim() != "") {
            var input_val = $('#txtb_am_in' + s.current_rowId).val().trim();
            if (moment(input_val, "hh:mm A").format("hh:mm A").replace("Invalid date", "") == "") {
                ValidationResultColor("txtb_am_in" + s.current_rowId, true);
                $("#lbl_txtb_am_in" + s.current_rowId + "_req").text("Invalid Entry");
                return_val = false;
            }
            else if (moment(input_val, "hh:mm A").format("A") == "PM") {
                ValidationResultColor("txtb_am_in" + s.current_rowId, true);
                $("#lbl_txtb_am_in" + s.current_rowId + "_req").text("Invalid Entry");
                return_val = false;
            }
            else if (moment(input_val, "hh:mm A").format("hh") >= "12" && moment(input_val, "hh:mm A").format("A") == "PM") {
                ValidationResultColor("txtb_am_in" + s.current_rowId, true);
                $("#lbl_txtb_am_in" + s.current_rowId + "_req").text("Invalid Entry");
                return_val = false;
            }
        }


        //Morning out, Validation...
        if ($('#txtb_am_out' + s.current_rowId).val().trim() != "") {
            var input_val = $('#txtb_am_out' + s.current_rowId).val().trim();
            if (moment(input_val, "hh:mm A").format("hh:mm A").replace("Invalid date", "") == "") {
                ValidationResultColor("txtb_am_out" + s.current_rowId, true);
                $("#lbl_txtb_am_out" + s.current_rowId + "_req").text("Invalid Entry");
                return_val = false;
            }
            else if
            (
                (moment(input_val, "hh:mm A").format("hh") == "12" && moment(input_val, "hh:mm A").format("mm") >= "31" && moment(input_val, "hh:mm A").format("A") == "PM")
                || (moment(input_val, "hh:mm A").format("hh") < "12" && moment(input_val, "hh:mm A").format("A") == "PM")
            ) {
                ValidationResultColor("txtb_am_out" + s.current_rowId, true);
                $("#lbl_txtb_am_out" + s.current_rowId + "_req").text("Invalid Entry");
                return_val = false;
            }
        }

        //PM in, Validation...
        if ($('#txtb_pm_in' + s.current_rowId).val().trim() != "") {
            var input_val = $('#txtb_pm_in' + s.current_rowId).val().trim();
            if (moment(input_val, "hh:mm A").format("hh:mm A").replace("Invalid date", "") == "") {
                ValidationResultColor("txtb_pm_in" + s.current_rowId, true);
                $("#lbl_txtb_pm_in" + s.current_rowId + "_req").text("Invalid Entry");
                return_val = false;
            }
            else if (moment(input_val, "hh:mm A").format("A") == "AM") {
                ValidationResultColor("txtb_pm_in" + s.current_rowId, true);
                $("#lbl_txtb_pm_in" + s.current_rowId + "_req").text("Invalid Entry");
                return_val = false;
            }
            else if
            (
                (moment(input_val, "hh:mm A").format("hh") == "12" && moment(input_val, "hh:mm A").format("mm") <= "31" && moment(input_val, "hh:mm A").format("A") == "PM")
                || (moment(input_val, "hh:mm A").format("hh") < "12" && moment(input_val, "hh:mm A").format("A") == "AM")
            ) {
                ValidationResultColor("txtb_pm_in" + s.current_rowId, true);
                $("#lbl_txtb_pm_in" + s.current_rowId + "_req").text("Invalid Entry");
                return_val = false;
            }
        }

        //PM out, Validation...
        if ($('#txtb_pm_out' + s.current_rowId).val().trim() != "") {
            var input_val = $('#txtb_pm_out' + s.current_rowId).val().trim();
            if (moment(input_val, "hh:mm A").format("hh:mm A").replace("Invalid date", "") == "") {
                ValidationResultColor("txtb_pm_out" + s.current_rowId, true);
                $("#lbl_txtb_pm_out" + s.current_rowId + "_req").text("Invalid Entry");
                return_val = false;
            }
            else if (moment(input_val, "hh:mm A").format("A") == "AM") {
                ValidationResultColor("txtb_pm_out" + s.current_rowId, true);
                $("#lbl_txtb_pm_out" + s.current_rowId + "_req").text("Invalid Entry");
                return_val = false;
            }
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

            //$("#input_file_upload").removeClass("required");

            //$("#txtb_dtr_date"+s.current_rowId).removeClass("required");
            //$("#lbl_txtb_dtr_date_req").text("");

            $("#txtb_am_in" + s.current_rowId).removeClass("required");
            $("#lbl_txtb_am_in" + s.current_rowId + "_req").text("");

            $("#txtb_am_out" + s.current_rowId).removeClass("required");
            $("#lbl_txtb_am_out" + s.current_rowId + "_req").text("");

            $("#txtb_pm_in" + s.current_rowId).removeClass("required");
            $("#lbl_txtb_pm_in" + s.current_rowId + "_req").text("");

            $("#txtb_pm_out" + s.current_rowId).removeClass("required");
            $("#lbl_txtb_pm_out" + s.current_rowId + "_req").text("");

        }
    }

    function str_to_year(str) {
        var year = str.substr(str.length - 4);

        return year;
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

    function clearentry2() {
        $("#txtb_am_in" + s.current_rowId).val("");
        $("#txtb_am_out" + s.current_rowId).val("");
        $("#txtb_pm_in" + s.current_rowId).val("");
        $("#txtb_pm_out" + s.current_rowId).val("");
    }

})