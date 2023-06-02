USE [HRIS_ATS]
GO
/****** Object:  Trigger [dbo].[trg_payrollemployee_tax_hdr_tbl_insert]    Script Date: 08/05/2023 2:08:53 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER TRIGGER trg_travelorderhdr_lvl2_insert
	ON HRIS_ATS.dbo.travelorder_hdr_tbl
AFTER INSERT, UPDATE	
AS
BEGIN
	
	      DECLARE @v_count_on_empl_dtl	  INT
		  DECLARE @v_count_on_empl_check  INT

	      DECLARE @v1_travel_order_no                  varchar(15)
	      DECLARE @v1_travel_datefiled                 date
	      DECLARE @v1_travel_datefiled_original        date
	      DECLARE @v1_travel_form_type                 varchar(1)
	      DECLARE @v1_travel_place_visit               varchar(250)
		  DECLARE @v1_travel_purpose				   varchar(250)
		  DECLARE @v1_travel_requestor_empl_id		   varchar(10)
		  DECLARE @v1_travel_type_code				   varchar(2)
		  DECLARE @v1_travel_details				   varchar(250)
		  DECLARE @v1_travel_with_claims			   bit
		  DECLARE @v1_travel_justification			   varchar(250)
		  DECLARE @v1_approval_status				   varchar(1)
		  DECLARE @v1_posting_status				   bit
		  DECLARE @v1_approval_id					   varchar(15)
		  DECLARE @v1_department_code				   varchar(2)
		  DECLARE @v1_updated_by_user				   varchar(10)
		  DECLARE @v1_updated_dttm					   datetime
		  DECLARE @v1_recappr_empl					   varchar(10)
		  DECLARE @v1_firstappr_empl_id				   varchar(10)
		  DECLARE @v1_finalappro_empl_id			   varchar(10)
		  DECLARE @v1_ldnf							   bit
		  DECLARE @v1_to_emergency					   bit
		  DECLARE @v1_late_justification			   varchar(250)



		  SET @v1_travel_order_no =  ''
		  SET @v1_travel_datefiled =	''
		  SET @v1_travel_datefiled_original =	''
		  SET @v1_travel_form_type =	''
		  SET @v1_travel_place_visit =	''
		  SET @v1_travel_purpose  =''
		  SET @v1_travel_requestor_empl_id =''
		  SET @v1_travel_type_code = ''
		  SET @v1_travel_details  = ''
		  SET @v1_travel_with_claims = 0
		  SET @v1_travel_justification = ''
		  SET @v1_approval_status  = ''
		  SET @v1_posting_status  = 0
		  SET @v1_approval_id  = ''
		  SET @v1_department_code = ''
		  SET @v1_updated_by_user = ''
		  SET @v1_updated_dttm = ''
		  SET @v1_recappr_empl = ''
		  SET @v1_firstappr_empl_id = ''
		  SET @v1_finalappro_empl_id = ''
		  SET @v1_ldnf  = 0
		  SET @v1_to_emergency = 0
		  SET @v1_late_justification =''


     									
	      SELECT @v1_travel_order_no           			= A.travel_order_no           	
				,@v1_travel_datefiled          			= A.travel_datefiled          	
				,@v1_travel_datefiled_original 			= A.travel_datefiled_original 	
				,@v1_travel_form_type          			= A.travel_form_type          	
				,@v1_travel_place_visit        			= A.travel_place_visit        	
				,@v1_travel_purpose						= A.travel_purpose				
				,@v1_travel_requestor_empl_id			= A.travel_requestor_empl_id	
				,@v1_travel_type_code					= A.travel_type_code			
				,@v1_travel_details						= A.travel_details				
				,@v1_travel_with_claims					= A.travel_with_claims			
				,@v1_travel_justification				= A.travel_justification		
				,@v1_approval_status					= A.approval_status			
				,@v1_posting_status						= A.posting_status				
				,@v1_approval_id						= A.approval_id				
				,@v1_department_code					= A.department_code			
				,@v1_updated_by_user					= A.updated_by_user			
				,@v1_updated_dttm						= A.updated_dttm				
				,@v1_recappr_empl						= A.recappr_empl				
				,@v1_firstappr_empl_id					= A.firstappr_empl_id			
				,@v1_finalappro_empl_id					= A.finalappro_empl_id			
				,@v1_ldnf								= A.ldnf						
				,@v1_to_emergency						= A.to_emergency				
				,@v1_late_justification					= A.late_justification			
				FROM inserted A
            

          IF @v1_approval_status = '2'
		  BEGIN 
		      INSERT INTO travelorder_lvl2_tbl 
			  SELECT @v1_travel_order_no,@v1_approval_status
		  END

		  IF @v1_approval_status NOT IN('2','F')
		  BEGIN
		      DELETE FROM travelorder_lvl2_tbl WHERE travel_order_no = @v1_travel_order_no 
		  END
END

