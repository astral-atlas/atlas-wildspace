
variable "www_version" {
  type = string
}

module "www_release_archive" {
  source = "../github_release"
  owner = "astral-atlas"
  repository = "wildspace"
  release_tag = "@astral-atlas/wildspace-www@${var.www_version}"
  release_asset_name = "wildspace-www.zip"
  output_directory = "./temp/www/release"
}

variable "www_config" {
  type = any
}
data "external" "cofigure_bundle" {
  program = ["bash", "${path.module}/configure.sh"]

  query = {
    "output_dir": "./temp/www/objects",
    "archive_path": module.www_release_archive.output_file
    "config": jsonencode(merge({}, var.www_config)),
  }
}

locals {
  mime_types = {
    ".html": "text/html",
    ".css":   "text/css",
    ".js":    "application/javascript",
    ".json":  "application/json",
    ".json5": "application/json5",
    ".svg":   "image/svg+xml",
    ".ico":   "image/png",
  }
  www_dir = data.external.cofigure_bundle.result.output_dir
  www_objects = fileset(local.www_dir, "**")
}

resource "aws_s3_bucket_object" "www_objects" {
  for_each = toset(local.www_objects)
  bucket = aws_s3_bucket.www.bucket

  key    = each.key
  content_type = lookup(local.mime_types, regex("\\.[^.]+$", each.key), null)

  acl = "public-read"
  source = join("/", [local.www_dir, each.key])
  etag = filemd5(join("/", [local.www_dir, each.key]))
}