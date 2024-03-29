var config = require('./config');

module.exports = function () {

    const https = require('https');

    /**
     * Builds a query string for making youtube API call
     *
     * @param {any} url
     * @param {any} params
     * @returns queryString
     */
    function buildQueryString(url, params) {
        let queryString = url + '?';

        for (let key in params) {
            if (params.hasOwnProperty(key)) {
                queryString += key + '=' + params[key] + '&';
                queryString += (key === 'key') ? '' : '&';
            }
        }

        return queryString;
    }

    /**
     * Makes a get request to url
     *
     * @param {any} apiUrl
     * @returns a promise
     */
    function getRequest(apiUrl) {
        let parsed;
        return new Promise((resolve, reject) => {
            https.get(apiUrl, function (res) {
                let body = ''; // Will contain the final response
                // Received data is a buffer.
                // Adding it to our body
                res.on('data', function (data) {
                    body += data;

                });
                // After the response is completed, parse it and log it to the console
                res.on('end', function () {
                    parsed = JSON.parse(body);
                    resolve(parsed);
                });
            })
                // If any error has occured, log error to console
                .on('error', function (e) {
                    reject(e.message);
                    console.log('Got error: ' + e.message);
                });
        });

    }


    /**
     * Finds number of videos & videos
     * information in the playlist
     *
     * @param {any} id
     * @param {any} [pageToken=null]
     * @returns onject containing playlist information
     */
    async function parsePlaylist(id, pageToken = null) {
        let result; //contains list of all vidos in playlist

        let apiUrl = 'https://www.googleapis.com/youtube/v3/playlistItems';
        let params = {
            'playlistId': id,
            'maxResults': 50,
            'pageToken': (!pageToken) ? '' : pageToken,
            'part': 'snippet,contentDetails',
            'key': config.YoutubeAPIKey
        };

        let queryString = buildQueryString(apiUrl, params);
        console.log(queryString);

        let numOfReq = 1;

        let x = await new Promise((resolve, reject) => {
            getRequest(queryString).then((res) => {
                if (numOfReq > 1) {

                    for (let myKey in res.items) {
                        if (res.items.hasOwnProperty(myKey)) {
                            result.items.push(res.items[myKey]);
                        }
                    }
                    numOfReq = numOfReq + 1;

                } else {
                    result = res;
                    resolve(result);
                }
                //till all videos are retrived
                if (res.hasOwnProperty('nextPageToken')) {
                    parsePlaylist(id, res.nextPageToken);
                }
            }).catch((err) => {
                console.log(err);
                reject(err);
            });
        });
        return x;
    }

    /**
     * Finds number of videos & videos
     * information in the playlist
     *
     * @param {any} id
     * @param {any} [pageToken=null]
     * @returns onject containing playlist information
     */
    async function parseVideo(id, pageToken = null) {
        let result; //contains list of all vidos in playlist

        let apiUrl = 'https://www.googleapis.com/youtube/v3/videos';
        let params = {
            'id': id,
            'pageToken': (!pageToken) ? '' : pageToken,
            'part': 'snippet,contentDetails',
            'key': config.YoutubeAPIKey
        };

        let queryString = buildQueryString(apiUrl, params);
        console.log(queryString);

        let numOfReq = 1;

        let x = await new Promise((resolve, reject) => {
            getRequest(queryString).then((res) => {
                if (numOfReq > 1) {

                    for (let myKey in res.items) {
                        if (res.items.hasOwnProperty(myKey)) {
                            result.items.push(res.items[myKey]);
                        }
                    }
                    numOfReq = numOfReq + 1;

                } else {
                    result = res;
                    resolve(result);
                }
                //till all videos are retrived
                if (res.hasOwnProperty('nextPageToken')) {
                    parsePlaylist(id, res.nextPageToken);
                }
            }).catch((err) => {
                console.log(err);
                reject(err);
            });
        });
        return x;
    }

    /**
     * Finds number of videos & videos
     * information in the playlist
     *
     * @param {any} id
     * @param {any} [pageToken=null]
     * @returns onject containing playlist information
     */
    async function searchVideo(id, pageToken = null) {
        let result; //contains list of all vidos in playlist

        let apiUrl = 'https://www.googleapis.com/youtube/v3/search';
        let params = {
            'maxResults': '5',
            //'pageToken': (pageToken == null) ? '' : pageToken,
            'q': id,
            'part': 'snippet',
            'type': 'video',
            'key': config.YoutubeAPIKey
        };

        let queryString = buildQueryString(apiUrl, params);
        console.log(queryString);

        let numOfReq = 1;

        let x = await new Promise((resolve, reject) => {
            getRequest(queryString).then((res) => {
                if (numOfReq > 1) {

                    for (let myKey in res.items) {
                        if (res.items.hasOwnProperty(myKey)) {
                            result.items.push(res.items[myKey]);
                        }
                    }
                    numOfReq = numOfReq + 1;

                } else {
                    result = res;
                    resolve(result);
                }
                //till all videos are retrieved
                if (res.hasOwnProperty('nextPageToken')) {
                    parsePlaylist(id, res.nextPageToken);
                }
            }).catch((err) => {
                console.log(err);
                reject(err);
            });
        });
        return x;
    }

    return {
        parsePlaylist: parsePlaylist,
        parseVideo: parseVideo,
        searchVideo: searchVideo
    }
};