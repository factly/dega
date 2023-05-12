ROOT_CONFIG_ENV=config.env
KAVACH_CONFIG_ENV=kavach-config.env
COMPANION_ENV=companion/.env
API_CONFIG=api/config.env
SERVER_CONFIG=server/config.env
TEMPLATE_CONFIG=templates/config.env

for file in ROOT_CONFIG_ENV KAVACH_CONFIG_ENV COMPANION_ENV API_CONFIG SERVER_CONFIG TEMPLATE_CONFIG
do
   if [ -f "${!file}" ]; then
			echo "Skipping copying ${!file}. File exists already."
	 else
			cp ${!file}.example ${!file}
			echo "Copied ${!file}.example to ${!file}."
	 fi
done
