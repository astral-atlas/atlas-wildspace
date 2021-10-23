#!/bin/env -S bash -e

configure_bundle() {
  input=$(</dev/stdin)

  source_bundle_archive_path=$(echo $input | jq -r '.source_bundle_archive_path')
  application_version_label=$(echo $input | jq -r '.application_version_label')
  config=$(echo $input | jq -r '.config')
  (
    echo $source_bundle_archive_path
    echo $application_version_label
    echo $config
    mkdir -p temp/api

    cp $source_bundle_archive_path temp/api/$application_version_label.zip
    cd temp/api;
    echo $config                                > config.json
    echo "web: node api config.json"            > Procfile
    zip $application_version_label.zip Procfile config.json
  ) >> out.log

  echo "{ \"application_version_source_bundle\": \"temp/api/$application_version_label.zip\" }"
}

configure_website() {
  input=$(</dev/stdin)

  dist_dir=$(echo $input | jq -r '.dist_dir')
  (
    echo $dist_dir
    echo $config
    mkdir -p temp/www

    cp -Tr $dist_dir temp/www
  ) >> out.log
  echo "{ \"website_dir\": \"temp/www\" }"
}

"$@"
