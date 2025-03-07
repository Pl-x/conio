

regno = 
{
    no1:'C025',
    no2:'Allan'

}
hashed_password =
{

reg1:'allanmwangi',
reg2:'server594.'
}




const login =
{
    username: `${regno.no1 || regno.no2}`,    
    password: `${hashed_password.reg1 || hashed_password.reg2}`
}
const crashcourse =
{ 
    learning:
[
    {module: "Node.js",learning_time: "30 days"},
    {module: "vue.js",learning_time: "15 days"},
    {module: "express.js",learning_time: "10 days"},
    {module: "react.js",learning_time: "15 days"},
    {module: "nodejs mysql",learning_time: "10 days"}
],
loglearning()
{
    console.log("this are the modules offered in this crash course: ")
    this.learning.forEach(courses => console.log(courses.module,courses.learning_time))
    
}
}




function onloggedin()
{
    
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    if(password === login.password && username === login.username)
    {
        const correct = document.querySelector('button')
        correct.style.color = "blue"
        const neo = document.querySelectorAll('label')
        neo.forEach(mand => 
            {
                mand.style.color = "blue"
            })
          
        window.location.href = "direct"
        alert("Logged in successfully")
        message = `<p>Loggedin successfully</p>`
        document.getElementById('logger').innerHTML=message
        window.history.pushState(null, '', window.location.href);
        
        
        
    }
    else if(username === login.username && password !== login.password)
    {
        const incorrect = document.querySelector('button')
        incorrect.style.color = "red"
        message = `<p>Log in error</p>`
        document.getElementById('logger').innerHTML=message
        const neo = document.querySelectorAll('label')
        neo.forEach(mand => 
            {
                mand.style.color = "red"
            })
    }
    // fkge lsrr yyai ikdl
    
}

const form = document.getElementById("loginForm");
        form.addEventListener("submit", (event) => 
        {
            event.preventDefault(); 
            onloggedin()
        });


if(onloggedin(true))
{
    const content = 
    `
    <h2>The models included in the page are:</h2>
    <p>As a learning module we recommend using the available learning materials onsite</p>
    <ul class="learn"></ul>    
    `
    document.getElementById("content-container").innerHTML = content
}
setTimeout(() => {
    alert("The session timed out")
}, 3000000);


