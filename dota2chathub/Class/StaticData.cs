using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using dota2chathub.Models;
using Newtonsoft.Json.Linq;
using System.Net;
using Newtonsoft.Json;
using System.Text;
using System.Collections;

namespace dota2chathub
{

    // Cần kiểm tra: các hàm của staticdata cần được tối ưu hóa performer,
    // do đó, cần hạn chế kiểm tra dữ liệu rỗng, không tồn tại. Việc kiểm tra này cần được kiểm tra bên ngoài trước khi gọi vào
    internal class StaticData
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


        public static void addGame(GameMatch game)
        {
            games.Add(game.id, game);
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

        public static async Task FinishGame(string gameid)
        {
            if (games.ContainsKey(gameid))
            {
                // Nếu game đã bắt đầu chơi, thì mới xử lý kết quả
                if (games[gameid].getState() == 1)
                {
                    games[gameid].finishGame();
                }
            }
        }

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

        public static int getGameState(string id)
        {
            if (games.ContainsKey(id))
            {
                return games[id].getState();
            }
            return -1;
        }

        internal static void startgame(string id)
        {
            games[id].startgame();
        }
    }

    internal class ChatMessageObject
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

    internal class GameMatch
    {
        internal string id { set; get; }
        internal string name { get; set; }
        internal string hostid { get; set; }
        internal string password { get; set; }
        internal string groupchatid { get; set; }

        private int count_confirm = 0;

        /// <summary>
        /// State = 
        /// =0: pending; 
        /// =1: playing; 
        /// =2: processing; 
        /// =3: finish and get result; 
        /// =4: game confirmed; 
        /// =5: deny;
        /// </summary>
        private int state;
        /// <summary>
        /// =1: radian win; 
        /// </summary>
        internal bool isRadirawin { get; set; }

        internal Dictionary<string, UserInGame> users = new Dictionary<string, UserInGame>();

        //// tương ứng với ds user người thứ [i] sẽ thuộc team [i]. 
        //// Nếu = 1: radian
        //internal List<bool> team;

        internal GameMatch(string groupname)
        {
            Guid generateid = Guid.NewGuid();
            id = generateid.ToString();
            name = groupname;
        }

        internal GameMatch()
        {
            state = 0;
            isRadirawin = false;
        }

        internal void addUser(string id)
        {
            if (users.Count > 10)
            {
                return;
            }
            if (users.ContainsKey(id))
            {
                return;
            }
            else
            {
                UserInGame player = new UserInGame();
                player.steamID = id;
                users.Add(id, player);
            }
        }

        internal int getNumberUser()
        {
            return users.Count();
        }

        internal async Task removeUser(string userid)
        {
            users.Remove(userid);
        }

