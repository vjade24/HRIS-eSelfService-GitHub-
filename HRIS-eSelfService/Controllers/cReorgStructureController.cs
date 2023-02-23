//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for PHIC Payroll Registry
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JOSEPH M. TOMBO JR.       03/03/2020      Code Creation
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
using System.IO;
using HRIS_Common;

namespace HRIS_eSelfService.Controllers
{
    public class cReorgStructureController : Controller
    {
        // GET: cPlacementComittee
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        HRIS_STAFFINGEntities db_staff = new HRIS_STAFFINGEntities();
        User_Menu um = new User_Menu();
        CommonDB cmn = new CommonDB();
        //*********************************************************************//
        // Created By : JMTJR - Created Date : 03/04/2020
        // Description: Get the User Role
        //*********************************************************************//

        // GET: cPlacementCommittee
        public ActionResult Index()
        {
            db.Database.CommandTimeout = int.MaxValue;
            if (Session["user_id"] == null || Session["user_id"].ToString().Trim() == "")
            {
                return RedirectToAction("Index", "Login");
            }
            return View(um);
        }

        //*********************************************************************//
        // Created By : JMTJR - Created Date : 03/04/2020
        // Description : DATA CONVERTION FOR JSON
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

        //*********************************************************************//
        // Created By : JMTJR - Created Date : 03/04/2020
        // Description: Initialize Page
        //*********************************************************************//
        public ActionResult InitializeData(string par_budget_code, string par_department_code, string par_employment_type)
        {
            var user_name = Session["first_name"].ToString();
            var message = "";
            var dep_lst = db.departments_tbl.ToList();
            var budget_lst = db.budgetyears_tbl.ToList();
            var empltype_lst = db.employmenttypes_tbl.ToList();

            try
            {

                if (Session["PreviousValuesonPage_cPlacementComittee"].ToString() != "" ||
                Session["PreviousValuesonPage_cPlacementComittee"].ToString() != null)
                {
                    message = "success";
                    string[] session_val = Session["PreviousValuesonPage_cPlacementComittee"].ToString().Split(',');
                    par_budget_code = session_val[0].ToString();
                    par_department_code = session_val[1].ToString();
                    par_employment_type = session_val[2].ToString();
                    var data = db_staff.sp_plantilla22_structure_report(session_val[0].ToString(), session_val[1].ToString(), session_val[2].ToString()).ToList();
                    
                    return JSON(new { data, um, message, dep_lst, budget_lst, empltype_lst, session_val, user_name }, JsonRequestBehavior.AllowGet);
                }
                else
                {

                    message = "success";
                    var session_val = "";
                    var data = db_staff.sp_plantilla22_structure_report(par_budget_code, par_department_code, par_employment_type).ToList();
                    return JSON(new { data, um, message, dep_lst, budget_lst, empltype_lst, session_val, user_name, }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception)
            {
                message = "success";
                var session_val = "";
                var data = db_staff.sp_plantilla22_structure_report(par_budget_code, par_department_code, par_employment_type).ToList();
                return JSON(new { data, um, message, dep_lst, budget_lst, empltype_lst, session_val, user_name }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By : JMTJR - Created Date : 03/04/2020
        // Description: Initialize Page
        //*********************************************************************//
        public ActionResult FilterPageGrid(string par_budget_code, string par_department_code, string par_employment_type)
        {
            try
            {
                var message = "";
                var data            = db_staff.sp_plantilla22_structure_report(par_budget_code, par_department_code, par_employment_type).ToList();
                var data_structure  = db_staff.sp_reorg_structure(par_budget_code, par_department_code).ToList();
                //var data_ocpd       = data.Where(a => a.item_status == "Occupied").ToList();
                //var data_vcnt       = data.Where(a => a.item_status != "Occupied").ToList();

                message = "success";
                return JSON(new { data, um, message, data_structure }, JsonRequestBehavior.AllowGet);

            }
            catch (Exception e)
            {
                return JSON(new { message = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description: Extract Data 
        //*********************************************************************//
        public ActionResult PreviousValuesonPage_cPlacementComittee
            (
            string par_budget_code
            , string par_department_code
            , string par_employment_type
            , string par_item_no
            , string par_position_long_title
            , string par_qs_eduction
            , string par_qs_work_experience
            , string par_qs_training
            , string par_qs_eligibility
            , string par_show_entries
            , string par_page_nbr
            , string par_search

            )
        {
            var PreviousValuesonPage_cPlacementComittee = par_budget_code
                                                  + "," + par_department_code
                                                  + "," + par_employment_type
                                                  + "," + par_item_no
                                                  + "," + par_show_entries
                                                  + "," + par_page_nbr
                                                  + "," + par_search;

            Session["history_page"] = Request.UrlReferrer.ToString();
            Session["PreviousValuesonPage_cPlacementComittee"] = PreviousValuesonPage_cPlacementComittee;
            return Json(PreviousValuesonPage_cPlacementComittee, JsonRequestBehavior.AllowGet);
        }


        //*********************************************************************//
        // Created By  : VJA - Created Date : 02/25/2020
        // Description :Save Edit Data to database
        //*********************************************************************//
        public ActionResult Approve_Cancel(reorg_appl_tbl data)
        {
            try
            {
                var message = "";
                var user_id = Session["user_id"].ToString();
                // var chk    = db_staff.reorg_appl_tbl.Where(a => a.budget_code == data.budget_code && a.empl_id == data.empl_id && a.appl_status == "F" && a.acquired_item != "").FirstOrDefault();
                // var chk1   = db_staff.reorg_appl_tbl.Where(a => a.budget_code == data.budget_code && a.acquired_item == data.acquired_item).FirstOrDefault();
                var upd = db_staff.reorg_appl_tbl.Where(a => a.empl_id == data.empl_id && a.budget_code == data.budget_code).FirstOrDefault();

                // ********************************************
                // This is for Cancel Item for This Applicants 
                // ********************************************
                if (data.appl_status == "C")
                {
                    message = "success";
                    upd.acquired_item = "";
                    upd.appl_status = data.appl_status;
                    upd.updated_dttm = DateTime.Now;
                    db_staff.SaveChanges();

                    // ***************************************************
                    // **** Create and Insert Appointment  ***************
                    // ***************************************************
                    db_staff.sp_autocreate_appointment_regular(data.budget_code, data.acquired_item, data.empl_id, user_id, data.appl_status, "RE");

                }

                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By : JMTJR - Created Date :04/23/2021
        // Description : Get Divisions list when department change
        //*********************************************************************//
        public ActionResult GetJobDescription(string par_item_no, string department_code)
        {
            try
            {
                db_staff.Database.CommandTimeout = int.MaxValue;

                var datalist_jobdescription = db_staff.sp_reorg_jobdescription_dtl_tbl_list(par_item_no, department_code).ToList();

                return JSON(new { datalist_jobdescription, message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { error_message = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}