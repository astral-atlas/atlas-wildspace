terraform {
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

resource "aws_elastic_beanstalk_application" "api" {
  name        = "AstralAtlas: WildspaceAPI"
  description = "The REST API Component of Astral Atlas: Wilspace"
}