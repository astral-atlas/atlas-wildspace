variable "site_hostname" {
  type = string
}
resource "aws_s3_bucket" "site" {
  bucket = var.site_hostname

  website {
    index_document = "index.html"
    error_document = "index.html"
  }
}

output "bucket_arn" {
  value = aws_s3_bucket.site.arn
}
output "bucket_name" {
  value = aws_s3_bucket.site.bucket
}
output "bucket_domain" {
  value = aws_s3_bucket.site.website_domain
}
output "bucket_regional_domain" {
  value = aws_s3_bucket.site.bucket_regional_domain_name
}
output "bucket_zone_id" {
  value = aws_s3_bucket.site.hosted_zone_id
}