
//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Personal Data Sheet
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// VINCENT JADE H. ALIVIO    01/09/2020      Code Creation
//**********************************************************************************


using HRIS_eSelfService.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Text;
using System.Drawing;

namespace HRIS_eSelfService.Controllers
{
    public class rSSPaySlipPrintingController : Controller
    {
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();

        // GET: rSSPaySlipPrinting
        public ActionResult Index()
        {
            User_Menu um = new User_Menu();
            if (Session["user_id"] == null || Session["user_id"].ToString().Trim() == "")
            {
                return RedirectToAction("Index", "Login");
            }
            if (um != null || um.ToString() != "")
            {
                um.allow_add            = (int)Session["allow_add"];
                um.allow_delete         = (int)Session["allow_delete"];
                um.allow_edit           = (int)Session["allow_edit"];
                um.allow_edit_history   = (int)Session["allow_edit_history"];
                um.allow_print          = (int)Session["allow_print"];
                um.allow_view           = (int)Session["allow_view"];
                um.url_name             = Session["url_name"].ToString();
                um.id                   = (int)Session["id"];
                um.menu_name            = Session["menu_name"].ToString();
                um.page_title           = Session["page_title"].ToString();
            }
            return View(um);
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 2021-08-16
        // Description : User Access on Page
        //*********************************************************************//
        public ActionResult UserAccessOnPage(int id)
        {
            Session["user_menu_id"] = id;
            return Json("success", JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 2021-08-16
        // Description : Initialized Page 
        //*********************************************************************//
        public ActionResult InitializeData()
        {

           var session_user_id          = Session["user_id"].ToString()         ;
           var session_user_profile     = Session["user_profile"].ToString()    ;
           var session_empl_id          = Session["empl_id"].ToString()         ;
           var session_employee_name    = Session["employee_name"].ToString()   ;
           var session_first_name       = Session["first_name"].ToString()      ;
           var session_last_name        = Session["last_name"].ToString()       ;
           var session_middle_name      = Session["middle_name"].ToString()     ;
           var session_suffix_name      = Session["suffix_name"].ToString()     ;
           var session_photo            = Session["photo"].ToString()           ;
           var session_owner_fullname   = Session["owner_fullname"].ToString()  ;
           var session_budget_code      = Session["budget_code"].ToString()     ;
           var session_department_code  = Session["department_code"].ToString() ;
           var session_employment_type  = Session["employment_type"].ToString() ;
           var lst_payrolltemplate_code  = db.sp_payrolltemplate_tbl_list6(session_employment_type).ToList() ;


           return Json(new {
                 session_user_id
                ,session_user_profile
                ,session_empl_id
                ,session_employee_name
                ,session_first_name
                ,session_last_name
                ,session_middle_name
                ,session_suffix_name
                ,session_photo
                ,session_owner_fullname
                ,session_budget_code
                ,session_department_code
                ,session_employment_type
                ,lst_payrolltemplate_code
            }, JsonRequestBehavior.AllowGet);
            
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 2021-08-16
        // Description : Printing on Pay Slip
        //*********************************************************************//
        public ActionResult RetriveData
                            (string par_payroll_year
                            ,string par_payroll_month
                            ,string par_payroll_registry_nbr
                            ,string par_employment_type
                            ,string par_payrolltemplate_code
                            ,string par_empl_id
                            )
        {

            try
            {
                var message    = "";
                var ReportPath = "";
                var procedure  = "";
                var parameters = "";

                object sp_report = new object();

                if (par_payrolltemplate_code == "009" ||  // JO - Monthly payroll
                    par_payrolltemplate_code == "010" ||  // JO - 1st Quincena
                    par_payrolltemplate_code == "011"     // JO - 2nd Quincena
                    )
                {
                    ReportPath = "~/Reports/cryJobOrderReports/cryPayslip/cryPaySlip.rpt";
                    procedure = "sp_payrollregistry_salary_payslip_jo_rep";
                    parameters =  ",par_payroll_year," + par_payroll_year + ",par_payroll_month," + par_payroll_month + ",par_payroll_registry_nbr," + "" + ",par_payrolltemplate_code," + "213" + ",par_empl_id," + par_empl_id;

                    sp_report = db.sp_payrollregistry_salary_payslip_jo_rep(par_payroll_year, par_payroll_month, par_payroll_registry_nbr, "213", par_empl_id).ToList();
                }
                else if (par_payrolltemplate_code == "008")
                {
                    ReportPath = "~/Reports/cryCasualReports/cryPayslip/cryPaySlip.rpt";
                    procedure = "sp_payrollregistry_salary_payslip_ce_rep";
                    parameters =  ",par_payroll_year," + par_payroll_year + ",par_payroll_month," + par_payroll_month + ",par_payroll_registry_nbr," + "" + ",par_payrolltemplate_code," + "214" + ",par_empl_id," + par_empl_id;

                    sp_report = db.sp_payrollregistry_salary_payslip_ce_rep(par_payroll_year, par_payroll_month, par_payroll_registry_nbr, "214", par_empl_id).ToList();
                }
                else if (par_payrolltemplate_code == "007")
                {
                    ReportPath = "~/Reports/cryRegularReports/cryPayslip/cryPaySlip.rpt";
                    procedure = "sp_payrollregistry_salary_payslip_re_rep";
                    parameters =  ",par_payroll_year," + par_payroll_year + ",par_payroll_month," + par_payroll_month + ",par_payroll_registry_nbr," + "" + ",par_payrolltemplate_code," + "212" + ",par_empl_id," + par_empl_id;

                    sp_report = db.sp_payrollregistry_salary_payslip_re_rep(par_payroll_year, par_payroll_month, par_payroll_registry_nbr, "212", par_empl_id).ToList();
                }
                else if (par_payrolltemplate_code == "041" ||  // Subsistence - RE
                        par_payrolltemplate_code == "021")    // Subsistence - CE
                {
                    procedure = "sp_payrollregistry_payslip";
                    ReportPath = "~/Reports/cryOtherPayroll/cryPayslip/cryPS_Subsistence.rpt";
                    parameters =  ",par_payroll_year," + par_payroll_year + ",par_payroll_month," + par_payroll_month + ",par_employment_type," + par_employment_type + ",par_payroll_registry_nbr," + "" + ",par_payrolltemplate_code," + par_payrolltemplate_code + ",par_empl_id," + par_empl_id;

                    sp_report = db.sp_payrollregistry_payslip(par_payroll_year, par_payroll_month, par_employment_type, par_payroll_registry_nbr, par_payrolltemplate_code, par_empl_id).ToList();
                }
                else if (par_payrolltemplate_code == "023")  // RATA - RE
                {
                    procedure = "sp_payrollregistry_payslip";
                    ReportPath = "~/Reports/cryOtherPayroll/cryPayslip/cryPS_RATA.rpt";
                    parameters =  ",par_payroll_year," + par_payroll_year + ",par_payroll_month," + par_payroll_month + ",par_employment_type," + par_employment_type + ",par_payroll_registry_nbr," + "" + ",par_payrolltemplate_code," + par_payrolltemplate_code + ",par_empl_id," + par_empl_id;

                    sp_report = db.sp_payrollregistry_payslip(par_payroll_year, par_payroll_month, par_employment_type, par_payroll_registry_nbr, par_payrolltemplate_code, par_empl_id).ToList();
                }
                else if (par_payrolltemplate_code == "022" ||   // Overtime Payroll - RE
                         par_payrolltemplate_code == "042" ||   // Overtime Payroll - CE
                         par_payrolltemplate_code == "061")     // Overtime Payroll - JO
                {
                    procedure = "sp_payrollregistry_payslip";
                    ReportPath = "~/Reports/cryOtherPayroll/cryPayslip/cryPS_Ovtm.rpt";
                    parameters =  ",par_payroll_year," + par_payroll_year + ",par_payroll_month," + par_payroll_month + ",par_employment_type," + par_employment_type + ",par_payroll_registry_nbr," + "" + ",par_payrolltemplate_code," + par_payrolltemplate_code + ",par_empl_id," + par_empl_id;

                    sp_report = db.sp_payrollregistry_payslip(par_payroll_year, par_payroll_month, par_employment_type, par_payroll_registry_nbr, par_payrolltemplate_code, par_empl_id).ToList();
                }
                else
                {
                    procedure = "sp_payrollregistry_payslip";
                    ReportPath = "~/Reports/cryOtherPayroll/cryPayslip/cryPS_OtherSal.rpt";
                    parameters =  ",par_payroll_year," + par_payroll_year + ",par_payroll_month," + par_payroll_month + ",par_employment_type," + par_employment_type + ",par_payroll_registry_nbr," + "" + ",par_payrolltemplate_code," + par_payrolltemplate_code + ",par_empl_id," + par_empl_id;

                    sp_report = db.sp_payrollregistry_payslip(par_payroll_year, par_payroll_month, par_employment_type, par_payroll_registry_nbr, par_payrolltemplate_code, par_empl_id).ToList();
                }

                //*********************************************************************//
                //****** Checking for Payroll Registry header Posting Status *********//
                //*******************************************************************//
                // var payroll_registry_nbr = sp_report.
                // var chk_payrollregistry  = db.payrollregistry_hdr_tbl.Where(a=> a.payroll_registry_nbr = )
                //*********************************************************************//
                //*********************************************************************//

                message = "success";

                Session["history_page"] = Request.UrlReferrer.ToString();
                return Json(new { message, sp_report, procedure, ReportPath, parameters }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { message = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 2021-08-16
        // Description : Initialized Page 
        //*********************************************************************//
        public ActionResult RetrievePayrolltemplate(string par_employment_type)
        {
            var lst_payrolltemplate_code = db.sp_payrolltemplate_tbl_list6(par_employment_type).ToList();
            return Json(new{lst_payrolltemplate_code }, JsonRequestBehavior.AllowGet);
        }
    }
}