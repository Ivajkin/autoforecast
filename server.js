var http = require("http");
var url = require("url");
qs = require('querystring');

var timeValues = [1,2,3,4,5,6,7];
var values = [ [3,5,7,9,11,13,15] , [1,4,9,16,25,36,49] ,
    [ 3, 3.5, 4, 4.5, 5.0, 5.5, 6 ],
    [ 7 , 9, 13, 21, 37, 69, 133]  ];

function Task(f, x) {
    this.f = f;
    this.x = x;
    this.solution = null;
    this.isBusy = false;
}

var tasks = [];

for(var seqNum = 0; seqNum < values.length ; seqNum++)
{
    tasks[tasks.length] = new Task(values[seqNum], timeValues);
}

var ids = 0;

function checkTasks()
{
    for(var i=0;i<tasks.length;i++)
    {
        if(tasks[i].isBusy)
        {
            var deltaTime = new Date() - tasks[i].updateTime;

            if(deltaTime > 10000)
            {
                tasks[i].isBusy = false;
            }
        }

    }
}

http.createServer(function(request, response) {

    var path = url.parse(request.url).pathname;
    var data = "FAIL";

    checkTasks();

    if(path == "/start")
    {
        for(var i=0;i<tasks.length;i++)
        {
            if(tasks[i].solution == null && tasks[i].isBusy == false)
            {
                tasks[i].isBusy = true;
                tasks[i].updateTime = new Date();
                tasks[i].id = ids++;

                var task = {
                    id: tasks[i].id,
                    f: tasks[i].f,
                    x: tasks[i].x
                };

                data = JSON.stringify(task);
                break;
            }
        }
    }

    if(path == "/ping")
    {
        for(var i=0;i<tasks.length;i++)
        {
            if (tasks[i].id == query.id)
            {
                tasks[i].updateTime = new Date();
                data = "OK";
                break;
            }
        }
    }

    if(path == "/finish")
    {

        var body='';

        request.on('data', function (data) {
            body +=data;
        });

        request.on('end',function() {
            var POST = qs.parse(body);

            var id = JSON.parse(POST.id);
            var node = JSON.parse(POST.node);

            for(var i=0;i<tasks.length;i++)
            {
                 if (tasks[i].id == id)
                 {
                     tasks[i].solution = node;
                     console.log(i + ": " + getString(node));
                 }
            }
			
			
			var solutionFounded = true;
            for(var i=0;i<tasks.length;i++)
            {
                if(tasks[i].solution == null)
                {
                    solutionFounded = false;
                    break;
                }
            }

            if(solutionFounded)
            {
                console.log("");
                console.log("Solutions:");
                console.log("");

                var timeStr = "t: ";

                for(var i=0;i<10;i++)
                {
                    timeStr += i + "\t ";
                }

                console.log(timeStr);

                for(var i=0;i<tasks.length;i++)
                {
                    var str = i + ": ";

                    for(var j=0;j<10;j++)
                    {
                        str += calc(j, tasks[i].solution) + "\t ";
                    }

                    console.log(str);
                }

            }
        });
    }
	
	
	
	
	
    response.writeHead(200, {"Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "http://localhost",
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
        'Access-Control-Allow-Headers': 'X-Requested-With,content-type',
        'Access-Control-Allow-Credentials': true});
    response.write(data);
    response.end();
}).listen(8888);


function getRandomInt(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function summ(a, b)
{
    return a + b;
}

function minus(a, b)
{
    return a - b;
}

function pow(a, b)
{
    return Math.pow(a, b);
}

function multiply(a, b)
{
    return a * b;
}

function division(a, b)
{
    if(b == 0)
        return 0;

    return a / b;
}

function empty(x)
{
    return x;
}

function log(x)
{
    return Math.log(x);
}

function cos(x)
{
    return Math.cos(x);
}

function sin(x)
{
    return Math.sin(x);
}

var actions = [summ, minus, pow, multiply, division];

function getString(node)
{
    var num1;
    var num2;

    if(typeof(node.left) == "object")
        num1 = getString(node.left);
    else
        num1 = node.left;

    if(typeof(node.right) == "object")
        num2 = getString(node.right);
    else
        num2 = node.right;

    return actions[node.idAction].name +"("+num1+","+num2+")";
}

function calc(x, node)
{
    var num1;
    var num2;

    function init(link)
    {
        if(typeof(link) == "object")
            return calc(x, link);

        if(link == "x")
            return x;

        return link;
    }

    num1 = init(node.left);
    num2 = init(node.right);

    var res = actions[node.idAction](num1, num2);

    if(isNaN(res))
    {
        return 0;
    }

    return res;
}
