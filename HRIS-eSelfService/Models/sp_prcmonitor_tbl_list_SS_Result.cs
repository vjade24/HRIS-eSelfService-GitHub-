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
    
    public partial class sp_prcmonitor_tbl_list_SS_Result
    {
        public string prc_nbr { get; set; }
        public string prc_id { get; set; }
        public string prc_name { get; set; }
        public string prc_dttm_begin { get; set; }
        public string prc_dttm_end { get; set; }
        public string prc_runby_user_id { get; set; }
        public string prc_parameters { get; set; }
        public string prc_status { get; set; }
        public string prc_status_short_descr { get; set; }
        public string prc_status_descr { get; set; }
        public Nullable<int> module_id { get; set; }
        public Nullable<int> prc_error_nbr { get; set; }
        public string prc_error_msg { get; set; }
    }
}
