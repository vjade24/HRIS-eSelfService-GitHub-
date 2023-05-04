USE HRIS_ATS
GO

CREATE  PROCEDURE sp_travel_order_approve
   @p_travel_order_no VARCHAR(15)
  ,@p_approval_status VARCHAR(1)
  ,@p_travel_details VARCHAR(150)
  ,@p_user_id VARCHAR(8)
AS 
BEGIN

  

  DECLARE @Tran VARCHAR(20);  
  SELECT @Tran = 'Transaction';

  BEGIN TRY
		  BEGIN TRAN @Tran
			  DECLARE @v_approval_id VARCHAR(15) = (SELECT approval_id  FROM HRIS_ATS.dbo.travelorder_hdr_tbl WHERE travel_order_no = @p_travel_order_no)
			  UPDATE HRIS_ATS.dbo.travelorder_hdr_tbl
			  SET  approval_status = @p_approval_status
				  ,travel_details  = @p_travel_details
				  ,updated_by_user = @p_user_id
				  ,updated_dttm    = GETDATE()
			  WHERE travel_order_no  = @p_travel_order_no
  
			  UPDATE HRIS_ATS.dbo.travelorder_dates_dtl_tbl
			  SET rcrd_status =  @p_approval_status
			  WHERE travel_order_no  = @p_travel_order_no

			  UPDATE HRIS_ATS.dbo.travelorder_empl_dtl_tbl
			  SET rcrd_status =  @p_approval_status
			  WHERE travel_order_no  = @p_travel_order_no

			  EXEC HRIS_PAY.dbo.sp_update_transaction_in_approvalworkflow_tbl @v_approval_id,@p_user_id,@p_approval_status,@p_travel_details

	     COMMIT TRANSACTION @Tran; 
		 SELECT 'Successfully approved'  as db_msg, '1' as db_code
  END TRY
  BEGIN CATCH
   COMMIT TRANSACTION @Tran; 
		 SELECT 'Error:'+ERROR_MESSAGE()  as db_msg, '0' as db_code
  END CATCH
END
