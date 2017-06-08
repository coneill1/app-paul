var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var http = require("http");
var https = require('https');
var jsdom = require('jsdom');
const { JSDOM } = jsdom;
var Regex = require("regex");
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const reDate = /\w*( )*\w*( )*(Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day, [A-Za-z]* \d+, \d\d\d\d/;
const reTime = /[0-9]+:*[0-9]*(am|pm)*&nbsp;&ndash;&nbsp;[0-9]+:*[0-9]*(am|pm)*/;
const reImgEl = /<img.+?\/>/;

var uofu_all_xml_link = "https://www.trumba.com/calendars/university-of-utah.rss?filterview=Campus+Wide&filter1=_383012_&filterfield1=29306";

parser.reset();
var uData = '';
var uofuEvents = [];


/**
Event attributes:
    title;
    time;
    date;
    imgLink;
    location;
    description;
    fullDeats;
*/
https.get(uofu_all_xml_link, function(result, err) {
    result.on('data', function(uData_) {uData += uData_.toString(); });
    result.on('end', function() {
        parser.parseString(uData, function(err, result) {
            var length = result.rss.channel[0].item.length;
            var item = result.rss.channel[0].item;
            
            for(var i=0; i<30; i++) {
                var event = [];
                
                event.title = item[i].title.toString();
                var details = parseDetails(item[i].description.toString());
                
                event.time = details.time;
                event.location = details.location;
                event.imgLink = details.imgLink;
                event.date = details.date;
                event.description = details.description;
                event.fullDeats = details.fullDeats;

                uofuEvents[i] = event;
            }

            test();
        })
        
    })
})

function test() {
    for(var i = 0; i<30; i++) {
        console.log("Event: "+uofuEvents[i].title);
        if(uofuEvents[i].description.length > 0) {
            console.log("Description: "+uofuEvents[i].description);
        }
        if(uofuEvents[i].date.length > 0) {
            console.log("Date: "+uofuEvents[i].date);
        }

        if(uofuEvents[i].imgLink.length > 0) {
            console.log("Image Link: "+uofuEvents[i].imgLink);
        }
        if(uofuEvents[i].time.length > 0) {
            console.log("Time: "+uofuEvents[i].time);
        }
        
        if(uofuEvents[i].location.length > 0) {
            console.log("Location: "+uofuEvents[i].location);
        }
        if(uofuEvents[i].fullDeats.length > 0) {
            console.log("Full Details: "+uofuEvents[i].fullDeats);
        }
        

        console.log();
    }
}

function parseDetails(details) {
    
    details = details.toString();
    var info = getDetails(details);

    return info;
}

function getDetails(details) {
    
    var deats = [];
    
    //get the time
    var time = getTime(details);
    details = condenseDetails(details, reTime);
    
    //get the date
    var date = getDate(details);
    details = condenseDetails(details, reDate);
    
    //get img url
    var imgLink = getImgLink(details);
    details = condenseDetails(details, reImgEl);
    
    //get description (preview)
    var description = getDescription(details);
    
    //get location
    var location = getLocation(details);
    
    var fullDeats = getFullDeats(details);
    
    var indexToSlice = details.search(/<b>/);
    
    deats.time = time;
    deats.date = date;
    deats.imgLink = imgLink;
    deats.location = location;
    deats.description = description;
    deats.fullDeats = fullDeats;
    
    //testOutput(deats);
    
    return deats;
}

function testOutput(deats) {
    console.log("Image: "+deats.imgLink);
    console.log("Date: "+deats.date);
    console.log("Time: "+deats.time);
    console.log("Location: "+deats.location);
    console.log("Preview: "+deats.description);
    console.log("Full Details: "+deats.fullDeats);
}

function condenseDetails(details, re) {
    if(re instanceof RegExp) {
        details = details.replace(re, "");
    }
    return details;
}

function getFullDeats(details) {
    
    var patt = /<b>.+?<\/b>/g, bElements;
    var target;
    var start = -1, end;
    var fullDeats = '';
    
    while(bElements = patt.exec(details)) {
        target = bElements[0].slice(3,bElements[0].length-4);
        if(target == "Full Description") {
            start = patt.lastIndex;
            end = details.indexOf("<b>", start);
            break;
        }
    }
    
    if(start > -1 && end != undefined) {
        fullDeats = details.slice(start, end);
        
        fullDeats = fullDeats.replace("<br/>", "").replace(":&nbsp;", ""); 
        
        /*************************************************************Need to take out all html codes from description*****************************************************************************/
    }
    return fullDeats;
}

function getDescription(details) {
    var description = '';
    var patt = /<br\/><br\/>.+?<br\/><br\/>/;
    var patt2 = /<br\/><br\/>/;
    
    var temp = patt.exec(details);
    if(temp != null) {
        description = temp[0];
        
        //take out the break elements
        while(temp = patt2.exec(description) !== null) {
            description = description.replace(patt2, "");
        }
    }
    
    /*************************************************************Need to take out all html tags from description*****************************************************************************/
    return description;
}

function getImgLink(details) {
    var imgLink = '';
    var hrefPat = /"http.+?\.\w+"/;
    
    //extract img element from details
    var temp = reImgEl.exec(details);
    if(temp != null) {
        imgLink = temp[0];
    }
    
    //extract href attr from img element
    temp = hrefPat.exec(imgLink);
    if(temp != null) {
        imgLink = temp[0].slice(1,temp[0].length-1);
    }
    
    return imgLink;
}

function getTime(details) {
    var time;
    var t = reTime.exec(details);
    t!=null ? time = t[0] : time = '';
    
    return time.replace("&nbsp;&ndash;&nbsp;", " - ");
}

function getDate(details) {
    var date;
    var d = reDate.exec(details);
    d!=null ? date = d[0] : date = '';
    
    return date;
}

function getLocation(details) {
    var patt2Extract = /(<br( )*\/>)*,( )+<br( )*\/>/;
    var location = '';
    
    var index = details.search(patt2Extract);
    if(index > -1) {
        location += details.slice(0, index);
        
        //take out break elements
        var temp = null;
        var brTagPat = /<br( )*\/>/g;
        while(temp = brTagPat.exec(location) !== null) {
            location = location.replace(brTagPat, ", ");
        }
        
    }
    
    if((index = details.search(/Campus Location/)) > -1) {
        details = details.slice(index, details.length);
        var index2 = details.search(/<b>/);
        location += details.slice(0, index2);
        
        //clean up location
        var aTagPatt = /<a.+?</;
        var temp = aTagPatt.exec(location);
        if(temp != null) {
            location = temp[0];
        }
        
        temp = (/>.+?</).exec(location);
        if(temp!= null) {
            location = temp[0].slice(1,temp[0].length-1);
        }
        
    }
    return location;
}



