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
    public class ServerHub : Hub
    {
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
            Clients.All.acceptGreet(Newtonsoft.Json.JsonConvert.SerializeObject(mess));
        }

        ////////////////////////////////
        /////// Private CHAT ROOM //////
        ////////////////////////////////

       
#if DEBUG
        public void sendprivateMessage(string userid, string message)
        {
            Clients.Caller.recivePrivateChatMessage(userid, message);
        }
#else
        public void sendprivateMessage(string userid, string message)
        {
            try
            {
                string connectionId = StaticData.users[userid];
                Clients.Client(connectionId).reciverprivatemessage(userid, message);
            }
            catch
            {
                Clients.Caller.reciverprivatemessage("", "User is offline");
            }
        }
#endif

        ////////////////////////////////
        /////// GROUP CHAT ROOM ///////
        ////////////////////////////////     
        public void GroupChatSend(string userid, string groupid, string message)
        {
            ChatMessageObject mess = new ChatMessageObject()
            {
                userid = userid,
                message = message
            };
            Clients.Group(groupid).reciveGroupChatMessage(Newtonsoft.Json.JsonConvert.SerializeObject(mess), groupid);
        }

        public async Task joingroup(string groupid, string userid)
        {
            await StaticData.addUsertoGroup(userid, groupid);

            // Lấy giá trị connectionID của userid
#if DEBUG
            await Groups.Add(StaticData.getConnectionID("151312"), groupid);
#else
            await Groups.Add(users[hostid], group.id);
#endif
        }


        //////////////////////////////////////
        ///////// Override Function //////////
        //////////////////////////////////////
        public override System.Threading.Tasks.Task OnConnected()
        {
            // Khi người dùng đăng nhập vào, thì đồng thời lưu userid-connectid vào list để quản lý
            //users.Add(Context.User.Identity.GetUserId(), Context.ConnectionId);

#if DEBUG
            StaticData.setConnectionId("151312", Context.ConnectionId);            
#else
            StaticData.users.Add(Context.User.Identity.GetUserId(), Context.ConnectionId);
#endif
            return base.OnConnected();
        }

        public override System.Threading.Tasks.Task OnDisconnected(bool stopCalled)
        {
            // Khi người dùng disconect thì đồng thời loại bỏ user ra khỏi list quản lý
#if DEBUG
            StaticData.removeOfflineUser("151312");
#else
            StaticData.users.Remove(Context.User.Identity.GetUserId());
             StaticData.removeOfflineUser(Context.User.Identity.GetUserId());
#endif
            
            return base.OnDisconnected(stopCalled);
        }

        public override System.Threading.Tasks.Task OnReconnected()
        {
#if DEBUG
            StaticData.setConnectionId("151312", Context.ConnectionId);
#else
            StaticData.users[Context.User.Identity.GetUserId()] = Context.ConnectionId;
#endif
            // Khi người dùng reconect thì ghi nhận lại connection id
            //
            return base.OnReconnected();
        }      
    }
}