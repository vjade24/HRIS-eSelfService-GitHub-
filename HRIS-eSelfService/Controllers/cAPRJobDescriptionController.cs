/*
 ******************************************************************
 ******************************************************************
 * Purpose      : Back-end code for Employee Job Description for eSelfService
 * Created By   : Joseph M. Tombo Jr.
 * Created Date : 05/18/2021
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
    public class cAPRJobDescriptionController : Controller
    {
        HRIS_DEVEntities db_dev = new HRIS_DEVEntities();
        HRIS_HRDEntities db_hrd = new HRIS_HRDEntities();
        User_Menu um            = new User_Menu();
       // GET: cSSJobDescription
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
                //Session["empl_id"] = "9595";
            }
            return View(um);
        }

        //*********************************************************************//
        // Created By   : JMTJR - Created Date :02/01/2021
        // Description  : User Access On Page 
        //*********************************************************************//
        public ActionResult UserAccessOnPage(int id)
        {
            Session["user_menu_id"] = id;
            return Json("success", JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By   : JMTJR - Created Date :02/01/2021
        // Description  : Initialized during PageLoad
        //*********************************************************************//
        public ActionResult InitializeData(string par_budget_code)
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
                //Session["empl_id"] = "9595";
            }
            if (Session["PreviousValuesonPage_cSSJobDesHDR"] == null)
            {
                
                db_dev.Database.CommandTimeout = int.MaxValue;
                string  empl_id                 = Session["user_id"].ToString().Replace("U", "");
                var     employment_type_list    = db_dev.vw_employmenttypes_tbl_list.ToList();
                var department_tbl_list         = db_hrd.sp_department_trans_list("109", empl_id).ToList();
                string  log_in_as_AO            = Session["log_in_as_AO"].ToString();
                var userlogin_masterinfo        = db_hrd.sp_get_employeemaster_information_hrd(empl_id).FirstOrDefault();
                string dep_code                 = userlogin_masterinfo.department_code;
                string div_code                 = userlogin_masterinfo.division_code;
                string sec_code                 = userlogin_masterinfo.section_code; 
                string emp_type                 = userlogin_masterinfo.employment_type;
                var employee_list               = db_hrd.sp_employee_jobfun_approval_list(emp_type, dep_code, div_code, sec_code, Session["user_id"].ToString(),"N").ToList();
                var budget_year                 = db_dev.sp_plantillapayroll_tbl_list2().ToList();
                return JSON(new { um, employment_type_list, department_tbl_list, prevValues = "" , log_in_as_AO , userlogin_masterinfo, employee_list, budget_year }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                string[] prevValues = Session["PreviousValuesonPage_cSSJobDesHDR"].ToString().Split(new char[] { ',' });
                Session["PreviousValuesonPage_cSSJobDesHDR"] = null;
                db_dev.Database.CommandTimeout  = int.MaxValue;
                string empl_id                  = Session["user_id"].ToString().Replace("U", "");
                var employment_type_list        = db_dev.vw_employmenttypes_tbl_list.ToList();
                var department_tbl_list         = db_hrd.sp_department_trans_list("109", empl_id).ToList();

                string log_in_as_AO             = Session["log_in_as_AO"].ToString();
                var userlogin_masterinfo        = db_hrd.sp_get_employeemaster_information_hrd(empl_id).FirstOrDefault();

                string dep_code                 = userlogin_masterinfo.department_code;
                string div_code                 = userlogin_masterinfo.division_code;
                string sec_code                 = userlogin_masterinfo.section_code; 
                string emp_type                 = userlogin_masterinfo.employment_type; 

                var employee_list               = db_hrd.sp_employee_jobfun_approval_list(emp_type, dep_code, div_code, sec_code, Session["user_id"].ToString(),"").ToList();
                var budget_year                 = db_dev.sp_plantillapayroll_tbl_list2().ToList();

                return JSON(new { um, employment_type_list, department_tbl_list, prevValues, log_in_as_AO, userlogin_masterinfo, employee_list, budget_year }, JsonRequestBehavior.AllowGet);
            }
           
        }

        //*********************************************************************//
        // Created By   : JMTJR - Created Date :04/23/2021
        // Description  : Get Divisions list when department change
        //*********************************************************************//
        public ActionResult GetLisgrid_data(string par_empl_ctrl_nbr,string par_employment_type)
        {
            try
            {
                db_dev.Database.CommandTimeout      = int.MaxValue;
                db_hrd.Database.CommandTimeout      = Int32.MaxValue;
                var datalistgrid                    = db_hrd.sp_employee_jobfunddescr_dtl_tbl_list(par_empl_ctrl_nbr, par_employment_type,"").ToList();
                return JSON(new { datalistgrid }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { error_message = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }


         //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr. 
        // Created Date : 03/02/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult ReviewApprovedAction(empl_jobfunddescr_hdr_tbl data, string remarks)
        {
            try
            {
                var application_nbr = data.empl_ctrl_nbr;
                var approval_id     = data.approval_id;
                string status_comment = string.Empty;
                string save_remarks = "";
                if (data.approval_status.ToString().Trim() == "R" &&
                  remarks.Trim() == "")
                {
                    save_remarks = "Reviewed";
                }
                else if (data.approval_status.ToString().Trim() == "F" &&
                    remarks.Trim() == "")
                {
                    save_remarks = "Final Approved";
                }
                else if (data.approval_status.ToString().Trim() == "C" &&
                    remarks.Trim() == "")
                {
                    save_remarks = "Cancel Pending";
                }
                else if (data.approval_status.ToString().Trim() == "D" &&
                     remarks.Trim() == "")
                {
                    save_remarks = "Disapproved";
                }
                else if (data.approval_status.ToString().Trim() != "" &&
                    remarks.Trim() == "")
                {
                    save_remarks = "Level "+ data.approval_status+" Approved";
                }

                var query = db_hrd.empl_jobfunddescr_hdr_tbl.Where(a => a.empl_ctrl_nbr == application_nbr
                                && a.approval_id == approval_id
                                ).FirstOrDefault();

                query.approval_status   = data.approval_status.ToString().Trim();
                query.updated_by        = Session["user_id"].ToString();
                query.updated_dttm      = DateTime.Now;

                db_dev.sp_update_transaction_in_approvalworkflow_tbl(query.approval_id, Session["user_id"].ToString(), data.approval_status, save_remarks);
                db_hrd.SaveChangesAsync();
                return JSON(new { message = "success", save_remarks }, JsonRequestBehavior.AllowGet);
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
        public ActionResult SaveToDatabase(empl_jobfunddescr_dtl_tbl data) //ADD TO COMMON
        {
            try
            {
                db_hrd.Database.CommandTimeout = Int32.MaxValue;
                string par_empl_ctrl_nbr    = data.empl_ctrl_nbr;
                string par_fjd_code         = data.fjd_code;
                string message              = "";
                var sp_add_result           = db_hrd.sp_add_to_common(par_fjd_code, par_empl_ctrl_nbr).ToList();
                if (sp_add_result.Count > 0 )
                {
                    message = sp_add_result[0].ToString();
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
        // Created By   : JMTJR - Created Date :04/23/2021
        // Description  : Get Divisions list when department change
        //*********************************************************************//
        public ActionResult GetEmployees_list(string par_department_code, string par_division_code, string par_section_code, string par_employment_type, string par_approve_only)
        {
            try
            {
                db_dev.Database.CommandTimeout = int.MaxValue;
                db_hrd.Database.CommandTimeout = Int32.MaxValue;

                var employee_list = db_hrd.sp_employee_jobfun_approval_list(par_employment_type, par_department_code, par_division_code, par_section_code, Session["user_id"].ToString(), par_approve_only).ToList();
                return JSON(new { employee_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { error_message = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        //*********************************************************************//
        // Created By   : JMTJR - Created Date :04/23/2021
        // Description  : Get Divisions list when department change
        //*********************************************************************//
        public ActionResult GetDivisions_list(string par_department_code)
        {
            try
            {
                db_dev.Database.CommandTimeout = int.MaxValue;
                db_hrd.Database.CommandTimeout = Int32.MaxValue;

                var divisions_list = db_dev.sp_divisions_tbl_list2(par_department_code).ToList();
                return JSON(new { divisions_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { error_message = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : JMTJR - Created Date :04/23/2021
        // Description  : Get Divisions list when department change
        //*********************************************************************//
        public ActionResult GetSection_list(string par_department_code,string par_division_code)
        {
            try
            {
                db_dev.Database.CommandTimeout = int.MaxValue;
                db_hrd.Database.CommandTimeout = Int32.MaxValue;

                var sections_list = db_dev.sp_sections_tbl_list2(par_department_code, par_division_code).ToList();
                return JSON(new { sections_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { error_message = e.Message }, JsonRequestBehavior.AllowGet);
            }
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