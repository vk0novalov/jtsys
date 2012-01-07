#stub

*Why?*
Because it's very trivial for a sparse processing of small templates without unnecessary support of loops, conditions etc.

*small example:*

    // in some *.html

    <script id="people-template" type="text/html">
        <div class="people">
            <h4>#name#</h4>
            <small>#email#</small>
        </div>
    </script>

    var peoples = [
                    {'name' : 'Alice'   , 'email' : 'alice@mail.com'}, 
                    {'name' : 'Bob'     , 'email' : 'bob@mail.com'}
    ];

    var jtsys = new Jtsys(),
        html = jtsys.process('people-template', peoples);

    document.getElementById('people-block').innerHTML = html;