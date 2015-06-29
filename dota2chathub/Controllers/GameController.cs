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
        public ActionResult getuseringame(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return null;
            }

            return Json(StaticData.getUserInGame(id), JsonRequestBehavior.AllowGet);
        }

        public ActionResult get_fullinfo_useringame(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return null;
            }

            return Json(StaticData.getFullInfoUserInGame(id), JsonRequestBehavior.AllowGet);
        }

        // GET: PublicChat
        public async Task<ActionResult> joingame(string gameid, string pass, string userid)
        {
            if (StaticData.checkGamePassword(gameid, pass))
            {
                GameMatch game = StaticData.getGame(gameid);
                await StaticData.addUsertoGame(userid, gameid);

                return Json(game, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return HttpNotFound();
            }
        }

        public ActionResult setgroupidtogame(string groupid, string gameid)
        {
            if (!string.IsNullOrWhiteSpace(groupid) && !string.IsNullOrWhiteSpace(gameid))
            {
                StaticData.setGroupIDtoGame(groupid, gameid);
            }
            return null;
        }

        public ActionResult findgame(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return null;
            }

            string[] words = name.Split(' ');
            List<GameMatch> games = new List<GameMatch>();

            games = (from item in StaticData.getAllGameMatch()
                     where words.All(val => item.Value.name.Contains(val))
                     select new GameMatch
                     {
                         hostid = item.Value.hostid,
                         id = item.Value.id,
                         name = item.Value.name
                     }
                          ).ToList();

            return Json(games, JsonRequestBehavior.AllowGet);
        }

        public async Task<ActionResult> finishgame(string id)
        {
#if DEBUG
            id = "123";
#endif
            GameMatch game = null;
            await StaticData.FinishGame(id);

            // Nếu game đã xử lý xong kết quả
            if (StaticData.getGameState(id) == 3)
            {
                game = StaticData.getGame(id);
            }
            return Json(game, JsonRequestBehavior.AllowGet);
        }

        public string startgame(string id)
        {
#if DEBUG
            id = "123";
#endif
            if (StaticData.getGameState(id) == 0)
            {
                StaticData.startgame(id);
            }
            return "OK";
        }

        public void changeteam(string gameid, string userid, bool team)
        {
            StaticData.changeteam(gameid, userid, team);
        }

        public void submitresult(string gameid, string userid, bool result)
        {
            StaticData.submitresult(gameid, userid, result);
        }

        public GameMatch getgameinfo(string gameid)
        {
            return StaticData.getGame(gameid);
        }
    }
}