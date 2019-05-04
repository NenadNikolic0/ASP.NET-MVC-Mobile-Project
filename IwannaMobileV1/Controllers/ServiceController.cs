using IwannaMobileV1.Database;
using IwannaMobileV1.Models;
using IwannaMobileV1.UserProfileData;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace IwannaMobileV1.Controllers
{
    [SessionState(System.Web.SessionState.SessionStateBehavior.Required)]
    public class ServiceController : Controller
    {
        //
        // GET: /Service/

        public ActionResult Index()
        {
            var result = new FilePathResult("~/Views/Vendor.html", "text/html");
            return result; 
        }

        [HttpPost]
        public ActionResult Login(LoginModel mod)
        {


            DBDataContext db = new DBDataContext();
            if (ModelState.IsValid)
            {
                var user = db.Vendors.SingleOrDefault(t => t.username == mod.Username && t.password == mod.Password);
                if (user == null) return Json(new { Result = false });
                else
                {


                    this.Session["VendorID"] = user.ID;
                    return Json(new
                    {
                        Result = true
                       
                    });
                }

            }
            return Json(new { Result = false });
        }

       

        [HttpGet]
        public ActionResult getActiveRequests()
        {

            DBDataContext db = new DBDataContext();
            int id = int.Parse(this.Session["VendorID"].ToString());
            Vendor vendor = db.Vendors.Where(t=> t.ID == id).First();
            string vendorservisi="";
            List<VendorService> listaSvihServisa = db.VendorServices.ToList();

            foreach (VendorService vservice in listaSvihServisa)
            {
                
                if (vservice.VendorID == vendor.ID)
                {
                    vendorservisi += vservice.ServiceTypeID + ",";

                }

            }
            

            List<CustomerRequestForService> crlista = db.CustomerRequestForServices.Where(t=> t.status == UTIL.Conts.Active).ToList();
            List<CustomerRequestForService> activerequests = new List<CustomerRequestForService>();
            foreach (CustomerRequestForService cust in crlista)
            {
                double lon1 = Double.Parse(vendor.Longitude);
                double lan1 = Double.Parse(vendor.Latitude);
                double lon2 = Double.Parse(cust.Longitude);
                double lan2 = Double.Parse(cust.Latitude);

               

                List<VendorServiceOfferForRequest> ponude = db.VendorServiceOfferForRequests.Where(t=> t.VendorService.VendorID == vendor.ID && t.CustomerRequestID == cust.ID).ToList();

                int ukupno = ponude.Count;

               

                double rez = DistanceAlgorithm.Distance.DistanceBetweenPlaces(lon1, lan1, lon2, lan2);

                if (rez <= Double.Parse(cust.distance) && Convert.ToInt32(cust.VendorIDAccepted) == -1 && Convert.ToDateTime(cust.EndTime) >= DateTime.Now && vendorservisi.Contains(cust.ServiceTypeID.ToString()) && (ukupno == 0))
                {
                    activerequests.Add(cust);

                }
               
            }
            List<ActiveRequests> alista = new List<ActiveRequests>();

            foreach (CustomerRequestForService a in activerequests)
            {
                ActiveRequests r = new ActiveRequests();
                r.service = db.ServiceTypes.Where(t => t.ID == a.ServiceTypeID).First().Type;
                r.customer = db.Customers.Where(t => t.ID == a.CustomerID).First().FirstName + " " + db.Customers.Where(t => t.ID == a.CustomerID).First().LastName;
                r.address = db.Customers.Where(t => t.ID == a.CustomerID).First().Address;
                r.email = db.Customers.Where(t => t.ID == a.CustomerID).First().EmailAddress;
                r.pol = db.Customers.Where(t => t.ID == a.CustomerID).First().Gender;
                r.startend = a.StartTime + " - " + a.EndTime;
                r.requestid = a.ID.ToString();

                alista.Add(r);

            }

            if (alista.Count != 0)
            {
                return Json(new {Result=true, alista },JsonRequestBehavior.AllowGet);

            }

            else
            {
                return Json(new { Result = false },JsonRequestBehavior.AllowGet);

            }

            

           


        }

        [HttpPost]
        public ActionResult InsertVendorOffer(OfferModel mod)
        {


            DBDataContext db = new DBDataContext();
            if (ModelState.IsValid)
            {
                VendorServiceOfferForRequest vendor_offer = new VendorServiceOfferForRequest();
                int servicetypeid = db.VendorServices.Where(t => t.VendorID == int.Parse(this.Session["VendorID"].ToString())).First().ID;
                vendor_offer.Description = mod.description;
                vendor_offer.VendorServiceID = servicetypeid;
                vendor_offer.CustomerRequestID = Convert.ToInt16(mod.customerrequestid);
                vendor_offer.Status = UTIL.Conts.Active;
                vendor_offer.DateTime = Convert.ToString(DateTime.Now);

                db.VendorServiceOfferForRequests.InsertOnSubmit(vendor_offer);
                db.SubmitChanges();




                return Json(new { Result = true });
            }
            else return Json(new { Result = false });
        }

        [HttpPost]
        public ActionResult InsertVendorCancelOffer(OfferModel2 mod)
        {


            DBDataContext db = new DBDataContext();
            if (ModelState.IsValid)
            {
                VendorServiceOfferForRequest vendor_offer = new VendorServiceOfferForRequest();
                vendor_offer.Description = mod.description;
                int serviceid = db.ServiceTypes.Where(t => t.Type == mod.servicetypeid).First().ID;
                vendor_offer.VendorServiceID = db.VendorServices.Where(t=> t.ServiceTypeID== serviceid && t.VendorID == int.Parse(this.Session["VendorID"].ToString())).First().ID;
                vendor_offer.CustomerRequestID = Convert.ToInt16(mod.customerrequestid);
                vendor_offer.Status = UTIL.Conts.Canceled;
                vendor_offer.DateTime = Convert.ToString(DateTime.Now);

                db.VendorServiceOfferForRequests.InsertOnSubmit(vendor_offer);
                db.SubmitChanges();




                return Json(new { Result = true });
            }
            else return Json(new { Result = false });
        }

        [HttpGet]
        public ActionResult getAcceptedRequests()
        {
            DBDataContext db = new DBDataContext();
            int vendorid = int.Parse(this.Session["VendorID"].ToString());
            List<CustomerRequestForService> cust = db.CustomerRequestForServices.Where(t => t.VendorIDAccepted == vendorid && t.EndTime >= DateTime.Now && t.status==UTIL.Conts.Accepted).ToList();
            List<GetAcceptedRequestsVendor> listrequest = new List<GetAcceptedRequestsVendor>();
            foreach (CustomerRequestForService c in cust)
            {
                GetAcceptedRequestsVendor gearv = new GetAcceptedRequestsVendor();
                gearv.name = c.Customer.FirstName + " " + c.Customer.LastName;
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
