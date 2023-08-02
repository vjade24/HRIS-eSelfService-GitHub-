 --DROP TABLE travelOrder_pa_checklist_tbl
 --GO
 
 CREATE TABLE travelOrder_pa_checklist_tbl(   
	travel_order_no                 VARCHAR(15)                                                   
   ,empl_id                         VARCHAR(10)                
   ,employee_name                   VARCHAR(100)                   
   ,position_title1                 VARCHAR(100)                        
   ,department_name1                VARCHAR(100)                             
   ,department_short_name           VARCHAR(50)                                
   ,dtr_date                        VARCHAR(MAX)                  
   ,travel_place_visit              VARCHAR(MAX)                           
   ,travel_purpose                  VARCHAR(MAX)                  
   ,travel_requestor_empl_id        VARCHAR(10)                              
   ,travel_requestor_empl_name      VARCHAR(MAX)                                    
   ,travel_type_code                VARCHAR(02)                      
   ,travel_type_descr               VARCHAR(50)                        
   ,travel_with_claims              BIT                          
   ,travel_justification            VARCHAR(MAX)                          
   ,report_header_descr             VARCHAR(200)                             
   ,approval_status                 VARCHAR(01)                        
   ,department_code                 VARCHAR(02)               
   ,approval_id                     VARCHAR(15)                 
   ,travel_datefiled_original       DATETIME
   ,check_approved_dttm             DATE
   ,lvl1n2_approved_dttm            DATETIME
   ,approved_status                 VARCHAR(01)
   ,created_dttm                    DATETIME
   ,created_user_by                 VARCHAR(10)
   ,updated_dttm                    DATETIME
   ,updated_user_by                 VARCHAR(10)
   CONSTRAINT PK_travelOrder_pa_checklist_tbl PRIMARY KEY CLUSTERED 
	(
		travel_order_no ASC,
		empl_id   ASC

	)
 ) 
