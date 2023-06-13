USE [HRIS_ATS]
GO
/****** Object:  Trigger [dbo].[trg_travel_order_check_tbl_insert_update]    Script Date: 10/05/2023 10:59:02 am ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER TRIGGER dbo.trg_travel_order_check_tbl_insert_update
	ON HRIS_ATS.dbo.travel_order_check_tbl

AFTER INSERT, UPDATE	
AS
BEGIN
	     
	      DECLARE @v_count_on_empl_dtl	  INT
		  DECLARE @v_count_on_empl_check  INT

	      DECLARE @v1_travel_order_no	  varchar(15)
	      DECLARE @v1_empl_id			  varchar(10)
	      DECLARE @v1_approved_status	  bit
	      DECLARE @v1_approved_dttm       datetime
	      DECLARE @v1_approved_by		  varchar(10)

		  SET @v1_travel_order_no	 =  ''
		  SET @v1_empl_id			 =	''
		  SET @v1_approved_status	 =	0
		  SET @v1_approved_dttm      =	''
		  SET @v1_approved_by		 =	''
     									
	      SELECT @v1_travel_order_no				= A.travel_order_no
				,@v1_empl_id						= A.empl_id
				,@v1_approved_status				= A.approved_status
				,@v1_approved_dttm					= A.approved_dttm
				,@v1_approved_by					= A.approved_by
				FROM inserted A

        SET @v_count_on_empl_dtl = (SELECT COUNT(*) FROM travelorder_empl_dtl_tbl WHERE travel_order_no = @v1_travel_order_no) 
		
		SET @v_count_on_empl_check =  (SELECT COUNT(*) FROM travel_order_check_tbl WHERE travel_order_no = @v1_travel_order_no AND approved_status = 1)  

		

		IF @v_count_on_empl_dtl = @v_count_on_empl_check AND @v1_approved_by IN(SELECT user_id FROM to_final_approver_tbl where access_type = 2)
		BEGIN
		     exec sp_travel_order_approve @v1_travel_order_no,'F','Final Approved',@v1_approved_by
		END

END


