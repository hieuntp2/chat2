using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using dota2chathub.Models;
using Microsoft.AspNet.Identity;
using System.Threading.Tasks;

namespace dota2chathub.Module.PublicChat
{
    [HubName("ServerHub")]
    public partial class ServerHub : Hub
    {
        ProjectDEntities db = new ProjectDEntities();
        ////////////////////////////////
        /////// PUBLIC CHAT ROOM ///////
        ////////////////////////////////
        public void PublicChatSend(string message, string userid)
        {
            ChatMessageObject mess = new ChatMessageObject()
            {
                userid = userid,
                message = message
            };
            Clients.Others.acceptGreet(Newtonsoft.Json.JsonConvert.SerializeObject(mess));
        }

        //////////////////////////////////////
        ///////// Override Function //////////
        //////////////////////////////////////
        public override System.Threading.Tasks.Task OnConnected()
        {
            // Khi người dùng đăng nhập vào, thì đồng thời lưu userid-connectid vào list để quản lý
#if DEBUG
             StaticData.setConnectionId("151312", Context.ConnectionId);            
#else
            StaticData.setConnectionIdbyAspNetUserID(Context.User.Identity.GetUserId(), Context.ConnectionId);
#endif
            return base.OnConnected();
        }

        public override System.Threading.Tasks.Task OnDisconnected(bool stopCalled)
        {
            // Khi người dùng disconect thì đồng thời loại bỏ user ra khỏi list quản lý
#if DEBUG
           // StaticData.removeOfflineUser("151312");
#else
            StaticData.removeOfflineUserbyAspNetUser(Context.User.Identity.GetUserId());
#endif
            
            return base.OnDisconnected(stopCalled);
        }

        public override System.Threading.Tasks.Task OnReconnected()
        {
#if DEBUG
            StaticData.setConnectionId("151312", Context.ConnectionId);
#else
            StaticData.setConnectionIdbyAspNetUserID(Context.User.Identity.GetUserId(),Context.ConnectionId);
#endif
            // Khi người dùng reconect thì ghi nhận lại connection id
            //
            return base.OnReconnected();
        }      
    }
}