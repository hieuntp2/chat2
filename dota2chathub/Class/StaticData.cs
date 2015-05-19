using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using dota2chathub.Models;
namespace dota2chathub
{
    public class StaticData
    {
        private static Dictionary<string, string> users = new Dictionary<string, string>();
        private static Dictionary<string, GroupChat> groups = new Dictionary<string, GroupChat>();
        private static Dictionary<string, GameMatch> games = new Dictionary<string, GameMatch>();

        public static Dictionary<string, GroupChat> getAllGroups()
        {
            return groups;
        }

        /// <summary>
        /// Thêm/ cập nhật connectionID người dùng vào danh sách người dùng đang online
        /// </summary>
        /// <param name="userid"></param>
        /// <param name="connectionid"></param>
        public static void setConnectionId(string userid, string connectionid)
        {
            if (users.ContainsKey(userid))
            {
                users[userid] = connectionid;
            }
            else
            {
                users.Add(userid, connectionid);
            }
        }

        /// <summary>
        /// Thêm/ cập nhật connectionID người dùng vào danh sách người dùng đang online theo AspNetUser ID
        /// </summary>
        /// <param name="userid"></param>
        /// <param name="connectionid"></param>
        public static void setConnectionIdbyAspNetUserID(string aspnetuserid, string connectionid)
        {
            string userid = getUserIDbyAspNetUserID(aspnetuserid);
            if (users.ContainsKey(userid))
            {
                users[userid] = connectionid;
            }
            else
            {
                users.Add(userid, connectionid);
            }
        }
        
        /// <summary>
        /// Lấy connectionid của người dùng
        /// </summary>
        /// <param name="userid"></param>
        /// <returns></returns>
        public static string getConnectionID(string userid)
        {
            string connectionid;
            users.TryGetValue(userid, out connectionid);
            return connectionid;
        }
        public static bool checkUserOnline(string userid)
        {
            return users.ContainsKey(userid);
        }

        ///////////////////////////////////////
        /////////// GROUP CHAT ////////////////
        ///////////////////////////////////////

        #region GROUP CHAT
        /// <summary>
        /// Check password for group
        /// </summary>
        /// <param name="groupid"></param>
        /// <param name="password"></param>
        /// <returns></returns>
        public static bool checkPassword(string groupid, string password)
        {
            if (groups.ContainsKey(groupid))
            {
                if (groups[groupid].password == password)
                {
                    return true;
                }
            }
            return false;
        }

        /// <summary>
        /// Kiểm tra xem có tồn tại group hay không
        /// </summary>
        /// <param name="groupid">GroupID kiểm tra</param>
        /// <returns></returns>
        public static bool haveGroup(string groupid)
        {
            return groups.ContainsKey(groupid);
        }

        public static GroupChat getGroup(string groupid)
        {
            if (groups.ContainsKey(groupid))
            {
                return groups[groupid];
            }
            return null;
        }

        /// <summary>
        /// Lấy danh sách userid trong group xác định
        /// </summary>
        /// <param name="groupid">GroupID</param>
        /// <returns>Nếu có: trả về danh sách userid, nếu không thì trả về null</returns>
        public static List<string> getListUserInGroup(string groupid)
        {
            if(haveGroup(groupid))
            {
                return groups[groupid].users;
            }
            return null;
        }

        /// <summary>
        /// Thêm người dùng vào group đã tồn tại
        /// </summary>
        /// <param name="iduser"></param>
        /// <param name="idGroup"></param>
        public static async Task addUsertoGroup(string iduser, string idGroup)
        {
            if (!string.IsNullOrWhiteSpace(iduser) && !string.IsNullOrWhiteSpace(idGroup))
            {
                if (groups.ContainsKey(idGroup))
                {
                    groups[idGroup].addUser(iduser);
                }
            }
        }

        /// <summary>
        /// Xóa người dùng ra khỏi group
        /// </summary>
        /// <param name="groupid"></param>
        public static async Task removeGroup(string groupid)
        {
            if (string.IsNullOrWhiteSpace(groupid))
            {
                return;
            }

            if (groups.ContainsKey(groupid))
            {
                // Neu user in group == 0 thi moi cho phep xoa
                if (groups[groupid].users.Count() == 0)
                {
                    groups.Remove(groupid);
                }
                else
                {
                    //Log
                    return;
                }
            }

            return;
        }


