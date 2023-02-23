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
    public class cATSDTRApprDetailsController : Controller
    {
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        HRIS_DTREntities db_dtr = new HRIS_DTREntities();
        User_Menu um = new User_Menu();
        // GET: cSSTimeSchedule
        public ActionResult Index()
        {
            if (um != null || um.ToString() != "")
            {
                GetAllowAccess();
            }

            return View(um);
        }
        private User_Menu GetAllowAccess()

        {
            um.allow_add = 1;
            um.allow_delete = 1;
            um.allow_edit = 1;
            um.allow_edit_history = 1;
            um.allow_print = 1;
            um.allow_view = 1;
            um.url_name = Session["url_name"].ToString();
            um.id = (int)Session["id"];
            um.menu_name = Session["menu_name"].ToString();
            um.page_title = Session["page_title"].ToString();
            um.user_id = Session["user_id"].ToString();

            return um;

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
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 02/13/2020
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult initializeData()
        {
            try
            {
                string message = "";
                string prev_date_month = "";
                string prev_date_year = "";
                string view_type = "";
                string approval_status = "";
                string transmittal_nbr = "";
                db_ats.Database.CommandTimeout = int.MaxValue;
                var empl_id = Session["empl_id"].ToString();
                GetAllowAccess();
                string[] PreviousValuesonPage_cATSDTRAppr;

                if (Session["PreviousValuesonPage_cATSDTRAppr"] == null || Session["PreviousValuesonPage_cATSDTRAppr"].ToString() == "")
                {
                    message = "fail";
                }

                else {
                    message = "success";
                    PreviousValuesonPage_cATSDTRAppr = Session["PreviousValuesonPage_cATSDTRAppr"].ToString().Split(new char[] { ',' });
                    prev_date_month = PreviousValuesonPage_cATSDTRAppr[1];
                    prev_date_year = PreviousValuesonPage_cATSDTRAppr[2];
                    view_type = PreviousValuesonPage_cATSDTRAppr[3];
                    approval_status = PreviousValuesonPage_cATSDTRAppr[4];
                    transmittal_nbr = PreviousValuesonPage_cATSDTRAppr[0];
                }

                string year = DateTime.Now.Year.ToString();

                string dept_code = Session["department_code"].ToString();
                string month = DateTime.Now.Month >= 10 ? DateTime.Now.Month.ToString() : "0" + DateTime.Now.Month.ToString();

                var sp_dtr_transmittal_dtl_tbl_list = db_ats.sp_dtr_transmittal_dtl_tbl_list(dept_code,"","","", transmittal_nbr).ToList();
                //var employee_list = db_ats.sp_employee_list_dept_dtr_appr(empl_id).ToList();
                //var sp_dtr_transmittal_addressto_list = db_ats.sp_dtr_transmittal_addressto_list().ToList();
                //var sp_dtr_transmittal_requestedfrom_list = db_ats.sp_dtr_transmittal_requestedfrom_list(dept_code, "", "", "");
                return JSON(new { message, um, sp_dtr_transmittal_dtl_tbl_list, prev_date_month, prev_date_year, view_type, approval_status, transmittal_nbr, dept_code}, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Jorge Rustom Villanueva
        // Created Date : 02/13/2020
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult GetTransNbr()
        {
            try
            {
                var sp_get_next_transmittal_no = db_ats.sp_get_next_transmittal_no().FirstOrDefault();
                var empl_id = Session["empl_id"].ToString();

                return JSON(new { message = "success", sp_get_next_transmittal_no }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        private string GetTransNbrSave()
        {
            var sp_get_next_transmittal_no = db_ats.sp_get_next_transmittal_no().FirstOrDefault();
            string next_transmittal_no = sp_get_next_transmittal_no.ToString();
            return next_transmittal_no;
        }

        //*********************************************************************//
        // Created By   : Jorge Rustom Villanueva
        // Created Date : 02/13/2020
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult SaveDetails(string par_action,string par_empl_id)
        {
            try
            {
                string[] PreviousValuesonPage_cATSDTRAppr = Session["PreviousValuesonPage_cATSDTRAppr"].ToString().Split(new char[] { ',' });

                string prev_date_month = "";
                string prev_date_year = "";
                string view_type = "";
                string approval_status = "";
                string transmittal_nbr = "";
                string user_id = Session["user_id"].ToString();


                prev_date_month = PreviousValuesonPage_cATSDTRAppr[1];
                prev_date_year  = PreviousValuesonPage_cATSDTRAppr[2];
                view_type       = PreviousValuesonPage_cATSDTRAppr[3];
                approval_status = PreviousValuesonPage_cATSDTRAppr[4];
                transmittal_nbr = PreviousValuesonPage_cATSDTRAppr[0];

                string message = "";
                //LAST
                var as_alerts = db_ats.sp_transmittal_check(par_empl_id, prev_date_year, prev_date_month, view_type).FirstOrDefault();

                if (as_alerts != null)
                {
                    message = "fail";
                }

                else
                {
                    if (par_action == "Y")
                    { //INSERT
                        dtr_transmittal_dtl_tbl dtr_transmittal_dtl_tbl = new dtr_transmittal_dtl_tbl();
                        dtr_transmittal_dtl_tbl.transmittal_nbr = transmittal_nbr;
                        dtr_transmittal_dtl_tbl.approval_status = approval_status;
                        dtr_transmittal_dtl_tbl.empl_id = par_empl_id;

                        if (approval_status == "A")
                        {
                            if (view_type == "0")
                            {
                                dtr_transmittal_dtl_tbl.frst_qcna_posted_ddtm = DateTime.Now;
                                dtr_transmittal_dtl_tbl.frst_qcna_posted_by = user_id;
                                dtr_transmittal_dtl_tbl.sec_qcna_posted_ddtm = DateTime.Now;
                                dtr_transmittal_dtl_tbl.sec_qcna_posted_by = user_id;
                            }

                            else if (view_type == "1")
                            {
                                dtr_transmittal_dtl_tbl.frst_qcna_posted_ddtm = DateTime.Now;
                                dtr_transmittal_dtl_tbl.frst_qcna_posted_by = user_id;
                                dtr_transmittal_dtl_tbl.sec_qcna_posted_ddtm = Convert.ToDateTime("1900-01-01");
                                dtr_transmittal_dtl_tbl.sec_qcna_posted_by = "";
                            }

                            else if (view_type == "2")
                            {
                                dtr_transmittal_dtl_tbl.frst_qcna_posted_ddtm = Convert.ToDateTime("1900-01-01");
                                dtr_transmittal_dtl_tbl.frst_qcna_posted_by = "";
                                dtr_transmittal_dtl_tbl.sec_qcna_posted_ddtm = DateTime.Now;
                                dtr_transmittal_dtl_tbl.sec_qcna_posted_by = user_id;

                            }

                        }

                        else
                        {
                            dtr_transmittal_dtl_tbl.frst_qcna_posted_ddtm = Convert.ToDateTime("1900-01-01");
                            dtr_transmittal_dtl_tbl.frst_qcna_posted_by = "";
                            dtr_transmittal_dtl_tbl.sec_qcna_posted_ddtm = Convert.ToDateTime("1900-01-01");
                            dtr_transmittal_dtl_tbl.sec_qcna_posted_by = "";
                        }


                        dtr_transmittal_dtl_tbl.post_status = view_type;
                        db_ats.dtr_transmittal_dtl_tbl.Add(dtr_transmittal_dtl_tbl);
                        db_ats.SaveChangesAsync();
                    }

                    else if (par_action == "N")
                    {//DELETE
                        var od = db_ats.dtr_transmittal_dtl_tbl.Where(a => a.transmittal_nbr == transmittal_nbr && a.empl_id == par_empl_id).FirstOrDefault();

                        if (od != null)
                        {
                            db_ats.dtr_transmittal_dtl_tbl.Remove(od);
                            db_ats.SaveChangesAsync();
                        }
                    }

                    message = "success";
                }
                return JSON(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Jorge Rustom Villanueva
        // Created Date : 02/13/2020
        // Description  : Select Employee Name Modal
        //*********************************************************************//
        public ActionResult FilterGrid(
            string par_month,
            string par_year,
            string par_empl_id,
            string par_view_type,
            string par_department_code
            )
        {
            try
            {
                var user_id = Session["user_id"].ToString();
                var sp_dtr_rep = db_ats.sp_dtr_rep(par_year, par_month, par_empl_id, par_view_type, par_department_code, user_id).ToList();
                return JSON(new { message = "success", sp_dtr_rep }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 04/16/2020
        // Description  : delete from approval workflow table
        //*********************************************************************//
        public ActionResult Delete(string par_transmittal_nbr)
        {
            try
            {
                var od = db_ats.dtr_transmittal_hdr_tbl.Where(a => a.transmittal_nbr == par_transmittal_nbr).FirstOrDefault();
                string message = "";
                if (od != null)
                {
                    db_ats.dtr_transmittal_hdr_tbl.Remove(od);
                    var query = db_ats.dtr_transmittal_dtl_tbl.RemoveRange(db_ats.dtr_transmittal_dtl_tbl.Where(a => a.transmittal_nbr == par_transmittal_nbr));

                    db_ats.SaveChangesAsync();
                    message = "success";
                }
                else
                {
                    message = "";
                }

                return Json(new { message }, JsonRequestBehavior.AllowGet);
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