function login(showhide){
  if(showhide == "show"){
    document.getElementById('popupbox').style.visibility="visible";
  }else if(showhide == "hide"){
    document.getElementById('popupbox').style.visibility="hidden";
  }
}

function signup(showhide){
  if(showhide == "show"){
    document.getElementById('popupbox-signup').style.visibility="visible";
  }else if(showhide == "hide"){
    document.getElementById('popupbox-signup').style.visibility="hidden";
  }
}
var trash = document.getElementsByClassName('fa-minus-circle')

Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(){
        const _id = this.getAttribute("_id")
        fetch('/deleteDesign', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            '_id': _id
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});
