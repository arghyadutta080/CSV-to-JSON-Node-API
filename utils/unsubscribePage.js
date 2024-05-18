const baseHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MathOnGo Unsubscribe Confirmation</title>
  <style>
    body {
      font-family: sans-serif;
      margin: 0;
      padding: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    h1 {
      font-size: 2rem;
      text-align: center;
      color: #333;
    }

    span {
      font-weight: bold;
      color: #0095ff;
    }
  </style>
</head>
<body>
  <h1>User, you have Successfully Unsubscribed <span>MathOnGo</span></h1>
</body>
</html>`;

module.exports = { baseHtml };