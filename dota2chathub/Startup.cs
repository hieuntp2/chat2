using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(dota2chathub.Startup))]
namespace dota2chathub
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
            // Any connection or hub wire up and configuration should go here
            app.MapSignalR();
        }
    }
}
