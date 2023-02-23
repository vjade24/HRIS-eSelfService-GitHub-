//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for BAC Members Information
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// VINCENT JADE H. ALIVIO   2021-01-20      Code Creation
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
    public class cOnlineTrainingsController : Controller
    {
        // GET: cOnlineTrainings
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        HRIS_KMSEntities db_kms = new HRIS_KMSEntities();
        User_Menu um = new User_Menu();
        CommonDB cmn = new CommonDB();
        //*********************************************************************//
        // Created By : VJA - Created Date :2021-01-20
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
            if (Session["id"] == null || Session["id"].ToString() == "")
            {
                return RedirectToAction("Index", "Login");
            }
            else return View();
        }

        //*********************************************************************//
        // Created By : VJA - Created Date :2021-01-20
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
        // Created By : VJA - Created Date :2021-01-20
        // Description: Initialize Page
        //*********************************************************************//
        public ActionResult InitializePage(string par_include_history, int par_train_year)
        {
            GetAllowAccess();
            var user_id = Session["empl_id"].ToString();
            var data    = db.sp_payroll_bac_info_tbl_list(par_include_history).ToList();
            var deplist = db.sp_departments_tbl_list("N").ToList();
            var data_online_complete  = db_kms.vw_training_empl_tbl_list_completed.Where(a => a.empl_id == user_id && a.train_year == par_train_year  && a.empl_train_status == "C").ToList();
            var data_online_incomplete = db_kms.vw_training_empl_tbl_list_not_started.Where(a => a.empl_id == user_id && a.train_year == par_train_year  && a.empl_train_status == "N").ToList();
            return JSON(new { data, um, deplist, data_online_complete, data_online_incomplete }, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By : VJA - Created Date :2021-01-20
        // Description: Retrieve data in list Grid
        //*********************************************************************//
        public ActionResult RetreiveDataGrid(int par_train_year, int par_show_entries)
        {
            var user_id = Session["empl_id"].ToString();
            var data_online_complete = db_kms.vw_training_empl_tbl_list_completed.Where(a => a.empl_id == user_id && a.train_year == par_train_year && a.empl_train_status == "C").Take(par_show_entries).ToList();
            var data_online_incomplete = db_kms.vw_training_empl_tbl_list_not_started.Where(a => a.empl_id == user_id && a.train_year == par_train_year && a.empl_train_status == "N").Take(par_show_entries).ToList();

            return JSON(new { data_online_complete, data_online_incomplete }, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By : VJA - Created Date :2021-01-20
        // Description: Retrieve data in list Grid
        //*********************************************************************//
        public ActionResult RetrieveEmpl(string par_department_code)
        {
            var message = "";
            var emplist = db.sp_personnelnames_combolist_bac_info(par_department_code).ToList();
            if (emplist.Count > 0)
            {
                message = "success";
            }
            else
            {
                message = "no-data-found";
            }
            return JSON(new { emplist, message }, JsonRequestBehavior.AllowGet);
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 02/25/2020
        // Description : Save From Database
        //*********************************************************************//
        public ActionResult SaveFromDatabase(training_empl_tbl data)
        {
            var message = "";
            var message_oth = "";
            try
            {
                var user_id = Session["empl_id"].ToString();

                data.empl_id            = user_id;
                data.train_dt_completed = DateTime.Now;
                data.train_code         = data.train_code;
                
                message = "success";
                message_oth = cmn.CONST_NEWREC;
                db_kms.training_empl_tbl.Add(data);
                db_kms.SaveChanges();
                return Json(new { message, message_oth, data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                message_oth = e.InnerException.InnerException.Message;
                message = "Data Already Exist !";
                return Json(new { message, message_oth }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 02/25/2020
        // Description :Save Edit Data to database
        //*********************************************************************//
        public ActionResult UpdateFromDatabase(payroll_bac_info_tbl data)
        {
            try
            {
                var message = "";
                var message_oth = "";
                var upd = db.payroll_bac_info_tbl.Where(a => a.empl_id == data.empl_id && a.effective_date == data.effective_date).FirstOrDefault();

                upd.bac_position_descr = data.bac_position_descr;
                upd.bac_position_class = data.bac_position_class;
                upd.bac_allowance_amt = data.bac_allowance_amt;
                upd.rcrd_status = data.rcrd_status;
                message = "success";
                message_oth = cmn.CONST_EDITREC;
                db.SaveChanges();
                return Json(new { message, message_oth }, JsonRequestBehavior.AllowGet);
            }
            catch (DbUpdateException e)
            {
                string message_oth = "Data not Updated!";
                string message = e.InnerException.InnerException.Message;
                return Json(new { message, message_oth }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 02/25/2020
        // Description : Delete From Database
        //*********************************************************************//
        public ActionResult DeleteFromDatabase(string par_empl_id, string par_effective_date)
        {
            var message = "";
            try
            {
                DateTime par_effective_date1 = Convert.ToDateTime(par_effective_date);
                var dt = db.payroll_bac_info_tbl.Where(a => a.empl_id == par_empl_id && a.effective_date == par_effective_date1).FirstOrDefault();
                if (dt == null)
                {
                    message = "error";
                }
                else
                {
                    db.payroll_bac_info_tbl.Remove(dt);
                    db.SaveChanges();
                    message = "success";
                }
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string messageflag = "";
                if (e is System.Data.Entity.Infrastructure.DbUpdateException)
                {
                    message = "Could not delete this record. The item was used as reference by other records.";
                }
                else if (e is DbEntityValidationException)
                {
                    message = e.Message;
                }
                else
                {
                    message = "Data already deleted by other user!";
                    messageflag = "0";
                }

                return Json(new { message = message, messageflag }, JsonRequestBehavior.AllowGet);
            }
        }

        //string filename = "";
        //public FileResult Download(string data)
        //{


        //    filename = GetFilename();
        //    byte[] fileBytes = System.IO.File.ReadAllBytes(Server.MapPath("~/UploadedFile/EXECUTABLE/" + filename));

        //    return File(fileBytes, System.Net.Mime.MediaTypeNames.Application.Octet, filename);
        //}

        //public string GetFilename()
        //{
        //    string[] files = Directory.GetFiles(Server.MapPath("~/UploadedFile/EXECUTABLE"));
        //    var file_split = files[0].Split(new char[] { '\\' });
        //    return file_split[(file_split.Count() - 1)];
        //}

    }
}