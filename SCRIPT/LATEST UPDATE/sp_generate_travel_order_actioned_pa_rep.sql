-- EXEC sp_generate_travel_order_daily_pa_rep '','','','','U8672'
-- select * from travelOrder_pa_checklist_tbl
-- DELETE from travelOrder_pa_checklist_tbl


CREATE PROCEDURE sp_generate_travel_order_actioned_pa_rep                                      
 @par_period_from  VARCHAR(30),                                        
 @par_period_to   VARCHAR(30),                                         
 @par_dept_code   VARCHAR(02),                                      
 @par_type    VARCHAR(02),                                      
 @par_user_id   VARCHAR(30)                                      
 WITH RECOMPILE                                      
                                      
AS              
              

 DECLARE @Rows int                                  
 DECLARE @v_dtr_year VARCHAR(04)                                      
 DECLARE @v_dtr_month VARCHAR(02)                    
 DECLARE @v_day   VARCHAR(02)                             
                              
 DECLARE @v_pa_access  INT                           
 DECLARE @v_pa_readonly  BIT                          
 DECLARE @v_pa_writeonly BIT                          
                           
 SET @v_pa_access    = 0                          
 SET @v_pa_readonly  = 0                          
 SET @v_pa_writeonly = 0                          
 SET @Rows = 0                        
                               
                                      
 --SET @v_dtr_year  = CONVERT(VARCHAR(04),YEAR(@par_period_to))                                      
 --SET @v_dtr_month = CONVERT(VARCHAR(02),IIF(MONTH(@par_period_to) >= 10,CONVERT(VARCHAR(02),MONTH(@par_period_to)),'0' + CONVERT(VARCHAR(02),MONTH(@par_period_to))))  

 
 
 SET @v_dtr_year  = CONVERT(VARCHAR(04),YEAR(GETDATE()))                                      
 SET @v_dtr_month = CONVERT(VARCHAR(04),MONTH(GETDATE()))  
 SET @v_day       = CONVERT(VARCHAR(02),DATEPART(DAY,GETDATE()))                                       
                                              
DECLARE @v_report_header VARCHAR(500)                                      
SET @v_report_header = ''                                      
 IF       @par_type  = '01'                                      
  SET @v_report_header = 'APPROVED TRAVEL ORDER REPORT'                                       
 ELSE IF @par_type  = '02'                                      
  SET @v_report_header = 'TRAVEL ORDER WITH CLAIMS REPORT'                                       
 ELSE IF @par_type  = '03'                                      
  SET @v_report_header = 'TRAVEL ORDER WITHOUT CLAIMS REPORT'                                       
                                  
DECLARE @v_curr_date   DATETIME                                      
DECLARE @v_period_from_print DATETIME                                      
DECLARE @v_period_to_print  DATETIME                                      
                                
                                       
SET @v_period_from_print = CONVERT(DATETIME, '2022-08-15')  +CAST('17:00' AS DATETIME)                                      
SET @v_period_to_print  = GETDATE()                                      
                                     
                             
                             
