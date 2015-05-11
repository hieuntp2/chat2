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
        public ActionResult Index(string groupname, string pass, string userid)
        {        
            ViewBag.groupname = groupname;
            ViewBag.pass = pass;
            return PartialView();
        }

        // GET: PublicChat
        public ActionResult joingroup(string groupid, string pass, string userid)
        {
            if (StaticData.checkPassword(groupid, pass))
            {
                GroupChat group = StaticData.getGroup(groupid);
                ViewBag.groupname = group.name;
                ViewBag.pass = pass;
                ViewBag.id = groupid;

                StaticData.addUsertoGroup(userid, groupid);
                return PartialView("Index");
            }
            else
            {
                return null;
            }            
        }
    }
}