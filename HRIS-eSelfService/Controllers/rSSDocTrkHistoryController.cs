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
    public class rSSDocTrkHistoryController : Controller
    {
        HRIS_TRKEntities db = new HRIS_TRKEntities();
        HRIS_DEVEntities db2 = new HRIS_DEVEntities();
        User_Menu um = new User_Menu();
        public ActionResult Index()
        {
            if (um != null || um.ToString() != "")
            {
                try
                {
                    GetAllowAccess();
                }

                catch (Exception e)
                {
                    string msg = e.Message;
                    return RedirectToAction("Index", "Login");
                }
                //Session["empl_id"] = "9595";
            }
            return View(um);

        }
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
        public ActionResult InitializeData(string par_year)
        {
            var message = "";
            var empl_id = Session["empl_id"].ToString();
            try
            {
                var trk_details = db.sp_document_tracking_tbl_list(par_year, empl_id).ToList();
                message = "success";
                return Json(new { message, trk_details }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);

                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }

        }

        public ActionResult ChangeYear(string par_year)
        {
            var message = "";
            var empl_id = Session["empl_id"].ToString();
            try
            {
                var trk_details = db.sp_document_tracking_tbl_list(par_year, empl_id).ToList();
                message = "success";
                return Json(new { message, trk_details }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);

                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }

        }
        //*********************************************************************//
        // Created By : VJA - Created Date : 01/21/2020
        // Description: Populate Employment Type
        ////*********************************************************************//
        public ActionResult RetrieveDocHistory(string par_doc_ctrl_nbr)
        {
            var message = "";
            try
            {
               // var doctype = db.vw_edocument_trk_tbl_current.Where(a => a.doc_ctrl_nbr == par_doc_ctrl_nbr).FirstOrDefault().docmnt_type;
                var doctype = "01";
                var sp_document_tracking_tbl_history = db.sp_edocument_trk_tbl_history(par_doc_ctrl_nbr, doctype).ToList();

                if (sp_document_tracking_tbl_history.Count > 0)
                {
                    message = "success";
                    Session["history_page"] = Request.UrlReferrer.ToString();
                }
                else
                {
                    message = "No Data for Cash Advance";
                    Session["history_page"] = Request.UrlReferrer.ToString();
                }
                return Json(new { sp_document_tracking_tbl_history, message, doctype }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                Session["history_page"] = Request.UrlReferrer.ToString();
                return Json(new { message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public String DbEntityValidationExceptionError(DbEntityValidationException e)
        {
            string message = "";
            foreach (var eve in e.EntityValidationErrors)
            {
                Console.WriteLine("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
                    eve.Entry.Entity.GetType().Name, eve.Entry.State);
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