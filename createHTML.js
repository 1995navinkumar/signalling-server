const fs = require("fs");

// Function to read from an HTML file
function readHTMLFile(filePath, callback) {
  fs.readFile(filePath, "utf8", function (err, html) {
    if (err) {
      callback(err);
    } else {
      callback(null, html);
    }
  });
}

// Function to rewrite the content and write back to the file
function rewriteHTMLFile(filePath, modifiedContent, callback) {
  fs.writeFile(filePath, modifiedContent, function (err) {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

// Path to the HTML file
const filePath = "index.html";

const destPath = "app/peer-party/index.html";

// Read HTML file
readHTMLFile(filePath, function (err, htmlContent) {
  if (err) {
    console.error("Error reading HTML file:", err);
  } else {
    // Modify the content (For example, adding some text)
    let modifiedContent = htmlContent.replace(
      "$baseHref",
      process.env.BASE ? `${process.env.BASE}/` : "/"
    );

    modifiedContent = modifiedContent.replace(
      "$ENV",
      process.env.ENV ?? "development"
    );

    // Rewrite the modified content to the HTML file
    rewriteHTMLFile(destPath, modifiedContent, function (err) {
      if (err) {
        console.error("Error rewriting HTML file:", err);
      } else {
        console.log("HTML file has been successfully modified and rewritten.");
      }
    });
  }
});
