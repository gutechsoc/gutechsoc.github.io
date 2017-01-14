$(function(){
    function reloadIframeWrapper(id) {
      iframe = document.getElementById(id);
      source = iframe.src;
      return function () {
        console.log("reloading!" + id);
        iframe.src = source + "&rand=" + Math.floor((Math.random()*1000000)+1);
      }
    }

    $("iframe[reload-every]").each(function(){
      console.log("setting up reload for iframe");
      console.log(this);
      setInterval(reloadIframeWrapper(this.id), $(this).attr("reload-every") * 1000);
    });
});
