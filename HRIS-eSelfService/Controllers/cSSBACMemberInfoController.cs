//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for BAC Members Information
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// VINCENT JADE H. ALIVIO   2020-04-03      Code Creation
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
    public class cSSBACMemberInfoController : Controller
    {
        // GET: cSSBACMemberInfo
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        User_Menu um        = new User_Menu();
        CommonDB cmn        = new CommonDB();
        //*********************************************************************//
        // Created By : VJA - Created Date :2020-04-03
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
            
        }
        public ActionResult Index()
        {
            if (Session["id"] == null || Session["id"].ToString() == "")
            {
                return RedirectToAction("Index","Login");
            }
            else return View();
        }

        //*********************************************************************//
        // Created By : VJA - Created Date :2020-04-03
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
        // Created By : VJA - Created Date :2020-04-03
        // Description: Initialize Page
        //*********************************************************************//
        public ActionResult InitializePage(string par_include_history)
        {
            GetAllowAccess();
            var data        = db.sp_payroll_bac_info_tbl_list(par_include_history).ToList();
            var deplist     = db.sp_departments_tbl_list("N").ToList();
            return JSON(new { data, um, deplist }, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By : VJA - Created Date :2020-04-03
        // Description: Retrieve data in list Grid
        //*********************************************************************//
        public ActionResult RetreiveDataGrid(string par_include_history)
        {
            var data = db.sp_payroll_bac_info_tbl_list(par_include_history).ToList();
            return JSON(new { data }, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By : VJA - Created Date :2020-04-03
        // Description: Retrieve data in list Grid
        //*********************************************************************//
        public ActionResult RetrieveEmpl(string par_department_code)
        {
            var message = "";
            var emplist = db.sp_personnelnames_combolist_bac_info(par_department_code).ToList();
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
        // Created By  : VJA - Created Date : 02/25/2020
        // Description : Save From Database
        //*********************************************************************//
        public ActionResult SaveFromDatabase(payroll_bac_info_tbl data)
        {
            var message = "";
            var message_oth = "";
            try
            {
                message = "success";
                message_oth = cmn.CONST_NEWREC;
                db.payroll_bac_info_tbl.Add(data);
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
        // Created By  : VJA - Created Date : 02/25/2020
        // Description :Save Edit Data to database
        //*********************************************************************//
        public ActionResult UpdateFromDatabase(payroll_bac_info_tbl data)
        {
            try
            {
                var message = "";
                var message_oth = "";
                var upd = db.payroll_bac_info_tbl.Where(a => a.empl_id == data.empl_id && a.effective_date == data.effective_date).FirstOrDefault();
                
                upd.bac_position_descr  = data.bac_position_descr;
                upd.bac_position_class  = data.bac_position_class;
                upd.bac_allowance_amt   = data.bac_allowance_amt ;
                upd.rcrd_status         = data.rcrd_status       ;
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
        // Created By  : VJA - Created Date : 02/25/2020
        // Description : Delete From Database
        //*********************************************************************//
        public ActionResult DeleteFromDatabase(string par_empl_id, string par_effective_date)
        {
            var message = "";
            try
            {
                DateTime par_effective_date1 = Convert.ToDateTime(par_effective_date);
                var dt = db.payroll_bac_info_tbl.Where(a => a.empl_id == par_empl_id && a.effective_date == par_effective_date1).FirstOrDefault();
                if (dt == null)
                {
                    message = "error";
                }
                else
                {
                    db.payroll_bac_info_tbl.Remove(dt);
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