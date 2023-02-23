ng_selfService_App.controller("cDTRNational_ctrlr", function ($scope, $compile, $http, $filter, Upload, $timeout) {
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

        $("#ddl_name").select2().on('change', function (e) {
            s.FilterPageGrid();
        });

        s.ddl_viewtype = "0";

        var ddate = new Date();
        s.txtb_dtr_mon_year = moment(ddate).format("MMMM - YYYY");
        $("#modal_generating_remittance").modal();
        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../cDTRNational/InitializeData").then(function (d) {
            if (d.data.message == "success")
            {
                
                s.empl_names    = d.data.empl_name;
                s.dept_list     = d.data.dept_list;
                s.ddl_dept      = d.data.dept_code;
                s.ddl_name      = d.data.um.user_id.replace("U", "");
                s.txtb_empl_id  = d.data.um.user_id.replace("U", "");
                s.user_employment_type = d.data.user_employment_type;
                if (d.data.dtr_val.length > 0)
                {
                    s.allowPrint = true;

                    if (d.data.dtr_val[0].day_status == "X")
                    {
                        s.txtb_status   = "Not Allowed Advance";
                        s.allowSubmit   = false;
                        s.allowPrint    = false;
                        s.allowgenerate = false;
                    }
                    else if ($("#ddl_viewtype option:selected").val() == "0" && (d.data.dtr_val[0].frst_qcna_transmittal == "Y" && d.data.dtr_val[0].sec_qcna_transmittal == "Y")) {
                        s.txtb_status = "All Transmitted";
                        s.allowSubmit = false;
                       
                    }
                    else if ($("#ddl_viewtype option:selected").val() == "0" && (d.data.dtr_val[0].status_1st == "N" && d.data.dtr_val[0].status_2nd == "N")
                        && (d.data.dtr_val[0].day_status == "N")) {
                        s.txtb_status = "New";
                        s.allowSubmit = true;
                    }
                    else if ($("#ddl_viewtype option:selected").val() == "0" && (d.data.dtr_val[0].status_1st == "S" && d.data.dtr_val[0].status_2nd == "S")
                        && (d.data.dtr_val[0].day_status == "N")) {
                        s.txtb_status = "All Submitted";
                        s.allowSubmit = false;
                    }
                    else if ($("#ddl_viewtype option:selected").val() == "0" && (d.data.dtr_val[0].status_1st == "F" && d.data.dtr_val[0].status_2nd == "F")) {
                        s.txtb_status = "All Approved";
                        s.allowSubmit = false;
                    }
                    else if ($("#ddl_viewtype option:selected").val() == "0")
                    {
                        if ((d.data.dtr_val[0].status_1st == "F" && d.data.dtr_val[0].status_2nd == "N"))
                        {
                            s.txtb_status = "1st Quincena " + d.data.dtr_val[0].status_1st_descr;
                            s.allowSubmit = true;
                        }
                        else if ((d.data.dtr_val[0].status_1st == "N" && d.data.dtr_val[0].status_2nd == "F")) {
                            s.txtb_status = "2nd Quincena " + d.data.dtr_val[0].status_2nd_descr;
                            s.allowSubmit = true;
                        }
                        else if (d.data.dtr_val[0].day_status == "A" && d.data.dtr_val[15].day_status == "A") {
                            s.txtb_status = "Transmitted";
                            s.allowSubmit = false;
                        }
                        else if ((d.data.dtr_val[0].day_status == "A")) {
                            s.txtb_status = "1st Quincena Approve";
                            s.allowSubmit = false;
                        }
                        else if ((d.data.dtr_val[0].status_1st == "F")) {
                            s.txtb_status = "1st Quincena Approve";
                            s.allowSubmit = false;
                        }
                        else if ((d.data.dtr_val[14].status_2nd == "F")) {
                            s.txtb_status = "2nd Quincena Approve";
                            s.allowSubmit = false;
                        }
                        else if ((d.data.dtr_val[0].status_1st == "S"))
                        {
                            s.txtb_status = "1st Quincena Submitted";
                            s.allowSubmit = true;
                        }
                        else if ((d.data.dtr_val[14].status_2nd == "S"))
                        {
                            s.txtb_status = "2nd Quincena Submitted";
                            s.allowSubmit = true;
                        }
                        else if ((d.data.dtr_val[14].day_status == "A")) {
                            s.txtb_status = "2nd Quincena Approve";
                            s.allowSubmit = false;
                        }
                    }
                    else if ($("#ddl_viewtype option:selected").val() == "1") {
                        s.txtb_status = d.data.dtr_val[0].status_1st_descr;
                        if (d.data.dtr_val[0].status_1st == "N" && d.data.dtr_val[0].day_status == "N") {
                            s.allowSubmit = true;
                        }
                        else if (d.data.dtr_val[0].status_1st == "F") {
                            s.allowSubmit = false;
                        }
                        else if (d.data.dtr_val[0].status_1st == "S")
                        {
                            s.allowSubmit = false;
                        }
                        else {
                            s.txtb_status = "Transmitted";
                            s.allowSubmit = false;
                        }
                    }
                    else if ($("#ddl_viewtype option:selected").val() == "2") {
                        s.txtb_status = d.data.dtr_val[0].status_2nd_descr;
                        if (d.data.dtr_val[0].status_2nd == "N" && d.data.dtr_val[0].day_status == "N") {
                            s.allowSubmit = true;
                        }
                        else if (d.data.dtr_val[0].status_2nd == "F") {
                            s.allowSubmit = false;
                        }
                        else if (d.data.dtr_val[0].status_2nd == "S") {
                            s.allowSubmit = false;
                        }
                        else {
                            s.txtb_status = "Transmitted";
                            s.allowSubmit = false;
                        }
                    }
                    else {
                        if (d.data.dtr_val[0].status_1st != "N")
                        {
                            s.txtb_status = "1st Quincena " + d.data.dtr_val[0].status_1st_descr;
                        }
                        else {
                            s.txtb_status = "1st Quincena " + d.data.dtr_val[0].status_1st_descr;
                        }
                    }
                    init_table_data(d.data.dtr_val);
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
                bSort       : false,
                bAutoWidth  : false,
                sDom        : 'rt<"bottom">',
                paging      : false,
                columns     : [
                    {
                        "mData": null,
                        "mRender": function (data, type, full, row)
                        {
                             if (full["day_of_week"] == "S")
                            {
                                return "<span class='text-left btn-block' style='color:#ed5565;font-weight:bold;'>" + full["dtr_day"] + "</span>";
                            }
                            else {
                                return "<span class='text-left btn-block' style='font-weight:bold;'>" + full["dtr_day"] + "</span>";
                            }
                        }
                    },
                    {
                        "mData": "time_in_am",
                        "mRender": function (data, type, full, row)
                        {
                            var dis_edit_in_am = true;
                            if (full["time_in_am_flag"] == "B") //FROM BIO
                            {
                                dis_edit_in_am = true;
                            }
                            else if(full["time_in_am_flag"] == "M") //MANUALLY ADDED
                            {
                                dis_edit_in_am = false;
                            }
                            else if (full["time_in_am_flag"] == "")
                            {
                                dis_edit_in_am = false;
                            }
                              
                            return "<span class='text-center btn-block' ng-show='!showGridInput" + row["row"] + "'>" + moment(data, "HH:mm").format("hh:mm").replace("Invalid date","") + "</span>" +
                                    '<div class="row">' +
                                    '<div class="col-lg-12">' +
                                    '<div style="margin-bottom:5px;" id="clock_am_in' + row["row"] + '" class="input-group clockpicker" data-placement="top" data-align="top" data-autoclose="true">' +
                                    '<input type="text" maxlength="8" ng-disabled="' + dis_edit_in_am+'" id="txtb_am_in' + row["row"] + '" style="color:black !important;" ng-show="showGridInput' + row["row"] + '" value="' + moment(data, "HH:mm").format("hh:mm A").replace("Invalid date", "") +'"  class="form-control font-bold atsfield">' +
                                    ' <span class="input-group-addon" ng-show="showGridInput' + row["row"] + '">' +
                                    '<span class="glyphicon glyphicon-time" style="color:gray !important"></span>' +
                                    ' </span>'+
                                    '</div>' +
                                    '<label class="lbl_required" id="lbl_txtb_am_in' + row["row"] + '_req"></label>'+
                                    '</div> '+
                                    '</div> ';
                        }
                    },
                    {
                        "mData": "time_out_am",
                        "mRender": function (data, type, full, row)
                        {
                            var dis_edit_out_am = true;
                            if (full["time_out_am_flag"] == "B")
                            {
                                dis_edit_out_am = true;
                            }
                            else if (full["time_out_am_flag"] == "M")
                            {
                                dis_edit_out_am = false;
                            }
                            else if (full["time_out_am_flag"] == "") {
                                dis_edit_out_am = false;
                            }
                           return "<span class='text-center btn-block' ng-show='!showGridInput" + row["row"] + "'>" + moment(data, "HH:mm").format("hh:mm").replace("Invalid date", "") + "</span>" +
                                '<div class="row">' +
                                '<div class="col-lg-12">' +
                                '<div style="margin-bottom:5px;" id="clock_am_out' + row["row"] + '" class="input-group clockpicker" data-placement="top" data-align="top" data-autoclose="true">' +
                               '<input type="text" maxlength="8" ng-disabled="' + dis_edit_out_am+'" id="txtb_am_out' + row["row"] + '" style="color:black !important;" ng-show="showGridInput' + row["row"] + '" value="' + moment(data, "HH:mm").format("hh:mm A").replace("Invalid date", "") + '"   class="form-control font-bold atsfield">' +
                                ' <span class="input-group-addon" ng-show="showGridInput' + row["row"] + '">' +
                                '<span class="glyphicon glyphicon-time" style="color:gray !important"></span>' +
                                ' </span>' +
                                '</div>' +
                                '<label class="lbl_required" id="lbl_txtb_am_out' + row["row"] + '_req"></label>' +
                                '</div>' +
                                '</div>';
                        }
                    },
                    {
                        "mData": "time_in_pm",
                        "mRender": function (data, type, full, row)
                        {
                            var dis_edit_in_pm = true;
                            if (full["time_in_pm_flag"] == "B") {
                                dis_edit_in_pm = true;
                            }
                            else if (full["time_in_pm_flag"] == "M") {
                                dis_edit_in_pm = false;
                            }
                            else if (full["time_in_pm_flag"] == "")
                            {
                                dis_edit_in_pm = false;
                            }

                           return "<span class='text-center btn-block' ng-show='!showGridInput" + row["row"] + "'>" + moment(data, "HH:mm").format("hh:mm").replace("Invalid date", "") + "</span>" +
                                '<div class="row">' +
                                '<div class="col-lg-12">' +
                                '<div style="margin-bottom:5px;" id="clock_pm_in' + row["row"] + '" class="input-group clockpicker" data-placement="top" data-align="top" data-autoclose="true">' +
                               '<input type="text" maxlength="8" ng-disabled="' + dis_edit_in_pm+'" id="txtb_pm_in' + row["row"] + '" style="color:black !important;" ng-show="showGridInput' + row["row"] + '" value="' + moment(data, "HH:mm").format("hh:mm A").replace("Invalid date", "") + '"   class="form-control font-bold atsfield">' +
                                ' <span class="input-group-addon" ng-show="showGridInput' + row["row"] + '">' +
                                '<span class="glyphicon glyphicon-time" style="color:gray !important"></span>' +
                                ' </span>' +
                                '</div>' +
                                '<label class="lbl_required" id="lbl_txtb_pm_in' + row["row"] + '_req"></label>' +
                                '</div > ' +
                                '</div > ';
                        }
                    },
                    {
                        "mData": "time_out_pm",
                        "mRender": function (data, type, full, row)
                        {
                            s["showGridInput" + row["row"]] = false;
                            var dis_edit_out_pm = true;
                            if (full["time_out_pm_flag"] == "B") {
                                dis_edit_out_pm = true;
                            }
                            else if (full["time_out_pm_flag"] == "M")
                            {
                                dis_edit_out_pm = false;
                            }
                            else if (full["time_out_pm_flag"] == "")
                            {
                                dis_edit_out_pm = false;
                            }
                            return "<span class='text-center btn-block' ng-show='!showGridInput" + row["row"] + "'>" + moment(data, "HH:mm").format("hh:mm").replace("Invalid date", "") + "</span>" +
                                //'<input type="text" style="color:black !important;" ng-show="showGridInput' + row["row"] + '"  id="txtb_am_in' + row["row"] + '" value="' + moment(data, "HH:mm").format("hh:mm A")+'" class="form-control font-bold atsfield">'
                                '<div class="row">' +
                                '<div class="col-lg-12">' +
                                '<div style="margin-bottom:5px;" id="clock_pm_out' + row["row"] + '" class="input-group clockpicker" data-placement="top" data-align="top" data-autoclose="true">' +
                                '<input type="text" maxlength="8" ng-disabled ="' + dis_edit_out_pm+'" style="color:black !important;" ng-show="showGridInput' + row["row"] + '" value="' + moment(data, "HH:mm").format("hh:mm A").replace("Invalid date", "") + '"  id="txtb_pm_out' + row["row"] + '" class="form-control font-bold atsfield">' +
                                ' <span class="input-group-addon" ng-show="showGridInput' + row["row"] + '">' +
                                '<span class="glyphicon glyphicon-time" style="color:gray !important"></span>' +
                                ' </span>' +
                                '</div>' +
                                '<label class="lbl_required" id="lbl_txtb_pm_out' + row["row"] + '_req"></label>' +
                                '</div > ' +
                                '</div > ';
                        }
                    },
                    {
                        "mData": "under_Time_remarks",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "remarks_details",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": null,
                        "mRender": function (data, type, full, row)
                        {
                            var return_html     = "";
                            var disable_delete  = false;
                            var disable_edit    = false;
                            //console.log("DAY STATUS:" + full["day_status"]+"\nDD:" + moment(full["dtr_date"]).format("DD") + "\nStatus1:" + full["status_1st"] + "\nStatus2:" + full["status_2nd"]);
                            if (full["day_status"] == "A" || full["day_status"] == "X")
                            {
                                disable_delete = true;
                                disable_edit = true;
                            }
                            else if (full["status_1st"] != "N" && full["status_2nd"] != "N") {
                                disable_delete = true;
                                disable_edit = true;
                            }
                            else if (full["status_1st"] != "N" && moment(full["dtr_date"]).format("DD") <= 15) {
                                disable_delete = true;
                                disable_edit = true;
                            }
                            else if (full["status_2nd"] != "N" && moment(full["dtr_date"]).format("DD") >= 16)
                            {
                                disable_delete = true;
                                disable_edit = true;
                            }
                            else if (full["time_in_am"] == "" && full["time_out_am"] == "" && full["time_in_pm"] == "" && full["time_out_pm"] == "") {
                                disable_edit = false;
                                disable_delete = true;
                            }
                            else
                            {
                                disable_edit    = false;
                                disable_delete  = false;
                            }

                            return_html = '<center><div class="btn-group">' +
                                '<button type="button" ng-show="ShowEdit" ng-disabled="' + disable_edit +'" id="grid_btn'+row["row"]+'" ngx-action="E" class="btn btn-success btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit DTR Entry">  <i class="fa fa-edit"></i></button >' +
                                '<button type="button" ng-show="ShowEdit" ng-disabled="' + disable_delete +'" class="btn btn-danger  btn-sm" ng-click="btn_delete_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Clear DTR Entry">  <i class="fa fa-trash"></i></button >' +
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
        try
        {
            h.post("../cDTRNational/FilterPageGrid", {
                p_dept_code     : $("#ddl_dept option:selected").val()
                , p_empl_id     : $("#ddl_name option:selected").val()
                , p_year        : str_to_year($("#txtb_dtr_mon_year").val())
                , p_month       : month_name_to_int($("#txtb_dtr_mon_year").val())
                , p_view_type   : $("#ddl_viewtype option:selected").val()
            }).then(function (d) {
                if (d.data.message == "success")
                {
                    s.allowgenerate = true;
                    //s.empl_names = d.data.empl_name;
                    s.txtb_empl_id = $("#ddl_name option:selected").val();
                    
                    s.oTable.fnClearTable(d.data.filteredGrid);
                    s.datalistgrid = d.data.filteredGrid;
                    s.allowSubmit   = false;
                    s.allowPrint    = true;

                    if (d.data.filteredGrid.length > 0)
                    {
                        if (d.data.filteredGrid[0].day_status == "X")
                        {
                            s.txtb_status   = "Not Allow Advance";
                            s.allowSubmit   = false;
                            s.allowPrint    = false;
                            s.allowgenerate = false;
                        }
                        else if ($("#ddl_viewtype option:selected").val() == "0" && (d.data.filteredGrid[0].frst_qcna_transmittal == "Y" && d.data.filteredGrid[0].sec_qcna_transmittal == "Y"))
                        {
                            s.txtb_status = "All Transmitted";
                            s.allowSubmit = false;
                        }
                        else if ($("#ddl_viewtype option:selected").val() == "0" && (d.data.filteredGrid[0].status_1st == "N" && d.data.filteredGrid[0].status_2nd == "N")
                            && (d.data.filteredGrid[0].day_status == "N"))
                        {
                            s.txtb_status = "New";
                            s.allowSubmit = true;
                        }
                        else if ($("#ddl_viewtype option:selected").val() == "0" && (d.data.filteredGrid[0].status_1st == "S" && d.data.filteredGrid[0].status_2nd == "S")
                            && (d.data.filteredGrid[0].day_status == "N")) {
                            s.txtb_status = "All Submitted";
                            s.allowSubmit = false;
                        }
                        else if ($("#ddl_viewtype option:selected").val() == "0" && (d.data.filteredGrid[0].status_1st == "F" && d.data.filteredGrid[0].status_2nd == "F"))
                        {
                            s.txtb_status = "All Approved";
                            s.allowSubmit = false;
                        }
                        else if ($("#ddl_viewtype option:selected").val() == "0")
                        {
                            if ((d.data.filteredGrid[0].status_1st == "F" && d.data.filteredGrid[0].status_2nd == "N"))
                            {
                                s.txtb_status = "1st Quincena "+d.data.filteredGrid[0].status_1st_descr;
                                s.allowSubmit = true;
                            }
                            else if ((d.data.filteredGrid[0].status_1st == "N" && d.data.filteredGrid[0].status_2nd == "F"))
                            {
                                s.txtb_status = "2nd Quincena " +d.data.filteredGrid[0].status_2nd_descr;
                                s.allowSubmit = true;
                            }
                            else if (d.data.filteredGrid[0].day_status == "A" && d.data.filteredGrid[15].day_status == "A")
                            {
                                s.txtb_status = "Transmitted";
                                s.allowSubmit = false;
                            }
                            else if ((d.data.filteredGrid[0].status_1st == "F")) {
                                s.txtb_status = "1st Quincena Approve";
                                s.allowSubmit = false;
                            }
                            else if ((d.data.filteredGrid[14].status_2nd == "F")) {
                                s.txtb_status = "2nd Quincena Approve";
                                s.allowSubmit = false;
                            }
                            else if ((d.data.filteredGrid[0].status_1st == "S")) {
                                s.txtb_status = "1st Quincena Submitted";
                                s.allowSubmit = true;
                            }
                            else if ((d.data.filteredGrid[14].status_2nd == "S")) {
                                s.txtb_status = "2nd Quincena Submitted";
                                s.allowSubmit = true;
                            }
                            else if ((d.data.filteredGrid[0].day_status == "A"))
                            {
                                s.txtb_status = "1st Quincena Approve";
                                s.allowSubmit = false;
                            }
                            else if ((d.data.filteredGrid[14].day_status == "A"))
                            {
                                s.txtb_status = "2nd Quincena Approve";
                                s.allowSubmit = false;
                            }
                        }
                        else if ($("#ddl_viewtype option:selected").val() == "1")
                        {
                            s.txtb_status = d.data.filteredGrid[0].status_1st_descr;
                            if (d.data.filteredGrid[0].status_1st == "N" && d.data.filteredGrid[0].day_status == "N")
                            {
                                s.allowSubmit = true;
                            }
                            else if (d.data.filteredGrid[0].status_1st == "F")
                            {
                                s.allowSubmit = false;
                            }
                            else if (d.data.filteredGrid[0].status_1st == "S") {
                                s.allowSubmit = false;
                            }
                            else
                            {
                                s.txtb_status = "Transmitted";
                                s.allowSubmit = false;
                            }
                        }
                        else if ($("#ddl_viewtype option:selected").val() == "2")
                        {
                            s.txtb_status = d.data.filteredGrid[0].status_2nd_descr;
                            if (d.data.filteredGrid[0].status_2nd == "N" && d.data.filteredGrid[0].day_status == "N")
                            {
                                s.allowSubmit = true;
                            }
                            else if (d.data.filteredGrid[0].status_2nd == "F")
                            {
                                s.allowSubmit = false;
                            }
                            else if (d.data.filteredGrid[0].status_2nd == "S")
                            {
                                s.allowSubmit = false;
                            }
                            else
                            {
                                s.txtb_status = "Transmitted";
                                s.allowSubmit = false;
                            }
                        }
                        else
                        {
                            if (d.data.filteredGrid[0].status_1st != "N") {
                                s.txtb_status = "1st Quincena " + d.data.filteredGrid[0].status_1st_descr;
                            }
                            else {
                                s.txtb_status = "1st Quincena " + d.data.filteredGrid[0].status_1st_descr;
                            }
                        }

                        s.show_dtr_status
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
            h.post("../cDTRNational/DepartmentFilter",
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

    s.btn_add = function ()
    {
        ValidationResultColor("ALL", false);
        clearentry();
        var empl_idx        = $('#ddl_name option:selected').attr("ngx-data");
        s.txtb_empl_name    = s.empl_names[empl_idx].employee_name;
        s.txtb_department2  = $("#ddl_dept option:selected").html();
        s.isEditable        = true;

        $('#main_modal').modal({ backdrop: 'static', keyboard: false });
    }

    s.btn_edit_action = function (row)
    {

        s.current_rowId = row;
        ValidationResultColor("ALL", false);
        //clearentry();
        
        var grid_btn = $("#grid_btn" + row);
        if ($(grid_btn).attr("ngx-action") == "E")
        {
            closeAllOpen();
            clearentry2();
            var time_in_am  = s.datalistgrid[row].time_in_am;
            var time_out_am = s.datalistgrid[row].time_out_am;
            var time_in_pm  = s.datalistgrid[row].time_in_pm;
            var time_out_pm = s.datalistgrid[row].time_out_pm;

            $("#txtb_am_in" + s.current_rowId).val(moment(time_in_am, "HH:mm").format("hh:mm A").replace("Invalid date", ""));
            $("#txtb_am_out" + s.current_rowId).val(moment(time_out_am, "HH:mm").format("hh:mm A").replace("Invalid date", ""));
            $("#txtb_pm_in" + s.current_rowId).val(moment(time_in_pm, "HH:mm").format("hh:mm A").replace("Invalid date", ""));
            $("#txtb_pm_out" + s.current_rowId).val(moment(time_out_pm, "HH:mm").format("hh:mm A").replace("Invalid date", ""));
           
            $('#clock_am_in'+row).clockpicker({
                placement: "top",
                donetext: 'Done',
                twelvehour: true,
                autoclose: true,
                leadingZeroHours: true,
                upperCaseAmPm: true,
                leadingSpaceAmPm: true,
                beforeShow: function e()
                {
                    if ($("#txtb_am_in" + s.current_rowId).prop("disabled"))
                    {
                        e.stopPropagation();
                    }
                },
                afterHourSelect: function ()
                {
                },
                afterMinuteSelect: function ()
                {  
                },
                afterAmPmSelect: function ()
                {   
                }
            })

            $('#clock_am_out' + row).clockpicker({
                placement: "top",
                donetext: 'Done',
                twelvehour: true,
                autoclose: true,
                leadingZeroHours: true,
                upperCaseAmPm: true,
                leadingSpaceAmPm: true,
                beforeShow: function e() {
                    if ($("#txtb_am_out" + s.current_rowId).prop("disabled")) {
                        e.stopPropagation();
                    }
                },
                afterHourSelect: function () {
                   
                },
                afterMinuteSelect: function () {
                  
                },
                afterAmPmSelect: function () {
                  
                }
            })

            $('#clock_pm_in' + row).clockpicker({
                placement: "top",
                donetext: 'Done',
                twelvehour: true,
                autoclose: true,
                leadingZeroHours: true,
                upperCaseAmPm: true,
                leadingSpaceAmPm: true,
                beforeShow: function e() {
                    if ($("#txtb_pm_in" + s.current_rowId).prop("disabled")) {
                        e.stopPropagation();
                    }
                },
                afterHourSelect: function () {
                    
                },
                afterMinuteSelect: function () {
                    
                },
                afterAmPmSelect: function () {
                    
                }
            })

            $('#clock_pm_out' + row).clockpicker({
                placement: "top",
                donetext: 'Done',
                twelvehour: true,
                autoclose: true,
                leadingZeroHours: true,
                upperCaseAmPm: true,
                leadingSpaceAmPm: true,
                beforeShow: function e() {
                    if ($("#txtb_pm_out" + s.current_rowId).prop("disabled")) {
                        e.stopPropagation();
                    }
                },
                afterHourSelect: function () {
                },
                afterMinuteSelect: function () {
                },
                afterAmPmSelect: function () {
                }
            })

            s["showGridInput" + row] = true;
            $(grid_btn).attr("ngx-action", "S");
            $(grid_btn).attr("title", "Save DTR Entry");
            $(grid_btn).html('<i class="fa fa-save"></i>');
            
            s.txtb_empl_name        = s.datalistgrid[row].employee_name;
            s.txtb_department2      = s.datalistgrid[row].department_name1;
            s.txtb_dtr_date         = moment(s.datalistgrid[row].dtr_date).format("YYYY-MM-DD");
            
            s.isEditable = true;
            
        }
        else if ($(grid_btn).attr("ngx-action") == "S")
        {
            s.btn_save_click(row);
           
        }
       
        //$('#main_modal').modal({ backdrop: 'static', keyboard: false });
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

    s.btn_save_generate_dtr = function (par_action)
    {
        $('#main_modal').modal({ backdrop: 'static', keyboard: false });
        s.generate_message      = (par_action == "N" ? "SAVING ":"SUBMITTING ")+" AND GENERATING DTR";
        s.datalist_save_temp = [];
        for (var x = 0; x < s.datalistgrid.length; x++)
        {
            var push_data =
            {
                dtr_ctrl_nbr        :s.datalistgrid[x].dtr_ctrl_nbr,
                dtr_date            :s.datalistgrid[x].dtr_date,
                time_in_am          :s.datalistgrid[x].time_in_am,
                time_out_am         :s.datalistgrid[x].time_out_am,
                time_in_pm          :s.datalistgrid[x].time_in_pm,
                time_out_pm         :s.datalistgrid[x].time_out_pm,
                ts_code             :"",
                under_Time          :"",
                under_Time_remarks  :"",
                remarks_details     :"",
                time_ot_hris        :"",
                time_days_equi      :"",
                time_hours_equi     :"",
                time_ot_payable     :"",
                no_of_as            :"",
                no_of_ob            :"",
                no_of_lv: ""
                ,time_in_am_flag    : s.datalistgrid[x].time_in_am_flag == ""  ?  "M" : s.datalistgrid[x].time_in_am_flag
                ,time_out_am_flag   : s.datalistgrid[x].time_out_am_flag == "" ?  "M" : s.datalistgrid[x].time_out_am_flag
                ,time_in_pm_flag    : s.datalistgrid[x].time_in_pm_flag == ""  ?  "M" : s.datalistgrid[x].time_in_pm_flag
                ,time_out_pm_flag   : s.datalistgrid[x].time_out_pm_flag == "" ?  "M" : s.datalistgrid[x].time_out_pm_flag
            }

            if (s.datalistgrid[x].time_in_am    != "" ||
                s.datalistgrid[x].time_out_am   != "" ||
                s.datalistgrid[x].time_in_pm    != "" ||
                s.datalistgrid[x].time_out_pm   != "")
            {
                s.datalist_save_temp.push(push_data);
            }
        }
        var data_hdr =
                {
                    dtr_ctrl_nbr            : ""
                    , dtr_year              : str_to_year($("#txtb_dtr_mon_year").val())
                    , dtr_month             : month_name_to_int($("#txtb_dtr_mon_year").val())
                    , department_code       : s.ddl_dept
                    , approval_status       : ""
                    , approval_id           : ""
                    , approved_date         : ""
                    , remarks               : ""
                    , empl_id               : $("#ddl_name option:selected").val()
                    , created_ddtm          : ""
                    , created_by            : ""
                    , updated_ddtm          : ""
                    , updated_by            : ""
                    , frst_qcna_posted_ddtm : ""
                    , frst_qcna_posted_by   : ""
                    , sec_qcna_posted_ddtm  : ""
                    , sec_qcna_posted_by    : ""
                    , approved_1st_ddtm     : ""
                    , approved_1st_by       : ""
                    , approved_2nd_ddtm     : ""
                    , approved_2nd_by       : ""
                    , status_1st: (($("#ddl_viewtype option:selected").val() == "0" || $("#ddl_viewtype option:selected").val() == "1") ? par_action: "")
                    , status_2nd: (($("#ddl_viewtype option:selected").val() == "0" || $("#ddl_viewtype option:selected").val() == "2") ? par_action : "")
        }
        
        h.post("../cDTRNational/SaveSubmitAll",
            {
                data_header: data_hdr,
                data: s.datalist_save_temp,
                par_action: "ADD",
                view_type: $("#ddl_viewtype option:selected").val()
            }).then(function (d1)
            {
            if (d1.data.message == "success")
            {
                h.post("../rSSDTRUpload/GenerateDTREmployee",
                    {
                    par_year: str_to_year($("#txtb_dtr_mon_year").val())
                    , par_month: month_name_to_int($("#txtb_dtr_mon_year").val())
                    , par_empl_id: $("#ddl_name option:selected").val()
                    , par_view_type: $("#ddl_viewtype option:selected").val()
                    , par_department_code: $("#ddl_dept option:selected").val()
                    , par_employment_type: s.datalistgrid[0].employment_type
                }).then(function (d) {
                    if (d.data.message == "success")
                    {
                        $('#main_modal').modal("hide");
                        if (d.data.generate_dtr.length > 0) {
                            swal("DTR Successfully Generated and " + (par_action == "N" ? "Saved" : "Submitted")+"!", { icon: "success", });
                            s.FilterPageGrid();
                        }
                        else {
                            swal("No data found!", { icon: "warning", });
                        }
                    }
                    else {
                        $('#main_modal').modal("hide");
                        btn_generate_empl.innerHTML = '<i class="fa fa-cogs"> </i> Generate DTR';
                        swal(d.data.message, { icon: "warning", });
                    }
                });
            }
            else
            {
                $('#main_modal').modal("hide");
                swal(d1.data.message, { icon: "warning", });
            }
        });
    }

    s.btn_save_click = function (rowID)
    {
        try
        {
            if (ValidateFields2())
            {
                var data_hdr =
                {
                    dtr_ctrl_nbr            : ""
                    , dtr_year              : str_to_year($("#txtb_dtr_mon_year").val())
                    , dtr_month             : month_name_to_int($("#txtb_dtr_mon_year").val())
                    , department_code       : s.ddl_dept
                    , approval_status       : ""
                    , approval_id           : ""
                    , approved_date         : ""
                    , remarks               : ""
                    , empl_id               : $("#ddl_name option:selected").val()
                    , created_ddtm          : ""
                    , created_by            : ""
                    , updated_ddtm          : ""
                    , updated_by            : ""
                    , frst_qcna_posted_ddtm : ""
                    , frst_qcna_posted_by   : ""
                    , sec_qcna_posted_ddtm  : ""
                    , sec_qcna_posted_by    : ""
                    , approved_1st_ddtm     : ""
                    , approved_1st_by       : ""
                    , approved_2nd_ddtm     : ""
                    , approved_2nd_by       : ""
                    , status_1st: (($("#ddl_viewtype option:selected").val() == "0" || $("#ddl_viewtype option:selected").val() == "1") ? "N" : "")
                    , status_2nd: (($("#ddl_viewtype option:selected").val() == "0" || $("#ddl_viewtype option:selected").val() == "2") ? "N" : "")
                }

                var data =
                {
                    dtr_ctrl_nbr        : s.datalistgrid[s.current_rowId].dtr_ctrl_nbr
                    , dtr_date          : moment(s.datalistgrid[s.current_rowId].dtr_date).format("YYYY-MM-DD")
                    , time_in_am        : moment($('#txtb_am_in'+s.current_rowId).val().trim(),"hh:mm A").format("HH:mm").replace("Invalid date","")
                    , time_out_am       : moment($('#txtb_am_out'+s.current_rowId).val().trim(),"hh:mm A").format("HH:mm").replace("Invalid date","")
                    , time_in_pm        : moment($('#txtb_pm_in'+s.current_rowId).val().trim(),"hh:mm A").format("HH:mm").replace("Invalid date","")
                    , time_out_pm       : moment($('#txtb_pm_out'+s.current_rowId).val().trim(),"hh:mm A").format("HH:mm").replace("Invalid date","")
                    , ts_code           : ""
                    , under_Time        : ""
                    , under_Time_remarks: ""
                    , remarks_details   : ""
                    , time_ot_hris      : ""
                    , time_days_equi    : ""
                    , time_hours_equi   : ""
                    , time_ot_payable   : ""
                    , no_of_as          : ""
                    , no_of_ob          : ""
                    , no_of_lv          : ""
                    , time_in_am_flag   : s.datalistgrid[s.current_rowId].time_in_am_flag == "" ?  "M" : s.datalistgrid[s.current_rowId].time_in_am_flag
                    ,time_out_am_flag   : s.datalistgrid[s.current_rowId].time_out_am_flag == "" ? "M" : s.datalistgrid[s.current_rowId].time_out_am_flag
                    ,time_in_pm_flag    : s.datalistgrid[s.current_rowId].time_in_pm_flag == "" ?  "M" : s.datalistgrid[s.current_rowId].time_in_pm_flag
                    ,time_out_pm_flag   : s.datalistgrid[s.current_rowId].time_out_pm_flag == "" ? "M" : s.datalistgrid[s.current_rowId].time_out_pm_flag
                }
                if (data.time_in_am     != ""
                    || data.time_out_am != ""
                    || data.time_in_pm  != ""
                    || data.time_out_pm != ""
                )
                {
                    h.post("../cDTRNational/Save",
                        {
                            data_header : data_hdr,
                            data        : data,
                            par_action  : "ADD"
                        }).then(function (d)
                        {
                            $('#main_modal').modal('hide');
                            if (d.data.message == "success")
                            {
                                s.FilterPageGrid();
                                swal("Record has been Successfully Updated!", { icon: "success", title: "Successfully Updated" });
                            }
                            else {
                                swal(d.data.message, { icon: "warning", });
                            }
                        });
                }
                else
                {
                    $('#main_modal').modal('hide');
                    var grid_btn = $("#grid_btn" + s.current_rowId);
                    $(grid_btn).attr("ngx-action", "E");
                    $(grid_btn).attr("title", "Edit DTR Entry");
                    $(grid_btn).html('<i class="fa fa-edit"></i>');
                    s["showGridInput" + s.current_rowId] = false;
                }
                
            }
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    s.btn_submit_click = function ()
    {
        h.post("../cDTRNational/SubmitHeader",
                {
                     par_empl_id    : $("#ddl_name option:selected").val()
                    , par_year      : str_to_year($("#txtb_dtr_mon_year").val())
                    , par_month     : month_name_to_int($("#txtb_dtr_mon_year").val())
                    , par_view_type : $("#ddl_viewtype option:selected").val()
            }).then(function (d) {
                if (d.data.message == "success")
                {
                    s.FilterPageGrid();
                    swal("DTR Successfully Submitted!", { icon: "success", title: "Successfully Submitted!" });
                }
                else {
                    swal(d.data.message, { icon: "warning", });
                }
            });
    }

    s.btn_delete_action = function (rowId)
    {
        var data =
        {
            dtr_ctrl_nbr        : s.datalistgrid[rowId].dtr_ctrl_nbr
            , dtr_date          :  moment(s.datalistgrid[rowId].dtr_date).format("YYYY-MM-DD")
            , time_in_am        : ""
            , time_out_am       : ""
            , time_in_pm        : ""
            , time_out_pm       : ""
            , ts_code           : ""
            , under_Time        : ""
            , under_Time_remarks: ""
            , remarks_details   : ""
            , time_ot_hris      : ""
            , time_days_equi    : ""
            , time_hours_equi   : ""
            , time_ot_payable   : ""
            , no_of_as          : ""
            , no_of_ob          : ""
            , no_of_lv          : ""
        }

        swal({
            title: "ARE YOU SURE TO CLEAR YOUR ENTRY FOR THIS DATE?",
            text: "This entry will no longer reflect in your DTR once cleared!",
            icon: "warning",
            buttons: ["NO", "YES"],
            dangerMode: true,

        })
            .then(function (willDelete)
            {
                if (willDelete)
                {
                    //ENDED BY JORGE
                    h.post("../cDTRNational/DeleteExisting", { data: data, par_action: "ADD" }).then(function (d)
                    {
                        if (d.data.message == "success")
                        {
                            s.datalistgrid[rowId].time_in_am          = "";
                            s.datalistgrid[rowId].time_in_pm          = "";
                            s.datalistgrid[rowId].time_out_am         = "";
                            s.datalistgrid[rowId].time_out_pm         = "";
                            s.datalistgrid[rowId].under_Time_remarks  = "";
                            s.datalistgrid[rowId].remarks_details = "";

                            s.oTable.fnClearTable();
                            s.oTable.fnAddData(s.datalistgrid);
                            swal("Entry Successfully cleared!", { icon: "success", title: "Successfully cleared!" });
                        }
                        else {
                            swal(d.data.message, { icon: "warning", });
                        }
                    });
                }
            });
    }

    s.btn_print = function () {
        try
        {
            $('#print_preview_modal').modal({ backdrop: 'static', keyboard: false });
            s.Modal_title = "PREPARING REPORT PLEASE WAIT..";
            s.loading_r = true;
            h.post("../cDTRNational/PreviousValuesOnPage_rSSDTROverrides").then(function (d)
            {
                h.post("../rSSDTRPrinting/RetriveData",
                    {
                        par_year                : str_to_year($("#txtb_dtr_mon_year").val())
                        , par_month             : month_name_to_int($("#txtb_dtr_mon_year").val())
                        , par_empl_id           : $("#ddl_name option:selected").val()
                        , par_view_type         : $("#ddl_viewtype option:selected").val()
                        , par_department_code   : s.ddl_dept

                    }).then(function (d) {

                        if (d.data.sp_report.length == 0)
                        {
                            swal("NO DATA FOUND", "No data found in this Year and Month Selected", { icon: "warning" });
                        }
                        else {
                            s.loading_r = false;
                            s.Modal_title = "DTR PRINT VIEW.";
                            var controller  = "Reports"
                            var action      = "Index"
                            var ReportName  = ""
                            var SaveName    = "Crystal_Report"
                            var ReportType  = "inline"
                            var ReportPath  = ""
                            var sp          = ""
                            if ($("#ddl_viewtype option:selected").val() == "0" && (s.datalistgrid[0].status_1st == "F" && s.datalistgrid[15].status_2nd == "F"))
                            {
                                ReportPath = "~/Reports/cryDTR/cryDTR.rpt";
                                ReportName = "cryDTR";
                            }
                            else if ($("#ddl_viewtype option:selected").val() == "1" && s.datalistgrid[0].status_1st == "F")
                            {
                                ReportPath = "~/Reports/cryDTR/cryDTR.rpt";
                                ReportName = "cryDTR"
                            }
                            else if ($("#ddl_viewtype option:selected").val() == "2" && s.datalistgrid[0].status_2nd == "F") {
                                ReportPath = "~/Reports/cryDTR/cryDTR.rpt";
                                ReportName = "cryDTR";
                            }
                            else {
                                ReportPath = "~/Reports/cryDTRUnOfficial/cryDTRUnOfficial.rpt"
                                ReportName = "cryDTRUnOfficial"
                            }
                            //ReportPath = "~/Reports/cryDTR/cryDTR.rpt"
                            sp = "sp_dtr_rep,par_year," + str_to_year($("#txtb_dtr_mon_year").val()) + ",par_month," + month_name_to_int($("#txtb_dtr_mon_year").val()) + ",par_empl_id," + $("#ddl_name option:selected").val() + ",par_view_type," + $("#ddl_viewtype option:selected").val() + ",par_department_code," + s.ddl_dept + ",par_user_id," + d.data.session_user_id


                            //location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                            //    + "&SaveName=" + SaveName
                            //    + "&ReportType=" + ReportType
                            //    + "&ReportPath=" + ReportPath
                            //    + "&Sp=" + sp

                            var body            = document.getElementById('iframe_content');
                            body.style.overflow = "hidden"
                            var params          = ""

                            $("#ReportFrame").attr("src", "../Reports/CrystalViewer.aspx?Params=" + params
                                + "&ReportName=" + ReportName
                                + "&SaveName=" + SaveName
                                + "&ReportType=" + ReportType
                                + "&ReportPath=" + ReportPath
                                + "&id=" + sp
                            );

                        }
                    });
                });
            
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
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