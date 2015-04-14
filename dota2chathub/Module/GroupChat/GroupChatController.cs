using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace dota2chathub.Module.PublicChat
{
    public class GroupChatController : Controller
    {
        // GET: PublicChat
        public ActionResult Index(string groupname, string userid)
        {
            ViewBag.groupid = ServerHub.addGroup(groupname, userid);            
            ViewBag.groupname = groupname;

            return PartialView("~/Module/GroupChat/BoxGroupChat.cshtml");
        }
    }
}