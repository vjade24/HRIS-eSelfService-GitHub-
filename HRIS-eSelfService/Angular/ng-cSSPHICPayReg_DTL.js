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
ng_selfService_App.controller("cSSPHICPayReg_DTL_ctrl", function ($scope, $compile, $http, $filter) {
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
                pageLength: 10,
                order: [[1, "asc"]],
                columns: [

                    {
                        "mData": "empl_id",
                        "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" }
                    },
                    { "mData": "employee_name" },
                    {
                      "mData": "position_short_title",
                    },
                    {
                        "mData": "gross_pay",
                        "mRender": function (data, type, full, row) { return "<span class='text-right btn-block'>" + currency(data) + "</span>" }
                    },
                    {
                        "mData": "net_pay",
                        "mRender": function (data, type, full, row) { return "<span class='text-right btn-block'>" + currency(data) + "</span>" }
                    },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {
                            var printable = false;
                            var editable = false;
                            // STATUS THAT CAN DELETE ARE N and T

                            // '' - NOT POSTED
                            // N  - NOT POSTED
                            // Y  - POSTED
                            // A  - AUDITED
                            // R  - RELEASED
                            // T  - RETURNED
                            // X  - VOIDED

                            if (full["post_status"].toString().trim() == "" ||
                                full["post_status"].toString().trim() == "N" ||
                                full["post_status"].toString().trim() == "T") {
                                editable = false;
                            }
                            else {
                                editable = true;
                            }
                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-info btn-sm" ng-disabled=' + editable +' ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit Record">  <i class="fa fa-edit"></i></button >' +
                                '<button type="button" class="btn btn-danger btn-sm" ng-disabled=' + editable +' ng-click="btn_delete_row(' + row["row"] + ')"  data-toggle="tooltip" data-placement="top" title="Delete"> <i class="fa fa-trash"></i></button>' +
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



    function init()
    {
        var curr_year   = new Date().getFullYear().toString();
        s.ddl_year      = curr_year
        s.rowLen = "10"
        s.currentMonth = new Date().getMonth() + 1
        s.ddl_month = datestring(s.currentMonth.toString())

        RetrieveYear();
        init_table_data([]);
        $('#loading_msg').html("LOADING");
        $("#modal_loading").modal();
        var trk_year = s.track_year
        h.post("../cSSPHICPayReg_DTL/InitializePage").then(function (d)
        {
            if (d.data.data.length > 0)
            {
                if (d.data.preval[10].toString() == "" ||
                    d.data.preval[10].toString() == "N" ||
                    d.data.preval[10].toString() == "T") {
                    s.isshow_add = false;
                }
                else {
                    s.isshow_add = true;
                }

                s.payroll_year  = d.data.preval[0].toString()
                s.payroll_month = d.data.preval[1].toString()

                s.grouplist = d.data.deplist;
                s.ddl_department = d.data.preval[12].toString()
                s.datalistgrid_data = d.data.data;
                s.datalistgrid_data.refreshTable('oTable', '');
                s.txtb_year = d.data.preval[0].toString()
                s.txtb_month = d.data.preval[2].toString()
                s.txtb_group_class = d.data.preval[4].toString()
                s.txtb_group_descr = d.data.preval[6].toString()
                s.txtb_payroll_registry_nbr = d.data.preval[9].toString()
                $("#modal_loading").modal('hide');
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

    //***********************************************************//
    //*** VJA - 02/29/2020 - Get Page Row
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

    function elEmpty(data)
    {
        if (data == null || data == "" || data == undefined) {
            return true
        }
        else {
            return false
        }
    }

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
    function currency_noround(d) {

        var retdata = ""
        if (d == null || d == "" || d == undefined) {
            return retdata = "0.00"
        }
        else
        {

            retdata = Math.floor(d * 100) / 100
            retdata = parseFloat(retdata).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
            return retdata
        }
    }
    
    //*********************************************//
    //*** VJA - 02/29/2020 - Button Edit Action
    //*********************************************// 
    s.btn_edit_action = function (lst)
    {
        ClearEntry();
        $('#btn_save').attr('ngx-data', lst);
        s.ADDEDITMODE = "EDIT";
        console.log(s.datalistgrid_data[lst])
        s.empl_name = false
        s.txtb_employee_name    = s.datalistgrid_data[lst].employee_name;
        s.txtb_empl_id          = s.datalistgrid_data[lst].empl_id;
        s.txtb_position         = s.datalistgrid_data[lst].position_short_title;
        s.txtb_department       = s.datalistgrid_data[lst].department_name1;
       
        s.txtb_empl_share       = s.datalistgrid_data[lst].empl_no_share;
        s.txtb_gross            = currency(s.datalistgrid_data[lst].gross_pay);
        s.txtb_wtax_perc        = s.datalistgrid_data[lst].wtax_perc;
        s.txtb_wtax_amt         = currency(s.datalistgrid_data[lst].wtax);
        s.txtb_btax_perc        = s.datalistgrid_data[lst].btax_perc;
        s.txtb_btax_amt         = currency(s.datalistgrid_data[lst].btax);
        s.txtb_net_pay          = currency(s.datalistgrid_data[lst].net_pay);
        s.txtb_wtax_2perc       = currency(s.datalistgrid_data[lst].wtax_2perc );
        s.txtb_wtax_3perc       = currency(s.datalistgrid_data[lst].wtax_3perc );
        s.txtb_wtax_5perc       = currency(s.datalistgrid_data[lst].wtax_5perc );
        s.txtb_wtax_8perc       = currency(s.datalistgrid_data[lst].wtax_8perc );
        s.txtb_wtax_10perc      = currency(s.datalistgrid_data[lst].wtax_10perc);
        s.txtb_wtax_15perc      = currency(s.datalistgrid_data[lst].wtax_15perc);

        if (s.datalistgrid_data[lst].employment_type == "JO") {
            s.isshow_wtax_perc = false;
            //s.isdisable = true;

        } else
        {
            s.isshow_wtax_perc = true;
           // s.isdisable = false;
        }

        if (s.datalistgrid_data[lst].rate_basis == "H") {
            s.lbl_rate_amount = "Hourly Rate :"
            s.txtb_rate_amount = s.datalistgrid_data[lst].hourly_rate;
        } else if (s.datalistgrid_data[lst].rate_basis == "M") {
            s.lbl_rate_amount = "Monthly Rate :"
            s.txtb_rate_amount = s.datalistgrid_data[lst].monthly_rate;
        } else if (s.datalistgrid_data[lst].rate_basis == "D") {
            s.lbl_rate_amount = "Daily Rate :"
            s.txtb_rate_amount = s.datalistgrid_data[lst].daily_rate;
        }
        else
        {
            s.lbl_rate_amount = "Rate Amount :"
            s.txtb_rate_amount = s.datalistgrid_data[lst].daily_rate;
        }

        s.RetrieveTax();

        // BEGIN - Toogle the Textboxes, Button and Dropdownlist if the Status are ; 
        ToogleEnableVisible(s.datalistgrid_data[lst].post_status.toString().trim())
        s.message_descr = "This Payroll already " + s.datalistgrid_data[lst].post_status_descr + ", you cannot Save/Update/Add/Delete !"
        // END   - Toogle the Textboxes, Button and Dropdownlist if the Status are ; 

        s.ModalTitle = "View Record";
        s.employment_type = s.datalistgrid_data[lst].employment_type

        $('#main_modal').modal({ keyboard: false, backdrop: "static" });
    }
    //*********************************************//
    //*** VJA - 02/29/2020 - Clear Entry
    //*********************************************// 
    function ClearEntry()
    {
        s.txtb_employee_name    = "";
        s.txtb_empl_id          = "";
        s.txtb_position         = "";
        s.txtb_department       = "";
        s.txtb_empl_share       = "";
        s.txtb_gross            = "0.00";
        s.txtb_wtax_perc        = "0.00";
        s.txtb_wtax_amt         = "0.00";
        s.txtb_btax_perc        = "0.00";
        s.txtb_btax_amt         = "0.00";
        s.txtb_net_pay          = "0.00";
        s.lbl_rate_amount       = "";
        s.txtb_rate_amount      = "0.00";
        s.txtb_wtax_2perc       = "0.00";
        s.txtb_wtax_3perc       = "0.00";
        s.txtb_wtax_5perc       = "0.00";
        s.txtb_wtax_8perc       = "0.00";
        s.txtb_wtax_10perc      = "0.00";
        s.txtb_wtax_15perc      = "0.00";
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
    s.btn_save_click = function () {
        if (ValidateFields()) {
            var data =
            {
                 payroll_year            : s.txtb_year
                , payroll_registry_nbr   : s.txtb_payroll_registry_nbr
                , empl_id                : s.txtb_empl_id
                , empl_no_share          : s.txtb_empl_share
                , gross_pay              : s.txtb_gross.replace(",","")
                , net_pay                : s.txtb_net_pay.replace(",","")
                , wtax_perc              : s.txtb_wtax_perc
                , wtax                   : s.txtb_wtax_amt.replace(",","")
                , btax_perc              : s.txtb_btax_perc
                , btax                   : s.txtb_btax_amt.replace(",","")
                , wtax_2perc             : s.txtb_wtax_2perc.replace(",","")  
                , wtax_3perc             : s.txtb_wtax_3perc.replace(",","")  
                , wtax_5perc             : s.txtb_wtax_5perc.replace(",","")  
                , wtax_8perc             : s.txtb_wtax_8perc.replace(",","")  
                , wtax_10perc            : s.txtb_wtax_10perc.replace(",","") 
                , wtax_15perc            : s.txtb_wtax_15perc.replace(",","") 
            };
           // console.log(data)
            if (s.ADDEDITMODE == "ADD") {
                $('#i_save').removeClass('fa-save');
                $('#i_save').addClass('fa-spinner fa-spin');
                h.post("../cSSPHICPayReg_DTL/SaveFromDatabase", { data: data }).then(function (d) {
                    if (d.data.message == "success") {
                        data.employee_name = $('#ddl_empl_name option:selected').text()
                        data.position_short_title = s.txtb_position
                        data.rate_basis_descr   = s.lbl_rate_amount
                        data.hourly_rate        = s.txtb_rate_amount
                        data.monthly_rate        = s.txtb_rate_amount
                        data.daily_rate        = s.txtb_rate_amount
                        data.post_status        = "N"
                        data.employment_type    = s.employment_type
                        data.rate_basis         = s.rate_basis

                        // if (s.rate_basis == "H") {
                        //     s.txtb_rate_amount  = s.datalistgrid_data[lst].hourly_rate;
                        // } else if (s.rate_basis == "M") {
                        //     s.txtb_rate_amount = s.datalistgrid_data[lst].monthly_rate;
                        // } else if (s.rate_basis == "D") {
                        //     s.txtb_rate_amount = s.datalistgrid_data[lst].daily_rate;
                        // }

                        s.datalistgrid_data.push(data)
                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid_data);
                        for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                            if (get_page(s.txtb_empl_id) == false) {
                                s.oTable.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }

                        $('#main_modal').modal("hide");
                        swal("Your record has been saved!", d.data.message_oth, { icon: "success" });
                    } else {
                        swal(d.data.message, d.data.message_oth, { icon: "error", });
                    }

                    $('#i_save').addClass('fa-save');
                    $('#i_save').removeClass('fa-spinner fa-spin');
                });
            }
            else if (s.ADDEDITMODE == "EDIT")
            {
                $('#i_save').removeClass('fa-save');
                $('#i_save').addClass('fa-spinner fa-spin');

                h.post("../cSSPHICPayReg_DTL/UpdateFromDatabase", { data: data }).then(function (d) {
                    if (d.data.message == "success") {

                        var index_of_row = $('#btn_save').attr('ngx-data');
                        //console.log(currency(s.txtb_gross.replace(",", "")))
                        s.datalistgrid_data[index_of_row].employee_name         = s.txtb_employee_name
                        s.datalistgrid_data[index_of_row].gross_pay             = s.txtb_gross.replace(",", "")
                        s.datalistgrid_data[index_of_row].net_pay               = s.txtb_net_pay.replace(",", "")
                        s.datalistgrid_data[index_of_row].position_short_title  = s.txtb_position
                        s.datalistgrid_data[index_of_row].wtax                  = s.txtb_wtax_amt.replace(",", "")
                        s.datalistgrid_data[index_of_row].btax                  = s.txtb_btax_amt.replace(",", "")
                        s.datalistgrid_data[index_of_row].wtax_perc             = data.wtax_perc
                        s.datalistgrid_data[index_of_row].btax_perc             = data.btax_perc
                        s.datalistgrid_data[index_of_row].wtax_2perc            = data.wtax_2perc.replace(",","")
                        s.datalistgrid_data[index_of_row].wtax_3perc            = data.wtax_3perc.replace(",","")
                        s.datalistgrid_data[index_of_row].wtax_5perc            = data.wtax_5perc.replace(",","")
                        s.datalistgrid_data[index_of_row].wtax_8perc            = data.wtax_8perc.replace(",","")
                        s.datalistgrid_data[index_of_row].wtax_10perc           = data.wtax_10perc.replace(",","")
                        s.datalistgrid_data[index_of_row].wtax_15perc           = data.wtax_15perc.replace(",","") 
                        s.datalistgrid_data[index_of_row].rate_basis_descr      = s.lbl_rate_descr
                        s.datalistgrid_data[index_of_row].rate_amount           = s.txtb_rate_amount
                        //console.log(s.datalistgrid_data[index_of_row].gross_pay)

                        s.oTable.fnClearTable();
                        s.oTable.fnAddData(s.datalistgrid_data);
                        //console.log(s.datalistgrid_data)

                        for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                            if (get_page(s.txtb_empl_id) == false) {
                                s.oTable.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }

                        $('#main_modal').modal("hide");
                        swal("Your record has been saved!", { icon: "success", });

                    }
                    else {
                        swal(d.data.message, { icon: "error", });
                    }

                    $('#i_save').addClass('fa-save');
                    $('#i_save').removeClass('fa-spinner fa-spin');
                });
            }

            //console.log(data)
        }

    }
    //***********************************************************//
    //***VJA - 02/29/2020 -  Field validation everytime generation 
    //                          button is click ***//
    //***********************************************************// 
    function ValidateFields() {
        var return_val = true;
        ValidationResultColor("ALL", false);
        
        if ($('#txtb_wtax_perc').val().trim() == "") {
            ValidationResultColor("txtb_wtax_perc", true);
            return_val = false;
        } else if (checkisvalidnumber($('#txtb_wtax_perc').val().trim()) == false) {
            $("#txtb_wtax_perc").addClass("required");
            $("#lbl_txtb_wtax_perc_req").text("Invalid Number !");
            return_val = false;
        }

        if ($('#txtb_btax_perc').val().trim() == "") {
            ValidationResultColor("txtb_btax_perc", true);
            return_val = false;
        } else if (checkisvalidnumber($('#txtb_btax_perc').val().trim()) == false) {
            $("#txtb_btax_perc").addClass("required");
            $("#lbl_txtb_btax_perc_req").text("Invalid Number !");
            return_val = false;
        }
        if ($('#txtb_wtax_2perc').val().trim() == "") {
            ValidationResultColor("txtb_wtax_2perc", true);
            return_val = false;
        } else if (checkisvalidnumber($('#txtb_wtax_2perc').val().trim()) == false) {
            $("#txtb_wtax_2perc").addClass("required");
            $("#lbl_txtb_wtax_2perc_req").text("Invalid Number !");
            return_val = false;
        }
        if ($('#txtb_wtax_3perc').val().trim() == "") {
            ValidationResultColor("txtb_wtax_3perc", true);
            return_val = false;
        } else if (checkisvalidnumber($('#txtb_wtax_3perc').val().trim()) == false) {
            $("#txtb_wtax_3perc").addClass("required");
            $("#lbl_txtb_wtax_3perc_req").text("Invalid Number !");
            return_val = false;
        }
        if ($('#txtb_wtax_5perc').val().trim() == "") {
            ValidationResultColor("txtb_wtax_5perc", true);
            return_val = false;
        } else if (checkisvalidnumber($('#txtb_wtax_5perc').val().trim()) == false) {
            $("#txtb_wtax_5perc").addClass("required");
            $("#lbl_txtb_wtax_5perc_req").text("Invalid Number !");
            return_val = false;
        }
        if ($('#txtb_wtax_8perc').val().trim() == "") {
            ValidationResultColor("txtb_wtax_8perc", true);
            return_val = false;
        } else if (checkisvalidnumber($('#txtb_wtax_8perc').val().trim()) == false) {
            $("#txtb_wtax_8perc").addClass("required");
            $("#lbl_txtb_wtax_8perc_req").text("Invalid Number !");
            return_val = false;
        }
        if ($('#txtb_wtax_10perc').val().trim() == "") {
            ValidationResultColor("txtb_wtax_10perc", true);
            return_val = false;
        } else if (checkisvalidnumber($('#txtb_wtax_10perc').val().trim()) == false) {
            $("#txtb_wtax_10perc").addClass("required");
            $("#lbl_txtb_wtax_10perc_req").text("Invalid Number !");
            return_val = false;
        }
        if ($('#txtb_wtax_15perc').val().trim() == "") {
            ValidationResultColor("txtb_wtax_15perc", true);
            return_val = false;
        } else if (checkisvalidnumber($('#txtb_wtax_15perc').val().trim()) == false) {
            $("#txtb_wtax_15perc").addClass("required");
            $("#lbl_txtb_wtax_15perc_req").text("Invalid Number !");
            return_val = false;
        }

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
            $("#txtb_wtax_3perc").removeClass("required");
            $("#lbl_txtb_wtax_3perc_req").text("");
            $("#txtb_wtax_5perc").removeClass("required");
            $("#lbl_txtb_wtax_5perc_req").text("");
            $("#txtb_wtax_8perc").removeClass("required");
            $("#lbl_txtb_wtax_8perc_req").text("");
            $("#txtb_wtax_10perc").removeClass("required");
            $("#lbl_txtb_wtax_10perc_req").text("");
            $("#txtb_wtax_15perc").removeClass("required");
            $("#lbl_txtb_wtax_15perc_req").text("");
            

        }
    }
    //************************************************//
    //***VJA - 02/29/2020 - Validation for Nunber****//
    //**********************************************//
    s.calculate_all = function ()
    {
        if (ValidateFields())
        {
            var total_gross = parseFloat(s.txtb_gross.replace(",", "").replace(",", "").replace(",", ""));
            var total_net_pay = 0;
            var total_wtax = 0;
            var total_bwtax = 0;

            var total_wtax_perc = 0;

            if (s.employment_type == "JO")
            {
                total_wtax_perc = total_wtax_perc + parseFloat(s.txtb_wtax_2perc.replace(",", "").replace(",", "").replace(",", ""));
                total_wtax_perc = total_wtax_perc + parseFloat(s.txtb_wtax_3perc.replace(",", "").replace(",", "").replace(",", ""));
                total_wtax_perc = total_wtax_perc + parseFloat(s.txtb_wtax_5perc.replace(",", "").replace(",", "").replace(",", ""));
                total_wtax_perc = total_wtax_perc + parseFloat(s.txtb_wtax_8perc.replace(",", "").replace(",", "").replace(",", ""));
                total_wtax_perc = total_wtax_perc + parseFloat(s.txtb_wtax_10perc.replace(",", "").replace(",", "").replace(",", ""));
                total_wtax_perc = total_wtax_perc + parseFloat(s.txtb_wtax_15perc.replace(",", "").replace(",", "").replace(",", ""));
                total_wtax = total_wtax_perc
                s.txtb_wtax_amt = currency(total_wtax)
            }
            else
            {
                total_wtax = total_gross * (parseFloat(s.txtb_wtax_perc) / 100)
                s.txtb_wtax_amt = currency(total_wtax)
            }
            
            total_bwtax = total_gross * (parseFloat(s.txtb_btax_perc) / 100)
            s.txtb_btax_amt = currency(total_bwtax)

            total_net_pay = total_gross - (total_wtax + total_bwtax)
            s.txtb_net_pay = currency(total_net_pay)
        }
    }
    //************************************************//
    //***VJA - 02/29/2020 - Validation for Nunber****//
    //**********************************************//
    function checkisvalidnumber(i) {
        var regex_spchar = /[^a-zA-Z0-9\s]\.\,/;
        var regex_upper = /[A-Z]/;
        var regex_lower = /[a-z]/;
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
     //***********************************************//
    //***VJA - 02/29/2020 - Back to Header       ****//
    //**********************************************//
    s.btn_back = function ()
    {
        location.href = "cSSPHICPayReg"
    }
    //******************************************************************//
    //*** VJA - 2020-04-03 - Toogle Generate Button
    //*****************************************************************//
    function ToogleEnableVisible(var_status) {
        // '' - NOT POSTED
        // N  - NOT POSTED
        // Y  - POSTED
        // A  - AUDITED
        // R  - RELEASED
        // T  - RETURNED
        // X  - VOIDED  

        if (var_status == "" ||
            var_status == "N" ||
            var_status == "T") {
            s.isshow = false;
            s.isdisable = false;
        }
        else {
            s.isshow = true;
            s.isdisable = true;
        }

    }

    //***********************************************************//
    //*** VJA - 03/11/2020 - Occure when add button is clicked and initialize the objects
    //***********************************************************// 
    s.btn_add_click = function () {
        $('#i_save').addClass('fa-save');
        $('#i_save').removeClass('fa-spinner fa-spin');
        ClearEntry();
        s.empl_name = true
        s.ModalTitle = "Add New Record";
        s.ADDEDITMODE = "ADD";
        s.lbl_rate_amount = "Monthly Rate :"

        s.RetrieveTax();

        $("#modal_loading").modal();
        h.post("../cSSPHICPayReg_DTL/RetrieveEmpl").then(function (d) {
            s.emplist = d.data.emplist
            $("#modal_loading").modal('hide');
            $('#main_modal').modal({ keyboard: false, backdrop: "static" });
        })

    }
    //******************************************************************//
    //*** VJA - 2020-04-08 - On-Change on Dropdownlist for Employee Name
    //*****************************************************************//
    s.set_empl_name_index = function (par_index)
    {
        //console.log(s.emplist[par_index])
        if (par_index != "")
        {
            s.txtb_employee_name    = s.emplist[par_index].employee_name;
            s.txtb_empl_id          = s.emplist[par_index].empl_id;
            s.txtb_position         = s.emplist[par_index].position_short_title;
            //s.txtb_department       = s.emplist[par_index].department_name1;
       
            s.txtb_empl_share       = s.emplist[par_index].empl_no_share;
            s.txtb_gross            = currency(s.emplist[par_index].gross_pay);
            s.txtb_wtax_perc        = s.emplist[par_index].wtax_perc;
            s.txtb_btax_perc        = s.emplist[par_index].btax_perc;
            // s.txtb_wtax_2perc       = s.emplist[par_index].wtax_2perc ;
            // s.txtb_wtax_3perc       = s.emplist[par_index].wtax_3perc ;
            // s.txtb_wtax_5perc       = s.emplist[par_index].wtax_5perc ;
            // s.txtb_wtax_8perc       = s.emplist[par_index].wtax_8perc ;
            // s.txtb_wtax_10perc      = s.emplist[par_index].wtax_10perc;
            // s.txtb_wtax_15perc      = s.emplist[par_index].wtax_15perc;


            if (s.emplist[par_index].rate_basis == "H") {
                s.lbl_rate_amount = "Hourly Rate :"
                s.txtb_rate_amount = s.emplist[par_index].hourly_rate;
            } else if (s.emplist[par_index].rate_basis == "M") {
                s.lbl_rate_amount = "Monthly Rate :"
                s.txtb_rate_amount = s.emplist[par_index].monthly_rate;
            } else if (s.emplist[par_index].rate_basis == "D") {
                s.lbl_rate_amount = "Daily Rate :"
                s.txtb_rate_amount = s.emplist[par_index].daily_rate;
            }
            else
            {
                s.lbl_rate_amount = "Rate Amount :"
                s.txtb_rate_amount = s.emplist[par_index].daily_rate;
            }
            s.employment_type = s.emplist[par_index].employment_type
            if (s.emplist[par_index].employment_type == "JO") {
                s.isshow_wtax_perc = false;
               // s.isdisable = true;

            } else {
                s.isshow_wtax_perc = true;
               // s.isdisable = false;
            }

            s.rate_basis = s.emplist[par_index].rate_basis

            s.calculate_all()
        }
        else
        {
            ClearEntry();
            s.lbl_rate_amount = "Monthly Rate :"
        }
    }
    //***********************************************************//
    //*** VJA - 2020-04-08 -  Edit Action Occurred function click
    //***********************************************************// 
    s.btn_delete_row = function (id_ss) {
        console.log(id_ss)
        swal({
            title: "Are you sure to delete this record?",
            text: "Once deleted, you will not be able to recover this record !",
            icon: "warning",
            buttons: true,
            dangerMode: true,

        })
            .then(function (willDelete) {
                if (willDelete) {
                    h.post("../cSSPHICPayReg_DTL/DeleteFromDatabase",
                        {
                            par_empl_id: s.datalistgrid_data[id_ss].empl_id
                        }).then(function (d) {

                            if (d.data.message == "success") {
                                s.datalistgrid_data = s.datalistgrid_data.remove(s.datalistgrid_data[id_ss].empl_id, "empl_id");
                                if (s.datalistgrid_data.length != 0) {
                                    s.oTable.fnClearTable();
                                    s.oTable.fnAddData(s.datalistgrid_data);
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

    //***********************************//
    //***VJA - 2020-04-08 - Remove Function****//
    //***********************************// 
    Array.prototype.remove = function (code, prop) {
        return this.filter(function (d) {
            return d[prop] != code
        })
    }

    s.RetrieveTax = function()
    {
        var var_date            = new Date(s.payroll_year + "-" + s.payroll_month + "-01");
        var var_tax_eff_date    = new Date("2021-03-30");

        if (var_date > var_tax_eff_date && var_date < new Date("2023-07-01"))
        {
            $('#lbl_wtax_1_3perc').text('W/H Tax 1% Amt.:')
            $('#lbl_wtax_8_5vatperc').text('W/H Tax 8% Amt.:')
        }
        else
        {
            $('#lbl_wtax_1_3perc').text('W/H Tax 3% Amt.:')
            $('#lbl_wtax_8_5vatperc').text('W/H Tax 5%VAT Amt.:')
        }




    }
});