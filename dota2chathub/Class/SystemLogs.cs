using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using dota2chathub.Models;
using System.Threading.Tasks;
namespace dota2chathub.Class
{
    public class SystemLogs
    {
        ProjectDEntities db;
        public SystemLogs()
        {
            db = new ProjectDEntities();
        }

        public async Task writeLog(string message)
        {

        }
    }
}