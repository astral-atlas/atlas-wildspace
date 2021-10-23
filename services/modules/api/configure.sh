#!/bin/env -S bash -e

input=$(</dev/stdin)

output_dir=$(echo $input | jq -r '.output_dir')

archive_path=$(echo $input | jq -r '.archive_path')
prefix=$(echo $input | jq -r '.prefix')

config=$(echo $input | jq -r '.config')
config_hash=$(echo $config | sha1sum | head -c 8)

output_name="$prefix-$config_hash.zip"
output_path="$output_dir/$output_name"

(
  echo $archive_path
  echo $prefix
  echo $config
  echo $config_hash

  mkdir -p $output_dir

  cp $archive_path $output_path

  (
    cd $output_dir;
    echo $config > config.json;
    echo "web: node api config.json" > Procfile;
    zip $output_name Procfile config.json
  )
) >> api_configure.log


echo "
{ 
  \"output_path\": \"$output_path\",
  \"config_hash\": \"$config_hash\",
  \"output_name\": \"$output_name\"
}
"