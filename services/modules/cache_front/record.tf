variable "record_zone_id" {
  type = string
}

data "aws_route53_zone" "root" {
  zone_id = var.record_zone_id
}

variable "record_name" {
  type = string
}

resource "aws_route53_record" "main" {
  zone_id = data.aws_route53_zone.root.zone_id
  name    = var.record_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.main.domain_name
    zone_id                = aws_cloudfront_distribution.main.hosted_zone_id
    evaluate_target_health = false
  }
}

locals {
  cache_fqdn = "${var.record_name}.${data.aws_route53_zone.root.name}"
}