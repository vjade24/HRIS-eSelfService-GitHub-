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
    
    public partial class func_approval_worklist_Result
    {
        public string approval_id { get; set; }
        public string user_id_creator { get; set; }
        public string empl_id { get; set; }
        public string empl_id_creator { get; set; }
        public string transaction_descr { get; set; }
        public string worklist_status { get; set; }
        public string worklist_action { get; set; }
        public string transaction_page_name { get; set; }
        public string owner_name { get; set; }
        public string creator_name { get; set; }
        public string reviewed_comment { get; set; }
        public string level1_approval_comment { get; set; }
        public string level2_approval_comment { get; set; }
        public string final_approval_comment { get; set; }
        public string disapproval_comment { get; set; }
        public string cancel_pending_comment { get; set; }
        public string cancelled_comment { get; set; }
    }
}
