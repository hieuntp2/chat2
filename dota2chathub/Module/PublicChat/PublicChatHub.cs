using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;

namespace dota2chathub.Module.PublicChat
{
    [HubName("ServerHub")]
    public class ServerHub : Hub
    {
        public void Hello()
        {
            Clients.All.hello();
        }

        public void Send()
        {
            Clients.All.acceptGreet("from server hub");
        }
    }
}