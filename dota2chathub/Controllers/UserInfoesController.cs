using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using dota2chathub.Models;

namespace dota2chathub.Controllers
{
    public class UserInfoesController : Controller
    {
        private ProjectDEntities db = new ProjectDEntities();

        // GET: UserInfoes
        public ActionResult Index()
        {
            var userInfoes = db.UserInfoes.Include(u => u.AspNetUser);
            return View(userInfoes.ToList());
        }

        // GET: UserInfoes/Details/5
        public ActionResult Details(string id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            UserInfo userInfo = db.UserInfoes.Find(id);
            if (userInfo == null)
            {
                return HttpNotFound();
            }
            return View(userInfo);
        }

        // GET: UserInfoes/Create
        public ActionResult Create()
        {
            ViewBag.userid = new SelectList(db.AspNetUsers, "Id", "Email");
            return View();
        }

        // POST: UserInfoes/Create
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create([Bind(Include = "userid,username,language,location,steamid,linkavatar,displayname,Totalscore,birthday,dotarank")] UserInfo userInfo)
        {
            if (ModelState.IsValid)
            {
                db.UserInfoes.Add(userInfo);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            ViewBag.userid = new SelectList(db.AspNetUsers, "Id", "Email", userInfo.userid);
            return View(userInfo);
        }

        // GET: UserInfoes/Edit/5
        public ActionResult Edit(string id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            UserInfo userInfo = db.UserInfoes.Find(id);
            if (userInfo == null)
            {
                return HttpNotFound();
            }
            ViewBag.userid = new SelectList(db.AspNetUsers, "Id", "Email", userInfo.userid);
            return View(userInfo);
        }

        // POST: UserInfoes/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "userid,username,language,location,steamid,linkavatar,displayname,Totalscore,birthday,dotarank")] UserInfo userInfo)
        {
            if (ModelState.IsValid)
            {
                db.Entry(userInfo).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            ViewBag.userid = new SelectList(db.AspNetUsers, "Id", "Email", userInfo.userid);
            return View(userInfo);
        }

        // GET: UserInfoes/Delete/5
        public ActionResult Delete(string id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            UserInfo userInfo = db.UserInfoes.Find(id);
            if (userInfo == null)
            {
                return HttpNotFound();
            }
            return View(userInfo);
        }

        // POST: UserInfoes/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(string id)
        {
            UserInfo userInfo = db.UserInfoes.Find(id);
            db.UserInfoes.Remove(userInfo);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
