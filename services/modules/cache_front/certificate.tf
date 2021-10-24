
module "cache_cert" {
  source = "../certificate"
  providers = {
    aws = aws.american
  }

  record_zone_id = data.aws_route53_zone.root.zone_id
  record_full_name = local.cache_fqdn
}