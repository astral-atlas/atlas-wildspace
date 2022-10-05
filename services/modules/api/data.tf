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

resource "random_pet" "api_data_table_name" {
  length = 4
}
resource "aws_dynamodb_table" "api_data" {
  name           = "wildspace-data-${random_pet.api_data_table_name.id}"
  billing_mode   = "PROVISIONED"
  read_capacity  = 20
  write_capacity = 20

  hash_key       = "Partition"
  range_key      = "Sort"

  attribute {
    name = "Partition"
    type = "S"
  }

  attribute {
    name = "Sort"
    type = "S"
  }

  ttl {
    attribute_name = "ExpiresBy"
    enabled        = false
  }
}