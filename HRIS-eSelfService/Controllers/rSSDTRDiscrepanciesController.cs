//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for DTR Printing
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JORGE RUSTOM VILLANUEVA   09/15/2020      Code Creation
//**********************************************************************************


using HRIS_eSelfService.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Text;
using System.Drawing;

namespace HRIS_eSelfService.Controllers
{
    public class rSSDTRDiscrepanciesController : Controller
    {
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();

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

        // GET: rSSDTRPrinting
        public ActionResult Index()
        {
            User_Menu um = new User_Menu();
            if (Session["user_id"] == null || Session["user_id"].ToString().Trim() == "")
            {
                return RedirectToAction("Index", "Login");
            }
            if (um != null || um.ToString() != "")
            {
                um.allow_add = (int)Session["allow_add"];
                um.allow_delete = (int)Session["allow_delete"];
                um.allow_edit = (int)Session["allow_edit"];
                um.allow_edit_history = (int)Session["allow_edit_history"];
                um.allow_print = (int)Session["allow_print"];
                um.allow_view = (int)Session["allow_view"];
                um.url_name = Session["url_name"].ToString();
                um.id = (int)Session["id"];
                um.menu_name = Session["menu_name"].ToString();
                um.page_title = Session["page_title"].ToString();
            }
            return View(um);
        }
        public ActionResult UserAccessOnPage(int id)
        {
            Session["user_menu_id"] = id;
            return Json("success", JsonRequestBehavior.AllowGet);
        }
        public ActionResult InitializeData()
        {
            var session_user_id = Session["user_id"].ToString();
            var session_user_profile = Session["user_profile"].ToString();
            var session_empl_id = Session["empl_id"].ToString();
            var session_employee_name = Session["employee_name"].ToString();
            var session_first_name = Session["first_name"].ToString();
            var session_last_name = Session["last_name"].ToString();
            var session_middle_name = Session["middle_name"].ToString();
            var session_suffix_name = Session["suffix_name"].ToString();
            var session_photo = Session["photo"].ToString();
            var session_owner_fullname = Session["owner_fullname"].ToString();
            var session_budget_code = Session["budget_code"].ToString();
            var session_department_code = Session["department_code"].ToString();
            var session_employment_type = Session["employment_type"].ToString();
            var dept_list = db.vw_departments_tbl_list.ToList();

            string view_type = "0";
            string year_dtr = Convert.ToString(DateTime.Now.Year);
            string month_dtr = DateTime.Now.Month > 9 ? Convert.ToString(DateTime.Now.Month) : "0" + Convert.ToString(DateTime.Now.Month);
            string department_dtr = session_department_code;

            if (Session["view_type_dtr"] != null)
            {
                view_type = Session["view_type_dtr"].ToString();
                year_dtr = Session["year_dtr"].ToString();
                month_dtr = Session["month_dtr"].ToString();
                department_dtr = Session["department_dtr"].ToString();
            }

            string empl_id = Session["empl_id"].ToString();

            var empl_name = db.sp_employee_list_dept(empl_id).ToList();
            var is_dtr_AO = db_ats.sp_employee_list_dtr_AO(session_user_id).ToList()[0];

            return Json(new
            {
                session_user_id
                ,
                session_user_profile
                ,
                session_empl_id
                ,
                session_employee_name
                ,
                session_first_name
                ,
                session_last_name
                ,
                session_middle_name
                ,
                session_suffix_name
                ,
                session_photo
                ,
                session_owner_fullname
                ,
                session_budget_code
                ,
                session_department_code
                ,
                session_employment_type
                ,
                dept_list
                ,
                view_type
                ,
                year_dtr
                ,
                month_dtr
                ,
                department_dtr
                ,
                empl_name
                ,
                is_dtr_AO
            }, JsonRequestBehavior.AllowGet);

        }

