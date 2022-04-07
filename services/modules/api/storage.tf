resource "aws_s3_bucket" "api_data" {
  bucket_prefix = "test2-wildspace-data-"
}
output "data_bucket" {
  value = aws_s3_bucket.api_data.bucket
}
output "data_bucket_zone_id" {
  value = aws_s3_bucket.api_data.hosted_zone_id
}

variable "www_origin_name" {
  type = string
}
resource "aws_s3_bucket" "assets" {
  bucket_prefix = "test2-wildspace-assets-"

  acl = "public-read"

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET", "HEAD"]
    allowed_origins = [var.www_origin_name, "http://localhost:8080"]
    expose_headers  = ["ETag", "Content-Length", "Content-Type"]
    max_age_seconds = 3000
  }
}
output "assets_bucket" {
  value = aws_s3_bucket.assets.bucket
}
output "assets_bucket_zone_id" {
  value = aws_s3_bucket.assets.hosted_zone_id
}
output "assets_bucket_regional_domain" {
  value = aws_s3_bucket.assets.bucket_regional_domain_name
}

