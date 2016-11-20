

const API_KEY = "00dd0d66d11a46baa9973eb5f6315151";
const URL = 'https://westus.api.cognitive.microsoft.com/recommendations/v4.0/models';
const rp = require('request-promise');
const modelId = 'e78d6041-6d30-44c4-855c-dc4760acab79';

const makeRequest = ({operation, parameters, body, API_KEY}) => {
    let headers = {
        'Ocp-Apim-Subscription-Key': API_KEY
    };
    let path = operation.uriTemplate;
    operation.parameters.forEach((param) => {
        if (parameters[param.name] && param.type == 1) {
            path = path.split(`{${param.name}}`).join(parameters[param.name]);
            parameters[param.name] = undefined;
        }
    });

    let uri = `${operation.scheme}://${operation.host}/${path}`;
    const options = {
        uri,
        method: operation.method,
        headers,
        qs: parameters,
        json: true,
        body
    };
    return rp(options);
};

const verifyParameters = (operation, actual) => {

    return new Promise((resolve, reject) => {

        const expected = operation.parameters;
        const requiredPropsNotPresent = expected
            .filter(param => param.required)
            .filter(param => !actual[param.name]);

        if (requiredPropsNotPresent.length !== 0) {
            if (requiredPropsNotPresent.length > 1) {
                reject(new Error(`Required parameters ${JSON.stringify(requiredPropsNotPresent)} were not present in "${operation.serviceName}" "${operation.name}" request.`));
            } else {
                reject(new Error(`Required parameter "${requiredPropsNotPresent[0]}" was not present in "${operation.serviceName}" "${operation.name}" request`));
            }
        } else {
            resolve();
        }
    });
};

export const createModel = (req, res) => {

    // const operation = {
    //     "name": "Create a model",
    //     "path": "recommendations/v4.0/models",
    //     "host": "westus.api.cognitive.microsoft.com",
    //     "method": "POST",
    //     "scheme": "https",
    //     "serviceId": "Recommendations.V4.0",
    //     "operationId": "56f30d77eda5650db055a3d6",
    //     "id": "56f30d77eda5650db055a3d6",
    //     "headers": {
    //         "Content-Type": "application/json",
    //         "Host": "westus.api.cognitive.microsoft.com"
    //     },
    //     "parameters": []
    // };

    // return verifyParameters(operation, parameters)
    //     .then(makeRequest({
    //         operation,
    //         parameters,
    //         body,
    //         API_KEY
    //     }));
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

// createModel({ modeName: "model14", description:"desc" }).then((response) => {
//     console.log('Got response', response);
// }).catch((err) => {
//     console.error('Encountered error making request:', err);
// });