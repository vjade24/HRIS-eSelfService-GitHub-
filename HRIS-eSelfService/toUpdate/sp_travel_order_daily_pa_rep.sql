 --DECLARE @par_period_from    DATE   = '2022-10-01'          
 --DECLARE @par_period_to  DATE  = '2022-10-07'          
 --DECLARE @par_dept_code  VARCHAR(02)= ''           
 --DECLARE @par_type   VARCHAR(02) = '02'          
 --DECLARE @par_user_id  VARCHAR(30) = 'U10058'           
 --DECLARE @par_start_time  VARCHAR(10)  =''          
 --DECLARE @par_end_time  VARCHAR(10)  =''          
          
 --EXEC sp_travel_order_daily_pa_rep '2022-09-01','2022-11-04','','','U8672','',''          
          
ALTER PROCEDURE sp_travel_order_daily_pa_rep            
 @par_period_from    DATE,            
 @par_period_to  DATE,            
 @par_dept_code  VARCHAR(02),            
 @par_type   VARCHAR(02),            
 @par_user_id  VARCHAR(30),            
 @par_start_time  VARCHAR(10),            
 @par_end_time  VARCHAR(10)            
            
 WITH RECOMPILE            
            
AS            
	DECLARE @v_dtr_year  VARCHAR(04)            
	DECLARE @v_dtr_month VARCHAR(02)  
	   
	DECLARE @v_pa_access INT 
	DECLARE @v_pa_readonly BIT
	DECLARE @v_pa_writeonly BIT

	
	SET @v_pa_access    = 0
	SET @v_pa_readonly  = 0
	SET @v_pa_writeonly = 0

	SELECT 
	 @v_pa_readonly = read_auth
	,@v_pa_writeonly = write_auth
	,@v_pa_access = access_type
	FROM to_final_approver_tbl 
	where user_id  =  @par_user_id
	and access_type = 2        
            
 SET @v_dtr_year  = CONVERT(VARCHAR(04),YEAR(@par_period_to))            
 SET @v_dtr_month = CONVERT(VARCHAR(02),IIF(MONTH(@par_period_to) >= 10,CONVERT(VARCHAR(02),MONTH(@par_period_to)),'0' + CONVERT(VARCHAR(02),MONTH(@par_period_to))))            
            
 --DECLARE @v_ddo_logo    VARBINARY(max)            
             
 --SELECT @v_ddo_logo =  A.org_logo FROM                                                                                          
 --HRIS_PAY.dbo.organizations_tbl A               
 --WHERE A.effective_date = (SELECT MAX(A1.effective_date) FROM  HRIS_PAY.dbo.organizations_tbl A1            
 --     WHERE A1.effective_date <= GETDATE())            
DECLARE @v_report_header VARCHAR(500)            
SET @v_report_header = ''            
 IF @par_type = '01'            
  SET @v_report_header = 'APPROVED TRAVEL ORDER REPORT'             
 ELSE IF @par_type = '02'            
  SET @v_report_header = 'TRAVEL ORDER WITH CLAIMS REPORT'             
 ELSE IF @par_type = '03'            
  SET @v_report_header = 'TRAVEL ORDER WITHOUT CLAIMS REPORT'             
--EXEC sp_travel_order_daily_rep '2022-06-01','2022-06-30','26','02'            
            
--DECLARE @date DATETIME, @time time            
--SET @date='2010-10-01'            
--SET @time='15:00:00'            
--SET @date=@date+CAST(@time AS DATETIME)            
--SELECT @date AS DATETIME            
            
DECLARE @v_curr_date DATETIME            
DECLARE @v_period_from_print DATETIME            
DECLARE @v_period_to_print  DATETIME            
            
            
            
DECLARE @v_temp_to_tbl AS TABLE            
(            
row_nbr       INT             
,travel_order_no    VARCHAR(15)             
--,org_logo      VARBINARY(max)            
,empl_id      VARCHAR(08)             
,employee_name     VARCHAR(500)            
,position_title1    VARCHAR(500)            
,department_name1    VARCHAR(500)            
,department_short_name   VARCHAR(500)            
,dtr_date      VARCHAR(MAX)            
,travel_place_visit    VARCHAR(MAX)            
,travel_purpose     VARCHAR(MAX)            
,travel_requestor_empl_id  VARCHAR(08)            
,travel_requestor_empl_name  VARCHAR(500)            
,travel_type_code    VARCHAR(02)            
,travel_type_descr    VARCHAR(50)            
,travel_with_claims    BIT            
,travel_justification   VARCHAR(MAX)            
,report_header_descr   VARCHAR(500)            
,approval_status    VARCHAR(02)            
,department_code    VARCHAR(02)            
,approval_id     VARCHAR(50)            
,travel_datefiled_original  VARCHAR(50)            
)            
            
            
            
            
            
SET @v_period_from_print = CONVERT(DATETIME, '2022-08-15')  +CAST('17:00' AS DATETIME)            
SET @v_period_to_print  = GETDATE()            
            
        
            
DECLARE @par_period_from_covered_sp DATE            
DECLARE @par_period_to_covered_sp DATE            
            
--SET @par_period_from_covered_sp = CONVERT(DATE,@v_dtr_year +'-'+ @v_dtr_month + '-01')       
SET @par_period_from_covered_sp = '2022-09-01'          
--SET @par_period_to_covered_sp   = CONVERT(DATE,EOMONTH(@v_dtr_year +'-'+@v_dtr_month + '-01'))      
SET @par_period_to_covered_sp   =  '2022-12-31'            
            
 --select @par_period_from_covered_sp,@par_period_to_covered_sp           
--SET @par_period_to = EOMONTH(CONVERT(DATE,@par_period_to))            
--SELECT @v_period_from_print,@v_period_to_print            
--IF (CONVERT(TIME,@v_curr_date) BETWEEN CONVERT(TIME,'08:00') AND CONVERT(TIME,'10:00'))            
-- BEGIN            
             
