using Microsoft.AspNet.SignalR;
using System.Threading.Tasks;

namespace dota2chathub.Module.PublicChat
{
    public partial class ServerHub : Hub
    {
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
            Clients.OthersInGroup(groupid).reciveGroupChatMessage(Newtonsoft.Json.JsonConvert.SerializeObject(mess), groupid);
        }

        public async Task joingroup(string groupid, string userid)
        {
            StaticData.addUsertoGroup(userid, groupid);

            // Lấy giá trị connectionID của userid
#if DEBUG
            Groups.Add(StaticData.getConnectionID("151312"), groupid);
#else
            Groups.Add(StaticData.getConnectionID(userid), groupid);
#endif
        }
    }
}