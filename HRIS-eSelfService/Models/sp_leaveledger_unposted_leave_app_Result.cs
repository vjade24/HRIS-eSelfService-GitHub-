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
    
    public partial class sp_leaveledger_unposted_leave_app_Result
    {
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
        public string url_name { get; set; }
        public string leaveledger_balance_as_of_vl { get; set; }
        public string leaveledger_balance_as_of_sl { get; set; }
        public string leaveledger_balance_as_of_sp { get; set; }
        public string leaveledger_balance_as_of_fl { get; set; }
        public string leaveledger_balance_as_of_oth { get; set; }
        public string vl_restore_deduct { get; set; }
        public string sl_restore_deduct { get; set; }
        public string sp_restore_deduct { get; set; }
        public string fl_restore_deduct { get; set; }
        public string oth_restore_deduct { get; set; }
    }
}
