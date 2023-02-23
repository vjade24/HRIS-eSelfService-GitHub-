using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace HRIS_eSelfService.Controllers
{
    public class cMainPageController : Controller
    {
        // GET: cMainPage
        public ActionResult Index()
        {
            return View();
        }
    }
}