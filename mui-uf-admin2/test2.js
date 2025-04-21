let params = {from: "age", limit: 10};

let body = JSON.stringify(params);
console.log('Send\n', params);

//const json = await fetch('https://cnt.theweb.place/back/f5.php?func=public.js_echo_b', {

const response = await fetch('https://cnt.theweb.place/back/f5.php?func=public.js_select_b', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body
})

const receved = await response.json();
console.log('Receive\n', receved);
