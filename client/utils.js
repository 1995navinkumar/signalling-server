export const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);

export function messageParser(message) {
    return JSON.parse(message.data);
}

var count = 0;
export function uid(suffix) {
    return `${count}_${suffix}`;
}

export function isExtension() {
    return location.protocol.includes("chrome-extension");
}

export function getBackground() {
    if (isExtension()) {
        return chrome.extension.getBackgroundPage();
    } else {
        return window;
    }
}

export function getPopup() {
    if (isExtension()) {
        return chrome.extension.getViews({ type: "popup" })[0];
    } else {
        return window;
    }
}

export async function getUserProfile() {
    return new Promise((resolve, reject) => {
        if (isExtension()) {
            chrome.identity.getProfileUserInfo(resolve);
        } else {
            localStorage.userProfile
                ? resolve(JSON.parse(localStorage.userProfile))
                : resolve({});
        }
    });
}


