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
    
    public partial class func_LV_info_date_Result
    {
        public System.DateTime dtr_date { get; set; }
        public string dtr_year { get; set; }
        public string dtr_month { get; set; }
        public string empl_id { get; set; }
        public Nullable<System.DateTime> leave_date_from { get; set; }
        public Nullable<System.DateTime> leave_date_to { get; set; }
        public Nullable<decimal> date_num_day { get; set; }
        public string leavetype_code { get; set; }
        public string leavetype_descr { get; set; }
        public string leave_comments { get; set; }
    }
}
