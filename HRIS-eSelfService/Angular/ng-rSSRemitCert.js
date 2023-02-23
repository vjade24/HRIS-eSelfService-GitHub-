/*
 * Script created By:       Vincent Jade H. Alivio
 * Script created On:       01/09/2020
 * Purpose of this Script:  
 *                          
*/
ng_selfService_App.controller("rSSRemitCert_ctrl", function ($scope, $compile, $http, $filter) {
    var s = $scope;
    var h = $http;
    s.year                  = [];
    s.ddl_month             = [];
    s.remittance_type_list  = [];
    s.ddl_remittance_type   = "";
    s.txtb_period_from      = "";
    s.txtb_period_to        = "";

    function init()
    {
        h.post("../rSSRemitCert/InitializeData").then(function (d) {

            s.txtb_empl_id          = d.data.session_empl_id;
            s.txtb_empl_name        = d.data.session_employee_name;
            s.remittance_type_list = d.data.remittancetype_list;
            console.log(d.data.prevVal);
            if (d.data.prevVal != null && d.data.prevVal.length > 0 )
            {
                s.ddl_remittance_type   = d.data.prevVal[0];
                s.txtb_period_from      = d.data.prevVal[1];
                s.txtb_period_to        = d.data.prevVal[2];
                $('#txtb_period_from').val(d.data.prevVal[1]);
                $('#txtb_period_to').val(d.data.prevVal[2]);
            }
            else RetrieveYear();
        });
    }
    init();

    //**************************************//
    //***Select-Employment-Type-DropDown****//
    //**************************************// 
    function RetrieveYear()
    {

        var currentYear = new Date().getFullYear();
        var currentMoth_X = new Date().getMonth() + 1;
        var currentDate = new Date().getDate();

        var currentMoth = currentMoth_X.toString().length < 10 ? ('0' + currentMoth_X).toString() : currentMoth_X;
        var date_form = currentYear + "-" + currentMoth + "-" + currentDate;

        var int_d = new Date(currentYear, currentMoth_X, 0);
        var date_to = currentYear + "-" + currentMoth + "-" + int_d.getDate();
        s.txtb_period_from  = date_form;
        s.txtb_period_to    = date_to;
        $('#txtb_period_from').val(date_form);
        $('#txtb_period_to').val(date_to);

    }


    s.btn_print = function ()
    {
        changeColor("ALL", false);
        if (validate())
        {

        
            h.post("../rSSRemitCert/RetriveData",
            {
                
                  par_remittance_code: s.ddl_remittance_type
                , par_empl_id        : s.txtb_empl_id
                , par_period_from    : $('#txtb_period_from').val()
                , par_period_to      : $('#txtb_period_to').val()
            }).then(function (d)
            {
                if (d.data.sp_report.length == 0)
                {
                    swal("No Data Found For Printing", { icon: "warning" });
                }
                else
                {
                    //alert(d.data.session_employment_type)
                    var controller  = "Reports"
                    var action      = "Index"
                    var ReportName  = "CrystalReport"
                    var SaveName    = "Crystal_Report"
                    var ReportType  = "inline"
                    var ReportPath  = ""
                    var sp          = ""

                    ReportPath = "~/Reports/cryRemittanceCert/cryRemittanceCERT.rpt"
                    sp = "sp_remittance_cert_rep,p_remittancetype_code," + s.ddl_remittance_type + ",p_empl_id," + s.txtb_empl_id + ",p_period_from," + $('#txtb_period_from').val() + ",p_period_to," + $('#txtb_period_to').val();

                    location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                        + "&SaveName="   + SaveName
                        + "&ReportType=" + ReportType
                        + "&ReportPath=" + ReportPath
                        + "&Sp="         + sp


                }

            })
        }
    }


    function validate()
    {
        var return_val = true;

        if (s.ddl_remittance_type == "")
        {
            changeColor("ddl_remittance_type", true);
            return_val = false;
        }

        if ($('#txtb_period_from').val() == "") {
            changeColor("txtb_period_from", true);
            return_val = false;
        }

        if ($('#txtb_period_to').val() == "")
        {
            changeColor("txtb_period_to", true);
            return_val = false;
        }

        return return_val;
    }

    function changeColor(var_object, var_req)
    {
        if (var_req == true)
        {
            $('#' + var_object).addClass('required');
            $('#lbl_' + var_object).html("Required");

        }
        else
        {
            $('#ddl_remittance_type').removeClass('required');
            $('#lbl_ddl_remittance_type').html("");

            $('#txtb_period_from').removeClass('required');
            $('#lbl_txtb_period_from').html("");

            $('#txtb_period_to').removeClass('required');
            $('#lbl_txtb_period_to').html("");
        }
    }
});