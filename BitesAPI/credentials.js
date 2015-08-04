module.exports = {
	cookieSecret: 'suchsecretmuchunkown',


	mongo: {
		development: {
			connectionString: 'mongodb://hamed:Launch123@104.131.40.245:27017/landme'
		},
		production: {
			connectionString: 'your_connect;'
		}
	},

	providers: {
		facebook: {
			development: {
				appId: '1596595767272078',
				appSecret: '57a67c051886e350c539c4cc3913ea3c',
				callBackURL: 'http://localhost:3000/auth/facebook/callback'
			}
		}
	}

};