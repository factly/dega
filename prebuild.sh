ROOT_CONFIG_ENV=config.env
KAVACH_CONFIG_ENV=kavach-config.env
COMPANION_ENV=companion/.env
API_CONFIG=api/config.env
SERVER_CONFIG=server/config.env
TEMPLATE_CONFIG=templates/config.env


# Copy config/config.env.example to config.env if it does not exist
if [ -f "$ROOT_CONFIG_ENV" ]; then
    echo "Skipping copying config/config.env. File exists already."
else
    cp config.env.example config.env
    echo "Copied config.env.example to config.env."
fi

# Copy config/kavach-config.env.example to kavach-config.env if it does not exist
if [ -f "$KAVACH_CONFIG_ENV" ]; then
		echo "Skipping copying config/kavach-config.env. File exists already."
else
		cp kavach-config.env.example kavach-config.env
		echo "Copied config/kavach-config.env.example to kavach-config.env."
fi

# Copy companion/.env.example to companion/.env if it does not exist
if [ -f "$COMPANION_ENV" ]; then
		echo "Skipping copying companion/.env. File exists already."
else
		cp companion/.env.example companion/.env
		echo "Copied companion/.env.example to companion/.env."
fi

# Copy api/config.env.example to api/config.env if it does not exist
if [ -f "$API_CONFIG" ]; then
		echo "Skipping copying api/config.env. File exists already."
else
		cp api/config.env.example api/config.env
		echo "Copied api/config.env.example to api/config.env."
fi

# Copy server/config.env.example to server/config.env if it does not exist
if [ -f "$SERVER_CONFIG" ]; then
		echo "Skipping copying server/config.env. File exists already."
else
		cp server/config.env.example server/config.env
		echo "Copied server/config.env.example to server/config.env."
fi

# Copy template/config.env.example to template/config.env if it does not exist
if [ -f "$TEMPLATE_CONFIG" ]; then
		echo "Skipping copying templates/config.env. File exists already."
else
		cp templates/config.env.example templates/config.env
		echo "Copied templates/config.env.example to templates/config.env."
fi


