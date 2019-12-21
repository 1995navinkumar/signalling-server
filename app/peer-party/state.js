var server = localStorage.getItem("server") || "navin-5490";
localStorage.clear();

localStorage.setItem("server", server);

chrome.runtime.onStartup.addListener(function () {
    localStorage.setItem("state", "idle");
});
