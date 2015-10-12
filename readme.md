# hast-include [![Build Status](https://img.shields.io/travis/wooorm/hast-include.svg?style=flat)](https://travis-ci.org/wooorm/hast-include) [![Coverage Status](https://img.shields.io/codecov/c/github/wooorm/hast-include.svg)](https://codecov.io/github/wooorm/hast-include)

Include HTML with [**hast**](https://github.com/wooorm/hast).

## Installation

[npm](https://docs.npmjs.com/cli/install):

```bash
npm install hast-include
```

## Usage

Let’s say `index.html` looks as follows:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Hello</title>
  </head>
  <body>
    <x-include src="header.html"/>
    <p>Awesome 👍</p>
  </body>
</html>
```

And, `header.html` contains:

```html
<h1>World!</h1> <!--Ha!-->
```

Then, processing as follows:

```js
var hast = require('hast');
var include = require('hast-include');

hast().use(include).process(doc);
```

Yields:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Hello</title>
  </head>
  <body>
    <h1>World!</h1> <!--Ha!-->
    <p>Awesome 👍</p>
  </body>
</html>
```

## API

### [hast](https://github.com/wooorm/hast#api).[use](https://github.com/wooorm/hast#hastuseplugin-options)(include\[, options\])

Include fragments into an HTML document.

**Parameters**

*   `include`
    — This plug-in;

## License

[MIT](LICENSE) © [Titus Wormer](http://wooorm.com)
