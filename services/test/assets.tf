resource "aws_s3_bucket" "assets" {
  bucket_prefix = "wildspace-assets"

  acl = "public-read"
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET", "HEAD"]
    allowed_origins = ["https://wildspace.astral-atlas.com", "http://localhost:8080"]
    expose_headers  = ["ETag", "Content-Length", "Content-Type"]
    max_age_seconds = 3000
  }
  force_destroy = true
}