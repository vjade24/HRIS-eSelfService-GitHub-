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
    
    public partial class discipline_tbl
    {
        public string empl_id { get; set; }
        public System.DateTime date_entered { get; set; }
        public Nullable<System.DateTime> date_of_effectivity { get; set; }
        public Nullable<int> no_of_days { get; set; }
        public string reason_code { get; set; }
        public string details_remarks { get; set; }
        public string approval_status { get; set; }
        public Nullable<bool> posting_status { get; set; }
        public string approval_id { get; set; }
    }
}
