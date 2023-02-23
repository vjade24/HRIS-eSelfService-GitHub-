//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Employee's Card
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JORGE RUSTOM VILLANUEVA       10/18/2019      Code Creation
//**********************************************************************************

ng_selfService_App.controller("rSSEmployeeCard_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    s.year = []
    var index_update = "";


    s.oTableRef = null;
    s.datalistgridRef = null;

    s.rowLen = "5"
    var sort_value = 1
    var sort_order = "asc"
    s.adddetails = null;
    s.isAction = "";
    s.ishowsave = true

    s.allow_delete = false
    s.allow_edit = false

    s.image_source = "~/ResourcesImages/upload_profile.png"
    function init() {

        $("#loading_data").modal("show")


        h.post("../rSSEmployeeCard/InitializeData").then(function (d) {
            RetrieveYear();

            if (d.data.empl_id == null || d.data.empl_id == '' || d.data.empl_id == 'undefined')
            {
                location.href = "../Login/Index"
            }

            else
            {
                s.txtb_empl_id = d.data.empl_id
            }

            s.allow_delete = d.data.um.allow_delete
            s.allow_edit = d.data.um.allow_edit
            s.ddl_year = new Date().getFullYear().toString()
            s.ddl_month = MonthFormat((new Date().getMonth() + 1))
            s.txtb_empl_name = d.data.um.username
            $("#loading_data").modal("hide")
        })


        $("#loading_data").modal("hide")
    }

    init()

    //************************************//
    //***Select-Year-DropDown****//
    //************************************// 
    function RetrieveYear() {

        var currentYear = new Date().getFullYear();

        var prev_year = currentYear - 5;
        for (var i = 1; i <= 8; i++) {
            var data = { "year": prev_year }
            s.year.push(data)
            prev_year++;
        }

    }

    function MonthFormat(number) {
        return (number < 10 ? '0' : '') + number
    }

    function isDataValidated() {
        var return_val = true
        FieldValidationColorChanged(false, "ALL");

        if ($("#ddl_year").val() == "") {
            FieldValidationColorChanged(true, "ddl_year");
            return_val = false;
        }

        return return_val

    }

    //**************************************//
    //***Field-Validation-Color-Changed-****//
    //**************************************//
    function FieldValidationColorChanged(pMode, pObjectName) {

        if (pMode)
            switch (pObjectName) {

                case "ddl_year":
                    {
                        $("#ddl_year").addClass('require-field')
                        s.lbl_requiredfield1 = "required field!"
                        break;
                    }



            }
        else if (!pMode) {
            switch (pObjectName) {

                case "ALL":
                    {
                        $("#ddl_year").removeClass('require-field')
                        s.lbl_requiredfield1 = ""

                        break;
                    }

            }
        }
    }

    //***********************************//
    //***Page-View-for-Crystal-Report****//
    //***********************************// 

    s.btn_print = function () {
        if (isDataValidated()) {
            var controller = "Reports";
            var action = "Index";
            var ReportName = "cryEmployeeCard";
            var SaveName = "Crystal_Report";
            var ReportType = "inline";
            var ReportPath = "~/Reports/cryEmployeeCard/cryEmployeeCard.rpt";
            var sp = "sp_employeecard_re_ce_rep"
            var parameters = "par_payroll_year," + $("#ddl_year option:selected").val() + ",par_empl_id," + s.txtb_empl_id + ",par_period_from," + $("#txtb_period_from").val() + ",par_period_to," + $("#txtb_period_to").val()
            $('#modal_generating_report').modal("hide");
            h.post("../rSSEmployeeCard/SetHistoryPage", {
                par_empl_id: s.txtb_empl_id
                ,par_payroll_year: $("#ddl_year option:selected").val()
                ,par_period_from: $("#txtb_period_from").val()
                ,par_period_to: $("#txtb_period_to").val()

            }).then(function (d) {
                if (d.data.sp_employeecard_re_ce_rep.length > 0) {
                    location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                        + "&SaveName=" + SaveName
                        + "&ReportType=" + ReportType
                        + "&ReportPath=" + ReportPath
                        + "&Sp=" + sp + "," + parameters
                }

                else {
                    swal({
                        title: "Not Data Found!",
                        text: "No Data for Printing!",
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,
                    })
                }

            });
        }

    }






    //***************************Functions end*********************************************************//

})


