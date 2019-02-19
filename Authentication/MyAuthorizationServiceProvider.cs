using Microsoft.Owin.Security;
using Microsoft.Owin.Security.OAuth;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;

namespace Authentication
{
    public class MyAuthorizationServiceProvider : OAuthAuthorizationServerProvider
    {
        private Role GetRole(int roleId)
        {
            using (var db = new TESTEntities())
            {
                if (db != null)
                {
                    var roles = db.Roles.ToList();
                    var role = (from u in roles where u.RoleId == roleId
                                select new
                                {
                                    u.RoleType,
                                    u.RoleId
                                }).FirstOrDefault();
                    Role rl = new Role();
                    rl.RoleId = role.RoleId;
                    rl.RoleType = role.RoleType;
                    return rl;
                }
                else
                {
                    return null;
                }
            }
        }

        public override async Task ValidateClientAuthentication(OAuthValidateClientAuthenticationContext context)
        {
            await Task.Run(() => context.Validated());// this method validate client authentication
            //context.Validated();
        }
        public override async Task GrantResourceOwnerCredentials(OAuthGrantResourceOwnerCredentialsContext context)
        {
            try
            {

                using (var db = new TESTEntities())
                {
                    if (db != null)
                    {
                        var empl = db.Employees.ToList();
                        var users = db.Users.ToList();
                        var roles = db.Roles.ToList();

                        if (users != null)
                        {

                            var user = (from u in users
                                        where u.UserName == context.UserName && u.Password == context.Password
                                        select new
                                        {
                                            u.Name,
                                            u.UserName,
                                            u.Id,
                                            u.RoleId,
                                        }).FirstOrDefault();
                            if (user != null)
                            {
                                var usr = new User()
                                {
                                    Id = user.Id,
                                    UserName = user.UserName,
                                    Name = user.Name,
                                    RoleId=user.RoleId,
                                    Role = GetRole(user.RoleId)
                                };

                                 await Task.Run(() => context.Validated(BuildTicket(usr, context.Options)));
                            }
                            else
                            {
                                context.SetError("invalid_grant", "Provided username and password is incorrect");
                                return;
                            }
                        }
                        else
                        {
                            context.SetError("invalid_grant", "Provided username and password is incorrect");
                            return;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                context.SetError("invalid_grant", "Provided username and password is incorrect");
                return;
            }
        }
        

        private AuthenticationTicket BuildTicket(User user, OAuthAuthorizationServerOptions options)
        {
            try
            {
                var id = new ClaimsIdentity(options.AuthenticationType);
                id.AddClaim(new Claim(id.NameClaimType, user.Name));
                id.AddClaim(new Claim(id.RoleClaimType, user.Role.RoleType));
                id.AddClaim(new Claim("userdata", JsonConvert.SerializeObject(user)));

                IDictionary<string, string> data = new Dictionary<string, string>
                {
                    { "id", user.Id.ToString()},
                    { "userName", user.UserName},
                    { "fullName",user.Name},
                    { "RoleId",user.RoleId.ToString() },
                    {"RoleType",user.Role.RoleType }
                };

                AuthenticationProperties properties = new AuthenticationProperties(data);
                var result= new AuthenticationTicket(id, properties);
                return result;
            }
            catch (Exception ex)
            {
                return null;
            }
        }
        public override Task TokenEndpoint(OAuthTokenEndpointContext context)
        {
            foreach (KeyValuePair<string, string> property in context.Properties.Dictionary)
            {
                context.AdditionalResponseParameters.Add(property.Key, property.Value);
            }

            return Task.FromResult<object>(null);
        }
    }
}