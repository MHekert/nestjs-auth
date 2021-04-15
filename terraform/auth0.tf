resource "auth0_client" "client" {
  name                = format("%s-%s", var.project, var.env)
  app_type            = "spa"
  callbacks           = [ "https://www.postman.com" ]
  grant_types         = [ "refresh_token", "authorization_code" ]
}

resource "auth0_connection" "google_oauth2" {
  name     = format("%s-%s-google-oauth2-connection", var.project, var.env)
  strategy = "google-oauth2"
  enabled_clients = [auth0_client.client.client_id]
  options {
    client_id                = var.google_client_id
    client_secret            = var.google_client_secret
    set_user_root_attributes = "on_each_login"
  }
}

resource "auth0_connection" "facebook" {
  name     = format("%s-%s-facebook", var.project, var.env)
  strategy = "facebook"
  enabled_clients = [auth0_client.client.client_id]
  options {
    client_id                = var.facebook_client_id
    client_secret            = var.facebook_client_secret
    set_user_root_attributes = "on_each_login"
  }
}

resource "auth0_rule" "force_email_verification_rule" {
  name = "Force email verification"
  script = <<EOF
function emailVerified(user, context, callback) {
  if (!user.email_verified) {
    return callback(
      new UnauthorizedError('Please verify your email before logging in.')
    );
  } else {
    return callback(null, user, context);
  }
}
EOF
  enabled = true
}