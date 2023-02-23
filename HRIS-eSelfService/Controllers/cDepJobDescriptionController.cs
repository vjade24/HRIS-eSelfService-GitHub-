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
    public class cDepJobDescriptionController : Controller
    {
        HRIS_DEVEntities db_dev             = new HRIS_DEVEntities();
        HRIS_HRDEntities db_hrd             = new HRIS_HRDEntities();
        HRIS_ATSEntities db_ats             = new HRIS_ATSEntities();
        User_Menu um                        = new User_Menu();
        HRIS_STAFFINGEntities db_staffing   = new HRIS_STAFFINGEntities();
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
            
                string dep_code = "";
                string div_code = "";
                string sec_code = "";
                string emp_type = "";

                db_dev.Database.CommandTimeout      = int.MaxValue;
                db_staffing.Database.CommandTimeout = int.MaxValue;

                string empl_id              = Session["user_id"].ToString().Replace("U", "");
                var employment_type_list    = db_dev.vw_employmenttypes_tbl_list.ToList();
                var department_tbl_list     = db_dev.vw_departments_tbl_list.OrderBy(a => a.department_code).ToList();
                string log_in_as_AO         = Session["log_in_as_AO"].ToString();
                var userlogin_masterinfo    = db_hrd.sp_get_employeemaster_information_hrd(empl_id).FirstOrDefault();
                var ao_assignment           = db_dev.vw_ao_employee.Where(a => a.empl_id == empl_id).FirstOrDefault();
                string current_year         = DateTime.Now.Year.ToString();
                var budget_year             = db_dev.sp_plantillapayroll_tbl_list2().Where(a => a.payroll_year == current_year).FirstOrDefault();
                string def_budget_year      = budget_year.budget_code;
                var    budget_yearx         = db_dev.sp_budgetyears_tbl_list().ToList();
                string user_id              = Session["user_id"].ToString();
                var may_asign_dep           = db_staffing.staffing_users_tbl.Where(a => a.user_id == user_id).FirstOrDefault();

                var user_role               = db_ats.sp_get_dtrmanual_role_id(user_id).ToList();

            if (log_in_as_AO == "True" && ao_assignment != null)
            {
                if (may_asign_dep != null)
                {
                    dep_code = may_asign_dep.department_code;
                    var data_dep = db_dev.departments_tbl.Where(a => a.department_code == dep_code).FirstOrDefault();
                    userlogin_masterinfo.department_name1 = data_dep.department_name1;
                    ao_assignment.department_code = data_dep.department_code;
                    userlogin_masterinfo.department_code = data_dep.department_code;

                }
                else
                {
                    dep_code = ao_assignment.department_code;
                }
                div_code = ao_assignment.division_code;
                sec_code = ao_assignment.section_code;
                emp_type = userlogin_masterinfo.employment_type;
            }
            else
            {
                if (may_asign_dep != null)
                {
                    dep_code = may_asign_dep.department_code;
                    var data_dep = db_dev.departments_tbl.Where(a => a.department_code == dep_code).FirstOrDefault();
                    userlogin_masterinfo.department_name1 = data_dep.department_name1;
                    userlogin_masterinfo.department_code = data_dep.department_code;
                    userlogin_masterinfo.department_code = data_dep.department_code;

                }
                else
                {
                    dep_code = userlogin_masterinfo.department_code;
                }
                div_code = userlogin_masterinfo.division_code;
                sec_code = userlogin_masterinfo.section_code;
                emp_type = userlogin_masterinfo.employment_type;

            }

            var datalistgrid = db_staffing.sp_postion_jobdescription_tbl_list(dep_code, def_budget_year, "RE").ToList();
            return JSON(new{um,employment_type_list,department_tbl_list,prevValues = "",log_in_as_AO,userlogin_masterinfo,budget_year,ao_assignment, datalistgrid, def_budget_year, dep_code, may_asign_dep, user_role, budget_yearx }, JsonRequestBehavior.AllowGet);
            

        }

        //*********************************************************************//
        // Created By   : JMTJR - Created Date :04/23/2021
        // Description  : Get Divisions list when department change
        //*********************************************************************//
        public ActionResult GetLisgrid_data(string dep_code, string def_budget_year, string empoyment_type)
        {
            try
            {
                db_staffing.Database.CommandTimeout = int.MaxValue;
                var datalistgrid = db_staffing.sp_postion_jobdescription_tbl_list(dep_code, def_budget_year, empoyment_type).ToList();
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
        public ActionResult GetJobDescription(string par_item_no, string department_code)
        {
            try
            {
                db_staffing.Database.CommandTimeout = int.MaxValue;

                var datalist_jobdescription = db_staffing.sp_reorg_jobdescription_dtl_tbl_list(par_item_no, department_code).ToList();

                return JSON(new { datalist_jobdescription, message = "success" }, JsonRequestBehavior.AllowGet);
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
        public ActionResult GenerateKeyCode(string par_position_code, string par_department_code)
        {
            try
            {
                db_dev.Database.CommandTimeout = int.MaxValue;
                var fjd_code = db_hrd.sp_generate_key_jobfunc_dtl(par_department_code, par_position_code, "").FirstOrDefault();
                return JSON(new { fjd_code }, JsonRequestBehavior.AllowGet);
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
        public ActionResult DeletePositionInPlantilla(string position_code, string department_code, string employment_type, string budget_code, string position_title1)
        {
            try
            {
                db_staffing.Database.CommandTimeout = int.MaxValue;
                var positions_codes = db_staffing.positions_tbl.Where(a => a.position_title1 == position_title1).ToList();

                if (positions_codes != null)
                {
                    if (positions_codes.Count >0)
                    {
                        for (int x=0; x < positions_codes.Count; x++)
                        {
                            string pos_code = positions_codes[x].position_code;
                            string emp_type = positions_codes[x].employment_type;
                            var data = db_staffing.plantilla_tbl.Where(a => a.position_code == pos_code
                                                                       && a.department_code == department_code
                                                                       && a.employment_type == emp_type
                                                                       && a.budget_code == budget_code).ToList();
                            db_staffing.plantilla_tbl.RemoveRange(data);
                            db_staffing.SaveChanges();
                        }
                    }
                }
               

                var data_dtl = db_staffing.reorg_jobdescriptions_tbl.Where(a => a.department_code == department_code
                                                                           && a.position_code == position_code).ToList();

                //if (data != null )
                //{
                //    if (data.Count > 0)
                //    {
                //        db_staffing.plantilla_tbl.RemoveRange(data);
                //        db_staffing.SaveChanges();
                //    }
                //}

                if (data_dtl != null)
                {
                    if (data_dtl.Count > 0)
                    {
                        db_staffing.reorg_jobdescriptions_tbl.RemoveRange(data_dtl);
                        db_staffing.SaveChanges();
                    }
                }

                return JSON(new { message="success"}, JsonRequestBehavior.AllowGet);
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
        public ActionResult DeleteJobDescription(string par_job_ctrl_nbr)
        {
            try
            {
                db_staffing.Database.CommandTimeout = int.MaxValue;

                var data = db_staffing.position_jobdescriptions_tbl.Where(a => a.job_ctrl_nbr == par_job_ctrl_nbr).FirstOrDefault();

                if (data != null)
                {
                        db_staffing.position_jobdescriptions_tbl.Remove(data);
                        db_staffing.SaveChanges();
                }

                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
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
        public ActionResult SaveJobDescription(position_jobdescriptions_tbl data, string trans_action)
        {
            try
            {
                string message = "";
                db_staffing.Database.CommandTimeout = int.MaxValue;

                var new_appl_nbr = db_staffing.sp_generate_appl_nbr("position_jobdescriptions_tbl", 10, "job_ctrl_nbr").FirstOrDefault();

                if (trans_action == "A")
                {
                    data.job_ctrl_nbr   = new_appl_nbr.ToString();
                    data.created_by     = Session["user_id"].ToString();
                    data.created_dttm   = DateTime.Now;

                    db_staffing.position_jobdescriptions_tbl.Add(data);
                    db_staffing.SaveChanges();
                    message = "success";
                }
                else if (trans_action == "U")
                {
                    string par_job_ctrl_nbr = data.job_ctrl_nbr;
                    position_jobdescriptions_tbl data_x = db_staffing.position_jobdescriptions_tbl.Where(a => a.job_ctrl_nbr == par_job_ctrl_nbr).FirstOrDefault();

                    if (data_x != null)
                    {
                        data_x.jobdescr_function    = data.jobdescr_function;
                        data_x.jobdescr_percent     = data.jobdescr_percent;
                        data_x.jobdescr_type        = data.jobdescr_type;
                        data_x.comlvl_code          = data.comlvl_code;

                        data_x.updated_by = Session["user_id"].ToString();
                        data_x.updated_dttm = DateTime.Now;

                        db_staffing.SaveChangesAsync();
                    }
                    message = "success";
                }

                return JSON(new { message, data }, JsonRequestBehavior.AllowGet);
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
        public ActionResult SavePositionToPlantilla(plantilla_tbl data,string budget_code, string employment_type, string trans_action)
        {
            try
            {
                string message = "";
                db_staffing.Database.CommandTimeout = int.MaxValue;

                var item_no = db_staffing.sp_get_latest_item_number(budget_code, employment_type).FirstOrDefault();

                if (item_no != null)
                {
                    data.flag_bir_tax	              =false;  //bit
                    data.flag_representation_allowance=false;	//bit
                    data.flag_transportation_allowance=false;	//bit
                    data.flag_13th_14th_month_pay	  =false;  //bit
                    data.flag_cash_gift	              =false;  //bit
                    data.flag_loyalty_bonus	          =false;  //bit
                    data.flag_productivity_ei	      =false;  //bit
                    data.flag_clothing_allowance	  =false;      //bit
                    data.flag_subsistence_allowance	  =false;  //bit
                    data.flag_laundry_allowance	      =false;  //bit
                    data.flag_pera	                  =false;  //bit
                    data.flag_gsis	                  =false;  //bit
                    data.flag_philhealth	          =false;      //bit
                    data.flag_sif	                  =false;  //bit
                    data.flag_hdmf	                  =false;  //bit
                    data.flag_hazard_pay	          =false;      //bit

                    data.item_no        = item_no;
                    data.item_no_old    = item_no;
                    db_staffing.plantilla_tbl.Add(data);
                    db_staffing.SaveChanges();
                    message = "success";
                }

                return JSON(new { message, data }, JsonRequestBehavior.AllowGet);
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
        public ActionResult GetPosition_list(string par_employment_type, string department_code, string budget_code)
        {
            try
            {
                db_staffing.Database.CommandTimeout = int.MaxValue;
                var positions_list = db_staffing.sp_positions_not_in_departmen_list(department_code,budget_code,par_employment_type).ToList();
                return JSON(new { positions_list }, JsonRequestBehavior.AllowGet);
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
            , string par_department_code
            , string par_division_code
            , string par_section_code
            , string par_applcode
            , string par_empl_id
            , string par_budget_year
            )
        {
            var PreviousValuesonPage_cSSJobDesHDR = par_employment_type
                                                + "," + par_department_code
                                                + "," + par_division_code
                                                + "," + par_section_code
                                                + "," + par_applcode
                                                + "," + par_empl_id
                                                + "," + par_budget_year;

            Session["history_page"] = Request.UrlReferrer.ToString();
            Session["PreviousValuesonPage_cSSJobDesHDR"] = PreviousValuesonPage_cSSJobDesHDR;
            return JSON(PreviousValuesonPage_cSSJobDesHDR, JsonRequestBehavior.AllowGet);
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
    }
}