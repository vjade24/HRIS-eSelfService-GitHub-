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
    
    public partial class vw_extract_sra
    {
        public string empl_id { get; set; }
        public string payroll_year { get; set; }
        public string payroll_month { get; set; }
        public Nullable<System.DateTime> payroll_period_from { get; set; }
        public Nullable<System.DateTime> payroll_period_to { get; set; }
        public Nullable<decimal> other_amount2 { get; set; }
    }
}
