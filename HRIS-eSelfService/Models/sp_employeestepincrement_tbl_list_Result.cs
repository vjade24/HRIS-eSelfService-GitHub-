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
    
    public partial class sp_employeestepincrement_tbl_list_Result
    {
        public string empl_id { get; set; }
        public string employee_name { get; set; }
        public string item_no { get; set; }
        public string salary_grade { get; set; }
        public string effective_date_sg { get; set; }
        public string monthly_rate { get; set; }
        public string effective_date_sg_ny { get; set; }
        public Nullable<byte> step_increment_cy { get; set; }
        public Nullable<byte> step_increment_ny { get; set; }
        public string monthly_rate_ny { get; set; }
        public Nullable<decimal> daily_rate_ny { get; set; }
        public Nullable<decimal> hourly_rate_ny { get; set; }
        public string next_step_increment_eff_date { get; set; }
        public decimal step_increment_annual_amount { get; set; }
        public string position_title_code { get; set; }
    }
}
