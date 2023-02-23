using HRIS_eSelfService.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eSelfService.Controllers
{
    public class MenuController : Controller
    {
       
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        HRIS_DTREntities db_dtr = new HRIS_DTREntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        // GET: Menu
        public ActionResult Index()
        {
            return View();
        }

        protected JsonResult JSON(object data, JsonRequestBehavior behavior)
        {
            return new JsonResult()
            {
                Data                = data,
                ContentType         = "application/json",
                ContentEncoding     = Encoding.UTF8,
                JsonRequestBehavior = behavior,
                MaxJsonLength       = Int32.MaxValue
            };
        }
        public ActionResult GetMenuList()
        {
         
            List<sp_user_menu_access_role_list_SS_Result> data = new List<sp_user_menu_access_role_list_SS_Result>();
            Session["history_page"] = "";
            //menulst = (List<Object>)Session["menu"];
            if (Session["user_id"] != null)
            {

                var empl_id = Session["empl_id"].ToString();

                var emp_photo_byte_arr = db.personnel_tbl.Where(a => a.empl_id == empl_id).FirstOrDefault().empl_photo_img;
                
                string imreBase64Data = "";
                string imgDataURL = "";

                var favoritelist = db.menus_tbl.ToList();
                string current_url = Request.UrlReferrer.ToString().Replace("Index", "").Trim('/').Split('/')[Request.UrlReferrer.ToString().Replace("Index", "").Trim('/').Split('/').Count() - 1].ToString();
                int already_in_fav = 0;
                //***************convert byte array to image***********************************
                if (emp_photo_byte_arr != null)
                {
                    imreBase64Data = Convert.ToBase64String(emp_photo_byte_arr);
                    imgDataURL = string.Format("data:image/png;base64,{0}", imreBase64Data);
                }
                else
                {
                    imgDataURL = "../ResourcesImages/upload_profile.png";
                }
                //*****************************************************************************
                //var data = db.sp_user_menu_access_role_list(Session["user_id"].ToString(), 9).ToList();
               
                if(Session["menu_id"] != null)
                {
                    data = db.sp_user_menu_access_role_list_SS(Session["user_id"].ToString()).ToList();
                    CreateMenuSession(data);
                }
                else
                {
                    data = CreateMenuData();
                }
               
                for (int x = 0; x < data.Count; x++)
                {
                    if (data[x].url_name == current_url)
                    {
                        if (data[x].favorites_mode == 1) already_in_fav = 1;
                    }
                }
                
                var User_Name = Session["first_name"].ToString() + " " + Session["last_name"];
                var dep_name = Session["department_short_name"].ToString();
                if (Session["expanded"] != null) return JSON(new { data = data, expanded = Session["expanded"], photo = imgDataURL, success = 1, username = User_Name, current_url, already_in_fav, dep_name }, JsonRequestBehavior.AllowGet);
                else return JSON(new { data = data, expanded = 0, photo = imgDataURL, success = 1, username = User_Name, current_url, already_in_fav, favoritelist, dep_name }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return RedirectToAction("Index", "Login");
                //return Json(new { data = 0, success = 0 }, JsonRequestBehavior.AllowGet);
            }

        }

        public ActionResult getUserImageId()
        {
            var empl_id = Session["empl_id"].ToString();
            var emp_photo_byte_arr = db.personnel_tbl.Where(a => a.empl_id == empl_id).FirstOrDefault().empl_photo_img;

            return Json(emp_photo_byte_arr, JsonRequestBehavior.AllowGet);
        }

        
        public ActionResult expandedAdd(string id, int menulevel)
        {
            List<String> ls = new List<string>();
            List<String> ls2 = new List<string>();
            if (menulevel == 1) Session["expanded"] = null;
            if (Session["expanded"] != null)
            {
                ls = (List<String>)Session["expanded"];
                foreach (string l in ls)
                {
                    ls2.Add(l);
                }
                ls2.Add(id);
                Session["expanded"] = ls2;
            }
            else
            {
                ls2.Add(id);
                Session["expanded"] = ls2;

            }
            return Json(Session["expanded"], JsonRequestBehavior.AllowGet);

        }
        public ActionResult expandedRemove(string id)
        {
            List<String> ls = new List<string>();

            if (Session["expanded"] != null)
            {
                ls = (List<String>)Session["expanded"];
                ls.Remove(id);
                Session["expanded"] = ls;
            }
            return Json(Session["expanded"], JsonRequestBehavior.AllowGet);
        }
        public ActionResult returnSesion()
        {

            return Json(Session["expanded"], JsonRequestBehavior.AllowGet);

        }
        public ActionResult UserAccessOnPage(sp_user_menu_access_role_list_Result list)
        {
            Session["allow_add"] = list.allow_add;
            Session["allow_delete"] = list.allow_delete;
            Session["allow_edit"] = list.allow_edit;
            Session["allow_edit_history"] = list.allow_edit_history;
            Session["allow_print"] = list.allow_print;
            Session["allow_view"] = list.allow_view;
            Session["url_name"] = list.url_name;
            Session["id"] = list.id;
            Session["menu_name"] = list.menu_name;
            Session["page_title"] = list.page_title;
            Session["role_id"] = list.role_id;
            return Json("success", JsonRequestBehavior.AllowGet);
        }
        public ActionResult AddOrRemoveToFavorites(string action_mode)
        {
            try
            {
                string user_id = Session["user_id"].ToString();
                string current_page = Request.UrlReferrer.ToString().Replace("Index", "").Trim('/').Split('/')[Request.UrlReferrer.ToString().Replace("Index", "").Trim('/').Split('/').Count() - 1].ToString();
                var data = db.sp_add_remove_menu_favorites(user_id, current_page, action_mode).ToList();
                return JSON(new { success = 1, data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return JSON(new { success = 0, e.Message }, JsonRequestBehavior.AllowGet);
            }
        }



        // ------------------------------- CHANGE BY JADE - 2020-08-13------------------------

        public ActionResult GetSesssionMenuList()
        {
            
            var date = DateTime.Now.ToString("yyyy-MM-dd");
            try
            {
                // Added By: Lorraine I. Ale --- Date Added: 2021-01-17
                var empl_id     = Session["empl_id"].ToString();
                var year        = DateTime.Now.Year.ToString();
                var month       = DateTime.Now.Month.ToString();

                var announcement = db.sp_get_announcement_tbl(date, 1).ToList();

                var as_alerts = db_dtr.sp_as_alerts(empl_id, year, month).ToList();

                var menu = CreateMenuData();

                //var getNotificationList = db_ats.sp_get_notification_list(Session["user_id"].ToString(), 9).ToList();

                if (Session["expanded"] != null) return JSON(new
                {
                    menu,
                    expanded = Session["expanded"],
                    success = 1,
                    as_alerts,
                    announcement  
                }, JsonRequestBehavior.AllowGet);
                else return JSON(new
                {
                    menu,
                    expanded = 0,
                    success = 1,
                    as_alerts,
                    announcement
                    
                }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                return Json(new { message = DbEntityValidationExceptionError(e), success = 0 }, JsonRequestBehavior.AllowGet);
            }
        }
        public String IFNULL(string val, string sub)
        {
            if (val == null)
            {
                return sub;
            }
            else
            {
                return val;
            }
        }
        public Int32 IFNULL(int val, int sub)
        {
            if (val == 0)
            {
                return sub;
            }
            else
            {
                return val;
            }
        }
        public Double IFNULL(double val, double sub)
        {
            if (val == 0)
            {
                return sub;
            }
            else
            {
                return val;
            }
        }
        public String STREMPTYTOZERO(string val)
        {
            if (val == "")
            {
                return "0";
            }
            else
            {
                return val;
            }
        }
        public string  CreateMenuSession(List<sp_user_menu_access_role_list_SS_Result> data)
        {
            Session["menu_count"] = data.Count();
            var dataLen = data.Count();
            var menu_id = "";
            for (var x = 0; x < dataLen; x++)
            {
                Session[data[x].id.ToString()] = MenuRow(data[x]);
                menu_id = menu_id + data[x].id.ToString();
                if (x < (dataLen - 1))
                {
                    menu_id = menu_id + ",";
                }
            }
            Session["menu_id"] = menu_id;
            return menu_id;
        }

        public String MenuRow(sp_user_menu_access_role_list_SS_Result data)
        {
            var str = ""
             + "allow_add:" + data.allow_add
             + ",allow_delete:" + data.allow_delete
             + ",allow_edit:" + data.allow_edit
             + ",allow_edit_history:" + data.allow_edit_history
             + ",allow_print:" + data.allow_print
             + ",allow_view:" + data.allow_view
             + ",favorites_mode:" + data.favorites_mode
             + ",id:" + data.id
             + ",menu_icon:" + data.menu_icon
             + ",menu_id_link:" + data.menu_id_link
             + ",menu_level:" + data.menu_level
             + ",menu_name:" + data.menu_name
             + ",menu_sort_order:" + data.menu_sort_order
             + ",module_id:" + data.module_id
             + ",page_title:" + data.page_title
             + ",role_id:" + data.role_id
             + ",status:" + data.status
             + ",url_name:" + data.url_name
             + ",user_id:" + data.user_id;

            return str;
        }
        public String splitKeyValue(string key, string id)
        {
            var retval = "";
            if (IFNULL(id, "") != "")
            {
                string[] s_row = Session[id.ToString()].ToString().Split(new char[] { ',' });
                foreach (var l in s_row)
                {
                    string[] keyvalue = l.ToString().Split(new char[] { ':' });
                    if (keyvalue[0].ToString() == key)
                    {
                        retval = keyvalue[1].ToString();
                        break;
                    }
                }
            }
            
            return retval;
        }
        public List<sp_user_menu_access_role_list_SS_Result> CreateMenuData()
        {
            List<sp_user_menu_access_role_list_SS_Result> menu = new List<sp_user_menu_access_role_list_SS_Result>();
            if (Session["menu_id"] != null)
            {

           
                string[] menu_id = Session["menu_id"].ToString().Split(new char[] { ',' });
                foreach (var id in menu_id)
                {
                    sp_user_menu_access_role_list_SS_Result menu_row = new sp_user_menu_access_role_list_SS_Result();

                    menu_row.allow_add = Convert.ToInt32(STREMPTYTOZERO(splitKeyValue("allow_add", id)));
                    menu_row.allow_delete = Convert.ToInt32(STREMPTYTOZERO(splitKeyValue("allow_delete", id)));
                    menu_row.allow_edit = Convert.ToInt32(STREMPTYTOZERO(splitKeyValue("allow_edit", id)));
                    menu_row.allow_edit_history = Convert.ToInt32(STREMPTYTOZERO(splitKeyValue("allow_edit_history", id)));
                    menu_row.allow_print = Convert.ToInt32(STREMPTYTOZERO(splitKeyValue("allow_print", id)));
                    menu_row.allow_view = Convert.ToInt32(STREMPTYTOZERO(splitKeyValue("allow_view", id)));
                    menu_row.favorites_mode = Convert.ToInt32(STREMPTYTOZERO(splitKeyValue("favorites_mode", id)));
                    menu_row.id = Convert.ToInt32(STREMPTYTOZERO(splitKeyValue("id", id).ToString()));
                    menu_row.menu_icon = splitKeyValue("menu_icon", id).ToString();
                    menu_row.menu_id_link = Convert.ToInt32(STREMPTYTOZERO(splitKeyValue("menu_id_link", id)));
                    menu_row.menu_level = Convert.ToInt32(STREMPTYTOZERO(splitKeyValue("menu_level", id)));
                    menu_row.menu_name = splitKeyValue("menu_name", id).ToString();
                    menu_row.menu_sort_order = Convert.ToInt32(STREMPTYTOZERO(splitKeyValue("menu_sort_order", id)));
                    //menu_row.module_id = Convert.ToInt32(STREMPTYTOZERO(splitKeyValue("module_id", id)));
                    menu_row.page_title = splitKeyValue("page_title", id).ToString();
                    menu_row.role_id = splitKeyValue("role_id", id).ToString();
                    menu_row.status = Convert.ToInt32(STREMPTYTOZERO(splitKeyValue("status", id)));
                    menu_row.url_name = splitKeyValue("url_name", id).ToString();
                    menu_row.user_id = splitKeyValue("user_id", id).ToString();
                    menu.Add(menu_row);
                }
                return menu;
            }
            else
            {
                // menu = db.sp_user_menu_access_role_list_SS(Session["user_id"].ToString()).ToList();

                menu = db.sp_user_menu_access_role_list_SS(Session["user_id"].ToString()).ToList();
                CreateMenuSession(menu);
                return menu;
            }

           
        }
        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio
        // Created Date : 2020-01-15
        // Description  : Initialized on Notification
        //*********************************************************************//
        public ActionResult GetNotification()
        {
            if (Session["user_id"] != null)
            {
                db.Database.CommandTimeout = int.MaxValue;
                var user_id = Session["user_id"].ToString();
                var getNotificationList = db_ats.sp_get_notification_list(user_id, 9).ToList();
                var notif_list = db.sp_notification_trn_tbl_list_SS(user_id, DateTime.Now).ToList();
                return JSON(new { message = "success", notif_list, getNotificationList }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return RedirectToAction("Index", "Login");
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