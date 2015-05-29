Class('Foo',
    {
        'private int m_iEmp' : 3,

        'public double m_dScore' : 4.0,

        'protected String m_strName' : "Hi!?",

        'public int m_iAdd' : 2,

        'public static int m_iNo' : 10,

        'public Foo()'									: function()
        {
            this.m_iAdd = 4;
        },

        'public Foo(number _add)'						: function()
        {
            this.m_iAdd = _add;
        },

        'public Foo(number _add, number _no)'			: function()
        {
            this.m_iAdd = _add;
            this.m_iEmp	= _no;
        },

        'public int getAdd()'							: function()
        {
            return this.m_iAdd;
        },

        'public static int getNo()'						: function()
        {
            return Foo.m_iNo;
        },

        'public void show()'							: function()
        {
            console.log("Hello world!");
            Foo.showOut();
        },

        'private static void showOut()'					: function()
        {
            console.log("Hi!, I'm private Member");
        },

        'public void setEmpNo(int _no)'					: function()
        {
            this.m_iEmp = _no;
        },

        'public int getEmpNo()'							: function()
        {
            return this.m_iEmp;
        }
    });

Class('Bar',
{
    'private Foo myFoo' : null,

    'public void setFoo(Foo foo)'  :function(foo)
    {
        this.myFoo = foo;
    },

    'public Foo getFoo()' : function()
    {
        return this.myFoo;
    },

    'public void privateFoo()' : function()
    {
        this.myFoo.showOut();
    },

    'public void publicFoo()' : function()
    {
        this.myFoo.show();
    }
});

var myFoo = new Foo();
var myBar = new Bar();
myBar.setFoo(myFoo);
myBar.publicFoo();
myBar.privateFoo();
//
///////^(public|protected|private)\sFoo\((?:([a-zA-Z][a-zA-Z0-9]*)\s([_a-zA-Z][a-zA-Z0-9]*),\s)*(?:([a-zA-Z][a-zA-Z0-9]*)\s([_a-zA-Z][a-zA-Z0-9]*))\)/.exec("public Foo(String _strName, int _i4Emp)");
//////
///////^(public|protected|private)\sFoo\(((?:(?:(?:[a-zA-Z][_a-zA-Z0-9]*)(?:\.[a-zA-Z][_a-zA-Z0-9]*)*)\s(?:[_a-zA-Z][_a-zA-Z0-9]*))(?:,\s(?:(?:(?:[a-zA-Z][_a-zA-Z0-9]*)(?:\.[a-zA-Z][_a-zA-Z0-9]*)*)\s(?:[_a-zA-Z][_a-zA-Z0-9]*)))*)?\)$/.exec('public Foo(java.lang.String _strName, java.lang.Integer _iEmp, java.lang.Double _dHello)');
//////
///////^(public|protected|private)\sFoo\(((?:(?:(?:[a-zA-Z][_a-zA-Z0-9]*)(?:\.[a-zA-Z][_a-zA-Z0-9]*)*)\s(?:[_a-zA-Z][_a-zA-Z0-9]*))(?:,\s(?:(?:(?:[a-zA-Z][_a-zA-Z0-9]*)(?:\.[a-zA-Z][_a-zA-Z0-9]*)*)\s(?:[_a-zA-Z][_a-zA-Z0-9]*)))*)?\)$/.exec('public Foo(java.lang.String _strName, java.lang.Integer _iEmp, java.lang.Double _dHello)');
//////
///////^((?:(?:public|protected|private|static|final)\s+)*)([_a-zA-Z][_a-zA-Z0-9]*)\s*\(([_a-zA-Z][_a-zA-Z0-9]*(?:\.[_a-zA-Z][_a-zA-Z0-9]*)*\s*[_a-zA-Z][_a-zA-Z0-9]*\s*(?:,\s*[_a-zA-Z][_a-zA-Z0-9]*(?:\.[_a-zA-Z][_a-zA-Z0-9]*)*\s*[_a-zA-Z][_a-zA-Z0-9]*)*\s*)\)$/.exec("public static protected final getEmp(java.lang.String _strName, java.lang.int _iNo, java.lang.Double _dLimit)");
