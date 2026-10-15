/* Shared navigation and sub-page scroll reveals. */
(function(){
  "use strict";
  document.documentElement.classList.add("js");
  var nav=document.getElementById("nav");
  if(nav){
    var toggle=nav.querySelector(".nav-toggle");
    var links=nav.querySelector(".navlinks");
    var mobile=window.matchMedia("(max-width:760px)");
    var restoreOnClose=false;
    function close(restore){
      if(!links.classList.contains("open")) return;
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded","false");
      toggle.setAttribute("aria-label","Open menu");
      if(restore) toggle.focus();
    }
    toggle.addEventListener("click",function(){
      var opening=!links.classList.contains("open");
      if(opening){
        links.classList.add("open");
        toggle.setAttribute("aria-expanded","true");
        toggle.setAttribute("aria-label","Close menu");
        links.querySelector("a").focus();
      } else close(true);
    });
    nav.addEventListener("keydown",function(e){
      if(e.key==="Escape"){
        if(links.classList.contains("open")){e.preventDefault();close(true);}
        return;
      }
      if(e.key!=="Tab" || !mobile.matches || !links.classList.contains("open")) return;
      var items=[toggle].concat(Array.from(links.querySelectorAll("a")));
      var first=items[0], last=items[items.length-1];
      if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
    });
    document.addEventListener("pointerdown",function(e){if(!nav.contains(e.target)) close(false);});
    links.addEventListener("click",function(e){if(e.target.closest("a")) close(false);});
    mobile.addEventListener("change",function(){close(false);});
    addEventListener("scroll",function(){nav.classList.toggle("stuck",scrollY>24);},{passive:true});
  }
  if(document.querySelector(".hero")) return;
  if(!("IntersectionObserver" in window)){
    document.querySelectorAll(".rv").forEach(function(el){el.classList.add("in");});
    return;
  }
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}});
  },{threshold:.14,rootMargin:"0px 0px -6% 0px"});
  document.querySelectorAll(".rv").forEach(function(el){io.observe(el);});
})();
