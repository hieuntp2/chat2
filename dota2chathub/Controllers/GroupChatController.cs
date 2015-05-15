using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace dota2chathub
{
    public class GroupChatController : Controller
    {
        // GET: PublicChat
        public ActionResult Index(string groupname, string pass, string userid, string v=null)
        {
            string id = StaticData.createGroup(groupname, userid, pass);
            ViewBag.groupname = groupname;
            ViewBag.pass = pass;
            ViewBag.id = id;

            if (v == null)
            {
                return PartialView();
            }
            else
            {
                return PartialView("Index.v" + v);
            }  
        }

        // GET: PublicChat
        public async Task<ActionResult> joingroup(string groupid, string pass, string userid)
        {
            if (StaticData.checkPassword(groupid, pass))
            {
                GroupChat group = StaticData.getGroup(groupid);
                ViewBag.groupname = group.name;
                ViewBag.pass = pass;
                ViewBag.id = groupid;

                await StaticData.addUsertoGroup(userid, groupid);
                return PartialView("Index");
            }
            else
            {
                return HttpNotFound();
            }            
        }
    }
}