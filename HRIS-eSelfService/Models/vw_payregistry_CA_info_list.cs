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
    
    public partial class vw_payregistry_CA_info_list
    {
        public string payroll_year { get; set; }
        public string payroll_month { get; set; }
        public string payroll_registry_nbr { get; set; }
        public string employment_type { get; set; }
        public string payrolltemplate_code { get; set; }
        public string payroll_group_nbr { get; set; }
        public string payroll_registry_descr { get; set; }
        public Nullable<System.DateTime> payroll_period_from { get; set; }
        public Nullable<System.DateTime> payroll_period_to { get; set; }
        public string payroll_period_descr { get; set; }
        public Nullable<decimal> gross_pay { get; set; }
        public Nullable<decimal> net_pay { get; set; }
        public string post_status { get; set; }
        public string department_code { get; set; }
        public string fund_code { get; set; }
        public string docmnt_type { get; set; }
        public string payrolltemplate_descr { get; set; }
        public string function_code { get; set; }
        public string allotment_code { get; set; }
    }
}