        internal bool checkUser(string userid)
        {
            if (users.ContainsKey(userid))
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        internal List<string> getlistusers()
        {
            return users.Select(t => t.Key).ToList();
        }

        internal void finishGame()
        {
            // Đang xử lý kết quả
            this.state = 2;
            JObject game = findmatch();
            if (game != null)
            {
                // Xử lý kết quả. Sau khi xử lý thì đặt trạng thái đã hoàn thành để lấy kết quả
                getMatchResult(game);
                state = 3;
            }
            else
            {
                // nếu không có kết quả, thì trả về trạng thái đang chơi
                this.state = 1;
            }
        }

        /// <summary>
        /// Tìm kiếm game mà người chơi vừa chơi xong. Dựa theo số lượng người chơi và steamid của người tham gia
        /// </summary>
        /// <returns></returns>
        private JObject findmatch()
        {
            var client = new WebClient();
            string steamquery = "https://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/V001/?key=" + StaticData.Keys + "&steamids=" + hostid;
            var content = client.DownloadString(steamquery);
            JObject result = (JObject)JsonConvert.DeserializeObject(content);

            foreach (JObject match in result["result"]["matches"])
            {
                if (checkmatch(match))
                {
                    return match;
                }
            }

            return null;
        }

        /// <summary>
        /// Kiểm tra game đó có phải là game cần tìm không
        /// </summary>
        /// <param name="game"></param>
        /// <returns></returns>
        private bool checkmatch(JObject game)
        {
            List<string> checklist = new List<string>();
            foreach (JObject item in game["players"])
            {
                string accountid = "";
                try
                {
                    accountid = item["account_id"].ToString();
                }
                catch
                {
                    continue;
                }

                if (!checklist.Contains(accountid))
                {
                    string steamid32 = convertAccountIDtoSteamID(accountid);
                    checklist.Add(steamid32);
                }
            }

            if (checklist.Count != users.Count)
            {
                return false;
            }
            else
            {
                for (int i = 0; i < checklist.Count; i++)
                {
                    if (!checklist.Contains(users[i]))
                    {
                        return false;
                    }
                    if (!users.Contains(checklist[i]))
                    {
                        return false;
                    }
                }
            }

            return true;
        }

        /// <summary>
        /// Phân tích dữ liệu kết quả của trận đấu
        /// </summary>
        /// <param name="game"></param>
        internal void getMatchResult(JObject game)
        {
            var client = new WebClient();
            string steamquery = "https://api.steampowered.com/IDOTA2Match_570/GetMatchDetails/V001/?match_id=" + game["match_id"] + "&key=" + StaticData.Keys;
            var content = client.DownloadString(steamquery);
            JObject result = (JObject)JsonConvert.DeserializeObject(content);

            // find out which team player belong to
            foreach (JObject player in result["result"]["players"])
            {
                // get and convert to steamid
                string steam_id = convertAccountIDtoSteamID(player["account_id"].ToString());

                // get player_slot to detimire which team player belong to
                string player_slot = player["player_slot"].ToString();

                // if player_slot < 100: player belong to radian (true)
                // else player belong to dire (false)
                if (Convert.ToInt16(player_slot) < 100)
                {
                    users[steam_id].team = true;
                }
                else
                {
                    users[steam_id].team = false;
                }

                //set hero ID
                users[steam_id].id_hero = Convert.ToInt16(player["ero_id"]);
            }

            // parse the match result
            isRadirawin = Convert.ToBoolean(result["result"]["radiant_win"]);
        }

        internal bool? getPlayerResult(string userid)
        {
            if (state == 2)
            {
                return users[userid].team & isRadirawin;
            }

            return null;
        }

        internal bool isRadiaWin()
        {
            return isRadirawin;
        }

        internal int getState()
        {
            return this.state;
        }

        internal void startgame()
        {
            state = 1;
        }

        /// <summary>
        /// User confirm game result
        /// </summary>
        /// <param name="userid"></param>
        internal void gameConfirm(string userid)
        {
            if (users[userid].isconfirm == -1)
            {
                users[userid].isconfirm = 1;
            }            
        }

        /// <summary>
        /// User deny game result
        /// </summary>
        /// <param name="userid"></param>
        internal void gamedeny(string userid)
        {
            if (users[userid].isconfirm == -1)
            {
                users[userid].isconfirm = 0;
            } 
        }

        /// <summary>
        /// Only user when 5 deny and 5 confirm
        /// </summary>
        internal void resetConfirm()
        {
            foreach(UserInGame player in users.Values)
            {
                player.isconfirm = -1;
            }
        }

        /// <summary>
        /// Get the user confirm
        /// </summary>
        /// <returns>
        /// 1: confirmed. 0: deny. 2: reset; -1: game is not get full confirm.
        /// </returns>
        internal int checkConfirm()
        {
            int confirms = 0;
            int denys = 0;
            foreach(UserInGame player in users.Values)
            {
                if(player.isconfirm == 1)
                {
                    confirms += 1;
                    if(confirms >= 5)
                    {
                        state = 4;
                        return 1;
                    }
                }

                if(player.isconfirm == 0)
                {
                    denys += 1;
                    if (denys >= 6)
                    {
                        state = 5;
                        return 0;
                    }                        
                }
            }

            if(confirms == 5 && denys == 5)
            {
                return 2;
            }
            return -1;
        }

        /// <summary>
        /// convert account_id (steam32) to steamID(steam64)
        /// </summary>
        /// <param name="account_id"></param>
        /// <returns></returns> 
        private string convertAccountIDtoSteamID(string account_id)
        {
            // convert account_id to Int64
            Int64 x = Convert.ToInt64(account_id);
            string s = Convert.ToString(x, 2); //Convert to binary in a string

            StringBuilder result = new StringBuilder();
            result.Append("1000100000000000000000001");

            int dem_so_luong = 57 - 25 - s.Length;

            // add 0 to result to get enough 57 character
            for (int i = 0; i < dem_so_luong; i++)
            {
                result.Append("0");
            }

            // append the convert number to end result
            result.Append(s);

            BitArray bitarry = new BitArray(result.Length);


            for (int i = 0; i < result.Length; i++)
            {
                int index = result.Length - i - 1;
                if (result[index] == '0')
                {
                    bitarry[i] = false;
                }
                else
                {
                    bitarry[i] = true;
                }
            }

            return GetIntFromBitArray(bitarry).ToString();
        }

        private static long GetIntFromBitArray(BitArray bitArray)
        {
            var array = new byte[8];
            bitArray.CopyTo(array, 0);
            return BitConverter.ToInt64(array, 0);
        }
    }

