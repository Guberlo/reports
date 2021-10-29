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

    var data = {"OkPercent": 99.7, "KoPercent": 0.3};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.014380952380952381, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.011333333333333334, 500, 1500, ""], "isController": false}, {"data": [0.0, 500, 1500, "Tracker PV-0"], "isController": false}, {"data": [0.0, 500, 1500, "Tracker PV-1"], "isController": false}, {"data": [0.0211, 500, 1500, "ADAGIO adv"], "isController": false}, {"data": [0.0, 500, 1500, "Tracker PV"], "isController": false}, {"data": [0.0135, 500, 1500, "CM request"], "isController": false}, {"data": [0.0156, 500, 1500, "EVENT"], "isController": false}, {"data": [0.0, 500, 1500, "CM request-0"], "isController": false}, {"data": [0.0, 500, 1500, "CM request-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21000, 63, 0.3, 7946.574571428502, 137, 114990, 4372.0, 15817.600000000006, 25350.30000000001, 47547.39000000058, 62.53573470554602, 69.20785905748225, 40.110994298639405], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["", 4500, 7, 0.15555555555555556, 6978.803333333345, 233, 69771, 4374.0, 12810.8, 19691.149999999994, 36546.87999999978, 14.479975802351548, 17.597771008836002, 13.174311230789899], "isController": false}, {"data": ["Tracker PV-0", 485, 0, 0.0, 21663.8886597938, 1619, 75760, 20586.0, 36725.40000000001, 47856.4, 65794.37999999998, 5.678624953165979, 5.99472028747307, 3.6933244324302175], "isController": false}, {"data": ["Tracker PV-1", 485, 4, 0.8247422680412371, 8136.002061855666, 3755, 65010, 5326.0, 13039.2, 19691.3, 60339.599999999984, 3.9817087687899715, 5.192328142573908, 2.8960950391808353], "isController": false}, {"data": ["ADAGIO adv", 5000, 12, 0.24, 6765.587000000007, 218, 70507, 4342.5, 12794.800000000001, 18802.69999999999, 36850.519999999924, 15.773716571551157, 11.352140483480186, 6.984934424716783], "isController": false}, {"data": ["Tracker PV", 500, 19, 3.8, 30767.29400000001, 7471, 114990, 27178.5, 51797.90000000008, 69665.9, 99419.08000000003, 4.034926322245355, 9.54424782164415, 5.392308636053681], "isController": false}, {"data": ["CM request", 5000, 10, 0.2, 7006.415599999994, 137, 74485, 4291.0, 13142.400000000003, 20538.899999999972, 39264.06999999991, 15.325435625507655, 26.994479730195707, 7.637373972237974], "isController": false}, {"data": ["EVENT", 5000, 11, 0.22, 7254.836400000011, 229, 82873, 4399.0, 13264.900000000005, 19326.499999999993, 38789.449999999924, 15.532436386906777, 9.352559269835698, 10.329749741384935], "isController": false}, {"data": ["CM request-0", 15, 0, 0.0, 27975.4, 18934, 43828, 26760.0, 37998.4, 43828.0, 43828.0, 0.17160311631259223, 0.10758711003191818, 0.0380409251982016], "isController": false}, {"data": ["CM request-1", 15, 0, 0.0, 5535.4, 3938, 10076, 5338.0, 7754.600000000001, 10076.0, 10076.0, 0.21740390747289698, 0.27366566087164473, 0.0662402530581483], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 44, 69.84126984126983, 0.20952380952380953], "isController": false}, {"data": ["Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 13, 20.634920634920636, 0.06190476190476191], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.13] failed: Connection timed out: connect", 6, 9.523809523809524, 0.02857142857142857], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21000, 63, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 44, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 13, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.13] failed: Connection timed out: connect", 6, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["", 4500, 7, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 6, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 1, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["Tracker PV-1", 485, 4, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 3, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.13] failed: Connection timed out: connect", 1, null, null, null, null, null, null], "isController": false}, {"data": ["ADAGIO adv", 5000, 12, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 9, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 2, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.13] failed: Connection timed out: connect", 1, null, null, null, null], "isController": false}, {"data": ["Tracker PV", 500, 19, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 9, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 7, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.13] failed: Connection timed out: connect", 3, null, null, null, null], "isController": false}, {"data": ["CM request", 5000, 10, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 10, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["EVENT", 5000, 11, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 9, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.13] failed: Connection timed out: connect", 1, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
