ng_selfService_App.controller("rSSDTRUpload_ctrlr", function ($scope, $compile, $http, $filter, Upload, $timeout) {
    var s = $scope
    var h = $http

    s.rowLen                = "10";
    s.day                   = [];
    s.arr_entry             = [];
    s.selected_dtr_enty_row = [];
    s.ddl_entry_type3       = "1";
    s.empl_id               = "";
    var btn                 = null;
    s.prevValues = null;

    s.biometrics_location = []

    function init()
    {
        $("#ddl_upload_type").val("1")
        s.ddl_upload_type = "1"


        //format datepicker to month - year only
        $("#txtb_dtr_mon_year").datepicker({
            format: "MM - yyyy",
            startView: "years",
            minViewMode: "months",
            autoclose: true,
        });

        $("#txtb_dtr_mon_year2").datepicker({
            format: "MM - yyyy",
            startView: "years",
            minViewMode: "months",
            autoclose: true,
        });

        $("#txtb_dtr_date").datepicker({
            format: "yyyy-mm-dd",
            autoclose: true,
        });

        $("#cancel_file").addClass("dont_show_cancel_file");
        $("#input_file_upload").val("");

        $("#txtb_dtr_mon_year").on('change', function (e) {
            s.FilterPageGrid();
        });

        $("#txtb_dtr_mon_year2").on('change', function (e) {
            s.FilterPageGrid2();
        });

        $("#ddl_name").select2().on('change', function (e) {
            s.FilterPageGrid2();
        });
        
        var ddate = new Date();
        s.txtb_dtr_mon_year     = moment(ddate).format("MMMM - YYYY"); 
        s.txtb_dtr_mon_year2    = moment(ddate).format("MMMM - YYYY"); 
        $("#modal_generating_remittance").modal();
        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../rSSDTRUpload/InitializeData").then(function (d) {
            if (d.data.message == "success")
            {
                console.log(d.data.prevValues);
                s.prevValues = d.data.prevValues;

                if (s.prevValues != "") {
                    $("li#" + s.prevValues[0] + " > a").click();
                    var date                = s.prevValues[2] + '-' + s.prevValues[1] + '-' + s.prevValues[3];
                    s.txtb_dtr_mon_year2    = moment(date).format("MMMM - YYYY");
                    s.ddl_day               = s.prevValues[3];
                }

                s.day = d.data.day_lst;

                init_table_data([]);
                init_table_data2([]);

                s.empl_names = d.data.empl_name;
                //**********************************************
                //  Show/Hide ADD, EDIT, DELETE button 
                //**********************************************
                d.data.um.allow_add == "1" ? s.ShowAdd = true : s.ShowAdd = false;
                d.data.um.allow_delete == "1" ? s.ShowDelete = true : s.ShowDelete = false;
                d.data.um.allow_edit == "1" ? s.ShowEdit = true : s.ShowEdit = false;
                //d.data.um.allow_view    == "1" ? s.ShowView     = true : s.ShowView     = false;
                //d.data.um.allow_print == "1" ? s.ShowAdd = true : s.ShowAdd = false;
                
                $("#modal_generating_remittance").modal("hide");
                s.FilterPageGrid2();
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
                bAutoWidth: false,
                sDom: 'rt<"bottom"ip>',
                pageLength: 9,
                columns: [
                    {
                        "mData": "empl_id",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "employee_name",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "time_in_am",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "time_out_am",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "time_in_pm",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "time_out_pm",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "dtr_status_descr",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data + "</span>"
                        }
                    }
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            });
    }

    var init_table_data2 = function (par_data) {
        s.datalistgrid2 = par_data;
        s.oTable2 = $('#datalist_grid2').dataTable(
            {
                data: s.datalistgrid2,
                bSort: false,
                bAutoWidth: false,
                sDom: 'rt<"bottom">',
                paging: false,
                columns: [
                    {
                        "mData": "dtr_date",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "time_in_am",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "time_out_am",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "time_in_pm",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "time_out_pm",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "dtr_status_descr",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": null,
                        "mRender": function (data, type, full, row) {
                            if (full["dtr_status_descr"] == "") {
                                return '<center><div class="btn-group">' +
                                    '<button type="button"                      class="btn btn-warning btn-sm" ng-click="btn_exchange(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Transfer Time Entry" disabled>  <i class="fa fa-refresh"></i></button >' +
                                    '<button type="button" ng-show="ShowDelete" class="btn btn-danger btn-sm" ng-click="btn_delete(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete" disabled><i class="fa fa-trash"></i></button>' +
                                    '</div></center>';
                            }
                            else {
                                return '<center><div class="btn-group">' +
                                    '<button type="button"                      class="btn btn-warning btn-sm" ng-click="btn_exchange(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Transfer Time Entry">  <i class="fa fa-refresh"></i></button >' +
                                    '<button type="button" ng-show="ShowDelete" class="btn btn-danger btn-sm" ng-click="btn_delete(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                    '</div></center>';
                            }

                            //return '<center><div class="btn-group">' +
                            //    '<button type="button"                      ng-disabled="dis_action" class="btn btn-warning btn-sm" ng-click="btn_exchange(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Transfer Time Entry">  <i class="fa fa-refresh"></i></button >' +
                            //    '<button type="button" ng-show="ShowDelete" ng-disabled="dis_action" class="btn btn-danger btn-sm" ng-click="btn_del_row1(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                            //    '</div></center>';
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

    ////************************************//
    //// Select Year +-3
    ////************************************// 
    //function RetrieveDay() {
        
    //    for (var i = 1; i <= 31; i++) {
    //        s.day.push({ "day": (i < 10 ? "0" + i : i) })
    //    }
    //}

    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.FilterPageGrid = function () {
        try
        {

            //var date = month_name_to_int($("#txtb_dtr_mon_year").val())
            //    + "-"
            //    + $("#ddl_day").val()
            //    + "-"
            //    + str_to_year($("#txtb_dtr_mon_year").val());

            var date = str_to_year($("#txtb_dtr_mon_year").val())
                + "-"
                + month_name_to_int($("#txtb_dtr_mon_year").val())
                + "-"
                + ($("#ddl_day").val() == null || $("#ddl_day").val() == "" ? "01" : $("#ddl_day").val());
            

            h.post("../rSSDTRUpload/FilterPageGrid", {
                p_dtr_date  : date 
                , p_year    : str_to_year($("#txtb_dtr_mon_year").val())
                , p_month   : month_name_to_int($("#txtb_dtr_mon_year").val())
            }).then(function (d) {
                if (d.data.message == "success") {
                    //console.log(d.data.filteredGrid);

                    s.oTable.fnClearTable(d.data.filteredGrid);
                    s.datalistgrid = d.data.filteredGrid;
                    if (d.data.filteredGrid.length > 0) {
                        s.oTable.fnAddData(d.data.filteredGrid);
                    }

                    //console.log(d.data.day_lst);
                    s.day = d.data.day_lst;
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
    s.FilterPageGrid2 = function () {
        try
        {
            if ($('#ddl_name option:selected').val() != "")
            {
                $("#select2-ddl_name-container").parent().removeClass("required");
                $("#lbl_ddl_name_req").text("");
            }

            if ($("#txtb_dtr_mon_year2").val() != "")
            {
                $("#txtb_dtr_mon_year2").removeClass("required");
                $("#lbl_txtb_dtr_mon_year2_req").text("");
            }

            if ($('#ddl_name option:selected').val() != "" &&
                $("#txtb_dtr_mon_year2").val() != "") {
                h.post("../rSSDTRUpload/FilterPageGrid2", {
                    p_empl_id: $('#ddl_name option:selected').val()
                    , p_year: str_to_year($("#txtb_dtr_mon_year2").val())
                    , p_month: month_name_to_int($("#txtb_dtr_mon_year2").val())
                }).then(function (d) {
                    if (d.data.message == "success") {
                        s.oTable2.fnClearTable(d.data.filteredGrid2);
                        s.datalistgrid2 = d.data.filteredGrid2;
                        if (d.data.filteredGrid2.length > 0) {
                            s.oTable2.fnAddData(d.data.filteredGrid2);
                        }
                    }
                });
            }
            else {
                s.oTable2.fnDraw();
                s.oTable2.fnClearTable();
            }
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.FileChange = function () {
        try {
            var fileUpload = $("#input_file_upload").get(0);
            var fileToUpload = fileUpload.files[0];
            
            if (fileToUpload.name.toString() == "" ||
                fileToUpload.name.toString() == null) {
                $("#cancel_file").addClass("dont_show_cancel_file");
            }
            else {
                ValidateFields();
                $("#cancel_file").removeClass("dont_show_cancel_file");
            }
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 
    s.ClearFileField = function () {
        try {
            $("#input_file_upload").val("");

            s.FileChange();
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    s.btn_upload = function ()
    {
        if (ValidateFields())
        {
            s.upload_generate_text = "Uploading Bio Data";
            s.upload_generate_text2 = "";
            $('#modal_upload_initializing').modal({ backdrop: 'static', keyboard: false });
            // For Image Upload
            console.log(navigator.sayswho)

            if (navigator.sayswho == "IE") {
                
                s.InternetExplorer();
            }
            else {
                s.FireFoxUploader();
            }
        }
        else {
            btn.innerHTML = '<i class="fa fa-upload"> </i> Upload & Extract';
        }
    }

    //***********************************************************//
    //*** JRV - 03/11/2020 - Upload Image for Internet Explorer
    //***********************************************************// 
    s.InternetExplorer = function () {
        var fileUpload = $('#input_file_upload').get(0);
        var files = fileUpload.files;
        var test = new FormData();
        s.SelectedFiles = files;

        for (var i = 0; i < files.length; i++) {
            test.append('par_file', files[i]);
        }

        //TRY
        $http({
            method: 'POST',
            url: '../rSSDTRUpload/Upload_IE',
            headers: { 'Content-Type': 'multipart/form-data' },
            data: test
        }).then(function (d)
        {
            if (d.data.success) {
                swal("Successfully Uploaded", "Student Image Successfully Uploaded!", { icon: "success" });
            }
            else {
                swal(d.data.error_message, { icon: "warning" })
            }
        });

    }

    //***********************************************************//
    //*** JRV - 03/11/2020 - Upload Image for Firefox
    //***********************************************************// 
    s.FireFoxUploader = function () {
        try {
            
            var fileUpload = $("#input_file_upload").get(0);
            var fileToUpload = fileUpload.files[0];

            Upload.upload({
                url: '../rSSDTRUpload/Upload/',
                data: { file: fileToUpload /*, "effective_date": effective_date, "section_nbr": section_nbr, "rcrd_type": rcrd_type, "gradelvl": gradelvl*/ }
            })
                .then
                (
                function (resp)
                {
                    var filename = resp.data.toString().split(":")[1];
                    var filename2 = filename.substring(0, filename.lastIndexOf('/'));
                    
                    var date = month_name_to_int($("#txtb_dtr_mon_year").val())
                        + "-"
                        + $("#ddl_day").val()
                        + "-"
                        + str_to_year($("#txtb_dtr_mon_year").val());

                    h.post("../rSSDTRUpload/DTRUploadToTable", {
                        p_location              : ""
                        ,p_filename             : fileToUpload.name.toString()
                        ,p_year                 : str_to_year($("#txtb_dtr_mon_year").val())
                        ,p_month                : month_name_to_int($("#txtb_dtr_mon_year").val())
                        ,p_upload_type          : $("#ddl_upload_type").val()
                    }).then(function (d) {
                        if (d.data.message == "success")
                        {
                            console.log("try heare");
                            swal(d.data.process_biodata_2dtr_stg[0].result_value_descr, "", { icon: "success" });
                            if (d.data.process_biodata_2dtr_stg[0].result_value == "Y") {
                                swal(d.data.process_biodata_2dtr_stg[0].result_value_descr, "", { icon: "success" });
                            }
                            else {
                                swal(d.data.process_biodata_2dtr_stg[0].result_value_descr , "", { icon: "danger" });
                            }
                            //btn.innerHTML = '<i class="fa fa-upload"> </i> Upload & Extract';
                            $("#modal_upload_initializing").modal("hide");
                            s.FilterPageGrid();
                        }
                    });
                    
                    return true;
                }
                , function (err) {
                    if (err.status > 0) {
                        var errorMsg = resp.status + ': ' + resp.data;
                        return false;
                    }

                }
                );
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    //************************************// 
    //*** Delete Row              
    //**********************************// 
    s.btn_exchange = function (row_id) {
        $('#transfer_modal').modal({ backdrop: 'static', keyboard: false });

        s.ddl_entry_type        = "1";
        s.ddl_entry_type2       = "1";
        s.up_empl_name          = $("#ddl_name option:selected").html();
        s.up_empl_id            = $("#ddl_name option:selected").val();
        s.up_dtr_date           = s.datalistgrid2[row_id].dtr_date;
        
        s.arr_entry = {
            time_in_am      : s.datalistgrid2[row_id].time_in_am  
            , time_out_am   : s.datalistgrid2[row_id].time_out_am 
            , time_in_pm    : s.datalistgrid2[row_id].time_in_pm  
            , time_out_pm   : s.datalistgrid2[row_id].time_out_pm 
        }
        
        s.selected_dtr_enty_row = {
            dtr_date            : s.datalistgrid2[row_id].dtr_date
            , empl_id           : s.datalistgrid2[row_id].empl_id
            , time_in_am        : s.datalistgrid2[row_id].time_in_am
            , time_out_am       : s.datalistgrid2[row_id].time_out_am
            , time_in_pm        : s.datalistgrid2[row_id].time_in_pm
            , time_out_pm       : s.datalistgrid2[row_id].time_out_pm
            , dtr_status        : s.datalistgrid2[row_id].dtr_status
            , processed_by_user : s.datalistgrid2[row_id].processed_by_user
        };

        s.SelectEntryType();
        s.SelectEntryType2();
    }

    //************************************// 
    //*** Delete Row              
    //**********************************// 
    s.SelectEntryType = function () {
        if (s.ddl_entry_type == "1") {
            s.time_entry = s.arr_entry.time_in_am;
        }
        else if (s.ddl_entry_type == "2") {
            s.time_entry = s.arr_entry.time_out_am;
        }
        else if (s.ddl_entry_type == "3") {
            s.time_entry = s.arr_entry.time_in_pm;
        }
        else if (s.ddl_entry_type == "4") {
            s.time_entry = s.arr_entry.time_out_pm;
        }
    }

    //************************************// 
    //*** Delete Row              
    //**********************************// 
    s.SelectEntryType2 = function () {
        if (s.ddl_entry_type2 == "1") {
            s.time_entry2 = s.arr_entry.time_in_am;
        }
        else if (s.ddl_entry_type2 == "2") {
            s.time_entry2 = s.arr_entry.time_out_am;
        }
        else if (s.ddl_entry_type2 == "3") {
            s.time_entry2 = s.arr_entry.time_in_pm;
        }
        else if (s.ddl_entry_type2 == "4") {
            s.time_entry2 = s.arr_entry.time_out_pm;
        }
    }

    //************************************// 
    //*** Delete Row              
    //**********************************// 
    s.SelectEntryType3 = function () {
        if (s.ddl_entry_type3 == "1") {
            s.time_entry3 = s.arr_entry.time_in_am;
        }
        else if (s.ddl_entry_type3 == "2") {
            s.time_entry3 = s.arr_entry.time_out_am;
        }
        else if (s.ddl_entry_type3 == "3") {
            s.time_entry3 = s.arr_entry.time_in_pm;
        }
        else if (s.ddl_entry_type3 == "4") {
            s.time_entry3 = s.arr_entry.time_out_pm;
        }
    }

    s.btn_exchange_confirm = function ()
    {
        var btn_transfer = document.getElementById('dtr_exchange');
        btn_transfer.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Confirm Transfer';

        var field = "";
        var field2 = "";

        var value = "";
        var value2 = "";

        if (s.ddl_entry_type == "1") {
            field   = "time_in_am";
            value   = $("#time_entry").val();
        }
        else if (s.ddl_entry_type == "2") {
            field   = "time_out_am";
            value   = $("#time_entry").val();
        }
        else if (s.ddl_entry_type == "3") {
            field   = "time_in_pm";
            value   = $("#time_entry").val();
        }
        else if (s.ddl_entry_type == "4") {
            field   = "time_out_pm";
            value   = $("#time_entry").val();
        }

       if(s.ddl_entry_type2 == "1") {
           field2   = "time_in_am";
           value2   = $("#time_entry2").val();
        }
        else if (s.ddl_entry_type2 == "2") {
           field2   = "time_out_am";
           value2   = $("#time_entry2").val();
        }
        else if (s.ddl_entry_type2 == "3") {
           field2   = "time_in_pm";
           value2   = $("#time_entry2").val();
        }
        else if (s.ddl_entry_type2 == "4") {
           field2   = "time_out_pm";
           value2   = $("#time_entry2").val();
        }

        var data = s.selected_dtr_enty_row;
        
        h.post("../rSSDTRUpload/TransferDTRTimeEntry", {
            data                    : data
            , p_field_to_up         : field
            , p_field_value         : value
            , p_field_to_up2        : field2
            , p_field_value2        : value2
        }).then(function (d) {
            if (d.data.message == "success") {
                //swal("Successfully Transfer", "Time Entry Successfully Transfered!", { icon: "success" })
                btn_transfer.innerHTML = '<i class="fa fa-refresh"> </i> Confirm Transfer';
                $("#transfer_modal").modal("hide");
                swal("Successfully Transfer", d.data.transfer_script[0].result_msg, { icon: "success" });
                s.FilterPageGrid2();
            }
            else {
                btn_transfer.innerHTML = '<i class="fa fa-refresh"> </i> Confirm Transfer';
                swal(d.data.message, { icon: "warning", });
            }
        });
    }

    s.btn_delete = function (row_id)
    {
        s.ModalTitle = "Transfer Time Entry - 2020-11-01";
        $('#delete_modal').modal({ backdrop: 'static', keyboard: false });

        
        s.ddl_entry_type3       = "1";
        s.del_empl_name         = $("#ddl_name option:selected").html();
        s.del_empl_id           = $("#ddl_name option:selected").val();
        s.del_dtr_date          = s.datalistgrid2[row_id].dtr_date;
        
        s.arr_entry = {
            time_in_am      : s.datalistgrid2[row_id].time_in_am  
            , time_out_am   : s.datalistgrid2[row_id].time_out_am 
            , time_in_pm    : s.datalistgrid2[row_id].time_in_pm  
            , time_out_pm   : s.datalistgrid2[row_id].time_out_pm 
        }

        s.selected_dtr_enty_row = {
            dtr_date            : s.datalistgrid2[row_id].dtr_date
            , empl_id           : s.datalistgrid2[row_id].empl_id
            , time_in_am        : s.datalistgrid2[row_id].time_in_am
            , time_out_am       : s.datalistgrid2[row_id].time_out_am
            , time_in_pm        : s.datalistgrid2[row_id].time_in_pm
            , time_out_pm       : s.datalistgrid2[row_id].time_out_pm
            , dtr_status        : s.datalistgrid2[row_id].dtr_status
            , processed_by_user : s.datalistgrid2[row_id].processed_by_user
        };
        
        s.SelectEntryType3();
    }

    s.btn_delete_confirm = function () {
        try {
            swal({
                title: "Are you sure to delete time entry " + $("#ddl_entry_type3 option:selected").html() + "  ? ",
                text: "Once deleted, you will not be able to recover this record!",
                icon: "warning",
                buttons: true,
                dangerMode: true,

            })
                .then(function (willDelete) {
                    if (willDelete)
                    {   
                        var btn_delete = document.getElementById('dtr_delete');
                        btn_delete.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Confirm Delete';

                        var field = "";
                        
                        if (s.ddl_entry_type3 == "1") {
                            field = "time_in_am";
                        }
                        else if (s.ddl_entry_type3 == "2") {
                            field = "time_out_am";
                        }
                        else if (s.ddl_entry_type3 == "3") {
                            field = "time_in_pm";
                        }
                        else if (s.ddl_entry_type3 == "4") {
                            field = "time_out_pm";
                        }

                        var data = s.selected_dtr_enty_row;

                        h.post("../rSSDTRUpload/DeleteDTRTimeEntry", {
                            data                : data
                            , p_field_to_up     : field
                        }).then(function (d) {
                            if (d.data.message == "success") {
                                btn_delete.innerHTML = '<i class="fa fa-trash"> </i> Confirm Transfer';
                                $("#delete_modal").modal("hide");
                                swal("Your record has been deleted!", { icon: "success", });
                                s.FilterPageGrid2();
                            }
                            else {
                                btn_delete.innerHTML = '<i class="fa fa-trash"> </i> Confirm Transfer';
                                swal(d.data.message, { icon: "warning", });
                            }
                        });
                    }
                });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    s.btn_generate_empl = function () {
        try
        {
            if (ValidateFields2()) {
                var btn_generate_empl = document.getElementById('dtr_generation_empl');
                btn_generate_empl.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Generate DTR';

                s.upload_generate_text = "Generating DTR";
                s.upload_generate_text2 = "This might take a while";
                $('#modal_upload_initializing').modal({ backdrop: 'static', keyboard: false });

                var row = "";
                var generate_flag = "";
                for (var x = 0; x < s.empl_names.length; x++) {
                    if (s.empl_names[x].empl_id == $("#ddl_name option:selected").val().toString())
                    {
                        console.log(s.empl_names[x]);
                        row = x;
                        generate_flag = "true";
                        break;
                    }
                }
                if (generate_flag != "") {
                    h.post("../rSSDTRUpload/GenerateDTREmployee", {
                        par_year                : str_to_year($("#txtb_dtr_mon_year2").val())
                        , par_month             : month_name_to_int($("#txtb_dtr_mon_year2").val())
                        , par_empl_id           : $("#ddl_name option:selected").val()
                        , par_view_type         : "0"//$("#ddl_viewtype").val()
                        , par_department_code   : s.empl_names[row].department_code
                        , par_employment_type   : s.empl_names[row].employment_type
                    }).then(function (d) {
                        if (d.data.message == "success")
                        {
                            btn_generate_empl.innerHTML = '<i class="fa fa-cogs"> </i> Generate DTR';
                            if (d.data.generate_dtr.length > 0) {
                                swal("DTR Successfully Generated!", { icon: "success", });
                            }
                            else {
                                swal("No data found!", { icon: "warning", });
                            }
                        }
                        else {
                            btn_generate_empl.innerHTML = '<i class="fa fa-cogs"> </i> Generate DTR';
                            swal(d.data.message, { icon: "warning", });
                        }
                        $("#modal_upload_initializing").modal("hide");
                    });
                }
            }
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    s.btn_print = function ()
    {
        try
        {
            clearentry();
            $('#dtr_print_empl_modal').modal({ backdrop: 'static', keyboard: false });
            
            s.empl_id           = $("#ddl_name option:selected").val();
            s.txtb_empl_name    = $("#ddl_name option:selected").html();
            s.txtb_mon_year     = $("#txtb_dtr_mon_year2").val();

           
            h.post("../rSSDTRPrinting/InitializeData").then(function (d)
            {
                s.dept_list         = d.data.dept_list;
                s.ddl_dept          = d.data.department_dtr
                s.ddl_viewtype      = d.data.view_type
            });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    s.btn_print2 = function () {
        try
        {
            
            console.log($("#tab_dtr_up li.active").attr("id").toString());
            console.log(month_name_to_int($("#txtb_dtr_mon_year2").val()));
            console.log(str_to_year($("#txtb_dtr_mon_year2").val()));
            console.log($("#ddl_day option:selected").val());
            console.log($("#ddl_name option:selected").val());

            h.post("../rSSDTRUpload/PreviousValuesOnPage_rSSDTRUpload",
                {
                    par_tab             : $("#tab_dtr_up li.active").attr("id").toString()
                    , par_month         : month_name_to_int($("#txtb_dtr_mon_year2").val())
                    , par_year          : str_to_year($("#txtb_dtr_mon_year2").val())
                    , par_day           : $("#ddl_day option:selected").val()
                    , par_empl_id       : $("#ddl_name option:selected").val()
                }).then(function (d)
                {
                    h.post("../rSSDTRPrinting/RetriveData",
                        {
                            par_year: str_to_year($("#txtb_dtr_mon_year2").val())
                            , par_month: month_name_to_int($("#txtb_dtr_mon_year2").val())
                            , par_empl_id: $("#ddl_name option:selected").val()
                            , par_view_type: $("#ddl_viewtype").val()
                            , par_department_code: $("#ddl_dept").val()

                        }).then(function (d) {

                            if (d.data.sp_report.length == 0) {
                                swal("NO DATA FOUND", "No data found in this Year and Month Selected", { icon: "warning" });
                            }
                            else {
                                var controller = "Reports"
                                var action = "Index"
                                var ReportName = "cryDTR"
                                var SaveName = "Crystal_Report"
                                var ReportType = "inline"
                                var ReportPath = ""
                                var sp = ""

                                ReportPath = "~/Reports/cryDTR/cryDTR.rpt"
                                sp = "sp_dtr_rep,par_year," + str_to_year($("#txtb_dtr_mon_year2").val()) + ",par_month," + month_name_to_int($("#txtb_dtr_mon_year2").val()) + ",par_empl_id," + $("#ddl_name option:selected").val() + ",par_view_type," + $("#ddl_viewtype").val() + ",par_department_code," + $("#ddl_dept").val() + ",par_user_id," + d.data.session_user_id


                                location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                                    + "&SaveName=" + SaveName
                                    + "&ReportType=" + ReportType
                                    + "&ReportPath=" + ReportPath
                                    + "&Sp=" + sp

                            }
                        });
                });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields() {
        var return_val = true;
        ValidationResultColor("ALL", false);

        if ($('#input_file_upload').val() == "") {
            ValidationResultColor("input_file_upload", true);
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
            $("#lbl_" + par_object_id + "_req").text("Required Field!");
        }
        else {
            //remove of refresh the object form being required

            $("#input_file_upload").removeClass("required");
            $("#lbl_input_file_upload_req").text("");

            $("#txtb_dtr_mon_year2").removeClass("required");
            $("#lbl_txtb_dtr_mon_year2_req").text("");

        }
    }

    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields2() {
        var return_val = true;
        ValidationResultColor2("ALL", false);

        if ($('#ddl_name').val() == "") {
            ValidationResultColor2("ddl_name", true);
            return_val = false;
        }

        if ($('#txtb_dtr_mon_year2').val() == "") {
            ValidationResultColor("txtb_dtr_mon_year2", true);
            return_val = false;
        }

        return return_val;
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidationResultColor2(par_object_id, par_v_result) {
        if (par_v_result) {
            $("#select2-" + par_object_id + "-container").parent().addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field!");
        }
        else {
            //remove of refresh the object form being required
            $("#select2-ddl_name-container").parent().removeClass("required");
            $("#lbl_ddl_name_req").text("");
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

    function clearentry() {
        s.txtb_empl_name    = "";
        s.txtb_mon_year     = "";
        s.ddl_viewtype      = "";
        s.ddl_dept          = "";
    }
})