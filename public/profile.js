let arImg = document.querySelector('#myImage');
console.log(arImg);
const imgUrl = localStorage.getItem('arImg');
console.log(imgUrl);
arImg.setAttribute('src', imgUrl)
