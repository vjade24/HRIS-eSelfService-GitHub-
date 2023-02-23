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
    public class cSSPHICPayReg_DTLController : Controller
    {
        // GET: cSSPHICPayReg_DTL
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        User_Menu um = new User_Menu();
        CommonDB cmn = new CommonDB();
        //*********************************************************************//
        // Created By : JMTJR - Created Date : 03/04/2020
        // Description: Get the User Role
        //*********************************************************************//
        public void GetAllowAccess()
        {
            um.allow_add = (int)Session["allow_add"];
            um.allow_delete = (int)Session["allow_delete"];
            um.allow_edit = (int)Session["allow_edit"];
            um.allow_edit_history = (int)Session["allow_edit_history"];
            um.allow_print = (int)Session["allow_print"];
            um.allow_view = (int)Session["allow_view"];
            um.url_name = Session["url_name"].ToString();
            um.id = (int)Session["id"];
            um.menu_name = Session["menu_name"].ToString();
            um.page_title = Session["page_title"].ToString();

            //Session["session_image_byte"] = string.Empty;
        }


        // GET: cSSPHICPayReg
        public ActionResult Index()
        {
            if (Session["id"] == null || Session["id"].ToString() == "")
            {
                return RedirectToAction("Index", "Login");
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
                Data = data,
                ContentType = "application/json",
                ContentEncoding = Encoding.UTF8,
                JsonRequestBehavior = behavior,
                MaxJsonLength = Int32.MaxValue
            };
        }

        //*********************************************************************//
        // Created By : JMTJR - Created Date : 03/04/2020
        // Description: Initialize Page
        //*********************************************************************//
        public ActionResult InitializePage()
        {
            // ----- SESSION ----------------
            // preval[ 0] - par_year
            // preval[ 1] - par_month
            // preval[ 2] - par_month_descr
            // preval[ 3] - par_group_class
            // preval[ 4] - par_group_class_descr
            // preval[ 5] - par_group_code
            // preval[ 6] - par_group_code_descr
            // preval[ 7] - par_payrolltemplate_code
            // preval[ 8] - par_payrolltemplate_code_descr
            // preval[ 9] - par_payroll_registry_nbr
            // preval[10] - par_post_status
            // preval[11] - par_post_status_descr
            // preval[12] - par_department_code      
            // preval[13] - par_department_code_descr
            // preval[14] - par_show_entries
            // preval[15] - par_page_nbr
            // preval[16] - par_search

            GetAllowAccess();
            string[] preval = Session["PreviousValuesonPage_cSSPHICPayReg"].ToString().Split(new char[] { ',' });
            var data  = db.sp_payrollregistry_dtl_phic_tbl_list(preval[0].ToString(), preval[1].ToString(), preval[9].ToString(), preval[5].ToString(), preval[12].ToString()).ToList();
            var deplist = db.vw_phic_share_dept_list.ToList();
            
            return JSON(new { data, um, preval, deplist }, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description: Extract Data 
        //*********************************************************************//
        public ActionResult PreviousValuesonPage_cSSPHICPayReg
            (
             string par_year
            , string par_month
            , string par_month_descr
            , string par_group_class
            , string par_group_class_descr
            , string par_payrolltemplate_code
            , string par_payrolltemplate_code_descr
            , string par_payroll_registry_nbr
            , string par_post_status
            , string par_post_status_descr
            , string par_show_entries
            , string par_page_nbr
            , string par_search
            )
        {
            var PreviousValuesonPage_cSSPHICPayReg = par_year
                                                + "," + par_month
                                                + "," + par_month_descr
                                                + "," + par_group_class
                                                + "," + par_group_class_descr
                                                + "," + par_payrolltemplate_code
                                                + "," + par_payrolltemplate_code_descr
                                                + "," + par_payroll_registry_nbr
                                                + "," + par_post_status
                                                + "," + par_post_status_descr
                                                + "," + par_show_entries
                                                + "," + par_page_nbr
                                                + "," + par_search;

            Session["history_page"] = Request.UrlReferrer.ToString();
            Session["PreviousValuesonPage_cSSPHICPayReg"] = PreviousValuesonPage_cSSPHICPayReg;
            return Json(PreviousValuesonPage_cSSPHICPayReg, JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By  : VJA - Created Date : 02/29/2020
        // Description :Save Edit Data to database
        //*********************************************************************//
        public ActionResult UpdateFromDatabase(payrollregistry_dtl_phic_tbl data)
        {
            try
            {
                var upd = db.payrollregistry_dtl_phic_tbl.Where(a => a.payroll_year == data.payroll_year && a.payroll_registry_nbr == data.payroll_registry_nbr && a.empl_id == data.empl_id).FirstOrDefault();
                
                upd.empl_no_share   = data.empl_no_share  ;
                upd.gross_pay       = data.gross_pay      ;
                upd.net_pay         = data.net_pay        ;
                upd.wtax_perc       = data.wtax_perc      ;
                upd.wtax            = data.wtax           ;
                upd.btax_perc       = data.btax_perc      ;
                upd.btax            = data.btax           ;
                // upd.created_dttm    = data.created_dttm   ;
                // upd.created_by_user = data.created_by_user;
                upd.updated_by_user = Session["user_id"].ToString();
                upd.updated_dttm    = DateTime.Now;
                upd.wtax_2perc      = data.wtax_2perc     ;
                upd.wtax_3perc      = data.wtax_3perc     ;
                upd.wtax_5perc      = data.wtax_5perc     ;
                upd.wtax_8perc      = data.wtax_8perc     ;
                upd.wtax_10perc     = data.wtax_10perc    ;
                upd.wtax_15perc     = data.wtax_15perc    ;
                
                db.SaveChanges();
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbUpdateException e)
            {
                string message = e.InnerException.InnerException.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : VJA - Created Date :2020-04-08
        // Description: Retrieve data in list Grid
        //*********************************************************************//
        public ActionResult RetrieveEmpl()
        {
            string[] preval = Session["PreviousValuesonPage_cSSPHICPayReg"].ToString().Split(new char[] { ',' });
            
            var message = "";
            var emplist = db.sp_personnelnames_combolist_phic(preval[0].ToString(), preval[1].ToString(), preval[12].ToString(), preval[5].ToString()).ToList();
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
        public ActionResult SaveFromDatabase(payrollregistry_dtl_phic_tbl data)
        {
            // ----- SESSION ----------------
            // preval[ 0] - par_year
            // preval[ 1] - par_month
            // preval[ 2] - par_month_descr
            // preval[ 3] - par_group_class
            // preval[ 4] - par_group_class_descr
            // preval[ 5] - par_group_code
            // preval[ 6] - par_group_code_descr
            // preval[ 7] - par_payrolltemplate_code
            // preval[ 8] - par_payrolltemplate_code_descr
            // preval[ 9] - par_payroll_registry_nbr
            // preval[10] - par_post_status
            // preval[11] - par_post_status_descr
            // preval[12] - par_department_code      
            // preval[13] - par_department_code_descr
            // preval[14] - par_show_entries
            // preval[15] - par_page_nbr
            // preval[16] - par_search

            GetAllowAccess();
            string[] preval = Session["PreviousValuesonPage_cSSPHICPayReg"].ToString().Split(new char[] { ',' });
            
            var par_payroll_year         = preval[0].ToString();
            var par_payroll_registry_nbr = preval[9].ToString();
            var message = "";
            var message_oth = "";
            try
            {
                var var_default_date = "1990-01-01";
                DateTime default_date = Convert.ToDateTime(var_default_date);
                data.payroll_year          = par_payroll_year          ;
                data.payroll_registry_nbr  = par_payroll_registry_nbr  ;
                data.empl_id               = data.empl_id         ;
                data.empl_no_share         = data.empl_no_share   ;
                data.gross_pay             = data.gross_pay       ;
                data.net_pay               = data.net_pay         ;
                data.wtax_perc             = data.wtax_perc       ;
                data.wtax                  = data.wtax            ;
                data.btax_perc             = data.btax_perc       ;
                data.btax                  = data.btax            ;
                data.created_dttm          = DateTime.Now;
                data.created_by_user       = Session["user_id"].ToString();
                data.wtax_2perc            = data.wtax_2perc      ;
                data.wtax_3perc            = data.wtax_3perc      ;
                data.wtax_5perc            = data.wtax_5perc      ;
                data.wtax_8perc            = data.wtax_8perc      ;
                data.wtax_10perc           = data.wtax_10perc     ;
                data.wtax_15perc           = data.wtax_15perc     ;

                message = "success";
                message_oth = cmn.CONST_NEWREC;
                db.payrollregistry_dtl_phic_tbl.Add(data);
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
        // Description : Delete From Database
        //*********************************************************************//
        public ActionResult DeleteFromDatabase(string par_empl_id)
        {
            string[] preval = Session["PreviousValuesonPage_cSSPHICPayReg"].ToString().Split(new char[] { ',' });
            
            var par_payroll_year         = preval[0].ToString();
            var par_payroll_registry_nbr = preval[9].ToString();
            var message = "";
            try
            {
                var dt = db.payrollregistry_dtl_phic_tbl.Where(a => a.payroll_year == par_payroll_year && a.payroll_registry_nbr == par_payroll_registry_nbr && a.empl_id == par_empl_id).FirstOrDefault();
                if (dt == null)
                {
                    message = "error";

                }
                else
                {
                    db.payrollregistry_dtl_phic_tbl.Remove(dt);
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

    }
}