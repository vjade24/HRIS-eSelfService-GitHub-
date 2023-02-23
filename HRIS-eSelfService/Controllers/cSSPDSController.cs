
//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Personal Data Sheet
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JORGE RUSTOM VILLANUEVA       12/18/2019      Code Creation
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

namespace HRIS_eSelfService.Controllers
{
    public class cSSPDSController : Controller
    {
        
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        User_Menu um = new User_Menu();
        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description: Get the User Role
        //*********************************************************************//

        public void GetAllowAccess()
        {
            um.allow_add          = (int)Session["allow_add"];
            um.allow_delete       = (int)Session["allow_delete"];
            um.allow_edit         = (int)Session["allow_edit"];
            um.allow_edit_history = (int)Session["allow_edit_history"];
            um.allow_print        = (int)Session["allow_print"];
            um.allow_view         = (int)Session["allow_view"];
            um.url_name           = Session["url_name"].ToString();
            um.id                 = (int)Session["id"];
            um.menu_name          = Session["menu_name"].ToString();
            um.page_title         = Session["page_title"].ToString();

            um.user_id            = Session["empl_id"].ToString();

            //Session["session_image_byte"] = string.Empty;
        }

        // GET: cSSPDS
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
           
            //return View();
        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description : User Access On Page 
        //*********************************************************************//

        protected ActionResult JSON(object data, JsonRequestBehavior behavior)
        {
            return new JsonResult()
            {
                Data = data,
                ContentType         = "application/json",
                ContentEncoding     = Encoding.UTF8,
                JsonRequestBehavior = behavior,
                MaxJsonLength       = Int32.MaxValue
            };
        }
        



        ////*********************************************************************//
        //// Created By : JRV - Created Date : 09/19/2019
        //// Description : Initialized during PageLoad
        ////*********************************************************************//
        public ActionResult InitializeData()
        {
            GetAllowAccess();
            string empl_id              = "";
            empl_id                     = Session["empl_id"].ToString();
            //Added By Joseph 04/15/2020
            var auto_suggest            = db.sp_position_tbl_list_autosuggest().ToList();
            var departments_list        = db.departments_tbl.Select(a => a.department_name1).ToList();
            var province_list           = db.sp_provinces_tbl_list().ToList();
            var muni_city_list          = db.sp_municipalities_tbl_list2("").ToList();
            var barangay_list           = db.sp_get_barangay_by_municipality("").ToList();
            var csc_type_list           = db.csceligibilty_type_tbl.ToList();
            var lnd_type_list           = db.lnd_types_tbl.Select(a => a.lnd_type_descr).ToList();
            var employment_status_list  = db.employmentstatus_tbl.Select(a => a.employment_status_descr).ToList();
            return Json(new {
                 um
                ,empl_id
                ,auto_suggest
                ,departments_list
                ,csc_type_list
                ,lnd_type_list
                ,employment_status_list
                ,province_list
                ,muni_city_list
                ,barangay_list
            }, JsonRequestBehavior.AllowGet);
        }

        ////*********************************************************************//
        //// Created By : Joseph M. Tombo Jr 04/25/2020
        //// Description : Get Municipality
        ////*********************************************************************//
        public ActionResult get_municipality(string provice_code)
        {
            
             var muni_city_list = db.sp_municipalities_tbl_list2(provice_code).ToList();
             return Json(new { muni_city_list }, JsonRequestBehavior.AllowGet);
        }

