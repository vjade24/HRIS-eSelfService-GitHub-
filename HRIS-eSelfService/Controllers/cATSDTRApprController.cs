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
    public class cATSDTRApprController : Controller
    {
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
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
            um.allow_add    = (int)Session["allow_add"];
            um.allow_delete = (int)Session["allow_delete"];
            um.allow_edit = (int)Session["allow_edit"];
            um.allow_edit_history = (int)Session["allow_edit_history"];
            um.allow_print = (int)Session["allow_print"];
            um.allow_view = (int)Session["allow_view"];
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
                var empl_id = Session["empl_id"].ToString();
                GetAllowAccess();
                var user_id = Session["user_id"].ToString();
                var department_list = db.vw_departments_tbl_list.ToList();
                string[] PreviousValuesonPage_cATSDTRAppr;
                string year = "";
                string month = "";
                string view_type = "0";
                if (Session["PreviousValuesonPage_cATSDTRAppr"] == null || Session["PreviousValuesonPage_cATSDTRAppr"].ToString() == "")
                {
                    year = DateTime.Now.Year.ToString();
                    month = DateTime.Now.Month >= 10 ? DateTime.Now.Month.ToString() : "0" + DateTime.Now.Month.ToString();
                }
                else
                {
                    PreviousValuesonPage_cATSDTRAppr = Session["PreviousValuesonPage_cATSDTRAppr"].ToString().Split(new char[] { ',' });
                    year    = PreviousValuesonPage_cATSDTRAppr[2];
                    month   = PreviousValuesonPage_cATSDTRAppr[1];
                    view_type = PreviousValuesonPage_cATSDTRAppr[3];
                }
                
                var sp_dtr_transmittal_hdr_tbl_list = db_ats.sp_dtr_transmittal_hdr_tbl_list(year, month, view_type, "").Where(a=> a.created_by == user_id).ToList();
                //var employee_list = db_ats.sp_employee_list_dept_dtr_appr(empl_id).ToList();
                var sp_dtr_transmittal_addressto_list = db_ats.sp_dtr_transmittal_addressto_list().ToList();
                string dept_code = Session["department_code"].ToString();
                var sp_dtr_transmittal_requestedfrom_list = db_ats.sp_dtr_transmittal_requestedfrom_list(dept_code, "", "", "");
                return JSON(new { message = "success", um, department_list, sp_dtr_transmittal_hdr_tbl_list, sp_dtr_transmittal_addressto_list, sp_dtr_transmittal_requestedfrom_list, view_type,year,month}, JsonRequestBehavior.AllowGet);
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
                
                return JSON(new { message = "success", sp_get_next_transmittal_no}, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        private string GetTransNbrSave() {
            var sp_get_next_transmittal_no = db_ats.sp_get_next_transmittal_no().FirstOrDefault();
            string next_transmittal_no = sp_get_next_transmittal_no.ToString();
            return next_transmittal_no;
        }

        //*********************************************************************//
        // Created By   : Jorge Rustom Villanueva
        // Created Date : 02/13/2020
        // Description  : Save and Update Function
        //*********************************************************************//
        public ActionResult SaveEditDatabase(dtr_transmittal_hdr_tbl data1, string par_action)
        {
            try
            {
                var sp_get_next_transmittal_no = "";
                if (par_action == "ADD")
                {
                    string dept_code                                = Session["department_code"].ToString();
                    sp_get_next_transmittal_no                      = GetTransNbrSave();
                    dtr_transmittal_hdr_tbl dtr_transmittal_hdr_tbl = new dtr_transmittal_hdr_tbl();
                    dtr_transmittal_hdr_tbl.transmittal_nbr         = GetTransNbrSave();
                    dtr_transmittal_hdr_tbl.transmittal_date        = Convert.ToDateTime(Convert.ToDateTime(data1.transmittal_date).ToString("yyyy-MM-dd HH:mm:ss")); ;
                    dtr_transmittal_hdr_tbl.dtr_year                = data1.dtr_year;
                    dtr_transmittal_hdr_tbl.dtr_month               = data1.dtr_month;
                    dtr_transmittal_hdr_tbl.view_type               = data1.view_type;
                    dtr_transmittal_hdr_tbl.department_code         = dept_code;
                    dtr_transmittal_hdr_tbl.transmittal_descr       = data1.transmittal_descr;

                    dtr_transmittal_hdr_tbl.approval_status         = data1.approval_status;


                    if (data1.approval_status == "A")
                    {
                        dtr_transmittal_hdr_tbl.approved_date   = DateTime.Now;
                        dtr_transmittal_hdr_tbl.approved_by     = Session["user_id"].ToString();
                    }
                    else {
                        dtr_transmittal_hdr_tbl.approved_date   = Convert.ToDateTime("1900-01-01");
                        dtr_transmittal_hdr_tbl.approved_by     = "";
                    }

                    dtr_transmittal_hdr_tbl.created_dttm        = DateTime.Now; 
                    dtr_transmittal_hdr_tbl.created_by          = Session["user_id"].ToString();
                    dtr_transmittal_hdr_tbl.updated_dttm        = Convert.ToDateTime("1900-01-01");
                    dtr_transmittal_hdr_tbl.updated_by          = "";
                    dtr_transmittal_hdr_tbl.remarks             = data1.remarks;
                    dtr_transmittal_hdr_tbl.transmittal_type    = data1.transmittal_type;
                    dtr_transmittal_hdr_tbl.addressto_id        = data1.addressto_id;
                    dtr_transmittal_hdr_tbl.requestor_id        = data1.requestor_id;
                    db_ats.dtr_transmittal_hdr_tbl.Add(dtr_transmittal_hdr_tbl);
                    db_ats.SaveChangesAsync();
                }

                else if (par_action == "EDIT")
                {
                    var query = db_ats.dtr_transmittal_hdr_tbl.Where(a => a.transmittal_nbr == data1.transmittal_nbr).FirstOrDefault();

                    if (query != null)
                    {

                        if (data1.approval_status == "A")
                        {
                            query.approved_date = DateTime.Now;
                            query.approved_by = Session["user_id"].ToString();
                        }

                        else
                        {
                            query.approved_date = Convert.ToDateTime("1900-01-01");

                            query.approved_by = "";
                        }
                        

                        sp_get_next_transmittal_no  = data1.transmittal_nbr;
                        query.view_type             = data1.view_type;
                        query.transmittal_descr     = data1.transmittal_descr;
                        query.transmittal_date      = Convert.ToDateTime(Convert.ToDateTime(data1.transmittal_date).ToString("yyyy-MM-dd HH:mm:ss"));
                        query.approval_status       = data1.approval_status;
                        query.updated_dttm          = DateTime.Now;
                        query.updated_by            = Session["user_id"].ToString();
                        query.remarks               = data1.remarks;
                        query.transmittal_type      = data1.transmittal_type;
                        query.addressto_id          = data1.addressto_id;
                        query.requestor_id          = data1.requestor_id;
                        db_ats.SaveChangesAsync();
                    }

                    
                }


                if (data1.approval_status == "S")
                {
                    var sp_edocument_trk_transmit_insert_upd = db.sp_edocument_trk_transmit_insert_upd(sp_get_next_transmittal_no, Session["user_id"].ToString(), "0");
                }

                return JSON(new { message = "success", sp_get_next_transmittal_no}, JsonRequestBehavior.AllowGet);
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
            string par_view_type
            )
        {
            try
            {
                var user_id = Session["user_id"].ToString();
                var sp_dtr_transmittal_hdr_tbl_list = db_ats.sp_dtr_transmittal_hdr_tbl_list(par_year, par_month, par_view_type, "").Where(a => a.created_by == user_id).ToList();
                return JSON(new { message = "success", sp_dtr_transmittal_hdr_tbl_list }, JsonRequestBehavior.AllowGet);
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

        //*********************************************************************//
        // Created By   : Jorge Rustom Villanueva
        // Created Date : 02/13/2020
        // Description  : Select Employee Name Modal
        //*********************************************************************//
        public ActionResult SetHistory(dtr_transmittal_hdr_tbl par_data)
        {
            try
            {
                Session["history_page"] = Request.UrlReferrer.ToString();
                Session["PreviousValuesonPage_cATSDTRAppr"] = par_data.transmittal_nbr + ","
                                                               + par_data.dtr_month + ","
                                                               + par_data.dtr_year + ","
                                                               + par_data.view_type + ","
                                                               + par_data.approval_status;

                return JSON(new { message = "success"}, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}