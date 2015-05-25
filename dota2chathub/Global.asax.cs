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
            game.addUser("110027881");
            game.addUser("146916751");
            game.addUser("106533101");
            game.addUser("144008670");
            game.addUser("119437241");
            game.addUser("156209444");
            game.addUser("195465703");
            game.addUser("4294967295");
            game.addUser("152565161");
            game.addUser("138385940");

            //game.addUser("171483439");
            //game.addUser("110953924");
            //game.addUser("4294967295");
            //game.addUser("88982479");
            //game.addUser("165448166");
            //game.addUser("174221685");
            //game.addUser("103748605");
            //game.addUser("151852368");
            //game.addUser("162211577");
            //game.addUser("118311816");

            game.hostid = "76561198037078495f";

            StaticData.addGame(game);

            
#endif
            
        }
    }
}
