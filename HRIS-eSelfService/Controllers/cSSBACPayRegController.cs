//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for BAC Payroll Registry Header
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// VINCENT JADE H. ALIVIO   2020-04-07      Code Creation
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
    public class cSSBACPayRegController : Controller
    {
        // GET: cSSBACPayReg
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        User_Menu um        = new User_Menu();
        CommonDB cmn        = new CommonDB();
        //*********************************************************************//
        // Created By : VJA - Created Date : 2020-04-07
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
                return RedirectToAction("Index","Login");
            }
            else return View();
        }

        //*********************************************************************//
        // Created By : VJA - Created Date :2020-04-07
        // Description : DATA CONVERTION FOR JSON
        //*********************************************************************//
        protected ActionResult JSON(object data, JsonRequestBehavior behavior)
        {
            return new JsonResult()
            {
                Data                = data,
                ContentType         = "application/json",
                ContentEncoding     = Encoding.UTF8,
                JsonRequestBehavior = behavior,
                MaxJsonLength       = Int32.MaxValue
            };
        }
        //*********************************************************************//
        // Created By : VJA - Created Date :2020-04-07
        // Description: Initialize Page
        //*********************************************************************//
        public ActionResult InitializePage(string par_payroll_year)
        {
            GetAllowAccess();
            //if (Session["PreviousValuesonPage_cSSBACPayReg"].ToString() != "" ||
            //    Session["PreviousValuesonPage_cSSBACPayReg"].ToString() != null)
            //{
            //    string[] prev_val_data = Session["PreviousValuesonPage_cSSBACPayReg"].ToString().Split(',');
            //    var data = db.sp_payrollregistry_hdr_bac_tbl_list(prev_val_data[0].ToString()).ToList();
            //    return JSON(new { data, um, prev_val_data }, JsonRequestBehavior.AllowGet);
            //}
            //else
            //{
                string[] prev_val_data = null;
                var dep_list    = db.sp_departments_tbl_list("N").ToList();
                var func_list   = db.sp_functions_tbl_list().ToList();
                var data = db.sp_payrollregistry_hdr_bac_tbl_list(par_payroll_year).ToList();
                return JSON(new { data, um, prev_val_data, dep_list, func_list }, JsonRequestBehavior.AllowGet);
            //}
        }
        //*********************************************************************//
        // Created By : VJA - Created Date :2020-04-07
        // Description: Retrieve data in list Grid
        //*********************************************************************//
        public ActionResult RetreiveDataGrid(string par_payroll_year)
        {
            var data = db.sp_payrollregistry_hdr_bac_tbl_list(par_payroll_year).ToList();
            return JSON(new { data }, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By : VJA - Created Date :2020-04-07
        // Description: Retrieve data in list Grid
        //*********************************************************************//
        //public ActionResult RetrieveEmpl(string par_department_code)
        //{
        //    var message = "";
        //    var emplist = db.sp_personnelnames_combolist_bac_info(par_department_code).ToList();
        //    if (emplist.Count > 0)
        //    {
        //        message = "success";
        //    }
        //    else
        //    {
        //        message = "no-data-found";
        //    }
        //    return JSON(new { emplist, message }, JsonRequestBehavior.AllowGet);
        //}
        //*********************************************************************//
        // Created By  : VJA - Created Date : 2020-04-07
        // Description : Save From Database
        //*********************************************************************//
        public ActionResult SaveFromDatabase(payrollregistry_hdr_tbl data)
        {
            var message = "";
            var message_oth = "";
            try
            {
                var var_default_date  = "1990-01-01";
                DateTime default_date = Convert.ToDateTime(var_default_date);

                data.payrolltemplate_code = "951"; // This Template Code is For BAC Honorarium Regular
                data.payroll_dttm_created = DateTime.Now;
                data.payroll_dttm_updated = default_date;
                data.user_id_created_by   = Session["user_id"].ToString();
                data.user_id_updated_by   = "";
                data.date_posted          = default_date;
                data.department_code      = data.department_code;
                data.function_code        = data.function_code;
                data.allotment_code       = data.allotment_code;
                
                message     = "success";
                message_oth = cmn.CONST_NEWREC;
                db.payrollregistry_hdr_tbl.Add(data);
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
        // Created By  : VJA - Created Date : 2020-04-07
        // Description :Save Edit Data to database
        //*********************************************************************//
        public ActionResult UpdateFromDatabase(payrollregistry_hdr_tbl data)
        {
            try
            {
                var var_default_date   = "1990-01-01";
                DateTime default_date = Convert.ToDateTime(var_default_date);

                var message = "";
                var message_oth = "";
                var upd = db.payrollregistry_hdr_tbl.Where(a => a.payroll_year == data.payroll_year && a.payroll_registry_nbr == data.payroll_registry_nbr).FirstOrDefault();
                
                upd.payroll_year           = data.payroll_year          ;
                upd.payroll_month          = data.payroll_month         ;
                upd.payroll_registry_nbr   = data.payroll_registry_nbr  ;
                upd.payrolltemplate_code   = "951"; // This Template Code is For BAC Honorarium Regular
                upd.payroll_registry_descr = data.payroll_registry_descr;
                upd.payroll_period_from    = data.payroll_period_from   ;
                upd.payroll_period_to      = data.payroll_period_to     ;
                upd.nod_work_1st           =  0;
                upd.nod_work_2nd           =  0;
                //upd.post_status            = default_date;
                upd.payroll_dttm_updated   = DateTime.Now;
                upd.user_id_updated_by     = Session["user_id"].ToString();

                upd.department_code        = data.department_code;
                upd.function_code          = data.function_code;
                upd.allotment_code         = data.allotment_code;
                
                message     = "success";
                message_oth = cmn.CONST_EDITREC;
                db.SaveChanges();
                return Json(new { message, message_oth }, JsonRequestBehavior.AllowGet);
            }
            catch (DbUpdateException e)
            {
                string message_oth = "Data not Updated!";
                string message = e.InnerException.InnerException.Message;
                return Json(new { message , message_oth }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 2020-04-07
        // Description : Delete From Database
        //*********************************************************************//
        public ActionResult DeleteFromDatabase(string par_payroll_year, string par_payroll_registry_nbr)
        {
            var message = "";
            try
            {
                // DateTime par_effective_date1 = Convert.ToDateTime(par_effective_date);
                var dt = db.payrollregistry_hdr_tbl.Where(a => a.payroll_year == par_payroll_year && a.payroll_registry_nbr == par_payroll_registry_nbr).FirstOrDefault();
                // Delete Also the Details
                var dtl = db.payrollregistry_dtl_bac_tbl.Where(a => a.payroll_year == par_payroll_year && a.payroll_registry_nbr == par_payroll_registry_nbr).ToList();

                if (dt == null)
                {
                    message = "error";

                }
                else
                {
                    db.payrollregistry_hdr_tbl.Remove(dt);
                    db.payrollregistry_dtl_bac_tbl.RemoveRange(dtl);
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
        // Created By  : VJA - Created Date : 2020-04-07
        // Description : Get the last Row of The Table
        //*********************************************************************//
        public ActionResult GetLastRow(string par_payroll_year)
        {
            var return_val = db.sp_get_next_registry_no(par_payroll_year).ToList().FirstOrDefault();
            return JSON(new { return_val }, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 2020-04-07
        // Description : Get the last Row of The Table
        //*********************************************************************//
        public ActionResult CheckIfExecuteGenerate(string p_payroll_year, string p_payroll_month, string p_payroll_registry_nbr)
        {
            var var_template_code = "951"; // This Template Code is For BAC Honorarium Regular
            var data = db.payrollregistry_hdr_tbl.Where(a => a.payroll_year == p_payroll_year && a.payroll_month == p_payroll_month && a.payrolltemplate_code == var_template_code && a.payroll_registry_nbr == p_payroll_registry_nbr).ToList();
            return JSON(new { data }, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 2020-04-07
        // Description : Get the last Row of The Table
        //*********************************************************************//
        public ActionResult ExecuteGenerate(string p_payroll_year, string p_payroll_month, bool p_delete_existing)
        {
            var generate = db.sp_payrollregistry_generate_bac(p_payroll_year, p_payroll_month, p_delete_existing, Session["user_id"].ToString()).ToList().FirstOrDefault();
            return JSON(new { generate }, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 2020-04-07
        // Description : Get the Template Code for this Template
        //*********************************************************************//
        public ActionResult RetrieveTemplate(string par_payrolltemplate_code)
        {
            var data = db.sp_payrollregistry_template_combolist(par_payrolltemplate_code).ToList();
            return JSON(new { data }, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 2020-04-07
        // Description : Get Previous Value
        //*********************************************************************//
        public ActionResult PreviousValuesonPage
            (string par_year
            ,string par_month
            ,string par_month_descr
            ,string par_group_code
            ,string par_group_code_descr
            ,string par_payrolltemplate_code
            ,string par_payrolltemplate_code_descr
            ,string par_payroll_registry_nbr
            ,string par_post_status
            ,string par_post_status_descr
            ,string par_show_entries
            ,string par_page_nbr
            ,string par_search)
        {
            var prev_val_data = par_year
                        + "," + par_month
                        + "," + par_month_descr
                        + "," + par_group_code
                        + "," + par_group_code_descr
                        + "," + par_payrolltemplate_code
                        + "," + par_payrolltemplate_code_descr
                        + "," + par_payroll_registry_nbr
                        + "," + par_post_status
                        + "," + par_post_status_descr
                        + "," + par_show_entries
                        + "," + par_page_nbr
                        + "," + par_search;

            Session["history_page"]                      = Request.UrlReferrer.ToString();
            Session["PreviousValuesonPage_cSSBACPayReg"] = prev_val_data;
            return JSON(prev_val_data, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 02/29/2020
        // Description :Save Edit Data to database
        //*********************************************************************//
        public ActionResult RetrieveReports(string par_payroll_year, string par_payroll_registry_nbr)
        {
            var message = "";
            try
            {
                var rep = db.sp_payrollregistry_bac_rep(par_payroll_year, par_payroll_registry_nbr).ToList();
                if (rep.Count > 0)
                {
                    message = "sucess";
                }
                else
                {
                    message = "no data found";
                }
                Session["history_page"] = Request.UrlReferrer.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (DbUpdateException e)
            {
                Session["history_page"] = Request.UrlReferrer.ToString();
                message = e.InnerException.InnerException.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************
        //*********************E N D  C O D E *********************************
        //*********************************************************************
    }
}