/**
 * [TODO] Step 0: Import the dependencies, fs and papaparse
 */
const fs = require('fs');
const Papa = require('papaparse');

/**
 * [TODO] Step 1: Parse the Data
 *      Parse the data contained in a given file into a JavaScript objectusing the modules fs and papaparse.
 *      According to Kaggle, there should be 2514 reviews.
 * @param {string} filename - path to the csv file to be parsed
 * @returns {Object} - The parsed csv file of app reviews from papaparse.
 */
function parseData(filename) {
    const data = fs.readFileSync(filename, 'utf8');
    const csv = Papa.parse(data, { header: true });
    return csv;
}

/**
 * [TODO] Step 2: Clean the Data
 *      Filter out every data record with null column values, ignore null gender values.
 *
 *      Merge all the user statistics, including user_id, user_age, user_country, and user_gender,
 *          into an object that holds them called "user", while removing the original properties.
 *
 *      Convert review_id, user_id, num_helpful_votes, and user_age to Integer
 *
 *      Convert rating to Float
 *
 *      Convert review_date to Date
 * @param {Object} csv - a parsed csv file of app reviews
 * @returns {Object} - a cleaned csv file with proper data types and removed null values
 */
function cleanData(csv) {
    const data = csv.data.filter(
        (row) =>
            !Object.entries(row).some(
                ([k, v]) => k !== 'user_gender' && v === '',
            ),
    );

    data.forEach((row) => {
        row['review_id'] = parseInt(row['review_id']);
        row['user_id'] = parseInt(row['user_id']);
        row['num_helpful_votes'] = parseInt(row['num_helpful_votes']);
        row['user_age'] = parseInt(row['user_age']);
        row['rating'] = parseFloat(row['rating']);
        row['review_data'] = Date.parse(row['review_data']);
        row['verified_purchase'] = row['verified_purchase'] === 'true';
        row['user'] = {
            user_id: row['user_id'],
            user_age: row['user_age'],
            user_country: row['user_country'],
            user_gender: row['user_gender'],
        };
    });
    // console.log(data);
    return data;
}

/**
 * [TODO] Step 3: Sentiment Analysis
 *      Write a function, labelSentiment, that takes in a rating as an argument
 *      and outputs 'positive' if rating is greater than 4, 'negative' is rating is below 2,
 *      and 'neutral' if it is between 2 and 4.
 * @param {Object} review - Review object
 * @param {number} review.rating - the numerical rating to evaluate
 * @returns {string} - 'positive' if rating is greater than 4, negative is rating is below 2,
 *                      and neutral if it is between 2 and 4.
 */
function labelSentiment({ rating }) {
    const res = rating > 4 ? 'positive' : rating >= 2 ? 'neutral' : 'negative';
    return res;
}

/**
 * [TODO] Step 3: Sentiment Analysis by App
 *      Using the previous labelSentiment, label the sentiments of the cleaned data
 *      in a new property called "sentiment".
 *      Add objects containing the sentiments for each app into an array.
 * @param {Object} cleaned - the cleaned csv data
 * @returns {{app_name: string, positive: number, neutral: number, negative: number}[]} - An array of objects, each summarizing sentiment counts for an app
 */
function sentimentAnalysisApp(cleaned) {
    const res = {};

    for (const obj of cleaned) {
        if (!(obj.app_name in res)) {
            res[obj.app_name] = {
                app_name: obj.app_name,
                positive: 0,
                neutral: 0,
                negative: 0,
            };
        }
        res[obj.app_name][labelSentiment({ rating: obj.rating })] += 1;
    }
    // console.log(res);
    return Object.values(res);
}

/**
 * [TODO] Step 3: Sentiment Analysis by Language
 *      Using the previous labelSentiment, label the sentiments of the cleaned data
 *      in a new property called "sentiment".
 *      Add objects containing the sentiments for each language into an array.
 * @param {Object} cleaned - the cleaned csv data
 * @returns {{lang_name: string, positive: number, neutral: number, negative: number}[]} - An array of objects, each summarizing sentiment counts for a language
 */
function sentimentAnalysisLang(cleaned) {
    const res = {};

    for (const obj of cleaned) {
        if (!(obj.review_language in res)) {
            res[obj.review_language] = {
                lang_name: obj.review_language,
                positive: 0,
                neutral: 0,
                negative: 0,
            };
        }
        res[obj.review_language][labelSentiment({ rating: obj.rating })] += 1;
    }
    // console.log(res);
    return Object.values(res);
}

/**
 * [TODO] Step 4: Statistical Analysis
 *      Answer the following questions:
 *
 *      What is the most reviewed app in this dataset, and how many reviews does it have?
 *
 *      For the most reviewed app, what is the most commonly used device?
 *
 *      For the most reviewed app, what the average star rating (out of 5.0)?
 *
 *      Add the answers to a returned object, with the format specified below.
 * @param {Object} cleaned - the cleaned csv data
 * @returns {{mostReviewedApp: string, mostReviews: number, mostUsedDevice: String, mostDevices: number, avgRating: float}} -
 *          the object containing the answers to the desired summary statistics, in this specific format.
 */
function summaryStatistics(cleaned) {
    const app_sentiments = sentimentAnalysisApp(cleaned);
    app_sentiments.forEach((row) => {
        row['sum'] = row['positive'] + row['neutral'] + row['negative'];
    });
    const most_reviewed_app = app_sentiments.reduce((max, curr) => {
        return max['sum'] < curr['sum'] ? curr : max;
    }, app_sentiments[0]);
    // console.log(most_reviewed_app);

    // let cnt = 0;
    let sum = 0;
    const hashmap = {};
    for (const row of cleaned) {
        if (row.app_name === most_reviewed_app.app_name) {
            // cnt += 1;
            sum += row.rating;
            if (!(row.device_type in hashmap)) {
                hashmap[row.device_type] = 0;
            }
            hashmap[row.device_type] += 1;
        }
    }

    // console.log(hashmap);

    const device = Object.keys(hashmap).reduce((max, curr) => {
        return hashmap[max] < hashmap[curr] ? curr : max;
    });

    return {
        mostReviewedApp: most_reviewed_app.app_name,
        mostReviews: most_reviewed_app.sum,
        mostUsedDevice: device,
        mostDevices: hashmap[device],
        avgRating: sum / most_reviewed_app.sum,
    };
}

/**
 * Do NOT modify this section!
 */
module.exports = {
    parseData,
    cleanData,
    sentimentAnalysisApp,
    sentimentAnalysisLang,
    summaryStatistics,
    labelSentiment,
};
