//testing output of scraped data from uofu events
var he = require('he');
const reDate = /\w*( )*\w*( )*(Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day, [A-Za-z]* \d+, \d\d\d\d/;
const reTime = /[0-9]+:*[0-9]*(am|pm)*&nbsp;&ndash;&nbsp;[0-9]+:*[0-9]*(am|pm)*/;
const reImgEl = /<img.+?\/>/;
const brPat = /<br( )*\/>/;


var rawTxt = 'Tuesday, June 13, 2017, 1&nbsp;&ndash;&nbsp;1:30pm <br/><br/><img src="https://www.trumba.com/i/DgCiO5MLRuUQ0EsobKdgRtAC.jpg" title="UIT Talks: How Does IT Governance Work at the University of Utah?" alt="UIT Talks: How Does IT Governance Work at the University of Utah?" width="100" height="91" /><br/><br/>UIT Talks is a new semi-regular town hall program designed to provide information and dialog opportunities for the University of Utah community regarding University Information Technology (UIT) initiatives, projects, and services. Scott Sherman, Office of the CIO, will present. 1:00 p.m. - 1:30 p.m., 102 Tower [<a href="https://www.google.com/maps/place/102+S+200+E,+Salt+Lake+City,+UT+84138/@40.7667947,-111.8882053,17z/data=!3m1!4b1!4m5!3m4!1s0x8752f50c3a82596b:0x1617851e40cef6aa!8m2!3d40.7667757!4d-111.8856856?shorturl=1" target="_blank">map</a>], Zion Conference Room, 5th floor, Room 5150 + <a href="https://meet.umail.utah.edu/u0294452/4QHV5B97" target="_blank">Skype</a> meeting (will be recorded). <br/><br/><b>Alternate Location</b>:&nbsp;102 Tower, 102 S 200 E, Salt Lake City <br/><b>Room Name/Number</b>:&nbsp;Zion Conference Room 5150 <br/><b>Cost</b>:&nbsp;Free <br/><b>Contact Name</b>:&nbsp;UIT Strategic Communications <br/><b>Contact Phone</b>:&nbsp;801-585-3918 <br/><b>Contact Email</b>:&nbsp;<a href="mailto:stratcomm@it.utah.edu" target="_blank">stratcomm@it.utah.edu</a> <br/><b>Campus Wide Event</b>:&nbsp;Yes <br/><b>More info</b>:&nbsp;<a href="http://it.utahedu/uit-talks/uit-talks-events.php" target="_blank" title="http://it.utahedu/uit-talks/uit-talks-events.php">it.utahedu&#8230;</a> <br/><br/>';

getDetails(rawTxt);

function getDetails(details) {
    
    var deats = [];
    
    //get the time
    var time = getTime(details);
    details = condenseDetails(details, reTime);
    
    console.log(details+"\n");
    
    //get the date
    var date = getDate(details);
    details = condenseDetails(details, reDate);
    
    console.log(details+"\n");
    
    //get img url
    var imgLink = getImgLink(details);
    details = condenseDetails(details, reImgEl);
    
    console.log(details+"\n");
    
    //get description (preview)
    var description = getDescription(details);
    
//    //get location
//    var location = getLocation(details);
//    
//    var fullDeats = getFullDeats(details);
//    
//    var indexToSlice = details.search(/<b>/);
//    
//    deats.time = time;
//    deats.date = date;
//    deats.imgLink = imgLink;
//    deats.location = location;
//    deats.description = description;
//    deats.fullDeats = fullDeats;
    
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
    var start, end;
    var fullDeats = '';
    
    while(bElements = patt.exec(details)) {
        target = bElements[0].slice(3, -4);
        if(target == "Full Description") {
            start = patt.lastIndex;
            end = details.indexOf("<b>", start);
            break;
        }
    }
    
    if(start != undefined && end != undefined) {
        fullDeats = details.slice(start, end);

        fullDeats = fullDeats.replace("<br/>", "\n");
        fullDeats = he.decode(fullDeats);


        var link = fullDeats.match(/http.+?"/);
        if(link != null) { 
            link = link[0].slice(0, -1);
            fullDeats = fullDeats.replace(/<a.+?>.*?<\/a>/, link);
        }
        
        /*************************************************************Need to take out all html codes from description*****************************************************************************/
    }
    
    var commaSpacePat = /,( ){4,}/g;
    var csMatch;
    while(csMatch = commaSpacePat.exec(fullDeats)) {
        fullDeats = fullDeats.replace(csMatch[0], "\n");
        //console.log(csMatch);
    }
    
    return fullDeats.replace(/\.,( )+/, ".\n").substring(1);
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
    
    if(description.search(/<b>/) > -1) {
        description = '';
    }

//    var link = description.match(/http.+?"/);
//    if(link != null) { 
//        link = link[0].slice(0, -1);
//        description = description.replace(/<a.+?>.*?<\/a>/, link);
//    }
    var linkPat = /http.+?"/g, lMatch;
    while(lMatch = linkPat.exec(description)) {
        description = description.replace(/<a.+?>.*?<\/a>/, lMatch[0].slice(0, -1));
    }
    
    var commaSpacePat = /,( ){3,}/g;
    var csMatch;
    while(csMatch = commaSpacePat.exec(description)) {
        description = description.replace(csMatch[0], "\n");
        console.log(csMatch);
    }

    var brEls;
    while(brEls = brPat.exec(description)) {
        description = description.replace(brEls[0], "\n");
    }
    
    
    var htmlElsPat = /<.+?>/;
    var match;
    while(match = htmlElsPat.exec(description)) {
        description = description.replace(match[0], "");
    }
    
    console.log(he.decode(description)+"\n");
    
    return he.decode(description);
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
        imgLink = temp[0].slice(1, -1);
    }
    
    return imgLink;
}

function getTime(details) {
    var time;
    var t = reTime.exec(details);
    t!=null ? time = t[0] : time = '';
    
    time = he.decode(time);
    
    return time;
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
            location = temp[0].slice(1, -1);
        }
        
    }
    return location;
}

