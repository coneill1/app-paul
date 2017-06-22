var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var http = require("http");
var https = require('https');
var mtech_home_page = "https://www.mtech.edu/events/events-listing.php";

const anchorTag = /<a .+?>.*?<\/a>/; 

var uData = '';

https.get(mtech_home_page, function(result, err) {
    result.on('data', function(uData_) {
        
        uData += uData_.toString();
        
    });
    result.on('end', function() {
        
        var list = getListElement(uData);
        var events = getAnchorInnerHtml(list);
        var deats = getDescription(list);
        var dates = getDate(list);
        
        deleteTags(list);
                
        for(var i = 0; i < list.length; i++) {
            console.log("Event: "+events[i]);
            console.log("Date: "+dates[i]);
            console.log("Description: "+deats[i]);
            console.log();
        }
    })
})

function getListElement(content) {
    var deats = content;
    
    var liTagPat = /<li class="vevent2".*?>.*?\n.*?\n<\/li>/;
    var list = [];
    var count = 0;
    var temp;
    
    while(temp = liTagPat.exec(deats)) {
        list[count] = temp[0];
        
        deats = deats.replace(temp[0], "");
        count++;
    }
    
    return list;
}

function getAnchorInnerHtml(list) {
    var l = list.length;
    var events = [];
    
    for(var i = 0; i < l; i++) {
        var temp = list[i].match(anchorTag);
        if(temp != null) {
            events[i] = temp[0].replace(/<a .*?>/, "");
            events[i] = events[i].replace(/<\/a>/, "").trim();
        }
    }
    
    return events;
}

function getDate(list) {
    var l = list.length;
    var mPat = /month(\d)+/;
    var dPat = />(\d)+</;
    
    var dates = [];
    
    for(var i = 0; i < l; i++) {
        var date = '';
        var temp = list[i].match(mPat);
        if(temp != null) {
            date += temp[0];
        }
        
        temp = list[i].match(dPat);
        if(temp != null) {
            date += " - "+temp[0].slice(1,-1);
            
            list[i] = list[i].slice(temp.index+1, list[i].length);
            list[i] = list[i].replace(temp[0].slice(1,-1), "");
            
        } else {
            console.log("Not found");
        }
        
        dates[i] = date;
    }
    
    return dates;
}

function getDescription(list) {
    var pPat = /<p( )*.*?>.+?<\/p>/;
    var deats = [];
    
    for(var i = 0; i < list.length; i++) {
        var temp = list[i].match(pPat);
        if(temp != null) {
            deats[i] = temp[0].replace(/<p( )*.*?>/, "");
            deats[i] = deats[i].replace(/<\/p>/, "");
        }
    }
    
    return deats;
}

function deleteTags(list) {
    
    var htmlTag = /<.*?>/;
    
    for(var i = 0; i < list.length; i++) {
        var temp;
        
        while(temp = htmlTag.exec(list[i])) {
            if(temp != null) {
                list[i] = list[i].replace(temp[0], "");
                list[i] = list[i].trim();
            }
        }
    }
}




