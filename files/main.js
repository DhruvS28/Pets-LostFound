
// https://reactjs.org/docs/react-without-jsx.html

'use strict';

// const e = React.createElement;

class writeToPage extends React.Component {
    render() {
        return React.createElement('p', null, `${this.props.data}`);
    }
}


// const domContainer = document.querySelector('#react');
// ReactDOM.render(e(writeToPage), domContainer);

function isStaff() 
{
    // console.log("work!");
    if (document.getElementById('staffCheck').checked) {
        document.getElementById('isStaff').style.display = 'block';
    }
    else document.getElementById('isStaff').style.display = 'none';
}

var uname;
function writing()
{
    var http = new XMLHttpRequest();

    http.open('GET', '/user', true);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    
    
    http.onreadystatechange = function() 
    { 
        if(http.readyState == 4 && http.status == 200) 
        {   
            var data = (http.responseText).split("\n");
            // console.log("THIS === " + data[0]);

            if (localStorage.getItem("visitor") == null || localStorage.getItem("visitor") == data[0]) {
                localStorage.setItem("visitor", data[0]);
            }
            else
            {
                alert("Already logged in as " + localStorage.getItem("visitor") + "!\nLogging out for safety...");
                localStorage.clear();
                window.location.href = '/';
            }


            // var tag = document.createElement("p");

            // var text = document.createTextNode("Logged in as " + data[0].charAt(0).toUpperCase() + data[0].slice(1) + "!\n"); 
            // tag.appendChild(text);
            // var element = document.getElementById("uname");
            // element.append(tag);
            
            // var tag = document.createElement("p");
            // var text = document.createTextNode("Welcome " + data[1] + "!\n"); 
            // tag.appendChild(text);
            // var element = document.getElementById("fname");
            // element.append(tag);

            ReactDOM.render(
                React.createElement(writeToPage, {data: "Logged in as " + data[0].charAt(0).toUpperCase() + data[0].slice(1) + "!\n"}, null),
                document.getElementById('uname')
            );

            ReactDOM.render(
                React.createElement(writeToPage, {data: "Welcome " + data[1] + "!\n"}, null),
                document.getElementById('fname')
            );

            if (data[2] == "true")
            {
                document.getElementById('staffbtn').style.display = 'block';
            }
        }
    };
    http.send(null);
};


function petPosts()
{
    var http = new XMLHttpRequest();

    http.open('GET', '/lostpets', true);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    
    
    http.onreadystatechange = function() 
    { 
        if(http.readyState == 4 && http.status == 200) 
        {   
            var reports = (http.responseText).split("\n\n");

            for (var i = 0; i < reports.length - 1; i++)
            {
                var tag = document.createElement("p");
                tag.setAttribute("class", "report");
                var text = document.createTextNode(reports[i]); 
                tag.appendChild(text);
                var element = document.getElementById("petposts");
                element.append(tag);
            }
        }
    };
    http.send(null);
}

function foundPets()
{
    var http = new XMLHttpRequest();

    http.open('GET', '/foundpets', true);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    
    
    http.onreadystatechange = function() 
    { 
        if(http.readyState == 4 && http.status == 200) 
        {   
            var reports = (http.responseText).split("\n\n");

            for (var i = 0; i < reports.length - 1; i++)
            {
                var tag = document.createElement("p");
                tag.setAttribute("class", "report");
                var text = document.createTextNode(reports[i]); 
                tag.appendChild(text);
                var element = document.getElementById("petposts");
                element.append(tag);
            }
        }
    };
    http.send(null);
}


function userData()
{
    var http = new XMLHttpRequest();

    http.open('GET', '/userdata', true);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    
    var string = "";
    
    http.onreadystatechange = function() 
    { 
        if(http.readyState == 4 && http.status == 200) 
        {   
            var data = (http.responseText).split("\n\n");

            if (data.length <= 1) {return;}

            document.getElementById('staffActions').style.display = 'block';
            
            var tag = document.createElement("p");
            string = string + "Username: " + data[0].charAt(0).toUpperCase() + data[0].slice(1) + 
                                "\nFull Name: " + data[1] +
                                "\nContact: " + data[2] + 
                                "\nStaff: " + data[3];

            if (data.length <= 5)
            {
                string += "\n     ~ No reports found!" + "\n";
            }
            for (var i = 4; i < data.length - 1; i++)
            {
                string += "\n    Report " + (i-3) + " ~ " + data[i];
            }
            
            // var text = document.createTextNode(string); 
            // tag.appendChild(text);
            // var element = document.getElementById("userdata");
            // element.append(tag);
            // element.style.display = "block";

            var element = document.getElementById("userdata");
            ReactDOM.render(
                React.createElement(writeToPage, {data: string + "\n"}, null),
                element
            );
            element.style.display = "block";

        }
    };
    http.send(null);
};

function allUsers()
{
    var http = new XMLHttpRequest();

    http.open('GET', '/allusers', true);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    
    var string = "";
    
    http.onreadystatechange = function() 
    { 
        if(http.readyState == 4 && http.status == 200) 
        {   
            var data = (http.responseText).split("\n\n");
            
            
            var reports = (http.responseText).split("\n\n");
            for (var i = 0; i < reports.length - 1; i++)
            {
                var string= (reports[i].split("\n")[0].slice(10,)).toString();

                var tag = document.createElement("p");
                tag.setAttribute("class", "report");
                // tag.setAttribute("name", "report");
                var text = document.createTextNode(reports[i]); 
                tag.setAttribute("onclick", 
                    "document.getElementById('searchuser').value='" + string + "'; document.getElementById('info').submit();");
                tag.appendChild(text);
                var element = document.getElementById("allusers");
                element.append(tag);
            }
        }
    };
    http.send(null);
};


function staffActions()
{

    if (document.getElementById('change').checked) {
        document.getElementById('changer').style.display = 'block';
    }
    else {
        document.getElementById('changer').style.display = 'none';
    }

    if (document.getElementById('rdelete').checked) {
        document.getElementById('rdeleter').style.display = 'block';
    }
    else document.getElementById('rdeleter').style.display = 'none';

    document.getElementById('changeSubmit').style.display = 'block';
}