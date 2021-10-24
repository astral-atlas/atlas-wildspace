#!/bin/env -S bash -e

input=$(</dev/stdin)

archive_path=$(echo $input | jq -r '.archive_path')
output_dir=$(echo $input | jq -r '.output_dir')

(
  echo $archive_path
  echo $config
  echo $output_dir

  mkdir -p $output_dir

  unzip $archive_path -d $output_dir
) >> www_configure.log

echo "{ \"output_dir\": \"$output_dir\" }"