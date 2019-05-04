using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IwannaMobileV1.UserProfileData
{
    [Serializable]
    public class UserProfileSessionData
    {
        public int UserId { get; set; }

        public string EmailAddress { get; set; }

        public string FullName { get; set; }
    }
}