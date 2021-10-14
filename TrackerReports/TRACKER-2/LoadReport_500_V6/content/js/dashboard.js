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

    var data = {"OkPercent": 73.79977138502572, "KoPercent": 26.200228614974282};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.017598590207658603, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0022222222222222222, 500, 1500, ""], "isController": false}, {"data": [0.5, 500, 1500, "EVENT-2"], "isController": false}, {"data": [0.14675052410901468, 500, 1500, "Tracker PV-0"], "isController": false}, {"data": [0.0, 500, 1500, "EVENT-1"], "isController": false}, {"data": [0.0, 500, 1500, "Tracker PV-1"], "isController": false}, {"data": [0.21428571428571427, 500, 1500, "EVENT-0"], "isController": false}, {"data": [0.0, 500, 1500, "-0"], "isController": false}, {"data": [0.0, 500, 1500, "-1"], "isController": false}, {"data": [0.0, 500, 1500, "Tracker PV"], "isController": false}, {"data": [0.0339, 500, 1500, "EVENT"], "isController": false}, {"data": [0.4166666666666667, 500, 1500, "CM request-0"], "isController": false}, {"data": [0.0, 500, 1500, "CM request-1"], "isController": false}, {"data": [0.0159, 500, 1500, "ADAGIO adv"], "isController": false}, {"data": [0.0066, 500, 1500, "CM request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 20996, 5501, 26.200228614974282, 4611.820918270164, 0, 34486, 3717.5, 6995.0, 7883.850000000002, 29364.730000000043, 115.13300395365287, 153.67576983303906, 54.6787391425344], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["", 4500, 1312, 29.155555555555555, 4506.132666666673, 0, 23555, 5480.0, 7667.400000000001, 8261.599999999999, 9246.929999999998, 26.250087500291666, 36.40803395776944, 16.675322511491704], "isController": false}, {"data": ["EVENT-2", 2, 0, 0.0, 703.5, 674, 733, 703.5, 733.0, 733.0, 733.0, 1.8975332068311195, 4.1341763519924095, 0.39840785104364324], "isController": false}, {"data": ["Tracker PV-0", 477, 0, 0.0, 1857.073375262055, 449, 6554, 1872.0, 2618.6, 2960.2, 3963.9999999999436, 38.08383233532934, 40.20373315868263, 24.76936751497006], "isController": false}, {"data": ["EVENT-1", 7, 5, 71.42857142857143, 5989.0, 0, 21058, 44.0, 21058.0, 21058.0, 21058.0, 0.33241523411530055, 0.6809225561544306, 0.03747091366701491], "isController": false}, {"data": ["Tracker PV-1", 477, 17, 3.5639412997903563, 26745.95597484278, 1, 32419, 27451.0, 31044.6, 31377.7, 31838.879999999997, 14.65662928253188, 19.609356996082347, 10.366055653710246], "isController": false}, {"data": ["EVENT-0", 7, 0, 0.0, 1533.5714285714287, 1305, 1714, 1513.0, 1714.0, 1714.0, 1714.0, 3.396409509946628, 2.434535722950024, 1.058061165696264], "isController": false}, {"data": ["-0", 1, 0, 0.0, 1965.0, 1965, 1965, 1965.0, 1965.0, 1965.0, 1965.0, 0.5089058524173028, 0.5372336195928753, 0.3309875954198473], "isController": false}, {"data": ["-1", 1, 0, 0.0, 21589.0, 21589, 21589, 21589.0, 21589.0, 21589.0, 21589.0, 0.04631988512668488, 0.05984492970957432, 0.03397093137709019], "isController": false}, {"data": ["Tracker PV", 500, 40, 8.0, 27318.681999999993, 121, 34486, 29214.0, 33213.8, 33739.35, 34342.85, 14.422522210684205, 34.38664505992558, 18.680039499682707], "isController": false}, {"data": ["EVENT", 5000, 1406, 28.12, 2019.9809999999975, 0, 23505, 2361.5, 3526.0, 4039.0, 5869.98, 29.040220705677363, 30.28914304123711, 12.962493874328445], "isController": false}, {"data": ["CM request-0", 12, 0, 0.0, 1221.416666666667, 876, 1829, 1170.0, 1818.2, 1829.0, 1829.0, 6.237006237006238, 3.910310550935551, 1.3826175935550935], "isController": false}, {"data": ["CM request-1", 12, 9, 75.0, 836.5000000000001, 2, 3298, 39.0, 3285.1, 3298.0, 3298.0, 3.628666465074085, 8.501143407922589, 0.2764023283943151], "isController": false}, {"data": ["ADAGIO adv", 5000, 1356, 27.12, 3949.0646000000074, 0, 20522, 5019.5, 6675.900000000001, 7114.799999999999, 8498.909999999998, 29.046462721769743, 32.8913407229955, 10.448506203961356], "isController": false}, {"data": ["CM request", 5000, 1356, 27.12, 3860.333400000003, 0, 15142, 4504.5, 6603.0, 6884.549999999998, 7861.969999999999, 29.03533018977492, 49.423836971702165, 10.3296816566398], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 4442, 80.74895473550264, 21.15641074490379], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 361, 6.562443192146882, 1.719375119070299], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.13] failed: Connection refused: connect", 1, 0.018178512997636793, 0.004762811964183654], "isController": false}, {"data": ["Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 697, 12.670423559352844, 3.319679939036007], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 20996, 5501, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 4442, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 697, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 361, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.13] failed: Connection refused: connect", 1, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["", 4500, 1312, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1068, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 165, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 79, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["EVENT-1", 7, 5, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 5, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Tracker PV-1", 477, 17, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 16, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Tracker PV", 500, 40, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 34, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 4, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2, null, null, null, null], "isController": false}, {"data": ["EVENT", 5000, 1406, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1156, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 166, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 84, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["CM request-1", 12, 9, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 7, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2, null, null, null, null, null, null], "isController": false}, {"data": ["ADAGIO adv", 5000, 1356, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1095, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 169, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 92, null, null, null, null], "isController": false}, {"data": ["CM request", 5000, 1356, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1061, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 193, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 101, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.13] failed: Connection refused: connect", 1, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
