//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Web;
//using Microsoft.AspNet.SignalR;

//namespace dota2chathub
//{
//    public class ChatHub : Hub
//    {
//        public void Hello()
//        {
//            Clients.All.hello();
//        }

//        public void Send(string name, string message)
//        {
//            // Call the addNewMessageToPage method to update clients.
//            ChatMessageObject mess = new ChatMessageObject() { 
//                name = "hieu",
//                message = "hello client"
//            };
//            Clients.All.addNewMessageToPage(Newtonsoft.Json.JsonConvert.SerializeObject(mess));
//        }
//    }

   
//}