--  --SET @v_period_from_print = @v_curr_date + CAST('08:00' AS DATETIME)            
--  SET @v_period_to_print   = @v_curr_date + CAST('10:00' AS DATETIME)            
-- END            
          
            
--ELSE IF (CONVERT(TIME,@v_curr_date) BETWEEN CONVERT(TIME,'10:00') AND CONVERT(TIME,'12:00'))            
-- BEGIN            
--  --SET @v_period_from_print = @v_curr_date + CAST('10:00' AS DATETIME)            
--  SET @v_period_to_print   = @v_curr_date + CAST('12:00' AS DATETIME)            
-- END            
            
--ELSE IF (CONVERT(TIME,@v_curr_date) BETWEEN CONVERT(TIME,'12:00') AND CONVERT(TIME,'14:00'))            
-- BEGIN            
--  --SET @v_period_from_print = @v_curr_date + CAST('12:00' AS DATETIME)            
--  SET @v_period_to_print   = @v_curr_date + CAST('14:00' AS DATETIME)            
-- END            
            
--ELSE IF (CONVERT(TIME,@v_curr_date) BETWEEN CONVERT(TIME,'14:00') AND CONVERT(TIME,'16:00'))            
-- BEGIN            
--  --SET @v_period_from_print = @v_curr_date + CAST('14:00' AS DATETIME)            
--  SET @v_period_to_print   = @v_curr_date + CAST('16:00' AS DATETIME)            
-- END            
            
--ELSE IF (CONVERT(TIME,@v_curr_date) BETWEEN CONVERT(TIME,'16:00') AND CONVERT(TIME,'18:00'))            
-- BEGIN            
--  --SET @v_period_from_print = @v_curr_date + CAST('16:00' AS DATETIME)            
--  SET @v_period_to_print   = @v_curr_date + CAST('18:00' AS DATETIME)            
-- END            
--SET @par_period_from = @v_dtr_year + '-' + @v_dtr_month + '-01'            
            
DECLARE @v_tmp_source_tbl AS TABLE            
(            
dtr_date   DATE            
,dtr_year   VARCHAR(04)            
,dtr_month   VARCHAR(02)            
,empl_id   VARCHAR(10)            
,to_time_in_am  VARCHAR(05)            
,to_time_out_am  VARCHAR(05)            
,to_time_in_pm  VARCHAR(05)            
,to_time_out_pm  VARCHAR(05)            
,to_remarks   VARCHAR(100)            
,travel_order_no VARCHAR(15)            
)            
            
            
--INSERT INTO @v_tmp_source_tbl            
--SELECT * FROM func_to_info_date_daily_rep(@v_dtr_year,@v_dtr_month,'')            
            
            
--IF @par_type = '01'            
-- BEGIN            
-- INSERT INTO @v_temp_to_tbl            
-- SELECT MN.* FROM (            
--  SELECT             
--    ROW_NUMBER() OVER(ORDER BY A.travel_datefiled_original,A.department_code,D1.employee_name,E.travel_date) AS row_nbr             
                             
--   ,A.travel_order_no            
--   --,@v_ddo_logo AS org_logo               
--   ,D.empl_id            
--   ,D1.employee_name            
--   ,IIF(ISNULL(K12.position_title1,'') = '',K12.position_long_title,IIF(K12.csc_level = 2,IIF(ISNULL(K12.position_title2,'') = '',K12.position_title1,K12.position_title2),K12.position_title1))            
--   AS position_title1            
--   ,C.department_name1            
--   ,C.department_short_name +' '+ISNULL(IIF(Q.assignment_short_descr = '','','('+Q.assignment_short_descr+')') ,'') AS department_short_name            
--   ,dbo.func_get_date_applied_travel_order(A.travel_order_no)         AS dtr_date            
--   ,UPPER(A.travel_place_visit) AS travel_place_visit            
--   ,UPPER(A.travel_purpose)  AS travel_purpose            
--   ,A.travel_requestor_empl_id            
--   ,E1.employee_name    AS travel_requestor_empl_name            
--   ,A.travel_type_code            
--   ,F.travel_type_descr            
--   ,travel_with_claims            
--   ,UPPER(travel_justification) AS travel_justification            
--   ,@v_report_header AS report_header_descr            
--   ,A.approval_status            
--   ,A.department_code            
--   ,A.approval_id            
--   ,DATENAME(month, A.travel_datefiled_original)+' '+ CONVERT(VARCHAR(50), DAY(A.travel_datefiled_original)) +','+ CONVERT(VARCHAR(50), YEAR(A.travel_datefiled_original))             
--       AS travel_datefiled_original            
--   FROM travelorder_hdr_tbl A                                   
--   INNER JOIN vw_approvalstatus_tbl B                                  
--   ON B.approval_status = A.approval_status             
-- INNER JOIN HRIS_PAY.dbo.vw_departments_tbl_list C            
--   ON C.department_code = A.department_code                              
--   INNER JOIN travelorder_empl_dtl_tbl D                                
--   ON D.travel_order_no = A.travel_order_no                                
--   INNER JOIN vw_personnelnames_tbl_HRIS_ATS D1                                  
--   ON D1.empl_id = D.empl_id                                 
--   INNER JOIN travelorder_dates_dtl_tbl E                                
--   ON E.travel_order_no = A.travel_order_no                          
--   INNER JOIN traveltype_tbl F                                
--   ON F.travel_type_code = A.travel_type_code                                 
--   INNER JOIN HRIS_PAY.dbo.vw_approvalworkflow_tbl G                    
--   ON G.approval_id = A.approval_id            
--  INNER JOIN vw_personnelnames_tbl_HRIS_ATS E1                                 
--  ON E1.empl_id = A.travel_requestor_empl_id                    
--  LEFT JOIN HRIS_PAY.dbo.vw_payrollemployeemaster_asg_tbl Z              
--  ON Z.empl_id = D.empl_id                           
--  INNER JOIN HRIS_PAY.dbo.departments_tbl J              
--  ON J.department_code = ISNULL(Z.department_code,A.department_code)              
--  LEFT JOIN travelordertype_empl_dtl_tbl H                    
--  ON H.travel_order_no = A.travel_order_no                       
--  LEFT JOIN traveltype_tbl H1                    
--  ON H1.travel_type_code = H.travel_type_code               
--  LEFT JOIN HRIS_PAY.dbo.payrollemployeemaster_pos_tbl K1              
--  ON K1.empl_id = D.empl_id              
--  AND K1.effective_date = (SELECT MAX(D1.effective_date) FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl D1              
--            WHERE D1.empl_id = D.empl_id              
--            AND D1.effective_date <= GETDATE())              
              
--  LEFT JOIN HRIS_PAY.dbo.positions_tbl K12              
--  ON K12.position_code = K1.position_code              
            
--  LEFT JOIN HRIS_PAY.dbo.vw_national_assignment Q            
--   ON Q.empl_id = D.empl_id             
            
--   WHERE             
--   --YEAR(A.dtr_date) = 2022            
--   --AND MONTH(A.dtr_date) = 7            
--   --AND              
--   (E.travel_date BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp)            
--    OR E.travel_date_to BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp))            
--    AND             
--    A.department_code NOT IN ('18','19')            
--   AND IIF(ISNULL(@par_dept_code,'') = '',A.department_code,@par_dept_code) = A.department_code            
--   AND A.approval_status = 'F'            
               
