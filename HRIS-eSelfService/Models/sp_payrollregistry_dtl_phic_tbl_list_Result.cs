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
    
    public partial class sp_payrollregistry_dtl_phic_tbl_list_Result
    {
        public string payroll_year { get; set; }
        public string payroll_registry_nbr { get; set; }
        public string payrolltemplate_code { get; set; }
        public string payroll_group_nbr { get; set; }
        public string payroll_month { get; set; }
        public string post_status { get; set; }
        public string payroll_period_from { get; set; }
        public string payroll_period_to { get; set; }
        public string payrolltemplate_descr { get; set; }
        public string grouping_descr { get; set; }
        public string department_code { get; set; }
        public string department_name1 { get; set; }
        public string empl_id { get; set; }
        public string employee_name { get; set; }
        public string position_short_title { get; set; }
        public string rate_basis { get; set; }
        public string hourly_rate { get; set; }
        public string monthly_rate { get; set; }
        public string daily_rate { get; set; }
        public Nullable<decimal> empl_no_share { get; set; }
        public Nullable<decimal> gross_pay { get; set; }
        public Nullable<decimal> net_pay { get; set; }
        public Nullable<decimal> wtax_perc { get; set; }
        public Nullable<decimal> wtax { get; set; }
        public Nullable<decimal> btax_perc { get; set; }
        public Nullable<decimal> btax { get; set; }
        public Nullable<decimal> wtax_2perc { get; set; }
        public Nullable<decimal> wtax_3perc { get; set; }
        public Nullable<decimal> wtax_5perc { get; set; }
        public Nullable<decimal> wtax_10perc { get; set; }
        public Nullable<decimal> wtax_15perc { get; set; }
        public string employment_type { get; set; }
    }
}
