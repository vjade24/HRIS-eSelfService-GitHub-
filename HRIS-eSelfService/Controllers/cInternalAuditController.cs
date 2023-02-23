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
    public class cInternalAuditController : Controller
    {
        HRIS_DEVEntities db2    = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        User_Menu um            = new User_Menu();

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
            }
            return View(um);
        }
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
        public ActionResult InitializeData(string par_year)
        {
            var message = "";
            var empl_id = Session["empl_id"].ToString();
            var user_id = Session["user_id"].ToString();
            var url_name = Session["url_name"].ToString().Trim();
            try
            {
                var user_perpage = db2.user_perpage_tbl.Where(a => a.user_id == user_id && a.url_name == url_name).ToList().FirstOrDefault();
                var data        = db2.sp_payroll_dtr_viewing_list(par_year, "","","").ToList();
                var empltype    = db2.employmenttypes_tbl.ToList();
                var template    = db2.payrolltemplate_tbl.Where(a=> a.employment_type == "").ToList();
                var department  = db2.departments_tbl.Where(a=> a.department_code == "20" || a.department_code == "21" || a.department_code == "22" || a.department_code == "23" || a.department_code == "24").ToList();
                message         = "success";
                return Json(new { message, data, empltype , template, department, user_id, user_perpage }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { message = e.InnerException.Message.ToString() }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult RetriveTemplate(string employment_type)
        {
            var message = "";
            try
            {
                var template = db2.payrolltemplate_tbl.Where(a => a.employment_type == employment_type & (a.payrolltemplate_code == "007" ||
                                                                                                          a.payrolltemplate_code == "008" ||
                                                                                                          a.payrolltemplate_code == "009" ||
                                                                                                          a.payrolltemplate_code == "010" ||
                                                                                                          a.payrolltemplate_code == "011"  )).ToList();
                message = "success";
                return Json(new { message, template }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                message = e.InnerException.Message;
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult RetriveGrid(string payroll_year, string payroll_month, string par_payrolltemplate_code, string department_code)
        {
            var message = "";
            try
            {
                var data = db2.sp_payroll_dtr_viewing_list(payroll_year, payroll_month, par_payrolltemplate_code, department_code).GroupBy(
                                                                            p => p.payroll_registry_nbr,
                                                                            p => p,
                                                                            (key, g) => new
                                                                            {
                                                                                payroll_registry_nbr    = key,
                                                                                gross_pay               = g.Sum(x=> x.gross_pay),
                                                                                Grouped                 = g.ToList()
                                                                            });

                message = "success";
                return Json(new { message, data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                message = e.InnerException.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult RetriveData
             (string par_year
            , string par_month
            , string par_empl_id
            , string par_view_type
            , string par_department_code
            )
        {
            var user_id             = Session["user_id"].ToString();
            object sp_report        = new object();
            sp_report               = db_ats.sp_dtr_rep(par_year, par_month, par_empl_id, par_view_type, par_department_code, user_id).ToList();
            return JSON(new{sp_report}, JsonRequestBehavior.AllowGet);

        }
    }
}