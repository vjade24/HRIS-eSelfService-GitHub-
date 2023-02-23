//***************************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Addtional PHIC Emloyees
//***************************************************************************************
// REVISION HISTORY
//***************************************************************************************
// AUTHOR                    DATE            PURPOSE
//---------------------------------------------------------------------------------------
// Vincent Jade H. Alivio      2020-08-11      Code Creation for PHIC Additional Share Per Employee
//***************************************************************************************
using HRIS_eSelfService.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eSelfService.Controllers
{
    public class cSSPHICShareAddEmplController : Controller
    {
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        User_Menu um = new User_Menu();
        // GET: cSSPHICShareAddEmpl
        public ActionResult Index()
        {
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
        //*********************************************************************//
        // Created By  : VJA - Created Date : 02/25/2020
        // Description : Initialize Page/Data
        //*********************************************************************//
        public ActionResult InitializeData()
        {
            var message = "";
            try
            {
                var listgrid = db.sp_phic_share_add_empl_tbl_list("","").ToList();
                var grouplist = db.phic_share_groupings_tbl.ToList();
                if (listgrid.Count > 0)
                {
                    message = "success";
                }
                else
                {
                    message = "error";
                }

                return Json(new { listgrid, grouplist }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                message = e.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By  : VJA - Created Date : 02/25/2020
        // Description : Retrieve Employee
        //*********************************************************************//
        public ActionResult RetrieveEmployee(string p_group_code)
        {
            var message = "";
            try
            {
                var emplist = db.sp_phic_share_combo_addempl_list(p_group_code).ToList();
                if (emplist.Count > 0)
                {
                    message = "success";
                }
                else
                {
                    message = "error";
                }

                return Json(new { emplist, message }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                message = e.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By  : VJA - Created Date : 02/25/2020
        // Description : Save From Database
        //*********************************************************************//
        public ActionResult SaveFromDatabase(phic_share_add_empl_tbl data)
        {
            var message = "";
            try
            {
                message = "success";
                data.created_by     = Session["user_id"].ToString();
                data.creted_dttm    = DateTime.Now;
                db.phic_share_add_empl_tbl.Add(data);
                db.SaveChanges();
                return Json(new { message, data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                message = e.InnerException.InnerException.Message;
                message = "Data Already Exist !";
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By  : Joseph - Created Date : 05/27/2021
        // Description : Generate Id for Non-employee
        //*********************************************************************//
        public ActionResult GenerateNonEmployee()
        {
            var message = "";
            try
            {
                message = "success";
                var non_employee_id = db.sp_generate_id_nonemployee().FirstOrDefault();
                return Json(new { message, non_employee_id }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                message = e.InnerException.InnerException.Message;
                message = "Data Already Exist !";
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By  : VJA - Created Date : 02/25/2020
        // Description : Retrieve List Grid
        //*********************************************************************//
        public ActionResult RetieveGrid(string p_group_code,string p_empl_type)
        {
            var message = "";
            try
            {
                var listgrid = db.sp_phic_share_add_empl_tbl_list(p_group_code, p_empl_type).ToList();
                if (listgrid.Count > 0)
                {
                    message = "success";
                }
                else
                {
                    message = "error";
                }

                return Json(new { listgrid, message }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                message = e.Message;
                return Json(new { message = message, prevValues = "" }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 02/25/2020
        // Description : Delete From Database
        //*********************************************************************//
        public ActionResult DeleteFromDatabase(
              string par_empl_id
            , string p_group_code
            )
        {
            var message = "";
            try
            {
                var dt = db.phic_share_add_empl_tbl.Where(a => a.empl_id == par_empl_id && a.group_code == p_group_code).FirstOrDefault();
                if (dt == null)
                {
                    message = "error";
                }
                else
                {
                    db.phic_share_add_empl_tbl.Remove(dt);
                    db.SaveChanges();
                    message = "success";
                }
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {

                foreach (var eve in e.EntityValidationErrors)
                {
                    Console.WriteLine("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
                        eve.Entry.Entity.GetType().Name, eve.Entry.State);
                    foreach (var ve in eve.ValidationErrors)
                    {
                        message = "- Property: \"{0}\", Error: \"{1}\"" + ve.PropertyName + "  :  " + ve.ErrorMessage;
                        Console.WriteLine("- Property: \"{0}\", Error: \"{1}\"",
                        ve.PropertyName, ve.ErrorMessage);
                    }
                }
                return Json(message, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By  : VJA - Created Date : 02/25/2020
        // Description :Save Edit Data to database
        //*********************************************************************//
        public ActionResult UpdateFromDatabase(phic_share_add_empl_tbl data)
        {
            try
            {
                var upd = db.phic_share_add_empl_tbl.Where(a => a.empl_id == data.empl_id && a.group_code == data.group_code).FirstOrDefault();
                upd.group_code           = data.group_code;
                upd.employee_name        = upd.empl_type == "N" ? data.employee_name : upd.employee_name;
                upd.rate_amount          = upd.empl_type == "N" ? data.rate_amount : upd.rate_amount;
                upd.position_long_title  = data.position_long_title;
                upd.rcrd_status          = data.rcrd_status;
                upd.updated_by           = Session["user_id"].ToString();
                upd.updated_dttm         = DateTime.Now;
                db.SaveChanges();
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbUpdateException e)
            {
                string message = e.InnerException.InnerException.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}