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
    
    public partial class sp_leaveledger_tbl_list_Result
    {
        public string ledger_ctrl_no { get; set; }
        public string empl_id { get; set; }
        public string leavetype_code { get; set; }
        public string leavetype_descr { get; set; }
        public string leavesubtype_code { get; set; }
        public string leavesubtype_descr { get; set; }
        public string leaveledger_date { get; set; }
        public string leaveledger_period { get; set; }
        public string leaveledger_particulars { get; set; }
        public Nullable<decimal> leaveledger_earn { get; set; }
        public Nullable<decimal> leaveledger_abs_und_wp { get; set; }
        public Nullable<decimal> leaveledger_balance_as_of { get; set; }
        public Nullable<decimal> leaveledger_abs_und_wop { get; set; }
        public string leaveledger_action { get; set; }
        public string leaveledger_action_descr { get; set; }
        public string leaveledger_action_taken { get; set; }
        public string leaveledger_entry_type { get; set; }
        public string eaveledger_entry_type_desc { get; set; }
        public string details_remarks { get; set; }
        public string approval_status { get; set; }
        public string approval_status_descr { get; set; }
        public string approval_id { get; set; }
        public string leave_ctrlno { get; set; }
    }
}
