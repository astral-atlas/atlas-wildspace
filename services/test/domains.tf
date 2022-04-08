## Docs Domains
resource "aws_route53_record" "docs" {
  zone_id = data.aws_route53_zone.root.zone_id
  name    = "docs.wildspace"
  type    = "CNAME"

  ttl     = "300"
  records = ["astral-atlas.github.io"]
  
}