const zlib = require('zlib');
const seed = require('seed-random');
const ascii = "␀ ␁ ␂ ␃ ␄ ␅ ␆ ␇ ␈ ␉ ␊ ␋ ␌ ␍ ␎ ␏ ␐ ␑ ␒ ␓ ␔ ␕ ␖ ␗ ␘ ␙ ␚ ␛ ␜ ␝ ␞ ␟ ␠ ! \" # $ % & ' ( ) * + , - . / 0 1 2 3 4 5 6 7 8 9 : ; < = > ? @ A B C D E F G H I J K L M N O P Q R S T U V W X Y Z [ \ ] ^ _ ` a b c d e f g h i j k l m n o p q r s t u v w x y z { | } ~ ␡";

function compress(input) {
  return new Promise(function(resolve, reject) {
    zlib.gzip(input, (err, buffer) => {
      resolve(buffer);
    });
  });
}

function swapAround(input) {
  let output = input.split();

  let length = output.length;

  for (let i = 0; i < length; i += seed(output.length.toString())()) {
    let s1 = Math.round(seed(output[i])() * 10);
    let s2 = Math.round(seed(output[i + 1])() * 10);
    let s3 = Math.round(seed(output[i + 2])() * 10);
    let s4 = Math.round(seed(output[i + 3])() * 10);

    let sum = s1 + s2 - s3 + s4;

    let pastValue = output[i + sum];
    output[i + sum] = output[i + 4];
    output[i + 4] = pastValue;
  }

  return output.join("");
}

function stripData(input) {
  return input.split("�").join("").split("'").join("").split('"').join("");
}

async function sdhash(input, interations = 2048, padding = 2048) {
  if (input.length < padding) input = input.padStart(padding / 2, ascii);
  if (input.length < padding) input = input.padEnd(padding, ascii);
  input = input.split().sort().join("");
  let output = input;

  for (let i = 0; i < interations; i++) {
    await compress(output).then(async c => {
      output = await c.toString().slice(10);
      output += stripData(seed(output)().toString());
    });
  }

  return new Promise(function(resolve, reject) {
    try {
      compress(output).then(async c => {
        output = c.toString();
        output = swapAround(output);
        resolve(stripData(output));
      });
    } catch (e) {
      reject(e);
    };
  });
};

// input, iterations, padding
sdhash("bruh", 4096, 131072).then(result => {
  console.log(result);
});
