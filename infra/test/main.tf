terraform {
  required_providers {
    elastic-beanstalk = {
      source = "registry.terraform.io/lukekaalim/elastic-beanstalk"
      version = ">= 1.5.0"
    }
  }
  backend "remote" {
    organization = "luke"

    workspaces {
      name = "wildspace"
    }
  }
}
provider "aws" {
  region = "ap-southeast-2"
}
provider "elastic-beanstalk" {
  aws_region = "ap-southeast-2"
}