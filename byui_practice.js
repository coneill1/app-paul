var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var http = require("http");
var https = require('https');
var jsdom = require('jsdom');
const { JSDOM } = jsdom;


//var $ = require('jquery');
//require("jsdom").env("", function(err, window) {
//    if (err) {
//        console.error(err);
//        return;
//    }
// 
//    var $ = require("jquery")(window);
//});

var byui_all_xml_link = "http://calendar.byui.edu/RSSFeeds.aspx?data=tq9cbc8b%2btuQeZGvCTEMSP%2bfv3SYIrjQ3VTAXA335bE0WtJCqYU4mp9MMtuSlz6MRZ4LbMUU%2fO4%3d";

var uofu_all_xml_link = "https://www.trumba.com/calendars/university-of-utah.rss?filterview=Campus+Wide&filter1=_383012_&filterfield1=29306";

//var xhr = new XMLHttpRequest();
//xhr.open("GET", byui_all_xml_link, true);
//xhr.send();
//
//var xml = xhr.responseXML;


var data = '';
var events = [];
//
//http.get(byui_all_xml_link, function(result, err) {
//    result.on('data', function(data_) { data += data_.toString(); });
//    result.on('end', function() {
//        parser.parseString(data, function(err, result) {
//            var length = result.rss.channel[0].item.length;
//            var item = result.rss.channel[0].item;
//            
//            for(var i=0; i < length; i++) {
//                var event = new Object();
//                event.title = item[i].title;
//                event.description = item[i].description;
//                event.category = item[i].category;
//                event.pubDate = item[i].pubDate;
//                event.link = item[i].link;
//                
//                events[i] = event;
//            }
//            
//            console.log(events[0].description);
//            var str = JSON.stringify(events[0].description, null, 4);
//            console.log();
//        })
//    })
//})

parser.reset();
var uData = '';
var uofuEvents = [];

https.get(uofu_all_xml_link, function(result, err) {
    result.on('data', function(uData_) {uData += uData_.toString(); });
    result.on('end', function() {
        parser.parseString(uData, function(err, result) {
            var length = result.rss.channel[0].item.length;
            var item = result.rss.channel[0].item;
            
            console.log("Event: "+item[0].title.toString());
            parseDetails(item[0].description);
            
            console.log("Event: "+item[1].title.toString());
            parseDetails(item[1].description);
            
            console.log("Event: "+item[2].title.toString());
            parseDetails(item[2].description);
            
            console.log("Event: "+item[8].title.toString());
            parseDetails(item[3].description);
            
            console.log("Event: "+item[9].title.toString());
            parseDetails(item[4].description);
        })
        
    })
})

function parseDetails(details) {
    
    details = details.toString();
    var length = details.length;
    var info = [];
    
    extractTime(details);
    //extractInfo(details, info);
    
//    var doc = new JSDOM("<!DOCTYPE html><html>" + details + "</html>").window.document;
//    
//    var allElements = doc.querySelector('body').childNodes;
//    for(var i=0; i<allElements.length; i++) {
//        if(allElements[i].nodeName == 'BR' || allElements[i].nodeName == 'A') {
//            continue;
//           }
//        if(allElements[i].nodeName == 'B') {
//            var label = allElements[i].innerHTML;
//            var info = allElements[i].nextSibling.nodeValue;
//            var href = '';
//            if(allElements[i].nextSibling.nextSibling.nodeName == 'A') {
//                href += allElements[i].nextSibling.nextSibling.getAttribute('href');
//            }
//            console.log(label + info);
//            if(href.length > 0) {
//                console.log("Link: " + href);
//            }
//            continue;
//        }
//        console.log(allElements[i] + ": " + allElements[i].nodeName);
//    }
    
//    var imgEl = doc.querySelector("img");
//    
//    if(imgEl != null) {
//        console.log("Image Link: " + imgEl.attributes[0].value);
//    }
//    
//    
//    var infoNodes = doc.querySelectorAll("b");
//    length = infoNodes.length;
//    
//    for(var i=0; i<length && i<info.length; i++) {
//        console.log(infoNodes[i].innerHTML + ": " + info[i].replace("<br/>", "").replace(":&nbsp;", ""));
//    }
//    console.log("\n");
}

function extractTime(details) {
   // var patt = /[1-9]{1,2}(am|pm)&nbsp;&ndash;&nbsp;[1-9]{1,2}(am|pm)/;
    var patt = /&nbsp;&ndash;&nbsp;/;
    var patt2 = /Ongoing through/;
    
    console.log(details);
    console.log(patt.test(details));
    console.log(patt2.test(details));
}

function extractInfo(details, info) {
    var bClosing = '</b>';
    var bTag = '<b>';
    for(var l = details.length, i = 0; i < l; i++) {
        
        //find bClosing tag
        if(details.slice(i, i+4) == bClosing) {
            
            //then fine bTag and grab all the text inbetween
            for(var index = i+4; index < l; index++) {
                if(details.slice(index, index+3) == bTag) {
                    info[info.length] = details.slice(i+4, index);
                    break;
                }
            }
        }
    }
}



