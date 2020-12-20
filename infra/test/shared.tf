resource "random_pet" "build_bucket" {}
resource "aws_s3_bucket" "astral_atlas_builds_bucket" {
  bucket = random_pet.build_bucket.id
}