        /// <summary>
        /// Kiếm tra người dùng có tồn tại trong group không
        /// </summary>
        /// <param name="userid"></param>
        /// <param name="groupid"></param>
        /// <returns></returns>
        public static bool checkUserInGroup(string userid, string groupid)
        {
            if (groups.ContainsKey(groupid))
            {
                return groups[groupid].checkUser(userid);
            }
            return false;
        }

        public static async Task removeUserfromGroupID(string userid, string groupid)
        {
            if (groups.ContainsKey(groupid))
            {
                groups[groupid].removeUser(userid);

                // kiểm tra xem nếu nhóm còn 0 người đang onl thì xóa nhóm
                removeGroup(groupid);
            }
        }

        /// <summary>
        /// Xóa người dùng khi offline bởi userid
        /// </summary>
        /// <param name="userid"></param>
        /// <returns></returns>
        public static async Task removeOfflineUser(string userid)
        {
            if (users.ContainsKey(userid))
            {
                users.Remove(userid);
                foreach (var item in groups)
                {
                    if (item.Value.checkUser(userid))
                    {
                        item.Value.removeUser(userid);
                        removeGroup(item.Key);
                    }
                }
            }
        }

        /// <summary>
        /// Xóa người dùng khi offline bởi AspNetUserID
        /// </summary>
        /// <param name="aspnetuserid">AspNetUser ID</param>
        /// <returns></returns>
        public static async Task removeOfflineUserbyAspNetUser(string aspnetuserid)
        {
            string userid = getUserIDbyAspNetUserID(aspnetuserid);
            if (users.ContainsKey(userid))
            {
                users.Remove(userid);
                foreach (var item in groups)
                {
                    if (item.Value.checkUser(userid))
                    {
                        item.Value.removeUser(userid);
                        removeGroup(item.Key);
                    }
                }
            }
        }

        public static string createGroup(string name, string hostid, string password)
        {
            GroupChat group = new GroupChat(name);
            group.hostid = hostid;
            group.password = password;
            StaticData.groups.Add(group.id, group);
            return group.id;
        }
        #endregion

        ///////////////////////////////////////
        /////////// GAME ///// ////////////////
        ///////////////////////////////////////
        #region Game

        /// <summary>
        /// Create Game
        /// </summary>
        /// <param name="name"></param>
        /// <param name="hostid"></param>
        /// <param name="password"></param>
        /// <returns></returns>
        public static string createGame(string name, string hostid, string password)
        {
            GameMatch game = new GameMatch(name);
            game.hostid = hostid;
            game.password = password;
            StaticData.games.Add(game.id, game);
            return game.id;
        }

        ///// <summary>
        ///// Check password for group
        ///// </summary>
        ///// <param name="groupid"></param>
        ///// <param name="password"></param>
        ///// <returns></returns>
        //public static bool checkPassword(string groupid, string password)
        //{
        //    if (groups.ContainsKey(groupid))
        //    {
        //        if (groups[groupid].password == password)
        //        {
        //            return true;
        //        }
        //    }
        //    return false;
        //}

        ///// <summary>
        ///// Kiểm tra xem có tồn tại group hay không
        ///// </summary>
        ///// <param name="groupid">GroupID kiểm tra</param>
        ///// <returns></returns>
        //public static bool haveGroup(string groupid)
        //{
        //    return groups.ContainsKey(groupid);
        //}

        //public static GroupChat getGroup(string groupid)
        //{
        //    if (groups.ContainsKey(groupid))
        //    {
        //        return groups[groupid];
        //    }
        //    return null;
        //}

        ///// <summary>
        ///// Lấy danh sách userid trong group xác định
        ///// </summary>
        ///// <param name="groupid">GroupID</param>
        ///// <returns>Nếu có: trả về danh sách userid, nếu không thì trả về null</returns>
        //public static List<string> getListUserInGroup(string groupid)
        //{
        //    if (haveGroup(groupid))
        //    {
        //        return groups[groupid].users;
        //    }
        //    return null;
        //}

