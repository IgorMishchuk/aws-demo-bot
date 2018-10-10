## To do list 

Gatekeeper:
- [ ] Check chat authorization for Polly against DynamoDB entry, instead of in-code;
- [ ] Check user authorization for DynamoDB against DynamoDB entry, instead of in-code.

Speech:
- [ ] Validate that entered text uses same language as language requested for speech synthesis.

DynamoDB:
- [ ] Add ChatID to DynamoDB to be able to process messages from multiple chats and store data in one DB;
- [ ] Find more elegant solution to timezone selection.
	