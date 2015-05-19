using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace dota2chathub.Controllers
{
    public class GameController : Controller
    {
        // GET: PublicChat
        public ActionResult Index(string name, string pass, string userid, string v = null)
        {
            GameMatch game = new GameMatch
            {
                id = StaticData.createGame(name, userid, pass),
                name = name,
                password = pass,
                hostid = userid
            };

            return Json(game, JsonRequestBehavior.AllowGet); 
        }

        // GET: PublicChat
        public async Task<ActionResult> joingroup(string groupid, string pass, string userid, string v = null)
        {
            if (StaticData.checkPassword(groupid, pass))
            {
                GroupChat group = StaticData.getGroup(groupid);
                ViewBag.groupname = group.name;
                ViewBag.pass = pass;
                ViewBag.id = groupid;

                await StaticData.addUsertoGroup(userid, groupid);

                if (v == null)
                {
                    return PartialView("Index");
                }
                else
                {
                    return PartialView("Index.v" + v);
                }
            }
            else
            {
                return HttpNotFound();
            }
        }
    }
}