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
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
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
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
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
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
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
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
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
                var message = "success";
                var message_descr = "";
                var message_descr2 = "";
                var justi = db.leave_application_hdr_justi_tbl.Where(a => a.empl_id == data.empl_id && a.leave_ctrlno == data.leave_ctrlno).FirstOrDefault();
                if (data.approval_status == "F" || data.approval_status == "R")
                {
                    //if (data.leave_type_code  == "SL" || data.leave_type_code == "SP" || data.leave_type_code == "PS")
                    //{
                        if (justi == null)
                        {
                            var dt_chk_tse = db.tse_check_tbl.Where(a => a.empl_id == data.empl_id).FirstOrDefault();
                            var leave_dtl = db.leave_application_dtl_tbl.Where(a => a.empl_id == data.empl_id && a.leave_ctrlno == data.leave_ctrlno).ToList();

                            for (int x = 0; x < leave_dtl.Count; x++)
                            {
                                var leave_date_from = leave_dtl[x].leave_date_from;
                                var leave_date_to   = leave_dtl[x].leave_date_to;
                                System.DateTime date_applied        = new System.DateTime(DateTime.Parse(data.date_applied.ToString()).Year, DateTime.Parse(data.date_applied.ToString()).Month, DateTime.Parse(data.date_applied.ToString()).Day);
                                System.DateTime date_leave_date_to  = new System.DateTime(leave_date_to.Year, leave_date_to.Month, leave_date_to.Day);
                            
                                var day_diff = (date_applied - date_leave_date_to).TotalDays; 

                                if (dt_chk_tse == null)
                                {

                                    for (int i = 0; i < (date_applied - date_leave_date_to).TotalDays; i++)
                                    {
                                        DateTime leave_date_to_loop =  date_leave_date_to.AddDays(i);
                                        if (leave_date_to_loop.DayOfWeek.ToString() == "Sunday" ||
                                            leave_date_to_loop.DayOfWeek.ToString() == "Saturday")
                                        {
                                            day_diff = day_diff - 1;
                                        }

                                        var is_holiday = db_dev.holidays_tbl.Where(a => a.holiday_date == leave_date_to_loop).FirstOrDefault();
                                        if (is_holiday != null)
                                        {
                                            day_diff = day_diff - 1;
                                        }
                                    }
                            
                                    if (day_diff > 5 && (data.justification_flag == false || justi ==null))
                                    {
                                        message         = "5_adv_validation";
                                        message_descr   = "Date Applied: " + DateTime.Parse(date_applied.ToString()).ToLongDateString() + "\n Application Nbr.: " + data.leave_ctrlno + "\n Date Application from :" + leave_date_from.ToLongDateString() + "\n Date Application to: " + leave_date_to.ToLongDateString();
                                        message_descr2  = " You have to Submit Justification letter, The leave is more than 5 days before you actioned!";
                                    }

                                }
                                else
                                {
                                    for (int i = 0; i < (date_applied - date_leave_date_to).TotalDays; i++)
                                    {
                                        DateTime leave_date_to_loop = date_leave_date_to.AddDays(i);
                                        var is_holiday = db_dev.holidays_tbl.Where(a => a.holiday_date == leave_date_to_loop).FirstOrDefault();
                                        if (is_holiday != null)
                                        {
                                            day_diff = day_diff - 1;
                                        }
                                    }

                                    if (day_diff > 5 && (data.justification_flag == false || justi == null))
                                    {
                                        message = "5_adv_validation";
                                        message_descr = "Date Applied: " + DateTime.Parse(date_applied.ToString()).ToLongDateString() + "\n Application Nbr.: " + data.leave_ctrlno + "\n Date Application from :" + leave_date_from.ToLongDateString() + "\n Date Application to: " + leave_date_to.ToLongDateString();
                                        message_descr2 = " You have to Submit Justification letter, The leave is more than 5 days before you actioned!";
                                    }
                                }
                            }
                        }
                    //}
                }

                if (message == "success")
                {
                    var transac_apprvr      = db_dev.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), data.approval_status, data.details_remarks);

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
                    message = "success";
                }
                db.SaveChangesAsync();
                return JSON(new { message, message_descr, message_descr2, justi }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
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
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult Retrieve_LeaveHistory(string leave_ctrlno, string empl_id)
        {
            try
            {
                var data = db.func_lv_ledger_history_notif(leave_ctrlno, empl_id).OrderByDescending(a => a.created_dttm).ToList();
                return Json(new { message = "success", data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult Save_Justification(leave_application_hdr_justi_tbl data)
        {
            try
            {
                var message = "";
                if (data.justi_date == null)
                {
                    message = "Justification Date is Required!";
                }
                else if (data.justi_reason == null)
                {
                    message = "Justification Reason is Required!";
                }
                else
                {
                    var data_chk = db.leave_application_hdr_justi_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno && a.empl_id == data.empl_id).FirstOrDefault();

                    if (data_chk ==null)
                    {
                        data.created_dttm           = DateTime.Now;
                        data.created_by             = Session["user_id"].ToString();
                        db.leave_application_hdr_justi_tbl.Add(data);
                    }
                    else
                    {
                        var data_upd = db.leave_application_hdr_justi_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno && a.empl_id == data.empl_id).OrderByDescending(a=>a.id).FirstOrDefault();
                        
                        data_upd.summernote_descr          = data.summernote_descr        ;
                        data_upd.updated_dttm              = DateTime.Now                 ;
                        data_upd.updated_by                = Session["user_id"].ToString();
                        data_upd.justi_date                = data.justi_date              ;
                        data_upd.justi_reason              = data.justi_reason            ;
                        data_upd.justi_employee_name       = data.justi_employee_name     ;
                        data_upd.justi_employee_position   = data.justi_employee_position ;
                        data_upd.justi_noted_by            = data.justi_noted_by          ;
                        data_upd.justi_noted_desig         = data.justi_noted_desig       ;
                    }

                    var update_hdr = db.leave_application_hdr_tbl.Where(a => a.empl_id == data.empl_id && a.leave_ctrlno == data.leave_ctrlno).FirstOrDefault();
                    update_hdr.justification_flag = true;

                    db.SaveChangesAsync();
                    message = "success";
                }

                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult Retrieve_Justification(string leave_ctrlno, string empl_id)
        {
            try
            {
                var department_code = Session["department_code"].ToString();
                var dpt_tbl = db_dev.departments_tbl.Where(a => a.department_code == department_code).FirstOrDefault();
                var approved_name = db_dev.vw_personnelnames_PAY.Where(a => a.empl_id == dpt_tbl.empl_id.ToString().Trim()).FirstOrDefault().employee_name_format2.ToString().Trim().ToUpper();
                var approved_by_desig = dpt_tbl.designation_head1.ToString().Trim().ToUpper();
                var employee_name = Session["first_name"].ToString() + " " + Session["last_name"];

                var data = db.leave_application_hdr_justi_tbl.Where(a=> a.leave_ctrlno == leave_ctrlno && a.empl_id == empl_id).OrderByDescending(a=>a.id).FirstOrDefault();
                 return Json(new { message = "success", data, approved_name, approved_by_desig, dpt_tbl , employee_name }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}