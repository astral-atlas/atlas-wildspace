data "aws_iam_role" "beanstalk_service" {
  name = "aws-elasticbeanstalk-service-role"
}
resource "aws_elastic_beanstalk_application" "api" {
  name        = "Wildspace API"
  description = "Wildspace API"

  appversion_lifecycle {
    service_role          = data.aws_iam_role.beanstalk_service.arn
    max_count             = 128
    delete_source_from_s3 = true
  }
}

output "application_name" {
  value = aws_elastic_beanstalk_application.api.name
}