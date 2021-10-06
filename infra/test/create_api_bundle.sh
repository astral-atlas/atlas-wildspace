#!/bin/bash -e

input=$(</dev/stdin)

temp_workspace=$(echo $input | jq -r '.temp_workspace')
roor_dir=$(echo $input | jq -r '.roor_dir')
config=$(echo $input | jq -r '.config')
application_version_label=$(echo $input | jq -r '.application_version_label')

echo $input >> out.log
echo $temp_workspace >> out.log
echo $roor_dir >> out.log

create_bundle() {
  (
    # Clean and Prepare
    rm -rf $temp_workspace
    mkdir -p $temp_workspace $temp_workspace/archives $temp_workspace/bundle
    workplace_realdir=$(realpath $temp_workspace)

    echo $workplace_realdir
    # Build release
    (
      cd $roor_dir
      npm ci
      cp -rLT node_modules $workplace_realdir/bundle/node_modules
      cp -rT api2 $workplace_realdir/bundle
    )

    echo $config                                > $workplace_realdir/bundle/config.json
    echo "web: node entry.js config.json"       > $workplace_realdir/bundle/Procfile
    # Zip Bundle
    (cd $workplace_realdir/bundle; zip -r ../archives/$application_version_label.zip .)
  ) >> out.log
  echo $workplace_realdir/archives/$application_version_label.zip
}

bundle=$(create_bundle)

echo "{ \"application_version_source_bundle\": \"$bundle\" }"