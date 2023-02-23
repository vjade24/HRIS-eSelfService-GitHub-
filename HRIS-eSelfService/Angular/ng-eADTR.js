
ng_selfService_App.controller("ng-eADTR_ctrlr", function ($scope, $http, $filter) {
    var s = $scope
    var h = $http

    s.personnel = []
    s.seconds = ""
    s.minutes = ""
    s.hours = ""
    s.meridiem = ""
    s.var_entryType = ""
    s.entry_title = ""
    s.today = ""
    s.timeEntrytype = 0
    s.wait = false


    var hr = 0
    var min = 0
    var datetime;
    var date = ""
    var dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    var monthInYear = ["January", "February", "March", "April", "May", ",June", "July", "August", "September", "October", "November", "December"]
    var dialLines = document.getElementsByClassName('diallines');
    function addValueToEntry(data) {
        console.log(data)
        var dt = data;
        addvalue("am_in", elEmpty(dt[0].time_in_am, "00:00"))
        addvalue("am_out", elEmpty(dt[0].time_out_am, "00:00"))
        addvalue("pm_in", elEmpty(dt[0].time_in_pm, "00:00"))
        addvalue("pm_out", elEmpty(dt[0].time_out_pm, "00:00"))
    }
    function checkTimeEntries(data) {
        console.log(data)
        if (data.length > 0) {
            var dt2 = data;
            s.var_entryType = dt2[0].timeEntrytype
            if (dt2[0].timeEntrytype > 1 && dt2[0].timeEntrytype < 3) {
                $("#am_in").prop("disabled", true)
            }
            else if (dt2[0].timeEntrytype > 2 && dt2[0].timeEntrytype < 4) {
                $("#am_in").prop("disabled", true)
                $("#am_out").prop("disabled", true)
            }
            else if (dt2[0].timeEntrytype > 3) {
                $("#am_in").prop("disabled", true)
                $("#am_out").prop("disabled", true)
                $("#pm_in").prop("disabled", true)
            }
        }
    }

    function gettimestampdate(value) {
        var d1 = value.split("(")
        var d2 = d1[1].split(")")

        return parseInt(d2[0])
    }

    function addvalue(id, val) {
        $("#" + id).val(val)
        s[id] = val
    }
    function elEmpty(value, alt) {
        if (value == "" || value == null || value == undefined) {
            return alt;
        }
        else {
            return value;
        }
    }
    function formatTimeEntry(time) {
        var sp = time.split(":");
        var hour = ""
        var min = ""
        var entry = ""
        if (parseInt(sp[0]) < 10) {
            hour = "0" + parseInt(sp[0]).toString();
        }
        else {
            hour = sp[0];
        }
        if (parseInt(sp[1]) < 10) {
            min = "0" + parseInt(sp[1]).toString();
        }
        else {
            min = sp[1];
        }
        entry = hour + ":" + min

        return entry
    }

    function init() {

        $("#am_in").prop("disabled", false)
        $("#am_out").prop("disabled", false)
        $("#pm_in").prop("disabled", false)
        s.current_id = "";
        s.focus = 1
        $("#emplid").focus();
        s.showenter = true

        h.post("../cSSTimeEntry/Initialize").then(function (d) {

            //console.log(d.data.dtNow_str)
            //console.log(d.data.hour)
            //console.log(d.data.min)
            //console.log(d.data.sec)
            // s.personnel = d.data.personnel
            //console.log(d.data.TE)
            //console.log(d.data.cie)



            date = new Date(gettimestampdate(d.data.dtNow))
            datetime = new Date(gettimestampdate(d.data.dtNow))


            TODATE(date)
            addvalue("txtb_empl_id", d.data.empl_id)
            addvalue("txtb_employee_name", d.data.empl_name)

            if (d.data.TE.length > 0) {
                addValueToEntry(d.data.TE)
            }
            else {
                addvalue("am_in", "00:00")
                addvalue("am_out", "00:00")
                addvalue("pm_in", "00:00")
                addvalue("pm_out", "00:00")
            }
            checkTimeEntries(d.data.cie)
        })
    }


    init()
    for (var i = 1; i < 60; i++) {
        dialLines[i] = $(dialLines[i - 1]).clone()
            .insertAfter($(dialLines[i - 1]));
        $(dialLines[i]).css('transform', 'rotate(' + 6 * i + 'deg)');
    }


    function TODATE(date) {
        var month = monthInYear[date.getMonth()];
        var day = date.getDate() + ',';
        var year = date.getFullYear();
        var weekday = dayOfWeek[date.getDay()]
        $('.weekday').text(weekday);
        $('.month').text(month);
        $('.day').text(day);
        $('.year').text(year);
        s.today = year + "-" + (date.getMonth() + 1) + "-" + date.getDate()
    }


    //var dt = new Date("December 30, 2017 11:20:25");
    //dt.setSeconds(dt.getSeconds() + 10);


    function tick() {
        //date = new date();
        //datetime = new date();

        var form12hr = date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true }).split(":");
        var seconds = date.getSeconds();
        var minutes = date.getMinutes();
        var hours = date.getHours();
        var day = date.getDate();
        var weekday = dayOfWeek[date.getDay()]
        var sec = form12hr[2].split(" ")
        s.seconds = sec[0]
        s.minutes = form12hr[1]
        s.hours = form12hr[0]
        s.meridiem = sec[1].toString()
        hr = parseInt(hours)
        min = parseInt(minutes)
        if (s.hours == "12" && s.minutes == "00" && (s.seconds == "01" || s.seconds == "02") && s.meridiem == "AM") {
            TODATE(date)
        }

        var secAngle = seconds * 6;
        var minAngle = minutes * 6 + seconds * (360 / 3600);
        var hourAngle = hours * 30 + minutes * (360 / 720);

        $('.sec-hand').css('transform', 'rotate(' + secAngle + 'deg)');
        $('.min-hand').css('transform', 'rotate(' + minAngle + 'deg)');
        $('.hour-hand').css('transform', 'rotate(' + hourAngle + 'deg)');
        $('.date').text(day);
        $('.hours').text(zeroPad(s.hours, 2));
        $('.minutes').text(zeroPad(s.minutes, 2));
        $('.seconds').text(zeroPad(s.seconds, 2));
        $('.meridiem').text(zeroPad(s.meridiem, 2));

        date.setSeconds(date.getSeconds() + 1);
        datetime.setSeconds(datetime.getSeconds() + 1);
    }

    setInterval(tick, 1000);



    //$(document).on("keydown", function (e) {
    //    console.log(e.which)
    //    var we = window.event;

    //    if (e.which == 27)
    //    {

    //        $("#emplid").val("");
    //        $("#txtb_employee_name").val("");
    //        $("#emplid").focus();
    //        $("#am_in").val("");
    //        $("#am_out").val("");
    //        $("#pm_in").val("");
    //        $("#pm_out").val("");


    //    }
    //    else if (e.which == 37)
    //    {
    //        $("#no").focus();

    //    }
    //    else if (e.which == 38)
    //    {
    //        $("#emplid").focus();

    //    }
    //    else if (e.which == 39)
    //    {
    //        $("#yes").focus();
    //    }

    //    if (e.key == "Enter")
    //    {

    //        //if ($("#emplid").is(":focus") == false)
    //        //{
    //        //    $("#emplid").focus()
    //        //}


    //        $(".swal-button--confirm").click(); 
    //        if ($("#emplid").is(":focus"))
    //        {
    //            if (s.dt.length > 0)
    //            {

    //                if (s.current_id != s.id)
    //                {

    //                    $("#emplid").prop("disabled",true);

    //                    var mrd = mrdm(s.meridiem)


    //                    h.post("../cSSTimeEntry/AddTimeEntries", { hours: hr, minutes: min, meridiem: mrd, today: s.today }).then(function (d) {
    //                        var dtr = d.data.dtr_dtl
    //                        var icn = dtr[0].dtr_icon
    //                        console.log(d.data.dtr_dtl)
    //                        if (d.data.success_msg == "success") {
    //                            if (dtr[0].dtr_message == "logout?") {
    //                                $("#undertime_modal").modal('show')
    //                            }
    //                            else {
    //                                if (icn == "success") {
    //                                    s.current_id = s.id
    //                                }
    //                                swal(dtr[0].dtr_message, { icon: icn }).then(function () {
    //                                    $("#emplid").click();
    //                                })


    //                                $("#emplid").prop("disabled", false);
    //                                s.am_in = dtr[0].dtr_am_in
    //                                s.am_out = dtr[0].dtr_am_out
    //                                s.pm_in = dtr[0].dtr_pm_in
    //                                s.pm_out = dtr[0].dtr_pm_out

    //                            }
    //                        }
    //                        else {
    //                            console.log(d.data.message)
    //                        }


    //                    })
    //                }
    //                else
    //                {
    //                    swal("Your previous action is successfull, \n no need to reeat this action", { icon: "warning" })
    //                }
    //            }
    //        }
    //    }

    //})




    s.Enter = function () {

        $(".swal-button--confirm").click();
        if (s.current_id != s.id) {

            $("#emplid").prop("disabled", true);

            var mrd = mrdm(s.meridiem)

            h.post("../cSSTimeEntry/AddTimeEntries2", { entryType: s.entryType }).then(function (d) {

                if (d.data.message == "success") {
                    date = new Date(gettimestampdate(d.data.dtNow))
                    datetime = new Date(gettimestampdate(d.data.dtNow))
                    addValueToEntry(d.data.TE)
                    //var dt = d.data.TE;
                    //addvalue("am_in", elEmpty(dt[0].time_in_am))
                    //addvalue("am_out", elEmpty(dt[0].time_out_am))
                    //addvalue("pm_in", elEmpty(dt[0].time_in_pm))
                    //addvalue("pm_out", elEmpty(dt[0].time_out_pm))
                    checkTimeEntries(d.data.cie)

                    swal(s.entry_title + " successful!", { icon: "success" })
                }


                $("#addTimeEntries_modal").modal("hide")
            })
        }
        else {
            swal("Your previous action is successfull, \n no need to reeat this action", { icon: "warning" })
        }

    }


    s.personnelNames = function (id, e) {

        s.id = id

        s.dt = s.personnel.filter(function (d) {
            return d.empl_id == id
        })

        if (s.dt.length > 0) {
            h.post("../cSSTimeEntry/DTRdetails", { id: id, date: s.today }).then(function (d) {
                var dtr = d.data.dtr_detail

                if (dtr.length > 0) {
                    s.am_in = dtr[0].dtr_am_in
                    s.am_out = dtr[0].dtr_am_out
                    s.pm_in = dtr[0].dtr_pm_in
                    s.pm_out = dtr[0].dtr_pm_out
                }
                s.txtb_employee_name = s.dt[0].last_name + ", " + s.dt[0].first_name + " " + s.dt[0].middle_name + " " + s.dt[0].suffix_name
            })
        }
        else {
            s.id = ""
            s.am_in = ""
            s.am_out = ""
            s.pm_in = ""
            s.pm_out = ""
            s.txtb_employee_name = ""
            s.showenter = true
            s.current_id = ""
        }




    }

    function noMinInHr(hr) {
        return hr * 60
    }


    function entrytype(hr, mn) {
        if ((noMinInHr(hr) + mn) < 751) {
            return "am"
        }
        else if ((noMinInHr(hr) + mn) > 750) {
            return "pm"
        }
    }

    s.entryType_select = function (m) {

        h.post("../cSSTimeEntry/getServerTime").then(function (d) {

            var dtNow_str = d.data.dtNow_str
            var hr = d.data.hour
            var mn = d.data.min
            var sc = d.data.sec



            $(".amin").css({
                "background": "none",
                "border": "none"
            })
            $(".amout").css({
                "background": "none",
                "border": "none"

            })
            $(".pmin").css({
                "background": "none",
                "border": "none"
            })
            $(".pmout").css({
                "background": "none",
                "border": "none"

            })
            if (m == "amin") {

                if (entrytype(hr, mn) == "am") {

                    //$(".amin").css({
                    //    "background-color": "#21B9BB"
                    //})
                    $("#addTimeEntries_modal").modal('show')
                    s.entryType = "amin";
                    s.entry_title = "AM IN"

                }
                else {
                    swal("Not allowed for AM entry", { icon: "warning" })
                }

            }
            else if (m == "amout") {
                if (entrytype(hr, mn) == "am") {

                    //$(".amout").css({
                    //    "background-color": "#1A7BB9"
                    //})
                    $("#addTimeEntries_modal").modal('show')
                    s.entryType = "amout";
                    s.entry_title = "AM OUT"

                }
                else {
                    swal("Not allowed for AM entry", { icon: "warning" })
                }

            }
            else if (m == "pmin") {
                if (entrytype(hr, mn) == "pm") {

                    //$(".pmin").css({
                    //    "background-color": "#1A7BB9"
                    //})
                    $("#addTimeEntries_modal").modal('show')
                    s.entryType = "pmin";
                    s.entry_title = "PM IN"

                }
                else {
                    swal("Not allowed for PM entry", { icon: "warning" })
                }


            }
            else if (m == "pmout") {
                if (entrytype(hr, mn) == "pm") {

                    //$(".pmout").css({
                    //    "background-color": "#1A7BB9"
                    //})
                    $("#addTimeEntries_modal").modal('show')
                    s.entryType = "pmout";
                    s.entry_title = "PM OUT"

                }
                else {
                    swal("Not allowed for PM entry", { icon: "warning" })
                }

            }

        })

    }
    function mrdm(val) {
        var am = "AM"

        if (val.toString() == "AM") {

            return 1
        }
        else {

            return 2
        }

    }

    function zeroPad(num, places) {
        if (num == null) {
            return "";
        }
        else {
            var zero = places - num.toString().length + 1;
            return Array(+(zero > 0 && zero)).join("0") + num;
        }

    }




    s.Force_Logout = function (txtb, e) {

        if (e.key == "Enter") {

            h.post("../cSSTimeEntry/ForceLogout", { hours: s.hours, minutes: s.minutes, meridiem: s.meridiem, today: s.today, id: s.id }).then(function (d) {
                var dtr = d.data.dtr_dtl
                var icn = dtr[0].dtr_icon
                if (d.data.success_msg == "success") {
                    $('#undertime_modal').modal("hide")
                    swal(dtr[0].dtr_message, { icon: icn }).then(function () {
                        $("#emplid").prop("disabled", false);
                        $("#emplid").focus();
                    })


                    s.current_id = s.id

                    s.am_in = dtr[0].dtr_am_in
                    s.am_out = dtr[0].dtr_am_out
                    s.pm_in = dtr[0].dtr_pm_in
                    s.pm_out = dtr[0].dtr_pm_out
                }
                else {
                    swal(d.data.message, { icon: "error" }).then(function () {
                        $("#emplid").focus();
                    })
                }
            })

        }
    }
    s.Force_Logout_click = function (txtb, e) {

        h.post("../cSSTimeEntry/ForceLogout", { hours: s.hours, minutes: s.minutes, meridiem: s.meridiem, today: s.today, id: s.id }).then(function (d) {
            var dtr = d.data.dtr_dtl
            var icn = dtr[0].dtr_icon
            if (d.data.success_msg == "success") {
                $('#undertime_modal').modal("hide")
                swal(dtr[0].dtr_message, { icon: icn }).then(function () {
                    $("#emplid").prop("disabled", false);
                    $("#emplid").focus();
                })


                s.current_id = s.id

                s.am_in = dtr[0].dtr_am_in
                s.am_out = dtr[0].dtr_am_out
                s.pm_in = dtr[0].dtr_pm_in
                s.pm_out = dtr[0].dtr_pm_out
            }
            else {
                swal(d.data.message, { icon: "error" }).then(function () {
                    $("#emplid").focus();
                })
            }
        })

    }
    $('#undertime_modal').on('shown.bs.modal', function (e) {
        $("#yes").focus();
    })
    $('#undertime_modal').on('hidden.bs.modal', function (e) {

        $("#emplid").focus();
        $("#emplid").prop("disabled", false);
    })
})