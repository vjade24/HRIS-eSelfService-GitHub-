//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for PHIC Payroll Registry
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JOSEPH M. TOMBO JR       03/03/2020      Code Creation
//**********************************************************************************


ng_selfService_App.controller("cATSDTRSupport_ctrl", function ($scope, $compile, $http, $filter) {
    var s = $scope;
    var h = $http;
    s.year = [];
    s.datalistgrid_data = [];
    s.employment_type_lst = "";
    s.rowLen = "";
    s.ddl_year = "";
    s.ddl_month = "";
    s.ddl_group_class = "";
    s.txtb_template_descr = "PHIC Share";//Hard coded for now based on the descussion.
    s.template_code = "996";       //Hard coded for now based on the descussion.
    s.grouplist = [];
    s.ddl_department = "21"
    s.employment_type = "";
    s.rate_basis = "";
    s.payroll_year = ""
    s.payroll_month = ""
    s.extract_selected = {}
    s.selectedEntry = ""
    s.selectedRow = {
        dtr_date: ""
        , dtr_status: ""
        , dtr_status_descr: ""
        , empl_id: ""
        , employee_name: ""
        , processed_by_user: ""
        , processed_dttm: ""
        , time_in_am: ""
        , time_in_ot: ""
        , time_in_pm: ""
        , time_out_am: ""
        , time_out_ot: ""
        , time_out_pm: ""
    }

    function RetrieveYear() {
        var currentYear = new Date().getFullYear();
        var prev_year = currentYear - 5;
        for (var i = 1; i <= 8; i++) {
            var data = { "year": prev_year }
            s.year.push(data)
            prev_year++;
        }
    }
    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {

                data: s.datalistgrid,
                sDom: '',
                pageLength: 100,
                order: [[0, "asc"]],
                columns: [

                    {
                        "mData": "dtr_date",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": "time_in_am",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },

                    {
                        "mData": "time_out_am",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": "time_in_pm",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": "time_out_pm",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    {
                        "mData": "dtr_status_descr",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block' >" + data + "</span>"
                        }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {

                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit Record">  <i class="fa fa-edit"></i></button >' +
                                //'<button type="button" class="btn btn-danger btn-sm"  ng-click="btn_delete_row(' + row["row"] + ')"  data-toggle="tooltip" data-placement="top" title="Delete"> <i class="fa fa-trash"></i></button>' +
                                '</div></center>';

                        }
                    }

                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            }
        );

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');

    }

    //*********************************************//
    //*** Filter Page Grid
    //********************************************// 


    s.FilterPageGrid = function () {
        $('#loading_msg').html("LOADING");
        $("#modal_loading").modal();
        try {
            h.post("../cATSDTRSupport/FilterPageGrid", {
                p_empl_id: $("#ddl_name option:selected").val()
                , p_year: s.ddl_year
                , p_month: s.ddl_month

            }).then(function (d) {
                if (d.data.message == "success") {
                    //moment(d.data.all_appl.application_date).format('MMMM Do YYYY, h:mm:ss a');
                    //s.all_appl = d.data.all_appl;
                    s.trans_lst = d.data.trans_lst
                    s.datalistgrid_data = d.data.data;
                    s.datalistgrid_data.refreshTable1('oTable', '');
                    $("#modal_loading").modal('hide');
                }
                else {
                    swal(d.data.message, "", { icon: "warning" });
                }

            });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }

    function init() {
        $("#ddl_name").select2().on('change', function (e) {
            s.FilterPageGrid();
        });

        var curr_year = new Date().getFullYear().toString();
        s.ddl_year = curr_year
        s.currentMonth = new Date().getMonth() + 1
        s.ddl_month = datestring(s.currentMonth.toString())

        RetrieveYear();
        init_table_data([]);
        $('#loading_msg').html("LOADING");
        $("#modal_loading").modal();
        var trk_year = s.track_year

        h.post("../cATSDTRSupport/InitializePage").then(function (d) {
            if (d.data.message == "success") {

                s.empl_names = d.data.empl_names
                s.datalistgrid_data = d.data.data;
                s.ddl_name = d.data.p_empl_id
                //s.all_appl  = d.data.all_appl;
                s.trans_lst = d.data.trans_lst
                s.datalistgrid_data.refreshTable1('oTable', '');
                $("#modal_loading").modal('hide');
            }
            else {
                swal(d.data.message, "", { icon: "warning" });
            }
        })
    }

    init()




    Array.prototype.refreshTable1 = function (table, id) {

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
    //*********************************************//
    //*** VJA - 02/29/2020 - Button Edit Action
    //*********************************************// 
    s.btn_edit_action = function (lst) {
        ClearEntry();
        $('#btn_save').attr('ngx-data', lst);
        s.selectedRow = s.datalistgrid_data[lst]
        console.log(s.selectedRow)
        s.txtb_employee_name = s.datalistgrid_data[lst].employee_name;
        s.txtb_dtr_date = s.datalistgrid_data[lst].dtr_date
        s.txtb_empl_id = s.datalistgrid_data[lst].empl_id
        // s.txtb_time_in_am        = s.datalistgrid_data[lst].time_in_am
        // s.txtb_time_out_am       = s.datalistgrid_data[lst].time_out_am
        // s.txtb_time_in_pm        = s.datalistgrid_data[lst].time_in_pm
        // s.txtb_time_out_pm       = s.datalistgrid_data[lst].time_out_pm
        s.txtb_time_in_ot = s.datalistgrid_data[lst].time_in_ot
        s.txtb_time_out_ot = s.datalistgrid_data[lst].time_out_ot
        s.txtb_dtr_status = s.datalistgrid_data[lst].dtr_status
        s.txtb_processed_by_user = s.datalistgrid_data[lst].processed_by_user
        s.txtb_processed_dttm = s.datalistgrid_data[lst].processed_dttm
        s.txtb_dtr_status_descr = s.datalistgrid_data[lst].dtr_status_descr

        var time_in_am = s.datalistgrid_data[lst].time_in_am;
        var time_out_am = s.datalistgrid_data[lst].time_out_am;
        var time_in_pm = s.datalistgrid_data[lst].time_in_pm;
        var time_out_pm = s.datalistgrid_data[lst].time_out_pm;

        //$("#txtb_time_in_am").val(moment(time_in_am, "HH:mm").format("hh:mmA").replace("Invalid date", ""));
        //$("#txtb_time_out_am").val(moment(time_out_am, "HH:mm").format("hh:mmA").replace("Invalid date", ""));
        //$("#txtb_time_in_pm").val(moment(time_in_pm, "HH:mm").format("hh:mmA").replace("Invalid date", ""));
        //$("#txtb_time_out_pm").val(moment(time_out_pm, "HH:mm").format("hh:mmA").replace("Invalid date", ""));

        $("#txtb_time_in_am").val(time_in_am.format("hh:mm"));
        $("#txtb_time_out_am").val(time_out_am.format("hh:mm"));
        $("#txtb_time_in_pm").val(time_in_pm.format("hh:mm"));
        $("#txtb_time_out_pm").val(time_out_pm.format("hh:mm"));

        s.GetBioExtractDetails();

        s.ModalTitle = "Edit Record";
        $('#main_modal').modal({ keyboard: false, backdrop: "static" });
    }
    //*********************************************//
    //*** VJA - 02/29/2020 - Clear Entry
    //*********************************************// 
    function ClearEntry() {
        s.txtb_employee_name = "";
        s.txtb_dtr_date = "";
        s.txtb_empl_id = "";
        //s.txtb_time_in_am        = "";
        //s.txtb_time_out_am       = "";
        //s.txtb_time_in_pm        = "";
        //s.txtb_time_out_pm       = "";
        s.txtb_time_in_ot = "";
        s.txtb_time_out_ot = "";
        s.txtb_dtr_status = "";
        s.txtb_processed_by_user = "";
        s.txtb_processed_dttm = "";

        $("#txtb_time_in_am").val(moment("", "HH:mm").format("hh:mm A").replace("Invalid date", ""));
        $("#txtb_time_out_am").val(moment("", "HH:mm").format("hh:mm A").replace("Invalid date", ""));
        $("#txtb_time_in_pm").val(moment("", "HH:mm").format("hh:mm A").replace("Invalid date", ""));
        $("#txtb_time_out_pm").val(moment("", "HH:mm").format("hh:mm A").replace("Invalid date", ""));


    }
    //***********************************************************//
    //*** VJA - 02/29/2020 - Convert date to String from 1 to 01 if less than 10
    //***********************************************************// 
    function datestring(d) {
        var date_val = ""
        if (d < 10) {
            date_val = '0' + d
        } else {
            date_val = d
        }
        return date_val
    }


    //***********************************************************//
    //***VJA - 02/29/2020 -  Field validation everytime generation 
    //                          button is click ***//
    //***********************************************************// 
    function ValidateFields() {
        var return_val = true;
        ValidationResultColor("ALL", false);

        //if ($('#txtb_wtax_perc').val().trim() == "") {
        //    ValidationResultColor("txtb_wtax_perc", true);
        //    return_val = false;
        //} else if (checkisvalidnumber($('#txtb_wtax_perc').val().trim()) == false) {
        //    $("#txtb_wtax_perc").addClass("required");
        //    $("#lbl_txtb_wtax_perc_req").text("Invalid Number !");
        //    return_val = false;
        //}

        return return_val;
    }
    //***********************************************************//
    //***VJA - 02/29/2020 - Field validation everytime generation 
    //                      button is click ***//
    //***********************************************************// 
    function ValidationResultColor(par_object_id, par_v_result) {
        if (par_v_result) {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else {
            //remove of refresh the object form being required
            $("#txtb_wtax_perc").removeClass("required");
            $("#lbl_txtb_wtax_perc_req").text("");

            $("#txtb_btax_perc").removeClass("required");
            $("#lbl_txtb_btax_perc_req").text("");

            $("#txtb_wtax_2perc").removeClass("required");
            $("#lbl_txtb_wtax_2perc_req").text("");
        }
    }
    //***********************************//
    //***VJA - 2020-04-08 - Remove Function****//
    //***********************************// 
    Array.prototype.remove = function (code, prop) {
        return this.filter(function (d) {
            return d[prop] != code
        })
    }
    //*****************************************//
    //***VJA - 2020-04-08 - Remove Function****//
    //****************************************//
    s.GetBioExtractDetails = function () {
        h.post("../cATSDTRSupport/GetBioExtractDetails",
            {
                par_empl_id: s.txtb_empl_id,
                par_bio_date: s.txtb_dtr_date

            }).then(function (d) {
                if (d.data.message == "success") {
                    s.lst_extract = d.data.data;
                }
                else {
                    swal(d.data.message, "", { icon: "warning" });
                }
            })
    }


    s.appl_data = function (data) {
        // console.log(data)
        return data.length
    }



    //***********************************************************//
    //*** VJA -  2021-06-03 - Button for Refresh DTR
    //***********************************************************//
    s.RefreshDTR = function (print_generate) {
        //try
        //{
        if (ValidateFields()) {
            $('#modal_initializing').modal({ backdrop: 'static', keyboard: false });

            //var params_month = "";
            //if (parseFloat(month_name_to_int($("#txtb_dtr_mon_year").val())) < 10)
            //{
            //    params_month = "0" + month_name_to_int($("#txtb_dtr_mon_year").val())
            //}
            //else
            //{
            //    params_month = month_name_to_int($("#txtb_dtr_mon_year").val())
            //}

            var par_year = s.ddl_year
            var par_mons = s.ddl_month
            var par_empl_id = $("#ddl_name option:selected").val();
            var par_viewtype = "0";
            var par_department_code = $("#ddl_dept option:selected").val();
            // var par_user_id         = s.user_id;

            //var employementtype = s.lv_empl_lst_wout_jo.filter(function (d) {
            //    return d.empl_id == par_empl_id
            //})[0].employment_type;

            var controller = "Reports"
            var action = "Index"
            var ReportName = "CrystalReport"
            var SaveName = "Crystal_Report"
            var ReportType = "inline"
            var ReportPath = ""
            var sp = ""

            h.post("../cATSDTRSupport/sp_generateDTR", {
                dtr_year: par_year
                , dtr_month: par_mons
                , empl_id: par_empl_id

            }).then(function (d) {

                if (d.data.icon == "success") {
                    ReportPath = "~/Reports/cryDTR/cryDTR.rpt";
                    sp = "sp_dtr_rep,par_year," + par_year +
                        ",par_month," + par_mons +
                        ",par_empl_id," + par_empl_id +
                        ",par_view_type," + par_viewtype +
                        ",par_department_code," + d.data.department_code +
                        ",par_user_id," + d.data.session_user_id;

                    // s.embed_link4 = "../" + controller + "/" + action + "?ReportName=" + ReportName
                    //     + "&SaveName=" + SaveName
                    //     + "&ReportType=" + ReportType
                    //     + "&ReportPath=" + ReportPath
                    //     + "&Sp=" + sp;
                    // $('#iframe_print_preview4').attr('src', s.embed_link4);
                    // $("#modal_initializing").modal("hide");

                    // *******************************************************
                    // *** VJA : 2021-07-14 - Validation and Loading hide ****
                    // *******************************************************
                    $("#modal_initializing").modal({ keyboard: false, backdrop: "static" })
                    var iframe = document.getElementById('iframe_print_preview4');
                    var iframe_page = $("#iframe_print_preview4")[0];
                    iframe.style.visibility = "hidden";

                    s.embed_link = "../Reports/CrystalViewer.aspx?Params=" + ""
                        + "&ReportName=" + ReportName
                        + "&SaveName=" + SaveName
                        + "&ReportType=" + ReportType
                        + "&ReportPath=" + ReportPath
                        + "&id=" + sp // + "," + parameters

                    if (!/*@cc_on!@*/0) { //if not IE
                        iframe.onload = function () {
                            iframe.style.visibility = "visible";
                            $("#modal_initializing").modal("hide")
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
                                $("#modal_initializing").modal("hide")
                            }
                        };
                    }

                    console.log(s.embed_link)
                    iframe.src = s.embed_link;
                    // *******************************************************
                    // *******************************************************
                }
                else {
                    swal(d.data.message, { icon: d.data.icon })
                }

            })



        }
        //}
        //catch (err)
        //{
        //    swal({ icon: "warning", title: err.message });
        //}
    }




    //*****************************************************************************************************//
    //*****************************************************************************************************//
});

ng_selfService_App.directive('fnChangeEntry', ["commonScript", function (cs) {
    //************************************// 
    //***
    //************************************// 
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            function assignValue(id, value) {
                $("#" + id).val(value)
                scope[id] = value
            }

            elem.on('click', function () {
                var type = parseInt(scope.selectedEntry)
                var data = attrs.data
                // var val = parseInt(this.value)
                var entryName = {
                    0: "time_in_am"
                    , 3: "time_in_pm"
                    , 2: "time_out_am"
                    , 1: "time_out_pm"
                }
                var ids = {
                    0: "txtb_time_in_am"
                    , 2: "txtb_time_out_am"
                    , 3: "txtb_time_in_pm"
                    , 1: "txtb_time_out_pm"
                }
                var entry = {
                    0: document.getElementById("txtb_time_in_am").value
                    , 2: document.getElementById("txtb_time_out_am").value
                    , 3: document.getElementById("txtb_time_in_pm").value
                    , 1: document.getElementById("txtb_time_out_pm").value
                }

                for (var x = 0; x < 4; x++) {
                    if (data.substring(0, 5).format("hh:mm") == entry[x].substring(0, 5)) {
                        assignValue(ids[x].trim(), "")
                        scope.selectedRow[entryName[x].trim()] = ""
                    }
                }

                assignValue(ids[type].trim(), data.substring(0, 5).format("hh:mm"))
                scope.selectedRow[entryName[type].trim()] = data.substring(0, 5).format("hh:mm")
                $("#extracted_data").modal("hide")

            })
        }
    }
}])

