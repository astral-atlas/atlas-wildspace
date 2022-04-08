resource "aws_s3_bucket" "api_data" {
  bucket_prefix = "wildspace-test-data"
  force_destroy = true
}

module "api" {
  source = "../modules/api"

  www_origin_name = "wildspace.astral-atlas.com"
  certificate = {
    arn = module.api_certificate.certificate_arn
  }
  environment_network = {
    id = module.vpc.vpc_id
    private_subnets = module.vpc.private_subnets
    public_subnets = module.vpc.public_subnets
  }
}
data "aws_elastic_beanstalk_hosted_zone" "current" { }
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
