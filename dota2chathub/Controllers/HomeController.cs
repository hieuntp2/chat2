using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Microsoft.AspNet.Identity;
using dota2chathub.Models;

namespace dota2chathub.Controllers
{
#if DEBUG
     [Authorize]
#else
     [Authorize]
#endif

    public class HomeController : Controller
    {
         ProjectDEntities db = new ProjectDEntities();

        public ActionResult Index()
        {
            string id = User.Identity.GetUserId();
            ViewBag.userid = db.AspNetUsers.SingleOrDefault(t => t.Id == id).UserName;
            return View();
        }      
    }
}