var AWS = require('aws-sdk');
var lambda = new AWS.Lambda();

//Define triggers and possible replies
var trigger1 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
var trigger2 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
var trigger3 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
var trigger4 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
var trigger5 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
var trigger6 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
var trigger7 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
var trigger8 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
var trigger9 = ["Text1", "Text2", "Text3", "Text4", "Text5"];
var reply = '';

exports.handler = function (event, context) {
    var message = event.message.text.toLowerCase();
    switch (message) {
        case '/help':
        case 'help':
        case '/start':
            reply = 'Hi.\
			\n\
			\nThis is a serverless telegram bot, written during self education on AWS associate level courses.\
			\nSource code can be viewed [here](https://github.com/IgorMishchuk/aws-demo-bot).\
			\n\
			\nBot features:\
            \n 1: Speech synthesis from text.\
            \nCommand syntax: "/voice *language* Text".\
            \nAccepted values for language:\
            \ngb-fe - English, female voice, British accent.\
            \ngb-ma - English, male voice, British accent.\
            \nus-fe - English, female voice, USA accent.\
            \nus-ma - English, male voice, USA accent.\
            \nru-fe - Russian, female voice.\
            \nru-ma - Russian, male voice.\
            \nExample:\
            \n/voice *gb-fe* This is a test\
            \n\
            \nNuances:\
            \nMaximum number of characters in text - 160.\
            \nText should not contain "*".\
            \nNo verification if language of entered text is the same as selected for Polly\
            \n\
            \n 2: Calculate time difference between message time and latest entry in DB.\
            \nCommand syntax: "DB trigger phrase"\
            \n\
            \n 3: Predefined, randomly chosen replies for trigger messages.\
            \nCommand syntax: "trigger[1-9]" or "/trigger[1-9]"';
            break;
        case '/trigger1':
        case 'trigger1':
        	reply = 'trigger1 ' + trigger1[Math.floor(Math.random() * trigger1.length)]; //Randomly select which reply will be given from available variants
        	break;
        case '/trigger2':
        case 'trigger2':
        	reply = 'trigger2 ' + trigger2[Math.floor(Math.random() * trigger2.length)];
        	break;
        case '/trigger3':
        case 'trigger3':
        	reply = 'trigger3 ' + trigger3[Math.floor(Math.random() * trigger3.length)];
        	break;
        case '/trigger4':
        case 'trigger4':
        	reply = 'trigger4 ' + trigger4[Math.floor(Math.random() * trigger4.length)];
        	break;
        case '/trigger5':
        case 'trigger5':
        	reply = 'trigger5 ' + trigger5[Math.floor(Math.random() * trigger5.length)];
        	break;
        case '/trigger6':
        case 'trigger6':
        	reply = 'trigger6 ' + trigger6[Math.floor(Math.random() * trigger6.length)];
        	break;
        case '/trigger7':
        case 'trigger7':
        	reply = 'trigger7 ' + trigger7[Math.floor(Math.random() * trigger7.length)];
        	break;
        case '/trigger8':
        case 'trigger8':
        	reply = 'trigger8 ' + trigger8[Math.floor(Math.random() * trigger8.length)];
        	break;
        case '/trigger9':
        case 'trigger9':
        	reply = 'trigger9 ' + trigger9[Math.floor(Math.random() * trigger9.length)];
        	break;
        default:
        	reply = '';
    }
    
    if (reply == ''){
        console.log('Nothing to reply with. Terminating script');
        process.exit();
    }
    else{
        event['reply'] = reply;
        var sender_module_params = {
            FunctionName : "Send",
            InvocationType: "Event",
            Payload: JSON.stringify(event)
        };
        console.log(event);
        lambda.invoke(sender_module_params, function(err, data){
            if (err) console.log(err);
            else console.log(data);
        });
    }

};