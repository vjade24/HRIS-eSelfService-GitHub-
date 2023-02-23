﻿//------------------------------------------------------------------------------
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
    
    public partial class HRIS_STAFFINGEntities : DbContext
    {
        public HRIS_STAFFINGEntities()
            : base("name=HRIS_STAFFINGEntities")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<departments_tbl> departments_tbl { get; set; }
        public virtual DbSet<divisions_tbl> divisions_tbl { get; set; }
        public virtual DbSet<functions_tbl> functions_tbl { get; set; }
        public virtual DbSet<fundcharges_tbl> fundcharges_tbl { get; set; }
        public virtual DbSet<fundsources_tbl> fundsources_tbl { get; set; }
        public virtual DbSet<plantilla_tbl> plantilla_tbl { get; set; }
        public virtual DbSet<positions_tbl> positions_tbl { get; set; }
        public virtual DbSet<salaries_tbl> salaries_tbl { get; set; }
        public virtual DbSet<sections_tbl> sections_tbl { get; set; }
        public virtual DbSet<staffing_users_tbl> staffing_users_tbl { get; set; }
        public virtual DbSet<subdepartments_tbl> subdepartments_tbl { get; set; }
        public virtual DbSet<position_jobdescriptions_tbl> position_jobdescriptions_tbl { get; set; }
        public virtual DbSet<reorg_jobdescriptions_tbl> reorg_jobdescriptions_tbl { get; set; }
        public virtual DbSet<reorg_appl_not_qua_tbl> reorg_appl_not_qua_tbl { get; set; }
        public virtual DbSet<vw_vw_personnelnames_tbl_img> vw_vw_personnelnames_tbl_img { get; set; }
        public virtual DbSet<vw_placement_reorg_appl_list> vw_placement_reorg_appl_list { get; set; }
        public virtual DbSet<reorg_appl_tbl> reorg_appl_tbl { get; set; }
    
        public virtual ObjectResult<string> sp_generate_appl_nbr(string p_table_name, Nullable<int> p_charlen, string p_column_name)
        {
            var p_table_nameParameter = p_table_name != null ?
                new ObjectParameter("p_table_name", p_table_name) :
                new ObjectParameter("p_table_name", typeof(string));
    
            var p_charlenParameter = p_charlen.HasValue ?
                new ObjectParameter("p_charlen", p_charlen) :
                new ObjectParameter("p_charlen", typeof(int));
    
            var p_column_nameParameter = p_column_name != null ?
                new ObjectParameter("P_column_name", p_column_name) :
                new ObjectParameter("P_column_name", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<string>("sp_generate_appl_nbr", p_table_nameParameter, p_charlenParameter, p_column_nameParameter);
        }
    
        public virtual ObjectResult<string> sp_get_latest_item_number(string par_budget_year, string par_employment_type)
        {
            var par_budget_yearParameter = par_budget_year != null ?
                new ObjectParameter("par_budget_year", par_budget_year) :
                new ObjectParameter("par_budget_year", typeof(string));
    
            var par_employment_typeParameter = par_employment_type != null ?
                new ObjectParameter("par_employment_type", par_employment_type) :
                new ObjectParameter("par_employment_type", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<string>("sp_get_latest_item_number", par_budget_yearParameter, par_employment_typeParameter);
        }
    
        public virtual ObjectResult<sp_positions_not_in_departmen_list_Result> sp_positions_not_in_departmen_list(string par_department_code, string par_budget_code, string par_employment_type)
        {
            var par_department_codeParameter = par_department_code != null ?
                new ObjectParameter("par_department_code", par_department_code) :
                new ObjectParameter("par_department_code", typeof(string));
    
            var par_budget_codeParameter = par_budget_code != null ?
                new ObjectParameter("par_budget_code", par_budget_code) :
                new ObjectParameter("par_budget_code", typeof(string));
    
            var par_employment_typeParameter = par_employment_type != null ?
                new ObjectParameter("par_employment_type", par_employment_type) :
                new ObjectParameter("par_employment_type", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<sp_positions_not_in_departmen_list_Result>("sp_positions_not_in_departmen_list", par_department_codeParameter, par_budget_codeParameter, par_employment_typeParameter);
        }
    
        public virtual ObjectResult<sp_reorg_jobdescription_tbl_list_Result> sp_reorg_jobdescription_tbl_list(string par_department_code, string par_year, string par_employment_type)
        {
            var par_department_codeParameter = par_department_code != null ?
                new ObjectParameter("par_department_code", par_department_code) :
                new ObjectParameter("par_department_code", typeof(string));
    
            var par_yearParameter = par_year != null ?
                new ObjectParameter("par_year", par_year) :
                new ObjectParameter("par_year", typeof(string));
    
            var par_employment_typeParameter = par_employment_type != null ?
                new ObjectParameter("par_employment_type", par_employment_type) :
                new ObjectParameter("par_employment_type", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<sp_reorg_jobdescription_tbl_list_Result>("sp_reorg_jobdescription_tbl_list", par_department_codeParameter, par_yearParameter, par_employment_typeParameter);
        }
    
        public virtual ObjectResult<sp_postion_jobdescription_tbl_list_Result> sp_postion_jobdescription_tbl_list(string par_department_code, string par_year, string par_employment_type)
        {
            var par_department_codeParameter = par_department_code != null ?
                new ObjectParameter("par_department_code", par_department_code) :
                new ObjectParameter("par_department_code", typeof(string));
    
            var par_yearParameter = par_year != null ?
                new ObjectParameter("par_year", par_year) :
                new ObjectParameter("par_year", typeof(string));
    
            var par_employment_typeParameter = par_employment_type != null ?
                new ObjectParameter("par_employment_type", par_employment_type) :
                new ObjectParameter("par_employment_type", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<sp_postion_jobdescription_tbl_list_Result>("sp_postion_jobdescription_tbl_list", par_department_codeParameter, par_yearParameter, par_employment_typeParameter);
        }
    
        public virtual ObjectResult<sp_reorg_jobdescription_dtl_tbl_list_Result> sp_reorg_jobdescription_dtl_tbl_list(string par_position_code, string par_department_code)
        {
            var par_position_codeParameter = par_position_code != null ?
                new ObjectParameter("par_position_code", par_position_code) :
                new ObjectParameter("par_position_code", typeof(string));
    
            var par_department_codeParameter = par_department_code != null ?
                new ObjectParameter("par_department_code", par_department_code) :
                new ObjectParameter("par_department_code", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<sp_reorg_jobdescription_dtl_tbl_list_Result>("sp_reorg_jobdescription_dtl_tbl_list", par_position_codeParameter, par_department_codeParameter);
        }
    
        public virtual ObjectResult<sp_plantilla_tbl_list_reorg_appl_Result> sp_plantilla_tbl_list_reorg_appl(string par_budget_code, string par_employment_type, string par_department, string par_fund_charges)
        {
            var par_budget_codeParameter = par_budget_code != null ?
                new ObjectParameter("par_budget_code", par_budget_code) :
                new ObjectParameter("par_budget_code", typeof(string));
    
            var par_employment_typeParameter = par_employment_type != null ?
                new ObjectParameter("par_employment_type", par_employment_type) :
                new ObjectParameter("par_employment_type", typeof(string));
    
            var par_departmentParameter = par_department != null ?
                new ObjectParameter("par_department", par_department) :
                new ObjectParameter("par_department", typeof(string));
    
            var par_fund_chargesParameter = par_fund_charges != null ?
                new ObjectParameter("par_fund_charges", par_fund_charges) :
                new ObjectParameter("par_fund_charges", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<sp_plantilla_tbl_list_reorg_appl_Result>("sp_plantilla_tbl_list_reorg_appl", par_budget_codeParameter, par_employment_typeParameter, par_departmentParameter, par_fund_chargesParameter);
        }
    
        public virtual ObjectResult<string> sp_autocreate_appointment_regular(string par_budget_code, string par_item_no, string par_empl_id, string par_user_id, string par_action, string par_employment_type)
        {
            var par_budget_codeParameter = par_budget_code != null ?
                new ObjectParameter("par_budget_code", par_budget_code) :
                new ObjectParameter("par_budget_code", typeof(string));
    
            var par_item_noParameter = par_item_no != null ?
                new ObjectParameter("par_item_no", par_item_no) :
                new ObjectParameter("par_item_no", typeof(string));
    
            var par_empl_idParameter = par_empl_id != null ?
                new ObjectParameter("par_empl_id", par_empl_id) :
                new ObjectParameter("par_empl_id", typeof(string));
    
            var par_user_idParameter = par_user_id != null ?
                new ObjectParameter("par_user_id", par_user_id) :
                new ObjectParameter("par_user_id", typeof(string));
    
            var par_actionParameter = par_action != null ?
                new ObjectParameter("par_action", par_action) :
                new ObjectParameter("par_action", typeof(string));
    
            var par_employment_typeParameter = par_employment_type != null ?
                new ObjectParameter("par_employment_type", par_employment_type) :
                new ObjectParameter("par_employment_type", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<string>("sp_autocreate_appointment_regular", par_budget_codeParameter, par_item_noParameter, par_empl_idParameter, par_user_idParameter, par_actionParameter, par_employment_typeParameter);
        }
    
        public virtual ObjectResult<sp_placement_empl_tbl_list_Result> sp_placement_empl_tbl_list(string par_budget_code, string par_item_no)
        {
            var par_budget_codeParameter = par_budget_code != null ?
                new ObjectParameter("par_budget_code", par_budget_code) :
                new ObjectParameter("par_budget_code", typeof(string));
    
            var par_item_noParameter = par_item_no != null ?
                new ObjectParameter("par_item_no", par_item_no) :
                new ObjectParameter("par_item_no", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<sp_placement_empl_tbl_list_Result>("sp_placement_empl_tbl_list", par_budget_codeParameter, par_item_noParameter);
        }
    
        public virtual ObjectResult<sp_plantilla_vacant_reorg_Result> sp_plantilla_vacant_reorg(string par_budget_code, string par_employment_type, string par_department_code)
        {
            var par_budget_codeParameter = par_budget_code != null ?
                new ObjectParameter("par_budget_code", par_budget_code) :
                new ObjectParameter("par_budget_code", typeof(string));
    
            var par_employment_typeParameter = par_employment_type != null ?
                new ObjectParameter("par_employment_type", par_employment_type) :
                new ObjectParameter("par_employment_type", typeof(string));
    
            var par_department_codeParameter = par_department_code != null ?
                new ObjectParameter("par_department_code", par_department_code) :
                new ObjectParameter("par_department_code", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<sp_plantilla_vacant_reorg_Result>("sp_plantilla_vacant_reorg", par_budget_codeParameter, par_employment_typeParameter, par_department_codeParameter);
        }
    
        public virtual ObjectResult<sp_reorg_appl_list_Result> sp_reorg_appl_list(string par_empl_id)
        {
            var par_empl_idParameter = par_empl_id != null ?
                new ObjectParameter("par_empl_id", par_empl_id) :
                new ObjectParameter("par_empl_id", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<sp_reorg_appl_list_Result>("sp_reorg_appl_list", par_empl_idParameter);
        }
    
        public virtual ObjectResult<sp_plantilla22_structure_report_Result> sp_plantilla22_structure_report(string par_budget_code, string par_department_code, string par_employment_type)
        {
            var par_budget_codeParameter = par_budget_code != null ?
                new ObjectParameter("par_budget_code", par_budget_code) :
                new ObjectParameter("par_budget_code", typeof(string));
    
            var par_department_codeParameter = par_department_code != null ?
                new ObjectParameter("par_department_code", par_department_code) :
                new ObjectParameter("par_department_code", typeof(string));
    
            var par_employment_typeParameter = par_employment_type != null ?
                new ObjectParameter("par_employment_type", par_employment_type) :
                new ObjectParameter("par_employment_type", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<sp_plantilla22_structure_report_Result>("sp_plantilla22_structure_report", par_budget_codeParameter, par_department_codeParameter, par_employment_typeParameter);
        }
    
        public virtual ObjectResult<sp_reorg_structure_Result> sp_reorg_structure(string par_budget_code, string par_department_code)
        {
            var par_budget_codeParameter = par_budget_code != null ?
                new ObjectParameter("par_budget_code", par_budget_code) :
                new ObjectParameter("par_budget_code", typeof(string));
    
            var par_department_codeParameter = par_department_code != null ?
                new ObjectParameter("par_department_code", par_department_code) :
                new ObjectParameter("par_department_code", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<sp_reorg_structure_Result>("sp_reorg_structure", par_budget_codeParameter, par_department_codeParameter);
        }
    
        public virtual ObjectResult<sp_reorg_appl_upd_insert_Result> sp_reorg_appl_upd_insert(string par_budget_code, string par_empl_id, string par_item_no, string par_user_id, string par_employment_type)
        {
            var par_budget_codeParameter = par_budget_code != null ?
                new ObjectParameter("par_budget_code", par_budget_code) :
                new ObjectParameter("par_budget_code", typeof(string));
    
            var par_empl_idParameter = par_empl_id != null ?
                new ObjectParameter("par_empl_id", par_empl_id) :
                new ObjectParameter("par_empl_id", typeof(string));
    
            var par_item_noParameter = par_item_no != null ?
                new ObjectParameter("par_item_no", par_item_no) :
                new ObjectParameter("par_item_no", typeof(string));
    
            var par_user_idParameter = par_user_id != null ?
                new ObjectParameter("par_user_id", par_user_id) :
                new ObjectParameter("par_user_id", typeof(string));
    
            var par_employment_typeParameter = par_employment_type != null ?
                new ObjectParameter("par_employment_type", par_employment_type) :
                new ObjectParameter("par_employment_type", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<sp_reorg_appl_upd_insert_Result>("sp_reorg_appl_upd_insert", par_budget_codeParameter, par_empl_idParameter, par_item_noParameter, par_user_idParameter, par_employment_typeParameter);
        }
    
        public virtual ObjectResult<sp_placement_pos_tbl_list_Result> sp_placement_pos_tbl_list(string par_budget_code, string par_department_code, string par_employment_type)
        {
            var par_budget_codeParameter = par_budget_code != null ?
                new ObjectParameter("par_budget_code", par_budget_code) :
                new ObjectParameter("par_budget_code", typeof(string));
    
            var par_department_codeParameter = par_department_code != null ?
                new ObjectParameter("par_department_code", par_department_code) :
                new ObjectParameter("par_department_code", typeof(string));
    
            var par_employment_typeParameter = par_employment_type != null ?
                new ObjectParameter("par_employment_type", par_employment_type) :
                new ObjectParameter("par_employment_type", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<sp_placement_pos_tbl_list_Result>("sp_placement_pos_tbl_list", par_budget_codeParameter, par_department_codeParameter, par_employment_typeParameter);
        }
    }
}
