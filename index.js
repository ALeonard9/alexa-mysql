var mysql = require('mysql');
var config = require('./config');

var connection = mysql.createConnection({
  host     : config.mysql_connection,
  user     : 'aleonard9',
  password : config.mysql_password,
  database : 'bet'
});

exports.handler = (event, context) => {
    if (event.session.new){
        console.log("New Session")
    }

    switch (event.request.type) {
        case "LaunchRequest":
            console.log("Launch Req")
            context.succeed(
                generateResponse(
                    {},
                    buildSpeechletResponse("Yes Adam, I await your instructions", true)
                )
            )
            break;

        case "IntentRequest":
            console.log("Intent Req")

            switch(event.request.intent.name) {
                case "GetAmountOwed":

                  connection.connect();
                  var sql = "SELECT betWinner, SUM(betAmount) as betAmount FROM bet.history group by betWinner";
                  console.log(sql)
                  connection.query(sql, function(err, rows, fields) {
                    if (err) throw err;
                    AdamAmt = rows[0]['betAmount'];
                    SoumAmt = rows[1]['betAmount'];

                    console.log('Adams amount: ', AdamAmt);
                    console.log('Soums amount: ', SoumAmt);
                    intro = "Adam owes Soumya "
                    diff = SoumAmt - AdamAmt;
                    if (diff < 0) {
                      intro = "Soumya owes Adam "
                    }
                    response = intro + diff + " dollars"
                    console.log('Response:', response)


                    context.succeed(
                        generateResponse(
                            {},
                            buildSpeechletResponse(response, true)
                        )
                    )

                  });

                  connection.end();


                break;

                case "AddSoum":
                  connection.connect();
                  var sql = "INSERT INTO bet.history (betDescription, betAmount, betWinner, betStatus) VALUES ('Quick Win A', '10', 'Adam', 'Complete')";
                  console.log(sql)
                  connection.query(sql, function(err, rows, fields) {
                    if (err) throw err;
                    response = "Stop picking. Minus 10 dollars"
                    console.log('Response:', response)
                    context.succeed(
                        generateResponse(
                            {},
                            buildSpeechletResponse(response, true)
                        )
                    )
                  });

                  connection.end();
                break;

                case "AddAdam":
                  connection.connect();
                  var sql = "INSERT INTO bet.history (betDescription, betAmount, betWinner, betStatus) VALUES ('Quick Win S', '10', 'Soumya', 'Complete')";
                  console.log(sql)
                  connection.query(sql, function(err, rows, fields) {
                    if (err) throw err;
                    response = "Beans beans the magical fruit, the more you eat the more you toot. Minus 10 dollars"
                    console.log('Response:', response)
                    context.succeed(
                        generateResponse(
                            {},
                            buildSpeechletResponse(response, true)
                        )
                    )
                  });

                  connection.end();
                break;

              default:
                throw "Invalid intent"
            }

        break;


        case "SessionEndedRequest":
            console.log("End Req")
            break;

        default:
            context.fail(`Invalid request type: $(event.request.type)`)
    }
};

// Helpers

buildSpeechletResponse = (outputText, shouldEndSession) => {
    return {
        outputSpeech: {
            type: "PlainText",
            text: outputText
        },
        shoudEndSession: shouldEndSession
    }
}

generateResponse = (sessionAttributes, speechletResponse) => {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    }
}
