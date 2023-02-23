/*
 ******************************************************************
 ******************************************************************
 * Purpose      : Back-end code for OT Request Approval in  eSelfService
 * Created By   : Joseph M. Tombo Jr.
 * Created Date : 07/21/2020
 ******************************************************************
 ******************************************************************
 */
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
    public class cATSOTRequestApprController : Controller
    {
        // GET: cATSOTRequestAppr
        HRIS_DEVEntities db_dev = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        User_Menu um            = new User_Menu();
        //*********************************************************************//
        // Created By : JMTJR - Created Date : 07/21/2020
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

            //Session["session_image_byte"] = string.Empty;
        }

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
            }
            return View(um);
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr.
        // Created Date : 07/21/2020
        // Description  : Initialized during leave type pageload
        //*********************************************************************//
        public ActionResult InitializeData()
        {
            try
            {
                GetAllowAccess();
                var employment_type = db_dev.sp_employmenttypes_tbl_list().ToList();
                var dept_list       = db_dev.vw_departments_tbl_list.ToList();
                var appr_worklist   = db_ats.sp_approval_worklist_ot_request(Session["user_id"].ToString().Trim(), "", (DateTime.Now.ToString("yyyy")), (DateTime.Now.ToString("mm")), "").ToList();

                var dept_code = Session["department_code"].ToString();

                return JSON(new { message = "success", dept_list, employment_type, appr_worklist, dept_code }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr.
        // Created Date : 07/21/2020
        // Description  : Retreive the new list of approval based on filter
        //*********************************************************************//
        public ActionResult RetreiveForApprovalData(string par_year, string par_month, string par_dep_code, string par_emp_type)
        {
            try
            {
                var appr_worklist = db_ats.sp_approval_worklist_ot_request(Session["user_id"].ToString().Trim(), par_dep_code, par_year, par_month, par_emp_type).ToList();
                return JSON(new { message = "success", appr_worklist }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr. 
        // Created Date : 07/21/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult GetDetailsData(string p_ot_ctrl_no)
        {
            try
            {
                var data_hdr        = db_ats.sp_ot_hdr_for_approval(p_ot_ctrl_no).FirstOrDefault();
                var data_date       = db_ats.sp_ot_request_dates_dtl_tbl_list(p_ot_ctrl_no).ToList();
                var data_empl       = db_ats.sp_ot_request_empl_dtl_tbl_list(p_ot_ctrl_no).ToList();
                var data_purpose    = db_ats.sp_ot_request_purpose_dtl_tbl_list(p_ot_ctrl_no).ToList();

                return JSON(new { message = "success", data_hdr, data_date, data_empl, data_purpose }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr. 
        // Created Date : 07/21/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult ReviewApprovedAction(ot_request_hdr_tbl data)
        {
            try
            {
                var ot_ctrl_no          = data.ot_ctrl_no;
                var approval_id         = data.approval_id;
                string status_comment   = string.Empty;

                data.details_remarks     = data.details_remarks == null ? "" : data.details_remarks;
                if (data.approval_status.ToString().Trim() == "R" )
                {
                    //data.details_remarks = data.details_remarks.ToString().Trim() =="" ? data.details_remarks:"Reviewed";
                    status_comment = "Reviewed";
                }
                else if (data.approval_status.ToString().Trim() == "F")
                {
                    //data.details_remarks = "Final Approved";
                    status_comment = "Final Approved";
                }
                else if (data.approval_status.ToString().Trim() == "C" )
                {
                    //data.details_remarks = "Cancel Pending";
                    status_comment = "Cancel Pending";
                }
                else if (data.approval_status.ToString().Trim() == "D" )
                {
                    //data.details_remarks = "Disapproved";
                    status_comment = "Disapproved";
                }
                else if (data.approval_status.ToString().Trim() != "" )
                {
                    //data.details_remarks = "Level " + data.approval_status + " Approved";
                    status_comment = "Level " + data.approval_status + " Approved";
                }

                var query = db_ats.ot_request_hdr_tbl.Where(a => a.ot_ctrl_no == ot_ctrl_no
                                && a.approval_id == approval_id
                                ).FirstOrDefault();
                var query2 = db_ats.ot_request_dates_dtl_tbl.Where(a => a.ot_ctrl_no == ot_ctrl_no).ToList();
                var query3 = db_ats.ot_request_empl_dtl_tbl.Where(a => a.ot_ctrl_no == ot_ctrl_no).ToList();
                var query4 = db_ats.ot_request_purpose_dtl_tbl.Where(a => a.ot_ctrl_no == ot_ctrl_no).ToList();

                if (query != null)
                {
                    query.approval_status    = data.approval_status;
                    query.details_remarks    = data.details_remarks;
                    query.updated_by_user    = Session["user_id"].ToString();
                    query.updated_dttm       = DateTime.Now;
                    query2.ForEach(a => a.rcrd_status = data.approval_status);
                    query3.ForEach(a => a.rcrd_status = data.approval_status);
                    query4.ForEach(a => a.rcrd_status = data.approval_status);
                    db_dev.sp_update_transaction_in_approvalworkflow_tbl(query.approval_id, Session["user_id"].ToString(), data.approval_status, (data.details_remarks.ToString().Trim() == "" ? data.details_remarks: status_comment));
                }

                db_ats.SaveChangesAsync();
                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
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