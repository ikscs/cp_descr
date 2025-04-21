let inp = {from: "age", limit: 10};

let data = JSON.stringify(inp);
console.log('Send\n', inp);

(async () => {
//const json = await fetch('https://cnt.theweb.place/back/f5.php?func=public.js_echo_b', {
const json = await fetch('https://cnt.theweb.place/back/f5.php?func=public.js_select_b', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: data
  })
.then(response => response.json());
//.then(response => response.text());
console.log('Receive\n', json);
})();