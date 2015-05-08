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

        public void sendprivateMessage(string userid, string message)
        {
            Clients.All.recivePrivateChatMessage(userid, message);
        }
#if DEBUG
       
#else
         public void sendprivateMessage(string userid, string message)
        {
            try
            {
                string connectionId = users[userid];
                Clients.Client(connectionId).reciverprivatemessage(userid, message);
            }
            catch
            {
                Clients.Caller.reciverprivatemessage("", "User is offline");
            }
        }
#endif


        public static Dictionary<string, string> users = new Dictionary<string, string>();
      
        ////////////////////////////////
        /////// GROUP CHAT ROOM ///////
        ////////////////////////////////
        public static Dictionary<string, GroupChat> groups = new Dictionary<string, GroupChat>();
        
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
            groups.Add(group.id, group);
            addUsertoGroup(hostid, group.id);

            // Lấy giá trị connectionID của userid
#if DEBUG
            Groups.Add(users["151312"], group.id);
#else
            Groups.Add(users[hostid], group.id);
#endif
            Clients.Caller.receiveGroupID(group.id);
          
        }

        public static bool addUsertoGroup(string iduser, string idGroup)
        {
            try
            {
                GroupChat group;
                groups.TryGetValue(idGroup, out group);
                group.addUser(iduser);

                return true;
            }
            catch
            {
                return false;
            }

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
            users.Add("151312", Context.ConnectionId);            
#else
            users.Add(Context.User.Identity.GetUserId(), Context.ConnectionId);
#endif
            return base.OnConnected();
        }

        public override System.Threading.Tasks.Task OnDisconnected(bool stopCalled)
        {
            // Khi người dùng disconect thì đồng thời loại bỏ user ra khỏi list quản lý
#if DEBUG
            users.Remove("151312");
#else
            users.Remove(Context.User.Identity.GetUserId());
#endif

            return base.OnDisconnected(stopCalled);
        }

        public override System.Threading.Tasks.Task OnReconnected()
        {
#if DEBUG
            users["151312"] = Context.ConnectionId;
#else
            users[Context.User.Identity.GetUserId()] = Context.ConnectionId;
#endif
            // Khi người dùng reconect thì ghi nhận lại connection id
            //
            return base.OnReconnected();
        }

        //////////////////////////////////////
        ////////// STATIC Function ///////////
        //////////////////////////////////////

        public static bool checkUserOnline(string userid)
        {
            return users.ContainsKey(userid);
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

    public class GroupChat
    {
        public string id { set; get; }
        public string name { get; set; }
        public string hostid { get; set; }
        public string password { get; set; }
        //public Dictionary<string, UserInfo> users;
        public List<string> users;

        public GroupChat(string groupname)
        {
            Guid generateid = Guid.NewGuid();
            id = generateid.ToString();
            name = groupname;
            users = new List<string>();
        }

        public void addUser(string id)
        {
            if (users.Contains(id))
            {
                return;
            }
            else
            {
                users.Add(id);
            }
        }

        public void removeUser(string userid)
        {
            users.Remove(userid);
        }
    }
}