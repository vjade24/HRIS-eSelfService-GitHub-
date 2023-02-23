
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
    public class cTimeScheduleApprController : Controller
    {
        HRIS_ATSEntities db = new HRIS_ATSEntities();
        HRIS_DEVEntities db_dev = new HRIS_DEVEntities();
        User_Menu um = new User_Menu();
        // GET: cTimeScheduleAppr
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
        public ActionResult InitializeData()
        {
            try
            {
                db.Database.CommandTimeout = int.MaxValue;
                var um = GetAllowAccess();
               
                var filteredGrid = db.sp_time_schedule_for_approval_list(Session["user_id"].ToString(), (DateTime.Now.ToString("MM")), (DateTime.Now.ToString("yyyy")), "N").ToList();
                return JSON(new { message = "success", filteredGrid, um }, JsonRequestBehavior.AllowGet);
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
        public ActionResult FilterPageGrid(
            string par_month
            , string par_year
            , string par_show_history)
        {
            try
            {
                db.Database.CommandTimeout = int.MaxValue;
                var filteredGrid = db.sp_time_schedule_for_approval_list(Session["user_id"].ToString(), par_month, par_year, par_show_history).ToList();

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
        // Created Date : 01/20/2020
        // Description  : Initialized during leave type pageload
        //*********************************************************************//
        public ActionResult GetDetailsData(
            string par_empl_id,
            string par_month,
            string par_year,
            DateTime par_effective_date)
        {
            try
            {
                var temp_template_code = "";
                if (Session["employment_type"].ToString() == "RE")
                {
                    temp_template_code = "007";
                }
                else if (Session["employment_type"].ToString() == "CE")
                {
                    temp_template_code = "008";
                }
                else if (Session["employment_type"].ToString() == "JO")
                {
                    temp_template_code = "009";
                }

                temp_template_code = "009";


                var sp_time_schedule_empl   = db.sp_time_schedule_empl_tbl1(par_empl_id, par_month, par_year, par_effective_date).ToList();
                var no_of_wrkng_days        = db_dev.sp_payrollregistry_get_dates(temp_template_code, par_year, par_month).ToList();
                var no_of_wrkng_hrs         = Convert.ToDecimal(no_of_wrkng_days[0].no_of_workdays * 8);

                return JSON(new { message = "success", sp_time_schedule_empl, no_of_wrkng_days, no_of_wrkng_hrs }, JsonRequestBehavior.AllowGet);
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
        public ActionResult ApprReviewerAction(time_schedule_empl_hdr_tbl data)
        {
            try
            {
                var transac_apprvr = db_dev.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), data.approval_status, data.details_remarks);

                var query = db.time_schedule_empl_hdr_tbl.Where(a =>
                    a.tse_ctrl_no == data.tse_ctrl_no).FirstOrDefault();
                query.approval_status   = data.approval_status;
                query.details_remarks   = data.details_remarks;
                query.updated_by_user   = Session["user_id"].ToString();
                query.updated_dttm      = DateTime.Now;
                
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
    }
}