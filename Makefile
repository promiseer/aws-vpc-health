.PHONY: test image fmt validate

test:
	npm --prefix app test

image:
	docker build -t vpc-health:local app

fmt:
	terraform -chdir=infra fmt -recursive

validate:
	terraform -chdir=infra init -backend=false -input=false
	terraform -chdir=infra validate
