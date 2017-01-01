var express = require('express')
var bodyParser = require('body-parser')
var Curl = require('node-libcurl').Curl
var Promise = require('promise')
var cheerio = require('cheerio')
var path = require('path')
var app = express()

// var jsonParser = require('body-parser').json()
app.use(express.static(path.join(__dirname, 'public')))
//need to do this and have css file in public folder! because middleware, kiddos

app.use(bodyParser.json())

app.get('/', function (req, res) {
	// res.send('hello world')
	res.sendFile(__dirname + '/index.html')
})

// app.post('/hello', jsonParser, function (req, res) {
// 	res.json({"greeting": "hi, " + req.body.user})
// }) //CAN ONLY SPECIFY PARSERS FOR POST

// app.get('/hello', function (req, res) {
// 	res.json({greeting: "hi, " + req.query.user})
// }) //DONT DIRECTLY VISIT THIS, will just see the json

app.get('/search', function (req, res) {
	function prom () {
		return new Promise ((resolve, reject) => {
			var curl = new Curl()
			curl.setOpt(Curl.option.HTTPHEADER, ['Origin: http://www.puzzledragonx.com'])
			curl.setOpt('URL', 'http://www.puzzledragonx.com/en/script/autocomplete/dictionary.txt')

			curl.on('end', function (statusCode, body, headers) {
				var modBody = body.toUpperCase().replace(/\s/g,"")
				if (modBody.indexOf(req.query.term) > -1) {
					var searchResults = []
					modBody = modBody.slice(0,modBody.indexOf('[100080')) //without dungeons
					while (modBody.length>0 && modBody.indexOf(req.query.term)>-1) {
						modBody = modBody.slice(0,modBody.lastIndexOf(req.query.term))
						var copy = modBody;
						var id = copy.substring(modBody.lastIndexOf('[')+1,modBody.length)
						id = id.substring(0,id.indexOf(','))
						searchResults.push(parseInt(id))
					}
					var len = searchResults.length
					var proms = [];
					for (var i = 0; i<len; i++) {
						function retProm () {
							return new Promise ((resolve, reject) => {
								var curl = new Curl()
								curl.setOpt(Curl.option.HTTPHEADER, ['Origin: http://www.puzzledragonx.com'])
								curl.setOpt('URL', 'http://www.puzzledragonx.com/en/monster.asp?n='
									+searchResults[i])

								curl.on('end', function(statusCode, body, headers) {
									$ = cheerio.load(body)
									var name = $('.name').children().first().text(),
										skills = ""
									$('#tablestat').children().children('.icon').children()
									.each(function(i, elem) {
										var mon = $(this).children('img').attr('alt')
										if (mon) {
											var id = mon.slice(3,mon.indexOf(" "))
											skills += "<br><a href ='http://www.puzzledragonx.com/en/monster.asp?n="+id+"' target=_blank>"+mon+"</a>"
										}
										else {
											skills+=""
										}
									})

									resolve({"monsterName": name, "sameSkill": skills})
									this.close()
								})

								curl.perform()
							})
						}
						proms.push(retProm())
					}
					Promise.all(proms)
					.then(results => {
						var that = "";
						for (var i =0; i<results.length; i++) {
							var bool = (results[i].sameSkill)?(results[i].sameSkill):("None")
							that += "<p><a href ='http://www.puzzledragonx.com/en/monster.asp?n="
							+searchResults[i]
							+"' target=_blank class='list-group-item'><img src='http://www.puzzledragonx.com/en/img/book/"
							+searchResults[i]+".png'>"+results[i].monsterName+"</a></p>"
							+"<b>Monsters with the Same Skill:</b> "+ bool
						}
						res.send(that)
					})
				}
				else {
					res.send("Oops! Maybe you misspelled that. Try again?")
				}
				this.close()
			})
			curl.perform()
		})
	}
	prom()
	.then(result => {
		res.send(result)
	})
})

function getName(id) {
	var name = "";
	function retProm () {
		return new Promise ((resolve, reject) => {
			var curl = new Curl()
			curl.setOpt(Curl.option.HTTPHEADER, ['Origin: http://www.puzzledragonx.com'])
			curl.setOpt('URL', 'http://www.puzzledragonx.com/en/monster.asp?n='+id)

			curl.on('end', function(statusCode, body, headers) {
				name = body.slice(body.indexOf('<title>')+7,body.indexOf(' stats'))
				resolve(name)
				this.close()
			})

			curl.perform()
		})
	}

	retProm()
	.then(result => {
		return result
	})
}

app.listen(3000, function() {
	console.log('Example app listening on port 3000!')
})