DECLARE @par_period_from_covered_sp DATE                                      
DECLARE @par_period_to_covered_sp DATE                                      
 
 
           
            
   IF ISNULL(@par_period_from,'') <> ''            
   BEGIN             
        SET @par_period_from_covered_sp = CONVERT(DATE,@par_period_from)              
   END            
   ELSE            
   BEGIN            
        SET @par_period_from_covered_sp = '2023-01-01'                
   END            
            
   IF ISNULL(@par_period_to,'') <> ''            
   BEGIN             
        SET @par_period_to_covered_sp = CONVERT(DATE,@par_period_to)               
   END            
   ELSE            
   BEGIN            
        SET @par_period_to_covered_sp   = CONVERT(DATE,EOMONTH(@v_dtr_year +'-'+@v_dtr_month + '-' + @v_day))                 
   END            
        
   
   
	          
                 
              
 BEGIN TRY                                                             
    
  INSERT INTO travelOrder_pa_checklist_tbl           
  SELECT                                       
   MN.*,
       CONVERT(DATE,B.approved_dttm)   AS check_approved_dttm
	  ,ISNULL(CASE 
	   WHEN ISNULL(A.approval_status,'') = '1'                                        
	   THEN A.level1_approval_date                  
	   WHEN ISNULL(A.approval_status,'') = '2'                                       
	    THEN A.level2_approval_date                                          
	   ELSE ''                                               
	  END,'') AS lvl1n2_approved_dttm        
	  ,CASE WHEN ISNULL(B.travel_order_no,'') = ''  --NO ACTION YET                                        
	   THEN 'N'                    
	   WHEN ISNULL(B.travel_order_no,'') <> ''                                        
		AND ISNULL(B.approved_status,0) = 0 --WITH ACTION DISAPPROVED --WITH ACTION DISAPPROVED                                        
	   THEN 'D'                                        
		ELSE 'Y'          --WITH ACTION APPROVED                                        
	  END AS approved_status                            
	 ,GETDATE()    AS created_dttm 
	 ,@par_user_id AS created_user_by  
	 ,''    AS updated_dttm 
	 ,''    AS updated_user_by                    
  FROM (               
 SELECT                                                           
    --UNION FOR LEVEL 1 APPROVED BY HEAD WITH CLAIMS                                        
    A.travel_order_no                                                    
   ,D.empl_id                                        
   ,D1.employee_name                                        
   ,IIF(ISNULL(K12.position_title1,'') = '',K12.position_long_title,IIF(K12.csc_level = 2,IIF(ISNULL(K12.position_title2,'') = '',K12.position_title1,K12.position_title2),K12.position_title1))                                        
    AS position_title1                
   ,C.department_name1                                        
   ,C.department_short_name +' '+ISNULL(IIF(Q.assignment_short_descr = '','','('+Q.assignment_short_descr+')') ,'') AS department_short_name                                        
   ,dbo.func_get_date_applied_travel_order(A.travel_order_no)         AS dtr_date                                        
   ,UPPER(A.travel_place_visit) AS travel_place_visit                                        
   ,UPPER(A.travel_purpose)  AS travel_purpose                                        
   ,A.travel_requestor_empl_id                                        
   ,E1.employee_name    AS travel_requestor_empl_name                                        
   ,A.travel_type_code                                        
   ,F.travel_type_descr           
   ,travel_with_claims                                        
   ,UPPER(ISNULL(late_justification,'')) AS travel_justification                                        
   ,@v_report_header AS report_header_descr                                        
   ,A.approval_status                                        
   ,A.department_code                                
   ,A.approval_id                                        
   ,DATENAME(month, A.travel_datefiled_original)+' '+ CONVERT(VARCHAR(50), DAY(A.travel_datefiled_original)) +','+ CONVERT(VARCHAR(50), YEAR(A.travel_datefiled_original))                                         
       AS travel_datefiled_original         
                                                                        
   FROM travelorder_hdr_tbl A                 
   INNER JOIN vw_approvalstatus_tbl B                                                              
   ON B.approval_status = A.approval_status                                         
   INNER JOIN HRIS_PAY.dbo.vw_departments_tbl_list C                                        
   ON C.department_code = A.department_code                                                          
   INNER JOIN travelorder_empl_dtl_tbl D                                                            
   ON D.travel_order_no = A.travel_order_no                                       
   INNER JOIN vw_personnelnames_tbl_HRIS_ATS D1                                                              
   ON D1.empl_id = D.empl_id                                                             
   INNER JOIN travelorder_dates_dtl_tbl E                                                            
   ON E.travel_order_no = A.travel_order_no                                            
   INNER JOIN traveltype_tbl F                                                            
   ON F.travel_type_code = A.travel_type_code                                                             
   INNER JOIN HRIS_PAY.dbo.vw_approvalworkflow_tbl G                                                
   ON G.approval_id = A.approval_id                                        
  INNER JOIN vw_personnelnames_tbl_HRIS_ATS E1                                                             
  ON E1.empl_id = A.travel_requestor_empl_id                                                
  LEFT JOIN HRIS_PAY.dbo.vw_payrollemployeemaster_asg_tbl Z                                          
  ON Z.empl_id = D.empl_id                                          
  INNER JOIN HRIS_PAY.dbo.departments_tbl J                                          
  ON J.department_code = ISNULL(Z.department_code,A.department_code)                                          
  LEFT JOIN travelordertype_empl_dtl_tbl H                                                
  ON H.travel_order_no = A.travel_order_no                                                   
  LEFT JOIN traveltype_tbl H1                                                
  ON H1.travel_type_code = H.travel_type_code                                           
  LEFT JOIN HRIS_PAY.dbo.payrollemployeemaster_pos_tbl K1                                          
  ON K1.empl_id = D.empl_id                                          
  AND K1.effective_date = (SELECT MAX(D1.effective_date)                 
       FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl D1                                          
       WHERE D1.empl_id = D.empl_id                                          
       AND D1.effective_date <= GETDATE())                                       
            
  LEFT JOIN HRIS_PAY.dbo.positions_tbl K12                                          
  ON K12.position_code = K1.position_code                                          
                                        
  LEFT JOIN HRIS_PAY.dbo.vw_national_assignment Q                                        
   ON Q.empl_id = D.empl_id                                         
   INNER JOIN travel_order_check_tbl X1        
   ON X1.travel_order_no = D.travel_order_no      
   AND X1.empl_id =  D.empl_id            
                                        
   WHERE (E.travel_date BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp)                                        
    OR E.travel_date_to BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp))                                        
   AND                                         
   A.department_code NOT IN ('18','19')                                        
   AND IIF(ISNULL(@par_dept_code,'') = '',A.department_code,@par_dept_code) = A.department_code                                        
   AND A.approval_status IN ('1')                                       
   AND A.department_code NOT IN ('11','12','21','22','23','24','20')                                          
   AND A.travel_order_no NOT IN (SELECT DISTINCT A12.travel_order_no                 
         FROM HRIS_ATS.dbo.travelorder_empl_dtl_tbl A12                                        
         INNER JOIN HRIS_ATS.dbo.travelorder_hdr_tbl B                                        
         ON B.travel_order_no = A12.travel_order_no                                         
         WHERE empl_id IN (SELECT empl_id FROM HRIS_PAY.dbo.departments_tbl A1)                                        
         AND A12.rcrd_status IN ('1'))                                        
   AND ISNULL(A.to_emergency,0) = 0               
         
      
    UNION  
      
     SELECT                                                           
    --UNION FOR LEVEL 1 APPROVED BY HEAD WITH CLAIMS                                        
    A.travel_order_no                                                    
   ,D.empl_id                                        
   ,D1.employee_name                                        
   ,IIF(ISNULL(K12.position_title1,'') = '',K12.position_long_title,IIF(K12.csc_level = 2,IIF(ISNULL(K12.position_title2,'') = '',K12.position_title1,K12.position_title2),K12.position_title1))                                        
    AS position_title1                
   ,C.department_name1                                        
   ,C.department_short_name +' '+ISNULL(IIF(Q.assignment_short_descr = '','','('+Q.assignment_short_descr+')') ,'') AS department_short_name                                        
   ,dbo.func_get_date_applied_travel_order(A.travel_order_no)         AS dtr_date                                        
   ,UPPER(A.travel_place_visit) AS travel_place_visit                                        
   ,UPPER(A.travel_purpose)  AS travel_purpose                                        
   ,A.travel_requestor_empl_id                                        
   ,E1.employee_name    AS travel_requestor_empl_name                                        
   ,A.travel_type_code                                        
   ,F.travel_type_descr           
   ,travel_with_claims                                        
   ,UPPER(ISNULL(late_justification,'')) AS travel_justification                                        
   ,@v_report_header AS report_header_descr                                        
   ,A.approval_status                                        
   ,A.department_code                                
   ,A.approval_id                                        
   ,DATENAME(month, A.travel_datefiled_original)+' '+ CONVERT(VARCHAR(50), DAY(A.travel_datefiled_original)) +','+ CONVERT(VARCHAR(50), YEAR(A.travel_datefiled_original))                                         
       AS travel_datefiled_original         
                                                                         
   FROM travelorder_hdr_tbl A                 
   INNER JOIN vw_approvalstatus_tbl B                                                              
   ON B.approval_status = A.approval_status                                         
   INNER JOIN HRIS_PAY.dbo.vw_departments_tbl_list C                                        
   ON C.department_code = A.department_code                                                          
   INNER JOIN travelorder_empl_dtl_tbl D                                                            
   ON D.travel_order_no = A.travel_order_no                                       
   INNER JOIN vw_personnelnames_tbl_HRIS_ATS D1                                                              
   ON D1.empl_id = D.empl_id                                                             
   INNER JOIN travelorder_dates_dtl_tbl E                                                            
   ON E.travel_order_no = A.travel_order_no                                            
   INNER JOIN traveltype_tbl F                                                            
   ON F.travel_type_code = A.travel_type_code                                                             
   INNER JOIN HRIS_PAY.dbo.vw_approvalworkflow_tbl G                                                
   ON G.approval_id = A.approval_id                                        
  INNER JOIN vw_personnelnames_tbl_HRIS_ATS E1                                                             
  ON E1.empl_id = A.travel_requestor_empl_id                                                
  LEFT JOIN HRIS_PAY.dbo.vw_payrollemployeemaster_asg_tbl Z                                          
  ON Z.empl_id = D.empl_id                                          
  INNER JOIN HRIS_PAY.dbo.departments_tbl J                                          
  ON J.department_code = ISNULL(Z.department_code,A.department_code)                                          
  LEFT JOIN travelordertype_empl_dtl_tbl H                                                
  ON H.travel_order_no = A.travel_order_no                                                   
  LEFT JOIN traveltype_tbl H1                                                
  ON H1.travel_type_code = H.travel_type_code                     
  LEFT JOIN HRIS_PAY.dbo.payrollemployeemaster_pos_tbl K1                                          
  ON K1.empl_id = D.empl_id                                          
  AND K1.effective_date = (SELECT MAX(D1.effective_date)                 
       FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl D1                                          
       WHERE D1.empl_id = D.empl_id                                          
       AND D1.effective_date <= GETDATE())                                       
            
  LEFT JOIN HRIS_PAY.dbo.positions_tbl K12                                          
  ON K12.position_code = K1.position_code                                          
                                        
  LEFT JOIN HRIS_PAY.dbo.vw_national_assignment Q                                        
   ON Q.empl_id = D.empl_id                                         
   INNER JOIN travel_order_check_tbl X1        
   ON X1.travel_order_no = D.travel_order_no      
   AND X1.empl_id =  D.empl_id            
                                        
   WHERE (E.travel_date BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp)                                        
    OR E.travel_date_to BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp))                                        
   AND                                         
   A.department_code NOT IN ('18','19')                                        
   AND IIF(ISNULL(@par_dept_code,'') = '',A.department_code,@par_dept_code) = A.department_code                                        
   AND A.approval_status IN ('D')                                       
   AND A.department_code NOT IN ('11','12','21','22','23','24','20')                                          
   AND A.travel_order_no NOT IN (SELECT DISTINCT A12.travel_order_no                 
         FROM HRIS_ATS.dbo.travelorder_empl_dtl_tbl A12                                        
         INNER JOIN HRIS_ATS.dbo.travelorder_hdr_tbl B                                        
         ON B.travel_order_no = A12.travel_order_no                                         
         WHERE empl_id IN (SELECT empl_id FROM HRIS_PAY.dbo.departments_tbl A1)                                        
         AND A12.rcrd_status IN ('1'))                                        
   AND ISNULL(A.to_emergency,0) = 0              
           
                                    
   UNION                      
                                   
   --UNION FOR LEVEL 2 APPROVED WITH CLAIMS BY PHRMDO                 
                                        
   SELECT                                                           
   A.travel_order_no                                                  
   ,D.empl_id                                        
   ,D1.employee_name                                        
   ,IIF(ISNULL(K12.position_title1,'') = '',K12.position_long_title,IIF(K12.csc_level = 2,IIF(ISNULL(K12.position_title2,'') = '',K12.position_title1,K12.position_title2),K12.position_title1))                                        
   AS position_title1                                        
   ,C.department_name1                                        
   ,C.department_short_name +' '+ISNULL(IIF(Q.assignment_short_descr = '','','('+Q.assignment_short_descr+')') ,'') AS department_short_name                                        
   ,dbo.func_get_date_applied_travel_order(A.travel_order_no)         AS dtr_date                                        
   ,UPPER(A.travel_place_visit) AS travel_place_visit                                        
   ,UPPER(A.travel_purpose)  AS travel_purpose                                        
   ,A.travel_requestor_empl_id                                        
   ,E1.employee_name    AS travel_requestor_empl_name                                        
   ,A.travel_type_code                                        
   ,F.travel_type_descr                                        
   ,travel_with_claims                                        
   ,UPPER(ISNULL(late_justification,'')) AS travel_justification                                        
   ,@v_report_header AS report_header_descr                                        
   ,A.approval_status                                        
   ,A.department_code                         
   ,A.approval_id                                        
   ,DATENAME(month, A.travel_datefiled_original)+' '+ CONVERT(VARCHAR(50), DAY(A.travel_datefiled_original)) +','+ CONVERT(VARCHAR(50), YEAR(A.travel_datefiled_original))                                         
    AS travel_datefiled_original         
                                        
    FROM travelorder_hdr_tbl A                                                               
    INNER JOIN vw_approvalstatus_tbl B                                                              
    ON B.approval_status = A.approval_status                                         
    INNER JOIN HRIS_PAY.dbo.vw_departments_tbl_list C                                        
    ON C.department_code = A.department_code                                                          
    INNER JOIN travelorder_empl_dtl_tbl D                                                            
     ON D.travel_order_no = A.travel_order_no                                                            
    INNER JOIN vw_personnelnames_tbl_HRIS_ATS D1                                                              
     ON D1.empl_id = D.empl_id                                                             
    INNER JOIN travelorder_dates_dtl_tbl E                                                            
    ON E.travel_order_no = A.travel_order_no                                                      
    INNER JOIN traveltype_tbl F                                                            
    ON F.travel_type_code = A.travel_type_code                                                             
    INNER JOIN HRIS_PAY.dbo.vw_approvalworkflow_tbl G                                                
    ON G.approval_id = A.approval_id                                        
   INNER JOIN vw_personnelnames_tbl_HRIS_ATS E1                                                             
    ON E1.empl_id = A.travel_requestor_empl_id                                                
    LEFT JOIN HRIS_PAY.dbo.vw_payrollemployeemaster_asg_tbl Z                    
    ON Z.empl_id = D.empl_id                                                       
    INNER JOIN HRIS_PAY.dbo.departments_tbl J                                          
    ON J.department_code = ISNULL(Z.department_code,A.department_code)                                          
    LEFT JOIN travelordertype_empl_dtl_tbl H                                                
    ON H.travel_order_no = A.travel_order_no                                                   
    LEFT JOIN traveltype_tbl H1                                                
    ON H1.travel_type_code = H.travel_type_code                                   LEFT JOIN HRIS_PAY.dbo.payrollemployeemaster_pos_tbl K1                                          
   ON K1.empl_id = D.empl_id                                          
   AND K1.effective_date = (SELECT MAX(D1.effective_date) FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl D1                                                    WHERE D1.empl_id = D.empl_id                             
            AND D1.effective_date <= GETDATE())                                          
                                          
   LEFT JOIN HRIS_PAY.dbo.positions_tbl K12                                          
   ON K12.position_code = K1.position_code                                          
                                         
   LEFT JOIN HRIS_PAY.dbo.vw_national_assignment Q                                        
   ON Q.empl_id = D.empl_id          
   INNER JOIN travel_order_check_tbl X1        
   ON X1.travel_order_no = D.travel_order_no      
   AND X1.empl_id =  D.empl_id             
                                            
   WHERE (E.travel_date BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp)                                        
    OR E.travel_date_to BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp))                                        
    AND                                        
   A.department_code NOT IN ('18','19')                                        
   AND IIF(ISNULL(@par_dept_code,'') = '',A.department_code,@par_dept_code) = A.department_code                                        
   AND A.approval_status IN ('2')                                        
   AND A.department_code IN ('11','12','21','22','23','24','20')                                        
   AND ISNULL(A.to_emergency,0) = 0     
     
   UNION  
                                         
   SELECT                                                           
   A.travel_order_no                                                  
   ,D.empl_id                                        
   ,D1.employee_name                                        
   ,IIF(ISNULL(K12.position_title1,'') = '',K12.position_long_title,IIF(K12.csc_level = 2,IIF(ISNULL(K12.position_title2,'') = '',K12.position_title1,K12.position_title2),K12.position_title1))                                        
   AS position_title1                                        
   ,C.department_name1                                        
   ,C.department_short_name +' '+ISNULL(IIF(Q.assignment_short_descr = '','','('+Q.assignment_short_descr+')') ,'') AS department_short_name                                        
   ,dbo.func_get_date_applied_travel_order(A.travel_order_no)         AS dtr_date                                        
   ,UPPER(A.travel_place_visit) AS travel_place_visit                                        
   ,UPPER(A.travel_purpose)  AS travel_purpose                                        
   ,A.travel_requestor_empl_id                                        
   ,E1.employee_name    AS travel_requestor_empl_name                                        
   ,A.travel_type_code                                        
   ,F.travel_type_descr                                        
   ,travel_with_claims                                        
   ,UPPER(ISNULL(late_justification,'')) AS travel_justification                                        
   ,@v_report_header AS report_header_descr                                        
   ,A.approval_status                                        
   ,A.department_code                         
   ,A.approval_id                                        
   ,DATENAME(month, A.travel_datefiled_original)+' '+ CONVERT(VARCHAR(50), DAY(A.travel_datefiled_original)) +','+ CONVERT(VARCHAR(50), YEAR(A.travel_datefiled_original))                                         
    AS travel_datefiled_original         
                                         
    FROM travelorder_hdr_tbl A                                                               
    INNER JOIN vw_approvalstatus_tbl B                                                              
    ON B.approval_status = A.approval_status                                         
    INNER JOIN HRIS_PAY.dbo.vw_departments_tbl_list C                                        
    ON C.department_code = A.department_code                                                          
    INNER JOIN travelorder_empl_dtl_tbl D                                                            
     ON D.travel_order_no = A.travel_order_no                                                            
    INNER JOIN vw_personnelnames_tbl_HRIS_ATS D1                                                              
     ON D1.empl_id = D.empl_id                                                             
    INNER JOIN travelorder_dates_dtl_tbl E                                                            
    ON E.travel_order_no = A.travel_order_no                                                      
    INNER JOIN traveltype_tbl F                                                            
    ON F.travel_type_code = A.travel_type_code                                                             
    INNER JOIN HRIS_PAY.dbo.vw_approvalworkflow_tbl G                                                
    ON G.approval_id = A.approval_id                                        
   INNER JOIN vw_personnelnames_tbl_HRIS_ATS E1                                                             
    ON E1.empl_id = A.travel_requestor_empl_id                                                
    LEFT JOIN HRIS_PAY.dbo.vw_payrollemployeemaster_asg_tbl Z                    
    ON Z.empl_id = D.empl_id                                                       
    INNER JOIN HRIS_PAY.dbo.departments_tbl J                                          
    ON J.department_code = ISNULL(Z.department_code,A.department_code)                                          
    LEFT JOIN travelordertype_empl_dtl_tbl H                                                
    ON H.travel_order_no = A.travel_order_no                                                   
    LEFT JOIN traveltype_tbl H1                                                
    ON H1.travel_type_code = H.travel_type_code                                   LEFT JOIN HRIS_PAY.dbo.payrollemployeemaster_pos_tbl K1                                          
   ON K1.empl_id = D.empl_id                                          
   AND K1.effective_date = (SELECT MAX(D1.effective_date) FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl D1                                                    WHERE D1.empl_id = D.empl_id                                          
            AND D1.effective_date <= GETDATE())                                          
                                          
   LEFT JOIN HRIS_PAY.dbo.positions_tbl K12                                          
   ON K12.position_code = K1.position_code                                          
                                         
   LEFT JOIN HRIS_PAY.dbo.vw_national_assignment Q                                        
   ON Q.empl_id = D.empl_id          
   INNER JOIN travel_order_check_tbl X1        
   ON X1.travel_order_no = D.travel_order_no      
   AND X1.empl_id =  D.empl_id             
                                            
   WHERE (E.travel_date BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp)                                        
    OR E.travel_date_to BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp))                                        
    AND                                        
   A.department_code NOT IN ('18','19')                                        
  AND IIF(ISNULL(@par_dept_code,'') = '',A.department_code,@par_dept_code) = A.department_code                                        
   AND A.approval_status IN ('D')                                        
   AND A.department_code IN ('11','12','21','22','23','24','20')                                        
   AND ISNULL(A.to_emergency,0) = 0                                     
                                          
   UNION                                   
                                    
   --UNION FOR LEVEL 2 APPROVED BY MA'AM PA FOR DEPT HEADS TO                                        
                                        
   SELECT                                                           
    A.travel_order_no                                                    
   ,D.empl_id                                        
   ,D1.employee_name                                        
   ,IIF(ISNULL(K12.position_title1,'') = '',K12.position_long_title,IIF(K12.csc_level = 2,IIF(ISNULL(K12.position_title2,'') = '',K12.position_title1,K12.position_title2),K12.position_title1))                                        
   AS position_title1                                        
   ,C.department_name1                                        
   ,C.department_short_name +' '+ISNULL(IIF(Q.assignment_short_descr = '','','('+Q.assignment_short_descr+')') ,'') AS department_short_name                                        
   ,dbo.func_get_date_applied_travel_order(A.travel_order_no)         AS dtr_date                                        
   ,UPPER(A.travel_place_visit) AS travel_place_visit                                        
   ,UPPER(A.travel_purpose)  AS travel_purpose                                        
   ,A.travel_requestor_empl_id                                        
   ,E1.employee_name    AS travel_requestor_empl_name                                        
   ,A.travel_type_code                                        
   ,F.travel_type_descr                                        
   ,travel_with_claims                                        
   ,UPPER(ISNULL(late_justification,'')) AS travel_justification                                        
   ,@v_report_header AS report_header_descr                         ,A.approval_status                                        
   ,A.department_code                                        
   ,A.approval_id                                        
   ,DATENAME(month, A.travel_datefiled_original)+' '+ CONVERT(VARCHAR(50), DAY(A.travel_datefiled_original)) +','+ CONVERT(VARCHAR(50), YEAR(A.travel_datefiled_original))                                         
       AS travel_datefiled_original         
                                           
    FROM travelorder_hdr_tbl A                                                               
    INNER JOIN vw_approvalstatus_tbl B                                                              
    ON B.approval_status = A.approval_status                                         
    INNER JOIN HRIS_PAY.dbo.vw_departments_tbl_list C                                        
    ON C.department_code = A.department_code                                
    INNER JOIN travelorder_empl_dtl_tbl D                                        
     ON D.travel_order_no = A.travel_order_no                                                            
    INNER JOIN vw_personnelnames_tbl_HRIS_ATS D1                                                              
     ON D1.empl_id = D.empl_id                                                   
    INNER JOIN travelorder_dates_dtl_tbl E                                                            
    ON E.travel_order_no = A.travel_order_no                                                      
    INNER JOIN traveltype_tbl F                
    ON F.travel_type_code = A.travel_type_code                                                             
    INNER JOIN HRIS_PAY.dbo.vw_approvalworkflow_tbl G                                                
    ON G.approval_id = A.approval_id                                        
   INNER JOIN vw_personnelnames_tbl_HRIS_ATS E1                                       
    ON E1.empl_id = A.travel_requestor_empl_id                                                
    LEFT JOIN HRIS_PAY.dbo.vw_payrollemployeemaster_asg_tbl Z                                          
    ON Z.empl_id = D.empl_id                                                       
    INNER JOIN HRIS_PAY.dbo.departments_tbl J                                          
    ON J.department_code = ISNULL(Z.department_code,A.department_code)                                          
    LEFT JOIN travelordertype_empl_dtl_tbl H                                                
    ON H.travel_order_no = A.travel_order_no                                                   
    LEFT JOIN traveltype_tbl H1                                                
    ON H1.travel_type_code = H.travel_type_code                                           
    LEFT JOIN HRIS_PAY.dbo.payrollemployeemaster_pos_tbl K1                                          
   ON K1.empl_id = D.empl_id                                          
   AND K1.effective_date = (SELECT MAX(D1.effective_date)                 
      FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl D1                                          
      WHERE D1.empl_id = D.empl_id                                          
      AND D1.effective_date <= GETDATE())                                          
                                          
   LEFT JOIN HRIS_PAY.dbo.positions_tbl K12                                          
   ON K12.position_code = K1.position_code                                          
                                         
   LEFT JOIN HRIS_PAY.dbo.vw_national_assignment Q                                        
   ON Q.empl_id = D.empl_id                                           
   INNER JOIN travel_order_check_tbl X1        
   ON X1.travel_order_no = D.travel_order_no      
   AND X1.empl_id =  D.empl_id                                       
   WHERE  (E.travel_date BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp)                                        
    OR E.travel_date_to BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp))                                        
    AND                                        
   A.department_code NOT IN ('18','19')                                        
   AND IIF(ISNULL(@par_dept_code,'') = '',A.department_code,@par_dept_code) = A.department_code                                        
   AND A.approval_status IN ('2')                                        
   AND A.travel_order_no IN (SELECT DISTINCT A12.travel_order_no FROM HRIS_ATS.dbo.travelorder_empl_dtl_tbl A12                                        
       INNER JOIN HRIS_ATS.dbo.travelorder_hdr_tbl B                                        
       ON B.travel_order_no = A.travel_order_no                        
       WHERE empl_id IN (SELECT empl_id FROM HRIS_PAY.dbo.departments_tbl A1 )                                        
       AND A12.rcrd_status IN ('2','F'))                                        
   AND ISNULL(A.to_emergency,0) = 0     
     
    --UNION FOR LEVEL 2 APPROVED BY MA'AM PA FOR DEPT HEADS TO                                        
    UNION  
                                     
   SELECT                              
    A.travel_order_no                                                    
   ,D.empl_id                                        
   ,D1.employee_name                                        
   ,IIF(ISNULL(K12.position_title1,'') = '',K12.position_long_title,IIF(K12.csc_level = 2,IIF(ISNULL(K12.position_title2,'') = '',K12.position_title1,K12.position_title2),K12.position_title1))                                        
   AS position_title1                                        
   ,C.department_name1                                        
   ,C.department_short_name +' '+ISNULL(IIF(Q.assignment_short_descr = '','','('+Q.assignment_short_descr+')') ,'') AS department_short_name                                        
   ,dbo.func_get_date_applied_travel_order(A.travel_order_no)         AS dtr_date                                        
   ,UPPER(A.travel_place_visit) AS travel_place_visit                                        
   ,UPPER(A.travel_purpose)  AS travel_purpose                                        
   ,A.travel_requestor_empl_id                                        
   ,E1.employee_name    AS travel_requestor_empl_name                                        
   ,A.travel_type_code                                        
   ,F.travel_type_descr                                        
   ,travel_with_claims                                        
   ,UPPER(ISNULL(late_justification,'')) AS travel_justification                                        
   ,@v_report_header AS report_header_descr                         ,A.approval_status                                        
   ,A.department_code                                        
   ,A.approval_id                                        
   ,DATENAME(month, A.travel_datefiled_original)+' '+ CONVERT(VARCHAR(50), DAY(A.travel_datefiled_original)) +','+ CONVERT(VARCHAR(50), YEAR(A.travel_datefiled_original))                                         
       AS travel_datefiled_original         
                                           
    FROM travelorder_hdr_tbl A                                                               
    INNER JOIN vw_approvalstatus_tbl B                                                              
    ON B.approval_status = A.approval_status                                         
    INNER JOIN HRIS_PAY.dbo.vw_departments_tbl_list C                                        
    ON C.department_code = A.department_code                                
    INNER JOIN travelorder_empl_dtl_tbl D                                        
     ON D.travel_order_no = A.travel_order_no                                                            
    INNER JOIN vw_personnelnames_tbl_HRIS_ATS D1                                                              
     ON D1.empl_id = D.empl_id                                                   
    INNER JOIN travelorder_dates_dtl_tbl E                                                            
    ON E.travel_order_no = A.travel_order_no                                                      
    INNER JOIN traveltype_tbl F                
    ON F.travel_type_code = A.travel_type_code                                                             
    INNER JOIN HRIS_PAY.dbo.vw_approvalworkflow_tbl G                                                
    ON G.approval_id = A.approval_id                                        
   INNER JOIN vw_personnelnames_tbl_HRIS_ATS E1                                       
    ON E1.empl_id = A.travel_requestor_empl_id                                                
    LEFT JOIN HRIS_PAY.dbo.vw_payrollemployeemaster_asg_tbl Z                                          
    ON Z.empl_id = D.empl_id                                                       
    INNER JOIN HRIS_PAY.dbo.departments_tbl J                                          
    ON J.department_code = ISNULL(Z.department_code,A.department_code)                                          
    LEFT JOIN travelordertype_empl_dtl_tbl H                                                
    ON H.travel_order_no = A.travel_order_no                                                   
    LEFT JOIN traveltype_tbl H1                                                
    ON H1.travel_type_code = H.travel_type_code                                           
    LEFT JOIN HRIS_PAY.dbo.payrollemployeemaster_pos_tbl K1                                          
   ON K1.empl_id = D.empl_id                                          
   AND K1.effective_date = (SELECT MAX(D1.effective_date)                 
      FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl D1                                          
      WHERE D1.empl_id = D.empl_id                                          
      AND D1.effective_date <= GETDATE())                                          
                                          
   LEFT JOIN HRIS_PAY.dbo.positions_tbl K12                                          
   ON K12.position_code = K1.position_code                                          
                                         
   LEFT JOIN HRIS_PAY.dbo.vw_national_assignment Q                                        
   ON Q.empl_id = D.empl_id                                           
   INNER JOIN travel_order_check_tbl X1        
   ON X1.travel_order_no = D.travel_order_no      
   AND X1.empl_id =  D.empl_id                                       
   WHERE  (E.travel_date BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp)                                        
    OR E.travel_date_to BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp))                                        
    AND                                        
   A.department_code NOT IN ('18','19')                                        
   AND IIF(ISNULL(@par_dept_code,'') = '',A.department_code,@par_dept_code) = A.department_code                                        
   AND A.approval_status IN ('D')                                        
   AND A.travel_order_no IN (SELECT DISTINCT A12.travel_order_no FROM HRIS_ATS.dbo.travelorder_empl_dtl_tbl A12                                        
       INNER JOIN HRIS_ATS.dbo.travelorder_hdr_tbl B                                        
       ON B.travel_order_no = A.travel_order_no                        
       WHERE empl_id IN (SELECT empl_id FROM HRIS_PAY.dbo.departments_tbl A1 )                                        
        AND A12.rcrd_status IN ('2','D'))                                           
   AND ISNULL(A.to_emergency,0) = 0                                     
                                         
    )                                       
   AS MN                                      
   INNER JOIN  HRIS_PAY.dbo.approvalworkflow_tbl A                                     
   ON MN.approval_id = A.approval_id                                      
   --INNER JOIN HRIS_PAY.dbo.transactionsref_tbl B                                                                                  
   --ON A.transaction_code = B.transaction_code                  
   --AND A.transaction_code = '003'         
           
    LEFT JOIN travel_order_check_tbl B                          
    ON MN.travel_order_no = B.travel_order_no                   
    AND MN.empl_id = B.empl_id  
	--AND CONVERT(DATE,B.approved_dttm) BETWEEN @par_period_from_covered_sp AND @par_period_to_covered_sp                                         
 --   AND MN.travel_order_no NOT IN (SELECT travel_order_no FROM travel_order_check_tbl WHERE travel_order_no = MN.travel_order_no AND approved_status = 0)           
    WHERE                                       
       (CONVERT(DATETIME,A.level1_approval_date) BETWEEN CONVERT(DATETIME,@v_period_from_print) AND  CONVERT(DATETIME,@v_period_to_print)                                        
       OR CONVERT(DATETIME,A.level2_approval_date) BETWEEN CONVERT(DATETIME,@v_period_from_print) AND  CONVERT(DATETIME,@v_period_to_print))                                        
       AND ISNULL(B.approved_status,'') = ''                      
       AND MN.approval_status NOT IN ('F','D','L')                  
       AND ISNULL(B.travel_order_no,'') = '' 
       AND NOT EXISTS(SELECT 'X' FROM travelOrder_pa_checklist_tbl X 
       WHERE X.travel_order_no = MN.travel_order_no AND X.empl_id = MN.empl_id)     
   ORDER BY MN.travel_datefiled_original,MN.dtr_date 
  

   SELECT @Rows = @@ROWCOUNT



  SELECT CONVERT(VARCHAR(05),@Rows)+' items successfully generated!' as query_msg, 1 as success_status
                                       
  END TRY
  BEGIN CATCH
        SELECT ERROR_MESSAGE() as query_msg, 0 as success_status
  END CATCH                
                                      
    