--   )            
--   AS MN            
--   INNER JOIN  HRIS_PAY.dbo.approvalworkflow_tbl A                                                        
--   ON MN.approval_id = A.approval_id            
--   INNER JOIN HRIS_PAY.dbo.transactionsref_tbl B                                                        
--   ON A.transaction_code = B.transaction_code            
--   AND A.transaction_code = '003'             
--   ORDER BY MN.travel_datefiled_original,MN.department_code,MN.employee_name,MN.dtr_date            
-- END            
            
--ELSE IF @par_type = '02'            
-- BEGIN            
-- INSERT INTO @v_temp_to_tbl            
-- SELECT             
--  ROW_NUMBER() OVER(ORDER BY MN.travel_datefiled_original,MN.department_code,MN.employee_name,MN.dtr_date) AS row_nbr             
--  ,MN.*            
--  FROM (            
--  SELECT                               
--    --UNION FOR LEVEL 1 APPROVED BY HEAD WITH CLAIMS            
--   A.travel_order_no            
--   --,@v_ddo_logo AS org_logo               
--   ,D.empl_id            
--   ,D1.employee_name            
--   ,IIF(ISNULL(K12.position_title1,'') = '',K12.position_long_title,IIF(K12.csc_level = 2,IIF(ISNULL(K12.position_title2,'') = '',K12.position_title1,K12.position_title2),K12.position_title1))            
--   AS position_title1            
--   ,C.department_name1            
--   ,C.department_short_name +' '+ISNULL(IIF(Q.assignment_short_descr = '','','('+Q.assignment_short_descr+')') ,'') AS department_short_name         
--   ,dbo.func_get_date_applied_travel_order(A.travel_order_no)         AS dtr_date            
--   ,UPPER(A.travel_place_visit) AS travel_place_visit            
--   ,UPPER(A.travel_purpose)  AS travel_purpose            
--   ,A.travel_requestor_empl_id            
--   ,E1.employee_name    AS travel_requestor_empl_name            
--   ,A.travel_type_code            
--   ,F.travel_type_descr            
--   ,travel_with_claims            
--   ,UPPER(travel_justification) AS travel_justification            
--   ,@v_report_header AS report_header_descr            
--   ,A.approval_status            
--   ,A.department_code            
--   ,A.approval_id            
--   ,DATENAME(month, A.travel_datefiled_original)+' '+ CONVERT(VARCHAR(50), DAY(A.travel_datefiled_original)) +','+ CONVERT(VARCHAR(50), YEAR(A.travel_datefiled_original))             
--       AS travel_datefiled_original            
--   FROM travelorder_hdr_tbl A                                   
--   INNER JOIN vw_approvalstatus_tbl B                                  
--   ON B.approval_status = A.approval_status             
--   INNER JOIN HRIS_PAY.dbo.vw_departments_tbl_list C            
--   ON C.department_code = A.department_code                              
--   INNER JOIN travelorder_empl_dtl_tbl D                             
--   ON D.travel_order_no = A.travel_order_no                                
--   INNER JOIN vw_personnelnames_tbl_HRIS_ATS D1                                  
--   ON D1.empl_id = D.empl_id                                 
--   INNER JOIN travelorder_dates_dtl_tbl E                                
--   ON E.travel_order_no = A.travel_order_no                          
--   INNER JOIN traveltype_tbl F                                
--   ON F.travel_type_code = A.travel_type_code                                 
--   INNER JOIN HRIS_PAY.dbo.vw_approvalworkflow_tbl G                    
--   ON G.approval_id = A.approval_id            
--  INNER JOIN vw_personnelnames_tbl_HRIS_ATS E1                                 
--  ON E1.empl_id = A.travel_requestor_empl_id                    
--  LEFT JOIN HRIS_PAY.dbo.vw_payrollemployeemaster_asg_tbl Z              
--  ON Z.empl_id = D.empl_id                           
--  INNER JOIN HRIS_PAY.dbo.departments_tbl J              
--  ON J.department_code = ISNULL(Z.department_code,A.department_code)              
--  LEFT JOIN travelordertype_empl_dtl_tbl H                    
--  ON H.travel_order_no = A.travel_order_no                       
--  LEFT JOIN traveltype_tbl H1                    
--  ON H1.travel_type_code = H.travel_type_code               
--  LEFT JOIN HRIS_PAY.dbo.payrollemployeemaster_pos_tbl K1              
--  ON K1.empl_id = D.empl_id              
--  AND K1.effective_date = (SELECT MAX(D1.effective_date) FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl D1              
--            WHERE D1.empl_id = D.empl_id              
--        AND D1.effective_date <= GETDATE())              
              
--  LEFT JOIN HRIS_PAY.dbo.positions_tbl K12              
--  ON K12.position_code = K1.position_code              
            
--  LEFT JOIN HRIS_PAY.dbo.vw_national_assignment Q            
--   ON Q.empl_id = D.empl_id             
            
--   WHERE             
--   --YEAR(A.dtr_date) = 2022            
--   --AND MONTH(A.dtr_date) = 7            
--   --AND              
--   (E.travel_date BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp)            
--    OR E.travel_date_to BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp))            
--   --(A.dtr_date BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp))            
--   AND             
--   A.department_code NOT IN ('18','19')            
--   AND IIF(ISNULL(@par_dept_code,'') = '',A.department_code,@par_dept_code) = A.department_code            
--   AND A.approval_status IN ('1','F')            
--   --AND A.travel_with_claims = 1            
--   AND A.department_code NOT IN ('11','12','21','22','23','24','20')              
--   AND A.travel_order_no NOT IN (SELECT DISTINCT A12.travel_order_no FROM HRIS_ATS.dbo.travelorder_empl_dtl_tbl A12            
--           INNER JOIN HRIS_ATS.dbo.travelorder_hdr_tbl B            
--           ON B.travel_order_no = A12.travel_order_no            
--           --AND B.travel_with_claims = 1            
--       WHERE empl_id IN (            
--       SELECT empl_id FROM HRIS_PAY.dbo.departments_tbl A1            
--       --WHERE A1.department_code = @v_temp_dept            
--       )            
--       and A12.rcrd_status IN ('1','F'))              
--   AND ISNULL(A.to_emergency,0) = 0            
--   UNION            
--   --UNION FOR LEVEL 2 APPROVED WITH CLAIMS BY PHRMDO            
--   SELECT                               
--   A.travel_order_no            
--   --,@v_ddo_logo AS org_logo               
--   ,D.empl_id            
--   ,D1.employee_name            
--   ,IIF(ISNULL(K12.position_title1,'') = '',K12.position_long_title,IIF(K12.csc_level = 2,IIF(ISNULL(K12.position_title2,'') = '',K12.position_title1,K12.position_title2),K12.position_title1))            
--   AS position_title1            
--   ,C.department_name1            
--   ,C.department_short_name +' '+ISNULL(IIF(Q.assignment_short_descr = '','','('+Q.assignment_short_descr+')') ,'') AS department_short_name            
--   ,dbo.func_get_date_applied_travel_order(A.travel_order_no)         AS dtr_date            
--   ,UPPER(A.travel_place_visit) AS travel_place_visit            
--   ,UPPER(A.travel_purpose)  AS travel_purpose            
--   ,A.travel_requestor_empl_id            
--   ,E1.employee_name    AS travel_requestor_empl_name            
--   ,A.travel_type_code            
--   ,F.travel_type_descr            
--   ,travel_with_claims            
--   ,UPPER(travel_justification) AS travel_justification            
--   ,@v_report_header AS report_header_descr            
--   ,A.approval_status            
--   ,A.department_code            
--   ,A.approval_id            
--   ,DATENAME(month, A.travel_datefiled_original)+' '+ CONVERT(VARCHAR(50), DAY(A.travel_datefiled_original)) +','+ CONVERT(VARCHAR(50), YEAR(A.travel_datefiled_original))             
--       AS travel_datefiled_original            
--    FROM travelorder_hdr_tbl A                                   
--    INNER JOIN vw_approvalstatus_tbl B                                  
--    ON B.approval_status = A.approval_status             
--    INNER JOIN HRIS_PAY.dbo.vw_departments_tbl_list C            
--    ON C.department_code = A.department_code                              
--    INNER JOIN travelorder_empl_dtl_tbl D                                
--     ON D.travel_order_no = A.travel_order_no                                
--    INNER JOIN vw_personnelnames_tbl_HRIS_ATS D1                        
--     ON D1.empl_id = D.empl_id                                 
--    INNER JOIN travelorder_dates_dtl_tbl E                                
--    ON E.travel_order_no = A.travel_order_no                          
--    INNER JOIN traveltype_tbl F                                
--    ON F.travel_type_code = A.travel_type_code                                 
--    INNER JOIN HRIS_PAY.dbo.vw_approvalworkflow_tbl G                    
--    ON G.approval_id = A.approval_id            
--   INNER JOIN vw_personnelnames_tbl_HRIS_ATS E1                                 
--    ON E1.empl_id = A.travel_requestor_empl_id                    
--    LEFT JOIN HRIS_PAY.dbo.vw_payrollemployeemaster_asg_tbl Z              
--    ON Z.empl_id = D.empl_id                           
--    INNER JOIN HRIS_PAY.dbo.departments_tbl J              
--    ON J.department_code = ISNULL(Z.department_code,A.department_code)              
--    LEFT JOIN travelordertype_empl_dtl_tbl H                    
--    ON H.travel_order_no = A.travel_order_no                       
--    LEFT JOIN traveltype_tbl H1                    
--    ON H1.travel_type_code = H.travel_type_code               
--    LEFT JOIN HRIS_PAY.dbo.payrollemployeemaster_pos_tbl K1              
--   ON K1.empl_id = D.empl_id              
--   AND K1.effective_date = (SELECT MAX(D1.effective_date) FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl D1              
--            WHERE D1.empl_id = D.empl_id              
--            AND D1.effective_date <= GETDATE())              
              
