//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace HRIS_eSelfService.Models
{
    using System;
    
    public partial class sp_force_leave_plan_approval_list_Result
    {
        public string application_nbr { get; set; }
        public string date_applied { get; set; }
        public string empl_id { get; set; }
        public string employee_name { get; set; }
        public string detail_remarks { get; set; }
        public string approval_status { get; set; }
        public string approval_status_descr { get; set; }
        public Nullable<bool> posting_status { get; set; }
        public string approval_id { get; set; }
        public string reviewed_comment { get; set; }
        public string user_id_reviewer { get; set; }
        public string level1_approval_comment { get; set; }
        public string user_id_level1_approver { get; set; }
        public string level2_approval_comment { get; set; }
        public string user_id_level2_approver { get; set; }
        public string final_approval_comment { get; set; }
        public string user_id_final_approver { get; set; }
        public string disapproval_comment { get; set; }
        public string user_id_disapprover { get; set; }
        public string cancel_pending_comment { get; set; }
        public string user_id_cancel_pending { get; set; }
        public string cancelled_comment { get; set; }
        public string created_by_user { get; set; }
        public string worklist_action { get; set; }
        public string next_status { get; set; }
    }
}
