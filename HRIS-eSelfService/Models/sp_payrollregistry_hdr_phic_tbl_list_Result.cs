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
    
    public partial class sp_payrollregistry_hdr_phic_tbl_list_Result
    {
        public string payroll_year { get; set; }
        public string payroll_month { get; set; }
        public string payroll_registry_nbr { get; set; }
        public string payroll_registry_descr { get; set; }
        public string payrolltemplate_code { get; set; }
        public string payroll_group_nbr { get; set; }
        public string group_description { get; set; }
        public Nullable<double> nod_work_1st { get; set; }
        public string post_status { get; set; }
        public string post_status_descr { get; set; }
        public Nullable<System.DateTime> payroll_dttm_created { get; set; }
        public Nullable<System.DateTime> payroll_dttm_updated { get; set; }
        public string user_id_created_by { get; set; }
        public string user_id_updated_by { get; set; }
        public System.DateTime date_posted { get; set; }
        public string payroll_period_from { get; set; }
        public string payroll_period_to { get; set; }
        public string payroll_period_descr { get; set; }
        public string gross_pay { get; set; }
        public string net_pay { get; set; }
        public string total_gross { get; set; }
        public string department_name1 { get; set; }
    }
}
