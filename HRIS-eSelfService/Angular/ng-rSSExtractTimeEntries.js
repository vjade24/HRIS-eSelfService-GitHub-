/*
 * Script created By:       Jorge Rustom Villanueva
 * Script created On:       09/15/2020
 * Purpose of this Script:  
 *                          
*/
ng_selfService_App.controller("rSSExtractTimeEntries_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope;
    var h = $http;
    s.year = [];
    s.ddl_month = [];
    s.division_list_temp = [];
    s.section_list_temp = [];
    function init() {

        $("#ddl_subdepartment").select2({
            placeholder: "Select Subdepartment. . . ",
            allowClear: true,
            //dropdownParent: $("#main_modal")
        });

        $("#ddl_division").select2({
            placeholder: "Select Division. . . ",
            allowClear: true,
        });

        $("#ddl_section").select2({
            placeholder: "Select Section. . . ",
            allowClear: true,
        });
        
        $("#ddl_subdepartment").select2().on('change', function (e) {
            s.getFilteredDivision();
            s.getFilteredSection();
        })

        $("#ddl_division").select2().on('change', function (e) {
            s.getFilteredSection();
        })

        $("#ddl_section").select2().on('change', function (e) {
            //s.getFilteredListEmployee();
        })

        h.post("../rSSExtractTimeEntries/InitializeData").then(function (d) {

            //d.data.session_user_id
            //d.data.session_user_profile
            s.txtb_empl_id   = d.data.session_empl_id
            s.txtb_empl_name = d.data.session_employee_name
            s.dept_list      = d.data.dept_list;
            s.subdepartment_list  = d.data.sub_dep_list;
            s.division_list  = d.data.division_list;
            s.section_list   = d.data.section_list;
            s.ddl_dept = d.data.department_dtr
            s.division_list_temp = d.data.division_list;
            s.section_list_temp = d.data.section_list;

            RetrieveYear();
            s.ddl_payroll_year = d.data.year_dtr
            s.ddl_month = d.data.month_dtr
            s.ddl_viewtype = d.data.view_type
        });
    }
    init()
    //************************************//
    //***Select-Employment-Type-DropDown****//
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

    s.getFilteredDivision = function () {
        var tempX = s.division_list_temp;
        s.division_list = null;
        s.ddl_division = "";
        console.log(tempX.selectX($('#ddl_subdepartment').val().toString().trim(), 'subdepartment_code'))
        $('#ddl_division').val("").trigger('change');
        s.division_list = tempX.selectX($('#ddl_subdepartment').val().toString().trim(), 'subdepartment_code');
        $('#ddl_division').select2('destroy');
        $('#ddl_division').select2();
        $('#ddl_division').click();
        //LAST
    }

    s.getFilteredSection = function () {
        var tempX = s.section_list_temp;
        s.section_list = [];
        $('#ddl_section').val("").trigger('change');
        //var $('#ddl_division').val().toString().trim()
        s.section_list = tempX.selectX($('#ddl_division').val().toString().trim(), "division_code");
        $('#ddl_section').select2('destroy');
        $('#ddl_section').select2();
        s.ddl_section = "";
        $('#ddl_section').val("").trigger('change');
        $('#ddl_section').click();
    }


    s.btn_print = function () {
        $("#extracting_data").modal("show");
        h.post("../rSSExtractTimeEntries/RetriveData",
            {
                par_year: $("#ddl_payroll_year").val()
                , par_month: $("#ddl_month").val()
                , par_department_code: $("#ddl_dept").val()
                , par_sub_department_code: $("#ddl_subdepartment").val()
                , par_division_code: $("#ddl_division").val()
                , par_section_code: $("#ddl_section").val()
            }).then(function (d) {

                if (d.data.message == "success") {
                    $("#extracting_data").modal("hide");
                    window.open(d.data.filePath, '', '');
                }
                else {

                    $("#extracting_data").modal("hide");
                    swal(d.data.message, { icon: "error" });
                }


            })
    }

    Array.prototype.selectX = function (code, prop) {
        return this.filter(function (d, k) {
            return d[prop] === code
        }) != null ? this.filter(function (d, k) {
            return d[prop] === code
        }) : [];
    }



});