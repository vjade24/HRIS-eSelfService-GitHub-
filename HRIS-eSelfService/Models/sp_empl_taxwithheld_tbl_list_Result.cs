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
    
    public partial class sp_empl_taxwithheld_tbl_list_Result
    {
        public string empl_id { get; set; }
        public string payroll_year { get; set; }
        public string employee_name { get; set; }
        public string tax_rate { get; set; }
        public string wtax_amt { get; set; }
        public string position_title1 { get; set; }
        public string rate_basis { get; set; }
        public string rate_basis_descr { get; set; }
        public string rate_amount { get; set; }
        public string effective_date { get; set; }
        public string rcrd_status { get; set; }
        public string rcrd_status_descr { get; set; }
        public string user_id_created_by { get; set; }
        public Nullable<System.DateTime> created_dttm { get; set; }
        public string user_id_updated_by { get; set; }
        public Nullable<System.DateTime> updated_dttm { get; set; }
    }
}
