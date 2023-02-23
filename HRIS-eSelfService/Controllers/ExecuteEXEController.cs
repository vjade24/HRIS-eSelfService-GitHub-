using HRIS_eSelfService.Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eSelfService.Controllers
{
    public class ExecuteEXEController : Controller
    {
        HRIS_DTREntities db = new HRIS_DTREntities();
        // GET: ExecuteEXE
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult ExtractFromBio(string ip)
        {
            sp_bio_log_info_tbl_ip_Result output = new sp_bio_log_info_tbl_ip_Result();
           
            var icn = "";
            try
            {
                //string executable = System.Configuration.ConfigurationManager.AppSettings["ExecutableFile"];
                // var path ="BioMetrixCore.exe";
                ProcessStartInfo pro = new ProcessStartInfo();
                pro.FileName = Server.MapPath("~/ExecutableFile/BioMetrixCore.exe");
                pro.Arguments =  ip;
                Process proStart = Process.Start(pro);
                proStart.WaitForExit();
               
               
                if(proStart.HasExited == true)
                {
                    proStart.Close();
                    output = db.sp_bio_log_info_tbl_ip(ip).FirstOrDefault();
                    if (output.log_status == true) icn = "success";
                    else icn = "error";
                }

               
                return Json(new {icon = icn, output}, JsonRequestBehavior.AllowGet);
            }
            catch(Exception ex)
            {
                return Json(new { icon = "error", output = ex.Message }, JsonRequestBehavior.AllowGet);
            }
           
           
        }
    }
}