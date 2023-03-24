var ng_selfService_App = angular.module('ng_selfService_App', ['ngFileUpload'])

ng_selfService_App.filter("filterdate", function () {
        var re = /\/Date\(([0-9]*)\)\//;
        return function (x) {
            var m = x.match(re);
            if (m) return new Date(parseInt(m[1]));
            else return null;
        };
    });


ng_selfService_App.run(function () {

    String.prototype.get_page = function (table) {
        var nakit_an = false;
        var rowx = 0;
        $('#' + table + ' tr').each(function () {
            $.each(this.cells, function (cells) {
                if (cells == 0) {
                    if ($(this).text() == this) {
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
    //***populate the specified the specified dataTable
    // the parameter table is the scope name of the dataTable and the 
    // id parameter is an optonal parameter it specifies the primary key of the table rows, 
    // if id is set to empty string "" the dataTable values refreshes but will not select the id keys
    // if id is not empty string "" it will look for the specified id and select pagination where the id is found.
    //**********************************//

    Array.prototype.refreshTable = function (table, id) {

        if (this.length == 0) {
            $("#" + table).dataTable().fnClearTable();
        }
        else {
            $("#" + table).dataTable().fnClearTable();
            $("#" + table).dataTable().fnAddData(this);
        }

        if (id != "") {
            for (var x = 1; x <= $("#" + table).DataTable().page.info().pages; x++) {
                if (id.get_page(table) == false) {
                    $("#" + table).dataTable().fnPageChange(x);
                }
                else {
                    break;
                }
            }
        }
        return this;
    }

    clearTable = function (table) {
        $("#" + table).dataTable().fnClearTable();
    }

    //************************************// 
    //***populate the specified form fields
    // the parameter id is the mg-model of the form and the 
    // row parameter is the index of row in the data which this function holds.   
    //**********************************//
    Array.prototype.populateFields = function (obj, row) {

        var data = obj
        var thisData = this[row]
        var i_key = Object.keys(obj)
        var f_key = Object.keys(thisData)
        var f_val = Object.keys(thisData).map(function (itm) { return thisData[itm]; });
        for (var x = 0; x < i_key.length; x++) {

            for (var y = 0; y < f_key.length; y++) {
                if ($("#" + i_key[x])[0] != undefined) {
                    if ($("#" + i_key[x])[0].hasAttribute("noinclude") == false) {
                        if (i_key[x] == f_key[y]) {
                            if ($("#" + i_key[x])[0].name == "boolVal") {
                                if (f_val[y]) {
                                    $("#" + i_key[x]).val("1");
                                    data[i_key[x]] = "1"
                                }
                                else {
                                    $("#" + i_key[x]).val("0");
                                    data[i_key[x]] = "0"
                                }

                            }
                            else {
                                $("#" + i_key[x]).val(f_val[y]);
                                data[i_key[x]] = f_val[y]
                            }

                        }
                    }
                }


            }
        }
        return data;
    }

    Array.prototype.delete = function (code) {
        return this.filter(function (d, k) {
            return k != code
        })
    }

    Array.prototype.insertWithSort = function (prop, insert) {
        var data = []
        data = this;
        data.push(insert)
        data.reduce(function (a, b) {
            return a[prop] > b[prop] ? b : a;
        })

        return data
    }
})
ng_selfService_App.service("commonScript", ["$compile", "$filter", function (c, f) {
    var email_rgx = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    var g = "getElementById";
    var gCl = "getElementsByClassName"
    var cE = "createElement"
    var pN = "parentNode";
    var c = "color";
    var iB = "insertBefore";
    var nS = "nextSibling";
    var iH = "innerHTML";
    var st = "style";
    var csT = "cssText ";
    var rC = "removeChild";
    var csF = "cssFloat";
    var iV = "isValid";
    var f8 = "YYYY-MM-DD";
    var r2 = "required2";
    var nR2 = "notrequired2";
    var eE = "elEmpty";


    var tu = true;
    var fe = false;
    var cs = this;

    return {
        search_in_list: function (value, table) {
            try {
                $("#" + table).DataTable().search(value).draw();
            }
            catch (err) {
                swal(err.message, { icon: "error" })
            }
        },
        setNumOfRow: function (value, table) {
            try {
                $("#" + table).DataTable().page.len(value).draw();
            }
            catch (err) {
                swal(err.message, { icon: "error" })
            }
        },

        D_id: function (id) {
            return document[g](id)
        },
        D_cl: function (cl) {
            return document[gCl](cl)
        },
        D_cE: function (id) {
            return document[cE](id)
        },
        insertAfter: function (rN, nN) {
            rN[pN][iB](nN, rN[nS]);
        },


        //************************************//
        // Add the red border of the element and show the required warning text
        // id parameter is the id of the field and class of the small tag that hold the Required Field Text.  
        //************************************//
        required: function (n) {

            $("." + n).text("Required Field")
            $("#" + n).css({
                "border-color": "red",
                "border-width": "1px",
                "border-style": "solid"
            })
            $("." + n).removeClass("hidden")

        },

        required2: function (n, wn) {
            $("#" + n).css({
                "border-color": "red",
                "border-width": "1px",
                "border-style": "solid"
            })
            var element = this.D_cl(n)[0];
            var div = this.D_id(n);
            var el = this.D_cE("span")
            el.className += n;
            el[iH] = wn;
            el[st][c] = "red";
            el[st][csF] = "right";

            if (this.elEmpty(element)) {
                this.insertAfter(div, el);
            }
            else {
                element[pN][rC](element);
                this.insertAfter(div, el);
            }
            console.log("required")

        },

        //************************************//
        // Remove the red border of the element and hide the required warning text
        // id parameter is the id of the field and class of the small tag that hold the Required Field Text.  
        //************************************//
        notrequired: function (n) {

            $("#" + n).css({
                "border-color": "#E5E6E7",
                "border-width": "1px",
                "border-style": "solid"
            })
            $("." + n).addClass("hidden")

        },

        notrequired2: function (n) {
            $("#" + n).css({
                "border-color": "#E5E6E7",
                "border-width": "1px",
                "border-style": "solid"
            })
            var el = this.D_cl(n)[0];
            if (!this.elEmpty(el)) {
                el[pN][rC](el);
            }





        },

        //************************************//
        // Validate Field of the form if Empty then border set to red and required warning will show below
        // id parameter is the ng-model of the form   
        //************************************//
        ValidateFields: function (obj) {

            var retval = 0;
            var i_key = Object.keys(obj)

            for (var x = 0; x < i_key.length; x++) {
                var i_val = $("#" + i_key[x]).val()
                if ($("#" + i_key[x])[0] != undefined) {
                    if ($("#" + i_key[x])[0].hasAttribute("required")) {
                        if (this.elEmpty(i_val)) {
                            this.required(i_key[x])
                            retval = retval + 1
                        }
                        else {
                            if ($("#" + i_key[x])[0].hasAttribute("date")) {

                                if (moment(i_val, 'YYYY-MM-DD', true).isValid() == true) {

                                    $("." + i_key[x]).text("")
                                    $("#" + i_key[x]).css({
                                        "border-color": "#E5E6E7",
                                        "border-width": "1px",
                                        "border-style": "solid"
                                    })
                                    $("." + i_key[x]).addClass("hidden")
                                }
                                else {

                                    $("." + i_key[x]).text("Invalid Date")
                                    $("#" + i_key[x]).css({
                                        "border-color": "red",
                                        "border-width": "1px",
                                        "border-style": "solid"
                                    })

                                    $("." + i_key[x]).removeClass("hidden")

                                    retval = retval + 1
                                }
                            }
                            else if ($("#" + i_key[x])[0].hasAttribute("email")) {

                            }
                            else {
                                this.notrequired(i_key[x]);
                            }
                        }



                    }
                }

            }
            return retval == 0 ? true : false;
        },


        ValidateForTimeInterval: function (obj) {

            var retval = 0;
            var i_key = Object.keys(obj)


            for (var x = 0; x < i_key.length; x++) {

                var i_val = $("#" + i_key[x]).val()
                if ($("#" + i_key[x])[0] != undefined) {
                    if ($("#" + i_key[x])[0].hasAttribute("ti")) {
                        if (this.elEmpty(i_val)) {
                            this.required(i_key[x])
                            retval = retval + 1
                        }
                        else {
                            this.notrequired(i_key[x]);
                        }
                    }
                }

            }
            return retval == 0 ? true : false;
        },

        //************************************//
        // Validate Field of the form if Empty then border set to red and required warning will show below
        // id parameter is the ng-model of the form   
        //************************************//
        checkedAtleast1: function (obj) {
            var retval = 0;
            var i_key = Object.keys(obj)
            for (var x = 0; x < i_key.length; x++) {

                if ($("#" + i_key[x])[0].type == "checkbox") {
                    if ($("#" + i_key[x]).prop("checked") == true) {
                        retval = retval + 1
                    }
                }
            }
            return retval > 0 ? true : false;
        },
        //************************************//
        //***     remove required warning of the specified form fields  
        //        id parameter is the ng-model of the form****//
        //************************************//
        removeFormReq: function (obj) {
            var i_key = Object.keys(obj)
            for (var x = 0; x < i_key.length; x++) {
                this.notrequired(i_key[x]);

            }
        },

        //************************************//
        //***get the select element value with boolVal name and set it to boolean value  
        // set to true if selected value is 1 and false if 0
        //************************************//
        SetToBoolean: function (obj) {
            var data = {};
            var i_key = Object.keys(obj)
            var i_val = Object.values(obj)

            for (var x = 0; x < i_key.length; x++) {

                if ($("#" + i_key[x])[0] != undefined) {
                    if ($("#" + i_key[x])[0].name == "boolVal") {
                        if (i_val[x] == "1") {
                            data[i_key[x]] = true;
                        }
                        else {
                            data[i_key[x]] = false;
                        }
                    }
                    else {
                        data[i_key[x]] = i_val[x]
                    }
                }

            }
            return data;
        },

        //************************************// 
        //*** Clear the fields of a form the id parameter is the name of the form            
        //**********************************// 
        clearFields: function (obj) {
            var data = obj
            var i_key = Object.keys(obj)
            for (var x = 0; x < i_key.length; x++) {
                if ($("#" + i_key[x])[0] != undefined) {
                    if ($("#" + i_key[x])[0].hasAttribute("noclear") == false) {
                        $("#" + i_key[x]).val("");
                        data[i_key[x]] = "";
                    }
                }


            }
            return data;
        },
        //************************************// 
        //*** Clear the fields of a form the id parameter is the name of the form            
        //**********************************// 
        clearFields2: function (frm) {
            var data = {}
            var hA = "hasAttribute";
            var l = "length"
            var i = "id";
            var t = "type"
            var form = $("#" + frm)[0]
            var fl = form[l]
            for (var x = 0; x < fl; x++) {
                var tp = form[x][t]

                if (!this.elEmpty(form[x][i])) {
                    var date = $("#" + form[x][i])[0][hA]("mydate")
                    if (tp == "text" || tp == "email" || tp == "select-one" || date) {

                        if (!$("#" + form[x][i])[0][hA]("noclear")) {
                            console.log(form[x][i])
                            $("#" + form[x][i]).val("");
                            data[form[x][i]] = "";
                        }
                    }

                }
            }
            return data;
        },

        //************************************//
        //***    check if data is empty     ****//
        //************************************//
        elEmpty: function (data) {
            if (data == null || data == "" || data == undefined) {
                return true
            }
            else {
                return false
            }

        },

        //************************************// 
        //*** return boolean if empty paramater type is id or class,
        // data is the id of the element      
        //**********************************// 
        elEmpty2: function (type, name) {
            var val = $(type + name).val();
            if (val.trim() == null || val.trim() == "" || val.trim() == undefined) {
                return true
            }
            else {
                return false
            }
        },

        //************************************//
        //***get the select element value with boolVal name and set it to boolean value  
        // set to true if selected value is 1 and false if 0
        //************************************//
        DisabledAllFields: function (obj) {
            var i_key = Object.keys(obj)
            for (var x = 0; x < i_key.length; x++) {
                $("#" + i_key[x]).prop("disabled", true);
            }
        },

        //************************************//
        //***get the select element value with boolVal name and set it to boolean value  
        // set to true if selected value is 1 and false if 0
        //************************************//
        DisabledElement: function (id) {
            $("#" + id).prop("disabled", true);
        },
        //************************************//
        //***get the select element value with boolVal name and set it to boolean value  
        // set to true if selected value is 1 and false if 0
        //************************************//
        EnabledElement: function (id) {
            $("#" + id).prop("disabled", false);
        },
        //************************************//
        // Validate Field of the form if Empty then border set to red and required warning will show below
        // id parameter is the ng-model of the form   
        //************************************//
        uncheckAllCheckbox: function (obj) {
            var i_key = Object.keys(obj)
            for (var x = 0; x < i_key.length; x++) {
                if ($("#" + i_key[x])[0].type == "checkbox") {
                    $("#" + i_key[x]).prop("checked", false);
                }
            }
        },

        //************************************//
        //***get the select element value with boolVal name and set it to boolean value  
        // set to true if selected value is 1 and false if 0
        //************************************//
        EnabledAllFields: function (obj) {
            var i_key = Object.keys(obj)
            for (var x = 0; x < i_key.length; x++) {
                if ($("#" + i_key[x])[0] != undefined) {
                    if (!$("#" + i_key[x])[0].hasAttribute("alwaysdisabled")) {
                        $("#" + i_key[x]).prop("disabled", false);
                    }
                }

            }
        },

        EditEnabledFields: function (obj) {
            var i_key = Object.keys(obj)
            for (var x = 0; x < i_key.length; x++) {
                if ($("#" + i_key[x])[0] != undefined) {
                    if (!$("#" + i_key[x])[0].hasAttribute("editdisabled")) {
                        $("#" + i_key[x]).prop("disabled", false);
                    }
                    else {
                        $("#" + i_key[x]).prop("disabled", true);
                    }
                }

            }
        },
        boolYN: function (n) {
            if (n == 1) return "Yes"
            else if (n == 0) return "No"
            else return "Undefined"

        },
        boolTF: function (n) {
            if (n == 1) return "True"
            else if (n == 0) return "False"
            else return "Undefined"

        },

        spinnerRemove: function (id, cl) {
            $("." + id).removeClass("fa-spinner fa-spin");
            $("." + id).addClass(cl);
            $("#" + id).prop("disabled", false);
        },

        spinnerAdd: function (id, cl) {
            $("." + id).removeClass(cl);
            $("." + id).addClass("fa-spinner fa-spin");
            $("#" + id).prop("disabled", true);
        },

        loading: function (action) {
            $("#common_loading_modal").modal(action)
        },
        loading2: function (id,action) {
            $("#" + id).modal(action)
        },
        semester: function (sem) {
            if (sem == "1") {
                return "1st Semester"
            }
            else if (sem == "2") {
                return "2nd Semester"
            }
            else {
                return "Not defined"
            }
        },

        //**********************************************
        //******** validate date correct format ********
        //**********************************************
        valid_date: function (eval, id) {
            var retval = 0;
            if (moment(eval, f8, tu)[iV]()) {
                this[nR2](id) //call notrequired2 function
            }
            else {
                this[r2](id, "Invalid date") //call required2 function
                retval = retval + 1
            }
            return retval == 0 ? true : false;
        },

        //**********************************************
        //******** validate email correct format *******
        //**********************************************
        valid_email: function (eval, id) {
            var retval = 0;
            if (email_rgx.test(eval)) {
                this[nR2](id) //call notrequired2 function
            }
            else {
                this[r2](id, "Invalid email address") //call required2 function
                retval = retval + 1
            }
            return retval == 0 ? true : false;
        },


        //********************Created by Marvin Olita-2020-07-26********************************************

        //**************************************************************************************************


        FormStringify: function (idf) {
            var hA = "hasAttribute";
            var i = "id";
            var l = "length";
            var f = "form";
            var t = "type";
            var v = "value";
            var retval = 0;
            var data = {}
            var form = $(this.D_id(idf))[0][f] // form element

            var l = form[l] //lenght of the form- number of child element

            for (var x = 0; x < l; x++) {
                var tp = form[x][t] //element type
                var id = form[x][i] // element id
                if (!this.elEmpty(id)) {
                    data[id] = this.D_id(id)[v]
                }
            }
            return data;
        },
        validatePass: function (data) {
            var regex_number = /\d+/g;
            var regex_upper = /[A-Z]/;
            var regex_lower = /[a-z]/;
            var regex_spchar = /[^a-zA-Z0-9\s]/;
            var valid_pass = true;
            if ((regex_number.test(data.trim()) == false
                || regex_upper.test(data.trim()) == false
                || regex_lower.test(data.trim()) == false
                || regex_spchar.test(data.trim()) == false)) {
                $("#lbl_txtb_current_pass_req").text("New Password require's combination of uppercase, lowercase, and number including atleast 1 special character.");
                valid_pass = false;
            }
            else {

                $("#lbl_txtb_current_pass_req").text("");
                valid_pass = true;
            }
            return valid_pass;
        },

        //********************Created by Marvin Olita-2020-07-26********************************************
        //******** 1. use this function to validate the form fields the has required attribute      ********
        //******** 2. parameter is the id of the button to be click                                 ********
        //******** 3. in order this to work you must enclose all the field inside the form          ********
        //******** 4. a form must have an id and novalidate attribute on the oppening tag           ********
        //******** 5. you must put norequired class in every required field                         ********
        //******** 6. dont forget to put type attribute to every required field                     ********
        //******** 7. if you want date to be validated you should add mydate and required attribute ********
        //******** 8. functions: valid_date,valid_email,notrequired2,required2,elEmpty              ********
        //******** 9. directives: norequired                                                        ********
        //**************************************************************************************************
        validatesubmit: function (idf) {
            var hA = "hasAttribute";
            var i = "id";
            var l = "length";
            var f = "form";
            var t = "type";
            var v = "value";
            var retval = 0;
            var password = ""
            var form = $(this.D_id(idf))[0][f] // form element
            var l = form[l] //lenght of the form- number of child element
            for (var x = 0; x < l; x++) {
                var tp = form[x][t] //element type
                var id = form[x][i] // element id
                console.log(tp)
                if ($("#" + id)[0] != undefined) {
                    var rq = $("#" + form[x][i])[0][hA]("required") //return true if element has required attribute
                    var confirmpassword = $("#" + form[x][i])[0][hA]("confirmpassword") //return true if element has required attribute
                    var date = $("#" + form[x][i])[0][hA]("mydate") //return true if element has mydate attribute

                    if (rq) {
                        var eval = this.D_id(id)[v]
                        if (tp == "text" && !date) // if field type is text
                        {
                            if (this[eE](eval)) {
                                this[r2](id, "Required field")
                                retval = retval + 1
                            }
                            else {
                                this[nR2](id)
                            }
                        }
                        else if (tp == "password") // if field type is email
                        {
                            if (confirmpassword) {
                                if (this[eE](eval)) {
                                    this[r2](id, "Required field")
                                    retval = retval + 1
                                }
                                else {
                                    if (password == eval) //call valid_email function ; expected value: false
                                    {
                                        this[nR2](id)
                                    }
                                    else {
                                        this[r2](id, "Your password do not match!")
                                        retval = retval + 1
                                    }
                                }
                            }
                            else {
                                if (this[eE](eval)) {
                                    this[r2](id, "Required field")
                                    retval = retval + 1
                                }
                                else {
                                    password = eval
                                    if (this.validatePass(eval)) //call valid_email function ; expected value: false
                                    {
                                        this[nR2](id)
                                    }
                                    else {
                                        this[r2](id, " New Password require's combination of uppercase, lowercase, and number including atleast 1 special character.")
                                        retval = retval + 1
                                    }
                                }
                            }

                        }
                        else if (tp == "email") // if field type is email
                        {
                            if (this[eE](eval)) {
                                this[r2](id, "Required field")
                                retval = retval + 1
                            }
                            else {
                                if (!this.valid_email(eval, id)) //call valid_email function ; expected value: false
                                {
                                    retval = retval + 1
                                }
                            }
                        }
                        else if (tp == "select-one") {
                            if (this[eE](eval)) {
                                this[r2](id, "Required field")
                                retval = retval + 1
                            }
                            else {
                                this[nR2](id)
                            }
                        }
                        else if (date) // if field type is date; note in order this to work you should put mydate attribute to the date input field
                        {
                            if (this[eE](eval)) {
                                this[r2](id, "Required field")
                                retval = retval + 1
                            }
                            else {
                                if (!this.valid_date(eval, id)) //call valid_date function ; expected value: false
                                {
                                    retval = retval + 1
                                }
                            }
                        }
                        else if (tp == "textarea") // if field type is date; note in order this to work you should put mydate attribute to the date input field
                        {
                            if (this[eE](eval)) {
                                this[r2](id, "Required field")
                                retval = retval + 1
                            }
                            else {
                                this[nR2](id)
                            }
                        }
                    }
                }
            }
            return retval == 0 ? true : false;
        },

        validatesubmit2: function (idf) {
            var hA = "hasAttribute";
            var i = "id";
            var l = "length";
            var f = "form";
            var t = "type";
            var v = "value";
            var retval = 0;
            var password = ""

            var form = this.D_id(idf) // form element

            var l = form[l] //lenght of the form- number of child element
            for (var x = 0; x < l; x++) {
                var tp = form[x][t] //element type
                var id = form[x][i] // element id

                if ($("#" + id)[0] != undefined) {

                    var rq = $("#" + form[x][i])[0][hA]("required") //return true if element has required attribute
                    var confirmpassword = $("#" + form[x][i])[0][hA]("confirmpassword") //return true if element has required attribute
                    var date = $("#" + form[x][i])[0][hA]("mydate") //return true if element has mydate attribute

                    if (rq) {
                        var eval = this.D_id(id)[v]
                        if (tp == "text" && !date) // if field type is text
                        {
                            if (this[eE](eval)) {
                                this[r2](id, "Required field")
                                retval = retval + 1
                            }
                            else {
                                this[nR2](id)
                            }
                        }
                        else if (tp == "password") // if field type is email
                        {
                            if (confirmpassword) {
                                if (this[eE](eval)) {
                                    this[r2](id, "Required field")
                                    retval = retval + 1
                                }
                                else {
                                    if (password == eval) //call valid_email function ; expected value: false
                                    {
                                        this[nR2](id)
                                    }
                                    else {
                                        this[r2](id, "Your password do not match!")
                                        retval = retval + 1
                                    }
                                }
                            }
                            else {
                                if (this[eE](eval)) {
                                    this[r2](id, "Required field")
                                    retval = retval + 1
                                }
                                else {
                                    password = eval
                                    if (this.validatePass(eval)) //call valid_email function ; expected value: false
                                    {
                                        this[nR2](id)
                                    }
                                    else {
                                        this[r2](id, " New Password require's combination of uppercase, lowercase, and number including atleast 1 special character.")
                                        retval = retval + 1
                                    }
                                }
                            }

                        }
                        else if (tp == "email") // if field type is email
                        {
                            if (this[eE](eval)) {
                                this[r2](id, "Required field")
                                retval = retval + 1
                            }
                            else {
                                if (!this.valid_email(eval, id)) //call valid_email function ; expected value: false
                                {
                                    retval = retval + 1
                                }
                            }
                        }
                        else if (tp == "select-one") {
                            if (this[eE](eval)) {
                                this[r2](id, "Required field")
                                retval = retval + 1
                            }
                            else {
                                this[nR2](id)
                            }
                        }
                        else if (date) // if field type is date; note in order this to work you should put mydate attribute to the date input field
                        {
                            if (this[eE](eval)) {
                                this[r2](id, "Required field")
                                retval = retval + 1
                            }
                            else {
                                if (!this.valid_date(eval, id)) //call valid_date function ; expected value: false
                                {
                                    retval = retval + 1
                                }
                            }
                        }
                        else if (tp == "textarea") // if field type is date; note in order this to work you should put mydate attribute to the date input field
                        {
                            if (this[eE](eval)) {
                                this[r2](id, "Required field")
                                retval = retval + 1
                            }
                            else {
                                this[nR2](id)
                            }
                        }
                    }
                }
            }
            return retval == 0 ? true : false;
        },
        Validate1Field: function (id) {
            var val = $("#" + id).val();
            if (this.elEmpty(val)) {
                this.required2(id, "Required Field")
                return false;
            }
            else {
                this.notrequired2(id);
                return true
            }
        },
        validate_textfield: function (id) {
            var hA = "hasAttribute";
            var i = "id";
            var l = "length";
            var f = "form";
            var t = "type";
            var v = "value";
            var retval = 0;
            var tp = $("#" + id)[0][t]
            var rq = $("#" + id)[0][hA]("required")
            var eval = this.D_id(id)[v]
            console.log(eval)
            if (rq) {
                if (tp == "text" && !date) // if field type is text
                {
                    if (this[eE](eval)) {
                        this[r2](id, "Required field")
                        retval = retval + 1
                    }
                    else {
                        this[nR2](id)
                    }
                }
                else if (tp == "password") // if field type is email
                {
                    if (confirmpassword) {
                        if (this[eE](eval)) {
                            this[r2](id, "Required field")
                            retval = retval + 1
                        }
                        else {
                            if (password == eval) //call valid_email function ; expected value: false
                            {
                                this[nR2](id)
                            }
                            else {
                                this[r2](id, "Your password do not match!")
                                retval = retval + 1
                            }
                        }
                    }
                    else {
                        if (this[eE](eval)) {
                            this[r2](id, "Required field")
                            retval = retval + 1
                        }
                        else {
                            password = eval
                            if (this.validatePass(eval)) //call valid_email function ; expected value: false
                            {
                                this[nR2](id)
                            }
                            else {
                                this[r2](id, " New Password require's combination of uppercase, lowercase, and number including atleast 1 special character.")
                                retval = retval + 1
                            }
                        }
                    }

                }
                else if (tp == "email") // if field type is email
                {
                    if (this[eE](eval)) {
                        this[r2](id, "Required field")
                        retval = retval + 1
                    }
                    else {
                        if (!this.valid_email(eval, id)) //call valid_email function ; expected value: false
                        {
                            retval = retval + 1
                        }
                    }
                }
                else if (tp == "select-one") {
                    if (this[eE](eval)) {
                        this[r2](id, "Required field")
                        retval = retval + 1
                    }
                    else {
                        this[nR2](id)
                    }
                }
                else if (date) // if field type is date; note in order this to work you should put mydate attribute to the date input field
                {
                    if (this[eE](eval)) {
                        this[r2](id, "Required field")
                        retval = retval + 1
                    }
                    else {
                        if (!this.valid_date(eval, id)) //call valid_date function ; expected value: false
                        {
                            retval = retval + 1
                        }
                    }
                }
                else if (tp == "textarea") // if field type is date; note in order this to work you should put mydate attribute to the date input field
                {
                    if (this[eE](eval)) {
                        this[r2](id, "Required field")
                        retval = retval + 1
                    }
                    else {
                        this[nR2](id)
                    }
                }
            }
            return retval == 0 ? true : false;
        },
        finalApprover: function (dep) {
            if (dep == "18" || dep == "19") {
                return "7610"
            }
            else {
                return "10063"
            }
                
        },
    }

}])

ng_selfService_App.directive('limitMaxMinVal', ["commonScript", function (cs) {

    //************************************// 
    //*** this directive show alert if the value of a input type= number exceed is max or min values on blur
    //************************************// 
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            elem.on('blur', function () {
                var id = attrs.id;
                var max = parseInt(attrs.max);
                var min = parseInt(attrs.min);
                var val = parseInt(elem.val())


                if (val > max) {
                    swal("Value must not be higher than " + max, { icon: "warning" })
                    elem.val("");
                    $("#" + id).focus();
                }
                else if (val < min) {
                    swal("Value must not be lower than " + min, { icon: "warning" })

                    elem.val("");
                    $("#" + id).focus();
                }

            })

        }
    }
}])

ng_selfService_App.directive('mustMinVal', ["commonScript", function (cs) {

    //************************************// 
    //*** this directive show alert if the value of a input type= number exceed is max or min values on blur
    //************************************// 
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            elem.on('blur', function () {
                var form = elem[0].form.id;
                var id = attrs.id;
                var val = parseInt(elem.val())
                var maxval = $('#' + form + ' input[name="maxVal"]').val();

                if (!cs.elEmpty(maxval)) {

                    if (val > parseInt(maxval)) {

                        swal("Value must not be higher than Grade Range To", { icon: "warning" })
                        elem.val("");
                        $("#" + id).focus();
                    }

                }

            })

        }
    }
}])
ng_selfService_App.directive('mustMaxVal', ["commonScript", function (cs) {
    //************************************// 
    //*** this directive show alert if the value of a input type= number exceed is max or min values on blur
    //************************************// 
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            elem.on('blur', function () {
                var form = elem[0].form.id;
                var id = attrs.id;
                var val = parseInt(elem.val())
                var minval = $('#' + form + ' input[name="minVal"]').val();
                if (!cs.elEmpty(minval)) {
                    if (val < parseInt(minval)) {
                        swal("Value must not be lower than  Grade Range From", { icon: "warning" })
                        elem.val("");
                        $("#" + id).focus();
                    }
                }
            })
        }
    }
}])
ng_selfService_App.directive('checkdata', ["commonScript", function (cs) {
    //************************************// 
    //*** this directive show alert if the value of a input type= number exceed is max or min values on blur
    //************************************// 
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            elem.on('blur', function () {
                var form = elem[0].form.id;
                var grid = elem[0].form.name;
                var id = attrs.id;
                var alrt = attrs.alert;
                var val = parseInt(elem.val())
                var data = scope[grid[grid.length - 1]];
                var scp = scope[form]
                var dt = data.filter(function (d) {
                    return d[id] == val
                })
                if (dt.length > 0) {
                    alert(alrt)
                    elem.val("");
                    scp[id] = ""
                    $("#" + id).focus();
                }
            })

        }
    }
}])
ng_selfService_App.directive('removeReq', ["commonScript", function (cs) {
    //************************************// 
    //*** this directive remove the required warning of the specified input field on keyup
    //************************************// 
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            elem.on('keyup', function () {
                if (!cs.elEmpty2("#", attrs.id)) {
                    cs.notrequired(attrs.id)
                }
            })
        }
    }
}])

