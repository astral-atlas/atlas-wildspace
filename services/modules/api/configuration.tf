resource "aws_ssm_parameter" "api_config" {
  name  = "/wildspace/api/v1"
  type  = "String"
  value = jsonencode({
    "port": 8080
    "data": {
      type: "awsS3",
      bucket: aws_s3_bucket.api_data.bucket,
      keyPrefix: "/wildspace",
      region: "ap-southeast-2"
    },
    "asset": {
      type: "awsS3",
      bucket: aws_s3_bucket.assets.bucket,
      keyPrefix: "/wildspace/assets",
      region: "ap-southeast-2"
    },
    "api": {
      "sesame": {
        "origin": "https://api.sesame.astral-atlas.com",
        "proof": {
          "type": "service",
          "grantId": "8618874e-cb56-48b4-8f93-ac7bb6d1b590",
          "serviceId": "ef43a6c3-df7c-4bdf-8957-0e91593a5ba9",
          "secret": "dd63b2d424d9937a449598866f9c2491"
        }
      }
    }
  })
}