/**
 * Created by lizhen on 5/28/2016.
 * Edited by AnoRebel on 2021
 */
import React from "react";
const createReactClass = React.createClass || require("create-react-class");

const Notifier = createReactClass({
  statics: {
    start: (data, url, icon, name) => {
      name =
        name ||
        "notiwin" +
          (n => {
            let rnd = "";
            for (let i = 0; i < n; i++) rnd += Math.floor(Math.random() * 10);
            return rnd;
          })(5);
      if (!("Notification" in window)) {
        console.log(
          "Your browser does not support desktop notifications, please try Chrome or Firefox."
        );
        return false;
      }

      let notifyMsg;
      let now = Date.now();
      if (data.message.length >= 80) {
        notifyMsg = `${data.message.substring(0, 77)}...`;
      } else {
        notifyMsg = data.message;
      }

      if (Notification.permission !== "granted") {
        Notification.requestPermission();
      } else {
        icon =
          icon && icon.match(/^.*\.(jpeg|jpg|gif|png)/gi)
            ? icon
            : "http://ob9oayzh3.bkt.clouddn.com/images.png";
        let title = `(Cofall) ${data.user}`;
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
    },
    focus: (data, url, icon) => {
      if (!("Notification" in window)) {
        console.log(
          "Your browser does not support desktop notifications, please try Chrome or Firefox."
        );
        return false;
      }

      let notifyMsg;
      let now = Date.now();
      if (data.message.length >= 80) {
        notifyMsg = `${data.message.substring(0, 77)}...`;
      } else {
        notifyMsg = data.message;
      }

      if (Notification.permission !== "granted") {
        Notification.requestPermission();
      } else {
        icon =
          icon && icon.match(/^.*\.(jpeg|jpg|gif|png)/gi)
            ? icon
            : "http://ob9oayzh3.bkt.clouddn.com/images.png";
        let title = `(Cofall) ${data.user}`;
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
    },
  },

  shouldComponentUpdate: () => {
    return false;
  },

  getScript: () => {
    let script =
      'document.addEventListener("DOMContentLoaded", () => { if (Notification.permission !== "granted") Notification.requestPermission(); });';
    return script;
  },

  render: function () {
    return React.createElement("script", {
      type: "text/javascript",
      dangerouslySetInnerHTML: {
        __html: this.getScript(),
      },
    });
  },
});

export default Notifier;
