resource "aws_cognito_user_pool" "user-pool" {
  name = format("%s-%s-user-pool", var.project, var.env)
  admin_create_user_config {
    allow_admin_create_user_only = false
  }
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }
  username_attributes = [
    "email"
  ]
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }
  auto_verified_attributes = [
    "email"
  ]
  username_configuration {
    case_sensitive = false
  }
}

resource "aws_cognito_identity_provider" "identity-provider-google" {
  user_pool_id  = aws_cognito_user_pool.user-pool.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    authorize_scopes = "email"
    client_id        = var.google_client_id
    client_secret    = var.google_client_secret
  }

  attribute_mapping = {
    email          = "email"
    username       = "sub"
    email_verified = "email_verified"
  }
}

resource "aws_cognito_identity_provider" "identity-provider-facebook" {
  user_pool_id  = aws_cognito_user_pool.user-pool.id
  provider_name = "Facebook"
  provider_type = "Facebook"

  provider_details = {
    authorize_scopes = "public_profile, email"
    client_id        = var.facebook_client_id
    client_secret    = var.facebook_client_secret
  }

  attribute_mapping = {
    username       = "id"
    email          = "email"
  }
}

resource "aws_cognito_user_pool_domain" "domain" {
  domain       = format("%s-%s", var.project, var.env)
  user_pool_id = aws_cognito_user_pool.user-pool.id
}

resource "aws_cognito_user_pool_client" "client" {
  name                                 = format("%s-%s-client", var.project, var.env)
  supported_identity_providers         = ["Google", "Facebook", "COGNITO"]
  user_pool_id                         = aws_cognito_user_pool.user-pool.id
  generate_secret                      = true
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid", "aws.cognito.signin.user.admin", "profile"]
  callback_urls                        = [ "https://www.postman.com" ]
  explicit_auth_flows                  = [ "ALLOW_REFRESH_TOKEN_AUTH", "ALLOW_USER_PASSWORD_AUTH", "ALLOW_USER_SRP_AUTH" ]
  prevent_user_existence_errors        = "ENABLED"
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.client.id
}
output "cognito_secret" {
  value = aws_cognito_user_pool_client.client.client_secret
}
output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.user-pool.id
}
output "cognito_user_pool_endpoint" {
  value = aws_cognito_user_pool.user-pool.endpoint
}