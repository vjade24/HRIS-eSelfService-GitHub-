//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Travel Orde
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
    public class cSSTravelOrderApplController : Controller
    {
        HRIS_DEVEntities db_dev = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        HRIS_DEVEntities db_pay = new HRIS_DEVEntities();
        User_Menu um = new User_Menu();
        //*********************************************************************//
        // Created By : JRV - Created Date : 05/09/2020
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
                Data = data,
                ContentType = "application/json",
                ContentEncoding = Encoding.UTF8,
                JsonRequestBehavior = behavior,
                MaxJsonLength = Int32.MaxValue
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
                
                string userid                           = Session["user_id"].ToString();
                string empl_id                          = Session["empl_id"].ToString();
                string empl_name                        = Session["employee_name"].ToString();
                string dept_code                        = Session["department_code"].ToString();
                string log_in_as_AO                     = Session["log_in_as_AO"].ToString();
                var department_list                     = db_dev.vw_departments_tbl_list.Where(a => a.department_code == dept_code).FirstOrDefault();
                var holiDate                            = db_dev.sp_holidays_tbl_list(Int32.Parse(DateTime.Now.Year.ToString())).ToList();
                var sp_dtr_transmittal_addressto_list   = db_ats.sp_dtr_transmittal_addressto_list().ToList();
                int int_month = DateTime.Now.Month;
                string string_month = "";
                if (int_month >= 10)
                {
                    string_month = int_month.ToString();
                }


                else
                {
                    string_month = "0" + int_month.ToString();
                }
               
                var current_date = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");

                var sp_travelorder_hdr_tbl_list          = db_ats.sp_travelorder_hdr_tbl_list(empl_id, "", DateTime.Now.Year.ToString(), string_month).ToList();
                var sp_travelorder_hdr_tbl_calendar_list = db_ats.sp_travelorder_hdr_tbl_calendar_list(empl_id, "", DateTime.Now.Year.ToString(), string_month).ToList();

                var status                      = db_ats.sp_approval_status_list().ToList();
                var travel_type_list            = db_ats.traveltype_tbl.ToList();

                var emergencypurpose = db_ats.travelpurpose_tbl.Where(a => a.with_emergency == true).ToList();

                // var empl_name_list              = db_dev.sp_employee_list_dept_travel(dept_code);
                //var empl_name_list = db_dev.sp_employee_list_dept(empl_id); --REMOVE NO POSITION TITLE
                var empl_name_list = db_ats.sp_employee_list_dept_position(empl_id);
                return JSON(new { message       = "success", empl_name_list, department_list, um, travel_type_list, sp_travelorder_hdr_tbl_list, status, empl_name, empl_id, dept_code, holiDate, sp_travelorder_hdr_tbl_calendar_list, sp_dtr_transmittal_addressto_list, current_date, emergencypurpose }, JsonRequestBehavior.AllowGet);
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
        public ActionResult GetEmployeesDetails(string par_travel_order_no)
        {
            try
            {
                var sp_travelorder_empl_dtl_tbl_list    = db_ats.sp_travelorder_empl_dtl_tbl_list(par_travel_order_no).ToList();
                var sp_travelorder_dates_dtl_tbl_list   = db_ats.sp_travelorder_dates_dtl_tbl_list(par_travel_order_no).ToList();
                return JSON(new { message = "success", sp_travelorder_empl_dtl_tbl_list, sp_travelorder_dates_dtl_tbl_list }, JsonRequestBehavior.AllowGet);
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
                db_ats.Database.CommandTimeout = Int32.MaxValue;
                string empl_id = Session["empl_id"].ToString();

                if (par_empl_id_details == "")
                {
                    par_empl_id_details = empl_id;
                }

                var sp_travelorder_hdr_tbl_calendar_list = db_ats.sp_travelorder_hdr_tbl_calendar_list(par_empl_id_details, par_status, par_year, par_month ).ToList();
                var sp_travelorder_hdr_tbl_list = db_ats.sp_travelorder_hdr_tbl_list(empl_id, par_status, par_year, par_month).ToList();
                return JSON(new { message = "success", sp_travelorder_hdr_tbl_calendar_list, sp_travelorder_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
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

            if (value == "" || value == null)
            {
                data = "";
            }

            else 
            {
                data = value;
            }
            

            return data;
        }

        public ActionResult CheckIfExists(string par_travel_type, string[] par_data_empl, string[] par_data_dates)
        {
            db_ats.Database.CommandTimeout = int.MaxValue;
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

            return JSON(new { message , employees_exists_list }, JsonRequestBehavior.AllowGet);
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
            var GetTravelOrderNumber = db_ats.sp_get_next_travel_order_no().FirstOrDefault();
            string travel_order_number = GetTravelOrderNumber.ToString();




            return travel_order_number;
        }


        //*********************************************************************//
        // Created By   : JORGE RUSTOM VILLANUEVA
        // Created Date : 04/13/2020
        // Description  : Add new record to table with status as New/Submitted
        //*********************************************************************//
        public ActionResult SaveDirectToDatabase(string par_status, travelorder_hdr_tbl par_data_header, List<travelorder_empl_dtl_tbl> par_data_empl, List<travelorder_dates_dtl_tbl> par_data_dates, string par_action, string par_ldnf, string par_emergency, string par_late_justi)
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                string user_id = Session["user_id"].ToString();
                string empl_id = Session["empl_id"].ToString();
                string travel_order_no = "";
                string message = "";
                bool to_empl_with_creator_ao = false;
                travel_order_no = GetTravelOrderNumber();

                var department_code = par_data_header.department_code;
                var requestor_empl_id = par_data_header.travel_requestor_empl_id;

                if (par_action == "ADD")
                {
                    travelorder_hdr_tbl travelorder_hdr_tbl = new travelorder_hdr_tbl();
                    //travel_order_ldnf_tbl travel_order_ldnf_tbl = new travel_order_ldnf_tbl();

                    if (par_status == "N")
                    {

                        travelorder_hdr_tbl.travel_order_no = isCheckString(travel_order_no);
                        travelorder_hdr_tbl.travel_datefiled = isCheckDate(par_data_header.travel_datefiled.ToString());
                        travelorder_hdr_tbl.travel_datefiled_original = DateTime.Now;
                        travelorder_hdr_tbl.travel_form_type = isCheckString(par_data_header.travel_form_type);
                        travelorder_hdr_tbl.travel_place_visit = isCheckString(par_data_header.travel_place_visit);
                        travelorder_hdr_tbl.travel_purpose = isCheckString(par_data_header.travel_purpose);
                        travelorder_hdr_tbl.travel_requestor_empl_id = isCheckString(par_data_header.travel_requestor_empl_id);
                        travelorder_hdr_tbl.travel_type_code = isCheckString(par_data_header.travel_type_code);
                        travelorder_hdr_tbl.travel_details = isCheckString(par_data_header.travel_details);
                        travelorder_hdr_tbl.travel_with_claims = isCheckBool(par_data_header.travel_with_claims.ToString());
                        travelorder_hdr_tbl.approval_status = isCheckString(par_status);
                        travelorder_hdr_tbl.posting_status = isCheckBool(par_data_header.posting_status.ToString());
                        travelorder_hdr_tbl.approval_id = "";
                        travelorder_hdr_tbl.department_code = isCheckString(par_data_header.department_code);
                        travelorder_hdr_tbl.travel_justification = isCheckString(par_data_header.travel_justification);
                        travelorder_hdr_tbl.updated_by_user = "";
                        travelorder_hdr_tbl.updated_dttm = isCheckDate("1900-01-01");
                        travelorder_hdr_tbl.recappr_empl = isCheckString(par_data_header.recappr_empl);
                        travelorder_hdr_tbl.firstappr_empl_id = isCheckString(par_data_header.firstappr_empl_id);
                        travelorder_hdr_tbl.finalappro_empl_id = isCheckString(par_data_header.finalappro_empl_id);
                        travelorder_hdr_tbl.ldnf = isCheckBool(par_ldnf);
                        travelorder_hdr_tbl.to_emergency = isCheckBool(par_emergency);
                        travelorder_hdr_tbl.late_justification = isCheckString(par_late_justi);
                        db_ats.travelorder_hdr_tbl.Add(travelorder_hdr_tbl);


                        if (par_data_empl != null)
                        {
                            //ADD DATA TO EMPLOYEES DETAILS
                            var check_exists_empl = db_ats.travelorder_empl_dtl_tbl.Where(a => a.travel_order_no == travel_order_no).ToList();

                            if (check_exists_empl.Count > 0)
                            {

                                var delete_empl = db_ats.travelorder_empl_dtl_tbl.RemoveRange(db_ats.travelorder_empl_dtl_tbl.Where(a => a.travel_order_no == travel_order_no));
                            }

                            for (var x = 0; x < par_data_empl.Count; x++)
                            {

                                par_data_empl[x].travel_order_no = travel_order_no;
                                db_ats.travelorder_empl_dtl_tbl.Add(par_data_empl[x]);
                            }



                        }

                        if (par_data_dates != null)
                        {
                            var check_exists_date = db_ats.travelorder_dates_dtl_tbl.Where(a => a.travel_order_no == travel_order_no).ToList();

                            if (check_exists_date.Count > 0)
                            {
                                var delete_empl = db_ats.travelorder_dates_dtl_tbl.RemoveRange(db_ats.travelorder_dates_dtl_tbl.Where(a => a.travel_order_no == travel_order_no));
                            }
                            //ADD DATA TO TRAVEL ORDER DATES0
                            for (var x = 0; x < par_data_dates.Count; x++)
                            {
                                par_data_dates[x].travel_order_no = travel_order_no;
                                db_ats.travelorder_dates_dtl_tbl.Add(par_data_dates[x]);
                            }
                        }

                        if (par_data_dates != null)
                        {
                            var check_exists_date = db_ats.travelorder_dates_dtl_tbl.Where(a => a.travel_order_no == travel_order_no).ToList();

                            if (check_exists_date.Count > 0)
                            {
                                var delete_empl = db_ats.travelorder_dates_dtl_tbl.RemoveRange(db_ats.travelorder_dates_dtl_tbl.Where(a => a.travel_order_no == travel_order_no));
                            }
                            //ADD DATA TO TRAVEL ORDER DATES0
                            for (var x = 0; x < par_data_dates.Count; x++)
                            {
                                par_data_dates[x].travel_order_no = travel_order_no;
                                db_ats.travelorder_dates_dtl_tbl.Add(par_data_dates[x]);
                            }
                        }




                    }

                    else if (par_status == "S")
                    {
                        var par_status_descr = "";


                        var trans_ref2 = db_ats.sp_ss_auto_approval(user_id, "003").ToList();
                        var pg_head_empl_id = db_dev.departments_tbl.Where(a => a.department_code == department_code).FirstOrDefault().empl_id;
                        var app_id = db_dev.sp_insert_transaction_to_approvalworkflow_tbl(Session["user_id"].ToString(), Session["empl_id"].ToString(), "003").ToList();

                        par_data_header.approval_id = app_id[0].ToString();

                        var trans_ref = db_dev.transactionsapprover_tbl.Where(a => a.empl_id == par_data_header.travel_requestor_empl_id
                                                        && a.transaction_code == "003"
                                                        && a.workflow_authority == "0"
                                                        && a.with_self_service_approval == true).FirstOrDefault();


                        if (trans_ref != null)
                        {
                            par_status = "R";
                            db_dev.sp_update_transaction_in_approvalworkflow_tbl(par_data_header.approval_id, Session["user_id"].ToString(), par_status, "Reviewed");
                        }

                        if (par_data_empl != null && trans_ref2[0].auto_status == "1")
                        {
                            var empl_creator_ao = 0;
                            for (var x = 0; x < par_data_empl.Count; x++)
                            {
                                if (requestor_empl_id == par_data_empl[x].empl_id && (department_code == "02" || department_code == "26"))
                                {
                                    empl_creator_ao += 1;
                                }
                            }
                            if (empl_creator_ao > 0)
                            {
                                par_status = "R";
                                par_status_descr = "Auto-reviewed";
                                to_empl_with_creator_ao = true;
                            }
                        }



                        if (trans_ref2[0].auto_status != "F"
                            && trans_ref2[0].auto_status != ""
                            && trans_ref == null
                            && isCheckBool(par_emergency) == false)
                        {
                            if (to_empl_with_creator_ao == true)
                            {
                                db_dev.sp_update_transaction_in_approvalworkflow_tbl(par_data_header.approval_id, Session["user_id"].ToString(), par_status, par_status_descr);
                            }
                            else
                            {
                                par_status = trans_ref2[0].auto_status;
                                db_dev.sp_update_transaction_in_approvalworkflow_tbl(par_data_header.approval_id, Session["user_id"].ToString(), par_status, trans_ref2[0].auto_remarks);
                            }
                        }
                        else if (trans_ref2[0].auto_status == "F"
                            && trans_ref2[0].auto_status != ""
                            && trans_ref == null
                            && isCheckBool(par_emergency) == false)
                        {
                            par_status = "1";
                            db_dev.sp_update_transaction_in_approvalworkflow_tbl(par_data_header.approval_id, Session["user_id"].ToString(), par_status, "Level 1 Approved");
                        }

                        else if (trans_ref2[0].auto_status == "1"
                            && trans_ref2[0].auto_status != ""
                            && trans_ref == null
                            && isCheckBool(par_emergency) == true
                            && (isCheckString(par_data_header.department_code) != "21"
                                            && isCheckString(par_data_header.department_code) != "22"
                                            && isCheckString(par_data_header.department_code) != "23"
                                            && isCheckString(par_data_header.department_code) != "24"
                                            && isCheckString(par_data_header.department_code) != "20"
                                            && isCheckString(par_data_header.department_code) != "11"
                                            && isCheckString(par_data_header.department_code) != "12"))
                        {
                            par_status = "F";
                            db_dev.sp_update_transaction_in_approvalworkflow_tbl(par_data_header.approval_id, Session["user_id"].ToString(), par_status, "Final Approved");
                        }

                        else if (trans_ref2[0].auto_status == "1"
                           && trans_ref2[0].auto_status != ""
                           && trans_ref == null
                           && isCheckBool(par_emergency) == true
                           && (isCheckString(par_data_header.department_code) == "21"
                                           || isCheckString(par_data_header.department_code) == "22"
                                           || isCheckString(par_data_header.department_code) == "23"
                                           || isCheckString(par_data_header.department_code) == "24"
                                           || isCheckString(par_data_header.department_code) == "20"
                                           || isCheckString(par_data_header.department_code) == "11"
                                           || isCheckString(par_data_header.department_code) == "12"))
                        {
                            par_status = "1";
                            db_dev.sp_update_transaction_in_approvalworkflow_tbl(par_data_header.approval_id, Session["user_id"].ToString(), par_status, "Level 1 Approved");
                        }

                        travelorder_hdr_tbl.travel_order_no = isCheckString(travel_order_no);


                        travelorder_hdr_tbl.travel_datefiled = isCheckDate(par_data_header.travel_datefiled.ToString());
                        travelorder_hdr_tbl.travel_datefiled_original = DateTime.Now;
                        travelorder_hdr_tbl.travel_form_type = isCheckString(par_data_header.travel_form_type);
                        travelorder_hdr_tbl.travel_place_visit = isCheckString(par_data_header.travel_place_visit);
                        travelorder_hdr_tbl.travel_purpose = isCheckString(par_data_header.travel_purpose);
                        travelorder_hdr_tbl.travel_requestor_empl_id = isCheckString(par_data_header.travel_requestor_empl_id);
                        travelorder_hdr_tbl.travel_type_code = isCheckString(par_data_header.travel_type_code);
                        travelorder_hdr_tbl.travel_details = isCheckString(par_data_header.travel_details);
                        travelorder_hdr_tbl.travel_with_claims = isCheckBool(par_data_header.travel_with_claims.ToString());
                        travelorder_hdr_tbl.travel_justification = isCheckString(par_data_header.travel_justification);
                        travelorder_hdr_tbl.approval_status = isCheckString(par_status);
                        travelorder_hdr_tbl.posting_status = isCheckBool(par_data_header.posting_status.ToString());
                        travelorder_hdr_tbl.approval_id = isCheckString(par_data_header.approval_id);
                        travelorder_hdr_tbl.department_code = isCheckString(par_data_header.department_code);
                        travelorder_hdr_tbl.updated_by_user = "";
                        travelorder_hdr_tbl.updated_dttm = isCheckDate("1900-01-01");
                        travelorder_hdr_tbl.recappr_empl = isCheckString(par_data_header.recappr_empl);
                        travelorder_hdr_tbl.firstappr_empl_id = isCheckString(par_data_header.firstappr_empl_id);
                        travelorder_hdr_tbl.finalappro_empl_id = isCheckString(par_data_header.finalappro_empl_id);
                        travelorder_hdr_tbl.ldnf = isCheckBool(par_ldnf);
                        travelorder_hdr_tbl.to_emergency = isCheckBool(par_emergency);
                        travelorder_hdr_tbl.late_justification = isCheckString(par_late_justi);
                        db_ats.travelorder_hdr_tbl.Add(travelorder_hdr_tbl);


                        //travel_order_ldnf_tbl.travel_order_no = travelorder_hdr_tbl.travel_order_no;
                        //travel_order_ldnf_tbl.ldnf = isCheckBool(par_ldnf);
                        //travel_order_ldnf_tbl.to_emergency = isCheckBool(par_emergency);
                        //db_ats.travel_order_ldnf_tbl.Add(travel_order_ldnf_tbl);
                        //ADD DATA TO EMPLOYEES DETAILS

                        if (par_data_empl != null)
                        {
                            for (var x = 0; x < par_data_empl.Count; x++)
                            {

                                par_data_empl[x].travel_order_no = travel_order_no;
                                par_data_empl[x].rcrd_status = par_status;
                                db_ats.travelorder_empl_dtl_tbl.Add(par_data_empl[x]);
                            }

                        }

                        if (par_data_dates != null)
                        {
                            //ADD DATA TO TRAVEL ORDER DATES
                            for (var x = 0; x < par_data_dates.Count; x++)
                            {
                                par_data_dates[x].travel_order_no = travel_order_no;
                                par_data_dates[x].rcrd_status = par_status;
                                db_ats.travelorder_dates_dtl_tbl.Add(par_data_dates[x]);
                            }
                        }



                    }
                    message = "success";
                }

                if (par_action == "EDIT")
                {

                    var travelorder_hdr_tbl = db_ats.travelorder_hdr_tbl.Where(a => a.travel_order_no == par_data_header.travel_order_no).FirstOrDefault();
                    //var travel_order_ldnf_tbl = db_ats.travel_order_ldnf_tbl.Where(a => a.travel_order_no == par_data_header.travel_order_no).FirstOrDefault();
                    string validate_approval_status = travelorder_hdr_tbl.approval_status;

                    if (validate_approval_status == "N" || validate_approval_status == "C")
                    {
                        if (validate_approval_status == "C")
                        {
                            db_dev.sp_update_transaction_in_approvalworkflow_tbl(travelorder_hdr_tbl.approval_id, Session["user_id"].ToString(), par_status, par_data_header.travel_details);
                        }


                        var delete_dates = db_ats.travelorder_dates_dtl_tbl.RemoveRange(db_ats.travelorder_dates_dtl_tbl.Where(a => a.travel_order_no == par_data_header.travel_order_no));
                        var delete_empl = db_ats.travelorder_empl_dtl_tbl.RemoveRange(db_ats.travelorder_empl_dtl_tbl.Where(a => a.travel_order_no == par_data_header.travel_order_no));

                        travelorder_hdr_tbl.travel_datefiled = isCheckDate(par_data_header.travel_datefiled.ToString());
                        travelorder_hdr_tbl.travel_form_type = isCheckString(par_data_header.travel_form_type);
                        travelorder_hdr_tbl.travel_place_visit = isCheckString(par_data_header.travel_place_visit);
                        travelorder_hdr_tbl.travel_purpose = isCheckString(par_data_header.travel_purpose);
                        travelorder_hdr_tbl.travel_type_code = isCheckString(par_data_header.travel_type_code);
                        travelorder_hdr_tbl.travel_details = isCheckString(par_data_header.travel_details);
                        travelorder_hdr_tbl.travel_with_claims = isCheckBool(par_data_header.travel_with_claims.ToString());
                        travelorder_hdr_tbl.posting_status = isCheckBool(par_data_header.posting_status.ToString());

                        travelorder_hdr_tbl.ldnf = isCheckBool(par_ldnf);
                        travelorder_hdr_tbl.to_emergency = isCheckBool(par_emergency);
                        travelorder_hdr_tbl.late_justification = isCheckString(par_late_justi);
                        //if (travel_order_ldnf_tbl == null)
                        //{

                        //    travel_order_ldnf_tbl travel_order_ldnf_tbl1 = new travel_order_ldnf_tbl();
                        //    travel_order_ldnf_tbl1.travel_order_no = travelorder_hdr_tbl.travel_order_no;
                        //    travel_order_ldnf_tbl1.ldnf = isCheckBool(par_ldnf);
                        //    travel_order_ldnf_tbl.to_emergency = isCheckBool(par_emergency);
                        //    db_ats.travel_order_ldnf_tbl.Add(travel_order_ldnf_tbl1);
                        //}

                        //else
                        //{
                        //    travel_order_ldnf_tbl.ldnf         = isCheckBool(par_ldnf);
                        //    travel_order_ldnf_tbl.to_emergency = isCheckBool(par_emergency);
                        //}


                        travelorder_hdr_tbl.department_code = isCheckString(par_data_header.department_code);
                        travelorder_hdr_tbl.travel_justification = isCheckString(par_data_header.travel_justification);
                        travelorder_hdr_tbl.updated_by_user = Session["user_id"].ToString();
                        travelorder_hdr_tbl.updated_dttm = DateTime.Now;
                        travelorder_hdr_tbl.recappr_empl = isCheckString(par_data_header.recappr_empl);
                        travelorder_hdr_tbl.firstappr_empl_id = isCheckString(par_data_header.firstappr_empl_id);
                        travelorder_hdr_tbl.finalappro_empl_id = isCheckString(par_data_header.finalappro_empl_id);
                        if (par_status == "S")
                        {


                            travelorder_hdr_tbl.approval_status = isCheckString(par_status);
                            var app_id = db_dev.sp_insert_transaction_to_approvalworkflow_tbl(user_id, empl_id, "003").ToList();
                            travelorder_hdr_tbl.approval_id = app_id[0].ToString();
                            validate_approval_status = "S";
                        }

                        var trans_ref = db_dev.transactionsapprover_tbl.Where(a => a.empl_id == par_data_header.travel_requestor_empl_id
                                                        && a.transaction_code == "003"
                                                        && a.workflow_authority == "0"
                                                        && a.with_self_service_approval == true).FirstOrDefault();
                        if (trans_ref != null)
                        {
                            if (par_status == "S")
                            {
                                travelorder_hdr_tbl.approval_status = isCheckString("R");
                                par_status = "R";
                                validate_approval_status = "R";


                                var trans_ref2 = db_ats.sp_ss_auto_approval(user_id, "003").ToList();
                                if (trans_ref2[0].auto_status != "")
                                {
                                    travelorder_hdr_tbl.approval_status = isCheckString(trans_ref2[0].auto_status);
                                    par_status = trans_ref2[0].auto_status;
                                    validate_approval_status = trans_ref2[0].auto_status;
                                }

                                db_dev.sp_update_transaction_in_approvalworkflow_tbl(travelorder_hdr_tbl.approval_id, Session["user_id"].ToString(), par_status, "Reviewed");
                            }
                        }
                        else
                        {
                            var trans_ref2 = db_ats.sp_ss_auto_approval(user_id, "003").ToList();
                            if (trans_ref2[0].auto_status != "")
                            {
                                if (par_status == "S")
                                {

                                    if (trans_ref2[0].auto_status == "1" && isCheckBool(par_emergency) == true
                                        && (isCheckString(par_data_header.department_code) != "21"
                                            || isCheckString(par_data_header.department_code) != "22"
                                            || isCheckString(par_data_header.department_code) != "23"
                                            || isCheckString(par_data_header.department_code) != "24"
                                            || isCheckString(par_data_header.department_code) != "20"
                                            || isCheckString(par_data_header.department_code) != "11"
                                            || isCheckString(par_data_header.department_code) != "12")
                                            )
                                    {
                                        travelorder_hdr_tbl.approval_status = isCheckString("F");
                                        par_status = "F";
                                        validate_approval_status = "F";
                                        db_dev.sp_update_transaction_in_approvalworkflow_tbl(travelorder_hdr_tbl.approval_id, Session["user_id"].ToString(), "F", "Final Approved");
                                    }
                                    else
                                    {
                                        travelorder_hdr_tbl.approval_status = isCheckString(trans_ref2[0].auto_status);
                                        par_status = trans_ref2[0].auto_status;
                                        validate_approval_status = trans_ref2[0].auto_status;
                                        db_dev.sp_update_transaction_in_approvalworkflow_tbl(travelorder_hdr_tbl.approval_id, Session["user_id"].ToString(), par_status, trans_ref2[0].auto_remarks);
                                    }

                                }
                            }
                        }

                        //string user_id = Session["user_id"].ToString();
                        //var trans_ref2 = db_ats.sp_ss_auto_approval(user_id, "003").ToList();
                        //if (trans_ref2[0].auto_status != "")
                        //{
                        //    if (par_status == "S")
                        //    {
                        //        travelorder_hdr_tbl.approval_status = isCheckString(trans_ref2[0].auto_status);
                        //        par_status = trans_ref2[0].auto_status;
                        //        validate_approval_status = trans_ref2[0].auto_status;
                        //        db_dev.sp_update_transaction_in_approvalworkflow_tbl(travelorder_hdr_tbl.approval_id, Session["user_id"].ToString(), par_status, trans_ref2[0].auto_remarks);
                        //    }
                        //}




                        message = "success";

                        //ADD DATA TO EMPLOYEES DETAILS
                        if (par_data_empl != null)
                        {
                            for (var x = 0; x < par_data_empl.Count; x++)
                            {
                                par_data_empl[x].travel_order_no = par_data_header.travel_order_no;
                                par_data_empl[x].rcrd_status = validate_approval_status;
                                db_ats.travelorder_empl_dtl_tbl.Add(par_data_empl[x]);
                            }
                        }

                        if (par_data_dates != null)
                        {
                            //ADD DATA TO TRAVEL ORDER DATES
                            for (var x = 0; x < par_data_dates.Count; x++)
                            {
                                par_data_dates[x].travel_order_no = par_data_header.travel_order_no;
                                par_data_dates[x].rcrd_status = validate_approval_status;
                                db_ats.travelorder_dates_dtl_tbl.Add(par_data_dates[x]);
                            }
                        }


                    }



                    else
                    {
                        message = "fail";
                    }

                }


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
        // Created Date : 03/13/2020
        // Description  : delete from travel order details directly
        //*********************************************************************//
        public ActionResult Delete(travelorder_empl_dtl_tbl par_data_empl,travelorder_dates_dtl_tbl par_data_date,string par_tbl)
        {
            try
            {

                string message = "";
                string validate_status = "";
                if (par_tbl == "travelorder_empl_dtl_tbl")
                {

                    var select_count = db_ats.travelorder_empl_dtl_tbl.Where(a => a.travel_order_no == par_data_empl.travel_order_no);
                    var count = select_count.Count();

                    if (count == 1)
                    {
                        var select_header = db_ats.travelorder_hdr_tbl.Where(a => a.travel_order_no == par_data_empl.travel_order_no).FirstOrDefault();
                        validate_status = select_header.approval_status;
                        //var select_header2 = db_ats.travel_order_ldnf_tbl.Where(a => a.travel_order_no == par_data_empl.travel_order_no).FirstOrDefault();
                   
                        if (select_header != null)
                        {
                            db_ats.travelorder_hdr_tbl.Remove(select_header);
                            //db_ats.travel_order_ldnf_tbl.Remove(select_header2);
                            
                            db_ats.travelorder_empl_dtl_tbl.RemoveRange(db_ats.travelorder_empl_dtl_tbl.Where(a => a.travel_order_no == par_data_empl.travel_order_no));
                            db_ats.travelorder_dates_dtl_tbl.RemoveRange(db_ats.travelorder_dates_dtl_tbl.Where(a => a.travel_order_no == par_data_empl.travel_order_no));
                            db_dev.sp_update_transaction_in_approvalworkflow_tbl(select_header.approval_id, Session["user_id"].ToString(), "L", "cancelled by user");
                            db_ats.SaveChangesAsync();
                        }
                    }

                    else
                    {
                        var select_header = db_ats.travelorder_hdr_tbl.Where(a => a.travel_order_no == par_data_empl.travel_order_no).FirstOrDefault();

                        if (select_header != null)
                        {
                            validate_status = select_header.approval_status;

                            var select = db_ats.travelorder_empl_dtl_tbl.Where(a =>
                            a.travel_order_no == par_data_empl.travel_order_no &&
                            a.empl_id == par_data_empl.empl_id).FirstOrDefault();
                            if (select != null)
                            {

                                if (validate_status == "F")
                                {
                                    select.rcrd_status = "L";
                                }
                                else
                                {
                                    db_ats.travelorder_empl_dtl_tbl.Remove(select);
                                }


                                db_ats.SaveChangesAsync();
                                message = "success";
                            }
                            else
                            {
                                message = "";
                            }

                        }

                        
                    }

                  
                    
                }

                else if (par_tbl == "travelorder_dates_dtl_tbl")
                {
                    

                    var select_count = db_ats.travelorder_dates_dtl_tbl.Where(a => a.travel_order_no == par_data_date.travel_order_no);
                    var count = select_count.Count();
                    

                    if (count == 1)
                    {
                        var select_header   = db_ats.travelorder_hdr_tbl.Where(a => a.travel_order_no == par_data_date.travel_order_no).FirstOrDefault();
                        validate_status     = select_header.approval_status;
                        //var select_header2 = db_ats.travel_order_ldnf_tbl.Where(a => a.travel_order_no == par_data_empl.travel_order_no).FirstOrDefault();
                        if (select_header != null)
                        {
                           
                           db_ats.travelorder_hdr_tbl.Remove(select_header);
                           //db_ats.travel_order_ldnf_tbl.Remove(select_header2);
                           db_ats.travelorder_empl_dtl_tbl.RemoveRange(db_ats.travelorder_empl_dtl_tbl.Where(a => a.travel_order_no == par_data_date.travel_order_no));
                           db_ats.travelorder_dates_dtl_tbl.RemoveRange(db_ats.travelorder_dates_dtl_tbl.Where(a => a.travel_order_no == par_data_date.travel_order_no));
                           db_dev.sp_update_transaction_in_approvalworkflow_tbl(select_header.approval_id, Session["user_id"].ToString(), "L", "cancelled by user");
                           db_ats.SaveChangesAsync();
                          
                           
                        }
                    }

                    else
                    {
                        var select_header = db_ats.travelorder_hdr_tbl.Where(a => a.travel_order_no == par_data_date.travel_order_no).FirstOrDefault();

                        if (select_header != null)
                        {
                            validate_status = select_header.approval_status;

                            var select = db_ats.travelorder_dates_dtl_tbl.Where(a =>
                            a.travel_order_no == par_data_date.travel_order_no &&
                            a.travel_date == par_data_date.travel_date).FirstOrDefault();

                            if (select != null)
                            {
                                if (validate_status == "F")
                                {
                                    select.rcrd_status = "L";
                                }
                                else
                                {
                                    db_ats.travelorder_dates_dtl_tbl.Remove(select);
                                }

                                db_ats.SaveChangesAsync();
                                message = "success";
                            }
                            else
                            {
                                message = "";
                            }
                        }
                        
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
        public ActionResult Undo(travelorder_empl_dtl_tbl par_data_empl, travelorder_dates_dtl_tbl par_data_dates, string par_table)
        {
            try
            {
                string validate_status = "";

                if (par_table == "travelorder_empl_dtl_tbl")
                {
                    if (par_data_empl.travel_order_no != null || par_data_empl.travel_order_no != "")
                    {

                        var select = db_ats.travelorder_empl_dtl_tbl.Where(a =>
                            a.travel_order_no == par_data_empl.travel_order_no &&
                            a.empl_id == par_data_empl.empl_id).FirstOrDefault();

                        if (select != null)
                        {
                            validate_status = select.rcrd_status;

                            if (validate_status == "L")
                            {
                                select.rcrd_status = "F";
                            }
                        }

                        db_ats.SaveChangesAsync();
                    }
                }

                else if (par_table == "travelorder_dates_dtl_tbl")
                {
                    if (par_data_dates.travel_order_no != null || par_data_dates.travel_order_no != "")
                    {
                        var select = db_ats.travelorder_dates_dtl_tbl.Where(a =>
                            a.travel_order_no == par_data_dates.travel_order_no &&
                            a.travel_date == par_data_dates.travel_date).FirstOrDefault();

                        if (select != null)
                        {
                            validate_status = select.rcrd_status;

                            if (validate_status == "L")
                            {
                                select.rcrd_status = "F";
                            }
                        }

                        db_ats.SaveChangesAsync();
                    }
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
        // Created Date : 04/16/2020
        // Description  : delete from approval workflow table
        //*********************************************************************//
        public ActionResult DeleteFromDatabase(travelorder_hdr_tbl par_data, DateTime par_isDeleteCalendarDate, string par_action)
        {
            try
            {
                if (par_action == "C")
                {
                    if (par_isDeleteCalendarDate == isCheckDate("1900-01-01"))
                    {
                        var query = db_ats.travelorder_hdr_tbl.Where(a =>
                           a.travel_order_no == par_data.travel_order_no && (a.approval_status == "N" || a.approval_status == "C")).FirstOrDefault();
                        db_ats.travelorder_hdr_tbl.Remove(query);

                        //var query1 = db_ats.travel_order_ldnf_tbl.Where(a =>
                        //   a.travel_order_no == par_data.travel_order_no).FirstOrDefault();
                        //db_ats.travel_order_ldnf_tbl.Remove(query1);

                        var querydeletedates = db_ats.travelorder_dates_dtl_tbl.Where(a => a.travel_order_no == par_data.travel_order_no).FirstOrDefault();
                        db_ats.travelorder_dates_dtl_tbl.Remove(querydeletedates);
                       
                        var querydeleteempl = db_ats.travelorder_empl_dtl_tbl.Where(a => a.travel_order_no == par_data.travel_order_no).FirstOrDefault();
                        db_ats.travelorder_empl_dtl_tbl.Remove(querydeleteempl);
                        
                    }

                    else
                    {

                        var querydeletedates = db_ats.travelorder_dates_dtl_tbl.Where(a => a.travel_order_no == par_data.travel_order_no && a.travel_date == par_isDeleteCalendarDate).FirstOrDefault();

                        if (querydeletedates != null)
                        {
                            db_ats.travelorder_dates_dtl_tbl.Remove(querydeletedates);
                            db_ats.SaveChanges();
                        }
                        querydeletedates = db_ats.travelorder_dates_dtl_tbl.Where(a => a.travel_order_no == par_data.travel_order_no).FirstOrDefault();

                        if (querydeletedates == null)
                        {
                            var query = db_ats.travelorder_hdr_tbl.Where(a =>
                            a.travel_order_no == par_data.travel_order_no && (a.approval_status == "N" || a.approval_status == "C")).FirstOrDefault();
                            db_ats.travelorder_hdr_tbl.Remove(query);

                            //var query1 = db_ats.travel_order_ldnf_tbl.Where(a =>
                            // a.travel_order_no == par_data.travel_order_no).FirstOrDefault();
                            //db_ats.travel_order_ldnf_tbl.Remove(query1);

                            var querydeleteempl = db_ats.travelorder_empl_dtl_tbl.Where(a => a.travel_order_no == par_data.travel_order_no).FirstOrDefault();
                            db_ats.travelorder_empl_dtl_tbl.Remove(querydeleteempl);

                        }
                    }

                    //var query = db_ats.travelorder_hdr_tbl.Where(a =>
                    //a.travel_order_no == par_data.travel_order_no && (a.approval_status == "N" || a.approval_status == "C")).FirstOrDefault();

                    //db_ats.travelorder_hdr_tbl.Remove(query);

                    //if (query != null)
                    //{


                    //    var querydeleteempl = db_ats.travelorder_empl_dtl_tbl.Where(a => a.travel_order_no == par_data.travel_order_no).FirstOrDefault();

                    //    if (querydeleteempl != null)
                    //    {
                    //        db_ats.travelorder_empl_dtl_tbl.Remove(querydeleteempl);
                    //    }

                    //    //var querydeletedates = db_ats.travelorder_dates_dtl_tbl.Where(a => a.travel_order_no == par_data.travel_order_no).FirstOrDefault();

                    //    //if (querydeletedates != null)
                    //    //{
                    //    //    db_ats.travelorder_dates_dtl_tbl.Remove(querydeletedates);
                    //    //}
                    //}

                    //else
                    //{
                    //    var querydeletedates = db_ats.travelorder_dates_dtl_tbl.Where(a => a.travel_order_no == par_data.travel_order_no && a.travel_date == par_isDeleteCalendarDate).FirstOrDefault();

                    //    if (querydeletedates != null)
                    //    {
                    //        db_ats.travelorder_dates_dtl_tbl.Remove(querydeletedates);
                    //    }
                    //}
                }

                //else if (par_action == "C-ALL")
                //{
                //    var query = db_ats.travelorder_hdr_tbl.Where(a =>
                //               a.travel_order_no == par_data.travel_order_no).FirstOrDefault();
                //    query.approval_status = "L";
                //    query.updated_dttm = DateTime.Now;
                //    query.updated_by_user = Session["user_id"].ToString();

                //    var query2 = db_ats.travelorder_dates_dtl_tbl.Where(a =>
                //       a.travel_order_no == query.travel_order_no).ToList();
                //    query2.ForEach(a => a.rcrd_status = "L");

                //    var query3 = db_ats.travelorder_empl_dtl_tbl.Where(a =>
                //       a.travel_order_no == query.travel_order_no).ToList();
                //    query3.ForEach(a => a.rcrd_status = "L");

                //    db_dev.sp_update_transaction_in_approvalworkflow_tbl(query.approval_id, Session["user_id"].ToString(), "L", "canceled by user");
                   
                //}
                
              
               

                db_ats.SaveChanges();

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
        // Created By   : Jorge Rustom Villanueva 
        // Created Date : 10/05/2020
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

        public ActionResult WithdrawSubmission(travelorder_hdr_tbl data)
        {
            try
            {
                var query = db_ats.travelorder_hdr_tbl.Where(a => a.travel_order_no == data.travel_order_no
                                && a.approval_id == data.approval_id
                                ).FirstOrDefault();
                var query2 = db_ats.travelorder_dates_dtl_tbl.Where(a => a.travel_order_no == data.travel_order_no).ToList();
                var query3 = db_ats.travelorder_empl_dtl_tbl.Where(a => a.travel_order_no == data.travel_order_no).ToList();
                if (query != null)
                {
                    query.approval_status = data.approval_status;
                    query.travel_details = data.travel_details;
                    query.updated_by_user = Session["user_id"].ToString();
                    query.updated_dttm = DateTime.Now;
                    query2.ForEach(a => a.rcrd_status = data.approval_status);
                    query3.ForEach(a => a.rcrd_status = data.approval_status);
                    db_dev.sp_update_transaction_in_approvalworkflow_tbl(query.approval_id, Session["user_id"].ToString(), data.approval_status, data.travel_details);
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