-- LEFT JOIN HRIS_PAY.dbo.positions_tbl K12              
--   ON K12.position_code = K1.position_code              
             
--  LEFT JOIN HRIS_PAY.dbo.vw_national_assignment Q            
--   ON Q.empl_id = D.empl_id               
--   WHERE             
--   --YEAR(A.dtr_date) = 2022            
--   --AND MONTH(A.dtr_date) = 7            
--   --AND              
--   (E.travel_date BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp)            
--    OR E.travel_date_to BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp))            
--    AND            
--   A.department_code NOT IN ('18','19')            
--   AND IIF(ISNULL(@par_dept_code,'') = '',A.department_code,@par_dept_code) = A.department_code            
--   AND A.approval_status IN ('2','F')            
--   --AND A.travel_with_claims = 1            
--   AND A.department_code IN ('11','12','21','22','23','24','20')            
--   AND ISNULL(A.to_emergency,0) = 0            
--   UNION            
--   --UNION FOR LEVEL 2 APPROVED BY MA'AM PA FOR DEPT HEADS TO            
            
--   SELECT                               
--   A.travel_order_no            
--   --,@v_ddo_logo AS org_logo               
--   ,D.empl_id            
--   ,D1.employee_name            
--   ,IIF(ISNULL(K12.position_title1,'') = '',K12.position_long_title,IIF(K12.csc_level = 2,IIF(ISNULL(K12.position_title2,'') = '',K12.position_title1,K12.position_title2),K12.position_title1))            
--   AS position_title1            
--   ,C.department_name1            
--   ,C.department_short_name +' '+ISNULL(IIF(Q.assignment_short_descr = '','','('+Q.assignment_short_descr+')') ,'') AS department_short_name            
--   ,dbo.func_get_date_applied_travel_order(A.travel_order_no)         AS dtr_date            
--   ,UPPER(A.travel_place_visit) AS travel_place_visit            
--   ,UPPER(A.travel_purpose)  AS travel_purpose            
--   ,A.travel_requestor_empl_id            
--   ,E1.employee_name    AS travel_requestor_empl_name            
--   ,A.travel_type_code            
--   ,F.travel_type_descr            
--   ,travel_with_claims            
--   ,UPPER(travel_justification) AS travel_justification            
--   ,@v_report_header AS report_header_descr            
--   ,A.approval_status            
--   ,A.department_code            
--   ,A.approval_id      
--   ,DATENAME(month, A.travel_datefiled_original)+' '+ CONVERT(VARCHAR(50), DAY(A.travel_datefiled_original)) +','+ CONVERT(VARCHAR(50), YEAR(A.travel_datefiled_original))             
--       AS travel_datefiled_original            
--    FROM travelorder_hdr_tbl A                                   
--    INNER JOIN vw_approvalstatus_tbl B                                  
--    ON B.approval_status = A.approval_status             
--    INNER JOIN HRIS_PAY.dbo.vw_departments_tbl_list C            
--    ON C.department_code = A.department_code                              
--    INNER JOIN travelorder_empl_dtl_tbl D                                
--     ON D.travel_order_no = A.travel_order_no                                
--    INNER JOIN vw_personnelnames_tbl_HRIS_ATS D1                                  
--     ON D1.empl_id = D.empl_id                                 
--  INNER JOIN travelorder_dates_dtl_tbl E                                
--    ON E.travel_order_no = A.travel_order_no                          
--    INNER JOIN traveltype_tbl F                                
--    ON F.travel_type_code = A.travel_type_code                                 
--    INNER JOIN HRIS_PAY.dbo.vw_approvalworkflow_tbl G                    
--    ON G.approval_id = A.approval_id            
--   INNER JOIN vw_personnelnames_tbl_HRIS_ATS E1                                 
--    ON E1.empl_id = A.travel_requestor_empl_id                    
--    LEFT JOIN HRIS_PAY.dbo.vw_payrollemployeemaster_asg_tbl Z              
--    ON Z.empl_id = D.empl_id                           
--    INNER JOIN HRIS_PAY.dbo.departments_tbl J              
--    ON J.department_code = ISNULL(Z.department_code,A.department_code)              
--    LEFT JOIN travelordertype_empl_dtl_tbl H                    
--    ON H.travel_order_no = A.travel_order_no                       
--    LEFT JOIN traveltype_tbl H1                    
--    ON H1.travel_type_code = H.travel_type_code               
--    LEFT JOIN HRIS_PAY.dbo.payrollemployeemaster_pos_tbl K1              
--   ON K1.empl_id = D.empl_id              
--   AND K1.effective_date = (SELECT MAX(D1.effective_date) FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl D1              
--            WHERE D1.empl_id = D.empl_id              
--            AND D1.effective_date <= GETDATE())              
              
