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

    var data = {"OkPercent": 96.94300271415646, "KoPercent": 3.0569972858435315};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.014427884386457788, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.010666666666666666, 500, 1500, ""], "isController": false}, {"data": [0.0, 500, 1500, "EVENT-2"], "isController": false}, {"data": [0.028747433264887063, 500, 1500, "Tracker PV-0"], "isController": false}, {"data": [0.0, 500, 1500, "EVENT-1"], "isController": false}, {"data": [0.0, 500, 1500, "Tracker PV-1"], "isController": false}, {"data": [0.0, 500, 1500, "EVENT-0"], "isController": false}, {"data": [0.0187, 500, 1500, "ADAGIO adv"], "isController": false}, {"data": [0.0, 500, 1500, "Tracker PV"], "isController": false}, {"data": [0.014, 500, 1500, "CM request"], "isController": false}, {"data": [0.0155, 500, 1500, "EVENT"], "isController": false}, {"data": [0.0, 500, 1500, "CM request-0"], "isController": false}, {"data": [0.0, 500, 1500, "CM request-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21001, 642, 3.0569972858435315, 7310.774439312401, 0, 98681, 4357.0, 16375.300000000025, 21666.650000000005, 44365.09000000014, 63.79230215455835, 72.52212286685662, 39.80046383433472], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["", 4500, 161, 3.577777777777778, 6645.984666666671, 0, 67622, 4376.0, 12619.500000000002, 21025.95, 32283.419999999856, 14.646387387182132, 18.204690332652007, 12.879161531955162], "isController": false}, {"data": ["EVENT-2", 1, 0, 0.0, 27989.0, 27989, 27989, 27989.0, 27989.0, 27989.0, 27989.0, 0.03572832184072314, 0.08202859828861338, 0.007501551948979956], "isController": false}, {"data": ["Tracker PV-0", 487, 0, 0.0, 14278.16427104722, 1144, 66228, 11624.0, 28048.8, 37419.5999999999, 61838.6, 6.559452615699586, 6.924578396065676, 4.266206486382738], "isController": false}, {"data": ["EVENT-1", 1, 0, 0.0, 4550.0, 4550, 4550, 4550.0, 4550.0, 4550.0, 4550.0, 0.21978021978021978, 0.18222012362637363, 0.08671016483516483], "isController": false}, {"data": ["Tracker PV-1", 487, 7, 1.4373716632443532, 7144.476386036961, 2594, 65018, 4589.0, 10450.4, 17889.59999999998, 64989.72, 4.623388459566712, 6.064312760480946, 3.3420476769134373], "isController": false}, {"data": ["EVENT-0", 1, 0, 0.0, 30363.0, 30363, 30363, 30363.0, 30363.0, 30363.0, 30363.0, 0.03293482198728716, 0.023607577479168727, 0.010259968958930277], "isController": false}, {"data": ["ADAGIO adv", 5000, 147, 2.94, 6626.458399999994, 0, 69021, 4333.0, 13279.900000000001, 20983.9, 35785.60999999993, 15.975155438262414, 12.264388922347965, 6.936799389589311], "isController": false}, {"data": ["Tracker PV", 500, 20, 4.0, 22619.10599999999, 7642, 98681, 18493.5, 43875.10000000002, 66374.24999999999, 85923.78000000001, 4.662569821983084, 11.047057641602246, 6.236387481699413], "isController": false}, {"data": ["CM request", 5000, 143, 2.86, 6586.2104000000145, 0, 70152, 4272.0, 12699.800000000001, 21027.95, 35357.249999999985, 15.651558738734792, 27.549567997414364, 7.586206584532504], "isController": false}, {"data": ["EVENT", 5000, 164, 3.28, 7060.2390000000005, 0, 67021, 4372.0, 13574.400000000014, 20681.299999999996, 40298.67999999999, 15.77754917862079, 10.344319002519674, 10.117433531157504], "isController": false}, {"data": ["CM request-0", 12, 0, 0.0, 31131.916666666664, 16402, 56661, 27086.0, 55977.9, 56661.0, 56661.0, 0.1897023254343393, 0.118934465750826, 0.04205315222030764], "isController": false}, {"data": ["CM request-1", 12, 0, 0.0, 6936.666666666666, 3346, 31354, 4380.0, 24924.400000000023, 31354.0, 31354.0, 0.2669870511280203, 0.33608037978908023, 0.08134761714056869], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 395, 61.52647975077882, 1.8808628160563783], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection timed out: connect", 237, 36.91588785046729, 1.128517689633827], "isController": false}, {"data": ["Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 10, 1.557632398753894, 0.04761678015332603], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21001, 642, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 395, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection timed out: connect", 237, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 10, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["", 4500, 161, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 100, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection timed out: connect", 61, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Tracker PV-1", 487, 7, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 6, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection timed out: connect", 1, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["ADAGIO adv", 5000, 147, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 84, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection timed out: connect", 62, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 1, null, null, null, null], "isController": false}, {"data": ["Tracker PV", 500, 20, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 11, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 8, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection timed out: connect", 1, null, null, null, null], "isController": false}, {"data": ["CM request", 5000, 143, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 80, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection timed out: connect", 62, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 1, null, null, null, null], "isController": false}, {"data": ["EVENT", 5000, 164, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 114, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to tracker.exaudi.neodatagroup.eu:443 [tracker.exaudi.neodatagroup.eu/172.18.30.14] failed: Connection timed out: connect", 50, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
