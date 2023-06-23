USE [HRIS_ATS]
GO
/****** Object:  StoredProcedure [dbo].[sp_travel_order_approve]    Script Date: 22/05/2023 1:49:38 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

DROP PROCEDURE sp_travel_order_approve
GO
-- SELECT * FROM travelorder_empl_dtl_tbl where travel_order_no = '0000100088'
-- EXEC sp_travel_order_approve 1,'0000100092','8164','F','Final Approved','U10058'

CREATE  PROCEDURE sp_travel_order_approve
   @p_check_stat BIT
  ,@p_travel_order_no VARCHAR(15)
  ,@p_empl_id VARCHAR(08)
  ,@p_approval_status VARCHAR(1)
  ,@p_travel_details VARCHAR(150)
  ,@p_user_id VARCHAR(8)
AS 
BEGIN

  

  DECLARE @Tran VARCHAR(20);  
  SELECT @Tran = 'Transaction';

  BEGIN TRY
      
	  DECLARE @TABLE TABLE(
	     update_flag BIT
	  )
      
      DECLARE @v_returnmessage VARCHAR(150)
	   
      DECLARE @v_approval_id VARCHAR(15) 
	  DECLARE @v_travel_order_no VARCHAR(15)
	  DECLARE @v_approval_status VARCHAR(1)
	  DECLARE @v_approval_comment VARCHAR(150)
	

	  DECLARE @v2_approval_status  VARCHAR(1)
	  DECLARE @v2_travel_details   VARCHAR(150)

	  SET @v_approval_id = ''
	  SET @v_travel_order_no = ''
	  SET @v_approval_status = ''
	  SET @v_approval_comment = ''


	  SET @v2_approval_status = ''
	  SET @v2_travel_details = ''

		  BEGIN TRAN @Tran

			  SELECT
			   @v_approval_id = approval_id,
			   @v_travel_order_no = travel_order_no,
			   @v_approval_status = approval_status,
			   @v_approval_comment = travel_details
			  FROM HRIS_ATS.dbo.travelorder_hdr_tbl WHERE travel_order_no = @p_travel_order_no

			  IF @p_check_stat = 0
			  BEGIN
			      DECLARE @v_count INT
				  DECLARE @v_count2 INT
				  SET @v_count = 0
				  SET @v_count2 = 0

				  SET @v_count = (SELECT COUNT(*) FROM travel_order_check_tbl where travel_order_no = @p_travel_order_no AND empl_id  = @p_empl_id)
  
                  IF @v_count > 0
				  BEGIN
			           DELETE FROM travel_order_check_tbl where travel_order_no = @p_travel_order_no AND empl_id  = @p_empl_id
                  END
		          ELSE
				  BEGIN
				      SET @v_returnmessage = 'Not yet initialize'  
				  END

			  END 
			  ELSE
			  BEGIN
			      DECLARE @count_on_check			INT

				  SET @count_on_check	 = 0 

				  SET @count_on_check	 = (SELECT COUNT(*) FROM travel_order_check_tbl where travel_order_no = @p_travel_order_no AND empl_id  = @p_empl_id)
				
			      
				  IF @count_on_check = 0
				  BEGIN
				      INSERT INTO travel_order_check_tbl   -- INSERT TO travel order check table
					  SELECT 
					  @p_travel_order_no,
					  @p_empl_id,
					  1,
					  GETDATE(),
					  @p_user_id

					  SET @v_returnmessage = 'Successfully Approved'
				  END
				  ELSE
				  BEGIN
				      SET @v_returnmessage = 'Already Initialized'
				  END
			   
				 
			  END



	 DECLARE @count_approved1 AS INT    
     DECLARE @count_dsapproved1 AS INT    
     DECLARE @count_toempl AS INT    
    
     SET @count_approved1 = 0    
     SET @count_dsapproved1 = 0    
     SET @count_toempl = 0    
	 
	 SET @count_approved1 = (SELECT COUNT(*) FROM travel_order_check_tbl WHERE travel_order_no = @p_travel_order_no AND approved_status = 1)    
     SET @count_dsapproved1 = (SELECT COUNT(*) FROM travel_order_check_tbl WHERE travel_order_no = @p_travel_order_no AND approved_status = 0)    
     SET @count_toempl = (SELECT COUNT(*) FROM travelorder_empl_dtl_tbl WHERE travel_order_no = @p_travel_order_no)  
	 
	 IF @count_approved1 = @count_toempl
		 BEGIN

			   UPDATE HRIS_ATS.dbo.travelorder_hdr_tbl    -- update travel order header table    
			   SET  approval_status = 'F'    
				,travel_details  = 'Final Approved'    
				,updated_by_user = @p_user_id    
				,updated_dttm    = GETDATE()    
			   WHERE travel_order_no  = @p_travel_order_no    
      
			   UPDATE HRIS_ATS.dbo.travelorder_dates_dtl_tbl  -- update travel order dates table    
			   SET rcrd_status =  'F'    
			   WHERE travel_order_no  = @p_travel_order_no    
    
			   UPDATE HRIS_ATS.dbo.travelorder_empl_dtl_tbl  -- update travel order employee table    
			   SET rcrd_status =  'F'    
			   WHERE travel_order_no  = @p_travel_order_no    
    
			   INSERT INTO @TABLE    
			   EXEC HRIS_PAY.dbo.sp_update_transaction_in_approvalworkflow_tbl @v_approval_id,@p_user_id,'F','Final Approved'  -- update approvalworkflow table    
    

	            INSERT INTO travelorder_lvl2_tbl 
					 SELECT 
					 @p_travel_order_no,
					 @v_approval_status,
					 @v_approval_comment

			   set @v_returnmessage = 'Successfully Approved'    
		 END
	 ELSE IF @count_dsapproved1 = @count_toempl
	     BEGIN
			  
			   UPDATE HRIS_ATS.dbo.travelorder_hdr_tbl    -- update travel order header table
			   SET  approval_status = @p_approval_status
			    ,travel_details  = @p_travel_details
			    ,updated_by_user = @p_user_id
			    ,updated_dttm    = GETDATE()
			   WHERE travel_order_no  = @p_travel_order_no
  			   
			   UPDATE HRIS_ATS.dbo.travelorder_dates_dtl_tbl  -- update travel order dates table
			   SET rcrd_status =  @p_approval_status
			   WHERE travel_order_no  = @p_travel_order_no
			   
			   UPDATE HRIS_ATS.dbo.travelorder_empl_dtl_tbl  -- update travel order employee table
			   SET rcrd_status =  @p_approval_status
			   WHERE travel_order_no  = @p_travel_order_no
			   
			   INSERT INTO @TABLE
			   EXEC HRIS_PAY.dbo.sp_update_transaction_in_approvalworkflow_tbl @v_approval_id,@p_user_id,@p_approval_status,@p_travel_details  -- update approvalworkflow table


			    INSERT INTO travelorder_lvl2_tbl 
					 SELECT 
					 @p_travel_order_no,
					 @v_approval_status,
					 @v_approval_comment


					 SET @v_returnmessage = 'Successfully disapproved' 
		 END 
	 ELSE
	     BEGIN
		        DECLARE @v1_travel_order_no VARCHAR(15)
				DECLARE @v1_approval_status VARCHAR(1)
				DECLARE @v1_approval_comment VARCHAR(150)

		        SET @v1_travel_order_no = ''
	            SET @v1_approval_status = ''
	            SET @v1_approval_comment = ''
			  
			    SELECT 
					@v1_travel_order_no = travel_order_no, 
					@v1_approval_status = approval_status, 
					@v1_approval_comment = approved_comment
				FROM travelorder_lvl2_tbl
				WHERE travel_order_no = @p_travel_order_no 

				 IF ISNULL(@v1_travel_order_no,'') <> ''    
					BEGIN    
           
						 UPDATE HRIS_ATS.dbo.travelorder_hdr_tbl         -- update travel order header table    
						 SET  approval_status = @v1_approval_status    
						  ,travel_details  = @v1_approval_comment    
						  ,updated_by_user = @p_user_id    
						  ,updated_dttm    = GETDATE()    
						 WHERE travel_order_no  = @p_travel_order_no    
    
						 UPDATE HRIS_ATS.dbo.travelorder_dates_dtl_tbl  -- update travel order dates table    
						 SET rcrd_status =  @v1_approval_status    
						 WHERE travel_order_no  = @p_travel_order_no    
           
						 UPDATE HRIS_ATS.dbo.travelorder_empl_dtl_tbl   -- update travel order employee table    
						 SET rcrd_status =  @v1_approval_status    
						 WHERE travel_order_no  = @p_travel_order_no    
    
						 INSERT INTO @TABLE    
						 EXEC HRIS_PAY.dbo.sp_update_transaction_in_approvalworkflow_tbl @v_approval_id,@p_user_id,@v1_approval_status,@v1_approval_comment  -- update approvalworkflow table    
    
						 DELETE FROM travelorder_lvl2_tbl WHERE travel_order_no = @p_travel_order_no    
    
						 SET @v_returnmessage = 'Successfully Remove'    
					END     
				 ELSE    
					BEGIN    
						SET @v_returnmessage = 'No data inserted on travelorder_lvl2_tbl'    
					END 
		 END


		  EXEC sp_update_pa_checklist @p_travel_order_no,@v_approval_id,@p_empl_id

	     COMMIT TRANSACTION @Tran; 

		 SELECT 
		   @v_returnmessage  as db_msg
		 , '1' as db_code
  END TRY
  BEGIN CATCH
         COMMIT TRANSACTION @Tran; 
		 SELECT 
		 'Error:'+ERROR_MESSAGE()  as db_msg
		 , '0' as db_code
  END CATCH
END