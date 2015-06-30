using Owin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace dota2chathub
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

#if DEBUG
            //// This is for testing, debug only
            //GameMatch game = new GameMatch();
            //game.id = "123";

            //UserInGame user1 = new UserInGame();
            //user1.steamID = "151312";
            //user1.team = false;
            //game.addUser(user1);

            //UserInGame user2 = new UserInGame();
            //user2.steamID = "testfriendid2";
            //user2.team = false;
            //game.addUser(user2);

            //UserInGame user3 = new UserInGame();
            //user3.steamID = "testfriendid3";
            //user3.team = true;
            //game.addUser(user3);

            //UserInGame user4 = new UserInGame();
            //user4.steamID = "testfriendid1";
            //user4.team = true;
            //game.addUser(user4);

            //game.hostid = "151312";
            //game.name = "aaaa";
            //game.password = "123";

            //StaticData.createGroup("test group 1: aaa", "151312", "123");


            //StaticData.addGame(game);


#endif

        }
    }
}
