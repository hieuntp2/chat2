using Microsoft.AspNet.SignalR;

namespace dota2chathub.Module.PublicChat
{
    public partial class ServerHub : Hub
    {
#if DEBUG
        public void sendprivateMessage(string fromuser, string touser, string message)
        {
            Clients.Caller.reciverprivatemessage(fromuser, message);
        }
#else
        public void sendprivateMessage(string fromuser, string touser, string message)
        {
            try
            {
                string connectionId = StaticData.getConnectionID(touser);
                if(string.IsNullOrWhiteSpace(connectionId))
                {
                    Clients.Caller.reciverprivatemessage(touser, "Server: User is offline");
                    //Clients.Client(StaticData.getConnectionID(fromuser)).reciverprivatemessage(touser, "Server: User is offline");
                }
                else
                {
                    Clients.Client(connectionId).reciverprivatemessage(fromuser, message);
                }                
            }
            catch
            {
                Clients.Caller.reciverprivatemessage("", "User is offline");
            }
        }
#endif
    }
}