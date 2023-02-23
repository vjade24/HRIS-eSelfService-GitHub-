
ng_selfService_App.controller("cMainPageCtrlr", function (commonScript, $scope, $compile, $http, $filter) {
    
    var s = $scope;
    var h = $http;
    var cs = commonScript
    s.hideThis = false;
    s.controller = "Home";
    s.Action1 = "Index";
    s.Action2 = "About";
    s.Action3 = "Contact";
    s.username = "XXXX";
    s.showAddFav = false;
    s.showRemoveFav = false;
    var group = new Array()
    s.MenuList = []
    s.announcement = []
    var init = function ()
    {
        cs.loading("show")

       

        function minusOne(id) {

            $("#" + "9409").text(localStorage["minus_time_sched"])
            $("#" + "9404").text(localStorage["minus_travel_order"])
            $("#" + "9407").text(localStorage["minus_force_leave"])
            $("#" + "9403").text(localStorage["minus_as"])
            $("#" + "9406").text(localStorage["minus_leave"])
        }

        // $("#btn_applyAS").on('onclick', function (e) {
        //     s.btn_applyAS();
        // });
        
        if (localStorage.getItem("first_log_in") == 1) {

           

            h.post("../Menu/GetSesssionMenuList").then(function (d) {

                s.MenuList = d.data.menu;
              
                var date = new Date();
                var menu_list = d.data.menu;
                localStorage.setItem('menu', JSON.stringify(menu_list));

                date.setTime(date.getTime() + (30 * 60 * 1000));
                var date = new Date();
                localStorage.setItem('expiretime', date);

                //localStorage["minus_time_sched"] = d.data.geticationList[0].counter_notif_time
                //localStorage["minus_travel_order"] = d.data.getNotificationList[0].counter_notif_to
                //localStorage["minus_force_leave"] = d.data.getNotificationList[0].counter_notif_flv
                //localStorage["minus_as"] = d.data.getNotificationList[0].counter_notif
                //localStorage["minus_leave"] = d.data.getNotificationList[0].counter_notif_lv
                //alert(localStorage["minus_time_sched"])
                s.announcement = d.data.announcement;
                //console.log(s.announcement)
                //console.log(s.MenuList)
                if (d.data.expanded != 0) {
                    angular.forEach(s.MenuList, function (value) {
                        if (value.url_name == null || value.url_name == "") value.hasUrl = 0
                        else value.hasUrl = 1
                        var exp = d.data.expanded.filter(function (d) {
                            return d == value.id.toString()
                        })
                        if (exp == value.id.toString()) {
                            value.isOpen = 1
                            group.push(value.id);
                        }
                    })
                }
                else {
                    angular.forEach(s.MenuList, function (value) {
                        if (value.url_name == null || value.url_name == "") value.hasUrl = 0
                        else value.hasUrl = 1
                        value.isOpen = 0;
                    })
                }
                //console.log(d.data.as_alerts)
                if (d.data.as_alerts.length > 0) {
                    init_table_data(d.data.as_alerts);

                    toastr.options = {
                        "closeButton": true,
                        "progressBar": true,
                        "preventDuplicates": true,
                        "positionClass": "toast-top-right",
                        "showDuration": "30000",
                        "hideDuration": "30000",
                        "timeOut": "30000",
                        "extendedTimeOut": "30000",
                        "showEasing": "swing",
                        "hideEasing": "linear",
                        "showMethod": "fadeIn",
                        "hideMethod": "fadeOut"
                    }

                    for (var i = 0; i < d.data.as_alerts.length; i++) {
                        // toastr.error(d.data.as_alerts[i].dtr_status_descr + '<br>AM IN-- ' + d.data.as_alerts[i].time_in_am + ',<br> AM OUT-- ' + d.data.as_alerts[i].time_out_am + ',<br> PM IN-- ' + d.data.as_alerts[i].time_in_pm + ',<br> PM OUT-- ' + d.data.as_alerts[i].time_out_pm + '<button type="button" class="btn btn-sm btn-primary pull-right" id="btn_applyAS" onclick="alert("asdasdasd")" >Apply AS</button>', d.data.as_alerts[i].dtr_date + '- <small disabled>Discrepancy Date</small>');
                        toastr.error(d.data.as_alerts[i].dtr_status_descr + '<br>AM IN-- ' + d.data.as_alerts[i].time_in_am + ',<br> AM OUT-- ' + d.data.as_alerts[i].time_out_am + ',<br> PM IN-- ' + d.data.as_alerts[i].time_in_pm + ',<br> PM OUT-- ' + d.data.as_alerts[i].time_out_pm, d.data.as_alerts[i].dtr_date + '- <small disabled>Discrepancy Date</small>');

                    }
                    toastr.success('Apply Authorization Slip (AS)', 'You need ACTION');

                    $('#myModal2').modal({ backdrop: 'static', keyboard: false });
                }
                else {
                    init_table_data([]);
                }


                if (d.data.announcement != undefined) {
                    if (d.data.announcement.length > 0) {

                        $('#announcement_modal').modal({ backdrop: 'static', keyboard: false });
                    }

                }

                setTimeout(function () {
                    minusOne("")
                }, 100)

                cs.loading("hide");

                
              

            })

            localStorage.setItem("first_log_in", 2);

            
            get_notification();
           
        }


        else
        {

            cs.loading("hide");
           
        }
       
		
       

        //ADDED BY JORGE: SET COOKIES FOR FIRSTS LOG IN //2020-11-18
        //if (localStorage.getItem("first_log_in") == 1) {
        //    localStorage.setItem("first_log_in", 0);
        //    url = "/cSSTimeEntry";
        //    window.location.replace(url);
        //}
      
    }

    init();

     //**************************************//
    //************GET NOTIFICATION*********//
    //**************************************// 

    function get_notification() {


      

        h.post("../Menu/GetNotification").then(function (d) {
            if (d.data.message == "success") {
                s.NotifList = d.data.notif_list;
                s.notifLst_length = d.data.notif_list.length;
				
				var date = new Date();
				var notif = d.data.notif_list; 
				localStorage.setItem( 'name', JSON.stringify(notif));

				date.setTime(date.getTime() + (30 * 60 * 1000));
				var date = new Date();
                localStorage.setItem('expiretime', date);

                localStorage["minus_time_sched"] = d.data.getNotificationList[0].counter_notif_time
                localStorage["minus_travel_order"] = d.data.getNotificationList[0].counter_notif_to
                localStorage["minus_force_leave"] = d.data.getNotificationList[0].counter_notif_flv
                localStorage["minus_as"] = d.data.getNotificationList[0].counter_notif
                localStorage["minus_leave"] = d.data.getNotificationList[0].counter_notif_lv
                


                setTimeout(function () {
                    
                    $("#" + "9409").removeClass("fa fa-spinner fa-spin")
                    $("#" + "9409").addClass("label label-info")
                    $("#" + "9404").removeClass("fa fa-spinner fa-spin")
                    $("#" + "9404").addClass("label label-info")
                    $("#" + "9407").removeClass("fa fa-spinner fa-spin")
                    $("#" + "9407").addClass("label label-info")
                    $("#" + "9403").removeClass("fa fa-spinner fa-spin")
                    $("#" + "9403").addClass("label label-info")
                    $("#" + "9406").removeClass("fa fa-spinner fa-spin")
                    $("#" + "9406").addClass("label label-info")
                   

                    $("#" + "9409").text(localStorage["minus_time_sched"])
                    $("#" + "9404").text(localStorage["minus_travel_order"])
                    $("#" + "9407").text(localStorage["minus_force_leave"])
                    $("#" + "9403").text(localStorage["minus_as"])
                    $("#" + "9406").text(localStorage["minus_leave"])

                    

                }, 100)
				
                if (s.notifLst_length > 0)
                {
                    s.show_no_alerts = false;
                    s.show_spinner = true;

                    setTimeout(function () {
                        s.show_spinner = false;
                    }, 300);
                }
                else {
                    s.show_no_alerts = true;
                    s.show_spinner = false;
                }
            }
        });
		
    }

   

    s.get_notification_index = function () {
        get_notification();
    }
    var init_table_data = function (par_data) {
        s.datalistgrid = par_data;
        s.oTable = $('#datalist_grid').dataTable(
            {
                data: s.datalistgrid,
                bSort: false,
                bAutoWidth: false,
                sDom: 'rt<"bottom">',
                paging: false,
                columns: [
                    {
                        "mData": "dtr_date",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "time_in_am",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "time_out_am",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "time_in_pm",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": "time_out_pm",
                        "mRender": function (data, type, full, row) {
                            return "<span class='text-center btn-block'>" + data + "</span>"
                        }
                    },
                    {
                        "mData": null,
                        "mRender": function (data, type, full, row) {
                            return "<center><button class='text-center btn btn-danger btn-block' style='padding: 2px 5px 2px 5px;' ng-click='btn_applyAS()'> Apply AS</button></center>"
                        }
                    }
                ],
                "createdRow": function (row, data, index) {
                    $compile(row)($scope);  //add this to compile the DOM
                },
            });
    }

    function newEl(tag) {
        return document.createElement(tag);
    }

    function quemark_color(str, element)
    {
        if (str == "?") {
            $("#" + element).addClass('xx_quecolor');
        }
        return str;
    }
    
    //**************************************//
    //********collapse-expand-menu**********//
    //**************************************// 
    s.collapse = function (val, id, hasUrl) {

        if (hasUrl == 1) return
        var menulink = 0
        var menulvl = findMenu(id)[0].menu_level
        if (menulvl == 1) {
            group = new Array()
            group.push(id)
        }
        else {
            var p = group.filter(function (d) {
                return d == id
            })
            if (p == null || p == "") group.push(id)

        }
        angular.forEach(s.MenuList, function (value) {
            var active = group.filter(function (d) {
                return d == value.id
            })
            if (value.id == id) {

                menulink = value.menu_id_link
                if (value.isOpen == 0) {
                    value.isOpen = 1
                    h.post("../Menu/expandedAdd", { id: id, menulevel: value.menu_level })
                }
                else {
                    value.isOpen = 0
                    h.post("../Menu/expandedRemove", { id: id })
                }
            }
            else {
                if (active != value.id) value.isOpen = 0
            }
        })
    }
    //***********************Functions end*************************************************************//


    //**************************************//
    //**************find-menu***************//
    //**************************************// 
    var findMenu = function (id) {
        return data = s.MenuList.filter(function (d) {
            return d.id == id
        })
    }
    //***********************Functions end*************************************************************//



    //***********************Functions end*************************************************************//


    //**************************************//
    //************location-redirect*********//
    //**************************************// 
    s.setActive = function (lst) {
        h.post("../Menu/UserAccessOnPage", { list: lst }).then(function (d) {
            if (d.data == "success") {
                location.href = "../" + lst.url_name
            }
        })
    }

    s.btn_applyAS = function ()
    {
        var lst = {
            allow_add           : "1​"
            , allow_delete      : "1"
            , allow_edit        : "1"
            , allow_edit_history: "1"
            , allow_print       : "1"
            , allow_view        : "0"
            , favorites_mode    : "0"
            , hasUrl            : "1"
            , id                : "9102"
            , isOpen            : "0"
            , menu_icon         : ""
            , menu_id_link      : "9101"
            , menu_level        : "2"
            , menu_name         : "Authorization Slip (AS)"
            , menu_sort_order   : "1"
            , module_id         : "9"
            , page_title        : "Authorization Slip (AS)"
            , role_id           : "999"
            , status            : "1"
            , url_name          : "cSSAuthorizationSlipAppl"
            , user_id           : "U0900"
        };
        s.setActive(lst);
    }

})