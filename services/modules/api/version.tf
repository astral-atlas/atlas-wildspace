variable "api_version" {
  type = string
}

module "api_release_archive" {
  source = "../github_release"

  owner = "astral-atlas"
  repository = "wildspace"
  release_tag = "@astral-atlas/wildspace-api@${var.api_version}"
  release_asset_name = "wildspace-api.zip"
  output_directory = "./temp/api/release"
}

variable "api_config" {
  type = any
}
locals {
  config = {
    "port": 8080
    "data": { type: "awsS3", bucket: aws_s3_bucket.api_data.bucket, keyPrefix: "/wildspace", region: "ap-southeast-2" },
    "asset": { type: "awsS3", bucket: aws_s3_bucket.assets.bucket, keyPrefix: "/wildspace/assets", region: "ap-southeast-2" }
  }
}
data "external" "cofigure_bundle" {
  program = ["bash", "${path.module}/configure.sh"]

  query = {
    "output_dir": "./temp/api/bundle",
    "archive_path": module.api_release_archive.output_file
    "prefix": var.api_version
    "config": jsonencode(merge(local.config, var.api_config)),
  }
}

variable "eb_version_bucket" {
  type = string
}
resource "immutable-elastic-beanstalk_application-version" "latest" {
  application_name = aws_elastic_beanstalk_application.api.name
  source_bucket = var.eb_version_bucket
  archive_path = data.external.cofigure_bundle.result.output_path
}

output "latest_version_label" {
  value = immutable-elastic-beanstalk_application-version.latest.version_label
}