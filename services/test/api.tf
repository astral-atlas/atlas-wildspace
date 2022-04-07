resource "aws_s3_bucket" "api_data" {
  bucket_prefix = "wildspace-test-data"
  force_destroy = true
}

module "api" {
  source = "../modules/api"
  environment_network = {
    id = module.vpc.vpc_id
    private_subnets = module.vpc.private_subnets
    public_subnets = module.vpc.public_subnets
  }
}
