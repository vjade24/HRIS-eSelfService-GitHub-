//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Overtime Request
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// Joseph M. Tombo Jr      06/17/2020      Code Creation
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
    public class cSSOverTimeRequestController : Controller
    {
        // GET: cSSOverTimeRequest
        HRIS_DEVEntities db_dev = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        User_Menu um            = new User_Menu();
        //*********************************************************************//
        // Created By : JMTJR - Created Date : 06/17/2020
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
                GetAllowAccess();

                string userid       = Session["user_id"].ToString();
                string empl_id      = Session["empl_id"].ToString();
                string empl_name    = Session["employee_name"].ToString();
                string dept_code    = Session["department_code"].ToString();
                string log_in_as_AO = Session["log_in_as_AO"].ToString();

                var department_list = db_dev.vw_departments_tbl_list.Where(a => a.department_code == dept_code).FirstOrDefault();
                var ddl_dep_list    = db_dev.sp_departments_tbl_list("N").ToList();
                var sub_dep_list    = db_dev.sp_subdepartments_tbl_list().ToList();
                var division_list   = db_dev.divisions_tbl.Where(a=> a.department_code == dept_code).ToList();
                var section_list    = db_dev.sections_tbl.Where(a=> a.department_code == dept_code).ToList();
                var funcharge_list  = db_dev.sp_fundcharges_tbl_list().ToList();
                var holiDate        = db_dev.sp_holidays_tbl_list(Int32.Parse(DateTime.Now.Year.ToString())).ToList();
                var from_thru       = db_dev.sp_get_from_and_thru().FirstOrDefault();
               
                var status          = db_ats.sp_approval_status_list().ToList();

                var empl_name_list_from  = db_dev.sp_employee_list_overtime(dept_code, "", "", "");
                var empl_name_list = db_dev.sp_employee_list_dept(empl_id);
                var datalistgrid    = db_ats.sp_ot_hdr_tbl_list(DateTime.Now.Year.ToString(),DateTime.Now.Month.ToString(),empl_id,Session["user_id"].ToString().Trim(),"").ToList();
                var calendar_data = db_ats.sp_ot_request_calendar_list(DateTime.Now.Year.ToString(), DateTime.Now.Month.ToString(), Session["empl_id"].ToString(), Session["user_id"].ToString(), "").ToList();
                return JSON(new { message = "success"
                                , empl_name_list
                                , department_list
                                , sub_dep_list
                                , division_list
                                , section_list
                                , funcharge_list
                                , ddl_dep_list
                                , um
                                , status
                                , empl_name
                                , empl_id
                                , dept_code
                                , holiDate
                                , datalistgrid
                                , calendar_data
                                , from_thru
                                , empl_name_list_from
                }, JsonRequestBehavior.AllowGet);
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
        // Description  : Get Employees
        //*********************************************************************//
        public ActionResult GetEmployeeCombolist(string dep_code, string subdep_code, string division, string section)
        {
            try
            {
                string empl_id = Session["empl_id"].ToString();

                var division_list   = db_dev.sp_divisions_tbl_combolist(dep_code, subdep_code).ToList();
                var section_list    = db_dev.sp_sections_tbl_combolist(dep_code, subdep_code, division).ToList();
                // var empl_name_list  = db_dev.sp_employee_list_overtime(dep_code, subdep_code, division, section);
                var empl_name_list = db_dev.sp_employee_list_dept(empl_id);
                return JSON(new { message = "success", empl_name_list, division_list, section_list }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr. 
        // Created Date : 05/09/2020
        // Description  : Get last code 
        //*********************************************************************//
        public ActionResult GenerateNewApplNbr(string par_empl_id, string par_year)
        {
            try
            {
                var new_appl_nbr = db_ats.sp_force_leave_plan_generate_appl_nbr().ToList();
                var available_leave = db_ats.sp_available_leave(par_empl_id, par_year, "FL", "force_leave_plan_dtl_tbl", "flp_application_date", "empl_id", "rcrd_status").ToList();

                return Json(new { message = "success", new_appl_nbr, available_leave }, JsonRequestBehavior.AllowGet);
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
        public ActionResult GetEmployeesDetails(string par_ot_ctrl_no)
        {
            try
            {
                var data_dates      = db_ats.sp_ot_request_dates_dtl_tbl_list(par_ot_ctrl_no).ToList();
                var data_empl       = db_ats.sp_ot_request_empl_dtl_tbl_list(par_ot_ctrl_no).ToList();
                var data_purpose    = db_ats.sp_ot_request_purpose_dtl_tbl_list(par_ot_ctrl_no).ToList();
                return JSON(new { message = "success", data_dates, data_empl, data_purpose }, JsonRequestBehavior.AllowGet);
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
        public ActionResult CheckIfExistEmployee(List<ot_request_empl_dtl_tbl> par_employees, List<ot_request_dates_dtl_tbl> par_dates, string par_action, string par_ctrl_no)
        {
            try
            {
                string exist            = "";
                string exist_content    = "";
                if (par_employees != null && par_dates != null && par_employees.Count > 0 && par_dates.Count > 0)
                {
                    for (int x = 0; x < par_employees.Count; x++)
                    {
                        for (int y = 0; y < par_dates.Count; y++)
                        {
                            string exists = "";
                            string ctrl_no = par_action == "ADD" ? GetTravelOrderNumber(): par_ctrl_no;
                            exists = db_ats.sp_validate_empl_dates("OT", ctrl_no, par_employees[x].empl_id, "", DateTime.Parse(par_dates[y].ot_date_from.ToString()).ToString("yyyy-MM-dd"), DateTime.Parse(par_dates[y].ot_date_to.ToString()).ToString("yyyy-MM-dd")).FirstOrDefault();

                            if (exists == "Y")
                            {
                                exist_content += " " + par_employees[x].empl_id + ",";
                                exist = "Y";
                            }
                        }
                    }
                }

                exist_content = exist_content.Trim(',');

                return JSON(new { message = "success", exist, exist_content }, JsonRequestBehavior.AllowGet);
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
        public ActionResult GetEmployeeData(string par_empl_id_details, string par_month, string par_year, string par_status)
        {
            try
            {
                string empl_id = Session["empl_id"].ToString();

                if (par_empl_id_details == "")
                {
                    par_empl_id_details = empl_id;
                }

                var calendar_data   = db_ats.sp_ot_request_calendar_list(par_year,par_month,par_empl_id_details,Session["user_id"].ToString().Trim(),par_status).ToList();
                var hdr_data        = db_ats.sp_ot_hdr_tbl_list(par_year,par_month,Session["empl_id"].ToString().Trim(), Session["user_id"].ToString().Trim(),par_status).ToList();
                return JSON(new { message = "success", calendar_data, hdr_data }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }



        //*********************************************************************//
        // Created By   : Jorge Rustom Villanueva
        // Created Date : 05/28/2020
        // Description  : Check if Boolean
        //*********************************************************************//
        public bool isCheckBool(string value)
        {
            bool data = new bool();

            if (value == "" || value == null)
            {
                data = false;
            }

            else if (value.ToString().ToUpper() == "TRUE" || value.ToString().ToUpper() == "1")
            {
                data = true;
            }

            else if (value.ToString().ToUpper() == "FALSE" || value.ToString().ToUpper() == "0")
            {
                data = false;
            }

            return data;
        }

        //*********************************************************************//
        // Created By   : Jorge Rustom Villanueva
        // Created Date : 05/28/2020
        // Description  : Check if Date
        //*********************************************************************//

        public DateTime isCheckDate(string value)
        {
            DateTime data = new DateTime();

            if (value == "" || value == null)
            {
                data = Convert.ToDateTime("1900-01-01");
            }

            else
            {
                data = Convert.ToDateTime(value);
            }


            return data;
        }


        //*********************************************************************//
        // Created By   : Jorge Rustom Villanueva
        // Created Date : 05/28/2020
        // Description  : Check if String
        //*********************************************************************//
        public string isCheckString(string value)
        {
            string data = "";
            try {
                if (value == null || value.Trim() == "")
                {
                    data = "";
                }
                else
                {
                    data = value;
                }
            }
            catch (Exception e)
            {
                data = "";
            }
            return data;
        }

        public ActionResult CheckIfExists(string par_travel_type, string[] par_data_empl, string[] par_data_dates)
        {
            string dept_code = Session["department_code"].ToString();
            string message = "success";
            var sp_travelorder_exists_check = db_ats.sp_travelorder_exists_check(dept_code).ToList();

            List<object> employees_exists_list = new List<object>();

            for (int x = 0; x < sp_travelorder_exists_check.Count; x++)
            {
                for (int y = 0; y < par_data_empl.Length; y++)
                {
                    if (sp_travelorder_exists_check[x].empl_id == par_data_empl[y])
                    {
                        for (int z = 0; z < par_data_dates.Length; z++)
                        {
                            if (sp_travelorder_exists_check[x].travel_date == par_data_dates[z])
                            {
                                if (sp_travelorder_exists_check[x].travel_type_code == par_travel_type)
                                {
                                    employees_exists_list.Add(sp_travelorder_exists_check[x]);
                                    message = "fail";
                                }

                            }
                        }
                    }
                }

            }

            return JSON(new { message, employees_exists_list }, JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By   : Jorge Rustom Villanueva
        // Created Date : 05/28/2020
        // Description  : GetTravelOrderNumber
        //*********************************************************************//

        public ActionResult GetTravelOrderNumberAction()
        {
            string travel_order_number_display = "";

            travel_order_number_display = GetTravelOrderNumber();

            return JSON(new { travel_order_number_display }, JsonRequestBehavior.AllowGet);
        }

        public string GetTravelOrderNumber()
        {
            var GetTravelOrderNumber    = db_ats.sp_generate_next_ot_ctrl_nbr().FirstOrDefault();
            string travel_order_number  = GetTravelOrderNumber.ToString();
            return travel_order_number;
        }

        //*********************************************************************//
        // Created By   : JORGE RUSTOM VILLANUEVA
        // Created Date : 04/13/2020
        // Description  : Add new record to table with status as New/Submitted
        //*********************************************************************//
        public ActionResult SaveDirectToDatabase(string par_status, ot_request_hdr_tbl par_data_header, List<ot_request_empl_dtl_tbl> par_data_empl, List<ot_request_dates_dtl_tbl> par_data_dates, List<ot_request_purpose_dtl_tbl> par_data_purpose, string par_action)
        {
            try
            {
                string ot_ctrl_no   = "";
                string message      = "";
                ot_ctrl_no          = GetTravelOrderNumber();
                string ao_id = Session["empl_id"].ToString();
                bool reviewer = false;
                var trans_ref = db_dev.transactionsapprover_tbl.Where(a => a.empl_id == ao_id
                                                        && a.transaction_code == "004"
                                                        && a.workflow_authority == "0"
                                                        && a.with_self_service_approval == true).FirstOrDefault();
                if (trans_ref != null)
                {
                    reviewer = true;
                }

                if (isCheckString(par_data_header.oth_fund_descr) != "")
                {
                    par_data_header.fund_code = "99";
                }

                if (par_action == "ADD")
                {
                    ot_request_hdr_tbl ot_request_row = new ot_request_hdr_tbl();

                    par_data_header.ot_ctrl_no = ot_ctrl_no;
                    if (par_status == "N")
                    {
                       

                        ot_request_row.ot_ctrl_no           = isCheckString(ot_ctrl_no);
                        ot_request_row.approval_id          = "";
                        ot_request_row.approval_status      = par_status;
                        ot_request_row.created_by_user      = Session["user_id"].ToString().Trim();
                        ot_request_row.created_dttm         = DateTime.Now;
                        ot_request_row.dayoff_ot_flag       = par_data_header.dayoff_ot_flag;
                        ot_request_row.dayoff_ot_in         = isCheckString(par_data_header.dayoff_ot_in);
                        ot_request_row.dayoff_ot_in_ampm    = isCheckString(par_data_header.dayoff_ot_in_ampm);
                        ot_request_row.dayoff_ot_out        = isCheckString(par_data_header.dayoff_ot_out);
                        ot_request_row.dayoff_ot_out_ampm   = isCheckString(par_data_header.dayoff_ot_out_ampm);
                        ot_request_row.department_code      = isCheckString(par_data_header.department_code);
                        ot_request_row.division_code        = isCheckString(par_data_header.division_code);
                        ot_request_row.fund_code            = isCheckString(par_data_header.fund_code);
                        ot_request_row.holiday_flag         = par_data_header.holiday_flag;
                        ot_request_row.holiday_in           = isCheckString(par_data_header.holiday_in);
                        ot_request_row.holiday_in_ampm      = isCheckString(par_data_header.holiday_in_ampm);
                        ot_request_row.holiday_out          = isCheckString(par_data_header.holiday_out);
                        ot_request_row.holiday_out_ampm     = isCheckString(par_data_header.holiday_out_ampm);
                        ot_request_row.ot_coc_credit_flag   = par_data_header.ot_coc_credit_flag;
                        ot_request_row.ot_for_empl_id       = isCheckString(par_data_header.ot_for_empl_id);
                        ot_request_row.ot_from_empl_id      = isCheckString(par_data_header.ot_from_empl_id);
                        ot_request_row.ot_justification     = isCheckString(par_data_header.ot_justification);
                        ot_request_row.ot_month             = isCheckString(par_data_header.ot_month);
                        ot_request_row.ot_requestor_empl_id = Session["user_id"].ToString().Trim('U').Replace("U","");
                        ot_request_row.ot_request_date      = par_data_header.ot_request_date;
                        ot_request_row.ot_subject           = isCheckString(par_data_header.ot_subject);
                        ot_request_row.ot_thru_empl_id      = isCheckString(par_data_header.ot_thru_empl_id);
                        ot_request_row.ot_year              = isCheckString(par_data_header.ot_year);
                        ot_request_row.posting_status       = par_data_header.posting_status;
                        ot_request_row.section_code         = isCheckString(par_data_header.section_code);
                        ot_request_row.subdepartment_code   = isCheckString(par_data_header.subdepartment_code);
                        ot_request_row.updated_by_user      = "";
                        ot_request_row.updated_dttm         = DateTime.Parse("1900-01-01");
                        ot_request_row.weekdays_flag        = par_data_header.weekdays_flag;
                        ot_request_row.weekdays_in          = isCheckString(par_data_header.weekdays_in);
                        ot_request_row.weekdays_in_ampm     = isCheckString(par_data_header.weekdays_in_ampm);
                        ot_request_row.weekdays_out         = isCheckString(par_data_header.weekdays_out);
                        ot_request_row.weekdays_out_ampm    = isCheckString(par_data_header.weekdays_out_ampm);
                        ot_request_row.weekend_flag         = par_data_header.weekend_flag;
                        ot_request_row.weekend_in           = isCheckString(par_data_header.weekend_in);
                        ot_request_row.weekend_in_ampm      = isCheckString(par_data_header.weekend_in_ampm);
                        ot_request_row.weekend_out          = isCheckString(par_data_header.weekend_out);
                        ot_request_row.oth_fund_descr       = isCheckString(par_data_header.oth_fund_descr);
                        ot_request_row.weekend_out_ampm     = isCheckString(par_data_header.weekend_out_ampm);
                        ot_request_row.details_remarks      = string.Empty;

                        db_ats.ot_request_hdr_tbl.Add(ot_request_row);

                        if (par_data_empl != null)
                        {
                            //ADD DATA OT EMPLOYEES DETAILS
                            
                            for (var x = 0; x < par_data_empl.Count; x++)
                            {
                                par_data_empl[x].ot_ctrl_no     = ot_ctrl_no;
                                par_data_empl[x].rcrd_status    = par_status;
                                db_ats.ot_request_empl_dtl_tbl.Add(par_data_empl[x]);
                            }

                        }

                        if (par_data_dates != null)
                        {
                            //ADD DATA OT REQUEST DATES
                            for (var x = 0; x < par_data_dates.Count; x++)
                            {
                                par_data_dates[x].ot_ctrl_no    = ot_ctrl_no;
                                par_data_dates[x].rcrd_status   = par_status;
                                db_ats.ot_request_dates_dtl_tbl.Add(par_data_dates[x]);
                            }
                        }

                        if (par_data_purpose != null)
                        {
                            //ADD DATA OT REQUEST PURPOSE
                            for (var x = 0; x < par_data_purpose.Count; x++)
                            {
                                par_data_purpose[x].ot_ctrl_no  = ot_ctrl_no;
                                par_data_purpose[x].rcrd_status = par_status;
                                db_ats.ot_request_purpose_dtl_tbl.Add(par_data_purpose[x]);
                            }
                        }
                    }
                    else if (par_status == "S")
                    {
                        var app_id = db_dev.sp_insert_transaction_to_approvalworkflow_tbl(Session["user_id"].ToString(), Session["empl_id"].ToString(), "004").ToList();
                        par_data_header.approval_id = app_id[0].ToString();

                        ot_request_row.ot_ctrl_no           = isCheckString(ot_ctrl_no);
                        ot_request_row.approval_id          = par_data_header.approval_id;
                        ot_request_row.approval_status      = par_status;
                        ot_request_row.created_by_user      = Session["user_id"].ToString().Trim();
                        ot_request_row.created_dttm         = DateTime.Now;
                        ot_request_row.dayoff_ot_flag       = par_data_header.dayoff_ot_flag;
                        ot_request_row.dayoff_ot_in         = isCheckString(par_data_header.dayoff_ot_in);
                        ot_request_row.dayoff_ot_in_ampm    = isCheckString(par_data_header.dayoff_ot_in_ampm);
                        ot_request_row.dayoff_ot_out        = isCheckString(par_data_header.dayoff_ot_out);
                        ot_request_row.dayoff_ot_out_ampm   = isCheckString(par_data_header.dayoff_ot_out_ampm);
                        ot_request_row.department_code      = isCheckString(par_data_header.department_code);
                        ot_request_row.division_code        = isCheckString(par_data_header.division_code);
                        ot_request_row.fund_code            = isCheckString(par_data_header.fund_code);
                        ot_request_row.holiday_flag         = par_data_header.holiday_flag;
                        ot_request_row.holiday_in           = isCheckString(par_data_header.holiday_in);
                        ot_request_row.holiday_in_ampm      = isCheckString(par_data_header.holiday_in_ampm);
                        ot_request_row.holiday_out          = isCheckString(par_data_header.holiday_out);
                        ot_request_row.holiday_out_ampm     = isCheckString(par_data_header.holiday_out_ampm);
                        ot_request_row.ot_coc_credit_flag   = par_data_header.ot_coc_credit_flag;
                        ot_request_row.ot_for_empl_id       = isCheckString(par_data_header.ot_for_empl_id);
                        ot_request_row.ot_from_empl_id      = isCheckString(par_data_header.ot_from_empl_id);
                        ot_request_row.ot_justification     = isCheckString(par_data_header.ot_justification);
                        ot_request_row.ot_month             = isCheckString(par_data_header.ot_month);
                        ot_request_row.ot_requestor_empl_id = Session["user_id"].ToString().Trim('U').Replace("U","");
                        ot_request_row.ot_request_date      = par_data_header.ot_request_date;
                        ot_request_row.ot_subject           = isCheckString(par_data_header.ot_subject);
                        ot_request_row.ot_thru_empl_id      = isCheckString(par_data_header.ot_thru_empl_id);
                        ot_request_row.ot_year              = isCheckString(par_data_header.ot_year);
                        ot_request_row.posting_status       = par_data_header.posting_status;
                        ot_request_row.section_code         = isCheckString(par_data_header.section_code);
                        ot_request_row.subdepartment_code   = isCheckString(par_data_header.subdepartment_code);
                        ot_request_row.updated_by_user      = "";
                        ot_request_row.updated_dttm         = DateTime.Parse("1900-01-01");
                        ot_request_row.weekdays_flag        = par_data_header.weekdays_flag;
                        ot_request_row.weekdays_in          = isCheckString(par_data_header.weekdays_in);
                        ot_request_row.weekdays_in_ampm     = isCheckString(par_data_header.weekdays_in_ampm);
                        ot_request_row.weekdays_out         = isCheckString(par_data_header.weekdays_out);
                        ot_request_row.weekdays_out_ampm    = isCheckString(par_data_header.weekdays_out_ampm);
                        ot_request_row.weekend_flag         = par_data_header.weekend_flag;
                        ot_request_row.weekend_in           = isCheckString(par_data_header.weekend_in);
                        ot_request_row.weekend_in_ampm      = isCheckString(par_data_header.weekend_in_ampm);
                        ot_request_row.weekend_out          = isCheckString(par_data_header.weekend_out);
                        ot_request_row.oth_fund_descr       = isCheckString(par_data_header.oth_fund_descr);
                        ot_request_row.weekend_out_ampm     = isCheckString(par_data_header.weekend_out_ampm);
                        ot_request_row.details_remarks      = string.Empty;

                        db_ats.ot_request_hdr_tbl.Add(ot_request_row);

                        if (par_data_empl != null)
                        {
                            //ADD DATA OT EMPLOYEES DETAILS
                            for (var x = 0; x < par_data_empl.Count; x++)
                            {
                                par_data_empl[x].ot_ctrl_no = ot_ctrl_no;
                                par_data_empl[x].rcrd_status = par_status;
                                db_ats.ot_request_empl_dtl_tbl.Add(par_data_empl[x]);
                            }
                        }

                        if (par_data_dates != null)
                        {
                            //ADD DATA OT REQUEST DATES
                            for (var x = 0; x < par_data_dates.Count; x++)
                            {
                                par_data_dates[x].ot_ctrl_no = ot_ctrl_no;
                                par_data_dates[x].rcrd_status = par_status;
                                db_ats.ot_request_dates_dtl_tbl.Add(par_data_dates[x]);
                            }
                        }

                        if (par_data_purpose != null)
                        {
                            //ADD DATA OT REQUEST PURPOSE DATES
                            for (var x = 0; x < par_data_purpose.Count; x++)
                            {
                                par_data_purpose[x].ot_ctrl_no  = ot_ctrl_no;
                                par_data_purpose[x].rcrd_status = par_status;
                                db_ats.ot_request_purpose_dtl_tbl.Add(par_data_purpose[x]);
                            }
                        }

                        
                    }
                    message = "success";
                    db_ats.SaveChanges();
                }

                if (par_action == "EDIT")
                {

                    var ot_request_hdr_tbl_x          = db_ats.ot_request_hdr_tbl.Where(a => a.ot_ctrl_no == par_data_header.ot_ctrl_no).FirstOrDefault();
                    string validate_approval_status = ot_request_hdr_tbl_x.approval_status;

                    if (validate_approval_status == "N" || validate_approval_status == "C")
                    {
                        var delete_dates    = db_ats.ot_request_dates_dtl_tbl.RemoveRange(db_ats.ot_request_dates_dtl_tbl.Where(a => a.ot_ctrl_no == par_data_header.ot_ctrl_no));
                        var delete_empl     = db_ats.ot_request_empl_dtl_tbl.RemoveRange(db_ats.ot_request_empl_dtl_tbl.Where(a => a.ot_ctrl_no == par_data_header.ot_ctrl_no));
                        var delete_purpose  = db_ats.ot_request_purpose_dtl_tbl.RemoveRange(db_ats.ot_request_purpose_dtl_tbl.Where(a => a.ot_ctrl_no == par_data_header.ot_ctrl_no));

                        if ((ot_request_hdr_tbl_x.approval_id == null
                            || ot_request_hdr_tbl_x.approval_id.ToString().Trim() == "")
                            && par_status == "S"
                            )
                        {
                            var app_id = db_dev.sp_insert_transaction_to_approvalworkflow_tbl(Session["user_id"].ToString(), Session["empl_id"].ToString(), "004").ToList();
                            par_data_header.approval_id = app_id[0].ToString();
                        }
                        else
                        {
                            par_data_header.approval_id = ot_request_hdr_tbl_x.approval_id;
                        }
                         if ( par_status == "S")
                        {
                            ot_request_hdr_tbl_x.approval_status = isCheckString(par_status);
                        }

                        ot_request_hdr_tbl_x.posting_status       = isCheckBool(par_data_header.posting_status.ToString());
                        ot_request_hdr_tbl_x.department_code      = isCheckString(par_data_header.department_code);
                        ot_request_hdr_tbl_x.ot_justification     = isCheckString(par_data_header.ot_justification);

                        //ot_request_row.ot_ctrl_no           = isCheckString(ot_ctrl_no);
                        ot_request_hdr_tbl_x.approval_id          = par_data_header.approval_id;
                        //ot_request_hdr_tbl_x.approval_status      = par_status;
                        //ot_request_hdr_tbl_x.created_by_user      = Session["user_id"].ToString().Trim();
                        //ot_request_hdr_tbl_x.created_dttm         = DateTime.Now;
                        ot_request_hdr_tbl_x.dayoff_ot_flag       = par_data_header.dayoff_ot_flag;
                        ot_request_hdr_tbl_x.dayoff_ot_in         = isCheckString(par_data_header.dayoff_ot_in);
                        ot_request_hdr_tbl_x.dayoff_ot_in_ampm    = isCheckString(par_data_header.dayoff_ot_in_ampm);
                        ot_request_hdr_tbl_x.dayoff_ot_out        = isCheckString(par_data_header.dayoff_ot_out);
                        ot_request_hdr_tbl_x.dayoff_ot_out_ampm   = isCheckString(par_data_header.dayoff_ot_out_ampm);
                        ot_request_hdr_tbl_x.department_code      = isCheckString(par_data_header.department_code);
                        ot_request_hdr_tbl_x.division_code        = isCheckString(par_data_header.division_code);
                        ot_request_hdr_tbl_x.fund_code            = isCheckString(par_data_header.fund_code);
                        ot_request_hdr_tbl_x.holiday_flag         = par_data_header.holiday_flag;
                        ot_request_hdr_tbl_x.holiday_in           = isCheckString(par_data_header.holiday_in);
                        ot_request_hdr_tbl_x.holiday_in_ampm      = isCheckString(par_data_header.holiday_in_ampm);
                        ot_request_hdr_tbl_x.holiday_out          = isCheckString(par_data_header.holiday_out);
                        ot_request_hdr_tbl_x.holiday_out_ampm     = isCheckString(par_data_header.holiday_out_ampm);
                        ot_request_hdr_tbl_x.ot_coc_credit_flag   = par_data_header.ot_coc_credit_flag;
                        ot_request_hdr_tbl_x.ot_for_empl_id       = isCheckString(par_data_header.ot_for_empl_id);
                        ot_request_hdr_tbl_x.ot_from_empl_id      = isCheckString(par_data_header.ot_from_empl_id);
                        ot_request_hdr_tbl_x.ot_justification     = isCheckString(par_data_header.ot_justification);
                        ot_request_hdr_tbl_x.ot_month             = isCheckString(par_data_header.ot_month);
                        ot_request_hdr_tbl_x.ot_requestor_empl_id = Session["user_id"].ToString().Trim('U').Replace("U","");
                        ot_request_hdr_tbl_x.ot_request_date      = par_data_header.ot_request_date;
                        ot_request_hdr_tbl_x.ot_subject           = isCheckString(par_data_header.ot_subject);
                        ot_request_hdr_tbl_x.ot_thru_empl_id      = isCheckString(par_data_header.ot_thru_empl_id);
                        ot_request_hdr_tbl_x.ot_year              = isCheckString(par_data_header.ot_year);
                        ot_request_hdr_tbl_x.posting_status       = par_data_header.posting_status;
                        ot_request_hdr_tbl_x.section_code         = isCheckString(par_data_header.section_code);
                        ot_request_hdr_tbl_x.subdepartment_code   = isCheckString(par_data_header.subdepartment_code);
                        ot_request_hdr_tbl_x.updated_by_user      = Session["user_id"].ToString().Trim();
                        ot_request_hdr_tbl_x.updated_dttm         = DateTime.Now;
                        ot_request_hdr_tbl_x.weekdays_flag        = par_data_header.weekdays_flag;
                        ot_request_hdr_tbl_x.weekdays_in          = isCheckString(par_data_header.weekdays_in);
                        ot_request_hdr_tbl_x.weekdays_in_ampm     = isCheckString(par_data_header.weekdays_in_ampm);
                        ot_request_hdr_tbl_x.weekdays_out         = isCheckString(par_data_header.weekdays_out);
                        ot_request_hdr_tbl_x.weekdays_out_ampm    = isCheckString(par_data_header.weekdays_out_ampm);
                        ot_request_hdr_tbl_x.weekend_flag         = par_data_header.weekend_flag;
                        ot_request_hdr_tbl_x.weekend_in           = isCheckString(par_data_header.weekend_in);
                        ot_request_hdr_tbl_x.weekend_in_ampm      = isCheckString(par_data_header.weekend_in_ampm);
                        ot_request_hdr_tbl_x.weekend_out          = isCheckString(par_data_header.weekend_out);
                        ot_request_hdr_tbl_x.weekend_out_ampm     = isCheckString(par_data_header.weekend_out_ampm);
                        ot_request_hdr_tbl_x.oth_fund_descr         = isCheckString(par_data_header.oth_fund_descr);
                        message = "success";
                        //ADD DATA OT EMPLOYEES DETAILS
                        if (par_data_empl != null)
                        {
                            for (var x = 0; x < par_data_empl.Count; x++)
                            {
                                par_data_empl[x].ot_ctrl_no     = par_data_header.ot_ctrl_no;
                                par_data_empl[x].rcrd_status    = ot_request_hdr_tbl_x.approval_status;
                                db_ats.ot_request_empl_dtl_tbl.Add(par_data_empl[x]);
                            }
                        }

                        if (par_data_dates != null)
                        {
                            //ADD DATA TO OT REQUEST DATES
                            for (var x = 0; x < par_data_dates.Count; x++)
                            {
                                par_data_dates[x].ot_ctrl_no    = par_data_header.ot_ctrl_no;
                                par_data_dates[x].rcrd_status   = ot_request_hdr_tbl_x.approval_status;
                                db_ats.ot_request_dates_dtl_tbl.Add(par_data_dates[x]);
                            }
                        }

                        if (par_data_purpose != null)
                        {
                            //ADD DATA OT REQUEST PURPOSE
                            for (var x = 0; x < par_data_purpose.Count; x++)
                            {
                                par_data_purpose[x].ot_ctrl_no  = par_data_header.ot_ctrl_no;
                                par_data_purpose[x].rcrd_status = ot_request_hdr_tbl_x.approval_status;
                                db_ats.ot_request_purpose_dtl_tbl.Add(par_data_purpose[x]);
                            }
                        }
                        if (par_status == "S")
                        {
                            db_dev.sp_update_transaction_in_approvalworkflow_tbl(par_data_header.approval_id, Session["user_id"].ToString(), par_status, "Submitted");
                        }

                    }
                    else
                    {
                        message = "fail";
                    }
                    db_ats.SaveChanges();
                }
                par_data_header.approval_status = par_status;
                if (reviewer)
                {
                    if (par_status == "S")
                    {
                        db_dev.sp_update_transaction_in_approvalworkflow_tbl(par_data_header.approval_id, Session["user_id"].ToString(), "R", "Reviewed");

                        string ctrl_no = par_data_header.ot_ctrl_no;
                        var query = db_ats.ot_request_hdr_tbl.Where(a => a.ot_ctrl_no == ctrl_no).FirstOrDefault();
                        if (query != null)
                        {
                            query.approval_status = "R";
                        }
                        var query2 = db_ats.ot_request_dates_dtl_tbl.Where(a => a.ot_ctrl_no == ctrl_no).ToList();
                        if (query2 != null && query2.Count > 0)
                        {
                            query2.ForEach(a => a.rcrd_status = "R");
                        }

                        var query3 = db_ats.ot_request_empl_dtl_tbl.Where(a => a.ot_ctrl_no == ctrl_no).ToList();
                        if (query3 != null && query2.Count > 0)
                        {
                            query3.ForEach(a => a.rcrd_status = "R");
                        }

                        var query4 = db_ats.ot_request_purpose_dtl_tbl.Where(a => a.ot_ctrl_no == ctrl_no).ToList();
                        if (query4 != null && query2.Count > 0)
                        {
                            query4.ForEach(a => a.rcrd_status = "R");
                        }
                        par_data_header.approval_status = "R";
                        db_ats.SaveChanges();
                    }

                }
                string user_id = Session["user_id"].ToString();
                var trans_ref2 = db_ats.sp_ss_auto_approval(user_id, "004").ToList();

                if (trans_ref2[0].auto_status != "")
                {
                    if (par_status == "S")
                    {
                        par_data_header.approval_status = trans_ref2[0].auto_status;
                        par_data_header.details_remarks = trans_ref2[0].auto_remarks;

                        db_dev.sp_update_transaction_in_approvalworkflow_tbl(par_data_header.approval_id, Session["user_id"].ToString(), par_data_header.approval_status, par_data_header.details_remarks);

                        string ctrl_no = par_data_header.ot_ctrl_no;
                        var query = db_ats.ot_request_hdr_tbl.Where(a => a.ot_ctrl_no == ctrl_no).FirstOrDefault();
                        if (query != null)
                        {
                            query.approval_status = par_data_header.approval_status;
                        }
                        var query2 = db_ats.ot_request_dates_dtl_tbl.Where(a => a.ot_ctrl_no == ctrl_no).ToList();
                        if (query2 != null && query2.Count > 0)
                        {
                            query2.ForEach(a => a.rcrd_status = par_data_header.approval_status);
                        }

                        var query3 = db_ats.ot_request_empl_dtl_tbl.Where(a => a.ot_ctrl_no == ctrl_no).ToList();
                        if (query3 != null && query2.Count > 0)
                        {
                            query3.ForEach(a => a.rcrd_status = par_data_header.approval_status);
                        }

                        var query4 = db_ats.ot_request_purpose_dtl_tbl.Where(a => a.ot_ctrl_no == ctrl_no).ToList();
                        if (query4 != null && query2.Count > 0)
                        {
                            query4.ForEach(a => a.rcrd_status = par_data_header.approval_status);
                        }
                        par_data_header.approval_status = par_data_header.approval_status;
                        db_ats.SaveChanges();
                    }
                }

                db_ats.SaveChangesAsync();
                return Json(new { message,par_data_header }, JsonRequestBehavior.AllowGet);
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
        // Description  : delete from travel order details directly
        //*********************************************************************//
        public ActionResult Delete(ot_request_empl_dtl_tbl par_data_empl, ot_request_dates_dtl_tbl par_data_date, ot_request_purpose_dtl_tbl par_data_purpose, string par_tbl)
        {
            try
            {

                string message = "";
                if (par_tbl == "ot_request_empl_dtl_tbl")
                {
                    var select = db_ats.ot_request_empl_dtl_tbl.Where(a => a.ot_ctrl_no == par_data_empl.ot_ctrl_no &&
                        a.empl_id == par_data_empl.empl_id).FirstOrDefault();

                    if (select != null)
                    {
                        db_ats.ot_request_empl_dtl_tbl.Remove(select);
                        db_ats.SaveChangesAsync();
                    }
                }
                else if (par_tbl == "ot_request_dates_dtl_tbl")
                {
                    var select = db_ats.ot_request_dates_dtl_tbl.Where(a => a.ot_ctrl_no == par_data_date.ot_ctrl_no &&
                           a.ot_date_from == par_data_date.ot_date_from && a.ot_date_to == par_data_date.ot_date_to).FirstOrDefault();

                    if (select != null)
                    {
                        db_ats.ot_request_dates_dtl_tbl.Remove(select);
                        db_ats.SaveChangesAsync();
                    }
                }
                else if (par_tbl == "ot_request_purpose_dtl_tbl")
                {
                    var select = db_ats.ot_request_purpose_dtl_tbl.Where(a => a.ot_ctrl_no == par_data_purpose.ot_ctrl_no).FirstOrDefault();

                    if (select != null)
                    {
                        db_ats.ot_request_purpose_dtl_tbl.Remove(select);
                        db_ats.SaveChangesAsync();
                    }
                }


                message = "success";
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
        public ActionResult DeleteFromDatabase(ot_request_hdr_tbl par_data, ot_request_dates_dtl_tbl par_date)
        {
            try
            {

               
                var query       = db_ats.ot_request_hdr_tbl.Where(a =>
                a.ot_ctrl_no    == par_data.ot_ctrl_no && (a.approval_status == "N" || a.approval_status == "C")).FirstOrDefault();

                string message = "";
                if (par_date != null)
                {
                    var query2 = db_ats.ot_request_dates_dtl_tbl.Where(a =>
                            a.ot_ctrl_no == par_data.ot_ctrl_no && a.ot_date_from == par_date.ot_date_from).FirstOrDefault();

                    if (query2 != null)
                    {
                        db_ats.ot_request_dates_dtl_tbl.Remove(query2);
                        db_ats.SaveChanges();
                    }
                    db_ats.SaveChanges();
                    var queryX = db_ats.ot_request_dates_dtl_tbl.Where(a =>
                           a.ot_ctrl_no == par_data.ot_ctrl_no).ToList();

                    if (queryX == null || queryX.Count <= 0)
                    {
                        db_ats.ot_request_hdr_tbl.Remove(query);

                        var querydeleteempl = db_ats.ot_request_empl_dtl_tbl.Where(a => a.ot_ctrl_no == par_data.ot_ctrl_no).FirstOrDefault();

                        if (querydeleteempl != null)
                        {
                            db_ats.ot_request_empl_dtl_tbl.Remove(querydeleteempl);
                        }

                        var querydeletedates = db_ats.ot_request_dates_dtl_tbl.Where(a => a.ot_ctrl_no == par_data.ot_ctrl_no).FirstOrDefault();

                        if (querydeletedates != null)
                        {
                            db_ats.ot_request_dates_dtl_tbl.Remove(querydeletedates);
                        }

                        var querydeletepurpose = db_ats.ot_request_purpose_dtl_tbl.Where(a => a.ot_ctrl_no == par_data.ot_ctrl_no).FirstOrDefault();

                        if (querydeletepurpose != null)
                        {
                            db_ats.ot_request_purpose_dtl_tbl.Remove(querydeletepurpose);
                        }
                    }

                    message = "success";
                    db_ats.SaveChanges();
                }
                else
                {
                    db_ats.ot_request_hdr_tbl.Remove(query);

                    var querydeleteempl = db_ats.ot_request_empl_dtl_tbl.Where(a => a.ot_ctrl_no == par_data.ot_ctrl_no).ToList();

                    if (querydeleteempl != null)
                    {
                        db_ats.ot_request_empl_dtl_tbl.RemoveRange(querydeleteempl);
                    }

                    var querydeletedates = db_ats.ot_request_dates_dtl_tbl.Where(a => a.ot_ctrl_no == par_data.ot_ctrl_no).ToList();

                    if (querydeletedates != null)
                    {
                        db_ats.ot_request_dates_dtl_tbl.RemoveRange(querydeletedates);
                    }

                    var querydeletepurpose = db_ats.ot_request_purpose_dtl_tbl.Where(a => a.ot_ctrl_no == par_data.ot_ctrl_no).ToList();

                    if (querydeletepurpose != null)
                    {
                        db_ats.ot_request_purpose_dtl_tbl.RemoveRange(querydeletepurpose);
                    }

                    var query2 = db_ats.ot_request_dates_dtl_tbl.Where(a =>
                            a.ot_ctrl_no == par_data.ot_ctrl_no).ToList();

                    if (query2 != null)
                    {
                        db_ats.ot_request_dates_dtl_tbl.RemoveRange(query2);
                    }
                    message = "success";
                }


                //if (query != null)
                //{
                //    db_ats.ot_request_hdr_tbl.Remove(query);

                //    message = "success";
                //}
                //else
                //{
                //    message = "Already deleted";
                //}


                db_ats.SaveChanges();

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
        //public ActionResult Cancelled(force_leave_plan_hdr_tbl data, force_leave_plan_dtl_tbl data2)
        //{
        //    try
        //    {
        //        var query = db_ats.force_leave_plan_hdr_tbl.Where(a =>
        //           a.application_nbr == data.application_nbr).FirstOrDefault();
        //        query.updated_dttm = data.updated_dttm;
        //        query.updated_by_user = Session["user_id"].ToString();

        //        var query2 = db_ats.force_leave_plan_dtl_tbl.Where(a =>
        //           a.application_nbr == data2.application_nbr &&
        //           a.flp_application_date == data2.flp_application_date).FirstOrDefault();
        //        query2.rcrd_status = data2.rcrd_status;

        //        db_ats.SaveChangesAsync();

        //        return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (DbEntityValidationException e)
        //    {
        //        string message = DbEntityValidationExceptionError(e);

        //        return Json(new { message = message }, JsonRequestBehavior.AllowGet);
        //    }
        //}
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


        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Populate Employment Type
        //*********************************************************************//
        public ActionResult CheckData(string travel_order_nbr, string par_action)
        {
            try
            {
                string message = "";
                var travelorder_hdr_tbl = db_ats.travelorder_hdr_tbl.Where(a => a.travel_order_no == travel_order_nbr).FirstOrDefault();

                if (travelorder_hdr_tbl != null && par_action == "ADD")
                {
                    message = "fail";
                }

                else if (travelorder_hdr_tbl == null && par_action == "EDIT")
                {
                    message = "fail";
                }

                else if (travelorder_hdr_tbl == null && par_action == "DELETE")
                {
                    message = "fail";
                }

                else
                {
                    message = "success";
                }

                return Json(new { message, travelorder_hdr_tbl }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { ex.Message }, JsonRequestBehavior.AllowGet);
            }

        }


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
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);

                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }


        public ActionResult WithdrawSubmission(ot_request_hdr_tbl data)
        {
            try
            {
                var query = db_ats.ot_request_hdr_tbl.Where(a => a.ot_ctrl_no == data.ot_ctrl_no
                                && a.approval_id == data.approval_id
                                ).FirstOrDefault();
                var query2 = db_ats.ot_request_dates_dtl_tbl.Where(a => a.ot_ctrl_no == data.ot_ctrl_no).ToList();
                var query3 = db_ats.ot_request_empl_dtl_tbl.Where(a => a.ot_ctrl_no == data.ot_ctrl_no).ToList();
                var query4 = db_ats.ot_request_purpose_dtl_tbl.Where(a => a.ot_ctrl_no == data.ot_ctrl_no).ToList();

                if (query != null)
                {
                    query.approval_status = data.approval_status;
                    query.details_remarks = data.details_remarks;
                    query.updated_by_user = Session["user_id"].ToString();
                    query.updated_dttm = DateTime.Now;
                    query2.ForEach(a => a.rcrd_status = data.approval_status);
                    query3.ForEach(a => a.rcrd_status = data.approval_status);
                    query4.ForEach(a => a.rcrd_status = data.approval_status);
                    db_dev.sp_update_transaction_in_approvalworkflow_tbl(query.approval_id, Session["user_id"].ToString(), data.approval_status, data.details_remarks);
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