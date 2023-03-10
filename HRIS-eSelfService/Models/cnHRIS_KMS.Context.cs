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
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    using System.Data.Entity.Core.Objects;
    using System.Linq;
    
    public partial class HRIS_KMSEntities : DbContext
    {
        public HRIS_KMSEntities()
            : base("name=HRIS_KMSEntities")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<training_empl_tbl> training_empl_tbl { get; set; }
        public virtual DbSet<training_info_tbl> training_info_tbl { get; set; }
        public virtual DbSet<training_mode_tbl> training_mode_tbl { get; set; }
        public virtual DbSet<training_type_tbl> training_type_tbl { get; set; }
        public virtual DbSet<vw_training_empl_tbl_list> vw_training_empl_tbl_list { get; set; }
        public virtual DbSet<vw_training_empl_tbl_list_completed> vw_training_empl_tbl_list_completed { get; set; }
        public virtual DbSet<vw_training_empl_tbl_list_not_started> vw_training_empl_tbl_list_not_started { get; set; }
        public virtual DbSet<vw_training_info_tbl_list> vw_training_info_tbl_list { get; set; }
        public virtual DbSet<vw_training_mode_tbl_list> vw_training_mode_tbl_list { get; set; }
        public virtual DbSet<vw_training_type_tbl_list> vw_training_type_tbl_list { get; set; }
    
        public virtual ObjectResult<sp_training_type_tbl_list_Result> sp_training_type_tbl_list()
        {
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<sp_training_type_tbl_list_Result>("sp_training_type_tbl_list");
        }
    
        public virtual ObjectResult<sp_user_login_KMS_Result> sp_user_login_KMS(string par_user_id, string par_user_password)
        {
            var par_user_idParameter = par_user_id != null ?
                new ObjectParameter("par_user_id", par_user_id) :
                new ObjectParameter("par_user_id", typeof(string));
    
            var par_user_passwordParameter = par_user_password != null ?
                new ObjectParameter("par_user_password", par_user_password) :
                new ObjectParameter("par_user_password", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<sp_user_login_KMS_Result>("sp_user_login_KMS", par_user_idParameter, par_user_passwordParameter);
        }
    
        public virtual ObjectResult<sp_user_menu_access_role_list_KMS_Result> sp_user_menu_access_role_list_KMS(string par_user_id)
        {
            var par_user_idParameter = par_user_id != null ?
                new ObjectParameter("par_user_id", par_user_id) :
                new ObjectParameter("par_user_id", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<sp_user_menu_access_role_list_KMS_Result>("sp_user_menu_access_role_list_KMS", par_user_idParameter);
        }
    }
}
