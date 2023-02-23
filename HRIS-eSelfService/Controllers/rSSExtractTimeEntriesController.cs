//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for DTR Printing
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// JORGE RUSTOM VILLANUEVA   09/15/2020      Code Creation
//**********************************************************************************


using HRIS_eSelfService.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.IO;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Text;
using System.Drawing;
using Excel = Microsoft.Office.Interop.Excel;
using System.Runtime.InteropServices;
using System.Reflection;

namespace HRIS_eSelfService.Controllers
{
    public class rSSExtractTimeEntriesController : Controller
    {
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();

        // GET: rSSDTRPrinting
        public ActionResult Index()
        {
            User_Menu um = new User_Menu();
            if (Session["user_id"] == null || Session["user_id"].ToString().Trim() == "")
            {
                return RedirectToAction("Index", "Login");
            }
            //if (um != null || um.ToString() != "")
            //{
            //    um.allow_add = (int)Session["allow_add"];
            //    um.allow_delete = (int)Session["allow_delete"];
            //    um.allow_edit = (int)Session["allow_edit"];
            //    um.allow_edit_history = (int)Session["allow_edit_history"];
            //    um.allow_print = (int)Session["allow_print"];
            //    um.allow_view = (int)Session["allow_view"];
            //    um.url_name = Session["url_name"].ToString();
            //    um.id = (int)Session["id"];
            //    um.menu_name = Session["menu_name"].ToString();
            //    um.page_title = Session["page_title"].ToString();
            //}
            //return View(um);
            return View();
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
                ContentType = "application/json",
                ContentEncoding = Encoding.UTF8,
                JsonRequestBehavior = behavior,
                MaxJsonLength = Int32.MaxValue
            };
        }

        public ActionResult UserAccessOnPage(int id)
        {
            Session["user_menu_id"] = id;
            return Json("success", JsonRequestBehavior.AllowGet);
        }
        public ActionResult InitializeData()
        {

            var session_user_id = Session["user_id"].ToString();
            var session_user_profile = Session["user_profile"].ToString();
            var session_empl_id = Session["empl_id"].ToString();
            var session_employee_name = Session["employee_name"].ToString();
            var session_first_name = Session["first_name"].ToString();
            var session_last_name = Session["last_name"].ToString();
            var session_middle_name = Session["middle_name"].ToString();
            var session_suffix_name = Session["suffix_name"].ToString();
            var session_photo = Session["photo"].ToString();
            var session_owner_fullname = Session["owner_fullname"].ToString();
            var session_budget_code = Session["budget_code"].ToString();
            var session_department_code = Session["department_code"].ToString();
            var session_employment_type = Session["employment_type"].ToString();

            var dept_list       = db.vw_departments_tbl_list.ToList();
            var sub_dep_list    = db.sp_subdepartments_tbl_list().ToList();
            var division_list   = db.divisions_tbl.Where(a => a.department_code == session_department_code).ToList();
            var section_list    = db.sections_tbl.Where(a => a.department_code == session_department_code).ToList();

            string view_type = "0";
            string year_dtr = Convert.ToString(DateTime.Now.Year);
            string month_dtr = DateTime.Now.Month > 9 ? Convert.ToString(DateTime.Now.Month) : "0" + Convert.ToString(DateTime.Now.Month);
            string department_dtr = session_department_code;

            if (Session["view_type_dtr"] != null)
            {
                view_type = Session["view_type_dtr"].ToString();
                year_dtr = Session["year_dtr"].ToString();
                month_dtr = Session["month_dtr"].ToString();
                department_dtr = Session["department_dtr"].ToString();
            }

            return Json(new
            {
                session_user_id
                ,
                session_user_profile
                ,
                session_empl_id
                ,
                session_employee_name
                ,
                session_first_name
                ,
                session_last_name
                ,
                session_middle_name
                ,
                session_suffix_name
                ,
                session_photo
                ,
                session_owner_fullname
                ,
                session_budget_code
                ,
                session_department_code
                ,
                session_employment_type
                ,
                dept_list
                ,
                view_type
                ,
                year_dtr
                ,
                month_dtr
                ,
                department_dtr
                ,
                sub_dep_list
                ,
                division_list
                ,
                section_list

            }, JsonRequestBehavior.AllowGet);

        }

