/* module.exports = function (app) {
    var dataStream = require('../controllers/appController');

    app.route('/')
        .get(function (req, res) {
            res.render('index');
        });
    app.route('/submit-settings')
        .post(dataStream.set_app_data);

    app.route('/api/token')
        .get(dataStream.get_token_data);

    app.route('/api/products/:token')
        .get(dataStream.get_products);

    app.route('/api/tesla/:token/:product/:id/:type')
        .get(dataStream.get_api_data);

    app.route('/api/tesla/history/:token/:searchType')
        .get(dataStream.find_api_data)
        .post(dataStream.get_hist_data);

};*/

module.exports = function (app) {
    var dataStream = require('../controllers/appController');

    app.route('/')
        .get(function (req, res) {
            res.render('index');
        });

    app.route('/submit-settings')
        .post(dataStream.set_app_data);

    app.route('/api/token')
        .get(dataStream.get_token_data);

    app.route('/api/aggregates')
        .get(dataStream.get_live_status);

    app.route('/api/site_info')
        .get(dataStream.get_site_info);

    app.route('/api/solar')
        .get(dataStream.get_solar);

    app.route('/api/grid')
        .get(dataStream.get_site);

    app.route('/api/house')
        .get(dataStream.get_load);

    app.route('/api/status')
        .get(dataStream.get_status);

    app.route('/api/sitemaster')
        .get(dataStream.get_master);

    app.route('/api/battery')
        .get(dataStream.get_batt);

};
