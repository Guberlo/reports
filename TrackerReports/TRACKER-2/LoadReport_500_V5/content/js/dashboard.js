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

    var data = {"OkPercent": 71.26798132799847, "KoPercent": 28.732018672001523};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.012051062208249976, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.002, 500, 1500, ""], "isController": false}, {"data": [0.07916666666666666, 500, 1500, "Tracker PV-0"], "isController": false}, {"data": [0.0, 500, 1500, "EVENT-1"], "isController": false}, {"data": [0.0, 500, 1500, "Tracker PV-1"], "isController": false}, {"data": [0.0, 500, 1500, "EVENT-0"], "isController": false}, {"data": [0.0161, 500, 1500, "ADAGIO adv"], "isController": false}, {"data": [0.0, 500, 1500, "Tracker PV"], "isController": false}, {"data": [0.0065, 500, 1500, "CM request"], "isController": false}, {"data": [0.0186, 500, 1500, "EVENT"], "isController": false}, {"data": [0.0, 500, 1500, "CM request-0"], "isController": false}, {"data": [0.0, 500, 1500, "CM request-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 20994, 6032, 28.732018672001523, 3691.8528627226683, 0, 21013, 4400.0, 6380.0, 7249.0, 9501.980000000003, 130.9824620510229, 175.9965822719162, 59.05694408374979], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["", 4500, 1412, 31.377777777777776, 3903.819333333333, 0, 12449, 5204.0, 6522.0, 7325.95, 8358.939999999999, 30.236245867713066, 41.81489076316284, 18.325894656919395], "isController": false}, {"data": ["Tracker PV-0", 480, 0, 0.0, 3021.2562499999995, 955, 7839, 3032.5, 4520.6, 4716.2, 5320.15, 33.86960203217612, 35.7549216765453, 22.028471634208298], "isController": false}, {"data": ["EVENT-1", 2, 2, 100.0, 30.5, 11, 50, 30.5, 50.0, 50.0, 50.0, 1.5372790161414296, 3.898743754803997, 0.0], "isController": false}, {"data": ["Tracker PV-1", 480, 114, 23.75, 5661.758333333334, 0, 9222, 6795.0, 8650.8, 8863.0, 9153.75, 22.187297772025513, 35.256732024822035, 12.407498757742442], "isController": false}, {"data": ["EVENT-0", 2, 0, 0.0, 4819.5, 4158, 5481, 4819.5, 5481.0, 5481.0, 5481.0, 0.3648969166210545, 0.26155696953110746, 0.1136739417989418], "isController": false}, {"data": ["ADAGIO adv", 5000, 1377, 27.54, 3771.9058000000027, 0, 21013, 4892.0, 6428.900000000001, 7002.95, 8401.889999999998, 33.34355869133201, 37.80218511801952, 11.826888631263587], "isController": false}, {"data": ["Tracker PV", 500, 134, 26.8, 8351.472, 225, 14690, 8368.5, 12884.0, 13202.8, 13742.42, 21.72401807438304, 57.0370883298575, 25.226421972758082], "isController": false}, {"data": ["CM request", 5000, 1503, 30.06, 3682.6901999999964, 0, 15088, 4644.5, 6298.0, 7142.0, 8241.99, 32.863602902513406, 55.29999539909559, 10.97117363936468], "isController": false}, {"data": ["EVENT", 5000, 1482, 29.64, 2839.9774, 0, 12557, 3748.0, 4991.900000000001, 5374.9, 6686.649999999992, 33.2752126286087, 35.11394108706792, 14.163984199265283], "isController": false}, {"data": ["CM request-0", 15, 0, 0.0, 3878.8000000000006, 3615, 4870, 3775.0, 4322.8, 4870.0, 4870.0, 3.080082135523614, 1.9310671201232033, 0.6827916452772074], "isController": false}, {"data": ["CM request-1", 15, 8, 53.333333333333336, 3682.6666666666665, 1, 8082, 51.0, 8051.4, 8082.0, 8082.0, 1.7201834862385321, 3.3372231579701834, 0.24458858944954126], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 5184, 85.94164456233422, 24.69276936267505], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 274, 4.542440318302387, 1.3051348004191674], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Unrecognized Windows Sockets error: 0: recv failed", 1, 0.016578249336870028, 0.004763265694960465], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.13] failed: Connection refused: connect", 2, 0.033156498673740056, 0.00952653138992093], "isController": false}, {"data": ["Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 570, 9.449602122015914, 2.715061446127465], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.13] failed: Connection timed out: connect", 1, 0.016578249336870028, 0.004763265694960465], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 20994, 6032, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 5184, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 570, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 274, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.13] failed: Connection refused: connect", 2, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Unrecognized Windows Sockets error: 0: recv failed", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["", 4500, 1412, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1214, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 123, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 75, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["EVENT-1", 2, 2, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 2, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Tracker PV-1", 480, 114, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 113, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["ADAGIO adv", 5000, 1377, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1171, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 144, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 61, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.13] failed: Connection timed out: connect", 1, null, null], "isController": false}, {"data": ["Tracker PV", 500, 134, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 130, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 4, null, null, null, null, null, null], "isController": false}, {"data": ["CM request", 5000, 1503, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1256, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 167, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 77, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.13] failed: Connection refused: connect", 2, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Unrecognized Windows Sockets error: 0: recv failed", 1], "isController": false}, {"data": ["EVENT", 5000, 1482, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1290, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 136, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 56, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["CM request-1", 15, 8, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 8, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
