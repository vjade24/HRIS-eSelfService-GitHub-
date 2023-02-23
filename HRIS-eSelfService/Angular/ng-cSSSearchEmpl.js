//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Re Org
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// MARVIN OLITA.      02/12/2020      Code Creation
//**********************************************************************************
ng_selfService_App.controller("cSSSearchEmpl_ctrl", function (commonScript,$scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http
    var cs = commonScript
    var userid = "";
    s.year = [];
    s.rowLen = "10";
    s.searchEmployee_Data_orig = []
    var Init_searchemployee_Grid = function (par_data) {
        s.searchEmployee_Data = par_data;
        s.searchEmployee_Tbl = $('#find_empl_grid').dataTable(
            {

                data: s.searchEmployee_Data,
                sDom: 'rt<"bottom"p>',
                pageLength: 10,
                columns: [
                    {
                        "mData": "empl_id",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data + "</span>"
                        }
                    },
                   
                    {
                        "mData": "employee_name",
                        //"sWidth": "5%",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data + "</span>"
                        }
                    },
                    
                    {
                        "mData": "department_name1",
                        //"sWidth": "10%",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>" + data + "&nbsp;</span>"
                        }
                    },
                    {
                        "mData": "position_long_title",
                        //"sWidth": "30%",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>&nbsp;" + data + "</span>"
                        }
                    },
                    {
                        "mData": "salary_amount",
                        //"sWidth": "30%",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-left btn-block'>&nbsp;" + data + "</span>"
                        }
                    },
                    {
                        "mData": null,
                        //"sWidth": "5%",
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {

                            return '<center><div class="btn-group">' +
                                '<button type="button" class="btn btn-warning btn-sm action" ng-click="btn_details(' + row["row"] + ')"  data-toggle="tooltip" data-placement="top" title="Details"> <i class="fa fa-plus"></i> </button>' +
                                '</div></center>';

                        }
                    }

                ],
                "createdRow": function (row, data, index) {
                    $(row).addClass("dt-row");
                    $compile(row)($scope);  //add this to compile the DOM
                },
                // scrollY: "50vh",
                // scrollCollapse: true,

            });

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }


    //Object {
    // empl_id: "8362",
    // employee_name: "COLITA, ARDELYN F. ", employment_type_descr: "Job Order", …
    //}
    //department_name1: "DAVAO DE ORO PROVINCIAL HOSPITAL (DDOPH) - LAAK"
    //empl_id: "8362"
    //employee_name: "COLITA, ARDELYN F. "
    //employment_type_descr: "Job Order"
    //position_long_title: "Nurse I"
    //rate_basis_descr: "Daily"
    //salary_amount: "843.00"



    Init_searchemployee_Grid([])
    function init() {
        
        h.post("../rSSDocTrkHistory/InitializeData", { par_year: curr_year }).then(function (d) {


            s.Dochistory_Data = d.data.trk_details
            s.Dochistory_Data.refreshTable('Dochistory_Tbl', '');

            $("#modal_loading").modal('hide');
        })
    }

    s.findEmployee = function (value) {

        var lastname = s.lastname
        var firstname = s.firstname

        h.post("../cSSSearchEmpl/findEmployee", { lastname: lastname, firstname: firstname  }).then(function (d) {
            if (d.data.icon == "success") {
                if (d.data.empl_data.length > 0) {

                
                    s.searchEmployee_Data_orig = d.data.empl_data
                    s.searchEmployee_Data = s.searchEmployee_Data_orig.refreshTable('find_empl_grid', '');
                }
                else {
                    swal('No employee with this last name:"' + lastname + '" are found in your organization!', { icon: "warning" })
                }
            }
            else {
                swal('Error: '+ d.data.message, { icon: "error" })
            }


            
          
        })
    }

   
    s.btn_details = function (row) {
        

        var dt = s.searchEmployee_Data[row]

        s.department_name1      =  dt.department_name1     
        s.empl_id               =  dt.empl_id            
        s.employee_name         =  dt.employee_name        
        s.employment_type_descr =  dt.employment_type_descr
        s.position_long_title   =  dt.position_long_title  
        s.rate_basis_descr      =  dt.rate_basis_descr     
        s.salary_amount         = dt.salary_amount   
        
        $("#details").modal("show")

    }
})

