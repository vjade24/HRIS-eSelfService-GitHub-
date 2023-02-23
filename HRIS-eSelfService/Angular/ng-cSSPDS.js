//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Personal Data Sheet
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JORGE RUSTOM VILLANUEVA       10/18/2019      Code Creation
//**********************************************************************************


ng_selfService_App.controller("cSSPDS_ctrlr", function ($scope, $compile, $http, $filter) {
    var s               = $scope
    var h               = $http
    s.year              = []
    s.csc_type_list     = [];
    var index_update    = "";

    var citizen_type    = false;
    var citizen_nature  = false;

    var validate_check  = false;
    s.flag = "";
    s.allow_edit         = false
    s.allow_print        = false
    s.allow_delete       = false
    s.allow_view         = false
    s.allow_edit_history = false
    s.province_list      = null;
    s.municipality_list  = null;
    s.barangay_list = null;

    s.province_list1     = null;
    s.municipality_list1 = null;
    s.barangay_list1     = null;

    s.oTableChildren        = null;
    s.datalistgridChildren  = null;

    s.oTableEducation       = null;
    s.datalistgridEducation = null;

    s.oTableEligibility     = null;
    s.datalistgridEligibility = null;

    s.oTableWorkExp = null;
    s.datalistgridWorkExp = null;

    s.oTableVolWork = null;
    s.datalistgridVolWork = null;


    s.oTableLandD = null;
    s.datalistgridLandD = null;
    
    s.datalistgridOther = null;

    s.oTableOtherSkills = null;
    s.datalistgridOtherSkills = null;

    s.oTableOtherRecognition = null;
    s.datalistgridOtherRecognition = null;

    s.oTableOtherMembership = null;
    s.datalistgridOtherMembership = null;

    s.oTableRef = null;
    s.datalistgridRef = null;

    var actionPage = "";
    s.rowLen = "10"
    s.rowLen_api = "200"
    var sort_value = 1
    var sort_order = "asc"
    s.adddetails = null;
    s.isAction = "";
    s.ishowsave = true
    var tname = ""

    s.isShowAddChild = true;
    s.isShowAddEduc = true;
    s.isShowAddCSC = true;
    s.isShowAddWorkExp = true;
    s.isShowAddVolWork = true;
    s.isShowAddLearn = true;
    s.isShowAddOther = true;
    s.isShowAddRef = true;

    s.isShowAddOtherSkills = true;
    s.isShowAddOtherRecognition = true;
    s.isShowAddOtherMembership = true;
    s.ishowContinue = true;
    s.image_source = "~/ResourcesImages/upload_profile.png"
    function init()
    {
       
        $("#loading_data").modal("show")

        
        h.post("../cSSPDS/InitializeData").then(function (d) {

            s.allow_delete = d.data.um.allow_delete
            s.allow_edit = d.data.um.allow_edit

            if (d.data.empl_id == null || d.data.empl_id == '' || d.data.empl_id == 'undefined')
            {
                location.href = "../Login/Index"
            }

            else
            {
                s.txtb_empl_id = d.data.empl_id
            }

            init_table_dataChildren([]);
            init_table_dataEducation([]);
            init_table_dataEligibility([]);
            init_table_dataWorkExp([]);
            init_table_dataVolWork([]);
            init_table_dataLandD([]);
            init_table_dataOtherSkills([]);
            init_table_dataOtherRecognition([]);
            init_table_dataOtherMembership([]);
            init_table_dataRef([]);
            
            //Added By: Joseph M. Tombo Jr. 04/14/2020
            var auto_suggest            = d.data.auto_suggest;
            var department_fm           = d.data.departments_list;
            var lnd_types               = d.data.lnd_type_list;
            var employment_status_list  = d.data.employment_status_list;
             //Added By: Joseph M. Tombo Jr. 04/15/2020
            s.csc_type_list         = d.data.csc_type_list;
            s.province_list         = d.data.province_list;
            s.municipality_list     = d.data.muni_city_list;
            s.barangay_list         = d.data.barangay_list;
            s.province_list1        = d.data.province_list;
            s.municipality_list1    = d.data.muni_city_list;
            s.barangay_list1        = d.data.barangay_list;

            autocomplete(document.getElementById('txtb_workexp_position'), auto_suggest);
            autocomplete(document.getElementById('txtb_workexp_dept'), department_fm);
            autocomplete(document.getElementById('txtb_learn_type'), lnd_types);
            autocomplete(document.getElementById('txtb_workexp_status'), employment_status_list);
        })

        $("#loading_data").modal("hide")
    }

    init()


    var init_table_dataChildren = function (par_data) {
        s.datalistgridChildren = par_data;
        s.oTableChildren = $('#datalist_gridChildren').dataTable(
            {
                data: s.datalistgridChildren,
                stateSave: false,
                sDom: 'rt<"bottom"p>',
                pageLength: 5,
                columns: [


                    {
                        "mData": "seq_no", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-center'>" + data + "</div>";
                        }
                    },

                    {
                        "mData": "children_name", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-left'>" + data + "</div>";
                        }
                    },



                    {
                        "mData": "birth_date", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-center'>" + data + "</div>";
                        }
                    },


                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {


                            return '<center><div class="btn-group tooltip-demo">'
                                + '<button type="button" class="btn btn-info btn-sm action" data-toggle="tooltip" data-placement="left" title="Edit" ng-show="' + s.allow_edit + '" ng-click="btn_edit_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-edit"></i>'
                                + '<button type="button" class="btn btn-danger btn-sm action" data-toggle="tooltip" data-placement="left" title="Delete" ng-show="' + s.allow_delete + '" ng-click="btn_delete_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-trash"></i>'
                                + '</button></div ></center >'

                        }
                    }

                ],


                "createdRow": function (row, data, index) {
                    $(row).attr('id', index);
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });

        s.oTableChildren.fnSort([[0, 'asc']]);

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }

    var init_table_dataEducation = function (par_data) {
        s.datalistgridEducation = par_data;

        s.oTableEducation = $('#datalist_gridEducation').dataTable(
            {
                data: s.datalistgridEducation,
                stateSave: false,
                sDom: 'rt<"bottom"p>',
                pageLength: 5,
                columns: [

                    {
                        "mData": "seq_no", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-center'>" + data + "</div>";
                        }
                    },

                    {
                        "mData": "educ_short_descr", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-center'>" + data + "</div>";
                        }
                    },



                    {
                        "mData": "school_name", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-left'>" + data + "</div>";
                        }
                    },

                    {
                        "mData": "basic_educ_deg", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-left'>" + data + "</div>";
                        }
                    },


                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {


                            return '<center><div class="btn-group tooltip-demo">'
                                + '<button type="button" class="btn btn-info btn-sm action" data-toggle="tooltip" data-placement="left" title="Edit" ng-show="' + s.allow_edit + '" ng-click="btn_edit_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-edit"></i>'
                                + '<button type="button" class="btn btn-danger btn-sm action" data-toggle="tooltip" data-placement="left" title="Delete" ng-show="' + s.allow_delete + '" ng-click="btn_delete_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-trash"></i>' + '</button></div ></center >'

                        }
                    }

                ],


                "createdRow": function (row, data, index) {
                    $(row).attr('id', index);
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });

        s.oTableEducation.fnSort([[0, 'asc']]);

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }

    var init_table_dataEligibility = function (par_data) {
        s.datalistgridEligibility = par_data;
        s.oTableEligibility = $('#datalist_gridEligibility').dataTable(
            {

                data: s.datalistgridEligibility,
                stateSave: false,
                sDom: 'rt<"bottom"p>',
                pageLength: 5,
                columns: [

                    {
                        "mData": "seq_no", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-center'>" + data + "</div>";
                        }
                    },

                    {
                        "mData": "cscsrvc_ra1080", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-center'>" + data + "</div>";
                        }
                    },



                    {
                        "mData": "number", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-left'>" + data + "</div>";
                        }
                    },



                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {


                            return '<center><div class="btn-group tooltip-demo">'
                                + '<button type="button" class="btn btn-info btn-sm action" data-toggle="tooltip" data-placement="left" title="Edit" ng-show="' + s.allow_edit + '" ng-click="btn_edit_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-edit"></i>'
                                + '<button type="button" class="btn btn-danger btn-sm action" data-toggle="tooltip" data-placement="left" title="Delete" ng-show="' + s.allow_delete + '" ng-click="btn_delete_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-trash"></i>' + '</button></div ></center >'

                        }
                    }

                ],


                "createdRow": function (row, data, index) {
                    $(row).attr('id', index);
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });

        s.oTableEligibility.fnSort([[0, 'asc']]);

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }

    var init_table_dataWorkExp = function (par_data) {
        s.datalistgridWorkExp = par_data;
        s.oTableWorkExp = $('#datalist_gridWorkExp').dataTable(
            {

                data: s.datalistgridWorkExp,
                stateSave: false,
                sDom: 'rt<"bottom"p>',
                pageLength: 5,
                columns: [

                    {
                        "mData": "seq_no", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-center'>" + data + "</div>";
                        }
                    },

                    {
                        "mData": "dept_agncy_offc_co", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-left'>" + data + "</div>";
                        }
                    },



                    {
                        "mData": "position_title", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-left'>" + data + "</div>";
                        }
                    },

                    {
                        "mData": "monthly_salary", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-right'>" + currency(data) + "</div>";
                        }
                    },



                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {


                            return '<center><div class="btn-group tooltip-demo">'
                                + '<button type="button" class="btn btn-info btn-sm action" data-toggle="tooltip" data-placement="left" title="Edit" ng-show="' + s.allow_edit + '" ng-click="btn_edit_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-edit"></i>'
                                + '<button type="button" class="btn btn-danger btn-sm action" data-toggle="tooltip" data-placement="left" title="Delete" ng-show="' + s.allow_delete + '" ng-click="btn_delete_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-trash"></i>' + '</button></div ></center >'

                        }
                    }

                ],


                "createdRow": function (row, data, index) {
                    $(row).attr('id', index);
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });

        s.oTableWorkExp.fnSort([[0, 'asc']]);

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }

    var init_table_dataVolWork = function (par_data) {
        s.datalistgridVolWork = par_data;
        s.oTableVolWork = $('#datalist_gridVolWork').dataTable(
            {

                data: s.datalistgridVolWork,
                stateSave: false,
                sDom: 'rt<"bottom"p>',
                pageLength: 5,
                columns: [

                    {
                        "mData": "seq_no", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-center'>" + data + "</div>";
                        }
                    },

                    {
                        "mData": "name_address_org", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-left'>" + data + "</div>";
                        }
                    },



                    {
                        "mData": "position_title", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-left'>" + data + "</div>";
                        }
                    },




                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {


                            return '<center><div class="btn-group tooltip-demo">'
                                + '<button type="button" class="btn btn-info btn-sm action" data-toggle="tooltip" data-placement="left" title="Edit" ng-show="' + s.allow_edit + '" ng-click="btn_edit_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-edit"></i>'
                                + '<button type="button" class="btn btn-danger btn-sm action" data-toggle="tooltip" data-placement="left" title="Delete" ng-show="' + s.allow_delete + '" ng-click="btn_delete_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-trash"></i>' + '</button></div ></center >'

                        }
                    }

                ],


                "createdRow": function (row, data, index) {
                    $(row).attr('id', index);
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });

        s.oTableVolWork.fnSort([[0, 'asc']]);

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }

    var init_table_dataLandD = function (par_data) {
        s.datalistgridLandD = par_data;
        s.oTableLandD = $('#datalist_gridLandD').dataTable(
            {

                data: s.datalistgridLandD,
                stateSave: false,
                sDom: 'rt<"bottom"p>',
                pageLength: 5,
                columns: [

                    {
                        "mData": "seq_no", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-center'>" + data + "</div>";
                        }
                    },

                    {
                        "mData": "learn_devt_title", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-left'>" + data + "</div>";
                        }
                    },



                    {
                        "mData": "conducted_by", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-left'>" + data != null ? data : ""; + "</div>";
                        }
                    },




                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {


                            return '<center><div class="btn-group tooltip-demo">'
                                + '<button type="button" class="btn btn-info btn-sm action" data-toggle="tooltip" data-placement="left" title="Edit" ng-show="' + s.allow_edit + '" ng-click="btn_edit_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-edit"></i>'
                                + '<button type="button" class="btn btn-danger btn-sm action" data-toggle="tooltip" data-placement="left" title="Delete" ng-show="' + s.allow_delete + '" ng-click="btn_delete_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-trash"></i>' + '</button></div ></center >'

                        }
                    }

                ],


                "createdRow": function (row, data, index)
                {
                    $(row).attr('id', index);
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });

        s.oTableLandD.fnSort([[0, 'asc']]);

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }

    var init_table_dataOtherSkills = function (par_data) {
        s.datalistgridOtherSkills = par_data;
        s.oTableOtherSkills = $('#datalist_gridOtherSkills').dataTable(
            {

                data: s.datalistgridOtherSkills,
                stateSave: false,
                sDom: 'rt<"bottom"p>',
                pageLength: 5,
                columns: [

                    {
                        "mData": "seq_no", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-center'>" + data + "</div>";
                        }
                    },

                    {
                        "mData": "descr", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-left'>" + data + "</div>";
                        }
                    },
                    

                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {


                            return '<center><div class="btn-group tooltip-demo">'
                                + '<button type="button" class="btn btn-info btn-sm action" data-toggle="tooltip" data-placement="left" title="Edit" ng-show="' + s.allow_edit + '" ng-click="btn_edit_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-edit"></i>'
                                + '<button type="button" class="btn btn-danger btn-sm action" data-toggle="tooltip" data-placement="left" title="Delete" ng-show="' + s.allow_delete + '" ng-click="btn_delete_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-trash"></i>' + '</button></div ></center >'

                        }
                    }

                ],


                "createdRow": function (row, data, index) {
                    $(row).attr('id', index);
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });

        s.oTableOtherSkills.fnSort([[0, 'asc']]);

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }

    var init_table_dataOtherRecognition = function (par_data) {
        s.datalistgridOtherRecognition = par_data;
        s.oTableOtherRecognition = $('#datalist_gridOtherRecognition').dataTable(
            {

                data: s.datalistgridOtherRecognition,
                stateSave: false,
                sDom: 'rt<"bottom"p>',
                pageLength: 5,
                columns: [

                    {
                        "mData": "seq_no", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-center'>" + data + "</div>";
                        }
                    },

                    {
                        "mData": "descr", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-left'>" + data + "</div>";
                        }
                    },


                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {


                            return '<center><div class="btn-group tooltip-demo">'
                                + '<button type="button" class="btn btn-info btn-sm action" data-toggle="tooltip" data-placement="left" title="Edit" ng-show="' + s.allow_edit + '" ng-click="btn_edit_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-edit"></i>'
                                + '<button type="button" class="btn btn-danger btn-sm action" data-toggle="tooltip" data-placement="left" title="Delete" ng-show="' + s.allow_delete + '" ng-click="btn_delete_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-trash"></i>' + '</button></div ></center >'

                        }
                    }

                ],


                "createdRow": function (row, data, index) {
                    $(row).attr('id', index);
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });

        s.oTableOtherRecognition.fnSort([[0, 'asc']]);

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }

    var init_table_dataOtherMembership = function (par_data) {
        s.datalistgridOtherMembership = par_data;
        s.oTableOtherMembership = $('#datalist_gridOtherMembership').dataTable(
            {

                data: s.datalistgridOtherMembership,
                stateSave: false,
                sDom: 'rt<"bottom"p>',
                pageLength: 5,
                columns: [

                    {
                        "mData": "seq_no", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-center'>" + data + "</div>";
                        }
                    },

                    {
                        "mData": "descr", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-left'>" + data + "</div>";
                        }
                    },


                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {


                            return '<center><div class="btn-group tooltip-demo">'
                                + '<button type="button" class="btn btn-info btn-sm action" data-toggle="tooltip" data-placement="left" title="Edit" ng-show="' + s.allow_edit + '" ng-click="btn_edit_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-edit"></i>'
                                + '<button type="button" class="btn btn-danger btn-sm action" data-toggle="tooltip" data-placement="left" title="Delete" ng-show="' + s.allow_delete + '" ng-click="btn_delete_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-trash"></i>' + '</button></div ></center >'

                        }
                    }

                ],


                "createdRow": function (row, data, index) {
                    $(row).attr('id', index);
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });

        s.oTableOtherMembership.fnSort([[0, 'asc']]);

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }

    var init_table_dataRef = function (par_data) {
        s.datalistgridRef = par_data;
        s.oTableRef = $('#datalist_gridRef').dataTable(
            {

                data: s.datalistgridRef,
                stateSave: false,
                sDom: 'rt<"bottom"p>',
                pageLength: 5,
                columns: [

                    {
                        "mData": "seq_no", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-center'>" + data + "</div>";
                        }
                    },

                    {
                        "mData": "ref_name", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-left'>" + data + "</div>";
                        }
                    },



                    {
                        "mData": "ref_address", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-left'>" + data + "</div>";
                        }
                    },

                    {
                        "mData": "ref_contact", "mRender": function (data, type, full, row) {
                            return "<div class='btn-block text-left'>" + data + "</div>";
                        }
                    },

                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {


                            return '<center><div class="btn-group tooltip-demo">'
                                + '<button type="button" class="btn btn-info btn-sm action" data-toggle="tooltip" data-placement="left" title="Edit" ng-show="' + s.allow_edit + '" ng-click="btn_edit_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-edit"></i>'
                                + '<button type="button" class="btn btn-danger btn-sm action" data-toggle="tooltip" data-placement="left" title="Delete" ng-show="' + s.allow_delete + '" ng-click="btn_delete_action(' + row["row"] + ')" > '
                                + '<i class="fa fa-trash"></i>' + '</button></div ></center >'

                        }
                    }

                ],


                "createdRow": function (row, data, index) {
                    $(row).attr('id', index);
                    $compile(row)($scope);  //add this to compile the DOM
                }
            });

        s.oTableRef.fnSort([[0, 'asc']]);

        $("div.toolbar").html('<b>Custom tool bar! Text/images etc.</b>');
    }

    function currency(d) {

        var retdata = ""
        if (d == null || d == "" || d == undefined) {
            return retdata = "0.00"
        }
        else {
            retdata = d.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
            return retdata
        }
    }

    function validatenumber(value) {
        var value = value.split(",").join("")
        return value
    }

    function toDecimalFormat(data) {
        var value = 0.00
        if (data == "" || data == undefined) {
            return value
        }


        var val = parseFloat(data.replace(/,/g, ''))

        if (isNaN(val)) {
            return value;
        }
        else {
            return val;
        }
    }

    function clearEntry() {
        FieldValidationColorChanged(false, "ALL");
        $("#txtb_child_name").val("")
        $("#txtb_child_birth").val("")
        $("#txtb_school_periodfrom").val("")
        $("#txtb_school_periodto  ").val("")
        $("#txtb_school_yeargrad  ").val("")
        $("#txtb_school_name      ").val("")
        $("#txtb_school_educcourse").val("")
        $("#txtb_school_highlvl   ").val("")
        $("#txtb_school_honors    ").val("")
        $("#txtb_csc_career").val("")
        $("#ddl_csc_type").val("")
        $("#txtb_csc_place").val("")
        $("#txtb_csc_date_exam").val("")
        $("#txtb_csc_date_validity").val("")
        $("#txtb_csc_number").val("")
        $("#txtb_csc_rating").val("")
        $("#txtb_workexp_periodfrom").val("")
        $("#txtb_workexp_periodto").val("")
        $("#txtb_workexp_position").val("")
        $("#txtb_workexp_dept    ").val("")
        $("#txtb_workexp_salary  ").val("")
        $("#txtb_workexp_grade   ").val("")
        $("#txtb_workexp_status   ").val("")
        $("#ddl_workexp_govt     ").val("")
        $("#txtb_voluntary_periodfrom").val("")
        $("#txtb_voluntary_periodto  ").val("")
        $("#txtb_voluntary_hours     ").val("")
        $("#txtb_voluntary_narmeorg  ").val("")
        $("#txtb_voluntary_position  ").val("")
        $("#txtb_learn_periodfrom").val("")
        $("#txtb_learn_periodto  ").val("")
        $("#txtb_learn_hours     ").val("")
        $("#txtb_learn_title     ").val("")
        $("#txtb_learn_type      ").val("")
        $("#txtb_learn_conduct   ").val("")
        $("#txtb_other_skill     ").val("")
        $("#txtb_other_nonacad   ").val("")
        $("#txtb_other_assoc     ").val("")
        $("#txtb_ref_name     ").val("")
        $("#txtb_ref_address  ").val("")
        $("#txtb_ref_tel      ").val("")

        $("#ddl_educational_level").val("")

        //$("#ddl_administering").val("")
        //$("#txtb_gov_issued").val("")
        //$("#txtb_gov_issued_nbr").val("")
        //$("#txtb_dateplace_issuance").val("")

        s.isShowAddEduc = true;
        s.isShowUpdateEduc = false;
        s.isShowAddChild = true;
        s.isShowUpdateChild = false;
        s.isShowAddCSC = true;
        s.isShowUpdateCSC = false;
        s.isShowAddWorkExp = true;
        s.isShowUpdateWorkExp = false;
        s.isShowAddVolWork = true;
        s.isShowUpdateVolWork = false;
        s.isShowAddLearn = true;
        s.isShowUpdateLearn = false;
        //s.isShowAddOther = true;
        //s.isShowUpdateOther = false;
        s.isShowAddRef = true;
        s.isShowUpdateRef = false;
        s.isShowAddOtherSkills = true;
        s.isShowUpdateOtherSkills = false;
        s.isShowAddOtherRecognition = true;
        s.isShowUpdateOtherRecognition = false;
    }



    function isdataValidatedChildren() {
        var return_val = true
        FieldValidationColorChanged(false, "ALL");

        if ($("#txtb_child_name").val().trim() == "") {
            FieldValidationColorChanged(true, "txtb_child_name");
            return_val = false;
        }

        if ($("#txtb_child_birth").val().trim() == "") {
            FieldValidationColorChanged(true, "txtb_child_birth");
            return_val = false;
        }

        if (return_val == false) {
            validate_check = false;
        }


        return return_val
    }

    function isdatavalidatedGovIssued() {
        var return_val = true
        FieldValidationColorChanged(false, "ALL");

        if ($("#txtb_gov_issued").val().trim() == "")
        {
            FieldValidationColorChanged(true, "txtb_gov_issued");
            return_val = false;
            $('.nav-tabs a[href="#tabref-3"]').tab('show');
        }

        if ($("#txtb_gov_issued_nbr").val().trim() == "")
        {
            FieldValidationColorChanged(true, "txtb_gov_issued_nbr");
            return_val = false;
            $('.nav-tabs a[href="#tabref-3"]').tab('show');

        }

        if ($("#txtb_dateplace_issuance").val().trim() == "")
        {
            FieldValidationColorChanged(true, "txtb_dateplace_issuance");
            return_val = false;
            $('.nav-tabs a[href="#tabref-3"]').tab('show');
        }

        if ($("#txtb_dateplace_issuance").val().trim() == "") {
            FieldValidationColorChanged(true, "txtb_dateplace_issuance");
            return_val = false;
            $('.nav-tabs a[href="#tabref-3"]').tab('show');
        }

        if (return_val == false)
        {
            validate_check = false;
        }


        return return_val
    }

    function isdataValidatedEducation() {
        var return_val = true
        FieldValidationColorChanged(false, "ALL");

        if ($("#ddl_educational_level").val().trim() == "") {
            FieldValidationColorChanged(true, "ddl_educational_level");
            return_val = false;
        }

        if ($("#txtb_school_periodfrom").val().trim() == "") {
            FieldValidationColorChanged(true, "txtb_school_periodfrom");
            return_val = false;
        }

        if ($("#txtb_school_periodto").val().trim() == "") {
            FieldValidationColorChanged(true, "txtb_school_periodto");
            return_val = false;
        }


        if ($("#txtb_school_name").val().trim() == "") {
            FieldValidationColorChanged(true, "txtb_school_name");
            return_val = false;
        }

        if ($("#txtb_school_educcourse").val().trim() == "") {
            FieldValidationColorChanged(true, "txtb_school_educcourse");
            return_val = false;
        }

        if ($("#txtb_school_yeargrad").val().trim() == "")
        {
            FieldValidationColorChanged(true, "txtb_school_yeargrad");
            return_val = false;
        }

        if ($("#txtb_school_highlvl").val().trim() == "")
        {
            FieldValidationColorChanged(true, "txtb_school_highlvl");
            return_val = false;
        }
        if ($("#txtb_school_honors").val().trim() == "")
        {
            FieldValidationColorChanged(true, "txtb_school_honors");
            return_val = false;
        }

        if (return_val == false)
        {
            validate_check = false;
        }


        return return_val
    }

    function isdataValidatedEligibility() {

        var return_val = true
        FieldValidationColorChanged(false, "ALL");

        if ($("#txtb_csc_career").val().trim() == "") {
            FieldValidationColorChanged(true, "txtb_csc_career");
            return_val = false;
        }

        if ($("#txtb_csc_number").val().trim() == "") {
            FieldValidationColorChanged(true, "txtb_csc_number");
            return_val = false;
        }

        if ($("#txtb_csc_place").val().trim() == "") {
            FieldValidationColorChanged(true, "txtb_csc_place");
            return_val = false;
        }

        if ($("#txtb_csc_place").val().trim() == "") {
            FieldValidationColorChanged(true, "txtb_csc_place");
            return_val = false;
        }

        if ($("#txtb_csc_date_exam").val().trim() == "") {
            FieldValidationColorChanged(true, "txtb_csc_date_exam");
            return_val = false;
        }

        if ($("#txtb_csc_date_validity").val().trim() == "") {
            FieldValidationColorChanged(true, "txtb_csc_date_validity");
            return_val = false;
        }

        if ($("#txtb_csc_rating").val().trim() == "") {
            FieldValidationColorChanged(true, "txtb_csc_rating");
            return_val = false;
        }

        if ($("#ddl_csc_type").val().trim() == "") {
            FieldValidationColorChanged(true, "ddl_csc_type");
            return_val = false;
        }

        if (return_val == false)
        {
            validate_check = false;
        }

        return return_val
    }

    function isdataValidatedWorkExp() {
        var return_val = true
        FieldValidationColorChanged(false, "ALL");

        if ($("#txtb_workexp_position").val().trim() == "") {
            FieldValidationColorChanged(true, "txtb_workexp_position");
            return_val = false;
        }

        if ($("#txtb_workexp_dept").val().trim() == "") {
            FieldValidationColorChanged(true, "txtb_workexp_dept");
            return_val = false;
        }

        if ($("#txtb_workexp_salary").val().trim() == "") {
            FieldValidationColorChanged(true, "txtb_workexp_salary");
            return_val = false;
        }


        if (isNaN($("#txtb_workexp_salary").val().trim()))
        {
            FieldValidationColorChanged(true, "invalid-txtb_workexp_salary")
            return_val = false;
        }

        if ($("#txtb_workexp_periodfrom").val().trim() == "")
        {
            FieldValidationColorChanged(true, "txtb_workexp_periodfrom");
            return_val = false;
        }

        if ($("#txtb_workexp_periodto").val().trim() == "")
        {
            FieldValidationColorChanged(true, "txtb_workexp_periodto");
            return_val = false;
        }

        if ($("#txtb_workexp_grade").val().trim() == "")
        {
            FieldValidationColorChanged(true, "txtb_workexp_grade");
            return_val = false;
        }

        if ($("#txtb_workexp_status").val().trim() == "")
        {
            FieldValidationColorChanged(true, "txtb_workexp_status");
            return_val = false;
        }

        if ($("#ddl_workexp_govt").val().trim() == "")
        {
            FieldValidationColorChanged(true, "ddl_workexp_govt");
            return_val = false;
        }

        if (return_val == false)
        {
            validate_check = false;
        }



        return return_val
    }

    function isdataValidatedVolWork() {


        var return_val = true
        FieldValidationColorChanged(false, "ALL");

        if ($("#txtb_voluntary_narmeorg").val().trim() == "") {
            FieldValidationColorChanged(true, "txtb_voluntary_narmeorg");
            return_val = false;
        }

        if ($("#txtb_voluntary_position").val().trim() == "") {
            FieldValidationColorChanged(true, "txtb_voluntary_position");
            return_val = false;
        }

        if (isNaN($("#txtb_voluntary_hours").val().trim())) {
            FieldValidationColorChanged(true, "invalid-txtb_voluntary_hours")
            return_val = false;
        }

        if ($("#txtb_voluntary_hours").val().trim() == "")
        {
            FieldValidationColorChanged(true, "txtb_voluntary_hours")
            return_val = false;
        }

        if ($("#txtb_voluntary_periodfrom").val().trim() == "")
        {
            FieldValidationColorChanged(true, "txtb_voluntary_periodfrom")
            return_val = false;
        }

        if ($("#txtb_voluntary_periodto").val().trim() == "")
        {
            FieldValidationColorChanged(true, "txtb_voluntary_periodto")
            return_val = false;
        }

        if (return_val == false)
        {
            validate_check = false;
        }

        return return_val


    }

    function isdataValidatedLandD() {

        var return_val = true
        FieldValidationColorChanged(false, "ALL");

        if ($("#txtb_learn_title").val().trim() == "") {
            FieldValidationColorChanged(true, "txtb_learn_title");
            return_val = false;
        }

        if ($("#txtb_learn_conduct").val().trim() == "")
        {
            FieldValidationColorChanged(true, "txtb_learn_conduct");
            return_val = false;
        }

        if (isNaN($("#txtb_learn_hours").val().trim()))
        {
            FieldValidationColorChanged(true, "invalid-txtb_learn_hours")
            return_val = false;
        }

        if ($("#txtb_learn_hours").val().trim() == "")
        {
            FieldValidationColorChanged(true, "txtb_learn_hours")
            return_val = false;
        }

        if ($("#txtb_learn_periodfrom").val().trim() == "")
        {
            FieldValidationColorChanged(true, "txtb_learn_periodfrom")
            return_val = false;
        }

        if ($("#txtb_learn_periodto").val().trim() == "")
        {
            FieldValidationColorChanged(true, "txtb_learn_periodto")
            return_val = false;
        }

        if ($("#txtb_learn_title").val().trim() == "")
        {
            FieldValidationColorChanged(true, "txtb_learn_title")
            return_val = false;
        }

        if ($("#txtb_learn_type").val().trim() == "")
        {
            FieldValidationColorChanged(true, "txtb_learn_type")
            return_val = false;
        }

        if ($("#txtb_learn_conduct").val().trim() == "")
        {
            FieldValidationColorChanged(true, "txtb_learn_conduct")
            return_val = false;
        }

        if (return_val == false)
        {
            validate_check = false;
        }

        return return_val
    }

    function isdataValidatedOtherSkills() {

        var return_val = true
        FieldValidationColorChanged(false, "ALL");

        if ($("#txtb_other_skill").val().trim() == "") {
            FieldValidationColorChanged(true, "txtb_other_skill");
            return_val = false;
        }

        if (return_val == false)
        {
            validate_check = false;
        }


        return return_val
    }

    function isdataValidatedOtherRecognition() {

        var return_val = true
        FieldValidationColorChanged(false, "ALL");
        
        if ($("#txtb_other_nonacad").val().trim() == "") {
            FieldValidationColorChanged(true, "txtb_other_nonacad");
            return_val = false;
        }

        if (return_val == false)
        {
            validate_check = false;
        }

        return return_val
    }

    function isdataValidatedOtherMembership() {

        var return_val = true
        FieldValidationColorChanged(false, "ALL");
        
        if ($("#txtb_other_assoc").val().trim() == "") {
            FieldValidationColorChanged(true, "txtb_other_assoc");
            return_val = false;
        }

        if (return_val == false)
        {
            validate_check = false;
        }


        return return_val
    }


    function isdataValidatedRef() {

        var return_val = true
        FieldValidationColorChanged(false, "ALL");

        if ($("#txtb_ref_name").val().trim() == "") {
            FieldValidationColorChanged(true, "txtb_ref_name");
            return_val = false;
        }

        if ($("#txtb_ref_address").val().trim() == "") {
            FieldValidationColorChanged(true, "txtb_ref_address");
            return_val = false;
        }

        if ($("#txtb_ref_tel").val().trim() == "") {
            FieldValidationColorChanged(true, "txtb_ref_tel");
            return_val = false;
        }

        if (return_val == false)
        {
            validate_check = false;
        }


        return return_val
    }

    function isdataValidatedSpouse(par_action)
    {
        var return_val = true
        var active_tab = par_action == "all" ? "" : $("#personnal_ul li.active").attr("ngx-tab-id");
        FieldValidationColorChanged(false, "ALL");
        if ($("#txtb_spouse_lname").val().trim() == "" && (active_tab == "" || active_tab == "4"))
            {
                FieldValidationColorChanged(true, "txtb_spouse_lname");
                return_val = false;
                $('.nav-tabs a[href="#tab-3"]').tab('show');
            }

        if ($("#txtb_spouse_fname").val().trim() == "" && (active_tab == "" || active_tab == "4"))
            {
                FieldValidationColorChanged(true, "txtb_spouse_fname");
                return_val = false;
                $('.nav-tabs a[href="#tab-3"]').tab('show');
            }

        if ($("#txtb_spouse_mname").val().trim() == "" && (active_tab == "" || active_tab == "4"))
            {
                FieldValidationColorChanged(true, "txtb_spouse_mname");
                return_val = false;
                $('.nav-tabs a[href="#tab-3"]').tab('show');
            }

        if ($("#txtb_spouse_occu").val().trim() == "" && (active_tab == "" || active_tab == "4")) {
            FieldValidationColorChanged(true, "txtb_spouse_occu");
            return_val = false;
            $('.nav-tabs a[href="#tab-3"]').tab('show');
            }

        if ($("#txtb_spouse_busname").val().trim() == "" && (active_tab == "" || active_tab == "4")) {
            FieldValidationColorChanged(true, "txtb_spouse_busname");
            return_val = false;
            $('.nav-tabs a[href="#tab-3"]').tab('show');
            }

        if ($("#txtb_spouse_busnaddress").val().trim() == "" && (active_tab == "" || active_tab == "4")) {
            FieldValidationColorChanged(true, "txtb_spouse_busnaddress");
            return_val = false;
            $('.nav-tabs a[href="#tab-3"]').tab('show');
            }

        if ($("#txtb_spouse_suffix").val().trim() == "" && (active_tab == "" || active_tab == "4"))
            {
            FieldValidationColorChanged(true, "txtb_spouse_suffix");
            return_val = false;
            $('.nav-tabs a[href="#tab-3"]').tab('show');
            }

        if ($("#txtb_spouse_tel").val().trim() == "" && (active_tab == "" || active_tab == "4")) {
            FieldValidationColorChanged(true, "txtb_spouse_tel");
            return_val = false;
            $('.nav-tabs a[href="#tab-3"]').tab('show');
            }
        
        if (return_val == false)
        {
            validate_check = false;
        }
           

        return return_val
    }

    function isdataValidatedPersonalInfo(par_action)
    {
        var return_val = true
        var active_tab = par_action == "all" ? "" : $("#personnal_ul li.active").attr("ngx-tab-id");
        FieldValidationColorChanged(false, "ALL");
        if ($("#txtb_birth_place").val().trim() == "" && (active_tab == "" || active_tab == "1") )
        {
            FieldValidationColorChanged(true, "txtb_birth_place");
            return_val = false;
            $('.nav-tabs a[href="#tab-1"]').tab('show');
        }

        if ($("#ddl_gender").val().trim() == "" && (active_tab == "" || active_tab == "1"))
        {
            FieldValidationColorChanged(true, "ddl_gender");
            return_val = false;
            $('.nav-tabs a[href="#tab-1"]').tab('show');
        }

        if ($("#ddl_civil_status").val().trim() == "" && (active_tab == "" || active_tab == "1"))
        {
            FieldValidationColorChanged(true, "ddl_civil_status");
            return_val = false;
            $('.nav-tabs a[href="#tab-1"]').tab('show');
        }

        if ($("#txtb_blood_type").val().trim() == "" && (active_tab == "" || active_tab == "1"))
        {
            FieldValidationColorChanged(true, "txtb_blood_type");
            return_val = false;
            $('.nav-tabs a[href="#tab-1"]').tab('show');
        }

        if ($("#txtb_height").val().trim() == "" && (active_tab == "" || active_tab == "1"))
        {
            FieldValidationColorChanged(true, "txtb_height");
            return_val = false;
            $('.nav-tabs a[href="#tab-1"]').tab('show');
        }

        if ($("#txtb_weight").val().trim() == "" && (active_tab == "" || active_tab == "1"))
        {
            FieldValidationColorChanged(true, "txtb_weight");
            return_val = false;
            $('.nav-tabs a[href="#tab-1"]').tab('show');
        }

        if ($("#txtb_person_tel_nbr").val().trim() == "" && (active_tab == "" || active_tab == "2"))
        {
            FieldValidationColorChanged(true, "txtb_person_tel_nbr");
            return_val = false;
            $('.nav-tabs a[href="#tab-1-2"]').tab('show');
        }

        if ($("#txtb_person_mobile_nbr").val().trim() == "" && (active_tab == "" || active_tab == "2"))
        {
            FieldValidationColorChanged(true, "txtb_person_mobile_nbr");
            return_val = false;
            $('.nav-tabs a[href="#tab-1-2"]').tab('show');
        }

        if ($("#txtb_person_email").val().trim() == "" && (active_tab == "" || active_tab == "2"))
        {
            FieldValidationColorChanged(true, "txtb_person_email");
            return_val = false;
            $('.nav-tabs a[href="#tab-1-2"]').tab('show');
        }

        if ($("#txtb_bir_nbr").val().trim() == "" && (active_tab == "" || active_tab == "2"))
        {
            FieldValidationColorChanged(true, "txtb_bir_nbr");
            return_val = false;
            $('.nav-tabs a[href="#tab-1-2"]').tab('show');
        }

        if ($("#txtb_gsisumid_nbr").val().trim() == "" && (active_tab == "" || active_tab == "2"))
        {
            FieldValidationColorChanged(true, "txtb_gsisumid_nbr");
            return_val = false;
            $('.nav-tabs a[href="#tab-1-2"]').tab('show');
        }

        if ($("#txtb_gsisbp_nbr").val().trim() == "" && (active_tab == "" || active_tab == "2"))
        {
            FieldValidationColorChanged(true, "txtb_gsisbp_nbr");
            return_val = false;
            $('.nav-tabs a[href="#tab-1-2"]').tab('show');
        }

        if ($("#txtb_hdmf_nbr").val().trim() == "" && (active_tab == "" || active_tab == "2"))
        {
            FieldValidationColorChanged(true, "txtb_hdmf_nbr");
            return_val = false;
            $('.nav-tabs a[href="#tab-1-2"]').tab('show');
        }

        if ($("#txtb_phic_nbr").val().trim() == "" && (active_tab == "" || active_tab == "2"))
        {
            FieldValidationColorChanged(true, "txtb_phic_nbr");
            return_val = false;
            $('.nav-tabs a[href="#tab-1-2"]').tab('show');
        }

        if ($("#txtb_sss_nbr").val().trim() == "" && (active_tab == "" || active_tab == "2"))
        {
            FieldValidationColorChanged(true, "txtb_sss_nbr");
            return_val = false;
            $('.nav-tabs a[href="#tab-1-2"]').tab('show');
        }

        if ($("#txtb_houselot00").val().trim() == "" && (active_tab == "" || active_tab == "3"))
        {
            FieldValidationColorChanged(true, "txtb_houselot00");
            return_val = false;
            $('.nav-tabs a[href="#tab-2"]').tab('show');
        }

        if ($("#txtb_street00").val().trim() == "" && (active_tab == "" || active_tab == "3"))
        {
            FieldValidationColorChanged(true, "txtb_street00");
            return_val = false;
            $('.nav-tabs a[href="#tab-2"]').tab('show');
        }

        if ($("#txtb_purok_vill00").val().trim() == "" && (active_tab == "" || active_tab == "3"))
        {
            FieldValidationColorChanged(true, "txtb_purok_vill00");
            return_val = false;
            $('.nav-tabs a[href="#tab-2"]').tab('show');
        }

        //Optional lang po muna
        //if ($("#ddl_barangay").val().trim() == "" && (active_tab == "" || active_tab == "3"))
        //{
        //    FieldValidationColorChanged(true, "ddl_barangay");
        //    return_val = false;
        //    $('.nav-tabs a[href="#tab-2"]').tab('show');
        //}

        if ($("#ddl_municipality").val().trim() == "" && (active_tab == "" || active_tab == "3"))
        {
            FieldValidationColorChanged(true, "ddl_municipality");
            return_val = false;
            $('.nav-tabs a[href="#tab-2"]').tab('show');
        }

        if ($("#ddl_province").val().trim() == "" && (active_tab == "" || active_tab == "3"))
        {
            FieldValidationColorChanged(true, "ddl_province");
            return_val = false;
            $('.nav-tabs a[href="#tab-2"]').tab('show');
        }

        if ($("#txtb_zipcode00").val().trim() == "" && (active_tab == "" || active_tab == "3"))
        {
            FieldValidationColorChanged(true, "txtb_zipcode00");
            return_val = false;
            $('.nav-tabs a[href="#tab-2"]').tab('show');
        }

        if ($("#txtb_houselot01").val().trim() == "" && (active_tab == "" || active_tab == "3"))
        {
            FieldValidationColorChanged(true, "txtb_houselot01");
            return_val = false;
            $('.nav-tabs a[href="#tab-2"]').tab('show');
        }

        if ($("#txtb_street01").val().trim() == "" && (active_tab == "" || active_tab == "3"))
        {
            FieldValidationColorChanged(true, "txtb_street01");
            return_val = false;
            $('.nav-tabs a[href="#tab-2"]').tab('show');
        }

        if ($("#txtb_purok_vill01").val().trim() == "" && (active_tab == "" || active_tab == "3"))
        {
            FieldValidationColorChanged(true, "txtb_purok_vill01");
            return_val = false;
            $('.nav-tabs a[href="#tab-2"]').tab('show');
        }

        if ($("#ddl_barangay01").val().trim() == "" && (active_tab == "" || active_tab == "3"))
        {
            FieldValidationColorChanged(true, "ddl_barangay01");
            return_val = false;
            $('.nav-tabs a[href="#tab-2"]').tab('show');
        }

        if ($("#ddl_municipality01").val().trim() == "" && (active_tab == "" || active_tab == "3"))
        {
            FieldValidationColorChanged(true, "ddl_municipality01");
            return_val = false;
            $('.nav-tabs a[href="#tab-2"]').tab('show');
        }

        if ($("#ddl_municipality01").val().trim() == "" && (active_tab == "" || active_tab == "3"))
        {
            FieldValidationColorChanged(true, "ddl_municipality01");
            return_val = false;
            $('.nav-tabs a[href="#tab-2"]').tab('show');
        }

        if ($("#ddl_province01").val().trim() == "" && (active_tab == "" || active_tab == "3"))
        {
            FieldValidationColorChanged(true, "ddl_province01");
            return_val = false;
            $('.nav-tabs a[href="#tab-2"]').tab('show');
        }

        if ($("#txtb_zipcode01").val().trim() == "" && (active_tab == "" || active_tab == "3"))
        {
            FieldValidationColorChanged(true, "txtb_zipcode01");
            return_val = false;
            $('.nav-tabs a[href="#tab-2"]').tab('show');
        }

        if ($("#txtb_father_lname").val().trim() == "" && (active_tab == "" || active_tab == "6"))
        {
            FieldValidationColorChanged(true, "txtb_father_lname");
            return_val = false;
            $('.nav-tabs a[href="#tab-5"]').tab('show');
        }

        if ($("#txtb_father_fname").val().trim() == "" && (active_tab == "" || active_tab == "6"))
        {
            FieldValidationColorChanged(true, "txtb_father_fname");
            return_val = false;
            $('.nav-tabs a[href="#tab-5"]').tab('show');
        }

        if ($("#txtb_father_mname").val().trim() == "" && (active_tab == "" || active_tab == "6"))
        {
            FieldValidationColorChanged(true, "txtb_father_mname");
            return_val = false;
            $('.nav-tabs a[href="#tab-5"]').tab('show');
        }

        if ($("#txtb_father_lname").val().trim() == "" && (active_tab == "" || active_tab == "6"))
        {
            FieldValidationColorChanged(true, "txtb_father_lname");
            return_val = false;
            $('.nav-tabs a[href="#tab-5"]').tab('show');
        }

        if ($("#txtb_father_suffix").val().trim() == "" && (active_tab == "" || active_tab == "6"))
        {
            FieldValidationColorChanged(true, "txtb_father_suffix");
            return_val = false;
            $('.nav-tabs a[href="#tab-5"]').tab('show');
        }

        if ($("#txtb_mother_lname").val().trim() == "" && (active_tab == "" || active_tab == "6"))
        {
            FieldValidationColorChanged(true, "txtb_mother_lname");
            return_val = false;
            $('.nav-tabs a[href="#tab-5"]').tab('show');
        }

        if ($("#txtb_mother_fname").val().trim() == "" && (active_tab == "" || active_tab == "6"))
        {
            FieldValidationColorChanged(true, "txtb_mother_fname");
            return_val = false;
            $('.nav-tabs a[href="#tab-5"]').tab('show');
        }

        if ($("#txtb_mother_mname").val().trim() == "" && (active_tab == "" || active_tab == "6"))
        {
            FieldValidationColorChanged(true, "txtb_mother_mname");
            return_val = false;
            $('.nav-tabs a[href="#tab-5"]').tab('show');
        }

        
        

        if (return_val == false)
        {
            validate_check = false;
        }
        


        

        return return_val
    }


    function getLastValue(type) {
        var largest_val = 0;
        //CHILDREN GRID
        if (type == "01") {
            for (x = 0; x < s.datalistgridChildren.length; x++) {
                if (s.datalistgridChildren[x].seq_no > largest_val) {
                    largest_val = s.datalistgridChildren[x].seq_no
                }
            }
        }

        if (type == "02") {
            for (x = 0; x < s.datalistgridEducation.length; x++) {
                if (s.datalistgridEducation[x].seq_no > largest_val) {
                    largest_val = s.datalistgridEducation[x].seq_no
                }
            }
        }

        if (type == "03") {
            for (x = 0; x < s.datalistgridEligibility.length; x++) {
                if (s.datalistgridEligibility[x].seq_no > largest_val) {
                    largest_val = s.datalistgridEligibility[x].seq_no
                }
            }
        }

        if (type == "04") {
            for (x = 0; x < s.datalistgridWorkExp.length; x++) {
                if (s.datalistgridWorkExp[x].seq_no > largest_val) {
                    largest_val = s.datalistgridWorkExp[x].seq_no
                }
            }
        }

        if (type == "05") {
            for (x = 0; x < s.datalistgridVolWork.length; x++) {
                if (s.datalistgridVolWork[x].seq_no > largest_val) {
                    largest_val = s.datalistgridVolWork[x].seq_no
                }
            }
        }

        if (type == "06") {
            for (x = 0; x < s.datalistgridLandD.length; x++) {
                if (s.datalistgridLandD[x].seq_no > largest_val) {
                    largest_val = s.datalistgridLandD[x].seq_no
                }
            }
        }

        if (type == "07") {
            for (x = 0; x < s.datalistgridOtherSkills.length; x++) {
                if (s.datalistgridOtherSkills[x].seq_no > largest_val)
                {
                    largest_val = s.datalistgridOtherSkills[x].seq_no
                }
            }
        }

        if (type == "07a")
        {
            for (x = 0; x < s.datalistgridOtherRecognition.length; x++) {
                if (s.datalistgridOtherRecognition[x].seq_no > largest_val)
                {
                    largest_val = s.datalistgridOtherRecognition[x].seq_no
                }
            }
        }

        if (type == "07b")
        {
            for (x = 0; x < s.datalistgridOtherMembership.length; x++)
            {
                if (s.datalistgridOtherMembership[x].seq_no > largest_val)
                {
                    largest_val = s.datalistgridOtherMembership[x].seq_no
                }
            }
        }

        if (type == "08") {
            for (x = 0; x < s.datalistgridRef.length; x++) {
                if (s.datalistgridRef[x].seq_no > largest_val) {
                    largest_val = s.datalistgridRef[x].seq_no
                }
            }
        }
        return largest_val

    }



    function getValueFromChildren() {
        var last_val = (getLastValue("01") + 1)

        var dataChildren =
        {

            birth_date: $("#txtb_child_birth").val()
            ,children_name: $("#txtb_child_name").val()
            ,empl_id: s.txtb_empl_id
            ,seq_no: last_val
        }
        return dataChildren
    }

    function getValueFromEducation() {
        var last_val = (getLastValue("02") + 1)

        var dataEducation =
        {

            seq_no: last_val
            , empl_id: s.txtb_empl_id
            , educ_type: $("#ddl_educational_level option:selected").val()
            , educ_short_descr: $("#ddl_educational_level option:selected").html()
            , school_name: $("#txtb_school_name").val()
            , basic_educ_deg: $("#txtb_school_educcourse").val()
            , period_from: $("#txtb_school_periodfrom").val()
            , period_to: $("#txtb_school_periodto").val()
            , highest_lvl_earned: $("#txtb_school_highlvl").val()
            , year_graduated: $("#txtb_school_yeargrad").val()
            , schlr_acdmic_rcvd: $("#txtb_school_honors").val()
        }
        return dataEducation
    }

    function getValueFromEligibility() {
        var last_val = (getLastValue("03") + 1)

        var dataEligibility =
        {

            seq_no: last_val
            , empl_id: s.txtb_empl_id
            , cscsrvc_ra1080: $("#txtb_csc_career").val()
            , rating: $("#txtb_csc_rating").val()
            , examination_date: $("#txtb_csc_date_exam").val()
            , examination_place: $("#txtb_csc_place").val()
            , number: $("#txtb_csc_number").val()
            , validity_date: $("#txtb_csc_date_validity").val()
            , csc_type_code: $("#ddl_csc_type").val()
        }
        return dataEligibility

    }

    function getValuefromWorkExp() {

        var last_val = (getLastValue("04") + 1)
        var dataWorkExp = {


            seq_no: last_val
            ,empl_id: s.txtb_empl_id
            ,workexp_from: $("#txtb_workexp_periodfrom").val()
            ,workexp_to: $("#txtb_workexp_periodto").val()
            ,position_title: $("#txtb_workexp_position").val()
            ,dept_agncy_offc_co: $("#txtb_workexp_dept").val()
            ,monthly_salary: toDecimalFormat($("#txtb_workexp_salary").val())
            ,salary_job_grade: $("#txtb_workexp_grade").val()
            ,appt_status: $("#txtb_workexp_status").val()
            ,gov_srvc: $("#ddl_workexp_govt option:selected").val() 


        }

        return dataWorkExp

    }

    function getValuefromVolWork() {
        var last_val = (getLastValue("05") + 1)
        var dataVolWork =
        {
            seq_no: last_val
            , empl_id: s.txtb_empl_id
            , voluntarywork_from: $("#txtb_voluntary_periodfrom").val()
            , voluntarywork_to: $("#txtb_voluntary_periodto").val()
            , name_address_org: $("#txtb_voluntary_narmeorg").val()
            , no_of_hrs: toDecimalFormat($("#txtb_voluntary_hours").val())
            , position_title: $("#txtb_voluntary_position").val()
        }

        return dataVolWork
    }

    function getValuefromLandD() {
        var last_val = (getLastValue("06") + 1)

        var dataLandD =
        {
            seq_no: last_val
            ,empl_id: s.txtb_empl_id
            ,learn_devt_title: $("#txtb_learn_title").val()
            ,learn_devt_from: $("#txtb_learn_periodfrom").val()
            ,learn_devt_to: $("#txtb_learn_periodto").val()
            ,no_of_hrs: $("#txtb_learn_hours").val()
            ,learn_devt_type: $("#txtb_learn_type").val()
            ,conducted_by: $("#txtb_learn_conduct").val()
        }

        return dataLandD
    }

    function getValuefromOther() {
        
        var dataOther = [];
       
        if (tname == "oTableOtherSkills")
        {
            var last_val = (getLastValue("07") + 1)
            var dataOther =
            {
                seq_no: last_val
                ,empl_id: s.txtb_empl_id
                ,other_type: "S"
                , descr: $("#txtb_other_skill").val()
            }
        }
        

        else if (tname == "oTableOtherRecognition") {
            var last_val = (getLastValue("07a") + 1)
            var dataOther =
            {
                seq_no: last_val
                , empl_id: s.txtb_empl_id
                , other_type: "R"
                , descr: $("#txtb_other_nonacad").val()
            }
        }

        else if (tname == "oTableOtherMembership") {
            var last_val = (getLastValue("07b") + 1)
            var dataOther =
            {
                seq_no: last_val
                , empl_id: s.txtb_empl_id
                , other_type: "M"
                , descr: $("#txtb_other_assoc").val()
            }
        }

        

        return dataOther
    }

    function getValuefromRef() {
        var last_val = (getLastValue("08") + 1)

        var dataRef =
        {
            seq_no: last_val
            ,empl_id: s.txtb_empl_id
            ,ref_name: $("#txtb_ref_name").val()
            ,ref_address: $("#txtb_ref_address").val()
            ,ref_contact: $("#txtb_ref_tel").val()
        }

        return dataRef
    }





    function getValuefromPersonalInfo_ID() {
        var datapersonalinfo_id = {

            empl_id: s.txtb_empl_id
            ,gsis_id_no: s.txtb_gsisumid_nbr
            ,hdmf_id_no: s.txtb_hdmf_nbr
            ,phic_id_no: s.txtb_phic_nbr
            ,sss_id_no: s.txtb_sss_nbr
            ,tel_no: s.txtb_person_tel_nbr
            ,mobile_no: s.txtb_person_mobile_nbr
            ,email_add: s.txtb_person_email
            ,blood_type: s.txtb_blood_type
            ,gsis_bp_id_no: s.txtb_gsisbp_nbr
            ,bir_tin: s.txtb_bir_nbr


        }

        return datapersonalinfo_id
    }

    function getValuefromPersonalInfo()
    {
        var type = false;
        var nature = false;
        if ($('#rad_type0').is(':checked')) {
            type = false;
        }

        else
        {
            type = true;
        }

        if ($('#rad_nature0').is(':checked')) {
            nature = false;
        }

        else
        {
            nature = true;
        }


        var datapersonalinfo = {
            empl_id: s.txtb_empl_id
            ,bir_tin: s.txtb_bir_nbr
            ,umid: s.txtb_gsisumid_nbr
            ,birth_date: $("#txtb_birth_date").val()
            ,civil_status: s.ddl_civil_status
            ,gender: s.ddl_gender
            ,emp_height: s.txtb_height
            ,emp_weight: s.txtb_weight
            ,birth_place: s.txtb_birth_place
            ,maiden_name: s.txtb_maiden_name
            ,spouse_last_name: s.txtb_spouse_lname
            ,spouse_first_name: s.txtb_spouse_fname
            ,spouse_middle_name: s.txtb_spouse_mname
            ,spouse_suffix_name: s.txtb_spouse_suffix
            ,spouse_occupation: s.txtb_spouse_occu
            ,spouse_employer_name: s.txtb_spouse_busname
            ,spouse_business_address: s.txtb_spouse_busnaddress
            ,spouse_tel_no: s.txtb_spouse_tel
            ,father_last_name: s.txtb_father_lname
            ,father_middle_name: s.txtb_father_mname
            ,father_first_name: s.txtb_father_fname
            ,father_suffix_name: s.txtb_father_suffix
            ,mother_last_name: s.txtb_mother_lname
            ,mother_middle_name: s.txtb_mother_mname
            ,mother_first_name: s.txtb_mother_fname
            ,citizenship_type: type
            ,citizenship_nature: nature
            ,citizenship_country: s.txtb_citizenshipcountry

        }

        return datapersonalinfo
    }

    function getValuefromPersonalNames() {
        var datapersonalnames =
        {
            last_name: s.txtb_last_name
            , first_name: s.txtb_first_name
            , middle_name: s.txtb_middle_name
            , suffix_name: s.txtb_suffix_name
            , courtisy_title: s.txtb_courtesy_name
            , postfix_name: s.txtb_post_name
        }

        return datapersonalnames
    }

    function getValuefromPersonalAddress_00() {
        var datapersonaladdress_00 =
        {

            street: s.txtb_street00
            , purok: s.txtb_purok_vill00
            , zip_code: s.txtb_zipcode00
            , address_type: '00'
            , houselot_nbr: s.txtb_houselot00
            , barangay_name: $('#ddl_barangay option:selected').html()
            , barangay_code: s.ddl_barangay
            , municipality_code: s.ddl_municipality
            , municipality_name: $('#ddl_municipality option:selected').html()
            , province_name: $('#ddl_province option:selected').html()
            , province_code: s.ddl_province
        }

        return datapersonaladdress_00
    }

    function getValuefromPersonalAddress_01() {
        var datapersonaladdress_01 =
        {

            street: s.txtb_street01
            , purok: s.txtb_purok_vill01
            , zip_code: s.txtb_zipcode01
            , address_type: '01'
            , houselot_nbr: s.txtb_houselot01
            , barangay_name: $('#ddl_barangay01 option:selected').html()
            , barangay_code: s.ddl_barangay01
            , municipality_name: $('#ddl_municipality01 option:selected').html()
            , municipality_code: s.ddl_municipality01
            , province_name: $('#ddl_province01 option:selected').html()
            , province_code: s.ddl_province01
        }

        return datapersonaladdress_01
    }

    function getValuefromStat() {

        var datastat =
        {
            empl_id: s.txtb_empl_id
            , stat_ques34a: $("#chk_stat_ques34a").is(":checked")
            , stat_ques34b: $("#chk_stat_ques34b").is(":checked")
            , stat_ques34_dtl: $("#txtb_stat_ques34_dtl").val()
            , stat_ques35a: $("#chk_stat_ques35a").is(":checked")
            , stat_ques35a_dtl: $("#txtb_stat_ques35a_dtl ").val()
            , stat_ques35b: $("#chk_stat_ques35b").is(":checked")
            , stat_ques35b_dtls_date: $("#txtb_stat_ques35b_dtls_date").val()
            , stat_ques35b_dtls_status: $("#txtb_stat_ques35b_dtls_status").val()
            , stat_ques36: $("#chk_stat_ques36").is(":checked")
            , stat_ques36_dtl: $("#txtb_stat_ques36_dtl").val()
            , stat_ques37: $("#chk_stat_ques37").is(":checked")
            , stat_ques37_dtl: $("#txtb_stat_ques37_dtl").val()
            , stat_ques38a: $("#chk_stat_ques38a").is(":checked")
            , stat_ques38a_dtl: $("#txtb_stat_ques38a_dtl").val()
            , stat_ques38b: $("#chk_stat_ques38b").is(":checked")
            , stat_ques38b_dtl: $("#txtb_stat_ques38b_dtl").val()
            , stat_ques39: $("#chk_stat_ques39").is(":checked")
            , stat_ques39_dtl: $("#txtb_stat_ques39_dtl").val()
            , stat_ques40a: $("#chk_stat_ques40a").is(":checked")
            , stat_ques40a_dtl: $("#txtb_stat_ques40a_dtl").val()
            , stat_ques40b: $("#chk_stat_ques40b").is(":checked")
            , stat_ques40b_dtl: $("#txtb_stat_ques40b_dtl").val()
            , stat_ques40c: $("#chk_stat_ques40c").is(":checked")
            , stat_ques40c_dtl: $("#txtb_stat_ques40c_dtl").val()
            , govt_issued_id        : $("#txtb_gov_issued").val()
            , govt_issued_id_nbr    : $("#txtb_gov_issued_nbr").val()
            , date_place_issuance   : $("#txtb_dateplace_issuance").val()
            , department_code       : $("#ddl_administering").val()
            , printing_date         : $("#txtb_printing_date").val().trim()
           
           
        }
        return datastat
    }


    s.btn_save_personal = function (par_action) {

        if (isdataValidatedPersonalInfo(par_action) && isdataValidatedSpouse(par_action))
        {
            var return_val = true
            var active_tab = par_action == "all" ? "" : $("#personnal_ul li.active").attr("ngx-tab-id");
            var data_personal_info          = getValuefromPersonalInfo()
            var data_personal_id            = getValuefromPersonalInfo_ID()
            var data_personal_names         = getValuefromPersonalNames()
            var data_personal_address_00    = getValuefromPersonalAddress_00()
            var data_personal_address_01 = getValuefromPersonalAddress_01()
            if (par_action == "all")
            {
                $("#btn_savePersonal").removeClass("fa fa-save");
                $("#btn_savePersonal").addClass("fa fa-spinner fa-spin");
            }
            h.post("../cSSPDS/SaveFromDataBasePersonal", {
                par_empl_id: s.txtb_empl_id
                , personnel_tbl_data: data_personal_info
                , personnel_contact_id_tbl_data: data_personal_id
                , personnelnames_tbl_data: data_personal_names
                , personneladdresses_tbl_data00: data_personal_address_00
                , personneladdresses_tbl_data01: data_personal_address_01
                , personnel_children_tbl_data: s.datalistgridChildren
            }).then(function (d) {

                if (d.data.message == "success") {
                    
                    if (par_action == "all") {
                        swal("Successfully Updated!", "Current Record has been Successfully Updated!", "success");
                        $("#main_modal_personnal").modal("hide")
                        $("#btn_savePersonal").removeClass("fa fa-spinner fa-spin");
                        $("#btn_savePersonal").addClass("fa fa-save");
                    }
                    else {
                        swal("Successfully Updated!", "Current Record has been Successfully Updated!", "success");
                        if (active_tab == "1") {
                            
                            $('.nav-tabs a[href="#tab-1-2"]').tab('show');
                        }
                        else
                        {
                            
                            if (active_tab == "5") {
                                s.ishowContinue = false;
                            }
                            else {
                                s.ishowContinue = true;
                            }
                            $('.nav-tabs a[href="#tab-'+active_tab+'"]').tab('show');
                        }
                    }
                }

            });

        }

    }
    s.show_continue_btn = function (active_tab)
    {
        if (active_tab == "6")
        {
            s.ishowContinue = false;
        }
        else s.ishowContinue = true;
    }
    s.btn_save_educational = function () {


        $("#btn_saveEducational").removeClass("fa fa-save");
        $("#btn_saveEducational").addClass("fa fa-spinner fa-spin");

        h.post("../cSSPDS/SaveFromDataBaseEducation", {
            par_empl_id: s.txtb_empl_id
            , personnel_educ_tbl_data: s.datalistgridEducation
            , personnel_csceligibilty_tbl_data: s.datalistgridEligibility
        }).then(function (d) {

            if (d.data.message == "success") {
                swal("Successfully Updated!", "Current Record has been Successfully Updated!", "success");
                $("#main_modal_education").modal("hide")

                $("#btn_saveEducational").removeClass("fa fa-spinner fa-spin");
                $("#btn_saveEducational").addClass("fa fa-save");
            }

        })


    }

    s.btn_save_work = function () {
        $("#btn_saveWork").removeClass("fa fa-save");
        $("#btn_saveWork").addClass("fa fa-spinner fa-spin");
       
        h.post("../cSSPDS/SaveFromDataBaseWork", {
            par_empl_id: s.txtb_empl_id
            , personnel_workexprnce_tbl_data: s.datalistgridWorkExp
            , personnel_voluntarywork_tbl_data: s.datalistgridVolWork
        }).then(function (d) {

            if (d.data.message == "success") {
                swal("Successfully Updated!", "Current Record has been Successfully Updated!", "success");
                $("#main_modal_work").modal("hide")

                $("#btn_saveWork").removeClass("fa fa-spinner fa-spin");
                $("#btn_saveWork").addClass("fa fa-save");
            }

            else {
                alert(d.data.message)
            }

        })

    }

    s.btn_save_learn = function () {

        $("#btn_saveLandD").removeClass("fa fa-save");
        $("#btn_saveLandD").addClass("fa fa-spinner fa-spin");
        
        h.post("../cSSPDS/SaveFromDataBaseLandD", {
            par_empl_id: s.txtb_empl_id
            ,personnel_learnanddevt_tbl_data: s.datalistgridLandD
            ,personnelotherinfo_tbl_dataSkills: s.datalistgridOtherSkills
            ,personnelotherinfo_tbl_dataRecognition: s.datalistgridOtherRecognition
            ,personnelotherinfo_tbl_dataMembership: s.datalistgridOtherMembership
        }).then(function (d) {

            if (d.data.message == "success") {
                swal("Successfully Updated!", "Current Record has been Successfully Updated!", "success");
                $("#main_modal_learn").modal("hide")

                $("#btn_saveLandD").removeClass("fa fa-spinner fa-spin");
                $("#btn_saveLandD").addClass("fa fa-save");
            }

            else {
                alert(d.data.message)
            }

        })

    }

    s.btn_save_ref = function () {

        if (isdatavalidatedGovIssued())
        { 
        $("#btn_saveRef").removeClass("fa fa-save");
        $("#btn_saveRef").addClass("fa fa-spinner fa-spin");
        var data_stat = getValuefromStat()
        h.post("../cSSPDS/SaveFromDataBaseRef", {
            par_empl_id: s.txtb_empl_id
            ,personnelreference_tbl_data: s.datalistgridRef
            ,personnelstatutory_tbl_data: data_stat
        }).then(function (d) {

            if (d.data.message == "success") {
                swal("Successfully Updated!", "Current Record has been Successfully Updated!", "success");
                $("#main_modal_ref").modal("hide")
                $("#btn_saveRef").removeClass("fa fa-spinner fa-spin");
                $("#btn_saveRef").addClass("fa fa-save");
            }

            else {
                alert(d.data.message)
                }

                })
        }

    }



    s.btn_add_child = function () {
        tname = "oTableChildren"
        if (isdataValidatedChildren())
        {
           
            var child_row_info = getValueFromChildren();
            h.post("../cSSPDS/SaveDirectToDatabase", {
                 par_data: child_row_info
                , par_action_type: "ADD"
                , db_table:"children_tbl"
            }).then(function (d)
            {
                if (d.data.message == "success")
                {
                    s.datalistgridChildren.push(getValueFromChildren())
                    s.oTableChildren.fnClearTable();
                    s.oTableChildren.fnAddData(s.datalistgridChildren)
                    for (var x = 1; x <= $('#datalist_gridChildren').DataTable().page.info().pages; x++) {
                        if (get_page(child_row_info.seq_no, "datalist_gridChildren") == false) {
                            
                            s.oTableChildren.fnPageChange(x);
                        }
                        else {
                            break;
                        }
                    }

                    swal("Successfully Added!", "New Record has been Successfully Added!", "success");
                    clearEntry()
                }
                else
                {
                    swal("Error Message!", d.data.message, "error");   
                }
            });
           
        }
    }

    s.btn_add_education = function () {
        tname = "oTableEducation";
        if (isdataValidatedEducation())
        {
            var educ_row_info = getValueFromEducation();
            h.post("../cSSPDS/SaveDirectToDatabase", {
                par_data: educ_row_info
                , par_action_type: "ADD"
                , db_table: "education_tbl"
            }).then(function (d) {
                if (d.data.message == "success")
                {
                    s.datalistgridEducation.push(getValueFromEducation())
                    s.oTableEducation.fnClearTable();
                    s.oTableEducation.fnAddData(s.datalistgridEducation)

                    for (var x = 1; x <= $('#datalist_gridEducation').DataTable().page.info().pages; x++) {
                        if (get_page(getLastValue("02"), "datalist_gridEducation") == false) {
                            s.oTableEducation.fnPageChange(x);
                        }
                        else {
                            break;
                        }
                    }

                    swal("Successfully Added!", "New Record has been Successfully Added!", "success");
                    clearEntry()
                }
                else
                {
                    alert(d.data.message);
                }
            });
        }

    }

    s.btn_add_eligibility = function () {
        tname = "oTableEligibility";
        if (isdataValidatedEligibility())
        {
            var csc_row_info = getValueFromEligibility();
            h.post("../cSSPDS/SaveDirectToDatabase", {
                par_data: csc_row_info
                , par_action_type: "ADD"
                , db_table: "csc_tbl"
            }).then(function (d)
            {
                if (d.data.message == "success")
                {
                    s.datalistgridEligibility.push(getValueFromEligibility())
                    s.oTableEligibility.fnClearTable();
                    s.oTableEligibility.fnAddData(s.datalistgridEligibility)

                    for (var x = 1; x <= $('#datalist_gridEligibility').DataTable().page.info().pages; x++) {
                        if (get_page(getLastValue("03"), "datalist_gridEligibility") == false) {
                            s.oTableEligibility.fnPageChange(x);
                        }
                        else {
                            break;
                        }
                    }

                    swal("Successfully Added!", "New Record has been Successfully Added!", "success");
                    clearEntry()
                }
                else
                {
                    alert(d.data.message);
                }
            });
            
        }

    }

    s.btn_add_workexp = function () {
        tname = "oTableWorkExp";
        if (isdataValidatedWorkExp()) {
            var workexp_row_info = getValuefromWorkExp();
            h.post("../cSSPDS/SaveDirectToDatabase", {
                  par_data    : workexp_row_info
                , par_action_type   : "ADD"
                , db_table          : "workexp_tbl"
            }).then(function (d)
            {
                if (d.data.message == "success") {
                    s.datalistgridWorkExp.push(getValuefromWorkExp())
                    s.oTableWorkExp.fnClearTable();
                    s.oTableWorkExp.fnAddData(s.datalistgridWorkExp)

                    for (var x = 1; x <= $('#datalist_gridWorkExp').DataTable().page.info().pages; x++) {
                        if (get_page(getLastValue("04"), "datalist_gridWorkExp") == false) {
                            s.oTableWorkExp.fnPageChange(x);
                        }
                        else {
                            break;
                        }
                    }

                    swal("Successfully Added!", "New Record has been Successfully Added!", "success");
                    clearEntry()
                }
                else
                {
                    alert(d.data.message);
                }
            });  
        }
    }

    s.btn_add_volwork = function () {
        tname = "oTableVolWork";
        if (isdataValidatedVolWork()) {
            var voluntary_row_info = getValuefromVolWork();
            h.post("../cSSPDS/SaveDirectToDatabase", {
                par_data: voluntary_row_info
                , par_action_type: "ADD"
                , db_table: "voluntary_tbl"
            }).then(function (d)
            {
                if (d.data.message == "success") {
                    s.datalistgridVolWork.push(getValuefromVolWork())
                    s.oTableVolWork.fnClearTable();
                    s.oTableVolWork.fnAddData(s.datalistgridVolWork)

                    for (var x = 1; x <= $('#datalist_gridVolWork').DataTable().page.info().pages; x++) {
                        if (get_page(getLastValue("05"), "datalist_gridVolWork") == false) {
                            s.oTableVolWork.fnPageChange(x);
                        }
                        else {
                            break;
                        }
                    }

                    swal("Successfully Added!", "New Record has been Successfully Added!", "success");
                    clearEntry()
                }
                else
                {
                    alert(d.data.message);
                }
            });
        }
    }

    s.btn_add_LandD = function () {
        tname = "oTableLandD";
        if (isdataValidatedLandD()) {
            var voluntary_row_info = getValuefromLandD();
            h.post("../cSSPDS/SaveDirectToDatabase", {
                par_data: voluntary_row_info
                , par_action_type: "ADD"
                , db_table: "lnd_tbl"
            }).then(function (d)
            {
                if (d.data.message == "success") {
                    s.datalistgridLandD.push(getValuefromLandD())
                    s.oTableLandD.fnClearTable();
                    s.oTableLandD.fnAddData(s.datalistgridLandD)

                    for (var x = 1; x <= $('#datalist_gridLandD').DataTable().page.info().pages; x++) {
                        if (get_page(getLastValue("06"), "datalist_gridLandD") == false) {
                            s.oTableLandD.fnPageChange(x);
                        }
                        else {
                            break;
                        }
                    }

                    swal("Successfully Added!", "New Record has been Successfully Added!", "success");
                    clearEntry()
                }
                else
                {
                    alert(d.data.message);
                }
            });
        }
    }

    s.btn_add_otherSkills = function () {
        tname = "oTableOtherSkills";
        if (isdataValidatedOtherSkills()) {
            var voluntary_row_info = getValuefromOther();
            h.post("../cSSPDS/SaveDirectToDatabase", {
                par_data: voluntary_row_info
                , par_action_type: "ADD"
                , db_table: "otherinfo_tbl"
            }).then(function (d)
            {
                if (d.data.message == "success")
                {
                    s.datalistgridOtherSkills.push(getValuefromOther())
                    s.oTableOtherSkills.fnClearTable();
                    s.oTableOtherSkills.fnAddData(s.datalistgridOtherSkills)

                    for (var x = 1; x <= $('#datalist_gridOtherSkills').DataTable().page.info().pages; x++) {
                        if (get_page(getLastValue("07"), "datalist_gridOtherSkills") == false) {
                            s.oTableOtherSkills.fnPageChange(x);
                        }
                        else {
                            break;
                        }
                    }

                    swal("Successfully Added!", "New Record has been Successfully Added!", "success");
                    clearEntry()
                }
                else
                {
                    alert(d.data.message);
                }
            });
        }
    }

    s.btn_add_otherRecognition = function () {
        tname = "oTableOtherRecognition";
        if (isdataValidatedOtherRecognition()) {
            var voluntary_row_info = getValuefromOther();
            h.post("../cSSPDS/SaveDirectToDatabase", {
                par_data: voluntary_row_info
                , par_action_type: "ADD"
                , db_table: "otherinfo_tbl"
            }).then(function (d) {
                if (d.data.message == "success")
                {
                    s.datalistgridOtherRecognition.push(getValuefromOther())
                    s.oTableOtherRecognition.fnClearTable();
                    s.oTableOtherRecognition.fnAddData(s.datalistgridOtherRecognition)

                    for (var x = 1; x <= $('#datalist_gridOtherRecognition').DataTable().page.info().pages; x++) {
                        if (get_page(getLastValue("07a"), "datalist_gridOtherRecognition") == false) {
                            s.oTableOtherRecognition.fnPageChange(x);
                        }
                        else {
                            break;
                        }
                    }

                    swal("Successfully Added!", "New Record has been Successfully Added!", "success");
                    clearEntry()
                }
                else
                {
                    alert(d.data.message);
                }
            });
        }
    }

    s.btn_add_otherMembership = function () {
        tname = "oTableOtherMembership";
        if (isdataValidatedOtherMembership())
        {
            var voluntary_row_info = getValuefromOther();
            h.post("../cSSPDS/SaveDirectToDatabase", {
                par_data: voluntary_row_info
                , par_action_type: "ADD"
                , db_table: "otherinfo_tbl"
            }).then(function (d)
            {
                if (d.data.message == "success")
                {
                    s.datalistgridOtherMembership.push(getValuefromOther())
                    s.oTableOtherMembership.fnClearTable();
                    s.oTableOtherMembership.fnAddData(s.datalistgridOtherMembership)

                    for (var x = 1; x <= $('#datalist_gridOtherMembership').DataTable().page.info().pages; x++) {
                        if (get_page(getLastValue("07b"), "datalist_gridOtherMembership") == false) {
                            s.oTableOtherMembership.fnPageChange(x);
                        }
                        else {
                            break;
                        }
                    }

                    swal("Successfully Added!", "New Record has been Successfully Added!", "success");
                    clearEntry()
                }
                else
                {
                    alert(d.data.message);
                }
            });
        }

    }

    s.btn_add_ref = function () {
        tname = "oTableRef";
        if (isdataValidatedRef()) {
            var voluntary_row_info = getValuefromRef();
            h.post("../cSSPDS/SaveDirectToDatabase", {
                par_data: voluntary_row_info
                , par_action_type: "ADD"
                , db_table: "reference_tbl"
            }).then(function (d)
            {
                if (d.data.message == "success") {
                    s.datalistgridRef.push(getValuefromRef())
                    s.oTableRef.fnClearTable();
                    s.oTableRef.fnAddData(s.datalistgridRef)

                    for (var x = 1; x <= $('#datalist_gridRef').DataTable().page.info().pages; x++) {
                        if (get_page(getLastValue("08"), "datalist_gridRef") == false) {
                            s.oTableRef.fnPageChange(x);
                        }
                        else {
                            break;
                        }
                    }

                    swal("Successfully Added!", "New Record has been Successfully Added!", "success");
                    clearEntry()
                }
                else
                {
                    alert(d.data.message);
                }
            });
            
        }
    }

    s.btn_action_personalinfo = function () {
        validate_check = false;
        tname = "oTableChildren";
        actionPage = "PersonalInfo"
        s.ModalTitle = "Edit Personal Information & Family Background"
        clearEntry();
        validate_check = false;
        FieldValidationColorChanged(false, "ALL");

        h.post("../cSSPDS/GetPersonalInfoData", {


        }).then(function (d) {
            if (d.data.message == "success") {
                //PERSONAL BASIC INFORMATION

                s.txtb_empl_id = d.data.sp_personnel_tbl_list_pds[0].empl_id;
                s.txtb_last_name = d.data.sp_personnel_tbl_list_pds[0].last_name
                s.txtb_first_name = d.data.sp_personnel_tbl_list_pds[0].first_name
                s.txtb_middle_name = d.data.sp_personnel_tbl_list_pds[0].middle_name
                s.txtb_maiden_name = d.data.sp_personnel_tbl_list_pds[0].maiden_name
                s.txtb_suffix_name = d.data.sp_personnel_tbl_list_pds[0].suffix_name
                s.txtb_courtesy_name = d.data.sp_personnel_tbl_list_pds[0].courtisy_title
                s.txtb_post_name = d.data.sp_personnel_tbl_list_pds[0].postfix_name


                s.txtb_birth_date = d.data.sp_personnel_tbl_list_pds[0].birth_date
                s.txtb_birth_place = d.data.sp_personnel_tbl_list_pds[0].birth_place
                s.ddl_gender = d.data.sp_personnel_tbl_list_pds[0].gender
                s.civil_status = d.data.ddl_civil_status
                s.ddl_civil_status = d.data.sp_personnel_tbl_list_pds[0].civil_status

                s.txtb_citizenshipcountry = d.data.sp_personnel_tbl_list_pds[0].citizenship_country

                if (d.data.sp_personnel_tbl_list_pds[0].citizenship_type == false) {
                    s.isCheckCitizenshiptype0 = true;
                    s.isCheckCitizenshiptype1 = false;
                    //$("#citizenshipnature_div").hide()
                    $("#citizenshipcountry_div").hide()
                }

                else {
                    s.isCheckCitizenshiptype0 = false;
                    s.isCheckCitizenshiptype1 = true;
                    //$("#citizenshipnature_div").show()
                    $("#citizenshipcountry_div").show()
                }

                if (d.data.sp_personnel_tbl_list_pds[0].citizenship_nature == false) {
                    s.isCheckCitizenshipnature0 = true;
                    s.isCheckCitizenshipnature1 = false;
                }

                else {
                    s.isCheckCitizenshipnature0 = false;
                    s.isCheckCitizenshipnature1 = true;
                }

                s.txtb_status_details = d.data.sp_personnel_tbl_list_pds[0].status_descr
                s.txtb_blood_type = d.data.sp_personnel_tbl_list_pds[0].blood_type
                s.txtb_height = d.data.sp_personnel_tbl_list_pds[0].emp_height
                s.txtb_weight = d.data.sp_personnel_tbl_list_pds[0].emp_weight

                //ID NUMBER
                s.txtb_bir_nbr = d.data.sp_personnel_tbl_list_pds[0].bir_tin
                s.txtb_gsisumid_nbr = d.data.sp_personnel_tbl_list_pds[0].gsis_id_no
                s.txtb_gsisbp_nbr = d.data.sp_personnel_tbl_list_pds[0].gsis_bp_id_no
                s.txtb_hdmf_nbr = d.data.sp_personnel_tbl_list_pds[0].hdmf_id_no
                s.txtb_phic_nbr = d.data.sp_personnel_tbl_list_pds[0].phic_id_no
                s.txtb_sss_nbr = d.data.sp_personnel_tbl_list_pds[0].sss_id_no

                //CONTACT INFO  
                s.txtb_person_tel_nbr = d.data.sp_personnel_tbl_list_pds[0].tel_no
                s.txtb_person_mobile_nbr = d.data.sp_personnel_tbl_list_pds[0].mobile_no
                s.txtb_person_email = d.data.sp_personnel_tbl_list_pds[0].email_add


                //ADDRESS INFORMATION
                //RESEDENTIAL
                s.txtb_houselot00 = d.data.sp_personnel_tbl_list_pds[0].houselot_nbr_00
                s.txtb_street00 = d.data.sp_personnel_tbl_list_pds[0].street_00
                s.txtb_purok_vill00 = d.data.sp_personnel_tbl_list_pds[0].purok_00
                s.ddl_province = d.data.sp_personnel_tbl_list_pds[0].province_name_00
                s.ddl_province_change();
                s.ddl_municipality = d.data.sp_personnel_tbl_list_pds[0].municipality_name_00
                s.ddl_municipality_change();
                s.ddl_barangay = d.data.sp_personnel_tbl_list_pds[0].barangay_name_00
                s.txtb_zipcode00 = d.data.sp_personnel_tbl_list_pds[0].zip_code_00

                //PERMANENT
                s.txtb_houselot01 = d.data.sp_personnel_tbl_list_pds[0].houselot_nbr_01
                s.txtb_street01 = d.data.sp_personnel_tbl_list_pds[0].street_01
                s.txtb_purok_vill01 = d.data.sp_personnel_tbl_list_pds[0].purok_01
                s.ddl_province01 = d.data.sp_personnel_tbl_list_pds[0].province_name_01
                s.ddl_province_change1();
                s.ddl_municipality01 = d.data.sp_personnel_tbl_list_pds[0].municipality_name_01
                s.ddl_municipality_change1();
                s.ddl_barangay01 = d.data.sp_personnel_tbl_list_pds[0].barangay_name_01
                s.txtb_zipcode01 = d.data.sp_personnel_tbl_list_pds[0].zip_code_01

                //SPOUSE INFORMATION

                s.txtb_spouse_lname = d.data.sp_personnel_tbl_list_pds[0].spouse_last_name
                s.txtb_spouse_fname = d.data.sp_personnel_tbl_list_pds[0].spouse_first_name
                s.txtb_spouse_mname = d.data.sp_personnel_tbl_list_pds[0].spouse_middle_name
                s.txtb_spouse_suffix = d.data.sp_personnel_tbl_list_pds[0].spouse_suffix_name
                s.txtb_spouse_occu = d.data.sp_personnel_tbl_list_pds[0].spouse_occupation
                s.txtb_spouse_busname = d.data.sp_personnel_tbl_list_pds[0].spouse_employer_name
                s.txtb_spouse_busnaddress = d.data.sp_personnel_tbl_list_pds[0].spouse_business_address
                s.txtb_spouse_tel = d.data.sp_personnel_tbl_list_pds[0].spouse_tel_no

                //PARENTS INFORMATION

                s.txtb_father_lname = d.data.sp_personnel_tbl_list_pds[0].father_last_name
                s.txtb_father_fname = d.data.sp_personnel_tbl_list_pds[0].father_first_name
                s.txtb_father_mname = d.data.sp_personnel_tbl_list_pds[0].father_middle_name
                s.txtb_father_suffix = d.data.sp_personnel_tbl_list_pds[0].father_suffix_name
                s.txtb_mother_lname = d.data.sp_personnel_tbl_list_pds[0].mother_last_name
                s.txtb_mother_fname = d.data.sp_personnel_tbl_list_pds[0].mother_first_name
                s.txtb_mother_mname = d.data.sp_personnel_tbl_list_pds[0].mother_middle_name

                h.post("../cSSPDS/GetChildrenInfoData",
                    {
                        par_empl_id: s.txtb_empl_id

                    }).then(function (d) {

                        s.datalistgridChildren = []
                        if (d.data.message = "success") {
                            if (d.data.personnel_children_tbl.length > 0) {

                                s.datalistgridChildren = d.data.personnel_children_tbl;
                                s.oTableChildren.fnClearTable();
                                s.oTableChildren.fnAddData(s.datalistgridChildren)
                            }
                            else {
                                s.oTableChildren.fnClearTable();
                            }
                        }

                        else {

                        }
                    })

            }
            else {

                swal("Unable to Update this Data!", "Please Try Again Later!", "warning");
                $("#main_modal").modal("hide")
            }

            
            $("#main_modal_personnal").modal({
                keyboard: false,
                backdrop: "static"
            })
        })


        //$("#btn_personnelinfologo").removeClass("fa fa-long-arrow-right");
        //$("#btn_personnelinfologo").addClass("fa fa-spinner fa-spin");

    }

    s.CitizenshiptypeAction0 = function () {
        //$("#citizenshipnature_div").hide()
        $("#citizenshipcountry_div").hide()
    }

    s.CitizenshiptypeAction1 = function () {
        //$("#citizenshipnature_div").show()
        $("#citizenshipcountry_div").show()

    }

    s.getActiveTabEducation = function (value) {
        if (value == 1 || value == "1") {
            tname = "oTableEducation";
        }

        else {
            tname = "oTableEligibility";
        }
    }

    s.getActiveTabWork = function (value) {
        if (value == 1 || value == "1") {
            tname = "oTableWorkExp";
        }

        else {
            tname = "oTableVolWork";
        }

    }

    s.getActiveTabLandD = function (value) {

        if (value == 1 || value == "1") {
            tname = "oTableLandD";
        }

        else if (value == 2 || value == "2") {
            tname = "oTableOtherSkills";
        }

        else if (value == 3 || value == "3") {
            tname = "oTableOtherRecognition";
        }

        else if (value == 4 || value == "4") {
            tname = "oTableOtherMembership";
        }

    }

    s.btn_action_educationinfo = function () {
        validate_check = false;

        $('#main_modal_education').on('shown.bs.modal', function () {

            $('.nav-tabs a[href="#tabeduc-1"]').tab('show');

        });

        validate_check = false;

        tname = "oTableEducation";


        s.ModalTitle = "Edit Educational Background & Eligibility"


        clearEntry();
        h.post("../cSSPDS/GetEducationalInfoData").then(function (d) {

            if (d.data.message == "success") {
                s.datalistgridEducation = [];
                s.datalistgridEligibility = [];
                s.txtb_empl_id = d.data.empl_id
                s.educational_level = d.data.educational_level
             
                
                if (d.data.personnel_educ_tbl.length > 0) {
                    s.datalistgridEducation = d.data.personnel_educ_tbl;
                    s.oTableEducation.fnClearTable();
                    s.oTableEducation.fnAddData(s.datalistgridEducation)
                }
                else {
                    s.oTableEducation.fnClearTable();
                }

                if (d.data.personnel_csceligibility_tbl.length > 0) {

                    s.datalistgridEligibility = d.data.personnel_csceligibility_tbl;
                    s.oTableEligibility.fnClearTable();
                    s.oTableEligibility.fnAddData(s.datalistgridEligibility)
                }
                else {
                    s.oTableEligibility.fnClearTable();
                }
                
                $("#main_modal_education").modal({
                    keyboard: false,
                    backdrop: "static"
                })


            }


        })




    }

    s.btn_action_workinfo = function () {
        validate_check = false;
        s.ModalTitle = "Edit Voluntary Work & Work Experience"
        $('#main_modal_work').on('shown.bs.modal', function () {

            $('.nav-tabs a[href="#tabwork-1"]').tab('show');

        });


        tname = "oTableWorkExp";

        clearEntry();
        h.post("../cSSPDS/GetWorkInfoData").then(function (d) {

            if (d.data.message == "success") {
                s.datalistgridWorkExp = [];
                s.datalistgridVolWork = [];
                s.txtb_empl_id = d.data.empl_id

                if (d.data.personnel_workexprnce_tbl.length > 0) {

                    s.datalistgridWorkExp = d.data.personnel_workexprnce_tbl;
                    s.oTableWorkExp.fnClearTable();
                    s.oTableWorkExp.fnAddData(s.datalistgridWorkExp)
                }
                else {
                    s.oTableWorkExp.fnClearTable();
                }

                if (d.data.personnel_voluntarywork_tbl.length > 0) {

                    s.datalistgridVolWork = d.data.personnel_voluntarywork_tbl;
                    s.oTableVolWork.fnClearTable();
                    s.oTableVolWork.fnAddData(s.datalistgridVolWork)
                }
                else {
                    s.oTableVolWork.fnClearTable();
                }

                
                $("#main_modal_work").modal({
                    keyboard: false,
                    backdrop: "static"
                })

            }


        })





    }

    s.btn_action_learninfo = function () {
        validate_check = false;
        s.ModalTitle = "Edit Learning & Development/Other"
        $('#main_modal_learn').on('shown.bs.modal', function () {

            $('.nav-tabs a[href="#tablearn-1"]').tab('show');

        });
        tname = "oTableLandD";
        clearEntry();
        

        h.post("../cSSPDS/GetLearnInfoData").then(function (d) {

            if (d.data.message == "success") {
                s.datalistgridLandD = []
                s.datalistgridOtherSkills = []
                s.datalistgridOtherRecognition = []
                s.txtb_empl_id = d.data.empl_id

                if (d.data.personnel_learnanddevt_tbl.length > 0) {

                    s.datalistgridLandD = d.data.personnel_learnanddevt_tbl;
                    s.oTableLandD.fnClearTable();
                    s.oTableLandD.fnAddData(s.datalistgridLandD)
                }
                else {
                    s.oTableLandD.fnClearTable();
                }

                if (d.data.personnelotherinfo_tblSkills.length > 0)
                {

                    s.datalistgridOtherSkills = d.data.personnelotherinfo_tblSkills;
                    s.oTableOtherSkills.fnClearTable();
                    s.oTableOtherSkills.fnAddData(s.datalistgridOtherSkills)
                }
                else
                {
                    s.oTableOtherSkills.fnClearTable();
                }

                if (d.data.personnelotherinfo_tblRecognition.length > 0)
                {

                    s.datalistgridOtherRecognition = d.data.personnelotherinfo_tblRecognition;
                    s.oTableOtherRecognition.fnClearTable();
                    s.oTableOtherRecognition.fnAddData(s.datalistgridOtherRecognition)
                }
                else
                {
                    s.oTableOtherRecognition.fnClearTable();
                }

                if (d.data.personnelotherinfo_tblMembership.length > 0) {

                    s.datalistgridOtherMembership = d.data.personnelotherinfo_tblMembership;
                    s.oTableOtherMembership.fnClearTable();
                    s.oTableOtherMembership.fnAddData(s.datalistgridOtherMembership)
                }
                else {
                    s.oTableOtherMembership.fnClearTable();
                }

                // ***************************************************
                // ******** Addtional Learning and Development *******
                // ***************************************************
                s.GetAdditionalLearnDev(d.data.empl_id);
                // ***************************************************

                
                $("#main_modal_learn").modal({
                    keyboard: false,
                    backdrop: "static"
                })

            }


        })


    }

    s.btn_action_refinfo = function () {
        validate_check = false;
        s.ModalTitle = "Edit Reference Information"
        //$("#btn_personnelinfologo").removeClass("fa fa-long-arrow-right");
        //$("#btn_personnelinfologo").addClass("fa fa-spinner fa-spin");
        $('a[href="#cancel"]').hide();
        $('a[href="#finish"]').hide();
        $('#main_modal_ref').on('shown.bs.modal', function () {

            $('.nav-tabs a[href="#tabref-1"]').tab('show');

        });
        tname = "oTableRef"
        clearEntry();
        validate_check = false;

        h.post("../cSSPDS/GetRefInfoData").then(function (d) {

            if (d.data.message == "success") {
                s.datalistgridRef = []
                s.txtb_empl_id = d.data.empl_id

                if (d.data.personnelreference_tbl.length > 0)
                {

                    s.datalistgridRef = d.data.personnelreference_tbl;
                    s.oTableRef.fnClearTable();
                    s.oTableRef.fnAddData(s.datalistgridRef)
                }
                else
                {
                    s.oTableRef.fnClearTable();
                }
                
                s.admistering_oath = d.data.vw_personnel_admistering_oath

                var dateconvert;

                if (d.data.personnelstatutory_tbl != null) {
                    $("#chk_stat_ques34a").prop('checked', d.data.personnelstatutory_tbl.stat_ques34a);
                    $("#chk_stat_ques34b").prop('checked', d.data.personnelstatutory_tbl.stat_ques34b);
                    $("#txtb_stat_ques34_dtl").val(d.data.personnelstatutory_tbl.stat_ques34_dtl)
                    $("#chk_stat_ques35a").prop('checked', d.data.personnelstatutory_tbl.stat_ques35a);
                    $("#txtb_stat_ques35a_dtl").val(d.data.personnelstatutory_tbl.stat_ques35a_dtl)

                    $("#chk_stat_ques35b").prop('checked', d.data.personnelstatutory_tbl.stat_ques35b);
                    if (d.data.personnelstatutory_tbl.stat_ques35b_dtls_date == null || d.data.personnelstatutory_tbl.stat_ques35b_dtls_date == "" || d.data.personnelstatutory_tbl.stat_ques35b_dtls_date == '1900-01-01') {
                        d.data.personnelstatutory_tbl.stat_ques35b_dtls_date = '1900-01-01'
                    }
                    datevalue = new Date(parseInt(d.data.personnelstatutory_tbl.stat_ques35b_dtls_date.replace("/Date(", "").replace(")/", ""), 10));

                    if (datevalue.getFullYear() <= 1970) {
                        dateconvert = "";
                    }
                    else {
                        dateconvert = datevalue.getFullYear().toString() + "-" + ((datevalue.getMonth() + 1).toString().length == 2 ? (datevalue.getMonth() + 1).toString() : "0" + (datevalue.getMonth() + 1).toString()) + "-" + (datevalue.getDate().toString().length == 2 ? datevalue.getDate().toString() : "0" + datevalue.getDate().toString())

                    }

                    $("#txtb_stat_ques35b_dtls_date").val(dateconvert)
                    $("#txtb_stat_ques35b_dtls_status").val(d.data.personnelstatutory_tbl.stat_ques35b_dtls_status)
                    $("#chk_stat_ques36").prop('checked', d.data.personnelstatutory_tbl.stat_ques36);
                    $("#txtb_stat_ques36_dtl").val(d.data.personnelstatutory_tbl.stat_ques36_dtl)
                    $("#chk_stat_ques37").prop('checked', d.data.personnelstatutory_tbl.stat_ques37);
                    $("#txtb_stat_ques37_dtl").val(d.data.personnelstatutory_tbl.stat_ques37_dtl)
                    $("#chk_stat_ques38a").prop('checked', d.data.personnelstatutory_tbl.stat_ques38a);
                    $("#txtb_stat_ques38a_dtl").val(d.data.personnelstatutory_tbl.stat_ques38a_dtl)
                    $("#chk_stat_ques38b").prop('checked', d.data.personnelstatutory_tbl.stat_ques38b);
                    $("#txtb_stat_ques38b_dtl").val(d.data.personnelstatutory_tbl.stat_ques38b_dtl)
                    $("#chk_stat_ques39").prop('checked', d.data.personnelstatutory_tbl.stat_ques39);
                    $("#txtb_stat_ques39_dtl").val(d.data.personnelstatutory_tbl.stat_ques39_dtl)
                    $("#chk_stat_ques40a").prop('checked', d.data.personnelstatutory_tbl.stat_ques40a);
                    $("#txtb_stat_ques40a_dtl").val(d.data.personnelstatutory_tbl.stat_ques40a_dtl)
                    $("#chk_stat_ques40b").prop('checked', d.data.personnelstatutory_tbl.stat_ques40b);
                    $("#txtb_stat_ques40b_dtl").val(d.data.personnelstatutory_tbl.stat_ques40b_dtl)
                    $("#chk_stat_ques40c ").prop('checked', d.data.personnelstatutory_tbl.stat_ques40c);
                    $("#txtb_stat_ques40c_dtl").val(d.data.personnelstatutory_tbl.stat_ques40c_dtl)
                    $("#txtb_gov_issued").val(d.data.personnelstatutory_tbl.govt_issued_id)
                    $("#txtb_gov_issued_nbr").val(d.data.personnelstatutory_tbl.govt_issued_id_nbr)
                    $("#txtb_dateplace_issuance").val(d.data.personnelstatutory_tbl.date_place_issuance)
                    $("#txtb_printing_date").val(d.data.personnelstatutory_tbl.printing_date)
                    s.ddl_administering = d.data.personnelstatutory_tbl.department_code
                   
                }





                //$("#main_modal_ref").modal("show")
                $("#main_modal_ref").modal({
                    keyboard: false,
                    backdrop: "static"
                })

            }


        })


    }



    //This function is called to extract the DataTable rows data
    function DataTable_data(tname) {
        var data = []
        var id = s[tname][0].id;
        var dtrw = $("#" + id).DataTable().rows().data()
        for (var x = 0; x < dtrw.length; ++x) {
            data.push(dtrw[x])
        }
        return data
    }

    //delete row in dataTable
    s.btn_delete_action = function (id_ss) {
        s.isAction = "DELETE"

        swal({
            title: "Are you sure to delete this record?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(function (willDelete) {
            if (willDelete) {
                s[tname].fnDeleteRow(id_ss, null, true);
                if (tname == "oTableChildren")
                {
                    var child_row_info = s.datalistgridChildren[id_ss];
                    h.post("../cSSPDS/DeleteFromDatabase", {
                          par_data: child_row_info
                        , db_table: "children_tbl"
                    }).then(function (d)
                    {
                        if (d.data.message == "success") {
                            s.datalistgridChildren = DataTable_data(tname)
                            if (s.datalistgridChildren.length > 0) {

                                s[tname].fnClearTable();
                                s[tname].fnAddData(s.datalistgridChildren)
                            }

                            else {
                                s[tname].fnClearTable();
                            }
                        }
                        else
                        {
                            alert(d.data.message);
                        }
                        
                    });
                    

                }

                else if (tname == "oTableEducation") {

                    var educ_row_info = s.datalistgridEducation[id_ss];
                    h.post("../cSSPDS/DeleteFromDatabase", {
                        par_data: educ_row_info
                        , db_table: "education_tbl"
                    }).then(function (d) {
                        if (d.data.message == "success") {
                            s.datalistgridEducation = DataTable_data(tname)
                            if (s.datalistgridEducation.length > 0) {

                                s[tname].fnClearTable();
                                s[tname].fnAddData(s.datalistgridEducation)
                            }

                            else {
                                s[tname].fnClearTable();
                            }
                        }
                        else
                        {
                            alert(d.data.message);
                        }
                    });

                   
                }

                else if (tname == "oTableEligibility") {

                    var csc_row_info = s.datalistgridEligibility[id_ss];
                    h.post("../cSSPDS/DeleteFromDatabase", {
                          par_data: csc_row_info
                        , db_table: "csc_tbl"
                    }).then(function (d) {
                        if (d.data.message == "success")
                        {
                            s.datalistgridEligibility = DataTable_data(tname)
                            if (s.datalistgridEligibility.length > 0) {

                                s[tname].fnClearTable();
                                s[tname].fnAddData(s.datalistgridEligibility)
                            }

                            else {
                                s[tname].fnClearTable();
                            }
                        }
                        else {
                            alert(d.data.message);
                        }
                    });
                    
                }

                else if (tname == "oTableWorkExp")
                {
                    var workexp_row_info = s.datalistgridWorkExp[id_ss];
                    h.post("../cSSPDS/DeleteFromDatabase", {
                         par_data: workexp_row_info
                        , db_table: "workexp_tbl"
                    }).then(function (d)
                    {
                        if (d.data.message == "success")
                        {
                            s.datalistgridWorkExp = DataTable_data(tname)
                            if (s.datalistgridWorkExp.length > 0) {

                                s[tname].fnClearTable();
                                s[tname].fnAddData(s.datalistgridWorkExp)
                            }

                            else {
                                s[tname].fnClearTable();
                            }
                        }
                        else
                        {
                            alert(d.data.message);
                        }
                    });
                    
                }

                else if (tname == "oTableVolWork") {
                    var voluntary_row_info = s.datalistgridVolWork[id_ss];
                    h.post("../cSSPDS/DeleteFromDatabase", {
                        par_data: voluntary_row_info
                        , db_table: "voluntary_tbl"
                    }).then(function (d) {
                        if (d.data.message == "success")
                        {
                            s.datalistgridVolWork = DataTable_data(tname)
                            if (s.datalistgridVolWork.length > 0) {

                                s[tname].fnClearTable();
                                s[tname].fnAddData(s.datalistgridVolWork)
                            }

                            else {
                                s[tname].fnClearTable();
                            }
                        }
                        else
                        {
                            alert(d.data.message);
                        }
                    });
                    
                }

                else if (tname == "oTableLandD")
                {
                    var lnd_row_info = s.datalistgridLandD[id_ss];
                    h.post("../cSSPDS/DeleteFromDatabase", {
                        par_data: lnd_row_info
                        , db_table: "lnd_tbl"
                    }).then(function (d) {
                        if (d.data.message == "success")
                        {
                            s.datalistgridLandD = DataTable_data(tname)
                            if (s.datalistgridLandD.length > 0) {

                                s[tname].fnClearTable();
                                s[tname].fnAddData(s.datalistgridLandD)
                            }

                            else {
                                s[tname].fnClearTable();
                            }
                        }
                        else
                        {
                            alert(d.data.message);
                        }
                    });
                }
                
                else if (tname == "oTableOtherSkills")
                {
                    var other_info = s.datalistgridOtherSkills[id_ss];
                    h.post("../cSSPDS/DeleteFromDatabase", {
                        par_data: other_info
                        , db_table: "otherinfo_tbl"
                    }).then(function (d)
                    {
                        if (d.data.message == "success")
                        {
                            s.datalistgridOtherSkills = DataTable_data(tname)
                            if (s.datalistgridOtherSkills.length > 0) {

                                s[tname].fnClearTable();
                                s[tname].fnAddData(s.datalistgridOtherSkills)
                            }
                            else {
                                s[tname].fnClearTable();
                            }
                        }
                        else
                        {
                            alert(d.data.message);
                        }
                    });
                }

                else if (tname == "oTableOtherRecognition") {
                    var other_info = s.datalistgridOtherRecognition[id_ss];
                    h.post("../cSSPDS/DeleteFromDatabase", {
                        par_data: other_info
                        , db_table: "otherinfo_tbl"
                    }).then(function (d) {
                        if (d.data.message == "success")
                        {
                            s.datalistgridOtherRecognition = DataTable_data(tname)
                            if (s.datalistgridOtherRecognition.length > 0) {

                                s[tname].fnClearTable();
                                s[tname].fnAddData(s.datalistgridOtherRecognition)
                            }

                            else {
                                s[tname].fnClearTable();
                            }
                        }
                        else
                        {
                            alert(d.data.message);
                        }
                    });   
                }

                else if (tname == "oTableOtherMembership")
                {
                    var other_info = s.datalistgridOtherMembership[id_ss];
                    h.post("../cSSPDS/DeleteFromDatabase", {
                        par_data: other_info
                        , db_table: "otherinfo_tbl"
                    }).then(function (d)
                    {
                        if (d.data.message == "success")
                        {
                            s.datalistgridOtherMembership = DataTable_data(tname)
                            if (s.datalistgridOtherMembership.length > 0) {

                                s[tname].fnClearTable();
                                s[tname].fnAddData(s.datalistgridOtherMembership)
                            }

                            else {
                                s[tname].fnClearTable();
                            }
                        }
                        else
                        {
                            alert(d.data.message);
                        }
                    });
                    
                }

                else if (tname == "oTableRef")
                {
                    var ref_info = s.datalistgridRef[id_ss];
                    h.post("../cSSPDS/DeleteFromDatabase", {
                        par_data: ref_info
                        , db_table: "reference_tbl"
                    }).then(function (d)
                    {
                        if (d.data.message == "success")
                        {
                            s.datalistgridRef = DataTable_data(tname)
                            if (s.datalistgridRef.length > 0) {

                                s[tname].fnClearTable();
                                s[tname].fnAddData(s.datalistgridRef)
                            }

                            else {
                                s[tname].fnClearTable();
                            }
                        }
                        else {
                            alert(d.data.message);
                        }
                    });
                }

                swal("Your Record has been Successfully Deleted!", { icon: "success", });
                clearEntry();
            }

        })
    }

    //Edit row in dataTable

    s.btn_edit_action = function (id_ss) {
        index_update = id_ss

        if (tname == "oTableChildren")
        {
            s.isShowUpdateChild = true
            s.isShowAddChild = false;
            $("#txtb_child_name ").val(s.datalistgridChildren[id_ss].children_name)
            $("#txtb_child_birth").val(s.datalistgridChildren[id_ss].birth_date)

        }

        if (tname == "oTableEducation")
        {
            
            s.isShowUpdateEduc = true
            s.isShowAddEduc = false;
        
            $("#ddl_educational_level").val(s.datalistgridEducation[id_ss].educ_type)
            $("#txtb_school_periodfrom").val(s.datalistgridEducation[id_ss].period_from)
            $("#txtb_school_periodto").val(s.datalistgridEducation[id_ss].period_to)
            $("#txtb_school_yeargrad").val(s.datalistgridEducation[id_ss].year_graduated)
            $("#txtb_school_name").val(s.datalistgridEducation[id_ss].school_name)
            $("#txtb_school_educcourse").val(s.datalistgridEducation[id_ss].basic_educ_deg)
            $("#txtb_school_highlvl").val(s.datalistgridEducation[id_ss].highest_lvl_earned)
            $("#txtb_school_honors").val(s.datalistgridEducation[id_ss].schlr_acdmic_rcvd)
            
        }

        if (tname == "oTableEligibility")
        {
            
            s.isShowUpdateCSC = true
            s.isShowAddCSC = false;

            $("#txtb_csc_career").val(s.datalistgridEligibility[id_ss].cscsrvc_ra1080)
            $("#txtb_csc_place").val(s.datalistgridEligibility[id_ss].examination_place)
            $("#txtb_csc_date_exam").val(s.datalistgridEligibility[id_ss].examination_date)
            $("#txtb_csc_date_validity").val(s.datalistgridEligibility[id_ss].validity_date)
            $("#txtb_csc_number").val(s.datalistgridEligibility[id_ss].number)
            $("#txtb_csc_rating").val(s.datalistgridEligibility[id_ss].rating)

        }

        if (tname == "oTableWorkExp")
        {
            
            s.isShowUpdateWorkExp = true
            s.isShowAddWorkExp = false;
            $("#txtb_workexp_periodfrom").val(s.datalistgridWorkExp[id_ss].workexp_from)
            $("#txtb_workexp_periodto").val(s.datalistgridWorkExp[id_ss].workexp_to)
            $("#txtb_workexp_position").val(s.datalistgridWorkExp[id_ss].position_title)
            $("#txtb_workexp_dept").val(s.datalistgridWorkExp[id_ss].dept_agncy_offc_co)
            $("#txtb_workexp_salary").val(s.datalistgridWorkExp[id_ss].monthly_salary)
            $("#txtb_workexp_grade").val(s.datalistgridWorkExp[id_ss].salary_job_grade)
            $("#txtb_workexp_status").val(s.datalistgridWorkExp[id_ss].appt_status)
            $("#ddl_workexp_govt").val(s.datalistgridWorkExp[id_ss].gov_srvc.toString())

        }

        if (tname == "oTableVolWork")
        {
           
            s.isShowUpdateVolWork = true
            s.isShowAddVolWork = false;

            $("#txtb_voluntary_periodfrom").val(s.datalistgridVolWork[id_ss].voluntarywork_from)
            $("#txtb_voluntary_periodto").val(s.datalistgridVolWork[id_ss].voluntarywork_to)
            $("#txtb_voluntary_hours").val(s.datalistgridVolWork[id_ss].no_of_hrs)
            $("#txtb_voluntary_narmeorg").val(s.datalistgridVolWork[id_ss].name_address_org)
            $("#txtb_voluntary_position").val(s.datalistgridVolWork[id_ss].position_title)
        }


        if (tname == "oTableLandD")
        {

            // ************************************************************************
            // ** 2022-07-14 - VJA - Checking for Already exist on API table **********
            // ************************************************************************
            h.post("../cSSPDS/CheckingLearningAndDev_Exists",
                {
                    p_empl_id : s.datalistgridLandD[id_ss].empl_id
                    ,p_seq_no : s.datalistgridLandD[id_ss].seq_no
                }).then(function (d)
                {
                    var if_exist = false;
                    // if (d.data.message == "already-exists") // Or Data Exist on this Table
                    // {
                    //     swal("You cannot edit this Learning and Development Information", "Name of Event: \n" + s.datalistgridLandD[id_ss].learn_devt_title + "\n \n Delete the data instead and check again to update this information", {icon:"warning"})
                    // }
                    // else
                    // {
                        for (var i = 0; i < s.datalist_data_api.length; i++)
                        {
                            if (s.datalist_data_api[i].reftrain.train_desc.toUpperCase().trim() == s.datalistgridLandD[id_ss].learn_devt_title.toUpperCase().trim() ||
                                d.data.message == "already-exists")
                            {
                                if_exist = true
                                swal("This entry is already exist on LDNF record, Are you sure you want to update/override this Information?", 'Once updated/overridden, the information is not equal to LDNF record. \n \n Name of Event: \n ' + s.datalistgridLandD[id_ss].learn_devt_title + '\n \n' + s.datalistgridLandD[id_ss].learn_devt_from + ' - ' + s.datalistgridLandD[id_ss].learn_devt_to,
                                {
                                    icon: "warning",
                                    buttons: {
                                        defeat:
                                        {
                                            value       : "defeat",
                                            text        : "Close"
                                        },
                                        continue_anyway:
                                        {
                                            text        : "OK, Continue",
                                            value       : "continue_anyway"
                                        }
                                    }
                                }).then((value) => {
                                    switch (value)
                                    {
                                        case "continue_anyway":
                                            s.isShowUpdateLearn = true
                                            s.isShowAddLearn = false;

                                            $("#txtb_learn_periodfrom").val(s.datalistgridLandD[id_ss].learn_devt_from)
                                            $("#txtb_learn_periodto").val(s.datalistgridLandD[id_ss].learn_devt_to)
                                            $("#txtb_learn_hours").val(s.datalistgridLandD[id_ss].no_of_hrs)
                                            $("#txtb_learn_title").val(s.datalistgridLandD[id_ss].learn_devt_title)
                                            $("#txtb_learn_type").val(s.datalistgridLandD[id_ss].learn_devt_type)
                                            $("#txtb_learn_conduct").val(s.datalistgridLandD[id_ss].conducted_by)

                                            break;
                                        default:

                                            s.isShowUpdateLearn = false
                                            s.isShowAddLearn = true;

                                            $("#txtb_learn_periodfrom").val("")
                                            $("#txtb_learn_periodto").val("")
                                            $("#txtb_learn_hours").val("")
                                            $("#txtb_learn_title").val("")
                                            $("#txtb_learn_type").val("")
                                            $("#txtb_learn_conduct").val("")
                                            swal("Cancel Request!", "Your Request is already Cancelled!", { icon: "warning" });
                                    }
                                });
                            }
                        }
                        if (if_exist == false)
                        {

                         s.isShowUpdateLearn = true
                         s.isShowAddLearn = false;
                        
                         $("#txtb_learn_periodfrom").val(s.datalistgridLandD[id_ss].learn_devt_from)
                         $("#txtb_learn_periodto").val(s.datalistgridLandD[id_ss].learn_devt_to)
                         $("#txtb_learn_hours").val(s.datalistgridLandD[id_ss].no_of_hrs)
                         $("#txtb_learn_title").val(s.datalistgridLandD[id_ss].learn_devt_title)
                         $("#txtb_learn_type").val(s.datalistgridLandD[id_ss].learn_devt_type)
                         $("#txtb_learn_conduct").val(s.datalistgridLandD[id_ss].conducted_by)

                        }

                    //}
                })
            // ***************************************************
            // ***************************************************

        }

        if (tname == "oTableOtherSkills")
        {
            s.isShowUpdateOtherSkills = true
            s.isShowAddOtherSkills = false;
            $("#txtb_other_skill").val(s.datalistgridOtherSkills[id_ss].descr)
        }

        if (tname == "oTableOtherRecognition") {
            s.isShowUpdateOtherRecognition = true
            s.isShowAddOtherRecognition = false;
            $("#txtb_other_nonacad").val(s.datalistgridOtherRecognition[id_ss].descr)
        }

        if (tname == "oTableOtherMembership") {
            s.isShowUpdateOtherMembership = true
            s.isShowAddOtherMembership = false;
            $("#txtb_other_assoc").val(s.datalistgridOtherMembership[id_ss].descr)
        }

        if (tname == "oTableRef")
        {
            s.isShowUpdateRef = true
            s.isShowAddRef = false;

            $("#txtb_ref_name").val(s.datalistgridRef[id_ss].ref_name)
            $("#txtb_ref_address").val(s.datalistgridRef[id_ss].ref_address)
            $("#txtb_ref_tel").val(s.datalistgridRef[id_ss].ref_contact)
        }


    }

    s.btn_update_details_action = function () {

        validate_check = true;

        if (tname == "oTableChildren") {
            if (isdataValidatedChildren())
            {

                s.datalistgridChildren[index_update].children_name  = $("#txtb_child_name").val()
                s.datalistgridChildren[index_update].birth_date     = $("#txtb_child_birth").val()
                var child_row_info = s.datalistgridChildren[index_update];
                h.post("../cSSPDS/SaveDirectToDatabase", {
                      par_data: child_row_info
                    , par_action_type: "EDIT"
                    , db_table: "children_tbl"
                }).then(function (d) {
                    if (d.data.message == "success")
                    {
                        s.oTableChildren.fnClearTable();
                        s.oTableChildren.fnAddData(s.datalistgridChildren)

                        for (var x = 1; x <= $('#datalist_gridChildren').DataTable().page.info().pages; x++) {
                            if (get_page(s.datalistgridChildren[index_update].seq_no, "datalist_gridChildren") == false) {
                                s.oTableChildren.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }

                        s.isShowUpdateChild = false
                        s.isShowAddChild = true;

                        swal("Successfully Updated!", "Current Record has been Successfully Updated!", "success");
                        clearEntry()
                    }
                    else {
                        alert(d.data.message);
                    }
                });
                
            }


        }

        if (tname == "oTableEducation") {

            if (isdataValidatedEducation()) {

                s.datalistgridEducation[index_update].educ_type = $("#ddl_educational_level option:selected").val()
                s.datalistgridEducation[index_update].educ_short_descr = $("#ddl_educational_level option:selected").html()
                s.datalistgridEducation[index_update].period_from = $("#txtb_school_periodfrom").val()
                s.datalistgridEducation[index_update].period_to = $("#txtb_school_periodto").val()
                s.datalistgridEducation[index_update].year_graduated = $("#txtb_school_yeargrad").val()
                s.datalistgridEducation[index_update].school_name = $("#txtb_school_name").val()
                s.datalistgridEducation[index_update].basic_educ_deg = $("#txtb_school_educcourse").val()
                s.datalistgridEducation[index_update].highest_lvl_earned = $("#txtb_school_highlvl").val()
                s.datalistgridEducation[index_update].schlr_acdmic_rcvd = $("#txtb_school_honors").val()

                var educ_row_info = s.datalistgridEducation[index_update];
                h.post("../cSSPDS/SaveDirectToDatabase", {
                    par_data: educ_row_info
                    , par_action_type: "EDIT"
                    , db_table: "education_tbl"
                }).then(function (d) {
                    if (d.data.message == "success") 
                    {

                        s.oTableEducation.fnClearTable();
                        s.oTableEducation.fnAddData(s.datalistgridEducation)

                        for (var x = 1; x <= $('#datalist_gridEducation').DataTable().page.info().pages; x++) {
                            if (get_page(s.datalistgridEducation[index_update].seq_no, "datalist_gridEducation") == false) {
                                s.oTableEducation.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }

                        swal("Successfully Updated!", "Current Record has been Successfully Updated!", "success");
                        clearEntry()
                    }
                    else {
                        alert(d.data.message);
                    }
                });
            }
        }

        if (tname == "oTableEligibility") {

            if (isdataValidatedEligibility()) {

                s.datalistgridEligibility[index_update].cscsrvc_ra1080      = $("#txtb_csc_career").val()
                s.datalistgridEligibility[index_update].examination_place   = $("#txtb_csc_place").val()
                s.datalistgridEligibility[index_update].examination_date    = $("#txtb_csc_date_exam").val()
                s.datalistgridEligibility[index_update].validity_date       = $("#txtb_csc_date_validity").val()
                s.datalistgridEligibility[index_update].number              = $("#txtb_csc_number").val()
                s.datalistgridEligibility[index_update].rating              = $("#txtb_csc_rating").val()
                s.datalistgridEligibility[index_update].csc_type_code       = $("#ddl_csc_type").val()

                var csc_row_info = s.datalistgridEligibility[index_update];
                h.post("../cSSPDS/SaveDirectToDatabase", {
                      par_data: csc_row_info
                    , par_action_type: "EDIT"
                    , db_table: "csc_tbl"
                }).then(function (d)
                {
                    if (d.data.message == "success")
                    {
                        s.oTableEligibility.fnClearTable();
                        s.oTableEligibility.fnAddData(s.datalistgridEligibility)

                        for (var x = 1; x <= $('#datalist_gridEligibility').DataTable().page.info().pages; x++) {
                            if (get_page(s.datalistgridEligibility[index_update].seq_no, "datalist_gridEligibility") == false) {
                                s.oTableEligibility.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }

                        swal("Successfully Updated!", "Current Record has been Successfully Updated!", "success");
                        clearEntry()
                    }
                    else
                    {
                        alert(d.data.message);
                    }
                });
            }

        }


        if (tname == "oTableWorkExp") {

            if (isdataValidatedWorkExp()) {

                s.datalistgridWorkExp[index_update].workexp_from        = $("#txtb_workexp_periodfrom").val()
                s.datalistgridWorkExp[index_update].workexp_to          = $("#txtb_workexp_periodto").val()
                s.datalistgridWorkExp[index_update].position_title      = $("#txtb_workexp_position").val()
                s.datalistgridWorkExp[index_update].dept_agncy_offc_co  = $("#txtb_workexp_dept").val()
                s.datalistgridWorkExp[index_update].monthly_salary      = parseFloat($("#txtb_workexp_salary").val())
                s.datalistgridWorkExp[index_update].salary_job_grade    = $("#txtb_workexp_grade").val()
                s.datalistgridWorkExp[index_update].appt_status         = $("#txtb_workexp_status").val()
                s.datalistgridWorkExp[index_update].gov_srvc            = $("#ddl_workexp_govt").val()

                var workexp_row_info = s.datalistgridWorkExp[index_update];
                h.post("../cSSPDS/SaveDirectToDatabase", {
                    par_data: workexp_row_info
                    , par_action_type: "EDIT"
                    , db_table: "workexp_tbl"
                }).then(function (d)
                {
                    if (d.data.message == "success") {

                        s.oTableWorkExp.fnClearTable();
                        s.oTableWorkExp.fnAddData(s.datalistgridWorkExp)

                        for (var x = 1; x <= $('#datalist_gridWorkExp').DataTable().page.info().pages; x++) {
                            if (get_page(s.datalistgridWorkExp[index_update].seq_no, "datalist_gridWorkExp") == false) {
                                s.oTableWorkExp.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }

                        swal("Successfully Updated!", "Current Record has been Successfully Updated!", "success");
                        clearEntry()
                    }
                    else
                    {
                        alert(d.data.message);
                    }
                });
            }

        }

        if (tname == "oTableVolWork") {

            if (isdataValidatedVolWork()) {

                s.datalistgridVolWork[index_update].voluntarywork_from  = $("#txtb_voluntary_periodfrom").val()
                s.datalistgridVolWork[index_update].voluntarywork_to    = $("#txtb_voluntary_periodto").val()
                s.datalistgridVolWork[index_update].name_address_org    = $("#txtb_voluntary_narmeorg").val()
                s.datalistgridVolWork[index_update].no_of_hrs           = parseFloat($("#txtb_voluntary_hours").val())
                s.datalistgridVolWork[index_update].position_title      = $("#txtb_voluntary_position").val()

                var voluntary_row_info = s.datalistgridVolWork[index_update];
                h.post("../cSSPDS/SaveDirectToDatabase", {
                      par_data: voluntary_row_info
                    , par_action_type: "EDIT"
                    , db_table: "voluntary_tbl"
                }).then(function (d) {
                    if (d.data.message == "success")
                    {
                        s.oTableVolWork.fnClearTable();
                        s.oTableVolWork.fnAddData(s.datalistgridVolWork)
                        for (var x = 1; x <= $('#datalist_gridVolWork').DataTable().page.info().pages; x++) {
                            if (get_page(s.datalistgridVolWork[index_update].seq_no, "datalist_gridVolWork") == false) {
                                s.oTableVolWork.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }
                        swal("Successfully Updated!", "Current Record has been Successfully Updated!", "success");
                        clearEntry()
                    }
                    else
                    {
                        alert(d.data.message);
                    }
                });
            }

        }


        if (tname == "oTableLandD") {
            if (isdataValidatedLandD()) {

                s.datalistgridLandD[index_update].learn_devt_from   = $("#txtb_learn_periodfrom").val()
                s.datalistgridLandD[index_update].learn_devt_to     = $("#txtb_learn_periodto").val()
                s.datalistgridLandD[index_update].no_of_hrs         = parseFloat($("#txtb_learn_hours").val())
                s.datalistgridLandD[index_update].learn_devt_title  = $("#txtb_learn_title").val()
                s.datalistgridLandD[index_update].learn_devt_type   = $("#txtb_learn_type").val()
                s.datalistgridLandD[index_update].conducted_by      = $("#txtb_learn_conduct").val()

                var lnd_row_info = s.datalistgridLandD[index_update];
                h.post("../cSSPDS/SaveDirectToDatabase", {
                      par_data: lnd_row_info
                    , par_action_type: "EDIT"
                    , db_table: "lnd_tbl"
                }).then(function (d) {
                    if (d.data.message == "success")
                    {
                        s.oTableLandD.fnClearTable();
                        s.oTableLandD.fnAddData(s.datalistgridLandD)

                        for (var x = 1; x <= $('#datalist_gridLandD').DataTable().page.info().pages; x++) {
                            if (get_page(s.datalistgridLandD[index_update].seq_no, "datalist_gridLandD") == false) {
                                s.oTableLandD.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }

                        swal("Successfully Updated!", "Current Record has been Successfully Updated!", "success");
                        clearEntry()
                    }
                    else
                    {
                        alert(d.data.message);
                    }
                });
            }
        }

        if (tname == "oTableOtherSkills") {
            if (isdataValidatedOtherSkills()) {

                s.datalistgridOtherSkills[index_update].descr = $("#txtb_other_skill").val()
                var other_row_info = s.datalistgridOtherSkills[index_update];
                h.post("../cSSPDS/SaveDirectToDatabase", {
                      par_data: other_row_info
                    , par_action_type: "EDIT"
                    , db_table: "otherinfo_tbl"
                }).then(function (d) {
                    if (d.data.message == "success")
                    {
                        s.oTableOtherSkills.fnClearTable();
                        s.oTableOtherSkills.fnAddData(s.datalistgridOtherSkills)

                        for (var x = 1; x <= $('#datalist_gridOtherSkills').DataTable().page.info().pages; x++) {
                            if (get_page(s.datalistgridOtherSkills[index_update].seq_no, "datalist_gridOtherSkills") == false) {
                                s.oTableOtherSkills.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }

                        swal("Successfully Updated!", "Current Record has been Successfully Updated!", "success");
                        clearEntry()
                    }
                    else
                    {
                        alert(d.data.message);
                    }
                });
            }
        }

        if (tname == "oTableOtherRecognition") {
            if (isdataValidatedOtherRecognition()) {

                s.datalistgridOtherRecognition[index_update].descr = $("#txtb_other_nonacad").val()

                var other_row_info = s.datalistgridOtherRecognition[index_update];
                h.post("../cSSPDS/SaveDirectToDatabase", {
                      par_data: other_row_info
                    , par_action_type: "EDIT"
                    , db_table: "otherinfo_tbl"
                }).then(function (d) {
                    if (d.data.message == "success") {
                        s.oTableOtherRecognition.fnClearTable();
                        s.oTableOtherRecognition.fnAddData(s.datalistgridOtherRecognition)

                        for (var x = 1; x <= $('#datalist_gridOtherRecognition').DataTable().page.info().pages; x++) {
                            if (get_page(s.datalistgridOtherRecognition[index_update].seq_no, "datalist_gridOtherRecognition") == false) {
                                s.oTableOtherRecognition.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }

                        swal("Successfully Updated!", "Current Record has been Successfully Updated!", "success");
                        clearEntry()
                    }
                    else
                    {
                        alert(d.data.message);
                    }
                });
            }
        }

        if (tname == "oTableOtherMembership") {
            if (isdataValidatedOtherMembership()) {

                s.datalistgridOtherMembership[index_update].descr = $("#txtb_other_assoc").val()

                var other_row_info = s.datalistgridOtherMembership[index_update];
                h.post("../cSSPDS/SaveDirectToDatabase", {
                      par_data: other_row_info
                    , par_action_type: "EDIT"
                    , db_table: "otherinfo_tbl"
                }).then(function (d)
                {
                    if (d.data.message == "success")
                    {
                        s.oTableOtherMembership.fnClearTable();
                        s.oTableOtherMembership.fnAddData(s.datalistgridOtherMembership)

                        for (var x = 1; x <= $('#datalist_gridOtherRecognition').DataTable().page.info().pages; x++) {
                            if (get_page(s.datalistgridOtherMembership[index_update].seq_no, "datalist_gridOtherMembership") == false) {
                                s.oTableOtherMembership.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }

                        swal("Successfully Updated!", "Current Record has been Successfully Updated!", "success");
                        clearEntry()
                    }
                    else {
                        alert(d.data.message);
                    }
                });
                
            }
        }

        if (tname == "oTableRef") {
            if (isdataValidatedRef()) {
                s.datalistgridRef[index_update].ref_name    = $("#txtb_ref_name").val()
                s.datalistgridRef[index_update].ref_address = $("#txtb_ref_address").val()
                s.datalistgridRef[index_update].ref_contact = $("#txtb_ref_tel").val()
                var ref_info = s.datalistgridRef[index_update];
                h.post("../cSSPDS/SaveDirectToDatabase", {
                    par_data: ref_info
                    , par_action_type: "EDIT"
                    , db_table: "reference_tbl"
                }).then(function (d)
                {
                    if (d.data.message == "success")
                    {
                        s.oTableRef.fnClearTable();
                        s.oTableRef.fnAddData(s.datalistgridRef)

                        for (var x = 1; x <= $('#datalist_gridRef').DataTable().page.info().pages; x++) {
                            if (get_page(s.datalistgridRef[index_update].seq_no, "datalist_gridRef") == false) {
                                s.oTableRef.fnPageChange(x);
                            }
                            else {
                                break;
                            }
                        }

                        swal("Successfully Updated!", "Current Record has been Successfully Updated!", "success");
                        clearEntry()
                    }
                    else
                    {
                        alert(d.data.message);
                    }
                });
            }
        }



    }

    //**************************************//
    //***Get Page Number****//
    //**************************************//
    function get_page(seq_no, table) {
        var nakit_an = false;
        var rowx = 0;
        $('#' + table + ' tr').each(function () {
            $.each(this.cells, function (cells) {
                if (cells == 0) {
                    if ($(this).text() == seq_no) {
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

    //**************************************//
    //***Field-Validation-Color-Changed-****//
    //**************************************//
    function FieldValidationColorChanged(pMode, pObjectName) {

        if (pMode)
            switch (pObjectName) {

                case "txtb_child_name":
                    {
                        $("#txtb_child_name").addClass('require-field')
                        s.lbl_requiredfieldChildren1 = "required field!"

                        $('#txtb_child_name').focus();
                        break;
                    }

                case "txtb_child_birth":
                    {
                        $("#txtb_child_birth").addClass('require-field')
                        s.lbl_requiredfieldChildren2 = "required field!"
                        $('#txtb_child_birth').focus();
                        break;
                    }

                case "ddl_educational_level":
                    {
                        $("#ddl_educational_level").addClass('require-field')
                        s.lbl_requiredfieldEducation1 = "required field!"
                        $('#ddl_educational_level').focus();
                        break;
                    }

                case "txtb_school_periodfrom":
                    {
                        $("#txtb_school_periodfrom").addClass('require-field')
                        s.lbl_requiredfieldEducation2 = "required field!"
                        $('#txtb_school_periodfrom').focus();
                        break;
                    }

                case "txtb_school_periodto":
                    {
                        $("#txtb_school_periodto").addClass('require-field')
                        s.lbl_requiredfieldEducation3 = "required field!"
                        $('#txtb_school_periodto').focus();
                        break;
                    }

                case "txtb_school_name":
                    {
                        $("#txtb_school_name").addClass('require-field')
                        s.lbl_requiredfieldEducation4 = "required field!"
                        $('#txtb_school_name').focus();
                        break;
                    }

                case "txtb_school_educcourse":
                    {
                        $("#txtb_school_educcourse").addClass('require-field')
                        s.lbl_requiredfieldEducation5 = "required field!"
                        $('#txtb_school_educcourse').focus();
                        break;
                    }

                case "txtb_csc_career":
                    {
                        $("#txtb_csc_career").addClass('require-field')
                        s.lbl_requiredfieldEligibility1 = "required field!"
                        $('#txtb_csc_career').focus();
                        break;
                    }
                case "ddl_csc_type":
                    {
                        $("#ddl_csc_type").addClass('require-field')
                        s.lbl_requiredfieldEligibility12 = "required field!"
                        $('#ddl_csc_type').focus();
                        break;
                    }

                case "txtb_csc_number":
                    {

                        $("#txtb_csc_number").addClass('require-field')
                        s.lbl_requiredfieldEligibility2 = "required field!"
                        $('#txtb_csc_number').focus();
                        break;
                    }

                case "txtb_workexp_position":
                    {

                        $("#txtb_workexp_position").addClass('require-field')
                        s.lbl_requiredfieldWorkExp1 = "required field!"
                        $('#txtb_workexp_position').focus();
                        break;
                    }

                case "txtb_workexp_dept":
                    {

                        $("#txtb_workexp_dept").addClass('require-field')
                        s.lbl_requiredfieldWorkExp2 = "required field!"
                        $('#txtb_workexp_dept').focus();
                        break;
                    }

                case "txtb_workexp_salary":
                    {

                        $("#txtb_workexp_salary").addClass('require-field')
                        s.lbl_requiredfieldWorkExp3 = "required field!"
                        $('#txtb_workexp_salary').focus();
                        break;
                    }

                case "invalid-txtb_workexp_salary":
                    {

                        $("#txtb_workexp_salary").addClass('require-field')
                        s.lbl_requiredfieldWorkExp3 = "Numeric Values Only!"
                        $('#txtb_workexp_salary').focus();
                        break;
                    }

                case "txtb_voluntary_narmeorg":
                    {

                        $("#txtb_voluntary_narmeorg").addClass('require-field')
                        s.lbl_requiredfieldVolWork1 = "required field!"
                        $('#txtb_voluntary_narmeorg').focus();
                        break;
                    }

                case "txtb_voluntary_position":
                    {

                        $("#txtb_voluntary_position").addClass('require-field')
                        s.lbl_requiredfieldVolWork2 = "required field!"
                        $('#txtb_voluntary_position').focus();
                        break;
                    }

                case "invalid-txtb_voluntary_hours":
                    {

                        $("#txtb_voluntary_hours").addClass('require-field')
                        s.lbl_requiredfieldVolWork3 = "Numeric Values Only!"
                        $('#txtb_voluntary_hours').focus();
                        break;
                    }

                case "txtb_learn_title":
                    {

                        $("#txtb_learn_title").addClass('require-field')
                        s.lbl_requiredfieldLandD1 = "required field!"
                        $('#txtb_learn_title').focus();
                        break;
                    }

                case "txtb_learn_conduct":
                    {

                        $("#txtb_learn_conduct").addClass('require-field')
                        s.lbl_requiredfieldLandD2 = "required field!"
                        $('#txtb_learn_conduct').focus();
                        break;
                    }

                case "invalid-txtb_learn_hours":
                    {

                        $("#txtb_learn_hours").addClass('require-field')
                        s.lbl_requiredfieldLandD3 = "Numeric Values Only!"
                        $('#txtb_learn_hours').focus();
                        break;
                    }

                case "txtb_other_skill":
                    {

                        $("#txtb_other_skill").addClass('require-field')
                        s.lbl_requiredfieldOther1 = "required field!"
                        $('#txtb_other_skill').focus();
                        break;
                    }

                case "txtb_other_nonacad":
                    {

                        $("#txtb_other_nonacad").addClass('require-field')
                        s.lbl_requiredfieldOther2 = "required field!"
                        $('#txtb_other_nonacad').focus();
                        break;
                    }

                case "txtb_other_assoc":
                    {

                        $("#txtb_other_assoc").addClass('require-field')
                        s.lbl_requiredfieldOther3 = "required field!"
                        $('#txtb_other_assoc').focus();
                        break;
                    }

                case "txtb_ref_name":
                    {

                        $("#txtb_ref_name").addClass('require-field')
                        s.lbl_requiredfieldRef1 = "required field!"
                        $('#txtb_ref_name').focus();
                        break;
                    }

                case "txtb_ref_address":
                    {

                        $("#txtb_ref_address").addClass('require-field')
                        s.lbl_requiredfieldRef2 = "required field!"
                        $('#txtb_ref_address').focus();
                        break;
                    }

                case "txtb_ref_tel":
                    {

                        $("#txtb_ref_tel").addClass('require-field')
                        s.lbl_requiredfieldRef3 = "required field!"
                        $('#txtb_ref_tel').focus();
                        break;
                    }

                case "txtb_spouse_lname":
                    {
                        $("#txtb_spouse_lname").addClass('require-field')
                        s.lbl_requiredfieldSpouse1 = "required field!"
                        $('#txtb_spouse_lname').focus();
                        break;
                    }

                case "txtb_spouse_fname":
                    {
                        
                        $("#txtb_spouse_fname").addClass('require-field')
                        s.lbl_requiredfieldSpouse2 = "required field!"
                        $('#txtb_spouse_fname').focus();
                        break;
                    }

                case "txtb_spouse_mname":
                    {

                        $("#txtb_spouse_mname").addClass('require-field')
                        s.lbl_requiredfieldSpouse3 = "required field!"
                        $('#txtb_spouse_mname').focus();
                        break;
                    }

                case "txtb_birth_place":
                    {

                        $("#txtb_birth_place").addClass('require-field')
                        s.lbl_requiredfieldPersonal1 = "required field!"
                        $('#txtb_birth_place').focus();
                        break;
                    }

                case "ddl_gender":
                    {

                        $("#ddl_gender").addClass('require-field')
                        s.lbl_requiredfieldPersonal2 = "required field!"
                        $('#ddl_gender').focus();
                        break;
                    }

                case "ddl_civil_status":
                    {

                        $("#ddl_civil_status").addClass('require-field')
                        s.lbl_requiredfieldPersonal3 = "required field!"
                        $('#ddl_civil_status').focus();
                        break;
                    }

                case "txtb_blood_type":
                    {

                        $("#txtb_blood_type").addClass('require-field')
                        s.lbl_requiredfieldPersonal4 = "required field!"
                        $('#txtb_blood_type').focus();
                        break;
                    }

                case "txtb_height":
                    {

                        $("#txtb_height").addClass('require-field')
                        s.lbl_requiredfieldPersonal5 = "required field!"
                        $('#txtb_height').focus();
                        break;
                    }

                case "txtb_weight":
                    {

                        $("#txtb_weight").addClass('require-field')
                        s.lbl_requiredfieldPersonal6 = "required field!"
                        $('#txtb_weight').focus();
                        break;
                    }

                case "txtb_person_tel_nbr":
                    {

                        $("#txtb_person_tel_nbr").addClass('require-field')
                        s.lbl_requiredfieldPersonal7 = "required field!"
                        $('#txtb_person_tel_nbr').focus();
                        break;
                    }

                case "txtb_person_mobile_nbr":
                    {

                        $("#txtb_person_mobile_nbr").addClass('require-field')
                        s.lbl_requiredfieldPersonal8 = "required field!"
                        $('#txtb_person_mobile_nbr').focus();
                        break;
                    }

                case "txtb_person_email":
                    {

                        $("#txtb_person_email").addClass('require-field')
                        s.lbl_requiredfieldPersonal9 = "required field!"
                        $('#txtb_person_email').focus();
                        break;
                    }

                case "txtb_bir_nbr":
                    {

                        $("#txtb_bir_nbr").addClass('require-field')
                        s.lbl_requiredfieldPersonalID1 = "required field!"
                        $('#txtb_bir_nbr').focus();
                        break;
                    }

                case "txtb_gsisumid_nbr":
                    {

                        $("#txtb_gsisumid_nbr").addClass('require-field')
                        s.lbl_requiredfieldPersonalID2 = "required field!"
                        $('#txtb_gsisumid_nbr').focus();
                        break;
                    }

                case "txtb_gsisbp_nbr":
                    {

                        $("#txtb_gsisbp_nbr").addClass('require-field')
                        s.lbl_requiredfieldPersonalID3 = "required field!"
                        $('#txtb_gsisbp_nbr').focus();
                        break;
                    }

                case "txtb_hdmf_nbr":
                    {

                        $("#txtb_hdmf_nbr").addClass('require-field')
                        s.lbl_requiredfieldPersonalID4 = "required field!"
                        $('#txtb_hdmf_nbr').focus();
                        break;
                    }

                case "txtb_phic_nbr":
                    {

                        $("#txtb_phic_nbr").addClass('require-field')
                        s.lbl_requiredfieldPersonalID5 = "required field!"
                        $('#txtb_phic_nbr').focus();
                        break;
                    }

                case "txtb_sss_nbr":
                    {

                        $("#txtb_sss_nbr").addClass('require-field')
                        s.lbl_requiredfieldPersonalID6 = "required field!"
                        $('#txtb_sss_nbr').focus();
                        break;
                    }

                case "txtb_houselot00":
                    {

                        $("#txtb_houselot00").addClass('require-field')
                        s.lbl_requiredfieldAddress1 = "required field!"
                        $('#txtb_houselot00').focus();
                        break;
                    }

                case "txtb_street00":
                    {

                        $("#txtb_street00").addClass('require-field')
                        s.lbl_requiredfieldAddress2 = "required field!"
                        $('#txtb_street00').focus();
                        break;
                    }

                case "txtb_purok_vill00":
                    {

                        $("#txtb_purok_vill00").addClass('require-field')
                        s.lbl_requiredfieldAddress3 = "required field!"
                        $('#txtb_purok_vill00').focus();
                        break;
                    }

                case "ddl_barangay":
                    {

                        $("#ddl_barangay").addClass('require-field')
                        s.lbl_requiredfieldAddress4 = "required field!"
                        $('#ddl_barangay').focus();
                        break;
                    }

                case "ddl_municipality":
                    {

                        $("#ddl_municipality").addClass('require-field')
                        s.lbl_requiredfieldAddress5 = "required field!"
                        $('#ddl_municipality').focus();
                        break;
                    }

                case "ddl_province":
                    {

                        $("#ddl_province").addClass('require-field')
                        s.lbl_requiredfieldAddress6 = "required field!"
                        $('#ddl_province').focus();
                        break;
                    }

                case "txtb_zipcode00":
                    {

                        $("#txtb_zipcode00").addClass('require-field')
                        s.lbl_requiredfieldAddress7 = "required field!"
                        $('#txtb_zipcode00').focus();
                        break;
                    }

                case "txtb_houselot01":
                    {

                        $("#txtb_houselot01").addClass('require-field')
                        s.lbl_requiredfieldAddress11 = "required field!"
                        $('#txtb_houselot01').focus();
                        break;
                    }

                case "txtb_street01":
                    {

                        $("#txtb_street01").addClass('require-field')
                        s.lbl_requiredfieldAddress12 = "required field!"
                        $('#txtb_street01').focus();
                        break;
                    }

                case "txtb_purok_vill01":
                    {

                        $("#txtb_purok_vill01").addClass('require-field')
                        s.lbl_requiredfieldAddress13 = "required field!"
                        $('#txtb_purok_vill01').focus();
                        break;
                    }

                case "ddl_barangay01":
                    {

                        $("#ddl_barangay01").addClass('require-field')
                        s.lbl_requiredfieldAddress14 = "required field!"
                        $('#ddl_barangay01').focus();
                        break;
                    }

                case "ddl_municipality01":
                    {

                        $("#ddl_municipality01").addClass('require-field')
                        s.lbl_requiredfieldAddress15 = "required field!"
                        $('#ddl_municipality01').focus();
                        break;
                    }

                case "ddl_province01":
                    {

                        $("#ddl_province01").addClass('require-field')
                        s.lbl_requiredfieldAddress16 = "required field!"
                        $('#ddl_province01').focus();
                        break;
                    }

                case "txtb_zipcode01":
                    {

                        $("#txtb_zipcode01").addClass('require-field')
                        s.lbl_requiredfieldAddress17 = "required field!"
                        $('#txtb_zipcode01').focus();
                        break;
                    }

                case "txtb_spouse_occu":
                    {

                        $("#txtb_spouse_occu").addClass('require-field')
                        s.lbl_requiredfieldSpouse4 = "required field!"
                        $('#txtb_spouse_occu').focus();
                        break;
                    }

                case "txtb_spouse_busname":
                    {

                        $("#txtb_spouse_busname").addClass('require-field')
                        s.lbl_requiredfieldSpouse5 = "required field!"
                        $('#txtb_spouse_busname').focus();
                        break;
                    }

                case "txtb_spouse_busnaddress":
                    {
                        $("#txtb_spouse_busnaddress").addClass('require-field')
                        s.lbl_requiredfieldSpouse6 = "required field!"
                        $('#txtb_spouse_busnaddress').focus();
                        break;
                    }

                case "txtb_spouse_tel":
                    {

                        $("#txtb_spouse_tel").addClass('require-field')
                        s.lbl_requiredfieldSpouse8 = "required field!"
                        $('#txtb_spouse_tel').focus();
                        break;
                    }

                case "txtb_spouse_suffix":
                    {

                        $("#txtb_spouse_suffix").addClass('require-field')
                        s.lbl_requiredfieldSpouse7 = "required field!"
                        $('#txtb_spouse_suffix').focus();
                        break;
                    }

                case "txtb_father_lname":
                    {
                        $("#txtb_father_lname").addClass('require-field')
                        s.lbl_requiredfieldFather1 = "required field!"
                        $('#txtb_father_lname').focus();
                        break;
                    }

                case "txtb_father_fname":
                    {
                        $("#txtb_father_fname").addClass('require-field')
                        s.lbl_requiredfieldFather2 = "required field!"
                        $('#txtb_father_fname').focus();
                        break;
                    }

                case "txtb_father_mname":
                    {
                        $("#txtb_father_mname").addClass('require-field')
                        s.lbl_requiredfieldFather3 = "required field!"
                        $('#txtb_father_mname').focus();
                        break;
                    }

                case "txtb_father_suffix":
                    {
                        $("#txtb_father_suffix").addClass('require-field')
                        s.lbl_requiredfieldFather4 = "required field!"
                        $('#txtb_father_suffix').focus();
                        break;
                    }

                case "txtb_mother_lname":
                    {
                        $("#txtb_mother_lname").addClass('require-field')
                        s.lbl_requiredfieldMother1 = "required field!"
                        $('#txtb_mother_lname').focus();
                        break;
                    }

                case "txtb_mother_fname":
                    {
                        $("#txtb_mother_fname").addClass('require-field')
                        s.lbl_requiredfieldMother2 = "required field!"
                        $('#txtb_mother_fname').focus();
                        break;
                    }

                case "txtb_mother_mname":
                    {
                        $("#txtb_mother_mname").addClass('require-field')
                        s.lbl_requiredfieldMother3 = "required field!"
                        $('#txtb_mother_mname').focus();
                        break;
                    }

                case "txtb_school_honors":
                    {
                        $("#txtb_school_honors").addClass('require-field')
                        s.lbl_requiredfieldEducation8 = "required field!"
                        $('#txtb_school_honors').focus();
                        break;
                    }

                case "txtb_school_highlvl":
                    {
                        $("#txtb_school_highlvl").addClass('require-field')
                        s.lbl_requiredfieldEducation7 = "required field!"
                        $('#txtb_school_highlvl').focus();
                        break;
                    }

                case "txtb_school_yeargrad":
                    {
                        $("#txtb_school_yeargrad").addClass('require-field')
                        s.lbl_requiredfieldEducation6 = "required field!"
                        $('#txtb_school_yeargrad').focus();
                        break;
                    }

                case "txtb_csc_place":
                    {
                        $("#txtb_csc_place").addClass('require-field')
                        s.lbl_requiredfieldEligibility3 = "required field!"
                        $('#txtb_csc_place').focus();
                        break;
                    }

                case "txtb_csc_date_exam":
                    {
                        $("#txtb_csc_date_exam").addClass('require-field')
                        s.lbl_requiredfieldEligibility4 = "required field!"
                        $('#txtb_csc_date_exam').focus();
                        break;
                    }

                case "txtb_csc_date_validity":
                    {
                        $("#txtb_csc_date_validity").addClass('require-field')
                        s.lbl_requiredfieldEligibility5 = "required field!"
                        $('#txtb_csc_date_validity').focus();
                        break;
                    }

                case "txtb_csc_rating":
                    {
                        $("#txtb_csc_rating").addClass('require-field')
                        s.lbl_requiredfieldEligibility6 = "required field!"
                        $('#txtb_csc_rating').focus();
                        break;
                    }

                case "txtb_workexp_periodfrom":
                    {
                        $("#txtb_workexp_periodfrom").addClass('require-field')
                        s.lbl_requiredfieldWorkExp4 = "required field!"
                        $('#txtb_workexp_periodfrom').focus();
                        break;
                    }

                case "txtb_workexp_periodto":
                    {
                        $("#txtb_workexp_periodto").addClass('require-field')
                        s.lbl_requiredfieldWorkExp5 = "required field!"
                        $('#txtb_workexp_periodto').focus();
                        break;
                    }

                case "txtb_workexp_grade":
                    {
                        $("#txtb_workexp_grade").addClass('require-field')
                        s.lbl_requiredfieldWorkExp6 = "required field!"
                        $('#txtb_workexp_grade').focus();
                        break;
                    }

                case "txtb_workexp_status":
                    {
                        $("#txtb_workexp_status").addClass('require-field')
                        s.lbl_requiredfieldWorkExp7 = "required field!"
                        $('#txtb_workexp_status').focus();
                        break;
                    }

                case "ddl_workexp_govt":
                    {
                        $("#ddl_workexp_govt").addClass('require-field')
                        s.lbl_requiredfieldWorkExp8 = "required field!"
                        $('#ddl_workexp_govt').focus();
                        break;
                    }

                case "txtb_voluntary_periodfrom":
                    {
                        $("#txtb_voluntary_periodfrom").addClass('require-field')
                        s.lbl_requiredfieldVolWork4 = "required field!"
                        $('#ddl_workexp_govt').focus();
                        break;
                    }

                case "txtb_voluntary_periodto":
                    {
                        $("#txtb_voluntary_periodto").addClass('require-field')
                        s.lbl_requiredfieldVolWork5 = "required field!"
                        $('#txtb_voluntary_periodto').focus();
                        break;
                    }

                case "txtb_voluntary_hours":
                    {
                        $("#txtb_voluntary_hours").addClass('require-field')
                        s.lbl_requiredfieldVolWork3 = "required field!"
                        $('#txtb_voluntary_hours').focus();
                        break;
                    }

                case "txtb_learn_periodfrom":
                    {
                        $("#txtb_learn_periodfrom").addClass('require-field')
                        s.lbl_requiredfieldLandD4 = "required field!"
                        $('#txtb_learn_periodfrom').focus();
                        break;
                    }

                case "txtb_learn_periodto":
                    {
                        $("#txtb_learn_periodto").addClass('require-field')
                        s.lbl_requiredfieldLandD5 = "required field!"
                        $('#txtb_learn_periodfrom').focus();
                        break;
                    }

                case "txtb_learn_type":
                    {
                        $("#txtb_learn_type").addClass('require-field')
                        s.lbl_requiredfieldLandD6 = "required field!"
                        $('#txtb_learn_type').focus();
                        break;
                    }

                case "txtb_learn_hours":
                    {
                        $("#txtb_learn_hours").addClass('require-field')
                        s.lbl_requiredfieldLandD3 = "required field!"
                        $('#txtb_learn_hours').focus();
                        break;
                    }

                case "txtb_gov_issued":
                    {
                        $("#txtb_gov_issued").addClass('require-field')
                        s.lbl_requiredfieldStatutory1 = "required field!"
                        $('#txtb_gov_issued').focus();
                        break;
                    }

                case "txtb_gov_issued_nbr":
                    {
                        $("#txtb_gov_issued_nbr").addClass('require-field')
                        s.lbl_requiredfieldStatutory2 = "required field!"
                        $('#txtb_gov_issued_nbr').focus();
                        break;
                    }
                case "txtb_dateplace_issuance":
                    {
                        $("#txtb_dateplace_issuance").addClass('require-field')
                        s.lbl_requiredfieldStatutory3 = "required field!"
                        $('#txtb_dateplace_issuance').focus();
                        break;
                    }
                    
                    



                    



            }
        else if (!pMode) {
            switch (pObjectName) {

                case "ALL":
                    {
                        $("#txtb_child_name").removeClass('require-field')
                        s.lbl_requiredfieldChildren1 = ""

                        $("#txtb_child_birth").removeClass('require-field')
                        s.lbl_requiredfieldChildren2 = ""

                        $("#ddl_educational_level").removeClass('require-field')
                        s.lbl_requiredfieldEducation1 = ""

                        $("#txtb_school_periodfrom").removeClass('require-field')
                        s.lbl_requiredfieldEducation2 = ""

                        $("#txtb_school_periodto").removeClass('require-field')
                        s.lbl_requiredfieldEducation3 = ""

                        $("#txtb_school_name").removeClass('require-field')
                        s.lbl_requiredfieldEducation4 = ""

                        $("#txtb_school_educcourse").removeClass('require-field')
                        s.lbl_requiredfieldEducation5 = ""

                        $("#txtb_csc_career").removeClass('require-field')
                        s.lbl_requiredfieldEligibility1 = ""

                        $("#ddl_csc_type").removeClass('require-field')
                        s.lbl_requiredfieldEligibility12 = ""

                        $("#txtb_csc_number").removeClass('require-field')
                        s.lbl_requiredfieldEligibility2 = ""

                        $("#txtb_workexp_position").removeClass('require-field')
                        s.lbl_requiredfieldWorkExp1 = ""

                        $("#txtb_workexp_salary").removeClass('require-field')
                        s.lbl_requiredfieldWorkExp3 = ""

                        $("#txtb_workexp_dept").removeClass('require-field')
                        s.lbl_requiredfieldWorkExp2 = ""

                        $("#txtb_voluntary_narmeorg").removeClass('require-field')
                        s.lbl_requiredfieldVolWork1 = ""

                        $("#txtb_voluntary_position").removeClass('require-field')
                        s.lbl_requiredfieldVolWork2 = ""

                        $("#txtb_voluntary_hours").removeClass('require-field')
                        s.lbl_requiredfieldVolWork3 = ""

                        $("#txtb_learn_title").removeClass('require-field')
                        s.lbl_requiredfieldLandD1 = ""

                        $("#txtb_learn_conduct").removeClass('require-field')
                        s.lbl_requiredfieldLandD2 = ""

                        $("#txtb_learn_hours").removeClass('require-field')
                        s.lbl_requiredfieldLandD3 = ""

                        $("#txtb_other_skill").removeClass('require-field')
                        s.lbl_requiredfieldOther1 = ""

                        $("#txtb_other_nonacad").removeClass('require-field')
                        s.lbl_requiredfieldOther2 = ""

                        $("#txtb_other_assoc").removeClass('require-field')
                        s.lbl_requiredfieldOther3 = ""

                        $("#txtb_ref_name").removeClass('require-field')
                        s.lbl_requiredfieldRef1 = ""

                        $("#txtb_ref_address").removeClass('require-field')
                        s.lbl_requiredfieldRef2 = ""

                        $("#txtb_ref_tel").removeClass('require-field')
                        s.lbl_requiredfieldRef3 = ""

                        $("#txtb_spouse_lname").removeClass('require-field')
                        s.lbl_requiredfieldSpouse1 = ""

                        $("#txtb_spouse_fname").removeClass('require-field')
                        s.lbl_requiredfieldSpouse2 = ""

                        $("#txtb_spouse_mname").removeClass('require-field')
                        s.lbl_requiredfieldSpouse3 = ""

                        $("#txtb_birth_place").removeClass('require-field')
                        s.lbl_requiredfieldPersonal1 = ""

                        $("#ddl_gender").removeClass('require-field')
                        s.lbl_requiredfieldPersonal2 = ""

                        $("#ddl_civil_status").removeClass('require-field')
                        s.lbl_requiredfieldPersonal3 = ""

                        $("#txtb_blood_type").removeClass('require-field')
                        s.lbl_requiredfieldPersonal4 = ""

                        $("#txtb_height").removeClass('require-field')
                        s.lbl_requiredfieldPersonal5 = ""

                        $("#txtb_weight").removeClass('require-field')
                        s.lbl_requiredfieldPersonal6 = ""

                        $("#txtb_person_tel_nbr").removeClass('require-field')
                        s.lbl_requiredfieldPersonal7 = ""
                        
                        $("#txtb_person_mobile_nbr").removeClass('require-field')
                        s.lbl_requiredfieldPersonal8 = ""

                        $("#txtb_person_email").removeClass('require-field')
                        s.lbl_requiredfieldPersonal9 = ""

                        $("#txtb_bir_nbr").removeClass('require-field')
                        s.lbl_requiredfieldPersonalID1 = ""

                        $("#txtb_gsisumid_nbr").removeClass('require-field')
                        s.lbl_requiredfieldPersonalID2 = ""

                        $("#txtb_gsisbp_nbr").removeClass('require-field')
                        s.lbl_requiredfieldPersonalID3 = ""

                        $("#txtb_hdmf_nbr").removeClass('require-field')
                        s.lbl_requiredfieldPersonalID4 = ""

                        $("#txtb_phic_nbr").removeClass('require-field')
                        s.lbl_requiredfieldPersonalID5 = ""

                        $("#txtb_sss_nbr").removeClass('require-field')
                        s.lbl_requiredfieldPersonalID6 = ""

                        $("#txtb_houselot00").removeClass('require-field')
                        s.lbl_requiredfieldAddress1 = ""

                        $("#txtb_street00").removeClass('require-field')
                        s.lbl_requiredfieldAddress2 = ""

                        $("#txtb_purok_vill00").removeClass('require-field')
                        s.lbl_requiredfieldAddress3 = ""

                        $("#ddl_barangay").removeClass('require-field')
                        s.lbl_requiredfieldAddress4 = ""

                        $("#ddl_municipality").removeClass('require-field')
                        s.lbl_requiredfieldAddress5 = ""

                        $("#ddl_province").removeClass('require-field')
                        s.lbl_requiredfieldAddress6 = ""

                        $("#txtb_zipcode00").removeClass('require-field')
                        s.lbl_requiredfieldAddress7 = ""

                        $("#txtb_houselot01").removeClass('require-field')
                        s.lbl_requiredfieldAddress11 = ""

                        $("#txtb_street01").removeClass('require-field')
                        s.lbl_requiredfieldAddress12 = ""

                        $("#txtb_purok_vill01").removeClass('require-field')
                        s.lbl_requiredfieldAddress13 = ""

                        $("#ddl_barangay01").removeClass('require-field')
                        s.lbl_requiredfieldAddress14 = ""

                        $("#ddl_municipality01").removeClass('require-field')
                        s.lbl_requiredfieldAddress15 = ""

                        $("#ddl_province01").removeClass('require-field')
                        s.lbl_requiredfieldAddress16 = ""

                        $("#txtb_zipcode01").removeClass('require-field')
                        s.lbl_requiredfieldAddress17 = ""

                        $("#txtb_spouse_occu").removeClass('require-field')
                        s.lbl_requiredfieldSpouse4 = ""

                        $("#txtb_spouse_busname").removeClass('require-field')
                        s.lbl_requiredfieldSpouse5 = ""

                        $("#txtb_spouse_busnaddress").removeClass('require-field')
                        s.lbl_requiredfieldSpouse6 = ""

                        $("#txtb_spouse_suffix").removeClass('require-field')
                        s.lbl_requiredfieldSpouse7 = ""

                        $("#txtb_spouse_tel").removeClass('require-field')
                        s.lbl_requiredfieldSpouse8 = ""

                        $("#txtb_father_lname").removeClass('require-field')
                        s.lbl_requiredfieldFather1 = ""

                        $("#txtb_father_fname").removeClass('require-field')
                        s.lbl_requiredfieldFather2 = ""

                        $("#txtb_father_mname").removeClass('require-field')
                        s.lbl_requiredfieldFather3 = ""

                        $("#txtb_father_suffix").removeClass('require-field')
                        s.lbl_requiredfieldFather4 = ""

                        $("#txtb_mother_lname").removeClass('require-field')
                        s.lbl_requiredfieldMother1 = ""

                        $("#txtb_mother_fname").removeClass('require-field')
                        s.lbl_requiredfieldMother2 = ""

                        $("#txtb_mother_mname").removeClass('require-field')
                        s.lbl_requiredfieldMother3 = ""

                        $("#txtb_school_yeargrad").removeClass('require-field')
                        s.lbl_requiredfieldEducation6 = ""

                        $("#txtb_school_highlvl").removeClass('require-field')
                        s.lbl_requiredfieldEducation7 = ""

                        $("#txtb_school_honors").removeClass('require-field')
                        s.lbl_requiredfieldEducation8 = ""

                        $("#txtb_school_honors").removeClass('require-field')
                        s.lbl_requiredfieldEducation8 = ""

                        $("#txtb_csc_place").removeClass('require-field')
                        s.lbl_requiredfieldEligibility3 = ""

                        $("#txtb_csc_date_exam").removeClass('require-field')
                        s.lbl_requiredfieldEligibility4 = ""

                        $("#txtb_csc_date_validity").removeClass('require-field')
                        s.lbl_requiredfieldEligibility5 = ""

                        $("#txtb_csc_rating").removeClass('require-field')
                        s.lbl_requiredfieldEligibility6 = ""

                        $("#txtb_workexp_periodfrom").removeClass('require-field')
                        s.lbl_requiredfieldWorkExp4 = ""

                        $("#txtb_workexp_periodto").removeClass('require-field')
                        s.lbl_requiredfieldWorkExp5 = ""

                        $("#txtb_workexp_grade").removeClass('require-field')
                        s.lbl_requiredfieldWorkExp6 = ""

                        $("#txtb_workexp_status").removeClass('require-field')
                        s.lbl_requiredfieldWorkExp7 = ""

                        $("#ddl_workexp_govt").removeClass('require-field')
                        s.lbl_requiredfieldWorkExp8 = ""

                        $("#txtb_voluntary_periodfrom").removeClass('require-field')
                        s.lbl_requiredfieldVolWork4 = ""

                        $("#txtb_voluntary_periodto").removeClass('require-field')
                        s.lbl_requiredfieldVolWork5 = ""

                        $("#txtb_learn_periodfrom").removeClass('require-field')
                        s.lbl_requiredfieldLandD4 = ""

                        $("#txtb_learn_periodto").removeClass('require-field')
                        s.lbl_requiredfieldLandD5 = ""

                        $("#txtb_learn_title").removeClass('require-field')
                        s.lbl_requiredfieldLandD1 = ""

                        $("#txtb_learn_type").removeClass('require-field')
                        s.lbl_requiredfieldLandD6 = ""

                        $("#txtb_gov_issued").removeClass('require-field')
                        s.lbl_requiredfieldStatutory1 = ""

                        $("#txtb_gov_issued_nbr").removeClass('require-field')
                        s.lbl_requiredfieldStatutory2 = ""

                        $("#txtb_dateplace_issuance").removeClass('require-field')
                        s.lbl_requiredfieldStatutory3 = ""


                        break;
                    }

            }
        }
    }

    //***********************************//
    //***Download User Manual****//
    //***********************************// 

    s.btn_download_manual = function () {

        h.post("../cSSPDS/SetHistoryPage").then(function (d) {
            if (d.data.path != "") {
                var downloadPath = 'UploadedFile/PDSManual/ManualPDS.pdf'
                window.open(downloadPath, '_blank', '');
            }
        })



    }

    //***********************************//
    //***Selected Province Change****//
    //***********************************// 
    s.ddl_province_change = function ()
    {
        s.ddl_municipality = ""
        h.post("../cSSPDS/get_municipality",
            { provice_code: s.ddl_province}
        ).then(function (d) {
            s.municipality_list = d.data.muni_city_list
           
        })
    }

    //***********************************//
    //***Selected Municipality Change****//
    //***********************************// 
    s.ddl_municipality_change = function () {
        s.ddl_barangay = "";
        h.post("../cSSPDS/get_barangay",
            { muni_city_code: s.ddl_municipality }
        ).then(function (d) {
            s.barangay_list = d.data.barangay_list
        })
    }

    //***********************************//
    //***Selected Province Change****//
    //***********************************// 
    s.ddl_province_change1 = function () {
        s.ddl_municipality01 = "";
        s.ddl_barangay01 = "";
        h.post("../cSSPDS/get_municipality",
            { provice_code:s.ddl_province01 }
        ).then(function (d) {
            s.municipality_list1 = d.data.muni_city_list
        })
    }

    //***********************************//
    //***Selected Municipality Change****//
    //***********************************// 
    s.ddl_municipality_change1 = function () {
        s.ddl_barangay01 = "";
        h.post("../cSSPDS/get_barangay",
            { muni_city_code: s.ddl_municipality01 }
        ).then(function (d) {
            s.barangay_list1 = d.data.barangay_list
        })
    }

    //***********************************//
    //***Page-View-for-Crystal-Report****//
    //***********************************// 

    s.btn_print = function (par_report) {
        var controller  = "Reports";
        var action      = "Index";
        var ReportName  = "";
        var SaveName    = "Crystal_Report";
        var ReportType  = "inline";
        var ReportPath  = "~/Reports/cryPDS/";
        var sp          = "";
        switch (par_report)
        {
            case "O":
                {
                    ReportName = "cryPDSMain";
                    ReportPath = ReportPath + "" + ReportName + ".rpt";
                    sp = "sp_pds_rep,p_empl_id," + s.txtb_empl_id + ",O";
                    break;
                }
            case "1":
                {
                    ReportName = "cryPDSOther_page1";
                    ReportPath = ReportPath + "" + ReportName + ".rpt";
                    sp = "sp_pds_add_page1_rep,p_empl_id," + s.txtb_empl_id + ",1";
                    break;
                }
            case "2":
                {
                    ReportName = "cryPDSOther_page2";
                    ReportPath = ReportPath + "" + ReportName + ".rpt";
                    sp = "sp_pds_rep,p_empl_id," + s.txtb_empl_id + ",2";
                    break;
                }
            case "3":
                {
                    ReportName = "cryPDSOther_page3";
                    ReportPath = ReportPath + "" + ReportName + ".rpt";
                    sp = "sp_pds_rep,p_empl_id," + s.txtb_empl_id + ",3";
                    break;
                }
        }

        $('#modal_generating_report').modal("hide");
        h.post("../cSSPDS/SetHistoryPage").then(function (d) {
            location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                + "&SaveName=" + SaveName
                + "&ReportType=" + ReportType
                + "&ReportPath=" + ReportPath
                + "&Sp=" + sp
        });
    }

    s.btn_validate_changes = function ()
    {
        if (validate_check == true)
        {
            swal({
                title: "Are you sure you want to disregard the changes?",
                text: "",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            }).then(function (willDelete) {
                if (willDelete)
                {
                    if (tname == "oTableChildren")
                    {
                        $("#main_modal_personnal").modal("hide")

                    }

                    else if (tname == "oTableEducation" || tname == "oTableEligibility")
                    {
                        $("#main_modal_education").modal("hide")
                    }

                    else if (tname == "oTableWorkExp" || tname == "oTableVolWork")
                    {
                        $("#main_modal_work").modal("hide")
                        
                    }
                        
                    else if (tname == "oTableLandD" || tname == "oTableOtherSkills" || tname == "oTableOtherRecognition" || tname == "oTableOtherMembership")
                    {
                        $("#main_modal_learn").modal("hide")
                    }
                        

                    else if (tname == "oTableRef")
                    {
                        $("#main_modal_ref").modal("hide")
                    }

                    validate_check = false;
                }
                })
        }
        else
        {
            if (tname == "oTableChildren")
            {
                $("#main_modal_personnal").modal("hide")

            }

            else if (tname == "oTableEducation" || tname == "oTableEligibility")
            {
                $("#main_modal_education").modal("hide")
            }

            else if (tname == "oTableWorkExp" || tname == "oTableVolWork")
            {
                $("#main_modal_work").modal("hide")

            }

            else if (tname == "oTableLandD" || tname == "oTableOtherSkills" || tname == "oTableOtherRecognition" || tname == "oTableOtherMembership")
            {
                $("#main_modal_learn").modal("hide")
            }


            else if (tname == "oTableRef")
            {
                $("#main_modal_ref").modal("hide")
            }
        }

        
    }



    Array.prototype.remove = function (code, prop) {
        return this.filter(function (d) {
            return d[prop] != code
        })

    }


    s.search_in_list = function (value, table) {
        $("#" + table).DataTable().search(value).draw();
    }

    s.setNumOfRow = function (value, table) {
        $("#" + table).DataTable().page.len(s.rowLen).draw();
    }

    s.btn_view_LandD = function ()
    {
        h.post("../cSSPDS/GetLearnInfoData").then(function (d) {

            if (d.data.message == "success")
            {
                s.datalistgridLandD = []
                
                s.txtb_empl_id = d.data.empl_id

                if (d.data.personnel_learnanddevt_tbl.length > 0) {

                    s.datalistgridLandD = d.data.personnel_learnanddevt_tbl;
                    s.oTableLandD.fnClearTable();
                    s.oTableLandD.fnAddData(s.datalistgridLandD)
                }
                else
                {
                    s.oTableLandD.fnClearTable();
                }

                // ***************************************************
                // ******** Addtional Learning and Development *******
                // ***************************************************
                s.GetAdditionalLearnDev(d.data.empl_id);
                // ***************************************************

                $("#main_modal_learn").modal({
                    keyboard: false,
                    backdrop: "static"
                })

            }


        })

        $("#addl_land_modal").modal({
            keyboard: false,
            backdrop: "static"
        })
        //console.log(s.datalist_data_api)
        
    }
    
     //Added By: Joseph M. Tombo Jr. 04/14/2020
    function autocomplete(inp, arr) {
        /*the autocomplete function takes two arguments,
        the text field element and an array of possible autocompleted values:*/
        var currentFocus;
        /*execute a function when someone writes in the text field:*/
        inp.addEventListener("input", function (e) {
            var a, b, i, val = this.value;
            /*close any already open lists of autocompleted values*/
            closeAllLists();
            if (!val) { return false; }
            currentFocus = -1;
            /*create a DIV element that will contain the items (values):*/
            a = document.createElement("DIV");
            a.setAttribute("id", this.id + "autocomplete-list");
            a.setAttribute("class", "autocomplete-items");
            /*append the DIV element as a child of the autocomplete container:*/
            this.parentNode.appendChild(a);
            /*for each item in the array...*/
            for (i = 0; i < arr.length; i++) {
                /*check if the item starts with the same letters as the text field value:*/
                if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                    /*create a DIV element for each matching element:*/
                    b = document.createElement("DIV");
                    /*make the matching letters bold:*/
                    b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                    b.innerHTML += arr[i].substr(val.length);
                    /*insert a input field that will hold the current array item's value:*/
                    b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                    /*execute a function when someone clicks on the item value (DIV element):*/
                    b.addEventListener("click", function (e) {
                        /*insert the value for the autocomplete text field:*/
                        inp.value = this.getElementsByTagName("input")[0].value;
                        /*close the list of autocompleted values,
                        (or any other open lists of autocompleted values:*/
                        closeAllLists();
                    });
                    a.appendChild(b);
                }
            }
        });
        /*execute a function presses a key on the keyboard:*/
        inp.addEventListener("keydown", function (e) {
            var x = document.getElementById(this.id + "autocomplete-list");
            if (x) x = x.getElementsByTagName("div");
            if (e.keyCode == 40) {
                /*If the arrow DOWN key is pressed,
                increase the currentFocus variable:*/
                currentFocus++;
                /*and and make the current item more visible:*/
                addActive(x);
            } else if (e.keyCode == 38) { //up
                /*If the arrow UP key is pressed,
                decrease the currentFocus variable:*/
                currentFocus--;
                /*and and make the current item more visible:*/
                addActive(x);
            } else if (e.keyCode == 13) {
                /*If the ENTER key is pressed, prevent the form from being submitted,*/
                e.preventDefault();
                if (currentFocus > -1) {
                    /*and simulate a click on the "active" item:*/
                    if (x) x[currentFocus].click();
                }
            }
        });
        function addActive(x) {
            /*a function to classify an item as "active":*/
            if (!x) return false;
            /*start by removing the "active" class on all items:*/
            removeActive(x);
            if (currentFocus >= x.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = (x.length - 1);
            /*add class "autocomplete-active":*/
            x[currentFocus].classList.add("autocomplete-active");
        }
        function removeActive(x) {
            /*a function to remove the "active" class from all autocomplete items:*/
            for (var i = 0; i < x.length; i++) {
                x[i].classList.remove("autocomplete-active");
            }
        }
        function closeAllLists(elmnt) {
            /*close all autocomplete lists in the document,
            except the one passed as an argument:*/
            var x = document.getElementsByClassName("autocomplete-items");
            for (var i = 0; i < x.length; i++) {
                if (elmnt != x[i] && elmnt != inp) {
                    x[i].parentNode.removeChild(x[i]);
                }
            }
        }
        /*execute a function when someone clicks in the document:*/
        document.addEventListener("click", function (e) {
            closeAllLists(e.target);
        });
    }

    s.GetAdditionalLearnDev = function (empl_id)
    {
        var empl_id_api = empl_id;

        $.ajax({
            type: 'GET',
            url: 'http://122.54.19.173:8088/employee-training?id=' + empl_id_api,
            success: function (data)
            {
                var data_api = data
                s.datalist_data_api = data_api
                s.oTable3000 = $('#datalist_grid3000').dataTable(
                    {

                        data: data_api,
                        pageLength: 200,
                        sDom: 'rt<"bottom"ip>',
                        destroy: true,
                        columns: [

                            {
                                "mData": null,
                                "mRender": function (data, type, full, row)
                                {
                                    var checked     = ""
                                    var isdisabled  = ""
                                    
                                    if (data == "Y")
                                    {
                                        checked = "checked"
                                    }
                                    else {
                                        checked = ""
                                    }

                                    return '<div class="checkbox checkbox-primary text-center"><input style="width:30px;" id="checkbox_idv' + row["row"] + '" ng-click="btn_check_action(' + row["row"] + ')" type="checkbox"' + checked + ' ' + isdisabled + '><label for="checkbox' + row["row"] + '"></label></div>'
                                }
                            }
                            , {
                                "mData": "tr_dtefr",
                                "mRender": function (data, type, full, row) {
                                    return "<span class='text-center btn-block'>" + data + "</span>"
                                }
                            }
                            , {
                                "mData": "tr_dteto",
                                "mRender": function (data, type, full, row) {
                                    return "<span class='text-center btn-block'>" + data + "</span>"
                                }
                            }
                            , {
                                "mData": "reftrain",
                                "mRender": function (data, type, full, row) {
                                    data = data != null ? data.train_desc : "";
                                    return "<span class='btn-block'>&nbsp;" + data + "</span>"
                                }
                            }
                            , {
                                "mData": "sponsors",
                                "mRender": function (data, type, full, row) {
                                    data = data != null ? data.sp_name : "";
                                    return "<span class='btn-block'>&nbsp;" + data + "</span>"
                                }
                            }
                        ],
                        "createdRow": function (row, data, index) {
                            $(row).addClass("dt-row");
                            $compile(row)($scope);  //add this to compile the DOM
                        }
                    });
                
                s.oTable3000.fnClearTable();
                s.oTable3000.fnAddData(data_api);

                // *************************************************************
                // ********** VJA - Function to Check the Grid if Exists *************
                // *************************************************************
                for (var i = 0; i < s.datalist_data_api.length; i++)
                {
                    for (var x = 0; x < s.datalistgridLandD.length; x++)
                    {
                        if (s.datalist_data_api[i].reftrain.train_desc.toUpperCase().trim() == s.datalistgridLandD[x].learn_devt_title.toUpperCase().trim())
                        {
                            $('#checkbox_idv' + i).prop("checked", true)
                            $('#checkbox_idv' + i).prop("disabled", true)
                        }
                    }
                }
                // *************************************************************
                // *************************************************************

            }
        });




    }


    s.btn_check_action = function (row_id)
    {

        // console.log(s.datalist_data_api[row_id])
        // return;

        if ($('#checkbox_idv' + row_id)[0].checked == true)
        {
            var data =
            {
                 seq_no           : s.datalist_data_api[row_id]
                ,empl_id          : s.txtb_empl_id  
                ,learn_devt_title : s.datalist_data_api[row_id].reftrain.train_desc
                ,learn_devt_from  : s.datalist_data_api[row_id].tr_dtefr
                ,learn_devt_to    : s.datalist_data_api[row_id].tr_dteto
                ,no_of_hrs        : s.datalist_data_api[row_id].tr_hours
                ,learn_devt_type  : ''
                ,conducted_by     : s.datalist_data_api[row_id].sponsors.sp_name
            };

            var data2 =
            {
                 empl_id          : s.txtb_empl_id  
                ,tr_code          : s.datalist_data_api[row_id].tr_code
            };

        
            swal("Are you sure you want to Save this Additional Learning and Development?", 'Name of Event: ' + data.learn_devt_title + '\n \n' + data.learn_devt_from + ' - ' + data.learn_devt_to,
            {
                icon: "warning",
                buttons: {
                    defeat:
                    {
                        value       : "defeat",
                        text        : "Close"
                    },
                    continue_anyway:
                    {
                        text        : "OK, Continue",
                        value       : "continue_anyway"
                    }
                }
            }).then((value) => {
                switch (value)
                {
                    case "continue_anyway":

                        h.post("../cSSPDS/CheckLearningDev", { data: data, data2: data2 }).then(function (d)
                        {
                            if (d.data.message == "success")
                            {
                                $('#checkbox_idv' + row_id).prop("checked", true)

                                h.post("../cSSPDS/GetLearnInfoData").then(function (d) {

                                    if (d.data.message == "success")
                                    {
                                        s.datalistgridLandD = []
                
                                        s.txtb_empl_id = d.data.empl_id

                                        if (d.data.personnel_learnanddevt_tbl.length > 0) {

                                            s.datalistgridLandD = d.data.personnel_learnanddevt_tbl;
                                            s.oTableLandD.fnClearTable();
                                            s.oTableLandD.fnAddData(s.datalistgridLandD)
                                        }
                                        else
                                        {
                                            s.oTableLandD.fnClearTable();
                                        }

                                        s.GetAdditionalLearnDev(d.data.empl_id)

                                        swal("Successfully Added!", "New Record has been Successfully Added!", "success");
                                    }

                                })

                            }
                            else
                            {
                                $('#checkbox_idv' + row_id).prop("checked", false)
                                swal("There something error when saving record", d.data.message, { icon: "error" });
                            }
                        });

                        break;
                    default:
                        $('#checkbox_idv' + row_id).prop("checked", false)
                        swal("Cancel Request!", "Your Request is already Cancelled!", { icon: "warning" });
                }
            });

        }
    }

    s.btn_print_apil = function ()
    {
        var divContents = document.getElementById("div_printing_api").innerHTML;
        var a = window.open('', '', 'height=1000, width=1000');
        a.document.write('<html>');
        a.document.write(`<style type="text/css">
                            table, th, td 
                            {
                                border: 1px solid black;
                                border-collapse: collapse;
                            }
                            td 
                            {
                                padding:10px;
                                text-align:justify;
                            }
                        </style>`);

        a.document.write('<body style="border:1px solid !important;text-align:center"> <h1>List of Additional Learning and Development <br>');
        a.document.write(divContents);
        a.document.write('</body></html>');
        a.document.close();
        a.print();
    }

    //***************************Functions end*********************************************************//

})
ng_selfService_App.directive('updateAPL1', ["commonScript", "$log", function (cs,l) {

    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            elem.on('click', function () {
                scope.flag = attrs.flag

                console.log(attrs.flag)
                $("#onlineCred").modal("show")
            })
        }
    }

}])
ng_selfService_App.directive('updateAPL2', ["commonScript","$http","$log", function (cs,h,l) {
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) { 

            elem.on('click', function () {
                var flag = scope.flag
                var username = $("#apl_username").val()
                var password = $("#apl_password").val()

                if (cs.Validate1Field("apl_username") && cs.Validate1Field("apl_password")) {
                    $("#loading_data").modal("show")
                    h.post("../cAPLUpdate/UpdateAPL_Info", { username: username, password: password, flag: flag }).then(function (d) {
                        swal(d.data.message, { icon: d.data.icon })
                        $("#loading_data").modal("hide")
                        $(".modal").modal("hide")
                    })
                  
                }
                else
                {
                         $(".modal").modal("hide")
                }
            })
        }

    }
    
}])


