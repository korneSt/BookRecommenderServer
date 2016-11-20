

const API_KEY = "00dd0d66d11a46baa9973eb5f6315151";
const URL = 'https://westus.api.cognitive.microsoft.com/recommendations/v4.0/models';
const rp = require('request-promise');
const modelId = 'e78d6041-6d30-44c4-855c-dc4760acab79';

export const createModel = (req, res) => {
    let options = {
        method: 'POST',
        url: 'https://westus.api.cognitive.microsoft.com/recommendations/v4.0/models',
        headers:
        {
            'cache-control': 'no-cache',
            'ocp-apim-subscription-key': '0b4ff4feea1b469e9e1c787feac92ba1',
            'content-type': '"application/json"'
        },
        form: { modelName: req.modelName, description: req.description }
    };

    rp(options).then((response) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(response)
    }).catch((err) => {
        console.log(err);
    });

};

export const getUserRecommendation = (req, res) => {
    let options = {
        method: 'GET',
        url: 'https://westus.api.cognitive.microsoft.com/recommendations/v4.0/models/' + modelId + '/recommend/user',
        qs: { userId: req.query.userId, numberOfResults: req.query.numberOfResults },
        headers:
        {
            'ocp-apim-subscription-key': '0b4ff4feea1b469e9e1c787feac92ba1',
            'content-type': '"application/json"'
        }
    };

    rp(options).then((response) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(response)
    }).catch((err) => {
        console.log(err);
    });
}