ng_selfService_App.directive('deleteEntry', ["commonScript", function (cs) {
    //************************************// 
    //***
    //************************************// 
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            function assignValue(id, value) {
                $("#" + id).val(value)
                scope[id] = value
            }
            elem.on('click', function () {
                var type = parseInt(attrs.type)
                var entryName = {
                    0: "time_in_am "
                    , 3: "time_in_pm "
                    , 2: "time_out_am"
                    , 1: "time_out_pm"
                }
                var ids = {
                    0: "txtb_time_in_am"
                    , 2: "txtb_time_out_am"
                    , 3: "txtb_time_in_pm"
                    , 1: "txtb_time_out_pm"
                }

                assignValue(ids[type].trim(), "")
                scope.selectedRow[entryName[type].trim()] = ""
            })

        }
    }
}])


ng_selfService_App.directive('saveEntry', ["commonScript", "$http", function (cs, http) {
    //************************************// 
    //***
    //************************************// 
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            function assignValue(id, value) {
                $("#" + id).val(value)
                scope[id] = value
            }
            elem.on('click', function () {
                var dtr_status = ""
                var entryName = {
                    0: "time_in_am "
                    , 3: "time_in_pm "
                    , 2: "time_out_am"
                    , 1: "time_out_pm"
                }
                var ids = {
                    0: "txtb_time_in_am"
                    , 2: "txtb_time_out_am"
                    , 3: "txtb_time_in_pm"
                    , 1: "txtb_time_out_pm"
                }

                for (var x = 0; x < 4; x++) {
                    if (scope.selectedRow[entryName[x].trim()] == "") {
                        dtr_status = dtr_status + "?"
                    }
                    else {
                        dtr_status = dtr_status + "1"
                    }
                }

                scope.selectedRow["dtr_status"] = dtr_status

                console.log(scope.selectedRow)
                cs.spinnerAdd("i_save", "fa fa-save")


                http.post("../cATSDTRSupport/SaveUpdateFromDatabase", { data: scope.selectedRow }).then(function (d) {
                    if (d.data.icon == "success") {

                        scope.datalistgrid_data = d.data.data;
                        scope.datalistgrid = scope.datalistgrid_data.refreshTable('datalist_grid', '');
                        swal("Your record has been saved!", "Data successfully saved", { icon: "success", });

                    }
                    else {

                        swal(d.data.message, { icon: "error", });

                    }

                    cs.spinnerRemove("i_save", "fa fa-save")
                    $('.modal').modal('hide');

                });
            })

        }
    }
}])