ng_selfService_App.directive('removeReqDate', ["commonScript", function (cs) {
    //************************************// 
    //*** this directive remove the required warning of the specified input field on keyup
    //************************************// 
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            elem.on('blur', function () {

                if (!cs.elEmpty(elem.val())) {

                    cs.notrequired(attrs.id)

                }

            })
        }
    }
}])
ng_selfService_App.directive('validateDate', ["commonScript", function (cs) {
    //************************************// 
    //*** this directive remove the required warning of the specified input field on keyup
    //************************************// 
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            elem.on('blur', function () {

                if (!cs.elEmpty(elem.val())) {
                    if (moment(elem.val(), 'YYYY-MM-DD', true).isValid() == true) {

                        $("." + attrs.id).text("")
                        $("#" + attrs.id).css({
                            "border-color": "#E5E6E7",
                            "border-width": "1px",
                            "border-style": "solid"
                        })
                        $("." + attrs.id).addClass("hidden")
                    }
                    else {
                        $("." + attrs.id).text("Invalid Date")
                        $("#" + attrs.id).css({
                            "border-color": "red",
                            "border-width": "1px",
                            "border-style": "solid"
                        })
                        $("." + attrs.id).removeClass("hidden")

                    }
                }

            })
        }
    }
}])
ng_selfService_App.directive('removeReqOption', ["commonScript", function (cs) {
    //************************************// 
    //*** this directive remove the required warning of the specified select option  on change
    //************************************// 
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            elem.on('change', function () {
                if (!cs.elEmpty(elem.val())) {
                    cs.notrequired(attrs.id)
                }
            })

        }
    }
}])

