//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for BAC Payroll Registry Details
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// VINCENT JADE H. ALIVIO   2020-04-08      Code Creation
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
using System.IO;
using HRIS_Common;

namespace HRIS_eSelfService.Controllers
{
    public class cSSBACPayReg_DTLController : Controller
    {
        // GET: cSSBACPayReg_DTL
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        User_Menu um = new User_Menu();
        CommonDB cmn = new CommonDB();
        //*********************************************************************//
        // Created By : VJA - Created Date : 2020-04-08
        // Description: Get the User Role
        //*********************************************************************//
        public void GetAllowAccess()
        {
            ViewBag.allow_add       = (int)Session["allow_add"];
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
        public ActionResult Index()
        {
            GetAllowAccess();
            if (Session["id"] == null || Session["id"].ToString() == "")
            {
                return RedirectToAction("Index", "Login");
            }
            else return View();
        }

        //*********************************************************************//
        // Created By : VJA - Created Date :2020-04-08
        // Description : DATA CONVERTION FOR JSON
        //*********************************************************************//
        protected ActionResult JSON(object data, JsonRequestBehavior behavior)
        {
            return new JsonResult()
            {
                Data = data,
                ContentType = "application/json",
                ContentEncoding = Encoding.UTF8,
                JsonRequestBehavior = behavior,
                MaxJsonLength = Int32.MaxValue
            };
        }
        //*********************************************************************//
        // Created By : VJA - Created Date :2020-04-08
        // Description: Initialize Page
        //*********************************************************************//
        public ActionResult InitializePage()
        {
            // 0  - par_year
            // 1  - par_month
            // 2  - par_month_descr
            // 3  - par_group_code
            // 4  - par_group_code_descr
            // 5  - par_payrolltemplate_code
            // 6  - par_payrolltemplate_code_descr
            // 7  - par_payroll_registry_nbr
            // 8  - par_post_status
            // 9  - par_post_status_descr
            // 10 - par_show_entries
            // 11 - par_page_nbr
            // 12 - par_search

            GetAllowAccess();
            string[] preval = Session["PreviousValuesonPage_cSSBACPayReg"].ToString().Trim().Split(new char[] { ',' });
            var data        = db.sp_payrollregistry_dtl_bac_tbl_list(preval[0].ToString(), preval[7].ToString()).ToList().OrderBy(a => a.employee_name);
            var hdrlist     = db.sp_payrollregistry_hdr_bac_tbl_list(preval[0].ToString()).ToList();
            return JSON(new { data, um, preval, hdrlist }, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By : VJA - Created Date :2020-04-08
        // Description: Retrieve data in list Grid
        //*********************************************************************//
        public ActionResult RetreiveDataGrid(string par_payroll_year)
        {
            var data = db.sp_payrollregistry_hdr_bac_tbl_list(par_payroll_year).ToList();
            return JSON(new { data }, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By : VJA - Created Date :2020-04-08
        // Description: Retrieve data in list Grid
        //*********************************************************************//
        public ActionResult RetrieveEmpl()
        {
            var message = "";
            var emplist = db.sp_personnelnames_combolist_bac_dtl().ToList();
            if (emplist.Count > 0)
            {
                message = "success";
            }
            else
            {
                message = "no-data-found";
            }
            return JSON(new { emplist, message }, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 2020-04-08
        // Description : Save From Database
        //*********************************************************************//
        public ActionResult SaveFromDatabase(payrollregistry_dtl_bac_tbl data)
        {
            string[] preval = Session["PreviousValuesonPage_cSSBACPayReg"].ToString().Trim().Split(new char[] { ',' });
            var par_payroll_year         = preval[0].ToString();
            var par_payroll_registry_nbr = preval[7].ToString();
            var message = "";
            var message_oth = "";
            try
            {
                var var_default_date = "1990-01-01";
                DateTime default_date = Convert.ToDateTime(var_default_date);

                data.payroll_year         = par_payroll_year;
                data.payroll_registry_nbr = par_payroll_registry_nbr;
                data.created_dttm         = DateTime.Now;
                data.created_by_user      = Session["user_id"].ToString();
                data.updated_dttm         = default_date;
                data.updated_by_user      = "";
                
                message = "success";
                message_oth = cmn.CONST_NEWREC;
                db.payrollregistry_dtl_bac_tbl.Add(data);
                db.SaveChanges();
                return Json(new { message, message_oth, data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                message_oth = e.InnerException.InnerException.Message;
                message = "Data Already Exist !";
                return Json(new { message, message_oth }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 2020-04-08
        // Description :Save Edit Data to database
        //*********************************************************************//
        public ActionResult UpdateFromDatabase(payrollregistry_dtl_bac_tbl data)
        {
            string[] preval = Session["PreviousValuesonPage_cSSBACPayReg"].ToString().Trim().Split(new char[] { ',' });
            var par_payroll_year         = preval[0].ToString();
            var par_payroll_registry_nbr = preval[7].ToString();
            try
            {
                var var_default_date = "1990-01-01";
                DateTime default_date = Convert.ToDateTime(var_default_date);

                var message = "";
                var message_oth = "";
                var upd = db.payrollregistry_dtl_bac_tbl.Where(a => a.payroll_year == par_payroll_year && a.payroll_registry_nbr == par_payroll_registry_nbr  && a.empl_id == data.empl_id).FirstOrDefault();

                upd.empl_id         = data.empl_id        ;
                upd.gross_pay       = data.gross_pay      ;
                upd.net_pay         = data.net_pay        ;
                upd.wtax_perc       = data.wtax_perc      ;
                upd.wtax            = data.wtax           ;
                upd.updated_dttm    = DateTime.Now;
                upd.updated_by_user = Session["user_id"].ToString();

                message = "success";
                message_oth = cmn.CONST_EDITREC;
                db.SaveChanges();
                return Json(new { message, message_oth }, JsonRequestBehavior.AllowGet);
            }
            catch (DbUpdateException e)
            {
                string message_oth = "Data not Updated!";
                string message = e.InnerException.InnerException.Message;
                return Json(new { message, message_oth }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 2020-04-08
        // Description : Delete From Database
        //*********************************************************************//
        public ActionResult DeleteFromDatabase(string par_empl_id)
        {
            string[] preval = Session["PreviousValuesonPage_cSSBACPayReg"].ToString().Trim().Split(new char[] { ',' });
            var par_payroll_year         = preval[0].ToString();
            var par_payroll_registry_nbr = preval[7].ToString();
            var message = "";
            try
            {
                var dt = db.payrollregistry_dtl_bac_tbl.Where(a => a.payroll_year == par_payroll_year && a.payroll_registry_nbr == par_payroll_registry_nbr && a.empl_id == par_empl_id).FirstOrDefault();
                if (dt == null)
                {
                    message = "error";

                }
                else
                {
                    db.payrollregistry_dtl_bac_tbl.Remove(dt);
                    db.SaveChanges();
                    message = "success";
                }
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string messageflag = "";
                if (e is System.Data.Entity.Infrastructure.DbUpdateException)
                {
                    message = "Could not delete this record. The item was used as reference by other records.";
                }
                else if (e is DbEntityValidationException)
                {
                    message = e.Message;
                }
                else
                {
                    message = "Data already deleted by other user!";
                    messageflag = "0";
                }

                return Json(new { message = message, messageflag }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 2020-04-08
        // Description : Get the last Row of The Table
        //*********************************************************************//
        public ActionResult GetLastRow(string par_payroll_year)
        {
            var return_val = db.sp_get_next_registry_no(par_payroll_year).ToList().FirstOrDefault();
            return JSON(new { return_val }, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 2020-04-08
        // Description : Get the last Row of The Table
        //*********************************************************************//
        public ActionResult CheckIfExecuteGenerate(string p_payroll_year, string p_payroll_month)
        {
            var var_template_code = "980"; // This Template Code is For BAC Honorarium Regular
            var data = db.payrollregistry_hdr_tbl.Where(a => a.payroll_year == p_payroll_year && a.payroll_month == p_payroll_month && a.payrolltemplate_code == var_template_code).ToList();
            return JSON(new { data }, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 2020-04-08
        // Description : Get the last Row of The Table
        //*********************************************************************//
        public ActionResult ExecuteGenerate(string p_payroll_year, string p_payroll_month, bool p_delete_existing)
        {
            var generate = db.sp_payrollregistry_generate_bac(p_payroll_year, p_payroll_month, p_delete_existing, Session["user_id"].ToString()).ToList().FirstOrDefault();
            return JSON(new { generate }, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 2020-04-08
        // Description : Get the Template Code for this Template
        //*********************************************************************//
        public ActionResult RetrieveTemplate(string par_payrolltemplate_code)
        {
            var data = db.sp_payrollregistry_template_combolist(par_payrolltemplate_code).ToList();
            return JSON(new { data }, JsonRequestBehavior.AllowGet);
        }
    }
}