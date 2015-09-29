var config ={
	"auth": {
		"useAuthentication": false,
		"GOOGLE_CLIENT_ID": "--- XYZ ---",
		"GOOGLE_CLIENT_SECRET": "--- XYZ ---",
		"GOOGLE_CALLBACK_URL": "http:// --- XYZ ---/auth/google/callback",
		"session_secret": "ForLittleKnowsMyRoyalDameThatRumpelstiltskinIsMyName!",
		"session_name": "mappingAuth"
	},
	"mongoose": {
		"uri": "mongodb://localhost/",
		"options": {
			"server": {
				"socketOptions": {
					"keepAlive": 1
				}
			}
		}
	},
	"mappingPath": "mappingTable",
	"express": {
		"port": 8080,
		"filePath": "/../www"
	},
	"db": {
		"file": "./MongoDB.js"
	},
	"logConfig": {
		"appenders": [
			{
				"type": "file",
				"filename": "./log/backend.log",
				"maxLogSize": 10240,
				"backups": 3
			},
			{
				"type": "console"
			}
		],
		"replaceConsole": true
	}
}
module.exports = config;