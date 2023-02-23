using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using HRIS_Common;

namespace HRIS_eSelfService.View.cProfile
{
    /// <summary>
    /// Summary description for UploadFile
    /// </summary>
    public class UploadFile : IHttpHandler, System.Web.SessionState.IRequiresSessionState
    {

        public void ProcessRequest(HttpContext context)
        {
            string filedata = string.Empty;
            Byte[] imgByte = null;
            if (context.Request.Files.Count > 0)
            {
                HttpFileCollection files = context.Request.Files;
                string temp_id = context.Request["temp_id"];
                for (int i = 0; i < files.Count; i++)
                {
                    HttpPostedFile file = files[i];
                    if (Path.GetExtension(file.FileName).ToLower() != ".jpg" &&
                        Path.GetExtension(file.FileName).ToLower() != ".png" &&
                        Path.GetExtension(file.FileName).ToLower() != ".gif" &&
                        Path.GetExtension(file.FileName).ToLower() != ".jpeg" &&
                        Path.GetExtension(file.FileName).ToLower() != ".pdf"
                    )
                    {
                        context.Response.ContentType = "text/plain";
                        context.Response.Write("Only jpg, png , gif, .jpeg, .pdf are allowed.!");
                        return;
                    }
                    decimal size = Math.Round(((decimal)file.ContentLength / (decimal)1024), 2);
                    if (size > 2048)
                    {
                        context.Response.ContentType = "text/plain";
                        context.Response.Write("File size should not exceed 2 MB.!");
                        return;
                    }
                    string fname;
                    if (HttpContext.Current.Request.Browser.Browser.ToUpper() == "IE" || HttpContext.Current.Request.Browser.Browser.ToUpper() == "INTERNETEXPLORER")
                    {
                        string[] testfiles = file.FileName.Split(new char[] {
                        '\\'
                    });
                        fname = testfiles[testfiles.Length - 1];
                    }
                    else
                    {
                        fname = Path.GetExtension(file.FileName);
                    }

                   
                    imgByte = new Byte[file.ContentLength];
                    //force the control to load data in array
                    file.InputStream.Read(imgByte, 0, file.ContentLength);
                  
                    //HRIS_eSelfService.View.cProfile.cProfile.imageByte = imgByte;
                    //CommonDB.GLOBAL_image_upload_byte = imgByte;
                    if (context.Session["session_image_byte"] != null)
                    {
                        context.Session["session_image_byte"] = BitConverter.ToString(imgByte);
                    }

                    //context.Response.ContentType = "text/plain";
                    //context.Response.Write(imgByte.ToString());
                    //context.Session["image_byte"] = imgByte;
                    //HRIS_eSelfService.View.cProfile.image_byte image_Byte = new image_byte();
                    //image_Byte.set_imageByte(imgByte);
                    //here UploadFile is define my folder name , where files will be store.  
                    //string uploaddir = System.Configuration.ConfigurationManager.AppSettings["UploadFile"];
                    //filedata = temp_id + fname;
                    //fname = Path.Combine(context.Server.MapPath("~/" + uploaddir + "/"), "UploadFile/" + filedata);
                    //file.SaveAs(fname);
                }
            }
            context.Response.ContentType = "text/plain";
            context.Response.Write("File Uploaded Successfully:" + BitConverter.ToString(imgByte));
            //if you want to use file path in aspx.cs page , then assign it in to session  
            // context.Session["PathImage"] = filedata;
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}