terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
    immutable-elastic-beanstalk = {
      source = "registry.terraform.io/lukekaalim/immutable-elastic-beanstalk"
      version = "2.0.4"
    }
  }
  backend "remote" {
    organization = "astral-atlas"

    workspaces {
      name = "wildspace"
    }
  }
}

provider "immutable-elastic-beanstalk" {
  region = "ap-southeast-2"
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


module "api" {
  source = "../modules/api"

  name = "test2"

  api_config = {
    // For forcing config hash updates (and thus creating new versions)
    "md5_breaker": 0,
    "api": {
      "sesame": {
        "origin": "http://api.sesame.astral-atlas.com",
        "proof": {
          "type": "service",
          "grantId": "8618874e-cb56-48b4-8f93-ac7bb6d1b590",
          "serviceId": "ef43a6c3-df7c-4bdf-8957-0e91593a5ba9",
          "secret": "dd63b2d424d9937a449598866f9c2491"
        }
      }
    }
  }
  api_version = "3.0.0"
  eb_version_bucket = "sesame-application-versions20210426131620788800000001"

  environment_options = [
    { namespace: "aws:elbv2:listener:443", name: "ListenerEnabled", value: true },
    { namespace: "aws:elbv2:listener:443", name: "Protocol", value: "HTTPS" },
    { namespace: "aws:elbv2:listener:443", name: "SSLCertificateArns", value: module.api_certificate.certificate_arn },
  ]
  environment_network = {
    id = module.vpc.vpc_id
    private_subnets = module.vpc.private_subnets
    public_subnets = module.vpc.public_subnets
  }

  www_origin_name = "wildspace2.astral-atlas.com"
}

module "www" {
  source = "../modules/www"

  name = "test2"

  www_config = {
    "www": {
      "sesame": {
        "httpOrigin": "http://sesame.astral-atlas.com"
      }
    },
    "api": {
      "wildspace": {
        "httpOrigin": "http://api.wildspace2.astral-atlas.com",
        "wsOrigin": "ws://api.wildspace2.astral-atlas.com"
      },
      "sesame": {
        "httpOrigin": "http://api.sesame.astral-atlas.com"
      }
    }
  }
  www_version = "3.0.0"
  www_origin = "wildspace2.astral-atlas.com"
}
