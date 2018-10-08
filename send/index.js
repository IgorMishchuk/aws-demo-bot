var AWS = require('aws-sdk');
var https = require('https');
var querystring = require('querystring');

exports.handler = function (event, context) {
    if (event.isaudio == 1) {
        var post_data = event.reply;
        
        //Post options for audio sending
        var post_options = {
            hostname: 'api.telegram.org',
            port: 443,
            path: '/bot'+process.env.BOT_API_KEY+'/sendAudio', //Bot API key specified in Lambda environment variables
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
        
    }
    else {
        var post_data = querystring.stringify({
            'chat_id': event.message.chat.id,
        	'text': event.reply
        });
    
        // Build the post options
        var post_options = {
            hostname: 'api.telegram.org',
            port: 443,
            path: '/bot'+process.env.BOT_API_KEY+'/sendMessage', //Bot API key specified in Lambda environment variables
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': post_data.length
             }
        };
    }
        // Create the post request
        var body = '';
        var post_req = https.request(post_options, function(res) {
            res.setEncoding('utf8');
    
            // Save the returning data
            res.on('data', function (chunk) {
                console.log('Response: ' + chunk);
                body += chunk;
            });
    
            // Are we done yet?
            res.on('end', function() {
                console.log('Successfully processed HTTPS response');
                // If we know it's JSON, parse it
                if (res.headers['content-type'] === 'application/json') {
                    body = JSON.parse(body);
                }
                // This tells Lambda that this script is done
                context.succeed(body);
            });
        });
    
        // Post the data
        console.log("write the post");
        post_req.write(post_data);
        post_req.end();
    
};