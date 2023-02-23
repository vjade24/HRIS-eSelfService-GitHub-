
//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Personal Data REMITTANCE CERTIFICATION
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JOSEPH M. TOMBO JR.      02/21/2020      Code Creation
//**********************************************************************************
using HRIS_eSelfService.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eSelfService.Controllers
{
    public class rSSRemitCertController : Controller
    {
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();

        // GET: rSSPaySlipPrinting
        public ActionResult Index()
        {
            User_Menu um = new User_Menu();
            if (Session["user_id"] == null || Session["user_id"].ToString().Trim() == "")
            {
                return RedirectToAction("Index", "Login");
            }
            if (um != null || um.ToString() != "")
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

            return View(um);
        }
        public ActionResult UserAccessOnPage(int id)
        {
            Session["user_menu_id"] = id;
            return Json("success", JsonRequestBehavior.AllowGet);
        }

        public ActionResult InitializeData()
        {

            var session_user_id         = Session["user_id"].ToString();
            var session_user_profile    = Session["user_profile"].ToString();
            var session_empl_id         = Session["empl_id"].ToString();
            var session_employee_name   = Session["employee_name"].ToString();
            var session_first_name      = Session["first_name"].ToString();
            var session_last_name       = Session["last_name"].ToString();
            var session_middle_name     = Session["middle_name"].ToString();
            var session_suffix_name     = Session["suffix_name"].ToString();
            var session_photo           = Session["photo"].ToString();
            var session_owner_fullname  = Session["owner_fullname"].ToString();
            var session_budget_code     = Session["budget_code"].ToString();
            var session_department_code = Session["department_code"].ToString();
            var session_employment_type = Session["employment_type"].ToString();
            var remittancetype_list     = db.vw_remittancetype_tbl_list_PAY.ToList();
            var prevVal                 = Session["prev_values_remitCert"] != null ? Session["prev_values_remitCert"].ToString().Split(','):null;
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
                remittancetype_list
                ,
                prevVal
            }, JsonRequestBehavior.AllowGet);

        }
        public ActionResult RetriveData
            ( 
              string par_remittance_code
            , string par_empl_id
            , string par_period_from
            , string par_period_to
            )
        {

            var session_user_id         = Session["user_id"].ToString();
            var session_user_profile    = Session["user_profile"].ToString();
            var session_empl_id         = Session["empl_id"].ToString();
            var session_employee_name   = Session["employee_name"].ToString();
            var session_first_name      = Session["first_name"].ToString();
            var session_last_name       = Session["last_name"].ToString();
            var session_middle_name     = Session["middle_name"].ToString();
            var session_suffix_name     = Session["suffix_name"].ToString();
            var session_photo           = Session["photo"].ToString();
            var session_owner_fullname  = Session["owner_fullname"].ToString();
            var session_budget_code     = Session["budget_code"].ToString();
            var session_department_code = Session["department_code"].ToString();
            var session_employment_type = Session["employment_type"].ToString();
            //var session_employment_type  = "CE" ;

            object sp_report            = new object();
            DateTime dt_p_from = DateTime.Parse(par_period_from);
            DateTime dt_p_to = DateTime.Parse(par_period_to);
           // sp_report                   = db.sp_remittance_cert_rep(par_remittance_code, Session["empl_id"].ToString(), dt_p_from, dt_p_to).ToList();
            
            Session["history_page"] = Request.UrlReferrer.ToString();
            Session["prev_values_remitCert"] =   par_remittance_code 
                                                + "," +par_period_from
                                                + "," + par_period_to;
            return Json(new
            {
                //sp_report
                //,
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
            }, JsonRequestBehavior.AllowGet);

        }
    }
}