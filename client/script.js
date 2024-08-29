let apikey = "45700319-1ce650856152d0b2e029ed6be&q";
let searchForApiRequest = "red"

function fetchData() {
    fetch(`https://pixabay.com/api/?key=${apikey}&q=${searchForApiRequest}&image_type=photo`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('result').innerText = JSON.stringify(data, null, 3);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            document.getElementById('result').innerText = 'Error fetching data';
        });
}

window.onload = fetchData;