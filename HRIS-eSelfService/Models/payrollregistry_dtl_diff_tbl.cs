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
    
    public partial class payrollregistry_dtl_diff_tbl
    {
        public string payroll_year { get; set; }
        public string payroll_registry_nbr { get; set; }
        public string empl_id { get; set; }
        public string rate_basis { get; set; }
        public Nullable<decimal> monthly_rate { get; set; }
        public Nullable<decimal> daily_rate { get; set; }
        public Nullable<decimal> gross_pay { get; set; }
        public Nullable<decimal> net_pay { get; set; }
        public string month_covered { get; set; }
        public Nullable<int> no_of_months { get; set; }
        public Nullable<decimal> monthly_rate_old { get; set; }
        public Nullable<decimal> daily_rate_old { get; set; }
        public Nullable<decimal> salary_diff_amount { get; set; }
        public Nullable<decimal> lowp_amount { get; set; }
        public Nullable<decimal> wtax { get; set; }
        public Nullable<decimal> gsis_gs { get; set; }
        public Nullable<decimal> gsis_ps { get; set; }
        public Nullable<decimal> hdmf_gs { get; set; }
        public Nullable<decimal> hdmf_ps { get; set; }
        public Nullable<decimal> phic_gs { get; set; }
        public Nullable<decimal> phic_ps { get; set; }
        public string post_status { get; set; }
        public Nullable<System.DateTime> date_posted { get; set; }
        public string voucher_nbr { get; set; }
        public string created_by_user { get; set; }
        public string updated_by_user { get; set; }
        public string posted_by_user { get; set; }
        public Nullable<System.DateTime> created_dttm { get; set; }
        public Nullable<System.DateTime> updated_dttm { get; set; }
        public Nullable<decimal> days_worked { get; set; }
        public Nullable<decimal> salary_diff_amt_per_day { get; set; }
        public Nullable<decimal> leave_earned { get; set; }
        public string remarks { get; set; }
        public Nullable<decimal> lates_amount { get; set; }
    }
}
