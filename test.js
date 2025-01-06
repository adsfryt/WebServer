let date = new Date();
let y = 0;
for (let i = 0; i < 100000000; i++) {
    y += (i + Math.sqrt(i));
}
console.log(y)
let date1 = new Date();
console.log(date1-date)