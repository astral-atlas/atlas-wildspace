variable "book_version" {
  type = string
}

module "book_release_archive" {
  source = "../github_release"
  owner = "astral-atlas"
  repository = "wildspace"
  release_tag = "@astral-atlas/wildspace-book@${var.book_version}"
  release_asset_name = "wildspace-book.zip"
  output_directory = "./temp/book/release"
}

data "external" "configure_bundle" {
  program = ["bash", "${path.module}/configure.sh"]

  query = {
    "output_dir": "./temp/www/objects",
    "archive_path": module.book_release_archive.output_file
  }
}
variable "book_origin" {
  type = string
}

module "static_site" {
  source = "../static_site"

  site_hostname = var.book_origin
  objects_directory = data.external.configure_bundle.result.output_dir
}

variable "record_zone_id" {
  type = string
}
variable "record_name" {
  type = string
}

module "cache" {
  source = "../cache_front"

  origin = module.static_site.bucket_regional_domain
  record_zone_id = var.record_zone_id
  record_name = var.record_name
}
