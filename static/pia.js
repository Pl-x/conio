const ul = document.querySelector('.learn')
const learn = 
[
{module: "Node.js",learning_time: "30 days"},
{module: "vue.js",learning_time: "15 days"},
{module: "express.js",learning_time: "10 days"},
{module: "react.js",learning_time: "15 days"},
{module: "nodejs mysql",learning_time: "10 days"}
]
let leggo = ``
learn.forEach(function(destiny)
{
  leggo += `<li style ="color: black">${destiny.module}: ${destiny.learning_time}</li>`
}
)
ul.innerHTML = leggo

function onlogout()
{
    window.location.href = "back"
    window.history.pushState(null, '', window.location.href);
    // window.history.forward();
    alert("you have been logged out")
}
const body = document.querySelector('body')
body.setAttribute('style','background-color: gray')
const logoutbutton = document.getElementById("finish")
logoutbutton.addEventListener("click",(event) =>
{
    event.preventDefault()
    onlogout()
})

const pic = document.querySelector("class.profile-pic")
function changepic(scarve)
{
  const miko = FileSystem.append('pic', () => {
    miko = `./static/logo.png`
  })

}

const profile= document.querySelector('div.profile')

  form.addEventListener('reset',(event) => 
  {
    event.preventDefault()
     changepic()
  })

