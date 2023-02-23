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
    public class cDTRNationalController : Controller
    {
        // GET: cDTRNational
        HRIS_DEVEntities db_dev = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        HRIS_DTREntities db_dtr = new HRIS_DTREntities();
        User_Menu um = new User_Menu();
        // GET: rSSDTROverrides
        public ActionResult Index()
        {
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
        // Created By   : Lorraine I. Ale 
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

                var dtr_val = db_ats.sp_dtr_national_dtl_list(DateTime.Now.Year.ToString(), current_month, empl_id,"0");

                var empl_name = db_dev.sp_employee_list_dept_national(empl_id).ToList();
                var dept_list = db_dev.vw_departments_tbl_list.ToList();
                var user_role = db_ats.sp_get_dtrmanual_role_id(user_id).ToList();

                return JSON(new { message = "success", um, dtr_val, empl_name, dept_list, dept_code, user_employment_type, log_in_as_AO, user_role }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
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
                var filteredGrid    = db_ats.sp_dtr_national_dtl_list(p_year, p_month, p_empl_id, p_view_type);
                return JSON(new { message = "success", filteredGrid, empl_name }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
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
        // Created By   : Lorraine I. Ale 
        // Created Date : 05/15/2020
        // Description  : Add new record to table with status as New
        //*********************************************************************//
        public ActionResult Save(dtr_empl_national_hdr_tbl data_header,dtr_empl_national_dtl_tbl data, string par_action)
        {
            try
            {
                var data_header_exist = db_ats.dtr_empl_national_hdr_tbl.Where(a => a.empl_id == data_header.empl_id && a.dtr_year == data_header.dtr_year && a.dtr_month == data_header.dtr_month).FirstOrDefault();
                
               
                if (data_header_exist == null)
                {
                    var new_appl_nbr        =   db_ats.sp_generate_appl_nbr("dtr_empl_national_hdr_tbl", 10, "dtr_ctrl_nbr").ToList();
                    data.dtr_ctrl_nbr       =   new_appl_nbr[0].ToString();

                    data.time_in_am         =   data.time_in_am         == "" || data.time_in_am    == null  ? string.Empty : data.time_in_am;
                    data.time_out_am        =   data.time_out_am        == "" || data.time_out_am   == null  ? string.Empty : data.time_out_am;
                    data.time_in_pm         =   data.time_in_pm         == "" || data.time_in_pm    == null  ? string.Empty : data.time_in_pm;
                    data.time_out_pm        =   data.time_out_pm        == "" || data.time_out_pm   == null  ? string.Empty : data.time_out_pm;
                    data.under_Time         =   data.under_Time         == null ? 0 : data.under_Time;
                    data.under_Time_remarks =   data.under_Time_remarks == "" || data.under_Time_remarks == null ? string.Empty : data.under_Time_remarks;
                    data.remarks_details    =   data.remarks_details    == "" || data.remarks_details    == null ? string.Empty : data.remarks_details;
                    data.time_ot_hris       =   data.time_ot_hris       == "" || data.time_ot_hris       == null ? string.Empty : data.time_ot_hris;
                    data.time_days_equi     =   data.time_days_equi     == null ? 0 : data.time_days_equi;
                    data.time_hours_equi    =   data.time_hours_equi    == null ? 0 : data.time_hours_equi;
                    data.time_ot_payable    =   data.time_ot_payable    == null ? 0 : data.time_hours_equi;
                    data.no_of_as           =   data.no_of_as           == null ? 0 : data.no_of_as;
                    data.no_of_ob           =   data.no_of_ob           == null ? 0 : data.no_of_ob;
                    data.no_of_lv           =   data.no_of_lv           == null ? 0 : data.no_of_lv;
                   

                    data_header.dtr_ctrl_nbr    = new_appl_nbr[0].ToString();
                    data_header.created_by      = Session["user_id"].ToString();
                    data_header.created_ddtm    = DateTime.Now;

                    db_ats.dtr_empl_national_dtl_tbl.Add(data);
                    db_ats.dtr_empl_national_hdr_tbl.Add(data_header);
                    db_ats.SaveChanges();
                }
                else
                {
                    data.dtr_ctrl_nbr = data_header_exist.dtr_ctrl_nbr;
                    var data_exist = db_ats.dtr_empl_national_dtl_tbl.Where(a => a.dtr_date == data.dtr_date && a.dtr_ctrl_nbr == data.dtr_ctrl_nbr).FirstOrDefault();

                    if (data_exist != null)
                    {
                        db_ats.dtr_empl_national_dtl_tbl.Remove(data_exist);
                        db_ats.SaveChanges();
                    }

                    if (par_action == "ADD")
                    {
                        data.dtr_ctrl_nbr       =   data_header_exist.dtr_ctrl_nbr;

                        data.time_in_am         = data.time_in_am           == "" || data.time_in_am == null ? string.Empty : data.time_in_am;
                        data.time_out_am        = data.time_out_am          == "" || data.time_out_am == null ? string.Empty : data.time_out_am;
                        data.time_in_pm         = data.time_in_pm           == "" || data.time_in_pm == null ? string.Empty : data.time_in_pm;
                        data.time_out_pm        = data.time_out_pm          == "" || data.time_out_pm == null ? string.Empty : data.time_out_pm;
                        data.under_Time         = data.under_Time           == null ? 0 : data.under_Time;
                        data.under_Time_remarks = data.under_Time_remarks   == "" || data.under_Time_remarks == null ? string.Empty : data.under_Time_remarks;
                        data.remarks_details    = data.remarks_details      == "" || data.remarks_details == null ? string.Empty : data.remarks_details;
                        data.time_ot_hris       = data.time_ot_hris         == "" || data.time_ot_hris == null ? string.Empty : data.time_ot_hris;
                        data.time_days_equi     = data.time_days_equi       == null ? 0 : data.time_days_equi;
                        data.time_hours_equi    = data.time_hours_equi      == null ? 0 : data.time_hours_equi;
                        data.time_ot_payable    = data.time_ot_payable      == null ? 0 : data.time_hours_equi;
                        data.no_of_as           = data.no_of_as             == null ? 0 : data.no_of_as;
                        data.no_of_ob           = data.no_of_ob             == null ? 0 : data.no_of_ob;
                        data.no_of_lv           = data.no_of_lv             == null ? 0 : data.no_of_lv;

                        data_header_exist.updated_by = Session["user_id"].ToString();
                        data_header_exist.updated_ddtm = DateTime.Now;

                        db_ats.dtr_empl_national_dtl_tbl.Add(data);
                        db_ats.SaveChanges();
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
        // Created By   : Lorraine I. Ale 
        // Created Date : 05/15/2020
        // Description  : Add new record to table with status as New
        //*********************************************************************//
        public ActionResult SaveSubmitAll(dtr_empl_national_hdr_tbl data_header,List<dtr_empl_national_dtl_tbl> data, string par_action, string view_type)
        {
            try
            {
                db_ats.Database.CommandTimeout = Int32.MaxValue;
                var data_header_exist = db_ats.dtr_empl_national_hdr_tbl.Where(a => a.empl_id == data_header.empl_id && a.dtr_year == data_header.dtr_year && a.dtr_month == data_header.dtr_month).FirstOrDefault();
                if (data_header_exist == null)
                {
                     var new_appl_nbr        =   db_ats.sp_generate_appl_nbr("dtr_empl_national_hdr_tbl", 10, "dtr_ctrl_nbr").ToList();
                    
                    data_header.dtr_ctrl_nbr    = new_appl_nbr[0].ToString();
                    data_header.created_by      = Session["user_id"].ToString();
                    data_header.created_ddtm    = DateTime.Now;
                    db_ats.dtr_empl_national_hdr_tbl.Add(data_header);
                    db_ats.SaveChanges();
                    if (data != null)
                    {
                        data.ForEach(a =>
                        {
                            a.dtr_ctrl_nbr = new_appl_nbr[0].ToString();
                            a.time_in_am = a.time_in_am == "" || a.time_in_am == null ? string.Empty : a.time_in_am;
                            a.time_out_am = a.time_out_am == "" || a.time_out_am == null ? string.Empty : a.time_out_am;
                            a.time_in_pm = a.time_in_pm == "" || a.time_in_pm == null ? string.Empty : a.time_in_pm;
                            a.time_out_pm = a.time_out_pm == "" || a.time_out_pm == null ? string.Empty : a.time_out_pm;
                            a.under_Time = a.under_Time == null ? 0 : a.under_Time;
                            a.under_Time_remarks = a.under_Time_remarks == "" || a.under_Time_remarks == null ? string.Empty : a.under_Time_remarks;
                            a.remarks_details = a.remarks_details == "" || a.remarks_details == null ? string.Empty : a.remarks_details;
                            a.time_ot_hris = a.time_ot_hris == "" || a.time_ot_hris == null ? string.Empty : a.time_ot_hris;
                            a.time_days_equi = a.time_days_equi == null ? 0 : a.time_days_equi;
                            a.time_hours_equi = a.time_hours_equi == null ? 0 : a.time_hours_equi;
                            a.time_ot_payable = a.time_ot_payable == null ? 0 : a.time_hours_equi;
                            a.no_of_as = a.no_of_as == null ? 0 : a.no_of_as;
                            a.no_of_ob = a.no_of_ob == null ? 0 : a.no_of_ob;
                            a.no_of_lv = a.no_of_lv == null ? 0 : a.no_of_lv;
                        });
                        foreach (dtr_empl_national_dtl_tbl data_save in data)
                        {
                            if (
                                   (view_type == "0")
                                || (view_type == "1" && data_save.dtr_date.Day <= 15)
                                || (view_type == "2" && data_save.dtr_date.Day >= 16)
                                )
                            {
                                db_ats.dtr_empl_national_dtl_tbl.Add(data_save);
                                db_ats.SaveChanges();
                            }
                        }
                    }
                    
                }
                else
                {
                    data_header_exist.updated_by      = Session["user_id"].ToString();
                    data_header_exist.updated_ddtm    = DateTime.Now;
                    data_header_exist.status_1st      = data_header_exist.status_1st == "N" || data_header_exist.status_1st == null ? data_header.status_1st: data_header_exist.status_1st;
                    data_header_exist.status_2nd      = data_header_exist.status_2nd == "N" || data_header_exist.status_2nd == null ? data_header.status_2nd: data_header_exist.status_2nd;

                    if (data != null)
                    {
                        data.ForEach(a =>
                        {
                            a.dtr_ctrl_nbr = data_header_exist.dtr_ctrl_nbr;
                            a.time_in_am = a.time_in_am == "" || a.time_in_am == null ? string.Empty : a.time_in_am;
                            a.time_out_am = a.time_out_am == "" || a.time_out_am == null ? string.Empty : a.time_out_am;
                            a.time_in_pm = a.time_in_pm == "" || a.time_in_pm == null ? string.Empty : a.time_in_pm;
                            a.time_out_pm = a.time_out_pm == "" || a.time_out_pm == null ? string.Empty : a.time_out_pm;
                            a.under_Time = a.under_Time == null ? 0 : a.under_Time;
                            a.under_Time_remarks = a.under_Time_remarks == "" || a.under_Time_remarks == null ? string.Empty : a.under_Time_remarks;
                            a.remarks_details = a.remarks_details == "" || a.remarks_details == null ? string.Empty : a.remarks_details;
                            a.time_ot_hris = a.time_ot_hris == "" || a.time_ot_hris == null ? string.Empty : a.time_ot_hris;
                            a.time_days_equi = a.time_days_equi == null ? 0 : a.time_days_equi;
                            a.time_hours_equi = a.time_hours_equi == null ? 0 : a.time_hours_equi;
                            a.time_ot_payable = a.time_ot_payable == null ? 0 : a.time_hours_equi;
                            a.no_of_as  = a.no_of_as == null ? 0 : a.no_of_as;
                            a.no_of_ob  = a.no_of_ob == null ? 0 : a.no_of_ob;
                            a.no_of_lv  = a.no_of_lv == null ? 0 : a.no_of_lv;
                        });

                        for (int x = 0; x < data.Count; x++)
                        {
                            var par_date = data[x].dtr_date;
                            var par_dtr_ctrl = data[x].dtr_ctrl_nbr;
                            var data_exist = db_ats.dtr_empl_national_dtl_tbl.Where(a => a.dtr_date == par_date && a.dtr_ctrl_nbr == par_dtr_ctrl).FirstOrDefault();
                            if (data_exist != null)
                            {
                                if (
                                       (view_type == "0" && (data_header_exist.status_1st == "N" && data_header_exist.status_2nd == "N"))
                                    || (view_type == "0" && (data_header_exist.status_1st == "N" && data_exist.dtr_date.Day <= 15))
                                    || (view_type == "0" && (data_header_exist.status_2nd == "N" && data_exist.dtr_date.Day >= 16))
                                    || (view_type == "1" && data_exist.dtr_date.Day <= 15)
                                    || (view_type == "2" && data_exist.dtr_date.Day >= 16)
                                    )
                                {
                                    db_ats.dtr_empl_national_dtl_tbl.Remove(data_exist);
                                    db_ats.SaveChanges();
                                }
                            }
                        }

                        foreach (dtr_empl_national_dtl_tbl data_save in data)
                        {
                            if (
                                    (view_type == "0" && (data_header_exist.status_1st == "N" && data_header_exist.status_2nd == "N"))
                                || (view_type == "0" && (data_header_exist.status_1st == "N" && data_save.dtr_date.Day <= 15))
                                || (view_type == "0" && (data_header_exist.status_2nd == "N" && data_save.dtr_date.Day >= 16))
                                || (view_type == "1" && data_save.dtr_date.Day <= 15)
                                || (view_type == "2" && data_save.dtr_date.Day >= 16)
                                )
                            {
                                db_ats.dtr_empl_national_dtl_tbl.Add(data_save);
                                db_ats.SaveChanges();
                            }
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
        // Created By   : Lorraine I. Ale 
        // Created Date : 05/15/2020
        // Description  : Add new record to table with status as New
        //*********************************************************************//
        public ActionResult DeleteExisting(dtr_empl_national_dtl_tbl data)
        {
            try
            {
                var data_exist = db_ats.dtr_empl_national_dtl_tbl.Where(a => a.dtr_date == data.dtr_date && a.dtr_ctrl_nbr == data.dtr_ctrl_nbr).FirstOrDefault();

                if (data_exist != null)
                {
                    db_ats.dtr_empl_national_dtl_tbl.Remove(data_exist);
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
        // Created By   : Lorraine I. Ale 
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