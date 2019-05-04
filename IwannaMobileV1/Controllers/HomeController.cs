using System;
using System.Collections.Generic;
using System.Linq;
using IwannaMobileV1.Database;
using IwannaMobileV1.Models;
using IwannaMobileV1.UserProfileData;
using System.Web;
using System.Web.Mvc;

namespace IwannaMobileV1.Controllers
{
    [SessionState(System.Web.SessionState.SessionStateBehavior.Required)]
    public class HomeController : Controller
    {
        //
        // GET: /Home/

        public ActionResult Index()
        {
            var result = new FilePathResult("~/Views/Index.html", "text/html");
            return result; 
        }


        [HttpPost]
        public ActionResult Login(LoginModel mod)
        {

            
            DBDataContext db = new DBDataContext();
            if (ModelState.IsValid)
            {
                var user = db.Customers.SingleOrDefault(t => t.Username == mod.Username && t.Password == mod.Password);
                if (user == null) return Json(new { Result = false });
                else
                {

                    var profileData = new UserProfileSessionData
                    {
                        UserId = user.ID,
                        EmailAddress = user.EmailAddress,
                        FullName = user.FirstName + " " + user.LastName
                    };

                    this.Session["UserProfile"] = profileData;
                    return Json(new
                    {
                        Result = true,
                        FullName = user.FirstName + " " + user.LastName
                    });
                }

            }
            return Json(new { Result = false });
        }



        [HttpPost]
        public ActionResult InsertService(ServiceInsertModel mod)
        {
            DBDataContext db = new DBDataContext();
            if (ModelState.IsValid)
            {
                var profileData = this.Session["UserProfile"] as UserProfileSessionData;
                CustomerRequestForService crfs = new CustomerRequestForService();
                crfs.CustomerID = (int)(profileData.UserId);
                crfs.StartTime = Convert.ToDateTime(mod.StartTime);
                crfs.EndTime = Convert.ToDateTime(mod.EndTime);
                crfs.ServiceTypeID =Int16.Parse(mod.ServiceID);
                crfs.Longitude = mod.Longitude;
                crfs.Latitude = mod.Latitude;
                crfs.VendorIDAccepted = -1;
                crfs.distance = mod.Distance;
                crfs.status = UTIL.Conts.Status;
                db.CustomerRequestForServices.InsertOnSubmit(crfs);
                db.SubmitChanges();


               

                return Json(new
                {
                    Result = true,
                });






            }

            else return Json(new
            {
                Result = false,

            });


        }


        [HttpGet]
        public ActionResult getActiveOffers()
        {

            DBDataContext db = new DBDataContext();
            var profileData = this.Session["UserProfile"] as UserProfileSessionData;
            int id = int.Parse(profileData.UserId.ToString());
            List<ActiveOffers> listaponuda = new List<ActiveOffers>();
            List<VendorServiceOfferForRequest> offers = db.VendorServiceOfferForRequests.Where(t => t.CustomerRequestForService.CustomerID == id && t.Status == "Active").ToList();

            foreach (VendorServiceOfferForRequest v in offers)
            {
                ActiveOffers offer = new ActiveOffers();
                offer.idcustomer = id.ToString();
                offer.service = v.VendorService.Name;
                offer.description = v.Description;
                offer.name = v.VendorService.Vendor.Name;
                offer.address = v.VendorService.Vendor.Address;
                offer.phone = v.VendorService.Vendor.ContactPhone;
                offer.email = v.VendorService.Vendor.ContactEmail;
                offer.customerrequestid = v.CustomerRequestID.ToString();
                offer.vendorid = v.VendorService.VendorID.ToString();

                listaponuda.Add(offer);

            }

            if (listaponuda.Count != 0)
            {
                return Json(new { Result = true, listaponuda }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { Result = false }, JsonRequestBehavior.AllowGet);

            }

            

        }

        [HttpPost]
        public ActionResult AcceptOffer(RequestAcceptedCanceled mod)
        {

            DBDataContext db = new DBDataContext();

            CustomerRequestForService cust = db.CustomerRequestForServices.Where(t => t.ID == int.Parse(mod.customerrequestid)).First();

            cust.VendorIDAccepted = int.Parse(mod.vendorid.ToString());
            cust.status = UTIL.Conts.Accepted;
            db.SubmitChanges();

            VendorServiceOfferForRequest vs = db.VendorServiceOfferForRequests.Where(t => t.CustomerRequestID == int.Parse(mod.customerrequestid) && t.VendorService.VendorID == int.Parse(mod.vendorid)).First();

            vs.Status = UTIL.Conts.Accepted;
            db.SubmitChanges();

            List<VendorServiceOfferForRequest> listoffers = db.VendorServiceOfferForRequests.Where(t => t.CustomerRequestID == int.Parse(mod.customerrequestid) && t.Status == UTIL.Conts.Active).ToList();

            foreach (VendorServiceOfferForRequest v in listoffers)
            {
                v.Status = UTIL.Conts.Canceled;
                db.SubmitChanges();

            }

            return Json(new {Result=true});

        }

        [HttpPost]
        public ActionResult CancelOffer(RequestAcceptedCanceled mod)
        {

            DBDataContext db = new DBDataContext();

            VendorServiceOfferForRequest vs = db.VendorServiceOfferForRequests.Where(t => t.CustomerRequestID == int.Parse(mod.customerrequestid) && t.VendorService.VendorID == int.Parse(mod.vendorid)).First();

            vs.Status = UTIL.Conts.Canceled;
            db.SubmitChanges();

            return Json(new { Result = true });

        }


        [HttpGet]
        public ActionResult getAcceptedServices()
        {
            DBDataContext db = new DBDataContext();
            var profileData = this.Session["UserProfile"] as UserProfileSessionData;
            int id = int.Parse(profileData.UserId.ToString());
            List<CustomerRequestForService> cust = db.CustomerRequestForServices.Where(t => t.CustomerID== id && t.EndTime >= DateTime.Now && t.status==UTIL.Conts.Accepted).ToList();
            List<GetAcceptedRequestsVendor> listrequest = new List<GetAcceptedRequestsVendor>();
            foreach (CustomerRequestForService c in cust)
            {
                GetAcceptedRequestsVendor gearv = new GetAcceptedRequestsVendor();
                gearv.name =db.Vendors.Where(t=> t.ID == c.VendorIDAccepted).First().Name ;
                gearv.service = c.ServiceType.Type;
                gearv.datetime = c.StartTime + " - " + c.EndTime;
                listrequest.Add(gearv);

            }

            if (listrequest.Count != 0)
            {

                return Json(new { Result = true, listrequest }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { Result = false }, JsonRequestBehavior.AllowGet);
            }

        }
    

    }
}
