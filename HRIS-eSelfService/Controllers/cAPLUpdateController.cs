using HRIS_Common;
using HRIS_eSelfService.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eSelfService.Controllers
{
    public class cAPLUpdateController : Controller
    { 
         HRIS_DEVEntities db = new HRIS_DEVEntities();
        CommonDB Cmn = new CommonDB();
        // GET: cAPLUpdate
        ActionResult Index()
        {
            return View();
        }
        
        public ActionResult UpdateAPL_Info(string username, string password, string flag)
        {
            var message = "";
            var user_id = Session["user_id"].ToString();

            try
            {
                var pass = Cmn.EncryptString(password.Trim(), Cmn.CONST_WORDENCRYPTOR);
                var apl = db.sp_get_credentials_apl(username.Trim(), pass).FirstOrDefault();

                if (apl == null)
                {
                    throw new Exception("Applicant not found");
                }
                var empl_id = user_id.Substring(1, (user_id.Count()-1)); ;
                var info_ctrl_nbr = apl.info_ctrl_nbr;
                if (flag == "1")
                {
                    var exec = db.sp_update_personinfo_apl(empl_id, info_ctrl_nbr).FirstOrDefault();
                    message = exec.output_message;
                    if(exec.output_flag == "0") throw new Exception(message);
                }
                if (flag == "2")
                {
                    var exec = db.sp_update_educsc_apl(empl_id, info_ctrl_nbr).FirstOrDefault();
                    message = exec.output_message;
                    if (exec.output_flag == "0") throw new Exception(message);
                }
                if (flag == "3")
                {
                    var exec = db.sp_update_workexp_volun_apl(empl_id, info_ctrl_nbr).FirstOrDefault();
                    message = exec.output_message;
                    if (exec.output_flag == "0") throw new Exception(message);
                }
                if (flag == "4")
                {
                    var exec = db.sp_update_learndvt_apl(empl_id, info_ctrl_nbr).FirstOrDefault();
                    message = exec.output_message;
                    if (exec.output_flag == "0") throw new Exception(message);
                }
                if (flag == "5")
                {
                    var exec = db.sp_update_statref_apl(empl_id, info_ctrl_nbr).FirstOrDefault();
                    message = exec.output_message;
                    if (exec.output_flag == "0") throw new Exception(message);
                }
              


                return Json(new { icon = "success", message = "Successfully Updated" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { icon = "error", message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

      
    }
}