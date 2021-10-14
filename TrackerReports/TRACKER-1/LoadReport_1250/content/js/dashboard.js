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

    var data = {"OkPercent": 53.18581203423104, "KoPercent": 46.81418796576896};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.04788724341014352, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.02942222222222222, 500, 1500, ""], "isController": false}, {"data": [0.0, 500, 1500, "EVENT-2"], "isController": false}, {"data": [0.0405, 500, 1500, "Tracker PV-0"], "isController": false}, {"data": [0.0, 500, 1500, "EVENT-1"], "isController": false}, {"data": [0.078, 500, 1500, "Tracker PV-1"], "isController": false}, {"data": [0.011904761904761904, 500, 1500, "EVENT-0"], "isController": false}, {"data": [0.0, 500, 1500, "-0"], "isController": false}, {"data": [0.0, 500, 1500, "-1"], "isController": false}, {"data": [0.0172, 500, 1500, "Tracker PV"], "isController": false}, {"data": [0.08276, 500, 1500, "EVENT"], "isController": false}, {"data": [0.0, 500, 1500, "CM request-0"], "isController": false}, {"data": [0.0, 500, 1500, "CM request-1"], "isController": false}, {"data": [0.03504, 500, 1500, "ADAGIO adv"], "isController": false}, {"data": [0.04548, 500, 1500, "CM request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 52467, 24562, 46.81418796576896, 2422.235881601787, 0, 33124, 1483.0, 4728.9000000000015, 9081.750000000004, 21030.0, 440.46609635904196, 653.3570738879631, 137.30138192648823], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["", 11250, 5804, 51.59111111111111, 2260.220266666659, 0, 28422, 1434.0, 5343.9, 9207.449999999999, 21026.0, 97.49883001403984, 143.04646638511173, 39.31135899285876], "isController": false}, {"data": ["EVENT-2", 5, 5, 100.0, 19306.4, 13842, 20717, 20661.0, 20717.0, 20717.0, 20717.0, 0.15247621371066114, 0.5177639553854598, 0.0], "isController": false}, {"data": ["Tracker PV-0", 1000, 0, 0.0, 4884.353000000002, 710, 13115, 4850.5, 8092.8, 8967.95, 12179.53, 46.27059041273367, 48.84619944937998, 30.09395821765686], "isController": false}, {"data": ["EVENT-1", 42, 37, 88.0952380952381, 275.7619047619048, 0, 1925, 96.0, 1680.5, 1873.7500000000002, 1925.0, 1.7808683853459972, 4.2187135611007465, 0.08364383692333786], "isController": false}, {"data": ["Tracker PV-1", 1000, 186, 18.6, 1838.837000000001, 14, 3552, 2473.0, 2693.9, 2767.0, 3152.9700000000003, 45.095828635851184, 58.15406567080045, 26.921593151071026], "isController": false}, {"data": ["EVENT-0", 42, 0, 0.0, 3837.6190476190477, 1439, 9749, 2994.5, 8522.8, 9136.65, 9749.0, 1.3215027373985275, 0.9472490324712102, 0.41167907542004906], "isController": false}, {"data": ["-0", 11, 0, 0.0, 3789.1818181818176, 1941, 8977, 2721.0, 8920.2, 8977.0, 8977.0, 0.4236472174080493, 0.44722914259580204, 0.27553617850953205], "isController": false}, {"data": ["-1", 11, 11, 100.0, 52.18181818181818, 0, 341, 13.0, 289.6000000000002, 341.0, 341.0, 0.4567726932978988, 1.1584362153268, 0.0], "isController": false}, {"data": ["Tracker PV", 1250, 436, 34.88, 6704.958399999989, 962, 21035, 6487.5, 10354.0, 11228.900000000001, 14877.170000000002, 41.8942923216141, 97.3070217976003, 41.80637976757047], "isController": false}, {"data": ["EVENT", 12500, 6054, 48.432, 2031.7966399999966, 0, 28301, 1258.0, 4762.799999999999, 8695.899999999998, 21028.0, 107.38647102283466, 151.9943328803414, 28.21314415774643], "isController": false}, {"data": ["CM request-0", 178, 0, 0.0, 6643.353932584273, 1620, 16762, 6455.0, 9190.8, 10625.949999999999, 16318.020000000004, 4.132135478329503, 2.590655251062052, 0.9160105015437473], "isController": false}, {"data": ["CM request-1", 178, 122, 68.53932584269663, 723.4438202247193, 0, 2310, 98.5, 2232.0, 2262.0, 2303.6800000000003, 4.765857184931324, 9.675993249484591, 0.45683954054994785], "isController": false}, {"data": ["ADAGIO adv", 12500, 5891, 47.128, 2382.3106400000024, 0, 21091, 1783.0, 5520.5999999999985, 9053.849999999888, 21027.0, 106.71447475135527, 154.78509372198744, 26.790944009582958], "isController": false}, {"data": ["CM request", 12500, 6016, 48.128, 2380.512319999997, 0, 33124, 1687.5, 5474.799999999999, 9178.0, 21027.0, 107.25931010811739, 168.09270991987728, 24.225487225416163], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 16841, 68.56526341503135, 32.098271294337394], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2279, 9.278560377819396, 4.3436826957897345], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection timed out: connect", 624, 2.5405097304779742, 1.1893190005146093], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Unrecognized Windows Sockets error: 0: recv failed", 324, 1.3191108215943328, 0.6175310194979702], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Read timed out", 1, 0.004071329696278805, 0.00190595993672213], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection refused: connect", 723, 2.943571370409576, 1.3780090342501001], "isController": false}, {"data": ["Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 3758, 15.300056998615748, 7.162597442201765], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.youronlinechoices.com:443 [www.youronlinechoices.com/40.85.112.191] failed: Connection refused: connect", 2, 0.00814265939255761, 0.00381191987344426], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.youronlinechoices.com:443 [www.youronlinechoices.com/40.85.112.191] failed: Connection timed out: connect", 8, 0.03257063757023044, 0.01524767949377704], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 2, 0.00814265939255761, 0.00381191987344426], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 52467, 24562, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 16841, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 3758, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2279, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection refused: connect", 723, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection timed out: connect", 624], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["", 11250, 5804, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 3992, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 922, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 491, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection refused: connect", 169, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection timed out: connect", 139], "isController": false}, {"data": ["EVENT-2", 5, 5, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.youronlinechoices.com:443 [www.youronlinechoices.com/40.85.112.191] failed: Connection timed out: connect", 4, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.youronlinechoices.com:443 [www.youronlinechoices.com/40.85.112.191] failed: Connection refused: connect", 1, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["EVENT-1", 42, 37, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 35, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2, null, null, null, null, null, null], "isController": false}, {"data": ["Tracker PV-1", 1000, 186, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 142, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 44, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["-1", 11, 11, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 11, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Tracker PV", 1250, 436, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 332, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 86, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 9, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection timed out: connect", 8, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection refused: connect", 1], "isController": false}, {"data": ["EVENT", 12500, 6054, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 4105, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 975, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 534, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection refused: connect", 181, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection timed out: connect", 164], "isController": false}, {"data": [], "isController": false}, {"data": ["CM request-1", 178, 122, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 108, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 14, null, null, null, null, null, null], "isController": false}, {"data": ["ADAGIO adv", 12500, 5891, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 4024, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 920, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 547, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection refused: connect", 173, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection timed out: connect", 155], "isController": false}, {"data": ["CM request", 12500, 6016, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 4092, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 932, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 561, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection refused: connect", 199, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection timed out: connect", 158], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
