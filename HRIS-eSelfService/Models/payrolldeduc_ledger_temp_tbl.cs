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
    
    public partial class payrolldeduc_ledger_temp_tbl
    {
        public string empl_id { get; set; }
        public string deduc_code { get; set; }
        public string deduc_seq { get; set; }
        public Nullable<System.DateTime> deduc_date_from { get; set; }
        public Nullable<System.DateTime> deduc_date_to { get; set; }
        public string deduc_ref_nbr { get; set; }
        public Nullable<decimal> deduc_amount1 { get; set; }
        public Nullable<decimal> deduc_amount2 { get; set; }
        public Nullable<decimal> deduc_loan_amount { get; set; }
        public Nullable<int> deduc_nbr_months { get; set; }
        public string deduc_status { get; set; }
        public string deduc_source { get; set; }
        public string created_by_user { get; set; }
        public Nullable<System.DateTime> created_dttm { get; set; }
        public string updated_by_user { get; set; }
        public Nullable<System.DateTime> updated_dttm { get; set; }
    }
}
