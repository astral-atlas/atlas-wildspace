artifacts:
	mkdir -p artifacts

web/artifacts/web.zip:
	make -C web
artifacts/web.zip: web/artifacts/web.zip
	cp web/artifacts/web.zip artifacts/web.zip

api/node_modules api/package-lock.json: api/package.json
	cd api; npm ci install
	touch api/package-lock.json api/node_modules

artifacts/api.zip: api/node_modules artifacts api/**/*.js
	cd api; zip -r ../artifacts/api.zip .

clean:
	rm -rf artifacts

# Infra
infra/test/.terraform: infra/**/*.tf
	cd infra/test; terraform init;
	touch infra/test/.terraform

artifacts/test-deployment.json: artifacts infra/test/.terraform infra/**/*.tf artifacts/api.zip
	cd infra/test; terraform apply -auto-approve; terraform output -json > ../../artifacts/test-deployment.json

.PHONY: clean