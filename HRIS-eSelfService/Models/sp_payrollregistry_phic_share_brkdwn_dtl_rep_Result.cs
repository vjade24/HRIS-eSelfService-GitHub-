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
    
    public partial class sp_payrollregistry_phic_share_brkdwn_dtl_rep_Result
    {
        public string group_code { get; set; }
        public string group_description { get; set; }
        public string group_class { get; set; }
        public Nullable<decimal> gross_pay { get; set; }
        public Nullable<decimal> per_share_med { get; set; }
        public Nullable<decimal> per_share_nonmed { get; set; }
        public Nullable<decimal> tot_nbr_share_med { get; set; }
        public Nullable<decimal> tot_nbr_share_nonmed { get; set; }
        public Nullable<decimal> tot_share_med_amt { get; set; }
        public Nullable<decimal> tot_share_nonmed_amt { get; set; }
    }
}
