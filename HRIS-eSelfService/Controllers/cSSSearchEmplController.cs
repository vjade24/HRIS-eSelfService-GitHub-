using HRIS_eSelfService.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eSelfService.Controllers
{
    public class cSSSearchEmplController : Controller
    {
       HRIS_DEVEntities db = new HRIS_DEVEntities();
        // GET: cSSSearchEmpl
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult InitializeData()
        {
            return View();
        }
       public ActionResult findEmployee(string lastname, string firstname )
       {
        
           try
           {
               var empl_data = db.sp_search_employee(lastname, firstname).ToList();
               return Json(new { message = "success",icon="success", empl_data}, JsonRequestBehavior.AllowGet);
           }
           catch(Exception ex)
           {
               return Json(new { message = ex.Message, icon="error" }, JsonRequestBehavior.AllowGet);
           }
       
       }
     
    }
}