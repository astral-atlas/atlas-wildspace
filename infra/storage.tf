resource "random_pet" "server" {
  keepers = {
    # Generate a new pet name each time we switch to a new AMI id
    ami_id = "${var.ami_id}"
  }
}

resource "aws_dynamodb_table" "player-table" {
  name           = "Players"
  billing_mode   = "PAY_PER_REQUEST"

  hash_key       = "PlayerId"

  attribute {
    name = "PlayerId"
    type = "S"
  }

  attribute {
    name = "PlayerName"
    type = "S"
  }
}

resource "aws_s3_bucket" "image_bucket" {
  bucket = "my-tf-test-bucket"
  acl    = "private"

  tags = {
    Name        = "My bucket"
    Environment = "Dev"
  }
}