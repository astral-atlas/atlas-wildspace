data "aws_elastic_beanstalk_hosted_zone" "current" { }


resource "aws_route53_record" "api2" {
  zone_id = data.aws_route53_zone.root.zone_id
  name    = "api.wildspace2"
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
  record_full_name = "api.wildspace2.astral-atlas.com"
}

resource "aws_route53_record" "www2" {
  zone_id = data.aws_route53_zone.root.zone_id
  name    = "wildspace2"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.www.domain_name
    zone_id                = aws_cloudfront_distribution.www.hosted_zone_id
    evaluate_target_health = false
  }
}

module "www_certificate" {
  source = "../modules/certificate"
  providers = {
    aws = aws.american
  }

  record_zone_id = data.aws_route53_zone.root.zone_id
  record_full_name = "wildspace2.astral-atlas.com"
}

resource "aws_cloudfront_distribution" "www" {
  origin {
    domain_name = module.www.bucket_regional_domain
    origin_id   = "www"
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  aliases = ["wildspace2.astral-atlas.com"]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "www"

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
    acm_certificate_arn = module.www_certificate.certificate_arn
    ssl_support_method = "sni-only"
  }
}