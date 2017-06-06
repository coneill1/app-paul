var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var http = require("http");
var https = require('https');
var jsdom = require('jsdom');
var Enum = require('enum');
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
            
            for(var i=0; i<length; i++) {
                var event = [];
                event.title = item[i].title.toString();
                var details = parseDetails(item[i].description.toString());
                if(details.time != null) {
                    event.time = details.time;
                }
                if(details.location != null) {
                    event.location = details.location;
                }
                if(details.imgLink != null) {
                    event.imgLink = details.imgLink;
                }
                event.date = details.date;
                event.address = details.address;
                event.description = details.about;

                event.link = item[i].link.toString();
                event.startDate = item[i].category.toString();

                uofuEvents[i] = event;
            }

            test();
        })
        
    })
})

function test() {
    for(var i = 0; i<20; i++) {
        console.log(uofuEvents[i].title);
        console.log("Start Date: "+uofuEvents[i].startDate);
        console.log(uofuEvents[i].address);

        if(uofuEvents[i].imgLink != null) {
            console.log("Image Link: "+uofuEvents[i].imgLink);
        }
        if(uofuEvents[i].time != null) {
            console.log("Time: "+uofuEvents[i].time);
        }
        if(uofuEvents[i].location != null) {
            console.log("Location: "+uofuEvents[i].location);
        }
        if(uofuEvents[i].description != null) {
            console.log("Description: "+uofuEvents[i].description);
        }

        console.log();
    }
}

function parseDetails(details) {
    
    details = details.toString();
    var length = details.length;
    var info = [];

    info.time = extractTime(details);
    info.date = extractDate(details);
    info.address = extractAddress(details);
    
    var doc = new JSDOM("<!DOCTYPE html><html>" + details + "</html>").window.document;
   
    var allElements = doc.querySelector('body').childNodes;
    for(var i=0; i<allElements.length; i++) {
        if(allElements[i].nodeName == 'BR' || allElements[i].nodeName == 'A') {
            continue;
            }
        if(allElements[i].nodeName == 'B') {
            var label = allElements[i].innerHTML;
            
            //get the location
            if( label.toLowerCase().search("location") > -1) {
                var anchorTag = allElements[i].nextSibling.nextSibling;
                if(anchorTag.innerHTML != null) {
                    info.location = anchorTag.innerHTML.toString();
                } else {
                    info.location = "none";
                }
                //need to find room #
            }

            //get the full description of the event
            if(label.toLowerCase().search("full description") > -1) {
                var descript = allElements[i].nextSibling.nodeValue.replace(":", "");
                
                info.about = descript;
            }
        }
    }
        
    //get the image url
    var imgEl = doc.querySelector("img");
    if(imgEl != null) {
        info.imgLink = imgEl.attributes[0].value.toString();
    }

    return info;
}

function extractTime(details) {
    var patt = /[0-9]+:*[0-9]*(am|pm)*&nbsp;&ndash;&nbsp;[0-9]+:*[0-9]*(am|pm)*/;
    var patt2 = /Ongoing through/;
    
    var temp = patt.exec(details);
    var time;
    if(temp != null) {
        time = temp[0];
        time = time.replace("&nbsp;&ndash;&nbsp;", " - ");
        return time;
    }

    return null;
}

var count = 0;

function extractDate(details) {
    var patt = /(Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day, [A-Za-z]* \d+, \d\d\d\d/;

    var temp = patt.exec(details);
    var date;
    if(temp != null) {
        date = temp[0];
    } else {
        date = "tbd";
    }

    return date;
}

function extractAddress(details) {
    var patt = /(Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day, [A-Za-z]* \d+, \d\d\d\d/;

    var temp = patt.exec(details);
    var address;
    if(temp != null) {
        address = details.substring(0,temp['index']);
        while(address.search("<br />") != -1) {
            address = address.replace(/<br( )*\/>/, "\n");
        }
        address = address.replace(/<br( )*\/>/, "\n");
    } else {
        address = "tbd";
    }

    return address;
}

// function extractInfo(details, info) {
//     var bClosing = '</b>';
//     var bTag = '<b>';
//     for(var l = details.length, i = 0; i < l; i++) {
        
//         //find bClosing tag
//         if(details.slice(i, i+4) == bClosing) {
            
//             //then fine bTag and grab all the text inbetween
//             for(var index = i+4; index < l; index++) {
//                 if(details.slice(index, index+3) == bTag) {
//                     info[info.length] = details.slice(i+4, index);
//                     break;
//                 }
//             }
//         }
//     }
// }



