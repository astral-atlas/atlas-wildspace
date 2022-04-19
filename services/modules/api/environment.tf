data "aws_elastic_beanstalk_solution_stack" "node_16_latest" {
  most_recent = true
  name_regex = "^64bit Amazon Linux 2 (.*) running Node.js 16$"
}

variable "environment_options" {
  type = list(object({ namespace = string, name = string, value = any }))
  default = []
}
variable "environment_network" {
  type = object({ id = string, private_subnets = list(string), public_subnets = list(string) })
}
variable "certificate" {
  type = object({
    arn = string
  })
}

locals {
  launch_config = [
    { namespace: "aws:autoscaling:launchconfiguration",  name: "IamInstanceProfile", value: aws_iam_instance_profile.api_instance_profile.name },
  ]
  logs = [
    { namespace: "aws:elasticbeanstalk:cloudwatch:logs", name: "StreamLogs", value: true },
    { namespace: "aws:elasticbeanstalk:cloudwatch:logs", name: "DeleteOnTerminate",  value: true },
  ]
  environment = [
    { namespace: "aws:elasticbeanstalk:environment", name: "LoadBalancerType", value: "application" },
  ]
  vpc = [
    { namespace: "aws:ec2:vpc", name: "VPCId", value: var.environment_network.id },
    { namespace: "aws:ec2:vpc", name: "Subnets", value: join(",", sort(var.environment_network.private_subnets)) },
    { namespace: "aws:ec2:vpc", name: "ELBSubnets", value: join(",", sort(var.environment_network.public_subnets)) },
  ]
  ssl = [
    { namespace: "aws:elbv2:listener:443", name: "ListenerEnabled", value: true },
    { namespace: "aws:elbv2:listener:443", name: "Protocol", value: "HTTPS" },
    { namespace: "aws:elbv2:listener:443", name: "SSLCertificateArns", value: var.certificate.arn },
  ]
  settings = concat(
    var.environment_options,
    local.launch_config,
    local.logs,
    local.environment,
    local.vpc,
    local.ssl
  )
}

resource "random_pet" "environment_name" {}
resource "aws_elastic_beanstalk_environment" "main_environment" {
  name                  = random_pet.environment_name.id
  application           = aws_elastic_beanstalk_application.api.name
  solution_stack_name   = data.aws_elastic_beanstalk_solution_stack.node_16_latest.name

  dynamic "setting" {
    for_each = local.settings
    content {
      namespace = setting.value["namespace"]
      name      = setting.value["name"]
      value     = setting.value["value"]
    }
  }
}

output "environment_arn" {
  value = aws_elastic_beanstalk_environment.main_environment.arn
}
output "environment_cname" {
  value = aws_elastic_beanstalk_environment.main_environment.cname
}