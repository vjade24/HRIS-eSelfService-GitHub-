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
ng_selfService_App.controller("cSSCOCAppl_ctrl", function ($scope, $compile, $http, $filter) {
    var s = $scope;
    var h = $http;
    s.year                  = [];
    s.datalistgrid_data     = [];
    s.employment_type_lst   = "";
    s.rowLen                = "";
    s.ddl_year              = "";
    s.ddl_month             = "";
    s.ddl_group_class       = "";
    s.txtb_template_descr   = "PHIC Share";//Hard coded for now based on the descussion.
    s.template_code         = "996";       //Hard coded for now based on the descussion.
    s.grouplist = [];
    s.ddl_department  = "21"
    s.employment_type = "";
    s.rate_basis = "";
    s.payroll_year  = ""
    s.payroll_month = ""
    function RetrieveYear()
    {
        var currentYear = new Date().getFullYear();
        var prev_year = currentYear - 5;
        for (var i = 1; i <= 8; i++) {
            var data = { "year": prev_year }
            s.year.push(data)
            prev_year++;
        }
    }
    var init_table_data = function (par_data)
    {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {

                data: s.datalistgrid,
                sDom: 'rt<"bottom"ip>',
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
    s.FilterPageGrid = function ()
    {
        $('#loading_msg').html("LOADING");
        $("#modal_loading").modal();
        try
        {
            

            h.post("../cSSCOCAppl/FilterPageGrid", {
                p_empl_id: $("#ddl_name option:selected").val()
                ,p_year: s.ddl_year
                , p_month: s.ddl_month
                
            }).then(function (d)
            {
                if (d.data.message == "success")
                {
                    s.datalistgrid_data = d.data.data;
                    s.datalistgrid_data.refreshTable('oTable', '');
                    $("#modal_loading").modal('hide');
                }
                else
                {
                    swal(d.data.message, "", { icon: "warning" });
                }
                
            });
        }
        catch (err) {
            swal({ icon: "warning", title: err.message });
        }
    }


    function init()
    {
        $("#ddl_name").select2().on('change', function (e) {
            s.FilterPageGrid();
        });

        var curr_year   = new Date().getFullYear().toString();
        s.ddl_year      = curr_year
        s.currentMonth  = new Date().getMonth() + 1
        s.ddl_month     = datestring(s.currentMonth.toString())

        RetrieveYear();
        init_table_data([]);

        $('#loading_msg').html("LOADING");
        $("#modal_loading").modal();
        var trk_year = s.track_year

        h.post("../cSSCOCAppl/InitializePage").then(function (d)
        {
            if (d.data.message == "success") {
                s.empl_names = d.data.empl_names
                s.datalistgrid_data = d.data.data;
                s.datalistgrid_data.refreshTable('oTable', '');
                $("#modal_loading").modal('hide');
            }
            else
            {
                swal(d.data.message, "", { icon: "warning" });
            }
        })
    }

    init()
    
    
    s.search_in_list = function (value, table) {
        $("#" + table).DataTable().search(value).draw();
    }

    s.setNumOfRow = function (value, table) {
        $("#" + table).DataTable().page.len(s.rowLen).draw();
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
    //*********************************************//
    //*** VJA - 02/29/2020 - Button Edit Action
    //*********************************************// 
    s.btn_edit_action = function (lst)
    {
        ClearEntry();
        $('#btn_save').attr('ngx-data', lst);

        s.txtb_employee_name     = s.datalistgrid_data[lst].employee_name;
        s.txtb_dtr_date          = s.datalistgrid_data[lst].dtr_date
        s.txtb_empl_id           = s.datalistgrid_data[lst].empl_id
        // s.txtb_time_in_am        = s.datalistgrid_data[lst].time_in_am
        // s.txtb_time_out_am       = s.datalistgrid_data[lst].time_out_am
        // s.txtb_time_in_pm        = s.datalistgrid_data[lst].time_in_pm
        // s.txtb_time_out_pm       = s.datalistgrid_data[lst].time_out_pm
        s.txtb_time_in_ot        = s.datalistgrid_data[lst].time_in_ot
        s.txtb_time_out_ot       = s.datalistgrid_data[lst].time_out_ot
        s.txtb_dtr_status        = s.datalistgrid_data[lst].dtr_status
        s.txtb_processed_by_user = s.datalistgrid_data[lst].processed_by_user
        s.txtb_processed_dttm    = s.datalistgrid_data[lst].processed_dttm

        var time_in_am  = s.datalistgrid_data[lst].time_in_am;
        var time_out_am = s.datalistgrid_data[lst].time_out_am;
        var time_in_pm  = s.datalistgrid_data[lst].time_in_pm;
        var time_out_pm = s.datalistgrid_data[lst].time_out_pm;

        $("#txtb_time_in_am").val(moment(time_in_am, "HH:mm").format("hh:mmA").replace("Invalid date", ""));
        $("#txtb_time_out_am").val(moment(time_out_am, "HH:mm").format("hh:mmA").replace("Invalid date", ""));
        $("#txtb_time_in_pm").val(moment(time_in_pm, "HH:mm").format("hh:mmA").replace("Invalid date", ""));
        $("#txtb_time_out_pm").val(moment(time_out_pm, "HH:mm").format("hh:mmA").replace("Invalid date", ""));
        
        s.ModalTitle = "Edit Record";

        $('#main_modal').modal({ keyboard: false, backdrop: "static" });
    }
    //*********************************************//
    //*** VJA - 02/29/2020 - Clear Entry
    //*********************************************// 
    function ClearEntry()
    {
        s.txtb_employee_name     = "";
        s.txtb_dtr_date          = "";
        s.txtb_empl_id           = "";
        //s.txtb_time_in_am        = "";
        //s.txtb_time_out_am       = "";
        //s.txtb_time_in_pm        = "";
        //s.txtb_time_out_pm       = "";
        s.txtb_time_in_ot        = "";
        s.txtb_time_out_ot       = "";
        s.txtb_dtr_status        = "";
        s.txtb_processed_by_user = "";
        s.txtb_processed_dttm = "";

        $("#txtb_time_in_am").val(moment("", "HH:mm").format("hh:mmA").replace("Invalid date", ""));
        $("#txtb_time_out_am").val(moment("", "HH:mm").format("hh:mmA").replace("Invalid date", ""));
        $("#txtb_time_in_pm").val(moment("", "HH:mm").format("hh:mmA").replace("Invalid date", ""));
        $("#txtb_time_out_pm").val(moment("", "HH:mm").format("hh:mmA").replace("Invalid date", ""));

        
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
    //*** VJA - 02/29/2020 - Occure when save button is clicked and save/edit data
    //***********************************************************// 
    s.btn_save_click = function ()
    {
        if (ValidateFields())
        {
            var data =
            {
                dtr_date             : s.txtb_dtr_date
                ,empl_id             : s.txtb_empl_id
                ,time_in_am          : moment($('#txtb_time_in_am').val().trim(),"hh:mm A").format("HH:mm").replace("Invalid date","")
                ,time_out_am         : moment($('#txtb_time_out_am').val().trim(),"hh:mm A").format("HH:mm").replace("Invalid date","")
                ,time_in_pm          : moment($('#txtb_time_in_pm').val().trim(),"hh:mm A").format("HH:mm").replace("Invalid date","")
                ,time_out_pm         : moment($('#txtb_time_out_pm').val().trim(),"hh:mm A").format("HH:mm").replace("Invalid date","")
                ,time_in_ot          : s.txtb_time_in_ot
                ,time_out_ot         : s.txtb_time_out_ot
                ,dtr_status          : s.txtb_dtr_status
                ,processed_by_user   : s.txtb_processed_by_user
                ,processed_dttm      : s.txtb_processed_dttm
                
            };


            $('#i_save').removeClass('fa-save');
            $('#i_save').addClass('fa-spinner fa-spin');
            h.post("../cSSCOCAppl/SaveUpdateFromDatabase", { data: data }).then(function (d) {
                if (d.data.message == "success")
                {
                   h.post("../cSSCOCAppl/FilterPageGrid", {
                        p_empl_id: s.txtb_empl_id
                        ,p_year: s.ddl_year
                        , p_month: s.ddl_month
                
                    }).then(function (d)
                    {
                        if (d.data.message == "success")
                        {
                            s.datalistgrid_data = d.data.data;
                            s.datalistgrid_data.refreshTable('oTable', '');
                            swal("Your record has been saved!", "Data successfully saved", { icon: "success", });
                            $("#main_modal").modal('hide');
                        }
                        else
                        {
                            swal(d.data.message, "", { icon: "warning" });
                        }
                
                    });
                }
                else
                {
                    swal(d.data.message, "", { icon: "error", });
                }

                $('#i_save').addClass('fa-save');
                $('#i_save').removeClass('fa-spinner fa-spin');
            });
            
        }

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
    
});