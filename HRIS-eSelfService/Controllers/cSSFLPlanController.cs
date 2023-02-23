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
    public class cSSFLPlanController : Controller
    {
        HRIS_DEVEntities db_dev = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        User_Menu um = new User_Menu();
        // GET: cSSFLPlan
        public ActionResult Index()
        {
            User_Menu um = new User_Menu();

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
        // Created Date : 03/05/2020
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult InitializeData()
        {
            try
            {
                var um              = GetAllowAccess();
                var user_info       = db_dev.sp_userprofile_tbl(Session["user_id"].ToString()).FirstOrDefault();
                string dept_code    = Session["department_code"].ToString();
                string log_in_as_AO = Session["log_in_as_AO"].ToString();
                string par_log_in_as_AO = (Session["log_in_as_AO"].ToString() == "True") ? "1" : "0";

                string empl_id           = Session["empl_id"].ToString();

                var flpLst              = db_ats.sp_force_leave_plan_tbl_list(user_info.empl_id, "", DateTime.Now.Year.ToString()).ToList();
                var flpLst1             = db_ats.sp_force_leave_plan_tbl_list1(user_info.empl_id, "", DateTime.Now.Year.ToString(), par_log_in_as_AO, Session["user_id"].ToString()).ToList();
                var status              = db_ats.sp_approval_status_list().ToList();
                var empl_name           = db_dev.sp_employee_list_dept(empl_id);
                var holiDate            = db_dev.sp_holidays_tbl_list(Int32.Parse(DateTime.Now.Year.ToString())).ToList();
                var dept_list           = db_dev.departments_tbl.ToList();
                var subdept_list        = db_dev.subdepartments_tbl.ToList();
                var div_list            = db_dev.sp_divisions_tbl_list2(dept_code).ToList();
                var sec_list            = db_dev.sections_tbl.ToList();
                

                return JSON(new { message = "success", holiDate, empl_name, flpLst, flpLst1, status, user_info, log_in_as_AO, um
                    ,dept_list
                    ,subdept_list
                    ,div_list
                    ,sec_list
                    ,
                    dept_code
                }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 02/08/2020
        // Description  : Get last code 
        //*********************************************************************//
        public ActionResult GenerateNewApplNbr(string par_empl_id, string par_year)
        {
            try
            {
                var new_appl_nbr = db_ats.sp_generate_appl_nbr("force_leave_plan_hdr_tbl", 8, "application_nbr").ToList();
                var available_leave = db_ats.sp_available_leave(par_empl_id, par_year, "FL", "force_leave_plan_dtl_tbl", "flp_application_date", "empl_id", "rcrd_status").ToList();
                var holiDate = db_dev.sp_holidays_tbl_list(Int32.Parse(par_year)).ToList();

                return Json(new { message = "success", new_appl_nbr, available_leave , holiDate }, JsonRequestBehavior.AllowGet);
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
        public ActionResult GetDetailsData(string p_application_nbr)
        {
            try
            {
                var flpDtlLst = db_ats.sp_force_leave_plan_dtl_tbl_list(p_application_nbr).ToList();

                string creator = (flpDtlLst[0].created_by_user == Session["user_id"].ToString()) ? "true" : "false";

                return JSON(new { message = "success", flpDtlLst, creator }, JsonRequestBehavior.AllowGet);
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
        public ActionResult FilterPageGrid(string p_empl_id, string p_appr_status, string p_year)
        {
            try
            {
                string par_log_in_as_AO  = Session["log_in_as_AO"].ToString() == "True" ? "1" : "0";
                var filteredGrid         = db_ats.sp_force_leave_plan_tbl_list(p_empl_id, p_appr_status, p_year).ToList();
                var filteredGrid1        = db_ats.sp_force_leave_plan_tbl_list1(p_empl_id, p_appr_status, p_year, par_log_in_as_AO, Session["user_id"].ToString()).ToList();
                var holiDate             = db_dev.sp_holidays_tbl_list(Int32.Parse(p_year)).ToList();

                return JSON(new { message = "success", filteredGrid, filteredGrid1, holiDate }, JsonRequestBehavior.AllowGet);
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
        public ActionResult CheckExist(List<force_leave_plan_dtl_tbl> data2)
        {
            try
            {
                var message             = "";
                var message_oth_valid   = "";
                var message_oth         = "";
                for (var x = 0; x < data2.Count; x++)
                {
                    var id = data2[x].empl_id;
                    var plan_date = data2[x].flp_application_date;
                    var od = db_ats.force_leave_plan_dtl_tbl.Where(a =>
                        a.empl_id == id &&
                        a.flp_application_date == plan_date &&
                        a.rcrd_status != "L" && a.rcrd_status != "D").FirstOrDefault();
                    if (od != null)
                    {
                        message = (message + " *" + data2[x].flp_application_date.ToString("yyyy-MM-dd"));
                    }
                    else if (plan_date.ToString("yyyy-MM-dd") == DateTime.Now.ToString("yyyy-MM-dd"))
                    {
                        message = (message + " *" + data2[x].flp_application_date.ToString("yyyy-MM-dd")) + " - Transfer this date to other date instead!";
                        message_oth_valid = "late-application";
                        message_oth = "You cannot apply late Force Leave or beyond date of filing!";
                    }
                    //else if (plan_date.Month == 12)
                    //{
                    //    message             = (message + " *" + data2[x].flp_application_date.ToString("yyyy-MM-dd")) + " - Transfer this date to other date instead!";
                    //    message_oth_valid   = "no-december";
                    //    message_oth         = "You cannot apply Force Leave Plan on December!";
                    //}
                    else if (plan_date.DayOfWeek.ToString() == "Saturday" ||
                             plan_date.DayOfWeek.ToString() == "Sunday")
                    {
                        message             = (message + " *" + data2[x].flp_application_date.ToString("yyyy-MM-dd")) + " - Date selected is weekend. ";
                        message_oth_valid   = "weekend_validation";
                        message_oth         = "You cannot continue this transaction!";
                    }
                    else
                    {

                    }
                }
                
                return JSON(new { message, message_oth, message_oth_valid }, JsonRequestBehavior.AllowGet);
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
        public ActionResult CheckExist2(List<force_leave_plan_dtl_tbl> data2)
        {
            try
            {
                var message = "";
                for (var x = 0; x < data2.Count; x++)
                {
                    var id = data2[x].empl_id;
                    var plan_date = data2[x].flp_application_date;
                    var appl_nbr = data2[x].application_nbr;

                    var od = db_ats.force_leave_plan_dtl_tbl.Where(a =>
                        a.empl_id == id &&
                        a.flp_application_date == plan_date &&
                        a.application_nbr != appl_nbr).FirstOrDefault();
                    if (od != null)
                    {
                        message = (message + " *" + data2[x].flp_application_date.ToString("yyyy-MM-dd"));
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
        // Created By   : Lorraine I. Ale 
        // Created Date : 03/02/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult CheckExist3(List<force_leave_plan_dtl_tbl> data2)
        {
            try
            {
                var message = "";
                for (var x = 0; x < data2.Count; x++)
                {
                    var id = data2[x].empl_id;
                    var plan_date = data2[x].flp_application_date;
                    var appl_nbr = data2[x].application_nbr;

                    var od = db_ats.force_leave_plan_dtl_tbl.Where(a =>
                        a.empl_id == id &&
                        a.flp_application_date == plan_date &&
                        a.application_nbr != appl_nbr &&
                        a.rcrd_status == "N").FirstOrDefault();
                    if (od != null)
                    {
                        message = (message + " *" + data2[x].flp_application_date.ToString("yyyy-MM-dd"));
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
        // Created By   : Lorraine I. Ale 
        // Created Date : 03/13/2020
        // Description  : Add new record to table with status as New
        //*********************************************************************//
        public ActionResult Save(force_leave_plan_hdr_tbl data, List<force_leave_plan_dtl_tbl> data2)
        {
            try
            {
                data.created_by_user = Session["user_id"].ToString();
                data.created_dttm = DateTime.Now;
                data.date_applied = DateTime.Now;
                data.detail_remarks = string.Empty;
                db_ats.force_leave_plan_hdr_tbl.Add(data);

                for (var x = 0; x < data2.Count; x++)
                {
                    db_ats.force_leave_plan_dtl_tbl.Add(data2[x]);
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
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 03/13/2020
        // Description  : Add new record to table with status as Submitted
        //*********************************************************************//
        public ActionResult Save2(force_leave_plan_hdr_tbl data, List<force_leave_plan_dtl_tbl> data2)
        {
            try
            {
                var app_id = db_dev.sp_insert_transaction_to_approvalworkflow_tbl(Session["user_id"].ToString(), data.empl_id.ToString(), "005").ToList();
                data.date_applied = DateTime.Now;
                data.created_dttm = DateTime.Now;
                data.approval_id = app_id[0].ToString();
                data.created_by_user = Session["user_id"].ToString();
                data.detail_remarks = string.Empty;
                db_ats.force_leave_plan_hdr_tbl.Add(data);

                for (var x = 0; x < data2.Count; x++)
                {
                    db_ats.force_leave_plan_dtl_tbl.Add(data2[x]);
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
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 03/13/2020
        // Description  : Edit existing record table with status as New 
        //*********************************************************************//
        public ActionResult SaveEdit(force_leave_plan_hdr_tbl data, List<force_leave_plan_dtl_tbl> data2)
        {
            try
            {
                data.updated_by_user = Session["user_id"].ToString();
                var query = db_ats.force_leave_plan_hdr_tbl.Where(a => a.application_nbr == data.application_nbr ).FirstOrDefault();
                query.updated_dttm = DateTime.Now;
                query.updated_by_user = Session["user_id"].ToString();


                var od = db_ats.force_leave_plan_dtl_tbl.RemoveRange(db_ats.force_leave_plan_dtl_tbl.Where(a => a.application_nbr == data.application_nbr));
                for (var x = 0; x < data2.Count; x++)
                {
                    db_ats.force_leave_plan_dtl_tbl.Add(data2[x]);
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
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 03/13/2020
        // Description  : Edit existing record table with status as New into Submitted
        //*********************************************************************//
        public ActionResult SaveSubmit(force_leave_plan_hdr_tbl data, List<force_leave_plan_dtl_tbl> data2)
        {
            try
            {
                var app_id = db_dev.sp_insert_transaction_to_approvalworkflow_tbl(Session["user_id"].ToString(), data.empl_id.ToString(), "005").ToList();
                data.approval_id = app_id[0].ToString();
                data.detail_remarks = string.Empty;

                var query = db_ats.force_leave_plan_hdr_tbl.Where(a => a.application_nbr == data.application_nbr).FirstOrDefault();
                query.approval_id       = data.approval_id;
                query.approval_status   = data.approval_status;
                query.updated_dttm      = DateTime.Now;
                query.updated_by_user   = Session["user_id"].ToString();

                var od = db_ats.force_leave_plan_dtl_tbl.RemoveRange(db_ats.force_leave_plan_dtl_tbl.Where(a => a.application_nbr == data.application_nbr));
                for (var x = 0; x < data2.Count; x++)
                {
                    db_ats.force_leave_plan_dtl_tbl.Add(data2[x]);
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
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 03/13/2020
        // Description  : Edit existing record table with status as New into Submitted
        //*********************************************************************//
        public ActionResult ReSubmitAll(force_leave_plan_hdr_tbl data, List<force_leave_plan_dtl_tbl> data2)
        {
            try
            {
                var transac_apprvr = db_dev.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), "S", "");
                
                var query = db_ats.force_leave_plan_hdr_tbl.Where(a => a.application_nbr == data.application_nbr).FirstOrDefault();
                query.approval_status = data.approval_status;
                query.updated_dttm = DateTime.Now;
                query.updated_by_user = Session["user_id"].ToString(); ;

                var od = db_ats.force_leave_plan_dtl_tbl.RemoveRange(db_ats.force_leave_plan_dtl_tbl.Where(a => a.application_nbr == data.application_nbr && a.rcrd_status != "L"));
                for (var x = 0; x < data2.Count; x++)
                {
                    db_ats.force_leave_plan_dtl_tbl.Add(data2[x]);
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
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 03/13/2020
        // Description  : delete from force leave plan table
        //*********************************************************************//
        public ActionResult Delete(force_leave_plan_hdr_tbl data)
        {
            try
            {
                var od = db_ats.force_leave_plan_hdr_tbl.Where(a => a.application_nbr == data.application_nbr).FirstOrDefault();
                string message = "";
                if (od != null)
                {
                    if (data.approval_id != null || data.approval_id != "")
                    {
                        var transac_apprvr = db_dev.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), "L", "Deleted");
                    }
                    db_ats.force_leave_plan_hdr_tbl.Remove(od);
                    var query = db_ats.force_leave_plan_dtl_tbl.RemoveRange(db_ats.force_leave_plan_dtl_tbl.Where(a => a.application_nbr == data.application_nbr));

                    db_ats.SaveChangesAsync();
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
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 03/13/2020
        // Description  : delete from force leave plan table
        //*********************************************************************//
        public ActionResult DeleteCancelPending(force_leave_plan_hdr_tbl data, force_leave_plan_dtl_tbl data2)
        {
            try
            {
                var query               = db_ats.force_leave_plan_hdr_tbl.Where(a =>a.application_nbr == data.application_nbr).FirstOrDefault();
                query.updated_dttm      = DateTime.Now;
                query.updated_by_user   = Session["user_id"].ToString();

                var query2              = db_ats.force_leave_plan_dtl_tbl.Where(a => a.application_nbr == data2.application_nbr && a.flp_application_date == data2.flp_application_date).FirstOrDefault();
                query2.rcrd_status      = "L";

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
        // Created By   : Lorraine I. Ale 
        // Created Date : 04/16/2020
        // Description  : delete from approval workflow table
        //*********************************************************************//
        //public ActionResult CancelledAll(force_leave_plan_hdr_tbl data)
        //{
        //    try
        //    {
        //        if (data.approval_id != null || data.approval_id != "")
        //        {
        //            var transac_apprvr = db_dev.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), "L", "Cancelled");
        //        }
                
        //        var query = db_ats.force_leave_plan_hdr_tbl.Where(a =>
        //           a.application_nbr == data.application_nbr).FirstOrDefault();
        //        query.approval_status = "L";
        //        query.updated_dttm = DateTime.Now;
        //        query.updated_by_user = Session["user_id"].ToString();

        //        var query2 = db_ats.force_leave_plan_dtl_tbl.Where(a =>
        //           a.application_nbr == data.application_nbr).ToList();
        //        query2.ForEach(a => a.rcrd_status = "L");

        //        db_ats.SaveChangesAsync();

        //        return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (DbEntityValidationException e)
        //    {
        //        string message = DbEntityValidationExceptionError(e);

        //        return Json(new { message = message }, JsonRequestBehavior.AllowGet);
        //    }
        //}
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 04/16/2020
        // Description  : delete from approval workflow table
        //*********************************************************************//
        public ActionResult Cancelled(force_leave_plan_hdr_tbl data, force_leave_plan_dtl_tbl data2)
        {
            try
            {
                var select = db_ats.force_leave_plan_dtl_tbl.Where(a => a.application_nbr == data.application_nbr &&
                    a.rcrd_status != "L");
                var count = select.Count();

                if (count == 1)
                {
                    if (data.approval_id != null || data.approval_id != "")
                    {
                        var transac_apprvr = db_dev.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), "L", "Cancelled");
                    }

                    var query = db_ats.force_leave_plan_hdr_tbl.Where(a =>
                        a.application_nbr == data.application_nbr).FirstOrDefault();
                    query.approval_status = "L";
                    query.updated_dttm = DateTime.Now;
                    query.updated_by_user = Session["user_id"].ToString();

                    var query2 = db_ats.force_leave_plan_dtl_tbl.Where(a =>
                       a.application_nbr == data2.application_nbr &&
                       a.flp_application_date == data2.flp_application_date).FirstOrDefault();
                    query2.rcrd_status = "L";

                    db_ats.SaveChangesAsync();
                }
                else
                {
                    var query = db_ats.force_leave_plan_hdr_tbl.Where(a =>
                        a.application_nbr == data.application_nbr).FirstOrDefault();
                    query.updated_dttm = DateTime.Now;
                    query.updated_by_user = Session["user_id"].ToString();

                    var query2 = db_ats.force_leave_plan_dtl_tbl.Where(a =>
                       a.application_nbr == data2.application_nbr &&
                       a.flp_application_date == data2.flp_application_date).FirstOrDefault();
                    query2.rcrd_status = "L";

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


        public ActionResult CheckExist_if_Delete(force_leave_plan_dtl_tbl data)
        {
            var lv_dtl = db_ats.leave_application_dtl_tbl.Where(a => a.empl_id == data.empl_id && a.leave_date_from == data.flp_application_date).ToList();
            int cntr_final_aproved = 0;

            if (lv_dtl != null)
            {
                for (int i = 0; i < lv_dtl.Count; i++)
                {
                    if (lv_dtl[i].rcrd_status.ToString() == "F")
                    {
                        cntr_final_aproved = cntr_final_aproved + 1;
                    }
                }
            }
            return Json(new { message = "success" , lv_dtl, cntr_final_aproved }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult TransferFLPlan(force_leave_plan_dtl_tbl data, DateTime transfered_date)
        {
            try
            {
                var message = "";
                var chk = db_ats.force_leave_plan_dtl_tbl.Where(a => a.empl_id == data.empl_id && a.flp_application_date == transfered_date).ToList();
                if (chk != null)
                {
                    for (int i = 0; i < chk.Count; i++)
                    {
                        if (chk[i].flp_application_date == transfered_date)
                        {
                            message = "invalid-date";
                            break;
                        }
                    }
                    if (message != "invalid-date")
                    {
                        // Update Force Leave Plan 
                        var fl_dtl = db_ats.force_leave_plan_dtl_tbl.Where(a => a.empl_id == data.empl_id && a.application_nbr == data.application_nbr && a.flp_application_date == data.flp_application_date).ToList();
                        fl_dtl.ForEach(a => a.rcrd_status = "L");

                        // Update Leave Applicaiton
                        var lv_dtl = db_ats.leave_application_dtl_tbl.Where(a => a.empl_id == data.empl_id && a.leave_date_from == data.flp_application_date).FirstOrDefault();
                        var lv_hdr = db_ats.leave_application_hdr_tbl.Where(a => a.empl_id == lv_dtl.empl_id && a.leave_ctrlno == lv_dtl.leave_ctrlno).FirstOrDefault();
                        lv_dtl.rcrd_status = "L";
                        lv_hdr.approval_status = "L";
                        lv_hdr.details_remarks = "Transferred FL Plan to ->" + transfered_date.ToString("yyyy-MM-dd");

                        // Insert to Force Leave Plan Applicaiton
                        data.application_nbr = data.application_nbr;
                        data.flp_application_date = transfered_date;
                        data.empl_id = data.empl_id;
                        data.rcrd_status = "F";
                        db_ats.force_leave_plan_dtl_tbl.Add(data);

                        // Insert to Leave Applicaiton
                        db_ats.sp_auto_apply_force_leave(data.empl_id, transfered_date, Session["user_id"].ToString()).FirstOrDefault();

                        db_ats.SaveChangesAsync();
                        message = "success";
                    }
                }
                else
                {
                    message = "already-exists!";
                }
                return Json(new { message, chk, data }, JsonRequestBehavior.AllowGet);

            }
            catch (Exception e)
            {
                return Json(new { message = e.Message.ToString() }, JsonRequestBehavior.AllowGet);
            }

        }

    }
}