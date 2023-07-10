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
    
    public partial class payrollregistry_dtl_rata_tbl
    {
        public string payroll_year { get; set; }
        public string payroll_registry_nbr { get; set; }
        public string empl_id { get; set; }
        public Nullable<decimal> monthly_rate { get; set; }
        public Nullable<decimal> gross_pay { get; set; }
        public Nullable<decimal> net_pay { get; set; }
        public Nullable<double> days_worked { get; set; }
        public Nullable<double> days_leaved { get; set; }
        public Nullable<double> days_wo_vehicle { get; set; }
        public Nullable<int> rate_percentage { get; set; }
        public Nullable<decimal> ra_amount { get; set; }
        public Nullable<decimal> ta_amount { get; set; }
        public Nullable<decimal> qa_amount { get; set; }
        public string post_status { get; set; }
        public Nullable<System.DateTime> date_posted { get; set; }
        public string voucher_nbr { get; set; }
        public string created_by_user { get; set; }
        public string updated_by_user { get; set; }
        public string posted_by_user { get; set; }
        public Nullable<System.DateTime> created_dttm { get; set; }
        public Nullable<System.DateTime> updated_dttm { get; set; }
        public string remarks { get; set; }
    }
}
