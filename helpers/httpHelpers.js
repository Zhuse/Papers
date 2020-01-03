const rp = require('request-promise');

module.exports.get = function (path) {
    const options = {
        uri: process.env.JUDGE_URL + path,
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true // Automatically parses the JSON string in the response
    };
    return rp(options);
}
module.exports.post = function (path, payload) {
    const options = {
        method: 'POST',
        url: process.env.JUDGE_URL + path + "?base64_encoded=true&wait=true",
        body: payload,
        json: true, // Automatically parses the JSON string in the response
    };
    return rp(options);
}