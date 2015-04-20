using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using dota2chathub.Models;
using Microsoft.AspNet.SignalR;
using dota2chathub.Module.PublicChat;

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
    }
}