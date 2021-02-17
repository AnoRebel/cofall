/**
 * Created by lizhen on 5/28/2016.
 */
const React = require("react");
const createReactClass = React.createClass || require("create-react-class");

const Notifier = createReactClass({
  statics: {
    start: function (data, url, icon, name) {
      name =
        name ||
        "notiwin" +
          (function (n) {
            var rnd = "";
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
      if (data.message.length >= 80) {
        notifyMsg = `${data.message.substring(0, 77)}...`;
      } else {
        notifyMsg = data.message;
      }

      const now = Date.now();

      if (Notification.permission !== "granted") {
        Notification.requestPermission();
      } else {
        icon =
          icon && icon.match(/^.*\.(jpeg|jpg|gif|png)/gi)
            ? icon
            : "http://ob9oayzh3.bkt.clouddn.com/images.png";
        const notification = new Notification(title, {
          icon: icon,
          body: context,
          tag: `${data.user}-${now}`,
          badge: "/favicon.png",
          vibrate: window.navigator.vibrate([200, 100]),
          renotify: true,
          lang: "en",
          dir: "ltr",
          sound: "/sound.mp3",
        });
        notification.onclick = function () {
          window.open(url, name);
        };
      }
    },
    focus: function (title, context, url, icon) {
      if (!("Notification" in window)) {
        console.log(
          "Your browser does not support desktop notifications, please try Chrome or Firefox."
        );
        return false;
      }

      if (Notification.permission !== "granted") {
        Notification.requestPermission();
      } else {
        icon =
          icon && icon.match(/^.*\.(jpeg|jpg|gif|png)/gi)
            ? icon
            : "http://ob9oayzh3.bkt.clouddn.com/images.png";
        const notification = new Notification(title, {
          icon: icon,
          body: context,
          //   tag: `${data.user}-${now}`,
          badge: "/favicon.png",
          vibrate: window.navigator.vibrate([200, 100]),
          renotify: true,
          lang: "en",
          dir: "ltr",
          sound: "/sound.mp3",
        });
        notification.onclick = function () {
          parent.focus();
          window.focus(); //just in case, older browsers
          this.close();
        };
      }
    },
  },

  shouldComponentUpdate: function () {
    return false;
  },

  getScript: function () {
    var script =
      'document.addEventListener("DOMContentLoaded", function () { if (Notification.permission !== "granted") Notification.requestPermission(); });';
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

module.exports = Notifier;
