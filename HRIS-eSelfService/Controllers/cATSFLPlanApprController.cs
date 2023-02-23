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
    public class cATSFLPlanApprController : Controller
    {
        HRIS_ATSEntities db = new HRIS_ATSEntities();
        HRIS_DEVEntities db_dev = new HRIS_DEVEntities();
        User_Menu um = new User_Menu();
        // GET: cATSFLPlanAppr
        public ActionResult Index()
        {
            User_Menu um = new User_Menu();
            if (Session["id"] == null || Session["id"].ToString() == "")
            {
                return RedirectToAction("Index", "Login");
            }
            else
            {
                GetAllowAccess();
                return View(um);
            }
            // if (um != null || um.ToString() != "")
            // {
            //     GetAllowAccess();
            // }
            // return View(um);
        }
        private User_Menu GetAllowAccess()
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
            um.user_id              = Session["user_id"].ToString();

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
        // Created Date : 01/20/2020
        // Description  : Initialized during leave type pageload
        //*********************************************************************//
        public ActionResult InitializeData()
        {
            try
            {
                var um = GetAllowAccess();
                var dept_code   = Session["department_code"].ToString();
                var curr_year   = DateTime.Now.Year.ToString();
                var user_id     = Session["empl_id"].ToString();

                var flp_list        = db.sp_force_leave_plan_approval_list(dept_code, "", curr_year, "", user_id).ToList();
                var dept_list       = db_dev.vw_departments_tbl_list.ToList();
                var budget_year     = db_dev.sp_budgetyears_tbl_list().ToList();
                var status          = db.sp_approval_status_list().ToList();
                var employment_type = db_dev.sp_employmenttypes_tbl_list().ToList();
                var fl_plan_hdr_rep_tbl = db.sp_fl_plan_hdr_rep_tbl_list().ToList();
                var department_name = db_dev.departments_tbl.Where(a => a.department_code == dept_code).FirstOrDefault();

                return JSON(new { message = "success", flp_list, dept_list, budget_year, status, employment_type, um,
                    dept_code
                    ,
                    fl_plan_hdr_rep_tbl
                    ,
                    department_name
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 04/03/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult FilterPageGrid(
            string par_dept_code,
            string par_empl_type,
            string par_year,
            string par_appr_status)
        {
            try
            {
                var user_id = Session["empl_id"].ToString();
                var filteredGrid = db.sp_force_leave_plan_approval_list(par_dept_code, par_empl_type, par_year, par_appr_status, user_id).ToList();

                return JSON(new { message = "success", filteredGrid }, JsonRequestBehavior.AllowGet);
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
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult GetDetailsData(string p_application_nbr)
        {
            try
            {
                var flpDtlLst = db.sp_force_leave_plan_dtl_tbl_list(p_application_nbr).ToList();

                return JSON(new { message = "success", flpDtlLst }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 04/03/2020
        // Description  : Check if user is approver or reviewer
        //*********************************************************************//
        public ActionResult ApprReviewer()
        {
            try
            {
                string message = "";
                var transac_apprvr = db_dev.sp_transactionsapprover_tbl("005", Session["user_id"].ToString().Remove(0, 1)).ToList();
                var with_reviewer = db_dev.sp_transactionsref_tbl("005").ToList();
                if (transac_apprvr.Count() != 0)
                {
                    message = "success";
                }

                return JSON(new { message, transac_apprvr, with_reviewer }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Lorraine I. Ale 
        // Created Date : 04/03/2020
        // Description  : Filter Page Grid
        //*********************************************************************//
        public ActionResult ApprReviewerAction(force_leave_plan_hdr_tbl data, List<force_leave_plan_dtl_tbl> data2)
        {
            try
            {
                var transac_apprvr = db_dev.sp_update_transaction_in_approvalworkflow_tbl(data.approval_id, Session["user_id"].ToString(), data.approval_status, data.detail_remarks);

                var query = db.force_leave_plan_hdr_tbl.Where(a =>a.application_nbr == data.application_nbr).FirstOrDefault();
                query.approval_status   = data.approval_status;
                query.detail_remarks    = data.detail_remarks;
                query.updated_by_user   = Session["user_id"].ToString();
                query.updated_dttm      = data.updated_dttm;

                for (var x = 0; x < data2.Count; x++)
                {
                    var appl_nbr = data2[x].application_nbr;
                    var flp_date = data2[x].flp_application_date;
                    var empl_id  = data2[x].empl_id;
                    var query2   = db.force_leave_plan_dtl_tbl.Where(a => a.application_nbr == appl_nbr && a.flp_application_date == flp_date && a.empl_id == empl_id).FirstOrDefault();
                    query2.rcrd_status = data2[x].rcrd_status;

                    // **** Auto Create Leave Application when the Force Leave Plan is Final Approved
                    if (data.approval_status == "F")
                    {
                        var data_insert = db.sp_auto_apply_force_leave(data2[x].empl_id, data2[x].flp_application_date, Session["user_id"].ToString()).FirstOrDefault();
                    }
                }
            
                db.SaveChangesAsync();
                return JSON(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message;
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        
        public ActionResult RetrieveEmployee_DTL(string p_fl_plan_rep_ctrlno, string p_fl_plan_rep_year, string p_department_code, string p_division_code)
        {
            try
            {
                //var empl_names = from s in db_dev.vw_personnelnames_tbl
                //                 join r in db_dev.personnel_tbl
                //                 on s.empl_id equals r.empl_id
                //                 join t in db_dev.vw_payrollemployeemaster_hdr_tbl
                //                 on s.empl_id equals t.empl_id
                //                 where r.emp_status == true &
                //                 t.department_code == department_code &
                //                 (t.employment_type == "RE" || t.employment_type == "CE" )
                //                 orderby s.last_name

                //                 select new
                //                 {
                //                     s.empl_id,
                //                     s.employee_name,
                //                     t.department_code,
                //                     t.employment_type,
                //                 };
                var empl_names = db.sp_fl_plan_dtl_rep_tbl_list(p_fl_plan_rep_ctrlno, p_fl_plan_rep_year, p_department_code, p_division_code).ToList();
                return Json(new { message = "success",empl_names }, JsonRequestBehavior.AllowGet);

            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio 
        // Created Date : 01/13/2020
        // Description  : Add new record to leave sub-type table
        //*********************************************************************//
        public ActionResult RetrieveonADD()
        {
            try
            {
                var nxt_ctrl_nbr = db.sp_generate_key("fl_plan_hdr_rep_tbl", "fl_plan_rep_ctrlno", 15).ToList().FirstOrDefault();
                var empl_id         = Session["empl_id"].ToString();
                var department_code = Session["department_code"].ToString();
                var dpt_tbl         = db_dev.departments_tbl.Where(a => a.department_code == department_code).FirstOrDefault();

                var prepared_name   = db_dev.vw_personnelnames_PAY.Where(a=> a.empl_id == empl_id).FirstOrDefault().employee_name_format2.ToString().ToUpper();
                var prepare_desig   = "Administrative Officer".ToString().ToUpper();
                var approved_name   = db_dev.vw_personnelnames_PAY.Where(a => a.empl_id == dpt_tbl.empl_id.ToString().Trim()).FirstOrDefault().employee_name_format2.ToString().ToUpper();
                var approved_desig  = dpt_tbl.designation_head1.ToString().ToUpper();
                var div_list        = db_dev.sp_divisions_tbl_list2(department_code).ToList();

                return Json(new { message = "success", nxt_ctrl_nbr, prepared_name, prepare_desig, approved_name, approved_desig, department_code, div_list }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }

        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio 
        // Created Date : 01/13/2020
        // Description  : Add new record to leave sub-type table
        //*********************************************************************//
        public async Task<ActionResult> Save_FL_REP(fl_plan_hdr_rep_tbl data, string p_division_code)
        {
            try
            {
                var nxt_ctrl_nbr = db.sp_generate_key("fl_plan_hdr_rep_tbl", "fl_plan_rep_ctrlno", 15).ToList().FirstOrDefault();
                
                data.fl_plan_rep_ctrlno    = nxt_ctrl_nbr.key_value.ToString();
                data.fl_plan_rep_year      = data.fl_plan_rep_year  ;
                data.department_code       = data.department_code   ;
                data.prepared_name         = data.prepared_name     ;
                data.prepare_desig         = data.prepare_desig     ;
                data.approved_name         = data.approved_name     ;
                data.approved_desig        = data.approved_desig    ;
                data.fl_plan_rep_status    = data.fl_plan_rep_status;
                data.division_code         = data.division_code;
                data.created_dttm          = DateTime.Now;
                data.user_created_dttm     = Session["user_id"].ToString();
                db.fl_plan_hdr_rep_tbl.Add(data);
                await db.SaveChangesAsync();

                var data_ins = db.sp_fl_plan_dtl_rep_tbl_list("", data.fl_plan_rep_year, data.department_code, p_division_code).ToList();
                int cntr = data_ins.Count;
                for (int i = 0; i < data_ins.Count; i++)
                {
                    fl_plan_dtl_rep_tbl data1    = new fl_plan_dtl_rep_tbl();
                    data1.fl_plan_rep_ctrlno     = nxt_ctrl_nbr.key_value.ToString();
                    data1.fl_plan_rep_year       = DateTime.Now.Year.ToString();
                    data1.empl_id                = data_ins[i].empl_id;
                    data1.created_dttm           = DateTime.Now;
                    data1.user_created_dttm      = Session["user_id"].ToString();
                    db.fl_plan_dtl_rep_tbl.Add(data1);
                    await db.SaveChangesAsync();

                    if (i == (cntr - 1))
                    {
                        break;
                    }

                }

                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio 
        // Created Date : 01/13/2020
        // Description  : Edit existing record from leave sub-type table
        //*********************************************************************//
        public ActionResult Edit_FL_REP(fl_plan_hdr_rep_tbl data)
        {
            try
            {
                var upd = db.fl_plan_hdr_rep_tbl.Where(a => a.fl_plan_rep_ctrlno == data.fl_plan_rep_ctrlno && a.fl_plan_rep_year == data.fl_plan_rep_year).FirstOrDefault();
               
                upd.prepared_name  = data.prepared_name;
                upd.prepare_desig  = data.prepare_desig;
                upd.approved_name  = data.approved_name;
                upd.approved_desig = data.approved_desig;

                db.SaveChanges();
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        // //*********************************************************************//
        // // Created By   : Vincent Jade H. Alivio 
        // // Created Date : 01/13/2020
        // // Description  : delete from leave sub-type table
        // //*********************************************************************//
        public ActionResult Delete_FL_REP(string par_fl_plan_rep_ctrlno, string par_fl_plan_rep_year)
        {
            try
            {
                string message = "";
                var od = db.fl_plan_hdr_rep_tbl.Where(a => a.fl_plan_rep_ctrlno == par_fl_plan_rep_ctrlno && a.fl_plan_rep_year == par_fl_plan_rep_year).FirstOrDefault();
                var od2 = db.fl_plan_dtl_rep_tbl.Where(a => a.fl_plan_rep_ctrlno == par_fl_plan_rep_ctrlno && a.fl_plan_rep_year == par_fl_plan_rep_year).ToList();
                db.fl_plan_hdr_rep_tbl.Remove(od);
                db.fl_plan_dtl_rep_tbl.RemoveRange(od2);
                db.SaveChanges();
                message = "success";
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult Retrieve_FLPlan_HDR()
        {
            try
            {
                var fl_plan_hdr_rep_tbl = db.sp_fl_plan_hdr_rep_tbl_list().ToList();
                return Json(new { message = "success", fl_plan_hdr_rep_tbl }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio 
        // Created Date : 01/13/2020
        // Description  : Add new record to leave sub-type table
        //*********************************************************************//
        public ActionResult Save_dtl(fl_plan_dtl_rep_tbl data, string exist_flag)
        {
            try
            {
                if (exist_flag == "N")
                {
                    data.fl_plan_rep_ctrlno     = data.fl_plan_rep_ctrlno;
                    data.fl_plan_rep_year       = data.fl_plan_rep_year;
                    data.empl_id                = data.empl_id;
                    data.created_dttm           = DateTime.Now;
                    data.user_created_dttm      = Session["user_id"].ToString();
                    db.fl_plan_dtl_rep_tbl.Add(data);
                    db.SaveChangesAsync();
                }
                else if (exist_flag == "Y")
                {
                    var od2 = db.fl_plan_dtl_rep_tbl.Where(a => a.fl_plan_rep_ctrlno == data.fl_plan_rep_ctrlno && a.fl_plan_rep_year == data.fl_plan_rep_year && a.empl_id == data.empl_id).FirstOrDefault();
                    if (od2 != null)
                    {
                        db.fl_plan_dtl_rep_tbl.Remove(od2);
                    }
                    db.SaveChanges();
                }

                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }
        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio 
        // Created Date : 01/13/2020
        // Description  : Edit existing record from leave sub-type table
        //*********************************************************************//
        public ActionResult ReceivedReleased(string fl_plan_rep_ctrlno ,string fl_plan_rep_year, string action)
        {
            try
            {
                var upd = db.fl_plan_hdr_rep_tbl.Where(a => a.fl_plan_rep_ctrlno == fl_plan_rep_ctrlno && a.fl_plan_rep_year == fl_plan_rep_year).FirstOrDefault();
                if (action == "RLSD")
                {
                    upd.user_id_rlsd        = Session["user_id"].ToString();
                    upd.rlsd_dttm           = DateTime.Now;
                    upd.fl_plan_rep_status  = action.ToString().Trim();
                }
                else if (action == "RCVD")
                {
                    upd.user_id_rcvd        = Session["user_id"].ToString();
                    upd.rcvd_dttm           = DateTime.Now;
                    upd.fl_plan_rep_status  = action.ToString().Trim();
                }
                db.SaveChanges();
                return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                string message = e.Message.ToString();
                return Json(new { message }, JsonRequestBehavior.AllowGet);
            }
        }


        //*********************************************************************//
        // Created By   : Vincent Jade H. Alivio 
        // Created Date : 01/13/2020
        // Description  : Add new record to leave sub-type table
        //*********************************************************************//
        //public async Task<ActionResult> AsynSaving()
        //{
        //    try
        //    {
        //        var data_ins = db.sp_fl_plan_dtl_rep_tbl_list("", "2023", "26").ToList();

        //        var nxt_ctrl_nbr = db.sp_generate_key("fl_plan_hdr_rep_tbl", "fl_plan_rep_ctrlno", 15).ToList().FirstOrDefault();
        //        int cntr = data_ins.Count;
        //        for (int i = 0; i < data_ins.Count; i++)
        //        {
        //            fl_plan_dtl_rep_tbl data    = new fl_plan_dtl_rep_tbl();
        //            data.fl_plan_rep_ctrlno     = nxt_ctrl_nbr.key_value.ToString();
        //            data.fl_plan_rep_year       = DateTime.Now.Year.ToString();
        //            data.empl_id                = data_ins[i].empl_id;
        //            data.created_dttm           = DateTime.Now;
        //            data.user_created_dttm      = Session["user_id"].ToString();
        //            db.fl_plan_dtl_rep_tbl.Add(data);
        //            await db.SaveChangesAsync();

        //            if (i == (cntr -1))
        //            {
        //                break;
        //            }

        //        }
        //        return Json(new { message = "success" }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (Exception e)
        //    {
        //        string message = e.Message.ToString();
        //        return Json(new { message }, JsonRequestBehavior.AllowGet);
        //    }
        //}

        public ActionResult CheckonRelease(string fl_plan_rep_ctrlno, string fl_plan_rep_year)
        {
            try
            {
                var message_oth = "";
                var data        = db_dev.sp_force_leave_plan_annual_sched_rep_with_approved(fl_plan_rep_year, fl_plan_rep_ctrlno).ToList();
                for (int i = 0; i < data.Count; i++)
                {
                    if (data[i].fl_approved_all_flag == "N")
                    {
                        message_oth += data[i].empl_id + " - " + data[i].last_name + ", " + data[i].first_name + "\n";
                    }
                }
                return Json(new { message = "success", message_oth, data }, JsonRequestBehavior.AllowGet);

            }
            catch (Exception e)
            {
                return Json(new { message = e.InnerException.Message.ToString() }, JsonRequestBehavior.AllowGet);
            }
        }

    }
}