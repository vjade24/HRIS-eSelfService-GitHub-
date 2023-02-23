<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="CrystalViewer.aspx.cs" Inherits="HRIS_eSelfService.Reports.CrystalViewer" %>

<%@ Register Assembly="CrystalDecisions.Web, Version=13.0.3500.0, Culture=neutral, PublicKeyToken=692fbea5521e1304" Namespace="CrystalDecisions.Web" TagPrefix="CR" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
    <script src="../crystalreportviewers13/js/crviewer/crv.js"></script>
    <script src="../Scripts/ngSweetAlert.js"></script>
    <link href="~/Content/bootstrap.min.css" rel="stylesheet" />
     <link href="~/Content/font-awesome/css/font-awesome.css" rel="stylesheet" />
     <link href="~/Content/common.css" rel="stylesheet" />
     <style type="text/css">
        .print-scroll {
            min-width:100% !important;
        }
        .nextback
        {
            margin-left: 905px;
        }
        .marg{
            margin-left:2px;
            margin-right:2px;
        }
        div#MainContainer_crvPrint__UI_mb,div#MainContainer_crvPrint__UI_bc{
                background-color: rgb(136, 136, 136);
                position: fixed;
                opacity: 0.3;
                display: none;
                z-index: 998;
                visibility: hidden;
                width: 0px !important;
                height:0px !important;
                left:0px !important;
                top: 0px !important;
        }

     

        
    </style>


    <style type="text/css" media="print">
        @page 
        {
            size: auto;   /* auto is the main current active printer page size */
            margin: 0mm;  /* this small affects the margin in the printer IMP settings */
        }

        body 
        {
            background-color:#FFFFFF; 
            border: solid 1px black ;
            margin: 0px;  /* the margin style on the data content before printing */
       }
    </style>
     <style type="text/css">
        @media print
        {
         footer {
            position:fixed !important;
            bottom:0px !important;
         }
        }

    </style>



    
</head>
<body>
   <%
       if (Session["url_name"] != null) {
            if (Session["url_name"].ToString() == "rSSDTRPrinting") {
                %>  
                <button class="btn btn-primary"  onclick="print_me()"><i class="fa fa-print" id="dtr_print"></i>PRINT</button>
               <% } 
       }
       %>  

 
    <form id="form1" runat="server">
            <asp:HiddenField ID="hf_nexpage" runat="server" />
            <asp:HiddenField ID="hf_printers" runat="server" />
        <div class="row">
            <div class="col-12">
                <div id="crvHolder" style="overflow:scroll; width:100%;">
                    <CR:CrystalReportViewer 
                            ID="crvPrint" 
                            runat="server" 
                            PageZoomFactor="100"
                            HasToggleGroupTreeButton="False" 
                            ToolPanelView="None" 
                            HasPrintButton="true" 
                            InteractiveDeviceInfos="(Collection)" 
                            WaitMessageFont-Names="Verdana"
                            ShowPrintButton="true" 
                            ToolPanelWidth  ="200px" 
                            HasGotoPageButton="True" 
                            HasSearchButton="True"
                            HasRefreshButton="True"
                            HasDrilldownTabs="False" 
                            DisplayStatusbar="False" 
                            HasPageNavigationButtons="True" 
                            EnableDatabaseLogonPrompt="False" 
                            EnableDrillDown="False" 
                            EnableParameterPrompt="False" 
                            HasCrystalLogo="False" 
                            HasDrillUpButton="False"
                            CssClass="print-scroll"
                            PrintMode="ActiveX"
                            OnLoad="crvPrint_Load"
                            HasToggleParameterPanelButton="False" 
                            HasZoomFactorList="True"
                            HasExportButton="False" GroupTreeStyle-ShowLines="False" BorderStyle="None" DisplayPage="True" />
                </div>
            </div>
        </div>
    </form>

</body>
    <script>
        (function init() {
            var windowHt = window.innerHeight;
            //console.log(windowHt)
            var cryViewer = document.getElementById("crvHolder");
            //console.log(cryViewer)
            cryViewer.style.height = windowHt - 5 + "px";

        }

        )

        function print_me() {
            
           var dvReport = document.getElementById("crvHolder");
            var frame1 = dvReport.getElementsByTagName("iframe")[0];
            if (navigator.appName.indexOf("Internet Explorer") != -1) {
                frame1.name = frame1.id;
                window.frames[frame1.id].focus();
                window.frames[frame1.id].print();
                window.frames[frame1.id].close()
            }
            else {
                var frameDoc = frame1.contentWindow ? frame1.contentWindow : frame1.contentDocument.document ? frame1.contentDocument.document : frame1.contentDocument;
                frameDoc.print();
                frameDoc.close();
            }

            
        }
            


        function OpenNoDataFound()
        {
            alert("NO DATA");
            //swal("Successfully " + useraction + "!", "Existing record successfully " + "asd" +" "+ "asd" + "!" , "success")
        }
    </script>
</html>

