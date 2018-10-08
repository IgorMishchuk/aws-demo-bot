var AWS = require('aws-sdk');
var polly = new AWS.Polly();
var s3 = new AWS.S3();

var lambda = new AWS.Lambda();

exports.handler = function (event, context) {
    var message_raw = event.message.text.toLowerCase();
    //Incoming message parsing
    var LangStart = message_raw.indexOf('*'); //Get index of first '*'
    var LangEnd = message_raw.lastIndexOf('*'); //Get index of last '*'
    var BodyStart = message_raw.slice(LangEnd+1); //Get message body
    var Lang = message_raw.slice(LangStart+1, LangEnd); //Get language
    
    //Incoming message is limited to 160 characters. Can be changed or removed.
    if (BodyStart.length > 160 ){
        event['reply'] = 'Message is too long. Maximum number of characters is 160.';
        var sender_module_params = {
            FunctionName : "Send",
            InvocationType: "Event",
            Payload: JSON.stringify(event)
        };
        lambda.invoke(sender_module_params, function(err, data){
            if (err) console.log(err);
            else console.log(data);
        });
    }
    
    //If number of characters is less than 160
    else{
        var message = decodeURI(BodyStart);
        
        //Hash Text+Chat ID for a filename
        var hash = require('crypto').createHash('md5').update(message + event.message.chat.id + Lang).digest('hex');
    
        //Build post data for Telegram API
        var post_data = 'chat_id=' + event.message.chat.id + '&reply_to_message_id=' + event.message.message_id + '&audio=https://' + process.env.BUCKET_NAME + '.s3.amazonaws.com/' + event.message.chat.id + '/' + hash + '.mp3';
        
        //Full path to file for uplaod to Telegram
        var params = {
            Bucket: process.env.BUCKET_NAME, //Bucket name specified in Lambda environment variables
            Key: event.message.chat.id +'/'+ hash + '.mp3' //"Folder" and filename
        };
        
        //Check if file already exists in S3
        s3.headObject(params, function(err, data) {
            
            // File already existed, so no need to have Polly synthesize the speech
            if (data){
                console.log("Retreiving old file");
                
                // Create the post request
                event['reply'] = post_data;
                event['isaudio'] = 1;
                var sender_module_params = {
                    FunctionName : "Send",
                    InvocationType: "Event",
                    Payload: JSON.stringify(event)
                };
                lambda.invoke(sender_module_params, function(err, data){
                    if (err) console.log(err);
                    else console.log(data);
                });
            } 
            
            // If the file did not already exist, then let's have Polly synthesize it.
            else {
                var Voice_Id = '';
                //Determine which Polly language to use
                switch (Lang) {
                    case 'gb-fe':
                    Voice_Id = 'Amy';
                    break;
                case 'gb-ma':
                    Voice_Id = 'Brian';
                    break;
                case 'us-fe':
                    Voice_Id = 'Joanna';
                    break;
                case 'us-ma':
                    Voice_Id = 'Matthew';
                    break;
                case 'ru-fe':
                    Voice_Id = 'Tatyana';
                    break;
                case 'ru-ma':
                    Voice_Id = 'Maxim';
                }
                console.log(Voice_Id);
                console.log("Making new file");
                
                //Specify Polly parameters
                var params_polly = {
                    OutputFormat: 'mp3', /* required */
                    Text: message, /* required */
                    VoiceId: Voice_Id, /* required */
                    TextType: 'text'
                };
                
                //Synthesize speech from text
                polly.synthesizeSpeech(params_polly, function(err, data) {
                    if (err){
                        console.log(err, err.stack); // an error occurred
                    }
                    else {
                        
                        //Specify upload parameters for file created by Polly
                        var params_upload = {
                            ACL: 'public-read', 
                            Bucket: process.env.BUCKET_NAME, //Bucket name specified in Lambda environment variables
                            Key: event.message.chat.id + '/' + hash + '.mp3', //"Folder" and filename
                            Body: data.AudioStream
                        };
                        
                        //Upload file to S3
                        s3.upload(params_upload, function(err, data1) {
                            if (err){
                                console.log(err, data1);
                            }
                            else{
                                console.log('File is ready');
                                
                                // Create the post request
                                event['reply'] = post_data;
                                event['isaudio'] = 1;
                                var sender_module_params = {
                                    FunctionName : "Send",
                                    InvocationType: "Event",
                                    Payload: JSON.stringify(event)
                                };
                                lambda.invoke(sender_module_params, function(err, data){
                                    if (err) console.log(err);
                                    else console.log(data);
                                });
                            }    
                        });
                    }
                });
            }
        });
    } 
};