        public ActionResult RetriveData
            (string par_year
            , string par_month
            , string par_department_code
            , string par_sub_department_code
            , string par_division_code
            , string par_section_code
            )
        {
            try
            {
                var sp_extract_timeentries_rep = db_ats.sp_extract_timeentries_rep(par_year, par_month, par_department_code, par_sub_department_code, par_division_code, par_section_code).ToList();
                Excel.Application xlApp = new Excel.Application();
                Excel.Workbook xlWorkBook = xlApp.Workbooks.Open(Server.MapPath("~/TemplateExcelFile/DTR_EXTRACT.xlsx"));
                Excel.Worksheet xlWorkSheet = xlWorkBook.Sheets[xlWorkBook.Sheets.Count];
                xlApp.DisplayAlerts = false;

                var filePath = "";
                string message = "";
                decimal start_row = 2;
                decimal start_row_i = start_row;
                for (var i = 0; i < sp_extract_timeentries_rep.Count(); i++)
                {

                    xlWorkSheet.get_Range("A1" + start_row, "F1" + start_row).Borders.Color = Color.Black;
                    xlWorkSheet.get_Range("A" + start_row_i, "F" + start_row_i).Borders.Color = Color.Black;
                    xlWorkSheet.get_Range("A" + start_row, "F" + start_row).Copy(Missing.Value);
                    xlWorkSheet.get_Range("A" + start_row_i, "F" + start_row_i).PasteSpecial(Excel.XlPasteType.xlPasteAll,
                        Excel.XlPasteSpecialOperation.xlPasteSpecialOperationNone, false, false);

                    xlWorkSheet.Cells[start_row_i, 1] = sp_extract_timeentries_rep[i].dtr_date;
                    xlWorkSheet.Cells[start_row_i, 2] = sp_extract_timeentries_rep[i].empl_id;
                    xlWorkSheet.Cells[start_row_i, 3] = sp_extract_timeentries_rep[i].time_in_am;
                    xlWorkSheet.Cells[start_row_i, 4] = sp_extract_timeentries_rep[i].time_out_am;
                    xlWorkSheet.Cells[start_row_i, 5] = sp_extract_timeentries_rep[i].time_in_pm;
                    xlWorkSheet.Cells[start_row_i, 6] = sp_extract_timeentries_rep[i].time_out_pm;

                    start_row_i = start_row_i + 1;

                }

                string filename = "";
                filename = par_year.Trim() + "-" + par_month.Trim() + "-DTR-Extract" + ".xlsx";
                xlWorkBook.SaveAs(Server.MapPath("~/UploadedFile/" + filename), Excel.XlFileFormat.xlOpenXMLWorkbook,
                    Missing.Value, Missing.Value, Missing.Value, Missing.Value, Excel.XlSaveAsAccessMode.xlNoChange,
                    Excel.XlSaveConflictResolution.xlLocalSessionChanges, Missing.Value, Missing.Value,
                    Missing.Value, Missing.Value);
                xlWorkBook.Close();
                xlApp.Quit();
                Marshal.ReleaseComObject(xlWorkSheet);
                Marshal.ReleaseComObject(xlWorkBook);
                Marshal.ReleaseComObject(xlApp);

                filePath = "/UploadedFile/" + filename;


                Session["history_page"] = Request.UrlReferrer.ToString();
                return JSON(new
                {
                    sp_extract_timeentries_rep
                    ,
                    message = "success"
                    ,
                    filePath
                }, JsonRequestBehavior.AllowGet);
            }

            catch (Exception ex)
            {
                return Json(new { message = ex.Message }, JsonRequestBehavior.AllowGet);
            }

            

        }

    }
}