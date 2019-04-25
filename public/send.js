//chooses the specific img to display as AR object
let send = document.getElementsByClassName("arObject");
Array.from(send).forEach(function(element){
  element.addEventListener('click', function() {
    let src = this.getAttribute('data-source');
    console.log('This is your source ', src)
    // takes in key[think properties] & value
    localStorage.setItem('arImg', src);
    window.location.href = 'http://localhost:8080/camera'
  })
})
