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
    
    public partial class sp_transactionsapprover_tbl_list_Result
    {
        public string transaction_descr { get; set; }
        public string employee_name { get; set; }
        public string workflow_authority_descr { get; set; }
        public string empl_id { get; set; }
        public string transaction_code { get; set; }
        public string workflow_authority { get; set; }
        public string department_code { get; set; }
        public string subdepartment_code { get; set; }
        public string division_code { get; set; }
        public string section_code { get; set; }
        public Nullable<bool> with_self_service_approval { get; set; }
    }
}
