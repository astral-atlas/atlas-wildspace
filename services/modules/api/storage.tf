resource "aws_s3_bucket" "api_data" {
  bucket_prefix = "test2-wildspace-data-"
}

variable "www_origin_name" {
  type = string
}
resource "aws_s3_bucket" "assets" {
  bucket_prefix = "test2-wildspace-assets-"
}
resource "aws_s3_bucket_acl" "assets_acl" {
  bucket = aws_s3_bucket.assets.id
  acl    = "private"
}
resource "aws_s3_bucket_public_access_block" "assets_block" {
  bucket = aws_s3_bucket.assets.id
  block_public_acls   = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true
}
resource "aws_s3_bucket_cors_configuration" "cors" {
  bucket = aws_s3_bucket.assets.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET", "HEAD"]
    allowed_origins = [var.www_origin_name, "http://localhost:8080", "http://localhost:5568"]
    expose_headers  = ["ETag", "Content-Length", "Content-Type"]
    max_age_seconds = 3000
  }
}
