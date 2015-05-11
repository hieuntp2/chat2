using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using dota2chathub.Models;
using Microsoft.AspNet.Identity;

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
            //Clients.All.acceptGreet(Newtonsoft.Json.JsonConvert.SerializeObject(mess));
            Clients.Group(groupid).reciveGroupChatMessage(Newtonsoft.Json.JsonConvert.SerializeObject(mess), groupid);
        }
        // add new group
        public void createGroup(string name, string pass, string hostid)
        {
            GroupChat group = new GroupChat(name);
            group.hostid = hostid;
            group.password = pass;
            StaticData.groups.Add(group.id, group);
            StaticData.addUsertoGroup(hostid, group.id);

            // Lấy giá trị connectionID của userid
#if DEBUG
            Groups.Add(StaticData.users["151312"], group.id);
#else
            Groups.Add(users[hostid], group.id);
#endif
            Clients.Caller.receiveGroupID(group.id);
          
        }

        public void joingroup(string name, string pass)
        {
//            GroupChat group = new GroupChat(name);
//            group.hostid = hostid;
//            group.password = pass;
//            StaticData.groups.Add(group.id, group);
//            addUsertoGroup(hostid, group.id);

//            // Lấy giá trị connectionID của userid
//#if DEBUG
//            Groups.Add(StaticData.users["151312"], group.id);
//#else
//            Groups.Add(users[hostid], group.id);
//#endif
//            Clients.Caller.receiveGroupID(group.id);

        }

        


        // invite someone to group
        public void sendInvitation(string hostid, string invid, string groupid)
        {

        }


        //////////////////////////////////////
        ///////// Override Function //////////
        //////////////////////////////////////
        public override System.Threading.Tasks.Task OnConnected()
        {
            // Khi người dùng đăng nhập vào, thì đồng thời lưu userid-connectid vào list để quản lý
            //users.Add(Context.User.Identity.GetUserId(), Context.ConnectionId);

#if DEBUG
            StaticData.users.Add("151312", Context.ConnectionId);            
#else
            StaticData.users.Add(Context.User.Identity.GetUserId(), Context.ConnectionId);
#endif
            return base.OnConnected();
        }

        public override System.Threading.Tasks.Task OnDisconnected(bool stopCalled)
        {
            // Khi người dùng disconect thì đồng thời loại bỏ user ra khỏi list quản lý
#if DEBUG
            StaticData.users.Remove("151312");
#else
            users.Remove(Context.User.Identity.GetUserId());
#endif

            return base.OnDisconnected(stopCalled);
        }

        public override System.Threading.Tasks.Task OnReconnected()
        {
#if DEBUG
            StaticData.users["151312"] = Context.ConnectionId;
#else
            StaticData.users[Context.User.Identity.GetUserId()] = Context.ConnectionId;
#endif
            // Khi người dùng reconect thì ghi nhận lại connection id
            //
            return base.OnReconnected();
        }      

    }

   
}