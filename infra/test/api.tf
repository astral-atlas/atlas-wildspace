data "aws_iam_role" "beanstalk_service" {
  name = "aws-elasticbeanstalk-service-role"
}

resource "aws_elastic_beanstalk_application" "api" {
  name        = "wildspace-api"
  description = "Astral Atlas wildspace test api"

  appversion_lifecycle {
    service_role          = data.aws_iam_role.beanstalk_service.arn
    max_count             = 128
    delete_source_from_s3 = true
  }
}


locals {
  api_config = {
    "md5_breaker": 10
    "port": 8080 // this is the default port elastic beanstalk will listen to
    // This is used for the SDK
    "data": { type: "memory", directory: "./data" },
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
}
data "external" "create_api_bundle" {
  program = ["bash", "${path.module}/build.sh", "configure_bundle"]

  query = {
    "source_bundle_archive_path": "${path.module}/../../wildspace-api.zip",
    "application_version_label": "wildspace-api@2.2.0-${substr(md5(jsonencode(local.api_config)), 0, 6)}",
    "config": jsonencode(local.api_config),
  }
}

resource "immutable-elastic-beanstalk_application-version" "latest" {
  application_name = aws_elastic_beanstalk_application.api.name
  source_bucket = "sesame-application-versions20210426131620788800000001"
  archive_path = data.external.create_api_bundle.result.application_version_source_bundle
}

data "aws_iam_policy_document" "ec2_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

data "aws_iam_policy" "elastic_beanstalk_web_policy" {
  name = "AWSElasticBeanstalkWebTier"
}
data "aws_iam_policy" "elastic_beanstalk_worker_policy" {
  name = "AWSElasticBeanstalkWorkerTier"
}
data "aws_iam_policy" "elastic_beanstalk_docker_policy" {
  name = "AWSElasticBeanstalkMulticontainerDocker"
}
data "aws_iam_policy" "ec2_contanier_read_only_policy" {
  name = "AmazonEC2ContainerRegistryReadOnly"
}
resource "aws_iam_role" "api_role" {
  name = "wildspace_api_role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role_policy.json

  managed_policy_arns = [
    data.aws_iam_policy.elastic_beanstalk_web_policy.arn,
    data.aws_iam_policy.elastic_beanstalk_worker_policy.arn,
    data.aws_iam_policy.elastic_beanstalk_docker_policy.arn,
    data.aws_iam_policy.ec2_contanier_read_only_policy.arn,
  ]
}
resource "aws_iam_instance_profile" "api_instance_profile" {
  name = "wildspace_api_instance_profile"
  role = aws_iam_role.api_role.name
}

data "aws_elastic_beanstalk_solution_stack" "node_14_latest" {
  most_recent = true

  name_regex = "^64bit Amazon Linux 2 (.*) running Node.js 14$"
}

resource "aws_elastic_beanstalk_environment" "api_test" {
  name                = "wildspace-api-test"
  application         = aws_elastic_beanstalk_application.api.name
  solution_stack_name = data.aws_elastic_beanstalk_solution_stack.node_14_latest.name
  version_label = immutable-elastic-beanstalk_application-version.latest.version_label

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.api_instance_profile.name
  }
  setting {
    namespace = "aws:elasticbeanstalk:cloudwatch:logs"
    name      = "StreamLogs"
    value     = true
  }
  setting {
    namespace = "aws:elasticbeanstalk:cloudwatch:logs"
    name      = "DeleteOnTerminate"
    value     = true
  }
}

resource "aws_route53_record" "api" {
  zone_id = data.aws_route53_zone.root.zone_id
  name    = "api.wildspace"
  type    = "A"

  alias {
    name                   = aws_elastic_beanstalk_environment.api_test.cname
    zone_id                = "Z2PCDNR3VC2G1N"
    evaluate_target_health = false
  }
}

output "api-origin-name" {
  value = aws_elastic_beanstalk_environment.api_test.cname
}
output "api-public-name" {
  value = aws_route53_record.api.fqdn
}