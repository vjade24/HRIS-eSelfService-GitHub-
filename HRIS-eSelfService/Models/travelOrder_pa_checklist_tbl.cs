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
    
    public partial class travelOrder_pa_checklist_tbl
    {
        public string travel_order_no { get; set; }
        public string empl_id { get; set; }
        public string employee_name { get; set; }
        public string position_title1 { get; set; }
        public string department_name1 { get; set; }
        public string department_short_name { get; set; }
        public string dtr_date { get; set; }
        public string travel_place_visit { get; set; }
        public string travel_purpose { get; set; }
        public string travel_requestor_empl_id { get; set; }
        public string travel_requestor_empl_name { get; set; }
        public string travel_type_code { get; set; }
        public string travel_type_descr { get; set; }
        public Nullable<bool> travel_with_claims { get; set; }
        public string travel_justification { get; set; }
        public string report_header_descr { get; set; }
        public string approval_status { get; set; }
        public string department_code { get; set; }
        public string approval_id { get; set; }
        public Nullable<System.DateTime> travel_datefiled_original { get; set; }
        public Nullable<System.DateTime> check_approved_dttm { get; set; }
        public Nullable<System.DateTime> lvl1n2_approved_dttm { get; set; }
        public string approved_status { get; set; }
        public Nullable<System.DateTime> created_dttm { get; set; }
        public string created_user_by { get; set; }
        public Nullable<System.DateTime> updated_dttm { get; set; }
        public string updated_user_by { get; set; }
    }
}
