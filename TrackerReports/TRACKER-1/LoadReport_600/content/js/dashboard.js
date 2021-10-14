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

    var data = {"OkPercent": 78.18737351692393, "KoPercent": 21.81262648307607};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.137871513035197, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.052314814814814814, 500, 1500, ""], "isController": false}, {"data": [0.0, 500, 1500, "EVENT-2"], "isController": false}, {"data": [0.3357798165137615, 500, 1500, "Tracker PV-0"], "isController": false}, {"data": [0.15, 500, 1500, "EVENT-1"], "isController": false}, {"data": [0.25871559633027524, 500, 1500, "Tracker PV-1"], "isController": false}, {"data": [0.25, 500, 1500, "EVENT-0"], "isController": false}, {"data": [0.06733333333333333, 500, 1500, "ADAGIO adv"], "isController": false}, {"data": [0.07833333333333334, 500, 1500, "Tracker PV"], "isController": false}, {"data": [0.08841666666666667, 500, 1500, "CM request"], "isController": false}, {"data": [0.3135, 500, 1500, "EVENT"], "isController": false}, {"data": [0.03488372093023256, 500, 1500, "CM request-0"], "isController": false}, {"data": [0.0, 500, 1500, "CM request-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 25201, 5497, 21.81262648307607, 1510.506924328412, 0, 24335, 1633.0, 2345.0, 3030.9500000000007, 5437.980000000003, 340.1633259094284, 365.7265118824661, 158.86473834953097], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["", 5400, 1306, 24.185185185185187, 1563.2466666666642, 6, 15140, 1795.0, 2320.0, 3057.95, 5171.869999999997, 75.2068187515668, 75.96371521249408, 49.833956357413435], "isController": false}, {"data": ["EVENT-2", 5, 5, 100.0, 20391.2, 18997, 21104, 20615.0, 21104.0, 21104.0, 21104.0, 0.18999126040202152, 0.6453023473420223, 0.0], "isController": false}, {"data": ["Tracker PV-0", 545, 0, 0.0, 1346.5816513761458, 401, 6182, 1330.0, 2091.8, 2394.2, 2900.24, 35.70258761873567, 37.689938687356694, 23.220628275466755], "isController": false}, {"data": ["EVENT-1", 10, 5, 50.0, 780.5999999999999, 50, 1567, 765.0, 1561.9, 1567.0, 1567.0, 1.235941169200346, 2.1730356260042023, 0.24380870720553705], "isController": false}, {"data": ["Tracker PV-1", 545, 57, 10.458715596330276, 1397.209174311925, 50, 2933, 1354.0, 2499.6000000000004, 2595.0, 2662.62, 37.49054137717548, 42.872753039657425, 24.619827853064592], "isController": false}, {"data": ["EVENT-0", 10, 0, 0.0, 1617.5, 1300, 2286, 1544.0, 2249.2000000000003, 2286.0, 2286.0, 1.2175818823815903, 0.8727588883477415, 0.3793052934372337], "isController": false}, {"data": ["ADAGIO adv", 6000, 1314, 21.9, 1689.2333333333302, 1, 15137, 1981.0, 2538.0, 3286.8999999999996, 5425.959999999999, 82.32259480818834, 84.62202673940783, 29.529988363358214], "isController": false}, {"data": ["Tracker PV", 600, 112, 18.666666666666668, 2579.2316666666666, 279, 6256, 2462.5, 4274.0, 4504.799999999999, 4986.39, 39.115978877371404, 86.36246607911207, 46.44118443998957], "isController": false}, {"data": ["CM request", 6000, 1346, 22.433333333333334, 1488.0344999999988, 0, 21050, 1654.0, 2194.9000000000005, 2940.95, 5435.52999999999, 82.2064203214271, 97.54644074030307, 28.39328675397674], "isController": false}, {"data": ["EVENT", 6000, 1334, 22.233333333333334, 1210.0748333333318, 0, 24335, 1314.0, 1787.9000000000005, 2571.8999999999996, 4713.939999999999, 82.26728641355766, 78.07370345471185, 34.54885926980927], "isController": false}, {"data": ["CM request-0", 43, 0, 0.0, 2023.5813953488382, 1285, 3138, 1740.0, 2833.2000000000003, 3047.6, 3138.0, 7.289371079844042, 4.570093977792847, 1.6159055030513647], "isController": false}, {"data": ["CM request-1", 43, 18, 41.86046511627907, 1042.813953488372, 38, 2031, 1653.0, 1801.8, 1940.5999999999995, 2031.0, 7.199062447681232, 11.24313970157375, 1.275269964841788], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 4650, 84.59159541568128, 18.451648744097458], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 387, 7.040203747498635, 1.5356533470894012], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection timed out: connect", 5, 0.09095870474804439, 0.0198404825205349], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection refused: connect", 25, 0.4547935237402219, 0.0992024126026745], "isController": false}, {"data": ["Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 420, 7.6405311988357285, 1.6666005317249315], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.youronlinechoices.com:443 [www.youronlinechoices.com/40.85.112.191] failed: Connection timed out: connect", 10, 0.18191740949608878, 0.0396809650410698], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 25201, 5497, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 4650, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 420, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 387, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection refused: connect", 25, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.youronlinechoices.com:443 [www.youronlinechoices.com/40.85.112.191] failed: Connection timed out: connect", 10], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["", 5400, 1306, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1103, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 115, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 80, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection refused: connect", 8, null, null], "isController": false}, {"data": ["EVENT-2", 5, 5, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.youronlinechoices.com:443 [www.youronlinechoices.com/40.85.112.191] failed: Connection timed out: connect", 5, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["EVENT-1", 10, 5, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 4, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, null, null, null, null, null, null], "isController": false}, {"data": ["Tracker PV-1", 545, 57, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 46, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 11, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["ADAGIO adv", 6000, 1314, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1136, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 98, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 76, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection refused: connect", 4, null, null], "isController": false}, {"data": ["Tracker PV", 600, 112, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 82, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 21, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 9, null, null, null, null], "isController": false}, {"data": ["CM request", 6000, 1346, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1142, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 100, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 92, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection refused: connect", 9, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection timed out: connect", 3], "isController": false}, {"data": ["EVENT", 6000, 1334, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1123, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 106, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 94, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.youronlinechoices.com:443 [www.youronlinechoices.com/40.85.112.191] failed: Connection timed out: connect", 5, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection refused: connect", 4], "isController": false}, {"data": [], "isController": false}, {"data": ["CM request-1", 43, 18, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 14, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 4, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
