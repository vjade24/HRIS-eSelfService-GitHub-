using HRIS_eSelfService.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Http.Cors;
using System.Web.Mvc;

namespace HRIS_eSelfService.Controllers
{
    [EnableCorsAttribute("http://localhost:15720/TestAPI", "*","*")]
    public class WebAPIController : Controller
    {
        HRIS_DEVEntities db_dev = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        // GET: WebAPI
        public ActionResult Index()
        {
            return View();
        }
      
        [HttpPost]
        public JsonResult HRIS_employees()
        {
            try
            {
                var data = db_ats.vw_personnelnames_tbl_HRIS_ATS.ToList();
                return JSON(new { data, message = "success", icon = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch(Exception ex)
            {
                return Json(new { message = ex.Message,icon="error" }, JsonRequestBehavior.AllowGet);
            }
          
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