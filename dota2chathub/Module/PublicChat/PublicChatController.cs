using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace dota2chathub.Module.PublicChat
{
    public class PublicChatController : Controller
    {
        // GET: PublicChat
        public ActionResult Index()
        {
            ViewBag.test = "acb";
            return PartialView("~/Module/PublicChat/BoxPublicChat.cshtml");
        }
    }
}