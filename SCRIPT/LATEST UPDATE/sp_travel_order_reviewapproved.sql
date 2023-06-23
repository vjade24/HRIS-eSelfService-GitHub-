USE [HRIS_ATS]
GO
/****** Object:  StoredProcedure [dbo].[sp_travel_order_approve]    Script Date: 22/05/2023 1:49:38 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER  PROCEDURE sp_travel_order_reviewapproved
   @p_travel_order_no VARCHAR(15)
  ,@p_approval_status VARCHAR(1)
  ,@p_travel_details VARCHAR(150)
  ,@p_user_id VARCHAR(8)
AS 
BEGIN

  

  DECLARE @Tran VARCHAR(20);  
  SELECT @Tran = 'Transaction';

  BEGIN TRY
      DECLARE @v_returnmessage VARCHAR(150)
	   
      DECLARE @v_approval_id VARCHAR(15) 
	  DECLARE @v_travel_order_no VARCHAR(15)


	  SET @v_approval_id = ''
	  SET @v_travel_order_no = ''
	 
	


		  BEGIN TRAN @Tran


		  SELECT 
		   @v_travel_order_no = travel_order_no
		  ,@v_approval_id = approval_id
		  FROM travelorder_hdr_tbl
		  WHERE travel_order_no = @p_travel_order_no
			 
        IF ISNULL(@v_travel_order_no,'') <> ''
		BEGIN
		 UPDATE travelorder_hdr_tbl
		 SET approval_status = @p_approval_status
		 ,travel_details = @p_travel_details
		 ,updated_by_user = @p_user_id
		 ,updated_dttm = GETDATE()
		 WHERE travel_order_no = @p_travel_order_no

		 UPDATE travelorder_dates_dtl_tbl 
		 SET rcrd_status = @p_approval_status
		 WHERE travel_order_no = @p_travel_order_no 

		 UPDATE travelorder_empl_dtl_tbl 
		 SET rcrd_status = @p_approval_status
		 WHERE travel_order_no = @p_travel_order_no 

		 EXEC HRIS_PAY.dbo.sp_update_transaction_in_approvalworkflow_tbl @v_approval_id,@p_user_id,@p_approval_status,@p_travel_details

		END
			
          EXEC sp_update_pa_checklist @p_travel_order_no,@v_approval_id,''
	     COMMIT TRANSACTION @Tran; 
		 SELECT 'Successfully Reviewed'  as db_msg, '1' as db_code
  END TRY
  BEGIN CATCH
         COMMIT TRANSACTION @Tran; 
		 SELECT 'Error:'+ERROR_MESSAGE()  as db_msg, '0' as db_code
  END CATCH
END
