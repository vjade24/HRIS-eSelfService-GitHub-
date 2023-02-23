using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HRIS_eSelfService.Models
{
    public class User_Menu : sp_user_menu_access_role_list_Result
    {
        //public string remittancetype_code { get; set; }
        //public string remittancetype_descr { get; set; }
        //public string remittance_ctrl_nbr { get; set; }
        //public string remittance_status { get; set; }
        //public string remittance_year { get; set; }
        //public string remittance_month { get; set; }
        //public string remittance_month_descr { get; set; }
        //public string employment_type { get; set; }
        //public string employment_type_descr { get; set; }
        //public string remittance_status_descr { get; set; }
        public string username { get; set; }
    }
    
}