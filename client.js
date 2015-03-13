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
var actionsVariable = [empty, log, cos, sin];

function checkSolution(f, x, node)
{
    for(var xNum = 0; xNum < x.length; xNum++)
    {
        var res = node.calc( x[xNum] );

        if(Math.abs(res - f[xNum]) > 0.01)
        {
            return false;
        }
    }

    return true;
}

function Node() {
}

Node.prototype.calc = function (x) {

    var num1;
    var num2;

    function init(link)
    {
        if(typeof(link) == "object")
            return link.calc(x);

        if(link == "x")
            return x;

        return link;
    }

    num1 = init(this.left);
    num2 = init(this.right);

    var res = actions[this.idAction](num1, num2);

    if(isNaN(res))
    {
        return 0;
    }

    return res;
};

Node.prototype.getString = function () {

    var num1;
    var num2;

    if(typeof(this.left) == "object")
        num1 = this.left.getString();
    else
        num1 = this.left;

    if(typeof(this.right) == "object")
        num2 = this.right.getString();
    else
        num2 = this.right;

    return actions[this.idAction].name +"("+num1+","+num2+")";
};

function generateTree(size)
{
    var generatedX = false;

    function generateRand(size)
    {
        if(size == 0)
        {
            if(generatedX == false &&
                getRandomInt(0, 10) < 5)
            {
                generatedX = true;
                return 'x';
            }

            return getRandomInt(-20,20);
        }

        var node = new Node();

        node.left =  generateRand(getRandomInt(0,size-1));
        node.right =  generateRand(getRandomInt(0,size-1));
        node.idAction = getRandomInt(0, actions.length-1);

        return node;
    }

    return generateRand(size);
}

function createTree(size)
{
    if(size == 0)
    {
        var values = [];
        for(var value=0;value<6;value++)
            values[values.length] = value;

        values[values.length] = 'x';

        return values;
    }

    var out = [];

    for(var i=0;i<size;i++)
    {
        var mLeft = createTree(i);
        var mRight = createTree(size - 1 - i);

        for(var iLeft = 0;iLeft<mLeft.length;iLeft++)
        {
            for(var iRight = 0;iRight<mRight.length;iRight++)
            {
                for(var iAction=0;iAction<actions.length;iAction++)
                {
                    var node = new Node(null, null);

                    node.left =  mLeft[iLeft];
                    node.right =  mRight[iRight];
                    node.idAction = iAction;

                    out[out.length] = node;
                }
            }
        }
    }

    return out;
}


function findSolution(f, x) {

    for(var size = 1;size < 4;size++)
    {
        var trees = createTree(size);

        for(var i=0;i<trees.length;i++)
        {
            // console.log(i + ": " + trees[i].getString());

            if (checkSolution(f, x, trees[i]))
                return trees[i];
        }
    }

    return null;
}

function randFindSolution(f, x)
{
    while(true)
    {
        var node = generateTree(getRandomInt(2,5));

        if (checkSolution(f, x, node))
            return node;
    }
}

var task;

function startFind()
{
    var node = findSolution(task.f, task.x);

    if(node != null)
    {
        $('#status').html("Sendind solution...");

        $.ajax({
            url: 'http://localhost:8888/finish',
            type: 'POST',
            data: {
                id: JSON.stringify(task.id),
                node: JSON.stringify(node)
            },
            success: function(data)
            {
                $('#status').html("Solution sended: " + node.getString());
				sendRequest();
            }
        });
    }
    else
    {
        $('#status').html("Solution is not founded.");
    }
}

function sendRequest()
{
$('#status').html('Sending request..');

        $.ajax({
            url: 'http://localhost:8888/start',
            type: 'post',
            dataType: 'text',
            success: function (data) {

                if(data == "FAIL")
                {
                    $('#status').html("Cant get solution.");
                    return;
                }

                task = JSON.parse(data);

                $('#status').html("Searching...");
                startFind();

            },
            data: null
        });

}

$( document ).ready(function() {
    $('#start').click(sendRequest);

});