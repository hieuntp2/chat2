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
            GameMatch game = new GameMatch();
            game.id = "123";
            game.addUser("151312");
            game.addUser("testfriendid2");
            game.addUser("testfriendid3");
            game.addUser("testfriendid1");

            game.hostid = "151312";
           // game.name = "aaaa";

            StaticData.addGame(game);

            
#endif
            
        }
    }
}
