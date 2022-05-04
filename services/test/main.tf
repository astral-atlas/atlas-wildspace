terraform {
  backend "remote" {
    organization = "astral-atlas"

    workspaces {
      name = "wildspace"
    }
  }
}

provider "aws" {
  region = "ap-southeast-2"
}

provider "aws" {
  alias  = "american"
  region = "us-east-1"
}

data "aws_route53_zone" "root" {
  name         = "astral-atlas.com."
}

module "www" {
  source = "../modules/www"

  domain_name = "wildspace.astral-atlas.com"
}

module "docs" {
  source = "../modules/docs"

  domain_name = "docs.wildspace.astral-atlas.com"
}
