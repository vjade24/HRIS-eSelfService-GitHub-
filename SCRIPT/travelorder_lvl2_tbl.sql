USE [HRIS_ATS]
GO

-- DROP TABLE travelorder_lvl2_tbl
-- GO

/****** Object:  Table [dbo].[dtr_overrides_tbl]    Script Date: 09/05/2023 3:28:18 pm ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE travelorder_lvl2_tbl(
	 travel_order_no VARCHAR(15)
	,approval_status VARCHAR(1)
	,approved_comment VARCHAR(100)
    CONSTRAINT PK_travelorder_lvl2_tbl PRIMARY KEY NONCLUSTERED 
	(
		travel_order_no ASC
	)
) 
GO


