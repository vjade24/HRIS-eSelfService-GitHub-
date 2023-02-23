//********************************************
//** Created By     : Joseph M. TOmbo Jr.
//** Created Date   : 06-15-2021
//** Purpose        : Code for DTR For National Offices
//********************************************

using HRIS_eSelfService.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eSelfService.Controllers
{
    public class rSSAOHRenderController : Controller
    {
        // GET: cDTRNational
        HRIS_DEVEntities db_dev = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        HRIS_DTREntities db_dtr = new HRIS_DTREntities();
        User_Menu um = new User_Menu();
        // GET: rSSAOHRender
        public ActionResult Index()
        {
            db_dev.Database.CommandTimeout = Int32.MaxValue;
            db_ats.Database.CommandTimeout = Int32.MaxValue;
            db_dtr.Database.CommandTimeout = Int32.MaxValue;

            User_Menu um = new User_Menu();
            if (Session["user_id"] == null)
            {
                return RedirectToAction("../");
            }
            if (um != null || um.ToString() != "")
            {
                GetAllowAccess();
            }
            return View(um);
        }
        private User_Menu GetAllowAccess()

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
            um.user_id              = Session["user_id"].ToString();

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
        // Created By   : Joseph M. Tombo Jr 
        // Created Date : 03/05/2020
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult InitializeData()
        {
            try
            {
                GetAllowAccess();

                var empl_id                 = Session["empl_id"].ToString();
                var dept_code               = Session["department_code"].ToString();
                var user_id                 = Session["user_id"].ToString();
                var user_employment_type    = Session["employment_type"].ToString();
                string log_in_as_AO         = Session["log_in_as_AO"].ToString();

                string current_month        = DateTime.Now.Month < 10 ? "0" + DateTime.Now.Month.ToString() : DateTime.Now.Month.ToString();

                var aoh_data_list = db_ats.sp_aoh_render_hdr_dtl_tbl_list(DateTime.Now.Year.ToString(), current_month, dept_code).ToList();

                var empl_name = db_dev.sp_employee_list_dept(empl_id).ToList();
                var dept_list = db_dev.vw_departments_tbl_list.ToList();
                var user_role = db_ats.sp_get_dtrmanual_role_id(user_id).ToList();
                var sp_dtr_transmittal_addressto_list = db_ats.sp_dtr_transmittal_addressto_list().ToList();
                return JSON(new { message = "success", um, aoh_data_list, empl_name, dept_list, dept_code, user_employment_type, log_in_as_AO, user_role, sp_dtr_transmittal_addressto_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr 
        // Created Date : 02/03/2021
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult ChecSpReportResult(
            string par_year
            ,string par_month          
            ,string par_department     
            ,string par_employment_type
            ,string par_empl_id        )
        {
            try
            {
                db_ats.Database.CommandTimeout = int.MaxValue;
                var report_result = db_ats.sp_authority_onhours_render_rep(par_year, par_month, par_department, par_employment_type, par_empl_id).ToList();
                return JSON(new { message = "success", report_result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }




        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr 
        // Created Date : 02/03/2021
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult FilterPageGrid(
            string p_dept_code
            , string p_empl_id
            , string p_year
            , string p_month
            , string p_view_type)
        {
            try
            {
                var empl_id         = p_empl_id;
                var user_id         = Session["user_id"].ToString();
                var empl_name       = db_dev.sp_employee_list_dept(p_dept_code).ToList();
                var filteredGrid    = db_ats.sp_aoh_render_hdr_dtl_tbl_list(p_year, p_month, p_dept_code).ToList();
                return JSON(new { message = "success", filteredGrid, empl_name }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr 
        // Created Date : 02/03/2021
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult generate_aoh_list(
              string p_dept_code
            , string p_year
            , string p_month
            , string p_view_type)
        {
            try
            {
                db_ats.Database.CommandTimeout = Int32.MaxValue;
                var filteredGrid    = db_ats.sp_authority_onhours_render_generate(p_year, p_month, p_dept_code, p_view_type,"").ToList();
                return JSON(new { message = "success", filteredGrid }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr 
        // Created Date : 02/03/2021
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult DepartmentFilter(string p_dept_code)
        {
            try
            {
                var empl_name = db_dev.sp_employee_list_dept(p_dept_code).ToList();
               
                return JSON(new { message = "success", empl_name }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr 
        // Created Date : 05/15/2020
        // Description  : Add new record to table with status as New
        //*********************************************************************//
        public ActionResult SaveSubmitAll(empl_aoh_render_hdr_tbl data_header,List<empl_aoh_render_dtl_tbl> data, string par_action, string view_type)
        {
            try
            {
                db_ats.Database.CommandTimeout = Int32.MaxValue;
                var data_header_exist = db_ats.empl_aoh_render_hdr_tbl.Where(a => a.department_code == data_header.department_code && a.dtr_year == data_header.dtr_year && a.dtr_month == data_header.dtr_month).FirstOrDefault();
                if (data_header_exist == null)
                {
                     var new_appl_nbr        =   db_ats.sp_generate_appl_nbr("empl_aoh_render_hdr_tbl", 10, "aoh_ctrl_nbr").ToList();
                    
                    data_header.aoh_ctrl_nbr    = new_appl_nbr[0].ToString();
                    data_header.created_by      = Session["user_id"].ToString();
                    data_header.created_ddtm    = DateTime.Now;
                    data_header.empl_id         =  Session["user_id"].ToString().Replace("U","");

                    db_ats.empl_aoh_render_hdr_tbl.Add(data_header);
                    db_ats.SaveChanges();
                    if (data != null)
                    {
                        data.ForEach(a =>
                        {
                            a.aoh_ctrl_nbr = new_appl_nbr[0].ToString();
                            a.dtr_date_concatenated = a.dtr_date_concatenated == "" || a.dtr_date_concatenated == null ? string.Empty : a.dtr_date_concatenated;
                            a.aoh_reason = a.aoh_reason == "" || a.aoh_reason == null ? string.Empty : a.aoh_reason;
                            a.empl_id = a.empl_id == "" || a.empl_id == null ? string.Empty : a.empl_id;
                        });

                        foreach (empl_aoh_render_dtl_tbl data_save in data)
                        {
                            
                                db_ats.empl_aoh_render_dtl_tbl.Add(data_save);
                                db_ats.SaveChanges();
                        }
                    }
                    
                }
                else
                {
                    data_header_exist.updated_by      = Session["user_id"].ToString();
                    data_header_exist.updated_ddtm    = DateTime.Now;
                    data_header_exist.noted_by_empl_id      = data_header.noted_by_empl_id;
                    data_header_exist.approved_by_empl_id   = data_header.approved_by_empl_id;
                    data_header_exist.requested_by_empl_id  = data_header.requested_by_empl_id;
                    data_header_exist.recomappr_empl_id     = data_header.recomappr_empl_id;
                    if (data != null)
                    {
                        data.ForEach(a =>
                        {
                            a.aoh_ctrl_nbr = data_header_exist.aoh_ctrl_nbr;
                            a.dtr_date_concatenated = a.dtr_date_concatenated == "" || a.dtr_date_concatenated == null ? string.Empty : a.dtr_date_concatenated;
                            a.aoh_reason = a.aoh_reason == "" || a.aoh_reason == null ? string.Empty : a.aoh_reason;
                            a.empl_id = a.empl_id == "" || a.empl_id == null ? string.Empty : a.empl_id;
                        });

                        //UPDATED BY JOSEPH: 04-20-2022
                        //UPDATEDETIALS: DAPAT DELETON TANAN DETAILS UG NA REGENERATENA
                        //for (int x = 0; x < data.Count; x++)
                        //{
                        //    var par_empl_id        = data[x].empl_id;
                        //    var par_aoh_ctrl_nbr   = data[x].aoh_ctrl_nbr;
                        //    var data_exist         = db_ats.empl_aoh_render_dtl_tbl.Where(a => a.empl_id == par_empl_id && a.aoh_ctrl_nbr == par_aoh_ctrl_nbr).FirstOrDefault();
                        //    if (data_exist != null)
                        //    {
                        //        db_ats.empl_aoh_render_dtl_tbl.Remove(data_exist);
                        //        db_ats.SaveChanges();
                        //    }
                        //}
                        //THIS IS THE UPDATE
                        var par_aoh_ctrl_nbr = data_header_exist.aoh_ctrl_nbr;
                        var data_exist = db_ats.empl_aoh_render_dtl_tbl.Where(a => a.aoh_ctrl_nbr == par_aoh_ctrl_nbr).ToList();
                        if (data_exist != null)
                        {
                            db_ats.empl_aoh_render_dtl_tbl.RemoveRange(data_exist);
                            db_ats.SaveChanges();
                        }

                        foreach (empl_aoh_render_dtl_tbl data_save in data)
                        {
                                db_ats.empl_aoh_render_dtl_tbl.Add(data_save);
                                db_ats.SaveChanges();
                        }
                      
                    }
                    db_ats.SaveChanges();
                }
                
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr 
        // Created Date : 05/15/2020
        // Description  : Add new record to table with status as New
        //*********************************************************************//
        public ActionResult DeleteExisting(empl_aoh_render_dtl_tbl data)
        {
            try
            {
                var data_exist = db_ats.empl_aoh_render_dtl_tbl.Where(a => a.aoh_ctrl_nbr == data.aoh_ctrl_nbr && a.empl_id == data.empl_id).FirstOrDefault();

                if (data_exist != null)
                {
                    db_ats.empl_aoh_render_dtl_tbl.Remove(data_exist);
                    db_ats.SaveChangesAsync();
                }
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr 
        // Created Date : 05/15/2020
        // Description  : Add new record to table with status as New
        //*********************************************************************//
        public ActionResult SubmitHeader(string par_empl_id, string par_year, string par_month, string par_view_type)
        {
            try
            {
                string message = "";
                var header_data = db_ats.dtr_empl_national_hdr_tbl.Where(a => a.empl_id == par_empl_id && a.dtr_year == par_year && a.dtr_month == par_month).FirstOrDefault();

                if (header_data != null)
                {
                    if (par_view_type == "0")
                    {
                        header_data.status_1st = header_data.status_1st =="N"  || header_data.status_1st == null ?     "S": header_data.status_1st;
                        header_data.status_2nd = header_data.status_2nd == "N" || header_data.status_2nd == null ?    "S": header_data.status_2nd;
                    }
                    else if (par_view_type == "1")
                    {
                        header_data.status_1st = "S";
                    }
                    else if (par_view_type == "2")
                    {
                        header_data.status_2nd = "S";
                    }

                    header_data.updated_ddtm = DateTime.Now;
                    header_data.updated_by = Session["user_id"].ToString();
                    message = "success";
                    db_ats.SaveChangesAsync();
                }
                else message = "No Header Found!";

                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult PreviousValuesOnPage_rSSDTROverrides ()
        {
            Session["history_page"] = Request.UrlReferrer.ToString();
            
            return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
        }
    }
}