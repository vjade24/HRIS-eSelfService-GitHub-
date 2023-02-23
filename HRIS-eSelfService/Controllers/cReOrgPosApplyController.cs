//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Change Re-Org
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// Joseph M. Tombo Jr       02/12/2021      Code Creation
//**********************************************************************************
using HRIS_Common;
using HRIS_eSelfService.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eSelfService.Controllers
{
    // GET: cChangePassword
    public class cReOrgPosApplyController : Controller
    {
        HRIS_STAFFINGEntities db_staffing = new HRIS_STAFFINGEntities();
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        CommonDB Cmn        = new CommonDB();
        // GET: cReOrgPosApply
        public ActionResult Index()
        {
            db.Database.CommandTimeout = int.MaxValue;
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

        public ActionResult InitializeData()
        {
            try
            {
                string empl_id  = "";
                var empl_name   = "";
                string date_x   = DateTime.Now.ToShortDateString();
                string empl_employment_type = Session["employment_type"].ToString();
                if (Session["user_id"] != null)
                {
                    empl_id                     = Session["user_id"].ToString();
                    var empl_id2                = Session["empl_id"].ToString();

                    var emp_photo_byte_arr      = db.personnel_tbl.Where(a => a.empl_id == empl_id2).FirstOrDefault().empl_photo_img;
                    var page_data               = db.sp_reorg_init_page(empl_id2).FirstOrDefault();
                    var budget_year_list        = db.sp_budgetyears_tbl_list().ToList();
                    var fund_charges_list       = db.sp_fundcharges_tbl_list().ToList();
                    var employment_type_list    = db.sp_employmenttypes_tbl_list().ToList();
                    var departments_list        = db.sp_departments_tbl_list("N").ToList();

                    var initPage                = db_staffing.sp_reorg_appl_list(empl_id2).ToList();
                    string imreBase64Data       = "";
                    string imgDataURL           = "";


                    var educational_level = db.personnel_educ_type_tbl.ToList();

                    var personnel_educ_tbl =
                        (from education in db.personnel_educ_tbl
                         join type in db.personnel_educ_type_tbl on education.educ_type equals type.educ_type
                         where education.empl_id == empl_id2
                         select new
                         {
                             education.seq_no
                             ,
                             education.empl_id
                             ,
                             education.educ_type
                             ,
                             type.educ_short_descr
                             ,
                             education.school_name
                             ,
                             education.basic_educ_deg
                             ,
                             education.period_from
                             ,
                             education.period_to
                             ,
                             education.highest_lvl_earned
                             ,
                             education.year_graduated
                             ,
                             education.schlr_acdmic_rcvd

                         }).Where(a => a.empl_id == empl_id2).ToList().OrderBy(a=>a.educ_type);

                    var personnel_csceligibility_tbl    = db.personnel_csceligibilty_tbl.Where(a => a.empl_id == empl_id2).ToList();
                    var personnel_workexprnce_tbl       = db.vw_personnel_workexprnce_tbl.Where(a => a.empl_id == empl_id2).OrderByDescending(a=> a.workexp_fromS ).ToList();
                    var personnel_training              = db.vw_personnel_lnd_tbl.Where(a => a.empl_id == empl_id2).ToList();
                    //***************convert byte array to image***********************************
                    if (emp_photo_byte_arr != null)
                    {
                        imreBase64Data = Convert.ToBase64String(emp_photo_byte_arr);
                        imgDataURL = string.Format("data:image/png;base64,{0}", imreBase64Data);
                    }
                    else
                    {
                        imgDataURL = "../ResourcesImages/upload_profile.png";
                    }
                    return JSON(new { empl_id, empl_name, imgDataURL, page_data, message = "success"
                        , budget_year_list, employment_type_list
                        , departments_list, fund_charges_list
                        , initPage, personnel_csceligibility_tbl
                        , personnel_educ_tbl, personnel_workexprnce_tbl, personnel_training,
                        empl_employment_type
                    }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return JSON(new { empl_id = "", empl_name = "", pass = "", imgDataURL = "", message = "success" }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult InitailizeAdd(string budget_code, string employment_type, string department_code, string fund_code)
        {
            try
            {
                var plantilla_data = db_staffing.sp_plantilla_tbl_list_reorg_appl(budget_code, employment_type, department_code, fund_code).ToList();
                return JSON(new {message = "success", plantilla_data }, JsonRequestBehavior.AllowGet);
                
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult getPlantilla_vacant(string budget_code, string employment_type, string department_code)
        {
            try
            {
                var plantilla_data = db_staffing.sp_plantilla_vacant_reorg(budget_code, employment_type, department_code).ToList();
                return JSON(new { message = "success", plantilla_data }, JsonRequestBehavior.AllowGet);

            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult GetAttachment(string item_no, string budget_code)
        {
            string message = "";
            try
            {
                string empl_id = "";



                if (Session["empl_id"].ToString() != null || Session["empl_id"].ToString() != "")
                {
                    empl_id = Session["empl_id"].ToString();
                }
               

                var personnel_workexprnce_tbl = db.personnel_workexprnce_tbl.Where(a => a.empl_id == empl_id).ToList();
                var personnel_voluntarywork_tbl = db.personnel_voluntarywork_tbl.Where(a => a.empl_id == empl_id).ToList();


                var personnel_learnanddevt_tbl = db.personnel_learnanddevt_tbl.Where(a => a.empl_id == empl_id).ToList();
                message = "success";
                return Json(new { message, empl_id }, JsonRequestBehavior.AllowGet);
            }

            catch (DbEntityValidationException e)
            {
                message = e.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult SaveAppl(reorg_appl_tbl data)
        {
            try
            {
                string empl_id      = data.empl_id;
                string budget_code  = data.budget_code;
                var exist_data      = db_staffing.reorg_appl_tbl.Where(a => a.empl_id == empl_id && a.budget_code == budget_code).FirstOrDefault();
                if (exist_data != null)
                {
                    exist_data.appl_status          = data.appl_status;
                    exist_data.item_no_primary      = data.item_no_primary;
                    exist_data.item_no_secondary    = data.item_no_secondary;
                    exist_data.item_no_tertiary     = data.item_no_tertiary;
                    exist_data.updated_dttm         = DateTime.Now;
                    db_staffing.SaveChangesAsync();
                }
                else
                {
                    data.created_dttm = DateTime.Now;

                    db_staffing.reorg_appl_tbl.Add(data);
                    db_staffing.SaveChangesAsync();
                }
                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);

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
    }
}