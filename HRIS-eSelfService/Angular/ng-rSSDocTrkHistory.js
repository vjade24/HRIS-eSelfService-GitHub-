/*
 * Script created By:       Vincent Jade H. Alivio
 * Script created On:       01/09/2020
 * Purpose of this Script:  
 *                          
*/
ng_selfService_App.controller("rSSDocTrkHistory_ctrlr", function ($scope, $compile, $http, $filter) {
    var s = $scope;
    var h = $http;
    s.year = [];
    s.rowLen = "";
    s.track_year = "";
    function RetrieveYear() {

        var currentYear = new Date().getFullYear();

        var prev_year = currentYear - 5;
        for (var i = 1; i <= 8; i++) {
            var data = { "year": prev_year }
            s.year.push(data)
            prev_year++;
        }

    }

    var Init_dochistory_Tbl = function (par_data) {
        s.Dochistory_Data = par_data;
        s.Dochistory_Tbl = $('#datalist_dochistory').dataTable(
            {

                data: s.Dochistory_Data,
                sDom: 'rt<"bottom"p>',
                pageLength: 10,
                columns: [
                    {
                        "mData": null,
                        "mRender": function (data, type, full, row) {
                            return "<center><span class='details-control' style='display:block;' ng-click='btn_show_details(" + '"details_info"' + ")' ></center>"
                        }
                    },
                    //{
                    //    "mData": "doc_ctrl_nbr",
                    //    //"sWidth":"10%",
                    //    "mRender": function (data, type, full, row) {
                    //        return " <span class='text-center btn-block' >" + data + " </span>"
                    //    }
                    //},
                    {
                        "mData": "payroll_month_descr",
                        //"sWidth": "5%",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                     //{
                     //    "mData": "payroll_registry_descr",
                     //    //"sWidth": "30%",
                     //    "mRender": function (data, type, full, row) {
                     //        return "<span class='text-left btn-block'>&nbsp;" + data + "</span>"
                     //    }
                     //},
                      //{
                      //    "mData": "payrolltemplate_descr",
                      //    //"sWidth": "20%",
                      //    "mRender": function (data, type, full, row) {
                      //        return "<span class='text-left btn-block'>&nbsp;" + data + "</span>"
                      //    }
                      //},
                     {
                         "mData": "net_pay",
                         //"sWidth": "10%",
                         "mRender": function (data, type, full, row) {
                             return "<span class='text-right btn-block'>" + currency(data) + "&nbsp;</span>"
                         }
                     },
                     {
                         "mData": "doc_remarks",
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
                                '<button type="button" class="btn btn-warning btn-sm action" ng-click="btn_print_history_grid(' + row["row"] + ',' + '\'Dochistory_Data\'' + ')"  data-toggle="tooltip" data-placement="top" title="Document History"> <i class="fa fa-history"></i> </button>' +
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


    function init() {
        var curr_year = new Date().getFullYear().toString();
        s.track_year = curr_year
        s.rowLen = "10"
        RetrieveYear()
        Init_dochistory_Tbl([])
        var trk_year = s.track_year
        //$('#loading_msg').html("LOADING");
        $("#modal_loading").modal();
        h.post("../rSSDocTrkHistory/InitializeData", { par_year: curr_year }).then(function (d) {


            s.Dochistory_Data = d.data.trk_details
            s.Dochistory_Data.refreshTable('Dochistory_Tbl', '');

            $("#modal_loading").modal('hide');
        })
    }

   
    init()

    s.ChangeYear = function (p_year) {
        h.post("../rSSDocTrkHistory/ChangeYear", { par_year: p_year }).then(function (d) {
            s.Dochistory_Data = d.data.trk_details
            s.Dochistory_Data.refreshTable('Dochistory_Tbl', '');
        })
    }

    s.search_in_list = function (value, table) {
        $("#" + table).DataTable().search(value).draw();
    }

    s.setNumOfRow = function (value, table) {
        $("#" + table).DataTable().page.len(s.rowLen).draw();
    }

    Array.prototype.refreshTable = function (table, id) {

        if (this.length == 0) {

            s[table].fnClearTable();
        }
        else {

            s[table].fnClearTable();
            s[table].fnAddData(this);
        }

        var el_id = s[table][0].id
        if (id != "") {
            for (var x = 1; x <= $("#" + el_id).DataTable().page.info().pages; x++) {
                if (id.get_page(table) == false) {
                    s[table].fnPageChange(x);
                }
                else {
                    break;
                }
            }
        }
        $("#spinner_load").modal("hide")

    }

    function elEmpty(data) {
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
        else
        {
            retdata = parseFloat(d).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
            return retdata
        }
    }
    //***********************************//
    //***Print-Button-on-Grid*****VJA***//
    //***********************************// 
    s.btn_print_history_grid = function (lst, table_data) {
        h.post("../rSSDocTrkHistory/RetrieveDocHistory", {

            par_doc_ctrl_nbr: s[table_data][lst].doc_ctrl_nbr
        }).then(function (d) {

            if (d.data.message == "success") {
                var controller = "Reports"
                var action = "Index"
                var ReportName = "CrystalReport"
                var SaveName= "Crystal_Report"
                var ReportType = "inline"
                var ReportPath = "~/Reports/"
                var sp = ""
                var parameters = ""

                sp = "sp_edocument_trk_tbl_history";
                parameters = "p_doc_ctrl_nbr," + s[table_data][lst].doc_ctrl_nbr + ",p_docmnt_type," + s[table_data][lst].docmnt_type
                ReportPath = ReportPath + "cryDocTracking/cryDocsHistory.rpt"

                location.href = "../" + controller + "/" + action + "?ReportName=" + ReportName
                    + "&SaveName=" + SaveName
                    + "&ReportType=" + ReportType
                    + "&ReportPath=" + ReportPath
                    + "&Sp=" + sp + "," + parameters
            } else {
                swal("No Data Found !", "", "warning")
            }

        })

    }

    $('#datalist_dochistory tbody').on('click', 'span.details-control', function ()
    {
        var tr = $(this).closest('tr');
        var row = $('#datalist_dochistory').DataTable().row(tr);

        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else
        {
            //console.log(row.data())
            // Open this row
            row.child(format(row.data())).show();
            tr.addClass('shown');

        }

    });

    //-----------------UPDATE BY JADE -------------------------------------------------------------

    //NEW UPDATE BY: JORGE RUSTOM VILLANUEVA 2020-09-18

    /* Formatting function for row details - modify as you need */

    /* Formatting function for row details - modify as you need */
    function format(d)
    {

        // `d` is the original data object for the row
        return '<table class="no-border" style="padding:0px !important;min-height:10px !important" id="table_show_details"> ' +
            '<tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Ctrl Nbr.:</td>' +
            '<td style="padding:0px">' + d.doc_ctrl_nbr + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td  style="width:24% !important;padding:0px 0px 0px 10px">Document Description: </td>' +
            '<td style="padding:0px">' + d.payroll_registry_descr + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td style="width:24% !important;padding:0px 0px 0px 10px">Payroll Template :</td>' +
            '<td style="padding:0px">' + d.payrolltemplate_descr + '</td>' +
            '</tr>' +
            //'<tr>' +
            //'<td style="width:30% !important;padding:0px 0px 0px 10px">OBR Ctrl Nbr :</td>' +
            //'<td style="padding:0px">' + d.doc_obr_nbr + '</td>' +
            //'</tr>' +
            //'<tr>' +
            //'<td  style="width:30% !important;padding:0px 0px 0px 10px">Voucher Ctrl Nbr :</td>' +
            //'<td style="padding:0px">' + d.doc_voucher_nbr + '</td>' +
            //'</tr>' +
            //'<tr>' +
            //'<td  style="width:30% !important;padding:0px 0px 0px 10px">Total Net Pay:</td>' +
            //'<td style="padding:0px"> ' + currency(d.net_pay) + ' </td>' +
            //'</tr>' +
            //'<tr>' +
            //'<td  style="width:30% !important;padding:0px 0px 0px 10px; display:none;">Gross Pay :</td>' +
            //'<td style="padding:0px;display:none;">' + currency(d.gross_pay) + '</td>' +
            //'</tr>' +
            //'<tr>' +
            //'<td  style="width:30% !important;padding:0px 0px 0px 10px">OBR Amount :</td>' +
            //'<td style="padding:0px">' + currency(d.obr_tot_amt) + '</td>' +
            '</table>';
    }

});