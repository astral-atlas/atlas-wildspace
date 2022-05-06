

resource "random_pet" "environment_name" {}
resource "aws_amplify_app" "site" {
  name       = "wildspace-docs"
  repository = "https://github.com/astral-atlas/wildspace"


  build_spec = file("${path.module}/buildspec.yaml")

  custom_rule {
    source = <<EOT
</^[^.]+$/>
EOT
    status = "200"
    target = "/index.html"
  }

  environment_variables = {
    AMPLIFY_DIFF_DEPLOY: false
    AMPLIFY_MONOREPO_APP_ROOT: "docs"
    _LIVE_UPDATES: jsonencode([{"pkg":"node","type":"nvm","version":"16"}])
  }
}

resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.site.id
  branch_name = "canon"
  framework = "Web"
  stage = "PRODUCTION"
}


variable "domain_name" {
  type = string
}
resource "aws_amplify_domain_association" "main_domains" {
  app_id      = aws_amplify_app.site.id
  domain_name = var.domain_name

  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = ""
  }
}
