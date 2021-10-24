data "aws_elastic_beanstalk_hosted_zone" "current" { }


## API Domains

resource "aws_route53_record" "api" {
  zone_id = data.aws_route53_zone.root.zone_id
  name    = "api.wildspace"
  type    = "A"

  alias {
    name                   = module.api.environment_cname
    zone_id                = data.aws_elastic_beanstalk_hosted_zone.current.id
    evaluate_target_health = false
  }
}

module "api_certificate" {
  source = "../modules/certificate"

  record_zone_id = data.aws_route53_zone.root.zone_id
  record_full_name = "api.wildspace.astral-atlas.com"
}

## Asset Domains


resource "aws_route53_record" "assets" {
  zone_id = data.aws_route53_zone.root.zone_id
  name    = "assets.wildspace"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.assets.domain_name
    zone_id                = aws_cloudfront_distribution.assets.hosted_zone_id
    evaluate_target_health = false
  }
}
module "assets_certificate" {
  source = "../modules/certificate"
  providers = {
    aws = aws.american
  }

  record_zone_id = data.aws_route53_zone.root.zone_id
  record_full_name = "assets.wildspace.astral-atlas.com"
}
resource "aws_cloudfront_distribution" "assets" {
  origin {
    domain_name = module.api.assets_bucket_regional_domain
    origin_id   = "assets"
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  aliases = ["assets.wildspace.astral-atlas.com"]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "assets"

    viewer_protocol_policy = "redirect-to-https"
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
    acm_certificate_arn = module.assets_certificate.certificate_arn
    ssl_support_method = "sni-only"
  }
}