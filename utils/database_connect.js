const mongoose = require('mongoose');
const {databaseURL} = require('../config');

console.log("dat-uri",databaseURL);


mongoose.connect(databaseURL).then(() => {
	console.log("Connected Successfully!");
}).catch((err) => {
	console.log("Error! Could not connect " + err);
});