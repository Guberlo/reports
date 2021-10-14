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

    var data = {"OkPercent": 73.91428571428571, "KoPercent": 26.085714285714285};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.021738095238095237, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.003, 500, 1500, ""], "isController": false}, {"data": [0.27049180327868855, 500, 1500, "Tracker PV-0"], "isController": false}, {"data": [0.0, 500, 1500, "EVENT-1"], "isController": false}, {"data": [0.0020491803278688526, 500, 1500, "Tracker PV-1"], "isController": false}, {"data": [0.5, 500, 1500, "EVENT-0"], "isController": false}, {"data": [0.0, 500, 1500, "-0"], "isController": false}, {"data": [0.0, 500, 1500, "-1"], "isController": false}, {"data": [0.0, 500, 1500, "Tracker PV"], "isController": false}, {"data": [0.0346, 500, 1500, "EVENT"], "isController": false}, {"data": [0.45, 500, 1500, "CM request-0"], "isController": false}, {"data": [0.0, 500, 1500, "CM request-1"], "isController": false}, {"data": [0.019, 500, 1500, "ADAGIO adv"], "isController": false}, {"data": [0.0074, 500, 1500, "CM request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21000, 5478, 26.085714285714285, 3308.5007619047665, 0, 15142, 3340.0, 6392.9000000000015, 6851.850000000002, 8853.930000000011, 143.9095425732397, 190.11827833219118, 68.43298944235052], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["", 4500, 1312, 29.155555555555555, 4112.760444444448, 0, 15085, 5000.0, 6784.0, 7066.799999999999, 7785.849999999997, 33.091398442498175, 45.18239076851096, 21.05786364229669], "isController": false}, {"data": ["Tracker PV-0", 488, 0, 0.0, 1511.5122950819673, 378, 8973, 1490.5, 2201.6000000000004, 2488.999999999998, 5465.660000000002, 37.639799460084845, 39.734983609718476, 24.480572695719243], "isController": false}, {"data": ["EVENT-1", 1, 1, 100.0, 13.0, 13, 13, 13.0, 13.0, 13.0, 13.0, 76.92307692307693, 195.08713942307693, 0.0], "isController": false}, {"data": ["Tracker PV-1", 488, 33, 6.762295081967213, 5302.850409836063, 0, 7755, 6525.5, 7516.3, 7592.0, 7719.200000000001, 26.0990480265269, 35.99639249518665, 17.84663007072949], "isController": false}, {"data": ["EVENT-0", 1, 0, 0.0, 1384.0, 1384, 1384, 1384.0, 1384.0, 1384.0, 1384.0, 0.722543352601156, 0.5179168171965318, 0.22508918894508673], "isController": false}, {"data": ["-0", 1, 0, 0.0, 1843.0, 1843, 1843, 1843.0, 1843.0, 1843.0, 1843.0, 0.5425935973955507, 0.5727965613130765, 0.35289778893109064], "isController": false}, {"data": ["-1", 1, 1, 100.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 158.50830078125, 0.0], "isController": false}, {"data": ["Tracker PV", 500, 45, 9.0, 6679.4540000000015, 361, 13172, 7646.0, 9568.6, 9822.5, 10670.83, 25.55322737261716, 62.087954208616544, 33.27474390874942], "isController": false}, {"data": ["EVENT", 5000, 1400, 28.0, 1708.6600000000064, 0, 10186, 2252.0, 2692.9000000000005, 2922.8999999999996, 3736.0, 35.30250718406022, 36.608010447777, 15.691019825446752], "isController": false}, {"data": ["CM request-0", 10, 0, 0.0, 1032.3, 715, 1811, 963.0, 1756.1000000000001, 1811.0, 1811.0, 4.997501249375313, 3.1331990254872566, 1.1078445152423788], "isController": false}, {"data": ["CM request-1", 10, 6, 60.0, 2305.5, 3, 5815, 37.5, 5811.1, 5815.0, 5815.0, 1.470155836518671, 2.9773527087621288, 0.17917524257571305], "isController": false}, {"data": ["ADAGIO adv", 5000, 1302, 26.04, 3673.7057999999993, 0, 15142, 4862.5, 5984.900000000001, 6261.749999999999, 7208.98, 35.55504988373499, 39.609846382184784, 13.000134553641903], "isController": false}, {"data": ["CM request", 5000, 1378, 27.56, 3471.499000000007, 0, 13220, 3838.0, 5895.900000000001, 6063.9, 6904.779999999995, 34.84393401952654, 58.58805383344251, 12.302562836679511], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 4623, 84.3921139101862, 22.014285714285716], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 300, 5.47645125958379, 1.4285714285714286], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.13] failed: Connection refused: connect", 3, 0.054764512595837894, 0.014285714285714285], "isController": false}, {"data": ["Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 552, 10.076670317634173, 2.6285714285714286], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21000, 5478, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 4623, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 552, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 300, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.13] failed: Connection refused: connect", 3, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["", 4500, 1312, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1135, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 124, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 52, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.13] failed: Connection refused: connect", 1, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["EVENT-1", 1, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Tracker PV-1", 488, 33, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 31, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["-1", 1, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Tracker PV", 500, 45, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 40, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 3, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 2, null, null, null, null], "isController": false}, {"data": ["EVENT", 5000, 1400, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1167, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 147, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 86, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["CM request-1", 10, 6, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 6, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["ADAGIO adv", 5000, 1302, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1083, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 145, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 72, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.13] failed: Connection refused: connect", 2, null, null], "isController": false}, {"data": ["CM request", 5000, 1378, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1159, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 134, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 85, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
