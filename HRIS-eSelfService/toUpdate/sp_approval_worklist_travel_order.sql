--exec sp_approval_worklist_travel_order 'U8749','','2023','',''
  
ALTER PROCEDURE sp_approval_worklist_travel_order                                              
 @par_user_id   VARCHAR(30),                                                
 @par_department_code VARCHAR(02),                                                
 @par_to_year   VARCHAR(04),                                                
 @par_to_month   VARCHAR(02),                                                
 @par_employment_type VARCHAR(02)                                                
AS                                                
BEGIN                                                
                                    
DECLARE @v_temp_dept VARCHAR(02)     
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
					   
					                                
 IF @par_user_id IN ('U0269','U0029','U2756','U1643','U7999','U9184','U2013','U2886','U2972','U9184','U2013','U8415','U6117','U2091')                                    
  BEGIN    
  
   SET @v_temp_dept = @par_department_code     
   SET @par_department_code = '03'                                    
                                   
  END          
        
  DECLARE @v_check_dept BIT        
  SET @v_check_dept = 0        
  SELECT @v_check_dept = 1 from  HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl A        
  LEFT JOIN vw_payrollemployeemaster_asg_tbl B        
  ON B.empl_id = A.empl_id        
  AND B.ss_appl_flag = 1        
  WHERE ISNULL(B.department_code,A.department_code) = '01'        
  AND A.empl_id = REPLACE(@par_user_id,'U','')        
  AND A.effective_date = (SELECT MAX(A1.effective_date) FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl A1        
       WHERE A1.empl_id = A.empl_id        
       AND A1.effective_date <= GETDATE())        
        
  IF @v_check_dept = 1          
  OR @par_user_id IN ('U2089','U8447','U2003')                                 
  BEGIN                                    
   SET @v_temp_dept = @par_department_code                                    
   SET @par_department_code = '01'                                    
  END         
        
          
  IF @v_pa_access = 2                                   
  BEGIN                                    
   SET @v_temp_dept = ''                                    
  END                                      
                                      
                                    
-- IF @par_department_code IN ('18','19')                                          
--  BEGIN          
--  SELECT MN.*,D.department_code,        
-- D.department_short_name AS department_name1          
-- FROM (                                        
--   SELECT                                                   
--      ISNULL(A.approval_id,'')     AS approval_id                                                  
--     ,ISNULL(A.user_id_creator,'')    AS user_id_creator                                                  
--     ,ISNULL(A.empl_id,'')      AS empl_id_owner                                                  
--     ,ISNULL(A.empl_id_creator,'')    AS empl_id_creator                                                 
--     ,B.approval_status       AS approval_status                                                  
--     ,ISNULL(A.transaction_descr,'')    AS transaction_descr                                                 
--     ,A.worklist_status       AS worklist_status                                                
--     --,A.worklist_action                                                 
--     ,CASE                                                
--      WHEN ( SELECT                                              
--      COUNT(M.workflow_authority)                                              
--      FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
--      WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
--      AND M.transaction_code = '003'                                              
--     ) > 1                                              
--      THEN (                                              --      CASE ( SELECT TOP 1                                              
--     M.workflow_authority                                        
--     FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
--     WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
--     AND M.transaction_code = '003'                                              
--     ORDER BY M.workflow_authority DESC                                              
--       )                                              
--       WHEN '1' THEN 'For Approval - Level 1'                                              
--       WHEN '2' THEN 'For Approval - Level 2'                                              
--       ELSE 'For Final Approval'                                              
--      END                                              
--     )                                              
--      ELSE A.worklist_action                                              
--     END          AS worklist_action                                              
--     --,IIF (RIGHT(A.transaction_page_name,1) = '=','',RIGHT(A.transaction_page_name,1)) AS next_status                                                  
--     ,CASE                                                
--      WHEN ( SELECT                                              
--      COUNT(M.workflow_authority)                                              
--      FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
--      WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
--      AND M.transaction_code = '003'                                              
--) > 1                                              
--      THEN (                                              
--      CASE ( SELECT TOP 1                                       
--     M.workflow_authority                                              
--     FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
--     WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
--AND M.transaction_code = '003'                                              
--     ORDER BY M.workflow_authority DESC                            
--       )                                              
--       WHEN '1' THEN '1'                                              
--       WHEN '2' THEN '2'                                        
--       ELSE 'F'                                              
--      END                                              
--     )                                              
--      ELSE (                                            
--      IIF (RIGHT(A.transaction_page_name,1) = '=','',RIGHT(A.transaction_page_name,1))                                              
--  )                                              
--     END           AS next_status                                               
--     ,ISNULL(A.owner_name,'')     AS owner_name                                  
--     ,ISNULL(A.creator_name,'')     AS creator_name                                                   
--     ,ISNULL(A.reviewed_comment,'')    AS reviewed_comment                                          
--     ,ISNULL(A.level1_approval_comment,'')  AS level1_approval_comment                                                  
--     ,ISNULL(A.level2_approval_comment,'')  AS level2_approval_comment                                                  
--     ,ISNULL(A.final_approval_comment,'')  AS final_approval_comment                                                  
--     ,ISNULL(A.disapproval_comment,'')   AS disapproval_comment                                                  
--     ,ISNULL(A.cancel_pending_comment,'')  AS cancel_pending_comment                                                   
--     ,ISNULL(A.cancelled_comment,'')    AS cancelled_comment                                          
--     ,ISNULL(B.travel_order_no,'')    AS application_nbr                                                  
--     ,ISNULL(B.travel_requestor_empl_id,'')  AS created_by_user                                                  
--    ,ISNULL(B.posting_status,'')    AS posting_status                                                  
--     ,ISNULL(B.travel_justification,'')   AS detail_remarks                                                 
--     ,CONVERT(varchar,DATEPART(yyyy,B.travel_datefiled_original))+'-'                                                  
--      +RIGHT('00'+CONVERT(varchar,DATEPART(mm,B.travel_datefiled_original)),2)+'-'                                                  
--      +RIGHT('00'+CONVERT(varchar,DATEPART(dd,B.travel_datefiled_original)),2) AS travel_datefiled                                                  
                              
--    ,''  AS reviewed_date                          
--    ,''  AS user_id_reviewer                          
--    ,''  AS level1_approval_date                          
--    ,''  AS user_id_level1_approver             
--    ,''  AS level2_approval_date                          
--    ,''  AS user_id_level2_approver                       
--    ,''  AS final_approval_date                          
--    ,''  AS user_id_final_approver                                         
--    FROM HRIS_PAY.dbo.func_approval_worklist_travel_order(@par_user_id) A                                                
--     INNER JOIN travelorder_hdr_tbl B                                                
--      ON B.approval_id = A.approval_id                                                
--    WHERE   YEAR(B.travel_datefiled_original) = @par_to_year                                                  
--    --AND   MONTH(B.travel_datefiled)  = @par_to_month                                                 
--    AND   (B.department_code IN ('18','19'))                                                
--    AND  (ISNULL(@par_to_month,'') = ''                                              
--     OR @par_to_month <> ''                                               
--     AND MONTH(B.travel_datefiled_original) = @par_to_month                                                  
--     )                                              
--    AND  (ISNULL(@par_department_code,'') = ''                                              
--     OR @par_department_code <> ''                                              
--     --AND B.department_code    = @par_department_code                                              
--     )                                    
                                                 
--    UNION                                                  
--     -- Transaction Status for Log in by Final Approver                                                  
--    SELECT                                        
--      ISNULL(A.approval_id,'')     AS approval_id                                                  
--     ,ISNULL(A.user_id_creator,'')    AS user_id_creator                                                  
--     ,ISNULL(A.empl_id,'')      AS empl_id_owner                                                  
--     ,ISNULL(L.empl_id,'')      AS empl_id_creator                                                  
--     ,A.approval_status       AS approval_status                                                 
--   ,ISNULL(B.transaction_descr,'')    AS transaction_descr                                                  
--     ,E.approval_status_descr     AS worklist_status                                                  
--     ,CASE A.approval_status                                                  
--    WHEN 'F' THEN 'View Details'                                                   
--      ELSE 'View Details'                                                  
--     END           AS worklist_action                                                  
--     ,CASE A.approval_status                                                  
--      WHEN 'C' THEN ''                                                   
--      ELSE ''                                                   
--     END           AS next_status                                                  
--      ,ISNULL(J.last_name,'NoLastName') + ', ' +  ISNULL(J.first_name,'NoFirstName') + ' '                                     
--    + IIF(ISNULL(J.middle_name,'') = '', ' ', LEFT(J.middle_name,1) + '. ' )                                                
--    + ISNULL(J.suffix_name,'')  as owner_name       
--    ,ISNULL(L.last_name,'NoLastName') + ', ' +  ISNULL(L.first_name,'NoFirstName') + ' '                             
--    + IIF(ISNULL(L.middle_name,'') = '', ' ', LEFT(L.middle_name,1) + '. ' )                                                
--    + ISNULL(L.suffix_name,'')  as creator_name                                                    
--     ,ISNULL(A.reviewed_comment,'')    AS reviewed_comment                                                  
--     ,ISNULL(A.level1_approval_comment,'')  AS level1_approval_comment                                                  
--     ,ISNULL(A.level2_approval_comment,'')  AS level2_approval_comment                                   
--     ,ISNULL(A.final_approval_comment,'')  AS final_approval_comment                                                  
--     ,ISNULL(A.disapproval_comment,'')   AS disapproval_comment                                                  
--     ,ISNULL(A.cancel_pending_comment,'')  AS cancel_pending_comment                                   
--     ,ISNULL(A.cancelled_comment,'')    AS cancelled_comment                                                   
--     ,ISNULL(C.travel_order_no,'')    AS application_nbr                                                  
--     ,ISNULL(C.travel_requestor_empl_id,'')  AS created_by_user                                                  
--     ,ISNULL(C.posting_status,'')    AS posting_status                                                  
--     ,ISNULL(C.travel_justification,'')   AS detail_remarks                                                  
--     ,CONVERT(varchar,DATEPART(yyyy,C.travel_datefiled_original))+'-'                                                  
--     +RIGHT('00'+CONVERT(varchar,DATEPART(mm,C.travel_datefiled_original)),2)+'-'                                          
--     +RIGHT('00'+CONVERT(varchar,DATEPART(dd,C.travel_datefiled_original)),2)                                                   
--      AS travel_datefiled                             
--    ,''  AS reviewed_date                          
--    ,''  AS user_id_reviewer                          
--    ,''  AS level1_approval_date                          
--    ,''  AS user_id_level1_approver             
--    ,''  AS level2_approval_date                          
--    ,''  AS user_id_level2_approver                       
--    ,''  AS final_approval_date                          
--    ,''  AS user_id_final_approver                                               
--    FROM travelorder_hdr_tbl C                                                 
--     INNER JOIN HRIS_PAY.dbo.approvalworkflow_tbl A                                                  
--      ON A.approval_id = C.approval_id                                                  
                                                  
--     INNER JOIN vw_approvalstatus_tbl E                                                  
--      ON A.approval_status = E.approval_status                                                    
                                                  
--    INNER JOIN HRIS_PAY.dbo.transactionsref_tbl B                                                  
--      ON A.transaction_code = B.transaction_code                                                  
--      AND A.transaction_code IN ('003')                                                  
                                                  
--     LEFT JOIN HRIS_PAY.dbo.vw_personnelnames_tbl J                                         
--      ON A.empl_id = J.empl_id                                                  
                                                  
--     INNER JOIN HRIS_PAY.dbo.usersprofile_tbl D1                                                  
--    ON  D1.user_id = A.user_id_creator                    
                                                  
--     LEFT JOIN HRIS_PAY.dbo.vw_personnelnames_tbl L                                                  
--      ON L.empl_id = D1.empl_id                                                  
                                                  
--     INNER JOIN HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl Z                               
--      ON  Z.empl_id = C.travel_requestor_empl_id                          
--      AND Z.effective_date = (SELECT MAX(Z1.effective_date) FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl Z1                                                  
--       WHERE Z1.empl_id  = Z.empl_id                                                  
--       AND Z1.emp_rcrd_status = 1)                                                  
--      AND Z.emp_rcrd_status = 1                                            
--      AND Z.department_code    IN ('18','19')                                             
                                                  
--    WHERE A.user_id_final_approver = @par_user_id                                                  
--    AND   A.approval_status IN ('S','C','R','1','2','F','D','L')                                                  
--    AND   B.with_self_service = 1                                                  
--    AND   YEAR(C.travel_datefiled_original) = @par_to_year                                                
--    --AND   MONTH(C.travel_datefiled) = @par_to_month                                                  
--    --AND   (Z.department_code = @par_department_code)                                                  
--    --AND   (Z.employment_type = @par_employment_type)                                                 
--    AND  (ISNULL(@par_to_month,'') = ''                                              
--     OR @par_to_month <> ''                                               
--     AND MONTH(C.travel_datefiled_original) = @par_to_month                                                  
--     )                                              
--    AND  (ISNULL(@par_department_code,'') = ''                                              
--     OR @par_department_code <> ''                                              
--     --AND Z.department_code    = @par_department_code                                              
--     )                                                
                                              
--    -- UNION TO PAYROLL EMPLOYEE MASTER ASSIGNED TABLE                                              
--    UNION                                              
--    SELECT                                                   
--      ISNULL(A.approval_id,'')     AS approval_id                                                  
--     ,ISNULL(A.user_id_creator,'')    AS user_id_creator                                                  
--     ,ISNULL(A.empl_id,'')      AS empl_id_owner                                                  
--     ,ISNULL(A.empl_id_creator,'')    AS empl_id_creator                                             
--     ,B.approval_status       AS approval_status                                                  
--     ,ISNULL(A.transaction_descr,'')    AS transaction_descr                                                 
--     ,A.worklist_status       AS worklist_status                                                
--     --,A.worklist_action                                                
--     ,CASE                                                
--      WHEN ( SELECT                                              
--      COUNT(M.workflow_authority)                                          
--      FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
--      WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
--      AND M.transaction_code = '003'                                              
--     ) > 1                                            
--      THEN (                                              
--  CASE ( SELECT TOP 1                                              
--     M.workflow_authority                                              
--     FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                  
--     WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
--     AND M.transaction_code = '003'                                              
--     ORDER BY M.workflow_authority DESC                                
--       )                                              
--       WHEN '1' THEN 'For Approval - Level 1'                                              
--       WHEN '2' THEN 'For Approval - Level 2'                                              
--       ELSE 'For Final Approval'                                              
--      END                                              
--     )                                              
--      ELSE A.worklist_action                                              
-- END          AS worklist_action                                               
--     --,IIF (RIGHT(A.transaction_page_name,1) = '=','',RIGHT(A.transaction_page_name,1)) AS next_status                                                  
--     ,CASE                                                
--      WHEN ( SELECT                                              
--      COUNT(M.workflow_authority)                                              
--      FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
--      WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
--      AND M.transaction_code = '003'                                              
--     ) > 1                                             
--      THEN (                                              
--      CASE ( SELECT TOP 1                                              
--     M.workflow_authority                                              
--     FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
--     WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
--     AND M.transaction_code = '003'                                              
--     ORDER BY M.workflow_authority DESC                                              
--       )                                              
--       WHEN '1' THEN '1'                                              
--       WHEN '2' THEN '2'                                              
--       ELSE 'F'                                              
--      END                                              
--     )                                              
--      ELSE (                                              
--      IIF (RIGHT(A.transaction_page_name,1) = '=','',RIGHT(A.transaction_page_name,1))                                              
--     )                                              
--     END           AS next_status                                               
--     ,ISNULL(A.owner_name,'')     AS owner_name                                                   
--     ,ISNULL(A.creator_name,'')     AS creator_name                                                   
--     ,ISNULL(A.reviewed_comment,'')    AS reviewed_comment                                                  
--     ,ISNULL(A.level1_approval_comment,'')  AS level1_approval_comment                         
--     ,ISNULL(A.level2_approval_comment,'')  AS level2_approval_comment                               
--     ,ISNULL(A.final_approval_comment,'')  AS final_approval_comment                                                  
--     ,ISNULL(A.disapproval_comment,'')   AS disapproval_comment                                                  
--     ,ISNULL(A.cancel_pending_comment,'')  AS cancel_pending_comment                                                   
--     ,ISNULL(A.cancelled_comment,'')    AS cancelled_comment                                         
--     ,ISNULL(B.travel_order_no,'')    AS application_nbr                                                  
--     ,ISNULL(B.travel_requestor_empl_id,'')  AS created_by_user                                                  
--     ,ISNULL(B.posting_status,'')    AS posting_status                                                  
--     ,ISNULL(B.travel_justification,'')   AS detail_remarks                                                  
--     ,CONVERT(varchar,DATEPART(yyyy,B.travel_datefiled_original))+'-'                                                  
--   +RIGHT('00'+CONVERT(varchar,DATEPART(mm,B.travel_datefiled_original)),2)+'-'                                                  
--      +RIGHT('00'+CONVERT(varchar,DATEPART(dd,B.travel_datefiled_original)),2) AS travel_datefiled                                                  
--     ,''  AS reviewed_date                          
--    ,''  AS user_id_reviewer                          
--    ,''  AS level1_approval_date                          
--    ,''  AS user_id_level1_approver             
--    ,''  AS level2_approval_date                          
--    ,''  AS user_id_level2_approver                       
--    ,''  AS final_approval_date                          
--    ,''  AS user_id_final_approver                                           
--    FROM HRIS_PAY.dbo.func_approval_worklist_travel_order(@par_user_id) A                                                
--     INNER JOIN travelorder_hdr_tbl B                                                
--      ON B.approval_id = A.approval_id                                             
--    WHERE YEAR(B.travel_datefiled_original) = @par_to_year                                                  
--    --AND   MONTH(B.travel_datefiled)  = @par_to_month                  
--    AND  (ISNULL(@par_to_month,'') = ''                                              
--     OR @par_to_month <> ''                                               
--     AND MONTH(B.travel_datefiled_original) = @par_to_month                                                  
--     )                                              
--    AND   (A.empl_id IN (SELECT                                               
--      X1.empl_id                                               
--      FROM HRIS_PAY.dbo.payrollemployeemaster_asg_tbl X1                                              
--      WHERE X1.department_code IN ('18','19')                                              
--      AND X1.ss_appl_flag = 1                                              
--      AND X1.effective_date = (SELECT                                               
--      MAX(X2.effective_date)                      
--      FROM HRIS_PAY.dbo.payrollemployeemaster_asg_tbl X2                                            
--      WHERE X2.empl_id  = X1.empl_id)))                                              
--      --AND X1.employment_type = @par_employment_type))                                              
--   ) AS MN        
--   INNER JOIN HRIS_ATS.dbo.travelorder_hdr_tbl Z        
--   ON Z.travel_order_no = MN.application_nbr        
--   INNER JOIN HRIS_PAY.dbo.vw_departments_tbl_list D        
--   ON D.department_code = Z.department_code        
                                               
