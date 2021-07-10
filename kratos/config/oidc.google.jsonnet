local claims = {
  email_verified: false
} + std.extVar('claims');

{
  identity: {
    traits: {
       [if "email" in claims && claims.email_verified then "email" else null]: claims.email,
       first_name: claims.given_name,
       last_name: claims.family_name,
    },
  },
}