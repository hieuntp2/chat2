using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using dota2chathub.Models;
using dota2chathub.Module.PublicChat;
using Microsoft.AspNet.Identity;
using System.Net;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using Microsoft.AspNet.SignalR;
using System;
using System.Threading.Tasks;

namespace dota2chathub.Controllers
{
    public class ServiceController : Controller
    {
        ProjectDEntities db = new ProjectDEntities();

#if DEBUG
        public ActionResult getuserinfo(string id)
        {
            UserInfo user = new UserInfo()
            {
                birthday = DateTime.Now,
                displayname = "test friend 1",
                linkavatar = "../../Content/account_default.png",
                steamid = "151312",
                userid = id,
                username = "testfriendid1",
                Totalscore = (new Random()).Next()
            };

            return Json(user, JsonRequestBehavior.AllowGet);
        }

        public ActionResult finduser(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return null;
            }
            //B1: Tìm kiếm theo tên trong db
            string[] words = name.Split(' ');
            List<string> users = new List<string>();
            users.Add("testfriendid1");
            users.Add("testfriendid2");

            return Json(users, JsonRequestBehavior.AllowGet);
        }

        public ActionResult getlistfriends(string steamid = null)
        {
            List<FriendInChatBox> listreturn = new List<FriendInChatBox>();
            listreturn.Add(new FriendInChatBox()
            {
                steamid = "151312",
                isonline = true
            });

            listreturn.Add(new FriendInChatBox()
            {
                steamid = "testfriendid2",
                isonline = false
            });  
            return Json(listreturn, JsonRequestBehavior.AllowGet);
        }


        public ActionResult getonlineusers(string steamid = null)
        {
            List<string> listreturn = new List<string>();
            listreturn.Add("151312");
            listreturn.Add("testfriendid2");
            listreturn.Add("testfriendid3");            
            return Json(listreturn, JsonRequestBehavior.AllowGet);
        }

        public ActionResult gettopuser()
        {
            List<string> user = new List<string>();
            user.Add("151312");
            user.Add("testfriendid2");
            user.Add("testfriendid3");
            return Json(user, JsonRequestBehavior.AllowGet);         
        }

        public int getuserrank(string userid)
        {
           switch(userid)
           {
               case "151312":
                   return 1;
               case "testfriendid2":
                   return 2;
               case "testfriendid3":
                   return 3;
               default:
                   return 4;
           }
        }
#else
        public ActionResult getuserinfo(string id)
        {
            UserInfo user = null;
            try
            {
                user = db.UserInfoes.SingleOrDefault(t => t.userid == id);
            }
            catch
            {
                user = null;
            }
            return Json(user, JsonRequestBehavior.AllowGet);
        }

        public ActionResult finduser(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return null;
            }
            //B1: Tìm kiếm theo tên trong db
            string[] words = name.Split(' ');
            List<string> users = (from item in db.UserInfoes.AsNoTracking()
                                  where words.All(val => item.displayname.Contains(val)) ||
                                        words.All(val => item.username.Contains(val))
                                  select item.userid).ToList();

            // B2: Loại bỏ các người chơi ko online
            for (int i = 0; i < users.Count; i++)
            {
                if (StaticData.checkUserOnline(users[i]))
                {
                    continue;
                }

                users.Remove(users[i]);
            }

            return Json(users, JsonRequestBehavior.AllowGet);
        }

        public ActionResult getlistfriends(string steamid = null)
        {
            if (steamid == null)
            {
                steamid = getCurrentSteamID();
            }

            // Get user From Db
            var client = new WebClient();
            var results = client.DownloadString("http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key="+ StaticData.Keys +"&steamid=" + steamid + "&relationship=friend");
            JObject result = (JObject)JsonConvert.DeserializeObject(results);

            // or
            // check useronline here

            List<FriendInChatBox> listreturn = new List<FriendInChatBox>();
            for (int i = 0; i < result["friendslist"]["friends"].Count(); i++)
            {
                string userid = result["friendslist"]["friends"][i]["steamid"].ToString();
                if (checkUserID(userid))
                {
                    if (StaticData.checkUserOnline(userid))
                    {
                        listreturn.Add(new FriendInChatBox()
                        {
                            steamid = result["friendslist"]["friends"][i]["steamid"].ToString(),
                            isonline = true
                        });
                    }
                    else
                    {
                        listreturn.Add(new FriendInChatBox()
                        {
                            steamid = result["friendslist"]["friends"][i]["steamid"].ToString(),
                            isonline = false
                        });
                    }
                }
                else
                {
                    continue;
                }
            }
            return Json(listreturn, JsonRequestBehavior.AllowGet);
        }

        public ActionResult getonlineusers(string steamid = null)
        {
            return Json(StaticData.getListUserOnline(), JsonRequestBehavior.AllowGet);
        }

        public List<string> gettopuser()
        {
            List<string> user = db.UserInfoes.OrderBy(t => t.Totalscore).Take(10).Select(t=>t.userid).ToList();
            return user;
        }

        public int getuserrank(string userid)
        {
            return db.UserInfoes.OrderBy(t => t.Totalscore).ToList().FindIndex(t => t.userid == userid);
        }
#endif
        public async Task updateUserScore(bool result)
        {
            string userid = getCurrentSteamID();
            UserInfo user = db.UserInfoes.SingleOrDefault(t => t.username == userid);

            if (result)
            {
                user.Totalscore += 1;
            }
            else
            {
                user.Totalscore -= 1;
            }

            db.Entry(user).State = System.Data.Entity.EntityState.Modified;
            await db.SaveChangesAsync();
        }

        public ActionResult findgroup(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return null;
            }

            string[] words = name.Split(' ');
            List<GroupChat> groups = new List<GroupChat>();

            groups = (from item in StaticData.getAllGroups()
                      where words.All(val => item.Value.name.Contains(val))
                      select new GroupChat
                      {
                          hostid = item.Value.hostid,
                          id = item.Value.id,
                          name = item.Value.name
                      }
                          ).ToList();

            return Json(groups, JsonRequestBehavior.AllowGet);
        }

        public ActionResult getUserInGroup(string groupid)
        {
            if (string.IsNullOrWhiteSpace(groupid))
            {
                return null;
            }

            List<string> user = StaticData.getListUserInGroup(groupid);
            if (user != null)
                return Json(user, JsonRequestBehavior.AllowGet);
            else
                return null;
        }

        private bool checkUserID(string userid)
        {
            UserInfo user = db.UserInfoes.SingleOrDefault(t => t.userid == userid);
            if (user != null)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        private string getCurrentSteamID()
        {
            string userid = User.Identity.GetUserId();
            return db.AspNetUsers.SingleOrDefault(t => t.Id == userid).UserName;
        }

        
    }

    public class FriendInChatBox
    {
        public string steamid { get; set; }
        public bool isonline { get; set; }
    }

}