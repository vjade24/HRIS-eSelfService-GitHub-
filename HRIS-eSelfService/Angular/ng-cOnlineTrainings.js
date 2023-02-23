//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for BAC Members Information
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// VINCENT JADE H. ALIVIO   04/02/2020      Code Creation
//**********************************************************************************
ng_selfService_App.controller("cOnlineTrainings_ctrl", function ($scope, $compile, $http, $filter) {
    var s = $scope;
    var h = $http;
    s.datalistgrid     = [];
    s.rowLen           = "10";
    s.um               = [];
    s.deplist          = [];
    s.data_online_complete   = [];
    s.data_online_incomplete = [];
    s.year = [];
    s.ddl_month = ""
    s.ddl_year = "";
    s.train_code = "";
    s.ddl_show = "50"
    var tag;
    var player;
    var firstScriptTag;
    var done = false;

    //***********************************************************//
    //*** VJA - 2020-04-03 - Initialize when Page on-Load
    //***********************************************************//
    function init()
    {
        // 2. This code loads the IFrame Player API code asynchronously.
        // tag = document.createElement('script');

        //tag.src = "https://www.youtube.com/iframe_api";
        //firstScriptTag = document.getElementsByTagName('script')[0];
        //firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        //onYouTubeIframeAPIReady();

        RetrieveYear();
        s.ddl_year = new Date().getFullYear().toString()
        s.currentMonth = new Date().getMonth() + 1
        s.ddl_month = datestring(s.currentMonth.toString())

        //init_table_data([]);
        $('#loading_msg').html("LOADING");
        $("#modal_loading").modal();
        h.post("../cOnlineTrainings/InitializePage", {
            par_include_history: 'N',
            par_train_year: s.ddl_year,
            //par_train_month: s.ddl_month
        }).then(function (d)
        {
            s.data_online_complete   = d.data.data_online_complete
            s.data_online_incomplete = d.data.data_online_incomplete
            s.completed_count = d.data.data_online_complete.length
            s.incomplete_count = d.data.data_online_incomplete.length
            
            for (var x = 0; x < d.data.data_online_incomplete.length; x++) {
                if (d.data.data_online_incomplete[x].train_type == "001") {
                    d.data.data_online_incomplete[x].training_icon = "fa fa-youtube-play fa-5x text-danger";
                }
                else if (d.data.data_online_incomplete[x].train_type == "002") {
                    d.data.data_online_incomplete[x].training_icon = "fa fa-file-pdf-o fa-5x text-success";
                }
                else if (d.data.data_online_incomplete[x].train_type == "003") {
                    d.data.data_online_incomplete[x].training_icon = "fa fa-image fa-5x text-warning";
                }
            }

            for (var x = 0; x < d.data.data_online_complete.length; x++) {
                if (d.data.data_online_complete[x].train_type == "001") {
                    d.data.data_online_complete[x].training_icon = "fa fa-youtube-play fa-5x text-danger";
                }
                else if (d.data.data_online_complete[x].train_type == "002") {
                    d.data.data_online_complete[x].training_icon = "fa fa-file-pdf-o fa-5x text-success";
                }
                else if (d.data.data_online_complete[x].train_type == "003") {
                    d.data.data_online_complete[x].training_icon = "fa fa-image fa-5x text-warning";
                }
            }
            
           
            $("#modal_loading").modal('hide');
        })
    }
    init()

    //*********************************************//
    //*** VJA - 2020-04-03 - Clear Entry
    //*********************************************// 
    function ClearEntry() {
        ValidationResultColor("ALL", false);

        s.ddl_department        = "";
        s.txtb_empl_name        = "";
        s.ddl_empl_name         = "";
        s.txtb_empl_id          = "";
        s.txtb_effective_date   = "";
        s.ddl_rcrd_status       = "";
        s.txtb_allowance_amt    = "";
        s.ddl_pos_class         = "";
        s.txtb_position         = "";
    }
    //***********************************************************//
    //*** VJA - 03/11/2020 - Occure when add button is clicked and initialize the objects
    //***********************************************************// 
    s.btn_add_click = function () {
        $('#i_save').addClass('fa-save');
        $('#i_save').removeClass('fa-spinner fa-spin');
        ClearEntry();
        
        s.ModalTitle  = "Add New Record";
        s.ADDEDITMODE = "ADD";
        s.empl_name           = true
        s.show_effective_date = true
        s.isdisable           = true
        s.ddl_pos_class       = "M";
        $('#main_modal').modal({ keyboard: false, backdrop: "static" });
        
    }
    //*********************************************//
    //*** VJA - 2020-04-03 - Button Edit Action
    //*********************************************// 
    s.btn_edit_action = function (lst)
    {
        $('#btn_save').attr('ngx-data', lst);
        ClearEntry();
        s.isdisable = false
        s.empl_name = false
        s.show_effective_date = false
        s.txtb_effective_date = s.datalistgrid[lst].effective_date    
        s.txtb_empl_id        = s.datalistgrid[lst].empl_id           
        s.txtb_empl_name      = s.datalistgrid[lst].employee_name           
        s.txtb_position       = s.datalistgrid[lst].bac_position_descr
        s.ddl_pos_class       = s.datalistgrid[lst].bac_position_class
        s.txtb_allowance_amt  = currency(s.datalistgrid[lst].bac_allowance_amt)
        s.ddl_rcrd_status     = s.datalistgrid[lst].rcrd_status    == true ? "1" : "0"   
        
        s.ModalTitle  = "Edit Record";
        s.ADDEDITMODE = "EDIT";
        $('#main_modal').modal({ keyboard: false, backdrop: "static" });
    }
    //***************************************************************************//
    //*** VJA - 2020-04-03 - Occure when save button is clicked and save/edit data
    //***************************************************************************//
    s.btn_save_click = function () {
        if (ValidateFields()) {
            var data =
            {
                effective_date: $('#txtb_effective_date').val()
                , empl_id: s.txtb_empl_id
                , bac_position_descr: s.txtb_position
                , bac_position_class: s.ddl_pos_class
                , bac_allowance_amt: $('#txtb_allowance_amt').val().trim().replace(',', '').replace(',', '')
                , rcrd_status: $('#ddl_rcrd_status').val().trim() == "1" ? true : false

            };

            if (s.ADDEDITMODE == "ADD") {
                $('#i_save').removeClass('fa-save');
                $('#i_save').addClass('fa-spinner fa-spin');
                h.post("../cOnlineTrainings/SaveFromDatabase", { data: data }).then(function (d) {
                    if (d.data.message == "success") {

                        h.post("../cOnlineTrainings/RetreiveDataGrid", {
                            par_include_history: s.chk_include_history == true ? 'Y' : 'N'
                        }
                        ).then(function (d) {
                            if (d.data.data.length > 0) {
                                s.datalistgrid = d.data.data;
                                s.oTable.fnClearTable();
                                s.oTable.fnAddData(d.data.data)
                            }
                            else {
                                s.oTable.fnClearTable();
                            }
                            // s.ddl_last_name = $('#txtb_student_lname').val().trim().substring(0, 1).toUpperCase();
                            s.datalistgrid.push(data)
                            for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                                if (get_page(s.txtb_student_id) == false) {
                                    s.oTable.fnPageChange(x);
                                }
                                else {
                                    break;
                                }
                            }
                            
                            })
                        $('#main_modal').modal("hide");
                        swal("Your record has been saved!", d.data.message_oth, { icon: "success" });
                    }

                    $('#i_save').addClass('fa-save');
                    $('#i_save').removeClass('fa-spinner fa-spin');
                });
            }
            else if (s.ADDEDITMODE == "EDIT") {
                $('#i_save').removeClass('fa-save');
                $('#i_save').addClass('fa-spinner fa-spin');

                h.post("../cOnlineTrainings/UpdateFromDatabase", { data: data }).then(function (d) {
                    if (d.data.message == "success") {

                        var index_of_row = $('#btn_save').attr('ngx-data');
                        s.datalistgrid[index_of_row].effective_date = s.txtb_effective_date
                        s.datalistgrid[index_of_row].empl_id = s.txtb_empl_id
                        s.datalistgrid[index_of_row].bac_position_descr = s.txtb_position
                        s.datalistgrid[index_of_row].bac_position_class = s.ddl_pos_class
                        s.datalistgrid[index_of_row].bac_allowance_amt = $('#txtb_allowance_amt').val().trim().replace(',', '').replace(',', '')
                        s.datalistgrid[index_of_row].rcrd_status = s.ddl_rcrd_status == '1' ? true : false

                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid);

                        for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                            if (get_page(s.txtb_empl_id) == false) {
                                s.oTable.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }

                        $('#main_modal').modal("hide");
                        swal("Your record has been saved!", d.data.message_oth, { icon: "success", });

                    }
                    else {
                        swal(d.data.message, d.data.message_oth, { icon: "error", });
                    }

                    $('#i_save').addClass('fa-save');
                    $('#i_save').removeClass('fa-spinner fa-spin');
                });
            }
        }

    }
    //***********************************************************//
    //*** VJA - 2020-04-03 -  Edit Action Occurred function click
    //***********************************************************// 
    s.btn_delete_row = function (id_ss) {
        
        swal({
            title: "Are you sure to delete this record?",
            text: "Once deleted, you will not be able to recover this record !",
            icon: "warning",
            buttons: true,
            dangerMode: true,

        })
            .then(function (willDelete) {
                if (willDelete) {
                    h.post("../cOnlineTrainings/DeleteFromDatabase",
                        {
                            par_empl_id: s.datalistgrid[id_ss].empl_id,
                            par_effective_date: s.datalistgrid[id_ss].effective_date,

                        }).then(function (d) {

                            if (d.data.message == "success") {
                                s.datalistgrid = s.datalistgrid.remove(s.datalistgrid[id_ss].empl_id, "empl_id");
                                if (s.datalistgrid.length != 0) {
                                    s.oTable.fnClearTable();
                                    s.oTable.fnAddData(s.datalistgrid);
                                } else {
                                    s.oTable.fnClearTable();
                                }
                                swal("Your record has been deleted!", { icon: "success", });
                            }
                            else {
                                swal(d.data.message, "Data not deleted", "error");
                            }

                        })
                }
            });
    }
    //***********************************************************//
    //***VJA - 03/11/2020 -  Field validation everytime generation 
    //                          button is click ***//
    //***********************************************************// 
    function ValidateFields() {
        var return_val = true;
        ValidationResultColor("ALL", false);
        if (($('#ddl_empl_name').val() == "" && s.ADDEDITMODE == "ADD") && $('#ddl_department').val() == "")
        {
            ValidationResultColor("ddl_department", true);
            $("#ddl_department").addClass("required");
            $("#lbl_ddl_department_req").text("You need to Select Department");
            return_val = false;
        } else if ($('#ddl_empl_name').val() == "" && s.ADDEDITMODE == "ADD") {
            ValidationResultColor("ddl_empl_name", true);
            return_val = false;
        }
        if ($('#txtb_effective_date').val() == "") {
            ValidationResultColor("txtb_effective_date", true);
            return_val = false;
        } else if (checkisdate($('#txtb_effective_date').val()) == false) {
            ValidationResultColor("txtb_effective_date", true);
            $("#txtb_effective_date").addClass("required");
            $("#lbl_txtb_effective_date_req").text("Invalid Date ");
            return_val = false;
        }
        if ($('#ddl_rcrd_status').val() == "") {
            ValidationResultColor("ddl_rcrd_status", true);
            return_val = false;
        } 
        if ($('#txtb_allowance_amt').val() == "") {
            ValidationResultColor("txtb_allowance_amt", true);
            return_val = false;
        } else if (checkisvalidnumber($('#txtb_allowance_amt').val()) == false)
        {
            ValidationResultColor("txtb_allowance_amt", true);
            $("#txtb_allowance_amt").addClass("required");
            $("#lbl_txtb_allowance_amt_req").text("Invalid Numeric Value ");
            return_val = false;
        } 
        if ($('#ddl_pos_class').val() == "") {
            ValidationResultColor("ddl_pos_class", true);
            return_val = false;
        }
        if ($('#txtb_position').val() == "") {
            ValidationResultColor("txtb_position", true);
            return_val = false;
        } 
        return return_val;
    }

    //********************************************************************************//
    //***VJA - 03/11/2020 - Field validation everytime generation button is click ***//
    //******************************************************************************//
    function ValidationResultColor(par_object_id, par_v_result) {
        if (par_v_result) {
            //Add class to the obect that need to focus as a required..
            $("#" + par_object_id).addClass("required");
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else {
            //remove of refresh the object form being required
            $("#ddl_empl_name").removeClass("required");
            $("#lbl_ddl_empl_name_req").text("");

            $("#txtb_effective_date").removeClass("required");
            $("#lbl_txtb_effective_date_req").text("");

            $("#ddl_rcrd_status").removeClass("required");
            $("#lbl_ddl_rcrd_status_req").text("");

            $("#txtb_allowance_amt").removeClass("required");
            $("#lbl_txtb_allowance_amt_req").text("");

            $("#ddl_pos_class").removeClass("required");
            $("#lbl_ddl_pos_class_req").text("");
            
            $("#txtb_position").removeClass("required");
            $("#lbl_txtb_position_req").text("");

            $("#ddl_department").removeClass("required");
            $("#lbl_ddl_department_req").text("");
        }
    }
    //**************************************************************//
    //*** VJA - 2020-04-03 - On-Change on Dropdownlist for Department
    //**************************************************************//
    s.set_department_index = function (par_index)
    {
        if (par_index != "")
        {
            h.post("../cOnlineTrainings/RetrieveEmpl", {
                par_department_code: s.deplist[par_index].department_code
            }).then(function (d)
            {
                s.emplist = d.data.emplist
            });
        }
        else
        {
            s.emplist = [];
            s.txtb_empl_id = "";
        }
    }
    //******************************************************************//
    //*** VJA - 2020-04-03 - On-Change on Dropdownlist for Employee Name
    //*****************************************************************//
    s.set_empl_name_index = function (par_index)
    {
        if (par_index != "")
        {
            s.txtb_empl_id = s.emplist[par_index].empl_id
        }
        else {
            s.txtb_empl_id = "";
        }
    }
    //******************************************************************//
    //*** VJA - 2020-04-03 - Include History
    //*****************************************************************//
    s.RetrieveGrid = function () {
        h.post("../cOnlineTrainings/RetreiveDataGrid", {

            par_train_year: s.ddl_year 
            //, par_train_month: s.ddl_month
            , par_show_entries: s.ddl_show
        }).then(function (d)
        {
            s.data_online_complete     = [];
            s.data_online_incomplete   = [];

            s.data_online_complete   = d.data.data_online_complete
            s.data_online_incomplete = d.data.data_online_incomplete
            s.completed_count        = d.data.data_online_complete.length
            s.incomplete_count       = d.data.data_online_incomplete.length
            
            for (var x = 0; x < d.data.data_online_incomplete.length; x++) {
                if (d.data.data_online_incomplete[x].train_type == "001") {
                    d.data.data_online_incomplete[x].training_icon = "fa fa-youtube-play fa-5x text-danger";
                }
                else if (d.data.data_online_incomplete[x].train_type == "002") {
                    d.data.data_online_incomplete[x].training_icon = "fa fa-file-pdf-o fa-5x text-success";
                }
                else if (d.data.data_online_incomplete[x].train_type == "003") {
                    d.data.data_online_incomplete[x].training_icon = "fa fa-image fa-5x text-warning";
                }
            }

            for (var x = 0; x < d.data.data_online_complete.length; x++) {
                if (d.data.data_online_complete[x].train_type == "001") {
                    d.data.data_online_complete[x].training_icon = "fa fa-youtube-play fa-5x text-danger";
                }
                else if (d.data.data_online_complete[x].train_type == "002") {
                    d.data.data_online_complete[x].training_icon = "fa fa-file-pdf-o fa-5x text-success";
                }
                else if (d.data.data_online_complete[x].train_type == "003") {
                    d.data.data_online_complete[x].training_icon = "fa fa-image fa-5x text-warning";
                }
            }
            
        });
    }
    
    //***********************************************************//
    //*** VJA - 2020-04-03 - Reject or Check if Date
    //***********************************************************// 
    function checkisdate(d)
    {
        // Regex 1 - This will match yyyy-mm-dd and also yyyy-m-d:
        var regex1 = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;
        // Regex 2 - If you're looking for an exact match for yyyy-mm-dd then try this
        var regex2 = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
        // Regex 3 - or use this one if you need to find a date inside a string like The date is 2017-11-30
        var regex3 = /\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])*/;

        var istrue = false;
        if (regex1.test(d) == true ||
            regex2.test(d) == true ||
            regex3.test(d) == true)
        {
            istrue = true;
        } else
        {
            istrue = false;
        }
        return istrue;

    }
    //************************************************//
    //***VJA - 2020-04-03 - Validation for Nunber****//
    //**********************************************//
    function checkisvalidnumber(i) {
        var regex_spchar = /[^a-zA-Z0-9\s]\,\./;
        var regex_upper  = /[A-Z]/;
        var regex_lower  = /[a-z]/;
        var istrue = false;

        if (regex_upper.test(i) == true ||
            regex_lower.test(i) == true ||
            regex_spchar.test(i) == true) {
            istrue = false
        } else {
            istrue = true
        }
        return istrue
    }
    //************************************************//
    //***VJA - 2020-04-03 - Validation for Nunber****//
    //**********************************************//
    function checkischaracter(i) {
        var regex_upper = /[0-9]/;
        var istrue = false;

        if (regex_upper.test(i) == true) {
            istrue = false
        } else {
            istrue = true
        }
        return istrue
    }
    //***********************************************************//
    //***VJA - 03/11/2020 - Convert The Currency to 0,000,000.00 format
    //***********************************************************// 
    function currency(d) {

        var retdata = ""
        if (d == null || d == "" || d == undefined) {
            return retdata = "0.00"
        }
        else {
            retdata = parseFloat(d).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')

            return retdata
        }
    }
    //***********************************************************//
    //*** VJA - 2020-04-03 - Search Functinality
    //***********************************************************//
    s.search_in_list = function (value, table) {
        $("#" + table).DataTable().search(value).draw();
    }
    //***********************************************************//
    //*** VJA - 2020-04-03 - Set Number of row
    //***********************************************************//
    s.setNumOfRow = function (value, table) {
        $("#" + table).DataTable().page.len(s.rowLen).draw();
    }
    //***********************************************************//
    //*** VJA - 2020-04-03 - Refresh Table
    //***********************************************************//
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
    //***********************************************************//
    //*** VJA - 2020-04-03 - Get Page Row
    //***********************************************************// 
    function get_page(empl_id) {
        var nakit_an = false;
        var rowx = 0;
        $('#datalist_grid tr').each(function () {
            $.each(this.cells, function (cells) {
                if (cells == 0) {
                    if ($(this).text() == empl_id) {
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
    //***********************************//
    //***VJA - 2020-04-03 - Remove Function****//
    //***********************************// 
    Array.prototype.remove = function (code, prop) {
        return this.filter(function (d) {
            return d[prop] != code
        })
    }
    //***********************************//
    //***VJA - 2020-04-03 - Remove Function****//
    //***********************************//
    s.openInfo = function (data,status)
    {
        //alert(status)
        flag_status = false;
        if (status == 'C') {
            flag_status = true;
        } else if (status == 'N') {
            flag_status = false;
        }

        progress(0);
        progress(60);

        //alert(flag_status)
        s.train_code = "";
        //console.log(data.train_details)
        $('#train_link').attr('src', data.train_link);
        $('#train_details').text(data.train_details);
        $('#train_descr_short').text(data.train_descr_short);
        $('#empl_train_status_descr').text(data.empl_train_status_descr);

        $('#train_dt_completion').text(data.train_dt_4completion);
        $('#train_mode_descr').text(data.train_mode_descr);
        $('#train_descr').text(data.train_descr);
        s.train_code = data.train_code

        $('#i_save').addClass('fa-save');
        $('#i_save').removeClass('fa-spinner fa-spin');
        ClearEntry();
        s.ModalTitle = data;
        s.ADDEDITMODE = "ADD";
        s.empl_name = true
        s.show_effective_date = true
        s.isdisable = true
        s.ddl_pos_class = "M";
        $('#main_modal').modal({ keyboard: false, backdrop: "static" });
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
    

    s.PlayVids = function ()
    {
        //alert("g")
        $("#playvideo").one(function () {
            //as noted in addendum, check for querystring exitence
            var symbol = $("#train_link")[0].src.indexOf("?") > -1 ? "&" : "?";
            //modify source to autoplay and start video
            $("#train_link")[0].src += symbol + "autoplay=1";
        });
    }
    window.onload = function () {
            
        var oFrame = document.getElementById("train_link");
        oFrame.contentWindow.document.onclick = function () {
           // alert("frame contents clicked");
        };
    };

    function progress(value)
    {
        $("#progress-bar-materials").css("width", '%');
        $("#progress-bar-materials").text("0%");
        
        //$("#show_message").css("display", 'none');
        s.show_message = false;
        if (flag_status == false) {
            var duration = 1000 * value; //multiply by seconds
            
            var st = new Date().getTime();
            var interval = setInterval(function () {
            var diff = Math.round(new Date().getTime() - st),
            val = Math.round(diff / duration * 100);
                val = val > 100 ? 100 : val;

                $("#progress-bar-materials").css("width", val + '%');
                $("#progress-bar-materials").text(val + "%");
               
                if (diff >= duration) {
                     clearInterval(interval);
                    console.log(diff)
                    console.log(duration)
                    console.log((1000 * value))
                    var duration_equal = 1000 * value; //multiply by seconds
                    if (duration == 60000)
                    {
                        var data = { "train_code": s.train_code }
                        h.post("../cOnlineTrainings/SaveFromDatabase", { data: data }).then(function (d) {
                            if (d.data.message == "success")
                            {
                                s.show_message = true;
                            }
                            else
                            {
                                s.show_message = false;
                            }
                            s.RetrieveGrid();

                        })
                    }

                }
            }, 100);
        }

        else {

            s.show_message = true;
            $("#progress-bar-materials").css("width", '100%');
            $("#progress-bar-materials").text('Completed');

        }

    }

    // 3. This function creates an <iframe> (and YouTube player)
    //    after the API code downloads.

    function onYouTubeIframeAPIReady() {
        console.log(player)
        player = new YT.Player('player', {
            height: '390',
            width: '640',
            videoId: 'M7lc1UVf-VE',
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }
    // 4. The API will call this function when the video player is ready.
    function onPlayerReady(event) {
        event.target.playVideo();
    }
    // 5. The API calls this function when the player's state changes.
    //    The function indicates that when playing a video (state=1),
    //    the player should play for six seconds and then stop.
    function onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.PLAYING && !done) {
            //alert("asd")
            setTimeout(stopVideo, 100);
            done = true;

        }
    }
    function stopVideo() {
        player.stopVideo();
    }


    s.download_file = function (train_code,type,status)
    {
        if (type == "PDF")
        {
            $('#download_pdf_icon').removeClass('fa-download');
            $('#download_pdf_icon').addClass('fa-spinner fa-spin');
        }
        else if (type == "VDO")
        {
            $('#download_vdo_icon').removeClass('fa-download');
            $('#download_vdo_icon').addClass('fa-spinner fa-spin');
        }

        if (status == "N")
        {
            setTimeout(function () {
                var data = { "train_code": train_code }
                h.post("../cOnlineTrainings/SaveFromDatabase", { data: data }).then(function (d) {
                    if (d.data.message == "success") {
                        swal("Successfully Downloaded the File!", "Training has been credited!", { icon: "success", });
                    }
                    else {
                        swal("Error on Saving", { icon: "error", });
                    }
                    s.RetrieveGrid();

                    $('#download_pdf_icon').addClass('fa-download');
                    $('#download_pdf_icon').removeClass('fa-spinner fa-spin');
                    $('#download_vdo_icon').addClass('fa-download');
                    $('#download_vdo_icon').removeClass('fa-spinner fa-spin');

                })

            }, 5000);
        }
    }

    s.closeInfo = function ()
    {
        $('#train_link').attr('src',"");
    }

    //s.download_file_test = function (train_code)
    //{
    //    if (type == "PDF") {
    //        $('#download_pdf_icon').removeClass('fa-download');
    //        $('#download_pdf_icon').addClass('fa-spinner fa-spin');
    //    }
    //    else if (type == "VDO") {
    //        $('#download_vdo_icon').removeClass('fa-download');
    //        $('#download_vdo_icon').addClass('fa-spinner fa-spin');
    //    }

    //    var data = { "train_code": train_code }
    //    h.post("../cOnlineTrainings/Download", { data: data }).then(function (d) {
    //        if (d.data.message == "success") {
    //            swal("Successfully Downloaded the File!", "Training has been credited!", { icon: "success", });
    //        }
    //        else {
    //            swal("Error on Saving", { icon: "error", });
    //        }
    //        s.RetrieveGrid();

    //        $('#download_pdf_icon').addClass('fa-download');
    //        $('#download_pdf_icon').removeClass('fa-spinner fa-spin');
    //        $('#download_vdo_icon').addClass('fa-download');
    //        $('#download_vdo_icon').removeClass('fa-spinner fa-spin');

    //    })
    //}
});