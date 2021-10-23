variable "www_origin" {
  type = string
}
resource "aws_s3_bucket" "www" {
  bucket = var.www_origin

  website {
    index_document = "index.html"
    error_document = "index.html"
  }
}

output "bucket_arn" {
  value = aws_s3_bucket.www.arn
}

output "bucket_domain" {
  value = aws_s3_bucket.www.website_domain
}
output "bucket_regional_domain" {
  value = aws_s3_bucket.www.bucket_regional_domain_name
}

output "bucket_zone_id" {
  value = aws_s3_bucket.www.hosted_zone_id
}