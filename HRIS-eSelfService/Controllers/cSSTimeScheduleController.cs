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
    public class cSSTimeScheduleController : Controller
    {
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        User_Menu um = new User_Menu();
        // GET: cSSTimeSchedule
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
        // Created Date : 02/13/2020
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult initializeData()
        {
            try
            {
                string empl_id = Session["empl_id"].ToString();

                GetAllowAccess();
                string dept_code = Session["department_code"].ToString();
                string log_empl_id = Session["empl_id"].ToString();
                var empl_name = db.sp_employee_list_dept(empl_id).ToList();
                string log_in_as_AO = Session["log_in_as_AO"].ToString();

                var is_dtr_AO = db_ats.sp_employee_list_dtr_AO(Session["user_id"].ToString()).ToList()[0];

                return JSON(new { message = "success", um, empl_name, log_in_as_AO, log_empl_id, is_dtr_AO }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 02/19/2020
        // Description  : Edit existing record from table
        //*********************************************************************//
        public ActionResult CheckExist(string tse_ctrl_no, DateTime tse_effective_date, string par_empl_id)
        {
            try
            {
                var message = "";
                //var empl_id = Session["empl_id"].ToString();
                var empl_id = par_empl_id;
                var od = db_ats.time_schedule_empl_hdr_tbl.Where(a =>
                   a.tse_ctrl_no == tse_ctrl_no &&
                   a.tse_effective_date == tse_effective_date).FirstOrDefault();

                message = od == null ? "true" : "false";

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
        // Created Date : 02/13/2020
        // Description  : Select Employee Name Modal
        //*********************************************************************//
        public ActionResult SelectEmplName(
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
                //ADDED BY JORGE: 11/14/2021
                temp_template_code = "009";

                //var modalGridLst        = db_ats.sp_time_schedule_empl_tbl1(Session["empl_id"].ToString(), par_month, par_year, par_effective_date).ToList();
                var modalGridLst        = db_ats.sp_time_schedule_empl_tbl1(par_empl_id, par_month, par_year, par_effective_date).ToList();
                var timeSchedLst        = db_ats.sp_timeschedule_tbl_list().ToList();
                var no_of_wrkng_days    = db.sp_payrollregistry_get_dates(temp_template_code, par_year, par_month).ToList();
                var no_of_wrkng_hrs     = Convert.ToDecimal(no_of_wrkng_days[0].no_of_workdays * 8);

                //var time_schedule_empl_hdr_tbl = db_ats.sp_time_schedule_empl_hdr_tbl(Session["empl_id"].ToString()).ToList();
                var time_schedule_empl_hdr_tbl = db_ats.sp_time_schedule_empl_hdr_tbl(par_empl_id).ToList();

                return JSON(new { message = "success", timeSchedLst, modalGridLst, no_of_wrkng_hrs, no_of_wrkng_days, time_schedule_empl_hdr_tbl }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 02/13/2020
        // Description  : Select Employee Name Modal
        //*********************************************************************//
        public ActionResult CopyTimeSchedule(
            string par_empl_id
            , string par_tse_ctrl_no
            , string par_month
            , string par_year
            , DateTime par_effective_date)
        {
            try
            {

                //var query = db_ats.time_schedule_empl_hdr_tbl.Where(a =>    a.tse_month == par_month &&
                //                                                            a.tse_year == par_year &&
                //                                                            a.tse_effective_date == par_effective_date).FirstOrDefault();
                var query = db_ats.time_schedule_empl_hdr_tbl.Where(a => a.tse_month == par_month &&
                                                                           a.tse_year == par_year &&
                                                                           a.empl_id == par_empl_id).OrderByDescending(a=>a.tse_ctrl_no).FirstOrDefault();
                var shift_flag = "";
                if (query == null)
                {
                    //var copy_time_sched_date = db_ats.sp_time_schedule_empl_tbl_copy(par_tse_ctrl_no, Session["empl_id"].ToString(), par_month, par_year).ToList();

                    //var copy_time_sched_date = db_ats.sp_time_schedule_empl_tbl_copy(par_tse_ctrl_no, par_empl_id, par_month, par_year).ToList();
                    shift_flag = "1";
                    var copy_time_sched_date  =  db_ats.sp_time_schedule_empl_tbl_reg_sched(par_empl_id, par_month, par_year, par_effective_date).ToList();
                    return JSON(new { message = "success", copy_time_sched_date, shift_flag }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    shift_flag = "2";
                    par_effective_date = query.tse_effective_date;
                    //var copy_time_sched_date = db_ats.sp_time_schedule_empl_tbl1(Session["empl_id"].ToString(), par_month, par_year, par_effective_date).ToList();
                    var copy_time_sched_date = db_ats.sp_time_schedule_empl_tbl1(par_empl_id, par_month, par_year, par_effective_date).ToList();
                    return JSON(new { message = "success", copy_time_sched_date, shift_flag }, JsonRequestBehavior.AllowGet);
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
        // Created Date : 02/14/2020
        // Description  : Select Employee Name Modal
        //*********************************************************************//
        public ActionResult SelectTimeSched(string par_ts_code)
        {
            try
            {
                var timeSchedLst = db_ats.sp_timeschedule_tbl_list().ToList();
                var timeSchedData = db_ats.sp_timeschedule_tbl_list().Where(a => a.ts_code == par_ts_code).ToList();
                return JSON(new { message = "success", timeSchedData, timeSchedLst }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 02/19/2020
        // Description  : Add new record to table
        //*********************************************************************//
        public ActionResult Save(time_schedule_empl_hdr_tbl data, List<time_schedule_empl_dtl_tbl> data2)
        {
            try
            {
                var empl_id = data.empl_id;
                var tse_effective_date = data.tse_effective_date;
                var tse_month = data.tse_month;
                var tse_year = data.tse_year;

                var exits_check = db_ats.time_schedule_empl_hdr_tbl.Where(a =>
                   a.empl_id == empl_id &&
                   a.tse_effective_date == tse_effective_date &&
                   a.tse_month == tse_month &&
                   a.tse_year == tse_year &&
                   a.approval_status == "N"
                   ).FirstOrDefault();

                string tse_ctrl_nbr = "";

                if (exits_check == null)
                {
                    var new_ctrl_no = db_ats.sp_generate_appl_nbr("time_schedule_empl_hdr_tbl", 10, "tse_ctrl_no").ToList();
                    tse_ctrl_nbr = new_ctrl_no[0].ToString();
                    data.tse_ctrl_no = tse_ctrl_nbr;
                    //data.tse_month          = data2[0].tse_month;
                    //data.tse_year           = data2[0].tse_year;
                    //data.tse_effective_date = DateTime.Now;
                    data.approval_status = "N";
                    data.empl_id = data2[0].empl_id;
                    data.created_dttm = DateTime.Now;
                    data.created_by_user = Session["user_id"].ToString();
                    db_ats.time_schedule_empl_hdr_tbl.Add(data);

                }

                else
                {
                    tse_ctrl_nbr = data.tse_ctrl_no;
                    var od = db_ats.time_schedule_empl_dtl_tbl.RemoveRange(db_ats.time_schedule_empl_dtl_tbl.Where(a => a.tse_ctrl_no == tse_ctrl_nbr));
                }
               
                
                
                for (var x = 0; x < data2.Count; x++)
                {
                    var tse_dtl_id          = db_ats.sp_generate_appl_nbr("time_schedule_empl_dtl_tbl", 15, "tse_dtl_id").ToList();
                    data2[x].tse_dtl_id     = tse_dtl_id[0].ToString();
                    data2[x].tse_ctrl_no    = tse_ctrl_nbr;

                    db_ats.time_schedule_empl_dtl_tbl.Add(data2[x]);
                    db_ats.SaveChanges();
                }

                db_ats.SaveChanges();
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
        // Description  : delete all data of employee in table
        //*********************************************************************//
        public ActionResult SaveEdit(time_schedule_empl_hdr_tbl data, List<time_schedule_empl_dtl_tbl> data2, string tse_ctrl_no)
        {
            try
            {
                var query = db_ats.time_schedule_empl_hdr_tbl.Where(a => a.tse_ctrl_no == tse_ctrl_no).FirstOrDefault();
                query.updated_dttm      = DateTime.Now;
                query.updated_by_user   = Session["user_id"].ToString();
                query.shift_flag        = data.shift_flag;

                var od = db_ats.time_schedule_empl_dtl_tbl.RemoveRange(db_ats.time_schedule_empl_dtl_tbl.Where(a => a.tse_ctrl_no == tse_ctrl_no));
                for (var x = 0; x < data2.Count; x++)
                {
                    var tse_dtl_id          = db_ats.sp_generate_appl_nbr("time_schedule_empl_dtl_tbl", 15, "tse_dtl_id").ToList();
                    data2[x].tse_dtl_id     = tse_dtl_id[0].ToString();
                    data2[x].tse_ctrl_no    = tse_ctrl_no;

                    db_ats.time_schedule_empl_dtl_tbl.Add(data2[x]);
                    db_ats.SaveChanges();

                }

                db_ats.SaveChanges();
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
        // Description  : delete all data of employee in table
        //*********************************************************************//
        public ActionResult SaveSubmit(time_schedule_empl_hdr_tbl data, List<time_schedule_empl_dtl_tbl> data2)
        {
            try
            {
                var app_id = db.sp_insert_transaction_to_approvalworkflow_tbl(Session["user_id"].ToString(), data2[0].empl_id.ToString(), "110").ToList();

                var new_ctrl_no      = db_ats.sp_generate_appl_nbr("time_schedule_empl_hdr_tbl", 10, "tse_ctrl_no").ToList();
                data.tse_ctrl_no     = new_ctrl_no[0].ToString();
                //data.tse_month       = data2[0].tse_month;
                //data.tse_year        = data2[0].tse_year;
                data.approval_status = "S";
                data.approval_id     = app_id[0].ToString();
                data.empl_id         = data2[0].empl_id;
                data.created_dttm    = DateTime.Now;
                data.created_by_user = Session["user_id"].ToString();

                var user_empl_id    = Session["empl_id"].ToString();
                var user_is_reviewer = db.transactionsapprover_tbl.Where(a => a.transaction_code == "110" &&
                                                                                    a.empl_id == user_empl_id &&
                                                                                    a.workflow_authority == "0").FirstOrDefault();
                if (user_is_reviewer != null)
                {
                    data.approval_status = "R";
                    var transac_apprvr = db.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), data.approval_status, "Auto Reviewed");
                }
                string user_id = Session["user_id"].ToString();
                var trans_ref2 = db_ats.sp_ss_auto_approval(user_id, "110").ToList();

                if (trans_ref2[0].auto_status != "")
                {
                    data.approval_status = trans_ref2[0].auto_status;
                    data.details_remarks = trans_ref2[0].auto_remarks;
                    var transac_apprvr = db.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), data.approval_status, data.details_remarks);
                }

                db_ats.time_schedule_empl_hdr_tbl.Add(data);

                for (var x = 0; x < data2.Count; x++)
                {
                    var tse_dtl_id          = db_ats.sp_generate_appl_nbr("time_schedule_empl_dtl_tbl", 15, "tse_dtl_id").ToList();
                    data2[x].tse_dtl_id     = tse_dtl_id[0].ToString();
                    data2[x].tse_ctrl_no    = new_ctrl_no[0].ToString();

                    db_ats.time_schedule_empl_dtl_tbl.Add(data2[x]);
                    db_ats.SaveChanges();

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
        // Created Date : 01/13/2020
        // Description  : delete all data of employee in table
        //*********************************************************************//
        public ActionResult EditSubmit(List<time_schedule_empl_dtl_tbl> data2, string tse_ctrl_no)
        {
            try
            {
                var app_id = db.sp_insert_transaction_to_approvalworkflow_tbl(Session["user_id"].ToString(), data2[0].empl_id.ToString(), "110").ToList();
                
                var query               = db_ats.time_schedule_empl_hdr_tbl.Where(a => a.tse_ctrl_no == tse_ctrl_no).FirstOrDefault();
                query.updated_dttm      = DateTime.Now;
                query.updated_by_user   = Session["user_id"].ToString();
                query.approval_id       = app_id[0].ToString();

                var user_empl_id = Session["empl_id"].ToString();
                var user_is_reviewer = db.transactionsapprover_tbl.Where(a => a.transaction_code == "110" &&
                                                                                    a.empl_id == user_empl_id &&
                                                                                    a.workflow_authority == "0").FirstOrDefault();
                if (user_is_reviewer != null)
                {
                    query.approval_status = "R";
                    var transac_apprvr = db.sp_update_transaction_in_approvalworkflow_tbl(app_id[0].ToString(), Session["user_id"].ToString(), "R", "Auto Reviewed");
                }
                else
                {
                    query.approval_status = "S";
                }
                string user_id = Session["user_id"].ToString();
                var trans_ref2 = db_ats.sp_ss_auto_approval(user_id, "110").ToList();

                if (trans_ref2[0].auto_status != "")
                {
                    query.approval_status = trans_ref2[0].auto_status;
                    query.details_remarks = trans_ref2[0].auto_remarks;
                    var transac_apprvr = db.sp_update_transaction_in_approvalworkflow_tbl(app_id[0].ToString(), Session["user_id"].ToString(), query.approval_status, query.details_remarks);
                }
                
                var od = db_ats.time_schedule_empl_dtl_tbl.RemoveRange(db_ats.time_schedule_empl_dtl_tbl.Where(a => a.tse_ctrl_no == tse_ctrl_no));
                for (var x = 0; x < data2.Count; x++)
                {
                    var tse_dtl_id          = db_ats.sp_generate_appl_nbr("time_schedule_empl_dtl_tbl", 15, "tse_dtl_id").ToList();
                    data2[x].tse_dtl_id     = tse_dtl_id[0].ToString();
                    data2[x].tse_ctrl_no    = tse_ctrl_no;

                    db_ats.time_schedule_empl_dtl_tbl.Add(data2[x]);
                    db_ats.SaveChanges();
                }

                db_ats.SaveChanges();
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
        public ActionResult Delete(string tse_ctrl_no)
        {
            try
            {
                var od = db_ats.time_schedule_empl_hdr_tbl.Where(a => a.tse_ctrl_no == tse_ctrl_no).FirstOrDefault();
                string message = "";
                if (od != null)
                {
                    db_ats.time_schedule_empl_hdr_tbl.Remove(od);
                    var query = db_ats.time_schedule_empl_dtl_tbl.RemoveRange(db_ats.time_schedule_empl_dtl_tbl.Where(a => a.tse_ctrl_no == tse_ctrl_no));

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

        public ActionResult WithdrawSubmission(time_schedule_empl_hdr_tbl data)
        {
            try
            {
                var transac_apprvr = db.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), data.approval_status, data.details_remarks);

                var query = db_ats.time_schedule_empl_hdr_tbl.Where(a =>
                    a.tse_ctrl_no == data.tse_ctrl_no).FirstOrDefault();
                query.approval_status = data.approval_status;
                query.details_remarks = data.details_remarks;
                query.updated_by_user = Session["user_id"].ToString();
                query.updated_dttm = DateTime.Now;

                db_ats.SaveChangesAsync();
                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 02/13/2020
        // Description  : Select Employee Name Modal
        //*********************************************************************//
        public ActionResult RegularShift(
            string par_empl_id
            , string par_month
            , string par_year
            , DateTime par_effective_date
            , string tab)
        {
            try
            {
                if (tab == "tab1")
                {
                    //var query = db_ats.sp_time_schedule_empl_tbl1(Session["empl_id"].ToString(), par_month, par_year, par_effective_date).ToList();
                    var query = db_ats.sp_time_schedule_empl_tbl1(par_empl_id, par_month, par_year, par_effective_date).ToList();
                    return JSON(new { message = "success", query }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    //var query = db_ats.sp_time_schedule_empl_tbl_reg_sched(Session["empl_id"].ToString(), par_month, par_year, par_effective_date).ToList();
                    var query = db_ats.sp_time_schedule_empl_tbl_reg_sched(par_empl_id, par_month, par_year, par_effective_date).ToList();
                    return JSON(new { message = "success", query }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}