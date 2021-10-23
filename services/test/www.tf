locals {
  www_config = {
    "www": {
      "sesame": {
        "httpOrigin": "http://sesame.astral-atlas.com"
      }
    },
    "api": {
      "wildspace": {
        "httpOrigin": "http://api.wildspace.astral-atlas.com",
        "wsOrigin": "ws://api.wildspace.astral-atlas.com"
      },
      "sesame": {
        "httpOrigin": "http://api.sesame.astral-atlas.com"
      }
    }
  }
}
data "external" "create_website" {
  program = ["bash", "${path.module}/build.sh", "configure_website"]

  query = {
    "dist_dir": "${path.module}/../../www2/dist",
    "config": jsonencode(local.www_config),
  }
}

resource "aws_s3_bucket" "www_test" {
  bucket = "wildspace.astral-atlas.com"

  website {
    index_document = "index.html"
    error_document = "index.html"
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
  www_dir = data.external.create_website.result.website_dir
  www_objects = [for o in fileset(local.www_dir, "**") : o if o != "config.json"]
}

resource "aws_s3_bucket_object" "www_objects" {
  for_each = toset(local.www_objects)
  bucket = aws_s3_bucket.www_test.bucket

  key    = each.key
  content_type = lookup(local.mime_types, regex("\\.[^.]+$", each.key), null)

  acl = "public-read"
  source = join("/", [local.www_dir, each.key])
  etag = filemd5(join("/", [local.www_dir, each.key]))
}
resource "aws_s3_bucket_object" "www_config" {
  bucket = aws_s3_bucket.www_test.bucket

  key    = "config.json"
  content_type = "application/json"

  acl = "public-read"
  content = jsonencode(local.www_config)
  etag = md5(jsonencode(local.www_config))
}

resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.root.zone_id
  name    = "wildspace"
  type    = "A"

  alias {
    name                   = aws_s3_bucket.www_test.website_domain
    zone_id                = "Z1WCIGYICN2BYD"
    evaluate_target_health = false
  }
}

output "www-origin-name" {
  value = aws_s3_bucket.www_test.website_endpoint
}
output "www-public-name" {
  value = "${aws_route53_record.www.name}.${data.aws_route53_zone.root.name}"
}