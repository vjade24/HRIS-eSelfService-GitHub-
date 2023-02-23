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
    public class cSSPHICCertSetupController : Controller
    {
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        User_Menu um = new User_Menu();
        // GET: cSSPHICCertSetup
        public ActionResult Index()
        {
            User_Menu um = new User_Menu();

            if (um != null || um.ToString() != "")
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
            }
            return View(um);
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
        // Created Date : 03/05/2020
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

                var department_list = db.vw_phic_share_dept_list.ToList();
                var phic_cert_list = db.sp_phic_cert_tbl_list().ToList();

                return JSON(new { message = "success", phic_cert_list, department_list, userid, allowAdd, allowDelete, allowEdit, allowPrint, allowView }, JsonRequestBehavior.AllowGet);
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
        public ActionResult Save(phic_cert_tbl data)
        {
            try
            {
                string message = "";
                var od = db.phic_cert_tbl.Where(a =>a.department_code == data.department_code).FirstOrDefault();
                if (od == null)
                {
                    db.phic_cert_tbl.Add(data);
                    db.SaveChangesAsync();
                    message = "success";
                }
                else
                {
                    message = "Dataa alredy exist!";
                }
                
                return Json(new { message }, JsonRequestBehavior.AllowGet);
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
        public ActionResult SaveEdit(phic_cert_tbl data)
        {
            try
            {
                var od = db.phic_cert_tbl.Where(a => a.department_code == data.department_code).FirstOrDefault();
                
                od.cert_descr       = data.cert_descr;
                od.sig1_name        = data.sig1_name;
                od.sig1_position    = data.sig1_position;
                od.sig2_name        = data.sig2_name;
                od.sig2_position    = data.sig2_position;
                od.sig3_name        = data.sig3_name;
                od.sig3_position    = data.sig3_position;

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
        public ActionResult Delete(string par_dept_code)
        {
            try
            {
                var od = db.phic_cert_tbl.Where(a => a.department_code == par_dept_code).FirstOrDefault();
                db.phic_cert_tbl.Remove(od);
                db.SaveChanges();
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
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