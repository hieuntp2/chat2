using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using dota2chathub.Models;

namespace dota2chathub.Controllers
{
    public class ServiceController : Controller
    {
        ProjectDEntities db = new ProjectDEntities();
        // GET: Service
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult getuserinfo(string id)
        {
            UserInfo user = db.UserInfoes.SingleOrDefault(t=>t.userid == id);
            return Json(user, JsonRequestBehavior.AllowGet);
        }
    }
}