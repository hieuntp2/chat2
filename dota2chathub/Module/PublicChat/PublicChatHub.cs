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
        ////////////////////////////////
        /////// PUBLIC CHAT ROOM ///////
        ////////////////////////////////
        public void PublicChatSend(string message)
        {
            ChatMessageObject mess = new ChatMessageObject()
            {
                userid = "1",
                name = "hieu",
                message = message
            };
            Clients.All.acceptGreet(Newtonsoft.Json.JsonConvert.SerializeObject(mess));
        }
    }

    public class ChatMessageObject
    {
        public string name { get; set; }
        public string linkavatar { get; set; }
        public string userid { get; set; }
        public string message { get; set; }

        /// <summary>
        /// 0: public chat room
        /// </summary>
        public string idGroup { get; set; }
    }
}