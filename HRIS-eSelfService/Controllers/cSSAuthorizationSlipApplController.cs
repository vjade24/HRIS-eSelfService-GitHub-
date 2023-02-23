/*
 ******************************************************************
 ******************************************************************
 * Purpose      : Back-end code for AS for eSelfService
 * Created By   : Joseph M. Tombo Jr.
 * Created Date : 05/09/2020
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
    public class cSSAuthorizationSlipApplController : Controller
    {
        HRIS_DEVEntities db_dev = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        User_Menu um            = new User_Menu();
        //*********************************************************************//
        // Created By : JMTJR - Created Date : 05/09/2020
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


        protected JsonResult JSON(object data, JsonRequestBehavior behavior)
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
        // Created By   : Joseph M. Tombo Jr. 
        // Created Date : 03/05/2020
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult InitializeData()
        {
            try
            {
                var log_empl_id = um.user_id = Session["user_id"].ToString().Replace("U", "");

                string userid           = Session["user_id"].ToString();
                string dept_code        = Session["department_code"].ToString();
                string log_in_as_AO     = Session["log_in_as_AO"].ToString();
                string creator_id       = Session["user_id"].ToString();//log_in_as_AO == "True" ? Session["user_id"].ToString() : "";
                var user_info           = db_dev.sp_userprofile_tbl(userid).FirstOrDefault();
                
                string empl_id           = Session["empl_id"].ToString();

                var as_list             = db_ats.sp_authorization_slipt_tbl_list(DateTime.Now.Year.ToString(), DateTime.Now.Month.ToString(), Session["user_id"].ToString().Trim('U'), creator_id,"").ToList();
                var as_list_by_employee = db_ats.sp_authorization_slipt_tbl_list_by_employee(DateTime.Now.Year.ToString(), DateTime.Now.Month.ToString(), Session["user_id"].ToString().Trim('U'), creator_id,"").ToList();
                var status              = db_ats.sp_approval_status_list().ToList();
                var empl_name           = db_dev.sp_employee_list_dept(empl_id).ToList();
                //var empl_name           = db_dev.sp_employee_list_dept_ao(log_empl_id).ToList();
                var holidays_list       = db_dev.sp_holidays_tbl_list(DateTime.Now.Year).ToList();
                var as_type_list        = db_ats.astype_tbl_list().ToList();
                //Hardcoded Transaction code as 001 for AS application Reasons
                var reason_list     = db_dev.sp_per_transaction_reasons_tbl_list("001").ToList();
                return JSON(new { message = "success", empl_name, as_list, status, user_info, log_in_as_AO, userid, um, holidays_list, as_type_list, reason_list, as_list_by_employee }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr. 
        // Created Date : 05/09/2020
        // Description  : Get last code 
        //*********************************************************************//
        public ActionResult GenerateNewApplNbr()
        {
            try
            {
                var new_appl_nbr = db_ats.sp_generate_appl_nbr("authorization_slipt_hdr_tbl", 12, "application_nbr");
                return Json(new { message = "success", new_appl_nbr }, JsonRequestBehavior.AllowGet);
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
        public ActionResult FilterPageGrid(string p_empl_id, string p_appr_status, string p_year, string p_month)
        {
            try
            {
                var filteredGrid    = db_ats.sp_authorization_slipt_tbl_list(p_year, p_month, p_empl_id, Session["user_id"].ToString(),p_appr_status).ToList();
                var calendar_data   = db_ats.sp_authorization_slipt_tbl_list_by_employee(p_year, p_month, p_empl_id, Session["user_id"].ToString(),p_appr_status).ToList();

                return JSON(new { message = "success", filteredGrid, calendar_data }, JsonRequestBehavior.AllowGet);
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
        public ActionResult CheckExist(List<authorization_slipt_dtl_tbl> data2, string empl_id,string checking_mode)
        {
            try
            {
                var message = "";
                //CHECKING DURING ADD
                if (checking_mode == "ADD")
                {

                    for (var x = 0; x < data2.Count; x++)
                    {
                        var appl_nbr          = data2[x].application_nbr;
                        var as_dtr_date       = data2[x].as_dtr_date;
                        var astype_code       = data2[x].astype_code;
                        var od = db_ats.authorization_slipt_dtl_tbl.Where(a =>
                            a.application_nbr == appl_nbr &&
                            a.as_dtr_date     == as_dtr_date &&
                            a.astype_code     == astype_code &&
                            a.rcrd_status     != "L" && a.rcrd_status != "D"
                        ).FirstOrDefault();

                        if (od != null)
                        {
                            message = (message + " *" + data2[x].as_dtr_date.ToString("yyyy-MM-dd"));
                        }
                    }
                }

                for (var x = 0; x < data2.Count; x++)
                {
                    var astype_code = data2[x].astype_code;
                    var dtr_date    = data2[x].as_dtr_date;
                    var appl_nbr    = data2[x].application_nbr;

                    var od = db_ats.authorization_slipt_dtl_tbl.Where(a =>
                        a.astype_code == astype_code &&
                        a.as_dtr_date == dtr_date &&
                        a.application_nbr != appl_nbr &&
                        a.rcrd_status != "L" && a.rcrd_status != "D" &&
                        (db_ats.authorization_slipt_hdr_tbl.Where(b => b.empl_id == empl_id
                         && b.application_nbr == a.application_nbr).Select(b => b.empl_id).FirstOrDefault()) == empl_id).FirstOrDefault();

                    if (od != null)
                    {
                        message = (message + " *" + data2[x].as_dtr_date.ToString("yyyy-MM-dd"));
                    }
                }

                return JSON(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr. 
        // Created Date : 05/26/2020
        // Description  : Add new record to table with status as New
        //*********************************************************************//
        public ActionResult Save(authorization_slipt_hdr_tbl data, List<authorization_slipt_dtl_tbl> data2,string save_mode)
        {
            try
            {
                if (save_mode == "ADD")
                {
                    var new_appl_nbr = db_ats.sp_generate_appl_nbr("authorization_slipt_hdr_tbl", 12, "application_nbr").ToList();
                    data.application_nbr    = new_appl_nbr[0].ToString();
                    data.date_applied       = data.date_applied;
                    data.created_by_user    = Session["user_id"].ToString();
                    data.created_dttm       = DateTime.Now;
                    data.detail_remarks     = string.Empty;
                    db_ats.authorization_slipt_hdr_tbl.Add(data);

                    for (var x = 0; x < data2.Count; x++)
                    {
                        data2[x].application_nbr = new_appl_nbr[0].ToString();
                        db_ats.authorization_slipt_dtl_tbl.Add(data2[x]);
                    }
                    db_ats.SaveChangesAsync();
                }
                else if (save_mode == "EDIT")
                {
                    data.updated_by_user    = Session["user_id"].ToString();
                    var query               = db_ats.authorization_slipt_hdr_tbl.Where(a => a.application_nbr == data.application_nbr).FirstOrDefault();
                    query.updated_dttm      = data.updated_dttm;
                    query.updated_by_user   = data.updated_by_user;


                    var od = db_ats.authorization_slipt_dtl_tbl.RemoveRange(db_ats.authorization_slipt_dtl_tbl.Where(a => a.application_nbr == data.application_nbr));
                    for (var x = 0; x < data2.Count; x++)
                    {
                        db_ats.authorization_slipt_dtl_tbl.Add(data2[x]);
                    }
                    db_ats.SaveChangesAsync();
                }


                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr. 
        // Created Date : 03/13/2020
        // Description  : Edit existing record table with status as New into Submitted
        //*********************************************************************//
        public ActionResult SubmitAS(authorization_slipt_hdr_tbl data, List<authorization_slipt_dtl_tbl> data2, string submit_mode)
        {
            try
            {
                var empl_id     = data.empl_id.ToString();
                string user_id  = Session["user_id"].ToString();
                string ao_id    = Session["empl_id"].ToString();
                var trans_ref   = db_dev.transactionsapprover_tbl.Where(a => a.empl_id == ao_id
                                                        && a.transaction_code == "001" 
                                                        && a.workflow_authority == "0"
                                                        && a.with_self_service_approval == true).FirstOrDefault();
                if (trans_ref != null)
                {
                    data.approval_status = "R";
                    data.detail_remarks = "Auto Reviewed";
                }
                var trans_ref2 = db_ats.sp_ss_auto_approval(user_id, "001").ToList();

                if (trans_ref2[0].auto_status != "" && data2[0].astype_code != "09")
                {
                    data.approval_status = trans_ref2[0].auto_status;
                    data.detail_remarks = trans_ref2[0].auto_remarks;
                }

                if (trans_ref2[0].auto_status != "" && data2[0].astype_code != "10")
                {
                    data.approval_status = trans_ref2[0].auto_status;
                    data.detail_remarks = trans_ref2[0].auto_remarks;
                }

                if (trans_ref2[0].auto_status != "" && data2[0].astype_code != "11")
                {
                    data.approval_status = trans_ref2[0].auto_status;
                    data.detail_remarks = trans_ref2[0].auto_remarks;
                }

                if (trans_ref2[0].auto_status != "" && data2[0].reason_code != "026")
                {
                    data.approval_status = trans_ref2[0].auto_status;
                    data.detail_remarks = trans_ref2[0].auto_remarks;
                }

                if (trans_ref2[0].auto_status != "" && data2[0].reason_code != "019")
                {
                    data.approval_status = trans_ref2[0].auto_status;
                    data.detail_remarks = trans_ref2[0].auto_remarks;
                }

                if (trans_ref2[0].auto_status != "" && data2[0].reason_code != "022")
                {
                    data.approval_status = trans_ref2[0].auto_status;
                    data.detail_remarks = trans_ref2[0].auto_remarks;
                }

                var trans_ref3 = db_dev.transactionsapprover_tbl.Where(a => a.empl_id == ao_id
                                                      && a.transaction_code == "001"
                                                      && a.workflow_authority == "3"
                                                      && a.with_self_service_approval == true).FirstOrDefault();


                if (trans_ref3 != null)
                {
                    if (data2[0].astype_code == "09"
                        || data2[0].astype_code == "10"
                        || data2[0].reason_code == "026"
                        || data2[0].reason_code == "019"
                        || data2[0].reason_code == "022"
                        || data2[0].astype_code == "11"
                        )
                    {
                        data.approval_status = "1";
                        data.detail_remarks = "Auto Level 1";
                    }


                }




                if (submit_mode == "ADD")
                {
                    var app_id           = db_dev.sp_insert_transaction_to_approvalworkflow_tbl(Session["user_id"].ToString(), empl_id, "001").ToList();
                    data.approval_id     = app_id[0].ToString();
                    if (trans_ref != null || trans_ref2[0].auto_status != null)
                    {
                        db_dev.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), data.approval_status, data.detail_remarks);
                    }
                    var new_appl_nbr = db_ats.sp_generate_appl_nbr("authorization_slipt_hdr_tbl", 12, "application_nbr").ToList();
                    data.application_nbr = new_appl_nbr[0].ToString();
                    data.created_by_user = Session["user_id"].ToString();
                    data.created_dttm    = DateTime.Now;
                    //data.detail_remarks  = string.Empty;

                    db_ats.authorization_slipt_hdr_tbl.Add(data);

                    for (var x = 0; x < data2.Count; x++)
                    {
                        if (trans_ref != null || trans_ref2[0].auto_status != null)
                        {
                            data2[x].rcrd_status = data.approval_status;
                        }
                        data2[x].application_nbr = new_appl_nbr[0].ToString();
                        db_ats.authorization_slipt_dtl_tbl.Add(data2[x]);
                    }
                    db_ats.SaveChanges();
                }
                else if (submit_mode == "EDIT")
                {
                    var query = db_ats.authorization_slipt_hdr_tbl.Where(a => a.application_nbr == data.application_nbr).FirstOrDefault();
                    if (query.approval_id == null)
                    {
                        var app_id = db_dev.sp_insert_transaction_to_approvalworkflow_tbl(Session["user_id"].ToString(), empl_id, "001").ToList();
                        data.approval_id = app_id[0].ToString();
                    }
                    else if (data.approval_id.ToString().Trim() == "")
                    {
                        var app_id = db_dev.sp_insert_transaction_to_approvalworkflow_tbl(Session["user_id"].ToString(), empl_id, "001").ToList();
                        data.approval_id = app_id[0].ToString();
                    }
                    else
                    {
                        db_dev.sp_update_transaction_in_approvalworkflow_tbl(query.approval_id, Session["user_id"].ToString(), data.approval_status, data.detail_remarks);
                    }

                    query.approval_id       = data.approval_id;
                    query.approval_status   = data.approval_status;
                    query.updated_dttm      = data.updated_dttm;
                    query.updated_by_user   = data.updated_by_user;
                   
                    var od = db_ats.authorization_slipt_dtl_tbl.RemoveRange(db_ats.authorization_slipt_dtl_tbl.Where(a => a.application_nbr == data.application_nbr));
                    for (var x = 0; x < data2.Count; x++)
                    {
                        if (trans_ref != null || trans_ref2[0].auto_status != null)
                        {
                            data2[x].rcrd_status = data.approval_status;
                        }
                        db_ats.authorization_slipt_dtl_tbl.Add(data2[x]);
                    }
                    db_ats.SaveChanges();
                }

                if (trans_ref != null || trans_ref2[0].auto_status != null)
                {
                    db_dev.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), data.approval_status, data.detail_remarks);
                    var current_data = db_ats.authorization_slipt_hdr_tbl.Where(a => a.application_nbr == data.application_nbr).FirstOrDefault();
                    if (current_data != null)
                    {
                        current_data.approval_status = data.approval_status;
                        current_data.updated_by_user = Session["user_id"].ToString();
                        current_data.updated_dttm = DateTime.Now;
                        var od = db_ats.authorization_slipt_dtl_tbl.Where(a => a.application_nbr == current_data.application_nbr).ToList();
                        if (od != null && od.Count > 0)
                        {
                            od.ForEach(a => a.rcrd_status = data.approval_status);
                        }
                    }

                    //data.approval_status = "R";
                }
                db_ats.SaveChanges();
                return Json(new { message = "success", data }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr. 
        // Created Date : 03/13/2020
        // Description  : delete from Authorization table
        //*********************************************************************//
        public ActionResult Delete(authorization_slipt_dtl_tbl data,string action_mode)
        {
            try
            {
                string message = "";
                if (action_mode == "ALL")
                {
                    var od = db_ats.authorization_slipt_hdr_tbl.Where(a => a.application_nbr == data.application_nbr).FirstOrDefault();
                    if (od != null)
                    {
                        db_ats.authorization_slipt_hdr_tbl.Remove(od);
                        var query = db_ats.authorization_slipt_dtl_tbl.RemoveRange(db_ats.authorization_slipt_dtl_tbl.Where(a => a.application_nbr == data.application_nbr));

                        db_ats.SaveChangesAsync();
                        message = "success";
                    }
                    else
                    {
                        message = "";
                    }
                }
                else
                {
                    var select = db_ats.authorization_slipt_dtl_tbl.Where(a => a.application_nbr == data.application_nbr);
                    var count = select.Count();

                    if (count == 1)
                    {
                        var od = db_ats.authorization_slipt_hdr_tbl.Where(a => a.application_nbr == data.application_nbr).FirstOrDefault();
                        if (od != null)
                        {
                            db_ats.authorization_slipt_hdr_tbl.Remove(od);
                            var query = db_ats.authorization_slipt_dtl_tbl.RemoveRange(db_ats.authorization_slipt_dtl_tbl.Where(a => a.application_nbr == data.application_nbr));

                            db_ats.SaveChangesAsync();
                            message = "success";
                        }
                        else
                        {
                            message = "";
                        }
                    }
                    else
                    {
                        var od = db_ats.authorization_slipt_dtl_tbl.Where(a =>
                        a.application_nbr == data.application_nbr &&
                        a.as_dtr_date == data.as_dtr_date &&
                        a.astype_code == data.astype_code).FirstOrDefault();
                        if (od != null)
                        {
                            db_ats.authorization_slipt_dtl_tbl.Remove(od);
                            db_ats.SaveChangesAsync();
                            message = "success";
                        }
                        else
                        {
                            message = "";
                        }
                    }
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
        // Created By   : Joseph M. Tombo Jr. 
        // Created Date : 04/16/2020
        // Description  : delete from approval workflow table
        //*********************************************************************//
        public ActionResult CancelledAll(authorization_slipt_hdr_tbl data)
        {
            try
            {
                var query = db_ats.authorization_slipt_hdr_tbl.Where(a =>
                   a.application_nbr == data.application_nbr).FirstOrDefault();
                query.approval_status   = "L";
                query.updated_dttm      = data.updated_dttm;
                query.updated_by_user   = Session["user_id"].ToString();

                var query2 = db_ats.authorization_slipt_dtl_tbl.Where(a =>
                   a.application_nbr == query.application_nbr).ToList();
                query2.ForEach(a => a.rcrd_status = "L");
                db_dev.sp_update_transaction_in_approvalworkflow_tbl(query.approval_id, Session["user_id"].ToString(),"L","canceled by user");
                db_ats.SaveChangesAsync();

                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);

                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr. 
        // Created Date : 04/16/2020
        // Description  : Set Page History for This PAGE
        //*********************************************************************//
        public ActionResult setPageHistory()
        {
            try
            {
                Session["history_page"] = Request.UrlReferrer.ToString();

                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);

                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr. 
        // Created Date : 04/16/2020
        // Description  : delete from approval workflow table
        //*********************************************************************//
        public ActionResult Cancelled(authorization_slipt_hdr_tbl data, authorization_slipt_dtl_tbl data2)
        {
            try
            {
                var query = db_ats.authorization_slipt_hdr_tbl.Where(a =>
                   a.application_nbr == data.application_nbr).FirstOrDefault();

                query.updated_dttm      = DateTime.Now;
                query.updated_by_user   = Session["user_id"].ToString();

                var query2 = db_ats.authorization_slipt_dtl_tbl.Where(a =>
                   a.application_nbr == data2.application_nbr &&
                   a.as_dtr_date == data2.as_dtr_date &&
                   a.astype_code == data2.astype_code).FirstOrDefault();
                //Query to check if how many details does the application have
                var queryX = db_ats.authorization_slipt_dtl_tbl.Where(a =>
                  a.application_nbr == data2.application_nbr &&
                  (a.rcrd_status != "L" && a.rcrd_status != "D")).ToList();
                if (queryX != null && queryX.Count == 1)
                {

                    query2.rcrd_status      = data2.rcrd_status;
                    query.approval_status   = data2.rcrd_status;
                    db_dev.sp_update_transaction_in_approvalworkflow_tbl(query.approval_id, Session["user_id"].ToString(), "L", "canceled by user");
                }
                else
                {
                    query2.rcrd_status = data2.rcrd_status;
                }

                db_ats.SaveChangesAsync();

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

        public ActionResult WithdrawSubmission(authorization_slipt_hdr_tbl data)
        {
            try
            {
                var query = db_ats.authorization_slipt_hdr_tbl.Where(a => a.application_nbr == data.application_nbr
                                && a.approval_id == data.approval_id
                                ).FirstOrDefault();
                var query2 = db_ats.authorization_slipt_dtl_tbl.Where(a => a.application_nbr == data.application_nbr).ToList();

                if (query != null)
                {
                    query.approval_status   = data.approval_status;
                    query.detail_remarks    = data.detail_remarks;
                    query.updated_by_user   = Session["user_id"].ToString();
                    query.updated_dttm      = DateTime.Now;
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
    }
}