using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace dota2chathub.Controllers
{
    public class SearchController : Controller
    {
        //
        // GET: /Search/
        public ActionResult Index(string key)
        {
            if (string.IsNullOrWhiteSpace(key))
            {
                return null;
            }

            List<SearchResult> result = new List<SearchResult>();
            string[] words = key.Split(' ');

            // Tim nguoi choi online
            result = (from item in StaticData.getListUserOnline()
                         where words.All(val => item.Contains(val))
                         select new SearchResult{
                            id=item,
                            type=1
                         }).ToList();

            // Tim Chat Group
            List<SearchResult> groups = new List<SearchResult>();
            groups = (from item in StaticData.getAllGroups()
                     where words.All(val => item.Value.name.Contains(val))
                     select new SearchResult
                     {
                         id = item.Value.id,
                         name = item.Value.name,
                         type = 2
                     }
                          ).ToList();

            // Tim Game
            List<SearchResult> games = new List<SearchResult>();           
            games = (from item in StaticData.getAllGameMatch()
                      where words.All(val => item.Value.name.Contains(val))
                      select new SearchResult
                      {
                          id = item.Value.id,
                          name = item.Value.name,
                          type = 3
                      }
                          ).ToList();

            // Append to result;
            if (games != null)
            {
                result.AddRange(games);
            }
            if(groups != null)
            {
                result.AddRange(groups);
            }

            return Json(result, JsonRequestBehavior.AllowGet);
        }
    }

    public class SearchResult
    {
        public string id;
        public string name;        

        /// <summary>
        /// 1: user
        /// 2: group
        /// 3: game
        /// </summary>
        public int type;
    }
}