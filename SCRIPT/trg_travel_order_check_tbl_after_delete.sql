USE [HRIS_ATS]
GO
/****** Object:  Trigger [dbo].[trg_travel_order_check_tbl_after_delete]    Script Date: 10/05/2023 10:58:43 am ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

--  DROP TRIGGER trg_travel_order_check_tbl_after_delete
--  GO

ALTER TRIGGER trg_travel_order_check_tbl_after_delete
	ON HRIS_ATS.dbo.travel_order_check_tbl

AFTER DELETE
AS
BEGIN
	
	      DECLARE @v_count_on_lvl2_tbl	  INT
		  DECLARE @v_travel_order_no      varchar(15)
          DECLARE @v_approval_status	  varchar(1)
          DECLARE @v_approved_comment	  varchar(100)

		  
          
          

	      DECLARE @v1_travel_order_no	  varchar(15)
	      DECLARE @v1_empl_id			  varchar(10)
	      DECLARE @v1_approved_status	  bit
	      DECLARE @v1_approved_dttm       datetime
	      DECLARE @v1_approved_by		  varchar(10)

		  SET @v_count_on_lvl2_tbl = 0

		  SET @v1_travel_order_no	 =  ''
		  SET @v1_empl_id			 =	''
		  SET @v1_approved_status	 =	0
		  SET @v1_approved_dttm      =	''
		  SET @v1_approved_by		 =	''

		  SET @v_travel_order_no     =  ''
		  SET @v_approval_status	 =	''
		  SET @v_approved_comment	 =	''
     									
	      SELECT @v1_travel_order_no				= A.travel_order_no
				,@v1_empl_id						= A.empl_id
				,@v1_approved_status				= A.approved_status
				,@v1_approved_dttm					= A.approved_dttm
				,@v1_approved_by					= A.approved_by
				FROM deleted A


		SELECT 
		 @v_travel_order_no   = A.travel_order_no 
		,@v_approval_status	  = A.approval_status	
		,@v_approved_comment  = A.approved_comment
		FROM travelorder_lvl2_tbl A WHERE travel_order_no = @v1_travel_order_no 
  

        SET @v_count_on_lvl2_tbl = (SELECT COUNT(*) FROM travelorder_lvl2_tbl WHERE travel_order_no = @v1_travel_order_no )
        
		IF @v_count_on_lvl2_tbl > 0
		BEGIN
		     exec sp_travel_order_approve @v1_travel_order_no,@v_approval_status,@v_approved_comment,@v1_approved_by
		END

END


