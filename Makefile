ifneq (,$(wildcard ./.env))
    include .env
    export
endif

categorize:
	python3 ./Labelling/__main__.py
bot: categorize
	dotnet run --project Bot