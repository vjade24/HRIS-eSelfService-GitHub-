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
    
    public partial class sp_payrollregistry_obr_rep_Result
    {
        public string payrolltemplate_code { get; set; }
        public string payroll_year { get; set; }
        public string payroll_registry_nbr { get; set; }
        public string payroll_registry_descr { get; set; }
        public string organization_name { get; set; }
        public string organization_address1 { get; set; }
        public string organization_address2 { get; set; }
        public string organization_address3 { get; set; }
        public string organization_address4 { get; set; }
        public string payment_text { get; set; }
        public string act_gross_pay { get; set; }
        public string act_other_amt { get; set; }
        public string act_other_amt1 { get; set; }
        public string act_other_amt2 { get; set; }
        public string act_other_amt3 { get; set; }
        public string act_other_amt4 { get; set; }
        public string payroll_date_descr { get; set; }
        public string function_code { get; set; }
        public string charge_to { get; set; }
        public string department_name1 { get; set; }
        public string sig_dept_head_name { get; set; }
        public string sig_dept_designation { get; set; }
        public string sig_pbo_head_name { get; set; }
        public string sig_pbo_designation { get; set; }
        public Nullable<decimal> sum_gross_pay { get; set; }
        public Nullable<decimal> sum_oth_amt { get; set; }
        public Nullable<decimal> sum_oth_amt1 { get; set; }
        public Nullable<decimal> sum_oth_amt2 { get; set; }
        public Nullable<decimal> sum_oth_amt3 { get; set; }
        public Nullable<decimal> sum_oth_amt4 { get; set; }
        public decimal tot_amt { get; set; }
    }
}
