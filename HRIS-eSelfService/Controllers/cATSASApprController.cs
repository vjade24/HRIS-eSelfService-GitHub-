/*
 ******************************************************************
 ******************************************************************
 * Purpose      : Back-end code for AS Approval in  eSelfService
 * Created By   : Joseph M. Tombo Jr.
 * Created Date : 06/01/2020
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
    public class cATSASApprController : Controller
    {
        // GET: cATSASAppr
        HRIS_DEVEntities db_dev = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        User_Menu um            = new User_Menu();
        //*********************************************************************//
        // Created By : JMTJR - Created Date : 06/01/2020
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
        // Created Date : 06/03/2020
        // Description  : Initialized during leave type pageload
        //*********************************************************************//
        public ActionResult InitializeData()
        {
            try
            {
                GetAllowAccess();
                db_ats.Database.CommandTimeout = int.MaxValue;
                var employment_type = db_dev.sp_employmenttypes_tbl_list().ToList();
                var dept_list       = db_dev.vw_departments_tbl_list.ToList();
               
                var dept_code = Session["department_code"].ToString();
                var appr_worklist = db_ats.sp_approval_worklist_authorization_slip(Session["user_id"].ToString().Trim(), dept_code, (DateTime.Now.ToString("yyyy")), (DateTime.Now.ToString("MM")), "", "N").ToList();
                var empl_name_search = db_ats.sp_travelorder_search_names((DateTime.Now.ToString("yyyy")), (DateTime.Now.ToString("MM"))).ToList();
                var as_type_list = db_ats.astype_tbl_list().ToList();
                var reason_list = db_dev.sp_per_transaction_reasons_tbl_list("001").ToList();
                return JSON(new { message = "success", dept_list , employment_type, appr_worklist, dept_code, empl_name_search, as_type_list, reason_list }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr.
        // Created Date : 06/03/2020
        // Description  : Initialized during leave type pageload
        //*********************************************************************//
        public ActionResult RetreiveForApprovalData(string par_year, string par_month,string par_dep_code,string par_emp_type, string show_history)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                var appr_worklist = db_ats.sp_approval_worklist_authorization_slip(Session["user_id"].ToString().Trim(),par_dep_code,par_year, par_month, par_emp_type, show_history).ToList();
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
        // Created Date : 03/02/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult GetDetailsData(string p_application_nbr)
        {
            try
            {

                var flpDtlLst = db_ats.sp_authorization_slip_dtl_tbl_list(p_application_nbr).ToList();
              
                return JSON(new { message = "success", flpDtlLst }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr. 
        // Created Date : 03/02/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult GetOriginalData(string p_empl_id, string p_dtr_date)
        {
            try
            {
                
                var orginal_entry = db_ats.sp_get_dtr_original_entry(p_empl_id, Convert.ToDateTime(p_dtr_date)).ToList();

                return JSON(new { message = "success", orginal_entry }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr. 
        // Created Date : 03/02/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult ReviewApprovedAction(authorization_slipt_hdr_tbl data, authorization_slipt_dtl_tbl data2)
        {
            try
            {
                var application_nbr = data.application_nbr;
                var approval_id     = data.approval_id;
                string status_comment = string.Empty;

               
                data.detail_remarks = data.detail_remarks == null ? "" : data.detail_remarks;
                if (data.approval_status.ToString().Trim() == "R" &&
                   data.detail_remarks.Trim() == "")
                {
                    data.detail_remarks = "Reviewed";
                }
                else if (data.approval_status.ToString().Trim() == "F" &&
                    data.detail_remarks.Trim() == "")
                {
                    data.detail_remarks = "Final Approved";
                }
                else if (data.approval_status.ToString().Trim() == "C" &&
                    data.detail_remarks.Trim() == "")
                {
                    data.detail_remarks = "Cancel Pending";
                }
                else if (data.approval_status.ToString().Trim() == "D" &&
                     data.detail_remarks.Trim() == "")
                {
                    data.detail_remarks = "Disapproved";
                }
                else if (data.approval_status.ToString().Trim() != "" &&
                    data.detail_remarks.Trim() == "")
                {
                    data.detail_remarks = "Level "+ data.approval_status+" Approved";
                }

                var query = db_ats.authorization_slipt_hdr_tbl.Where(a => a.application_nbr == application_nbr
                                && a.approval_id == approval_id
                                ).FirstOrDefault();
                var query2 = db_ats.authorization_slipt_dtl_tbl.Where(a => a.application_nbr == application_nbr).ToList();
              
                if (query != null)
                {
                    query.approval_status = data.approval_status;
                    query.detail_remarks  = data.detail_remarks;
                    query.updated_by_user = Session["user_id"].ToString();
                    query.updated_dttm    = DateTime.Now;
                    query2.ForEach(a => a.rcrd_status = data.approval_status);
                    db_dev.sp_update_transaction_in_approvalworkflow_tbl(query.approval_id, Session["user_id"].ToString(), data.approval_status, data.detail_remarks);
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

        public ActionResult UpdateASapplication(authorization_slipt_dtl_tbl data2) {
            try
            {
                var od = db_ats.authorization_slipt_dtl_tbl.RemoveRange(db_ats.authorization_slipt_dtl_tbl.Where(a => a.application_nbr == data2.application_nbr));
                db_ats.authorization_slipt_dtl_tbl.Add(data2);

                db_ats.SaveChangesAsync();
                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new
                {
                    message = message
                }, JsonRequestBehavior.AllowGet);
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

        public ActionResult GetSearchData(
            string par_year
           , string par_month
           , string par_empl_id
       )
        {
            try
            {

                db_ats.Database.CommandTimeout = int.MaxValue;
                var sp_as_search_list = db_ats.sp_as_search_list(par_empl_id, par_year, par_month).ToList();
                return JSON(new { message = "success", icon = "success", sp_as_search_list}, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }
    }


}