--   LEFT JOIN HRIS_PAY.dbo.positions_tbl K12              
--   ON K12.position_code = K1.position_code              
             
--   LEFT JOIN HRIS_PAY.dbo.vw_national_assignment Q            
--   ON Q.empl_id = D.empl_id               
            
--   WHERE             
--   --YEAR(A.dtr_date) = 2022            
--   --AND MONTH(A.dtr_date) = 7            
--   --AND              
--   (E.travel_date BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp)            
--    OR E.travel_date_to BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp))            
--    AND            
--   A.department_code NOT IN ('18','19')            
--   AND IIF(ISNULL(@par_dept_code,'') = '',A.department_code,@par_dept_code) = A.department_code            
--   AND A.approval_status IN ('2','F')            
--   --AND A.travel_with_claims = 1            
--   AND A.travel_order_no IN (SELECT DISTINCT A12.travel_order_no FROM HRIS_ATS.dbo.travelorder_empl_dtl_tbl A12            
--           INNER JOIN HRIS_ATS.dbo.travelorder_hdr_tbl B            
--           ON B.travel_order_no = A.travel_order_no            
--           --AND B.travel_with_claims = 1            
--       WHERE empl_id IN (            
--       SELECT empl_id FROM HRIS_PAY.dbo.departments_tbl A1            
--       --WHERE A1.department_code = @v_temp_dept            
--       )            
--       and A12.rcrd_status IN ('2','F'))            
               
--   AND ISNULL(A.to_emergency,0) = 0            
--    )             
--   AS MN            
--   INNER JOIN  HRIS_PAY.dbo.approvalworkflow_tbl A                                                        
--   ON MN.approval_id = A.approval_id            
--  INNER JOIN HRIS_PAY.dbo.transactionsref_tbl B                                                        
--   ON A.transaction_code = B.transaction_code            
--   AND A.transaction_code = '003'             
--   WHERE             
--   CONVERT(DATETIME,A.level1_approval_date) BETWEEN CONVERT(DATETIME,@v_period_from_print) AND  CONVERT(DATETIME,@v_period_to_print)              
--   OR CONVERT(DATETIME,A.level2_approval_date) BETWEEN CONVERT(DATETIME,@v_period_from_print) AND  CONVERT(DATETIME,@v_period_to_print)              
               
