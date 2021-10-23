terraform {
  required_providers {
    immutable-elastic-beanstalk = {
      source = "lukekaalim/immutable-elastic-beanstalk"
      version = "2.0.4"
    }
  }
}

variable "name" {
  type = string
}