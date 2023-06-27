ALTER PROCEDURE sp_batch_generate_dtr_emptype_10  
 @p_dtr_year    VARCHAR(04),    
 @p_dtr_month   VARCHAR(02),    
 @p_empl_id    VARCHAR(08),    
 @p_employment_type  VARCHAR(02),    
 @p_department_code  VARCHAR(02),    
 @p_user_id    VARCHAR(30)    
 WITH RECOMPILE     
AS    
 BEGIN    
  BEGIN TRY    
   BEGIN TRAN      
     
     DECLARE @p_dtr_year1    VARCHAR(04)  =  @p_dtr_year     
  DECLARE @p_dtr_month1    VARCHAR(02)  =  @p_dtr_month     
  DECLARE @p_empl_id1    VARCHAR(08)  =  @p_empl_id     
  DECLARE @p_employment_type1  VARCHAR(02)  =  @p_employment_type   
  DECLARE @p_department_code1  VARCHAR(02)  =  @p_department_code   
  DECLARE @p_user_id1    VARCHAR(30)  =  @p_user_id         
  --DECLARE @p_dtr_year   VARCHAR(04)    
  --DECLARE @p_dtr_month   VARCHAR(02)    
  --DECLARE @p_empl_id   VARCHAR(08)    
  --DECLARE @p_employment_type VARCHAR(02)    
  --DECLARE @p_department_code VARCHAR(02)    
    
  --SET @p_dtr_year   = '2021'    
  --SET @p_dtr_month  = '04'    
  --SET @p_empl_id   = '2161'    
  --SET @p_employment_type = 'JO'    
  --SET @p_department_code  = '02'    
    
 BEGIN     
    
    
 --BEGIN TRAN    
    --PRE DEFINED TS CODE    
    --TS CODE 99 - REGULAR TIME ENTRIES    
    --TS CODE 98 - *WORK FROM HOME    
    
    DECLARE @v_time_ot_payable_minimum  FLOAT    
    DECLARE @v_late_no_ot     BIT    
    DECLARE @v_hours_in_1day_conv   FLOAT    
    DECLARE @v_hours_in_1day_conv_static FLOAT --TO GET THE DAYS COUNT: JORGE: 08-24-2020    
    DECLARE @v_ot_break_hours    FLOAT    
    DECLARE @v_overtime_divisor    INT    
       
    DECLARE @v_breakfast_break_start  VARCHAR(05)    
    DECLARE @v_breakfast_break_end   VARCHAR(05)    
    DECLARE @v_lunch_break_start   VARCHAR(05)    
    DECLARE @v_lunch_break_end    VARCHAR(05)    
    DECLARE @v_dinner_break_start   VARCHAR(05)    
    DECLARE @v_dinner_break_end    VARCHAR(05)    
    DECLARE @v_approval_status    VARCHAR(01)    
        
    SET @v_approval_status = 'N'    
        
    SET @v_breakfast_break_start = '06:00'    
    SET @v_breakfast_break_end  = '07:00'    
    SET @v_lunch_break_start  = '12:00'    
    SET @v_lunch_break_end   = '13:00'    
    SET @v_dinner_break_start  = '20:00'    
    SET @v_dinner_break_end   = '21:00'    
    
    SET @v_late_no_ot    = 0    
    SET @v_time_ot_payable_minimum = 0    
    SET @v_hours_in_1day_conv  = 0    
    SET @v_ot_break_hours   = 0    
    SET @v_hours_in_1day_conv_static = 0    
    SET @v_overtime_divisor = 4    
       
    --GET MINIMUM NUMBER OF HOURS FOR OVERTIME    
    DECLARE @v_effective_date_install DATE       
    SELECT     
     TOP 1     
      @v_time_ot_payable_minimum   = A.minimum_ot_hours    
     ,@v_late_no_ot      = A.late_no_ot    
     ,@v_hours_in_1day_conv    = A.hours_in_1day_conv    
     ,@v_hours_in_1day_conv_static = A.hours_in_1day_conv    
     ,@v_ot_break_hours     = A.ot_break_hours  
  ,@v_effective_date_install = effective_date    
    FROM aats_installation_tbl A    
    WHERE A.effective_date <= GETDATE()    
    
      
  --DECLARE @p_hdr_tbl TABLE (    
  --  dtr_order_no    VARCHAR(010)    
  -- ,dtr_year     VARCHAR(004)    
  -- ,dtr_month     VARCHAR(002)    
  -- ,department_code   VARCHAR(002)    
  -- ,approval_status   VARCHAR(001)     
  -- ,approval_id    VARCHAR(015)    
  -- ,approved_date    DATE    
  -- ,remarks     VARCHAR(255)    
  -- ,empl_id     VARCHAR(08)    
  -- ,created_ddtm    DATETIME    
  -- ,created_by     VARCHAR(30)    
  -- ,updated_ddtm    DATETIME    
  -- ,updated_by     VARCHAR(30)    
  -- ,frst_qcna_posted_ddtm  DATETIME    
  -- ,frst_qcna_posted_by  VARCHAR(30)    
  -- ,sec_qcna_posted_ddtm  DATETIME    
  -- ,sec_qcna_posted_by   VARCHAR(30)    
  -- ,post_status    VARCHAR(01)    
  --)    
    
  --DECLARE @p_dtl_tbl TABLE (    
  --  dtr_order_no    VARCHAR(010)    
  -- ,empl_id     VARCHAR(008)    
  -- ,dtr_date     DATE    
  -- ,time_in_am     VARCHAR(005)    
  -- ,time_out_am    VARCHAR(005)    
  -- ,time_in_pm     VARCHAR(005)    
  -- ,time_out_pm    VARCHAR(005)    
  -- ,ts_code     VARCHAR(002)    
  -- ,under_Time     INT    
  -- ,under_Time_remarks   VARCHAR(007)    
  -- ,remarks_details   VARCHAR(050)    
  -- ,time_ot_hris    VARCHAR(015)    
  -- ,time_days_equi    FLOAT    
  -- ,time_hours_equi   FLOAT    
  -- ,time_ot_payable   FLOAT    
  -- ,approval_status   VARCHAR(001)    
  -- ,no_of_as     DECIMAL    
  -- ,no_of_ob     DECIMAL    
  -- ,no_of_lv     DECIMAL    
  --)    
 ----------------------------------------------------    
 -- Delete Processed Data from Temporary Tables    
 ----------------------------------------------------    
  DELETE FROM dbo.empl_dtr_hdr_tmp_10    
  WHERE dtr_user_id = @p_user_id1    
    
  DELETE FROM dbo.empl_dtr_dtl_tmp_10    
  WHERE dtr_user_id = @p_user_id1    
 ----------------------------------------------------    
    
  DECLARE @h_dtr_order_no    VARCHAR(010)    
  DECLARE @h_dtr_year     VARCHAR(004)    
  DECLARE @h_dtr_month    VARCHAR(002)    
  DECLARE @h_department_code   VARCHAR(002)    
  DECLARE @h_approval_status   VARCHAR(001)     
  DECLARE @h_approval_id    VARCHAR(015)    
  DECLARE @h_approved_date   DATE    
  DECLARE @h_remarks     VARCHAR(255)    
  DECLARE @v_remarks_pt  VARCHAR(100)    
  DECLARE @d_dtr_order_no    VARCHAR(10)    
  DECLARE @d_empl_id     VARCHAR(08)    
  DECLARE @d_dtr_date     DATE    
  DECLARE @d_time_in_am    VARCHAR(005)    
  DECLARE @d_time_out_am    VARCHAR(005)    
  DECLARE @d_time_in_pm    VARCHAR(005)    
  DECLARE @d_time_out_pm    VARCHAR(005)    
  DECLARE @d_ts_code     VARCHAR(002)    
  DECLARE @d_under_Time    INT    
  DECLARE @d_under_Time_remarks  VARCHAR(007)    
  DECLARE @d_remarks_details   VARCHAR(050)    
  DECLARE @d_time_ot_hris    VARCHAR(015)    
  DECLARE @d_time_days_equi   FLOAT    
  DECLARE @d_time_hours_equi   FLOAT    
  DECLARE @d_time_ot_payable   FLOAT    
  DECLARE @d_approval_status   VARCHAR(001)    
  DECLARE @d_no_of_as     DECIMAL    
  DECLARE @d_no_of_ob     DECIMAL    
  DECLARE @d_no_of_lv     DECIMAL    
    
  DECLARE @v_empl_id      VARCHAR(08)    
  DECLARE @v_dtr_date      DATE     
  DECLARE @v_cal_date_type    VARCHAR(03)    
  DECLARE @v_tse_day_parent    VARCHAR(04)    
  DECLARE @v_tse_in_am     VARCHAR(05)    
  DECLARE @v_pre_time_in_hrs    VARCHAR(05)    
  DECLARE @v_tse_out_am     VARCHAR(05)    
  DECLARE @v_tse_in_pm     VARCHAR(05)    
  DECLARE @v_tse_out_pm     VARCHAR(05)    
  DECLARE @v_post_time_out_hrs   VARCHAR(05)    
  DECLARE @v_tse_month     VARCHAR(02)    
  DECLARE @v_tse_year      VARCHAR(04)    
  DECLARE @v_ts_code      VARCHAR(02)    
  --DECLARE @v_tse_dtl_id     VARCHAR(20)    
  DECLARE @v_ts_add_days     INT    
  DECLARE @v_ts_mid_break     BIT    
  DECLARE @v_ts_day_equivalent   FLOAT    
  DECLARE @v_reg_am_start_time   VARCHAR(05)    
  DECLARE @v_reg_am_end_time    VARCHAR(05)    
  DECLARE @v_reg_pm_start_time   VARCHAR(05)    
  DECLARE @v_reg_pm_end_time    VARCHAR(05)    
    
  DECLARE @v_reg_am_start_time_tmp   VARCHAR(05)    
  DECLARE @v_reg_am_end_time_tmp    VARCHAR(05)    
  DECLARE @v_reg_pm_start_time_tmp   VARCHAR(05)    
  DECLARE @v_reg_pm_end_time_tmp    VARCHAR(05)    
    
  DECLARE @v_actual_time_in_am   VARCHAR(05)    
  DECLARE @v_actual_time_out_am   VARCHAR(05)    
  DECLARE @v_actual_time_in_pm   VARCHAR(05)    
  DECLARE @v_actual_time_out_pm   VARCHAR(05)    
    
  DECLARE @v_as_exist      VARCHAR(01)    
  DECLARE @v_time_in_am     VARCHAR(05)    
  DECLARE @v_time_out_am     VARCHAR(05)    
  DECLARE @v_time_in_pm     VARCHAR(05)    
  DECLARE @v_time_out_pm     VARCHAR(05)    
  DECLARE @v_inputtype_code    VARCHAR(05)    
  DECLARE @v_inputtype_sub_descr   VARCHAR(50)    
  DECLARE @v_remarks      VARCHAR(255)    
  DECLARE @v_astype_code     VARCHAR(02)    
  DECLARE @v_n_time_in_am     VARCHAR(05)    
  DECLARE @v_n_time_out_am    VARCHAR(05)    
  DECLARE @v_n_time_in_pm     VARCHAR(05)    
  DECLARE @v_n_time_out_pm    VARCHAR(05)    
  DECLARE @v_n_inputtype_code    VARCHAR(05)    
  DECLARE @v_n_inputtype_sub_descr  VARCHAR(50)    
  DECLARE @v_n_remarks   VARCHAR(255)    
  DECLARE @v_n_astype_code    VARCHAR(02)    
  DECLARE @v_n_reason_code    VARCHAR(05)    
  DECLARE @v_lv_exist      VARCHAR(01)    
  DECLARE @v_date_num_day     MONEY    
  DECLARE @v_leavetype_code    VARCHAR(04)    
  DECLARE @v_leavetype_descr    VARCHAR(500)    
  DECLARE @v_leave_comments    VARCHAR(255)    
    
  DECLARE @v_to_exist      VARCHAR(01)    
  DECLARE @v_to_time_in_am    VARCHAR(05)     
  DECLARE @v_to_time_out_am    VARCHAR(05)     
  DECLARE @v_to_time_in_pm    VARCHAR(05)     
  DECLARE @v_to_time_out_pm    VARCHAR(05)     
  DECLARE @v_to_remarks     VARCHAR(05)    
    
  DECLARE @v_otr_exist     VARCHAR(01)    
  DECLARE @v_ot_start_time    VARCHAR(05)     
  DECLARE @v_ot_start_ampm    VARCHAR(02)     
  DECLARE @v_ot_end_time     VARCHAR(05)     
  DECLARE @v_ot_end_ampm     VARCHAR(02)     
  DECLARE @v_ot_remarks     VARCHAR(255)     
  DECLARE @v_weekdays_flag    BIT    
  DECLARE @v_weekdays_in     VARCHAR(05)    DECLARE @v_weekdays_in_ampm    VARCHAR(02)    
  DECLARE @v_weekdays_out     VARCHAR(05)    
  DECLARE @v_weekdays_out_ampm   VARCHAR(02)    
  DECLARE @v_weekend_flag     BIT    
  DECLARE @v_weekend_in     VARCHAR(05)    
  DECLARE @v_weekend_in_ampm    VARCHAR(02)    
  DECLARE @v_weekend_out     VARCHAR(05)    
  DECLARE @v_weekend_out_ampm    VARCHAR(02)    
  DECLARE @v_holiday_flag     BIT    
  DECLARE @v_holiday_in     VARCHAR(05)    
  DECLARE @v_holiday_in_ampm    VARCHAR(02)    
  DECLARE @v_holiday_out     VARCHAR(05)    
  DECLARE @v_holiday_out_ampm    VARCHAR(02)    
  DECLARE @v_dayoff_ot_flag    BIT    
  DECLARE @v_dayoff_ot_in     VARCHAR(05)    
  DECLARE @v_dayoff_ot_in_ampm   VARCHAR(02)    
  DECLARE @v_dayoff_ot_out    VARCHAR(05)    
  DECLARE @v_dayoff_ot_out_ampm   VARCHAR(02)    
  DECLARE @v_ot_coc_credit_flag   BIT    
  DECLARE @d_remarks_details_half_day  VARCHAR(15)    
    
  DECLARE @v_first_row      INT    
     
      
  --SET PRE AND POST TIME IN/TIME OUT    
  DECLARE @v_pre_time_in   VARCHAR(05)    
  DECLARE @v_pre_time_out   VARCHAR(05)    
  DECLARE @v_pre_time_in_minute   INT    
  DECLARE @v_pre_time_out_minute  INT    
    
  DECLARE @v_cal_date_dow     VARCHAR(03)    
  DECLARE @v_cal_hol_descr    VARCHAR(30)    
  DECLARE @v_frst_qcna_posted_ddtm  DATETIME    
  DECLARE @v_sec_qcna_posted_ddtm   DATETIME    
  DECLARE @v_frst_qcna_posted_by   VARCHAR(30)    
  DECLARE @v_sec_qcna_posted_by   VARCHAR(30)    
    
  declare @cnt_cal int  
  SET @cnt_cal = 1  
  declare @cnt_cal_max int  
  SET @cnt_cal_max = 0  
  
 DECLARE @v_table_adj_cal AS TABLE  
  (row_nbr INT  
  ,empl_id  VARCHAR(08)  
  ,dtr_date  DATE  
  ,cal_date_type VARCHAR(50)          
  ,cal_date_dow     VARCHAR(50)           
  ,cal_hol_descr    VARCHAR(50)           
  ,tse_day_parent   VARCHAR(02)              
  ,tse_in_am        VARCHAR(05)  
  ,pre_time_in_hrs  VARCHAR(05)      
  ,tse_out_am       VARCHAR(05)    
  ,tse_in_pm         VARCHAR(05)        
  ,tse_out_pm         VARCHAR(05)       
  ,post_time_out_hrs   VARCHAR(05)          
  ,tse_month          VARCHAR(02)       
  ,tse_year               VARCHAR(04)    
  ,ts_code            VARCHAR(02)   
    
   ,ts_add_days           INT    
   ,ts_mid_break          BIT     
   ,ts_day_equivalent     FLOAT        
   ,reg_am_start_time     VARCHAR(05)      
   ,reg_am_end_time        VARCHAR(05)     
   ,reg_pm_start_time       VARCHAR(05)       
   ,reg_pm_end_time         VARCHAR(05)    
   ,actual_time_in_am        VARCHAR(05)      
   ,actual_time_out_am    VARCHAR(05)     
   ,actual_time_in_pm       VARCHAR(05)     
   ,actual_time_out_pm      VARCHAR(05)  
   ,as_exist    VARCHAR(01)  
   ,time_in_am    VARCHAR(05)  
   ,time_out_am   VARCHAR(05)  
   ,time_in_pm    VARCHAR(05)  
   ,time_out_pm    VARCHAR(05)  
   ,inputtype_code   VARCHAR(05)  
   ,inputtype_sub_descr   VARCHAR(50)  
   ,remarks     VARCHAR(MAX)  
   ,astype_code    VARCHAR(05)  
   ,n_time_in_am   VARCHAR(05)  
   ,n_time_out_am   VARCHAR(05)  
   ,n_time_in_pm   VARCHAR(05)  
   ,n_time_out_pm   VARCHAR(05)  
   ,n_inputtype_code   VARCHAR(05)  
   ,n_inputtype_sub_descr VARCHAR(50)  
   ,n_remarks    VARCHAR(MAX)  
   ,n_astype_code   VARCHAR(05)  
   ,n_reason_code   VARCHAR(05)  
   ,lv_exist    VARCHAR(01)  
   ,date_num_day   INT  
   ,leavetype_code   VARCHAR(05)  
   ,leavetype_descr   VARCHAR(MAX)  
   ,leave_comments   VARCHAR(MAX)  
   ,to_exist    VARCHAR(01)  
   ,to_time_in_am   VARCHAR(05)  
   ,to_time_out_am    VARCHAR(05)  
   ,to_time_in_pm     VARCHAR(05)  
   ,to_time_out_pm    VARCHAR(05)  
   ,to_remarks    VARCHAR(MAX)  
   ,otr_exist    VARCHAR(01)  
   ,ot_start_time   VARCHAR(05)  
   ,ot_start_ampm   VARCHAR(05)  
   ,ot_end_time    VARCHAR(05)  
   ,ot_end_ampm    VARCHAR(05)  
   ,ot_remarks    VARCHAR(MAX)  
   ,weekdays_flag   BIT  
   ,weekdays_in    VARCHAR(05)  
   ,weekdays_in_ampm  VARCHAR(05)  
   ,weekdays_out   VARCHAR(05)  
   ,weekdays_out_ampm  VARCHAR(05)  
   ,weekend_flag   BIT  
   ,weekend_in    VARCHAR(05)  
   ,weekend_in_ampm   VARCHAR(05)  
   ,weekend_out    VARCHAR(05)  
   ,weekend_out_ampm  VARCHAR(05)  
   ,holiday_flag   BIT  
   ,holiday_in    VARCHAR(05)  
   ,holiday_in_ampm   VARCHAR(05)  
   ,holiday_out    VARCHAR(05)  
   ,holiday_out_ampm  VARCHAR(05)  
   ,dayoff_ot_flag   BIT  
   ,dayoff_ot_in   VARCHAR(05)  
   ,dayoff_ot_in_ampm  VARCHAR(05)  
   ,dayoff_ot_out   VARCHAR(05)  
   ,dayoff_ot_out_ampm  VARCHAR(05)  
   ,ot_coc_credit_flag  VARCHAR(05)  
   ,frst_qcna_posted_ddtm DATETIME  
   ,sec_qcna_posted_ddtm DATETIME  
   ,frst_qcna_posted_by  VARCHAR(30)  
   ,sec_qcna_posted_by  VARCHAR(30)  
   --,flag_dept_policy  VARCHAR(05)  
  )  
  -- Time    
  -- AS    
  -- LV    
  -- TO    
  -- OT    
      
  SET @v_first_row = 0    
  --DECLARE c_DTR CURSOR FOR   
  INSERT INTO @v_table_adj_cal     
  SELECT DISTINCT    
   ROW_NUMBER() OVER(ORDER BY A.empl_id, B.dtr_date ASC   ) AS row_nbr     
   ,A.empl_id    
   ,B.dtr_date        
   ,B.cal_date_type     
   ,B.cal_date_dow        
   ,B.cal_hol_descr       
   ,B.tse_day_parent       
   ,B.tse_in_am        
   ,B.pre_time_in_hrs      
   ,B.tse_out_am        
   ,B.tse_in_pm        
   ,B.tse_out_pm        
   ,B.post_time_out_hrs      
   ,B.tse_month        
   ,B.tse_year        
   ,B.ts_code        
   --,B.tse_dtl_id        
   ,B.ts_add_days       
   ,B.ts_mid_break       
   ,B.ts_day_equivalent      
   ,B.reg_am_start_time      
   ,B.reg_am_end_time      
   ,B.reg_pm_start_time      
   ,B.reg_pm_end_time      
   ,B.actual_time_in_am      
   ,B.actual_time_out_am      
   ,B.actual_time_in_pm      
   ,B.actual_time_out_pm     
      
   ,IIF(ISNULL(C.dtr_date,'')='','N','Y')  AS as_exist    
   ,ISNULL(C.time_in_am   ,'')  AS time_in_am         
   ,ISNULL(C.time_out_am   ,'')  AS time_out_am       
   ,ISNULL(C.time_in_pm   ,'')  AS time_in_pm       
   ,ISNULL(C.time_out_pm   ,'')  AS time_out_pm       
   ,ISNULL(C.inputtype_code  ,'')  AS inputtype_code      
   ,ISNULL(C.inputtype_sub_descr ,'')  AS inputtype_sub_descr     
   ,ISNULL(C.remarks    ,'')  AS remarks        
   ,ISNULL(C.astype_code   ,'')  AS astype_code       
   ,ISNULL(C.n_time_in_am   ,'')  AS n_time_in_am       
   ,ISNULL(C.n_time_out_am   ,'')  AS n_time_out_am       
   ,ISNULL(C.n_time_in_pm   ,'')  AS n_time_in_pm       
   ,ISNULL(C.n_time_out_pm   ,'')  AS n_time_out_pm       
   ,ISNULL(C.n_inputtype_code  ,'')  AS n_inputtype_code      
   ,ISNULL(C.n_inputtype_sub_descr ,'')  AS n_inputtype_sub_descr     
   ,ISNULL(C.n_remarks    ,'')  AS n_remarks        
   ,ISNULL(C.n_astype_code   ,'')  AS n_astype_code       
   ,ISNULL(C.n_reason_code   ,'')  AS n_reason_code    
   ,IIF(ISNULL(D.dtr_date,'')='','N','Y')  AS lv_exist    
   ,ISNULL(D.date_num_day   ,0)   AS date_num_day      
   ,ISNULL(D.leavetype_code  ,'')  AS leavetype_code     
   ,ISNULL(D.leavetype_descr  ,'')  AS leavetype_descr     
   ,ISNULL(D.leave_comments  ,'')  AS leave_comments     
    
   ,IIF(ISNULL(E.dtr_date,'')='','N','Y')  AS to_exist    
   ,ISNULL(E.to_time_in_am,'')     AS to_time_in_am       
   ,ISNULL(E.to_time_out_am,'')    AS to_time_out_am       
   ,ISNULL(E.to_time_in_pm,'')     AS to_time_in_pm        
   ,ISNULL(E.to_time_out_pm,'')    AS to_time_out_pm        
   ,ISNULL(E.to_remarks,'')     AS to_remarks        
    
   ,IIF(ISNULL(F.dtr_date,'')='','N','Y')  AS otr_exist    
   ,ISNULL(F.ot_start_time  ,'')   AS ot_start_time      
   ,ISNULL(F.ot_start_ampm  ,'')   AS ot_start_ampm      
   ,ISNULL(F.ot_end_time  ,'')   AS ot_end_time        
   ,ISNULL(F.ot_end_ampm  ,'')   AS ot_end_ampm        
   ,ISNULL(F.ot_remarks  ,'')   AS ot_remarks        
   ,ISNULL(F.weekdays_flag  ,0)    AS weekdays_flag      
   ,ISNULL(F.weekdays_in  ,'')   AS weekdays_in        
   ,ISNULL(F.weekdays_in_ampm ,'')   AS weekdays_in_ampm       
   ,ISNULL(F.weekdays_out  ,'')   AS weekdays_out        
   ,ISNULL(F.weekdays_out_ampm ,'')   AS weekdays_out_ampm     
   ,ISNULL(F.weekend_flag  ,0)    AS weekend_flag        
   ,ISNULL(F.weekend_in  ,'')   AS weekend_in        
   ,ISNULL(F.weekend_in_ampm ,'')   AS weekend_in_ampm       
   ,ISNULL(F.weekend_out  ,'')   AS weekend_out        
   ,ISNULL(F.weekend_out_ampm ,'')   AS weekend_out_ampm       
   ,ISNULL(F.holiday_flag  ,0)    AS holiday_flag        
   ,ISNULL(F.holiday_in  ,'')   AS holiday_in        
   ,ISNULL(F.holiday_in_ampm ,'')   AS holiday_in_ampm       
   ,ISNULL(F.holiday_out  ,'')   AS holiday_out        
   ,ISNULL(F.holiday_out_ampm ,'')   AS holiday_out_ampm       
   ,ISNULL(F.dayoff_ot_flag ,0)    AS dayoff_ot_flag       
   ,ISNULL(F.dayoff_ot_in  ,'')   AS dayoff_ot_in        
   ,ISNULL(F.dayoff_ot_in_ampm ,'')   AS dayoff_ot_in_ampm     
   ,ISNULL(F.dayoff_ot_out  ,'')   AS dayoff_ot_out      
   ,ISNULL(F.dayoff_ot_out_ampm,'')   AS dayoff_ot_out_ampm      
   ,ISNULL(F.ot_coc_credit_flag,0)    AS ot_coc_credit_flag      
   ,Z.frst_qcna_posted_ddtm     
   ,Z.sec_qcna_posted_ddtm     
   ,ISNULL(Z.frst_qcna_posted_by,'')  AS frst_qcna_posted_by    
   ,ISNULL(Z.sec_qcna_posted_by,'')  AS sec_qcna_posted_by    
  FROM vw_payrollemployeemaster_ATS A    
  INNER JOIN dbo.func_empl_monthly_entries_new(@p_dtr_year1, @p_dtr_month1,@p_empl_id1) B    
   ON B.empl_id = A.empl_id    
   AND B.employment_type = A.employment_type    
  LEFT JOIN dbo.func_as_info_date_new(@p_dtr_year1, @p_dtr_month1,@p_empl_id1) C    
   ON  C.empl_id  = A.empl_id    
   AND C.dtr_date = B.dtr_date     
  LEFT JOIN dbo.func_LV_info_date(@p_dtr_year1, @p_dtr_month1,@p_empl_id1) D    
   ON  D.empl_id  = A.empl_id    
   AND D.dtr_date = B.dtr_date     
  LEFT JOIN dbo.func_to_info_date(@p_dtr_year1, @p_dtr_month1,@p_empl_id1) E    
   ON  E.empl_id  = A.empl_id    
   AND E.dtr_date = B.dtr_date     
  LEFT JOIN dbo.func_otrqst_info_date(@p_dtr_year1, @p_dtr_month1,@p_empl_id1) F    
   ON  F.empl_id  = A.empl_id    
   AND F.dtr_date = B.dtr_date      
  LEFT JOIN dbo.vw_payrollemployeemaster_asg_tbl C2    
    ON  C2.empl_id = B.empl_id    
    AND C2.employment_type = B.employment_type    
    AND (C2.ss_appl_flag = 1    
      OR C2.upd_master_flag = 1)                   
  LEFT JOIN empl_dtr_hdr_tbl Z    
    ON  Z.empl_id = A.empl_id    
    AND Z.dtr_month = @p_dtr_month1     
    AND Z.dtr_year  = @p_dtr_year1    
      
  WHERE A.employment_type = @p_employment_type1    
  --AND NOT EXISTS (SELECT 'X' FROM empl_dtr_hdr_tbl X1     
  --    WHERE X1.empl_id  = A.empl_id    
  --    AND X1.dtr_month = @p_dtr_month    
  --    AND X1.dtr_year  = @p_dtr_year     
  --    AND X1.approval_status IN ('A','S','V')    
  --    AND CONVERT(DATE,X1.frst_qcna_posted_ddtm) <> CONVERT(DATE,'')    
  --    AND CONVERT(DATE,X1.sec_qcna_posted_ddtm) <> CONVERT(DATE,'')    
  --    )    
  AND (    
    (@p_empl_id1 <> '' AND    
     @p_empl_id1 = A.empl_id    
    )    
    OR @p_empl_id1 = ''    
   )    
  --AND (    
  --  (@p_department_code <> '' AND    
  --   @p_department_code = A.department_code    
  --  )    
  --  OR @p_department_code = ''    
  -- )    
    
   AND (ISNULL(@p_department_code1,'')=''    
      OR    
      (ISNULL(@p_department_code1,'')<>''     
       AND IIF(ISNULL(C2.department_code,'') <> '',C2.department_code,A.department_code) = @p_department_code1)    
   )    
  AND ISNULL(B.shift_flag,'1') = '1'    
  --AND b.dtr_date BETWEEN CONVERT(DATE,'2022-03-01') AND CONVERT(DATE,'2022-03-15')  
  ORDER BY A.empl_id, B.dtr_date     
  --EXEC sp_batch_generate_dtr_emptype '2022','03','2161','JO','26','U2161'  
  --OPEN c_DTR    
  --FETCH NEXT FROM c_DTR     
  --INTO @v_empl_id     
  -- ,@v_dtr_date        
  -- ,@v_cal_date_type     
  -- ,@v_cal_date_dow     
  -- ,@v_cal_hol_descr     
  -- ,@v_tse_day_parent      
  -- ,@v_tse_in_am       
  -- ,@v_pre_time_in_hrs      
  -- ,@v_tse_out_am       
  -- ,@v_tse_in_pm       
  -- ,@v_tse_out_pm       
  -- ,@v_post_time_out_hrs     
  -- ,@v_tse_month       
  -- ,@v_tse_year        
  -- ,@v_ts_code        
  -- --,@v_tse_dtl_id       
  -- ,@v_ts_add_days       
  -- ,@v_ts_mid_break       
  -- ,@v_ts_day_equivalent     
  -- ,@v_reg_am_start_time     
  -- ,@v_reg_am_end_time      
  -- ,@v_reg_pm_start_time     
  -- ,@v_reg_pm_end_time      
  -- ,@v_actual_time_in_am     
  -- ,@v_actual_time_out_am     
  -- ,@v_actual_time_in_pm     
  -- ,@v_actual_time_out_pm     
  -- ,@v_as_exist         
  -- ,@v_time_in_am        
  -- ,@v_time_out_am        
  -- ,@v_time_in_pm        
  -- ,@v_time_out_pm        
  -- ,@v_inputtype_code       
  -- ,@v_inputtype_sub_descr      
  -- ,@v_remarks         
  -- ,@v_astype_code        
  -- ,@v_n_time_in_am        
  -- ,@v_n_time_out_am       
  -- ,@v_n_time_in_pm        
  -- ,@v_n_time_out_pm       
  -- ,@v_n_inputtype_code       
  -- ,@v_n_inputtype_sub_descr     
  -- ,@v_n_remarks        
  -- ,@v_n_astype_code    
  -- ,@v_n_reason_code     
  -- ,@v_lv_exist        
  -- ,@v_date_num_day     
  -- ,@v_leavetype_code    
  -- ,@v_leavetype_descr    
  -- ,@v_leave_comments    
  -- ,@v_to_exist          
  -- ,@v_to_time_in_am      
  -- ,@v_to_time_out_am       
  -- ,@v_to_time_in_pm      
  -- ,@v_to_time_out_pm      
  -- ,@v_to_remarks        
  -- ,@v_otr_exist       
  -- ,@v_ot_start_time      
  -- ,@v_ot_start_ampm      
  -- ,@v_ot_end_time       
  -- ,@v_ot_end_ampm       
  -- ,@v_ot_remarks       
  -- ,@v_weekdays_flag      
  -- ,@v_weekdays_in       
  -- ,@v_weekdays_in_ampm      
  -- ,@v_weekdays_out       
  -- ,@v_weekdays_out_ampm     
  -- ,@v_weekend_flag       
  -- ,@v_weekend_in       
  -- ,@v_weekend_in_ampm      
  -- ,@v_weekend_out       
  -- ,@v_weekend_out_ampm      
  -- ,@v_holiday_flag       
  -- ,@v_holiday_in       
  -- ,@v_holiday_in_ampm      
  -- ,@v_holiday_out       
  -- ,@v_holiday_out_ampm      
  -- ,@v_dayoff_ot_flag      
  -- ,@v_dayoff_ot_in       
  -- ,@v_dayoff_ot_in_ampm     
  -- ,@v_dayoff_ot_out      
  -- ,@v_dayoff_ot_out_ampm     
  -- ,@v_ot_coc_credit_flag     
  -- ,@v_frst_qcna_posted_ddtm     
  -- ,@v_sec_qcna_posted_ddtm    
  -- ,@v_frst_qcna_posted_by     
  -- ,@v_sec_qcna_posted_by      
  SELECT @cnt_cal_max = (SELECT COUNT(A.empl_id) FROM @v_table_adj_cal A)   
  DECLARE @t_compute    BIT    
    
  DECLARE @t_remarks_HL   VARCHAR(50)    
  DECLARE @t_remarks_LV   VARCHAR(50)    
  DECLARE @t_remarks_AS   VARCHAR(50)    
  DECLARE @t_remarks_TO   VARCHAR(50)    
  DECLARE @t_remarks_OT   VARCHAR(50)    
  DECLARE @t_remarks_TS   VARCHAR(50)    
  DECLARE @t_remarks_WFH   VARCHAR(50)    
    
  DECLARE @v_OTR_start_time  VARCHAR(05)    
  DECLARE @v_OTR_start_ampm  VARCHAR(02)    
  DECLARE @v_OTR_end_time   VARCHAR(05)    
  DECLARE @v_OTR_end_ampm   VARCHAR(02)    
    
  DECLARE @v_OTR_s_time   VARCHAR(05)    
  DECLARE @v_OTR_e_time   VARCHAR(05)    
  DECLARE @v_empl_id_tmp   VARCHAR(08)    
  DECLARE @v_dtr_date_tmp   DATE     
  DECLARE @v_tmp_time_in_pm   VARCHAR(05)    
  DECLARE @v_tmp_time_out_pm   VARCHAR(05)    
  
  SET @v_empl_id_tmp = ''    
  SET @v_dtr_date_tmp = CONVERT(DATE,'')     
    
   WHILE @cnt_cal <= @cnt_cal_max  
  --WHILE  @@FETCH_STATUS = 0    
  BEGIN    
  
  SELECT   
   @v_empl_id     = empl_id   
  ,@v_dtr_date               = dtr_date   
  ,@v_cal_date_type           = cal_date_type   
  ,@v_cal_date_dow            = cal_date_dow   
  ,@v_cal_hol_descr           = cal_hol_descr   
  ,@v_tse_day_parent          = tse_day_parent  
  ,@v_tse_in_am              = tse_in_am  
  ,@v_pre_time_in_hrs         = pre_time_in_hrs  
  ,@v_tse_out_am              = tse_out_am   
  ,@v_tse_in_pm              = tse_in_pm  
  ,@v_tse_out_pm              = tse_out_pm   
  ,@v_post_time_out_hrs       = post_time_out_hrs  
  ,@v_tse_month              = tse_month   
  ,@v_tse_year               = tse_year  
  ,@v_ts_code                 = ts_code  
  ,@v_ts_add_days             = ts_add_days  
  ,@v_ts_mid_break            = ts_mid_break  
  ,@v_ts_day_equivalent       = ts_day_equivalent  
  ,@v_reg_am_start_time       = reg_am_start_time  
  ,@v_reg_am_end_time         = reg_am_end_time  
  ,@v_reg_pm_start_time       = reg_pm_start_time  
  ,@v_reg_pm_end_time         = reg_pm_end_time  
  ,@v_actual_time_in_am       = actual_time_in_am  
  ,@v_actual_time_out_am      =  actual_time_out_am   
  ,@v_actual_time_in_pm       = actual_time_in_pm  
  ,@v_actual_time_out_pm      =  actual_time_out_pm  
  ,@v_as_exist                = as_exist  
  ,@v_time_in_am              = time_in_am  
  ,@v_time_out_am             = time_out_am  
  ,@v_time_in_pm              = time_in_pm  
  ,@v_time_out_pm             = time_out_pm  
  ,@v_inputtype_code          = inputtype_code  
  ,@v_inputtype_sub_descr     = inputtype_sub_descr  
  ,@v_remarks                = remarks  
  ,@v_astype_code             = astype_code  
  ,@v_n_time_in_am            = n_time_in_am  
  ,@v_n_time_out_am           = n_time_out_am  
  ,@v_n_time_in_pm            = n_time_in_pm  
  ,@v_n_time_out_pm           = n_time_out_pm  
  ,@v_n_inputtype_code        = n_inputtype_code   
  ,@v_n_inputtype_sub_descr   = n_inputtype_sub_descr   
  ,@v_n_remarks               = n_remarks  
  ,@v_n_astype_code           = n_astype_code  
  ,@v_n_reason_code           = n_reason_code  
  ,@v_lv_exist               = lv_exist   
  ,@v_date_num_day            = date_num_day  
  ,@v_leavetype_code          = leavetype_code   
  ,@v_leavetype_descr         = leavetype_descr   
  ,@v_leave_comments          = leave_comments  
  ,@v_to_exist                = to_exist  
  ,@v_to_time_in_am           = to_time_in_am  
  ,@v_to_time_out_am          = to_time_out_am  
  ,@v_to_time_in_pm           = to_time_in_pm  
  ,@v_to_time_out_pm          = to_time_out_pm  
  ,@v_to_remarks              = to_remarks   
  ,@v_otr_exist              = otr_exist   
  ,@v_ot_start_time           = ot_start_time   
  ,@v_ot_start_ampm           = ot_start_ampm  
  ,@v_ot_end_time             = ot_end_time  
  ,@v_ot_end_ampm             = ot_end_ampm  
  ,@v_ot_remarks              = ot_remarks  
  ,@v_weekdays_flag           = weekdays_flag  
  ,@v_weekdays_in             = weekdays_in   
  ,@v_weekdays_in_ampm        = weekdays_in_ampm   
  ,@v_weekdays_out            = weekdays_out  
  ,@v_weekdays_out_ampm       = weekdays_out_ampm   
  ,@v_weekend_flag            = weekend_flag        
  ,@v_weekend_in              = weekend_in          
  ,@v_weekend_in_ampm         = weekend_in_ampm     
  ,@v_weekend_out             = weekend_out         
  ,@v_weekend_out_ampm        = weekend_out_ampm    
  ,@v_holiday_flag            = holiday_flag        
  ,@v_holiday_in              = holiday_in          
  ,@v_holiday_in_ampm         = holiday_in_ampm     
  ,@v_holiday_out             = holiday_out         
  ,@v_holiday_out_ampm        = holiday_out_ampm       
  ,@v_dayoff_ot_flag          = dayoff_ot_flag         
  ,@v_dayoff_ot_in            = dayoff_ot_in           
  ,@v_dayoff_ot_in_ampm       = dayoff_ot_in_ampm      
  ,@v_dayoff_ot_out           = dayoff_ot_out          
  ,@v_dayoff_ot_out_ampm      = dayoff_ot_out_ampm      
  ,@v_ot_coc_credit_flag      = ot_coc_credit_flag      
  ,@v_frst_qcna_posted_ddtm   = frst_qcna_posted_ddtm      
  ,@v_sec_qcna_posted_ddtm    = sec_qcna_posted_ddtm        
  ,@v_frst_qcna_posted_by     = frst_qcna_posted_by         
  ,@v_sec_qcna_posted_by   = sec_qcna_posted_by         
  --,@v_flag_dept_policy     = flag_dept_policy       
  FROM     @v_table_adj_cal   
  WHERE  row_nbr = @cnt_cal  
  SET @cnt_cal = @cnt_cal + 1    
  SET  @v_empl_id_tmp  = @v_empl_id    
  IF @v_empl_id_tmp = @v_empl_id    
    AND @v_dtr_date_tmp <> CONVERT(DATE,@v_dtr_date)    
  BEGIN    
    
     
 -- --EXEC sp_batch_generate_dtr_emptype '2022','03','8712','JO','02','U8712'  
 -- if @v_empl_id = '8712'  
 -- and @v_dtr_date = '2022-03-08'  
 --SELECT 'AWW'  
        
   SET @d_remarks_details_half_day = ''    
    
   SET @t_compute   = 0    
    
   SET @t_remarks_HL  = ''    
   SET @t_remarks_LV  = ''    
   SET @t_remarks_AS  = ''    
   SET @t_remarks_TO  = ''    
   SET @t_remarks_OT  = ''    
   SET @t_remarks_TS  = ''    
   SET @t_remarks_WFH  = ''    
    
   SET @v_OTR_start_time = ''    
   SET @v_OTR_start_ampm = ''    
   SET @v_OTR_end_time  = ''    
   SET @v_OTR_end_ampm  = ''    
   SET @v_OTR_s_time  = ''    
   SET @v_OTR_e_time  = ''    
    
   SET @v_reg_am_start_time_tmp   = @v_reg_am_start_time     
   SET @v_reg_am_end_time_tmp    = @v_reg_am_end_time       
   SET @v_reg_pm_start_time_tmp   = @v_reg_pm_start_time     
   SET @v_reg_pm_end_time_tmp    = @v_reg_pm_end_time      
    
   SET @v_pre_time_in_minute  = 0    
   SET @v_pre_time_out_minute  = 0    
   SET @v_pre_time_in_minute  = DATEDIFF(mi,@v_tse_in_am,@v_pre_time_in_hrs)    
   SET @v_pre_time_out_minute  = DATEDIFF(mi,@v_tse_out_pm,@v_post_time_out_hrs)    
        
   SET @v_remarks_pt = ''  
   -----------------------------------------------------    
   --  ASSIGN INITIAL DTR TABLE VALUES    
   -----------------------------------------------------    
   SET @d_dtr_order_no   = ''     
   SET @d_empl_id    = @v_empl_id    
   SET @d_dtr_date    = @v_dtr_date    
   SET @d_time_in_am   = @v_actual_time_in_am    
   SET @d_time_out_am   = @v_actual_time_out_am    
   SET @d_time_in_pm   = @v_actual_time_in_pm    
   SET @d_time_out_pm   = @v_actual_time_out_pm    
   SET @d_ts_code    = @v_ts_code     
   SET @d_under_Time   = 0    
   SET @d_under_Time_remarks = ''    
   SET @d_remarks_details  = ''    
   SET @d_time_ot_hris   = ''    
   SET @d_time_days_equi  = 0    
   SET @d_time_hours_equi  = 0    
   SET @d_time_ot_payable  = 0    
   SET @d_approval_status  = ''    
   SET @d_no_of_as    = 0    
   SET @d_no_of_ob    = 0    
   SET @d_no_of_lv    = 0    
    
   SET @v_tmp_time_in_pm  = ''  
   -----------------------------------------------------    
   --TRANSFER TIME IN PM TO TIME OUT AM FOR SPECIAL CASE 2021-12-24  
     
   IF @v_dtr_date IN (CONVERT(DATE,'2021-12-24'),CONVERT(DATE,'2021-12-31'),CONVERT(DATE,'2022-04-13'))  
 BEGIN  
  IF @d_time_in_pm <> '' AND @d_time_out_am = ''  
   BEGIN  
    SET @d_time_out_am = '12:00'  
    IF @d_time_in_pm > CONVERT(TIME,'13:00')  
     BEGIN  
      SET @v_tmp_time_in_pm = '13:00'  
     END  
    ELSE  
     BEGIN  
      SET @v_tmp_time_in_pm = @d_time_in_pm  
     END  
      
    SET @d_time_in_pm = ''  
   END  
     
 END  
        
   -----------------------------------------------------    
   --  CHECK AND MOVE REMARKS VALUE FOR HOLIDAY    
   -----------------------------------------------------    
   IF @v_cal_date_type = 'HOL'    
   BEGIN    
  IF  (@v_empl_id IN (SELECT DISTINCT empl_id FROM national_agency_dtr_exempt_tbl) --SPECIAL CASE NOT INCLUDED IN WORK SUSPENSION NATIONAL OFFICE ASSIGNMENT  
    AND @v_dtr_date = CONVERT(DATE,'2021-12-16'))  
  OR (@p_department_code1 IN ('21','22','23','24') AND @v_dtr_date = CONVERT(DATE,'2021-12-16'))  
      
     
   BEGIN  
    SET @t_remarks_HL = ''  
    SET @v_cal_date_type = 'THU'  
   END  
  ELSE  
   BEGIN  
      IF @v_cal_hol_descr IN ('SPCL-NW-HOL','REG-HOL','SPCL-HOL')    
      BEGIN    
       SET @t_remarks_HL = 'HOLIDAY'    
       SET @t_compute = 1    
      END    
     ELSE    
      BEGIN    
       SET @t_remarks_HL = 'WORK SUSPENSION'    
       SET @t_compute = 1   
  
      
      END    
         
     SET @v_ts_code = '0'    
     SET @d_ts_code = '0'  
   END  
    
    
