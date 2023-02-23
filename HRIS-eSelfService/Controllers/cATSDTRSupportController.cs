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

namespace HRIS_eAATS.Controllers
{
    public class cATSDTRSupportController : Controller
    {
        // GET: cASTDTRSupport
        // GET: cSSCOCAppl
       
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        HRIS_DTREntities db_dtr = new HRIS_DTREntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        User_Menu um = new User_Menu();
        CommonDB cmn = new CommonDB();
        //*********************************************************************//
        // Created By : JMTJR - Created Date : 03/04/2020
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
        }

        // GET: cSSPHICPayReg
        public ActionResult Index()
        {
            //if (Session["id"] == null || Session["id"].ToString() == "")
            //{
            //    return RedirectToAction("Index", "Login");
            //}
            //else 
            return View();
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
                //GetAllowAccess();

                var p_empl_id = Session["empl_id"].ToString();

                var empl_names = from s in db.vw_personnelnames_tbl
                                 join r in db.personnel_tbl
                                 on s.empl_id equals r.empl_id
                                 join t in db.vw_payrollemployeemaster_hdr_tbl
                                 on s.empl_id equals t.empl_id
                                 where r.emp_status == true
                                 orderby s.last_name

                                 select new
                                 {
                                     s.empl_id,
                                     s.employee_name,
                                     s.last_name,
                                     s.first_name,
                                     s.middle_name,
                                     s.suffix_name,
                                     s.courtisy_title,
                                     s.postfix_name,
                                     s.employee_name_format2,
                                     t.department_code,
                                     t.employment_type,
                                 };
                // var all_appl = db_ats.vw_all_applications.Where(a => a.empl_id == p_empl_id).ToList().OrderBy(a=> a.transaction_code);
                // var trans_lst = db_ats.vw_all_applications.Where(a => a.empl_id == p_empl_id).GroupBy(a=> a.transaction_code).ToList();
                var trans_lst = db_ats.vw_all_applications.Where(a => a.empl_id == p_empl_id).GroupBy(a => a.transaction_code).ToList();

                var data = db_dtr.sp_dtr_from_bio_tbl_list3(p_empl_id, DateTime.Now.Year.ToString(), DateTime.Now.Month.ToString()).ToList();
                message = "success";

                return JSON(new { empl_names, data, message, p_empl_id, trans_lst }, JsonRequestBehavior.AllowGet);
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
        public ActionResult FilterPageGrid(string p_empl_id, string p_year, string p_month)
        {
            var message = "";
            try
            {
                var all_appl = db_ats.vw_all_applications.Where(a => a.empl_id == p_empl_id).ToList().OrderBy(a => a.transaction_code);
                var trans_lst = db_ats.vw_all_applications.Where(a => a.empl_id == p_empl_id).GroupBy(a => a.transaction_code).ToList();
                var data = db_dtr.sp_dtr_from_bio_tbl_list3(p_empl_id, p_year, p_month).ToList();
                message = "success";
                return JSON(new { data, message, all_appl, trans_lst }, JsonRequestBehavior.AllowGet);
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
                var year = data.dtr_date.Year.ToString();
                var month = data.dtr_date.Month.ToString();
                var upd = db_dtr.dtr_from_bio_tbl.Where(a => a.empl_id == data.empl_id && a.dtr_date == data.dtr_date).FirstOrDefault();

                if (upd != null)
                {
                    upd.dtr_date = data.dtr_date;
                    upd.empl_id = data.empl_id;
                    upd.time_in_am = data.time_in_am == null ? "" : data.time_in_am;
                    upd.time_out_am = data.time_out_am == null ? "" : data.time_out_am;
                    upd.time_in_pm = data.time_in_pm == null ? "" : data.time_in_pm;
                    upd.time_out_pm = data.time_out_pm == null ? "" : data.time_out_pm;
                    upd.time_in_ot = data.time_in_ot == null ? "" : data.time_in_ot;
                    upd.time_out_ot = data.time_out_ot == null ? "" : data.time_out_ot;
                    upd.dtr_status = data.dtr_status == null ? "" : data.dtr_status;
                    upd.processed_by_user = Session["user_id"].ToString();
                    upd.processed_dttm = DateTime.Now;
                    db_dtr.SaveChanges();
                }
                else
                {
                    data.dtr_date = data.dtr_date;
                    data.empl_id = data.empl_id;
                    data.time_in_am = data.time_in_am == null ? "" : data.time_in_am;
                    data.time_out_am = data.time_out_am == null ? "" : data.time_out_am;
                    data.time_in_pm = data.time_in_pm == null ? "" : data.time_in_pm;
                    data.time_out_pm = data.time_out_pm == null ? "" : data.time_out_pm;
                    data.time_in_ot = data.time_in_ot == null ? "" : data.time_in_ot;
                    data.time_out_ot = data.time_out_ot == null ? "" : data.time_out_ot;
                    data.dtr_status = data.dtr_status == null ? "" : data.dtr_status; ;
                    data.processed_by_user = Session["user_id"].ToString();
                    data.processed_dttm = DateTime.Now;

                    db_dtr.dtr_from_bio_tbl.Add(data);
                    db_dtr.SaveChanges();
                }
                var data2 = db_dtr.sp_dtr_from_bio_tbl_list3(data.empl_id, year, month).ToList();
                return Json(new { icon = "success", message = "success", data = data2 }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message, icon = "error" }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : JMTJR - Created Date : 03/04/2020
        // Description: Initialize Page
        //*********************************************************************//
        public ActionResult GetBioExtractDetails(string par_empl_id, string par_bio_date)
        {
            var message = "";
            try
            {
                var data = db_dtr.sp_dtr_bio_extract_list(par_empl_id, par_bio_date).ToList();
                message = "success";
                return JSON(new { data, message }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { message = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 06/24/2020
        // Description  : delete from travel type table
        //*********************************************************************//
        public ActionResult sp_generateDTR(string dtr_year, string dtr_month, string empl_id)
        {
            var icn = "";
            var message = "";
            try
            {
                var empl_names = from s in db.vw_personnelnames_tbl
                                 join r in db.personnel_tbl
                                 on s.empl_id equals r.empl_id
                                 join t in db.vw_payrollemployeemaster_hdr_tbl
                                 on s.empl_id equals t.empl_id
                                 where r.emp_status == true
                                 where r.empl_id == empl_id
                                 orderby s.last_name

                                 select new
                                 {
                                     s.empl_id,
                                     s.employee_name,
                                     s.last_name,
                                     s.first_name,
                                     s.middle_name,
                                     s.suffix_name,
                                     s.courtisy_title,
                                     s.postfix_name,
                                     s.employee_name_format2,
                                     t.department_code,
                                     t.employment_type,
                                 };

                var employment_type = empl_names.FirstOrDefault().employment_type;
                var department_code = empl_names.FirstOrDefault().department_code;
                // var user_id            = "";
                // var par_print_generate = "";

                var par_view_type = "0";
                var session_user_id = Session["user_id"].ToString();
                icn = "success";
                db_ats.Database.CommandTimeout = int.MaxValue;

                var checkShiftFlag = db_ats.sp_check_shiftsched(dtr_year, dtr_month, empl_id).ToList();
                var dtr_gen = new object();

                if (checkShiftFlag[0].shift_flag == "1")
                {
                    dtr_gen = db_ats.sp_generate_empl_dtr(dtr_year, dtr_month, empl_id, par_view_type, department_code, employment_type, session_user_id).ToList();
                }
                else if (checkShiftFlag[0].shift_flag == "2")
                {
                    dtr_gen = db_ats.sp_generate_empl_dtr_shift(dtr_year, dtr_month, empl_id, par_view_type, department_code, employment_type, session_user_id).ToList();
                }

                return JSON(new { message, icon = icn, dtr_gen, employment_type, department_code, session_user_id }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                icn = "error";
                message = e.Message.ToString();

                return Json(new { message = message, icon = icn }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By : JMTJR - Created Date : 03/04/2020
        // Description: Initialize Page
        //*********************************************************************//
        public ActionResult GetApplication(string p_empl_id, string p_transaction_code)
        {
            var message = "";
            try
            {
                var all_appl = db_ats.vw_all_applications.Where(a => a.empl_id == p_empl_id && a.transaction_code == p_transaction_code).ToList().OrderBy(a => a.application_date).OrderByDescending(a => a.rcrd_status);
                var all_appl_cnt = db_ats.vw_all_applications.Where(a => a.empl_id == p_empl_id && a.transaction_code == p_transaction_code).ToList().GroupBy(a => a.rcrd_status);
                message = "success";
                return JSON(new { message, all_appl, all_appl_cnt }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { message = e.Message }, JsonRequestBehavior.AllowGet);
            }

        }



        public String DbEntityValidationExceptionError(DbEntityValidationException e)
        {
            string message = "";
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
            return message;
        }


    }
}