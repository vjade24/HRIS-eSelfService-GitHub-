//**********************************************************************************
// PROJECT NAME     :   HRIS - eComval
// VERSION/RELEASE  :   HRIS Release #1
// PURPOSE          :   Code Behind for Change Password and Profile Picture
//**********************************************************************************
// REVISION HISTORY
//**********************************************************************************
// AUTHOR                    DATE            PURPOSE
//----------------------------------------------------------------------------------
// Lorraine I. Ale       12/26/2019      Code Creation
//**********************************************************************************
using HRIS_Common;
using HRIS_eSelfService.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eSelfService.Controllers
{
    public class cChangePasswordController : Controller
    {
        HRIS_DEVEntities db = new HRIS_DEVEntities();
        CommonDB Cmn = new CommonDB();
        // GET: cChangePassword
        public ActionResult Index()
        {
            User_Menu um = new User_Menu();
            if (Session["user_id"] == null || Session["user_id"].ToString().Trim() =="")
            {
                return RedirectToAction("Index","Login");
            }
            if (um != null || um.ToString() != "")
            {
                um.allow_add            = (int)Session["allow_add"];
                um.allow_delete         = (int)Session["allow_delete"];
                um.allow_edit           = (int)Session["allow_edit"];
                um.allow_edit_history   = (int)Session["allow_edit_history"];
                um.allow_print          = (int)Session["allow_print"];
                um.allow_view           = (int)Session["allow_view"];
                um.url_name             = Session["url_name"].ToString();
                um.id                   = (int)Session["id"];
                um.menu_name            = Session["menu_name"].ToString();
                um.page_title           = Session["page_title"].ToString();
            }
            return View(um);
        }
        public ActionResult UserAccessOnPage(int id)
        {
            Session["user_menu_id"] = id;
            return Json("success", JsonRequestBehavior.AllowGet);
        }
        protected JsonResult JSON(object data, JsonRequestBehavior behavior)
        {
            return new JsonResult()
            {
                Data                = data,
                ContentType         = "application/json",
                ContentEncoding     = Encoding.UTF8,
                JsonRequestBehavior = behavior,
                MaxJsonLength       = Int32.MaxValue
            };
        }
        public ActionResult InitializeData()
        {
            try
            {
                string empl_id     = "";
                var empl_name      = "";
                if (Session["user_id"] != null)
                {
                    empl_id         = Session["user_id"].ToString();
                    empl_name       = Session["first_name"].ToString() + " " + Session["last_name"];
                    var pass        = db.sp_usersprofile_tbl(empl_id).FirstOrDefault();
                    var user_info   = db.sp_userprofile_tbl(empl_id).FirstOrDefault();
                    var empl_id2    = Session["empl_id"].ToString();
                    var empl_address = db.vw_personneladdresses_tbl.Where(a => a.address_type == "00" && a.empl_id == empl_id2).FirstOrDefault();
                    var emp_photo_byte_arr  = db.personnel_tbl.Where(a => a.empl_id == empl_id2).FirstOrDefault().empl_photo_img;

                    //ADDED BY JORGE: 10-02-2020 
                    var emp_photo_signature_check = db.personnel_sig_tbl.Where(a => a.empl_id == empl_id2).FirstOrDefault();


                    var emp_photo_initial   = Array.Empty<byte>();
                    var emp_photo_full      = Array.Empty<byte>();

                    if (emp_photo_signature_check != null)
                    {
                        emp_photo_initial = db.personnel_sig_tbl.Where(a => a.empl_id == empl_id2).FirstOrDefault().initial_sig;
                        emp_photo_full = db.personnel_sig_tbl.Where(a => a.empl_id == empl_id2).FirstOrDefault().full_sig;
                    }


                    

                    string imreBase64Data   = "";
                    string imgDataURL       = "";

                    //ADDED BY JORGE: 10-02-2020 
                    string imreBase64Data_initial = "";
                    string imgDataURL_initial = "";

                    string imreBase64Data_full = "";
                    string imgDataURL_full = "";

                    //***************convert byte array to image***********************************
                    if (emp_photo_byte_arr != null)
                    {
                        imreBase64Data  = Convert.ToBase64String(emp_photo_byte_arr);
                        imgDataURL = string.Format("data:image/png;base64,{0}", imreBase64Data);
                    }
                    else
                    {
                        imgDataURL = "../ResourcesImages/upload_profile.png";
                    }

                    //***************convert byte array to image***********************************
                    if (emp_photo_initial != null)
                    {
                        imreBase64Data_initial = Convert.ToBase64String(emp_photo_initial);
                        imgDataURL_initial = string.Format("data:image/png;base64,{0}", imreBase64Data_initial);
                    }
                    else
                    {
                        imgDataURL_initial = "";
                    }

                    //***************convert byte array to image***********************************
                    if (emp_photo_full != null)
                    {
                        imreBase64Data_full = Convert.ToBase64String(emp_photo_full);
                        imgDataURL_full = string.Format("data:image/png;base64,{0}", imreBase64Data_full);
                    }
                    else
                    {
                        imgDataURL_full = "";
                    }

                    return JSON(new { empl_id, empl_name, pass, imgDataURL,user_info, imgDataURL_initial, imgDataURL_full, empl_address }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return JSON(new { empl_id = "", empl_name = "", pass = "" , imgDataURL  = ""}, JsonRequestBehavior.AllowGet);
                }
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult DecryptPass(string p_current_pass)
        {
            try
            {
                //string decrypted_current_pass = Cmn.EncryptString(p_current_pass, Cmn.CONST_WORDENCRYPTOR);
                string decrypted_current_pass = Cmn.DecryptString(p_current_pass, Cmn.CONST_WORDENCRYPTOR);

                return Json(new { message = "success", decrypted_current_pass }, JsonRequestBehavior.AllowGet);
            }
            catch (DbEntityValidationException e)
            {
                string message = DbEntityValidationExceptionError(e);
                return Json(new { message = message }, JsonRequestBehavior.AllowGet);
            }
        }
        //Updated By: Joseph M. Tombo Jr. OLD Approach
        //Updated Date: 01/06/2020
        //public ActionResult upload_image_profile(string par_file )
        //{
        //    string error_message        = "";
        //    Byte[] imgByte              = Convert.FromBase64String(par_file);
        //    bool valid_image            = true;
        //    bool success                = false;
        //    //HttpFileCollection filex    = par_file;

        //    //    for (int i = 0; i < filex.Count; i++)
        //    //    {
        //    //        HttpPostedFile file = filex[i];
        //    //        if (Path.GetExtension(file.FileName).ToLower() != ".jpg" &&
        //    //            Path.GetExtension(file.FileName).ToLower() != ".png" &&
        //    //            Path.GetExtension(file.FileName).ToLower() != ".gif" &&
        //    //            Path.GetExtension(file.FileName).ToLower() != ".jpeg" &&
        //    //            Path.GetExtension(file.FileName).ToLower() != ".pdf"
        //    //        )
        //    //        {

        //    //            error_message   = "Only jpg, png , gif, .jpeg, .pdf are allowed.!";
        //    //            valid_image     = false;
        //    //        }
        //    //        decimal size = Math.Round(((decimal)file.ContentLength / (decimal)1024), 2);
        //    //        if (size > 2048)
        //    //        {
        //    //            error_message = error_message+" File size should not exceed 2 MB.!";
        //    //            valid_image = false;
        //    //        }
        //    //        imgByte = new Byte[file.ContentLength];
        //    //}

        //    if (valid_image)
        //    {
        //        string scriptInsertUpdate   = string.Empty;
        //        string tablesscript         = "personnel_tbl";
        //        string columns              = "empl_photo_img";
        //        string where_statement      = "WHERE empl_id ='" + Session["empl_id"].ToString().Trim() + "'";


        //        scriptInsertUpdate = Cmn.updatetable_for_image(tablesscript, columns, imgByte, where_statement);

        //        if ((scriptInsertUpdate == "") || (scriptInsertUpdate.Substring(0, 1) == "X"))
        //        {
        //            error_message = "Error while Saving!";
        //            success = false;
        //        }
        //        else {
        //            error_message = "Successfully Uploaded";
        //            success = true;
        //        }
        //    }

        //    return Json(new { success, error_message }, JsonRequestBehavior.AllowGet);
        //}

        //Updated By: Joseph M. Tombo Jr. NEW APPROACH
        //Accept 5 MB File Image
        //Updated Date: 01/06/2020
        [HttpPost] //Overides as POST 
        public ActionResult upload_image_profile(HttpPostedFileBase par_file)
        {
            var file = Request.Files;
            string error_message    = "";
            Byte[] imgByte          = null;
            bool valid_image        = true;
            bool success            = false;
            if (par_file != null && par_file.ContentLength > 0)
            {
                //Image Validation
                if (Path.GetExtension(par_file.FileName).ToLower() != ".jpg" &&
                    Path.GetExtension(par_file.FileName).ToLower() != ".png" &&
                    Path.GetExtension(par_file.FileName).ToLower() != ".gif" &&
                    Path.GetExtension(par_file.FileName).ToLower() != ".jpeg" &&
                    Path.GetExtension(par_file.FileName).ToLower() != ".pdf"
                )
                {

                    error_message = "Only jpg, png , gif, .jpeg, .pdf are allowed.!";
                    valid_image = false;
                }
                decimal size = Math.Round(((decimal)par_file.ContentLength / (decimal)1024), 2);
                if (size > 8192)
                {
                    error_message = error_message + " File size should not exceed 2 MB.!";
                    valid_image = false;
                }
                imgByte = new Byte[par_file.ContentLength];
                //Convert imgByte to Proper Image Byte to be save in the database;
                par_file.InputStream.Read(imgByte, 0, par_file.ContentLength);
            }
            else
            {
                error_message = "Receive a NULL parameter";
                valid_image = false;
            }
            
            

            if (valid_image)
            {
                string scriptInsertUpdate = string.Empty;
                string tablesscript = "personnel_tbl";
                string columns = "empl_photo_img";
                string where_statement = "WHERE empl_id ='" + Session["empl_id"].ToString().Trim() + "'";

                //Saving Image Using method in common db
                scriptInsertUpdate = Cmn.updatetable_for_image(tablesscript, columns, imgByte, where_statement);

                if ((scriptInsertUpdate == "") || (scriptInsertUpdate.Substring(0, 1) == "X"))
                {
                    error_message = "Error while Saving!";
                    success = false;
                }
                else
                {
                    error_message = "Successfully Uploaded";
                    success = true;
                }
            }

            return JSON(new { success, error_message }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ContentResult Upload()
        {
            string error_message    = "";
            Byte[] imgByte          = null;
            bool valid_image        = true;
            bool success            = false;
            string value            = "";

            if (Request.Form.Count > 0)
            {

                value = Request.Form[0].ToString();
            }

            foreach (string key in Request.Files)
            {
                HttpPostedFileBase postedFile = Request.Files[key];
              
                if (postedFile != null && postedFile.ContentLength > 0)
                {
                    //Image Validation
                    if (Path.GetExtension(postedFile.FileName).ToLower() != ".jpg" &&
                        Path.GetExtension(postedFile.FileName).ToLower() != ".png" &&
                        Path.GetExtension(postedFile.FileName).ToLower() != ".gif" &&
                        Path.GetExtension(postedFile.FileName).ToLower() != ".jpeg" &&
                        Path.GetExtension(postedFile.FileName).ToLower() != ".pdf"
                    )
                    {

                        error_message = "Only jpg, png , gif, .jpeg, .pdf are allowed.!";
                        valid_image = false;
                    }
                    decimal size = Math.Round(((decimal)postedFile.ContentLength / (decimal)1024), 2);
                    if (size > 8192)
                    {
                        error_message = error_message + " File size should not exceed 2 MB.!";
                        valid_image = false;
                    }
                    imgByte = new Byte[postedFile.ContentLength];
                    //Convert imgByte to Proper Image Byte to be save in the database;
                    postedFile.InputStream.Read(imgByte, 0, postedFile.ContentLength);
                }
                else
                {
                    error_message = "Receive a NULL parameter";
                    valid_image = false;
                }

                

                string scriptInsertUpdate   = string.Empty;
                string tablesscript         = "";
                string columns              = "";
                string where_statement      = "";
                var emp_photo_initial       = Array.Empty<byte>();
                var emp_photo_full          = Array.Empty<byte>();

                if (value == "0")
                {
                    scriptInsertUpdate = string.Empty;
                    tablesscript = "personnel_tbl";
                    columns = "empl_photo_img";
                    where_statement = "WHERE empl_id ='" + Session["empl_id"].ToString().Trim() + "'";

                }

                if (value == "1")
                {
                    scriptInsertUpdate = string.Empty;
                    tablesscript = "personnel_sig_tbl";
                    columns = "initial_sig";
                    where_statement = "WHERE empl_id ='" + Session["empl_id"].ToString().Trim() + "'";

                }

                if (value == "2")
                {
                    scriptInsertUpdate = string.Empty;
                    tablesscript = "personnel_sig_tbl";
                    columns = "full_sig";
                    where_statement = "WHERE empl_id ='" + Session["empl_id"].ToString().Trim() + "'";
                }

                if (valid_image)
                {
                    //For signature only
                    if (value != "0")
                    {
                        Graphics g;
                        ImageConverter ic = new ImageConverter();
                        Image img = (Image)ic.ConvertFrom(imgByte);
                        //Bitmap bitmap1 = new Bitmap(img);
                        //g = Graphics.FromImage(bitmap1);
                        //g.Clear(Color.White);

                        //imgByte = ImageToByte(bitmap1);

                        Bitmap SourceImage = new Bitmap(img);
                        Bitmap SourceImageAddjust = new Bitmap(img);

                        float brightness = 1.0f; // no change in brightness
                        float contrast = 2.0f; // twice the contrast
                        float gamma = 1.5f; // no change in gamma

                        //float adjustedBrightness = brightness - 1.0f;
                        float adjustedBrightness = 0.0f;
                        // create matrix that will brighten and contrast the image
                        float[][] ptsArray ={
                                        new float[] {contrast, 0, 0, 0, 0}, // scale red
                                        new float[] {0, contrast, 0, 0, 0}, // scale green
                                        new float[] {0, 0, contrast, 0, 0}, // scale blue
                                        new float[] {0, 0, 0, 1.0f, 0}, // don't scale alpha
                                        new float[] {adjustedBrightness, adjustedBrightness, adjustedBrightness, 0, 1}};

                        ImageAttributes imageAttributes = new ImageAttributes();
                        imageAttributes.ClearColorMatrix();
                        imageAttributes.SetColorMatrix(new ColorMatrix(ptsArray), ColorMatrixFlag.Default, ColorAdjustType.Bitmap);
                        imageAttributes.SetGamma(gamma, ColorAdjustType.Bitmap);
                        Graphics g1 = Graphics.FromImage(SourceImage);
                        g1.DrawImage(SourceImage, new Rectangle(0, 0, SourceImageAddjust.Width, SourceImageAddjust.Height)
                            , 0, 0, SourceImage.Width, SourceImage.Height,
                            GraphicsUnit.Pixel, imageAttributes);


                        using (Graphics gr = Graphics.FromImage(SourceImage)) // SourceImage is a Bitmap object
                        {
                            var gray_matrix = new float[][] {
                                            new float[] { 0.299f, 0.299f, 0.299f, 0, 0 },
                                            new float[] { 0.587f, 0.587f, 0.587f, 0, 0 },
                                            new float[] { 0.114f, 0.114f, 0.114f, 0, 0 },
                                            new float[] { 0,      0,      0,      1, 0 },
                                            new float[] { 0,      0,      0,      0, 1 }
                                        };
                            float dd = 0.8f;
                            var ia = new System.Drawing.Imaging.ImageAttributes();
                            //ia.SetColorMatrix(new System.Drawing.Imaging.ColorMatrix(gray_matrix));
                            ia.SetThreshold(dd); // Change this threshold as needed

                            var rc = new Rectangle(0, 0, SourceImage.Width, SourceImage.Height);
                            gr.DrawImage(SourceImage, rc, 0, 0, SourceImage.Width, SourceImage.Height, GraphicsUnit.Pixel, ia);
                        }

                        for (int x = 0; x < SourceImage.Width; x++)
                        {
                            for (int y = 0; y < SourceImage.Height; y++)
                            {
                                Color currentColor = SourceImage.GetPixel(x, y);
                                if (currentColor.R >= 220 && currentColor.G >= 220 && currentColor.B >= 220)
                                {
                                    SourceImage.SetPixel(x, y, Color.Transparent);
                                }
                            }
                        }
                        imgByte = ImageToByte2(SourceImage);
                    }
                    
                    //Saving Image Using method in common db
                    scriptInsertUpdate = Cmn.updatetable_for_image(tablesscript, columns, imgByte, where_statement);
                    

                    if ((scriptInsertUpdate == "") || (scriptInsertUpdate.Substring(0, 1) == "X"))
                    {
                        //error_message = "Error while Saving!";
                        //success = false;

                        if (value == "1") //UPLOAD FOR INITIAL SIGNATURE
                        {
                            emp_photo_initial = imgByte;
                        }

                        else if (value == "2") //UPLOAD FOR FINAL SIGNATURE
                        {
                            emp_photo_full = imgByte;
                        }

                        var empl_id_check = Session["empl_id"].ToString();
                        var personnel_sig_tbl_check = db.personnel_sig_tbl.Where(a => a.empl_id == empl_id_check).FirstOrDefault();

                        //ADD NOT EXISTS
                        if (personnel_sig_tbl_check == null)
                        {
                            personnel_sig_tbl personnel_sig_tbl = new personnel_sig_tbl();
                            personnel_sig_tbl.empl_id = Session["empl_id"].ToString();
                            personnel_sig_tbl.initial_sig = emp_photo_initial;
                            personnel_sig_tbl.full_sig = emp_photo_full;
                            db.personnel_sig_tbl.Add(personnel_sig_tbl);
                            db.SaveChanges();
                        }

                        //UPDATE EXISTS
                        else
                        {
                            personnel_sig_tbl_check.initial_sig                 = emp_photo_initial;
                            personnel_sig_tbl_check.full_sig                    = emp_photo_full;
                            db.SaveChanges();
                        }

                        
                    }
                    else //UPLOAD FOR PROFILE PICTURE.
                    {
                        error_message = "Successfully Uploaded";
                        success = true;
                    }
                }
            }

            return Content("Success"+"|"+error_message);
        }


        [HttpPost]
        public ContentResult ScanSignature()
        {
            string error_message    = "";
            Byte[] imgByte          = null;
            bool valid_image        = true;
            bool success            = false;
            string value            = "";
            string imreBase64Data   = "";
            string imgDataURL       = "";
            if (Request.Form.Count > 0)
            {

                value = Request.Form[0].ToString();
            }

            foreach (string key in Request.Files)
            {
                HttpPostedFileBase postedFile = Request.Files[key];
              
                if (postedFile != null && postedFile.ContentLength > 0)
                {
                    //Image Validation
                    if (Path.GetExtension(postedFile.FileName).ToLower() != ".jpg" &&
                        Path.GetExtension(postedFile.FileName).ToLower() != ".png" &&
                        Path.GetExtension(postedFile.FileName).ToLower() != ".gif" &&
                        Path.GetExtension(postedFile.FileName).ToLower() != ".jpeg" &&
                        Path.GetExtension(postedFile.FileName).ToLower() != ".pdf"
                    )
                    {

                        error_message = "Only jpg, png , gif, .jpeg, .pdf are allowed.!";
                        valid_image = false;
                    }
                    decimal size = Math.Round(((decimal)postedFile.ContentLength / (decimal)1024), 2);
                    if (size > 8192)
                    {
                        error_message = error_message + " File size should not exceed 2 MB.!";
                        valid_image = false;
                    }
                    imgByte = new Byte[postedFile.ContentLength];
                    //Convert imgByte to Proper Image Byte to be save in the database;
                    postedFile.InputStream.Read(imgByte, 0, postedFile.ContentLength);
                }
                else
                {
                    error_message = "Receive a NULL parameter";
                    valid_image = false;
                }

                var emp_photo_initial       = Array.Empty<byte>();
                var emp_photo_full          = Array.Empty<byte>();

                
                if (valid_image)
                {
                    Graphics g;
                    ImageConverter ic = new ImageConverter();
                    Image img = (Image)ic.ConvertFrom(imgByte);
                    //Bitmap bitmap1 = new Bitmap(img);
                    //g = Graphics.FromImage(bitmap1);
                    //g.Clear(Color.White);

                    //imgByte = ImageToByte(bitmap1);

                    Bitmap SourceImage          = new Bitmap(img);
                    Bitmap SourceImageAddjust   = new Bitmap(img);

                    float brightness    = 1.0f; // no change in brightness
                    float contrast      = 2.0f; // twice the contrast
                    float gamma         = 1.5f; // no change in gamma

                    //float adjustedBrightness = brightness - 1.0f;
                    float adjustedBrightness = 0.0f;
                    // create matrix that will brighten and contrast the image
                    float[][] ptsArray ={
                                        new float[] {contrast, 0, 0, 0, 0}, // scale red
                                        new float[] {0, contrast, 0, 0, 0}, // scale green
                                        new float[] {0, 0, contrast, 0, 0}, // scale blue
                                        new float[] {0, 0, 0, 1.0f, 0}, // don't scale alpha
                                        new float[] {adjustedBrightness, adjustedBrightness, adjustedBrightness, 0, 1}};

                    ImageAttributes imageAttributes = new ImageAttributes();
                    imageAttributes.ClearColorMatrix();
                    imageAttributes.SetColorMatrix(new ColorMatrix(ptsArray), ColorMatrixFlag.Default, ColorAdjustType.Bitmap);
                    imageAttributes.SetGamma(gamma, ColorAdjustType.Bitmap);
                    Graphics g1 = Graphics.FromImage(SourceImage);
                    g1.DrawImage(SourceImage, new Rectangle(0, 0, SourceImageAddjust.Width, SourceImageAddjust.Height)
                        , 0, 0, SourceImage.Width, SourceImage.Height,
                        GraphicsUnit.Pixel, imageAttributes);


                    using (Graphics gr = Graphics.FromImage(SourceImage)) // SourceImage is a Bitmap object
                    {
                        var gray_matrix = new float[][] {
                                            new float[] { 0.299f, 0.299f, 0.299f, 0, 0 },
                                            new float[] { 0.587f, 0.587f, 0.587f, 0, 0 },
                                            new float[] { 0.114f, 0.114f, 0.114f, 0, 0 },
                                            new float[] { 0,      0,      0,      1, 0 },
                                            new float[] { 0,      0,      0,      0, 1 }
                                        };
                        float dd = 0.8f;
                        var ia = new System.Drawing.Imaging.ImageAttributes();
                        //ia.SetColorMatrix(new System.Drawing.Imaging.ColorMatrix(gray_matrix));
                        ia.SetThreshold(dd); // Change this threshold as needed

                        var rc = new Rectangle(0, 0, SourceImage.Width, SourceImage.Height);
                        gr.DrawImage(SourceImage, rc, 0, 0, SourceImage.Width, SourceImage.Height, GraphicsUnit.Pixel, ia);
                    }

                    for (int x = 0; x < SourceImage.Width; x++)
                    {
                        for (int y = 0; y < SourceImage.Height; y++)
                        {
                            Color currentColor = SourceImage.GetPixel(x, y);
                            if (currentColor.R >= 220 && currentColor.G >= 220 && currentColor.B >= 220)
                            {
                                SourceImage.SetPixel(x, y, Color.Transparent);
                            }
                        }
                    }
                    imgByte                 = ImageToByte2(SourceImage);
                   
                    if (imgByte != null)
                    {
                        imreBase64Data = Convert.ToBase64String(imgByte);
                        imgDataURL = string.Format("data:image/png;base64,{0}", imreBase64Data);
                    }
                    else
                    {
                        imgDataURL = "../ResourcesImages/upload_profile.png";
                    }
                    error_message = "Successfully Uploaded";
                    success = true;
                }
            }

            return Content("Success"+"|"+error_message+"|"+ imgDataURL);
        }

        public static byte[] ImageToByte2(Image img)
        {
            using (var stream = new MemoryStream())
            {
                img.Save(stream, System.Drawing.Imaging.ImageFormat.Png);
                return stream.ToArray();
            }
        }

        public ActionResult ChangePassword(string inputed_password, string user_name)
        {
            var success = true;
            var message = "";
            try
            {
                string encrypted_password           = Cmn.EncryptString(inputed_password, Cmn.CONST_WORDENCRYPTOR);
                string usernam_gg                   = user_name;
                var userprofile_tblX                = db.usersprofile_tbl.Where(a => a.user_id == usernam_gg).FirstOrDefault();
                userprofile_tblX.user_password      = encrypted_password;
                userprofile_tblX.change_password    = false;
                userprofile_tblX.last_updated_date  = DateTime.Now;
                userprofile_tblX.last_updated_by    = user_name;
                db.SaveChanges();
            }
            catch (Exception e)
            {
                message = e.Message;
                success = false;
            }


            return Json(new { success, message,inputed_password }, JsonRequestBehavior.AllowGet);
        }

        public String DbEntityValidationExceptionError(DbEntityValidationException e)
        {
            string message = "";
            foreach (var eve in e.EntityValidationErrors)
            {
                Console.WriteLine("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:", eve.Entry.Entity.GetType().Name, eve.Entry.State);

                foreach (var ve in eve.ValidationErrors)
                {
                    message = "- Property: \"{0}\", Error: \"{1}\"" + ve.PropertyName + "  :  " + ve.ErrorMessage;
                    Console.WriteLine("- Property: \"{0}\", Error: \"{1}\"",
                        ve.PropertyName, ve.ErrorMessage);
                }
            }
            return message;
        }
    }
}