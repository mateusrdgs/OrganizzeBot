ifneq (,$(wildcard ./.env))
    include .env
    export
endif

categorize:
	\
	source ./Labelling/env/bin/activate; \
	python3 ./Labelling/__main__.py;
bot: categorize
	dotnet run --project Bot