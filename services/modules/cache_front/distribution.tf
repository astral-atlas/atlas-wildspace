variable "origin" {
  type = string
}
variable "functions" {
  type = list(object({ event_type = string, function_arn = string }))
  default = []
}

resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name = var.origin
    origin_id   = "main"
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  aliases = [local.cache_fqdn]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "main"

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

    dynamic function_association {
      for_each = var.functions
      content {
        event_type   = function_association.value["event_type"]
        function_arn = function_association.value["function_arn"]
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
    acm_certificate_arn = module.cache_cert.certificate_arn
    ssl_support_method = "sni-only"
  }
}