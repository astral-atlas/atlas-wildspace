variable "objects_directory" {
  type = string
}

locals {
  mime_types = jsondecode(file("${path.module}/mime_types.json"))

  objects = fileset(var.objects_directory, "**")
}

variable "objects_acl" {
  type = string
  default = "public-read"
}

resource "aws_s3_bucket_object" "objects" {
  for_each      = toset(local.objects)
  bucket        = aws_s3_bucket.site.bucket

  key           = each.key
  content_type  = lookup(local.mime_types, regex("\\.[^.]+$", each.key), null)

  acl           = var.objects_acl
  source        = join("/", [var.objects_directory, each.key])
  etag          = filemd5(join("/", [var.objects_directory, each.key]))
}