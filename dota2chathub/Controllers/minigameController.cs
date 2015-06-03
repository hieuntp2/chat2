using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace dota2chathub.Controllers
{
    public class minigameController : Controller
    {
        //
        // GET: /minigame/
        public ActionResult Index(string gameaddress)
        {
            ViewBag.gameaddress = gameaddress;
            return PartialView();
        }
	}
}