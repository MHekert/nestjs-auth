variable "region" {
  type    = string
  default = "eu-central-1"
}

variable "env" {
  type    = string
  default = "staging"
}

variable "project" {
  type    = string
  default = "nestjs-auth"
}

variable "google_client_id" {
  type = string
}

variable "google_client_secret" {
  type = string
}

variable "facebook_client_id" {
  type = string
}

variable "facebook_client_secret" {
  type = string
}

variable "auth0_client_id" {
  type = string
}

variable "auth0_client_secret" {
  type = string
}

variable "auth0_domain" {
  type = string
}