ng_selfService_App.directive('checkString', ["commonScript", function (cs) {

    //************************************// 
    //*** this directive show alert if the value of a input type= number exceed is max or min values on blur
    //************************************// 
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            elem.on('blur', function () {
                var edit = scope.isEdit;
                var form = elem[0].form.id;
                var grid = elem[0].form.name;
                var id = attrs.id;
                var alrt = attrs.alert;
                var val = elem.val()
                var data = scope[grid[grid.length - 1]];
                var scp = scope[form]
                console.log(grid)
                var dt = data.filter(function (d) {
                    return d[id] == val
                })

                if (!edit) {
                    if (dt.length > 0) {
                        swal("Data already exist", { icon: "error" })
                        elem.val("");
                        scp[id] = ""
                        $("#" + id).focus();
                    }
                }

            })

        }
    }
}])


ng_selfService_App.directive("headerSearch", ["commonScript", function (cs) {
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            elem.on('keyup', function () {
                cs.search_in_list(elem.val(), attrs.tableref)
            })
        }
    }
}])


ng_selfService_App.directive("setTableRow", ["commonScript", function (cs) {
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            elem.on('change', function () {
                cs.setNumOfRow(elem.val(), attrs.tableref)
            })

        }
    }
}])





ng_selfService_App.filter("filterdate", function () {
    var rx = /\/Date\(([0-9]*)\)\//;
    return function (x) {
        var m = x.match(rx);
        if (m) return new Date(parseInt(m[1]));
        else return null;
    };
})


