using HRIS_eSelfService.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eSelfService.Controllers
{
    public class rSSTicketsController : Controller
    {
        HRIS_DEVEntities db_dev = new HRIS_DEVEntities();
        HRIS_TRKEntities db = new HRIS_TRKEntities();
        User_Menu um = new User_Menu();
        // GET: rSSTickets
        public ActionResult Index()
        {
            User_Menu um = new User_Menu();

            if (um != null || um.ToString() != "")
            {
                um.allow_add    = (int)Session["allow_add"];
                um.allow_delete = (int)Session["allow_delete"];
                um.allow_edit   = (int)Session["allow_edit"];
                um.allow_edit_history = (int)Session["allow_edit_history"];
                um.allow_print  = (int)Session["allow_print"];
                um.allow_view   = (int)Session["allow_view"];
                um.url_name     = Session["url_name"].ToString();
                um.id           = (int)Session["id"];
                um.menu_name    = Session["menu_name"].ToString();
                um.page_title   = Session["page_title"].ToString();
            }
            return View(um);
        }
        public ActionResult UserAccessOnPage(int id)
        {
            Session["user_menu_id"] = id;
            return Json("success", JsonRequestBehavior.AllowGet);
        }
        protected JsonResult JSON(object data, JsonRequestBehavior behavior)
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
        // Created By   : Lorraine I. Ale 
        // Created Date : 02/13/2020
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult InitializeData()
        {
            try
            {
                string userid       = Session["user_id"].ToString();
                string allowAdd     = Session["allow_add"].ToString();
                string allowDelete  = Session["allow_delete"].ToString();
                string allowEdit    = Session["allow_edit"].ToString();
                string allowPrint   = Session["allow_print"].ToString();
                string allowView    = Session["allow_view"].ToString();
                string role_id      = Session["role_id"].ToString();
                var user_info       = db_dev.sp_userprofile_tbl(userid).FirstOrDefault();

                var moduleLst    = db.sp_modules_tbl_list_TRK().ToList();
                var statuslst    = db.sp_tck_status_list().ToList();
                var typeLst      = db.sp_tck_type_list().ToList();
                
                return JSON(new { message = "success", userid, moduleLst, statuslst, typeLst, user_info, role_id, allowAdd, allowDelete, allowEdit, allowPrint, allowView }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 03/02/2020
        // Description  : Get last code 
        //*********************************************************************//
        public ActionResult GetLasCode(string par_year, string par_month)
        {
            try
            {
                string message = "";
                //var ids = "";
                var check_tbl = db.sp_tck_nbr_list(par_year, par_month).ToList();
                if (check_tbl == null || check_tbl.Count == 0)
                {
                    var ids = "";
                    message = "";
                    return Json(new { ids, message }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    var ids = db.sp_tck_nbr_list(par_year, par_month).ToList().Last();
                    message = "success";
                    return Json(new { ids, message }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 03/02/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult FilterPageGrid(
            byte par_module_id,
            int par_year,
            int par_month,
            string par_status)
        {
            try
            {
                var filteredGrid = db.sp_tck_log_tbl_list(par_module_id, par_year, par_month, par_status).ToList();
                var vwAssigned = db.vw_modules_assign_tbl.Where(a => a.module_id == par_module_id).ToList();

                return JSON(new { message = "success", filteredGrid, vwAssigned }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 02/29/2020
        // Description  : Add new record to leave sub-type table
        //*********************************************************************//
        public ActionResult Save(tck_log_tbl data)
        {
            try
            {
                db.tck_log_tbl.Add(data);
                db.SaveChangesAsync();
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 03/02/2020
        // Description  : Edit existing record table
        //*********************************************************************//
        public ActionResult SaveEdit(tck_log_tbl data)
        {
            try
            {
                var od = db.tck_log_tbl.Where(a => a.tck_nbr == data.tck_nbr).FirstOrDefault();

                od.tck_description      = data.tck_description;
                od.tck_details          = data.tck_details;
                od.tck_type             = data.tck_type;
                od.tck_status           = data.tck_status;
                od.assigned_user_id     = data.assigned_user_id;
                od.resolved_dttm        = data.resolved_dttm;
                od.resolution_details   = data.resolution_details;
                //od.reported_user_id     = data.reported_user_id;
                //od.reported_dttm        = data.reported_dttm;
                //od.module_id            = data.module_id;
                //od.assigned_dttm        = data.assigned_dttm;

                db.SaveChanges();

                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 01/13/2020
        // Description  : delete from leave sub-type table
        //*********************************************************************//
        public ActionResult Delete(string par_tck_nbr)
        {
            try
            {
                string message = "";
                var od = db.tck_log_tbl.Where(a => a.tck_nbr == par_tck_nbr).FirstOrDefault();
                if (od != null)
                {
                    db.tck_log_tbl.Remove(od);
                    db.SaveChanges();
                    message = "success";
                }
                else
                {
                    message = "";
                }

                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);

                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
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
    }
}