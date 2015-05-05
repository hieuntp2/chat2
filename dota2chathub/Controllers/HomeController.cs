﻿using System;
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
#else
     [Authorize]
#endif

    public class HomeController : Controller
    {
         ProjectDEntities db = new ProjectDEntities();

        public ActionResult Index()
        {
#if DEBUG
            ViewBag.userid = "151312";            
            return View();
#else
string id = User.Identity.GetUserId();
            string steamid = db.AspNetUsers.SingleOrDefault(t => t.Id == id).UserName;
            ViewBag.userid = steamid;
            ViewBag.userifor = db.UserInfoes.SingleOrDefault(t => t.userid == steamid);
            return View();
#endif
        }

        public ActionResult FriendList()
        {
            return PartialView();
        }

    }
}