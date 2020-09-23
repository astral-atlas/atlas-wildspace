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
  name        = "astral-atlas-wildspace-api"
  description = "The REST API Component of Astral Atlas: Wilspace"
}

resource "aws_elastic_beanstalk_environment" "api_test" {
  name                = "wildspace-api-test-env"
  application         = aws_elastic_beanstalk_application.api.name
  solution_stack_name = "64bit Amazon Linux 2 v5.2.1 running Node.js 12"
}

output "bucket" {
  value = aws_s3_bucket.astral_atlas_builds_bucket.bucket
}
output "api_application" {
  value = aws_elastic_beanstalk_application.api.name
}
output "api_test_environment" {
  value = aws_elastic_beanstalk_environment.api_test.name
}