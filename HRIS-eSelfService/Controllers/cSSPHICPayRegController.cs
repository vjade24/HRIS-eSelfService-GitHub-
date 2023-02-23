//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for PHIC Payroll Registry
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JOSEPH M. TOMBO JR.       03/03/2020      Code Creation
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

    public class cSSPHICPayRegController : Controller
    {

        HRIS_DEVEntities db = new HRIS_DEVEntities();
        User_Menu um        = new User_Menu();
        CommonDB cmn = new CommonDB();
        //*********************************************************************//
        // Created By : JMTJR - Created Date : 03/04/2020
        // Description: Get the User Role
        //*********************************************************************//
        public void GetAllowAccess()
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
            // Session["PreviousValuesonPage_cSSPHICPayReg"] = "";
            //Session["session_image_byte"] = string.Empty;
        }


        // GET: cSSPHICPayReg
        public ActionResult Index()
        {
            if (Session["id"] == null || Session["id"].ToString() == "")
            {
                return RedirectToAction("Index","Login");
            }
            else return View();
        }

        //*********************************************************************//
        // Created By : JMTJR - Created Date : 03/04/2020
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
        // Created By : JMTJR - Created Date : 03/04/2020
        // Description: Initialize Page
        //*********************************************************************//
        public ActionResult InitializePage(string pay_year, string pay_month, string group_class, string department_code)
        {
            GetAllowAccess();
            try
            {
                if (Session["PreviousValuesonPage_cSSPHICPayReg"].ToString() != "" ||
                Session["PreviousValuesonPage_cSSPHICPayReg"].ToString() != null)
                {
                    string[] session_val = Session["PreviousValuesonPage_cSSPHICPayReg"].ToString().Split(',');

                    var data = db.sp_payrollregistry_hdr_phic_tbl_list(session_val[0].ToString(), session_val[1].ToString(), session_val[3].ToString(), session_val[12].ToString()).ToList();
                    var employment_types_lst = db.vw_employmenttypes_tbl_list.ToList();
                    var deplist = db.vw_phic_share_dept_list.ToList();
                    var dep_list = db.sp_departments_tbl_list("N").ToList();
                    var func_list = db.sp_functions_tbl_list().ToList();
                    return JSON(new { data, um, employment_types_lst, deplist, session_val, dep_list, func_list }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    string session_val = "";
                    var data = db.sp_payrollregistry_hdr_phic_tbl_list(pay_year, pay_month, group_class, department_code).ToList();
                    var employment_types_lst = db.vw_employmenttypes_tbl_list.ToList();
                    var deplist = db.vw_phic_share_dept_list.ToList();
                    var dep_list = db.sp_departments_tbl_list("N").ToList();
                    var func_list = db.sp_functions_tbl_list().ToList();
                    return JSON(new { data, um, employment_types_lst, deplist, session_val, dep_list, func_list }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception)
            {
                string session_val = "";
                var data = db.sp_payrollregistry_hdr_phic_tbl_list(pay_year, pay_month, group_class, department_code).ToList();
                var employment_types_lst = db.vw_employmenttypes_tbl_list.ToList();
                var deplist = db.vw_phic_share_dept_list.ToList();
                var dep_list = db.sp_departments_tbl_list("N").ToList();
                var func_list = db.sp_functions_tbl_list().ToList();
                return JSON(new { data, um, employment_types_lst, deplist, session_val, dep_list, func_list }, JsonRequestBehavior.AllowGet);
            }
            
        }


        //*********************************************************************//
        // Created By : JMTJR - Created Date : 03/04/2020
        // Description: Retrieve data in list Grid
        //*********************************************************************//
        public ActionResult RetreiveDataGrid(string pay_year, string pay_month, string group_class, string department_code)
        {
            var data = db.sp_payrollregistry_hdr_phic_tbl_list(pay_year, pay_month, group_class, department_code).ToList();
            return JSON(new { data }, JsonRequestBehavior.AllowGet);
        }

        public String DbEntityValidationExceptionError(DbEntityValidationException e)
        {
            string message = "";
            foreach (var eve in e.EntityValidationErrors)
            {
                Console.WriteLine("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:", eve.Entry.Entity.GetType().Name, eve.Entry.State);

                foreach (var ve in eve.ValidationErrors)
                {
                    message = "- Property: \"{0}\", Error: \"{1}\"" + ve.PropertyName + "  :  " + ve.ErrorMessage;
                    Console.WriteLine("- Property: \"{0}\", Error: \"{1}\"",
                        ve.PropertyName, ve.ErrorMessage);
                }
            }
            return message;
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
                var rep = db.sp_payrollregistry_phic_share_rep(par_payroll_year, par_payroll_registry_nbr).ToList();
                if (rep.Count > 0)
                {
                    message = "sucess";
                }
                else
                {
                    message = "no data found";
                }
                Session["history_page"] = Request.UrlReferrer.ToString();
                return Json(new { message, rep }, JsonRequestBehavior.AllowGet);
            }
            catch (DbUpdateException e)
            {
                Session["history_page"] = Request.UrlReferrer.ToString();
                message = e.InnerException.InnerException.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }

        }
        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description: Extract Data 
        //*********************************************************************//
        public ActionResult PreviousValuesonPage_cSSPHICPayReg
            (
             string  par_year                        
            , string par_month                       
            , string par_month_descr                 
            , string par_group_class                 
            , string par_group_class_descr
            , string par_group_code
            , string par_group_code_descr
            , string par_payrolltemplate_code        
            , string par_payrolltemplate_code_descr  
            , string par_payroll_registry_nbr        
            , string par_post_status                 
            , string par_post_status_descr
            , string par_department_code      
            , string par_department_code_descr
            , string par_show_entries                
            , string par_page_nbr                    
            , string par_search
            )
        {
            var PreviousValuesonPage_cSSPHICPayReg =    par_year
                                                + "," + par_month
                                                + "," + par_month_descr
                                                + "," + par_group_class
                                                + "," + par_group_class_descr
                                                + "," + par_group_code
                                                + "," + par_group_code_descr
                                                + "," + par_payrolltemplate_code
                                                + "," + par_payrolltemplate_code_descr
                                                + "," + par_payroll_registry_nbr
                                                + "," + par_post_status
                                                + "," + par_post_status_descr
                                                + "," + par_department_code
                                                + "," + par_department_code_descr
                                                + "," + par_show_entries
                                                + "," + par_page_nbr
                                                + "," + par_search;

            Session["history_page"]                       = Request.UrlReferrer.ToString();
            Session["PreviousValuesonPage_cSSPHICPayReg"] = PreviousValuesonPage_cSSPHICPayReg;
            return Json(PreviousValuesonPage_cSSPHICPayReg, JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By  : VJA - Created Date : 02/29/2020
        // Description :Save Edit Data to database
        //*********************************************************************//
        public ActionResult PrintBreakdownReports(string p_payroll_year, string p_payroll_month, string p_department_code)
        {
            var message = "";
            try
            {
                var rep = db.sp_payrollregistry_phic_share_brkdwn_rep(p_payroll_year, p_payroll_month, p_department_code).ToList();
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
        //*********************************************************************//
        // Created By  : VJA - Created Date : 2020-04-07
        // Description :Save Edit Data to database
        //*********************************************************************//
        public ActionResult UpdateFromDatabase(payrollregistry_hdr_tbl data)
        {
            try
            {
                var var_default_date = "1990-01-01";
                DateTime default_date = Convert.ToDateTime(var_default_date);

                var message = "";
                var message_oth = "";
                var upd = db.payrollregistry_hdr_tbl.Where(a => a.payroll_year == data.payroll_year && a.payroll_registry_nbr == data.payroll_registry_nbr).FirstOrDefault();
                
                // upd.payroll_dttm_updated = DateTime.Now;
                // upd.user_id_updated_by = Session["user_id"].ToString();

                upd.department_code = data.department_code;
                upd.function_code   = data.function_code;
                upd.allotment_code  = data.allotment_code;

                upd.payroll_registry_descr  = data.payroll_registry_descr ;
                upd.payroll_period_from     = data.payroll_period_from    ;
                upd.payroll_period_to       = data.payroll_period_to      ;

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
        // Created By  : VJA - Created Date : 02/29/2020
        // Description :Save Edit Data to database
        //*********************************************************************//
        public ActionResult RetrieveAllReports(string par_payroll_year, string par_payroll_registry_nbr)
        {
            var message = "";
            try
            {
                var rep = db.sp_payrollregistry_phic_share_rep(par_payroll_year, par_payroll_registry_nbr).ToList();
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
        //*********************************************************************//
        // Created By  : VJA - Created Date : 02/29/2020
        // Description :Save Edit Data to database
        //*********************************************************************//
        public ActionResult ReGenerate_PHIC(string p_payroll_year, string p_payroll_month, string p_department_code, bool p_delete_existing, string p_user_id, string p_payroll_group_nbr, string p_payroll_registry_nbr)
        {
            var message = "";
            try
            {
                p_delete_existing = true;
                p_user_id         = Session["user_id"].ToString();
                var regen = db.sp_payrollregistry_generate_phic_regen(p_payroll_year, p_payroll_month, p_department_code, p_delete_existing, p_user_id, p_payroll_group_nbr, p_payroll_registry_nbr).ToList();
                if (regen.Count > 0)
                {
                    message = "success";
                }
                else
                {
                    message = "no data found";
                }
                return Json(new { message,regen }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                message = e.InnerException.InnerException.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }

        }

    }
}