var AWS = require('aws-sdk');
var dynamo = new AWS.DynamoDB();
var lambda = new AWS.Lambda();
var dynamo_params = {
    ExpressionAttributeNames : {    //Alias for partition key name
        "#i" : "Dname"
    },
    ExpressionAttributeValues : {
        ":name" : { "S" : "Key_value"}   //Alias for partition key value
    },
    TableName : process.env.DB,
    KeyConditionExpression : "#i = :name",
    ScanIndexForward : false,       //Descending sort order
    Limit : 1,                      //Show only first result, thus returning only latest entry in DB for specified partition key.
};

exports.handler = function (event, context) {
    dynamo.query(dynamo_params, function(err, data) {
        if (err || data.Count == 0) {   //If DB does not have any entry for specified partition key
            if (data.Count == 0) {
                var new_date_entry = new Date(event.message.date*1000).toISOString(); //Telegram gives date in epoch seconds, AWS processes in epoch milliseconds, thus multiplication by 1000
                var put_params = {  //Specify DynamoDB PutItem parameters
                    TableName: process.env.DB,
                    Item: {
                        'Dname': {S: 'Key_value'},
                        'Date': {S: new_date_entry},
                    }
                };
                dynamo.putItem(put_params, function (err, data) {   //Execute DynamoDB PutItem operation
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log('Item put to DB');
                    }
                });
                event['reply'] = 'Text for first trigger message for DynamoDB part.';
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
            else {
                console.log(err);
            }
        }
        else {
            ///////////////
            var day_quantity = '';
            var hour_quantity = '';
            var minute_quantity = '';
            var second_quantity = '';
            var hour_zero = '';
            var minute_zero = '';
            var second_zero = '';
            var tz = 10800000; //Hardcoded timezone GMT+3 in milliseconds
            ///////////////
            var time = new Date(data.LastEvaluatedKey.Date.S); //Date in ISO format from DB
            //Get current date
            var now_epoch = event.message.date*1000 + tz; //Correction of telegram epoch time for GMT+3
            //Get date from DB
            var db_epoch = time.getTime() + tz; //Conversion of ISO to epoch format. Correction for GMT+3
            var db_time = new Date(db_epoch); //Conversion from epoch to ISO
            //Calculate time diff
            var diff = now_epoch - db_epoch; //Calculate time difference between message and latest entry in DB, in milliseconds
            ////////////////////
            var d_names = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"); //Array of week days
            var curr_day = db_time.getDay(); //Get day number in a week
            var curr_date = db_time.getDate(); //Get day number in month
            var m_names = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"); //Array of months
            var curr_month = db_time.getMonth(); //Get month number
            var db_hours = db_time.getHours(); //Get hours
            hour_zero = db_hours < 10 ? '0' : ''; //If hour is <10, prepend 0
            var db_minutes = db_time.getMinutes(); //Get minutes
            minute_zero = db_minutes < 10 ? '0' : ''; //If minute is <10, prepend 0
            var db_seconds = db_time.getSeconds(); //Get seconds
            second_zero = db_seconds < 10 ? '0' : ''; //If second is <10, prepend 0
            ///////////////////
            //Display time diff
            var total_seconds = diff / 1000; //Calculate difference in seconds
            var days = Math.floor(total_seconds / (60*60*24)); //Calculate number of whole days in difference
            day_quantity = days == 1 ? 'day' : 'days';  //Detect if we need singular or plural
            var hours_leftover = total_seconds % (60*60*24); //Calculate remaining hours
            var hours = Math.floor(hours_leftover / (60*60)); //Calculate number of whole hours in difference
            hour_quantity = hours == 1 ? 'hour' : 'hours';  //Detect if we need singular or plural
            var minutes_leftover = hours_leftover % (60*60); //Calculate remaining minutes
            var minutes = Math.floor(minutes_leftover / 60); //Calculate number of whole minutes in difference
            minute_quantity = minutes == 1 ? 'minute' : 'minutes';
            var seconds = Math.floor(minutes_leftover % 60); //Calculate number of whole seconds in difference
            second_quantity = seconds == 1 ? 'second' : 'seconds';
            var phrase = 'Last occurence was ' + days + ' ' + day_quantity + ' ' + hours + ' ' + hour_quantity + ' ' + minutes + ' ' + minute_quantity + ' ' + seconds + ' ' + second_quantity + ' ago, ' + 'on ' + d_names[curr_day] + ', ' + curr_date + ' ' + m_names[curr_month] + ' at ' + hour_zero + db_hours + ':' + minute_zero + db_minutes + ':' + second_zero + db_seconds + ' EEST';
            console.log(phrase);

            event['reply'] = phrase;
            var sender_module_params = {
                FunctionName : "Send",
                InvocationType: "Event",
                Payload: JSON.stringify(event)
            };
            lambda.invoke(sender_module_params, function(err, data){
                if (err) console.log(err);
                else console.log(data);
            });

            ////////
            var new_date_entry = new Date(event.message.date*1000).toISOString(); //Convert telegram epoch time *1000 to ISO format
            var put_params = {
                TableName: process.env.DB,
                Item: {
                    'Dname': {S: 'Key_value'},
                    'Date': {S: new_date_entry},
                }
            };
            dynamo.putItem(put_params, function (err, data) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log('New date has been addded to DB: ' + new_date_entry);
                }
            });
        }
    });
};