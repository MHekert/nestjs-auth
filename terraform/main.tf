terraform {
  required_version = "~> 0.14.7"

  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
    auth0 = {
      source = "alexkappa/auth0"
    }
  }
}

provider "aws" {
  region = var.region
}

provider "auth0" {
  domain = var.auth0_domain
  client_id = var.auth0_client_id
  client_secret = var.auth0_client_secret
  debug = true
}