using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using dota2chathub.Models;
using Newtonsoft.Json.Linq;
using System.Net;
using Newtonsoft.Json;

namespace dota2chathub
{

    // Cần kiểm tra: các hàm của staticdata cần được tối ưu hóa performer,
    // do đó, cần hạn chế kiểm tra dữ liệu rỗng, không tồn tại. Việc kiểm tra này cần được kiểm tra bên ngoài trước khi gọi vào
    public class StaticData
    {
        private static Dictionary<string, string> users = new Dictionary<string, string>();
        private static Dictionary<string, GroupChat> groups = new Dictionary<string, GroupChat>();
        private static Dictionary<string, GameMatch> games = new Dictionary<string, GameMatch>();

        // Steam Key
        public static string Keys = "3C627B068B6CD1170B25D133C6ECED2C";

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
        public static Dictionary<string, GroupChat> getAllGroups()
        {
            return groups;
        }

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
            if (haveGroup(groupid))
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
            if (groups.ContainsKey(idGroup))
            {
                groups[idGroup].addUser(iduser);
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
            game.addUser(hostid);
            StaticData.games.Add(game.id, game);
            return game.id;
        }

        /// <summary>
        /// Lấy danh sách người chơi trong game
        /// </summary>
        /// <param name="gameid"></param>
        /// <returns></returns>
        public static List<string> getUserInGame(string gameid)
        {
            if (games.ContainsKey(gameid))
            {
                return games[gameid].getlistusers();
            }
            else
            {
                return null;
            }
        }

        /// <summary>
        /// Trả về số lượng người chơi trong game. Nếu game không tồn tại thì trả về -1
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public static int getNumberUserInGame(string id)
        {
            if (games.ContainsKey(id))
            {
                return games[id].getNumberUser();
            }
            else
            {
                return -1;
            }
        }

        public static Dictionary<string, GameMatch> getAllGameMatch()
        {
            return games;
        }
        /// <summary>
        /// Check password for game
        /// </summary>
        /// <param name="groupid"></param>
        /// <param name="password"></param>
        /// <returns></returns>
        public static bool checkGamePassword(string gameid, string password)
        {
            if (games.ContainsKey(gameid))
            {
                if (games[gameid].password == password)
                {
                    return true;
                }
            }
            return false;
        }

        /// <summary>
        /// Thêm người dùng vào game đã tồn tại
        /// </summary>
        /// <param name="iduser"></param>
        /// <param name="idGroup"></param>
        public static async Task addUsertoGame(string iduser, string gameid)
        {
            if (games.ContainsKey(gameid))
            {
                games[gameid].addUser(iduser);
            }
        }


        public static GameMatch getGame(string gameid)
        {
            if (games.ContainsKey(gameid))
            {
                return games[gameid];
            }
            return null;
        }

        /// <summary>
        /// Xóa game nếu game đó có người chơi = 0;
        /// </summary>
        /// <param name="gameid"></param>
        public static async Task removeGame(string gameid)
        {
            if (string.IsNullOrWhiteSpace(gameid))
            {
                return;
            }

            if (games.ContainsKey(gameid))
            {
                // Neu user in group == 0 thi moi cho phep xoa
                if (games[gameid].users.Count() == 0)
                {
                    games.Remove(gameid);
                }
                else
                {
                    //Log
                    return;
                }
            }

            return;
        }

        ///// <summary>
        ///// Kiểm tra xem có tồn tại group hay không
        ///// </summary>
        ///// <param name="groupid">GroupID kiểm tra</param>
        ///// <returns></returns>
        //public static bool haveGroup(string groupid)
        //{
        //    return groups.ContainsKey(groupid);
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

        /// <summary>
        /// Xóa người dùng khi offline bởi userid
        /// </summary>
        /// <param name="userid"></param>
        /// <returns></returns>
        public static async Task removeOfflineUser(string userid)
        {
            string groupid = "", gameid = "";
            if (users.ContainsKey(userid))
            {
                users.Remove(userid);
                foreach (var item in groups)
                {
                    if (item.Value.checkUser(userid))
                    {
                        item.Value.removeUser(userid);

                        groupid = item.Key;
                    }
                }

                foreach (var item in games)
                {
                    if (item.Value.checkUser(userid))
                    {
                        item.Value.removeUser(userid);
                        gameid = item.Key;

                    }
                }
            }
            if (groupid != "")
            {
                removeGroup(groupid);
            }
            if (gameid != "")
            {
                removeGame(gameid);
            }
        }

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

        public static void setGroupIDtoGame(string groupid, string gameid)
        {
            if (games.ContainsKey(gameid))
            {
                games[gameid].groupchatid = groupid;
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

    public class GameMatch
    {
        public string id { set; get; }
        public string name { get; set; }
        public string hostid { get; set; }
        public string password { get; set; }
        public string groupchatid { get; set; }

        /// <summary>
        /// State = 0: pending; = 1: playing; =2: ending
        /// </summary>
        private int state;
        /// <summary>
        /// =1: radian win; 
        /// </summary>
        public bool result { get; set; }

        public List<string> users;

        // tương ứng với ds user người thứ [i] sẽ thuộc team [i]. 
        // Nếu = 1: radian
        public List<bool> team;

        public GameMatch(string groupname)
        {
            Guid generateid = Guid.NewGuid();
            id = generateid.ToString();
            name = groupname;
            users = new List<string>();
        }

        public GameMatch()
        {
            state = 0;
            result = false;
        }

        public void addUser(string id)
        {
            if (users.Count > 10)
            {
                return;
            }
            if (users.Contains(id))
            {
                return;
            }
            else
            {
                users.Add(id);
            }
        }

        public int getNumberUser()
        {
            return users.Count();
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

        public List<string> getlistusers()
        {
            return users;
        }

        /// <summary>
        /// Lấy kết quả khi trận đấu đã kết thúc
        /// </summary>
        public void getMatchResult()
        {

        }

        private void findmatch()
        {
            var client = new WebClient();
            string steamquery = "https://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/V001/?key="+ StaticData.Keys +"&steamids=" + hostid;
            var content = client.DownloadString(steamquery);
            JObject result = (JObject)JsonConvert.DeserializeObject(content);


        }

        private void getmatchdetail()
        {

        }

        public bool? getPlayerResult(string userid)
        {
            if (state == 2)
            {
                for(int i = 0; i < users.Count; i++)
                {
                    if(users[i] == userid)
                    {
                        return team[i] & result ;
                    }
                }
            }

            return null;
        }

        public void finishGame()
        {
            this.state = 2;
            findmatch();
            getmatchdetail();
        }

        public bool isRadiaWin()
        {
            return result;
        }

        public int getState()
        {
            return this.state;
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