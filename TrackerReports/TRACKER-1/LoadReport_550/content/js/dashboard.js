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

    var data = {"OkPercent": 85.11559442375963, "KoPercent": 14.884405576240367};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.16326088838860509, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.052626262626262625, 500, 1500, ""], "isController": false}, {"data": [0.25, 500, 1500, "EVENT-2"], "isController": false}, {"data": [0.348747591522158, 500, 1500, "Tracker PV-0"], "isController": false}, {"data": [0.0, 500, 1500, "EVENT-1"], "isController": false}, {"data": [0.2976878612716763, 500, 1500, "Tracker PV-1"], "isController": false}, {"data": [0.25, 500, 1500, "EVENT-0"], "isController": false}, {"data": [0.06627272727272727, 500, 1500, "ADAGIO adv"], "isController": false}, {"data": [0.08363636363636363, 500, 1500, "Tracker PV"], "isController": false}, {"data": [0.11654545454545455, 500, 1500, "CM request"], "isController": false}, {"data": [0.3849090909090909, 500, 1500, "EVENT"], "isController": false}, {"data": [0.2, 500, 1500, "CM request-0"], "isController": false}, {"data": [0.0, 500, 1500, "CM request-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 23098, 3438, 14.884405576240367, 1471.5904840245876, 0, 23851, 1621.0, 2095.9000000000015, 2557.0, 4585.930000000011, 328.3297796730633, 320.35304781894104, 168.47935267857144], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["", 4950, 831, 16.78787878787879, 1542.5452525252524, 6, 16921, 1734.0, 2000.0, 2359.2999999999975, 4900.98, 72.17216341527426, 65.14723816176041, 53.261612815479836], "isController": false}, {"data": ["EVENT-2", 2, 1, 50.0, 10820.0, 1012, 20628, 10820.0, 20628.0, 20628.0, 20628.0, 0.09491268033409264, 0.2645783652477221, 0.009963977671791953], "isController": false}, {"data": ["Tracker PV-0", 519, 0, 0.0, 1328.7109826589588, 460, 8620, 1053.0, 2195.0, 2562.0, 4934.99999999998, 28.39479155268629, 29.975361004349494, 18.467706224696357], "isController": false}, {"data": ["EVENT-1", 4, 2, 50.0, 804.75, 78, 1548, 796.5, 1548.0, 1548.0, 1548.0, 2.056555269922879, 3.4603952442159382, 0.40568766066838047], "isController": false}, {"data": ["Tracker PV-1", 519, 39, 7.514450867052023, 1355.4181117533712, 25, 2863, 1350.0, 2437.0, 2556.0, 2613.5999999999995, 26.782949736814945, 28.979535023609248, 18.166541954794095], "isController": false}, {"data": ["EVENT-0", 4, 0, 0.0, 1442.0, 1277, 1674, 1408.5, 1674.0, 1674.0, 1674.0, 2.007024586051179, 1.4386289513296537, 0.6252351981936778], "isController": false}, {"data": ["ADAGIO adv", 5500, 782, 14.218181818181819, 1686.289999999996, 0, 15110, 1930.0, 2302.0, 2584.8999999999996, 3711.8899999999976, 79.60170202911975, 72.89025525913974, 31.084266768822186], "isController": false}, {"data": ["Tracker PV", 550, 70, 12.727272727272727, 2601.316363636365, 296, 15106, 2402.0, 4190.400000000001, 4558.399999999998, 6496.3700000000035, 24.588698140200286, 52.679757703527365, 30.829040789297213], "isController": false}, {"data": ["CM request", 5500, 883, 16.054545454545455, 1410.972909090909, 5, 21044, 1602.0, 1910.0, 2255.0, 3964.1899999999605, 79.49929896072734, 88.35392862047034, 30.200262008911146], "isController": false}, {"data": ["EVENT", 5500, 821, 14.927272727272728, 1162.0483636363658, 22, 23851, 1283.0, 1559.0, 1916.8499999999995, 4502.909999999998, 79.59133467432673, 66.08227426359927, 37.1996925106363], "isController": false}, {"data": ["CM request-0", 25, 0, 0.0, 1852.2399999999998, 1290, 4335, 1592.0, 2592.2000000000007, 3871.199999999999, 4335.0, 1.6021532940271725, 1.0044750144193797, 0.35516484154703926], "isController": false}, {"data": ["CM request-1", 25, 9, 36.0, 1130.6399999999999, 77, 1826, 1656.0, 1783.6000000000001, 1822.1, 1826.0, 1.783039726125098, 2.4715298703730118, 0.3476927465943941], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 3010, 87.55090168702735, 13.03143129275262], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 208, 6.050029086678301, 0.9005108667417092], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection timed out: connect", 1, 0.029086678301337987, 0.004329379167027449], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection refused: connect", 6, 0.17452006980802792, 0.02597627500216469], "isController": false}, {"data": ["Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 211, 6.137289121582315, 0.9134990042427916], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.youronlinechoices.com:443 [www.youronlinechoices.com/40.85.112.191] failed: Connection timed out: connect", 2, 0.058173356602675974, 0.008658758334054897], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 23098, 3438, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 3010, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 211, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 208, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection refused: connect", 6, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.youronlinechoices.com:443 [www.youronlinechoices.com/40.85.112.191] failed: Connection timed out: connect", 2], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["", 4950, 831, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 726, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 52, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 51, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection refused: connect", 2, null, null], "isController": false}, {"data": ["EVENT-2", 2, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.youronlinechoices.com:443 [www.youronlinechoices.com/40.85.112.191] failed: Connection timed out: connect", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["EVENT-1", 4, 2, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 2, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Tracker PV-1", 519, 39, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 39, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["ADAGIO adv", 5500, 782, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 689, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 48, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 44, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection refused: connect", 1, null, null], "isController": false}, {"data": ["Tracker PV", 550, 70, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 63, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 5, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection refused: connect", 1, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 1, null, null], "isController": false}, {"data": ["CM request", 5500, 883, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 767, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 60, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 54, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection timed out: connect", 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection refused: connect", 1], "isController": false}, {"data": ["EVENT", 5500, 821, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 715, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 57, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 47, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection refused: connect", 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.youronlinechoices.com:443 [www.youronlinechoices.com/40.85.112.191] failed: Connection timed out: connect", 1], "isController": false}, {"data": [], "isController": false}, {"data": ["CM request-1", 25, 9, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 9, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
