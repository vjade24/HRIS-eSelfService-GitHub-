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
    
    public partial class sp_payrollemployeemaster_rep_Result
    {
        public string empl_id { get; set; }
        public string last_name { get; set; }
        public string first_name { get; set; }
        public string middle_name { get; set; }
        public string employment_type { get; set; }
        public string employmenttype_description { get; set; }
        public System.DateTime effective_date { get; set; }
        public Nullable<decimal> monthly_rate { get; set; }
        public Nullable<decimal> daily_rate { get; set; }
        public Nullable<decimal> hourly_rate { get; set; }
        public string rate_basis { get; set; }
        public string rate_basis_descr { get; set; }
        public Nullable<bool> emp_rcrd_status { get; set; }
        public string department_code { get; set; }
        public string department_name1 { get; set; }
        public string position_title1 { get; set; }
        public string header_descr { get; set; }
        public string date_of_effectivity { get; set; }
    }
}
