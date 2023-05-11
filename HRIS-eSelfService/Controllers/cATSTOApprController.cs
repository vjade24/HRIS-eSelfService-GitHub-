//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Travel Order Pay Details
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// Jorge Rustom Villanueva       05/20/2020      Code Creation
//**********************************************************************************
using System;
using HRIS_eSelfService.Models;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Drawing;
using System.Text;

namespace HRIS_eSelfService.Controllers
{
    public class cATSTOApprController : Controller
    {
        // GET: cATSASAppr
        HRIS_DEVEntities db_dev = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        User_Menu um = new User_Menu();
        //*********************************************************************//
        // Created By : JRV - Created Date : 06/01/2020
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
        public ActionResult FilterPageGrid(string par_department_code, string par_to_year, string par_to_month, string par_employment_type)
        {
            db_ats.Database.CommandTimeout = int.MaxValue;
            var sp_approval_worklist_travel_order = db_ats.sp_approval_worklist_travel_order(Session["user_id"].ToString().Trim(), par_department_code, par_to_year, par_to_month, par_employment_type).ToList();
            return JSON(new { message = "success", sp_approval_worklist_travel_order }, JsonRequestBehavior.AllowGet);
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
                var pa_approver = "";
                string empl_id = Session["empl_id"].ToString();
                string user_id = Session["user_id"].ToString();
                var btn_enabled_4HR = false;
                var user_dept = Session["department_code"].ToString();
                if(user_dept == "03" || user_dept == "01")
                {
                    btn_enabled_4HR = false;
                  
                }
                else
                {
                    btn_enabled_4HR = true;
                }
                GetAllowAccess();
                var check_dept_init = Session["department_code"].ToString();
                db_ats.Database.CommandTimeout = int.MaxValue;
                var dept_code = Session["department_code"].ToString();

                if (dept_code == "01" || dept_code == "03" || user_dept == "02")
                {
                    check_dept_init = "";
                }
                var employment_type  = db_dev.sp_employmenttypes_tbl_list().ToList();
                var dept_list        = db_dev.vw_departments_tbl_list.ToList();
                var sp_approval_worklist_travel_order = db_ats.sp_approval_worklist_travel_order(Session["user_id"].ToString().Trim(), check_dept_init, (DateTime.Now.ToString("yyyy")), (DateTime.Now.ToString("MM")), "").ToList();
                var travel_type_list = db_ats.traveltype_tbl.ToList();
                var empl_name = db_ats.sp_employee_list_all(empl_id).ToList();
                var current_date = DateTime.Now;

                var pa_data = db_ats.to_final_approver_tbl.Where(a => a.user_id == user_id).FirstOrDefault();
                if (pa_data != null)
                {
                    pa_approver = pa_data.user_id.ToString();
                }
                else
                {
                    pa_approver = "";
                }


                var empl_name_search = db_ats.sp_travelorder_search_names((DateTime.Now.ToString("yyyy")), (DateTime.Now.ToString("MM"))).ToList();
                var reason_tbl = db_ats.to_disapprove_reason_tbl.OrderByDescending(a => a.no_use).FirstOrDefault();
                return JSON(new { message = "success", empl_name_search, dept_list, employment_type, sp_approval_worklist_travel_order, travel_type_list, dept_code, btn_enabled_4HR, empl_name, empl_id, current_date, reason_tbl, pa_approver}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr. 
        // Created Date : 03/02/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult GetEmployeesDetails(string par_travel_order_no, string par_dept_code)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                var sp_travelorder_empl_dtl_tbl_list    = db_ats.sp_travelorder_empl_dtl_tbl_list(par_travel_order_no).ToList();
                var sp_travelorder_dates_dtl_tbl_list   = db_ats.sp_travelorder_dates_dtl_tbl_list(par_travel_order_no).ToList();

                string empl_id = Session["empl_id"].ToString();

                // var empl_name_list                      = db_dev.sp_employee_list_dept_travel(par_dept_code);
                var empl_name_list = db_dev.sp_employee_list_dept(empl_id);
                return JSON(new { message = "success", sp_travelorder_empl_dtl_tbl_list, sp_travelorder_dates_dtl_tbl_list, empl_name_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Marvin Olita 
        // Created Date : 03/02/2020
        // Description  : Edit recommendingh and final approver
        //*********************************************************************//
        public ActionResult Edit_recom_final_Approver(string travel_order_no)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;

                var travelorders = db_ats.travelorder_hdr_tbl.Where(a => a.travel_order_no == travel_order_no).ToList();


                return JSON(new { message = "success", icon="success", travelorders}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message, icon="error" }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Marvin Olita 
        // Created Date : 03/02/2020
        // Description  : Edit recommendingh and final approver
        //*********************************************************************//
        public ActionResult save_recom_final_Approver(string travel_order_no, string recappr_empl,string firstappr_empl_id)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;

                var travelorders = db_ats.travelorder_hdr_tbl.Where(a => a.travel_order_no == travel_order_no).FirstOrDefault();
                travelorders.recappr_empl = recappr_empl;
                travelorders.firstappr_empl_id = firstappr_empl_id;
                db_ats.SaveChanges();

                return JSON(new { message = "Update success", icon = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }


        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr. 
        // Created Date : 03/02/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult GetDetailsData(string p_application_nbr,string p_dtr_year, string p_dtr_month)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;

                var travelorder_hdr_tbl = from s in db_ats.travelorder_hdr_tbl
                                          //join r in db_ats.travel_order_ldnf_tbl
                                          //  on s.travel_order_no equals r.travel_order_no
                                          where s.travel_order_no == p_application_nbr
                                            orderby s.travel_order_no
                                          select new
                                          {

                                              s.travel_order_no,
                                              s.travel_datefiled,
                                              s.travel_datefiled_original,
                                              s.travel_form_type,
                                              s.travel_place_visit,
                                              s.travel_purpose,
                                              s.travel_requestor_empl_id,
                                              s.travel_type_code,
                                              s.travel_details,
                                              s.travel_with_claims,
                                              s.travel_justification,
                                              s.approval_status,
                                              s.posting_status,
                                              s.approval_id,
                                              s.department_code,
                                              s.updated_by_user,
                                              s.updated_dttm,
                                              s.recappr_empl,
                                              s.firstappr_empl_id,
                                              s.finalappro_empl_id,
                                              s.ldnf,
                                              s.to_emergency
                                              //s.employee_name,
                                              //s.last_name,
                                              //s.first_name,
                                              //s.middle_name,
                                              //s.suffix_name,
                                              //s.courtisy_title,
                                              //s.postfix_name,
                                              //s.employee_name_format2,
                                              //t.department_code,
                                              //t.employment_type,
                                          };
              
                //var travelorder_hdr_tbl = db_ats.travelorder_hdr_tbl.Where(a => a.travel_order_no == p_application_nbr).ToList();

                return JSON(new { message = "success", travelorder_hdr_tbl }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr. 
        // Created Date : 04/16/2020
        // Description  : delete from approval workflow table
        //*********************************************************************//
        public ActionResult DeleteFromDatabase(travelorder_hdr_tbl par_data)
        {
            try
            {
                    var query = db_ats.travelorder_hdr_tbl.Where(a =>
                               a.travel_order_no == par_data.travel_order_no).FirstOrDefault();
                    query.approval_status = "L";
                    query.updated_dttm = DateTime.Now;
                    query.updated_by_user = Session["user_id"].ToString();

                    var query2 = db_ats.travelorder_dates_dtl_tbl.Where(a =>
                       a.travel_order_no == query.travel_order_no).ToList();
                    query2.ForEach(a => a.rcrd_status = "L");

                    var query3 = db_ats.travelorder_empl_dtl_tbl.Where(a =>
                       a.travel_order_no == query.travel_order_no).ToList();
                    query3.ForEach(a => a.rcrd_status = "L");

                    db_dev.sp_update_transaction_in_approvalworkflow_tbl(query.approval_id, Session["user_id"].ToString(), "L", "canceled by user");

              db_ats.SaveChangesAsync();

                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();

                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr. 
        // Created Date : 03/02/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult ReviewApprovedAction(travelorder_hdr_tbl data)
        {
            try
            {
                var travel_order_no = data.travel_order_no;
                var approval_id = data.approval_id;
                string status_comment = string.Empty;
                data.travel_details = data.travel_details == null ? "" : data.travel_details;

                if (data.approval_status.ToString().Trim() == "R" &&
                   data.travel_details.Trim() == "")
                {
                    data.travel_details = "Reviewed";
                }
                else if (data.approval_status.ToString().Trim() == "F" &&
                    data.travel_details.Trim() == "")
                {
                    data.travel_details = "Final Approved";
                }
                else if (data.approval_status.ToString().Trim() == "C" &&
                    data.travel_details.Trim() == "")
                {
                    data.travel_details = "Cancel Pending";
                }
                else if (data.approval_status.ToString().Trim() == "D" &&
                     data.travel_details.Trim() == "")
                {
                    data.travel_details = "Disapproved";
                }
                else if (data.approval_status.ToString().Trim() != "" &&
                    data.travel_details.Trim() == "")
                {
                    data.travel_details = "Level " + data.approval_status + " Approved";
                }

                else if (data.approval_status.ToString().Trim() == "L" &&
                data.travel_details.Trim() == "")
                {
                    data.travel_details = "Cancelled";
                }

                var query = db_ats.travelorder_hdr_tbl.Where(a => a.travel_order_no == travel_order_no
                                && a.approval_id == approval_id
                                ).FirstOrDefault();
                var query2 = db_ats.travelorder_dates_dtl_tbl.Where(a => a.travel_order_no == travel_order_no).ToList();
                var query3 = db_ats.travelorder_empl_dtl_tbl.Where(a => a.travel_order_no == travel_order_no).ToList();
                if (query != null)
                {
                    query.approval_status   = data.approval_status;
                    query.travel_details    = data.travel_details;
                    query.updated_by_user   = Session["user_id"].ToString();
                    query.updated_dttm      = DateTime.Now;
                    query2.ForEach(a => a.rcrd_status = data.approval_status);
                    query3.ForEach(a => a.rcrd_status = data.approval_status);
                    db_dev.sp_update_transaction_in_approvalworkflow_tbl(query.approval_id, Session["user_id"].ToString(), data.approval_status, data.travel_details);
                }

                db_ats.SaveChanges();
                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
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

        //public String DbEntityValidationExceptionError(DbEntityValidationException e)
        //{
        //    string message = "";
        //    foreach (var eve in e.EntityValidationErrors)
        //    {
        //        Console.WriteLine("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:", eve.Entry.Entity.GetType().Name, eve.Entry.State);

        //        foreach (var ve in eve.ValidationErrors)
        //        {
        //            message = "- Property: \"{0}\", Error: \"{1}\"" + ve.PropertyName + "  :  " + ve.ErrorMessage;
        //            Console.WriteLine("- Property: \"{0}\", Error: \"{1}\"",
        //                ve.PropertyName, ve.ErrorMessage);
        //        }
        //    }
        //    return message;
        //}

        public ActionResult deleteTOEmployee(sp_travelorder_empl_dtl_tbl_list_Result data)
        {

            var user_id = Session["user_id"].ToString();
            try
            {
                List<sp_travelorder_empl_dtl_tbl_list_Result> sp_travel_order_empl_dtl = new List<sp_travelorder_empl_dtl_tbl_list_Result>();
                var del_to_empl = db_ats.sp_delete_on_travelorder_empl_dtl_tbl(data.travel_order_no, data.empl_id, user_id).FirstOrDefault();

                if(del_to_empl.reload == false)
                {
                   sp_travel_order_empl_dtl = db_ats.sp_travelorder_empl_dtl_tbl_list(data.travel_order_no).ToList();
                }
                             
                return JSON(new { message = "Successfully deleted",icon="success", del_to_empl, sp_travel_order_empl_dtl }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message, icon="error"}, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult deleteTOEmployee_dtl(string par_application_nbr, string par_transaction_ref, string par_empl_id, DateTime travel_date)
        {

            var user_id = Session["user_id"].ToString();
            try
            {

                var del_to_empl = db_ats.sp_delete_application_dtl_list_to(par_application_nbr, par_transaction_ref, par_empl_id, travel_date);
                
                return JSON(new { message = "Successfully De", icon = "success"}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult delete_TO_dates(
             string travel_order_no
            , string dd_travel_date_from_orig
            , string dd_travel_date_from
            , string dd_travel_date_to
            , string dd_travel_start_time
            , string dd_starttime_meridem
            , string dd_travel_end_time
            , string dd_endtime_meridem
        )
        {
            try
            {
                //var to_date = db_ats.travelorder_dates_dtl_tbl.Where(a => a.travel_order_no == travel_order_no && a.travel_date == Convert.ToDateTime(dd_travel_date_from)).FirstOrDefault();
                DateTime dtFrom = Convert.ToDateTime(dd_travel_date_from_orig);
                var delete_dates = db_ats.travelorder_dates_dtl_tbl.RemoveRange(db_ats.travelorder_dates_dtl_tbl.Where(a => a.travel_order_no == travel_order_no && a.travel_date == dtFrom));
              
                db_ats.SaveChanges();
                var sp_travelorder_dates_dtl_tbl_list = db_ats.sp_travelorder_dates_dtl_tbl_list(travel_order_no).ToList();
                return JSON(new { message = "success", icon = "success", sp_travelorder_dates_dtl_tbl_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult edit_TO_dates(
             string travel_order_no
            ,string dd_travel_date_from_orig
            ,string dd_travel_date_from
            ,string dd_travel_date_to
            ,string dd_travel_start_time
            ,string dd_starttime_meridem
            ,string dd_travel_end_time
            ,string dd_endtime_meridem
        )
        {
            try
            {
                //var to_date = db_ats.travelorder_dates_dtl_tbl.Where(a => a.travel_order_no == travel_order_no && a.travel_date == Convert.ToDateTime(dd_travel_date_from)).FirstOrDefault();
                DateTime dtFrom = Convert.ToDateTime(dd_travel_date_from_orig);
                var delete_dates = db_ats.travelorder_dates_dtl_tbl.RemoveRange(db_ats.travelorder_dates_dtl_tbl.Where(a => a.travel_order_no == travel_order_no && a.travel_date == dtFrom));
                travelorder_dates_dtl_tbl travelorder_dates_dtl_tbl = new travelorder_dates_dtl_tbl();
                travelorder_dates_dtl_tbl.travel_order_no           = travel_order_no;
                travelorder_dates_dtl_tbl.travel_date               = Convert.ToDateTime(dd_travel_date_from);
                travelorder_dates_dtl_tbl.travel_date_to            = Convert.ToDateTime(dd_travel_date_to);
                travelorder_dates_dtl_tbl.travel_starttime          = dd_travel_start_time;
                travelorder_dates_dtl_tbl.travel_endtime            = dd_travel_end_time;
                travelorder_dates_dtl_tbl.travel_starttime_ampm     = dd_starttime_meridem;
                travelorder_dates_dtl_tbl.travel_endtime_ampm       = dd_endtime_meridem;
                db_ats.travelorder_dates_dtl_tbl.Add(travelorder_dates_dtl_tbl);
                db_ats.SaveChanges();
                var sp_travelorder_dates_dtl_tbl_list = db_ats.sp_travelorder_dates_dtl_tbl_list(travel_order_no).ToList();
                return JSON(new { message = "success",icon="success", sp_travelorder_dates_dtl_tbl_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message,icon="error"}, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult RetrieveEmployeeCancel(
            string par_application_nbr, string par_transaction_ref, string par_empl_id
        )
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                var sp_cancel_application_dtl_list = db_ats.sp_cancel_application_dtl_list_to(par_application_nbr, par_transaction_ref, par_empl_id).ToList();
                return JSON(new { message = "success", icon = "success", sp_cancel_application_dtl_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult AddTOEmployeeCancel(
            cancel_application_tbl data
        )
        {
            try
            {
                data.created_ddtm = DateTime.Now;
                data.created_by = Session["empl_id"].ToString().Trim();
                db_ats.cancel_application_tbl.Add(data);
                db_ats.SaveChanges();
                return JSON(new { message = "success", icon = "success"}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult add_TO_dates(
             string travel_order_no
            , string dd_travel_date_from_orig
            , string dd_travel_date_from
            , string dd_travel_date_to
            , string dd_travel_start_time
            , string dd_starttime_meridem
            , string dd_travel_end_time
            , string dd_endtime_meridem
        )
        {
            try
            {
                //var to_date = db_ats.travelorder_dates_dtl_tbl.Where(a => a.travel_order_no == travel_order_no && a.travel_date == Convert.ToDateTime(dd_travel_date_from)).FirstOrDefault();
                DateTime dtFrom = Convert.ToDateTime(dd_travel_date_from_orig);
               // var delete_dates = db_ats.travelorder_dates_dtl_tbl.RemoveRange(db_ats.travelorder_dates_dtl_tbl.Where(a => a.travel_order_no == travel_order_no && a.travel_date == dtFrom));
                travelorder_dates_dtl_tbl travelorder_dates_dtl_tbl = new travelorder_dates_dtl_tbl();
                travelorder_dates_dtl_tbl.travel_order_no = travel_order_no;
                travelorder_dates_dtl_tbl.travel_date = Convert.ToDateTime(dd_travel_date_from);
                travelorder_dates_dtl_tbl.travel_date_to = Convert.ToDateTime(dd_travel_date_to);
                travelorder_dates_dtl_tbl.travel_starttime = dd_travel_start_time;
                travelorder_dates_dtl_tbl.travel_endtime = dd_travel_end_time;
                travelorder_dates_dtl_tbl.travel_starttime_ampm = dd_starttime_meridem;
                travelorder_dates_dtl_tbl.travel_endtime_ampm = dd_endtime_meridem;
                db_ats.travelorder_dates_dtl_tbl.Add(travelorder_dates_dtl_tbl);
                db_ats.SaveChanges();
                var sp_travelorder_dates_dtl_tbl_list = db_ats.sp_travelorder_dates_dtl_tbl_list(travel_order_no).ToList();
                return JSON(new { message = "success", icon = "success", sp_travelorder_dates_dtl_tbl_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult RetrieveTOTypeDetails(
             string travel_order_no
            , string empl_id
        )
        {
            try
            {
                var sp_travelordertype_empl_dtl_tbl_list = db_ats.sp_travelordertype_empl_dtl_tbl(travel_order_no, empl_id).ToList();
                

                return JSON(new { message = "success", icon = "success", sp_travelordertype_empl_dtl_tbl_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult UpdateTOType(
             string travel_order_no
            , string empl_id
            , string traveltype_code
            , string rcrd_status
        )
        {
            try
            {
                var to_empl_type = db_ats.travelordertype_empl_dtl_tbl.Where(a => a.travel_order_no == travel_order_no && a.empl_id == empl_id).FirstOrDefault();
                var to_empl_dates = db_ats.travelorder_dates_dtl_tbl.Where(a => a.travel_order_no == travel_order_no).ToList();
                DateTime period_from = new DateTime();
                DateTime period_to = new DateTime();

                if (to_empl_dates.Count > 1)
                {
                    for (var x = 0; x < to_empl_dates.Count; x++) {
                        if (x == 0) {
                            period_from = Convert.ToDateTime(to_empl_dates[x].travel_date);
                        }
                        if (x == to_empl_dates.Count - 1) {
                            period_to = Convert.ToDateTime(to_empl_dates[x].travel_date_to);
                        }
                    }

                }

                else {

                }

                if (to_empl_type == null)
                {
                    travelordertype_empl_dtl_tbl travelordertype_empl_dtl_tbl = new travelordertype_empl_dtl_tbl();
                    travelordertype_empl_dtl_tbl.travel_order_no = travel_order_no;
                    travelordertype_empl_dtl_tbl.empl_id = empl_id;
                    travelordertype_empl_dtl_tbl.travel_type_code = traveltype_code;
                    travelordertype_empl_dtl_tbl.rcrd_status = rcrd_status;
                    travelordertype_empl_dtl_tbl.travel_date = period_from;
                    travelordertype_empl_dtl_tbl.travel_date_to = period_to;
                    db_ats.travelordertype_empl_dtl_tbl.Add(travelordertype_empl_dtl_tbl);

                }
                else
                {
                    to_empl_type.travel_type_code = traveltype_code;
                }

                db_ats.SaveChanges();

                return JSON(new { message = "success", icon = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message, icon = "error" }, JsonRequestBehavior.AllowGet);
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
                db_ats.Database.CommandTimeout = int.MaxValue;
                var sp_travelorder_search_list = db_ats.sp_travelorder_search_list(par_empl_id, par_year, par_month).ToList();
                return JSON(new { message = "success", icon = "success", sp_travelorder_search_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult GetCheckList(
             string par_period_from
            ,string par_period_to
            ,string par_dept_code
            ,string par_type
            ,string par_user_id
            ,string par_start_time
            ,string par_end_time
            )
            {
                try
                {
                    DateTime par_period_from_rep = new DateTime();
                    DateTime par_period_to_rep = new DateTime();

                    if (par_period_from == "") {
                     par_period_from = "1900-01-01";
                    }

                    if (par_period_to == "")
                    {
                           par_period_to = "1900-01-01";
                    }

                    if (par_period_from == "1900-01-01" || par_period_to == "1900-01-01")
                    {

                        par_period_from_rep = DateTime.Now;
                        par_period_to_rep   = DateTime.Now;
                    }

                    else {
                        par_period_from_rep = Convert.ToDateTime(par_period_from);
                        par_period_to_rep = Convert.ToDateTime(par_period_to);
                    }

                   
                
                    db_ats.Database.CommandTimeout = int.MaxValue;
                    var sp_travel_order_daily_pa_rep = db_ats.sp_travel_order_daily_pa_rep(par_period_from_rep, par_period_to_rep, par_dept_code, par_type, par_user_id, par_start_time, par_end_time).ToList();
                    return JSON(new { message = "success", icon = "success", sp_travel_order_daily_pa_rep }, JsonRequestBehavior.AllowGet);
                }
                catch (Exception e)
                {
                    string message = e.Message.ToString();
                    return Json(new { message = message, icon = "error" }, JsonRequestBehavior.AllowGet);
                }
            }


        public ActionResult GetCheckListActioned(
             string par_period_from
            , string par_period_to
            , string par_dept_code
            , string par_type
            , string par_user_id
            , string par_start_time
            , string par_end_time
            )
        {
            try
            {
                DateTime par_period_from_rep = new DateTime();
                DateTime par_period_to_rep = new DateTime();

                if (par_period_from == "")
                {
                    par_period_from = "1900-01-01";
                }

                if (par_period_to == "")
                {
                    par_period_to = "1900-01-01";
                }

                if (par_period_from == "1900-01-01" || par_period_to == "1900-01-01")
                {

                    par_period_from_rep = DateTime.Now;
                    par_period_to_rep = DateTime.Now;
                }

                else
                {
                    par_period_from_rep = Convert.ToDateTime(par_period_from);
                    par_period_to_rep = Convert.ToDateTime(par_period_to);
                }



                db_ats.Database.CommandTimeout = int.MaxValue;
                var sp_travel_order_daily_pa_rep_actioned = db_ats.sp_travel_order_daily_pa_rep_actioned(par_period_from_rep, par_period_to_rep, par_dept_code, par_type, par_user_id, par_start_time, par_end_time).ToList();
                return JSON(new { message = "success", icon = "success", sp_travel_order_daily_pa_rep_actioned }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Jorge Rustom Villanueva
        // Created Date : 02/13/2020
        // Description  : Approved
        //*********************************************************************//
        public ActionResult SaveDetails(string par_empl_id, string par_to_nbr)
        {
            try
            {

                var travel_details = "Final Approved";
                string message = "success";
                
                 var check_exists = db_ats.travel_order_check_tbl.Where(a =>
                               a.travel_order_no == par_to_nbr
                               && a.empl_id == par_empl_id).FirstOrDefault();

                if (check_exists != null)
                {
                    var approved_status_check = true;
                    check_exists.approved_status = approved_status_check;
                    check_exists.approved_dttm   = DateTime.Now;
                    check_exists.approved_by = Session["user_id"].ToString().Trim();

                }
                else
                {
                    travel_order_check_tbl travel_order_check_tbl = new travel_order_check_tbl();

                    travel_order_check_tbl.travel_order_no  = par_to_nbr;
                    travel_order_check_tbl.empl_id          = par_empl_id;
                    travel_order_check_tbl.approved_status  = true;
                    travel_order_check_tbl.approved_dttm    = DateTime.Now;
                    travel_order_check_tbl.approved_by      = Session["user_id"].ToString().Trim();
                    db_ats.travel_order_check_tbl.Add(travel_order_check_tbl);
                   
                }

                db_ats.SaveChangesAsync();


          



                return JSON(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Jorge Rustom Villanueva
        // Created Date : 02/13/2020
        // Description  : Disapproved
        //*********************************************************************//
        public ActionResult SaveDetailsDisapproved(string par_empl_id, string par_to_nbr, string comment)
        {
            var user_id = Session["user_id"].ToString();
            var datenow = DateTime.Now.ToString();
            try
            {
                string message = "success";

                var check_exists = db_ats.travel_order_check_tbl.Where(a =>
                              a.travel_order_no == par_to_nbr
                              && a.empl_id == par_empl_id).FirstOrDefault();

                if (check_exists != null)
                {
                    var approved_status_check = false;

                    check_exists.approved_status = approved_status_check;
                    check_exists.approved_dttm = DateTime.Now;
                    check_exists.approved_by = Session["user_id"].ToString().Trim();
                }
                else
                {
                    travel_order_check_tbl travel_order_check_tbl = new travel_order_check_tbl();

                    travel_order_check_tbl.travel_order_no = par_to_nbr;
                    travel_order_check_tbl.empl_id = par_empl_id;
                    travel_order_check_tbl.approved_status = false;
                    travel_order_check_tbl.approved_dttm = DateTime.Now;
                    travel_order_check_tbl.approved_by = Session["user_id"].ToString().Trim();
                    db_ats.travel_order_check_tbl.Add(travel_order_check_tbl);

                }

                // added by marvin
                var check_comment_exist = db_ats.to_disapprove_comment.Where(a => a.empl_id == par_empl_id && a.travel_order_no == par_to_nbr).FirstOrDefault();
                if (check_comment_exist != null)
                {
                    check_comment_exist.comment = comment;
                    check_comment_exist.updated_dttm = datenow;
                    check_comment_exist.updated_by = user_id;
                }
                else
                {
                    to_disapprove_comment todc = new to_disapprove_comment();
                    todc.empl_id = par_empl_id;
                    todc.travel_order_no = par_to_nbr;
                    todc.comment = comment;
                    todc.comment_dttm = datenow;
                    todc.comment_by = user_id;
                    db_ats.to_disapprove_comment.Add(todc);

                }

                db_ats.SaveChangesAsync();


                return JSON(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Marvin Olita
        // Created Date : 10/03/2022
        // Description  : Disapproved Comment
        //*********************************************************************//
        public ActionResult CheckCommentDisapproved(string par_empl_id, string par_to_nbr)
        {
            var user_id = Session["user_id"].ToString();
            var datenow = DateTime.Now.ToString();
            var comment = "";
            try
            {
                string message = "success";
                var comment_list = db_ats.sp_to_disapprove_comment().ToList();
                var check_comment_exist = db_ats.to_disapprove_comment.Where(a => a.empl_id == par_empl_id && a.travel_order_no == par_to_nbr).FirstOrDefault();

                if (check_comment_exist != null)
                {
                    comment = check_comment_exist.comment;
                }
                else
                {
                    comment = "";
                }

                return JSON(new { message ="success",comment, comment_list}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }



    }

    
}