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
    using System.Collections.Generic;
    
    public partial class vw_lv_ledger_posted_unposted
    {
        public string ledger_ctrl_no { get; set; }
        public string leave_ctrlno { get; set; }
        public string empl_id { get; set; }
        public string employee_name { get; set; }
        public string department_code { get; set; }
        public string department_proper_name { get; set; }
        public string date_applied { get; set; }
        public string inclusive_dates { get; set; }
        public string leave_type_code { get; set; }
        public string leavetype_descr { get; set; }
        public string leave_subtype_code { get; set; }
        public string leavesubtype_descr { get; set; }
        public Nullable<bool> posting_status { get; set; }
        public string approval_status { get; set; }
        public string approval_status_descr { get; set; }
        public string approval_id { get; set; }
        public string created_date_only { get; set; }
        public string created_by_user { get; set; }
        public string leaveledger_entry_type { get; set; }
    }
}
