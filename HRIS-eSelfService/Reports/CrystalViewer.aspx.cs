using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using HRIS_Common;
//using HRIS_eHRD.App_Start;
using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing.Printing;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace HRIS_eSelfService.Reports
{
    public partial class CrystalViewer : System.Web.UI.Page
    {

        ReportDocument cryRpt = new ReportDocument();
        CommonDB MyCmn = new CommonDB();
        static string printfile = "";
        //static string lastpage = "";
        //static bool firstload = true;
        string paramList = "";
        //report file(.rpt) name
        string reportName = "";
        //save as to excel,pdf or word's file name
        string saveName = "";
        //report type for pdf, excel, word or inline preview
        string reportType = "";
        //report file path, base on ~/Reports folder
        string reportPath = "";

        //set the report file path
        string reportFile = "";
        //for save report file name
        string saveFileName = "";
        string empl_pds = "";
        protected void Page_Init(object sender, EventArgs e)
        {
            string ls_val;
            paramList   = Request["Params"].Trim();
            reportName  = Request["ReportName"].Trim();
            saveName    = Request["SaveName"].Trim();
            reportType  = Request["ReportType"].Trim();
            reportPath  = Request["ReportPath"].Trim().Replace('-', '/');


            reportFile  = Server.MapPath(string.Format("~/Reports/{0}/{1}.rpt", reportPath, reportName));

            saveFileName = saveName + DateTime.Now.ToString("_yyyy-MM-dd");
            if (!IsPostBack)
            {

                hf_printers.Value   = "";
                hf_nexpage.Value    = "0";
                PrinterSettings settings = new PrinterSettings();
                //firstload = true;
            }
            else
            {
                //firstload = false;
            }
            string[] ls_splitvalue;
            ls_val = Request.QueryString["id"];
            ls_splitvalue = ls_val.Split(',');
            loadreport(ls_splitvalue, reportPath);
        }


        protected void Page_Unload(object sender, EventArgs e)
        {
            cryRpt.Close();
            cryRpt.Dispose();
        }
        private void loadreport(string[] ls_splitvalue, string printfile)
        {

            DataTable dt = null;
            DataTable dtSub = null;
            DataTable dtTemp = null;
            string locationpath = printfile;
            cryRpt.Load(Server.MapPath(locationpath));
            if (ls_splitvalue.Length == 1)
            {

                dt = MyCmn.RetrieveData(ls_splitvalue[0]);
                //dt = customerdb.get_data(ls_splitvalue[1], Session["cust_account_no"].ToString(), Convert.ToInt32(Session["countryid"].ToString()), Session["comp_code"].ToString(), Session["branch_code"].ToString(), Convert.ToInt32(Session["franchise"].ToString()));
            }
            if (ls_splitvalue.Length == 3)
            {

                if (ls_splitvalue[0].ToString().Trim() == "sp_travel_order_report" || ls_splitvalue[0].ToString().Trim() == "sp_overtime_request_rep" || ls_splitvalue[0].ToString().Trim() == "sp_dtr_transmittal_rep")
                {
                    dt = MyCmn.RetrieveDataATS(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2]);
                }
                else if (ls_splitvalue[0].ToString().Trim() == "sp_employee_jobdescription_rep")
                {
                    dt = MyCmn.RetrieveDataHRD(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2]);
                }
                else
                {
                    dt = MyCmn.RetrieveData(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2]);
                }


                //dt = customerdb.get_data(ls_splitvalue[1], Session["cust_account_no"].ToString(), Convert.ToInt32(Session["countryid"].ToString()), Session["comp_code"].ToString(), Session["branch_code"].ToString(), Convert.ToInt32(Session["franchise"].ToString()), );
            }
            //For PDS Report
            if (ls_splitvalue.Length == 4)
            {
                dt = MyCmn.RetrieveData(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2]);
                if (ls_splitvalue[0].ToString().Trim() == "sp_pds_rep")
                {
                    empl_pds = Session["empl_id"].ToString().Trim();
                    dt = MyCmn.RetrieveData(ls_splitvalue[0], ls_splitvalue[1], empl_pds);
                }

                //dt = customerdb.get_data(ls_splitvalue[1], Session["cust_account_no"].ToString(), Convert.ToInt32(Session["countryid"].ToString()), Session["comp_code"].ToString(), Session["branch_code"].ToString(), Convert.ToInt32(Session["franchise"].ToString()), );
            }
            if (ls_splitvalue.Length == 5)
            {
                dt = MyCmn.RetrieveData(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4]);
                if (ls_splitvalue[0].ToString() == "sp_leave_application_hdr_tbl_report" || ls_splitvalue[0].ToString() == "sp_leave_application_hdr_tbl_report_cto")
                {
                    dt = MyCmn.RetrieveDataATS(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4]);
                }
                if (ls_splitvalue[0].ToString().Trim() == "sp_pds_rep")
                {
                    empl_pds = ls_splitvalue[4];
                    dt = MyCmn.RetrieveData(ls_splitvalue[0], ls_splitvalue[1], empl_pds);
                }


                // dt = customerdb.get_data(ls_splitvalue[1], Session["cust_account_no"].ToString(), Convert.ToInt32(Session["countryid"].ToString()), Session["comp_code"].ToString(), Session["branch_code"].ToString(), Convert.ToInt32(Session["franchise"].ToString()), ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4], ls_splitvalue[5]);
            }
            if (ls_splitvalue.Length == 7)
            {
                dt = MyCmn.RetrieveData(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4], ls_splitvalue[5], ls_splitvalue[6]);
                //if (ls_splitvalue[5] == "N")
                //{
                //dt = MyCmn.RetrieveData(ls_splitvalue[1], Session["cust_account_no"].ToString(), Convert.ToInt32(Session["countryid"].ToString()), Session["comp_code"].ToString(), Session["branch_code"].ToString(), Convert.ToInt32(Session["franchise"].ToString()), ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4], Convert.ToInt32(ls_splitvalue[6]));
                //}
                //else
                //{
                //    dt = customerdb.get_data(ls_splitvalue[1], Session["cust_account_no"].ToString(), Convert.ToInt32(Session["countryid"].ToString()), Session["comp_code"].ToString(), Session["branch_code"].ToString(), Convert.ToInt32(Session["franchise"].ToString()), ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4], ls_splitvalue[6]);
                //}
                if (ls_splitvalue[0].ToString() == "sp_leave_application_hdr_tbl_report_cto" 
                    || ls_splitvalue[0].ToString() == "sp_travelorder_employee_rep"
                    || ls_splitvalue[0].ToString() == "sp_travel_order_daily_dept_rep")
                {
                    dt = MyCmn.RetrieveDataATS(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4], ls_splitvalue[5], ls_splitvalue[6]);
                    // dt = MyCmn.RetrieveDataATS(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4], ls_splitvalue[5], ls_splitvalue[6]);
                }
            }
            if (ls_splitvalue.Length == 9)
            {

                dt = MyCmn.RetrieveData(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4], ls_splitvalue[5], ls_splitvalue[6], ls_splitvalue[7], ls_splitvalue[8]);


                if (ls_splitvalue[0].ToString() == "sp_travel_order_daily_rep")
                {
                    dt = MyCmn.RetrieveDataATS(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4], ls_splitvalue[5], ls_splitvalue[6], ls_splitvalue[7], ls_splitvalue[8]);
                    // dt = MyCmn.RetrieveDataATS(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4], ls_splitvalue[5], ls_splitvalue[6]);
                }
                if (ls_splitvalue[0].ToString().Trim() == "sp_employeecard_re_ce_rep")
                {
                    dtSub = MyCmn.GetDatatable("SELECT * FROM HRIS_ACT.dbo.vw_payrollemployeemaster_info_HRIS_ACT WHERE empl_id = '" + ls_splitvalue[4].ToString().Trim() + "' ORDER BY effective_date DESC");
                }

            }
            //FOR SUBREPORT ON CARDING 
            //ADDED BY JORGE: 11/16/2019


            if (ls_splitvalue.Length == 10)
            {
                //dt = customerdb.get_data(ls_splitvalue[1], Session["cust_account_no"].ToString(), Convert.ToInt32(Session["countryid"].ToString()), Session["comp_code"].ToString(), Session["branch_code"].ToString(), Convert.ToInt32(Session["franchise"].ToString()), ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4], ls_splitvalue[5], ls_splitvalue[6], ls_splitvalue[7], ls_splitvalue[8], ls_splitvalue[9]);

            }
            if (ls_splitvalue.Length == 11)
            {
                if (ls_splitvalue[0].ToString().Trim() == "sp_dtr_rep" 
                    || ls_splitvalue[0].ToString().Trim() == "sp_authority_onhours_render_rep"
                    || ls_splitvalue[0].ToString() == "sp_travel_order_daily_rep")
                {
                    dt = MyCmn.RetrieveDataATS(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4], ls_splitvalue[5], ls_splitvalue[6], ls_splitvalue[7], ls_splitvalue[8], ls_splitvalue[9], ls_splitvalue[10]);
                }

                else
                {
                    dt = MyCmn.RetrieveData(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4], ls_splitvalue[5], ls_splitvalue[6], ls_splitvalue[7], ls_splitvalue[8], ls_splitvalue[9], ls_splitvalue[10]);
                }
                
            }
            //NOSA : 12 PARAMS
            if (ls_splitvalue.Length == 12)
            {
                dt = MyCmn.RetrieveDataATS(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4], ls_splitvalue[5], ls_splitvalue[6], ls_splitvalue[7], ls_splitvalue[8], ls_splitvalue[9], ls_splitvalue[10], "par_letter_body_line1", Session["BODY_LINE"].ToString().Trim());
            }
            //OATH : 13 PARAMS
            if (ls_splitvalue.Length == 13)
            {
                if (ls_splitvalue[12].ToString() == "O")
                {
                    dt = MyCmn.RetrieveData(ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4], ls_splitvalue[5], ls_splitvalue[6], ls_splitvalue[7], ls_splitvalue[8], ls_splitvalue[9], ls_splitvalue[10], ls_splitvalue[11]);
                }
                else if (ls_splitvalue[0].ToString().Trim() == "sp_payrollregistry_payslip")
                {
                    dt = MyCmn.RetrieveData(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4], ls_splitvalue[5], ls_splitvalue[6], ls_splitvalue[7], ls_splitvalue[8], ls_splitvalue[9], ls_splitvalue[10], ls_splitvalue[11], ls_splitvalue[12]);
                }
                else if (ls_splitvalue[0].ToString().Trim() == "sp_force_leave_plan_annual_sched_rep")
                {
                    dt = MyCmn.RetrieveData(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4], ls_splitvalue[5], ls_splitvalue[6], ls_splitvalue[7], ls_splitvalue[8], ls_splitvalue[9], ls_splitvalue[10], ls_splitvalue[11], ls_splitvalue[12]);
                    crvPrint.HasToggleGroupTreeButton = true;
                    crvPrint.PageZoomFactor = 75;
                }
                else
                {
                    dt = MyCmn.RetrieveDataATS(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4], ls_splitvalue[5], ls_splitvalue[6], ls_splitvalue[7], ls_splitvalue[8], ls_splitvalue[9], ls_splitvalue[10], ls_splitvalue[11], ls_splitvalue[12]);
                }
            }

            if (ls_splitvalue.Length == 15)
            {
                if (ls_splitvalue[0].ToString() == "sp_travel_order_daily_rep" || ls_splitvalue[0].ToString() == "sp_travel_order_daily_pa_rep" || ls_splitvalue[0].ToString() == "sp_travel_order_disapproved_rep")
                {
                    dt = MyCmn.RetrieveDataATS(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4], ls_splitvalue[5], ls_splitvalue[6], ls_splitvalue[7], ls_splitvalue[8], ls_splitvalue[9], ls_splitvalue[10], ls_splitvalue[11], ls_splitvalue[12], ls_splitvalue[13], ls_splitvalue[14]);
                }

                else
                {
                    dt = MyCmn.RetrieveData(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4], ls_splitvalue[5], ls_splitvalue[6], ls_splitvalue[7], ls_splitvalue[8], ls_splitvalue[9], ls_splitvalue[10]);
                }

            }

            else
            {
                //Label1.Text = ls_splitvalue.Length.ToString();
            }


            if (reportPath.ToString() == "~/Reports/cryDTRUnOfficial/cryDTRUnOfficial.rpt")
            {
                //crvPrint.HasExportButton = false;
                //crvPrint.HasPrintButton = false;
            }

            if (dt == null)
            {
                return;
            }

            if (dt.Rows.Count <= 0 && (ls_splitvalue[0].ToString().Trim() != "sp_pds_rep" && ls_splitvalue[0].ToString().Trim() != "sp_pds_add_page1_rep"))
            {
                //ScriptManager.RegisterStartupScript(this, this.GetType(), "MyFun1", "swal({title:'NO DATA FOUND!',text:'Data not found for Printing',icon:'warning',buttons:true, dangerMode: true });", true);

                cryRpt.SetDataSource(dtTemp);
                //Response.Redirect("~/Views/cEmployeeCardRep/");
                return;

            }
            if (ls_splitvalue[0].ToString().Trim() == "sp_payrollregistry_phic_share_brkdwn_rep")
            {
                dtSub = new DataTable();
                dtSub = MyCmn.RetrieveData("sp_payrollregistry_phic_share_brkdwn_dtl_rep", ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4], ls_splitvalue[5], ls_splitvalue[6]);
                cryRpt.Subreports["cryPHICBreakdownSummary.rpt"].SetDataSource(dtSub);
            }
            
            if (ls_splitvalue[0].ToString().Trim() == "sp_travel_order_report")
            {
                dtSub = new DataTable();
                dtSub = MyCmn.RetrieveData("sp_organizations_tbl", "organization_code", "1");
                cryRpt.Subreports["cryOrganization.rpt"].SetDataSource(dtSub);
            }
            
            if (ls_splitvalue[0].ToString().Trim() == "sp_payrollregistry_bac_rep")
            {
                dtSub = new DataTable();
                dtSub = MyCmn.RetrieveData("sp_payrollregistry_header_footer_sub_rep", ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4]);
                cryRpt.Subreports["cryPayrollFooter_A_F.rpt"].SetDataSource(dtSub);
                cryRpt.Subreports["cryPayrollHeader.rpt"].SetDataSource(dtSub);
            }

            // VJA : 2020-11-12 - For Sub Report Obligation Request (CAFOA) 
            if (ls_splitvalue[0].ToString().Trim() == "sp_payrollregistry_cafao_rep_new")
            {
                dtSub = new DataTable();
                dtSub = MyCmn.RetrieveData("sp_payrollregistry_cafao_sub_rep", ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4]);
                cryRpt.Subreports["cryCAFAO_SubRep.rpt"].SetDataSource(dtSub);
            }

            try
            {

                cryRpt.SetDataSource(dt);

                if (ls_splitvalue[0].ToString().Trim() == "sp_servicerecord_report")
                {
                    dtSub = new DataTable();
                    dtSub = MyCmn.RetrieveData(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4]);
                    cryRpt.Subreports["cryServiceRecord.rpt"].SetDataSource(dtSub);
                }

                //if (ls_splitvalue[0].ToString().Trim() == "sp_payrollregistry_salary_payslip_re_rep")
                //{
                //    dtSub = new DataTable();
                //    dtSub = MyCmn.RetrieveData(ls_splitvalue[0], ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4], ls_splitvalue[5], ls_splitvalue[6], ls_splitvalue[7], ls_splitvalue[8], ls_splitvalue[9], ls_splitvalue[10]);
                //    cryRpt.Subreports["cryPaySlip.rpt"].SetDataSource(dtSub);
                //}

                //cryRpt.Subreports[0].SetParameterValue(0, ls_splitvalue[2].ToString().Trim());
                //cryRpt.Subreports[1].SetParameterValue(0, ls_splitvalue[2].ToString().Trim());
                //cryRpt.Subreports[1].SetParameterValue(0, ls_splitvalue[2].ToString().Trim());


                //FOR SUBREPORT ON CARDING 
                //ADDED BY JORGE: 11/16/2019
                if (ls_splitvalue[0].ToString().Trim() == "sp_employeecard_re_ce_rep")
                {
                    cryRpt.Subreports[0].SetDataSource(dtSub);
                }

                if (ls_splitvalue[0].ToString().Trim() == "sp_pds_rep" && ls_splitvalue[3].ToString().Trim() == "O")
                {
                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT * FROM vw_pds_page1 WHERE empl_id = '" + empl_pds + "'");
                    cryRpt.Subreports["cryPDSPersonalInfo.rpt"].SetDataSource(dtSub);
                    //cryRpt.SetParameterValue(0, ls_splitvalue[2].ToString().Trim(), "Sub report Name")

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT * FROM vw_personnel_children_tbl WHERE empl_id = '" + empl_pds + "'");
                    cryRpt.Subreports["cryPDSNameOfChildren.rpt"].SetDataSource(dtSub);
                    //cryRpt.Subreports[1].SetParameterValue(0, ls_splitvalue[2].ToString().Trim());

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT IIF(ISDATE(examination_dateS)=1,examination_dateS,'1900') AS examination_date1,* FROM vw_personnel_csceligibilty_tbl WHERE empl_id = '" + empl_pds + "' ORDER BY examination_date1 DESC");
                    cryRpt.Subreports["cryPDCivilService.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT IIF(ISDATE(workexp_fromS)=1,workexp_fromS,'1900') AS workexp_from1,* FROM vw_personnel_workexprnce_tbl WHERE empl_id = '" + empl_pds + "' ORDER BY workexp_from1 DESC");
                    cryRpt.Subreports["cryPDSWorkExperience.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT IIF(ISDATE(voluntarywork_fromS)=1,voluntarywork_fromS,'1900') AS voluntarywork_from1,* FROM vw_personnel_voluntarywork_tbl WHERE empl_id = '" + empl_pds + "' ORDER BY voluntarywork_from1 DESC");
                    cryRpt.Subreports["cryPDSVoluntaryWork.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT IIF(ISDATE(learn_devt_fromS)=1,learn_devt_fromS,'1900') AS learn_devt_from1,* FROM vw_personnel_lnd_tbl WHERE empl_id = '" + empl_pds + "'ORDER BY learn_devt_from1 DESC");
                    cryRpt.Subreports["cryPDSLND.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT * FROM vw_pds_page3 WHERE empl_id = '" + empl_pds + "'");
                    cryRpt.Subreports["cryPDSOtherInformation.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT * FROM vw_personnel_otherinformation_tbl WHERE empl_id = '" + empl_pds + "' AND other_type='S'");
                    cryRpt.Subreports["cryPDSOtherInformation_Skills.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT * FROM vw_personnel_otherinformation_recognation_tbl WHERE empl_id = '" + empl_pds + "' AND other_type='R'");
                    cryRpt.Subreports["cryPDSOtherInformation_Recognation.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT * FROM vw_personnel_otherinformation_membership_tbl WHERE empl_id = '" + empl_pds + "' AND other_type='M'");
                    cryRpt.Subreports["cryPDSOtherInformation_Membership.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT * FROM vw_personnel_statutary_tbl WHERE empl_id = '" + empl_pds + "'");
                    cryRpt.Subreports["cryPDSPage4.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT * FROM vw_personnel_references_tbl WHERE empl_id = '" + empl_pds + "'");
                    cryRpt.Subreports["cryPDSPersonReference.rpt"].SetDataSource(dtSub);
                }
                else if (ls_splitvalue[0].ToString().Trim() == "sp_pds_rep" && ls_splitvalue[3].ToString().Trim() == "2")
                {
                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT IIF(ISDATE(examination_dateS)=1,examination_dateS,'1900') AS examination_date1,* FROM vw_personnel_csceligibilty2_tbl WHERE empl_id = '" + empl_pds + "' ORDER BY examination_date1 DESC");
                    cryRpt.Subreports["cryPDCivilService.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT IIF(ISDATE(workexp_fromS)=1,workexp_fromS,'1900') AS workexp_from1,* FROM vw_personnel_workexprnce2_tbl WHERE empl_id = '" + empl_pds + "' ORDER BY workexp_from1 DESC");
                    cryRpt.Subreports["cryPDSWorkExperience.rpt"].SetDataSource(dtSub);
                }
                else if (ls_splitvalue[0].ToString().Trim() == "sp_pds_rep" && ls_splitvalue[3].ToString().Trim() == "3")
                {
                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT IIF(ISDATE(voluntarywork_fromS)=1,voluntarywork_fromS,'1900') AS voluntarywork_from1,* FROM vw_personnel_voluntarywork2_tbl WHERE empl_id = '" + empl_pds + "' ORDER BY voluntarywork_from1 DESC");
                    cryRpt.Subreports["cryPDSVoluntaryWork.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT IIF(ISDATE(learn_devt_fromS)=1,learn_devt_fromS,'1900') AS learn_devt_from1,* FROM vw_personnel_lnd2_tbl WHERE empl_id = '" + empl_pds + "'ORDER BY learn_devt_from1 DESC");
                    cryRpt.Subreports["cryPDSLND.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT * FROM vw_pds_page3 WHERE empl_id = '" + empl_pds + "'");
                    cryRpt.Subreports["cryPDSOtherInformation.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT * FROM vw_personnel_otherinformation2_tbl WHERE empl_id = '" + empl_pds + "' AND other_type='S'");
                    cryRpt.Subreports["cryPDSOtherInformation_Skills.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT * FROM vw_personnel_otherinformation_recognation2_tbl WHERE empl_id = '" + empl_pds + "' AND other_type='R'");
                    cryRpt.Subreports["cryPDSOtherInformation_Recognation.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.GetDatatable("SELECT * FROM vw_personnel_otherinformation_membership2_tbl WHERE empl_id = '" + empl_pds + "' AND other_type='M'");
                    cryRpt.Subreports["cryPDSOtherInformation_Membership.rpt"].SetDataSource(dtSub);
                }
                else if (ls_splitvalue[0].ToString().Trim() == "sp_overtime_request_rep")
                {
                    dtSub = new DataTable();
                    dtSub = MyCmn.RetrieveData("sp_organizations_tbl", "organization_code", "1");
                    cryRpt.Subreports["cryOrganization.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.RetrieveDataATS("sp_ot_request_purpose_dtl_tbl_list", "par_ot_ctrl_no", ls_splitvalue[2].ToString().Trim());
                    cryRpt.Subreports["cryOTSubPurposeReport.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.RetrieveDataATS("sp_overtime_request_dates_sub_rep", "par_ot_ctrl_no", ls_splitvalue[2].ToString().Trim());
                    cryRpt.Subreports["cryOTSubDatesReport.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.RetrieveDataATS("sp_ot_request_empl_dtl_tbl_list", "par_crtl_no", ls_splitvalue[2].ToString().Trim());
                    cryRpt.Subreports["cryOTSubEmplReport.rpt"].SetDataSource(dtSub);
                }

                else if (ls_splitvalue[0].ToString().Trim() == "sp_dtr_transmittal_rep")
                {
                    dtSub = new DataTable();
                    dtSub = MyCmn.RetrieveData("sp_organizations_tbl", "organization_code", "1");
                    cryRpt.Subreports["cryOrganization.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.RetrieveDataATS("sp_dtr_transmittal_sub_rep", "par_transmittal_nbr", ls_splitvalue[2].ToString().Trim());
                    cryRpt.Subreports["cryTransmittalSub.rpt"].SetDataSource(dtSub);

                    dtSub = new DataTable();
                    dtSub = MyCmn.RetrieveDataATS("sp_dtr_transmittal_sub_rep2", "par_transmittal_nbr", ls_splitvalue[2].ToString().Trim());
                    cryRpt.Subreports["cryTransmittalSub2.rpt"].SetDataSource(dtSub);

                }

                else if (ls_splitvalue[0].ToString().Trim() == "sp_leave_application_hdr_tbl_report")
                {
                    dtSub = new DataTable();
                    dtSub = MyCmn.RetrieveDataATS(ls_splitvalue[0].ToString().Trim(), ls_splitvalue[1].ToString().Trim(), ls_splitvalue[2].ToString().Trim(), ls_splitvalue[3].ToString().Trim(), ls_splitvalue[4].ToString().Trim());
                    cryRpt.Subreports["crySubLeavePermission.rpt"].SetDataSource(dtSub);
                }

                
                // VJA : 2020-09-04 - For Sub Report Organization Table
                if (ls_splitvalue[0].ToString().Trim() == "sp_payrollregistry_takehome" ||
                    ls_splitvalue[0].ToString().Trim() == "sp_list_of_employees_report" ||
                    ls_splitvalue[0].ToString().Trim() == "sp_payrollemployeemaster_rep" ||
                    ls_splitvalue[0].ToString().Trim() == "sp_employee_list_age"
                    )
                {
                    dtSub = new DataTable();
                    dtSub = MyCmn.RetrieveData("sp_organizations_tbl", "organization_code", "1");
                    cryRpt.Subreports["cryOrganization.rpt"].SetDataSource(dtSub);
                }
                // VJA : 2020-10-24 - For Sub Report Footer - New Payroll - Regular
                else if (ls_splitvalue[0].ToString().Trim() == "sp_payrollregistry_salary_re_ce_rep" ||
                         ls_splitvalue[0].ToString().Trim() == "sp_payrollregistry_salary_ce_rep" ||
                         ls_splitvalue[0].ToString().Trim() == "sp_payrollregistry_salary_jo_rep" ||
                         ls_splitvalue[0].ToString().Trim() == "sp_payrollregistry_subs_rep" ||
                         ls_splitvalue[0].ToString().Trim() == "sp_payrollregistry_ovtm_rep" ||
                         ls_splitvalue[0].ToString().Trim() == "sp_payrollregistry_rata_rep" ||
                         ls_splitvalue[0].ToString().Trim() == "sp_payrollregistry_oth1_rep" ||
                         ls_splitvalue[0].ToString().Trim() == "sp_payrollregistry_salary_diff_rep" ||
                         ls_splitvalue[0].ToString().Trim() == "sp_payrollregistry_othpay_rep")
                {
                    if (ls_splitvalue[6].ToString().Trim() == "007" || // RE Monthly Payroll
                        ls_splitvalue[6].ToString().Trim() == "008" || // CE Monthly Payroll
                        ls_splitvalue[6].ToString().Trim() == "009" || // JO Monthly Payroll
                        ls_splitvalue[6].ToString().Trim() == "010" || // JO  1st Quincena Payroll
                        ls_splitvalue[6].ToString().Trim() == "011" || // JO  2nd Quincena Payroll
                        ls_splitvalue[6].ToString().Trim() == "021" || // RE Hazard, Subsistence and Laundry Pay
                        ls_splitvalue[6].ToString().Trim() == "022" || // RE Overtime Payroll
                        ls_splitvalue[6].ToString().Trim() == "023" || // RE RATA Payroll
                        ls_splitvalue[6].ToString().Trim() == "024" || // RE Communication Expense Allocation
                        ls_splitvalue[6].ToString().Trim() == "025" || // RE Monetization
                        ls_splitvalue[6].ToString().Trim() == "026" || // RE Mid Year Bonus
                        ls_splitvalue[6].ToString().Trim() == "027" || // RE Year-End and Cash Gift Bonus -Regular
                        ls_splitvalue[6].ToString().Trim() == "028" || // RE Clothing Allowances - Regular
                        ls_splitvalue[6].ToString().Trim() == "029" || // RE Loyalty Bonus
                        ls_splitvalue[6].ToString().Trim() == "030" || // RE Anniversary Bonus
                        ls_splitvalue[6].ToString().Trim() == "031" || // RE Productivity Enhancement Incentive
                        ls_splitvalue[6].ToString().Trim() == "032" || // RE C. N.A.Incentive 2020(Permanent)
                        ls_splitvalue[6].ToString().Trim() == "033" || // RE Salary Differential
                        ls_splitvalue[6].ToString().Trim() == "041" || // CE Hazard, Subsistence and Laundry Pay
                        ls_splitvalue[6].ToString().Trim() == "042" || // CE Overtime Payroll
                        ls_splitvalue[6].ToString().Trim() == "043" || // CE Communication Expense Allocation
                        ls_splitvalue[6].ToString().Trim() == "044" || // CE Monetization
                        ls_splitvalue[6].ToString().Trim() == "045" || // CE Mid Year Bonus
                        ls_splitvalue[6].ToString().Trim() == "046" || // CE Year-End and Cash Gift Bonus -Casual
                        ls_splitvalue[6].ToString().Trim() == "047" || // CE Clothing Allowances
                        ls_splitvalue[6].ToString().Trim() == "048" || // CE Loyalty Bonus
                        ls_splitvalue[6].ToString().Trim() == "049" || // CE Anniversary Bonus
                        ls_splitvalue[6].ToString().Trim() == "050" || // CE Productivity Enhancement Incentive
                        ls_splitvalue[6].ToString().Trim() == "051" || // CE C. N.A.Incentive 2020(Casual)
                        ls_splitvalue[6].ToString().Trim() == "061" || // JO Overtime Payroll
                        ls_splitvalue[6].ToString().Trim() == "062" || // JO Honorarium
                        ls_splitvalue[6].ToString().Trim() == "901" || // JO Adjustments
                        ls_splitvalue[6].ToString().Trim() == "902" || // CE Adjustments
                        ls_splitvalue[6].ToString().Trim() == "903" || // JO Other Pay - Two
                        ls_splitvalue[6].ToString().Trim() == "904" || // JO Other Pay - One
                        ls_splitvalue[6].ToString().Trim() == "905" || // CE Other Pay - Two
                        ls_splitvalue[6].ToString().Trim() == "906" || // CE Other Pay - One
                        ls_splitvalue[6].ToString().Trim() == "907" || // RE Adjustments
                        ls_splitvalue[6].ToString().Trim() == "908" || // RE Other Pay - Two
                        ls_splitvalue[6].ToString().Trim() == "909" || // RE Other Pay - One
                        ls_splitvalue[6].ToString().Trim() == "920" || // RE Peace Keeper's Honorarium
                        ls_splitvalue[6].ToString().Trim() == "921" || // RE Other Template(RESERVED)
                        ls_splitvalue[6].ToString().Trim() == "922" || // RE Special Risk Allowance I
                        ls_splitvalue[6].ToString().Trim() == "923" || // RE Special Risk Allowance II
                        ls_splitvalue[6].ToString().Trim() == "924" || // RE COVID-19 Hazard Pay
                        ls_splitvalue[6].ToString().Trim() == "925" || // RE Other Template(RESERVED)
                        ls_splitvalue[6].ToString().Trim() == "926" || // RE Other Template(RESERVED)
                        ls_splitvalue[6].ToString().Trim() == "927" || // RE Other Template(RESERVED)
                        ls_splitvalue[6].ToString().Trim() == "928" || // RE Other Template(RESERVED)
                        ls_splitvalue[6].ToString().Trim() == "929" || // RE Other Template(RESERVED)
                        ls_splitvalue[6].ToString().Trim() == "930" || // CE Peace Keeper's Honorarium
                        ls_splitvalue[6].ToString().Trim() == "931" || // CE Other Template(RESERVED)
                        ls_splitvalue[6].ToString().Trim() == "932" || // CE Special Risk Allowance I
                        ls_splitvalue[6].ToString().Trim() == "933" || // CE Special Risk Allowance II
                        ls_splitvalue[6].ToString().Trim() == "934" || // CE COVID-19 Hazard Pay
                        ls_splitvalue[6].ToString().Trim() == "935" || // CE Other Template(RESERVED)
                        ls_splitvalue[6].ToString().Trim() == "936" || // CE Other Template(RESERVED)
                        ls_splitvalue[6].ToString().Trim() == "937" || // CE Other Template(RESERVED)
                        ls_splitvalue[6].ToString().Trim() == "938" || // CE Other Template(RESERVED)
                        ls_splitvalue[6].ToString().Trim() == "939" || // CE Other Template(RESERVED)
                        ls_splitvalue[6].ToString().Trim() == "940" || // JO Peace Keeper's Honorarium
                        ls_splitvalue[6].ToString().Trim() == "941" || // JO PHIC REFUND
                        ls_splitvalue[6].ToString().Trim() == "942" || // JO Special Risk Allowance I
                        ls_splitvalue[6].ToString().Trim() == "943" || // JO Special Risk Allowance II
                        ls_splitvalue[6].ToString().Trim() == "944" || // JO COVID-19 Hazard Pay
                        ls_splitvalue[6].ToString().Trim() == "945" || // JO Other Template(RESERVED)
                        ls_splitvalue[6].ToString().Trim() == "946" || // JO Other Template(RESERVED)
                        ls_splitvalue[6].ToString().Trim() == "947" || // JO Other Template(RESERVED)
                        ls_splitvalue[6].ToString().Trim() == "948" || // JO Other Template(RESERVED)
                        ls_splitvalue[6].ToString().Trim() == "949" || // JO Other Template(RESERVED)
                        ls_splitvalue[6].ToString().Trim() == "950" || // RE PHIC Share
                        ls_splitvalue[6].ToString().Trim() == "951" || // RE BAC Honorarium
                        ls_splitvalue[6].ToString().Trim() == "052" || // CE Salary Differential
                        ls_splitvalue[6].ToString().Trim() == "063" || // JO Communication Expense Allowance
                        ls_splitvalue[6].ToString().Trim() == "116" ||   // Monthly Payroll - Sub. Spec.
                        ls_splitvalue[6].ToString().Trim() == "232" ||  
                        ls_splitvalue[6].ToString().Trim() == "233" ||  
                        ls_splitvalue[6].ToString().Trim() == "234" ||

                        //ls_splitvalue[7].ToString().Trim() == "952" ||
                        //ls_splitvalue[7].ToString().Trim() == "953" ||
                        //ls_splitvalue[7].ToString().Trim() == "954" ||
                        //ls_splitvalue[7].ToString().Trim() == "955" ||
                        //ls_splitvalue[7].ToString().Trim() == "956" ||
                        //ls_splitvalue[7].ToString().Trim() == "957" ||
                        //ls_splitvalue[7].ToString().Trim() == "958" ||
                        //ls_splitvalue[7].ToString().Trim() == "959" ||
                        //ls_splitvalue[7].ToString().Trim() == "960" ||
                        //ls_splitvalue[7].ToString().Trim() == "961" ||
                        //ls_splitvalue[7].ToString().Trim() == "962" ||
                        //ls_splitvalue[7].ToString().Trim() == "963" ||
                        //ls_splitvalue[7].ToString().Trim() == "964" ||
                        //ls_splitvalue[7].ToString().Trim() == "965" 

                        (Convert.ToInt16(ls_splitvalue[6].ToString().Trim()) >= 920 &&
                         Convert.ToInt16(ls_splitvalue[6].ToString().Trim()) <= 999)
                        )   
                    {
                        dtSub = new DataTable();
                        dtSub = MyCmn.RetrieveData("sp_payrollregistry_header_footer_sub_rep", ls_splitvalue[1], ls_splitvalue[2], ls_splitvalue[3], ls_splitvalue[4]);
                        cryRpt.Subreports["cryPayrollFooter_A_F.rpt"].SetDataSource(dtSub);
                        cryRpt.Subreports["cryPayrollHeader.rpt"].SetDataSource(dtSub);

                        //crvPrint.HasExportButton = false;
                        //crvPrint.HasPrintButton = false;
                    }
                }
                


                //END
                crvPrint.ReportSource = cryRpt;
                crvPrint.DataBind();
                PrinterSettings settings = new PrinterSettings();
            }
            catch (Exception e)
            {
            }
        }
        private void BindReport(ReportDocument ReportPath)
        {
            crvPrint.ReportSource = ReportPath;
            crvPrint.DataBind();

        }
        private void shownextpage(int pageno)
        {
            crvPrint.ShowNthPage(pageno);
            hf_nexpage.Value = "0";

        }
        private void shoprevpage()
        {
            crvPrint.ShowPreviousPage();

        }
        protected void btn_print_Click(object sender, EventArgs e)
        {
            LinkButton btn = (LinkButton)sender;

            try
            {
                cryRpt.Refresh();

                switch (printfile)
                {
                    case "~/Reports/cryPlantilla/cryPlantilla.rpt":
                        cryRpt.PrintOptions.PaperOrientation = PaperOrientation.Landscape;
                        cryRpt.PrintOptions.PaperSize = CrystalDecisions.Shared.PaperSize.PaperLegal;
                        break;
                    case "~/Reports/cryPlantillaCSC/cryPlantillaCSC.rpt":
                        cryRpt.PrintOptions.PaperOrientation = PaperOrientation.Landscape;
                        cryRpt.PrintOptions.PaperSize = CrystalDecisions.Shared.PaperSize.PaperLegal;
                        break;
                    case "~/Reports/cryPlantillaHR/cryPlantillaHR.rpt":
                        cryRpt.PrintOptions.PaperOrientation = PaperOrientation.Landscape;
                        cryRpt.PrintOptions.PaperSize = CrystalDecisions.Shared.PaperSize.PaperLegal;
                        break;
                    case "~/Reports/cryPSSalariesWages/cryPSSalariesWages.rpt":
                        cryRpt.PrintOptions.PaperOrientation = PaperOrientation.Landscape;
                        cryRpt.PrintOptions.PaperSize = CrystalDecisions.Shared.PaperSize.PaperLetter;
                        break;
                    case "~/Reports/cryVacantItems/cryVacantItems.rpt":
                        cryRpt.PrintOptions.PaperOrientation = PaperOrientation.Portrait;
                        cryRpt.PrintOptions.PaperSize = CrystalDecisions.Shared.PaperSize.PaperLetter;
                        break;
                    case "~/Reports/cryListOfEmployees/cryListOfEmployees.rpt":
                        cryRpt.PrintOptions.PaperOrientation = PaperOrientation.Portrait;
                        cryRpt.PrintOptions.PaperSize = CrystalDecisions.Shared.PaperSize.PaperLetter;
                        break;
                    default:

                        break;
                }
            }
            catch (Exception)
            {
            }

        }

        private string GetDefaultPrinter()
        {
            PrinterSettings settings = new PrinterSettings();
            foreach (string printer in PrinterSettings.InstalledPrinters)
            {
                settings.PrinterName = printer;
                if (settings.IsDefaultPrinter)
                {
                    return printer;
                }
            }
            return string.Empty;
        }

        protected void btn_close_Click(object sender, EventArgs e)
        {
            closepage();
        }
        private void closepage()
        {
            ClientScript.RegisterClientScriptBlock(Page.GetType(), "script", "window.close();", true);
        }

        protected void img_nextpage_Click(object sender, ImageClickEventArgs e)
        {
            crvPrint.ShowNextPage();

        }
        protected void lbtn_pdf_Click(object sender, ImageClickEventArgs e)
        {
            converttopdf();

        }
        private void converttopdf()
        {
            try
            {
                ExportOptions CrExportOptions;
                DiskFileDestinationOptions CrDiskFileDestinationOptions = new DiskFileDestinationOptions();
                PdfRtfWordFormatOptions CrFormatTypeOptions = new PdfRtfWordFormatOptions();
                CrDiskFileDestinationOptions.DiskFileName = @"c:\\pdf\Plantilla.pdf";
                CrExportOptions = cryRpt.ExportOptions;
                {
                    CrExportOptions.ExportDestinationType = ExportDestinationType.DiskFile;
                    CrExportOptions.ExportFormatType = ExportFormatType.PortableDocFormat;
                    CrExportOptions.DestinationOptions = CrDiskFileDestinationOptions;
                    CrExportOptions.FormatOptions = CrFormatTypeOptions;
                }
                cryRpt.Export();

            }
            catch (Exception ex)
            {
                ex.ToString();
            }
        }

        protected void lbtn_pdf_Click(object sender, EventArgs e)
        {
            converttopdf();
        }

        protected void btn_save_Click(object sender, EventArgs e)
        {
            //ScriptManager.RegisterStartupScript(this, this.GetType(), "Pop", "Clickprint();", true);
        }

        protected void crvPrint_Load(object sender, EventArgs e)
        {
            //    if (Session["first_load"].ToString() == "true")
            //     {
            //        ScriptManager.RegisterStartupScript(this, this.GetType(), "Pop", "setPageDisplay();", true);
            //     }
        }

    }
}