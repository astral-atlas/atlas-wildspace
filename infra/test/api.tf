locals {
  api_zip_path = "${path.module}/../../artifacts/api.zip"
}

/*
  IAM POLICY
*/

data "aws_iam_policy_document" "assume_role" {
  statement {
    sid = "1"

    actions = [
      "sts:AssumeRole",
    ]
    principals {
      type = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "api" {
  name = "wilspace-api-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_instance_profile" "api" {
  name = "9now-tvapi_profile"
  role = aws_iam_role.api.name
}

/*
  ELASTIC BEANSTALK VERSION
*/

resource "elastic-beanstalk_bundle" "api_source" {
  bucket = aws_s3_bucket.astral_atlas_builds_bucket.bucket
  file = abspath(local.api_zip_path)
  prefix = "wildspace"
  fileHash = filemd5(local.api_zip_path)
}

resource "elastic-beanstalk_application_version" "api" {
  applicationName = aws_elastic_beanstalk_application.api.name

  sourceBundle = {
    bucket = elastic-beanstalk_bundle.api_source.bucket
    key = elastic-beanstalk_bundle.api_source.key
  }
}

/*
  ELASTIC BEANSTALK ENVIRONMENT
*/

resource "aws_elastic_beanstalk_environment" "api_test" {
  name                = "wildspace-api-test-env"
  application         = aws_elastic_beanstalk_application.api.name
  solution_stack_name = "64bit Amazon Linux 2 v5.2.1 running Node.js 12"
  version_label = elastic-beanstalk_application_version.api.version

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.api.id
  }
}

resource "aws_elastic_beanstalk_application" "api" {
  name        = "astral-atlas-wildspace-api"
  description = "The REST API Component of Astral Atlas: Wilspace"
}