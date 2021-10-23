data "aws_elastic_beanstalk_solution_stack" "node_14_latest" {
  most_recent = true

  name_regex = "^64bit Amazon Linux 2 (.*) running Node.js 14$"
}

variable "environment_options" {
  type = list(object({ namespace = string, name = string, value = any }))
  default = []
}
variable "environment_network" {
  type = object({ id = string, private_subnets = list(string), public_subnets = list(string) })
}

resource "aws_elastic_beanstalk_environment" "main_environment" {
  name                  = "main"
  application           = aws_elastic_beanstalk_application.api.name
  solution_stack_name   = data.aws_elastic_beanstalk_solution_stack.node_14_latest.name
  version_label         = immutable-elastic-beanstalk_application-version.latest.version_label


  dynamic "setting" {
    for_each = var.environment_options
    content {
      namespace = setting.value["namespace"]
      name      = setting.value["name"]
      value     = setting.value["value"]
    }
  }

  ## Instance Configs
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.api_instance_profile.name
  }

  ## Elastic Beanstalk Configs
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
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "LoadBalancerType"
    value     = "application"
  }

  ## Networking Configs
  setting {
    namespace = "aws:ec2:vpc"
    name      = "VPCId"
    value     = var.environment_network.id
  }
  setting {
    namespace = "aws:ec2:vpc"
    name      = "Subnets"
    value     = join(",", sort(var.environment_network.private_subnets))
  }
  setting {
    namespace = "aws:ec2:vpc"
    name      = "ELBSubnets"
    value     = join(",", sort(var.environment_network.public_subnets))
  }
}

output "environment_arn" {
  value = aws_elastic_beanstalk_environment.main_environment.arn
}
output "environment_cname" {
  value = aws_elastic_beanstalk_environment.main_environment.cname
}