--  END                                          
 --ELSE       
 IF @par_department_code = '03' AND @par_user_id IN ('U0269','U0029','U2756','U1643','U7999','U9184','U2013','U2886','U2972','U9184','U2013','U8415','U6117','U2091')   -- HR Can Approve All Department - Remove All Whereclause (Departmet Code)             
               
 BEGIN          
 SELECT * FROM (                                      
 SELECT                           
 MN.*,         
  D.department_code,        
 D.department_short_name AS department_name1,                                
     CONVERT(varchar, DATEPART(yyyy, Z.reviewed_date)) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(mm, Z.reviewed_date)),2) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(dd, Z.reviewed_date)),2)                                  
     AS reviewed_date                        
  ,Z.user_id_reviewer                          
  ,CONVERT(varchar, DATEPART(yyyy, Z.level1_approval_date)) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(mm, Z.level1_approval_date)),2) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(dd, Z.level1_approval_date)),2)                                  
     AS level1_approval_date                          
   ,Z.user_id_level1_approver             
   ,CONVERT(varchar, DATEPART(yyyy, Z.level2_approval_date)) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(mm, Z.level2_approval_date)),2) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(dd, Z.level2_approval_date)),2)                                  
     AS level2_approval_date                          
  ,Z.user_id_level2_approver                       
  ,CONVERT(varchar, DATEPART(yyyy, Z.final_approval_date)) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(mm, Z.final_approval_date)),2) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(dd, Z.final_approval_date)),2)             
     AS final_approval_date                          
  ,Z.user_id_final_approver                          
                           
  FROM (                                      
   SELECT DISTINCT                                                 
      ISNULL(A.approval_id,'')   AS approval_id                                                  
     ,ISNULL(A.user_id_creator,'')  AS user_id_creator                                                  
     ,ISNULL(A.empl_id,'')    AS empl_id_owner                                                  
     ,ISNULL(A.empl_id_creator,'')  AS empl_id_creator                                                 
     ,B.approval_status     AS approval_status                                                  
  ,ISNULL(A.transaction_descr,'')    AS transaction_descr                                                 
     ,A.worklist_status     AS worklist_status                                                
     --,A.worklist_action                                                 
     ,CASE                                                
      WHEN ( SELECT                                              
      COUNT(M.workflow_authority)                                              
      FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
      WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
      AND M.transaction_code = '003'                                              
     ) > 1                                              
      THEN (                                              
      CASE ( SELECT TOP 1                                              
     M.workflow_authority                                              
     FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
     WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
     AND M.transaction_code = '003'                                              
     ORDER BY M.workflow_authority DESC                                              
       )                                  
       WHEN '1' THEN 'For Approval - Level 1'                                              
       WHEN '2' THEN 'For Approval - Level 2'                                              
       ELSE 'For Final Approval'                                              
      END                                              
     )                                              
      ELSE A.worklist_action                                              
     END          AS worklist_action                                              
     --,IIF (RIGHT(A.transaction_page_name,1) = '=','',RIGHT(A.transaction_page_name,1)) AS next_status                                                  
     ,CASE                      
      WHEN ( SELECT                                              
      COUNT(M.workflow_authority)                                              
      FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
      WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
      AND M.transaction_code = '003'                                              
     ) > 1                                              
      THEN (                                              
      CASE ( SELECT TOP 1                                              
     M.workflow_authority                                              
     FROM HRIS_PAY.dbo.transactionsapprover_tbl M                     
     WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')           
     AND M.transaction_code = '003'                                              
     ORDER BY M.workflow_authority DESC                                              
       )                                              
       WHEN '1' THEN '1'                                              
       WHEN '2' THEN '2'                                              
       ELSE 'F'                                              
 END                                          
     )                                              
      ELSE (                                              
      IIF (RIGHT(A.transaction_page_name,1) = '=','',RIGHT(A.transaction_page_name,1))                                              
     )                                              
     END          AS next_status                         
     ,ISNULL(A.owner_name,'')     AS owner_name                                                   
     ,ISNULL(A.creator_name,'')     AS creator_name                                                   
     ,ISNULL(A.reviewed_comment,'')    AS reviewed_comment                                                  
     ,ISNULL(A.level1_approval_comment,'')   AS level1_approval_comment                                                  
     ,ISNULL(A.level2_approval_comment,'')   AS level2_approval_comment                           
     ,ISNULL(A.final_approval_comment,'')  AS final_approval_comment                                                  
     ,ISNULL(A.disapproval_comment,'')   AS disapproval_comment                                                  
     ,ISNULL(A.cancel_pending_comment,'')  AS cancel_pending_comment                                                   
     ,ISNULL(A.cancelled_comment,'')   AS cancelled_comment                                                   
     ,ISNULL(B.travel_order_no,'')    AS application_nbr                                                  
     ,ISNULL(B.travel_requestor_empl_id,'')  AS created_by_user                                                  
     ,ISNULL(B.posting_status,'')    AS posting_status                                                  
     ,ISNULL(B.travel_justification,'')   AS detail_remarks                                                  
     ,CONVERT(varchar,DATEPART(yyyy,B.travel_datefiled_original))+'-'                                                  
      +RIGHT('00'+CONVERT(varchar,DATEPART(mm,B.travel_datefiled_original)),2)+'-'                                     
      +RIGHT('00'+CONVERT(varchar,DATEPART(dd,B.travel_datefiled_original)),2) AS travel_datefiled                                                  
                                                
    FROM HRIS_PAY.dbo.func_approval_worklist_travel_order(@par_user_id) A                                                
     INNER JOIN travelorder_hdr_tbl B                                                
      ON B.approval_id = A.approval_id                                                
    WHERE   YEAR(B.travel_datefiled_original) = @par_to_year                                                  
    --AND   MONTH(B.travel_datefiled)  = @par_to_month                                                 
    --AND   (B.department_code IN ('11','12','21','22','23','24'))                                        
    AND  (ISNULL(@par_to_month,'') = ''                                              
     OR @par_to_month <> ''                        
     AND MONTH(B.travel_datefiled_original) = @par_to_month                                                  
     )                                        
                                            
   AND  (ISNULL(@v_temp_dept,'') = ''                                              
    OR @v_temp_dept <> ''                                              
    AND B.department_code    = @v_temp_dept                                              
    )      
       
           
    UNION                                                  
     -- Transaction Status for Log in by Final Approver                                                  
    SELECT   DISTINCT                       
      ISNULL(A.approval_id,'')     AS approval_id                                     
     ,ISNULL(A.user_id_creator,'')    AS user_id_creator              
     ,ISNULL(A.empl_id,'')      AS empl_id_owner                                                  
     ,ISNULL(L.empl_id,'')      AS empl_id_creator                                                  
     ,A.approval_status       AS approval_status                                                 
     ,ISNULL(B.transaction_descr,'')    AS transaction_descr                                                  
     ,E.approval_status_descr     AS worklist_status                                                  
     ,CASE                                           
      WHEN  (A.approval_status  IN ('1') AND C.department_code NOT IN ('18','19')      
   AND ISNULL(C.to_emergency,0) = 0)                                        
  --THEN 'For Final Approval'    --REMOVE BY JORGE PGO FINAL APPROVER 2022-07-01       
  --sp_approval_worklist_travel_order 'U7999','','2022','07',''       
  THEN 'For Approval - Level 2'           
  WHEN (A.approval_status  IN ('1') AND C.department_code IN ('18','19')      
  OR ISNULL(C.to_emergency,0) = 1)       
    THEN  'For Final Approval'                  
      ELSE 'View Details'                                                  
     END           AS worklist_action                                                    
  ,CASE                                                 
     WHEN  (A.approval_status IN ('1') AND C.department_code NOT IN ('18','19')        
  AND ISNULL(C.to_emergency,0) = 0)                                  
    --THEN 'F'  --REMOVE BY JORGE PGO FINAL APPROVER 2022-07-01             
  THEN '2'           
  WHEN (A.approval_status  IN ('1') AND C.department_code IN ('18','19')      
  OR ISNULL(C.to_emergency,0) = 1)         
    THEN  'F'                                           
      ELSE ''                          
     END           AS next_status                             
      ,ISNULL(J.last_name,'NoLastName') + ', ' +  ISNULL(J.first_name,'NoFirstName') + ' '                                                
    + IIF(ISNULL(J.middle_name,'') = '', ' ', LEFT(J.middle_name,1) + '. ' )                                       
    + ISNULL(J.suffix_name,'')  as owner_name                                                     ,ISNULL(L.last_name,'NoLastName') + ', ' +  ISNULL(L.first_name,'NoFirstName') + ' '                                                
    + IIF(ISNULL(L.middle_name,'') = '', ' ', LEFT(L.middle_name,1) + '. ' )                                                
    + ISNULL(L.suffix_name,'')  as creator_name                                               
     ,ISNULL(A.reviewed_comment,'')    AS reviewed_comment                                                  
     ,ISNULL(A.level1_approval_comment,'')  AS level1_approval_comment                                                  
     ,ISNULL(A.level2_approval_comment,'')  AS level2_approval_comment                                                  
     ,ISNULL(A.final_approval_comment,'')  AS final_approval_comment                                                  
     ,ISNULL(A.disapproval_comment,'')   AS disapproval_comment                         
     ,ISNULL(A.cancel_pending_comment,'')  AS cancel_pending_comment                                                   
     ,ISNULL(A.cancelled_comment,'')    AS cancelled_comment                                                   
     ,ISNULL(C.travel_order_no,'')    AS application_nbr                                                  
     ,ISNULL(C.travel_requestor_empl_id,'')  AS created_by_user                                                  
     ,ISNULL(C.posting_status,'')    AS posting_status                                                  
     ,ISNULL(C.travel_justification,'')   AS detail_remarks                                                  
     ,CONVERT(varchar,DATEPART(yyyy,C.travel_datefiled_original))+'-'                                                  
     +RIGHT('00'+CONVERT(varchar,DATEPART(mm,C.travel_datefiled_original)),2)+'-'                       
     +RIGHT('00'+CONVERT(varchar,DATEPART(dd,C.travel_datefiled_original)),2)                                                   
      AS travel_datefiled                           
                                                
    FROM travelorder_hdr_tbl C                                                 
     INNER JOIN HRIS_PAY.dbo.approvalworkflow_tbl A                                                  
      ON A.approval_id = C.approval_id                   
                                                  
     INNER JOIN vw_approvalstatus_tbl E                                                  
      ON A.approval_status = E.approval_status                                                    
                                                 
     INNER JOIN HRIS_PAY.dbo.transactionsref_tbl B                                                  
      ON A.transaction_code = B.transaction_code                                                  
      AND A.transaction_code IN ('003')                                               
                                                  
     LEFT JOIN HRIS_PAY.dbo.vw_personnelnames_tbl J                                                  
      ON A.empl_id = J.empl_id                                                  
                                                  
     INNER JOIN HRIS_PAY.dbo.usersprofile_tbl D1                                                  
      ON  D1.user_id = A.user_id_creator                                                  
                                                  
     LEFT JOIN HRIS_PAY.dbo.vw_personnelnames_tbl L                                                  
      ON L.empl_id = D1.empl_id                                                  
                                                  
     INNER JOIN HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl Z                                                  
      ON  Z.empl_id = C.travel_requestor_empl_id                                                  
     AND Z.effective_date = (SELECT MAX(Z1.effective_date) FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl Z1                                                  
       WHERE Z1.empl_id  = Z.empl_id                                  
       AND Z1.emp_rcrd_status = 1)                                                  
      AND Z.emp_rcrd_status = 1                                
    LEFT JOIN HRIS_PAY.dbo.vw_payrollemployeemaster_asg_tbl X                            
   ON X.empl_id = Z.empl_id                                             
      --AND Z.department_code    IN ('11','12','21','22','23','24')                                              
 --LEFT JOIN travel_order_ldnf_tbl Y      
 --ON Y.travel_order_no = C.travel_order_no                                                
    WHERE                                         
-- A.user_id_final_approver = @par_user_id                                        
-- AND                                           
 --A.approval_status IN ('S','C','R','1','2','F','D','L')                                           
 (A.approval_status IN ('L','1','D') OR        
 (A.approval_status = 'F' AND ISNULL(C.to_emergency,0) = 0))      
          
    AND   B.with_self_service = 1                                                  
    AND   YEAR(C.travel_datefiled_original) = @par_to_year                                                
    --AND   MONTH(C.travel_datefiled) = @par_to_month                                          
    --AND   (Z.department_code = @par_department_code)                                                  
    --AND   (Z.employment_type = @par_employment_type)                                                 
    AND  (ISNULL(@par_to_month,'') = ''                                              
     OR @par_to_month <> ''                                               
     AND MONTH(C.travel_datefiled_original) = @par_to_month                                                  
     )                                              
    AND  (ISNULL(@v_temp_dept,'') = ''                                              
     OR @v_temp_dept <> ''                                            
     AND IIF(ISNULL(X.department_code,'')='',Z.department_code,X.department_code)  = @v_temp_dept                                              
     )        
        
   UNION                                                  
     -- Transaction Status for Log in by Level 2                                                
    SELECT   DISTINCT                                                
      ISNULL(A.approval_id,'')     AS approval_id                                     
     ,ISNULL(A.user_id_creator,'')    AS user_id_creator              
     ,ISNULL(A.empl_id,'')      AS empl_id_owner                                                  
     ,ISNULL(L.empl_id,'')      AS empl_id_creator                                                  
     ,'2'       AS approval_status                                   
     ,ISNULL(B.transaction_descr,'')    AS transaction_descr                                                  
     ,E.approval_status_descr     AS worklist_status                                                  
    ,'View Details'   AS worklist_action                                                        
  ,''    AS next_status                                  
      ,ISNULL(J.last_name,'NoLastName') + ', ' +  ISNULL(J.first_name,'NoFirstName') + ' '                                                
    + IIF(ISNULL(J.middle_name,'') = '', ' ', LEFT(J.middle_name,1) + '. ' )                                       
    + ISNULL(J.suffix_name,'')  as owner_name                                                 
    ,ISNULL(L.last_name,'NoLastName') + ', ' +  ISNULL(L.first_name,'NoFirstName') + ' '                                                
    + IIF(ISNULL(L.middle_name,'') = '', ' ', LEFT(L.middle_name,1) + '. ' )                                                
    + ISNULL(L.suffix_name,'')  as creator_name                                               
     ,ISNULL(A.reviewed_comment,'')    AS reviewed_comment                                                  
     ,ISNULL(A.level1_approval_comment,'')  AS level1_approval_comment                          
     ,ISNULL(A.level2_approval_comment,'')  AS level2_approval_comment                                                  
     ,ISNULL(A.final_approval_comment,'')  AS final_approval_comment                                                  
     ,ISNULL(A.disapproval_comment,'')   AS disapproval_comment                                                  
     ,ISNULL(A.cancel_pending_comment,'')  AS cancel_pending_comment                                                   
     ,ISNULL(A.cancelled_comment,'')    AS cancelled_comment                                                   
     ,ISNULL(C.travel_order_no,'')    AS application_nbr                                                  
     ,ISNULL(C.travel_requestor_empl_id,'')  AS created_by_user                                                  
     ,ISNULL(C.posting_status,'')    AS posting_status                                                  
     ,ISNULL(C.travel_justification,'')   AS detail_remarks                                                  
     ,CONVERT(varchar,DATEPART(yyyy,C.travel_datefiled_original))+'-'                                                  
     +RIGHT('00'+CONVERT(varchar,DATEPART(mm,C.travel_datefiled_original)),2)+'-'                                                  
     +RIGHT('00'+CONVERT(varchar,DATEPART(dd,C.travel_datefiled_original)),2)                                                   
      AS travel_datefiled                           
                                                
    FROM travelorder_hdr_tbl C                                                 
     INNER JOIN HRIS_PAY.dbo.approvalworkflow_tbl A                                                  
      ON A.approval_id = C.approval_id                   
                                                  
     INNER JOIN vw_approvalstatus_tbl E                                                  
      ON A.approval_status = E.approval_status                                                    
                                                  
     INNER JOIN HRIS_PAY.dbo.transactionsref_tbl B                                                  
      ON A.transaction_code = B.transaction_code                                                  
      AND A.transaction_code IN ('003')                                               
                                                  
     LEFT JOIN HRIS_PAY.dbo.vw_personnelnames_tbl J                                                  
      ON A.empl_id = J.empl_id                                                  
                                                  
     INNER JOIN HRIS_PAY.dbo.usersprofile_tbl D1                                                  
      ON  D1.user_id = A.user_id_creator                                                  
                                                  
     LEFT JOIN HRIS_PAY.dbo.vw_personnelnames_tbl L                                                  
      ON L.empl_id = D1.empl_id                                                  
                                                  
     INNER JOIN HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl Z                                                  
      ON  Z.empl_id = C.travel_requestor_empl_id                                                  
     AND Z.effective_date = (SELECT MAX(Z1.effective_date) FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl Z1                                                  
       WHERE Z1.empl_id  = Z.empl_id                                                  
       AND Z1.emp_rcrd_status = 1)                                                  
      AND Z.emp_rcrd_status = 1                                
    LEFT JOIN HRIS_PAY.dbo.vw_payrollemployeemaster_asg_tbl X                            
   ON X.empl_id = Z.empl_id                                             
      --AND Z.department_code    IN ('11','12','21','22','23','24')                                              
           
    WHERE                                         
-- A.user_id_final_approver = @par_user_id                                        
-- AND                                           
 --A.approval_status IN ('S','C','R','1','2','F','D','L')                                           
 --A.approval_status IN ('2','F')        
    A.approval_status IN ('2')       
    AND   B.with_self_service = 1                                                  
    AND   YEAR(C.travel_datefiled_original) = @par_to_year                                                
    --AND   MONTH(C.travel_datefiled) = @par_to_month                                          
    --AND   (Z.department_code = @par_department_code)                                                  
    --AND   (Z.employment_type = @par_employment_type)                                                 
    AND  (ISNULL(@par_to_month,'') = ''                                              
     OR @par_to_month <> ''                                               
     AND MONTH(C.travel_datefiled_original) = @par_to_month                                                  
     )               
    AND  (ISNULL(@v_temp_dept,'') = ''                                              
     OR @v_temp_dept <> ''                                            
     AND IIF(ISNULL(X.department_code,'')='',Z.department_code,X.department_code)  = @v_temp_dept                                              
     )        
            
    -- UNION TO PAYROLL EMPLOYEE MASTER ASSIGNED TABLE                                              
    UNION                                              
    SELECT  DISTINCT                                             
      ISNULL(A.approval_id,'')     AS approval_id                                                  
     ,ISNULL(A.user_id_creator,'')    AS user_id_creator                                                  
     ,ISNULL(A.empl_id,'')      AS empl_id_owner                                                  
     ,ISNULL(A.empl_id_creator,'')    AS empl_id_creator                                         
     ,B.approval_status       AS approval_status                                                  
     ,ISNULL(A.transaction_descr,'')    AS transaction_descr                                                 
     ,A.worklist_status       AS worklist_status                                                
     --,A.worklist_action                                                
     ,CASE                                                
      WHEN ( SELECT                            
      COUNT(M.workflow_authority)                                              
    FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
      WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                         
      AND M.transaction_code = '003'                                              
     ) > 1                                              
      THEN (                                              
      CASE ( SELECT TOP 1                                              
     M.workflow_authority                                              
     FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
     WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
     AND M.transaction_code = '003'                                              
     ORDER BY M.workflow_authority DESC                                              
       )                                             
       WHEN '1' THEN 'For Approval - Level 1'                                              
       WHEN '2'         
   THEN CASE         
     WHEN B.department_code NOT IN ('18','19')        
       THEN 'For Approval - Level 2'          
     ELSE 'For Final Approval'          
    END                                            
       ELSE 'For Final Approval'                                          
END                                              
     )                                              
      ELSE A.worklist_action                                              
     END          AS worklist_action                                               
     --,IIF (RIGHT(A.transaction_page_name,1) = '=','',RIGHT(A.transaction_page_name,1)) AS next_status                                                  
     ,CASE                                                
      WHEN ( SELECT                                              
      COUNT(M.workflow_authority)                                              
      FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
      WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
      AND M.transaction_code = '003'                                              
     ) > 1                                              
      THEN (                                              
      CASE ( SELECT TOP 1                                              
     M.workflow_authority                                             
     FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
     WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
     AND M.transaction_code = '003'                                              
     ORDER BY M.workflow_authority DESC                                              
       )                                              
       WHEN '1' THEN '1'                                              
       WHEN '2'         
   THEN CASE         
     WHEN B.department_code NOT IN ('18','19')        
       THEN '2'          
     ELSE 'F'          
    END                                                       
       ELSE 'F'                                              
      END                                              
     )                                              
      ELSE (                                              
      IIF (RIGHT(A.transaction_page_name,1) = '=','',RIGHT(A.transaction_page_name,1))                                              
     )                                              
     END           AS next_status                                               
     ,ISNULL(A.owner_name,'')     AS owner_name                                                   
     ,ISNULL(A.creator_name,'')     AS creator_name                                                   
     ,ISNULL(A.reviewed_comment,'')    AS reviewed_comment                                                  
     ,ISNULL(A.level1_approval_comment,'')  AS level1_approval_comment                                                  
     ,ISNULL(A.level2_approval_comment,'')  AS level2_approval_comment                                                  
     ,ISNULL(A.final_approval_comment,'')  AS final_approval_comment                                                  
     ,ISNULL(A.disapproval_comment,'')   AS disapproval_comment                                                  
     ,ISNULL(A.cancel_pending_comment,'')  AS cancel_pending_comment                                                   
     ,ISNULL(A.cancelled_comment,'')    AS cancelled_comment                                                   
     ,ISNULL(B.travel_order_no,'')    AS application_nbr                                                  
     ,ISNULL(B.travel_requestor_empl_id,'')  AS created_by_user                                                  
     ,ISNULL(B.posting_status,'')    AS posting_status                                                  
     ,ISNULL(B.travel_justification,'')   AS detail_remarks                                                  
    ,CONVERT(varchar,DATEPART(yyyy,B.travel_datefiled_original))+'-'                                                  
      +RIGHT('00'+CONVERT(varchar,DATEPART(mm,B.travel_datefiled_original)),2)+'-'                     
      +RIGHT('00'+CONVERT(varchar,DATEPART(dd,B.travel_datefiled_original)),2) AS travel_datefiled                                                  
                              
    FROM HRIS_PAY.dbo.func_approval_worklist_travel_order(@par_user_id) A                                                
     INNER JOIN travelorder_hdr_tbl B                                                
      ON B.approval_id = A.approval_id                                                
    WHERE YEAR(B.travel_datefiled_original) = @par_to_year                                        
    --AND   MONTH(B.travel_datefiled)  = @par_to_month                                                 
    AND  (ISNULL(@par_to_month,'') = ''                                              
     OR @par_to_month <> ''                                               
     AND MONTH(B.travel_datefiled_original) = @par_to_month          
     )                                              
    AND   (A.empl_id IN (SELECT                                               
      X1.empl_id                                               
      FROM HRIS_PAY.dbo.payrollemployeemaster_asg_tbl X1                                              
      WHERE                                         
   X1.department_code = @v_temp_dept                                    
    AND B.approval_status IN ('F','L','1','D')                                       
      AND                                         
   X1.ss_appl_flag = 1                                              
      AND X1.effective_date = (SELECT                                               
      MAX(X2.effective_date)                                               
      FROM HRIS_PAY.dbo.payrollemployeemaster_asg_tbl X2                                                
      WHERE X2.empl_id  = X1.empl_id)))                                              
      --AND X1.employment_type = @par_employment_type))                                       
   ) AS MN                           
    INNER JOIN HRIS_PAY.dbo.approvalworkflow_tbl Z                          
 ON Z.approval_id = MN.approval_id          
 INNER JOIN HRIS_ATS.dbo.travelorder_hdr_tbl Z1        
 ON Z1.travel_order_no = MN.application_nbr        
 INNER JOIN HRIS_PAY.dbo.vw_departments_tbl_list D        
 ON D.department_code = Z1.department_code        
        
 WHERE  Z1.department_code IN ('11','12','21','22','23','24','20','18','19')          
          
  UNION        
        
  SELECT                           
 MN.*,         
  D.department_code,        
 D.department_short_name AS department_name1,                                
     CONVERT(varchar, DATEPART(yyyy, Z.reviewed_date)) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(mm, Z.reviewed_date)),2) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(dd, Z.reviewed_date)),2)                                  
     AS reviewed_date                          
  ,Z.user_id_reviewer                          
  ,CONVERT(varchar, DATEPART(yyyy, Z.level1_approval_date)) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(mm, Z.level1_approval_date)),2) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(dd, Z.level1_approval_date)),2)                                  
     AS level1_approval_date                          
   ,Z.user_id_level1_approver             
   ,CONVERT(varchar, DATEPART(yyyy, Z.level2_approval_date)) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(mm, Z.level2_approval_date)),2) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(dd, Z.level2_approval_date)),2)                                  
     AS level2_approval_date                          
  ,Z.user_id_level2_approver                       
  ,CONVERT(varchar, DATEPART(yyyy, Z.final_approval_date)) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(mm, Z.final_approval_date)),2) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(dd, Z.final_approval_date)),2)             
     AS final_approval_date                          
  ,Z.user_id_final_approver                          
                           
  FROM (                                      
   SELECT DISTINCT                                                 
      ISNULL(A.approval_id,'')   AS approval_id                                                  
     ,ISNULL(A.user_id_creator,'')  AS user_id_creator                                                  
     ,ISNULL(A.empl_id,'')    AS empl_id_owner                                                  
     ,ISNULL(A.empl_id_creator,'')  AS empl_id_creator                                                 
     ,B.approval_status     AS approval_status                                                  
  ,ISNULL(A.transaction_descr,'')    AS transaction_descr                                                 
     ,A.worklist_status     AS worklist_status                                                
     --,A.worklist_action                                                 
     ,CASE                                                
      WHEN ( SELECT                                         
      COUNT(M.workflow_authority)                                              
      FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                     
      WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
      AND M.transaction_code = '003'                                              
     ) > 1                                              
      THEN (                                              
      CASE ( SELECT TOP 1                                              
     M.workflow_authority                                              
     FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
     WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
     AND M.transaction_code = '003'                                              
     ORDER BY M.workflow_authority DESC                                              
       )                                              
       WHEN '1' THEN 'For Approval - Level 1'                                              
       WHEN '2' THEN 'For Approval - Level 2'                                              
       ELSE 'For Final Approval'                                              
      END                                              
     )                                              
      ELSE A.worklist_action                                              
     END          AS worklist_action                                              
     --,IIF (RIGHT(A.transaction_page_name,1) = '=','',RIGHT(A.transaction_page_name,1)) AS next_status                        
     ,CASE                                                
      WHEN ( SELECT                                              
      COUNT(M.workflow_authority)                                              
      FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
      WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
      AND M.transaction_code = '003'                                              
     ) > 1                                              
      THEN (                                              
      CASE ( SELECT TOP 1                                              
     M.workflow_authority                                              
     FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
     WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')           
     AND M.transaction_code = '003'                                              
     ORDER BY M.workflow_authority DESC                                              
       )                                              
       WHEN '1' THEN '1'                                              
       WHEN '2' THEN '2'                                              
       ELSE 'F'                                              
 END                                          
     )                                              
      ELSE (                                              
      IIF (RIGHT(A.transaction_page_name,1) = '=','',RIGHT(A.transaction_page_name,1))                                              
     )                                              
     END          AS next_status                         
     ,ISNULL(A.owner_name,'')     AS owner_name                                                   
     ,ISNULL(A.creator_name,'')     AS creator_name                                                   
     ,ISNULL(A.reviewed_comment,'')    AS reviewed_comment                                                  
     ,ISNULL(A.level1_approval_comment,'')   AS level1_approval_comment                                                  
     ,ISNULL(A.level2_approval_comment,'')   AS level2_approval_comment                           
     ,ISNULL(A.final_approval_comment,'')  AS final_approval_comment                                                  
     ,ISNULL(A.disapproval_comment,'')   AS disapproval_comment                                                  
     ,ISNULL(A.cancel_pending_comment,'')  AS cancel_pending_comment                
     ,ISNULL(A.cancelled_comment,'')   AS cancelled_comment                                                   
     ,ISNULL(B.travel_order_no,'')    AS application_nbr                                                  
     ,ISNULL(B.travel_requestor_empl_id,'')  AS created_by_user                                                  
     ,ISNULL(B.posting_status,'')    AS posting_status                                                  
     ,ISNULL(B.travel_justification,'')   AS detail_remarks                                                  
     ,CONVERT(varchar,DATEPART(yyyy,B.travel_datefiled_original))+'-'                                                  
      +RIGHT('00'+CONVERT(varchar,DATEPART(mm,B.travel_datefiled_original)),2)+'-'                                             
      +RIGHT('00'+CONVERT(varchar,DATEPART(dd,B.travel_datefiled_original)),2) AS travel_datefiled                                                  
                                                
    FROM HRIS_PAY.dbo.func_approval_worklist_travel_order('U7999') A                                                
     INNER JOIN travelorder_hdr_tbl B                                                
      ON B.approval_id = A.approval_id                                                
    WHERE   YEAR(B.travel_datefiled_original) = @par_to_year                                                  
    --AND   MONTH(B.travel_datefiled)  = @par_to_month                                                 
    --AND   (B.department_code IN ('11','12','21','22','23','24'))                                                
    AND  (ISNULL(@par_to_month,'') = ''                                              
     OR @par_to_month <> ''                        
     AND MONTH(B.travel_datefiled_original) = @par_to_month                                                  
     )                                        
                                            
   AND  (ISNULL(@v_temp_dept,'') = ''                                              
    OR @v_temp_dept<> ''                                              
    AND B.department_code    = @v_temp_dept                                             
    )                                                
                                                 
    UNION                                                  
     -- Transaction Status for Log in by Final Approver                                                  
    SELECT   DISTINCT                                                
      ISNULL(A.approval_id,'')     AS approval_id                                     
     ,ISNULL(A.user_id_creator,'')    AS user_id_creator              
     ,ISNULL(A.empl_id,'')      AS empl_id_owner                                                  
     ,ISNULL(L.empl_id,'')      AS empl_id_creator                                                  
     ,A.approval_status       AS approval_status                                                 
     ,ISNULL(B.transaction_descr,'')    AS transaction_descr                                                  
     ,E.approval_status_descr     AS worklist_status                                                  
     ,CASE                                           
      WHEN  A.approval_status  IN ('1')                                         
  --THEN 'For Final Approval'    --REMOVE BY JORGE PGO FINAL APPROVER 2022-07-01        
  THEN 'For Approval - Level 2'                
      ELSE 'View Details'                                                  
     END           AS worklist_action                                                    
  ,CASE                                                 
     WHEN  A.approval_status IN ('1')                                       
    --THEN 'F'  --REMOVE BY JORGE PGO FINAL APPROVER 2022-07-01             
  THEN '2'                                    
      ELSE ''                          
     END           AS next_status                             
      ,ISNULL(J.last_name,'NoLastName') + ', ' +  ISNULL(J.first_name,'NoFirstName') + ' '                                                
    + IIF(ISNULL(J.middle_name,'') = '', ' ', LEFT(J.middle_name,1) + '. ' )                                       
    + ISNULL(J.suffix_name,'')  as owner_name              
    ,ISNULL(L.last_name,'NoLastName') + ', ' +  ISNULL(L.first_name,'NoFirstName') + ' '                                                
    + IIF(ISNULL(L.middle_name,'') = '', ' ', LEFT(L.middle_name,1) + '. ' )                                                
    + ISNULL(L.suffix_name,'')  as creator_name                                               
     ,ISNULL(A.reviewed_comment,'')    AS reviewed_comment                                                  
     ,ISNULL(A.level1_approval_comment,'')  AS level1_approval_comment                                                  
     ,ISNULL(A.level2_approval_comment,'')  AS level2_approval_comment                                                  
     ,ISNULL(A.final_approval_comment,'')  AS final_approval_comment                                                  
     ,ISNULL(A.disapproval_comment,'')   AS disapproval_comment                                                  
     ,ISNULL(A.cancel_pending_comment,'')  AS cancel_pending_comment                                                   
     ,ISNULL(A.cancelled_comment,'')    AS cancelled_comment                                                   
     ,ISNULL(C.travel_order_no,'')    AS application_nbr                                                  
     ,ISNULL(C.travel_requestor_empl_id,'')  AS created_by_user                                                  
     ,ISNULL(C.posting_status,'')    AS posting_status                                                  
     ,ISNULL(C.travel_justification,'')   AS detail_remarks                                                  
     ,CONVERT(varchar,DATEPART(yyyy,C.travel_datefiled_original))+'-'                                                  
     +RIGHT('00'+CONVERT(varchar,DATEPART(mm,C.travel_datefiled_original)),2)+'-'                                                  
     +RIGHT('00'+CONVERT(varchar,DATEPART(dd,C.travel_datefiled_original)),2)                                                   
      AS travel_datefiled                           
                                                
    FROM travelorder_hdr_tbl C                                                 
     INNER JOIN HRIS_PAY.dbo.approvalworkflow_tbl A                                                  
      ON A.approval_id = C.approval_id                   
                                                  
     INNER JOIN vw_approvalstatus_tbl E                                                  
      ON A.approval_status = E.approval_status                                                    
                                                  
     INNER JOIN HRIS_PAY.dbo.transactionsref_tbl B                                                  
      ON A.transaction_code = B.transaction_code                                                  
      AND A.transaction_code IN ('003')                                               
                                                  
     LEFT JOIN HRIS_PAY.dbo.vw_personnelnames_tbl J                                                  
      ON A.empl_id = J.empl_id                                                  
                                                  
     INNER JOIN HRIS_PAY.dbo.usersprofile_tbl D1                                                  
      ON  D1.user_id = A.user_id_creator                                                  
                                                  
     LEFT JOIN HRIS_PAY.dbo.vw_personnelnames_tbl L                                                  
      ON L.empl_id = D1.empl_id                                                  
                                                  
     INNER JOIN HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl Z                                                  
      ON  Z.empl_id = C.travel_requestor_empl_id                                                  
     AND Z.effective_date = (SELECT MAX(Z1.effective_date) FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl Z1                                                  
       WHERE Z1.empl_id  = Z.empl_id                                                  
       AND Z1.emp_rcrd_status = 1)                                                  
      AND Z.emp_rcrd_status = 1                                
    LEFT JOIN HRIS_PAY.dbo.vw_payrollemployeemaster_asg_tbl X                            
   ON X.empl_id = Z.empl_id                                             
      --AND Z.department_code    IN ('11','12','21','22','23','24')                                              
                                                  
    WHERE                                         
-- A.user_id_final_approver = 'U7999'                                        
-- AND                                           
 --A.approval_status IN ('S','C','R','1','2','F','D','L')                                           
 A.approval_status IN ('F','L','1','D')        
            
    AND   B.with_self_service = 1                                                  
    AND   YEAR(C.travel_datefiled_original) = @par_to_year                                                
    --AND   MONTH(C.travel_datefiled) = @par_to_month                                          
    --AND   (Z.department_code = @par_department_code)                                                  
    --AND   (Z.employment_type = @par_employment_type)                                                 
    AND  (ISNULL(@par_to_month,'') = ''                                              
     OR @par_to_month <> ''                                               
     AND MONTH(C.travel_datefiled_original) = @par_to_month                                                  
     )                                              
    AND  (ISNULL(@v_temp_dept,'') = ''                                              
     OR @v_temp_dept<> ''                                            
     AND IIF(ISNULL(X.department_code,'')='',Z.department_code,X.department_code)  = @v_temp_dept                                             
     )        
        
   UNION                                                  
     -- Transaction Status for Log in by Level 2                                                
    SELECT   DISTINCT                                                
      ISNULL(A.approval_id,'')     AS approval_id                                     
     ,ISNULL(A.user_id_creator,'')    AS user_id_creator              
     ,ISNULL(A.empl_id,'')      AS empl_id_owner                                                  
     ,ISNULL(L.empl_id,'')      AS empl_id_creator                                                  
     ,'2'       AS approval_status                                   
     ,ISNULL(B.transaction_descr,'')    AS transaction_descr                                                  
     ,E.approval_status_descr     AS worklist_status                                                  
    ,'View Details'   AS worklist_action                                                        
  ,''    AS next_status                                  
      ,ISNULL(J.last_name,'NoLastName') + ', ' +  ISNULL(J.first_name,'NoFirstName') + ' '                                                
    + IIF(ISNULL(J.middle_name,'') = '', ' ', LEFT(J.middle_name,1) + '. ' )                                       
    + ISNULL(J.suffix_name,'')  as owner_name                                                 
    ,ISNULL(L.last_name,'NoLastName') + ', ' +  ISNULL(L.first_name,'NoFirstName') + ' '                                                
    + IIF(ISNULL(L.middle_name,'') = '', ' ', LEFT(L.middle_name,1) + '. ' )                                                
    + ISNULL(L.suffix_name,'')  as creator_name                                               
     ,ISNULL(A.reviewed_comment,'')    AS reviewed_comment                                                  
     ,ISNULL(A.level1_approval_comment,'')  AS level1_approval_comment                                                  
     ,ISNULL(A.level2_approval_comment,'')  AS level2_approval_comment                                                  
     ,ISNULL(A.final_approval_comment,'')  AS final_approval_comment                                                  
     ,ISNULL(A.disapproval_comment,'')   AS disapproval_comment                                                  
     ,ISNULL(A.cancel_pending_comment,'')  AS cancel_pending_comment                                                   
     ,ISNULL(A.cancelled_comment,'')    AS cancelled_comment                                                   
     ,ISNULL(C.travel_order_no,'')    AS application_nbr                                                  
     ,ISNULL(C.travel_requestor_empl_id,'')  AS created_by_user                                                  
     ,ISNULL(C.posting_status,'')    AS posting_status                                                  
     ,ISNULL(C.travel_justification,'')   AS detail_remarks                                                  
     ,CONVERT(varchar,DATEPART(yyyy,C.travel_datefiled_original))+'-'                                                  
     +RIGHT('00'+CONVERT(varchar,DATEPART(mm,C.travel_datefiled_original)),2)+'-'                                                  
     +RIGHT('00'+CONVERT(varchar,DATEPART(dd,C.travel_datefiled_original)),2)                                                   
      AS travel_datefiled                           
                                                
    FROM travelorder_hdr_tbl C                                                 
     INNER JOIN HRIS_PAY.dbo.approvalworkflow_tbl A                                                  
      ON A.approval_id = C.approval_id                   
                                                  
     INNER JOIN vw_approvalstatus_tbl E                                                  
      ON A.approval_status = E.approval_status          
                                                  
     INNER JOIN HRIS_PAY.dbo.transactionsref_tbl B                                                  
      ON A.transaction_code = B.transaction_code                                                  
      AND A.transaction_code IN ('003')                                  
                                                  
     LEFT JOIN HRIS_PAY.dbo.vw_personnelnames_tbl J                                                  
      ON A.empl_id = J.empl_id                                                  
                                                  
     INNER JOIN HRIS_PAY.dbo.usersprofile_tbl D1                                                  
      ON  D1.user_id = A.user_id_creator                                                  
                                                  
     LEFT JOIN HRIS_PAY.dbo.vw_personnelnames_tbl L                                                  
      ON L.empl_id = D1.empl_id                                                  
                                                  
     INNER JOIN HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl Z                                                  
      ON  Z.empl_id = C.travel_requestor_empl_id                                                  
     AND Z.effective_date = (SELECT MAX(Z1.effective_date) FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl Z1                                                  
       WHERE Z1.empl_id  = Z.empl_id                                                  
       AND Z1.emp_rcrd_status = 1)                                                  
      AND Z.emp_rcrd_status = 1                                
    LEFT JOIN HRIS_PAY.dbo.vw_payrollemployeemaster_asg_tbl X                            
   ON X.empl_id = Z.empl_id                                             
      --AND Z.department_code    IN ('11','12','21','22','23','24')                                              
                                                  
    WHERE                                         
-- A.user_id_final_approver = 'U7999'                                        
-- AND                                           
 --A.approval_status IN ('S','C','R','1','2','F','D','L')                                           
 --A.approval_status IN ('2','F')        
   A.approval_status IN ('2')           
    AND   B.with_self_service = 1                                                  
    AND   YEAR(C.travel_datefiled_original) = @par_to_year                                                
    --AND   MONTH(C.travel_datefiled) = @par_to_month                                          
    --AND   (Z.department_code = @par_department_code)                                                  
    --AND   (Z.employment_type = @par_employment_type)                                                 
    AND  (ISNULL(@par_to_month,'') = ''                                              
     OR @par_to_month <> ''                                        
     AND MONTH(C.travel_datefiled_original) = @par_to_month                                                  
     )                                              
    AND  (ISNULL(@v_temp_dept,'') = ''                                              
     OR @v_temp_dept<> ''                                            
     AND IIF(ISNULL(X.department_code,'')='',Z.department_code,X.department_code)  = @v_temp_dept                                             
     )        
            
    -- UNION TO PAYROLL EMPLOYEE MASTER ASSIGNED TABLE                                              
    UNION                                              
    SELECT  DISTINCT                                             
      ISNULL(A.approval_id,'')     AS approval_id                                                  
     ,ISNULL(A.user_id_creator,'')    AS user_id_creator                                                  
     ,ISNULL(A.empl_id,'')      AS empl_id_owner                                                  
     ,ISNULL(A.empl_id_creator,'')    AS empl_id_creator                                         
     ,B.approval_status       AS approval_status           
     ,ISNULL(A.transaction_descr,'')    AS transaction_descr                                                 
     ,A.worklist_status       AS worklist_status                                                
     --,A.worklist_action                                                
     ,CASE                                                
      WHEN ( SELECT                            
      COUNT(M.workflow_authority)                                              
    FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
      WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                         
      AND M.transaction_code = '003'                                              
     ) > 1                                              
      THEN (                                              
      CASE ( SELECT TOP 1                                              
     M.workflow_authority                                              
     FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
     WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
     AND M.transaction_code = '003'                                              
     ORDER BY M.workflow_authority DESC                                              
       )                                              
       WHEN '1' THEN 'For Approval - Level 1'                                              
       WHEN '2' THEN 'For Approval - Level 2'                                              
       ELSE 'For Final Approval'                                          
      END                                              
     )                                              
      ELSE A.worklist_action                                              
     END          AS worklist_action                                               
     --,IIF (RIGHT(A.transaction_page_name,1) = '=','',RIGHT(A.transaction_page_name,1)) AS next_status                                                  
     ,CASE                                                
      WHEN ( SELECT                                    
      COUNT(M.workflow_authority)                                              
      FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
      WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
      AND M.transaction_code = '003'                                              
     ) > 1                                              
      THEN (                                              
      CASE ( SELECT TOP 1                                              
     M.workflow_authority                                             
     FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
     WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
     AND M.transaction_code = '003'                                              
     ORDER BY M.workflow_authority DESC                                              
       )                                              
       WHEN '1' THEN '1'                                              
       WHEN '2' THEN '2'                                              
       ELSE 'F'                                              
      END                                              
     )                                              
      ELSE (                                              
      IIF (RIGHT(A.transaction_page_name,1) = '=','',RIGHT(A.transaction_page_name,1))                                              
     )                                              
     END           AS next_status                                               
     ,ISNULL(A.owner_name,'')     AS owner_name                                                   
     ,ISNULL(A.creator_name,'')     AS creator_name                                                   
     ,ISNULL(A.reviewed_comment,'')    AS reviewed_comment                       
     ,ISNULL(A.level1_approval_comment,'')  AS level1_approval_comment                                                  
     ,ISNULL(A.level2_approval_comment,'')  AS level2_approval_comment                                                  
     ,ISNULL(A.final_approval_comment,'')  AS final_approval_comment                                                  
     ,ISNULL(A.disapproval_comment,'')   AS disapproval_comment                                                  
     ,ISNULL(A.cancel_pending_comment,'')  AS cancel_pending_comment                                                   
     ,ISNULL(A.cancelled_comment,'')    AS cancelled_comment                                                   
     ,ISNULL(B.travel_order_no,'')    AS application_nbr                                                  
     ,ISNULL(B.travel_requestor_empl_id,'')  AS created_by_user                                                  
     ,ISNULL(B.posting_status,'')    AS posting_status                                                  
     ,ISNULL(B.travel_justification,'')   AS detail_remarks                                                  
    ,CONVERT(varchar,DATEPART(yyyy,B.travel_datefiled_original))+'-'                                                  
      +RIGHT('00'+CONVERT(varchar,DATEPART(mm,B.travel_datefiled_original)),2)+'-'                                                  
      +RIGHT('00'+CONVERT(varchar,DATEPART(dd,B.travel_datefiled_original)),2) AS travel_datefiled                                                  
                              
    FROM HRIS_PAY.dbo.func_approval_worklist_travel_order(@par_user_id) A                                                
     INNER JOIN travelorder_hdr_tbl B                                                
      ON B.approval_id = A.approval_id                                                
    WHERE YEAR(B.travel_datefiled_original) = @par_to_year                                        
    --AND   MONTH(B.travel_datefiled)  = @par_to_month                                                 
    AND  (ISNULL(@par_to_month,'') = ''                                              
     OR @par_to_month <> ''                                               
     AND MONTH(B.travel_datefiled_original) = @par_to_month                                                  
     )                                              
    AND   (A.empl_id IN (SELECT                                               
      X1.empl_id                                               
      FROM HRIS_PAY.dbo.payrollemployeemaster_asg_tbl X1                                              
      WHERE                                         
   X1.department_code = @v_temp_dept                                   
    AND B.approval_status IN ('F','L','1','D')                                       
      AND                                         
   X1.ss_appl_flag = 1                                              
      AND X1.effective_date = (SELECT                                               
      MAX(X2.effective_date)                                               
      FROM HRIS_PAY.dbo.payrollemployeemaster_asg_tbl X2                                                
      WHERE X2.empl_id  = X1.empl_id)))                                              
      --AND X1.employment_type = @par_employment_type))                                       
   ) AS MN                           
    INNER JOIN HRIS_PAY.dbo.approvalworkflow_tbl Z                          
 ON Z.approval_id = MN.approval_id          
 INNER JOIN HRIS_ATS.dbo.travelorder_hdr_tbl Z1        
 ON Z1.travel_order_no = MN.application_nbr        
 INNER JOIN HRIS_PAY.dbo.vw_departments_tbl_list D        
 ON D.department_code = Z1.department_code        
        
 WHERE MN.approval_status IN ('F','L','D')    
                                     
   --ORDER BY MN.travel_datefiled DESC          
  ) AS MN1        
                                     
   ORDER BY MN1.travel_datefiled DESC                                      
 END           
         
 ELSE IF (@par_department_code = '01'         
 AND @par_user_id IN ('U10063','U6563'))        
 OR @par_user_id IN ('U2089','U8447','U2003')  -- PGO Can Approve All Department - Remove All Whereclause (Departmet Code)                      
 BEGIN                                        
 SELECT                           
 MN.*,                              
     CONVERT(varchar, DATEPART(yyyy, Z.reviewed_date)) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(mm, Z.reviewed_date)),2) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(dd, Z.reviewed_date)),2)                                  
     AS reviewed_date                          
  ,Z.user_id_reviewer                          
  ,CONVERT(varchar, DATEPART(yyyy, Z.level1_approval_date)) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(mm, Z.level1_approval_date)),2) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(dd, Z.level1_approval_date)),2)                                  
     AS level1_approval_date                          
   ,Z.user_id_level1_approver             
   ,CONVERT(varchar, DATEPART(yyyy, Z.level2_approval_date)) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(mm, Z.level2_approval_date)),2) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(dd, Z.level2_approval_date)),2)                                  
     AS level2_approval_date                          
  ,Z.user_id_level2_approver                       
  ,CONVERT(varchar, DATEPART(yyyy, Z.final_approval_date)) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(mm, Z.final_approval_date)),2) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(dd, Z.final_approval_date)),2)             
     AS final_approval_date                          
  ,Z.user_id_final_approver                          
    ,D.department_code        
 ,D.department_short_name AS department_name1                         
  FROM (                                      
   SELECT DISTINCT                                                 
      ISNULL(A.approval_id,'')   AS approval_id                                                  
     ,ISNULL(A.user_id_creator,'')  AS user_id_creator                                                  
     ,ISNULL(A.empl_id,'')    AS empl_id_owner                                                  
     ,ISNULL(A.empl_id_creator,'')  AS empl_id_creator                                                 
     ,B.approval_status     AS approval_status                                                  
     ,ISNULL(A.transaction_descr,'')    AS transaction_descr                                                 
     ,A.worklist_status     AS worklist_status                                                
     --,A.worklist_action                                                 
     ,CASE                                                
      WHEN ( SELECT                                              
      COUNT(M.workflow_authority)                                              
      FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
      WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
      AND M.transaction_code = '003'                                              
     ) > 1                                              
      THEN (                               
      CASE ( SELECT TOP 1                                              
     M.workflow_authority                                              
     FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
     WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
     AND M.transaction_code = '003'                                              
     ORDER BY M.workflow_authority DESC                                              
       )                                              
       WHEN '1' THEN 'For Approval - Level 1'                                              
       --WHEN '2' THEN 'For Approval - Level 2'         
    WHEN '2' THEN 'For Final Approval'                                            
       ELSE 'For Final Approval'                                              
      END                                              
     )                                              
      ELSE A.worklist_action                                              
     END          AS worklist_action                                              
     --,IIF (RIGHT(A.transaction_page_name,1) = '=','',RIGHT(A.transaction_page_name,1)) AS next_status                                                  
     ,CASE                                                
      WHEN ( SELECT                                              
      COUNT(M.workflow_authority)                                              
      FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
      WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
      AND M.transaction_code = '003'                                              
     ) > 1                                              
      THEN (                                              
      CASE ( SELECT TOP 1                                              
     M.workflow_authority                                              
     FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
     WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')           
     AND M.transaction_code = '003'                                              
     ORDER BY M.workflow_authority DESC )                                              
       WHEN '1' THEN '1'                                              
       --WHEN '2' THEN '2'        
       WHEN '2' THEN 'F'                                               
       ELSE 'F'                                              
       END                                          
          )                            
      ELSE (                                              
      IIF (RIGHT(A.transaction_page_name,1) = '=','',RIGHT(A.transaction_page_name,1))                                              
     )                                              
     END          AS next_status                         
     ,ISNULL(A.owner_name,'')     AS owner_name                                                   
     ,ISNULL(A.creator_name,'')     AS creator_name                                                   
     ,ISNULL(A.reviewed_comment,'')    AS reviewed_comment                                                  
     ,ISNULL(A.level1_approval_comment,'')   AS level1_approval_comment                                                  
     ,ISNULL(A.level2_approval_comment,'')   AS level2_approval_comment                           
     ,ISNULL(A.final_approval_comment,'')  AS final_approval_comment                                                  
     ,ISNULL(A.disapproval_comment,'')   AS disapproval_comment                                                  
     ,ISNULL(A.cancel_pending_comment,'')  AS cancel_pending_comment                                                   
     ,ISNULL(A.cancelled_comment,'')   AS cancelled_comment                                                   
     ,ISNULL(B.travel_order_no,'')    AS application_nbr                                                  
     ,ISNULL(B.travel_requestor_empl_id,'')  AS created_by_user                                                  
     ,ISNULL(B.posting_status,'')    AS posting_status                                               
     ,ISNULL(B.travel_justification,'')   AS detail_remarks                                  
     ,CONVERT(varchar,DATEPART(yyyy,B.travel_datefiled_original))+'-'                                                  
      +RIGHT('00'+CONVERT(varchar,DATEPART(mm,B.travel_datefiled_original)),2)+'-'                                             
      +RIGHT('00'+CONVERT(varchar,DATEPART(dd,B.travel_datefiled_original)),2) AS travel_datefiled                                                  
                                                
    FROM HRIS_PAY.dbo.func_approval_worklist_travel_order(@par_user_id) A                                                
     INNER JOIN travelorder_hdr_tbl B                                  
      ON B.approval_id = A.approval_id                                                
    WHERE   YEAR(B.travel_datefiled_original) = @par_to_year                                                  
    --AND   MONTH(B.travel_datefiled)  = @par_to_month                                                 
    --AND   (B.department_code IN ('11','12','21','22','23','24'))                                                
    AND  (ISNULL(@par_to_month,'') = ''                                              
     OR @par_to_month <> ''                        
     AND MONTH(B.travel_datefiled_original) = @par_to_month                                                  
     )                                        
                                            
   AND  (ISNULL(@v_temp_dept,'') = ''                                              
    OR @v_temp_dept <> ''                                              
    AND B.department_code    = @v_temp_dept                                              
    )        
                                                 
                                                 
    UNION    
   
           
    -- EXEC sp_approval_worklist_travel_order 'U9056','26',@par_to_year,'06',''                                              
    -- Transaction Status for Log in by Final Approver                                                  
    SELECT   DISTINCT                                                
      ISNULL(A.approval_id,'')     AS approval_id                                     
     ,ISNULL(A.user_id_creator,'')    AS user_id_creator              
     ,ISNULL(A.empl_id,'')      AS empl_id_owner                                                  
     ,ISNULL(L.empl_id,'')      AS empl_id_creator                                                  
     ,A.approval_status       AS approval_status                                                 
     ,ISNULL(B.transaction_descr,'')    AS transaction_descr                                                  
     ,E.approval_status_descr     AS worklist_status                                                  
     ,CASE                                           
      WHEN  A.approval_status  IN ('1','2')                                         
    THEN 'For Final Approval'    --REMOVE BY JORGE PGO FINAL APPROVER 2022-07-01        
      ELSE 'View Details'                                                  
     END           AS worklist_action                                                    
    ,CASE                                                 
     WHEN  A.approval_status IN ('1','2')                                       
    THEN 'F'                                 
      ELSE ''                          
     END           AS next_status                             
      ,ISNULL(J.last_name,'NoLastName') + ', ' +  ISNULL(J.first_name,'NoFirstName') + ' '                                                
    + IIF(ISNULL(J.middle_name,'') = '', ' ', LEFT(J.middle_name,1) + '. ' )                                       
    + ISNULL(J.suffix_name,'')  as owner_name                                                 
    ,ISNULL(L.last_name,'NoLastName') + ', ' +  ISNULL(L.first_name,'NoFirstName') + ' '                                                
    + IIF(ISNULL(L.middle_name,'') = '', ' ', LEFT(L.middle_name,1) + '. ' )                                      
    + ISNULL(L.suffix_name,'')  as creator_name                                               
     ,ISNULL(A.reviewed_comment,'')    AS reviewed_comment                                                  
     ,ISNULL(A.level1_approval_comment,'')  AS level1_approval_comment                                                  
     ,ISNULL(A.level2_approval_comment,'')  AS level2_approval_comment                                                  
     ,ISNULL(A.final_approval_comment,'')  AS final_approval_comment                                                  
     ,ISNULL(A.disapproval_comment,'')   AS disapproval_comment                                                  
     ,ISNULL(A.cancel_pending_comment,'')  AS cancel_pending_comment                                                   
     ,ISNULL(A.cancelled_comment,'')    AS cancelled_comment                                                   
     ,ISNULL(C.travel_order_no,'')    AS application_nbr                                                  
     ,ISNULL(C.travel_requestor_empl_id,'')  AS created_by_user                                                  
     ,ISNULL(C.posting_status,'')    AS posting_status                                                  
     ,ISNULL(C.travel_justification,'')   AS detail_remarks                                                  
     ,CONVERT(varchar,DATEPART(yyyy,C.travel_datefiled_original))+'-'                                                  
     +RIGHT('00'+CONVERT(varchar,DATEPART(mm,C.travel_datefiled_original)),2)+'-'                                                  
     +RIGHT('00'+CONVERT(varchar,DATEPART(dd,C.travel_datefiled_original)),2)                                                   
      AS travel_datefiled                           
                                                
     FROM travelorder_hdr_tbl C                                                 
     INNER JOIN HRIS_PAY.dbo.approvalworkflow_tbl A                                                  
      ON A.approval_id = C.approval_id                   
                                                  
     INNER JOIN vw_approvalstatus_tbl E                                                  
      ON A.approval_status = E.approval_status                                                    
                                                  
     INNER JOIN HRIS_PAY.dbo.transactionsref_tbl B                                                  
      ON A.transaction_code = B.transaction_code                                                  
      AND A.transaction_code IN ('003')                                               
                                                  
     LEFT JOIN HRIS_PAY.dbo.vw_personnelnames_tbl J                                                  
      ON A.empl_id = J.empl_id                                                  
                                                  
     INNER JOIN HRIS_PAY.dbo.usersprofile_tbl D1                                                  
      ON  D1.user_id = A.user_id_creator                                                  
                                                  
     LEFT JOIN HRIS_PAY.dbo.vw_personnelnames_tbl L                                                  
      ON L.empl_id = D1.empl_id                                                  
                                                  
     INNER JOIN HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl Z                                                  
      ON  Z.empl_id = C.travel_requestor_empl_id                                                  
     AND Z.effective_date = (SELECT MAX(Z1.effective_date) FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl Z1                                                  
       WHERE Z1.empl_id  = Z.empl_id                                                  
       AND Z1.emp_rcrd_status = 1)                                                  
      AND Z.emp_rcrd_status = 1           
    LEFT JOIN HRIS_PAY.dbo.vw_payrollemployeemaster_asg_tbl X                            
   ON X.empl_id = Z.empl_id         
                                         
      --AND Z.department_code    IN ('11','12','21','22','23','24')          
   --DIRI                                            
                                                  
    WHERE                                         
-- A.user_id_final_approver = @par_user_id                 
-- AND                                           
 --A.approval_status IN ('S','C','R','1','2','F','D','L')                                           
   A.approval_status IN ('F','L','2','D','1')        
            
    AND   B.with_self_service = 1                                                  
    AND   YEAR(C.travel_datefiled_original) = @par_to_year                                                
    --AND   MONTH(C.travel_datefiled) = @par_to_month                                          
    --AND   (Z.department_code = @par_department_code)                  
    --AND   (Z.employment_type = @par_employment_type)                                                 
    AND  (ISNULL(@par_to_month,'') = ''                                              
     OR @par_to_month <> ''                                               
     AND MONTH(C.travel_datefiled_original) = @par_to_month                                                  
     )                                              
    AND  (        
   ISNULL(@v_temp_dept,'') = ''                                              
     OR @v_temp_dept <> ''                                            
     AND         
   IIF(ISNULL(X.department_code,'')='',Z.department_code,X.department_code)  = @v_temp_dept                                          
     )        
  --AND C.travel_order_no NOT IN (select distinct travel_order_no from HRIS_ATS.dbo.travelorder_empl_dtl_tbl A        
  --     where empl_id IN (        
  --     select empl_id from HRIS_PAY.dbo.departments_tbl A1        
  --     WHERE A1.department_code = @v_temp_dept)        
  --     and A.rcrd_status = '1')         
  AND C.travel_order_no NOT IN (select distinct travel_order_no from HRIS_ATS.dbo.travelorder_empl_dtl_tbl A        
       where empl_id IN (        
       select empl_id from HRIS_PAY.dbo.departments_tbl A1        
       --WHERE A1.department_code = @v_temp_dept        
       )        
       and A.rcrd_status = '1')        
             
  UNION            
                                           
     -- Transaction Status for Log in by Final Approver                                                  
    SELECT   DISTINCT                                                
      ISNULL(A.approval_id,'')     AS approval_id                                     
     ,ISNULL(A.user_id_creator,'')    AS user_id_creator              
     ,ISNULL(A.empl_id,'')      AS empl_id_owner                                                  
     ,ISNULL(L.empl_id,'')      AS empl_id_creator                                                  
     ,A.approval_status       AS approval_status                                                 
     ,ISNULL(B.transaction_descr,'')    AS transaction_descr                                                  
     ,E.approval_status_descr     AS worklist_status                                                  
     ,CASE                                           
      WHEN  A.approval_status  IN ('1','2')                                         
  THEN 'For Final Approval'    --REMOVE BY JORGE PGO FINAL APPROVER 2022-07-01        
      ELSE 'View Details'                                                  
     END           AS worklist_action                                                    
  ,CASE                                                 
     WHEN  A.approval_status IN ('1','2')                                       
    THEN 'F'                                 
      ELSE ''                          
     END           AS next_status               
      ,ISNULL(J.last_name,'NoLastName') + ', ' +  ISNULL(J.first_name,'NoFirstName') + ' '                                                
    + IIF(ISNULL(J.middle_name,'') = '', ' ', LEFT(J.middle_name,1) + '. ' )                                       
    + ISNULL(J.suffix_name,'')  as owner_name                                                 
    ,ISNULL(L.last_name,'NoLastName') + ', ' +  ISNULL(L.first_name,'NoFirstName') + ' '                                                
    + IIF(ISNULL(L.middle_name,'') = '', ' ', LEFT(L.middle_name,1) + '. ' )          
    + ISNULL(L.suffix_name,'')  as creator_name                                               
     ,ISNULL(A.reviewed_comment,'')    AS reviewed_comment                                                  
     ,ISNULL(A.level1_approval_comment,'')  AS level1_approval_comment                                                  
     ,ISNULL(A.level2_approval_comment,'')  AS level2_approval_comment                                                  
     ,ISNULL(A.final_approval_comment,'')  AS final_approval_comment                                                  
     ,ISNULL(A.disapproval_comment,'')   AS disapproval_comment                                                  
     ,ISNULL(A.cancel_pending_comment,'')  AS cancel_pending_comment                                                   
     ,ISNULL(A.cancelled_comment,'')    AS cancelled_comment                                                   
     ,ISNULL(C.travel_order_no,'')    AS application_nbr                                                  
     ,ISNULL(C.travel_requestor_empl_id,'')  AS created_by_user                                                  
     ,ISNULL(C.posting_status,'')    AS posting_status                                                  
     ,ISNULL(C.travel_justification,'')   AS detail_remarks                                                  
     ,CONVERT(varchar,DATEPART(yyyy,C.travel_datefiled_original))+'-'                                                  
     +RIGHT('00'+CONVERT(varchar,DATEPART(mm,C.travel_datefiled_original)),2)+'-'                                                  
     +RIGHT('00'+CONVERT(varchar,DATEPART(dd,C.travel_datefiled_original)),2)                                                   
      AS travel_datefiled                           
                                                
    FROM travelorder_hdr_tbl C                                                 
     INNER JOIN HRIS_PAY.dbo.approvalworkflow_tbl A                                     
      ON A.approval_id = C.approval_id                   
                                                  
     INNER JOIN vw_approvalstatus_tbl E                                                  
      ON A.approval_status = E.approval_status                                                    
                                                  
     INNER JOIN HRIS_PAY.dbo.transactionsref_tbl B                                                  
      ON A.transaction_code = B.transaction_code                                                  
      AND A.transaction_code IN ('003')                                               
                                                  
     LEFT JOIN HRIS_PAY.dbo.vw_personnelnames_tbl J                                                  
      ON A.empl_id = J.empl_id                                                  
                                                  
     INNER JOIN HRIS_PAY.dbo.usersprofile_tbl D1                                                  
      ON  D1.user_id = A.user_id_creator                                                  
                                                  
     LEFT JOIN HRIS_PAY.dbo.vw_personnelnames_tbl L                                                  
      ON L.empl_id = D1.empl_id                                                  
                                                  
     INNER JOIN HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl Z                                                  
      ON  Z.empl_id = C.travel_requestor_empl_id                                                  
     AND Z.effective_date = (SELECT MAX(Z1.effective_date) FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl Z1                                                  
       WHERE Z1.empl_id  = Z.empl_id                                                  
       AND Z1.emp_rcrd_status = 1)                                                  
      AND Z.emp_rcrd_status = 1                                
     LEFT JOIN HRIS_PAY.dbo.vw_payrollemployeemaster_asg_tbl X                            
     ON X.empl_id = Z.empl_id         
                                         
      --AND Z.department_code    IN ('11','12','21','22','23','24')          
   --DIRI                                            
                                 
    WHERE                                         
  -- A.user_id_final_approver = @par_user_id                                        
  -- AND                                           
  --A.approval_status IN ('S','C','R','1','2','F','D','L')                                           
    A.approval_status IN ('F','L','2','D','1')        
            
    AND   B.with_self_service = 1                       
    AND   YEAR(C.travel_datefiled_original) = @par_to_year                                                
    --AND   MONTH(C.travel_datefiled) = @par_to_month                                          
    --AND   (Z.department_code = @par_department_code)                                                  
    --AND   (Z.employment_type = @par_employment_type)                                                 
    AND  (ISNULL(@par_to_month,'') = ''                                              
     OR @par_to_month <> ''                                               
     AND MONTH(C.travel_datefiled_original) = @par_to_month                                                  
     )                                              
    AND  (        
 ISNULL(@v_temp_dept,'') = ''                                              
     OR @v_temp_dept <> ''                                            
     AND         
  IIF(ISNULL(X.department_code,'')='',Z.department_code,X.department_code)  = @v_temp_dept                                          
     )        
  AND C.travel_order_no IN (select distinct travel_order_no from HRIS_ATS.dbo.travelorder_empl_dtl_tbl A        
       where empl_id IN (        
       select empl_id from HRIS_PAY.dbo.departments_tbl A1        
       --WHERE         
       --A1.department_code = @v_temp_dept        
       )        
       and A.rcrd_status = '2')                   
     --UNION TO PAYROLL EMPLOYEE MASTER ASSIGNED TABLE                                              
    UNION                                              
    SELECT  DISTINCT                                             
      ISNULL(A.approval_id,'')     AS approval_id                                                  
     ,ISNULL(A.user_id_creator,'')    AS user_id_creator                                                  
     ,ISNULL(A.empl_id,'')      AS empl_id_owner                                                  
     ,ISNULL(A.empl_id_creator,'')    AS empl_id_creator                                         
     ,B.approval_status       AS approval_status                                                  
     ,ISNULL(A.transaction_descr,'')    AS transaction_descr                                                 
     ,A.worklist_status       AS worklist_status                                                
     --,A.worklist_action                                                
     ,CASE                                                
      WHEN ( SELECT                            
      COUNT(M.workflow_authority)                                              
    FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
      WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                         
      AND M.transaction_code = '003'                                              
     ) > 1                                              
      THEN (                                              
      CASE ( SELECT TOP 1                                              
     M.workflow_authority                                              
     FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
     WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
     AND M.transaction_code = '003'                                              
     ORDER BY M.workflow_authority DESC                                              
       )                                              
       WHEN '1' THEN 'For Approval - Level 1'                                              
       --WHEN '2' THEN 'For Approval - Level 2'         
    WHEN '2' THEN 'For Final Approval'                                              
       ELSE 'For Final Approval'                                          
      END                                              
     )                                      
      ELSE A.worklist_action                                              
     END          AS worklist_action                                               
     --,IIF (RIGHT(A.transaction_page_name,1) = '=','',RIGHT(A.transaction_page_name,1)) AS next_status                                      
     ,CASE                                                
      WHEN ( SELECT                                              
      COUNT(M.workflow_authority)                                              
      FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
      WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
      AND M.transaction_code = '003'                                              
     ) > 1                                              
      THEN (                                              
      CASE ( SELECT TOP 1                                              
     M.workflow_authority                                             
     FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
     WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
     AND M.transaction_code = '003'                                              
     ORDER BY M.workflow_authority DESC                                              
       )                                              
       WHEN '1' THEN '1'                                              
       --WHEN '2' THEN '2'      
    WHEN '2' THEN 'F'                                              
       ELSE 'F'                                              
      END                                              
     )                                              
      ELSE (                                              
      IIF (RIGHT(A.transaction_page_name,1) = '=','',RIGHT(A.transaction_page_name,1))                                              
     )                                              
     END           AS next_status                                               
     ,ISNULL(A.owner_name,'')     AS owner_name                                                   
     ,ISNULL(A.creator_name,'')     AS creator_name                                                   
     ,ISNULL(A.reviewed_comment,'')    AS reviewed_comment                                                  
     ,ISNULL(A.level1_approval_comment,'')  AS level1_approval_comment                                                  
     ,ISNULL(A.level2_approval_comment,'')  AS level2_approval_comment                                                  
     ,ISNULL(A.final_approval_comment,'')  AS final_approval_comment                                                  
     ,ISNULL(A.disapproval_comment,'')   AS disapproval_comment                                                  
     ,ISNULL(A.cancel_pending_comment,'')  AS cancel_pending_comment                                                   
     ,ISNULL(A.cancelled_comment,'')    AS cancelled_comment                                                   
     ,ISNULL(B.travel_order_no,'')    AS application_nbr                                                  
     ,ISNULL(B.travel_requestor_empl_id,'')  AS created_by_user                                                  
     ,ISNULL(B.posting_status,'')    AS posting_status                                                  
     ,ISNULL(B.travel_justification,'')   AS detail_remarks                                                  
    ,CONVERT(varchar,DATEPART(yyyy,B.travel_datefiled_original))+'-'                                                  
      +RIGHT('00'+CONVERT(varchar,DATEPART(mm,B.travel_datefiled_original)),2)+'-'                                                  
      +RIGHT('00'+CONVERT(varchar,DATEPART(dd,B.travel_datefiled_original)),2) AS travel_datefiled                                                  
                              
    FROM HRIS_PAY.dbo.func_approval_worklist_travel_order(@par_user_id) A                                                
     INNER JOIN travelorder_hdr_tbl B                                                
      ON B.approval_id = A.approval_id                                
    WHERE YEAR(B.travel_datefiled_original) = @par_to_year                                        
    --AND   MONTH(B.travel_datefiled)  = @par_to_month       
    AND  (ISNULL(@par_to_month,'') = ''                                              
     OR @par_to_month <> ''                                               
     AND MONTH(B.travel_datefiled_original) = @par_to_month                                                  
     )                                              
    AND   (A.empl_id IN (SELECT                                               
      X1.empl_id                                               
      FROM HRIS_PAY.dbo.payrollemployeemaster_asg_tbl X1                                              
      WHERE                                         
   X1.department_code = @v_temp_dept                                    
    AND B.approval_status IN ('F','L','2','D','1')                                       
      AND                                         
   X1.ss_appl_flag = 1                                              
      AND X1.effective_date = (SELECT                                               
      MAX(X2.effective_date)                                               
      FROM HRIS_PAY.dbo.payrollemployeemaster_asg_tbl X2                                                
      WHERE X2.empl_id  = X1.empl_id)))                 
      --AND X1.employment_type = @par_employment_type))      
           
 UNION --ADDED BY JORGE FOR SPECIAL CASE REVIEW/APPROVED NATIONAL        
      
    SELECT   DISTINCT                                                
      ISNULL(A.approval_id,'')     AS approval_id                                     
     ,ISNULL(A.user_id_creator,'')    AS user_id_creator              
     ,ISNULL(A.empl_id,'')      AS empl_id_owner                                                  
     ,ISNULL(L.empl_id,'')      AS empl_id_creator                                                  
     ,A.approval_status       AS approval_status                                                 
     ,ISNULL(B.transaction_descr,'')    AS transaction_descr                                                  
     ,E.approval_status_descr     AS worklist_status                                                  
     ,CASE                                           
      WHEN  A.approval_status  IN ('S')                                         
  THEN 'For Review'    --FOR REVIEW   --PGO      
       WHEN  A.approval_status  IN ('R')            
  THEN 'For Approval - Level 1'    --FOR LEVEL 1 APPROVAL   --PGO      
   ELSE 'View Details'                                                  
     END           AS worklist_action                                                    
  ,CASE                                                 
     WHEN  A.approval_status IN ('S')                                       
  THEN 'R'          
  WHEN  A.approval_status  IN ('R')            
  THEN '1'    --FOR LEVEL 1 APPROVAL   --PGO                             
      ELSE ''                          
     END           AS next_status                             
      ,ISNULL(J.last_name,'NoLastName') + ', ' +  ISNULL(J.first_name,'NoFirstName') + ' '                                                
    + IIF(ISNULL(J.middle_name,'') = '', ' ', LEFT(J.middle_name,1) + '. ' )                                       
    + ISNULL(J.suffix_name,'')  as owner_name                                                 
    ,ISNULL(L.last_name,'NoLastName') + ', ' +  ISNULL(L.first_name,'NoFirstName') + ' '                                                
    + IIF(ISNULL(L.middle_name,'') = '', ' ', LEFT(L.middle_name,1) + '. ' )                                                
    + ISNULL(L.suffix_name,'')  as creator_name                                               
     ,ISNULL(A.reviewed_comment,'')    AS reviewed_comment                                                  
     ,ISNULL(A.level1_approval_comment,'')  AS level1_approval_comment                                                  
     ,ISNULL(A.level2_approval_comment,'')  AS level2_approval_comment                                                  
     ,ISNULL(A.final_approval_comment,'')  AS final_approval_comment                                                  
     ,ISNULL(A.disapproval_comment,'')   AS disapproval_comment                                       
     ,ISNULL(A.cancel_pending_comment,'')  AS cancel_pending_comment                                                   
     ,ISNULL(A.cancelled_comment,'')    AS cancelled_comment                                                   
     ,ISNULL(C.travel_order_no,'')    AS application_nbr                                                  
     ,ISNULL(C.travel_requestor_empl_id,'')  AS created_by_user                                                  
     ,ISNULL(C.posting_status,'')    AS posting_status                                                  
     ,ISNULL(C.travel_justification,'')   AS detail_remarks                                                  
     ,CONVERT(varchar,DATEPART(yyyy,C.travel_datefiled_original))+'-'                                                  
     +RIGHT('00'+CONVERT(varchar,DATEPART(mm,C.travel_datefiled_original)),2)+'-'                                                  
     +RIGHT('00'+CONVERT(varchar,DATEPART(dd,C.travel_datefiled_original)),2)                                                   
      AS travel_datefiled      
                                                
    FROM travelorder_hdr_tbl C                                                 
     INNER JOIN HRIS_PAY.dbo.approvalworkflow_tbl A                                                  
      ON A.approval_id = C.approval_id                   
                                                  
     INNER JOIN vw_approvalstatus_tbl E                                                  
      ON A.approval_status = E.approval_status                                                    
                                                  
     INNER JOIN HRIS_PAY.dbo.transactionsref_tbl B                                                  
      ON A.transaction_code = B.transaction_code                                                  
      AND A.transaction_code IN ('003')                                               
                                                  
     LEFT JOIN HRIS_PAY.dbo.vw_personnelnames_tbl J                                                  
      ON A.empl_id = J.empl_id                                                  
                                 
     INNER JOIN HRIS_PAY.dbo.usersprofile_tbl D1                                                  
      ON  D1.user_id = A.user_id_creator                                                  
                                                  
     LEFT JOIN HRIS_PAY.dbo.vw_personnelnames_tbl L                                                  
      ON L.empl_id = D1.empl_id                                                  
                                                  
     INNER JOIN HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl Z                                                  
      ON  Z.empl_id = C.travel_requestor_empl_id                                                  
     AND Z.effective_date = (SELECT MAX(Z1.effective_date) FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl Z1                                                  
       WHERE Z1.empl_id  = Z.empl_id                                                  
       AND Z1.emp_rcrd_status = 1)                                                  
      AND Z.emp_rcrd_status = 1                                
    LEFT JOIN HRIS_PAY.dbo.vw_payrollemployeemaster_asg_tbl X                            
   ON X.empl_id = Z.empl_id         
                                         
      --AND Z.department_code    IN ('11','12','21','22','23','24')          
   --DIRI                                            
                                                  
    WHERE                                         