ng_selfService_App.directive('selectedEntry', ["commonScript", function (cs) {
    //************************************// 
    //***
    //************************************// 
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            function assignValue(id, value) {
                $("#" + id).val(value)
                scope[id] = value
            }
            elem.on('click', function () {
                scope.selectedEntry = attrs.type
            })

        }
    }
}])



ng_selfService_App.filter("prog_stat_color", function () {
    return function (input) {
        var prog_stat_color = ""
        if (input == '1') { prog_stat_color = 'info' }
        else if (input == '2') { prog_stat_color = 'info' }
        else if (input == 'C') { prog_stat_color = 'danger' }
        else if (input == 'D') { prog_stat_color = 'danger' }
        else if (input == 'F') { prog_stat_color = 'navy' }
        else if (input == 'L') { prog_stat_color = 'danger' }
        else if (input == 'N') { prog_stat_color = 'success' }
        else if (input == 'R') { prog_stat_color = 'info' }
        else if (input == 'S') { prog_stat_color = 'warning' }
        return prog_stat_color
    };
});

ng_selfService_App.filter("stat_color", function () {
    return function (input) {
        var stat_color = ""
        if (input == '1') { stat_color = 'info' }
        else if (input == '2') { stat_color = 'info' }
        else if (input == 'C') { stat_color = 'danger' }
        else if (input == 'D') { stat_color = 'danger' }
        else if (input == 'F') { stat_color = 'navy' }
        else if (input == 'L') { stat_color = 'danger' }
        else if (input == 'N') { stat_color = 'success' }
        else if (input == 'R') { stat_color = 'info' }
        else if (input == 'S') { stat_color = 'warning' }
        return stat_color
    };
});


ng_selfService_App.filter("stat_icon", function () {
    return function (input) {
        var stat_icon = ""
        if (input == '1') { stat_icon = 'info' }
        else if (input == '2') { stat_icon = 'info' }
        else if (input == 'C') { stat_icon = 'danger' }
        else if (input == 'D') { stat_icon = 'danger' }
        else if (input == 'F') { stat_icon = 'navy' }
        else if (input == 'L') { stat_icon = 'danger' }
        else if (input == 'N') { stat_icon = 'success' }
        else if (input == 'R') { stat_icon = 'info' }
        else if (input == 'S') { stat_icon = 'warning' }
        return stat_icon
    };
});


ng_selfService_App.filter("prog_stat_perc", function () {
    var groupBy = function (xs, key) {
        return xs.reduce(function (rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    };

    return function (input) {
        var completed = Object.keys(groupBy(input, "rcrd_status")).length
        var target = input.length

        return ((completed / target) * 100)
    };
});


