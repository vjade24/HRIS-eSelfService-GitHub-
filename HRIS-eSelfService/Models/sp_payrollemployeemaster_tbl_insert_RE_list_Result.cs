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
    
    public partial class sp_payrollemployeemaster_tbl_insert_RE_list_Result
    {
        public string empl_id { get; set; }
        public string employee_name { get; set; }
        public string employment_type { get; set; }
        public string effective_date { get; set; }
        public Nullable<decimal> monthly_rate { get; set; }
        public Nullable<decimal> daily_rate { get; set; }
        public Nullable<decimal> hourly_rate { get; set; }
        public string rate_basis { get; set; }
        public Nullable<System.DateTime> period_from { get; set; }
        public Nullable<System.DateTime> period_to { get; set; }
        public string payroll_group_nbr { get; set; }
        public string grouping_descr { get; set; }
        public Nullable<bool> emp_rcrd_status { get; set; }
        public string department_code { get; set; }
        public string department_name1 { get; set; }
        public string subdepartment_code { get; set; }
        public string subdepartment_name1 { get; set; }
        public string division_code { get; set; }
        public string division_name1 { get; set; }
        public string section_code { get; set; }
        public string section_name1 { get; set; }
        public string function_code { get; set; }
        public string function_name { get; set; }
        public string fund_code { get; set; }
        public string fund_description { get; set; }
        public Nullable<bool> flag_expt_gsis { get; set; }
        public Nullable<bool> flag_expt_phic { get; set; }
        public Nullable<bool> flag_expt_hdmf { get; set; }
        public Nullable<decimal> hdmf_fix_rate { get; set; }
        public System.DateTime date_of_assumption { get; set; }
        public string position_code { get; set; }
        public string position_title1 { get; set; }
        public Nullable<decimal> hazard_pay_override { get; set; }
        public string add_update_remarks { get; set; }
    }
}
