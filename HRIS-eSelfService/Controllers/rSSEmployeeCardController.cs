//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Employee's Card
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JORGE RUSTOM VILLANUEVA       12/18/2019      Code Creation
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

    public class rSSEmployeeCardController : Controller
    {
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        User_Menu um = new User_Menu();
        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Get the User Role
        //*********************************************************************//

        public void GetAllowAccess()
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
            um.username = Session["employee_name"].ToString();
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
        // Created By : JRV - Created Date : 09/19/2019
        // Description : User Access On Page 
        //*********************************************************************//

        protected ActionResult JSON(object data, JsonRequestBehavior behavior)
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

        ////*********************************************************************//
        //// Created By : JRV - Created Date : 09/19/2019
        //// Description : Initialized during PageLoad
        ////*********************************************************************//
        public ActionResult InitializeData()
        {

            GetAllowAccess();
            string empl_id = "";
            empl_id = Session["empl_id"].ToString();
            return Json(new { um, empl_id }, JsonRequestBehavior.AllowGet);
        }

        //JORGE
        public ActionResult SetHistoryPage(string par_payroll_year, string par_empl_id, string par_period_from, string par_period_to)
        {
            try
            {
                string defaultdate = "1900-01-01";
                Session["history_page"] = Request.UrlReferrer.ToString();

                if (par_period_from == "" || par_period_to == "")
                {
                    par_period_from = defaultdate;
                    par_period_to   = defaultdate;
                }

                var sp_employeecard_re_ce_rep = db.sp_employeecard_re_ce_rep(par_payroll_year, par_empl_id, Convert.ToDateTime(par_period_from), Convert.ToDateTime(par_period_to)).ToList();
            
                return JSON(new { message = "success", sp_employeecard_re_ce_rep}, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}