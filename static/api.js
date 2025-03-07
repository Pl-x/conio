document.addEventListener("DOMContentLoaded", function() {
    fetch('/api/data')
    .then(response => response.json())
    .then(data => {
        const dataDiv = document.getElementById('data')
        data.forEach(item => {
            const p = document.createElement('p')
            p.textContent = JSON.stringify(item)
            dataDiv.appendChild(p)
        })
    })
    .catch(error => console.error('error fetching data:',error))
    })

    console.log('Fetching data from:', 'https://unified-caiman-stirred.ngrok-free.app/data');

