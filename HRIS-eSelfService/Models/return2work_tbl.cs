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
    
    public partial class return2work_tbl
    {
        public string empl_id { get; set; }
        public System.DateTime date_entered { get; set; }
        public Nullable<System.DateTime> date_return { get; set; }
        public string reason_code { get; set; }
        public Nullable<bool> with_backpay { get; set; }
        public string details_remarks { get; set; }
        public Nullable<bool> posting_status { get; set; }
    }
}
