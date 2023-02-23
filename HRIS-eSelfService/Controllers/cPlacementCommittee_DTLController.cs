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
    public class cPlacementCommittee_DTLController : Controller
    {
        // GET: cPlacementComittee_DTL
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        HRIS_STAFFINGEntities db_staff = new HRIS_STAFFINGEntities();
        User_Menu um = new User_Menu();
        CommonDB cmn = new CommonDB();
        //*********************************************************************//
        // Created By : JMTJR - Created Date : 03/04/2020
        // Description: Get the User Role
        //*********************************************************************//

        // GET: cPlacementCommittee_DTL
        public ActionResult Index()
        {
            db.Database.CommandTimeout = int.MaxValue;
            var username = Session["user_id"].ToString().Trim();
            var cmt = db.user_cmt_tbl.Where(a => a.user_id == username.Trim()).ToList();

            if (Session["user_id"] == null || Session["user_id"].ToString().Trim() == "" || cmt.Count <= 0)
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
        public ActionResult InitializeData()
        {
            try
            {
                db.Database.CommandTimeout = int.MaxValue;
                db_staff.Database.CommandTimeout = int.MaxValue;

                var user_name = Session["first_name"].ToString();
                var message = "";
                message = "success";

                string[] preval         = Session["PreviousValuesonPage_cPlacementComittee"].ToString().Split(new char[] { ',' });
                var data                = db_staff.sp_placement_pos_tbl_list(preval[0].ToString(), preval[1].ToString(), preval[2].ToString()).Where(a=> a.item_no == preval[3].ToString()).ToList();
                var data_empl           = db_staff.sp_placement_empl_tbl_list(preval[0].ToString(),preval[3].ToString()).ToList();

                var par_empl_id         = data_empl.Count == 0 ? "" : data_empl[0].empl_id.ToString();

                var data_csc            = db.vw_personnel_csceligibilty_tbl.Where(a=> a.empl_id == par_empl_id).ToList().OrderBy(a=> a.seq_no);
                var data_educ           = db.vw_personnel_educ_tbl.Where(a => a.empl_id == par_empl_id).ToList().OrderBy(a => a.seq_no);
                var data_lnd            = db.vw_personnel_lnd_tbl.Where(a => a.empl_id == par_empl_id).ToList().OrderBy(a => a.seq_no);
                var data_workexp        = db.vw_personnel_workexprnce_tbl.Where(a => a.empl_id == par_empl_id).ToList().OrderBy(a => a.seq_no);
                var data_oth            = db.vw_personnel_otherinformation_tbl.Where(a => a.empl_id == par_empl_id).ToList().OrderBy(a => a.seq_no);
                var data_voluntarywork  = db.vw_personnel_voluntarywork_tbl.Where(a => a.empl_id == par_empl_id).ToList().OrderBy(a => a.seq_no);

                var budget_code = preval[0].ToString().Trim();
                var item_no     = preval[3].ToString().Trim();
                var flag_item_occupied = db_staff.reorg_appl_tbl.Where(a => a.budget_code == budget_code && a.acquired_item == item_no).ToList().FirstOrDefault();
                //var flag_item_occupied = db_staff.reorg_appl_tbl.Where(a => a.budget_code == budget_code && (a.acquired_item == item_no || a.acquired_item != "" || a.acquired_item != null)).ToList().FirstOrDefault();

                string imreBase64Data = "";
                string imgDataURL = "";

                if (data_empl.Count != 0)
                {
                    try
                    {
                        if (data_empl.FirstOrDefault().empl_photo_img != null ||
                        data_empl.FirstOrDefault().empl_photo_img.ToString() != "System.Byte[]" ||
                        data_empl.FirstOrDefault().empl_photo_img[0].ToString() != "")
                        {
                            imreBase64Data = Convert.ToBase64String(data_empl.FirstOrDefault().empl_photo_img);
                            imgDataURL = string.Format("data:image/png;base64,{0}", imreBase64Data);

                            if (imreBase64Data.ToString() == "")
                            {
                                imgDataURL = "../ResourcesImages/upload_profile.png";
                            }
                        }
                        else
                        {
                            imgDataURL = "../ResourcesImages/upload_profile.png";
                        }
                    }
                    catch (Exception)
                    {

                        imgDataURL = "../ResourcesImages/upload_profile.png";
                    }
                }

                var dep_lst      = db.departments_tbl.ToList();
                var budget_lst   = db.budgetyears_tbl.ToList();
                var empltype_lst = db.employmenttypes_tbl.ToList();
                

                return JSON(new { data, um , data_empl, message
                    ,data_csc
                    ,data_educ
                    ,data_lnd
                    ,data_workexp
                    ,data_oth
                    ,data_voluntarywork
                    ,imgDataURL
                    ,user_name
                   ,flag_item_occupied
                   ,dep_lst
                   ,budget_lst
                   ,empltype_lst
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { message  = e.ToString()}, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By : JMTJR - Created Date : 03/04/2020
        // Description: Initialize Page
        //*********************************************************************//
        public ActionResult Retrieve_QS(string par_empl_id)
        {
            try
            {
                var message = "";
                message = "success";

                var data_csc            = db.vw_personnel_csceligibilty_tbl.Where(a=> a.empl_id == par_empl_id).ToList().OrderBy(a=> a.seq_no);
                var data_educ           = db.vw_personnel_educ_tbl.Where(a => a.empl_id == par_empl_id).ToList().OrderBy(a => a.seq_no);
                var data_lnd            = db.vw_personnel_lnd_tbl.Where(a => a.empl_id == par_empl_id).ToList().OrderBy(a => a.seq_no);
                var data_workexp        = db.vw_personnel_workexprnce_tbl.Where(a => a.empl_id == par_empl_id).ToList().OrderBy(a => a.seq_no);
                var data_oth            = db.vw_personnel_otherinformation_tbl.Where(a => a.empl_id == par_empl_id).ToList().OrderBy(a => a.seq_no);
                var data_voluntarywork  = db.vw_personnel_voluntarywork_tbl.Where(a => a.empl_id == par_empl_id).ToList().OrderBy(a => a.seq_no);
                var data_empl           = db.personnel_tbl.Where(a=> a.empl_id == par_empl_id).ToList();

                string[] preval         = Session["PreviousValuesonPage_cPlacementComittee"].ToString().Split(new char[] { ',' });
                var budget_code         = preval[0].ToString().Trim();
                var item_no             = preval[3].ToString().Trim();
                var flag_item_occupied  = db_staff.reorg_appl_tbl.Where(a => a.budget_code == budget_code && a.acquired_item == item_no).ToList().FirstOrDefault();
                //var flag_item_occupied = db_staff.reorg_appl_tbl.Where(a => a.budget_code == budget_code && (a.acquired_item == item_no || a.acquired_item != "" || a.acquired_item != null)).ToList().FirstOrDefault();

                string imreBase64Data = "";
                string imgDataURL = "";

                try
                {
                    if (data_empl.FirstOrDefault().empl_photo_img != null ||
                    data_empl.FirstOrDefault().empl_photo_img.ToString() != "System.Byte[]" ||
                    data_empl.FirstOrDefault().empl_photo_img[0].ToString() != "")
                    {
                        imreBase64Data = Convert.ToBase64String(data_empl.FirstOrDefault().empl_photo_img);
                        imgDataURL = string.Format("data:image/png;base64,{0}", imreBase64Data);

                        if (imreBase64Data.ToString() == "")
                        {
                            imgDataURL = "../ResourcesImages/upload_profile.png";
                        }
                    }
                    else
                    {
                        imgDataURL = "../ResourcesImages/upload_profile.png";
                    }
                }
                catch (Exception)
                {

                    imgDataURL = "../ResourcesImages/upload_profile.png";
                }

                return JSON(new { data_csc, data_educ, data_lnd, data_workexp, data_oth, data_voluntarywork, imgDataURL,message, flag_item_occupied }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { message = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By  : VJA - Created Date : 02/25/2020
        // Description :Save Edit Data to database
        //*********************************************************************//
        public ActionResult Approve_Cancel(reorg_appl_tbl data,reorg_appl_not_qua_tbl data_notquali)
        {
            try
            {
                var message = "";
                var message_1 = "";
                var user_id = Session["user_id"].ToString();
                var chk    = db_staff.reorg_appl_tbl.Where(a => a.budget_code == data.budget_code && a.empl_id == data.empl_id && a.appl_status == "F" && a.acquired_item != "").FirstOrDefault();
                var chk1   = db_staff.reorg_appl_tbl.Where(a => a.budget_code == data.budget_code && a.acquired_item == data.acquired_item).FirstOrDefault();
                var upd    = db_staff.reorg_appl_tbl.Where(a => a.empl_id == data.empl_id && a.budget_code == data.budget_code).FirstOrDefault();
                
                // ********************************************
                // This is for Approve Item for This Applicants 
                // ********************************************
                if (data.appl_status == "F")
                {
                    // This checking is for Applicant who already approved
                    if (chk != null)
                    {
                        message     = "This applicant is already approved by other Position/Item!";
                        message_1   = "This applicant is already approved by other Position/Item!";
                    }
                    // This checking is for Position or Item is already occupied
                    else if (chk1 != null)
                    {
                        // string[] preval = Session["PreviousValuesonPage_cPlacementComittee"].ToString().Split(new char[] { ',' });
                        // var info_2      = db_staff.sp_placement_pos_tbl_list(preval[0].ToString(), preval[1].ToString(), preval[2].ToString()).Where(a => a.item_no == preval[3].ToString()).Where(a=> a.item_no ==  data.acquired_item).FirstOrDefault();
                        // message         = "This Position/Item is already occupied by other Applicants!";
                        // message_1       = "Occupied by: " + info_2.item_occupied_by + "\n" + "Position Title: " + info_2.position_long_title;

                        message     = "This Position/Item is already occupied by other Applicants!";
                        message_1   = "This Position/Item is already occupied by other Applicants!";
                    }
                    else
                    {
                        message = "success";
                        upd.acquired_item   = data.acquired_item;
                        upd.appl_status     = data.appl_status;
                        upd.updated_dttm    = DateTime.Now;
                        db_staff.SaveChanges();

                        // ***************************************************
                        // **** Create and Insert Appointment  ***************
                        // ***************************************************
                        db_staff.sp_autocreate_appointment_regular(data.budget_code, data.acquired_item, data.empl_id, user_id, data.appl_status, "RE");

                    }
                }
                // ********************************************
                // This is for Cancel Item for This Applicants 
                // ********************************************
                else if (data.appl_status == "C")
                {
                    message = "success";
                    upd.acquired_item   = "";
                    upd.appl_status     = data.appl_status;
                    upd.updated_dttm    = DateTime.Now;
                    db_staff.SaveChanges();

                    // ***************************************************
                    // **** Create and Insert Appointment  ***************
                    // ***************************************************
                    db_staff.sp_autocreate_appointment_regular(data.budget_code, data.acquired_item, data.empl_id, user_id, data.appl_status, "RE");

                }
                // ********************************************
                // This is for Not Qualified Applicants 
                // ********************************************
                else if (data.appl_status == "NQ")
                {
                    var username = Session["user_id"].ToString().Trim();
                    message = "success";
                    data_notquali.created_dttm      = DateTime.Now;
                    data_notquali.created_by_user   = username;
                    db_staff.reorg_appl_not_qua_tbl.Add(data_notquali);
                    db_staff.SaveChanges();
                }

                return Json(new { message, message_1 }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By  : VJA - Created Date : 02/25/2020
        // Description :Save Edit Data to database
        //*********************************************************************//
        public ActionResult RetrievePositions(string par_budget_code, string par_department_code, string par_employment_type)
        {
            try
            {
                var data = db_staff.sp_placement_pos_tbl_list(par_budget_code.ToString(), par_department_code.ToString(), par_employment_type.ToString()).ToList();
                return Json(new { data, message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { message = e.Message.ToString() }, JsonRequestBehavior.AllowGet);
            }
            
        }
    }
}