    internal class GroupChat
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

    internal class UserInGame
    {
        internal string steamID;

        /// <summary>
        /// = true: Radian team; Fail: Dire team
        /// </summary>
        internal bool team;

        /// <summary>
        /// Hero user played
        /// </summary>
        internal int id_hero;

        /// <summary>
        /// User Confirm.
        /// -1: not confirm. 0: deny. 1: confirm
        /// </summary>
        internal int isconfirm = -1;
    }
}

enum Dota2Hero
{
    antimage = 1,
    axe = 2,
    bane = 3,
    bloodseeker = 4,
    crystal_maiden = 5,
    drow_ranger = 6,
    earthshaker = 7,
    juggernaut = 8,
    mirana = 9,
    nevermore = 11,
    morphling = 10,
    phantom_lancer = 12,
    puck = 13,
    pudge = 14,
    razor = 15,
    sand_king = 16,
    storm_spirit = 17,
    sven = 18,
    tiny = 19,
    vengefulspirit = 20,
    windrunner = 21,
    zuus = 22,
    kunkka = 23,
    lina = 25,
    lich = 31,
    lion = 26,
    shadow_shaman = 27,
    slardar = 28,
    tidehunter = 29,
    witch_doctor = 30,
    riki = 32,
    enigma = 33,
    tinker = 34,
    sniper = 35,
    necrolyte = 36,
    warlock = 37,
    beastmaster = 38,
    queenofpain = 39,
    venomancer = 40,
    faceless_void = 41,
    skeleton_king = 42,
    death_prophet = 43,
    phantom_assassin = 44,
    pugna = 45,
    templar_assassin = 46,
    viper = 47,
    luna = 48,
    dragon_knight = 49,
    dazzle = 50,
    rattletrap = 51,
    leshrac = 52,
    furion = 53,
    life_stealer = 54,
    dark_seer = 55,
    clinkz = 56,
    omniknight = 57,
    enchantress = 58,
    huskar = 59,
    night_stalker = 60,
    broodmother = 61,
    bounty_hunter = 62,
    weaver = 63,
    jakiro = 64,
    batrider = 65,
    chen = 66,
    spectre = 67,
    doom_bringer = 69,
    ancient_apparition = 68,
    ursa = 70,
    spirit_breaker = 71,
    gyrocopter = 72,
    alchemist = 73,
    invoker = 74,
    silencer = 75,
    obsidian_destroyer = 76,
    lycan = 77,
    brewmaster = 78,
    shadow_demon = 79,
    lone_druid = 80,
    chaos_knight = 81,
    meepo = 82,
    treant = 83,
    ogre_magi = 84,
    undying = 85,
    rubick = 86,
    disruptor = 87,
    nyx_assassin = 88,
    naga_siren = 89,
    keeper_of_the_light = 90,
    wisp = 91,
    visage = 92,
    slark = 93,
    medusa = 94,
    troll_warlord = 95,
    centaur = 96,
    magnataur = 97,
    shredder = 98,
    bristleback = 99,
    tusk = 100,
    skywrath_mage = 101,
    elder_titan = 103,
    legion_commander = 104,
    ember_spirit = 106,
    earth_spirit = 107,
    terrorblade = 109,
    phoenix = 110,
    oracle = 111,
    techies = 105,
    winter_wyvern = 112
}
