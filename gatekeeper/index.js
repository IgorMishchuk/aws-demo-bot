console.log('Loading event');
var AWS = require('aws-sdk');
var lambda = new AWS.Lambda();

exports.handler = function(event, context) {
    // Log the basics, just in case
    console.log("Request received:\n", JSON.stringify(event));
    console.log("Context received:\n", JSON.stringify(context));
    
    //Determine if incoming message is for speech conversion
    if (event.message.text.toLowerCase().startsWith('/voice')){ //If message starts with trigger phrase '/voice'
        if (event.message.chat.id == process.env.CHAT1 /*|| event.message.chat.id == process.env.TEST_CHAT*/) { //List allowed chats for Polly processing
            console.log('Polly entered');
            var polly_module_params = {
                FunctionName: "Speech",
                InvocationType: "Event",
                Payload: JSON.stringify(event)
            };
            lambda.invoke (polly_module_params, function(err, data) {
                if (err) console.log(err);
                else console.log(data);
            });
        }
        else { //Message came from unauthorized chat
            event['reply'] = 'This chat is not authorized for Polly usage. \
                                \nContact @M_Z_LAIR for authorization.';
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
    }
    
    else if (event.message.text.toLowerCase() == 'db trigger phrase'){ //If message is a defined trigger phrase
        if (event.message.from.id == process.env.USER1 /*|| event.message.from.id == process.env.USER2*/){  //If message came from specific user
            console.log('DynamoDB entered');
            ///
            var dynamodb_module_params = {
                FunctionName: "DynamoDB",
                InvocationType: "Event",
                Payload: JSON.stringify(event)
            };
            lambda.invoke(dynamodb_module_params, function(err, data){
                if (err) console.log(err);
                else console.log(data);
            });
        }
        else {  //If message came from non-authorized user
            event['reply'] = 'You do not have permissions to interact with this function. Contact @M_Z_LAIR for details.';
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
    }
    
    //Process text which was not for speech conversion or DynamoDB interaction
    else {
        console.log('Texting entered');
        var texting_module_params = {
            FunctionName: "Text",
            InvocationType: "Event",
            Payload: JSON.stringify(event)
        };
        lambda.invoke(texting_module_params, function(err, data){
            if (err) console.log(err);
            else console.log(data);
        });
    }
};
