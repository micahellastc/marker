let arImg = document.querySelector('#myImage');
console.log(arImg);
const imgUrl = localStorage.getItem('arImg');
console.log(imgUrl);
arImg.setAttribute('src', "data:image/png;base64," + imgUrl)




function resizeImage() {
  var image = document.getElementById('myImage'),
      ranger = document.getElementById('mySlider');
  image.style.width = 200*(mySlider.value / 1)+'px';
  image.setAttribute('scale', {x: mySlider.value, y: mySlider.value, z: mySlider.value})
}
