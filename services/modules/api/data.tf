resource "aws_s3_bucket" "api_data" {
  bucket_prefix = "test2-wildspace-data-"
}

resource "aws_s3_bucket_acl" "data_acl" {
  bucket = aws_s3_bucket.api_data.id
  acl    = "private"
}
resource "aws_s3_bucket_public_access_block" "data_access" {
  bucket = aws_s3_bucket.api_data.id
  block_public_acls   = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true
}