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
    
    public partial class othercontributionloan_stg_tbl
    {
        public string empl_id { get; set; }
        public string employee_name { get; set; }
        public Nullable<decimal> loan_granted { get; set; }
        public Nullable<decimal> monthly_amount { get; set; }
        public Nullable<System.DateTime> date_start { get; set; }
        public Nullable<System.DateTime> date_mature { get; set; }
    }
}
