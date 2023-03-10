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
    
    public partial class sp_voucher_obr_rep_Result
    {
        public string payroll_year { get; set; }
        public string payroll_month { get; set; }
        public string payrolltemplate_code { get; set; }
        public string voucher_ctrl_nbr { get; set; }
        public string empl_id { get; set; }
        public string employee_name { get; set; }
        public Nullable<System.DateTime> voucher_period_from { get; set; }
        public Nullable<System.DateTime> voucher_period_to { get; set; }
        public string voucher_descr1 { get; set; }
        public string voucher_descr2 { get; set; }
        public string organization_name { get; set; }
        public string organization_address1 { get; set; }
        public string organization_address2 { get; set; }
        public string organization_address3 { get; set; }
        public string organization_address4 { get; set; }
        public string function_code { get; set; }
        public string department_name1 { get; set; }
        public string sig_dept_head_name { get; set; }
        public string sig_dept_designation { get; set; }
        public string sig_pbo_head_name { get; set; }
        public string sig_pbo_designation { get; set; }
        public string sig_pto_head_name { get; set; }
        public string sig_pto_designation { get; set; }
        public string sig_pacco_head_name { get; set; }
        public string sig_pacco_designation { get; set; }
        public Nullable<decimal> amt_gross_pay { get; set; }
        public Nullable<decimal> amt_other { get; set; }
        public Nullable<decimal> amt_other1 { get; set; }
        public Nullable<decimal> amt_other2 { get; set; }
        public Nullable<decimal> amt_other3 { get; set; }
        public Nullable<decimal> amt_other4 { get; set; }
        public Nullable<decimal> amt_all { get; set; }
        public string act_gross_pay { get; set; }
        public string act_other_amt { get; set; }
        public string act_other_amt1 { get; set; }
        public string act_other_amt2 { get; set; }
        public string act_other_amt3 { get; set; }
        public string act_other_amt4 { get; set; }
        public string function_name { get; set; }
        public string allotment_class { get; set; }
        public string voucher_type { get; set; }
    }
}
