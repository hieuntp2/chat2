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
    //[Authorize]
    public class HomeController : Controller
    {
        ProjectDEntities db = new ProjectDEntities();

        public ActionResult Index(string v = null)
        {
            ViewBag.userid = "151312";

            if(v==null)
            {
                return View();
            }
            else
            {
                return View("Index.v"+v);
            }            
        }

        public ActionResult FriendList(string v = null)
        {
            if(v==null)
            {
                return PartialView();
            }
            else
            {
                return PartialView();
            }            
        }

    }
}
#else
    [Authorize]
    public class HomeController : Controller
    {
        ProjectDEntities db = new ProjectDEntities();

        public ActionResult Index(string v = null)
        {
            string id = User.Identity.GetUserId();
            string steamid = db.AspNetUsers.SingleOrDefault(t => t.Id == id).UserName;
            ViewBag.userid = steamid;
            ViewBag.userifor = db.UserInfoes.SingleOrDefault(t => t.userid == steamid);
            if(v==null)
            {
                return View();
            }
            else
            {
                return View("Index.v"+v);
            }  
        }

        public ActionResult FriendList()
        {
            return PartialView();
        }

    }
}
#endif