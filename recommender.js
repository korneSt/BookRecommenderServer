const API_KEY = "00dd0d66d11a46baa9973eb5f6315151";
const URL = 'https://westus.api.cognitive.microsoft.com/recommendations/v4.0/models/';
const rp = require('request-promise');
const modelId = 'e78d6041-6d30-44c4-855c-dc4760acab79';
const fs = require('fs');

import * as db from './db'


export const createModel = (req, res) => {
    let options = {
        method: 'POST',
        url: URL,
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
        url: URL + modelId + '/recommend/user',
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
        db.addRecommendation(options, response)
    }).catch((err) => {
        console.log(err);
    });
}

export const getItemRecommendation = (req, res) => {
    let options = {
        method: 'GET',
        url: URL + modelId + '/recommend/item',
        qs: { 
            itemIds: req.query.itemIds, 
            numberOfResults: req.query.numberOfResults, 
            minimalScore: req.query.minimalScore,
        },
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

export const postUsageFile = (req, res) => {
    let options = {
        method: 'POST',
        url: URL + modelId + '/usage',
        qs: { usageDisplayName: req.query.usageDisplayName },
        headers:
        {
            'ocp-apim-subscription-key': '0b4ff4feea1b469e9e1c787feac92ba1'
        },
        formData: {
            file: {
                value: fs.createReadStream('./usage_files/usage.txt'),
                options: {
                    // filename: 'test.txt',
                    // contentType: 'image/jpg'
                }
            }
        },
    };

    rp(options).then((response) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(response)
    }).catch((err) => {
        console.log(err);
    });
}

export const postCatalogFile = (req, res) => {
    let options = {
        method: 'POST',
        url: URL + modelId + '/catalog',
         resolveWithFullResponse: true,
        qs: { catalogDisplayName: req.query.catalogDisplayName },
        headers:
        {
            'ocp-apim-subscription-key': '0b4ff4feea1b469e9e1c787feac92ba1',
            'content-Type': 'application/octet-stream'
        },
        form: {},
        formData: {
            file: {
                value: fs.createReadStream('./catalog_files/catalog.txt'),
                 options: {
                    // filename: 'test.txt',
                    contentType: 'text/plain'
                }
            }
        },
    };

    rp(options).then((response) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(response)
    }).catch((err) => {
        console.log(err);
    });
}

export const updateCatalogFile = (req, res) => {
    let options = {
        method: 'PATCH',
        url: URL + modelId + '/catalog',
        qs: { catalogDisplayName: req.query.catalogDisplayName },
        headers:
        {
            'ocp-apim-subscription-key': '0b4ff4feea1b469e9e1c787feac92ba1'
        },
        formData: {
            file: {
                value: fs.createReadStream('./catalog_files/catalog.txt'),
                 options: {
                    // filename: 'test.txt',
                    // contentType: 'image/jpg'
                }
            }
        },
    };

    rp(options).then((response) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(response)
    }).catch((err) => {
        console.log(err);
    });
}

export const triggerBuild = (req, res) => {
    let options = {
        method: 'POST',
        url: URL + modelId + '/builds',
        headers:
        {
            'ocp-apim-subscription-key': '0b4ff4feea1b469e9e1c787feac92ba1'
        },
        form: {
            description: 'Simple recomendations build',
            buildType: 'recommendation',
            buildParameters: {
                recommendation: {
                    numberOfModelIterations: 10,
                    numberOfModelDimensions: 40,
                    itemCutOffLowerBound: 1,
                    itemCutOffUpperBound: 10,
                    userCutOffLowerBound: 0,
                    userCutOffUpperBound: 0,
                    enableModelingInsights: false,
                    useFeaturesInModel: false,
                    modelingFeatureList: 'string',
                    allowColdItemPlacement: false,
                    enableFeatureCorrelation: true,
                    reasoningFeatureList: 'string',
                    enableU2I: true
                }
            }   
        }
    }

    rp(options).then((response) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(response)
    }).catch((err) => {
        console.log(err);
    });
}

export const getBooks = (req, res) => {

    let options = {
        method: 'GET',
        url: URL + modelId + '/catalog',
        // qs: { userId: req.query.userId, numberOfResults: req.query.numberOfResults },
        headers:
        {
            'ocp-apim-subscription-key': '0b4ff4feea1b469e9e1c787feac92ba1',
            'Accept': 'application/json',
        }
    };

    rp(options).then((response) => {
        res.send(response)
        let r = JSON.parse(response)
        r.value.forEach((entry) => {
            let book = {
                title: entry.name,
                author: entry.description,
                isbn: null,
                rating: null,
                cover: null
            }
            db.addBook(book)
            .spread(function (book, created) {
                console.log(book.get({
                    plain: true
                }))
                console.log(created)
                book.getCategories({plain: true}).then((cat) => {
                    console.log(cat && cat.get('name'))
                });
            })
        })
        // db.addBook()
    }).catch((err) => {
        console.log(err);
    });
}