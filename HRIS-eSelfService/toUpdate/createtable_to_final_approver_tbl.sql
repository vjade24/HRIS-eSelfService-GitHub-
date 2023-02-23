USE HRIS_ATS
GO

-- ACCESS TYPE
-- GOV  - 1
-- PA   - 2
-- PGH  - 3
-- AO   - 4
DROP TABLE to_final_approver_tbl
GO
--Select * from psb_panel_permanent_mbr_tbl
CREATE TABLE to_final_approver_tbl(
      user_id		VARCHAR(08)
	 ,read_auth		BIT
	 ,write_auth	BIT
	 ,access_type    INT
	 ,department_code VARCHAR(02)  -- IF department code is 00 means can approve all
	 ,CONSTRAINT PK_to_final_approver_tbl PRIMARY KEY CLUSTERED 
	 (
	 	user_id		ASC
	 ) 
)



--  INSERT INTO to_final_approver_tbl VALUES(
--    'U10058'
--    ,1
--    ,0
--    ,2
--    ,'00'
--  )
    
--  INSERT INTO to_final_approver_tbl VALUES(
--    'U8672'
--    ,1
--    ,1
--    ,2
--    ,'00'
--  )










