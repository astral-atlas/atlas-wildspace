javascriptSources = src/**/*.js

artifacts:
	mkdir -p artifacts

public/bundle.js: $(javascriptSources)
	rollup -c 

artifacts/web.zip: artifacts public/index.html public/bundle.js public/main.css
	cd public; zip -r ../artifacts/web.zip .