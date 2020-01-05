d3.csv('03_data/harry_potter.csv').then(res => {
    console.log('local csv:', res);
});

d3.json('03_data/harry_potter.json').then(res => {
    console.log('local json:', res);
});


// This is interesting, it sets up 2 promises and then awaits the return from both promises before continuing, using the Promise.All() function and .then() callback
const potter = d3.csv('03_data/harry_potter.csv');
const rings = d3.csv('03_data/lord_of_the_rings.csv');

Promise.all([potter, rings]).then(res => {
    console.log('Multiple Requests: ', res);
});