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
    
    public partial class reorg_jobdescriptions_tbl
    {
        public string job_ctrl_nbr { get; set; }
        public string department_code { get; set; }
        public string subdepartment_code { get; set; }
        public string division_code { get; set; }
        public string position_code { get; set; }
        public string position_title { get; set; }
        public string jobdescr_function { get; set; }
        public Nullable<double> jobdescr_percent { get; set; }
        public string jobdescr_type { get; set; }
        public string created_by { get; set; }
        public Nullable<System.DateTime> created_dttm { get; set; }
        public string updated_by { get; set; }
        public Nullable<System.DateTime> updated_dttm { get; set; }
    }
}
