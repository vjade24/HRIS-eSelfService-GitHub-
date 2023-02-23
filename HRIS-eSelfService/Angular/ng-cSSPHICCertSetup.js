ng_selfService_App.controller("cSSPHICCertSetup_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope
    var h = $http

    var userid  = "";
    s.rowLen    = "10";

    function init() {
        $("#modal_generating_remittance").modal();
        //**********************************************
        // Initialize data during page loads
        //**********************************************
        h.post("../cSSPHICCertSetup/InitializeData").then(function (d) {
            if (d.data.message == "success") {
                userid          = d.data.userid
                s.departments   = d.data.department_list;
                if (d.data.phic_cert_list.length > 0) {
                    init_table_data(d.data.phic_cert_list);
                }
                else {
                    init_table_data([]);
                }
                //**********************************************
                //  Show/Hide ADD, EDIT, DELETE button 
                //**********************************************
                s.allowAdd = d.data.allowAdd
                s.allowDelete = d.data.allowDelete
                s.allowEdit = d.data.allowEdit
                s.allowView = d.data.allowView

                if (s.allowAdd == "1") {
                    s.ShowAdd = true
                }
                else {
                    s.ShowAdd = false
                }

                if (s.allowDelete == "1") {
                    s.ShowDelete = true
                }
                else {
                    s.ShowDelete == false
                }

                if (s.allowEdit == "1") {
                    s.ShowView = true
                }
                else {
                    s.ShowView = false
                }
                $("#modal_generating_remittance").modal("hide");

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
                sDom: 'rt<"bottom"ip>',
                pageLength: 10,
                columns: [
                    { "mData": "department_code", "mRender": function (data, type, full, row) { return "<span class='text-center btn-block'>" + data + "</span>" } },
                    { "mData": "cert_descr", "mRender": function (data, type, full, row) { return "<span class='text-left btn-block'>" + data + "</span>" } },
                    {
                        "mData": null,
                        "bSortable": false,
                        "mRender": function (data, type, full, row) {

                            return '<center><div class="btn-group">' +
                                '<button type="button" ng-show="ShowView" class="btn btn-info btn-sm" ng-click="btn_edit_action(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Edit">  <i class="fa fa-edit"></i></button >' +
                                '<button type="button" ng-show="ShowDelete" class="btn btn-danger btn-sm" ng-click="btn_del_row(' + row["row"] + ')" data-toggle="tooltip" data-placement="top" title="Delete"><i class="fa fa-trash"></i></button>' +
                                '</div></center>';
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
    s.setNumOfRow = function (value, table) {
        try {
            $("#" + table).DataTable().page.len(value).draw();
        }
        catch (err) {
            alert(err.message)
        }
    }
    //************************************//
    //***       Open Add Modal        ****//
    //************************************//
    s.btn_open_modal = function () {
        clearentry();
        s.disDept = false;
        s.isEdit = false;
        s.ModalTitle = "Add New Record";
        btn = document.getElementById('add');
        btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Add';
        setTimeout(function () {
            btn.innerHTML = '<i class="fa fa-plus-circle"> </i> Add';
            $('#main_modal').modal({ backdrop: 'static', keyboard: false });
            
        }, 300);
    }
    
    //************************************// 
    //*** Save New Record              
    //**********************************// 
    s.btn_save_click = function () {
        if (ValidateFields()) {
            btn = document.getElementById('addFinal');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Save';

            var data = {
                department_code     : $('#ddl_departments').val()
                , cert_descr        : s.txtb_description
                , sig1_name         : s.txtb_sig1_name
                , sig1_position     : s.txtb_sig1_position
                , sig2_name         : s.txtb_sig2_name
                , sig2_position     : s.txtb_sig2_position
                , sig3_name         : s.txtb_sig3_name
                , sig3_position     : s.txtb_sig3_position
            }
            h.post("../cSSPHICCertSetup/Save", { data: data }).then(function (d) {
                if (d.data.message == "success") {
                    s.datalistgrid.push(data)
                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid);
                    for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                        if (get_page($('#ddl_departments').val()) == false) {
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
                    swal(d.data.message, { icon: "warning", });
                }
                btn.innerHTML = '<i class="fa fa-save"> </i> Save';
            })
        }
    }
    //***********************************************************//
    //***Field validation for remittance type before opening add modal
    //***********************************************************// 
    function ValidateFields() {
        var return_val = true;
        ValidationResultColor("ALL", false);

        if ($('#ddl_departments').val() == "") {
            ValidationResultColor("ddl_departments", true);
            return_val = false;
        }

        if ($('#txtb_description').val() == "") {
            ValidationResultColor("txtb_description", true);
            return_val = false;
        }

        if ($('#txtb_sig1_name').val() == "") {
            ValidationResultColor("txtb_sig1_name", true);
            return_val = false;
        }

        if ($('#txtb_sig1_position').val() == "") {
            ValidationResultColor("txtb_sig1_position", true);
            return_val = false;
        }

        if ($('#txtb_sig2_name').val() == "") {
            ValidationResultColor("txtb_sig2_name", true);
            return_val = false;
        }

        if ($('#txtb_sig2_name').val() == "") {
            ValidationResultColor("txtb_sig2_name", true);
            return_val = false;
        }

        if ($('#txtb_sig2_position').val() == "") {
            ValidationResultColor("txtb_sig2_position", true);
            return_val = false;
        }

        if ($('#txtb_sig3_name').val() == "") {
            ValidationResultColor("txtb_sig3_name", true);
            return_val = false;
        }

        if ($('#txtb_sig3_position').val() == "") {
            ValidationResultColor("txtb_sig3_position", true);
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
            $("#lbl_" + par_object_id + "_req").text("Required Field");
        }
        else {
            //remove of refresh the object form being required

            $("#ddl_departments").removeClass("required");
            $("#lbl_ddl_departments_req").text("");

            $("#txtb_description").removeClass("required");
            $("#lbl_txtb_description_req").text("");

            $("#txtb_sig1_name").removeClass("required");
            $("#lbl_txtb_sig1_name_req").text("");

            $("#txtb_sig1_position").removeClass("required");
            $("#lbl_txtb_sig1_position_req").text("");

            $("#txtb_sig2_name").removeClass("required");
            $("#lbl_txtb_sig2_name_req").text("");

            $("#txtb_sig2_position").removeClass("required");
            $("#lbl_txtb_sig2_position_req").text("");

            $("#txtb_sig3_name").removeClass("required");
            $("#lbl_txtb_sig3_name_req").text("");

            $("#txtb_sig3_position").removeClass("required");
            $("#lbl_txtb_sig3_position_req").text("");

        }
    }
    
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
    //************************************// 
    //*** Open Edit Modal         
    //**********************************// 
    s.btn_edit_action = function (row_id) {
        clearentry();
        s.disDept = true;
        s.ddl_departments       = s.datalistgrid[row_id].department_code;
        s.txtb_description      = s.datalistgrid[row_id].cert_descr;
        s.txtb_sig1_name        = s.datalistgrid[row_id].sig1_name;
        s.txtb_sig1_position    = s.datalistgrid[row_id].sig1_position ;
        s.txtb_sig2_name        = s.datalistgrid[row_id].sig2_name;
        s.txtb_sig2_position    = s.datalistgrid[row_id].sig2_position;
        s.txtb_sig3_name        = s.datalistgrid[row_id].sig3_name;
        s.txtb_sig3_position    = s.datalistgrid[row_id].sig3_position;

        s.isEdit = true;
        s.ModalTitle = "Edit Existing Record";
        setTimeout(function () {
            $('#main_modal').modal({ backdrop: 'static', keyboard: false });

            $('#edit').attr('ngx-data', row_id);
            var row_edited = $('#edit').attr("ngx-data");
            s.datalistgrid[row_edited].cert_descr = s.txtb_description;
        }, 300);
    }

    //***********************************// 
    //*** Update Existing Record         
    //**********************************// 
    s.SaveEdit = function () {
        if (ValidateFields()) {
            btn = document.getElementById('edit');
            btn.innerHTML = '<i class = "fa fa-spinner fa-spin"></i> Saving';

            var data = {
                department_code     : $('#ddl_departments').val()
                , cert_descr        : s.txtb_description
                , sig1_name         : s.txtb_sig1_name
                , sig1_position     : s.txtb_sig1_position
                , sig2_name         : s.txtb_sig2_name
                , sig2_position     : s.txtb_sig2_position
                , sig3_name         : s.txtb_sig3_name
                , sig3_position     : s.txtb_sig3_position
            }
            h.post("../cSSPHICCertSetup/SaveEdit", { data: data }).then(function (d) {
                if (d.data.message == "success") {
                    var row_edited = $('#edit').attr("ngx-data");
                    s.datalistgrid[row_edited].cert_descr = s.txtb_description;

                    s.oTable.fnClearTable();
                    s.oTable.fnAddData(s.datalistgrid);

                    for (var x = 1; x <= $('#datalist_grid').DataTable().page.info().pages; x++) {
                        if (get_page($('#ddl_departments').val()) == false) {
                            s.oTable.fnPageChange(x);
                        }
                        else {
                            break;
                        }
                    }
                    btn.innerHTML = '<i class="fa fa-save"> </i> Save Edit';
                    $('#main_modal').modal("hide");
                    swal("Your record successfully updated!", { icon: "success", });
                }
                else {
                    swal(d.data.message, { icon: "warning", });
                }
            });
        }
    }
    //************************************// 
    //*** Delete Record              
    //**********************************// 
    s.btn_del_row = function (row_index) {
        swal({
            title: "Are you sure to delete this record?",
            text: "Once deleted, you will not be able to recover this record!",
            icon: "warning",
            buttons: true,
            dangerMode: true,

        })
            .then(function (willDelete) {
                if (willDelete) {
                    h.post("../cSSPHICCertSetup/Delete", {
                        par_dept_code: s.datalistgrid[row_index].department_code
                    }).then(function (d) {
                        if (d.data.message == "success") {
                            s.datalistgrid = s.datalistgrid.delete(row_index);
                            s.oTable.fnClearTable();
                            if (s.datalistgrid.length != 0) {
                                s.oTable.fnAddData(s.datalistgrid);
                            }
                            swal("Your record has been deleted!", { icon: "success", });
                        }
                        else {
                            swal("Data already deleted by other user/s!", { icon: "warning", });
                            s.datalistgrid = s.datalistgrid.delete(row_index);
                            s.oTable.fnClearTable();
                            if (s.datalistgrid.length != 0) {
                                s.oTable.fnAddData(s.datalistgrid);
                            }
                        }
                    })
                }
            });
    }

    Array.prototype.delete = function (code) {
        return this.filter(function (d, k) {
            return k != code
        })
    }

    function clearentry() {
        s.ddl_departments       = "";
        s.txtb_description      = "";
        s.txtb_sig1_name        = "";
        s.txtb_sig1_position    = "";
        s.txtb_sig2_name        = "";
        s.txtb_sig2_position    = "";
        s.txtb_sig3_name        = "";
        s.txtb_sig3_position    = "";

        $("#ddl_departments").removeClass("required");
        $("#lbl_ddl_departments_req").text("");

        $("#txtb_description").removeClass("required");
        $("#lbl_txtb_description_req").text("");

        $("#txtb_sig1_name").removeClass("required");
        $("#lbl_txtb_sig1_name_req").text("");

        $("#txtb_sig1_position").removeClass("required");
        $("#lbl_txtb_sig1_position_req").text("");

        $("#txtb_sig2_name").removeClass("required");
        $("#lbl_txtb_sig2_name_req").text("");

        $("#txtb_sig2_position").removeClass("required");
        $("#lbl_txtb_sig2_position_req").text("");

        $("#txtb_sig3_name").removeClass("required");
        $("#lbl_txtb_sig3_name_req").text("");

        $("#txtb_sig3_position").removeClass("required");
        $("#lbl_txtb_sig3_position_req").text("");
    }
})