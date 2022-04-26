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

  name = "test2"

  www_config = {
    "www": {
      "sesame": {
        "httpOrigin": "https://sesame.astral-atlas.com"
      }
    },
    "api": {
      "wildspace": {
        "httpOrigin": "https://api.wildspace.astral-atlas.com",
        "wsOrigin": "wss://api.wildspace.astral-atlas.com"
      },
      "sesame": {
        "httpOrigin": "https://api.sesame.astral-atlas.com"
      }
    }
  }
  www_version = "3.2.1"
  www_origin = "wildspace.astral-atlas.com"
  record_zone_id = data.aws_route53_zone.root.zone_id
  record_name = "wildspace"
}


module "book" {
  source = "../modules/book"

  book_version = "4.1.0"
  book_origin = "components.dev.astral-atlas.com"
  record_zone_id = data.aws_route53_zone.root.zone_id
  record_name = "components.dev"
}