using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IwannaMobileV1.Models
{
    public class ActiveRequests
    {
        public string service { get; set; }
        public string customer { get; set; }
        public string email { get; set; }
        public string address { get; set; }
        public string pol { get; set; }
        public string startend { get; set; }
        public string requestid { get; set; }
    }
}