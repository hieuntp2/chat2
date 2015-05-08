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
                username = "testfriendid1"
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

        //public ActionResult findgroup(string name)
        //{
        //    List<GroupsInfor> groups = new List<GroupsInfor>();
        //    groups = (fr)
        //    return Json(groups, JsonRequestBehavior.AllowGet); 
        //}

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
                isonline = true
            });
            listreturn.Add(new FriendInChatBox()
            {
                steamid = "testfriendid3",
                isonline = true
            });
            return Json(listreturn, JsonRequestBehavior.AllowGet);
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
                if (ServerHub.users.ContainsKey(users[i]))
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
            var results = client.DownloadString("http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=3C627B068B6CD1170B25D133C6ECED2C&steamid=" + steamid + "&relationship=friend");
            JObject result = (JObject)JsonConvert.DeserializeObject(results);



            // or
            // check useronline here

            List<FriendInChatBox> listreturn = new List<FriendInChatBox>();
            for (int i = 0; i < result["friendslist"]["friends"].Count(); i++)
            {
                string userid = result["friendslist"]["friends"][i]["steamid"].ToString();
                if (checkUserID(userid))
                {
                    if (ServerHub.checkUserOnline(userid))
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

        public ActionResult findgroup(string name)
        {
            List<GroupsInfor> groups = new List<GroupsInfor>();
           
                return Json(groups, JsonRequestBehavior.AllowGet); 
        }
#endif


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

    public class GroupsInfor
    {
        public string id { get; set; }
        public string hostid { get; set; }
        public string name { get; set; }
    }
}