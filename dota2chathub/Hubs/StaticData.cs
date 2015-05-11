using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace dota2chathub
{
    public class StaticData
    {
        public static Dictionary<string, string> users = new Dictionary<string, string>();
        public static Dictionary<string, GroupChat> groups = new Dictionary<string, GroupChat>();

        public static bool checkUserOnline(string userid)
        {
            return users.ContainsKey(userid);
        }

        public static bool checkPassword(string groupid, string password)
        {
            if (groups.ContainsKey(groupid))
            {
                if (groups[groupid].password == password)
                {
                    return true;
                }
            }
            return  false;
        }

        public static GroupChat getGroup(string groupid)
        {
            if(groups.ContainsKey(groupid))
            {
                return groups[groupid];
            }
            return null;
        }

        public static void addUsertoGroup(string iduser, string idGroup)
        {
            if (!string.IsNullOrWhiteSpace(iduser) && string.IsNullOrWhiteSpace(idGroup))
            {
                if(groups.ContainsKey(idGroup))
                {
                    groups[idGroup].addUser(iduser);
                }              
            }
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

        public GroupChat()
        {
            // TODO: Complete member initialization
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