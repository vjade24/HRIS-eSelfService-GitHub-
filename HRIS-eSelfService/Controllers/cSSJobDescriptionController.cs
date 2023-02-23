/*
 ******************************************************************
 ******************************************************************
 * Purpose      : Back-end code for Employee Job Description for eSelfService
 * Created By   : Joseph M. Tombo Jr.
 * Created Date : 04/28/2021
 ******************************************************************
 ******************************************************************
 */
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
    public class cSSJobDescriptionController : Controller
    {
      HRIS_DEVEntities db_dev = new HRIS_DEVEntities();
        HRIS_HRDEntities db_hrd = new HRIS_HRDEntities();
        User_Menu um            = new User_Menu();
        // GET: cSSJobDescription
         //*********************************************************************//
        // Created By : JMTJR - Created Date : 05/09/2020
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
            if (um != null || um.ToString() != "")
            {
                try
                {
                    GetAllowAccess();
                }

                catch (Exception e)
                {
                    string msg = e.Message;
                    return RedirectToAction("Index", "Login");
                }
                //Session["empl_id"] = "9595";
            }
            return View(um);
        }

        //*********************************************************************//
        // Created By   : JMTJR - Created Date :02/01/2021
        // Description  : User Access On Page 
        //*********************************************************************//
        public ActionResult UserAccessOnPage(int id)
        {
            Session["user_menu_id"] = id;
            return Json("success", JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By   : JMTJR - Created Date :02/01/2021
        // Description  : Initialized during PageLoad
        //*********************************************************************//
        public ActionResult InitializeData(string par_budget_code)
        {
            if (um != null || um.ToString() != "")
            {
                try
                {
                    GetAllowAccess();
                }

                catch (Exception e)
                {
                    string msg = e.Message;
                    return RedirectToAction("Index", "Login");
                }
                //Session["empl_id"] = "9595";
            }
            if (Session["PreviousValuesonPage_cSSJobDesHDR"] == null)
            {
                string dep_code = "";
                string div_code = "";
                string sec_code = "";
                string emp_type = "";
                db_dev.Database.CommandTimeout  = int.MaxValue;
                string  empl_id                 = Session["user_id"].ToString().Replace("U", "");
                var     employment_type_list    = db_dev.vw_employmenttypes_tbl_list.ToList();
                var     department_tbl_list     = db_dev.vw_departments_tbl_list.OrderBy(a => a.department_code).ToList();
                string  log_in_as_AO            = Session["log_in_as_AO"].ToString();
                var userlogin_masterinfo        = db_hrd.sp_get_employeemaster_information_hrd(empl_id).FirstOrDefault();
                var ao_assignment               = db_dev.vw_ao_employee.Where(a => a.empl_id == empl_id).FirstOrDefault();
                if (log_in_as_AO == "True" && ao_assignment != null)
                {
                    dep_code = ao_assignment.department_code;
                    div_code = ao_assignment.division_code;
                    sec_code = ao_assignment.section_code;
                    emp_type = userlogin_masterinfo.employment_type;
                }
                else
                {
                    dep_code = userlogin_masterinfo.department_code;
                    div_code = userlogin_masterinfo.division_code;
                    sec_code = userlogin_masterinfo.section_code;
                    emp_type = userlogin_masterinfo.employment_type;

                }

                var employee_list               = db_hrd.sp_employee_list_with_masterdata_list_hrd(emp_type, dep_code, div_code, sec_code,empl_id).ToList();
                var budget_year                 = db_dev.sp_plantillapayroll_tbl_list2().ToList();
                var vw_approval_list            = db_dev.vw_approvalstatus_tbl.ToList();
                return JSON(new { um
                    , employment_type_list
                    , department_tbl_list
                    , prevValues = "" 
                    , log_in_as_AO 
                    , userlogin_masterinfo
                    , employee_list
                    , budget_year
                    , ao_assignment
                    , vw_approval_list }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                string[] prevValues = Session["PreviousValuesonPage_cSSJobDesHDR"].ToString().Split(new char[] { ',' });
                Session["PreviousValuesonPage_cSSJobDesHDR"] = null;
                db_dev.Database.CommandTimeout  = int.MaxValue;
                string dep_code  = "";
                string div_code  = "";
                string sec_code  = "";
                string emp_type  = "";

                string empl_id                  = Session["user_id"].ToString().Replace("U", "");
                var employment_type_list        = db_dev.vw_employmenttypes_tbl_list.ToList();
                var department_tbl_list         = db_dev.vw_departments_tbl_list.OrderBy(a => a.department_code).ToList();
                string log_in_as_AO             = Session["log_in_as_AO"].ToString();
                var userlogin_masterinfo        = db_hrd.sp_get_employeemaster_information_hrd(empl_id).FirstOrDefault();
                var ao_assignment               = db_dev.vw_ao_employee.Where(a => a.empl_id == empl_id).FirstOrDefault();

                if (log_in_as_AO == "True" && ao_assignment != null)
                {
                    dep_code = ao_assignment.department_code;
                    div_code = ao_assignment.division_code;
                    sec_code = ao_assignment.section_code;
                    emp_type = userlogin_masterinfo.employment_type;
                }
                else
                {
                    dep_code    = userlogin_masterinfo.department_code;
                    div_code    = userlogin_masterinfo.division_code;
                    sec_code    = userlogin_masterinfo.section_code;
                    emp_type    = userlogin_masterinfo.employment_type;

                }


                var employee_list       = db_hrd.sp_employee_list_with_masterdata_list_hrd(emp_type, dep_code, div_code, sec_code, empl_id).ToList();
                var budget_year         = db_dev.sp_plantillapayroll_tbl_list2().ToList();
                var vw_approval_list    = db_dev.vw_approvalstatus_tbl.ToList();
                return JSON(new { um
                    , employment_type_list
                    , department_tbl_list
                    , prevValues
                    , log_in_as_AO
                    , userlogin_masterinfo
                    , employee_list
                    , budget_year
                    , ao_assignment
                    , vw_approval_list }, JsonRequestBehavior.AllowGet);
            }
           
        }

        //*********************************************************************//
        // Created By   : JMTJR - Created Date :04/23/2021
        // Description  : Get Divisions list when department change
        //*********************************************************************//
        public ActionResult GetLisgrid_data(string par_position_code, string par_status, string par_empl_id)
        {
            try
            {
                db_dev.Database.CommandTimeout      = int.MaxValue;
                db_hrd.Database.CommandTimeout      = Int32.MaxValue;
                var datalistgrid                    = db_hrd.sp_employee_jobfunddescr_dtl_tbl_list(par_empl_id,par_status, par_position_code).ToList();
                return JSON(new { datalistgrid }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { error_message = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : JMTJR - Created Date :04/23/2021
        // Description : Get Divisions list when department change
        //*********************************************************************//
        public ActionResult GetTaskListCommon(string par_fjd_code, string par_empl_id)
        {
            try
            {
                db_dev.Database.CommandTimeout  = int.MaxValue;
                db_hrd.Database.CommandTimeout  = Int32.MaxValue;
                var datalistgrid_task_common    = db_hrd.sp_common_task_per_jobdescription_add_list(par_fjd_code, par_empl_id).ToList();
                return JSON(new { datalistgrid_task_common, message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { error_message = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : JMTJR - Created Date :04/23/2021
        // Description : Get Divisions list when department change
        //*********************************************************************//
        public ActionResult GetTaskList(string par_fjd_code, string par_add_mode, string par_empl_id)
        {
            try
            {
                db_dev.Database.CommandTimeout = int.MaxValue;
                db_hrd.Database.CommandTimeout = Int32.MaxValue;
                var datalistgrid_task = db_hrd.sp_jobdescription_task_empl_tbl_list(par_fjd_code, par_add_mode, par_empl_id).ToList();
                return JSON(new { datalistgrid_task, message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { error_message = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : JMTJR - Created Date :04/23/2021
        // Description  : Get generate Updated Key Code
        //*********************************************************************//
        public ActionResult GetCommonJD(string par_department_code,string par_division_code,string par_section_code, string par_applcode, string par_position_code, string par_employment_type)
        {
            try
            {
                db_dev.Database.CommandTimeout = int.MaxValue;
                var fjd_keycode     = db_hrd.sp_generate_jobfunction_hdr_key_code(par_employment_type, par_department_code).FirstOrDefault();
                var new_appl_nbr    = db_hrd.sp_generate_appl_nbr("employee_jobfunddescr_hdr_tbl", 15, "applcode");
                var common_fjd      = db_hrd.sp_get_common_jobfunddescr_list(par_department_code, par_division_code, par_section_code, par_position_code, par_applcode, Session["empl_id"].ToString()).ToList();
                return JSON(new { fjd_keycode, new_appl_nbr, common_fjd }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { erro_message = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        //*********************************************************************//
        // Created By   : JMTJR - Created Date :04/23/2021
        // Description  : Get generate Updated Key Code
        //*********************************************************************//
        public ActionResult GenerateKeyCode(string par_position_code, string par_department_code)
        {
            try
            {
                db_dev.Database.CommandTimeout = int.MaxValue;
                var fjd_code     = db_hrd.sp_generate_key_jobfunc_dtl(par_department_code, par_position_code,"").FirstOrDefault();
                return JSON(new { fjd_code}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { erro_message = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        

        //*********************************************************************//
        // Created By   : JMTJR - Created Date :04/23/2021
        // Description  : Get generate Updated Key Code
        //*********************************************************************//
        public ActionResult SaveCommonToDatabase(empl_jobfunddescr_hdr_tbl data, List<empl_jobfunddescr_dtl_tbl> par_common_list, string par_employment_type)
        {
            try
            {
                db_dev.Database.CommandTimeout = int.MaxValue;
                string message      = "";
                var new_appl_nbr    = db_hrd.sp_generate_appl_nbr("empl_jobfunddescr_hdr_tbl", 10, "empl_ctrl_nbr").FirstOrDefault();

                if (data.empl_ctrl_nbr != null)
                {
                    string empl_ctrl_nbr_par = data.empl_ctrl_nbr;
                    empl_jobfunddescr_hdr_tbl data_header = db_hrd.empl_jobfunddescr_hdr_tbl.Where(a => a.empl_ctrl_nbr == empl_ctrl_nbr_par).FirstOrDefault();
                    data_header.updated_dttm = DateTime.Now;
                    data_header.updated_by = Session["user_id"].ToString();
                    for (int x = 0; x < par_common_list.Count; x++)
                    {
                        par_common_list[x].empl_ctrl_nbr    = data_header.empl_ctrl_nbr;
                        par_common_list[x].created_dttm     = DateTime.Now;
                        par_common_list[x].created_by       = Session["user_id"].ToString();
                        par_common_list[x].fjd_flag         = true;
                    }

                    db_hrd.empl_jobfunddescr_dtl_tbl.AddRange(par_common_list);
                    db_hrd.SaveChanges();
                    message = "success";
                }
                else
                {
                    data.empl_ctrl_nbr  = new_appl_nbr; //Updated keycode during add...
                    data.created_dttm   = DateTime.Now;
                    data.created_by     = Session["user_id"].ToString();
                    db_hrd.empl_jobfunddescr_hdr_tbl.Add(data);

                    for (int x=0; x< par_common_list.Count; x++)
                    {
                        par_common_list[x].empl_ctrl_nbr = new_appl_nbr;
                        par_common_list[x].created_dttm  = DateTime.Now;
                        par_common_list[x].created_by    = Session["user_id"].ToString();
                        par_common_list[x].fjd_flag      = true;
                    }

                    db_hrd.empl_jobfunddescr_dtl_tbl.AddRange(par_common_list);
                    db_hrd.SaveChanges();
                    message = "success";
                }
                return JSON(new { message,data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { erro_message = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        //*********************************************************************//
        // Created By   : JMTJR - Created Date :04/23/2021
        // Description  : Get generate Updated Key Code
        //*********************************************************************//
        public ActionResult SaveCommonTaskToDatabase(List<jobfunddescr_task_empl_tbl> par_common_list, string par_empl_id)
        {
            try
            {
                db_dev.Database.CommandTimeout = int.MaxValue;
                db_hrd.Database.CommandTimeout = Int32.MaxValue;
                string message      = "";
                string fjd_codeX = "";
                for (int x = 0; x < par_common_list.Count; x++)
                {
                    par_common_list[x].empl_id      = par_empl_id;
                    par_common_list[x].created_dttm = DateTime.Now;
                    par_common_list[x].created_by   = Session["user_id"].ToString();
                    fjd_codeX = par_common_list[x].fjd_code;
                }


                db_hrd.jobfunddescr_task_empl_tbl.AddRange(par_common_list);
                db_hrd.SaveChanges();

                var datalistgrid_task = db_hrd.sp_jobdescription_task_empl_tbl_list(fjd_codeX,"A", par_empl_id).ToList();
                message = "success";
               
                return JSON(new { message, datalistgrid_task }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { erro_message = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        //*********************************************************************//
        // Created By   : JMTJR - Created Date :04/23/2021
        // Description  : Get generate Updated Key Code
        //*********************************************************************//
        public ActionResult SaveToDatabase(empl_jobfunddescr_dtl_tbl data, string trans_action, empl_jobfunddescr_hdr_tbl data_header)
        {
            try
            {
                string message = "";
                db_dev.Database.CommandTimeout = int.MaxValue;
                db_hrd.Database.CommandTimeout = Int32.MaxValue;

                var new_appl_nbr = db_hrd.sp_generate_appl_nbr("empl_jobfunddescr_hdr_tbl", 10, "empl_ctrl_nbr").FirstOrDefault();

                if (trans_action == "A")
                {
                    if (data_header.empl_ctrl_nbr != null)
                    {
                        string empl_ctrl_nbr_par = data_header.empl_ctrl_nbr;
                        empl_jobfunddescr_hdr_tbl data_headerX = db_hrd.empl_jobfunddescr_hdr_tbl.Where(a => a.empl_ctrl_nbr == empl_ctrl_nbr_par).FirstOrDefault();
                        data_headerX.updated_dttm = DateTime.Now;
                        data_headerX.updated_by = Session["user_id"].ToString();

                        data.empl_ctrl_nbr = data_headerX.empl_ctrl_nbr;
                        data.created_dttm = DateTime.Now;
                        data.created_by = Session["user_id"].ToString();

                        db_hrd.empl_jobfunddescr_dtl_tbl.Add(data);
                        db_hrd.SaveChanges();
                        message = "success";
                    }
                    else
                    {
                        data_header.empl_ctrl_nbr = new_appl_nbr; //Updated keycode during add...
                        data_header.created_dttm = DateTime.Now;
                        data_header.created_by  = Session["user_id"].ToString();
                        db_hrd.empl_jobfunddescr_hdr_tbl.Add(data_header);
                        data.empl_ctrl_nbr      = new_appl_nbr;
                        data.created_dttm       = DateTime.Now;
                        data.created_by         = Session["user_id"].ToString();
                        //data.fjd_flag = true;

                        db_hrd.empl_jobfunddescr_dtl_tbl.Add(data);
                        db_hrd.SaveChanges();
                        message = "success";
                    }
                }
                else if (trans_action == "U")
                {
                    string par_empl_ctrl_nbr    = data.empl_ctrl_nbr;
                    string par_fjd_code         = data.fjd_code;
                    empl_jobfunddescr_hdr_tbl data_headerX = db_hrd.empl_jobfunddescr_hdr_tbl.Where(a => a.empl_ctrl_nbr == par_empl_ctrl_nbr).FirstOrDefault();
                    data_headerX.updated_dttm   = DateTime.Now;
                    data_headerX.updated_by     = Session["user_id"].ToString();

                    empl_jobfunddescr_dtl_tbl data_dtl = db_hrd.empl_jobfunddescr_dtl_tbl.Where(a => a.empl_ctrl_nbr == par_empl_ctrl_nbr && a.fjd_code == par_fjd_code).FirstOrDefault();
                    data_dtl.fjd_descr              = data.fjd_descr;
                    data_dtl.fjd_percent_weight     = data.fjd_percent_weight;
                    data_dtl.fjd_type               = data.fjd_type;
                    data_dtl.updated_by             = Session["user_id"].ToString();
                    data_dtl.updated_dttm           = DateTime.Now;
                    db_hrd.SaveChanges();
                    message = "success";
                }
                else if (trans_action == "S") //Submit
                {
                   
                    string par_empl_ctrl_nbr    = data.empl_ctrl_nbr;

                    string par_fjd_code         = data.fjd_code;
                    string par_empl_id          = data_header.empl_id;
                    var validate_percentage     = db_hrd.sp_validate_empl_job_percentage(par_empl_ctrl_nbr).FirstOrDefault();
                    if (validate_percentage.percent_status.ToString().Trim() == "100%")
                    {
                        var app_id = db_dev.sp_insert_transaction_to_approvalworkflow_tbl(Session["user_id"].ToString(), par_empl_id, "109").ToList();
                        empl_jobfunddescr_hdr_tbl data_headerX = db_hrd.empl_jobfunddescr_hdr_tbl.Where(a => a.empl_ctrl_nbr == par_empl_ctrl_nbr).FirstOrDefault();
                        data_headerX.approval_id = app_id[0].ToString();
                        data_headerX.approval_status = "S";
                        data_headerX.updated_dttm = DateTime.Now;
                        data_headerX.updated_by = Session["user_id"].ToString();
                        db_hrd.SaveChanges();
                        message = "success";
                    }
                    else
                    {
                        message = validate_percentage.percent_status.ToString().Trim();
                    }
                    
                    
                }
                else if (trans_action == "D")//Delete
                {
                    string par_empl_ctrl_nbr = data.empl_ctrl_nbr;
                    string par_fjd_code = data.fjd_code;

                    empl_jobfunddescr_dtl_tbl data_dtl = db_hrd.empl_jobfunddescr_dtl_tbl.Where(a => a.empl_ctrl_nbr == par_empl_ctrl_nbr && a.fjd_code == par_fjd_code).FirstOrDefault();
                    db_hrd.empl_jobfunddescr_dtl_tbl.Remove(data_dtl);
                    db_hrd.SaveChanges();
                    message = "success";
                }


                return JSON(new { message,data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { erro_message = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        //*********************************************************************//
        // Created By : JMTJR - Created Date :04/23/2021
        // Description : Get generate Updated Key Code
        //*********************************************************************//
        public ActionResult SaveTaskToDatabase(jobfunddescr_task_empl_tbl data, string trans_action)
        {
            try
            {
                db_hrd.Database.CommandTimeout = int.MaxValue;
                string message = "";
                var generated_nbr = db_hrd.sp_generate_appl_nbr_task("jobfunddescr_task_tbl", 10, "task_ctrl_nbr").FirstOrDefault();
                if (trans_action.Trim() == "A") //FOR ADD
                {

                    data.task_ctrl_nbr = (data.task_ctrl_nbr == null || data.task_ctrl_nbr.Trim() == "") ? generated_nbr : data.task_ctrl_nbr;
                    data.created_dttm = DateTime.Now;
                    data.created_by = Session["user_id"].ToString();
                    db_hrd.jobfunddescr_task_empl_tbl.Add(data);
                    db_hrd.SaveChanges();
                    message = "success";
                }
                else if (trans_action.Trim() == "U") //FOR UPDATE OR EDIT
                {
                    jobfunddescr_task_empl_tbl db_data = db_hrd.jobfunddescr_task_empl_tbl.Where(a => a.fjd_code == data.fjd_code && a.task_ctrl_nbr == data.task_ctrl_nbr && a.empl_id == data.empl_id).FirstOrDefault();
                    db_data.task_descr      = data.task_descr.Trim();
                    db_data.updated_dttm    = DateTime.Now;
                    db_data.updated_by      = Session["user_id"].ToString();
                    db_hrd.SaveChanges();
                    message = "success";
                }
                else if (trans_action.Trim() == "D") //FOR DELETE
                {
                    jobfunddescr_task_empl_tbl db_data = db_hrd.jobfunddescr_task_empl_tbl.Where(a => a.fjd_code == data.fjd_code && a.task_ctrl_nbr == data.task_ctrl_nbr && a.empl_id == data.empl_id).FirstOrDefault();

                    db_hrd.jobfunddescr_task_empl_tbl.Remove(db_data);
                    db_hrd.SaveChanges();
                    message = "success";
                }
                return JSON(new { message, generated_nbr }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { erro_message = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : JMTJR - Created Date :04/23/2021
        // Description  : Get generate Updated Key Code
        //*********************************************************************//
        public ActionResult SaveCreateNewHeader( empl_jobfunddescr_hdr_tbl data_header)
        {
            try
            {
                string message = "";
                db_dev.Database.CommandTimeout = int.MaxValue;
                db_hrd.Database.CommandTimeout = Int32.MaxValue;

                var new_appl_nbr            = db_hrd.sp_generate_appl_nbr("empl_jobfunddescr_hdr_tbl", 10, "empl_ctrl_nbr").FirstOrDefault();
                data_header.empl_ctrl_nbr   = new_appl_nbr; //Updated keycode during add...
                data_header.created_dttm    = DateTime.Now;
                data_header.created_by      = Session["user_id"].ToString();
                db_hrd.empl_jobfunddescr_hdr_tbl.Add(data_header);
                db_hrd.SaveChanges();
                message                     = "success";
                return JSON(new { message, data_header }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { erro_message = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : JMTJR - Created Date :04/23/2021
        // Description  : Get Divisions list when department change
        //*********************************************************************//
        public ActionResult GetPosition_list(string par_employment_type, string par_empl_id)
        {
            try
            {
                db_dev.Database.CommandTimeout = int.MaxValue;
                var positions_list = db_hrd.vw_empl_jd_pos.Where(a => a.empl_id == par_empl_id && a.employment_type == par_employment_type).ToList();
                return JSON(new { positions_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { error_message = e.Message }, JsonRequestBehavior.AllowGet);
            }
         
        }


        //*********************************************************************//
        // Created By   : JMTJR - Created Date :04/23/2021
        // Description  : Get Divisions list when department change
        //*********************************************************************//
        public ActionResult GetFilterStatus(string par_position_code, string par_empl_id)
        {
            try
            {
                db_dev.Database.CommandTimeout = int.MaxValue;
                var status_filters = db_hrd.sp_approval_status_hrd(par_position_code,par_empl_id).ToList();
                return JSON(new { status_filters }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { error_message = e.Message }, JsonRequestBehavior.AllowGet);
            }

        }
        //*********************************************************************//
        // Created By   : JMTJR - Created Date :04/23/2021
        // Description  : Get Divisions list when department change
        //*********************************************************************//
        public ActionResult GetEmployee_list(string par_employment_type, string par_department_code,string par_division_code, string par_section)
        {
            try
            {
                string empl_id = Session["user_id"].ToString().Replace("U", "");
                db_dev.Database.CommandTimeout = int.MaxValue;
                var employee_list = db_hrd.sp_employee_list_with_masterdata_list_hrd(par_employment_type, par_department_code, par_division_code, par_section, empl_id).ToList();
                return JSON(new { employee_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { error_message = e.Message }, JsonRequestBehavior.AllowGet);
            }

        }

        //*********************************************************************//
        // Created By   : JMTJR - Created Date :04/23/2021
        // Description  : Get Divisions list when department change
        //*********************************************************************//
        public ActionResult GetDivisions_list(string par_department_code,string emp_type)
        {
            try
            {
                string empl_id = Session["user_id"].ToString().Replace("U", "");
                db_dev.Database.CommandTimeout = int.MaxValue;
                var divisions_list  = db_dev.sp_divisions_tbl_list2(par_department_code).ToList();
                var employee_list   = db_hrd.sp_employee_list_with_masterdata_list_hrd(emp_type, par_department_code, "", "", empl_id).ToList();
                return JSON(new { divisions_list, employee_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new {error_message = e.Message }, JsonRequestBehavior.AllowGet);
            }
        
        }

        //*********************************************************************//
        // Created By   : JMTJR - Created Date :04/23/2021
        // Description  : Get Sections list when Divisions change
        //*********************************************************************//
        public ActionResult GetSections_list(string par_department_code,string par_divsion_code,string emp_type)
        {
            try
            {
                db_dev.Database.CommandTimeout = int.MaxValue;
                string empl_id = Session["user_id"].ToString().Replace("U", "");
                var sections_list = db_dev.sp_sections_tbl_list2(par_department_code, par_divsion_code).ToList();
                var employee_list = db_hrd.sp_employee_list_with_masterdata_list_hrd(emp_type, par_department_code, par_divsion_code, "", empl_id).ToList();
                return JSON(new { sections_list, employee_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { error_message = e.Message }, JsonRequestBehavior.AllowGet);
            }
          
        }

        //*********************************************************************//
        // Created By : VJA - Created Date : 09/19/2019
        // Description: Extract Data 
        //*********************************************************************//
        public ActionResult PreviousValuesonPage_cSSJobDesHDR
            (
            // string par_employment_type
            //,string par_department_code
            //,string par_division_code  
            //,string par_section_code   
            //,string par_fjd_keycode
            //,string par_position_code
            //,string par_position_title
             string par_employment_type
            ,string par_department_code
            ,string par_division_code
            ,string par_section_code
            ,string par_applcode
            ,string par_empl_id
            ,string par_budget_year
            )
        {
            var PreviousValuesonPage_cSSJobDesHDR =       par_employment_type
                                                + "," + par_department_code
                                                + "," + par_division_code  
                                                + "," + par_section_code   
                                                + "," + par_applcode
                                                + "," + par_empl_id
                                                + "," + par_budget_year;

            Session["history_page"]                         = Request.UrlReferrer.ToString();
            Session["PreviousValuesonPage_cSSJobDesHDR"]    = PreviousValuesonPage_cSSJobDesHDR;
            return JSON(PreviousValuesonPage_cSSJobDesHDR, JsonRequestBehavior.AllowGet);
        }
       
    

        protected JsonResult JSON(object data, JsonRequestBehavior behavior)
        {
            return new JsonResult()
            {
                Data                = data,
                ContentType         = "application/json",
                ContentEncoding     = Encoding.UTF8,
                JsonRequestBehavior = behavior,
                MaxJsonLength       = Int32.MaxValue
            };
        }
    }
}