ng_selfService_App.filter("bool-option", function () {
    return function (d) {
        if (d == true) {
            return "1";
        } else if (d == false) {
            return "0";
        } else {
            return "";
        }
    }
})

ng_selfService_App.filter('jsonDate', ['$filter', function ($filter) {
    return function (input, format) {
        return (input) ? $filter('date')(parseInt(input.substr(6)), format) : '';
    };
}])

ng_selfService_App.directive('timeMinVal', ["commonScript", function (cs) {

    //************************************// 
    //*** this directive show alert if the value of a input type= number exceed is max or min values on blur
    //************************************// 
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            elem.on('change', function () {
                var form = elem[0].form.id;
                var id = attrs.id;
                var val = new Date("01/01/1900 " + elem.val()).getTime();
                var maxval = new Date("01/01/1900 " + $('#' + form + ' select[name="maxVal"]').val()).getTime();
                var s = scope[form]

                if (!cs.elEmpty($('#' + form + ' select[name="maxVal"]').val())) {

                    if (val >= maxval) {
                        swal("You have selected " + val + ". Time start must be lower than time end", { icon: "warning" })
                        elem.val("");
                        s[id] = "";
                        $("#" + id).focus();
                    }

                }

            })

        }
    }

}])


ng_selfService_App.directive('timeMaxVal', ["commonScript", function (cs) {

    //************************************// 
    //*** this directive show alert if the value of a input type= number exceed is max or min values on blur
    //************************************// 
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            elem.on('change', function () {
                var form = elem[0].form.id;
                var id = attrs.id;
                var val = new Date("01/01/1900 " + elem.val()).getTime();
                var minval = new Date("01/01/1900 " + $('#' + form + ' select[name="minVal"]').val()).getTime();
                var s = scope[form]

                if (!cs.elEmpty($('#' + form + ' select[name="minVal"]').val())) {
                    if (val <= minval) {
                        swal("You have selected " + val + ". Time end must be higher than time start", { icon: "warning" })
                        elem.val("");
                        s[id] = "";
                        $("#" + id).focus();
                    }
                }
            })

        }
    }
}])
ng_selfService_App.directive('norequired', ["commonScript", function (cs) {
    var t = "type"
    var hA = "hasAttribute"
    //************************************// 
    //*** this directive remove the required warning if fields is not empty
    //************************************// 
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            elem.on('focus', function () {
                var tp = elem[0][t]
                var id = elem[0].id
                if (tp == "text" || tp == "email" || tp == "textarea") {
                    elem.on('keyup', function () {
                        var eval = elem[0].value
                        if (!cs.elEmpty(eval)) {
                            cs.notrequired2(id)
                        }
                    })
                }
                else if (tp == "select-one") {
                    elem.on('change', function () {
                        var eval = elem[0].value
                        if (!cs.elEmpty(eval)) {
                            cs.notrequired2(id)
                        }
                    })
                }

            })

        }
    }
}])

ng_selfService_App.directive('openModal', ["commonScript", function (cs) {
    var t = "type"
    var hA = "hasAttribute"
    //************************************// 
    //*** this directive remove the required warning if fields is not empty
    //************************************// 
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            elem.on('click', function () {
                console.log("modal")
                var modal = attrs.target
                if (($("#" + modal).data('bs.modal') || {})._isShown) {
                    $("#" + modal).modal("hide")
                }
                else {
                    $("#" + modal).modal("show")
                }


            })

        }
    }
}])


