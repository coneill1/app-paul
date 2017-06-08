var jsdom = require('jsdom');
const { JSDOM } = jsdom;


var details = `Tuesday, June 6, 2017, 5:30&nbsp;&ndash;&nbsp;8:30pm <br/><br/><img src="https://www.trumba.com/i/DgAH4tu1bpH26lRJZD4pxNX%2A.jpg" title="Papermaking: Fiber + Formation | Allison Milham" alt="Papermaking: Fiber + Formation | Allison Milham" width="100" height="69" /><br/><br/>May 16&#8211;June 13<br /> Tuesdays, 5:30&#8211;8:30<br /> $244, Registration Coming Soon<br /> <br /> This fast-paced, five-week course is a venture into the fundamentals of hand papermaking. Topics include fiber selection and processing, western-style sheet formation, and experimental techniques ranging from pulp painting and stencil printing to sculptural applications using overbeaten fibers. Participants leave with a sample book of handmade sheets and an array of papers to be used for printing, bookmaking, collage, letter-writing or other creative applications. Space is limited to 15 participants.<br /> - - - - -<br /> Allison Milham bio:&#160;<a href="http://www.lib.utah.edu/collections/book-arts/allison-milham-leialoha.php" target="_blank" title="http://www.lib.utah.edu/collections/book-arts/allison-milham-leialoha.php">www.lib.utah.edu&#8230;</a> <br/><br/><b>Campus Locations</b>:&nbsp;<a onmouseout="Trumba.Spuds.popupOnMouseOut(event, this)" objectid="374345" url.objectid="374345" spudname="objectpopup" spudposition="1" target="_blank" spudwidth="325" url.objecttype="24525" href="http://www.map.utah.edu/index.html?code=M%20LIB" onmouseover="Trumba.Spuds.popupOnMouseOver(event, this)">Marriott Library - J. Willard (M LIB)</a> <br/><b>Room Name/Number</b>:&nbsp;Book Arts Studio, Level 4 <br/><b>Cost</b>:&nbsp;244$ <br/><b>Transportation / Parking</b>:&nbsp;Park in the visitor parking lot, west of the library, next to the bookstore., <a href="http://www.lib.utah.edu/info/directions.php" target="_blank" title="http://www.lib.utah.edu/info/directions.php">www.lib.utah.edu&#8230;</a> <br/><b>Contact Name</b>:&nbsp;Allison Milham <br/><b>Contact Phone</b>:&nbsp;8015859191 <br/><b>Contact Email</b>:&nbsp;<a href="mailto:bookartsprogram@utah.edu" target="_blank">bookartsprogram@utah.edu</a> <br/><b>Campus Wide Event</b>:&nbsp;Yes <br/><b>More info</b>:&nbsp;<a href="http://lib.utah.edu/" target="_blank">lib.utah.edu</a> <br/><br/>`;


var doc = new JSDOM("<!DOCTYPE html><html>" + details + "</html>").window.document;
var elements = doc.querySelector("body").childNodes;

var description = '';
for(var i=1; i<elements.length; i++) {
    if(elements[i].nodeName == "#text") {
        description += elements[i].nodeValue;
        description += "\n";
        console.log(elements[i].nodeValue);
    } else if(elements[i].nodeName == "B") {
         break;     
    } else {
        console.log(elements[i].nodeName);
    }
    
}

console.log(description);