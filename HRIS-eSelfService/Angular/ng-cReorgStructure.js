/*
 * Script created By:       Vincent Jade H. Alivio
 * Script created On:       02/29/2020
 * Purpose of this Script:  
 *                          
 */
ng_selfService_App.controller("cReorgStructure_ctrlr", function ($scope, $compile, $http, $filter)
{

    var s = $scope;
    var h = $http;
    s.datalistgrid      = null;
    s.data_structure    = null;
    var datascource     = null;
    s.my_chart          = "";
    // ******************************************
    // * VJA - 02/29/2020 - Initialized page
    // ****************************************** 
    function init()
    {
        $("#ddl_department_code").select2().on('change', function (e) {
            s.FilterPageGrid();
        });
        $("#ddl_budget_code").select2().on('change', function (e) {
            s.FilterPageGrid();
        });
        $("#ddl_employment_type").select2().on('change', function (e) {
            s.FilterPageGrid();
        });


        $('#loading_msg').html("LOADING");
        //$("#modal_loading").modal();
        $('#modal_loading').modal({ backdrop: 'static', keyboard: false });
        s.ddl_department_code   = "01";
        s.ddl_budget_code       = "2022-O";
        s.ddl_employment_type   = "RE";
        h.post("../cReorgStructure/InitializeData",
            {
                par_budget_code         : s.ddl_budget_code
                , par_department_code   : s.ddl_department_code
                , par_employment_type   : s.ddl_employment_type
            }).then(function (d)
            {
                s.datalistgrid  = d.data.data;
                s.dep_lst       = d.data.dep_lst
                s.budget_lst    = d.data.budget_lst
                s.empltype_lst  = d.data.empltype_lst
                var grand_parent_data =
                {
                   
                    'name': s.datalistgrid[0].item_no + '-' +s.datalistgrid[0].first_name + ' ' + s.datalistgrid[0].last_name + ' '+s.datalistgrid[0].suffix_name
                    , 'title': s.datalistgrid[0].position_long_title
                    , 'id': s.datalistgrid[0].item_no
                    , 'className': s.datalistgrid[0].css_class
                }

                if (s.datalistgrid.length > 0)
                {
                    s.my_chart = $('#chart-container').orgchart({
                        'data': grand_parent_data,
                        'verticalLevel': s.datalistgrid[0].vertical_level,
                        'nodeContent': 'title',
                        'exportButton': true,
                        //'exportFileextension': 'pdf',
                        'exportFilename': 'MyOrgChart'
                        //'zoom':true,  
                        //'createNode': function ($node, data)
                        //    {
                        //    $node[0].id = s.getId(s.datalistgrid[0].item_no)
                        //}
                    });

                    if (s.datalistgrid.length > 1)
                    {
                        var $node = $('#selected-node').data('node');
                        var nodeVals = [];
                        var $chartContainer = $('#chart-container');
                        for (var i = 1; i < s.datalistgrid.length; i++)
                        {
                            //nodeVals = [];
                            //var datax = null;
                            
                          
                            if (i > 1)
                            {
                                if (parseInt(s.datalistgrid[i - 1].parent_item) != parseInt(s.datalistgrid[i].parent_item))
                                {
                                    s.my_chart.addChildren($chartContainer.find('#'+nodeVals[0].parent_item+'.node:last'), nodeVals.map(function (item) {
                                        var rel = nodeVals.length > 1 ? '110' : '100';
                                        return { 'name': item.name, 'title': item.title, 'id': item.item_no, 'className': item.className };
                                    }));
                                    nodeVals = [];
                                     datax =
                                    {

                                         'name': s.datalistgrid[i].item_no + '-' +s.datalistgrid[i].first_name + ' ' + s.datalistgrid[i].last_name + ' ' + s.datalistgrid[i].suffix_name
                                         , 'title': s.datalistgrid[i].position_long_title
                                         , 'item_no': s.datalistgrid[i].item_no
                                         , 'parent_item': s.datalistgrid[i].parent_item
                                         , 'className': s.datalistgrid[i].css_class
                                    }
                                    nodeVals.push(datax);
                                    
                                }
                                else
                                {
                                     datax =
                                    {

                                         'name': s.datalistgrid[i].item_no+'-'+s.datalistgrid[i].first_name + ' ' + s.datalistgrid[i].last_name + ' ' + s.datalistgrid[i].suffix_name
                                         , 'title':s.datalistgrid[i].position_long_title
                                         , 'item_no': s.datalistgrid[i].item_no
                                         , 'parent_item': s.datalistgrid[i].parent_item
                                         , 'className': s.datalistgrid[i].css_class
                                    }
                                    nodeVals.push(datax);
                                 
                                }
                            }
                            else {
                                     datax =
                                    {

                                         'name': s.datalistgrid[i].item_no + '-' +s.datalistgrid[i].first_name + ' ' + s.datalistgrid[i].last_name + ' '+s.datalistgrid[i].suffix_name
                                         , 'title':s.datalistgrid[i].position_long_title
                                         , 'item_no': s.datalistgrid[i].item_no
                                         , 'parent_item': s.datalistgrid[i].parent_item
                                         , 'className': s.datalistgrid[i].css_class
                                    }
                                    nodeVals.push(datax);
                                }
                        }
                        s.my_chart.addChildren($chartContainer.find('#'+nodeVals[0].parent_item+'.node:last'), nodeVals.map(function (item) {
                                        var rel = nodeVals.length > 1 ? '110' : '100';
                            return { 'name': item.name, 'title': item.title, 'id': item.item_no, 'className': item.className };
                                    }));
                    }
                }

                $('#modal_loading').modal("hide");
            });
    }

    init()

    s.getId = function (item_no) {
        //return (new Date().getTime()) * 1000 + Math.floor(Math.random() * 1001);
        return parseInt(item_no);
    };
    //***********************************************************//
    //*** VJA - 02/29/2020 - Occure when value change
    //***********************************************************// 
    s.FilterPageGrid = function () {
        //$('#loading_msg').html("LOADING");
        //$("#modal_loading").modal();
        $('#modal_loading').modal({ backdrop: 'static', keyboard: false });
        h.post("../cReorgStructure/FilterPageGrid",
            {
                  par_budget_code       : $('#ddl_budget_code option:selected').val()
                , par_department_code   : $('#ddl_department_code option:selected').val()
                , par_employment_type   : $('#ddl_employment_type option:selected').val()
            }
        ).then(function (d)
        {
           
            s.datalistgrid = d.data.data;
            var $chartContainer = $('#chart-container');
            $node = $chartContainer.find('.node:first');
            s.my_chart.removeNodes($node);
            var grand_parent_data =
            {

                'name': s.datalistgrid[0].item_no + '-' + s.datalistgrid[0].first_name + ' ' + s.datalistgrid[0].last_name + ' ' + s.datalistgrid[0].suffix_name
                , 'title': s.datalistgrid[0].position_long_title
                , 'id': s.datalistgrid[0].item_no
                , 'className': s.datalistgrid[0].css_class

            }

            if (s.datalistgrid.length > 0) {
                s.my_chart = $('#chart-container').orgchart({
                    'data': grand_parent_data,
                    'verticalLevel': s.datalistgrid[0].vertical_level,
                    'nodeContent': 'title',
                    'exportButton': true,
                    //'exportFileextension': 'pdf',
                    'exportFilename': 'MyOrgChart',
                    //'zoom':true
                    //'createNode': function ($node, data)
                    //    {
                    //    $node[0].id = s.getId(s.datalistgrid[0].item_no)
                    //}
                });

                if (s.datalistgrid.length > 1) {
                    var $node = $('#selected-node').data('node');
                    var nodeVals = [];
                   
                    for (var i = 1; i < s.datalistgrid.length; i++) {
                        //nodeVals = [];
                        //var datax = null;


                        if (i > 1) {
                            if (parseInt(s.datalistgrid[i - 1].parent_item) != parseInt(s.datalistgrid[i].parent_item)) {
                                s.my_chart.addChildren($chartContainer.find('#' + nodeVals[0].parent_item + '.node:last'), nodeVals.map(function (item) {
                                    var rel = nodeVals.length > 1 ? '110' : '100';
                                    return { 'name': item.name, 'title': item.title, 'id': item.item_no ,'className':item.className };
                                }));
                                nodeVals = [];
                                datax =
                                    {

                                        'name': s.datalistgrid[i].item_no + '-' + s.datalistgrid[i].first_name + ' ' + s.datalistgrid[i].last_name + ' ' + s.datalistgrid[i].suffix_name
                                        , 'title': s.datalistgrid[i].position_long_title
                                        , 'item_no': s.datalistgrid[i].item_no
                                        , 'parent_item': s.datalistgrid[i].parent_item
                                        , 'className': s.datalistgrid[i].css_class
                                    }
                                nodeVals.push(datax);

                            }
                            else {
                                datax =
                                    {

                                        'name': s.datalistgrid[i].item_no + '-' + s.datalistgrid[i].first_name + ' ' + s.datalistgrid[i].last_name + ' ' + s.datalistgrid[i].suffix_name
                                        , 'title': s.datalistgrid[i].position_long_title
                                        , 'item_no': s.datalistgrid[i].item_no
                                        , 'parent_item': s.datalistgrid[i].parent_item
                                        , 'className': s.datalistgrid[i].css_class
                                    }
                                nodeVals.push(datax);

                            }
                        }
                        else {
                            datax =
                                {

                                    'name': s.datalistgrid[i].item_no + '-' + s.datalistgrid[i].first_name + ' ' + s.datalistgrid[i].last_name + ' ' + s.datalistgrid[i].suffix_name
                                    , 'title': s.datalistgrid[i].position_long_title
                                    , 'item_no': s.datalistgrid[i].item_no
                                    , 'parent_item': s.datalistgrid[i].parent_item
                                    , 'className': s.datalistgrid[i].css_class
                                }
                            nodeVals.push(datax);
                        }
                    }
                    s.my_chart.addChildren($chartContainer.find('#' + nodeVals[0].parent_item + '.node:last'), nodeVals.map(function (item) {
                        var rel = nodeVals.length > 1 ? '110' : '100';
                        return { 'name': item.name, 'title': item.title, 'id': item.item_no, 'className': item.className };
                    }));
                }
            }
            
            $("#modal_loading").modal('hide');
        });
    }

    s.click_export = function ()
    {
        $('.oc-export-btn').click();
    }


    function loopChart($hierarchy) {
        var $siblings = $hierarchy.children('.nodes').children('.hierarchy');
        if ($siblings.length) {
            $siblings.filter(':not(.hidden)').first().addClass('first-shown')
                .end().last().addClass('last-shown');
        }
        $siblings.each(function (index, sibling) {
            loopChart($(sibling));
        });
    }

    function filterNodes(keyWord) {
        if (!keyWord.length) {
            window.alert('Please type key word firstly.');
            return;
        } else {
            var $chart = $('.orgchart');
            // disalbe the expand/collapse feture
            $chart.addClass('noncollapsable');
            // distinguish the matched nodes and the unmatched nodes according to the given key word
            $chart.find('.node').filter(function (index, node) {
                return $(node).text().toLowerCase().indexOf(keyWord) > -1;
            }).addClass('matched')
                .closest('.hierarchy').parents('.hierarchy').children('.node').addClass('retained');
            // hide the unmatched nodes
            $chart.find('.matched,.retained').each(function (index, node) {
                $(node).removeClass('slide-up')
                    .closest('.nodes').removeClass('hidden')
                    .siblings('.hierarchy').removeClass('isChildrenCollapsed');
                var $unmatched = $(node).closest('.hierarchy').siblings().find('.node:first:not(.matched,.retained)')
                    .closest('.hierarchy').addClass('hidden');
            });
            // hide the redundant descendant nodes of the matched nodes
            $chart.find('.matched').each(function (index, node) {
                if (!$(node).siblings('.nodes').find('.matched').length) {
                    $(node).siblings('.nodes').addClass('hidden')
                        .parent().addClass('isChildrenCollapsed');
                }
            });
            // loop chart and adjust lines
            loopChart($chart.find('.hierarchy:first'));
        }
    }

    function clearFilterResult() {
        $('.orgchart').removeClass('noncollapsable')
            .find('.node').removeClass('matched retained')
            .end().find('.hidden, .isChildrenCollapsed, .first-shown, .last-shown').removeClass('hidden isChildrenCollapsed first-shown last-shown')
            .end().find('.slide-up, .slide-left, .slide-right').removeClass('slide-up slide-right slide-left');
    }

    $('#key-word').on('keyup', function (event) {
        if (event.which === 13) {
            filterNodes(this.value);
        } else if (event.which === 8 && this.value.length === 0) {
            clearFilterResult();
        }
    });

   
    //**************************************//
    //****************log-out***************//
    //**************************************// 
    s.logout = function () {
        h.post("../Login/logout").then(function (d) {
            if (d.data.success == 1) {
                location.href = "../Login/Index"
            }
        })
    }
});