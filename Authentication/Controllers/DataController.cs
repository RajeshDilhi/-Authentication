using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Web.Http;

namespace Authentication.Controllers
{
    public class DataController : ApiController
    {
        [AllowAnonymous]
        [HttpGet]
        [Route("api/data/forall")]
        public IHttpActionResult get()
        {
            return Ok("now server is running" + DateTime.Now.ToString());
        }
        [Authorize]
        [HttpGet]
        [Route("api/data/autenticated")]
        public IHttpActionResult getforAutenticated()
        {
            var identity = (ClaimsIdentity)User.Identity;
            return Ok("hello" + identity.Name);
        }

        [Authorize(Roles ="admin")]
        [HttpGet]
        [Route("api/data/Authorize")]
        public IHttpActionResult getforAdmin()
        {
            var identity = (ClaimsIdentity)User.Identity;
            var role = identity.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value);
            return Ok("hello" + identity.Name + "Role:"+ string.Join(",",role.ToList()));
        }
    }
}