-- A.user_id_final_approver = @par_user_id                 
-- AND                                           
 --A.approval_status IN ('S','C','R','1','2','F','D','L')                                           
   A.approval_status IN ('S','R')        
            
    AND   B.with_self_service = 1                                                  
    AND   YEAR(C.travel_datefiled_original) = @par_to_year                                             
    --AND   MONTH(C.travel_datefiled) = '07'                                          
    --AND   (Z.department_code = @par_department_code)                                                  
    --AND   (Z.employment_type = @par_employment_type)                                                 
    AND  (ISNULL(@par_to_month,'') = ''                                              
     OR @par_to_month <> ''                                               
     AND MONTH(C.travel_datefiled_original) = @par_to_month                                                  
     )                                              
    AND  (        
   IIF(ISNULL(X.department_code,'')='',Z.department_code,X.department_code)  = '01'                           
   )        
      
                                        
   ) AS MN                           
    INNER JOIN HRIS_PAY.dbo.approvalworkflow_tbl Z                          
 ON Z.approval_id = MN.approval_id         
  INNER JOIN HRIS_ATS.dbo.travelorder_hdr_tbl Z2        
 ON Z2.travel_order_no = MN.application_nbr        
  INNER JOIN HRIS_PAY.dbo.vw_departments_tbl_list D        
 ON D.department_code = Z2.department_code        
 --EXEC sp_approval_worklist_travel_order 'U6563','21',@par_to_year,'06',''        
 WHERE MN.application_nbr NOT IN (SELECT travel_order_no from HRIS_ATS.dbo.travelorder_hdr_tbl A1        
     WHERE A1.department_code IN ('11','12','21','22','23','24','20')           
     AND  A1.approval_status = '1'        
     AND A1.travel_order_no = MN.application_nbr)         
  AND MN.application_nbr NOT IN (select distinct travel_order_no from HRIS_ATS.dbo.travelorder_empl_dtl_tbl A        
       where empl_id IN (        
       select empl_id from HRIS_PAY.dbo.departments_tbl A1        
       --WHERE A1.department_code = @v_temp_dept        
       )        
       and A.rcrd_status = '1')              
    AND Z2.department_code NOT IN ('18','19')        
   ORDER BY MN.travel_datefiled DESC                                      
 END           
         
         
 ELSE IF @v_pa_access = 2 --PA ACCESS         
 BEGIN        
   SELECT                           
 MN.*,                              
     CONVERT(varchar, DATEPART(yyyy, Z.reviewed_date)) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(mm, Z.reviewed_date)),2) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(dd, Z.reviewed_date)),2)                                  
     AS reviewed_date                          
  ,Z.user_id_reviewer                          
  ,CONVERT(varchar, DATEPART(yyyy, Z.level1_approval_date)) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(mm, Z.level1_approval_date)),2) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(dd, Z.level1_approval_date)),2)                                  
     AS level1_approval_date                          
   ,Z.user_id_level1_approver             
   ,CONVERT(varchar, DATEPART(yyyy, Z.level2_approval_date)) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(mm, Z.level2_approval_date)),2) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(dd, Z.level2_approval_date)),2)                                  
     AS level2_approval_date                          
  ,Z.user_id_level2_approver                       
  ,CONVERT(varchar, DATEPART(yyyy, Z.final_approval_date)) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(mm, Z.final_approval_date)),2) + '-' +                              
     RIGHT('00'+ CONVERT(varchar, DATEPART(dd, Z.final_approval_date)),2)             
     AS final_approval_date                          
  ,Z.user_id_final_approver                          
   ,D.department_code        
 ,D.department_short_name AS department_name1                           
  FROM (                                      
   SELECT DISTINCT                                                 
      ISNULL(A.approval_id,'')   AS approval_id                                                  
     ,ISNULL(A.user_id_creator,'')  AS user_id_creator                                                  
     ,ISNULL(A.empl_id,'')    AS empl_id_owner                                                
     ,ISNULL(A.empl_id_creator,'')  AS empl_id_creator                                                 
     ,B.approval_status     AS approval_status                                                  
  ,ISNULL(A.transaction_descr,'')    AS transaction_descr                                                 
     ,A.worklist_status     AS worklist_status                                                
     --,A.worklist_action                                                 
     ,CASE                                                
      WHEN ( SELECT                                              
      COUNT(M.workflow_authority)                                              
      FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
      WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                          
      AND M.transaction_code = '003'                                              
     ) > 1                                              
      THEN (                                              
      CASE ( SELECT TOP 1                                              
     M.workflow_authority                                              
     FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
     WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
     AND M.transaction_code = '003'                                              
     ORDER BY M.workflow_authority DESC                                              
       )                                              
       WHEN '1' THEN 'For Approval - Level 1'                                              
       WHEN '2' THEN 'For Approval - Level 2'                                              
       ELSE 'For Final Approval'                                              
      END                                              
     )                                              
      ELSE A.worklist_action                                              
     END          AS worklist_action                                              
     --,IIF (RIGHT(A.transaction_page_name,1) = '=','',RIGHT(A.transaction_page_name,1)) AS next_status                                                  
     ,CASE                                                
      WHEN ( SELECT                                              
      COUNT(M.workflow_authority)                                              
      FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
      WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
      AND M.transaction_code = '003'                                              
     ) > 1                                              
      THEN (                                              
      CASE ( SELECT TOP 1                                              
     M.workflow_authority                                              
     FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
     WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')           
     AND M.transaction_code = '003'                                              
     ORDER BY M.workflow_authority DESC                                              
       )                                              
       WHEN '1' THEN '1'                                              
       WHEN '2' THEN '2'                                              
       ELSE 'F'            
 END                                          
     )                                              
      ELSE (                                              
      IIF (RIGHT(A.transaction_page_name,1) = '=','',RIGHT(A.transaction_page_name,1))                                              
     )                                              
     END          AS next_status                         
     ,ISNULL(A.owner_name,'')     AS owner_name                                                   
     ,ISNULL(A.creator_name,'')     AS creator_name          
     ,ISNULL(A.reviewed_comment,'')    AS reviewed_comment                                                  
     ,ISNULL(A.level1_approval_comment,'')   AS level1_approval_comment                                                  
     ,ISNULL(A.level2_approval_comment,'')   AS level2_approval_comment                           
     ,ISNULL(A.final_approval_comment,'')  AS final_approval_comment                                                  
     ,ISNULL(A.disapproval_comment,'')   AS disapproval_comment                                                  
     ,ISNULL(A.cancel_pending_comment,'')  AS cancel_pending_comment                                                   
     ,ISNULL(A.cancelled_comment,'')   AS cancelled_comment                                                   
     ,ISNULL(B.travel_order_no,'')    AS application_nbr                                                  
     ,ISNULL(B.travel_requestor_empl_id,'')  AS created_by_user                                                  
     ,ISNULL(B.posting_status,'')    AS posting_status                                                  
     ,ISNULL(B.travel_justification,'')   AS detail_remarks                                                  
     ,CONVERT(varchar,DATEPART(yyyy,B.travel_datefiled_original))+'-'                                                  
      +RIGHT('00'+CONVERT(varchar,DATEPART(mm,B.travel_datefiled_original)),2)+'-'                                             
      +RIGHT('00'+CONVERT(varchar,DATEPART(dd,B.travel_datefiled_original)),2) AS travel_datefiled            
                                                
    FROM HRIS_PAY.dbo.func_approval_worklist_travel_order(@par_user_id) A                                                
     INNER JOIN travelorder_hdr_tbl B                                                
      ON B.approval_id = A.approval_id                                                
    WHERE   YEAR(B.travel_datefiled_original) = @par_to_year                                                  
    --AND   MONTH(B.travel_datefiled)  = @par_to_month                                                 
    --AND   (B.department_code IN ('11','12','21','22','23','24'))                                                
    AND  (ISNULL(@par_to_month,'') = ''                                              
     OR @par_to_month <> ''                        
     AND MONTH(B.travel_datefiled_original) = @par_to_month                                                  
     )                                        
                                            
   AND  (ISNULL(@v_temp_dept,'') = ''                                              
    OR @v_temp_dept <> ''                                              
    AND B.department_code    = @v_temp_dept                                              
    )          
 AND B.department_code NOT IN ('18','19')                                            
                                                 
    UNION                                                  
     -- Transaction Status for Log in by Final Approver                                                  
    SELECT   DISTINCT                                                
      ISNULL(A.approval_id,'')     AS approval_id                                     
     ,ISNULL(A.user_id_creator,'')    AS user_id_creator              
     ,ISNULL(A.empl_id,'')      AS empl_id_owner                                                  
     ,ISNULL(L.empl_id,'')      AS empl_id_creator                                                  
     ,A.approval_status       AS approval_status                                                 
     ,ISNULL(B.transaction_descr,'')    AS transaction_descr                                                  
     ,E.approval_status_descr     AS worklist_status                                                  
     ,CASE                                           
      WHEN  A.approval_status  IN ('1')                                         
  --THEN 'For Final Approval'    --REMOVE BY JORGE PGO FINAL APPROVER 2022-07-01        
  THEN 'For Approval - Level 2'                
      ELSE 'View Details'                                                  
     END           AS worklist_action                                                    
  ,CASE                                                 
     WHEN  A.approval_status IN ('1')                                       
    --THEN 'F'  --REMOVE BY JORGE PGO FINAL APPROVER 2022-07-01             
  THEN '2'                                    
      ELSE ''                          
     END           AS next_status                             
      ,ISNULL(J.last_name,'NoLastName') + ', ' +  ISNULL(J.first_name,'NoFirstName') + ' '                                                
    + IIF(ISNULL(J.middle_name,'') = '', ' ', LEFT(J.middle_name,1) + '. ' )                                   
    + ISNULL(J.suffix_name,'')  as owner_name                                                 
    ,ISNULL(L.last_name,'NoLastName') + ', ' +  ISNULL(L.first_name,'NoFirstName') + ' '                                                
    + IIF(ISNULL(L.middle_name,'') = '', ' ', LEFT(L.middle_name,1) + '. ' )                                                
    + ISNULL(L.suffix_name,'')  as creator_name                                               
     ,ISNULL(A.reviewed_comment,'')    AS reviewed_comment                                                  
     ,ISNULL(A.level1_approval_comment,'')  AS level1_approval_comment              
     ,ISNULL(A.level2_approval_comment,'')  AS level2_approval_comment                                                  
     ,ISNULL(A.final_approval_comment,'')  AS final_approval_comment                                                  
     ,ISNULL(A.disapproval_comment,'')   AS disapproval_comment                                                  
     ,ISNULL(A.cancel_pending_comment,'')  AS cancel_pending_comment                                                   
     ,ISNULL(A.cancelled_comment,'')    AS cancelled_comment                                                   
     ,ISNULL(C.travel_order_no,'')    AS application_nbr                                                  
     ,ISNULL(C.travel_requestor_empl_id,'')  AS created_by_user                                                  
     ,ISNULL(C.posting_status,'')    AS posting_status                                                  
     ,ISNULL(C.travel_justification,'')   AS detail_remarks                                                  
     ,CONVERT(varchar,DATEPART(yyyy,C.travel_datefiled_original))+'-'                                                  
     +RIGHT('00'+CONVERT(varchar,DATEPART(mm,C.travel_datefiled_original)),2)+'-'                                                  
     +RIGHT('00'+CONVERT(varchar,DATEPART(dd,C.travel_datefiled_original)),2)                                                   
      AS travel_datefiled                           
                                                
    FROM travelorder_hdr_tbl C                                                 
     INNER JOIN HRIS_PAY.dbo.approvalworkflow_tbl A                                                  
      ON A.approval_id = C.approval_id                   
                                                  
     INNER JOIN vw_approvalstatus_tbl E                                                  
      ON A.approval_status = E.approval_status                                                    
                                                  
     INNER JOIN HRIS_PAY.dbo.transactionsref_tbl B                                                  
      ON A.transaction_code = B.transaction_code                                                  
      AND A.transaction_code IN ('003')                                               
                                                  
     LEFT JOIN HRIS_PAY.dbo.vw_personnelnames_tbl J                                                  
      ON A.empl_id = J.empl_id                                                  
                                                  
     INNER JOIN HRIS_PAY.dbo.usersprofile_tbl D1                                                  
      ON  D1.user_id = A.user_id_creator                             
                                                  
     LEFT JOIN HRIS_PAY.dbo.vw_personnelnames_tbl L                                                  
      ON L.empl_id = D1.empl_id                                                  
                                                  
     INNER JOIN HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl Z                                                  
      ON  Z.empl_id = C.travel_requestor_empl_id                                                  
     AND Z.effective_date = (SELECT MAX(Z1.effective_date) FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl Z1                     
       WHERE Z1.empl_id  = Z.empl_id                                                  
       AND Z1.emp_rcrd_status = 1)                                                  
      AND Z.emp_rcrd_status = 1                                
    LEFT JOIN HRIS_PAY.dbo.vw_payrollemployeemaster_asg_tbl X                            
   ON X.empl_id = Z.empl_id                                             
      --AND Z.department_code    IN ('11','12','21','22','23','24')                                              
                                                  
    WHERE                                         
-- A.user_id_final_approver = @par_user_id                                        
-- AND                                           
 --A.approval_status IN ('S','C','R','1','2','F','D','L')                                           
 A.approval_status IN ('F','L','1','D')        
            
    AND   B.with_self_service = 1                                                  
    AND   YEAR(C.travel_datefiled_original) = @par_to_year                                                
    --AND   MONTH(C.travel_datefiled) = @par_to_month                                          
    --AND   (Z.department_code = @par_department_code)                                                  
    --AND   (Z.employment_type = @par_employment_type)                                                 
    AND  (ISNULL(@par_to_month,'') = ''                                              
     OR @par_to_month <> ''                                               
     AND MONTH(C.travel_datefiled_original) = @par_to_month                                                  
     )                                              
    AND  (ISNULL(@v_temp_dept,'') = ''                                              
     OR @v_temp_dept <> ''                                            
     AND IIF(ISNULL(X.department_code,'')='',Z.department_code,X.department_code)  = @v_temp_dept                                              
     )        
   AND IIF(ISNULL(X.department_code,'')='',Z.department_code,X.department_code) NOT IN ('18','19')              
        
   UNION                                                  
     -- Transaction Status for Log in by Level 2                                                
    SELECT   DISTINCT                                                
      ISNULL(A.approval_id,'')     AS approval_id                                     
     ,ISNULL(A.user_id_creator,'')    AS user_id_creator              
     ,ISNULL(A.empl_id,'')      AS empl_id_owner                                                  
     ,ISNULL(L.empl_id,'')      AS empl_id_creator                                                  
     ,'2'       AS approval_status                                   
     ,ISNULL(B.transaction_descr,'')    AS transaction_descr                                                  
     ,E.approval_status_descr     AS worklist_status                                                  
    ,'View Details'   AS worklist_action                                                        
  ,''    AS next_status                                  
      ,ISNULL(J.last_name,'NoLastName') + ', ' +  ISNULL(J.first_name,'NoFirstName') + ' '                                                
    + IIF(ISNULL(J.middle_name,'') = '', ' ', LEFT(J.middle_name,1) + '. ' )                                       
    + ISNULL(J.suffix_name,'')  as owner_name                                                 
    ,ISNULL(L.last_name,'NoLastName') + ', ' +  ISNULL(L.first_name,'NoFirstName') + ' '                                                
    + IIF(ISNULL(L.middle_name,'') = '', ' ', LEFT(L.middle_name,1) + '. ' )                                                
    + ISNULL(L.suffix_name,'')  as creator_name                                               
     ,ISNULL(A.reviewed_comment,'')    AS reviewed_comment                                                  
     ,ISNULL(A.level1_approval_comment,'')  AS level1_approval_comment                                                     ,ISNULL(A.level2_approval_comment,'')  AS level2_approval_comment                                                  
     ,ISNULL(A.final_approval_comment,'')  AS final_approval_comment                                                  
     ,ISNULL(A.disapproval_comment,'')   AS disapproval_comment                                                  
     ,ISNULL(A.cancel_pending_comment,'')  AS cancel_pending_comment                                                   
     ,ISNULL(A.cancelled_comment,'')    AS cancelled_comment                                       
     ,ISNULL(C.travel_order_no,'')    AS application_nbr                                                  
     ,ISNULL(C.travel_requestor_empl_id,'')  AS created_by_user                                                  
     ,ISNULL(C.posting_status,'')    AS posting_status                                                  
     ,ISNULL(C.travel_justification,'')   AS detail_remarks                                                  
     ,CONVERT(varchar,DATEPART(yyyy,C.travel_datefiled_original))+'-'                                                  
     +RIGHT('00'+CONVERT(varchar,DATEPART(mm,C.travel_datefiled_original)),2)+'-'                                                  
     +RIGHT('00'+CONVERT(varchar,DATEPART(dd,C.travel_datefiled_original)),2)                                                   
      AS travel_datefiled                           
                                                
    FROM travelorder_hdr_tbl C                                                 
     INNER JOIN HRIS_PAY.dbo.approvalworkflow_tbl A                                                  
      ON A.approval_id = C.approval_id                   
                                                  
     INNER JOIN vw_approvalstatus_tbl E                                                  
      ON A.approval_status = E.approval_status                                                    
                                                  
     INNER JOIN HRIS_PAY.dbo.transactionsref_tbl B                                                  
      ON A.transaction_code = B.transaction_code                                                  
      AND A.transaction_code IN ('003')                                               
                                                  
     LEFT JOIN HRIS_PAY.dbo.vw_personnelnames_tbl J                                                  
      ON A.empl_id = J.empl_id                                                  
                                                  
     INNER JOIN HRIS_PAY.dbo.usersprofile_tbl D1                                                  
      ON  D1.user_id = A.user_id_creator                                                  
                                                  
     LEFT JOIN HRIS_PAY.dbo.vw_personnelnames_tbl L                                                  
      ON L.empl_id = D1.empl_id                                                  
                                                  
     INNER JOIN HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl Z                                                  
      ON  Z.empl_id = C.travel_requestor_empl_id                                                  
     AND Z.effective_date = (SELECT MAX(Z1.effective_date) FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl Z1                                                  
       WHERE Z1.empl_id  = Z.empl_id                                                  
       AND Z1.emp_rcrd_status = 1)                                                  
      AND Z.emp_rcrd_status = 1                           
    LEFT JOIN HRIS_PAY.dbo.vw_payrollemployeemaster_asg_tbl X                            
   ON X.empl_id = Z.empl_id                                             
      --AND Z.department_code    IN ('11','12','21','22','23','24')                                              
                                                  
    WHERE                                         
-- A.user_id_final_approver = @par_user_id             
-- AND                                           
 --A.approval_status IN ('S','C','R','1','2','F','D','L')                                           
 A.approval_status IN ('2','F')        
            
    AND   B.with_self_service = 1                                                  
    AND   YEAR(C.travel_datefiled_original) = @par_to_year                                                
    --AND   MONTH(C.travel_datefiled) = @par_to_month                
    --AND   (Z.department_code = @par_department_code)                                                  
    --AND   (Z.employment_type = @par_employment_type)                                                 
    AND  (ISNULL(@par_to_month,'') = ''                                              
     OR @par_to_month <> ''                                               
     AND MONTH(C.travel_datefiled_original) = @par_to_month                                                  
     )                                              
    AND  (ISNULL(@v_temp_dept,'') = ''                                              
     OR @v_temp_dept <> ''                                            
     AND IIF(ISNULL(X.department_code,'')='',Z.department_code,X.department_code)  = @v_temp_dept                                              
     )       
  AND IIF(ISNULL(X.department_code,'')='',Z.department_code,X.department_code) NOT IN ('18','19')               
            
    -- UNION TO PAYROLL EMPLOYEE MASTER ASSIGNED TABLE                                              
    UNION                                              
    SELECT  DISTINCT                                             
      ISNULL(A.approval_id,'')     AS approval_id                                                  
     ,ISNULL(A.user_id_creator,'')    AS user_id_creator                                                  
     ,ISNULL(A.empl_id,'')      AS empl_id_owner                                                  
     ,ISNULL(A.empl_id_creator,'')    AS empl_id_creator                                         
     ,B.approval_status       AS approval_status                                                  
     ,ISNULL(A.transaction_descr,'')    AS transaction_descr                                                 
     ,A.worklist_status       AS worklist_status                                                
     --,A.worklist_action                                                
     ,CASE                                                
      WHEN ( SELECT                            
      COUNT(M.workflow_authority)                                              
    FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
      WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                         
      AND M.transaction_code = '003'                                              
     ) > 1                                              
      THEN (                                              
      CASE ( SELECT TOP 1                                              
     M.workflow_authority                                              
     FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
     WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
     AND M.transaction_code = '003'                                              
     ORDER BY M.workflow_authority DESC                                              
       )                                              
       WHEN '1' THEN 'For Approval - Level 1'                                              
       WHEN '2' THEN 'For Approval - Level 2'                   
       ELSE 'For Final Approval'                                          
      END                                              
     )                                              
ELSE A.worklist_action                                              
     END          AS worklist_action                                               
     --,IIF (RIGHT(A.transaction_page_name,1) = '=','',RIGHT(A.transaction_page_name,1)) AS next_status                                                  
     ,CASE                                                
      WHEN ( SELECT                                              
      COUNT(M.workflow_authority)                                              
      FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                    
      WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
      AND M.transaction_code = '003'                                              
     ) > 1                                              
      THEN (                                              
      CASE ( SELECT TOP 1                                              
     M.workflow_authority                                             
     FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
     WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
     AND M.transaction_code = '003'                                              
     ORDER BY M.workflow_authority DESC                                              
       )                                              
       WHEN '1' THEN '1'                                              
       WHEN '2' THEN '2'                                              
       ELSE 'F'                                              
      END                                              
     )                                              
      ELSE (                                              
      IIF (RIGHT(A.transaction_page_name,1) = '=','',RIGHT(A.transaction_page_name,1))                                              
     )                                              
     END           AS next_status                                               
     ,ISNULL(A.owner_name,'')     AS owner_name                                                   
     ,ISNULL(A.creator_name,'')     AS creator_name                                                   
     ,ISNULL(A.reviewed_comment,'')    AS reviewed_comment                                                  
     ,ISNULL(A.level1_approval_comment,'')  AS level1_approval_comment                                                  
     ,ISNULL(A.level2_approval_comment,'')  AS level2_approval_comment                                                  
     ,ISNULL(A.final_approval_comment,'')  AS final_approval_comment                                                  
     ,ISNULL(A.disapproval_comment,'')   AS disapproval_comment                                                  
     ,ISNULL(A.cancel_pending_comment,'')  AS cancel_pending_comment                                                   
     ,ISNULL(A.cancelled_comment,'')    AS cancelled_comment                                                   
     ,ISNULL(B.travel_order_no,'')    AS application_nbr                                                  
     ,ISNULL(B.travel_requestor_empl_id,'')  AS created_by_user                                                  
     ,ISNULL(B.posting_status,'')    AS posting_status                                                  
     ,ISNULL(B.travel_justification,'')   AS detail_remarks                                                  
    ,CONVERT(varchar,DATEPART(yyyy,B.travel_datefiled_original))+'-'                                                  
      +RIGHT('00'+CONVERT(varchar,DATEPART(mm,B.travel_datefiled_original)),2)+'-'                                                  
      +RIGHT('00'+CONVERT(varchar,DATEPART(dd,B.travel_datefiled_original)),2) AS travel_datefiled                                                  
                              
    FROM HRIS_PAY.dbo.func_approval_worklist_travel_order(@par_user_id) A                                                
     INNER JOIN travelorder_hdr_tbl B                                                
      ON B.approval_id = A.approval_id                                                
    WHERE YEAR(B.travel_datefiled_original) = @par_to_year                                        
    --AND   MONTH(B.travel_datefiled)  = @par_to_month                                                 
    AND  (ISNULL(@par_to_month,'') = ''                                              
     OR @par_to_month <> ''                                      
     AND MONTH(B.travel_datefiled_original) = @par_to_month                                                  
     )                                              
    AND   (A.empl_id IN (SELECT                                               
      X1.empl_id                                               
      FROM HRIS_PAY.dbo.payrollemployeemaster_asg_tbl X1                                              
      WHERE                                         
   X1.department_code = @v_temp_dept                                    
    AND B.approval_status IN ('F','L','1','D')                                       
      AND                                         
   X1.ss_appl_flag = 1                                              
      AND X1.effective_date = (SELECT                                               
      MAX(X2.effective_date)                                               
      FROM HRIS_PAY.dbo.payrollemployeemaster_asg_tbl X2                                                
      WHERE X2.empl_id  = X1.empl_id)))                                              
         
            
                                    
   ) AS MN                           
    INNER JOIN HRIS_PAY.dbo.approvalworkflow_tbl Z                          
 ON Z.approval_id = MN.approval_id          
 INNER JOIN HRIS_ATS.dbo.travelorder_hdr_tbl Z2        
 ON Z2.travel_order_no = MN.application_nbr        
  INNER JOIN HRIS_PAY.dbo.vw_departments_tbl_list D        
 ON D.department_code = Z2.department_code        
 WHERE       
 MN.application_nbr IN (select distinct travel_order_no from HRIS_ATS.dbo.travelorder_empl_dtl_tbl A        
       where empl_id IN (        
       select empl_id from HRIS_PAY.dbo.departments_tbl A1        
       WHERE         
       --A1.department_code = @v_temp_dept        
       IIF(@v_temp_dept = '',A1.department_code,@v_temp_dept) = A1.department_code        
       and A.rcrd_status = '1'))        
  AND       
  D.department_code NOT IN ('18','19')         
        
  UNION --ADDITIONAL MAÁM PA      
      
   -- Transaction Status for Log in by Level 2           
 SELECT       
   MN.*,      
     CONVERT(varchar, DATEPART(yyyy, Z.reviewed_date)) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(mm, Z.reviewed_date)),2) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(dd, Z.reviewed_date)),2)                                  
     AS reviewed_date                          
  ,Z.user_id_reviewer                          
  ,CONVERT(varchar, DATEPART(yyyy, Z.level1_approval_date)) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(mm, Z.level1_approval_date)),2) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(dd, Z.level1_approval_date)),2)                                  
     AS level1_approval_date                          
   ,Z.user_id_level1_approver             
   ,CONVERT(varchar, DATEPART(yyyy, Z.level2_approval_date)) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(mm, Z.level2_approval_date)),2) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(dd, Z.level2_approval_date)),2)                                  
     AS level2_approval_date                          
  ,Z.user_id_level2_approver                       
  ,CONVERT(varchar, DATEPART(yyyy, Z.final_approval_date)) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(mm, Z.final_approval_date)),2) + '-' +                              
     RIGHT('00'+ CONVERT(varchar, DATEPART(dd, Z.final_approval_date)),2)             
     AS final_approval_date                          
  ,Z.user_id_final_approver                          
   ,D.department_code        
 ,D.department_short_name AS department_name1             
         
                                            
    FROM (SELECT   DISTINCT                             
      ISNULL(A.approval_id,'')     AS approval_id                                     
     ,ISNULL(A.user_id_creator,'')    AS user_id_creator              
     ,ISNULL(A.empl_id,'')      AS empl_id_owner                                                  
     ,ISNULL(L.empl_id,'')      AS empl_id_creator                                                  
     ,'F'       AS approval_status                                   
     ,ISNULL(B.transaction_descr,'')    AS transaction_descr                                                  
     ,E.approval_status_descr     AS worklist_status                                                  
    ,'View Details'   AS worklist_action                                                        
  ,''    AS next_status                                  
      ,ISNULL(J.last_name,'NoLastName') + ', ' +  ISNULL(J.first_name,'NoFirstName') + ' '                                                
    + IIF(ISNULL(J.middle_name,'') = '', ' ', LEFT(J.middle_name,1) + '. ' )                                       
    + ISNULL(J.suffix_name,'')  as owner_name                                                 
    ,ISNULL(L.last_name,'NoLastName') + ', ' +  ISNULL(L.first_name,'NoFirstName') + ' '                                                
    + IIF(ISNULL(L.middle_name,'') = '', ' ', LEFT(L.middle_name,1) + '. ' )                                                
    + ISNULL(L.suffix_name,'')  as creator_name                                               
     ,ISNULL(A.reviewed_comment,'')    AS reviewed_comment                                                  
     ,ISNULL(A.level1_approval_comment,'')  AS level1_approval_comment                                                  
     ,ISNULL(A.level2_approval_comment,'')  AS level2_approval_comment                                                  
     ,ISNULL(A.final_approval_comment,'')  AS final_approval_comment                                                  
     ,ISNULL(A.disapproval_comment,'')   AS disapproval_comment                                                  
     ,ISNULL(A.cancel_pending_comment,'')  AS cancel_pending_comment                                                   
     ,ISNULL(A.cancelled_comment,'')    AS cancelled_comment                                                   
     ,ISNULL(C.travel_order_no,'')    AS application_nbr                                                  
     ,ISNULL(C.travel_requestor_empl_id,'')  AS created_by_user                                                  
     ,ISNULL(C.posting_status,'')    AS posting_status                                                  
     ,ISNULL(C.travel_justification,'')   AS detail_remarks                                                  
     ,CONVERT(varchar,DATEPART(yyyy,C.travel_datefiled_original))+'-'                                                  
     +RIGHT('00'+CONVERT(varchar,DATEPART(mm,C.travel_datefiled_original)),2)+'-'                                                  
     +RIGHT('00'+CONVERT(varchar,DATEPART(dd,C.travel_datefiled_original)),2)                                                   
      AS travel_datefiled                           
                                                
    FROM travelorder_hdr_tbl C                                                 
     INNER JOIN HRIS_PAY.dbo.approvalworkflow_tbl A                                                  
      ON A.approval_id = C.approval_id                   
                                                  
     INNER JOIN vw_approvalstatus_tbl E                                                  
      ON A.approval_status = E.approval_status                                                    
                                                  
     INNER JOIN HRIS_PAY.dbo.transactionsref_tbl B                                                  
      ON A.transaction_code = B.transaction_code                            
      AND A.transaction_code IN ('003')                       
                                                  
     LEFT JOIN HRIS_PAY.dbo.vw_personnelnames_tbl J                                                  
      ON A.empl_id = J.empl_id                                                  
                                                  
     INNER JOIN HRIS_PAY.dbo.usersprofile_tbl D1                                                  
      ON  D1.user_id = A.user_id_creator                                                  
                                                  
     LEFT JOIN HRIS_PAY.dbo.vw_personnelnames_tbl L                                                  
      ON L.empl_id = D1.empl_id                                                  
                                                  
     INNER JOIN HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl Z                                                  
      ON  Z.empl_id = C.travel_requestor_empl_id                                                  
     AND Z.effective_date = (SELECT MAX(Z1.effective_date) FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl Z1                                                  
       WHERE Z1.empl_id  = Z.empl_id                                                  
       AND Z1.emp_rcrd_status = 1)                                                  
      AND Z.emp_rcrd_status = 1                                
    LEFT JOIN HRIS_PAY.dbo.vw_payrollemployeemaster_asg_tbl X                            
   ON X.empl_id = Z.empl_id                                             
      --AND Z.department_code    IN ('11','12','21','22','23','24')                                              
                                                  
    WHERE                                         
-- A.user_id_final_approver = @par_user_id                                        
-- AND                                           
 --A.approval_status IN ('S','C','R','1','2','F','D','L')                                           
  A.approval_status IN ('F')        
            
    AND   B.with_self_service = 1                                                  
    AND   YEAR(C.travel_datefiled_original) = @par_to_year                                               
    --AND   MONTH(C.travel_datefiled) = @par_to_month                                          
    --AND   (Z.department_code = @par_department_code)                                                  
    --AND   (Z.employment_type = @par_employment_type)                                                 
    AND  (ISNULL(@par_to_month,'') = ''                                              
     OR @par_to_month <> ''                                               
     AND MONTH(C.travel_datefiled_original) = @par_to_month                                                  
     )                                              
    --AND  (ISNULL(@v_temp_dept,'') = ''                                              
    -- OR @v_temp_dept <> ''                                            
    -- AND IIF(ISNULL(X.department_code,'')='',Z.department_code,X.department_code)  = @v_temp_dept                                              
    -- )       
  AND IIF(ISNULL(X.department_code,'')='',Z.department_code,X.department_code) NOT IN ('18','19')        
      
  )  AS MN      
    INNER JOIN HRIS_PAY.dbo.approvalworkflow_tbl Z                          
  ON Z.approval_id = MN.approval_id          
  INNER JOIN HRIS_ATS.dbo.travelorder_hdr_tbl Z2        
  ON Z2.travel_order_no = MN.application_nbr        
   INNER JOIN HRIS_PAY.dbo.vw_departments_tbl_list D        
  ON D.department_code = Z2.department_code       
        
             
 --ORDER BY MN.travel_datefiled DESC         
          
 END                                  
 ELSE   --FOR OTHER DEPARTMENTS                                       
 BEGIN            
         
 SELECT MN.*,                              
     CONVERT(varchar, DATEPART(yyyy, Z.reviewed_date)) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(mm, Z.reviewed_date)),2) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(dd, Z.reviewed_date)),2)                                  
     AS reviewed_date                          
  ,Z.user_id_reviewer                          
  ,CONVERT(varchar, DATEPART(yyyy, Z.level1_approval_date)) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(mm, Z.level1_approval_date)),2) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(dd, Z.level1_approval_date)),2)                                  
     AS level1_approval_date                          
   ,Z.user_id_level1_approver             
   ,CONVERT(varchar, DATEPART(yyyy, Z.level2_approval_date)) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(mm, Z.level2_approval_date)),2) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(dd, Z.level2_approval_date)),2)                                  
     AS level2_approval_date                          
  ,Z.user_id_level2_approver                       
  ,CONVERT(varchar, DATEPART(yyyy, Z.final_approval_date)) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(mm, Z.final_approval_date)),2) + '-' +                                  
     RIGHT('00'+ CONVERT(varchar, DATEPART(dd, Z.final_approval_date)),2)             
     AS final_approval_date                          
  ,Z.user_id_final_approver          
   ,D.department_code        
 ,D.department_short_name AS department_name1                 
  FROM (                                      
   SELECT                                                   
      ISNULL(A.approval_id,'')     AS approval_id                                                  
     ,ISNULL(A.user_id_creator,'')    AS user_id_creator                                                  
     ,ISNULL(A.empl_id,'')      AS empl_id_owner                                                  
     ,ISNULL(A.empl_id_creator,'')    AS empl_id_creator                                                 
     ,B.approval_status       AS approval_status                                                  
     ,ISNULL(A.transaction_descr,'')    AS transaction_descr                                                 
     ,A.worklist_status       AS worklist_status                                                
     --,A.worklist_action                                                 
     ,CASE                      
      WHEN ( SELECT                                              
      COUNT(M.workflow_authority)                                              
      FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
      WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
      AND M.transaction_code = '003'                                              
     ) > 1                                              
    THEN (                                              
      CASE ( SELECT TOP 1                                              
     M.workflow_authority                                              
     FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
     WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
     AND M.transaction_code = '003'                                              
     ORDER BY M.workflow_authority DESC                                              
       )                                              
       WHEN '1' THEN 'For Approval - Level 1'                                              
       WHEN '2' THEN 'For Approval - Level 2'                                              
       ELSE 'For Final Approval'                                              
      END                                   )                                              
      ELSE A.worklist_action                                              
     END          AS worklist_action                                              
     --,IIF (RIGHT(A.transaction_page_name,1) = '=','',RIGHT(A.transaction_page_name,1)) AS next_status                                                  
     ,CASE                                       
      WHEN ( SELECT                                              
      COUNT(M.workflow_authority)                                              
      FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
      WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
      AND M.transaction_code = '003'                                              
     ) > 1                                              
      THEN (                                              
      CASE ( SELECT TOP 1                                              
     M.workflow_authority                                              
     FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
     WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
     AND M.transaction_code = '003'                                              
     ORDER BY M.workflow_authority DESC                                              
       )                                              
       WHEN '1' THEN '1'                     
       WHEN '2' THEN '2'                                              
       ELSE 'F'                                              
 END                                              
     )                                              
      ELSE (                                              
      IIF (RIGHT(A.transaction_page_name,1) = '=','',RIGHT(A.transaction_page_name,1))                                              
     )                                              
     END           AS next_status                                               
     ,ISNULL(A.owner_name,'')     AS owner_name                                                   
     ,ISNULL(A.creator_name,'')     AS creator_name                                                   
     ,ISNULL(A.reviewed_comment,'')    AS reviewed_comment                                                  
     ,ISNULL(A.level1_approval_comment,'')  AS level1_approval_comment                                                  
     ,ISNULL(A.level2_approval_comment,'')  AS level2_approval_comment                                                  
     ,ISNULL(A.final_approval_comment,'')  AS final_approval_comment                                                  
     ,ISNULL(A.disapproval_comment,'')   AS disapproval_comment                                                  
     ,ISNULL(A.cancel_pending_comment,'')  AS cancel_pending_comment                                                   
     ,ISNULL(A.cancelled_comment,'')    AS cancelled_comment                                                   
     ,ISNULL(B.travel_order_no,'')    AS application_nbr                                    
     ,ISNULL(B.travel_requestor_empl_id,'')  AS created_by_user                                                  
     ,ISNULL(B.posting_status,'')    AS posting_status                                            
     ,ISNULL(B.travel_justification,'')   AS detail_remarks                                    
     ,CONVERT(varchar,DATEPART(yyyy,B.travel_datefiled_original))+'-'                                                 
      +RIGHT('00'+CONVERT(varchar,DATEPART(mm,B.travel_datefiled_original)),2)+'-'                                                  
      +RIGHT('00'+CONVERT(varchar,DATEPART(dd,B.travel_datefiled_original)),2) AS travel_datefiled                                                  
    --,''  AS reviewed_date                          
    --,''  AS user_id_reviewer                          
    --,''  AS level1_approval_date                          
--,''  AS user_id_level1_approver             
    --,''  AS level2_approval_date                          
    --,''  AS user_id_level2_approver                       
    --,''  AS final_approval_date                          
    --,''  AS user_id_final_approver                                      
    FROM HRIS_PAY.dbo.func_approval_worklist_travel_order(@par_user_id) A                                                
     INNER JOIN travelorder_hdr_tbl B                  
      ON B.approval_id = A.approval_id       
   --LEFT JOIN travel_order_ldnf_tbl Y      
   --ON  Y.travel_order_no = B.travel_order_no                                             
    WHERE   YEAR(B.travel_datefiled_original) = @par_to_year                                                  
    --AND   MONTH(B.travel_datefiled)  = @par_to_month                                                 
    AND   (B.department_code = @par_department_code)                         
    AND  (ISNULL(@par_to_month,'') = ''                                              
     OR @par_to_month <> ''                                               
     AND MONTH(B.travel_datefiled_original) = @par_to_month                                                  
     )                                              
    AND  (ISNULL(@par_department_code,'') = ''                                              
     OR @par_department_code <> ''                                              
     --AND B.department_code    = @par_department_code                                              
     )       
  AND ISNULL(B.to_emergency,0) = 0      
      
  UNION --EMERGENCY PURPOSE      
      
  SELECT                                                   
      ISNULL(A.approval_id,'')     AS approval_id                                                  
     ,ISNULL(A.user_id_creator,'')    AS user_id_creator                                                  
     ,ISNULL(A.empl_id,'')      AS empl_id_owner                                                  
     ,ISNULL(A.empl_id_creator,'')    AS empl_id_creator                                                 
     ,B.approval_status       AS approval_status                                                  
     ,ISNULL(A.transaction_descr,'')    AS transaction_descr                                                 
     ,A.worklist_status       AS worklist_status                                                
     --,A.worklist_action                                                 
     ,CASE WHEN B.approval_status = 'S'      
   THEN 'For Review'      
   WHEN B.department_code IN ('11','12','21','22','23','24','20')      
    AND B.approval_status = 'R'      
   THEN 'For Approval - Level 1'       
  ELSE 'For Final Approval'           
 END AS worklist_action                                              
     --,IIF (RIGHT(A.transaction_page_name,1) = '=','',RIGHT(A.transaction_page_name,1)) AS next_status                                                  
      ,CASE WHEN B.approval_status = 'S'      
   THEN 'R'      
   WHEN B.department_code IN ('11','12','21','22','23','24','20')      
    AND B.approval_status = 'R'      
   THEN '1'       
  ELSE 'F'          
  END AS next_status                                               
     ,ISNULL(A.owner_name,'')   AS owner_name                                                   
     ,ISNULL(A.creator_name,'')   AS creator_name                                                   
     ,ISNULL(A.reviewed_comment,'')    AS reviewed_comment                                                  
     ,ISNULL(A.level1_approval_comment,'')  AS level1_approval_comment                                                  
     ,ISNULL(A.level2_approval_comment,'')  AS level2_approval_comment                                                  
     ,ISNULL(A.final_approval_comment,'')  AS final_approval_comment                                                  
     ,ISNULL(A.disapproval_comment,'')   AS disapproval_comment         
     ,ISNULL(A.cancel_pending_comment,'')  AS cancel_pending_comment                                                   
     ,ISNULL(A.cancelled_comment,'')    AS cancelled_comment                                                   
     ,ISNULL(B.travel_order_no,'')    AS application_nbr                                    
     ,ISNULL(B.travel_requestor_empl_id,'')  AS created_by_user                                                  
     ,ISNULL(B.posting_status,'')    AS posting_status                                            
     ,ISNULL(B.travel_justification,'')   AS detail_remarks                                    
     ,CONVERT(varchar,DATEPART(yyyy,B.travel_datefiled_original))+'-'                                                 
      +RIGHT('00'+CONVERT(varchar,DATEPART(mm,B.travel_datefiled_original)),2)+'-'                                                  
      +RIGHT('00'+CONVERT(varchar,DATEPART(dd,B.travel_datefiled_original)),2) AS travel_datefiled                                                  
    --,''  AS reviewed_date                          
    --,''  AS user_id_reviewer                          
    --,''  AS level1_approval_date                          
    --,''  AS user_id_level1_approver             
    --,''  AS level2_approval_date                          
    --,''  AS user_id_level2_approver                       
    --,''  AS final_approval_date                          
    --,''  AS user_id_final_approver                                      
    FROM HRIS_PAY.dbo.func_approval_worklist_travel_order(@par_user_id) A                                                
     INNER JOIN travelorder_hdr_tbl B                                                
      ON B.approval_id = A.approval_id        
  --LEFT JOIN travel_order_ldnf_tbl Y      
  -- ON  Y.travel_order_no = B.travel_order_no        
   LEFT JOIN HRIS_PAY.dbo.vw_payrollemployeemaster_asg_tbl Y1      
   ON Y1.empl_id = A.empl_id         
   AND Y1.ss_appl_flag = 1                                                
    WHERE   YEAR(B.travel_datefiled_original) = @par_to_year                                                  
    --AND   MONTH(B.travel_datefiled)  = @par_to_month                                                 
    AND   (ISNULL(Y1.department_code,B.department_code) = @par_department_code)                         
    AND  (ISNULL(@par_to_month,'') = ''                                              
     OR @par_to_month <> ''                                               
     AND MONTH(B.travel_datefiled_original) = @par_to_month                                                  
     )                                              
    AND  (ISNULL(@par_department_code,'') = ''                                              
     OR @par_department_code <> ''                                              
     --AND B.department_code    = @par_department_code                                              
     )       
   AND ISNULL(B.to_emergency,0) = 1      
   --AND B.department_code NOT IN ('11','12','21','22','23','24','20','18','19')                                                  
      AND B.approval_status <> 'F'                                           
    UNION                                                  
     -- Transaction Status for Log in by LEVEL 1 Approver                                                  
    SELECT                                                   
      ISNULL(A.approval_id,'')     AS approval_id                                                  
     ,ISNULL(A.user_id_creator,'') AS user_id_creator                                                  
     ,ISNULL(A.empl_id,'')      AS empl_id_owner                                                  
     ,ISNULL(L.empl_id,'')      AS empl_id_creator                                                  
     ,'1'       AS approval_status                                                 
     ,ISNULL(B.transaction_descr,'')    AS transaction_descr                        
     ,E.approval_status_descr     AS worklist_status                                                  
    ,'View Details'   AS worklist_action                                                  
     ,''    AS next_status                                                  
      ,ISNULL(J.last_name,'NoLastName') + ', ' +  ISNULL(J.first_name,'NoFirstName') + ' '                                                
   + IIF(ISNULL(J.middle_name,'') = '', ' ', LEFT(J.middle_name,1) + '. ' )                                                
   + ISNULL(J.suffix_name,'')  as owner_name                                                 
   ,ISNULL(L.last_name,'NoLastName') + ', ' +  ISNULL(L.first_name,'NoFirstName') + ' '                                                
   + IIF(ISNULL(L.middle_name,'') = '', ' ', LEFT(L.middle_name,1) + '. ' )                          
   + ISNULL(L.suffix_name,'')  as creator_name                                                    
     ,ISNULL(A.reviewed_comment,'')    AS reviewed_comment                                                  
     ,ISNULL(A.level1_approval_comment,'')  AS level1_approval_comment                                      
     ,ISNULL(A.level2_approval_comment,'')  AS level2_approval_comment                             
     ,ISNULL(A.final_approval_comment,'')  AS final_approval_comment                                                  
     ,ISNULL(A.disapproval_comment,'')   AS disapproval_comment                          
     ,ISNULL(A.cancel_pending_comment,'')  AS cancel_pending_comment                                                   
     ,ISNULL(A.cancelled_comment,'')    AS cancelled_comment                                                   
     ,ISNULL(C.travel_order_no,'')    AS application_nbr                                                  
     ,ISNULL(C.travel_requestor_empl_id,'')  AS created_by_user                                                  
     ,ISNULL(C.posting_status,'')    AS posting_status                                                  
     ,ISNULL(C.travel_justification,'')   AS detail_remarks                                                  
     ,CONVERT(varchar,DATEPART(yyyy,C.travel_datefiled_original))+'-'                                                  
     +RIGHT('00'+CONVERT(varchar,DATEPART(mm,C.travel_datefiled_original)),2)+'-'                                                  
     +RIGHT('00'+CONVERT(varchar,DATEPART(dd,C.travel_datefiled_original)),2)                                                   
      AS travel_datefiled                          
            
 --   , CONVERT(varchar, DATEPART(yyyy, A.reviewed_date)) + '-' +                                  
 --    RIGHT('00'+ CONVERT(varchar, DATEPART(mm, A.reviewed_date)),2) + '-' +                                  
 --    RIGHT('00'+ CONVERT(varchar, DATEPART(dd, A.reviewed_date)),2)                                  
 --    AS reviewed_date                           
 --   ,A.user_id_reviewer  AS  user_id_reviewer             
 -- ,CONVERT(varchar, DATEPART(yyyy, A.level1_approval_date)) + '-' +                                  
 --    RIGHT('00'+ CONVERT(varchar, DATEPART(mm, A.level1_approval_date)),2) + '-' +                                  
 --    RIGHT('00'+ CONVERT(varchar, DATEPART(dd, A.level1_approval_date)),2)                           
 --     AS level1_approval_date                          
 --   ,user_id_level1_approver  AS user_id_level1_approver           
 --,CONVERT(varchar, DATEPART(yyyy, A.level2_approval_date)) + '-' +                                  
 --    RIGHT('00'+ CONVERT(varchar, DATEPART(mm, A.level2_approval_date)),2) + '-' +                                  
 --    RIGHT('00'+ CONVERT(varchar, DATEPART(dd, A.level2_approval_date)),2)                           
 --     AS level2_approval_date           
 --   ,user_id_level2_approver  AS user_id_level2_approver             
 --,CONVERT(varchar, DATEPART(yyyy, A.final_approval_date)) + '-' +               
 --    RIGHT('00'+ CONVERT(varchar, DATEPART(mm, A.final_approval_date)),2) + '-' +                                  
 --    RIGHT('00'+ CONVERT(varchar, DATEPART(dd, A.final_approval_date)),2)                           
 --     AS final_approval_date                
 --   ,user_id_final_approver  AS user_id_final_approver                                                   
    FROM travelorder_hdr_tbl C                                                 
     INNER JOIN HRIS_PAY.dbo.approvalworkflow_tbl A                                             
      ON A.approval_id = C.approval_id                                                  
                                           
     INNER JOIN vw_approvalstatus_tbl E                                                  
      ON A.approval_status = E.approval_status                                                    
                                                  
     INNER JOIN HRIS_PAY.dbo.transactionsref_tbl B                                                  
ON A.transaction_code = B.transaction_code                                                  
      AND A.transaction_code IN ('003')                                                  
                  
     LEFT JOIN HRIS_PAY.dbo.vw_personnelnames_tbl J                                                  
      ON A.empl_id = J.empl_id                                                  
                                                  
     INNER JOIN HRIS_PAY.dbo.usersprofile_tbl D1                                                  
      ON  D1.user_id = A.user_id_creator                                                  
                                            
     LEFT JOIN HRIS_PAY.dbo.vw_personnelnames_tbl L                                                  
      ON L.empl_id = D1.empl_id                                                  
                                                  
     INNER JOIN HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl Z                                                  
      ON  Z.empl_id = C.travel_requestor_empl_id                                                  
      AND Z.effective_date = (SELECT MAX(Z1.effective_date) FROM HRIS_PAY.dbo.payrollemployeemaster_hdr_tbl Z1                                    
       WHERE Z1.empl_id  = Z.empl_id                                                  
       AND Z1.emp_rcrd_status = 1)                                                  
      AND Z.emp_rcrd_status = 1                                            
      AND Z.department_code    = @par_department_code                                                    
       --EXEC sp_approval_worklist_travel_order 'U5791','21',@par_to_year,'03',''                                           
    WHERE            
 -- A.user_id_final_approver = @par_user_id                
   A.user_id_level1_approver = @par_user_id                                                  
     AND   A.approval_status IN ('1','F')                                                  
                
 AND   B.with_self_service = 1                                                  
    AND   YEAR(C.travel_datefiled_original) = @par_to_year                                                
    --AND   MONTH(C.travel_datefiled) = @par_to_month                                                  
    --AND   (Z.department_code = @par_department_code)                                                  
    --AND   (Z.employment_type = @par_employment_type)                                
    AND  (ISNULL(@par_to_month,'') = ''                                              
     OR @par_to_month <> ''                                               
     AND MONTH(C.travel_datefiled_original) = @par_to_month                                                  
     )                                              
    AND  (ISNULL(@par_department_code,'') = ''                                              
     OR @par_department_code <> ''   
     --AND Z.department_code    = @par_department_code                                            
     )      
      
             
          
                                  
    -- UNION TO PAYROLL EMPLOYEE MASTER ASSIGNED TABLE                                              
    UNION                                              
    SELECT                                                   
      ISNULL(A.approval_id,'')     AS approval_id                                                  
     ,ISNULL(A.user_id_creator,'')    AS user_id_creator                                                  
     ,ISNULL(A.empl_id,'')    AS empl_id_owner                                                  
     ,ISNULL(A.empl_id_creator,'')    AS empl_id_creator                                                 
     ,B.approval_status       AS approval_status                                                  
     ,ISNULL(A.transaction_descr,'')    AS transaction_descr                                                 
     ,A.worklist_status       AS worklist_status                                                
     --,A.worklist_action                                                
     ,CASE                                                
      WHEN ( SELECT                                              
      COUNT(M.workflow_authority)                                              
      FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
      WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
      AND M.transaction_code = '003'                                              
     ) > 1                                              
      THEN (                                              
      CASE ( SELECT TOP 1                                              
     M.workflow_authority                                              
     FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
     WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                   
     AND M.transaction_code = '003'                                              
     ORDER BY M.workflow_authority DESC                                              
       )                                              
       WHEN '1' THEN 'For Approval - Level 1'                                              
      WHEN '2' THEN 'For Approval - Level 2'                                              
       ELSE 'For Final Approval'                                              
      END                                              
     )                  
      ELSE A.worklist_action                                              
     END          AS worklist_action                                               
     --,IIF (RIGHT(A.transaction_page_name,1) = '=','',RIGHT(A.transaction_page_name,1)) AS next_status                                                  
     ,CASE                                                
      WHEN ( SELECT                                              
      COUNT(M.workflow_authority)                                              
      FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
      WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
      AND M.transaction_code = '003'                                              
     ) > 1                                              
      THEN (                                              
      CASE ( SELECT TOP 1                                              
     M.workflow_authority                                              
     FROM HRIS_PAY.dbo.transactionsapprover_tbl M                                              
     WHERE M.empl_id = REPLACE(@par_user_id, 'U', '')                                              
     AND M.transaction_code = '003'                                              
     ORDER BY M.workflow_authority DESC                                              
       )                                              
       WHEN '1' THEN '1'                                              
       WHEN '2' THEN '2'                                              
       ELSE 'F'                                   
      END                                              
     )                                              
      ELSE (                                              
      IIF (RIGHT(A.transaction_page_name,1) = '=','',RIGHT(A.transaction_page_name,1))                                              
     )                                              
     END           AS next_status                                               
     ,ISNULL(A.owner_name,'')     AS owner_name                                                   
     ,ISNULL(A.creator_name,'')     AS creator_name                                                   
     ,ISNULL(A.reviewed_comment,'')    AS reviewed_comment                                                  
     ,ISNULL(A.level1_approval_comment,'')  AS level1_approval_comment                                                  
     ,ISNULL(A.level2_approval_comment,'')  AS level2_approval_comment                                                  
     ,ISNULL(A.final_approval_comment,'')  AS final_approval_comment                                        
     ,ISNULL(A.disapproval_comment,'')   AS disapproval_comment                                                
     ,ISNULL(A.cancel_pending_comment,'')  AS cancel_pending_comment                                                   
     ,ISNULL(A.cancelled_comment,'')    AS cancelled_comment                                                   
     ,ISNULL(B.travel_order_no,'')    AS application_nbr                                                  
     ,ISNULL(B.travel_requestor_empl_id,'')  AS created_by_user                                                  
     ,ISNULL(B.posting_status,'')    AS posting_status                                                  
     ,ISNULL(B.travel_justification,'')   AS detail_remarks                      
     ,CONVERT(varchar,DATEPART(yyyy,B.travel_datefiled_original))+'-'                                                  
      +RIGHT('00'+CONVERT(varchar,DATEPART(mm,B.travel_datefiled_original)),2)+'-'                                                  
      +RIGHT('00'+CONVERT(varchar,DATEPART(dd,B.travel_datefiled_original)),2) AS travel_datefiled                                                  
  --     ,''    AS reviewed_date                          
  --, ''  AS  user_id_reviewer                          
  --,''  AS level1_approval_date                          
  --,''  AS user_id_level1_approver                          
  --,''  AS final_approval_date            
  --,''  AS user_id_level2_approver                          
  --,''  AS final_approva2_date                        
  --,''  AS user_id_final_approver                                        
    FROM HRIS_PAY.dbo.func_approval_worklist_travel_order(@par_user_id) A                                                
     INNER JOIN travelorder_hdr_tbl B                                                
      ON B.approval_id = A.approval_id                                                
    WHERE YEAR(B.travel_datefiled_original) = @par_to_year                                              
    --AND   MONTH(B.travel_datefiled)  = @par_to_month                             
    AND  (ISNULL(@par_to_month,'') = ''                                              
     OR @par_to_month <> ''                                               
     AND MONTH(B.travel_datefiled_original) = @par_to_month                                                  
     )                                              
    AND   (A.empl_id IN (SELECT                                               
      X1.empl_id                                               
      FROM HRIS_PAY.dbo.payrollemployeemaster_asg_tbl X1                                      
      WHERE X1.department_code = @par_department_code                                              
      AND X1.ss_appl_flag = 1                                              
      AND X1.effective_date = (SELECT                                               
      MAX(X2.effective_date)                                     
      FROM HRIS_PAY.dbo.payrollemployeemaster_asg_tbl X2                                                
      WHERE X2.empl_id  = X1.empl_id)))                                              
      --AND X1.employment_type = @par_employment_type))                                              
     ) AS MN          
   INNER JOIN HRIS_PAY.dbo.approvalworkflow_tbl Z                          
  ON Z.approval_id = MN.approval_id          
  INNER JOIN HRIS_ATS.dbo.travelorder_hdr_tbl Z2        
  ON Z2.travel_order_no = MN.application_nbr        
   INNER JOIN HRIS_PAY.dbo.vw_departments_tbl_list D        
  ON D.department_code = Z2.department_code          
  --INNER JOIN  HRIS_ATS.dbo.travel_order_ldnf_tbl Z3       
  --ON Z3.travel_order_no = Z2.travel_order_no      
  --WHERE Z3.to_emergency = 0                                  
    ORDER BY MN.travel_datefiled DESC                                         
  END                                        
                                           
END 