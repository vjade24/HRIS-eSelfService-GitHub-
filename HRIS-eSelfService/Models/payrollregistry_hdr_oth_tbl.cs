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
    
    public partial class payrollregistry_hdr_oth_tbl
    {
        public string payroll_year { get; set; }
        public string payroll_registry_nbr { get; set; }
        public string transmittal_nbr { get; set; }
        public string remarks { get; set; }
        public Nullable<System.DateTime> created_dttm { get; set; }
        public Nullable<System.DateTime> updated_dttm { get; set; }
        public string user_id_created_by { get; set; }
        public string user_id_updated_by { get; set; }
    }
}
