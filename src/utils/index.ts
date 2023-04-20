import FileSaver from "file-saver";
import { fileExts as fileExtensions } from "./options";

const save = (
  data: { code: any; title: string; lang: string },
): void => {
  const fileExtension = (lang: any): string => fileExtensions[lang];

  const fileNameify = (name: string): string => name.split(" ").join("_");

  const blob = new Blob([data.code], { type: "text/plain;charset=utf-8" });
  FileSaver.saveAs(
    blob,
    `${fileNameify(data.title)}.${fileExtension(data.lang)}`,
  );
};

const activateFullscreen = (element) => {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullscreen) {
    element.mozRequestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
};

const deactivateFullscreen = (element) => {
  if (element.exitFullscreen) {
    element.exitFullscreen();
  } else if (element.mozCancelFullscreen) {
    element.mozCancelFullscreen();
  } else if (element.webkitExitFullscreen) {
    element.webkitExitFullscreen();
  }
};

const start = (data, url, icon, name) => {
  name = name ||
    "notiwin" +
      ((n) => {
        let rnd = "";
        for (let i = 0; i < n; i++) rnd += Math.floor(Math.random() * 10);
        return rnd;
      })(5);
  if (!("Notification" in window)) {
    console.log(
      "Your browser does not support desktop notifications, please try Chrome or Firefox.",
    );
    return false;
  }

  let notifyMsg;
  const now = Date.now();
  if (data.message.length >= 80) {
    notifyMsg = `${data.message.substring(0, 77)}...`;
  } else {
    notifyMsg = data.message;
  }

  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  } else {
    icon = icon && icon.match(/^.*\.(jpeg|jpg|gif|png)/gi)
      ? icon
      : "http://ob9oayzh3.bkt.clouddn.com/images.png";
    const title = `(Cofall) ${data.user}`;
    const notification = new Notification(title, {
      icon: icon,
      body: notifyMsg,
      tag: `${data.user}-${now}`,
      badge: "/favicon.png",
      vibrate: window.navigator.vibrate([200, 100]),
      renotify: true,
      lang: "en",
      dir: "ltr",
      sound: "/sound.mp3",
    });
    notification.onclick = () => {
      window.open(url, name);
    };
  }
};
const focus = (data, url, icon) => {
  if (!("Notification" in window)) {
    console.log(
      "Your browser does not support desktop notifications, please try Chrome or Firefox.",
    );
    return false;
  }

  let notifyMsg;
  const now = Date.now();
  if (data.message.length >= 80) {
    notifyMsg = `${data.message.substring(0, 77)}...`;
  } else {
    notifyMsg = data.message;
  }

  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  } else {
    icon = icon && icon.match(/^.*\.(jpeg|jpg|gif|png)/gi)
      ? icon
      : "http://ob9oayzh3.bkt.clouddn.com/images.png";
    const title = `(Cofall) ${data.user}`;
    const notification = new Notification(title, {
      icon: icon,
      body: notifyMsg,
      tag: `${data.user}-${now}`,
      badge: "/favicon.png",
      vibrate: window.navigator.vibrate([200, 100]),
      renotify: true,
      lang: "en",
      dir: "ltr",
      sound: "/sound.mp3",
    });
    notification.onclick = () => {
      parent.focus();
      window.focus(); //just in case, older browsers
      notification.close();
    };
  }
};
const perm = () => {
  if (Notification.permission !== "granted") Notification.requestPermission();
};

export { save };
