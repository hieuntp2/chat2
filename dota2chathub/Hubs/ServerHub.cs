using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using dota2chathub.Models;

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


        ////////////////////////////////
        /////// GROUP CHAT ROOM ///////
        ////////////////////////////////
        private static Dictionary<string, GroupChat> groups = new Dictionary<string, GroupChat>();
        public void GroupChatSend(string userid, string groupdi, string message)
        {
            ChatMessageObject mess = new ChatMessageObject()
            {
                userid = "1",
                name = "hieu",
                message = message
            };
            Clients.All.acceptGreet(Newtonsoft.Json.JsonConvert.SerializeObject(mess));
        }

        // add new group
        public static string addGroup(string name, string hostid)
        {
            GroupChat group = new GroupChat(name);
            groups.Add(group.id, group);
            addUsertoGroup(hostid, group.id);
            return group.id;
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