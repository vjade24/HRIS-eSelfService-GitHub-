//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Process Monitor
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// Jorge Rustom Villanueva       05/20/2020      Code Creation
//**********************************************************************************
using System;
using HRIS_eSelfService.Models;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Drawing;
using System.Text;
using BioMetrixCore;
using System.Data.SqlClient;
using System.Data;

namespace HRIS_eSelfService.Controllers
{
    public class cProcessMonitorController : Controller
    {
        // GET: cATSASAppr
        HRIS_DEVEntities db_dev = new HRIS_DEVEntities();
        HRIS_ATSEntities db_ats = new HRIS_ATSEntities();
        HRIS_DTREntities db_dtr = new HRIS_DTREntities();

        User_Menu um = new User_Menu();


        DeviceManipulator manipulator = new DeviceManipulator();
        public ZkemClient objZkeeper;
        private bool isDeviceConnected = false;
        public string ipAddress = "";
        public int portNumber = 0;
        public string port = "";
        public string bio_connect_info = "";
        public bool success = false;
       

        List<bio_machine_info> bioinfo = new List<bio_machine_info>();
        string currentMonth = DateTime.Now.ToString("MM");
        string currrentYear = DateTime.Now.Year.ToString();



        //*********************************************************************//
        // Created By : JRV - Created Date : 06/01/2020
        // Description: Get the User Role
        //*********************************************************************//
        public void GetAllowAccess()
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
        }

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

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr.
        // Created Date : 06/03/2020
        // Description  : Initialized during leave type pageload
        //*********************************************************************//
        public ActionResult FilterPageGrid(string par_year, string par_month, string par_user_id, string par_status, int par_module)
        {
            var sp_prcmonitor_tbl_list_SS = db_ats.sp_prcmonitor_tbl_list_SS(par_year, par_month, par_user_id, par_status, par_module).ToList();
            return JSON(new { message = "success", sp_prcmonitor_tbl_list_SS }, JsonRequestBehavior.AllowGet);
        }


        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr.
        // Created Date : 06/03/2020
        // Description  : Initialized during leave type pageload
        //*********************************************************************//
        public ActionResult InitializeData()
        {
            try
            {
                GetAllowAccess();

                var dept_code = Session["department_code"].ToString();
                var dept_list = db_dev.vw_departments_tbl_list.ToList();
                var sp_modules_tbl_list = db_dev.sp_modules_tbl_list().ToList();
                var sp_prcstatus_tbl_list = db_dev.sp_prcstatus_tbl_list().ToList();
                var user_id = Session["user_id"].ToString();
                var sp_prcmonitor_users_list_SS = db_ats.sp_prcmonitor_users_list_SS().ToList();
                var sp_prcmonitor_tbl_list_SS = db_ats.sp_prcmonitor_tbl_list_SS("","","","",0).ToList();
                var employment_type = db_dev.sp_employmenttypes_tbl_list().ToList();
                return JSON(new { message = "success", sp_prcstatus_tbl_list, user_id, sp_modules_tbl_list, sp_prcmonitor_tbl_list_SS, sp_prcmonitor_users_list_SS, dept_list, employment_type }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr. 
        // Created Date : 03/02/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult GetEmployeesDetails(string par_travel_order_no, string par_dept_code)
        {
            try
            {
                var sp_travelorder_empl_dtl_tbl_list = db_ats.sp_travelorder_empl_dtl_tbl_list(par_travel_order_no).ToList();
                var sp_travelorder_dates_dtl_tbl_list = db_ats.sp_travelorder_dates_dtl_tbl_list(par_travel_order_no).ToList();

                string empl_id = Session["empl_id"].ToString();

                // var empl_name_list = db_dev.sp_employee_list_dept_travel(par_dept_code);
                var empl_name_list = db_dev.sp_employee_list_dept(empl_id);
                return JSON(new { message = "success", sp_travelorder_empl_dtl_tbl_list, sp_travelorder_dates_dtl_tbl_list, empl_name_list }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }


        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr. 
        // Created Date : 03/02/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult GetDetailsData(string p_application_nbr)
        {
            try
            {
                var travelorder_hdr_tbl = db_ats.travelorder_hdr_tbl.Where(a => a.travel_order_no == p_application_nbr).ToList();

                return JSON(new { message = "success", travelorder_hdr_tbl }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr. 
        // Created Date : 04/16/2020
        // Description  : delete from approval workflow table
        //*********************************************************************//
        public ActionResult DeleteFromDatabase(travelorder_hdr_tbl par_data)
        {
            try
            {
                var query = db_ats.travelorder_hdr_tbl.Where(a =>
                           a.travel_order_no == par_data.travel_order_no).FirstOrDefault();
                query.approval_status = "L";
                query.updated_dttm = DateTime.Now;
                query.updated_by_user = Session["user_id"].ToString();

                var query2 = db_ats.travelorder_dates_dtl_tbl.Where(a =>
                   a.travel_order_no == query.travel_order_no).ToList();
                query2.ForEach(a => a.rcrd_status = "L");

                var query3 = db_ats.travelorder_empl_dtl_tbl.Where(a =>
                   a.travel_order_no == query.travel_order_no).ToList();
                query3.ForEach(a => a.rcrd_status = "L");

                db_dev.sp_update_transaction_in_approvalworkflow_tbl(query.approval_id, Session["user_id"].ToString(), "L", "canceled by user");

                db_ats.SaveChangesAsync();

                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);

                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Joseph M. Tombo Jr. 
        // Created Date : 03/02/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult ReviewApprovedAction(travelorder_hdr_tbl data)
        {
            try
            {
                var travel_order_no = data.travel_order_no;
                var approval_id = data.approval_id;
                string status_comment = string.Empty;
                data.travel_details = data.travel_details == null ? "" : data.travel_details;
                if (data.approval_status.ToString().Trim() == "R" &&
                   data.travel_details.Trim() == "")
                {
                    data.travel_details = "Reviewed";
                }
                else if (data.approval_status.ToString().Trim() == "F" &&
                    data.travel_details.Trim() == "")
                {
                    data.travel_details = "Final Approved";
                }
                else if (data.approval_status.ToString().Trim() == "C" &&
                    data.travel_details.Trim() == "")
                {
                    data.travel_details = "Cancel Pending";
                }
                else if (data.approval_status.ToString().Trim() == "D" &&
                     data.travel_details.Trim() == "")
                {
                    data.travel_details = "Disapproved";
                }
                else if (data.approval_status.ToString().Trim() != "" &&
                    data.travel_details.Trim() == "")
                {
                    data.travel_details = "Level " + data.approval_status + " Approved";
                }

                else if (data.approval_status.ToString().Trim() == "L" &&
                    data.travel_details.Trim() == "")
                {
                    data.travel_details = "Cancelled";
                }

                var query = db_ats.travelorder_hdr_tbl.Where(a => a.travel_order_no == travel_order_no
                                && a.approval_id == approval_id
                                ).FirstOrDefault();
                var query2 = db_ats.travelorder_dates_dtl_tbl.Where(a => a.travel_order_no == travel_order_no).ToList();
                var query3 = db_ats.travelorder_empl_dtl_tbl.Where(a => a.travel_order_no == travel_order_no).ToList();
                if (query != null)
                {
                    query.approval_status = data.approval_status;
                    query.travel_details = data.travel_details;
                    query.updated_by_user = Session["user_id"].ToString();
                    query.updated_dttm = DateTime.Now;
                    query2.ForEach(a => a.rcrd_status = data.approval_status);
                    query3.ForEach(a => a.rcrd_status = data.approval_status);
                    db_dev.sp_update_transaction_in_approvalworkflow_tbl(query.approval_id, Session["user_id"].ToString(), data.approval_status, data.travel_details);
                }

                db_ats.SaveChangesAsync();
                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
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


       

        public bool IsDeviceConnected
        {
            get { return isDeviceConnected; }
            set
            {
                isDeviceConnected = value;
                if (isDeviceConnected)
                {
                    //ShowStatusBar("The device is connected !!", true);

                    // ToggleControls(true);
                }
                else
                {
                   // ShowStatusBar("The device is diconnected !!", true);
                    objZkeeper.Disconnect();

                    //   DisplayEmpty();
                    //  ToggleControls(false);
                }
            }
        }
        public void ShowStatusBar(string message, bool type)
        {
            if (message.Trim() == string.Empty)
            {
                //  lblStatus.Visible = false;
                return;
            }

            //  lblStatus.Visible = true;
            // lblStatus.Text = message;
            // lblStatus.ForeColor = Color.White;

            if (type)
            {
                //    lblStatus.BackColor = Color.FromArgb(79, 208, 154);
            }
            else
            {
                //   lblStatus.BackColor = Color.FromArgb(230, 112, 134);
            }
        }

        //created by Marvin Olita
        //This function will pull all the data from biometric machine and insert it to the sql database
        private Boolean ip_connect(string ip,string port,int machineNumber)
        {
            try
            {
               
                if (IsDeviceConnected)
                {
                    IsDeviceConnected = false;
                   
                    return true;
                }
              
                if (ip == string.Empty || port == string.Empty)
                {
                    
                    throw new Exception("The Device IP Address and Port is mandatory !!");
                }
                
                if (!int.TryParse(port, out portNumber))
                {
                    throw new Exception("Not a valid port number");
                }
                
                bool isValidIpA = UniversalStatic.ValidateIP(ip);
               
                if (!isValidIpA)
                {
                    throw new Exception("The Device IP is invalid !!");
                }

                isValidIpA = UniversalStatic.PingTheDevice(ip);
               
                if (!isValidIpA)
                {
                    throw new Exception("The device at " + ip + ":" + port + " did not respond!!");
                }
               
                objZkeeper = new ZkemClient(RaiseDeviceEvent);
               
                IsDeviceConnected = objZkeeper.Connect_Net(ip, portNumber);
                
                if (IsDeviceConnected)
                {
                    string deviceInfo = manipulator.FetchDeviceInfo(objZkeeper,machineNumber);
                   
                }
                success = true;
                bio_connect_info = "IP Address successfully connected";
            }
            catch (Exception ex)
            {
                
                success = false;
            }
            return success;
        }

        private void RaiseDeviceEvent(object sender, string actionType)
        {
            switch (actionType)
            {
                case UniversalStatic.acx_Disconnect:
                    {
                        break;
                    }
                default:
                    break;
            }
        }

        private int ISNULL_INT(int para)
        {
            if (para == 0)
            {
                return 0;
            }
            else
            {
                return para;
            }
        }
        
        public ActionResult RerunBioExtract(string ip,string date_from, string date_to, int prc_number, string empl_id)
        {
           
            db_dtr.Database.CommandTimeout = int.MaxValue;
            var message = "";
            var mn = 0;
            var bl = "";
            var date = DateTime.Now;
          
            var logstatus = false;
            long prc_nbr = 0;
            var prc_parameters = "";
            int fail = 0;
            
          
            var year = Convert.ToDateTime(date_from).Year.ToString();
            var month = Convert.ToDateTime(date_from).Month.ToString().ToCharArray().Count() > 1? Convert.ToDateTime(date_from).Month.ToString():"0"+ Convert.ToDateTime(date_from).Month.ToString();
            List<bio_machine_info_tbl> bmil = new List<bio_machine_info_tbl>();
            List<sp_timefilter_bioextract_Result> sfdl = new List<sp_timefilter_bioextract_Result>();
            List<MachineInfo> machineinfo = new List<MachineInfo>();
            List<sp_extract_process_Result> dpfl = new List<sp_extract_process_Result>();
            List<machine_prim_key> mpkl = new List<machine_prim_key>();

            try
            {

                sfdl = db_dtr.sp_timefilter_bioextract().ToList();
                var fnd1 = 0;
               
                bmil = db_dtr.bio_machine_info_tbl.Where(a => a.MachineNumber == prc_number).ToList();
                   
               
              

                fnd1 = bmil.Count;
               
                if (fnd1 == 0) throw new Exception("IP Address not found in bio_machine_info_tbl");
                port =  bmil[0].port_number.ToString();
                var bmil_count = bmil.Count;

            


                if (ip_connect(bmil[0].ip_address, port, bmil[0].MachineNumber)) // open the biomachine connection
                {
                    var dbobj = db_dtr.sp_delete_bio_extract_stg_tbl_bydateAndMachine(int.Parse(bmil[0].MachineNumber.ToString()), Convert.ToDateTime(date_from), Convert.ToDateTime(date_to));

                    ICollection<MachineInfo> lstMachineInfo = manipulator.GetLogData(objZkeeper, bmil[0].MachineNumber, Convert.ToDateTime(date_from), Convert.ToDateTime(date_to), empl_id);

                    if (lstMachineInfo != null && lstMachineInfo.Count > 0)
                    {
                        int lstMachineInfo_count = lstMachineInfo.Count;
                        int lstMachineInfo_fetch = 0;
                        foreach (var l in lstMachineInfo)
                        {
                            MachineInfo mi = new MachineInfo();
                            mi.MachineNumber = l.MachineNumber;
                            mi.IndRegID = l.IndRegID;
                            mi.DateTimeRecord = l.DateTimeRecord;
                            mi.VerifyMode = l.VerifyMode;
                            mi.InOutMode = l.InOutMode;
                            mi.WorkCode = l.WorkCode;
                            mi.DateOnlyRecord = l.DateOnlyRecord;
                            mi.TimeOnlyRecord = l.TimeOnlyRecord;
                            machineinfo.Add(mi);

                            int a = db_dtr.sp_insert_bio_extract_stg_tbl(
                                ISNULL_INT(l.MachineNumber)
                                , l.IndRegID
                                , l.DateTimeRecord
                                , l.VerifyMode
                                , l.InOutMode
                                , l.WorkCode
                                , l.DateOnlyRecord
                                , l.TimeOnlyRecord
                                , bmil[0].extract_type);
                            if (a > 0) lstMachineInfo_fetch++;

                           

                        }

                        logstatus = true;

                    if (lstMachineInfo_fetch == lstMachineInfo_count) bio_connect_info = lstMachineInfo_fetch + " out of " + lstMachineInfo_count + " data was successfully extracted from bio machine!";
                    }
                    else
                    {
                        logstatus = true;
                        fail = fail + 1;
                        throw new Exception("No records found!");
                    }

                    ip_connect(bmil[0].ip_address, port, bmil[0].MachineNumber);// close the biomachine connection

                    dpfl = db_dtr.sp_extract_process(
                              empl_id
                            , date_from
                            , date_to
                            , ""   
                            , year
                            , month
                            , "BTHADM"
                            , bmil[0].extract_type
                        ).ToList();

                   

                    if (dpfl[0].result_value == "E")
                    {
                        prc_nbr = (long)dpfl[0].process_nbr;
                        prc_parameters = dpfl[0].prc_parameter;
                        throw new Exception(dpfl[0].result_value_descr);
                    }
                    
                }
                else
                {
                    throw new Exception("Biometrics failed to connect !!");
                }
                if (bmil.Count > 0)
                {
                    mn = bmil[0].MachineNumber;
                    bl = bmil[0].bio_location;
                }
                else
                {
                    bl = "Undefined";
                }
              
                 var inf = db_dtr.sp_insert_bio_log_info_tbl(
                      date
                    , mn
                    , bmil[0].ip_address
                    , bl
                    , bio_connect_info
                    , Convert.ToInt32(logstatus)
                    , dpfl[0].process_nbr
                    , dpfl[0].prc_parameter);

                return JSON(new { message = bio_connect_info,icon="success", machineinfo}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {

                if (bmil.Count > 0)
                {
                    mn = bmil[0].MachineNumber;
                    bl = bmil[0].bio_location;
                }
                else
                {
                    bl = "Undefined";
                }

                logstatus = false;
                bio_connect_info = ex.Message;
                var inf = db_dtr.sp_insert_bio_log_info_tbl(
                       date
                     , mn
                     , bmil[0].ip_address
                     , bl
                     , bio_connect_info 
                     , Convert.ToInt32(logstatus)
                     , prc_nbr
                     , prc_parameters);
                return JSON(new { message = bio_connect_info, icon = "error" }, JsonRequestBehavior.AllowGet);
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
            , string par_shift_flag
            )
        {
            try
            {
                var session_user_id = Session["user_id"].ToString();
                db_ats.Database.CommandTimeout = int.MaxValue;

                var checkShiftFlag = db_ats.sp_check_shiftsched(par_year, par_month, par_empl_id).ToList();
                var generate_dtr = new object();

                if (par_shift_flag == "1")
                {
                    generate_dtr = db_ats.sp_generate_empl_dtr(par_year, par_month, par_empl_id, par_view_type, par_department_code, par_employment_type, session_user_id).ToList();
                }

                else if (par_shift_flag == "2") {
                    generate_dtr = db_ats.sp_generate_empl_dtr_shift(par_year, par_month, par_empl_id, par_view_type, par_department_code, par_employment_type, session_user_id).ToList();
                }

               





                return JSON(new { message = "success", generate_dtr, checkShiftFlag }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return JSON(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }


    }
}