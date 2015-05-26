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
            //game.addUser("119437241");
            //game.addUser("156209444");
            //game.addUser("195465703");
            //game.addUser("4294967295");
            //game.addUser("152565161");
            //game.addUser("138385940");

            game.hostid = "151312";

            StaticData.addGame(game);

            
#endif
            
        }
    }
}
