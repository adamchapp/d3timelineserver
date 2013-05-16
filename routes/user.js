//TODO create MongoDB driver as this currently sends a static response
exports.login = function(req, res) {
    console.log('sending login response');

    var loginResponse = {
        Id: "425S-acL3KGJxST90-Jb43KAv-bZ4345",
        UserId: "2aLKq3J-4r0F9y8-AS0uF2-iLkn3K-5ssJ"
    }

    res.json(loginResponse);
}

exports.register = function(req, res) {
    console.log('sending registration response');

    res.send(200, "Successful registration");
}