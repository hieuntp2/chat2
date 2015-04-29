using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace dota2chathub.Controllers
{
    public class PrivateChatController : Controller
    {
        //
        // GET: /PrivateChat/
        public ActionResult Index()
        {
            return PartialView();
        }
	}
}