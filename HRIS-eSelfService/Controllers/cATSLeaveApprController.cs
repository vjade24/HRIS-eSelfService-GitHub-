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
    public class cATSLeaveApprController : Controller
    {
        HRIS_ATSEntities db = new HRIS_ATSEntities();
        HRIS_DEVEntities db_dev = new HRIS_DEVEntities();
        User_Menu um = new User_Menu();
        // GET: cATSLeaveAppr
        public ActionResult Index()
        {
            if (um != null || um.ToString() != "")
            {
                GetAllowAccess();
            }
            return View(um);
        }
        private User_Menu GetAllowAccess()
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
            um.user_id              = Session["user_id"].ToString();

            return um;

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
        // Created Date : 01/20/2020
        // Description  : Initialized during leave type pageload
        //*********************************************************************//
        public ActionResult InitializeData(string par_year)
        {
            try
            {
                var um = GetAllowAccess();

                var leaveType                       = db.sp_leavetype_tbl_list().ToList();
                var leaveSubType                    = db.sp_leavesubtype_tbl_list("").ToList();
                var leave_application_for_approval  = db.sp_leave_application_for_approval_list(Session["user_id"].ToString(), par_year, "N").ToList();
                var empl_name_search                = db.sp_travelorder_search_names((DateTime.Now.ToString("yyyy")), (DateTime.Now.ToString("MM"))).ToList();
                //var dept_list = db_dev.vw_departments_tbl_list.ToList();
                //var employment_type = db_dev.sp_employmenttypes_tbl_list().ToList();

                return JSON(new { message = "success", um, leaveType, leaveSubType, leave_application_for_approval, empl_name_search }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 04/03/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult FilterPageGrid(string par_year, string par_show_history)
        {
            try
            {
                var filteredGrid = db.sp_leave_application_for_approval_list(Session["user_id"].ToString(), par_year, par_show_history).ToList();

                return JSON(new { message = "success", filteredGrid }, JsonRequestBehavior.AllowGet);
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
        public ActionResult GetDetailsData(
            string par_leave_type
            , string par_empl_id
            , string p_application_nbr)
        {
            try
            {
                var flpDtlLst           = db.sp_leave_application_dtl_tbl_list(p_application_nbr).ToList();
                var slvl_balance        = db.sp_slvl_current_leave_bal(par_empl_id).ToList();

                return JSON(new { message = "success", flpDtlLst, slvl_balance }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 05/15/2020
        // Description  : Get last code 
        //*********************************************************************//
        public ActionResult GetLeaveSubType(string par_leave_type, string par_empl_id)
        {
            try
            {
                var leaveSubLst = db.sp_leavesubtype_tbl_list(par_leave_type).ToList();

                return Json(new { message = "success", leaveSubLst}, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 04/03/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult ApprReviewerAction(leave_application_hdr_tbl data)
        {
            try
            {
                var transac_apprvr = db_dev.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), data.approval_status, data.details_remarks);

                var query               = db.leave_application_hdr_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno).FirstOrDefault();
                query.approval_status   = data.approval_status;
                query.details_remarks   = data.details_remarks;
                query.updated_by_user   = Session["user_id"].ToString();
                query.updated_dttm      = DateTime.Now;

                var query2 = db.leave_application_dtl_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno).ToList();
                query2.ForEach(a => a.rcrd_status = data.approval_status);

                // *************************************************************
                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                // *************************************************************
                var appl_status = "";

                if (data.approval_status == "C")
                {
                    appl_status = "Cancel Pending Leave Application";
                }
                else if (data.approval_status == "D")
                {
                    appl_status = "Disapproved Leave Application";
                }
                else if (data.approval_status == "F")
                {
                    appl_status = "Final Approved Leave Application";
                }
                else if (data.approval_status == "L")
                {
                    appl_status = "Cancel Leave Application";
                }
                else if (data.approval_status == "R")
                {
                    appl_status = "Reviewed Leave Application";
                }
                else
                {
                    appl_status = data.details_remarks;
                }
                db.sp_lv_ledger_history_insert("", data.leave_ctrlno, query.empl_id, appl_status, data.details_remarks, Session["user_id"].ToString());
                // *************************************************************
                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                // *************************************************************

                db.SaveChangesAsync();
                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
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


        public ActionResult GetSearchData(
            string par_year
           , string par_month
           , string par_empl_id
       )
        {
            try
            {

                db.Database.CommandTimeout = int.MaxValue;
                var sp_leave_search_list = db.sp_leave_search_list(par_empl_id, par_year, par_month).ToList();
                return JSON(new { message = "success", icon = "success", sp_leave_search_list }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult Retrieve_Justification(string leave_ctrlno, string empl_id)
        {
            try
            {
                var data = db.leave_application_hdr_justi_tbl.Where(a => a.leave_ctrlno == leave_ctrlno && a.empl_id == empl_id).OrderByDescending(a => a.id).FirstOrDefault();
                return Json(new { message = "success", data}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}