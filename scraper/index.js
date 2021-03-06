var osmosis = require('osmosis');

var stocks = [
  "Lyxor_UCITS_ETF_BEL_20_TR.60168051",
  "Aedifica.60191978",
  "Lyxor_Nasdaq_100_UCITS_ETF.360178232",
  "Unilever.11962",
  "Zalando_SE.480015241",
  "Coca_Cola.330016321",
  "Facebook.350002220",
  "Tesla_Motors_Inc.350000520",
  "Johnson_Johnson.330016302",
  "Ahold_Delhaize_Koninklijke.11755"
];

function scrape() {
  return Promise.all(stocks.map(retrieve));
}

function retrieve(url) {
  var id = url.split(".")[1];
  return new Promise(function(resolve,reject){
    var stockData = {};
    
    osmosis
      .get(constructUrl(url))
      .find("div.l-main-container-article__article.js-stocks-detail.js-responsive-ads > h1")
      .then(function(data) {
        stockData["name"] = data.text().trim().split('                ')[0];
      })
      .find("span.koersenfiche-main-percentage.js-stock-detail-main-percentage")
      .then(function(data) {
        stockData["percentage"] = data.text().trim();
      })
      .find("span.koersenfiche-main-price.js-stock-detail-main-price")
      .then(function(data) {
        stockData["price"] = data.text().split(' ')[1];
      })
      .get("http://www.tijd.be/ajax/historyPeriod?issueId="+id)
      .find("table")
      .then(function(data) {
        var table = data.text().split("    ");
        table.splice(0,1);
        var rows = table
          .map(function(row) {
            var rowParts = row.split(" ");
            return {
              timespan: rowParts[0] + " " + rowParts[1],
              percent: rowParts[2],
              high: rowParts[3],
              low: rowParts[4]
            }
          });

        stockData["history"] = rows;
      })
      .done(function() {
        resolve(stockData);
      });
      /*
      .log(console.log)
      .error(console.log)
      .debug(console.log)
      */
    });
}

function constructUrl(stock) {
  return "http://www.tijd.be/beurzen/" + stock;
}


module.exports = scrape;