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
    
    public partial class payrollinstallation_SRA_tbl
    {
        public string payroll_year { get; set; }
        public Nullable<decimal> perc_monthly_rate { get; set; }
        public decimal lower_limit { get; set; }
        public decimal upper_limit { get; set; }
        public Nullable<decimal> incentive_perc { get; set; }
    }
}