END    
   -----------------------------------------------------    
   --  CHECK AND MOVE LEAVE VALUES    
   -----------------------------------------------------    
     
     
         
 IF @v_to_exist = 'Y'       
 AND @v_dtr_date >= CONVERT(DATE,'2022-03-15') --ADDED BY JORGE 2021-03-15 OB WITH LEAVE      
    BEGIN        
     DECLARE @TO_WDESCRE1 BIT 
	 SET @TO_WDESCRE1 = 0

	 IF @v_to_remarks = 'OBAM'  AND CONVERT(TIME,@v_reg_am_end_time) > CONVERT(TIME,@v_to_time_out_am)
	 BEGIN
	     IF ISNULL(@v_actual_time_out_am,'') = ''
		 BEGIN
		     SET @t_remarks_TO = 'OBAM??'
			 SET @TO_WDESCRE1 = 1
		 END
	 END

	 IF @v_to_remarks = 'OBPM'  AND CONVERT(TIME,@v_reg_pm_end_time) > CONVERT(TIME,@v_to_time_out_pm)
	 BEGIN
	     IF ISNULL(@v_actual_time_out_pm,'') = ''
		 BEGIN
		     SET @t_remarks_TO = 'OBPM??'
			 SET @TO_WDESCRE1 = 1
		 END
	 END

	 IF @TO_WDESCRE1 = 0
	 BEGIN      
		 SET @t_remarks_TO = IIF(@v_to_remarks IN ('OBAM','OBPM','OB-T')        
			,'OB', @v_to_remarks)         
		 SET @t_compute = 0        
		 SET @d_no_of_ob = 1        
     END       
      
     --IF  @v_otr_exist = 'N' AND         
     --(@v_ts_code = '0' OR @v_cal_date_type IN ('HOL','SUN','SAT'))        
     --BEGIN        
     -- SET @t_remarks_TO = ''        
     -- SET @d_no_of_ob = 0        
     --END        
    END        
      
  
      
   IF @v_lv_exist = 'Y'  --LEAVE COMBINATION JORGE  
   BEGIN    
       
   IF @v_ts_code = '1'    
  BEGIN    
   SET @t_remarks_WFH = 'WORK FROM HOME'    
   SET @t_compute = 0    
  END    
    
    IF @v_leavetype_code = 'CTO'    
     BEGIN    
      SET @t_remarks_LV  = 'CTO'    
     END    
    ELSE IF @v_leavetype_code = 'QT'    
     BEGIN    
      SET @t_remarks_LV  = 'QUARANTINED'    
     END    
  ELSE IF @v_leavetype_code = 'MZ'    
  BEGIN    
   SET @t_remarks_LV  = ''    
  END   
  ELSE IF @v_leavetype_code = 'MC16'    
  BEGIN    
   SET @t_remarks_LV  = 'MC NO.16, S. 2021'    
  END   
  ELSE IF @v_leavetype_code = 'TL'    
  BEGIN    
   SET @t_remarks_LV  = ''    
  END  
    ELSE    
     BEGIN    
      SET @d_time_in_am  = ''    
      SET @d_time_out_am  = ''    
      SET @d_time_in_pm  = ''    
      SET @d_time_out_pm  = ''    
      SET @t_remarks_LV  = 'LEAVE'    
     END    
   
    --FOR QUARANTINED COMBINATION WITH LEAVE    
    IF @v_as_exist = 'Y'    
    BEGIN    
     SET @d_no_of_as   = 1    
     IF @v_astype_code IN ('09','10','11')    
     BEGIN    
      SET @t_remarks_AS   = @v_inputtype_sub_descr    
    
     IF @v_cal_date_type = 'HOL'    
      BEGIN    
       SET @t_remarks_AS = @t_remarks_HL +','+ UPPER(@t_remarks_AS)    
      END    
     ELSE     
      BEGIN    
       SET @t_remarks_AS = UPPER(@t_remarks_AS)    
      END    
        
     END    
  
   IF @v_astype_code <> ''  AND @v_n_reason_code <> '026'     
      BEGIN    
       SET @d_time_in_am = IIF(@v_time_in_am  ='' , @d_time_in_am  , @v_time_in_am)    
       SET @d_time_out_am = IIF(@v_time_out_am ='' , @d_time_out_am , @v_time_out_am)    
       SET @d_time_in_pm = IIF(@v_time_in_pm  ='' , @d_time_in_pm  , @v_time_in_pm)    
       SET @d_time_out_pm = IIF(@v_time_out_pm ='' , @d_time_out_pm , @v_time_out_pm)        
      END    
      IF @v_n_astype_code <> ''    
      BEGIN    
           
       SET @d_time_in_am  = IIF(@v_n_time_in_am  ='', @v_actual_time_in_am  , @v_n_time_in_am)    
       SET @d_time_out_am  = IIF(@v_n_time_out_am ='', @v_actual_time_out_am , @v_n_time_out_am)    
       SET @d_time_in_pm  = IIF(@v_n_time_in_pm  ='', @v_actual_time_in_pm  , @v_n_time_in_pm)    
       SET @d_time_out_pm  = IIF(@v_n_time_out_pm ='', @v_actual_time_out_pm , @v_n_time_out_pm)    
      END   
  
    END    
  
    SET @t_compute = 0    
    SET @d_no_of_lv   = 1    
   END    
   -----------------------------------------------------    
   ELSE    
   BEGIN    
      
    -----------------------------------------------------    
    --  CHECK AND MOVE AS VALUES    
    -----------------------------------------------------  
   
    IF @v_as_exist = 'Y'    
    BEGIN    
         
     SET @d_no_of_as   = 1    
     IF @v_astype_code IN ('01','09','10','11')  
     BEGIN    
      SET @d_time_in_am = ''    
      SET @d_time_out_am = ''    
      SET @d_time_in_pm = ''    
      SET @d_time_out_pm = ''    
      SET @t_remarks_AS   = @v_inputtype_sub_descr    
     END    
   
    
     IF @v_n_astype_code = '06' -- FOR MEETING PURPOSES    
     BEGIN    
      IF MONTH(@v_dtr_date) <= 3    
      AND  YEAR(@v_dtr_date) <= 2021    
       BEGIN    
        IF CONVERT(TIME,IIF(ISNULL(@v_tse_in_am,'') = '',@v_reg_am_start_time,@v_tse_in_am)) BETWEEN CAST(@v_n_time_in_am AS TIME) and CAST(@v_n_time_out_pm AS TIME)       
        BEGIN    
         IF @d_time_in_am = ''    
          BEGIN    
           SET @d_time_in_am = IIF(ISNULL(@v_tse_in_am,'') = '',@v_reg_am_start_time,@v_tse_in_am)    
          END    
        END    
        IF CONVERT(TIME,IIF(ISNULL(@v_tse_out_am,'') = '',@v_reg_am_end_time,@v_tse_out_am)) BETWEEN CAST(@v_n_time_in_am AS TIME) and CAST(@v_n_time_out_pm AS TIME)       
        BEGIN    
         IF @d_time_out_am = ''    
          BEGIN    
           SET @d_time_out_am = IIF(ISNULL(@v_tse_out_am,'') = '',@v_reg_am_end_time,@v_tse_out_am)    
          END    
        END    
        IF CONVERT(TIME,'12:30') BETWEEN CAST(@v_n_time_in_am AS TIME) and CAST(@v_n_time_out_pm AS TIME)       
        BEGIN    
         IF @d_time_in_pm = ''    
          BEGIN    
           IF @v_n_time_out_pm < @v_tse_in_pm    
            BEGIN    
             SET @d_time_in_pm = @v_n_time_out_pm    
            END    
           ELSE    
            BEGIN    
             SET @d_time_in_pm = @v_tse_in_pm    
            END    
              
          END    
        END    
        IF CONVERT(TIME,IIF(ISNULL(@v_tse_out_pm,'') = '',@v_reg_pm_end_time,@v_tse_out_pm)) BETWEEN CAST(@v_n_time_in_am AS TIME) and CAST(@v_n_time_out_pm AS TIME)       
        BEGIN    
         IF @d_time_out_pm = ''    
          BEGIN    
           SET @d_time_out_pm = IIF(ISNULL(@v_tse_out_pm,'') = '',@v_reg_pm_end_time,@v_tse_out_pm)    
          END    
        END    
       END    
      ELSE    
       BEGIN    
       SET @d_time_in_am  = IIF(@v_n_time_in_am  ='', @v_actual_time_in_am  , @v_n_time_in_am)    
       SET @d_time_out_am  = IIF(@v_n_time_out_am ='', @v_actual_time_out_am , @v_n_time_out_am)    
       SET @d_time_in_pm  = IIF(@v_n_time_in_pm  ='', @v_actual_time_in_pm  , @v_n_time_in_pm)    
       SET @d_time_out_pm  = IIF(@v_n_time_out_pm ='', @v_actual_time_out_pm , @v_n_time_out_pm)     
       END    
          
     END     
    
    ELSE    
     BEGIN    
      SET @t_compute = 1    
  IF  @v_n_reason_code = '026'   --DELETE TIME ENTRIES   
 BEGIN  
 --EXEC sp_batch_generate_dtr_emptype '2021','11','2161','JO','02','U2161'  
   
   IF @v_time_in_am <> ''          
   BEGIN  
    SET @d_time_in_am = ''  
   END  
   IF @v_time_out_am <> ''          
   BEGIN  
    SET @d_time_out_am = ''  
   END  
  IF @v_time_in_pm <> ''          
   BEGIN  
    SET @d_time_in_pm = ''  
   END  
  IF @v_time_out_pm <> ''          
   BEGIN  
    SET @d_time_out_pm = ''  
   END  
 END  
      IF @v_n_reason_code = '022'    
      BEGIN    
       IF @v_time_in_am <> ''    
        BEGIN    
         IF @v_time_in_am = @d_time_in_am    
          BEGIN    
           SET @d_time_in_am = ''    
          END    
         IF @v_time_in_am = @d_time_out_am    
          BEGIN    
           SET @d_time_out_am = ''    
          END    
         IF @v_time_in_am = @d_time_in_pm    
          BEGIN    
           SET @d_time_in_pm = ''    
          END    
         IF @v_time_in_am = @d_time_out_pm    
          BEGIN    
           SET @d_time_out_pm = ''    
          END    
        END    
    
       IF @v_time_out_am <> ''    
        BEGIN    
         IF @v_time_out_am = @d_time_in_am    
          BEGIN    
           SET @d_time_in_am = ''    
          END    
         IF @v_time_out_am = @d_time_out_am    
          BEGIN    
           SET @d_time_out_am = ''    
          END    
         IF @v_time_out_am = @d_time_in_pm    
          BEGIN    
           SET @d_time_in_pm = ''    
          END    
         IF @v_time_out_am = @d_time_out_pm    
          BEGIN    
           SET @d_time_out_pm = ''    
          END    
        END    
    
       IF @v_time_in_pm <> ''    
        BEGIN    
         IF @v_time_in_pm = @d_time_in_am    
          BEGIN    
           SET @d_time_in_am = ''    
          END    
         IF @v_time_in_pm = @d_time_out_am    
          BEGIN    
           SET @d_time_out_am = ''    
          END    
         IF @v_time_in_pm = @d_time_in_pm    
          BEGIN    
           SET @d_time_in_pm = ''    
          END    
         IF @v_time_in_pm = @d_time_out_pm    
          BEGIN    
           SET @d_time_out_pm = ''    
          END    
        END    
    
       IF @v_time_out_pm <> ''    
        BEGIN    
         IF @v_time_out_pm = @d_time_in_am    
          BEGIN    
           SET @d_time_in_am = ''    
          END    
         IF @v_time_out_pm = @d_time_out_am    
          BEGIN    
           SET @d_time_out_am = ''    
          END    
         IF @v_time_out_pm = @d_time_in_pm    
          BEGIN    
           SET @d_time_in_pm = ''    
          END    
         IF @v_time_out_pm = @d_time_out_pm    
          BEGIN    
           SET @d_time_out_pm = ''    
          END    
        END    
            
      END    
          
      IF @v_astype_code <> ''  AND @v_n_reason_code <> '026'     
      BEGIN    
       SET @d_time_in_am = IIF(@v_time_in_am  ='' , @d_time_in_am  , @v_time_in_am)    
       SET @d_time_out_am = IIF(@v_time_out_am ='' , @d_time_out_am , @v_time_out_am)    
       SET @d_time_in_pm = IIF(@v_time_in_pm  ='' , @d_time_in_pm  , @v_time_in_pm)    
       SET @d_time_out_pm = IIF(@v_time_out_pm ='' , @d_time_out_pm , @v_time_out_pm)        
      END    
      IF @v_n_astype_code <> ''    
      BEGIN    
   IF @v_n_astype_code = '07'    
    BEGIN    
       
     SET @v_remarks_pt = 'PT '    
    END   
       ELSE  
  BEGIN  
   SET @d_time_in_am  = IIF(@v_n_time_in_am  ='', @v_actual_time_in_am  , @v_n_time_in_am)    
   SET @d_time_out_am  = IIF(@v_n_time_out_am ='', @v_actual_time_out_am , @v_n_time_out_am)    
   SET @d_time_in_pm  = IIF(@v_n_time_in_pm  ='', @v_actual_time_in_pm  , @v_n_time_in_pm)    
   SET @d_time_out_pm  = IIF(@v_n_time_out_pm ='', @v_actual_time_out_pm , @v_n_time_out_pm)   
  END    
          
      END    
          
          
     END    
    END    
    -----------------------------------------------------    
    
    -------------------------------------------------------    
    ----  CHECK AND MOVE WORK FROM HOME VALUES    
    -------------------------------------------------------    
   
    IF @v_ts_code = '1'    
    BEGIN    
     SET @t_remarks_WFH = 'WORK FROM HOME'    
     SET @t_compute = 0    
    END    
    
    -------------------------------------------------------    
    ----  CHECK AND MOVE WORK FROM HOME VALUES    
    -------------------------------------------------------    
    IF @v_ts_code = '98'  and @p_dtr_year1 = '2021'  
    BEGIN    
     SET @t_remarks_WFH = '*WORK FROM HOME'    
     SET @t_compute = 0    
    END    
    
    
    -------------------------------------------------------    
    ----  CHECK AND MOVE TO VALUES    
    -------------------------------------------------------    
  
   IF @v_to_exist = 'Y'        
    BEGIN 
	 DECLARE @TO_WDESCRE2 BIT 
	 SET @TO_WDESCRE2 = 0

	 IF @v_to_remarks = 'OBAM'  AND CONVERT(TIME,@v_reg_am_end_time) > CONVERT(TIME,@v_to_time_out_am)
	 BEGIN
	     IF ISNULL(@v_actual_time_out_am,'') = ''
		 BEGIN
		     SET @t_remarks_TO = 'OBAM??'
			 SET @TO_WDESCRE2 = 1
		 END
	 END

	 IF @v_to_remarks = 'OBPM'  AND CONVERT(TIME,@v_reg_pm_end_time) > CONVERT(TIME,@v_to_time_out_pm)
	 BEGIN
	     IF ISNULL(@v_actual_time_out_pm,'') = ''
		 BEGIN
		     SET @t_remarks_TO = 'OBPM??'
			 SET @TO_WDESCRE2 = 1
		 END
	 END

	 IF @TO_WDESCRE2 = 0
	 BEGIN      
		 SET @t_remarks_TO = IIF(@v_to_remarks IN ('OBAM','OBPM','OB-T')        
			,'OB', @v_to_remarks)         
		 SET @t_compute = 0        
		 SET @d_no_of_ob = 1        
     END

	
     --IF  @v_otr_exist = 'N' AND         
     --(@v_ts_code = '0' OR @v_cal_date_type IN ('HOL','SUN','SAT'))        
     --BEGIN        
     -- SET @t_remarks_TO = ''        
     -- SET @d_no_of_ob = 0        
     --END        
    END    
    -------------------------------------------------------    
    -------------------------------------------------------    
    ----  CHECK AND MOVE OTR VALUES    
    -------------------------------------------------------    
    IF @v_otr_exist = 'Y'    
    BEGIN    
     IF @v_to_exist = 'Y' AND     
     (@v_ts_code = '0' OR @v_cal_date_type IN ('HOL','SUN','SAT'))    
     BEGIN    
      SET @d_time_in_am = IIF(@v_to_time_in_am  ='', @d_time_in_am  , IIF(@d_time_in_am = '',@v_to_time_in_am,@d_time_in_am))    
      SET @d_time_out_am = IIF(@v_to_time_out_am ='', @d_time_out_am , IIF(@d_time_out_am = '',@v_to_time_out_am,@d_time_out_am))    
      SET @d_time_in_pm = IIF(@v_to_time_in_pm  ='', @d_time_in_pm  , IIF(@d_time_in_pm = '',@v_to_time_in_pm,@d_time_in_pm))    
      SET @d_time_out_pm = IIF(@v_to_time_out_pm ='', @d_time_out_pm , IIF(@d_time_out_pm = '',@v_to_time_out_pm,@d_time_out_pm))        
     END    
         
     SET @t_compute = 1    
    END    
    -------------------------------------------------------    
   END    
       
   IF ISNULL(@v_pre_time_in_hrs,'') <> '' AND @d_time_in_am <> ''    
    BEGIN    
     SET @d_time_in_am = DATEADD(mi,@v_pre_time_in_minute,CONVERT(TIME,@d_time_in_am))    
     SET @d_time_in_am = IIF(CONVERT(TIME,@d_time_in_am) <= CONVERT(TIME,@v_pre_time_in_hrs),@v_pre_time_in_hrs,@d_time_in_am)    
        
    END    
    
   IF ISNULL(@v_post_time_out_hrs,'') <> '' AND @d_time_out_pm <> ''    
    BEGIN    
     DECLARE @v_time_out_pm_temp VARCHAR(05)    
     SET @v_time_out_pm_temp = @d_time_out_pm    
    
     SET @d_time_out_pm = CONVERT(VARCHAR(05),DATEADD(mi,@v_pre_time_out_minute,CONVERT(TIME,@d_time_out_pm)))    
     IF LEFT(@d_time_out_pm,2) = '00'    
      SET @d_time_out_pm = @v_time_out_pm_temp    
        
     SET @d_time_out_pm = IIF(CONVERT(TIME,@d_time_out_pm) >= CONVERT(TIME,@v_post_time_out_hrs),@d_time_out_pm,@v_post_time_out_hrs)    
    END    
    
   -------------------------------------------------------------------------    
   -- START SET VALUES FOR EXACT TIMESCHEDULE FOR CALCULATIONS    
   -------------------------------------------------------------------------    
       
   SET @v_tse_in_am = IIF(ISNULL(@v_tse_in_am,'') = '',@v_reg_am_start_time,@v_tse_in_am)    
   SET @v_tse_out_am = IIF(ISNULL(@v_tse_out_am,'') = '',@v_reg_am_end_time,@v_tse_out_am)    
   SET @v_tse_in_pm = IIF(ISNULL(@v_tse_in_pm,'') = '',@v_reg_pm_start_time,@v_tse_in_pm)    
   SET @v_tse_out_pm = IIF(ISNULL(@v_tse_out_pm,'') = '',@v_reg_pm_end_time,@v_tse_out_pm)    
    
   IF  @v_tse_in_am  <> @v_reg_am_start_time    
     OR @v_tse_out_am <> @v_reg_am_end_time    
     OR @v_tse_in_pm  <> @v_reg_pm_start_time    
     OR @v_tse_out_pm <> @v_reg_pm_end_time    
    BEGIN    
     SET @v_reg_am_start_time = IIF(ISNULL(@v_pre_time_in_hrs,'') <> '',@v_pre_time_in_hrs,@v_tse_in_am)    
     SET @v_reg_am_end_time  = IIF(ISNULL(@v_tse_out_am,'') = '',@v_reg_am_end_time,@v_tse_out_am)    
     SET @v_reg_pm_start_time = IIF(ISNULL(@v_tse_in_pm,'') = '',@v_reg_pm_start_time,@v_tse_in_pm)    
     SET @v_reg_pm_end_time  = IIF(ISNULL(@v_post_time_out_hrs,'') <> '',@v_post_time_out_hrs,@v_tse_out_pm)    
     
    
    END    
   -------------------------------------------------------------------------    
   -- END SET VALUES FOR EXACT TIMESCHEDULE FOR CALCULATIONS    
   -------------------------------------------------------------------------    
      
    
   -------------------------------------------------------------------------    
   -- Compute Lates and Undertime and Overtime and Special Holidays    
   -------------------------------------------------------------------------    
      
   -------------------------------------------------------------------------    
   -- FIRST CALCULATION FOR UNDERTIME BEGIN    
   -------------------------------------------------------------------------    
    
   DECLARE @v_under_Time_hrs_am_in    FLOAT    
   DECLARE @v_under_Time_hrs_am_out   FLOAT    
   DECLARE @v_under_Time_hrs_pm_in    FLOAT    
   DECLARE @v_under_Time_hrs_pm_out   FLOAT    
   DECLARE @v_under_Time_hrs_total    FLOAT    
    
   DECLARE @v_under_Time_minute_am_in   FLOAT    
   DECLARE @v_under_Time_minute_am_out   FLOAT    
   DECLARE @v_under_Time_minute_pm_in   FLOAT    
   DECLARE @v_under_Time_minute_pm_out   FLOAT    
   DECLARE @v_under_Time_minute_total   FLOAT    
        
   SET @v_under_Time_hrs_am_in  = 0    
   SET @v_under_Time_hrs_am_out = 0    
   SET @v_under_Time_hrs_pm_in  = 0    
   SET @v_under_Time_hrs_pm_out = 0    
   SET @v_under_Time_hrs_total  = 0    
    
   SET @v_under_Time_minute_am_in = 0    
   SET @v_under_Time_minute_am_out = 0    
   SET @v_under_Time_minute_pm_in = 0    
   SET @v_under_Time_minute_pm_out = 0    
   SET @v_under_Time_minute_total = 0    
   DECLARE @v_check_two_entries_undertime BIT    
   SET @v_check_two_entries_undertime = 0    
      
   --CALCULATE UNDER TIME OF EMPLOYEE HALF DAY    
   DECLARE @v_half_day_undertime_minute  INT    
    
   SET @v_half_day_undertime_minute = 0    
       
   --IF @t_compute <> 0    
   --BEGIN    
       
   --CALCULATE HALF DAY UNDERTIME CHECK IF HALF DAY AM    
   IF (@d_time_in_am <> '' AND @d_time_out_am <> '')    
    AND (@d_time_in_pm = '' AND @d_time_out_pm = '')    
    AND (@v_ts_code <> '0' OR @v_cal_date_type NOT IN ('HOL','SUN','SAT'))    
       
    BEGIN    
         
     SET @d_remarks_details_half_day    = 'HALF DAY-PM'      
     SET @v_check_two_entries_undertime = 1    
     SET @v_half_day_undertime_minute = DATEDIFF(mi,CONVERT(TIME,@v_reg_pm_start_time),CONVERT(TIME,@v_reg_pm_end_time))    
        
     --IF ISNULL(@v_pre_time_in_hrs,'') <> ''    
     -- BEGIN    
     --  SET @v_half_day_undertime_minute = @v_half_day_undertime_minute + DATEDIFF(mi,CONVERT(TIME,@v_reg_pm_start_time),CONVERT(TIME,@v_post_time_out_hrs))    
     -- END    
     --UNDERTIME MORNING AM IN: JORGE RUSTOM VILLANUEVA 2020-08-18 --REMOVE HALF DAY REMARKS DUE TO LATES MORNING    
     IF CONVERT(TIME,@d_time_in_am) >  CONVERT(TIME,@v_reg_am_start_time)    
      BEGIN    
       SET @d_remarks_details_half_day = ''    
      END    
    
     --UNDERTIME MORNING OUT: JORGE RUSTOM VILLANUEVA 2020-08-18    
     IF CONVERT(TIME,@d_time_out_am) <  CONVERT(TIME,@v_reg_am_end_time) --REMOVE HALF DAY REMARKS DUE TO LATES MORNING    
      BEGIN    
       SET @d_remarks_details_half_day  = ''    
      END    
     ----UNDERTIME MORNING OUT: JORGE RUSTOM VILLANUEVA 2020-08-18    
     IF @v_to_exist = 'Y'     
      BEGIN     
        SET @v_half_day_undertime_minute = 0    
        SET @d_remarks_details_half_day  = ''    
      END    
    
           
    END    
      
   --CHECK IF HALF DAY PM    
   ELSE IF (@d_time_in_am = '' AND @d_time_out_am = '')    
    AND (@d_time_in_pm <> '' AND @d_time_out_pm <> '')    
    AND (@v_ts_code <> '0' OR @v_cal_date_type NOT IN ('HOL','SUN','SAT'))    
    BEGIN    
      SET @d_remarks_details_half_day    = 'HALF DAY-AM'    
      SET @v_check_two_entries_undertime = 1     
      SET @v_half_day_undertime_minute = DATEDIFF(mi,CONVERT(TIME,@v_reg_am_start_time),CONVERT(TIME,@v_reg_am_end_time))    
         
      --IF ISNULL(@v_pre_time_in_hrs,'') <> ''    
      --BEGIN    
      -- SET @v_half_day_undertime_minute = @v_half_day_undertime_minute + DATEDIFF(mi,CONVERT(TIME,@v_pre_time_in_hrs),CONVERT(TIME,@v_reg_am_start_time))    
      --END    
    
      --UNDERTIME AFTERRNOON AM IN: JORGE RUSTOM VILLANUEVA 2020-08-18    
      IF CONVERT(TIME,@d_time_in_pm) >  CONVERT(TIME,@v_reg_pm_start_time)    
       BEGIN    
        SET @d_remarks_details_half_day = ''    
       END    
    
      --UNDERTIME AFTERRNOON OUT: JORGE RUSTOM VILLANUEVA 2020-08-18    
      IF CONVERT(TIME,@d_time_out_pm) <  CONVERT(TIME,@v_reg_pm_end_time)    
       BEGIN    
        SET @d_remarks_details_half_day = ''    
       END    
    
      IF @v_to_exist = 'Y'     
       BEGIN     
         SET @v_half_day_undertime_minute = 0    
         SET @d_remarks_details_half_day  = ''    
       END    
          
    END    
    
   ELSE IF (@d_time_in_am <> '' AND @d_time_out_am <> ''    
     AND @d_time_in_pm <> '' AND @d_time_out_pm <> '')    
    BEGIN    
       SET @v_check_two_entries_undertime = 1    
      --SELECT @v_dtr_date,@v_check_two_entries_undertime,@d_time_in_am,@d_time_out_am,@d_time_in_pm,@d_time_out_pm    
    END    
     
       
   IF @v_dtr_date IN (CONVERT(DATE,'2021-01-22'),CONVERT(DATE,'2021-03-31'))    
    BEGIN    
      SET @v_check_two_entries_undertime = 1    
         
      IF @d_time_out_pm < @v_reg_pm_end_time AND ISNULL(@d_time_out_pm,'') <> ''    
      SET @d_time_out_pm = @v_reg_pm_end_time    
    END    
       
   IF @v_to_exist = 'Y' --CALCULATE UNDERTIME FOR OB    
    BEGIN    
     SET @v_check_two_entries_undertime = 1    
    END    
    
   DECLARE @v_under_Time_hrs_total_remarks  INT    
   DECLARE @v_under_Time_minute_total_remarks  FLOAT    
   IF @v_ts_code = '99' --CHECK FOR NORMAL DAYS WORK 8AM-5PM DAY OFF SAT AND SUNDAY AND NO TS CODE AS 98    
     BEGIN    
        IF @v_cal_date_type IN ('SUN','SAT')    
           BEGIN    
            SET @v_ts_code  = '0'    
           END    
        ELSE --CALCULATE UNDERTIME FOR REGULAR SCHEDULE ADDED BY JORGE: 01-11-2021    
           BEGIN    
            --SELECT @d_time_in_am,@d_time_out_am,@d_time_in_pm,@d_time_in_pm,@v_dtr_date,@v_reg_am_start_time    
            IF @d_time_in_am <> '' AND CONVERT(time,@d_time_in_am) > CONVERT(time,@v_reg_am_start_time) AND @v_check_two_entries_undertime = 1    
             BEGIN    
              SET @v_under_Time_hrs_am_in  = DATEDIFF(mi,CONVERT(time,@v_reg_am_start_time),CONVERT(time,@d_time_in_am))/60    
              SET @v_under_Time_minute_am_in = DATEDIFF(mi,CONVERT(time,@v_reg_am_start_time),CONVERT(time,@d_time_in_am))%60    
             END    
           
            IF @d_time_out_am <> '' AND CONVERT(time,@d_time_out_am) < CONVERT(time,@v_reg_am_end_time) AND @v_check_two_entries_undertime = 1    
             BEGIN    
                 
              SET @v_under_Time_hrs_am_out = DATEDIFF(mi,CONVERT(time,@d_time_out_am),CONVERT(time,@v_reg_am_end_time))/60    
              SET @v_under_Time_minute_am_out = DATEDIFF(mi,CONVERT(time,@d_time_out_am),CONVERT(time,@v_reg_am_end_time))%60    
             END    
    
            --CALCULATE UNDER TIME OF EMPLOYEE FOR TIME IN PM    
            IF @d_time_in_pm <> '' AND CONVERT(time,@d_time_in_pm) > CONVERT(time,@v_reg_pm_start_time) AND @v_check_two_entries_undertime = 1    
             BEGIN    
                  
              SET @v_under_Time_hrs_pm_in = DATEDIFF(mi,CONVERT(time,@v_reg_pm_start_time),CONVERT(time,@d_time_in_pm))/60    
              SET @v_under_Time_minute_pm_in = DATEDIFF(mi,CONVERT(time,@v_reg_pm_start_time),CONVERT(time,@d_time_in_pm))%60    
     
             END    
    
            --CALCULATE UNDER TIME OF EMPLOYEE FOR TIME OUT PM    
            IF @d_time_out_pm <> '' AND CONVERT(time,@d_time_out_pm) < CONVERT(time,@v_reg_pm_end_time) AND @v_check_two_entries_undertime = 1    
             BEGIN    
              SET @v_under_Time_hrs_pm_out = DATEDIFF(mi,CONVERT(time,@d_time_out_pm),CONVERT(time,@v_reg_pm_end_time))/60    
              SET @v_under_Time_minute_pm_out = DATEDIFF(mi,CONVERT(time,@d_time_out_pm),CONVERT(time,@v_reg_pm_end_time))%60    
             END    
               
             SET @v_under_Time_hrs_total =     
                  IIF(@v_under_Time_hrs_am_in < 0,0,@v_under_Time_hrs_am_in)    
                  + IIF(@v_under_Time_hrs_am_out < 0,0,@v_under_Time_hrs_am_out)    
                  + IIF(@v_under_Time_hrs_pm_in < 0,0,@v_under_Time_hrs_pm_in)    
                  + IIF(@v_under_Time_hrs_pm_out < 0,0,@v_under_Time_hrs_pm_out)    
               
             IF @v_under_Time_hrs_total >= 1    
               BEGIN    
                SET @v_under_Time_minute_total = (@v_under_Time_hrs_total * (60/1))    
               END    
            
             SET @v_under_Time_minute_total     
                 = @v_under_Time_minute_total     
                 + IIF(@v_under_Time_minute_am_in  < 0,0,@v_under_Time_minute_am_in)    
                 + IIF(@v_under_Time_minute_am_out < 0,0,@v_under_Time_minute_am_out)    
                 + IIF(@v_under_Time_minute_pm_in  < 0,0,@v_under_Time_minute_pm_in)    
                 + IIF(@v_under_Time_minute_pm_out < 0,0,@v_under_Time_minute_pm_out)    
                 + @v_half_day_undertime_minute    
                     
                     
                  SET  @d_under_Time       = @v_under_Time_minute_total    
                  SET @v_under_Time_hrs_total_remarks  = IIF(@v_under_Time_minute_total/60 < 1,0,@v_under_Time_minute_total/60)    
                  SET @v_under_Time_minute_total_remarks  = ROUND(((@v_under_Time_minute_total/60.00) - @v_under_Time_hrs_total_remarks) * 60,2)    
       
                
    
             IF @v_under_Time_minute_total_remarks > 0 OR @v_under_Time_hrs_total_remarks > 0    
              BEGIN    
               SET @d_under_Time_remarks = IIF(@v_under_Time_hrs_total_remarks > 0,CONVERT(VARCHAR(02),@v_under_Time_hrs_total_remarks) + 'h ' + IIF(CONVERT(INT,@v_under_Time_minute_total_remarks) > 0,CONVERT(VARCHAR(02),CONVERT(INT,@v_under_Time_minute_total_remarks)) + 'm',''),CONVERT(VARCHAR(02),CONVERT(INT,@v_under_Time_minute_total_remarks)) + 'm')    
              END    
            
           END    
            
       
     END    
      
   --CALCULATE UNDER TIME OF EMPLOYEE FOR TIME IN WITH TIME SCHEDULE OF THE DAY    
      
   ELSE IF @v_ts_code NOT IN ('98','97','0') OR @v_cal_date_type NOT IN ('HOL','SUN','SAT')    
    
     BEGIN    
        IF @d_time_in_am <> '' AND CONVERT(time,@d_time_in_am) > CONVERT(time,@v_reg_am_start_time) AND @v_check_two_entries_undertime = 1    
         BEGIN    
              
          SET @v_under_Time_hrs_am_in  = DATEDIFF(mi,CONVERT(time,@v_reg_am_start_time),CONVERT(time,@d_time_in_am))/60    
          SET @v_under_Time_minute_am_in = DATEDIFF(mi,CONVERT(time,@v_reg_am_start_time),CONVERT(time,@d_time_in_am))%60    
              
         END     
           
       IF @d_time_out_am <> '' AND CONVERT(time,@d_time_out_am) < CONVERT(time,@v_reg_am_end_time) AND @v_check_two_entries_undertime = 1    
         BEGIN    
          SET @v_under_Time_hrs_am_out = DATEDIFF(mi,CONVERT(time,@d_time_out_am),CONVERT(time,@v_reg_am_end_time))/60    
          SET @v_under_Time_minute_am_out = DATEDIFF(mi,CONVERT(time,@d_time_out_am),CONVERT(time,@v_reg_am_end_time))%60    
         END    
    
       --CALCULATE UNDER TIME OF EMPLOYEE FOR TIME IN PM    
       IF @d_time_in_pm <> '' AND CONVERT(time,@d_time_in_pm) > CONVERT(time,@v_reg_pm_start_time) AND @v_check_two_entries_undertime = 1    
         BEGIN    
              
          SET @v_under_Time_hrs_pm_in = DATEDIFF(mi,CONVERT(time,@v_reg_pm_start_time),CONVERT(time,@d_time_in_pm))/60    
          SET @v_under_Time_minute_pm_in = DATEDIFF(mi,CONVERT(time,@v_reg_pm_start_time),CONVERT(time,@d_time_in_pm))%60    
              
         END    
    
       --CALCULATE UNDER TIME OF EMPLOYEE FOR TIME OUT PM    
       IF @d_time_out_pm <> '' AND CONVERT(time,@d_time_out_pm) < CONVERT(time,@v_reg_pm_end_time) AND @v_check_two_entries_undertime = 1    
         BEGIN    
          SET @v_under_Time_hrs_pm_out = DATEDIFF(mi,CONVERT(time,@d_time_out_pm),CONVERT(time,@v_reg_pm_end_time))/60    
          SET @v_under_Time_minute_pm_out = DATEDIFF(mi,CONVERT(time,@d_time_out_pm),CONVERT(time,@v_reg_pm_end_time))%60    
         END    
    
      
        SET @v_under_Time_hrs_total =     
           IIF(@v_under_Time_hrs_am_in < 0,0,@v_under_Time_hrs_am_in)    
          + IIF(@v_under_Time_hrs_am_out < 0,0,@v_under_Time_hrs_am_out)    
          + IIF(@v_under_Time_hrs_pm_in < 0,0,@v_under_Time_hrs_pm_in)    
          + IIF(@v_under_Time_hrs_pm_out < 0,0,@v_under_Time_hrs_pm_out)    
             
           
          
        IF @v_under_Time_hrs_total >= 1    
         BEGIN    
          SET @v_under_Time_minute_total = (@v_under_Time_hrs_total * (60/1))    
         END    
            
            
         SET @v_under_Time_minute_total     
         =     
         @v_under_Time_minute_total     
         + IIF(@v_under_Time_minute_am_in  < 0,0,@v_under_Time_minute_am_in)    
         + IIF(@v_under_Time_minute_am_out < 0,0,@v_under_Time_minute_am_out)    
         + IIF(@v_under_Time_minute_pm_in  < 0,0,@v_under_Time_minute_pm_in)    
         + IIF(@v_under_Time_minute_pm_out < 0,0,@v_under_Time_minute_pm_out)    
         + @v_half_day_undertime_minute    
             
         SET  @d_under_Time       = @v_under_Time_minute_total    
         --SELECT @d_under_Time,@v_dtr_date    
         SET @v_under_Time_hrs_total_remarks  = IIF(@v_under_Time_minute_total/60 < 1,0,@v_under_Time_minute_total/60)    
         SET @v_under_Time_minute_total_remarks  = ROUND(((@v_under_Time_minute_total/60.00) - @v_under_Time_hrs_total_remarks) * 60,2)    
       
   IF @v_under_Time_minute_total_remarks > 0 OR @v_under_Time_hrs_total_remarks > 0    
              BEGIN    
               SET @d_under_Time_remarks = IIF(@v_under_Time_hrs_total_remarks > 0,CONVERT(VARCHAR(02),@v_under_Time_hrs_total_remarks) + 'h ' + IIF(CONVERT(INT,@v_under_Time_minute_total_remarks) > 0,CONVERT(VARCHAR(02),CONVERT(INT,@v_under_Time_minute_total_remarks)) + 'm',''),CONVERT(VARCHAR(02),CONVERT(INT,@v_under_Time_minute_total_remarks)) + 'm')    
              END    
     END    
  
  ----ADDED BY JORGE FOR UNDERTIME REPORT: 2022-04-19  
  --DECLARE @v_time_undertime_check INT  
  --DECLARE @v_time_lates_check  INT  
  
  --SET @v_time_undertime_check = 0  
  --SET @v_time_lates_check = 0  
   
  --SET @v_time_undertime_check = (@v_under_Time_minute_am_out + @v_under_Time_minute_pm_out)  + (@v_under_Time_hrs_pm_out * 60) + (@v_under_Time_hrs_am_out * 60)  
  --SET @v_time_lates_check  = @v_under_Time_minute_am_in + @v_under_Time_minute_pm_in + (@v_under_Time_hrs_pm_in * 60) + (@v_under_Time_hrs_am_in * 60)  
  ----EXEC sp_batch_generate_dtr_emptype '2022','01','2161','JO','26','U2161'  
  ----IF @v_empl_id = '2161'  
  ----AND @v_dtr_date = '2022-01-05'  
  ----SELECT @v_time_undertime_check,@v_time_lates_check  
  
  --IF @v_time_undertime_check > 0  
  --OR @v_time_lates_check > 0  
  --BEGIN  
  --  DELETE FROM empl_dtr_dtl_und_tard_tbl  
  --  WHERE empl_id = @v_empl_id  
  --  AND dtr_date = @v_dtr_date  
  
  --  INSERT INTO empl_dtr_dtl_und_tard_tbl  
  --  SELECT   
  --  @v_empl_id  
  --  ,@v_dtr_date  
  --  ,@v_time_undertime_check  
  --  ,@v_time_lates_check  
  --END  
    
 --ENDEDD ADDED BY JORGE FOR UNDERTIME REPORT: 2022-04-19  
   
   -------------------------------------------------------------------------    
   -- FIRST CALCULATION FOR UNDERTIME END    
   -------------------------------------------------------------------------    
    
   -- COMPUTE OT     
   -------------------------------------------------------------------------    
   -- SECOND CALCULATION FOR ORVERTIME START    
   -------------------------------------------------------------------------    
     
     
   IF @v_otr_exist = 'Y'     
   --AND @v_ot_coc_credit_flag = 0    
   BEGIN    
  
     SET @v_OTR_start_time = @v_ot_start_time     
     SET @v_OTR_start_ampm = @v_ot_start_ampm     
     SET @v_OTR_end_time   = @v_ot_end_time      
     SET @v_OTR_end_ampm   = @v_ot_end_ampm    
    --IF @v_cal_date_type = 'HOL' AND @v_holiday_flag = 1    
    --BEGIN    
    -- SET @v_OTR_start_time = @v_holiday_in    
    -- SET @v_OTR_start_ampm = @v_holiday_in_ampm    
    -- SET @v_OTR_end_time  = @v_holiday_out    
    -- SET @v_OTR_end_ampm  = @v_holiday_out_ampm    
    --END    
    --ELSE IF @v_cal_date_type IN ('SUN','SAT') AND @v_weekend_flag = 1     
    --BEGIN    
    -- SET @v_OTR_start_time = @v_weekend_in    
    -- SET @v_OTR_start_ampm = @v_weekend_in_ampm    
    -- SET @v_OTR_end_time  = @v_weekend_out    
    -- SET @v_OTR_end_ampm  = @v_weekend_out_ampm    
    --END    
    --ELSE IF @v_ts_code = '0' AND @v_dayoff_ot_flag = 1     
    --BEGIN    
    -- SET @v_OTR_start_time = @v_dayoff_ot_in    
    -- SET @v_OTR_start_ampm = @v_dayoff_ot_in_ampm    
    -- SET @v_OTR_end_time  = @v_dayoff_ot_out    
    -- SET @v_OTR_end_ampm  = @v_dayoff_ot_out_ampm    
    --END    
    --ELSE IF LEFT(@v_cal_date_type,1) <> 'S' AND @v_weekdays_flag = 1     
    --BEGIN    
    -- SET @v_OTR_start_time = @v_weekdays_in    
    -- SET @v_OTR_start_ampm = @v_weekdays_in_ampm    
    -- SET @v_OTR_end_time  = @v_weekdays_out    
    -- SET @v_OTR_end_ampm  = @v_weekdays_out_ampm    
    --END    
    --ELSE    
    --BEGIN    
    -- SET @v_OTR_start_time = @v_ot_start_time     
    -- SET @v_OTR_start_ampm = @v_ot_start_ampm     
    -- SET @v_OTR_end_time  = @v_ot_end_time      
    -- SET @v_OTR_end_ampm  = @v_ot_end_ampm      
    --END    
    
    --SELECT @v_OTR_start_time+@v_OTR_start_ampm,@v_OTR_end_time+@v_OTR_end_ampm,@v_empl_id,@v_dtr_date    
       
    DECLARE @v_post_time_out_minute_ot  INT    
    DECLARE @v_pre_time_out_minute_ot INT    
    
    SET @v_post_time_out_minute_ot  = 0    
    SET @v_pre_time_out_minute_ot  = 0    
    
    IF ISNULL(@v_pre_time_in_hrs,'') <> ''    
     BEGIN    
             
      SET @v_post_time_out_minute_ot  = DATEDIFF(mi,@v_tse_out_pm,(@v_ot_start_time+@v_OTR_start_ampm))    
      SET @v_pre_time_out_minute_ot  = DATEDIFF(mi,@v_post_time_out_hrs,(@v_OTR_end_time+@v_OTR_end_ampm))    
    
      IF @v_post_time_out_minute_ot > 0    
       BEGIN    
        SET @v_OTR_start_time = CONVERT(VARCHAR(05),DATEADD(mi,-@v_post_time_out_minute_ot,CONVERT(TIME,(@v_OTR_start_time+@v_ot_start_ampm))))     
        SET @v_OTR_start_time = CONVERT(VARCHAR(05),IIF(CONVERT(TIME,@v_OTR_start_time) >= CONVERT(TIME,'13:00'),'0' + CONVERT(varchar(04),  CAST(@v_OTR_start_time AS TIME), 100),@v_OTR_start_time))    
            
       END    
      --IF @v_post_time_out_minute_ot > 0    
      -- BEGIN    
      --  SET @v_OTR_end_time = CONVERT(VARCHAR(05),DATEADD(mi,@v_pre_time_out_minute,CONVERT(TIME,(@v_reg_pm_end_time_tmp))))     
      --  SET @v_OTR_end_time = CONVERT(VARCHAR(05),IIF(CONVERT(TIME,@v_OTR_end_time) >= CONVERT(TIME,'13:00'),'0' + CONVERT(varchar(04),  CAST(@v_OTR_end_time AS TIME), 100),@v_OTR_end_time))    
      -- END    
     SET @v_dinner_break_start = CONVERT(VARCHAR(05),DATEADD(mi,DATEDIFF(mi,@v_tse_out_pm,@v_pre_time_out),CONVERT(TIME,(@v_dinner_break_start))))    
     SET @v_dinner_break_end  = CONVERT(VARCHAR(05),DATEADD(mi,DATEDIFF(mi,@v_tse_out_pm,@v_pre_time_out),CONVERT(TIME,(@v_dinner_break_end))))    
         
     END    
      
    
    SET @v_OTR_s_time = CONVERT(VARCHAR(05)    
      ,(CONVERT(TIME,CONVERT(DATETIME, @v_OTR_start_time+@v_OTR_start_ampm))))     
    SET @v_OTR_e_time = CONVERT(VARCHAR(05)    
      ,(CONVERT(TIME,CONVERT(DATETIME, @v_OTR_end_time+@v_OTR_end_ampm))))     
        
          
       
   IF @d_time_days_equi <> 1 --CHECK FOR 1 DAY EQUIVALENT: JORGE RUSTOM VILLANUEVA 08-22-2020    
    BEGIN    
     SET @v_hours_in_1day_conv = (@d_time_days_equi * @v_hours_in_1day_conv_static)    
    END    
      
   SET @d_time_hours_equi  = ((@v_hours_in_1day_conv * 60) - CONVERT(FLOAT,@v_under_Time_minute_total))/60    
   SET @d_time_hours_equi  = IIF(@d_time_hours_equi < 0,0,@d_time_hours_equi)    
   SET @d_time_days_equi  = @d_time_hours_equi/@v_hours_in_1day_conv_static    
      
   DECLARE @v_time_ot_payable_am   FLOAT     
   DECLARE @v_time_ot_payable_pm   FLOAT     
   DECLARE @v_time_ot_minute    INT     
      
   SET @v_time_ot_payable_am = 0    
   SET @v_time_ot_payable_pm = 0    
   SET @v_time_ot_minute   = 0    
      
   DECLARE @d_time_in_am_ot VARCHAR(07)    
   DECLARE @d_time_out_am_ot VARCHAR(07)    
   DECLARE @d_time_in_pm_ot VARCHAR(07)    
   DECLARE @d_time_out_pm_ot VARCHAR(07)    
      
   SET @d_time_in_am_ot = ''    
   SET @d_time_out_am_ot = ''    
   SET @d_time_in_pm_ot = ''    
   SET @d_time_out_pm_ot = ''     
    
        
  
   --CALCULATE WEEKENDS,HOLIDAY,DAY OFF OVERTIME    
   IF (@v_ts_code = '0' OR @v_cal_date_type IN ('HOL','SUN','SAT')) AND @v_otr_exist = 'Y'    
    BEGIN    
     SET  @d_under_Time       = 0    
     SET @v_under_Time_hrs_total_remarks   = 0    
     SET @v_under_Time_minute_total_remarks  = 0    
     SET @d_under_Time_remarks     = ''    
        
     DECLARE @v_deduct_ot_break BIT    
     SET @v_deduct_ot_break = 1    
        
         
     IF @d_time_in_am <> '' AND @d_time_out_am <> '' --CALCULATE OVERTIME IF COMPLETED TIME ENTRIES    
      AND @d_time_in_pm <> '' AND @d_time_out_pm <> ''    
       BEGIN    
          
        SET @d_time_in_am_ot = @d_time_in_am    
        SET @d_time_out_am_ot = @d_time_out_am    
        SET @d_time_in_pm_ot = @d_time_in_pm    
        SET @d_time_out_pm_ot = @d_time_out_pm    
  
     IF CONVERT(TIME,@d_time_in_am) < CONVERT(TIME,@v_OTR_s_time) --SET VALUE INTO START TIME OF OVERTIME REQUEST: JORGE RUSTOM VILLANUEVA    
         BEGIN    
          SET @d_time_in_am_ot = @v_OTR_s_time    
         END   
           
        IF CONVERT(TIME,@d_time_out_am) > CONVERT(TIME,@v_reg_am_end_time)    
         BEGIN    
          SET @d_time_out_am_ot = @v_reg_am_end_time    
         END    
    
        IF CONVERT(TIME,@d_time_in_pm) < CONVERT(TIME,@v_reg_pm_start_time)    
         BEGIN    
          SET @d_time_in_pm_ot = @v_reg_pm_start_time    
         END    
    
        IF CONVERT(TIME,@d_time_out_pm) > CONVERT(TIME,@v_OTR_e_time) --SET VALUE INTO END TIME OF OVERTIME REQUEST: JORGE RUSTOM VILLANUEVA    
         BEGIN    
          SET @d_time_out_pm_ot = @v_OTR_e_time    
         END    
    
         SET @v_time_ot_payable_am = DATEDIFF(mi,CONVERT(TIME,@d_time_in_am_ot),CONVERT(TIME,@d_time_out_am_ot))/60.00    
         SET @v_time_ot_payable_pm = DATEDIFF(mi,CONVERT(TIME,@d_time_in_pm_ot),CONVERT(TIME,@d_time_out_pm_ot))/60.00    
         SET @v_time_ot_minute   = (DATEDIFF(mi,CONVERT(TIME,@d_time_in_am_ot),CONVERT(TIME,@d_time_out_am_ot)) + DATEDIFF(mi,CONVERT(TIME,@d_time_in_pm_ot),CONVERT(TIME,@d_time_out_pm_ot)))    
         SET @d_time_ot_payable   = @v_time_ot_payable_am + @v_time_ot_payable_pm    
            
         
                     
       END    
    
        
      --CALCULATE OVERTIME FOR HALF DAY OT FOR AM TIME ENTRIES    
     ELSE IF (@d_time_in_am <> '' AND @d_time_out_am <> ''    
       AND @d_time_in_pm = '' AND @d_time_out_pm = '') AND @v_otr_exist = 'Y'    
       BEGIN    
         SET @d_time_in_am_ot = @d_time_in_am    
         SET @d_time_out_am_ot = @d_time_out_am    
         
         IF CONVERT(TIME,@d_time_in_am) < CONVERT(TIME,@v_OTR_s_time) --SET VALUE INTO START TIME OF OVERTIME REQUEST: JORGE RUSTOM VILLANUEVA    
          BEGIN    
           SET @d_time_in_am_ot = @v_OTR_s_time    
          END    
    
         IF CONVERT(TIME,@d_time_out_am) > CONVERT(TIME,@v_reg_am_end_time) --SET VALUE INTO START TIME OF OVERTIME REQUEST: JORGE RUSTOM VILLANUEVA    
          BEGIN    
           SET @d_time_out_am_ot = @v_reg_am_end_time    
          END    
         
         SET @v_time_ot_payable_am = DATEDIFF(mi,CONVERT(TIME,@d_time_in_am_ot),CONVERT(TIME,@d_time_out_am_ot))/60.00    
         SET @d_time_ot_payable   = @v_time_ot_payable_am    
         SET @v_time_ot_minute   = DATEDIFF(mi,CONVERT(TIME,@d_time_in_am_ot),CONVERT(TIME,@d_time_out_am_ot))    
         
       END    
      
      --CALCULATE OVERTIME FOR HALF DAY OT FOR PM TIME ENTRIES    
     ELSE IF @d_time_in_am = '' AND @d_time_out_am = ''    
       AND @d_time_in_pm <> '' AND @d_time_out_pm <> ''    
       BEGIN    
    
        SET @d_time_in_pm_ot = @d_time_in_pm    
        SET @d_time_out_pm_ot = @d_time_out_pm    
            
        IF CONVERT(TIME,@d_time_in_pm) < CONVERT(TIME,@v_reg_pm_start_time) --SET VALUE INTO START TIME OF OVERTIME REQUEST: JORGE RUSTOM VILLANUEVA    
          BEGIN    
           SET @d_time_in_pm_ot = @v_reg_pm_start_time    
          END    
    
        IF CONVERT(TIME,@d_time_out_pm) > CONVERT(TIME,@v_OTR_e_time) --SET VALUE INTO END TIME OF OVERTIME REQUEST: JORGE RUSTOM VILLANUEVA    
         BEGIN    
          SET @d_time_out_pm_ot = @v_OTR_e_time    
         END    
    
        SET @v_time_ot_payable_pm = DATEDIFF(mi,CONVERT(TIME,@d_time_in_pm_ot),CONVERT(TIME,@d_time_out_pm_ot))/60.00    
        SET @d_time_ot_payable   = @v_time_ot_payable_pm    
        SET @v_time_ot_minute   = DATEDIFF(mi,CONVERT(TIME,@d_time_in_pm_ot),CONVERT(TIME,@d_time_out_pm_ot))     
       END    
        
       
    END    
    
   ELSE IF (@v_ts_code = '98' AND @v_cal_date_type NOT IN ('HOL','SUN','SAT'))    
    BEGIN    
     IF @v_cal_date_type <> 'HOL'    
      BEGIN    
       SET @t_remarks_WFH = '*WORK FROM HOME'    
      END    
    END    
    
   ELSE --CALCULATE WEEKDAYS OVERTIME    
    BEGIN    
    
          
       SET @d_time_out_pm  = IIF(ISNULL(@v_pre_time_in_hrs,'') <> '' AND @d_time_out_pm > @v_OTR_e_time,@v_OTR_e_time,@d_time_out_pm)    
       -- sp_batch_generate_dtr_emptype '2021','02','2886','JO','03','BTHADMN'    
       SET @d_time_in_am_ot = @d_time_in_am    
       SET @d_time_out_am_ot = @d_time_out_am    
       SET @d_time_in_pm_ot = @d_time_in_pm    
       SET @d_time_out_pm_ot = @d_time_out_pm    
           
       IF CONVERT(TIME,@d_time_out_pm_ot) > CONVERT(TIME,@v_reg_pm_end_time) --CHECK IF EMPLOYEE RENDERED MORE THAN SHIFT PM OUT    
        BEGIN    
         IF CONVERT(TIME,@d_time_out_pm_ot) > CONVERT(TIME,@v_OTR_e_time) --SET VALUE INTO END TIME OF OVERTIME REQUEST: JORGE RUSTOM VILLANUEVA    
          BEGIN    
           SET @d_time_out_pm_ot = @v_OTR_e_time    
          END    
        END    
          
       SET @d_time_ot_payable = DATEDIFF(mi,CONVERT(TIME,@v_reg_pm_end_time),CONVERT(TIME,@d_time_out_pm_ot))/60.00    
       SET @v_time_ot_minute  = DATEDIFF(mi,CONVERT(TIME,@v_reg_pm_end_time),CONVERT(TIME,@d_time_out_pm_ot))    
       --SELECT @d_under_Time,@v_dtr_date    
         
       IF @v_late_no_ot = 1 --CHECK IF OVERTIME IS COUNTED IF THERE IS AN UNDERTIME    
        BEGIN    
         IF @d_under_Time > 0    
          BEGIN    
           SET @d_time_ot_payable  = 0 --CHECK FOR MINIMUM OVERTIME HOURS: JORGE RUSTOM VILLANUEVA    
          END    
        END    
        
        
    END    
    
   --DEDUCT BREAKS ON OVERTIME    
      
   --BREAKFAST    
   IF CONVERT(TIME,@d_time_in_am_ot) < CONVERT(TIME,@v_breakfast_break_end) AND ISNULL(@d_time_in_am_ot,'') <> ''   
 AND  CONVERT(TIME,@v_OTR_s_time) < @d_time_in_am_ot  
    BEGIN    
     SET @d_time_ot_payable = @d_time_ot_payable - IIF(DATEDIFF(MINUTE,CONVERT(TIME,@d_time_in_am_ot),CONVERT(TIME,@v_breakfast_break_end)) / 60.00 > 1,DATEDIFF(MINUTE,CONVERT(TIME,@v_breakfast_break_start),CONVERT(TIME,@v_breakfast_break_end)) / 60.00,DATEDIFF(MINUTE,CONVERT(TIME,@d_time_in_am_ot),CONVERT(TIME,@v_breakfast_break_end)) / 60.00)    
     SET @v_time_ot_minute  = @v_time_ot_minute - IIF(DATEDIFF(MINUTE,CONVERT(TIME,@d_time_in_am_ot),CONVERT(TIME,@v_breakfast_break_end)) > 1,DATEDIFF(MINUTE,CONVERT(TIME,@v_breakfast_break_start),CONVERT(TIME,@v_breakfast_break_end)),DATEDIFF(MINUTE,CONVERT(TIME,@d_time_in_am_ot),CONVERT(TIME,@v_breakfast_break_end)))    
    END    
   --DINNER    
   IF CONVERT(TIME,@d_time_out_pm_ot) > CONVERT(TIME,@v_dinner_break_start)     
   AND ISNULL(@d_time_out_pm_ot,'') <> ''    
    BEGIN    
    --SELECT @v_dtr_date,@d_time_ot_payable,@d_time_out_pm_ot,@v_dinner_break_start    
    -- sp_batch_generate_dtr_emptype '2021','02','2886','JO','03','BTHADMN'    
     SET @d_time_ot_payable = @d_time_ot_payable - IIF(DATEDIFF(MINUTE,CONVERT(TIME,@v_dinner_break_start),CONVERT(TIME,@d_time_out_pm_ot)) / 60.00 > 1,DATEDIFF(MINUTE,CONVERT(TIME,@v_dinner_break_start),CONVERT(TIME,@v_dinner_break_end)) / 60.00,DATEDIFF
(MINUTE,CONVERT(TIME,@v_dinner_break_start),CONVERT(TIME,@d_time_out_pm_ot)) / 60.00)     
     SET @v_time_ot_minute  = @v_time_ot_minute - IIF(DATEDIFF(MINUTE,CONVERT(TIME,@v_dinner_break_start),CONVERT(TIME,@d_time_out_pm_ot)) / 60.00 > 1,DATEDIFF(MINUTE,CONVERT(TIME,@v_dinner_break_start),CONVERT(TIME,@v_dinner_break_end)),DATEDIFF(MINUTE,CONVERT(TIME,@v_dinner_break_start),CONVERT(TIME,@d_time_out_pm_ot)))     
    END    
      --SET @v_time_ot_minute  = @d_time_ot_payable * 60    
    
       
    
   SET @d_time_ot_payable = IIF(@d_time_ot_payable < @v_time_ot_payable_minimum,0.00,@d_time_ot_payable)    
   SET @d_time_ot_hris    = IIF(@d_time_ot_payable > 0,CONVERT(VARCHAR(02),(CONVERT(INT,@d_time_ot_payable) * 60)/60) + 'h ' + IIF(@v_time_ot_minute % 60 > 0,CONVERT(VARCHAR(02),@v_time_ot_minute % 60)  + 'm',''),'')    
      
   IF @d_time_ot_payable >= @v_time_ot_payable_minimum    
    BEGIN    
     SET @t_remarks_OT    = 'OT, ' + @d_time_ot_hris    
    END    
   ELSE    
    BEGIN    
     SET @t_remarks_OT = ''    
    END    
    
      
   --------- COMPUTE OT ------------    
   -------------------------------------------------------------------------    
   -- SECOND CALCULATION FOR ORVERTIME END    
   -------------------------------------------------------------------------    
      
   END    
       
    
    
   --------- OVERRIDES TEMPORARY HARD CODED------------    
      
       
       
   IF @v_dtr_date IN (CONVERT(DATE,'2021-01-22'),CONVERT(DATE,'2021-03-31')) --OVERRIDE FOR WORK FROM HOME    
    BEGIN    
     SET @d_remarks_details_half_day = ''    
    
     DECLARE @v_override_out  VARCHAR(05)    
     DECLARE @v_override_in  VARCHAR(05)    
     DECLARE @v_undertime_override INT    
     SET @v_undertime_override = 0    
        
     SET @v_undertime_override = @d_under_Time    
     SET @v_override_in = ISNULL(@d_time_in_pm,'')    
    
    
     SET @v_override_out = '18:00'    
     --sp_batch_generate_dtr_emptype '2021','03','6468','CE','03','U2161'    
     --SELECT @v_undertime_override    
         
     IF @v_undertime_override >= 180    
      BEGIN    
       SET @v_undertime_override = @v_undertime_override - 300 --HALF DAY REMOVE UNDERTIME    
      END    
    
     SET @v_undertime_override = IIF(@v_undertime_override < 0,0,@v_undertime_override)    
         
     DECLARE @v_under_Time_hrs_total_remarks1  INT    
     DECLARE @v_under_Time_minute_total_remarks1  FLOAT    
     SET @v_under_Time_hrs_total_remarks1  = IIF(@v_undertime_override/60 < 1,0,@v_undertime_override/60)    
     --SELECT @v_under_Time_hrs_total_remarks1,@v_undertime_override    
     SET @v_under_Time_minute_total_remarks1  = ROUND(((@v_undertime_override/60.00) - @v_under_Time_hrs_total_remarks1) * 60,2)    
        
    
     IF @v_under_Time_minute_total_remarks1 > 0 OR @v_under_Time_hrs_total_remarks1 > 0    
      BEGIN    
       SET  @d_under_Time_remarks  = IIF(@v_under_Time_hrs_total_remarks1 > 0,CONVERT(VARCHAR(02),@v_under_Time_hrs_total_remarks1) + 'h ' + IIF(CONVERT(INT,@v_under_Time_minute_total_remarks1) > 0,CONVERT(VARCHAR(02),CONVERT(INT,@v_under_Time_minute_total_remarks1)) + 'm',''),CONVERT(VARCHAR(02),CONVERT(INT,@v_under_Time_minute_total_remarks1)) + 'm')    
      END    
     ELSE     
      BEGIN    
       SET  @d_under_Time_remarks  = ''    
      END    
    
     IF @v_dtr_date = CONVERT(DATE,'2021-03-31')    
      BEGIN    
       SET @v_override_out = @v_reg_pm_end_time    
          
      END    
        
    
        
    
     --SET @v_pre_time_out = IIF(ISNULL(@v_pre_time_out,'')='',@v_override_out,@v_pre_time_out)    
        
     IF @d_time_in_am <> '' AND @d_time_out_am <> ''    
      BEGIN    
       IF @d_time_ot_payable <= 0    
        BEGIN    
    
         SET @d_remarks_details = ''    
         SET @d_time_in_pm  = IIF(ISNULL(@v_override_in,'') <> '',@v_override_in,ISNULL(@v_reg_pm_start_time,'13:00'))    
         SET @d_time_out_pm = @v_reg_pm_end_time    
         SET @d_under_Time  = @v_undertime_override    
           
        END    
    
       ELSE    
        BEGIN    
         SET @d_under_Time = 0    
         SET @d_under_Time_remarks = ''    
        END    
    
          
      END    
    
     ELSE    
      BEGIN    
         SET @d_under_Time = 0    
         SET @d_under_Time_remarks = ''    
      END    
          
         
          
       
    END    
    
   --AUTOMATIC WORK FROM DUE TO TYPHOON--    
   IF @v_dtr_date  = CONVERT(DATE,'2021-05-14')    
    BEGIN    
     --SET @d_under_Time = 0    
     --SET @d_under_Time_remarks = ''    
     IF @d_time_ot_payable > @v_time_ot_payable_minimum    
      BEGIN    
       SET @t_remarks_WFH = ''    
      END    
     ELSE     
      BEGIN    
       SET @t_remarks_WFH = 'WORK FROM HOME'    
      END    
         
    END    
    
   --AUTOMATIC WORK FROM HALF DAY MORNING DUE TO EARTHQUAKE--    
   DECLARE @v_dept_code1    VARCHAR(02)    
   SELECT DISTINCT @v_dept_code1 = IIF(ISNULL(C2.department_code,'') <> '',C2.department_code,B.department_code)     
   FROM vw_payrollemployeemaster_ATS B    
   LEFT JOIN dbo.vw_payrollemployeemaster_asg_tbl C2    
    ON  C2.empl_id = B.empl_id    
    AND C2.employment_type = B.employment_type    
    AND (C2.ss_appl_flag = 1    
      OR C2.upd_master_flag = 1)    
    
   WHERE B.empl_id = @v_empl_id    
    
   IF @v_dtr_date  IN (CONVERT(DATE,'2021-08-12')) AND (@v_dept_code1 NOT IN ('21','22','23','24'))  -- FOR NO TIME IN AM AND TIME OUT AM  
    AND @v_lv_exist <> 'Y'    
    BEGIN    
         
     IF @v_ts_code NOT IN ('97','0')    
     BEGIN    
          
      IF @v_dept_code1 = '16' -- FOR ENGINEERING    
          
       BEGIN    
       IF @v_empl_id NOT IN (select empl_id from dtr_empl_national_hdr_tbl    
            Where dtr_month = '08'    
            and dtr_year = '2021'    
            and department_code = '16')    
       BEGIN    
        IF (@v_to_exist = 'N')    
        BEGIN    
         IF @v_astype_code <> '09'    
          BEGIN    
           SET @d_time_in_am = ''    
           SET @d_time_out_am = ''    
           SET @d_under_Time = 0    
           SET @d_under_Time_remarks =''    
           SET @t_remarks_WFH = 'WORK FROM HOME'    
           SET @d_remarks_details    ='WORK FROM HOME'    
           SET @d_remarks_details_half_day =''      
          END    
             
        END    
       END    
           
            
       END    
      ELSE    
       BEGIN    
            
         IF (@d_time_in_pm <> ''   --FOR EMPLOYEES THAT HAS PM IN AND PM OUT    
         AND @d_time_out_pm <> '')    
         AND (@d_time_in_am ='' OR @d_time_out_am = '')    
         BEGIN    
    
         SET @d_under_Time = 0    
         SET @d_under_Time_remarks = ''    
    
          IF CONVERT(TIME,@d_time_in_pm) >= CONVERT(TIME,@v_reg_pm_start_time)    
            OR CONVERT(TIME,@d_time_out_pm) < CONVERT(TIME,@v_reg_pm_end_time)    
            BEGIN    
             IF @d_time_in_pm <> '' AND CONVERT(time,@d_time_in_pm) > CONVERT(time,@v_reg_pm_start_time)    
               BEGIN    
                  
                SET @v_under_Time_hrs_pm_in = DATEDIFF(mi,CONVERT(time,@v_reg_pm_start_time),CONVERT(time,@d_time_in_pm))/60    
                SET @v_under_Time_minute_pm_in = DATEDIFF(mi,CONVERT(time,@v_reg_pm_start_time),CONVERT(time,@d_time_in_pm))%60    
     
               END    
    
              --CALCULATE UNDER TIME OF EMPLOYEE FOR TIME OUT PM    
             IF @d_time_out_pm <> '' AND CONVERT(time,@d_time_out_pm) < CONVERT(time,@v_reg_pm_end_time)    
               BEGIN    
                SET @v_under_Time_hrs_pm_out = DATEDIFF(mi,CONVERT(time,@d_time_out_pm),CONVERT(time,@v_reg_pm_end_time))/60    
                SET @v_under_Time_minute_pm_out = DATEDIFF(mi,CONVERT(time,@d_time_out_pm),CONVERT(time,@v_reg_pm_end_time))%60    
               END    
             SET @v_under_Time_hrs_total =  IIF(@v_under_Time_hrs_pm_in < 0,0,@v_under_Time_hrs_pm_in)    
                    + IIF(@v_under_Time_hrs_pm_out < 0,0,@v_under_Time_hrs_pm_out)    
               
               IF @v_under_Time_hrs_total >= 1    
                 BEGIN    
                  SET @v_under_Time_minute_total = (@v_under_Time_hrs_total * (60/1))    
                 END    
            
               SET @v_under_Time_minute_total     
                   = @v_under_Time_minute_total     
                   + IIF(@v_under_Time_minute_pm_in  < 0,0,@v_under_Time_minute_pm_in)    
                   + IIF(@v_under_Time_minute_pm_out < 0,0,@v_under_Time_minute_pm_out)    
                     
               SET  @d_under_Time       = @v_under_Time_minute_total    
               SET @v_under_Time_hrs_total_remarks  = IIF(@v_under_Time_minute_total/60 < 1,0,@v_under_Time_minute_total/60)    
               SET @v_under_Time_minute_total_remarks  = ROUND(((@v_under_Time_minute_total/60.00) - @v_under_Time_hrs_total_remarks) * 60,2)    
       
               IF @v_under_Time_minute_total_remarks > 0 OR @v_under_Time_hrs_total_remarks > 0    
                BEGIN    
                 SET @d_under_Time_remarks = IIF(@v_under_Time_hrs_total_remarks > 0,CONVERT(VARCHAR(02),@v_under_Time_hrs_total_remarks) + 'h ' + IIF(CONVERT(INT,@v_under_Time_minute_total_remarks) > 0,CONVERT(VARCHAR(02),CONVERT(INT,@v_under_Time_minute_total_remarks)) + 'm',''),CONVERT(VARCHAR(02),CONVERT(INT,@v_under_Time_minute_total_remarks)) + 'm')    
                END    
             
    
             SET @d_time_in_am = ''    
             SET @d_time_out_am = ''    
             SET @t_remarks_WFH = 'WORK FROM HOME'    
             SET @d_remarks_details    ='WORK FROM HOME'    
             SET @d_remarks_details_half_day =''    
             
            END    
           ELSE --REMOVE UNDERTIME FOR MORNING CONSIDERED WORK FROM HOME    
            BEGIN    
              
            -- sp_batch_generate_dtr_emptype '2021','08','8314','JO','02','BTHADM'    
             SET @d_time_in_am = ''    
             SET @d_time_out_am = ''    
             SET @d_under_Time = 0    
             SET @d_under_Time_remarks =''    
             SET @t_remarks_WFH = 'WORK FROM HOME'    
             SET @d_remarks_details    ='WORK FROM HOME'    
             SET @d_remarks_details_half_day =''    
            END    
         END    
          
        ELSE IF @d_time_in_am <> '' --COMPLETE TIME ENTRIES    
          AND @d_time_out_am <> ''    
          AND @d_time_in_pm <> ''     
          AND @d_time_out_pm <> ''    
          AND @d_under_Time > 0    
          BEGIN    
            
          SET @d_under_Time = 0    
          SET @d_under_Time_remarks =''    
           IF CONVERT(TIME,@d_time_in_pm) >= CONVERT(TIME,@v_reg_pm_start_time)    
            OR CONVERT(TIME,@d_time_out_pm) < CONVERT(TIME,@v_reg_pm_end_time)    
            BEGIN    
              
             IF @d_time_in_pm <> '' AND CONVERT(time,@d_time_in_pm) > CONVERT(time,@v_reg_pm_start_time)    
               BEGIN    
                  
                SET @v_under_Time_hrs_pm_in = DATEDIFF(mi,CONVERT(time,@v_reg_pm_start_time),CONVERT(time,@d_time_in_pm))/60    
                SET @v_under_Time_minute_pm_in = DATEDIFF(mi,CONVERT(time,@v_reg_pm_start_time),CONVERT(time,@d_time_in_pm))%60    
     
               END    
    
              --CALCULATE UNDER TIME OF EMPLOYEE FOR TIME OUT PM    
             IF @d_time_out_pm <> '' AND CONVERT(time,@d_time_out_pm) < CONVERT(time,@v_reg_pm_end_time)    
               BEGIN    
                SET @v_under_Time_hrs_pm_out = DATEDIFF(mi,CONVERT(time,@d_time_out_pm),CONVERT(time,@v_reg_pm_end_time))/60    
                SET @v_under_Time_minute_pm_out = DATEDIFF(mi,CONVERT(time,@d_time_out_pm),CONVERT(time,@v_reg_pm_end_time))%60    
               END    
               
             SET @v_under_Time_hrs_total =  IIF(@v_under_Time_hrs_pm_in < 0,0,@v_under_Time_hrs_pm_in)    
                    + IIF(@v_under_Time_hrs_pm_out < 0,0,@v_under_Time_hrs_pm_out)    
               
               IF @v_under_Time_hrs_total >= 1    
                 BEGIN    
                  SET @v_under_Time_minute_total = (@v_under_Time_hrs_total * (60/1))    
                 END    
                   
               SET @v_under_Time_minute_total     
                   = IIF(@v_under_Time_minute_pm_in  < 0,0,@v_under_Time_minute_pm_in)    
                   + IIF(@v_under_Time_minute_pm_out < 0,0,@v_under_Time_minute_pm_out)    
                
               SET  @d_under_Time       = @v_under_Time_minute_total    
                
               SET @v_under_Time_hrs_total_remarks  = IIF(@v_under_Time_minute_total/60 < 1,0,@v_under_Time_minute_total/60)    
               SET @v_under_Time_minute_total_remarks  = ROUND(((@v_under_Time_minute_total/60.00) - @v_under_Time_hrs_total_remarks) * 60,2)    
       
               IF @v_under_Time_minute_total_remarks > 0 OR @v_under_Time_hrs_total_remarks > 0    
                BEGIN    
                 SET @d_under_Time_remarks = IIF(@v_under_Time_hrs_total_remarks > 0,CONVERT(VARCHAR(02),@v_under_Time_hrs_total_remarks) + 'h ' + IIF(CONVERT(INT,@v_under_Time_minute_total_remarks) > 0,CONVERT(VARCHAR(02),CONVERT(INT,@v_under_Time_minute_total_remarks)) + 'm',''),CONVERT(VARCHAR(02),CONVERT(INT,@v_under_Time_minute_total_remarks)) + 'm')    
                END    
                 
             SET @d_time_in_am = ''    
             SET @d_time_out_am = ''    
             SET @t_remarks_WFH = 'WORK FROM HOME'    
             SET @d_remarks_details    ='WORK FROM HOME'    
             SET @d_remarks_details_half_day =''    
            END    
           ELSE --REMOVE UNDERTIME FOR MORNING CONSIDERED WORK FROM HOME    
            BEGIN    
             SET @d_time_in_am = ''    
             SET @d_time_out_am = ''    
             SET @d_under_Time = 0    
             SET @d_under_Time_remarks =''    
             SET @t_remarks_WFH = 'WORK FROM HOME'    
             SET @d_remarks_details    ='WORK FROM HOME'    
             SET @d_remarks_details_half_day =''    
            END    
    
             
          END    
     
         
       ELSE IF @d_time_in_am = ''     
          AND @d_time_out_am = ''    
          AND @d_time_in_pm = ''     
          AND @d_time_out_pm = ''    
          AND (@v_to_exist = 'N'    
          )    
          BEGIN    
           IF (@v_ts_code <> '1')     
           BEGIN    
             SET @d_under_Time = 0    
             SET @d_under_Time_remarks =''    
             SET @t_remarks_WFH = 'WORK FROM HOME'    
             SET @d_remarks_details    ='WORK FROM HOME'    
             SET @d_remarks_details_half_day =''    
           END    
    
           IF (@v_astype_code IN ('09','01','10','11'))    
           BEGIN    
             SET @d_under_Time = 0    
             SET @d_under_Time_remarks =''    
             SET @t_remarks_WFH = ''    
             SET @d_remarks_details    =''    
             SET @d_remarks_details_half_day =''    
           END    
            
            
               
          END    
       END       
          
          
          
     END    
          
     --SET @d_under_Time = 0    
     --SET @d_under_Time_remarks = ''    
     --IF @d_time_ot_payable > @v_time_ot_payable_minimum    
     -- BEGIN    
     --  SET @t_remarks_WFH = ''    
     -- END    
     --ELSE     
     -- BEGIN    
     --  SET @t_remarks_WFH = 'WORK FROM HOME'    
     -- END    
         
    END    
    
    
  IF @v_dtr_date  IN (CONVERT(DATE,'2021-12-24'),CONVERT(DATE,'2021-12-31'),CONVERT(DATE,'2022-04-13')) AND (@v_dept_code1 NOT IN ('21','22','23','24'))  -- FOR NO TIME IN PM AND TIME OUT PM  
    AND @v_lv_exist <> 'Y'    
 AND @v_to_exist <> 'Y' --LAST 2021-12-27  
 AND (@d_time_in_am <> '' AND @d_time_out_am <> ''  
   AND @d_time_in_pm = '' AND @d_time_out_pm = '')  
 BEGIN    
    
    
  IF @d_under_Time >= 240  
   BEGIN  
    SET @d_under_Time = IIF((@d_under_Time - 240) < 0,0,(@d_under_Time - 240)) --DEDUCT HALF DAY UNDERTIME  
    SET @v_under_Time_hrs_total_remarks  = IIF(@d_under_Time/60 < 1,0,@d_under_Time/60)    
                SET @v_under_Time_minute_total_remarks  = ROUND(((@d_under_Time/60.00) - @v_under_Time_hrs_total_remarks) * 60,2)    
       
    IF @v_under_Time_minute_total_remarks > 0 OR @v_under_Time_hrs_total_remarks > 0    
      BEGIN    
     SET @d_under_Time_remarks = IIF(@v_under_Time_hrs_total_remarks > 0,CONVERT(VARCHAR(02),@v_under_Time_hrs_total_remarks) + 'h ' + IIF(CONVERT(INT,@v_under_Time_minute_total_remarks) > 0,CONVERT(VARCHAR(02),CONVERT(INT,@v_under_Time_minute_total_remarks)) + 'm',''),CONVERT(VARCHAR(02),CONVERT(INT,@v_under_Time_minute_total_remarks)) + 'm')    
      END  
     ELSE  
     SET @d_under_Time_remarks = ''     
  
           
   END  
  
  IF @v_tmp_time_in_pm <> ''  
   BEGIN  
    SET @d_time_in_pm  = @v_tmp_time_in_pm  
    SET @d_time_out_pm = '17:00'  
   END  
  ELSE  
   BEGIN  
    SET @d_time_in_pm = '12:31'  
    SET @d_time_out_pm = '17:00'  
   END  
    
  SET @d_remarks_details_half_day = ''  
    
  
 END  
   ---------END OVERRIDES TEMPORARY HARD CODED------------    
    
          
          
   -------------------------------------------------------------------------    
   -- FINAL CALCULATION FOR REMARKS COMBINATION START    
   -------------------------------------------------------------------------    
   DECLARE @v_check_entries BIT    
   SET @v_check_entries = 0    
    
   --sp_batch_generate_dtr_emptype '2021','04','2161','JO','02'    
  IF @d_time_in_am <> '' AND @d_time_out_am <> ''    
      AND @d_time_in_pm = '' AND @d_time_out_pm = ''    
      --AND (@v_ts_code <> '0' OR @v_cal_date_type NOT IN ('HOL','SUN','SAT'))    
      BEGIN    
      --IF @d_no_of_ob = 0    
      --BEGIN    
      --  SET @d_remarks_details  = 'HALF DAY-PM'      
      --END    
     SET @v_check_entries = 1    
      END    
    
   ELSE IF @d_time_in_am = '' AND @d_time_out_am = ''    
      AND @d_time_in_pm <> '' AND @d_time_out_pm <> ''    
      --AND (@v_ts_code <> '0' OR @v_cal_date_type NOT IN ('HOL','SUN','SAT'))    
      BEGIN    
      --IF @d_no_of_ob = 0    
      --BEGIN    
      --  SET @d_remarks_details  = 'HALF DAY-AM'      
      --END    
     SET @v_check_entries = 1    
      END    
       
   ELSE IF @d_time_in_am <> '' AND @d_time_out_am <> ''    
      AND @d_time_in_pm <> '' AND @d_time_out_pm <> ''    
      BEGIN    
     SET @v_check_entries = 1    
      END    
        
   IF (@d_time_in_am = '' OR @d_time_out_am = ''    
     OR @d_time_in_pm = '' OR @d_time_out_pm = '')    
      BEGIN    
    
     IF @v_to_exist = 'Y'     
      BEGIN    
       SET @v_check_entries = 1    
            
        IF (@v_ts_code = '0' AND @v_cal_date_type <> 'HOL')    
         BEGIN    
          SET @d_under_Time  = 0     
          SET @d_under_Time_remarks  = ''    
         END    
           
      END    
    
          
    END    
    
   IF @v_dtr_date = '2021-08-12' AND @v_dept_code1 NOT IN ('21','22','23','24')    
     BEGIN    
      SET @v_check_entries = 1    
     END    
  --EXEC sp_batch_generate_dtr_emptype '2021','11','0657','RE','23','U0657'  
  
    
   
   IF  @v_check_entries = 0     
    AND (@v_cal_date_type NOT IN ('HOL','SUN','SAT')     
    OR @v_ts_code <> '0')  
 AND @t_remarks_AS = ''  
 AND  @v_leavetype_descr = ''    
    BEGIN    
     SET @d_remarks_details  = '????????'      
     SET @d_under_Time  = 0     
     SET @d_under_Time_remarks  = ''    
    END    
   ELSE    
    BEGIN    
     IF @v_check_entries = 0    
      AND (@d_time_in_am <> ''    
       OR @d_time_out_am <> ''    
       OR @d_time_in_pm <> ''    
       OR @d_time_out_pm <> '')    
       --INVALID TIME ENTRIES DURING DAY OFF    
      BEGIN    
         
        --SET @d_remarks_details  = '????????'  --REMOVE DAY OFF QUESTIONED MARK    
        SET @d_remarks_details  = @t_remarks_HL + ''      
        SET @d_under_Time  = 0     
        SET @d_under_Time_remarks  = ''    
      END    
     ELSE    
      BEGIN    
       SET @d_remarks_details = @t_remarks_HL +IIF(@t_remarks_HL <> '' AND @t_remarks_TO <> '',',','')+@t_remarks_TO + ' ' + @t_remarks_OT    
      END    
         
    END    
    
    
   --SET @d_remarks_details = @t_remarks_HL +' '+@t_remarks_TO + ' ' + @t_remarks_OT    
       
   IF @d_remarks_details_half_day <> ''    
    SET @d_remarks_details = @d_remarks_details_half_day     
      
   
        
       
       
   IF @t_remarks_WFH <> ''     
    AND @v_to_exist = 'N'    
   BEGIN    
    SET @d_remarks_details = @t_remarks_WFH    
    
    IF @v_dtr_date <> '2021-08-12' OR @v_dept_code1 NOT IN ('21','22','23','24')    
     BEGIN    
      SET @d_under_Time = 0    
      SET @d_under_Time_remarks = ''    
     END    
        
        
   END    
    
    
    
   --sp_batch_generate_dtr_emptype '2021','03','1646','RE','03','U2161'    
       
   --FOR QURANTINED    
   IF @t_remarks_AS <> '' AND @v_astype_code IN ('09','10','11')    
    BEGIN    
  
       IF @v_astype_code IN ('10','11')  
  BEGIN  
   SET @t_remarks_AS = 'WORK FROM HOME'  
  END  
  
     IF @v_cal_date_type = 'HOL'    
      BEGIN    
       SET @d_remarks_details = @t_remarks_HL +','+ UPPER(@t_remarks_AS)    
      END    
     IF @v_ts_code = '0' AND @v_cal_date_type <> 'HOL'    
      BEGIN    
       SET @d_remarks_details = UPPER(@t_remarks_AS)    
       --SET @d_remarks_details = 'DO' +','+ UPPER(@t_remarks_AS)    
      END    
     IF @v_ts_code <> '0' AND @v_cal_date_type <> 'HOL'    
      BEGIN    
       SET @d_remarks_details = UPPER(@t_remarks_AS)    
      END    
  
    
    END    
  
   --FOR ABSENT    
   IF @t_remarks_AS <> '' AND @v_astype_code = '01'    
    BEGIN    
     SET @d_time_in_am  = ''    
     SET @d_time_out_am  = ''    
     SET @d_time_in_pm  = ''    
     SET @d_time_out_pm  = ''    
     SET @d_remarks_details = UPPER(@t_remarks_AS)    
    END   
   
  IF @v_remarks_pt <> ''    
  BEGIN    
   SET @d_remarks_details = @d_remarks_details +IIF(@d_remarks_details = '','',' ')+@v_remarks_pt    
   SET @v_under_Time_hrs_am_in  = DATEDIFF(mi,CONVERT(TIME,@v_n_time_in_am),CONVERT(TIME,@v_n_time_out_am))    
   SET @v_under_Time_hrs_pm_in  = DATEDIFF(mi,CONVERT(TIME,@v_n_time_in_pm),CONVERT(TIME,@v_n_time_out_pm))    
   SET @d_under_Time = @v_under_Time_hrs_am_in + @v_under_Time_hrs_pm_in    
   SET @v_under_Time_hrs_total_remarks  = IIF(@d_under_Time/60 < 1,0,@d_under_Time/60)     
   SET @v_under_Time_minute_total_remarks  = ROUND(((@d_under_Time/60.00) - @v_under_Time_hrs_total_remarks) * 60,2)    
   SET @d_under_Time_remarks = IIF(@v_under_Time_hrs_total_remarks > 0,CONVERT(VARCHAR(02),@v_under_Time_hrs_total_remarks) + 'h ' + IIF(CONVERT(INT,@v_under_Time_minute_total_remarks) > 0,CONVERT(VARCHAR(02),CONVERT(INT,@v_under_Time_minute_total_remarks
)) + 'm',''),CONVERT(VARCHAR(02),CONVERT(INT,@v_under_Time_minute_total_remarks)) + 'm')            
   
  
  END       
  
  --EXEC sp_batch_generate_dtr_emptype '2022','06','4432','RE','23','U2161'  
 -- if @v_empl_id = '4432'  
 -- and @v_dtr_date = '2022-06-22'  
 --SELECT @d_remarks_details  
   IF @t_remarks_LV <> ''    
    BEGIN    
  
  
    IF @v_leavetype_code = 'CTO'    
     BEGIN    
   
    
     
     DECLARE @v_cto_hours MONEY  
     SET @v_cto_hours = 0  
  SELECT @v_cto_hours = SUM(date_num_day_total)   
  FROM leave_application_dtl_tbl  
  where empl_id = @v_empl_id  
  and @v_dtr_date BETWEEN leave_date_from AND leave_date_to  
    
  
  IF @v_ts_code IN ('26','99')  
  AND @v_cto_hours < 8  
   BEGIN  
    
   SET @d_under_Time = @d_under_Time - (@v_cto_hours * 60) --MINUS HALF DAY  
     
   IF  @d_under_Time < 0  
    BEGIN  
     SET @d_under_Time = @d_under_Time * (-1)  
    END  
  
  
     SET @v_under_Time_hrs_total_remarks  = IIF(@d_under_Time/60 < 1,0,@d_under_Time/60)    
     SET @v_under_Time_minute_total_remarks  = ROUND(((@d_under_Time/60.00) - @v_under_Time_hrs_total_remarks) * 60,2)    
       
         IF @v_under_Time_minute_total_remarks > 0 OR @v_under_Time_hrs_total_remarks > 0    
              BEGIN    
                 SET @d_under_Time_remarks = IIF(@v_under_Time_hrs_total_remarks > 0,CONVERT(VARCHAR(02),@v_under_Time_hrs_total_remarks) + 'h ' + IIF(CONVERT(INT,@v_under_Time_minute_total_remarks) > 0,CONVERT(VARCHAR(02),CONVERT(INT,@v_under_Time_minute_total_remarks)) + 'm',''),CONVERT(VARCHAR(02),CONVERT(INT,@v_under_Time_minute_total_remarks)) + 'm')    
              END    
  ELSE  
   BEGIN  
    SET @d_under_Time_remarks = ''  
   END  
   END  
  ELSE   
   BEGIN   
     SET @d_under_Time = 0  
     SET @d_under_Time_remarks = ''    
   END  
       --EXEC sp_batch_generate_dtr_emptype '2022','05','4202','RE','11','U2161'  
     --EXEC sp_batch_generate_dtr_emptype '2022','06','4099','RE','11','U2161'  
  --if @v_empl_id = '4099'  
  --and @v_dtr_date = '2022-06-01'  
  -- SELECT @d_under_Time,@v_cto_hours,@d_time_in_am,@d_time_out_am  
   
     END    
    ELSE    
     BEGIN    
      SET @d_time_in_am  = ''    
      SET @d_time_out_am  = ''    
      SET @d_time_in_pm  = ''    
      SET @d_time_out_pm  = ''    
     END    
         
         
     IF @t_remarks_AS <> ''    
      BEGIN    
       SET @d_remarks_details = IIF(@t_remarks_WFH <> '',@t_remarks_WFH+',','') + IIF(@t_remarks_TO <> '',@t_remarks_TO + ',','') +  @t_remarks_LV + ',' +  @t_remarks_AS     
      END    
     ELSE    
      BEGIN    
       SET @d_remarks_details = IIF(@t_remarks_WFH <> '',@t_remarks_WFH+',','') + IIF(@t_remarks_TO <> '',@t_remarks_TO + ',','') + @t_remarks_LV    
      END   
   
         
    END    
  
       
      
      
   --IF @t_remarks_TO <> ''    
   -- SELECT @v_dtr_date,@d_time_in_am,@d_time_out_am    
        
       
       
   --------- POST AND PRETIME OVERRIDES CODED------------    
   IF ISNULL(@v_pre_time_in_hrs,'') <> ''    
   BEGIN    
    
    IF @t_remarks_OT = ''     
     AND @v_under_Time_hrs_pm_out = 0    
     AND @d_time_in_am <> ''    
     AND @d_time_out_am <> ''    
     AND @d_time_in_pm <> ''    
     AND @d_time_out_pm <> ''     
     BEGIN    
      SET @d_time_out_pm = @v_post_time_out_hrs    
     END    
    
   END    
   --------- POST AND PRETIME OVERRIDES CODED------------    
      
   -------------------------------------------------------------------------    
   -- FINAL CALCULATION FOR REMARKS COMBINATION END    
   -------------------------------------------------------------------------    
    
   --END -- @t_compute    
     
   --FOR APPROVED CHECKING 1ST QUINCENA    
        
   DECLARE @v_check_exists_qcna BIT    
       
        
       
   IF CONVERT(DATE,@v_frst_qcna_posted_ddtm) <> CONVERT(DATE,'')     
    AND @v_dtr_date <= CONVERT(DATE,@p_dtr_year + '-' + @p_dtr_month + '-15')    
    BEGIN    
    
       
    SET @v_check_exists_qcna = 0    
    SELECT @v_approval_status = A.approval_status,@v_check_exists_qcna = 1    
    FROM empl_dtr_hdr_tbl A    
    --INNER JOIN empl_dtr_dtl_tbl B    
    --ON B.dtr_order_no = A.dtr_order_no    
    --AND B.empl_id = A.empl_id    
    WHERE A.dtr_month = @p_dtr_month    
    AND A.dtr_year = @p_dtr_year    
    AND A.empl_id = @v_empl_id    
   
        
    IF @v_check_exists_qcna = 1    
     BEGIN    
      SELECT     
       @d_time_in_am   =  A.time_in_am     
      ,@d_time_out_am   =   A.time_out_am    
      ,@d_time_in_pm   =   A.time_in_pm    
      ,@d_time_out_pm   =   A.time_out_pm    
      ,@d_ts_code    =   A.ts_code    
      ,@d_under_Time   =   A.under_Time    
      ,@d_under_Time_remarks =   A.under_Time_remarks    
      ,@d_remarks_details  =   A.remarks_details    
      ,@d_time_ot_hris  =  A.time_ot_hris    
      ,@d_time_days_equi  =   A.time_days_equi    
      ,@d_time_hours_equi  =   A.time_hours_equi    
      ,@d_time_ot_payable  =   A.time_ot_payable    
      ,@d_no_of_as   =  A.no_of_as    
      ,@d_no_of_ob   =  A.no_of_ob    
      ,@d_no_of_lv   =   A.no_of_lv    
      FROM empl_dtr_dtl_tbl A    
      WHERE dtr_date = @v_dtr_date    
      AND empl_id = @v_empl_id    
     END    
        
    END    
    
   ELSE IF CONVERT(DATE,@v_sec_qcna_posted_ddtm) <> CONVERT(DATE,'')     
    AND (@v_dtr_date > CONVERT(DATE,@p_dtr_year + '-' + @p_dtr_month + '-15') AND @v_dtr_date <= CONVERT(DATE,EOMONTH(@p_dtr_year + '-' + @p_dtr_month + '-01')))    
    BEGIN    
    
     SET @v_check_exists_qcna = 0         
  SELECT @v_approval_status = A.approval_status,@v_check_exists_qcna = 1    
     FROM empl_dtr_hdr_tbl A    
     --INNER JOIN empl_dtr_dtl_tbl B    
     --ON B.dtr_order_no = A.dtr_order_no    
     --AND B.empl_id = A.empl_id    
     WHERE A.dtr_month = @p_dtr_month    
     AND A.dtr_year = @p_dtr_year    
     AND A.empl_id = @v_empl_id    
    
     IF @v_check_exists_qcna = 1    
      BEGIN    
       SELECT     
        @d_time_in_am   =  A.time_in_am     
       ,@d_time_out_am   =   A.time_out_am    
       ,@d_time_in_pm   =   A.time_in_pm    
       ,@d_time_out_pm   =   A.time_out_pm    
       ,@d_ts_code    =   A.ts_code    
       ,@d_under_Time   =   A.under_Time    
       ,@d_under_Time_remarks =   A.under_Time_remarks    
       ,@d_remarks_details  =   A.remarks_details    
       ,@d_time_ot_hris  =  A.time_ot_hris    
       ,@d_time_days_equi  =   A.time_days_equi    
       ,@d_time_hours_equi  =   A.time_hours_equi    
       ,@d_time_ot_payable  =   A.time_ot_payable    
       ,@d_no_of_as   =  A.no_of_as    
       ,@d_no_of_ob   =  A.no_of_ob    
       ,@d_no_of_lv   =   A.no_of_lv    
       FROM empl_dtr_dtl_tbl A    
       WHERE dtr_date = @v_dtr_date    
       AND empl_id = @v_empl_id    
      END    
         
    END    
       
    
    
       
   DECLARE @v_exists_dtr_hdr   BIT    
   DECLARE @v_dtr_hdr_status   VARCHAR(01)    
   DECLARE @v_dtr_order_no    VARCHAR(10)    
   DECLARE @v_dept_code    VARCHAR(02)    
   --SELECT @v_total_ot_remarks,@v_total_undertime_remarks    
   SET @v_dept_code = ''    
    
   SET @v_exists_dtr_hdr = 0    
   SET @v_dtr_order_no = ''    
   SET @v_dtr_hdr_status = ''  --N - NEW    
             --A - APPROVED    
             --R - REJECTED    
         
   DECLARE @v_exists_transmittal_status VARCHAR(01) --FOR TRANSMITTAL APPROVAL    
   DECLARE @v_exists_transmittal_view   VARCHAR(01) --FOR TRANSMITTAL APPROVAL    
      
   IF @v_first_row = 0 -- GET LATEST DTR ORDER NUMER FROM HEADER    
    BEGIN    
         
      SET @d_dtr_order_no = ISNULL((SELECT TOP 1        
       A.dtr_order_no        
      FROM empl_dtr_hdr_tbl A      
      ORDER BY A.dtr_order_no DESC ),0)        
          
      SET @d_dtr_order_no = CONVERT(INT, @d_dtr_order_no) + 1        
      SET @d_dtr_order_no = RIGHT((REPLICATE('0',10) + @d_dtr_order_no), 10)      
    END    
    
   ELSE     
    BEGIN    
      SET @d_dtr_order_no = ISNULL((SELECT TOP 1        
       A.dtr_order_no        
      FROM empl_dtr_hdr_tmp_10 A      
      WHERE A.dtr_user_id = @p_user_id1    
      ORDER BY A.dtr_order_no DESC ),0)        
    END    
    
   SELECT DISTINCT @v_dept_code = IIF(ISNULL(C2.department_code,'') <> '',C2.department_code,B.department_code)     
   FROM vw_payrollemployeemaster_ATS B    
   LEFT JOIN vw_payrollemployeemaster_asg_tbl C2    
    ON  C2.empl_id = B.empl_id    
    AND C2.employment_type = B.employment_type    
    AND (C2.ss_appl_flag = 1    
      OR C2.upd_master_flag = 1)    
     
   WHERE B.empl_id = @v_empl_id    
       
   -------------------------------------------------------------------------    
   SELECT @v_exists_dtr_hdr = 1     
    FROM empl_dtr_hdr_tmp_10    
   WHERE dtr_order_no = @d_dtr_order_no    
   AND   dtr_user_id = @p_user_id1   
   AND   empl_id = @v_empl_id    
    
   IF @v_exists_dtr_hdr = 0    
    BEGIN    
         
     IF @v_first_row > 0    
      BEGIN    
    
       SET @d_dtr_order_no = ISNULL((SELECT TOP 1        
         A.dtr_order_no        
        FROM empl_dtr_hdr_tmp_10 A     
        WHERE A.dtr_user_id = @p_user_id1     
        ORDER BY A.dtr_order_no DESC ),0)      
        SET @d_dtr_order_no = CONVERT(INT, @d_dtr_order_no) + 1        
        SET @d_dtr_order_no = RIGHT((REPLICATE('0',10) + @d_dtr_order_no), 10)      
      END    
         
           
    
     INSERT INTO empl_dtr_hdr_tmp_10    
     SELECT     
       @p_user_id1    
      ,@d_dtr_order_no    
      ,@p_dtr_year1    
      ,@p_dtr_month1    
      ,@v_dept_code    
      ,@v_approval_status    
      ,''    
      ,''    
      ,''    
      ,@v_empl_id    
      ,GETDATE()    
      ,'SYSADMIN'    
      ,''    
      ,''    
      ,@v_frst_qcna_posted_ddtm    
      ,@v_frst_qcna_posted_by    
      ,@v_sec_qcna_posted_ddtm    
      ,@v_sec_qcna_posted_by    
      ,'0'    
           
            
    END    
    
   ELSE    
    BEGIN    
     SELECT @d_dtr_order_no = dtr_order_no    
     FROM empl_dtr_hdr_tmp_10    
     WHERE dtr_order_no = @d_dtr_order_no    
     AND   dtr_user_id = @p_user_id1    
     AND   empl_id = @v_empl_id    
    END    
       
   INSERT INTO empl_dtr_dtl_tmp_10    
   SELECT    
     @p_user_id1    
    ,@d_dtr_order_no       
    ,@d_empl_id        
    ,@d_dtr_date        
    ,@d_time_in_am       
    ,@d_time_out_am       
    ,@d_time_in_pm       
    ,@d_time_out_pm       
    ,@d_ts_code        
    ,@d_under_Time       
    ,@d_under_Time_remarks     
    ,@d_remarks_details      
    ,@d_time_ot_hris       
    ,@d_time_days_equi      
    ,@d_time_hours_equi      
    ,@d_time_ot_payable      
    ,@d_approval_status      
    ,@d_no_of_as        
    ,@d_no_of_ob        
    ,@d_no_of_lv     
         
    
   IF @v_dtr_date = EOMONTH (@p_dtr_year1 + '-' + @p_dtr_month1 + '-01')    
    BEGIN    
     SET @d_dtr_order_no = CONVERT(INT, @d_dtr_order_no) + 1        
     SET @d_dtr_order_no = RIGHT((REPLICATE('0',10) + @d_dtr_order_no), 10)      
    END    
    
   SET @v_first_row = 1    
   
      
   END    
   SET  @v_dtr_date_tmp = @v_dtr_date    
    
  -- FETCH NEXT FROM c_DTR     
  -- INTO @v_empl_id     
  --  ,@v_dtr_date        
  --  ,@v_cal_date_type     
  --  ,@v_cal_date_dow     
  --  ,@v_cal_hol_descr     
  --  ,@v_tse_day_parent      
  --  ,@v_tse_in_am       
  --  ,@v_pre_time_in_hrs      
  --  ,@v_tse_out_am       
  --  ,@v_tse_in_pm       
  --  ,@v_tse_out_pm       
  --  ,@v_post_time_out_hrs     
  --  ,@v_tse_month       
  --  ,@v_tse_year        
  --  ,@v_ts_code        
  --  --,@v_tse_dtl_id       
  --  ,@v_ts_add_days       
  --  ,@v_ts_mid_break       
  --  ,@v_ts_day_equivalent     
  --  ,@v_reg_am_start_time     
  --  ,@v_reg_am_end_time      
  --  ,@v_reg_pm_start_time     
  --  ,@v_reg_pm_end_time      
  --  ,@v_actual_time_in_am     
  --  ,@v_actual_time_out_am     
  --  ,@v_actual_time_in_pm     
  --  ,@v_actual_time_out_pm     
  --  ,@v_as_exist         
  --  ,@v_time_in_am        
  --  ,@v_time_out_am        
  --  ,@v_time_in_pm        
  --  ,@v_time_out_pm        
  --  ,@v_inputtype_code       
  --  ,@v_inputtype_sub_descr      
  --  ,@v_remarks         
  --  ,@v_astype_code        
  --  ,@v_n_time_in_am        
  --  ,@v_n_time_out_am       
  --  ,@v_n_time_in_pm        
  --  ,@v_n_time_out_pm       
  --  ,@v_n_inputtype_code       
  --  ,@v_n_inputtype_sub_descr     
  --  ,@v_n_remarks        
  --  ,@v_n_astype_code    
  --  ,@v_n_reason_code     
  --  ,@v_lv_exist        
  --  ,@v_date_num_day     
  --  ,@v_leavetype_code    
  --  ,@v_leavetype_descr    
  --  ,@v_leave_comments    
  --  ,@v_to_exist          
  --  ,@v_to_time_in_am       
  --  ,@v_to_time_out_am        
  --  ,@v_to_time_in_pm       
  --  ,@v_to_time_out_pm       
  --  ,@v_to_remarks         
  --  ,@v_otr_exist       
  --  ,@v_ot_start_time      
  --  ,@v_ot_start_ampm      
  --  ,@v_ot_end_time       
  --  ,@v_ot_end_ampm       
  --  ,@v_ot_remarks       
  --  ,@v_weekdays_flag      
  --  ,@v_weekdays_in       
  --  ,@v_weekdays_in_ampm      
  --  ,@v_weekdays_out       
  --  ,@v_weekdays_out_ampm     
  --  ,@v_weekend_flag       
  --  ,@v_weekend_in       
  --  ,@v_weekend_in_ampm      
  --  ,@v_weekend_out       
  --  ,@v_weekend_out_ampm      
  --  ,@v_holiday_flag       
  --  ,@v_holiday_in       
  --  ,@v_holiday_in_ampm      
  --  ,@v_holiday_out       
  --  ,@v_holiday_out_ampm      
  --  ,@v_dayoff_ot_flag      
  --  ,@v_dayoff_ot_in       
  --  ,@v_dayoff_ot_in_ampm     
  --  ,@v_dayoff_ot_out      
  --  ,@v_dayoff_ot_out_ampm     
  --  ,@v_ot_coc_credit_flag     
  --  ,@v_frst_qcna_posted_ddtm     
  --  ,@v_sec_qcna_posted_ddtm    
  --  ,@v_frst_qcna_posted_by     
  --  ,@v_sec_qcna_posted_by      
  END    
    
  --CLOSE c_DTR     
  --DEALLOCATE c_DTR     
      
    
  DELETE FROM empl_dtr_hdr_tbl    
  WHERE EXISTS (SELECT 'X'    
              FROM empl_dtr_hdr_tmp_10 A1     
              WHERE A1.empl_id  = empl_dtr_hdr_tbl.empl_id    
     AND   A1.dtr_month = empl_dtr_hdr_tbl.dtr_month    
     AND   A1.dtr_year  = empl_dtr_hdr_tbl.dtr_year    
     AND   A1.dtr_user_id = @p_user_id1    
     )    
  --AND empl_dtr_hdr_tbl.approval_status = 'N'    
  AND empl_dtr_hdr_tbl.dtr_month = @p_dtr_month1    
  AND empl_dtr_hdr_tbl.dtr_year  = @p_dtr_year1    
    
  ----DAAN NGA DELETE 2022-05-05  
  --DELETE FROM empl_dtr_dtl_tbl    
  --WHERE EXISTS (SELECT 'X'    
  --            FROM empl_dtr_hdr_tmp_10 A1     
  --            WHERE A1.empl_id = empl_dtr_dtl_tbl.empl_id    
  --   AND   A1.dtr_user_id = @p_user_id    
  --   AND CONVERT(INT,A1.dtr_month) = CONVERT(INT,@p_dtr_month)    
  --   AND CONVERT(INT,A1.dtr_year) = CONVERT(INT,@p_dtr_year)    
  --  )    
  ----AND NOT EXISTS (SELECT 'X' FROM empl_dtr_hdr_tbl A2    
  ----    WHERE A2.empl_id = empl_dtr_dtl_tbl.empl_id    
  ----    AND CONVERT(INT,A2.dtr_month) = MONTH(empl_dtr_dtl_tbl.dtr_date)    
  ----    AND CONVERT(INT,A2.dtr_year)  = YEAR(empl_dtr_dtl_tbl.dtr_date)    
  ----    AND A2.approval_status <> 'N')     
  --AND MONTH(empl_dtr_dtl_tbl.dtr_date) = CONVERT(INT,@p_dtr_month)    
  --AND YEAR(empl_dtr_dtl_tbl.dtr_date)  = CONVERT(INT,@p_dtr_year)    
  ----END SA DAAN NGA DELETE 2022-05-05  
  
   DELETE FROM empl_dtr_dtl_tbl   
 WHERE empl_dtr_dtl_tbl.empl_id IN (  
              SELECT empl_id FROM empl_dtr_hdr_tmp_10 A1     
              WHERE A1.empl_id = empl_dtr_dtl_tbl.empl_id    
     AND   A1.dtr_user_id = @p_user_id1    
     AND CONVERT(INT,A1.dtr_month) = CONVERT(INT,@p_dtr_month1)    
     AND CONVERT(INT,A1.dtr_year) = CONVERT(INT,@p_dtr_year1)    
    )  
  AND MONTH(empl_dtr_dtl_tbl.dtr_date) = CONVERT(INT,@p_dtr_month1)    
  AND YEAR(empl_dtr_dtl_tbl.dtr_date)  = CONVERT(INT,@p_dtr_year1)  
      
  INSERT INTO empl_dtr_hdr_tbl    
  SELECT     
   dtr_order_no        
   ,dtr_year         
   ,dtr_month         
   ,department_code       
   ,approval_status       
   ,approval_id        
   ,approved_date        
   ,remarks         
   ,empl_id         
   ,created_ddtm        
   ,created_by         
   ,updated_ddtm        
   ,updated_by         
   ,frst_qcna_posted_ddtm      
   ,frst_qcna_posted_by      
   ,sec_qcna_posted_ddtm      
   ,sec_qcna_posted_by       
   ,post_status        
   FROM empl_dtr_hdr_tmp_10 A    
  WHERE dtr_user_id = @p_user_id1    
  --AND     
  --NOT EXISTS (SELECT 'X' FROM empl_dtr_hdr_tbl A1    
  --    WHERE A1.empl_id = A.empl_id    
  --    AND A1.dtr_month = A.dtr_month    
  --    AND A1.dtr_year  = A.dtr_year    
  --    AND A1.approval_status <> 'N')    
    
  INSERT INTO empl_dtr_dtl_tbl    
  SELECT     
    dtr_order_no       
   ,empl_id        
   ,dtr_date        
   ,time_in_am        
   ,time_out_am       
   ,time_in_pm        
   ,time_out_pm       
   ,ts_code        
   ,under_Time        
   ,under_Time_remarks      
   ,remarks_details      
   ,time_ot_hris       
   ,time_days_equi       
   ,time_hours_equi      
   ,time_ot_payable      
   ,approval_status      
   ,no_of_as        
   ,no_of_ob        
   ,no_of_lv        
  FROM empl_dtr_dtl_tmp_10 A    
  WHERE A.dtr_user_id = @p_user_id1   
  --AND    
  --NOT EXISTS (SELECT 'X' FROM empl_dtr_hdr_tbl A1    
  --    WHERE A1.empl_id = A.empl_id    
  --    AND CONVERT(INT,A1.dtr_month) = MONTH(A.dtr_date)    
  --    AND CONVERT(INT,A1.dtr_year)  = YEAR(A.dtr_date)    
  --    AND A1.approval_status <> 'N')    
      
      
  --DROP TABLE @p_hdr_tbl    
   --ROLLBACK TRAN    
    COMMIT TRAN      
   SELECT 'Y' AS result_flag, 'DTR Process Successfully Run '     AS result_msg    
  END    
  END TRY    
  BEGIN CATCH    
  ROLLBACK TRAN     
   --SELECT 'N' AS result_flag, 'DTR Process Run with Error'   AS result_msg     
   SELECT 'N' AS result_flag, CONVERT(VARCHAR(500), ERROR_MESSAGE()) AS result_msg         
      
  END CATCH    
 END