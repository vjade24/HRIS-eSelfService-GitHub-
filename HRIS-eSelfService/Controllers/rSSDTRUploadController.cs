using HRIS_eSelfService.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eSelfService.Controllers
{
    public class rSSDTRUploadController : Controller
    {
        HRIS_DEVEntities db_dev = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        HRIS_DTREntities db_dtr = new HRIS_DTREntities();
        User_Menu um = new User_Menu();
        private string url = "";
        // GET: rSSDTRUpload
        public ActionResult Index()
        {
          
            User_Menu um = new User_Menu();

            if (Session["PreviousValuesOnPage_rSSDTRUpload"] == null)
                Session["PreviousValuesOnPage_rSSDTRUpload"] = "";
            else if (Session["PreviousValuesOnPage_rSSDTRUpload"].ToString() != string.Empty)
            {
                string[] prevValues = Session["PreviousValuesOnPage_rSSDTRUpload"].ToString().Split(new char[] { ',' });
                ViewBag.prevValues = prevValues;
            }

            if (um != null || um.ToString() != "")
            {
                GetAllowAccess();
            }
            return View(um);
        }
        private User_Menu GetAllowAccess()

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
        // Created Date : 03/05/2020
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult InitializeData()
        {
            try
            {
                GetAllowAccess();

                var log_empl_id = um.user_id = Session["user_id"].ToString().Replace("U","");
                string empl_id = Session["empl_id"].ToString();
                var empl_name = db_dev.sp_employee_list_dept_ao(empl_id);
                var day_lst = db_dtr.sp_dtr_from_bio_tbl_dates(Convert.ToInt32(DateTime.Now.Year), Convert.ToInt32(DateTime.Now.Month)).ToList();

                string[] prevValues = null;
                if (Session["PreviousValuesOnPage_rSSDTRUpload"] != null || Session["PreviousValuesOnPage_rSSDTRUpload"].ToString() != "")
                {
                    prevValues = Session["PreviousValuesOnPage_rSSDTRUpload"].ToString().Split(new char[] { ',' });
                }


                return JSON(new { message = "success", um, empl_name , prevValues, day_lst }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 03/05/2020
        // Description  : Initialized during pageload
        //*********************************************************************//
        public ActionResult DTRUploadToTable(
            string p_location
            , string p_filename
            , string p_year
            , string p_month
            ,string p_upload_type)
        {
            url = System.Web.HttpContext.Current.Request.Url.AbsoluteUri;
            var extracttype = "";
            var location = "";
            try
            {
                db_dtr.Database.CommandTimeout = int.MaxValue;
                var user_id     = Session["user_id"].ToString();

               
                location = Server.MapPath("../DTR_Upload/");
                // location = @"Y:\dtr_upload\";

                var process_biodata_2dtr_stg = new object();

                var upload_file_from_bio_to_stg = db_dtr.sp_upload_file_from_bio_to_stg(location, p_filename, p_year, p_month, user_id).ToList();
                var process_nbr = upload_file_from_bio_to_stg[0].process_nbr;
                var bioterminal = upload_file_from_bio_to_stg[0].bioterminal;

                if (upload_file_from_bio_to_stg[0].extract_type == "")
                {
                    extracttype = p_upload_type;
                }
                else
                {
                    extracttype = upload_file_from_bio_to_stg[0].extract_type;
                }
            

                if (extracttype == "1")
                {
                    if (bioterminal == "114") // PASIAN
                    {
                        process_biodata_2dtr_stg = db_dtr.sp_process_biodata_2dtr_stg_shift_pagro_pasian(process_nbr, Session["user_id"].ToString()).ToList();
                    }
                    else
                    {
                        process_biodata_2dtr_stg = db_dtr.sp_process_biodata_2dtr_stg(process_nbr, Session["user_id"].ToString()).ToList();
                    }
                    
                    process_biodata_2dtr_stg = db_dtr.sp_process_biodata_2dtr_stg_shift(process_nbr, Session["user_id"].ToString()).ToList();
                }

                else if (extracttype == "2")
                {
                    process_biodata_2dtr_stg = db_dtr.sp_process_biodata_2dtr_stg_in(process_nbr, Session["user_id"].ToString()).ToList();
                }

                else if (extracttype == "3")
                {
                    process_biodata_2dtr_stg = db_dtr.sp_process_biodata_2dtr_stg_out(process_nbr, Session["user_id"].ToString()).ToList();
                }

               

                return JSON(new { message = "success", process_biodata_2dtr_stg }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 05/05/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult FilterPageGrid(
            DateTime p_dtr_date
            , int p_year
            , int p_month)
        {
            try
            {
                var log_empl_id     = um.user_id = Session["user_id"].ToString().Replace("U", "");
                var filteredGrid    = db_dtr.sp_dtr_from_bio_tbl_list(p_dtr_date, log_empl_id).ToList();
                var day_lst         = db_dtr.sp_dtr_from_bio_tbl_dates(p_year, p_month).ToList();

                return JSON(new { message = "success", filteredGrid, day_lst }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 05/05/2020
        // Description  : Filter Page Grid For Employee
        //*********************************************************************//
        public ActionResult FilterPageGrid2(
            string p_empl_id
            , string p_year
            , string p_month)
        {
            try
            {
                var filteredGrid2 = db_dtr.sp_dtr_from_bio_tbl_list2(p_empl_id, p_year, p_month).ToList();

                return JSON(new { message = "success", filteredGrid2 }, JsonRequestBehavior.AllowGet);
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
        // Created By   : Lorraine I. Ale 
        // Created Date : 12/04/2020
        // Description  : Upload physical File to Server Folder
        //*********************************************************************//
        [HttpPost]
        public ContentResult Upload()
        {
            //string f_effective_date = Request["effective_date"];
            //string section_nbr = Request["section_nbr"];
            //string rcrd_type = Request["rcrd_type"];
            //string gradelvl = Request["gradelvl"];

            //string empl_directory = "";
            string project_path   = "";
            string current_path   = "";
            string file_name = "";

            string[] content = new string[2];
            string pathx = "";
            
            string path = Server.MapPath("~/DTR_Upload/");
            // string path = @"Y:\dtr_upload\";
            if (!Directory.Exists(path))
            {
                Directory.CreateDirectory(path);
            }
            
            foreach (string key in Request.Files)
            {
                HttpPostedFileBase postedFile = Request.Files[key];

                //empl_directory = "DTR-" + DateTime.Now.ToString("yyyy-MM-dd");
                project_path     = Server.MapPath("~/DTR_Upload");
                // project_path = @"Y:\dtr_upload\";
                current_path = "";

                if (!Directory.Exists(System.IO.Path.Combine(project_path)))
                {
                    System.IO.Directory.CreateDirectory(System.IO.Path.Combine(project_path));
                    current_path = Server.MapPath("~/DTR_Upload/");
                    // current_path = @"Y:\dtr_upload\";
                }
                else
                {
                    current_path = Server.MapPath("~/DTR_Upload/");
                    // current_path = @"Y:\dtr_upload\";
                }
                postedFile.SaveAs(current_path + "/" + postedFile.FileName.ToString());
                pathx = "../DTR_Upload/" + postedFile.FileName.ToString();
                file_name = postedFile.FileName.ToString();
                break;
            }

            return Content("success:" + pathx);
        }

        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 03/02/2020
        // Description  : Edit existing record table
        //*********************************************************************//
        public ActionResult TransferDTRTimeEntry(
            dtr_from_bio_tbl data
            , string p_field_to_up
            , string p_field_value
            , string p_field_to_up2
            , string p_field_value2)
        {
            try
            {
                var transfer_script = db_dtr.sp_dtr_from_bio_tbl_update(data.dtr_date
                                                                    , data.empl_id
                                                                    , data.processed_by_user
                                                                    , p_field_to_up
                                                                    , p_field_value
                                                                    , p_field_to_up2
                                                                    , p_field_value2
                                                                    ,"0").ToList();

                return Json(new { message = "success", transfer_script }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 03/02/2020
        // Description  : Edit existing record table
        //*********************************************************************//
        public ActionResult DeleteDTRTimeEntry(
            dtr_from_bio_tbl data
            , string p_field_to_up)
        {
            try
            {
                var delete_script = db_dtr.sp_dtr_from_bio_tbl_update(data.dtr_date
                                                                    , data.empl_id
                                                                    , data.processed_by_user
                                                                    , p_field_to_up
                                                                    , ""
                                                                    , ""
                                                                    , ""
                                                                    , "1").ToList();

                return Json(new { message = "success", delete_script }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 03/02/2020
        // Description  : Edit existing record table
        //*********************************************************************//
        public ActionResult GenerateDTREmployee(
            string par_year
            , string par_month
            , string par_empl_id
            , string par_view_type
            , string par_department_code
            , string par_employment_type
            )
        {
            try
            {
                var session_user_id = Session["user_id"].ToString();
                db_ats.Database.CommandTimeout = int.MaxValue;

                var checkShiftFlag = db_ats.sp_check_shiftsched(par_year, par_month, par_empl_id).ToList();
                var generate_dtr = new object();

                if (checkShiftFlag[0].shift_flag == "1")
                {
                    generate_dtr = db_ats.sp_generate_empl_dtr(par_year, par_month, par_empl_id, par_view_type, par_department_code, par_employment_type, session_user_id).ToList();
                }
                else if (checkShiftFlag[0].shift_flag == "2")
                {
                    generate_dtr = db_ats.sp_generate_empl_dtr_shift(par_year, par_month, par_empl_id, par_view_type, par_department_code, par_employment_type, session_user_id).ToList();
                }

                
                
                return JSON(new { message = "success", generate_dtr }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult PreviousValuesOnPage_rSSDTRUpload
            (
             string par_tab
            , string par_month
            , string par_year
            , string par_day
            , string par_empl_id
            )
        {
            var PreviousValuesOnPage_rSSDTRUpload = par_tab
                                                + "," + par_month
                                                + "," + par_year
                                                + "," + par_day
                                                + "," + par_empl_id;


            Session["history_page"] = Request.UrlReferrer.ToString();
            Session["PreviousValuesOnPage_rSSDTRUpload"] = PreviousValuesOnPage_rSSDTRUpload;
            return Json(PreviousValuesOnPage_rSSDTRUpload, JsonRequestBehavior.AllowGet);
        }

    }
}