        ////*********************************************************************//
        //// Created By : Joseph M. Tombo Jr 04/25/2020
        //// Description : Get Barangay list
        ////*********************************************************************//
        public ActionResult get_barangay(string muni_city_code)
        {

            var barangay_list = db.sp_get_barangay_by_municipality(muni_city_code).ToList();
            return Json(new { barangay_list }, JsonRequestBehavior.AllowGet);
        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description : Get Personal Information and Family Background
        //*********************************************************************//
        public ActionResult GetPersonalInfoData()
        {
            string message = "";
            try
            {
                var ddl_civil_status    = db.civilstatus_tbl.OrderBy(a => a.civil_status).ToList();
                string empl_id          = Session["empl_id"].ToString();
                var sp_personnel_tbl_list_pds = db.sp_personnel_tbl_list_pds(empl_id);
                message                 = "success";
                return Json(new {message,sp_personnel_tbl_list_pds, ddl_civil_status }, JsonRequestBehavior.AllowGet);

            }
            catch (DbEntityValidationException e)
            {
                message = e.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
          
        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description : Get Personal Information and Family Background
        //*********************************************************************//
        public ActionResult GetChildrenInfoData()
        {
            string message = "";
            try
            {
                string empl_id = Session["empl_id"].ToString();
                var personnel_children_tbl = db.personnel_children_tbl.Where(a => a.empl_id == empl_id).ToList();
                message = "success";
                return Json(new { message, personnel_children_tbl }, JsonRequestBehavior.AllowGet);

            }
            catch (DbEntityValidationException e)
            {
                message = e.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }

        }

        ////*********************************************************************//
        //// Created By : JMTJR - Created Date : 01/23/2020
        //// Description : Delete From Database function GENERIC FOR ALL 
        ////*********************************************************************//
        public ActionResult DeleteFromDatabase()
        {
            string  message = "";
                    message = "success";
            //Stram Reader that will get all the Request Input Stream from the sender.
            String jsonString = new StreamReader(this.Request.InputStream).ReadToEnd();
            // Deserialize it to a dictionary
            var dic_json_data = Newtonsoft.Json.JsonConvert.DeserializeObject<Dictionary<String, dynamic>>(jsonString);
            var deleterow = dic_json_data["par_data"];
            try
            {
                Session["history_page"] = "";
                //Delete For Children
                if (dic_json_data["db_table"] == "children_tbl")
                {
                    string empl_id  = deleterow.empl_id;
                    int seq_no      = deleterow.seq_no;
                    var dt          = db.personnel_children_tbl.Where(a =>
                                            a.empl_id == empl_id &&
                                            a.seq_no == seq_no
                                            ).FirstOrDefault();
                    db.personnel_children_tbl.Remove(dt);
                }
                //delete for Work Experience
                else if (dic_json_data["db_table"] == "workexp_tbl")
                {
                    string empl_id  = deleterow.empl_id;
                    int seq_no      = deleterow.seq_no;
                    var dt          = db.personnel_workexprnce_tbl.Where(a =>
                                        a.empl_id   == empl_id &&
                                        a.seq_no    ==  seq_no
                                    ).FirstOrDefault();

                    db.personnel_workexprnce_tbl.Remove(dt);
                }
                else if (dic_json_data["db_table"] == "education_tbl")
                {
                    string  empl_id     = deleterow.empl_id;
                    string  educ_type   = deleterow.educ_type;
                    int     seq_no      = deleterow.seq_no;
                    var dt = db.personnel_educ_tbl.Where(a =>
                                    a.empl_id   == empl_id &&
                                    a.seq_no    == seq_no &&
                                    a.educ_type == educ_type
                                ).FirstOrDefault();
                    db.personnel_educ_tbl.Remove(dt);
                }
                else if (dic_json_data["db_table"] == "csc_tbl")
                {
                    string empl_id  = deleterow.empl_id;
                    int seq_no      = deleterow.seq_no;
                    var dt         = db.personnel_csceligibilty_tbl.Where(a =>
                                        a.empl_id == empl_id &&
                                        a.seq_no == seq_no
                                   ).FirstOrDefault();
                    db.personnel_csceligibilty_tbl.Remove(dt);
                }
                else if (dic_json_data["db_table"] == "workexp_tbl")
                {
                    string empl_id  = deleterow.empl_id;
                    int seq_no      = deleterow.seq_no;
                    var dt          = db.personnel_workexprnce_tbl.Where(a =>
                                        a.empl_id == empl_id &&
                                        a.seq_no == seq_no
                                    ).FirstOrDefault();

                    db.personnel_workexprnce_tbl.Remove(dt);
                }
                else if (dic_json_data["db_table"] == "voluntary_tbl")
                {
                    string empl_id  = deleterow.empl_id;
                    int seq_no      = deleterow.seq_no;
                    var dt          = db.personnel_voluntarywork_tbl.Where(a =>
                                            a.empl_id == empl_id &&
                                            a.seq_no == seq_no
                                    ).FirstOrDefault();

                    db.personnel_voluntarywork_tbl.Remove(dt);
                }
                else if (dic_json_data["db_table"] == "lnd_tbl")
                {
                    string empl_id  = deleterow.empl_id;
                    int seq_no      = deleterow.seq_no;
                    var dt          = db.personnel_learnanddevt_tbl.Where(a =>
                                        a.empl_id == empl_id &&
                                        a.seq_no == seq_no
                                    ).FirstOrDefault();
                    db.personnel_learnanddevt_tbl.Remove(dt);

                    // **********************************************************************
                    // ** VJA - 2022-07-14 - Delete Learning and Development API Table ******
                    // **********************************************************************
                    var dt_api = db.personnel_learnanddevt_api_tbl.Where(a => a.empl_id == empl_id && a.seq_no == seq_no).FirstOrDefault();
                    if (dt_api != null) 
                    { 
                        db.personnel_learnanddevt_api_tbl.Remove(dt_api);
                    }
                    // **********************************************************************

                }
                else if (dic_json_data["db_table"] == "otherinfo_tbl")
                {
                    string empl_id      = deleterow.empl_id;
                    string other_type   = deleterow.other_type;
                    int seq_no          = deleterow.seq_no;
                    var dt              = db.personnelotherinfo_tbl.Where(a =>
                                        a.empl_id   == empl_id &&
                                        a.seq_no    == seq_no &&
                                        a.other_type == other_type
                                    ).FirstOrDefault();

                    db.personnelotherinfo_tbl.Remove(dt);
                }
                else if (dic_json_data["db_table"] == "reference_tbl")
                {
                    string empl_id      = deleterow.empl_id;
                    int seq_no          = deleterow.seq_no;
                    var dt              = db.personnelreference_tbl.Where(a =>
                                           a.empl_id == empl_id &&
                                           a.seq_no == seq_no 
                                    ).FirstOrDefault();

                    db.personnelreference_tbl.Remove(dt);
                }
                db.SaveChangesAsync();
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        ////*********************************************************************//
        //// Created By : JMTJR - Created Date : 01/23/2020
        //// Description : Save to Database for All Add Actions
        ////*********************************************************************//
        public ActionResult SaveDirectToDatabase()
        {
            string message  = "";
            message         = "success";
            String jsonString = new StreamReader(this.Request.InputStream).ReadToEnd();
            // Deserialize it to a dictionary
            var dic_json_data   = Newtonsoft.Json.JsonConvert.DeserializeObject<Dictionary<String, dynamic>>(jsonString);
            var insert_to_table = dic_json_data["par_data"];

            try
            {
                int seq_no      = insert_to_table.seq_no;
                string empl_id  = insert_to_table.empl_id;

                

               if (dic_json_data["db_table"] == "children_tbl")
                {
                    if (dic_json_data["par_action_type"] == "ADD")
                    {
                        personnel_children_tbl tbl_children = new personnel_children_tbl();
                        tbl_children.seq_no         = insert_to_table.seq_no;
                        tbl_children.empl_id        = insert_to_table.empl_id;
                        tbl_children.children_name  = insert_to_table.children_name  == null ? "" : insert_to_table.children_name;
                        tbl_children.birth_date     = insert_to_table.birth_date     == null ? "" : insert_to_table.birth_date;
                        db.personnel_children_tbl.Add(tbl_children);
                    }
                    else if (dic_json_data["par_action_type"] == "EDIT")
                    {
                        var row_child = db.personnel_children_tbl.Where(a => a.seq_no == seq_no && a.empl_id == empl_id).FirstOrDefault();

                        row_child.children_name = insert_to_table.children_name;
                        row_child.birth_date    = insert_to_table.birth_date;
                    }
                }
               else if (dic_json_data["db_table"] == "education_tbl")
                {
                    if (dic_json_data["par_action_type"] == "ADD")
                    {
                        personnel_educ_tbl educ_tbl = new personnel_educ_tbl();
                        educ_tbl.seq_no             = insert_to_table.seq_no;
                        educ_tbl.empl_id            = insert_to_table.empl_id;
                        educ_tbl.basic_educ_deg     = insert_to_table.basic_educ_deg      == null ? "" : insert_to_table.basic_educ_deg;
                        educ_tbl.educ_type          = insert_to_table.educ_type           == null ? "" : insert_to_table.educ_type;
                        educ_tbl.highest_lvl_earned = insert_to_table.highest_lvl_earned  == null ? "" : insert_to_table.highest_lvl_earned;
                        educ_tbl.period_from        = insert_to_table.period_from         == null ? "" : insert_to_table.period_from;
                        educ_tbl.period_to          = insert_to_table.period_to           == null ? "" : insert_to_table.period_to;
                        educ_tbl.schlr_acdmic_rcvd  = insert_to_table.schlr_acdmic_rcvd   == null ? "" : insert_to_table.schlr_acdmic_rcvd;
                        educ_tbl.school_name        = insert_to_table.school_name         == null ? "" : insert_to_table.school_name;
                        educ_tbl.year_graduated     = insert_to_table.year_graduated      == null ? "" : insert_to_table.year_graduated;
                        db.personnel_educ_tbl.Add(educ_tbl);
                    }
                    else if (dic_json_data["par_action_type"] == "EDIT")
                    {
                        string educ_type = insert_to_table.educ_type;
                        var row_educ_tbl = db.personnel_educ_tbl.Where(a => a.seq_no == seq_no && a.empl_id == empl_id && a.educ_type == educ_type).FirstOrDefault();

                        //educ_tbl.seq_no     = par_educ_data.seq_no;
                        //educ_tbl.empl_id    = par_educ_data.empl_id;
                        row_educ_tbl.basic_educ_deg     = insert_to_table.basic_educ_deg      == null ? "" : insert_to_table.basic_educ_deg;
                        row_educ_tbl.educ_type          = insert_to_table.educ_type           == null ? "" : insert_to_table.educ_type;
                        row_educ_tbl.highest_lvl_earned = insert_to_table.highest_lvl_earned  == null ? "" : insert_to_table.highest_lvl_earned;
                        row_educ_tbl.period_from        = insert_to_table.period_from         == null ? "" : insert_to_table.period_from;
                        row_educ_tbl.period_to          = insert_to_table.period_to           == null ? "" : insert_to_table.period_to;
                        row_educ_tbl.schlr_acdmic_rcvd  = insert_to_table.schlr_acdmic_rcvd   == null ? "" : insert_to_table.schlr_acdmic_rcvd;
                        row_educ_tbl.school_name        = insert_to_table.school_name         == null ? "" : insert_to_table.school_name;
                        row_educ_tbl.year_graduated     = insert_to_table.year_graduated      == null ? "" : insert_to_table.year_graduated;
                    }
                }
               else if (dic_json_data["db_table"] == "csc_tbl")
                {
                    if (dic_json_data["par_action_type"] == "ADD")
                    {
                        personnel_csceligibilty_tbl csc_tbl = new personnel_csceligibilty_tbl();
                        csc_tbl.seq_no              = insert_to_table.seq_no;
                        csc_tbl.empl_id             = insert_to_table.empl_id;
                        csc_tbl.cscsrvc_ra1080      = insert_to_table.cscsrvc_ra1080       == null ? "" : insert_to_table.cscsrvc_ra1080;
                        csc_tbl.examination_date    = insert_to_table.examination_date     == null ? "" : insert_to_table.examination_date;
                        csc_tbl.examination_place   = insert_to_table.examination_place    == null ? "" : insert_to_table.examination_place;
                        csc_tbl.number              = insert_to_table.number               == null ? "" : insert_to_table.number;
                        csc_tbl.rating              = insert_to_table.rating               == null ? "" : insert_to_table.rating;
                        csc_tbl.validity_date       = insert_to_table.validity_date        == null ? "" : insert_to_table.validity_date;
                        csc_tbl.csc_type_code       = insert_to_table.csc_type_code        == null ? "" : insert_to_table.csc_type_code;

                        db.personnel_csceligibilty_tbl.Add(csc_tbl);
                    }
                    else if (dic_json_data["par_action_type"] == "EDIT")
                    {
                        var row_csc_tbl = db.personnel_csceligibilty_tbl.Where(a => a.seq_no == seq_no && a.empl_id == empl_id).FirstOrDefault();

                        //row_csc_tbl.seq_no              = par_csc_data.seq_no;
                        //row_csc_tbl.empl_id             = par_csc_data.empl_id;
                        row_csc_tbl.cscsrvc_ra1080      = insert_to_table.cscsrvc_ra1080       == null ? "" : insert_to_table.cscsrvc_ra1080;
                        row_csc_tbl.examination_date    = insert_to_table.examination_date     == null ? "" : insert_to_table.examination_date;
                        row_csc_tbl.examination_place   = insert_to_table.examination_place    == null ? "" : insert_to_table.examination_place;
                        row_csc_tbl.number              = insert_to_table.number               == null ? "" : insert_to_table.number;
                        row_csc_tbl.rating              = insert_to_table.rating               == null ? "" : insert_to_table.rating;
                        row_csc_tbl.validity_date       = insert_to_table.validity_date        == null ? "" : insert_to_table.validity_date;
                        row_csc_tbl.csc_type_code       = insert_to_table.csc_type_code        == null ? "" : insert_to_table.csc_type_code;
                    }
                }
              else if (dic_json_data["db_table"] == "workexp_tbl")
                {
                    if (dic_json_data["par_action_type"] == "ADD")
                    {
                        personnel_workexprnce_tbl workexp_tbl = new personnel_workexprnce_tbl();
                        workexp_tbl.seq_no              = insert_to_table.seq_no;
                        workexp_tbl.empl_id             = insert_to_table.empl_id;
                        workexp_tbl.appt_status         = insert_to_table.appt_status        == null ? ""   : insert_to_table.appt_status;
                        workexp_tbl.dept_agncy_offc_co  = insert_to_table.dept_agncy_offc_co == null ? ""   : insert_to_table.dept_agncy_offc_co;
                        workexp_tbl.gov_srvc            = insert_to_table.gov_srvc           == null ? false: insert_to_table.gov_srvc;
                        workexp_tbl.monthly_salary      = insert_to_table.monthly_salary     == null ? 0    : insert_to_table.monthly_salary;
                        workexp_tbl.position_title      = insert_to_table.position_title     == null ? ""   : insert_to_table.position_title;
                        workexp_tbl.salary_job_grade    = insert_to_table.salary_job_grade   == null ? ""   : insert_to_table.salary_job_grade;
                        workexp_tbl.workexp_from        = insert_to_table.workexp_from       == null ? ""   : insert_to_table.workexp_from;
                        workexp_tbl.workexp_to          = insert_to_table.workexp_to         == null ? ""   : insert_to_table.workexp_to;

                        db.personnel_workexprnce_tbl.Add(workexp_tbl);
                    }
                    else if (dic_json_data["par_action_type"] == "EDIT")
                    {
                        var row_worlexp_tbl = db.personnel_workexprnce_tbl.Where(a => a.seq_no == seq_no && a.empl_id == empl_id).FirstOrDefault();

                        row_worlexp_tbl.appt_status         = insert_to_table.appt_status           == null ? ""    : insert_to_table.appt_status;
                        row_worlexp_tbl.dept_agncy_offc_co  = insert_to_table.dept_agncy_offc_co    == null ? ""    : insert_to_table.dept_agncy_offc_co;
                        row_worlexp_tbl.gov_srvc            = insert_to_table.gov_srvc              == null ? false : insert_to_table.gov_srvc;
                        row_worlexp_tbl.monthly_salary      = insert_to_table.monthly_salary        == null ? 0     : insert_to_table.monthly_salary;
                        row_worlexp_tbl.position_title      = insert_to_table.position_title        == null ? ""    : insert_to_table.position_title;
                        row_worlexp_tbl.salary_job_grade    = insert_to_table.salary_job_grade      == null ? ""    : insert_to_table.salary_job_grade;
                        row_worlexp_tbl.workexp_from        = insert_to_table.workexp_from          == null ? ""    : insert_to_table.workexp_from;
                        row_worlexp_tbl.workexp_to          = insert_to_table.workexp_to            == null ? ""    : insert_to_table.workexp_to;
                    }
                   
                }
                else if (dic_json_data["db_table"] == "voluntary_tbl")
                {
                    if (dic_json_data["par_action_type"] == "ADD")
                    {
                        personnel_voluntarywork_tbl voluntary_tbl = new personnel_voluntarywork_tbl();
                        voluntary_tbl.seq_no                = insert_to_table.seq_no;
                        voluntary_tbl.empl_id               = insert_to_table.empl_id;
                        voluntary_tbl.name_address_org      = insert_to_table.name_address_org   == null ? ""    : insert_to_table.name_address_org;
                        voluntary_tbl.no_of_hrs             = insert_to_table.no_of_hrs          == null ? 0     : insert_to_table.no_of_hrs;
                        voluntary_tbl.position_title        = insert_to_table.position_title     == null ? ""    : insert_to_table.position_title;
                        voluntary_tbl.voluntarywork_from    = insert_to_table.voluntarywork_from == null ? ""    : insert_to_table.voluntarywork_from;
                        voluntary_tbl.voluntarywork_to      = insert_to_table.voluntarywork_to   == null ? ""    : insert_to_table.voluntarywork_to;

                        db.personnel_voluntarywork_tbl.Add(voluntary_tbl);
                    }
                    else if (dic_json_data["par_action_type"] == "EDIT")
                    {
                        var row_voluntary_tbl = db.personnel_voluntarywork_tbl.Where(a => a.seq_no == seq_no && a.empl_id == empl_id).FirstOrDefault();

                        row_voluntary_tbl.name_address_org      = insert_to_table.name_address_org   == null ? ""    : insert_to_table.name_address_org;
                        row_voluntary_tbl.no_of_hrs             = insert_to_table.no_of_hrs          == null ? 0     : insert_to_table.no_of_hrs;
                        row_voluntary_tbl.position_title        = insert_to_table.position_title     == null ? ""    : insert_to_table.position_title;
                        row_voluntary_tbl.voluntarywork_from    = insert_to_table.voluntarywork_from == null ? ""    : insert_to_table.voluntarywork_from;
                        row_voluntary_tbl.voluntarywork_to      = insert_to_table.voluntarywork_to   == null ? ""    : insert_to_table.voluntarywork_to;
                    }
                }
               else if (dic_json_data["db_table"] == "lnd_tbl")
                {
                    if (dic_json_data["par_action_type"] == "ADD")
                    {
                        personnel_learnanddevt_tbl lnd_tbl = new personnel_learnanddevt_tbl();
                        lnd_tbl.seq_no              = insert_to_table.seq_no;
                        lnd_tbl.empl_id             = insert_to_table.empl_id;
                        lnd_tbl.conducted_by        = insert_to_table.conducted_by     == null ? "" : insert_to_table.conducted_by;
                        lnd_tbl.learn_devt_from     = insert_to_table.learn_devt_from  == null ? "" : insert_to_table.learn_devt_from;
                        lnd_tbl.learn_devt_title    = insert_to_table.learn_devt_title == null ? "" : insert_to_table.learn_devt_title;
                        lnd_tbl.learn_devt_to       = insert_to_table.learn_devt_to    == null ? "" : insert_to_table.learn_devt_to;
                        lnd_tbl.learn_devt_type     = insert_to_table.learn_devt_type  == null ? "" : insert_to_table.learn_devt_type;
                        lnd_tbl.no_of_hrs           = insert_to_table.no_of_hrs        == null ? 0  : insert_to_table.no_of_hrs;

                        db.personnel_learnanddevt_tbl.Add(lnd_tbl);
                    }
                    else if (dic_json_data["par_action_type"] == "EDIT")
                    {
                        var row_lnd_tbl = db.personnel_learnanddevt_tbl.Where(a => a.seq_no == seq_no && a.empl_id == empl_id).FirstOrDefault();

                        row_lnd_tbl.conducted_by     = insert_to_table.conducted_by        == null ? "" : insert_to_table.conducted_by;
                        row_lnd_tbl.learn_devt_from  = insert_to_table.learn_devt_from     == null ? "" : insert_to_table.learn_devt_from;
                        row_lnd_tbl.learn_devt_title = insert_to_table.learn_devt_title    == null ? "" : insert_to_table.learn_devt_title;
                        row_lnd_tbl.learn_devt_to    = insert_to_table.learn_devt_to       == null ? "" : insert_to_table.learn_devt_to;
                        row_lnd_tbl.learn_devt_type  = insert_to_table.learn_devt_type     == null ? "" : insert_to_table.learn_devt_type;
                        row_lnd_tbl.no_of_hrs        = insert_to_table.no_of_hrs           == null ? 0  : insert_to_table.no_of_hrs;
                    }
                }
              else if (dic_json_data["db_table"] == "otherinfo_tbl")
                {
                    if (dic_json_data["par_action_type"] == "ADD")
                    {
                        personnelotherinfo_tbl otherinfo_tbl = new personnelotherinfo_tbl();
                        otherinfo_tbl.seq_no        = insert_to_table.seq_no;
                        otherinfo_tbl.empl_id       = insert_to_table.empl_id;
                        otherinfo_tbl.descr         = insert_to_table.descr      == null ? "" : insert_to_table.descr;
                        otherinfo_tbl.other_type    = insert_to_table.other_type == null ? "" : insert_to_table.other_type;

                        db.personnelotherinfo_tbl.Add(otherinfo_tbl);
                    }
                    else if (dic_json_data["par_action_type"] == "EDIT")
                    {
                        string other_type       =  insert_to_table.other_type == null ? "" : insert_to_table.other_type;
                        var row_otherinfo_tbl   = db.personnelotherinfo_tbl.Where(a => a.seq_no == seq_no && a.empl_id == empl_id && a.other_type == other_type).FirstOrDefault();

                        row_otherinfo_tbl.descr         = insert_to_table.descr      == null ? "" : insert_to_table.descr;
                        row_otherinfo_tbl.other_type    = insert_to_table.other_type == null ? "" : insert_to_table.other_type;
                    }
                }
            else if (dic_json_data["db_table"] == "reference_tbl")
                {
                    if (dic_json_data["par_action_type"] == "ADD")
                    {
                        personnelreference_tbl reference_tbl = new personnelreference_tbl();
                        reference_tbl.seq_no        = insert_to_table.seq_no;
                        reference_tbl.empl_id       = insert_to_table.empl_id;
                        reference_tbl.ref_name      = insert_to_table.ref_name      == null ? "" : insert_to_table.ref_name;   
                        reference_tbl.ref_address   = insert_to_table.ref_address   == null ? "" : insert_to_table.ref_address;
                        reference_tbl.ref_contact   = insert_to_table.ref_contact   == null ? "" : insert_to_table.ref_contact;

                        db.personnelreference_tbl.Add(reference_tbl);
                    }
                    else if (dic_json_data["par_action_type"] == "EDIT")
                    {
                        var row_ref_tbl   = db.personnelreference_tbl.Where(a => a.seq_no == seq_no && a.empl_id == empl_id).FirstOrDefault();

                        row_ref_tbl.ref_name    = insert_to_table.ref_name      == null ? "" : insert_to_table.ref_name;
                        row_ref_tbl.ref_address = insert_to_table.ref_address   == null ? "" : insert_to_table.ref_address;
                        row_ref_tbl.ref_contact = insert_to_table.ref_contact   == null ? "" : insert_to_table.ref_contact;
                    }
                }

                db.SaveChanges();
                return Json(new { message, insert_to_table }, JsonRequestBehavior.AllowGet);

            }
            catch (Exception e)
            {
                message = e.Message;
                return Json(new { message, insert_to_table }, JsonRequestBehavior.AllowGet);
            }
        }



        ////*********************************************************************//
        //// Created By : JRV - Created Date : 09/19/2019
        //// Description : Save From Database for Personal Information
        ////*********************************************************************//
        public ActionResult SaveFromDataBasePersonal(string par_empl_id, 
            personnel_tbl personnel_tbl_data, 
            personnel_contact_id_tbl personnel_contact_id_tbl_data, 
            personnelnames_tbl personnelnames_tbl_data,
            personneladdresses_tbl personneladdresses_tbl_data00,
            personneladdresses_tbl personneladdresses_tbl_data01,
            List<personnel_children_tbl> personnel_children_tbl_data
            )
        {

            string message = "";
            try
            {

                //var personnel_names_effective = (from a in db.personnelnames_tbl
                //                      where a.empl_id == par_empl_id
                //                      select a).Max(a => a.effective_date);

                var personnelnames_tbl = (from a in db.personnelnames_tbl
                                                 where a.empl_id == par_empl_id
                                                 select a).OrderByDescending(a => a.effective_date).FirstOrDefault();



                var personnel_tbl = db.personnel_tbl.Where(a => a.empl_id == par_empl_id).FirstOrDefault();

                var personnel_contact_id_tbl  = db.personnel_contact_id_tbl.Where(a => a.empl_id == personnel_tbl_data.empl_id).FirstOrDefault();

                var personneladdresses_tbl_00 = db.personneladdresses_tbl.Where(a => a.empl_id == par_empl_id && a.address_type == "00").OrderByDescending(a => a.effective_date).FirstOrDefault();

                var personneladdresses_tbl_01 = db.personneladdresses_tbl.Where(a => a.empl_id == par_empl_id && a.address_type == "01").OrderByDescending(a => a.effective_date).FirstOrDefault();

                if (personnel_tbl == null)
                {
                    message = "not_found";
                }

                else
                {


                    //PERSONAL INFORMATION
                    personnel_tbl.maiden_name             = personnel_tbl_data.maiden_name          == null ? "" : personnel_tbl_data.maiden_name;
                    personnel_tbl.birth_date              = personnel_tbl_data.birth_date           == null ? Convert.ToDateTime("1900-01-01") : personnel_tbl_data.birth_date;
                    personnel_tbl.birth_place             = personnel_tbl_data.birth_place          == null ? "" : personnel_tbl_data.birth_place;
                    personnel_tbl.gender                  = personnel_tbl_data.gender               == null ? "" : personnel_tbl_data.gender;
                    personnel_tbl.civil_status            = personnel_tbl_data.civil_status         == null ? "" : personnel_tbl_data.civil_status;
                    personnel_tbl.citizenship_type        = personnel_tbl_data.citizenship_type     == null ? false : personnel_tbl_data.citizenship_type;
                    personnel_tbl.citizenship_nature      = personnel_tbl_data.citizenship_nature   == null ? false : personnel_tbl_data.citizenship_nature;
                    personnel_tbl.citizenship_country     = personnel_tbl_data.citizenship_country  == null ? "" : personnel_tbl_data.citizenship_country;
                    personnel_tbl.emp_height              = personnel_tbl_data.emp_height           == null ? "" : personnel_tbl_data.emp_height;
                    personnel_tbl.emp_weight              = personnel_tbl_data.emp_weight           == null ? "" : personnel_tbl_data.emp_weight;

                    personnel_tbl.spouse_last_name        = personnel_tbl_data.spouse_last_name     == null ? "" : personnel_tbl_data.spouse_last_name;
                    personnel_tbl.spouse_first_name       = personnel_tbl_data.spouse_first_name    == null ? "" : personnel_tbl_data.spouse_first_name;
                    personnel_tbl.spouse_middle_name      = personnel_tbl_data.spouse_middle_name   == null ? "" : personnel_tbl_data.spouse_middle_name;
                    personnel_tbl.spouse_suffix_name      = personnel_tbl_data.spouse_suffix_name   == null ? "" : personnel_tbl_data.spouse_suffix_name;
                    personnel_tbl.spouse_occupation       = personnel_tbl_data.spouse_occupation    == null ? "" : personnel_tbl_data.spouse_occupation;
                    personnel_tbl.spouse_employer_name    = personnel_tbl_data.spouse_employer_name == null ? "" : personnel_tbl_data.spouse_employer_name;
                    personnel_tbl.spouse_business_address = personnel_tbl_data.spouse_business_address == null ? "" : personnel_tbl_data.spouse_business_address;
                    personnel_tbl.spouse_tel_no           = personnel_tbl_data.spouse_tel_no        == null ? "" : personnel_tbl_data.spouse_tel_no;

                    //FATHER'S INFORMATION
                    personnel_tbl.father_last_name        = personnel_tbl_data.father_last_name     == null ? "" : personnel_tbl_data.father_last_name;
                    personnel_tbl.father_middle_name      = personnel_tbl_data.father_middle_name   == null ? "" : personnel_tbl_data.father_middle_name;
                    personnel_tbl.father_first_name       = personnel_tbl_data.father_first_name    == null ? "" : personnel_tbl_data.father_first_name;
                    personnel_tbl.father_suffix_name      = personnel_tbl_data.father_suffix_name   == null ? "" : personnel_tbl_data.father_suffix_name;

                    //MOTHER'S INFORMATION
                    personnel_tbl.mother_last_name        = personnel_tbl_data.mother_last_name     == null ? "" : personnel_tbl_data.mother_last_name;
                    personnel_tbl.mother_middle_name      = personnel_tbl_data.mother_middle_name   == null ? "" : personnel_tbl_data.mother_middle_name;
                    personnel_tbl.mother_first_name       = personnel_tbl_data.mother_first_name    == null ? "" : personnel_tbl_data.mother_first_name;

                    personnel_tbl.bir_tin                 = personnel_contact_id_tbl_data.bir_tin   == null ? "" : personnel_contact_id_tbl_data.bir_tin;


                    //PERSONNEL NAMES
                    //personnelnames_tbl.last_name          = personnelnames_tbl_data.last_name       == null ? "" : personnelnames_tbl_data.last_name;
                    //personnelnames_tbl.middle_name        = personnelnames_tbl_data.middle_name     == null ? "" : personnelnames_tbl_data.middle_name;
                    //personnelnames_tbl.first_name         = personnelnames_tbl_data.first_name      == null ? "" : personnelnames_tbl_data.first_name;
                    //personnelnames_tbl.suffix_name        = personnelnames_tbl_data.suffix_name     == null ? "" : personnelnames_tbl_data.suffix_name;
                    //personnelnames_tbl.courtisy_title     = personnelnames_tbl_data.courtisy_title  == null ? "" : personnelnames_tbl_data.courtisy_title;
                    //personnelnames_tbl.postfix_name       = personnelnames_tbl_data.postfix_name    == null ? "" : personnelnames_tbl_data.postfix_name;

                    //CONTACT ID
                    if (personnel_contact_id_tbl == null)
                    {
                        personnel_contact_id_tbl tbl = new personnel_contact_id_tbl();
                        tbl.empl_id             = par_empl_id;
                        tbl.gsis_id_no          = personnel_contact_id_tbl_data.gsis_id_no          == null ? "" : personnel_contact_id_tbl_data.gsis_id_no;
                        tbl.hdmf_id_no          = personnel_contact_id_tbl_data.hdmf_id_no          == null ? "" : personnel_contact_id_tbl_data.hdmf_id_no;
                        tbl.phic_id_no          = personnel_contact_id_tbl_data.phic_id_no          == null ? "" : personnel_contact_id_tbl_data.phic_id_no;
                        tbl.sss_id_no           = personnel_contact_id_tbl_data.sss_id_no           == null ? "" : personnel_contact_id_tbl_data.sss_id_no;
                        tbl.tel_no              = personnel_contact_id_tbl_data.tel_no              == null ? "" : personnel_contact_id_tbl_data.tel_no;
                        tbl.mobile_no           = personnel_contact_id_tbl_data.mobile_no           == null ? "" : personnel_contact_id_tbl_data.mobile_no;
                        tbl.email_add           = personnel_contact_id_tbl_data.email_add           == null ? "" : personnel_contact_id_tbl_data.email_add;
                        tbl.blood_type          = personnel_contact_id_tbl_data.blood_type          == null ? "" : personnel_contact_id_tbl_data.blood_type;
                        tbl.gsis_bp_id_no       = personnel_contact_id_tbl_data.gsis_bp_id_no       == null ? "" : personnel_contact_id_tbl_data.gsis_bp_id_no;
                        tbl.bir_tin = personnel_contact_id_tbl_data.bir_tin                         == null ? "" : personnel_contact_id_tbl_data.bir_tin;
                        db.personnel_contact_id_tbl.Add(tbl);
                    }

                    else
                    {
                        personnel_contact_id_tbl.gsis_id_no    = personnel_contact_id_tbl_data.gsis_id_no == null ? "" : personnel_contact_id_tbl_data.gsis_id_no;
                        personnel_contact_id_tbl.hdmf_id_no    = personnel_contact_id_tbl_data.hdmf_id_no == null ? "" : personnel_contact_id_tbl_data.hdmf_id_no;
                        personnel_contact_id_tbl.phic_id_no    = personnel_contact_id_tbl_data.phic_id_no == null ? "" : personnel_contact_id_tbl_data.phic_id_no;
                        personnel_contact_id_tbl.sss_id_no     = personnel_contact_id_tbl_data.sss_id_no  == null ? "" : personnel_contact_id_tbl_data.sss_id_no;
                        personnel_contact_id_tbl.tel_no        = personnel_contact_id_tbl_data.tel_no     == null ? "" : personnel_contact_id_tbl_data.tel_no;
                        personnel_contact_id_tbl.mobile_no     = personnel_contact_id_tbl_data.mobile_no  == null ? "" : personnel_contact_id_tbl_data.mobile_no;
                        personnel_contact_id_tbl.email_add     = personnel_contact_id_tbl_data.email_add  == null ? "" : personnel_contact_id_tbl_data.email_add;
                        personnel_contact_id_tbl.blood_type    = personnel_contact_id_tbl_data.blood_type == null ? "" : personnel_contact_id_tbl_data.blood_type;
                        personnel_contact_id_tbl.gsis_bp_id_no = personnel_contact_id_tbl_data.gsis_bp_id_no == null ? "" : personnel_contact_id_tbl_data.gsis_bp_id_no;
                        personnel_contact_id_tbl.bir_tin       = personnel_contact_id_tbl_data.bir_tin    == null ? "" : personnel_contact_id_tbl_data.bir_tin;
                    }


                    //ADDRESS RESIDENTIAL

                    if (personneladdresses_tbl_00 == null)
                    {
                        personneladdresses_tbl tbl_address_00 = new personneladdresses_tbl();
                        tbl_address_00.effective_date       = DateTime.Now;
                        tbl_address_00.empl_id              = par_empl_id;
                        tbl_address_00.province_code        = personneladdresses_tbl_data00.province_code == null ? "" : personneladdresses_tbl_data00.province_code;
                        tbl_address_00.municipality_code    = personneladdresses_tbl_data00.municipality_code == null ? "" : personneladdresses_tbl_data00.municipality_code;
                        tbl_address_00.barangay_code        = personneladdresses_tbl_data00.barangay_code == null ? "" : personneladdresses_tbl_data00.barangay_code;
                        tbl_address_00.street               = personneladdresses_tbl_data00.street == null ? "" : personneladdresses_tbl_data00.street;
                        tbl_address_00.purok                = personneladdresses_tbl_data00.purok == null ? "" : personneladdresses_tbl_data00.purok;
                        tbl_address_00.zip_code             = personneladdresses_tbl_data00.zip_code == null ? "" : personneladdresses_tbl_data00.zip_code;
                        tbl_address_00.address_type         = "00";
                        tbl_address_00.houselot_nbr         = personneladdresses_tbl_data00.houselot_nbr == null ? "" : personneladdresses_tbl_data00.houselot_nbr;
                        tbl_address_00.barangay_name        = personneladdresses_tbl_data00.barangay_name == null ? "" : personneladdresses_tbl_data00.barangay_name;
                        tbl_address_00.municipality_name    = personneladdresses_tbl_data00.municipality_name == null ? "" : personneladdresses_tbl_data00.municipality_name;
                        tbl_address_00.province_name        = personneladdresses_tbl_data00.province_name == null ? "" : personneladdresses_tbl_data00.province_name;
                        db.personneladdresses_tbl.Add(tbl_address_00);
                    }

                    else
                    {
                        personneladdresses_tbl_00.street        = personneladdresses_tbl_data00.street   == null ? "" : personneladdresses_tbl_data00.street;
                        personneladdresses_tbl_00.purok         = personneladdresses_tbl_data00.purok    == null ? "" : personneladdresses_tbl_data00.purok;
                        personneladdresses_tbl_00.zip_code      = personneladdresses_tbl_data00.zip_code == null ? "" : personneladdresses_tbl_data00.zip_code;
                        personneladdresses_tbl_00.address_type  = "00";
                        personneladdresses_tbl_00.houselot_nbr  = personneladdresses_tbl_data00.houselot_nbr == null ? "" : personneladdresses_tbl_data00.houselot_nbr;

                        //personneladdresses_tbl_00.barangay_name = personneladdresses_tbl_data00.barangay_name == null ? "" : personneladdresses_tbl_data00.barangay_name;
                        //personneladdresses_tbl_00.municipality_name = personneladdresses_tbl_data00.municipality_name == null ? "" : personneladdresses_tbl_data00.municipality_name;
                        //personneladdresses_tbl_00.province_name = personneladdresses_tbl_data00.province_name == null ? "" : personneladdresses_tbl_data00.province_name;

                        personneladdresses_tbl_00.barangay_code     = personneladdresses_tbl_data00.barangay_code       == null ? "" : personneladdresses_tbl_data00.barangay_code;
                        personneladdresses_tbl_00.municipality_code = personneladdresses_tbl_data00.municipality_code   == null ? "" : personneladdresses_tbl_data00.municipality_code;
                        personneladdresses_tbl_00.province_code     = personneladdresses_tbl_data00.province_code       == null ? "" : personneladdresses_tbl_data00.province_code;
                    }

                    //ADDRESS PERMANENT

                    if (personneladdresses_tbl_01 == null)
                    {
                        personneladdresses_tbl tbl_address_01 = new personneladdresses_tbl();
                        tbl_address_01.effective_date         = DateTime.Now;
                        tbl_address_01.empl_id                = par_empl_id;
                        tbl_address_01.province_code          = personneladdresses_tbl_data01.province_code == null ? "" : personneladdresses_tbl_data01.province_code;
                        tbl_address_01.municipality_code      = personneladdresses_tbl_data01.municipality_code == null ? "" : personneladdresses_tbl_data01.municipality_code;
                        tbl_address_01.barangay_code          = personneladdresses_tbl_data01.barangay_code == null ? "" : personneladdresses_tbl_data01.barangay_code;

                        tbl_address_01.street                 = personneladdresses_tbl_data01.street == null ? "" : personneladdresses_tbl_data01.street;
                        tbl_address_01.purok                  = personneladdresses_tbl_data01.purok == null ? "" : personneladdresses_tbl_data01.purok;
                        tbl_address_01.zip_code               = personneladdresses_tbl_data01.zip_code == null ? "" : personneladdresses_tbl_data01.zip_code;
                        tbl_address_01.address_type           = "01";
                        tbl_address_01.houselot_nbr           = personneladdresses_tbl_data01.houselot_nbr == null ? "" : personneladdresses_tbl_data01.houselot_nbr;
                        tbl_address_01.barangay_name          = personneladdresses_tbl_data01.barangay_name == null ? "" : personneladdresses_tbl_data01.barangay_name;
                        tbl_address_01.municipality_name      = personneladdresses_tbl_data01.municipality_name == null ? "" : personneladdresses_tbl_data01.municipality_name;
                        tbl_address_01.province_name          = personneladdresses_tbl_data01.province_name == null ? "" : personneladdresses_tbl_data01.province_name;

                        //tbl_address_01.barangay_name = personneladdresses_tbl_data01.barangay_name == null ? "" : personneladdresses_tbl_data01.barangay_name;
                        //tbl_address_01.municipality_name = personneladdresses_tbl_data01.municipality_name == null ? "" : personneladdresses_tbl_data01.municipality_name;
                        //tbl_address_01.province_name = personneladdresses_tbl_data01.province_name == null ? "" : personneladdresses_tbl_data01.province_name;
                        db.personneladdresses_tbl.Add(tbl_address_01);
                    }

                    else
                    {
                        personneladdresses_tbl_01.street            = personneladdresses_tbl_data01.street == null ? "" : personneladdresses_tbl_data01.street;
                        personneladdresses_tbl_01.purok             = personneladdresses_tbl_data01.purok == null ? "" : personneladdresses_tbl_data01.purok;
                        personneladdresses_tbl_01.zip_code          = personneladdresses_tbl_data01.zip_code == null ? "" : personneladdresses_tbl_data01.zip_code;
                        personneladdresses_tbl_01.address_type      = "01";
                        personneladdresses_tbl_01.houselot_nbr      = personneladdresses_tbl_data01.houselot_nbr == null ? "" : personneladdresses_tbl_data01.houselot_nbr;
                        personneladdresses_tbl_01.barangay_code     = personneladdresses_tbl_data01.barangay_code == null ? "" : personneladdresses_tbl_data01.barangay_code;
                        personneladdresses_tbl_01.municipality_code = personneladdresses_tbl_data01.municipality_code == null ? "" : personneladdresses_tbl_data01.municipality_code;
                        personneladdresses_tbl_01.province_code = personneladdresses_tbl_data01.province_code == null ? "" : personneladdresses_tbl_data01.province_code;

                        //personneladdresses_tbl_01.barangay_name = personneladdresses_tbl_data01.barangay_name == null ? "" : personneladdresses_tbl_data01.barangay_name;
                        //personneladdresses_tbl_01.municipality_name = personneladdresses_tbl_data01.municipality_name == null ? "" : personneladdresses_tbl_data01.municipality_name;
                        //personneladdresses_tbl_01.province_name = personneladdresses_tbl_data01.province_name == null ? "" : personneladdresses_tbl_data01.province_name;
                    }

                    //var remove_tbl_children = db.personnel_children_tbl.Where(a =>
                    //           a.empl_id == par_empl_id).ToList();

                    db.personnel_children_tbl.RemoveRange(db.personnel_children_tbl.Where( a=> a.empl_id == par_empl_id));
                   
                   
                    if (personnel_children_tbl_data != null)
                    {
                        foreach (var lst in personnel_children_tbl_data)
                        {
                            personnel_children_tbl tbl_children = new personnel_children_tbl();
                            tbl_children.seq_no         = lst.seq_no;
                            tbl_children.empl_id        = lst.empl_id;
                            tbl_children.children_name  = lst.children_name == null ? "" : lst.children_name;
                            tbl_children.birth_date     = lst.birth_date    == null ? ""    : lst.birth_date;
                            db.personnel_children_tbl.Add(tbl_children);
                            
                        }
                    }
                   


                    db.SaveChanges();
                    message = "success";
                }



                var personnel_children_tbl = db.personnel_children_tbl.Where(a => a.empl_id == par_empl_id).ToList();
                message = "success";
                return Json(new { message, personnel_children_tbl }, JsonRequestBehavior.AllowGet);

            }
            catch (DbEntityValidationException e)
            {
                message = e.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }


            
        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description : Save Educational Background and Eligibilty
        //*********************************************************************//

        public ActionResult SaveFromDataBaseEducation(string par_empl_id,List<personnel_educ_tbl> personnel_educ_tbl_data, List<personnel_csceligibilty_tbl> personnel_csceligibilty_tbl_data)
        {
            string message = "";
            try
            {
                db.personnel_educ_tbl.RemoveRange(db.personnel_educ_tbl.Where(a => a.empl_id == par_empl_id));
                db.personnel_csceligibilty_tbl.RemoveRange(db.personnel_csceligibilty_tbl.Where(a => a.empl_id == par_empl_id));

                if (personnel_educ_tbl_data != null)
                {
                    foreach (var lst in personnel_educ_tbl_data)
                    {
                        personnel_educ_tbl tbl_education = new personnel_educ_tbl();
                     
                        tbl_education.seq_no                  = lst.seq_no;
                        tbl_education.empl_id                 = par_empl_id;
                        tbl_education.educ_type               = lst.educ_type           == null ? "" : lst.educ_type;
                        tbl_education.school_name             = lst.school_name         == null ? "" : lst.school_name;
                        tbl_education.basic_educ_deg          = lst.basic_educ_deg      == null ? "" : lst.basic_educ_deg;
                        tbl_education.period_from             = lst.period_from         == null ? "" : lst.period_from;
                        tbl_education.period_to               = lst.period_to           == null ? "" : lst.period_to;
                        tbl_education.highest_lvl_earned      = lst.highest_lvl_earned  == null ? "" : lst.highest_lvl_earned;
                        tbl_education.year_graduated          = lst.year_graduated      == null ? "" : lst.year_graduated;
                        tbl_education.schlr_acdmic_rcvd       = lst.schlr_acdmic_rcvd   == null ? "" : lst.schlr_acdmic_rcvd;

                        db.personnel_educ_tbl.Add(tbl_education);

                    }
                }

                if (personnel_csceligibilty_tbl_data != null)
                {
                    foreach (var lst in personnel_csceligibilty_tbl_data)
                    {
                        personnel_csceligibilty_tbl tbl_eligibility = new personnel_csceligibilty_tbl();
                        tbl_eligibility.seq_no                 = lst.seq_no;
                        tbl_eligibility.empl_id                = par_empl_id;
                        tbl_eligibility.cscsrvc_ra1080         = lst.cscsrvc_ra1080         == null ? "" : lst.cscsrvc_ra1080;
                        tbl_eligibility.rating                 = lst.rating                 == null ? "" : lst.rating;
                        tbl_eligibility.examination_date       = lst.examination_date       == null ? "" : lst.examination_date;
                        tbl_eligibility.examination_place      = lst.examination_place      == null ? "" : lst.examination_place;
                        tbl_eligibility.number                 = lst.number                 == null ? "" : lst.number;
                        tbl_eligibility.validity_date          = lst.validity_date          == null ? "" : lst.validity_date;
                        tbl_eligibility.csc_type_code          = lst.csc_type_code          == null ? "" : lst.csc_type_code;

                        db.personnel_csceligibilty_tbl.Add(tbl_eligibility);

                    }
                }

                db.SaveChanges();
                message = "success";
                return Json(new { message}, JsonRequestBehavior.AllowGet);
            }

            catch (DbEntityValidationException e)
            {
                message = e.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }


        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description : Save Educational Background and Eligibilty
        //*********************************************************************//

        public ActionResult SaveFromDataBaseWork(string par_empl_id, List<personnel_workexprnce_tbl> personnel_workexprnce_tbl_data, List<personnel_voluntarywork_tbl> personnel_voluntarywork_tbl_data)
        {
            string message = "";
            try
            {
                db.personnel_workexprnce_tbl.RemoveRange(db.personnel_workexprnce_tbl.Where(a => a.empl_id == par_empl_id));
                db.personnel_voluntarywork_tbl.RemoveRange(db.personnel_voluntarywork_tbl.Where(a => a.empl_id == par_empl_id));
                if (personnel_workexprnce_tbl_data != null)
                {
                    foreach (var lst in personnel_workexprnce_tbl_data)
                    {
                        personnel_workexprnce_tbl tbl_workexp = new personnel_workexprnce_tbl();
                        tbl_workexp.seq_no              = lst.seq_no;
                        tbl_workexp.empl_id             = par_empl_id;
                        tbl_workexp.workexp_from        = lst.workexp_from          == null ? "" : lst.workexp_from;
                        tbl_workexp.workexp_to          = lst.workexp_to            == null ? "" : lst.workexp_to;
                        tbl_workexp.position_title      = lst.position_title        == null ? "" : lst.position_title;
                        tbl_workexp.dept_agncy_offc_co  = lst.dept_agncy_offc_co    == null ? "" : lst.dept_agncy_offc_co;
                        tbl_workexp.monthly_salary      = lst.monthly_salary        == null ? 0 : lst.monthly_salary;
                        tbl_workexp.salary_job_grade    = lst.salary_job_grade      == null ? "" : lst.salary_job_grade;
                        tbl_workexp.appt_status         = lst.appt_status           == null ? "" : lst.appt_status;
                        tbl_workexp.gov_srvc            = lst.gov_srvc              == null ? false : lst.gov_srvc;

                        db.personnel_workexprnce_tbl.Add(tbl_workexp);

                    }
                }

                if (personnel_voluntarywork_tbl_data != null)
                {
                    foreach (var lst in personnel_voluntarywork_tbl_data)
                    {
                        personnel_voluntarywork_tbl tbl_volwork = new personnel_voluntarywork_tbl();
                        tbl_volwork.seq_no                  = lst.seq_no;
                        tbl_volwork.empl_id                 = par_empl_id;
                        tbl_volwork.voluntarywork_from      = lst.voluntarywork_from == null ? "" : lst.voluntarywork_from;
                        tbl_volwork.voluntarywork_to        = lst.voluntarywork_from == null ? "" : lst.voluntarywork_to;
                        tbl_volwork.name_address_org        = lst.name_address_org == null ? "" : lst.name_address_org;
                        tbl_volwork.no_of_hrs               = lst.no_of_hrs == null ? 0 : lst.no_of_hrs;
                        tbl_volwork.position_title          = lst.position_title == null ? "" : lst.position_title;
                        db.personnel_voluntarywork_tbl.Add(tbl_volwork);

                    }

                }


                db.SaveChanges();
                message = "success";
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }

            catch (DbEntityValidationException e)
            {
                message = e.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description : Save Educational Background and Eligibilty
        //*********************************************************************//

        public ActionResult SaveFromDataBaseLandD(string par_empl_id, List<personnel_learnanddevt_tbl> personnel_learnanddevt_tbl_data, List<personnelotherinfo_tbl> personnelotherinfo_tbl_dataSkills, List<personnelotherinfo_tbl> personnelotherinfo_tbl_dataRecognition, List<personnelotherinfo_tbl> personnelotherinfo_tbl_dataMembership)
        {
            string message = "";
            try
            {
                db.personnel_learnanddevt_tbl.RemoveRange(db.personnel_learnanddevt_tbl.Where(a => a.empl_id == par_empl_id));
                db.personnelotherinfo_tbl.RemoveRange(db.personnelotherinfo_tbl.Where(a => a.empl_id == par_empl_id));
                if (personnel_learnanddevt_tbl_data != null)
                {
                    foreach (var lst in personnel_learnanddevt_tbl_data)
                    {
                        personnel_learnanddevt_tbl tbl_learn = new personnel_learnanddevt_tbl();
                        tbl_learn.seq_no                      = lst.seq_no;
                        tbl_learn.empl_id                     = par_empl_id;
                        tbl_learn.learn_devt_title            = lst.learn_devt_title == null ? "" : lst.learn_devt_title;
                        tbl_learn.learn_devt_from             = lst.learn_devt_from  == null ? "" : lst.learn_devt_from;
                        tbl_learn.learn_devt_to               = lst.learn_devt_to    == null ? "" : lst.learn_devt_to;
                        tbl_learn.no_of_hrs                   = lst.no_of_hrs        == null ? 0 : lst.no_of_hrs;
                        tbl_learn.learn_devt_type             = lst.learn_devt_type  == null ? "" : lst.learn_devt_type;
                        tbl_learn.conducted_by                = lst.conducted_by     == null ? "" : lst.conducted_by;
                        db.personnel_learnanddevt_tbl.Add(tbl_learn);
                    }
                }

                if (personnelotherinfo_tbl_dataSkills != null)
                {
                    foreach (var lst in personnelotherinfo_tbl_dataSkills)
                    {
                        personnelotherinfo_tbl tbl_other = new personnelotherinfo_tbl();
                        tbl_other.seq_no            = lst.seq_no;
                        tbl_other.empl_id           = par_empl_id;
                        tbl_other.other_type        = lst.other_type;
                        tbl_other.descr             = lst.descr == null ? ""  : lst.descr;
                        db.personnelotherinfo_tbl.Add(tbl_other);
                    }
                }

                if (personnelotherinfo_tbl_dataRecognition != null)
                {
                    foreach (var lst in personnelotherinfo_tbl_dataRecognition)
                    {
                        personnelotherinfo_tbl tbl_other = new personnelotherinfo_tbl();
                        tbl_other.seq_no                 = lst.seq_no;
                        tbl_other.empl_id                = par_empl_id;
                        tbl_other.other_type             = lst.other_type;
                        tbl_other.descr                  = lst.descr == null ? "" : lst.descr;
                        db.personnelotherinfo_tbl.Add(tbl_other);
                    }
                }

                if (personnelotherinfo_tbl_dataMembership != null)
                {
                    foreach (var lst in personnelotherinfo_tbl_dataMembership)
                    {
                        personnelotherinfo_tbl tbl_other    = new personnelotherinfo_tbl();
                        tbl_other.seq_no                    = lst.seq_no;
                        tbl_other.empl_id                   = par_empl_id;
                        tbl_other.other_type                = lst.other_type;
                        tbl_other.descr                     = lst.descr == null ? "" : lst.descr;
                        db.personnelotherinfo_tbl.Add(tbl_other);
                    }
                }



                db.SaveChanges();
                message = "success";
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }

            catch (DbEntityValidationException e)
            {
                message = e.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By : JRV - Created Date : 09/19/2019
        // Description : Save Statutory Information and References
        //*********************************************************************//

        public ActionResult SaveFromDataBaseRef(string par_empl_id, List<personnelreference_tbl> personnelreference_tbl_data, personnelstatutory_tbl personnelstatutory_tbl_data)
        {
            string message = "";
            try
            {
                db.personnelreference_tbl.RemoveRange(db.personnelreference_tbl.Where(a => a.empl_id == par_empl_id));
                var personnelstatutory_tbl = db.personnelstatutory_tbl.Where(a => a.empl_id == par_empl_id).FirstOrDefault();

                if (personnelreference_tbl_data != null)
                {
                    foreach (var lst in personnelreference_tbl_data)
                    {
                        personnelreference_tbl tbl_ref = new personnelreference_tbl();
                        tbl_ref.seq_no          = lst.seq_no;
                        tbl_ref.empl_id         = par_empl_id;
                        tbl_ref.ref_name        = lst.ref_name    == null ? "" : lst.ref_name;
                        tbl_ref.ref_address     = lst.ref_address == null ? "" : lst.ref_address;
                        tbl_ref.ref_contact     = lst.ref_contact == null ? "" : lst.ref_contact;
                        db.personnelreference_tbl.Add(tbl_ref);
                    }
                }

                if (personnelstatutory_tbl == null)
                {
                    personnelstatutory_tbl tbl_statutory = new personnelstatutory_tbl();
                    tbl_statutory.empl_id                  = par_empl_id;
                    tbl_statutory.stat_ques34a             = personnelstatutory_tbl_data.stat_ques34a                   == null ? false : personnelstatutory_tbl_data.stat_ques34a;  
                    tbl_statutory.stat_ques34b             = personnelstatutory_tbl_data.stat_ques34b                   == null ? false : personnelstatutory_tbl_data.stat_ques34b;
                    tbl_statutory.stat_ques34_dtl          = personnelstatutory_tbl_data.stat_ques34_dtl                == null ? "" : personnelstatutory_tbl_data.stat_ques34_dtl;
                    tbl_statutory.stat_ques35a             = personnelstatutory_tbl_data.stat_ques35a                   == null ? false : personnelstatutory_tbl_data.stat_ques35a;
                    tbl_statutory.stat_ques35a_dtl         = personnelstatutory_tbl_data.stat_ques35a_dtl               == null ? "" : personnelstatutory_tbl_data.stat_ques35a_dtl;
                    tbl_statutory.stat_ques35b             = personnelstatutory_tbl_data.stat_ques35b                   == null ? false : personnelstatutory_tbl_data.stat_ques35b;
                    tbl_statutory.stat_ques35b_dtls_date   = personnelstatutory_tbl_data.stat_ques35b_dtls_date         == null ? "" : personnelstatutory_tbl_data.stat_ques35b_dtls_date;
                    tbl_statutory.stat_ques35b_dtls_status = personnelstatutory_tbl_data.stat_ques35b_dtls_status       == null ? "" : personnelstatutory_tbl_data.stat_ques35b_dtls_status;
                    tbl_statutory.stat_ques36              = personnelstatutory_tbl_data.stat_ques36                    == null ? false : personnelstatutory_tbl_data.stat_ques36;
                    tbl_statutory.stat_ques36_dtl          = personnelstatutory_tbl_data.stat_ques36_dtl                == null ? "" : personnelstatutory_tbl_data.stat_ques36_dtl;
                    tbl_statutory.stat_ques37              = personnelstatutory_tbl_data.stat_ques37                    == null ? false : personnelstatutory_tbl_data.stat_ques37;
                    tbl_statutory.stat_ques37_dtl          = personnelstatutory_tbl_data.stat_ques37_dtl                == null ? "" : personnelstatutory_tbl_data.stat_ques37_dtl;
                    tbl_statutory.stat_ques38a             = personnelstatutory_tbl_data.stat_ques38a                   == null ? false : personnelstatutory_tbl_data.stat_ques38a;
                    tbl_statutory.stat_ques38a_dtl         = personnelstatutory_tbl_data.stat_ques38a_dtl               == null ? "" : personnelstatutory_tbl_data.stat_ques38a_dtl;
                    tbl_statutory.stat_ques38b             = personnelstatutory_tbl_data.stat_ques38b                   == null ? false : personnelstatutory_tbl_data.stat_ques38b;
                    tbl_statutory.stat_ques38b_dtl         = personnelstatutory_tbl_data.stat_ques38b_dtl               == null ? "" : personnelstatutory_tbl_data.stat_ques38b_dtl;
                    tbl_statutory.stat_ques39              = personnelstatutory_tbl_data.stat_ques39                    == null ? false : personnelstatutory_tbl_data.stat_ques39;
                    tbl_statutory.stat_ques39_dtl          = personnelstatutory_tbl_data.stat_ques39_dtl                == null ? "" : personnelstatutory_tbl_data.stat_ques39_dtl;
                    tbl_statutory.stat_ques40a             = personnelstatutory_tbl_data.stat_ques40a                   == null ? false : personnelstatutory_tbl_data.stat_ques40a;
                    tbl_statutory.stat_ques40a_dtl         = personnelstatutory_tbl_data.stat_ques40a_dtl               == null ? "" : personnelstatutory_tbl_data.stat_ques40a_dtl;
                    tbl_statutory.stat_ques40b             = personnelstatutory_tbl_data.stat_ques40b                   == null ? false : personnelstatutory_tbl_data.stat_ques40b;
                    tbl_statutory.stat_ques40b_dtl         = personnelstatutory_tbl_data.stat_ques40b_dtl               == null ? "" : personnelstatutory_tbl_data.stat_ques40b_dtl;
                    tbl_statutory.stat_ques40c             = personnelstatutory_tbl_data.stat_ques40c                   == null ? false : personnelstatutory_tbl_data.stat_ques40c;
                    tbl_statutory.stat_ques40c_dtl         = personnelstatutory_tbl_data.stat_ques40c_dtl               == null ? "" : personnelstatutory_tbl_data.stat_ques40c_dtl;
                    tbl_statutory.govt_issued_id           = personnelstatutory_tbl_data.govt_issued_id                 == null ? "" : personnelstatutory_tbl_data.govt_issued_id;
                    tbl_statutory.govt_issued_id_nbr       = personnelstatutory_tbl_data.govt_issued_id_nbr             == null ? "" : personnelstatutory_tbl_data.govt_issued_id_nbr;
                    tbl_statutory.date_place_issuance      = personnelstatutory_tbl_data.date_place_issuance            == null ? "" : personnelstatutory_tbl_data.date_place_issuance;
                    tbl_statutory.department_code          = personnelstatutory_tbl_data.department_code                == null ? "" : personnelstatutory_tbl_data.department_code;
                    tbl_statutory.printing_date            = personnelstatutory_tbl_data.printing_date                  == null ? "" : personnelstatutory_tbl_data.printing_date;

                    db.personnelstatutory_tbl.Add(tbl_statutory);
                }

                else
                {
                    personnelstatutory_tbl.stat_ques34a             = personnelstatutory_tbl_data.stat_ques34a              == null ? false : personnelstatutory_tbl_data.stat_ques34a;
                    personnelstatutory_tbl.stat_ques34b             = personnelstatutory_tbl_data.stat_ques34b              == null ? false : personnelstatutory_tbl_data.stat_ques34b;
                    personnelstatutory_tbl.stat_ques34_dtl          = personnelstatutory_tbl_data.stat_ques34_dtl           == null ? "" : personnelstatutory_tbl_data.stat_ques34_dtl;
                    personnelstatutory_tbl.stat_ques35a             = personnelstatutory_tbl_data.stat_ques35a              == null ? false : personnelstatutory_tbl_data.stat_ques35a;
                    personnelstatutory_tbl.stat_ques35a_dtl         = personnelstatutory_tbl_data.stat_ques35a_dtl          == null ? "" : personnelstatutory_tbl_data.stat_ques35a_dtl;
                    personnelstatutory_tbl.stat_ques35b             = personnelstatutory_tbl_data.stat_ques35b              == null ? false : personnelstatutory_tbl_data.stat_ques35b;
                    personnelstatutory_tbl.stat_ques35b_dtls_date   = personnelstatutory_tbl_data.stat_ques35b_dtls_date    == null ? "" : personnelstatutory_tbl_data.stat_ques35b_dtls_date;
                    personnelstatutory_tbl.stat_ques35b_dtls_status = personnelstatutory_tbl_data.stat_ques35b_dtls_status  == null ? "" : personnelstatutory_tbl_data.stat_ques35b_dtls_status;
                    personnelstatutory_tbl.stat_ques36              = personnelstatutory_tbl_data.stat_ques36               == null ? false : personnelstatutory_tbl_data.stat_ques36;
                    personnelstatutory_tbl.stat_ques36_dtl          = personnelstatutory_tbl_data.stat_ques36_dtl           == null ? "" : personnelstatutory_tbl_data.stat_ques36_dtl;
                    personnelstatutory_tbl.stat_ques37              = personnelstatutory_tbl_data.stat_ques37               == null ? false : personnelstatutory_tbl_data.stat_ques37;
                    personnelstatutory_tbl.stat_ques37_dtl          = personnelstatutory_tbl_data.stat_ques37_dtl           == null ? "" : personnelstatutory_tbl_data.stat_ques37_dtl;
                    personnelstatutory_tbl.stat_ques38a             = personnelstatutory_tbl_data.stat_ques38a              == null ? false : personnelstatutory_tbl_data.stat_ques38a;
                    personnelstatutory_tbl.stat_ques38a_dtl         = personnelstatutory_tbl_data.stat_ques38a_dtl          == null ? "" : personnelstatutory_tbl_data.stat_ques38a_dtl;
                    personnelstatutory_tbl.stat_ques38b             = personnelstatutory_tbl_data.stat_ques38b              == null ? false : personnelstatutory_tbl_data.stat_ques38b;
                    personnelstatutory_tbl.stat_ques38b_dtl         = personnelstatutory_tbl_data.stat_ques38b_dtl          == null ? "" : personnelstatutory_tbl_data.stat_ques38b_dtl;
                    personnelstatutory_tbl.stat_ques39              = personnelstatutory_tbl_data.stat_ques39               == null ? false : personnelstatutory_tbl_data.stat_ques39;
                    personnelstatutory_tbl.stat_ques39_dtl          = personnelstatutory_tbl_data.stat_ques39_dtl           == null ? "" : personnelstatutory_tbl_data.stat_ques39_dtl;
                    personnelstatutory_tbl.stat_ques40a             = personnelstatutory_tbl_data.stat_ques40a              == null ? false : personnelstatutory_tbl_data.stat_ques40a;
                    personnelstatutory_tbl.stat_ques40a_dtl         = personnelstatutory_tbl_data.stat_ques40a_dtl          == null ? "" : personnelstatutory_tbl_data.stat_ques40a_dtl;
                    personnelstatutory_tbl.stat_ques40b             = personnelstatutory_tbl_data.stat_ques40b              == null ? false : personnelstatutory_tbl_data.stat_ques40b;
                    personnelstatutory_tbl.stat_ques40b_dtl         = personnelstatutory_tbl_data.stat_ques40b_dtl          == null ? "" : personnelstatutory_tbl_data.stat_ques40b_dtl;
                    personnelstatutory_tbl.stat_ques40c             = personnelstatutory_tbl_data.stat_ques40c              == null ? false : personnelstatutory_tbl_data.stat_ques40c;
                    personnelstatutory_tbl.stat_ques40c_dtl         = personnelstatutory_tbl_data.stat_ques40c_dtl          == null ? "" : personnelstatutory_tbl_data.stat_ques40c_dtl;

                    personnelstatutory_tbl.govt_issued_id           = personnelstatutory_tbl_data.govt_issued_id            == null ? "" : personnelstatutory_tbl_data.govt_issued_id;
                    personnelstatutory_tbl.govt_issued_id_nbr       = personnelstatutory_tbl_data.govt_issued_id_nbr        == null ? "" : personnelstatutory_tbl_data.govt_issued_id_nbr;
                    personnelstatutory_tbl.date_place_issuance      = personnelstatutory_tbl_data.date_place_issuance       == null ? "" : personnelstatutory_tbl_data.date_place_issuance;
                    personnelstatutory_tbl.department_code          = personnelstatutory_tbl_data.department_code           == null ? "" : personnelstatutory_tbl_data.department_code;
                    personnelstatutory_tbl.printing_date            = personnelstatutory_tbl_data.printing_date             == null ? "" : personnelstatutory_tbl_data.printing_date;
                }



                db.SaveChanges();
                message = "success";
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }

            catch (DbEntityValidationException e)
            {
                message = e.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult GetEducationalInfoData()
        {
            string message = "";
            try
            {
                string empl_id = "";



                if (Session["empl_id"].ToString() != null || Session["empl_id"].ToString() != "")
                {
                    empl_id = Session["empl_id"].ToString();
                }

                //var personnel_educ_tbl = db.personnel_educ_tbl.Where(a => a.empl_id == empl_id).ToList();
                
                var educational_level = db.personnel_educ_type_tbl.ToList();

                var personnel_educ_tbl =
                    (from education in db.personnel_educ_tbl
                    join type in db.personnel_educ_type_tbl on education.educ_type equals type.educ_type
                    where education.empl_id == empl_id
                    select new {
                        education.seq_no
                        ,education.empl_id
                        ,education.educ_type
                        ,type.educ_short_descr
                        ,education.school_name
                        ,education.basic_educ_deg
                        ,education.period_from
                        ,education.period_to
                        ,education.highest_lvl_earned
                        ,education.year_graduated
                        ,education.schlr_acdmic_rcvd

                    }).Where(a=>a.empl_id == empl_id).ToList();

                var personnel_csceligibility_tbl = db.personnel_csceligibilty_tbl.Where(a => a.empl_id == empl_id).ToList();


                message = "success";
                return Json(new { message, educational_level, empl_id, personnel_educ_tbl, personnel_csceligibility_tbl }, JsonRequestBehavior.AllowGet);
            }

            catch (DbEntityValidationException e)
            {
                message = e.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult GetWorkInfoData()
        {
            string message = "";
            try
            {
                string empl_id = "";

                if (Session["empl_id"].ToString() != null || Session["empl_id"].ToString() != "")
                {
                    empl_id = Session["empl_id"].ToString();
                }

                var personnel_workexprnce_tbl   = db.personnel_workexprnce_tbl.Where(a => a.empl_id == empl_id).ToList();
                var personnel_voluntarywork_tbl = db.personnel_voluntarywork_tbl.Where(a => a.empl_id == empl_id).ToList();

                message = "success";
                return Json(new { message,empl_id, personnel_workexprnce_tbl, personnel_voluntarywork_tbl }, JsonRequestBehavior.AllowGet);
            }

            catch (DbEntityValidationException e)
            {
                message = e.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult GetLearnInfoData()
        {
            string message = "";
            try
            {
                string empl_id = "";



                if (Session["empl_id"].ToString() != null || Session["empl_id"].ToString() != "")
                {
                    empl_id = Session["empl_id"].ToString();
                }

                var personnel_learnanddevt_tbl = db.personnel_learnanddevt_tbl.Where(a => a.empl_id == empl_id).ToList();
                var personnelotherinfo_tblSkills = db.personnelotherinfo_tbl.Where(a => a.empl_id == empl_id && a.other_type == "S").ToList();
                var personnelotherinfo_tblRecognition = db.personnelotherinfo_tbl.Where(a => a.empl_id == empl_id && a.other_type == "R").ToList();
                var personnelotherinfo_tblMembership = db.personnelotherinfo_tbl.Where(a => a.empl_id == empl_id && a.other_type == "M").ToList();
                message = "success";
                return Json(new { message, empl_id, personnel_learnanddevt_tbl, personnelotherinfo_tblSkills, personnelotherinfo_tblRecognition , personnelotherinfo_tblMembership }, JsonRequestBehavior.AllowGet);
            }

            catch (DbEntityValidationException e)
            {
                message = e.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        

            public ActionResult GetRefInfoData()
        {
            string message = "";
            try
            {
                string empl_id = "";


            
                if (Session["empl_id"].ToString() != null || Session["empl_id"].ToString() != "")
                {
                    empl_id = Session["empl_id"].ToString();
                }
                var personnelreference_tbl = db.personnelreference_tbl.Where(a => a.empl_id == empl_id).ToList();
                var personnelstatutory_tbl = db.personnelstatutory_tbl.Where(a => a.empl_id == empl_id).FirstOrDefault();
                var vw_personnel_admistering_oath = db.vw_personnel_admistering_oath.ToList();
                message = "success";
                return Json(new { message, empl_id, personnelreference_tbl, personnelstatutory_tbl, vw_personnel_admistering_oath }, JsonRequestBehavior.AllowGet);
            }

            catch (DbEntityValidationException e)
            {
                message = e.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        
        public ActionResult UploadImage(string result)
        {
            string message = "";
            try
            {
                Byte[] imageByte;
                string byte_string = result.ToString();
                int length = (byte_string.Length + 1) / 3;
                byte[] arr1 = new byte[length];
                for (int i = 0; i < length; i++)
                {
                    char sixteen = byte_string[3 * i];
                    if (sixteen > '9') sixteen = (char)(sixteen - 'A' + 10);
                    else sixteen -= '0';

                    char ones = byte_string[3 * i + 1];
                    if (ones > '9') ones = (char)(ones - 'A' + 10);
                    else ones -= '0';

                    arr1[i] = (byte)(16 * sixteen + ones);
                }
                imageByte = arr1;

                string empl_id = "";
                if (Session["empl_id"].ToString() != null || Session["empl_id"].ToString() != "")
                {
                    empl_id = Session["empl_id"].ToString();
                }
                var personnel_tbl = db.personnel_tbl.Where(a => a.empl_id == empl_id).FirstOrDefault();

                if (imageByte != null && imageByte.Length > 0)
                {
                    personnel_tbl.empl_photo_img = imageByte;
                    
                }

                db.SaveChanges();
                message = "success";

                return JSON(new { message }, JsonRequestBehavior.AllowGet);
            }

            catch (DbEntityValidationException e)
            {
                message = e.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        //Joseph 
        public ActionResult SetHistoryPage()
        {
            try
            {
                Session["history_page"] = Request.UrlReferrer.ToString();

                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By : VJA - Created Date : 2022-07-12
        // Description : Check and Save the Data coming from ITCD L and D
        //*********************************************************************//
        public ActionResult CheckLearningDev(personnel_learnanddevt_tbl data,personnel_learnanddevt_api_tbl data2)
        {
            string message = "";
            try
            {
                var data_chk = db.personnel_learnanddevt_tbl.Where(a => a.empl_id == data.empl_id).FirstOrDefault();
                var gen_seq_no = 0;
                if (data_chk != null)
                {
                    gen_seq_no = db.personnel_learnanddevt_tbl.Where(a => a.empl_id == data.empl_id).OrderByDescending(b=> b.seq_no).FirstOrDefault().seq_no;
                    gen_seq_no = gen_seq_no + 1;
                }
                data.seq_no             = gen_seq_no            ;
                data.empl_id            = data.empl_id          ;
                data.learn_devt_title   = data.learn_devt_title ;
                data.learn_devt_from    = data.learn_devt_from  ;
                data.learn_devt_to      = data.learn_devt_to    ;
                data.no_of_hrs          = data.no_of_hrs        ;
                data.learn_devt_type    = data.learn_devt_type  ;
                data.conducted_by       = data.conducted_by     ;
                db.personnel_learnanddevt_tbl.Add(data);

                // ***********************************************************************
                // *** VJA - 2022-07-14 - Additional Table for Checking if Exists ********
                // ***********************************************************************
                data2.seq_no            = gen_seq_no;
                data2.empl_id           = data2.empl_id;
                data2.tr_code           = data2.tr_code;
                db.personnel_learnanddevt_api_tbl.Add(data2);
                // ***********************************************************************
                // ***********************************************************************

                db.SaveChanges();
                message = "success";
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }

            catch (Exception e)
            {
                message = e.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By : VJA - Created Date : 2022-07-12
        // Description : Check and Save the Data coming from ITCD L and D
        //*********************************************************************//
        public ActionResult CheckingLearningAndDev_Exists(string p_empl_id, int p_seq_no)
        {
            string message = "";
            try
            {
                var data_chk = db.personnel_learnanddevt_api_tbl.Where(a => a.empl_id == p_empl_id && a.seq_no == p_seq_no).FirstOrDefault();
                if (data_chk != null) 
                { 
                    message = "already-exists";
                }
                return Json(new { message, data_chk }, JsonRequestBehavior.AllowGet);
            }

            catch (Exception e)
            {
                message = e.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }


    }
}