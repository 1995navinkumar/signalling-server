localStorage.clear();

chrome.runtime.onStartup.addListener(function () {
    localStorage.setItem("state", "idle");
});
