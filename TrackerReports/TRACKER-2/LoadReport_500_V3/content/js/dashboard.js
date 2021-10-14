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

    var data = {"OkPercent": 73.74160674317825, "KoPercent": 26.258393256821755};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.014357826563169675, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0022222222222222222, 500, 1500, ""], "isController": false}, {"data": [0.5, 500, 1500, "EVENT-2"], "isController": false}, {"data": [0.029411764705882353, 500, 1500, "Tracker PV-0"], "isController": false}, {"data": [0.0, 500, 1500, "EVENT-1"], "isController": false}, {"data": [0.0, 500, 1500, "Tracker PV-1"], "isController": false}, {"data": [0.0, 500, 1500, "EVENT-0"], "isController": false}, {"data": [0.0, 500, 1500, "-0"], "isController": false}, {"data": [0.0, 500, 1500, "-1"], "isController": false}, {"data": [0.0, 500, 1500, "Tracker PV"], "isController": false}, {"data": [0.0324, 500, 1500, "EVENT"], "isController": false}, {"data": [0.2727272727272727, 500, 1500, "CM request-0"], "isController": false}, {"data": [0.0, 500, 1500, "CM request-1"], "isController": false}, {"data": [0.0159, 500, 1500, "ADAGIO adv"], "isController": false}, {"data": [0.0063, 500, 1500, "CM request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 20999, 5514, 26.258393256821755, 4055.6946997476175, 0, 23933, 3569.0, 6848.800000000003, 7769.0, 19612.950000000008, 125.29535311105278, 166.7486412171979, 58.695365035188786], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["", 4500, 1298, 28.844444444444445, 4386.323111111097, 0, 18730, 5636.5, 7372.9, 8070.0, 9399.899999999998, 28.969459751763917, 39.7549882794394, 18.37112624005382], "isController": false}, {"data": ["EVENT-2", 3, 0, 0.0, 681.6666666666666, 618, 736, 691.0, 736.0, 736.0, 736.0, 1.854140914709518, 4.039637090543881, 0.3892971647095179], "isController": false}, {"data": ["Tracker PV-0", 476, 0, 0.0, 2560.5651260504214, 803, 10269, 2321.0, 3563.6, 3745.699999999999, 4801.330000000007, 29.86385595081247, 31.526199494949495, 19.423171936758894], "isController": false}, {"data": ["EVENT-1", 10, 7, 70.0, 2839.8, 8, 10226, 60.5, 10218.9, 10226.0, 10226.0, 0.8965393580778196, 1.882382441276672, 0.10611383808499193], "isController": false}, {"data": ["Tracker PV-1", 476, 98, 20.58823529411765, 14694.10084033612, 0, 21830, 17416.0, 20822.9, 21171.45, 21583.74, 17.393846378718116, 26.983328994007163, 10.130256865270773], "isController": false}, {"data": ["EVENT-0", 10, 0, 0.0, 3160.4, 1665, 6069, 1788.0, 6055.9, 6069.0, 6069.0, 1.5271838729383018, 1.0946806276725718, 0.475753569792303], "isController": false}, {"data": ["-0", 1, 0, 0.0, 5771.0, 5771, 5771, 5771.0, 5771.0, 5771.0, 5771.0, 0.17328019407381737, 0.18292567362675446, 0.11269981372379137], "isController": false}, {"data": ["-1", 1, 0, 0.0, 12959.0, 12959, 12959, 12959.0, 12959.0, 12959.0, 12959.0, 0.07716644802839726, 0.09969844798981403, 0.0565937524114515], "isController": false}, {"data": ["Tracker PV", 500, 122, 24.4, 16466.424000000006, 135, 23933, 19873.5, 22720.4, 23292.8, 23673.98, 17.036355582813723, 44.1234289285836, 19.994226272615762], "isController": false}, {"data": ["EVENT", 5000, 1403, 28.06, 1871.683000000003, 0, 12658, 2334.0, 3181.9000000000005, 3588.95, 5566.879999999997, 31.749861888100785, 33.098300846610066, 14.038554899083065], "isController": false}, {"data": ["CM request-0", 11, 0, 0.0, 1929.727272727273, 937, 4847, 1038.0, 4567.4000000000015, 4847.0, 4847.0, 1.6301126259632484, 1.0220042049496147, 0.3613628575133373], "isController": false}, {"data": ["CM request-1", 11, 7, 63.63636363636363, 4678.727272727272, 1, 14329, 30.0, 14295.4, 14329.0, 14329.0, 0.6479736098020735, 1.3423707550365223, 0.07179253063147974], "isController": false}, {"data": ["ADAGIO adv", 5000, 1254, 25.08, 3952.840000000007, 0, 14345, 5039.0, 6412.900000000001, 7063.95, 8633.359999999986, 31.772862162969368, 35.050189455619666, 11.55811087696277], "isController": false}, {"data": ["CM request", 5000, 1325, 26.5, 3940.912199999997, 0, 16411, 4714.0, 7034.0, 7325.849999999999, 14382.869999999997, 31.74421779072942, 53.58611204359752, 11.238401704426416], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 4563, 82.75299238302503, 21.729606171722462], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 290, 5.259339862169024, 1.3810181437211295], "isController": false}, {"data": ["Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 661, 11.98766775480595, 3.147768941378161], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 20999, 5514, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 4563, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 661, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 290, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["", 4500, 1298, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1096, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 140, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 62, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["EVENT-1", 10, 7, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 6, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, null, null, null, null, null, null], "isController": false}, {"data": ["Tracker PV-1", 476, 98, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 96, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Tracker PV", 500, 122, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 113, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 5, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 4, null, null, null, null], "isController": false}, {"data": ["EVENT", 5000, 1403, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1156, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 175, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 72, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["CM request-1", 11, 7, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 7, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["ADAGIO adv", 5000, 1254, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1011, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 177, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 66, null, null, null, null], "isController": false}, {"data": ["CM request", 5000, 1325, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: tracker.exaudi.neodatagroup.eu:443 failed to respond", 1078, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 165, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 82, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
