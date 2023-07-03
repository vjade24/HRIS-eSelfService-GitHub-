//*********************************************************************//
// Created By   : Vincent Jade Alivio
// Created Date : 04/07/2020
// Description  : Leave Application Controller
//*********************************************************************//

using HRIS_eSelfService.Models;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eSelfService.Controllers
{
    public class cSSLeaveApplController : Controller
    {
        HRIS_DEVEntities db_dev = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        User_Menu um = new User_Menu();
        // GET: cSSLeaveAppl
        public ActionResult Index()
        {
            db_ats.Database.CommandTimeout = int.MaxValue;
            db_dev.Database.CommandTimeout = int.MaxValue;
            User_Menu um = new User_Menu();
            try
            {

                if (um != null || um.ToString() != "")
                {
                    GetAllowAccess();
                }
                return View(um);

            }
            catch (Exception)
            {
                return RedirectToAction("Index", "Login");
            }
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
        // Created By   : Vincent Jade Alivio
        // Created Date : 03/05/2020
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult InitializeData()
        {
            try
            {

                db_ats.Database.CommandTimeout = int.MaxValue;
                db_dev.Database.CommandTimeout = int.MaxValue;

                GetAllowAccess();
                var user_info           = db_dev.sp_userprofile_tbl(um.user_id).FirstOrDefault();
                string dept_code        = Session["department_code"].ToString();
                string log_in_as_AO     = Session["log_in_as_AO"].ToString();
                string par_log_in_as_AO = (Session["log_in_as_AO"].ToString() == "True") ? "1" : "0";
                var dept_name           = db_dev.vw_departments_tbl_list.Where(a => a.department_code == dept_code.ToString()).ToList()[0].department_name1;

                string empl_id  = Session["empl_id"].ToString();

                var status       = db_ats.sp_approval_status_list().ToList();
                var empl_name    = db_ats.sp_employee_list_without_jo(empl_id);
                var holiDate     = db_dev.sp_holidays_tbl_list(Int32.Parse(DateTime.Now.Year.ToString())).ToList();
                var leaveType    = db_ats.sp_leavetype_tbl_list1().Where(a => a.leavetype_code != "CTO").ToList();
                var leaveSubType = db_ats.sp_leavesubtype_tbl_list("").ToList();
                var leaveLst     = db_ats.sp_leave_application_tbl_list(user_info.empl_id, "", DateTime.Now.Year.ToString()).Where(a=>a.leave_type_code != "CTO").ToList();
                var leaveLst1    = db_ats.sp_leave_application_tbl_list1(user_info.empl_id, "", DateTime.Now.Year.ToString(), par_log_in_as_AO, Session["user_id"].ToString()).Where(a => a.leave_type_code != "CTO").ToList();

                // **********************************************************************************************
                // ********** All Balance All Leave Type ********************************************************
                // **********************************************************************************************
                var leavetype = db_ats.leavetype_tbl.Where(a=> a.leavetype_code != "PL" &&   //PL = Paternity Leave
                                                               a.leavetype_code != "PS" &&   // PS = Parental Leave (Solo Parent)
                                                               a.leavetype_code != "ML" &&   // ML = Maternity Leave
                                                               a.leavetype_code != "MZ" &&   // MZ = Monetization Leave
                                                               a.leavetype_code != "TL" &&   // TL	Terminal Leave
                                                               a.leavetype_code != "MC" &&   // MC = Magna Carta
                                                               a.leavetype_code != "QT" &&   // QT - Quarantine
                                                               a.leavetype_code != "AL" &&   // QT - Adoption Leave
                                                               a.leavetype_code != "CAL" &&   // Special Emergency (Calamity)
                                                               a.leavetype_code != "VWC" &&     // QT - 10-Day VAWC Leave
                                                               a.leavetype_code != "SBW" &&     // QT - 10-Day VAWC Leave
                                                               a.leavetype_code != "RH" &&     // QT - 10-Day VAWC Leave
                                                               a.leavetype_code != "MC16" &&     // QT -MC No. 16, S. 2021
                                                               a.leavetype_code != "MC" &&     // QT - Magna Carta for Women
                                                               a.leavetype_code != "STL"     // QT - Study Leave
                                                          ).ToList();
                List<sp_leave_application_curr_bal_Result> data_all_bal = new List<sp_leave_application_curr_bal_Result>();

                for (int x = 0; x < leavetype.Count; x++)
                {
                    sp_leave_application_curr_bal_Result data2 = new sp_leave_application_curr_bal_Result();
                    data2 = db_ats.sp_leave_application_curr_bal(empl_id, DateTime.Now.Year.ToString(), leavetype[x].leavetype_code).FirstOrDefault();
                    data_all_bal.Add(data2);
                }
                // **********************************************************************************************
                // **********************************************************************************************

                // **********************************************************************************************
                // ********** All Force leave Plan      ********************************************************
                // **********************************************************************************************
                var fl_plan_lst = db_ats.sp_force_leave_plan_tbl_list(empl_id, "", DateTime.Now.Year.ToString()).ToList();
                // **********************************************************************************************
                // **********************************************************************************************
                var cancellation_calendar = db_ats.leave_application_cancel_tbl.Where(a => a.empl_id == empl_id).ToList();

                

                return JSON(new { message = "success", um, log_in_as_AO, dept_name, leaveLst, leaveLst1, leaveType, leaveSubType, holiDate, status, empl_name, user_info, data_all_bal, fl_plan_lst, cancellation_calendar }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.InnerException.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade Alivio
        // Created Date : 05/05/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult FilterPageGrid(string p_empl_id, string p_appr_status, string p_year)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                db_dev.Database.CommandTimeout = int.MaxValue;

                string par_log_in_as_AO     = Session["log_in_as_AO"].ToString() == "True" ? "1" : "0";
                var filteredGrid            = db_ats.sp_leave_application_tbl_list(p_empl_id, p_appr_status, p_year).Where(a => a.leave_type_code != "CTO").ToList();
                var filteredGrid1           = db_ats.sp_leave_application_tbl_list1(p_empl_id, p_appr_status, p_year, par_log_in_as_AO, Session["user_id"].ToString()).Where(a => a.leave_type_code != "CTO").ToList();
                var holiDate                = db_dev.sp_holidays_tbl_list(Int32.Parse(p_year)).ToList();
                var cancellation_calendar   = db_ats.leave_application_cancel_tbl.Where(a => a.empl_id == p_empl_id).ToList();

                return JSON(new { message = "success", filteredGrid, filteredGrid1, holiDate, cancellation_calendar }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.InnerException.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade Alivio
        // Created Date : 05/15/2020
        // Description  : Get last code 
        //*********************************************************************//
        public ActionResult GenerateNewApplNbr(string par_empl_id, string par_year, string par_leave_type)
        {
            try
            {
                var new_appl_nbr = db_ats.sp_generate_appl_nbr("leave_application_hdr_tbl", 8, "leave_ctrlno").ToList();
                var holiDate = db_dev.sp_holidays_tbl_list(Int32.Parse(par_year)).ToList();
                // var leavetype_balances = db_ats.sp_leavetype_current_bal(par_empl_id).ToList();
                var cto_balance         = db_ats.sp_leave_application_curr_bal(par_empl_id, par_year, "CTO").ToList();
                var vl_current_balance  = db_ats.sp_leave_application_curr_bal(par_empl_id, par_year, "VL").ToList();
                var sl_current_balance  = db_ats.sp_leave_application_curr_bal(par_empl_id, par_year, "SL").ToList();
                var sp_current_balance  = db_ats.sp_leave_application_curr_bal(par_empl_id, par_year, "SP").ToList();
                var fl_current_balance  = db_ats.sp_leave_application_curr_bal(par_empl_id, par_year, "FL").ToList();
                
                if (par_leave_type != "" || par_leave_type != null)
                {
                    var available_leave = db_ats.sp_available_leave(par_empl_id, par_year, par_leave_type, "leave_application_dtl_tbl", "leave_dates", "empl_id", "rcrd_status").ToList();
                    return Json(new { message = "success", new_appl_nbr, available_leave, holiDate,
                        cto_balance
                        ,vl_current_balance
                        ,sl_current_balance
                        ,sp_current_balance
                        ,fl_current_balance
                    }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    var available_leave = "";
                    return Json(new { message = "success", new_appl_nbr, available_leave, holiDate,
                        cto_balance
                        ,vl_current_balance
                        ,sl_current_balance
                        ,sp_current_balance
                        ,fl_current_balance
                    }, JsonRequestBehavior.AllowGet);
                }
                
            }
            catch (Exception e)
            {
                string message = e.InnerException.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade Alivio
        // Created Date : 05/15/2020
        // Description  : Get last code 
        //*********************************************************************//
        public ActionResult GetLeaveSubType(string par_leave_type, string par_empl_id, string par_year)
        {
            try
            {
                var message             = "";
                var message_descr2      = "";
                var chk_par_leave_type  = par_leave_type;
                var current_balance     = db_ats.sp_leave_application_curr_bal(par_empl_id, par_year, par_leave_type).ToList().FirstOrDefault();
                //var leave_oth_info      = db_ats.leavetype_oth_info_tbl.Where(a=> a.leavetype_code == par_leave_type).ToList();
                var fl_chk              = db_ats.sp_force_leave_plan_tbl_list_chk(par_empl_id, par_year).Where(a=> a.approval_status == "F").ToList();
                
                if (par_leave_type == "FL")
                {
                    par_leave_type = "VL";
                }

                var leaveSubLst         = db_ats.sp_leavesubtype_tbl_list(par_leave_type).ToList();

                var leave_projection    = "0";
                var vl_leave_projection = "";
                message                 = "success";


                var dt_chk_tse = db_ats.tse_check_tbl.Where(a => a.empl_id == par_empl_id).FirstOrDefault();

                if (dt_chk_tse == null)
                {
                    // ***************************************************************************************************
                    // *** VJA - 2022-06-03 03:48PM - Force Leave Validation, user cannot apply FL without FL Plan 
                    // ***************************************************************************************************
                    //if (chk_par_leave_type == "FL" && (fl_chk == null || fl_chk.Count <= 0))
                    if (chk_par_leave_type == "FL" && (fl_chk == null || fl_chk.Count <= 4))
                    {
                        message        = "no-fl-plan";
                        message_descr2 = "You need to Approve your five (5) Force Leave Plan year " + DateTime.Now.Year.ToString() + ", you have (" + (5 - fl_chk.Count()).ToString() + ") remaining Force leave Plan to be apply/approve.";
                    }
                    // ***************************************************************************************************
                }

                return Json(new { message, leaveSubLst, leave_projection, vl_leave_projection, current_balance , message_descr2 }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {

                string message = e.InnerException.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade Alivio
        // Created Date : 03/02/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult GetDetailsData(string p_leave_ctrlno , string par_year)
        {
            try
            {
                var flpDtlLst = db_ats.sp_leave_application_dtl_tbl_list(p_leave_ctrlno).ToList();

                string creator = (flpDtlLst[0].created_by_user == Session["user_id"].ToString()) ? "true" : "false";

                var user_is_reviewer = db_dev.transactionsapprover_tbl.Where(a => a.transaction_code == "002" &&
                                                                          a.empl_id == Session["empl_id"].ToString() &&
                                                                          a.workflow_authority == "true");
                var reviewer = (user_is_reviewer != null) ? "true" : "false";

                var lv_hdr             = db_ats.leave_application_hdr_tbl.Where(a => a.leave_ctrlno == p_leave_ctrlno).FirstOrDefault();

                var cto_balance        = lv_hdr.leaveledger_balance_as_of_oth;
                var vl_current_balance = lv_hdr.leaveledger_balance_as_of_vl;
                var sl_current_balance = lv_hdr.leaveledger_balance_as_of_sl;
                var sp_current_balance = lv_hdr.leaveledger_balance_as_of_sp;
                var fl_current_balance = lv_hdr.leaveledger_balance_as_of_fl;

                var lv_cancellation_lst = db_ats.leave_application_cancel_tbl.Where(a => a.empl_id == lv_hdr.empl_id).ToList().OrderBy(a => a.created_dttm);

                return JSON(new { message = "success", flpDtlLst, creator, reviewer
                    ,cto_balance
                    ,vl_current_balance
                    ,sl_current_balance
                    ,sp_current_balance
                    ,fl_current_balance
                    ,lv_hdr
                    ,lv_cancellation_lst
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.InnerException.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade Alivio
        // Created Date : 03/02/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult CheckExist(List<leave_application_dtl_tbl> data2, leave_application_hdr_tbl data, List<leave_application_dtl_cto_tbl> data3, string p_action_mode, string par_year)
        {
            try
            {
                var message         = "";
                var message_descr   = "";
                var message_descr2  = "";

                for (var x = 0; x < data2.Count; x++)
                {
                    var id              = data2[x].empl_id;
                    var leave_date_from = data2[x].leave_date_from;
                    var leave_date_to   = data2[x].leave_date_to;
                    var appl_nbr        = data2[x].leave_ctrlno;

                    var od = db_ats.leave_application_dtl_tbl.Where(a =>
                                                                    a.empl_id == id &&
                                                                    ((a.leave_date_from >= leave_date_from && a.leave_date_from <= leave_date_to) ||
                                                                     (a.leave_date_to >= leave_date_from && a.leave_date_to <= leave_date_to)) &&
                                                                    (a.rcrd_status != "L" && a.rcrd_status != "D") &&
                                                                    a.leave_ctrlno != appl_nbr
                                                                    ).FirstOrDefault();

                    var dt_chk_tse = db_ats.tse_check_tbl.Where(a => a.empl_id == data.empl_id).FirstOrDefault();

                    if (od != null)
                    {
                        message = (message + " *" + data2[x].leave_date_from.ToString("yyyy-MM-dd") + " - " + data2[x].leave_date_to.ToString("yyyy-MM-dd"));
                    }
                    if (dt_chk_tse != null)
                    {
                        if (data.leave_type_code != "ML")
                        {
                            System.DateTime firstDate   = new System.DateTime(leave_date_from.Year, leave_date_from.Month, leave_date_from.Day);
                            System.DateTime secondDate  = new System.DateTime(leave_date_to.Year, leave_date_to.Month, leave_date_to.Day);

                            time_schedule_empl_hdr_tbl timesked_chk_1st = new time_schedule_empl_hdr_tbl();
                            time_schedule_empl_hdr_tbl timesked_chk_2nd = new time_schedule_empl_hdr_tbl();
                            int days_cnt = int.Parse((secondDate - firstDate).TotalDays.ToString()) + 1;
                            for (int i = 0; i < days_cnt; i++)
                            {
                                timesked_chk_1st = db_ats.time_schedule_empl_hdr_tbl.Where(a => a.empl_id == data.empl_id
                                                                                    &&
                                                                                    ((a.tse_year == firstDate.Year.ToString()
                                                                                    && a.tse_month == (firstDate.Month <= 9 ? "0" + firstDate.Month.ToString() : firstDate.Month.ToString()))
                                                                                    //&&
                                                                                    // (a.tse_year == secondDate.Year.ToString()
                                                                                    //&& a.tse_month == (secondDate.Month <= 9 ? "0" + secondDate.Month.ToString() : secondDate.Month.ToString()))
                                                                                    )
                                                                                    && a.approval_status == "F").ToList().OrderByDescending(a => a.tse_effective_date).FirstOrDefault();

                                timesked_chk_2nd = db_ats.time_schedule_empl_hdr_tbl.Where(a => a.empl_id == data.empl_id
                                                                                    &&
                                                                                    ((a.tse_year == secondDate.Year.ToString()
                                                                                    && a.tse_month == (secondDate.Month <= 9 ? "0" + secondDate.Month.ToString() : secondDate.Month.ToString()))
                                                                                    //&&
                                                                                    // (a.tse_year == secondDate.Year.ToString()
                                                                                    //&& a.tse_month == (secondDate.Month <= 9 ? "0" + secondDate.Month.ToString() : secondDate.Month.ToString()))
                                                                                    )
                                                                                    && a.approval_status == "F").ToList().OrderByDescending(a => a.tse_effective_date).FirstOrDefault();

                                if (timesked_chk_1st == null || timesked_chk_2nd == null)
                                {
                                    message = "timesked_validation";
                                    message_descr = "No time Schedule for this Year and Month " + firstDate.ToLongDateString();
                                    message_descr2 = "You are not allowed to Apply Leave application!";
                                }
                            }
                        }

                    }
                    if (data.leave_type_code  == "CTO")   // CTO
                    {
                        var cntr = 0;
                        if (data2 != null)
                        {
                            for (int i = 0; i < data2.Count; i++)
                            {
                                var chk_1 = db_ats.leave_application_dtl_tbl.Where(a => a.empl_id == data.empl_id && (a.rcrd_status == "L" || a.rcrd_status == "D")).ToList();
                                // ******************************************************************
                                // ** VJA - 2022-06-15 - Validation for Restored on Posteiong, ******
                                //                      Dapat pwedi pa maka apply balikd       ******
                                // ******************************************************************
                                for (int y = 0; y < chk_1.Count; y++)
                                {
                                    if (chk_1[y].leave_date_from == data2[i].leave_date_from ||
                                        chk_1[y].leave_date_to   == data2[i].leave_date_to)
                                    {
                                        cntr = cntr + 1;
                                    }

                                }
                                // ******************************************************************
                                // ******************************************************************

                                if (cntr <= 0)
                                {
                                    if (data2[i].leave_date_from < data.date_applied ||
                                        data2[i].leave_date_to < data.date_applied)
                                    {
                                        message         = "cto_validation";
                                        message_descr   = "Date Applied: " + DateTime.Parse(data.date_applied.ToString()).ToString("yyyy-MM-dd") + "\n Application Nbr.: " + data2[i].leave_ctrlno + "\n Date Application from :" + data2[i].leave_date_from.ToString("yyyy-MM-dd") + "\n Date Application to: " + data2[i].leave_date_to.ToString("yyyy-MM-dd");
                                        message_descr2  = " Application Date Applied is behind than your Date of Filing!";
                                    }

                                    // Other Consideration : 2021-11-23 : VJA 
                                    // ****  User cannot save if the application date is present and beyond 01:00PM in the afternoon
                                    else if ((data2[i].leave_date_from <= data.date_applied ||
                                                data2[i].leave_date_to <= data.date_applied)
                                             &&
                                             (data2[i].date_num_day_total < 8 && DateTime.Now.Hour >= 13 && p_action_mode == "SUBMIT"))
                                    {
                                        message = "cto_validation";
                                        message_descr = "Date Applied: " + DateTime.Parse(data.date_applied.ToString()).ToString("yyyy-MM-dd") + "\n Application Nbr.: " + data2[i].leave_ctrlno + "\n Date Application from :" + data2[i].leave_date_from.ToString("yyyy-MM-dd") + "\n Date Application to: " + data2[i].leave_date_to.ToString("yyyy-MM-dd");
                                        message_descr2 = " Application Date Applied is behind than your Date of Filing and you applied beyond 1:00PM Today!";
                                    }
                                    // Other Consideration : 2021-11-23 : VJA 
                                    //  **** User cannot save if the application date is present and he/she select whole day or 8 hours or greater that 8
                                    else if ((data2[i].leave_date_from <= data.date_applied ||
                                                data2[i].leave_date_to <= data.date_applied)
                                             &&
                                             data2[i].date_num_day_total >= 8
                                             &&
                                             p_action_mode == "SUBMIT")
                                    {
                                        message         = "cto_validation";
                                        message_descr   = "Date Applied: " + DateTime.Parse(data.date_applied.ToString()).ToString("yyyy-MM-dd") + "\n Application Nbr.: " + data2[i].leave_ctrlno + "\n Date Application from :" + data2[i].leave_date_from.ToString("yyyy-MM-dd") + "\n Date Application to: " + data2[i].leave_date_to.ToString("yyyy-MM-dd");
                                        message_descr2  = " Application is invalid because you selected 8 hours or whole day application, apply with half day instead to continue this transaction!";
                                    }
                                    // Other Consideration : 2022-07-01 : VJA 
                                    // ****  User cannot apply half day morning CTO if the date of filing is 08:00AM-12:00PM !
                                    else if ((data2[i].leave_date_from <= data.date_applied ||
                                                data2[i].leave_date_to <= data.date_applied)
                                             &&
                                             (data2[i].date_num_day_total < 8 
                                             && (DateTime.Now.Hour >= 1 && DateTime.Now.Hour <= 12)
                                             && data3[x].cto_remarks != null
                                             && data3[x].cto_remarks.ToString().Trim().Contains("8")
                                             ))
                                    {
                                        message = "cto_validation";
                                        message_descr = "Date Applied: " + DateTime.Parse(data.date_applied.ToString()).ToString("yyyy-MM-dd") + "\n Application Nbr.: " + data2[i].leave_ctrlno + "\n Date Application from :" + data2[i].leave_date_from.ToString("yyyy-MM-dd") + "\n Date Application to: " + data2[i].leave_date_to.ToString("yyyy-MM-dd");
                                        message_descr2 = " - You cannot apply half day morning CTO if your date of filing is 08:00AM-12:00PM !";
                                    }
                                }

                            }
                        }
                    }
                    if (data.leave_type_code  == "FL")   // Force Leave Validation Effective June 1, 2022
                    {


                        var cntr = 0;
                        if (data2 != null)
                        {
                            for (int i = 0; i < data2.Count; i++)
                            {
                                var chk_1 = db_ats.leave_application_dtl_tbl.Where(a => a.empl_id == data.empl_id && (a.rcrd_status == "L" || a.rcrd_status == "D")).ToList();

                                // ******************************************************************
                                // ** VJA - 2022-06-15 - Validation for Restored on Posteiong, ******
                                //                      Dapat pwedi pa maka apply balikd       ******
                                // ******************************************************************
                                for (int y = 0; y < chk_1.Count; y++)
                                {
                                    if (chk_1[y].leave_date_from == data2[i].leave_date_from ||
                                        chk_1[y].leave_date_to == data2[i].leave_date_to)
                                    {
                                        cntr = cntr + 1;
                                    }

                                }
                                // ******************************************************************
                                // ******************************************************************

                                if (cntr <= 0)
                                {
                                    if ((data2[i].leave_date_from >= DateTime.Parse("2022-06-01") ||
                                        data2[i].leave_date_to >= DateTime.Parse("2022-06-01"))
                                        &&
                                        (data2[i].leave_date_from <= data.date_applied ||
                                        data2[i].leave_date_to <= data.date_applied))
                                    {
                                        message = "fl_validation";
                                        message_descr = "Date Applied: " + DateTime.Parse(data.date_applied.ToString()).ToString("yyyy-MM-dd") + "\n Application Nbr.: " + data2[i].leave_ctrlno + "\n Date Application from :" + data2[i].leave_date_from.ToString("yyyy-MM-dd") + "\n Date Application to: " + data2[i].leave_date_to.ToString("yyyy-MM-dd");
                                        message_descr2 = " You cannot apply late Force Leave or beyond date of filing!";
                                    }
                                }

                            }
                            // *****************************************************************
                            // ********* Cannot Apply Force Leave if December ******************
                            // *****************************************************************
                            // if (leave_date_from.Month == 12 || leave_date_to.Month == 12)
                            // {
                            //     message         = "no-december";
                            //     message_descr   = (message + " *" + leave_date_from.ToString("yyyy-MM-dd") + " - " + leave_date_to.ToString("yyyy-MM-dd")) +  " - Transfer this date to other date instead!";
                            //     message_descr2  = "You cannot apply Force Leave on December!";
                            // }
                            // *****************************************************************
                            // ********* Cannot Apply Force Leave if December ******************
                            // *****************************************************************


                            // *****************************************************************
                            // ********* Check if there is Received Force Leave plan ***********
                            // *****************************************************************
                            // var chk_fl_plan_rep = from s in db_ats.fl_plan_hdr_rep_tbl
                            //                       join r in db_ats.fl_plan_dtl_rep_tbl
                            //                       on new { s.fl_plan_rep_ctrlno, s.fl_plan_rep_year } 
                            //                   equals new { r.fl_plan_rep_ctrlno, r.fl_plan_rep_year }
                            //                       where r.empl_id == data.empl_id
                            //                       & r.fl_plan_rep_year == par_year.ToString().Trim()
                            //                       & s.fl_plan_rep_status == "RCVD"
                            //                       select new
                            //                       {
                            //                           r.empl_id,
                            //                           s.fl_plan_rep_ctrlno
                            //                          ,s.fl_plan_rep_year
                            //                          ,s.fl_plan_rep_status
                            //                       };
                            // if (chk_fl_plan_rep.ToList().Count < 1)
                            // {
                            //     message         = "no-fl-plan-report";
                            //     message_descr   = (" *" + leave_date_from.ToString("yyyy-MM-dd") + " - " + leave_date_to.ToString("yyyy-MM-dd")) + " \n Make sure you have Force Leave Plan and Received to PHRMDO !";
                            //     message_descr2  = "You cannot apply Force Leave if there is no Force Leave Plan Report received to PHRMDO!";
                            // }
                            // *****************************************************************
                            // ********* Check if there is Received Force Leave plan ***********
                            // *****************************************************************

                            // ***************************************************************************************************
                            // *** VJA - 2022-06-03 03:48PM - Force Leave Validation, user cannot apply FL without FL Plan 
                            // ***************************************************************************************************

                            if (dt_chk_tse == null)
                            {
                                var fl_chk = db_ats.sp_force_leave_plan_tbl_list_chk(data.empl_id, par_year.ToString().Trim()).Where(a => a.approval_status == "F").ToList();
                                if ((fl_chk == null || fl_chk.Count <= 4))
                                {
                                    message       = "no-fl-plan";
                                    message_descr = (" *" + leave_date_from.ToString("yyyy-MM-dd") + " - " + leave_date_to.ToString("yyyy-MM-dd")) + " \n Make sure you have Force Leave Plan and Received to PHRMDO !";
                                    message_descr2 = "You need to Approve your five (5) Force Leave Plan year " + par_year.ToString().Trim() + ", you have (" + (5 -fl_chk.Count()).ToString() + ") remaining Force leave Plan to be apply/approve.";
                                }
                            }
                            // ***************************************************************************************************
                            // ***************************************************************************************************

                            // ***************************************************************************************************
                            // *** VJA - Force Leave Validation, user cannot transfer or override date of leave 
                            // ***************************************************************************************************
                            //if (p_action_mode == "RESUBMIT" || p_action_mode == "SUBMIT" || p_action_mode == "EDIT")
                            //{
                            //    var chk_equal = db_ats.leave_application_dtl_tbl.Where(a => a.empl_id == data.empl_id && a.leave_ctrlno == data.leave_ctrlno.ToString()).OrderBy(a => a.leave_date_from).ToList();
                            //    //for (int i = 0; i < chk_equal.Count; i++)
                            //    //{
                            //        if (chk_equal[x].leave_date_from != leave_date_from  ||
                            //            chk_equal[x].leave_date_to   != leave_date_to)
                            //        {
                            //            message         = "fl-override";
                            //            message_descr   = (" *" + leave_date_from.ToString("yyyy-MM-dd") + " - " + leave_date_to.ToString("yyyy-MM-dd")) + " - New Leave Date \n " + (" *" + chk_equal[x].leave_date_from.ToString("yyyy-MM-dd") + " - " + chk_equal[x].leave_date_to.ToString("yyyy-MM-dd")) + " - Previous  Leave Date";
                            //            message_descr2  = "You cannot transfer or override date of your Force Leave, apply Cancellation instead";
                            //        }
                            //    //}
                            //}
                            if (p_action_mode == "RESUBMIT" || p_action_mode == "SUBMIT" || p_action_mode == "EDIT")
                            {
                                var chk_equal = db_ats.leave_application_dtl_tbl.Where(a => a.empl_id == data.empl_id && a.leave_ctrlno == data.leave_ctrlno.ToString()).OrderBy(a => a.leave_date_from).ToList();
                                for (int i = 0; i < chk_equal.Count; i++)
                                {
                                    if (chk_equal[i].leave_date_from != leave_date_from ||
                                        chk_equal[i].leave_date_to   != leave_date_to)
                                    {
                                        message = "fl-override";
                                        message_descr = (" *" + leave_date_from.ToString("yyyy-MM-dd") + " - " + leave_date_to.ToString("yyyy-MM-dd")) + " - New Leave Date \n " + (" *" + chk_equal[i].leave_date_from.ToString("yyyy-MM-dd") + " - " + chk_equal[i].leave_date_to.ToString("yyyy-MM-dd")) + " - Previous  Leave Date";
                                        message_descr2 = "You cannot transfer or override date of your Force Leave, apply Cancellation instead";
                                    }
                                }
                            }
                            // ***************************************************************************************************
                            // *** VJA - Force Leave Validation, user cannot transfer or override date of leave 
                            // ***************************************************************************************************
                        }
                    }
                    if (data.leave_type_code  == "VL")   // Force Leave Validation Effective July 1, 2022
                    {

                        var cntr = 0;
                        if (data2 != null)
                        {
                            for (int i = 0; i < data2.Count; i++)
                            {
                                var chk_1 = db_ats.leave_application_dtl_tbl.Where(a => a.empl_id == data.empl_id && (a.rcrd_status == "L" || a.rcrd_status == "D")).ToList();

                                // ******************************************************************
                                // ** VJA - 2022-06-15 - Validation for Restored on Posteiong, ******
                                //                      Dapat pwedi pa maka apply balikd       ******
                                // ******************************************************************
                                for (int y = 0; y < chk_1.Count; y++)
                                {
                                    if (chk_1[y].leave_date_from == data2[i].leave_date_from ||
                                        chk_1[y].leave_date_to == data2[i].leave_date_to)
                                    {
                                        cntr = cntr + 1;
                                    }

                                }
                                // ******************************************************************
                                // ******************************************************************

                                if (cntr <= 0)
                                {
                                    if ((data2[i].leave_date_from >= DateTime.Parse("2022-07-01") ||
                                        data2[i].leave_date_to >= DateTime.Parse("2022-07-01"))
                                        &&
                                        (data2[i].leave_date_from <= data.date_applied ||
                                        data2[i].leave_date_to <= data.date_applied))
                                    {
                                        message = "fl_validation";
                                        message_descr = "Date Applied: " + DateTime.Parse(data.date_applied.ToString()).ToString("yyyy-MM-dd") + "\n Application Nbr.: " + data2[i].leave_ctrlno + "\n Date Application from :" + data2[i].leave_date_from.ToString("yyyy-MM-dd") + "\n Date Application to: " + data2[i].leave_date_to.ToString("yyyy-MM-dd");
                                        message_descr2 = " You cannot apply late Vacation Leave or beyond date of filing!";
                                    }
                                }

                            }
                        }
                    }
                    //if (data.leave_type_code  == "SP" || data.leave_type_code == "PS") // Special Leave and Solo Parent, Sick Leave
                    //{
                    //    var leave_descr = "";
                    //    if (data.leave_type_code == "SP")
                    //    {
                    //        leave_descr = "Special Privilege Leave such as Anniversary, Birthday, Wedding, Parental Obligation or Personal Transaction!";
                    //    }
                    //    else if (data.leave_type_code == "PS")
                    //    {
                    //        leave_descr = "Solo Parent Leave!";
                    //    }
                    //    else if (data.leave_type_code == "MC")
                    //    {
                    //        leave_descr = "Special Leave Benefits for Women/Magna Carta for Women";
                    //    }
                        
                    //    var ctr = 5;

                    //    System.DateTime firstDate   = new System.DateTime(DateTime.Parse(data.date_applied.ToString()).Year, DateTime.Parse(data.date_applied.ToString()).Month, DateTime.Parse(data.date_applied.ToString()).Day);
                    //    System.DateTime secondDate  = new System.DateTime(leave_date_to.Year, leave_date_to.Month, leave_date_to.Day);

                    //    for (int i = 0; i < (secondDate - firstDate).TotalDays ; i++)
                    //    {
                    //        if (firstDate.AddDays(i).DayOfWeek.ToString() == "Sunday" ||
                    //            firstDate.AddDays(i).DayOfWeek.ToString() == "Saturday")
                    //        {
                    //            ctr = ctr + 1;
                    //        }   
                    //    }

                    //    if (data.leave_subtype_code == "AN" || // Special Leave - Anniversary
                    //        data.leave_subtype_code == "BD" || // Special Leave - Birthday
                    //        data.leave_subtype_code == "WD" || // Special Leave - Wedding
                    //        data.leave_type_code    == "PS"  ) // Solo Parent
                    //    {
                    //        var date_applied_5_working_days = DateTime.Parse(data.date_applied.ToString()).AddDays(ctr);
                    //        if (date_applied_5_working_days > leave_date_from || date_applied_5_working_days > leave_date_to && p_action_mode == "SUBMIT") 
                    //        {
                    //            message         = "5_adv_validation";
                    //            message_descr   = "Date Applied: " + DateTime.Parse(data.date_applied.ToString()).ToString("yyyy-MM-dd") + "\n Application Nbr.: " + data.leave_ctrlno + "\n Date Application from :" + leave_date_from.ToString("yyyy-MM-dd") + "\n Date Application to: " + leave_date_to.ToString("yyyy-MM-dd");
                    //            message_descr2  = " You must apply in advance 5 working days for " + leave_descr + " Apply " + date_applied_5_working_days.ToLongDateString() + " instead!";
                    //        }
                    //    }

                    //    if (data.leave_subtype_code == "PO" || // Special Leave - Parental Obligation
                    //        data.leave_subtype_code == "PT"    // Special Leave - Personal Transaction
                    //        ) 
                    //    {
                    //        var day_diff = (DateTime.Parse(data.date_applied.ToString()) - leave_date_from).TotalDays;
                    //        if (day_diff >= 5 && p_action_mode == "SUBMIT" && data.justification_flag == false) 
                    //        {
                    //            message         = "5_adv_validation";
                    //            message_descr   = "Date Applied: " + DateTime.Parse(data.date_applied.ToString()).ToString("yyyy-MM-dd") + "\n Application Nbr.: " + data.leave_ctrlno + "\n Date Application from :" + leave_date_from.ToString("yyyy-MM-dd") + "\n Date Application to: " + leave_date_to.ToString("yyyy-MM-dd");
                    //            message_descr2  = " You have to Submit Justification letter \n \n You must apply in advance 5 working days for " + leave_descr;
                    //        }
                    //    }
                    //}
                    //if ((data.leave_type_code  == "SL" || data.leave_type_code == "SP" || data.leave_type_code == "PS") && DateTime.Parse(data.date_applied.ToString()) >= DateTime.Parse("2023-07-01"))
                    if ((data.leave_type_code  == "SL" || data.leave_type_code == "SP" || data.leave_type_code == "PS") )
                    {
                        var justi = db_ats.leave_application_hdr_justi_tbl.Where(a => a.empl_id == data.empl_id && a.leave_ctrlno == data.leave_ctrlno).FirstOrDefault();

                        if (dt_chk_tse == null)
                        {
                            var day_diff = (DateTime.Parse(data.date_applied.ToString()) - leave_date_from).TotalDays;
                            if (day_diff >= 7 && p_action_mode == "SUBMIT" && (data.justification_flag == false || justi ==null))
                            {
                                message         = "5_adv_validation";
                                message_descr   = "Date Applied: " + DateTime.Parse(data.date_applied.ToString()).ToLongDateString() + "\n Application Nbr.: " + data.leave_ctrlno + "\n Date Application from :" + leave_date_from.ToLongDateString() + "\n Date Application to: " + leave_date_to.ToLongDateString();
                                message_descr2  = " You have to Submit Justification letter.";
                            }

                        }
                        else
                        {
                            var day_diff = (DateTime.Parse(data.date_applied.ToString()) - leave_date_from).TotalDays;
                            if (day_diff >= 5 && p_action_mode == "SUBMIT" && (data.justification_flag == false || justi == null))
                            {
                                message = "5_adv_validation";
                                message_descr = "Date Applied: " + DateTime.Parse(data.date_applied.ToString()).ToLongDateString() + "\n Application Nbr.: " + data.leave_ctrlno + "\n Date Application from :" + leave_date_from.ToLongDateString() + "\n Date Application to: " + leave_date_to.ToLongDateString();
                                message_descr2 = " You have to Submit Justification letter.";
                            }
                        }
                    }
                }


                // **********************************************************************************************************************
                // **********************************************************************************************************************
                // **********************************************************************************************************************

                var cto_current_balance = "0.00";
                var vl_current_balance  = "0.00";
                var sl_current_balance  = "0.00";
                var sp_current_balance  = "0.00";
                var fl_current_balance  = "0.00";

                if (data.leave_type_code == "VL" ||
                    data.leave_type_code == "SL" ||
                    data.leave_type_code == "SP" ||
                    data.leave_type_code == "FL" ||
                    data.leave_type_code == "CTO"
                    )
                {
                    //var chk_hdr = db_ats.leave_application_hdr_tbl.Where(a => a.empl_id == data.empl_id && a.leave_ctrlno == data.leave_ctrlno).FirstOrDefault();
                    cto_current_balance = db_ats.sp_leave_application_curr_bal(data.empl_id.ToString(), par_year, "CTO").FirstOrDefault().leaveledger_balance_current.ToString();
                    vl_current_balance  = db_ats.sp_leave_application_curr_bal(data.empl_id.ToString(), par_year, "VL").FirstOrDefault().leaveledger_balance_current.ToString();
                    sl_current_balance  = db_ats.sp_leave_application_curr_bal(data.empl_id.ToString(), par_year, "SL").FirstOrDefault().leaveledger_balance_current.ToString();
                    sp_current_balance  = db_ats.sp_leave_application_curr_bal(data.empl_id.ToString(), par_year, "SP").FirstOrDefault().leaveledger_balance_current.ToString();
                    fl_current_balance  = db_ats.sp_leave_application_curr_bal(data.empl_id.ToString(), par_year, "FL").FirstOrDefault().leaveledger_balance_current.ToString();

                    if (double.Parse(data.leaveledger_balance_as_of_vl.ToString()) != double.Parse(vl_current_balance) ||
                        double.Parse(data.leaveledger_balance_as_of_sl.ToString()) != double.Parse(sl_current_balance) ||
                        double.Parse(data.leaveledger_balance_as_of_sp.ToString()) != double.Parse(sp_current_balance) ||
                        double.Parse(data.leaveledger_balance_as_of_fl.ToString()) != double.Parse(fl_current_balance) ||
                        double.Parse(data.leaveledger_balance_as_of_oth.ToString())!= double.Parse(cto_current_balance))
                    {
                        message       = "unequal-balances";
                        message_descr = "Syncronize the Balances \n \n"
                                        + double.Parse(data.leaveledger_balance_as_of_vl.ToString())  + " (PREVIOUS VL BAL) - "  + double.Parse(vl_current_balance)  + " (NEW VL BAL)  \n "
                                        + double.Parse(data.leaveledger_balance_as_of_sl.ToString())  + " (PREVIOUS SL BAL) - "  + double.Parse(sl_current_balance)  + " (NEW SL BAL)  \n "
                                        + double.Parse(data.leaveledger_balance_as_of_sp.ToString())  + " (PREVIOUS SP BAL) - "  + double.Parse(sp_current_balance)  + " (NEW SP BAL)  \n "
                                        + double.Parse(data.leaveledger_balance_as_of_fl.ToString())  + " (PREVIOUS FL BAL) - "  + double.Parse(fl_current_balance)  + " (NEW FL BAL)  \n "
                                        + double.Parse(data.leaveledger_balance_as_of_oth.ToString()) + " (PREVIOUS CTO BAL) - " + double.Parse(cto_current_balance) + " (NEW CTO BAL) \n ";
                    }
                }
                // **********************************************************************************************************************
                // **********************************************************************************************************************
                // **********************************************************************************************************************

                return JSON(new { message, message_descr , message_descr2 }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade Alivio
        // Created Date : 05/15/2020
        // Description  : Add new record to table with status as New
        //*********************************************************************//
        //public ActionResult Save(leave_application_hdr_tbl data, List<leave_application_dtl_tbl> data2, List<leave_application_dtl_cto_tbl> data3)
        //{
        //    try
        //    {
        //        var new_appl_nbr        = db_ats.sp_generate_appl_nbr("leave_application_hdr_tbl", 8, "leave_ctrlno").ToList();
        //        data.leave_ctrlno       = new_appl_nbr[0].ToString();
        //        data.created_by_user    = Session["user_id"].ToString();
        //        data.created_dttm       = DateTime.Now;
        //        data.details_remarks    = string.Empty;
        //        db_ats.leave_application_hdr_tbl.Add(data);

        //        for (var x = 0; x < data2.Count; x++)
        //        {
        //            data2[x].leave_ctrlno = new_appl_nbr[0].ToString();
        //            data2[x].rcrd_status = data.approval_status;
        //            db_ats.leave_application_dtl_tbl.Add(data2[x]);
        //        }

        //        if (data3 != null)
        //        {
        //            for (var x = 0; x < data3.Count; x++)
        //            {
        //                data3[x].leave_ctrlno = new_appl_nbr[0].ToString();
        //                db_ats.leave_application_dtl_cto_tbl.Add(data3[x]);
        //            }
        //        }
                

        //        db_ats.SaveChangesAsync();

        //        return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (Exception e)
        //    {
        //        string message = e.InnerException.Message.ToString();
        //        return Json(new { message }, JsonRequestBehavior.AllowGet);
        //    }
        //}
        //*********************************************************************//
        // Created By   : Vincent Jade Alivio
        // Created Date : 03/13/2020
        // Description  : Add new record to table with status as Submitted
        //*********************************************************************//
        public ActionResult Save2(leave_application_hdr_tbl data, List<leave_application_dtl_tbl> data2, List<leave_application_dtl_cto_tbl> data3)
        {
            try
            {
                var app_id              = db_dev.sp_insert_transaction_to_approvalworkflow_tbl(Session["user_id"].ToString(), data.empl_id.ToString(), "002").ToList();
                var new_appl_nbr        = db_ats.sp_generate_appl_nbr("leave_application_hdr_tbl", 8, "leave_ctrlno").ToList();
                data.leave_ctrlno       = new_appl_nbr[0].ToString();
                data.date_applied       = DateTime.Now;
                data.created_dttm       = DateTime.Now;
                data.approval_id        = app_id[0].ToString();
                data.created_by_user    = Session["user_id"].ToString();
                data.details_remarks    = string.Empty;

                var user_empl_id        = Session["empl_id"].ToString();
                var user_is_reviewer    = db_dev.transactionsapprover_tbl.Where(a => a.transaction_code == "002" && a.empl_id == user_empl_id && a.workflow_authority == "0").FirstOrDefault();

                // *************************************************************
                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                // *************************************************************
                var appl_status = "Save/Submit Leave Application";
                db_ats.sp_lv_ledger_history_insert("", data.leave_ctrlno,data.empl_id , appl_status, data.details_remarks, Session["user_id"].ToString());
                // *************************************************************
                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                // *************************************************************

                if (user_is_reviewer != null)
                {
                    data.approval_status = "R";
                    var transac_apprvr = db_dev.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), data.approval_status, "Auto Reviewed");

                    // *************************************************************
                    // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                    // *************************************************************
                    appl_status = "Auto Reviewed";
                    db_ats.sp_lv_ledger_history_insert("", data.leave_ctrlno, data.empl_id, appl_status, data.details_remarks, Session["user_id"].ToString());
                    // *************************************************************
                    // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                    // *************************************************************
                }
                string user_id = Session["user_id"].ToString();
                var trans_ref2 = db_ats.sp_ss_auto_approval(user_id, "002").ToList();

                if (trans_ref2[0].auto_status != "")
                {
                    data.approval_status = trans_ref2[0].auto_status;
                    data.details_remarks = trans_ref2[0].auto_remarks;
                    var transac_apprvr = db_dev.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), data.approval_status, data.details_remarks);

                    // *************************************************************
                    // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                    // *************************************************************
                    appl_status = trans_ref2[0].auto_remarks;
                    db_ats.sp_lv_ledger_history_insert("", data.leave_ctrlno, data.empl_id, appl_status, data.details_remarks, Session["user_id"].ToString());
                    // *************************************************************
                    // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                    // *************************************************************
                }

                db_ats.leave_application_hdr_tbl.Add(data);

                for (var x = 0; x < data2.Count; x++)
                {
                    data2[x].leave_ctrlno = new_appl_nbr[0].ToString();
                    data2[x].rcrd_status = data.approval_status;
                    db_ats.leave_application_dtl_tbl.Add(data2[x]);
                }

                if (data3 != null)
                {
                    for (var x = 0; x < data3.Count; x++)
                    {
                        data3[x].leave_ctrlno = new_appl_nbr[0].ToString();
                        db_ats.leave_application_dtl_cto_tbl.Add(data3[x]);
                    }
                }

                
                db_ats.SaveChangesAsync();


                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.InnerException.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade Alivio
        // Created Date : 03/13/2020
        // Description  : Edit existing record table with status as New 
        //*********************************************************************//
        //public ActionResult SaveEdit(leave_application_hdr_tbl data, List<leave_application_dtl_tbl> data2, List<leave_application_dtl_cto_tbl> data3)
        //{
        //    try
        //    {
        //        data.updated_by_user                = Session["user_id"].ToString();
        //        var query                           = db_ats.leave_application_hdr_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno).FirstOrDefault();
        //        query.updated_dttm                  = DateTime.Now;
        //        query.updated_by_user               = Session["user_id"].ToString();
        //        query.date_applied                  = data.date_applied;
        //        query.leave_comments                = data.leave_comments;
        //        query.leave_type_code               = data.leave_type_code;
        //        query.leave_subtype_code            = data.leave_subtype_code;
        //        query.number_of_days                = data.number_of_days;
        //        query.leaveledger_date              = data.leaveledger_date;
        //        query.leaveledger_balance_as_of_sl  = data.leaveledger_balance_as_of_sl;
        //        query.leaveledger_balance_as_of_vl  = data.leaveledger_balance_as_of_vl;
        //        query.leaveledger_balance_as_of_sp  = data.leaveledger_balance_as_of_sp;
        //        query.leaveledger_balance_as_of_fl  = data.leaveledger_balance_as_of_fl;
        //        query.leaveledger_balance_as_of_oth = data.leaveledger_balance_as_of_oth;
        //        query.sl_restore_deduct             = data.sl_restore_deduct;
        //        query.vl_restore_deduct             = data.vl_restore_deduct;
        //        query.sp_restore_deduct             = data.sp_restore_deduct;
        //        query.fl_restore_deduct             = data.fl_restore_deduct;
        //        query.oth_restore_deduct            = data.oth_restore_deduct;
        //        query.leave_class                   = data.leave_class;
        //        query.leave_descr                   = data.leave_descr;
        //        query.approval_status               = data.approval_status;
        //        query.justification_flag            = data.justification_flag;
        //        query.commutation                   = data.commutation;
                
        //        var od = db_ats.leave_application_dtl_tbl.RemoveRange(db_ats.leave_application_dtl_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno));
        //        for (var x = 0; x < data2.Count; x++)
        //        {
        //            data2[x].rcrd_status = data.approval_status;
        //            db_ats.leave_application_dtl_tbl.Add(data2[x]);
        //        }

        //        var od2 = db_ats.leave_application_dtl_cto_tbl.RemoveRange(db_ats.leave_application_dtl_cto_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno));

        //        if (data3 != null)
        //        {
        //            for (var x = 0; x < data3.Count; x++)
        //            {
        //                db_ats.leave_application_dtl_cto_tbl.Add(data3[x]);
        //            }
        //        }

        //        db_ats.SaveChangesAsync();

        //        return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (Exception e)
        //    {
        //        string message = e.InnerException.Message.ToString();
        //        return Json(new { message }, JsonRequestBehavior.AllowGet);
        //    }
        //}
        //*********************************************************************//
        // Created By   : Vincent Jade Alivio
        // Created Date : 03/13/2020
        // Description  : Edit existing record table with status as New into Submitted
        //*********************************************************************//
        public ActionResult SaveSubmit(leave_application_hdr_tbl data, List<leave_application_dtl_tbl> data2, List<leave_application_dtl_cto_tbl> data3)
        {
            try
            {
                var app_id = db_dev.sp_insert_transaction_to_approvalworkflow_tbl(Session["user_id"].ToString(), data.empl_id.ToString(), "002").ToList();
                data.approval_id        = app_id[0].ToString();
                data.details_remarks    = string.Empty;

                var user_empl_id = Session["empl_id"].ToString();
                var user_is_reviewer = db_dev.transactionsapprover_tbl.Where(a => a.transaction_code == "002" && a.empl_id == user_empl_id && a.workflow_authority == "0").FirstOrDefault();

                if (user_is_reviewer != null)
                {
                    data.approval_status = "R";
                    var transac_apprvr = db_dev.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), data.approval_status, "Auto Reviewed");
                }
                string user_id = Session["user_id"].ToString();
                var trans_ref2 = db_ats.sp_ss_auto_approval(user_id, "002").ToList();

                if (trans_ref2[0].auto_status != "")
                {
                    data.approval_status = trans_ref2[0].auto_status;
                    data.details_remarks = trans_ref2[0].auto_remarks;
                    var transac_apprvr = db_dev.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), data.approval_status, data.details_remarks);
                }

                var query = db_ats.leave_application_hdr_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno).FirstOrDefault();
                query.approval_id                   = data.approval_id;
                query.updated_dttm                  = DateTime.Now;
                query.updated_by_user               = Session["user_id"].ToString();
                query.date_applied                  = data.date_applied;
                query.leave_comments                = data.leave_comments;
                query.leave_type_code               = data.leave_type_code;
                query.leave_subtype_code            = data.leave_subtype_code;
                query.number_of_days                = data.number_of_days;
                query.leaveledger_date              = data.leaveledger_date;
                query.leaveledger_balance_as_of_sl  = data.leaveledger_balance_as_of_sl;
                query.leaveledger_balance_as_of_vl  = data.leaveledger_balance_as_of_vl;
                query.leaveledger_balance_as_of_sp  = data.leaveledger_balance_as_of_sp;
                query.leaveledger_balance_as_of_fl  = data.leaveledger_balance_as_of_fl;
                query.leaveledger_balance_as_of_oth = data.leaveledger_balance_as_of_oth;
                query.sl_restore_deduct             = data.sl_restore_deduct;
                query.vl_restore_deduct             = data.vl_restore_deduct;
                query.sp_restore_deduct             = data.sp_restore_deduct;
                query.fl_restore_deduct             = data.fl_restore_deduct;
                query.oth_restore_deduct            = data.oth_restore_deduct;
                query.leave_class                   = data.leave_class;
                query.leave_descr                   = data.leave_descr;
                query.details_remarks               = data.details_remarks;
                query.approval_status               = data.approval_status;
                query.approval_id                   = data.approval_id;
                query.justification_flag            = data.justification_flag;

                var od = db_ats.leave_application_dtl_tbl.RemoveRange(db_ats.leave_application_dtl_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno));
                for (var x = 0; x < data2.Count; x++)
                {
                    data2[x].rcrd_status = data.approval_status;
                    db_ats.leave_application_dtl_tbl.Add(data2[x]);
                }
                var od2 = db_ats.leave_application_dtl_cto_tbl.RemoveRange(db_ats.leave_application_dtl_cto_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno));
                if (data3 != null)
                {
                    for (var x = 0; x < data3.Count; x++)
                    {
                        db_ats.leave_application_dtl_cto_tbl.Add(data3[x]);
                    }
                }

                // *************************************************************
                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                // *************************************************************
                var appl_status = "Submit Leave Application";
                db_ats.sp_lv_ledger_history_insert("", data.leave_ctrlno, data.empl_id, appl_status, data.details_remarks, Session["user_id"].ToString());
                // *************************************************************
                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                // *************************************************************
                db_ats.SaveChangesAsync();
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.InnerException.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade Alivio
        // Created Date : 03/13/2020
        // Description  : Resubmit Cancel Pending Status
        //*********************************************************************//
        public ActionResult ReSubmitAll(leave_application_hdr_tbl data, List<leave_application_dtl_tbl> data2, List<leave_application_dtl_cto_tbl> data3)
        {
            try
            {
                var user_empl_id = Session["empl_id"].ToString();
                var user_is_reviewer = db_dev.transactionsapprover_tbl.Where(a => a.transaction_code == "002" &&
                                                                                    a.empl_id == user_empl_id &&
                                                                                    a.workflow_authority == "0").FirstOrDefault();
                if (user_is_reviewer != null)
                {
                    data.approval_status = "R";
                    var transac_apprvr = db_dev.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), data.approval_status, "Auto Reviewed");
                }
                else
                {
                    var transac_apprvr = db_dev.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), "S", "");
                }
                string user_id = Session["user_id"].ToString();
                var trans_ref2 = db_ats.sp_ss_auto_approval(user_id, "002").ToList();

                if (trans_ref2[0].auto_status != "")
                {
                    data.approval_status = trans_ref2[0].auto_status;
                    data.details_remarks = trans_ref2[0].auto_remarks;
                    var transac_apprvr = db_dev.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), data.approval_status, data.details_remarks);
                }

                var query = db_ats.leave_application_hdr_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno).FirstOrDefault();
                query.updated_dttm                  = DateTime.Now;
                query.updated_by_user               = Session["user_id"].ToString();
                query.date_applied                  = data.date_applied;
                query.leave_comments                = data.leave_comments;
                query.leave_type_code               = data.leave_type_code;
                query.leave_subtype_code            = data.leave_subtype_code;
                query.number_of_days                = data.number_of_days;
                query.leaveledger_date              = data.leaveledger_date;
                query.leaveledger_balance_as_of_sl  = data.leaveledger_balance_as_of_sl;
                query.leaveledger_balance_as_of_vl  = data.leaveledger_balance_as_of_vl;
                query.leaveledger_balance_as_of_sp  = data.leaveledger_balance_as_of_sp;
                query.leaveledger_balance_as_of_fl  = data.leaveledger_balance_as_of_fl;
                query.leaveledger_balance_as_of_oth = data.leaveledger_balance_as_of_oth;
                query.sl_restore_deduct             = data.sl_restore_deduct;
                query.vl_restore_deduct             = data.vl_restore_deduct;
                query.sp_restore_deduct             = data.sp_restore_deduct;
                query.fl_restore_deduct             = data.fl_restore_deduct;
                query.oth_restore_deduct            = data.oth_restore_deduct;
                query.leave_class                   = data.leave_class;
                query.leave_descr                   = data.leave_descr;
                query.details_remarks               = data.details_remarks;
                query.approval_status               = data.approval_status;
                query.approval_id                   = data.approval_id;
                query.justification_flag            = data.justification_flag;
                
                var od = db_ats.leave_application_dtl_tbl.RemoveRange(db_ats.leave_application_dtl_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno && a.rcrd_status != "L"));
                for (var x = 0; x < data2.Count; x++)
                {
                    data2[x].rcrd_status = data.approval_status;
                    db_ats.leave_application_dtl_tbl.Add(data2[x]);
                }
                var od2 = db_ats.leave_application_dtl_cto_tbl.RemoveRange(db_ats.leave_application_dtl_cto_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno));
                if (data3 != null)
                {
                    for (var x = 0; x < data3.Count; x++)
                    {
                        db_ats.leave_application_dtl_cto_tbl.Add(data3[x]);
                    }
                }
                // *************************************************************
                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                // *************************************************************
                var appl_status = "Re-Submit Leave Application";
                db_ats.sp_lv_ledger_history_insert("", data.leave_ctrlno, data.empl_id, appl_status, data.details_remarks, Session["user_id"].ToString());
                // *************************************************************
                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                // *************************************************************
                db_ats.SaveChangesAsync();


                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.InnerException.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade Alivio
        // Created Date : 04/16/2020
        // Description  : delete from approval workflow table
        //*********************************************************************//
        public ActionResult DeleteAll(leave_application_hdr_tbl data)
        {
            try
            {
                var od = db_ats.leave_application_hdr_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno).FirstOrDefault();
                string message = "";
                if (od != null)
                {
                    if (data.approval_id != null || data.approval_id != "")
                    {
                        var transac_apprvr = db_dev.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), "L", "Deleted");
                    }
                    db_ats.leave_application_hdr_tbl.Remove(od);
                    var query = db_ats.leave_application_dtl_tbl.RemoveRange(db_ats.leave_application_dtl_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno));
                    var query_cto = db_ats.leave_application_dtl_cto_tbl.RemoveRange(db_ats.leave_application_dtl_cto_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno));
                    var query_cancellation = db_ats.leave_application_cancel_tbl.RemoveRange(db_ats.leave_application_cancel_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno && a.empl_id == data.empl_id));
                    var delete_justi = db_ats.leave_application_hdr_justi_tbl.RemoveRange(db_ats.leave_application_hdr_justi_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno && a.empl_id == data.empl_id));

                    // *************************************************************
                    // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                    // *************************************************************
                    var appl_status = "Delete Leave Application";
                    db_ats.sp_lv_ledger_history_insert("", data.leave_ctrlno, data.empl_id, appl_status, data.details_remarks, Session["user_id"].ToString());
                    // *************************************************************
                    // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                    // *************************************************************
                    db_ats.SaveChangesAsync();


                    message = "success";
                }
                else
                {
                    message = "";
                }

                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.InnerException.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade Alivio
        // Created Date : 04/16/2020
        // Description  : delete from approval workflow table
        //*********************************************************************//
        public ActionResult Delete(leave_application_dtl_tbl data, string approval_id)
        {
            try
            {
                string message = "";
                var select = db_ats.leave_application_dtl_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno);
                var count = select.Count();

                if (count == 1)
                {
                    var od = db_ats.leave_application_hdr_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno).FirstOrDefault();
                    if (od != null)
                    {
                        if (approval_id != null)
                        {
                            var transac_apprvr = db_dev.sp_update_transaction_in_approvalworkflow_tbl(approval_id, Session["user_id"].ToString(), "L", "Deleted");
                        }
                        db_ats.leave_application_hdr_tbl.Remove(od);
                        var query = db_ats.leave_application_dtl_tbl.RemoveRange(db_ats.leave_application_dtl_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno));
                        var query_cto = db_ats.leave_application_dtl_cto_tbl.RemoveRange(db_ats.leave_application_dtl_cto_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno));
                        var query_cancellation = db_ats.leave_application_cancel_tbl.RemoveRange(db_ats.leave_application_cancel_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno && a.empl_id == data.empl_id));
                        var delete_justi = db_ats.leave_application_hdr_justi_tbl.RemoveRange(db_ats.leave_application_hdr_justi_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno && a.empl_id == data.empl_id));

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
                    var od = db_ats.leave_application_dtl_tbl.Where(a =>
                    a.leave_ctrlno == data.leave_ctrlno &&
                    a.leave_date_from == data.leave_date_from &&
                    a.leave_date_to == data.leave_date_to).FirstOrDefault();
                    if (od != null)
                    {
                        db_ats.leave_application_dtl_tbl.Remove(od);
                        db_ats.SaveChangesAsync();
                        message = "success";
                    }
                    else
                    {
                        message = "";
                    }
                }

                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.InnerException.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade Alivio
        // Created Date : 04/16/2020
        // Description  : delete from approval workflow table
        //*********************************************************************//
        public ActionResult CancelAll(leave_application_hdr_tbl data)
        {
            try
            {
                if (data.approval_id != null || data.approval_id != "")
                {
                    var transac_apprvr = db_dev.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), "L", "Cancelled");
                }

                var query = db_ats.leave_application_hdr_tbl.Where(a =>
                   a.leave_ctrlno == data.leave_ctrlno).FirstOrDefault();
                query.approval_status = "L";
                query.updated_dttm = DateTime.Now;
                query.updated_by_user = Session["user_id"].ToString();

                var query2 = db_ats.leave_application_dtl_tbl.Where(a =>
                   a.leave_ctrlno == data.leave_ctrlno).ToList();
                query2.ForEach(a => a.rcrd_status = "L");

                // *************************************************************
                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                // *************************************************************
                var appl_status = "Cancelled Leave Application";
                db_ats.sp_lv_ledger_history_insert("", data.leave_ctrlno, data.empl_id, appl_status, data.details_remarks, Session["user_id"].ToString());
                // *************************************************************
                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                // *************************************************************
                db_ats.SaveChangesAsync();


                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.InnerException.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        ////*********************************************************************//
        //// Created By   : Vincent Jade Alivio
        //// Created Date : 04/16/2020
        //// Description  : delete from approval workflow table
        ////*********************************************************************//
        //public ActionResult Cancel(leave_application_hdr_tbl data, leave_application_dtl_tbl data2)
        //{
        //    try
        //    {
        //        var select = db_ats.leave_application_dtl_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno &&
        //            a.rcrd_status != "L");
        //        var count = select.Count();

        //        if (count == 1)
        //        {
        //            if (data.approval_id != null || data.approval_id != "")
        //            {
        //                var transac_apprvr = db_dev.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), "L", "Cancelled");
        //            }

        //            var query = db_ats.leave_application_hdr_tbl.Where(a =>
        //                a.leave_ctrlno == data.leave_ctrlno).FirstOrDefault();
        //            query.approval_status = "L";
        //            query.updated_dttm = DateTime.Now;
        //            query.updated_by_user = Session["user_id"].ToString();

        //            var query2 = db_ats.leave_application_dtl_tbl.Where(a =>
        //               a.leave_ctrlno == data2.leave_ctrlno &&
        //               a.leave_dates == data2.leave_dates).FirstOrDefault();
        //            query2.rcrd_status = "L";

        //            db_ats.SaveChangesAsync();
        //        }
        //        else
        //        {
        //            var query = db_ats.leave_application_hdr_tbl.Where(a =>
        //                a.leave_ctrlno == data.leave_ctrlno).FirstOrDefault();
        //            query.updated_dttm = DateTime.Now;
        //            query.updated_by_user = Session["user_id"].ToString();

        //            var query2 = db_ats.leave_application_dtl_tbl.Where(a =>
        //               a.leave_ctrlno == data2.leave_ctrlno &&
        //               a.leave_dates == data2.leave_dates).FirstOrDefault();
        //            query2.rcrd_status = "L";

        //            db_ats.SaveChangesAsync();
        //        }

        //        return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (DbEntityValidationException e)
        //    {
        //        string message = DbEntityValidationExceptionError(e);

        //        return Json(new { message = message }, JsonRequestBehavior.AllowGet);
        //    }
        //}

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr. 
        // Created Date : 10/13/2020
        // Description  : Set Page History for This PAGE
        //*********************************************************************//
        public ActionResult setPageHistory()
        {
            try
            {
                Session["history_page"] = Request.UrlReferrer.ToString();

                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.InnerException.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult WithdrawSubmission(leave_application_hdr_tbl data)
        {
            try
            {
                var transac_apprvr = db_dev.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), data.approval_status, data.details_remarks);

                var query = db_ats.leave_application_hdr_tbl.Where(a =>
                    a.leave_ctrlno == data.leave_ctrlno).FirstOrDefault();
                query.approval_status = data.approval_status;
                query.details_remarks = data.details_remarks;
                query.updated_by_user = Session["user_id"].ToString();
                query.updated_dttm = DateTime.Now;

                var query2 = db_ats.leave_application_dtl_tbl
                    .Where(a => a.leave_ctrlno == data.leave_ctrlno)
                    .ToList();
                query2.ForEach(a => a.rcrd_status = data.approval_status);

                // *************************************************************
                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                // *************************************************************
                var appl_status = "Cancel Pending Leave Application";
                db_ats.sp_lv_ledger_history_insert("", data.leave_ctrlno, data.empl_id, appl_status, data.details_remarks, Session["user_id"].ToString());
                // *************************************************************
                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                // *************************************************************
                db_ats.SaveChangesAsync();


                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.InnerException.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio
        // Created Date : 2021-08-17
        // Description  : Particulars
        //*********************************************************************//
        //public ActionResult ApprovalHistory(string par_leave_ctlno)
        //{
        //    try
        //    {
        //        db_ats.Database.CommandTimeout = int.MaxValue;

        //        var message_descr = "success";
        //        var leave_appl = db_ats.leave_application_hdr_tbl.Where(a => a.leave_ctrlno == par_leave_ctlno).ToList().FirstOrDefault();
        //        var par_approval_id = (leave_appl == null ? "" : leave_appl.approval_id);
        //        var data = db_dev.vw_approvalworkflow_tbl.Where(a => a.transaction_code == "002" && a.approval_id == par_approval_id).FirstOrDefault();
                
        //        var lv_hdr                  = db_ats.lv_ledger_hdr_tbl.Where(b=> b.leave_ctrlno == par_leave_ctlno).FirstOrDefault();

        //        var par_approval_id_posting = (lv_hdr == null ? "" : lv_hdr.approval_id);
        //        var data_posting            = db_dev.vw_approvalworkflow_tbl.Where(a => a.approval_id == par_approval_id_posting).FirstOrDefault();
                
        //        return JSON(new { data, message_descr, leave_appl, data_posting }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (Exception e)
        //    {
        //        string message = e.Message;
        //        return Json(new { message = message }, JsonRequestBehavior.AllowGet);
        //    }
        //}

        public ActionResult CheckAndContinue(List<leave_application_dtl_tbl> data2, leave_application_hdr_tbl data)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                var message_flag   = "N";
                var message_descr  = "";
                var message_descr2 = "";
                double days_cnt      = 0;

                if (data2 != null )
                {
                    for (int i = 0; i < data2.Count; i++)
                    {
                        System.DateTime v_leave_date_from = new System.DateTime(data2[i].leave_date_from.Year, data2[i].leave_date_from.Month, data2[i].leave_date_from.Day);
                        System.DateTime v_leave_date_to   = new System.DateTime(data2[i].leave_date_to.Year, data2[i].leave_date_to.Month, data2[i].leave_date_to.Day);

                        days_cnt = (v_leave_date_from - v_leave_date_to).TotalDays;
                    }
                }
                
                switch (data.leave_type_code.ToString().Trim())
                {
                    // More than 5 Days Sick Leave
                    case "SL":
                        if (days_cnt > 5 || data.number_of_days > 5)
                        {
                            message_flag    = "Y";
                            message_descr   = "More than 5 days Sick Leave!";
                            message_descr2  = "You need to attach Medical Certificate for more than 5 days sick leave and submit it to HR!";
                        }
                        break;
                    // More than 30 Days Vaction Leave
                    case "VL":
                        if (days_cnt > 30 || data.number_of_days > 30)
                        {
                            message_flag = "Y";
                            message_descr = "More than 30 days Vacation Leave!";
                            message_descr2 = "You need to attach clearance for more than 30 days vacation leave and submit it to HR!";
                        }
                        break;
                    // More than 7 Days Paternity Leave
                    case "PL":
                        if (days_cnt > 6 || data.number_of_days > 6)
                        {
                            message_flag = "Y";
                            message_descr = "NOTE:";
                            message_descr2 = "You need to attach Proof of child's delivery, birth certificate and marriage contract for paternity leave and submit it to HR!";
                        }
                        break;
                }
                
                return JSON(new { data, message_descr, message_descr2, message_flag }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult RefreshBalance(string par_empl_id, string par_year, string par_leavetype_code, leave_application_hdr_tbl data)
        {

            var message_descr      = "";
            var leavetype_descr    = "";
            var oth_balance        = "0.00";
            var vl_current_balance = "0.00";
            var sl_current_balance = "0.00";
            var sp_current_balance = "0.00";
            var fl_current_balance = "0.00";

            leavetype_descr = par_leavetype_code;
            if (par_leavetype_code != "")
            {
                oth_balance        = db_ats.sp_leave_application_curr_bal(par_empl_id, par_year, par_leavetype_code).FirstOrDefault().leaveledger_balance_current.ToString();
                vl_current_balance = db_ats.sp_leave_application_curr_bal(par_empl_id, par_year, "VL").FirstOrDefault().leaveledger_balance_current.ToString();
                sl_current_balance = db_ats.sp_leave_application_curr_bal(par_empl_id, par_year, "SL").FirstOrDefault().leaveledger_balance_current.ToString();
                sp_current_balance = db_ats.sp_leave_application_curr_bal(par_empl_id, par_year, "SP").FirstOrDefault().leaveledger_balance_current.ToString();
                fl_current_balance = db_ats.sp_leave_application_curr_bal(par_empl_id, par_year, "FL").FirstOrDefault().leaveledger_balance_current.ToString();

                if (par_leavetype_code == "VL" ||
                    par_leavetype_code == "SL" ||
                    par_leavetype_code == "SP" ||
                    par_leavetype_code == "FL" 
                    )
                {
                    leavetype_descr = "CTO";
                    oth_balance = db_ats.sp_leave_application_curr_bal(par_empl_id, par_year, "CTO").FirstOrDefault().leaveledger_balance_current.ToString();
                }
                
                message_descr += "Syncronize the Balances \n \n";
                message_descr += double.Parse(data.leaveledger_balance_as_of_vl.ToString())  + " (PREVIOUS VL BAL) - "  + double.Parse(vl_current_balance)  + " (NEW VL BAL)  \n ";
                message_descr += double.Parse(data.leaveledger_balance_as_of_sl.ToString())  + " (PREVIOUS SL BAL) - "  + double.Parse(sl_current_balance)  + " (NEW SL BAL)  \n ";
                message_descr += double.Parse(data.leaveledger_balance_as_of_sp.ToString())  + " (PREVIOUS SP BAL) - "  + double.Parse(sp_current_balance)  + " (NEW SP BAL)  \n ";
                message_descr += double.Parse(data.leaveledger_balance_as_of_fl.ToString())  + " (PREVIOUS FL BAL) - "  + double.Parse(fl_current_balance)  + " (NEW FL BAL)  \n ";
                message_descr += double.Parse(data.leaveledger_balance_as_of_oth.ToString()) + " (PREVIOUS " + leavetype_descr + " BAL) - " + double.Parse(oth_balance) + " (NEW " + leavetype_descr + " BAL) \n ";
            }
            return Json(new {
                    message = "success"
                ,oth_balance
                ,vl_current_balance
                ,sl_current_balance
                ,sp_current_balance
                ,fl_current_balance
                ,message_descr

            }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult Retrieve_CancelList(string par_empl_id, string par_leave_ctrlno)
        {
            var department_code = Session["department_code"].ToString();
            var empl_id         = Session["empl_id"].ToString();
            var dpt_tbl         = db_dev.departments_tbl.Where(a => a.department_code == department_code).FirstOrDefault();
            var approved_name   = db_dev.vw_personnelnames_PAY.Where(a => a.empl_id == dpt_tbl.empl_id.ToString().Trim()).FirstOrDefault().employee_name_format2.ToString().Trim().ToUpper();
            var approved_by_desig = dpt_tbl.designation_head1.ToString().Trim().ToUpper();

            var dates_list      = db_ats.sp_leave_application_cancel_tbl_list(par_empl_id,par_leave_ctrlno).ToList();

            return Json(new { message = "success", dates_list , approved_name , approved_by_desig }, JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio 
        // Created Date : 01/13/2020
        // Description  : Add new record to leave sub-type table
        //*********************************************************************//
        public ActionResult Save_dtl(leave_application_cancel_tbl data, string exist_flag)
        {
            try
            {
                if (exist_flag == "N")
                {
                    data.leave_ctrlno          = data.leave_ctrlno          ;
                    data.empl_id               = data.empl_id               ;
                    data.leave_cancel_date     = data.leave_cancel_date     ;
                    data.reason                = data.reason                ;
                    data.leave_cancel_status   = data.leave_cancel_status   ;
                    data.approved_by           = data.approved_by           ;
                    data.approved_by_desig     = data.approved_by_desig     ;
                    data.created_dttm          = DateTime.Now;
                    data.created_user          = Session["user_id"].ToString();
                    data.leave_cancel_type     = data.leave_cancel_type;

                    db_ats.leave_application_cancel_tbl.Add(data);
                    db_ats.SaveChangesAsync();
                }
                else if (exist_flag == "Y")
                {
                    var od2 = db_ats.leave_application_cancel_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno && a.leave_cancel_date == data.leave_cancel_date && a.empl_id == data.empl_id).FirstOrDefault();
                    if (od2 != null)
                    {
                        db_ats.leave_application_cancel_tbl.Remove(od2);
                    }
                    db_ats.SaveChanges();
                }

                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio 
        // Created Date : 01/13/2020
        // Description  : Add new record to leave sub-type table
        //*********************************************************************//
        public ActionResult Submit_Cancel(leave_application_cancel_tbl data)
        {
            try
            {
                var query = db_ats.leave_application_cancel_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno && a.empl_id == data.empl_id).ToList();
                for (int i = 0; i < query.Count; i++)
                {
                    //query[i].reason                = data.reason                ;
                    query[i].approved_by           = data.approved_by           ;
                    query[i].approved_by_desig     = data.approved_by_desig     ;
                    query[i].leave_cancel_status   = data.leave_cancel_status   ;
                    query[i].submitted_dttm        = DateTime.Now;
                    query[i].submitted_user        = Session["user_id"].ToString();
                    //query[i].leave_cancel_type     = data.leave_cancel_type;
                }
                db_ats.SaveChangesAsync();
                return Json(new { message = "success"}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio 
        // Created Date : 01/13/2020
        // Description  : Add new record to leave sub-type table
        //*********************************************************************//
        public ActionResult CancelPending(leave_application_cancel_tbl data)
        {
            try
            {
                var query = db_ats.leave_application_cancel_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno && a.empl_id == data.empl_id).ToList();
                for (int i = 0; i < query.Count; i++)
                {
                    query[i].leave_cancel_status   = data.leave_cancel_status   ;
                }
                db_ats.SaveChangesAsync();
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio 
        // Created Date : 01/13/2020
        // Description  : Add new record to leave sub-type table
        //*********************************************************************//
        public ActionResult UpdateCancel(leave_application_cancel_tbl data)
        {
            try
            {
                var query = db_ats.leave_application_cancel_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno && a.empl_id == data.empl_id && a.leave_cancel_date == data.leave_cancel_date).FirstOrDefault();
                query.leave_transfer_date = data.leave_transfer_date;
                query.reason              = data.reason;
                query.leave_cancel_type   = data.leave_cancel_type;
                db_ats.SaveChangesAsync();
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult CancelledStatus(leave_application_hdr_tbl data)
        {
            try
            {
                string message = "";
                var hdr = db_ats.leave_application_hdr_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno && a.empl_id == data.empl_id).FirstOrDefault();
                var dtl = db_ats.leave_application_dtl_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno && a.empl_id == data.empl_id).ToList();

                hdr.approval_status = "L";
                dtl.ForEach(a => a.rcrd_status = "L");
                message = "success";
                // *************************************************************
                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                // *************************************************************
                var appl_status = "Cancelled Leave Application";
                db_ats.sp_lv_ledger_history_insert("", data.leave_ctrlno, data.empl_id, appl_status, data.details_remarks, Session["user_id"].ToString());
                // *************************************************************
                // **** VJA - 2023-06-01 -- Insert Leave Ledger History ********
                // *************************************************************
                db_ats.SaveChangesAsync();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
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
                    var data_chk = db_ats.leave_application_hdr_justi_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno && a.empl_id == data.empl_id).FirstOrDefault();

                    if (data_chk ==null)
                    {
                        data.created_dttm           = DateTime.Now;
                        data.created_by             = Session["user_id"].ToString();
                        db_ats.leave_application_hdr_justi_tbl.Add(data);
                    }
                    else
                    {
                        var data_upd = db_ats.leave_application_hdr_justi_tbl.Where(a => a.leave_ctrlno == data.leave_ctrlno && a.empl_id == data.empl_id).OrderByDescending(a=>a.id).FirstOrDefault();
                        
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

                    db_ats.SaveChangesAsync();
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

                var data = db_ats.leave_application_hdr_justi_tbl.Where(a=> a.leave_ctrlno == leave_ctrlno && a.empl_id == empl_id).OrderByDescending(a=>a.id).FirstOrDefault();
                 return Json(new { message = "success", data, approved_name, approved_by_desig, dpt_tbl , employee_name }, JsonRequestBehavior.AllowGet);
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
                var data = db_ats.func_lv_ledger_history_notif(leave_ctrlno, empl_id).OrderByDescending(a=>a.created_dttm).ToList();
                return Json(new { message = "success", data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}