--   ORDER BY MN.travel_datefiled_original,MN.department_code,MN.employee_name,MN.dtr_date            
-- END            
            
            
--ELSE             
-- BEGIN            
IF @v_pa_access = 2            
 BEGIN            
 --DELETE FROM temp_to_pa_tbl            
            
 INSERT INTO @v_temp_to_tbl            
  SELECT             
   ROW_NUMBER() OVER(ORDER BY MN.travel_datefiled_original,MN.department_code,MN.employee_name,MN.dtr_date) AS row_nbr             
  ,MN.*            
  FROM (            
  SELECT                               
    --UNION FOR LEVEL 1 APPROVED BY HEAD WITH CLAIMS            
   A.travel_order_no            
   --,@v_ddo_logo AS org_logo               
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
  AND K1.effective_date = (SELECT MAX(D1.effective_date) FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl D1              
            WHERE D1.empl_id = D.empl_id              
            AND D1.effective_date <= GETDATE())           
              
  LEFT JOIN HRIS_PAY.dbo.positions_tbl K12              
  ON K12.position_code = K1.position_code              
            
  LEFT JOIN HRIS_PAY.dbo.vw_national_assignment Q            
   ON Q.empl_id = D.empl_id             
            
   WHERE             
   --YEAR(A.dtr_date) = 2022            
   --AND MONTH(A.dtr_date) = 7            
   --AND              
   (E.travel_date BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp)            
    OR E.travel_date_to BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp))            
   --(A.dtr_date BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp))            
   AND             
   A.department_code NOT IN ('18','19')            
   AND IIF(ISNULL(@par_dept_code,'') = '',A.department_code,@par_dept_code) = A.department_code            
   --AND A.approval_status IN ('1','F')            
   AND A.approval_status IN ('1')            
   --AND A.travel_with_claims = 0            
   AND A.department_code NOT IN ('11','12','21','22','23','24','20')              
   AND A.travel_order_no NOT IN (SELECT DISTINCT A12.travel_order_no FROM HRIS_ATS.dbo.travelorder_empl_dtl_tbl A12            
           INNER JOIN HRIS_ATS.dbo.travelorder_hdr_tbl B            
           ON B.travel_order_no = A12.travel_order_no            
           --AND B.travel_with_claims = 0            
       WHERE empl_id IN (            
       SELECT empl_id FROM HRIS_PAY.dbo.departments_tbl A1            
       --WHERE A1.department_code = @v_temp_dept            
       )            
       --and A12.rcrd_status IN ('1','F'))              
   and A12.rcrd_status IN ('1'))            
   AND ISNULL(A.to_emergency,0) = 0            
   UNION            
   --UNION FOR LEVEL 2 APPROVED WITH CLAIMS BY PHRMDO            
   SELECT                               
   A.travel_order_no            
   --,@v_ddo_logo AS org_logo               
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
   AND K1.effective_date = (SELECT MAX(D1.effective_date) FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl D1              
            WHERE D1.empl_id = D.empl_id              
            AND D1.effective_date <= GETDATE())              
              
 LEFT JOIN HRIS_PAY.dbo.positions_tbl K12              
   ON K12.position_code = K1.position_code              
             
  LEFT JOIN HRIS_PAY.dbo.vw_national_assignment Q            
   ON Q.empl_id = D.empl_id               
   WHERE             
   --YEAR(A.dtr_date) = 2022            
   --AND MONTH(A.dtr_date) = 7            
   --AND              
   (E.travel_date BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp)            
    OR E.travel_date_to BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp))            
    AND            
   A.department_code NOT IN ('18','19')            
   AND IIF(ISNULL(@par_dept_code,'') = '',A.department_code,@par_dept_code) = A.department_code            
   --AND A.approval_status IN ('2','F')            
   AND A.approval_status IN ('2')            
   --AND A.travel_with_claims = 0            
   AND A.department_code IN ('11','12','21','22','23','24','20')            
   AND ISNULL(A.to_emergency,0) = 0       
              
   UNION       
              
   --UNION FOR LEVEL 2 APPROVED BY MA'AM PA FOR DEPT HEADS TO            
            
   SELECT                               
   A.travel_order_no            
   --,@v_ddo_logo AS org_logo               
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
   AND K1.effective_date = (SELECT MAX(D1.effective_date) FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl D1              
            WHERE D1.empl_id = D.empl_id              
            AND D1.effective_date <= GETDATE())              
              
   LEFT JOIN HRIS_PAY.dbo.positions_tbl K12              
   ON K12.position_code = K1.position_code              
             
   LEFT JOIN HRIS_PAY.dbo.vw_national_assignment Q            
   ON Q.empl_id = D.empl_id               
            
   WHERE             
   --YEAR(A.dtr_date) = 2022            
   --AND MONTH(A.dtr_date) = 7            
   --AND              
   (E.travel_date BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp)            
    OR E.travel_date_to BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp))            
    AND            
   A.department_code NOT IN ('18','19')            
   AND IIF(ISNULL(@par_dept_code,'') = '',A.department_code,@par_dept_code) = A.department_code            
   --AND A.approval_status IN ('2','F')            
   AND A.approval_status IN ('2')            
   --AND A.travel_with_claims = 0            
   AND A.travel_order_no IN (SELECT DISTINCT A12.travel_order_no FROM HRIS_ATS.dbo.travelorder_empl_dtl_tbl A12            
           INNER JOIN HRIS_ATS.dbo.travelorder_hdr_tbl B            
           ON B.travel_order_no = A.travel_order_no            
           --AND B.travel_with_claims = 0            
       WHERE empl_id IN (            
       SELECT empl_id FROM HRIS_PAY.dbo.departments_tbl A1            
       --WHERE A1.department_code = @v_temp_dept            
       )            
       and A12.rcrd_status IN ('2','F'))            
   AND ISNULL(A.to_emergency,0) = 0            
               
    )             
   AS MN            
   INNER JOIN  HRIS_PAY.dbo.approvalworkflow_tbl A                                                        
   ON MN.approval_id = A.approval_id            
   INNER JOIN HRIS_PAY.dbo.transactionsref_tbl B                                                        
   ON A.transaction_code = B.transaction_code            
   AND A.transaction_code = '003'             
   WHERE             
   CONVERT(DATETIME,A.level1_approval_date) BETWEEN CONVERT(DATETIME,@v_period_from_print) AND  CONVERT(DATETIME,@v_period_to_print)              
   OR CONVERT(DATETIME,A.level2_approval_date) BETWEEN CONVERT(DATETIME,@v_period_from_print) AND  CONVERT(DATETIME,@v_period_to_print)              
               
   ORDER BY MN.travel_datefiled_original,MN.department_code,MN.employee_name,MN.dtr_date            
 END            
            
 ELSE            
 BEGIN            
 --DELETE FROM temp_to_user_tbl            
            
 INSERT INTO @v_temp_to_tbl            
  SELECT             
  ROW_NUMBER() OVER(ORDER BY MN.travel_datefiled_original,MN.department_code,MN.employee_name,MN.dtr_date) AS row_nbr             
  ,MN.*        
  FROM (            
  SELECT                               
    --UNION FOR LEVEL 1 APPROVED BY HEAD WITH CLAIMS            
   A.travel_order_no            
   --,@v_ddo_logo AS org_logo               
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
  AND K1.effective_date = (SELECT MAX(D1.effective_date) FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl D1              
            WHERE D1.empl_id = D.empl_id              
            AND D1.effective_date <= GETDATE())              
              
  LEFT JOIN HRIS_PAY.dbo.positions_tbl K12              
  ON K12.position_code = K1.position_code              
            
  LEFT JOIN HRIS_PAY.dbo.vw_national_assignment Q            
   ON Q.empl_id = D.empl_id             
            
   WHERE             
   --YEAR(A.dtr_date) = 2022            
   --AND MONTH(A.dtr_date) = 7            
   --AND              
   (E.travel_date BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp)            
    OR E.travel_date_to BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp))            
   --(A.dtr_date BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp))            
   AND             
   A.department_code NOT IN ('18','19')            
   AND IIF(ISNULL(@par_dept_code,'') = '',A.department_code,@par_dept_code) = A.department_code            
   AND A.approval_status IN ('1','F')            
   --AND A.travel_with_claims = 0            
   AND A.department_code NOT IN ('11','12','21','22','23','24','20')              
   AND A.travel_order_no NOT IN (SELECT DISTINCT A12.travel_order_no FROM HRIS_ATS.dbo.travelorder_empl_dtl_tbl A12            
           INNER JOIN HRIS_ATS.dbo.travelorder_hdr_tbl B            
           ON B.travel_order_no = A12.travel_order_no            
           --AND B.travel_with_claims = 0            
       WHERE empl_id IN (            
       SELECT empl_id FROM HRIS_PAY.dbo.departments_tbl A1            
       --WHERE A1.department_code = @v_temp_dept            
       )            
       and A12.rcrd_status IN ('1','F'))              
   AND ISNULL(A.to_emergency,0) = 0            
   UNION            
   --UNION FOR LEVEL 2 APPROVED WITH CLAIMS BY PHRMDO            
   SELECT                               
   A.travel_order_no            
   --,@v_ddo_logo AS org_logo               
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
   AND K1.effective_date = (SELECT MAX(D1.effective_date) FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl D1              
            WHERE D1.empl_id = D.empl_id              
            AND D1.effective_date <= GETDATE())              
              
 LEFT JOIN HRIS_PAY.dbo.positions_tbl K12              
   ON K12.position_code = K1.position_code              
             
  LEFT JOIN HRIS_PAY.dbo.vw_national_assignment Q            
   ON Q.empl_id = D.empl_id               
   WHERE             
   --YEAR(A.dtr_date) = 2022            
   --AND MONTH(A.dtr_date) = 7            
   --AND              
   (E.travel_date BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp)            
    OR E.travel_date_to BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp))            
    AND            
   A.department_code NOT IN ('18','19')            
   AND IIF(ISNULL(@par_dept_code,'') = '',A.department_code,@par_dept_code) = A.department_code            
   AND A.approval_status IN ('2','F')            
   --AND A.travel_with_claims = 0            
   AND A.department_code IN ('11','12','21','22','23','24','20')            
   AND ISNULL(A.to_emergency,0) = 0            
   UNION            
   --UNION FOR LEVEL 2 APPROVED BY MA'AM PA FOR DEPT HEADS TO            
            
   SELECT                               
   A.travel_order_no            
   --,@v_ddo_logo AS org_logo               
   ,D.empl_id            
   ,D1.employee_name            
   ,IIF(ISNULL(K12.position_title1,'') = '',K12.position_long_title,IIF(K12.csc_level = 2,IIF(ISNULL(K12.position_title2,'') = '',K12.position_title1,K12.position_title2),K12.position_title1))               AS position_title1            
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
   AND K1.effective_date = (SELECT MAX(D1.effective_date) FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl D1              
            WHERE D1.empl_id = D.empl_id              
            AND D1.effective_date <= GETDATE())              
              
   LEFT JOIN HRIS_PAY.dbo.positions_tbl K12              
   ON K12.position_code = K1.position_code              
             
   LEFT JOIN HRIS_PAY.dbo.vw_national_assignment Q            
   ON Q.empl_id = D.empl_id               
            
   WHERE             
   --YEAR(A.dtr_date) = 2022            
   --AND MONTH(A.dtr_date) = 7            
   --AND              
   (E.travel_date BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp)            
    OR E.travel_date_to BETWEEN DATEADD(MONTH,-1,@par_period_from_covered_sp) AND DATEADD(MONTH,1,@par_period_to_covered_sp))            
    AND            
   A.department_code NOT IN ('18','19')            
   AND IIF(ISNULL(@par_dept_code,'') = '',A.department_code,@par_dept_code) = A.department_code            
   AND A.approval_status IN ('2','F')            
   --AND A.travel_with_claims = 0            
   AND A.travel_order_no IN (SELECT DISTINCT A12.travel_order_no FROM HRIS_ATS.dbo.travelorder_empl_dtl_tbl A12            
           INNER JOIN HRIS_ATS.dbo.travelorder_hdr_tbl B            
           ON B.travel_order_no = A.travel_order_no            
           --AND B.travel_with_claims = 0            
       WHERE empl_id IN (            
       SELECT empl_id FROM HRIS_PAY.dbo.departments_tbl A1            
       --WHERE A1.department_code = @v_temp_dept            
       )            
       and A12.rcrd_status IN ('2','F'))            
   AND ISNULL(A.to_emergency,0) = 0            
               
    )             
   AS MN            
   INNER JOIN  HRIS_PAY.dbo.approvalworkflow_tbl A                                                        
   ON MN.approval_id = A.approval_id            
   INNER JOIN HRIS_PAY.dbo.transactionsref_tbl B                                                        
   ON A.transaction_code = B.transaction_code            
   AND A.transaction_code = '003'             
   WHERE             
   CONVERT(DATETIME,A.level1_approval_date) BETWEEN CONVERT(DATETIME,@v_period_from_print) AND  CONVERT(DATETIME,@v_period_to_print)              
   OR CONVERT(DATETIME,A.level2_approval_date) BETWEEN CONVERT(DATETIME,@v_period_from_print) AND  CONVERT(DATETIME,@v_period_to_print)              
               
   ORDER BY MN.travel_datefiled_original,MN.department_code,MN.employee_name,MN.dtr_date            
 END            
            
    
    
   
            
            
 IF @v_pa_access = 2           
 BEGIN            
 WAITFOR DELAY '00:00:01'            
  SELECT             
  ROW_NUMBER() OVER(ORDER BY MN.travel_datefiled_original,MN.department_code,MN.employee_name,MN.dtr_date) AS row_nbr                   
 ,MN.travel_order_no                
 --,org_logo                  
 ,MN.empl_id                  
 ,employee_name                 
 ,position_title1                
 ,department_name1                
 ,department_short_name               
 ,dtr_date                  
 ,travel_place_visit                
 ,travel_purpose            
 ,travel_requestor_empl_id              
 ,travel_requestor_empl_name              
 ,travel_type_code                
 ,travel_type_descr                
 ,travel_with_claims                
 ,travel_justification               
 ,report_header_descr               
 ,approval_status                
 ,department_code                
 ,approval_id                 
 ,travel_datefiled_original              
 ,CASE WHEN ISNULL(B.travel_order_no,'') = ''  --NO ACTION YET            
   THEN 'N'          WHEN ISNULL(B.travel_order_no,'') <> ''            
    AND ISNULL(B.approved_status,0) = 0 --WITH ACTION DISAPPROVED --WITH ACTION DISAPPROVED            
   THEN 'D'            
    ELSE 'Y'          --WITH ACTION APPROVED            
 END AS approved_status
 ,@v_pa_readonly  AS pa_readonly 
 ,@v_pa_writeonly AS pa_writeonly           
  FROM @v_temp_to_tbl MN            
  LEFT JOIN travel_order_check_tbl B            
  ON B.travel_order_no = MN.travel_order_no            
  AND MN.empl_id = B.empl_id            
             
 WHERE ISNULL(B.approved_status,'') = ''         
 AND MN.approval_status NOT IN ('F','D','L')  
 AND  @v_pa_readonly = 1        
 ORDER BY MN.travel_datefiled_original,MN.department_code,MN.employee_name,MN.dtr_date            
 END            
            
 ELSE            
 BEGIN            
 WAITFOR DELAY '00:00:01'            
  --SELECT * FROM temp_to_user_tbl            
  --EXEC sp_travel_order_daily_pa_rep '2022-08-25','2022-08-26','','03','U8447','',''            
  SELECT             
   ROW_NUMBER() OVER(ORDER BY MN.travel_datefiled_original,MN.department_code,MN.employee_name,MN.dtr_date) AS row_nbr                   
  ,MN.travel_order_no                
  --,org_logo                  
  ,MN.empl_id                  
  ,employee_name                 
  ,position_title1                
  ,department_name1                
  ,department_short_name               
  ,dtr_date                  
  ,travel_place_visit           
  ,travel_purpose                 
  ,travel_requestor_empl_id              
  ,travel_requestor_empl_name              
  ,travel_type_code                
  ,travel_type_descr                
  ,travel_with_claims                
  ,travel_justification               
  ,report_header_descr               
  ,approval_status                
  ,department_code                
  ,approval_id                 
  ,travel_datefiled_original              
  ,CASE WHEN ISNULL(B.travel_order_no,'') = ''  --NO ACTION YET            
   THEN 'N'            
    WHEN ISNULL(B.travel_order_no,'') <> ''            
   AND ISNULL(B.approved_status,0) = 0 --WITH ACTION DISAPPROVED            
   THEN 'D'            
    ELSE 'Y'         --WITH ACTION APPROVED            
  END AS approved_status
  ,@v_pa_readonly  AS pa_readonly 
  ,@v_pa_writeonly AS pa_writeonly             
   FROM @v_temp_to_tbl MN             
   INNER JOIN travel_order_check_tbl B            
  ON B.travel_order_no = MN.travel_order_no            
  AND MN.empl_id = B.empl_id            
  --WHERE ISNULL(B.approved_status,0) = 1            
  --MN.travel_order_no NOT IN (            
  --SELECT DISTINCT A.travel_order_no FROM travel_order_printing_tbl A            
  --WHERE A.par_user_id = @par_user_id            
  --and GETDATE() BETWEEN @v_period_from_print AND  @v_period_to_print            
  ----AND CONVERT(DATETIME,GETDATE()) BETWEEN print_date AND CONVERT(DATETIME,DATEADD(HOUR, 2, print_date))             
  --)            
  AND CONVERT(DATE,B.approved_dttm) BETWEEN @par_period_from AND @par_period_to             
            
  WHERE MN.travel_order_no NOT IN(SELECT travel_order_no FROM travel_order_check_tbl WHERE travel_order_no = MN.travel_order_no AND approved_status = 0)          
            
 -- (SELECT COUNT(empl_id) FROM travel_order_check_tbl WHERE travel_order_no = MN.travel_order_no AND approved_status = 0) > 0          
  ORDER BY MN.travel_datefiled_original,MN.department_code,MN.employee_name,MN.dtr_date            
 END            
 --EXEC sp_travel_order_daily_pa_rep '2022-09-01','2022-09-30','','','U10058','',''            
            
 --IF @par_user_id = 'U8447'            
 -- BEGIN            
 --  INSERT INTO travel_order_printing_tbl            
 --  SELECT DISTINCT             
 --  GETDATE()            
 --  ,travel_order_no            
 --  ,@par_user_id --ASSIGNED PERSONNEL            
 --  ,CONVERT(DATETIME,DATEADD(HOUR, 2, GETDATE()))            
 --  FROM @v_temp_to_tbl MN             
 -- END 