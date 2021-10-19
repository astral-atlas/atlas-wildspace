resource "aws_s3_bucket" "assets" {
  bucket_prefix = "wildspace-assets"

  acl = "public-read"
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET", "HEAD"]
    allowed_origins = ["http://wildspace.astral-atlas.com", "http://localhost:8080"]
    expose_headers  = ["ETag", "Content-Length", "Content-Type"]
    max_age_seconds = 3000
  }
}

output "assets-bucket-arn" {
  value = aws_s3_bucket.assets.arn
}

resource "aws_route53_record" "assets" {
  zone_id = data.aws_route53_zone.root.zone_id
  name    = "assets.wildspace"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.asset.domain_name
    zone_id                = aws_cloudfront_distribution.asset.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_acm_certificate" "asset" {
  provider = aws.american
  domain_name       = "assets.wildspace.astral-atlas.com"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
  tags = {}
}

resource "aws_acm_certificate_validation" "asset" {
  provider = aws.american
  certificate_arn         = aws_acm_certificate.asset.arn
  validation_record_fqdns = [for record in aws_route53_record.asset_validation : record.fqdn]
}

resource "aws_route53_record" "asset_validation" {
  for_each = {
    for dvo in aws_acm_certificate.asset.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.root.zone_id
}

resource "aws_cloudfront_distribution" "asset" {
  origin {
    domain_name = aws_s3_bucket.assets.bucket_regional_domain_name
    origin_id   = "asset_bucket"
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Some comment"
  default_root_object = "index.html"


  aliases = ["assets.wildspace.astral-atlas.com"]

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "asset_bucket"

    viewer_protocol_policy = "allow-all"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 86400

    forwarded_values {
      query_string = true

      cookies {
        forward = "none"
      }
    }
  }

  price_class = "PriceClass_All"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.asset.arn
    ssl_support_method = "sni-only"
  }
  tags = {}
}