        ///// <summary>
        ///// Thêm người dùng vào group đã tồn tại
        ///// </summary>
        ///// <param name="iduser"></param>
        ///// <param name="idGroup"></param>
        //public static async Task addUsertoGroup(string iduser, string idGroup)
        //{
        //    if (!string.IsNullOrWhiteSpace(iduser) && !string.IsNullOrWhiteSpace(idGroup))
        //    {
        //        if (groups.ContainsKey(idGroup))
        //        {
        //            groups[idGroup].addUser(iduser);
        //        }
        //    }
        //}

        ///// <summary>
        ///// Xóa người dùng ra khỏi group
        ///// </summary>
        ///// <param name="groupid"></param>
        //public static async Task removeGroup(string groupid)
        //{
        //    if (string.IsNullOrWhiteSpace(groupid))
        //    {
        //        return;
        //    }

        //    if (groups.ContainsKey(groupid))
        //    {
        //        // Neu user in group == 0 thi moi cho phep xoa
        //        if (groups[groupid].users.Count() == 0)
        //        {
        //            groups.Remove(groupid);
        //        }
        //        else
        //        {
        //            //Log
        //            return;
        //        }
        //    }

        //    return;
        //}


        ///// <summary>
        ///// Kiếm tra người dùng có tồn tại trong group không
        ///// </summary>
        ///// <param name="userid"></param>
        ///// <param name="groupid"></param>
        ///// <returns></returns>
        //public static bool checkUserInGroup(string userid, string groupid)
        //{
        //    if (groups.ContainsKey(groupid))
        //    {
        //        return groups[groupid].checkUser(userid);
        //    }
        //    return false;
        //}

        //public static async Task removeUserfromGroupID(string userid, string groupid)
        //{
        //    if (groups.ContainsKey(groupid))
        //    {
        //        groups[groupid].removeUser(userid);

        //        // kiểm tra xem nếu nhóm còn 0 người đang onl thì xóa nhóm
        //        removeGroup(groupid);
        //    }
        //}

        ///// <summary>
        ///// Xóa người dùng khi offline bởi userid
        ///// </summary>
        ///// <param name="userid"></param>
        ///// <returns></returns>
        //public static async Task removeOfflineUser(string userid)
        //{
        //    if (users.ContainsKey(userid))
        //    {
        //        users.Remove(userid);
        //        foreach (var item in groups)
        //        {
        //            if (item.Value.checkUser(userid))
        //            {
        //                item.Value.removeUser(userid);
        //                removeGroup(item.Key);
        //            }
        //        }
        //    }
        //}

        ///// <summary>
        ///// Xóa người dùng khi offline bởi AspNetUserID
        ///// </summary>
        ///// <param name="aspnetuserid">AspNetUser ID</param>
        ///// <returns></returns>
        //public static async Task removeOfflineUserbyAspNetUser(string aspnetuserid)
        //{
        //    string userid = getUserIDbyAspNetUserID(aspnetuserid);
        //    if (users.ContainsKey(userid))
        //    {
        //        users.Remove(userid);
        //        foreach (var item in groups)
        //        {
        //            if (item.Value.checkUser(userid))
        //            {
        //                item.Value.removeUser(userid);
        //                removeGroup(item.Key);
        //            }
        //        }
        //    }
        //}

        #endregion

        private static string getUserIDbyAspNetUserID(string aspnetuserid)
        {
            ProjectDEntities db = new ProjectDEntities();
            string userid = db.AspNetUsers.SingleOrDefault(t => t.Id == aspnetuserid).UserName;
            return userid;
        }

        public static List<string> getListUserOnline()
        {
            return users.Keys.ToList<string>();
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

    public class GameMatch
    {
        public string id { set; get; }
        public string name { get; set; }
        public string hostid { get; set; }
        public string password { get; set; }
        public string groupchatid { get; set; }

        public List<string> users;

        public GameMatch(string groupname)
        {
            Guid generateid = Guid.NewGuid();
            id = generateid.ToString();
            name = groupname;
            users = new List<string>();
        }

        public GameMatch()
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

        public async Task removeUser(string userid)
        {
            users.Remove(userid);
        }

        public bool checkUser(string userid)
        {
            if (users.Contains(userid))
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    }

    public class GroupChat
    {
        public string id { set; get; }
        public string name { get; set; }
        public string hostid { get; set; }
        public string password { get; set; }

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

        public async Task removeUser(string userid)
        {
            users.Remove(userid);
        }

        public bool checkUser(string userid)
        {
            if (users.Contains(userid))
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}