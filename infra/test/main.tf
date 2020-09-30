terraform {
  required_providers {
    elastic-beanstalk = {
      source = "registry.terraform.io/lukekaalim/elastic-beanstalk"
      version = ">= 1.4.0"
    }
  }
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

provider "elastic-beanstalk" {
  aws_region = "ap-southeast-2"
}

resource "aws_s3_bucket" "astral_atlas_builds_bucket" {
  bucket = random_pet.build_bucket.id
}

resource "aws_elastic_beanstalk_application" "api" {
  name        = "astral-atlas-wildspace-api"
  description = "The REST API Component of Astral Atlas: Wilspace"
}

resource "aws_iam_instance_profile" "api" {
  name = "9now-tvapi_profile"
  role = aws_iam_role.api.name
}

resource "aws_iam_role" "api" {
  name = "wilspace-api-role"

  assume_role_policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": "sts:AssumeRole",
            "Principal": {
               "Service": "ec2.amazonaws.com"
            },
            "Effect": "Allow",
            "Sid": ""
        }
    ]
}
EOF
}

resource "elastic-beanstalk_bundle" "source" {
  bucket = aws_s3_bucket.astral_atlas_builds_bucket.bucket
  file = abspath("${path.module}/../../artifacts/api.zip")

  prefix = "wildspace"
  fileHash = filemd5(abspath("${path.module}/../../artifacts/api.zip"))
}

resource "elastic-beanstalk_application_version" "latest_api" {
  applicationName = aws_elastic_beanstalk_application.api.name

  sourceBundle = {
    bucket = elastic-beanstalk_bundle.source.bucket
    key = elastic-beanstalk_bundle.source.key
  }
}

resource "aws_elastic_beanstalk_environment" "api_test" {
  name                = "wildspace-api-test-env"
  application         = aws_elastic_beanstalk_application.api.name
  solution_stack_name = "64bit Amazon Linux 2 v5.2.1 running Node.js 12"
  version_label = elastic-beanstalk_application_version.latest_api.version

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.api.id
  }
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