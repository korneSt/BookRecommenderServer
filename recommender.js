const API_KEY = "00dd0d66d11a46baa9973eb5f6315151";
const URL = 'https://westus.api.cognitive.microsoft.com/recommendations/v4.0/models/';
const rp = require('request-promise');
const modelId = 'e78d6041-6d30-44c4-855c-dc4760acab79';
const fs = require('fs');
var Sequelize = require('sequelize');

const Op = Sequelize.Op

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
        let respTab = [];
        let resp = JSON.parse(response);

        (async function loop() {
            for(var i in resp.recommendedItems ){
                console.log(resp.recommendedItems[i].items[0].id);
                await new Promise(resolve => db.getBookById(resp.recommendedItems[i].items[0].id)
                .then( function(result) {
                    console.log('result 1', result);
                    if (result !== undefined)
                        respTab.push(result);   
                    resolve();
                })
            );     
            }                       
            res.send(respTab)            
        })();

    }).catch((err) => {
        console.log(err);
    });
}

/*
* Posts file with usage data from database
* Format: <User Id>,<Item Id>,<Time>,[<Event type>]
* Event must be RecommendationClick
*/

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

/*
* Creates catalog file with returned books from database
* File format: <Item Id>,<Item Name>,<Item Category>,<Features list>
* Feature list: genre, age range, length, style, mood
*/
export const createCatalogFile = (req, res) => {
    let lines = '';
    db.getBooksByDate().then( (resp) => {
        console.log('return', resp.length);
        for (let i=0; i < resp.length; i++) {
            console.log('a', resp[i].genre);
            let line = '';
            let genre = resp[i].genre !== null ? 'genre=' + resp[i].genre : '';
            let age = resp[i].age !== null ? ',age=' + resp[i].age : '';
            let length = resp[i].bookLen !== null ? ',length=' + resp[i].bookLen : '';
            let style = resp[i].style !== null ? ',style=' + resp[i].style : '';
            let mood = resp[i].mood !== null ? resp[i].mood : '';
            line = resp[i].id + ',' + resp[i].title + ',book,,' + genre + age + length + style + mood + '\n';
            lines += line; 
        }
        fs.writeFile('./catalog_files/catalog.txt', lines, (err) => {
        if (err) throw err;
        console.log('zapisano plik');
        res.sendStatus(200);
    });
    }).catch( (err) => {
        res.send(err);
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