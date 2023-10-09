APACHE_CONFIG_PATH=/etc/apache2/sites-available/clubs.lakewood.ai.conf

function CreateConfigurationFile() {
	printf "Creating configuration file symlink"
	ln -s `pwd`/lakewood.ai.conf $APACHE_CONFIG_PATH
	if [ $? -eq 0 ]; then
		echo " [DONE]"
	else
		echo " [ERROR]"
	fi
}

if [ -f $APACHE_CONFIG_PATH ]; then
	if [ `realpath $APACHE_CONFIG_PATH` != `pwd`/clubs.lakewood.ai.conf ]; then
		echo "Symlink exists, but points to wrong place"
	else
		echo "Configuration file symlink already created"
	fi
else
	CreateConfigurationFile
fi

echo "Installing packages"
corepack enable
yarn install
echo "Installed packages"

echo "Building site"
yarn gulp build_site
echo "Built site"

echo "Completed setup"
