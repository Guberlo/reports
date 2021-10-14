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

    var data = {"OkPercent": 92.95238095238095, "KoPercent": 7.0476190476190474};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2817857142857143, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.20877777777777778, 500, 1500, ""], "isController": false}, {"data": [0.4397590361445783, 500, 1500, "Tracker PV-0"], "isController": false}, {"data": [0.2821285140562249, 500, 1500, "Tracker PV-1"], "isController": false}, {"data": [0.1133, 500, 1500, "ADAGIO adv"], "isController": false}, {"data": [0.114, 500, 1500, "Tracker PV"], "isController": false}, {"data": [0.3219, 500, 1500, "CM request"], "isController": false}, {"data": [0.4769, 500, 1500, "EVENT"], "isController": false}, {"data": [0.5, 500, 1500, "CM request-0"], "isController": false}, {"data": [0.0, 500, 1500, "CM request-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21000, 1480, 7.0476190476190474, 1353.9962857142793, 13, 10702, 1433.0, 1932.0, 2084.0, 3185.8900000000176, 333.63519374672325, 289.57268071409845, 189.27958939536566], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["", 4500, 389, 8.644444444444444, 1421.083333333334, 20, 4911, 1503.0, 1856.0, 1927.9499999999998, 2600.6499999999924, 73.91832846019909, 58.1593675311689, 60.75202723582411], "isController": false}, {"data": ["Tracker PV-0", 498, 0, 0.0, 1116.9397590361446, 305, 8630, 994.0, 1751.3000000000002, 1956.2999999999988, 2642.0999999999963, 30.542778288868448, 32.242913408463664, 19.86473666053358], "isController": false}, {"data": ["Tracker PV-1", 498, 10, 2.0080321285140563, 1421.4919678714862, 23, 2374, 1581.0, 2089.2, 2103.2, 2130.5999999999995, 28.30671289717501, 28.220563576422443, 20.343229551526175], "isController": false}, {"data": ["ADAGIO adv", 5000, 376, 7.52, 1556.4258000000023, 19, 4895, 1679.0, 2058.0, 2119.0, 2593.9699999999993, 80.9808399332718, 66.18874052524173, 33.8560646551026], "isController": false}, {"data": ["Tracker PV", 500, 12, 2.4, 2533.8979999999965, 455, 10702, 2558.5, 3715.2000000000003, 3959.95, 4668.89, 27.14735584754045, 55.72312920784016, 37.01775267401455], "isController": false}, {"data": ["CM request", 5000, 334, 6.68, 1319.3715999999997, 13, 5126, 1396.5, 1736.0, 1797.0, 2504.99, 81.11352649167775, 81.36187329661594, 34.955874241588525], "isController": false}, {"data": ["EVENT", 5000, 359, 7.18, 1024.5995999999998, 19, 4666, 1110.0, 1383.0, 1442.8999999999996, 1817.9199999999983, 80.87343307723413, 57.140334361099875, 42.144757126971285], "isController": false}, {"data": ["CM request-0", 2, 0, 0.0, 1283.5, 1264, 1303, 1283.5, 1303.0, 1303.0, 1303.0, 1.2492192379762648, 0.783201905059338, 0.2769265302935665], "isController": false}, {"data": ["CM request-1", 2, 0, 0.0, 1703.5, 1688, 1719, 1703.5, 1719.0, 1719.0, 1719.0, 0.992063492063492, 0.7333906870039683, 0.30226934523809523], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1348, 91.08108108108108, 6.419047619047619], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 74, 5.0, 0.3523809523809524], "isController": false}, {"data": ["Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 58, 3.918918918918919, 0.2761904761904762], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21000, 1480, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1348, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 74, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 58, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["", 4500, 389, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 353, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 23, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 13, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["Tracker PV-1", 498, 10, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 9, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, null, null, null, null, null, null], "isController": false}, {"data": ["ADAGIO adv", 5000, 376, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 348, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 14, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 14, null, null, null, null], "isController": false}, {"data": ["Tracker PV", 500, 12, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 11, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, null, null, null, null, null, null], "isController": false}, {"data": ["CM request", 5000, 334, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 294, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 24, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 16, null, null, null, null], "isController": false}, {"data": ["EVENT", 5000, 359, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 333, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 15, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 11, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
