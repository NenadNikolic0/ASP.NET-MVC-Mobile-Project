using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IwannaMobileV1.Models
{
    public class ServiceInsertModel
    {
        public string ServiceID { get; set; }
        public string Latitude  { get; set; }
        public string Longitude { get; set; }
        public string StartTime { get; set; }
        public string EndTime   { get; set; }
        public string Distance { get; set; }

    }
}