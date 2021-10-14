/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 76.54873577448693, "KoPercent": 23.45126422551307};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.019522879862863673, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.002111111111111111, 500, 1500, ""], "isController": false}, {"data": [0.0, 500, 1500, "EVENT-2"], "isController": false}, {"data": [0.24537987679671458, 500, 1500, "Tracker PV-0"], "isController": false}, {"data": [0.0, 500, 1500, "EVENT-1"], "isController": false}, {"data": [0.03696098562628337, 500, 1500, "Tracker PV-1"], "isController": false}, {"data": [0.0, 500, 1500, "EVENT-0"], "isController": false}, {"data": [0.0167, 500, 1500, "ADAGIO adv"], "isController": false}, {"data": [0.005, 500, 1500, "Tracker PV"], "isController": false}, {"data": [0.0085, 500, 1500, "CM request"], "isController": false}, {"data": [0.0269, 500, 1500, "EVENT"], "isController": false}, {"data": [0.0, 500, 1500, "CM request-0"], "isController": false}, {"data": [0.0, 500, 1500, "CM request-1"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21001, 4925, 23.45126422551307, 3193.9458121041907, 0, 27476, 3847.0, 5094.0, 5500.0, 7115.980000000003, 148.2775906744897, 191.48854896987282, 72.93991667725741], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["", 4500, 1154, 25.644444444444446, 3579.49555555555, 0, 12621, 4504.0, 5289.9, 5760.9, 6450.939999999999, 33.27639372629057, 44.318653706435654, 22.318595703832703], "isController": false}, {"data": ["EVENT-2", 1, 1, 100.0, 20731.0, 20731, 20731, 20731.0, 20731.0, 20731.0, 20731.0, 0.04823693984853601, 0.1638360124933674, 0.0], "isController": false}, {"data": ["Tracker PV-0", 487, 0, 0.0, 1831.0164271047245, 428, 5505, 1578.0, 3143.6, 3321.7999999999997, 4035.4800000000005, 37.13022262885026, 39.197041661901494, 24.149148701967064], "isController": false}, {"data": ["EVENT-1", 1, 0, 0.0, 3862.0, 3862, 3862, 3862.0, 3862.0, 3862.0, 3862.0, 0.2589331952356292, 0.21468191675297774, 0.10215723718280684], "isController": false}, {"data": ["Tracker PV-1", 487, 60, 12.320328542094456, 3389.572895277207, 13, 5581, 3797.0, 5209.0, 5348.0, 5549.96, 27.57019927536232, 39.93208512015964, 17.72877789925838], "isController": false}, {"data": ["EVENT-0", 1, 0, 0.0, 2882.0, 2882, 2882, 2882.0, 2882.0, 2882.0, 2882.0, 0.3469812630117973, 0.24871508501040943, 0.10809279580152671], "isController": false}, {"data": ["ADAGIO adv", 5000, 1059, 21.18, 3452.6909999999953, 0, 12614, 4419.0, 5058.900000000001, 5553.0, 6266.909999999998, 36.217187228371095, 37.786487854113545, 14.004068661448976], "isController": false}, {"data": ["Tracker PV", 500, 73, 14.6, 5099.342000000001, 252, 10210, 4830.0, 8220.9, 8512.8, 9029.560000000001, 27.100271002710027, 67.58251820799458, 34.140995511517616], "isController": false}, {"data": ["CM request", 5000, 1231, 24.62, 3247.3452000000093, 0, 11687, 4012.0, 4879.0, 5249.0, 6194.98, 35.71301024963394, 59.681811029070396, 13.131966827077605], "isController": false}, {"data": ["EVENT", 5000, 1342, 26.84, 2456.6827999999923, 0, 27476, 3322.0, 3749.0, 4237.249999999997, 5101.969999999999, 36.046427799005116, 36.443762221991925, 16.40360988077644], "isController": false}, {"data": ["CM request-0", 12, 0, 0.0, 2648.333333333333, 2497, 3020, 2619.5, 2963.9, 3020.0, 3020.0, 3.572491813039595, 2.23978490622209, 0.7919488687109258], "isController": false}, {"data": ["CM request-1", 12, 5, 41.666666666666664, 2781.5, 38, 4781, 4651.5, 4775.0, 4781.0, 4781.0, 2.3264831329972857, 4.166767642497091, 0.41349602559131443], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 4294, 87.18781725888324, 20.4466453978382], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 219, 4.446700507614213, 1.0428074853578402], "isController": false}, {"data": ["Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 410, 8.3248730964467, 1.9522879862863673], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.youronlinechoices.com:443 [www.youronlinechoices.com/40.85.112.191] failed: Connection timed out: connect", 2, 0.04060913705583756, 0.009523356030665207], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21001, 4925, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 4294, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 410, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 219, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.youronlinechoices.com:443 [www.youronlinechoices.com/40.85.112.191] failed: Connection timed out: connect", 2, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["", 4500, 1154, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1026, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 86, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 42, null, null, null, null], "isController": false}, {"data": ["EVENT-2", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.youronlinechoices.com:443 [www.youronlinechoices.com/40.85.112.191] failed: Connection timed out: connect", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Tracker PV-1", 487, 60, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 58, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["ADAGIO adv", 5000, 1059, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 890, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 120, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 49, null, null, null, null], "isController": false}, {"data": ["Tracker PV", 500, 73, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 70, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 3, null, null, null, null, null, null], "isController": false}, {"data": ["CM request", 5000, 1231, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1066, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 103, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 62, null, null, null, null], "isController": false}, {"data": ["EVENT", 5000, 1342, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1179, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 101, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 61, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.youronlinechoices.com:443 [www.youronlinechoices.com/40.85.112.191] failed: Connection timed out: connect", 1, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["CM request-1", 12, 5, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 5, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
