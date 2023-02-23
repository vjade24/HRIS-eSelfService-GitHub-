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
    public class cSSCOCApplController : Controller
    {
        // GET: cSSCOCAppl
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        HRIS_DTREntities db_dtr = new HRIS_DTREntities();
        User_Menu um = new User_Menu();
        CommonDB cmn = new CommonDB();
        //*********************************************************************//
        // Created By : JMTJR - Created Date : 03/04/2020
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

        // GET: cSSPHICPayReg
        public ActionResult Index()
        {
            if (Session["id"] == null || Session["id"].ToString() == "")
            {
                return RedirectToAction("Index", "Login");
            }
            else return View();
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
        public ActionResult InitializePage()
        {
            var message = "";
            try
            {
                GetAllowAccess();
                
                var data = db_dtr.dtr_from_bio_tbl.Where(a => a.empl_id == "").ToList();
                var empl_names = db.vw_personnelnames_tbl.ToList().OrderBy(a => a.last_name);
                message = "success";

                return JSON(new { empl_names, data, message }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { message = e.Message }, JsonRequestBehavior.AllowGet);
            }

        }
        //*********************************************************************//
        // Created By : JMTJR - Created Date : 03/04/2020
        // Description: Initialize Page
        //*********************************************************************//
        public ActionResult FilterPageGrid(string p_empl_id,string p_year , string p_month)
        {
            var message = "";
            try
            {
                // var data = db_dtr.dtr_from_bio_tbl.Where(a => a.empl_id == p_empl_id && a.dtr_date.Year == p_year && a.dtr_date.Month == p_month).ToList();
                var data = db_dtr.sp_dtr_from_bio_tbl_list2(p_empl_id, p_year, p_month).ToList();
                message = "success";
                return JSON(new { data ,message}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { message = e.Message }, JsonRequestBehavior.AllowGet);
            }
            
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 02/29/2020
        // Description :Save Edit Data to database
        //*********************************************************************//
        public ActionResult SaveUpdateFromDatabase(dtr_from_bio_tbl data)
        {
            try
            {
                var upd = db_dtr.dtr_from_bio_tbl.Where(a => a.empl_id == data.empl_id && a.dtr_date == data.dtr_date).FirstOrDefault();

                if (upd != null)
                {
                    upd.dtr_date           = data.dtr_date    ;     
                    upd.empl_id            = data.empl_id     ;     
                    upd.time_in_am         = data.time_in_am  ;     
                    upd.time_out_am        = data.time_out_am ;     
                    upd.time_in_pm         = data.time_in_pm  ;     
                    upd.time_out_pm        = data.time_out_pm ;     
                    upd.time_in_ot         = data.time_in_ot  ;     
                    upd.time_out_ot        = data.time_out_ot ;     
                    upd.dtr_status         = data.dtr_status  ;     
                    upd.processed_by_user  = Session["user_id"].ToString();
                    upd.processed_dttm     = DateTime.Now;
                    db_dtr.SaveChanges();
                }
                else
                {
                    data.dtr_date           = data.dtr_date    ;     
                    data.empl_id            = data.empl_id     ;     
                    data.time_in_am         = data.time_in_am  ;     
                    data.time_out_am        = data.time_out_am ;     
                    data.time_in_pm         = data.time_in_pm  ;     
                    data.time_out_pm        = data.time_out_pm ;     
                    data.time_in_ot         = data.time_in_ot  ;     
                    data.time_out_ot        = data.time_out_ot ;     
                    data.dtr_status         = data.dtr_status  ;     
                    data.processed_by_user  = Session["user_id"].ToString();
                    data.processed_dttm     = DateTime.Now;

                    db_dtr.dtr_from_bio_tbl.Add(data);
                    db_dtr.SaveChanges();
                }
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}