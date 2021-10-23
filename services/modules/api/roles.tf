
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
data "aws_iam_policy_document" "api_role_policy" {
  // Sesame Data Access
  statement {
    sid = "DataAccess"
    actions   = ["s3:Get*", "s3:List*", "s3:PutObject*"]
    resources = [
      aws_s3_bucket.api_data.arn,
      "${aws_s3_bucket.api_data.arn}/*",
      aws_s3_bucket.assets.arn,
      "${aws_s3_bucket.assets.arn}/*"
    ]
    effect = "Allow"
  }
}
resource "aws_iam_role" "api_role" {
  name = "${var.name}_wildspace_api"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role_policy.json

  inline_policy {
    name = "api_role_policy"
    policy = data.aws_iam_policy_document.api_role_policy.json
  }

  managed_policy_arns = [
    data.aws_iam_policy.elastic_beanstalk_web_policy.arn,
    data.aws_iam_policy.elastic_beanstalk_worker_policy.arn,
    data.aws_iam_policy.elastic_beanstalk_docker_policy.arn,
    data.aws_iam_policy.ec2_contanier_read_only_policy.arn,
  ]
}

resource "aws_iam_instance_profile" "api_instance_profile" {
  name = "${var.name}_wildspace_api"
  role = aws_iam_role.api_role.name
}