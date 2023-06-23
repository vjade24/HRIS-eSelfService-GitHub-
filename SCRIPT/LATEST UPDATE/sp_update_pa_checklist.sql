-- EXEC sp_update_pa_checklist '0000115153','000000000365850',''


ALTER PROCEDURE sp_update_pa_checklist                                     
 @par_travel_order_no  VARCHAR(15),                                        
 @par_approval_id   VARCHAR(15),                                         
 @par_empl_id  VARCHAR(10)        
 WITH RECOMPILE                                      
                                      
AS              
BEGIN                
                 
                                   
 DECLARE @v_apwflw_status VARCHAR(04)                                      
 DECLARE @v_chck_status VARCHAR(02)   
 DECLARE @v_chck_dttm DATETIME                   
 
 SET @v_apwflw_status = (SELECT approval_status FROM HRIS_PAY.dbo.approvalworkflow_tbl WHERE approval_id  = @par_approval_id)
 

 UPDATE travelOrder_pa_checklist_tbl
 SET approval_status =  @v_apwflw_status
 WHERE travel_order_no = @par_travel_order_no

 IF @par_empl_id <> ''
 BEGIN 

     SET @v_chck_status = (SELECT approved_status FROM HRIS_ATS.dbo.travel_order_check_tbl WHERE travel_order_no  = @par_travel_order_no AND empl_id = @par_empl_id)
	 SET @v_chck_dttm   = (SELECT approved_dttm FROM HRIS_ATS.dbo.travel_order_check_tbl WHERE travel_order_no  = @par_travel_order_no AND empl_id = @par_empl_id)
	 IF ISNULL(@v_chck_status,'') <> ''
	 BEGIN
	      IF @v_chck_status = 0
		  BEGIN
		      SET  @v_chck_status = 'D'
		  END
		  ELSE
		  BEGIN
		      SET  @v_chck_status = 'Y'
		  END
	 END
	 ELSE
	 BEGIN
		SET @v_chck_status = 'N'
	 END

	 

	 UPDATE travelOrder_pa_checklist_tbl
	 SET approved_status =  @v_chck_status
	 ,check_approved_dttm = @v_chck_dttm
	 WHERE travel_order_no = @par_travel_order_no
	 AND empl_id  = @par_empl_id
 END
 ELSE
 BEGIN

	 DECLARE @v_empl_id VARCHAR(10)
    
	 DECLARE CUR CURSOR FOR 
	 SELECT 
	  empl_id
	 FROM travelorder_empl_dtl_tbl
	 WHERE travel_order_no = @par_travel_order_no

	 OPEN CUR

	 FETCH NEXT FROM CUR   
     INTO @v_empl_id

	 WHILE @@FETCH_STATUS = 0  
     BEGIN  

	       DECLARE @v_approvedstatus VARCHAR(01)
		   DECLARE @v_approveddttm DATETIME

		  SET @v_approvedstatus  =  (SELECT approved_status FROM travel_order_check_tbl WHERE travel_order_no = @par_travel_order_no AND empl_id = @v_empl_id)
		  SET @v_approveddttm  =  (SELECT approved_dttm FROM travel_order_check_tbl WHERE travel_order_no = @par_travel_order_no AND empl_id = @v_empl_id)
		  
		
		
		  IF ISNULL(@v_approvedstatus,'') <> ''
		  BEGIN
		      UPDATE travelOrder_pa_checklist_tbl
		      SET approved_status = (SELECT IIF(@v_approvedstatus = 0,'D','Y'))
			  ,check_approved_dttm = @v_approveddttm
			  WHERE travel_order_no = @par_travel_order_no
			  AND empl_id  = @v_empl_id
		  END
		  ELSE
		  BEGIN
			  UPDATE travelOrder_pa_checklist_tbl
		      SET approved_status = 'N'
			  WHERE travel_order_no = @par_travel_order_no
			  AND empl_id  = @v_empl_id
		  END

	      FETCH NEXT FROM CUR   
          INTO @v_empl_id
	 END

	 CLOSE CUR;  
     DEALLOCATE CUR;  
 END
END


