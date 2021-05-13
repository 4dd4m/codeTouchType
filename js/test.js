
app = new Cursor();

let response = $.ajax({
    type : "GET",
    url : "r.html",
    dataType : "html",
    success: function (data){
    console.log(data.response)
}});







