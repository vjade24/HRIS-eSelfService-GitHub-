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
    
    public partial class ot_request_hdr_tbl
    {
        public string ot_ctrl_no { get; set; }
        public string ot_month { get; set; }
        public string ot_year { get; set; }
        public Nullable<System.DateTime> ot_request_date { get; set; }
        public string ot_for_empl_id { get; set; }
        public string department_code { get; set; }
        public string subdepartment_code { get; set; }
        public string division_code { get; set; }
        public string section_code { get; set; }
        public string fund_code { get; set; }
        public string ot_thru_empl_id { get; set; }
        public string ot_from_empl_id { get; set; }
        public string ot_requestor_empl_id { get; set; }
        public string ot_subject { get; set; }
        public string ot_justification { get; set; }
        public Nullable<bool> ot_coc_credit_flag { get; set; }
        public string approval_status { get; set; }
        public Nullable<bool> posting_status { get; set; }
        public string approval_id { get; set; }
        public Nullable<bool> weekdays_flag { get; set; }
        public string weekdays_in { get; set; }
        public string weekdays_in_ampm { get; set; }
        public string weekdays_out { get; set; }
        public string weekdays_out_ampm { get; set; }
        public Nullable<bool> weekend_flag { get; set; }
        public string weekend_in { get; set; }
        public string weekend_in_ampm { get; set; }
        public string weekend_out { get; set; }
        public string weekend_out_ampm { get; set; }
        public Nullable<bool> holiday_flag { get; set; }
        public string holiday_in { get; set; }
        public string holiday_in_ampm { get; set; }
        public string holiday_out { get; set; }
        public string holiday_out_ampm { get; set; }
        public Nullable<bool> dayoff_ot_flag { get; set; }
        public string dayoff_ot_in { get; set; }
        public string dayoff_ot_in_ampm { get; set; }
        public string dayoff_ot_out { get; set; }
        public string dayoff_ot_out_ampm { get; set; }
        public string created_by_user { get; set; }
        public Nullable<System.DateTime> created_dttm { get; set; }
        public string updated_by_user { get; set; }
        public Nullable<System.DateTime> updated_dttm { get; set; }
        public string details_remarks { get; set; }
        public string oth_fund_descr { get; set; }
    }
}
