﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace dota2chathub
{
    public class PublicChatController : Controller
    {
        // GET: PublicChat
        public ActionResult Index()
        {
            return PartialView();          
        }
    }
}