        public ActionResult RetriveData
            (string par_year
            , string par_month
            , string par_empl_id
            , string par_view_type
            , string par_department_code
            )
        {
            Session["year_dtr"] = par_year;
            Session["month_dtr"] = par_month;
            Session["view_type_dtr"] = par_view_type;
            Session["department_dtr"] = par_department_code;

            var session_user_id = Session["user_id"].ToString();
            var session_user_profile = Session["user_profile"].ToString();
            var session_empl_id = Session["empl_id"].ToString();
            var session_employee_name = Session["employee_name"].ToString();
            var session_first_name = Session["first_name"].ToString();
            var session_last_name = Session["last_name"].ToString();
            var session_middle_name = Session["middle_name"].ToString();
            var session_suffix_name = Session["suffix_name"].ToString();
            var session_photo = Session["photo"].ToString();
            var session_owner_fullname = Session["owner_fullname"].ToString();
            var session_budget_code = Session["budget_code"].ToString();
            var session_department_code = Session["department_code"].ToString();
            //var session_employment_type = db_ats.sp_get_empl_employment_type(par_empl_id).ToList()[0].employment_type;
            //var session_employment_type = Session["employment_type"].ToString();
            //var session_employment_type  = "CE" ;

            db_ats.Database.CommandTimeout = int.MaxValue;
            int month_int = Convert.ToInt32(par_month);
            int year_int = Convert.ToInt32(par_year);
            object sp_report = new object();
            object sp_generate_empl_dtr = new object();
            


            sp_report = db_ats.sp_dtr_descri_rep(par_year, par_month, par_empl_id, par_view_type, par_department_code, session_user_id).ToList();



            Session["history_page"] = Request.UrlReferrer.ToString();
            return JSON(new
            {
                sp_report
                ,
                session_user_id
                ,
                session_user_profile
                ,
                session_empl_id
                ,
                session_employee_name
                ,
                session_first_name
                ,
                session_last_name
                ,
                session_middle_name
                ,
                session_suffix_name
                ,
                session_photo
                ,
                session_owner_fullname
                ,
                session_budget_code
                ,
                session_department_code
                //,
                //session_employment_type
            }, JsonRequestBehavior.AllowGet);

        }

        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 02/03/2021
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult DepartmentFilter(string p_dept_code)
        {
            try
            {
                string empl_id = Session["empl_id"].ToString();
                var empl_name = db.sp_employee_list_dept(empl_id).ToList();

                return JSON(new { message = "success", empl_name }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 03/02/2020
        // Description  : Edit existing record table
        //*********************************************************************//
        //public ActionResult GenerateDTREmployee(
        //    string par_year
        //    , string par_month
        //    , string par_empl_id
        //    , string par_view_type
        //    , string par_department_code
        //    , string par_employment_type
        //    )
        //{
        //    try
        //    {
        //        var session_user_id = Session["user_id"].ToString();
        //        db_ats.Database.CommandTimeout = int.MaxValue;

        //        var checkShiftFlag = db_ats.sp_check_shiftsched(par_year, par_month, par_empl_id).ToList();
        //        var generate_dtr = new object();

        //        if (checkShiftFlag[0].transmit_flag != "0")
        //        {
        //            if (checkShiftFlag[0].shift_flag == "1")
        //            {
        //                generate_dtr = db_ats.sp_generate_empl_dtr(par_year, par_month, par_empl_id, par_view_type, par_department_code, par_employment_type, session_user_id).ToList();
        //            }
        //            else if (checkShiftFlag[0].shift_flag == "2")
        //            {
        //                generate_dtr = db_ats.sp_generate_empl_dtr_shift(par_year, par_month, par_empl_id, par_view_type, par_department_code, par_employment_type, session_user_id).ToList();
        //            }
        //        }





        //        return JSON(new { message = "success", generate_dtr, checkShiftFlag }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (Exception e)
        //    {
        //        string message = e.Message;
        //        return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
        //    }
        //}



    }
}