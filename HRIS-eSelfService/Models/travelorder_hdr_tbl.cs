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
    
    public partial class travelorder_hdr_tbl
    {
        public string travel_order_no { get; set; }
        public Nullable<System.DateTime> travel_datefiled { get; set; }
        public Nullable<System.DateTime> travel_datefiled_original { get; set; }
        public string travel_form_type { get; set; }
        public string travel_place_visit { get; set; }
        public string travel_purpose { get; set; }
        public string travel_requestor_empl_id { get; set; }
        public string travel_type_code { get; set; }
        public string travel_details { get; set; }
        public Nullable<bool> travel_with_claims { get; set; }
        public string travel_justification { get; set; }
        public string approval_status { get; set; }
        public Nullable<bool> posting_status { get; set; }
        public string approval_id { get; set; }
        public string department_code { get; set; }
        public string updated_by_user { get; set; }
        public Nullable<System.DateTime> updated_dttm { get; set; }
        public string recappr_empl { get; set; }
        public string firstappr_empl_id { get; set; }
        public string finalappro_empl_id { get; set; }
        public Nullable<bool> ldnf { get; set; }
        public Nullable<bool> to_emergency { get; set; }
        public string late_justification { get; set; }
    }
}
