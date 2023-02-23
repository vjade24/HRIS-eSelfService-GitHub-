ng_selfService_App.controller("rSSAOHRender_ctrlr", function ($scope, $compile, $http, $filter, Upload, $timeout) {
    var s = $scope
    var h = $http

    s.dept_list = [];
    s.datalistgrid = [];
    s.datalist_save_temp = [];
    
    s.show_dtr_status       = false;
    s.showGridInput         = false;
    s.current_rowId         = "";
    s.allowSubmit           = false;
    s.allowPrint            = false;
    s.user_employment_type  = "";
    s.generate_message      = "";
    s.isAO                  = false;
    s.allowgenerate         = true;
    s.ddl_employee_source   = [];

    function init()
    {
        $("#txtb_dtr_mon_year").datepicker({
            format: "MM - yyyy",
            startView: "years",
            minViewMode: "months",
            autoclose: true,
        });

        $("#txtb_dtr_mon_year").on('change', function (e) {
            s.FilterPageGrid();
        });

        s.ddl_viewtype = "0";

        var ddate = new Date();
        s.txtb_dtr_mon_year = moment(ddate).format("MMMM - YYYY");
        $("#modal_generating_remittance").modal();
        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../rSSAOHRender/InitializeData").then(function (d)
        {
            if (d.data.message == "success")
            {
                
                s.empl_names            = d.data.empl_name;
                s.dept_list             = d.data.dept_list;
                s.ddl_dept              = d.data.dept_code;
                //s.ddl_name              = d.data.um.user_id.replace("U", "");
                s.txtb_empl_id          = d.data.um.user_id.replace("U", "");
                s.user_employment_type  = d.data.user_employment_type;
                s.ddl_employee_source   = d.data.sp_dtr_transmittal_addressto_list;

                if (d.data.aoh_data_list.length > 0)
                {
                    init_table_data(d.data.aoh_data_list);
                }
                else {
                    init_table_data([]);
                }

                //**********************************************
                //  Show/Hide ADD, EDIT, DELETE button 
                //**********************************************
                console.log(d.data.log_in_as_AO);
                d.data.um.allow_add     == "1" ? s.ShowAdd      = true : s.ShowAdd      = false;
                d.data.um.allow_delete  == "1" ? s.ShowDelete   = true : s.ShowDelete   = false;
                d.data.um.allow_edit    == "1" ? s.ShowEdit     = true : s.ShowEdit     = false;
                s.isAO                  = d.data.user_role[0] == "993" ? true:false;
                //d.data.um.allow_view    == "1" ? s.ShowView     = true : s.ShowView     = false;
                //d.data.um.allow_print == "1" ? s.ShowAdd = true : s.ShowAdd = false;

                $("#modal_generating_remittance").modal("hide");

                $('#div_dtr_date .input-group.date').datepicker({
                    todayBtn: "linked",
                    keyboardNavigation: false,
                    forceParse: false,
                    calendarWeeks: true,
                    autoclose: true,
                    format: "yyyy-mm-dd"
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
                data        : s.datalistgrid,
                bSort       : true,
                bAutoWidth  : false,
                sDom        : 'rt<"bottom">',
                paging      : false,
                columns     : [
                    {
                        "mData": "empl_id",
                        "mRender": function (data, type, full, row)
                        {
                            return "<span class='text-center btn-block' style='font-weight:bold;'>&nbsp;" + data + "</span>";
                        }
                    },
                    {
                        "mData": "employee_name",
                        "mRender": function (data, type, full, row)
                        {
                            return "<span class='text-left btn-block' style='font-weight:bold;'>&nbsp;" + data + "</span>";
                        }
                    },
                    {
                        "mData": "position_long_title",
                        "mRender": function (data, type, full, row)
                        {
                            return "<span class='text-left btn-block' style='font-weight:bold;'>&nbsp;" + data + "</span>";
                        }
                    },
                    {
                        "mData": "dtr_date_concatenated",
                        "mRender": function (data, type, full, row)
                        {
                            return "<span class='text-left btn-block' style='font-weight:bold;'>&nbsp;" + data + "</span>";
                        }
                    },
                    {
                        "mData": null,
                        "mRender": function (data, type, full, row)
                        {
                            var return_html     = "";
                            
                                disable_edit    = false;
                                disable_delete  = false;

                            return_html = '<center><div class="btn-group">' +
                                //'<button type="button" ng-show="ShowEdit" ng-disabled="' + disable_edit +'" id="grid_btn'+row["row"]+'" ngx-action="E" class="btn btn-success btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit DTR Entry">  <i class="fa fa-edit"></i></button >' +
                                '<button type="button" ng-show="ShowEdit" ng-disabled="' + disable_delete +'" class="btn btn-danger  btn-sm" ng-click="btn_delete_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete Data">  <i class="fa fa-trash"></i></button >' +
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
    
    s.search_in_list = function (value, table)
    {
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
        try
        {
            h.post("../rSSAOHRender/FilterPageGrid", {
                p_dept_code     : $("#ddl_dept option:selected").val()
                , p_empl_id     : $("#ddl_name option:selected").val()
                , p_year: str_to_year($("#txtb_dtr_mon_year").val())
                , p_month       : month_name_to_int($("#txtb_dtr_mon_year").val())
                , p_view_type   : $("#ddl_viewtype option:selected").val()
            }).then(function (d)
            {
                if (d.data.message == "success")
                {
                   
                    //s.empl_names = d.data.empl_name;
                    s.txtb_empl_id = $("#ddl_name option:selected").val();
                    
                    s.oTable.fnClearTable(d.data.filteredGrid);
                    s.datalistgrid = d.data.filteredGrid;
                    s.allowgenerate = true;
                    s.allowSubmit   = false;
                    s.allowPrint    = false;

                    if (d.data.filteredGrid.length > 0)
                    {
                        s.allowSubmit = true;
                        s.allowgenerate = true;
                        s.allowPrint = true;
                        s.ddl_noted_by = s.datalistgrid[0].noted_by_empl_id;
                        $("#ddl_noted_by").trigger("change");

                        s.ddl_approved_by = s.datalistgrid[0].approved_by_empl_id;
                        $("#ddl_approved_by").trigger("change");

                        s.ddl_requested_by = s.datalistgrid[0].requested_by_empl_id;
                        $("#ddl_requested_by").trigger("change");

                        s.ddl_recommended_by = s.datalistgrid[0].recomappr_empl_id;
                        $("#ddl_recommended_by").trigger("change");

                        s.oTable.fnAddData(d.data.filteredGrid);
                    }
                    else
                    {
                        s.ddl_noted_by = "";
                        $("#ddl_noted_by").trigger("change");

                        s.ddl_approved_by = "";
                        $("#ddl_approved_by").trigger("change");

                        s.ddl_requested_by = "";
                        $("#ddl_requested_by").trigger("change");

                        s.ddl_recommended_by = "";
                        $("#ddl_recommended_by").trigger("change");
                    }
                }
            });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    s.btn_generate = function (par_action)
    {
        try
        {
            $('#main_modal').modal({ backdrop: 'static', keyboard: false });
            s.generate_message =  " GENERATING LIST OF EMPLOYEES";
            s.oTable.fnClearTable();
            h.post("../rSSAOHRender/generate_aoh_list",
                {
                      p_dept_code   : $("#ddl_dept option:selected").val()
                    , p_year: str_to_year($("#txtb_dtr_mon_year").val())
                    , p_month       : month_name_to_int($("#txtb_dtr_mon_year").val())
                    , p_view_type   : "ALL"
                }).then(function (d)
                {
                    $('#main_modal').modal("hide");
                    s.datalistgrid = [];
                    s.allowgenerate = true;
                    s.allowSubmit = false;
                    s.allowPrint = false;
                    if (d.data.message == "success")
                    {  
                        if (d.data.filteredGrid.length > 0)
                        {
                            s.allowSubmit = true;
                            //s.allowgenerate = false;
                            s.allowPrint = true;
                            s.datalistgrid = d.data.filteredGrid;
                            swal("Successfully generated "+d.data.filteredGrid.length.toString()+" employee.", { icon: "success", });
                            s.oTable.fnAddData(s.datalistgrid);
                        }
                        else
                        {
                            swal("No data Generated", { icon: "warning", });
                        }
                    }
                    else
                    {
                        swal(d.data.message, { icon: "warning", });
                    }
                });
        }
        catch (err)
        {
            $('#main_modal').modal("hide");
            swal({ icon: "warning", title: err.message });
        }
    }

    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.ddl_dept_chane = function () {
        try {
            h.post("../rSSAOHRender/DepartmentFilter",
                {
                p_dept_code: $("#ddl_dept option:selected").val()
            }).then(function (d) {
                if (d.data.message == "success")
                {
                    console.log(d.data.empl_name);
                    s.empl_names = d.data.empl_name;
                }
            });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    
    }

    function closeAllOpen()
    {
        for (var x = 0; x < s.datalistgrid.length; x++)
        {
            if (x != s.current_rowId)
            {
                $('#grid_btn'+x).attr("ngx-action", "E");
                $('#grid_btn'+x).attr("title", "Edit DTR Entry");
                $('#grid_btn' + x).html('<i class="fa fa-edit"></i>');
                s["showGridInput" + x] = false;
            }
        }
    }

    s.btn_save_all = function (par_action)
    {
        try
        {
            $('#main_modal').modal({ backdrop: 'static', keyboard: false });
            s.generate_message = " SAVING LIST OF EMPLOYEE";
            s.datalist_save_temp = [];
            for (var x = 0; x < s.datalistgrid.length; x++)
            {
                var push_data =
                {
                    aoh_ctrl_nbr            : s.datalistgrid[x].aoh_ctrl_nbr,
                    empl_id                 : s.datalistgrid[x].empl_id,
                    dtr_date_concatenated   : s.datalistgrid[x].dtr_date_concatenated,
                    aoh_reason              : s.datalistgrid[x].aoh_reason
                }
                s.datalist_save_temp.push(push_data);
            }
            var data_hdr =
            {
                 aoh_ctrl_nbr           : ""
                , dtr_year: str_to_year($("#txtb_dtr_mon_year").val())
                ,dtr_month              : month_name_to_int($("#txtb_dtr_mon_year").val())
                ,department_code        : s.ddl_dept
                ,empl_id                : ""
                ,created_ddtm           : ""
                ,created_by             : ""
                ,updated_ddtm           : ""
                ,updated_by             : ""
                ,noted_by_empl_id       : $('#ddl_noted_by option:selected').val()
                ,requested_by_empl_id   : $('#ddl_requested_by option:selected').val()
                ,recomappr_empl_id      : $('#ddl_recommended_by option:selected').val()
                ,approved_by_empl_id    : $('#ddl_approved_by option:selected').val()
                ,approval_status        : "N"
                ,aoh_remakrs            : ""
            }

            h.post("../rSSAOHRender/SaveSubmitAll",
                {
                    data_header : data_hdr,
                    data        : s.datalist_save_temp,
                    par_action  : "ADD",
                    view_type   : $("#ddl_viewtype option:selected").val()
                }).then(function (d)
                {
                    if (d.data.message == "success")
                    {
                        swal("Successfully Save", { icon: "success", });
                        $('#main_modal').modal("hide");
                        s.FilterPageGrid();
                    }
                    else
                    {
                        $('#main_modal').modal("hide");
                        swal(d.data.message, { icon: "warning", });
                    }
                });
        }
        catch (err)
        {
            $('#main_modal').modal("hide");
            swal({ icon: "warning", title: err.message });
        }
        
    }
    
    s.btn_delete_action = function (rowId)
    {
        var data =
        {
             aoh_ctrl_nbr           : s.datalistgrid[rowId].aoh_ctrl_nbr
            ,empl_id                : s.datalistgrid[rowId].empl_id
            ,dtr_date_concatenated  : s.datalistgrid[rowId].dtr_date_concatenated
            ,aoh_reason             : s.datalistgrid[rowId].aoh_reason
        }

        swal({
            title: "ARE YOU SURE TO DELETE THIS RECORD?",
            text: "This employee will not be included for this Authority on hours render report.",
            icon: "warning",
            buttons: ["NO", "YES"],
            dangerMode: true,

        })
            .then(function (willDelete)
            {
                if (willDelete)
                {
                    //ENDED BY JORGE
                    h.post("../rSSAOHRender/DeleteExisting", { data: data, par_action: "ADD" }).then(function (d)
                    {
                        if (d.data.message == "success")
                        {
                            s.datalistgrid = s.datalistgrid.delete(rowId);
                            s.oTable.fnClearTable();
                            if (s.datalistgrid.length > 0)
                            {
                                s.allowgenerate = true;
                                s.allowSubmit   = true;
                                s.allowPrint    = true;
                                s.oTable.fnAddData(s.datalistgrid);
                            }
                            else
                            {
                                s.allowgenerate = true;
                                s.allowSubmit = false;
                                s.allowPrint = false;
                            }
                            swal("Entry Successfully cleared!", { icon: "success", title: "Successfully cleared!" });
                        }
                        else {
                            swal(d.data.message, { icon: "warning", });
                        }
                    });
                }
            });
    }

    Array.prototype.delete = function (code) {
        return this.filter(function (d, k) {
            return k != code
        })
    }

    s.btn_print = function (employment_type)
    {
        try {
            s.loading_r = true;
            //s.current_rowId = row_id;
            //$('#main_modal').modal({ backdrop: 'static', keyboard: false });
            s.Modal_title = "Please Wait..";
            s.generate_message = "PREPARING REPORT PLEASE WAIT..";
         
            var par_year            = str_to_year($("#txtb_dtr_mon_year").val());
            var par_month           = month_name_to_int($("#txtb_dtr_mon_year").val());
            var par_department      = s.ddl_dept;
            var par_employment_type = employment_type;
            var par_empl_id = "";
            $('#print_preview_modal').modal({ backdrop: 'static', keyboard: false });
            h.post("../rSSAOHRender/ChecSpReportResult",
                {
                     par_year           :par_year           
                    ,par_month          :par_month          
                    ,par_department     :par_department     
                    ,par_employment_type:par_employment_type
                    ,par_empl_id        :par_empl_id        
                })
                .then(function (d)
                {
                  

                    if (d.data.message == "success")
                    {
                        if (d.data.report_result.length > 0)
                        {
                            var body            = document.getElementById('iframe_content');
                            var body            = document.getElementById('main-body');
                            body.style.overflow = "hidden";
                            var controller      = "Reports";
                            var action          = "Index";
                            var ReportName      = "cryDTR";
                            var SaveName        = "Crystal_Report";
                            var ReportType      = "inline";
                            var ReportPath      = "";
                            var sp              = "";
                            var params          = "";
                            ReportPath          = "~/Reports/cryAOHRenderReport/cryAOHRenderReport.rpt";
                            sp = "sp_authority_onhours_render_rep,par_year," + str_to_year($("#txtb_dtr_mon_year").val()) + ",par_month," + month_name_to_int($("#txtb_dtr_mon_year").val()) + ",par_empl_id," + par_empl_id + ",par_employment_type," + par_employment_type + ",par_department," + par_department;
                            
                            $("#ReportFrame").attr("src", "../Reports/CrystalViewer.aspx?Params=" + params
                                + "&ReportName=" + ReportName
                                + "&SaveName=" + SaveName
                                + "&ReportType=" + ReportType
                                + "&ReportPath=" + ReportPath
                                + "&id=" + sp
                            );
                            checkIframeLoaded();
                        }
                        else
                        {
                            $('#print_preview_modal').modal('hide');
                            swal({ icon: "info", title: "NO DATA FOUND FOR THE REPORT" });
                        }
                    }
                    else {
                        $('#print_preview_modal').modal('hide');
                        swal({ icon: "warning", title: d.data.message });
                    }
                });
        }
        catch (err)
        {
            $('#print_preview_modal').modal('hide');
            swal({ icon: "warning", title: err.message });
        }
    }

    function checkIframeLoaded()
    {
        // Get a handle to the iframe element
        var iframe      = document.getElementById('ReportFrame');
        var iframeDoc   = iframe.contentDocument || iframe.contentWindow.document;

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
        window.setTimeout(checkIframeLoaded(), 100);
    }

    function afterLoading()
    {
        s.loading_r     = false;
        s.Modal_title   = "PRINT PREVIEW";
    }

    function ValidateFields2()
    {
        var return_val = true;
        ValidationResultColor("ALL", false);

        //Morning In, Validation...
        if ($('#txtb_am_in' + s.current_rowId).val().trim() != "")
        {
            var input_val = $('#txtb_am_in' + s.current_rowId).val().trim();
            if (moment(input_val, "hh:mm A").format("hh:mm A").replace("Invalid date", "") == "")
            {
                ValidationResultColor("txtb_am_in" + s.current_rowId, true);
                $("#lbl_txtb_am_in" + s.current_rowId+"_req").text("Invalid Entry");
                return_val = false;
            }
            else if (moment(input_val, "hh:mm A").format("A") == "PM")
            {
                ValidationResultColor("txtb_am_in" + s.current_rowId, true);
                $("#lbl_txtb_am_in" + s.current_rowId+"_req").text("Invalid Entry");
                return_val = false;
            }
            else if (moment(input_val, "hh:mm A").format("hh") >= "12" && moment(input_val, "hh:mm A").format("A") == "PM")
            {
                ValidationResultColor("txtb_am_in" + s.current_rowId, true);
                $("#lbl_txtb_am_in" + s.current_rowId+"_req").text("Invalid Entry");
                return_val = false;
            }
        }


        //Morning out, Validation...
        if ($('#txtb_am_out' + s.current_rowId).val().trim() != "")
        {
            var input_val = $('#txtb_am_out' + s.current_rowId).val().trim();
            if (moment(input_val, "hh:mm A").format("hh:mm A").replace("Invalid date", "") == "")
            {
                ValidationResultColor("txtb_am_out" + s.current_rowId, true);
                $("#lbl_txtb_am_out" + s.current_rowId+"_req").text("Invalid Entry");
                return_val = false;
            }
            else if
            (
                (moment(input_val, "hh:mm A").format("hh") == "12" && moment(input_val, "hh:mm A").format("mm") >= "31" && moment(input_val, "hh:mm A").format("A") == "PM")
                || (moment(input_val, "hh:mm A").format("hh") < "12"  && moment(input_val, "hh:mm A").format("A") == "PM")
            )
            {
                ValidationResultColor("txtb_am_out" + s.current_rowId, true);
                $("#lbl_txtb_am_out" + s.current_rowId+"_req").text("Invalid Entry");
                return_val = false;
            }
        }

        //PM in, Validation...
        if ($('#txtb_pm_in' + s.current_rowId).val().trim() != "")
        {
            var input_val = $('#txtb_pm_in' + s.current_rowId).val().trim();
            if (moment(input_val, "hh:mm A").format("hh:mm A").replace("Invalid date", "") == "") {
                ValidationResultColor("txtb_pm_in" + s.current_rowId, true);
                $("#lbl_txtb_pm_in" + s.current_rowId+"_req").text("Invalid Entry");
                return_val = false;
            }
            else if (moment(input_val, "hh:mm A").format("A") == "AM")
            {
                ValidationResultColor("txtb_pm_in" + s.current_rowId, true);
                $("#lbl_txtb_pm_in" + s.current_rowId+"_req").text("Invalid Entry");
                return_val = false;
            }
            else if
            (
                (moment(input_val, "hh:mm A").format("hh") == "12" && moment(input_val, "hh:mm A").format("mm") <= "30" && moment(input_val, "hh:mm A").format("A") == "PM")
                || (moment(input_val, "hh:mm A").format("hh") < "12" && moment(input_val, "hh:mm A").format("A") == "AM")
            )
            {
                ValidationResultColor("txtb_pm_in" + s.current_rowId, true);
                $("#lbl_txtb_pm_in" + s.current_rowId+"_req").text("Invalid Entry");
                return_val = false;
            }
        }

        //PM out, Validation...
        if ($('#txtb_pm_out' + s.current_rowId).val().trim() != "")
        {
            var input_val = $('#txtb_pm_out' + s.current_rowId).val().trim();
            if (moment(input_val, "hh:mm A").format("hh:mm A").replace("Invalid date", "") == "") {
                ValidationResultColor("txtb_pm_out" + s.current_rowId, true);
                $("#lbl_txtb_pm_out" + s.current_rowId+"_req").text("Invalid Entry");
                return_val = false;
            }
            else if (moment(input_val, "hh:mm A").format("A") == "AM")
            {
                ValidationResultColor("txtb_pm_out" + s.current_rowId, true);
                $("#lbl_txtb_pm_out" + s.current_rowId+"_req").text("Invalid Entry");
                return_val = false;
            }
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
            $("#lbl_" + par_object_id + "_req").text("Required Field!");
        }
        else {
            //remove of refresh the object form being required

            //$("#input_file_upload").removeClass("required");

            //$("#txtb_dtr_date"+s.current_rowId).removeClass("required");
            //$("#lbl_txtb_dtr_date_req").text("");

            $("#txtb_am_in" + s.current_rowId).removeClass("required");
            $("#lbl_txtb_am_in" + s.current_rowId+"_req").text("");

            $("#txtb_am_out" + s.current_rowId).removeClass("required");
            $("#lbl_txtb_am_out" + s.current_rowId +"_req").text("");

            $("#txtb_pm_in" + s.current_rowId).removeClass("required");
            $("#lbl_txtb_pm_in" + s.current_rowId +"_req").text("");

            $("#txtb_pm_out" + s.current_rowId).removeClass("required");
            $("#lbl_txtb_pm_out" + s.current_rowId +"_req").text("");

        }
    }

    function str_to_year(str)
    {
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

    function clearentry2()
    {
        $("#txtb_am_in" + s.current_rowId).val("");
        $("#txtb_am_out" + s.current_rowId).val("");
        $("#txtb_pm_in" + s.current_rowId).val("");
        $("#txtb_pm_out" + s.current_rowId).val("");
    }
})