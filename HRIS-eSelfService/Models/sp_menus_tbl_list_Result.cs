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
    
    public partial class sp_menus_tbl_list_Result
    {
        public int id { get; set; }
        public string menu_name { get; set; }
        public Nullable<int> menu_id_link { get; set; }
        public Nullable<int> menu_level { get; set; }
        public string menu_icon { get; set; }
        public Nullable<int> menu_sort_order { get; set; }
        public string url_name { get; set; }
        public string page_title { get; set; }
        public Nullable<byte> module_id { get; set; }
    }
}
