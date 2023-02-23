using HRIS_eSelfService.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eSelfService.Controllers
{
    public class cSSTimeEntryController : Controller
    {
        HRIS_ATSEntities db = new HRIS_ATSEntities();
        public int hour; 
        public int min ;
        public int sec;
        public string dtNow_str;
        // GET: cSSTimeEntry
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult Initialize()
        {
            var empl_id = Session["empl_id"].ToString();
            var dtNow = DateTime.Now;
            getServerTime();

            var empl_name = Session["employee_name"].ToString();
            try
            {
                var cie = db.sp_checkTimeEntries(empl_id, dtNow).ToList();
                var TE = db.sp_timeentries_tbl_list(empl_id, dtNow).ToList();
                //var personnel = db.vw_personnelnames_tbl_HRIS_ATS;
                //var personnel = db.personnelnames_tbl;
                return JSON(new { empl_name, empl_id, TE, cie, dtNow_str, hour, min, sec, dtNow }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { ex.Message, dtNow }, JsonRequestBehavior.AllowGet);
            }
        }


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
        public ActionResult DTRdetails(string id, string date)
        {

            try
            {


                var dtr_detail = db.sp_employee_dtr_tbl_list(id, date);
                return Json(new { dtr_detail }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(ex.Message, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult getServerTime()
        {
            try
            {
                var dtNow = DateTime.Now;
                 hour = dtNow.Hour;
                 min = dtNow.Minute;
                 sec = dtNow.Second;
                 dtNow_str = dtNow.ToString("yyyy-MM-dd");
            
                return Json(new { dtNow_str, hour, min, sec}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(ex.Message, JsonRequestBehavior.AllowGet);
            }
        }


        public ActionResult AddTimeEntries(int hours, int minutes, int meridiem, string today)
        {
            var empl_id = Session["empl_id"].ToString();
            var dtNow = DateTime.Now;
            var hour = dtNow.Hour;
            var min = dtNow.Minute;
            var sec = dtNow.Second;
            var message = "";

            try
            {

                var cie = db.sp_checkTimeEntries(empl_id, dtNow).FirstOrDefault();
                var dtr_dtl = db.sp_addTimeEntries_list(empl_id, today, hours, minutes, meridiem);

                return Json(new { success_msg = "success", dtr_dtl, cie}, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        public string leadingZero(int value)
        {
            var result = "";

            if (value < 10)
            {
                result = "0" + value;
            }
            else
            {
                result = value.ToString();
            }
            return result;
        }

        public ActionResult AddTimeEntries2(string entryType)
        {
            var empl_id = Session["empl_id"].ToString();
            var dtNow = DateTime.Now;
            var hour = leadingZero(Convert.ToInt32(dtNow.Hour));
            var min = leadingZero(Convert.ToInt32(dtNow.Minute));
            var sec = leadingZero(Convert.ToInt32(dtNow.Second)); ;
            var message = "";
            var timeentry = hour + ":" + min;



            try
            {
                var cie1 = db.sp_checkTimeEntries(empl_id, dtNow).FirstOrDefault();

                if (entryType == "amin")
                {
                    if (cie1.timeEntrytype == 1)
                    {
                        var ti = db.sp_update_timeentries_tbl(empl_id, dtNow, timeentry, "amin");
                    }
                    else
                    {
                        timeentries_tbl ti = new timeentries_tbl();
                        ti.dtr_date = dtNow;
                        ti.empl_id = empl_id;
                        ti.time_in_am = timeentry;
                        ti.time_out_am = "";
                        ti.time_in_pm = "";
                        ti.time_out_pm = "";
                        ti.under_Time = 0;
                        ti.remarks_details = "";
                        ti.time_ot_hrs = "";
                        ti.remarks_details_hris = "";
                        ti.time_ot_hrs_hris = "";
                        ti.time_entry_status = "";
                        ti.time_days_equi = 0.00;
                        ti.time_hours_equi = 0.00;
                        ti.time_ot_payable = 0.00;
                        ti.under_time_hris = 0;
                        db.timeentries_tbl.Add(ti);
                        db.SaveChanges();
                    }


                }
                else if (entryType == "amout")
                {
                    var ti = db.sp_update_timeentries_tbl(empl_id, dtNow, timeentry, "amout");
                }
                else if (entryType == "pmin")
                {
                    var ti = db.sp_update_timeentries_tbl(empl_id, dtNow, timeentry, "pmin");
                }
                else if (entryType == "pmout")
                {
                    var ti = db.sp_update_timeentries_tbl(empl_id, dtNow, timeentry, "pmout");
                }
                var cie = db.sp_checkTimeEntries(empl_id, dtNow).ToList();
                var TE = db.sp_timeentries_tbl_list(empl_id, dtNow).ToList();
                return Json(new { message = "success", TE, cie, dtNow_str, hour, min, sec, dtNow }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);
                return Json(new { message = message, dtNow }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult ForceLogout(string hours, string minutes, string meridiem, string today, string id)
        {

            var message = "";
            try
            {
                var dtr_dtl = db.sp_ForceLogout(id, today, hours, minutes, meridiem);
                return Json(new { success_msg = "success", dtr_dtl }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
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