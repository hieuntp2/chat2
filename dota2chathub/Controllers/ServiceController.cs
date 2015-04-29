﻿using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using dota2chathub.Models;
using dota2chathub.Module.PublicChat;
using Microsoft.AspNet.Identity;
using System.Net;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using Microsoft.AspNet.SignalR;

namespace dota2chathub.Controllers
{
    public class ServiceController : Controller
    {
        ProjectDEntities db = new ProjectDEntities();

        public ActionResult getuserinfo(string id)
        {
            UserInfo user = db.UserInfoes.SingleOrDefault(t=>t.userid == id);
            return Json(user, JsonRequestBehavior.AllowGet);
        }

        public ActionResult finduser(string name)
        {
            if(string.IsNullOrWhiteSpace(name))
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
            for(int i = 0; i < users.Count; i++)
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
            if(steamid == null)
            {
                steamid = getCurrentUserID();
            }

            var client = new WebClient();
            var results = client.DownloadString("http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=3C627B068B6CD1170B25D133C6ECED2C&steamid=" + steamid + "&relationship=friend");

            // or
            // check useronline here
            //for (int i = 0; i < results.Length; i++)
            //{
            //    if (results.friendslist[i])
            //    {
            //        if(ServerHub.checkUserOnline(results[i]))
            //        {
            //            results[i].isonline = true;
            //        }
            //        else
            //        {
            //            results[i].isonline = false;
            //        }
            //    }
            //}

            JObject result = (JObject)JsonConvert.DeserializeObject(results);
            return Json(result, JsonRequestBehavior.AllowGet);
        }       

        private string getCurrentUserID()
        {
            return User.Identity.GetUserId();
            
        }
    }
}