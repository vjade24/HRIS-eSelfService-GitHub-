//********************************************
//** Created By     : Joseph M. TOmbo Jr.
//** Created Date   : 06-24-2021
//** Purpose        : Code for DTR For National Offices
//********************************************

using HRIS_eSelfService.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eSelfService.Controllers
{
    public class rSSDTRApprovalNationalController : Controller
    {
        // GET: cDTRNational
        HRIS_DEVEntities db_dev = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        HRIS_DTREntities db_dtr = new HRIS_DTREntities();
        User_Menu um = new User_Menu();
        // GET: rSSDTRApprovalNational
        public ActionResult Index()
        {
            User_Menu um = new User_Menu();
            if (Session["user_id"] == null)
            {
                return RedirectToAction("../");
            }
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
        // Created By   :Joseph M. Tombo Jr
        // Created Date : 03/05/2020
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult InitializeData()
        {
            try
            {
                GetAllowAccess();

                var empl_id                 = Session["empl_id"].ToString();
                var dept_code               = Session["department_code"].ToString();
                var user_id                 = Session["user_id"].ToString();
                var user_employment_type    = Session["employment_type"].ToString();
                string current_month        = DateTime.Now.Month < 10 ? "0" + DateTime.Now.Month.ToString() : DateTime.Now.Month.ToString();
                var empl_name               = db_dev.sp_employee_list_dept(empl_id).ToList();
                var dept_list               = db_dev.vw_departments_tbl_list.ToList();
                var employmenttype_list     = db_dev.vw_employmenttypes_tbl_list.ToList();
                var approval_list = db_ats.sp_dtr_national_manual_approval_list(DateTime.Now.Year.ToString(), current_month, dept_code, user_employment_type, "S").ToList();

                return JSON(new { message = "success", um, empl_name, dept_list, dept_code, user_employment_type, employmenttype_list, approval_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   :Joseph M. Tombo Jr
        // Created Date : 06/24/2021
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult FilterPageGrid(
            string p_dept_code
            , string p_year
            , string p_month
            , string p_show_option
            ,string p_employment_type)
        {
            try
            {
                var filteredGrid    = db_ats.sp_dtr_national_manual_approval_list(p_year, p_month, p_dept_code, p_employment_type, p_show_option).ToList();
                return JSON(new { message = "success", filteredGrid }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   :Joseph M. Tombo Jr
        // Created Date : 06/24/2021
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult DepartmentFilter(string p_dept_code)
        {
            try
            {
                var empl_name = db_dev.sp_employee_list_dept(p_dept_code).ToList();
               
                return JSON(new { message = "success", empl_name }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   :Joseph M. Tombo Jr
        // Created Date : 06/24/2021
        // Description  : Add new record to table with status as New
        //*********************************************************************//
        public ActionResult ApprovedDisapprove(string p_dtr_ctrl_nbr, string p_dtr_type,  string p_action)
        {
            try
            {
                string message = "";
                var header_data = db_ats.dtr_empl_national_hdr_tbl.Where(a => a.dtr_ctrl_nbr == p_dtr_ctrl_nbr).FirstOrDefault();

                if (header_data != null)
                {
                    if (p_dtr_type == "0")
                    {
                        header_data.status_1st = p_action;
                        header_data.status_2nd = p_action;
                        header_data.approved_1st_by = p_action == "F" ? Session["user_id"].ToString():"";
                        header_data.approved_1st_ddtm = DateTime.Now;
                        header_data.approved_2nd_by = p_action == "F" ? Session["user_id"].ToString() : "";
                        header_data.approved_2nd_ddtm = DateTime.Now;
                    }
                    else if (p_dtr_type == "1")
                    {
                        header_data.status_1st = p_action;
                        header_data.approved_1st_by = p_action == "F" ? Session["user_id"].ToString() : "";
                        header_data.approved_1st_ddtm = DateTime.Now;
                       
                    }
                    else if (p_dtr_type == "2")
                    {
                        header_data.status_2nd = p_action;
                        header_data.approved_1st_by = p_action == "F" ? Session["user_id"].ToString() : "";
                        header_data.approved_1st_ddtm = DateTime.Now;
                    }

                    header_data.updated_ddtm = DateTime.Now;
                    header_data.updated_by = Session["user_id"].ToString();
                    message = "success";
                    db_ats.SaveChangesAsync();
                }
                else message = "No Header Found!";

                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult PreviousValuesOnPage_rSSDTROverrides ()
        {
            Session["history_page"] = Request.UrlReferrer.ToString();
            
            return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
        }
    }
}