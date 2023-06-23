-- EXEC sp_travel_order_pa_checklist_tbl_2 '2023-06-14','','','','U10058'


CREATE PROCEDURE sp_travel_order_pa_checklist_tbl_2                                      
 @par_period_from  VARCHAR(30),                                        
 @par_period_to   VARCHAR(30),                                         
 @par_dept_code   VARCHAR(02),                                      
 @par_type    VARCHAR(02),                                      
 @par_user_id   VARCHAR(30)                                          
                                      
 WITH RECOMPILE                                      
                                      
AS              
                
                 
                                   
 DECLARE @v_dtr_year VARCHAR(04)                                      
 DECLARE @v_dtr_month VARCHAR(02)                    
 DECLARE @v_day   VARCHAR(02)                             
                              
                          
 DECLARE @v_pa_readonly  BIT                          
 DECLARE @v_pa_writeonly BIT                                   
                           
                         
 SET @v_pa_readonly  = 0                          
 SET @v_pa_writeonly = 0                          
                          
 SELECT                           
  @v_pa_readonly = read_auth                          
 ,@v_pa_writeonly = write_auth                          
 FROM to_final_approver_tbl                           
 where user_id  =  @par_user_id                          
 and access_type = 2                                         
                                      
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
        SET @par_period_from_covered_sp = CONVERT(DATE,@v_dtr_year +'-'+ @v_dtr_month + '-'+ @v_day)          
   END            
            
   IF ISNULL(@par_period_to,'') <> ''            
   BEGIN             
        SET @par_period_to_covered_sp = CONVERT(DATE,@par_period_to)               
   END            
   ELSE            
   BEGIN            
        SET @par_period_to_covered_sp   =  CONVERT(DATE,EOMONTH(@v_dtr_year +'-'+@v_dtr_month + '-' + @v_day))                 
   END                 
   
  

  SELECT                                       
   ROW_NUMBER() OVER(ORDER BY MN.travel_datefiled_original,MN.department_code,MN.employee_name,MN.dtr_date) AS row_nbr                                       
  ,travel_order_no	
  ,empl_id	
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
  ,approved_status	
  ,@v_pa_readonly  AS pa_readonly                             
  ,@v_pa_writeonly AS pa_writeonly                                    
 FROM HRIS_ATS.dbo.travelOrder_pa_checklist_tbl  MN  
 WHERE (CONVERT(DATE,MN.check_approved_dttm) BETWEEN CONVERT(DATE,@par_period_from_covered_sp) AND  CONVERT(DATE,@par_period_to_covered_sp))                                        
  AND MN.approval_status IN ('1','2','D','F') 
  AND MN.approved_status <> 'N'
 ORDER BY MN.travel_order_no  
 
 