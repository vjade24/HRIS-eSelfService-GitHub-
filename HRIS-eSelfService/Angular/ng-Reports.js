ng_selfService_App.controller("cReports_ctrlr", function ($scope, $http, $filter,$window) {
    var s = $scope
    var h = $http
    var w = $window
    function init()
    {
        var body = document.getElementById('iframe_content');
        var body = document.getElementById('main-body');
        body.style.overflow = "hidden"
        h.post("../Reports/toCrystalData").then(function (d) {
            var params = ""
            var ReportName  = d.data.ReportName
            var SaveName    = d.data.SaveName
            var ReportType  = d.data.ReportType
            var ReportPath  = d.data.ReportPath
            var Sp          = d.data.Sp
            var isUserLogin = d.data.isUserLogin
            if (isUserLogin == undefined)
            {
                location.href = "../Login/Index"
            }
            h.post("../Reports/SessionRemove")
            
            $("#modal_generating_report").modal();
            $("#ReportFrame").attr("src", "../Reports/CrystalViewer.aspx?Params=" + params
                                                                 + "&ReportName=" + ReportName
                                                                 + "&SaveName="   + SaveName
                                                                 + "&ReportType=" + ReportType
                                                                 + "&ReportPath=" + ReportPath
                                                                 + "&id=" + Sp
             );
            $('#ReportFrame').load(function () {
                //and stop the loading after load
                // $.unblockUI();
                //setTimeout(function () { $("#modal_generating_remittance").modal("hide"); },1500);
                $("#modal_generating_report").modal("hide"); 
                
            });
        })
       
    }

   

    

    init()
    
})
