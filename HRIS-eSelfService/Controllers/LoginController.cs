using HRIS_Common;
using HRIS_eSelfService.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Text.RegularExpressions;
using System.Net;
using System.Net.NetworkInformation;
using System.Data.Entity.Validation;
using System.Net.Mail;

namespace HRIS_eSelfService.Controllers
{
   
    public class LoginController : Controller
    {
        HRIS_DEVEntities db     = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        CommonDB Cmn            = new CommonDB();
        Dev_Version_Name dvn    = new Dev_Version_Name();
        public ActionResult Index()
        {
            Session["history_page"] = "";
            dvn.DVName = "(" + db.Database.Connection.DataSource.ToString().Split('\\')[db.Database.Connection.DataSource.ToString().Split('\\').Length - 1] + ")";
            if (dvn.DVName == "(PRD2014)")
            {
                dvn.DVName = "";
            }

            if (Session["user_id"] != null)
            {
                return RedirectToAction("Index", "cMainPage");
            }
            else
            {

                return View(dvn);
            }
        }
        // GET: Login
       

        // GET: Login
      
        public ActionResult GetUserIsLogin()
        {

            if (Session["user_id"] != null)
            {
                return Json(new { data = Session["user_id"], success = 1 }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { data = 0, success = 0 }, JsonRequestBehavior.AllowGet);
            }


        }
        public ActionResult isUserLogin()
        {
            if (Session["user_id"] != null)
            {
                var user = Session["user_id"];
                return Json(new { user = user, isLogin = 1 }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { user = "", isLogin = 0 }, JsonRequestBehavior.AllowGet);
            }
        }
        public ActionResult Login_Validation(string username, string password)
        {

            try
            {
                var change_pass         = "";
                var log_in_flag         = "";
                var log_in_flag_descr   = "";
                //var data = db.sp_user_login(username.Trim(), Cmn.EncryptString(password.Trim(), Cmn.CONST_WORDENCRYPTOR), 9).FirstOrDefault();
                //Updated By: Joseph M. Tombo Jr 02/24/2020
                var data = db.sp_user_login_SS(username.Trim(), Cmn.EncryptString(password.Trim(), Cmn.CONST_WORDENCRYPTOR)).FirstOrDefault();
                var cmt = db.user_cmt_tbl.Where(a => a.user_id == username.Trim()).ToList();

                var dep = db.departments_tbl.Where(a => a.department_code == data.department_code).FirstOrDefault();

              
                if (data.change_password == false)
                {
                    if (data.log_in_flag == "Y")
                    {
                        Session["user_id"]          = data.user_id;
                        Session["user_profile"]     = data.empl_photo;
                        Session["empl_id"]          = data.empl_id;
                        Session["employee_name"]    = data.employee_name;
                        Session["first_name"]       = data.first_name;
                        Session["last_name"]        = data.last_name;
                        Session["middle_name"]      = data.middle_name;
                        Session["suffix_name"]      = data.suffix_name;
                        Session["photo"]            = data.empl_photo;
                        Session["owner_fullname"]   = data.employee_name;
                        Session["budget_code"]      = data.budget_code;
                        Session["department_code"]  = data.department_code;
                        Session["employment_type"]  = data.employment_type;

                        Session["log_in_as_AO"]      = data.log_in_as_AO;

                        Session["department_short_name"] = dep != null ? dep.department_short_name:""; //UPDATED BY JOSEPH


                        var pa_data = db_ats.to_final_approver_tbl.Where(a => a.user_id == data.user_id).FirstOrDefault();
                        if (pa_data != null)
                        {
                            var pa_data_maxlen = pa_data.user_id.ToString().Length;
                            Session["pa_approver"] = pa_data.user_id.ToString().Substring(1, (pa_data_maxlen - 1));
                        }
                        else
                        {

                            Session["pa_approver"] = "";
                        }

                    }

                    change_pass                 = data.change_password.ToString();
                    log_in_flag                 = data.log_in_flag;
                    log_in_flag_descr           = data.log_in_flag_descr;

                }
                else
                {
                    change_pass         = data.change_password.ToString();
                    log_in_flag         = data.log_in_flag;
                    log_in_flag_descr   = data.log_in_flag_descr;
                }

                return Json(new { data = data, success = 1,change_pass = change_pass,log_in_flag = log_in_flag, log_in_flag_descr = log_in_flag_descr, cmt, dep }, JsonRequestBehavior.AllowGet);


            }
            catch (Exception ex)
            {
                return Json(new { data = ex.Message, success = 0 }, JsonRequestBehavior.AllowGet);

            }

        }

