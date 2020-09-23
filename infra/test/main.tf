terraform {
  backend "remote" {
    organization = "luke"

    workspaces {
      name = "wildspace"
    }
  }
}

resource "random_pet" "build_bucket" {}

provider "aws" {
  region = "ap-southeast-2"
}

resource "aws_s3_bucket" "astral_atlas_builds_bucket" {
  bucket = random_pet.build_bucket.id
}

resource "aws_elastic_beanstalk_application" "api" {
  name        = "AstralAtlas: WildspaceAPI"
  description = "The REST API Component of Astral Atlas: Wilspace"
}

output "bucket" {
  value = aws_s3_bucket.astral_atlas_builds_bucket.arn
}
output "api_application" {
  value = aws_elastic_beanstalk_application.api.arn
}
