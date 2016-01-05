module.exports = {
	cookieSecret: 'suchsecretmuchunkown',

	location: {
		development: "http://localhost:3000/",
		production: "http://bitesapp.herokuapp.com/"
	}

	,


	mongo: {
		development: {
			connectionString: 'mongodb://BitesServer:Launch123@ds029803.mongolab.com:29803/heroku_98rtcrbj'
		},
		production: {
			connectionString: 'mongodb://BitesServer:Launch123@ds029803.mongolab.com:29803/heroku_98rtcrbj'
		}
	},

	providers: {
		facebook: {
			development: {
				appId: '1596595767272078',
				appSecret: '57a67c051886e350c539c4cc3913ea3c',
				callBackURL: 'http://localhost:3000/auth/facebook/callback',
				successURL: '/success',
				failURL: '/fail'
			},
			production: {
				appId: '1596595767272078',
				appSecret: '57a67c051886e350c539c4cc3913ea3c',
				callBackURL: 'http://bitesapp.herokuapp.com/auth/facebook/callback',
				successURL: '/success',
				failURL: '/fail'
			}

		}
	}

};