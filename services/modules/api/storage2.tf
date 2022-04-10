resource "random_pet" "asset_bucket_name" {
  length = 4
}
resource "aws_s3_bucket" "asset_data" {
  bucket = "wildspace-data-${random_pet.asset_bucket_name.id}"
}
resource "aws_s3_bucket_acl" "asset_data_acl" {
  bucket = aws_s3_bucket.asset_data.id
  acl    = "private"
}
resource "aws_s3_bucket_public_access_block" "asset_data_access" {
  bucket = aws_s3_bucket.asset_data.id
  block_public_acls   = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true
}
resource "aws_s3_bucket_cors_configuration" "asset_data_cors" {
  bucket = aws_s3_bucket.asset_data.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET", "HEAD"]
    allowed_origins = [var.www_origin_name, "http://localhost:8080", "http://localhost:5568"]
    expose_headers  = ["ETag", "Content-Length", "Content-Type"]
    max_age_seconds = 3000
  }
}
