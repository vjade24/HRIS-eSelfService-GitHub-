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
    
    public partial class edocument_trk_transmit_aud_tbl
    {
        public int seq_nbr { get; set; }
        public string transmittal_nbr { get; set; }
        public Nullable<System.DateTime> submitted_dttm { get; set; }
        public string submitted_user_id { get; set; }
        public Nullable<System.DateTime> hr_rcvd_dttm { get; set; }
        public string hr_rcvd_user_id { get; set; }
        public Nullable<System.DateTime> payroll_rcvd_dttm { get; set; }
        public string payroll_rcvd_user_id { get; set; }
        public Nullable<System.DateTime> payroll_approved_dttm { get; set; }
        public string payroll_approved_user_id { get; set; }
        public Nullable<System.DateTime> payroll_disapproved_dttm { get; set; }
        public string payroll_disapproved_user_id { get; set; }
        public Nullable<System.DateTime> payroll_created_dttm { get; set; }
        public string payroll_created_user_id { get; set; }
        public string tran_disapproved_remarks { get; set; }
    }
}