        public ActionResult logout()
        {
            Session.Clear();
            if (Session["user_id"] == null)
            {
                return Json(new { session = 0, success = 1 }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { session = 1, success = 0 }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult CheckSessionLogin()
        {
            if (Session["user_id"] == null)
            {
                return Json("expire", JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json("active", JsonRequestBehavior.AllowGet);
            }
        }


        //*************************************************************************
        //  BEGIN Joseph M. Tombo Jr- 10/09/2018 - Change Passwird
        //*************************************************************************
        public ActionResult change_password(string inputed_password,string user_name)
        {
            var success = true;
            var message = "";
            try
            {
                string encrypted_password           = Cmn.EncryptString(inputed_password, Cmn.CONST_WORDENCRYPTOR);
                string usernam_gg                   = user_name;
                var userprofile_tblX                = db.usersprofile_tbl.Where(a => a.user_id == usernam_gg).FirstOrDefault();
                userprofile_tblX.user_password      = encrypted_password;
                userprofile_tblX.change_password    = false;
                userprofile_tblX.last_updated_date  = DateTime.Now;
                userprofile_tblX.last_updated_by    = user_name;
                db.SaveChanges();
            }
            catch (Exception e)
            {
                message = e.Message;
                success = false;
            }


            return Json(new { success,message}, JsonRequestBehavior.AllowGet);
        }

        //*************************************************************************
        //  BEGIN Joseph M. Tombo Jr- 10/09/2018 - Password Validation
        //*************************************************************************
        public bool IsValidPassword(string inputed_password)
        {
            bool is_valid           = true;
            var hasNumber           = new Regex(@"[0-9]+");
            var hasUpperChar        = new Regex(@"[A-Z]+");
            var hasMinimum8Chars    = new Regex(@".{8,}");
            var hasSpecialChar      = new Regex(@"[$!@*_.]+");

            if (hasNumber.IsMatch(inputed_password) && hasUpperChar.IsMatch(inputed_password) && hasMinimum8Chars.IsMatch(inputed_password) && hasSpecialChar.IsMatch(inputed_password))
            {
                is_valid = true;
            }
            else
            {
                //ViewState["msg_password_validator"] = "Password required at least 8 characters, 1 uppercase, and 1 special character. ";
                is_valid = false;
            }
            return is_valid;
        }

        //*************************************************************************
        //  LORRAINE I. ALE - 12/02/2020 - GET NETWORK, BROWSER AND LOCATION INFO 
        //*************************************************************************
        public ActionResult GetNetworkDetails()
        {
            try
            {
                // Check if user is connected to Internet
                var connected = System.Net.NetworkInformation.NetworkInterface.GetIsNetworkAvailable();

                string strHostName = System.Net.Dns.GetHostName();

                IPHostEntry ipEntry = System.Net.Dns.GetHostEntry(strHostName);
                IPAddress[] addr = ipEntry.AddressList.ToArray();

                var hostname = ipEntry.HostName.ToString();
                var ip = addr[1].ToString();

                //var def_gateway = NetworkInterface
                //                .GetAllNetworkInterfaces()
                //                .Where(n => n.OperationalStatus == OperationalStatus.Up)
                //                .Where(n => n.NetworkInterfaceType != NetworkInterfaceType.Loopback)
                //                .SelectMany(n => n.GetIPProperties()?.GatewayAddresses)
                //                .Select(g => g?.Address)
                //                .Where(a => a != null)
                //                .FirstOrDefault()
                //                .ToString();
                var def_gateway = "";

                HttpRequest req = System.Web.HttpContext.Current.Request;
                string browserName = req.Browser.Browser;

                string user_agent = req.UserAgent;

                return Json(new { message = "success", connected, hostname, ip, def_gateway, browserName, user_agent }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }



        //edited by marvin 2021-01-24
        public ActionResult getUserNameContact(string user_id)
        {
            string emplid = user_id.Substring(1, 4);
            try
            {
                var users_name = db.personnelnames_tbl.Where(a => a.empl_id == emplid).FirstOrDefault();
                var user_contact = db.personnel_contact_id_tbl.Where(a => a.empl_id == emplid).FirstOrDefault();
                Session["recov_email"] = user_contact.email_add;
                Session["recov_mobile_no"] = user_contact.mobile_no;

                var encry_mobile = encryptMobileNoAsterisk(user_contact.mobile_no);
                var encry_email = encryptGmailAsterisk(user_contact.email_add);

                return Json(new { message = "success", icon = "success", encry_email, encry_mobile, users_name }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }



        //*********************************************************************//
        // Created By   : Marvin Olita 
        // Created Date : 01/20/2021
        // Description  : Encrypt email with asterisk
        //*********************************************************************//
        public String encryptGmailAsterisk(string email)
        {
            var final_str = "";
            try
            {
                int indexAt = email.IndexOf('@');
                int indexlastAst = indexAt - 3;
                var charlen = email.Length;
                for (var x = 0; x < charlen; x++)
                {
                    if (x > 2 && x < indexlastAst)
                    {
                        final_str = final_str + '*';
                    }
                    else
                    {
                        final_str = final_str + email[x];
                    }
                }


                return final_str;
            }
            catch (Exception e)
            {
                return e.Message;
            }
        }
        //*********************************************************************//
        // Created By   : Marvin Olita 
        // Created Date : 01/20/2021
        // Description  : Encrypt email with asterisk
        //*********************************************************************//
        public String encryptMobileNoAsterisk(string mobile)
        {
            var final_str = "";
            try
            {

                var charlen = mobile.Length;
                int indexlastAst = charlen - 2;

                for (var x = 0; x < charlen; x++)
                {
                    if (x > 2 && x < indexlastAst)
                    {
                        final_str = final_str + '*';
                    }
                    else
                    {
                        final_str = final_str + mobile[x];
                    }
                }


                return final_str;
            }
            catch (Exception e)
            {
                return e.Message;
            }
        }
        public ActionResult sendPasswordCredential(string user_id, string recovery, string passcode)
        {
            var message = "";
            var icon = "";
            var email = Session["recov_email"].ToString();
            // var mobile = Session["recov_mobile"].ToString();
            //password = Cmn.DecryptString(dbexst.user_password.Trim(), Cmn.CONST_WORDENCRYPTOR);
            string emplid = user_id.Substring(1, 4);
            try
            {

                if (recovery == "rex_email")
                {
                    if (SendToEmail2(email, user_id, passcode) == "success")
                    {
                        message = "PassCode is successfully sent to your email address!";
                        icon = "success";
                    }
                    else
                    {
                        message = "Message sent failed!";
                        icon = "error";
                    }

                }
                else
                {
                    message = "Phone recovery is under development, please select email recovery method!";
                    icon = "warning";
                }


                return Json(new { message, icon }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {

                return Json(new { message = e.Message }, JsonRequestBehavior.AllowGet);
            }

        }


        //*********************************************************************//
        // Created By   : Marvin Olita 
        // Created Date : 01/20/2021
        // Description  : Send Notification credential to applicant email
        //*********************************************************************//
        public String SendToEmail2(string email, string username, string password)
        {

            try
            {

                var email_settup = db.sp_send_email_notification_PAY(email, username, password).FirstOrDefault();
                using (MailMessage mm = new MailMessage(email_settup.email_from, email_settup.email_to))
                {

                    mm.Subject = email_settup.email_subject;
                    mm.Body = email_settup.email_body;

                    mm.IsBodyHtml = true;
                    using (SmtpClient smtp = new SmtpClient())
                    {
                        smtp.Host = email_settup.email_smtp;
                        smtp.EnableSsl = (bool)email_settup.email_enable_ssl;
                        NetworkCredential NetworkCred = new NetworkCredential(email_settup.email_from, email_settup.email_from_pass);
                        smtp.UseDefaultCredentials = (bool)email_settup.email_default_credentials;
                        smtp.Credentials = NetworkCred;
                        smtp.Port = (int)email_settup.email_port;
                        smtp.Send(mm);
                    }
                }
                return "success";


            }
            catch (Exception e)
            {

                return e.Message;
            }
        }

        public ActionResult ResetPassword(string user_id, string passcode, string new_password)
        {

            var message = "";
            var icon = "";
            var email = Session["recov_email"].ToString();

            try
            {
                var encry_password = Cmn.EncryptString(new_password, Cmn.CONST_WORDENCRYPTOR);
                var reset = db.sp_validate_reset_password(user_id, passcode, encry_password).FirstOrDefault();

                return Json(new { message, icon, reset }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {

                return Json(new { message = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult verify_Passcode_status(string user_id)
        {
            var message = "";
            var icon = "";


            try
            {
                message = "";

                var ps = db.resetpassword_cred_tbl.Where(a => a.user_id == user_id);
                if (ps.Count() > 0)
                {
                    var passcode_data = db.sp_resetpassword_cred_tbl(user_id).FirstOrDefault();
                    icon = "success";
                    return Json(new { message, icon, passcode_data }, JsonRequestBehavior.AllowGet);
                }
                else
                {

                    icon = "warning";
                    return Json(new { message, icon }, JsonRequestBehavior.AllowGet);
                }


            }
            catch (Exception e)
            {

                return Json(new { message = e.Message, icon="error" }, JsonRequestBehavior.AllowGet);
            }
        }
        
            public String DbEntityValidationExceptionError(DbEntityValidationException e)
        {
            string message = "";
            foreach (var eve in e.EntityValidationErrors)
            {
                Console.WriteLine("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
                    eve.Entry.Entity.GetType().Name, eve.Entry.State);
                foreach (var ve in eve.ValidationErrors)
                {
                    message = "- Property: \"{0}\", Error: \"{1}\"" + ve.PropertyName + "  :  " + ve.ErrorMessage;
                    Console.WriteLine("- Property: \"{0}\", Error: \"{1}\"",
                        ve.PropertyName, ve.ErrorMessage);
                }
            }
            return message;
        }
    }
}