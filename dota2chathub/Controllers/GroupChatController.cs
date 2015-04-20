using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace dota2chathub
{
    public class GroupChatController : Controller
    {
        // GET: PublicChat
        public ActionResult Index(string groupname, string userid)
        {        
            ViewBag.groupname = groupname;
            return PartialView();
        }
    }
}