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
    
    public partial class coc_earnings_hdr_tbl
    {
        public string applnbr { get; set; }
        public string empl_id { get; set; }
        public string coc_year { get; set; }
        public string coc_month { get; set; }
        public Nullable<System.DateTime> coc_application_date { get; set; }
        public Nullable<double> coc_credit_equivalent { get; set; }
        public Nullable<bool> coc_justification_flag { get; set; }
        public string approval_status { get; set; }
        public Nullable<bool> posting_status { get; set; }
        public string approval_id { get; set; }
        public string details_remarks { get; set; }
    }
}
