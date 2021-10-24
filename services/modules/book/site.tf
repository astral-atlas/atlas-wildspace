variable "book_version" {
  type = string
}

module "book_release_archive" {
  source = "../github_release"
  owner = "astral-atlas"
  repository = "wildspace"
  release_tag = "@astral-atlas/wildspace-book@${var.www_version}"
  release_asset_name = "wildspace-book.zip"
  output_directory = "./temp/book/release"
}

data "external" "configure_bundle" {
  program = ["bash", "${path.module}/configure.sh"]

  query = {
    "output_dir": "./temp/www/objects",
    "archive_path": module.www_release_archive.output_file
  }
}
variable "www_origin" {
  type = string
}

module "static_site" {
  source = "../static_site"

  site_hostname = var.www_origin
  objects_directory = data.external.configure_bundle.result.output_dir
}

variable "record_zone_id" {
  type = string
}
variable "record_name" {
  type = string
}

module "cache" {
  source = "../cache_front"

  origin = module.static_site.bucket_regional_domain
  functions = [{ event_type = "viewer-request", function_arn = aws_cloudfront_function.rewrite_path.arn }]
  record_zone_id = var.record_zone_id
  record_name = var.record_name
}

resource "random_pet" "function_name" {}

resource "aws_cloudfront_function" "rewrite_path" {
  name    = "${random_pet.function_name.id}_rewrite_path"
  runtime = "cloudfront-js-1.0"
  publish = true
  code    = file("${path.module}/rewrite_path.js")
}